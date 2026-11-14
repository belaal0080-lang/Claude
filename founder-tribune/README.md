# Founder Tribune

Publication website with a hidden newsroom (admin panel) and an AI news desk.

## Run it

```
npm install
cp .env.example .env     # then edit .env
npm start
```

On first start the server prints the site address, the secret admin address and, if you did not set one, a generated admin password (shown once).
It needs Node 20.12 or newer and a host that runs Node (Render, Railway, Fly.io, a VPS). Plain static hosts cannot run the admin panel;
without the server the site still works and shows the bundled sample stories.

## Newsroom (admin panel)

- Lives at `https://your-site/<ADMIN_PATH>`. Nothing on the public site links to it, and every other address returns "not found".
- Write, edit, publish, unpublish and delete stories in any section; upload a photo per story (JPG, PNG, WebP, up to 8 MB).
- Stories are kept in `server/data/store.json` and uploads in `server/data/uploads/`. Back up `server/data/`; use a persistent disk on your host.
- Always serve the site over HTTPS so the password and session cookie are encrypted.

## AI news desk (Claude)

- Set `ANTHROPIC_API_KEY` in `.env`. In the newsroom, "Draft with Claude" searches recent news and writes a sourced draft.
- Set `AI_DAILY_HOUR` (0-23) to have one draft written per section in `AI_DAILY_SECTIONS` every day.
- Drafts are saved for review by default. `AI_AUTO_PUBLISH=true` publishes them unreviewed, which is not recommended:
  AI drafts can contain errors, so check each one against its listed sources first.
- AI stories carry the "Tribune News Desk" byline, list their sources and are labelled as AI-assisted.
- Each draft uses the Claude API and web search, which are billed to your Anthropic account.

## Trending stories from X (Apify)

- Set `APIFY_TOKEN` in `.env`. The server runs the `apidojo/tweet-scraper` Actor on Apify to collect the day's posts from the news accounts in `X_ACCOUNTS`.
- Posts are leads only. Claude picks the biggest distinct stories, confirms each one in news sources with web search, then writes it. A story with no verifiable source is skipped.
- "Write from trending" in the newsroom runs this on demand and always saves drafts.
- With `AI_DAILY_HOUR` set and `AI_DAILY_MODE=trending`, it runs once a day and writes `TRENDING_COUNT` stories.
- `AI_AUTO_PUBLISH=true` publishes them without review. In that mode a story is published only if two independent outlets confirm it,
  and it carries a note saying no editor has reviewed it until someone opens and saves it in the newsroom.
- Apify's free plan limits this scraper to 10 posts per run. A paid plan lifts that. `APIFY_MAX_USD_PER_RUN` caps the cost of each run.

## Pages
Front page, 11 section pages (`section.html?s=news`), story pages (`article.html?s=slug`), writer pages (`author.html?a=id`), search,
about, contact, pitch your story, advertise, newsletters, editorial standards, corrections, privacy policy, terms and conditions,
cookie policy, accessibility, site index and 404. The server also provides `/rss.xml`, `/sitemap.xml` and `/robots.txt`.

## Fill these in before launch
`config` in `assets/js/data.js` and the policy pages contain three highlighted placeholders: the company's legal name, its registered
address, and the state or country whose law governs the terms. Search the `.html` files for `class="fill"` to find every one.
Have a lawyer review the privacy policy, terms and cookie policy for the places you operate in.
The cookie banner records the reader's choice in `FT.consent` (`all` or `essential`); load any analytics or ad scripts only when it is `all`.
`config.breaking` controls the red "Just in" bar on the front page (set it to `null` to hide it).
After editing any static page, run the page build again so `preview.html` stays in step (see `assets/js/pages.js`).

## Editing content
Everything lives in `assets/js/data.js`:
- `articles`: add a story by copying an existing entry. In `body`, start a line with `## ` for a subheading and `> ` for a pull quote.
- Each story has `image`, `alt` and `credit` fields. Photos are from Unsplash and listed in `CREDITS.md`. Remove `image` to fall back to a generated cover.
- `wire`: the funding rounds shown in the ticker and table.
- `sections`, `authors`: names, colours and bios.
- `config`: email addresses, social links and form endpoints.

## Forms
With `formEndpoint` empty, contact, pitch and advertise forms open the visitor's email app with the message filled in.
Set `formEndpoint` and `newsletterEndpoint` to a URL that accepts a JSON POST (Formspree, Mailchimp proxy, your own API) to collect them directly.
Until `newsletterEndpoint` is set, newsletter signups show a confirmation but are not stored anywhere.

## Before launch
- All stories, people, companies and funding figures are sample content.
- Privacy and terms pages are starting drafts and need legal review.
- Email addresses assume the domain foundertribune.com.
