"""THE MARK STANDING ON THE CORNER'S DIAGONAL, AND FACE DOWN FROM THERE (Carl, 8 October 2026, with a sketch: the desk's
front and end edges meeting at the front-right corner, the mark STANDING between them facing the corner and the camera:
"The bottom edge of the yellow is the bottom of the logo. so its standing upright. from there it must fall face down").
psi -45 (the corner's bisector; 0 faces the end edge, -90 the front edge): the face's front-bottom edge, at mid-letters,
D mm in from BOTH edges. Finds the smallest D whose base stands on the desk; then tips it 90° forward about that edge
(stage 1's tip) and reports, face down: how far it hangs past each edge, and where its centre of mass lies.
Usage: python desk-mark-corner-place-8-october.py <mark-verts.json> [psi]"""
import json, math, sys
import numpy as np
H = 227.9
FRONT, END = -625.0, 1875.0
d = json.load(open(sys.argv[1]))
V = np.array(d["v"], dtype=float).reshape(-1, 3) * H
ZP = d["depth"] * H
psi = math.radians(float(sys.argv[2]) if len(sys.argv) > 2 else -45.0)
face = V[np.abs(V[:, 2] - ZP) < 0.05]
com = np.array([face[:, 0].mean(), face[:, 1].mean(), ZP / 2])
def Ry(a):
    c, s = math.cos(a), math.sin(a); return np.array([[c, 0, s], [0, 1, 0], [-s, 0, c]])
def Rx(a):
    c, s = math.cos(a), math.sin(a); return np.array([[1, 0, 0], [0, c, -s], [0, s, c]])
R0 = Ry(psi)
edge = np.array([0.0, 0.0, ZP])                     # the face's front-bottom edge, mid-letters (local)
base = V[V[:, 1] < 1.0]
def place(D):
    target = np.array([FRONT + D, 750.0, END - D])
    return target - R0 @ edge                        # world position of the local origin
for D in range(0, 400):
    o = place(D)
    b = o + base @ R0.T
    if b[:, 0].min() >= FRONT and b[:, 2].max() <= END:
        break
o = place(D)
print(f"psi {math.degrees(psi):.0f}: smallest D with the whole base on the desk = {D} mm from each edge")
c_up = o + R0 @ com
print(f"  standing: centre of mass {c_up[0] - FRONT:.0f} mm in from the front edge, {END - c_up[2]:.0f} mm in from the end edge")
# face down: rotate 90° about the local x axis through the edge
Rf = R0 @ Rx(math.pi / 2)
pivot = o + R0 @ edge
pts = pivot + (V - edge) @ Rf.T
cf = pivot + Rf @ (com - edge)
print(f"  FACE DOWN: centre of mass {cf[0] - FRONT:+.0f} mm from the front edge, {END - cf[2]:+.0f} mm from the end edge  (negative = PAST that edge)")
print(f"  hangs past the FRONT edge by {max(0, FRONT - pts[:, 0].min()):.0f} mm, past the END edge by {max(0, pts[:, 2].max() - END):.0f} mm")
print(f"  share of the mark's points past the front edge {100 * np.mean(pts[:, 0] < FRONT):.0f}%, past the end {100 * np.mean(pts[:, 2] > END):.0f}%")
print(json.dumps({"psi": math.degrees(psi), "D": D}))
