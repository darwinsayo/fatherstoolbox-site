"""Imports the Douay-Rheims Bible (Challoner revision) from the Gutenberg plain-text ebook pg8300.txt.

    python3 -I library/import/douay_rheims.py <folder with pg8300.txt> [--report]

Writes library/books/douay-rheims-bible.json. Only the Bible's own text is kept: the Gutenberg header, the
licence and the name are dropped. The ebook has typing slips in its verse numbers and a few lost verses; they
are repaired by exact text replacements listed in douay_rheims_fixes.json (each must match once), and
--report lists every place where the verse numbers still do not run 1, 2, 3 ...
"""
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from gutenberg import html as _html, typeset, write   # noqa: E402

FIXES = {}


def html(s):
    return _html(respell(s, FIXES))

# heading name used in the ebook -> (url slug, title, testament)
BOOKS = [
    ('Genesis', 'genesis', 'Genesis', 'ot'), ('Exodus', 'exodus', 'Exodus', 'ot'), ('Leviticus', 'leviticus', 'Leviticus', 'ot'),
    ('Numbers', 'numbers', 'Numbers', 'ot'), ('Deuteronomy', 'deuteronomy', 'Deuteronomy', 'ot'),
    ('Josue', 'josue', 'Josue', 'ot'), ('Judges', 'judges', 'Judges', 'ot'), ('Ruth', 'ruth', 'Ruth', 'ot'),
    ('1 Kings', '1-kings', '1 Kings', 'ot'), ('2 Kings', '2-kings', '2 Kings', 'ot'), ('3 Kings', '3-kings', '3 Kings', 'ot'),
    ('4 Kings', '4-kings', '4 Kings', 'ot'), ('1 Paralipomenon', '1-paralipomenon', '1 Paralipomenon', 'ot'),
    ('2 Paralipomenon', '2-paralipomenon', '2 Paralipomenon', 'ot'), ('1 Esdras', '1-esdras', '1 Esdras', 'ot'),
    ('2 Esdras', '2-esdras', 'Nehemias (2 Esdras)', 'ot'), ('Tobias', 'tobias', 'Tobias', 'ot'), ('Judith', 'judith', 'Judith', 'ot'),
    ('Esther', 'esther', 'Esther', 'ot'), ('Job', 'job', 'Job', 'ot'), ('Psalms', 'psalms', 'Psalms', 'ot'),
    ('Proverbs', 'proverbs', 'Proverbs', 'ot'), ('Ecclesiastes', 'ecclesiastes', 'Ecclesiastes', 'ot'),
    ('Canticle of Canticles', 'canticle-of-canticles', 'Canticle of Canticles', 'ot'), ('Wisdom', 'wisdom', 'Wisdom', 'ot'),
    ('Ecclesiasticus', 'ecclesiasticus', 'Ecclesiasticus', 'ot'), ('Isaias', 'isaias', 'Isaias', 'ot'),
    ('Jeremias', 'jeremias', 'Jeremias', 'ot'), ('Lamentations', 'lamentations', 'Lamentations', 'ot'),
    ('Baruch', 'baruch', 'Baruch', 'ot'), ('Ezechiel', 'ezechiel', 'Ezechiel', 'ot'), ('Daniel', 'daniel', 'Daniel', 'ot'),
    ('Osee', 'osee', 'Osee', 'ot'), ('Joel', 'joel', 'Joel', 'ot'), ('Amos', 'amos', 'Amos', 'ot'),
    ('Abdias', 'abdias', 'Abdias', 'ot'), ('Jonas', 'jonas', 'Jonas', 'ot'), ('Micheas', 'micheas', 'Micheas', 'ot'),
    ('Nahum', 'nahum', 'Nahum', 'ot'), ('Habacuc', 'habacuc', 'Habacuc', 'ot'), ('Sophonias', 'sophonias', 'Sophonias', 'ot'),
    ('Aggeus', 'aggeus', 'Aggeus', 'ot'), ('Zacharias', 'zacharias', 'Zacharias', 'ot'), ('Malachias', 'malachias', 'Malachias', 'ot'),
    ('1 Machabees', '1-machabees', '1 Machabees', 'ot'), ('2 Machabees', '2-machabees', '2 Machabees', 'ot'),
    ('Matthew', 'matthew', 'Matthew', 'nt'), ('Mark', 'mark', 'Mark', 'nt'), ('Luke', 'luke', 'Luke', 'nt'),
    ('John', 'john', 'John', 'nt'), ('Acts', 'acts', 'Acts of the Apostles', 'nt'), ('Romans', 'romans', 'Romans', 'nt'),
    ('1 Corinthians', '1-corinthians', '1 Corinthians', 'nt'), ('2 Corinthians', '2-corinthians', '2 Corinthians', 'nt'),
    ('Galatians', 'galatians', 'Galatians', 'nt'), ('Ephesians', 'ephesians', 'Ephesians', 'nt'),
    ('Philippians', 'philippians', 'Philippians', 'nt'), ('Colossians', 'colossians', 'Colossians', 'nt'),
    ('1 Thessalonians', '1-thessalonians', '1 Thessalonians', 'nt'), ('2 Thessalonians', '2-thessalonians', '2 Thessalonians', 'nt'),
    ('1 Timothy', '1-timothy', '1 Timothy', 'nt'), ('2 Timothy', '2-timothy', '2 Timothy', 'nt'), ('Titus', 'titus', 'Titus', 'nt'),
    ('Philemon', 'philemon', 'Philemon', 'nt'), ('Hebrews', 'hebrews', 'Hebrews', 'nt'), ('James', 'james', 'James', 'nt'),
    ('1 Peter', '1-peter', '1 Peter', 'nt'), ('2 Peter', '2-peter', '2 Peter', 'nt'), ('1 John', '1-john', '1 John', 'nt'),
    ('2 John', '2-john', '2 John', 'nt'), ('3 John', '3-john', '3 John', 'nt'), ('Jude', 'jude', 'Jude', 'nt'),
    ('Apocalypse', 'apocalypse', 'Apocalypse', 'nt'),
]
BYNAME = {b[0]: b for b in BOOKS}

CHAPTER = re.compile(r'^(.+?) Chapter (\d+)$')
VERSE = re.compile(r'(\d+)[:;.]([\dl]+)[.:,;]?(?: +|$)')
INLINE = re.compile(r'(?<=[\s:;.,)])(\d+):(\d+)\. ')


def load(folder):
    with open(os.path.join(folder, 'pg8300.txt'), 'rb') as f:
        t = f.read().decode('latin-1').replace('\r\n', '\n')
    a = t.index('THE BOOK OF GENESIS\n\nThis')
    b = t.index('\nEnd of the Project Gutenberg')
    body = t[a:b]
    with open(os.path.join(HERE, 'douay_rheims_fixes.json'), encoding='utf-8') as f:
        fixes = json.load(f)
    for old, new in fixes['replace']:
        if body.count(old) != 1:
            raise SystemExit('Fix does not match exactly once (%d): %r' % (body.count(old), old[:70]))
        body = body.replace(old, new)
    return body, fixes


def parse(body):
    paras = [p.strip('\n') for p in re.split(r'\n[ \t]*\n', body) if p.strip()]
    books, cur, chap, front = {}, None, None, []
    order = []
    prayer_title = None
    for p in paras:
        m = CHAPTER.match(p)
        if m:
            name, n = m.group(1), int(m.group(2))
            if name not in BYNAME:
                raise SystemExit('Unknown book ' + name)
            if name not in books:
                books[name] = {'front': front, 'chapters': [], 'prologue': []}
                if '\0PROLOGUE' in front:
                    k = front.index('\0PROLOGUE')
                    books[name]['front'], books[name]['prologue'] = front[:k], front[k + 1:]
                order.append(name)
                front = []
            cur = books[name]
            chap = {'n': n, 'head': [], 'items': []}
            if prayer_title and name == 'Lamentations' and n == 5:
                chap['items'].append(('head', prayer_title))
            cur['chapters'].append(chap)
            continue
        flatp = ' '.join(l.strip() for l in p.split('\n'))
        if re.fullmatch(r'[A-Z]+\.', p.strip()) and chap is not None:           # Hebrew letters in Psalm 118: ALEPH. BETH. ...
            chap['items'].append(('h', p.strip()[0] + p.strip()[1:-1].lower()))
            continue
        if p.isupper() and '\n' not in p and len(p) < 100 and chap is not None:
            if p == 'THE PRAYER OF JEREMIAS THE PROPHET':       # heading inside Lamentations 5
                prayer_title = 'The prayer of Jeremias the prophet'
                chap = None
                front = []
                continue
            if p == 'THE PROLOGUE':                              # Ecclesiasticus: its prologue comes before chapter 1
                front.append('\0PROLOGUE')
                chap = None
                continue
            front = [flatp]                                      # the title of the next book starts its front matter
            chap = None
            continue
        if p == 'THE PROLOGUE':
            front.append('\0PROLOGUE')
            continue
        if chap is None:
            front.append(flatp)
            continue
        lead = ''
        mm0 = re.match(r'^([A-Z][a-z]+\.) (?=\d+:\d+\. )', flatp)        # "Alleluia. 115:10. ..." (a word before the number)
        if mm0:
            lead, flatp = mm0.group(1) + ' ', flatp[mm0.end():]
        m = VERSE.match(flatp)
        last = max([i[2] for i in chap['items'] if i[0] == 'v'] or [0]) if chap['items'] else 0
        bare = re.match(r'(\d+)\. (?=\S)', flatp)                          # a verse that lost its chapter number: "9. I wrote to you"
        if bare and int(bare.group(1)) == last + 1 and not m:
            chap['items'].append(('v', chap['n'], int(bare.group(1)), flatp[bare.end():]))
            continue
        if m and re.match(r'\d', flatp):
            # a paragraph may hold several verses: "2:5. ... 2:6. ..."  or  "... text:   11  more text"
            flatp = re.sub(r'(?<=\S) {2,}(\d+) {2,}(?=\S)', lambda x: f' {m.group(1)}:{x.group(1)}. ' if int(x.group(1)) == int(m.group(2).replace('l', '1')) + 1 else x.group(0), flatp)
            marks = [(0, m)] + [(x.start(), x) for x in re.finditer(r'(?<=[\s:;.,)])(\d+):(\d+)\. ', flatp) if x.start() > 0]
            for k, (pos, mm) in enumerate(marks):
                end = marks[k + 1][0] if k + 1 < len(marks) else len(flatp)
                text = flatp[mm.end():end].strip()
                chap['items'].append(('v', int(mm.group(1)), int(mm.group(2).replace('l', '1')), (lead if not k else '') + text))
            continue
        chap['items'].append(('n' if any(i[0] == 'v' for i in chap['items']) else 'head', lead + flatp))
    return books, order


def renumber(books, order, fixes):
    """Repair verse labels. A verse labelled out of order is renumbered when the verse after it carries the number that
    follows (a typing slip); chapters whose numbering restarts part-way (Psalms 9 and 113) are continued."""
    offsets = {(b, c): at for b, c, at in fixes.get('continue', [])}
    changed = []
    for name in order:
        for c in books[name]['chapters']:
            vs = [i for i in c['items'] if i[0] == 'v']
            idx = [k for k, i in enumerate(c['items']) if i[0] == 'v']
            off, last = 0, 0
            for j, k in enumerate(idx):
                _, ch, v, text = c['items'][k]
                if (name, c['n']) in offsets and v == 1 and last == offsets[(name, c['n'])] and not off:
                    off = last
                v2 = v + off
                if v2 != last + 1:
                    nxt = c['items'][idx[j + 1]][2] + off if j + 1 < len(idx) else None
                    if nxt == last + 2 or (nxt is None and v2 == last + 2):
                        changed.append(f"{name} {c['n']}: {v2} -> {last + 1}")
                        v2 = last + 1
                if v2 != v:
                    c['items'][k] = ('v', ch, v2, text)
                last = v2
    return changed


def report(books, order):
    n = 0
    for name in order:
        for c in books[name]['chapters']:
            last = 0
            for it in c['items']:
                if it[0] == 'v':
                    _, ch, v, text = it
                    if v != last + 1 and not (last == 0 and (name, c['n']) in {('Psalms', 115), ('Psalms', 147)}):
                        print(f"{name} {c['n']}: after verse {last} comes {ch}:{v}  {text[:50]!r}")
                        n += 1
                    last = v
    print(n, 'places where the verse numbers do not run in order')


def respell(text, fixes, _cache={}):
    """Whole-word corrections of the ebook's typing slips (listed in the fixes file). Keeps a leading capital."""
    if 'rx' not in _cache:
        words = fixes.get('words', {})
        _cache['rx'] = re.compile(r'(?<![A-Za-z])(' + '|'.join(sorted(map(re.escape, words), key=len, reverse=True)) + r')(?![A-Za-z])', re.I)
        _cache['w'] = {k.lower(): v for k, v in words.items()}

    def one(m):
        w = m.group(1)
        right = _cache['w'][w.lower()]
        return right[:1].upper() + right[1:] if w[:1].isupper() else right
    return _cache['rx'].sub(one, text)


def build(books, order, fixes):
    sections = []
    for name in order:
        _, slug, title, test = BYNAME[name]
        b = books[name]
        front = [f for f in b['front'] if f != 'THE NEW TESTAMENT']
        chapters = []
        for c in b['chapters']:
            blocks = []
            if c['n'] == 1 and b['prologue']:
                blocks.append({'t': 'h', 'h': 'The Prologue'})
                blocks += [{'t': 'p', 'h': html(x)} for x in b['prologue']]
            seen_letter = False
            for it in c['items']:
                if it[0] == 'head':
                    blocks.append({'t': 'n', 'h': html(it[1])} if seen_letter else {'t': 'p', 'h': f'<i>{html(it[1])}</i>'})
                elif it[0] == 'h':
                    seen_letter = True
                    blocks.append({'t': 'h', 'h': it[1]})
                elif it[0] == 'v':
                    blocks.append({'t': 'v', 'n': str(it[2]), 'h': html(it[3])})
                else:
                    blocks.append({'t': 'n', 'h': html(it[1])})
            chapters.append({'path': f"{slug}/{c['n']}", 'title': f"{title} {c['n']}", 'num': str(c['n']),
                             'nav': f"{title} {c['n']}", 'blocks': blocks})
        sections.append({'slug': slug, 'title': title, 'short': title, 'page': True,
                         'intro': html(' '.join(front[1:]) if front and front[0].isupper() else ' '.join(front)),
                         'chapters': chapters, '_test': test})
    groups = [{'title': 'The Old Testament', 'sections': [s['slug'] for s in sections if s['_test'] == 'ot']},
              {'title': 'The New Testament', 'sections': [s['slug'] for s in sections if s['_test'] == 'nt']}]
    for s in sections:
        del s['_test']
    return sections, groups


def main():
    folder = sys.argv[1]
    body, fixes = load(folder)
    FIXES.update(fixes)
    books, order = parse(body)
    assert len(order) == 73, len(order)
    for line in renumber(books, order, fixes):
        print('relabelled', line)
    if '--report' in sys.argv:
        report(books, order)
        return
    sections, groups = build(books, order, fixes)
    write({
        'slug': 'douay-rheims-bible', 'order': 5, 'kind': 'bible',
        'title': 'The Holy Bible, Douay-Rheims Version', 'short': 'Douay-Rheims Bible', 'author': 'Challoner revision',
        'about': 'The Catholic Bible in English, translated from the Latin Vulgate. The Old Testament was first published '
                 'at Douay in 1609 and 1610 and the New Testament at Rheims in 1582; Bishop Richard Challoner revised both '
                 'in 1749 to 1752. Seventy-three books, with Challoner’s notes.',
        'edition': '<i>The Holy Bible, translated from the Latin Vulgate, diligently compared with the Hebrew, Greek and other '
                   'editions</i>. The Douay-Rheims version as revised by Bishop Richard Challoner, A.D. 1749 to 1752, with '
                   'annotations. Verse numbers were checked, and verses missing from the first text restored, against the 1914 printing '
                   'by the John Murphy Company, Baltimore. Public domain.',
        'groups': groups, 'sections': sections,
    })


if __name__ == '__main__':
    main()
