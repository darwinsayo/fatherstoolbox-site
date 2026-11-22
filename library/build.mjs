#!/usr/bin/env node
/* Builds The Library: reads the cleaned books in library/books/*.json and writes the reading pages
   into public/library/. The site itself has no build step, so the pages this writes are committed.

     node library/build.mjs            write the pages
     then rebuild the search index with the pagefind command in the README

   Options (for testing): --books <dir> (default library/books), --public <dir> (default public).

   A book file looks like this:
     { slug, order, title, short, author, kind: "prose" | "bible" | "catechism", about, edition,
       groups: [{ title, sections: [sectionSlug, ...] }]        (optional; the Bible's two Testaments)
       sections: [{ slug, title, page (true = the section gets its own page of chapter links),
                    intro, chapters: [{ path, label, title, nav, blocks: [...] }] }] }
   Blocks: { t: "p" | "h" | "bq" | "n", h: html }    paragraph, sub-heading, set-off lines, note
           { t: "v", n, h }                          a Bible verse
           { t: "q", n, q, a }                       a catechism question and answer (a may hold several paragraphs, split by \n\n)
   Text fields hold plain text with only <i>, <b>, <sup> (footnote numbers), <br> and <span class="sc"> allowed. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (name, dflt) => { const i = process.argv.indexOf(name); return i > 0 ? path.resolve(process.argv[i + 1]) : dflt; };
const BOOKS = arg('--books', path.join(root, 'library', 'books'));
const PUBLIC = arg('--public', path.join(root, 'public'));
const OUT = path.join(PUBLIC, 'library');
const VERSION = '2026112204';            // change when library.css or a library script changes

/* ---------- the site's own header and footer, taken from the Resources page so they never drift ---------- */
const shell = fs.readFileSync(path.join(PUBLIC, 'resources.html'), 'utf8');
const cut = (a, b) => { const i = shell.indexOf(a), j = shell.indexOf(b, i); if (i < 0 || j < 0) throw new Error('resources.html: cannot find ' + a); return shell.slice(i, j + b.length); };
const GTM_HEAD = cut('<!-- Google Tag Manager -->', '<!-- End Google Tag Manager -->');
const GTM_BODY = cut('<!-- Google Tag Manager (noscript) -->', '<!-- End Google Tag Manager (noscript) -->');
const STYLES = (shell.match(/<link rel="stylesheet" href="\/styles\.css[^"]*">/) || [])[0];
const TOPBAND = cut('<div class="topband">', '</div></div>');
let HEADER = cut('<header class="site-header">', '</header>').replace(/ aria-current=page/g, '');
HEADER = HEADER.replace('<li><a href="/library/">', '<li><a href="/library/" aria-current=page>');
const FOOTER = cut('<footer>', '</footer>');
const TAIL = shell.slice(shell.indexOf('</footer>') + 9, shell.indexOf('</body>')).trim();
if (!STYLES || !HEADER.includes('/library/')) throw new Error('resources.html must link the stylesheet and list The Library in the Resources menu');

/* ---------- small helpers ---------- */
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
/* Text from a book file: escape everything, then let the few allowed tags back in. */
const rich = s => esc(s).replace(/&lt;(\/?(?:i|b|sup)|br|span class=&quot;sc&quot;|\/span)&gt;/g, (m, t) => '<' + (t === 'sup' ? 'sup data-pagefind-ignore' : t).replace(/&quot;/g, '"') + '>');
const plain = s => String(s).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const clip = (s, n) => { s = plain(s); if (s.length <= n) return s; s = s.slice(0, n); return s.slice(0, s.lastIndexOf(' ')).replace(/[,;:]$/, '') + '…'; };

function page({ url, title, description, body, index = true, scripts = [], pagefind = false }) {
  const t = esc(title) + ' | Father&rsquo;s Tool Box';
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
${GTM_HEAD}
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${t}</title>
<meta name="description" content="${esc(description)}">
<meta name="theme-color" content="#1c1815">
<meta property="og:title" content="${t}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:type" content="website">
<link rel="canonical" href="https://fatherstoolbox.com${url}">${index ? '' : '\n<meta name="robots" content="noindex">'}
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preload" href="/fonts/eb-garamond-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
${STYLES}
<link rel="stylesheet" href="/library/library.css?v=${VERSION}">
<script>try{var p=JSON.parse(localStorage.getItem('ftb.library.prefs')||'{}'),h=document.documentElement;if(p.theme==='night')h.setAttribute('data-lib-theme','night');if(p.size)h.setAttribute('data-lib-size',p.size)}catch(e){}</script>
</head>
<body>
${GTM_BODY}
${TOPBAND}
${HEADER}
${body}
${FOOTER}
${TAIL}
<script src="/library/library.js?v=${VERSION}" defer></script>${scripts.map(s => `\n<script src="${s}?v=${VERSION}" defer></script>`).join('')}
</body>
</html>
`;
}

const written = new Set();
function write(url, html) {
  const file = path.join(OUT, url.replace(/^\/library\//, ''), 'index.html');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
  written.add(file);
}

const TOOLS = (bookUrl) => `<div class="lib-tools" role="group" aria-label="Reading options">
<a href="${bookUrl}">Contents</a><a href="/library/search/">Search</a><a href="/library/highlights/">My highlights</a>
<span class="lib-tools-set"><button type="button" data-lib-size="-1" aria-label="Smaller text">A&minus;</button><button type="button" data-lib-size="1" aria-label="Larger text">A+</button><button type="button" data-lib-night aria-pressed="false">Night</button></span>
</div>`;
const SEARCH_FORM = (label = 'Search all five books') => `<form class="lib-search" action="/library/search/" method="get" role="search">
<label for="lib-q">${label}</label>
<div class="lib-search-row"><input id="lib-q" name="q" type="search" autocomplete="off" placeholder="A word or a phrase" required><button class="btn btn-red" type="submit">Search</button></div>
</form>`;

/* ---------- a chapter's text ---------- */
function renderBlocks(blocks) {
  let i = 0;
  return blocks.map(b => {
    i += 1;
    switch (b.t) {
      case 'p': return `<p id="p${i}"><span data-hl="p${i}">${rich(b.h)}</span></p>`;
      case 'h': return `<h2 id="h${i}">${rich(b.h)}</h2>`;
      case 'bq': return `<blockquote id="p${i}"><span data-hl="p${i}">${rich(b.h)}</span></blockquote>`;
      case 'n': return `<p class="lib-note" id="n${i}"><span data-hl="n${i}">${rich(b.h)}</span></p>`;
      case 'v': return `<p class="lib-v" id="v${esc(b.n)}"><b class="lib-vn" data-pagefind-ignore>${esc(b.n)}</b> <span data-hl="v${esc(b.n)}">${rich(b.h)}</span></p>`;
      case 'q': {
        const paras = String(b.a).split(/\n\n+/);
        return `<div class="lib-qa" id="q${esc(b.n)}"><p class="lib-q"><b class="lib-qn">${esc(b.n)}.</b> <span data-hl="q${esc(b.n)}">${rich(b.q)}</span></p>`
          + paras.map((a, k) => `<p class="lib-a"><span data-hl="a${esc(b.n)}${k ? '-' + k : ''}">${rich(a)}</span></p>`).join('') + '</div>';
      }
      default: throw new Error('Unknown block type ' + b.t);
    }
  }).join('\n');
}

/* ---------- build ---------- */
const books = fs.readdirSync(BOOKS).filter(f => f.endsWith('.json')).map(f => JSON.parse(fs.readFileSync(path.join(BOOKS, f), 'utf8')))
  .sort((a, b) => a.order - b.order);
let chapterCount = 0;

for (const book of books) {
  const bookUrl = `/library/${book.slug}/`;
  const flat = [];
  for (const s of book.sections) for (const c of s.chapters) flat.push({ s, c, url: `${bookUrl}${c.path}/` });
  const seen = new Set();
  for (const f of flat) { if (seen.has(f.url)) throw new Error('Two chapters share ' + f.url); seen.add(f.url); }

  /* chapter pages */
  flat.forEach((f, n) => {
    const { s, c, url } = f, prev = flat[n - 1], next = flat[n + 1];
    const full = c.nav || [c.label, c.title].filter(Boolean).join(': ');
    const sectionUrl = s.page ? `${bookUrl}${s.slug}/` : bookUrl;
    const crumbs = `<a href="/library/">The Library</a><span aria-hidden="true"> &middot; </span><a href="${bookUrl}">${esc(book.short || book.title)}</a>`
      + (s.page ? `<span aria-hidden="true"> &middot; </span><a href="${sectionUrl}">${esc(s.short || s.title)}</a>`
        : (s.title && book.sections.length > 1 ? `<span aria-hidden="true"> &middot; </span>${esc(s.short || s.title)}` : ''));
    const side = book.kind === 'bible'
      ? `<h2><a href="${sectionUrl}">${esc(s.title)}</a></h2><ol class="lib-nums">${s.chapters.map(x => `<li><a href="${bookUrl}${x.path}/"${x === c ? ' aria-current="page"' : ''}>${esc(x.num || x.label)}</a></li>`).join('')}</ol>`
      : `<h2>${esc(s.title || book.title)}</h2><ol class="lib-toc">${s.chapters.map(x => `<li><a href="${bookUrl}${x.path}/"${x === c ? ' aria-current="page"' : ''}>${x.label && x.title ? `<span>${esc(x.label)}</span> ` : ''}${esc(x.title || x.label)}</a></li>`).join('')}</ol>`;
    const link = (x, rel, word) => x ? `<a rel="${rel}" href="${x.url}"><span>${word}</span>${esc(x.c.nav || [x.c.label, x.c.title].filter(Boolean).join(': '))}</a>` : '<span></span>';
    const body = `<main class="lib" data-lib-book="${esc(book.slug)}" data-lib-book-title="${esc(book.title)}" data-lib-path="${esc(c.path)}" data-lib-title="${esc(full)}">
<section class="page-head lib-head"><div class="wrap">
<p class="rubric lib-crumbs">${crumbs}</p>
${c.label && c.title ? `<p class="lib-label">${esc(c.label)}</p>\n` : ''}<h1>${rich(c.title || c.label)}</h1>
</div></section>
<section><div class="wrap lib-grid">
<div>
${TOOLS(bookUrl)}
<article class="lib-text" data-pagefind-body>
<span hidden data-pagefind-meta="title">${esc(full)}</span><span hidden data-pagefind-filter="book">${esc(book.title)}</span><span hidden data-pagefind-meta="book">${esc(book.title)}</span>
${renderBlocks(c.blocks)}
</article>
<nav class="lib-pager" aria-label="Chapters">${link(prev, 'prev', 'Previous')}${link(next, 'next', 'Next')}</nav>
<p class="lib-credit">${rich(book.edition)}</p>
</div>
<aside class="lib-side" aria-label="In this part">
${side}
</aside>
</div></section>
</main>`;
    write(url, page({
      url, title: `${full} | ${book.short || book.title}`,
      description: clip(c.blocks.map(b => b.h || `${b.q} ${b.a}`).join(' '), 155), body,
    }));
    chapterCount += 1;
  });

  /* a page for each part that wants one (each book of the Bible) */
  for (const s of book.sections.filter(x => x.page)) {
    const url = `${bookUrl}${s.slug}/`;
    const body = `<main class="lib">
<section class="page-head lib-head"><div class="wrap">
<p class="rubric lib-crumbs"><a href="/library/">The Library</a><span aria-hidden="true"> &middot; </span><a href="${bookUrl}">${esc(book.short || book.title)}</a></p>
<h1>${esc(s.title)}</h1>
${s.intro ? `<p class="lede">${rich(s.intro)}</p>` : ''}
</div></section>
<section><div class="wrap lib-contents">
${TOOLS(bookUrl)}
<h2 class="lib-part">Chapters</h2>
<ol class="lib-nums lib-nums-big">${s.chapters.map(x => `<li><a href="${bookUrl}${x.path}/">${esc(x.num || x.label)}</a></li>`).join('')}</ol>
<p class="lib-credit">${rich(book.edition)}</p>
</div></section>
</main>`;
    write(url, page({ url, title: `${s.title} | ${book.short || book.title}`, description: `${s.title}, from ${book.title}. ${plain(book.edition)}`, body }));
  }

  /* the book's own page: what it is, which edition, and its contents */
  const sectionHtml = s => s.page
    ? `<li><a href="${bookUrl}${s.slug}/">${esc(s.title)}</a> <span>${s.chapters.length} ${s.chapters.length === 1 ? 'chapter' : 'chapters'}</span></li>`
    : `${s.title && book.sections.length > 1 ? `<h2 class="lib-part">${esc(s.title)}</h2>` : ''}${s.intro ? `<p class="lib-part-intro">${rich(s.intro)}</p>` : ''}<ol class="lib-toc lib-toc-full">${s.chapters.map(x => `<li><a href="${bookUrl}${x.path}/">${x.label && x.title ? `<span>${esc(x.label)}</span> ` : ''}${esc(x.title || x.label)}</a></li>`).join('')}</ol>`;
  let contents;
  if (book.groups) {
    const by = Object.fromEntries(book.sections.map(s => [s.slug, s]));
    contents = book.groups.map(g => `<h2 class="lib-part">${esc(g.title)}</h2><ul class="lib-books">${g.sections.map(k => sectionHtml(by[k])).join('')}</ul>`).join('\n');
  } else contents = book.sections.map(sectionHtml).join('\n');
  const body = `<main class="lib" data-lib-contents="${esc(book.slug)}">
<section class="page-head lib-head"><div class="wrap">
<p class="rubric lib-crumbs"><a href="/library/">The Library</a></p>
<h1>${esc(book.title)}</h1>
<p class="lede">${esc(book.author)}${book.author && book.about ? '. ' : ''}${rich(book.about || '')}</p>
</div></section>
<section><div class="wrap lib-contents">
${TOOLS('/library/')}
<p class="lib-resume" hidden>Pick up where you left off: <a href="${flat[0].url}"></a></p>
<p class="lib-start"><a class="btn btn-red" href="${flat[0].url}">Start reading</a></p>
${contents}
<p class="lib-credit"><b>This edition.</b> ${rich(book.edition)}</p>
</div></section>
</main>`;
  write(bookUrl, page({ url: bookUrl, title: `${book.title} | The Library`, description: clip(`${book.title}, ${book.author}. ${plain(book.about || '')} ${plain(book.edition)}`, 200), body }));
}

/* book covers: drawn in CSS and SVG from the site's own colours, no outside images */
const COVER_COLORS = {
  'introduction-to-the-devout-life': '#1e3a6e', 'the-imitation-of-christ': '#6a2128', 'the-baltimore-catechism': '#2a5139',
  'orthodoxy': '#2d2823', 'douay-rheims-bible': '#4a2f66',
};
function cover(b) {
  const bg = COVER_COLORS[b.slug] || '#1e3a6e';
  const small = b.title.length > 28;
  return `<span class="lib-cover${small ? ' lib-cover-long' : ''}" style="--cover:${bg}" aria-hidden="true"><span class="lib-cover-frame">
<svg class="lib-cover-cross" viewBox="0 0 24 32" width="22" height="30" focusable="false"><path d="M10 0h4v9h8v4h-8v19h-4V13H2V9h8z" fill="currentColor"/></svg>
<span class="lib-cover-title">${esc(b.title.replace(/^The Holy Bible, /, ''))}</span>
<span class="lib-cover-rule"></span>
<span class="lib-cover-author">${esc(b.author)}</span></span></span>`;
}

/* the Library's front page */
{
  const cards = books.map(b => {
    const n = b.sections.reduce((a, s) => a + s.chapters.length, 0);
    return `<article class="resource lib-resource">
<a class="lib-cover-link" href="/library/${b.slug}/" tabindex="-1" aria-hidden="true">${cover(b)}</a>
<a class="resource-main" href="/library/${b.slug}/">
<p class="rubric">${esc(b.author)}</p>
<h2>${esc(b.title)}</h2>
<p>${rich(b.about || '')}</p>
</a>
<ul class="resource-links" aria-label="${esc(b.title)}">
<li><a href="/library/${b.slug}/">Contents</a></li>
<li><a href="/library/${b.slug}/${b.sections[0].chapters[0].path}/">Start reading</a></li>
<li class="lib-resume-li" data-lib-resume="${esc(b.slug)}" hidden><a href="#">Continue</a></li>
</ul>
</article>`;
  }).join('\n');
  /* books promised but not yet prepared: library/coming.json, a list of { title, author }. A book drops off the list once it is built. */
  const comingFile = path.join(root, 'library', 'coming.json');
  const coming = (fs.existsSync(comingFile) ? JSON.parse(fs.readFileSync(comingFile, 'utf8')) : []).filter(c => !books.some(b => b.title === c.title));
  const count = ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'][books.length] || books.length;
  const body = `<main class="lib">
<section class="page-head"><div class="wrap">
<p class="rubric">The Library</p>
<h1>A small shelf of Catholic classics.</h1>
<p class="lede">${count} ${books.length === 1 ? 'book' : 'books'}, free to read here. Search across all of them, and mark the passages you want to come back to.</p>
</div></section>
<section><div class="wrap lib-front">
${TOOLS('/library/').replace('<a href="/library/">Contents</a>', '')}
${SEARCH_FORM(books.length === 5 ? 'Search all five books' : 'Search the books')}
</div></section>
<section><div class="wrap resources">
${cards}
${coming.length ? `<p class="resources-note lib-coming">Being prepared for this shelf: ${coming.map(c => `<i>${esc(c.title)}</i>${c.author ? ` (${esc(c.author)})` : ''}`).join('; ')}.</p>` : ''}
<p class="resources-note">These are older editions that are in the public domain. Each book&rsquo;s page says which edition it is. Highlights are kept in your own browser, on this device only.</p>
</div></section>
</main>`;
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(path.join(OUT, 'index.html'), page({
    url: '/library/', title: 'The Library',
    description: 'A small shelf of Catholic classics, free to read: ' + books.map(b => b.title).join(', ') + '. Search all of them and highlight passages.', body,
  }));
  written.add(path.join(OUT, 'index.html'));
}

/* search */
write('/library/search/', page({
  url: '/library/search/', title: 'Search The Library', index: false,
  description: 'Search across the books in The Library.', scripts: ['/library/search.js'],
  body: `<main class="lib">
<section class="page-head lib-head"><div class="wrap">
<p class="rubric lib-crumbs"><a href="/library/">The Library</a></p>
<h1>Search the books.</h1>
</div></section>
<section><div class="wrap lib-contents">
${TOOLS('/library/').replace('<a href="/library/search/">Search</a>', '').replace('>Contents<', '>All books<')}
<form class="lib-search" id="lib-search" action="/library/search/" method="get" role="search">
<label for="lib-q">A word or a phrase. Put a phrase in &ldquo;quotation marks&rdquo; to find those exact words.</label>
<div class="lib-search-row"><input id="lib-q" name="q" type="search" autocomplete="off" required><button class="btn btn-red" type="submit">Search</button></div>
<fieldset class="lib-filter"><legend>Look in</legend>
<label><input type="radio" name="book" value="" checked> All books</label>
${books.map(b => `<label><input type="radio" name="book" value="${esc(b.title)}"> ${esc(b.short || b.title)}</label>`).join('\n')}
</fieldset>
</form>
<p class="lib-status" id="lib-status" role="status" aria-live="polite"></p>
<ol class="lib-results" id="lib-results"></ol>
<p><button class="btn" type="button" id="lib-more" hidden>Show more</button></p>
<noscript><p class="lib-status">Search needs JavaScript turned on.</p></noscript>
</div></section>
</main>`,
}));

/* my highlights */
write('/library/highlights/', page({
  url: '/library/highlights/', title: 'My highlights | The Library', index: false,
  description: 'The passages you have highlighted in The Library, kept in this browser.',
  body: `<main class="lib" data-lib-highlights>
<section class="page-head lib-head"><div class="wrap">
<p class="rubric lib-crumbs"><a href="/library/">The Library</a></p>
<h1>My highlights.</h1>
<p class="lede">The passages you have marked, kept in this browser on this device. Nothing is sent to us. Clearing your browser&rsquo;s site data removes them, so download a copy if you want to keep them.</p>
</div></section>
<section><div class="wrap lib-contents">
${TOOLS('/library/').replace('<a href="/library/highlights/">My highlights</a>', '').replace('>Contents<', '>All books<')}
<p class="lib-status" id="lib-hl-empty" hidden>No highlights yet. Open a book, select a passage, and choose Highlight.</p>
<div id="lib-hl-list"></div>
<p class="lib-hl-actions" id="lib-hl-actions" hidden><button class="btn" type="button" id="lib-hl-download">Download a copy</button></p>
<noscript><p class="lib-status">Highlights need JavaScript turned on.</p></noscript>
</div></section>
</main>`,
}));

/* remove pages left over from an earlier build (a renamed chapter, a dropped book); leave css, js and the search index alone */
let removed = 0;
(function sweep(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { if (p === path.join(OUT, 'pagefind')) continue; sweep(p); if (!fs.readdirSync(p).length) fs.rmdirSync(p); }
    else if (e.name === 'index.html' && !written.has(p)) { fs.unlinkSync(p); removed += 1; }
  }
})(OUT);

console.log(`The Library: ${books.length} books, ${chapterCount} chapters, ${written.size} pages written${removed ? `, ${removed} old pages removed` : ''}.`);
