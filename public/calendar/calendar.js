/* The liturgical calendar page: month view, day detail, season band, movable dates, holy days and .ics download.
   All the liturgical work is done by ordo.js; this file only draws it. */
(function () {
  'use strict';
  var O = window.Ordo, $ = function (id) { return document.getElementById(id); };
  var MIN = 1970, MAX = 2199;
  var MONTHS = O.MONTHS, DAYS = O.DAYS;
  var state = { sel: O.today(), asc: false };

  /* ---------- URL state: ?date=2026-12-08&ascension=thursday ---------- */
  (function () {
    var q = new URLSearchParams(location.search), d = O.parse(q.get('date'));
    if (d != null && O.ymd(d)[0] >= MIN && O.ymd(d)[0] <= MAX) state.sel = d;
    if (q.get('ascension') === 'thursday') state.asc = true;
    else { try { state.asc = localStorage.getItem('lc-asc') === '1'; } catch (e) {} }
  })();
  function opt() { return { ascensionThursday: state.asc }; }
  function writeUrl() {
    var q = new URLSearchParams();
    if (state.sel !== O.today()) q.set('date', O.iso(state.sel));
    if (state.asc) q.set('ascension', 'thursday');
    var s = q.toString();
    history.replaceState(null, '', location.pathname + (s ? '?' + s : ''));
  }

  /* ---------- Small helpers ---------- */
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function long(n) { var a = O.ymd(n); return DAYS[O.dow(n)] + ', ' + MONTHS[a[1] - 1] + ' ' + a[2] + ', ' + a[0]; }
  function sw(c) { return '<i class="sw c-' + c + '" aria-hidden="true"></i>'; }
  function colorWords(d) {
    var names = d.color.map(function (c) { return O.COLOR_NAME[c]; });
    var main = d.colorOr ? names.join(' or ') : names[0];
    return main;
  }
  function rankClass(d) { return { Solemnity: 's', Feast: 'f', Memorial: 'm' }[d.kind] || ''; }
  function holyText(h) {
    return { obligation: 'Holy day of obligation', abrogated: 'Not a holy day of obligation this year', transferred: 'Transferred: not a holy day of obligation this year', sunday: 'Falls on a Sunday' }[h] || '';
  }
  function cycleText(d) { return 'Sunday cycle ' + d.sundayCycle + ', weekday cycle ' + d.weekdayCycle; }
  function seasonText(d) {
    if (d.season === 'ordinary' && d.week) return d.seasonName + ', week ' + d.week;
    if ((d.season === 'advent' || d.season === 'easter') && d.week) return d.seasonName + ', week ' + d.week;
    if (d.season === 'lent' && d.week) return d.week === 6 ? 'Lent, Holy Week' : 'Lent, week ' + d.week;
    return d.seasonName;
  }

  /* ---------- Today ---------- */
  function drawToday() {
    var t = O.today(), d = O.day(t, opt());
    $('lc-today-date').textContent = 'Today, ' + long(t);
    $('lc-today-title').textContent = d.title;
    var meta = [d.kind !== 'Weekday' ? d.kind : null, colorWords(d), seasonText(d), cycleText(d)].filter(Boolean).join(' \u00B7 ');
    if (d.options.length) meta += '. Optional: ' + d.options.map(function (o) { return o.short; }).join('; ');
    $('lc-today-meta').textContent = meta + '.';
    $('lc-today-color').className = 'lc-chasuble c-' + d.color[0];
    $('lc-today').setAttribute('data-color', d.color[0]);
    drawCount(t);
    document.title = 'Liturgical Calendar for the United States | Father\u2019s Tool Box';
  }

  /* ---------- Coming up: the next great days, counted down ---------- */
  var BIG = { 'Ash Wednesday': 'violet', 'Easter Sunday': 'white', 'Pentecost Sunday': 'red', 'First Sunday of Advent': 'violet', 'Christ the King': 'white', 'Palm Sunday': 'red', 'Epiphany of the Lord': 'white' };
  var calm = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function drawCount(t) {
    var Y = O.ymd(t)[0], ev = [];
    [Y, Y + 1].forEach(function (y) {
      O.keyDates(y, opt()).forEach(function (k) { if (BIG[k.name]) ev.push({ name: k.name, n: O.parse(k.date), c: BIG[k.name] }); });
      ev.push({ name: 'Christmas', n: O.dn(y, 12, 25), c: 'white' });
    });
    ev = ev.filter(function (e) { return e.n > t; }).sort(function (a, b) { return a.n - b.n; }).slice(0, 3);
    $('lc-count').innerHTML = ev.map(function (e, i) {
      var k = e.n - t;
      return '<li style="--i:' + i + '"><button type="button" class="lc-cd lc-cd-' + e.c + '" data-go="' + O.iso(e.n) + '">' +
        '<b data-to="' + k + '">' + (calm ? k : 0) + '</b><span>' + (k === 1 ? 'day' : 'days') + ' to</span><em>' + esc(e.name) + '</em></button></li>';
    }).join('');
    if (calm) return;
    var nums = $('lc-count').querySelectorAll('b[data-to]'), t0 = null;
    function tick(ts) {
      if (t0 == null) t0 = ts;
      var p = Math.min(1, (ts - t0) / 1400), e = 1 - Math.pow(1 - p, 3);
      nums.forEach(function (b) { b.textContent = Math.round(+b.dataset.to * e); });
      if (p < 1) requestAnimationFrame(tick);
    }
    setTimeout(function () { requestAnimationFrame(tick); }, 350);
  }

  /* ---------- Season band: the liturgical year that holds the selected day, to scale ---------- */
  function drawBand() {
    var y = O.ymd(state.sel)[0], L = state.sel >= O.advent1(y) ? y + 1 : y, S = O.seasons(L, opt());
    var a0 = O.parse(S.start), a1 = O.parse(S.end) + 1, span = a1 - a0, html = '';
    S.segments.forEach(function (g, i) {
      var s = O.parse(g.start), e = i + 1 < S.segments.length ? O.parse(S.segments[i + 1].start) : a1;
      var w = (e - s) / span * 100, label = w > 6 ? g.name.replace(' Time', '') : '';
      var cls = g.season === 'triduum' ? 'tri' : { advent: 'violet', christmas: 'white', ordinary: 'green', lent: 'violet', easter: 'white' }[g.season];
      html += '<button type="button" class="seg seg-' + cls + '" style="width:' + w.toFixed(3) + '%" data-go="' + g.start + '" title="' + esc(g.name + ': ' + long(s) + ' to ' + long(O.parse(g.end))) + '">' +
        '<span class="lc-sr">' + esc(g.name) + ', from ' + esc(long(s)) + '</span><b aria-hidden="true">' + esc(label) + '</b></button>';
    });
    var t = O.today();
    if (t >= a0 && t < a1) { var p = (t - a0) / span * 100; html += '<span class="today' + (p > 85 ? ' flip' : '') + '" style="left:' + p.toFixed(3) + '%"><b>Today</b></span>'; }
    var p2 = (state.sel - a0) / span * 100;
    if (state.sel !== t) html += '<span class="sel" style="left:' + p2.toFixed(3) + '%" aria-hidden="true"></span>';
    $('lc-band').innerHTML = html;
    $('lc-band-caption').textContent = 'The liturgical year ' + (L - 1) + '\u2013' + L + ', from the First Sunday of Advent, ' + long(a0) +
      ', to ' + long(a1 - 1) + '. Sunday cycle ' + S.sundayCycle + ', weekday cycle ' + S.weekdayCycle + '. Choose a season to go to it.';
  }

  /* ---------- Month ---------- */
  var shown = null;
  function drawMonth(focus) {
    var a = O.ymd(state.sel), Y = a[0], M = a[1], days = O.month(Y, M, opt()), t = O.today();
    var key = Y * 12 + M, dir = shown == null ? 0 : key > shown ? 1 : key < shown ? -1 : null; shown = key;
    $('lc-month-title').textContent = MONTHS[M - 1] + ' ' + Y;
    $('lc-month').value = String(M);
    $('lc-yearin').value = String(Y);
    $('lc-prev').disabled = Y === MIN && M === 1;
    $('lc-next').disabled = Y === MAX && M === 12;
    var html = '<div class="lc-row lc-head" role="row">' + DAYS.map(function (d) { return '<span role="columnheader" aria-label="' + d + '">' + d.slice(0, 3) + '</span>'; }).join('') + '</div>';
    var lead = days[0].dow, cells = [];
    for (var i = 0; i < lead; i++) cells.push('<span class="lc-cell lc-pad" role="presentation" style="--i:' + i + '"></span>');
    days.forEach(function (d) {
      var cls = ['lc-cell'], plain = !d.sanctoral && d.kind === 'Weekday';
      if (d.dow === 0) cls.push('sun');
      if (d.n === t) cls.push('is-today');
      if (d.n === state.sel) cls.push('is-sel');
      if (rankClass(d)) cls.push('r-' + rankClass(d));
      var title = plain ? '' : '<span class="lc-t">' + esc(d.short) + '</span>';
      var opts = d.options.filter(function (o) { return o.key !== 'bvm-saturday'; });
      var optHtml = opts.length ? '<span class="lc-o">' + opts.map(function (o) { return esc(o.short); }).join('; ') + '</span>' : '';
      var bars = d.colors.map(function (c) { return '<i class="c-' + c + '"></i>'; }).join('');
      var label = long(d.n) + '. ' + d.title + (d.kind !== 'Weekday' ? ', ' + d.kind : '') + '. ' + colorWords(d) + '.' +
        (opts.length ? ' Optional: ' + opts.map(function (o) { return o.short; }).join('; ') + '.' : '') + (d.holyDay === 'obligation' ? ' Holy day of obligation.' : '');
      cells.push('<button type="button" role="gridcell" class="' + cls.join(' ') + '" style="--i:' + (lead + d.day - 1) + '" data-n="' + d.n + '" aria-selected="' + (d.n === state.sel) + '" tabindex="' + (d.n === state.sel ? 0 : -1) + '" aria-label="' + esc(label) + '"' + (d.n === t ? ' aria-current="date"' : '') + '>' +
        '<span class="lc-bar" aria-hidden="true">' + bars + '</span>' +
        '<span class="lc-num" aria-hidden="true"><span class="lc-dow">' + DAYS[d.dow].slice(0, 3) + '</span>' + d.day + '</span>' +
        '<span class="lc-body" aria-hidden="true">' + title + optHtml +
        (d.holyDay === 'obligation' ? '<span class="lc-hd">Holy day</span>' : '') +
        (!plain && /^(Solemnity|Feast|Memorial|Commemoration|Day of Prayer|Paschal Triduum)$/.test(d.kind) ? '<span class="lc-k">' + esc(d.kind) + '</span>' : '') +
        (plain && !opts.length ? '<span class="lc-w">' + esc(d.dow === 0 ? '' : (d.season === 'ordinary' ? 'Weekday' : d.short)) + '</span>' : '') +
        '</span></button>');
    });
    while ((cells.length) % 7) cells.push('<span class="lc-cell lc-pad" role="presentation" style="--i:' + cells.length + '"></span>');
    for (var r = 0; r < cells.length; r += 7) html += '<div class="lc-row" role="row">' + cells.slice(r, r + 7).join('') + '</div>';
    var g = $('lc-grid');
    g.innerHTML = html;
    if (dir !== null) { g.classList.remove('lc-in', 'lc-in-back'); void g.offsetWidth; g.classList.add(dir < 0 ? 'lc-in-back' : 'lc-in'); }
    if (focus) { var b = $('lc-grid').querySelector('[data-n="' + state.sel + '"]'); if (b) b.focus(); }
  }

  /* ---------- Day detail ---------- */
  function drawDetail() {
    var d = O.day(state.sel, opt()), h = '';
    h += '<p class="rubric">' + esc(long(d.n)) + (d.n === O.today() ? ' \u00B7 Today' : '') + '</p>';
    h += '<h2>' + esc(d.title) + '</h2>';
    var tags = [];
    if (d.kind !== 'Weekday' && d.kind !== 'Sunday') tags.push('<span class="lc-tag r-' + (rankClass(d) || 'x') + '">' + esc(d.kind) + '</span>');
    if (d.usa) tags.push('<span class="lc-tag lc-usa">Proper to the United States</span>');
    if (d.holyDay && d.holyDay !== 'sunday') tags.push('<span class="lc-tag lc-holy-' + d.holyDay + '">' + esc(holyText(d.holyDay)) + '</span>');
    if (tags.length) h += '<p class="lc-tags">' + tags.join(' ') + '</p>';
    if (d.weekday) h += '<p class="lc-weekday">' + esc(d.weekday) + '</p>';
    h += '<dl class="lc-dl">';
    h += '<div><dt>Color</dt><dd>' + d.color.map(sw).join('') + ' ' + esc(colorWords(d)) + (d.options.length && d.season !== 'lent' && !/^(late-advent|octave)$/.test(d.key) ? '<span class="lc-or">, or the color of an optional memorial</span>' : '') + '</dd></div>';
    h += '<div><dt>Season</dt><dd>' + esc(seasonText(d)) + '</dd></div>';
    h += '<div><dt>Readings</dt><dd>' + esc(cycleText(d)) + '</dd></div>';
    h += '</dl>';
    if (d.options.length) {
      var label = d.options[0].kind === 'Commemoration' ? 'May be commemorated' : 'Optional memorials';
      h += '<h3>' + label + '</h3><ul class="lc-opts">' + d.options.map(function (o) {
        return '<li>' + sw(o.color[0]) + '<span>' + esc(o.title) + (o.usa ? ' <small>(USA)</small>' : '') + '</span></li>';
      }).join('') + '</ul>';
      if (d.options[0].kind === 'Commemoration') h += '<p class="lc-note">In ' + (d.season === 'lent' ? 'Lent' : d.key === 'octave' ? 'the Octave of Christmas' : 'the last days of Advent') + ', a memorial may be observed only as a commemoration; the Mass and color are of the day.</p>';
    }
    if (d.notes.length) h += '<div class="lc-notes">' + d.notes.map(function (n) { return '<p class="lc-note">' + esc(n) + '</p>'; }).join('') + '</div>';
    h += '<p class="lc-actions"><a class="btn btn-red" href="' + d.readings + '" target="_blank" rel="noopener">Readings at USCCB<span class="lc-sr"> (opens in a new tab)</span></a>' +
      '<button type="button" class="btn-plain btn lc-copy" id="lc-copy">Copy a link to this day</button></p>';
    var box = $('lc-detail');
    box.innerHTML = h;
    box.setAttribute('data-color', d.color[0]);
    box.classList.remove('lc-pop'); void box.offsetWidth; box.classList.add('lc-pop');
    $('lc-copy').addEventListener('click', function () {
      var url = location.origin + location.pathname + '?date=' + O.iso(state.sel) + (state.asc ? '&ascension=thursday' : '');
      var done = function () { $('lc-copy').textContent = 'Link copied'; };
      if (navigator.clipboard) navigator.clipboard.writeText(url).then(done, function () { prompt('Copy this link:', url); }); else prompt('Copy this link:', url);
    });
  }

  /* ---------- Movable dates and holy days ---------- */
  function drawPanels() {
    var Y = O.ymd(state.sel)[0];
    $('lc-keys-title').textContent = 'Movable dates in ' + Y;
    $('lc-keys').innerHTML = '<tbody>' + O.keyDates(Y, opt()).map(function (k) {
      var n = O.parse(k.date), a = O.ymd(n);
      return '<tr><th scope="row"><button type="button" class="lc-link" data-go="' + k.date + '">' + esc(k.name) + '</button></th><td>' + DAYS[O.dow(n)].slice(0, 3) + ', ' + MONTHS[a[1] - 1].slice(0, 3) + ' ' + a[2] + '</td></tr>';
    }).join('') + '</tbody>';
    $('lc-holy-title').textContent = 'Holy days in ' + Y;
    var list = O.year(Y, opt()).filter(function (d) { return d.holyDay; });
    $('lc-holy').innerHTML = list.map(function (d) {
      var a = O.ymd(d.n), status = d.holyDay === 'obligation' ? '' : ' <em>' + esc(holyText(d.holyDay).replace('Falls on a Sunday', 'a Sunday this year')) + '</em>';
      return '<li class="hd-' + d.holyDay + '"><button type="button" class="lc-link" data-go="' + d.date + '">' + esc(d.short) + '</button><span>' + DAYS[d.dow].slice(0, 3) + ', ' + MONTHS[a[1] - 1].slice(0, 3) + ' ' + a[2] + status + '</span></li>';
    }).join('') + (state.asc ? '' : '<li class="hd-note"><span>The Ascension is a holy day on Thursday only in the provinces of ' + O.ASCENSION_PROVINCES + '.</span></li>');
    $('lc-ics-year').value = String(Y);
    $('lc-ics-note').textContent = state.asc ? 'With the Ascension on Thursday, as you have chosen above.' : 'With the Ascension on Sunday. To have it on Thursday, tick the box above the calendar first.';
  }

  /* ---------- .ics ---------- */
  function ics(Y, mem) {
    var lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Father\u2019s Tool Box//Liturgical Calendar//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
      'X-WR-CALNAME:Liturgical Calendar ' + Y + ' (USA)', 'X-WR-CALDESC:Solemnities\\, feasts and holy days for the dioceses of the United States. fatherstoolbox.com/calendar'];
    var stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');
    O.year(Y, opt()).forEach(function (d) {
      var take = d.kind === 'Solemnity' || d.kind === 'Feast' || d.holyDay || d.key === 'ash-wednesday' || d.key === 'palm-sunday' || d.season === 'triduum' ||
        d.key === 'saint-11-02' || (mem && (d.kind === 'Memorial' || d.kind === 'Day of Prayer'));
      if (!take) return;
      var a = O.ymd(d.n), b = O.ymd(d.n + 1), f = function (x) { return x[0] + (x[1] < 10 ? '0' : '') + x[1] + (x[2] < 10 ? '0' : '') + x[2]; };
      var summary = d.title + (d.holyDay === 'obligation' ? ' (Holy Day of Obligation)' : '');
      var desc = [d.kind !== 'Weekday' && d.kind !== 'Sunday' ? d.kind : null, colorWords(d), seasonText(d)].filter(Boolean).join(' \u00B7 ') + '.' +
        (d.holyDay && d.holyDay !== 'obligation' && d.holyDay !== 'sunday' ? ' ' + holyText(d.holyDay) + '.' : '') +
        (d.notes.length ? ' ' + d.notes.join(' ') : '') + '\nReadings: ' + d.readings;
      lines.push('BEGIN:VEVENT', 'UID:' + d.date + '-' + d.key + (state.asc ? '-t' : '') + '@fatherstoolbox.com', 'DTSTAMP:' + stamp,
        'DTSTART;VALUE=DATE:' + f(a), 'DTEND;VALUE=DATE:' + f(b), 'SUMMARY:' + icsText(summary), 'DESCRIPTION:' + icsText(desc),
        'URL:https://fatherstoolbox.com/calendar/?date=' + d.date, 'TRANSP:TRANSPARENT', 'END:VEVENT');
    });
    lines.push('END:VCALENDAR');
    return lines.map(fold).join('\r\n') + '\r\n';
  }
  function icsText(s) { return s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n'); }
  function fold(line) { // 75 octets per line, never splitting a character
    var out = '', count = 0;
    for (var i = 0; i < line.length; i++) {
      var ch = line[i], code = line.charCodeAt(i);
      if (code >= 0xd800 && code < 0xdc00) { ch += line[++i]; }
      var bytes = unescape(encodeURIComponent(ch)).length;
      if (count + bytes > 74) { out += '\r\n '; count = 1; }
      out += ch; count += bytes;
    }
    return out;
  }

  /* ---------- Wiring ---------- */
  function draw(focus) { drawBand(); drawMonth(focus); drawDetail(); drawPanels(); writeUrl(); }
  function go(n, focus) {
    var y = O.ymd(n)[0];
    if (y < MIN) n = O.dn(MIN, 1, 1); if (y > MAX) n = O.dn(MAX, 12, 31);
    state.sel = n; draw(focus);
  }
  function stepMonth(k) {
    var a = O.ymd(state.sel), m = a[1] - 1 + k, y = a[0] + Math.floor(m / 12); m = ((m % 12) + 12) % 12;
    var last = O.ymd(O.dn(m === 11 ? y + 1 : y, m === 11 ? 1 : m + 2, 1) - 1)[2];
    go(O.dn(y, m + 1, Math.min(a[2], last)));
  }
  function init() {
    $('lc-month').innerHTML = MONTHS.map(function (m, i) { return '<option value="' + (i + 1) + '">' + m + '</option>'; }).join('');
    var ty = O.ymd(O.today())[0], ys = '';
    for (var y = ty - 1; y <= ty + 5; y++) ys += '<option>' + y + '</option>';
    $('lc-ics-year').innerHTML = ys;
    $('lc-asc').checked = state.asc;

    $('lc-prev').addEventListener('click', function () { stepMonth(-1); });
    $('lc-next').addEventListener('click', function () { stepMonth(1); });
    $('lc-gotoday').addEventListener('click', function () { go(O.today()); });
    $('lc-month').addEventListener('change', function () { var a = O.ymd(state.sel); go(O.dn(a[0], +this.value, 1)); });
    $('lc-yearin').addEventListener('change', function () {
      var y = Math.round(+this.value); if (!(y >= MIN && y <= MAX)) { this.value = O.ymd(state.sel)[0]; return; }
      var a = O.ymd(state.sel); go(O.dn(y, a[1], Math.min(a[2], 28)));
    });
    $('lc-asc').addEventListener('change', function () {
      state.asc = this.checked; try { localStorage.setItem('lc-asc', state.asc ? '1' : '0'); } catch (e) {}
      drawToday(); draw();
    });
    $('lc-grid').addEventListener('click', function (e) {
      var b = e.target.closest('[data-n]'); if (!b) return;
      state.sel = +b.dataset.n; drawMonthSel(); drawDetail(); drawBand(); writeUrl();
      if (window.matchMedia('(max-width: 760px)').matches) $('lc-detail').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    $('lc-grid').addEventListener('keydown', function (e) {
      var k = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[e.key];
      if (k == null && e.key !== 'Home' && e.key !== 'End' && e.key !== 'PageUp' && e.key !== 'PageDown') return;
      e.preventDefault();
      if (e.key === 'PageUp') return stepMonthFocus(-1);
      if (e.key === 'PageDown') return stepMonthFocus(1);
      var n = state.sel + (k || 0);
      if (e.key === 'Home') n = state.sel - O.dow(state.sel);
      if (e.key === 'End') n = state.sel + 6 - O.dow(state.sel);
      var same = O.ymd(n)[1] === O.ymd(state.sel)[1];
      state.sel = n;
      if (same) { drawMonthSel(true); drawDetail(); drawBand(); writeUrl(); } else go(n, true);
    });
    document.addEventListener('click', function (e) {
      var b = e.target.closest('[data-go]'); if (!b) return;
      go(O.parse(b.dataset.go));
      if (b.closest('.lc-panels')) document.querySelector('.lc-toolbar').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    $('lc-ics').addEventListener('click', function () {
      var Y = +$('lc-ics-year').value, mem = $('lc-ics-mem').checked;
      var blob = new Blob([ics(Y, mem)], { type: 'text/calendar;charset=utf-8' }), a = document.createElement('a');
      a.href = URL.createObjectURL(blob); a.download = 'liturgical-calendar-' + Y + (mem ? '-with-memorials' : '') + '.ics';
      document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 0);
    });
    drawToday(); draw();
  }
  function stepMonthFocus(k) { stepMonth(k); var b = $('lc-grid').querySelector('[data-n="' + state.sel + '"]'); if (b) b.focus(); }
  function drawMonthSel(focus) {
    $('lc-grid').querySelectorAll('[data-n]').forEach(function (b) {
      var on = +b.dataset.n === state.sel;
      b.classList.toggle('is-sel', on); b.setAttribute('aria-selected', on); b.tabIndex = on ? 0 : -1;
      if (on && focus) b.focus();
    });
  }
  init();
})();
