/* The Library: search across the books. The index is a set of small files under /library/pagefind/,
   made ahead of time (see the README). The browser fetches only the few pieces a search needs,
   so nothing runs on a server and the whole Bible is never downloaded just to search it. */
(function () {
  'use strict';
  var form = document.getElementById('lib-search'), input = document.getElementById('lib-q');
  var status = document.getElementById('lib-status'), list = document.getElementById('lib-results'), more = document.getElementById('lib-more');
  var PAGE = 10, engine = null, results = [], shown = 0, run = 0;

  function params() { try { return new URLSearchParams(location.search); } catch (e) { return { get: function () { return null; } }; } }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  /* the index hands back excerpts with <mark> around the matches; allow that tag and nothing else */
  function excerpt(s) { return esc(String(s).replace(/<\/?mark>/g, function (m) { return m === '<mark>' ? '\u0001' : '\u0002'; })).replace(/\u0001/g, '<mark>').replace(/\u0002/g, '</mark>'); }
  function book() { var r = form.querySelector('input[name=book]:checked'); return r ? r.value : ''; }

  function load() {
    if (!engine) engine = import('/library/pagefind/pagefind.js').then(function (pf) { return Promise.resolve(pf.options({ excerptLength: 36, baseUrl: '/' })).then(function () { return pf; }); });
    return engine;
  }

  function showMore(mine) {
    var batch = results.slice(shown, shown + PAGE);
    return Promise.all(batch.map(function (r) { return r.data(); })).then(function (items) {
      if (mine !== run) return;
      var q = input.value.trim();
      items.forEach(function (d) {
        var li = document.createElement('li');
        var url = d.url.replace(/index\.html$/, '') + '?q=' + encodeURIComponent(q);
        li.innerHTML = '<a href="' + esc(url) + '"><span class="lib-r-book">' + esc((d.meta && d.meta.book) || '') + '</span>'
          + '<span class="lib-r-title">' + esc((d.meta && d.meta.title) || '') + '</span><p>' + excerpt(d.excerpt) + '</p></a>';
        list.appendChild(li);
      });
      shown += batch.length;
      more.hidden = shown >= results.length;
    });
  }

  function search(push) {
    var q = input.value.trim(), b = book(), mine = ++run;
    list.innerHTML = ''; more.hidden = true; results = []; shown = 0;
    if (push) {
      var u = '/library/search/' + (q ? '?q=' + encodeURIComponent(q) + (b ? '&book=' + encodeURIComponent(b) : '') : '');
      try { history.replaceState(null, '', u); } catch (e) {}
    }
    if (!q) { status.textContent = ''; return; }
    status.textContent = 'Searching…';
    load().then(function (pf) {
      return pf.search(q, b ? { filters: { book: b } } : {});
    }).then(function (res) {
      if (mine !== run) return;
      results = res.results;
      var n = results.length;
      var shown = q.replace(/^["“”]+|["“”]+$/g, '');
      status.textContent = n === 0 ? 'Nothing found for “' + shown + '”' + (b ? ' in ' + b : '') + '. Try fewer words, or another spelling.'
        : n + (n === 1 ? ' chapter mentions' : ' chapters mention') + ' “' + shown + '”' + (b ? ' in ' + b : '') + '.';
      return showMore(mine);
    }).catch(function () {
      if (mine === run) status.textContent = 'Search could not load. Check your connection and try again.';
    });
  }

  form.addEventListener('submit', function (e) { e.preventDefault(); search(true); });
  [].forEach.call(form.querySelectorAll('input[name=book]'), function (r) { r.addEventListener('change', function () { search(true); }); });
  more.addEventListener('click', function () { showMore(run); });

  var p = params(), q0 = p.get('q'), b0 = p.get('book');
  if (b0) [].forEach.call(form.querySelectorAll('input[name=book]'), function (r) { if (r.value === b0) r.checked = true; });
  if (q0) { input.value = q0; search(false); } else input.focus();
})();
