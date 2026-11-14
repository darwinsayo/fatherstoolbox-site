# Parish times across many dioceses: design and data plan

Status: proposal, 14 Nov 2026. Nothing here adds a diocese. The prototype lives at `/parishtimes/prototype/` (not linked from any menu, marked `noindex`).

## 1. The landing page (prototype)

The two ideas Darwin chose are the core of the page; the rest is kept small.

**Map first.** One map of Kentucky, Ohio and Indiana, drawn by diocese.
- Live dioceses are lapis blue with parish dots. Dioceses not yet mapped are grey and say "coming soon".
- The Archdiocese of Cincinnati is shown as *partly covered*: the four Cincinnati-area counties we have (Butler, Clermont, Hamilton, Warren) are solid, the other 15 counties pale.
- Clicking or tapping a diocese opens a side panel (below the map on a phone): title, province, a status block and either **Open the map** or, for a coming-soon diocese, a link to ask for it and a link to the diocese's own parish finder.
- On a phone the diocese names are hidden on the map (they would be too small) and the panel and list do that work.

**Grouped by ecclesiastical province.** Below the map, one column per province, metropolitan see first, then its suffragans:
- Province of Louisville: Archdiocese of Louisville; Dioceses of Covington, Lexington, Owensboro, and the Tennessee dioceses of Knoxville, Memphis and Nashville (listed, "not on this map yet").
- Province of Cincinnati: Archdiocese of Cincinnati; Dioceses of Cleveland, Columbus, Steubenville, Toledo, Youngstown.
- Province of Indianapolis: Archdiocese of Indianapolis; Dioceses of Evansville, Fort Wayne-South Bend, Gary, Lafayette in Indiana.

In this region each province's borders follow state lines (apart from Tennessee), so the heavy outline on the map serves as the province line.

**Secondary, kept light:**
- One line of tools above the map: a search box (diocese, city or county), state chips (All, Kentucky, Ohio, Indiana) and "Parishes near me".
- Search knows diocese names, principal cities, every county, and every town with a mapped parish. Ambiguous names list each match (for example Dayton, OH and Dayton, KY). ZIP codes are not wired up: that needs a ZIP-to-county table (Census ZCTA file), which is a later step.
- Near me uses the browser's location (it never leaves the browser) and lists the six nearest mapped parishes regardless of diocese, each tagged with its diocese.
- Status line per diocese: parishes on the map, month the times were read, date of the last hand check, number still to confirm. For coming-soon dioceses: the parish count the diocese or a directory reports, marked "about".
- "Ask for your diocese" goes to the Contact page with `?topic=parish-times&diocese=<id>`. The Contact page does not read those yet; a small script there could fill in "Parish or diocese". Not done here to stay clear of the other open pull requests.

Screenshots: `previews/parishtimes-prototype/`.

## 2. Same page for every diocese

Today each diocese is one large self-contained HTML file with its data inline (`const DATA = …`). To make "add a diocese" mean "add data", the plan is:

1. Move the map code and styles out of the three pages into shared `/parishtimes/map.js` and `/parishtimes/map.css`. The three pages are already near-identical, so this is a lift, not a rewrite.
2. Each diocese page becomes a short stub: title, description, crest, and `<script src="/parishtimes/map.js" data-diocese="covington">`. The script loads `/parishtimes/data/dioceses.json` (the registry) and `/parishtimes/data/<id>.json` (parishes).
3. County shapes come from the registry's county lists through `tools/parishtimes/build-region-map.cjs` (public-domain Census shapes via the `us-atlas` package), so no diocese needs hand-drawn geography.
4. The landing page reads the same registry, so the status lines update themselves.

No build step is needed on Cloudflare Pages; the map geometry is generated once on a computer when a diocese is added.

## 3. Data format

### 3a. Registry: `public/parishtimes/data/dioceses.json` (in this pull request)

Top level: `updated` (date), `provinces[]`, `dioceses[]`.

Province:

| Field | Meaning |
|---|---|
| `id` | Short id, the metropolitan's city (`louisville`) |
| `title` | "Province of Louisville" |
| `metropolitan` | Diocese id of the archdiocese |
| `states` | States the province covers |

Diocese:

| Field | Meaning |
|---|---|
| `id` | URL id, lowercase with hyphens (`fort-wayne-south-bend`) |
| `kind` | `archdiocese` or `diocese` |
| `of` | Name after "Diocese of" (`Lafayette in Indiana`) |
| `title` | Full correct title ("Archdiocese of Louisville") |
| `province` | Province id |
| `state` | Main state |
| `timeZone` | IANA zone. Matters: Owensboro, Evansville, Gary, Memphis and Nashville are on Central time; today's pages assume Eastern |
| `status` | `live`, `planned` (in the KY/OH/IN region) or `later` |
| `page`, `data`, `crest` | Paths, for live dioceses |
| `website` | The diocese's own site |
| `coverage` | `{complete, note, counties}`; `complete: false` when only part is mapped |
| `parishes` | Parishes on our map (live only) |
| `unconfirmed` | Parishes whose times still need a hand check |
| `timesReadAsOf` | Month the times were read (`2026-10`) |
| `lastHandCheck` | Date of the last hand check |
| `parishCountReported` | `{value, source, basis, checked, note}`: what the diocese or a directory says, for planning only |
| `counties` | `{ "KY": ["Boone", …] }` |
| `cities` | Principal cities, for search |

### 3b. Parishes: `public/parishtimes/data/<diocese>.json` (proposed)

See `docs/parishtimes/parish.example.json`. One record per church that has its own times (a mission gets its own record with `servedBy`).

| Field | Meaning |
|---|---|
| `id` | `<name>-<town>` slug, stable once published |
| `name`, `town`, `state`, `county`, `address`, `zip` | Where it is |
| `lat`, `lng` | From the address; checked on the map |
| `phone`, `website`, `facebook` | Contacts. Facebook is listed but never used as a source |
| `servedBy` | Parish id of the mother parish, for missions |
| `pastor` | `{name, role}` |
| `mass[]`, `confession[]` | `{day: "Sun".."Sat", start: "HH:MM", end: "HH:MM", vigil, lang, weeks, note, endAssumed}`. `weeks` uses the existing tags (`n1`, `n135`, `bff`, `sem`, …). `endAssumed: true` marks the 30-minute default for a confession with no posted end |
| `confessionByAppointment` | true or false |
| `note` | What a visitor should know |
| `verification.status` | `verified`, `needs_check`, `no_times_posted`, `site_unreachable`, `facebook_only`, `change_reported`, `closed` |
| `verification.checkedOn` | Date (or month) the times were last read |
| `verification.method` | `website`, `bulletin`, `phone`, `parish_email` |
| `verification.source` | Exact URL (page or bulletin PDF) |
| `verification.sourceDated` | Date printed on the source, if any |
| `verification.confidence` | `high`: a dated schedule page or a bulletin from the last 60 days. `medium`: an undated schedule page. `low`: conflicting pages, an old bulletin, or an assumed end time |
| `verification.checkedBy` | Initials |
| `history[]` | `{date, change, source}`, newest last |

The current compact format (minutes from midnight, `v: 1`) maps one-to-one onto this, so a one-time script can convert the three live dioceses. The `parishcheck/` hand-check files become unnecessary: their `status`, `checked_on` and `notes` live in `verification`, and Pages CMS can edit the per-diocese files directly (one `.pages.yml` entry per diocese file).

## 4. Adding a diocese by hand

1. **Registry.** Add the diocese to `dioceses.json` with `status: "planned"`, its counties and time zone. Run the map build and check the shape against the diocese's own map.
2. **Parish list.** Take the list from the diocese's own parish directory (name, address, phone, website). Note missions and which parish serves them. Do not take times from the directory.
3. **First read.** For each parish, open its own website: Mass times page, Reconciliation page, and the latest bulletin. Copy only what it says, with the URL and the date on the source. Same rules as today: no MassTimes or similar, Facebook is not a website, no communion services, never guess.
4. **Mark what is missing.** Anything not found, contradictory or unreachable gets `needs_check` and a note saying why.
5. **Hand check.** A person re-reads the flagged parishes (bulletin first; it is usually the most current). If still nothing, phone the parish office during business hours and record `method: "phone"` with the date and who answered.
6. **Place and review.** Geocode, look at every dot on the map, spot-check ten parishes against their sites.
7. **Go live.** Set `status: "live"`, fill in the status fields, add the crest (only with the diocese's permission, otherwise none), open a pull request.

### Flagging changed times

- Every parish card gets a quiet "Times wrong?" link to Contact, carrying the parish id. A report sets `change_reported` and the times show "may have changed, call to confirm" until checked.
- Scheduled re-reads: all parishes once a quarter, and bulletins just before Advent, Lent, Holy Week and summer, when schedules change most. Holy days and Christmas/Easter specials go in notes, not the weekly grid.
- When a re-read finds a difference, update the times, add a `history` entry with the source, and set `checkedOn`. Any record older than six months shows its date on the card.

## 5. Effort per diocese

What we know from the first three dioceses: 204 parishes mapped; after the first read, 73 (36%) were flagged for a hand check (Covington 17, Lexington 31, Cincinnati 25). The 14 Nov hand checks of Lexington (31) and Cincinnati (25) settled only a few: in Lexington 2 were ready to fill and 1 needed approval; 14 were Facebook-only or had no website, and 9 sites errored or blocked reading. Rural dioceses will have more Facebook-only parishes; phone calls (not tried yet) are the way through those.

We did not log hours, so these rates are estimates, not measurements:

| Step | Estimate |
|---|---|
| First read, per parish | 6 to 10 minutes |
| Hand check, per flagged parish (about 1 in 3) | 15 to 25 minutes, more with a phone call |
| Registry, county map, geocoding, review | 4 to 6 hours per diocese |

That is roughly **15 to 20 minutes per parish all in**, so about **a working day per 25 to 30 parishes**. The first read can be done with Claude's help; the hand check and calls need a person.

## 6. First diocese candidates

Parish counts are what each source reports, checked 14 Nov 2026. Counts change with parish mergers, and several of these dioceses are merging parishes now.

| Diocese | Province | Parishes reported | Source | Est. effort | Notes |
|---|---|---|---|---|---|
| Archdiocese of Cincinnati (remaining 15 counties) | Cincinnati | 209 in all, 93 mapped | catholic-hierarchy.org, 2023 | ~116 parishes, 4 to 5 days | Finishes a diocese we already show; Dayton |
| Archdiocese of Louisville | Louisville | 107 | archlou.org home page (108 parishes and missions on its statistics page) | 4 days | Completes the Kentucky picture with Owensboro |
| Diocese of Owensboro | Louisville | 78 | owensborodiocese.org | 3 days | Central time; county list not confirmed by a source |
| Diocese of Columbus | Cincinnati | 78 | catholic-hierarchy.org, 2025 row (103 in 2023) | 3 days | Merging parishes; diocese site states no count |
| Diocese of Lafayette in Indiana | Indianapolis | 61 | catholic-hierarchy.org, 2023 | 2 to 3 days | County list only from 1944 erection record |
| Diocese of Evansville | Indianapolis | 45 | catholic-hierarchy.org, 2023 | 2 days | Central time |
| Archdiocese of Indianapolis | Indianapolis | 126 | catholic-hierarchy.org, 2023 | 5 days | County list derived, not sourced |
| Diocese of Cleveland | Cincinnati | 184 | dioceseofcleveland.org (undated) | 7 days | Largest |
| Diocese of Toledo | Cincinnati | 121 | Wikipedia, as of 2026 | 4 to 5 days | |
| Diocese of Youngstown | Cincinnati | 62 | doy.org, as of 1 Jan 2026 | 2 to 3 days | |
| Diocese of Fort Wayne-South Bend | Indianapolis | 79 | diocesefwsb.org | 3 days | |
| Diocese of Gary | Indianapolis | 51 | Wikipedia, as of 2025 | 2 days | Central time; a 2026 plan would consolidate parishes |
| Diocese of Steubenville | Cincinnati | about 50 | Wikipedia, undated | 2 days | Count unverified; diocese currently under an apostolic administrator |

Suggested order: finish the Archdiocese of Cincinnati, then Louisville and Owensboro (all of Kentucky), then Columbus.

## 7. What could not be verified

- **County lists.** Confirmed by a source: Louisville (24), Covington (14, also in our data), Gary (4), Fort Wayne-South Bend (14), Cleveland, Columbus, Steubenville, Toledo, Youngstown. Cincinnati's 19 names come from catholic-hierarchy.org only (the archdiocese confirms the count). Lexington's 50 match our live map but no current outside list was found. **Owensboro's 32** are inferred (Kentucky's 120 counties minus the other three). **Evansville (12) and Lafayette (24)** come from 1944 erection records, which may be out of date; Evansville's may exclude part of Spencer County. **Indianapolis (38)** is the rest of Indiana, not a sourced list. The prototype map is drawn from these lists and should be checked against each diocese's own map before going live.
- **Parish counts.** Only Louisville, Owensboro, Cleveland, Youngstown and Fort Wayne-South Bend state a count on their own sites. The rest are from directories or Wikipedia, with different years. Louisville's own pages say 107 and 108.
- **Effort.** No time was logged for the first three dioceses; the per-parish times above are estimates.
- **Tennessee** (Knoxville, Memphis, Nashville) was not researched beyond province membership.
