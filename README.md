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
- `public/`: the static site, `styles.css`, `liturgy.js`, `favicon.svg`, self-hosted fonts (EB Garamond is used; the Inter files are unused leftovers; SIL OFL). Nothing loads from third parties.
- `src/worker.js`: Cloudflare Worker serving `public/` and handling `/api/contact`.
- `wrangler.toml`: contact form emails `CONTACT_TO` (darwin.sayo@gmail.com).
- `previews/`: desktop (1440px) and mobile (iPhone 13) screenshots of each page.

## Preview locally
`npx wrangler dev`, then open http://localhost:8787.

## Deploy (## Deploy (Cloudflare Workers, connected to this GitHub repo)
Every push to `main` deploys automatically.

**One-time setup**
1. Cloudflare dashboard, Workers & Pages, Create, Import a repository. Pick `darwinsayo/fatherstoolbox-site`. The project name must be `fatherstoolbox` (it has to match `name` in `wrangler.toml`). Leave the build command empty and the deploy command as `npx wrangler deploy`.
2. Once it deploys, open the `fatherstoolbox` Worker, then Settings, Domains & Routes, Add, Custom domain. Add `fatherstoolbox.com`, then `www.fatherstoolbox.com`. Confirm if Cloudflare offers to replace existing DNS records for those names.

**Contact form email (later)**
The form is switched off until email is set up: it answers "not switched on yet" instead of sending.
1. Cloudflare, fatherstoolbox.com, Email, Email Routing: turn it on (check first if the domain already receives email elsewhere; this replaces its MX records). Add darwin.sayo@gmail.com as a destination and click the verification link in Gmail.
2. In `wrangler.toml`, remove the `# ` from the three `send_email` lines and push. Then send a test message from the Contact page.
