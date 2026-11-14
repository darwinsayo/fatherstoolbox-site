/* Rubrics for a day of the calendar: what the celebrant and sacristan need to know (Gloria, Creed, Alleluia,
   which Masses are permitted, fasting, vestments), a guide to the Liturgy of the Hours, and a note on the season.
   Built on ordo.js. Nothing here reproduces liturgical texts; each rule names its source.
   Sources: GIRM = General Instruction of the Roman Missal (2011, with the US adaptations);
   GILH = General Instruction of the Liturgy of the Hours; UNLY = Universal Norms on the Liturgical Year and the Calendar;
   CIC = Code of Canon Law; OCM = Order of Celebrating Matrimony; SC = Sacrosanctum Concilium. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./ordo.js'));
  else root.Rubrics = factory(root.Ordo);
})(typeof self !== 'undefined' ? self : this, function (O) {
  'use strict';
  var TRIDUUM = { 'holy-thursday': 1, 'good-friday': 1, 'holy-saturday': 1 };
  function isSunday(d) { return d.dow === 0; }
  function isSol(d) { return d.kind === 'Solemnity'; }
  function isFeast(d) { return d.kind === 'Feast'; }
  function rose(d) { return d.colors.indexOf('rose') >= 0; }
  function laetare(d) { return d.key === 'lent-sunday' && d.week === 4; }
  /* Days on which ritual Masses are prohibited (GIRM 372), which also bar votive Masses (GIRM 374). */
  function privileged(d) {
    return isSol(d) || TRIDUUM[d.key] || d.key === 'easter-octave' || d.key === 'ash-wednesday' || d.key === 'holy-week' ||
      d.key === 'saint-11-02' || (isSunday(d) && /^(advent|lent|easter)$/.test(d.season));
  }

  /* ---------- At the altar ---------- */
  function altar(d) {
    var items = [], tags = [];
    function add(label, text, src) { items.push({ label: label, text: text, src: src || '' }); }

    if (d.key === 'good-friday') {
      tags.push('No Mass');
      add('Mass', 'No Mass is celebrated today. The Celebration of the Passion of the Lord is held in the afternoon, about three o’clock, or later for pastoral reasons. The altar is completely bare: no cross, no candles, no cloths.', 'Roman Missal, Friday of the Passion of the Lord');
    } else if (d.key === 'holy-saturday') {
      tags.push('No Mass until the Vigil');
      add('Mass', 'No Mass is celebrated during the day. The Easter Vigil begins after nightfall; at the Vigil the Gloria and the Alleluia return.', 'Roman Missal, Holy Saturday and the Easter Vigil');
    } else {
      var gloria = (isSunday(d) && d.season !== 'advent' && d.season !== 'lent') || isSol(d) || isFeast(d) ||
        d.key === 'easter-octave' || d.key === 'octave' || d.key === 'holy-thursday';
      var creed = (isSunday(d) || isSol(d)) && d.key !== 'saint-11-02';
      var lent = d.season === 'lent' || d.key === 'holy-thursday';
      tags.push(gloria ? 'Gloria' : 'No Gloria');
      if (creed) tags.push('Creed');
      tags.push(lent ? 'No Alleluia' : 'Alleluia');
      add('Gloria', gloria ? (d.key === 'holy-thursday' ? 'Said or sung at the evening Mass of the Lord’s Supper. The bells are rung during it and then remain silent until the Easter Vigil.' : 'Said or sung.') :
        'Omitted.' + (d.season === 'advent' || d.season === 'lent' ? ' It is not said in ' + (d.season === 'advent' ? 'Advent' : 'Lent') + ', except on solemnities and feasts.' : ' It belongs to Sundays outside Advent and Lent, solemnities and feasts.'), 'GIRM 53');
      add('Creed', d.key === 'saint-11-02' ? 'Not said on a weekday. When All Souls falls on a Sunday, follow your diocesan Ordo.' : creed ? 'Said or sung.' : 'Not said; it belongs to Sundays and solemnities.', 'GIRM 68');
      add('Gospel acclamation', lent ? 'No Alleluia. Use the Lenten acclamation in its place until the Easter Vigil.' : 'Alleluia.', 'GIRM 62');
      var seq = { 'easter': ['Required', 'Victimae paschali laudes'], 'pentecost': ['Required', 'Veni, Sancte Spiritus'], 'easter-octave': ['Optional', 'Victimae paschali laudes'],
        'corpus-christi': ['Optional', 'Lauda Sion'], 'saint-09-15': ['Optional', 'Stabat Mater'] }[d.key];
      if (seq) { add('Sequence', seq[0] + ': ' + seq[1] + '.', 'GIRM 64'); if (seq[0] === 'Required') tags.push('Sequence'); }
    }

    /* Flowers and music */
    if (d.key === 'good-friday' || d.key === 'holy-saturday') { /* covered above */ }
    else if (d.season === 'lent' && !laetare(d) && !isSol(d) && !isFeast(d)) add('Flowers and music', 'The altar is not decorated with flowers. Instruments are played only to support the singing.', 'GIRM 305, 313');
    else if (laetare(d)) add('Flowers and music', 'Laetare Sunday: flowers may adorn the altar and instruments may be played today.', 'GIRM 305, 313');
    else if (d.season === 'lent') add('Flowers and music', 'A solemnity or feast in Lent: flowers and instruments are permitted today.', 'GIRM 305, 313');
    else if (d.season === 'advent') add('Flowers and music', 'Flowers and instruments with moderation, in keeping with the season and without anticipating the full joy of Christmas.', 'GIRM 305, 313');

    /* Vestments */
    var v = O.COLOR_NAME[d.colors[0]] ? d.colors.filter(function (c, i, a) { return a.indexOf(c) === i; }).map(function (c) { return O.COLOR_NAME[c]; }) : [];
    var vt = (d.colorOr || d.colors.length > 1 ? v.join(' or ') : v[0]) + '.';
    if (rose(d)) vt = 'Rose may be worn today; otherwise violet.';
    if (d.key === 'saint-11-02') vt = 'Violet or black; in the dioceses of the United States, white is also permitted.';
    if (isSol(d) || isFeast(d) || d.key === 'easter' ) vt += ' On more solemn days, finer vestments, such as gold or silver, may be worn even if not of the day’s color.';
    vt += ' The deacon’s dalmatic is of the same color; the chalice veil may be of the day’s color or white.';
    add('Vestments', vt, 'GIRM 346, with the US adaptations; GIRM 118');

    /* Which Masses are permitted (not on the Triduum, which has its own rubrics) */
    if (!TRIDUUM[d.key]) {
      var funeral = !(d.holyDay === 'obligation' || (isSunday(d) && /^(advent|lent|easter)$/.test(d.season)));
      if (!funeral) tags.push('No funeral Mass');
      add('Funeral Mass', funeral ? 'Permitted.' : 'Not permitted today. The funeral may be held without Mass, with the Mass offered on another day.', 'GIRM 380');
      add('Weddings and other ritual Masses', privileged(d) ? 'Ritual Masses are not permitted today. A wedding may be celebrated within the Mass of the day, with the nuptial blessing.' : 'Permitted.', 'GIRM 372; OCM 34');
      var vot;
      if (privileged(d)) vot = 'Not permitted.';
      else if (d.season === 'ordinary' && d.kind === 'Weekday') vot = 'Permitted' + (d.options.length ? ', even with an optional memorial today' : '') + '.';
      else if (d.kind === 'Memorial' || (d.kind === 'Weekday' && /^(advent|christmas|easter)$/.test(d.season))) vot = 'In principle not permitted; the priest may choose one for a real necessity or pastoral advantage.';
      else vot = 'Only for a grave need, by order or with the permission of the diocesan bishop.';
      add('Votive Masses and Masses for various needs', vot, 'GIRM 374–376');
    }

    /* Penance */
    var fast = null;
    if (d.key === 'ash-wednesday' || d.key === 'good-friday') { fast = 'Fast and abstinence from meat. Fasting binds Catholics from 18 to 59; abstinence binds those 14 and older.'; tags.push('Fast and abstinence'); }
    else if (d.key === 'holy-saturday') fast = 'The paschal fast of Good Friday is fittingly continued until the Easter Vigil.';
    else if (d.dow === 5 && isSol(d)) fast = 'A solemnity falls on this Friday, so the Friday penance does not apply.';
    else if (d.dow === 5 && d.season === 'lent') { fast = 'Abstinence from meat, for those 14 and older.'; tags.push('Abstinence'); }
    else if (d.dow === 5) fast = 'A day of penance. In the United States abstinence from meat is encouraged, or another penance may be chosen.';
    if (fast) add('Fasting and abstinence', fast, d.key === 'holy-saturday' ? 'SC 110' : 'CIC 1250–1253; USCCB');

    return { tags: tags, items: items };
  }

  /* ---------- Liturgy of the Hours ---------- */
  var ROMAN = ['I', 'II', 'III', 'IV'];
  function psalter(d) {
    if (d.season === 'triduum' || d.key === 'easter' || d.key === 'easter-octave' || d.key === 'pentecost') return null;
    if (d.season === 'christmas') return null;
    if (d.season === 'lent' && d.week === 0) return 'IV';
    if (d.week == null) return null;
    return ROMAN[(d.week - 1) % 4];
  }
  function teDeum(d) {
    return (isSunday(d) && d.season !== 'lent') || isSol(d) || isFeast(d) || d.key === 'octave' || d.key === 'easter-octave';
  }
  function hours(d, opt) {
    var items = [], tags = [], ps = psalter(d), proper = isSol(d) || isFeast(d) || d.key === 'saint-11-02';
    function add(label, text, src) { items.push({ label: label, text: text, src: src || '' }); }
    if (ps && !proper) tags.push('Psalter week ' + ps);
    else if (proper && d.key !== 'saint-11-02') tags.push('Proper Office');

    var office;
    if (d.key === 'holy-thursday') office = 'The Office of Holy Thursday. Evening Prayer is said only by those who do not take part in the evening Mass of the Lord’s Supper.';
    else if (d.key === 'good-friday') office = 'The Office of Good Friday. The Office of Readings and Morning Prayer are fittingly celebrated with the people. Evening Prayer is said only by those who do not take part in the Celebration of the Passion.';
    else if (d.key === 'holy-saturday') office = 'The Office of Holy Saturday; the Office of Readings and Morning Prayer are fittingly celebrated with the people. Those who take part in the Easter Vigil do not say Night Prayer.';
    else if (d.key === 'easter') office = 'The Office of Easter Sunday. Those who took part in the Easter Vigil do not say the Office of Readings.';
    else if (d.key === 'saint-11-02') office = isSunday(d) ? 'When November 2 falls on a Sunday, the Office is of the Sunday; Morning and Evening Prayer of the Office for the Dead may be celebrated with the people. Follow your diocesan Ordo.' : 'The Office for the Dead, from the Proper of Saints for November 2.';
    else if (isSol(d)) office = 'The Office of the solemnity, from the Proper or the Common. At Morning Prayer, the psalms of Sunday, Week I. Daytime Prayer uses the complementary psalmody' + (isSunday(d) ? ' or the Sunday psalms' : '') + '. Evening Prayer I was said the evening before.';
    else if (isFeast(d)) office = 'The Office of the feast, from the Proper or the Common. At Morning Prayer, the psalms of Sunday, Week I; Daytime Prayer from the current weekday.' + (isSunday(d) ? ' A feast of the Lord on a Sunday has Evening Prayer I.' : ' A feast has no Evening Prayer I.');
    else if (d.key === 'octave' || d.key === 'easter-octave') office = 'The Office of the day within the Octave, from the Proper of Seasons.';
    else if (isSunday(d)) office = 'The Office of the Sunday' + (ps ? ', psalter week ' + ps : '') + '. Evening Prayer I was said on Saturday evening.';
    else if (d.kind === 'Memorial') office = 'The memorial of the saint: psalms of the current weekday' + (ps ? ' (week ' + ps + ')' : '') + ', with the proper parts or the Common.';
    else if (d.options.length && d.options[0].kind === 'Commemoration') office = 'The Office of the weekday. The saint may be commemorated at the Office of Readings and at Morning and Evening Prayer.';
    else if (d.season === 'christmas') office = 'The Office of the weekday of Christmas Time, from the Proper of Seasons.' + (d.options.length ? ' Or the Office of an optional memorial.' : '');
    else office = 'The Office of the weekday' + (ps ? ', psalter week ' + ps : '') + '.' + (d.options.length ? ' Or the Office of an optional memorial, with the psalms of the weekday.' : '');
    add('Today’s Office', office, isSol(d) ? 'GILH 225–230' : isFeast(d) ? 'GILH 231–233' : d.kind === 'Memorial' || d.options.length ? 'GILH 234–240' : 'GILH');
    if (isSol(d)) add('Psalter', 'Proper psalms; at Morning Prayer, those of Sunday, Week I.', 'GILH 225\u2013230');
    else if (isFeast(d)) add('Psalter', 'Proper psalms; at Morning Prayer, those of Sunday, Week I.' + (ps ? ' Daytime Prayer from week ' + ps + ' of the psalter.' : ''), 'GILH 231\u2013233');
    else if (d.key === 'saint-11-02') add('Psalter', 'Proper psalms of the Office for the Dead.', '');
    else if (ps) add('Psalter', 'Week ' + ps + ' of the four-week psalter.', 'GILH 133');
    else if (d.season === 'christmas') add('Psalter', 'Christmas Time follows the Proper of Seasons; consult your breviary or Ordo for the psalter week.', '');
    else add('Psalter', 'See the Proper of Seasons in your breviary.', '');
    var td = teDeum(d);
    add('Te Deum', td ? 'Said at the end of the Office of Readings.' : 'Not said today.', 'GILH 68');
    if (td) tags.push('Te Deum');

    /* This evening: Evening Prayer II of today, or Evening Prayer I of tomorrow */
    var t = O.day(d.n + 1, opt), eve;
    var tomorrowHasEP1 = (isSunday(t) || isSol(t)) && !TRIDUUM[t.key] && t.key !== 'easter';
    if (d.key === 'holy-saturday') eve = 'The Easter Vigil.';
    else if (d.key === 'holy-thursday' || d.key === 'good-friday') eve = 'Evening Prayer only for those who do not take part in the ' + (d.key === 'holy-thursday' ? 'evening Mass of the Lord\u2019s Supper.' : 'Celebration of the Passion.');
    else if (tomorrowHasEP1 && t.rank < d.rank) eve = 'Evening Prayer I of ' + t.title + (isSol(t) ? ', a solemnity' : '') + '. Night Prayer after Evening Prayer I of Sunday.';
    else if (isSunday(d) || isSol(d)) eve = 'Evening Prayer II of today. Night Prayer after Evening Prayer II of Sunday.';
    else eve = 'Evening Prayer of today.';
    add('This evening', eve, 'GILH 61');
    var a = O.ymd(d.n), ds = '' + a[0] + (a[1] < 10 ? '0' : '') + a[1] + (a[2] < 10 ? '0' : '') + a[2], base = 'https://universalis.com/usa/' + ds + '/';
    var links = [['Office of Readings', 'readings'], ['Morning Prayer', 'lauds'], ['Midday Prayer', 'sext'], ['Evening Prayer', 'vespers'], ['Night Prayer', 'compline']]
      .map(function (l) { return { label: l[0], href: base + l[1] + '.htm' }; });
    return { tags: tags, items: items, psalter: ps, links: links };
  }

  /* ---------- The season ---------- */
  var SEASON = {
    advent: { title: 'Advent', text: 'A time of devout and joyful expectation. The Gloria is omitted, and flowers and instruments are used with moderation. From December 17 the weekdays have their own Masses and readings, and memorials may only be commemorated. Rose may be worn on the Third Sunday.', src: 'UNLY 39–42; GIRM 53, 305, 313' },
    christmas: { title: 'Christmas Time', text: 'From Evening Prayer I of the Nativity to the Baptism of the Lord. The Octave days are kept with the Gloria and the Te Deum. In the United States the Epiphany is kept on the Sunday between January 2 and 8.', src: 'UNLY 32–38' },
    lent: { title: 'Lent', text: 'A time of preparation for Easter, by recalling baptism and by penance. The Gloria and the Alleluia are omitted. The altar is not decorated with flowers and instruments only support the singing, except on Laetare Sunday, solemnities and feasts. Memorials may only be commemorated. Fridays are days of abstinence.', src: 'UNLY 27–31; GIRM 53, 62, 305, 313; CIC 1251' },
    triduum: { title: 'The Sacred Paschal Triduum', text: 'The high point of the liturgical year, from the evening Mass of the Lord’s Supper to Evening Prayer of Easter Sunday. No Mass is celebrated on Good Friday or on Holy Saturday before the Vigil. The paschal fast is kept on Good Friday and, where possible, through Holy Saturday.', src: 'UNLY 18–21; SC 110' },
    easter: { title: 'Easter Time', text: 'The fifty days from Easter Sunday to Pentecost are celebrated as one feast day, “one great Sunday.” The paschal candle stands in the sanctuary until Pentecost. The Sequence is required on Easter Sunday and Pentecost.', src: 'UNLY 22–26; GIRM 64' },
    ordinary: { title: 'Ordinary Time', text: 'The thirty-three or thirty-four weeks in which the mystery of Christ is celebrated in its fullness, above all on Sundays. Votive Masses and Masses for various needs are permitted on weekdays, even when an optional memorial occurs. On Saturdays without an obligatory memorial, the memorial of the Blessed Virgin Mary may be kept.', src: 'UNLY 43–44; GIRM 375' }
  };
  function season(d) { return SEASON[d.season] || null; }

  return { altar: altar, hours: hours, season: season, psalter: psalter };
});
