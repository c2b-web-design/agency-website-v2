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

import { Canvas } from "@react-three/fiber";
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
import { AboutCardMesh } from "./about-card-mesh";

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

export default function AboutCardCanvas() {
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
          gl={{ antialias: true, alpha: true }}
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
          <ambientLight intensity={0.20} />

          {/* ⚠⚠ A STAND-IN KEY. Carl: *"The light will come from the neon rim but
              also 4 individual lights pointed at each card."* ⛔ Neither exists
              yet — the rim is not a light source until chunk 3. This beam is here
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
          <group position={cd.position} rotation={[0, cd.rotationY, 0]} scale={cd.scale}>
            <AboutCardMesh dims={cd.dims} crownMm={cd.crownMm} />
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
            <AboutCardMesh dims={cs.dims} crownMm={cs.crownMm} />
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
            <AboutCardMesh dims={ca.dims} crownMm={ca.crownMm} />
          </group>
          <group
            position={cb.position}
            rotation={[0, cb.rotationY, 0]}
            scale={cb.scale}
          >
            <AboutCardMesh dims={cb.dims} crownMm={cb.crownMm} />
          </group>
        </Canvas>
      </div>
    </div>
  );
}
