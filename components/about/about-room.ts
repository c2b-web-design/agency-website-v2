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
