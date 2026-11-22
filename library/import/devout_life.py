#!/usr/bin/env python3
"""Turns three library scans of the same printing of "Introduction to a Devout Life" (Frederick Pustet & Co.)
into library/books/introduction-to-the-devout-life.json.

The scans' machine-read text (OCR) has mistakes, but each scan has different ones. This script lines the three
up word by word and keeps the reading two of them agree on, then applies the hand corrections in
devout_life_fixes.json. Run it only when the source text needs to be rebuilt:

    python3 library/import/devout_life.py <folder with the three *_djvu.html files>

The files come from archive.org/stream/<id>/<id>_djvu.txt for the ids in SCANS below.
"""
import difflib, html, json, os, re, sys
from collections import Counter

SCANS = ['introductiontodefran', 'introductiontode00franuoft', 'introductiontode0000fran_h2t6']
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', 'books', 'introduction-to-the-devout-life.json')
ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX',
         'XXI', 'XXII', 'XXIII', 'XXIV', 'XXV', 'XXVI', 'XXVII', 'XXVIII', 'XXIX', 'XXX', 'XXXI', 'XXXII', 'XXXIII', 'XXXIV', 'XXXV', 'XXXVI',
         'XXXVII', 'XXXVIII', 'XXXIX', 'XL', 'XLI']
PARTS = [('First', 24), ('Second', 21), ('Third', 41), ('Fourth', 15), ('Fifth', 18)]


def load(folder, name):
    raw = open(os.path.join(folder, name + '_djvu.html'), encoding='utf-8', errors='replace').read()
    text = html.unescape(re.search(r'<pre>(.*?)</pre>', raw, re.S).group(1))
    return [re.sub(r'\s+', ' ', l).strip() for l in text.split('\n')]


def caps(line):
    letters = [c for c in line if c.isalpha()]
    return len(letters) >= 4 and sum(c.isupper() for c in letters) / len(letters) >= 0.8


def key(s):
    return re.sub(r'[^a-z]', '', s.lower())


def similar(a, b):
    return difflib.SequenceMatcher(None, key(a), key(b)).ratio()


CHAPTER = re.compile(r'^CHAPTER\s+\S{1,9}$')
SUBHEADS = ['PREPARATION', 'CONSIDERATIONS', 'AFFECTIONS AND RESOLUTIONS', 'CONCLUSION', 'ELECTION', 'CONSIDERATION', 'AFFECTIONS', 'RESOLUTIONS']


def is_subhead(line):
    k = re.sub(r'[^A-Z ]', '', line).strip()
    return any(similar(k, s) > 0.86 for s in SUBHEADS) and len(k) < 34


def junk_line(line):
    """A line with no real words: a page number, a stray mark."""
    if re.fullmatch(r'([A-Za-z]{1,2} ){0,2}[a-z]{2}[.?!]', line):
        return False            # "me." or "to us." ending a paragraph on a line of its own
    return not re.search(r'[A-Za-z]{3}', line) and len(line) <= 8


class Q(str):
    """A quotation mark standing alone. It compares as a plain " but remembers what the scans suggest about which
    way it faces: 'o' opening or 'c' closing, each with a weight."""
    def __new__(cls, hint=None, weight=1):
        q = super().__new__(cls, '"')
        q.hints = [(hint, weight)] if hint else []
        return q


MARKS = '\ue000\ue001\ue002\ue003\ue004'      # curly open, curly close, looks open, looks closed, cannot tell


def tokens(text):
    """Words as they will be compared between scans: straight quotes, a quotation mark standing alone is its own token,
    and no space before ; : ? ! (the printer set a thin space there, which the scans read as a full one)."""
    def mark(m):
        s, i = m.string, m.start()
        if m.group(0) in '“”':
            return MARKS[0] if m.group(0) == '“' else MARKS[1]
        before = s[i - 1] if i else ' '
        after = s[i + 1] if i + 1 < len(s) else ' '
        if not before.isspace() and not after.isalpha():
            return MARKS[3]
        if before.isspace() and after.isalpha():
            return MARKS[2]
        return MARKS[2] if s[:i].rstrip()[-1:] in (',', ':') else MARKS[4]
    text = re.sub("''|’’|‘‘", '"', text)        # two single marks where the printer set a double one
    text = re.sub('["“”]', mark, text)
    text = text.replace('‘', "'").replace('’', "'").replace('—', ' — ').replace('--', ' — ')
    text = re.sub(r'\s+([;:?!])', r'\1', text)
    text = re.sub('([;:?!,.])([%s])' % MARKS, r'\1 \2', text)
    text = re.sub('([%s])([A-Za-z])' % MARKS, r'\1 \2', text)
    out = []
    for w in text.split():
        if len(w) == 1 and w in MARKS:
            k = MARKS.index(w)
            w = Q('o' if k in (0, 2) else 'c' if k in (1, 3) else None, 2 if k < 2 else 1)
        else:
            w = re.sub('[%s]' % MARKS, '"', w)
        out.append(w)
    return out


def dehyphenate(lines, vocab=None):
    """Join a word the printer broke at the end of a line."""
    out = []
    for line in lines:
        if out and re.search(r'[A-Za-z]-$', out[-1]) and re.match(r'[a-z]', line):
            head, tail = out[-1].rsplit(' ', 1) if ' ' in out[-1] else ('', out[-1])
            first, _, rest = line.partition(' ')
            whole, hyph = tail[:-1] + first, tail + first
            w, h = key_word(whole), key_word(hyph)
            word = hyph if vocab and vocab.get(h, 0) > vocab.get(w, 0) else whole
            out[-1] = (head + ' ' if head else '') + word
            if rest:
                out.append(rest)
        else:
            out.append(line)
    return out


def key_word(w):
    return re.sub(r"^[^A-Za-z]+|[^A-Za-z]+$", '', w).lower()


def body_lines(L):
    """The scan's lines from the Abstract of the Life to the end of the Conference, without the library's own stamps."""
    start = next(i for i, l in enumerate(L) if similar(l, 'ABSTRACT OF THE LIFE') > 0.85 and caps(l) and i > 300)
    end = max(i for i, l in enumerate(L) if 'everlasting rest' in l) + 1
    return L[start:end]


def midline_vocab(all_lines):
    c = Counter()
    for L in all_lines:
        for l in L:
            for w in l.split()[:-1]:
                c[key_word(w)] += 1
    return c


def parse_base(L, vocab):
    """The base scan as a list of chapters, each a list of blocks ['title' | 'h' | 'p', [lines]]."""
    chapters, cur, para, blanks, heading, prev_text = [], None, None, 0, False, None
    width = 44   # a line shorter than this ends its paragraph

    def new_chapter(label):
        nonlocal cur, para, heading
        cur = {'label': label, 'blocks': []}
        chapters.append(cur)
        para, heading = None, True

    new_chapter('ABSTRACT')
    cur['blocks'].append(['title', [L[0]]])
    for line in L[1:]:
        if not line:
            blanks += 1
            continue
        gap, blanks = blanks, 0
        if junk_line(line):
            blanks = gap
            continue
        if re.match(r'^CHAPT ?ER\s+\S{1,9}$', line):
            new_chapter(line)
            continue
        if caps(line) and similar(line, 'A DEDICATORY PRAYER OF THE AUTHOR') > 0.9 and gap >= 2 and len(cur['blocks']) > 3:
            new_chapter('PRAYER'); cur['blocks'].append(['title', [line]]); continue
        if caps(line) and similar(line, "THE AUTHOR'S PREFACE") > 0.9 and gap >= 2:
            new_chapter('PREFACE'); cur['blocks'].append(['title', [line]]); continue
        if caps(line) and key(line) == 'aconference' and gap >= 2 and len(chapters) > 100 and chapters[-1]['label'] != 'CONFERENCE':
            new_chapter('CONFERENCE'); cur['blocks'].append(['title', [line]]); continue
        if caps(line):
            if heading:
                last = cur['blocks'][-1] if cur['blocks'] else None
                dangling = last and last[0] == 'title' and re.search(r"(\b(THE|OF|TO|AND|IN|ON|WHICH|A|FOR|BY|OUR|WE)|-)$", last[1][-1])
                if is_subhead(line) and not dangling:
                    cur['blocks'].append(['h', [line]])
                elif cur['blocks'] and cur['blocks'][-1][0] == 'title' and not any(b[0] == 'h' for b in cur['blocks']):
                    cur['blocks'][-1][1].append(line)
                else:
                    cur['blocks'].append(['title' if not cur['blocks'] else 'h', [line]])
                continue
            if gap >= 2 and not is_subhead(line):
                blanks = gap        # a running head at the top of a page
                continue
            if is_subhead(line) or gap >= 1:
                cur['blocks'].append(['h', [line]])
                para = None
                continue
        heading = False
        if para is not None and gap == 0:
            para.append(line)
        elif para is not None and gap >= 2 and not (len(prev_text) < width and re.search(r'[.?!"\']$', prev_text)) and cur['blocks'][-1][0] == 'p':
            para.append(line)       # the paragraph runs on over the page
        else:
            para = [line]
            cur['blocks'].append(['p', para])
        prev_text = line
    for ch in chapters:
        kinds = [b[0] for b in ch['blocks']]
        k = kinds.index('p') if 'p' in kinds else None
        if k is not None and len(ch['blocks'][k][1]) == 1 and k + 1 < len(kinds) and kinds[k + 1] == 'p' and ch['label'].startswith('CHAPT'):
            ch['blocks'][k][1] += ch['blocks'][k + 1][1]      # a stray mark beside the initial had split the first paragraph
            del ch['blocks'][k + 1]
        first = next((b for b in ch['blocks'] if b[0] == 'p'), None)
        if first and len(first[1]) > 1:
            # the ornamental initial is two lines tall, and the scans read a stray mark beside it on the second line
            head, _, rest = first[1][1].partition(' ')
            plain_word = re.fullmatch(r"[a-z]+[,.;:]?|[A-Z][a-z]{2,}[,.;:]?|I|God[,.;:]?", head) and (vocab.get(key_word(head), 0) >= 6 or key_word(head) in ENGLISH)
            if not plain_word and rest:
                first[1][1] = rest
        for b in ch['blocks']:
            b[1] = dehyphenate(b[1], vocab)
    return chapters


def flat_words(L, vocab):
    """Another scan as one long list of words, with its running heads left out as far as they can be told."""
    lines, blanks = [], 0
    for line in L:
        if not line:
            blanks += 1
            continue
        gap, blanks = blanks, 0
        if junk_line(line):
            blanks = gap; continue
        if caps(line) and (gap >= 2 or 'DEVOUT' in line) and not is_subhead(line) and not line.startswith('CHAPT'):
            blanks = gap; continue
        lines.append(line)
    return tokens(' '.join(dehyphenate(lines, vocab)))


def changes(base, other):
    """Where another scan reads differently from the base: a list of (start, end, replacement words)."""
    out = []
    sm = difflib.SequenceMatcher(None, base, other, autojunk=False)
    last = 0
    for tag, i1, i2, j1, j2 in sm.get_opcodes():
        if tag == 'equal':
            last = j2
            for k in range(i2 - i1):
                if isinstance(base[i1 + k], Q) and isinstance(other[j1 + k], Q):
                    base[i1 + k].hints += other[j1 + k].hints     # which way the other scan's mark faces
            continue
        if tag == 'replace' and i2 - i1 == j2 - j1:
            for k in range(i2 - i1):
                out.append((i1 + k, i1 + k + 1, (other[j1 + k],)))
        else:
            out.append((i1, i2, tuple(other[j1:j2])))
    solid = [b for b in sm.get_matching_blocks() if b.size >= 4] or [b for b in sm.get_matching_blocks() if b.size]
    end = solid[-1].b + solid[-1].size if solid else 0
    return out, end


ENGLISH = set()      # an optional list of English words (second argument), used only to settle three-way disagreements
SUFFIXES = ("'s", 's', 'es', 'ed', 'd', 'ing', 'ly', 'est', 'er', 'eth', 'th', 'st', 'ness')


def is_word(w, vocab):
    """Is this a real word: common in the scans themselves, or in the word list, allowing for the usual endings."""
    w = key_word(w)
    if not w:
        return False
    if vocab.get(w, 0) >= 6 or w in ENGLISH:
        return True
    for suf in SUFFIXES:
        if w.endswith(suf) and len(w) > len(suf) + 2:
            stem = w[:-len(suf)]
            if stem in ENGLISH or stem + 'e' in ENGLISH or (suf in ('es', 'ed', 'est', 'er', 'eth') and stem.endswith('i') and stem[:-1] + 'y' in ENGLISH):
                return True
    return False


def vote(chapters, others, vocab, log):
    """Correct each chapter's words where the two other scans agree against the base."""
    cursors = [0] * len(others)
    for ch in chapters:
        words, owner = [], []
        for bi, b in enumerate(ch['blocks']):
            w = tokens(' '.join(b[1]))
            words += w
            owner += [bi] * len(w)
        n = len(words)
        proposals = []
        for oi, other in enumerate(others):
            lo = max(0, cursors[oi] - 60)
            window = other[lo: lo + int(n * 1.3) + 500]
            ch_changes, end = changes(words, window)
            cursors[oi] = lo + end
            # throw away what is clearly the gap before or after the chapter in the other scan
            ch_changes = [c for c in ch_changes if not (c[0] == c[1] and (c[0] == 0 or c[0] == n))]
            trimmed = []
            for i1, i2, rep in ch_changes:
                if len(rep) > 3 * (i2 - i1) + 3:
                    if i2 == n and i2 > i1:
                        rep = rep[:i2 - i1]
                    elif i1 == 0 and i2 > i1:
                        rep = rep[-(i2 - i1):]
                    else:
                        continue
                trimmed.append((i1, i2, rep))
            ch_changes = trimmed
            proposals.append({(c[0], c[1]): c[2] for c in ch_changes})
        accepted = []
        spans = set(proposals[0]) | set(proposals[1])
        for span in sorted(spans):
            a, b = proposals[0].get(span), proposals[1].get(span)
            i1, i2 = span
            old = words[i1:i2]
            if a is not None and a == b:
                if i1 == i2 and all(caps(x) or not re.search('[a-z]{2}', x) for x in a):
                    continue                       # both scans kept the same running head, or the same stray mark
                accepted.append((i1, i2, list(a)))
            elif (a is None) != (b is None):
                # only one scan differs from the base. Believe it when the base's reading is not a word and its reading is.
                c = list(a if a is not None else b)

                def wordy(ws):
                    return len(ws) > 0 and all(re.fullmatch(r"[\"'(]*[A-Za-z]+(-[A-Za-z]+)*('s)?[.,;:?!\"')]*", x) is not None and is_word(x, vocab)
                                               or re.fullmatch(r'[\"\u2014.,;:?!()0-9]+', x) is not None for x in ws)
                if old and not wordy(old) and wordy(c) and len(c) <= len(old) + 1:
                    accepted.append((i1, i2, c))
            elif a is not None and b is not None:
                # all three differ: keep the reading whose words are all known, and note it for a person to check
                def known(ws):
                    return len(ws) > 0 and all(re.fullmatch(r"[\"'(]*[A-Za-z]+(-[A-Za-z]+)*('s)?[.,;:?!\"')]*", x) is not None and is_word(x, vocab)
                                               or re.fullmatch(r'[\"\u2014.,;:?!()0-9]+', x) is not None for x in ws)
                cands = [list(b), list(a), old]      # the third scan is the most accurate, so it is asked first
                good = [c for c in cands if known(c)]
                # when more than one reading is a real word, the commoner word is the likelier (a misreading that happens to be a word is usually a rare one)
                pick = max(good, key=lambda c: min([vocab.get(key_word(x), 0) for x in c if key_word(x)] or [0])) if good else old
                if not good and not any(re.search('[A-Za-z]{3}', ' '.join(c)) for c in cands):
                    pick = []                        # an ornament or a mark on the page, not a word
                log.append((ch['label'], ' '.join(words[max(0, i1 - 4):i1]), ' '.join(old), ' '.join(a), ' '.join(b), ' '.join(pick)))
                if pick != old:
                    accepted.append((i1, i2, pick))
        new_blocks = [[] for _ in ch['blocks']]
        pos = 0
        accepted.sort()
        merged = []
        for i1, i2, rep in accepted:
            if i1 < pos:
                continue
            merged.append((i1, i2, rep)); pos = max(pos, i2)
        pos = 0
        for i1, i2, rep in merged + [(n, n, [])]:
            for k in range(pos, i1):
                new_blocks[owner[k]].append(words[k])
            if rep or i2 > i1:
                home = owner[i1] if i1 < n and i2 > i1 else owner[min(max(i1 - 1, 0), n - 1)] if n else 0
                new_blocks[home] += rep
            pos = i2
        for b, w in zip(ch['blocks'], new_blocks):
            k = 0
            while k < len(w) - 1:
                a, c = w[k], w[k + 1]
                if re.fullmatch(r"[A-Za-z]+-?", a) and re.fullmatch(r"[a-z]+[.,;:?!]*", c) and not (is_word(a, vocab) and is_word(c, vocab)) \
                        and is_word(a.rstrip('-') + c, vocab) and len(a) > 1:
                    w[k:k + 2] = [a.rstrip('-') + c]     # a word the scan split in two
                else:
                    k += 1
            b[1] = w
    return chapters


SMALL = {'a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'from', 'in', 'into', 'is', 'of', 'on', 'or', 'our', 'the', 'to', 'with', 'which', 'that', 'we', 'us'}
PROPER = {'god': 'God', "god's": "God's", 'jesus': 'Jesus', 'christ': 'Christ', 'christian': 'Christian', 'st.': 'St.', 'francis': 'Francis', 'sales': 'Sales',
          'i': 'I', 'roman': 'Roman', 'breviary': 'Breviary', 'paris': 'Paris'}


def sentence_case(text):
    words = text.lower().split()
    out = []
    for i, w in enumerate(words):
        core = w.strip('.,;:—')
        if core in PROPER:
            w = w.replace(core, PROPER[core])
        elif i == 0 or out[-1].endswith(('.', '—')) and not out[-1].endswith('St.'):
            w = w[:1].upper() + w[1:]
        out.append(w)
    return ' '.join(out)


def join(words):
    """Words back into running text, with the printer's spacing put right and curly quotation marks."""
    out, opened = [], False
    for w in words:
        if w == '"':
            lean = sum(wt if h == 'o' else -wt for h, wt in getattr(w, 'hints', []))
            if lean:
                opened = lean < 0        # the scans say which way this mark faces; otherwise marks simply alternate
            if opened:
                out.append('”'); opened = False; glue = True
                if len(out) > 1:
                    out[-2:] = [out[-2] + out[-1]]
            else:
                out.append('“\u0000'); opened = True     # \u0000: glue the next word on
            continue
        while '"' in w:
            w = w.replace('"', '”' if opened else '“', 1)
            opened = not opened
        if out and out[-1].endswith('\u0000'):
            out[-1] = out[-1][:-1] + w
        else:
            out.append(w)
    text = ' '.join(out).replace('\u0000', '')
    text = re.sub(r'\s*—\s*', '—', text)
    text = re.sub(r"(?<=[A-Za-z])'(?=[A-Za-z])", '’', text)       # don't, neighbor's
    text = re.sub(r"(?<![A-Za-z])'(?=[A-Za-z])", '‘', text)       # an opening single quotation mark
    text = text.replace("'", '’')
    text = re.sub(r'\s+([,.;:?!”])', r'\1', text)
    text = re.sub(r'([(“‘])\s+', r'\1', text)
    return re.sub(r'\s+', ' ', text).strip()


def finish(chapters, fixes, report):
    """Titles, sub-headings and paragraphs as clean text; then the hand corrections."""
    done = []
    for ci, ch in enumerate(chapters):
        title, blocks, opening = '', [], fixes['first'].get(str(ci))
        for kind, words in ch['blocks']:
            words = [w for w in words if w]
            if kind == 'p' and opening:
                # the ornamental first letter, which no scan reads: put the opening words right by hand
                words = tokens(opening[1]) + words[opening[0]:]
                for wrong, right in opening[2:]:
                    wrong, right = tokens(wrong), tokens(right)
                    at = next((k for k in range(len(words)) if words[k:k + len(wrong)] == wrong), None)
                    if at is None:
                        report.append(('opening fix not found', ci, ' '.join(wrong)))
                    else:
                        words[at:at + len(wrong)] = right
                opening = None
            if not words:
                continue
            if kind == 'title':
                title = (title + ' ' + ' '.join(words)).strip()
            elif kind == 'h':
                text = sentence_case(join(words)).rstrip('.')
                if blocks or title:
                    blocks.append({'t': 'h', 'h': text})
            else:
                text = join(words)
                real = re.findall(r'[A-Za-z]{2,}', text)
                if len(real) < 3 and not re.fullmatch(r'[A-Z][a-z]+( [A-Za-z]+)*[.!]', text):
                    report.append(('dropped', ci, text))
                    continue
                blocks.append({'t': 'p', 'h': text})
        while blocks and blocks[-1]['t'] == 'h':
            report.append(('dropped', ci, blocks.pop()['h']))
        if blocks:
            blocks[-1]['h'] = re.sub(r'\s*CHAPTER$', '', blocks[-1]['h'])       # the next chapter's heading, read too soon
        k = 1
        while k < len(blocks):
            a, b = blocks[k - 1], blocks[k]
            if a['t'] == b['t'] == 'p' and not re.search(r'[.!?”’)]$|:—?$', a['h']) and re.match(r'[a-z]|1 [a-z]', b['h']):
                # a paragraph the page break cut in two
                a['h'] += ' ' + re.sub(r'^1 ', 'I ', b['h'])
                del blocks[k]
            else:
                k += 1
        if str(ci) not in fixes['first']:
            first = next((w for k, w in ch['blocks'] if k == 'p'), [])
            report.append(('first word', ci, ' '.join(first[:26])))
        # the ten meditations: their sub-headings and numbered points, where the scans lost a number or a heading
        for k, b in enumerate(blocks):
            if b['t'] == 'h' and re.search(r'\.? 1$', b['h']):
                b['h'] = re.sub(r'\.? 1$', '', b['h'])
                if k + 1 < len(blocks) and not blocks[k + 1]['h'][:1].isdigit():
                    blocks[k + 1]['h'] = '1. ' + blocks[k + 1]['h']
            if b['t'] == 'p':
                if re.search(r'[.!?] 2\. [A-Z]', b['h']) and not b['h'][:1].isdigit():
                    b['h'] = '1. ' + b['h']
                b['h'] = re.sub(r'\b0 (?=[A-Za-z])', 'O ', b['h'])      # "0 my soul": the scans read the letter as a figure
                b['h'] = re.sub(r'(?<=[a-z,;] )1 (?=[a-z])', 'I ', b['h'])           # and "1 say" for "I say"
        if any(b['t'] == 'h' and b['h'] == 'Considerations' for b in blocks) and blocks[0]['t'] == 'p':
            blocks.insert(0, {'t': 'h', 'h': 'Preparation'})
        title = fixes['titles'].get(str(ci)) or sentence_case(re.sub(r'\s*—\s*', '—', title)).rstrip('.,-')
        for wrong, right in fixes['words'].get(str(ci), []):
            hits = sum(b['h'].count(wrong) for b in blocks)
            if hits != 1:
                report.append(('fix did not apply once', ci, wrong, hits))
            for b in blocks:
                b['h'] = b['h'].replace(wrong, right)
        for split_at in fixes.get('split', {}).get(str(ci), []):
            for k, b in enumerate(blocks):
                if split_at in b['h'] and b['t'] == 'p':
                    i = b['h'].index(split_at)
                    blocks[k:k + 1] = [{'t': 'p', 'h': b['h'][:i].strip()}, {'t': 'p', 'h': b['h'][i:].strip()}]
                    break
            else:
                report.append(('split not found', ci, split_at))
        for join_at in fixes.get('join', {}).get(str(ci), []):
            for k, b in enumerate(blocks):
                if b['h'].startswith(join_at) and k and blocks[k - 1]['t'] == 'p':
                    blocks[k - 1]['h'] += ' ' + b['h']; del blocks[k]
                    break
            else:
                report.append(('join not found', ci, join_at))
        for pieces in fixes.get('notes', {}).get(str(ci), []):
            # a footnote: one or more [start, end] stretches of the paragraph the scans ran it into
            for k, b in enumerate(blocks):
                if pieces[0] in b['h']:
                    note = []
                    for start, end in zip(pieces[::2], pieces[1::2]):
                        i = b['h'].index(start)
                        j = b['h'].index(end, i) + len(end)
                        note.append(b['h'][i:j].strip())
                        b['h'] = re.sub(r'\s+', ' ', b['h'][:i] + ' ' + b['h'][j:]).strip()
                    blocks.insert(k + 1, {'t': 'n', 'h': re.sub(r'^1\s*', '', ' '.join(note))})
                    break
            else:
                report.append(('note not found', ci, pieces[0]))
        if str(ci) in fixes.get('lead', {}):
            blocks.insert(0, {'t': 'n', 'h': fixes['lead'][str(ci)]})
        done.append({'title': title, 'blocks': blocks})
    return done


PART_INTRO = [
    'Containing instructions and exercises for conducting the soul from her first desire till she be brought to a full resolution to embrace a devout life.',
    'Containing instructions for elevating the soul to God by prayer and the sacraments.',
    'Containing instructions on the practice of the virtues.',
    'Containing necessary instructions against the most common temptations.',
    'Containing exercises and instructions for renewing the soul and confirming her in devotion.',
]


def book(done):
    it = iter(done)
    front = [next(it) for _ in range(3)]
    sections = [{'title': 'Before the book', 'chapters': [
        {'path': p, 'title': c['title'], 'blocks': c['blocks']} for p, c in zip(['life-of-the-author', 'dedicatory-prayer', 'authors-preface'], front)]}]
    for pi, (name, count) in enumerate(PARTS):
        chapters = []
        for n in range(1, count + 1):
            c = next(it)
            chapters.append({'path': f'part-{pi + 1}/chapter-{n}', 'label': f'Chapter {ROMAN[n]}', 'title': c['title'],
                             'nav': f'Part {ROMAN[pi + 1]}, Chapter {ROMAN[n]}: {c["title"]}', 'blocks': c['blocks']})
        sections.append({'title': f'Part {name}', 'short': f'Part {name}', 'intro': PART_INTRO[pi], 'chapters': chapters})
    c = next(it)
    sections.append({'title': 'Added at the end', 'chapters': [{'path': 'a-conference', 'title': c['title'], 'blocks': c['blocks']}]})
    return {
        'slug': 'introduction-to-the-devout-life', 'order': 1, 'kind': 'prose',
        'title': 'Introduction to the Devout Life', 'short': 'Introduction to the Devout Life', 'author': 'St. Francis de Sales',
        'about': 'Written in 1609 for people living in the world, in families, at work and at court, to show that holiness is for every state of life. Five parts: resolving on a devout life, prayer and the sacraments, the virtues, temptations, and renewing the soul.',
        'edition': '<i>Introduction to a Devout Life</i>, from the French of St. Francis de Sales, Bishop and Prince of Geneva, to which is prefixed an abstract of his life. Frederick Pustet & Co., Ratisbon, Rome, New York and Cincinnati, undated (about 1900). The translator is not named. Public domain.',
        'sections': sections,
    }


def main():
    folder = sys.argv[1]
    if len(sys.argv) > 2:
        ENGLISH.update(json.load(open(sys.argv[2])))
    else:
        # the word list this text was prepared with: pip install english-words (its "web2" and "gcide" lists)
        from english_words import get_english_words_set
        ENGLISH.update(get_english_words_set(['web2', 'gcide'], lower=True))
    scans = [body_lines(load(folder, n)) for n in SCANS]
    vocab = midline_vocab(scans)
    chapters = parse_base(scans[0], vocab)
    assert len(chapters) == 3 + sum(n for _, n in PARTS) + 1, len(chapters)
    log, report = [], []
    vote(chapters, [flat_words(L, vocab) for L in scans[1:]], vocab, log)
    fixes = json.load(open(os.path.join(HERE, 'devout_life_fixes.json'), encoding='utf-8'))
    data = book(finish(chapters, fixes, report))
    with open(OUT, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=0)
        f.write('\n')
    words = sum(len(b['h'].split()) for s in data['sections'] for c in s['chapters'] for b in c['blocks'])
    print(f'{len(chapters)} chapters, {words} words, {len(log)} places where all three scans differ, {len(report)} notes')
    json.dump({'conflicts': log, 'report': report}, open(os.path.join(folder, 'devout-life-import-log.json'), 'w'), ensure_ascii=False, indent=0)


if __name__ == '__main__':
    main()
