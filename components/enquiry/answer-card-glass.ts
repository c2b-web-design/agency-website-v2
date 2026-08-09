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
 * The face's clearcoat — a polished skin over a frosted body.
 *
 * ⚠ ZERO TODAY, WHICH IS WHY IT IS DECLARED AT ALL. The face has never had a
 * clearcoat; the BEVEL has one (`BEVEL_CLEARCOAT` 0.45) and the face does not.
 * This constant exists so the rig can sweep it, not because a value has been
 * chosen. **Default 0 = today's behaviour exactly**, so nothing changes until
 * someone moves the fader.
 *
 * ⚠ THE MECHANISM, AND IT IS THE ONE THING THIS SESSION'S RESEARCH AGREED ON
 * FROM THREE INDEPENDENT DIRECTIONS: *"the INSIDE is blurry from high roughness,
 * but the SURFACE remains highly reflective."* A rough base scatters light across
 * the face as a gradient; a sharp coat over it keeps a crisp glint on the edge.
 * **One material, two effects** — which is how the reference sheets carry a soft
 * distribution and a hard hairline at the same time.
 *
 * ⚠ CARL READ THAT OFF THE PICTURES BEFORE ANY SOURCE CONFIRMED IT, 5 August:
 * *"the glint where the light catches the edge on all the shapes, but the
 * distribution of light is like a gradient on frosted glass."* The 2026 CSS
 * practice calls the same thing "surface transduction"; Gemini's material config
 * pairs `clearcoat: 1.0` with `clearcoatRoughness: 0.1`.
 *
 * ⚠ IT PAIRS WITH `GLASS_ROUGHNESS` AND MUST BE SWEPT WITH IT, NOT ALONE. The
 * two are the body and the skin of one surface — a sharp coat over an already
 * polished base (roughness 0.08) adds a second specular to a surface that
 * already has one, which is not the effect. This project has already recorded
 * the cost of tuning one value while another was still moving.
 *
 * ⚠ AND IT IS NOT FREE. Clearcoat adds a second specular lobe to the shader on
 * all five faces, and shader size is the recorded cause of the opening stutter
 * (`live-work/references/opening-stutter.md`). Re-measure the compile before
 * shipping a non-zero value.
 *
 * PROVISIONAL under D-035. Bound to `[c]` in `?cardrig=1`; `?coat=` overrides.
 */
export const GLASS_CLEARCOAT = 0;

/**
 * How sharp that clearcoat's own reflection is.
 *
 * ⚠ LOW IS THE POINT. The coat exists to stay CRISP while the body underneath
 * goes rough — a coat as rough as the base would just be more of the same
 * surface. Gemini's config: `clearcoatRoughness: 0.1`, described as *"keeps the
 * outer reflection sharp."* The bevel's equivalent runs higher (0.38) because it
 * is a shoulder catching a broad env panel rather than a flat face holding a
 * hairline.
 *
 * ⚠ INERT WHILE `GLASS_CLEARCOAT` IS 0. Three skips the clearcoat path entirely
 * when the coat is zero, so this value does nothing until the coat is raised.
 *
 * PROVISIONAL under D-035. Bound to `[v]` in `?cardrig=1`.
 */
export const GLASS_CLEARCOAT_ROUGHNESS = 0.1;

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
 * ⚠ TRIED AT 0.20 ON 5 AUGUST AND REVERTED THE SAME HOUR — the record matters
 * because the value looks like an obvious lever and is not. Reducing the
 * background's influence by closing the window produced **white lozenges**: the
 * fraction NOT transmitted behaves as an ordinary lit diffuse surface in `color`,
 * and at 0.20 that fraction is EIGHTY PERCENT of a near-white `GLASS_COLOR`
 * (`#e8eef8`). The cards stopped being glass at all — the same *"bright saturated
 * plastic button"* defect this comment already records at 0.85, and worse.
 *
 * **The background's influence is reduced by DIMMING THE BACKGROUND, not by
 * closing the glass.** Carl: *"don't touch the glass, return it to its previous
 * value. It's the c2b DESIGN that should be dimmed/fainter."*
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

// ⚠ `CROWN_HEIGHT` IS IMPORTED, NEVER RETYPED. `FILAMENT_LIGHT_HEIGHT` is
// derived from it, and the defect that correction fixes — a light left at 6
// while the face rose to 4.5 — is precisely what a hand-copied number produces.
import { CARD_RISE_DURATION_MS, CROWN_HEIGHT } from "./answer-card-geometry";

// ── The rim: tungsten, unlit ─────────────────────────────────────────────────
//
// ⚠ THE RIM IS THE FILAMENT AT REST, NOT GREY WAITING TO BE COVERED. Carl, 4
// August, with three photographs of unlit tungsten: *"Filaments are usually grey
// metal... if its metal, the light would have some interaction with it before it
// is active."*
//
// ⚠ THAT SENTENCE IS THE SPECIFICATION. The unlit state is not "off" — it is a
// metal object in a lit scene, already catching the environment before any
// current arrives. The references show it plainly: a bright specular run along
// the coil's upper surface falling to near-black underneath, reading as metal
// through light alone, with no colour at all.
//
// ⚠ AND IT RETIRES THE DIAGNOSTIC GREY ON THE RIM, DELIBERATELY. `DIAG_RIM_COLOR`
// existed so a form defect could not hide behind a plausible colour (chunk 1's
// argument, confirmed by Carl 3 August). The form is now approved, and the rim
// has a real material brief, so the diagnostic has done its job here. **The
// bevel and face keep theirs until they are briefed in turn.**

/**
 * Tungsten's own colour — very slightly warm grey, not blue steel.
 *
 * ⚠ NEAR-NEUTRAL BY MEASUREMENT OF THE REFERENCES, not by preference. In all
 * three photographs the unlit metal carries almost no hue; what reads as
 * "metal" is the SPECULAR BEHAVIOUR, not the tint. A saturated metal colour
 * here would pre-empt the amber that arrives in chunk 2.
 */
export const RIM_METAL_COLOR = "#b8b4ae";

/**
 * Auditionable metals for the rim, in ascending reflectance.
 *
 * ⚠ ADDED BECAUSE CARL ASKED THE RIGHT QUESTION, 4 August: *"filaments can be
 * made out of metal materials other than tungsten. Titanium for example. Which
 * would have the best reflective states when off?"*
 *
 * ⚠ AND THE HONEST ANSWER IS THAT THE TINT BARELY MATTERS AT THIS SCALE. In a
 * PBR model, base colour shifts a metal's HUE; `roughness` and the environment
 * decide its brightness and character. The rim is ~4px of tube, so tungsten's
 * ~50% reflectance against titanium's ~55% is invisible — while a roughness
 * change is obvious. **These exist so that claim can be checked by eye rather
 * than taken on trust**, which is what this project's record says to do with any
 * claim of the form "you will not be able to see it".
 *
 * Approximate visible-light reflectance, for the record:
 *
 *     tungsten   ~50%   neutral, faintly warm     the references' own metal
 *     titanium   ~55%   warm-grey, notably flat
 *     nickel     ~65%   neutral
 *     aluminium  ~91%   very slightly blue
 *     silver     ~97%   essentially neutral       brightest metal there is
 *
 * ⚠ THE BRIGHT TWO CARRY A REAL COST, NOT JUST A LOOK. The filament lighting up
 * should be the brightest event on the card; a near-silver rim at rest spends
 * that headroom before the amber arrives. Bracketed here, not recommended.
 *
 * Cycled with `[m]` under `?cardrig=1`.
 */
export const RIM_METALS = [
  { name: "tungsten", color: "#b8b4ae" },
  { name: "titanium", color: "#c4bdb4" },
  { name: "nickel", color: "#cdcbc6" },
  { name: "aluminium", color: "#e8ebef" },
  { name: "silver", color: "#f5f3ee" },
] as const;

/**
 * Fully metallic.
 *
 * ⚠ 1, NOT A BLEND. `metalness` is a physical switch in a PBR model rather than
 * a dial: values between 0 and 1 describe no real material and mostly produce a
 * plastic that happens to be shiny. The rim was `metalness: 0` — a dielectric —
 * which is why it could not read as metal at any roughness.
 */
export const RIM_METALNESS = 1;

/**
 * Surface roughness.
 *
 * ⚠ ROUGH, NOT POLISHED, AND THE SEM REFERENCE IS WHY. Carl's third photograph
 * is a scanning-electron close-up of a tungsten coil: the surface is visibly
 * textured — drawn wire, not a mirror. A near-zero roughness would give chrome,
 * which reflects its surroundings sharply and reads as machined trim.
 *
 * A rough metal scatters instead, which is what produces the broad soft run of
 * light along the coil in the first reference rather than a hard glint.
 *
 * ⚠ NOT AN APPROVED VALUE. PROVISIONAL under D-035 — Carl judges it by eye.
 */
export const RIM_ROUGHNESS = 0.34;

/**
 * How strongly the rim samples the environment map.
 *
 * ⚠ IT WAS EFFECTIVELY ZERO BEFORE, WHICH IS WHY THE RIM COULD NOT CATCH LIGHT
 * AT ALL. A metal with no environment to reflect is black — metals have almost
 * no diffuse response, so the env map IS their appearance. This is the single
 * property that makes *"the light would have some interaction with it"* possible.
 */
export const RIM_ENV_INTENSITY = 1.6;

// ── The bevel: glass, as the filament's mount ────────────────────────────────
//
// ⚠ CARL SETTLED THIS BY PHYSICS, NOT BY TASTE, and his reasoning replaced the
// Builder's question rather than answering it. Asked whether the bevel should be
// metal too:
//
// > *"The rim is the only metal, the bevel shouldnt be metal. What would some
// > metal be doing connected to a metal filament that is about to heat up?
// > Unless some sort of insulation is implied. i would imagine that the bevel is
// > some sort of 'holder' that supports the filament. If its made of glass it
// > would conduct and reflect the heat/light. Thus aiding with the bloom."*
//
// ⚠ IT ANSWERS THE ELECTRICAL QUESTION AND THE OPTICAL ONE AT ONCE. Metal
// touching a heating element implies a circuit path or a heat sink; glass
// implies containment — which is exactly what the references show, a filament
// mounted on supports inside a glass envelope. And a glass bevel picks up the
// filament's light along its inner edge and carries it outward, where a diffuse
// grey surface would absorb it.
//
// ⚠ SO THE BLOOM IS PART OF THE STRUCTURE RATHER THAN PAINTED ON. This is the
// ethos file's rule doing real work: *"effects should feel caused by the world,
// not layered on top of it."*

/**
 * The bevel's body colour.
 *
 * Near-white for the same reason `GLASS_COLOR` is: in `MeshPhysicalMaterial`,
 * `color` tints transmitted light AND acts as the diffuse albedo of the fraction
 * that is not transmitted. A tinted bevel would dye whatever the filament throws
 * through it.
 */
/**
 * ⚠ DARK, AND THAT IS THE ONLY DIAL THAT ACTUALLY CONTROLS THIS SURFACE.
 *
 * Three rounds of tuning `roughness`, `clearcoat` and `envMapIntensity` moved
 * the bevel barely at all — at `envMapIntensity` 0.1 it still measured 86.5
 * against the rim's 53.9. **The environment map was never what lit it.**
 *
 * ⚠ THE MECHANISM: the rim is `metalness: 1` and a metal has almost NO diffuse
 * response — the env map is its entire appearance. The bevel is a dielectric
 * with a full diffuse response, so the scene's two directional lights, which
 * strike both surfaces identically, light the bevel and barely touch the rim.
 * **No material dial on the bevel could win against its own base colour.**
 *
 * ⚠ AND A NEAR-WHITE DIELECTRIC UNDER DIRECTIONAL LIGHT IS THE BRIGHTEST THING
 * IT IS POSSIBLE TO PUT ON THIS CARD. `#eef2f8` was chosen by analogy with
 * `GLASS_COLOR`, where near-white is correct because that surface is
 * TRANSMISSIVE and its colour tints what passes through. The bevel transmits
 * nothing, so the same value means something completely different on it.
 *
 * Dark glass still reads as glass — it is the specular and the clearcoat that
 * say "glass", not the body value.
 */
export const BEVEL_GLASS_COLOR = "#2a2f36";

/**
 * ⚠ REFLECTIVE, NOT TRANSMISSIVE — AND THE DISTINCTION IS DELIBERATE.
 *
 * The face is already a transmissive surface. Making the bevel transmissive too
 * would put a second one in every card, and the transmission pass is the most
 * expensive thing on this page — it is what the whole warm-up apparatus in
 * `answer-card-canvas.tsx` exists to tame.
 *
 * ⚠ AND IT WOULD COST DEFINITION. The bevel currently separates the rim from the
 * face by being visibly a different material; two transmissive surfaces meeting
 * would blur that boundary.
 *
 * A high-clearcoat dielectric gives the glassy specular response Carl's brief
 * needs — *"it would conduct and reflect the heat/light"* — without joining the
 * transmission pass. **Reflect is the operative word in that sentence.**
 */
/**
 * ⚠ THE BEVEL SITS WELL BELOW THE RIM IN BRIGHTNESS, AND THAT SEPARATION IS THE
 * POINT RATHER THAN A TASTE CALL.
 *
 * Carl, 4 August: *"With the light at its current level the rim and bevel are
 * less distinguishable. You could make out more of a difference when the light
 * was lower."*
 *
 * ⚠ HE IS DESCRIBING SATURATION, AND THE EARLIER MEASUREMENTS SHOW IT: the rim
 * ring's luminance range was 163 at light 0.12 and 230 at 0.35. Both surfaces
 * climb toward the top of the scale together, so at a usable light level they
 * converge into one bright band and the boundary stops reading.
 *
 * ⚠ SO THE FIX IS CONTRAST, NOT LIGHT LEVEL — otherwise the choice is between
 * "bright enough to judge" and "distinguishable", which is a false one. A
 * rougher, dimmer bevel keeps its own value range low while the rim stays
 * specular, so the two separate at any light level rather than only at the
 * bottom of the fader.
 *
 * ⚠ AND IT IS TRUER TO THE BRIEF. Glass holding a filament is not as bright as
 * the metal it holds; it carries light rather than competing with it.
 */
export const BEVEL_ROUGHNESS = 0.62;
export const BEVEL_CLEARCOAT = 0.45;
export const BEVEL_CLEARCOAT_ROUGHNESS = 0.38;
export const BEVEL_ENV_INTENSITY = 0.1;

/**
 * ⚠ THE TWO SURFACES WERE NOT INVERTED — THEY WERE MERGED, AND THAT DIAGNOSIS
 * TOOK A FULL LUMINANCE PROFILE TO REACH.
 *
 * Sampling at assumed depths (2px "rim", 6px "bevel") reported the bevel as two
 * to three times brighter and sent two rounds of tuning in the wrong direction.
 * Walking inward one pixel at a time instead, at light 0.35:
 *
 *     px    0     1     2     3     4     5     6     7     8    9   10 ... 14
 *     L    16.7  58.6 116.7 174.9 162.5 175.4 175.4 175.4 164.7  16   16    54.6
 *
 * ⚠ **A SINGLE FLAT PLATEAU FROM 3px TO 8px.** The rim consumes ~4px and the
 * bevel ~4px, so that plateau spans BOTH — the metal's lit crown and the glass
 * were sitting at the same value, which is precisely Carl's *"the rim and bevel
 * are less distinguishable."* The 2px sample had been reading the tube's dark
 * OUTER edge, not the metal at all.
 *
 * ⚠ THE LESSON IS THE ONE THIS PROJECT KEEPS RELEARNING: the Builder assumed
 * where the boundary was instead of measuring it, and the assumption was baked
 * into the instrument. **Find the edge; do not place it.**
 */

/**
 * ⚠ THE BEVEL WAS BRIGHTER THAN THE RIM, WHICH INVERTED THE WHOLE BRIEF.
 *
 * Measured 4 August across the fader — luminance on card 1's top edge:
 *
 *     light   rim    bevel
 *     0.12    36.9   115.4
 *     0.35    88.9   190.4
 *     1.0    163.9   232.8
 *
 * **The glass was two to three times brighter than the metal at every level.**
 * In Carl's reference photographs it is the METAL that catches the light and the
 * glass that carries it — so the card was reading as a bright plastic frame with
 * a dark outline, rather than as a filament in a holder.
 *
 * ⚠ AND IT EXPLAINS HIS REPORT EXACTLY. *"With the light at its current level
 * the rim and bevel are less distinguishable"* — at 0.35 the bevel is at 190 and
 * heading for the top of the scale, where it flattens and the boundary with
 * everything else stops reading. The dim end preserved the difference only
 * because nothing had saturated yet.
 *
 * ⚠ THE BUILDER'S FIRST ATTEMPT MADE IT WORSE by raising the rim's env response
 * and lowering the bevel's SLIGHTLY — treating it as a contrast tweak when the
 * ordering itself was wrong. **A gap in the wrong direction is not a gap.**
 */

/**
 * The scene's overall light level, as a multiplier.
 *
 * ⚠ IT STARTS LOW, ON CARL'S INSTRUCTION, AND THAT IS METHOD RATHER THAN TASTE:
 * *"If the rig has no light fader we give it one and start with it low so it has
 * hardly no effect on the metal. We bring it up to a relative level and judge it
 * against both metal and glass."*
 *
 * ⚠ THE ALTERNATIVE IS WHAT THIS PROJECT ALREADY GOT WRONG ONCE. Every frost
 * value so far was *"a guess dressed as a starting point"* — and 0.28 was chosen
 * while the transmission target was clearing to white, so it was tuned against a
 * broken subject. Starting both faders at the bottom and pushing them up means
 * no value is ever chosen against an unknown.
 *
 * ⚠ 0.12 WAS TRIED AND WAS TOO DARK TO JUDGE BY. Carl brought it back to 0.35 —
 * the level at which the materials can actually be read. **"Start low" means low
 * enough that nothing is assumed, not so low that nothing is visible.**
 *
 * ⚠ AND THE BRIGHT PATCH AT EACH CARD'S TOP-LEFT IS THE BEVEL, NOT THE RIM —
 * Carl, 4 August, correcting the Builder, who had attributed it to the metal.
 * It is the clearcoat catching the env map's key panel, which sits above and to
 * the left. **That is the glass holder behaving exactly as the brief intends**,
 * and it is worth keeping straight because the two surfaces are tuned by
 * different dials.
 *
 * ⚠ IT ALSO SITS WHERE THE FILAMENT'S CIRCUIT BEGINS. Carl: *"Starts top left."*
 * So in chunk 2 the amber's origin coincides with the brightest point already on
 * the card. Options, when it matters: move the key panel to above-RIGHT, let the
 * emissive filament simply out-shine a reflection, or move the origin. **The
 * first is cheapest and the third is the one to resist** — top-left is the
 * natural origin for a left-to-right corridor.
 *
 * Bound to `[9]` in `?cardrig=1`.
 */
/**
 * ⚠ RAISED 0.35 → 1.1 ON 9 AUGUST 2026, AND THE OLD VALUE WAS A GLASS VALUE.
 *
 * 0.35 was tuned against a face at `transmission: 0.97`, which mixes 97% of the
 * diffuse away — the surface returned almost nothing, so the fader sat low to
 * keep the RIM from blowing out. Satin is diffuse and returns light properly, so
 * the same fader leaves the card far too dark: measured mean luminance **21.6
 * out of 255**, which is why it read as a flat dark slab at normal scale however
 * the lights were placed.
 *
 * ⚠ IT WAS THE ACTUAL CAUSE OF WHAT CARL SAW, and four attempts at the light's
 * POSITION missed it. *"When i zoom in on my PC it is more like this but at a
 * normal scale not so much defined."* A gradient that survives magnification and
 * washes out at 1:1 is under-resolved OR under-exposed; three position changes
 * chased the first and the answer was the second.
 *
 * Swept on `?light=`, all other values held (peak position from
 * `verify/key-elevation-sweep.mjs`'s profile method):
 *
 *     light   mean    max    ratio   peak
 *     0.35    21.6   48.6     6.16    17%   <- the glass value: too dark to read
 *     0.70    41.3   84.6     4.44    17%
 *     1.10    59.3  115.3     3.83    30%   <- shipped
 *     1.60    77.3  142.3     3.45    30%
 *     2.20    89.5  158.4     3.16    17%
 *
 * ⚠ BRIGHTNESS AND CONTRAST PULL AGAINST EACH OTHER, and the ratio alone would
 * pick the darkest option. More light lifts the peak but lifts the shadows with
 * it, so disclosure FALLS as exposure rises. 1.1 is chosen as the balance: the
 * peak is on the face at 30%, the ratio of 3.83 is still well clear of the 2.18
 * this project measured as *"only now starting to read"*, and the card is
 * finally bright enough to be seen at 1:1.
 *
 * ⚠ THE CEILING CONSTRAINT IS UNTESTED AT THIS VALUE. The contact field keeps
 * its brightest point below the gold rim's measured 172.9. The card's max is now
 * 115.3, comfortably under — but the card's rim is unlit tungsten rather than
 * the field's gold bevel, so whether the same ceiling even applies here is
 * Carl's call and he has left it open: *"Same ceiling for the moment, it is
 * subject to possible iteration."*
 *
 * Bound to `[9]`.
 */
export const LIGHT_LEVEL = 1.1;

// ═══════════════════════════════════════════════════════════════════════════
// THE SATIN FACE — chunk 1, 9 August 2026. GLASS IS DISCARDED.
// ═══════════════════════════════════════════════════════════════════════════
//
// ⚠ CARL'S DECISION AND HIS REASONING, which is structural rather than taste:
// *"Glass has been discarded. Reason — it needs a background to become truly
// effective and it could be seen as cliched in 2026."* The first half is the
// load-bearing one: glass is a LENS, and it needs something behind it to
// refract. **The lockup went on 5 August**, so the thing that gave the
// transmissive face something to do is already gone. `GROUND_COLOR` #101010
// took its place, and a lens onto a flat dark plane is a dark flat card.
//
// ⚠ AND THE MEASUREMENT AGREES. `verify/crown-disclosure.mjs`, run on the glass
// card before it was replaced: the short-axis profile is a flat 69.5 plateau
// across the top 42%, a cliff, then a flat ~15 — two flat regions with a step,
// which is the RIM against the FACE BODY. `bothSidesFall: NO`. **The 23.8°
// crown discloses nothing.** `transmission: 0.97` mixes 97% of the diffuse away
// (`transmission_fragment.glsl.js:33`), so a correct crown renders flat.
//
// ⚠ THE JOB OF THIS MATERIAL, IN CARL'S WORDS: *"The most important thing with
// the cards is to bring out the geometry. Both with static light, and moreso
// with moving light."* **Disclosure, not decoration.** Every value below is
// chosen to make the crown's curve READ, and the success test is measurable:
// the disclosure ratio, and whether luminance falls away on BOTH sides of the
// peak (a curve) rather than ramping monotonically (a flat plane).
//
// ⚠ THE HIERARCHY IT SITS IN — Carl, 9 August: *"the q+a section will be the
// parent to the client info section"* (D-045 §1), and *"as good/cool that
// section looks, this has to be greater/better."* The contact field gets its
// variation from POSITION IN A SHARED STATIC TEXTURE — one gradient, four
// windows. The card gets its variation from A MOVING LIGHT ON REAL GEOMETRY.
// Same principle, live rather than painted. **So the card must NOT use the
// window/texture trick**: repeating the child's mechanism is the same error
// that ruled out brushed metal — *"its too close in look to the client info
// cards."*

/**
 * The satin body colour — the blue the surface IS, before any light reaches it.
 *
 * ⚠ ANCHORED TO MEASURED BRAND VALUES, NOT PICKED. Carl, 9 August: *"There
 * should be consistency in colours, our brand colours. Gold and amber. From the
 * blue family — teal, a dark blue and light blue."* And the standing method,
 * from the field's own grading pass: *"look at the hex of the darkest blue of
 * the opal and the lightest blue, use them as a guide."*
 *
 * The Send opal is an APPROVED element (R-018, D-033) and already sets this
 * page's blue: `#163a8f -> #14418f -> #114aa5`. This sits in that hue family.
 *
 * ⚠ IT IS THE DARK END ON PURPOSE. On a diffuse surface `color` is the albedo —
 * what the material returns where light is WEAK. The lit peak comes from the
 * specular sheen, not from this. Setting this to the light blue would flatten
 * the range: a bright albedo everywhere leaves the shadow nowhere to go, and
 * range is exactly what the references have and the old glass face lacked.
 *
 * ⚠ PROVISIONAL. To be moved by eye on `[b]`.
 *
 * ⚠ DEEPENED 9 AUGUST 2026, AND THE REASON IS RANGE RATHER THAN COLOUR. The
 * first satin pass measured 18–52 out of 255 across the whole face — a 34-level
 * span, which at the card's actual ~104px height is too little contrast spread
 * over too few pixels to read as anything but a flat slab. Carl, on his 27"
 * monitor: *"when i zoom in on my PC it is more like this but at a normal scale
 * not so much defined."*
 *
 * ⚠ THAT IS A RESOLUTION SYMPTOM, NOT AN ABSENCE. The gradient IS present in
 * the pixels — it survives magnification — but it is spread so gently that at
 * 1:1 the eye integrates it into one tone. **The fix is a wider range and a
 * steeper falloff, not more light**: the bloom needs somewhere to travel from
 * and somewhere to arrive.
 */
export const SATIN_COLOR = "#0b1f4d";

/**
 * The sheen's own colour — what the light becomes on the surface.
 *
 * ⚠ NOT WHITE, AND NOT THE BODY BLUE. Carl's third satin reference shows the
 * highlight going near-white while the shadow stays deeply saturated, with a
 * faint cool cast where the band rolls off. That cast is the *teal* of the
 * brand palette — the cyan lean the contact field measured in its own reference
 * (`#c2ffff`, luminance 242) and had to COMPRESS OUT to stay under its gold
 * bevel.
 *
 * ⚠ THE CARD MAY BE ABLE TO SPEND WHAT THE FIELD COULD NOT, and Carl has left
 * that open: *"Same ceiling for the moment, it is subject to possible
 * iteration."* So this is pitched to reach the light-blue/teal end WITHOUT
 * exceeding the field's ceiling today. If the ceiling lifts, this is the value
 * that moves first.
 *
 * ⚠⚠ CORRECTED 9 AUGUST 2026 — IT WAS `#9fd4f0`, A PALE CYAN REACHING FOR
 * NEAR-WHITE, AND THAT IS THE THING CARL RULED OUT. His reference for the
 * finish is a deep blue satin whose lit bands are *"less mountainous"* than the
 * folded-fabric images: long, shallow, directional, and **never white**. The
 * brightest region in it is still unmistakably BLUE.
 *
 * > *"i would also mention the falloff between lighter and darker parts. Its
 * > almost like a gradient, a bloom."*
 *
 * A near-white sheen produces a PEAK — a bright crest sitting on top of the
 * roll, which is the "white peak topography" he was describing and rejecting.
 * A saturated lighter blue produces a BLOOM: the light stays in the same hue
 * family as the body, so the transition between them reads as one continuous
 * surface brightening rather than as a highlight laid over a colour.
 */
export const SATIN_SHEEN_COLOR = "#5b9ede";

/**
 * How broad the sheen lobe is.
 *
 * ⚠ THE PARTNER OF `SATIN_ROUGHNESS`, NOT AN INDEPENDENT DIAL — the same
 * relationship `GLASS_CLEARCOAT` records with `roughness`. The body's roughness
 * decides the main specular's softness; this decides the grazing lobe's. Sweeping
 * one without the other produces a surface with two disagreeing finishes, which
 * reads as a rendering error rather than a material.
 *
 * ⚠ BROADER THAN THE BODY ON PURPOSE. In real satin the grazing sheen is the
 * SOFT part — the long bloom that runs along a fold — while the core specular
 * stays tighter. Equal values collapse the two into one lobe and the fabric
 * quality goes with it.
 */
export const SATIN_SHEEN_ROUGHNESS = 0.62;

/**
 * How rough the satin is — the softness of the sheen.
 *
 * ⚠ THE DIAL THAT DECIDES WHETHER THE GEOMETRY READS. Low roughness gives a
 * tight bright core whose POSITION on the roll tells the eye where the surface
 * turns; high roughness spreads it into a wash that flattens the form. Carl's
 * fabric references are soft and spread; the C2B logo — which the Next step
 * button will echo in platinum blue — is tight and bright.
 *
 * ⚠ PITCHED TOWARD THE TIGHTER END BECAUSE DISCLOSURE IS THE BRIEF. A soft
 * sheen is prettier in a still and worse at showing a curve. Bound to `[7]`;
 * expect Carl to move it.
 *
 * ⚠ TIGHTENED 9 AUGUST 2026 TO STEEPEN THE FALLOFF. Carl's own diagnosis was a
 * SCALE one — the gradient reads when magnified and washes out at 1:1 — and a
 * gentler falloff spread across ~104px is exactly what washes out. Lowering
 * roughness concentrates the transition into fewer pixels so the bloom still
 * has a shape at actual size.
 *
 * ⚠ THIS IS THE DIAL TO MOVE FIRST IF THE CARD READS AS A FLAT SLAB, and the
 * one to move BACK if it starts reading as polished plastic. The boundary
 * between "satin bloom" and "specular highlight" lives here.
 */
export const SATIN_ROUGHNESS = 0.26;

/**
 * Anisotropy strength — how far the specular lobe is smeared along the tangent.
 *
 * ⚠ THIS IS WHAT MAKES IT SATIN RATHER THAN PLASTIC. At 0 the highlight is a
 * round dot and the material is a shiny blue surface. Raised, the lobe stretches
 * along the roll's axis into the long soft band that every one of Carl's
 * references shows.
 *
 * ⚠ IT REQUIRES THE `tangent` ATTRIBUTE, WHICH THE FACE GEOMETRY NOW CARRIES.
 * Without it three falls back to screen-space UV derivatives and the direction
 * is undefined — the material would look "not working" while every value here
 * was correct. See `convexFaceGeometry`.
 *
 * ⚠ VERIFIED WIRED, NOT ASSUMED. `verify/satin-wired.mjs` renders the same card
 * at rotation 0 and rotation π/2 and diffs the pixels: mean 6.4, worst 30.7.
 * Strength 0.68 against 0 differs by mean 2.5. **Both dials move the render**,
 * so the tangent is present and meaningful. That test exists because two
 * attempts to READ the live material — via `canvas.__r3f` and by walking the
 * React fiber tree — both found nothing on this version of R3F, and a probe
 * that cannot find the object cannot clear it either.
 *
 * ⚠ RAISED 9 AUGUST 2026 to 0.86. Carl's chosen reference is strongly
 * directional — long shallow streaks running one way across the whole surface —
 * and that direction is what anisotropy supplies. The earlier 0.68 read as a
 * general softness rather than as grain.
 */
export const SATIN_ANISOTROPY = 0.86;

/**
 * The smear's direction, in radians, measured counter-clockwise from the
 * tangent.
 *
 * ⚠ ZERO MEANS "ALONG THE ROLL", AND THAT IS THE DESIGN. The tangent is built
 * along the card's long axis — the axis the cylindrical crown does NOT curve on
 * — so the band runs the card's width and the curve is disclosed across its
 * height. Rotating this to π/2 would smear ACROSS the curve and hide it.
 *
 * Adjustable so the choice can be SEEN rather than argued. Bound to `[a]`.
 */
export const SATIN_ANISOTROPY_ROTATION = 0;

/**
 * How strongly the satin face samples the studio environment map.
 *
 * ⚠ LOW, NOT ZERO, AND THE REASON IS THE NEXT STEP BUTTON. A satin surface
 * RECEIVES light rather than mirroring its surroundings — the contact field
 * sets its own field to `envMapIntensity: 0` for exactly that reason. But
 * D-045 §10 records that *"whatever rig the cards get is the rig that button
 * will live under"*, and Carl has now specified that button as **platinum blue,
 * the C2B logo's look** — a polished material that NEEDS an environment to
 * reflect.
 *
 * ⚠ SO THE RIG STAYS CAPABLE OF LIGHTING A REFLECTIVE MATERIAL even though this
 * surface barely uses it. Stripping the environment because satin does not need
 * it would leave the platinum button with nothing to mirror, and rebuilding a
 * studio rig later is far more expensive than keeping one now.
 */
export const SATIN_ENV_INTENSITY = 0.22;

/**
 * How high the two symmetric scene lights sit above the card plane.
 *
 * ⚠ THE RESTING STATE IS LIT FROM LEFT AND RIGHT — Carl, 9 August 2026: *"What
 * might be better in the resting state is to light the scene globally with 2
 * lights left and right."* A single key has to choose a direction, and every
 * direction is wrong for a symmetric object at rest; direction is what chunk 2's
 * hover arc introduces, and it reads as an event because the resting state has
 * none.
 *
 * ⚠ ELEVATION IS THE DIAL, NOT INTENSITY. The face curves on the SHORT axis
 * (`crownZ` — raised cosine top-to-bottom, plateau left-to-right), so light with
 * too little vertical separation rakes along the FLAT axis and discloses
 * nothing. Raising intensity on a badly-placed light makes a brighter flat card.
 *
 * ⚠ MEASURED, NOT CHOSEN. `verify/key-elevation-sweep.mjs` sweeps this and
 * reports where the luminance peak lands as a fraction of face height. A peak
 * near 50% means the light is on the FACE; near 0% or 100% it is on an EDGE —
 * and a thin bright rim against a black face scores BETTER on the disclosure
 * ratio than a properly lit card, which is the trap three hand-adjustments fell
 * into before this was swept.
 */
export const SCENE_KEY_ELEVATION = 70;

// ═══════════════════════════════════════════════════════════════════════════
// ⚠⚠ A MOVING RESTING LIGHT WAS BUILT ON 9 AUGUST 2026 AND REMOVED THE SAME DAY
// ═══════════════════════════════════════════════════════════════════════════
//
// Carl asked for it — *"the light should move bringing out the 3d qualities of
// the cards... slow, small and continuous"* — and later removed it on the
// evidence: *"it looks ok zoomed in but not at this scale. Return it to the way
// it was and i dont think 5 point lights are the solution."*
//
// ⚠ FIVE ATTEMPTS, ALL RECORDED HERE SO NONE IS REPEATED:
//
//   1. Two directionals, ANTIPHASE elevation swing. The bloom did not move at
//      all — 8 samples across a full cycle every one at peak 38%. Opposing
//      swings on a symmetric card cancel exactly.
//   2. Same pair, IN PHASE. Exposure swung 25% and the peak still did not move:
//      the cards pulsed brighter and dimmer without disclosing anything.
//   3. Lateral (x) swing. Peak 0%, exposure 29%. The face is flat on that axis
//      (`CROWN_PLATEAU_U`), so there was nothing for it to reveal.
//   4. One moving directional plus one static fill, ±49°. Bloom migrated 13%
//      while brightness swung 43% — measurably a light changing intensity
//      rather than position.
//   5. FIVE POINT LIGHTS, one per card, on a tight ellipse — Carl's own design,
//      and the only one that could work in principle: a point light has a
//      position, so proximity can narrow and widen the beam. `arcx` swept 26 to
//      180. At 26 the edges went black (*"the face is floating on its own"*);
//      past ~115 the light is far enough that distance barely varies and the
//      ellipse stops being an ellipse in any useful sense. No value did both.
//
// ⚠ THE FINDING WORTH KEEPING, AND IT IS ABOUT SCALE RATHER THAN ABOUT LIGHTS.
// The card's face is ~104px tall on screen. An effect that works by moving a
// light across a curve has to resolve inside that, and none of these did — they
// read at zoom and vanished at size. **What carries the form at this scale is
// the MATERIAL'S OWN response**, which is why the satin's anisotropy and its
// bloom do the disclosing and the approved look does not need the light to move.
//
// ⚠ IT MAY STILL BE RIGHT FOR THE HOVER. D-045's arcs are per-card and fire on
// attention, where the user is looking at ONE card and a bigger, faster gesture
// is legitimate. Nothing here rules that out; it rules out ambient motion at
// resting scale.
//
// ⚠ THE DIAGNOSTIC DOORS SURVIVE because they are how this was found:
// `?lighthelpers=1` draws the lights, `?keyy=` moves their elevation, and
// `verify/key-elevation-sweep.mjs` measures where the light lands.

// ═══════════════════════════════════════════════════════════════════════════
// THE RESTING RIG — DERIVED FROM THE CONTACT FIELD, WHICH ALREADY WORKS
// ═══════════════════════════════════════════════════════════════════════════
//
// ⚠ CARL, 9 August 2026, after five attempts at deriving a rig from scratch:
// *"Lets emulate something that works — lighting on the client info section.
// Have a light central illuminating all the cards, you may have to dial it down
// slightly, and then another light starting top left, looking across the cards
// and ending bottom right with an ellipse in between."*
//
// ⚠ COPYING A PROVEN RIG IS THE RIGHT MOVE AND THE PREVIOUS FIVE WERE NOT. Every
// earlier attempt reasoned from the geometry — swing the elevation, swing the
// azimuth, antiphase, in phase, five point lights — and each was measured
// failing. The contact field is an APPROVED object built from the same
// rim/bevel/face vocabulary, lit in a way Carl has already accepted by eye.
// **The question "what lighting suits this form" was answered months ago on its
// sibling.**
//
// ⚠⚠ AND THE FIELD'S RIG IS ASYMMETRIC, WHICH IS EXACTLY WHAT THE CARDS LACKED.
// Measured from `contact-field-canvas.tsx`:
//
//     key    [-160, 120,  40]  intensity 1.60   top-left, grazing
//     fill   [ 140, -90,  60]  intensity 0.35   bottom-right, ~1/5 of the key
//     ambient                  intensity 0.22
//
// The cards were running TWO EQUAL LIGHTS at 1.55 each — a symmetry this Builder
// introduced — and that symmetry is what produced two pinned blooms with a dead
// band between them. **One dominant direction plus a quiet fill is what makes a
// shallow crown read.**
//
// ⚠ AND THE FIELD'S OWN COMMENT EXPLAINS THE ANGLE, which the cards had wrong:
// *"Dropping z well below the lateral offsets puts the key at a genuinely
// grazing angle (~76 degrees off-normal), so a shallow crown and the bevel
// shoulder both register."* At z=200 it measured a ~5% Lambert response across
// the whole crown — *"a flat slab with no readable form"*. The cards' z=70
// against x=±150 was far less grazing than the field's z=40 against x=-160.

/** Top-left, grazing. Taken from the field's `KEY_LIGHT_POSITION`. */
export const REST_KEY_POSITION: [number, number, number] = [-160, 120, 40];
export const REST_KEY_INTENSITY = 1.6;

/** Bottom-right, quiet. The field's `FILL_LIGHT_POSITION`, ~1/5 of the key. */
export const REST_FILL_POSITION: [number, number, number] = [140, -90, 60];
export const REST_FILL_INTENSITY = 0.35;

/**
 * ⚠ THE FIELD'S 0.22, DIALLED DOWN AS CARL ANTICIPATED: *"you may have to dial
 * it down slightly."* The cards carry a travelling light the field does not, and
 * ambient is what erases the shadows a travelling light exists to cast.
 */
export const REST_AMBIENT_INTENSITY = 0.18;

// ── The travelling light ─────────────────────────────────────────────────────
//
// ⚠ ONE LIGHT, NOT FIVE, AND IT CROSSES THE WHOLE GRID. Carl: *"another light
// starting top left, looking across the cards and ending bottom right with an
// ellipse in between."* So its path runs the same diagonal the static key and
// fill already define — from where the key sits to where the fill sits — and it
// bows out into an ellipse between them rather than travelling a straight line.
//
// ⚠ IT IS A POINT LIGHT, because the ellipse only means something if distance
// does. A directional light has no position: only its angle exists, so bowing
// its path would change nothing at all. That was established the expensive way.
//
// ⚠ AND IT IS GRID-WIDE RATHER THAN PER-CARD, which is the correction the
// five-light attempt earned. Per-card lights each lit a ~104px face and could
// not resolve at that size; one light crossing all five cards produces a
// highlight that MOVES BETWEEN them, which is legible because the travel is
// measured against the whole row rather than against one small face.

/**
 * ⚠ THE PATH IS IN THE GRID'S OWN PLANE, SEEN FACE-ON — corrected 9 August 2026
 * from Carl's drawing. An earlier version ran a diagonal that bowed toward the
 * VIEWER, which is a different curve entirely: his sweeps down and across
 * BENEATH the row, and the bow is within the plane rather than in depth.
 *
 * *"Start just behind top left and end just behind bottom right. If you want to
 * keep the circuit, when it goes round the back have it race to the beginning.
 * Apply easing at the tight curves."*
 */

/** Enters upper-left of card 1 — BEHIND the card plane, so it emerges into view. */
export const REST_TRAVEL_FROM: [number, number, number] = [-360, 120, -70];
/** Exits lower-right past card 5, behind the plane again. */
export const REST_TRAVEL_TO: [number, number, number] = [360, -150, -70];

/**
 * How far the path sags BELOW the straight line between its endpoints, and how
 * far it comes FORWARD of the card plane at the same time.
 *
 * ⚠ THE SAG IS WHAT MAKES IT CARL'S CURVE RATHER THAN A DIAGONAL. His drawing
 * dips well under the second row before rising to the exit, so the light passes
 * beneath the whole grid at its lowest point and rakes UP at the lower cards —
 * which is the only position from which their bottom edges catch anything.
 *
 * ⚠ AND THE FORWARD LEAN IS WHAT BRINGS IT IN FRONT. Both endpoints sit behind
 * the card plane (`z = -70`); the light has to cross to the visible side for the
 * middle of its pass and return behind for the ends. That crossing is what makes
 * it EMERGE rather than switch on.
 */
export const REST_TRAVEL_SAG = 150;
export const REST_TRAVEL_FORWARD = 190;

/** The traveller's brightness. Below the key, so it accents rather than lights. */
export const REST_TRAVEL_INTENSITY = 0.9;

/**
 * The VISIBLE pass — entering upper-left, crossing, exiting lower-right.
 *
 * ⚠ SLOW, ON CARL'S STANDING INSTRUCTION: *"slow, small and continuous... too
 * fast and the effect wont be noticeable."*
 */
export const REST_TRAVEL_MS = 11000;

/**
 * The RETURN — round the back, racing to the start.
 *
 * ⚠ CARL'S SOLUTION TO A PROBLEM EVERY EARLIER VERSION HAD: *"when it goes round
 * the back have it race to the beginning."* A light that reverses has to turn,
 * and a turn in view is either a visible corner or a slow crawl through the
 * moment the eye is most likely to notice. **A circuit never turns in view at
 * all** — the light always travels the same direction, and the only reversal
 * happens behind the cards where nothing is lit.
 *
 * ⚠ FAST, AND THAT IS WHY IT WORKS. At a fifth of the visible pass the return is
 * over before the absence registers as a gap.
 */
export const REST_RETURN_MS = 2200;


// ── The filament, lit ────────────────────────────────────────────────────────
//
// ⚠ CHUNK 2: THE "ON" STATE. Carl walked the circuit, 4 August:
//
// > *"Filament starts top left. Travels anticlockwise... first curve and travels
// > down card 1s right edge. Second curve and travels along its bottom edge,
// > adjacent to card 4. Third curve and on its left edge travels upward."*
//
// So: top-left origin, RIGHTWARD along the top, down the right edge, leftward
// along the bottom, up the left edge, back to the origin. A closed loop that
// meets itself — which is what makes it a circuit rather than a fuse.
//
// ⚠ AND THE SPILL IS THE POINT, NOT A SIDE EFFECT. Carl:
//
// > *"As it travels downwards it should have some effect on the left of card 2.
// > Likewise, as it navigates the second curve, it should affect card 4. But as
// > its rounding curve 2 there would be some effect on card 4 and not just to
// > the left of the vertical line, it would bleed a little to the right on the
// > top of card 4."*
//
// ⚠ **THAT SECOND SENTENCE IS WHY THIS MUST BE A REAL LIGHT.** A head that
// bleeds ACROSS a corner is a source with an angular spread, not a point tracked
// along a line. And the spill crosses onto a NEIGHBOURING CARD — a different
// mesh — which nothing painted into card 1's own material could ever do. It is
// the same requirement that forced the two canvases into one scene: light only
// reaches what shares its scene.

// ⚠ THE CIRCUIT DURATION IS NO LONGER DECLARED OR SHARED. This comment used to
// document a constant tying the filament's circuit to the backdrop's 2400ms
// colour travel — Carl: *"The blue pixels will turn teal in the same time frame
// as the filament takes to do a circuit."* The filament stopped travelling when
// Carl reframed it as a fade (see below), and the backdrop's colour travel was
// removed with the lockup on 5 August 2026. **Neither side of that shared clock
// exists now.** `FILAMENT_HEAT_MS` is the filament's own timing.

// ── The black-body ramp ──────────────────────────────────────────────────────
//
// ⚠ CARL REFRAMED THE WHOLE CHUNK, 4 August, after the travelling circuit was
// working:
//
// > *"the filament must become active to show that a choice has been selected.
// > does it have to move? become animated? No. it could fade in, like a real
// > light bulb filament. How does light/heat work? Start of red, orange, white.
// > blue"*
//
// ⚠ THAT IS THE BLACK-BODY CURVE AND IT IS LITERAL. Incandescence follows
// temperature: dull red ~800K, orange ~1300K, yellow-white ~2000K, white ~2800K
// — which is where a working tungsten bulb actually sits. Blue-white needs
// ~5000K+, hotter than tungsten survives, so the ramp stops short of it.
//
// ⚠ AND THE END POINT IS A DESIGN CALL, NOT A PHYSICS ONE. The physics ends
// white; the filament reference says amber, to echo the Q numbers in the rail.
// Carl settled it: *"Amber or white? Somewhere between the two."*

/** First glow — dull red, the metal barely conducting. */
export const HEAT_RED = "#8c1f06";
/** Mid-ramp — orange, the temperature a filament passes through. */
export const HEAT_ORANGE = "#ff6a1a";
/**
 * The settled colour: amber-orange, NOT white.
 *
 * ⚠ PULLED BACK DOWN THE RAMP ON CARL'S REPORT, 4 August: *"the end state of the
 * filament is too bright/white. it reaches optimum red and as it transitions to
 * nearly white i would imagine it would be amber/orange? white looks too blown
 * out."*
 *
 * ⚠ AND HE IS RIGHT ON THE PHYSICS AS WELL AS THE LOOK. Tungsten runs ~2800K,
 * which is *nominally* white but reads distinctly WARM — "white hot" in ordinary
 * speech is more like 5000K, which tungsten never reaches because it melts at
 * ~3700K. The previous `#ffd9a8` was sitting at a temperature the metal cannot
 * survive.
 *
 * ⚠ IT ALSO RESOLVES *"somewhere between the two"* MORE HONESTLY. That was read
 * as "a white with a warm cast"; the truer reading is an amber that has climbed
 * as far toward white as the metal allows — which is what this is, and which
 * keeps the rail's amber doing its brand job at the moment the eye settles on
 * the card rather than only in passing.
 *
 * The constant keeps its name because it is the ramp's TOP END, not because it
 * is white.
 */
export const HEAT_WHITE = "#ffab52";

/**
 * The glass's TRANSMITTANCE while its own filament is lit — the amber filter
 * over the lens.
 *
 * ⚠ THE GOVERNING SENTENCE, IN CARL'S WORDS, BECAUSE THIS KEEPS EVAPORATING.
 * Agreed three times across three sessions and never surviving into the code,
 * because it lived in chat while the code carried only values:
 *
 * > *"So do I want amber frosted glass? No. I need the frosted glass to be
 * > tinged by the light. To have the most subtle effect to confirm and reinforce
 * > that this is a 3D object. The filament's intensity can be changed to achieve
 * > this."*
 *
 * > *"The scene is lit by global white light, hence the reflections. When card 1
 * > is locally lit, that white reflection wouldn't stay white — the amber would
 * > overpower it. It's the equivalent of having white light and then over the
 * > lens you put an amber filter."*
 *
 * **A FILTER, NOT A MATERIAL.** Amber glass is the same colour whether the
 * filament lives or dies. Glass *tinged by light* exists only while there is
 * light to tinge it — **and that difference is the whole point, because the
 * effect's job is EVIDENCE that the object is real, not decoration on it.**
 *
 * **SUBTRACTION, NOT ADDITION.** A filter REMOVES blue rather than adding
 * orange, so it darkens and saturates instead of washing out.
 *
 * ⚠ AND ADDITION — THE LITERALLY-CORRECT PHYSICAL TERM — IS THE WRONG ANSWER
 * HERE, which is why this argument recurs. Adding a light does add a specular
 * lobe, but that lobe is geometrically invisible on these surfaces at this
 * camera, and the band is already near clipping (`FILAMENT_GLOW` is 3.2 and its
 * own note says raising it past clipping buys nothing). Adding amber to an
 * already-bright band drives it to white — ***"white looks too blown out"***,
 * the verdict Carl already gave once on this exact axis. **Addition has no
 * headroom. Multiplication works downward, where all the headroom is.**
 *
 * ⚠ IT IS A TRANSMITTANCE, NOT THE EMITTER'S COLOUR — the correction that makes
 * this subtle rather than theatrical. `HEAT_WHITE` normalised is
 * (1.0, 0.67, 0.32): a filter passing only 32% of blue is **a stage gel**. This
 * passes ~89% of blue. **If a future session substitutes `HEAT_WHITE` here the
 * effect becomes the thing Carl rejected.**
 *
 * ⚠ AND IT IS NOT A FAKE. `radiance` is the reflection of the studio env panels,
 * which are lit by white light. If the filament also lit that little world, the
 * panels would read white x amber. **Multiplying is the first-order model of
 * "the filament is now one of the illuminants of the world this card reflects"**
 * — Carl's own "one world", not a hand-authored influence table.
 *
 * ⚠ FLOOR OF 0.001 PER CHANNEL: the shader raises this to a power, and
 * `pow(0, 0)` is undefined in GLSL.
 *
 * ⚠ DELIBERATELY UNDER-TUNED FOR CRISP GLASS — frosting scatters and will read
 * stronger. Bound to `[b]` in `?cardrig=1`; Carl sets the final value by eye.
 */
export const GLASS_FILTER_TRANSMITTANCE = "#fff2e2";

/**
 * How strongly the filter responds to the filament's own intensity.
 *
 * `amber = filament.intensity * this`, feeding `pow(transmittance, amber)`.
 *
 * ⚠ SEPARATE FROM THE FILAMENT'S OWN FADER, AND THAT SEPARATION IS THE POINT.
 * Carl's method is faders that move independently — *"all the parameters are in
 * place, like a mixing desk. Now we have to move and blend."* Normalising this
 * against `[f]` would make the filament's fader deaf to the tint and confound
 * the desk. `[f]` sets how bright the filament is; this sets how much its light
 * filters the glass.
 *
 * ⚠ BEER-LAMBERT, SO THE RAMP IS `pow` AND NOT `mix`. `mix(vec3(1), tint, a)` is
 * a lerp TOWARD a colour — that is "amber glass", the thing Carl rejected,
 * reached by a different route. `pow(T, density)` is what a filter of varying
 * optical density does: strictly multiplicative, exactly 1.0 at zero, and safe
 * past 1.0 (a denser filter, not a broken one).
 */
export const GLASS_FILTER_STRENGTH = 1.0;

/**
 * How long the filament takes to reach temperature.
 *
 * ⚠ MATCHED TO THE CARD'S OWN FADE, on Carl's instruction: *"see what a filament
 * fade in looks like if its the same as a card fade in."* One arrival language
 * across the whole card rather than two.
 *
 * ⚠ NOTE IT IS NOT THE BACKDROP'S 2400ms. Carl asked to *"keep the backdrops
 * timings"* AND to match the card fade, which are different numbers (2400 vs
 * 2000). The card's is used because it is the direct instruction; whether the
 * 400ms mismatch reads as wrong is for his eye.
 */
export const FILAMENT_HEAT_MS = CARD_RISE_DURATION_MS;

/**
 * Peak emissive intensity at the head.
 *
 * ⚠ IT STARTS LOW, BY INSTRUCTION AND FOR THE SAME REASON AS THE LIGHT FADER.
 * Carl: *"When it comes to implementing the filaments 'on' state, it should be
 * dialed down, so only some 'juice' is flowing through it. Coming from a
 * position of 'low volume' and pushing faders up, filament intensity combined
 * with frosted glass is the way to go here. Rather than pick arbitrary figures.
 * We bring the numbers up."*
 *
 * Bound to `[f]` in `?cardrig=1`.
 */
export const FILAMENT_INTENSITY = 0.45;




/**
 * The filament light's cutoff, in world units (== CSS px).
 *
 * ⚠ IT IS A WINDOW, NOT A REACH — AND NOT A NORMALISER. Read off
 * `three/src/renderers/shaders/ShaderChunk/lights_pars_begin.glsl.js:56-70`:
 *
 *     distanceFalloff = 1 / r^decay
 *     if (cutoffDistance > 0) distanceFalloff *= (1 - (r/cutoff)^4)^2
 *
 * The window MULTIPLIES an already-complete inverse-square falloff. So raising
 * this value cannot brighten anything at close range — it only stops crushing
 * what is further away. **Raising it is free.**
 *
 * ⚠ AND 90 WAS AMPUTATING EACH CARD'S OWN FACE. `CARD_WIDTH_PX` is 186.66, so a
 * card's half-width is 93.3 and the light — at the card's centre — is ~93.5 from
 * its own far end. Against a cutoff of 90 the window reads:
 *
 *     40px → 0.923      60px → 0.644      80px → 0.141      >=90px → ZERO
 *
 * **The outer third of every lit card's own face received no light from its own
 * filament**, which is why Carl's *"the reflection on each card that nearly
 * spans its width"* did not span the width.
 *
 * ⚠ THE OLD COMMENT REASONED FROM THE WRONG NUMBER. It justified 90 with *"the
 * cards are 8px apart, so the reach must comfortably exceed that"* — but 8px is
 * the GAP between card edges, not the distance light travels. What matters is
 * centre-to-surface: ~33px to a diagonal neighbour's nearest edge, ~102px to a
 * same-row neighbour's, ~201px to the far card's.
 *
 * ⚠ WHY 700, stated so it can be CHECKED rather than trusted: the longest
 * distance that must still read is the far card's nearest edge at ~201px. At
 * cutoff 700 the window there is (1 - (201/700)^4)^2 = **0.986** — a 1.4% cost,
 * so `decay: 2` alone shapes the falloff across the whole grid. At cutoff 400
 * that same edge keeps only 47%, and a 389px centre-to-centre receiver keeps
 * 1.1%: the window, not the physics, would be deciding.
 *
 * ⚠ DELIBERATELY UNDER-TUNED FOR CRISP GLASS. The face will be frosted later,
 * and frosting SCATTERS — the same intensity reads stronger once it lands. Do
 * not "correct" a value here that looks low; it is low on purpose.
 */
export const FILAMENT_LIGHT_DISTANCE = 700;

/**
 * How strongly the filament lights the scene, relative to its emissive.
 *
 * Separate from `FILAMENT_INTENSITY` because the two do different jobs: the
 * emissive is how bright the rim ITSELF looks, and this is how much it throws
 * onto everything else. Tuning them together would confound the bloom with the
 * spill.
 *
 * ⚠ UNCHANGED BY THE CUTOFF FIX, BUT NO LONGER KNOWN-GOOD. Lifting
 * `FILAMENT_LIGHT_DISTANCE` 90 → 700 leaves close-range intensity identical —
 * the window is a multiplier, so at the card centre it was already ~1.0. But it
 * restores light across the outer third of every lit card's own face and across
 * the whole grid, so TOTAL light per card rises materially even though no single
 * near-field sample changed.
 *
 * **Expect to retune this by eye**, on `[p]`, using Carl's standing method:
 * all five cards lit, push until other colours shift, then back off.
 */
/**
 * ⚠ RAISED WITH THE HEIGHT, 9 August 2026 — THEY ARE ONE CONTROL. The comment
 * above states it: *"raising z dims the own card as 1/z², so
 * `FILAMENT_LIGHT_POWER` must rise with it."*
 *
 * `FILAMENT_LIGHT_HEIGHT` moved 6 → 16 to clear the crown's apex, which is a
 * 1/z² loss of (16/6)² ≈ 7.1. This restores the surface's own illumination to
 * roughly where it was rather than leaving the card dark and the defect looking
 * like a lighting failure.
 *
 * ⚠ THE COMPENSATION IS ARITHMETIC; THE RESULT IS NOT PREDICTED. Satin's
 * diffuse response is a different surface from the transmissive face this was
 * tuned against, so the compensated value is a STARTING POINT for Carl's
 * standing method — all five cards lit, push until other colours shift, then
 * back off — not a settled number. Bound to `[p]`.
 *
 * ⚠ DERIVED FROM THE HEIGHT CONSTANT, NOT FROM A COPY OF IT. Writing
 * `(16 / 6) ** 2` here would recreate the exact defect being fixed one line
 * above — a number that stops matching the geometry the moment the geometry
 * moves. If `FILAMENT_LIGHT_HEIGHT` changes again, this follows on its own.
 */
/**
 * ⚠ THE HEIGHT IS DEFINED HERE AND RE-EXPORTED BELOW, NOT THE OTHER WAY ROUND.
 * `FILAMENT_LIGHT_HEIGHT`'s documented home is further down this file with the
 * neighbour-ratio analysis it belongs to, but `const` has no hoisting — the
 * power below would read it in its temporal dead zone and throw at module load.
 * Defining the value here and exporting it at its documented site keeps ONE
 * source of truth without moving two large annotated blocks past each other.
 */
const FILAMENT_LIGHT_HEIGHT_VALUE = CROWN_HEIGHT + 11.5;

/** The height this power was originally tuned against, before the 9 Aug fix. */
const FILAMENT_POWER_TUNED_AT_Z = 6;
/** The power that read correctly at that height, on the transmissive face. */
const FILAMENT_POWER_AT_TUNED_Z = 60;

export const FILAMENT_LIGHT_POWER =
  FILAMENT_POWER_AT_TUNED_Z *
  (FILAMENT_LIGHT_HEIGHT_VALUE / FILAMENT_POWER_TUNED_AT_Z) ** 2;

/**
 * How far the filament light sits PROUD of the card plane, in world units.
 *
 * ⚠ THIS IS THE DIAL THAT DECIDES WHETHER NEIGHBOURS ARE LIT AT ALL, and it was
 * never the intensity. Architect, 5 August.
 *
 * ⚠ NO CARD SURFACE HAS A USABLE DIFFUSE RESPONSE. The rim is `metalness: 1`, and
 * `lights_physical_fragment.glsl.js:4` computes
 * `diffuseContribution = diffuseColor * (1 - metalness)` — **exactly zero**. The
 * face is `transmission: 0.97`, and `transmission_fragment.glsl.js:33` mixes 97%
 * of its diffuse away. So every cross-card contribution is SPECULAR ONLY, and
 * specular needs `N·L`.
 *
 * ⚠ AT z = 6 A NEIGHBOUR IS GEOMETRICALLY BLIND TO THE LIGHT. All five cards
 * share one plane, so the direction from a neighbour to the light is essentially
 * in-plane: `N·L = 6/sqrt(33² + 6²) = 0.179` at the closest approach any two
 * cards make, with the reflected lobe pointing away from an orthographic camera
 * on +Z. **Raising POWER multiplies a term that is already near zero** — measured,
 * a 5x power sweep moved the lit card 5.4x and its neighbour not at all.
 *
 * Own-to-neighbour ratio at a 33px lateral gap:
 *
 *     ratio = [ z² / (1089 + z²) ]^1.5
 *     z=6 → 175:1     z=15 → 14:1     z=30 → 3.3:1     z=45 → 1.9:1
 *
 * Carl's brief — *"not as much as its own filament would affect it"* — lands
 * between 15 and 20.
 *
 * ⚠ RAISING z DIMS THE OWN CARD AS 1/z², so `FILAMENT_LIGHT_POWER` must rise with
 * it. **They are one control**, like `roughness` and `lightLevel`.
 *
 * ⚠ THERE IS A FLOOR BUT NO CEILING WAS EVER ESTABLISHED. 6 was chosen so the
 * light was not buried inside its own geometry — see the note at the `pointLight`
 * itself. Confirm the light stays clear of `faceBaseZ` and the rim tube as z rises.
 *
 * ⚠ DELIBERATELY UNDER-TUNED FOR CRISP GLASS — frosting scatters and will read
 * stronger. Low on purpose.
 *
 * ═════════════════════════════════════════════════════════════════════════
 * ⚠⚠ CORRECTED 9 AUGUST 2026, AND EVERY WORD ABOVE THIS LINE DESCRIBES GLASS.
 * ═════════════════════════════════════════════════════════════════════════
 *
 * ⚠ THE ARITHMETIC DEFECT, CARRIED FOR FOUR SESSIONS. The face was rebuilt on
 * 5 August to rise from the rim's base and stand PROUD of it: `FACE_RISE_FROM`
 * is 0 and the crown's apex sits at `CROWN_HEIGHT` = 4.5. **The light stayed at
 * 6.** So the source hangs 1.5 units above the apex of a curved surface — and
 * that is the *"dot in the middle"* Carl reported and every handoff since has
 * listed as outstanding. It was never a design question; it was a number that
 * did not move when the geometry under it did.
 *
 * ⚠ AND IT IS FAR WORSE ON SATIN THAN IT WAS ON GLASS. The reasoning above is
 * explicitly built on there being NO usable diffuse response — the face was
 * `transmission: 0.97`, which mixes 97% of the diffuse away, so the whole
 * neighbour analysis is specular-only. **Satin is diffuse.** A point source
 * 1.5 units above a diffuse crown produces a hard hot spot with visible
 * falloff: the exact opposite of the long soft bands Carl's references show,
 * and it would defeat the brief — *"the most important thing with the cards is
 * to bring out the geometry."*
 *
 * ⚠ DERIVED FROM THE APEX, NOT TYPED — which is the whole reason the old value
 * went stale. Clearance above the crown, so raising `CROWN_HEIGHT` can never
 * again leave the light stranded inside the surface it is meant to rake.
 *
 * ⚠ THE RATIO THE BRIEF ACTUALLY CONSTRAINS. Carl's own-to-neighbour brief is
 * *"not as much as its own filament would affect it"*, and the table above puts
 * that between z=15 and z=20 — but that table was computed for a SPECULAR-ONLY
 * surface. With diffuse restored the neighbour term is no longer near-zero, so
 * the ratio must be re-measured on satin rather than inherited. **This value is
 * a starting point for that measurement, not its conclusion.**
 *
 * ⚠ RAISING z DIMS THE OWN CARD AS 1/z², so `FILAMENT_LIGHT_POWER` MUST rise
 * with it — they are one control. That re-derivation is chunk 1's tuning pass,
 * on Carl's standing method: all five cards lit, push until other colours
 * shift, then back off.
 */
export const FILAMENT_LIGHT_HEIGHT = FILAMENT_LIGHT_HEIGHT_VALUE;

/**
 * How long the filament takes to cool once the card is pressed again.
 *
 * ⚠ FASTER THAN THE CIRCUIT, AND DELIBERATELY SO. Carl, 4 August: *"pressing
 * inside the card should have all the filament fading out... A user may change
 * his mind about the choice."*
 *
 * ⚠ THE WAY BACK IS NOT THE WAY IN. Lighting travels a circuit and takes 2400ms
 * because the journey IS the statement — *"I am choosing this."* Releasing a
 * choice should not perform the same ceremony in reverse; it should just let go.
 * A deselection that took as long as a selection would make changing your mind
 * feel as weighty as making it up.
 *
 * ⚠ AND IT IS NOT A RETRACE. The whole element cools at once, which is also what
 * the physics gives: current stops everywhere simultaneously, so there is no end
 * for the heat to withdraw toward.
 *
 * PROVISIONAL under D-035.
 */
export const FILAMENT_COOL_MS = 900;

/**
 * How brightly the bevel glows once the head has passed it.
 *
 * ⚠ DIALLED DOWN ON CARL'S REPORT, 4 August: *"the bevel is too bright, it
 * should be dialled down."*
 *
 * ⚠ AND IT SHOULD SIT BELOW THE RIM BY DESIGN, NOT JUST BY TASTE. The bevel is
 * glass CARRYING the filament's light, not a source of its own — the same
 * ordering that chunk 1 had to correct when a near-white bevel was out-shining
 * the metal it holds. If the holder glows as hard as the element, the card stops
 * reading as a filament in a mount.
 *
 * PROVISIONAL under D-035; bound to no key yet — say the word and it gets one.
 */
export const BEVEL_GLOW = 0.45;

/**
 * How sharply the bevel's latch switches on, as a fraction of the circuit.
 *
 * ⚠ THE TRIGGER STRADDLES THE HEAD RATHER THAN SITTING BEHIND IT. Used as
 * `smoothstep(-TRIGGER, +TRIGGER, head - pos)`, so the glass reaches half
 * brightness exactly AS the head passes and settles immediately after.
 *
 * ⚠ CARL SAW THE VERSION THAT LAGGED: *"the bevel being affected is too far
 * behind. There is a noticable gap, even without zooming in."* It used
 * `smoothstep(0, 0.035, ...)`, which only completes a full core-length after the
 * head — about 15px on this card's top edge, and plainly visible.
 *
 * ⚠ SMALL, BECAUSE THE GAP IS THE DEFECT. Widening this to soften the edge
 * reintroduces exactly what he reported; the softness belongs in the falloff
 * behind, not in the trigger's own width.
 *
 * PROVISIONAL under D-035.
 */


/**
 * How hot the rim stays behind the head, once the head has moved on.
 *
 * ⚠ A FLOOR, NOT A DECAY TO ZERO — and the difference is what makes the circuit
 * end with the whole rim lit. The head is white-hot at 1.0; the metal it has
 * already passed settles to this and holds.
 *
 * ⚠ IT IS THE DESIGN REFERENCE'S OWN REQUIREMENT: *"The rim behind the head
 * stays warm rather than snapping back to grey... By the end of the circuit the
 * whole rim is hot."* Current keeps flowing through metal the head has passed —
 * it does not cool while the circuit is still being made.
 *
 * ⚠ AND CARL CAUGHT THE VERSION THAT DID DECAY: *"filament sets off but at a
 * certain point seems to lose some of its intensity at the beginning... its
 * still there when the circuit is complete."* Measured on the origin patch, mean
 * red channel: 236 as the head passed, 172 by mid-circuit.
 *
 * PROVISIONAL under D-035 — the gap between 1.0 and this value is how much
 * hotter the travelling head reads than its own trail.
 */

/**
 * The rim's emissive multiplier — how bright "fully hot" renders.
 *
 * ⚠ IT MUST LEAVE THE TRAIL HEADROOM, which is a stronger constraint than it
 * looks. At 12.0 a perimeter scan mid-circuit found the ENTIRE top edge pegged
 * at 255 while the head was still on the right edge: the trail had saturated, so
 * the head — which should be the hottest thing on the card — had nowhere
 * brighter to go, and measured 119 points DIMMER than what it had left behind.
 *
 * ⚠ SATURATION DESTROYS THE ONE RELATIONSHIP THE DESIGN DEPENDS ON. A hot core
 * with a cooler trail is the whole difference between heat travelling through
 * metal and a bar filling up. Once the trail clips, that difference cannot be
 * expressed at any tail-floor value.
 *
 * PROVISIONAL under D-035, and the one to reach for FIRST if the filament needs
 * to be brighter — raising it past the clipping point buys nothing.
 */
export const FILAMENT_GLOW = 3.2;

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

