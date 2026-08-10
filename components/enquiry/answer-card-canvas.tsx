"use client";

/**
 * Q&A answer-card canvas — the WebGL proto card, mounted in the left margin
 * beside the live CSS grid.
 *
 * ⚠ BESIDE, NEVER ON TOP. Carl, 3 August 2026: *"Put the new card just to the
 * left of Card 1, top left. It must not be built on top. We can use it to
 * compare and contrast."* The five approved CSS cards keep working untouched;
 * this object is judged next to them.
 *
 * ⚠ ONE WORLD UNIT == ONE CSS PIXEL. The canvas uses an orthographic camera at
 * `zoom: 1`, so @react-three/fiber sets the frustum from the measured CSS size
 * and the mapping is exact at every viewport width. This is the same convention
 * the contact field uses, and it is why the measured 186.66 x 48 can be used
 * directly as geometry dimensions with no scale factor.
 *
 * ⚠ `frameloop="demand"` AND IT STAYS THAT WAY. The light here is STATIC —
 * Carl: *"There would be no animated light"* — so nothing needs a continuous
 * rAF loop. The entrance invalidates while it runs and then stops. The orbiting
 * light rig's continuous loop is the thing that cannot ship to production; this
 * chunk deliberately does not inherit that cost.
 *
 * GEOMETRY PROOF ONLY: no glass, no transmission, no environment map, no
 * filament, no text.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  AnswerCardMesh,
  DEFAULT_TUNING,
  DEFAULT_GLASS_TUNING,
  type AnswerCardTuning,
  type GlassTuning,
  type FilamentState,
} from "./answer-card-mesh";
import {
  ENV_SHELL_RADIUS,
  ENV_KEY_COLOR,
  ENV_KEY_INTENSITY,
  ENV_FILL_COLOR,
  ENV_FILL_INTENSITY,
  RIM_METALS,
  HEAT_WHITE,
  FILAMENT_LIGHT_DISTANCE,
  FILAMENT_COOL_MS,
  FILAMENT_HEAT_MS,
  REST_KEY_POSITION,
  REST_KEY_INTENSITY,
  REST_FILL_POSITION,
  REST_FILL_INTENSITY,
  REST_AMBIENT_INTENSITY,
  // ⚠ `REST_TRAVEL_FROM` / `_TO` ARE NO LONGER IMPORTED HERE, deliberately. The
  // endpoints are inputs to `restTravelPoint` and nothing outside that function
  // should be reconstructing positions from them — that reconstruction is
  // exactly what made the helper draw a different curve from the light.
  REST_TRAVEL_SAG,
  REST_TRAVEL_FORWARD,
  REST_TRAVEL_JUDGED_INTENSITY,
  REST_TRAVEL_MS,
  REST_RETURN_MS,
  // ⚠ THE PATH AND ITS CLOCK COME FROM THE GLASS MODULE, NOT FROM LOCAL MATHS.
  // One definition, three callers — the light, the helper, and the intensity
  // derivation. See `restTravelPoint`.
  restTravelPoint,
  restTravelPhase,
  // ⚠ THE KEYFRAMED AIM. The cone turns as the light travels — see `restAimAt`.
  restAimAt,
  REST_TRAVEL_CONE_ANGLE,
  REST_TRAVEL_CONE_PENUMBRA,
  REST_TRAVEL_DECAY,
  REST_TRAVEL_NEAREST_SQ,
} from "./answer-card-glass";
// ⚠ THE BACKDROP IS NOW THE GROUND PLANE ALONE. `useRegionShift` and
// `REGION_SHIFT_MS` are gone with the `c2b DESIGN` lockup, removed 5 August 2026
// — there is no per-card colour travel behind the cards to drive. The filament
// already ran on the CARD's own fade duration rather than the backdrop's 2400ms
// circuit (Carl: *"see what a filament fade in looks like if its the same as a
// card fade in"*), so nothing about the filament's clock changes here.
import { AnswerCardBackdrop } from "./answer-card-backdrop";
import { CARD_BOXES, cardBoxesAt, GRID_WIDTH_PX } from "./answer-card-backdrop-geometry";
import {
  CARD_WIDTH_PX,
  CARD_HEIGHT_PX,
  CARD_RISE_DURATION_MS,
  CARD_RISE_TRANSLATE_PX,
  CARD_RISE_LADDER_MS,
  CARD_RISE_SCALE_FROM,
  // ⚠ IMPORTED FOR THE ANCHOR'S OVERRUN CLAMP, not for the ladder itself —
  // see `revealStart` in `useCardEntrance`.
  CARD_FIRST_ENTRANCE_MS,
  // ⚠ `PROTO_MIN_VIEWPORT_PX` IS NO LONGER IMPORTED. The 1280px gate it drove
  // was removed on 7 August — the cards now measure the grid instead. The
  // constant still exists because `ENTRANCE_ANCHOR_CEILING_MS` cites it; see the
  // note on this component.
  protoCanvasBox,
  cardSlotPosition,
  checkBudget,
  maxFaceTiltDegrees,
  MIN_FACE_TILT_DEGREES,
} from "./answer-card-geometry";

/**
 * How long the Q5 phrase wipe runs, in ms.
 *
 * ⚠ READ OFF `.enquiry-q-text-reveal` IN `globals.css`, the same declaration
 * `enquiry-opening.tsx`'s own `Q5_REVEAL_CLEAR_MS` is derived from. That file
 * records the history: the value was 700 until 30 July, when Carl saw the
 * stutter MOVE from the "Wh" of "What" to the "h" of "here" — 700ms is ~54% of
 * the way through a 1300ms wipe, so the work had been pushed into the remainder
 * rather than removed. **A moved symptom is not a fixed symptom.**
 */
// ⚠ THE 1300ms DEFER-THE-WHOLE-CANVAS GUARD IS GONE, DELIBERATELY, and the
// constant with it. Carl's walk puts card 1 at the reveal's MIDPOINT, which a
// guard that waits for the reveal to END makes impossible by construction.
//
// ⚠ THE STUTTER IT PROTECTED AGAINST IS STILL PROTECTED — by moving Three.js
// setup EARLIER (before the phrase) rather than later. That is the fix this file
// already prescribed for this exact moment; see the note in `AnswerCardCanvas`.
// The reveal's own duration now lives in `answer-card-geometry.ts` as
// `Q5_REVEAL_MS`, where the ladder derives card 1's entrance from it.

/**
 * The clay study's light travel — `?clay=1`.
 *
 * ⚠ A CONTINUOUS ORBIT, NOT STOPS. Carl's first instruction was three positions
 * on one axis — *"you will have 3 reference points to judge the card from"* —
 * and he replaced it the same session: *"instead of 3 ref points, animate the
 * light on an 8 second loop showing a multitude of angles to best see the
 * geometry."*
 *
 * ⚠ AND THE SECOND INSTRUCTION IS THE BETTER ONE, for a reason worth recording:
 * a surface announces itself by how its shading CHANGES as light crosses it.
 * Three stills give three readings; a circuit gives the transitions between
 * them, which is where a step, a gap or a wrongly-facing slope actually shows.
 * **A frozen light can hide a missing surface behind a plausible highlight.**
 *
 * ⚠ THE THREE-POSITION VERSION WAS BUILT AND REMOVED RATHER THAN LEFT INERT.
 * `CLAY_LIGHT_POSITIONS` and the `?lightpos=` freeze are gone; the orbit below
 * passes through all three angles and many more.
 */

/**
 * One full pass of the light, in ms.
 *
 * ⚠ SLOW IS LOAD-BEARING, NOT A DIAGNOSTIC CONVENIENCE. Carl asked for it so he
 * could inspect the form — *"if you slow the animation right down, you should
 * see the transition clearly, especially the rim shadow that would move because
 * of the light angle"* — and then found the slowness was doing something else
 * too: *"even though the speed of the light is slower, it brings out the 3d
 * geometry."* The shadow's TRAVEL is the reading; at speed the eye gets a
 * flicker instead of a transition.
 *
 * ⚠ THIS IS THE CANDIDATE HOVER MECHANISM, WHICH IS WHY THE VALUE MATTERS
 * BEYOND THE STUDY. It arrived as a by-product of the form render: a card whose
 * geometry reveals itself under a travelling light distinguishes hover from rest
 * without needing to get brighter — which sidesteps the measured problem that
 * the rim is already at 72% of its reachable maximum.
 */
const CLAY_SWEEP_MS = 45000;

/**
 * The arc's radius — how far the light swings out from the card's centre.
 *
 * ⚠ AN ARC, NOT AN AXIS. Carl's plan view, 6 August 2026, settling three earlier
 * misreadings: the light starts to the RIGHT of the card at face level, rises
 * over the TOP, and descends to the LEFT. The card is drawn edge-on with its
 * face toward the viewer (*"US"*), so the light orbits in the vertical plane
 * that contains the viewer — passing over the card as the sun passes overhead.
 *
 * ⚠ AND THE ARC IS WHY THE SHADOW MOVES. On a straight vertical axis the rim's
 * shadow would only lengthen and shorten; swinging the source through 180°
 * sweeps that shadow ACROSS the face, which is the transition Carl wants to
 * watch: *"especially the rim shadow that would move because of the light
 * angle."*
 *
 * ⚠ IT MUST CLEAR THE CARD WITHOUT TOWERING OVER IT. Carl: *"the light needs to
 * go in the middle of the card and outside the rectangle youve built for it."*
 * Too close and the point light appears in frame as a bright dot — a bare bulb
 * competing with what it lights. Too far and the angle stops changing: at radius
 * 150 the source sat 150 above a 48-tall card, so most of the sweep was spent
 * high overhead where nothing moves.
 *
 * 58 clears the card's 24-unit half-height while keeping the source close enough
 * that the angle — and so the rim's shadow — travels visibly across the arc.
 *
 * ⚠ AND THE ARC IS CENTRED ON THE CARD, NOT THE SCENE. Card 1 sits at
 * x = −194.67, y = 28 in world space; an arc about the origin passed almost 195
 * units to its right, so the two ends of the sweep were at different distances
 * and their shadows could not match. Carl caught that by eye: *"the shadows that
 * appear on the left side and right side should be equal, theyre not."* The arc
 * itself was symmetric all along — **the fault was where it was centred.**
 */
const CLAY_ARC_RADIUS = 58;

/**
 * How far the light travels toward and away from the card plane.
 *
 * ⚠ THE Z MOVEMENT IS WHAT MAKES THE ANGLES A MULTITUDE RATHER THAN A CIRCLE.
 * At a fixed z the light only ever presents one elevation; oscillating it means
 * the same in-plane position is visited at a steep rake and at a near-head-on
 * angle in the same circuit. The low end is deliberately close to the card's own
 * plane (the rim's apex is at z=2), because a grazing light is the one that
 * reveals whether a surface is there at all.
 */
/**
 * The vertical travel — the whole point of the study.
 *
 * ⚠ THE POSITIONS ARE READ OFF CARL'S FRONT-VIEW SKETCH, 5 August 2026, after
 * TWO wrong readings of an earlier side view. His three light boxes sit: clear
 * ABOVE the card, straddling its TOP EDGE, and INSIDE the card below that edge.
 * So the light descends the screen, crosses the card's own top rim, and carries
 * on into the card's area — it is not orbiting, and it is not in front.
 *
 * ⚠ THE MIDDLE POSITION IS THE TEST, AND IT IS FALSIFIABLE. Carl: *"When level
 * with the rim there should be a shadow on the face where it starts to rise."*
 * At that height the rim tube stands between the light and the crown, so it must
 * throw a shadow onto the face's lower slope. **If no shadow appears, the face
 * is not rising from the rim** — which is precisely the defect this rebuild was
 * meant to correct.
 *
 * And either side of it: *"When below the rim the face should be darker...
 * Lighter when above."*
 *
 * ⚠ THE CARD'S HALF-HEIGHT IS 24, so these are deliberately close in. An earlier
 * pass used ±34 with the light off to one side, which lit the card's short END
 * and could never produce the middle state at all.
 */
/**
 * How far the arc tilts toward the viewer.
 *
 * ⚠ THE ARC IS NOT IN THE CARD'S PLANE — it leans out toward us, which is what
 * Carl's plan view shows: the light passes over the card on the viewer's side,
 * not behind it. Without this lean the light would swing through the card's own
 * plane, where it lights nothing at the extremes and the face goes black at both
 * ends of the sweep.
 *
 * ⚠ 0.5 KEEPS THE SOURCE AHEAD OF THE FACE'S APEX (z = 4) THROUGHOUT, so there
 * is always a lit side to read, while still dropping low enough at each end for
 * the rim to occlude it and cast.
 */
const CLAY_ARC_TILT = 0.5;

/**
 * What the arc is FOR, and what to watch as it travels.
 *
 *   light out to one SIDE, low   grazing along the face — the rim stands between
 *                                it and the crown, so the tube casts a long
 *                                shadow across the face
 *   light OVER THE TOP           it clears the rim entirely and reaches the whole
 *                                crown — *"Lighter when above"*
 *   descending the other SIDE    the shadow returns, thrown the opposite way
 *
 * ⚠ THIS IS A FALSIFIABLE TEST OF THE REBUILT CROSS-SECTION, not a look. The
 * rim can only cast onto the face if the face RISES FROM the rim's base and
 * stands proud of its apex. Under the old geometry the face sat 0.90 BELOW the
 * rim, behind a 5.00-unit unmodelled gap — **no arc, at any speed, could have
 * produced a travelling rim shadow on it.** If no shadow appears now, the
 * rebuild has not worked.
 */

/**
 * The clay light's exposure — its intensity per unit of distance SQUARED.
 *
 * ⚠ NOT AN INTENSITY. `decay: 2` is physical inverse-square falloff, and this
 * orbit ranges from ~8 units away to ~160 — a 400x swing in delivered light. A
 * fixed intensity therefore blew out the near angles and lost the far ones
 * entirely: the first run of this study had five of its eight frames either
 * pure white or black.
 *
 * ⚠ SO THE LOOP MULTIPLIES THIS BY d² EACH FRAME, holding the exposure constant
 * so that the ONLY thing changing around the circuit is the light's direction.
 * That is the variable the study exists to isolate; brightness moving with it
 * would make every frame unattributable.
 */
// ⚠ LOWERED FOR THE WHITE FACE. A white surface reflects roughly 1.5x what the
// previous mid-grey did, so holding the old exposure would clip the crown to
// flat white at the top of the sweep — losing the "lighter when above" reading
// at exactly the elevation it is meant to be read.
/**
 * ⚠ MEASURED, NOT GUESSED — and only after guessing wrong three times. 2.4 blew
 * out; 0.55, 0.62 and 1.35 all read too dark on the sheet. Each miss cost a full
 * render and a look.
 *
 * `verify/clay-exposure.mjs` sweeps the value at the top of the arc, where the
 * face is most fully lit, and reports the percentile spread:
 *
 *     1.35   p95 200   readable, no clipping
 *     2.50   p95 225   readable, no clipping   <- shipped
 *     4.00   p95 237   near clip
 *     9.00   p95 248   1.6% clipped
 *    13.00   p95 251   8.3% clipped
 *
 * 2.5 is the highest value that keeps the crown's brightest moment off the
 * ceiling, so the "lighter above / shadowed at the rim / darker below" range has
 * room at both ends.
 *
 * ⚠ AND A NOTE FOR ANYONE WHO THINKS IT LOOKS DARK: most of the card is unlit at
 * any instant, because the source is a single point on an arc. **That is the
 * study working, not the exposure failing** — a sheet where the whole card is
 * bright would mean the light had stopped telling us which way each surface
 * faces. Sweep with `?exposure=` before changing this.
 */
const CLAY_LIGHT_EXPOSURE = 2.5;

/**
 * The clay study's single travelling light.
 *
 * ⚠ MODELLED ON `contact-field-light-rig.tsx`, WHICH CARL POINTED AT: *"animate
 * the light source like we did in the client section."* Two things are taken
 * from it directly, and both are load-bearing.
 *
 * ⚠ FIRST: rAF, NOT `useFrame`. Under `frameloop="demand"` R3F only runs its
 * loop when something calls `invalidate()`, so a `useFrame` callback that
 * invalidates itself never gets a first frame to run in. That finding is
 * recorded three times in this codebase — the light rig, both contact-field
 * cascade hooks, and `useLockupFade`, where a ref animated without invalidating
 * produced **three repaints across an entire 2000ms fade.** The loop drives the
 * position; `invalidate()` only PRESENTS it.
 *
 * ⚠ SECOND: THE POSITION IS SET ON THE LIGHT OBJECT, NOT THROUGH STATE. Sixty
 * React renders a second to move one vector would rebuild the scene graph each
 * frame.
 *
 * ⚠ AND `?lightpos=` PARKS IT. A frozen light at a known stop is what makes two
 * captures comparable; a moving one cannot be screenshotted twice the same way.
 */
function ClayFormLight({ centre }: { centre: { x: number; y: number } }) {
  const ref = useRef<THREE.PointLight | null>(null);
  const invalidate = useThree((s) => s.invalidate);

  // ⚠ `?exposure=` — SO THE LEVEL IS MEASURED RATHER THAN GUESSED. It was
  // guessed and missed three times (2.4 blew out, 0.55/0.62/1.35 too dark),
  // costing a full render and a look each time. `verify/clay-exposure.mjs`
  // sweeps this and reports which values clip and which are readable.
  const exposure = useMemo(() => {
    if (typeof window === "undefined") return CLAY_LIGHT_EXPOSURE;
    const n = Number(new URLSearchParams(window.location.search).get("exposure"));
    return Number.isFinite(n) && n > 0 ? n : CLAY_LIGHT_EXPOSURE;
  }, []);

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = () => {
      const light = ref.current;
      if (light) {
        // ⚠ AN ARC OVER THE CARD — right, over the top, down to the left, and
        // back. `a` runs 0..pi across the sweep, so the light rises from face
        // level on one side to directly overhead and descends the other side.
        //
        // ⚠ IT REVERSES RATHER THAN WRAPPING. A full 0..2pi circuit would take
        // the light UNDER the card, where it lights nothing and the study goes
        // dark for half its duration. Travelling back along the same arc keeps
        // every moment of the loop readable, and the cosine easing means the
        // turn at each end has no corner.
        const p = ((performance.now() - start) % (CLAY_SWEEP_MS * 2)) / CLAY_SWEEP_MS;
        const tri = p <= 1 ? p : 2 - p;
        const a = tri * Math.PI;

        // ⚠ CENTRED ON THE CARD, NOT ON THE GRID'S ORIGIN — and getting this
        // wrong is what Carl caught by eye: *"the shadows that appear on the
        // left side and right side should be equal, theyre not."*
        //
        // ⚠ THE ARC ITSELF WAS ALWAYS SYMMETRIC. Checked at every 30°: a perfect
        // mirror in x, matched in y and z. **The asymmetry was in WHERE it was
        // centred.** Card 1 sits at x = −194.67, y = 28 in world space, so an arc
        // about the origin passed almost 195 units to the card's RIGHT — the two
        // ends of the sweep were at completely different distances from it and
        // their shadows could not possibly match.
        //
        // His plan view draws the arc as a vertical line THROUGH THE CARD. That
        // is the specification: the light passes over the card's own centre.
        const x = Math.cos(a) * CLAY_ARC_RADIUS + centre.x;
        const y = Math.sin(a) * CLAY_ARC_RADIUS + centre.y;
        // ⚠ THE ARC LEANS TOWARD THE VIEWER, so the source stays on the face's
        // side throughout. Tied to the arc's own height, so the light is
        // furthest forward at the ends — where it grazes and casts — and highest
        // over the card at the top, where it floods the crown.
        const z = CLAY_ARC_RADIUS * CLAY_ARC_TILT * (1 - Math.sin(a) * 0.55);
        light.position.set(x, y, z);

        // ⚠ THE INTENSITY TRACKS DISTANCE, AND WITHOUT IT THE STUDY IS
        // UNREADABLE. `decay: 2` is inverse-square, so a light travelling this
        // far in y would brighten and dim purely from moving — and a render
        // whose brightness changes with its angle cannot attribute what it shows
        // to either. Compensating by d² holds the exposure constant so the only
        // variable left is ELEVATION, which is what Carl is judging.
        // ⚠ DISTANCE TO THE CARD, NOT TO THE ORIGIN. Measuring from the scene's
        // centre would compensate for the wrong number now the arc has moved,
        // and the exposure would swing across the sweep again.
        const dx = x - centre.x;
        const dy = y - centre.y;
        const d2 = dx * dx + dy * dy + z * z;
        light.intensity = exposure * d2;
        light.updateMatrixWorld(true);
        invalidate();
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [centre, exposure, invalidate]);

  return (
    <pointLight
      ref={ref}
      position={[centre.x + CLAY_ARC_RADIUS, centre.y, CLAY_ARC_RADIUS * CLAY_ARC_TILT]}
      /* Overwritten every frame by the loop, which scales it by d². */
      intensity={CLAY_LIGHT_EXPOSURE * CLAY_ARC_RADIUS ** 2}
      decay={2}
      castShadow
      /* A tight, high-res map — the feature under inspection is a few units
         across, and the default 512 would render its shadow as a soft smear the
         width of the thing casting it. */
      shadow-mapSize-width={2048}
      shadow-mapSize-height={2048}
      shadow-camera-near={1}
      shadow-camera-far={400}
      /*
        ⚠ THE BIAS PAIR IS TUNED FOR A CURVED SELF-SHADOWING SURFACE, and the
        first attempt was wrong in a way Carl spotted on screen before the sheet
        did: *"theres a dark patch on the bottom face."*

        ⚠ THAT PATCH IS SHADOW ACNE, NOT SHADING. Now the crown stands PROUD it
        is tall enough to shadow its own lower half, so the face is testing
        itself against its own depth map. At `bias -0.0004` alone the comparison
        fails across a broad band of nearly-tangent fragments and returns a hard
        blocky wedge with a stair-stepped edge — the giveaway that it is a
        sampling artefact rather than a cast shadow.

        `normalBias` offsets the sample along the surface normal, which is the
        correct fix for curvature: it scales with how obliquely the light hits,
        so it does nothing where the surface faces the light and grows exactly
        where the acne appears. The constant bias then only needs to be small.
      */
      shadow-bias={-0.0001}
      shadow-normalBias={0.6}
    />
  );
}

// ── Tuning harness ───────────────────────────────────────────────────────────

/**
 * The travelling light — one source crossing the whole grid, top-left to
 * bottom-right, bowing toward the viewer in between.
 *
 * ⚠ CARL'S DESIGN, 9 August 2026: *"another light starting top left, looking
 * across the cards and ending bottom right with an ellipse in between."* It sits
 * on top of a static rig copied from the contact field, which is an approved
 * object lit in a way he has already accepted.
 *
 * ⚠ ONE LIGHT ACROSS THE ROW, NOT ONE PER CARD — and that is the correction the
 * five-light attempt earned rather than a preference. Per-card lights each had
 * to disclose a ~104px face by moving within it, and could not resolve at that
 * size: *"it looks ok zoomed in but not at this scale."* A single traveller
 * makes the highlight move BETWEEN cards, so the motion is measured against the
 * whole 576-unit row instead of against one small face.
 *
 * ⚠⚠ A SPOTLIGHT AT `decay = 2`, CHANGED 9 August 2026 — Carl: *"change from a
 * point light. Ref client info section"*.
 *
 * ⚠ THE PREVIOUS RIG CONTRADICTED ITSELF AND THAT IS WHY SIX ATTEMPTS READ AS
 * FLAT. It was a PointLight chosen explicitly *"because the bow only means
 * something if distance does"* — and then given `decay={0}`, which takes
 * distance out of the falloff. **A decay-0 light is the same brightness
 * everywhere, so no path shape can modulate it.** Measured on the real GPU:
 * `?travint=6`, seven times the old default, changed nothing visible.
 *
 * ⚠ AND A SPOTLIGHT NEEDS A REAL TARGET OBJECT. three.js resolves a spot's
 * direction from `target.matrixWorld`; **assigning a bare `Vector3` silently
 * does nothing** — a trap `contact-field-light-rig.tsx` already records. The
 * target here is an `<object3D>` at the row's centre, so the cone aims across
 * the whole assembly rather than at any one card.
 *
 * ⚠ `invalidate()` EVERY FRAME. The canvas is `frameloop="demand"`; a light that
 * moves without requesting a render is an animation that runs and is invisible.
 */
function TravellingLight({
  reducedMotion,
  level,
  showHelper,
  sag,
  forward,
  travelMs,
  returnMs,
  intensity,
}: {
  reducedMotion: boolean;
  level: number;
  /** How far the curve dips below the straight line. `?sag=` */
  sag: number;
  /** How far it comes forward of the card plane. `?fwd=` */
  forward: number;
  /** The visible pass, ms. `?travelms=` */
  travelMs: number;
  /** The race round the back, ms. `?returnms=` */
  returnMs: number;
  /** The traveller's brightness. `?travint=` */
  intensity: number;
  /**
   * ⚠ `?lighthelpers=1` DRAWS THE TRAVELLER AND ITS WHOLE PATH. A point light
   * has no body, and this one moves — so without a marker the only way to know
   * where it goes is to infer it from shading, which is exactly the blind
   * reasoning that cost five attempts at the resting rig. Carl: *"i need to see
   * where the light is moving, not just the effect."*
   */
  showHelper: boolean;
}) {
  const ref = useRef<THREE.SpotLight | null>(null);
  const targetRef = useRef<THREE.Object3D | null>(null);
  const scene = useThree((s) => s.scene);
  const invalidate = useThree((s) => s.invalidate);

  /**
   * ⚠ THE CONE IS AIMED BY A REAL OBJECT, AND IT MUST BE IN THE SCENE GRAPH.
   * three.js reads a spot's direction from `target.matrixWorld`, so a target
   * that is never added to the scene never gets its world matrix updated and the
   * cone points at the origin regardless of what was assigned.
   */
  useEffect(() => {
    const light = ref.current;
    const targetObj = targetRef.current;
    if (!light || !targetObj) return;
    light.target = targetObj;
    targetObj.updateMatrixWorld(true);
    invalidate();
  }, [invalidate]);

  useEffect(() => {
    const light = ref.current;
    if (!light) return;

    /**
     * ⚠ THE PATH COMES FROM `restTravelPoint`, THE SINGLE SHARED DEFINITION.
     * This function does not know the curve's shape and must not learn it — the
     * helper below and the intensity derivation call the same one. Seven
     * recorded "harness that lies" faults in this project all began with a
     * second copy of a curve or a constant.
     */
    const place = (t: number) => {
      const [x, y, z] = restTravelPoint(t);
      light.position.set(x, y, z);
      light.updateMatrixWorld(true);

      /**
       * ⚠ THE CONE TURNS TOO — the target is keyframed, not fixed. Carl: *"can
       * the light be turned itself? ... in the middle pointing at all the
       * faces, like the arrow suggests."*
       *
       * ⚠ AND THE TARGET'S MATRIX MUST BE UPDATED EVERY FRAME OR THE TURN DOES
       * NOTHING. three.js reads the cone's direction from `target.matrixWorld`;
       * moving the object without refreshing that matrix leaves the light
       * pointing wherever it last resolved — a moving value that changes no
       * pixels, which is the failure mode this file has already paid for twice.
       */
      const targetObj = targetRef.current;
      if (targetObj) {
        const [ax, ay, az] = restAimAt(t);
        targetObj.position.set(ax, ay, az);
        targetObj.updateMatrixWorld(true);
      }
    };

    // REDUCED MOTION: park it at the belly — in front, beneath the row, the most
    // even position and the one that asserts least about direction.
    if (reducedMotion) {
      place(0.25);
      invalidate();
      return;
    }

    /**
     * ⚠ THIS LOOP WAS SUSPECTED OF THE Q5 STALL AND MEASURED INNOCENT — recorded
     * so it is not re-suspected on the same reasoning.
     *
     * `7b056c2` turned a demand-mode canvas into a continuously rendering one:
     * the loop below runs unconditionally and calls `invalidate()` every frame
     * for as long as the corridor is open. That made it the leading suspect for
     * the Q5 regression — a canvas rendering every frame while the real one
     * creates its WebGL context is exactly the shape of contended driver work
     * the profile showed (`(program)` 305ms, no JS hot spot).
     *
     * ⚠ MEASURED WITH A TEMPORARY `?parktraveller=1` FLAG, INTERLEAVED: parking
     * it is worth only ~30-70ms, and the bisect scored this commit at **112ms —
     * BETTER than the 158ms of the commit before it.** The real cause was the
     * second label texture added later, at `4c7a20e`.
     *
     * ⚠ AND THE FIRST A/B OF THAT FLAG LIED: 740ms vs 388ms in a single ordered
     * pair, which collapsed to ~30-70ms once interleaved. **Run order, not the
     * flag.** Variance on identical code here is larger than most effects worth
     * hunting — never trust one ordered pair on this page.
     *
     * The flag is removed; the finding is kept. The continuous loop remains a
     * real cost for a phone (see the `frameloop` note in the session record) and
     * throttling it is a visual change that is Carl's call, not a defect fix.
     */

    let raf = 0;
    const start = performance.now();

    const tick = () => {
      // ⚠ PHASE COMES FROM `restTravelPhase`, which owns BOTH the fast hidden
      // half and the easing at the tight curves. Duplicating either here is how
      // the two would drift apart.
      place(restTravelPhase(performance.now() - start));
      invalidate();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // ⚠ THE DIALS ARE DEPENDENCIES OR THE URL DOORS SILENTLY DO NOTHING. The
    // loop closes over them, so without these the effect would keep running with
    // whatever values it started with — a knob that appears to work and changes
    // nothing, which is worse than no knob.
  }, [reducedMotion, invalidate, sag, forward, travelMs, returnMs]);

  /**
   * ⚠ THE PATH, DRAWN — dev only, `?lighthelpers=1`, and it draws the WHOLE
   * curve rather than just the light's current position. Seeing where the
   * traveller IS answers half the question; seeing the line it follows answers
   * the other half, and it is the half that has been guessed at repeatedly.
   *
   * The visible pass is drawn solid; the return leg is not drawn at all, because
   * it runs behind the cards and lighting nothing is the point of it.
   */
  useEffect(() => {
    if (!showHelper) return;

    /**
     * ⚠⚠ THE HELPER CALLS `restTravelPoint` — THE SAME FUNCTION THE LIGHT DOES.
     * It previously built its own points from the endpoints and a `sin` bow,
     * which drew STRAIGHT SEGMENTS WITH A HARD CORNER while the light followed
     * something else. Carl judged the arc against that marker and correctly
     * rejected it: *"i can tell by the arc of the white sphere that it is
     * wrong."* **The marker was wrong, and a debugging aid that lies is worse
     * than none** — the eighth instance of that class in this project.
     *
     * ⚠ AND IT DRAWS THE WHOLE CLOSED RING, both halves. The hidden half is
     * drawn too, because "does the back half mirror the front" is exactly the
     * question this instrument now exists to answer.
     */
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 128; i++) {
      const [x, y, z] = restTravelPoint(i / 128);
      pts.push(new THREE.Vector3(x, y, z));
    }
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    const mat = new THREE.LineBasicMaterial({
      color: "#ffffff",
      // Drawn over everything, for the same reason the directional helpers are:
      // a marker hidden behind the object it describes cannot be read.
      depthTest: false,
      transparent: true,
      opacity: 0.7,
    });
    const line = new THREE.Line(geo, mat);
    line.renderOrder = 999;
    scene.add(line);

    // A small ball riding the light itself, so its position on the path is
    // visible as well as the path.
    const ball = new THREE.Mesh(
      new THREE.SphereGeometry(7, 12, 12),
      new THREE.MeshBasicMaterial({ color: "#ffffff", depthTest: false, transparent: true, opacity: 0.9 }),
    );
    ball.renderOrder = 1000;
    scene.add(ball);

    let raf = 0;
    const follow = () => {
      const l = ref.current;
      if (l) ball.position.copy(l.position);
      raf = requestAnimationFrame(follow);
    };
    raf = requestAnimationFrame(follow);

    return () => {
      cancelAnimationFrame(raf);
      scene.remove(line);
      scene.remove(ball);
      geo.dispose();
      mat.dispose();
      ball.geometry.dispose();
      (ball.material as THREE.Material).dispose();
    };
  }, [showHelper, scene, sag, forward]);

  return (
    <>
      {/* ⚠ THE AIM POINT, WHICH MOVES. It starts on the first keyframe rather
          than at a fixed centre; `place()` drives it every frame from
          `restAimAt`. A static position here would be the value the cone used
          for one frame before the loop takes over — harmless, but it must not
          be mistaken for where the light actually points. */}
      <object3D ref={targetRef} position={restAimAt(0)} />
      <spotLight
        ref={ref}
        position={restTravelPoint(0)}
        angle={REST_TRAVEL_CONE_ANGLE}
        penumbra={REST_TRAVEL_CONE_PENUMBRA}
        /**
         * ⚠ DERIVED FROM THE MEASURED NEAREST APPROACH, NOT PICKED BY FEEL. With
         * `decay = 2` the delivered brightness falls as 1/d², so the property
         * three.js wants is `judged × nearest²`. This scene's world unit is ONE
         * CSS PIXEL and physical falloff is calibrated for metres, which is why
         * the number is large and why writing it as a literal would be
         * meaningless.
         *
         * ⚠ `restTravelNearest()` SWEEPS THE ACTUAL PATH. The field's rig got
         * this wrong once by scaling with its standoff constant instead of the
         * real centre-to-light distance and landed four orders of magnitude
         * short. The distance is measured from the curve, never assumed from the
         * constants that shaped it.
         */
        intensity={intensity * level * REST_TRAVEL_NEAREST_SQ}
        decay={REST_TRAVEL_DECAY}
        distance={0}
      />
    </>
  );
}

const RIG_PARAMS = [
  { key: "tubeRadius", label: "rim tube radius R", step: 0.25, min: 0.5, max: 6 },
  { key: "bevelWidth", label: "bevel width", step: 0.5, min: 1, max: 12 },
  { key: "bevelRise", label: "bevel rise", step: 0.25, min: 0, max: 8 },
  { key: "crownHeight", label: "crown height", step: 0.25, min: 0, max: 12 },
  { key: "plateauU", label: "crown plateau (long axis)", step: 0.02, min: 0, max: 0.95 },
  { key: "faceRecess", label: "face recess behind rim apex", step: 0.25, min: -2, max: 6 },
] as const;

/**
 * Chunk 2's material controls, on `[7]` and `[8]`.
 *
 * ⚠ TWO KNOBS, NOT FOUR. `thickness` and `ior` are deliberately absent: under an
 * orthographic camera their maximum effect across the whole face is 0.801px, so
 * exposing them would move numbers and change nothing visible — this project's
 * own logged trap, where a measurable change the eye cannot see means the metric
 * is not tracking what is being judged.
 *
 * ⚠ AND THERE IS NO "STAND-IN OPACITY" CONTROL. Driving opacity requires
 * `transparent: true`, which removes the backdrop from the transmission pass's
 * opaque list — the glass would stop seeing it entirely, presenting as "the
 * frost went flat" with every assertion still green.
 */
/**
 * The five Q5 answers, shown on the prototype cards.
 *
 * ⚠ ADDED 9 August 2026 — Carl: *"Put the answer text in the boxes, we shouldnt
 * judge it in isolation."* The material is being judged as the BACKGROUND TO A
 * LABEL, which is what it will always actually be. A satin bloom that reads well
 * on a blank card can still be the wrong surface to put text on.
 *
 * ⚠⚠ THIS IS A PROTOTYPE DUPLICATE AND IT MUST NOT SURVIVE ROLLOUT. The real
 * source is `QUESTIONS[5].options` in `enquiry-opening.tsx`, which also holds
 * Q1–Q4. Copying it here is exactly the pattern this project has recorded
 * failing four times — a harness or a component holding its own copy of a value
 * that lives somewhere else, which cannot fail when the original moves.
 *
 * ⚠ IT IS DONE ANYWAY, DELIBERATELY AND NARROWLY, because the alternative is
 * worse today: this canvas is mounted by `enquiry-opening.tsx` but does not
 * receive the question, and threading a `labels` prop through the entrance,
 * the warm-up instance and the clay path to show text on a PROTOTYPE would
 * change the component's contract for a study. **When the cards return as real
 * controls they take their labels from the corridor as props, and this constant
 * is deleted.** Recorded here so it reads as a known debt rather than an
 * oversight.
 */
const CARD_LABELS = [
  "Premium new website",
  "Current site feels dated",
  "Better quality enquiries",
  "Less manual admin",
  "Not sure yet",
] as const;

/**
 * A visible marker for a light that has no body of its own — dev only.
 *
 * ⚠ IT MOUNTS THE HELPER IN AN EFFECT, NOT IN RENDER. `directionalLightHelper`
 * takes the light INSTANCE as a constructor argument, and a ref is null on the
 * first render — passing `ref.current!` inline throws or silently draws nothing
 * depending on timing. The effect runs after the ref is populated, which is the
 * only point at which the light exists.
 *
 * ⚠ AND IT ADDS ITSELF TO THE SCENE RATHER THAN BEING RENDERED AS A CHILD, for
 * the same reason: it is a plain three object built imperatively, and R3F's
 * declarative path cannot construct it before its subject exists.
 *
 * ⚠ THE HELPER MUST BE UPDATED AND DISPOSED. It caches the light's transform, so
 * without `update()` on each change it would draw where the light USED to be —
 * a debugging aid that lies is worse than none, which this project has recorded
 * about instruments four times over.
 */

function LightHelper({
  lightRef,
  color,
}: {
  lightRef: React.RefObject<THREE.DirectionalLight | null>;
  color: string;
}) {
  const scene = useThree((s) => s.scene);
  const helperRef = useRef<THREE.DirectionalLightHelper | null>(null);

  useEffect(() => {
    const light = lightRef.current;
    if (!light) return;
    /**
     * ⚠ BIG AND BRIGHT, BECAUSE A HELPER THAT CANNOT BE SEEN IS NOT A HELPER.
     * Carl, 9 August 2026: *"the problem ive got is that it disappears into the
     * black background when above the card."* The scene's ground is #101010 and
     * the page behind it is near-black, so a 30-unit marker in a mid colour
     * vanishes exactly where the light spends half its arc.
     *
     * ⚠ THIS IS THE SECOND TIME THIS INSTRUMENT HAS FAILED AT ITS ONE JOB. The
     * first version never called `update()`, so it froze at the resting pose
     * while the light swung underneath it. Both failures shared a cause: the
     * helper was treated as decoration rather than as the thing Carl is actually
     * steering by.
     */
    const helper = new THREE.DirectionalLightHelper(light, 90, color);
    // The helper's own lines ignore scene lighting, but depth-testing hides them
    // behind the cards and the ground plane. This rig exists to be watched, not
    // to be occluded by the thing it is lighting.
    const paint = (o: THREE.Object3D) => {
      const m = (o as THREE.Line).material as THREE.Material | undefined;
      if (m && "depthTest" in m) {
        (m as THREE.LineBasicMaterial).depthTest = false;
        (m as THREE.LineBasicMaterial).transparent = true;
        (m as THREE.LineBasicMaterial).opacity = 0.95;
      }
      o.renderOrder = 999;
    };
    paint(helper);
    helper.traverse(paint);

    scene.add(helper);
    helper.update();
    helperRef.current = helper;
    return () => {
      helperRef.current = null;
      scene.remove(helper);
      helper.dispose();
    };
  }, [lightRef, color, scene]);

  /**
   * ⚠ THE HELPER MUST BE UPDATED EVERY FRAME OR IT DRAWS WHERE THE LIGHT USED
   * TO BE — and that is exactly what happened on the first version, 9 August
   * 2026. `DirectionalLightHelper` caches its subject's transform at
   * construction; mounting it once in an effect meant it froze at the resting
   * pose while the light swung underneath it.
   *
   * ⚠ CARL ASKED FOR THE HELPERS PRECISELY TO WATCH THE MOTION — *"i need to see
   * where the light is moving, not just the effect."* A helper that shows a
   * stationary marker over a moving light answers the opposite question, and
   * would have been read as "the light is not moving". **A debugging aid that
   * lies is worse than none**, which this project has now recorded about
   * instruments five times.
   */
  useFrame(() => {
    helperRef.current?.update();
  });

  return null;
}

const GLASS_RIG_PARAMS = [
  // ⚠ THE LABEL SAYS SATIN, NOT FROST — the face material changed on 9 August
  // 2026 and this dial's MEANING changed with it. On glass it drove the
  // transmission blur; on satin it decides how tight the sheen's core is, and
  // therefore whether the crown's 23.8° curve reads at all. The KEY is
  // deliberately unchanged so the `?roughness=` harness door and every existing
  // sweep keep working.
  { key: "roughness", label: "roughness (SATIN TIGHTNESS)", step: 0.02, min: 0, max: 1 },
  // ⚠ INERT ON THE FACE SINCE 9 AUGUST — the satin passes `transmission={0}`.
  // Kept on the rig because the clay/diagnostic path still reads it and because
  // removing a dial mid-chunk invalidates every note that cites it.
  { key: "transmission", label: "transmission (INERT — satin)", step: 0.05, min: 0, max: 1 },
  /**
   * ⚠ THE SMEAR — what makes the surface satin rather than shiny blue plastic.
   *
   * At 0 the specular is a round dot; raised, it stretches along the tangent
   * into the long soft band every one of Carl's references shows. The tangent
   * is built along the card's LONG axis in `convexFaceGeometry`, which is the
   * axis the cylindrical crown does NOT curve on — so the band runs the card's
   * width and the curve is disclosed across its height.
   *
   * ⚠ IT IS SILENTLY INERT WITHOUT THE GEOMETRY'S `tangent` ATTRIBUTE. If this
   * dial appears to do nothing, check the attribute before changing the value.
   */
  { key: "satinAnisotropy", label: "SATIN anisotropy [a]", step: 0.04, min: 0, max: 1 },
  /**
   * ⚠ THE SMEAR'S DIRECTION, in radians from the tangent. 0 runs ALONG the roll
   * — the design. π/2 (~1.57) smears ACROSS the curve and hides the very
   * geometry the material exists to disclose, which makes this dial the fastest
   * way to prove the tangent is doing what it claims.
   */
  { key: "satinAnisotropyRotation", label: "SATIN direction [n]", step: 0.08, min: 0, max: 3.15 },
  /**
   * ⚠ THE GRAZING LOBE'S SOFTNESS, AND THE PARTNER OF `roughness` RATHER THAN AN
   * INDEPENDENT DIAL. In real satin the sheen is the SOFT part — the long bloom
   * along a fold — while the core specular stays tighter. Equal values collapse
   * the two into one lobe and the fabric quality goes with it.
   */
  { key: "satinSheenRoughness", label: "SATIN sheen softness [s]", step: 0.04, min: 0, max: 1 },
  /**
   * ⚠ THE LIGHT FADER, ADDED 4 AUGUST ON CARL'S INSTRUCTION — *"If the rig has
   * no light fader we give it one and start with it low so it has hardly no
   * effect on the metal."*
   *
   * ⚠ WITHOUT IT THE MASTERING PASS CANNOT RUN AS SPECIFIED. Carl's method is
   * two faders from zero pushed up together — *"Rather than start with frosted
   * glass at a half way point, we bring the 'volume' down same for the lights,
   * and push the faders up."* With light as a file constant, one hand tunes by
   * ear and the other by editing source, which is not the same pass.
   *
   * ⚠ AND THE TWO ARE NOT INDEPENDENT: roughness drives both the transmission
   * blur AND the specular response, so the same number that softens what is
   * behind the glass also spreads the highlight across it. Moving one alone
   * gives a reading that changes when the other moves.
   *
   * Range to 2 rather than 1: 1.0 is "full env response", not a ceiling, and the
   * pass may want to push past it.
   */
  { key: "lightLevel", label: "LIGHT LEVEL (the fader)", step: 0.05, min: 0, max: 2 },
  /**
   * ⚠ THE RIM'S OWN ROUGHNESS, AND IT IS THE DIAL WITH REAL RANGE ON IT.
   *
   * Carl asked which metal reflects best when off. The honest answer is that at
   * ~4px of tube the base colour barely registers — `roughness` is what decides
   * whether the rim reads as polished trim or as drawn wire, which is the
   * difference his reference photographs actually show.
   */
  { key: "rimRoughness", label: "rim roughness [r]", step: 0.02, min: 0, max: 1 },
  /**
   * ⚠ THE FILAMENT'S OWN FADER, AND IT STARTS LOW BY INSTRUCTION. Carl: *"it
   * should be dialed down, so only some 'juice' is flowing through it. Coming
   * from a position of 'low volume' and pushing faders up, filament intensity
   * combined with frosted glass is the way to go here."*
   *
   * ⚠ IT IS THE PARTNER OF `roughness` IN THE MASTERING PASS, not an independent
   * control — the amber's visibility through the face depends on the frost, and
   * the frost's read depends on what is behind it. Both move together.
   */
  { key: "filamentIntensity", label: "FILAMENT intensity [f]", step: 0.05, min: 0, max: 3 },
  /**
   * ⚠ THE CUTOFF, AND IT IS ON THE RIG TO MAKE ONE FINDING TANGIBLE: raising it
   * changes NOTHING on the card you are looking at, because Three's `distance`
   * is a window multiplying an already-complete inverse-square falloff, not a
   * normaliser. Sweep it and watch the near field hold still while the far cards
   * arrive. If the near field DOES move, something else is wrong — investigate
   * rather than compensate.
   *
   * Range starts at 90 — the old value, which amputated each card's own face at
   * 93.3px of half-width. See `FILAMENT_LIGHT_DISTANCE`.
   */
  { key: "filamentDistance", label: "filament CUTOFF [d]", step: 25, min: 90, max: 900 },
  /**
   * ⚠ THE SPILL FADER, AND THE ONE CARL'S WORST-CASE METHOD DRIVES: *"if you
   * start from a position of all 5 cards on, and work out theres little effect
   * on other colours, thats the strongest its gonna get."* All five lit, push
   * until other colours shift, back off.
   *
   * Separate from `filamentIntensity` deliberately — that is how bright the rim
   * looks, this is how much it throws onto everything else. Confounding them
   * would repeat the `roughness`/`lightLevel` trap recorded above.
   */
  { key: "filamentPower", label: "filament SPILL power [p]", step: 5, min: 0, max: 600 },
  /**
   * ⚠ THE ONE THAT ACTUALLY BUYS THE NEIGHBOUR EFFECT. Power was the obvious dial
   * and it is the wrong one: a 5x power sweep moved the lit card 5.4x and its
   * neighbour not at all, because every card surface is specular-only and at z=6
   * a neighbour sees the light nearly edge-on. See `FILAMENT_LIGHT_HEIGHT`.
   *
   * ⚠ RAISE IT WITH [p], NOT ALONE — own-card brightness falls as 1/z², so 6 → 15
   * needs roughly 60 → 375 to hold the current look. One control in two hands.
   */
  { key: "filamentHeight", label: "filament HEIGHT [z]", step: 1, min: 6, max: 60 },
  /**
   * ⚠ THE FILTER OVER THE LENS — Carl's *"the equivalent of having white light
   * and then over the lens you put an amber filter."*
   *
   * ⚠ AIM LOW. The brief is *"the most subtle effect to confirm and reinforce
   * that this is a 3D object"* — evidence, not decoration. **An obviously visible
   * setting has probably overshot.** And the glass will be frosted later, which
   * scatters and makes the same value read stronger.
   *
   * Independent of `[f]` on purpose: `[f]` is how bright the filament is, this is
   * how much its light filters the glass. Confounding them would repeat the
   * `roughness`/`lightLevel` trap recorded above.
   */
  { key: "glassFilterStrength", label: "GLASS filter (the tinge) [b]", step: 0.05, min: 0, max: 4 },
  /**
   * ⚠ THE POLISHED SKIN OVER THE FROSTED BODY, AND IT MUST BE SWEPT WITH `[7]`
   * roughness RATHER THAN ALONE. The pair IS the effect: the body scatters light
   * across the face as a gradient, the coat holds a crisp glint on the edge.
   * Either one without the other is a surface doing half a job — a rough face
   * with no coat is dull, a coat over a polished face is two speculars.
   *
   * ⚠ STARTS AT 0, WHICH IS TODAY'S CARD EXACTLY. Nothing moves until it is
   * swept, so this addition cannot have changed the resting look.
   */
  { key: "glassClearcoat", label: "FACE clearcoat [c]", step: 0.05, min: 0, max: 1 },
  /**
   * ⚠ AIM LOW — the coat's whole job is to stay sharp while the body goes rough.
   * At a roughness near the base's own, the two layers stop being distinguishable
   * and the coat is just more surface.
   */
  { key: "glassClearcoatRoughness", label: "face coat ROUGHNESS [v]", step: 0.02, min: 0, max: 1 },
] as const;

/**
 * The rim metal, cycled with `[m]` rather than nudged with the arrows.
 *
 * ⚠ A LIST, NOT A SLIDER, because metals are discrete materials rather than
 * points on a scale — interpolating tungsten toward silver describes nothing
 * real. See `RIM_METALS` for the reflectance table and for why the bright end
 * carries a cost.
 */
const METAL_CYCLE_KEY = "m";

type RigParamKey = (typeof RIG_PARAMS)[number]["key"];
type GlassRigParamKey = (typeof GLASS_RIG_PARAMS)[number]["key"];

/**
 * Keyboard tuning, mirroring `useLightRig` in `contact-field-light-rig.tsx`.
 *
 * ⚠ GATED ON `?cardrig=1` AND **NOT** DEFAULTED ON FOR LOCALHOST, unlike the
 * orbiting light. That rig earned its localhost default by being a finished,
 * judged effect; this one binds the ARROW KEYS, which would otherwise be live on
 * every local page load — including while Carl is typing in the contact field at
 * completion.
 *
 * ⚠ THE INPUT GUARD IS LOAD-BEARING for the same reason: the corridor has real
 * text inputs, and a tuning rig that swallows arrow keys inside them would be a
 * genuine bug rather than a harmless dev affordance.
 */
function useCardRig(): {
  enabled: boolean;
  tuning: AnswerCardTuning;
  glassTuning: GlassTuning;
} {
  const [enabled] = useState(
    () =>
      typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).get("cardrig") === "1",
  );
  const [tuning, setTuning] = useState<AnswerCardTuning>(DEFAULT_TUNING);
  /**
   * ⚠ `?roughness=` AND `?standin=0` EXIST FOR THE HARNESS, not for tuning by
   * hand. The chunk's product is a table of "at what roughness does each stroke
   * width stop being distinguishable", which requires sweeping roughness from
   * outside the page and capturing a stand-in-free reference frame. Both are
   * read once at mount; the keyboard rig remains the interactive route.
   */
  const [glassTuning, setGlassTuning] = useState<GlassTuning>(() => {
    if (typeof window === "undefined") return DEFAULT_GLASS_TUNING;
    const q = new URLSearchParams(window.location.search);
    const next = { ...DEFAULT_GLASS_TUNING };

    const r = Number(q.get("roughness"));
    if (q.get("roughness") !== null && Number.isFinite(r)) {
      next.roughness = Math.min(1, Math.max(0, r));
    }

    // ⚠ `?light=` MIRRORS `?roughness=` AND EXISTS FOR THE SAME REASON: a
    // harness must be able to sweep a fader from outside the page. The keyboard
    // rig stays the interactive route; this is how a probe holds the fader at a
    // known value across several loads.
    const l = Number(q.get("light"));
    if (q.get("light") !== null && Number.isFinite(l)) {
      next.lightLevel = Math.min(2, Math.max(0, l));
    }

    // ⚠ `?fz=` AND `?fp=` — the filament light's HEIGHT and POWER, for the z
    // sweep. They must move TOGETHER: own-card brightness falls as 1/z², so a
    // sweep that raises z alone measures a dimming, not a ratio. See
    // `FILAMENT_LIGHT_HEIGHT`.
    const fz = Number(q.get("fz"));
    if (q.get("fz") !== null && Number.isFinite(fz)) {
      next.filamentHeight = Math.min(60, Math.max(1, fz));
    }
    const fp = Number(q.get("fp"));
    if (q.get("fp") !== null && Number.isFinite(fp)) {
      next.filamentPower = Math.min(2000, Math.max(0, fp));
    }

    // ⚠ `?tinge=` — the glass filter's strength, for the A/B harness. `?tinge=0`
    // is the falsifying control: with the filter off, a sweep of the filament
    // must produce NO warm shift on the face's reflection. A harness that still
    // reports one is measuring its own noise.
    const tg = Number(q.get("tinge"));
    if (q.get("tinge") !== null && Number.isFinite(tg)) {
      next.glassFilterStrength = Math.min(4, Math.max(0, tg));
    }

    // ⚠ `?coat=` AND `?coatr=` — the face's clearcoat and its sharpness. They
    // exist for the same reason `?roughness=` does: a harness must be able to
    // hold a value across several loads, and this pair is swept AGAINST
    // `?roughness=` rather than on its own. See `GLASS_CLEARCOAT`.
    const cc = Number(q.get("coat"));
    if (q.get("coat") !== null && Number.isFinite(cc)) {
      next.glassClearcoat = Math.min(1, Math.max(0, cc));
    }
    const ccr = Number(q.get("coatr"));
    if (q.get("coatr") !== null && Number.isFinite(ccr)) {
      next.glassClearcoatRoughness = Math.min(1, Math.max(0, ccr));
    }

    /**
     * ⚠ `?aniso=`, `?anisorot=`, `?sheenr=` — THE SATIN DIALS, FROM OUTSIDE THE
     * PAGE. Same reason `?roughness=` exists: the keyboard rig is the
     * interactive route, but a harness has to be able to HOLD a value across a
     * reload and compare two renders.
     *
     * ⚠ AND THE FIRST THING THEY ARE FOR IS PROVING THE DIAL IS WIRED AT ALL.
     * `anisotropy` is silently inert without the geometry's `tangent`
     * attribute, and an inert dial looks exactly like a badly-set one. Rotating
     * the smear 90° must visibly change the render; if `?anisorot=0` and
     * `?anisorot=1.57` produce identical pixels, the feature is not reaching the
     * shader and NO value will fix it.
     */
    const an = Number(q.get("aniso"));
    if (q.get("aniso") !== null && Number.isFinite(an)) {
      next.satinAnisotropy = Math.min(1, Math.max(0, an));
    }
    const anr = Number(q.get("anisorot"));
    if (q.get("anisorot") !== null && Number.isFinite(anr)) {
      next.satinAnisotropyRotation = anr;
    }
    const shr = Number(q.get("sheenr"));
    if (q.get("sheenr") !== null && Number.isFinite(shr)) {
      next.satinSheenRoughness = Math.min(1, Math.max(0, shr));
    }

    return next;
  });
  const [selected, setSelected] = useState<RigParamKey | GlassRigParamKey>("roughness");

  // ⚠ THE `?standin=1` / `[s]` CALIBRATION-STROKE TOGGLE IS GONE, because the
  // thing it toggled is gone. The stand-in was a throwaway measuring instrument;
  // the real lockup is behind the card now, and it carries far more detail than
  // four parallel bars ever did.
  //
  // The history is worth keeping even though the code is not: the strokes first
  // shipped ON, so an ordinary load showed four white bars across the card and
  // Carl reasonably asked what they were — a measuring instrument rendering by
  // default reads as a design decision. Turning the whole stand-in OFF then
  // removed the backdrop too and the card became a pale grey slab: *"No glass."*
  //
  // ⚠ ONE CAUSE UNDER BOTH REPORTS, AND IT IS STILL THE GOVERNING FACT: GLASS
  // OVER A NEAR-BLACK PAGE SHOWS NEAR-BLACK. The backdrop is not decoration
  // behind the cards; it is the content the cards are lenses onto.

  useEffect(() => {
    if (!enabled) return;

    const report = (t: AnswerCardTuning, g: GlassTuning) => {
      const check = checkBudget(t.tubeRadius, t.bevelWidth);
      const tilt = maxFaceTiltDegrees(t.crownHeight, t.tubeRadius, t.bevelWidth);
      const mark = (k: string) => (k === selected ? "▶" : " ");
      console.log(
        [
          "── card rig ──────────────────────────────",
          "  GEOMETRY  [1-6]",
          ...RIG_PARAMS.map(
            (p) => `${mark(p.key)} ${p.label.padEnd(30)} ${t[p.key].toFixed(2)}`,
          ),
          "  MATERIAL  [7-9, then 0 is print]",
          ...GLASS_RIG_PARAMS.map(
            (p) => `${mark(p.key)} ${p.label.padEnd(30)} ${g[p.key].toFixed(2)}`,
          ),
          `  rim metal  [m]                 ${RIM_METALS[g.rimMetal]?.name ?? "?"}`,
          "  ─────",
          `  face                           ${check.budget.faceWidth.toFixed(2)} x ${check.budget.faceHeight.toFixed(2)}`,
          `  face corner radius             ${check.budget.faceRadius.toFixed(2)}`,
          `  face height ratio              ${(check.budget.faceHeightRatio * 100).toFixed(1)}%`,
          // ⚠ Analytic prediction, for tuning only. Verification reads the built
          // geometry's own normals — see maxFaceTiltDegrees's own warning.
          `  max face tilt (predicted)      ${tilt.toFixed(2)}° (floor ${MIN_FACE_TILT_DEGREES}°)`,
          check.ok ? "  budget OK" : `  ⚠ BUDGET FAIL: ${check.failures.join("; ")}`,
          tilt >= MIN_FACE_TILT_DEGREES ? "  tilt OK" : "  ⚠ TILT BELOW FLOOR — convexity will not read",
          // ⚠ thickness and ior are FIXED and absent by design — under an
          // orthographic camera their whole-face effect is 0.801px.
          "  (thickness/ior fixed — 0.8px max effect under ortho)",
        ].join("\n"),
      );
    };

    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable)) {
        return;
      }

      const numeric = Number(e.key);
      if (numeric >= 1 && numeric <= RIG_PARAMS.length) {
        e.preventDefault();
        setSelected(RIG_PARAMS[numeric - 1].key);
        return;
      }
      // ⚠ ONLY THE FIRST THREE MATERIAL PARAMS GET DIGITS — [7], [8], [9].
      // A fourth would map to "10", which is not a single keypress, and its
      // leading character would collide with [0] = print. The fourth is bound to
      // a letter below rather than silently unreachable.
      if (
        numeric > RIG_PARAMS.length &&
        numeric <= RIG_PARAMS.length + GLASS_RIG_PARAMS.length &&
        numeric <= 9
      ) {
        e.preventDefault();
        setSelected(GLASS_RIG_PARAMS[numeric - RIG_PARAMS.length - 1].key);
        return;
      }
      // Rim roughness — the fourth material param, on [r].
      if (e.key === "r") {
        e.preventDefault();
        setSelected("rimRoughness");
        return;
      }
      /**
       * ⚠ THE SATIN DIALS — [a] smear, [n] its direction, [s] sheen softness.
       *
       * ⚠ THE DIRECTION IS ON [n], NOT [d], BECAUSE [d] IS ALREADY THE FILAMENT'S
       * CUTOFF DISTANCE. Binding it twice would silently shadow one of them and
       * leave a dial that "does nothing" — a failure this project has recorded
       * repeatedly as being mistaken for a wrong value rather than a wrong wire.
       */
      if (e.key === "a") {
        e.preventDefault();
        setSelected("satinAnisotropy");
        return;
      }
      if (e.key === "n") {
        e.preventDefault();
        setSelected("satinAnisotropyRotation");
        return;
      }
      if (e.key === "s") {
        e.preventDefault();
        setSelected("satinSheenRoughness");
        return;
      }
      // The filament's fader — the fifth material param, on [f].
      if (e.key === "f") {
        e.preventDefault();
        setSelected("filamentIntensity");
        return;
      }
      // The filament light's cutoff — sixth material param, on [d].
      if (e.key === "d") {
        e.preventDefault();
        setSelected("filamentDistance");
        return;
      }
      // The filament's spill power — seventh material param, on [p].
      if (e.key === "p") {
        e.preventDefault();
        setSelected("filamentPower");
        return;
      }
      // The filament light's height above the card plane — on [z].
      if (e.key === "z") {
        e.preventDefault();
        setSelected("filamentHeight");
        return;
      }
      // The glass filter's strength — the tinge — on [b].
      if (e.key === "b") {
        e.preventDefault();
        setSelected("glassFilterStrength");
        return;
      }
      // ⚠ THE FACE'S CLEARCOAT ON [c], ITS ROUGHNESS ON [v] — and [c] is meant to
      // be worked ALONGSIDE [7], not instead of it. See `GLASS_CLEARCOAT`: the
      // frosted body and the sharp coat are one surface in two layers.
      if (e.key === "c") {
        e.preventDefault();
        setSelected("glassClearcoat");
        return;
      }
      if (e.key === "v") {
        e.preventDefault();
        setSelected("glassClearcoatRoughness");
        return;
      }
      if (e.key === METAL_CYCLE_KEY) {
        e.preventDefault();
        setGlassTuning((g) => {
          const next = { ...g, rimMetal: (g.rimMetal + 1) % RIM_METALS.length };
          setTuning((t) => {
            report(t, next);
            return t;
          });
          return next;
        });
        return;
      }
      if (e.key === "0") {
        e.preventDefault();
        setTuning((t) => {
          setGlassTuning((g) => {
            report(t, g);
            return g;
          });
          return t;
        });
        return;
      }
      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault();
        const dir = e.key === "ArrowUp" ? 1 : -1;

        const glassSpec = GLASS_RIG_PARAMS.find((p) => p.key === selected);
        if (glassSpec) {
          setGlassTuning((g) => {
            const next = {
              ...g,
              [glassSpec.key]: Math.min(
                glassSpec.max,
                Math.max(glassSpec.min, g[glassSpec.key] + dir * glassSpec.step),
              ),
            };
            setTuning((t) => {
              report(t, next);
              return t;
            });
            return next;
          });
          return;
        }

        // Narrowed by `find` on the geometry bank: reaching here means `selected`
        // is a geometry key, since the glass branch above returns.
        const spec = RIG_PARAMS.find((p) => p.key === selected);
        if (!spec) return;
        const key = spec.key;
        setTuning((t) => {
          const next = {
            ...t,
            [key]: Math.min(spec.max, Math.max(spec.min, t[key] + dir * spec.step)),
          };
          setGlassTuning((g) => {
            report(next, g);
            return g;
          });
          return next;
        });
      }
    };

    window.addEventListener("keydown", onKey);
    console.log(
      "card rig active — [1-6] geometry, [7-9] material/light, [r] rim roughness, " +
        "[a] satin smear, [n] smear direction, [s] sheen softness, " +
        "[f] filament, [p] power, [z] light height, " +
        "[m] cycle rim metal, [↑/↓] adjust, [0] print",
    );
    return () => window.removeEventListener("keydown", onKey);
  }, [enabled, selected]);

  return { enabled, tuning, glassTuning };
}

// ── Entrance ─────────────────────────────────────────────────────────────────

/**
 * The card's entrance, matching CSS card 1 exactly.
 *
 * ⚠ CARRIED ACROSS, NOT REINVENTED — 700ms linear at a 220ms delay, opacity
 * 0 → 1 with a 6px rise. Carl: *"We will be moving it at the appropriate time
 * into place so the timing will stay."* Matching it means the two cards arrive
 * together and can be compared from the first frame.
 *
 * ⚠ DISABLED UNDER `prefers-reduced-motion`, because the CSS rule that drives
 * card 1 is disabled there too. A WebGL card that animated while its neighbour
 * did not would be a defect the CSS explicitly avoids.
 */
function useCardEntrance(
  active: boolean,
  reducedMotion: boolean,
  delayMs: number,
  onProgress: (p: number) => void = () => {},
) {
  const groupRef = useRef<THREE.Group | null>(null);
  const invalidate = useThree((s) => s.invalidate);

  /**
   * ⚠ HELD IN A REF SO IT IS NOT AN EFFECT DEPENDENCY. `onProgress` is a fresh
   * closure on every render, so depending on it would tear down and restart the
   * entrance whenever anything unrelated re-rendered — the card rig's `selected`
   * state churn is enough, and that is the exact defect `playedRef` exists to
   * prevent from the other direction.
   */
  const onProgressRef = useRef(onProgress);
  useEffect(() => {
    // ⚠ IN AN EFFECT, NOT DURING RENDER. `react-hooks` rejects ref access in the
    // render body ("Cannot access refs during render") — refs are for values
    // that survive renders, and writing one while rendering is the pattern that
    // makes a component's output depend on when it happened to run.
    onProgressRef.current = onProgress;
  }, [onProgress]);

  /**
   * ⚠ HIDE THE GROUP THE MOMENT THE REF IS ATTACHED, NOT IN AN EFFECT.
   *
   * A ref callback runs during commit, BEFORE the renderer draws. `useEffect`
   * runs AFTER, so a group created at its default `visible = true, opacity = 1`
   * is drawn at full brightness for at least one frame before the entrance can
   * set its start state — the card FLASHES INTO EXISTENCE, vanishes, then fades
   * in properly. Carl reported exactly that: *"comes into view very quickly,
   * disappears then back into view."*
   *
   * Setting it here means the first frame the renderer ever sees is already the
   * entrance's frame 0.
   */
  const attachGroup = useCallback(
    (group: THREE.Group | null) => {
      groupRef.current = group;
      if (!group) return;
      // ⚠ HIDDEN AT ATTACH, and shown by the tick loop's very first frame. The
      // ref callback runs during commit, BEFORE the renderer draws, so this
      // guarantees the card is never drawn at its pre-entrance position. There
      // is no hidden→visible step on screen because the first drawn frame is
      // already the entrance's frame 0.
      group.visible = false;
      group.position.y = -CARD_RISE_TRANSLATE_PX;
      // ⚠ SET HERE TOO, FOR THE SAME REASON AS `visible` AND `position`: the ref
      // callback runs during commit, before the renderer draws, so frame 0 must
      // already be the entrance's frame 0 in EVERY property it animates. A scale
      // left at 1 until the effect ran would show one full-size frame first.
      group.scale.set(CARD_RISE_SCALE_FROM, CARD_RISE_SCALE_FROM, 1);
    },
    [],
  );

  /**
   * Whether the entrance fade is still running.
   *
   * ⚠ THE FADE AND THE GLASS FIGHT EACH OTHER, and this is the third stage Carl
   * reported: *"fades in, moves slightly up then brightens."*
   *
   * The fade drives `material.opacity`, which requires `transparent = true` on
   * every sub-mesh. But `three.module.js:8237` routes ANY material with
   * `transparent === true` out of the opaque list, and `:18039` renders only
   * `opaqueObjects` into the transmission target. **So for the whole 700ms rise,
   * the rim and bevel are invisible to the glass refracting them** — and the
   * card visibly changes when the fade ends and they rejoin the opaque list.
   *
   * ⚠ IT IS THE SAME CONSTRAINT THIS CHUNK ALREADY DOCUMENTED FOR THE STAND-IN,
   * arriving from the other direction. The stand-in was made opaque on purpose;
   * the entrance was quietly making everything else transparent.
   *
   * ⚠ SO THE OPACITY FADE IS REMOVED AND THE 6px RISE IS KEPT. The meshes stay
   * opaque throughout, the transmission target never changes membership, and the
   * card is fully-formed glass from its first visible frame.
   *
   * ⚠ THIS IS A DEPARTURE FROM CARD 1's CSS ENTRANCE, which fades opacity 0 -> 1
   * as well as rising. It is accepted for the proto because Carl has already
   * settled that the test object's entrance does not need to match: *"the new
   * card is a test, it's not important it reveals with card 1, only that it's
   * there."*
   *
   * ⚠ AND IT IS A REAL CONSTRAINT FOR CHUNK 5, not a temporary shortcut. A
   * transmissive card CANNOT cross-fade by material opacity without dropping its
   * own neighbours out of the refraction for the duration. When the rollout
   * needs the approved 700ms/220ms fade, the route is a group-level effect
   * (scale, position, or a masked reveal) — never per-material opacity.
   */

  /**
   * ⚠ THE ENTRANCE RUNS ONCE PER ACTIVATION, GUARDED BY A REF.
   *
   * Without this the effect re-ran on every unrelated re-render — the card rig's
   * `selected` state churn is enough — resetting `start` and replaying the fade
   * from zero. That is the second half of the reported flash: the card
   * disappearing and coming back.
   */
  const playedRef = useRef(false);
  /** Whether this card's rung has been reached; drives the dev beat trace. */
  const shownRef = useRef(false);

  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;

    if (!active) {
      group.visible = false;
      playedRef.current = false;
      shownRef.current = false;
      invalidate();
      return;
    }

    if (playedRef.current) return;
    playedRef.current = true;

    // ⚠ DELIBERATELY NOT `group.visible = true` HERE.
    //
    // An earlier version did, and the tick loop then set it straight back to
    // false for the 220ms delay — so the card rendered at full brightness for
    // one frame before disappearing and rising. That was the last of Carl's
    // four entrance reports: *"it appears, flashes and moves up."*
    //
    // Visibility is owned by the tick loop alone, from here on. There is exactly
    // one place that decides whether the group is on screen.

    if (reducedMotion) {
      group.visible = true;
      group.position.y = 0;
      group.scale.set(1, 1, 1);
      invalidate();
      return;
    }

    // ⚠ THE STAGGER IS BACK, AND THE COMMENT THAT REMOVED IT HAS EXPIRED.
    //
    // It previously said: *"`CARD_RISE_DELAY_MS` (220) exists to stagger card 1
    // against its four neighbours. This proto card has no neighbours, so a
    // further 220ms of deliberate invisibility buys nothing"* — and predicted its
    // own reversal: *"THE STAGGER RETURNS IN CHUNK 5, where it means something:
    // five cards on the approved 220/350/480/610/740 ladder."*
    //
    // **That is now.** The cards have neighbours, so the delay means something
    // again: it is the sequence Carl asked for — *"The cards come on in
    // sequential order. 1,2,3,4 and then 5."*
    //
    // ⚠ THE HIDDEN→VISIBLE FLASH THE OLD COMMENT WARNED ABOUT IS STILL REAL, and
    // it is handled rather than avoided: the group is hidden at attach (see
    // `attachGroup`) and the tick loop below only shows it once its own rung has
    // arrived. Visibility is still owned by exactly one place.
    let raf = 0;

    /** Read once, not per frame — see the progress trace inside `tick`. */
    const tracing =
      typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).get("beattrace") === "1";

    /**
     * ⚠ THE LADDER'S ZERO IS THE PHRASE REVEAL'S OWN CLOCK, NOT THIS EFFECT'S.
     *
     * Carl, 6 August: *"the entrance of card 1 should happen halfway between the
     * Q5 text reveal. its happening after."*
     *
     * ⚠ THE CONSTANT WAS ALREADY RIGHT, WHICH IS WHY THIS WAS EASY TO MISREAD.
     * `CARD_FIRST_ENTRANCE_MS` is `Q5_REVEAL_MS / 2` = 650, derived exactly as
     * intended. **The bug was never the number; it was the origin it counts
     * from.** This effect's `performance.now()` fires when the WebGL canvas is
     * mounted and active — which is AFTER the CSS reveal has already started.
     * Measured by `verify/q5-card-latency.mjs` against the animation's own
     * `startTime`: reveal at 10631ms, card 1's rung at 11548ms. **917ms into a
     * 1300ms reveal — 71%, when it was scheduled for 50%.**
     *
     * ⚠ AND AN EARLIER PROBE READ THAT OFFSET AS 17ms, which is the instructive
     * part. It sampled the animation only once the card canvas was READY, so it
     * measured from a point already past the drift and reported the two clocks
     * as almost aligned. **A measurement taken at the wrong instant is not a
     * weaker measurement, it is a wrong one.** `startTime` is authoritative
     * because it is the animation's own origin rather than an observation of it.
     *
     * ⚠ SO THE CLOCKS ARE TIED BY CONSTRUCTION RATHER THAN BY COINCIDENCE, and
     * the ladder cannot drift again if mounting, compilation or the warm-up gate
     * changes speed — all of which have moved during this project.
     *
     * ⚠⚠ BUT THE ANCHOR IS ONLY VALID WHILE IT IS STILL AHEAD OF CARD 1's RUNG,
     * AND WITHOUT THE CLAMP BELOW IT IS A REGRESSION GENERATOR.
     *
     * This effect is gated on `compiled`, which measured **1944ms after the
     * cards mount** on 5 August — two `compileAsync` passes, a full `gl.render`,
     * and `useLocalEnvMap`'s ~572ms of ungated PMREM.
     *
     * ⚠ THAT 1944ms IS A HISTORICAL WORKED EXAMPLE, NOT CURRENT TIMING — noted
     * 9 August 2026, when the same figure was found quoted as live fact in three
     * other comments. It is kept HERE because the arithmetic below depends on a
     * concrete overrun to be legible, and the failure it demonstrates is
     * scale-free: ANY overrun past card 1's rung collapses the ladder. Do not
     * read it as what `compiled` costs today.
     *
     * ⚠ WHAT IT COSTS TODAY, measured on the real GPU: the ladder runs
     * **+695 → +2949ms from Begin** (`verify/approved-timings.mjs`), and the
     * clamp below is why an overrun no longer reaches the rungs.
     * Meanwhile `.enquiry-q-text-reveal` is `1300ms ... both`, and the `both`
     * fill keeps the animation RELEVANT after it finishes — so `getAnimations()`
     * keeps returning it and `startTime` stays readable indefinitely. **The
     * fallback therefore never fires**, and an unclamped anchor faithfully
     * returns an origin arbitrarily far in the past.
     *
     * ⚠ THE FAILURE IS NOT THAT THE ENTRANCE STARTS EARLY — IT IS THAT THE FIRST
     * FRAME CONSUMES EVERY RUNG ALREADY PASSED. At 1944ms of overrun the first
     * tick sees `elapsed ≈ 1944` against rungs of 650/1210/1770, so cards 1, 2
     * and 3 all become visible in the SAME FRAME at `raw` 0.65/0.37/0.09.
     * **Measured, not predicted** (`verify/entrance-fade.mjs`): "card 2 starts
     * 0ms after card 1 — 0% into card 1's rise", the same for card 3, with 52,
     * 86 and 120 frames of rise left respectively.
     *
     * ⚠ THAT IS THE EXACT DEFECT THE `compiled` GATE EXISTS TO PREVENT — *"on
     * first walking the sequence they all came on at the same time"* — and it is
     * what Carl reported of this anchor: *"There is no overlap between ths cards
     * and each cards first appearance is a rectangular black shape, not glass."*
     *
     * ⚠ AND IT LOOKS IDENTICAL TO A WORKING STAGGER IN A STILL. Three cards at
     * three brightnesses is consistent with a correct ladder AND with one that
     * consumed three rungs in a frame. Screenshots cannot tell them apart; only
     * the per-frame `raw` trace can. **Do not accept this on a screenshot.**
     *
     * So the anchor is used only while it has not overrun, and otherwise degrades
     * to today's behaviour — card 1 arriving at its own rung from now. **Fail to
     * the current timing, never to a collapsed ladder.**
     */
    const nowMs = performance.now();
    const anchor = (() => {
      if (typeof document === "undefined") return nowMs;
      const el = document.querySelector(".enquiry-q-text-reveal");
      // ⚠ MATCHED BY NAME, NOT BY INDEX. `getAnimations()[0]` is order-dependent,
      // so a second animation or a transition on this element would silently
      // hand the ladder the wrong clock.
      const anim = el
        ?.getAnimations?.()
        .find((a) => (a as CSSAnimation).animationName === "enquiry-mask-reveal-horizontal");
      // `startTime` is `CSSNumberish`; on a document timeline it is a number, and
      // this guard is what keeps that true rather than assumed.
      if (anim && typeof anim.startTime === "number") return anim.startTime;
      return nowMs;
    })();

    const revealStart =
      nowMs - anchor > CARD_FIRST_ENTRANCE_MS ? nowMs - CARD_FIRST_ENTRANCE_MS : anchor;

    const tick = () => {
      const elapsed = performance.now() - revealStart;

      // ⚠ STILL HIDDEN UNTIL THIS CARD'S RUNG. The group was hidden at attach and
      // stays hidden through its delay, so there is no frame in which it is drawn
      // early. `visible` is what holds it before the rung — a card waiting its
      // turn is absent, not transparent — and alpha then carries the entrance
      // itself from that first visible frame.
      if (elapsed < delayMs) {
        // Held at zero through the delay, so the first drawn frame is the
        // entrance's own frame 0 in alpha as well as in position.
        onProgressRef.current(0);
        raf = requestAnimationFrame(tick);
        return;
      }

      // ⚠ A DEV-ONLY BEAT TRACE, gated on `?beattrace=1`.
      //
      // Four pixel-reading instruments failed to answer "does the entrance
      // run": `gl.readPixels` and in-page `drawImage` both return an empty
      // buffer under `frameloop="demand"`, and Playwright's first
      // `screenshot()` costs ~4900ms — longer than the entrance it was meant to
      // catch. All three reported ABSENCE, which is what a broken entrance
      // reports too.
      //
      // The animation's own clock is the honest source, so it says when it
      // starts. Costs one `performance.mark` per card per run, and nothing at
      // all without the flag.
      if (!shownRef.current) {
        shownRef.current = true;
        if (typeof window !== "undefined" &&
            new URLSearchParams(window.location.search).get("beattrace") === "1") {
          performance.mark(`card-beat-${delayMs}`);
        }
      }

      group.visible = true;

      const raw = Math.min(1, (elapsed - delayMs) / CARD_RISE_DURATION_MS);
      onProgressRef.current(raw);

      /**
       * ⚠ A DEV-ONLY PROGRESS TRACE, gated on the same `?beattrace=1` as the
       * mark above and costing nothing without it.
       *
       * ⚠ IT EXISTS BECAUSE PIXELS CANNOT RESOLVE THIS CHOREOGRAPHY. A
       * screenshot per sample costs ~40-130ms, so a harness built that way left
       * a 330ms hole in its own timeline and reported cards 1 and 2 as rising in
       * perfect lockstep with a 0ms gap — an instrument artefact, since the beat
       * marks show their rungs firing exactly `CARD_RISE_GAP_MS` apart. **A
       * sampler slower than the thing it samples will invent a defect and hide a
       * real one.**
       *
       * Publishing `raw` per card per frame lets `verify/entrance-fade.mjs` read
       * the actual curves and their overlap at full rAF resolution.
       */
      if (tracing) {
        const w = window as unknown as {
          __cardTrace?: Array<{ t: number; card: number; raw: number }>;
        };
        w.__cardTrace ??= [];
        w.__cardTrace.push({ t: Math.round(performance.now()), card: delayMs, raw });
      }

      /**
       * ⚠ EASED, NOT LINEAR — AND THIS REOPENS AN ACCEPTED TRADE-OFF ON CARL'S
       * REPORT: *"still, no fade and far too fast."*
       *
       * ⚠ THE OPACITY FADE IS BACK, ON CARL'S INSTRUCTION OF 7 AUGUST 2026:
       * *"The card has a slight rise coupled with an opacity fade will enhance
       * the 3d features."* The paragraph that stood here said the card CANNOT
       * fade by opacity and called it *"not a preference"*. The three.js
       * constraint it cited is real, but it was treated as a prohibition when it
       * is a COST — and the substitute chosen instead (ramping `color` and
       * `envMapIntensity` from black) is what produced the black rectangle. See
       * the long note above `CardLighting` for the full reversal.
       *
       * ⚠ THE MOTION STAYS. Alpha and the rise are one event, exactly as
       * `@keyframes enquiry-card-rise` has always done it on the CSS cards. The
       * rise is what makes the card *"catch more of the light as it fades in"* —
       * the light is static, so movement through it is the whole mechanism.
       */
      const t = 1 - Math.pow(1 - raw, 3);

      // World +y is UP and the CSS translate is DOWN, hence the negation.
      group.position.y = -CARD_RISE_TRANSLATE_PX * (1 - t);

      // ⚠ A SCALE ENTRANCE IS THE ONE ROUTE OPACITY CANNOT BLOCK. Kept small —
      // this is a card settling into its slot, not a pop.
      const s = CARD_RISE_SCALE_FROM + (1 - CARD_RISE_SCALE_FROM) * t;
      group.scale.set(s, s, 1);

      /**
       * ⚠ NOTHING IS PUBLISHED FOR THE LABEL ANY MORE, AND THAT IS THE FIX.
       *
       * ⚠ THREE VERSIONS TRIED TO SYNCHRONISE A DOM LABEL WITH THIS ANIMATION
       * AND ALL THREE FAILED, 9 August 2026:
       *
       *   1. Shared start time, its own easing — different curve, 6px instead
       *      of 10px, no scale. Carl: *"2 separate things."*
       *   2. Polled this card's published values — right values, one frame
       *      late. Measured 0.025 alpha divergence.
       *   3. Applied in this very frame, transform driven by alpha — measured
       *      **0.0000** divergence, and Carl still saw it: *"as if the text is
       *      trying to catch up with the card or mimmic its movement."*
       *
       * ⚠ VERSION 3 IS THE ONE THAT SETTLES IT. When the numbers are provably
       * identical and the eye still reads two objects, the numbers were never
       * the problem. A DOM label moves in 2D CSS pixels; this card rises in 3D
       * world space under a perspective camera. **Different geometries — they
       * agree at the endpoints and disagree everywhere between**, and a better
       * imitation only makes the mismatch harder to name.
       *
       * The label is now drawn INTO the face's albedo (`buildLabelTexture` in
       * `answer-card-mesh.tsx`), so it is transformed, lit and faded by this
       * group along with everything else. There is nothing left to synchronise.
       */
      invalidate();

      if (t < 1) {
        raf = requestAnimationFrame(tick);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, reducedMotion, delayMs, invalidate]);

  return attachGroup;
}

/**
 * Drive the filament's circuit: the head leaves the origin and meets itself.
 *
 * ⚠ ONE MECHANISM PRODUCES BOTH THE TRAVEL AND THE RESTING LIT STATE. The
 * filament design reference is explicit that these are not two steps: *"The rim
 * behind the head stays warm rather than snapping back to grey... By the end of
 * the circuit the whole rim is hot... SO THE CARD ENDS IN THE RESTING SELECTED
 * STATE WITHOUT A SEPARATE STEP."*
 *
 * The tail does that on its own. As the head approaches `t = 1` its trailing
 * warmth has wrapped the entire perimeter, so holding the head at the origin
 * once the circuit completes leaves the whole rim lit.
 *
 * ⚠ AND THE HEAD RUNS ONCE, NOT ON A LOOP. A filament that kept circling would
 * be an animation playing; this is a state being reached.
 */
function useFilament(lit: boolean, intensityTarget: number): FilamentState {
  const intensity = useRef(0);
  /** Position on the black-body ramp, 0 = first red glow, 1 = settled. */
  const temperature = useRef(0);
  const invalidate = useThree((s) => s.invalidate);

  /**
   * ⚠ THE FIRST RUN IS SKIPPED SO AN UNFIRED CARD DOES NOT PLAY A COOL-DOWN.
   * `lit` starts false, and without this the mount would run the fade-out branch
   * on every card — harmless to look at, but it would light the whole scene's
   * worth of rAF loops for nothing on first paint.
   */
  const hasFired = useRef(false);

  useEffect(() => {
    if (!lit) {
      if (!hasFired.current) {
        intensity.current = 0;
        invalidate();
        return;
      }

      /**
       * ⚠ THE COOL-DOWN IS UNIFORM, NOT A SECOND CIRCUIT — and that is physics
       * rather than a shortcut.
       *
       * Carl, 4 August: *"pressing inside the card should have all the filament
       * fading out."* **All of it**, which is what actually happens: current
       * stops everywhere at once, so the whole element cools together. A
       * travelling un-lighting would imply the power is being withdrawn from one
       * end, which is not a thing.
       *
       * ⚠ AND THE HEAD IS LEFT WHERE IT IS. Resetting it to zero would slide the
       * hot spot back to the origin as it dimmed — a visible movement during
       * what should be a still fade.
       */
      let raf = 0;
      const start = performance.now();
      const from = intensity.current;
      const fromTemp = temperature.current;
      const tick = () => {
        const t = Math.min(1, (performance.now() - start) / FILAMENT_COOL_MS);
        // Metal cools fast at first and lingers dull — the inverse of the ramp
        // in, and the reason a linear fade reads as a dimmer being turned down.
        intensity.current = from * (1 - t) * (1 - t);
        // ⚠ THE COLOUR COOLS TOO, back down the black-body ramp. A filament
        // losing power passes white → orange → red on the way out, exactly as it
        // climbed on the way in. Holding the colour while only the brightness
        // fell would read as a dimmer switch rather than as metal cooling.
        temperature.current = fromTemp * (1 - t);
        invalidate();
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(raf);
    }

    hasFired.current = true;

    let raf = 0;
    const start = performance.now();
    const tick = () => {
      const t = Math.min(1, (performance.now() - start) / FILAMENT_HEAT_MS);

      /**
       * ⚠ THE WHOLE FILAMENT HEATS AT ONCE. THERE IS NO TRAVELLING HEAD.
       *
       * Carl, 4 August, reframing the chunk after the circuit was working:
       *
       * > *"the filament must become active to show that a choice has been
       * > selected. does it have to move? become animated? No. it could fade in,
       * > like a real light bulb filament. How does light/heat work? Start of
       * > red, orange, white. blue"*
       *
       * ⚠ HE IS DESCRIBING THE BLACK-BODY CURVE, AND IT IS LITERAL PHYSICS.
       * Incandescence follows temperature: dull red ~800K, orange ~1300K,
       * yellow-white ~2000K, white ~2800K — which is where a working tungsten
       * bulb actually sits. The colour sequence is not a stylisation; it is what
       * the metal does on its way up, compressed.
       *
       * ⚠ AND IT DELETES FOUR DEFECTS RATHER THAN FIXING THEM. The phantom
       * second head, the hard origin edge, the constant-anchored back-bleed and
       * the 15px bevel lag all existed BECAUSE something moved along a path.
       * With no path, none of them can occur — and the unsolved head-versus-trail
       * contrast stops being a question at all.
       *
       * `head` is kept at 1 so every point on the rim reads as "reached": the
       * shader's circuit position still works, it simply applies everywhere.
       */

      // ⚠ EASED, NOT LINEAR. A filament does not heat at a constant rate — it
      // rushes toward temperature and settles. Linear would read as a dimmer.
      intensity.current = intensityTarget * (1 - Math.pow(1 - t, 3));

      // The colour's own journey up the black-body curve, 0 = first red glow,
      // 1 = the settled warm white. Consumed by the shader.
      temperature.current = t;


      // ⚠ WITHOUT THIS THE HEAT-UP RUNS AND NOTHING IS DRAWN. The canvas is
      // `frameloop="demand"`, so `useFrame` — which copies these refs into the
      // shader uniforms — only fires on frames something else has scheduled.
      invalidate();

      if (t < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [lit, intensityTarget, invalidate]);

  return { intensity, temperature };
}

/**
 * One card, on its own rung of the ladder.
 *
 * ⚠ A COMPONENT PER CARD, BECAUSE THE ENTRANCE IS A HOOK. `useCardEntrance` holds
 * one group ref and one rAF loop, so five cards need five instances of it —
 * calling it in a loop inside `CardScene` would be a conditional hook call.
 */
function AnswerCard({
  slot,
  delayMs,
  active,
  reducedMotion,
  tuning,
  glassTuning,
  envMap,
  lit,
  hovered,
  clay,
  label,
}: {
  slot: { x: number; y: number };
  delayMs: number;
  /** The answer text, drawn into this card's face. See `AnswerCardMesh`. */
  label?: string;
  /** Whether the pointer is over THIS card. Turns its label teal. */
  hovered: boolean;
  active: boolean;
  reducedMotion: boolean;
  tuning: AnswerCardTuning;
  glassTuning: GlassTuning;
  // Null until the env map's build is released by the warm gate — the materials
  // simply render without an environment until then. See `useLocalEnvMap`.
  envMap: THREE.Texture | null;
  /** Whether this card's filament has been fired. */
  lit: boolean;
  /** `?clay=1` — render the FORM in opaque matte greys instead of glass. */
  clay: boolean;
}) {
  /**
   * ⚠ THE CARD FADES BY LIGHT, NOT BY ALPHA — and this is the route the ethos
   * file points at rather than a workaround for a rendering limit.
   *
   * Carl, 4 August: *"the card has to fade in. no sudden appearance. Look at the
   * other elements on the site. Its the essence of the c2b ethos file."*
   *
   * `c2b-ethos-and-vision.md` §14a: **"Nothing should feel like a sudden UI
   * toggle unless there is a deliberate reason. Elements should complete their
   * phrase before the next phrase begins."** And the rule that decides the
   * MECHANISM: **"Effects should feel caused by the world, not layered on top of
   * it."**
   *
   * ⚠⚠ THE "EMERGE FROM DARKNESS" READING OF THAT RULE WAS REVERSED BY CARL ON
   * 7 AUGUST 2026, AND THE PARAGRAPHS BELOW RECORD WHY — they are kept because
   * the argument they make is coherent, was acted on for four days, and was
   * still WRONG. Deleting them would invite the same reasoning back.
   *
   * > *"The light is already there and static. The card has a slight rise
   * > coupled with an opacity fade will enhance the 3d features... The card will
   * > catch more of the light as it fades in and rises."*
   * > *"The cards end state should be its beginning state too."*
   *
   * ⚠ THE CARD DOES NOT GET LIT UP; IT RISES INTO LIGHT THAT WAS ALREADY ON.
   * The material never changes. What the ramp below used to call "the world
   * doing it" was in fact a brightness dial — the exact thing the handoff warns
   * about: *"Global lighting renders a shape. A placed light renders geometry."*
   *
   * ⚠ AND THE RAMP'S PREMISE EXPIRED WITHOUT ANYONE NOTICING. It multiplied
   * `color` and `envMapIntensity` toward BLACK, justified as *"an unlit surface
   * in a dark scene IS the page behind it."* That held while the lockup sat
   * behind the cards at fade 0. **The lockup was removed on 5 August and the
   * ground plane at `GROUND_COLOR` #101010 — luminance 16 — took its place**, so
   * an unlit card became DARKER than its background and read as a hole punched
   * in the ground. Carl: *"on appearance, the cards are showing a black
   * rectangle. That should not happen."* Measured at −11.45 luminance in one
   * step by `verify/entrance-now.mjs`.
   *
   * ⚠ THE GEOMETRY REBUILD IS WHY IT BECAME UNMISSABLE. The ramp was tuned when
   * the card was a rim, a bevel stub and a face floating 5.00 units behind it
   * with nothing modelled across the gap — *"parts dont exist and its difficult
   * to tell whether something exists in total darkness."* A dark card and a card
   * with a void in it look identical. Now the form is continuous, so the whole
   * 40-unit span goes black together.
   *
   * ⚠ THE APPROVED FIGURES WERE IN `globals.css` THE WHOLE TIME.
   * `@keyframes enquiry-card-rise` — `opacity: 0 -> 1` with `translateY(6px)` —
   * is the CSS card's approved entrance. The WebGL card departed from it to
   * dodge the transmission constraint below; that departure is what produced the
   * defect.
   *
   * ── the constraint, which is real and is now SCOPED rather than avoided ──
   *
   * `transparent = true` routes a material out of `opaqueObjects`
   * (`three.module.js:8237`), and `renderTransmissionPass` renders ONLY
   * `opaqueObjects` into the target the glass samples (`:18039`). So a card
   * mid-fade is absent from what its neighbours refract.
   *
   * ⚠ THE OLD NOTE CALLED THIS FATAL BECAUSE *"something is always fading"*. That
   * is true of the LADDER, not of any one card: `transparent` is now held only
   * while `alpha < 1` and dropped the instant a card lands, so each card rejoins
   * the refraction after its own 2000ms rather than after the whole sequence.
   * **Whether that residual cost is visible is a question for the eye, and it is
   * measured — not assumed — by `verify/entrance-drop.mjs` and its clay control.**
   */
  /**
   * The filament's circuit.
   *
   * ⚠ IT RUNS ON THE SAME 2400ms AS THE REGION SHIFT, which is what makes the
   * two one event rather than two that happen to match. Carl: *"The blue pixels
   * will turn teal in the same time frame as the filament takes to do a
   * circuit."*
   *
   * ⚠ AND THE INTENSITY IS A FADER STARTING LOW, not a fixed value — Carl:
   * *"it should be dialed down, so only some 'juice' is flowing through it...
   * Rather than pick arbitrary figures. We bring the numbers up."*
   */
  const filament = useFilament(lit, glassTuning.filamentIntensity);

  const litRef = useRef<number>(0);
  const groupRef = useCardEntrance(active, reducedMotion, delayMs, (p) => {
    litRef.current = p;
  });

  return (
    <group position={[slot.x, slot.y, 0]}>
      <CardLighting progress={litRef} reducedMotion={reducedMotion}>
        {/*
          ⚠ `?clay=1` RENDERS THE FORM, NOT THE MATERIAL. Opaque matte greys, no
          transmission, no env map — so a surface that EXISTS can be told from
          one that does not. See `DIAG_FACE_COLOR` for why this came back.
        */}
        <AnswerCardMesh
          tuning={tuning}
          groupRef={groupRef}
          glass={!clay}
          glassTuning={glassTuning}
          envMap={envMap}
          lightLevel={glassTuning.lightLevel}
          filament={filament}
          // ⚠ THE LABEL IS PART OF THE FACE NOW, not a DOM element over it.
          // Undefined on the clay study, which exists to show the FORM and
          // would be answering a different question with text on it.
          label={clay ? undefined : label}
          hovered={hovered}
        />
      </CardLighting>

      {/*
        ⚠ THE TRAVELLING HEAD, AS A REAL LIGHT IN THE SHARED SCENE — and this is
        the whole reason the filament could not be painted.

        Carl, 4 August, walking the circuit: *"As it travels downwards it should
        have some effect on the left of card 2... as its rounding curve 2 there
        would be some effect on card 4 and not just to the left of the vertical
        line, it would bleed a little to the right on the top of card 4."*

        ⚠ THE SPILL CROSSES ONTO A DIFFERENT MESH. Nothing written into card 1's
        own material can light card 2 — only a light can. And it works only
        because all five cards share ONE scene, which is the same constraint that
        forced the two canvases to merge on 3 August: light reaches what shares
        its scene, and nothing else.

        ⚠ AND THE BLEED ACROSS A CORNER IS WHY IT IS A POINT LIGHT RATHER THAN
        ANYTHING TIGHTER. A source with real falloff illuminates an ARC as it
        rounds the curve, which is exactly Carl's *"not just to the left of the
        vertical line"*. A spotlight aimed along the path would track a line and
        miss the effect he asked for.
      */}
      <FilamentLight filament={filament} glassTuning={glassTuning} />
    </group>
  );
}

/**
 * The head's own light, moved along the circuit each frame.
 *
 * ⚠ ONE LIGHT PER CARD, AND THAT IS A REAL COST TO WATCH. Five point lights in
 * a scene with transmissive materials is not free; if it shows up as a frame-rate
 * problem the honest fix is fewer lights (one shared light driven by whichever
 * card is active), NOT a painted fake — the spill onto neighbours is the design.
 */
function FilamentLight({
  filament,
  glassTuning,
}: {
  filament: FilamentState;
  glassTuning: GlassTuning;
}) {
  const ref = useRef<THREE.PointLight | null>(null);
  const invalidate = useThree((s) => s.invalidate);

  useFrame(() => {
    const light = ref.current;
    if (!light) return;
    const intensity = filament.intensity.current;
    // Dark means genuinely off — a point light at zero intensity still costs a
    // shader branch per fragment, but leaving it in the scene keeps the material
    // variants stable and avoids a recompile when it lights.
    // ⚠ NOT MULTIPLIED BY `lightLevel`, AND THAT IS DELIBERATE. The scene fader
    // is the AMBIENT level — how brightly the room lights the metal. The
    // filament is its own source and does not dim because the room does; a
    // heating element in a dark room is brighter, not dimmer.
    //
    // ⚠ AND `decay: 2` MEANS INTENSITY IS IN INVERSE-SQUARE UNITS AT THIS SCALE.
    // One world unit is one CSS pixel, so a light 40px from what it lights needs
    // an intensity in the hundreds, not the tens — the same units trap that made
    // the contact field's orbiting rig need 64000.
    light.intensity = intensity * glassTuning.filamentPower;
    // ⚠ SET PER FRAME, NOT AS A JSX PROP. The rig mutates `filamentDistance`
    // live and a static prop would only apply on remount — which for a light is
    // exactly what must never happen (see the cache-key note below). Assigning
    // it here keeps the node identity stable while the value moves.
    light.distance = glassTuning.filamentDistance;
    // ⚠ HEIGHT IS THE DIAL FOR NEIGHBOUR SPILL, NOT POWER. Every card surface is
    // specular-only (rim metalness:1 → zero diffuse; face transmission 0.97), and
    // specular needs N·L. All five cards share one plane, so at z=6 a neighbour
    // sees the light almost edge-on. See `FILAMENT_LIGHT_HEIGHT`.
    light.position.z = glassTuning.filamentHeight;
    if (intensity > 0) invalidate();
  });

  return (
    <pointLight
      ref={ref}
      // ⚠ STATIC AT THE CARD'S CENTRE — IT NO LONGER TRACKS A HEAD.
      //
      // While the filament travelled, this light moved with it and its position
      // was the whole point: the spill onto card 2 and card 4 came from the head
      // being NEAR them at the right moment.
      //
      // ⚠ THE FILAMENT NOW HEATS ALL AT ONCE, so the whole rim is the source and
      // there is nowhere for the light to be but the middle of it. The spill
      // onto neighbours survives — it comes from the rim being lit at all, not
      // from where along it the brightest point sits.
      //
      // ⚠ SLIGHTLY PROUD OF THE CARD (z=6) so the light is not buried inside its
      // own geometry, where it would light the rim's inner face and nothing else.
      position={[0, 0, 6]}
      color={HEAT_WHITE}
      // Initial values only — both are driven per frame from `glassTuning`
      // above so the rig can move them without remounting the light.
      distance={FILAMENT_LIGHT_DISTANCE}
      decay={2}
      intensity={0}
    />
  );
}

/**
 * Drives a card's materials from unlit to lit as its entrance runs.
 *
 * ⚠ IT WALKS THE SUBTREE EACH FRAME RATHER THAN HOLDING MATERIAL REFS. The mesh
 * builds its own materials declaratively and rebuilds them whenever tuning
 * changes, so a held reference would go stale the moment `?cardrig=1` moved a
 * value — silently, with the card stuck dark.
 *
 * ⚠ AND IT MUTATES MATERIALS, WHICH THE BACKDROP FILE GOES OUT OF ITS WAY TO
 * AVOID. Same justification as `useBackdropRedraw` there: the immutability rule
 * is right for ALLOCATION and cannot express ANIMATION. These materials are
 * created by `AnswerCardMesh`; this only moves numbers on them per frame.
 */
function CardLighting({
  progress,
  reducedMotion,
  children,
}: {
  progress: React.RefObject<number>;
  reducedMotion: boolean;
  children: React.ReactNode;
}) {
  const groupRef = useRef<THREE.Group | null>(null);
  const invalidate = useThree((s) => s.invalidate);

  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;

    // Sampled once from the materials the mesh built, so tuning changes are
    // picked up and nothing is hard-coded here.
    const originals = new Map<THREE.Material, { color?: THREE.Color; env?: number }>();

    let raf = 0;
    let last = -1;
    const apply = () => {
      const p = reducedMotion ? 1 : progress.current;
      if (p !== last) {
        last = p;
        // Ease so the alpha arrives the way the CSS card's does — the shape is
        // the same smoothstep the material ramp used, applied to opacity now
        // rather than to colour.
        const a = p * p * (3 - 2 * p);

        group.traverse((o) => {
          const mesh = o as THREE.Mesh;
          const mat = mesh.material as THREE.MeshStandardMaterial | undefined;
          if (!mat || Array.isArray(mat)) return;

          if (!originals.has(mat)) {
            originals.set(mat, {
              color: mat.color?.clone(),
              env: mat.envMapIntensity,
            });
          }
          const base = originals.get(mat);
          if (!base) return;

          // ⚠ THE MATERIAL IS RESTORED, NOT RAMPED. Carl, 7 August 2026: *"The
          // cards end state should be its beginning state too."* The card is
          // finished glass from its first visible frame; only its ALPHA and its
          // POSITION change. Writing the originals back on every frame keeps
          // that true even if a previous build left a scaled value behind.
          if (base.color) mat.color.copy(base.color);
          if (base.env !== undefined) mat.envMapIntensity = base.env;

          // ⚠⚠ `transparent` IS NEVER TOGGLED HERE, AND THE REASON COST A
          // MEASURED 1250ms. It is set ONCE at material construction (see
          // `ENTRANCE_NEEDS_ALPHA` in `answer-card-mesh.tsx`); only `opacity`
          // moves on this path.
          //
          // The first version of this fade flipped `transparent` false -> true
          // -> false around the rise, reasoning that it would confine the
          // transmission-target cost to the fade. **`transparent` IS IN THE
          // PROGRAM CACHE KEY.** Flipping it makes three link a NEW shader
          // variant on the card's first fading frame — and `useScenePrecompile`
          // cannot have warmed it, because it compiles the materials as they
          // exist at compile time.
          //
          // ⚠ MEASURED, WITH A CONTROL. `verify/stall-profile.mjs`, self-time in
          // `getProgramParameter` (the driver blocking on shader link):
          //
          //     without the toggle   725ms   (417 + 308)
          //     with the toggle     1977ms   (1208 + 480 + 289)
          //
          // The difference landed as a single ~1490ms freeze ~330ms after card
          // 4's rung, which is exactly what Carl reported: *"3 happens, then a
          // pause, 3 flashes and 4+5 come on."*
          //
          // ⚠ AND IT LOOKED LIKE THE CONTACT FIELD'S WARM-UP, WHICH IT WAS NOT.
          // `verify/warm-guard.mjs` shows that guard holding correctly to
          // +14945ms — exactly `ENTRANCE_END_MS` after the entrance start. Two
          // instruments were pointed at the wrong component before the profiler
          // named the function. **The stall was self-inflicted by this hook.**
          mat.opacity = a;
        });
        invalidate();
      }
      raf = requestAnimationFrame(apply);
    };

    raf = requestAnimationFrame(apply);
    return () => cancelAnimationFrame(raf);
  }, [progress, reducedMotion, invalidate]);

  return <group ref={groupRef}>{children}</group>;
}

// ── Scene ────────────────────────────────────────────────────────────────────

/**
 * The environment map, generated entirely locally.
 *
 * ⚠ NO HDRI, NO CDN, NO NETWORK REQUEST. A small scene of `MeshBasicMaterial`
 * reflection panels is converted to a prefiltered radiance map by
 * `PMREMGenerator.fromScene()` on the GPU.
 *
 * ⚠ THE PATTERN IS COPIED FROM `useStudioEnvMap` IN `contact-field-canvas.tsx`;
 * THE VALUES ARE NOT. That rig's key is warm gold at intensity 7.0, tuned for a
 * gold bevel — wrong for blue glass, and its constants are `protected` because
 * tuning this card must not move an approved object.
 *
 * ⚠ THE MAP IS BUILT IN `useMemo` AND HANDED TO THE MATERIAL BY A CALLBACK REF,
 * which is a DEPARTURE from `useStudioEnvMap`'s effect-based lifecycle. The
 * reason is the lint rules, and it is worth recording because the contact
 * field's shape looks like the obvious precedent to copy:
 *
 *   - Holding the material in a container and assigning `envMap` inside an
 *     effect trips `react-hooks/immutability` in EVERY form tried —
 *     `useState<RefObject>`, a one-element `useState` array (exactly
 *     `useStudioEnvMap`'s shape), `useMemo`, and a forwarded ref. The rule
 *     traces provenance through wrapper objects, array elements and hook
 *     arguments alike.
 *   - Publishing the texture with `setEnvMap` inside the effect then trips
 *     `react-hooks/set-state-in-effect` — the SAME rule as the project's one
 *     accepted pre-existing error. Trading one rule for another is not a fix.
 *
 * ⚠ SO THE ALLOCATION MOVES OUT OF THE EFFECT, and the Strict Mode concern that
 * motivated `useStudioEnvMap`'s choice is handled instead by disposing the
 * PREVIOUS target whenever a new one is built, plus on unmount. A stranded
 * double-invoke allocation is released by the next run rather than leaking.
 *
 * The rest of the discipline is unchanged and still earns its place: DETACH
 * FROM THE MATERIAL BEFORE DISPOSING (so a disposed texture can never be
 * sampled), and `invalidate()` because the canvas runs `frameloop="demand"`.
 */
/**
 * ⚠ THIS RUNS OUTSIDE THE WARM GATE, AND THAT IS AN OPEN DEFECT.
 *
 * The `useMemo` below executes during `CardScene`'s first React render.
 * `mayCompile` / `warm` gate `useScenePrecompile` ONLY — so in the Q5 canvas this
 * ~572ms of PMREM work is not deferred by anything, and in the warm-up canvas it
 * runs a second time in its own GL context.
 *
 * Caught by the Architect, 4 August, after the Builder had gated the wrong
 * thing: `live-work/architect-answer-opening-stutter.md`.
 *
 * ⚠ IT IS NOW THE LARGEST REMAINING COST IN THE OPENING. Two routes, neither
 * taken yet: move the allocation behind the gate, or pass `{ size: 64 }` to
 * `fromScene` — the second is a VISUAL change and Carl's call.
 */
function useLocalEnvMap(ready: boolean): THREE.Texture | null {
  const gl = useThree((state) => state.gl);
  const invalidate = useThree((state) => state.invalidate);

  const target = useMemo(() => {
    /**
     * ⚠ GATED — THIS IS THE FIX FOR THE REMAINING ~572ms OF THE OPENING STUTTER.
     *
     * The memo used to run unconditionally, which meant it executed during
     * `CardScene`'s FIRST RENDER — outside every gate the Builder had added.
     * `mayCompile` / `warm` gate `useScenePrecompile` only, so ~572ms of PMREM
     * work sat on the opening choreography with nothing deferring it. Caught by
     * the Architect: `live-work/architect-answer-opening-stutter.md`.
     *
     * ⚠ RETURNING `null` IS SAFE, AND THAT IS WHY THIS WORKS WITHOUT A REWRITE.
     * `envMap` is a declarative prop; three renders the material with no
     * environment until a texture arrives, then rebuilds it once. The cards are
     * hidden and unlit during the opening anyway, so nothing is visible in the
     * interval.
     *
     * ⚠ AND THE DEFERRAL WAS CHOSEN OVER `{ size: 64 }` DELIBERATELY. Shrinking
     * the map is a real lever (256 → lodMax 8 and a 768x1024 target; 64 → lodMax
     * 6 and 336x256) but it is a VISUAL change and Carl's call — he has not seen
     * 256/128/64 side by side. **Deferral costs nothing to look at.**
     */
    if (!ready) return null;

    const studio = new THREE.Scene();
    const disposables: Array<THREE.BufferGeometry | THREE.Material> = [];

    // Panels are things to be SEEN IN a reflection, not lights: colour
    // pre-multiplied by intensity, `toneMapped: false`. Large rather than
    // fierce — a curved face reflects a wide arc, so a big soft source reads as
    // a satin sweep rather than a hot pinpoint.
    const panel = (
      color: string,
      intensity: number,
      position: [number, number, number],
      size: [number, number],
    ) => {
      const geometry = new THREE.PlaneGeometry(size[0], size[1]);
      const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color(color).multiplyScalar(intensity),
        side: THREE.DoubleSide,
        toneMapped: false,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(position[0], position[1], position[2]);
      mesh.lookAt(0, 0, 0);
      studio.add(mesh);
      disposables.push(geometry, material);
    };

    const shellGeometry = new THREE.SphereGeometry(ENV_SHELL_RADIUS, 16, 16);
    const shellMaterial = new THREE.MeshBasicMaterial({
      color: 0x000000,
      side: THREE.BackSide,
      toneMapped: false,
    });
    studio.add(new THREE.Mesh(shellGeometry, shellMaterial));
    disposables.push(shellGeometry, shellMaterial);

    panel(ENV_KEY_COLOR, ENV_KEY_INTENSITY, [-16, 22, 18], [70, 38]);
    panel(ENV_FILL_COLOR, ENV_FILL_INTENSITY, [18, -16, 14], [48, 26]);

    /**
     * ⚠ THE FOURTH ARGUMENT IS `far`, NOT THE RESOLUTION — and a comment here
     * previously claimed the opposite and forbade the real fix.
     *
     * `fromScene( scene, sigma = 0, near = 0.1, far = 100, options = {} )`
     * (`three.module.js:2706`), with `size = 256` living in `options`
     * (`:2709`). So `200` is a clip plane, and the env map has been at the
     * DEFAULT 256 throughout.
     *
     * ⚠ "DROPPING IT 200 -> 64 MOVED `fromScene` BY 5ms" WAS TRUE AND MEANT
     * NOTHING. `ENV_SHELL_RADIUS` is 60, so the studio sits inside the frustum
     * at either value — nothing could have changed. **A 5ms delta is what "I
     * changed nothing" looks like**, and it was recorded as a finding that ruled
     * the lever out. Caught by the Architect, 4 August; see
     * `live-work/architect-answer-opening-stutter.md`.
     *
     * ⚠ SIZE IS GENUINELY LOAD-BEARING: 256 gives lodMax 8 and a 768x1024 cubeUV
     * target; 64 gives lodMax 6 and 336x256 — ~9x fewer pixels and two fewer LOD
     * passes. And `_applyPMREM` is not a blur chain in 0.185, it is GGX VNDF
     * importance sampling at `GGX_SAMPLES = 256` (`:2636`) — a 256-tap loop per
     * fragment per LOD.
     *
     * ⚠ REDUCING IT IS A VISUAL CHANGE AND CARL'S CALL, not a free optimisation.
     * Left at the default until he has seen 256/128/64 side by side at the
     * approved roughness.
     */
    const pmrem = new THREE.PMREMGenerator(gl);
    const built = pmrem.fromScene(studio, 0, 0.1, 200);
    pmrem.dispose();
    disposables.forEach((d) => d.dispose());
    studio.clear();

    return built;
  }, [gl, ready]);

  // Dispose the previous target when a new one is built, and on unmount. This
  // is what replaces the effect-based allocation: a Strict Mode double-invoke
  // leaves its first target to be released here rather than stranded.
  useEffect(() => {
    invalidate();
    return () => {
      target?.dispose();
      invalidate();
    };
  }, [target, invalidate]);

  // ⚠ THE TEXTURE IS RETURNED FOR A DECLARATIVE `envMap` PROP, NOT ASSIGNED
  // THROUGH A CALLBACK REF.
  //
  // The callback-ref version attached the map correctly, but only AFTER the
  // material had been created — so the first render drew the card with no
  // environment, and `needsUpdate = true` then forced a shader recompile.
  // Carl saw the result: *"Card appears in a grey state then gets brighter."*
  // Measured 3 August — draws 1-4 at +236ms after mount, then the corrected
  // draws at +264ms.
  //
  // Passing the texture as a prop means it is part of the material's FIRST
  // construction: there is no unlit frame and no recompile, because there is
  // no "before" state to correct.
  //
  // ⚠ THAT ARGUMENT NOW HAS ONE EXCEPTION, AND IT IS DELIBERATE. While `ready`
  // is false this returns null, so the materials ARE built without an
  // environment and rebuilt once it arrives — the "grey then brighter" recompile
  // the note above exists to prevent.
  //
  // ⚠ IT IS INVISIBLE HERE BECAUSE OF WHEN IT HAPPENS: the gate opens during the
  // opening, long before the cards are drawn, and they are hidden AND unlit
  // (`CardLighting` holds every material at zero) until their own rung of the
  // ladder. The recompile lands in dead time rather than on screen. **If the
  // gate ever moves later than the cards' entrance, this comment stops being
  // true and the flash returns.**
  return target ? target.texture : null;
}

/**
 * ⚠ `StandIn` IS DELETED, AND ITS DELETION IS THE POINT OF THIS STEP.
 *
 * It was a throwaway calibration plane — a smooth blue→teal ramp, optionally
 * with 2/4/6/8px strokes — sized to the card's own face and sitting 10 units
 * behind it. Carl always described it as disposable: *"the stand-in is
 * throwaway, this is so we can judge the frosted glass and legibility."*
 *
 * ⚠ AND IT IS WHY THE CARD KEPT READING AS FROSTED NO MATTER WHAT THE ROUGHNESS
 * WAS. A smooth gradient has no detail for frost to destroy, so clear glass and
 * frosted glass look IDENTICAL over it. Roughness was measured to be applying
 * correctly (edge energy 4.50 at 0.08 against 1.06 at 0.45) while the card
 * looked unchanged — a control working perfectly on a subject that could not
 * show it.
 *
 * ⚠ THE REAL LOCKUP REPLACES IT, and that is the whole reason the card moves
 * into the grid: **a WebGL canvas can only refract objects in its own scene.**
 */

/**
 * Pre-compile the scene's shaders before anything is choreographed.
 *
 * ⚠ THE PARAGRAPH BELOW IS PARTLY SUPERSEDED — READ THIS FIRST. It says the
 * stall is "shader compilation at first draw", which is true of the CARD-LADDER
 * stall it was written for and NOT of the opening stutter. A later profile
 * measured 16 programs linking in 0ms: **compilation itself never blocks.**
 * What blocks is the synchronous read of a program's uniforms in the same frame
 * it is linked — see the two-state compile above, and
 * `live-work/architect-answer-opening-stutter.md`.
 *
 * Kept because the card-count evidence in it is still sound and still the reason
 * this warm-up exists.
 *
 * ⚠ THE STALL IS SHADER COMPILATION AT FIRST DRAW, AND THAT WAS MEASURED RATHER
 * THAN GUESSED — after one wrong hypothesis had already been acted on.
 *
 * The first diagnosis was "five transmissive cards are five times the work", and
 * it was wrong. Varying the card count via `?cards=N` settled it:
 *
 *     cards=1   blocking task at first draw   2846ms
 *     cards=3   blocking task at first draw   2986ms
 *     cards=5   blocking task at first draw   2949ms
 *
 * ⚠ **FLAT.** One card costs what five cost, so it is a FIXED price for putting
 * transmissive glass on screen at all — not a per-card cost, and therefore never
 * something cloning caused or that fewer cards would fix.
 *
 * ⚠ AND IT ALSO RULED OUT THE FIX THIS FILE HAD ALREADY PRESCRIBED. Mounting the
 * canvas earlier ("warm it during the opening choreography") was tried in the
 * same pass and made the stall WORSE — 1732ms to 2840ms — because the cost lands
 * at first **draw**, not at mount. Moving the mount moves setup; it does not
 * move compilation.
 *
 * `compileAsync` is three's own answer: it uses `KHR_parallel_shader_compile` and
 * resolves *"when the given scene can be rendered without unnecessary stalling
 * due to shader compilation"* (`three.module.js:17479`). The work still happens —
 * it just happens off the critical path, before any card is due.
 */
function useScenePrecompile(onReady: () => void, mayCompile: boolean) {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);
  const readyRef = useRef(onReady);

  useEffect(() => {
    readyRef.current = onReady;
  }, [onReady]);

  useEffect(() => {
    // ⚠ THE GATE COVERS THE COMPILE ITSELF, NOT JUST THE CHOREOGRAPHY. Gating
    // only the entrance would leave this work running during the phrase wipe —
    // which is precisely the regression that put the Q5 stutter back on the "W"
    // and "h" of "What".
    if (!mayCompile) return;

    let cancelled = false;

    // ⚠ ONE FRAME'S GRACE FIRST. `compileAsync` walks the scene graph as it
    // stands, so it must run after the cards' meshes have been committed —
    // otherwise it compiles an empty scene, resolves instantly, and the real
    // compile still lands on the first card. A silent no-op that looks like a
    // fix is exactly this project's standing trap.
    // ⚠ `renderer.debug.checkShaderErrors = false` WAS TRIED HERE AND CHANGED
    // NOTHING. The theory was sound — `three.module.js:7097` issues blocking
    // `getProgramParameter` queries when it is on, which would defeat
    // `compileAsync` — but measured against the opening it moved the ~900ms task
    // by 0ms. Recorded so it is not retried as a fresh idea, and NOT left in the
    // code, since it silently disables shader error reporting.
    const id = requestAnimationFrame(async () => {
      if (cancelled) return;

      /**
       * ⚠ COMPILED TWICE, IN TWO RENDERER STATES — AND THIS IS THE FIX FOR THE
       * OPENING STUTTER. Diagnosed by the Architect, 4 August; full reasoning in
       * `live-work/architect-answer-opening-stutter.md`.
       *
       * ⚠ EVERY MATERIAL IN THIS SCENE COMPILES TWICE, and nothing here knew it.
       * The program cache key carries `outputColorSpace` — which branches on
       * `currentRenderTarget === null` (`three.module.js:7585`) — and
       * `toneMapping` (`:7857`). @react-three/fiber sets sRGB + ACES filmic on
       * the canvas, while `renderTransmissionPass` renders into a target at
       * linear + `NoToneMapping` (`:18015`, `:18028`).
       *
       * **So there are two variants of every material, and the old single
       * `compileAsync` warmed only the canvas one.** The transmission variants
       * were linked inside `renderTransmissionPass` and had their uniforms read
       * in the SAME synchronous block — no window at all for
       * `KHR_parallel_shader_compile`. That is the 777ms.
       *
       * ⚠ AND IT EXPLAINS THE PROGRAM COUNT THAT WAS MEASURED AND NOT
       * UNDERSTOOD: rim, bevel, face and backdrop are 4 materials, "16 programs"
       * is 8 materials seen twice, plus PMREM's own.
       *
       * ⚠ A 1x1 PROBE TARGET IS ENOUGH. `getParameters` only tests
       * `currentRenderTarget === null`; the target's SIZE is not in the cache
       * key. And `compile()` walks with `scene.traverse` (`:17427`), so the
       * hidden cards are covered without un-hiding them here.
       *
       * ⚠ THE LIGHTS MUST STAY VISIBLE. Lights are gathered with
       * `traverseVisible` (`:17385`), so `numPointLights` — which IS in the
       * cache key — is whatever is visible at compile time. The `FilamentLight`s
       * sit in the always-visible outer group, so this matches today. **Moving a
       * light into a hidden group would make every program compiled here the
       * wrong variant**, silently.
       */
      const probe = new THREE.WebGLRenderTarget(1, 1);
      const prevTone = gl.toneMapping;

      try {
        // Transmission-pass variants: linear output, no tone mapping.
        gl.setRenderTarget(probe);
        gl.toneMapping = THREE.NoToneMapping;
        await gl.compileAsync(scene, camera);

        // Canvas variants: back to the renderer's own state.
        gl.setRenderTarget(null);
        gl.toneMapping = prevTone;
        await gl.compileAsync(scene, camera);
      } finally {
        // ⚠ RESTORED ON THE ERROR PATH TOO. Leaving the renderer pointed at a
        // disposed 1x1 target would break every subsequent frame.
        gl.setRenderTarget(null);
        gl.toneMapping = prevTone;
        probe.dispose();
      }

      await Promise.resolve()
        .then(() => {
          if (cancelled) return;

          /**
           * ⚠ ONE FULL RENDER BEFORE HANDING OVER, AND IT IS NOT REDUNDANT
           * AFTER `compileAsync`.
           *
           * `compileAsync` walks the SCENE GRAPH and compiles the materials it
           * finds. **The transmission pass is not in the scene graph.** The
           * first time a transmissive object is drawn, `renderTransmissionPass`
           * allocates its render target and builds the material variant that
           * samples it (`three.module.js:17967`) — work that no amount of
           * scene-graph precompilation can reach.
           *
           * ⚠ MEASURED, NOT ASSUMED: a 260ms blocking task landed at exactly
           * card 1's first visible frame, and card 2 fired the instant it
           * cleared — gap 1 came in at 263ms against a 560ms target, three runs
           * consistent. Carl saw it independently: *"the stall occurs between
           * cards 1+2."*
           *
           * Rendering the scene once here pays that cost while every card is
           * still hidden, so the first CHOREOGRAPHED frame is the second real
           * render rather than the first.
           *
           * ⚠ THE CARDS MUST BE VISIBLE FOR THIS ONE FRAME, WHICH IS THE WHOLE
           * SUBTLETY. They are hidden until their own rung (`attachGroup` sets
           * `visible = false`), and a renderer skips invisible objects entirely
           * — so a plain `render()` here would draw no transmissive object, the
           * transmission pass would never run, and the warm-up would be a
           * silent no-op that LOOKS like a fix. That is this project's standing
           * trap, and it would have shipped as one.
           *
           * ⚠ AND IT IS INVISIBLE ANYWAY, because the cards are still at scale
           * 0.94 and — crucially — UNLIT: `CardLighting` holds every material's
           * colour and `envMapIntensity` at zero until the entrance runs. So
           * this frame draws black cards on a black ground, over a lockup that
           * is itself at fade 0.
           */
          /**
           * ⚠ REVEALED AND SCALED TO NOTHING, BECAUSE THE "IT IS INVISIBLE
           * ANYWAY" ARGUMENT ABOVE EXPIRED WITH THE LOCKUP.
           *
           * That reasoning held while the lockup sat behind the cards at fade 0
           * and the background really was black. **The lockup was removed on
           * 6 August**, and the ground plane at `GROUND_COLOR` #101010 —
           * luminance 16 — took its place. So "black cards on a black ground"
           * became black cards on a LIGHTER ground, and this frame started
           * showing as a flash: measured at t=254ms by
           * `verify/entrance-step.mjs`, 16.00 -> 4.65 -> 16.00, one frame wide,
           * ~680ms before the entrance begins.
           *
           * ⚠ SCALE, NOT `visible`, FOR EXACTLY THE REASON THE NOTE ABOVE GIVES:
           * `visible = false` makes the renderer skip the object entirely and
           * turns this warm-up back into the silent no-op it was written to
           * avoid. At scale 0 the draw call still happens and the transmission
           * pass still allocates its target, while the silhouette collapses to
           * nothing. The scale is restored immediately, before any frame the
           * user sees, and `useCardEntrance` sets its own scale from `raw` on
           * every tick regardless.
           */
          const revealed: THREE.Object3D[] = [];
          const scales = new Map<THREE.Object3D, THREE.Vector3>();
          scene.traverse((o) => {
            if (o.type === "Group" && o.visible === false) {
              revealed.push(o);
              scales.set(o, o.scale.clone());
              o.visible = true;
              o.scale.set(0, 0, 0);
            }
          });

          gl.render(scene, camera);

          revealed.forEach((o) => {
            o.visible = false;
            const s = scales.get(o);
            if (s) o.scale.copy(s);
          });

          readyRef.current();
        })
        .catch(() => {
          // ⚠ FAIL OPEN, NEVER FAIL CLOSED. If precompilation is unavailable
          // the choreography must still run — a stall is a defect, but a card
          // grid that never appears is a broken page.
          if (!cancelled) readyRef.current();
        });
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(id);
    };
  }, [gl, scene, camera, mayCompile]);
}

function CardScene({
  active,
  reducedMotion,
  tuning,
  glassTuning,
  litCards,
  hovered,
  onWarm,
  mayCompile,
  gridWidth,
}: {
  active: boolean;
  reducedMotion: boolean;
  tuning: AnswerCardTuning;
  glassTuning: GlassTuning;
  litCards: boolean[];
  /** Index of the card under the pointer, or null. Drives the label's teal. */
  hovered: number | null;
  onWarm: () => void;
  mayCompile: boolean;
  /**
   * The grid's measured width in CSS px — one world unit each, under the
   * orthographic camera at `zoom: 1`.
   *
   * ⚠ PASSED IN RATHER THAN MEASURED HERE. The scene renders inside the canvas,
   * which is already sized from this number; measuring again in here would give
   * the canvas's width rather than the grid's and would drift the instant the
   * two differed.
   */
  gridWidth: number;
}) {
  // ⚠ GATED ON THE SAME SIGNAL AS THE SHADER WARM-UP. Its ~572ms of PMREM work
  // previously ran during this component's first render, outside every gate —
  // see `useLocalEnvMap`.
  const envMap = useLocalEnvMap(mayCompile);
  useScenePrecompile(onWarm, mayCompile);

  /**
   * ⚠ `?clay=1` — THE FORM RENDER. Opaque matte greys, real light, no glass.
   *
   * Carl, 5 August 2026: *"i will have no way of knowing if its right if its
   * clear glass. That why you should ramp it up so i can see something more
   * substantial and then shine a light on it so i can zoom in and check."*
   *
   * ⚠ IT EXISTS BECAUSE A DARK TRANSMISSIVE CARD CANNOT ANSWER "IS THE SURFACE
   * THERE". The bevel and face never meet — a 5.00-unit unmodelled step, found
   * by `verify/cross-section.mjs` — and it survived several sessions of lighting
   * work precisely because *"no light can illuminate something that is not
   * there."* The material was hiding the geometry.
   */
  const clay = useMemo(() => {
    if (typeof window === "undefined") return false;
    // ⚠ TOLERANT, NOT `=== "1"`. A pasted URL arrived as `?clay=1.` with a
    // trailing dot, which failed a strict match — so the study rendered five
    // cards under the shipped lighting while LOOKING like it had engaged,
    // because the material path had already switched. A diagnostic flag that
    // half-applies is worse than one that fails loudly.
    const q = new URLSearchParams(window.location.search).get("clay");
    return q !== null && q !== "" && q !== "0" && q !== "false";
  }, []);

  /**
   * ⚠ THE CLAY RENDER IS LIT TO BE READ, NOT TO BE JUDGED AS A MATERIAL.
   *
   * `lightLevel` is 0.35 because that is where the GLASS looks right, and a
   * diagnostic inheriting it would be as dark as the thing it is diagnosing —
   * which is the whole failure this render exists to correct. Clay gets its own
   * level so the slope's shading is legible at a zoom.
   */
  const sceneLight = clay ? 1.6 : glassTuning.lightLevel;

  /**
   * How high the two symmetric scene lights sit, in world units.
   *
   * ⚠ A SWEEPABLE DOOR BECAUSE FOUR HAND-ADJUSTMENTS IN A ROW GOT IT WRONG,
   * 9 August 2026 — the key went from a top-down pool, to a rim-skimming line,
   * to a symmetric pair that still peaked at the very top edge. Each change was
   * reasoned about and each reading was worse than the last, which is what
   * tuning without measuring looks like.
   *
   * ⚠ ELEVATION IS THE VARIABLE BECAUSE THE GEOMETRY SAYS SO. `crownZ` puts a
   * raised cosine on the SHORT axis: the face curves top-to-bottom and is flat
   * left-to-right across `CROWN_PLATEAU_U`. Light arriving with little vertical
   * separation rakes along the FLAT axis and discloses nothing.
   *
   * `verify/key-elevation-sweep.mjs` sweeps this and reports where the peak
   * lands as a percentage of face height — a peak near 50% means the light is
   * on the FACE, near 0% or 100% means it is on an EDGE. **The ratio alone
   * cannot tell those apart**, and a thin bright rim against a black face
   * scores better on ratio than a properly lit card.
   */
  /**
   * The two scene lights, so `?lighthelpers=1` can draw where they point.
   * Null until mount; `LightHelper` waits for them in an effect.
   */
  const keyLeftRef = useRef<THREE.DirectionalLight | null>(null);
  const keyRightRef = useRef<THREE.DirectionalLight | null>(null);

  /**
   * ⚠ `?lighthelpers=1` — DEV ONLY, INERT WITHOUT THE FLAG, and it costs nothing
   * when absent. Carl asked to SEE where the lights are, and the request is well
   * founded: a directional light has no visible body, so its placement has only
   * ever been inferable from the shading it produces. Four position changes were
   * made blind before `verify/key-elevation-sweep.mjs` measured one.
   */
  /**
   * ⚠ THE TRAVELLER'S PATH, ON URL DOORS — so Carl shapes the curve directly.
   *
   * ⚠ THIS RIG HAS BEEN GUESSED AT SIX TIMES AND HIS EYE HAS BEEN RIGHT EVERY
   * TIME. The useful thing is not another derivation; it is putting the shape
   * where he can turn it while watching the helpers.
   *
   *   ?sag=      how far the curve dips BELOW the straight line   (default 150)
   *   ?fwd=      how far it comes FORWARD of the card plane       (default 190)
   *   ?travelms= the visible pass, ms                             (default 11000)
   *   ?returnms= the race round the back, ms                      (default 2200)
   *   ?travint=  the JUDGED brightness at nearest approach        (default 1.6)
   *
   * ⚠ `?travint=` NOW MEANS SOMETHING DIFFERENT, AND THE OLD NUMBERS DO NOT
   * TRANSFER. It was a raw `intensity` on a decay-0 point light, where 0.9 was
   * the whole story; it is now the brightness the spotlight should DELIVER at
   * its closest approach, which the canvas multiplies by the measured distance
   * squared. **A `?travint=6` from an earlier session is now enormous, not
   * 6/0.9 times brighter.**
   */
  const travelDials = useMemo(() => {
    const d = {
      sag: REST_TRAVEL_SAG,
      forward: REST_TRAVEL_FORWARD,
      travelMs: REST_TRAVEL_MS,
      returnMs: REST_RETURN_MS,
      intensity: REST_TRAVEL_JUDGED_INTENSITY,
    };
    if (typeof window === "undefined") return d;
    const q = new URLSearchParams(window.location.search);
    const num = (key: string, fallback: number) => {
      const raw = q.get(key);
      const n = Number(raw);
      return raw !== null && Number.isFinite(n) ? n : fallback;
    };
    return {
      sag: num("sag", d.sag),
      forward: num("fwd", d.forward),
      travelMs: num("travelms", d.travelMs),
      returnMs: num("returnms", d.returnMs),
      intensity: num("travint", d.intensity),
    };
  }, []);

  /**
   * ⚠ `?noglobal=1` — the static rig off, so the traveller is the only light.
   * Also accepts a fraction (`?noglobal=0.3`) for judging it against a dim
   * base rather than none at all.
   */
  const globalScale = useMemo(() => {
    if (typeof window === "undefined") return 1;
    const raw = new URLSearchParams(window.location.search).get("noglobal");
    if (raw === null) return 1;
    if (raw === "1" || raw === "") return 0;
    const n = Number(raw);
    return Number.isFinite(n) ? n : 0;
  }, []);

  const lightHelpers = useMemo(() => {
    if (typeof window === "undefined") return false;
    return new URLSearchParams(window.location.search).get("lighthelpers") === "1";
  }, []);


  // ⚠ THE HOVER-DRIVEN REGION SHIFT IS GONE, and with it the only thing hover
  // had to drive. It inverted the lockup's colour under the hovered card — Carl,
  // 4 August: *"the card that the mouse is in would change from blue to teal and
  // vice versa"* — and the lockup was removed on 5 August.
  //
  // ⚠ THE HOVER PLUMBING ITSELF SURVIVES DELIBERATELY. Carl, on the cut:
  // *"Hover state will still be the mouse entering the box."* The pointer
  // targets and the `hovered` index below are unchanged and still correct; what
  // changes is that the state has no consumer until the card brightening is
  // designed. **That is the next chunk, and it acts on the card's own surface**
  // (`app/globals.css`, `.enquiry-card:hover`) rather than on anything behind it.

  // ⚠ ALL FIVE SLOTS NOW. Derived from `CARD_BOXES` so no card can drift out of
  // the backdrop region positioned against the same box — the sharing rule that
  // `cardSlotPosition` documents, now load-bearing five times over.
  // ⚠ BOXES AND POSITIONS COME FROM THE SAME MEASURED WIDTH. `cardSlotPosition`
  // re-centres against the grid it is given, so a scaled box paired with the
  // default 576 would land plausibly and wrongly. See `cardBoxesAt`.
  const slots = useMemo(
    () => cardBoxesAt(gridWidth).map((b) => cardSlotPosition(b, gridWidth)),
    [gridWidth],
  );

  /**
   * How much smaller the card is than the 576px reference.
   *
   * ⚠ ONE RATIO FOR THE WHOLE CARD, taken from the grid rather than from a card
   * box, so it stays exact even if the box table is ever re-measured. 1 at
   * 576px and above; ~0.59 at a 390px phone grid.
   */
  const cardScale = gridWidth / GRID_WIDTH_PX;

  // ⚠ THE `?cards=N` DIAGNOSTIC IS REMOVED. It existed to separate "does ANY
  // transmissive card cost this" from "do FIVE cost five times", and it answered
  // that — but the answer was taken on a SOFTWARE RASTERISER (headless
  // Playwright has no GPU), where compilation dominates so heavily that mesh
  // count cannot register. On real hardware the whole premise was wrong: the
  // stall was shader compilation and the transmission pass, fixed by
  // `useScenePrecompile` and the opening warm-up.
  //
  // A knob whose finding was invalidated is worse than no knob — the next reader
  // would trust it. The lesson is recorded in `live-work/run-log-clone-and-beats.md`.

  return (
    <>
      {/*
        Static diagnostic lighting. Above and slightly LEFT, which is the
        direction the six CSS inset shadows already imply: top bright, left
        secondary at roughly a third of it, bottom and right as depth shadow
        (`app/globals.css`, the `.enquiry-card` box-shadow stack). Matching that
        direction means the WebGL card is lit the same way as its neighbour, so a
        difference between them is a difference of FORM rather than of lighting.
      */}
      {/*
        ⚠ THE DIRECTIONALS RIDE THE FADER TOO, or *"light level"* would only mean
        *"environment response"* and the two halves of the lighting would drift
        apart as it moves. Carl's pass judges the metal *"against both metal and
        glass"* — one control has to move all of it.
      */}
      {clay ? (
        /*
          ⚠ ONE LIGHT, NO AMBIENT, NO FILL, NO ENVIRONMENT — Carl's instruction,
          5 August 2026: *"Enable shadows and the placement of a light is all
          important. Dont use global illumination, just focus on card 1."*

          ⚠ AMBIENT IS THE ENEMY OF A FORM STUDY. It lifts every surface equally
          regardless of which way it faces, so it fills in exactly the shading
          that tells you a slope is there. The shipped scene runs ambient plus
          two near-head-on directionals — good for judging a material, useless
          for judging a shape, and part of why a missing seam went unseen.

          ⚠ A POINT LIGHT, NOT DIRECTIONAL, BECAUSE FALLOFF IS INFORMATION. A
          directional light is parallel rays from infinity: it cannot make a
          near surface brighter than a far one, so it flattens the very
          depth-cue this render exists to show.
        */
        <>
          {/*
            ⚠ A FLOOR, NOT A FILL. Carl's instruction was *"dont use global
            illumination"* and this does not reinstate it: at 0.10 it lifts the
            unlit side off pure black so a surface facing away is still READABLE
            as a surface, without contributing enough to fill in the shading
            that says which way it faces. The first run had five of eight sample
            angles at effectively zero — a form study cannot report on a card
            nobody can see.
          */}
          <ambientLight intensity={0.10} />
          {/*
            ⚠ ONE LIGHT PER CARD, EACH ORBITING ITS OWN CENTRE. Carl, 6 August
            2026: *"make all 5 cards like card 2. we only have to move the other
            cards lights into position."*

            ⚠ ALL FIVE ARCS ARE IDENTICAL AND VERTICAL TODAY — card 2's case,
            which is the one already proven. Card 2 sits on the grid's centre
            line, so a vertical arc is correct for it and the four others are
            merely not yet tilted. **That is the next chunk**, not an oversight:
            his diagram gives cards 1+3 as a mirror pair and 4+5 as another, each
            arc leaning along its own diagonal toward the nearest corner.

            ⚠ AND PER-CARD LIGHTING IS THE POINT, NOT A COST. It makes each card
            independent of its grid position — the thing the reference sheets do
            and the shared-rig "wall" problem cannot. Five point lights with no
            shadows is affordable; five SHADOW-CASTING lights would not be, which
            is why the study casts from one card at a time.
          */}
          {slots.map((slot, i) => (
            <ClayFormLight key={i} centre={slot} />
          ))}
        </>
      ) : (
        <>
          {/*
            ⚠ TWO SYMMETRIC DIRECTIONAL LIGHTS, STATIC. This is the rig the satin
            was tuned against and the one Carl approved the material under.

            ⚠⚠ A FIVE-POINT-LIGHT RESTING RIG WAS BUILT HERE ON 9 AUGUST 2026 AND
            REMOVED THE SAME DAY, ON CARL'S JUDGEMENT: *"Return it to the way it
            was and i dont think 5 point lights are the solution."* It is worth
            recording why, because the idea was HIS and it was well reasoned —
            one point light per card on a tight ellipse, so proximity would
            narrow and widen the beam and *"the light and shadows on all the
            curves will be highlighted at specific points in time."*

            ⚠ WHAT KILLED IT WAS SCALE, NOT THE CONCEPT. Carl: *"it looks ok
            zoomed in but not at this scale."* The cards are ~104px tall on
            screen. An effect that needs a light to travel across a curve and
            change its spread has to resolve inside that, and it did not — the
            per-card lights either raked a narrow band and left the edges black
            (*"the face is floating on its own"*) or, widened enough to reach the
            corners, stopped varying proximity enough to matter. `arcx` from 26
            to 180 was swept; past ~115 the point light behaves like a distant
            one and the ellipse stops being an ellipse in any useful sense.

            ⚠ THE FINDING WORTH KEEPING: this card's face is too small on screen
            for LIGHT POSITION to be the mechanism that discloses its form. What
            reads at this size is the material's own response — which is why the
            satin's anisotropy and its bloom carry the geometry, and why the
            approved look does not depend on the light moving at all.

            ⚠ THE HELPERS AND THE DIALS ARE KEPT (`?lighthelpers=1`, `?keyy=`).
            They cost nothing when unused and they are how this was diagnosed.
          */}
          {/*
            ⚠ THE STATIC RIG IS THE CONTACT FIELD'S, COPIED — Carl, 9 August
            2026: *"Lets emulate something that works — lighting on the client
            info section."* Key top-left and grazing at 1.6, fill bottom-right at
            0.35, ambient dialled down from the field's 0.22 because the cards
            carry a traveller the field does not.

            ⚠ THE ASYMMETRY IS THE POINT AND IT IS WHAT THE CARDS LACKED. They
            were running two EQUAL directionals at 1.55 — a symmetry this Builder
            introduced and then spent five attempts trying to make move. Two
            equal lights produce two pinned blooms with a dead band between them,
            measured at 21% and 46% with the lower face flat. **One dominant
            direction plus a quiet fill is what makes a shallow crown read**, and
            the field proved that before the cards existed.

            ⚠ `keyElevation` (`?keyy=`) NO LONGER APPLIES to the key's Y — the
            field's position is taken whole rather than half-inherited. The door
            stays for the helpers.
          */}
          {/*
            ⚠ `?noglobal=1` KILLS THE STATIC RIG SO ONLY THE TRAVELLER LIGHTS THE
            CARDS — Carl, 9 August 2026: *"before you try it turn the global
            light off, only then will you see the true effect."*

            ⚠ HE IS RIGHT AND IT IS THE ONLY HONEST TEST OF THIS LIGHT. The key
            runs at 1.6 and the traveller at 0.9, so against a lit card the
            traveller's contribution is a small modulation on top of something
            much brighter — visible in a measurement, hard to judge by eye, and
            impossible to attribute. With the global off, everything on screen is
            the moving light and nothing else.
          */}
          <ambientLight intensity={REST_AMBIENT_INTENSITY * sceneLight * globalScale} />
          <directionalLight
            ref={keyLeftRef}
            position={REST_KEY_POSITION}
            intensity={REST_KEY_INTENSITY * sceneLight * globalScale}
          />
          <directionalLight
            ref={keyRightRef}
            position={REST_FILL_POSITION}
            intensity={REST_FILL_INTENSITY * sceneLight * globalScale}
          />
          {/* ⚠ THE TRAVELLER — top-left to bottom-right, bowing toward the
              viewer between. One light across the whole grid, not one per card. */}
          <TravellingLight
            reducedMotion={reducedMotion}
            level={sceneLight}
            showHelper={lightHelpers}
            sag={travelDials.sag}
            forward={travelDials.forward}
            travelMs={travelDials.travelMs}
            returnMs={travelDials.returnMs}
            intensity={travelDials.intensity}
          />
          {/*
            ⚠ LIGHT HELPERS — `?lighthelpers=1`, DEV ONLY AND INERT WITHOUT IT.
            Carl, 9 August 2026: *"Can you enable the light helpers so i can see
            where they are?"*

            ⚠ THEY EXIST BECAUSE THE LIGHTS' POSITIONS HAVE BEEN ARGUED ABOUT
            FOUR TIMES AND MOVED BLIND EACH TIME. A directional light has no
            visible body, so its direction is only knowable from the shading it
            produces — which is exactly the reasoning-from-symptoms this chunk
            has already paid for. `verify/key-elevation-sweep.mjs` measures where
            the light LANDS; these show where it IS.

            ⚠ A DIRECTIONAL LIGHT'S `position` IS A DIRECTION, NOT A PLACE. Three
            points it at its `target` (the origin by default), so only the
            VECTOR matters — moving it from [-150, 70, 70] to [-15, 7, 7] changes
            nothing at all. The helper draws that vector, which is the single
            most useful thing to see here and the easiest thing to misread from
            numbers alone.
          */}
          {lightHelpers && (
            <>
              {/*
                ⚠ WHITE, BECAUSE THE LIGHTS ARE WHITE AND A MARKER MUST NOT
                IMPLY OTHERWISE. A previous pass drew these cyan and magenta
                purely to tell the two apart, and Carl reasonably read the
                colour as a property of the LIGHT: *"why are the coloured lights
                and not white."* On a card whose entire subject is blue satin
                under white light, a cyan marker is a false statement about the
                rig.

                ⚠ THE TWO ARE TOLD APART BY BEHAVIOUR, NOT BY HUE — one swings
                and one holds still, which is visible without a colour code and
                is the only difference that matters.
              */}
              <LightHelper lightRef={keyLeftRef} color="#ffffff" />
              <LightHelper lightRef={keyRightRef} color="#ffffff" />
            </>
          )}
        </>
      )}

      {/*
        ⚠ THE GROUND, AND IT IS A SIBLING OF THE CARDS RATHER THAN A CHILD OF
        ONE. It spans the whole grid and belongs to all five, so parenting it to
        any single card would drag it through that card's entrance rise.

        ⚠ IT IS STATIC AND ON SCREEN FROM THE FIRST FRAME. It used to carry the
        `c2b DESIGN` lockup, which arrived as a sixth beat after the card ladder;
        **the lockup was removed on 5 August 2026 and beat six went with it** —
        the entrance is five beats again. What is left is an unlit near-black
        plane that exists for the transmission pass, not for the eye, so there is
        nothing for it to animate and no entrance for it to take part in.

        ⚠ AND THE RISK THIS CARRIES IS RECORDED RATHER THAN DISCOVERED LATER.
        The note here used to read that the cards *"read as dark slabs and only
        become glass when the lockup lights behind them."* With a flat ground
        there is nothing distinctive left to refract. **If the cards read flat,
        that is why** — the lever is `GROUND_COLOR`, not the lockup.
      */}
      <AnswerCardBackdrop clay={clay} />

      {/*
        ⚠ ONE SCENE, WHICH IS THE ENTIRE REASON FOR THIS STEP. The transmission
        pass renders the scene's `opaqueObjects` into a target that the glass
        then samples — so the glass can only ever refract what is in ITS OWN
        scene graph. Two canvases meant the card refracted its own stand-in and
        was blind to the logo, however exactly they were overlaid in CSS.
      */}
      {/* ⚠ ALL FIVE CARDS IN CLAY MODE SINCE 6 AUGUST. It rendered card 1 alone
          while the cross-section was in doubt — Carl: *"just focus on card 1"* —
          and that question is now settled. His instruction on closing:
          *"make all 5 cards like card 2. we only have to move the other cards
          lights into position."* Every card currently gets the SAME vertical
          arc; the per-card tilt is the next chunk. */}
      {/*
        ⚠ THE CARDS ARE SCALED, NOT REBUILT, AND THAT IS THE POINT.

        The mesh is generated from `CARD_WIDTH_PX` (186.66) — the rim's half-tube,
        the crown's rise, the corner radius and the face's tilt are all derived
        from that width through `cardBudget`. Rebuilding the geometry at a
        narrower width would change the CROSS-SECTION as well as the size: the
        rim would stay 2 units on a shorter span, the face would grow
        proportionally wider, and the tilt guard (`MIN_FACE_TILT_DEGREES`, 16°)
        could silently fall below its floor. **That is exactly how
        `FACE_PROUD_OF_RIM` at 1.0 produced 13.3° while looking fine** — two safe
        changes interacting.

        Scaling the group instead keeps the approved 5 August cross-section
        EXACTLY as Carl confirmed it, and simply presents it smaller. The card at
        390px is the same object as the card at 1440px.

        ⚠ UNIFORM ON X AND Y, because `.enquiry-card` keeps a fixed 48px height at
        every width (`min-height: 3rem`, measured) while its width scales. A
        non-uniform scale would stretch the rim's circular profile into an
        ellipse and shear the corner radii — the silhouette would stop matching
        the CSS card it is derived from. So the cards get proportionally taller
        relative to their row as the screen narrows; the row's own 48px is what
        the pointer targets use.
      */}
      {slots.map((slot, i) => (
        <group key={i} scale={[cardScale, cardScale, 1]}>
          <AnswerCard
            slot={{ x: slot.x / cardScale, y: slot.y / cardScale }}
            delayMs={CARD_RISE_LADDER_MS[i]}
            active={active}
            reducedMotion={reducedMotion}
            tuning={tuning}
            glassTuning={glassTuning}
            envMap={envMap}
            lit={litCards[i] ?? false}
            hovered={hovered === i}
            clay={clay}
            label={CARD_LABELS[i]}
          />
        </group>
      ))}
    </>
  );
}

/**
 * The answer-card canvas — the card in grid slot 1, over the lockup.
 *
 * ⚠ RENDERS AT EVERY WIDTH SINCE 7 AUGUST 2026. It used to return `null` below
 * 1280px, which meant narrow visitors got NO ANSWER CARDS AT ALL — and since the
 * five CSS cards were removed for chunk 3, there was nothing behind them.
 *
 * ⚠ THE GUARD'S STATED REASON WAS FALSE. It claimed the CSS grid reflows below
 * 1280 so the hard-coded `CARD_BOXES` would land wrong. Measured at eight widths
 * (`verify/grid-by-width.mjs`), `.enquiry-answer-grid` never reflows: it is
 * 576 x 104 down to 640px and scales proportionally below that, holding the 3+2
 * arrangement to 375px without overflowing. **The grid was never the problem.**
 *
 * ⚠ THE REAL PROBLEM WAS AN ABSOLUTE-PIXEL TABLE SHADOWING A FLUID LAYOUT, and
 * that is now fixed at source: the grid is measured with `ResizeObserver`, the
 * boxes come from `cardBoxesAt(width)`, and the card meshes are scaled by the
 * same ratio. See `cardBoxesAt` and `cardScale`.
 *
 * ⚠ `PROTO_MIN_VIEWPORT_PX` IS NO LONGER READ HERE. It is kept in the geometry
 * module because the contact field's warm-up ceiling still cites it as the
 * reason `onEntranceStart` can fail to fire — see `ENTRANCE_ANCHOR_CEILING_MS`.
 * **That citation is now stale too and should be revisited**; it is left alone
 * deliberately rather than changed in passing, because it guards a different
 * component's timing.
 */
export default function AnswerCardCanvas({
  active,
  /**
   * Whether the opening has yielded an idle window for this canvas's setup.
   *
   * ⚠ IT OPENS BEFORE BEGIN, DURING THE OPENING STAGE — see `cardCanvasWarm` in
   * `enquiry-opening.tsx`. The canvas still MOUNTS with the Q5 grid; this gate
   * decides only whether it may render, which is where the cost actually is.
   */
  warm = true,
  /**
   * Fired once, the instant the six-beat entrance actually begins.
   *
   * ⚠ THE ENTRANCE DOES NOT START AT BEGIN, AND THE CODEBASE ASSUMED IT DID.
   * It starts when `active && compiled && warm` first goes true — `compiled` is
   * the async precompile resolving.
   *
   * ⚠⚠ THE FIGURES THAT USED TO SIT HERE — "1944ms after the cards mount", "the
   * six beats run +8857 → +15187 from Begin" — ARE STALE AND WERE CORRECTED ON
   * 9 AUGUST 2026. They described the build before the 7 August entrance fix.
   * Measured on the real GPU, 3 runs, `verify/approved-timings.mjs`:
   *
   *     card 1   +695ms      card 2   +1264ms     card 3   +1831ms
   *     card 4   +2381ms     card 5   +2949ms          (all from Begin)
   *
   * **The whole ladder runs +695 → +2949ms — nearly six seconds earlier than
   * the old comment claimed**, with ~560ms gaps rather than the 220ms rungs
   * quoted elsewhere.
   *
   * ⚠ AND THE STALE FIGURE WAS ACTIVELY DANGEROUS, not merely out of date. On
   * 9 August it nearly caused a ~1944ms hold to be written into the Begin path
   * to "preserve" a compile wait that no longer exists — which would have MOVED
   * the approved entrance in the name of protecting it. Carl's constraint that
   * day was that nothing he had approved may shift.
   *
   * ⚠ SO MEASURE THE LADDER, DO NOT READ IT OFF A COMMENT — including this one.
   * `verify/approved-timings.mjs --compare` diffs against a saved baseline and
   * reports the beats' INTERNAL GAPS separately from their absolute position,
   * because a ladder sliding whole is a different fault from a ladder whose
   * rhythm has been corrupted.
   *
   * ⚠ THAT ONE WRONG ASSUMPTION CAUSED THE LOCKUP'S STUTTER. The contact field's
   * warm-up guard computes `ENTRANCE_END_MS` from Begin, so it released ~2.5s
   * before beat six had even started and mounted a second WebGL context mid-fade.
   * Diagnosed by the Architect: `live-work/architect-answer-lockup-fade.md`.
   *
   * ⚠ SO THE GUARD MUST WAIT FOR A STATE, NOT A DURATION — the third time this
   * file has learned that. `OPENING_WARM_LEAD_MS` records the first two.
   */
  onEntranceStart,
  /**
   * Fired once, when this canvas's shaders and transmission target are ready.
   *
   * ⚠ IT IS WHAT LETS THE OPENING WAIT FOR THE COMPILE INSTEAD OF THE REVERSE —
   * Step 4, `enquiry-opening.tsx`'s `openingArmed`. The warm-up instance uses it
   * to arm the opening choreography; the real Q5 instance has no need of it and
   * passes nothing.
   *
   * ⚠ IT REPORTS THIS CANVAS'S OWN READINESS AND NOTHING MORE. A WebGL context
   * is per-canvas, so this firing does NOT mean the Q5 canvas is warm — measured
   * 5 August, the warm-up is in fact a 329ms net COST to it. What it does mean
   * is that the expensive first-use work has happened somewhere and the main
   * thread is free, which is the only thing the choreography needs to know.
   */
  onCompiled,
}: {
  active: boolean;
  warm?: boolean;
  onEntranceStart?: () => void;
  onCompiled?: () => void;
}) {
  const [reducedMotion] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  /**
   * ⚠ THE CANVAS DEFERS ITS OWN WEBGL SETUP PAST THE Q5 PHRASE WIPE.
   *
   * The stutter Carl reported on the "W" and "h" of "What" was this canvas's
   * Three.js initialisation landing inside the 1300ms reveal — measured at
   * +58-64ms with a 1827-2138ms long task behind it, 3/3 cold runs.
   *
   * ⚠ A FIRST FIX GATED THE MOUNT ON `canvasWarm` IN `enquiry-opening.tsx`. It
   * removed the stutter but was the WRONG INSTRUMENT: that gate is derived from
   * the CONTACT FIELD's warm-up and only clears once an idle opportunity arrives
   * after it, so the proto card arrived at +8270ms — roughly 1330ms AFTER its
   * CSS neighbours, which appear at +6938ms. Carl: *"the card arrives too
   * late."*
   *
   * ⚠ AND THE CORRIDOR'S OWN TIMING IS WHY A BEGIN-RELATIVE GUARD CANNOT WORK.
   * The answer cards do not appear when Begin is pressed; they arrive ~6.9s
   * later, after the opening phrase choreography. The reveal that must be
   * protected is the one that starts WHEN THIS COMPONENT MOUNTS, so the delay
   * has to be measured from here rather than inherited from a gate anchored to
   * Begin.
   *
   * Q5_REVEAL_CLEAR_MS (1300) is read off `.enquiry-q-text-reveal` in
   * `globals.css` — the same declaration `enquiry-opening.tsx` derives its own
   * guard from. Duplicated as a local constant rather than imported because this
   * file must not depend on an approved-foundation module for a value it only
   * needs to wait out.
   *
   * ⚠ REDUCED MOTION SKIPS THE WAIT. `.enquiry-q-text-reveal` has
   * `animation: none` under `prefers-reduced-motion`, so there is no wipe to
   * protect and waiting would delay the card guarding an animation that never
   * runs — the exact failure mode `enquiry-opening.tsx` documents for its own
   * guards.
   *
   * ⚠ THE COST: THE PROTO ARRIVES ~1300ms AFTER THE CSS CARDS, AND THAT IS
   * ACCEPTED. Measured 3 August — the CSS cards and the phrase wipe both start
   * at +6982ms after Begin and the wipe ends at +8282ms, so the two genuinely
   * compete for the same window. The card cannot match card 1's 220ms entrance
   * without putting the stutter back.
   *
   * Carl, 3 August: *"the new card is a test, it's not important it reveals
   * with card 1, only that it's there."* **So the lag is deliberate, not
   * outstanding.**
   *
   * ⚠ IT BECOMES A REAL QUESTION IN CHUNK 5, when the card moves into the grid
   * and must arrive on the approved 700ms/220ms ladder. The fix at that point is
   * to warm the canvas during the opening choreography — mounted hidden, well
   * before the cards, so its setup lands in dead time — NOT to shorten this
   * wait. `enquiry-opening.tsx` records why: a moved symptom is not a fixed one.
   */
  /**
   * ⚠ THE CANVAS NO LONGER WAITS OUT THE WHOLE REVEAL — IT MOUNTS IMMEDIATELY
   * AND THE CARDS THEMSELVES HOLD BACK.
   *
   * Carl, 4 August: *"card 1 can begin its appearance half way through the text
   * reveal."* The old guard deferred the entire canvas until the reveal had
   * FINISHED (1300ms), which makes a 650ms entrance impossible by construction.
   *
   * ⚠ AND THE GUARD'S REAL JOB IS PRESERVED, NOT DROPPED. It exists because
   * Three.js initialisation landing inside the phrase caused the stutter Carl
   * caught on the "Wh" of "What" — measured at +58-64ms with a 1827-2138ms long
   * task behind it. **That work is setup, not drawing.** Mounting early means the
   * setup happens BEFORE the phrase rather than during it, which is the fix this
   * file already prescribed for exactly this moment:
   *
   *   *"The fix at that point is to warm the canvas during the opening
   *   choreography — mounted hidden, well before the cards, so its setup lands
   *   in dead time — NOT to shorten this wait."*
   *
   * ⚠ SO THIS IS THE PRESCRIBED FIX ARRIVING, NOT THE GUARD BEING WEAKENED. The
   * cards are invisible until their own rung (see `attachGroup`), so nothing is
   * drawn early; only the expensive setup moves earlier, into dead time.
   *
   * ⚠ IT ALSO ADDRESSES THE 1732ms STALL that made all five cards land together
   * — same cause, same fix. **Unverified at the time of writing; it must be
   * measured with `?beattrace=1` rather than assumed.**
   */
  const revealCleared = true;

  /**
   * The grid's MEASURED width, and the host element it is measured from.
   *
   * ⚠⚠ THIS REPLACES A `min-width: 1280px` MEDIA QUERY THAT WITHHELD ALL FIVE
   * CARDS FROM EVERY NARROWER VISITOR. `PROTO_MIN_VIEWPORT_PX`'s comment
   * justified it as a correctness guard — *"below it the CSS grid reflows and a
   * card pinned to a hard-coded 186.66 x 48 box at (0,0) would land wrong"* —
   * and **the reflow half of that is false.** Measured at eight widths
   * (`verify/grid-by-width.mjs`), `.enquiry-answer-grid` is 576 x 104 from
   * 1440px all the way down to 640px, and below that it scales proportionally
   * without ever reflowing or overflowing: the 3+2 arrangement survives to
   * 375px.
   *
   * ⚠ THE REAL BUG WAS THE COUPLING, NOT THE LAYOUT. `CARD_BOXES` is an
   * absolute-pixel table shadowing a `repeat(6, 1fr)` CSS grid. It is correct at
   * 576px and wrong at every width below it — at 390px the real cards are 108.8
   * wide, so a hard-coded 186.66 card is ~70% oversized and misplaced. **The
   * guard was hiding a stale table, not protecting a fragile layout.**
   *
   * ⚠ SO THE CARDS NOW TRACK THE CSS. `ResizeObserver` on the grid feeds
   * `cardBoxesAt(width)`, and everything downstream — the canvas box, the world
   * positions, the pointer targets — derives from that one measurement.
   *
   * ⚠ MEASURED, NOT ASSUMED FROM THE VIEWPORT. The grid's width is set by the
   * `max-w-xl` shell and its padding, not by `window.innerWidth`; deriving it
   * from the viewport would reintroduce exactly the kind of duplicated layout
   * knowledge this change removes.
   *
   * ⚠ NULL UNTIL MEASURED, AND NULL MEANS WAIT. Rendering at a guessed width for
   * one frame would place every card wrongly and then correct it — visible as a
   * jump on exactly the entrance this project has spent sessions smoothing.
   */
  const [gridEl, setGridEl] = useState<HTMLDivElement | null>(null);
  const [gridWidth, setGridWidth] = useState<number | null>(null);
  useEffect(() => {
    if (!gridEl) return;
    /**
     * ⚠ THE PARENT IS MEASURED, NOT THIS ELEMENT.
     *
     * The host's own width comes from `box`, which is derived from `gridWidth` —
     * so observing itself would be a feedback loop: measure, resize, measure the
     * resize. The parent is `.enquiry-answer-grid`, whose width is set by the
     * CSS layout and is the thing the cards must actually track.
     */
    const target = gridEl.parentElement;
    if (!target) return;
    const apply = () => {
      const w = target.getBoundingClientRect().width;
      // Ignore a zero width — it means the element is display:none or not yet
      // laid out, and committing it would collapse every card to a point.
      if (w > 0) setGridWidth((prev) => (prev !== null && Math.abs(prev - w) < 0.5 ? prev : w));
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(target);
    return () => ro.disconnect();
  }, [gridEl]);

  const { tuning, glassTuning } = useCardRig();

  // ⚠ THE CANVAS SPANS THE MEASURED GRID, NOT THE 576px REFERENCE. The backdrop
  // plane is sized to the canvas, so a fixed-width canvas over a narrower grid
  // would push the ground plane past the grid's edges — visible as the black
  // rectangle Carl has already rejected once.
  const box = useMemo(() => {
    const b = protoCanvasBox();
    return gridWidth === null ? b : { ...b, width: gridWidth };
  }, [gridWidth]);

  // The pointer targets, on the same measured layout the scene uses.
  const boxes = useMemo(() => cardBoxesAt(gridWidth ?? GRID_WIDTH_PX), [gridWidth]);

  /**
   * Which card the pointer is inside, or null.
   *
   * ⚠ ONE INDEX, NOT FIVE BOOLEANS. A pointer is in exactly one card at a time,
   * and modelling it as five independent flags invites the state where two are
   * true — which `pointerleave`/`pointerenter` ordering makes reachable on a fast
   * diagonal crossing between adjacent cards.
   *
   * ⚠ TRACKED BUT NOT YET CONSUMED, AND THAT IS DELIBERATE RATHER THAN DEAD
   * CODE. Its only reader was the lockup's per-card colour inversion, removed on
   * 5 August 2026 with the lockup itself. Carl kept the mechanism in the same
   * instruction that cut the artwork: *"Hover state will still be the mouse
   * entering the box."*
   *
   * ⚠ THE NEXT CHUNK IS ITS CONSUMER — the card brightening, on the card's own
   * surface, as the CSS version does it at `app/globals.css`
   * (`.enquiry-card:hover` lifts the surface, its top-edge glint and its inner
   * diffusion). Carl: *"In the CSS version the card gets brighter."* Deleting
   * this now would mean rebuilding the pointer plumbing next session to get back
   * to exactly here.
   *
   * ⚠ IT HAS A CONSUMER AGAIN AS OF 10 AUGUST 2026 — the answer text turning
   * teal. The read slot was empty from 5 August, when the lockup's region shift
   * (its only reader) was removed; the note then said the write was the point
   * "for now", and this is the end of that period.
   */
  const [hovered, setHovered] = useState<number | null>(null);

  /**
   * Which cards have had their filament fired.
   *
   * ⚠ MOUSE-DOWN STARTS THE JOURNEY, and it does not wait for the hover
   * transition. Carl, 4 August: *"If when hovering the user presses the mouse
   * button that will start the filaments journey. It may well be a user hovers
   * and before the colour transition has completed, they press the mouse. The
   * same length of timings apply, they just start at different times."*
   *
   * ⚠ THIS IS NOT SELECTION. The corridor still cannot advance past Q5 — no
   * Next step, no Q4. This lights the filament and nothing else, which is what
   * chunk 2 is scoped to.
   */
  const [litCards, setLitCards] = useState<boolean[]>(() =>
    new Array(CARD_BOXES.length).fill(false),
  );


  /**
   * Whether the renderer has finished compiling this scene's shaders.
   *
   * ⚠ THE CHOREOGRAPHY WAITS FOR THIS, AND THAT IS THE WHOLE FIX. The entrance
   * clock must not start while a ~2900ms compile is pending, or every beat after
   * card 1 lands in one lump when it clears — which is exactly what Carl saw:
   * *"on first walking the sequence they all came on at the same time."*
   *
   * ⚠ IT IS NOT A DELAY ADDED TO THE CHOREOGRAPHY. The compile was always
   * happening; it was landing ON the choreography. This moves the sequence to
   * after it rather than making the user wait longer overall.
   */
  const [compiled, setCompiled] = useState(false);
  const markWarm = useCallback(() => {
    // ⚠ DIAGNOSTIC ONLY — `verify/warmup-value.mjs` reads this mark, paired with
    // `card-canvas-created` below. Mount → compiled IS THE NUMBER that decides
    // whether the hidden warm-up canvas buys the real one anything at all
    // (Architect, 5 August, `live-work/architect-answer-begin-stall.md` Step 2).
    // `performance.mark` is a no-op cost and safe to leave; remove it only when
    // the question it answers is closed.
    // ⚠ THE MARK NAMES DISTINGUISH THE TWO CANVASES, and that distinction is
    // load-bearing for `verify/card-1-anchor.mjs`. Since Step 4 the warm-up
    // instance compiles ~6-7s BEFORE Begin, so a shared mark name made the
    // harness read "reveal start" off the wrong canvas and report negative
    // times. `warm && !active` is the warm-up; the real Q5 canvas is the other.
    try { performance.mark(warm && !active ? "warmup-canvas-compiled" : "card-canvas-compiled"); } catch {}
    setCompiled(true);
    onCompiled?.();
  }, [onCompiled, warm, active]);

  /**
   * Announce the entrance's real start, once.
   *
   * ⚠ IN AN EFFECT, NOT AT THE `active` PROP, so it fires after commit — when
   * the beats genuinely begin rather than when React decides they will.
   */
  const entranceAnnounced = useRef(false);
  const entranceRunning = active && compiled && warm;
  useEffect(() => {
    if (!entranceRunning || entranceAnnounced.current) return;
    entranceAnnounced.current = true;
    onEntranceStart?.();
  }, [entranceRunning, onEntranceStart]);

  /**
   * ⚠ THE HOST ALWAYS RENDERS; ONLY THE CANVAS WAITS FOR ITS MEASUREMENT.
   *
   * It has to: `ResizeObserver` needs an element in the document to observe, so
   * returning `null` until `gridWidth` is known would mean it is never known —
   * the gate would hold itself shut. The host is a zero-cost positioned div
   * until the width arrives.
   *
   * ⚠ AND THIS IS WHY THE OLD `wideEnough` GATE COULD RETURN NULL SAFELY: it
   * asked the VIEWPORT via `matchMedia`, which needs no element. Measuring the
   * grid instead is what makes the early return unavailable, and missing that is
   * how a measurement gate becomes a deadlock.
   */
  if (!revealCleared) return null;

  return (
    <div
      ref={setGridEl}
      aria-hidden="true"
      data-testid="answer-card-proto"
      style={{
        position: "absolute",
        // ⚠ NO PADDING NOW, AND THE PAD CONSTANT IS GONE WITH IT. It existed
        // because the canvas was card-sized in the margin, so the rim's
        // outermost pixels sat on the canvas edge and were clipped. The canvas
        // now spans the whole grid and every card is well inside it.
        //
        // ⚠ AND PADDING WOULD ACTIVELY BREAK THE LOCKUP. The backdrop plane is
        // exactly GRID_WIDTH_PX x GRID_HEIGHT_PX; inside a canvas 12px larger on
        // each side it would no longer reach the edges, leaving a visible gutter
        // where the logo used to run out to the grid boundary.
        left: box.left,
        top: box.top,
        width: box.width,
        height: box.height,
        pointerEvents: "none",
      }}
    >
      <Canvas
        orthographic
        /*
          ⚠ A `?zoom=` CAMERA PARAM WAS ADDED HERE AND REMOVED THE SAME HOUR.
          Carl: *"i can zoom in myself win+"* — the OS magnifier does the job
          without a code path to maintain, and the version built here panned the
          camera wrongly and put the card off screen entirely.
        */
        camera={{ zoom: 1, position: [0, 0, 1000], near: 0.1, far: 4000 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        frameloop="demand"
        style={{ pointerEvents: "none" }}
        /**
         * ⚠ `checkShaderErrors` OFF FOR THIS CANVAS — AND THIS IS THE FIX FOR
         * THE LOCKUP'S ENTRANCE, WHICH CARL REPORTED AS *"not smooth"*.
         *
         * A profile scoped to the entrance window found **450ms of self-time in
         * `getProgramInfoLog`**, reached via `onFirstUse` from `setProgram`
         * DURING THE RENDER — not during the warm-up. Programs are still being
         * linked as the cards and lockup arrive, and that call blocks until the
         * driver finishes.
         *
         * ⚠ THIS WAS THEORY 2, AND IT WAS RIGHT ALL ALONG. It was dismissed
         * twice: first with a test on the WRONG RENDERER (0ms, meaningless), then
         * with a corrected retry that only covered the WARM-UP window and missed
         * this one entirely. **Two wrong tests retired a correct hypothesis** —
         * the pattern the Architect named as the session's real lesson.
         *
         * ⚠ SET ON THE CANVAS, NOT AROUND THE WARM-UP, because the blocking
         * calls happen wherever a program is first used. Scoping it to a window
         * is what let it be missed.
         *
         * ⚠ THE COST: shader errors stop being logged for this canvas. Accepted —
         * the materials here are stable, and the alternative is a visible stall
         * on every entrance. Flip it while developing shaders.
         */
        onCreated={({ gl }) => {
          gl.debug.checkShaderErrors = false;
          // ⚠ SHADOWS ARE FOR THE CLAY FORM STUDY ONLY (`?clay=1`), and they are
          // enabled here rather than as a `<Canvas shadows>` prop so the shipped
          // card never pays for them. Carl, 5 August 2026: *"Enable shadows and
          // the placement of a light is all important."*
          //
          // ⚠ THEY ARE NOT A CANDIDATE FOR THE REAL CARD AS THINGS STAND. Five
          // shadow-casting point lights would be five cube maps — thirty passes
          // a frame — behind transmissive materials. The Architect's advice is
          // to park real shadows and buy the grounding with a contact/AO term in
          // the face shader instead. This is a diagnostic, not a preview.
          const clayQ = typeof window === "undefined"
            ? null
            : new URLSearchParams(window.location.search).get("clay");
          if (clayQ !== null && clayQ !== "" && clayQ !== "0" && clayQ !== "false") {
            gl.shadowMap.enabled = true;
            gl.shadowMap.type = THREE.PCFSoftShadowMap;
          }
          // ⚠ DIAGNOSTIC ONLY — pairs with `card-canvas-compiled`. See the note
          // at `markWarm`, including why the warm-up and the real canvas must
          // NOT share a mark name.
          try {
            performance.mark(warm && !active ? "warmup-canvas-created" : "card-canvas-created");
          } catch {}
        }}
      >
        <CardScene
          // ⚠ BOTH GATES. `compiled` is this scene's own shader and
          // transmission warm-up; `warm` is the opening having yielded an idle
          // window for it to happen in. The choreography waits for both.
          active={entranceRunning}
          reducedMotion={reducedMotion}
          tuning={tuning}
          glassTuning={glassTuning}
          litCards={litCards}
          hovered={hovered}
          onWarm={markWarm}
          mayCompile={warm}
          // Falls back to the 576px reference for the frames before the first
          // measurement lands — the canvas is not yet visible then, and the
          // effect below commits the real width on the same frame it observes.
          gridWidth={gridWidth ?? GRID_WIDTH_PX}
        />
      </Canvas>

      {/*
        ⚠ HOVER IS DETECTED IN THE DOM, NOT IN THE SCENE, AND THE CANVAS STAYS
        `pointerEvents: none`.

        @react-three/fiber can raycast `onPointerOver` onto a mesh, which looks
        like the natural route. It is the wrong one here for two reasons:

          1. **The canvas spans the WHOLE GRID.** Turning pointer events on for
             raycasting makes the element itself a pointer target across all five
             slots, so it would swallow events over the four cards that do not
             exist yet — and, at rollout, over whatever occupies them.
          2. **Raycasting a transmissive mesh is not free.** The card's silhouette
             is a swept half-tube with a crowned face; hit-testing it per
             pointermove is real work to answer a question a rectangle already
             answers exactly.

        ⚠ AND THE BOXES ARE THE SAME `CARD_BOXES` THE SCENE PLACES CARDS FROM, so
        the hover region cannot drift away from the card it belongs to. That is
        the same sharing rule `cardSlotPosition` already documents.

        ⚠ `aria-hidden` AND NOT FOCUSABLE, DELIBERATELY. These are not the
        controls — they are a hover surface for a prototype with no selection
        behaviour yet. The real cards carry the roles, labels and keyboard
        handling when they return at rollout; a div with a pointer handler must
        not start impersonating a control in the accessibility tree.
      */}
      <div aria-hidden="true" style={{ position: "absolute", inset: 0 }}>
        {/* ⚠ `boxes`, NOT `CARD_BOXES` — the same measured layout the scene
            places cards from. Using the raw table here would leave the hover
            regions at their 576px positions while the cards moved, which is the
            exact drift `cardSlotPosition`'s comment warns about. */}
        {boxes.map((b, i) => (
          <div
            key={i}
            data-testid={`answer-card-hover-${i}`}
            onPointerEnter={() => setHovered(i)}
            onPointerLeave={() => setHovered((h) => (h === i ? null : h))}
            // ⚠ `pointerdown`, NOT `click` — Carl specified the mouse BUTTON as
            // the trigger, and the two differ: `click` fires on release, so a
            // slow press would delay the journey's start by however long the
            // button was held.
            // ⚠ A TOGGLE, BECAUSE A USER MAY CHANGE THEIR MIND. Carl, 4 August:
            // *"pressing inside the card should have all the filament fading
            // out... A user may change his mind about the choice."*
            //
            // ⚠ AND THE WAY BACK IS NOT THE WAY IN. Firing travels a circuit;
            // releasing fades uniformly. The journey is what says *"I am
            // choosing this"* — replaying it backwards would make taking a
            // choice back look like making one.
            onPointerDown={() =>
              setLitCards((prev) => {
                const next = prev.slice();
                next[i] = !prev[i];
                return next;
              })
            }
            style={{
              position: "absolute",
              left: b.x,
              top: b.y,
              width: b.w,
              height: b.h,
              pointerEvents: "auto",
            }}
          />
        ))}
      </div>
    </div>
  );
}

export { CARD_WIDTH_PX, CARD_HEIGHT_PX };


