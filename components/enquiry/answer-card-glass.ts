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

import { CARD_RISE_DURATION_MS } from "./answer-card-geometry";

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
export const LIGHT_LEVEL = 0.35;

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

/**
 * How long the head takes to leave the origin and meet itself again.
 *
 * ⚠ THE SAME 2400ms AS THE REGION SHIFT, DELIBERATELY. Carl: *"The blue pixels
 * will turn teal in the same time frame as the filament takes to do a circuit"*
 * — one clock, two expressions, finishing together. Imported from
 * `answer-card-backdrop-geometry.ts` rather than redeclared.
 */


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
 * The settled colour: warm white, sitting between amber and true white.
 *
 * ⚠ NOT PURE WHITE AND NOT THE RAIL'S AMBER — Carl's *"somewhere between the
 * two."* A real filament at 2800K is white with a warm cast, which is what this
 * is; the amber's brand job is carried by the ramp it travels through rather
 * than by where it stops.
 */
export const HEAT_WHITE = "#ffd9a8";

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
 * The travelling light's reach, in world units (== CSS px).
 *
 * ⚠ THIS IS WHAT PUTS LIGHT ON THE NEIGHBOURS. Carl's spill onto card 2's left
 * side and card 4's top is a function of this radius — too small and the head
 * lights only its own card, which is the *"painted glow"* the design reference
 * rules out. The cards are 8px apart, so the reach must comfortably exceed that.
 */
export const FILAMENT_LIGHT_DISTANCE = 90;

/**
 * How strongly the travelling head lights the scene, relative to its emissive.
 *
 * Separate from `FILAMENT_INTENSITY` because the two do different jobs: the
 * emissive is how bright the rim ITSELF looks, and this is how much it throws
 * onto everything else. Tuning them together would confound the bloom with the
 * spill.
 */
export const FILAMENT_LIGHT_POWER = 60;

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

