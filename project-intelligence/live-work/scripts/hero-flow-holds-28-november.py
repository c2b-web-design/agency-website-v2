# THE FLOWING OPENING's HOLDS, FROM A FILM (28 November 2026; Carl: "There appears to be a slight stall after the W on the
# word We"). READ-ONLY. Reads a take filmed by `hero-flow-film-28-november.mjs` (argv[1]: its folder: frames/<ms>.jpg and
# marks.json) and, for the SUBTEXT's two lines (the 2D reveal, then the extrusion over it), reports every HOLD: a stretch
# where the screen produced NO new frame for over HOLD_MS while the line was still being revealed (its ink still to grow).
# Each hold printed with the scene's marks around it. Regions are Carl's window (1896 x 946) at HOME.
# NOT WATCHED: the headline (its fade is a whole-line opacity: measured as mean ink, a hold shown the same way); the 3D's
# growth on its own; anything after argv[2] ms (default 8000).
import json, os, sys
from PIL import Image

folder = sys.argv[1]
until = int(sys.argv[2]) if len(sys.argv) > 2 else 8000
HOLD_MS = 60
REGIONS = {"headline": (100, 380, 760, 570), "subtext 1": (100, 600, 560, 645), "subtext 2": (100, 640, 560, 680)}
fr = os.path.join(folder, "frames")
files = sorted(f for f in os.listdir(fr) if f.endswith(".jpg"))
marks = json.load(open(os.path.join(folder, "marks.json")))
series = {k: [] for k in REGIONS}
for f in files:
    ms = int(f[:-4])
    if ms > until:
        break
    im = Image.open(os.path.join(fr, f)).convert("L")
    for k, box in REGIONS.items():
        c = im.crop(box)
        series[k].append((ms, sum(v for v in c.get_flattened_data() if v > 60) // 1000))
paint = marks.get("first-paint", 0)
print(f"first paint {paint} ms; marks (ms after first paint):")
print("  " + ", ".join(f"{k.replace('hero:', '')} {v - paint}" for k, v in sorted(marks.items(), key=lambda kv: kv[1]) if k.startswith("hero:")))
for k, s in series.items():
    final = max(v for _, v in s) if s else 0
    holds = []
    for i in range(1, len(s)):
        gap = s[i][0] - s[i - 1][0]
        growing = 0 < s[i - 1][1] < final * 0.98
        if gap > HOLD_MS and growing:
            holds.append((s[i - 1][0] - paint, gap, s[i - 1][1], s[i][1]))
    worst = max((h[1] for h in holds), default=0)
    print(f"\n{k}: {len(holds)} holds over {HOLD_MS} ms while revealing, worst {worst} ms")
    for at, gap, a, b in holds:
        near = [f"{m.replace('hero:', '')}@{v - paint}" for m, v in marks.items() if m.startswith("hero:") and -400 <= (v - paint) - at <= gap + 100]
        print(f"  at {at:5d} ms after paint: {gap:4d} ms with no frame (ink {a} -> {b})  {' '.join(near)}")
print("\n(the screencast sends a frame only when the picture changes: a hold while the line is still revealing is the screen FROZEN only if the reveal has no still gaps of its own: check with hero-flow-letter-gaps-28-november.mjs. With 0.12 s letter fades the W-e hold was the schedule, not a freeze)")
