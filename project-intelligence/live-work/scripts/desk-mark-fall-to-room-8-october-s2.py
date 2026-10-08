"""THE FALL INTO THE ROOM — writes a fall-trajectory JSON (desk-mark-fall-to-bin-8-october.py) into `DESK_MARK_FALL`
(components/about/about-room.ts): stage 2 every 4 ms to the strike, then stage 3 every ~4 ms to the rest on the rim.
8 October 2026, session 2 (Carl: "make it now so the flat back sits on the rim and stop" — at 50 mm left).
Usage: python desk-mark-fall-to-room-8-october-s2.py <fall-trajectory.json> [--check]  (--check: compare, don't write)"""
import json, re, sys
d = json.load(open(sys.argv[1]))
r2, r3, c = d["rows"], d["stage3"]["rows"], d["contact"]
cms = round(c["t"] * 1000, 1)
rows = [[round(t * 1000), o, u, th] for j, (t, o, u, th) in enumerate(r2) if j % 4 == 0]
rows += [[round(cms + t * 1000, 1), o, u, th] for i, (t, o, u, th) in enumerate(r3) if i % 4 == 3 or i == len(r3) - 1]
rest = rows[-1][0]
p = "components/about/about-room.ts"
s = open(p, encoding="utf-8").read()
m = re.search(r"export const DESK_MARK_FALL = \{.*?\n\};\n", s, re.S)
old = m.group(0)
old_rows = [list(map(float, x)) for x in re.findall(r"\[([\d.]+), ([\d.]+), ([\d.]+), ([\d.]+)\]", old)]
n2 = sum(1 for r in rows if r[0] <= cms)
same = all(abs(a - b) < 0.02 for ra, rb in zip(rows[:n2], old_rows[:n2]) for a, b in zip(ra, rb))
print(f"stage 2 rows ({n2}) identical to the room's: {same}; contact {cms} ms; rest {rest} ms; {len(rows)} rows")
if "--check" in sys.argv: sys.exit(0)
fmt = lambda v: f"{v:g}"
body = "\n".join(f"  [{fmt(a)}, {fmt(b)}, {fmt(cc)}, {fmt(dd)}]," for a, b, cc, dd in rows)
x, y, z = c["local"]
new = (f"export const DESK_MARK_FALL = {{\n  comLocal: [{d['com_local'][0]:.5f}, {d['com_local'][1]:.5f}] as const,\n"
       f"  contactMs: {cms},\n  restMs: {rest},\n  contactLocal: [{x:.4f}, {y:.4f}, {z:.4f}] as const,\n  rows: [\n{body}\n"
       f"  ] as readonly (readonly [number, number, number, number])[],\n}};\n")
open(p, "w", encoding="utf-8", newline="").write(s.replace(old, new))
print("written")
