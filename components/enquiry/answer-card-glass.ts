/**
 * Q&A answer-card glass — material constants, the locally generated environment
 * map's studio constants, and the throwaway calibration stand-in.
 *
 * ⚠ CHUNK 2 OF THE CARD REBUILD: THE FACE'S MATERIAL ONLY. The rim and bevel
 * stay in chunk 1's diagnostic grey. Colouring them in the same chunk that
 * introduces glass would mix two variables Carl could otherwise separate, and it
 * contradicts chunk 1's own argument that grey exists so a form defect cannot
 * hide behind a plausible colour.
 *
 * Carl's specification, 3 August 2026: *"Should the glass be clear? No, it
 * should be slightly frosted but not enough that the logo cannot be legible or
 * read."*
 */

// ⚠ NO `three` IMPORT ANY MORE. This module is now pure constants — the two
// functions that needed THREE (`buildStandInTexture`, `standInMaterial`) went
// with the stand-in. See the tombstone at the foot of the file.

// ── ⚠ WHAT THIS MATERIAL ACTUALLY BUYS, STATED HONESTLY ─────────────────────
//
// The briefing calls the ingredient missing from the CSS card "something behind
// it to bend". ⚠ UNDER THIS CAMERA THERE IS ALMOST NOTHING TO BEND.
//
// `getVolumeTransmissionRay` refracts the view vector against the surface
// normal. An ORTHOGRAPHIC camera down -z gives v = (0,0,1) everywhere, so the
// crown centre sits at normal incidence and `refract()` returns pure -z: zero
// lateral displacement. Measured at ior 1.45 / thickness 6 against chunk 1's
// face (max tilt 23.70 degrees, read from mesh normals):
//
//    incidence   deviation   lateral displacement
//        0 deg     0.00 deg      0.000 px   <- the whole crown centre
//       10 deg     3.12 deg      0.327 px
//    23.70 deg     7.61 deg      0.801 px   <- the steepest point on the face
//
// Sub-pixel at the extreme, zero across the middle. Reaching 3px would need
// thickness ~22.5, which is 3.75x the face's actual depth.
//
// ⚠ SO WHAT WEBGL BUYS HERE IS NOT VISIBLE REFRACTION. It is that the blur
// responds to REAL SURFACE CURVATURE and REAL LIGHTING, and that the card and
// its backdrop sit in ONE LIT SCENE rather than being a stack of hand-painted
// CSS layers. That is a real payoff — but it is what Carl should be asked to
// judge, or he will look for a distortion the geometry cannot produce.
//
// ⚠ AND IT TIES THIS CHUNK'S VERDICT TO CHUNK 1'S PROVISIONAL CROWN: curvature
// is the only thing generating any incidence angle at all.

/**
 * Frost.
 *
 * ⚠ THIS IS THE ONE CONTROL THIS CHUNK EXISTS TO FIND. In
 * `MeshPhysicalMaterial`, transmission blur is driven by roughness through
 * `applyIorToRoughness`, which selects a mip level of the transmission sampler —
 * so higher roughness literally blurs what is seen THROUGH the glass.
 *
 * ⚠ IT MAY QUANTISE, AND THAT IS KNOWN IN ADVANCE. The transmission target is
 * sized from the viewport times `transmissionResolutionScale` (default 1.0,
 * `three.module.js:16283`) and this canvas is only ~195 x 56 CSS px. A 4px
 * stroke is ~4px in the sampled target: mip 1 blurs it to ~2px and mip 2
 * destroys it. There may be only two or three usable steps between "clear" and
 * "gone". **If that shows up the fix is `renderer.transmissionResolutionScale`,
 * not more roughness precision.**
 *
 * ⚠ LOWERED 0.28 -> 0.08 ON CARL'S INSTRUCTION, 3 August: *"dial down the
 * number that makes the glass frosted. I need to see it in a glass state so I
 * can see clearly what's underneath the glass."* And restated when it appeared
 * to have done nothing: *"make it glass, not frosted."*
 *
 * ⚠ IT HAD ALREADY DONE SOMETHING — THE SUBJECT WAS THE PROBLEM, NOT THE
 * CONTROL. Measured 3 August on a horizontal scanline through the card:
 *
 *     roughness 0.08 (default)   edge energy 4.50
 *     roughness 0    (forced)    edge energy 4.64
 *     roughness 0.45 (forced)    edge energy 1.06
 *
 * The control was working across its whole range. But the card was sitting over
 * the THROWAWAY STAND-IN — a smooth blue→teal ramp with no sharp features
 * anywhere in it — and **frost can only be seen destroying detail that exists.**
 * Over a pure gradient, clear glass and heavy frost are indistinguishable.
 *
 * ⚠ SO THE FIX WAS NOT A SMALLER NUMBER. It was putting the card over the real
 * lockup, in one shared scene, which is what the move into grid slot 1 does.
 *
 * **Still not a design decision.** This is the value at which the logo is
 * plainly readable through the glass, which is what Carl asked to see. Chunk 2's
 * measured band is 0 to ~0.45 legible, gone by 0.60; the frost level that SHIPS
 * is an open question for the mastering pass, and Carl's original specification
 * was *"slightly frosted but not enough that the logo cannot be legible."*
 *
 * ⚠ NOT AN APPROVED VALUE. Adjustable; PROVISIONAL under D-035.
 */
export const GLASS_ROUGHNESS = 0.08;

/**
 * How much light passes through rather than reflecting off.
 *
 * ⚠ RAISED 0.85 -> 0.97 AFTER THE FIRST RENDER, and the reason is a real
 * property of `MeshPhysicalMaterial` rather than a taste correction. The
 * fraction NOT transmitted behaves as an ordinary lit diffuse surface in
 * `color` — so at 0.85, fifteen percent of a mid-blue diffuse face sat on top of
 * everything, and the card rendered as a bright saturated plastic button
 * (measured rgb(10-50, 58-110, 148-187), peak luminance 215).
 *
 * ⚠ AND IT DESTROYED THE CHUNK'S OWN TEST. The calibration strokes registered as
 * a 13-point lift on a 148 base — barely legible, so the frost threshold could
 * not have been read off it.
 *
 * ⚠ NOT AN APPROVED VALUE. Adjustable; PROVISIONAL.
 */
export const GLASS_TRANSMISSION = 0.97;

/**
 * Volume thickness, for the transmission ray.
 *
 * ⚠ FIXED, NOT ADJUSTABLE — see the displacement table above. At this camera and
 * this curvature its maximum effect is 0.801px. Exposing it as a rig knob would
 * move a number and change nothing on screen, which is this project's own logged
 * trap (a measurable change the eye cannot see means the metric is not tracking
 * what is being judged).
 *
 * ⚠ AND IT IS IN PIXELS, NOT METRES. `getVolumeTransmissionRay` multiplies
 * thickness by the model's scale, and one world unit here is one CSS pixel. A
 * value tuned for a metre-scale scene would be wrong by orders of magnitude —
 * the same units trap that made the orbiting light rig need intensity 64000.
 *
 * ⚠ IT IS ALSO A CHOSEN FICTION, NOT A MEASUREMENT. Volume thickness is not the
 * face's depth; it is how far the shader pretends the ray travels inside the
 * material. 6 is chosen as the same order as the card's depth so the number is
 * not absurd, not because it was measured.
 */
export const GLASS_THICKNESS = 6;

/**
 * Index of refraction. Ordinary glass.
 *
 * ⚠ FIXED, NOT ADJUSTABLE — same reason as `GLASS_THICKNESS`. It scales a
 * displacement that is already sub-pixel.
 */
export const GLASS_IOR = 1.45;

/**
 * Body colour.
 *
 * ⚠ NEAR-WHITE, NOT THE CARD'S BLUE — and this is the correction that mattered
 * most after the first render. In `MeshPhysicalMaterial`, `color` does double
 * duty: it tints transmitted light AND acts as the diffuse albedo of the
 * fraction that is not transmitted. A mid-blue `#3e6cb2` therefore both dyed
 * everything behind the glass and painted a lit blue surface over it, giving a
 * saturated plastic button rather than glass.
 *
 * ⚠ AND THE TINT IS THE WRONG JOB FOR THIS PROPERTY ANYWAY. What is behind the
 * glass carries the colour — that is the whole premise of the backdrop, and in
 * chunk 3 it becomes the logo. Glass that dyes its own contents would make the
 * backdrop's colour movement unreadable.
 *
 * A faint blue cast is kept so the material still belongs to the corridor rather
 * than reading as clear window glass. `attenuationColor` is the correct property
 * for a stronger body tint if one is ever wanted, because it colours by DEPTH
 * travelled rather than flatly.
 */
export const GLASS_COLOR = "#e8eef8";

// ── The local studio environment map ────────────────────────────────────────
//
// ⚠ GENERATED ENTIRELY LOCALLY. A small scene of MeshBasicMaterial reflection
// panels converted by `PMREMGenerator.fromScene()` on the GPU. No HDRI, no CDN
// preset, no downloaded asset, no network request of any kind.
//
// ⚠ THAT PATH EXISTS BECAUSE THE OBVIOUS ONE FAILED IN THIS PROJECT ALREADY.
// Passing `preset` or `files` to drei's `Environment` triggers a remote fetch;
// a 301 redirect from the drei-assets host went unhandled inside Suspense and
// left the scene blank WITH NO CONSOLE ERROR. Do not reintroduce it.
//
// ⚠ THE PATTERN IS COPIED FROM `useStudioEnvMap` IN `contact-field-canvas.tsx`.
// THE VALUES ARE NOT. That rig's key is `#fff2dd` at intensity 7.0 — warm gold,
// tuned for a gold bevel. Blue glass needs a cool key, and the contact field's
// constants are `protected`: tuning this card must not move an approved object.
//
// ⚠ AND THE ENV MAP'S CONTRIBUTION IS BOUNDED BY THE SAME GEOMETRY AS THE
// REFRACTION. The specular that sells "glass" lives at grazing angles, and a
// near-flat face under an orthographic camera has none except a thin band near
// the crown's edge. The cool key is right; it will be judged on a small
// fraction of the face.

/** Radius of the black surround the panels sit inside. */
export const ENV_SHELL_RADIUS = 60;

/** Key panel — cool, standing in for a soft daylight source above and left. */
export const ENV_KEY_COLOR = "#dceaff";
export const ENV_KEY_INTENSITY = 5.5;

/** Fill panel — dimmer, cooler still, from below right. */
export const ENV_FILL_COLOR = "#9fb4d0";
export const ENV_FILL_INTENSITY = 1.1;

/** How strongly the face samples the environment map. */
export const GLASS_ENV_INTENSITY = 1.0;

// ── The calibration stand-in: DELETED, 3 August 2026 ────────────────────────
//
// ⚠ IT WAS ALWAYS THROWAWAY. Carl: *"the stand-in is throwaway, this is so we
// can judge the frosted glass and legibility. Place it where you see fit."* It
// is deleted here because the real lockup now sits behind the card, in the same
// scene, which is strictly better at the job the stand-in was standing in for.
//
// ⚠ AND ITS LAST ACT WAS TO MISLEAD, WHICH IS WORTH RECORDING. It was a smooth
// blue→teal ramp with no sharp features. Frost can only be seen destroying
// detail that exists, so over that ramp EVERY roughness value looked the same —
// and the card read as permanently frosted while the roughness control was
// working correctly across its whole range (edge energy 4.50 at 0.08, 1.06 at
// 0.45). Three exchanges went into "why is it still frosted" before the subject,
// rather than the control, was suspected.
//
// ⚠ THE GENERAL FORM, WHICH THIS PROJECT HAS NOW LOGGED THREE TIMES: a test
// fixture that cannot express the effect under test will report no effect. See
// also `verify/q5-stutter.mjs` sharing a constant with its own fix.
//
// What it held, should any of it be wanted again: STANDIN_STROKE_WIDTHS
// [2,4,6,8], STANDIN_BLUE #163a8f, STANDIN_TEAL rgb(125,210,205),
// STANDIN_DEPTH 10, `buildStandInTexture()` and `standInMaterial()`. All in git
// at commit 3038a34.

