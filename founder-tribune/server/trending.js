// Collects recent posts from X with an Apify Actor. These are leads for the news desk, never the source of a story.
import { ApifyClient } from 'apify-client';

const ACTOR = process.env.APIFY_X_ACTOR || 'apidojo/tweet-scraper';
const DEFAULT_ACCOUNTS = 'Reuters,AP,BBCBreaking,business,WSJ,FT,TechCrunch,CNBC,TheEconomist,verge';
let client;

export async function fetchPosts() {
  if (!process.env.APIFY_TOKEN) throw new Error('APIFY_TOKEN is not set. Add it to .env to collect posts from X.');
  client ??= new ApifyClient({ token: process.env.APIFY_TOKEN });
  const list = v => String(v || '').split(',').map(x => x.trim().replace(/^@/, '')).filter(Boolean);
  const handles = list(process.env.X_ACCOUNTS || DEFAULT_ACCOUNTS), terms = list(process.env.X_SEARCH_TERMS);
  const maxItems = Math.max(10, Math.min(1000, parseInt(process.env.X_MAX_POSTS, 10) || 150));
  const input = { twitterHandles: handles, start: new Date(Date.now() - 36 * 3600e3).toISOString().slice(0, 10), maxItems, sort: 'Latest', tweetLanguage: 'en' };
  if (terms.length) input.searchTerms = terms;

  // maxTotalChargeUsd caps what one run can cost, whatever the Actor does.
  const run = await client.actor(ACTOR).call(input, { waitSecs: 600, log: null, maxTotalChargeUsd: Number(process.env.APIFY_MAX_USD_PER_RUN) || 0.5 });
  if (run.status !== 'SUCCEEDED') throw new Error(`The X scraper finished with status ${run.status}.`);
  const { items } = await client.dataset(run.defaultDatasetId).listItems({ limit: maxItems });

  const seen = new Set(), posts = [];
  for (const t of items) {
    const text = String(t.fullText || t.text || '').replace(/\s+/g, ' ').trim();
    if (!t.id || !text || t.isRetweet || t.isReply || seen.has(t.id)) continue;
    seen.add(t.id);
    posts.push({ id: String(t.id), url: t.url || t.twitterUrl || '', author: t.author?.userName || 'unknown', text: text.slice(0, 600),
      likes: t.likeCount || 0, reposts: t.retweetCount || 0, at: t.createdAt || '' });
  }
  if (!posts.length) throw new Error('The X scraper returned no usable posts. Check X_ACCOUNTS and your Apify plan limits.');
  return posts.sort((a, b) => (b.likes + 3 * b.reposts) - (a.likes + 3 * a.reposts));
}
