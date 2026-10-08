"""The right desk's top, measured on the plate and projected through the solved camera — 8 October 2026.
Carl: "put the logo in the scene perpendicular to the right side angle of the desk" (facing along the desk).
Edges: column luminance scans of public/about-room-plate.jpg (desk top -> dark edge), points clear of objects.
Projected onto the desk-top plane at 750 mm (the room's scale assumption, about-room.ts). CHECK: the two edges
must meet at ~90 deg on that plane if the camera and the 750 mm hold. Then the mark's size: the approved 144 plate
px tall (D-088, 3 October, "SIZE APPROVED"), held at the mark's new centre.
Usage: python project-intelligence/live-work/scripts/desk-right-end-measure-8-october.py"""
import math
import numpy as np
W, H = 2560, 1435
F_PX = 1289.03
tanV = math.tan(math.radians(58.203 / 2)); tanH = tanV * W / H
P = math.radians(3.2203); cp, sp = math.cos(P), math.sin(P)
UP = np.array([0.000682, 0.999999, 0.000912]); EYE = 1139.4
BACK = np.array([0.948901, -0.000359, -0.315573]); INTO = np.array([-0.31557, 0.00108, -0.948902])
CORNER = np.array([1135.94, -1136.66, -3815.73]) / 1000
def ray(px, py):
    nx = px / W * 2 - 1; ny = 1 - py / H * 2
    dx, dy, dz = nx * tanH, ny * tanV, -1
    return np.array([dx, dy * cp - dz * sp, dy * sp + dz * cp])
def onplane(px, py, h=750):
    d = ray(px, py); t = ((h - EYE) / 1000) / (UP @ d); return t * d
def room(p):  # (u along back wall, up, off back wall) mm
    q = p - CORNER
    return ((q @ BACK) * 1000, (q @ UP) * 1000, (-(q @ INTO)) * 1000)
def point(u, up, off):
    return CORNER + (BACK * u - INTO * off + UP * up) / 1000
def project(p):
    # world -> camera: the inverse of ray()'s pitch (world y = cy*cp + cz*sp, world z = cy*sp - ... see ray)
    cam_y = p[1] * cp + p[2] * sp
    cam_z = -p[1] * sp + p[2] * cp
    return (W / 2 + F_PX * p[0] / -cam_z, H / 2 - F_PX * cam_y / -cam_z, -cam_z)

fx = np.array([1800, 1840, 1880, 2000, 2040, 2060, 2080]); fy = np.array([1002, 1010, 1018, 1046, 1054, 1062, 1066])
rx = np.arange(2100, 2381, 40); ry = np.array([1065.5, 1061.5, 1057.5, 1053.5, 1049.5, 1046.5, 1042.5, 1038.5])
a, b = np.polyfit(fx, fy, 1); c, d = np.polyfit(rx, ry, 1)
X = (d - b) / (a - c); Y = a * X + b
C = onplane(X, Y); Fp = onplane(1800, a * 1800 + b); Rp = onplane(2380, c * 2380 + d)
fdir = (Fp - C) / np.linalg.norm(Fp - C); rdir = (Rp - C) / np.linalg.norm(Rp - C)
print(f"corner plate ({X:.1f}, {Y:.1f}); edges meet at {math.degrees(math.acos(fdir @ rdir)):.2f} deg (CHECK ~90; half a plate px moves it ~1 deg)")
print(f"front edge dir {fdir.round(4)} vs INTO {INTO.round(4)}; right edge dir {rdir.round(4)} vs BACK {BACK.round(4)}")
u0, _, off0 = room(C)
print(f"DESK CORNER (front-right, top): u {u0:.0f} mm, off back wall {off0:.0f} mm; to the right wall {-u0:.0f} mm")
assert abs(project(C)[0] - X) < 0.5 and abs(project(C)[1] - Y) < 0.5, "projection round-trip failed"

# The mark: face parallel to the desk front (normal -BACK), baseline along the desk, b nearest the desk's end.
ASPECT = 1.92528   # mark width / height, the outline's box (LOGO_ASPECT)
SET_BACK_FRONT = 150.0  # face behind the desk's front edge, mm — a starting value for Carl's eye
SET_BACK_END = 120.0    # b's end in from the desk's near end, mm — a starting value
h = 250.0
for _ in range(20):
    w = ASPECT * h
    cen = point(u0 + SET_BACK_FRONT, 750 + h / 2, off0 - SET_BACK_END - w / 2)
    top = point(u0 + SET_BACK_FRONT, 750 + h, off0 - SET_BACK_END - w / 2)
    bot = point(u0 + SET_BACK_FRONT, 750, off0 - SET_BACK_END - w / 2)
    px_h = project(bot)[1] - project(top)[1]
    h *= 144 / px_h
w = ASPECT * h
print(f"MARK HEIGHT {h:.1f} mm (width {w:.1f}) for 144 plate px at its centre; centre off back wall {off0 - SET_BACK_END - w / 2:.0f} mm")
for lab, (u, up, off) in {"c end, base": (u0 + SET_BACK_FRONT, 750, off0 - SET_BACK_END - w),
                          "b end, base": (u0 + SET_BACK_FRONT, 750, off0 - SET_BACK_END),
                          "centre top": (u0 + SET_BACK_FRONT, 750 + h, off0 - SET_BACK_END - w / 2)}.items():
    pp = project(point(u, up, off)); print(f"  {lab}: plate ({pp[0]:.0f}, {pp[1]:.0f})")

# ── TAKE 2 (Carl, 8 October): "Its in the way of the monitors… Turn it 90 deg and bring it close to the edge of the
# right hand side." Then: "Can you see where the mic arm joins the desk? Place it in front of that but keep the same
# distance from the front of the desk as the back." So: FACING THE CAMERA (baseline along the desk's right edge, face
# toward the desk's near end), CENTRED across the desk's depth (front edge u0 ... right wall u 0), IN FRONT OF the mic
# arm's clamp. The clamp: a dark column, plate x 2219-2243, its foot on the desk top at y ~1023.5 (row scans).
print("\n-- take 2 --")
clamp = onplane(2231, 1023.5)
cu, _, coff = room(clamp)
cl = onplane(2219, 1023.5); cr = onplane(2243, 1023.5)
cw = np.linalg.norm(cr - cl) * 1000
print(f"MIC CLAMP foot (front of the column, centre): u {cu:.0f} mm, off back wall {coff:.0f} mm; ~{cw:.0f} mm across")
GAP = 20.0  # the mark's back this far in front of the clamp's front face, mm — a starting value
uc = u0 / 2  # centred: the same distance from the front edge as from the back (the right wall)
h = 250.0
for _ in range(20):
    D = 0.07323 * h
    offc = coff + GAP + D / 2
    top = point(uc, 750 + h, offc); bot = point(uc, 750, offc)
    h *= 144 / (project(bot)[1] - project(top)[1])
D = 0.07323 * h; w = ASPECT * h
face_off = coff + GAP + D
print(f"MARK HEIGHT {h:.1f} mm (width {w:.1f}); centred at u {uc:.1f} mm (front edge {u0:.0f}, wall 0): "
      f"{(uc - w / 2) - u0:.0f} mm in from the front edge, {-(uc + w / 2):.0f} mm from the wall")
print(f"back {coff + GAP:.0f} mm, face {face_off:.0f} mm off the back wall; the desk's end at {off0:.0f} -> face {off0 - face_off:.0f} mm in from the end")
for lab, (u, up, off) in {"c end, base": (uc - w / 2, 750, face_off), "b end, base": (uc + w / 2, 750, face_off),
                          "centre top": (uc, 750 + h, face_off)}.items():
    pp = project(point(u, up, off)); print(f"  {lab}: plate ({pp[0]:.0f}, {pp[1]:.0f})")

# ── THE LED STRIP ABOVE THE DESK (Carl, 8 October: "theres a neon strip above. It would be expected to have some effect")
# Brightest row per column on the right wall: (1700, 431) ... (2200, 225), saturated (253-254); it ends at ~x 2210.
# Projected onto the RIGHT WALL plane (through the room corner, normal ROOM_BACK_DIR).
print("\n-- the LED strip --")
def on_right_wall(px, py):
    d = ray(px, py); t = (BACK @ CORNER) / (BACK @ d); return t * d
sx = np.array([1700, 1750, 1800, 1850, 1900, 1950, 2000, 2050, 2100, 2150, 2200])
sy = np.array([431, 405, 388, 367, 342, 329, 302, 283, 263, 244, 225])
for x, y in [(1700, 431), (1950, 329), (2200, 225)]:
    u, up, off = room(on_right_wall(x, y)); print(f"  strip at plate ({x},{y}): {up:.0f} mm up, {off:.0f} mm off the back wall (u {u:.0f})")
ups = [room(on_right_wall(x, y))[1] for x, y in zip(sx, sy)]
print(f"STRIP HEIGHT {np.mean(ups):.0f} mm (spread {np.min(ups):.0f}-{np.max(ups):.0f}) — CHECK: a level strip has one height")
h = 227.9; mark_face_off = off0 - 65
top = np.array([u0 / 2, 750 + h])
strip = np.array([0.0, np.mean(ups)])
dv = strip - np.array([u0 / 2, 750 + h / 2])
print(f"from the mark's centre: {dv[0]:.0f} mm toward the wall, {dv[1]:.0f} mm up -> elevation {math.degrees(math.atan2(dv[1], dv[0])):.1f} deg")
