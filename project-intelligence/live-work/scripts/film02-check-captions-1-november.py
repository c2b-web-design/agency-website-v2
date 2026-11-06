"""Every caption in film2-review-2.mp4 against the layer that drew it. For each of the 91: the caption's own glyphs, from the layer at
its midpoint, are searched for across the render's frame, which finds where it landed however Carl moved its V2 piece, and scores
the match. Then its strength part way through each fade, and how it stands against what is right behind it.
   python film02-check-captions-1-november.py OUT [render]
NOT WATCHED: whether a caption covers something the viewer needs; that is Carl's eye."""
import json, os, subprocess, sys
import numpy as np, cv2

D = os.path.expanduser('~/Videos/C2B Films/02 Ornate corners')
R, L = D + '/' + (sys.argv[2] if len(sys.argv) > 2 else 'film2-review-2.mp4'), D + '/07 Subtitles/film2-captions-layer.mov'
OUT = sys.argv[1]
W, H = 1920, 1080
rows = json.load(open(D + '/07 Subtitles/film2-captions-rows.json', encoding='utf8'))


def grab(path, f, fmt='gray', ch=1):
    r = subprocess.run(['ffmpeg', '-v', 'error', '-ss', f'{(f + .5) / 30:.4f}', '-i', path, '-frames:v', '1', '-vf', f'format={fmt}',
                        '-f', 'rawvideo', '-'], capture_output=True)
    assert len(r.stdout) == W * H * ch, (path, f, len(r.stdout))
    a = np.frombuffer(r.stdout, np.uint8)
    return a.reshape(H, W) if ch == 1 else a.reshape(H, W, ch)


out = []
for r in rows:
    mid = (r['a'] + r['b']) // 2
    alpha = grab(L, mid, 'rgba', 4)[..., 3]
    ys, xs = np.where(alpha > 128)
    x0, x1, y0, y1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
    T = (alpha[y0:y1, x0:x1] > 128).astype(np.uint8) * 255
    g = grab(R, mid)
    # white or yellow glyphs: the channel that is high for both
    rgb = grab(R, mid, 'rgb24', 3)
    bright = rgb[..., 1]
    m = cv2.matchTemplate(bright, T, cv2.TM_CCOEFF_NORMED)
    _, score, _, loc = cv2.minMaxLoc(m)
    dx, dy = int(loc[0] - x0), int(loc[1] - y0)
    box = (loc[1], loc[1] + T.shape[0], loc[0], loc[0] + T.shape[1])
    glyph = T > 0
    inner = cv2.erode(T, np.ones((3, 3), np.uint8)) > 0
    ring = (cv2.dilate(T, np.ones((15, 15), np.uint8)) > 0) & ~(cv2.dilate(T, np.ones((5, 5), np.uint8)) > 0)
    crop = g[box[0]:box[1], box[2]:box[3]].astype(np.float32)
    text, back = float(crop[inner].mean()), float(crop[ring].mean())
    backmax = float(np.percentile(crop[ring], 95))

    def strength(f):
        c = grab(R, f)[box[0]:box[1], box[2]:box[3]].astype(np.float32)
        return round(float(c[inner].mean() - c[ring].mean()) / max(text - back, 1), 2)

    a, b = r['a'], r['b']
    fades = [strength(a + 8), strength(a + 15), strength(a + 23), strength(b - 8)]
    out.append(dict(i=r['i'], clip=r['clip'], score=round(float(score), 3), dx=dx, dy=dy, text=round(text), back=round(back), backmax=round(backmax), fades=fades,
                    yb=int(box[1]), xr=int(box[3])))
    print(r['i'], r['clip'], out[-1], flush=True)
json.dump(out, open(f'{OUT}/captions.json', 'w'), indent=0)
print('done')
