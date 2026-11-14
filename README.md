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
- `public/`: the static site (pages, `styles.css`, `liturgy.js`, `favicon.svg`, self-hosted EB Garamond under the SIL OFL; the Inter font files are unused leftovers). Nothing loads from third parties.
- `functions/api/contact.js`: a Cloudflare Pages Function that sends the contact form to darwin.sayo@gmail.com through Resend.

## Deploy (Cloudflare Pages, connected to this GitHub repo)
Every push to `main` deploys automatically.

1. Cloudflare dashboard, Workers & Pages, Create, Pages, Import an existing Git repository. Pick `darwinsayo/fatherstoolbox-site`.
2. Build settings: Framework preset None, build command empty, build output directory `public`. Save and Deploy.
3. Pages project, Custom domains, Set up a custom domain: add `fatherstoolbox.com`, then `www.fatherstoolbox.com`.

## Pages
Home (`index.html`), About, Resources (`resources.html`, which lists Parish times under `/parishtimes/` the Liturgical calendar under `/calendar/` and the fill-in-the-blank homily under `/homily/`), Contact and a 404 page.

## Contact form (Resend)
1. In Resend, make sure fatherstoolbox.com is a verified sending domain (or use another verified domain; see `CONTACT_FROM`).
2. Pages project, Settings, Variables and Secrets (Production): add `RESEND_API_KEY` as a secret. Optional: `CONTACT_FROM`, `CONTACT_TO`.
3. Redeploy (Deployments, latest, Retry deployment), then send a test from the Contact page.
Until the key is set, the form answers "not set up yet" instead of sending.

## Preview locally
`npx wrangler pages dev public`, then open http://localhost:8788.

---

## Parish times (moved from manymanytoes.com)

- `public/parishtimes/` holds the "All dioceses" page and one live map each for the Diocese of Covington (53 parishes), the Diocese of Lexington (58) and the Archdiocese of Cincinnati (93, Cincinnati area). Each map is a single self-contained HTML file; the parish data and times live in the `DATA` object inside its `<script>`.
- They were ported from the Eleventy site as-is. Only the look changed to match this site (limestone, lapis, EB Garamond), plus links and the site name in the search-engine data.
- `parishcheck/` is the private list of parishes to check by hand. It sits outside `public/`, so it is never published. `.pages.yml` lets Pages CMS edit it, as before.
- Rules for the times: only the parish's own website counts (Facebook is not a website), never guess, confession with no end time gets 30 minutes, no communion services, all times Eastern.

---

## Liturgical calendar (`/calendar/`)

- The Roman Rite as observed in the dioceses of the United States: the General Roman Calendar plus the Proper Calendar for the USA. Month view, day detail (rank, color, season and week, Sunday and weekday cycles, optional memorials, transfers, holy days of obligation), a to-scale season band, the year's movable dates and holy days, and an `.ics` download of solemnities, feasts and holy days (memorials optional).
- `public/calendar/ordo.js` does all the liturgical work, in the browser, for any year from 1970 to 2199. Movable celebrations come from rules (Easter computus, Advent, Epiphany on the Sunday between Jan 2 and 8, Ascension on Sunday or, as an option, Thursday in the provinces of Boston, Hartford, New York, Omaha and Philadelphia), and precedence and transfers follow the Table of Liturgical Days. Saints are one table, `SAINTS`, at the top of the file.
- Readings are linked to bible.usccb.org, never copied.
- `node tests/ordo.test.js` checks the Easter computus against a second algorithm (1583 to 4099), checks the seasons against `liturgy.js` every day 1970 to 2199, checks transfer rules against years when they happened, and compares every day of 2025, 2026 and 2027 with the USCCB calendars (`tests/usccb/*.txt`, facts read from the USCCB PDFs).
- When the Church adds a saint or the USCCB changes the US calendar: add a line to `SAINTS` (with the first year, so earlier years stay as they were), add the next year's USCCB calendar to `tests/usccb/`, and run the test.

## The fill-in-the-blank homily (`/homily/`)
A lighthearted word game about parish life. Fourteen templates in different shapes (homilies, a letter, a weather report, a game show, a mystery, a Q and A, a countdown, house rules), with word lists, patron saints and the word filter are in `public/homily/homily.js`; its content rules are at the top of that file. Everything runs in the browser and nothing is stored. Check it with `node tests/homily.test.js`.
