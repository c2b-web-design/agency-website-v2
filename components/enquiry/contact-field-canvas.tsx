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
import { fieldPlacements, sharedFieldWindow, FIELD_SLOTS } from "./contact-field-geometry";
import { ContactField, GOLD_BEVEL_ENV_INTENSITY } from "./contact-field-mesh";
// ⚠ TEST INSTRUMENT, gated behind `?lightrig=1` and absent from every ordinary
// page load. See `contact-field-light-rig.tsx` — it is meant to be deleted once
// the geometry question is answered, which is why it is a separate file and why
// this is the only place the canvas refers to it.
import { LightRigScene, useLightRig, BASE_LIGHT_SCALE } from "./contact-field-light-rig";

// ── The entrance cascade ─────────────────────────────────────────────────────
// ⚠ RETIMED 30 July 2026 ON CARL'S INSTRUCTION — a TRIAL, to be judged by eye.
// The original contract (`live-work/contact-form-current-timing-reference.md`
// §Field-cascade contract) was 700ms fades 500ms apart, inherited verbatim from
// the four provisional CSS field groups this object replaced:
//
//   Name 3600-4300 · Business 4100-4800 · Website 4600-5300 · Email 5100-5800
//
// Carl judged that too fast on the rendered 2x2 build: *"The boxes fade in too
// fast."* Trials ran 1000/800 ("a lot better, needs fine tuning"), then 2000/1500,
// 2000/1000, 2000/660, a 2000/200 overshoot, and finally 3000ms fades.
//
// ⚠ CURRENT VALUES — the authority is `FIELD_ENTRANCES` below, not this comment:
//
//   Name            3600-6600ms
//   Business name   4100-7100ms
//   Website URL     4600-7600ms
//   Email           5100-8100ms
//   opal (Send)     8600-11600ms   — enquiry-opening.tsx
//
// Each a 3000ms LINEAR fade, starts 500ms apart. Order is row-major — left,
// right, left, right — matching FIELD_SLOTS.
//
// ⚠ CURRENT AND BEST-JUDGED, NOT APPROVED. Carl: *"The flow is good and still
// follows the principles laid down. I am not unhappy with it."* His reservation
// stands and is specific — the overlap is still less discernible than he wants,
// and the boxes do not read like the other elements' fades.
//
// ⚠ THIS BLOCK WAS STALE AND WAS CORRECTED 30 July 2026, caught at the plan-review
// gate (`live-work/architect-plan-response.md`). It described 3600/4600/5600/6600
// with 2000ms fades 1000ms apart — the abandoned proportional model — while the
// array below implemented 3600/4100/4600/5100 at 3000ms. **A comment that
// contradicts the code beside it is worse than no comment**, because it is written
// to be believed. The values now live in ONE place; this block describes and does
// not define.
//
// ⚠ THE SPACING RATIO HAS BEEN BRACKETED FROM BOTH SIDES AND IS NOT THE REMAINING
// LEVER. Recorded so the exercise is not repeated. (Historical: the proportional
// model these percentages belong to was removed — see below.)
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
/** Exported alongside `FIELD_ENTRANCES` so consumers can name its element type. */
export type FieldEntrance = { delay: number; duration: number };

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
/*
 * ⚠ EXPORTED 31 July 2026 — the ONLY change to this file in the text-input chunk.
 * The values, the ordering and the masking behaviour are UNTOUCHED, and the
 * reservation recorded above is not reopened by this.
 *
 * Carl's instruction: *"All labels can arrive on screen with their respective
 * boxes. Fade in with them."* A label fading on its own box's clock has to read
 * that box's delay and duration, and `FIELD_ENTRANCE_END_MS` carries only the
 * aggregate.
 *
 * ⚠ EXPORTED RATHER THAN COPIED, deliberately. Restating 3600/4100/4600/5100 in
 * the DOM layer would be the FOURTH hard-coded copy of this timing — and the
 * third went stale in `verify/field-colour.mjs`, which sampled every screenshot
 * mid-cascade while reporting the settled state. One source means a retimed
 * cascade moves the labels with it, which matters precisely because these values
 * are NOT APPROVED and are expected to move.
 *
 * ⚠ A null entry MASKS a box. Any consumer must handle null rather than assume
 * four entries — `FIELD_ENTRANCE_END_MS` above already does.
 */
export const FIELD_ENTRANCES: Array<FieldEntrance | null> = [
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

// ── The shared satin field the four boxes are windows onto ───────────────────
//
// ⚠ STEP 2 OF 4 — COLOUR ONLY. No arc grain and no normal map yet, deliberately:
// the plan builds this in independently judgeable steps so the gradient's depth
// and its brightness against the gold can be settled before texture complexity
// lands on top. Steps 3 (arcs -> normal map) and 4 (responsive pass) follow.
//
// THE MODEL. One texture, four apertures. The boxes do not each carry a material —
// their UVs encode position within a shared field (`sharedFieldWindow` in
// contact-field-geometry.ts), so each shows a different region of one continuous
// surface. Carl: *"no boxes the same. No boxes with a slight variation of the same
// idea."* The variation falls out of position rather than being authored.
//
// ⚠ THE HIERARCHY CONSTRAINT THAT GOVERNS EVERY VALUE HERE. The gold rim stays
// dominant; the field's brightest point sits BELOW the rendered gold's. If the
// interior competes, the boxes stop reading as windows and start reading as tiles.
// Measured reference: the rim spans luminance 17.0 (floor) to 172.9 (full).
//
// Non-reflective by construction — `metalness: 0`, `envMapIntensity: 0`. A
// reflective face would show the studio environment and fight the orbiting light
// that follows this chunk; a satin face RECEIVES light instead.

/** Texture resolution. 6:1 to match the field's world aspect — see below. */
const FIELD_TEX_W = 2304;
const FIELD_TEX_H = 384;

/**
 * ⚠ THE TEXTURE IS 6:1, NOT SQUARE, AND THAT IS LOAD-BEARING.
 *
 * The shared field spans 576 x 96 world units. The UVs are isotropic — 96 world
 * units per UV unit on BOTH axes at every viewport width (verified at 576/400/300)
 * — so a square texture would map its square pixels onto a 6:1 world rectangle and
 * a circle drawn in texture space would render as a 6:1 ellipse. At 2304 x 384 the
 * texel is square in world space: draw a circle, get a circle.
 *
 * That matters from step 3, when the arcs arrive. It costs nothing to get right
 * now and is expensive to discover later.
 *
 * DENSITY: `FIELD_TEX_H / 96` = 4 texels per world unit. The face is 275 x 29
 * units per box, so ~1100 x 116 texels against ~550 x 58 device pixels at DPR 2 —
 * about 2x device density, comfortably above Nyquist. ~3.5 MB.
 */

// ── Palette ──────────────────────────────────────────────────────────────────
// Deep royal through a lifted lighter blue, pitched well below the gold. Taken as
// direction from Carl's satin-blue reference and the gradient sheet, not copied:
// *"we can take elements from several and combine them to make the design our own.
// Plus, any colour combinations can be made darker or lighter as we see fit."*
//
// ⚠ Most published blue gradients are designed as backgrounds on LIGHT pages and
// are far too bright at their darkest point for this one. These sit deliberately
// low. PROVISIONAL — to be judged by eye and moved.
// ⚠ LIFTED TWICE, and the second lift was the important one.
//
// First attempt (#0a1836 / #16346b / #2f5f9e) was pitched low to protect the gold
// hierarchy and over-corrected: the right-hand boxes were near-indistinguishable
// from the page background. A window showing nothing is not a window.
//
// ⚠ SECOND LIFT — CALIBRATED AGAINST THE SEND OPAL, not chosen freely. Carl,
// viewing on a 65" 4K TV: *"I am looking in comparison to the send button which is
// a lot lighter blue. Rather than complement each other as far as colour goes...
// the box blues are too dark and do not distinguish themselves too much from the
// dark background."*
//
// The Send opal is an APPROVED element (R-018, D-033) and it already sets the blue
// this page has. Its body is a genuinely saturated ultramarine — measured from
// `.enquiry-send-btn` in globals.css:
//
//   #163a8f -> #14418f -> #114aa5   (base `background-color: #114aa5`)
//
// The field at #24509b was close in LIGHTNESS but well below in SATURATION, so it
// read as muted-and-dark beside a rich blue: two palettes in one frame rather than
// one family. These values sit in the opal's hue family and closer to its
// saturation, so the two complement rather than compete — while the field stays
// clearly subordinate to the gold, which measures 172.9 at full.
// ⚠ SAMPLED FROM `brand-assets/images.jpg`, Carl's flowing-ribbon reference, then
// COMPRESSED. He asked for it followed closely: *"if you have to copy this design
// closely, do it. Most of it will be masked anyway."*
//
// Measured from the reference (699x392, sampled on a grid):
//
//   darkest   #000761  luminance  12
//   mid-dark  #1148bd  luminance  69
//   mid       #2784e1  luminance 119
//   light     #35a9f4  luminance 150
//   lightest  #c2ffff  luminance 242
//
// ⚠ ITS RANGE CANNOT BE USED DIRECTLY. Luminance 242 would blow past the gold rim's
// measured 172.9 and break the hierarchy that governs this whole chunk — the field
// must stay subordinate. The values below keep the reference's HUE PATH (a genuine
// cyan lean at the light end, deep ultramarine at the dark) while compressing the
// span to roughly 20-150, so the brightest field still sits clearly under the gold.
//
// The hue also sits close to the Send opal's #163a8f -> #114aa5, which is what Carl
// asked for on the 65" TV: *"all would echo the blue opal."*
// ── The sampled source ───────────────────────────────────────────────────────
//
// ⚠ A DELIBERATE EXCEPTION TO THIS PROJECT'S OWN RULE, taken by Carl with the
// trade-off in front of him. Every other material here is GENERATED — the gold was
// sampled from C2B's own logo, the studio environment is built in code with no
// HDRI and no network request. `contact-field-source.jpg` is a licensed stock
// asset (Pikbest, watermarked in the original), and using it closely was raised as
// a licensing and originality question before it was done.
//
// Carl's decision, with his reasoning: *"Yes, I'd be breaking my own rule, but for
// this effect — worth it!"* and, on the method: *"I'd be sampling in Music."*
//
// Recorded here so it reads as a decision rather than an oversight to whoever finds
// it later. ⚠ **If this site is ever used as a template for client work
// (`live-work/references/workshop-template-and-client-delivery.md`), this asset is
// the one element that is NOT C2B's to pass on.**
//
// The procedural field below is kept as a working fallback for exactly that reason.
const FIELD_SOURCE_URL = "/contact-field-source.jpg";
// ── Grading the source against the Send opal ─────────────────────────────────
//
// ⚠ ANCHORED TO MEASURED VALUES, not adjusted by feel. Carl: *"look at the hex of
// the darkest blue of the opal and the lightest blue, use them as a guide."*
//
// The Send opal's body gradient (globals.css, `.enquiry-send-btn`) is the target,
// because it is the approved blue this page already has:
//
//   #071a42  luma  24.8   the DARKEST — dark navy edge
//   #0c2f72  luma  44.4
//   #163a8f  luma  56.5
//   #14418f  luma  61.1
//   #114aa5  luma  68.5   the LIGHTEST body tone (also its background-color)
//
//   => body range 24.8 .. 68.5.   Gold rim, for the ceiling: 17.0 .. 172.9.
//
// ⚠ AND MEASURING THE FIELD AGAINST THAT FOUND THE REAL PROBLEM, which was NOT
// what it looked like. Carl asked for the shades to be *"a little bit lighter"*,
// but the field's MEAN was already 67.4 — essentially the opal's lightest tone.
// Its RANGE was the defect: min 10.0 against the opal's darkest of 24.8. The field
// was not too dark, it was **too contrasty** — dropping to near-black in places,
// which reads as holes rather than as one material.
//
// Simply lightening it made that worse: multiplying by #c4d2ea lifted the peak to
// 185, ABOVE the gold's 172.9, breaking the hierarchy that governs this chunk.
//
// So the range is COMPRESSED rather than shifted — a screen pass lifts the floor
// without touching the ceiling. Measured result: min 30.1 (just above the opal's
// darkest), max 162.0 (safely under the gold), mean 82.5.
/** Multiply pass — sets the ceiling, keeping the source's peak under the gold. */
const FIELD_SOURCE_DARKEN = "#9fb4d8";
/** Screen pass — lifts the floor, so the darks never fall below the opal's. */
const FIELD_SOURCE_LIFT = "#0a1a3a";
/** Overlaid to pull the hue toward the opal's ultramarine. PROVISIONAL. */
const FIELD_SOURCE_TINT = "rgba(20, 62, 150, 0.30)";

// ── STEP 3: the satin grain ──────────────────────────────────────────────────
//
// ⚠ THE GRAIN IS SURFACE RELIEF, NOT PAINTED TONE. Carl: *"Paint looks cheap.
// Not for us."* The arcs are drawn once into a greyscale HEIGHT FIELD, which is
// then Sobel-differentiated into a NORMAL MAP. The colour map is left alone
// unless `FIELD_GRAIN_TINT` is raised above 0.
//
// ⚠ WHY RELIEF SPECIFICALLY, and it is about the chunk that follows this one.
// At rest the grain is a whisper. When the orbiting light's aimed glint sweeps
// across, fine relief CATCHES it and the whole box participates in the moment
// rather than only its rim. Carl: *"When the glints happen it will add a lot more
// to the overall effect... That kicks it up a notch."* Painted arcs would look
// painted under a moving light, because paint does not respond to direction.

/**
 * `normalScale` for the grain.
 *
 * ⚠ THE PLAN'S DERIVED 0.03 WAS MEASURED INVISIBLE AND REPLACED. Recorded here
 * because the derivation was sound reasoning that reached the wrong number, and a
 * future session will otherwise re-derive it the same way.
 *
 * The reasoning was: the crown's entire angular signal is 7.4° on the short axis,
 * a `normalScale` of 1 perturbs roughly 45°, so 0.03 perturbs ~1.8° — a quarter of
 * the crown, the "whisper at rest" the brief asks for.
 *
 * ⚠ MEASURED AGAINST A CONTROL AT RELIEF 0, IT MOVED NOTHING. High-frequency
 * residual inside box 1's face, dev build, 1440x900 @ DPR 2:
 *
 *   relief 0.00 (control)  0.404   <- the SAMPLED JPEG's own noise floor
 *   relief 0.03 (planned)  0.413   <- +0.009. Indistinguishable from the control
 *   relief 0.15            0.560
 *   relief 0.30            0.789
 *   relief 0.50            1.123   <- CURRENT
 *   relief 2.00            3.813   <- deliberate overshoot; confirmed the wiring
 *
 * ⚠ AND THE FIRST PROBE NEARLY CONFIRMED THE BUG. Measuring relief 0.03 alone
 * returned 0.413 against a flat-field threshold of 0.15 and reported "grain
 * present and measurable" — which was TRUE and irrelevant: it was measuring the
 * source JPEG's compression noise, not the grain. **Only the control at relief 0
 * exposed it.** The same lesson as the Q5 harness that passed on a visible defect:
 * a measurement without a control measures whatever is loudest.
 *
 * Why the derivation missed: it modelled the grain against the CROWN's angular
 * budget, but the crown is lit by a raking key at `z = 40` chosen specifically to
 * make 7.4° legible. The grain is a *diffuse* perturbation on a `metalness: 0`
 * face with `envMapIntensity: 0` — it has no reflection to amplify it, so it needs
 * far more angular signal than the crown to register at all.
 *
 * ⚠ 0.50 IS CURRENT AND BEST-JUDGED, NOT APPROVED. Carl judges it by eye on the
 * 27" monitor, which the plan names as the worst case and the one that decides.
 *
 * ⚠ THE NORMALISATION IS PART OF THIS CONSTANT'S CONTRACT (plan finding F-4).
 * The value holds ONLY against the encoding below:
 *
 *   - height field: 0..255 greyscale, arcs drawn at `FIELD_ARC_ALPHA` over mid-grey
 *   - kernel: 3x3 Sobel, taps in units of one texel
 *   - divisor: `FIELD_SOBEL_DIVISOR` — the raw Sobel sum is /4 to bring a hard
 *     0->255 edge to a full-scale ±1 encoded gradient
 *   - encoded: `0.5 + 0.5 * clamp(gradient, -1, 1)` per channel, blue fixed at 255
 *
 * ⚠ CHANGE THE AMPLITUDE, THE KERNEL OR THE DIVISOR AND THIS NUMBER SILENTLY
 * MEANS A DIFFERENT ANGLE, with nothing on screen to signal that a by-eye result
 * has been invalidated. Re-measure against a control, do not carry it across.
 */
const FIELD_GRAIN_RELIEF = 0.5;

/**
 * How much the arcs modulate COLOUR as well as relief. 0 = pure relief.
 *
 * ⚠ THIS CONSTANT EXISTS BECAUSE OF A GENUINE OPEN QUESTION, not as a spare knob.
 * Taken literally, "relief not paint" means the arcs are near-INVISIBLE until the
 * orbiting light exists — leaving nothing to judge in this chunk. Rather than
 * decide in advance, Carl made it a by-eye call: *"Build both, judge side by
 * side."* 0 is pure relief; raised gives a visible trace.
 */
/**
 * ⚠ 0.55 IS CURRENT AND BEST-JUDGED, NOT APPROVED — AND IT IS EXPLICITLY DEFERRED.
 *
 * Judged side by side on 31 July 2026 with a temporary A/B scaffold: the top row
 * pure relief, the bottom row tinted. Carl viewed it on a 27" 1080p Lenovo and a
 * 65" 4K LG and preferred the tinted pair — *"3 + 4 look better to me. Whether
 * its the way the gradient is, it seems a bit brighter to me."*
 *
 * **His read was correct and it measures.** Same region, same size, top vs bottom:
 *
 *   top    (relief only)   residual 1.123   luma 7..45   mean 25.9
 *   bottom (relief + tint) residual 1.302   luma 13..55  mean 29.4
 *
 * ⚠ SO THE TINT'S MAIN EFFECT IS TONE, NOT GRAIN. It adds only ~16% more
 * high-frequency detail but lifts the floor 7 -> 13 and the ceiling 45 -> 55.
 * **That eats headroom the orbiting light will want**, because the hierarchy
 * constraint holds the field's peak below the gold's.
 *
 * ⚠ AND THE COMPARISON IS DELIBERATELY NOT SETTLED. Carl: *"I know it may look
 * different when light is put upon it. My suggestion is keep it as it is for the
 * moment. A better comparison may be made with the introduction of light later."*
 *
 * That is the correct call: relief exists to CATCH THE ORBITING GLINT, so judging
 * relief against tint before the light exists compares a finished thing with an
 * unfinished one. Pure relief is *supposed* to look quiet now. **Re-judge this
 * value during the light chunk.**
 */
const FIELD_GRAIN_TINT = 0.55;

/**
 * Arc sweep direction, degrees. ⚠ PROVISIONAL — PENDING THE ORBITING LIGHT.
 *
 * Grain shimmers most when light crosses the lines and least when it runs along
 * them, so the RIGHT angle is a property of the light's path — which belongs to
 * the light brief, not this chunk (plan finding F-5).
 *
 * ⚠ BUT SOMETHING MUST BE DRAWN, or `FIELD_GRAIN_RELIEF` gets tuned by eye against
 * a direction nobody chose, and the light chunk could then move it underneath the
 * result. This value is chosen against the CURRENT STATIC KEY at [-160, 120, 40]:
 * arcs sweeping roughly perpendicular to that raking direction, so the relief is
 * legible now. **The decision stays Carl's; only the value is provisional.**
 */
const FIELD_ARC_ANGLE_DEG = 18;

/**
 * Arc geometry, in field-u units (u runs 0..6 across the field; a box is ~2.9
 * world units wide, which is 0.18 u).
 *
 * ⚠ THE SPACING IS LARGE RELATIVE TO A BOX, AND THAT IS THE WHOLE LESSON OF STEP
 * 2. Two procedural attempts failed there for one structural reason: features
 * with ~1-unit radii on a field where each box is 2.9 units wide. A box caught a
 * bright patch and flat tone either side, so it never read as a gradient — it read
 * as an EDGE. **Any feature drawn into this field must be large relative to a box,
 * or the box sees an edge rather than a gradient.**
 *
 * Grain is the deliberate exception that proves the rule: it is meant to be FINE
 * and repeating, so a box sees MANY arcs rather than one feature. The failure mode
 * is the middle case — a handful of arcs per box, which reads as stripes.
 */
const FIELD_ARC_SPACING_PX = 7;
/** Stroke width in texture pixels. Sub-pixel widths are why AA matters here. */
const FIELD_ARC_WIDTH_PX = 1.1;
/** Arc contrast in the height field, 0..1 against mid-grey. */
const FIELD_ARC_ALPHA = 0.5;
/** Sobel divisor. See `FIELD_GRAIN_RELIEF` — part of the normalisation contract. */
const FIELD_SOBEL_DIVISOR = 4;

/** The shadow end. Deep ultramarine — the reference's troughs, lifted off black. */
const FIELD_DEEP = "#0a1f5e";
/** The body — the reference's mid-dark, and the opal's own family. */
const FIELD_BODY = "#1548b4";
/** The lit end. Cyan-leaning, as the reference is. Capped well below the gold. */
const FIELD_LIT = "#4fa2ea";

/**
 * The ribbon crest — the path the bright band follows across the field.
 *
 * ⚠ RADIAL SPOTS WERE THE WRONG MODEL AND WERE REPLACED. Two earlier attempts
 * placed radial light sources: one (box 1 lit, boxes 2 and 4 identical), then
 * three (all four differed, but box 1 flattened because the energy spread out).
 * Both failed for the same structural reason — **a spot with a ~1-unit radius is
 * smaller than a box, which is 2.9 units wide.** Each box caught a bright patch
 * and flat tone either side, so it never read as a gradient at all.
 *
 * ⚠ THE REFERENCE IS NOT SPOTS, IT IS RIBBONS. Measured from
 * `brand-assets/images.jpg` by tracing the brightest row per column:
 *
 *   x=0.00  crest at 0.90    x=0.45  crest at 0.45    x=0.82  crest at 0.53
 *   x=0.18  crest at 0.60    x=0.55  crest at 0.51    x=1.00  crest at 0.39
 *   x=0.36  crest at 0.47    x=0.64  crest at 0.55
 *
 * A bright band sweeping up from the lower-left, levelling across the middle, and
 * lifting again at the right — with the TROUGH crossing the other way, from the
 * top-left down to the bottom-right.
 *
 * ⚠ THAT TROUGH CROSSING IS WHAT CARL SPECIFIED, and it falls out of the structure
 * rather than being placed per box: *"bottom left would be lighter on the left hand
 * side of the box but would get darker on its right side... top right the same,
 * opposite, boxes right side to left would be lighter to darker."* Because the dark
 * region swaps sides along the sweep, the bottom-left and top-right windows read in
 * OPPOSITE directions — which is what stops any two boxes reading as the same idea.
 *
 * Control points in field UV: u across 0..6, v 0..1. Interpolated smoothly.
 */
const FIELD_CREST: Array<{ u: number; v: number }> = [
  { u: 0.0, v: 0.88 },
  { u: 1.1, v: 0.62 },
  { u: 2.2, v: 0.47 },
  { u: 3.3, v: 0.50 },
  { u: 4.4, v: 0.55 },
  { u: 5.2, v: 0.52 },
  { u: 6.0, v: 0.40 },
];

/**
 * Half-thickness of the bright ribbon, in v units, and how far the glow reaches
 * beyond it before falling to the deep tone.
 *
 * ⚠ BOTH ARE LARGE RELATIVE TO A BOX (0.30 v-units tall), and deliberately. The
 * falloff must span a large fraction of the field or a box sees a hard edge rather
 * than a gradient — the defect that made the radial-spot attempts fail.
 */
const FIELD_CREST_CORE_V = 0.16;
const FIELD_CREST_FALLOFF_V = 0.62;

/**
 * The crest's v at any u, smoothly interpolated between `FIELD_CREST`'s control
 * points.
 *
 * ⚠ SMOOTHSTEP BETWEEN POINTS, NOT LINEAR. Linear interpolation would put a
 * corner at every control point, and a ribbon with corners in it reads as a
 * polygon rather than a flow — visible even under the heavy blur of the falloff,
 * because the eye finds discontinuities in a gradient's *rate* as readily as in
 * its value.
 */
function crestAt(u: number): number {
  const pts = FIELD_CREST;
  if (u <= pts[0].u) return pts[0].v;
  if (u >= pts[pts.length - 1].u) return pts[pts.length - 1].v;
  for (let i = 1; i < pts.length; i++) {
    if (u <= pts[i].u) {
      const a = pts[i - 1];
      const b = pts[i];
      const t = (u - a.u) / (b.u - a.u);
      const s = t * t * (3 - 2 * t); // smoothstep
      return a.v + (b.v - a.v) * s;
    }
  }
  return pts[pts.length - 1].v;
}

/**
 * Draw the arc grain into a greyscale HEIGHT FIELD.
 *
 * ⚠ ONE HEIGHT FIELD, TWO OUTPUTS. This canvas is the single source for both the
 * normal map (Sobel, below) and — when `FIELD_GRAIN_TINT` > 0 — the colour map's
 * grain overlay. Drawing the arcs twice would let relief and tint drift apart,
 * which is invisible in code review and obvious under a raking light.
 *
 * Mid-grey base: the Sobel reads DIFFERENCES, so the absolute level is irrelevant
 * and 128 keeps the arcs symmetric about it in both directions.
 *
 * ⚠ ARCS, NOT STRAIGHT LINES. A straight-line grain reads as brushed metal;
 * curvature is what makes it satin. The centre sits far OUTSIDE the field bounds
 * so each box's window catches a different segment at a different curvature and
 * angle — the same mechanism the whole chunk runs on. **The variation falls out of
 * position; nothing is randomised per box.**
 */
function buildFieldHeightCanvas(): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = FIELD_TEX_W;
  canvas.height = FIELD_TEX_H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2D context unavailable for the contact field height map");

  ctx.fillStyle = "#808080";
  ctx.fillRect(0, 0, FIELD_TEX_W, FIELD_TEX_H);

  // The arc centre, placed well outside the field and offset along the sweep
  // angle. A radius this large means each arc crosses a box as a very shallow
  // curve rather than as a visible circle segment.
  const angle = (FIELD_ARC_ANGLE_DEG * Math.PI) / 180;
  const radius = FIELD_TEX_W * 1.9;
  const cx = FIELD_TEX_W * 0.5 - Math.sin(angle) * radius;
  const cy = FIELD_TEX_H * 0.5 + Math.cos(angle) * radius;

  ctx.lineWidth = FIELD_ARC_WIDTH_PX;
  ctx.strokeStyle = `rgba(255, 255, 255, ${FIELD_ARC_ALPHA})`;

  // Concentric arcs outward from the centre. The loop bounds cover the furthest
  // corner from the centre, so no region of the field is left ungrained.
  const maxR = Math.hypot(
    Math.max(cx, FIELD_TEX_W - cx),
    Math.max(cy, FIELD_TEX_H - cy),
  );
  const minR = Math.max(0, radius - maxR);
  for (let r = minR; r <= maxR; r += FIELD_ARC_SPACING_PX) {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  return canvas;
}

/**
 * Sobel the height field into a tangent-space normal map.
 *
 * ⚠ `NoColorSpace`, NOT `SRGBColorSpace`. A normal map carries VECTORS, not
 * colour. Tagging it sRGB applies the transfer function to the encoded gradient
 * and every normal comes out wrong — a silent failure that looks like a scale
 * problem and gets "fixed" by raising `normalScale`, which is the wrong lever.
 * The asymmetry with the colour map is deliberate and load-bearing.
 *
 * ⚠ THE GREEN CHANNEL AND `flipY` — plan finding F-6. `CanvasTexture` defaults to
 * `flipY: true`, so the image is flipped on upload while the encoded gradient is
 * not. `dy` is therefore NEGATED here so green agrees with three's OpenGL-style
 * convention after the flip. **Get this wrong and ridges render as grooves** —
 * every numeric check passes either way, and it is visible only under the raking
 * key, only if someone is looking for it.
 */
function buildFieldNormalTexture(height: HTMLCanvasElement): THREE.CanvasTexture {
  const hctx = height.getContext("2d");
  if (!hctx) throw new Error("2D context unavailable reading the contact field height map");
  const src = hctx.getImageData(0, 0, FIELD_TEX_W, FIELD_TEX_H).data;

  const canvas = document.createElement("canvas");
  canvas.width = FIELD_TEX_W;
  canvas.height = FIELD_TEX_H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2D context unavailable for the contact field normal map");
  const out = ctx.createImageData(FIELD_TEX_W, FIELD_TEX_H);

  // Red channel only — the height field is greyscale, so r == g == b.
  const at = (x: number, y: number) => {
    const cx = x < 0 ? 0 : x >= FIELD_TEX_W ? FIELD_TEX_W - 1 : x;
    const cy = y < 0 ? 0 : y >= FIELD_TEX_H ? FIELD_TEX_H - 1 : y;
    return src[(cy * FIELD_TEX_W + cx) * 4] / 255;
  };

  for (let y = 0; y < FIELD_TEX_H; y++) {
    for (let x = 0; x < FIELD_TEX_W; x++) {
      const tl = at(x - 1, y - 1), t = at(x, y - 1), tr = at(x + 1, y - 1);
      const l = at(x - 1, y), r = at(x + 1, y);
      const bl = at(x - 1, y + 1), b = at(x, y + 1), br = at(x + 1, y + 1);

      const dx = (tr + 2 * r + br - tl - 2 * l - bl) / FIELD_SOBEL_DIVISOR;
      const dy = (bl + 2 * b + br - tl - 2 * t - tr) / FIELD_SOBEL_DIVISOR;

      const i = (y * FIELD_TEX_W + x) * 4;
      const enc = (g: number) =>
        Math.round(255 * (0.5 + 0.5 * Math.max(-1, Math.min(1, g))));
      out.data[i] = enc(dx);
      out.data[i + 1] = enc(-dy); // see the flipY note above
      out.data[i + 2] = 255;
      out.data[i + 3] = 255;
    }
  }
  ctx.putImageData(out, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.NoColorSpace;
  // ⚠ IDENTICAL SAMPLER SETUP TO THE COLOUR MAP. `map` and `normalMap` have
  // INDEPENDENT transform uniforms in three, so a mismatch here slides the relief
  // off the colour it is meant to belong to.
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.repeat.set(1 / 6, 1);
  texture.anisotropy = 4;
  texture.needsUpdate = true;
  return texture;
}

/**
 * Build the shared field's colour texture on a 2D canvas.
 *
 * ⚠ `CanvasTexture` RATHER THAN `DataTexture`, deliberately. The 2D canvas API
 * gives `createRadialGradient` directly and — from step 3 — antialiased `arc()`
 * strokes. Fine arcs at sub-pixel widths alias badly without AA, and hand-rolling
 * coverage antialiasing in a `DataTexture` loop is real work for no gain.
 *
 * ⚠ `SRGBColorSpace` is REQUIRED on a colour map. Omitting it double-applies the
 * transfer function and the field renders visibly darker and more saturated than
 * authored — a silent failure that looks like a palette problem.
 */
function buildFieldColourTexture(
  source?: HTMLImageElement,
  height?: HTMLCanvasElement,
): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = FIELD_TEX_W;
  canvas.height = FIELD_TEX_H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2D context unavailable for the contact field texture");

  /**
   * Overlay the grain as visible TONE, when `FIELD_GRAIN_TINT` > 0.
   *
   * ⚠ CALLED FROM BOTH RETURN PATHS. The sampled path returns early, so a single
   * call at the end of the function would silently drop the tint the moment the
   * source image loaded — visible only as "the grain disappeared after a second".
   *
   * `soft-light` rather than `overlay`: it modulates without crushing the darks,
   * which matters because step 2 established that this field's defect mode is
   * RANGE, not level — its darks reading as holes.
   */
  const applyGrainTint = () => {
    if (!height || FIELD_GRAIN_TINT <= 0) return;
    ctx.save();
    // ⚠ APPLIED TO THE WHOLE FIELD. A 31 July A/B scaffold clipped this to the
    // bottom row so the two treatments could be judged side by side; it was
    // REMOVED once judged. Treating regions of the field differently breaks the
    // one-continuous-field principle the whole chunk rests on — and breaks it
    // invisibly, because the result still looks like four varied boxes.
    ctx.globalCompositeOperation = "soft-light";
    ctx.globalAlpha = FIELD_GRAIN_TINT;
    ctx.drawImage(height, 0, 0);
    ctx.restore();
  };

  // ── SAMPLED FROM THE SOURCE IMAGE, when it has loaded ──────────────────────
  //
  // ⚠ CARL'S EXPLICIT INSTRUCTION, twice: *"if you have to copy this design
  // closely, do it. Most of it will be masked anyway"* and *"If you have to copy
  // the image virtually pixel by pixel — do it... I'd be sampling in Music."*
  //
  // The procedural ribbon below reproduced the STRUCTURE and Carl approved one
  // region of it — *"how the left of box 1 looks is great"* — but asked for that
  // quality everywhere. Sampling the source directly gives it everywhere, because
  // the source already has the variation an approximation has to invent.
  //
  // ⚠ THE ASPECT MISMATCH IS HANDLED BY PLACEMENT, NOT BY STRETCHING. The source
  // is 1.78:1 and the field is 6:1. Stretching to fit would flatten every ribbon
  // into a horizontal smear — the ribbons' diagonal character IS the design. A 6:1
  // crop would keep only 30% of the source's height and lose most of the structure.
  //
  // Instead the source is drawn TWICE, side by side and mirrored at the join, at
  // its own aspect. Mirroring means the seam is continuous — the right edge of the
  // first copy meets its own reflection, so there is no visible join — and the two
  // halves are not identical crops, so the left and right box columns sample
  // genuinely different content.
  if (source) {
    const halfW = FIELD_TEX_W / 2;
    ctx.drawImage(source, 0, 0, halfW, FIELD_TEX_H);
    ctx.save();
    ctx.translate(FIELD_TEX_W, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(source, 0, 0, halfW, FIELD_TEX_H);
    ctx.restore();

    // ⚠ DARKEN, because the source is too bright for this page. Measured: the
    // reference peaks at luminance 242 and the gold rim measures 172.9. Used raw,
    // the field would out-shine the gold and the boxes would stop reading as
    // windows and start reading as tiles — the constraint that governs this whole
    // chunk. A multiply pass with the deep tone pulls the range down while keeping
    // the source's hue path and all of its structure.
    ctx.globalCompositeOperation = "multiply";
    ctx.fillStyle = FIELD_SOURCE_DARKEN;
    ctx.fillRect(0, 0, FIELD_TEX_W, FIELD_TEX_H);

    // ⚠ THEN LIFT THE FLOOR. Multiply alone made the field too CONTRASTY, not too
    // dark — its darks fell to luminance 10 against the opal's darkest of 24.8,
    // reading as holes rather than as one continuous material. Screen raises the
    // shadows without touching the highlights, so the range compresses toward the
    // opal's instead of merely shifting. Order matters: multiply sets the ceiling,
    // screen then sets the floor beneath it.
    ctx.globalCompositeOperation = "screen";
    ctx.fillStyle = FIELD_SOURCE_LIFT;
    ctx.fillRect(0, 0, FIELD_TEX_W, FIELD_TEX_H);

    // And a light ultramarine pass to pull the hue toward the Send opal's family,
    // which is what Carl asked for on the 65" TV: *"all would echo the blue opal."*
    ctx.globalCompositeOperation = "overlay";
    ctx.fillStyle = FIELD_SOURCE_TINT;
    ctx.fillRect(0, 0, FIELD_TEX_W, FIELD_TEX_H);
    ctx.globalCompositeOperation = "source-over";

    applyGrainTint();

    const sampled = new THREE.CanvasTexture(canvas);
    sampled.colorSpace = THREE.SRGBColorSpace;
    sampled.wrapS = THREE.ClampToEdgeWrapping;
    sampled.wrapT = THREE.ClampToEdgeWrapping;
    sampled.repeat.set(1 / 6, 1);
    sampled.anisotropy = 4;
    sampled.needsUpdate = true;
    return sampled;
  }

  // ── PROCEDURAL FALLBACK, below ─────────────────────────────────────────────
  // Runs on the first frame before the image loads, and permanently if it fails.
  // Kept rather than deleted: it is a complete, self-contained field in the same
  // palette, so a failed image load degrades to something coherent rather than to
  // flat grey.

  // Texture space: x runs 0..6 in u, y runs 0..1 in v. Canvas y is DOWN and UV v
  // is UP, so v is flipped when converting.
  const px = (u: number) => (u / 6) * FIELD_TEX_W;
  const py = (v: number) => (1 - v) * FIELD_TEX_H;

  /** `r, g, b` from a hex constant, so alpha variants never duplicate a colour. */
  const rgbOf = (hex: string) => {
    const c = new THREE.Color(hex);
    return `${Math.round(c.r * 255)}, ${Math.round(c.g * 255)}, ${Math.round(c.b * 255)}`;
  };
  const bodyRGB = rgbOf(FIELD_BODY);

  // Base: the deep tone everywhere. Everything else sits on top of it.
  ctx.fillStyle = FIELD_DEEP;
  ctx.fillRect(0, 0, FIELD_TEX_W, FIELD_TEX_H);

  const litRGB = rgbOf(FIELD_LIT);

  // ── The ribbon, drawn column by column ─────────────────────────────────────
  //
  // ⚠ ONE VERTICAL GRADIENT PER COLUMN, centred on the crest at that u. This is
  // what makes it a flowing band rather than a spot: the gradient's CENTRE MOVES
  // as u advances, tracing `FIELD_CREST`, so the light sweeps across the field
  // instead of sitting in one place.
  //
  // Drawn as narrow vertical strips rather than as a filled path, because a path
  // would need its own edge treatment and an edge is exactly what a satin ribbon
  // must not have. A per-column gradient has no boundary at all — only a moving
  // centre.
  const STRIP_PX = 2;
  for (let sx = 0; sx < FIELD_TEX_W; sx += STRIP_PX) {
    const u = (sx / FIELD_TEX_W) * 6;
    const crestV = crestAt(u);

    // Vertical gradient for this column: lit at the crest, body at the edge of the
    // core, deep beyond the falloff. Both directions from the crest, so the ribbon
    // is symmetrical about its own path.
    const topV = Math.min(1, crestV + FIELD_CREST_FALLOFF_V);
    const botV = Math.max(0, crestV - FIELD_CREST_FALLOFF_V);
    const g = ctx.createLinearGradient(0, py(topV), 0, py(botV));

    // Stop positions are fractions along top->bottom of this column's span.
    const span = topV - botV;
    const at = (v: number) => (topV - v) / span;

    g.addColorStop(0, FIELD_DEEP);
    g.addColorStop(Math.max(0, at(crestV + FIELD_CREST_CORE_V)), FIELD_BODY);
    g.addColorStop(at(crestV), FIELD_LIT);
    g.addColorStop(Math.min(1, at(crestV - FIELD_CREST_CORE_V)), FIELD_BODY);
    g.addColorStop(1, FIELD_DEEP);

    ctx.fillStyle = g;
    ctx.fillRect(sx, 0, STRIP_PX + 1, FIELD_TEX_H);
  }

  // A second, fainter ribbon offset below the first — the reference has more than
  // one band, and a single ribbon on a 6:1 field leaves the far corners flat.
  // Deliberately weak: it adds incident, not a second event.
  ctx.globalCompositeOperation = "lighter";
  for (let sx = 0; sx < FIELD_TEX_W; sx += STRIP_PX) {
    const u = (sx / FIELD_TEX_W) * 6;
    const crestV = crestAt(u) - 0.46;
    const topV = crestV + 0.34;
    const botV = crestV - 0.34;
    const g = ctx.createLinearGradient(0, py(topV), 0, py(botV));
    g.addColorStop(0, `rgba(${litRGB}, 0)`);
    g.addColorStop(0.5, `rgba(${litRGB}, 0.20)`);
    g.addColorStop(1, `rgba(${litRGB}, 0)`);
    ctx.fillStyle = g;
    ctx.fillRect(sx, 0, STRIP_PX + 1, FIELD_TEX_H);
  }
  ctx.globalCompositeOperation = "source-over";

  // A very gentle body lift toward the far right, so the outer end of the right
  // column never goes flat. Derived from FIELD_BODY — an earlier version hardcoded
  // the then-current RGB and silently stopped matching when the palette moved.
  const counter = ctx.createLinearGradient(px(3.4), 0, px(6), 0);
  counter.addColorStop(0, `rgba(${bodyRGB}, 0)`);
  counter.addColorStop(1, `rgba(${bodyRGB}, 0.30)`);
  ctx.fillStyle = counter;
  ctx.fillRect(0, 0, FIELD_TEX_W, FIELD_TEX_H);

  applyGrainTint();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;

  // ⚠ BOTH AXES CLAMP. u runs 0..~5.95 because the field is 6x wider than tall,
  // and the instinct is to set `wrapS = RepeatWrapping` for that. **That is wrong
  // and was measured wrong**: with repeat, each box showed the light gesture
  // TILED THREE TIMES instead of one region of a continuous field — which is the
  // opposite of the windows model, four copies of one crop rather than four
  // different views.
  //
  // The texture is already DRAWN across the full 0..6 u range (`px()` above maps
  // u/6 to the canvas width), so there is nothing to repeat. `repeat.x = 1/6`
  // rescales the sampler to match, and clamping on both axes guarantees no tiling
  // if a UV ever lands marginally outside.
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.repeat.set(1 / 6, 1);
  texture.anisotropy = 4;
  texture.needsUpdate = true;
  return texture;
}

/**
 * Own the field texture for the canvas's lifetime and attach it to the four FACE
 * materials.
 *
 * ⚠ LIFECYCLE COPIED FROM `useStudioEnvMap`, and for the same reasons: allocate in
 * an EFFECT not a `useMemo` (so React Strict Mode's double-invoke cannot strand an
 * allocation), **detach from every material BEFORE disposing** (so a disposed
 * texture can never be sampled), and `invalidate()` on both attach and detach
 * because the canvas runs `frameloop="demand"`.
 *
 * ⚠ ONE TEXTURE, FOUR MATERIALS — the deliberate divergence from `useStudioEnvMap`.
 * The env map is genuinely per-material; this is one surface seen through four
 * apertures, and the apertures live in the GEOMETRY's UVs. So a single texture
 * object is shared and there is nothing per-box to vary.
 */
function useFieldTexture(
  count: number,
): Array<React.RefObject<THREE.MeshStandardMaterial | null>> {
  const invalidate = useThree((state) => state.invalidate);
  // A lazy `useState` initialiser, not `useRef`: the array itself is read during
  // render (passed to children as refs), and `react-hooks/refs` correctly rejects
  // reading `.current` there. Only the container is state.
  const [faceMaterials] = useState(() =>
    Array.from({ length: count }, () => ({
      current: null as THREE.MeshStandardMaterial | null,
    })),
  );

  useEffect(() => {
    // Snapshot before mutating, so cleanup detaches exactly what this run
    // attached even if a ref's `current` has since changed.
    const attached = faceMaterials
      .map((ref) => ref.current)
      .filter((m): m is THREE.MeshStandardMaterial => m !== null);

    // ⚠ THE HEIGHT FIELD IS BUILT ONCE AND OUTLIVES THE COLOUR MAP. The colour map
    // is replaced when the source image loads; the grain does not depend on the
    // source at all, so rebuilding the normal map alongside it would burn a
    // full-texture Sobel pass to produce an identical result.
    const heightCanvas = buildFieldHeightCanvas();
    const normalMap = buildFieldNormalTexture(heightCanvas);

    /** Attach a texture to all four faces and present the result. */
    const apply = (texture: THREE.CanvasTexture) => {
      attached.forEach((material) => {
        material.map = texture;
        // The base colour must be white or it TINTS the map. `DIAG_FACE_COLOR` was
        // the whole appearance before; now the texture is, and colour is a
        // multiplier.
        material.color.set("#ffffff");
        material.normalMap = normalMap;
        // ⚠ `normalScale` is a Vector2 and BOTH components matter. Setting only x
        // leaves y at its default 1, which would make the grain ~33x stronger
        // across the short axis than the long one — a stretched, directional
        // shimmer rather than an even satin.
        material.normalScale.set(FIELD_GRAIN_RELIEF, FIELD_GRAIN_RELIEF);
        material.needsUpdate = true;
      });
      invalidate();
    };

    // Draw the procedural field immediately, so there is never an untextured
    // frame, then upgrade to the sampled source when it loads.
    let current = buildFieldColourTexture(undefined, heightCanvas);
    apply(current);

    // ⚠ LOADED, NOT BUNDLED. The source is a 17 KB JPEG served from `public/`, so
    // it is fetched once and cached. It is deliberately NOT blocking: if it never
    // arrives, the procedural field stays and the page is coherent.
    let cancelled = false;
    const img = new Image();
    img.onload = () => {
      if (cancelled) return;
      const sampled = buildFieldColourTexture(img, heightCanvas);
      const previous = current;
      current = sampled;
      apply(sampled);
      // Dispose the procedural one only AFTER the replacement is attached, so no
      // material ever references a disposed texture.
      previous.dispose();
    };
    img.src = FIELD_SOURCE_URL;

    return () => {
      cancelled = true;
      attached.forEach((material) => {
        material.map = null;
        material.normalMap = null;
        material.needsUpdate = true;
      });
      // Detach BEFORE disposing, both maps — a disposed texture must never still
      // be referenced by a live material.
      current.dispose();
      normalMap.dispose();
      invalidate();
    };
  }, [faceMaterials, invalidate]);

  return faceMaterials;
}

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
  /**
   * The rim's LIT fraction, 0..1 — the progressive-rim signal, multiplied into
   * the entrance's own ramp. 1 restores the pre-chunk-B behaviour exactly.
   */
  lit = 1,
  /** This box's unlit resting fraction — see `RIM_UNLIT_FLOOR_AB`. */
  unlitFloor = 0,
) {
  if (!material) return;
  // ⚠ MULTIPLIED INTO the entrance ramp, not substituted for it. At lit = 1 the
  // expression reduces to `GOLD_BEVEL_ENV_INTENSITY * sqrt(progress)` — exactly
  // the pre-chunk-B behaviour — so the approved entrance is unchanged for any
  // box whose rim is lit.
  material.envMapIntensity =
    GOLD_BEVEL_ENV_INTENSITY *
    Math.sqrt(progress) *
    (unlitFloor + (1 - unlitFloor) * lit);
}

// ── The progressive gold rim ─────────────────────────────────────────────────
//
// ⚠ THE RIM IS A WAYFINDER, NEVER PERMISSION. Carl's ruling, recorded in
// `live-work/progressive-rim-and-text-input-reference.md`: *"The most important
// concept is the user gets a sense of being guided along. There is a direction
// here."* Nothing is gated by an unlit rim — every box is always focusable and
// typeable, and Send never consults rim state.
//
// ⚠ AND IT IS NOT THE Q&A FILAMENT, despite looking like it. D-029 draws on
// SELECTION — a response to something done TO that element, ON that element.
// Here box 2's rim responds to something that happened in box 1: it points away
// from itself, at a box the user has not touched. A cue about ELSEWHERE reads as
// direction, which is why the no-gating rule is what makes it safe.
//
// ⚠ NOT MASKING. A masked box (`FIELD_ENTRANCES[i] === null`) does not exist at
// all — no fade, no geometry, nothing to type into. That would break the
// no-gating rule outright. All four boxes arrive complete, with their satin
// field; only the GOLD is withheld.

/**
 * An unlit box's gold. ⚠ ZERO — SETTLED 31 July 2026, on principle rather than by
 * waiting for the light.
 *
 * **Carl's statement of the concept, which is what decided it:**
 *
 * > *"Box 1 when it appears should have a gold rim. Boxes 2, 3 + 4 shouldn't.
 * > **Only the potential to have a gold rim.** It is when box 1 is triggered that
 * > that potential is realised, and it fades in. In the Q+A the gold rim makes a
 * > journey, a circuit. In client info, they fade in by a trigger."*
 *
 * ⚠ THIS RESOLVED THE A/B AND SHOWED IT WAS NOT AN A/B AT ALL. Two treatments had
 * been built for comparison under the orbiting light — fully dark on boxes 1+3, a
 * 0.22 dim-gold floor on 2+4 — on the assumption that both expressed the same
 * idea at different strengths. **They do not.** A dim floor says *some gold now,
 * more later*; the concept requires *no gold now, gold when triggered*. **A
 * reduced amount of the thing is not the potential for the thing.**
 *
 * ⚠ AND THE DEFECT SURFACED THROUGH CARL'S READING, NOT THROUGH A MEASUREMENT.
 * He looked at the correct, as-specified resting state and reported *"all 4 rims
 * are visible. Only Box 1 should be."* The three brightness levels were all
 * present and rendering exactly as written — but if the person who specified the
 * behaviour reads the resting state as *everything is lit*, the unlit states are
 * not communicating. **Visible is not the same as lit, and the design has to win
 * that distinction on sight rather than on explanation.**
 *
 * ⚠ BUT NOT ZERO EITHER — and this is Carl's correction to the Builder's first
 * attempt at implementing the concept:
 *
 * > *"What you could do is turn the intensity of the gold right down. **If it is
 * > black it will merge into the background.** If it's gold but turned right down,
 * > so it's barely seen by the human eye, turning it up with the fade will achieve
 * > the same effect."*
 *
 * ⚠ AT ZERO THE BEVEL IS BLACK METAL ON A NEAR-BLACK PAGE, so an unlit box loses
 * its edge and the shape dissolves. Carl's earlier *"low in the mix"* reading was
 * pointing at exactly this: the rim was present, but only because the background
 * is not quite black.
 *
 * A very low gold keeps the material's IDENTITY. The box holds a defined edge and
 * reads as a finished object waiting, and the trigger becomes a **continuous
 * intensification of one thing** rather than a substance appearing from nothing —
 * which is what "the potential is realised" describes.
 *
 * ⚠ THE DIFFERENCE FROM THE REJECTED 0.22 FLOOR IS LEVEL, NOT CONCEPT. 0.22 said
 * *some gold now, more later*. This says *the form is there, the light is not yet*.
 *
 * ⚠ CURRENT AND BEST-JUDGED, NOT APPROVED. Carl judges the level by eye — it has
 * to be barely visible without merging into the background.
 *
 * ⚠ Kept as a per-box array rather than collapsed to one constant, so a future
 * per-box exception stays cheap. All four are deliberately identical.
 */
const RIM_UNLIT_FLOOR_AB: number[] = [0.05, 0.05, 0.05, 0.05];

/**
 * How long an unlit rim takes to reach full gold, and vice versa.
 *
 * ⚠ ITS OWN CONSTANT, NOT THE ENTRANCE'S. The design record is explicit that
 * inheriting 3000ms would couple this to timings Carl has NOT approved — his
 * standing reservation is that the entrance overlap is less discernible than he
 * wants. Tuning a second feature to a rejected value propagates the defect.
 *
 * ⚠ AND A RIM LIGHTING ON AN ALREADY-VISIBLE BOX IS NOT A BOX MATERIALISING FROM
 * NOTHING. 3000ms is right for the latter; this is shorter deliberately.
 * **CURRENT AND BEST-JUDGED, NOT APPROVED** — Carl judges it by eye.
 */
const RIM_LIGHT_MS = 900;

/**
 * The live lit fraction per box, shared by BOTH loops that write
 * `envMapIntensity`.
 *
 * ⚠ ONE OBJECT, NOT TWO COPIES. `useEntranceCascade` and `useProgressiveRim` both
 * write the bevel's intensity — the entrance during its fade, the rim whenever
 * `filled` changes — and they overlap in time whenever a user types while boxes
 * are still arriving. Two separate copies of this state would disagree for
 * exactly as long as the overlap lasts, and the symptom would be a box flashing
 * to the wrong brightness for a few frames: visible, intermittent, and very hard
 * to attribute later.
 *
 * A module-scope ref is deliberate over React state: it is written every frame by
 * an rAF loop, and putting it in state would re-render the whole scene per frame
 * — the opposite of what `frameloop="demand"` exists for.
 */
// ⚠ `number[]`, not the `(0|1)[]` TypeScript infers from the initialiser: these
// hold FRACTIONS while a rim is in transit between unlit and lit.
const rimLitState: { current: number[] } = {
  current: FIELD_SLOTS.map((_, i) => (i === 0 ? 1 : 0)),
};

/**
 * Drives the four entrance fades on the approved contract.
 *
 * ⚠ THIS IS THE ONLY ANIMATION IN THIS CANVAS, AND IT IS BOUNDED. The canvas
 * runs `frameloop="demand"` precisely so a static scene does not spin a 60fps
 * loop. That constraint is preserved rather than abandoned: the loop runs only
 * while the cascade is in flight and stops itself once the last box reaches full
 * opacity. The scene is static before 3600ms and static again after
 * `FIELD_ENTRANCE_END_MS` (8100ms at the current values). ⚠ Derived, not written:
 * an earlier version of this line hard-coded 5800ms and went stale when the
 * cascade was retimed.
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
        //
        // ⚠ THE RIM'S LIT FRACTION IS APPLIED HERE TOO, or a box would arrive at
        // FULL gold and only dim once the rim loop ran — a visible flash of the
        // wrong state on every entrance. `litNow` is read from the same ref the
        // rim loop owns, so the two agree frame by frame.
        setBevelEnvIntensity(
          bevelMaterials[i]?.current ?? null,
          progress,
          rimLitState.current[i] ?? 1,
          RIM_UNLIT_FLOOR_AB[i] ?? 0,
        );
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

/**
 * Which boxes' rims should be lit, from which boxes hold content.
 *
 * ⚠ BOX 1 IS ALWAYS LIT. Carl: *"The rim will only be on Box 1 when the boxes
 * appear."* It is the entry point, so it needs no antecedent.
 *
 * ⚠ BOX N+1 LIGHTS ON ONE CHARACTER IN BOX N. Carl overruled the Builder's
 * count-based reasoning here: *"Change to 1 letter... The whole idea while in Box
 * 1 is to say, 'this is next'. Not to start inputting in Box 2 then it appears."*
 * The Builder had read the trigger as COMPLETION logic — *box N is done enough,
 * so box N+1 unlocks* — which is why it kept proposing character counts and
 * leave-the-box fallbacks. **That was the wrong model.** The cue announces what
 * is next WHILE the user is still in box N, so it fires as early as it honestly
 * can. One character dissolves the edge cases rather than moving them: no
 * threshold means no answer is ever too short.
 *
 * ⚠ REVERSIBLE, NOT A LATCH. Emptying box N unlights box N+1. Carl ruled against
 * the Builder's latch proposal on consistency with approved work: the D-029
 * filament is reversible on deselect, and a rim that latches here would behave
 * differently from the same visual language two screens earlier. **The rim is a
 * function of CURRENT input, not a memory of what happened** — which is also why
 * `filled` is derived from state rather than from events, and why paste,
 * dictation, IME and browser-restore need no special handling.
 */
function rimLitFromFilled(filled: boolean[]): boolean[] {
  // ⚠ A FILLED BOX IS ALWAYS LIT, regardless of what precedes it.
  //
  // Found by Carl, 31 July 2026, on a real autofill: *"Using autofill and I can
  // input into boxes 1, 2 + 4. Boxes 1, 2 + 3 are on but not 4."* Chrome's address
  // profiles hold no website field, so box 3 stays empty and boxes 1, 2 and 4 fill.
  //
  // ⚠ THE ORIGINAL RULE — light box N when box N-1 has content — PRODUCED EXACTLY
  // THAT, AND IT WAS CORRECT BY ITS OWN LOGIC. Box 3's rim lit from box 2's
  // content; box 4's did not, because box 3 was empty. **The result on screen was
  // an empty box wearing a gold rim beside a completed box with none — the one
  // field the user had actually finished looked like the one they had not.**
  //
  // The rule was designed for sequential typing, where an empty box means *you
  // have not reached it yet*. Under autofill an empty box in the middle means
  // *the browser had nothing for that field* — nothing was skipped, and everything
  // after it is genuinely done.
  //
  // ⚠ THIS IS NOT A NEW PRINCIPLE, it is the wayfinder one applied honestly: the
  // rim shows where you are and where you are going. A box's OWN content is the
  // strongest evidence it is complete — stronger than any inference from its
  // neighbour. So: box 1 always, or this box has content, or the box before it
  // does (the "here is next" pointer).
  return FIELD_SLOTS.map(
    (_, i) => i === 0 || filled[i] === true || filled[i - 1] === true,
  );
}

/**
 * Animate each bevel between its unlit floor and full gold as `filled` changes.
 *
 * ⚠ IT SHARES `envMapIntensity` WITH `useEntranceCascade`, which writes the same
 * property every frame while the cascade runs. They compose rather than fight:
 * the entrance owns `progress`, this owns `lit`, and `setBevelEnvIntensity`
 * multiplies them. This loop reads the box's CURRENT entrance progress so it
 * cannot undo the cascade mid-flight.
 *
 * ⚠ `frameloop="demand"` IS PRESERVED. The loop runs only while a rim is in
 * transit and stops itself when every rim has settled — the same discipline
 * `useEntranceCascade` documents. A rim that is neither lighting nor unlighting
 * costs nothing.
 */
function useProgressiveRim(
  bevelMaterials: Array<React.RefObject<THREE.MeshStandardMaterial | null>>,
  filled: boolean[],
  active: boolean,
  reducedMotion: boolean,
) {
  const invalidate = useThree((state) => state.invalidate);
  const startedRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active) {
      startedRef.current = null;
      return;
    }
    if (startedRef.current === null) {
      startedRef.current = performance.now();
      // ⚠ RESET THE SHARED STATE AT THE START OF EACH ACTIVATION.
      //
      // `rimLitState` is MODULE-LEVEL, so it outlives the component: it is shared
      // by the two loops that write `envMapIntensity` and must not be re-created
      // per render. The cost of that is that it also survives a remount, and a
      // second activation would resume from whatever the rims last were rather
      // than from box-1-only.
      //
      // ⚠ OBSERVED IN DEV, 31 July 2026, and it is why this reset exists. A hot
      // reload re-evaluated the component while keeping the old module instance,
      // stranding every rim at fully lit — Carl saw four gold rims on an empty
      // form. A hard reload cleared it, which is what identified the cause.
      //
      // Production has no hot reload, and `canvasWarm` only ever goes false->true
      // so the canvas currently mounts once per session. ⚠ BUT THAT IS A PROPERTY
      // OF THE CALL SITE, NOT OF THIS MODULE. Relying on it would leave a future
      // change elsewhere free to reintroduce the fault silently.
      rimLitState.current = FIELD_SLOTS.map((_, i) => (i === 0 ? 1 : 0));
    }

    const target = rimLitFromFilled(filled).map((b) => (b ? 1 : 0));

    /**
     * The box's entrance progress right now, so this loop multiplies against the
     * cascade's own value instead of assuming 1 and flashing a box to full gold
     * before it has finished arriving.
     */
    const entranceProgressAt = (i: number, elapsed: number) => {
      const e = FIELD_ENTRANCES[i];
      if (!e) return 0;
      if (reducedMotion) return 1;
      return Math.min(1, Math.max(0, (elapsed - e.delay) / e.duration));
    };

    if (reducedMotion) {
      // No transit under reduced motion — jump to the target and present once.
      rimLitState.current = target.slice();
      target.forEach((t, i) =>
        setBevelEnvIntensity(bevelMaterials[i]?.current ?? null, 1, t, RIM_UNLIT_FLOOR_AB[i] ?? 0),
      );
      invalidate();
      return;
    }

    let raf = 0;
    let last = performance.now();
    const tick = () => {
      const now = performance.now();
      const dt = now - last;
      last = now;
      const elapsed = now - (startedRef.current ?? now);
      let settled = true;

      for (let i = 0; i < FIELD_SLOTS.length; i++) {
        const cur = rimLitState.current[i];
        const want = target[i];
        let next = cur;
        if (cur !== want) {
          const step = dt / RIM_LIGHT_MS;
          next = want > cur ? Math.min(want, cur + step) : Math.max(want, cur - step);
          rimLitState.current[i] = next;
          if (next !== want) settled = false;
        }
        setBevelEnvIntensity(
          bevelMaterials[i]?.current ?? null,
          entranceProgressAt(i, elapsed),
          next,
          RIM_UNLIT_FLOOR_AB[i] ?? 0,
        );
      }

      invalidate();
      if (!settled) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [filled, active, reducedMotion, bevelMaterials, invalidate]);
}

function FieldScene({
  reducedMotion,
  active,
  filled,
  lightRigOn,
}: {
  reducedMotion: boolean;
  active: boolean;
  filled: boolean[];
  /**
   * ⚠ TEST RIG ONLY. `undefined` means the rig is not mounted, which is the case
   * on every ordinary page load; a boolean is the probe light's on/off state.
   */
  lightRigOn?: boolean;
}) {
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

  // Owns the shared field texture and hands back one ref per box's FACE material.
  // One texture, four apertures — the windows live in the geometry's UVs, not here.
  const faceMaterialRefs = useFieldTexture(FIELD_SLOTS.length);

  // The layer's measured CSS box, tracked by R3F. This is the whole responsive
  // story: width changes flow into the placement maths automatically.
  const size = useThree((state) => state.size);
  const placements = useMemo(
    () => fieldPlacements(size.width, size.height),
    [size.width, size.height],
  );

  // The shared field all four boxes are windows onto. Memoised on the same
  // measured size as the placements, and passed to all four — one field, four
  // apertures. Derived from `fieldPlacements` output inside `sharedFieldWindow`,
  // so it cannot drift from where the boxes actually are.
  const field = useMemo(
    () => sharedFieldWindow(size.width, size.height),
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

  // ⚠ TEST RIG ONLY. 1 on every ordinary load — the base lights are untouched
  // unless the probe is mounted.
  const baseScale = lightRigOn === undefined ? 1 : BASE_LIGHT_SCALE;

  useEntranceCascade(groups, baseYs, bevelMaterialRefs, reducedMotion, active);
  // ⚠ AFTER the cascade hook, deliberately. Both write `envMapIntensity`; this one
  // reads the cascade's current progress and multiplies rather than overwrites,
  // so a rim change mid-entrance cannot undo the fade in flight.
  useProgressiveRim(bevelMaterialRefs, filled, active, reducedMotion);

  return (
    <>
      {/* Existing key/fill/ambient rig — UNCHANGED. The studio map adds
          something for the metal to REFLECT; it does not relight the scene and
          is never assigned to `scene.environment`. */}
      {/* ⚠ THE BASE RIG IS DIMMED WHILE THE PROBE RUNS — `baseScale` is 1 on every
          ordinary load, so these three are unchanged in behaviour there. The key
          light rakes from the upper left at intensity 1.6 and lifts exactly the
          part of the face that should fall into shadow at the top of the probe's
          arc, so leaving it at full would wash out the thing being tested. */}
      <ambientLight intensity={AMBIENT_INTENSITY * baseScale} />
      <directionalLight
        position={KEY_LIGHT_POSITION}
        intensity={KEY_LIGHT_INTENSITY * baseScale}
      />
      <directionalLight
        position={FILL_LIGHT_POSITION}
        intensity={FILL_LIGHT_INTENSITY * baseScale}
      />
      {/* ⚠ TEST RIG ONLY — absent unless `?lightrig=1`. */}
      {lightRigOn !== undefined && <LightRigScene lightOn={lightRigOn} />}
      {placements.map((placement, i) => (
        <ContactField
          key={placement.id}
          placement={placement}
          field={field}
          groupRef={groups[i]}
          bevelMaterialRef={bevelMaterialRefs[i]}
          faceMaterialRef={faceMaterialRefs[i]}
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
export default function ContactFieldCanvas({
  active,
  filled = [],
}: {
  active: boolean;
  /**
   * Which boxes currently hold content, in `FIELD_SLOTS` order — from
   * `ContactFieldInputs`, lifted through `enquiry-opening.tsx` because the two are
   * siblings. Drives the progressive rim. Defaults to empty so the canvas still
   * renders standalone.
   */
  filled?: boolean[];
}) {
  const [reducedMotion] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  /**
   * ⚠ TEST RIG ONLY — on by default on localhost, never on a deployed build.
   *
   * A lazy initialiser for the same reason `reducedMotion` is one — it must be
   * settled before the first frame, and this component only ever mounts
   * client-side.
   *
   * ⚠ THE HOSTNAME CHECK IS THE GATE, NOT THE QUERY PARAMETER. Carl asked to see
   * the orbit on localhost without appending a flag every time (3 August 2026).
   * Deployed builds are unchanged and still require `?lightrig=1`, because two
   * things make it unfit for production as it stands:
   *
   *   1. `useLightRig` binds SPACEBAR to toggle the light. On a deployed page
   *      that key belongs to the user — it scrolls, and it activates a focused
   *      button. A visitor would toggle a test rig by pressing space.
   *   2. The orbit runs a continuous rAF loop, so the canvas cannot sit in
   *      `frameloop="demand"` while it is on — a phone renders WebGL for as long
   *      as the section is on screen.
   *
   * ⚠ AND THE ORBIT IS PROVISIONAL (D-044) — crown depth, grain tint and the 3s
   * hidden half are takes, not decisions. Promoting it to production is a design
   * call for Carl under the mastering methodology (D-035), not a config change.
   *
   * `?lightrig=0` forces it off locally; the parameter still forces it on anywhere.
   */
  const [lightRigEnabled] = useState(() => {
    if (typeof window !== "undefined") {
      const flag = new URLSearchParams(window.location.search).get("lightrig");
      if (flag !== null) return flag === "1";
      const { hostname } = window.location;
      return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]";
    }
    return false;
  });
  const { lightOn: rigLightOn } = useLightRig(lightRigEnabled);

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
        // for the entrance alone (~4.5s at the current values — box 1's start to
        // box 4's end) and at no other time. The original reason for choosing
        // demand — do not spin a loop behind a static image — is preserved rather
        // than discarded. ⚠ An earlier version of this line said "~2.2s" and went
        // stale when the cascade was retimed.
        frameloop="demand"
        style={{ pointerEvents: "none" }}
      >
        <FieldScene
          reducedMotion={reducedMotion}
          active={active}
          filled={filled}
          lightRigOn={lightRigEnabled ? rigLightOn : undefined}
        />
      </Canvas>
    </div>
  );
}
