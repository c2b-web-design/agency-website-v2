"use client";

/**
 * THE ORBITING LIGHT — a tilted elliptical orbit around the four-box group.
 *
 * ⚠ STILL A TEST INSTRUMENT. Spacebar turns it on and off; nothing else. Values
 * here are chosen to make the effect judgeable, not because they are approved.
 *
 * ── THE PATH, FROM CARL'S SPECIFICATION AND HIS SKETCH ──────────────────────
 *
 * A single continuous **anticlockwise** circuit of a **3D-tilted ellipse** around
 * the whole group — not around one box, and not flat in the screen plane.
 *
 * ⚠ THE MAJOR AXIS IS DEFINED BY TWO POINTS CARL NAMED, and both are edge
 * midpoints rather than box centres:
 *
 *   - the midpoint of **box 1's LEFT vertical edge**, with the light `EDGE_STANDOFF`
 *     out beyond it
 *   - the midpoint of **box 4's RIGHT vertical edge**, the same distance beyond
 *
 * Carl: *"The middle of the light should be aimed at the middle of the vertical
 * line on box 1's left hand side at the same distance it was from the face"*, and
 * for the other end *"Exactly the same. In box 4's vertical line on its right hand
 * side."*
 *
 * ⚠ AIMING AT AN EDGE RATHER THAN A FACE IS THE POINT. It satisfies the brief's
 * *"no light should be on the box at this moment"* — the cone is pointed at the
 * box's edge-on side, so it grazes past rather than landing. **The sweep has to
 * ARRIVE.**
 *
 * ⚠ AND THE ELLIPSE HAS NO INHERENT START. Carl: *"it's 'circular', we could have
 * chosen any start and halfway points."* Those two edges are convenient landmarks
 * that fix the axis and the tilt; the starting phase is a free parameter.
 *
 * ── THE SHAPE ──────────────────────────────────────────────────────────────
 *
 * | Property | Value | Where it comes from |
 * |---|---|---|
 * | semi-major | ~489 | derived: the two edge points + standoff |
 * | semi-minor | 400 | Carl's cap (see `ORBIT_SEMI_MINOR`) |
 * | depth | ±400 | same envelope, front and back |
 * | tilt | ~-5.7° | falls out of the two edge points |
 *
 * ⚠ THE TILT IS GENTLER THAN THE SKETCH SUGGESTS, and that is geometry rather
 * than a mistake: the group is 576 wide but its two rows are only 58 apart, so
 * its diagonal is nearly horizontal.
 *
 * ── WHAT HAPPENS AT THE ENDS ────────────────────────────────────────────────
 *
 * ⚠ THE TWO TIGHT BENDS DO THREE THINGS AT ONCE, which is what makes them the
 * interesting moments: they are the **closest approach** to box 1 and box 4, the
 * **sharpest curvature**, and the **front/back crossing**.
 *
 * Carl described the circuit precisely: from box 1 the light descends across the
 * front toward box 4, *"will already be making an ascent before it reaches that
 * position"*, crosses behind, and returns hidden — then *"will reach the highest
 * point of the tight bend, navigate the bend and then will descend into its
 * starting position."*
 *
 * ⚠ SO NEITHER BOX GETS A HELD, STATIC MOMENT OF MAXIMUM LIGHT. The light is
 * always already turning when it is nearest. **The glint is a passing event by
 * construction** — which is what the brief means by *"a glint is an ignition, not
 * a pass"* — and it comes from the geometry rather than from any pulsing.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { fieldPlacements } from "./contact-field-geometry";

/**
 * How far beyond a box's vertical edge the light sits at the ends of the major
 * axis.
 *
 * ⚠ 200 IS NOT A NEW NUMBER — it is the distance the light held from the face
 * throughout the geometry probe, which Carl asked to carry over: *"at the same
 * distance it was from the face."* Reusing it means the closest approach in the
 * orbit delivers the light at a distance already judged by eye.
 */
const EDGE_STANDOFF = 200;

/**
 * The ellipse's half-width across the short axis, in world units.
 *
 * ⚠ CARL'S CAP: *"the halfway point between the two — the distance must not be
 * more than double these corner distances."* The corner standoff is 200, so the
 * halfway bulge may reach 400 and no further.
 *
 * ⚠ AND THE CAP IS DOING REAL WORK, not just bounding a number. Left unbounded,
 * the light would swing far enough out that all four boxes sit at effectively the
 * same distance — which would deliver flat, even light and destroy the very
 * unevenness the ellipse exists to create.
 */
const ORBIT_SEMI_MINOR = 400;

/**
 * How far the orbit reaches toward the viewer and behind the boxes.
 *
 * ⚠ THE ELLIPSE IS TILTED IN 3D, NOT FLAT IN THE SCREEN PLANE. Carl: *"the
 * ellipse is supposed to be 3d, tilted. I had to use MS Paint"* — the sketch could
 * only show the in-plane shape.
 *
 * The front half of the circuit bulges toward the camera and the back half passes
 * behind the boxes, so the light genuinely goes out of sight. Same ±400 envelope
 * as the in-plane cap, so the orbit is bounded consistently in every direction
 * rather than introducing a fourth number.
 */
const ORBIT_DEPTH = 400;

/**
 * Cone half-angle and edge softness.
 *
 * ⚠ SIZED TO COVER A WHOLE BOX — Carl: *"make it the width of the box. The edges
 * of the face have geometry too."* An earlier 0.45 lit only the centre, which is
 * the FLATTEST part of the crown; the ends are where the surface turns away most
 * and where the shading actually lives.
 *
 * ⚠ `penumbra` IS THE FRACTION OF THE CONE GIVEN TO FALLOFF, and 0.85 was a bug:
 * it left a full-intensity core only ~15% of the cone's radius, so a 284-wide face
 * sat entirely in deep falloff. 0.3 keeps a soft edge with ~70% of the cone at
 * full strength.
 */
const CONE_ANGLE = 0.65;
const CONE_PENUMBRA = 0.3;

/**
 * ⚠ PHYSICAL FALLOFF — `decay = 2`, and this is the change that makes DISTANCE
 * MATTER. Carl: *"I would also imagine that the distance that the light is away
 * from the face is important too."*
 *
 * The geometry probe used `decay = 0` deliberately, so every box received the same
 * intensity and any difference was the box rather than its position. **That
 * fairness is exactly what has to go now**: on an ellipse the light's distance
 * changes continuously and differently for each box, and that unevenness is the
 * effect.
 *
 * ⚠ THE INTENSITY IS DERIVED, NOT GUESSED. Earlier today `decay = 2` was paired
 * with an intensity picked by feel (900) and the light arrived at the face as
 * roughly 0.06 — four orders of magnitude short, because this scene's world unit
 * is ONE CSS PIXEL and physical falloff is calibrated for scenes measured in
 * metres.
 *
 * Calibrated at the NEAREST approach so the closest pass matches the level already
 * judged by eye:
 *
 *   intensity = judged_intensity x nearest_distance^2 = 1.6 x 341^2 = 185864
 *
 * ⚠ 341 IS MEASURED FROM THE ORBIT, NOT ASSUMED FROM `EDGE_STANDOFF`, AND THE
 * FIRST ATTEMPT GOT THIS WRONG. It used 200 — the standoff — giving intensity
 * 64000, and the whole orbit measured 18-27 luminance against the ~61 the geometry
 * probe reached. **The standoff is the distance from a box EDGE along the major
 * axis; it is not the distance from a box CENTRE to the light.** Sweeping the
 * actual path and measuring gives a range of **341 to 643** from box 1's centre.
 *
 * ⚠ WHICH ALSO CORRECTS THE PREDICTED UNEVENNESS. A 10x near/far swing was
 * expected from the wrong 200; the real range gives **3.6x** — still clearly
 * uneven, and rather more usable than a factor of ten.
 *
 * If the far half reads as dead the lever is a softer decay, NOT a higher
 * intensity, which would blow out the near pass.
 */
const LIGHT_INTENSITY = 185864;
const LIGHT_DISTANCE = 0; // no hard cutoff; falloff alone shapes the reach
const LIGHT_DECAY = 2;
const LIGHT_COLOUR = "#ffffff";

/**
 * How long the VISIBLE half of the circuit takes, and how long the hidden half.
 *
 * ⚠ VARIABLE SPEED, ON CARL'S CHOICE — *"let's try variable speed."* The light
 * covers the front pass in `ORBIT_FRONT_MS` and the hidden return in
 * `ORBIT_BACK_MS`, so a full circuit is their sum.
 *
 * ⚠ THE REASON IS A USER-BEHAVIOUR CONSTRAINT, NOT AN AESTHETIC ONE. Carl: *"If a
 * user waits for the page to load, realises what to do and uses autofill, we may
 * have to speed things up."* A circuit the user never completes is an effect they
 * never see.
 *
 * ⚠ AND THE TEST SPEED WAS MEASURED FAR TOO SLOW FOR AN ORBIT. The geometry probe
 * ran 180° at radius 200 in 10s — 62.8 units/sec. This ellipse has a perimeter of
 * ~2800 units, so **at the probe's speed one circuit would take 45 seconds**, of
 * which half is hidden. A user present for twenty seconds might see nothing at
 * all. The probe's pace was correct for watching a shadow emerge across a narrow
 * band of angles and is wrong for travelling a loop four times longer.
 *
 * 6s front / 3s back keeps the visible pacing legible while cutting the dead time
 * the hidden half contributes. **Nothing is faked** — the light genuinely travels
 * the whole path, it simply does not dawdle where it cannot be seen.
 */
const ORBIT_FRONT_MS = 6000;
const ORBIT_BACK_MS = 3000;
const ORBIT_PERIOD_MS = ORBIT_FRONT_MS + ORBIT_BACK_MS;

/** The base key/fill/ambient are untouched while the rig runs. See the canvas. */
const BASE_LIGHT_SCALE = 1.0;

/**
 * The opal's specular catch — resting and peak alpha.
 *
 * ⚠ THIS DRIVES AN APPROVED CSS MATERIAL (D-033 / R-018) AND CARL AUTHORISED IT
 * DELIBERATELY. The Send button's dome catch — layer 1 of `.enquiry-send-btn`'s
 * `background-image` — rests at 0.72 in the approved material. It is dialled down
 * to 0.45 so a sweep has somewhere to rise from, and peaks at 0.85.
 *
 * ⚠ ONE LAYER ONLY. The body gradient, the opal blooms, the shaping mottle and
 * every box-shadow are untouched. Carl: *"The whole opal doesn't have to interact,
 * but just that subtle shine on the opal."* **A single specular catch responding
 * reads as a material; the whole button animating reads as a light show.**
 *
 * ⚠ AND IT IS NOT PHYSICAL SIMULATION, WHICH IS THE RIGHT CALL AND CARL'S. The
 * WebGL light cannot illuminate a DOM element — the two live in different
 * rendering worlds entirely. What this does is let the opal RESPOND to where the
 * light is. Carl: *"The user won't know about the ellipse, all they will see is
 * its effects. The goal is to give the impression the opal lives in our 3D
 * world."* The bar is belonging, not accuracy.
 */
const OPAL_SHINE_REST = 0.45;
const OPAL_SHINE_PEAK = 0.85;

/**
 * How the shine follows the orbit.
 *
 * ⚠ TRUE PROXIMITY WAS MEASURED AND REJECTED — it does not work, for two reasons
 * found by sweeping the actual path rather than assuming:
 *
 *   1. **The closest approach lands at phase 0.953 — inside the HIDDEN half**,
 *      2.7s into the 3s back pass. Driving the shine from distance would peak it
 *      while the boxes are dark, which reads as disconnected rather than caused.
 *   2. **The range is only 489 to 625 units — a 1.3x swing.** The opal sits near
 *      the ellipse's centre-bottom, so the orbit is never dramatically near or
 *      far. Far too flat to produce a visible rise and fall.
 *
 * So the shine follows the **front pass** instead: one rise and fall across the 6s
 * visible half, peaking as the light sweeps down past the middle of the group.
 * That ties the opal to the moment the user is actually watching the boxes light,
 * so the whole thing reads as ONE event crossing the scene.
 *
 * ⚠ AND IT IS FLAT THROUGH THE HIDDEN HALF, deliberately. With the light behind
 * everything there is nothing for the opal to be responding to, and a shine
 * moving with no visible cause is the thing that would give the trick away.
 */
function opalShineAt(phase: number): number {
  // Hidden half: hold at rest.
  if (phase >= 0.5) return OPAL_SHINE_REST;
  // Front half: one smooth rise and fall, peaking at the midpoint of the pass.
  const p = phase / 0.5; // 0..1 across the visible sweep
  const bell = Math.sin(p * Math.PI); // 0 at both ends, 1 in the middle
  // Smoothed so the shine eases rather than tracking a raw sine's shoulders.
  const eased = bell * bell * (3 - 2 * bell);
  return OPAL_SHINE_REST + (OPAL_SHINE_PEAK - OPAL_SHINE_REST) * eased;
}

/** One end of the major axis, as a world-space point. */
type Vec3 = [number, number, number];

/**
 * The orbit's frame: centre, and the two axes it sweeps between.
 *
 * ⚠ DERIVED FROM THE LIVE PLACEMENTS, never from copied constants. The boxes move
 * with the viewport, so re-deriving here means the orbit follows them — the same
 * rule `sharedFieldWindow` follows, and for the same reason: a second copy of the
 * placement maths can silently disagree with the first.
 */
function orbitFrame(placements: ReturnType<typeof fieldPlacements>) {
  const b1 = placements[0];
  const b4 = placements[3];
  if (!b1 || !b4) return null;

  // The two aim points Carl named: midpoints of box 1's LEFT and box 4's RIGHT
  // vertical edges.
  const aim1 = { x: b1.x - b1.width / 2, y: b1.y };
  const aim4 = { x: b4.x + b4.width / 2, y: b4.y };

  // The major axis runs between them, extended by the standoff at each end.
  const dx = aim4.x - aim1.x;
  const dy = aim4.y - aim1.y;
  const span = Math.hypot(dx, dy);
  const ux = dx / span;
  const uy = dy / span;

  const end1 = { x: aim1.x - ux * EDGE_STANDOFF, y: aim1.y - uy * EDGE_STANDOFF };
  const end4 = { x: aim4.x + ux * EDGE_STANDOFF, y: aim4.y + uy * EDGE_STANDOFF };

  return {
    cx: (end1.x + end4.x) / 2,
    cy: (end1.y + end4.y) / 2,
    semiMajor: Math.hypot(end4.x - end1.x, end4.y - end1.y) / 2,
    // Unit vector along the major axis, and its in-plane perpendicular.
    ux,
    uy,
    px: -uy,
    py: ux,
  };
}

/**
 * The light's position at phase `t` (0..1) around the circuit.
 *
 * ⚠ ANTICLOCKWISE, WITH `t = 0` AT BOX 1's EDGE. The front (visible) half runs
 * `t` 0 -> 0.5, descending across the faces from box 1 toward box 4; the hidden
 * half runs 0.5 -> 1, returning behind the boxes.
 *
 * The ellipse is built in its own frame — major axis `u`, in-plane minor `p` — and
 * the tilt is applied by giving the minor axis a Z component. At `t = 0` and
 * `t = 0.5` the light is exactly on the major axis, i.e. **in the plane of the
 * boxes**: those are the crossings, and they coincide with the closest approach to
 * box 1 and box 4.
 */
function orbitPosition(
  t: number,
  frame: NonNullable<ReturnType<typeof orbitFrame>>,
): Vec3 {
  const a = t * Math.PI * 2;
  const cosA = Math.cos(a);
  const sinA = Math.sin(a);

  // Along the major axis: +semiMajor at t=0 (box 1 end), -semiMajor at t=0.5.
  const along = cosA * frame.semiMajor;
  // Across it: the in-plane bulge, capped by Carl's rule.
  const across = sinA * ORBIT_SEMI_MINOR;

  return [
    frame.cx + frame.ux * along + frame.px * across,
    frame.cy + frame.uy * along + frame.py * across,
    // ⚠ THE TILT. `sinA` is positive on the front half and negative on the back,
    // so the same term that bulges the ellipse sideways also lifts it toward the
    // viewer and then drops it behind. That coupling is what makes it ONE tilted
    // plane rather than a wobble.
    sinA * ORBIT_DEPTH,
  ];
}

/**
 * Phase at a given elapsed time, honouring the front/back speed split.
 *
 * ⚠ THE SPLIT IS IN TIME, NOT IN GEOMETRY. The path is a plain ellipse; only the
 * rate at which `t` advances changes. The first `ORBIT_FRONT_MS` covers phase
 * 0 -> 0.5 (the visible half) and the next `ORBIT_BACK_MS` covers 0.5 -> 1.
 */
function orbitPhase(elapsedMs: number): number {
  const cycle = elapsedMs % ORBIT_PERIOD_MS;
  return cycle < ORBIT_FRONT_MS
    ? (cycle / ORBIT_FRONT_MS) * 0.5
    : 0.5 + ((cycle - ORBIT_FRONT_MS) / ORBIT_BACK_MS) * 0.5;
}

export type LightRigState = {
  /** Whether the orbiting light is on. Spacebar toggles it. */
  lightOn: boolean;
};

/**
 * The orbiting spotlight.
 *
 * ⚠ THE TARGET IS A REAL OBJECT AND IT SITS AT THE GROUP'S CENTRE. A three.js
 * `SpotLight` resolves its direction from `target.matrixWorld`; assigning a bare
 * `Vector3` silently does nothing. Aiming at the group's centre rather than at any
 * one box is what makes this an orbit around the whole assembly.
 */
export function LightRigScene({ lightOn }: LightRigState) {
  const size = useThree((state) => state.size);
  const invalidate = useThree((state) => state.invalidate);

  const placements = useMemo(
    () => fieldPlacements(size.width, size.height),
    [size.width, size.height],
  );
  const frame = useMemo(() => orbitFrame(placements), [placements]);

  const lightRef = useRef<THREE.SpotLight | null>(null);
  const targetRef = useRef<THREE.Object3D | null>(null);

  useEffect(() => {
    const light = lightRef.current;
    const targetObj = targetRef.current;
    if (!light || !targetObj || !frame) return;
    targetObj.position.set(frame.cx, frame.cy, 0);
    targetObj.updateMatrixWorld(true);
    light.target = targetObj;
    invalidate();
  }, [frame, invalidate]);

  /**
   * Drive the orbit with `requestAnimationFrame`.
   *
   * ⚠ NOT `useFrame`. Under `frameloop="demand"` R3F only runs its loop when
   * something calls `invalidate()`, so a `useFrame` callback that invalidates
   * itself never gets a first frame to run in. `contact-field-canvas.tsx` records
   * the same finding for both cascade hooks — this drives with rAF and calls
   * `invalidate()` only to PRESENT each frame.
   *
   * The loop runs only while the light is on, so the spacebar genuinely lets the
   * canvas go quiet again.
   */
  useEffect(() => {
    if (!lightOn || !frame) {
      invalidate();
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = () => {
      const light = lightRef.current;
      const phase = orbitPhase(performance.now() - start);
      if (light) {
        const [x, y, z] = orbitPosition(phase, frame);
        light.position.set(x, y, z);
        light.updateMatrixWorld(true);
        invalidate();
      }
      // ⚠ THE OPAL IS DRIVEN THROUGH A CSS CUSTOM PROPERTY ON <html>, because it
      // is a DOM element and cannot be lit by a WebGL light. Written on the same
      // frame as the light moves, so the shine and the sweep share ONE clock —
      // two clocks would drift and the opal would stop reading as part of the
      // same event.
      document.documentElement.style.setProperty(
        "--opal-shine",
        opalShineAt(phase).toFixed(3),
      );
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      // Hand the opal back to its resting value when the light stops, so a
      // paused rig cannot strand the button mid-shine.
      document.documentElement.style.setProperty(
        "--opal-shine",
        String(OPAL_SHINE_REST),
      );
    };
  }, [lightOn, frame, invalidate]);

  if (!frame) return null;

  const start = orbitPosition(0, frame);

  return (
    <>
      <object3D ref={targetRef} position={[frame.cx, frame.cy, 0]} />
      <spotLight
        ref={lightRef}
        position={start}
        angle={CONE_ANGLE}
        penumbra={CONE_PENUMBRA}
        intensity={lightOn ? LIGHT_INTENSITY : 0}
        distance={LIGHT_DISTANCE}
        decay={LIGHT_DECAY}
        color={LIGHT_COLOUR}
      />
    </>
  );
}

/**
 * The spacebar. That is the entire control surface.
 *
 * ⚠ KEYS AIMED AT A TEXT FIELD ARE IGNORED — the contact boxes are real inputs, so
 * a space typed into a field must not also kill the light.
 */
export function useLightRig(enabled: boolean) {
  const [lightOn, setLightOn] = useState(true);

  useEffect(() => {
    if (!enabled) return;
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable)) {
        return;
      }
      if (e.key === " " || e.code === "Space") {
        e.preventDefault();
        setLightOn((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [enabled]);

  return { lightOn };
}

export { BASE_LIGHT_SCALE };
