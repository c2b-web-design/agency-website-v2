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

import * as THREE from "three";

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
 * ⚠ NOT AN APPROVED VALUE. Adjustable; PROVISIONAL under D-035.
 */
export const GLASS_ROUGHNESS = 0.28;

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

// ── The calibration stand-in ────────────────────────────────────────────────
//
// ⚠ THROWAWAY. Carl: *"The stand-in is throwaway, this is so we can judge the
// frosted glass and legibility. Place it where you see fit."* It is deleted in
// chunk 3, when the real logo backdrop is designed.
//
// ⚠ A TEST PATTERN, NOT THE c2b MARK — AND THE SWERVE WAS FORCED BY
// MEASUREMENT, not preference. The plan's first revision proposed placing the
// whole mark behind one card and judging its legibility, on a claimed 4.24px
// thinnest stroke. That figure came from a SINGLE mid-line scan of the mask and
// was wrong. Scanning the whole mark:
//
//    thinnest stroke   14px of a 566px-tall mark   (ratio 0.0247)
//    at the proposed 32px placement                 0.79px on screen
//
// ⚠ A 4px STROKE NEEDS THE MARK ~162px TALL — FIVE TIMES THE FACE'S HEIGHT. The
// whole mark cannot sit behind one card and stay readable at any frost level, so
// the test as designed could not have worked.
//
// ⚠ THE PATTERN ANSWERS A SHARPER QUESTION THAN THE LOGO COULD: "at what stroke
// width does this frost destroy detail?" That is a number rather than a
// preference, and it hands chunk 3 arithmetic instead of a guess —
//
//    required mark height = strokeWidth / 0.0247
//
// so a mark spanning the grid's full 576px width gives a 7.18px stroke. The end
// state is fine; only the one-card placement was not.

/**
 * Stroke widths in the calibration pattern, in CSS pixels.
 *
 * Chosen to bracket the range chunk 3 will care about: 2px is below anything the
 * real mark would use at grid scale, 8px is comfortably above the 7.18px a
 * full-width mark produces.
 */
export const STANDIN_STROKE_WIDTHS = [2, 4, 6, 8] as const;

/**
 * The corridor's own two colours, read from `app/globals.css`.
 *
 * ⚠ NO AMBER. That belongs to the filament (chunk 4) and would compete with the
 * event the card is meant to stage.
 *
 * ⚠ AND NO MOTION. A moving backdrop is chunk 3's design question, and it would
 * confound a legibility reading.
 */
export const STANDIN_BLUE = "#163a8f";
export const STANDIN_TEAL = "rgb(125, 210, 205)";

/**
 * Build the calibration texture: a blue-to-teal ramp with vertical strokes of
 * known widths laid across it.
 *
 * `pixelRatio` renders the canvas larger than its world size so the strokes are
 * not themselves destroyed by texture sampling before the glass ever sees them —
 * the pattern must be sharp going in for the frost's effect on it to mean
 * anything.
 *
 * ⚠ THE RESULTING TEXTURE GOES ON AN OPAQUE MATERIAL. See `standInMaterial`.
 */
export function buildStandInTexture(
  widthPx: number,
  heightPx: number,
  pixelRatio = 4,
): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(widthPx * pixelRatio));
  canvas.height = Math.max(1, Math.round(heightPx * pixelRatio));

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2d context unavailable for the stand-in texture");

  ctx.scale(pixelRatio, pixelRatio);

  // Blue -> teal ramp, left to right: the corridor's two colours, the same axis
  // the real backdrop will use.
  const ramp = ctx.createLinearGradient(0, 0, widthPx, heightPx);
  ramp.addColorStop(0, STANDIN_BLUE);
  ramp.addColorStop(1, STANDIN_TEAL);
  ctx.fillStyle = ramp;
  ctx.fillRect(0, 0, widthPx, heightPx);

  // Strokes in a light tint of the same family, so contrast comes from value
  // rather than from a foreign hue.
  ctx.fillStyle = "#e8f4ff";

  // Lay the strokes out with generous gaps, so the frost blurring one into its
  // neighbour is itself visible.
  const groupWidth = STANDIN_STROKE_WIDTHS.reduce((sum, w) => sum + w, 0);
  const gaps = STANDIN_STROKE_WIDTHS.length + 1;
  const gap = (widthPx - groupWidth) / gaps;

  let x = gap;
  for (const w of STANDIN_STROKE_WIDTHS) {
    ctx.fillRect(x, heightPx * 0.15, w, heightPx * 0.7);
    x += w + gap;
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

/**
 * The stand-in's material.
 *
 * ⚠ IT MUST BE OPAQUE, AND ON BOTH COUNTS — `transmission: 0` AND
 * `transparent: false`.
 *
 * The transmission pass renders `opaqueObjects` ONLY (`three.module.js:18039`),
 * and the render-list split at `:8237` sends a material to the TRANSPARENT list
 * whenever `transparent === true`, entirely independently of transmission. So an
 * object is invisible to the glass if it is EITHER transmissive OR transparent.
 *
 * ⚠ THIS IS WHY THERE IS NO "STAND-IN OPACITY" CONTROL ON THE RIG. Driving
 * opacity requires `transparent: true`, which would remove the backdrop from
 * what the glass can see. It would present as "the frost went completely flat"
 * WITH EVERY ASSERTION STILL GREEN — the same class of silent failure as chunk
 * 1's inverted winding, where a flipped normal had the same |normal.z| and every
 * check passed.
 *
 * Brightness, if it is ever needed, must be a colour lerp inside the texture —
 * never `material.opacity`.
 *
 * `MeshBasicMaterial` rather than a lit one: this is a thing to be SEEN THROUGH
 * the glass, and lighting it would make the reading depend on the diagnostic
 * light rig as well as on the frost.
 */
export function standInMaterial(texture: THREE.Texture): THREE.MeshBasicMaterial {
  return new THREE.MeshBasicMaterial({
    map: texture,
    toneMapped: false,
    transparent: false,
    side: THREE.FrontSide,
  });
}

/**
 * How far behind the card's face the stand-in sits, in world units (= CSS px).
 *
 * Far enough that it reads as a separate surface behind the glass rather than
 * as a texture painted on it; close enough to stay inside the card's silhouette
 * under an orthographic camera (where there is no perspective divergence, so
 * this distance does not change its apparent size at all).
 */
export const STANDIN_DEPTH = 10;
