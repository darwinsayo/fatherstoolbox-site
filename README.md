# Father's Tool Box site (fatherstoolbox.com)

A design polish of version 3 (`../fatherstoolbox-site-v3`, left untouched). Wording, facts and Scripture are unchanged; only the design moved.

## Design changes from version 3
- **Palette**: limestone page instead of cream paper. Lapis (ultramarine) is now the main accent for buttons, links and initials. Vermilion is kept for rubrics only, as in a missal, and gold leaf marks what is holy.
- **Type**: one family, EB Garamond, used like a printer would. Labels are red small capitals in place of tracked sans-serif caps, each page headline opens with a lapis versal initial, and numbers use old-style figures. Inter is no longer loaded.
- **One moment of motion**: when the page loads, light passes once through the stained glass window. Nothing else animates, and the effect is off for visitors who ask for reduced motion.
- **The liturgical year drawn to scale**: a band shows the current liturgical year, from the First Sunday of Advent onward, in its real proportions with a "Today" marker. It is computed in `liturgy.js`.
- **Less chrome**: the ribbon of service names, the i/ii/iii numerals on services (they are not a sequence), the arrows on buttons and the italic red words in headlines are gone. Roman numerals stay on How We Work, because that is a real sequence.
- How We Work sits in a deep lapis band. The closing call is a vellum holy card with a gold rule, and the services sit on a single vellum leaf.

---

## Carried over from version 3

### Catholic content (from v3)
- **Hero window**: a Gothic stained glass window, a rose window with the Chi-Rho at its centre above two lancets bearing Alpha and Omega (Revelation 22:13).
- **Liturgical season**: a top band ("Laudetur Iesus Christus") shows the Church's current season with its colour. `public/liturgy.js` works it out in the visitor's browser (Easter computus; US calendar, where Epiphany is the Sunday between Jan 2 and 8). Checked against 2024 to 2027 dates.
- **Through the liturgical year** (home): Advent, Christmas, Ordinary Time, Lent, Triduum, Easter and Pentecost, with liturgical colours and what the parish communicates in each. Today's season is marked "Now".
- **Scripture** throughout (NABRE, checked against bible.usccb.org): Romans 10:14 (home), Romans 10:17 (About), Matthew 7:7 (Contact), and one verse for each How We Work step: Luke 14:28, James 1:22, Proverbs 27:23, 1 Thessalonians 5:21. Shortened verses end in an ellipsis.
- **Services** now list concrete parish items (Mass, Confession and Adoration times, sacrament preparation, OCIA, bulletin, Advent/Lent/Holy Week schedules, livestreams).
- **About** adds "In the Church's tradition": Vatican II's decree *Inter Mirifica* (1963, which also began World Communications Day) and St. Francis de Sales, named patron of writers and the Catholic press by Pius XI in 1923.
- **Contact form** adds an optional "Your role" (Pastor, Parochial vicar, Deacon, Parish staff, ...) and "Parish or diocese". `src/worker.js` includes both in the email.
- Footer: "Ad maiorem Dei gloriam" and a short invocation of St. Francis de Sales. The 404 page asks St. Anthony's help.

## What is here
- `public/`: the static site (pages, `styles.css`, `liturgy.js`, `favicon.svg`, self-hosted EB Garamond under the SIL OFL; the Inter font files are unused leftovers). Google Tag Manager (container GTM-NX2D9ZXR) loads on every public page for analytics; the admin pages are left out. Nothing else loads from third parties.
- `functions/api/contact.js`: a Cloudflare Pages Function that sends the contact form to darwin.sayo@gmail.com through Resend.

## Deploy (Cloudflare Pages, connected to this GitHub repo)
Every push to `main` deploys automatically.

Stylesheets and scripts are linked with a version tag, such as `/styles.css?v=20261114`. When you change a `.css` or `.js` file, change the tag on every page that loads it, so browsers fetch the new copy instead of an old cached one.

1. Cloudflare dashboard, Workers & Pages, Create, Pages, Import an existing Git repository. Pick `darwinsayo/fatherstoolbox-site`.
2. Build settings: Framework preset None, build command empty, build output directory `public`. Save and Deploy.
3. Pages project, Custom domains, Set up a custom domain: add `fatherstoolbox.com`, then `www.fatherstoolbox.com`.

## Pages
Home (`index.html`), About, Resources (`resources.html`, which lists Parish times under `/parishtimes/` the Liturgical calendar under `/calendar/`, the fill-in-the-blank homily under `/homily/` and The Library under `/library/`), Contact and a 404 page.

## Contact form (Resend)
1. In Resend, make sure fatherstoolbox.com is a verified sending domain (or use another verified domain; see `CONTACT_FROM`).
2. Pages project, Settings, Variables and Secrets (Production): add `RESEND_API_KEY` as a secret. Optional: `CONTACT_FROM`, `CONTACT_TO`.
3. Redeploy (Deployments, latest, Retry deployment), then send a test from the Contact page.
Until the key is set, the form answers "not set up yet" instead of sending.

## Preview locally
`npx wrangler pages dev public`, then open http://localhost:8788.

---

## Parish times (moved from manymanytoes.com)

- `public/parishtimes/` holds the "All dioceses" page and one live map each for the Diocese of Covington (53 parishes), the Diocese of Lexington (58), the Archdiocese of Cincinnati (93, Cincinnati area) and the Diocese of Kansas City-St. Joseph (88, added 14 Nov 2026) the Diocese of Oakland (75, California, added 14 Nov 2026) and the Archdiocese of San Francisco (90, California, added 15 Nov 2026). Each map is a single self-contained HTML file; the parish data and times live in the `DATA` object inside its `<script>`.
- They were ported from the Eleventy site as-is. Only the look changed to match this site (limestone, lapis, EB Garamond), plus links and the site name in the search-engine data.
- `parishcheck/` is the private list of parishes to check by hand. It sits outside `public/`, so it is never published. `.pages.yml` lets Pages CMS edit it, as before.
- Rules for the times: only the parish's own website counts (Facebook is not a website), never guess, confession with no end time gets 30 minutes, no communion services. Times are shown as the parish posts them: Eastern for the Kentucky and Cincinnati maps, Central for Kansas City-St. Joseph and Pacific for Oakland and San Francisco, whose pages label their times and live clocks.

---

## Liturgical calendar (`/calendar/`)

- The Roman Rite as observed in the dioceses of the United States: the General Roman Calendar plus the Proper Calendar for the USA. Month view, day detail (rank, color, season and week, Sunday and weekday cycles, optional memorials, transfers, holy days of obligation), a to-scale season band, the year's movable dates and holy days, and an `.ics` download of solemnities, feasts and holy days (memorials optional).
- `public/calendar/rubrics.js` adds, for each day, "At the altar" (Gloria, Creed, Alleluia, Sequence, flowers and music, vestments, funeral, ritual and votive Masses, fasting and abstinence), a Liturgy of the Hours guide (psalter week, which Office, Te Deum, Evening Prayer I, links to Universalis for the texts) and a note on the season. Each rule cites the GIRM, GILH, Universal Norms or Code of Canon Law; no liturgical text is reproduced.
- `public/calendar/ordo.js` does all the liturgical work, in the browser, for any year from 1970 to 2199. Movable celebrations come from rules (Easter computus, Advent, Epiphany on the Sunday between Jan 2 and 8, Ascension on Sunday or, as an option, Thursday in the provinces of Boston, Hartford, New York, Omaha and Philadelphia), and precedence and transfers follow the Table of Liturgical Days. Saints are one table, `SAINTS`, at the top of the file.
- Readings are linked to bible.usccb.org, never copied.
- `node tests/ordo.test.js` checks the Easter computus against a second algorithm (1583 to 4099), checks the seasons against `liturgy.js` every day 1970 to 2199, checks transfer rules against years when they happened, and compares every day of 2025, 2026 and 2027 with the USCCB calendars (`tests/usccb/*.txt`, facts read from the USCCB PDFs).
- When the Church adds a saint or the USCCB changes the US calendar: add a line to `SAINTS` (with the first year, so earlier years stay as they were), add the next year's USCCB calendar to `tests/usccb/`, and run the test.

## The fill-in-the-blank homily (`/homily/`)
A lighthearted word game about parish life. Templates, word lists, patron saints and the word filter are in `public/homily/homily.js`; its content rules are at the top of that file. Everything runs in the browser and nothing is stored. Check it with `node tests/homily.test.js`.

## The Library (`/library/`)

A small shelf of public-domain Catholic books to read on the site, listed under Resources. Each book is split into chapter pages. Readers can search across the books and highlight passages.

- **Where things are.** `library/books/*.json` holds each book as cleaned text (one file per book: its title, author, edition credit, parts and chapters). `library/build.mjs` turns those files into the pages under `public/library/`. `public/library/library.css`, `library.js` and `search.js` are written by hand. Everything else under `public/library/` is generated, and is committed because the site has no build step on Cloudflare.
- **After any change** to a book file, to `library/build.mjs`, or to the site's header, menu or footer, run `sh library/rebuild.sh` from the repository root (it needs Node 18 or later and downloads Pagefind 1.6.0 the first time). It rewrites the pages, takes the header and footer from `public/resources.html` so they always match the rest of the site, and rebuilds the search index in `public/library/pagefind/`. If `library.css` or a script changes, raise `VERSION` in `library/build.mjs` so browsers fetch the new file.
- **Search** is [Pagefind](https://pagefind.app): the index is a set of small static files, and the search runs in the reader's browser. Nothing is sent to a server.
- **Highlights, text size, day or night, and "continue reading"** are saved in the reader's own browser (`localStorage`, keys starting `ftb.library.`). There are no accounts. Clearing site data removes them, so the My highlights page offers a download.
- **Editions.** Only public-domain editions are used, and each book's pages credit the edition. `library/coming.json` lists books promised but not yet prepared, which the front page names until they are built (all five are built now, so it is empty).
- **Introduction to the Devout Life** comes from three library scans of the same printing (Frederick Pustet & Co., undated, about 1900) on the Internet Archive: `introductiontodefran`, `introductiontode00franuoft` and `introductiontode0000fran_h2t6`. `library/import/devout_life.py` compares the three scans word by word and keeps the reading two of them agree on, then applies `library/import/devout_life_fixes.json`: chapter titles, each chapter's opening words (the ornamental initials cannot be read by a scanner), about 300 corrections of words the scans or the printer got wrong, and the edition's three footnotes. To correct a slip in the text, add a `[wrong, right]` pair under that chapter's number in `words` and run the importer again (`pip install english-words`, then `python3 library/import/devout_life.py <folder holding the three scans' *_djvu.html files from archive.org>`), then `sh library/rebuild.sh`. The two corrected Scripture references (Gen. xxviii and Ps. xciv, misprinted in the edition) are in the same file.
- **The Imitation of Christ** is Bishop Challoner's Catholic translation (Cummiskey, Philadelphia, 1838), taken from an Archive.org scan of the printing (`imitation-TheFollowingOfChrist1838.txt`) and compared against the 1819 London printing. `library/import/challoner.py <folder holding the two scans>` cleans the scan's recognition errors (rules in the script, hand repairs in `library/import/challoner_fixes.json`; `--report` lists what it could not settle). The text has been spot-read, not proofread in full. Then `sh library/rebuild.sh`.
- **The other three books** come from Project Gutenberg's plain-text ebooks (fetched through Archive.org's copies; Gutenberg's own header, licence and name are dropped). `library/import/gutenberg.py` imports *The Baltimore Catechism No. 2* (ebook 14552) and *Orthodoxy* (ebook 130); `library/import/douay_rheims.py` imports the Douay-Rheims Bible (Challoner revision, ebook 8300). Run `python3 -I library/import/gutenberg.py <folder holding pg14552.txt and pg130.txt>` or `python3 -I library/import/douay_rheims.py <folder holding pg8300.txt>`, then `sh library/rebuild.sh`. The ebook of the Bible has typing slips: wrong verse numbers, a few lost verses and about 150 misspelled words. `library/import/douay_rheims_fixes.json` lists every repair (exact text replacements, missing verses supplied from the 1914 John Murphy Company printing on Archive.org, and whole-word spelling fixes), and `python3 -I library/import/douay_rheims.py <folder> --report` lists any place where the verse numbers still do not run in order (it should print 0). Psalms 9 and 113 continue their verse numbers past the point where the printing starts again at 1, so that each verse has its own number.

## Events and RSVPs
Events are organized by parish:

- `/events/`: all upcoming events across parishes, with a parish filter (`public/events/index.html`).
- `/parishes/<parish>/`: one parish's events.
- `/parishes/<parish>/events/<event>/`: an event page. Each event page is its own hand-designed HTML file (the Advent flyer look lives in `advent-lessons-carols`). Placeholders are highlighted yellow (`class="ph"`).
- `public/events.json` lists the parishes and events that the two list pages show.
- Short links in `public/_redirects`: `/event/` and `/adventcarols` (Advent Lessons & Carols), `/openhouse` (Parish Open House), `/christmaswalk` (Warm Up at Urlage Hall during the Christmas Walk), `/raffle` (its raffle entry page; entries are saved as event `christmas-walk-raffle`).

**Add a parish:** add it to `events.json` and copy `public/parishes/st-cecilia/index.html` to `public/parishes/<slug>/index.html` (change the name, text and `data-parish`).
**Add an event:** copy an existing event folder to `public/parishes/<parish>/events/<event>/`, edit it, (if it has an RSVP form) change the two hidden `parish` and `event` fields in the form. An event with no RSVP, like the concert, simply has no form. Add a matching entry to `events.json` (with `"rsvp": true` if the page has a form).

RSVPs post to `functions/api/rsvp.js`, which stores them in a Cloudflare D1 database (no email service needed), saved with the parish and event slugs. One-time setup: Cloudflare dashboard, Storage & Databases, D1, create a database (for example `fatherstoolbox-rsvps`); run `db/schema.sql` in its Console tab; then Pages project, Settings, Bindings, add a D1 database binding named `RSVP_DB` (Production, and Preview if wanted) and redeploy. Until the binding exists the form shows an error message. Responses for one parish: `SELECT * FROM rsvps WHERE parish = 'st-cecilia' ORDER BY id;`.

## Raffle drawing (private)
`/admin/raffle/` (not linked anywhere, `noindex`) lists the Christmas Walk raffle entries (name and email), draws a winner with crypto randomness, lets you draw alternates (a drawn entry is never drawn twice) and downloads the entries as CSV (with phone and whether they ticked "add me to Urlage Hall event emails"). One entry counts per email address. Draws are recorded in the `raffle_draws` D1 table, which the function creates itself. It is protected by the `ADMIN_PASSWORD` secret: Pages project, Settings, Variables and Secrets, add `ADMIN_PASSWORD` (type Secret, Production), then redeploy. The password is never in the repo. The API is `functions/api/admin/raffle.js`.
