"""THE FALL AS A SOMERSAULT — 3D, FROM UPRIGHT ON THE DESK TO OUT OF THE FRAME'S BOTTOM, FACING US AND THE RIGHT WAY UP.
8 October 2026. Carl: "It depends in changing the angle also how much we utilise the front edge of the desk.. When it
falls we are going to see its back and its upside down. it needs to be facing us and the right way up. Does the bin have
to be involved? No. But from facing us and falling it must somewhow flip to face us again" — "try it and show me".

Back-to-us-and-upside-down is HALF a somersault; completing it (the same way) brings it facing us AND upright. This
searches for starting poses where gravity completes it: a rigid body in 3D (inertia from the mark's own face grid + a slab
of its thickness), from UPRIGHT on the desk, given the scroll's NUDGE (a forward tipping spin), under gravity, with penalty
contacts and friction (mu 0.4) against: the DESK (its top slab, its END PANEL, so its END EDGE, FRONT EDGE and CORNER), the
RIGHT WALL, the FLOOR, and the BIN (rim torus + wall; 280 mm across — the photo-consistent size it can reach; the bin is
OPTIONAL to the choreography but it is in the room, so it is in the physics).
Varied: the mark's centre across the desk (u), how far its face stands in from the desk's end, its ANGLE to the end edge
(yaw psi: 0 = facing the camera across the end, + = turned toward the room / the front edge), and the nudge.
Scored at EXIT — the moment its centre of mass leaves the frame's bottom (projected through the solved camera), or it
touches the floor: FACING = face normal . (to the camera), UPRIGHT = its up axis . world up; both 1 when square on.
World axes (u, up, off) — the room's: u along the back wall (toward the right wall), off out from the back wall (toward
the camera); the mark's local x along the letters, y up it, z back -> face.
⚠ Not modelled: air, bounce restitution beyond the penalty damping, the scroll's real force profile (one nudge at t 0).
Usage: python desk-mark-somersault-3d-8-october.py <mark-verts.json> [search|run psi faceIn uC nudge]"""
import itertools
import json
import math
import os
import sys

import numpy as np

H = 227.9
DESK_END, DESK_TOP, DESK_FRONT, DESK_WALL = 1875.0, 750.0, -625.0, 0.0
BIN = dict(u=-250.0, off=2049.0, up=368.0, r=140.0, tube=6.0)
G = 9810.0
MU = 0.4
# ⛔ PER-POINT stiffness, and damping SHARED across the points in contact. The first version gave every sample point the
# 2D script's stiffness (4e6): a flat face landing puts hundreds of points in contact at once, the summed spring became
# far too stiff for the step, and the run EXPLODED (the mark flew 3.8 m up). Now the group of m contacting points has a
# total stiffness K*m and a total damping 1.4*sqrt(K*m) (near critical) — the same behaviour for a corner as for a face.
K = 2e5
# the solved camera (about-room.ts), for the frame's bottom and the "to the camera" direction
W_, H_ = 2560, 1435
F_PX = 1289.03
P_ = math.radians(3.2203); cp, sp = math.cos(P_), math.sin(P_)
BACK = np.array([0.948901, -0.000359, -0.315573]); INTO = np.array([-0.31557, 0.00108, -0.948902]); UPV = np.array([0.000682, 0.999999, 0.000912])
CORNER = np.array([1135.94, -1136.66, -3815.73]) / 1000
CAMERA = np.array([-2283.0, 1139.4, 3260.0])

def scene(u, up, off):
    return CORNER + (np.multiply.outer(u, BACK) + np.multiply.outer(up, UPV) - np.multiply.outer(off, INTO)) / 1000

def project(p):
    cam_y = p[..., 1] * cp + p[..., 2] * sp
    cam_z = -p[..., 1] * sp + p[..., 2] * cp
    return W_ / 2 + F_PX * p[..., 0] / -cam_z, H_ / 2 - F_PX * cam_y / -cam_z

data = json.load(open(sys.argv[1]))
V = np.array(data["v"], dtype=float).reshape(-1, 3) * H
ZP = data["depth"] * H
face = V[np.abs(V[:, 2] - ZP) < 0.05]
com_l = np.array([face[:, 0].mean(), face[:, 1].mean(), ZP / 2])
rel = face - com_l
t2 = ZP ** 2 / 12
I_body = np.array([[np.mean(rel[:, 1] ** 2) + t2, -np.mean(rel[:, 0] * rel[:, 1]), 0],
                   [-np.mean(rel[:, 0] * rel[:, 1]), np.mean(rel[:, 0] ** 2) + t2, 0],
                   [0, 0, np.mean(rel[:, 0] ** 2 + rel[:, 1] ** 2)]])
I_inv = np.linalg.inv(I_body)
S = V[::40] - com_l
base_min = V[:, 1].min()

def rot_y(a):
    c, s = math.cos(a), math.sin(a)
    return np.array([[c, 0, s], [0, 1, 0], [-s, 0, c]])

PENDING = []
def penal(F, mask, n, depth, Vp):
    if mask.any():
        PENDING.append((mask, n, depth))

def resolve(F, Vp):
    m = sum(int(mk.sum()) for mk, _, _ in PENDING)
    c = 1.4 * math.sqrt(K / max(1, m))
    for mask, n, depth in PENDING:
        _apply(F, mask, n, depth, Vp, c)
    PENDING.clear()

def _apply(F, mask, n, depth, Vp, C):
    nn, d, vp = n[mask], depth[mask], Vp[mask]
    vn = np.einsum("ij,ij->i", vp, nn)
    N = np.maximum(0.0, K * d - C * vn)
    vt = vp - vn[:, None] * nn
    spd = np.linalg.norm(vt, axis=1) + 1e-9
    F[mask] += N[:, None] * nn - (MU * N * np.tanh(spd / 2.0) / spd)[:, None] * vt

E = np.eye(3)
def contacts(P, Vp, use_bin=True):
    F = np.zeros_like(P)
    u, up, off = P[:, 0], P[:, 1], P[:, 2]
    n = len(P)
    on_desk_u = (u > DESK_FRONT) & (u < DESK_WALL)
    # desk top slab (up 710..750, off < end): push out the nearest face (top / end / front)
    slab = on_desk_u & (off < DESK_END) & (up < DESK_TOP) & (up > DESK_TOP - 40)
    if slab.any():
        dt_, de, df = DESK_TOP - up, DESK_END - off, u - DESK_FRONT
        m_top = slab & (dt_ <= de) & (dt_ <= df)
        m_end = slab & (de < dt_) & (de <= df)
        m_fr = slab & (df < dt_) & (df < de)
        penal(F, m_top, np.tile(E[1], (n, 1)), dt_, Vp)
        penal(F, m_end, np.tile(E[2], (n, 1)), de, Vp)
        penal(F, m_fr, np.tile(-E[0], (n, 1)), df, Vp)
    # the end panel (off 1835..1875, floor to top)
    panel = on_desk_u & (off < DESK_END) & (off > DESK_END - 40) & (up <= DESK_TOP - 40)
    penal(F, panel, np.tile(E[2], (n, 1)), DESK_END - off, Vp)
    # the right wall, the floor
    penal(F, u > DESK_WALL, np.tile(-E[0], (n, 1)), u - DESK_WALL, Vp)
    penal(F, up < 0.0, np.tile(E[1], (n, 1)), -up, Vp)
    if use_bin:
        du, doff = u - BIN["u"], off - BIN["off"]
        rho = np.hypot(du, doff) + 1e-9
        qr, qy = rho - BIN["r"], up - BIN["up"]
        dist = np.hypot(qr, qy) + 1e-9
        radial = np.stack([du / rho, np.zeros(n), doff / rho], axis=1)
        n_rim = (qr / dist)[:, None] * radial + np.stack([np.zeros(n), qy / dist, np.zeros(n)], axis=1)
        penal(F, dist < BIN["tube"], n_rim, BIN["tube"] - dist, Vp)
        wall = (up < BIN["up"]) & (np.abs(qr) < 4.0)
        penal(F, wall, np.sign(qr)[:, None] * radial, 4.0 - np.abs(qr), Vp)
    resolve(F, Vp)
    return F

def simulate(psi_deg, face_in, u_c, nudge, record=False, t_max=1.6, dt=4e-5):
    psi = math.radians(psi_deg)
    R = rot_y(psi)
    # the base's front-bottom edge `face_in` from the desk's end along the facing direction; COM placed above the base
    fwd = R @ np.array([0.0, 0.0, 1.0])
    base_centre_local = np.array([0.0, base_min, ZP])                      # the front-bottom edge, mid-letters
    pos = np.array([u_c, DESK_TOP - base_min + 0.2, DESK_END - face_in]) - R @ (base_centre_local - com_l) * np.array([1, 0, 1])
    pos[1] = DESK_TOP + (com_l[1] - base_min) + 0.2
    # put the face's front-bottom edge face_in in from the end, measured along off at the mark's middle
    edge_world = pos + R @ (base_centre_local - com_l)
    pos[2] += (DESK_END - face_in) - edge_world[2]
    vel = np.zeros(3)
    omega = (R @ np.array([1.0, 0.0, 0.0])) * nudge                       # tip forward about its own letters' axis
    L = R @ I_body @ R.T @ omega
    t = 0.0
    rows = []
    exit_state = None
    while t < t_max:
        P = pos + S @ R.T
        omega = R @ I_inv @ R.T @ L
        Vp = vel + np.cross(omega, P - pos)
        Fp = contacts(P, Vp)
        F = Fp.sum(axis=0) + np.array([0.0, -G, 0.0])
        tau = np.cross(P - pos, Fp).sum(axis=0)
        vel += F * dt
        pos += vel * dt
        L += tau * dt
        wn = np.linalg.norm(omega)
        if wn > 1e-12:
            a = omega / wn
            ang = wn * dt
            Kx = np.array([[0, -a[2], a[1]], [a[2], 0, -a[0]], [-a[1], a[0], 0]])
            R = (np.eye(3) + math.sin(ang) * Kx + (1 - math.cos(ang)) * Kx @ Kx) @ R
            Uo, _, Vt = np.linalg.svd(R)
            R = Uo @ Vt
        t += dt
        if record and (not rows or t - rows[-1][0] >= 1e-3):
            rows.append([t, *pos.tolist(), *R.flatten().tolist()])
        if exit_state is None:
            px, py = project(scene(np.array(pos[0]), np.array(pos[1]), np.array(pos[2])))
            floor = (P[:, 1] < 1.0).any()
            if py >= H_ or floor:
                to_cam = CAMERA - pos
                to_cam /= np.linalg.norm(to_cam)
                facing = float((R @ E[2]) @ to_cam)
                upright = float((R @ E[1]) @ E[1])
                exit_state = dict(t=t, facing=facing, upright=upright, px=float(px), py=float(py), floor=bool(floor),
                                  com=pos.tolist(), hit_bin=None)
                if not record:
                    break
                t_max = min(t_max, t + 0.25)
    return exit_state, rows

if __name__ == "__main__":
    mode = sys.argv[2] if len(sys.argv) > 2 else "search"
    if mode == "run":
        psi, face_in, u_c, nudge = map(float, sys.argv[3:7])
        ex, rows = simulate(psi, face_in, u_c, nudge, record=True)
        print(json.dumps(ex))
        out = os.path.join(os.path.dirname(sys.argv[1]), f"somersault-{psi:g}-{face_in:g}-{u_c:g}-{nudge:g}.json")
        json.dump({"params": [psi, face_in, u_c, nudge], "com_local": (com_l / H).tolist(), "exit": ex,
                   "rows": [[round(r[0] * 1000, 2)] + [round(x, 3) for x in r[1:4]] + [round(x, 6) for x in r[4:]] for r in rows]},
                  open(out, "w"))
        print("written", out, len(rows), "rows")
        sys.exit(0)
    results = []
    grid = list(itertools.product([-45, -30, -15, 0, 15, 30, 45], [20, 50, 80], [-312.5], [1.5, 3.0, 5.0]))
    print(f"searching {len(grid)} starts (psi, face in, u centre, nudge rad/s)", flush=True)
    for k, (psi, fi, uc, nd) in enumerate(grid):
        ex, _ = simulate(psi, fi, uc, nd)
        if ex is None:
            continue
        score = min(ex["facing"], ex["upright"]) - (0.5 if ex["px"] > 2560 or ex["px"] < 0 else 0)
        results.append((score, psi, fi, uc, nd, ex))
        print(f"{k + 1:3d}/{len(grid)} psi {psi:+3d} in {fi:3d} u {uc:7.1f} nudge {nd:.1f} -> facing {ex['facing']:+.2f} upright {ex['upright']:+.2f} "
              f"exit {ex['t'] * 1000:4.0f} ms at plate ({ex['px']:.0f},{ex['py']:.0f}){' FLOOR' if ex['floor'] else ''}", flush=True)
    results.sort(key=lambda r: -r[0])
    print("\nBEST:")
    for r in results[:8]:
        print(f"  score {r[0]:+.2f}: psi {r[1]:+d} face-in {r[2]} u {r[3]} nudge {r[4]} — facing {r[5]['facing']:+.2f}, upright {r[5]['upright']:+.2f}, exit {r[5]['t'] * 1000:.0f} ms at plate x {r[5]['px']:.0f}")
