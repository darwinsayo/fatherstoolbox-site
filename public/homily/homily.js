/* The fill-in-the-blank homily: a lighthearted look at parish life.
   Everything runs in the visitor's browser. Nothing typed here is sent or stored anywhere.

   Content rules (please keep them when adding a template):
   - The humor is about everyday parish life: parking, coffee and donuts, long announcements,
     the thermostat, potlucks, the second collection. Never about the Mass, the Eucharist,
     the sacraments, Scripture, Our Lord, Our Lady, the saints, prayer, or the priesthood
     and religious life as such, and never about real people.
   - A blank never lands in a sentence about anything sacred. Saints come only from the curated
     list below, with their real patronages, and appear only in a sincere closing invocation.
   - Typed words pass a family-friendly filter, and holy words are kept out of the silly blanks.
   - Every output says it is for fun and is not a real homily. */
(function (root) {
  'use strict';

  /* ---------- The blanks ---------- */
  var FIELDS = {
    adj:    { label: 'An adjective', hint: 'a describing word, like sticky or dignified', max: 30 },
    noun:   { label: 'A thing', hint: 'a noun, like stapler or lawn mower', max: 30 },
    nouns:  { label: 'Some things (plural)', hint: 'like traffic cones or name tags', max: 30 },
    verb:   { label: 'An activity ending in -ing', hint: 'like whistling or parallel parking', max: 30 },
    food:   { label: 'A food', hint: 'like goetta or lemon bars', max: 30 },
    dish:   { label: 'A potluck dish', hint: 'like green bean casserole', max: 40 },
    place:  { label: 'A place around the parish', hint: 'like the parish hall or the parking lot', max: 30 },
    animal: { label: 'An animal', hint: 'like a squirrel or a goose', max: 30 },
    sport:  { label: 'A sport or game', hint: 'like pickleball or euchre', max: 30 },
    adj2:   { label: 'Another adjective', hint: 'like squeaky or lukewarm', max: 30 },
    number: { label: 'A number', hint: 'any whole number, like 12', max: 4, numeric: true },
    saying: { label: 'Something your pastor always says', hint: 'like “Let’s keep it moving”', max: 80 }
  };
  var ORDER = ['adj', 'noun', 'nouns', 'verb', 'food', 'dish', 'place', 'animal', 'sport', 'adj2', 'number', 'saying'];

  /* For "Surprise me" and for any blank left empty. Parish-life words only; tests check them against the filter. */
  var WORDS = {
    adj: ['sticky', 'enormous', 'lukewarm', 'squeaky', 'mysterious', 'wobbly', 'dignified', 'crunchy', 'slightly damp', 'beige', 'heroic', 'overly cheerful', 'suspicious', 'laminated', 'fluffy', 'majestic'],
    noun: ['folding chair', 'coffee urn', 'stapler', 'extension cord', 'lawn mower', 'thermostat remote', 'card table', 'fruitcake', 'umbrella', 'clipboard', 'crockpot', 'leaf blower', 'traffic cone', 'bake sale sign', 'snow shovel'],
    nouns: ['folding chairs', 'name tags', 'raffle tickets', 'casserole dishes', 'coffee filters', 'extension cords', 'paper plates', 'sign-up sheets', 'traffic cones', 'ping-pong balls', 'lawn chairs', 'rubber bands', 'mismatched mittens', 'mystery keys'],
    verb: ['whistling', 'parallel parking', 'stacking chairs', 'juggling', 'power walking', 'humming', 'alphabetizing', 'mopping', 'tap dancing', 'clipping coupons', 'untangling extension cords', 'yodeling'],
    food: ['donuts', 'goetta', 'kolaches', 'pierogi', 'sloppy joes', 'deviled eggs', 'lemon bars', 'coffee cake', 'cheese cubes', 'mostaccioli', 'potato salad', 'fruit punch', 'pretzels', 'cabbage rolls'],
    dish: ['green bean casserole', 'seven-layer dip', 'mac and cheese', 'ambrosia salad', 'tuna noodle casserole', 'scalloped potatoes', 'sheet cake', 'crockpot meatballs', 'baked beans', 'pasta salad', 'cheesy potatoes', 'lime gelatin salad'],
    place: ['parish hall', 'church basement', 'parking lot', 'rectory kitchen', 'school gym', 'coat room', 'parish office', 'supply closet', 'bingo hall'],
    animal: ['squirrel', 'raccoon', 'goose', 'golden retriever', 'pigeon', 'wild turkey', 'stray cat', 'possum', 'very confident duck'],
    sport: ['pickleball', 'bowling', 'curling', 'cornhole', 'golf', 'bocce', 'euchre', 'shuffleboard', 'softball', 'bingo'],
    adj2: ['sticky', 'squeaky', 'lukewarm', 'fluffy', 'crunchy', 'festive', 'polka-dotted', 'cozy', 'extra-long', 'sensible', 'majestic', 'reversible'],
    number: ['3', '7', '12', '14', '27', '50', '112', '400'],
    saying: ['Let’s keep it moving', 'This won’t take long', 'Grab a donut on your way out', 'We’ll talk about that at the parish council', 'Brief announcements, I promise', 'Okay, folks', 'Many hands make light work', 'Remember to sign up', 'Who parked in my spot?', 'It is what it is', 'Let’s circle back to that']
  };

  /* Patron saints with their traditional patronages. Used only in a sincere closing invocation. */
  var SAINTS = [
    ['philip-neri', 'St. Philip Neri', 'joy'],
    ['lawrence', 'St. Lawrence', 'cooks'],
    ['martha', 'St. Martha', 'cooks and servers'],
    ['christopher', 'St. Christopher', 'travelers'],
    ['anthony', 'St. Anthony of Padua', 'lost things'],
    ['cecilia', 'St. Cecilia', 'musicians'],
    ['peter', 'St. Peter', 'fishermen'],
    ['matthew', 'St. Matthew', 'accountants'],
    ['joseph', 'St. Joseph', 'workers'],
    ['john-vianney', 'St. John Vianney', 'parish priests'],
    ['francis-de-sales', 'St. Francis de Sales', 'writers'],
    ['vincent-de-paul', 'St. Vincent de Paul', 'works of charity']
  ];

  /* ---------- The templates ----------
     {word} is a blank. {a:word} adds "a" or "an". Section labels are fixed. */
  var TEMPLATES = [
    {
      id: 'sunday', name: 'Sunday homily', voice: 'Gentle deadpan', saint: 'philip-neri',
      title: 'Three Brief Points, Approximately',
      sections: [
        ['The opening', 'Good morning. Before I begin: would the owner of {a:adj} {noun} parked across three spaces near the {place} please see an usher. It is not in trouble. It just looks lonely. Now, I have three brief points this morning. In the spirit of honesty, two of them are not brief.'],
        ['First', 'Life is a lot like {sport}. Nobody fully understands the rules, everybody’s uncle says he used to be very good at it, and sooner or later somebody brings out {food}.'],
        ['Second', 'This week I counted {number} {nouns} in the {place}. Nobody knows whose they are. Nobody has asked. I believe they are ours now, and I believe that is what community means.'],
        ['Third, the long one', 'The thermostat. Some of you feel it is too {adj2} in here. Others feel it is not nearly {adj2} enough. You are, somehow, both right. The parish council formed a committee, the committee formed opinions, and the thermostat now has a lock box.'],
        ['A story', 'As I like to say, and I’m told I say it a lot, {saying} The parish office keeps a jar. Every time I say it, somebody puts in a quarter. That jar has paid for the lock box.'],
        ['In conclusion', 'So, in conclusion. And, in further conclusion: coffee and donuts are in the {place}. The second collection today is for the {food} fund. And to whoever owns the {adj} {noun}: it is still out there, waiting for you. We all are.']
      ]
    },
    {
      id: 'christmas', name: 'Christmas', voice: 'Warm storyteller', saint: 'christopher',
      title: 'Christmas, With Extra Folding Chairs',
      sections: [
        ['The opening', 'Merry Christmas! It does my heart good to see this church so full. If you are visiting, welcome. If someone is sitting in your usual pew, welcome to you too; you may offer it up. The ushers have set out {number} extra folding chairs, and in the coat room they found {a:adj} {noun}, which they would like to return to its owner before Epiphany.'],
        ['First', 'The parking lot. Our parking volunteers have been {verb} since dawn. They are cold, they are brave, and they have seen things. When you leave tonight, be patient. Everyone in that lot is trying to get home to someone they love, and to the {food}.'],
        ['Second', 'The cookies. The Altar Society has baked enough {adj2} cookies for this parish, the next parish over, and possibly the diocese. They ask only that you take no more than {number}, and that you not hide extras in your coat. They know about the coat.'],
        ['Third', 'The choir has been rehearsing since August. Near the end of the last carol they are going to change key. You will feel it coming. Hold on to the pew in front of you and trust them. They tell me it is going to be {adj}. I have chosen to believe them.'],
        ['A story', 'When I was a boy, my grandmother made {dish} every Christmas Eve. Every year it came out {adj}, and every year my grandfather said it was her best one yet. I didn’t understand that then. I do now. Love doesn’t always turn out the way the recipe says. It shows up anyway, every year, with a serving spoon.'],
        ['In conclusion', 'As I like to say, {saying} Merry Christmas to you and to everyone you love. Drive gently out of the lot. And if that {noun} in the coat room is yours, the ushers would like a word.']
      ]
    },
    {
      id: 'lent', name: 'Lent and the fish fry', voice: 'Fired-up coach', saint: 'peter',
      title: 'Lent Is Game Day',
      sections: [
        ['The opening', 'Brothers and sisters, it is Lent, and I am fired up! Forty days. Six fish fries. One parish. The fish fry committee has been in training since January. They have ordered {number} pounds of cod and, for reasons they will not discuss, a case of {food}.'],
        ['First', 'What are you giving up? Last year I gave up {nouns}. I made it to the second Tuesday. That is not a failure, folks. That is a personal best.'],
        ['Second', 'The fish fry needs volunteers who are good at {verb}. No experience needed. Aprons provided. Hairnets are mandatory, and yes, that includes the parish council president. Especially the parish council president.'],
        ['Third', 'The Friday soup supper. This year it is {adj} soup. Last year it was {adj} soup. Next year it will be {adj} soup. Consistency is also a virtue.'],
        ['A story', 'When I was a boy, I gave up {food} for Lent and lasted about {number} hours. I went to my grandmother, ashamed. She handed me a dish towel and said, “Then start again tomorrow. And dry these.” I have been starting again ever since. Some years I am still drying.'],
        ['In conclusion', 'As I like to say, {saying} Now get out there! Fish fry, Friday, five o’clock, in the {place}. Bring {a:adj2} appetite and a folding chair. Let’s go!']
      ]
    },
    {
      id: 'potluck', name: 'Potluck announcements', voice: 'Committee deadpan', saint: 'martha',
      title: 'A Few Brief Announcements About the Potluck',
      sections: [
        ['The opening', 'Good morning! Just a few brief announcements, which, as you know, means {number}.'],
        ['First', 'The parish potluck is next Sunday in the {place}. Last names A through M, please bring {dish}. N through Z, please bring {nouns}. We are not sure why we asked for that, but the sign-up sheet has been printed and we are committed now.'],
        ['Second', 'We still need volunteers for setup, cleanup, and {verb}. We also need one brave person to keep the {animal} out of the kitchen. We don’t know how it keeps getting in. We have stopped asking.'],
        ['Third', 'The {adj} casserole dish from last year’s potluck is still in the hall freezer. The name on the masking tape has worn off. If it is yours, please take it home. It has been here longer than the associate pastor.'],
        ['A story', 'Last year, someone brought {food} shaped like {a:noun}. Nobody signed up for it. Nobody knows who made it. Everybody went back for seconds. It is still the most talked-about dish in parish history, and the committee would love the recipe.'],
        ['In conclusion', 'As Father always says, {saying} The sign-up sheet is on the table in the back. Please use the pen on the string. The pen on the string has outlasted {number} parish council presidents and deserves our respect.']
      ]
    },
    {
      id: 'welcome', name: 'Welcome, new associate pastor', voice: 'Gentle roast of the parish', saint: 'john-vianney',
      title: 'Welcome, Father! A Few Things You Should Know',
      sections: [
        ['The opening', 'Before everyone heads over for coffee, please join me in welcoming our new associate pastor. He arrived on Tuesday with a car full of books, {a:adj} {noun}, and the calm look of a man who has not yet been to a parish council meeting.'],
        ['First', 'Father, in your first week you have already learned three things. First: the door to the {place} sticks. You have to lift, pull, and think about {verb}, all at the same time. Nobody knows why. Please do not call the diocese about it.'],
        ['Second', 'The thermostat. There is a war on, Father, and it started long before you got here. There are two sides. You will be tempted to choose one. Don’t. Just quietly keep {a:adj2} sweater in your office.'],
        ['Third', 'At every potluck, you take a little of the {dish}. You always take a little of the {dish}. The person who made it is watching, and so is everyone else.'],
        ['A story', 'When I was newly ordained, my first pastor handed me a ring of {number} keys and said, {saying} To this day I don’t know what most of those keys open. Father, here is your ring of keys. There are more of them now.'],
        ['In conclusion', 'He enjoys {sport} and {food}, and he has promised the parish council that his homilies will stay under {number} minutes. We have it in writing. Welcome, Father. We are so glad you are here.']
      ]
    }
  ];

  /* ---------- Keeping it clean ----------
     Language we never print. Kept in ROT13 so the page source stays clean to read. */
  function rot13(s) { return s.replace(/[a-z]/g, function (c) { return String.fromCharCode((c.charCodeAt(0) - 84) % 26 + 97); }); }
  var ROOTS = 'shpx fuvg phag avtt snttbg juber cbea ovgpu zbgureshpx'.split(' ').map(rot13);            // matched inside any word
  var CURSES = ('nff nffubyr qnza uryy penc cvff qvpx pbpx chffl fyhg sng gjng jnax obyybpxf ohttre qbhpur wnpxnff qhznff ' +
    'ohgg obbo gvg frk frkl abbqr ahqr anxrq cravf intvan cbbc sneg ergneq ovgpu oybbql fperj').split(' ').map(rot13); // whole words
  /* Holy words stay out of the silly blanks, out of reverence. */
  var HOLY = ['god', 'gods', 'jesus', 'christ', 'lord', 'mary', 'virgin', 'trinity', 'eucharist', 'communion', 'host', 'sacrament',
    'consecration', 'consecrated', 'tabernacle', 'chalice', 'monstrance', 'altar', 'crucifix', 'bible', 'gospel', 'scripture', 'psalm',
    'mass', 'baptism', 'confession', 'confirmation', 'ordination', 'priest', 'priesthood', 'nun', 'bishop', 'pope', 'deacon', 'saint',
    'st', 'rosary', 'prayer', 'pray', 'amen', 'alleluia', 'hallelujah', 'heaven', 'satan', 'devil', 'demon', 'lucifer', 'omg', 'jeez',
    'geez', 'jeezus', 'gawd', 'holy', 'blessed', 'sacred', 'apostle', 'crucified', 'resurrection'];
  var ALLOWED = [/\bdevil'?s food\b/g, /\bdeviled\b/g, /\bangel food\b/g, /\bholy cannoli\b/g];
  var LEET = { '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's', '7': 't', '@': 'a', '$': 's', '!': 'i', '+': 't' };

  function stems(w) {
    var out = [w];
    [['ing', ''], ['ed', ''], ['es', ''], ['s', ''], ["'s", '']].forEach(function (p) {
      if (w.length > p[0].length + 1 && w.slice(-p[0].length) === p[0]) out.push(w.slice(0, -p[0].length) + p[1]);
    });
    return out;
  }
  /* Returns null when the word is fine, 'rude' or 'holy' when it is not. */
  function check(text) {
    var t = String(text || '').toLowerCase().replace(/[‘’]/g, "'");
    ALLOWED.forEach(function (re) { t = t.replace(re, ' '); });
    var forms = [t, t.replace(/[013457@$!+]/g, function (c) { return LEET[c]; })];
    if (/^\s*(\S[\s.\-_*]+){2,}\S\s*$/.test(t)) forms.push(forms[1].replace(/[^a-z]/g, ''));   // s.p.a.c.e.d letters
    for (var f = 0; f < forms.length; f++) {
      var words = forms[f].split(/[^a-z']+/).filter(Boolean);
      for (var i = 0; i < words.length; i++) {
        var w = words[i].replace(/^'+|'+$/g, '');
        for (var r = 0; r < ROOTS.length; r++) if (w.indexOf(ROOTS[r]) > -1) return 'rude';
        var s = stems(w);
        for (var k = 0; k < s.length; k++) {
          if (CURSES.indexOf(s[k]) > -1) return 'rude';
          if (HOLY.indexOf(s[k]) > -1) return 'holy';
        }
      }
      if (/\bholy (spirit|ghost|water|family|communion|orders|week|mother)\b/.test(forms[f])) return 'holy';
    }
    return null;
  }

  /* ---------- Building a homily ---------- */
  function article(w) {
    var l = w.toLowerCase();
    if (/^(one|uni[^nmd]|use|eu|ewe|u[bcfhjkqrstn][aeiou])/.test(l)) return 'a';
    if (/^(hour|honest|honor|heir)/.test(l)) return 'an';
    return /^[aeiou]/.test(l) ? 'an' : 'a';
  }
  function tidy(key, v) {
    v = String(v || '').replace(/\s+/g, ' ').trim();
    if (key === 'saying') {
      v = v.replace(/^["“”'‘’]+|["“”'‘’]+$/g, '').trim();
      if (!v) return v;
      v = v.charAt(0).toUpperCase() + v.slice(1);
      if (!/[.!?]$/.test(v)) v += '.';
      return '“' + v + '”';
    }
    return v;
  }
  function fieldsOf(t) {
    var used = {};
    t.sections.forEach(function (s) { s[1].replace(/\{(?:a:)?(\w+)\}/g, function (_, k) { used[k] = 1; }); });
    return ORDER.filter(function (k) { return used[k]; });
  }
  function saintById(id) { for (var i = 0; i < SAINTS.length; i++) if (SAINTS[i][0] === id) return SAINTS[i]; return SAINTS[0]; }
  function pick(list, rnd) { return list[Math.floor((rnd || Math.random)() * list.length)]; }
  /* Fill a template. Returns sections as arrays of pieces: plain strings, or {blank, text} for the filled words. */
  function build(t, values, saintId) {
    var sections = t.sections.map(function (s) {
      var pieces = [], last = 0, re = /\{(a:)?(\w+)\}/g, m;
      while ((m = re.exec(s[1]))) {
        if (m.index > last) pieces.push(s[1].slice(last, m.index));
        var v = tidy(m[2], values[m[2]]);
        if (m[1]) pieces.push(article(v) + ' ');
        pieces.push({ blank: m[2], text: v });
        last = re.lastIndex;
      }
      if (last < s[1].length) pieces.push(s[1].slice(last));
      return { label: s[0], pieces: pieces };
    });
    var st = saintById(saintId || t.saint);
    return { title: t.title, sections: sections, invocation: st[1] + ', patron of ' + st[2] + ', pray for us.' };
  }
  function toText(h, extra) {
    var out = [h.title, ''];
    h.sections.forEach(function (s) { out.push(s.label.toUpperCase()); out.push(s.pieces.map(function (p) { return typeof p === 'string' ? p : p.text; }).join('')); out.push(''); });
    out.push(h.invocation);
    if (extra) { out.push(''); out.push(extra); }
    return out.join('\n');
  }

  var api = { FIELDS: FIELDS, ORDER: ORDER, WORDS: WORDS, SAINTS: SAINTS, TEMPLATES: TEMPLATES, check: check, build: build, toText: toText, fieldsOf: fieldsOf, article: article, tidy: tidy, pick: pick };
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; return; }
  root.Homily = api;
})(this);
