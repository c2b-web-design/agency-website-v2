"use client";

/**
 * /about §2 — the role-card canvas. ⛔ THE FLOOR PAIR, CD AND CS, 14 September 2026.
 *
 * ⛔⛔ THIS IS THE FIRST WebGL CONTEXT ON `/about`, AND IT IS THE §5a STRUCTURE.
 * Built on Carl's explicit instruction. ⚠⚠ The §5a note exists and was NOT routed
 * to the Architect before this landed:
 * `live-work/structural-decision-note-about-canvas.md`. ⛔ The skip was Carl's
 * call, which is sufficient authority — recorded here rather than left to be
 * discovered, because the two prior instances of this exact shape (the warm-up
 * canvas, `NextStepMeshButton`) cost four sessions and a week, and neither was
 * caught by any instrument.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * ⛔⛔ THE CARDS STAND ON THE FLOOR. THIS REPLACES AN ORTHOGRAPHIC FIT.
 * ══════════════════════════════════════════════════════════════════════════
 *
 * ⚠⚠ THREE EARLIER VERSIONS WERE WRONG AND THE PROGRESSION IS WORTH KEEPING:
 *
 *   1. PERSPECTIVE + INVENTED DEPTH. `CARD_DEPTH_MM = 3200`, a number chosen from
 *      nothing. Carl: *"youve just put a random card with a background right in
 *      the middle of the screen."*
 *   2. ORTHOGRAPHIC FIT TO THE GUIDE BOXES. Correct on the guides, but face-on
 *      flat rectangles — no yaw, no floor.
 *   3. ORTHOGRAPHIC + RAIL MIDPOINTS. Both cards centred on the midpoints, which
 *      pushed them BELOW THE PLATE (CD by 0.025, CS by 0.041) and overlapped them
 *      by 16% of the plate width. ⛔ Each time the placement was verified and the
 *      resulting EXTENTS were not.
 *
 * ⛔ CARL'S CORRECTION, 14 September: *"Look at the angle of the blue and pink
 * lines. The cards should sit on that and be at almost 90 deg from each other —
 * not face on."* **The rails carry a DIRECTION, not just a position.**
 *
 * ⚠ "NO LEAN" MEANS NO BACKWARD TILT, NOT NO ROTATION. The cards are upright and
 * yawed about Y. ⛔ An X rotation is what Carl ruled out: *"standing upright, no
 * lean."*
 *
 * ══════════════════════════════════════════════════════════════════════════
 * ⚠⚠ THE UNIT BRIDGE — millimetres to floor units, on ONE assumption
 * ══════════════════════════════════════════════════════════════════════════
 *
 * The floor model puts the camera at height 1.0 in arbitrary units; the cards are
 * built in millimetres. ⛔ They are bridged by `DESK_HEIGHT_MM = 750` — the
 * record's single stated assumption, and the only real dimension available.
 *
 * ⚠ IF 750 IS WRONG, EVERY DIMENSION SCALES TOGETHER AND NOTHING ABOUT THE DESIGN
 * CHANGES. The cards are specified relative to each other and to the room, never
 * absolutely. Stated so a future reader does not treat 750 as measured.
 *
 * ⛔ CAMERA HEIGHT IS ASSUMED EQUAL TO DESK HEIGHT. A seated eye-line and a desk
 * top are close but not identical. **Unasserted, and it sets the floor's scale.**
 *
 * ══════════════════════════════════════════════════════════════════════════
 * ⚠ WHAT THIS BUILD DEPENDS ON THAT IS NOT SETTLED
 * ══════════════════════════════════════════════════════════════════════════
 *
 * ⛔ THE CANVAS BOX MUST BE THE PLATE'S RENDERED BOX. §2 is `object-contain`
 * today and the maths below assumes it. **If the fit mode ever reverts to
 * `object-cover`, every card shifts** — §2's final aspect and fit mode are listed
 * as OPEN in the §5a note. ⚠ Register with `camera.setViewOffset` if cover wins.
 */

import * as THREE from "three";
import { useEffect, useMemo } from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import {
  cardDims,
  CD_CARD_HEIGHT_MM,
  CS_CARD_HEIGHT_MM,
  GUIDE_CD,
  GUIDE_CS,
  /* ⛔ The wall pair — solved from the plate 17 September 2026. */
  GUIDE_CA_QUAD,
  GUIDE_CB_QUAD,
  CA_CARD_ASPECT,
  CB_CARD_ASPECT,
  CA_CARD_HEIGHT_MM,
  CB_CARD_HEIGHT_MM,
  CD_FACE_YAW_DEG,
  CS_FACE_YAW_DEG,
  TENT_POLE_RATIO,
  CAMERA_VFOV_DEG,
  CAMERA_PITCH_DEG,
  DESK_HEIGHT_MM,
} from "./about-card-geometry";
import {
  CA_FACE_TRANSMISSION,
  CD_FACE_TRANSMISSION,
  GLASS_FACE_TRANSMISSION,
} from "./about-card-glass";
import { AboutCardMesh } from "./about-card-mesh";
import { RoomEnvironment } from "./room-environment";
import {
  CA_NEON_PEAK,
  CB_NEON_PEAK,
  CD_NEON_PEAK,
  CS_NEON_PEAK,
  FLOOR_NEON_GLOW_HEX,
  FLOOR_NEON_TUBE_HEX,
  NEON_GLOW_HEX,
  NEON_TUBE_HEX,
  neonHex,
  neonMode,
  neonNumber,
  type NeonChannel,
} from "./about-neon";
import { NeonBloom } from "./neon-bloom";
import { etchEnabled, etchSettings, type EtchSettings } from "./card-etch";
import {
  CardExtrudedText,
  extrudeCard,
  extrudeEnabled,
  extrudeSettings,
  LIGHT_DISTANCE_MM as EXTRUDE_LIGHT_DISTANCE_MM,
} from "./card-extrude";
import { aboutCardCopy } from "./about-card-copy";

/** The plate is 3:2. ⚠ Guide and rail fractions are of the PLATE, not the stage. */
const PLATE_W = 2560;
const PLATE_H = 1707;
/** Focal length in plate pixels — `camera-solve-11-september.md`. */
const FOCAL_PX = 1282;

/** Camera height in floor units. Everything below is relative to it. */
const CAM_H = 1;
/** Millimetres per floor unit, via the one assumed real dimension. */
const MM_PER_UNIT = DESK_HEIGHT_MM / CAM_H;

const PITCH = (-CAMERA_PITCH_DEG * Math.PI) / 180;
const COS_P = Math.cos(PITCH);
const SIN_P = Math.sin(PITCH);

/**
 * Back-project a plate fraction onto the floor plane.
 *
 * ⛔⛔ VERIFIED TO ROUND-TRIP AT 0.0000000. A point taken from the plate, dropped
 * onto the floor and projected back lands exactly where it started, at every rail
 * endpoint and midpoint.
 *
 * ⚠⚠ AND A CORRECTION WORTH KEEPING: an earlier check reported ~19px and ~36px
 * "errors" and was itself wrong. It compared the projection of the **3D midpoint
 * of the rail** against the **2D midpoint of its drawn endpoints** — genuinely
 * different points, because under perspective the receding half of a line takes
 * less screen space than the near half. ⛔ Nothing was broken. **The model was
 * declared unreliable on that false reading and a corrective pass was proposed
 * for a fault that did not exist.**
 *
 * ⚠ Carl chose the DRAWN midpoint: *"The thick spans midpoint should align with
 * the bottom edges rim."* It is what he sees and nudges, and it is PROVISIONAL.
 */
function floorPoint(fx: number, fy: number) {
  const px = (fx - 0.5) * PLATE_W;
  const py = (0.5 - fy) * PLATE_H;
  const pz = -FOCAL_PX;
  const wy = py * COS_P - pz * SIN_P;
  const wz = py * SIN_P + pz * COS_P;
  const t = -CAM_H / wy;
  return { x: px * t, y: -CAM_H, z: wz * t };
}

/**
 * One card, standing on the floor at its rail.
 *
 * ⛔⛔ ONE FUNCTION, CALLED PER CARD — THE FAMILY RULE IN CODE. Carl: *"The 4
 * cards are all different sizes, therefore there will be 4 individual cards all
 * built of the proto card architecture."*
 *
 * ⚠ "IN PROPORTION" IS WHY `cardDims` IS THE SOURCE. Corner radius, rim bead,
 * bevel, face-proud and crown are all RATIOS OF HEIGHT, so a different height
 * rescales the whole family together and nothing inside the card changes shape.
 *
 * ⛔ THE CARD'S SIZE STILL COMES FROM ITS GUIDE RECTANGLE — measured off the
 * plate and approved by Carl's eye. The RAIL supplies only position and yaw.
 */
/**
 * ⛔⛔ STAGE FRACTIONS -> PLATE FRACTIONS. THE SAME BUG THAT MISPLACED THE RAIL
 * ALSO MISPLACED EVERY CARD, AND IT WENT UNNOTICED FOR FOUR PLACEMENTS.
 *
 * ⚠⚠ `/proto/wall` renders the plate `object-cover` in a stage of aspect
 * 1906/905 = 2.1061 against the plate's 3:2. Cover on a wider box matches the
 * WIDTHS and crops top and bottom, so the tool shows only the middle **71.222%**
 * of the plate's height. ⛔ `INITIAL_RAIL` and every midpoint derived from it are
 * fractions of THAT window, not of the image.
 *
 * ⛔ `floorPoint()` expects PLATE fractions. Feeding it stage fractions put each
 * card's base tens of percent too low — which is why the cards never sat on their
 * rails no matter how exactly the arithmetic "verified".
 *
 * ⚠ x is unchanged: cover matched the widths.
 *
 * ⛔ THE GUIDE RECTANGLES ARE NOT AFFECTED — those were segmented directly from
 * the plate image and are already in plate space.
 *
 * ⚠ UNASSERTED: nothing checks the tool's stage aspect is still 1906/905. It is a
 * settable input; change it and this conversion silently becomes wrong.
 */
const STAGE_CROP = 0.14389;
const STAGE_VISIBLE = 0.71222;
const stageToPlateY = (yStage: number) => STAGE_CROP + yStage * STAGE_VISIBLE;

/**
 * One card, standing on the floor at its rail.
 *
 * ⛔⛔ ONE FUNCTION, CALLED PER CARD — THE FAMILY RULE IN CODE. Carl: *"The 4
 * cards are all different sizes, therefore there will be 4 individual cards all
 * built of the proto card architecture."*
 *
 * ⚠ "IN PROPORTION" IS WHY `cardDims` IS THE SOURCE. Corner radius, rim bead,
 * bevel, face-proud and crown are all RATIOS OF HEIGHT, so a different height
 * rescales the whole family together and nothing inside the card changes shape.
 *
 * ⛔ THE CARD'S SIZE STILL COMES FROM ITS GUIDE RECTANGLE — measured off the
 * plate and approved by Carl's eye. The RAIL supplies only position and yaw.
 */
function placeCard(
  guide: { x0: number; y0: number; x1: number; y1: number },
  heightMm: number,
  anchorStage: { x: number; y: number },
  faceYawDeg: number,
  /**
   * ⛔⛔ WHICH BOTTOM CORNER SITS ON THE ANCHOR. The two floor cards MIRROR each
   * other and the sign flip is load-bearing:
   *
   *   "right"  CD — bottom-RIGHT corner on PL's B handle (upper-right end)
   *   "left"   CS — bottom-LEFT  corner on PR's A handle (upper-left end)
   *
   * ⚠⚠ GET THIS BACKWARDS AND THE CARD JUMPS A FULL WIDTH IN THE WRONG
   * DIRECTION. Anchoring by the right corner means stepping the centre BACK along
   * local +X; anchoring by the left means stepping it FORWARD. Both cards then
   * grow AWAY from the middle of the room, which is what stops them colliding
   * across the centre — the fault that made the pair overlap by 16% of the plate
   * when both were centred on their midpoints.
   */
  anchorCorner: "left" | "right",
) {
  /* Size: the guide's own aspect, at the card's own height. */
  const guideW = (guide.x1 - guide.x0) * (PLATE_W / PLATE_H);
  const guideH = guide.y1 - guide.y0;
  const dims = cardDims(heightMm, guideW / guideH);
  /**
   * ⛔ THE TENT POLE, NOT THE OLD CROWN — 14 September 2026. `TENT_POLE_RATIO` is
   * the dial for the pinned membrane; `CROWN_RATIO` was back-derived to hold 27.9°
   * on the superseded superellipse profile and does not transfer to a different
   * surface. ⚠ Carl is tuning this by eye, starting quiet.
   */
  const crownMm = heightMm * TENT_POLE_RATIO;

  /**
   * ⛔⛔ THE ANCHOR IS THE CARD'S BOTTOM-RIGHT CORNER, NOT ITS CENTRE — Carl,
   * 14 September: *"put the right bottom corner of the left card on the thicker
   * line on the right circle."* ⚠ The "right circle" is the B handle, the
   * upper-right end of the pinned span, NOT the midpoint used before.
   *
   * ⚠ CONVERTED FROM STAGE TO PLATE SPACE FIRST — see `stageToPlateY`.
   */
  const base = floorPoint(anchorStage.x, stageToPlateY(anchorStage.y));

  const scale = 1 / MM_PER_UNIT;
  const halfH = (dims.heightMm / 2) * scale;
  const halfW = (dims.widthMm / 2) * scale;

  /**
   * ⛔⛔ THE CORNER OFFSET IS APPLIED IN THE CARD'S OWN ROTATED FRAME, AND THAT IS
   * NOT A DETAIL. The card is yawed, so its "right" is along its LOCAL +X after
   * rotation — not world +X. Stepping back by `halfW` in world space would put the
   * corner somewhere else entirely, and the error would grow with the yaw angle.
   *
   * ⚠ The mesh is built in XY facing +Z, so local +X maps to world
   * (cos(yaw), 0, -sin(yaw)) under a Y-rotation.
   */
  const yaw = (faceYawDeg * Math.PI) / 180;
  const rightX = Math.cos(yaw);
  const rightZ = -Math.sin(yaw);

  /**
   * ⛔ THE SIGN IS THE MIRROR. Anchoring by the RIGHT corner puts the centre a
   * half-width BACK along local +X; anchoring by the LEFT puts it a half-width
   * FORWARD. ⚠ Both cards then grow away from the room's centre.
   */
  const dir = anchorCorner === "right" ? -1 : 1;

  return {
    dims,
    crownMm,
    scale,
    position: [
      base.x + dir * rightX * halfW,
      base.y + halfH,
      base.z + dir * rightZ * halfW,
    ] as [number, number, number],
    rotationY: yaw,
  };
}

/**
 * ⛔⛔ ONE WALL CARD, HUNG ON ITS WALL — added 17 September 2026.
 *
 * ⚠⚠ THIS IS NOT `placeCard` WITH A DIFFERENT NUMBER, AND THE DIFFERENCE IS
 * STRUCTURAL. A floor card STANDS: its bottom edge meets the floor plane, so
 * `floorPoint` back-projects one anchor and the card rises from it. A wall card
 * HANGS: nothing touches the floor, and its plane is VERTICAL. There is no floor
 * intersection to solve, so the position comes from the quad itself.
 *
 * ⛔ THE METHOD — back-project all four measured corners onto the card's own
 * plane, then read the centre, the size and the yaw off the recovered rectangle.
 * **The same solve that produced the aspect produces the placement**, so the card
 * cannot disagree with the guide it was measured from.
 *
 * ⚠ CARL'S FAMILY RULE HOLDS UNCHANGED: *"A shape that has a rim, bevel and
 * curved face. The corners can be the same. A corner is a corner no matter what
 * the dimensions."* ⛔ `cardDims` is still the single blueprint — only height and
 * aspect differ. **Nothing about the card's character is re-specified here.**
 */
function placeWallCard(
  quad: readonly { x: number; y: number }[],
  heightMm: number,
  aspect: number,
) {
  /**
   * Back-project a plate fraction to a unit ray in world space, undoing the
   * camera pitch exactly as `floorPoint` does — but WITHOUT intersecting the
   * floor, because a wall card never meets it.
   */
  const ray = (fx: number, fy: number) => {
    const px = (fx - 0.5) * PLATE_W;
    const py = (0.5 - fy) * PLATE_H;
    const pz = -FOCAL_PX;
    const wy = py * COS_P - pz * SIN_P;
    const wz = py * SIN_P + pz * COS_P;
    const len = Math.hypot(px, wy, wz) || 1;
    return { x: px / len, y: wy / len, z: wz / len };
  };

  const R = quad.map((p) => ray(p.x, p.y));

  /**
   * ⛔ THE PLANE'S NORMAL, from the two edge directions' vanishing points.
   * ⚠ Cross products of image lines, lifted through the camera — the same
   * construction the aspect solve used, so the two cannot drift apart.
   */
  const cross = (
    a: { x: number; y: number; z: number },
    b: { x: number; y: number; z: number },
  ) => ({
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  });
  const norm = (v: { x: number; y: number; z: number }) => {
    const L = Math.hypot(v.x, v.y, v.z) || 1;
    return { x: v.x / L, y: v.y / L, z: v.z / L };
  };

  /* Horizontal edge direction: where the top and bottom edges meet at infinity. */
  const dH = norm(cross(cross(R[0], R[1]), cross(R[3], R[2])));
  const n = norm(cross(dH, norm(cross(cross(R[0], R[3]), cross(R[1], R[2])))));

  /**
   * ⛔ INTERSECT EACH CORNER RAY WITH THE CARD'S PLANE. The plane is pinned by
   * putting the first corner at unit depth; every other corner follows, and the
   * rectangle's own proportions come out of the arithmetic rather than being
   * imposed on it.
   */
  const dot = (
    a: { x: number; y: number; z: number },
    b: { x: number; y: number; z: number },
  ) => a.x * b.x + a.y * b.y + a.z * b.z;
  const d0 = dot(n, R[0]);
  const P = R.map((r) => {
    const t = d0 / dot(n, r);
    return { x: r.x * t, y: r.y * t, z: r.z * t };
  });

  /* Centre of the recovered rectangle. */
  const c = {
    x: (P[0].x + P[1].x + P[2].x + P[3].x) / 4,
    y: (P[0].y + P[1].y + P[2].y + P[3].y) / 4,
    z: (P[0].z + P[1].z + P[2].z + P[3].z) / 4,
  };

  /**
   * ⛔⛔ THE SCALE IS SET BY THE CARD'S HEIGHT, NOT BY THE PLANE'S ARBITRARY DEPTH.
   * The intersection above fixed corner 0 at unit depth, which is a free choice —
   * so the recovered rectangle is the right SHAPE at the wrong SIZE. Rescaling
   * the centre along its own ray by (wanted height / recovered height) puts the
   * card where a card of that height actually sits.
   *
   * ⚠ THIS IS THE FLOOR PAIR'S LESSON APPLIED, NOT A NEW IDEA. Their heights are
   * *"the heights at which each card, standing on its rail, subtends exactly its
   * guide rectangle's on-screen size"* — and an earlier 860mm, taken from an
   * unrelated face-on fit, made the cards wider than the desks. **Size and
   * position must come from the same source.**
   */
  const recoveredH =
    (Math.hypot(P[0].x - P[3].x, P[0].y - P[3].y, P[0].z - P[3].z) +
      Math.hypot(P[1].x - P[2].x, P[1].y - P[2].y, P[1].z - P[2].z)) /
    2;
  const wantH = heightMm / MM_PER_UNIT;
  const k = wantH / (recoveredH || 1);

  /**
   * ⛔ THE YAW THE MESH NEEDS. The mesh is built in XY facing +Z, so it must be
   * turned to face along the plane's normal. ⚠ The normal may point away from the
   * camera depending on corner winding; flipping it when it does keeps the card's
   * face toward the room rather than into the wall.
   */
  const facing = n.z > 0 ? { x: -n.x, y: -n.y, z: -n.z } : n;
  const rotationY = Math.atan2(facing.x, facing.z) + Math.PI;

  return {
    dims: cardDims(heightMm, aspect),
    crownMm: heightMm * TENT_POLE_RATIO,
    /**
     * ⚠ MILLIMETRES -> FLOOR UNITS, the same conversion the floor pair applies.
     * `cardDims` works in millimetres, so the mesh is built at millimetre
     * magnitudes and the group must scale it down.
     */
    scale: 1 / MM_PER_UNIT,
    position: [c.x * k, c.y * k, c.z * k] as [number, number, number],
    rotationY,
  };
}

/**
 * ⚠⚠ THE FOUR-LAMP SPOTLIGHT RIG WAS BUILT HERE AND IS REMOVED — 17 September
 * 2026, on Carl's verdict from the screen.
 *
 * **Carl:** *"It doesnt look right. its acting like a street light. The best
 * representation ive seen is before we started changing/adding lights when the
 * right side cards were grey and the left side blowwn out. Return them to that
 * state."*
 *
 * ⛔⛔ THE FAULT IS THE LIGHT TYPE, NOT ITS PLACEMENT, AND THAT IS WHY NONE OF
 * THE TUNING HELPED. A `spotLight` has a POSITION, so it throws a cone and falls
 * off with distance — it puts a bright POOL on one part of a surface and darkens
 * everything outside it. ⚠ On a card the size of these, that pool reads as a
 * lamp shining ON the card rather than as light revealing its shape: a street
 * light. **Four of them made four pools.**
 *
 * ⛔ A `directionalLight` has NO position and NO falloff — every point on a face
 * takes the same incoming direction, so the only thing that varies across the
 * surface is the SURFACE ITSELF. **That is what makes a crown legible, and it is
 * what the bench uses.**
 *
 * ⚠⚠ THE WHOLE SEQUENCE IS RECORDED BECAUSE THE REASONING WAS SOUND AND THE
 * RESULT WAS STILL WRONG — four measured iterations, each fixing the previous
 * one's real defect:
 *
 *     four raking spots       -> cumulative clipping, CA at 2.949
 *     cones to stop spill     -> all four at N·L 0.482, no cross-talk
 *     rim axis, per Carl      -> N·L 0.0000, face on ambient only
 *     25deg swing to the face -> N·L 0.4226, matched to the bench
 *
 * ⛔ **Every step measured clean. The screen still said street light.** Rule 9:
 * rendered output is the truth for visual work, and Carl's eye is the instrument.
 *
 * ⚠ KEPT AS A NOTE RATHER THAN CODE. If per-card lamps are ever wanted again —
 * Carl's own chunk-3 spec mentions *"4 individual lights pointed at each card"* —
 * **they should be directional, or the pooling returns.**
 */



/**
 * ⛔⛔ THE ROOM AS A CAMERA-MATCHED DEPTH PROXY — rebuilt 18 September 2026.
 *
 * ⚠⚠ **THE PHOTOGRAPH IS STILL THE SOURCE OF EVERY PIXEL. THIS GEOMETRY ONLY
 * SUPPLIES DEPTH**, so `MeshPhysicalMaterial` transmission has something in the
 * scene to refract. ⛔ **It is NOT a 3D reconstruction of the room** and must not
 * be grown into one.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * ⛔⛔ EVERY VERTEX IS AN UNPROJECTED SCREEN POINT. THAT IS THE WHOLE FIX.
 * ══════════════════════════════════════════════════════════════════════════
 *
 *     NDC point  ->  camera ray  ->  plane intersection  ->  vertex
 *     the SAME NDC point  ->  the photograph's UV
 *
 * ⛔ **So a vertex appears at exactly the screen position its UV was taken
 * from**, by construction. Framing cannot drift, because nothing derives the
 * position except the camera itself.
 *
 * ⚠⚠ **THE PREVIOUS BUILD DERIVED VERTICES FROM PLATE FRACTIONS AND THEN CLAMPED
 * THEM, AND THAT WAS THE BUG.** Past a `FAR` limit it clamped `z` and scaled `x`
 * **while leaving `y` untouched** — which lifts the vertex OFF the camera ray
 * that generated its UV. The vertex then draws its photograph pixel at the wrong
 * screen position, non-uniformly across the grid, so the whole room appeared to
 * shift and zoom relative to the cards. ⛔ **The cards never moved. The
 * background's camera-to-image mapping did.**
 *
 * ⚠ AND IT WAS NOT AN `object-contain` FAULT, WHICH WAS THE FIRST DIAGNOSIS.
 * **Measured, 18 September: the canvas box and the `object-contain` displayed
 * image box agree to 0.00px at 1440 and 1920** — the wrapper is `aspect-[3/2]`,
 * the plate's own aspect, so the letterbox offsets inside the canvas are zero.
 * ⛔ Recorded because a plausible wrong cause was nearly built against.
 *
 * ⚠⚠ **THE NDC ROUTE IS STILL THE RIGHT ONE EVEN THOUGH THE OFFSETS ARE ZERO**:
 * it is correct by construction rather than by coincidence, so it survives a
 * viewport where the boxes do NOT coincide — **and one exists: at 800x1200 the
 * canvas letterboxes differently and the boxes diverge by 338px.**
 *
 * ⛔ THE HORIZON IS HANDLED BY BOUNDING THE GRID, NOT BY CLAMPING VERTICES.
 * Rays at and above it never meet the floor; the floor grid stops just short and
 * the wall takes everything above.
 */
function RoomBackplate() {
  const texture = useLoader(THREE.TextureLoader, "/about-studio-source.jpg");
  /* ⛔ `contact-field-canvas.tsx:806`: omitting this double-applies the transfer
     function. ⚠ Via `Object.assign` — the lint rule objects to mutating a hook's
     return value directly. */
  Object.assign(texture, { colorSpace: THREE.SRGBColorSpace });

  const { floor, wall } = useMemo(() => {
    const ASPECT = 1.5; // the canvas box, `aspect-[3/2]`, and the plate's own
    const tanV = Math.tan((CAMERA_VFOV_DEG * Math.PI) / 360);
    const tanH = tanV * ASPECT;

    /** NDC -> world ray direction, through the solved camera's pitch. */
    const rayDir = (nx: number, ny: number) => {
      const dx = nx * tanH;
      const dy = ny * tanV;
      const dz = -1;
      return {
        x: dx,
        y: dy * COS_P - dz * SIN_P,
        z: dy * SIN_P + dz * COS_P,
      };
    };

    /**
     * ⛔ THE HORIZON IN NDC, DERIVED not guessed: the ray whose world y-component
     * is zero is parallel to the floor.
     *
     * ⛔⛔ SIGN CORRECTED, 18 September 2026. It read
     * `SIN_P / (COS_P * tanV)` and returned **-0.33794**; the horizon is
     * **+0.33794**.
     *
     * ⚠⚠ THE DERIVATION, because the old value looked plausible and was not:
     * `rayDir` gives `y = ny*tanV*COS_P - dz*SIN_P` with `dz = -1`, i.e.
     * `y = ny*tanV*COS_P + SIN_P`. Setting `y = 0` gives
     * `ny = -SIN_P / (tanV*COS_P)`. **The minus sign was dropped.** Verified by
     * substitution: at +0.33794 the y-component is 2.8e-17; at -0.33794 it is
     * **-0.43901**, which is not a horizon at all.
     *
     * ⚠ THE COMMENT WAS RIGHT WHILE THE CODE WAS WRONG — this note previously
     * read *"ny ~= 0.400"*, a POSITIVE number, sitting directly above a line
     * that computed a negative one. ⛔ Nothing in code checked the two agreed.
     *
     * ⚠⚠ THIS WAS **NOT** WHY THE PROXY WAS INVISIBLE — that was the winding,
     * below. Both grids built finite, bounded, NaN-free vertices either way.
     * **Fixing this alone would have changed nothing on screen**, which is
     * exactly how a real bug can be mistaken for a failed fix.
     */
    const nyHorizon = -SIN_P / (COS_P * tanV);
    /* ⚠ Stop just short — at the horizon itself `t` diverges. */
    const nyFloorTop = nyHorizon - 0.02;

    /** Build a grid between two NDC y values, intersecting `plane`. */
    const grid = (
      ny0: number,
      ny1: number,
      hit: (d: { x: number; y: number; z: number }) => [number, number, number],
      DIV = 48,
    ) => {
      const pos: number[] = [];
      const uv: number[] = [];
      const idx: number[] = [];
      for (let iy = 0; iy <= DIV; iy++) {
        const ny = ny0 + ((ny1 - ny0) * iy) / DIV;
        for (let ix = 0; ix <= DIV; ix++) {
          const nx = -1 + (2 * ix) / DIV;
          pos.push(...hit(rayDir(nx, ny)));
          /* ⛔ THE UV IS THE SCREEN POINT ITSELF. The plate fills the canvas, so
             NDC maps linearly to the photograph. ⚠ This is the invariant the old
             build broke. */
          uv.push((nx + 1) / 2, (ny + 1) / 2);
        }
      }
      for (let iy = 0; iy < DIV; iy++) {
        for (let ix = 0; ix < DIV; ix++) {
          const a = iy * (DIV + 1) + ix;
          /**
           * ⛔⛔ WINDING REVERSED, 18 September 2026. THIS IS WHY THE PROXY WAS
           * INVISIBLE FOR THE WHOLE OF ITS FIRST DAY.
           *
           * ⚠⚠ The original order — `a, a+DIV+1, a+1` — winds CLOCKWISE as seen
           * from this camera, so every triangle was BACK-FACING and the GPU
           * culled all 4,608 of them under the default `FrontSide`. ⛔ The mesh
           * was never frustum-culled and never hidden: `onBeforeRender` FIRED on
           * every frame, so it reached `renderObject()` and was submitted to the
           * GPU, which then discarded it at the face-culling stage.
           *
           * ⛔ HOW IT HID: the room LOOKED correct because the DOM `<img>` sat
           * behind a transparent canvas, exactly as it had before the proxy was
           * written. **A layer that contributed nothing was indistinguishable
           * from one that worked.**
           *
           * ⚠⚠ AND IT IS WHY CS COULD REFRACT A ROOM THAT WAS NOT ON SCREEN:
           * three's transmission pass temporarily flips `material.side` to
           * `BackSide`, so the proxy was visible to the GLASS and culled in the
           * MAIN pass. Two contradictory-looking observations, one cause.
           *
           * ⛔ POSITIONS AND UVs ARE UNTOUCHED. Only the index order changes, so
           * no vertex moves and the cards' geometry cannot shift. Proved by
           * silhouette comparison before/after.
           */
          idx.push(a, a + 1, a + DIV + 1, a + 1, a + DIV + 2, a + DIV + 1);
        }
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
      g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
      g.setIndex(idx);
      return g;
    };

    /* The floor: y = -CAM_H. */
    const floorG = grid(-1, nyFloorTop, (d) => {
      const t = -CAM_H / d.y;
      return [d.x * t, -CAM_H, d.z * t];
    });

    /**
     * The wall: a vertical plane at the depth the floor reaches at its far edge,
     * so the two meet along the horizon with no seam and no arithmetic between
     * them.
     */
    const dTop = rayDir(0, nyFloorTop);
    const WALL_Z = (-CAM_H / dTop.y) * dTop.z;
    const wallG = grid(nyFloorTop, 1, (d) => {
      const t = WALL_Z / d.z;
      return [d.x * t, d.y * t, WALL_Z];
    });

    return { floor: floorG, wall: wallG };
  }, []);

  useEffect(
    () => () => {
      floor.dispose();
      wall.dispose();
    },
    [floor, wall],
  );

  return (
    <group>
      {/* ⚠ `MeshBasicMaterial` — UNLIT, deliberately. ⛔ The room is ALREADY LIT:
          the ceiling lights and their falloff are IN the photograph. Shading it
          again would light a picture of a lit room. ⚠ `toneMapped={false}` or the
          plate is ACES-shifted while the page around it is not (F7). */}
      <mesh geometry={floor}>
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
      <mesh geometry={wall}>
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
    </group>
  );
}

/**
 * ⛔⛔ THE GUIDE OVERLAY — Carl, 18 September 2026: *"the guide lines should be in
 * the image so i can verify."*
 *
 * ⚠⚠ **IT DRAWS THE PLATE'S OWN MEASURED GUIDES, UNPROJECTED ONTO A PLANE JUST IN
 * FRONT OF THE CAMERA.** So a guide and the card it governs coincide on screen if
 * and only if the card is placed correctly — **no arithmetic between them, and
 * nothing shared with the placement code that could make the check pass falsely.**
 *
 * ⛔ THIS IS THE INSTRUMENT CARL USED TO CATCH THE CEILING-ANGLE ERROR (D-076):
 * *"lift a supposedly-parallel line onto the seam and see whether it traces it."*
 * ⚠ The Builder's four wrong angles were each verified against their own figure —
 * **a check that shares its input with the thing it checks cannot fail.**
 *
 * ⚠ DEV-ONLY, and off unless `?guides=1`. It is diagnostic, not design.
 */
function GuideOverlay() {
  const geometry = useMemo(() => {
    /* ⚠ A plane 1 unit ahead, so the guides sit in front of everything. */
    const D = 0.6;
    const at = (fx: number, fy: number) => {
      const px = (fx - 0.5) * PLATE_W;
      const py = (0.5 - fy) * PLATE_H;
      const pz = -FOCAL_PX;
      const wy = py * COS_P - pz * SIN_P;
      const wz = py * SIN_P + pz * COS_P;
      const t = -D / wz;
      return [px * t, wy * t, wz * t] as const;
    };
    const pts: number[] = [];
    const loop = (corners: ReadonlyArray<{ x: number; y: number }>) => {
      for (let i = 0; i < corners.length; i++) {
        const a = corners[i];
        const b = corners[(i + 1) % corners.length];
        pts.push(...at(a.x, a.y), ...at(b.x, b.y));
      }
    };
    /* The floor pair's guides are axis-aligned rectangles in plate space. */
    const rect = (g: { x0: number; y0: number; x1: number; y1: number }) =>
      loop([
        { x: g.x0, y: g.y0 },
        { x: g.x1, y: g.y0 },
        { x: g.x1, y: g.y1 },
        { x: g.x0, y: g.y1 },
      ]);
    rect(GUIDE_CD);
    rect(GUIDE_CS);

    /**
     * ⛔⛔ THE RAILS — PL AND PR, CARL'S OWN HAND-PINNED DESK FLOOR LINES.
     * Carl, 18 September: *"How can i tell if there aligns to the desks when i
     * have no guides. Thats why they are there."*
     *
     * ⚠⚠ **THESE ARE THE ALIGNMENT REFERENCE FOR THE FLOOR PAIR, NOT THE GUIDE
     * RECTANGLES.** The rects say how big a card is; **the rails say where it
     * stands and which way it faces.** ⛔ Carl: *"The cards should sit on that and
     * be at almost 90 deg from each other — not face on."*
     *
     * ⚠ STAGE FRACTIONS from `INITIAL_RAIL`, converted here. ⛔ A COPY — nothing
     * asserts these still agree with `/proto/wall`, and they will drift silently
     * if the rails are re-pinned. The same caveat the page's own SVG carries.
     *
     * ⚠ PL/PR ARE THE "POSITION" PAIR. ⛔ **NOT RL/RR, which sit on the chair
     * castor bases** and were misread as desk references once already, producing
     * a discarded 57.7° figure.
     */
    const railSeg = (a: { x: number; y: number }, b: { x: number; y: number }) => {
      pts.push(...at(a.x, stageToPlateY(a.y)), ...at(b.x, stageToPlateY(b.y)));
    };
    railSeg({ x: 0.27621, y: 0.94232 }, { x: 0.46058, y: 0.83185 }); // PL
    railSeg({ x: 0.50858, y: 0.80654 }, { x: 0.64059, y: 1.00101 }); // PR
    /* ⚠ The wall pair's are PROJECTED trapezoids — do not read an aspect off
       them, which is the error that produced 1.615. */
    loop(GUIDE_CA_QUAD);
    loop(GUIDE_CB_QUAD);

    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    return g;
  }, []);

  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <lineSegments geometry={geometry} renderOrder={999}>
      <lineBasicMaterial color="#00ff88" depthTest={false} toneMapped={false} />
    </lineSegments>
  );
}

/**
 * ⚠ The room's env map, loading the same plate the backplate uses. ⛔ `useLoader`
 * caches by URL, so this is ONE fetch and one decode shared with `RoomBackplate`
 * — not a second download.
 */
function RoomEnvironmentFromPlate() {
  const texture = useLoader(THREE.TextureLoader, "/about-studio-source.jpg");
  return <RoomEnvironment plate={texture} enabled />;
}

export default function AboutCardCanvas() {
  /**
   * ⛔ THE GUIDES ARE ON BY DEFAULT WHILE PLACEMENT IS BEING VERIFIED, and off
   * with `?guides=0`. Carl, 18 September: *"the guide lines should be in the
   * image so i can verify."*
   *
   * ⚠⚠ AN EARLIER VERSION GATED THEM BEHIND `?guides=1` AND CARL SAW NO GUIDES —
   * he was looking at a plain `/about`. ⛔ **A diagnostic nobody can see by
   * default is not a diagnostic.** ⚠ THEY MUST COME OUT before this ships; they
   * are a measurement aid, not design.
   */
  /**
   * ⚠⚠ OFF BY DEFAULT, ON WITH `?guides=1`. ⛔ An earlier edit produced
   * `false && a || b`, and `&&` binds tighter than `||`, so it collapsed to `b`
   * and the guides drew regardless. **A diagnostic that ignores its own switch
   * is the instrument-fault class this project keeps recording** — it was caught
   * only because the render disagreed with the flag.
   *
   * ⛔⛔ THIS OVERLAY IS THE **GREEN CARD RECTANGLES** AND IT STAYS OFF.
   * ⚠⚠ **DO NOT CONFUSE IT WITH THE FLOOR RAILS CARL ASKS TO KEEP.** They are
   * different things in different files, and the Builder turned this one on by
   * mistake on 18 September when asked for the rails:
   *
   *     GREEN quads, here          the four cards' own outlines — a PLACEMENT
   *                                check. Consumed; Carl does not want them.
   *     BLUE/PINK dashed, in       the DESK FLOOR AXES the cards stand on — a
   *     `app/about/page.tsx`       COMPOSITIONAL instrument. **These are the
   *                                ones that stay on.**
   *
   * ⛔ Carl, 18 September 2026: *"no, the floor lines on which the cards are
   * sitting. NOT green card rectangles."* **The rails are ON until he instructs
   * otherwise; this overlay is not.**
   */
  const showGuides =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("guides") === "1";

  /**
   * ⛔⛔ CD's FACE TRANSMISSION, OVERRIDABLE IN THE ROOM WITH `?cd=0.93` — added
   * 22 September 2026 so Carl can find the value ON THE BACKGROUND THAT CAUSED
   * THE PROBLEM. ⚠⚠ **THE BENCH CANNOT ANSWER THIS ONE.** The whole finding is
   * that a fixed material over a VARYING background reads as a varying
   * material; a bench with one floor behind it is the wrong instrument.
   *
   * ⛔ **WHY CD NEEDS ITS OWN NUMBER AT ALL** — Carl, 22 September, on seeing
   * both floor cards at an identical 0.86: *"they do read as different cards."*
   * ⚠ At 0.86 the card is 86% background + 14% white body. **The body is a
   * CONSTANT; what it is added to is not.** CD's face overlaps the DARK desk
   * front, so the white body is a large fraction of the final pixel and reads
   * MILKY. CS's overlaps LIT, grainy floorboards, which dominate — so it reads
   * CLEAR. **Same numbers, different picture, and no transmission value makes
   * them identical.**
   *
   * ⚠ **CARL'S RULE, FROM HIS OWN SWEEP:** *"0.5 = milky, 1.0 = clear. If CD is
   * 0.86 and its giving off this milky look i would up the value to make it a
   * bit clearer, more in line to look like CS."* ⛔ **THE TARGET IS CS'S
   * APPEARANCE, NOT CS'S NUMBER.**
   *
   * ⚠ DEV-ONLY AND UNSWEPT. **It defaults to `CD_FACE_TRANSMISSION` and the
   * URL only overrides it** — so a plain `/about` load always shows the
   * committed value, never a stale query string.
   */
  /**
   * ⚠ ONE READER, NOT FOUR COPIES. A per-card duplicate of this parse is four
   * places for the guard to drift apart — the shared-accessor rule.
   */
  const transmissionOverride = (key: string): number | null => {
    if (typeof window === "undefined") return null;
    const raw = new URLSearchParams(window.location.search).get(key);
    if (raw === null) return null;
    const n = Number(raw);
    /* ⛔ A BAD VALUE FALLS BACK RATHER THAN RENDERING NaN — `Number("")` is 0,
       and a 0 here would look like a deliberate opaque card. */
    return Number.isFinite(n) && n >= 0.5 && n <= 1 ? n : null;
  };
  const cdTransmissionOverride = transmissionOverride("cd");
  const caTransmissionOverride = transmissionOverride("ca");
  /**
   * ⛔⛔ THE ANCHOR IS PL's **B HANDLE**, NOT THE MIDPOINT — Carl, 14 September:
   * *"put the right bottom corner of the left card on the thicker line on the
   * right circle."* The "right circle" is the upper-right end of the pinned span.
   *
   * ⚠ STAGE FRACTIONS, converted inside `placeCard`. Taken verbatim from
   * `INITIAL_RAIL.PL[1]` in `app/proto/wall/page.tsx`.
   *
   * ⚠ `RAIL_MID_CD` is no longer used here and is deliberately left in
   * `about-card-geometry.ts`: it is the record of the first anchor Carl tried, and
   * the midpoint may well come back when the card is nudged along the axis.
   */
  const PL_B = { x: 0.46058, y: 0.83185 };
  const cd = placeCard(GUIDE_CD, CD_CARD_HEIGHT_MM, PL_B, CD_FACE_YAW_DEG, "right");

  /**
   * ⛔⛔ CS ANCHORS BY ITS BOTTOM-**LEFT** CORNER TO PR's **A** HANDLE — Carl,
   * 14 September: *"Take the bottom left corner of the right card and place that
   * on the circle on the left."*
   *
   * ⚠⚠ THE MIRROR OF CD, AND THE ASYMMETRY IS THE POINT. CD hangs its bottom-RIGHT
   * corner on PL's B (the upper-right end); CS hangs its bottom-LEFT corner on
   * PR's A (the upper-left end). Both cards therefore grow AWAY from the centre of
   * the room, which is what keeps them from colliding across the middle.
   *
   * ⚠ Stage fractions, taken verbatim from `INITIAL_RAIL.PR[0]`; converted inside
   * `placeCard`.
   */
  const PR_A = { x: 0.50858, y: 0.80654 };
  const cs = placeCard(GUIDE_CS, CS_CARD_HEIGHT_MM, PR_A, CS_FACE_YAW_DEG, "left");

  /**
   * ⛔⛔ THE WALL PAIR — CA left, CB right. Added 17 September 2026 on Carl's
   * instruction: *"Lets give the wall cards some geometry. Use the guide lines to
   * implement the same geometry as the floor cards. NOTE. The dimensions are
   * different, this must be taken into account."*
   *
   * ⚠⚠ "THE SAME GEOMETRY" MEANS THE SAME BLUEPRINT, NOT THE SAME NUMBERS — and
   * Carl stated the rule directly: *"The cards can be seen as one 'family'. They
   * all share similar characteristics, only the dimensions change."* ⛔ So
   * `AboutCardMesh` and `cardDims` are untouched; only height and aspect differ.
   *
   * ⛔ THE ASPECTS ARE MEASURED, NOT INHERITED. `WALL_CARD_ASPECT` was 1.615 and
   * came from a CSS text box; the corner solve puts the real figures at 2.327 and
   * 2.248 — **42% wider than the record claimed.** Full derivation and its five
   * independent checks: `about-card-geometry.ts`.
   *
   * ⚠ HEIGHTS ARE PROVISIONAL and expected to move — Carl judges size in situ.
   */
  const ca = placeWallCard(GUIDE_CA_QUAD, CA_CARD_HEIGHT_MM, CA_CARD_ASPECT);
  const cb = placeWallCard(GUIDE_CB_QUAD, CB_CARD_HEIGHT_MM, CB_CARD_ASPECT);

  /**
   * ⛔⛔ THE NEON — D-093, 23 September 2026. ALL FOUR CARDS, BUILT PAIR BY PAIR:
   * the wall pair first (Carl: *"Wall cards first, tweak so they visually match
   * then work on the floor cards."*), then the floor pair the same day —
   * *"Implement the floor cards… We will then see what the whole scene looks
   * like."*
   *
   * ⚠ ONE COLOUR PER PAIR — Carl: *"a darker and a lighter blue per pair."* The
   * wall pair is the logo's navy "c" (approved by eye); the floor pair its teal
   * "b" (a candidate).
   *
   * ⚠ MEMOISED ONCE PER MOUNT, AND THAT IS LOAD-BEARING: `NeonBloom` ignites when
   * `mode` changes, so a fresh object on every render would re-strike the neon.
   * The URL is read once — reload to apply a new fader.
   *
   *   ?neon=none | off | full   ?neont=<ms>   ?reignite=<ms>
   *   ?neonca= ?neoncb= ?neoncd= ?neoncs=  ?bloom= ?bloomr=
   *   wall: ?neonhex= (glow) ?neontube= (tube)   floor: ?floorhex= ?floortube=
   *   etched text (D-094, CA only): ?etch=1  ?etchem= ?etchbw= ?etchbh= ?etchop= ?etchglow=
   *                                 ?etchrough= ?etchweight= ?etchhex=
   *
   * Every fader falls back to the committed value in `about-neon.ts` /
   * `card-etch.ts`, so a plain `/about` always shows what is committed.
   *
   * ⛔ SINCE 24 September 2026 (session 2) EVERY FADER ABOVE NEEDS `?extrude=0`:
   * plain `/about` carries the extruded text with the neon NOT mounted (see
   * `extrude` below), so `?neon=full` alone changes nothing on screen.
   */
  /**
   * ⛔⛔ THE EXTRUDED TEXT, "DRY" — D-094, 24 September 2026. CA, AND CB SINCE
   * SESSION 2 (was "CA ONLY", corrected in place). Carl:
   * *"turned all the rims off. At this point we dont want extraneous light
   * 'polluting' the scene."* So while it is on the neon is NOT MOUNTED (`none`:
   * every rim is plain clear glass, no bloom) and the etched text is off.
   *
   * ⛔⛔ ON BY DEFAULT — PLAIN `/about` — since 24 September 2026 (session 2). Carl:
   * *"The rim lights should be turned off so we can see the card in isolation."*
   * ⚠ *Corrected in place:* this read "AND ONLY WITH `?extrude=1`… Plain `/about`
   * is untouched: without the flag this is `null`." ⛔ **Now `?extrude=0` is the
   * only way to `null`**, and with it the neon, its faders (`?neon=`, `?neonca=`…)
   * and the etched take (`&etch=1`) — ⚠ **those faders do nothing without it.**
   */
  /* ⛔ ONE CARD PER LOAD — `extrudeCard` (plain `/about`: CB, the card being worked
     on). Every switch below keys on `extrude`; only the text and its face's
     shadow key on WHICH card. */
  const extrudeCardId = useMemo(() => extrudeCard(), []);
  const extrude = useMemo(
    () => (extrudeCardId ? extrudeSettings(extrudeCardId) : null),
    [extrudeCardId],
  );
  /* ⛔ THE RIM UNDER THE TEXT TAKE — Carl, 24 September 2026 (session 2): *"On CB,
     turn off the light but turn on the rim."* With `extrude.rim` the neon mounts as
     it does on the neon page (`neonMode()`, so `?neon=full|off|<ignite>` and every
     neon fader apply), but ⚠ ONLY THE SELECTED CARD'S CHANNEL is passed (see
     `liveNeon` below): every other rim stays plain clear glass, as isolation needs. */
  const neon = useMemo<ReturnType<typeof neonMode>>(
    () => (extrude && !extrude.rim ? { kind: "none" } : neonMode()),
    [extrude],
  );
  /**
   * ⛔⛔ THE ETCHED TEXT — D-094, 24 September 2026. THE WALL PAIR, AND ONLY WITH
   * `?etch=1`: plain `/about` is pixel-identical until Carl approves the take.
   * ⚠ CB JOINED THE SAME DAY, beyond the CA-only plan, on Carl's word: *"we had
   * no idea how that plan would look in practice… we wont know that until text is
   * put into CB."* Its angle decides the display options (D-094).
   * ⚠ MEMOISED ONCE PER MOUNT (Architect S1) — an inline object would be new on
   * every render. Plan: `live-work/card-text-etch-plan-24-september.md`.
   */
  const [caEtch, cbEtch] = useMemo(() => {
    if (!etchEnabled() || extrudeEnabled()) return [undefined, undefined];
    return (["ca", "cb"] as const).map((id) => ({
      id,
      body: aboutCardCopy(id === "ca" ? "CA" : "CB").body,
      settings: etchSettings(id),
    }));
  }, []);
  const neonChannels = useMemo(() => {
    /* ⚠ TWO COLOURS PER PAIR: the GLOW and the TUBE. They differ on the wall
       pair because ACES turns a navy tube cyan (see `NEON_TUBE_HEX`). */
    const wall = { glow: neonHex(NEON_GLOW_HEX), tube: neonHex(NEON_TUBE_HEX, "neontube") };
    const floor = {
      glow: neonHex(FLOOR_NEON_GLOW_HEX, "floorhex"),
      tube: neonHex(FLOOR_NEON_TUBE_HEX, "floortube"),
    };
    const make = (
      id: NeonChannel["id"],
      pair: { glow: string; tube: string },
      peak: number,
      /** ⚠ Only the wall pair's channels carry the etch's depth; the floor pair's is 0. */
      etch?: { settings: EtchSettings },
    ): NeonChannel => ({
      id,
      color: new THREE.Color(pair.glow),
      tubeColor: new THREE.Color(pair.tube),
      peak,
      rim: null,
      emitter: null,
      textGlow: null,
      /* ⛔ MATCHED TO THE RIM AS SEEN — see `ETCH_GLOW_HEX`. */
      textColor: new THREE.Color(etch ? etch.settings.glowHex : pair.tube),
      textDepth: etch ? etch.settings.glowDepth : 0,
    });
    return [
      make("ca", wall, neonNumber("neonca", CA_NEON_PEAK, 0, 200), caEtch),
      make("cb", wall, neonNumber("neoncb", CB_NEON_PEAK, 0, 200), cbEtch),
      make("cd", floor, neonNumber("neoncd", CD_NEON_PEAK, 0, 200)),
      make("cs", floor, neonNumber("neoncs", CS_NEON_PEAK, 0, 200)),
    ];
  }, [caEtch, cbEtch]);
  /* ⚠ `?neon=none` passes NO channel, so every card takes the exact pre-neon
     path — the identity gate's first arm. */
  /* ⚠ Under the text take with the rim on, ONE channel: the selected card's. A card
     with no channel takes the exact pre-neon path, so the other three are unlit. */
  const liveNeon = useMemo(
    () =>
      neon.kind === "none"
        ? []
        : extrude
          ? neonChannels.filter((ch) => ch.id === extrudeCardId)
          : neonChannels,
    [neon, extrude, extrudeCardId, neonChannels],
  );
  const neonFor = (id: NeonChannel["id"]) => liveNeon.find((ch) => ch.id === id);
  const [caNeon, cbNeon, cdNeon, csNeon] = [neonFor("ca"), neonFor("cb"), neonFor("cd"), neonFor("cs")];
  /* ⛔ CS is not rendered while the left card is being got right — Carl,
     14 September: *"move one card at a time."* Its constants stay imported and
     its placement stays derivable; only the mesh is withheld. */

  return (
    /**
     * ⛔⛔ THE HOST IS `absolute`, NOT `fixed`. A fixed element resolves against
     * the viewport ONLY while no ancestor establishes a containing block — any
     * ancestor with `transform`, `filter`, `perspective`, `contain` or
     * `will-change` captures it. On 18 August a host read computed left/top of
     * 654.7/616.8 while PAINTING at 1080/879. Caught by Carl looking at the
     * screen, not by any instrument.
     *
     * ⚠⚠ THE BOX MUST TRACK `object-contain`'s OWN GEOMETRY, NOT `inset-0`. The
     * plate is letterboxed inside a full-viewport section, so a fraction of the
     * SECTION is not a fraction of the IMAGE. ⛔ The floor-copy overlay's first
     * attempt used `w-full` here and both text blocks sat left of their targets.
     */
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <div className="relative h-full max-h-full w-auto max-w-full aspect-[3/2]">
        <Canvas
          frameloop="demand"
          dpr={[1, 2]}
          /* ⚠ Shadows ONLY while the extruded text is on — the letters' shadows on
             CA's and CB's faces. ⚠ *Corrected in place:* this read "ONLY under `?extrude=1`…
             so plain `/about` is unchanged"; the text is now plain `/about`'s
             default, so `?extrude=0` is what gives `false` (R3F's own default). */
          shadows={extrude ? "soft" : false}
          gl={{ antialias: true, alpha: true }}
          /* ⚠ The extruded text's reveal/erase wipe is two clipping planes per line,
             which need LOCAL clipping — a renderer switch, set only while the text
             is on (by default since 24 September; off with `?extrude=0`).
             It affects only materials that carry `clippingPlanes` (only the text's). */
          onCreated={extrude ? ({ gl }) => { gl.localClippingEnabled = true; } : undefined}
          camera={{
            /* ⛔ VERTICAL FOV. `PerspectiveCamera.fov` is vertical and the plan
               carried the 89.91° HORIZONTAL figure — caught before it shipped. */
            fov: CAMERA_VFOV_DEG,
            near: 0.01,
            far: 100,
            position: [0, 0, 0],
            rotation: [PITCH, 0, 0],
          }}
        >
          {/* ⚠ DIM AMBIENT BY DESIGN. The room is dark and the point of the
              geometry is SHADOW; a bright fill erases what is being judged.
              ⛔ THE ROOM IS ALREADY LIT — Carl: *"You're assuming that a white
              global light is going to be used."* The ceiling and floor are IN THE
              PHOTOGRAPH. This lights the cards only. */}
          {/* ⚠ DIM AMBIENT BY DESIGN. The room is dark and the point of the
              geometry is SHADOW; a bright fill erases what is being judged.
              ⛔ THE ROOM IS ALREADY LIT — Carl: *"You're assuming that a white
              global light is going to be used."* The ceiling and floor are IN THE
              PHOTOGRAPH. This lights the cards only. */}
          {/* ⚠ 0.12 -> 0.20 on 17 September 2026, and it is a CONSEQUENCE of the
              key dropping 2.4 -> 1.2 for the mirror light below, not a separate
              change. It restores the right pair's level without altering any
              incidence angle — ambient adds no direction, so nothing it does can
              flatten a crown. */}
          {/* ⛔⛔ THE BACKPLATE — the room, IN the scene. Carl's ruling,
              17 September 2026, Option A, confirmed by name; built 18 September
              on his instruction: *"build the backplate and env map. It cannot be
              properly judged until its in place."*

              ⚠⚠ WITHOUT IT CS'S GLASS IS A MILKY SLAB, NOT A JUDGEMENT.
              `three.module.js:18019`: on an `alpha: true` canvas the transmission
              target is cleared to 50% WHITE, and ⛔ **transmissive objects are
              excluded from that target** (`:18039` renders `opaqueObjects` only).
              **So the glass would refract white nothing and read as "the frost is
              far too heavy" — a confident wrong answer.**

              ⛔ IT REPLACES THE `next/image`, WHICH IS OPTION A, AND THE COST IS
              CARL'S BY NAME: the room no longer survives JS failure, no longer
              survives WebGL context loss, and no longer paints before JS runs.
              **Given up deliberately** — see the §5b table in
              `live-work/structural-note-backplate-17-september.md`.

              ⚠ `toneMapped={false}` IS NOT OPTIONAL (F7). Without it the plate is
              ACES-shifted while the DOM around it is not, so the room and what the
              glass refracts would not match. */}
          <RoomBackplate />
          {/* ⛔ DIAGNOSTIC — `?guides=1`. See `GuideOverlay`. */}
          {showGuides && <GuideOverlay />}

          {/* ⛔ THE ENV MAP — the CLEAR RIM cannot render without one. At
              `transmission: 1` there is no diffuse colour, and transmissive
              objects are excluded from the transmission target, so specular
              reflection is the only channel that can draw the rim.
              ⚠ SHARED with the bench — one definition, `room-environment.tsx`.
              ⚠⚠ ITS PMREM COST IS UNMEASURED HERE. The `/start` precedent is
              ~572ms for a different scene. **2b owes this measurement.** */}
          <RoomEnvironmentFromPlate />

          <ambientLight intensity={0.20} />

          {/* ⚠⚠ A STAND-IN KEY. Carl: *"The light will come from the neon rim but
              also 4 individual lights pointed at each card."* ⛔ Neither exists
              yet. ⚠ *(Amended 23 September 2026: CA and CB's rims now GLOW and
              BLOOM — D-093 — but they cast NO LIGHT on anything; emission and
              bloom are seen, not received. So this key still stands in for the
              rim's light on all four cards.)* This beam is here
              so the crown is legible at all; a correct crown reads FLAT under a
              head-on light.

              ⛔⛔ RESTORED TO THIS EXACT RIG ON 17 September 2026 after a day of
              alternatives — Carl: *"The best representation ive seen is before we
              started changing/adding lights when the right side cards were grey
              and the left side blowwn out. Return them to that state."*

              ⚠⚠ THAT RESTORED STATE CLIPPED THE LEFT PAIR AT 1.489/1.497 — 49%
              past white — and Carl accepted it at the time, then read the cause
              off the screen unprompted: *"I take it just one light is used here
              and because of its placement its making the left side blow out."*
              ⛔ Correct on both counts, and it is what led to the mirror below.

              ⚠ THE INTENSITY IS NOW 1.2, NOT THE ORIGINAL 2.4. **The drop is the
              clipping fix** — see the mirror light's note. The POSITION [1,2,2] is
              untouched, so the grazing angle Carl approved on the right pair is
              exactly as it was.

              ⚠ DO NOT RESTORE 2.4 WITHOUT REMOVING THE MIRROR. Four measured
              attempts to balance this with SPOTLIGHTS were built and rejected on
              sight — see the removal note above `AboutCardCanvas`. **Every one
              measured clean and looked worse. The fix was the light TYPE, and a
              second directional light, not repositioning.** */}
          <directionalLight position={[1, 2, 2]} intensity={0.5} />

          {/* ⛔⛔ THE MIRROR — a second directional light for the LEFT pair.
              17 September 2026, Carl: *"can you use another light to mirror it, so
              we can achieve that effect on the left hand side. You may have to
              bring down the insensity. Start low, we can always bring it up, like
              using a volume fader."*

              ⚠⚠ THE OBVIOUS MIRROR IS [-1,2,2] AND IT IS WRONG. Measured: it gives
              the LEFT pair N·L 0.380/0.430 but the RIGHT pair **0.632/0.643** — it
              lights the good pair MORE than the one it was meant to rescue. ⛔ The
              cards are not mirrored about the room's axis; they are yawed to their
              own desks (32.8/28.2 against 301.5/303.1), so a mirrored VECTOR does
              not produce a mirrored EFFECT.

              ⛔ [3,2,-1] IS THE REAL MIRROR, FOUND BY SEARCH: it grazes CD/CA at
              N·L 0.210/0.143 and contributes **exactly 0.000 to CS/CB** — the good
              pair is not disturbed at all.

              ⚠⚠ AND THE KEY HAD TO COME DOWN, WHICH WAS NOT PART OF THE REQUEST.
              **A fill alone would have done nothing visible.** The left pair was
              already at 1.489/1.497 — past the 1.0 clamp — so every watt added
              there was being discarded. ⛔ Key 2.4 -> 1.2 is what lets the fill be
              seen at all; it is the clipping fix, not a taste change.

              ⚠ AMBIENT 0.12 -> 0.20 compensates the right pair for the lower key,
              WITHOUT changing any incidence angle. Measured result:

                  CD 0.953   CA 0.925   CS 0.217   CB 0.237

              ⛔ CS/CB were 0.214/0.254 before and are 0.217/0.237 now — **the pair
              Carl approved is preserved within 0.017** while the left pair comes
              back from clipped to readable.

              ⚠ STARTED LOW ON CARL'S INSTRUCTION. 0.6 is the fader's opening
              position, not a tuned value.

              ⛔⛔ FADER MOVED UP, AND THE ANGLE CHANGED WITH IT — Carl, after
              looking: *"The right side is good, left has marginally improved, its
              not all white and there is a hint of geometry."*

              ⚠⚠ "MARGINAL" WAS MEASURABLE, AND THE CAUSE WAS NOT THE VOLUME. At
              key 1.2 / fill 0.6 the KEY still supplied **88% of CD's light** — and
              the key strikes the left pair near head-on (N·L 0.741). ⛔ **A
              head-on light delivers the same value at every point on the face, so
              88% of what the left pair received carried NO GRADIENT.** Turning the
              fill up alone could only ever have shifted a small remainder.

              ⛔ [3,2,-1] -> [5,2,-2]. The first fill grazed CD at N·L 0.210; the
              new one grazes at **0.179 / 0.104**, which is much closer to the
              **0.064 / 0.085** the key gives the right pair — the angle Carl
              approved. ⚠ Both contribute **exactly 0.000** to CS/CB, so the good
              pair is still untouched by the fill.

              ⛔ KEY 1.2 -> 0.5, FILL 0.6 -> 2.6. **The fill now supplies 56% of
              CD's light instead of 12%**, and it supplies it at a grazing angle.
              That inversion — not the intensity — is what puts a gradient on the
              left pair. Measured:

                  CD 0.812   CA 0.661   CS 0.182   CB 0.190

              ⚠ THE RIGHT PAIR COSTS 0.03 AND IT IS A REAL TRADE, NOT A FREE WIN.
              CS/CB were 0.214/0.254 when Carl approved them and are 0.182/0.190
              now, because the key is the ONLY light reaching them and it had to
              come down to stop dominating the left. ⛔ Holding both exactly would
              need a THIRD light aimed only at the right pair. **Not built — Carl
              judges whether the trade is worth it before adding hardware.** */}
          <directionalLight position={[5, 2, -2]} intensity={2.6} />

          {/* ⛔ NO PROXY PLANE. An earlier build put one 1.6x the card's size
              behind it, which on `/about` is an OPAQUE SLAB BLACKING OUT THE ROOM.
              ⚠ It was carried from the bench, where a proxy is correct because
              there is no room behind it. **Here the room IS the background.**
              ⛔ The proxy returns in chunk 2 as a BANDED GRADIENT per floor card,
              sampled from the pixels each card covers once it is on its rail. */}

          {/* ⛔ BOTH CARDS FLAT — 14 September 2026, Carl: *"make it flat again."*
              ⚠ After five face formulations were built and rejected on sight: the
              superellipse lens, a per-direction re-normalisation, a 15% seam band,
              the tent-pole membrane, and the Q+A separable form with and without
              its plateau. ⛔ A flat face meets the bevel at every point by
              construction and spends no face area doing it. The curvature question
              is PARKED, not answered. */}
          {/* ⛔⛔ CD CARRIES THE QUARTIC BULGE — REAL GEOMETRY. 14 September 2026,
              Carl: *"yes try it on the Left card."*

              ⚠⚠ THE PAIR IS NOW A DIRECT COMPARISON OF THE TWO APPROACHES:
                CD (left)  — real curved geometry, `(1-x²)(1-y²)` at 2.5%
                CS (right) — flat mesh with a convex NORMAL MAP
              ⛔ Both meet the bevel at every point; both keep 100% of the face
              usable for text. **The question is which one reads as dimensional
              when light moves across it** — and only the screen can answer that.

              ⚠ `flat` IS REMOVED HERE so the geometry actually curves. Leaving it
              would have rendered a plane and silently ignored the new surface. */}
          {/* ⛔⛔ CD TAKES CS'S APPROVED VALUES — 22 September 2026, Carl: *"They
              carry the same values for now. We will make a visual inspection when
              they are changed and see if they need individual attention."*

              ⚠⚠ CD NO LONGER CARRIES CS'S 0.86 — AND THE CORRECTION IS RECORDED
              BECAUSE THE PREDICTION WRITTEN HERE WAS WRONG. This comment previously
              said CD would read *"slightly clearer than CS"*, because CD is nearer and
              larger so a fixed frost covers less of it. ⛔ **THE OPPOSITE HAPPENED.**
              Carl, 22 September, on both at 0.86: *"they do read as different cards"* —
              **CD MILKY, CS CLEAR.**

              ⛔⛔ THE MECHANISM IS THE BACKGROUND, NOT THE CARD. At 0.86 a pixel is 86%
              background + 14% white body. **The body is a constant; what it is added to
              is not.** CD's face overlaps the DARK desk front, so the body dominates.
              CS's overlaps LIT grainy floorboards, which dominate instead. ⚠ **The old
              note had this backwards — it reasoned from the lit floor NEAR CD rather
              than the dark desk BEHIND it.** Full reasoning: `CD_FACE_TRANSMISSION`.

              ⚠ SWEEP IT IN THE ROOM WITH `?cd=0.93`. ⛔ **The bench cannot answer this**
              — the whole finding is that the background varies, and the bench has one.

              ⛔ PROVISIONAL AND UNAPPROVED. ⚠ It may be a compensation for lighting that
              does not exist yet (D-090); revisit when the lights land. */}
          <group position={cd.position} rotation={[0, cd.rotationY, 0]} scale={cd.scale}>
            <AboutCardMesh
              dims={cd.dims}
              crownMm={cd.crownMm}
              glass
              glassRoughness={0.35}
              glassFaceTransmission={cdTransmissionOverride ?? CD_FACE_TRANSMISSION}
              neon={cdNeon}
              faceReceiveShadow={extrudeCardId === "cd"}
            />
            {/* ⛔ CD'S TEXT — CA's treatment, 24 September 2026 (session 2). Carl: *"put
                the text in for CD and CS."* Depth from ITS measured view angle (the
                depth rule, `EXTRUDE_DEPTH_MM`); the light scaled as CB's is, but OFF by
                default (*"Turn all the lights off"*). One card per load: `?extrude=cd`. */}
            {extrude && extrudeCardId === "cd" && (
              <CardExtrudedText
                id="cd"
                body={aboutCardCopy("CD").body}
                dims={cd.dims}
                crownMm={cd.crownMm}
                settings={extrude}
                lightDistanceMm={(EXTRUDE_LIGHT_DISTANCE_MM * cd.dims.faceWidthMm) / ca.dims.faceWidthMm}
              />
            )}
          </group>

          {/* ⛔ CS — the right floor card, restored 14 September once CD was
              verified on its rail. ⚠ It was withheld while CD was got right —
              Carl: *"move one card at a time"* — because two cards at once made it
              impossible to tell which discrepancy belonged to which. That
              isolation is what found the stage->plate crop bug.

              ⚠⚠ ITS BOTTOM-**LEFT** CORNER SITS ON PR's **A** HANDLE, mirroring
              CD's bottom-right on PL's B. Both grow away from the room's centre. */}
          {/* ⛔ CS — the right floor card. ⚠ THE `flat` TEST IS RETIRED: it existed
              to show a face that met the bevel all the way round, and the pinned
              membrane now does that WITH curvature. Both cards run the same
              blueprint — Carl: *"it is a blueprint for all 4 cards."* */}
          {/* ⛔⛔ CS CARRIES THE NORMAL-MAP DOME — 14 September 2026, Carl: *"Lets
              try it on the Right card."* ⚠ CD stays flat and plain as the CONTROL,
              so the effect can be judged against its own absence in one frame.

              ⚠⚠ [SUPERSEDED — see below] `flat` AND `domed` TOGETHER WAS THE IDEA:
              the MESH is flat — flush to the bevel at every point, undistorted UVs
              for the text — and only the LIGHTING reads as curved. ⛔ Five mesh
              formulations were rejected today because each traded seam against text
              area; this one makes no such trade.

              ⛔⛔ SUPERSEDED — THE NORMAL-MAP ROUTE IS CLOSED, 14 September 2026.
              Carl, after testing it on the bench under the light sweep: *"NO
              change. CD is the way to go."* **CS now runs the same real curved
              geometry as CD**, and the paragraph above describes what it USED to
              carry.

              ⚠⚠ THE MAP WAS BUILT CORRECTLY AND STILL DID NOTHING. Verified
              against the code as written: the texels genuinely encoded a dome (R
              channel 66..189 against 128 for flat), the material binding was
              right, and UVs were added when their absence was found — they had
              been missing entirely, so every fragment sampled texel (0,0). It
              remained inert after all three were fixed.
              ⛔ LIKELY CAUSE, UNPROVEN: `meshStandardMaterial` needs a `tangent`
              attribute to apply a tangent-space normal map reliably, and this
              geometry has none. **Not chased further — CD had already won on
              evidence Carl gathered himself.**

              ⚠ AND THE PROFILE TEST WAS NEVER MEANINGFUL FOR A FLAT MESH. A plane
              is a straight line in top and side elevation at ANY crown value —
              construction, not a finding. The Builder proposed that view as the
              discriminator and was wrong to.

              ⛔ BOTH CARDS NOW RUN ONE BLUEPRINT: `(1-x²)(1-y²)` at Carl's crown
              of 0.073. *"it is a blueprint for all 4 cards."* */}
          <group position={cs.position} rotation={[0, cs.rotationY, 0]} scale={cs.scale}>
            {/* ⛔⛔ THE TWO GLASS NUMBERS ARE STATED HERE, NOT INHERITED — 22 September
                2026. `glassFaceTransmission` would default to `GLASS_FACE_TRANSMISSION`
                anyway; it is passed explicitly so **the room's values are readable at
                the room's call site** rather than by opening a second file.

                ⚠⚠ BOTH ARE BENCH VALUES AND THE BENCH IS NOT THE ROOM. `lod` scales
                with the transmission render target's width (`transmission_pars_fragment
                .glsl.js:147`), so **the same roughness frosts differently here.** The
                bench settles the frost's CHARACTER; its SCALE is a property of the
                target. See the header of `about-card-glass.ts`.

                ⚠ 0.86 gives the face a BODY so the card reads against the dark desk —
                at 1.0 it had none and its left edge vanished. ⛔ THE RIM IS UNAFFECTED
                and stays clear at 1.0: it is the neon.

                ✔✔ BOTH VALUES ARE APPROVED BY CARL'S EYE IN THIS ROOM, 22 September
                2026 — D-089, R-027. ⛔⛔ DO NOT RETUNE EITHER WITHOUT HIS SPECIFIC
                AUTHORISATION: *"I am happy with the frostiness."* ⚠ The only thing
                that may still move is COLOUR (D-090), which lives in `GLASS_COLOR` /
                `GLASS_ATTENUATION_COLOR` — not in these two numbers. */}
            <AboutCardMesh
              dims={cs.dims}
              crownMm={cs.crownMm}
              glass
              glassRoughness={0.35}
              glassFaceTransmission={GLASS_FACE_TRANSMISSION}
              neon={csNeon}
              faceReceiveShadow={extrudeCardId === "cs"}
            />
            {/* ⛔ CS'S TEXT — as CD's above. One card per load: `?extrude=cs`. */}
            {extrude && extrudeCardId === "cs" && (
              <CardExtrudedText
                id="cs"
                body={aboutCardCopy("CS").body}
                dims={cs.dims}
                crownMm={cs.crownMm}
                settings={extrude}
                lightDistanceMm={(EXTRUDE_LIGHT_DISTANCE_MM * cs.dims.faceWidthMm) / ca.dims.faceWidthMm}
              />
            )}
          </group>

          {/* ⛔⛔ THE WALL PAIR — CA left, CB right. 17 September 2026.
              ⚠ SAME BLUEPRINT AS THE FLOOR PAIR, DIFFERENT DIMENSIONS ONLY.
              `AboutCardMesh` is unchanged and unparameterised by which wall or
              floor a card sits on — Carl's family rule in code.

              ⚠⚠ `scale` IS REQUIRED AND IS NOT OPTIONAL. `cardDims` returns
              MILLIMETRES — verified in its body, not assumed — so the mesh is
              built at millimetre magnitudes and must be divided by MM_PER_UNIT to
              reach floor units, exactly as the floor pair is.
              ⛔ A FIRST DRAFT OF THIS BLOCK OMITTED IT AND SAID SO IN A COMMENT
              CLAIMING `placeWallCard` ALREADY SIZED THE CARD. **That claim was
              false and would have rendered both wall cards ~750x too large.**
              The comment was written before the units were checked. */}
          <group
            position={ca.position}
            rotation={[0, ca.rotationY, 0]}
            scale={ca.scale}
          >
            {/* ⛔⛔ THE WALL PAIR TAKES THE BASELINE 0.86 — Carl, 22 September 2026:
                *"Lets do the 2 wall cards at the baseline of 0.86 and see how they
                look."* ⚠ **BOTH TOGETHER, deliberately** — Carl: *"because the wall
                cards are similar and easier, do them both together."* **They share a
                wall, a distance and an incidence band, so judging them apart would
                compare each against a different neighbour.**

                ⚠⚠ THE FLOOR PAIR DIVERGED AND THE WALL PAIR MAY NOT. CD needed 0.95
                because its face overlaps the DARK desk front while CS's overlaps LIT
                floorboards. ⛔ **Both wall cards sit against the SAME dark blue wall**,
                so the mechanism that split the floor pair does not obviously apply
                here. **That is a prediction, and the last two were wrong.**

                ⛔ CA IS THE ONE TO WATCH. The record has it at ~14 degrees mean
                incidence — near face-on, where refraction barely happens. ⚠ **What
                sells glass at an angle is the bend; CA has almost none of it**, so it
                leans harder on the BODY than any other card. **If one of the four
                needs its own value, this is the likeliest.**

                ⚠ A DARK BLUE WALL IS LOW-DETAIL COMPARED TO FLOORBOARDS.
                `about-card-glass.ts`: *"a card against a dark, featureless region will
                show less material character."* **Expect less frost character here and
                do not read it as the frost failing.**

                ⛔ NOTHING APPROVED. Carl inspects the pair before any value is kept. */}
            {/* ⛔⛔ CA LEAVES THE BASELINE, CB DOES NOT — Carl, 22 September 2026:
                *"they feel all part of the same family except CA. Lets bump it up to
                0.95."* ⚠⚠ **THE TEST IS FAMILY RESEMBLANCE, NOT MATCHED NUMBERS** —
                CB passed his eye at 0.86 in the same frame. ⛔ **Do not tidy the pair
                onto one value because they share a wall.** Reasoning:
                `CA_FACE_TRANSMISSION`. ⚠ Sweep live with `?ca=0.93`. */}
            <AboutCardMesh
              dims={ca.dims}
              crownMm={ca.crownMm}
              glass
              glassRoughness={0.35}
              glassFaceTransmission={caTransmissionOverride ?? CA_FACE_TRANSMISSION}
              neon={caNeon}
              etch={caEtch}
              faceReceiveShadow={extrudeCardId === "ca"}
            />
            {extrude && extrudeCardId === "ca" && (
              <CardExtrudedText
                id="ca"
                body={aboutCardCopy("CA").body}
                dims={ca.dims}
                crownMm={ca.crownMm}
                settings={extrude}
              />
            )}
          </group>
          <group
            position={cb.position}
            rotation={[0, cb.rotationY, 0]}
            scale={cb.scale}
          >
            <AboutCardMesh
              dims={cb.dims}
              crownMm={cb.crownMm}
              glass
              glassRoughness={0.35}
              glassFaceTransmission={GLASS_FACE_TRANSMISSION}
              neon={cbNeon}
              etch={cbEtch}
              faceReceiveShadow={extrudeCardId === "cb"}
            />
            {/* ⛔⛔ CB'S TEXT — CA'S TREATMENT EXACTLY, 24 September 2026 (session 2).
                Carl: *"Same text size, same type of text. Same reveal. It should
                appear in the card in the same way as CA text does. The only
                difference being is that CB has more words."* ⚠ Same `extrude`
                settings object as CA — one set of faders drives both.
                ⛔ ITS OWN LIGHT, at CA's position SCALED BY FACE WIDTH: *"approximately
                in the same position as CAs light given its proportions."*
                ⛔ ONE CARD PER LOAD: *"isolate CA text so we can focus on CB."*
                *"Just as the text sequence is coming to an end, CB will activate"*
                is a LATER chunk, once all four cards have text. */}
            {extrude && extrudeCardId === "cb" && (
              <CardExtrudedText
                id="cb"
                body={aboutCardCopy("CB").body}
                dims={cb.dims}
                crownMm={cb.crownMm}
                settings={extrude}
                lightDistanceMm={(EXTRUDE_LIGHT_DISTANCE_MM * cb.dims.faceWidthMm) / ca.dims.faceWidthMm}
              />
            )}
          </group>

          {/* ⛔⛔ THE FRAME OWNER — D-093, S1. While mounted it renders EVERY frame
              of this canvas (priority 1 switches off R3F's own render for the
              whole root); the base render is the same call R3F makes, and the
              neon is isolated so a failure costs the glow, never the room.
              ⚠ `?neon=none` unmounts it and R3F renders the room itself. See
              `neon-bloom.tsx`. */}
          {neon.kind !== "none" && <NeonBloom channels={liveNeon} mode={neon} />}        </Canvas>
      </div>
    </div>
  );
}
