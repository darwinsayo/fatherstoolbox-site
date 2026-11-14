/* Ordo: the liturgical calendar of the Roman Rite as observed in the dioceses of the United States.
   General Roman Calendar plus the Proper Calendar for the United States, with every movable
   celebration computed from rules (Easter computus, Advent, Epiphany on the Sunday between
   January 2 and 8, Ascension on Sunday or Thursday, and the Table of Liturgical Days for
   precedence and transfers). Works for any year; checked day by day against the USCCB
   liturgical calendars for 2025, 2026 and 2027 (see tests/ordo.test.js).
   Used by /calendar/ in the browser and by the tests in Node. No dependencies. */
(function (root) {
  'use strict';

  /* ---------- Dates as whole day numbers (days since 1970-01-01, UTC), so time zones never matter ---------- */
  var MS = 864e5;
  function dn(y, m, d) { return Math.round(Date.UTC(y, m - 1, d) / MS); }
  function ymd(n) { var d = new Date(n * MS); return [d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate()]; }
  function dow(n) { return (((n + 4) % 7) + 7) % 7; } // 0 = Sunday
  function iso(n) { var a = ymd(n); return a[0] + '-' + pad(a[1]) + '-' + pad(a[2]); }
  function pad(x) { return (x < 10 ? '0' : '') + x; }
  function parse(s) { var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || ''); return m ? dn(+m[1], +m[2], +m[3]) : null; }

  /* Gregorian Easter (Meeus/Jones/Butcher), the same computus as /liturgy.js */
  function easter(y) {
    var a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4,
        f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30,
        i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451),
        mo = Math.floor((h + l - 7 * m + 114) / 31), da = ((h + l - 7 * m + 114) % 31) + 1;
    return dn(y, mo, da);
  }
  function advent1(y) { var d = dn(y, 12, 3); return d - dow(d); }      // Sunday between Nov 27 and Dec 3
  function epiphany(y) { var d = dn(y, 1, 8); return d - dow(d); }      // USA: Sunday between Jan 2 and 8
  function baptism(y) { var e = epiphany(y); return ymd(e)[2] >= 7 ? e + 1 : e + 7; } // Monday after, if Epiphany is Jan 7 or 8

  /* ---------- Words ---------- */
  var DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var ORD = ['', 'First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth', 'Seventh', 'Eighth', 'Ninth', 'Tenth', 'Eleventh', 'Twelfth',
    'Thirteenth', 'Fourteenth', 'Fifteenth', 'Sixteenth', 'Seventeenth', 'Eighteenth', 'Nineteenth', 'Twentieth'];
  function ordinal(n) {
    if (n <= 20) return ORD[n];
    var stem = ['', '', 'Twent', 'Thirt'][Math.floor(n / 10)], u = n % 10;
    return u ? stem + 'y-' + ORD[u].toLowerCase() : stem + 'ieth';
  }
  function num(n) { var s = ['th', 'st', 'nd', 'rd'], v = n % 100; return n + (s[(v - 20) % 10] || s[v] || s[0]); }

  var COLOR = { w: 'white', r: 'red', v: 'violet', g: 'green', rose: 'rose', b: 'black' };
  var COLOR_NAME = { white: 'White', red: 'Red', violet: 'Violet', green: 'Green', rose: 'Rose', black: 'Black' };

  /* Precedence, from the Table of Liturgical Days (Universal Norms on the Liturgical Year and the Calendar, no. 59).
     Lower number wins. */
  var P = { TRIDUUM: 1, PRINCIPAL: 2, SOLEMNITY: 3, FEAST_LORD: 5, SUNDAY: 6, FEAST: 7, PROPER_FEAST: 8,
            PRIVILEGED_WEEKDAY: 9, MEMORIAL: 10, PROPER_MEMORIAL: 11, OPTIONAL: 12, WEEKDAY: 13 };
  var CODE = { S: P.SOLEMNITY, FL: P.FEAST_LORD, F: P.FEAST, FP: P.PROPER_FEAST, M: P.MEMORIAL, MP: P.PROPER_MEMORIAL, m: P.OPTIONAL };
  var RANK_LABEL = { S: 'Solemnity', FL: 'Feast', F: 'Feast', FP: 'Feast', M: 'Memorial', MP: 'Memorial', m: 'Optional Memorial' };

  /* ---------- The Proper of Saints: General Roman Calendar, with the Proper Calendar for the USA (code ends in P, or us:1) ----------
     [month-day, code, color, title, short title (only where the automatic short form would be wrong), US proper, first year inscribed
     (given only for recent additions, so that past years read as they were)] */
  var SAINTS = [
    ['01-02', 'M', 'w', 'Saints Basil the Great and Gregory Nazianzen, Bishops and Doctors of the Church', 'Sts. Basil and Gregory Nazianzen'],
    ['01-03', 'm', 'w', 'The Most Holy Name of Jesus'],
    ['01-04', 'MP', 'w', 'Saint Elizabeth Ann Seton, Religious', 0, 1],
    ['01-05', 'MP', 'w', 'Saint John Neumann, Bishop', 0, 1],
    ['01-06', 'm', 'w', 'Saint André Bessette, Religious', 0, 1],
    ['01-07', 'm', 'w', 'Saint Raymond of Penyafort, Priest'],
    ['01-13', 'm', 'w', 'Saint Hilary, Bishop and Doctor of the Church'],
    ['01-17', 'M', 'w', 'Saint Anthony, Abbot'],
    ['01-20', 'm', 'r', 'Saint Fabian, Pope and Martyr'],
    ['01-20', 'm', 'r', 'Saint Sebastian, Martyr'],
    ['01-21', 'M', 'r', 'Saint Agnes, Virgin and Martyr'],
    ['01-23', 'm', 'r', 'Saint Vincent, Deacon and Martyr', 0, 1],
    ['01-23', 'm', 'w', 'Saint Marianne Cope, Virgin', 0, 1],
    ['01-24', 'M', 'w', 'Saint Francis de Sales, Bishop and Doctor of the Church'],
    ['01-25', 'F', 'w', 'The Conversion of Saint Paul the Apostle'],
    ['01-26', 'M', 'w', 'Saints Timothy and Titus, Bishops'],
    ['01-27', 'm', 'w', 'Saint Angela Merici, Virgin'],
    ['01-28', 'M', 'w', 'Saint Thomas Aquinas, Priest and Doctor of the Church'],
    ['01-31', 'M', 'w', 'Saint John Bosco, Priest'],
    ['02-02', 'FL', 'w', 'The Presentation of the Lord'],
    ['02-03', 'm', 'r', 'Saint Blaise, Bishop and Martyr'],
    ['02-03', 'm', 'w', 'Saint Ansgar, Bishop'],
    ['02-05', 'M', 'r', 'Saint Agatha, Virgin and Martyr'],
    ['02-06', 'M', 'r', 'Saint Paul Miki and Companions, Martyrs'],
    ['02-08', 'm', 'w', 'Saint Jerome Emiliani'],
    ['02-08', 'm', 'w', 'Saint Josephine Bakhita, Virgin'],
    ['02-10', 'M', 'w', 'Saint Scholastica, Virgin'],
    ['02-11', 'm', 'w', 'Our Lady of Lourdes'],
    ['02-14', 'M', 'w', 'Saints Cyril, Monk, and Methodius, Bishop', 'Sts. Cyril and Methodius'],
    ['02-17', 'm', 'w', 'The Seven Holy Founders of the Servite Order', 'Seven Holy Founders'],
    ['02-21', 'm', 'w', 'Saint Peter Damian, Bishop and Doctor of the Church'],
    ['02-22', 'F', 'w', 'The Chair of Saint Peter the Apostle'],
    ['02-23', 'M', 'r', 'Saint Polycarp, Bishop and Martyr'],
    ['02-27', 'm', 'w', 'Saint Gregory of Narek, Abbot and Doctor of the Church', 0, 0, 2021],
    ['03-03', 'm', 'w', 'Saint Katharine Drexel, Virgin', 0, 1],
    ['03-04', 'm', 'w', 'Saint Casimir'],
    ['03-07', 'M', 'r', 'Saints Perpetua and Felicity, Martyrs'],
    ['03-08', 'm', 'w', 'Saint John of God, Religious'],
    ['03-09', 'm', 'w', 'Saint Frances of Rome, Religious'],
    ['03-17', 'm', 'w', 'Saint Patrick, Bishop'],
    ['03-18', 'm', 'w', 'Saint Cyril of Jerusalem, Bishop and Doctor of the Church'],
    ['03-19', 'S', 'w', 'Saint Joseph, Spouse of the Blessed Virgin Mary', 'St. Joseph'],
    ['03-23', 'm', 'w', 'Saint Turibius of Mogrovejo, Bishop'],
    ['03-25', 'S', 'w', 'The Annunciation of the Lord'],
    ['04-02', 'm', 'w', 'Saint Francis of Paola, Hermit'],
    ['04-04', 'm', 'w', 'Saint Isidore, Bishop and Doctor of the Church'],
    ['04-05', 'm', 'w', 'Saint Vincent Ferrer, Priest'],
    ['04-07', 'M', 'w', 'Saint John Baptist de la Salle, Priest'],
    ['04-11', 'M', 'r', 'Saint Stanislaus, Bishop and Martyr'],
    ['04-13', 'm', 'r', 'Saint Martin I, Pope and Martyr'],
    ['04-21', 'm', 'w', 'Saint Anselm, Bishop and Doctor of the Church'],
    ['04-23', 'm', 'r', 'Saint George, Martyr'],
    ['04-23', 'm', 'r', 'Saint Adalbert, Bishop and Martyr'],
    ['04-24', 'm', 'r', 'Saint Fidelis of Sigmaringen, Priest and Martyr'],
    ['04-25', 'F', 'r', 'Saint Mark, Evangelist'],
    ['04-28', 'm', 'r', 'Saint Peter Chanel, Priest and Martyr'],
    ['04-28', 'm', 'w', 'Saint Louis Grignion de Montfort, Priest'],
    ['04-29', 'M', 'w', 'Saint Catherine of Siena, Virgin and Doctor of the Church'],
    ['04-30', 'm', 'w', 'Saint Pius V, Pope'],
    ['05-01', 'm', 'w', 'Saint Joseph the Worker'],
    ['05-02', 'M', 'w', 'Saint Athanasius, Bishop and Doctor of the Church'],
    ['05-03', 'F', 'r', 'Saints Philip and James, Apostles'],
    ['05-10', 'm', 'w', 'Saint John of Avila, Priest and Doctor of the Church', 0, 0, 2021],
    ['05-10', 'm', 'w', 'Saint Damien de Veuster, Priest', 0, 1],
    ['05-12', 'm', 'r', 'Saints Nereus and Achilleus, Martyrs'],
    ['05-12', 'm', 'r', 'Saint Pancras, Martyr'],
    ['05-13', 'm', 'w', 'Our Lady of Fatima'],
    ['05-14', 'F', 'r', 'Saint Matthias, Apostle'],
    ['05-15', 'm', 'w', 'Saint Isidore', 'St. Isidore the Farmer', 1],
    ['05-18', 'm', 'r', 'Saint John I, Pope and Martyr'],
    ['05-20', 'm', 'w', 'Saint Bernardine of Siena, Priest'],
    ['05-21', 'm', 'r', 'Saint Christopher Magallanes, Priest, and Companions, Martyrs', 'St. Christopher Magallanes and Companions'],
    ['05-22', 'm', 'w', 'Saint Rita of Cascia, Religious'],
    ['05-25', 'm', 'w', 'Saint Bede the Venerable, Priest and Doctor of the Church'],
    ['05-25', 'm', 'w', 'Saint Gregory VII, Pope'],
    ['05-25', 'm', 'w', 'Saint Mary Magdalene de’ Pazzi, Virgin'],
    ['05-26', 'M', 'w', 'Saint Philip Neri, Priest'],
    ['05-27', 'm', 'w', 'Saint Augustine of Canterbury, Bishop'],
    ['05-29', 'm', 'w', 'Saint Paul VI, Pope', 0, 0, 2019],
    ['05-31', 'F', 'w', 'The Visitation of the Blessed Virgin Mary'],
    ['06-01', 'M', 'r', 'Saint Justin, Martyr'],
    ['06-02', 'm', 'r', 'Saints Marcellinus and Peter, Martyrs'],
    ['06-03', 'M', 'r', 'Saint Charles Lwanga and Companions, Martyrs'],
    ['06-05', 'M', 'r', 'Saint Boniface, Bishop and Martyr'],
    ['06-06', 'm', 'w', 'Saint Norbert, Bishop'],
    ['06-09', 'm', 'w', 'Saint Ephrem, Deacon and Doctor of the Church'],
    ['06-11', 'M', 'r', 'Saint Barnabas, Apostle'],
    ['06-13', 'M', 'w', 'Saint Anthony of Padua, Priest and Doctor of the Church'],
    ['06-19', 'm', 'w', 'Saint Romuald, Abbot'],
    ['06-21', 'M', 'w', 'Saint Aloysius Gonzaga, Religious'],
    ['06-22', 'm', 'w', 'Saint Paulinus of Nola, Bishop'],
    ['06-22', 'm', 'r', 'Saints John Fisher, Bishop, and Thomas More, Martyrs', 'Sts. John Fisher and Thomas More'],
    ['06-24', 'S', 'w', 'The Nativity of Saint John the Baptist'],
    ['06-27', 'm', 'w', 'Saint Cyril of Alexandria, Bishop and Doctor of the Church'],
    ['06-28', 'M', 'r', 'Saint Irenaeus, Bishop, Martyr, and Doctor of the Church'],
    ['06-29', 'S', 'r', 'Saints Peter and Paul, Apostles'],
    ['06-30', 'm', 'r', 'The First Martyrs of the Holy Roman Church'],
    ['07-01', 'm', 'w', 'Saint Junípero Serra, Priest', 0, 1],
    ['07-03', 'F', 'r', 'Saint Thomas, Apostle'],
    ['07-04', 'm', 'w', 'Independence Day', 0, 1],
    ['07-05', 'm', 'w', 'Saint Anthony Zaccaria, Priest'],
    ['07-05', 'm', 'w', 'Saint Elizabeth of Portugal', 0, 1],
    ['07-06', 'm', 'r', 'Saint Maria Goretti, Virgin and Martyr'],
    ['07-09', 'm', 'r', 'Saint Augustine Zhao Rong, Priest, and Companions, Martyrs', 'St. Augustine Zhao Rong and Companions'],
    ['07-11', 'M', 'w', 'Saint Benedict, Abbot'],
    ['07-13', 'm', 'w', 'Saint Henry'],
    ['07-14', 'MP', 'w', 'Saint Kateri Tekakwitha, Virgin', 0, 1],
    ['07-15', 'M', 'w', 'Saint Bonaventure, Bishop and Doctor of the Church'],
    ['07-16', 'm', 'w', 'Our Lady of Mount Carmel'],
    ['07-18', 'm', 'w', 'Saint Camillus de Lellis, Priest', 0, 1],
    ['07-20', 'm', 'r', 'Saint Apollinaris, Bishop and Martyr'],
    ['07-21', 'm', 'w', 'Saint Lawrence of Brindisi, Priest and Doctor of the Church'],
    ['07-22', 'F', 'w', 'Saint Mary Magdalene'],
    ['07-23', 'm', 'w', 'Saint Bridget, Religious'],
    ['07-24', 'm', 'w', 'Saint Sharbel Makhlūf, Priest'],
    ['07-25', 'F', 'r', 'Saint James, Apostle'],
    ['07-26', 'M', 'w', 'Saints Joachim and Anne, Parents of the Blessed Virgin Mary'],
    ['07-29', 'M', 'w', 'Saints Martha, Mary, and Lazarus'],
    ['07-30', 'm', 'w', 'Saint Peter Chrysologus, Bishop and Doctor of the Church'],
    ['07-31', 'M', 'w', 'Saint Ignatius of Loyola, Priest'],
    ['08-01', 'M', 'w', 'Saint Alphonsus Liguori, Bishop and Doctor of the Church'],
    ['08-02', 'm', 'w', 'Saint Eusebius of Vercelli, Bishop'],
    ['08-02', 'm', 'w', 'Saint Peter Julian Eymard, Priest'],
    ['08-04', 'M', 'w', 'Saint John Vianney, Priest'],
    ['08-05', 'm', 'w', 'The Dedication of the Basilica of Saint Mary Major', 'Dedication of St. Mary Major'],
    ['08-06', 'FL', 'w', 'The Transfiguration of the Lord'],
    ['08-07', 'm', 'r', 'Saint Sixtus II, Pope, and Companions, Martyrs', 'St. Sixtus II and Companions'],
    ['08-07', 'm', 'w', 'Saint Cajetan, Priest'],
    ['08-08', 'M', 'w', 'Saint Dominic, Priest'],
    ['08-09', 'm', 'r', 'Saint Teresa Benedicta of the Cross, Virgin and Martyr'],
    ['08-10', 'F', 'r', 'Saint Lawrence, Deacon and Martyr'],
    ['08-11', 'M', 'w', 'Saint Clare, Virgin'],
    ['08-12', 'm', 'w', 'Saint Jane Frances de Chantal, Religious'],
    ['08-13', 'm', 'r', 'Saints Pontian, Pope, and Hippolytus, Priest, Martyrs', 'Sts. Pontian and Hippolytus'],
    ['08-14', 'M', 'r', 'Saint Maximilian Kolbe, Priest and Martyr'],
    ['08-15', 'S', 'w', 'The Assumption of the Blessed Virgin Mary'],
    ['08-16', 'm', 'w', 'Saint Stephen of Hungary'],
    ['08-19', 'm', 'w', 'Saint John Eudes, Priest'],
    ['08-20', 'M', 'w', 'Saint Bernard, Abbot and Doctor of the Church'],
    ['08-21', 'M', 'w', 'Saint Pius X, Pope'],
    ['08-22', 'M', 'w', 'The Queenship of the Blessed Virgin Mary'],
    ['08-23', 'm', 'w', 'Saint Rose of Lima, Virgin'],
    ['08-24', 'F', 'r', 'Saint Bartholomew, Apostle'],
    ['08-25', 'm', 'w', 'Saint Louis'],
    ['08-25', 'm', 'w', 'Saint Joseph Calasanz, Priest'],
    ['08-27', 'M', 'w', 'Saint Monica'],
    ['08-28', 'M', 'w', 'Saint Augustine, Bishop and Doctor of the Church'],
    ['08-29', 'M', 'r', 'The Passion of Saint John the Baptist'],
    ['09-03', 'M', 'w', 'Saint Gregory the Great, Pope and Doctor of the Church'],
    ['09-05', 'm', 'w', 'Saint Teresa of Calcutta, Virgin', 0, 1],
    ['09-08', 'F', 'w', 'The Nativity of the Blessed Virgin Mary'],
    ['09-09', 'MP', 'w', 'Saint Peter Claver, Priest', 0, 1],
    ['09-12', 'm', 'w', 'The Most Holy Name of Mary'],
    ['09-13', 'M', 'w', 'Saint John Chrysostom, Bishop and Doctor of the Church'],
    ['09-14', 'FL', 'r', 'The Exaltation of the Holy Cross'],
    ['09-15', 'M', 'w', 'Our Lady of Sorrows'],
    ['09-16', 'M', 'r', 'Saints Cornelius, Pope, and Cyprian, Bishop, Martyrs', 'Sts. Cornelius and Cyprian'],
    ['09-17', 'm', 'w', 'Saint Robert Bellarmine, Bishop and Doctor of the Church'],
    ['09-17', 'm', 'w', 'Saint Hildegard of Bingen, Virgin and Doctor of the Church', 0, 0, 2021],
    ['09-19', 'm', 'r', 'Saint Januarius, Bishop and Martyr'],
    ['09-20', 'M', 'r', 'Saints Andrew Kim Tae-gon, Priest, and Paul Chong Ha-sang, and Companions, Martyrs', 'Sts. Andrew Kim Tae-gon, Paul Chong Ha-sang and Companions'],
    ['09-21', 'F', 'r', 'Saint Matthew, Apostle and Evangelist'],
    ['09-23', 'M', 'w', 'Saint Pius of Pietrelcina, Priest'],
    ['09-26', 'm', 'r', 'Saints Cosmas and Damian, Martyrs'],
    ['09-27', 'M', 'w', 'Saint Vincent de Paul, Priest'],
    ['09-28', 'm', 'r', 'Saint Wenceslaus, Martyr'],
    ['09-28', 'm', 'r', 'Saint Lawrence Ruiz and Companions, Martyrs'],
    ['09-29', 'F', 'w', 'Saints Michael, Gabriel, and Raphael, Archangels', 'Sts. Michael, Gabriel and Raphael'],
    ['09-30', 'M', 'w', 'Saint Jerome, Priest and Doctor of the Church'],
    ['10-01', 'M', 'w', 'Saint Thérèse of the Child Jesus, Virgin and Doctor of the Church'],
    ['10-02', 'M', 'w', 'The Holy Guardian Angels'],
    ['10-04', 'M', 'w', 'Saint Francis of Assisi'],
    ['10-05', 'm', 'w', 'Saint Faustina Kowalska, Virgin', 0, 0, 2020],
    ['10-05', 'm', 'w', 'Blessed Francis Xavier Seelos, Priest', 0, 1],
    ['10-06', 'm', 'w', 'Saint Bruno, Priest'],
    ['10-06', 'm', 'w', 'Blessed Marie Rose Durocher, Virgin', 0, 1],
    ['10-07', 'M', 'w', 'Our Lady of the Rosary'],
    ['10-09', 'm', 'r', 'Saint Denis, Bishop, and Companions, Martyrs', 'St. Denis and Companions'],
    ['10-09', 'm', 'w', 'Saint John Leonardi, Priest'],
    ['10-09', 'm', 'w', 'Saint John Henry Newman, Priest and Doctor of the Church', 0, 0, 2026],
    ['10-11', 'm', 'w', 'Saint John XXIII, Pope'],
    ['10-14', 'm', 'r', 'Saint Callistus I, Pope and Martyr'],
    ['10-15', 'M', 'w', 'Saint Teresa of Jesus, Virgin and Doctor of the Church'],
    ['10-16', 'm', 'w', 'Saint Hedwig, Religious'],
    ['10-16', 'm', 'w', 'Saint Margaret Mary Alacoque, Virgin'],
    ['10-17', 'M', 'r', 'Saint Ignatius of Antioch, Bishop and Martyr'],
    ['10-18', 'F', 'r', 'Saint Luke, Evangelist'],
    ['10-19', 'MP', 'r', 'Saints John de Brébeuf and Isaac Jogues, Priests, and Companions, Martyrs', 'Sts. John de Brébeuf, Isaac Jogues and Companions', 1],
    ['10-20', 'm', 'w', 'Saint Paul of the Cross, Priest', 0, 1],
    ['10-22', 'm', 'w', 'Saint John Paul II, Pope'],
    ['10-23', 'm', 'w', 'Saint John of Capistrano, Priest'],
    ['10-24', 'm', 'w', 'Saint Anthony Mary Claret, Bishop'],
    ['10-28', 'F', 'r', 'Saints Simon and Jude, Apostles'],
    ['11-01', 'S', 'w', 'All Saints'],
    ['11-02', 'S', 'v', 'The Commemoration of All the Faithful Departed (All Souls’ Day)', 'All Souls’ Day'],
    ['11-03', 'm', 'w', 'Saint Martin de Porres, Religious'],
    ['11-04', 'M', 'w', 'Saint Charles Borromeo, Bishop'],
    ['11-09', 'FL', 'w', 'The Dedication of the Lateran Basilica'],
    ['11-10', 'M', 'w', 'Saint Leo the Great, Pope and Doctor of the Church'],
    ['11-11', 'M', 'w', 'Saint Martin of Tours, Bishop'],
    ['11-12', 'M', 'r', 'Saint Josaphat, Bishop and Martyr'],
    ['11-13', 'MP', 'w', 'Saint Frances Xavier Cabrini, Virgin', 0, 1],
    ['11-15', 'm', 'w', 'Saint Albert the Great, Bishop and Doctor of the Church'],
    ['11-16', 'm', 'w', 'Saint Margaret of Scotland'],
    ['11-16', 'm', 'w', 'Saint Gertrude, Virgin'],
    ['11-17', 'M', 'w', 'Saint Elizabeth of Hungary, Religious'],
    ['11-18', 'm', 'w', 'The Dedication of the Basilicas of Saints Peter and Paul, Apostles', 'Dedication of the Basilicas of Sts. Peter and Paul'],
    ['11-18', 'm', 'w', 'Saint Rose Philippine Duchesne, Virgin', 0, 1],
    ['11-21', 'M', 'w', 'The Presentation of the Blessed Virgin Mary'],
    ['11-22', 'M', 'r', 'Saint Cecilia, Virgin and Martyr'],
    ['11-23', 'm', 'r', 'Saint Clement I, Pope and Martyr'],
    ['11-23', 'm', 'w', 'Saint Columban, Abbot'],
    ['11-23', 'm', 'r', 'Blessed Miguel Agustín Pro, Priest and Martyr', 0, 1],
    ['11-24', 'M', 'r', 'Saint Andrew Dũng-Lạc, Priest, and Companions, Martyrs', 'St. Andrew Dũng-Lạc and Companions'],
    ['11-25', 'm', 'r', 'Saint Catherine of Alexandria, Virgin and Martyr'],
    ['11-30', 'F', 'r', 'Saint Andrew, Apostle'],
    ['12-03', 'M', 'w', 'Saint Francis Xavier, Priest'],
    ['12-04', 'm', 'w', 'Saint John Damascene, Priest and Doctor of the Church'],
    ['12-06', 'm', 'w', 'Saint Nicholas, Bishop'],
    ['12-07', 'M', 'w', 'Saint Ambrose, Bishop and Doctor of the Church'],
    ['12-08', 'S', 'w', 'The Immaculate Conception of the Blessed Virgin Mary', 'Immaculate Conception'],
    ['12-09', 'm', 'w', 'Saint Juan Diego Cuauhtlatoatzin'],
    ['12-10', 'm', 'w', 'Our Lady of Loreto', 0, 0, 2020],
    ['12-11', 'm', 'w', 'Saint Damasus I, Pope'],
    ['12-12', 'FP', 'w', 'Our Lady of Guadalupe', 0, 1],
    ['12-13', 'M', 'r', 'Saint Lucy, Virgin and Martyr'],
    ['12-14', 'M', 'w', 'Saint John of the Cross, Priest and Doctor of the Church'],
    ['12-21', 'm', 'w', 'Saint Peter Canisius, Priest and Doctor of the Church'],
    ['12-23', 'm', 'w', 'Saint John of Kanty, Priest'],
    ['12-26', 'F', 'r', 'Saint Stephen, the First Martyr'],
    ['12-27', 'F', 'w', 'Saint John, Apostle and Evangelist'],
    ['12-28', 'F', 'r', 'The Holy Innocents, Martyrs'],
    ['12-29', 'm', 'r', 'Saint Thomas Becket, Bishop and Martyr'],
    ['12-31', 'm', 'w', 'Saint Sylvester I, Pope']
  ];
  /* Colors that may also be used, beyond the one in the entry */
  var ALSO = { '11-02': ['white', 'black'] };

  function shortOf(title) {
    return title.replace(/^The /, '').replace(/^Saints /, 'Sts. ').replace(/^Saint /, 'St. ').replace(/^Blessed /, 'Bl. ')
      .replace(/ Saints /g, ' Sts. ').replace(/ Saint /g, ' St. ').split(', ')[0];
  }

  /* ---------- The Proper of Time ---------- */
  var ASCENSION_PROVINCES = 'Boston, Hartford, New York, Omaha and Philadelphia';

  function T(o) { return o; }
  function temporal(n, Y, opt) {
    var E = easter(Y), A = advent1(Y), X = dn(Y, 12, 25), Ep = epiphany(Y), B = baptism(Y), w = dow(n), d = ymd(n),
        asc = opt.ascensionThursday ? E + 39 : E + 42, Ash = E - 46, CK = A - 7, wk, t;
    var D = DAYS[w];
    if (n >= X) {
      var hf = dow(X) === 0 ? dn(Y, 12, 30) : X + 7 - dow(X);
      if (n === X) return T({ season: 'christmas', key: 'christmas', title: 'The Nativity of the Lord (Christmas)', short: 'Christmas', rank: P.PRINCIPAL, kind: 'Solemnity', color: ['white'] });
      if (n === hf) return T({ season: 'christmas', key: 'holy-family', title: 'The Holy Family of Jesus, Mary and Joseph', short: 'Holy Family', rank: P.FEAST_LORD, kind: 'Feast', color: ['white'] });
      return T({ season: 'christmas', key: 'octave', title: ORD[n - X + 1] + ' Day within the Octave of the Nativity of the Lord', short: 'Octave of Christmas', rank: P.PRIVILEGED_WEEKDAY, kind: 'Octave day', color: ['white'] });
    }
    if (n >= A) {
      wk = Math.floor((n - A) / 7) + 1;
      if (w === 0) return T({ season: 'advent', week: wk, key: 'advent-sunday', title: ORD[wk] + ' Sunday of Advent', short: num(wk) + ' Sunday of Advent', rank: P.PRINCIPAL, kind: 'Sunday', color: wk === 3 ? ['violet', 'rose'] : ['violet'], colorOr: wk === 3 });
      if (d[1] === 12 && d[2] >= 17) return T({ season: 'advent', week: wk, key: 'late-advent', title: 'Advent Weekday (' + MONTHS[11] + ' ' + d[2] + ')', short: 'Advent Weekday', rank: P.PRIVILEGED_WEEKDAY, kind: 'Weekday', color: ['violet'] });
      return T({ season: 'advent', week: wk, key: 'advent-weekday', title: D + ' of the ' + ORD[wk] + ' Week of Advent', short: 'Advent Weekday', rank: P.WEEKDAY, kind: 'Weekday', color: ['violet'] });
    }
    if (n === dn(Y, 1, 1)) return T({ season: 'christmas', key: 'mary-mother-of-god', title: 'Mary, the Holy Mother of God', short: 'Mary, Mother of God', rank: P.SOLEMNITY, kind: 'Solemnity', color: ['white'], note: 'The Octave Day of the Nativity of the Lord.' });
    if (n < Ep) return T({ season: 'christmas', key: 'christmas-weekday', title: 'Christmas Weekday (' + MONTHS[0] + ' ' + d[2] + ')', short: 'Christmas Weekday', rank: P.WEEKDAY, kind: 'Weekday', color: ['white'] });
    if (n === Ep) return T({ season: 'christmas', key: 'epiphany', title: 'The Epiphany of the Lord', short: 'Epiphany', rank: P.PRINCIPAL, kind: 'Solemnity', color: ['white'] });
    if (n < B) return T({ season: 'christmas', key: 'christmas-weekday', title: D + ' after Epiphany', short: 'Christmas Weekday', rank: P.WEEKDAY, kind: 'Weekday', color: ['white'] });
    if (n === B) return T({ season: 'christmas', key: 'baptism', title: 'The Baptism of the Lord', short: 'Baptism of the Lord', rank: P.FEAST_LORD, kind: 'Feast', color: ['white'] });
    if (n < Ash) {
      var S = B - dow(B); wk = Math.floor((n - S) / 7) + 1;
      return ot(n, wk, w);
    }
    if (n === Ash) return T({ season: 'lent', week: 0, key: 'ash-wednesday', title: 'Ash Wednesday', short: 'Ash Wednesday', rank: P.PRINCIPAL, kind: 'Ash Wednesday', color: ['violet'] });
    if (n < E - 42) return T({ season: 'lent', week: 0, key: 'lent-weekday', title: D + ' after Ash Wednesday', short: 'Lenten Weekday', rank: P.PRIVILEGED_WEEKDAY, kind: 'Weekday', color: ['violet'] });
    if (n < E - 7) {
      wk = Math.floor((n - (E - 42)) / 7) + 1;
      if (w === 0) return T({ season: 'lent', week: wk, key: 'lent-sunday', title: ORD[wk] + ' Sunday of Lent', short: num(wk) + ' Sunday of Lent', rank: P.PRINCIPAL, kind: 'Sunday', color: wk === 4 ? ['violet', 'rose'] : ['violet'], colorOr: wk === 4 });
      return T({ season: 'lent', week: wk, key: 'lent-weekday', title: D + ' of the ' + ORD[wk] + ' Week of Lent', short: 'Lenten Weekday', rank: P.PRIVILEGED_WEEKDAY, kind: 'Weekday', color: ['violet'] });
    }
    if (n === E - 7) return T({ season: 'lent', week: 6, key: 'palm-sunday', title: 'Palm Sunday of the Passion of the Lord', short: 'Palm Sunday', rank: P.PRINCIPAL, kind: 'Sunday', color: ['red'], holyWeek: true });
    if (n < E - 3) return T({ season: 'lent', week: 6, key: 'holy-week', title: D + ' of Holy Week', short: D + ' of Holy Week', rank: P.PRINCIPAL, kind: 'Holy Week', color: ['violet'], holyWeek: true });
    if (n === E - 3) return T({ season: 'triduum', key: 'holy-thursday', title: 'Thursday of Holy Week (Holy Thursday)', short: 'Holy Thursday', rank: P.TRIDUUM, kind: 'Paschal Triduum', color: ['white'], holyWeek: true,
      note: 'Lent ends and the Sacred Paschal Triduum begins with the Evening Mass of the Lord’s Supper. The Chrism Mass is celebrated this morning or on a suitable day before.' });
    if (n === E - 2) return T({ season: 'triduum', key: 'good-friday', title: 'Friday of the Passion of the Lord (Good Friday)', short: 'Good Friday', rank: P.TRIDUUM, kind: 'Paschal Triduum', color: ['red'], holyWeek: true, note: 'A day of fasting and abstinence. Mass is not celebrated.' });
    if (n === E - 1) return T({ season: 'triduum', key: 'holy-saturday', title: 'Holy Saturday', short: 'Holy Saturday', rank: P.TRIDUUM, kind: 'Paschal Triduum', color: ['white'], holyWeek: true, note: 'Mass is not celebrated during the day. The Easter Vigil in the Holy Night begins after nightfall (white).' });
    if (n === E) return T({ season: 'easter', week: 1, key: 'easter', title: 'Easter Sunday of the Resurrection of the Lord', short: 'Easter Sunday', rank: P.TRIDUUM, kind: 'Solemnity', color: ['white'] });
    if (n < E + 7) return T({ season: 'easter', week: 1, key: 'easter-octave', title: D + ' within the Octave of Easter', short: 'Octave of Easter', rank: P.PRINCIPAL, kind: 'Octave day', color: ['white'], octave: true });
    if (n === E + 7) return T({ season: 'easter', week: 2, key: 'easter-sunday', title: 'Second Sunday of Easter (or Sunday of Divine Mercy)', short: '2nd Sunday of Easter', rank: P.PRINCIPAL, kind: 'Sunday', color: ['white'] });
    if (n < E + 49) {
      wk = Math.floor((n - E) / 7) + 1;
      if (n === asc) return T({ season: 'easter', week: wk, key: 'ascension', title: 'The Ascension of the Lord', short: 'Ascension', rank: P.PRINCIPAL, kind: 'Solemnity', color: ['white'] });
      if (w === 0) return T({ season: 'easter', week: wk, key: 'easter-sunday', title: ORD[wk] + ' Sunday of Easter', short: num(wk) + ' Sunday of Easter', rank: P.PRINCIPAL, kind: 'Sunday', color: ['white'] });
      return T({ season: 'easter', week: wk, key: 'easter-weekday', title: D + ' of the ' + ORD[wk] + ' Week of Easter', short: 'Easter Weekday', rank: P.WEEKDAY, kind: 'Weekday', color: ['white'] });
    }
    if (n === E + 49) return T({ season: 'easter', week: 8, key: 'pentecost', title: 'Pentecost Sunday', short: 'Pentecost', rank: P.PRINCIPAL, kind: 'Solemnity', color: ['red'] });
    wk = 34 - (CK - (n - w)) / 7;
    if (n === E + 56) return T({ season: 'ordinary', week: wk, key: 'trinity', title: 'The Most Holy Trinity', short: 'Most Holy Trinity', rank: P.SOLEMNITY, kind: 'Solemnity', color: ['white'] });
    if (n === E + 63) return T({ season: 'ordinary', week: wk, key: 'corpus-christi', title: 'The Most Holy Body and Blood of Christ (Corpus Christi)', short: 'Corpus Christi', rank: P.SOLEMNITY, kind: 'Solemnity', color: ['white'] });
    if (n === E + 68) return T({ season: 'ordinary', week: wk, key: 'sacred-heart', title: 'The Most Sacred Heart of Jesus', short: 'Sacred Heart of Jesus', rank: P.SOLEMNITY, kind: 'Solemnity', color: ['white'] });
    if (n === CK) return T({ season: 'ordinary', week: 34, key: 'christ-the-king', title: 'Our Lord Jesus Christ, King of the Universe', short: 'Christ the King', rank: P.SOLEMNITY, kind: 'Solemnity', color: ['white'] });
    return ot(n, wk, w);
  }
  function ot(n, wk, w) {
    if (w === 0) return { season: 'ordinary', week: wk, key: 'ot-sunday', title: ordinal(wk) + ' Sunday in Ordinary Time', short: num(wk) + ' Sunday in Ordinary Time', rank: P.SUNDAY, kind: 'Sunday', color: ['green'] };
    return { season: 'ordinary', week: wk, key: 'ot-weekday', title: DAYS[w] + ' of the ' + ordinal(wk) + ' Week in Ordinary Time', short: 'Weekday', rank: P.WEEKDAY, kind: 'Weekday', color: ['green'] };
  }

  /* ---------- Building a civil year ---------- */
  var cache = {};
  function saint(e, n) {
    var code = e[1];
    var o = { key: 'saint-' + e[0], md: e[0], code: code, title: e[3], short: e[4] || shortOf(e[3]), rank: CODE[code], kind: RANK_LABEL[code],
      color: [COLOR[e[2]]].concat(ALSO[e[0]] || []), colorOr: !!ALSO[e[0]], usa: !!e[5] || /P$/.test(code), origin: n };
    if (e[0] === '11-02') o.kind = 'Commemoration';
    return o;
  }
  function plain(title) { var t = title.replace(/^.* \(((Holy|Good|Christmas)[^)]*)\)$/, '$1'); return /^(Saint|Our|Mary|Pentecost|Palm|Easter|Ash|Holy|Good|All)/.test(t) ? t : 'the ' + t.replace(/^The /, ''); }
  function longDate(n) { var a = ymd(n); return DAYS[dow(n)] + ', ' + MONTHS[a[1] - 1] + ' ' + a[2]; }
  function monthDay(n) { var a = ymd(n); return MONTHS[a[1] - 1] + ' ' + a[2]; }
  function kindWord(s) { return { 1: 'Sacred Paschal Triduum', 2: 'day', 3: 'Solemnity', 5: 'Feast of the Lord', 6: 'Sunday' }[s] || 'day'; }

  function year(Y, opt) {
    opt = opt || {};
    var ck = Y + (opt.ascensionThursday ? 'T' : 'S');
    if (cache[ck]) return cache[ck];
    var start = dn(Y, 1, 1), len = dn(Y + 1, 1, 1) - start, days = [], i, E = easter(Y);
    for (i = 0; i < len; i++) days.push({ n: start + i, t: temporal(start + i, Y, opt), s: [], notes: [] });
    function at(n) { return days[n - start]; }

    SAINTS.forEach(function (e) {
      if (e[6] && Y < e[6]) return;
      var md = e[0].split('-'), n = dn(Y, +md[0], +md[1]);
      at(n).s.push(saint(e, n));
    });
    // Movable memorials and observances
    if (Y >= 2018) at(E + 50).s.push({ key: 'mary-mother-of-church', title: 'The Blessed Virgin Mary, Mother of the Church', short: 'Mary, Mother of the Church', rank: P.MEMORIAL, kind: 'Memorial', code: 'M', color: ['white'], bvm: true });
    at(E + 69).s.push({ key: 'immaculate-heart', title: 'The Immaculate Heart of the Blessed Virgin Mary', short: 'Immaculate Heart of Mary', rank: P.MEMORIAL, kind: 'Memorial', code: 'M', color: ['white'], ihm: true });
    var nov1 = dn(Y, 11, 1), thanks = nov1 + ((4 - dow(nov1) + 7) % 7) + 21;
    at(thanks).s.push({ key: 'thanksgiving', title: 'Thanksgiving Day', short: 'Thanksgiving Day', rank: P.OPTIONAL, kind: 'Optional Memorial', code: 'm', color: ['white'], usa: true, civic: true });
    var j22 = dn(Y, 1, 22); if (dow(j22) === 0) j22++;
    at(j22).s.push({ key: 'day-of-prayer', title: 'Day of Prayer for the Legal Protection of Unborn Children', short: 'Day of Prayer for the Unborn', rank: P.PROPER_MEMORIAL, kind: 'Day of Prayer', code: 'DP', color: ['white', 'violet'], colorOr: true, usa: true,
      note: 'Observed in all dioceses of the United States' + (j22 !== dn(Y, 1, 22) ? ' (moved to January 23 because January 22 is a Sunday)' : '') + '. Mass “For Giving Thanks to God for the Gift of Human Life” (white) or “For the Preservation of Peace and Justice” (violet).' });

    // Transfer impeded solemnities (Universal Norms, no. 60; CDW decree of 22 April 2008 for St. Joseph in Holy Week)
    for (i = 0; i < len; i++) {
      var day = days[i];
      day.s.slice().forEach(function (s) {
        if (s.rank !== P.SOLEMNITY || s.moved) return;
        if (day.t.rank > P.SOLEMNITY) return;
        var to;
        if (s.md === '03-19' && day.t.holyWeek) to = E - 8;                 // anticipated to the Saturday before Palm Sunday
        else if (s.md === '06-24' && day.t.key === 'sacred-heart') to = day.n - 1; // as the Holy See directed in 2022
        else { to = day.n + 1; while (at(to).t.rank <= P.PROPER_FEAST || at(to).s.some(function (x) { return x.rank <= P.PROPER_FEAST; })) to++; }
        day.s.splice(day.s.indexOf(s), 1);
        s.moved = true; s.transferredFrom = day.n;
        s.note = 'Transferred from ' + longDate(day.n) + ', which is ' + plain(day.t.title) + ' this year.';
        if (s.md === '12-08') s.note += ' The obligation to attend Mass does not transfer.';
        at(to).s.unshift(s);
        day.notes.push('The ' + s.kind + ' of ' + s.title.replace(/^The /, 'the ') + ' is transferred this year to ' + longDate(to) + '.');
      });
    }

    var res = days.map(function (day) { return resolve(day, Y, opt); });
    cache[ck] = res;
    return res;
  }

  function resolve(day, Y, opt) {
    var t = day.t, n = day.n, w = dow(n), s = day.s.slice().sort(function (a, b) { return a.rank - b.rank; }),
        principal = null, options = [], omitted = [], notes = day.notes.slice();
    var top = s[0];
    if (top && top.rank <= P.PROPER_FEAST && top.rank < t.rank) {
      principal = top; omitted = s.slice(1);
    } else if (t.rank <= P.PROPER_FEAST) {
      principal = t; omitted = s;
    } else if (t.rank === P.PRIVILEGED_WEEKDAY) {
      // Lent, December 17-24, the Octave of Christmas: memorials may be observed only as commemorations
      principal = t;
      omitted = s.filter(function (x) { return x.rank <= P.PROPER_FEAST; });
      options = s.filter(function (x) { return x.rank > P.PROPER_FEAST && !x.civic; }).map(function (x) { return opt1(x, 'Commemoration'); });
    } else {
      var obl = s.filter(function (x) { return x.rank === P.MEMORIAL || x.rank === P.PROPER_MEMORIAL; }),
          ihm = obl.filter(function (x) { return x.ihm; })[0], mmc = obl.filter(function (x) { return x.bvm; })[0];
      if (ihm && obl.length > 1) {
        // The Immaculate Heart becomes optional, and so does the other memorial (Missal, note on the Immaculate Heart)
        principal = t;
        options = [ihm].concat(s.filter(function (x) { return x !== ihm; })).map(function (x) { return opt1(x, 'Optional Memorial'); });
        notes.push('The Memorial of the Immaculate Heart of the Blessed Virgin Mary coincides with another obligatory memorial this year, so both are optional.');
      } else if (mmc) {
        principal = mmc; omitted = s.filter(function (x) { return x !== mmc; });
      } else if (obl.length) {
        principal = obl[0];
        if (principal.code === 'DP') options = s.filter(function (x) { return x.rank === P.OPTIONAL; }).map(function (x) { return opt1(x, 'Optional Memorial'); });
        else omitted = s.slice(1);
      } else {
        principal = t;
        options = s.map(function (x) { return opt1(x, x.civic ? 'Proper Mass' : 'Optional Memorial'); });
      }
      if (principal === t && t.season === 'ordinary' && w === 6)
        options.push({ key: 'bvm-saturday', title: 'Saturday Memorial of the Blessed Virgin Mary', short: 'Blessed Virgin Mary on Saturday', kind: 'Optional Memorial', color: ['white'] });
    }

    var Lyear = n >= advent1(Y) ? Y + 1 : Y, out = {
      date: iso(n), n: n, dow: w, dayName: DAYS[w], year: Y, month: ymd(n)[1], day: ymd(n)[2],
      season: t.season, seasonName: SEASON_NAME[t.season], week: t.week == null ? null : t.week,
      title: principal.title, short: principal.short, kind: principal === t ? t.kind : principal.kind,
      rank: principal.rank, key: principal.key, color: principal.color.slice(), colorOr: !!principal.colorOr,
      usa: !!principal.usa, sanctoral: principal !== t, weekday: principal !== t ? t.title : null,
      options: options, notes: notes,
      litYear: Lyear, sundayCycle: ['C', 'A', 'B'][Lyear % 3], weekdayCycle: Lyear % 2 ? 'I' : 'II',
      readings: 'https://bible.usccb.org/bible/readings/' + pad(ymd(n)[1]) + pad(ymd(n)[2]) + String(Y).slice(-2) + '.cfm'
    };
    if (principal.note) notes.unshift(principal.note);
    if (principal.transferredFrom != null) out.transferredFrom = iso(principal.transferredFrom);
    // Colors of the optional memorials, as the USCCB calendar prints them (e.g. green/white/red)
    out.colors = principal.color.slice(0, principal.colorOr ? principal.color.length : 1);
    if (t.rank !== P.PRIVILEGED_WEEKDAY) options.forEach(function (o) { out.colors.push(o.color[0]); });

    omitted.forEach(function (x) {
      if (x.civic || x.moved) return;
      var why = plain(principal.title);
      if (x.rank <= P.PROPER_FEAST) notes.push('The ' + (x.kind === 'Feast' && x.code === 'FL' ? 'Feast' : x.kind) + ' of ' + x.title.replace(/^The /, 'the ') + ' is not celebrated this year, because it falls on ' + why + '.');
      out.omitted = (out.omitted || []).concat({ title: x.title, short: x.short, kind: x.kind });
    });

    out.holyDay = holyDay(out, principal, n, w, opt);
    if (out.holyDay === 'abrogated') notes.push('Not a holy day of obligation this year: when this solemnity falls on a Saturday or a Monday, the obligation to attend Mass is lifted in the United States.');
    if (out.key === 'ascension') notes.push(opt.ascensionThursday
      ? 'Celebrated on Thursday in the ecclesiastical provinces of ' + ASCENSION_PROVINCES + '. Elsewhere in the United States it is transferred to the following Sunday.'
      : 'Transferred to this Sunday in most of the United States. The provinces of ' + ASCENSION_PROVINCES + ' keep it on the Thursday before, as a holy day of obligation.');
    if (out.key === 'christmas') notes.push('Masses: at the Vigil, during the Night, at Dawn, and during the Day.');
    if (out.key === 'late-advent' && out.day === 24) notes.push('The Vigil Mass of the Nativity of the Lord is celebrated this evening.');
    if (out.key === 'easter') notes.push('The Easter Vigil in the Holy Night is the greatest of all the Church’s celebrations.');
    if (t.octave) notes.push('The days within the Octave of Easter are celebrated as solemnities of the Lord.');
    return out;
  }
  function opt1(x, kind) { return { key: x.key, title: x.title, short: x.short, kind: kind, color: x.color.slice(0, 1), usa: !!x.usa }; }

  function holyDay(o, p, n, w, opt) {
    var k = o.key;
    if (k === 'christmas' || k === 'mary-mother-of-god' || k === 'saint-08-15' || k === 'saint-11-01' || k === 'saint-12-08' || (k === 'ascension' && w === 4)) {
      if (w === 0) return 'sunday';
      if (k === 'saint-12-08' && p.transferredFrom != null) return 'transferred';
      if ((k === 'mary-mother-of-god' || k === 'saint-08-15' || k === 'saint-11-01') && (w === 6 || w === 1)) return 'abrogated';
      return 'obligation';
    }
    return null;
  }
  var SEASON_NAME = { advent: 'Advent', christmas: 'Christmas Time', ordinary: 'Ordinary Time', lent: 'Lent', triduum: 'Sacred Paschal Triduum', easter: 'Easter Time' };

  /* ---------- Public API ---------- */
  function day(n, opt) { var Y = ymd(n)[0]; return year(Y, opt)[n - dn(Y, 1, 1)]; }
  function month(Y, M, opt) { var y = year(Y, opt), s = dn(Y, M, 1) - dn(Y, 1, 1), e = dn(M === 12 ? Y + 1 : Y, M === 12 ? 1 : M + 1, 1) - dn(Y, 1, 1); return y.slice(s, e); }
  /* The liturgical year that begins on the First Sunday of Advent of civil year Y-1 and ends before Advent of Y */
  function seasons(L, opt) {
    var y = L - 1, a0 = advent1(y), a1 = advent1(L), E = easter(L);
    return { start: iso(a0), end: iso(a1 - 1), litYear: L, sundayCycle: ['C', 'A', 'B'][L % 3], weekdayCycle: L % 2 ? 'I' : 'II', segments: [
      { season: 'advent', name: 'Advent', start: iso(a0), end: iso(dn(y, 12, 24)) },
      { season: 'christmas', name: 'Christmas Time', start: iso(dn(y, 12, 25)), end: iso(baptism(L)) },
      { season: 'ordinary', name: 'Ordinary Time', start: iso(baptism(L) + 1), end: iso(E - 47) },
      { season: 'lent', name: 'Lent', start: iso(E - 46), end: iso(E - 3) },
      { season: 'triduum', name: 'Sacred Paschal Triduum', start: iso(E - 3), end: iso(E) }, // Holy Thursday evening to Easter Sunday evening
      { season: 'easter', name: 'Easter Time', start: iso(E), end: iso(E + 49) },
      { season: 'ordinary', name: 'Ordinary Time', start: iso(E + 50), end: iso(a1 - 1) }
    ] };
  }
  function keyDates(Y, opt) {
    var E = easter(Y), A = advent1(Y), asc = opt && opt.ascensionThursday ? E + 39 : E + 42;
    return [
      ['Epiphany of the Lord', epiphany(Y)], ['Baptism of the Lord', baptism(Y)], ['Ash Wednesday', E - 46], ['Palm Sunday', E - 7],
      ['Holy Thursday', E - 3], ['Good Friday', E - 2], ['Easter Sunday', E], ['Divine Mercy Sunday', E + 7], ['Ascension of the Lord', asc],
      ['Pentecost Sunday', E + 49], ['Most Holy Trinity', E + 56], ['Corpus Christi', E + 63], ['Sacred Heart of Jesus', E + 68],
      ['Christ the King', A - 7], ['First Sunday of Advent', A]
    ].map(function (k) { return { name: k[0], date: iso(k[1]) }; });
  }

  var api = { dn: dn, ymd: ymd, iso: iso, parse: parse, dow: dow, easter: easter, advent1: advent1, epiphany: epiphany, baptism: baptism,
    year: year, day: day, month: month, seasons: seasons, keyDates: keyDates, DAYS: DAYS, MONTHS: MONTHS, COLOR_NAME: COLOR_NAME,
    ASCENSION_PROVINCES: ASCENSION_PROVINCES, today: function () { var d = new Date(); return dn(d.getFullYear(), d.getMonth() + 1, d.getDate()); } };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.Ordo = api;
})(this);
