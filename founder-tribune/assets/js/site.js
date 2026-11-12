/* Founder Tribune: shared layout and page rendering */
(function () {
  'use strict';
  const D = window.FT, C = D.config;
  const $ = (s, r) => (r || document).querySelector(s);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  let params = new URLSearchParams(location.search), onScroll = null;
  const qs = k => params.get(k) || '';
  const sec = id => D.sections.find(s => s.id === id) || D.sections[0];
  const author = id => D.authors[id];
  const initials = n => n.split(' ').map(w => w[0]).slice(0, 2).join('');
  const fmt = (d, o) => new Date(d + 'T12:00:00').toLocaleDateString('en-US', o || { month: 'short', day: 'numeric', year: 'numeric' });
  const byDate = D.articles.slice().sort((a, b) => b.date.localeCompare(a.date));
  const url = a => 'article.html?s=' + a.slug;
  const secUrl = id => 'section.html?s=' + id;

  /* ---------- Generated covers ---------- */
  function rng(seed) { let h = 2166136261; for (const c of seed) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return () => { h += 0x6D2B79F5; let t = h; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function mix(hex, to, amt) { const p = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)); const a = p(hex), b = p(to); return '#' + a.map((v, i) => Math.round(v + (b[i] - v) * amt).toString(16).padStart(2, '0')).join(''); }
  function cover(a) {
    if (a.image) return `<span class="cover"><img src="${esc(a.image)}" alt="${esc(a.alt || '')}" loading="lazy" decoding="async" width="1400" height="875"></span>`;
    const r = rng(a.slug), c = sec(a.section).color;
    const bg = mix(c, '#000000', .28), lite = mix(c, '#ffffff', .38), pale = mix(c, '#ffffff', .78), gold = '#ffb627';
    const kind = Math.floor(r() * 5); let g = '';
    if (kind === 0) { // rising bars
      const n = 7 + Math.floor(r() * 4), w = 800 / n; let h = 90 + r() * 60;
      for (let i = 0; i < n; i++) { h = Math.min(430, h + r() * 70 - 12); g += `<rect x="${(i * w + 8).toFixed(1)}" y="${(500 - h).toFixed(1)}" width="${(w - 16).toFixed(1)}" height="${h.toFixed(1)}" fill="${i === n - 2 ? gold : (i % 2 ? lite : c)}"/>`; }
    } else if (kind === 1) { // concentric arcs
      const cx = r() > .5 ? 0 : 800, n = 6;
      for (let i = n; i > 0; i--) g += `<circle cx="${cx}" cy="500" r="${i * 95}" fill="${i === 2 ? gold : (i % 2 ? c : lite)}"/>`;
      g += `<circle cx="${cx ? 170 : 630}" cy="120" r="46" fill="${pale}"/>`;
    } else if (kind === 2) { // dot grid
      const hot = Math.floor(r() * 40);
      for (let y = 0; y < 5; y++) for (let x = 0; x < 8; x++) { const i = y * 8 + x; g += `<circle cx="${50 + x * 100}" cy="${50 + y * 100}" r="${i === hot ? 44 : 14 + r() * 20}" fill="${i === hot ? gold : (r() > .5 ? lite : c)}"/>`; }
    } else if (kind === 3) { // diagonal bands
      const cols = [c, lite, gold, c, pale, lite];
      for (let i = 0; i < 6; i++) { const x = -200 + i * 190; g += `<polygon points="${x},500 ${x + 300},0 ${x + 300 + 110},0 ${x + 110},500" fill="${cols[i]}"/>`; }
    } else { // sun and horizon
      const x = 200 + r() * 400;
      g += `<rect y="330" width="800" height="170" fill="${c}"/><circle cx="${x.toFixed(0)}" cy="330" r="170" fill="${gold}"/><rect y="330" width="800" height="170" fill="${c}"/><rect y="390" width="800" height="18" fill="${lite}"/><rect y="440" width="800" height="10" fill="${pale}"/>`;
    }
    return `<span class="cover"><svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="800" height="500" fill="${bg}"/>${g}</svg></span>`;
  }

  /* ---------- Story components ---------- */
  const kicker = a => `<span class="kicker">${esc(sec(a.section).name)}</span>`;
  const meta = a => `<p class="meta"><b>${esc(author(a.author).name)}</b><span>${fmt(a.date)}</span><span>${a.read} min read</span></p>`;
  const open = (a, cls) => `<a class="story ${cls}" href="${url(a)}" style="--sec:${sec(a.section).color}">`;
  const lead = a => `${open(a, 'story-lead')}${cover(a)}${kicker(a)}<h3>${esc(a.title)}</h3><p class="dek">${esc(a.dek)}</p>${meta(a)}</a>`;
  const card = (a, dek) => `${open(a, 'story-card')}${cover(a)}${kicker(a)}<h3>${esc(a.title)}</h3>${dek === false ? '' : `<p class="dek">${esc(a.dek)}</p>`}${meta(a)}</a>`;
  const row = a => `${open(a, 'story-row')}<span>${kicker(a)}<h3>${esc(a.title)}</h3>${meta(a)}</span>${cover(a)}</a>`;
  const text = a => `${open(a, 'story-text')}${kicker(a)}<h3>${esc(a.title)}</h3>${meta(a)}</a>`;
  const ranked = list => `<ol class="ranked">${list.map(a => `<li><a href="${url(a)}">${esc(a.title)}</a></li>`).join('')}</ol>`;
  const mark = `<svg class="mark" viewBox="0 0 40 40" aria-hidden="true"><rect width="40" height="40" rx="6" fill="#0a6b43"/><path d="M11 9h18v6H18v5h9v6h-9v8h-7z" fill="#fff"/><circle cx="29" cy="30" r="3.5" fill="#ffb627"/></svg>`;

  function wireTable(n) {
    return `<table class="wire"><caption>Funding wire</caption><thead><tr><th>Company</th><th>Round</th><th>Amount</th></tr></thead><tbody>${D.wire.slice(0, n).map(w =>
      `<tr><td><b>${esc(w.co)}</b><span>${esc(w.sector)}, led by ${esc(w.lead)}</span></td><td>${esc(w.round)}<br><span style="color:var(--muted);font-size:13.5px">${fmt(w.date, { month: 'short', day: 'numeric' })}</span></td><td class="amt">${esc(w.amt)}</td></tr>`).join('')}</tbody></table>`;
  }
  function newsletterForm(id) {
    return `<form class="signup" data-form="newsletter" novalidate>
      <label class="sr" for="${id}">Email address</label>
      <input id="${id}" type="email" name="email" placeholder="you@company.com" autocomplete="email" required>
      <button class="btn btn-gold" type="submit">Subscribe free</button></form>
      <p class="form-note">One email every weekday morning. Unsubscribe any time.</p>`;
  }

  /* ---------- Header and footer ---------- */
  function chrome() {
    const cur = qs('s'), page = document.body.dataset.page;
    const header = `<a class="skip" href="#main">Skip to content</a>
    <div class="util"><div class="wrap"><span class="util-date">${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
      <span class="util-links"><a href="pitch.html">Pitch your story</a><a href="advertise.html">Advertise</a><a href="about.html">About</a></span></div></div>
    <header class="mast"><div class="wrap">
      <a class="nameplate" href="index.html" aria-label="${C.name}, home">${mark}<span>${C.name}</span></a>
      <div class="mast-actions">
        <form class="search-form" action="search.html" role="search"><label class="sr" for="q">Search stories</label><input id="q" name="q" type="search" placeholder="Search stories"><button type="submit" aria-label="Search"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg></button></form>
        <a class="btn btn-sm" href="#newsletter">Subscribe</a>
      </div></div></header>
    <nav class="nav" aria-label="Sections"><div class="wrap">
      <a href="index.html"${page === 'home' ? ' aria-current="page"' : ''}>Home</a>
      ${D.sections.map(s => `<a href="${secUrl(s.id)}" style="--c:${s.color}"${page === 'section' && cur === s.id ? ' aria-current="page"' : ''}>${s.name}</a>`).join('')}
      <a href="search.html" style="--c:var(--green)">Search</a>
    </div></nav>`;
    const footer = `${page === 'article' || page === 'home' ? '' : ''}
    <section class="news-band" id="newsletter"><div class="wrap">
      <div><h2>The Morning Tribune, in your inbox by 7</h2><p>The funding rounds, founder stories and one useful idea from the day before. Free.</p></div>
      <div>${newsletterForm('nl-foot')}</div></div></section>
    <footer class="foot"><div class="wrap">
      <div class="foot-grid">
        <div><a class="nameplate" href="index.html">${mark}<span>${C.name}</span></a><p class="foot-about">${C.tagline}. Independent reporting for people who start and run companies.</p></div>
        <div><h4>Sections</h4><ul>${D.sections.map(s => `<li><a href="${secUrl(s.id)}">${s.name}</a></li>`).join('')}</ul></div>
        <div><h4>Company</h4><ul><li><a href="about.html">About us</a></li><li><a href="contact.html">Contact</a></li><li><a href="pitch.html">Pitch your story</a></li><li><a href="advertise.html">Advertise</a></li><li><a href="about.html#standards">Editorial standards</a></li></ul></div>
        <div><h4>Legal</h4><ul><li><a href="privacy.html">Privacy policy</a></li><li><a href="terms.html">Terms of use</a></li><li><a href="privacy.html#cookies">Cookies</a></li><li><a href="about.html#corrections">Corrections</a></li></ul></div>
      </div>
      <div class="foot-bottom"><span>© ${new Date().getFullYear()} ${C.name}. All rights reserved.</span>
        <span class="foot-social">${Object.entries(C.social).map(([k, v]) => `<a href="${v}" rel="noopener">${k}</a>`).join('')}</span></div>
    </div></footer>`;
    document.body.insertAdjacentHTML('afterbegin', header);
    document.body.insertAdjacentHTML('beforeend', footer);
  }

  /* ---------- Pages ---------- */
  const pages = {
    home() {
      const used = new Set(), take = (list, n) => { const out = list.filter(a => !used.has(a.slug)).slice(0, n); out.forEach(a => used.add(a.slug)); return out; };
      const feat = byDate.filter(a => a.featured && !a.interview);
      const [top] = take(feat, 1);
      const interview = byDate.find(a => a.interview); used.add(interview.slug);
      const side = take(byDate.filter(a => a.section !== 'opinion'), 3);
      const mostRead = ['founder-salary-what-to-pay-yourself', 'four-day-week-18-months', 'stop-calling-it-a-pivot', 'kitchen-table-to-40-stores', 'firing-a-co-founder'].map(s => D.articles.find(a => a.slug === s));
      const inSec = (id, n) => { const all = byDate.filter(a => a.section === id), fresh = take(all, n); return fresh.concat(all.filter(a => !fresh.includes(a) && a !== top && a !== interview)).slice(0, n); };
      const head = s => `<div class="block-head"><h2>${s.name}</h2><a class="more" href="${secUrl(s.id)}">All ${s.name.toLowerCase()} stories</a></div>`;
      const block = (id, body) => { const s = sec(id); return `<section class="block" style="--sec:${s.color}"><div class="wrap">${head(s)}${body}</div></section>`; };
      const ticker = D.wire.map(w => `<span class="ticker-item"><b>${esc(w.co)}</b><span class="amt">${esc(w.amt)}</span><span class="rnd">${esc(w.round)}, ${esc(w.sector.toLowerCase())}</span></span>`).join('');

      const st = inSec('startups', 3), fu = inSec('funding', 2), le = inSec('leadership', 3), te = inSec('technology', 3), mo = inSec('money', 2), li = inSec('lifestyle', 2);
      const ia = author(interview.author), subject = 'Rosa Delgado, founder of Kiln & Co';
      $('#main').innerHTML = `
      <div class="ticker"><div class="wrap"><a class="ticker-label" href="${secUrl('funding')}">Funding wire</a>
        <div class="ticker-view" tabindex="0" aria-label="Latest funding rounds"><div class="ticker-track">${ticker}${ticker}</div></div></div></div>
      <section class="top"><div class="wrap"><h1 class="sr">${C.name}: today's top stories</h1><div class="top-grid">
        <div>${lead(top)}</div>
        <div>${side.map(row).join('')}</div>
        <aside class="top-rail"><h2 class="rail-title">Most read this week</h2>${ranked(mostRead)}</aside>
      </div></div></section>
      ${block('startups', `<div class="split"><div>${card(st[0])}</div><div>${st.slice(1).map(row).join('')}</div></div>`)}
      <section class="interview"><div class="wrap">
        <div><p class="interview-label">The Founder Interview</p><blockquote>${esc(interview.quote)}</blockquote>
          <cite><b>${esc(subject)}</b><br>Interview by ${esc(ia.name)}</cite><a class="btn btn-gold" href="${url(interview)}">Read the interview</a></div>
        <a href="${url(interview)}" aria-hidden="true" tabindex="-1">${cover(interview)}</a></div></section>
      ${block('funding', `<div class="split"><div class="grid-2">${fu.map(a => card(a)).join('')}</div><div>${wireTable(5)}</div></div>`)}
      ${block('leadership', `<div class="grid-3">${le.map(a => card(a)).join('')}</div>`)}
      <section class="block" style="--sec:${sec('opinion').color}"><div class="wrap">${head(sec('opinion'))}
        <div class="opinion-list">${byDate.filter(a => a.section === 'opinion').slice(0, 3).map(a => { const au = author(a.author); return `<a class="story op" href="${url(a)}" style="--sec:var(--green)"><span class="avatar">${initials(au.name)}</span><span><span class="who">${esc(au.name)}</span><h3>${esc(a.title)}</h3></span></a>`; }).join('')}</div></div></section>
      ${block('technology', `<div class="split"><div>${card(te[0])}</div><div>${te.slice(1).map(row).join('')}</div></div>`)}
      <section class="block"><div class="wrap"><div class="block-head"><h2 style="--sec:${sec('money').color}">Money and life</h2><a class="more" href="${secUrl('money')}" style="--sec:${sec('money').color}">All money stories</a></div>
        <div class="grid-4">${mo.concat(li).map(a => card(a, false)).join('')}</div></div></section>
      <section class="pitch-band"><div class="wrap"><div><h2>Building something worth writing about?</h2><p>Our reporters read every pitch. Tell us what you have built, what is new and why it matters to other founders.</p></div><a class="btn" href="pitch.html">Pitch your story</a></div></section>`;
    },

    section() {
      const s = D.sections.find(x => x.id === qs('s'));
      if (!s) return pages.missing('We could not find that section.');
      document.title = `${s.name} | ${C.name}`; setMeta(s.blurb);
      const list = byDate.filter(a => a.section === s.id), rest = list.slice(1);
      const others = byDate.filter(a => a.section !== s.id).slice(0, 5);
      $('#main').innerHTML = `<header class="page-head" style="--sec:${s.color}"><div class="wrap"><h1>${s.name}</h1><p>${esc(s.blurb)}</p></div></header>
      <div class="listing" style="--sec:${s.color}"><div class="wrap listing-grid">
        <div>${list.length ? `<div class="listing-lead">${lead(list[0])}</div><div class="grid-3">${rest.map(a => card(a)).join('')}</div>` : `<div class="empty"><h2>No stories here yet</h2><p>Check back soon, or read the latest from the front page.</p></div>`}</div>
        <aside>${s.id === 'funding' ? wireTable(8) + '<div style="height:36px"></div>' : ''}<h2 class="rail-title">Elsewhere in the Tribune</h2>${others.map(text).join('')}</aside>
      </div></div>`;
    },

    article() {
      const a = D.articles.find(x => x.slug === qs('s'));
      if (!a) return pages.missing('We could not find that story. It may have moved.');
      const s = sec(a.section), au = author(a.author);
      document.title = `${a.title} | ${C.name}`; setMeta(a.dek);
      document.body.style.setProperty('--sec', s.color);
      const body = a.body.map(p => p.startsWith('## ') ? `<h2>${esc(p.slice(3))}</h2>` : p.startsWith('> ') ? `<blockquote>${esc(p.slice(2))}</blockquote>` : `<p>${esc(p)}</p>`).join('');
      const related = byDate.filter(x => x.section === a.section && x.slug !== a.slug).concat(byDate.filter(x => x.section !== a.section)).slice(0, 3);
      const here = encodeURIComponent(location.href), t = encodeURIComponent(a.title);
      $('#main').innerHTML = `<div class="progress" id="progress"></div>
      <article>
        <header class="article-head"><div class="wrap">
          <a class="kicker" href="${secUrl(s.id)}">${s.name}</a>
          <h1>${esc(a.title)}</h1><p class="dek">${esc(a.dek)}</p>
          <div class="byline"><div class="byline-who"><span class="avatar">${initials(au.name)}</span><span><b>${esc(au.name)}</b><span>${esc(au.role)}, ${fmt(a.date, { month: 'long', day: 'numeric', year: 'numeric' })}, ${a.read} min read</span></span></div>
            <div class="share"><span>Share</span><a href="https://www.linkedin.com/sharing/share-offsite/?url=${here}" target="_blank" rel="noopener">LinkedIn</a><a href="https://twitter.com/intent/tweet?url=${here}&text=${t}" target="_blank" rel="noopener">X</a><a href="mailto:?subject=${t}&body=${here}">Email</a><button type="button" id="copy">Copy link</button></div></div>
        </div></header>
        <figure class="article-cover"><div class="wrap">${cover(a)}${a.credit ? `<figcaption>${esc(a.alt || '')}. Photo by <a href="${esc(a.credit.url)}" target="_blank" rel="noopener">${esc(a.credit.name)}</a> on <a href="https://unsplash.com/?utm_source=founder_tribune&utm_medium=referral" target="_blank" rel="noopener">Unsplash</a></figcaption>` : ''}</div></figure>
        <div class="article-body">
          <div>${a.takeaways ? `<section class="takeaways"><h2>Key points</h2><ul>${a.takeaways.map(x => `<li>${esc(x)}</li>`).join('')}</ul></section>` : ''}
            <div class="prose">${body}</div>
            <div class="author-box"><span class="avatar">${initials(au.name)}</span><div><b>${esc(au.name)}</b><span>${esc(au.role)}</span><p>${esc(au.bio)}</p></div></div></div>
          <aside class="aside"><div class="aside-card"><h2>Get the Morning Tribune</h2><p>Funding rounds and founder stories, every weekday by 7.</p>${newsletterForm('nl-side')}</div>
            <div><h2 class="rail-title">Most read this week</h2>${ranked(byDate.filter(x => x.slug !== a.slug).slice(2, 6))}</div></aside>
        </div>
      </article>
      <section class="block"><div class="wrap"><div class="block-head"><h2>Keep reading</h2></div><div class="grid-3">${related.map(x => card(x)).join('')}</div></div></section>`;
      const bar = $('#progress'), art = $('.prose');
      removeEventListener('scroll', onScroll); onScroll = () => { const r = art.getBoundingClientRect(); const p = Math.min(1, Math.max(0, (innerHeight * .5 - r.top) / r.height)); bar.style.width = (p * 100) + '%'; };
      addEventListener('scroll', onScroll, { passive: true }); onScroll();
      $('#copy').addEventListener('click', e => { const done = () => { e.target.textContent = 'Link copied'; setTimeout(() => e.target.textContent = 'Copy link', 2000); }; navigator.clipboard ? navigator.clipboard.writeText(location.href).then(done, done) : done(); });
      const ld = { '@context': 'https://schema.org', '@type': 'NewsArticle', headline: a.title, description: a.dek, datePublished: a.date, articleSection: s.name, author: { '@type': 'Person', name: au.name }, publisher: { '@type': 'Organization', name: C.name } };
      const sc = document.createElement('script'); sc.type = 'application/ld+json'; sc.textContent = JSON.stringify(ld); document.head.appendChild(sc);
    },

    search() {
      const q = qs('q').trim(), words = q.toLowerCase().split(/\s+/).filter(Boolean);
      const hay = a => [a.title, a.dek, sec(a.section).name, author(a.author).name, a.body.join(' ')].join(' ').toLowerCase();
      const hits = words.length ? byDate.filter(a => words.every(w => hay(a).includes(w))) : [];
      if (q) document.title = `Search: ${q} | ${C.name}`;
      $('#main').innerHTML = `<header class="page-head plain"><div class="wrap"><h1>Search</h1>
        <form class="search-big" action="search.html" role="search"><label class="sr" for="qb">Search stories</label><input id="qb" name="q" type="search" value="${esc(q)}" placeholder="Try “seed round” or a founder’s name" autofocus><button class="btn" type="submit">Search</button></form></div></header>
      <div class="listing"><div class="wrap">${!q ? `<h2 class="rail-title">Latest stories</h2><div class="grid-4">${byDate.slice(0, 8).map(a => card(a, false)).join('')}</div>`
        : hits.length ? `<h2 class="rail-title">${hits.length} ${hits.length === 1 ? 'story' : 'stories'} for “${esc(q)}”</h2><div class="grid-4">${hits.map(a => card(a, false)).join('')}</div>`
        : `<div class="empty"><h2>No stories match “${esc(q)}”</h2><p>Try a shorter search, a company name or a section such as funding or leadership.</p></div>`}</div></div>`;
    },

    about() {
      const t = $('#team'); if (t) t.innerHTML = Object.values(D.authors).map(p => `<div class="person"><span class="avatar">${initials(p.name)}</span><b>${esc(p.name)}</b><span>${esc(p.role)}</span><p>${esc(p.bio)}</p></div>`).join('');
    },

    missing(msg) {
      document.title = `Page not found | ${C.name}`;
      $('#main').innerHTML = `<div class="notfound"><h1>Not found</h1><p>${esc(msg || 'That page does not exist.')}</p><a class="btn" href="index.html">Go to the front page</a> <a class="btn btn-line" href="search.html">Search stories</a></div>`;
    }
  };

  function setMeta(desc) { let m = $('meta[name="description"]'); if (!m) { m = document.createElement('meta'); m.name = 'description'; document.head.appendChild(m); } m.content = desc; }

  /* ---------- Forms ---------- */
  function forms() {
    document.addEventListener('submit', async e => {
      const f = e.target.closest('[data-form]'); if (!f) return;
      e.preventDefault();
      const old = $('.form-err', f); if (old) old.remove();
      const bad = [...f.elements].find(el => el.willValidate && !el.checkValidity());
      if (bad) { f.insertAdjacentHTML('afterbegin', `<p class="form-err" role="alert" style="flex-basis:100%">${bad.type === 'email' ? 'Enter a valid email address, like name@company.com.' : 'Fill in “' + esc((bad.labels && bad.labels[0] ? bad.labels[0].textContent : bad.name).replace(/\s*\(.*\)/, '')) + '” to continue.'}</p>`); bad.focus(); return; }
      const data = Object.fromEntries(new FormData(f)), kind = f.dataset.form;
      const endpoint = kind === 'newsletter' ? C.newsletterEndpoint : C.formEndpoint;
      const ok = msg => { const note = f.nextElementSibling; if (note && note.classList.contains('form-note')) note.remove(); f.outerHTML = `<p class="form-ok" role="status">${msg}</p>`; };
      if (endpoint) {
        try { const r = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ form: kind, ...data }) }); if (!r.ok) throw 0; }
        catch (_) { f.insertAdjacentHTML('afterbegin', `<p class="form-err" role="alert" style="flex-basis:100%">That did not send. Check your connection and try again, or email ${C.email}.</p>`); return; }
        return ok(kind === 'newsletter' ? 'Subscribed. Your first Morning Tribune arrives on the next weekday.' : 'Sent. An editor will reply within five working days.');
      }
      if (kind === 'newsletter') { try { localStorage.setItem('ft-newsletter', data.email); } catch (_) {} return ok('Subscribed. Your first Morning Tribune arrives on the next weekday.'); }
      const to = kind === 'advertise' ? C.adsEmail : C.email;
      const subject = { pitch: 'Story pitch: ' + (data.company || data.name), contact: (data.topic || 'Message') + ' from ' + data.name, advertise: 'Advertising enquiry: ' + (data.company || data.name) }[kind] || 'Message';
      const bodyText = Object.entries(data).map(([k, v]) => k[0].toUpperCase() + k.slice(1) + ': ' + v).join('\n\n');
      location.href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyText)}`;
      ok(`Your email app has opened with your message ready to send. If it did not, write to <a href="mailto:${to}" style="text-decoration:underline">${to}</a>.`);
    });
  }

  /* ---------- Single-file preview mode: every page in one document, routed on the URL hash ---------- */
  function spa(templates) {
    const toHash = href => {
      const m = /^([\w-]+)\.html(?:\?([^#]*))?(?:#(.*))?$/.exec(href); if (!m) return null;
      const q = new URLSearchParams(m[2] || ''), page = m[1] === 'index' ? 'home' : m[1];
      return { page, s: q.get('s') || '', q: q.get('q') || '', anchor: m[3] || '' };
    };
    const hashOf = r => r.page === 'home' ? '#home' : r.page === 'article' ? '#story-' + r.s : r.page === 'section' ? '#section-' + r.s : '#' + r.page;
    const fromHash = () => { const h = location.hash.slice(1);
      if (h.startsWith('story-')) return { page: 'article', s: h.slice(6) };
      if (h.startsWith('section-')) return { page: 'section', s: h.slice(8) };
      return { page: h && (pages[h] || templates[h]) ? h : (h ? null : 'home') }; };
    let pending = null;
    function show(r) {
      params = new URLSearchParams({ s: r.s || '', q: r.q || '' });
      document.body.dataset.page = r.page; document.body.style.removeProperty('--sec');
      document.title = C.name; $('#main').innerHTML = templates[r.page] || '';
      (pages[r.page] || (templates[r.page] ? () => {} : pages.missing))();
      const h1 = $('#main h1'); if (h1 && r.page !== 'home' && r.page !== 'article' && r.page !== 'section') document.title = h1.textContent + ' | ' + C.name;
      document.querySelectorAll('.nav a').forEach(a => { const t = toHash(a.getAttribute('href')); const on = t && t.page === r.page && (t.s || '') === (r.page === 'section' ? r.s : ''); on ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current'); });
      const target = r.anchor && document.getElementById(r.anchor);
      target ? target.scrollIntoView() : scrollTo(0, 0);
    }
    function go(r) { pending = r; const h = hashOf(r); if (location.hash === h) { pending = null; show(r); } else location.hash = h; }
    addEventListener('hashchange', () => { const r = pending || fromHash(); pending = null; if (!r.page) { const el = document.getElementById(location.hash.slice(1)); if (el) return el.scrollIntoView(); } show(r.page ? r : { page: 'missing' }); });
    document.addEventListener('click', e => { const a = e.target.closest('a[href]'); if (!a || a.target === '_blank') return; const r = toHash(a.getAttribute('href')); if (r) { e.preventDefault(); go(r); } });
    document.addEventListener('submit', e => { const f = e.target.closest('form[action="search.html"]'); if (!f) return; e.preventDefault(); go({ page: 'search', q: new FormData(f).get('q') || '' }); });
    const first = fromHash(); show(first.page ? first : { page: 'home' });
  }

  chrome(); forms();
  if (window.FT_PAGES) return spa(window.FT_PAGES);
  const p = document.body.dataset.page; if (pages[p]) pages[p]();
})();
