"""Film 02's grade, second pass: the corners alone. The first pass (film02-grade-measure-2-november.py) was colour only and read the
bench's blue sliders and the text's colour fringes as metal, so its peaks are not usable.

Each clip's metal is named by hand, from looking at the frames. Page clips: a loose colour mask, closed so the carving joins into a
shape, opened so text falls away, components under a floor dropped. Bench clips: the bench's own panel round the object, every lit
pixel inside it; r['edge'] counts lit pixels on the panel's rim, so an object running off it shows. Near-white specular counts in both, because those are the peaks a Gain clips.
Peaks are max(R, G, B), the first channel to reach the ceiling. Every fifth frame, full size, BT.709 limited range forced.
   python film02-grade-objects-2-november.py OUT
Writes OUT/obj.json and OUT/check-*.png (each clip's hottest frame with the counted shape outlined), for looking at.

NOT WATCHED: Carl's crops (source clips). The reference clips' shapes are as loose as the pictures: 01C's board is many objects."""
import glob, json, os, subprocess, sys
import numpy as np, cv2
from PIL import Image, ImageDraw

D = os.path.expanduser('~/Videos/C2B Films/02 Ornate corners')
OUT = sys.argv[1]
W, H, STEP = 1920, 1080, 5
GAINS = (1.04, 1.08, 1.12, 1.16, 1.20, 1.25, 1.30)
CLIPS = '01C 03F 03G 03H 04A 04B 04C 04E 04F 04G 04H 04I 06A 06B 06C 06D 06E 06F 06G 06H 07A 07B 07C 07D 07E 07F 07G 08C'.split()
files = {os.path.basename(f)[:3]: f for f in glob.glob(D + '/09 Cut - 10 min/*.mov')}
files.update({os.path.basename(f)[:3]: f for f in glob.glob(D + '/10 Pick-ups/*.mov')})
BIG = cv2.getStructuringElement(cv2.MORPH_RECT, (21, 21))   # joins the carving on the large bench views
SMALL = cv2.getStructuringElement(cv2.MORPH_RECT, (9, 9))   # the page's corners are about 130 px wide


def frames(fp):
    vf = f'select=not(mod(n\\,{STEP})),scale=in_color_matrix=bt709:in_range=tv:out_range=pc,format=rgb24'
    p = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', fp, '-map', '0:v:0', '-vf', vf, '-fps_mode', 'passthrough', '-f', 'rawvideo', '-'],
                         stdout=subprocess.PIPE, bufsize=10**8)
    n, i = W * H * 3, 0
    while True:
        b = p.stdout.read(n)
        if len(b) < n:
            break
        yield i, np.frombuffer(b, np.uint8).reshape(H, W, 3)
        i += STEP
    p.wait()


def shape(mask, close, floor):
    m = cv2.morphologyEx(mask.astype(np.uint8) * 255, cv2.MORPH_CLOSE, close)
    m = cv2.morphologyEx(m, cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_RECT, (15, 15)))
    n, lab, st, _ = cv2.connectedComponentsWithStats(m, connectivity=8)
    keep = np.isin(lab, [k for k in range(1, n) if st[k, cv2.CC_STAT_AREA] >= floor])
    return keep


def stats(rgb, sil):
    px = rgb[sil]
    v = px.max(1).astype(np.float32)
    px = px[v >= 40]
    v = v[v >= 40]
    if len(v) < 500:
        return None
    r = {'n': int(len(v)), 'p50': float(np.percentile(v, 50)), 'p95': float(np.percentile(v, 95)), 'p99': float(np.percentile(v, 99)),
         'p999': float(np.percentile(v, 99.9)), 'at255': float((v >= 254.5).mean()), 'sat': float(1 - (px.min(1) / np.maximum(v, 1)).mean())}
    for g in GAINS:
        r[f'{g:.2f}'] = float((v * g >= 254.5).mean())
    return r


METAL = {'gold': '01C 03F 03G 03H 04A 04B 04C 06A 06B 06D 06E 07D 07F'.split(),
         'blue': '03G 04E 04F 04G 04H 04I 06C 06E 06F 06G 06H 07A 07B 07C 07E 07G 08C'.split()}
HUE = {'gold': (20, 60), 'blue': (190, 260)}
# The bench's hairline panel round the object, read from the frames: (x0, y0, x1, y1), full size. Nothing else is drawn inside it.
BENCH = {'04A': (36, 375, 1014, 930), '04C': (33, 312, 1011, 870), '04E': (36, 375, 1014, 933), '04F': (36, 375, 1014, 933),
         '04I': (33, 306, 1011, 870), '04B': (33, 21, 1011, 579), '04G': (33, 27, 1011, 579), '04H': (33, 27, 1011, 579),
         '07D': (33, 21, 1011, 579), '07E': (33, 21, 1011, 579), '07F': (33, 21, 1011, 579), '07G': (33, 21, 1011, 579)}


def bench_shape(v, c):
    x0, y0, x1, y1 = BENCH[c]
    box = np.zeros((H, W), bool)
    box[y0:y1, x0:x1] = True
    return box & (v >= 40)


res, checks = {}, []
for c in CLIPS:
    rows, best = [], (-1, None, None)
    metals = [m for m in METAL if c in METAL[m]]
    for i, a in frames(files[c]):
        hsv = cv2.cvtColor(a, cv2.COLOR_RGB2HSV_FULL)
        h, s, v = hsv[..., 0].astype(np.float32) * 360 / 256, hsv[..., 1], hsv[..., 2]
        r = {'f': i}
        for metal in metals:
            lo, hi = HUE[metal]
            if c in BENCH:
                sil = bench_shape(v, c)
            else:
                sil = shape((s >= 45) & (v >= 45) & (h >= lo) & (h <= hi), BIG if c in ('07B', '07C') else SMALL, 900)
                if c == '07B':  # the enlarged text sits in the middle of the frame
                    sil[300:810, 300:1620] = False
                if c == '07C':  # "Proven", lower right
                    sil[700:, :] = False
            st = stats(a, sil) if sil is not None else None
            if c in BENCH:
                x0, y0, x1, y1 = BENCH[c]
                r['edge'] = int((v[y0 + 2, x0:x1] >= 40).sum() + (v[y1 - 3, x0:x1] >= 40).sum())
            r[metal] = st
            if st and st['p99'] * 1000 + st['n'] / 1000 > best[0]:
                best = (st['p99'] * 1000 + st['n'] / 1000, a.copy(), sil.copy())
        rows.append(r)
    res[c] = rows
    if best[1] is not None:
        im = best[1].copy()
        cs, _ = cv2.findContours(cv2.dilate(best[2].astype(np.uint8), np.ones((5, 5), np.uint8)), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        cv2.drawContours(im, cs, -1, (255, 0, 255), 2)
        checks.append((c, cv2.resize(im, (640, 360), interpolation=cv2.INTER_AREA)))
    print(c, flush=True)

json.dump(res, open(f'{OUT}/obj.json', 'w'))
for k in range(0, len(checks), 12):
    part = checks[k:k + 12]
    im = Image.new('RGB', (640 * 3, 360 * ((len(part) + 2) // 3)), (40, 40, 40))
    dr = ImageDraw.Draw(im)
    for j, (n, a) in enumerate(part):
        x, y = 640 * (j % 3), 360 * (j // 3)
        im.paste(Image.fromarray(a), (x, y))
        dr.rectangle((x, y, x + 46, y + 18), fill=(0, 0, 0))
        dr.text((x + 4, y + 3), n, fill=(255, 255, 0))
    im.save(f'{OUT}/check-{k // 12 + 1}.png')
print('done')
