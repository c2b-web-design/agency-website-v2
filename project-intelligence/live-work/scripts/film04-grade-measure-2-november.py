"""Film 04's grade, the numbers for the gold lettering: `07A` to `09B` in Carl's render, every fifth frame, full size, BT.709 limited range forced.
Method as film 02 (film02-grade-objects-2-november.py). A shape from the gold-hued pixels, closed so the letters join; its box; every lit
pixel inside it counts, near-white specular included. Peaks are max(R, G, B), the first channel to the ceiling. A Gain is calculated as
value x gain; film 02's render confirmed 1.08 and 1.04 land as 1.076 and 1.042.
   python film04-grade-measure-2-november.py RENDER OUT      (OUT holds map.json)
Writes OUT/grade.json and OUT/grade-check-*.png (each clip's hottest frame, the counted box outlined), for looking at.
NOT WATCHED: anything inside the box that is not lettering, such as a panel hairline under 40. Grey text clips are not measured."""
import json, subprocess, sys
import numpy as np, cv2
from PIL import Image, ImageDraw

RENDER, OUT = sys.argv[1], sys.argv[2]
W, H, STEP, FPS = 1920, 1080, 5, 30
GAINS = (1.04, 1.08, 1.12, 1.16, 1.20, 1.25, 1.30)
CLIPS = '07A 07B 07C 07D 07E 07F 07G 08A 08B 08C 08D 08E 08F 09A 09B'.split()
mp = {m['clip']: m for m in json.load(open(f'{OUT}/map.json'))}
CLOSE = cv2.getStructuringElement(cv2.MORPH_RECT, (31, 31))
OPEN = cv2.getStructuringElement(cv2.MORPH_RECT, (9, 9))
# The bench's hairline panel round the lettering, read from the frames: on these clips the gold hue also finds its interface.
PANEL = {'07D': (40, 215, 1880, 860), '07E': (40, 215, 1880, 860), '07F': (40, 268, 1880, 915), '07G': (40, 268, 1880, 915)}


def frames(start, length):
    vf = f'select=not(mod(n\\,{STEP})),scale=in_color_matrix=bt709:in_range=tv:out_range=pc,format=rgb24'
    p = subprocess.Popen(['ffmpeg', '-v', 'error', '-ss', f'{start / FPS:.4f}', '-i', RENDER, '-t', f'{length / FPS:.4f}', '-map', '0:v:0', '-vf', vf,
                          '-fps_mode', 'passthrough', '-f', 'rawvideo', '-'], stdout=subprocess.PIPE, bufsize=10**8)
    n, i = W * H * 3, 0
    while True:
        b = p.stdout.read(n)
        if len(b) < n:
            break
        yield i, np.frombuffer(b, np.uint8).reshape(H, W, 3)
        i += STEP
    p.wait()


def box_of(a):
    hsv = cv2.cvtColor(a, cv2.COLOR_RGB2HSV_FULL)
    h, s, v = hsv[..., 0].astype(np.float32) * 360 / 256, hsv[..., 1], hsv[..., 2]
    m = ((s >= 45) & (v >= 45) & (h >= 18) & (h <= 62)).astype(np.uint8) * 255
    m = cv2.morphologyEx(cv2.morphologyEx(m, cv2.MORPH_CLOSE, CLOSE), cv2.MORPH_OPEN, OPEN)
    n, lab, st, _ = cv2.connectedComponentsWithStats(m, connectivity=8)
    keep = [k for k in range(1, n) if st[k, cv2.CC_STAT_AREA] >= 1500]
    if not keep:
        return None
    x0 = min(st[k, 0] for k in keep)
    y0 = min(st[k, 1] for k in keep)
    x1 = max(st[k, 0] + st[k, 2] for k in keep)
    y1 = max(st[k, 1] + st[k, 3] for k in keep)
    return int(x0), int(y0), int(x1), int(y1)


res, checks = {}, []
for c in CLIPS:
    s, n = mp[c]['start'], mp[c]['length']
    rows, best = [], (-1, None, None)
    for i, a in frames(s, n):
        b = PANEL.get(c) or box_of(a)
        if b is None:
            rows.append({'f': i, 'n': 0})
            continue
        x0, y0, x1, y1 = b
        px = a[y0:y1, x0:x1].reshape(-1, 3)
        v = px.max(1).astype(np.float32)
        keep = v >= 40
        px, v = px[keep], v[keep]
        if len(v) < 500:
            rows.append({'f': i, 'n': 0})
            continue
        r = {'f': i, 'n': int(len(v)), 'p50': float(np.percentile(v, 50)), 'p95': float(np.percentile(v, 95)), 'p99': float(np.percentile(v, 99)),
             'p999': float(np.percentile(v, 99.9)), 'at250': float((v >= 250).mean()), 'rgb': [float(x) for x in px.mean(0)],
             'sat': float(1 - (px.min(1) / np.maximum(v, 1)).mean())}
        for g in GAINS:
            r[f'{g:.2f}'] = float((v * g >= 254.5).mean())
        rows.append(r)
        score = r['p99'] * 1000 + r['n'] / 1000
        if score > best[0]:
            best = (score, a.copy(), b)
    res[c] = rows
    if best[1] is not None:
        im = best[1].copy()
        cv2.rectangle(im, best[2][:2], best[2][2:], (255, 0, 255), 3)
        checks.append((c, cv2.resize(im, (640, 360), interpolation=cv2.INTER_AREA)))
    print(c, flush=True)
json.dump(res, open(f'{OUT}/grade.json', 'w'))
for k in range(0, len(checks), 16):
    part = checks[k:k + 16]
    im = Image.new('RGB', (640 * 4, 360 * ((len(part) + 3) // 4)), (40, 40, 40))
    dr = ImageDraw.Draw(im)
    for j, (n, a) in enumerate(part):
        x, y = 640 * (j % 4), 360 * (j // 4)
        im.paste(Image.fromarray(a), (x, y))
        dr.rectangle((x, y, x + 46, y + 18), fill=(0, 0, 0))
        dr.text((x + 4, y + 3), n, fill=(255, 255, 0))
    im.save(f'{OUT}/grade-check-{k // 16 + 1}.png')
print('done')
