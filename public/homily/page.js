/* The page for /homily/. Builds the form from the templates in homily.js and shows the result.
   Nothing is sent or stored: no network calls, no cookies, no local storage. */
(function () {
  'use strict';
  var H = window.Homily, $ = function (id) { return document.getElementById(id); };
  var form = $('hm-form'), picker = $('hm-templates'), blanks = $('hm-blanks'), saintSel = $('hm-saint'),
      out = $('hm-out'), status = $('hm-status'), current = null, made = null;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  function seasonName() { var el = document.querySelector('[data-season-name]'); return el ? el.textContent.trim() : ''; }
  function suggested() {
    var s = seasonName();
    if (/Lent/.test(s)) return 'lent';
    if (/Advent|Christmas/.test(s)) return 'christmas';
    return 'sunday';
  }

  /* Template choices */
  H.TEMPLATES.forEach(function (t) {
    var id = 'hm-t-' + t.id, wrap = document.createElement('div');
    wrap.className = 'hm-choice';
    wrap.innerHTML = '<input type="radio" name="template" id="' + id + '" value="' + t.id + '"><label for="' + id + '"><b></b><span></span></label>';
    wrap.querySelector('b').textContent = t.name;
    wrap.querySelector('span').textContent = t.voice;
    picker.appendChild(wrap);
  });
  H.SAINTS.forEach(function (s) {
    var o = document.createElement('option'); o.value = s[0]; o.textContent = s[1] + ', patron of ' + s[2]; saintSel.appendChild(o);
  });

  /* Blanks: one field per word the template uses. Values carry over when switching templates. */
  var values = {};
  function save() { blanks.querySelectorAll('input').forEach(function (i) { values[i.name] = i.value; }); }
  function drawBlanks(t) {
    save(); blanks.innerHTML = '';
    H.fieldsOf(t).forEach(function (k) {
      var f = H.FIELDS[k], d = document.createElement('div');
      d.className = 'field' + (k === 'saying' ? ' full' : '');
      d.innerHTML = '<label for="hm-' + k + '"></label><input id="hm-' + k + '" name="' + k + '" autocomplete="off" autocapitalize="off" spellcheck="true"><span class="hm-hint" id="hm-' + k + '-hint"></span><span class="hm-err" id="hm-' + k + '-err" hidden></span>';
      d.querySelector('label').textContent = f.label;
      d.querySelector('.hm-hint').textContent = f.hint;
      var inp = d.querySelector('input');
      inp.maxLength = f.max; inp.value = values[k] || '';
      inp.setAttribute('aria-describedby', 'hm-' + k + '-hint hm-' + k + '-err');
      if (f.numeric) inp.inputMode = 'numeric';
      inp.addEventListener('input', function () { clearErr(inp); });
      blanks.appendChild(d);
    });
  }
  function choose(id, keepSaint) {
    current = H.TEMPLATES.filter(function (t) { return t.id === id; })[0] || H.TEMPLATES[0];
    $('hm-t-' + current.id).checked = true;
    if (!keepSaint) saintSel.value = current.saint;
    drawBlanks(current);
  }
  picker.addEventListener('change', function (e) { if (e.target.name === 'template') choose(e.target.value); });

  function clearErr(inp) {
    inp.removeAttribute('aria-invalid');
    var e = $(inp.id + '-err'); e.hidden = true; e.textContent = '';
  }
  function setErr(inp, msg) {
    inp.setAttribute('aria-invalid', 'true');
    var e = $(inp.id + '-err'); e.textContent = msg; e.hidden = false;
  }
  function example(k) { return H.WORDS[k][0]; }

  /* Check every typed word. Empty blanks get a word from the parish-life lists. */
  function collect() {
    var vals = {}, bad = null, filled = 0;
    blanks.querySelectorAll('input').forEach(function (inp) {
      clearErr(inp);
      var k = inp.name, v = inp.value.replace(/\s+/g, ' ').trim();
      if (!v) { vals[k] = H.pick(H.WORDS[k]); filled++; return; }
      var why = H.check(v);
      if (H.FIELDS[k].numeric && !/^\d{1,4}$/.test(v)) setErr(inp, 'Please use a whole number, like 12.');
      else if (why === 'rude') setErr(inp, 'Let’s keep it family friendly. Try something else, like “' + example(k) + '.”');
      else if (why === 'holy') setErr(inp, 'Holy things stay out of the silly blanks. Try something from parish life, like “' + example(k) + '.”');
      else { vals[k] = v; return; }
      bad = bad || inp;
    });
    return { vals: vals, bad: bad, filled: filled };
  }

  function render(h) {
    made = h;
    var art = document.createElement('article');
    art.className = 'hm-sheet';
    art.innerHTML = '<p class="rubric hm-kicker"></p><h2 id="hm-title" tabindex="-1"></h2>';
    art.querySelector('.hm-kicker').textContent = 'Never to be preached' + (seasonName() ? ' · ' + seasonName() : '');
    art.querySelector('h2').textContent = h.title;
    h.sections.forEach(function (s) {
      var sec = document.createElement('section'), lab = document.createElement('p'), p = document.createElement('p');
      lab.className = 'rubric'; lab.textContent = s.label;
      s.pieces.forEach(function (x) {
        if (typeof x === 'string') p.appendChild(document.createTextNode(x));
        else { var b = document.createElement('mark'); b.textContent = x.text; p.appendChild(b); }
      });
      sec.appendChild(lab); sec.appendChild(p); art.appendChild(sec);
    });
    var inv = document.createElement('p'); inv.className = 'hm-invocation'; inv.textContent = h.invocation; art.appendChild(inv);
    var note = document.createElement('p'); note.className = 'hm-fine'; note.textContent = 'Just for fun: a playful look at parish life, not a real homily, and not meant to be preached.'; art.appendChild(note);
    out.innerHTML = ''; out.appendChild(art);
    $('hm-actions').hidden = false;
    $('hm-title').focus({ preventScroll: true });
    out.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  }

  function make(e) {
    if (e) e.preventDefault();
    var c = collect();
    if (c.bad) { c.bad.focus(); status.textContent = 'One of the blanks needs a different word.'; return; }
    render(H.build(current, c.vals, saintSel.value));
    status.textContent = c.filled ? 'Your homily is ready. We filled ' + c.filled + (c.filled === 1 ? ' empty blank' : ' empty blanks') + ' for you.' : 'Your homily is ready.';
  }
  form.addEventListener('submit', make);

  $('hm-surprise').addEventListener('click', function () {
    blanks.querySelectorAll('input').forEach(function (inp) { clearErr(inp); inp.value = H.pick(H.WORDS[inp.name]); });
    saintSel.value = current.saint;
    make();
  });
  $('hm-clear').addEventListener('click', function () {
    blanks.querySelectorAll('input').forEach(function (inp) { clearErr(inp); inp.value = ''; });
    values = {}; status.textContent = 'The blanks are cleared.';
    var first = blanks.querySelector('input'); if (first) first.focus();
  });

  /* Copy, share, print */
  var LINK = 'https://fatherstoolbox.com/homily/';
  function plain() { return H.toText(made, 'Just for fun, not a real homily. Make your own at ' + LINK); }
  function copy() {
    var t = plain();
    function fallback() {
      var ta = document.createElement('textarea'); ta.value = t; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      var ok = false; try { ok = document.execCommand('copy'); } catch (x) {}
      document.body.removeChild(ta);
      status.textContent = ok ? 'Copied. Paste it wherever you like.' : 'Your browser would not copy it. Select the text and copy it by hand.';
    }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(function () { status.textContent = 'Copied. Paste it wherever you like.'; }, fallback);
    else fallback();
  }
  $('hm-copy').addEventListener('click', copy);
  var shareBtn = $('hm-share');
  if (navigator.share) {
    shareBtn.hidden = false;
    shareBtn.addEventListener('click', function () {
      navigator.share({ title: made.title, text: plain() }).catch(function () {});
    });
  }
  $('hm-print').addEventListener('click', function () { window.print(); });

  choose(suggested());
  $('hm-suggest').textContent = seasonName() ? 'Suggested for ' + seasonName() + ': ' + current.name + '.' : '';
})();
