// Checks for the fill-in-the-blank homily (public/homily/homily.js). Run: node tests/homily.test.js
const H = require('../public/homily/homily.js');
let fails = 0;
const ok = (c, m) => { if (!c) { fails++; console.log('FAIL', m); } };

// Every word the page can pick by itself passes the filter, and every template fills cleanly.
for (const k of Object.keys(H.WORDS)) for (const w of H.WORDS[k]) ok(H.check(w) === null, `surprise word "${w}" (${k}) is flagged`);
for (const t of H.TEMPLATES) {
  for (const s of t.sections) ok(H.check(s[1].replace(/\{[^}]+\}/g, '')) !== 'rude', `template ${t.id} has rude words`);
  for (let i = 0; i < 200; i++) {
    const v = {}; for (const k of H.fieldsOf(t)) v[k] = H.pick(H.WORDS[k]);
    const txt = H.toText(H.build(t, v));
    ok(!/[{}]/.test(txt), `${t.id} left a blank unfilled`);
    ok(!/\b(a|an) (a|an) /.test(txt) && !/\ba [aeiou]/i.test(txt.replace(/\ba (one|uni|use|eu)/gi, '')), `${t.id} article: ${txt.match(/\ba [aeiou]\w*/i)}`);
    ok(!/\.\.|\.”\./.test(txt), `${t.id} double punctuation`);
  }
  ok(H.SAINTS.some(s => s[0] === t.saint), `${t.id} default saint missing`);
}

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
