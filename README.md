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

## Contact form (Resend)
1. In Resend, make sure fatherstoolbox.com is a verified sending domain (or use another verified domain; see `CONTACT_FROM`).
2. Pages project, Settings, Variables and Secrets (Production): add `RESEND_API_KEY` as a secret. Optional: `CONTACT_FROM`, `CONTACT_TO`.
3. Redeploy (Deployments, latest, Retry deployment), then send a test from the Contact page.
Until the key is set, the form answers "not set up yet" instead of sending.

## Preview locally
`npx wrangler pages dev public`, then open http://localhost:8788.
