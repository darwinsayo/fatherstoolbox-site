/* Checks for public/calendar/ordo.js. Run with: node tests/ordo.test.js
   1. Easter: known dates, and a second, independent computus for every year 1583-4099.
   2. Seasons agree with /liturgy.js (the site's top band) every day from 1970 to 2199.
   3. Rules that only show up in some years (transfers, coincidences), against what the Church actually did.
   4. Every day of 2025, 2026 and 2027 against the USCCB liturgical calendars (tests/usccb/*.txt).
   5. Rubrics (rubrics.js): Gloria, Creed, Alleluia, Masses permitted, penance, psalter week, Evening Prayer. */
'use strict';
const fs = require('fs'), path = require('path');
const O = require('../public/calendar/ordo.js');
const L = require('../public/liturgy.js');
let fails = 0, checks = 0;
function ok(cond, msg) { checks++; if (!cond) { fails++; console.log('FAIL ' + msg); } }

/* 1. Easter */
const KNOWN = { 2000: '04-23', 2008: '03-23', 2011: '04-24', 2016: '03-27', 2019: '04-21', 2022: '04-17', 2024: '03-31', 2025: '04-20',
  2026: '04-05', 2027: '03-28', 2028: '04-16', 2029: '04-01', 2030: '04-21', 2033: '04-17', 2035: '03-25', 2038: '04-25', 2285: '03-22' };
for (const y in KNOWN) ok(O.iso(O.easter(+y)) === y + '-' + KNOWN[y], 'Easter ' + y);
function easterGauss(y) { // Lilius/Clavius epact method (Knuth, TAOCP 1.3.2 ex. 14), independent of Meeus
  const G = y % 19 + 1, C = Math.floor(y / 100) + 1, X = Math.floor(3 * C / 4) - 12, Z = Math.floor((8 * C + 5) / 25) - 5,
    D = Math.floor(5 * y / 4) - X - 10; let E = (11 * G + 20 + Z - X) % 30; if (E < 0) E += 30;
  if ((E === 25 && G > 11) || E === 24) E++;
  let N = 44 - E; if (N < 21) N += 30; N = N + 7 - ((D + N) % 7);
  return N > 31 ? O.dn(y, 4, N - 31) : O.dn(y, 3, N);
}
for (let y = 1583; y < 4100; y++) ok(O.easter(y) === easterGauss(y), 'Easter computus agrees, ' + y);

/* 2. Seasons agree with /liturgy.js */
const MAP = { advent: 'Advent', christmas: 'Christmas', ordinary: 'Ordinary Time', lent: 'Lent', triduum: 'The Sacred Paschal Triduum', easter: 'Easter' };
for (let y = 1970; y < 2200; y++) {
  for (const d of O.year(y)) {
    const a = O.ymd(d.n), s = L.season(new Date(a[0], a[1] - 1, a[2]))[0];
    const mine = d.key === 'pentecost' ? 'Pentecost Sunday' : MAP[d.season];
    ok(s === mine, 'season ' + d.date + ': liturgy.js ' + s + ', ordo ' + mine);
  }
}

/* 3. Rules */
function day(s, opt) { return O.day(O.parse(s), opt); }
function is(s, key, msg, opt) { const d = day(s, opt); ok(d.key === key, (msg || key) + ' on ' + s + ' (got ' + d.key + ': ' + d.title + ')'); }
is('2024-12-09', 'saint-12-08', 'Immaculate Conception transferred to Monday when Dec 8 is an Advent Sunday');
ok(day('2024-12-09').holyDay === 'transferred', 'no obligation for the transferred Immaculate Conception (2024)');
ok(day('2024-12-08').key === 'advent-sunday', 'Second Sunday of Advent kept, 2024');
is('2008-03-15', 'saint-03-19', 'St. Joseph anticipated to the Saturday before Palm Sunday when Mar 19 is in Holy Week (2008)');
is('2035-03-17', 'saint-03-19', 'St. Joseph anticipated (2035, Mar 19 is Monday of Holy Week)');
is('2023-03-20', 'saint-03-19', 'St. Joseph moved to Monday when Mar 19 is a Sunday of Lent (2023)');
is('2008-03-31', 'saint-03-25', 'Annunciation after the Octave of Easter (2008)');
is('2016-04-04', 'saint-03-25', 'Annunciation after the Octave of Easter (2016, Mar 25 was Good Friday)');
is('2024-04-08', 'saint-03-25', 'Annunciation after the Octave of Easter (2024)');
is('2027-04-05', 'saint-03-25', 'Annunciation after the Octave of Easter (2027, Mar 25 is Holy Thursday)');
is('2022-06-23', 'saint-06-24', 'Nativity of St. John the Baptist anticipated when it meets the Sacred Heart (2022)');
is('2022-06-24', 'sacred-heart');
is('2022-12-30', 'holy-family', 'Holy Family on Dec 30 when Christmas is a Sunday (2022)');
is('2021-12-12', 'advent-sunday', 'Our Lady of Guadalupe yields to an Advent Sunday (2021)');
is('2024-01-08', 'baptism', 'Baptism of the Lord on Monday when Epiphany is Jan 7 or 8 (2024)');
is('2023-01-23', 'day-of-prayer', 'Day of Prayer moves to Jan 23 when Jan 22 is a Sunday (2023)');
is('2025-11-02', 'saint-11-02', 'All Souls replaces a Sunday in Ordinary Time (2025)');
is('2025-11-09', 'saint-11-09', 'Dedication of the Lateran replaces a Sunday (2025)');
is('2026-05-14', 'saint-05-14', 'St. Matthias where the Ascension is on Sunday (2026)');
is('2026-05-14', 'ascension', 'Ascension Thursday in the five provinces (2026)', { ascensionThursday: true });
is('2026-05-17', 'easter-sunday', 'Seventh Sunday of Easter in the five provinces (2026)', { ascensionThursday: true });
ok(day('2026-05-14', { ascensionThursday: true }).holyDay === 'obligation', 'Ascension Thursday is a holy day where kept');
ok(day('2026-08-15').holyDay === 'abrogated', 'Assumption on Saturday: obligation lifted (2026)');
ok(day('2027-11-01').holyDay === 'abrogated', 'All Saints on Monday: obligation lifted (2027)');
ok(day('2027-12-25').holyDay === 'obligation', 'Christmas on Saturday is still a holy day (2027)');
ok(day('2022-12-08').holyDay === 'obligation', 'Immaculate Conception on Thursday is a holy day');
ok(day('2029-12-08').holyDay === 'obligation', 'Immaculate Conception on Saturday is still a holy day (2029)');
ok(day('2026-01-01').sundayCycle === 'A' && day('2026-01-01').weekdayCycle === 'II', 'cycles 2026: A, II');
ok(day('2026-11-29').sundayCycle === 'B' && day('2026-11-29').weekdayCycle === 'I', 'cycles from Advent 2026: B, I');
ok(day('2026-11-23').week === 34, 'last week of Ordinary Time is the 34th (2026)');
ok(day('2026-05-25').week === 8, 'Ordinary Time resumes in week 8 after Pentecost (2026)');
ok(day('2025-06-16').week === 11 && day('2025-06-23').week === 12 && day('2025-06-30').week === 13, 'OT weeks after Pentecost (2025, as printed by USCCB)');
ok(day('2025-01-13').week === 1 && day('2026-01-12').week === 1, 'OT week 1 begins the day after the Baptism');
ok(day('2024-01-09').week === 1 && day('2024-01-14').week === 2, 'OT week 1 begins Tuesday when the Baptism is on Monday (2024)');
for (let y = 1970; y < 2200; y++) {
  const ys = O.year(y);
  ok(ys.every(d => d.title && d.colors.length && d.seasonName), 'every day has a title and color, ' + y);
  const ck = ys.find(d => d.key === 'christ-the-king'); ok(ck && ck.dow === 0, 'Christ the King on a Sunday, ' + y);
  ok(ys.filter(d => d.key === 'saint-03-19').length === 1 && ys.filter(d => d.key === 'saint-03-25').length === 1 &&
     ys.filter(d => d.key === 'saint-12-08').length === 1 && ys.filter(d => d.key === 'saint-06-24').length <= 1, 'solemnities kept exactly once, ' + y);
  const ots = ys.filter(d => d.season === 'ordinary' && d.week != null);
  ok(ots.every(d => d.week >= 1 && d.week <= 34), 'OT weeks within 1-34, ' + y);
}

/* 5. Rubrics */
const R = require('../public/calendar/rubrics.js');
function rub(s, opt) { const d = day(s, opt); return { d, a: R.altar(d), h: R.hours(d, opt || {}) }; }
const has = (r, t) => r.a.tags.includes(t);
const item = (r, k, label) => (r[k].items.find(i => i.label === label) || {}).text || '';
let x;
x = rub('2026-11-15'); ok(has(x, 'Gloria') && has(x, 'Creed') && has(x, 'Alleluia'), 'OT Sunday: Gloria, Creed, Alleluia');
x = rub('2026-11-16'); ok(has(x, 'No Gloria') && !has(x, 'Creed'), 'OT weekday: no Gloria, no Creed');
x = rub('2026-11-29'); ok(has(x, 'No Gloria') && has(x, 'Creed') && has(x, 'No funeral Mass'), 'Advent Sunday: no Gloria, Creed, no funeral Mass');
x = rub('2026-12-08'); ok(has(x, 'Gloria') && has(x, 'Creed') && has(x, 'No funeral Mass'), 'Immaculate Conception: Gloria, Creed, no funeral Mass (holy day)');
x = rub('2027-02-10'); ok(has(x, 'No Gloria') && has(x, 'No Alleluia') && has(x, 'Fast and abstinence') && /not permitted/i.test(item(x, 'a', 'Weddings and other ritual Masses')), 'Ash Wednesday');
x = rub('2027-02-12'); ok(has(x, 'Abstinence'), 'Friday in Lent: abstinence');
x = rub('2027-03-19'); ok(has(x, 'Gloria') && has(x, 'Creed') && has(x, 'No Alleluia') && /does not apply/.test(item(x, 'a', 'Fasting and abstinence')), 'St Joseph on a Lenten Friday: Gloria, Creed, no Alleluia, no abstinence (2027)');
x = rub('2027-03-07'); ok(/Rose/.test(item(x, 'a', 'Vestments')) && /Laetare/.test(item(x, 'a', 'Flowers and music')), 'Laetare Sunday: rose, flowers');
x = rub('2027-03-25'); ok(has(x, 'Gloria') && has(x, 'No Alleluia') && !has(x, 'Creed'), 'Holy Thursday: Gloria, no Alleluia, no Creed');
x = rub('2027-03-26'); ok(has(x, 'No Mass') && has(x, 'Fast and abstinence'), 'Good Friday: no Mass, fast');
x = rub('2027-03-28'); ok(has(x, 'Sequence') && has(x, 'Creed') && has(x, 'No funeral Mass'), 'Easter Sunday: Sequence, Creed, no funeral Mass');
x = rub('2027-03-29'); ok(has(x, 'Gloria') && !has(x, 'Creed') && /Optional/.test(item(x, 'a', 'Sequence')) && /not permitted/i.test(item(x, 'a', 'Weddings and other ritual Masses')), 'Easter Monday: Gloria, no Creed, optional Sequence, no ritual Mass');
x = rub('2026-12-29'); ok(has(x, 'Gloria') && !has(x, 'Creed'), 'Christmas octave weekday: Gloria, no Creed');
x = rub('2026-11-02'); ok(has(x, 'No Gloria') && /black/.test(item(x, 'a', 'Vestments')), 'All Souls: no Gloria, black permitted');
x = rub('2026-11-16'); ok(/^Permitted/.test(item(x, 'a', 'Votive Masses and Masses for various needs')), 'OT weekday: votive Masses permitted');
x = rub('2026-11-13'); ok(/real necessity/.test(item(x, 'a', 'Votive Masses and Masses for various needs')), 'obligatory memorial: votive only for real necessity');
x = rub('2026-08-15'); ok(!has(x, 'No funeral Mass'), 'Assumption on Saturday 2026, obligation lifted: funeral Mass permitted');
x = rub('2026-11-20'); ok(/encouraged/.test(item(x, 'a', 'Fasting and abstinence')), 'ordinary Friday: penance');
/* Psalter weeks checked against Universalis (US calendar): 2026-11-14 IV, 2026-11-29 I, 2026-12-10 II, 2027-02-10 IV */
for (const [s, w] of [['2026-11-14', 'IV'], ['2026-11-29', 'I'], ['2026-12-10', 'II'], ['2027-02-10', 'IV'],
  ['2027-02-14', 'I'], ['2027-03-22', 'II'], ['2027-04-04', 'II'], ['2027-04-25', 'I'], ['2026-05-25', 'IV'], ['2025-06-09', 'II']])
  ok(R.psalter(day(s)) === w, 'psalter week ' + s + ': ' + w + ' (got ' + R.psalter(day(s)) + ')');
x = rub('2026-11-21'); ok(/Evening Prayer I of Our Lord Jesus Christ/.test(item(x, 'h', 'This evening')), 'EP I of Christ the King on Saturday');
x = rub('2026-12-24'); ok(/Evening Prayer I of The Nativity/.test(item(x, 'h', 'This evening')), 'EP I of Christmas');
x = rub('2026-12-07'); ok(/Evening Prayer I of The Immaculate/.test(item(x, 'h', 'This evening')), 'EP I of the Immaculate Conception');
x = rub('2026-08-05'); ok(!/Evening Prayer I/.test(item(x, 'h', 'This evening')), 'no EP I before a feast (Transfiguration on Thursday)');
x = rub('2027-02-13'); ok(/Evening Prayer I of First Sunday of Lent/.test(item(x, 'h', 'This evening')), 'EP I of a Lenten Sunday');
for (let y = 2020; y < 2040; y++) for (const d of O.year(y)) {
  const a = R.altar(d), h = R.hours(d, {});
  ok(a.items.length && h.items.length && a.items.every(i => i.text) && h.items.every(i => i.text), 'rubrics complete ' + d.date);
}

/* 4. USCCB 2025-2027, day by day */
const STOP = new Set(['st', 'sts', 'saint', 'saints', 'bl', 'blessed', 'the', 'of', 'and', 'a', 'in', 'bvm', 'blessed', 'virgin', 'mary', 'lord', 'day', 'sunday', 'weekday', 'week',
  'apostle', 'apostles', 'evangelist', 'martyr', 'martyrs', 'companions', 'priest', 'bishop', 'pope', 'doctor', 'church', 'religious', 'abbot', 'within', 'usa', 'our', 'lady']);
const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter(w => w && !STOP.has(w));
function same(a, b) { const A = norm(a), B = new Set(norm(b)); return A.length === 0 || B.size === 0 ? norm(a).join() === norm(b).join() : A.some(w => B.has(w)); }
const RANK = k => ({ Solemnity: 'Solemnity', Feast: 'Feast', Memorial: 'Memorial' })[k] || 'none';
const report = [];
for (const Y of [2025, 2026, 2027]) {
  const lines = fs.readFileSync(path.join(__dirname, 'usccb', Y + '.txt'), 'utf8').split('\n').filter(l => /^\d\d-\d\d \|/.test(l));
  let diffs = 0;
  for (const line of lines) {
    const summary = /\(S\)\s*$/.test(line), f = line.replace(/\(S\)\s*$/, '').split('|').map(s => s.trim());
    const d = day(Y + '-' + f[0]), problems = [];
    if (RANK(d.kind) !== f[2]) problems.push('rank ' + f[2] + ' / ordo ' + d.kind);
    const fc = f[3].includes(' or ') ? f[3].split(' or ').sort().join(' or ') : f[3];
    const mc = d.colorOr ? d.colors.slice().sort().join(' or ') : d.colors.join('/');
    if (fc !== mc) problems.push('colors ' + f[3] + ' / ordo ' + mc);
    const fo = f[4] === '-' ? [] : f[4].split(';').map(s => s.trim());
    const mo = d.options.map(o => o.key === 'bvm-saturday' ? 'BVM' : o.short);
    const unmatched = fo.filter(x => !mo.some(y => (x === 'BVM') === (y === 'BVM') && (x === 'BVM' || same(x, y))));
    const extra = mo.filter(y => !fo.some(x => (x === 'BVM') === (y === 'BVM') && (x === 'BVM' || same(x, y))));
    if (unmatched.length || extra.length) problems.push('optional ' + (fo.join('; ') || '-') + ' / ordo ' + (mo.join('; ') || '-'));
    const generic = /^(weekday|christmas weekday|lenten weekday|easter weekday|advent weekday|octave of easter)$/i.test(f[1]);
    const nth = /^(\d+)(st|nd|rd|th) Sun/.exec(f[1]);
    if (generic || nth) { if (d.sanctoral || (nth && (d.dow !== 0 || d.week !== +nth[1]))) problems.push('title ' + f[1] + ' / ordo ' + d.title); }
    else if (!same(f[1], d.title)) problems.push('title ' + f[1] + ' / ordo ' + d.title);
    checks++;
    if (problems.length) { diffs++; report.push(Y + '-' + f[0] + (summary ? ' (summary line)' : '') + ': ' + problems.join('; ')); }
  }
  console.log('USCCB ' + Y + ': ' + lines.length + ' days compared, ' + diffs + ' differences');
}
if (report.length) console.log(report.join('\n'));
console.log(checks + ' checks, ' + fails + ' failures, ' + report.length + ' USCCB differences');
process.exit(fails || report.length ? 1 : 0);
