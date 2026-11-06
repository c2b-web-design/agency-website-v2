"""film4-captions-layer.mov read back: frame count, and for every caption its alpha at the midpoint, half way through the fade in and the
fade out, and on the frame between it and the next line; where it sits against the file; the yellow on caption 28.
   python film04-layer-readback-2-november.py
NOT WATCHED: how Resolve composites it (free Resolve reads the premultiplied file as straight: fades land squared, ruled fine on film 02)."""
import json, os, subprocess
import numpy as np

SUB = os.path.expanduser('~/Videos/C2B Films/04 Extruded lettering/10 Subtitles')
L = SUB + '/film4-captions-layer.mov'
W, H = 1920, 1080
rows = json.load(open(SUB + '/film4-captions-rows.json', encoding='utf8'))
n = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=nb_frames,pix_fmt,codec_name', '-of', 'csv=p=0', L],
                   capture_output=True, text=True).stdout.strip()
print('stream', n)


def grab(f):
    r = subprocess.run(['ffmpeg', '-v', 'error', '-ss', f'{(f + .5) / 30:.4f}', '-i', L, '-frames:v', '1', '-vf', 'format=rgba', '-f', 'rawvideo', '-'],
                       capture_output=True)
    return np.frombuffer(r.stdout, np.uint8).reshape(H, W, 4)


bad, half_in, half_out = [], [], []
for i, r in enumerate(rows):
    m = grab((r['a'] + r['b']) // 2)
    al = m[..., 3]
    if al.max() < 250:
        bad.append((r['i'], 'mid', int(al.max())))
    ys, xs = np.where(al > 128)
    if abs((xs.min() + xs.max()) / 2 - r['cx']) > 8 or abs((ys.min() + ys.max()) / 2 - r['cy']) > 45:
        bad.append((r['i'], 'place', int(xs.min()), int(xs.max()), int(ys.min()), int(ys.max()), r['cx'], r['cy']))
    half_in.append(int(grab(r['a'] + 15)[..., 3].max()))
    half_out.append(int(grab(r['b'] - 8)[..., 3].max()))
    if i + 1 < len(rows):
        gap = (r['b'] + rows[i + 1]['a']) // 2
        g = int(grab(gap)[..., 3].max())
        if g:
            bad.append((r['i'], 'gap', gap, g))
print('half way in', min(half_in), max(half_in), 'half way out', min(half_out), max(half_out))
y = next(r for r in rows if r['dark'])
m = grab((y['a'] + y['b']) // 2)
px = m[m[..., 3] > 250][:, :3]
print('caption', y['i'], y['clip'], 'solid pixels', len(px), 'mean RGB', px.mean(0).round(1))
o = rows[y['i']]  # the next caption stays white
m = grab((o['a'] + o['b']) // 2)
print('caption', o['i'], 'mean RGB', m[m[..., 3] > 250][:, :3].mean(0).round(1))
print('first frame alpha', int(grab(0)[..., 3].max()), 'last frame alpha', int(grab(15458)[..., 3].max()))
print('faults', bad)
