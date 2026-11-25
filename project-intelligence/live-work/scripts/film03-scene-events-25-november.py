"""THE SCENE's EVENTS, PRINTED FROM ITS CLOCK (25 November 2026, session 2; D-101's 16 November ruling: the event list is printed
from the scene's clock, never typed). Reads `state.jsonl` from film03-scene-log-25-november.mjs and prints every change of
state: a switch on or off, a value appearing (or first set from -1), a 0-1 share starting, half and complete, a counter
stepping. Plus the ARRIVAL's own moments (lift-off, touchdown, settled) from the numbers the scene reports for it. Two clocks,
SMPTE at 30 fps non-drop: FILM (from the dark: the opening's first frame) and STORY (zero at the lean: the opening's end).

Take 2 of the printer (the same day): take 1 missed values set once (new keys, -1 -> t), read the plinth's rise in cm as a
share, and filtered the drying and the floor's extents as noise.

Run:  python -I film03-scene-events-25-november.py <capture folder>     -> <folder>/events.md
"""
import json, pathlib, sys

FPS = 30
NOISE = {"t", "stepsLastFrame", "pairsLastFrame", "handCm", "handYCm", "intensityWorld", "active", "weight",
         "unitsPerMetre", "lightAt", "centre", "map", "precompile", "cells", "count", "boxCm", "emitters",
         "heatEmitters", "maskCells", "solidCells", "maskBuildMs", "gpuMB", "warmMs", "stepped", "dropped", "addedLevels",
         "minCornerAboveFloorCm", "apexCm", "backCm", "logoBackCm", "clothPathCm", "cellCm", "env", "liquidReachCm",
         "strengths", "poolHits", "pool", "width", "depth", "height", "placed", "ready", "dropCm", "filledS"}
# continuous 0..1 shares: starts / half / complete / back to 0
SHARES = {"lit", "logoOpacity", "filled", "hardness", "wash", "reveal", "risenShare", "shown", "front", "back", "extents"}


def smpte(frame):
    sign = "-" if frame < 0 else ""
    s, ff = divmod(abs(frame), FPS)
    m, ss = divmod(s, 60)
    h, mm = divmod(m, 60)
    return f"{sign}{h:02d}:{mm:02d}:{ss:02d}:{ff:02d}"


def flat(o, pre=""):
    out = {}
    if isinstance(o, dict):
        for k, v in o.items():
            out.update(flat(v, f"{pre}.{k}" if pre else k))
    elif isinstance(o, list) and all(isinstance(x, (int, float)) or x is None for x in o) and len(o) <= 8:
        for i, v in enumerate(o):
            out[f"{pre}[{i}]"] = v
    else:
        out[pre] = o
    return out


def leaf(key):
    return key.split(".")[-1].split("[")[0]


def main(folder):
    folder = pathlib.Path(folder)
    rows = [json.loads(l) for l in (folder / "state.jsonl").read_text(encoding="utf-8").splitlines() if l.strip()]
    for r in rows:  # the plinth's rise as a share of its height
        pc = ((r["s"].get("marble") or {}).get("plinthCm")) or {}
        if pc.get("height"):
            pc["risenShare"] = round(pc.get("risen", 0) / pc["height"], 4)
            pc.pop("risen", None)
    story0 = next((r["f"] for r in rows if (r["s"].get("opening") or {}).get("done")), None)
    events, prev = [], {}
    for r in rows:
        f, cur = r["f"] + 1, flat(r["s"])  # state after f+1 steps of 1/30 s
        for k, v in cur.items():
            L = leaf(k)
            if k not in prev:
                if r["f"] > 0 and L not in NOISE and v is not None:
                    events.append((f, k, f"set: {v}"))
                prev[k] = v
                continue
            p = prev[k]
            msg = None
            if L in SHARES and isinstance(v, (int, float)) and isinstance(p, (int, float)):
                if p <= 0 < v: msg = "starts"
                elif p < 0.5 <= v: msg = "half"
                elif p < 0.999 <= v: msg = "complete"
                elif p > 0 >= v: msg = "back to 0"
            elif L in NOISE:
                pass
            elif isinstance(v, bool) or isinstance(p, bool):
                if v != p: msg = f"{p} -> {v}"
            elif p is None and v is not None:
                msg = f"set: {v}"
            elif p is not None and v is None:
                msg = "cleared"
            elif isinstance(v, (int, float)) and isinstance(p, (int, float)) and v != p:
                if p < 0 <= v: msg = f"set: {v}"
                elif isinstance(v, int) and isinstance(p, int) and abs(v - p) <= 3: msg = f"{p} -> {v}"
                elif p == 0 or v == 0: msg = f"{p} -> {v}"
            if msg:
                events.append((f, k, msg))
            prev[k] = v
    # THE ARRIVAL's moments, from the scene's own numbers for it (story seconds)
    if story0 is not None:
        arr = next((r["s"].get("arrival") for r in rows if r["s"].get("arrival")), None)
        if arr:
            for name, key in (("lift-off (the jump)", "holdS"), ("touchdown", "touchdownS"), ("settled (the wobble done)", "durationS")):
                events.append((story0 + 1 + round(arr[key] * FPS), f"arrival.{key}", f"{name}: story {arr[key]} s"))
    events.sort(key=lambda e: e[0])
    out = ["# The scene's events, printed from its clock", "",
           f"From `{folder.name}`: {len(rows)} frames at {FPS} fps, frame-stepped from the dark, at HOME. FILM = from the dark; "
           f"STORY = zero at the lean (the opening's end, film {smpte(story0 + 1) if story0 is not None else '?'}). SMPTE, "
           f"{FPS} fps non-drop. Printed by `film03-scene-events-25-november.py`; nothing typed.", "",
           "| Film | Story | Read-out | Change |", "|---|---|---|---|"]
    for f, k, msg in events:
        st = smpte(f - (story0 + 1)) if story0 is not None else ""
        out.append(f"| {smpte(f)} | {st} | `{k}` | {msg} |")
    (folder / "events.md").write_text("\n".join(out) + "\n", encoding="utf-8")
    print(folder / "events.md", len(events), "events")


if __name__ == "__main__":
    main(sys.argv[1])
