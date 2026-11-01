"""Every-frame scan of film1-review-4, with thumbnails of it and of review 3 for alignment."""
import subprocess, sys, threading
import numpy as np

D = r"C:\Users\Carl Buckley\Videos\C2B Films\01 Who we are button"
R4 = D + r"\film1-review-4.mp4 .mp4"
R3 = D + r"\film1-review-3.mp4"
OUT = sys.argv[1]
W, H = 1920, 1080
TW, TH = 160, 90


def thumbs(path, name):
    p = subprocess.Popen(
        ["ffmpeg", "-v", "error", "-i", path, "-map", "0:v:0", "-fps_mode", "passthrough", "-vf", f"scale={TW}:{TH}:flags=area",
         "-f", "rawvideo", "-pix_fmt", "gray", "-"], stdout=subprocess.PIPE, bufsize=10**8)
    raw = p.stdout.read()
    p.wait()
    a = np.frombuffer(raw, dtype=np.uint8).reshape(-1, TH, TW)
    np.save(f"{OUT}/{name}-thumbs.npy", a)
    print(name, "thumbs", a.shape, flush=True)


def stats(path):
    p = subprocess.Popen(
        ["ffmpeg", "-v", "error", "-i", path, "-map", "0:v:0", "-fps_mode", "passthrough", "-f", "rawvideo", "-pix_fmt", "gray", "-"],
        stdout=subprocess.PIPE, bufsize=10**8)
    rows = []
    n = W * H
    while True:
        b = p.stdout.read(n)
        if len(b) < n:
            break
        a = np.frombuffer(b, dtype=np.uint8).reshape(H, W)
        rows.append((
            a.mean(), a.max(),
            (a > 235).mean(),               # white share
            a[:, :12].max(),                # far left edge
            a[:, -12:].max(),               # far right edge
            a[:12, :].max(),                # top edge
            a[-12:, :].max(),               # bottom edge
            a[880:1080, 0:140].max(),       # N badge corner
            a[1040:, :].max(),              # taskbar band
        ))
    p.wait()
    r = np.array(rows, dtype=np.float32)
    np.save(f"{OUT}/r4-stats.npy", r)
    print("stats", r.shape, flush=True)


ts = [threading.Thread(target=thumbs, args=(R4, "r4")), threading.Thread(target=thumbs, args=(R3, "r3")), threading.Thread(target=stats, args=(R4,))]
[t.start() for t in ts]
[t.join() for t in ts]
import numpy as _n
assert len(_n.load(f"{OUT}/r4-stats.npy")) == 15232 and len(_n.load(f"{OUT}/r3-thumbs.npy")) == 15200, "frame counts wrong"
print("done")
