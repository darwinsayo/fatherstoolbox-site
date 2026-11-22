"""Imports the books of The Library that come from Project Gutenberg plain-text ebooks.

    python3 -I library/import/gutenberg.py <folder with pg14552.txt, pg130.txt> [book ...]

Books: catechism, orthodoxy (default: both). The Imitation comes from challoner.py; the Bible from douay_rheims.py. Each writes library/books/<slug>.json.

The texts were fetched from Archive.org's copies of the Gutenberg ebooks (Project Gutenberg itself was down).
Everything before the start of the book and after its end (the Gutenberg header, licence and name) is
dropped; only the book's own text is kept. Plain-text typography is turned into print typography:
curly quotes, em dashes for "--". The Bible's verse-numbering slips are repaired by the rules in
bible() and by the hand fixes in gutenberg_fixes.json; every repair is listed when the script runs.
"""
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', 'books')
ROMAN = {'I': 1, 'V': 5, 'X': 10, 'L': 50, 'C': 100}


def roman(s):
    n = 0
    for a, b in zip(s, s[1:] + ' '):
        v = ROMAN[a]
        n += -v if b != ' ' and ROMAN[b] > v else v
    return n


def read(folder, name):
    with open(os.path.join(folder, name), 'rb') as f:
        return f.read().decode('latin-1').replace('\r\n', '\n')


def between(text, start, end):
    i = text.index(start)
    j = text.index(end, i)
    return text[i:j]


ELISION = re.compile(r"'(?=(tis|twas|twere|twill|em|gainst|neath|mid|st|ll|s)\b)", re.I)


def typeset(s):
    """Straight quotes to curly, -- to an em dash, runs of spaces to one. Plain text in, plain text out."""
    s = s.replace('`', '‘')
    s = re.sub(r'\s*--\s*', '—', s)
    s = ELISION.sub('’', s)
    out = []
    for i, ch in enumerate(s):
        prev = s[i - 1] if i else ' '
        if ch == '"':
            out.append('“' if (prev.isspace() or prev in '([—‘') else '”')
        elif ch == "'":
            nxt = s[i + 1] if i + 1 < len(s) else ' '
            if (prev.isspace() or prev in '([—“') and nxt.isalpha():
                out.append('‘')
            else:
                out.append('’')
        else:
            out.append(ch)
    return re.sub(r'[ \t]+', ' ', ''.join(out)).strip()


def esc(s):
    return s.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')


def html(s):
    """Plain text to the little HTML a book file allows."""
    return esc(typeset(s)).replace('&amp;', '&')


def chunks(text):
    """Blank-line separated blocks, each as a list of raw lines."""
    return [c.strip('\n').split('\n') for c in re.split(r'\n[ \t]*\n', text.strip('\n')) if c.strip()]


def flat(lines):
    return ' '.join(l.strip() for l in lines)


def write(book):
    path = os.path.join(OUT, book['slug'] + '.json')
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(book, f, ensure_ascii=False, indent=1)
        f.write('\n')
    chapters = sum(len(s['chapters']) for s in book['sections'])
    words = 0
    for s in book['sections']:
        for c in s['chapters']:
            for b in c['blocks']:
                words += len(re.sub(r'<[^>]+>', ' ', ' '.join(str(b.get(k, '')) for k in ('h', 'q', 'a'))).split())
    print(f"{book['slug']}: {chapters} chapters, {words:,} words -> {os.path.relpath(path)}")


# ---------------------------------------------------------------- Orthodoxy

def orthodoxy(folder):
    text = read(folder, 'pg130.txt')
    body = between(text, '\nPREFACE\n', '***END OF THE PROJECT GUTENBERG EBOOK')
    preface, rest = body.split('\nCONTENTS\n', 1)
    rest = rest.split('\nORTHODOXY\n', 1)[1]

    def blocks(raw):
        out = []
        for lines in chunks(raw):
            # inside a chunk, a new paragraph starts at each line indented by five spaces
            paras, cur = [], []
            for l in lines:
                if re.match(r' {5}\S', l) and cur:
                    paras.append(cur)
                    cur = []
                cur.append(l)
            paras.append(cur)
            for p in paras:
                s = flat(p)
                if re.match(r' {20,}', p[0]):                 # the signature under the preface
                    out.append({'t': 'p', 'h': f'<i>{html(s)}</i>'})
                    continue
                indented = bool(re.match(r' {5}\S', p[0]))
                s = re.sub(r'(?<=\S) {4,}(?=\S)', ' / ', ' '.join(l.strip(' ') if i else l.strip() for i, l in enumerate(p)))
                kind = 'p'
                if not indented and s.startswith('"') and out and out[-1]['t'] == 'p' and re.search(r'[:—,;]$|--$', p_prev_end(out)):
                    kind = 'bq'
                out.append({'t': kind, 'h': html(s)})
        return out

    def p_prev_end(out):
        return re.sub(r'<[^>]+>', '', out[-1]['h'])

    preface_blocks = [b for b in blocks(preface.split('PREFACE', 1)[1]) if b['h']]
    sections = [{'title': '', 'chapters': [{'path': 'preface', 'title': 'Preface', 'blocks': preface_blocks}]}]
    pieces = re.split(r'\n([IVX]+) ([A-Z][A-Z ]+)\n', rest)
    chapters = []
    for num, title, raw in zip(pieces[1::3], pieces[2::3], pieces[3::3]):
        bl = blocks(raw)
        bl[0]['h'] = re.sub(r'^THE ', 'The ', bl[0]['h'])
        t = title.strip().title().replace(' In ', ' in ').replace(' Of ', ' of ').replace(' The ', ' the ').replace(' And ', ' and ')
        n = roman(num)
        chapters.append({'path': f'chapter-{n}', 'label': f'Chapter {num}', 'title': t, 'num': str(n),
                         'nav': f'Chapter {num}: {t}', 'blocks': bl})
    assert len(chapters) == 9
    sections[0]['chapters'] += chapters
    write({
        'slug': 'orthodoxy', 'order': 4, 'kind': 'prose',
        'title': 'Orthodoxy', 'short': 'Orthodoxy', 'author': 'G. K. Chesterton',
        'about': 'Chesterton’s account of how he came to believe the Christian faith, written in 1908 before he became a Catholic. '
                 'Witty, surprising, and still one of the best defences of the Creed.',
        'edition': '<i>Orthodoxy</i>, by Gilbert K. Chesterton. First published in 1908. Public domain.',
        'sections': sections,
    })


# ---------------------------------------------------------------- The Baltimore Catechism

ORDINALS = ['FIRST', 'SECOND', 'THIRD', 'FOURTH', 'FIFTH', 'SIXTH', 'SEVENTH', 'EIGHTH', 'NINTH', 'TENTH',
            'ELEVENTH', 'TWELFTH', 'THIRTEENTH', 'FOURTEENTH', 'FIFTEENTH', 'SIXTEENTH', 'SEVENTEENTH', 'EIGHTEENTH',
            'NINETEENTH', 'TWENTIETH']


def ordinal(word):
    word = word.replace('TWENTY-', '').replace('THIRTY-', '')
    base = {'LESSON TWENTY': 0}
    return ORDINALS.index(word) + 1


def lesson_number(name):
    tens = 20 if name.startswith('TWENTY-') else 30 if name.startswith('THIRTY-') else 0
    if name in ('TWENTIETH',):
        return 20
    if name in ('THIRTIETH',):
        return 30
    return tens + ORDINALS.index(name.split('-')[-1]) + 1


SMALL = {'a', 'an', 'and', 'as', 'at', 'by', 'for', 'from', 'in', 'into', 'of', 'on', 'or', 'the', 'to', 'upon', 'with'}


def titlecase(s):
    """THE APOSTLES' CREED -> The Apostles' Creed; small words stay lower case except at the start."""
    words = s.lower().split(' ')
    return ' '.join(w if (i and w in SMALL) else w[:1].upper() + w[1:] for i, w in enumerate(words)) \
        .replace('-f', '-F').replace('(f', '(F')


def catechism_answer(lines):
    """Answer text: lines that start a numbered item or an indented line keep their line break."""
    out = []
    for l in lines:
        if out and re.match(r'\s*\d+\. ', l):
            out.append('<br>')
        out.append(l.strip())
    return ' '.join(out).replace(' <br> ', '<br>')


def catechism(folder):
    text = read(folder, 'pg14552.txt')
    body = between(text, '\nPRAYERS\n', '\nEnd of Project Gutenberg')
    body = body.replace('By every heart and tongued.', 'By every heart and tongue.')     # a typing slip in the ebook
    body = re.sub(r'\|\| ?| ?\|\|', '', body)                                         # repeat marks in the hymns
    body = body.replace('at the right hand Of\nGod', 'at the right hand of\nGod')            # a typing slip in the ebook
    prayers, rest = body.split('\nCATECHISM\n', 1)
    lessons_raw, after = rest.split('\nMORNING PRAYERS\n', 1)
    after = 'MORNING PRAYERS\n' + after

    def logical_lines(lines):
        """Rejoin lines the ebook wrapped; keep the breaks the book made (short lines, responses, list items)."""
        out = []
        for i, l in enumerate(lines):
            starts = re.match(r'\s*(\*|\d+\. |(First|Second|Third|Fourth|Fifth) Mystery|[VR]\. |CHORUS)', l)
            if out and not starts and len(lines[i - 1].rstrip()) >= 55:
                out[-1] += ' ' + l.strip()
            else:
                out.append(l.strip())
        return out

    def prayer_blocks(raw, hymns=False):
        out = []
        note = None
        for lines in chunks(raw):
            first = lines[0].strip()
            if note is not None or first.startswith('['):          # a bracketed note, possibly over several paragraphs
                note = (note + '<br><br>' if note else '') + html(flat(lines).lstrip('['))
                if note.endswith(']'):
                    out.append({'t': 'n', 'h': note.rstrip(']')})
                    note = None
                continue
            if hymns and not re.match(r'\d+\. |CHORUS|[VR]\. ', first) and len(lines) <= 2:
                out.append({'t': 'h', 'h': html(first)})
                if len(lines) == 2:
                    out.append({'t': 'n', 'h': html(titlecase(lines[1].strip('() ')).replace('S.j.', 'S.J.'))})
                continue
            if re.match(r'\s{3,}[A-Z ]+$', lines[0]) and len(lines) == 1:   # the words of consecration
                out.append({'t': 'p', 'h': f'<b>{html(first)}</b>'})
                continue
            if first.isupper() and len(first) < 90 and not first.startswith('+'):
                out.append({'t': 'h', 'h': html(titlecase(first.lstrip('*').rstrip('.')))})
                lines = lines[1:]
                if lines and lines[0].startswith('('):
                    out.append({'t': 'n', 'h': html(flat(lines).strip('()'))})
                    lines = []
                if not lines:
                    continue
            if len(lines) == 1 and first in ('Stand', 'Kneel', 'Sit'):
                out.append({'t': 'p', 'h': f'<span class="sc">{first}</span>'})
                continue
            ll = logical_lines(lines)
            if len(ll) > 1:
                out.append({'t': 'bq', 'h': '<br>'.join(html(l) for l in ll)})
            else:
                out.append({'t': 'p', 'h': html(ll[0])})
        assert note is None
        return out

    sections = []
    sections.append({'title': 'Prayers', 'chapters': [{'path': 'prayers', 'title': 'Prayers',
                                                     'blocks': prayer_blocks(prayers.split('PRAYERS', 1)[1])}]})
    lessons = re.split(r'\nLESSON ([A-Z-]+)\n(.+)\n', lessons_raw)
    chapters = []
    expected_q = 1
    for name, title, raw in zip(lessons[1::3], lessons[2::3], lessons[3::3]):
        n = lesson_number(name)
        assert n == len(chapters) + 1, (n, name)
        blocks = []
        for lines in chunks(raw):
            s = '\n'.join(lines)
            m = re.match(r'(\d+)\. Q\. (.*?)\nA\. (.*)$', s, re.S)
            if m:
                q = int(m.group(1))
                assert q == expected_q, (q, expected_q)
                expected_q += 1
                blocks.append({'t': 'q', 'n': str(q), 'q': html(flat(m.group(2).split('\n'))),
                               'a': html(catechism_answer(m.group(3).split('\n'))).replace('&lt;br&gt;', '<br>')})
            elif s.startswith('['):
                blocks.append({'t': 'n', 'h': html(flat(lines).strip('[]'))})
            elif blocks and blocks[-1]['t'] == 'q':      # a list that belongs to the answer above it
                blocks[-1]['a'] += '\n\n' + html(catechism_answer(lines)).replace('&lt;br&gt;', '<br>')
            else:
                raise ValueError('Unexpected text in lesson %d: %r' % (n, s[:80]))
        word = name.title()
        t = titlecase(title).replace('--', ': ').replace(': On', ': on')
        chapters.append({'path': f'lesson-{n}', 'label': f'Lesson {word}', 'title': t, 'num': str(n),
                         'nav': f'Lesson {word}: {t}', 'blocks': blocks})
    assert len(chapters) == 37 and expected_q == 422, (len(chapters), expected_q)
    sections.append({'title': 'The Catechism', 'short': 'The Catechism',
                     'intro': '421 questions and answers in 37 lessons.', 'chapters': chapters})

    parts = re.split(r'\n(?=MORNING PRAYERS\n|EVENING PRAYERS\n|PRAYERS FOR MASS\n|THE RIGHT MANNER OF CONFESSING\n|'
                     r'COMMUNION PRAYERS\n|THE ROSARY OF THE BLESSED VIRGIN\n|THE STATIONS OF THE CROSS\n|HYMNS\n)', '\n' + after)
    devotions = []
    for part in parts:
        if not part.strip():
            continue
        head, raw = part.split('\n', 1)
        t = head.strip()
        t = titlecase(t)
        slug = re.sub(r'[^a-z]+', '-', t.lower()).strip('-')
        devotions.append({'path': slug, 'title': t, 'blocks': prayer_blocks(raw, hymns=t == 'Hymns')})
    sections.append({'title': 'Prayers and devotions', 'short': 'Prayers and devotions', 'chapters': devotions})
    write({
        'slug': 'the-baltimore-catechism', 'order': 3, 'kind': 'catechism',
        'title': 'The Baltimore Catechism', 'short': 'Baltimore Catechism', 'author': 'Third Plenary Council of Baltimore',
        'about': 'The catechism that taught the faith to generations of American Catholics. This is No. 2, the edition '
                 'for Confirmation classes: 421 questions and answers in 37 lessons, with prayers and hymns.',
        'edition': '<i>A Catechism of Christian Doctrine, Prepared and Enjoined by Order of the Third Plenary Council of '
                   'Baltimore</i>, No. 2, with prayers and hymns. Approved by Archbishop James Gibbons of Baltimore and '
                   'John Cardinal McCloskey of New York, April 6, 1885. From a later printing: answer 257, on the fast before '
                   'Holy Communion, was updated to the rule of 1977, and the Mass prayers follow Father Finn’s '
                   '<i>Prayer Book for Catholic Youth</i>. Public domain.',
        'sections': sections,
    })


BOOKS = {'catechism': catechism, 'orthodoxy': orthodoxy}

if __name__ == '__main__':
    folder = sys.argv[1]
    wanted = sys.argv[2:] or list(BOOKS)
    for name in wanted:
        BOOKS[name](folder)
