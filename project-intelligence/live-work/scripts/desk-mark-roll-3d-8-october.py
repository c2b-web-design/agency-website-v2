"""THE FALL, STAGE 4 — IN 3D, FROM JUST BEFORE THE STRIKE: the left side falls off the bin, the right rises, the spin
turns it to face the camera. 8 October 2026.
Carl: "now its left side needes to fall off the bin and its right side needs to rise up and its momentum spin it so the
logo is facing us. Use 50% speed."

⛔ WHY 3D. Stages 2–3 (desk-mark-fall-to-bin-8-october.py) are a 2D body turning end over end. But the strike point (the
top of the b's bowl) sits ~49 mm to the RIGHT of the centre of mass along the letters, so the rim's push also ROLLS the
mark — right side up, left side down: Carl's motion, from the physics. The 2D model cannot see that.

A rigid body in 3D (inertia tensor from the mark's own face grid, a slab of its thickness), started 20 ms BEFORE the 2D
strike with the 2D state (centre of mass, angle, velocities), under gravity, with penalty contacts and friction against:
the bin's RIM (a torus: 280 mm across — ASSUMED, see the measure script — 6 mm lip, 368 mm up, centred u -250, off 2049),
the bin's WALL (a cylinder shell below the rim), the FLOOR, and the desk's END PANEL. Sample points: every 20th exported
vertex. World axes (u, up, off) — the mark's yaw frame, right-handed; the mark's local x along the letters, y up it,
z back -> face. Runs until the FACE turns toward the camera (or 1.5 s), records the motion every 1 ms.
⚠ Not modelled: air; the rim's give; the bin moving. The bin's SIZE is assumed.
Usage: python desk-mark-roll-3d-8-october.py <mark-verts.json> <fall-trajectory.json>"""
import json
import math
import os
import sys

import numpy as np

H = 227.9
U_C = -312.5
DESK_END, DESK_TOP = 1875.0, 750.0
# ⛔ THE BIN'S SIZE IS A CHOICE THE PLATE ALLOWS, NOT A MEASUREMENT (desk-right-end-measure-8-october.py): every size sits
# on the same line of sight. BIN_DIA (env) picks one; the plate then fixes the rest. 280 is the first take.
BIN_TABLE = {240: dict(u=-539.0, off=1875.0 + 347.0, up=478.0), 260: dict(u=-397.0, off=1875.0 + 262.0, up=424.0),
             280: dict(u=-250.0, off=1875.0 + 174.0, up=368.0)}
BIN_DIA = int(os.environ.get("BIN_DIA", "280"))
RIM = dict(**BIN_TABLE[BIN_DIA], r=BIN_DIA / 2, tube=6.0)
TAG = "" if BIN_DIA == 280 else f"-bin{BIN_DIA}"
G = 9810.0
MU = 0.4
K = 4e6
C = 2 * math.sqrt(K) * 0.7
CAMERA = np.array([-2283.0, 1139.4, 3260.0])          # (u, up, off), room mm — from the solved camera

data = json.load(open(sys.argv[1]))
traj = json.load(open(sys.argv[2]))
V = np.array(data["v"], dtype=float).reshape(-1, 3) * H     # local (x, y, z) mm
ZP = data["depth"] * H
face = V[np.abs(V[:, 2] - ZP) < 0.05]
com_l = np.array([face[:, 0].mean(), face[:, 1].mean(), ZP / 2])
rel = face - com_l
t2 = ZP ** 2 / 12
Ixx = np.mean(rel[:, 1] ** 2) + t2
Iyy = np.mean(rel[:, 0] ** 2) + t2
Izz = np.mean(rel[:, 0] ** 2 + rel[:, 1] ** 2)
Ixy = -np.mean(rel[:, 0] * rel[:, 1])
I_body = np.array([[Ixx, Ixy, 0], [Ixy, Iyy, 0], [0, 0, Izz]])   # per unit mass, mm^2
I_inv = np.linalg.inv(I_body)
S = V[::20] - com_l                                               # contact samples, about the COM
print(f"mark: COM local x {com_l[0]:+.1f} y {com_l[1]:.1f} z {com_l[2]:.1f} mm; gyration radii {np.sqrt(np.diag(I_body)).round(1)} mm; {len(S)} contact samples")

def rot_x(a):
    c, s = math.cos(a), math.sin(a)
    return np.array([[1, 0, 0], [0, c, -s], [0, s, c]])

# the 2D state 20 ms before the strike: rows [t s, off, up, theta]
t_strike = traj["contact"]["t"]
rows = traj["rows"]
k = max(i for i, r in enumerate(rows) if r[0] <= t_strike - 0.02)
r0, r1 = rows[k], rows[k + 1]
dtr = r1[0] - r0[0]
theta = r0[3]
w_x = (r1[3] - r0[3]) / dtr
R = rot_x(theta)
pos = np.array([U_C + com_l[0], r0[2], r0[1]])                   # (u, up, off); the 2D COM had x at the mark's centre line
vel = np.array([0.0, (r1[2] - r0[2]) / dtr, (r1[1] - r0[1]) / dtr])
omega = np.array([w_x, 0.0, 0.0])
L = R @ I_body @ R.T @ omega
t0 = r0[0]
print(f"start: {t0 * 1000:.0f} ms after face-down (20 ms before the 2D strike), theta {math.degrees(theta):.0f} deg, spin {math.degrees(w_x):.0f} deg/s, falling {vel[1]:.0f} mm/s")

def contacts(P, Vp):
    """penalty forces on the sample points P (world, N x 3) moving at Vp; returns force per point (N x 3)."""
    F = np.zeros_like(P)
    def apply(mask, n, depth):
        if not mask.any():
            return
        nn = n[mask]
        d = depth[mask]
        vp = Vp[mask]
        vn = np.einsum("ij,ij->i", vp, nn)
        N = np.maximum(0.0, K * d - C * vn)
        vt = vp - vn[:, None] * nn
        sp = np.linalg.norm(vt, axis=1) + 1e-9
        Ft = -(MU * N * np.tanh(sp / 2.0) / sp)[:, None] * vt
        F[mask] += N[:, None] * nn + Ft
    u, up, off = P[:, 0], P[:, 1], P[:, 2]
    du, doff = u - RIM["u"], off - RIM["off"]
    rho = np.hypot(du, doff) + 1e-9
    # the rim: a torus
    qr, qy = rho - RIM["r"], up - RIM["up"]
    dist = np.hypot(qr, qy) + 1e-9
    radial = np.stack([du / rho, np.zeros_like(rho), doff / rho], axis=1)
    n_rim = (qr / dist)[:, None] * radial + np.stack([np.zeros_like(rho), qy / dist, np.zeros_like(rho)], axis=1)
    apply(dist < RIM["tube"], n_rim, RIM["tube"] - dist)
    # the bin's wall: a thin cylinder shell below the rim
    wall = (up < RIM["up"]) & (np.abs(qr) < 4.0)
    n_wall = np.sign(qr)[:, None] * radial
    apply(wall, n_wall, 4.0 - np.abs(qr))
    # the floor
    apply(up < 0.0, np.tile([0.0, 1.0, 0.0], (len(P), 1)), -up)
    # the desk's end panel (and the desk is above)
    panel = (off < DESK_END) & (off > DESK_END - 30) & (up < DESK_TOP) & (u > -625) & (u < 0)
    apply(panel, np.tile([0.0, 0.0, 1.0], (len(P), 1)), DESK_END - off)
    return F

t, dt = 0.0, 1e-5
out_rows = []
facing_best = (-2.0, None)
first_touch = None
while t < 1.5:
    P = pos + S @ R.T
    omega = R @ I_inv @ R.T @ L
    Vp = vel + np.cross(omega, P - pos)
    Fp = contacts(P, Vp)
    if first_touch is None and np.abs(Fp).sum() > 0:
        first_touch = t
    F = Fp.sum(axis=0) + np.array([0.0, -G, 0.0])
    tau = np.cross(P - pos, Fp).sum(axis=0)
    vel += F * dt
    pos += vel * dt
    L += tau * dt
    # rotate R by omega dt (Rodrigues)
    wn = np.linalg.norm(omega)
    if wn > 1e-12:
        a = omega / wn
        ang = wn * dt
        Kx = np.array([[0, -a[2], a[1]], [a[2], 0, -a[0]], [-a[1], a[0], 0]])
        R = (np.eye(3) + math.sin(ang) * Kx + (1 - math.cos(ang)) * Kx @ Kx) @ R
        Uo, _, Vt = np.linalg.svd(R)
        R = Uo @ Vt
    t += dt
    if not out_rows or t - out_rows[-1][0] >= 1e-3:
        face_n = R @ np.array([0.0, 0.0, 1.0])
        to_cam = CAMERA - pos
        to_cam /= np.linalg.norm(to_cam)
        facing = float(face_n @ to_cam)
        q = R
        # quaternion (x, y, z, w) from R
        tr = q.trace()
        if tr > 0:
            s_ = math.sqrt(tr + 1.0) * 2
            qw, qx, qy, qz = 0.25 * s_, (q[2, 1] - q[1, 2]) / s_, (q[0, 2] - q[2, 0]) / s_, (q[1, 0] - q[0, 1]) / s_
        else:
            i_ = int(np.argmax(np.diag(q)))
            if i_ == 0:
                s_ = math.sqrt(1.0 + q[0, 0] - q[1, 1] - q[2, 2]) * 2
                qw, qx, qy, qz = (q[2, 1] - q[1, 2]) / s_, 0.25 * s_, (q[0, 1] + q[1, 0]) / s_, (q[0, 2] + q[2, 0]) / s_
            elif i_ == 1:
                s_ = math.sqrt(1.0 + q[1, 1] - q[0, 0] - q[2, 2]) * 2
                qw, qx, qy, qz = (q[0, 2] - q[2, 0]) / s_, (q[0, 1] + q[1, 0]) / s_, 0.25 * s_, (q[1, 2] + q[2, 1]) / s_
            else:
                s_ = math.sqrt(1.0 + q[2, 2] - q[0, 0] - q[1, 1]) * 2
                qw, qx, qy, qz = (q[1, 0] - q[0, 1]) / s_, (q[0, 2] + q[2, 0]) / s_, (q[1, 2] + q[2, 1]) / s_, 0.25 * s_
        out_rows.append([t, *pos.tolist(), qx, qy, qz, qw, facing])
        if facing > facing_best[0]:
            facing_best = (facing, len(out_rows) - 1)
        # stop once it has faced the camera and is turning away again, or has come to rest on the floor
        if facing_best[0] > 0.85 and facing < facing_best[0] - 0.05:
            break
        if pos[1] < 60 and np.linalg.norm(vel) < 50:
            break

print(f"first touch {first_touch * 1000 if first_touch is not None else -1:.0f} ms into the 3D run")
# describe the run
def euler_note(row):
    q = np.array(row[4:8])
    return q
for frac in (0.0, 0.25, 0.5, 0.75, 1.0):
    i = min(len(out_rows) - 1, int(frac * (len(out_rows) - 1)))
    r = out_rows[i]
    R_ = None
    print(f"  t {r[0] * 1000:5.0f} ms  COM u {r[1]:6.0f} up {r[2]:5.0f} off {r[3]:6.0f}  facing the camera {r[8]:+.2f}")
fb, ib = facing_best
r = out_rows[ib]
print(f"MOST FACING THE CAMERA: {fb:+.2f} (1 = square on) at {r[0] * 1000:.0f} ms into the 3D run; COM u {r[1]:.0f}, up {r[2]:.0f}, off {r[3]:.0f}")
lefts = [row for row in out_rows]
print(f"run length {out_rows[-1][0] * 1000:.0f} ms, {len(out_rows)} rows")
res = {"start_ms": t0 * 1000, "com_local": (com_l / H).tolist(), "facing_best": {"value": fb, "row": ib},
       "rows": [[round(a * 1000, 2), round(b, 2), round(c, 2), round(d, 2), round(e, 6), round(f, 6), round(g, 6), round(h, 6), round(fc, 4)]
                for a, b, c, d, e, f, g, h, fc in out_rows]}
outp = os.path.join(os.path.dirname(sys.argv[2]), f"roll-3d{TAG}.json")
json.dump(res, open(outp, "w"))
print("written", outp)
