# Diocese of Oakland first pass, 14 Nov 2026

First reading of all 75 parishes in the Diocese of Oakland directory (https://www.oakdiocese.org/parishes/, 9 pages) for the new map at `/parishtimes/oakland/`. The 55 records that need a hand check are in `parishcheck/oakland-*.json`.

## Rules followed

- Times come only from the parish's own website. No MassTimes, discovermass or similar sites. Facebook is not a website. The diocese's own parish pages were used only to find a parish's own website address, never for times.
- No time was guessed. Communion services are not Masses. Items that two pages of the same site gave differently were left off and are listed in the hand-check files.
- Home, Mass, Sacraments and Reconciliation pages were opened where they could be reached. Pages the cloud fetcher could not read were read in Darwin's Chrome (approved in the thread); schedules posted only as an image were read from the image and marked as such.
- A confession with no end time is shown as 30 minutes. Confession posted as 'before Mass' or 'N minutes after Mass' with a stated length was worked out from the Mass time; those parishes are marked in the notes.
- The diocese directory was used for addresses and phones. Dots were placed with the US Census geocoder from the directory address; six addresses did not geocode and their dots are approximate (listed below).
- Mass language is kept where the parish gives it.
- All times are Pacific, as the parishes post them. The page and the live clock are labelled Pacific.
- County shapes (Alameda and Contra Costa) are from the Census TIGERweb county layer, simplified; they follow the legal county lines, which run through San Francisco Bay.

## Summary

63 of 75 parishes have Mass times on the map and 57 have confession times.

| Outcome | Count | Parishes |
|---|---|---|
| Times entered, nothing to confirm | 20 | St. Ignatius of Antioch, Antioch, Holy Spirit – Newman Hall, Berkeley, St. Ambrose, Berkeley, St. Agnes, Concord, St. Bonaventure, Concord, St. Jerome, El Cerrito, St. Callistus, El Sobrante, St. Joachim, Hayward, St. Perpetua, Lafayette, St. Charles Borromeo, Livermore, St. Michael, Livermore, Cathedral of Christ the Light, Oakland, St. Augustine, Oakland, St. Benedict, Oakland, St. Columba, Oakland, St. Theresa, Oakland, St. Patrick, Rodeo, Church of the Assumption, San Leandro, St. Joan of Arc, San Ramon, St. Anne, Walnut Creek |
| Times entered, points to confirm | 44 | St. Barnabas, Alameda, St. Joseph Basilica, Alameda, St. Philip Neri and St. Albert the Great, Alameda, Most Holy Rosary, Antioch, Our Lady Queen of the World, Bay Point, St. Joseph the Worker, Berkeley, St. Mary Magdalen, Berkeley, Immaculate Heart of Mary, Brentwood, Our Lady of Grace, Castro Valley, Transfiguration, Castro Valley, Queen of All Saints, Concord, St. Francis of Assisi, Concord, St. Isidore, Danville, Corpus Christi, Fremont, St. Joseph, Fremont, Holy Spirit, Fremont, Our Lady of Guadalupe, Fremont, St. James, Fremont, All Saints, Hayward, St. Bede, Hayward, St. Clement, Hayward, St. Catherine of Siena, Martinez, St. Monica, Moraga, St. Edward, Newark, Sacred Heart, Oakland, St. Elizabeth, Oakland, St. Jarlath, Oakland, St. Louis Bertrand, Oakland, St. Margaret Mary, Oakland, Santa Maria, Orinda, Church of the Good Shepherd, Pittsburg, Christ the King and St Stephen, Pleasant Hill, Catholic Community Pleasanton (St. Augustine and St. Elizabeth Seton), Pleasanton, Our Lady of Mercy, Point Richmond, St. David, Richmond, St. Mark, Richmond, Our Lady of Good Counsel, San Leandro, St. Felicitas, San Leandro, St. Leander, San Leandro, St. John the Baptist, San Lorenzo, St. Paul, San Pablo, St. Anne, Union City, St. John Vianney, Walnut Creek, St. Mary, Walnut Creek |
| Site could not be read or has no parish content | 5 | Divine Mercy, Oakland, St. Anthony – Mary Help of Christians, Oakland, St. Anthony, Oakley, St. Cornelius, Richmond, Our Lady of the Rosary, Union City |
| No parish website | 6 | St. Rose of Lima – St. Patrick Mission, Crockett, St. Raymond, Dublin, Our Lady of Lourdes, Oakland, St. Bernard, Oakland, St. Leo the Great, Oakland, St. Peter Martyr, Pittsburg |

## Marker positions that are approximate

The Census geocoder found no match for these addresses, so the dots sit at a best-estimate position in the right neighbourhood. Move them if you can confirm the church location: St. Francis of Assisi (Concord), Our Lady of Guadalupe (Fremont), St. Michael (Livermore), St. Augustine (Oakland), St. Columba (Oakland), St. Felicitas (San Leandro). St. Joseph (Fremont) has only a P.O. box in the directory, so its dot is at the Mission San Jose church address (43148 Mission Blvd), which did not come from the parish site, and no street address is shown.

## Directory versus parish site (address or phone)

- St. Barnabas, Alameda: parish site phone 510-995-9401, directory 510-522-8933.
- Most Holy Rosary, Antioch: parish site 1313 A Street, directory 21 E 15th Street.
- Corpus Christi, Fremont: parish site shows two street addresses (37968 Third St. and 37891 Second St.).
- Our Lady of Good Counsel, San Leandro: parish site 2500 Bermuda Ave. and 510-969-7013, directory 14112 Azores Pl. and 510-614-2765.
- St. John the Baptist, San Lorenzo: parish site 264 E Lewelling Blvd, directory 16642 Ashland Ave.
- St. Leander, San Leandro: directory address is the parish office; the church is at 550 W. Estudillo Ave.
- Transfiguration, Castro Valley: the parish's own site is transfigchurchcv.org (the directory lists transfigchurch.com) and it announces a closure process with Our Lady of Grace; no date posted.

## Points to confirm, by parish

- **St. Barnabas, Alameda**: Parish site lists the office phone as 510-995-9401; the diocese directory gives 510-522-8933.
- **St. Joseph Basilica, Alameda**: Mass times not entered. The home page posts them without day labels, the Sunday Mass page is blank, and the home page says the basilica is closed for renovations (May 18 to November, year not stated). Confession on the Sacrament of Reconciliation page: Saturday 3:30 to 4:30 PM or by appointment. Also confession after the Saturday morning Mass until 9:00 AM or until all are heard, no start time posted.
- **St. Philip Neri and St. Albert the Great, Alameda**: The home page says Sunday 9:00 AM and 11:30 (PM), the Mass schedule page says 9:00 AM and 11:30 AM. The St. Philip Neri Sunday 11:30 AM Mass is left off the map until the parish confirms. Home page links an October 2024 Mass schedule PDF that was not read.
- **Most Holy Rosary, Antioch**: The parish site gives the church address as 1313 A Street, Antioch; the diocese directory gives 21 E 15th Street. The map uses the diocese address.
- **Our Lady Queen of the World, Bay Point**: Home page lists Sat 5 PM, 7 PM Spanish; Sun 8 AM, 10 AM, 12 noon, 4 PM Vietnamese. The Mass times page lists Sat 5:00 PM English; Sun 8:00, 10:00, noon English. The English weekend Masses are left off the map until confirmed.
- **St. Joseph the Worker, Berkeley**: Confession page lists '1st Friday 1:30 PM, 5:30 PM' with no end times and 'Saturday 6:00 PM Mass in Spanish at 7:00 pm'; unclear whether these are confession times. Not entered. Cloud read earlier saw Mon to Fri 12:15 and Sun 11:30; the browser read of the site shows only Mon, Wed, Fri 12:15 and no Sun 11:30, so the browser read is used.
- **St. Mary Magdalen, Berkeley**: Saturday confession: the Mass and Daily Prayer Times page says 4:00 to 5:00 PM or by appointment; the Reconciliation page says 4:00 PM or by appointment. Start entered, end shown as 30 minutes.
- **Immaculate Heart of Mary, Brentwood**: Confession not entered. masses_confessions.html says 'Tuesdays 6:00 to 7:00 pm, Saturdays 3:30 to 4:30 pm (this is effective during Shelter-in-Place)', which looks out of date, and a monthly schedule PDF on the site could not be read. Ask the parish for the current confession times.
- **Our Lady of Grace, Castro Valley**: Sunday Mass language on the Mass times page is ambiguous (see map note). The parish site also links a closure FAQ for Transfiguration, the other Castro Valley parish.
- **Transfiguration, Castro Valley**: Listed site transfigchurch.com could not be read; the parish's own site is transfigchurchcv.org. The site has a Closure menu (27 Oct 2026 town hall, FAQs as a downloadable document that was not opened, ministries to be merged with Our Lady of Grace). No closing date found. Weekly Friday 7 PM Adoration and Reconciliation: day worked out from an event dated Friday, Nov 13, 2026.
- **Queen of All Saints, Concord**: Spanish confession times differ between pages (Mass and Confession Times and home page: Fri 4:00 to 6:15 PM, Sat 5:00 to 6:15 PM; Reconciliation page: Fri 5:15 to 6:15 PM, Sat 5:30 to 6:15 PM). Spanish confessions are left off the map.
- **St. Francis of Assisi, Concord**: Portuguese Sunday Mass: home page says 3:30 PM, Mass schedule page says 3:00 PM; left off. Weekday 8:30 AM is Mon to Fri on the home page and Mon to Sat on the schedule page; Saturday is entered because the Mass schedule page and home page both list Saturday 8:30. Special monthly Masses (2nd, 3rd and 4th Thursday Spanish, 4th Wednesday Filipino) and Advent and Lent weekday confession are not on the map. Map marker position is approximate; the address did not geocode.
- **St. Rose of Lima – St. Patrick Mission, Crockett**: No website listed in the diocese directory or on the diocese profile. Phone 510-787-2052. Call the parish.
- **St. Isidore, Danville**: sichurch.com redirects to stisidoredanville.com, which is used. Confession windows before each Mass are worked out from 'at least 30 minutes prior'; confirm. Saturday 3:00 PM confession has no end time posted.
- **St. Raymond, Dublin**: No website listed in the diocese directory or on the diocese profile. Phone 925-828-2460. Call the parish.
- **Corpus Christi, Fremont**: Reconciliation page lists a Sunday 12:00 Spanish Mass marked temporary, a 1st Saturday 9:00 AM Healing Mass, and Thursday 7:00 PM confession during Holy Hour; each appears on that page only and none is on the map. Parish footer address is 37968 Third St., contact box says 37891 Second St.; the map uses the diocese address.
- **St. Joseph, Fremont**: The diocese directory gives only a P.O. box (P.O. Box 3276), so no street address is shown. The marker is placed at the Mission San Jose church address 43148 Mission Blvd, which is not from the parish site; confirm the church addresses.
- **Holy Spirit, Fremont**: The asterisks on the Mass page are unexplained; ask the parish what they mean. Languages not posted.
- **Our Lady of Guadalupe, Fremont**: The Mass schedule is an image (mass_schedule_092026.png); times were read from it. The Friday 7:00 PM Spanish Mass is mentioned only in text ('Benediction before 7pm Spanish Mass') and is not entered. The home page has a 'Diocese clarification regarding our parish' item that could not be read; check it before relying on this entry. Map marker position is approximate; the address did not geocode.
- **St. James, Fremont**: The Sacraments page has only a title and image; no confession times posted. Holy-day and special Mass times not entered.
- **All Saints, Hayward**: The Mass times page lists a daily 8:30 AM Mass without naming the days, so weekday Masses are not entered.
- **St. Bede, Hayward**: stbedechurchhay.org redirects to stbedecatholic.church, which is used. The Mass page lists 'Daily Mass 8:00 AM' without naming days, so weekday Masses are not entered. A Saturday confession 8:45 to '9:45 A' (text cut off) is not entered. Pastor is given only as 'Father Ruben'.
- **St. Clement, Hayward**: Schedule is an image. Wednesday shows 8:30 AM on a separate line, unclear whether it replaces 8:00, so Wednesday is not entered. A Tuesday 7:00 PM Spanish Mass depends on the image layout and is not entered. Confession is stated on the Holy Communion and Reconciliation page only.
- **St. Catherine of Siena, Martinez**: The Reconciliation page lists Thursday 5:00 to 6:00 PM, which the home page does not; Thursday confession is left off.
- **St. Monica, Moraga**: The cloud read of the home page showed a Sunday 7:30 AM Mass that does not appear on the Worship page in the browser; left off.
- **St. Edward, Newark**: Sunday 7:00 PM has no language label.
- **Divine Mercy, Oakland**: divinemercyoak.org did not load in the browser on 14 Nov 2026 (error page), and the cloud fetcher was blocked by robots.txt. Try again later.
- **Our Lady of Lourdes, Oakland**: No parish website. The diocese profile gives only the address, phone 510-451-1790 and an email.
- **Sacred Heart, Oakland**: Saturday confession end time: 4:55 PM on the Mass schedule page, 5:00 PM on the Reconciliation page. Start entered, shown as 30 minutes.
- **St. Anthony – Mary Help of Christians, Oakland**: stanthony-maryhelp.org is a parked domain page with no parish content (14 Nov 2026). The diocese profile still lists the domain.
- **St. Bernard, Oakland**: No parish website. The diocese profile (not used for times) shows a Mass list; get the schedule from the parish. Phone 510-632-3013.
- **St. Elizabeth, Oakland**: The Spanish text of the confession page has a typo ('3:00 a.m. a 5:00 p.m.'); the English text says 3:00 to 5:00 PM and is used.
- **St. Jarlath, Oakland**: A Sunday 7:45 Spanish Mass and a French Mass (second or first Sunday, 5:00 PM; the pages disagree) are left off. 'Weekday 7:30 AM' is entered as Monday to Friday.
- **St. Leo the Great, Oakland**: stleothegreat.org is the school's website and posts no Mass or confession times. The diocese says the parish is clustered with the Cathedral of Christ the Light. Find the parish's own times.
- **St. Louis Bertrand, Oakland**: Schedule is an image. Saturday confession: home page says 7:00 to 9:00 AM, the image says 7:30 to 9:00 AM; left off. Reconciliation and Sacramentos pages not read.
- **St. Margaret Mary, Oakland**: Confession before each Mass is worked out from '30 minutes before Masses'; confirm with the parish.
- **St. Anthony, Oakley**: stanthonyoakley.org did not load in the browser (error page) and the cloud fetcher was blocked by robots.txt on 14 Nov 2026. Try again later.
- **Santa Maria, Orinda**: No Saturday vigil is posted. Page does not state a street address or pastor.
- **Church of the Good Shepherd, Pittsburg**: Mass times are from the home page (cloud read). The site did not load in the browser, so the Mass and Prayer Schedule and Sacraments pages were not read. The home page has an unlabeled 'Saturday 4:00 to 5:00 pm or by appointment' line that may be confession; not entered.
- **St. Peter Martyr, Pittsburg**: No parish website. The diocese profile gives the address, phone 925-432-4771 and an email only.
- **Christ the King and St Stephen, Pleasant Hill**: St. Stephen confession start is worked out from 'before the 5:00 p.m. Mass'. Times come from the home page; the Liturgy and Reconciliation pages show images and a letter with no times.
- **Catholic Community Pleasanton (St. Augustine and St. Elizabeth Seton), Pleasanton**: Weekday 12:10 Mass has none on holidays.
- **Our Lady of Mercy, Point Richmond**: The home page says confession services follow Mass on Saturdays with no clock time, so none entered. The Masses page repeats the Saturday time but its Sunday section is empty and its dates are from 2024 and 2025. A July 2025 news item reports the pastor's death; no later schedule or closure notice found. Confirm that the schedule is current.
- **St. Cornelius, Richmond**: stcorneliusrichmond.org did not load in the browser (error page) and the cloud fetcher was blocked by robots.txt on 14 Nov 2026. Try again later.
- **St. David, Richmond**: The Mass schedule is headed 'effective 2025 Aug 04' and the confession schedule 'effective 2025 Jan 01'; the page says to see its Google calendar for the current schedule, which was not used. Confirm the schedule is current. The Saturday 9:00 AM Mass is labeled 'KMHMU' on the site; the abbreviation is not explained.
- **St. Mark, Richmond**: The 11:00 AM Sunday Mass has no language label.
- **Our Lady of Good Counsel, San Leandro**: The home page lists a Saturday 5:00 PM Mass; the Mass schedule page does not, so it is left off. The Polish Sunday Mass is 1:00 PM in the heading and 12:30 PM in the text, so it is left off. The parish site gives its own address as 2500 Bermuda Ave., San Leandro and phone 510-969-7013; the diocese directory gives 14112 Azores Pl. and 510-614-2765 (the parish office on the Sacraments page). Map marker is at the diocese address.
- **St. Felicitas, San Leandro**: The only Mass schedule page is titled '2023 Mass Times'; confirm it is current. Saturday: the page says 'Saturday 7:00 am to 4:00 pm (Vigil)', unclear, so not entered. Saturday confession: 3:00 to 4:00 PM on one page and 3:15 to 4:00 PM on another, or by appointment; not entered. Weekday 7:30 to 8:00 AM confession is on the Mass times page only; not entered. Map marker position is approximate; the address did not geocode.
- **St. Leander, San Leandro**: Parish office is at 474 W. Estudillo Ave. (the directory address); the church is at 550 W. Estudillo Ave. per the worship page.
- **St. John the Baptist, San Lorenzo**: Both schedule pages were last modified 2024-10-18; confirm they are current. The parish site gives its address as 264 E Lewelling Blvd, San Lorenzo; the directory gives 16642 Ashland Ave.
- **St. Paul, San Pablo**: Saturday 7:30 AM Mass read from the Monday to Saturday line and the events calendar.
- **Our Lady of the Rosary, Union City**: olrchurch.org redirects to the website vendor LPi (4lpi.com), not a parish site (14 Nov 2026). The diocese profile still lists that domain. Phone 510-471-2609.
- **St. Anne, Union City**: The site lists '5:00 PM Youth Mass every 2nd and 4th Sunday' on the same time as the regular Sunday 5:00 PM Mass; treated as one Mass.
- **St. John Vianney, Walnut Creek**: The home page lists weekday Mass and confession Monday to Friday; the Liturgy and Reconciliation pages say Monday to Saturday. Saturday 8:30 AM Mass and Saturday 8:15 AM confession are left off. First Friday: the home page says no morning Mass and a 6:00 PM Mass with Anointing; the Liturgy page shows no exception.
- **St. Mary, Walnut Creek**: The home page lists a First Saturday 8:30 AM Mass that the Mass Times page does not; left off.
