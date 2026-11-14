# Diocese of Kansas City-St. Joseph first pass, 14 Nov 2026

First reading of all 88 parishes and missions in the diocese directory (https://kcsjcatholic.org/connect/parishes/) for the new map at `/parishtimes/kansas-city-st-joseph/`. The 53 records that need a hand check are in `parishcheck/kansas-city-st-joseph-*.json`.

## Rules followed

- Times come only from the parish's own website, or the site of the parish that serves it, including that parish's own bulletin. No MassTimes, discovermass or similar sites. Facebook is not a website.
- No time was guessed. Communion services are not Masses. Masses held off site (nursing homes, campus chapels) are mentioned in the notes but not put on the map.
- Home, Mass times, Sacraments and Reconciliation pages were opened where they could be reached.
- A confession with no end time is shown as 30 minutes. Confession posted as "30 minutes before Mass" or "after Mass" was worked out from the Mass time.
- The diocese directory was used for addresses and phones. Where it gives no phone, the phone on the parish's own site was used. Dots were placed with the US Census geocoder from the directory address.
- Pages that refused automated reading (robots.txt) were not worked around. Pages that errored were tried a second time the same day with other URL forms.
- All times are Central, as the parishes post them.

## Summary

53 of 88 parishes have Mass times on the map and 44 have confession times.

| Outcome | Count | Parishes |
|---|---|---|
| Times entered, one point to confirm | 18 | St. Rose of Lima (Savannah), St. James (St. Joseph), Immaculate Heart of Mary (Princeton), St. Ann (Plattsburg), St. Therese Parish (Kansas City), St. Therese Little Flower (Kansas City), St. John Francis Regis (Kansas City), St. Francis Xavier (Kansas City), Sacred Heart-Guadalupe (Kansas City), Our Lady of Peace (Kansas City), Oratory of Old St. Patrick (Kansas City), Holy Rosary (Kansas City), Holy Family (Kansas City), Church of the Holy Martyrs (Kansas City), St. Mark (Independence), St. Patrick (Holden), St. Ann (Excelsior Springs), St. John Lalande (Blue Springs) |
| Site could not be read (error, blocked or placeholder) | 14 | Holy Trinity (Weston), Our Lady of Guadalupe (St. Joseph), Immaculate Conception (Richmond), St. Bridget (Pleasant Hill), St. Jude the Apostle (Oak Grove), Sacred Heart (Norborne), St. Monica (Kansas City), St. Andrew the Apostle (Gladstone), Christ the King (Kansas City), St. Mary (Independence), St. Mary (Higginsville), St. Mary (Carrollton), Church of Santa Fe (Buckner), St. Robert Bellarmine (Blue Springs) |
| Site is out of date, times not used | 11 | St. Patrick (St. Joseph), Twelve Apostles (Platte City), St. Gregory Barbarigo (Maryville), Our Lady of the Presentation (Lee's Summit), St. Peter (Kansas City), St. Bernadette (Kansas City), Nativity of Mary (Independence), Sacred Heart (Hamilton), St. Joseph (Easton), St. Munchin (Cameron), St. Sabina (Belton) |
| Facebook only or no website | 8 | St. Paul the Apostle (Tarkio), St. Bridget (Rich Hill), St. Joseph (Parnell), St. Mary (Nevada), Immaculate Conception (Montrose), Immaculate Conception (Lexington), St. Columba (Conception Junction), St. Patrick (Butler) |
| Mission times on another parish site, church not clearly named | 2 | Holy Trinity (Urich), St. Patrick (King City) |

## Times entered, one point to confirm

- **St. Rose of Lima, Savannah**: Sunday 9:50-10:15 and Friday 7:30-7:50 confession are posted without AM/PM; left out. Sources: https://www.saintroseoflima.org/mass-times-confession.
- **St. James, St. Joseph**: The parish site gives the address as 5814 King Hill Ave.; the diocese directory says 5815 Pryor Ave. The map uses the diocese address. Sources: https://saintjamescatholic.church/.
- **Immaculate Heart of Mary, Princeton**: Confession '1:00 p.m.' is posted without a day; left out. Sources: https://www.ihm-princeton.org/mass-time.html.
- **St. Ann, Plattsburg**: Weekday Mass times are missing (the section is blank in the page text, possibly an image). Sources: https://stannplattsburg.org/, https://stannplattsburg.org/worship.
- **St. Therese Parish, Kansas City**: Saturday confession start: 2:30 PM (home and Mass and Services pages) vs 3:00 PM (Reconciliation page). Left blank. Sources: https://www.sttheresenorth.org/mass-services, https://www.sttheresenorth.org/reconciliation.
- **St. Therese Little Flower, Kansas City**: The Wednesday noon Mass is only in the site footer's Mass Times line. Sources: https://stlfkc.org/, https://stlfkc.org/worship.
- **St. John Francis Regis, Kansas City**: The 2nd-Sunday 12:30 PM Mass is called a kids' Mass in Spanish on the home page and bilingual on the calendar. Sources: https://www.stregischurch.org/mass---confession-times.
- **St. Francis Xavier, Kansas City**: The footer has an undated 'weekday 7:30 AM' line; only Wednesday is entered. Sources: https://www.sfx-kc.org/, https://www.sfx-kc.org/sacraments.
- **Sacred Heart-Guadalupe, Kansas City**: Weekday Mass and confession times appear only in an image (or not at all). Sources: https://www.sacredheartguadalupe.org/.
- **Our Lady of Peace, Kansas City**: Saturday confession end: 4:55 PM (home) vs 5:55 PM (Mass page). The site gives the address as 1025 Bennington Ave; the diocese says 1029. Sources: https://www.ourladyofpeacekc.org/, https://www.ourladyofpeacekc.org/mass--liturgies.html.
- **Oratory of Old St. Patrick, Kansas City**: On First Fridays the 7:45 AM Mass is not held; the map still shows it every Friday. Sources: https://institute-christ-king.org/kansascity-home.
- **Holy Rosary, Kansas City**: Saturday 7:00 PM Vietnamese Mass is on the home page only; left out. Sources: https://www.hrkcmo.org/mass--reconcillation.html.
- **Holy Family, Kansas City**: Tue-Thu 12:00 PM is posted as 'Weekday Masses or communion services'. Sources: https://holyfamily.com/.
- **Church of the Holy Martyrs, Kansas City**: Weekday 11:00 AM Masses and confession are only in the Oct 18, 2026 bulletin, not on the site's schedule page. Sources: https://www.giaoxukcmo.org/.
- **St. Mark, Independence**: Weekend schedule changes on December 26, 2026 (Sat 4:30 PM; Sun 8:00, 10:00 AM; the Spanish Mass is not in the new list). Update the map then. Sources: https://www.stmarksparish.com/.
- **St. Patrick, Holden**: Saturday confession: the home and Mass Times pages say 2:20 to 2:50 PM, the Confession page says 2:00 to 2:45 PM. Left blank until confirmed. Sources: https://www.stpatrickholden.org/, https://www.stpatrickholden.org/mass-times, https://www.stpatrickholden.org/confession.
- **St. Ann, Excelsior Springs**: Confession times are worked out from 'CONFESSIONS 30 minutes before Mass', applied to every Mass; confirm with the parish. Sources: https://www.stanncatholicchurch.net/.
- **St. John Lalande, Blue Springs**: Weekday Mass times come from the confession labels ('before the 6:30 AM Mass'), not a separate Mass list. Sources: https://www.stjohnlalande.com.

## Site could not be read (error, blocked or placeholder)

- **Holy Trinity, Weston**: www.holytrinitycatholic.org could not be read by the fetcher (client error). No other source used.
- **Our Lady of Guadalupe, St. Joseph**: The home page shows office hours and a novena notice but no Mass or confession times; the Mass times page could not be loaded by the fetcher. Sources: https://www.olog.org/.
- **Immaculate Conception, Richmond**: carrollraycatholic.church (the directory URL for this parish) returned a client error, so no times were read. No other source was used.
- **St. Bridget, Pleasant Hill**: stbridgetph.weconnect.com returned only a 'Temporarily Unavailable' placeholder with no Mass or confession times. Recheck later.
- **St. Jude the Apostle, Oak Grove**: www.stjudeoakgrove.org returned a client error, so no times were read. No other source was used.
- **Sacred Heart, Norborne**: carrollraycatholic.church (shared with Immaculate Conception, Richmond and St. Mary, Carrollton) returned a client error. No times were read. This is a mission of St. Mary, Carrollton.
- **St. Monica, Kansas City**: www.stmonicakc.org blocks automated reading (robots.txt). Needs a look in a browser.
- **St. Andrew the Apostle, Gladstone**: The home page has only a September 2024 pastor's letter; the Mass times and Sacraments pages could not be loaded by the fetcher. Tried again on 14 Nov with URL variants; same result. Sources: https://www.sataps.com.
- **Christ the King, Kansas City**: www.ctkkcmo.org could not be read by the fetcher (client error).
- **St. Mary, Independence**: The home page has only news and a reflection, no times. The Mass times page could not be loaded by the fetcher. Sources: https://www.saintmarysparish.org/.
- **St. Mary, Higginsville**: The home page has only a short introduction and a 'Click here to learn more about us!' link, with no Mass or confession times. Inner pages could not be reached by the fetcher.
- **St. Mary, Carrollton**: carrollraycatholic.church (shared with Immaculate Conception, Richmond and Sacred Heart, Norborne) returned a client error. No times were read.
- **Church of Santa Fe, Buckner**: bucknercatholic.com returned a client error, so no times were read. No other source was used.
- **St. Robert Bellarmine, Blue Springs**: The home page has no times, and the Mass times and Sacraments pages could not be loaded by the fetcher. Sources: https://srbcatholic.org/.

## Site is out of date, times not used

- **St. Patrick, St. Joseph**: The Mass times page (modified July 2023) and the Penance page (Sept 2023) are stale and disagree. Mass times page says Sun 7:30 AM, 11:00 AM Spanish, 8:00 PM; Tue and Thu 6:45 AM; Wed 6:30 PM Spanish; Sat 4:00 PM. NOT entered. The site gives the address as 1813 S. 12th St.; the diocese says 1723 S 12th St. Sources: https://www.stpatrickstj.org/mass-times/, https://www.stpatrickstj.org/sacraments/penance/.
- **Twelve Apostles, Platte City**: The home page shows no weekly Mass or confession times, only Assumption times that match 2025. No Mass times page could be found by the fetcher. Sources: https://www.twelveapostlescatholic.org/.
- **St. Gregory Barbarigo, Maryville**: The home page is stale (news from 2015 and 2016). Its 'Regular Mass Schedule' (Sat 5:00 PM; Sun 8:00 AM, 10:30 AM, 5:00 PM; Tue to Fri 8:00 AM) was NOT entered because it cannot be confirmed as current. The /mass-times page failed to load. Sources: https://stgregorysmaryville.org/.
- **Our Lady of the Presentation, Lee's Summit**: The home page lists times but the rest of it dates from 2018 and 2019, so they were not used. The Mass times page could not be loaded by the fetcher. Sources: https://www.olpls.org/.
- **St. Peter, Kansas City**: The home page (stpkc.org) lists a schedule but also carries 2020-era items, so it was treated as stale and NOT entered: Mon-Fri 8:15 AM; Tue 6 PM; Sat 5:00 PM; Sun 9:00, 11:00 AM, 5:30 PM; confession Sat 4:15-4:45 PM, Tue 5:15-5:45 PM. The Mass times page could not be loaded.
- **St. Bernadette, Kansas City**: The home page is stale (a weather notice cancelling the Jan. 14-15 Masses, which fits 2023). Its times were NOT entered: Sat 4:00 PM; Sun 8:00, 10:30 AM; Tue-Fri 8:15 AM. Inner pages could not be loaded.
- **Nativity of Mary, Independence**: The home page is dated 2017 and has no times. The Mass times page could not be loaded by the fetcher. Sources: https://www.nativityofmary.org/.
- **Sacred Heart, Hamilton**: No website of its own. The shared munchin.net site (St. Munchin, Cameron) shows only a stale 2020 message and no Hamilton times. Sources: https://www.munchin.net/.
- **St. Joseph, Easton**: The page looks out of date or copied from another parish: it says all weekday Masses are at Plattsburg, lists a Tuesday 6 PM Latin Mass, gives no Saturday Mass, and mentions a Sunday 8 AM Mass only inside a confession sentence (Sunday confession 7:30 AM). Nothing entered. Sources: https://stjosepheaston.org/.
- **St. Munchin, Cameron**: The munchin.net home page is stale (a 2020 pandemic-era message) and its Mass Times heading has no times in the text, maybe an image. Sources: https://www.munchin.net/.
- **St. Sabina, Belton**: The only times page (Mass Times and Map) was last modified 2024-12-26, so it was not used as current. Confirm and enter if still right. Sources: https://stsabinaparish.org/mass-times-and-map/.

## Facebook only or no website

- **St. Paul the Apostle, Tarkio**: Facebook only (facebook.com/stpaultarkio).
- **St. Bridget, Rich Hill**: No website listed. It is a mission of St. Mary, Nevada, whose only listed link is Facebook. The St. Patrick, Holden site mentions an email at stbridgetph.org, which belongs to St. Bridget, Pleasant Hill, not Rich Hill.
- **St. Joseph, Parnell**: Facebook only (facebook.com/StJosephParnell).
- **St. Mary, Nevada**: Facebook only (facebook.com/SaintMarysNevada). The directory has an area code that looks mistyped; 417 is the local area code.
- **Immaculate Conception, Montrose**: Facebook only (facebook.com/stmarysschoolmontrose).
- **Immaculate Conception, Lexington**: Facebook only. The diocese directory lists only a Facebook page, which does not count.
- **St. Columba, Conception Junction**: Facebook only (facebook.com/ColumbaConception).
- **St. Patrick, Butler**: No parish website. The diocese lists only a discovermass.com page, which is a third-party listing and does not count.

## Mission times on another parish site, church not clearly named

- **Holy Trinity, Urich**: Our Lady of Lourdes, Harrisonville lists a Sunday 7:45 AM Mass 'at Holy Trinity', and Holy Trinity has the same number as Harrisonville in the diocese directory, so it is probably this church. But the page does not name Urich, and the diocese lists Urich as a mission of St. Patrick, Holden, whose site has no Urich times. Not entered until confirmed, the same way St. Lawrence (Greenup) was handled. Sources: https://ourladyoflourdesharrisonville.org/, https://www.stpatrickholden.org/mass-times.
- **St. Patrick, King City**: The shared St. Peter's and St. Patrick's site lists 'St. Patrick's - Ford City' with a Sunday 9:30 AM Mass, but never names King City, and the diocese gives King City with an incomplete street ('440 St'). Not entered until it is confirmed that this is the same church and its street address is known. Sources: https://stpetersandstpatricks.weebly.com/mass-times.html.

## Map placement

- Holy Spirit (Lee's Summit), St. Robert Bellarmine (Blue Springs) and St. Patrick (King City) are placed at the town center: the Census geocoder found no match for their highway or incomplete addresses.
- A few geocoder matches landed on the other side of a street-direction prefix (St. James Liberty matched N Stewart Rd for S Stewart Rd; Annunciation Kearney matched S Jefferson for N Jefferson; Mary Immaculate Gallatin matched N Main for S Main). Each is within a few blocks.
