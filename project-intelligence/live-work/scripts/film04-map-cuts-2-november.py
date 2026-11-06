"""Where each of film 04's clips landed in Carl's render: a walk down the render, matching it frame by frame against the source clips at a
twelfth size, on the middle of the frame so his crops do not count. For each clip: its first frame in the render, how many source
frames he took off the head, how long it runs. Writes OUT/map.json.
   python film04-map-cuts-2-november.py RENDER OUT
NOT WATCHED: a still clip's head trim cannot be seen (every frame matches), so it reads 0; a tail trim between two near-identical clips
shows only in the next clip's start. The output names those, and its total must equal the render's length."""
import glob, json, os, subprocess, sys
import numpy as np

D = os.path.expanduser('~/Videos/C2B Films/04 Extruded lettering')
RENDER, OUT = sys.argv[1], sys.argv[2]
TW, TH = 160, 90
Y0, Y1, X0, X1 = 14, 76, 8, 152


def read(path):
    p = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', path, '-map', '0:v:0', '-vf', f'scale={TW}:{TH}:flags=area', '-fps_mode', 'passthrough',
                          '-f', 'rawvideo', '-pix_fmt', 'gray', '-'], stdout=subprocess.PIPE, bufsize=10**8)
    b = p.stdout.read()
    p.wait()
    return np.frombuffer(b, np.uint8).reshape(-1, TH, TW)[:, Y0:Y1, X0:X1].astype(np.int16)


R = read(RENDER)
print('render', len(R), flush=True)
files = sorted(glob.glob(D + '/09 Cut - 10 min/*.mov'))
assert len(files) == 43
out, pos = [], 0
for fi, fp in enumerate(files):
    c = os.path.basename(fp)[:3]
    S = read(fp)
    n = len(S)
    # The head: which source frame the render's first frames of this clip are.
    probe = R[pos + 3:pos + 18]
    best = (1e9, 0)
    for h in range(0, min(240, n - 20)):
        e = float(np.abs(probe - S[h + 3:h + 3 + len(probe)]).mean())
        if e < best[0] - .02:
            best = (e, h)
    h = best[1]
    # The end: where the render stops being this clip.
    m = min(n - h, len(R) - pos)
    e = np.abs(R[pos:pos + m] - S[h:h + m]).mean(axis=(1, 2))
    base = float(np.median(e[:min(60, m)]))
    gate = max(base * 3, base + 2.5)
    over = e > gate
    end = m
    for t in range(10, m - 2):
        if over[t] and over[t + 1] and over[t + 2]:
            end = t
            break
    if fi == len(files) - 1:  # the last clip runs to the render's end; a still opening can mislead the head search
        end, h = len(R) - pos, n - (len(R) - pos)
    still = float(S[:, ::3, ::3].std(axis=0).mean()) < .6
    out.append(dict(clip=c, start=pos, head=h, length=end, source=n, match=round(best[0], 2), still=still))
    print(c, 'at', pos, 'head', h, 'len', end, 'of', n, 'match', round(best[0], 2), 'STILL' if still else '', flush=True)
    pos += end
print('walked to', pos, 'of', len(R))
json.dump(out, open(f'{OUT}/map.json', 'w'), indent=0)
assert pos == len(R), (pos, len(R))
print('done')
