# Founder Tribune

Static publication website. Open `index.html` in a browser, or host the folder on any static host (Netlify, Vercel, GitHub Pages, cPanel).

## Pages
Front page, section pages (`section.html?s=funding`), story pages (`article.html?s=slug`), search, about, contact, pitch your story, advertise, privacy, terms, 404.

## Editing content
Everything lives in `assets/js/data.js`:
- `articles`: add a story by copying an existing entry. In `body`, start a line with `## ` for a subheading and `> ` for a pull quote.
- `image: 'assets/img/photo.jpg'` on a story replaces the generated cover with a real photo.
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
