"""film4-review-2.mp4 against film 04's first render (film2-review-3.mp4 in its folder), every frame at a sixth size, BT.709 limited range forced, as film 01's review 5 was
checked (film-compare-renders-1-november.py). The ratio is measured on values 60 to 215, away from both ends. Writes OUT/cmp.npy.
   python film04-compare-review2-2-november.py OUT
Asserts 15,461 frames. NOT WATCHED: anything smaller than about six pixels at full size."""
import os, subprocess, sys
import numpy as np

D = os.path.expanduser('~/Videos/C2B Films/04 Extruded lettering')
OUT = sys.argv[1]
TW, TH = 320, 180
N = TW * TH * 3


def pipe(path):
    vf = f'scale={TW}:{TH}:flags=area:in_range=tv:out_range=pc:in_color_matrix=bt709:out_color_matrix=bt709'
    return subprocess.Popen(['ffmpeg', '-v', 'error', '-i', path, '-map', '0:v:0', '-fps_mode', 'passthrough', '-vf', vf, '-f', 'rawvideo',
                             '-pix_fmt', 'rgb24', '-'], stdout=subprocess.PIPE, bufsize=10**8)


p2, p3 = pipe(D + '/film2-review-3.mp4'), pipe(D + '/film4-review-2.mp4')
rows = []
while True:
    a, b = p2.stdout.read(N), p3.stdout.read(N)
    if len(a) < N or len(b) < N:
        print('end', len(a), len(b), flush=True)
        break
    x = np.frombuffer(a, np.uint8).reshape(TH, TW, 3).astype(np.float32)
    y = np.frombuffer(b, np.uint8).reshape(TH, TW, 3).astype(np.float32)
    d = np.abs(x - y).max(axis=2)
    m = (x.max(axis=2) > 60) & (x.max(axis=2) < 215)
    g = float(y[m].sum() / max(x[m].sum(), 1)) if m.sum() > 20 else 0.0
    rows.append((d.mean(), (d > 10).mean(), g, float(y.max()), float(y.mean())))
r = np.array(rows, np.float32)
np.save(f'{OUT}/cmp.npy', r)
assert len(r) == 15461, len(r)
print('done')
