/* The Library: reading options (text size, night), highlights and "pick up where you left off".
   Everything is kept in this browser's own storage. Nothing is sent anywhere, and there are no accounts.

   Highlights are stored under "ftb.library.highlights" as
     { v: 1, items: [{ id, book, bookTitle, path, title, key, s, e, text, at }] }
   book + path name the chapter, key names the paragraph, verse or answer (its data-hl value),
   s and e are character positions inside it, and text is the passage itself (so a highlight can be
   found again if the text is ever corrected, and so it can be shown on the My highlights page). */
(function () {
  'use strict';
  var html = document.documentElement;
  var PREFS = 'ftb.library.prefs', HL = 'ftb.library.highlights', LAST = 'ftb.library.last';

  function read(key, dflt) { try { var v = JSON.parse(localStorage.getItem(key)); return v == null ? dflt : v; } catch (e) { return dflt; } }
  function save(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch (e) { return false; } }

  /* ---------- text size and night ---------- */
  var prefs = read(PREFS, {});
  var MIN = -1, MAX = 3;
  function applyPrefs() {
    var size = Math.max(MIN, Math.min(MAX, parseInt(prefs.size, 10) || 0));
    if (size) html.setAttribute('data-lib-size', size); else html.removeAttribute('data-lib-size');
    if (prefs.theme === 'night') html.setAttribute('data-lib-theme', 'night'); else html.removeAttribute('data-lib-theme');
    [].forEach.call(document.querySelectorAll('[data-lib-size]:not(html)'), function (b) {
      var step = parseInt(b.getAttribute('data-lib-size'), 10);
      b.disabled = step < 0 ? size <= MIN : size >= MAX;
    });
    [].forEach.call(document.querySelectorAll('[data-lib-night]'), function (b) {
      var on = prefs.theme === 'night';
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
      b.setAttribute('aria-label', on ? 'Night reading is on. Switch to day.' : 'Switch to night reading');
    });
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('button[data-lib-size],button[data-lib-night]');
    if (!b) return;
    if (b.hasAttribute('data-lib-night')) prefs.theme = prefs.theme === 'night' ? 'day' : 'night';
    else prefs.size = Math.max(MIN, Math.min(MAX, (parseInt(prefs.size, 10) || 0) + parseInt(b.getAttribute('data-lib-size'), 10)));
    save(PREFS, prefs);
    applyPrefs();
  });
  applyPrefs();

  /* ---------- pick up where you left off ---------- */
  var main = document.querySelector('main.lib');
  var last = read(LAST, {});
  if (main && main.hasAttribute('data-lib-path')) {
    last[main.getAttribute('data-lib-book')] = { url: location.pathname, title: main.getAttribute('data-lib-title') };
    save(LAST, last);
  }
  if (main && main.hasAttribute('data-lib-contents')) {
    var at = last[main.getAttribute('data-lib-contents')], line = main.querySelector('.lib-resume');
    if (at && line) { var a = line.querySelector('a'); a.href = at.url; a.textContent = at.title; line.hidden = false; }
  }
  [].forEach.call(document.querySelectorAll('[data-lib-resume]'), function (li) {
    var at = last[li.getAttribute('data-lib-resume')];
    if (at) { var a = li.querySelector('a'); a.href = at.url; a.textContent = 'Continue: ' + at.title; li.hidden = false; }
  });

  /* ---------- highlights ---------- */
  function loadHl() { var d = read(HL, null); return d && d.v === 1 && Array.isArray(d.items) ? d : { v: 1, items: [] }; }
  function saveHl(d) { return save(HL, d); }
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }

  /* Wrap the characters s..e of a container's text in <mark> elements (several, if the passage runs across italics). */
  function wrap(container, s, e, cls, id) {
    var walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT), nodes = [], pos = 0, n;
    while ((n = walker.nextNode())) {
      var len = n.nodeValue.length, a = Math.max(s, pos), b = Math.min(e, pos + len);
      if (a < b) nodes.push([n, a - pos, b - pos]);
      pos += len;
    }
    nodes.forEach(function (x) {
      var node = x[0];
      if (x[2] < node.nodeValue.length) node.splitText(x[2]);
      if (x[1] > 0) node = node.splitText(x[1]);
      var m = document.createElement('mark');
      m.className = cls;
      if (id) m.setAttribute('data-id', id);
      node.parentNode.insertBefore(m, node);
      m.appendChild(node);
    });
  }
  function unwrap(marks) {
    [].forEach.call(marks, function (m) {
      var p = m.parentNode;
      while (m.firstChild) p.insertBefore(m.firstChild, m);
      p.removeChild(m);
      p.normalize();
    });
  }

  var article = document.querySelector('.lib-text');
  if (article && main) (function () {
    var book = main.getAttribute('data-lib-book'), pathKey = main.getAttribute('data-lib-path');
    var boxes = {};
    [].forEach.call(article.querySelectorAll('[data-hl]'), function (el) { boxes[el.getAttribute('data-hl')] = el; });

    function mine(d) { return d.items.filter(function (h) { return h.book === book && h.path === pathKey; }); }
    function paint() {
      unwrap(article.querySelectorAll('mark.lib-hl'));
      mine(loadHl()).forEach(function (h) {
        var el = boxes[h.key], s = h.s, e = h.e;
        if (!el) return;
        var text = el.textContent;
        if (text.slice(s, e) !== h.text) {            /* the text moved (a correction): look for the passage again */
          var i = text.indexOf(h.text);
          if (i < 0) return;
          s = i; e = i + h.text.length;
        }
        wrap(el, s, e, 'lib-hl', h.id);
      });
    }

    /* Which parts of which paragraphs does the reader's selection cover? */
    function pieces(range) {
      var out = [];
      Object.keys(boxes).forEach(function (key) {
        var el = boxes[key];
        if (!range.intersectsNode(el)) return;
        var whole = document.createRange(); whole.selectNodeContents(el);
        var len = el.textContent.length, s = 0, e = len, r;
        if (range.compareBoundaryPoints(Range.START_TO_START, whole) > 0) {
          r = document.createRange(); r.selectNodeContents(el); r.setEnd(range.startContainer, range.startOffset); s = r.toString().length;
        }
        if (range.compareBoundaryPoints(Range.END_TO_END, whole) < 0) {
          r = document.createRange(); r.selectNodeContents(el); r.setEnd(range.endContainer, range.endOffset); e = r.toString().length;
        }
        var text = el.textContent;
        while (s < e && /\s/.test(text.charAt(s))) s += 1;
        while (e > s && /\s/.test(text.charAt(e - 1))) e -= 1;
        if (e > s) out.push({ key: key, s: s, e: e });
      });
      return out;
    }

    function add(range) {
      var d = loadHl(), title = main.getAttribute('data-lib-title'), bookTitle = main.getAttribute('data-lib-book-title');
      pieces(range).forEach(function (p) {
        /* join with any highlight it touches in the same paragraph */
        d.items = d.items.filter(function (h) {
          if (h.book !== book || h.path !== pathKey || h.key !== p.key || h.e < p.s || h.s > p.e) return true;
          p.s = Math.min(p.s, h.s); p.e = Math.max(p.e, h.e);
          return false;
        });
        d.items.push({ id: uid(), book: book, bookTitle: bookTitle, path: pathKey, title: title, key: p.key, s: p.s, e: p.e,
          text: boxes[p.key].textContent.slice(p.s, p.e), at: new Date().toISOString() });
      });
      if (!saveHl(d)) { say('Your browser would not save the highlight. Private browsing can block this.'); return; }
      paint();
    }
    function remove(id) {
      var d = loadHl();
      d.items = d.items.filter(function (h) { return h.id !== id; });
      saveHl(d);
      paint();
    }

    /* the small button that appears when text is selected, or when a highlight is tapped */
    var pop = document.createElement('div'), kept = null, hideTimer;
    pop.className = 'lib-pop';
    pop.hidden = true;
    document.body.appendChild(pop);
    var touch = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
    function show(label, action, rect) {
      clearTimeout(hideTimer);
      pop.innerHTML = '';
      var b = document.createElement('button');
      b.type = 'button'; b.textContent = label;
      b.addEventListener('click', function () { action(); hide(); var sel = window.getSelection(); if (sel) sel.removeAllRanges(); });
      pop.appendChild(b);
      pop.hidden = false;
      if (touch) { pop.classList.add('lib-pop-bar'); pop.style.left = pop.style.top = ''; return; }
      pop.classList.remove('lib-pop-bar');
      var w = pop.offsetWidth, hgt = pop.offsetHeight;
      var x = Math.max(8, Math.min(window.innerWidth - w - 8, rect.left + rect.width / 2 - w / 2));
      var y = rect.top - hgt - 8 < 4 ? rect.bottom + 8 : rect.top - hgt - 8;
      pop.style.left = (x + window.pageXOffset) + 'px';
      pop.style.top = (y + window.pageYOffset) + 'px';
    }
    function hide() { pop.hidden = true; kept = null; }
    function say(text) {
      pop.innerHTML = ''; var s = document.createElement('button'); s.type = 'button'; s.textContent = text; s.addEventListener('click', hide);
      pop.appendChild(s); pop.hidden = false; pop.classList.add('lib-pop-bar'); pop.style.left = pop.style.top = '';
    }
    /* pressing the button must not clear the selection before the click arrives */
    pop.addEventListener('mousedown', function (e) { e.preventDefault(); });
    pop.addEventListener('touchstart', function (e) { clearTimeout(hideTimer); }, { passive: true });

    function onSelection() {
      var sel = window.getSelection();
      if (!sel || sel.isCollapsed || !sel.rangeCount) {
        if (kept) { clearTimeout(hideTimer); hideTimer = setTimeout(hide, 400); }
        return;
      }
      var range = sel.getRangeAt(0);
      if (!article.contains(range.commonAncestorContainer) && !range.intersectsNode(article)) return;
      if (!pieces(range).length) return;
      kept = range.cloneRange();
      var saved = kept;
      show('Highlight', function () { add(saved); }, range.getBoundingClientRect());
    }
    var selTimer;
    document.addEventListener('selectionchange', function () { clearTimeout(selTimer); selTimer = setTimeout(onSelection, 180); });

    article.addEventListener('click', function (e) {
      var m = e.target.closest && e.target.closest('mark.lib-hl');
      var sel = window.getSelection();
      if (!m || (sel && !sel.isCollapsed)) return;
      var id = m.getAttribute('data-id');
      kept = true;
      show('Remove highlight', function () { remove(id); }, m.getBoundingClientRect());
    });
    document.addEventListener('click', function (e) {
      if (pop.hidden || pop.contains(e.target) || (e.target.closest && e.target.closest('mark.lib-hl'))) return;
      var sel = window.getSelection();
      if (!sel || sel.isCollapsed) hide();
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !pop.hidden) hide(); });
    /* another tab changed the highlights */
    window.addEventListener('storage', function (e) { if (e.key === HL) paint(); });

    paint();

    /* arriving from a search (?q=words) or from My highlights (#v12): show the reader where to look */
    var q = '';
    try { q = new URLSearchParams(location.search).get('q') || ''; } catch (err) {}
    var first = null;
    if (q) {
      var phrase = /^\s*"(.+)"\s*$/.exec(q);
      var words = phrase ? [phrase[1]] : q.split(/\s+/).filter(function (w) { return w.replace(/[^A-Za-z0-9À-ɏ]/g, '').length > 1; });
      var res = words.map(function (w) {
        w = w.replace(/^[^A-Za-z0-9À-ɏ]+|[^A-Za-z0-9À-ɏ]+$/g, '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+');
        return new RegExp(phrase ? w : '\\b' + w, 'gi');
      });
      var best = 0;
      Object.keys(boxes).forEach(function (key) {
        var el = boxes[key], text = el.textContent, spots = [], hit = 0;
        res.forEach(function (re) {
          var m, found = false; re.lastIndex = 0;
          while ((m = re.exec(text))) { found = true; var end = m.index + m[0].length; var tail = /^[A-Za-zÀ-ɏ']*/.exec(text.slice(end))[0].length; spots.push([m.index, end + (phrase ? 0 : tail)]); if (!m[0].length) re.lastIndex += 1; }
          if (found) hit += 1;
        });
        spots.sort(function (a, b) { return b[0] - a[0]; }).forEach(function (sp) { wrap(el, sp[0], sp[1], 'lib-find'); });
        if (hit > best) { best = hit; first = el; }
      });
    }
    var target = first || (location.hash.length > 1 && document.getElementById(decodeURIComponent(location.hash.slice(1))));
    if (target) {
      var block = target.closest('p,blockquote,div.lib-qa') || target;
      block.classList.add('lib-target');
      setTimeout(function () { block.scrollIntoView({ block: 'center' }); }, 60);
    }
  })();

  /* ---------- the My highlights page ---------- */
  var listPage = document.querySelector('[data-lib-highlights]');
  if (listPage) (function () {
    var list = document.getElementById('lib-hl-list'), empty = document.getElementById('lib-hl-empty'), actions = document.getElementById('lib-hl-actions');
    function el(tag, text, cls) { var x = document.createElement(tag); if (text != null) x.textContent = text; if (cls) x.className = cls; return x; }
    function anchor(h) { return h.key.replace(/^a(\d+).*$/, 'q$1'); }
    function draw() {
      var d = loadHl(), books = {}, order = [];
      d.items.slice().sort(function (a, b) { return a.at < b.at ? 1 : -1; }).forEach(function (h) {
        if (!books[h.book]) { books[h.book] = []; order.push(h.book); }
        books[h.book].push(h);
      });
      list.innerHTML = '';
      empty.hidden = d.items.length > 0;
      actions.hidden = d.items.length === 0;
      order.forEach(function (b) {
        var sec = el('section', null, 'lib-hl-book');
        sec.appendChild(el('h2', books[b][0].bookTitle));
        books[b].forEach(function (h) {
          var item = el('div', null, 'lib-hl-item'), foot = el('p'), a = el('a', h.title), rm = el('button', 'Remove');
          item.appendChild(el('blockquote', h.text));
          a.href = '/library/' + h.book + '/' + h.path + '/#' + anchor(h);
          foot.appendChild(a);
          foot.appendChild(el('span', new Date(h.at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })));
          rm.type = 'button';
          rm.addEventListener('click', function () { var dd = loadHl(); dd.items = dd.items.filter(function (x) { return x.id !== h.id; }); saveHl(dd); draw(); });
          foot.appendChild(rm);
          item.appendChild(foot);
          sec.appendChild(item);
        });
        list.appendChild(sec);
      });
    }
    document.getElementById('lib-hl-download').addEventListener('click', function () {
      var d = loadHl(), out = ['My highlights from The Library, fatherstoolbox.com', ''];
      d.items.slice().sort(function (a, b) { return (a.bookTitle + a.path) < (b.bookTitle + b.path) ? -1 : 1; }).forEach(function (h) {
        out.push('"' + h.text + '"', h.bookTitle + ', ' + h.title, 'https://fatherstoolbox.com/library/' + h.book + '/' + h.path + '/#' + anchor(h), '');
      });
      var blob = new Blob([out.join('\r\n')], { type: 'text/plain;charset=utf-8' }), a = document.createElement('a');
      a.href = URL.createObjectURL(blob); a.download = 'library-highlights.txt';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
    });
    window.addEventListener('storage', function (e) { if (e.key === HL) draw(); });
    draw();
  })();
})();
