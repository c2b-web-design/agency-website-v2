"""Write a somersault run (desk-mark-somersault-3d-8-october.py `run …` output) into about-room.ts as DESK_MARK_SOMERSAULT:
rows [ms after the nudge, COM u mm, up mm, off mm, qx, qy, qz, qw] every 4 ms (the orientation from the run's rotation
matrices, in the room's (u, up, off) frame = the mark's yaw frame in the scene). Replaces the block if present.
Usage: python desk-mark-somersault-to-room-8-october.py <run.json> <search-line-for-the-comment>"""
import json
import math
import sys

d = json.load(open(sys.argv[1]))
note = sys.argv[2] if len(sys.argv) > 2 else ""
psi, face_in, u_c, nudge = d["params"]
ex = d["exit"]


def quat(m):
    m = [m[0:3], m[3:6], m[6:9]]
    tr = m[0][0] + m[1][1] + m[2][2]
    if tr > 0:
        s = math.sqrt(tr + 1.0) * 2
        return ((m[2][1] - m[1][2]) / s, (m[0][2] - m[2][0]) / s, (m[1][0] - m[0][1]) / s, 0.25 * s)
    i = max(range(3), key=lambda k: m[k][k])
    if i == 0:
        s = math.sqrt(1.0 + m[0][0] - m[1][1] - m[2][2]) * 2
        return (0.25 * s, (m[0][1] + m[1][0]) / s, (m[0][2] + m[2][0]) / s, (m[2][1] - m[1][2]) / s)
    if i == 1:
        s = math.sqrt(1.0 + m[1][1] - m[0][0] - m[2][2]) * 2
        return ((m[0][1] + m[1][0]) / s, 0.25 * s, (m[1][2] + m[2][1]) / s, (m[0][2] - m[2][0]) / s)
    s = math.sqrt(1.0 + m[2][2] - m[0][0] - m[1][1]) * 2
    return ((m[0][2] + m[2][0]) / s, (m[1][2] + m[2][1]) / s, 0.25 * s, (m[1][0] - m[0][1]) / s)


rows = d["rows"]
keep = [r for i, r in enumerate(rows) if i % 4 == 0]
if keep[-1] is not rows[-1]:
    keep.append(rows[-1])
prev = None
lines = []
for r in keep:
    q = quat(r[4:13])
    if prev is not None and sum(a * b for a, b in zip(q, prev)) < 0:  # keep the hemisphere continuous for slerp
        q = tuple(-x for x in q)
    prev = q
    lines.append("  [" + ", ".join(f"{x:g}" for x in [round(r[0], 1), round(r[1], 2), round(r[2], 2), round(r[3], 2)] + [round(x, 5) for x in q]) + "]")
block = f'''/**
 * ⛔ THE SOMERSAULT — A FULL 3D RIGID-BODY RUN FROM UPRIGHT ON THE DESK TO OUT OF THE FRAME'S BOTTOM (Carl, 8 October
 * 2026): *"it needs to be facing us and the right way up. Does the bin have to be involved? No. But from facing us and
 * falling it must somewhow flip to face us again"* → *"try it and show me"*. SIMULATED, not keyframed:
 * `live-work/scripts/desk-mark-somersault-3d-8-october.py` (gravity; penalty contacts with friction μ 0.4 against the desk's
 * top, END and FRONT edges and END PANEL, the right wall, the floor and the 280 mm bin), chosen from its SEARCH over the
 * start's angle, place and the scroll's nudge; written by `desk-mark-somersault-to-room-8-october.py`.
 * THIS RUN: yaw ψ {psi:+g}° from facing the camera (+ = turned toward the room), its face {face_in:g} mm in from the desk's end,
 * its centre at u {u_c:g}, nudged {nudge:g} rad/s forward. At the frame's bottom ({ex["t"] * 1000:.0f} ms): FACING the camera
 * {ex["facing"]:+.2f}, UPRIGHT {ex["upright"]:+.2f} (1 = square on / the right way up). {note}
 * Rows: [ms after the nudge, centre of mass u mm, up mm, off mm, qx, qy, qz, qw] — the orientation maps the mark's local axes
 * (x along the letters, y up it, z back → face) into the room's (u, up, off), the mark's yaw frame in the scene.
 * `comLocal`: the centre of mass in mark units (x, y, z).
 */
export const DESK_MARK_SOMERSAULT = {{
  params: {{ psiDeg: {psi:g}, faceInMm: {face_in:g}, uCentreMm: {u_c:g}, nudgeRadS: {nudge:g} }},
  exit: {{ ms: {ex["t"] * 1000:.1f}, facing: {ex["facing"]:.3f}, upright: {ex["upright"]:.3f} }},
  comLocal: [{d["com_local"][0]:.5f}, {d["com_local"][1]:.5f}, {d["com_local"][2]:.5f}] as const,
  rows: [
{",\n".join(lines)},
  ] as readonly (readonly [number, number, number, number, number, number, number, number])[],
}};
'''
f = "components/about/about-room.ts"
s = open(f, encoding="utf-8").read()
marker = "/**\n * ⛔ THE SOMERSAULT — A FULL 3D"
if marker in s:
    s = s[: s.index(marker)].rstrip("\n") + "\n"
s = s.rstrip("\n") + "\n\n" + block
open(f, "w", encoding="utf-8").write(s)
print(f"written: {len(lines)} rows, exit {ex['t'] * 1000:.0f} ms, facing {ex['facing']:+.2f}, upright {ex['upright']:+.2f}")
