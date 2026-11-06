# Film 04's captions: the wording, the timing and the placing, for one transparent layer on V2 (R-099's workflow; Carl, 2 November 2026:
# "Kdenlive is out. Will stick with DR and our workflow."; "scan the page and look for the best placement of captions so it doesnt
# obscure anything important"). Sizes, fades and gaps are film 02's (film02-captions-ass-build.py).
# Timing, Carl: "same rules as before with captions as regards fades etc". His Y rules from film 02 as the lowest places: Y 120 on the
# chat clips (centre 960), Y 100 elsewhere (centre 980).
# Placing: for each caption, every sixth frame of the clip while it shows, what differs from the frame's background is marked; the
# caption's own box is tried up and down the frame, always centred across it; the emptiest height wins, with a small pull to the bottom. A clip's lines share
# one place unless placing them singly saves a quarter of the cover; lines on MOVING clips are always placed singly.
# Timed and placed on Carl's render: map.json (film04-map-cuts-2-november.py) gives each clip's place in it, so his crops and cuts count.
#   python film04-captions-build.py RENDER OUT    (OUT holds map.json)
# Writes film4-captions.ass and film4-captions-rows.json in 10 Subtitles, live-work/film04-captions-draft-2-november.md, OUT/place-*.png.
# NOT WATCHED: whether what is hidden matters: the number says how much is covered, the sheets are for looking. Carl's crops.
import glob, json, os, re, subprocess, sys
import numpy as np, cv2
from PIL import Image, ImageDraw, ImageFont

FILM = os.path.expanduser('~/Videos/C2B Films/04 Extruded lettering')
SUB = os.path.join(FILM, '10 Subtitles')
FONTFILE = os.path.expanduser('~/Videos/C2B Films/02 Ornate corners/07 Subtitles/fonts/OpenSans-Bold.ttf')
RENDER, OUT = sys.argv[1], sys.argv[2]
SIZE, DY = 80.6, -5  # film 02's, calibrated against Carl's captions
FADE_IN, FADE_OUT = 30, 15
NL = chr(92) + 'N'
FPS, W, H = 30, 1920, 1080
CLEAR, CLEAR_SHORT, SHORT_CLIP, GAP, MIN_LINE = 30, 15, 150, 15, 60
FONT = ImageFont.truetype(FONTFILE, 58)
LINE_H, GLYPH_H, PAD = 79, 54, 12
CHAT = set('01A 02A 02B 03G 04A 04C 05A 05D 05F 05H'.split())
MOVING = set('08E 09A 09B'.split())   # the scene changes under the lines, so each line is placed alone
THRESH = {'09B': 45}                  # the bench's floor grid is not worth protecting; its timeline, path and PiP are brighter
PICTURE = set('04B'.split())          # a photograph on white: read by texture, so its empty white counts as empty
DARK = set('04B'.split())             # dark caption, as 03H: the file stays yellow, Carl sets that piece to Subtract

# A line is text, or (text, start second within the clip) where it must land on a beat.
LINES = [
    ('01A', ['It started as a page of its own. Two screens tall, a showcase of modern web work.',
             'Some of what it would show is not on our own site.',
             'Lettering in three.js, with WebGL lighting, and images to follow.',
             'No invented names. Just Your company. What matters is the technique.',
             'Then our normal process. Discussion, plan, Architect, development, implementation.']),
    ('02A', ['We wrote the plan. The Architect reviewed it.',
             'Round one came back with ten findings to fix.',
             'The big change was letting the browser set the spacing. It already does that perfectly.',
             'So we would build only the shapes.',
             'Five rounds later, the Architect called it ready.']),
    ('02B', ['Our founder approved the plan and named the files.']),
    ('03A', ['Take one. The shape alone, in clay.']),
    ('03B', ['No colour, no metal. Just the form.',
             'The browser sets the words. We build each letter where it put them.',
             'Our first check missed three faults. We fixed the check, not the font.']),
    ('03C', ['The mesh. 13,676 triangles.']),
    ('03D', ['Zebra stripes test the surface.']),
    ('03E', ["The Y's inside corner, close up."]),
    ('03F', ['Type new words and the letters rebuild.',
             'Your name, your font, your colour. Each one is a part we can swap.']),
    ('03G', ['A great start, said our founder. The size shows off the lettering.',
             'The bevel looks good. On to the next stage.']),
    ('04A', ['Before the material, one question. What kind of business is it?',
             'A restaurant. Established, higher end.',
             'So the line of text should curve, more like a logo.',
             'Our founder chose an arch, because it suggests sophisticated geometry.',
             'The word Your across the top, company curving under it.']),
    ('04B', ['The reference. We took the form, not the look.']),
    ('04C', ['The arch got its own plan and three rounds of review.',
             'The numbers said the letters would collide before anything was built.',
             'So we chose the fix first. More spacing, every letter upright.']),
    ('04D', ['Take two. One slider raises the straight word into the arch.',
             'The spacing is measured, not guessed.']),
    ('04E', ['Take two, the arch in clay.']),
    ('05A', ['Capitals, said our founder. The P and the Y threw the arch out of line.',
             'Lowercase letters rise and fall. Capitals stand together.']),
    ('05B', ['Take three. The same arch in capitals.',
             'The spacing measured again, to clear every letter.']),
    ('05C', ['Take three, in clay.']),
    ('05D', ['Better, but the P should be centred.',
             'The M and the A on one line, so the arch is implied, not spelt out.']),
    ('05E', ['Take four. Equal steps, mirrored, the P at the crown.',
             'Laid like the stones of an arch.']),
    ('05F', ['Just move the P a touch to the right.',
             'Then the M, P and A read as one piece, the top of the arch.']),
    ('05G', ['Take five. Measured, the P was already centred.',
             'To the eye, it was not.',
             'So we trusted the eye, and measured the fix. 17.6 pixels.']),
    ('05H', ["That's got it, said our founder. More balance.",
             'The shape was approved.']),
    ('06A', ['Take seven. The word logo joins the arch.']),
    ('06B', ['The side walls, faceted.']),
    ('06C', ['The same walls, smoothed.']),
    ('06D', ['Take eight, from the front.']),
    ('06E', ['And from the side.']),
    ('07A', ['Now the material. Brass.']),
    ('07B', ['Brass, the second step.']),
    ('07C', ['The brushed face, close up.']),
    ('07D', ['Turned, the edges catch the studio.',
             'Side on, you see the depth. 32 pixels.']),
    ('07E', ['Now the words stay still and the studio turns.',
             'Bright when it faces a light, dark when it faces nothing.',
             'Metal shows the room around it.']),
    ('07F', ['The arch in brass, under the same studio.',
             'The grain is laid like brick, one direction for each letter.',
             'It follows the curve, so the arch fans round its head.']),
    ('07G', ['A second take on the arch.',
             'Only the studio and the lights together would give the true read.',
             'So the next step was the page.']),
    ('08A', ['The page, upper third.']),
    ('08B', ['Lit from stage left and right.']),
    ('08C', ['Then out front, like a theatre.']),
    ('08D', ['The wings first, then the front.']),
    ('08E', [('Approved. The page, two screens tall.', 1.0),
             ('Scroll, and the line gives way to the arch.', 5.5),
             ('Then the camera moves. Round the back, where the words read in reverse.', 11.5),
             ('Tilting under the N and through the arch.', 21.5),
             ('And out again, back to the front.', 31.5)]),
    ('08F', ['Without 3D, the words still stand.']),
    ('09A', [('The same journey, watched for its light.', 1.0),
             ("Lamps on the orbit's axis keep the sides lit.", 6.5),
             ('A pair behind the arch, so the back reads as well as the front.', 12.5),
             ('We use camera moves sparingly, and only where they earn it.', 20.0)]),
    ('09B', [('When we built this, our camera was still being built. This is where it is now.', 0.7),
             ('A move described in words, then calculated. Forward, two barrel rolls, through the arch.', 6.8),
             ('We fly with a game pad and keep each move as a clip on a timeline.', 14.0),
             ('Then we step out of the camera.', 20.3),
             ("Now we see the whole scene. The line is the camera's path. Top left is what it sees.", 25.0),
             ('One view to compose the shot, one to edit it.', 32.5),
             ('None of this reaches the client. Their film shows only the shot.', 37.5)]),
]


def clips():
    return {m['clip']: (m['start'], m['start'] + m['length'], m['head']) for m in json.load(open(f'{OUT}/map.json'))}


def balance(words, n):
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


def timed(c):
    rows = []
    for clip, group in LINES:
        s, e, head = c[clip]
        clear = CLEAR_SHORT if e - s <= SHORT_CLIP else CLEAR
        if isinstance(group[0], tuple):
            starts = [max(s + clear, s + round(t * FPS) - head) for _, t in group]  # beats are seconds in the source clip
            ends = [x - GAP for x in starts[1:]] + [e - clear]
            texts = [t for t, _ in group]
        else:
            texts = group
            span = e - s - 2 * clear - GAP * (len(texts) - 1)
            t, starts, ends = s + clear, [], []
            for d in share(texts, span):
                starts.append(t)
                ends.append(t + d)
                t += d + GAP
        for text, a, b in zip(texts, starts, ends):
            rows.append(dict(i=len(rows) + 1, clip=clip, a=a, b=b, text=text))
    return rows


def frames_of(start, length, step=6):
    """Every sixth frame of the render over one clip, keyed from the clip's first frame."""
    n = W * H
    p = subprocess.Popen(['ffmpeg', '-v', 'error', '-ss', f'{start / FPS:.4f}', '-i', RENDER, '-t', f'{length / FPS:.4f}', '-map', '0:v:0',
                          '-vf', f'select=not(mod(n\\,{step}))', '-fps_mode', 'passthrough', '-f', 'rawvideo', '-pix_fmt', 'gray', '-'],
                         stdout=subprocess.PIPE, bufsize=10**8)
    out, i = {}, 0
    while True:
        b = p.stdout.read(n)
        if len(b) < n:
            break
        out[i] = np.frombuffer(b, np.uint8).reshape(H, W)
        i += step
    p.wait()
    return out


def maps(fr, a, b, clip):
    """Mean and any-frame cover of what differs from the background, over the frames a..b of the clip, plus the brightest level seen."""
    keys = [k for k in fr if a <= k < b] or [min(fr, key=lambda k: abs(k - a))]
    mean, anyf = np.zeros((H, W), np.float32), np.zeros((H, W), bool)
    top = np.zeros((H, W), np.uint8)
    kern = np.ones((7, 7), np.uint8)
    for k in keys:
        g = fr[k]
        if clip in PICTURE:
            e = np.abs(cv2.Laplacian(cv2.GaussianBlur(g, (5, 5), 0), cv2.CV_16S, ksize=3))
            m = cv2.dilate((cv2.blur(e.astype(np.float32), (15, 15)) > 6).astype(np.uint8), kern) > 0
        else:
            bg = int(np.median(g[::8, ::8]))
            m = cv2.dilate((np.abs(g.astype(np.int16) - bg) > THRESH.get(clip, 14)).astype(np.uint8), kern) > 0
        mean += m
        anyf |= m
        top = np.maximum(top, g)
    return mean / len(keys), anyf, top


def integral(a):
    return cv2.integral(a.astype(np.float32), sdepth=cv2.CV_64F)


def boxed(ii, x0, y0, x1, y1):
    return ii[y1, x1] - ii[y0, x1] - ii[y1, x0] + ii[y0, x0]


def text_box(lines):
    return int(max(FONT.getlength(x) for x in lines)) + 2 * PAD, GLYPH_H + LINE_H * (len(lines) - 1) + 2 * PAD


def wraps(text, clip):
    words = text.split()
    opts = []
    for n in ((1, 2) if clip in CHAT else (1, 2, 3)):  # Carl: "if its showing vs code chat window keep to 2 lines"
        if n <= len(words):
            ls = balance(words, n)
            if max(FONT.getlength(x) for x in ls) <= 1500:
                opts.append(ls)
    return opts


def search(iis, group_lines, bottom):
    """The best centre for one box size set: iis is [(mean ii, any ii)], one per line in the group."""
    bw = max(text_box(l)[0] for l in group_lines)
    bh = max(text_box(l)[1] for l in group_lines)
    best = None
    for cy in range(40 + bh // 2, bottom - bh // 2 + 1, 10):
        for cx in (W // 2,):  # Carl, 2 November, on the take with lines off to the side: "Text should be centred"
            x0, y0, x1, y1 = cx - bw // 2, cy - bh // 2, cx - bw // 2 + bw, cy - bh // 2 + bh
            area = bw * bh
            worst = max(.5 * boxed(m, x0, y0, x1, y1) / area + .5 * boxed(a, x0, y0, x1, y1) / area for m, a in iis)
            score = worst + .015 * (bottom - y1) / 1000 + .01 * abs(cx - 960) / 960
            if best is None or score < best[0]:
                best = (score, worst, cx, cy)
    return best


c = clips()
assert len(c) == 43
assert [k for k, _ in LINES] == sorted(c, key=lambda k: c[k][0])
LAST = max(v[1] for v in c.values())
rows = timed(c)
placed = []
for clip, _ in LINES:
    s, e, _ = c[clip]
    fr = frames_of(s, e - s)
    group = [r for r in rows if r['clip'] == clip]
    bottom = 1038 if clip in CHAT else 1058
    ms = [maps(fr, r['a'] - s, r['b'] - s, clip) for r in group]
    iis = [(integral(m), integral(a)) for m, a, _ in ms]
    # Shared place: the narrowest wrap that fits, two lines by preference.
    shared = None
    for n in ((2, 1) if clip in CHAT else (2, 3, 1)):
        ls = []
        for r in group:
            words = r['text'].split()
            ls.append(balance(words, min(n, len(words))) if len(words) >= 1 else [r['text']])
        if max(text_box(l)[0] for l in ls) > 1540:
            continue
        b = search(iis, ls, bottom)
        if shared is None or b[0] < shared[0][0] - .004:
            shared = (b, ls)
    solo = []
    for r, ii in zip(group, iis):
        best = None
        for ls in wraps(r['text'], clip):
            b = search([ii], [ls], bottom)
            if best is None or b[0] < best[0][0] - .004:
                best = (b, ls)
        solo.append(best)
    use_solo = len(group) > 1 and (clip in MOVING or (shared[0][1] > .03 and sum(x[0][1] for x in solo) / len(solo) < shared[0][1] * .75))
    for k, r in enumerate(group):
        (score, worst, cx, cy), ls = (solo[k] if use_solo else (shared[0], shared[1][k]))
        m, a, top = ms[k]
        bw, bh = text_box(ls)
        box = top[cy - bh // 2:cy - bh // 2 + bh, cx - bw // 2:cx - bw // 2 + bw]
        keys = [q for q in fr if r['a'] - s <= q < r['b'] - s] or [min(fr, key=lambda q: abs(q - (r['a'] - s)))]
        # The frame this caption hides most of, for the sheet.
        f0 = max(keys, key=lambda q: float((np.abs(fr[q][cy - bh // 2:cy - bh // 2 + bh, cx - bw // 2:cx - bw // 2 + bw].astype(np.int16)
                                                  - int(np.median(fr[q][::8, ::8]))) > 14).mean()))
        placed.append({**r, 'cx': cx, 'cy': cy, 'lines': ls, 'cover': round(float(worst), 3), 'bright': int(np.percentile(box, 90)),
                       'solo': bool(use_solo), 'dark': clip in DARK, 'thumb': cv2.resize(fr[f0], (640, 360), interpolation=cv2.INTER_AREA)})
    print(clip, 'solo' if use_solo else 'shared', [(p['cover'], p['cx'], p['cy']) for p in placed if p['clip'] == clip], flush=True)

WATCH = placed
for k in range(0, len(WATCH), 20):
    part = WATCH[k:k + 20]
    im = Image.new('RGB', (640 * 4, 360 * ((len(part) + 3) // 4)), (40, 40, 40))
    dr = ImageDraw.Draw(im)
    small = ImageFont.truetype(FONTFILE, 19)
    for j, p in enumerate(part):
        x, y = 640 * (j % 4), 360 * (j // 4)
        im.paste(Image.fromarray(p['thumb']).convert('RGB'), (x, y))
        n = len(p['lines'])
        for q, t in enumerate(p['lines']):
            ty = (p['cy'] + (q - (n - 1) / 2) * LINE_H) / 3 + y
            dr.text((x + p['cx'] / 3, ty), t, font=small, fill=(0, 0, 200) if p['dark'] else (255, 255, 0), anchor='mm')
        dr.rectangle((x, y, x + 150, y + 16), fill=(0, 0, 0))
        dr.text((x + 3, y + 2), f"{p['i']} {p['clip']} c{p['cover']:.2f} b{p['bright']}", fill=(0, 255, 255))
    im.save(f'{OUT}/place-{k // 20 + 1}.png')

os.makedirs(SUB, exist_ok=True)
clean = [{k: v for k, v in p.items() if k != 'thumb'} for p in placed]
json.dump(clean, open(os.path.join(SUB, 'film4-captions-rows.json'), 'w', encoding='utf8'), indent=0)
cps = sorted(((len(p['text']) / ((p['b'] - p['a']) / FPS), p['i'], p['clip']) for p in clean), reverse=True)
print(len(clean), 'captions; shortest', round(min(p['b'] - p['a'] for p in clean) / FPS, 2), 's; fastest', [(round(a, 1), b, n) for a, b, n in cps[:5]],
      '; over 17 c/s', sum(a > 17 for a, _, _ in cps))
print('cover over .05:', [(p['i'], p['clip'], p['cover']) for p in clean if p['cover'] > .05])
print('bright over 110:', [(p['i'], p['clip'], p['bright']) for p in clean if p['bright'] > 110])
md = ['# Film 04: captions, draft for Carl', '', f'{len(clean)} lines across 43 clips, {LAST} frames, timed and placed on his render. "At" is where the line starts; X and Y are its centre in the frame.', '',
      '| No | Clip | At | X | Y | Line |', '|---|---|---|---|---|---|']
md += [f"| {p['i']} | `{p['clip']}` | {p['a'] // 1800}:{p['a'] // 30 % 60:02d} | {p['cx']} | {p['cy']} | {p['text']} |" for p in clean]
open(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'film04-captions-draft-2-november.md'), 'w', encoding='utf8').write('\n'.join(md) + '\n')


def stamp(frame):
    cs = int(frame * 100 / FPS)  # floor: a line starts on, and ends before, its frame
    return f'{cs // 360000}:{cs // 6000 % 60:02d}:{cs // 100 % 60:02d}.{cs % 100:02d}'


STYLE_FORMAT = ('Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, '
                'StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding')
head = ['[Script Info]', 'Title: Film 04 captions', 'ScriptType: v4.00+', 'PlayResX: 1920', 'PlayResY: 1080', 'WrapStyle: 2',
        'ScaledBorderAndShadow: yes', 'YCbCr Matrix: None', '',
        '[V4+ Styles]', 'Format: ' + STYLE_FORMAT,
        f'Style: Caption,Open Sans,{SIZE:g},&H00FFFFFF,&H00FFFFFF,&H00000000,&H00000000,-1,0,0,0,100,100,0,0,1,0,0,5,0,0,0,1', '',
        '[Events]', 'Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text']
fad = chr(92) + f'fad({FADE_IN * 1000 // FPS},{FADE_OUT * 1000 // FPS})'
with open(os.path.join(SUB, 'film4-captions.ass'), 'w', encoding='utf8', newline='\n') as f:
    f.write('\n'.join(head) + '\n')
    for p in clean:
        tags = chr(92) + 'an5' + chr(92) + f"pos({p['cx']},{p['cy'] + DY})" + fad
        if p['dark']:
            tags += chr(92) + 'c&H00FFFF&'
        f.write(f"Dialogue: 0,{stamp(p['a'])},{stamp(p['b'])},Caption,c{p['i']:02d}-{p['clip']},0,0,0,,{{{tags}}}{NL.join(p['lines'])}\n")
print('done')
