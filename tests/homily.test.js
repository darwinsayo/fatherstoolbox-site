// Checks for the fill-in-the-blank homily (public/homily/homily.js). Run: node tests/homily.test.js
const H = require('../public/homily/homily.js');
let fails = 0;
const ok = (c, m) => { if (!c) { fails++; console.log('FAIL', m); } };

// Every word the page can pick by itself passes the filter, and every template fills cleanly.
for (const k of Object.keys(H.WORDS)) ok(H.FIELDS[k], `word list ${k} has no field`);
for (const k of Object.keys(H.WORDS)) for (const w of H.WORDS[k]) ok(H.check(w) === null, `surprise word "${w}" (${k}) is flagged`);
const SACRED = /\b(eucharist|host|hosts|communion|consecrat\w*|tabernacle|chalice|monstrance|crucifix|gospel|scripture|rosary|sacrament\w*|confession|baptism|ordination|priest\w*|god|jesus|christ|lord|mary|mass|amen|alleluia|heaven|satan|devil|prayer|prayers)\b/i;
const ids = new Set();
ok(H.TEMPLATES.length >= 14, 'at least 14 templates');
for (const t of H.TEMPLATES) {
  ok(!ids.has(t.id), `duplicate template id ${t.id}`); ids.add(t.id);
  ok(t.name && t.voice && t.desc && t.kicker && t.group && t.format, `${t.id} is missing a name, voice, description, kicker, group or format`);
  for (const x of H.texts(t)) {
    ok(H.check(x.replace(/\{[^}]+\}/g, '')) !== 'rude', `template ${t.id} has rude words`);
    const m = x.replace(/\{[^}]+\}/g, ' ').match(SACRED);
    ok(!m, `template ${t.id} mentions a sacred word: ${m && m[0]}`);
    (x.match(/\{(?:a:)?(\w+)\}/g) || []).forEach(b => ok(H.WORDS[b.replace(/[{}]|a:/g, '')], `${t.id} uses unknown blank ${b}`));
  }
  for (let i = 0; i < 200; i++) {
    const v = H.surprise(t);
    const txt = H.toText(H.build(t, v));
    ok(!/[{}]/.test(txt), `${t.id} left a blank unfilled`);
    ok(!/\b(a|an) (a|an) /.test(txt) && !/\ba [aeiou]/i.test(txt.replace(/\ba (one|uni|use|eu)/gi, '')), `${t.id} article: ${txt.match(/\ba [aeiou]\w*/i)}`);
    ok(!/\.\.|\.”\./.test(txt), `${t.id} double punctuation`);
    ok(!SACRED.test(txt.replace(/\bSt\. [\w .]+, patron of [\w ]+, pray for us\./, '')), `${t.id} output has a sacred word: ${txt.match(SACRED)}`);
    if (t.id === 'mystery' || t.id === 'story') ok(/^The /.test(txt), `${t.id} title`);
    if (v.adj2 !== undefined && v.adj !== undefined) ok(v.adj !== v.adj2, `${t.id} repeated an adjective`);
    if (v.number2 !== undefined && v.number !== undefined) ok(v.number !== v.number2, `${t.id} repeated a number`);
  }
  if (t.saint) ok(H.SAINTS.some(s => s[0] === t.saint), `${t.id} default saint missing`);
  else ok(!H.build(t, H.surprise(t)).invocation, `${t.id} should have no invocation`);
}

// The templates really are different: different shapes, lengths, blanks and endings.
const shape = t => [t.format, t.sections.length, H.fieldsOf(t).join(',')].join('|');
ok(new Set(H.TEMPLATES.map(shape)).size === H.TEMPLATES.length, 'two templates share a shape');
ok(new Set(H.TEMPLATES.map(t => t.format)).size >= 7, 'at least 7 different formats');
ok(new Set(H.TEMPLATES.map(t => t.sections.length)).size >= 5, 'at least 5 different lengths');
ok(new Set(H.TEMPLATES.map(t => H.fieldsOf(t).length)).size >= 6, 'at least 6 different blank counts');
ok(new Set(H.TEMPLATES.map(t => t.closing || t.saint)).size >= 10, 'endings are too alike');
const titles = new Set(); H.TEMPLATES.forEach(t => titles.add(t.title)); ok(titles.size === H.TEMPLATES.length, 'titles repeat');

// The filter: rude and holy words are caught, ordinary parish words are not.
const rude = ['sh1t', 'F U C K', 'what the hell', 'damned', 'asses', 'bullshit'];
const holy = ['Jesus', 'eucharist', 'the Host', 'holy water', 'Mary', 'chalices', 'OMG', 'praying', 'St. Anthony'];
const fine = ['class', 'hello kitty', 'deviled eggs', "devil's food cake", 'angel food cake', 'massive', 'Christmas cookies', 'cocktail weenies', 'assistant', 'hosta', 'push it', 'shiitake', 'landlord', 'Dickens', 'bassoon', 'cross', 'Let’s keep it moving'];
for (const w of rude) ok(H.check(w) === 'rude', `"${w}" should be rude, got ${H.check(w)}`);
for (const w of holy) ok(H.check(w) === 'holy', `"${w}" should be holy, got ${H.check(w)}`);
for (const w of fine) ok(H.check(w) === null, `"${w}" should be fine, got ${H.check(w)}`);

// Sayings get quotes and closing punctuation.
ok(H.tidy('saying', 'okay folks') === '“Okay folks.”', 'saying tidy');
ok(H.tidy('saying', '"Who parked in my spot?"') === '“Who parked in my spot?”', 'saying tidy keeps ?');
ok(H.article('umbrella') === 'an' && H.article('unicorn') === 'a' && H.article('hour') === 'an', 'articles');

console.log(fails ? `${fails} failed` : 'All homily checks passed');
process.exit(fails ? 1 : 0);
