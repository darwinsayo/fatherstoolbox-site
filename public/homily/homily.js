/* The fill-in-the-blank homily: a lighthearted look at parish life.
   Everything runs in the visitor's browser. Nothing typed here is sent or stored anywhere.

   Content rules (please keep them when adding a template):
   - The humor is about everyday parish life: parking, coffee and donuts, long announcements,
     the thermostat, potlucks, the second collection. Never about the Mass, the Eucharist,
     the sacraments, Scripture, Our Lord, Our Lady, the saints, prayer, or the priesthood
     and religious life as such, and never about real people.
   - A blank never lands in a sentence about anything sacred. Saints come only from the curated
     list below, with their real patronages, and appear only in a sincere closing invocation.
     Templates that are not homilies (a letter, a forecast, a game show) end in a plain sign-off instead.
   - Templates never use sacred words at all (tests/homily.test.js scans for them), and the word
     "host" is avoided entirely, because of the Eucharist.
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
    number2:{ label: 'Another number', hint: 'any whole number, like 40', max: 4, numeric: true },
    vehicle:{ label: 'A vehicle', hint: 'like a minivan or a golf cart', max: 30 },
    appliance:{ label: 'A kitchen or office gadget', hint: 'like the toaster oven or the laminator', max: 30 },
    machine:{ label: 'A machine or tool', hint: 'like a leaf blower or a floor buffer', max: 30 },
    hobby:  { label: 'A hobby', hint: 'like knitting or birdwatching', max: 30 },
    drink:  { label: 'A drink', hint: 'like decaf or lemonade', max: 30 },
    sound:  { label: 'A sound', hint: 'like a squeak or a thump', max: 30 },
    saying: { label: 'Something your pastor always says', hint: 'like “Let’s keep it moving”', max: 80 }
  };
  var ORDER = ['adj', 'adj2', 'noun', 'nouns', 'verb', 'food', 'dish', 'drink', 'place', 'animal', 'vehicle', 'appliance', 'machine', 'sound', 'hobby', 'sport', 'number', 'number2', 'saying'];

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
    number2: ['9', '15', '31', '64', '99', '250'],
    vehicle: ['minivan', 'pickup truck', 'golf cart', 'station wagon', 'riding mower', 'tricycle', 'parish van', 'hatchback', 'tractor', 'moped'],
    appliance: ['dishwasher', 'coffee urn', 'microwave', 'toaster oven', 'popcorn machine', 'ice machine', 'space heater', 'box fan', 'label maker', 'laminator', 'copier', 'projector'],
    machine: ['lawn mower', 'leaf blower', 'snow blower', 'popcorn machine', 'pressure washer', 'floor buffer', 'generator', 'coffee urn', 'bubble machine', 'hedge trimmer'],
    hobby: ['knitting', 'birdwatching', 'woodworking', 'gardening', 'quilting', 'fishing', 'bowling', 'scrapbooking', 'crossword puzzles', 'genealogy'],
    drink: ['decaf', 'lemonade', 'hot cocoa', 'fruit punch', 'sweet tea', 'apple cider', 'weak coffee', 'strong coffee'],
    sound: ['squeak', 'rattle', 'thump', 'jingle', 'whistle', 'honk', 'clang', 'hum', 'buzz', 'wheeze'],
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
      id: 'sunday', group: 'Classic homilies', format: 'homily', kicker: 'A homily, approximately', desc: 'Three brief points, a thermostat and a lock box. Gentle deadpan.', name: 'Sunday homily', voice: 'Gentle deadpan', saint: 'philip-neri',
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
      id: 'christmas', group: 'Classic homilies', format: 'homily', kicker: 'A Christmas homily, approximately', desc: 'Extra folding chairs, parking volunteers and a choir about to change key.', name: 'Christmas', voice: 'Warm storyteller', saint: 'christopher',
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
      id: 'lent', group: 'Classic homilies', format: 'homily', kicker: 'A homily, approximately', desc: 'A fired-up coach, a fish fry and a very personal best.', name: 'Lent and the fish fry', voice: 'Fired-up coach', saint: 'peter',
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
      id: 'potluck', group: 'Classic homilies', format: 'homily', kicker: 'A few brief announcements', desc: 'Announcements about the potluck, which, as you know, means twelve.', name: 'Potluck announcements', voice: 'Committee deadpan', saint: 'martha',
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
      id: 'welcome', group: 'Classic homilies', format: 'homily', kicker: 'A welcome, approximately', desc: 'A warm welcome with a few things the new associate pastor should know.', name: 'Welcome, new associate pastor', voice: 'Gentle roast of the parish', saint: 'john-vianney',
      title: 'Welcome, Father! A Few Things You Should Know',
      sections: [
        ['The opening', 'Before everyone heads over for coffee, please join me in welcoming our new associate pastor. He arrived on Tuesday with a car full of books, {a:adj} {noun}, and the calm look of a man who has not yet been to a parish council meeting.'],
        ['First', 'Father, in your first week you have already learned three things. First: the door to the {place} sticks. You have to lift, pull, and think about {verb}, all at the same time. Nobody knows why. Please do not call the diocese about it.'],
        ['Second', 'The thermostat. There is a war on, Father, and it started long before you got here. There are two sides. You will be tempted to choose one. Don’t. Just quietly keep {a:adj2} sweater in your office.'],
        ['Third', 'At every potluck, you take a little of the {dish}. You always take a little of the {dish}. The person who made it is watching, and so is everyone else.'],
        ['A story', 'When I was newly ordained, my first pastor handed me a ring of {number} keys and said, {saying} To this day I don’t know what most of those keys open. Father, here is your ring of keys. There are more of them now.'],
        ['In conclusion', 'He enjoys {sport} and {food}, and he has promised the parish council that his homilies will stay under {number} minutes. We have it in writing. Welcome, Father. We are so glad you are here.']
      ]
    },
    /* ---------- Something different: each one has its own shape, blanks and ending ---------- */
    {
      id: 'letter', group: 'Something different', format: 'letter', name: 'A letter from the parish office', voice: 'Dry office humor',
      kicker: 'From the parish office', title: 'A Few Gentle Reminders',
      desc: 'A letter to the whole parish about lost umbrellas, bulletin deadlines and the corner nobody will claim.',
      closing: 'With great affection and a slight headache,\nThe Parish Office (the ones with the keys)',
      sections: [
        ['', 'Dear friends,'],
        ['', 'It has come to our attention that a number of you have questions. We have answers. Some of them are even correct.'],
        ['', 'Our office hours are 9 to 4, Monday through Friday, except at lunch. If the line is busy, it is because someone is asking where to park. Please be patient with us, and with the {appliance}, which has opinions.'],
        ['', 'The lost and found now holds {number} umbrellas, {a:adj} {noun}, and one glove that has been here since before the copier. If you are missing {nouns}, please come by. If you are not missing {nouns} but would like some, please also come by.'],
        ['', 'Bulletin deadlines are firm. When we say Wednesday at noon, we mean Wednesday at noon, not “Wednesday, give or take, depending on {sport}.” Announcements that arrive late will run in the next bulletin, or in whichever one we can find them.'],
        ['', 'Finally, a reminder that the {place} is not a storage unit, however much it has been acting like one. The {adj2} {noun} in the corner has been there since March. We have named it. We would like it to go home.'],
        ['', 'As we are told it is often said around here, {saying} We have it on a sticky note above the phone, next to the other {number2} sticky notes.']
      ]
    },
    {
      id: 'forecast', group: 'Something different', format: 'forecast', name: 'The parish weather report', voice: 'Cheerful meteorologist',
      kicker: 'The parish weather service', title: 'Sunday Morning Forecast',
      desc: 'Live conditions in the parking lot, the coffee hour outlook and a seven-day look at folding chairs.',
      closing: 'That is the forecast. Please stay inside the lines in the parking lot, and have a lovely week.',
      sections: [
        ['Right now', 'Good morning, parish! It is currently {adj} in the {place}, with scattered {nouns} and a {number} percent chance that someone says, “I’ll only be a minute.”'],
        ['Parking lot radar', 'A slow-moving front of {vehicle} traffic is stalled at the main exit, where one very polite driver is waving everyone ahead of him. Expect delays of up to {number2} minutes, and a standoff at the stop sign that no one will win.'],
        ['Coffee hour outlook', 'Conditions look favorable for {food}, with a low-pressure system forming near the {drink} dispenser. The donut table will clear by 10:05. If you want one, a strong and confident approach is recommended. Shortages of {food} are possible by late morning.'],
        ['Indoor conditions', 'The hall is currently {adj2}, depending on who you ask. Meteorologists remind you that a sweater is a layer, not a surrender.'],
        ['The extended forecast', 'Monday: {adj}, with a chance of {nouns}. Tuesday: bake sale, with scattered {food}. Wednesday: a {sound} from somewhere in the {place}, source unknown. Thursday: {hobby} club, wind from the west. Friday: fish fry, possible. Weekend: more of the same, but with a casserole.'],
        ['Advisory', 'A Folding Chair Advisory remains in effect until further notice. If you see one, do not fold it. Stack it.']
      ]
    },
    {
      id: 'gameshow', group: 'Something different', format: 'script', name: 'The great parish showdown', voice: 'Game show host',
      kicker: 'Live from the parish hall', title: 'The Great Parish Showdown',
      desc: 'A game show with two teams, a mystery casserole round and a lightning round about the parking lot.',
      closing: 'Thanks for playing, and drive safely!',
      sections: [
        ['Welcome back', 'Welcome back, folks, to The Great Parish Showdown! Today our two teams, the Early Birds and the Parking Lot Veterans, are competing for the coveted trophy, which is {a:adj2} {noun}, spray-painted gold. Let’s meet our contestants. One has not missed a potluck in {number2} years. The other has never once brought the {dish}. Neither will say why.'],
        ['Round one: Name that casserole', 'Our contestants will taste {number} mystery dishes. First question: it’s {adj}, it’s beige, and it has appeared at every potluck since the {sport} league began. Is it (A) {dish}, (B) {food} casserole, or (C) “I’d rather not say”? The answer is all three. Everybody gets a point.'],
        ['Round two: Speed stacking', 'Each team has ninety seconds to stack as many {nouns} as they can. Points will be deducted for {verb}, for dropping a chair on a toe, and for “supervising.” Ooh, and Team Lot has one down. That is going to leave a mark.'],
        ['The lightning round', 'Rapid fire! Who parks in the same spot every Sunday? Everyone! Who thinks the {appliance} works better if you hit it? Everyone! Who knows how the {sound} started? No one! Who still owes the parish a casserole dish? Please see the freezer.'],
        ['The final question', 'Here is our final question, worth {number2} points. What is the most common thing heard in the {place}? Our survey says: {saying} Correct!'],
        ['The prizes', 'Our winners take home a lifetime supply of {nouns}, a hand-lettered certificate, and the best parking spot, closest to the door, for one whole week. Runners-up receive a warm handshake and a coupon for {food}.']
      ]
    },
    {
      id: 'mystery', group: 'Something different', format: 'story', name: 'The case of the missing thing', voice: 'Noir detective',
      kicker: 'A parish mystery', title: 'The Case of the Missing {noun}',
      desc: 'A hard-boiled detective, three clues and a twist about who has been holding it all along.',
      closing: 'Case closed. Please return your folding chairs.',
      sections: [
        ['The call', 'It was a slow Tuesday at the parish office when the call came in. Somebody had lost the {noun}. Not just any {noun}: the {adj} one, with the good handle. I set down my {drink} and picked up my clipboard. This was going to be a long coffee hour.'],
        ['Clue one', 'The first witness was the {animal} behind the {place}. Cool customer. It wouldn’t say where it had been, but it did say it had seen {number} people near the supply closet, and that one of them was carrying {nouns}. In this parish, that tells you nothing. Everybody carries {nouns}.'],
        ['Clue two', 'At the {place}, I found a half-eaten {dish}, a trail of {adj2} footprints, and a {sound} I could not place. The sign-up sheet had been altered. Somebody had written “{verb}” next to their name, in handwriting I had seen before. The pen on the string was still attached. Whoever did this was careful, or lazy.'],
        ['Clue three', 'My old partner used to say, {saying} I always thought that was nonsense. Then I looked down. I looked at my left hand. I looked back at the clipboard in my right hand.'],
        ['The twist', 'The {noun} was in my left hand the whole time. I had been carrying it since Sunday. I returned it to its rightful place, which was the {place}, and nobody ever spoke of it again. The coffee was free and the donuts were gone.']
      ]
    },
    {
      id: 'faq', group: 'Something different', format: 'qa', name: 'Frequently asked questions', voice: 'Patient front desk',
      kicker: 'Frequently asked', title: 'Questions We Hear at the Parish Office',
      desc: 'Seven questions the parish office hears every week, answered with great patience.',
      closing: 'Still have a question? We are open 9 to 4, except for lunch.',
      sections: [
        ['Where should I park?', 'Anywhere you like, as long as it is not the spot next to the door, which belongs to someone who has not been seen in {number2} years. A {vehicle} in the fire lane is just a suggestion for the rest of us to be patient.'],
        ['What time does coffee hour start?', 'Whenever the {appliance} says it does. It has never once been wrong, and it has never once been on time.'],
        ['Who owns the {adj} {noun} by the front door?', 'We have asked. Our records say you do. Please take it home. It has been there for {number} weeks and is starting to look like part of the building.'],
        ['Can I sign up for the potluck?', 'Absolutely. We need {dish} and {nouns}. We have plenty of {food}. We do not need any more {food}.'],
        ['How long are the announcements?', 'Brief. As we often say around here, {saying} Please note that “brief” is a relative term.'],
        ['Is the thermostat broken?', 'No. It is working exactly as designed. It has been set to {number} degrees by three different people, each of whom is certain they are right.'],
        ['What if I have more questions?', 'Please see the sign-up sheet. We are not sure why, but that is where we put everything.']
      ]
    },
    {
      id: 'countdown', group: 'Something different', format: 'countdown', name: 'Countdown to the parish festival', voice: 'Frazzled committee chair',
      kicker: 'Festival countdown', title: 'Ten Days to the Festival',
      desc: 'A countdown from the first committee meeting to the morning after the fall festival.',
      closing: 'See you next year. Bring a chair.',
      sections: [
        ['10 days to go', 'The festival committee meets. It is agreed that this year will be simpler. The agenda has {number} items, and the first one is the {noun}.'],
        ['7 days to go', 'The {food} order is placed. It is the wrong order. It is placed again. Somewhere, a volunteer begins {verb}, and no one is sure whose idea that was.'],
        ['3 days to go', 'A {sport} tournament is announced. Rules are posted. They are immediately argued about. The {adj} tent arrives. Nobody can find the instructions, and eleven people are sure they have put one up before.'],
        ['The day before', 'Someone says, “It will all come together.” It will not come together until about 9:55 tomorrow morning. It never does until then. The forecast says rain. Everyone nods wisely and orders a second tent.'],
        ['Festival day', 'Gates open. The first person in line asks when the {food} will be ready. The answer is ten minutes. It is gone five minutes after that. By noon there are {number2} {nouns} in the lost and found, and the {appliance} has made a {sound} for the very first time.'],
        ['The day after', 'The tent is down. The tables are folded. The leftover {food} goes home in bags. Father says, {saying} The committee schedules a meeting.']
      ]
    },
    {
      id: 'rules', group: 'Something different', format: 'list', name: 'House rules for the parish kitchen', voice: 'Sign taped to the fridge',
      kicker: 'Posted in the kitchen', title: 'House Rules for the Parish Kitchen',
      desc: 'Eight numbered rules for the kitchen, as taped to the fridge by someone who has seen things.',
      closing: 'These rules were approved by the parish council by a vote of {number} to {number2}.',
      sections: [
        ['Rule 1', 'If you open it, close it. If you start it, finish it. If you break the {appliance}, tell someone, preferably before the next potluck.'],
        ['Rule 2', 'The {adj} {noun} on the top shelf is not yours. It is not anyone’s. It has been there since before the renovation. Do not ask. Do not touch.'],
        ['Rule 3', 'All {dish} must be labeled with the cook’s name, the date, and an honest list of ingredients. We love you, but we have been surprised before.'],
        ['Rule 4', 'Nobody may start {verb} until the counters have been wiped down. This includes the person who brought the {food}. This includes you.'],
        ['Rule 5', 'The coffee urn belongs to everyone, which means it belongs to no one, which means it is empty. If you take the last cup, make more. This is the oldest rule in the building.'],
        ['Rule 6', 'Wash your own {nouns}. Dry your own {nouns}. Put your own {nouns} back where you found them. Where you found them is a mystery, so use your best judgment.'],
        ['Rule 7', 'Any dispute about the thermostat will be settled by whoever is coldest, who will be ignored.'],
        ['Rule 8', 'As our pastor likes to say, {saying} Please read it out loud, twice, before you leave.']
      ]
    },
    {
      id: 'story', group: 'Something different', format: 'story', name: 'The one that wouldn’t quit', voice: 'Storyteller first, point last',
      kicker: 'A short story', title: 'The {machine} That Wouldn’t Quit', saint: 'joseph',
      desc: 'A story first: a donated thing that never quite worked, and the quiet person who fixed it.',
      sections: [
        ['', 'Every parish has one: {a:adj} {machine} that arrived {number} years ago in the back of a {vehicle}, with a note that said “works great.” It did not work great. It worked the way a {animal} works: eventually, and mostly on its own terms.'],
        ['', 'We tried everything. We tried new batteries, new oil, and {number2} volunteers standing around giving advice. Somebody brought {food}. Nothing helped. The {machine} made one long {sound} and went silent, and the whole {place} held its breath.'],
        ['', 'Then a very quiet volunteer, who had been {hobby} in the back all morning, set down their coffee, walked over, gave one small bolt a quarter turn, and said nothing. The {machine} started on the first pull. To this day, nobody knows how they knew.'],
        ['The point', 'Here is what I take from it. Every parish is full of quiet people with the right small skill, who show up, turn one bolt, and go home. We should thank them. We should also stop giving advice. As I like to say, {saying}']
      ]
    },
    {
      id: 'short', group: 'Something different', format: 'homily', name: 'The two-minute homily', voice: 'Very short, very sincere',
      kicker: 'Very brief', title: 'The Whole Thing, in Under Two Minutes',
      desc: 'One short paragraph for anyone who has seen the parking lot and knows what is waiting out there.',
      closing: 'Running time: one minute, forty seconds. Applause optional.',
      sections: [
        ['Your homily, in full', 'Good morning. I will keep this short, because I have seen the parking lot, and I know what is waiting out there. Here is all of it: be kind, bring {food}, and if you find {a:adj} {noun} that is not yours, return it. And as you leave, remember: {saying} Now go. The {drink} is getting cold.']
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
  /* Every place a template can hold a blank: its title, section labels, section text and closing. */
  function texts(t) {
    var all = [t.title, t.closing || ''];
    t.sections.forEach(function (s) { all.push(s[0], s[1]); });
    return all;
  }
  function fieldsOf(t) {
    var used = {};
    texts(t).forEach(function (x) { x.replace(/\{(?:a:)?(\w+)\}/g, function (_, k) { used[k] = 1; }); });
    return ORDER.filter(function (k) { return used[k]; });
  }
  function saintById(id) { for (var i = 0; i < SAINTS.length; i++) if (SAINTS[i][0] === id) return SAINTS[i]; return SAINTS[0]; }
  function pick(list, rnd) { return list[Math.floor((rnd || Math.random)() * list.length)]; }
  /* Random words for every blank a template uses, never the same word twice for a pair of blanks. */
  function surprise(t, rnd) {
    var v = {};
    fieldsOf(t).forEach(function (k) {
      var w = pick(WORDS[k], rnd), pair = { adj2: 'adj', number2: 'number' }[k];
      for (var i = 0; pair && v[pair] === w && i < 20; i++) w = pick(WORDS[k], rnd);
      v[k] = w;
    });
    return v;
  }
  function titleCase(x) { return x.replace(/(^|[\s-])([a-z])/g, function (_, a, c) { return a + c.toUpperCase(); }); }
  /* Plain-text fill, for titles, labels and the closing. */
  function fill(text, values, caps) {
    return String(text || '').replace(/\{(a:)?(\w+)\}/g, function (_, art, k) {
      var v = tidy(k, values[k]);
      if (caps) v = titleCase(v);
      return (art ? article(v) + ' ' : '') + v;
    });
  }
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
      return { label: fill(s[0], values), pieces: pieces };
    });
    var st = t.saint ? saintById(saintId || t.saint) : null;
    return {
      format: t.format || 'homily', kicker: t.kicker || '',
      title: fill(t.title, values, true), sections: sections,
      closing: fill(t.closing, values),
      invocation: st ? st[1] + ', patron of ' + st[2] + ', pray for us.' : ''
    };
  }
  function toText(h, extra) {
    var out = [h.title, ''];
    h.sections.forEach(function (s) {
      if (s.label) out.push(h.format === 'qa' ? s.label : s.label.toUpperCase());
      out.push(s.pieces.map(function (p) { return typeof p === 'string' ? p : p.text; }).join(''));
      out.push('');
    });
    if (h.closing) { out.push(h.closing); out.push(''); }
    if (h.invocation) { out.push(h.invocation); }
    if (extra) { out.push(''); out.push(extra); }
    return out.join('\n').replace(/\n{3,}/g, '\n\n').trim();
  }

  var api = { FIELDS: FIELDS, ORDER: ORDER, WORDS: WORDS, SAINTS: SAINTS, TEMPLATES: TEMPLATES, check: check, build: build, toText: toText, fieldsOf: fieldsOf, texts: texts, surprise: surprise, article: article, tidy: tidy, pick: pick };
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; return; }
  root.Homily = api;
})(this);
