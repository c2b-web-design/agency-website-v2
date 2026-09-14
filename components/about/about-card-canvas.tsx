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
          <ambientLight intensity={0.12} />

          {/* ⚠⚠ A STAND-IN KEY. Carl: *"The light will come from the neon rim but
              also 4 individual lights pointed at each card."* ⛔ Neither exists
              yet — the rim is not a light source until chunk 3. This beam is here
              so the crown is legible at all; a correct crown reads FLAT under a
              head-on light. */}
          <directionalLight position={[1, 2, 2]} intensity={2.4} />

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

              ⚠⚠ `flat` AND `domed` TOGETHER IS THE WHOLE IDEA, not a contradiction:
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
        </Canvas>
      </div>
    </div>
  );
}
