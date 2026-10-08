"""THE FALL, STAGE 2 — from face down on the desk, over the edge, down to the bin's rim. 8 October 2026.
Carl: "let it fall downwards but stop it before it hits the bin. i want to see where on the logo it will make contact
with the bins rim."

A rigid body, free in the vertical plane through the desk's end (it turns about an axis along the desk's right edge):
centre of mass (off, up) and angle theta, under gravity, with PENALTY CONTACTS (stiff spring + damping, Coulomb friction)
against the desk top, the desk's END EDGE (a corner) and the desk's END PANEL. The body's section in that plane is the
mark's thickness-by-height rectangle (227.9 x 16.7 mm). The RIM test uses the real mesh (every 3rd vertex).
⛔ FIRST ATTEMPT, kept as a finding: a no-slip pivot on the edge held the mark until 78° past face-down, hung it down the
end panel, and missed the bin — friction 0.4 would have let it slide from 14°. So the edge must be able to SLIDE.

Room millimetres: u along the back wall (the letters run along it), off out from the back wall (toward the camera), up
from the floor. Theta: 0 upright facing the camera, 90 face down, 180 upside down with its back to the camera.
The mark: 227.9 mm tall, centred at u -312.5; stage 1 left it face down with its base 65 mm in from the desk's end.
The rim: assumed 280 mm across (a standard bin; the plate cannot fix its size), which the plate puts 368 mm up, centred
u -250, 174 mm out from the desk's end (desk-right-end-measure-8-october.py).
⚠ Not modelled: the tip's own speed at landing (it starts from rest face down — stage 1 had gravity suspended), air,
3D effects across the letters. The SHAPE of the motion is physical; its playback speed is not fixed by this.
Usage: python desk-mark-fall-to-bin-8-october.py <mark-verts.json> [mu]   (writes the trajectory beside the input)"""
import json
import math
import os
import sys

import numpy as np

H = 227.9
U_C = -312.5
DESK_END, DESK_TOP, DESK_U = 1875.0, 750.0, (-625.0, 0.0)
FACE_IN = 65.0
# ⛔ THE BIN'S SIZE IS A CHOICE THE PLATE ALLOWS, NOT A MEASUREMENT (desk-right-end-measure-8-october.py): every size sits
# on the same line of sight. BIN_DIA (env) picks one; the plate then fixes the rest. 280 is the first take.
BIN_TABLE = {240: dict(u=-539.0, off=1875.0 + 347.0, up=478.0), 260: dict(u=-397.0, off=1875.0 + 262.0, up=424.0),
             280: dict(u=-250.0, off=1875.0 + 174.0, up=368.0)}
BIN_DIA = int(os.environ.get("BIN_DIA", "280"))
RIM = dict(**BIN_TABLE[BIN_DIA], r=BIN_DIA / 2, tube=6.0)
TAG = "" if BIN_DIA == 280 else f"-bin{BIN_DIA}"
G = 9810.0
MU = float(sys.argv[2]) if len(sys.argv) > 2 else 0.4
K, C = 4e6, 2 * math.sqrt(4e6) * 0.7   # contact stiffness (per unit mass, mm/s^2 per mm) and damping

data = json.load(open(sys.argv[1]))
V = np.array(data["v"], dtype=float).reshape(-1, 3) * H
ZP = data["depth"] * H
face = V[np.abs(V[:, 2] - ZP) < 0.05]
yc, zc = face[:, 1].mean(), ZP / 2
kc2 = face[:, 1].var() + ZP ** 2 / 12

def to_world(y, z, theta, com):
    """body local (y up the mark, z back->face) relative to the COM -> world (off, up)."""
    dy, dz = y - yc, z - zc
    return (com[0] + dz * math.cos(theta) + dy * math.sin(theta), com[1] - dz * math.sin(theta) + dy * math.cos(theta))

def to_local(off, up, theta, com):
    do, du = off - com[0], up - com[1]
    # inverse of the rotation above
    dz = do * math.cos(theta) - du * math.sin(theta)
    dy = do * math.sin(theta) + du * math.cos(theta)
    return yc + dy, zc + dz

CORNERS = [(0.0, 0.0), (0.0, ZP), (H, 0.0), (H, ZP)]

def contact_force(p, vp, n, depth):
    """penalty contact at world point p moving at vp, outward normal n (into free space), penetration depth > 0."""
    vn = vp @ n
    N = max(0.0, K * depth - C * vn)
    t = np.array([-n[1], n[0]])
    vt = vp @ t
    Ft = -MU * N * math.tanh(vt / 2.0)
    return N * n + Ft * t

def point_velocity(p, com, v, w):
    r = p - com
    # d/dt of rotation: theta increases -> see to_world; velocity of a body point = v + w x r in this 2D convention
    return v + w * np.array([-r[1], r[0]]) * -1.0

# sanity of the velocity convention: a point above the COM at theta 0 must move toward +off as theta increases
_c = np.array([0.0, 0.0]); _p = np.array(to_world(yc + 10, zc, 0.0, _c)); _p2 = np.array(to_world(yc + 10, zc, 1e-6, _c))
_num = (_p2 - _p) / 1e-6
_ana = point_velocity(_p, _c, np.zeros(2), 1.0)
assert np.allclose(_num, _ana, atol=1e-3), (_num, _ana)

# start: face down at rest, base 65 mm in from the desk's end (stage 1's end state)
theta = math.pi / 2
base_off = DESK_END - FACE_IN
com = np.array([base_off + yc, DESK_TOP + (ZP - zc)])
v, w = np.zeros(2), 0.0
t, dt = 0.0, 2e-6
traj = []
left_desk = None
contact = None
panel = False
next_rim_check = 0.0
while t < 2.0:
    F = np.array([0.0, -G])
    tau = 0.0
    # corners against the desk top and the end panel
    for (y, z) in CORNERS:
        p = np.array(to_world(y, z, theta, com))
        vp = point_velocity(p, com, v, w)
        if p[0] < DESK_END and p[1] < DESK_TOP and p[1] > DESK_TOP - 40 and (DESK_END - p[0]) > (DESK_TOP - p[1]):
            f = contact_force(p, vp, np.array([0.0, 1.0]), DESK_TOP - p[1])       # on the desk top
        elif p[0] < DESK_END and p[1] < DESK_TOP and (DESK_END - p[0]) <= (DESK_TOP - p[1]):
            f = contact_force(p, vp, np.array([1.0, 0.0]), DESK_END - p[0])       # into the end panel
            panel = True
        else:
            continue
        F += f
        r = p - com
        tau += -(r[0] * f[1] - r[1] * f[0])
    # the desk's edge (a corner) against the mark's rectangle
    ly, lz = to_local(DESK_END, DESK_TOP, theta, com)
    if 0.0 < ly < H and 0.0 < lz < ZP:
        dists = {"face": ZP - lz, "back": lz, "base": ly, "top": H - ly}
        side = min(dists, key=dists.get)
        nl = {"face": (0.0, 1.0), "back": (0.0, -1.0), "base": (-1.0, 0.0), "top": (1.0, 0.0)}[side]  # body outward (dy, dz)
        # the body's outward normal in world, then the force ON THE BODY is along -that
        nw = np.array([nl[1] * math.cos(theta) + nl[0] * math.sin(theta), -nl[1] * math.sin(theta) + nl[0] * math.cos(theta)])
        p = np.array([DESK_END, DESK_TOP])
        vp = point_velocity(p, com, v, w)
        f = contact_force(p, vp, -nw, dists[side])
        F += f
        r = p - com
        tau += -(r[0] * f[1] - r[1] * f[0])
    v += F * dt
    w += tau / kc2 * dt
    com += v * dt
    theta += w * dt
    t += dt
    if left_desk is None:
        ly2, lz2 = to_local(DESK_END, DESK_TOP, theta, com)
        lowest = min(to_world(y, z, theta, com)[1] for y, z in CORNERS)
        if not (0.0 <= ly2 <= H + 1 and -1 <= lz2 <= ZP + 1) and com[0] > DESK_END and lowest < DESK_TOP - 5:
            left_desk = (t, math.degrees(theta), math.degrees(w))
    if len(traj) == 0 or t - traj[-1][0] >= 1e-3:
        traj.append((t, com[0], com[1], theta))
    if t >= next_rim_check:
        next_rim_check = t + 2e-4
        off, up = to_world(V[:, 1], V[:, 2], theta, com)
        u = U_C + V[:, 0]
        rho = np.hypot(u - RIM["u"], off - RIM["off"])
        dist = np.hypot(rho - RIM["r"], up - RIM["up"])
        i = int(np.argmin(dist))
        if dist[i] <= RIM["tube"]:
            contact = (t, theta, i, com.copy())
            break
        if up.min() < 0:
            break

print(f"mu {MU}; centre of mass {yc:.1f} mm up its height, k_c {math.sqrt(kc2):.1f} mm")
if left_desk:
    print(f"LEAVES THE DESK at {left_desk[0] * 1000:.0f} ms, {left_desk[1] - 90:.0f} deg past face-down, spinning {left_desk[2]:.0f} deg/s")
print(f"touched the end panel: {'YES' if panel else 'no'}")
if not contact:
    print(f"NO CONTACT with the rim (stopped at {t * 1000:.0f} ms; lowest point {up.min():.0f} mm up, COM off {com[0]:.0f})")
    sys.exit(0)
t, th, i, c = contact
x, y, z = V[i] / H
print(f"REACHES THE RIM at {t * 1000:.0f} ms after face-down, {math.degrees(th):.0f} deg from upright ({math.degrees(th) - 180:+.0f} from upside down)")
print(f"CONTACT POINT (mark units: x -0.96 c … +0.96 b; y 0 base … 1 top; z 0 back … {data['depth']:.3f} face): x {x:+.3f}, y {y:.3f}, z {z:.3f}")
print(f"  room: u {U_C + V[i, 0]:.0f} (rim u {RIM['u']:.0f} ± {RIM['r']:.0f}); COM off {c[0]:.0f}, up {c[1]:.0f}")
out = os.path.join(os.path.dirname(sys.argv[1]), f"fall-trajectory{TAG}.json")
json.dump({"mu": MU, "com_local": [yc / H, zc / H], "rows": [[round(a, 4), round(b, 2), round(cc, 2), round(d, 5)] for a, b, cc, d in traj],
           "contact": {"t": t, "theta": th, "local": [x, y, z]}}, open(out, "w"))
print("trajectory:", out, len(traj), "rows")

# ── STAGE 3 (Carl, 8 October: "continue so that the flat back is on the rim. then stop, we need to see how much hangs over
# the edge of the bons rim"). From the contact, it turns on forward about the contact point P (the top of the b's bowl, on
# the far side of the rim) under gravity, keeping its spin, until its BACK lies flat: theta = 270 deg (back down, face up),
# the back plane on the rim's top. Then: is it SUPPORTED (solid back over the rim on both sides of its centre of mass), and
# how far does it hang PAST the rim?
print("\n-- stage 3: onto its back, on the rim --")
off_all, up_all = to_world(V[:, 1], V[:, 2], th, c)
P = np.array([off_all[i], up_all[i]])
pl = (V[i, 1], V[i, 2])                         # P in body local (y, z)
# ⛔ THE STRIKE COSTS ENERGY (Carl, 8 October: "Yrs, the energy."). A strike that does not bounce conserves ANGULAR MOMENTUM
# ABOUT THE STRIKE POINT: L_P = I_c w + m (R_up v_off - R_off v_up), R = COM - P (this script's sign convention: a body point
# moves at w * (r_up, -r_off) about the COM). The spin after the strike is L_P / I_P. (Before this, the spin was kept
# through the strike — "no energy lost", the take Carl saw first.)
R = np.array(to_world(yc, zc, th, c)) - np.array([off_all[i], up_all[i]])
v_strike = v.copy()
L_P = kc2 * w + (R[1] * v_strike[0] - R[0] * v_strike[1])
kP2_0 = kc2 + float(R @ R)
w3 = L_P / kP2_0
e_before = 0.5 * (v_strike @ v_strike) + 0.5 * kc2 * w * w
e_after = 0.5 * kP2_0 * w3 * w3
print(f"THE STRIKE: spin {math.degrees(w):.0f} deg/s and the centre of mass moving {np.linalg.norm(v_strike):.0f} mm/s before; "
      f"spin about the strike point {math.degrees(w3):.0f} deg/s after; kinetic energy kept {100 * e_after / e_before:.0f}%")
th3, t3 = th, 0.0
rows3 = []
def com_rel_P(theta):
    return np.array(to_world(yc, zc, theta, np.array([0.0, 0.0]))) - np.array(to_world(pl[0], pl[1], theta, np.array([0.0, 0.0])))
kP2 = kc2 + float(np.sum(com_rel_P(th3) ** 2))
while th3 < 1.5 * math.pi:
    e = 1e-6
    dup = (com_rel_P(th3 + e)[1] - com_rel_P(th3 - e)[1]) / (2 * e)
    w3 += -G * dup / kP2 * 1e-5
    th3 += w3 * 1e-5
    t3 += 1e-5
    if len(rows3) == 0 or t3 - rows3[-1][0] >= 1e-3:
        comw = P + com_rel_P(th3)
        rows3.append((t3, comw[0], comw[1], th3))
th3 = 1.5 * math.pi
comw = P + com_rel_P(th3)
rows3.append((t3, comw[0], comw[1], th3))
print(f"onto its back {t3 * 1000:.0f} ms after the strike")
off3, up3 = to_world(V[:, 1], V[:, 2], th3, comw)
u3 = U_C + V[:, 0]
back = np.abs(V[:, 2]) < 0.3                    # the back's vertices
rho = np.hypot(u3 - RIM["u"], off3 - RIM["off"])
print(f"resting: the back at {up3[back].mean():.0f} mm up (rim top {RIM['up'] + RIM['tube']:.0f}); centre of mass at u {U_C + 0:.0f}… off {comw[0]:.0f}")
# support: back points over the rim ring (within the tube of the ring line)
on_ring = back & (np.abs(rho - RIM["r"]) <= RIM["tube"])
cu_ = U_C + np.mean(V[:, 0])
com_u = U_C + 0.0
print(f"back points over the rim: {int(on_ring.sum())} — spanning u {u3[on_ring].min():.0f}…{u3[on_ring].max():.0f}, off {off3[on_ring].min():.0f}…{off3[on_ring].max():.0f}")
com_uv = np.array([U_C, comw[0]])
print(f"   centre of mass at (u {com_uv[0]:.0f}, off {com_uv[1]:.0f}); rim centre (u {RIM['u']:.0f}, off {RIM['off']:.0f}), radius {RIM['r']:.0f}")
# overhang: the mark's footprint beyond the rim's OUTER edge
outer = RIM["r"] + RIM["tube"]
beyond = rho - outer
print(f"OVERHANG past the rim's outer edge: furthest {beyond.max():.0f} mm; "
      f"left (u below the rim) {max(0, RIM['u'] - RIM['r'] - u3.min()):.0f} mm, right {max(0, u3.max() - RIM['u'] - RIM['r']):.0f} mm, "
      f"toward the desk {max(0, RIM['off'] - RIM['r'] - off3.min()):.0f} mm, toward the camera {max(0, off3.max() - RIM['off'] - RIM['r']):.0f} mm")
print(f"   the mark's footprint: u {u3.min():.0f}…{u3.max():.0f} (rim {RIM['u'] - RIM['r']:.0f}…{RIM['u'] + RIM['r']:.0f}), off {off3.min():.0f}…{off3.max():.0f} (rim {RIM['off'] - RIM['r']:.0f}…{RIM['off'] + RIM['r']:.0f})")
inside = back & (rho < RIM["r"] - RIM["tube"])
print(f"   of the back's sample points: {100 * (back & (rho > outer)).sum() / back.sum():.0f}% outside the rim, {100 * inside.sum() / back.sum():.0f}% over the opening")
out = os.path.join(os.path.dirname(sys.argv[1]), f"fall-trajectory{TAG}.json")
d = json.load(open(out))
d["stage3"] = {"rows": [[round(a, 4), round(b, 2), round(cc, 2), round(dd, 5)] for a, b, cc, dd in rows3], "P": [float(P[0]), float(P[1])]}
json.dump(d, open(out, "w"))
print("stage 3 rows:", len(rows3))
