# Film 02's captions as one ASS file, for one transparent layer above the picture in Resolve (Carl, 1 November 2026, session 2:
# "for film 2 lets implement the new caption way"). Wording from film2.srt; positions as Carl placed them, read from
# film2-review.mp4 by differencing against the clean clips (film2-placed-from-review.json, beside the .srt).
# Carl's figures: 30 frames clear at the start and end of a clip, fade in 30 frames, fade out 15.
# Builder's defaults, standing until Carl changes them: 15 frames between lines on one clip; 15 frames clear on clips of 5 s
# or less; no line under 2 s. Carl's rules: Y 100 on bottom-cropped clips (as read), Y 120 on the 14 chat clips.
# Line breaks are balanced within each caption's own line count, so a caption never gets wider than where he placed it.
#   python film02-captions-ass-build.py [--size N] [--dy N]
import json, os, re, sys
from PIL import ImageFont

FILM = os.path.expanduser('~/Videos/C2B Films/02 Ornate corners')
SUB = os.path.join(FILM, '07 Subtitles')
FPS = 30
CLEAR, CLEAR_SHORT, SHORT_CLIP, GAP, MIN_LINE = 30, 15, 150, 15, 60
FADE_IN, FADE_OUT = 30, 15
CHAT = set('01A 01B 01D 03A 03D 03E 03J 03L 03S 04D 04J 05A 05B 05C'.split())
YELLOW = {23}  # 03H, over the pale photo (Carl's fix, after the review render)
NL = chr(92) + 'N'


def arg(name, default):
    return float(sys.argv[sys.argv.index(name) + 1]) if name in sys.argv else default


SIZE, DY = arg('--size', 80.6), arg('--dy', -5)  # calibrated against Carl's captions in film2-review.mp4
FONT = ImageFont.truetype(os.path.join(SUB, 'fonts', 'OpenSans-Bold.ttf'), 58)


def srt():
    out = []
    for b in open(os.path.join(SUB, 'film2.srt'), encoding='utf8').read().strip().split('\n\n'):
        l = b.split('\n')
        out.append((int(l[0]), l[2:]))
    return out


def clips():
    L = open(os.path.join(FILM, 'cut10.edl'), encoding='utf8', errors='replace').read().splitlines()

    def f(tc):
        h, m, s, fr = map(int, tc.split(':'))
        return (h - 1) * 3600 * FPS + m * 60 * FPS + s * FPS + fr

    out = {}
    for i, x in enumerate(L):
        m = re.match(r'\d{3}\s+\S+\s+V\s+C\s+\S+\s+\S+\s+(\S+)\s+(\S+)', x)
        if m:
            out[next(y.split(': ')[1] for y in L[i + 1:i + 3] if 'FROM CLIP' in y)[:3]] = (f(m[1]), f(m[2]))
    return out


def balance(words, n):
    """Break into n lines with the widest as narrow as possible."""
    best = None

    def go(start, left, acc):
        nonlocal best
        if left == 1:
            lines = acc + [' '.join(words[start:])]
            w = max(FONT.getlength(x) for x in lines)
            if best is None or w < best[0]:
                best = (w, lines)
            return
        for i in range(start + 1, len(words) - left + 2):
            go(i, left - 1, acc + [' '.join(words[start:i])])

    go(0, n, [])
    return best[1]


def share(lines, span):
    """Frames for each line, by length, none under MIN_LINE; whole frames adding up to span."""
    total = sum(map(len, lines))
    d = [span * len(t) / total for t in lines]
    short = [i for i, x in enumerate(d) if x < MIN_LINE]
    if short:
        rest = [i for i in range(len(d)) if i not in short]
        spare = span - MIN_LINE * len(short)
        rest_chars = sum(len(lines[i]) for i in rest)
        for i in short:
            d[i] = MIN_LINE
        for i in rest:
            d[i] = spare * len(lines[i]) / rest_chars
    out = [int(x) for x in d]
    out[-1] += span - sum(out)
    return out


def stamp(frame):
    cs = int(frame * 100 / FPS)  # floor: a line starts on, and ends before, its frame
    return f'{cs // 360000}:{cs // 6000 % 60:02d}:{cs // 100 % 60:02d}.{cs % 100:02d}'


placed = {p['i']: p for p in json.load(open(os.path.join(SUB, 'film2-placed-from-review.json'), encoding='utf8'))}
c = clips()
assert len(c) == 55
subs = srt()
assert len(subs) == 91
placed[4] = {**placed[3], 'i': 4, 'clip': placed[4]['clip']}  # dim in the render, unread; the same place as its neighbours
by_clip = {}
for i, lines in subs:
    by_clip.setdefault(placed[i]['clip'], []).append((i, lines))

rows = []
for clip, group in by_clip.items():
    s, e = c[clip]
    clear = CLEAR_SHORT if e - s <= SHORT_CLIP else CLEAR
    span = e - s - 2 * clear - GAP * (len(group) - 1)
    durs = share([' '.join(l) for _, l in group], span)
    t = s + clear
    xs = sorted((placed[i]['x0'] + placed[i]['x1']) / 2 for i, _ in group)
    med = xs[len(xs) // 2]
    for (i, lines), d in zip(group, durs):
        p = placed[i]
        n = len(lines)
        cy = p['y0'] + 27 + 39.5 * (n - 1)
        if clip in CHAT and cy > 950:
            cy = 965  # Carl's Y 120
        cx = (p['x0'] + p['x1']) / 2
        cx = med if abs(cx - med) <= 15 else cx
        cx = 960 if abs(cx - 960) <= 10 else cx
        text = balance(' '.join(lines).split(), n)
        rows.append(dict(i=i, clip=clip, a=t, b=t + d, cx=round(cx), cy=round(cy + DY), lines=text))
        t += d + GAP
rows.sort(key=lambda r: r['i'])

STYLE_FORMAT = ('Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, '
                'StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding')
head = [
    '[Script Info]', 'Title: Film 02 captions', 'ScriptType: v4.00+', 'PlayResX: 1920', 'PlayResY: 1080', 'WrapStyle: 2',
    'ScaledBorderAndShadow: yes', 'YCbCr Matrix: None', '',
    '[V4+ Styles]', 'Format: ' + STYLE_FORMAT,
    f'Style: Caption,Open Sans,{SIZE:g},&H00FFFFFF,&H00FFFFFF,&H00000000,&H00000000,-1,0,0,0,100,100,0,0,1,0,0,5,0,0,0,1', '',
    '[Events]', 'Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text',
]
fad = chr(92) + f'fad({FADE_IN * 1000 // FPS},{FADE_OUT * 1000 // FPS})'
with open(os.path.join(SUB, 'film2-captions.ass'), 'w', encoding='utf8', newline='\n') as f:
    f.write('\n'.join(head) + '\n')
    for r in rows:
        tags = chr(92) + 'an5' + chr(92) + f"pos({r['cx']},{r['cy']})" + fad
        if r['i'] in YELLOW:
            tags += chr(92) + 'c&H00FFFF&'
        f.write(f"Dialogue: 0,{stamp(r['a'])},{stamp(r['b'])},Caption,c{r['i']:02d}-{r['clip']},0,0,0,,{{{tags}}}{NL.join(r['lines'])}\n")
json.dump(rows, open(os.path.join(SUB, 'film2-captions-rows.json'), 'w', encoding='utf8'), indent=0)

shown = [r['b'] - r['a'] for r in rows]
cps = sorted(((sum(map(len, r['lines'])) / ((r['b'] - r['a']) / FPS), r['clip'], r['i']) for r in rows), reverse=True)
print(len(rows), 'captions; shortest', round(min(shown) / FPS, 2), 's; under 3 s:', sum(x < 90 for x in shown), '; last ends', stamp(rows[-1]['b']))
print('fastest:', [(round(a, 1), b, n) for a, b, n in cps[:6]], '; over 17 c/s:', sum(a > 17 for a, _, _ in cps))
