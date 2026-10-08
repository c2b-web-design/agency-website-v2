/**
 * /about §2 — THE ROOM: office-image-3, its solved camera, and the four cards' places in it.
 * 25 September 2026. Reasoning: D-095. Camera: `live-work/camera-solve-25-september.md`.
 * Layout: `live-work/scripts/card-layout-office3.mjs` (every number below is its EXPORT output).
 *
 * ⛔⛔ THE CARDS ARE PLACED IN ROOM MILLIMETRES, NOT IN PLATE FRACTIONS. Carl reasons about the room
 * ("four cupboard doors", "the skirting's height from the skirting", "the top drawer handle"), so the
 * layout is stated the same way: along the back wall from the room corner, up from the floor, out from
 * the wall. ⚠ **Moving a card is editing one number here.**
 *
 * ⚠⚠ THE SCALE RESTS ON ONE ASSUMPTION: the desk is 750 mm (the old room made the same one). If it is
 * wrong every millimetre scales together and nothing on screen moves — the layout is relative.
 */

/**
 * ⛔ THE PLATE — `public/about-room-plate.jpg`, 2560 x 1435, made from `brand-assets/office-image-3-edited.png`
 * (3632 x 2048) with its 0.6% vertical stretch removed, so its pixels are SQUARE and one focal length
 * applies. ⚠ It covers master x 0.2–3999.4, y 4.8–2246.3: the full width, ~5 master rows lost top and
 * bottom (D-095). Its centre is the camera's principal point to 0.33 px.
 */
export const ROOM_PLATE_SRC = "/about-room-plate.jpg";
export const ROOM_PLATE_W = 2560;
export const ROOM_PLATE_H = 1435;
export const ROOM_PLATE_ASPECT = ROOM_PLATE_W / ROOM_PLATE_H;

/**
 * ⛔⛔ THE SOLVED CAMERA. f = 2013.7 px on the 4000 px master = **1289.03 px on this plate**.
 * ⚠ `PerspectiveCamera.fov` IS VERTICAL: 2·atan(717.5 / 1289.03) = **58.203°** (the old room: 67.31°).
 * ⚠⚠ **IT LOOKS UP, 3.22°** — the old room looked DOWN 12.68°. The horizon sits BELOW the frame's centre.
 * ⛔ FALSIFIED FOUR WAYS (held-out skirting, verticals, five door gaps, the pooled vertical VP) — see the
 * camera record. ⚠ The left BOOKCASE is not plumb in the render; never use it as a reference.
 */
export const ROOM_CAMERA_VFOV_DEG = 58.203;
export const ROOM_CAMERA_PITCH_UP_DEG = 3.2203;

/**
 * ⛔ THE ROOM IN THE SCENE'S WORLD — the camera at the origin, pitched about X, looking down −Z, Y up;
 * 1 unit = 1 metre.
 *
 *   ROOM_BACK_DIR   along the back wall, to the right       (it is turned 18.40° from face-on)
 *   ROOM_INTO_WALL  the back wall's normal, INTO the wall    (the right wall's direction)
 *   ROOM_UP         world up                                  (0.05° off +Y — the VP solve's own up)
 *   ROOM_CORNER_FLOOR  the back/right wall corner, at floor level, in millimetres
 *
 * ⚠ The eye is 1139 mm above the floor (desk-scaled). ⛔ Transcription checked: a card corner rebuilt
 * through this frame lands within 0.4 px of the layout script's own projection on this plate.
 */
export const ROOM_BACK_DIR = [0.948901, -0.000359, -0.315573] as const;
export const ROOM_INTO_WALL = [-0.31557, 0.00108, -0.948902] as const;
export const ROOM_UP = [0.000682, 0.999999, 0.000912] as const;
export const ROOM_CORNER_FLOOR_MM = [1135.94, -1136.66, -3815.73] as const;
export const ROOM_EYE_HEIGHT_MM = 1139.4;
export const ROOM_YAW_DEG = 18.3954;
export const ROOM_MM_PER_UNIT = 1000;

/** A card's place in the room: its outer (rim-to-rim) size and where its bottom-left corner sits. */
export type RoomCardSpec = {
  /** Left edge, along the back wall from the room corner (negative = left of it). */
  uLeftMm: number;
  /** Bottom edge, above the floor. */
  bottomMm: number;
  /** The card's plane, in front of the back wall. */
  offWallMm: number;
  widthMm: number;
  heightMm: number;
};

/**
 * ⛔⛔ THE FOUR CARDS — Carl's rulings of 25 September 2026, accepted by eye:
 * *"Always trust your instincts. That looks a lot better. Placement and balance are good."*
 *
 *   CA, CB  the wall pair: the TV's outer frame each, level, equally far from the wall's edges (bookcase
 *           side, room corner) with the gap centred on the wall; CB's bottom 10 mm above the chair tip.
 *   CS      THE ABOVE CARD (*"CS is above and CD is the floor"*): four cupboard doors wide (4 × 415.5 mm),
 *           trim to trim on the cabinet fronts, which stand 401 mm off the wall; centred on the wall.
 *   CD      THE FLOOR CARD: on the floor, one skirting height (101 mm) in front of the skirting's face;
 *           its left edge first set on the cubby PS4's left edge, then — *"make it taller and bring the
 *           left side in… retains the same area as the above card"* — its top level with the top drawer
 *           handle IN THE PICTURE and its left edge in 378 mm: 1284.5 x 546.9 mm, area = CS's.
 *
 * ⚠ The wall pair and CS hang one RIM BEAD proud of their surface (0.022 × height), so the rim's back
 * touches it; CD stands free, its plane at the ruled distance.
 * ⚠ The room proxy does not model the cabinet, so CD's upper part — physically inside the floating
 * cabinet (underside ~310 mm) — draws over the drawers as it did in the approved overlay.
 */
const RIM_BEAD_RATIO = 0.022;
export const ROOM_CARDS: Record<"CA" | "CB" | "CS" | "CD", RoomCardSpec> = {
  CA: { uLeftMm: -3115.2, bottomMm: 1107.0, offWallMm: 805.1 * RIM_BEAD_RATIO, widthMm: 1331.8, heightMm: 805.1 },
  CB: { uLeftMm: -1557.6, bottomMm: 1107.0, offWallMm: 805.1 * RIM_BEAD_RATIO, widthMm: 1331.8, heightMm: 805.1 },
  CS: { uLeftMm: -2501.5, bottomMm: 2163.8, offWallMm: 401.3 + 422.7 * RIM_BEAD_RATIO, widthMm: 1662.0, heightMm: 422.7 },
  CD: { uLeftMm: -2352.2, bottomMm: 0, offWallMm: 115.0, widthMm: 1284.5, heightMm: 546.9 },
};

/** A room point (mm along the wall, mm up from the floor, mm off the wall) in scene units. */
export function roomPoint(uMm: number, upMm: number, offWallMm: number): [number, number, number] {
  const s = 1 / ROOM_MM_PER_UNIT;
  return [0, 1, 2].map(
    (i) =>
      (ROOM_CORNER_FLOOR_MM[i] + ROOM_BACK_DIR[i] * uMm - ROOM_INTO_WALL[i] * offWallMm + ROOM_UP[i] * upMm) * s,
  ) as [number, number, number];
}

/**
 * Where a card's mesh goes: its CENTRE, and the Y rotation that turns the mesh (built in XY, facing +Z)
 * to face into the room. ⚠ Local +X maps to (cos ψ, 0, −sin ψ) under a Y rotation ψ, which is
 * `ROOM_BACK_DIR` at ψ = 18.40°; local +Z then faces −`ROOM_INTO_WALL`, toward the camera side.
 */
export function roomCardPlacement(spec: RoomCardSpec) {
  return {
    position: roomPoint(spec.uLeftMm + spec.widthMm / 2, spec.bottomMm + spec.heightMm / 2, spec.offWallMm),
    rotationY: (ROOM_YAW_DEG * Math.PI) / 180,
    aspect: spec.widthMm / spec.heightMm,
    scale: 1 / ROOM_MM_PER_UNIT,
  };
}

/**
 * ⛔ THE CARDS' CORNERS AS PLATE FRACTIONS, from the layout script's own projection (TL TR BR BL) — the
 * `?guides=1` overlay draws these, so a card and its guide coincide only if the SCENE path (above) agrees
 * with the LAYOUT path. ⚠ Outer rim-to-rim outlines of the approved overlay, at their surface planes.
 */
export const ROOM_CARD_GUIDES: Record<"CA" | "CB" | "CS" | "CD", readonly (readonly [number, number])[]> = {
  CA: [[0.18096, 0.30685], [0.41509, 0.33804], [0.41384, 0.55836], [0.17584, 0.5594]],
  CB: [[0.449, 0.34255], [0.62298, 0.36573], [0.62437, 0.55743], [0.44823, 0.55821]],
  CS: [[0.29472, 0.07061], [0.57265, 0.14821], [0.57313, 0.26339], [0.29289, 0.20749]],
  CD: [[0.31774, 0.73145], [0.52415, 0.70956], [0.52432, 0.86014], [0.31577, 0.90329]],
};

// ── THE DESK MARK — its place on the right desk (D-088), 8 October 2026 ─────────────────────────────────────────────

/**
 * ⛔ THE RIGHT DESK'S TOP, ITS FRONT-RIGHT CORNER — measured 8 October 2026
 * (`live-work/scripts/desk-right-end-measure-8-october.py`). The desk top's two edges were scanned on the plate (front
 * edge (1800, 1002)→(2080, 1066); right edge (2100, 1065.5)→(2380, 1038.5); corner (2086.6, 1066.5) — 3 October had
 * (2085, 1067)) and projected through the solved camera onto the 750 mm plane.
 * ✔ CHECKED: the two edges meet at 88–89° on that plane (half a plate px moves it ~1°), and they run with the room's
 * walls — the front edge along `ROOM_INTO_WALL`, the right edge along `ROOM_BACK_DIR`. **The desk stands against the
 * RIGHT wall, ~625 mm deep, its near end toward the camera.** ⚠ 750 mm is the room's scale assumption (above).
 */
export const DESK_RIGHT_CORNER = { uMm: -625, offWallMm: 1875, topMm: 750 } as const;

/**
 * ⛔ THE MIC ARM'S CLAMP — where the arm joins the desk, measured 8 October 2026 (same script): a dark column at plate
 * x 2219–2243, its foot on the desk top at y ≈ 1023.5 → u −92 mm (≈ 92 mm from the wall), 1699 mm off the back wall,
 * ~40 mm across. Its front face is the line the mark stands in front of.
 */
export const DESK_MIC_CLAMP = { uMm: -92, offWallMm: 1699 } as const;

/**
 * ⛔ THE MARK ON THE DESK — TAKE 2, Carl, 8 October 2026. Take 1 (*"Face along the desk"*) was *"in the way of the
 * monitors, which is my fault. Turn it 90 deg and bring it close to the edge of the right hand side"*; then *"Can you see
 * where the mic arm joins the desk? Place it in front of that but keep the same distance from the front of the desk as
 * the back."* So:
 *   - **FACING THE CAMERA**, out over the desk's near end — its baseline along the desk's right edge (3 October's
 *     orientation, *"parallel to the desk's right edge"*), the c toward the desk's front, the b toward the wall;
 *   - **CENTRED ACROSS THE DESK'S DEPTH** — as far from the front edge as from the back (the right wall): 93 mm each;
 *   - **IN FRONT OF THE MIC CLAMP** — its back `gapToClampMm` in front of the clamp, which puts its face ~139 mm in
 *     from the desk's end.
 *   - `heightMm` — the APPROVED SIZE (D-088, 3 October: 144 plate px tall) held at this centre: 227.9 mm.
 * ⛔ TAKE 3, THE SAME DAY — THE FACE 65 mm FROM THE DESK'S END, SO GRAVITY CAN TAKE IT OFF. Carl: *"The act of scrolling
 * will tip the logo over on its face at first. If its too far back it will stay on the desk. There wont be enough
 * "weight" in the logo for it to topple off the desk… it must obey the rules of gravity."* Measured: the centre of mass
 * (the volume centroid, 7 October: 0.426 of the height, ~9 mm behind the front-bottom edge) stands 97 mm up; tipped
 * onto its face it lands ~97 mm forward of where its face stood. At take 2's 139 mm it would land ~42 mm SHORT of the
 * edge and stay on the desk; **under ~97 mm it goes over**. 65 mm puts it ~32 mm past the edge — a fall, not a teeter
 * (Carl: *"yes, proceed"*). Still in front of the clamp, ~90 mm clear of it. ⚠ The height stays 227.9 mm (a real object
 * does not change size when it is moved); on screen it is ~3% larger than 144 px here. ⚰️ Take 1 (face along the desk, 244.2 mm, face 150 mm behind the front edge,
 * the b 120 mm in from the end) was never committed; its record is D-088's 8 October entries.
 */
export type DeskMarkSpec = { heightMm: number; faceInFromEndMm: number; leftMm: number };
/** ⚰️ Take 2 stood its back 20 mm in front of the clamp (`gapToClampMm: 20`; face ~139 mm in from the end). */
/**
 * ⚰️ 10% SMALLER — Carl, 8 October 2026: *"make it 10% smaller"* — 227.9 → 205.1 mm (439 → 395 mm wide), for the corner
 * placement. ⛔ RESTORED TO **227.9 mm** the same day (session 2), with take 3's start: *"move the logo into its original
 * starting position and restore its size, i had it reduced by 10%."* The 2D fall (`DESK_MARK_FALL`) and the first
 * somersault (`DESK_MARK_SOMERSAULT`) were simulated at 227.9, so they match this size again; the corner pose
 * (`?markplay=corner`) derives from this number, and its 102 mm was found at 227.9.
 */
/**
 * ⛔ 50 mm LEFT — Carl, 8 October 2026, session 2: *"the starting position of the logo was wrong, it should of been a
 * little more left"* → *"move it 50mm left"*. LEFT on screen is toward the desk's FRONT EDGE (−u): the mark's centre goes
 * from the desk's middle (u −312.5) to u −362.5, its c end 43 mm in from the front edge — still wholly on the desk. ✔ The
 * fall is unchanged by it (`DESK_MARK_FALL`: its plane is the desk's end), and so is the strike's moment — re-simulated
 * (`LEFT_MM=50`, `desk-mark-fall-to-bin-8-october.py`): the rim at 348 ms, 199°, as before; only the point that meets it
 * moves along the b's bowl (x +0.218 → +0.526).
 */
/**
 * ⛔ 85 mm LEFT — the same session, after the rest on the rim at 50 mm (Carl: *"Because more "weight" is now on the left
 * would not that help move the logo left. Its right hand side would raise up as its left hand side goes dowm."* → *"Move
 * the logos starting position, we will see how it looks."*). The Builder's figure: at 50 the centre of mass rests 31 mm
 * INSIDE the rim's left edge (it stays); at 85 it rests 3 mm OUTSIDE it (u −398 against the left-most support at −395) —
 * a real mark would tip off to the LEFT. Its c end stands 8 mm in from the desk's front edge (> ~93 mm and its base would
 * hang off the front edge before it falls). ⚠ The 2D fall CANNOT show that tip — it has no sideways motion.
 */
export const DESK_MARK: DeskMarkSpec = { heightMm: 227.9, faceInFromEndMm: 65, leftMm: 85 };
/** The mark's rest origin across the desk (u, mm) — the take's centre, slid left by `leftMm`. */
export function deskMarkOriginUMm(spec: DeskMarkSpec) {
  return DESK_RIGHT_CORNER.uMm / 2 - spec.leftMm;
}

/**
 * Where the mark's mesh goes. The mesh (`buildLogoMarkGeometry`, scale = height in metres) has its origin at the bottom
 * centre of its FLAT BACK, x along the letters, face toward +Z. ⚠ The cards' own Y rotation (`ROOM_YAW_DEG`) maps local
 * +X to `ROOM_BACK_DIR` (across the desk, toward the wall) and local +Z to −`ROOM_INTO_WALL` (toward the desk's near
 * end and the camera) — so the mark faces the camera as the cards do. `depth` is the mark's thickness in mark heights;
 * the origin is the BACK, so it sits one thickness behind the face.
 */
export function deskMarkPlacement(spec: DeskMarkSpec, depth: number) {
  const c = DESK_RIGHT_CORNER;
  return {
    position: roomPoint(deskMarkOriginUMm(spec), c.topMm, c.offWallMm - spec.faceInFromEndMm - depth * spec.heightMm),
    rotationY: (ROOM_YAW_DEG * Math.PI) / 180,
    scale: spec.heightMm / ROOM_MM_PER_UNIT,
  };
}

/**
 * ⛔ THE LED STRIP ABOVE THE DESK — the orange line along the RIGHT wall, measured 8 October 2026
 * (`live-work/scripts/desk-right-end-measure-8-october.py`): the brightest row per plate column, (1700, 431) … (2200, 225),
 * projected onto the right wall's plane. ✔ CHECKED: it comes out LEVEL — 2152–2174 mm up at every point (mean 2162) —
 * running along the wall from 195 mm off the back wall to at least 1634 mm, where it leaves the frame (behind the desk
 * mark, which stands at ~1800). Carl: *"theres a neon strip above. It would be expected to have some effect."*
 */
export const DESK_LED_STRIP = { uMm: 0, upMm: 2162, offWallFromMm: 195, offWallToMm: 1634 } as const;

/**
 * ⛔ THE FALL, STAGES 2 AND 3 — FROM FACE DOWN, OVER THE DESK'S END, DOWN ONTO THE BIN'S RIM, AND ONTO ITS BACK ACROSS IT
 * (Carl, 8 October 2026). Stage 2: *"let it fall downwards but stop it before it hits the bin. i want to see where on the
 * logo it will make contact with the bins rim"* → *"Outstanding. The speed is good."* Stage 3: *"continue so that the flat
 * back is on the rim. then stop, we need to see how much hangs over the edge of the bons rim"* → *"Yrs, the energy."*
 * SIMULATED, not keyframed: `live-work/scripts/desk-mark-fall-to-bin-8-october.py` — a rigid body in the vertical plane
 * through the desk's end, under gravity, with penalty contacts and friction (μ 0.4) against the desk top, its END EDGE
 * and END PANEL, from rest face down where stage 1 leaves it. ⛔ A no-slip pivot on the edge (its first attempt) MISSED the
 * bin; with sliding it leaves the desk ~197 ms after face-down (61° past it, brushing the end panel) and STRIKES THE RIM at
 * 348 ms, 199° from upright — just past upside down, its back to the camera.
 * ⛔ THE STRIKE: the BACK of the mark, the top of the b's bowl (mark units x +0.218,
 * y 0.899, z 0), on the rim's far side. ⛔ IT COSTS ENERGY: a strike that does not bounce keeps
 * the ANGULAR MOMENTUM ABOUT THE STRIKE POINT — ~88% of the energy is lost, yet it leaves the strike turning FASTER (355°/s
 * against 95°/s), because its falling speed (2.2 m/s) becomes rotation about that point. (The first take kept the spin and
 * DROPPED the falling speed — it turned over too slowly, 234 ms; corrected on Carl's word.) It lands ON ITS BACK ACROSS
 * THE RIM at 489 ms (θ 270°), and stops (no bounce modelled). ✔ SUPPORTED: solid back crosses the rim on every
 * side of its centre of mass. OVERHANG past the rim's outer edge: 142 mm on the LEFT (the c end), 17 mm right, 28 mm
 * toward the desk, 0 toward the camera; ~45% of it outside the rim, ~48% over the opening.
 * ⛔⛔ THE ROWS BELOW ARE THE 85 mm-LEFT RUN (session 2, `LEFT_MM=85`): the strike at 350.4 ms, the same point of the b's
 * bowl (x +0.526, y 0.879); 366°/s after it; on its back at ~488 ms. ⛔ ITS CENTRE OF MASS RESTS 3 mm OUTSIDE THE RIM's LEFT
 * EDGE (u −398 against −395): NOT SUPPORTED — a real mark tips off to the left here; the 2D model holds it. OVERHANG past
 * the rim's outer edge: **227 mm LEFT**, 0 right, 31 toward the desk, 0 toward the camera; 58% of the back outside the rim.
 * ⚰️ THE 50 mm-LEFT RUN (Carl, 8 October 2026, session 2: *"make it now so the flat back sits on the rim and stop..
 * i want to see how much of the logos left side is hanging over the rim."*) — the figures above it are the centred take's
 * (u −312.5); both kept as history. Stage 2 is identical (checked row for row). The strike: 347.6 ms, the
 * back at the b's bowl further along (x +0.526, y 0.907, z 0); 352°/s after it, 12% of the energy kept. On its back across
 * the rim at 490.0 ms. ✔ SUPPORTED, BUT NARROWLY ON THE LEFT: the back meets the rim from u −393 to −243 and the centre of
 * mass is at u −362 — 31 mm inside the left-most support. OVERHANG past the rim's outer edge: **192 mm on the LEFT** (the c
 * end; 142 centred), 0 right, 27 toward the desk, 0 toward the camera; 47% of the back outside the rim, 48% over the opening.
 * ⚠ THE RIM IS ASSUMED 280 mm ACROSS (a standard bin): the plate cannot fix the bin's size (its foot is out of shot); at
 * that size it sits 368 mm up, centred u −250, 174 mm out from the desk's end. Another size moves the strike and the rest.
 * Rows: [ms after face-down, centre of mass OFF mm, UP mm, theta rad] (θ 0 upright facing the camera, π/2 face down,
 * π upside down, 3π/2 on its back); every 4 ms of the simulation's 1 ms record. `comLocal`: the centre of mass in mark
 * units (y up the mark, z back→face).
 */
export const DESK_MARK_FALL = {
  comLocal: [0.42544, 0.03661] as const,
  contactMs: 350.4,
  restMs: 488.4,
  contactLocal: [0.5261, 0.8788, 0.0000] as const,
  rows: [
  [0, 1906.96, 758.34, 1.5708],
  [4, 1906.96, 758.33, 1.57129],
  [8, 1906.97, 758.28, 1.57275],
  [12, 1906.99, 758.2, 1.57516],
  [16, 1907.02, 758.09, 1.57853],
  [20, 1907.05, 757.96, 1.58287],
  [24, 1907.09, 757.79, 1.58816],
  [28, 1907.14, 757.59, 1.59442],
  [32, 1907.19, 757.35, 1.60163],
  [36, 1907.25, 757.09, 1.60979],
  [40, 1907.32, 756.8, 1.61891],
  [44, 1907.38, 756.47, 1.629],
  [48, 1907.45, 756.11, 1.64006],
  [52, 1907.53, 755.72, 1.65208],
  [56, 1907.6, 755.3, 1.66507],
  [60, 1907.67, 754.84, 1.67903],
  [64, 1907.74, 754.35, 1.69396],
  [68, 1907.81, 753.83, 1.70987],
  [72, 1907.88, 753.28, 1.72676],
  [76, 1907.93, 752.69, 1.74462],
  [80, 1907.98, 752.06, 1.76347],
  [84, 1908.03, 751.41, 1.78329],
  [88, 1908.06, 750.72, 1.80409],
  [92, 1908.08, 750, 1.82588],
  [96, 1908.08, 749.24, 1.84863],
  [100, 1908.08, 748.45, 1.87236],
  [104, 1908.06, 747.62, 1.89705],
  [108, 1908.04, 746.76, 1.92267],
  [112, 1908.02, 745.85, 1.94922],
  [116, 1907.99, 744.9, 1.97667],
  [120, 1907.97, 743.91, 2.005],
  [124, 1907.96, 742.86, 2.03417],
  [128, 1907.95, 741.76, 2.06414],
  [132, 1907.95, 740.59, 2.09488],
  [136, 1907.97, 739.36, 2.12634],
  [140, 1908, 738.04, 2.15847],
  [144, 1908.04, 736.65, 2.19121],
  [148, 1908.1, 735.15, 2.2245],
  [152, 1908.17, 733.56, 2.25825],
  [156, 1908.26, 731.85, 2.29239],
  [160, 1908.36, 730.01, 2.32684],
  [164, 1908.47, 728.04, 2.36149],
  [168, 1908.58, 725.92, 2.39624],
  [172, 1908.69, 723.64, 2.43101],
  [176, 1908.8, 721.21, 2.46578],
  [180, 1908.92, 718.62, 2.50055],
  [184, 1909.03, 715.88, 2.53532],
  [188, 1909.14, 712.98, 2.57009],
  [192, 1909.25, 709.92, 2.60486],
  [196, 1909.37, 706.7, 2.63963],
  [200, 1909.48, 703.33, 2.6744],
  [204, 1909.59, 699.8, 2.70917],
  [208, 1909.7, 696.11, 2.74394],
  [212, 1909.81, 692.27, 2.77871],
  [216, 1909.93, 688.26, 2.81348],
  [220, 1910.04, 684.11, 2.84825],
  [224, 1910.15, 679.79, 2.88302],
  [228, 1910.26, 675.32, 2.91779],
  [232, 1910.38, 670.69, 2.95256],
  [236, 1910.49, 665.9, 2.98733],
  [240, 1910.6, 660.96, 3.0221],
  [244, 1910.71, 655.86, 3.05687],
  [248, 1910.82, 650.61, 3.09164],
  [252, 1910.94, 645.19, 3.12641],
  [256, 1911.05, 639.62, 3.16118],
  [260, 1911.16, 633.89, 3.19595],
  [264, 1911.27, 628.01, 3.23072],
  [268, 1911.39, 621.97, 3.26549],
  [272, 1911.5, 615.77, 3.30026],
  [276, 1911.61, 609.41, 3.33503],
  [280, 1911.96, 602.99, 3.36358],
  [284, 1913.12, 596.75, 3.37022],
  [288, 1914.29, 590.34, 3.37686],
  [292, 1915.46, 583.78, 3.3835],
  [296, 1916.62, 577.06, 3.39014],
  [300, 1917.79, 570.19, 3.39678],
  [304, 1918.96, 563.15, 3.40342],
  [308, 1920.12, 555.96, 3.41006],
  [312, 1921.29, 548.62, 3.4167],
  [316, 1922.46, 541.11, 3.42334],
  [320, 1923.62, 533.45, 3.42998],
  [324, 1924.79, 525.64, 3.43662],
  [328, 1925.96, 517.66, 3.44326],
  [332, 1927.12, 509.53, 3.4499],
  [336, 1928.29, 501.24, 3.45654],
  [340, 1929.46, 492.8, 3.46318],
  [344, 1930.62, 484.2, 3.46982],
  [348, 1931.79, 475.44, 3.47646],
  [353.4, 1934.4, 469.71, 3.49965],
  [357.4, 1937, 468.93, 3.52582],
  [361.5, 1939.61, 468.07, 3.55232],
  [365.5, 1942.24, 467.14, 3.57919],
  [369.6, 1944.87, 466.11, 3.60645],
  [373.6, 1947.51, 465, 3.63412],
  [377.6, 1950.17, 463.8, 3.66224],
  [381.7, 1952.83, 462.5, 3.69083],
  [385.7, 1955.47, 461.11, 3.71963],
  [389.7, 1958.12, 459.62, 3.74895],
  [393.7, 1960.78, 458.02, 3.77883],
  [397.7, 1963.43, 456.32, 3.80928],
  [401.7, 1966.08, 454.49, 3.84033],
  [405.7, 1968.73, 452.55, 3.87201],
  [409.7, 1971.36, 450.47, 3.90436],
  [413.7, 1973.99, 448.27, 3.93748],
  [417.7, 1976.62, 445.9, 3.97157],
  [421.8, 1979.22, 443.4, 4.00642],
  [425.8, 1981.79, 440.74, 4.04205],
  [429.9, 1984.31, 437.93, 4.0785],
  [433.9, 1986.79, 434.97, 4.11579],
  [437.9, 1989.21, 431.84, 4.15395],
  [442, 1991.56, 428.54, 4.19299],
  [446, 1993.83, 425.08, 4.23296],
  [450.1, 1996.01, 421.44, 4.27387],
  [454.1, 1998.08, 417.63, 4.31575],
  [458.1, 2000.04, 413.64, 4.35861],
  [462.2, 2001.86, 409.47, 4.40249],
  [466.2, 2003.54, 405.13, 4.44739],
  [470.3, 2005.05, 400.61, 4.49334],
  [474.3, 2006.37, 395.93, 4.54035],
  [478.3, 2007.5, 391.11, 4.58808],
  [482.3, 2008.4, 386.15, 4.63676],
  [486.3, 2009.08, 381.03, 4.68652],
  [488.4, 2009.33, 378.36, 4.71239],
  ] as readonly (readonly [number, number, number, number])[],
};

/**
 * ⛔ THE SOMERSAULT — A FULL 3D RIGID-BODY RUN FROM UPRIGHT ON THE DESK TO OUT OF THE FRAME'S BOTTOM (Carl, 8 October
 * 2026): *"it needs to be facing us and the right way up. Does the bin have to be involved? No. But from facing us and
 * falling it must somewhow flip to face us again"* → *"try it and show me"*. SIMULATED, not keyframed:
 * `live-work/scripts/desk-mark-somersault-3d-8-october.py` (gravity; penalty contacts with friction μ 0.4 against the desk's
 * top, END and FRONT edges and END PANEL, the right wall, the floor and the 280 mm bin), chosen from its SEARCH over the
 * start's angle, place and the scroll's nudge; written by `desk-mark-somersault-to-room-8-october.py`.
 * THIS RUN (psi: 0 faces the desk's END, -90 faces its FRONT EDGE — the convention CORRECTED 8 October; see the script):
 * its face 40 mm from the front edge and 220 mm from the end, nudged 4 rad/s forward. At the frame's bottom (632 ms): FACING the camera
 * +0.82, UPRIGHT +0.83 (1 = square on / the right way up). Second search (corrected angle; placement from the corner; bin out): facing the FRONT EDGE (-90), its face 40 mm from it and 220 mm back from the end, nudge 4 rad/s. Carl's overhang-only idea (facing the end, the c over the front edge) stayed on the desk: a forward tip does not move weight sideways.
 * Rows: [ms after the nudge, centre of mass u mm, up mm, off mm, qx, qy, qz, qw] — the orientation maps the mark's local axes
 * (x along the letters, y up it, z back → face) into the room's (u, up, off), the mark's yaw frame in the scene.
 * `comLocal`: the centre of mass in mark units (x, y, z).
 */
export const DESK_MARK_SOMERSAULT = {
  params: { psiDeg: -90, dFrontMm: 40, dEndMm: 220, nudgeRadS: 4 },
  exit: { ms: 632.2, facing: 0.816, upright: 0.833 },
  comLocal: [0.03326, 0.42544, 0.03661] as const,
  rows: [
  [0, -576.66, 847.16, 1662.58, 6e-05, -0.70711, 6e-05, 0.70711],
  [4, -576.66, 847.08, 1662.58, 0.00571, -0.70708, 0.00572, 0.70708],
  [8, -576.68, 846.89, 1662.58, 0.01133, -0.70697, 0.01111, 0.70707],
  [12, -576.76, 846.71, 1662.59, 0.0168, -0.70667, 0.0156, 0.70718],
  [16.1, -576.98, 846.7, 1662.6, 0.02078, -0.70665, 0.01962, 0.70699],
  [20.2, -577.26, 846.66, 1662.61, 0.0244, -0.70665, 0.02327, 0.70676],
  [24.4, -577.61, 846.62, 1662.62, 0.02755, -0.70667, 0.02642, 0.70652],
  [28.6, -578.03, 846.59, 1662.62, 0.0302, -0.70672, 0.02909, 0.70625],
  [32.7, -578.51, 846.55, 1662.62, 0.03238, -0.70681, 0.03128, 0.70597],
  [36.9, -579.03, 846.51, 1662.62, 0.03438, -0.70681, 0.0333, 0.70578],
  [41, -579.56, 846.48, 1662.62, 0.03634, -0.70672, 0.03526, 0.70568],
  [45.2, -580.11, 846.43, 1662.62, 0.03834, -0.70661, 0.03726, 0.70558],
  [49.4, -580.66, 846.39, 1662.62, 0.04036, -0.7065, 0.03929, 0.70547],
  [53.5, -581.22, 846.34, 1662.62, 0.04243, -0.70638, 0.04136, 0.70535],
  [57.7, -581.8, 846.28, 1662.62, 0.04453, -0.70625, 0.04347, 0.70522],
  [61.8, -582.38, 846.23, 1662.62, 0.04668, -0.70611, 0.04561, 0.70509],
  [66, -582.98, 846.16, 1662.62, 0.04887, -0.70596, 0.04781, 0.70494],
  [70.2, -583.59, 846.09, 1662.61, 0.0511, -0.7058, 0.05005, 0.70479],
  [74.3, -584.21, 846.02, 1662.61, 0.05338, -0.70563, 0.05233, 0.70462],
  [78.5, -584.84, 845.94, 1662.61, 0.05572, -0.70545, 0.05467, 0.70445],
  [82.6, -585.49, 845.85, 1662.61, 0.05811, -0.70526, 0.05707, 0.70426],
  [86.8, -586.16, 845.76, 1662.61, 0.06056, -0.70505, 0.05952, 0.70406],
  [91, -586.84, 845.66, 1662.61, 0.06307, -0.70483, 0.06203, 0.70384],
  [95.1, -587.53, 845.55, 1662.61, 0.06564, -0.70459, 0.06461, 0.70361],
  [99.3, -588.25, 845.43, 1662.61, 0.06828, -0.70434, 0.06725, 0.70336],
  [103.4, -588.98, 845.31, 1662.61, 0.07098, -0.70407, 0.06996, 0.7031],
  [107.6, -589.73, 845.17, 1662.61, 0.07376, -0.70378, 0.07274, 0.70282],
  [111.8, -590.5, 845.03, 1662.6, 0.07662, -0.70348, 0.0756, 0.70252],
  [115.9, -591.29, 844.88, 1662.6, 0.07955, -0.70315, 0.07854, 0.7022],
  [120.1, -592.1, 844.71, 1662.6, 0.08257, -0.7028, 0.08156, 0.70186],
  [124.2, -592.94, 844.53, 1662.6, 0.08567, -0.70243, 0.08467, 0.70149],
  [128.2, -593.76, 844.35, 1662.6, 0.08873, -0.70205, 0.08774, 0.70111],
  [132.2, -594.61, 844.15, 1662.6, 0.09188, -0.70164, 0.0909, 0.70071],
  [136.2, -595.47, 843.94, 1662.6, 0.09513, -0.7012, 0.09414, 0.70029],
  [140.2, -596.36, 843.72, 1662.6, 0.09846, -0.70074, 0.09748, 0.69983],
  [144.2, -597.28, 843.48, 1662.59, 0.10189, -0.70025, 0.10092, 0.69935],
  [148.2, -598.22, 843.22, 1662.59, 0.10541, -0.69972, 0.10445, 0.69883],
  [152.2, -599.18, 842.95, 1662.59, 0.10904, -0.69917, 0.10808, 0.69828],
  [156.2, -600.17, 842.66, 1662.59, 0.11278, -0.69857, 0.11182, 0.69769],
  [160.2, -601.18, 842.34, 1662.59, 0.11662, -0.69794, 0.11568, 0.69707],
  [164.2, -602.23, 842.01, 1662.59, 0.12058, -0.69726, 0.11964, 0.6964],
  [168.2, -603.3, 841.65, 1662.59, 0.12465, -0.69654, 0.12372, 0.69569],
  [172.2, -604.4, 841.27, 1662.58, 0.12885, -0.69577, 0.12793, 0.69493],
  [176.2, -605.53, 840.87, 1662.58, 0.13317, -0.69495, 0.13225, 0.69413],
  [180.2, -606.69, 840.43, 1662.58, 0.13762, -0.69408, 0.13671, 0.69327],
  [184.2, -607.88, 839.97, 1662.58, 0.1422, -0.69315, 0.1413, 0.69235],
  [188.2, -609.1, 839.48, 1662.58, 0.14692, -0.69216, 0.14603, 0.69137],
  [192.2, -610.35, 838.95, 1662.58, 0.15178, -0.69111, 0.1509, 0.69033],
  [196.2, -611.63, 838.39, 1662.57, 0.15679, -0.68999, 0.15591, 0.68922],
  [200.2, -612.94, 837.79, 1662.57, 0.16195, -0.68879, 0.16108, 0.68804],
  [204.2, -614.29, 837.15, 1662.57, 0.16725, -0.68751, 0.16639, 0.68678],
  [208.2, -615.66, 836.47, 1662.57, 0.17272, -0.68615, 0.17187, 0.68543],
  [212.2, -617.07, 835.75, 1662.57, 0.17835, -0.68471, 0.17751, 0.684],
  [216.2, -618.51, 834.98, 1662.57, 0.18414, -0.68316, 0.18331, 0.68248],
  [220.2, -619.99, 834.15, 1662.56, 0.19011, -0.68152, 0.18928, 0.68085],
  [224.2, -621.49, 833.28, 1662.56, 0.19624, -0.67977, 0.19543, 0.67912],
  [228.2, -623.03, 832.35, 1662.56, 0.20256, -0.67791, 0.20176, 0.67728],
  [232.2, -624.59, 831.36, 1662.56, 0.20906, -0.67592, 0.20826, 0.67532],
  [236.2, -626.19, 830.3, 1662.56, 0.21574, -0.67381, 0.21496, 0.67323],
  [240.2, -627.81, 829.18, 1662.56, 0.22261, -0.67156, 0.22184, 0.671],
  [244.2, -629.46, 827.99, 1662.55, 0.22968, -0.66916, 0.22892, 0.66863],
  [248.2, -631.13, 826.73, 1662.55, 0.23694, -0.66662, 0.23619, 0.66611],
  [252.3, -632.87, 825.36, 1662.55, 0.24455, -0.66385, 0.24381, 0.66337],
  [256.5, -634.66, 823.88, 1662.55, 0.25252, -0.66085, 0.25179, 0.66039],
  [260.6, -636.47, 822.3, 1662.55, 0.26071, -0.65765, 0.26, 0.65722],
  [264.8, -638.3, 820.62, 1662.55, 0.26912, -0.65424, 0.26842, 0.65383],
  [269, -640.15, 818.85, 1662.54, 0.27776, -0.65061, 0.27707, 0.65022],
  [273.1, -642.01, 816.99, 1662.55, 0.28674, -0.64673, 0.28597, 0.64633],
  [277.3, -643.93, 815.15, 1662.57, 0.29624, -0.64245, 0.29545, 0.64203],
  [281.4, -645.87, 813.2, 1662.57, 0.30585, -0.63789, 0.30514, 0.63752],
  [285.6, -647.8, 811.13, 1662.57, 0.31568, -0.63306, 0.31502, 0.63273],
  [289.8, -649.72, 808.94, 1662.56, 0.32572, -0.62793, 0.32511, 0.62763],
  [293.9, -651.63, 806.62, 1662.55, 0.33595, -0.62249, 0.3354, 0.62221],
  [298.1, -653.52, 804.18, 1662.55, 0.34637, -0.61673, 0.34589, 0.61646],
  [302.2, -655.4, 801.61, 1662.54, 0.35697, -0.61065, 0.35657, 0.61036],
  [306.4, -657.27, 798.9, 1662.53, 0.36773, -0.60422, 0.36742, 0.6039],
  [310.6, -659.12, 796.07, 1662.52, 0.37862, -0.59745, 0.37844, 0.59706],
  [314.7, -660.95, 793.1, 1662.51, 0.38964, -0.59032, 0.3896, 0.58984],
  [318.9, -662.76, 790, 1662.49, 0.40077, -0.58282, 0.4009, 0.58222],
  [323, -664.57, 786.78, 1662.48, 0.41203, -0.57495, 0.41232, 0.57416],
  [327.2, -666.35, 783.42, 1662.46, 0.42337, -0.56669, 0.42386, 0.56566],
  [331.4, -668.12, 779.94, 1662.45, 0.43478, -0.55801, 0.4355, 0.55672],
  [335.5, -669.87, 776.32, 1662.43, 0.44624, -0.54888, 0.44725, 0.54732],
  [339.7, -671.61, 772.58, 1662.41, 0.45774, -0.53931, 0.45909, 0.53745],
  [343.8, -673.33, 768.71, 1662.39, 0.46926, -0.52928, 0.47101, 0.52709],
  [348, -675.03, 764.71, 1662.38, 0.48079, -0.51874, 0.48299, 0.51621],
  [352.2, -676.71, 760.59, 1662.35, 0.4923, -0.50767, 0.49505, 0.5048],
  [356.3, -678.21, 756.78, 1662.32, 0.50539, -0.49449, 0.50876, 0.49114],
  [360.5, -679.45, 753.42, 1662.28, 0.52038, -0.47851, 0.5245, 0.47448],
  [364.6, -680.7, 749.89, 1662.24, 0.53481, -0.46208, 0.53977, 0.45728],
  [368.8, -681.93, 746.21, 1662.2, 0.54869, -0.44524, 0.55458, 0.43948],
  [373, -683.17, 742.36, 1662.16, 0.56195, -0.42796, 0.56889, 0.42122],
  [377.1, -684.4, 738.34, 1662.12, 0.57457, -0.41026, 0.58271, 0.40251],
  [381.3, -685.64, 734.15, 1662.08, 0.58652, -0.39217, 0.596, 0.38337],
  [385.4, -686.88, 729.79, 1662.04, 0.59781, -0.3737, 0.60877, 0.36383],
  [389.6, -688.11, 725.26, 1662, 0.60841, -0.35486, 0.621, 0.34391],
  [393.8, -689.35, 720.56, 1661.96, 0.61831, -0.33567, 0.63268, 0.32363],
  [397.9, -690.59, 715.69, 1661.92, 0.6275, -0.31616, 0.6438, 0.30301],
  [402.1, -691.82, 710.65, 1661.88, 0.63597, -0.29634, 0.65434, 0.28207],
  [406.2, -693.06, 705.44, 1661.84, 0.64371, -0.27623, 0.6643, 0.26083],
  [410.4, -694.3, 700.06, 1661.8, 0.65072, -0.25586, 0.67367, 0.23932],
  [414.6, -695.53, 694.51, 1661.75, 0.65697, -0.23524, 0.68244, 0.21756],
  [418.7, -696.77, 688.8, 1661.71, 0.66247, -0.21438, 0.69059, 0.19557],
  [422.9, -698.01, 682.91, 1661.67, 0.66721, -0.19333, 0.69814, 0.17338],
  [427, -699.24, 676.85, 1661.63, 0.67118, -0.17208, 0.70506, 0.15101],
  [431.2, -700.48, 670.62, 1661.59, 0.67437, -0.15068, 0.71134, 0.12849],
  [435.4, -701.72, 664.23, 1661.55, 0.67679, -0.12913, 0.717, 0.10583],
  [439.5, -702.95, 657.66, 1661.51, 0.67843, -0.10746, 0.72201, 0.08306],
  [443.7, -704.19, 650.92, 1661.47, 0.67928, -0.08569, 0.72637, 0.06021],
  [447.8, -705.43, 644.01, 1661.43, 0.67935, -0.06385, 0.73008, 0.03729],
  [452, -706.66, 636.94, 1661.39, 0.67863, -0.04195, 0.73314, 0.01434],
  [456.2, -707.9, 629.69, 1661.35, 0.67713, -0.02003, 0.73554, -0.00862],
  [460.3, -709.14, 622.28, 1661.31, 0.67484, 0.00191, 0.73728, -0.03156],
  [464.5, -710.37, 614.69, 1661.27, 0.67178, 0.02383, 0.73836, -0.05448],
  [468.6, -711.61, 606.94, 1661.22, 0.66793, 0.04571, 0.73878, -0.07733],
  [472.8, -712.85, 599.01, 1661.18, 0.66331, 0.06754, 0.73854, -0.10009],
  [477, -714.08, 590.92, 1661.14, 0.65792, 0.08928, 0.73763, -0.12275],
  [481.1, -715.32, 582.65, 1661.1, 0.65177, 0.11092, 0.73606, -0.14527],
  [485.3, -716.56, 574.22, 1661.06, 0.64486, 0.13243, 0.73383, -0.16764],
  [489.4, -717.79, 565.61, 1661.02, 0.63721, 0.1538, 0.73094, -0.18983],
  [493.6, -719.03, 556.84, 1660.98, 0.62881, 0.175, 0.7274, -0.21181],
  [497.8, -720.27, 547.89, 1660.94, 0.61968, 0.196, 0.7232, -0.23357],
  [501.8, -721.48, 538.96, 1660.9, 0.61003, 0.2164, 0.71846, -0.25466],
  [505.8, -722.67, 530.04, 1660.86, 0.59991, 0.23617, 0.7132, -0.27509],
  [509.8, -723.86, 520.96, 1660.82, 0.58914, 0.25572, 0.70735, -0.29524],
  [513.8, -725.05, 511.73, 1660.78, 0.57774, 0.27502, 0.70092, -0.31511],
  [517.8, -726.24, 502.34, 1660.74, 0.56572, 0.29404, 0.69391, -0.33466],
  [521.8, -727.42, 492.79, 1660.7, 0.55308, 0.31278, 0.68632, -0.35389],
  [525.8, -728.61, 483.08, 1660.66, 0.53985, 0.33122, 0.67816, -0.37276],
  [529.8, -729.8, 473.22, 1660.62, 0.52604, 0.34934, 0.66944, -0.39127],
  [533.8, -730.99, 463.2, 1660.59, 0.51166, 0.36712, 0.66017, -0.40939],
  [537.8, -732.18, 453.03, 1660.55, 0.49673, 0.38455, 0.65035, -0.42711],
  [541.8, -733.37, 442.7, 1660.51, 0.48126, 0.40162, 0.63999, -0.44441],
  [545.8, -734.56, 432.21, 1660.47, 0.46527, 0.4183, 0.62911, -0.46127],
  [549.8, -735.75, 421.56, 1660.43, 0.44877, 0.43459, 0.6177, -0.47768],
  [553.8, -736.94, 410.76, 1660.39, 0.43178, 0.45047, 0.60579, -0.49361],
  [557.8, -738.12, 399.8, 1660.35, 0.41433, 0.46593, 0.59338, -0.50906],
  [561.8, -739.31, 388.68, 1660.31, 0.39642, 0.48095, 0.58048, -0.52401],
  [565.8, -740.5, 377.4, 1660.27, 0.37807, 0.49553, 0.5671, -0.53844],
  [569.8, -741.69, 365.97, 1660.23, 0.3593, 0.50964, 0.55326, -0.55233],
  [573.8, -742.88, 354.38, 1660.19, 0.34014, 0.52328, 0.53896, -0.56568],
  [577.8, -744.07, 342.64, 1660.15, 0.3206, 0.53644, 0.52423, -0.57847],
  [581.8, -745.26, 330.74, 1660.12, 0.3007, 0.54911, 0.50906, -0.59069],
  [585.8, -746.45, 318.68, 1660.08, 0.28046, 0.56127, 0.49348, -0.60232],
  [589.8, -747.64, 306.46, 1660.04, 0.2599, 0.57292, 0.4775, -0.61336],
  [593.8, -748.83, 294.09, 1660, 0.23904, 0.58405, 0.46113, -0.62378],
  [597.8, -750.01, 281.56, 1659.96, 0.2179, 0.59465, 0.44439, -0.63358],
  [601.8, -751.2, 268.87, 1659.92, 0.1965, 0.60471, 0.4273, -0.64275],
  [605.8, -752.39, 256.03, 1659.88, 0.17486, 0.61422, 0.40985, -0.65128],
  [609.8, -753.58, 243.03, 1659.84, 0.15301, 0.62319, 0.39209, -0.65916],
  [613.8, -754.77, 229.87, 1659.8, 0.13096, 0.63159, 0.37401, -0.66638],
  [617.8, -755.96, 216.56, 1659.76, 0.10874, 0.63943, 0.35563, -0.67293],
  [621.8, -757.15, 203.08, 1659.72, 0.08637, 0.64669, 0.33698, -0.6788],
  [625.8, -758.34, 189.45, 1659.68, 0.06387, 0.65338, 0.31807, -0.68399],
  [629.8, -759.53, 175.67, 1659.64, 0.04126, 0.65949, 0.29891, -0.68849],
  [633.8, -760.72, 161.73, 1659.61, 0.01856, 0.66502, 0.27952, -0.69229],
  [637.8, -761.91, 147.63, 1659.57, -0.0042, 0.66996, 0.25993, -0.69539],
  [641.8, -763.13, 137.11, 1658.43, -0.0142, 0.6762, 0.24176, -0.69577],
  [645.8, -763.91, 134.19, 1654.72, -0.00236, 0.68514, 0.22279, -0.6935],
  [649.8, -764.69, 131.15, 1650.99, 0.00925, 0.69358, 0.20332, -0.69103],
  [653.8, -765.47, 127.95, 1647.26, 0.02056, 0.70147, 0.18339, -0.68839],
  [657.8, -766.25, 124.59, 1643.53, 0.03158, 0.7088, 0.16302, -0.68559],
  [661.8, -767.02, 121.08, 1639.8, 0.04232, 0.71552, 0.14224, -0.68265],
  [665.8, -767.8, 117.41, 1636.07, 0.05279, 0.72162, 0.12105, -0.67958],
  [669.8, -768.58, 113.58, 1632.34, 0.063, 0.72706, 0.0995, -0.6764],
  [673.8, -769.36, 109.59, 1628.61, 0.07296, 0.73181, 0.0776, -0.67313],
  [677.8, -770.13, 105.45, 1624.88, 0.08268, 0.73586, 0.05539, -0.66978],
  [681.8, -771.09, 105.22, 1622.22, 0.08704, 0.73783, 0.04448, -0.66787],
  [685.8, -772.07, 107.63, 1620.51, 0.08717, 0.73907, 0.04037, -0.66674],
  [689.8, -773.05, 109.87, 1618.8, 0.08728, 0.74029, 0.03625, -0.66561],
  [693.8, -774.03, 111.96, 1617.09, 0.0874, 0.74148, 0.03212, -0.66448],
  [697.8, -775.01, 113.89, 1615.38, 0.08751, 0.74265, 0.02798, -0.66334],
  [701.8, -775.99, 115.67, 1613.68, 0.08761, 0.7438, 0.02382, -0.66221],
  [705.8, -776.98, 117.29, 1611.97, 0.08771, 0.74491, 0.01966, -0.66108],
  [709.8, -777.96, 118.75, 1610.26, 0.08781, 0.74601, 0.01548, -0.65994],
  [713.8, -778.94, 120.05, 1608.55, 0.08791, 0.74707, 0.01129, -0.65881],
  [717.8, -779.92, 121.2, 1606.84, 0.088, 0.74811, 0.0071, -0.65768],
  [721.8, -780.9, 122.19, 1605.13, 0.08808, 0.74912, 0.00289, -0.65654],
  [725.8, -781.88, 123.02, 1603.43, 0.08817, 0.75011, -0.00133, -0.65541],
  [729.8, -782.86, 123.7, 1601.72, 0.08825, 0.75107, -0.00556, -0.65428],
  [733.8, -783.84, 124.22, 1600.01, 0.08833, 0.752, -0.0098, -0.65314],
  [737.8, -784.82, 124.58, 1598.3, 0.0884, 0.75291, -0.01406, -0.65201],
  [741.8, -785.8, 124.78, 1596.59, 0.08847, 0.75379, -0.01832, -0.65088],
  [745.8, -786.78, 124.83, 1594.88, 0.08854, 0.75464, -0.02259, -0.64974],
  [749.8, -787.76, 124.72, 1593.18, 0.0886, 0.75547, -0.02687, -0.64861],
  [753.8, -788.74, 124.46, 1591.47, 0.08866, 0.75627, -0.03116, -0.64748],
  [757.8, -789.72, 124.04, 1589.76, 0.08872, 0.75704, -0.03546, -0.64635],
  [761.8, -790.7, 123.46, 1588.05, 0.08878, 0.75778, -0.03977, -0.64522],
  [765.8, -791.72, 123.53, 1586.67, 0.08696, 0.75865, -0.04308, -0.64423],
  [769.8, -792.75, 123.68, 1585.37, 0.08461, 0.75954, -0.04608, -0.64329],
  [773.8, -793.78, 123.68, 1584.08, 0.08222, 0.76041, -0.04905, -0.64234],
  [777.8, -794.81, 123.61, 1582.82, 0.07965, 0.76129, -0.05193, -0.6414],
  [781.8, -795.86, 123.47, 1581.6, 0.07689, 0.76216, -0.05471, -0.64047],
  [785.8, -796.91, 123.31, 1580.43, 0.0739, 0.76305, -0.05728, -0.63954],
  [789.8, -797.97, 123.09, 1579.3, 0.07074, 0.76394, -0.05967, -0.63862],
  [793.8, -799.03, 122.82, 1578.21, 0.06745, 0.76484, -0.06191, -0.63768],
  [797.8, -800.1, 122.47, 1577.15, 0.064, 0.76574, -0.06402, -0.63674],
  [801.8, -801.18, 122.06, 1576.13, 0.06041, 0.76666, -0.06599, -0.63579],
  [805.8, -802.26, 121.59, 1575.15, 0.05665, 0.76759, -0.06783, -0.63482],
  [809.8, -803.35, 121.05, 1574.2, 0.05273, 0.76854, -0.06955, -0.63383],
  [813.8, -804.44, 120.44, 1573.29, 0.04865, 0.76949, -0.07115, -0.63281],
  [817.8, -805.54, 119.76, 1572.41, 0.04439, 0.77046, -0.07264, -0.63178],
  [821.8, -806.65, 119.02, 1571.57, 0.03996, 0.77145, -0.07401, -0.63071],
  [825.8, -807.76, 118.2, 1570.76, 0.03536, 0.77245, -0.07528, -0.62961],
  [829.8, -808.89, 117.32, 1569.98, 0.03058, 0.77346, -0.07644, -0.62847],
  [833.8, -810.01, 116.36, 1569.24, 0.02561, 0.77449, -0.07751, -0.62729],
  [837.8, -811.15, 115.33, 1568.53, 0.02047, 0.77553, -0.07847, -0.62607],
  [841.8, -812.29, 114.23, 1567.86, 0.01514, 0.77659, -0.07934, -0.62481],
  [845.8, -813.44, 113.05, 1567.21, 0.00963, 0.77766, -0.08012, -0.62349],
  [849.8, -814.6, 111.79, 1566.6, 0.00393, 0.77874, -0.0808, -0.62211],
  [853.8, -815.77, 110.46, 1566.02, -0.00195, 0.77983, -0.0814, -0.62067],
  [857.8, -816.94, 109.04, 1565.46, -0.00802, 0.78093, -0.08191, -0.61917],
  [861.8, -818.13, 107.57, 1564.95, -0.01433, 0.78204, -0.08232, -0.6176],
  [865.8, -819.32, 106.03, 1564.47, -0.02087, 0.78317, -0.08265, -0.61594],
  [869.8, -820.53, 104.41, 1564.02, -0.0276, 0.7843, -0.0829, -0.6142],
  [873.8, -821.74, 102.71, 1563.59, -0.03452, 0.78543, -0.08308, -0.61238],
  [877.8, -822.97, 100.93, 1563.2, -0.04162, 0.78656, -0.08318, -0.61047],
  [881.8, -824.2, 99.06, 1562.83, -0.04891, 0.78769, -0.08322, -0.60846],
  ] as readonly (readonly [number, number, number, number, number, number, number, number])[],
};
