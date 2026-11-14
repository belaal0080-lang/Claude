// Founder Tribune server: serves the site, a hidden admin panel, the article store and the AI news desk.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATA = path.join(ROOT, 'server', 'data');
const UPLOADS = path.join(DATA, 'uploads');
const STORE = path.join(DATA, 'store.json');
const ADMIN = path.join(DATA, 'admin.json');
try { process.loadEnvFile(path.join(ROOT, '.env')); } catch { /* no .env file */ }
fs.mkdirSync(UPLOADS, { recursive: true });

/* ---------- Site definition (sections, authors) comes from the static data file ---------- */
const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'assets/js/data.js'), 'utf8'), sandbox);
const SITE = JSON.parse(JSON.stringify(sandbox.window.FT));
const SECTION_IDS = SITE.sections.map(s => s.id);

/* ---------- Store: one JSON file, written atomically ---------- */
let store;
if (fs.existsSync(STORE)) store = JSON.parse(fs.readFileSync(STORE, 'utf8'));
else { store = { articles: SITE.articles.map(a => ({ ...a, status: 'published' })), wire: SITE.wire, meta: {} }; save(); console.log('Created the article store from the sample stories.'); }
function save() { const tmp = STORE + '.tmp'; fs.writeFileSync(tmp, JSON.stringify(store, null, 1)); fs.renameSync(tmp, STORE); }

/* ---------- Admin secrets ---------- */
const hash = (pw, salt) => crypto.scryptSync(pw, salt, 64).toString('hex');
let admin = fs.existsSync(ADMIN) ? JSON.parse(fs.readFileSync(ADMIN, 'utf8')) : {};
const announce = [];
if (!process.env.ADMIN_PATH && !admin.path) { admin.path = 'desk-' + crypto.randomBytes(8).toString('hex'); announce.push('new address'); }
if (!process.env.ADMIN_PASSWORD && !admin.hash) {
  const pw = crypto.randomBytes(12).toString('base64url'); admin.salt = crypto.randomBytes(16).toString('hex'); admin.hash = hash(pw, admin.salt);
  announce.push('new password'); admin._show = pw;
}
const shownPassword = admin._show; delete admin._show;
if (announce.length) fs.writeFileSync(ADMIN, JSON.stringify(admin), { mode: 0o600 });
const ADMIN_PATH = (process.env.ADMIN_PATH || admin.path).replace(/[^a-zA-Z0-9_-]/g, '');
if (ADMIN_PATH.length < 8) { console.error('ADMIN_PATH must be at least 8 letters, digits, hyphens or underscores.'); process.exit(1); }
function checkPassword(pw) {
  const eq = (a, b) => a.length === b.length && crypto.timingSafeEqual(a, b);
  if (process.env.ADMIN_PASSWORD) return eq(crypto.createHash('sha256').update(String(pw)).digest(), crypto.createHash('sha256').update(process.env.ADMIN_PASSWORD).digest());
  return eq(Buffer.from(hash(String(pw), admin.salt)), Buffer.from(admin.hash));
}

/* ---------- Sessions and login throttling (in memory) ---------- */
const sessions = new Map(), attempts = new Map();
const SESSION_MS = 12 * 3600e3;
const cookie = req => Object.fromEntries((req.headers.cookie || '').split(';').map(c => c.trim().split('=')).filter(p => p[0]));
const authed = req => { const t = cookie(req).ft_s, exp = t && sessions.get(t); if (exp && exp > Date.now()) return true; if (t) sessions.delete(t); return false; };
const ip = req => (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket.remoteAddress;
// Five wrong tries per address, and 40 in total, per 15 minutes (the total stops attackers who rotate addresses).
function throttled(req) { const now = Date.now(), fresh = k => { const l = (attempts.get(k) || []).filter(t => now - t < 15 * 60e3); attempts.set(k, l); return l; }; return fresh(ip(req)).length >= 5 || fresh('*').length >= 40; }

/* ---------- Helpers ---------- */
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.ico': 'image/x-icon' };
const SEC_HEADERS = { 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'strict-origin-when-cross-origin', 'X-Frame-Options': 'SAMEORIGIN' };
function send(res, code, body, headers = {}) { res.writeHead(code, { ...SEC_HEADERS, ...headers }); res.end(body); }
const json = (res, code, obj, headers) => send(res, code, JSON.stringify(obj), { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...headers });
const notFound = res => { try { send(res, 404, fs.readFileSync(path.join(ROOT, '404.html')), { 'Content-Type': TYPES['.html'] }); } catch { send(res, 404, 'Not found'); } };
function readBody(req, limit = 12e6) {
  return new Promise((resolve, reject) => { let size = 0; const chunks = [];
    req.on('data', c => { size += c.length; if (size > limit) { reject(Object.assign(new Error('That upload is too large.'), { code: 413 })); req.destroy(); } else chunks.push(c); });
    req.on('end', () => { try { resolve(chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {}); } catch { reject(Object.assign(new Error('The request was not valid JSON.'), { code: 400 })); } });
    req.on('error', reject); });
}
function serveFile(res, file, cache) {
  fs.stat(file, (err, st) => { if (err || !st.isFile()) return notFound(res);
    res.writeHead(200, { ...SEC_HEADERS, 'Content-Type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream', 'Content-Length': st.size, 'Cache-Control': cache });
    fs.createReadStream(file).pipe(res); });
}
const slugify = t => String(t).toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 70) || 'story';
function uniqueSlug(title, except) { const base = slugify(title); let s = base, n = 2; while (store.articles.some(a => a.slug === s && a.slug !== except)) s = `${base}-${n++}`; return s; }
const str = (v, max) => String(v ?? '').trim().slice(0, max);
const safeUrl = u => /^https?:\/\//i.test(String(u || '')) ? String(u).slice(0, 500) : '';
const safeImage = p => /^(assets\/img\/|uploads\/)[\w./-]+\.(jpe?g|png|webp)$/i.test(String(p || '')) && !String(p).includes('..') ? String(p) : '';

function cleanArticle(input, existing) {
  const title = str(input.title, 200);
  if (!title) throw Object.assign(new Error('Add a headline before saving.'), { code: 400 });
  if (!SECTION_IDS.includes(input.section)) throw Object.assign(new Error('Choose a section.'), { code: 400 });
  const body = (Array.isArray(input.body) ? input.body : String(input.body || '').split(/\n\s*\n/)).map(p => str(p, 5000)).filter(Boolean);
  const a = {
    slug: existing ? existing.slug : uniqueSlug(title),
    title, dek: str(input.dek, 400), section: input.section,
    author: SITE.authors[input.author] ? input.author : 'desk',
    date: /^\d{4}-\d{2}-\d{2}$/.test(input.date) ? input.date : new Date().toISOString().slice(0, 10),
    read: Math.max(1, Math.min(60, parseInt(input.read, 10) || Math.max(1, Math.round(body.join(' ').split(/\s+/).length / 220)))),
    status: input.status === 'published' ? 'published' : 'draft',
    featured: !!input.featured, body,
    takeaways: (Array.isArray(input.takeaways) ? input.takeaways : String(input.takeaways || '').split('\n')).map(t => str(t, 300)).filter(Boolean),
    image: safeImage(input.image), alt: str(input.alt, 300)
  };
  const cn = str(input.credit?.name, 120); if (cn) a.credit = { name: cn, url: safeUrl(input.credit?.url) };
  const src = (input.sources || []).map(s => ({ title: str(s.title, 200), url: safeUrl(s.url) })).filter(s => s.url); if (src.length) a.sources = src;
  for (const k of ['interview', 'quote', 'ai', 'imageSearch', 'via', 'reviewed']) if (existing?.[k] !== undefined) a[k] = existing[k];
  if (!a.takeaways.length) delete a.takeaways; if (!a.image) { delete a.image; delete a.alt; delete a.credit; }
  a.updated = new Date().toISOString();
  return a;
}
const publicArticle = ({ status, updated, imageSearch, notes, via, ...a }) => a;

/* ---------- AI news desk ---------- */
let generating = false;
async function aiDraft({ section, topic, publish, seed, minSources, via }) {
  if (generating) throw Object.assign(new Error('A draft is already being written. Wait for it to finish.'), { code: 409 });
  generating = true;
  try {
    const { generateArticle } = await import('./ai.js');
    const sec = SITE.sections.find(s => s.id === section) || SITE.sections[0];
    const avoidTitles = store.articles.slice().sort((a, b) => b.date.localeCompare(a.date)).slice(0, 25).map(a => a.title);
    let g; try { g = await generateArticle({ section: sec, topic: str(topic, 300), seed, minSources, avoidTitles }); } catch (e) { console.error('[ai]', e.message); throw Object.assign(new Error(e.message), { code: 502 }); }
    const a = cleanArticle({ ...g, section: sec.id, author: 'desk', status: publish ? 'published' : 'draft' });
    a.ai = true; a.reviewed = false; a.imageSearch = g.imageSearch; if (via) a.via = via;
    store.articles.push(a); save();
    return a;
  } finally { generating = false; }
}
/* Trending run: posts from X (via Apify) are leads; Claude picks stories, confirms each in news sources, then writes. */
let trending = { running: false, last: store.meta.lastTrending || null };
async function trendingRun({ count, publish }) {
  if (trending.running) throw Object.assign(new Error('A trending run is already in progress.'), { code: 409 });
  trending.running = true;
  const result = { at: new Date().toISOString(), posts: 0, written: [], skipped: [] };
  try {
    const [{ fetchPosts }, { pickTopics }] = await Promise.all([import('./trending.js'), import('./ai.js')]);
    const posts = await fetchPosts(); result.posts = posts.length;
    const avoidTitles = store.articles.slice().sort((a, b) => b.date.localeCompare(a.date)).slice(0, 40).map(a => a.title);
    const topics = await pickTopics({ posts: posts.slice(0, 120), sections: SITE.sections.filter(x => x.id !== 'opinion'), count, avoidTitles });
    for (const t of topics) {
      const seed = t.posts.slice(0, 8).map(p => `@${p.author}: ${p.text}`).join('\n');
      // A story that is published without review must be confirmed by at least two independent outlets.
      try { const a = await aiDraft({ section: t.section, topic: t.topic, seed, publish, minSources: publish ? 2 : 1, via: 'x' }); result.written.push({ slug: a.slug, title: a.title, status: a.status }); console.log(`[trending] ${a.status}: ${a.title}`); }
      catch (e) { result.skipped.push({ topic: t.topic, reason: e.message }); console.error(`[trending] skipped "${t.topic}": ${e.message}`); }
    }
    return result;
  } catch (e) { result.error = e.message; console.error('[trending]', e.message); throw Object.assign(new Error(e.message), { code: e.code && typeof e.code === 'number' ? e.code : 502 }); }
  finally { trending.running = false; trending.last = result; store.meta.lastTrending = result; save(); }
}

const dailyHour = process.env.AI_DAILY_HOUR === undefined || process.env.AI_DAILY_HOUR === '' ? null : parseInt(process.env.AI_DAILY_HOUR, 10);
const dailyMode = process.env.AI_DAILY_MODE === 'sections' || !process.env.APIFY_TOKEN ? 'sections' : 'trending';
const trendingCount = Math.max(1, Math.min(12, parseInt(process.env.TRENDING_COUNT, 10) || 5));
async function dailyRun() {
  if (dailyHour === null || !process.env.ANTHROPIC_API_KEY) return;
  const now = new Date(), today = now.toLocaleDateString('en-CA');
  if (now.getHours() < dailyHour || store.meta.lastDaily === today) return;
  store.meta.lastDaily = today; save();
  const publish = process.env.AI_AUTO_PUBLISH === 'true';
  if (dailyMode === 'trending') { try { await trendingRun({ count: trendingCount, publish }); } catch { /* logged above */ } return; }
  const sections = (process.env.AI_DAILY_SECTIONS || 'startups,funding,technology').split(',').map(s => s.trim()).filter(s => SECTION_IDS.includes(s));
  for (const section of sections) {
    try { const a = await aiDraft({ section, publish }); console.log(`[daily] ${a.status}: ${a.title}`); }
    catch (e) { console.error(`[daily] ${section} failed: ${e.message}`); }
  }
}
setInterval(dailyRun, 10 * 60e3).unref(); setTimeout(dailyRun, 15e3).unref();

/* ---------- Admin API (lives under the secret path) ---------- */
async function adminApi(req, res, route) {
  const secure = req.headers['x-forwarded-proto'] === 'https' ? '; Secure' : '';
  if (route === 'session' && req.method === 'GET') return json(res, 200, { authed: authed(req) });
  if (req.method !== 'GET' && req.headers['x-requested-with'] !== 'ft-admin') return json(res, 403, { error: 'Request blocked.' });
  if (route === 'login' && req.method === 'POST') {
    if (throttled(req)) return json(res, 429, { error: 'Too many attempts. Wait 15 minutes and try again.' });
    const { password } = await readBody(req, 1e4);
    if (!checkPassword(password || '')) { attempts.get(ip(req)).push(Date.now()); attempts.get('*').push(Date.now()); return json(res, 401, { error: 'That password is not right.' }); }
    const t = crypto.randomBytes(32).toString('hex'); sessions.set(t, Date.now() + SESSION_MS);
    return json(res, 200, { ok: true }, { 'Set-Cookie': `ft_s=${t}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${SESSION_MS / 1000}${secure}` });
  }
  if (!authed(req)) return json(res, 401, { error: 'Sign in again.' });
  if (route === 'logout' && req.method === 'POST') { sessions.delete(cookie(req).ft_s); return json(res, 200, { ok: true }, { 'Set-Cookie': 'ft_s=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0' }); }
  if (route === 'bootstrap' && req.method === 'GET') return json(res, 200, {
    sections: SITE.sections, authors: SITE.authors,
    articles: store.articles.slice().sort((a, b) => (b.updated || b.date).localeCompare(a.updated || a.date)),
    ai: { ready: !!process.env.ANTHROPIC_API_KEY, x: !!process.env.APIFY_TOKEN, mode: dailyMode, count: trendingCount, trending, dailyHour, sections: process.env.AI_DAILY_SECTIONS || 'startups,funding,technology', autoPublish: process.env.AI_AUTO_PUBLISH === 'true', lastDaily: store.meta.lastDaily || null }
  });
  if (route === 'articles' && req.method === 'POST') { const a = cleanArticle(await readBody(req)); store.articles.push(a); save(); return json(res, 200, a); }
  const m = /^articles\/([a-z0-9-]+)$/.exec(route);
  if (m) {
    const i = store.articles.findIndex(a => a.slug === m[1]); if (i < 0) return json(res, 404, { error: 'That story no longer exists.' });
    if (req.method === 'PUT') { const input = await readBody(req); if (store.articles[i].ai) store.articles[i].reviewed = true; store.articles[i] = cleanArticle(input.sources ? input : { ...input, sources: store.articles[i].sources }, store.articles[i]); save(); return json(res, 200, store.articles[i]); }
    if (req.method === 'DELETE') { store.articles.splice(i, 1); save(); return json(res, 200, { ok: true }); }
  }
  if (route === 'upload' && req.method === 'POST') {
    const { data } = await readBody(req); const buf = Buffer.from(String(data || '').replace(/^data:[^,]+,/, ''), 'base64');
    const ext = buf[0] === 0xFF && buf[1] === 0xD8 ? '.jpg' : buf.subarray(0, 8).toString('hex') === '89504e470d0a1a0a' ? '.png' : buf.subarray(0, 4).toString() === 'RIFF' && buf.subarray(8, 12).toString() === 'WEBP' ? '.webp' : null;
    if (!ext) return json(res, 400, { error: 'Upload a JPG, PNG or WebP image.' });
    if (buf.length > 8e6) return json(res, 413, { error: 'That image is larger than 8 MB. Resize it and try again.' });
    const name = crypto.randomBytes(10).toString('hex') + ext; fs.writeFileSync(path.join(UPLOADS, name), buf);
    return json(res, 200, { path: 'uploads/' + name });
  }
  if (route === 'trending' && req.method === 'POST') {
    if (!process.env.APIFY_TOKEN || !process.env.ANTHROPIC_API_KEY) return json(res, 400, { error: 'Set APIFY_TOKEN and ANTHROPIC_API_KEY in .env to use this.' });
    const b = await readBody(req, 1e4);   // started from the newsroom: always saved as drafts for review
    trendingRun({ count: Math.max(1, Math.min(8, parseInt(b.count, 10) || 3)), publish: false }).catch(() => {});
    return json(res, 202, { started: true });
  }
  if (route === 'trending' && req.method === 'GET') return json(res, 200, trending);
  if (route === 'generate' && req.method === 'POST') { const b = await readBody(req, 1e4); return json(res, 200, await aiDraft({ section: b.section, topic: b.topic, publish: false })); }
  return json(res, 404, { error: 'Not found.' });
}

/* ---------- Feeds and share tags ---------- */
const xml = t => String(t ?? '').replace(/[<>&'"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c]));
const origin = req => process.env.SITE_URL?.replace(/\/$/, '') || `${req.headers['x-forwarded-proto'] || 'http'}://${req.headers.host}`;
const published = () => store.articles.filter(a => a.status === 'published').sort((a, b) => b.date.localeCompare(a.date));
function rss(req) {
  const o = origin(req);
  return `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel><title>${xml(SITE.config.name)}</title><link>${o}/</link><description>${xml(SITE.config.tagline)}</description><language>en</language>` +
    published().slice(0, 40).map(a => `<item><title>${xml(a.title)}</title><link>${o}/article.html?s=${a.slug}</link><guid isPermaLink="false">${a.slug}</guid><pubDate>${new Date(a.date + 'T12:00:00Z').toUTCString()}</pubDate><category>${xml(SITE.sections.find(x => x.id === a.section)?.name)}</category><description>${xml(a.dek)}</description></item>`).join('') + '</channel></rss>';
}
function sitemap(req) {
  const o = origin(req), pages = ['', 'about.html', 'contact.html', 'pitch.html', 'advertise.html', 'newsletters.html', 'editorial-standards.html', 'corrections.html', 'privacy.html', 'terms.html', 'cookies.html', 'accessibility.html', 'site-index.html'];
  const u = (loc, mod) => `<url><loc>${xml(loc)}</loc>${mod ? `<lastmod>${mod}</lastmod>` : ''}</url>`;
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` + pages.map(p => u(`${o}/${p}`)).join('') + SITE.sections.map(x => u(`${o}/section.html?s=${x.id}`)).join('') +
    Object.keys(SITE.authors).map(k => u(`${o}/author.html?a=${k}`)).join('') + published().map(a => u(`${o}/article.html?s=${a.slug}`, a.date)).join('') + '</urlset>';
}
// Story pages get their real title, summary and photo in the HTML so links preview properly when shared.
function storyHtml(req, slug) {
  let html = fs.readFileSync(path.join(ROOT, 'article.html'), 'utf8');
  const a = store.articles.find(x => x.slug === slug && x.status === 'published'); if (!a) return html;
  const o = origin(req), t = xml(`${a.title} | ${SITE.config.name}`), d = xml(a.dek);
  html = html.replace(/<title>.*?<\/title>/s, () => `<title>${t}</title>`).replace(/<meta name="description" content=".*?">/, () => `<meta name="description" content="${d}">`)
    .replace(/<meta property="og:title" content=".*?">/, () => `<meta property="og:title" content="${xml(a.title)}">`).replace(/<meta property="og:description" content=".*?">/, () => `<meta property="og:description" content="${d}">`)
    .replace('<meta property="og:type" content="website">', () => `<meta property="og:type" content="article">\n<meta property="og:url" content="${o}/article.html?s=${a.slug}">\n<link rel="canonical" href="${o}/article.html?s=${a.slug}">${a.image ? `\n<meta property="og:image" content="${o}/${xml(a.image)}">` : ''}`);
  return html;
}

/* ---------- HTTP ---------- */
const server = http.createServer(async (req, res) => {
  try {
    const u = new URL(req.url, 'http://x'); let p;
    try { p = decodeURIComponent(u.pathname); } catch { return notFound(res); }
    if (p === '/' + ADMIN_PATH || p === '/' + ADMIN_PATH + '/') {
      return send(res, 200, fs.readFileSync(path.join(ROOT, 'server', 'admin.html')), { 'Content-Type': TYPES['.html'], 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow', 'X-Frame-Options': 'DENY', 'Content-Security-Policy': "default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; script-src 'unsafe-inline'; img-src 'self' data: blob:; base-uri 'none'; form-action 'none'" });
    }
    if (p.startsWith('/' + ADMIN_PATH + '/api/')) return await adminApi(req, res, p.slice(ADMIN_PATH.length + 6));
    if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, 'Method not allowed');
    if (p === '/api/content') return json(res, 200, { articles: store.articles.filter(a => a.status === 'published').map(publicArticle), wire: store.wire, authors: SITE.authors }, { 'Cache-Control': 'public, max-age=30' });
    if (p === '/robots.txt') return send(res, 200, `User-agent: *\nAllow: /\nSitemap: ${origin(req)}/sitemap.xml\n`, { 'Content-Type': 'text/plain' });
    if (p === '/rss.xml') return send(res, 200, rss(req), { 'Content-Type': 'application/rss+xml; charset=utf-8', 'Cache-Control': 'public, max-age=300' });
    if (p === '/sitemap.xml') return send(res, 200, sitemap(req), { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=300' });
    if (p === '/article.html' && u.searchParams.get('s')) return send(res, 200, storyHtml(req, u.searchParams.get('s')), { 'Content-Type': TYPES['.html'], 'Cache-Control': 'no-cache' });
    if (p === '/') p = '/index.html';
    if (p.includes('..') || p.includes('\0') || /(^|\/)\./.test(p)) return notFound(res);
    if (p.startsWith('/uploads/') && /^\/uploads\/[a-f0-9]+\.(jpg|png|webp)$/.test(p)) return serveFile(res, path.join(UPLOADS, p.slice(9)), 'public, max-age=31536000, immutable');
    if (/^\/[\w-]+\.html$/.test(p) && p !== '/preview.html') return serveFile(res, path.join(ROOT, p), 'no-cache');
    if (p.startsWith('/assets/')) return serveFile(res, path.join(ROOT, p), 'public, max-age=300');
    return notFound(res);
  } catch (e) {
    if (!e.code || typeof e.code !== 'number') console.error(e);
    if (!res.headersSent) json(res, typeof e.code === 'number' ? e.code : 500, { error: typeof e.code === 'number' ? e.message : 'Something went wrong on the server. Check the server log.' });
  }
});
const PORT = parseInt(process.env.PORT, 10) || 3000;
server.listen(PORT, () => {
  console.log(`Founder Tribune is running on http://localhost:${PORT}`);
  console.log(`Admin panel: http://localhost:${PORT}/${ADMIN_PATH}`);
  if (shownPassword) console.log(`Admin password (shown once, save it now): ${shownPassword}`);
  console.log(process.env.ANTHROPIC_API_KEY ? `AI drafts: on${dailyHour !== null ? `, daily at ${dailyHour}:00 (${dailyMode === 'trending' ? `${trendingCount} trending stories from X` : 'one per section'}, ${process.env.AI_AUTO_PUBLISH === 'true' ? 'published automatically' : 'saved for review'})` : ', manual only'}` : 'AI drafts: off (set ANTHROPIC_API_KEY to turn on)');
  console.log(process.env.APIFY_TOKEN ? 'X trending: on' : 'X trending: off (set APIFY_TOKEN to turn on)');
});
