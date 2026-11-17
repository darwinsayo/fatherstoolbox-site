# Archdiocese of San Francisco first pass, 15 Nov 2026

First reading of the parishes in the Archdiocese of San Francisco parish directory (https://sfarchdiocese.org/resources/parish-locator/, read through the archdiocese's own site data at sfarch.org) for the new map at `/parishtimes/san-francisco/`. The directory has 91 entries; the combined "St. Monica-St. Thomas the Apostle Parish" entry is the same parish as its two churches, which are listed separately, so the map has 90 markers. The 58 records that need a hand check are in `parishcheck/san-francisco-*.json`.

## Rules followed

- Times come only from the parish's own website. No MassTimes, discovermass or similar sites. Facebook is not a website. The archdiocese directory was used only for addresses, phones and to find each parish's website address, never for times.
- No time was guessed. Communion services are not Masses. Items that two pages of the same site gave differently were left off and are listed in the hand-check files.
- Home, Mass, Sacraments and Reconciliation pages were opened where they could be reached. Pages the cloud fetcher could not read were read in Darwin's Chrome; schedules posted only as an image (Our Lady of Mercy, Daly City; St. Francis of Assisi, East Palo Alto) were read from the image and marked as such.
- A confession with no end time is shown as 30 minutes. Confession posted as "N minutes before Mass" was worked out from the Mass time; those parishes are marked in the notes. Confession posted only as "after Mass" (no length) is in the parish note, not on the map.
- "Weekdays" with Saturday listed separately was entered as Monday to Friday.
- Dots were placed with the US Census geocoder from the directory address; 6 are approximate (listed below).
- Mass language is kept where the parish gives it.
- All times are Pacific, as the parishes post them. The page and the live clock are labelled Pacific.
- County shapes (San Francisco, Marin, San Mateo) are from the Census TIGERweb 500k cartographic county layer (land only), simplified. The San Francisco county shape includes the Farallon Islands.
- Archbishop Salvatore J. Cordileone is named on the tile from the archdiocese's own home page. The crest is the archdiocese shield from sfarch.org (ADSF_Shield_2in.png), with a transparent background.

## Summary

83 of 90 parishes have Mass times on the map and 68 have confession times.

| Outcome | Count | Parishes |
|---|---|---|
| Times entered, nothing to confirm | 32 | St. Sebastian, Greenbrae, St. Patrick, Larkspur, St. Anthony, Menlo Park, St. Denis, Menlo Park, St. Dunstan, Millbrae, Our Lady of Loretto, Novato, Our Lady of Mount Carmel, Redwood City, St. Pius, Redwood City, St. Bruno, San Bruno, St. Robert, San Bruno, St. Charles, San Carlos, Church of the Epiphany, San Francisco, Church of the Visitacion, San Francisco, Holy Name of Jesus, San Francisco, Most Holy Redeemer, San Francisco, National Shrine of St. Francis of Assisi, San Francisco, Notre Dame des Victoires, San Francisco, Old St. Mary's, San Francisco, St. Finn Barr, San Francisco, St. Gabriel, San Francisco, St. Kevin, San Francisco, St. Mary's Cathedral, San Francisco, St. Monica, San Francisco, St. Patrick, San Francisco, St. Teresa, San Francisco, St. Thomas the Apostle, San Francisco, St. Bartholomew, San Mateo, St. Gregory, San Mateo, St. Isabella, San Rafael, All Souls, South San Francisco, St. Veronica, South San Francisco, St. Hilary, Tiburon |
| Times entered, points to confirm | 51 | Immaculate Heart of Mary, Belmont, St. Mark, Belmont, Our Lady of Angels, Burlingame, St. Catherine of Siena, Burlingame, Holy Angels, Colma, Our Lady of Mercy, Daly City, Our Lady of Perpetual Help, Daly City, St. Andrew, Daly City, St. Francis of Assisi, East Palo Alto, St. Rita, Fairfax, St. Luke, Foster City, Our Lady of the Pillar, Half Moon Bay, St. Cecilia, Lagunitas, Church of the Nativity, Menlo Park, St. Raymond, Menlo Park, Old St. Mary's Church of Nicasio Valley, Nicasio, St. Anthony of Padua, Novato, Sacred Heart, Olema, Church of the Good Shepherd, Pacifica, St. Peter, Pacifica, Our Lady of the Wayside, Portola Valley, St. Matthias, Redwood City, St. Anselm, Ross, Corpus Christi, San Francisco, Mission Dolores Basilica, San Francisco, Our Lady of Lourdes, San Francisco, St. Agnes, San Francisco, St. Anne of the Sunset, San Francisco, St. Benedict, San Francisco, St. Boniface, San Francisco, St. Brendan, San Francisco, St. Cecilia, San Francisco, St. Charles Borromeo, San Francisco, St. Dominic, San Francisco, St. Elizabeth, San Francisco, St. Ignatius, San Francisco, St. John of God, San Francisco, St. John the Evangelist, San Francisco, St. Paul, San Francisco, St. Philip the Apostle, San Francisco, St. Stephen, San Francisco, St. Thomas More, San Francisco, St. Vincent de Paul, San Francisco, Star of the Sea, San Francisco, Sts. Peter and Paul, San Francisco, St. Matthew, San Mateo, St. Timothy, San Mateo, St. Raphael, San Rafael, St. Mary Star of the Sea, Sausalito, Mater Dolorosa, South San Francisco, St. Augustine, South San Francisco |
| Site could not be read, or has no current schedule | 4 | Our Lady of Mt. Carmel, Larkspur, Our Lady of Fatima, San Francisco, St. Emydius, San Francisco, St. Paul of the Shipwreck, San Francisco |
| No parish website | 3 | St. James, San Francisco, St. Michael Korean, San Francisco, Church of the Assumption, Tomales |

## Decided by Darwin, 15 Nov 2026

- **St. Peter and St. Anthony, Mission District.** The Mission Parishes site (missionparishes.com, St. Charles Borromeo's site) also lists St. Peter (1200 Florida St) and St. Anthony (3215 Cesar Chavez St) churches. Neither is in the archdiocese directory. Darwin decided not to list them.
- **Our Lady of Mt. Carmel.** The directory lists it at St. Patrick's address in Larkspur with St. Patrick's website, which posts nothing for it; Star of the Sea, Sausalito, places it in Mill Valley. Darwin does not know the address, so the marker stays beside St. Patrick (approximate) and the hand-check record stays open.

## Marker positions that are approximate

- St. Timothy, San Mateo: 1515 Dolan Ave did not geocode; placed at 1501 Dolan Ave.
- St. Peter, Pacifica: 700 Oddstad Blvd did not geocode; placed at 725 Oddstad Blvd.
- Holy Angels, Colma: Placed by geocoding the address with Daly City instead of Colma.
- St. Anselm, Ross: Placed by geocoding the address with San Anselmo instead of Ross.
- Old St. Mary's Church of Nicasio Valley, Nicasio: Directory gives only "Ranch Rd"; placed in Nicasio village (4900 Nicasio Valley Rd).
- Our Lady of Mt. Carmel, Larkspur: Directory address is St. Patrick, Larkspur; marker nudged so the two do not overlap.

## Points to confirm, by parish

- **Immaculate Heart of Mary, Belmont**: Mass times page footer says 2022; schedule undated.
- **St. Mark, Belmont**: Read in a browser (the cloud reader could not load the Mass page). Home page also mentions First Friday confession 10:00-11:00 AM; not entered as weekly.
- **Our Lady of Angels, Burlingame**: "Weekdays: 8:00 AM and 5:30 PM" entered Monday to Friday (Saturday is listed separately).
- **St. Catherine of Siena, Burlingame**: Not listed with a website in the archdiocese directory; stcsiena.org matches the parish name, address and phone. Pages carry 2007 and 2014 copyright dates; schedule may be old.
- **Holy Angels, Colma**: No website in the archdiocese directory; hacolma.org names Holy Angels at 107 San Pedro Road. Footer says 2022. Phone 650-488-0240 from the parish site (directory gives none). Map marker is approximate: Placed by geocoding the address with Daly City instead of Colma.
- **Our Lady of Mercy, Daly City**: Mass times read from the schedule image on the parish page (in a browser); the image is undated. olmcath.org redirects to the parish section of olmbulldogs.com (shared with the school).
- **Our Lady of Perpetual Help, Daly City**: Read in a browser (the cloud reader was refused). Friday evening Mass: the Mass list says 6:00 PM, the Friday devotions list says 6:30 PM. Left off until confirmed.
- **St. Andrew, Daly City**: Schedule on the home page still carries COVID-era wording; footer says 2022. Confession time is on the home page only.
- **St. Francis of Assisi, East Palo Alto**: Read from the schedule image on the home page (in a browser). Regular (non-summer) confession hours entered.
- **St. Rita, Fairfax**: "Weekday Masses 7:30am" entered Monday to Friday (Saturday 8:00 AM is listed separately). saintritachurch.org redirects to valleycatholicparishes.org, shared with St. Cecilia, Lagunitas and St. Mary, Nicasio.
- **St. Luke, Foster City**: Confession: home page (and St. Timothy's home page) say Friday 8:45-9:15 AM at St. Luke; the Sacraments page says "normally offered on Saturday afternoons from 4:00-4:30" with no place. Friday entered; Saturday left off until confirmed. Pastor named only as "Fr. Manuel".
- **Our Lady of the Pillar, Half Moon Bay**: Mission times (Pescadero, La Honda) are in the note, not as separate markers.
- **St. Cecilia, Lagunitas**: Read in a browser on valleycatholicparishes.org (shared with St. Rita and St. Mary, Nicasio). Confession is "after" Mass with no length given; in the note, not shown as a time.
- **Our Lady of Mt. Carmel, Larkspur**: The archdiocese lists this church at 114 King St, Larkspur (St. Patrick's address) with St. Patrick's website, which posts no times for it. Star of the Sea, Sausalito, says its own confessions are held at Our Lady of Mt. Carmel, Mill Valley, Saturday 3:00-4:00 PM. Confirm where this church is, its own website and its schedule. Marker is at the directory address. Map marker is approximate: Directory address is St. Patrick, Larkspur; marker nudged so the two do not overlap.
- **Church of the Nativity, Menlo Park**: Saturday 9:00 AM confession ends 9:45 on the home page, 10:00 on the Penance and schedule pages; 9:45 entered. Sunday 12:00-12:30 PM confession is on the home page only. Schedule pages mark all four Sunday Masses "(Traditional Latin Mass)"; the staff page names only 12:30 (and 9:30) as Latin. Only 12:30 is labeled.
- **St. Raymond, Menlo Park**: Saturday morning confession: home and Mass Times pages say 8:45-9:15 AM, the Sacraments page says 9:15-9:45 AM during Adoration. Left off until confirmed.
- **Old St. Mary's Church of Nicasio Valley, Nicasio**: Read in a browser on valleycatholicparishes.org (shared with St. Rita and St. Cecilia). Confession is "after" Mass with no length given; in the note, not shown as a time. Directory gives only "Ranch Rd, Nicasio"; marker placed in Nicasio village, approximate. Map marker is approximate: Directory gives only "Ranch Rd"; placed in Nicasio village (4900 Nicasio Valley Rd).
- **St. Anthony of Padua, Novato**: Site phone 415-883-2177; archdiocese directory 415-647-2704.
- **Sacred Heart, Olema**: Confession: Sacraments and About pages say before the Saturday 6 PM and Sunday 8 AM Masses; the home page says before 7 PM Saturday and 9 AM Sunday. No length posted, so not shown as times. Home page prints the Sunday noon Spanish Mass as "12:00 a.m."; About page says 12:00 p.m. Home page has stale 2021-2024 items.
- **Church of the Good Shepherd, Pacifica**: Saturday confession: home page text says 3:45-4:45 PM, the home page image says 4:00 PM. Left off until confirmed. Pastor letter on the home page reads as 2020-2021.
- **St. Peter, Pacifica**: Map marker is approximate: 700 Oddstad Blvd did not geocode; placed at 725 Oddstad Blvd.
- **Our Lady of the Wayside, Portola Valley**: Times from the St. Denis Parish site, which serves both churches.
- **St. Matthias, Redwood City**: Mass times appear only in the site footer. No confession time is posted at St. Matthias church itself; the parish lists Saturday 3:30-4:30 PM at St. Charles, San Carlos.
- **St. Anselm, Ross**: Weekday confession 7:30-8:00 AM from the Sacraments page; the Mass Times page says before and after each weekday Mass. Pastor page failed to load. Map marker is approximate: Placed by geocoding the address with San Anselmo instead of Ross.
- **Corpus Christi, San Francisco**: Daily Masses (8:00 AM, 12:05 PM, 7:00 PM Spanish) are listed without days; not entered until the days are confirmed.
- **Mission Dolores Basilica, San Francisco**: Confession Saturday 4:30 PM is on the Penance page; the home page says only "By appointment". No end time, shown as 30 minutes.
- **Our Lady of Fatima, San Francisco**: byzantinecatholic.org refused the cloud reader (robots.txt). byzantinecatholic.org also failed to load in a browser on 15 Nov 2026.
- **Our Lady of Lourdes, San Francisco**: All Hallows Chapel confession: Mass schedule page says "Saturdays at 3:30pm or by appointment", home page says only "By appointment". Saturday 3:30 PM entered from the schedule page; no end time, shown as 30 minutes. Directory address 1715 Oakdale Ave is the parish office; churches are at 410 Hawes St and 1440 Newhall Ave.
- **St. Agnes, San Francisco**: Home page says "Weekdays: 8:30am" without naming days; entered Monday to Friday. Sacraments page failed to load.
- **St. Anne of the Sunset, San Francisco**: stanne-sf.org redirects to a hosting address (fns.lbn.mybluehost.me) that serves the parish site; read in a browser. "Weekdays: 8:45AM" entered Monday to Friday (Saturday listed separately). Confession worked out from "available 20 minutes before" the Saturday vigil and all Sunday Masses.
- **St. Benedict, San Francisco**: Mass Times page still says Mass is held outdoors "in accordance with city guidelines" (COVID-era wording) and lists 2020-2021 holy days; the home page says Mass every Sunday at 10:30 AM in ASL. Confession only by appointment and in Advent/Lent services; First Saturday 3:00 PM is described as an appointment with the pastor, so it is not shown as a set confession time.
- **St. Boniface, San Francisco**: About page still says "No Weekday Service during the Pandemic"; weekday Masses are not posted. Sunday times from the About page. Home page lists 8:00, 9:30 and 11:00 Masses without days and mentions an occasional 10:00 All Community Mass.
- **St. Brendan, San Francisco**: Saturday confession ends 4:45 PM on the home page and Confession page, 4:40 PM on the Sacraments and Adoration page; 4:45 entered. Footer says 2022; Mass table undated.
- **St. Cecilia, San Francisco**: Home page says the Monday-Thursday 5:30 PM Mass is on summer hiatus and "will return later"; the regular list shows no Mon-Thu 5:30 PM Mass, so none is entered.
- **St. Charles Borromeo, San Francisco**: Daily 5:00 PM Spanish Mass is listed without days ("no Mass on Thursdays"); left off until days are confirmed. The shared site (Mission Parishes) also lists St. Peter (1200 Florida St) and St. Anthony (3215 Cesar Chavez St) churches, which are not in the archdiocese directory and are not on the map.
- **St. Dominic, San Francisco**: Read in a browser; the cloud reader had seen an old 2021 copy of the site. Confession worked out from "30 minutes before the Saturday Vigil Mass and the Sunday Masses (except 1:30 pm)". "Weekdays" entered Monday to Friday (Saturday listed separately).
- **St. Elizabeth, San Francisco**: Sunday line ends "& 5:00 pm (Spanish)"; probably the 5:00 PM Mass is Spanish, not marked until confirmed. "Weekdays" entered Monday to Friday.
- **St. Emydius, San Francisco**: Home page posts no weekly schedule (only Ash Wednesday times); /mass-times, /sacraments, /reconciliation blocked to the cloud reader. Home page looks dated 2025. stemydiussf.org also refused to connect in a browser on 15 Nov 2026.
- **St. Ignatius, San Francisco**: Staff page failed to load; pastor not entered.
- **St. James, San Francisco**: No website of its own found. St. Philip's site lists St. James confession Monday to Friday 9:30-10:00 AM, but that is not from a St. James site, so it is not entered.
- **St. John of God, San Francisco**: Parish moved to stjohnofgod-sf.org (sjog.net says it is no longer updated). New site gives ZIP 94112, directory 94122.
- **St. John the Evangelist, San Francisco**: Home page has stale COVID-era wording.
- **St. Michael Korean, San Francisco**: No website listed by the archdiocese and none found. Call 415-333-1194.
- **St. Paul, San Francisco**: Friday 8:30 AM Mass is on the home page but not the weekly schedule page; left off. Second Sunday morning Mass: home page and weekly schedule say 9:30 AM, the parish calendar says 9:15 AM; left off until confirmed.
- **St. Paul of the Shipwreck, San Francisco**: The only times are in a Live Stream box (Sat 5:00 PM; Sun 8:30 AM Spanish; Sun 10:45 AM Gospel Mass) that says streams are on the 1st and 3rd weekends only. Not entered as a weekly schedule; confirm with the parish. No confession times posted. Site dated 2019. On 15 Nov 2026 stpauloftheshipwreck.org showed a Wix "domain isn't connected to a site" page in a browser.
- **St. Philip the Apostle, San Francisco**: Saturday 8:00 AM Mass: home page says "no Saturday morning Mass", the Mass Times page says Monday to Saturday. Left off until confirmed. Monday 6:00-7:00 PM confession is on the Mass Times page only, not the home page.
- **St. Stephen, San Francisco**: Saturday confession ends 4:30 PM on the home page, 4:40 PM on the Mass page; 4:30 entered. Sunday confession worked out from "30 minutes before each Mass". Church is at 601 Eucalyptus Drive per the parish site; the directory gives the mailing address 451 Eucalyptus Drive. Administrator during the pastor's sabbatical to 1 Jan 2027 (Rev. David A. Schunk, Pastor).
- **St. Thomas More, San Francisco**: Confession worked out from "30 minutes before all English Masses" (Sat 5:00 PM, Sun 10:00 AM, Sun 8:00 PM). Saturday 8:00 AM Mass is on the home and Mass & Devotions pages; the times page says only "weekdays except Friday".
- **St. Vincent de Paul, San Francisco**: Times from the home page Mass Times box only; /mass-times and /confession-times pages failed to load. Home page appeal text dates from 2024. Saturday confession has no end time; shown as 30 minutes.
- **Star of the Sea, San Francisco**: Weekday confession worked out from "15 min before" the noon and 6:00 PM Masses; "after the 7 AM Mass" and "during the Mass" on Sundays have no fixed time and are in the note.
- **Sts. Peter and Paul, San Francisco**: Saturday 4:00-5:00 PM confession is on the Mass Times page; the home page lists 4:00-5:00 PM under Confession without a day.
- **St. Matthew, San Mateo**: Mass times page lists "Saturday Mass, 12:05 p.m." under the weekday heading; unclear, left off.
- **St. Timothy, San Mateo**: Map marker is approximate: 1515 Dolan Ave did not geocode; placed at 1501 Dolan Ave.
- **St. Raphael, San Rafael**: Pastor named only as "Fr. Luello"; left blank. Some Masses are labeled "Mission" on the schedule; the page does not say more about that church.
- **St. Mary Star of the Sea, Sausalito**: Site phone 415-332-4962; archdiocese directory 415-332-1765. About page names Fr. Patrick Michaels as pastor but a caption names Fr. Andrew Ginter as administrator; pastor left blank.
- **Mater Dolorosa, South San Francisco**: Schedule labeled "Revised January 2024".
- **St. Augustine, South San Francisco**: Saturday confession ends 4:15 PM on the home and Penance pages, 4:00 PM on the Masses page; start entered with 30 minutes. A weekday 5:30 PM item follows Vespers on the schedule without being called a Mass; left off.
- **Church of the Assumption, Tomales**: No website listed by the archdiocese and none found. Call 707-878-2208.
