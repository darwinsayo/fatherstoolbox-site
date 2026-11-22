"""Imports The Imitation of Christ in Bishop Challoner's translation (called "The Following of Christ").

    python3 -I library/import/challoner.py <folder with the two Archive.org text files>

Needs, from Archive.org's full-text (djvu) copies of two printings of Challoner's translation:
    imitation-TheFollowingOfChrist1838.txt   Eugene Cummiskey, Philadelphia, 1838 (the text that is used)
    imitation-followingofchris00thom.txt     Keating, Brown and Co., London, 1819 (only used to check the first one)

Writes library/books/the-imitation-of-christ.json. Only the four books are kept; the page headers and
"Digitized by Google" stamps are dropped, the line breaks and hyphens are joined up, and the scanning errors are
repaired in three steps: (1) rules for the usual slips, (2) wherever the 1819 scan has a clearly better reading
of a word, that reading is used (a word is only changed when the scan's word is not an English word the other
Library books use and the 1819 word is one), and (3) hand fixes for what is left, in challoner_fixes.json
(each must match once). Run with --report to list words that still look wrong.
"""
import collections
import difflib
import glob
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from gutenberg import html, write   # noqa: E402

REPO = os.path.join(HERE, '..', '..')
WORD = re.compile(r"[A-Za-z]+(?:['’][a-z]+)?")

# ------------------------------------------------------------ vocabulary of the other Library books

VOCAB = collections.Counter()


def load_vocab(folder):
    for f in ['pg1653.txt', 'pg14552.txt', 'pg130.txt', 'pg8300.txt']:
        p = os.path.join(folder, f)
        if os.path.exists(p):
            VOCAB.update(w.lower() for w in WORD.findall(open(p, encoding='latin-1').read()))
    for p in glob.glob(os.path.join(REPO, 'library', 'books', '*.json')):
        if 'imitation' not in p:
            VOCAB.update(w.lower() for w in WORD.findall(open(p, encoding='utf-8').read()))


def known(w, n=2):
    return VOCAB.get(w.lower(), 0) >= n


# ------------------------------------------------------------ page furniture and the first rough text

JUNK = re.compile(r'(?i)(digi|gitized|ized by|by g|goog|g00|\bcjoo|^[>\s)yV]*Google|i by Google)')
# running heads like "20 THE FOLLOWING [BOOK I." and "CHAP. II.] OF CHRIST. 19", however badly scanned
HEAD1 = re.compile(r"\s*\d{0,3}\s*(?:T[HBIUL][EISB1T]+|THIS)\s+[FP]OLLOWING[,.]?\s*(?:&\w\.?)?\s*[\[\{\|\(IfJ]?\s*B[O0]{1,2}[KRH]\.?\s*[IVXLTlU1H]{1,5}[.,\*\]]?\s*", re.I)
HEAD2 = re.compile(r"\s*\d{0,3}\s*\S{1,5}\s+\S{0,3}(?:OLLOW|ollow)\S*\s*[\[\{\|(f]?\s*B\S{2,4}\s+[IVXLTil]{1,4}[.,*]?\s*")
HEAD3 = re.compile(r"\s*(?:[A-Za-z/&]{0,2}H?[A-Z]{1,2}A[FP]\.?|CHAP[.*;,]?|chap[;,.]?)\s*[A-Za-z]{0,3}\s*[IVXLlixv]{1,6}\.?\]\s*(?:O[FP]|QF|of)\s*CHRIST\S*(?:\s*\d{1,3})?\s*", re.I)


def extract(text):
    """The four books of the 1838 print as {book number: [(heading line, [text lines])]}, lead of Book IV apart."""
    lines = text.split('\n')
    start = next(i for i, l in enumerate(lines) if l.strip() == 'BOOK I.')
    end = next(i for i, l in enumerate(lines) if l.strip() == 'CONTENTS')
    keep = []
    for l in lines[start:end]:
        s = l.strip()
        if JUNK.search(s) and len(s) < 40:
            continue
        if re.match(r'^\d*\s*THE\s+FOLLOWING\s*[\[\(]?\s*BOO', s) or re.match(r'^THE FOLLOWING$', s):
            continue
        if re.match(r'^(CHAP[.,]? [A-Za-z]+[.,]?\]?.*|OF CHRIST[.*]?)$', s) and len(s) < 30:
            continue
        if re.match(r'^FOLLOWING OF CHRIST', s) or re.match(r'^\d{1,3}$', s):
            continue
        if re.match(r'^[{(\[]?CHAP[.,]\s.{0,14}[\]J]', s):
            continue
        keep.append(l.rstrip())
    books, lead = [], {}
    cur = None
    for l in keep:
        s = l.strip()
        if re.match(r'^BOOK\s+[IVL1]+[.,]?$', s):
            books.append([])
            cur = lead[len(books)] = []
            continue
        if re.match(r"^\W*CHAPTER\b", s):
            cur = []
            books[-1].append((s, cur))
            continue
        cur.append(l)
    assert [len(b) for b in books] == [25, 12, 59, 18], [len(b) for b in books]
    return books, lead


def chunk_lines(lines):
    out, cur = [], []
    for l in lines:
        if l.strip():
            cur.append(l.strip())
        elif cur:
            out.append(cur)
            cur = []
    if cur:
        out.append(cur)
    return out


NUM = re.compile(r'^[\W_]{0,3}([0-9IlL%$S]{1,3})\s*[.,]\s*(.*)$', re.S)


def paragraphs(lines):
    """(title lines, paragraphs, notes) of one chapter. A numbered paragraph starts at each chunk that starts with
    a number; the other chunks, left by page breaks, continue the paragraph before."""
    cs = chunk_lines(lines)
    # the heading is the first chunk; it can run on into the next one when a page ended in the middle of it
    title = cs.pop(0)
    while cs and (all(re.match(r"^[A-Z0-9 ,.'’:;()\-—&*]+$", l) or re.match(r"^[A-Z][A-Z ,.'’\-]+ ?[a-z]? ?[A-Z ,.'’\-]*$", l) for l in cs[0])
                  and not NUM.match(' '.join(cs[0])) and len(' '.join(cs[0])) < 90):
        title += cs.pop(0)
    paras, notes = [], []
    for ch in cs:
        txt = ' '.join(ch)
        m = NUM.match(txt)
        if m and re.match(r'^[A-Z"“‘\[(\w]', m.group(2) or 'x') and len(ch[0]) > 4:
            paras.append(m.group(2))
            continue
        if re.match(r'^\* The author seems', txt):
            notes.append(txt)
            continue
        if len(txt) < 14 and not re.search(r'[a-z]{4}', txt):
            continue
        txt = re.sub(r'^\*+\s*', '', txt)
        if paras:
            paras[-1] += ' ' + txt
        else:
            paras.append(txt)
    return ' '.join(title), paras, notes


# ------------------------------------------------------------ cleaning

def unhyph(m):
    a, b = m.group(1), m.group(2)
    if VOCAB.get((a + b).lower(), 0) >= 2:
        return a + b
    if known(a, 3) and known(b, 3) and not VOCAB.get((a + b).lower()):
        return a + '-' + b
    return a + b


def star(m):
    x, y = m.group(1), m.group(3)
    if VOCAB.get((x + y).lower(), 0) >= 3:
        return x + y
    if y[0].isupper():
        return x + '. ' + y
    if y in ('and', 'nor', 'who'):
        return x + ', ' + y
    return x + ' ' + y


def clean(p):
    p = HEAD1.sub(' ', p)
    p = re.sub(r'\s+', ' ', p).strip()
    p = re.sub(r'(?<=-) \d{1,3}[$%S]?(?= [a-z])', '', p)           # a page number stuck inside a hyphenated word
    p = re.sub(r'(?:(?<=\s)|^)1(?= [a-z])', 'I', p)                  # "1 will" is "I will"
    p = re.sub(r'\b(my|thy|him|her|our|your|them|it)\s*[-~]\s*(self|selves)\b', r'\1\2', p)
    p = re.sub(r'(?<=[a-z]) [1l7i] (?=[A-Z“‘])', '? ', p)          # a question mark scanned as a numeral
    p = re.sub(r'([A-Za-z]+)- ([a-z]+)', unhyph, p)
    p = re.sub(r'\s+([;:?!,.])', r'\1', p)
    p = re.sub(r"``|''", '"', p)
    p = HEAD2.sub(' ', p)
    p = HEAD3.sub(' ', p)
    p = re.sub(r"([A-Za-z’']+)(\*+)\s+([A-Za-z’']+)", star, p)
    p = re.sub(r'(?<=[A-Za-z])\*(?=\s|$)', '', p)
    p = re.sub(r'(?<=[,.;:?!])\*|\s\*\s|\*(?=[A-Za-z])', lambda m: ' ' if m.group(0) == ' * ' else '', p)
    p = re.sub(r'\s*/3\s*$', '', p)
    p = re.sub(r'(?<=[a-z]{3})([.,;:])(?=[a-z]{3})', r'\1 ', p)               # a space lost after a stop
    # stray quotation marks (the book has none; an apostrophe after an s, as in "saints' eternal", is kept)
    p = re.sub(r"(?<=\s)['\"“”‘’](?=[A-Za-z])", '', p)
    p = re.sub(r"(?<=[A-Za-rt-z.,;:!?])['\"“”’](?=\s|$)", '', p)
    p = re.sub(r"(?<=\s)['\"“”‘’](?=\s|$)", '', p)
    p = re.sub(r'(?<=[A-Za-z,.;:])\s?[\^\\]+\s?', lambda m: ' ' if m.group(0).startswith(' ') or m.group(0).endswith(' ') else '', p)
    p = re.sub(r'\s+', ' ', p).strip()
    return p


# word-by-word comparison with the 1819 print ---------------------------------------------------------

SKIP = {'mightst', 'labored', 'laboring', 'honored', 'endeavored', 'favorably', 'succors', 'rumors', 'neighbors',
        'savory', 'insnared', 'insnares', 'labor', 'labors', 'favor', 'honorable', 'succor', 'show', 'showed', 'shown',
        'savior', 'neighbor', 'splendor', 'odor', 'learnt'}
# the 1838 word is a real word, but wrong here (checked one by one against the sentence)
ACCEPT = {('oar', 'our'), ('add', 'and'), ('lore', 'love'), ('m', 'in'), ('aH', 'all'), ('ana', 'and'),
          ('tumble', 'humble'), ('bat', 'but'), ('top', 'up'), ('lor', 'for'), ('nay', 'may'), ('hor', 'nor'),
          ('low', 'how'), ('roe', 'me'), ('e', 'we'), ('Ward', 'Word'), ('wage', 'wages'),
          ('mail', 'man'), ('grate', 'grace'), ('ne', 'me'), ('li', 'ii'), ('o', 'to')}


def lev(a, b):
    prev = list(range(len(b) + 1))
    for i, ca in enumerate(a, 1):
        cur = [i]
        for j, cb in enumerate(b, 1):
            cur.append(min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (ca != cb)))
        prev = cur
    return prev[-1]


def case_like(a, b):
    return b.upper() if a.isupper() and len(a) > 1 else b       # the 1819 word's own capital letters


def check_with_1819(chapters, text19):
    t = text19[text19.index('BOOK  I.'):]
    t = re.sub(r'\s+', ' ', t)
    t = HEAD1.sub(' ', t)
    t = re.sub(r'([A-Za-z]+)- ([a-z]+)', unhyph, t)
    tok19 = re.findall(r'[A-Za-z]+', t)
    toks, where = [], []
    for ci, c in enumerate(chapters):
        for pi, p in enumerate(c['paras']):
            for m in re.finditer(r'[A-Za-z]+', p):
                toks.append(m.group(0))
                where.append((ci, pi, m.start()))
    sm = difflib.SequenceMatcher(None, [w.lower() for w in toks], [w.lower() for w in tok19], autojunk=False)
    reps = collections.defaultdict(list)
    n = 0
    for tag, i1, i2, j1, j2 in sm.get_opcodes():
        if tag != 'replace' or i2 - i1 != j2 - j1 or i2 - i1 > 4:
            continue
        for k in range(i2 - i1):
            a, b = toks[i1 + k], tok19[j1 + k]
            la, lb = a.lower(), b.lower()
            if la == lb or la in SKIP or lev(la, lb) > 2:
                continue
            if (not known(la) and known(lb, 5)) or (a, b) in ACCEPT:
                ci, pi, st = where[i1 + k]
                reps[(ci, pi)].append((st, len(a), case_like(a, b)))
                n += 1
    for (ci, pi), lst in reps.items():
        p = chapters[ci]['paras'][pi]
        for st, ln, new in sorted(lst, reverse=True):
            p = p[:st] + new + p[st + ln:]
        chapters[ci]['paras'][pi] = p
    return n


def apply_fixes(chapters, fixes):
    """challoner_fixes.json: 'words' (whole-word replacements everywhere) and 'replace' ([chapter 'B.C', old, new];
    old is exact text, or 're:' and a regular expression; each must match once in the chapter)."""
    for w, new in fixes['words'].items():
        pat = re.compile(r'(?<![A-Za-z])' + re.escape(w) + r'(?![A-Za-z])')
        for ch in chapters:
            ch['paras'] = [pat.sub(new, p) for p in ch['paras']]
    bad = []
    for ref, old, new in fixes['replace']:
        b, c = map(int, ref.split('.'))
        ch = next(x for x in chapters if (x['b'], x['c']) == (b, c))
        pat = re.compile(old[3:]) if old.startswith('re:') else re.compile(re.escape(old))
        hits = [(i, len(pat.findall(p))) for i, p in enumerate(ch['paras']) if pat.search(p)]
        if sum(n for i, n in hits) != 1:
            bad.append(f'fix {ref} {old!r}: matches {sum(n for i, n in hits)} times')
            continue
        i = hits[0][0]
        ch['paras'][i] = pat.sub(lambda m: new, ch['paras'][i], count=1)
    if bad:
        raise SystemExit('\n'.join(bad))


def split_marked(chapters):
    """'\\u2029' (written by a fix) splits a paragraph in two; '\\u2028' + text + '\\u2028' marks a heading inside."""
    for ch in chapters:
        out = []
        for p in ch['paras']:
            out.extend(x.strip() for x in p.split(' ') if x.strip())
        ch['paras'] = out


# ------------------------------------------------------------ the contents page, which has clean titles

def contents_titles(text):
    all_lines = text.split('\n')
    first = next(i for i, l in enumerate(all_lines) if l.strip() == 'BOOK I.')
    i = next(i for i, l in enumerate(all_lines) if i > first and l.strip() == 'CONTENTS')
    lines = [l.strip() for l in all_lines[i + 1:] if l.strip()]
    books, cur, pending = [], None, None
    for l in lines:
        if re.match(r'^BOOK\s+[IVL]+[.,]?$', l):
            cur = []
            books.append(cur)
            pending = None
            continue
        if cur is None or JUNK.search(l) or re.match(r'^(Chapter|CONTENTS|Page|\d+$|OF TRE)', l):
            continue
        m = re.match(r'^([IVXLUH][IVXLUmnHlLiF ]{0,8})[.,;:]?\s+((?:Of|That|How|In|Against|With|Whether|The|A)\b.*)$', l)
        if m:
            pending = [m.group(2)]
            cur.append(pending)
        elif re.match(r'^A pra', l):
            pending = None
        elif pending is not None:
            pending.append(l)
    return books


def tidy_title(parts):
    s = ' '.join(parts)
    s = re.sub(r'(?<=\w)- (?=[a-z])', '', s)
    s = re.sub(r'[\s.,•*:;!?\-—_~^]*\d*\s*$', '', s)     # leader dots and page number
    s = re.sub(r'\s+\d+\s*$', '', s)
    s = re.sub(r'\s+', ' ', s).strip(' .,')
    return s


# ------------------------------------------------------------ the book

SUBTITLES = ['Admonitions useful for the spiritual life.', 'Admonitions that draw the soul to inward things.',
             'Of inward consolation.', 'Of the Sacrament.']
VOICE = re.compile(r'^The Voice of the (Disciple|Beloved)\s*[.,\'’]*$|^THE VOICE OF CHRIST\.?$', re.I)


def heading_case(s):
    s = s.strip(' .')
    return (s[:1] + s[1:].lower()).replace(' god', ' God')


def blocks_for(paras, notes_html=None, lead=None):
    out = []
    for p in paras:
        if '⁣' in p:                      # a heading inside the paragraph: before, heading, after
            a, h, z = p.split('⁣')
            if a.strip():
                out.extend(blocks_for([a.strip()]))
            out.append({'t': 'h', 'h': html(heading_case(h))})
            if z.strip():
                out.extend(blocks_for([z.strip()]))
            continue
        m = VOICE.match(p.strip())
        if m:
            name = {'disciple': 'The Voice of the Disciple', 'beloved': 'The Voice of the Beloved'}.get(
                (m.group(1) or 'christ').lower(), 'The Voice of Christ')
            out.append({'t': 'p', 'h': f'<span class="sc">{name}</span>'})
            continue
        out.append({'t': 'p', 'h': html(p)})
    return out


def main(folder, report=False):
    load_vocab(folder)
    fixes = json.load(open(os.path.join(HERE, 'challoner_fixes.json'), encoding='utf-8'))
    text = open(os.path.join(folder, 'imitation-TheFollowingOfChrist1838.txt'), encoding='utf-8').read()
    text19 = open(os.path.join(folder, 'imitation-followingofchris00thom.txt'), encoding='utf-8').read()
    books, lead = extract(text)
    chapters = []
    for b, chs in enumerate(books, 1):
        for c, (head, lines) in enumerate(chs, 1):
            title, paras, notes = paragraphs(lines)
            chapters.append({'b': b, 'c': c, 'title_raw': title, 'paras': [clean(p) for p in paras],
                             'notes': [clean(n) for n in notes]})
    n = check_with_1819(chapters, text19)
    apply_fixes(chapters, fixes)
    split_marked(chapters)
    if '--dump' in sys.argv:
        with open(sys.argv[sys.argv.index('--dump') + 1], 'w', encoding='utf-8') as f:
            for ch in chapters:
                for i, p in enumerate(ch['paras']):
                    f.write(f"[{ch['b']}.{ch['c']}.{i + 1}] {p}\n")
    toc = contents_titles(text)
    assert [len(x) for x in toc] == [25, 12, 59, 18], [len(x) for x in toc]
    sections = [{'title': f'The {w} Book', 'short': 'Book ' + r, 'intro': SUBTITLES[k], 'chapters': []}
                for k, (w, r) in enumerate([('First', 'I'), ('Second', 'II'), ('Third', 'III'), ('Fourth', 'IV')])]
    # Book IV opens with an invitation of Christ before Chapter I
    lead4 = [clean(' '.join(c)) for c in chunk_lines(lead[4])]
    voice = [p for p in lead4 if not re.match(r'^(OF THE SACRAMENT|THE VOICE OF CHRIST)', p)]
    sections[3]['chapters'].append({
        'path': 'book-4/invitation', 'title': 'The invitation of Christ', 'nav': 'Book IV: The invitation of Christ',
        'blocks': [{'t': 'p', 'h': '<span class="sc">The Voice of Christ</span>'}] + blocks_for(voice)})
    for ch in chapters:
        b, c = ch['b'], ch['c']
        title = fixes['titles'].get(f'{b}.{c}') or tidy_title(toc[b - 1][c - 1])
        title = html(title)
        ch['title'] = title
        rn = ROMANS[c]
        bl = blocks_for(ch['paras'])
        if ch['notes']:
            note = fixes['notes'].get(f'{b}.{c}')
            bl.append({'t': 'n', 'h': note})
        sections[b - 1]['chapters'].append({
            'path': f'book-{b}/chapter-{c}', 'label': f'Chapter {rn}', 'title': title, 'num': str(c),
            'nav': f'Book {sections[b - 1]["short"][5:]}, Chapter {rn}: {title}', 'blocks': bl})
    if report:
        problems(chapters)
    write({
        'slug': 'the-imitation-of-christ', 'order': 2, 'kind': 'prose',
        'title': 'The Imitation of Christ', 'short': 'The Imitation of Christ', 'author': 'Thomas à Kempis',
        'about': 'The best-loved book of devotion after the Bible, written in the early fifteenth century for those '
                 'who want to follow Christ closely. Four short books: counsels for the spiritual life, the inner life, '
                 'inward consolation, and the Blessed Sacrament. Here in Bishop Challoner’s translation.',
        'edition': '<i>The Following of Christ</i> (<i>The Imitation of Christ</i>), by Thomas à Kempis, translated from the '
                   'Latin by Bishop Richard Challoner, Vicar Apostolic of the London District (first published in 1737). '
                   'This text is from the Philadelphia printing of Eugene Cummiskey, 1838, with the scanning errors '
                   'corrected and compared against the London printing of Keating, Brown and Co., 1819. Challoner’s own scripture references are kept '
                   'where they stand in the text; the notes on the life of Thomas à Kempis that open the 1838 book are not '
                   'included. Public domain.',
        'sections': sections,
    })


ROMANS = [''] + [x for x in
                 'I II III IV V VI VII VIII IX X XI XII XIII XIV XV XVI XVII XVIII XIX XX XXI XXII XXIII XXIV XXV XXVI XXVII XXVIII '
                 'XXIX XXX XXXI XXXII XXXIII XXXIV XXXV XXXVI XXXVII XXXVIII XXXIX XL XLI XLII XLIII XLIV XLV XLVI XLVII XLVIII '
                 'XLIX L LI LII LIII LIV LV LVI LVII LVIII LIX'.split()]


def problems(chapters):
    unk = collections.Counter()
    for ch in chapters:
        for pi, p in enumerate(ch['paras']):
            for m in re.finditer(r"[*^®°»~•<>{}|\\_=@#&£]|\s-\s|--|\.\.|FOLLOW|CHAP", p):
                print(f"junk [{ch['b']}.{ch['c']}.{pi + 1}] …{p[max(0, m.start() - 30):m.end() + 25]}…")
            for m in WORD.finditer(p):
                if not known(m.group(0)):
                    unk[m.group(0)] += 1
    print('unknown words:', sorted(unk.items()))


if __name__ == '__main__':
    args = [a for a in sys.argv[1:] if not a.startswith('--')][:1]
    main(args[0], report='--report' in sys.argv)
