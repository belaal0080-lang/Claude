// AI news desk: researches recent news with Claude's web search, then writes a sourced draft.
import Anthropic from '@anthropic-ai/sdk';

const MODEL = process.env.AI_MODEL || 'claude-opus-5-5';
const BETAS = ['server-side-fallback-2026-07-01'];

const RESEARCH_SYSTEM = `You are a researcher on the news desk of Founder Tribune, a publication for people who start and run companies.
Use web search to find one real, recent news story that fits the requested section, then write research notes for a reporter.

Rules:
- Only use news published in the last 7 days. Prefer the last 48 hours. Check the publication date of each source.
- Pick a story with at least two independent, reputable sources where possible.
- Record only what the sources actually say. Never invent facts, figures, names or quotes.
- Copy a quote only if a source prints it as a direct quote, and note who said it and which source carried it.
- Note anything the sources disagree on or leave unclear.

Write the notes as plain text: the story in one sentence, then a list of facts, each followed by the URL it came from, then the list of source titles and URLs with their publication dates.`;

const WRITE_SYSTEM = `You are a reporter at Founder Tribune. Write a news article from the research notes you are given.

Rules:
- Use only facts in the notes. If the notes do not support a claim, leave it out. Never invent numbers, names or quotes.
- Write in your own words. Do not copy sentences from the sources. Attribute facts to their source in the text ("according to ...", "the company said").
- Plain, direct news style. Short paragraphs. 350 to 600 words. Sentence-case headline with no clickbait.
- body is a list of paragraphs. Start a paragraph with "## " to make it a subheading (use one or two). Start a paragraph with "> " only for a direct quote that appears in the notes.
- takeaways: three short factual bullet points.
- sources: only URLs that appear in the notes.`;

const ARTICLE_SCHEMA = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    dek: { type: 'string', description: 'One or two sentence summary shown under the headline' },
    body: { type: 'array', items: { type: 'string' } },
    takeaways: { type: 'array', items: { type: 'string' } },
    image_search: { type: 'string', description: 'Two to four words an editor could use to find a fitting stock photo' },
    sources: { type: 'array', items: { type: 'object', properties: { title: { type: 'string' }, url: { type: 'string' } }, required: ['title', 'url'], additionalProperties: false } }
  },
  required: ['title', 'dek', 'body', 'takeaways', 'image_search', 'sources'],
  additionalProperties: false
};

const textOf = msg => msg.content.filter(b => b.type === 'text').map(b => b.text).join('');

export async function generateArticle({ section, topic, avoidTitles = [] }) {
  if (!process.env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY is not set. Add it to .env to use AI drafts.');
  const client = new Anthropic();
  const today = new Date().toISOString().slice(0, 10);

  // Step 1: research with web search. Server tools can pause a long turn; resume until it ends.
  const messages = [{
    role: 'user',
    content: `Today is ${today}. Section: ${section.name} (${section.blurb})\n` +
      (topic ? `The editor asked for a story about: ${topic}\n` : '') +
      (avoidTitles.length ? `We already covered these, so pick something different:\n- ${avoidTitles.join('\n- ')}\n` : '') +
      'Find the story and write the research notes.'
  }];
  const seen = new Map();
  let research;
  for (let i = 0; i < 6; i++) {
    research = await client.beta.messages.stream({
      model: MODEL, max_tokens: 16000, betas: BETAS, fallbacks: 'default',
      system: RESEARCH_SYSTEM,
      tools: [{ type: 'web_search_20260209', name: 'web_search', max_uses: 8 }],
      messages
    }).finalMessage();
    for (const b of research.content) {
      if (b.type === 'web_search_tool_result' && Array.isArray(b.content)) for (const r of b.content) if (r.url) seen.set(r.url, r.title || r.url);
    }
    if (research.stop_reason !== 'pause_turn') break;
    messages.push({ role: 'assistant', content: research.content });
  }
  if (research.stop_reason === 'refusal') throw new Error('The model declined this request. Try a different topic.');
  const notes = textOf(research).trim();
  if (!notes) throw new Error('Research returned no notes. Try again or give a more specific topic.');
  if (!seen.size) throw new Error('No web sources were found, so no draft was written.');

  // Step 2: write the article as structured JSON from the notes only.
  const written = await client.beta.messages.create({
    model: MODEL, max_tokens: 16000, betas: BETAS, fallbacks: 'default',
    system: WRITE_SYSTEM,
    output_config: { format: { type: 'json_schema', schema: ARTICLE_SCHEMA } },
    messages: [{ role: 'user', content: `Today is ${today}. Section: ${section.name}.\n\nResearch notes:\n\n${notes}` }]
  });
  if (written.stop_reason === 'refusal') throw new Error('The model declined to write this story.');
  if (written.stop_reason === 'max_tokens') throw new Error('The draft was cut off before it finished. Try again.');
  let a;
  try { a = JSON.parse(textOf(written)); } catch { throw new Error('The model returned a draft that could not be read. Try again.'); }

  // Keep only sources the search really returned, so no link is made up.
  const sources = (a.sources || []).filter(s => seen.has(s.url)).map(s => ({ title: s.title || seen.get(s.url), url: s.url }));
  if (!sources.length) throw new Error('The draft cited no verifiable sources, so it was discarded.');
  const body = (a.body || []).map(p => String(p).trim()).filter(Boolean);
  const words = body.join(' ').split(/\s+/).length;
  return {
    title: String(a.title).trim(), dek: String(a.dek).trim(), body,
    takeaways: (a.takeaways || []).map(t => String(t).trim()).filter(Boolean),
    imageSearch: a.image_search || '', sources, read: Math.max(2, Math.round(words / 220)), notes
  };
}
