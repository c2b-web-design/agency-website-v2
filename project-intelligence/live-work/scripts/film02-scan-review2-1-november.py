"""film2-review-2.mp4, every frame. Stats and every-sixth-frame N template on the render; a quarter-size difference against
film2-review.mp4 (same cut, old captions). Writes OUT/stats.npy, OUT/n.npy, OUT/diff.npy. Asserts 16,650 frames on both.
   python film02-scan-review2-1-november.py OUT
NOT WATCHED here: the captions (film02-check-captions-1-november.py)."""
import os, subprocess, sys, threading
import numpy as np, cv2

D = os.path.expanduser('~/Videos/C2B Films/02 Ornate corners')
R2, R1 = D + '/film2-review-2.mp4', D + '/film2-review.mp4'
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = sys.argv[1]
W, H = 1920, 1080
TW, TH = 480, 270
FRAMES = 16650
T0 = cv2.resize(cv2.imread(os.path.join(HERE, 'n-template.png'), 0), (35, 35), interpolation=cv2.INTER_AREA)
Ts = [cv2.resize(T0, None, fx=s, fy=s, interpolation=cv2.INTER_AREA) for s in (1.0, 0.8, 0.6)]


def pipe(path, vf=None):
    a = ['ffmpeg', '-v', 'error', '-i', path, '-map', '0:v:0', '-fps_mode', 'passthrough']
    if vf:
        a += ['-vf', vf]
    return subprocess.Popen(a + ['-f', 'rawvideo', '-pix_fmt', 'gray', '-'], stdout=subprocess.PIPE, bufsize=10**8)


def full():
    p = pipe(R2)
    rows, ns, i, n = [], [], 0, W * H
    while True:
        b = p.stdout.read(n)
        if len(b) < n:
            break
        a = np.frombuffer(b, dtype=np.uint8).reshape(H, W)
        rows.append((a.mean(), a.max(), (a > 235).mean(), (a < 18).mean(), a[:, :12].max(), a[:, -16:].max(), a[:12, :].max(), a[-12:, :].max(),
                     a[:, -16:].mean()))
        if i % 6 == 0:
            best, loc = 0.0, (0, 0)
            for T in Ts:
                r = cv2.matchTemplate(a, T, cv2.TM_CCOEFF_NORMED)
                _, mx, _, l = cv2.minMaxLoc(r)
                if mx > best:
                    best, loc = float(mx), (l[0] + T.shape[1] // 2, l[1] + T.shape[0] // 2)
            ns.append((i, best, loc[0], loc[1]))
        i += 1
    p.wait()
    np.save(f'{OUT}/stats.npy', np.array(rows, np.float32))
    np.save(f'{OUT}/n.npy', np.array(ns, np.float32))
    print('stats', len(rows), flush=True)


def diff():
    vf = f'scale={TW}:{TH}:flags=area'
    p2, p1 = pipe(R2, vf), pipe(R1, vf)
    n, rows = TW * TH, []
    while True:
        a, b = p2.stdout.read(n), p1.stdout.read(n)
        if len(a) < n or len(b) < n:
            print('diff end', len(a), len(b), flush=True)
            break
        d = np.abs(np.frombuffer(a, np.uint8).astype(np.int16) - np.frombuffer(b, np.uint8).astype(np.int16)).reshape(TH, TW)
        top = d[:int(TH * .72)]
        rows.append((d.mean(), (d > 20).mean(), (top > 20).mean()))
    np.save(f'{OUT}/diff.npy', np.array(rows, np.float32))
    print('diff', len(rows), flush=True)


ts = [threading.Thread(target=full), threading.Thread(target=diff)]
[t.start() for t in ts]
[t.join() for t in ts]
assert len(np.load(f'{OUT}/stats.npy')) == FRAMES and len(np.load(f'{OUT}/diff.npy')) == FRAMES, 'frame counts wrong'
print('done')
