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
export type DeskMarkSpec = { heightMm: number; faceInFromEndMm: number };
/** ⚰️ Take 2 stood its back 20 mm in front of the clamp (`gapToClampMm: 20`; face ~139 mm in from the end). */
export const DESK_MARK: DeskMarkSpec = { heightMm: 227.9, faceInFromEndMm: 65 };

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
    position: roomPoint(c.uMm / 2, c.topMm, c.offWallMm - spec.faceInFromEndMm - depth * spec.heightMm),
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
 * ⚠ THE RIM IS ASSUMED 280 mm ACROSS (a standard bin): the plate cannot fix the bin's size (its foot is out of shot); at
 * that size it sits 368 mm up, centred u −250, 174 mm out from the desk's end. Another size moves the strike and the rest.
 * Rows: [ms after face-down, centre of mass OFF mm, UP mm, theta rad] (θ 0 upright facing the camera, π/2 face down,
 * π upside down, 3π/2 on its back); every 4 ms of the simulation's 1 ms record. `comLocal`: the centre of mass in mark
 * units (y up the mark, z back→face).
 */
export const DESK_MARK_FALL = {
  comLocal: [0.42544, 0.03661] as const,
  contactMs: 348.2,
  restMs: 489.4,
  contactLocal: [0.2180, 0.8991, 0.0000] as const,
  rows: [
  [0, 1906.96, 758.34, 1.5708],
  [4, 1906.96, 758.33, 1.5713],
  [8, 1906.97, 758.28, 1.5728],
  [12, 1906.99, 758.2, 1.5752],
  [16, 1907.02, 758.09, 1.5785],
  [20, 1907.05, 757.96, 1.5829],
  [24, 1907.09, 757.79, 1.5882],
  [28, 1907.14, 757.59, 1.5944],
  [32, 1907.19, 757.35, 1.6016],
  [36, 1907.25, 757.09, 1.6098],
  [40, 1907.32, 756.8, 1.6189],
  [44, 1907.38, 756.47, 1.629],
  [48, 1907.45, 756.11, 1.6401],
  [52, 1907.53, 755.72, 1.6521],
  [56, 1907.6, 755.3, 1.6651],
  [60, 1907.67, 754.84, 1.679],
  [64, 1907.74, 754.35, 1.694],
  [68, 1907.81, 753.83, 1.7099],
  [72, 1907.88, 753.28, 1.7268],
  [76, 1907.93, 752.69, 1.7446],
  [80, 1907.98, 752.06, 1.7635],
  [84, 1908.03, 751.41, 1.7833],
  [88, 1908.06, 750.72, 1.8041],
  [92, 1908.08, 750, 1.8259],
  [96, 1908.08, 749.24, 1.8486],
  [100, 1908.08, 748.45, 1.8724],
  [104, 1908.06, 747.62, 1.897],
  [108, 1908.04, 746.76, 1.9227],
  [112, 1908.02, 745.85, 1.9492],
  [116, 1907.99, 744.9, 1.9767],
  [120, 1907.97, 743.91, 2.005],
  [124, 1907.96, 742.86, 2.0342],
  [128, 1907.95, 741.76, 2.0641],
  [132, 1907.95, 740.59, 2.0949],
  [136, 1907.97, 739.36, 2.1263],
  [140, 1908, 738.04, 2.1585],
  [144, 1908.04, 736.65, 2.1912],
  [148, 1908.1, 735.15, 2.2245],
  [152, 1908.17, 733.56, 2.2582],
  [156, 1908.26, 731.85, 2.2924],
  [160, 1908.36, 730.01, 2.3268],
  [164, 1908.47, 728.04, 2.3615],
  [168, 1908.58, 725.92, 2.3962],
  [172, 1908.69, 723.64, 2.431],
  [176, 1908.8, 721.21, 2.4658],
  [180, 1908.92, 718.62, 2.5006],
  [184, 1909.03, 715.88, 2.5353],
  [188, 1909.14, 712.98, 2.5701],
  [192, 1909.25, 709.92, 2.6049],
  [196, 1909.37, 706.7, 2.6396],
  [200, 1909.48, 703.33, 2.6744],
  [204, 1909.59, 699.8, 2.7092],
  [208, 1909.7, 696.11, 2.7439],
  [212, 1909.81, 692.27, 2.7787],
  [216, 1909.93, 688.26, 2.8135],
  [220, 1910.04, 684.11, 2.8483],
  [224, 1910.15, 679.79, 2.883],
  [228, 1910.26, 675.32, 2.9178],
  [232, 1910.38, 670.69, 2.9526],
  [236, 1910.49, 665.9, 2.9873],
  [240, 1910.6, 660.96, 3.0221],
  [244, 1910.71, 655.86, 3.0569],
  [248, 1910.82, 650.61, 3.0916],
  [252, 1910.94, 645.19, 3.1264],
  [256, 1911.05, 639.62, 3.1612],
  [260, 1911.16, 633.89, 3.1959],
  [264, 1911.27, 628.01, 3.2307],
  [268, 1911.39, 621.97, 3.2655],
  [272, 1911.5, 615.77, 3.3003],
  [276, 1911.61, 609.41, 3.335],
  [280, 1911.96, 602.99, 3.3636],
  [284, 1913.12, 596.75, 3.3702],
  [288, 1914.29, 590.34, 3.3769],
  [292, 1915.46, 583.78, 3.3835],
  [296, 1916.62, 577.06, 3.3901],
  [300, 1917.79, 570.19, 3.3968],
  [304, 1918.96, 563.15, 3.4034],
  [308, 1920.12, 555.96, 3.4101],
  [312, 1921.29, 548.62, 3.4167],
  [316, 1922.46, 541.11, 3.4233],
  [320, 1923.62, 533.45, 3.43],
  [324, 1924.79, 525.64, 3.4366],
  [328, 1925.96, 517.66, 3.4433],
  [332, 1927.12, 509.53, 3.4499],
  [336, 1928.29, 501.24, 3.4565],
  [340, 1929.46, 492.8, 3.4632],
  [344, 1930.62, 484.2, 3.4698],
  [348, 1931.79, 475.44, 3.4765],
  [352.2, 1934.45, 474.4, 3.5018],
  [356.3, 1937.09, 473.59, 3.5272],
  [360.3, 1939.74, 472.71, 3.5531],
  [364.3, 1942.41, 471.75, 3.5793],
  [368.4, 1945.08, 470.7, 3.6058],
  [372.4, 1947.77, 469.56, 3.6328],
  [376.5, 1950.47, 468.33, 3.6602],
  [380.5, 1953.18, 467, 3.688],
  [384.5, 1955.87, 465.59, 3.7161],
  [388.5, 1958.57, 464.07, 3.7447],
  [392.5, 1961.28, 462.45, 3.7738],
  [396.5, 1963.98, 460.71, 3.8035],
  [400.5, 1966.69, 458.86, 3.8338],
  [404.5, 1969.39, 456.89, 3.8647],
  [408.5, 1972.09, 454.79, 3.8963],
  [412.5, 1974.78, 452.55, 3.9287],
  [416.6, 1977.48, 450.15, 3.9619],
  [420.6, 1980.14, 447.62, 3.9959],
  [424.6, 1982.78, 444.93, 4.0307],
  [428.7, 1985.38, 442.09, 4.0662],
  [432.7, 1987.93, 439.1, 4.1026],
  [436.7, 1990.43, 435.93, 4.1398],
  [440.8, 1992.86, 432.6, 4.1779],
  [444.8, 1995.21, 429.1, 4.2168],
  [448.9, 1997.48, 425.43, 4.2567],
  [452.9, 1999.65, 421.57, 4.2976],
  [456.9, 2001.7, 417.54, 4.3393],
  [461, 2003.63, 413.33, 4.3821],
  [465, 2005.41, 408.94, 4.4259],
  [469.1, 2007.03, 404.37, 4.4707],
  [473.1, 2008.48, 399.62, 4.5165],
  [477.1, 2009.72, 394.76, 4.5629],
  [481.1, 2010.75, 389.72, 4.6104],
  [485.1, 2011.56, 384.54, 4.6589],
  [489.1, 2012.13, 379.2, 4.7084],
  [489.4, 2012.17, 378.77, 4.7124],
  ] as readonly (readonly [number, number, number, number])[],
};
