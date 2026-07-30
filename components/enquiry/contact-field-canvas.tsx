"use client";

/**
 * Contact-field canvas — the WebGL mount for the first Three.js contact-field
 * object, overlaid on the existing `.enquiry-contact-layer`.
 *
 * PIXEL MAPPING: the camera is ORTHOGRAPHIC with `zoom: 1`. @react-three/fiber
 * sets an orthographic frustum to `left = -size.width/2 … top = size.height/2`
 * in CSS pixels, and reapplies it whenever the measured size changes. One world
 * unit therefore equals one CSS pixel exactly, and stays exact across resize
 * with no resize code here. A perspective camera would foreshorten this field
 * (it sits 146px off the optical axis), so its silhouette would no longer
 * measure a clean 284 x 38 — which is precisely what this object must prove.
 *
 * PLACEMENT: the wrapper is `position: absolute; inset: 0`, so it fills the
 * contact layer exactly, contributes NOTHING to layout, and bypasses the
 * layer's flex centring. That is why the approved `.enquiry-contact-layer` CSS
 * needs no change, and why Send and the active slot cannot be displaced.
 *
 * SCOPE: geometry/scale/placement proof plus ONE material sample on the bevel.
 * Static — no animation, no interaction, no timing.
 *
 * ENVIRONMENT: there IS now a reflection environment, generated ENTIRELY
 * LOCALLY (see `useStudioEnvMap` below). A small Three.js scene is constructed
 * in code from ordinary reflection-panel meshes, converted to a prefiltered
 * radiance map by `PMREMGenerator.fromScene()` on the GPU, and the resulting map
 * is assigned DIRECTLY to the four gold bevel materials — one map, generated
 * once, shared by all four boxes; never to `scene.environment`.
 *
 * No HDRI, no CDN preset, no downloaded asset, no network request of any kind.
 * Passing `preset` or `files` to drei's `Environment` is what triggers a remote
 * fetch, and that path is deliberately NOT used: it failed in this project once
 * already (a 301 redirect from the drei-assets host went unhandled inside
 * Suspense and left the scene blank with NO console error; see the run log).
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { fieldPlacements, FIELD_SLOTS } from "./contact-field-geometry";
import { ContactField, GOLD_BEVEL_ENV_INTENSITY } from "./contact-field-mesh";

// ── The entrance cascade ─────────────────────────────────────────────────────
// ⚠ RETIMED 30 July 2026 ON CARL'S INSTRUCTION — a TRIAL, to be judged by eye.
// The original contract (`live-work/contact-form-current-timing-reference.md`
// §Field-cascade contract) was 700ms fades 500ms apart, inherited verbatim from
// the four provisional CSS field groups this object replaced:
//
//   Name 3600-4300 · Business 4100-4800 · Website 4600-5300 · Email 5100-5800
//
// Carl judged that too fast on the rendered 2x2 build: *"The boxes fade in too
// fast."* Trials ran 1000/800 ("a lot better, needs fine tuning") then 2000/1500,
// then 2000/1000. The 2000ms FADE LENGTH is approved — Carl: *"the fade ins are
// good, correct speed appearance."* Only the spacing ratio is still moving.
//
// Current values — 50%:
//
//   Name            3600-5600ms
//   Business name   4600-6600ms
//   Website URL     5600-7600ms
//   Email           6600-8600ms
//
// Each a 2000ms LINEAR fade, starts 1000ms apart. Order is row-major — left,
// right, left, right — matching FIELD_SLOTS.
//
// Spacing is expressed as a PROPORTION of the fade, not an independent number, so
// a change of fade length cannot silently change the rhythm.
//
// ⚠ THE SPACING RATIO HAS BEEN BRACKETED FROM BOTH SIDES AND IS NOT THE REMAINING
// LEVER. Recorded so the exercise is not repeated:
//
//   75%  1500ms  no visible overlap. Box 2 began when box 1 measured 60.9 of a
//                full 61.9 — 98% of final brightness, so box 1 LOOKED finished.
//                Carl: *"Box 2 should start to make an appearance before box 1 has
//                completed its full fade in. that is not what i see on screen."*
//   50%  1000ms  *"so, so close. There is still a gap between the objects
//                appearing, but its much tighter now."*  <- best judged so far
//   33%   660ms  *"That seemed to have no effect, one that the human eye can
//                discern anyway"* — despite THREE boxes measurably mid-climb at
//                once, against two at 50%.
//   10%   200ms  deliberate overshoot, to bracket from the fast side. *"the
//                sequence is too fast and it doesnt seem to alter the timing
//                between boxes."*
//
// LINEAR OPACITY IS NOT LINEAR PERCEPTION — that is what the 75% result proves.
// The last quarter of a linear ramp is nearly indistinguishable from full, so no
// ratio above ~50% can produce a visible overlap at any fade length.
//
// ⚠ AND BELOW 50% THE METRIC KEPT MOVING WHILE THE PERCEPTION DID NOT. A
// measurable change the eye cannot see means the metric is not tracking what is
// being judged. Carl called it after the overshoot: *"i know which way to approach
// this... we will do it a different way."*
//
// 50% is RETAINED AS THE BEST-JUDGED VALUE, NOT AS AN APPROVED ONE.
//
// ⚠ THE DERIVATION WAS REMOVED, 30 July 2026, AND THAT IS THE POINT OF THIS
// CHANGE. Every value used to compute from one spacing RATIO, so nothing could be
// moved on its own — adjusting box 2 moved boxes 3 and 4, the acknowledgement and
// the opal with it. Four attempts at tuning the ratio (75/50/33/10%) never landed
// because the instrument had no independent controls.
//
// Carl: *"The mistake is not to have them as one system, like the rail system. The
// key is to break them apart and not have them so reliant on proportion and
// ratios... We will judge it by eye and input the numbers."*
//
// So each box now carries its OWN start and its OWN duration, typed in directly.
// There is no ratio, no derived spacing, and no arithmetic between elements. A
// value here means exactly what it says and affects nothing else.
//
// The proportional model is not "wrong" in the abstract — but it is the wrong tool
// for finding a value by eye, because it couples every observation to every other.
// Once the numbers are settled by eye, any relationship worth keeping can be
// re-imposed deliberately.

/** One box's entrance: when it starts and how long it takes, on the completion clock. */
type FieldEntrance = { delay: number; duration: number };

/**
 * Entrance easing — the fix for "3 seconds that looks like one".
 *
 * ⚠ THE PROBLEM THIS SOLVES, MEASURED 30 July 2026. Carl: *"3000ms is 3 seconds.
 * the boxes do not take 3s to appear. its much, much faster... i can categorically
 * say that when i first see them it is even less than a second."*
 *
 * He was right, AND the timing was right. Measured on box 1's rim, sampled clear of
 * the corridor text: 5% at +3684ms, 99% at +6630ms — a wall-clock **2946ms** against
 * a 3000ms contract, on a perfectly even ramp (13/31/48/64/80/96/100%).
 *
 * The mismatch is PERCEPTUAL. The gold rim is a thin bright line against near-black
 * and its numeric range (luminance 18 -> 174) maps very unevenly onto what the eye
 * resolves:
 *
 *   opacity 0.00-0.30   rim too dim to register       reads as NOTHING THERE
 *   opacity 0.30-0.70   rim crosses into visibility   <- the ~1s Carl sees
 *   opacity 0.70-1.00   already bright; further rise  reads as ALREADY DONE
 *                       barely registers
 *
 * So a LINEAR opacity ramp spends roughly two-thirds of its life outside what the
 * eye can see, and delivers about one second of visible event from three seconds of
 * animation. Every earlier tuning attempt — the 75/50/33/10% spacing ratios — was
 * adjusting linear opacity while Carl's eye read rim brightness on a quite
 * different curve. That is why none of them landed.
 *
 * ⚠ TWO CURVES WERE TRIED AND BOTH MADE IT WORSE. Measured, and recorded so the
 * dead end is not re-entered:
 *
 *   visible band, 25%->75% of rim brightness
 *     LINEAR       ~1730ms
 *     ease-out      1097ms   (-37%)
 *     smoothstep    1122ms   (-35%)
 *
 * The reasoning behind trying them was wrong, and the error is worth naming: an
 * easing curve CONCENTRATES movement somewhere and stretches it elsewhere. It
 * cannot create visible time — concentrating movement anywhere makes the portion
 * that crosses the visible band go past FASTER, whichever end it favours.
 *
 * LINEAR IS ALREADY THE WIDEST VISIBLE BAND ANY CURVE CAN GIVE, because it is the
 * only one that never concentrates.
 *
 * ⚠ SO THE TIMING IS NOT THE LEVER. The band's width is set by how much of the
 * opacity range maps onto rim brightness the eye can resolve — the material's
 * property, not the animation's. A thin bright line against near-black is invisible
 * for the bottom ~30% and saturated for the top ~30%, whatever curve drives it.
 *
 * KEPT LINEAR deliberately. The function stays so the finding has somewhere to
 * live, and so the next person does not repeat the experiment.
 */
function easeEntrance(t: number): number {
  return t;
}

/**
 * Each box's entrance. A `null` entrance means the box never appears — the masking
 * mechanism, kept because it earned its place.
 *
 * ⚠ ALL FOUR UNMASKED, 30 July 2026. Boxes 3, 4 and the opal were hidden while the
 * boxes 1 -> 2 relationship was tuned in isolation — Carl: *"Lets make chunks out
 * of the chunk... separate the connection between elements."* That isolation is
 * what made the fade length judgeable at all, after four attempts at tuning a
 * coupled system had failed.
 *
 * THE SETTLED SHAPE: a 3000ms fade, 500ms apart. Carl on the pair: *"when i said
 * before that its close enough, this is a little bit closer... its not exactly as
 * i wanted with a discernable overlap and fading in/out like other elements but
 * its close enough."*
 *
 * ⚠ "CLOSE ENOUGH" IS NOT APPROVED, and the reservation is recorded because it is
 * specific: the overlap is still less discernible than Carl wants, and the boxes
 * do not read like the other elements' fades. That is the outstanding gap.
 *
 * Boxes 3 and 4 continue the same 500ms step rather than introducing new values —
 * the pair was tuned, so the pattern rolls out down the line.
 */
const FIELD_ENTRANCES: Array<FieldEntrance | null> = [
  // Box 1 — Name, top-left. 3600ms start is unchanged and not in question: the
  // corridor is clear by 2600ms, giving a 1000ms gap before anything arrives.
  { delay: 3600, duration: 3000 },
  // Box 2 — Business name, top-right. THE VALUE UNDER TEST.
  //
  // ⚠ 4600 IS A FIRST NUDGE, NOT A CHOSEN VALUE — 1000ms after box 1. Carl: *"lets
  // start box 2 1000 from where it is now, lets give it a nudge... we play it by
  // ear, or in this case, by eye."*
  //
  // The previous step held both boxes at 3600 so the FADE LENGTH could be judged
  // with nothing else moving. That worked: *"fade in looks great, now that i have
  // no distractions."* 3000ms is settled; the stagger is what is being found now.
  //
  // This delay is the ONLY number in play. Nothing derives from it, so it can be
  // moved freely — which is the whole reason the proportional model was removed.
  { delay: 4100, duration: 3000 },
  // Box 3 — Website URL, bottom-left. UNMASKED 30 July 2026, continuing the same
  // 500ms step Carl settled on between boxes 1 and 2.
  { delay: 4600, duration: 3000 },
  // Box 4 — Email, bottom-right. Same step again.
  { delay: 5100, duration: 3000 },
];

/**
 * When the last VISIBLE box finishes. Downstream elements read this.
 *
 * Computed from whatever is currently unmasked, so masking a box cannot leave a
 * downstream element waiting on something that never arrives.
 */
export const FIELD_ENTRANCE_END_MS = FIELD_ENTRANCES.reduce(
  (latest, e) => (e ? Math.max(latest, e.delay + e.duration) : latest),
  0,
);

// Static illumination. The key is deliberately RAKING from the upper left: a
// shallow crown is only legible under a grazing light, and a head-on key
// flattens it entirely.
//
// The z component is what matters here, and it must be read against the
// object's scale. The field is ~284 x 38 wide but only ~8.7 units DEEP, and the
// crown's steepest face tilt is ~7.4 degrees from flat. A light at z=200 sits
// only ~37 degrees off the surface normal, which is effectively head-on at this
// depth: measured Lambert response across the whole crown was ~5%, i.e. a flat
// slab with no readable form (verified from a render, not assumed).
//
// Dropping z well below the lateral offsets puts the key at a genuinely grazing
// angle (~76 degrees off-normal), so a shallow crown and the bevel shoulder both
// register. Geometry is unchanged — only the light angle is corrected.
const KEY_LIGHT_POSITION: [number, number, number] = [-160, 120, 40];
const KEY_LIGHT_INTENSITY = 1.6;
// A second, much dimmer fill from the opposite side keeps the unlit flank from
// going dead while preserving the directional read.
const FILL_LIGHT_POSITION: [number, number, number] = [140, -90, 60];
const FILL_LIGHT_INTENSITY = 0.35;
const AMBIENT_INTENSITY = 0.22;

// ── Local procedural studio environment (reflection only) ────────────────────
// A metal shows almost nothing without something to REFLECT. Direct lights give
// a metal only tiny specular points, which is why the earlier `metalness: 1`
// attempt rendered the bevel near-black. This environment exists so genuinely
// metallic gold (metalness 1.0) has a surrounding to reflect.
//
// It is a controlled DARK PRODUCT STUDIO, not a scene: predominantly black,
// one broad restrained warm-white source above/upper-left, one much dimmer cool
// opposing fill. No scenery, no room, no colourful backdrop, no imagery.
//
// GENERATED ENTIRELY LOCALLY: a small scene is built in code and converted to a
// prefiltered radiance map by three's own `PMREMGenerator.fromScene()`, on the
// GPU. No HDRI, no CDN preset, no downloaded asset, no network request.
//
// WHY NOT `scene.environment` (drei's <Environment>, the obvious route): that
// assigns the map SCENE-WIDE, so every standard material samples it and
// isolation depends on getting per-material opt-outs right everywhere. Assigning
// the map to the BEVEL MATERIAL ALONE instead makes containment DETERMINISTIC:
// no other material references the map, so nothing else can respond to it.
//
// While trying the scene-wide route, the diagnostic-grey FACE was measured
// changing as the environment changed, even with its `envMapIntensity` at 0:
//
//   env key / scale        bevel maxWarm   face luma peak   face warm
//   (none, baseline)            52              ~61             0
//   1.50  scale 14x7            27               83            3-5
//   0.55  scale 14x7            17               69            1-2
//   0.55  scale 40x22           52               91            4-7
//   per-material envMap         91               61             0
//
// Those measurements are recorded as OBSERVATIONS only. An earlier version of
// this comment blamed ACES filmic tone mapping reacting to total scene
// luminance; that explanation is WRONG and has been removed. ACES is selected
// globally on the renderer, but three applies it per fragment, from that
// fragment's own outgoing colour and the fixed `toneMappingExposure` uniform
// (see tonemapping_pars_fragment.glsl) — it performs no averaging, histogram or
// adaptive exposure, so it cannot lift an unrelated pixel. The true cause of the
// measured face change was never proven and is deliberately left unclaimed.
// The per-material route is chosen for guaranteed containment, not as a
// workaround for adaptive exposure.
/**
 * Radius of the studio shell. Small, closed and finite — the map only needs to
 * describe direction, so nothing is gained by a larger surround.
 */
const ENV_SHELL_RADIUS = 60;
/** Broad warm-white key reflection, above and upper-left. */
const ENV_KEY_COLOR = "#fff2dd";
/**
 * RAISED 2.6 → 7.0, 28 July 2026. This is the load-bearing half of making the
 * bevel read as gold rather than copper.
 *
 * The bevel is `metalness: 1.0`, so its `color` tints the REFLECTION — it is not
 * paint, and the metal can only be as bright as what surrounds it. Measured with
 * the logo's own gold already applied to the material: rendered #562b03 at
 * luminance 49, against a logo body of 125 and champagne of 195. The colour was
 * not the limit; the available radiance was.
 *
 * Two panels are the whole world this metal has to reflect. At 2.6 there was
 * simply not enough energy for a champagne tint to land on, so every colour
 * value tested collapsed toward bronze.
 *
 * Raised in the SAME change as the colour deliberately: separating them would
 * mean judging a champagne tint against radiance that cannot carry it, which is
 * the trap the first attempt fell into.
 */
const ENV_KEY_INTENSITY = 7.0;
/** Dimmer neutral-cool opposing fill, so the far flank is not dead black. */
const ENV_FILL_COLOR = "#c8d4e6";
/**
 * RAISED 0.5 → 1.3, keeping the key:fill ratio near the original 5:1. The fill
 * exists so the flank turned away from the key is not dead black; raising the
 * key alone would have widened that gap and read as a hard, single-source look
 * rather than a satin sweep around the tube.
 */
const ENV_FILL_INTENSITY = 1.3;

/**
 * Build the studio radiance map on the GPU and return its texture, applied to
 * the BEVEL MATERIAL ALONE (never to `scene.environment`).
 *
 * LIFECYCLE — the reason this is an effect and not a `useMemo`.
 * `PMREMGenerator.fromScene()` returns a `WebGLRenderTarget`, and the texture
 * handed out here is that target's texture. Only the TARGET can free the GPU
 * allocation, so it must be owned for as long as it is in use and disposed on
 * teardown. A previous version returned `target.texture` from a `useMemo` and
 * dropped the target, which leaked one render target per mount — and this canvas
 * mounts and unmounts with the enquiry `complete` stage, so remounts accumulated.
 *
 * Allocating in an effect rather than during render also means React
 * development/Strict Mode's double-invoke cannot strand an allocation: every
 * allocation has a matching cleanup, and a discarded one is disposed rather than
 * orphaned. The effect re-runs if the renderer is ever replaced, disposing the
 * old target first, so remounting and renderer swaps are both safe.
 *
 * The map is never routed through React state or read during render. It is a
 * GPU resource consumed by one material, so the effect assigns it DIRECTLY to
 * that material via a ref and marks the material for recompile. This avoids
 * both `react-hooks/set-state-in-effect` (setState in an effect/cleanup) and
 * `react-hooks/refs` (reading `ref.current` during render), and it is the more
 * honest description of what is happening: a texture is being attached to a
 * material, not state driving a re-render.
 *
 * `invalidate()` asks R3F for one more frame once the map is attached —
 * necessary because this canvas runs `frameloop="demand"` and would otherwise
 * keep showing the frame drawn before the map existed.
 *
 * Returns ONE REF PER BOX, to attach to each box's bevel material. The refs are
 * created and owned HERE rather than passed in, so the effect only ever mutates
 * values it owns.
 *
 * ⚠ ONE MAP, FOUR MATERIALS — generated once and shared. The studio radiance map
 * is a view-independent cube map describing the surrounding light, so every box
 * reflects the same environment and there is nothing per-box to compute. Sharing
 * it also keeps the GPU cost identical to the single-box build: one PMREM
 * generation, one render target, four materials pointing at its texture.
 *
 * Containment is unchanged and still deterministic: the map is assigned to these
 * four bevel materials and to nothing else — never to `scene.environment` — so no
 * rim, no face, and no future material can respond to it by accident.
 */
function useStudioEnvMap(count: number): Array<React.RefObject<THREE.MeshStandardMaterial | null>> {
  const gl = useThree((state) => state.gl);
  const invalidate = useThree((state) => state.invalidate);
  // The ARRAY of refs is created once via a lazy `useState` initialiser, not a
  // `useRef` — the array itself is read during render (it is passed to children
  // as their refs), and `react-hooks/refs` correctly rejects reading
  // `ref.current` there. The individual entries are still ordinary mutable ref
  // objects; only the container is state. `count` is a compile-time constant (the
  // four field slots), so this never needs to resize.
  const [bevelMaterials] = useState(() =>
    Array.from({ length: count }, () => ({
      current: null as THREE.MeshStandardMaterial | null,
    })),
  );

  useEffect(() => {
    const studio = new THREE.Scene();
    const disposables: Array<THREE.BufferGeometry | THREE.Material> = [];

    // Reflection panels. `MeshBasicMaterial` with `toneMapped: false` and the
    // colour pre-multiplied by intensity: these are things to be SEEN IN a
    // reflection, not lights. Large rather than fierce — a tubular bevel
    // reflects a wide arc, so a big soft source reads as a satin sweep instead
    // of a hot pinpoint.
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

    // Black surround — the dark-studio baseline everything else sits against.
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

    // The generator and the temporary studio scene are only needed to produce
    // the map; the TARGET is what must outlive them.
    const pmrem = new THREE.PMREMGenerator(gl);
    const target = pmrem.fromScene(studio, 0, 0.1, 200);
    pmrem.dispose();
    disposables.forEach((d) => d.dispose());
    studio.clear();

    // Attach the ONE map to every box's bevel. Captured into a local array so the
    // cleanup detaches exactly the materials this run attached, even if a ref's
    // `current` has since changed.
    const attached = bevelMaterials
      .map((ref) => ref.current)
      .filter((m): m is THREE.MeshStandardMaterial => m !== null);

    attached.forEach((material) => {
      material.envMap = target.texture;
      material.needsUpdate = true;
    });
    invalidate(); // frameloop="demand": request the frame that shows the map

    return () => {
      // Detach BEFORE disposing, so a disposed texture can never be sampled.
      // Disposing the render target releases its texture with it.
      attached.forEach((material) => {
        material.envMap = null;
        material.needsUpdate = true;
      });
      target.dispose();
      invalidate();
    };
    // `bevelMaterials` is a lazily-initialised state array and is referentially
    // stable for the component's lifetime, so listing it cannot re-run this
    // effect — it is declared because the array is genuinely read inside.
  }, [gl, invalidate, bevelMaterials]);

  return bevelMaterials;
}

/**
 * Set one box's opacity by walking its assembly's meshes.
 *
 * Applied to the MATERIALS because a Three.js `Group` has no opacity of its own.
 * Each ContactField creates its own three materials (they are declared as JSX
 * children, so R3F instantiates a fresh material per mesh per box), which is
 * what makes per-box opacity possible at all — a shared material would fade all
 * four together and silently defeat the cascade.
 */
function setFieldOpacity(group: THREE.Group | null, opacity: number) {
  if (!group) return;
  group.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (!mesh.isMesh) return;
    const material = mesh.material as THREE.Material | THREE.Material[];
    if (Array.isArray(material)) {
      material.forEach((m) => (m.opacity = opacity));
    } else {
      material.opacity = opacity;
    }
  });
}

/**
 * How far below its final position a box starts, in world units (== CSS px).
 *
 * ⚠ WHY THERE IS MOVEMENT AT ALL — this is not decoration, it is the fix for a
 * measured problem. Carl: *"3000ms is 3 seconds. the boxes do not take 3s to
 * appear... i can categorically say that when i first see them it is even less
 * than a second."* He was right, and so was the timing: box 1's fade measured
 * 2946ms against a 3000ms contract, on a perfectly even ramp.
 *
 * The mismatch is that OPACITY IS A POOR CARRIER FOR THIS OBJECT. The gold rim is
 * a thin bright line against near-black; it is invisible through the bottom ~30%
 * of the opacity range and saturated through the top ~30%, so three seconds of
 * fade delivers about one second of visible event.
 *
 * ⚠ AND NO EASING CURVE CAN FIX THAT — measured, twice. An easing curve
 * redistributes movement rather than creating visible time, so concentrating it
 * anywhere makes the crossing of the visible band FASTER:
 *
 *   visible band (25%->75% of rim brightness)
 *     linear      ~1730ms      ease-out  1097ms      smoothstep  1122ms
 *
 * Linear is already the widest band any curve can give. The lever therefore has to
 * be something other than the opacity ramp.
 *
 * ⚠ POSITION WAS TRIED AT 8px AND REJECTED — set to 0, kept as a record.
 *
 * The theory was sound and the measurement confirmed the movement happened (the
 * rim's brightest row travelled y=57 -> y=18 across the entrance). But Carl's
 * verdict was decisive on a point the theory did not consider: *"the rise looks
 * like a glitch to what has come before."*
 *
 * ⚠ THAT IS A CONTINUITY OBJECTION, NOT A MAGNITUDE ONE, so a bigger or smaller
 * rise does not answer it. Everything preceding these boxes — the corridor
 * deepening, the phrases receding, "Understood." revealing — resolves by fading
 * and settling INTO a fixed position. A box that arrives by travelling reads as a
 * different kind of event, and the eye catches the discontinuity before it
 * registers the extra duration. It also *"still doesnt feel 3s"*, so it did not
 * buy what it cost.
 *
 * `enquiry-card-rise` moving 6px was cited as precedent for this. That was a
 * misreading: those cards rise as they ENTER AN EMPTY SLOT during the
 * questionnaire, where movement is the established language. The contact boxes
 * arrive into a settled, static frame at the end of the choreography. Same
 * technique, different moment, opposite effect.
 *
 * Kept at 0 rather than deleted so the finding survives and the experiment is not
 * repeated.
 */
const FIELD_ENTRANCE_RISE_PX = 0;

/**
 * Offset a box below its final Y by `rise`, easing to zero as it arrives.
 *
 * ⚠ APPLIED AS AN OFFSET FROM THE PLACEMENT Y, NEVER AS AN ABSOLUTE POSITION. The
 * group's Y is owned by `fieldPlacements` and is responsive — it changes with the
 * measured layer height. Writing an absolute value here would silently break the
 * pixel-exact placement the geometry proof depends on.
 */
function setFieldRise(group: THREE.Group | null, baseY: number, rise: number) {
  if (!group) return;
  group.position.y = baseY - rise;
}

/**
 * Drive the gold bevel's REFLECTION STRENGTH alongside its opacity.
 *
 * ⚠ THIS IS THE FIX FOR "3 SECONDS THAT LOOKS LIKE ONE", and it addresses the
 * measured cause rather than a symptom. Everything else tried was a symptom:
 *
 *   spacing ratios 75/50/33/10%   the stagger was never the problem
 *   ease-out, smoothstep          both COMPRESSED the visible band (-37%, -35%)
 *   an 8px rise                   worked mechanically, read as a glitch
 *
 * THE CAUSE, measured: the gold bevel is `metalness: 1.0`, so what it shows is a
 * specular REFLECTION of the studio environment, not a diffuse surface. A bright
 * reflection saturates far faster than opacity rises, so the rim crosses from
 * invisible to blazing across a narrow slice of the fade:
 *
 *   visible band (25%->75% of own range)   FACE (diffuse) 1643ms   RIM (metal) 1094ms
 *
 * The face — plain grey, `metalness: 0` — fades roughly proportionally. The metal
 * does not. And the rim is the thing the eye watches.
 *
 * THE FIX: hold `envMapIntensity` low early and bring it up late, so the metal's
 * brightness climbs through the fade instead of arriving all at once. Opacity still
 * runs linear; this shapes how much there is TO see at each opacity.
 *
 * ⚠ `t^2` WAS TRIED AND DID NOT HELP — 1048ms band against 1094ms unlagged. The
 * ramp went 4/10/21/43/70/100%: back-loaded, crawling early and rushing at the end.
 * Lagging the reflection pushes the whole brightness climb into the final third,
 * which is a different failure, not a fix.
 *
 * `sqrt(t)` instead — the reflection LEADS the opacity. At 25% opacity the metal is
 * already at 50% reflection strength, so the rim crosses into visibility EARLY and
 * then has the whole remaining fade to climb slowly through the band the eye
 * tracks. This is the direction that widens the band rather than shifting it.
 *
 * ⚠ THIS TOUCHES THE PROVISIONAL GOLD MATERIAL — `GOLD_BEVEL_ENV_INTENSITY` is its
 * approved resting value and is RESTORED EXACTLY at t = 1. The material's settled
 * appearance is unchanged; only its approach to that appearance is shaped. Carl
 * authorised this after the alternatives were exhausted: *"whether its its own curve
 * or not fading from zero, try them."*
 */
function setBevelEnvIntensity(
  material: THREE.MeshStandardMaterial | null,
  progress: number,
) {
  if (!material) return;
  material.envMapIntensity = GOLD_BEVEL_ENV_INTENSITY * Math.sqrt(progress);
}

/**
 * Drives the four entrance fades on the approved contract.
 *
 * ⚠ THIS IS THE ONLY ANIMATION IN THIS CANVAS, AND IT IS BOUNDED. The canvas
 * runs `frameloop="demand"` precisely so a static scene does not spin a 60fps
 * loop. That constraint is preserved rather than abandoned: the loop runs only
 * while the cascade is in flight and stops itself once the last box reaches full
 * opacity. The scene is static before 3600ms and static again after 5800ms.
 *
 * TIME BASE: `performance.now()` captured when the effect mounts, NOT R3F's
 * clock. The mount of this canvas IS completion-clock zero — `ContactFieldCanvas`
 * is gated behind `canvasWarm` inside the `complete` stage — so the cascade
 * delays are measured from the same instant the CSS versions measured from.
 *
 * REDUCED MOTION is handled by the caller: `prefersReducedMotion` makes every
 * box appear at full opacity on the first frame, matching how the acknowledgement
 * and Send behave under the same query (globals.css `@media
 * (prefers-reduced-motion: reduce)` on `.enquiry-contact-layer--in`).
 */
function useEntranceCascade(
  groups: Array<React.RefObject<THREE.Group | null>>,
  /**
   * Each box's FINAL Y, from `fieldPlacements`. The rise is applied as an offset
   * from these, so responsive placement stays authoritative — see `setFieldRise`.
   */
  baseYs: number[],
  /**
   * Each box's gold bevel material, so its reflection strength can be driven
   * alongside its opacity — see `setBevelEnvIntensity`.
   */
  bevelMaterials: Array<React.RefObject<THREE.MeshStandardMaterial | null>>,
  reducedMotion: boolean,
  active: boolean,
) {
  const invalidate = useThree((state) => state.invalidate);

  // ⚠ DRIVEN BY requestAnimationFrame, NOT BY `useFrame`.
  //
  // `useFrame` was the obvious choice and it is WRONG here, measured: under
  // `frameloop="demand"` R3F only runs its loop when something calls
  // `invalidate()`, so a `useFrame` callback that invalidates ITSELF never gets a
  // first tick to do it from. The cascade never ran and all four boxes rendered
  // at full opacity from the first frame — visible on top of the corridor still
  // fading clear, which is the exact collision the delay contract exists to
  // prevent. (Caught by screenshotting the layer at 1000ms; the CSS-opacity
  // probe would never have shown it.)
  //
  // An rAF loop owns its own heartbeat, sets the material opacities, and calls
  // `invalidate()` to ask R3F to PRESENT the result. Frames are still requested
  // only while a fade is in flight, so `frameloop="demand"` keeps its meaning:
  // the loop stops entirely once the last box reaches full opacity.
  useEffect(() => {
    // ⚠ THE CLOCK STARTS WHEN `complete` ARRIVES, NOT WHEN THIS CANVAS MOUNTS.
    //
    // Measured 30 July 2026: gating on mount put every box at full opacity from
    // completion-clock 0ms. The canvas mounts on `canvasWarm` — the WebGL pre-warm
    // — which happens DURING the questionnaire, deliberately, so that context
    // creation and PMREM generation never land on the completion choreography.
    // That can be minutes before completion, so by the time `complete` rendered
    // the cascade had long since run to its end behind `visibility: hidden`.
    //
    // `active` is the `complete` stage. Until it is true the boxes are held at
    // opacity 0 and no loop runs.
    if (!active) {
      groups.forEach((g, i) => {
        setFieldOpacity(g.current, 0);
        setFieldRise(g.current, baseYs[i], FIELD_ENTRANCE_RISE_PX);
        setBevelEnvIntensity(bevelMaterials[i]?.current ?? null, 0);
      });
      invalidate();
      return;
    }

    // Reduced motion: present immediately, no cascade, no loop at all. Masked
    // boxes stay hidden — masking is a scope decision, not a motion effect.
    // ⚠ AND NO RISE: the movement is an entrance animation, so under
    // `prefers-reduced-motion` every box sits at its final position from the first
    // frame. A box left offset would be a layout error, not a reduced animation.
    if (reducedMotion) {
      groups.forEach((g, i) => {
        setFieldOpacity(g.current, FIELD_ENTRANCES[i] ? 1 : 0);
        setFieldRise(g.current, baseYs[i], 0);
        // Full reflection strength immediately — the material's approved resting
        // appearance, with no approach to it.
        setBevelEnvIntensity(bevelMaterials[i]?.current ?? null, 1);
      });
      invalidate();
      return;
    }

    // Hidden and offset low until each entrance begins. Set explicitly rather than
    // relying on declared initial values, so a remount cannot inherit a finished
    // cascade's state.
    groups.forEach((g, i) => {
      setFieldOpacity(g.current, 0);
      setFieldRise(g.current, baseYs[i], FIELD_ENTRANCE_RISE_PX);
      setBevelEnvIntensity(bevelMaterials[i]?.current ?? null, 0);
    });
    invalidate();

    const start = performance.now();
    let raf = 0;

    const tick = () => {
      const elapsed = performance.now() - start;
      let allDone = true;

      groups.forEach((group, i) => {
        const entrance = FIELD_ENTRANCES[i];
        // MASKED: stays at opacity 0 forever and never holds the loop open.
        if (!entrance) {
          setFieldOpacity(group.current, 0);
          return;
        }
        const progress = Math.min(1, Math.max(0, (elapsed - entrance.delay) / entrance.duration));
        // LINEAR — measured as the widest visible band any curve gives; see
        // `easeEntrance` for the two curves that were tried and were worse.
        setFieldOpacity(group.current, easeEntrance(progress));
        // Rise is currently 0 — kept as a record; see FIELD_ENTRANCE_RISE_PX.
        setFieldRise(group.current, baseYs[i], FIELD_ENTRANCE_RISE_PX * (1 - progress));
        // THE REFLECTION LAG — the actual fix. Holds the metal's brightness back
        // early so it keeps climbing through the second half of the fade, instead
        // of saturating in the first third. See `setBevelEnvIntensity`.
        setBevelEnvIntensity(bevelMaterials[i]?.current ?? null, progress);
        if (progress < 1) allDone = false;
      });

      invalidate(); // frameloop="demand": present this frame
      if (!allDone) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // `baseYs` is listed because the rise is measured from it: a responsive
    // re-placement must restart the loop against the new positions rather than
    // keep offsetting from stale ones.
  }, [active, reducedMotion, groups, baseYs, bevelMaterials, invalidate]);
}

function FieldScene({ reducedMotion, active }: { reducedMotion: boolean; active: boolean }) {
  // Owns the studio render target and hands back one ref per box's bevel
  // material. ONE map, shared by all four — see `useStudioEnvMap`.
  //
  // ⚠ ALL FOUR BOXES, corrected 30 July 2026. A first version attached the map to
  // box 1 only, reasoning that the PROVISIONAL gold should not be multiplied
  // across four objects before Carl judged the set. Carl's instruction was to
  // CLONE the boxes, and he caught it immediately: three boxes in a visibly
  // different material cannot be judged as a 2x2 field at all. Withholding part
  // of a clone is not caution, it is a different deliverable.
  //
  // The material itself is unchanged and still PROVISIONAL. Material and gradient
  // direction for the set is Carl's call with the PM/A.
  const bevelMaterialRefs = useStudioEnvMap(FIELD_SLOTS.length);

  // The layer's measured CSS box, tracked by R3F. This is the whole responsive
  // story: width changes flow into the placement maths automatically.
  const size = useThree((state) => state.size);
  const placements = useMemo(
    () => fieldPlacements(size.width, size.height),
    [size.width, size.height],
  );

  // One ref per box. Created once and never reordered, so a ref always refers to
  // the same slot as its entrance delay.
  const box0 = useRef<THREE.Group | null>(null);
  const box1 = useRef<THREE.Group | null>(null);
  const box2 = useRef<THREE.Group | null>(null);
  const box3 = useRef<THREE.Group | null>(null);
  const groups = useMemo(() => [box0, box1, box2, box3], []);

  // The final Y of each box, for the entrance rise to offset from. Memoised on the
  // placements so a re-render at the same size does not restart the cascade.
  const baseYs = useMemo(() => placements.map((p) => p.y), [placements]);

  useEntranceCascade(groups, baseYs, bevelMaterialRefs, reducedMotion, active);

  return (
    <>
      {/* Existing key/fill/ambient rig — UNCHANGED. The studio map adds
          something for the metal to REFLECT; it does not relight the scene and
          is never assigned to `scene.environment`. */}
      <ambientLight intensity={AMBIENT_INTENSITY} />
      <directionalLight position={KEY_LIGHT_POSITION} intensity={KEY_LIGHT_INTENSITY} />
      <directionalLight position={FILL_LIGHT_POSITION} intensity={FILL_LIGHT_INTENSITY} />
      {placements.map((placement, i) => (
        <ContactField
          key={placement.id}
          placement={placement}
          groupRef={groups[i]}
          bevelMaterialRef={bevelMaterialRefs[i]}
        />
      ))}
    </>
  );
}

/**
 * Decorative geometry proof: `aria-hidden`, non-interactive, no focus target.
 * There is no form control here yet, so there is nothing to label — a stand-in
 * label would be worse than none, announcing a control that does not exist.
 *
 * REDUCED MOTION: read here and passed down, because the cascade now animates.
 * The earlier note said no reduced-motion branch was warranted "because the
 * object is completely static" — that was true of the single static box and is
 * no longer true of a four-box entrance cascade. Under `prefers-reduced-motion`
 * all four boxes are present at full opacity immediately, which is exactly what
 * the CSS version did (`.enquiry-contact-layer--in { animation: none; opacity: 1 }`).
 *
 * Read with `matchMedia` at mount rather than via CSS, because the fade is now
 * driven in WebGL where a media query cannot reach it.
 *
 * A LAZY `useState` INITIALISER, not a ref and not an effect. A ref would be
 * read during render (`react-hooks/refs` — and the lint rule is right: a value
 * needed for rendering is state, not a ref), while `setState` in an effect is the
 * pattern the one accepted lint error in this project already comes from. The
 * initialiser runs exactly once on mount, before the first frame, which is what
 * the cascade needs — and this component only ever mounts client-side, gated
 * behind `canvasWarm`, so `window` is always available.
 *
 * @param active `true` once the enquiry has reached the `complete` stage. It is
 *   the cascade's clock zero and is NOT the same as this component mounting: the
 *   canvas mounts early, on `canvasWarm`, so that WebGL context creation and
 *   PMREM generation stay off the completion choreography. Passing mount time as
 *   clock zero was measured wrong — the whole cascade elapsed behind
 *   `visibility: hidden` and all four boxes were fully opaque at completion 0ms.
 */
export default function ContactFieldCanvas({ active }: { active: boolean }) {
  const [reducedMotion] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  return (
    <div
      aria-hidden="true"
      style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0 }}
    >
      <Canvas
        orthographic
        camera={{ zoom: 1, position: [0, 0, 1000], near: 0.1, far: 4000 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        // Still DEMAND, not "always". The scene is static before the cascade
        // starts and static again once it finishes; `useEntranceCascade`
        // invalidates only while a fade is in flight, so the 60fps loop exists
        // for the ~2.2s entrance and at no other time. The original reason for
        // choosing demand — do not spin a loop behind a static image — is
        // preserved rather than discarded.
        frameloop="demand"
        style={{ pointerEvents: "none" }}
      >
        <FieldScene reducedMotion={reducedMotion} active={active} />
      </Canvas>
    </div>
  );
}
