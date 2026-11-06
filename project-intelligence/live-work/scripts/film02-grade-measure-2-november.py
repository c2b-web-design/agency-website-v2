"""Film 02's grade, the scope: which clips hold gold and which hold blue, and how hot each metal runs.
Film 01's method (D-107, 1 November): every fifth frame to find the colour, full size, peaks by percentile of value,
area in pixels, then what a Gain would clip. Film 01's first pass at a quarter size understated the peaks, so full size here.

Reads the source clips, BT.709 limited range forced on the decode (ffmpeg's default for raw RGB out is not trusted).
   python film02-grade-measure-2-november.py OUT
Writes OUT/rows.json (one row per sampled frame per clip) and OUT/sheet-*.png (one frame per clip, the hottest sampled, by name).

NOT WATCHED: Carl's crops and the captions (the source clips carry neither), so a colour in a cropped-off strip still counts.
The masks are colour only: gold-coloured or blue-coloured text and UI count too, so a clip's membership is read from the frame
by eye, not from these numbers."""
import glob, json, os, subprocess, sys
import numpy as np, cv2
from PIL import Image, ImageDraw

D = os.path.expanduser('~/Videos/C2B Films/02 Ornate corners')
OUT = sys.argv[1]
W, H, STEP = 1920, 1080, 5
files = sorted(glob.glob(D + '/09 Cut - 10 min/*.mov'))
assert len(files) == 55, len(files)
# 06G and 06H were reshot: the timeline holds the pick-ups, not the cut's files.
pick = {os.path.basename(f)[:3]: f for f in glob.glob(D + '/10 Pick-ups/*.mov')}
files = [pick.get(os.path.basename(f)[:3], f) for f in files]
GAINS = (1.04, 1.08, 1.12, 1.16, 1.20)


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


def stats(rgb, mask):
    n = int(mask.sum())
    if n == 0:
        return {'n': 0}
    v = rgb[mask].max(1).astype(np.float32)
    r = {'n': n, 'p50': float(np.percentile(v, 50)), 'p98': float(np.percentile(v, 98)), 'p99': float(np.percentile(v, 99)), 'max': int(v.max())}
    for g in GAINS:
        r[f'clip{g:.2f}'] = float((v * g >= 254.5).mean())
    return r


rows, sheet = [], []
for fp in files:
    name = os.path.basename(fp)[:3]
    best = (-1, None)
    for i, a in frames(fp):
        hsv = cv2.cvtColor(a, cv2.COLOR_RGB2HSV_FULL)  # H 0..255 over the circle
        h, s, v = hsv[..., 0].astype(np.float32) * 360 / 256, hsv[..., 1], hsv[..., 2]
        lit = (s >= 90) & (v >= 60)
        gold = lit & (h >= 28) & (h <= 58)
        blue = lit & (h >= 190) & (h <= 245)
        rows.append({'clip': name, 'f': i, 'gold': stats(a, gold), 'blue': stats(a, blue), 'white': float((v > 235).mean())})
        n = int(gold.sum()) + int(blue.sum())
        if n > best[0]:
            best = (n, a.copy())
    if best[1] is None:
        print(name, 'NO FRAMES', flush=True)
        continue
    sheet.append((name, cv2.resize(best[1], (480, 270), interpolation=cv2.INTER_AREA)))
    print(name, flush=True)

json.dump(rows, open(f'{OUT}/rows.json', 'w'))
for k in range(0, len(sheet), 20):
    part = sheet[k:k + 20]
    im = Image.new('RGB', (480 * 4, 270 * ((len(part) + 3) // 4)), (40, 40, 40))
    dr = ImageDraw.Draw(im)
    for j, (n, a) in enumerate(part):
        x, y = 480 * (j % 4), 270 * (j // 4)
        im.paste(Image.fromarray(a), (x, y))
        dr.rectangle((x, y, x + 46, y + 18), fill=(0, 0, 0))
        dr.text((x + 4, y + 3), n, fill=(255, 255, 0))
    im.save(f'{OUT}/sheet-{k // 20 + 1}.png')
print('done', len(rows))
