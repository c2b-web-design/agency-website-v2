"use client";

/**
 * Q&A answer-card mesh — ONE compound object built from three concentric parts
 * read as a single assembly:
 *
 *   RIM   — a HALF-TUBE swept along the card's rounded-rectangle perimeter. Its
 *           outermost point IS the approved 186.66 x 48 silhouette; nothing may
 *           extend beyond it.
 *   BEVEL — a swept band, sloping inward and TOWARD THE VIEWER.
 *   FACE  — a slightly convex plane, RECESSED behind the rim's apex.
 *
 * All three are placed on ONE sampled path (`sampleRoundedRectPath`) at
 * different insets, so their silhouettes are true parallel offsets of each other
 * and cannot drift apart.
 *
 * ⚠ CARL'S SPECIFICATION, 3 August 2026:
 *   *"It already has a rim where the filament goes. What I imagine after that,
 *   if I describe just the top, is a 'slope' that comes toward us. Equidistant
 *   all the way around. Top, bottom, sides and corners. The face can be flat or
 *   slightly convex."*
 *   *"The rim should be a half tube, that way it will emit light onto the bevel
 *   and face, and if it's making a journey down the right hand side it will
 *   affect the 2 card and all other cards will be affected by proximity."*
 *
 * ⚠ THE HALF-TUBE IS A LENS FOR THE LIGHT IT WILL CARRY (chunk 4). A flat rim
 * emits roughly forward. A half-round presents every angle between the face and
 * the outer edge at once, so ONE geometry throws light three ways: inward onto
 * the bevel and face, outward to neighbouring cards, and at the viewer. That is
 * the whole reason the filament's secondary effects come for free in a real
 * scene and had to be hand-authored in CSS (`GRID_REFL`, `--sweep-pass`).
 *
 * ⚠ THIS IS NOT THE CONTACT FIELD'S RIM. That one is a flat `ExtrudeGeometry`
 * (`contact-field-mesh.tsx`, RIM_DEPTH 6, bevelEnabled false). The helpers below
 * are COPIED rather than imported: the contact field is APPROVED and must not
 * move when this card is tuned.
 *
 * GEOMETRY PROOF ONLY: neutral three-tone diagnostic material, no colour
 * direction, no transmission, no clearcoat, no environment map, no filament, no
 * text. All values are named constants so later tuning is a value change.
 */

import { useMemo, useEffect, useRef, useCallback, useState } from "react";
// ⚠ `useThree` FOR `invalidate` — the canvas is `frameloop="demand"`, so an
// animation that does not request frames is an animation that does not run.
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import {
  CARD_WIDTH_PX,
  CARD_HEIGHT_PX,
  CARD_RADIUS_PX,
  RIM_TUBE_RADIUS,
  BEVEL_WIDTH,
  BEVEL_RISE,
  BEVEL_RISE_RATIO,
  // ⚠ `FACE_TUCK_RATIO`, `CROWN_HEIGHT` AND `FACE_SEAM_SINK` ARE NO LONGER
  // IMPORTED. All three belonged
  // to the recess model, where the crown's height and the face's sink were two
  // hand-held numbers that had to be changed together. Since the 6 August
  // rebuild the crown is DERIVED from how proud the apex must sit
  // (`FACE_CROWN_RISE`), so importing them would be importing the old model.
  CROWN_PLATEAU_U,
  FACE_RISE_FROM,
  FACE_CROWN_RISE,
  cardBudget,
} from "./answer-card-geometry";
import {
  GLASS_THICKNESS,
  GLASS_IOR,
  /**
   * ⚠ THE SATIN — chunk 1, 9 August 2026. Glass is discarded on Carl's decision.
   *
   * ⚠ `GLASS_COLOR`, `GLASS_ROUGHNESS`, `GLASS_TRANSMISSION` and
   * `GLASS_ENV_INTENSITY` ARE NO LONGER IMPORTED. A first pass kept them with a
   * comment claiming the diagnostic path still needed them; **the linter proved
   * that false** — nothing in this file read them once the face changed. They
   * remain EXPORTED from `answer-card-glass.ts`, where their documentation is
   * the record of what the transmissive face was and why it could not disclose
   * the crown. `GLASS_THICKNESS` and `GLASS_IOR` below ARE still used.
   */
  SATIN_COLOR,
  SATIN_ROUGHNESS,
  SATIN_SHEEN_COLOR,
  SATIN_SHEEN_ROUGHNESS,
  SATIN_ANISOTROPY,
  SATIN_ANISOTROPY_ROTATION,
  SATIN_ENV_INTENSITY,
  RIM_METAL_COLOR,
  RIM_METALS,
  RIM_METALNESS,
  RIM_ROUGHNESS,
  RIM_ENV_INTENSITY,
  FILAMENT_INTENSITY,
  FILAMENT_LIGHT_DISTANCE,
  FILAMENT_LIGHT_POWER,
  FILAMENT_LIGHT_HEIGHT,
  GLASS_FILTER_TRANSMITTANCE,
  GLASS_FILTER_STRENGTH,
  BEVEL_GLOW,
  FILAMENT_GLOW,
  HEAT_RED,
  HEAT_ORANGE,
  HEAT_WHITE,
  BEVEL_GLASS_COLOR,
  BEVEL_ROUGHNESS,
  BEVEL_CLEARCOAT,
  BEVEL_CLEARCOAT_ROUGHNESS,
  BEVEL_ENV_INTENSITY,
  LIGHT_LEVEL,
  GLASS_CLEARCOAT,
  GLASS_CLEARCOAT_ROUGHNESS,
} from "./answer-card-glass";

/**
 * Every card material is built `transparent`, so the entrance can drive
 * `opacity` without three linking a new shader.
 *
 * ⚠⚠ `transparent` IS PART OF THE PROGRAM CACHE KEY, AND THAT IS THE WHOLE
 * REASON THIS CONSTANT EXISTS. The entrance fade (`CardLighting` in
 * `answer-card-canvas.tsx`) first flipped it false -> true -> false around each
 * card's rise. That is the obvious implementation and it is a trap: the flip
 * forces a fresh shader LINK on the card's first fading frame, which
 * `useScenePrecompile` cannot have warmed because it compiles materials as they
 * exist at compile time.
 *
 * ⚠ MEASURED, WITH A CONTROL — self-time in `getProgramParameter`, the driver
 * blocking on link (`verify/stall-profile.mjs`):
 *
 *     built opaque, toggled per fade    1977ms
 *     built transparent (this)           725ms
 *
 * The extra 1250ms arrived as one ~1490ms freeze partway through the ladder.
 * Carl saw it exactly: *"cards 1+2 look good, 3 happens, then a pause, 3 flashes
 * and 4+5 come on."*
 *
 * ⚠ THE COST OF LEAVING IT TRUE IS REAL AND IS ACCEPTED KNOWINGLY.
 * `transparent === true` routes a material out of `opaqueObjects`
 * (`three.module.js:8237`), and `renderTransmissionPass` renders ONLY
 * `opaqueObjects` into the target the glass samples (`:18039`) — so a card's rim
 * is not present in what its NEIGHBOURS refract. On this grid that is a
 * sub-pixel effect: the cards are 186x48 with ~8px between them, the face is
 * `transmission: 0.97` sampling a blurred mip, and no card overlaps another.
 * **The 1490ms freeze was plainly visible; this is not.** If it ever does show,
 * the fix is a depth-sorted opaque pass, NOT a per-frame `transparent` flip.
 *
 * ⚠ AND `depthWrite` STAYS TRUE. three defaults `transparent` materials to
 * writing depth anyway, but making it explicit prevents the rim/face ordering
 * from becoming camera-dependent — they are coincident surfaces on a flat ortho
 * view, where a lost depth write reads as z-fighting.
 */
const ENTRANCE_NEEDS_ALPHA = true;

/**
 * The material properties that are adjustable during the mastering pass.
 *
 * ⚠ `thickness` AND `ior` ARE DELIBERATELY ABSENT. Under an orthographic camera
 * their maximum effect across the whole face is 0.801px — they would move
 * numbers and change nothing on screen. See `answer-card-glass.ts` for the
 * measured displacement table.
 *
 * ⚠ `lightLevel` JOINED THEM ON 4 AUGUST because Carl's method needs it as a
 * fader rather than a constant — see `GLASS_RIG_PARAMS` in
 * `answer-card-canvas.tsx`.
 */
/**
 * The filament's live state, carried in refs.
 *
 * ⚠ REFS, NOT PROPS. The head moves every frame for 2400ms; passing it as a prop
 * would mean a React render per frame, rebuilding the scene graph to move one
 * number.
 *
 * (This note used to cite `useRegionShift` in the backdrop as the matching case.
 * That hook animated the lockup's per-card colour and was removed with the
 * lockup on 5 August 2026 — the reasoning it shared with this one is now stated
 * here directly rather than by reference to code that no longer exists.)
 */
export type FilamentState = {
  /** Overall intensity — 0 when unlit. The fader. */
  intensity: React.RefObject<number>;
  /**
   * Position on the black-body ramp: 0 = first dull red, 1 = settled warm white.
   *
   * ⚠ SEPARATE FROM `intensity` BECAUSE COLOUR AND BRIGHTNESS ARE NOT THE SAME
   * JOURNEY. A filament reaches most of its brightness before it reaches its
   * final colour, and on the way out the colour falls back down the ramp while
   * the brightness fades — holding one while moving the other is what makes it
   * read as metal rather than as a dimmer switch.
   */
  temperature: React.RefObject<number>;
};

export type GlassTuning = {
  roughness: number;
  transmission: number;
  lightLevel: number;
  /** The rim metal's own surface roughness — the dial with real range on it. */
  rimRoughness: number;
  /** Index into `RIM_METALS`. Cycled with `[m]`; see that constant for why. */
  rimMetal: number;
  /** The filament's peak intensity — the second fader in the mastering pass. */
  filamentIntensity: number;
  /**
   * The filament light's cutoff. ⚠ A WINDOW, NOT A REACH — raising it cannot
   * brighten anything at close range. See `FILAMENT_LIGHT_DISTANCE`.
   */
  filamentDistance: number;
  /** How hard the filament throws light onto everything else. */
  filamentPower: number;
  /**
   * How far the filament light sits proud of the card plane.
   * ⚠ THE DIAL THAT DECIDES WHETHER NEIGHBOURS ARE LIT AT ALL — not power. See
   * `FILAMENT_LIGHT_HEIGHT`.
   */
  filamentHeight: number;
  /**
   * How strongly the filament's own light filters the glass it sits in.
   * ⚠ A FILTER, NOT A MATERIAL — see `GLASS_FILTER_TRANSMITTANCE`.
   */
  glassFilterStrength: number;
  /**
   * The face's polished skin over its frosted body.
   * ⚠ SWEEP IT WITH `roughness`, NEVER ALONE — see `GLASS_CLEARCOAT`.
   */
  glassClearcoat: number;
  /** How sharp that skin's reflection is. Inert while the coat is 0. */
  glassClearcoatRoughness: number;
  /**
   * ⚠ THE SATIN DIALS — chunk 1, 9 August 2026. Glass is discarded; these are
   * the values that decide whether the crown's 23.8° discloses itself.
   */
  satinAnisotropy: number;
  satinAnisotropyRotation: number;
  satinSheenRoughness: number;
};

export const DEFAULT_GLASS_TUNING: GlassTuning = {
  // ⚠ `roughness` NOW CARRIES THE SATIN, NOT THE FROST. The key is reused rather
  // than renamed so the rig binding, the `?roughness=` harness door and every
  // existing sweep keep working — the dial's MEANING changed with the material,
  // its identity did not.
  roughness: SATIN_ROUGHNESS,
  // Transmission is dead on the face. Kept in the type for the diagnostic path.
  transmission: 0,
  lightLevel: LIGHT_LEVEL,
  rimRoughness: RIM_ROUGHNESS,
  rimMetal: 0,
  filamentIntensity: FILAMENT_INTENSITY,
  filamentDistance: FILAMENT_LIGHT_DISTANCE,
  filamentPower: FILAMENT_LIGHT_POWER,
  filamentHeight: FILAMENT_LIGHT_HEIGHT,
  glassFilterStrength: GLASS_FILTER_STRENGTH,
  glassClearcoat: GLASS_CLEARCOAT,
  glassClearcoatRoughness: GLASS_CLEARCOAT_ROUGHNESS,
  satinAnisotropy: SATIN_ANISOTROPY,
  satinAnisotropyRotation: SATIN_ANISOTROPY_ROTATION,
  satinSheenRoughness: SATIN_SHEEN_ROUGHNESS,
};

// ── Diagnostic material ──────────────────────────────────────────────────────
//
// ⚠ GREY IS THE POINT, NOT A PLACEHOLDER. A form defect hides behind a colour
// that already looks plausible: the contact field's 5.67-degree crown failure
// was only findable under a diagnostic material, because a blue-tinted card
// would have read as "roughly right" and carried the defect into the material
// chunk. Confirmed by Carl, 3 August.
// ⚠ THE RIM'S AND BEVEL'S DIAGNOSTIC GREYS ARE RETIRED — both now carry a real
// material brief from Carl (4 August): the rim is unlit tungsten, the bevel is
// the glass holder that supports it. The diagnostic did its job; the form it was
// protecting is approved.
//
// ⚠ AND THEY CAME BACK ON 5 AUGUST 2026, for a reason the note above could not
// have anticipated: the form they were protecting turned out NOT to be right.
// The bevel and face never meet — there is a 5.00-unit unmodelled step at the
// seam (`verify/cross-section.mjs`) — and it went unseen for sessions because a
// dark transmissive card looks identical whether a surface is there or not.
//
// ⚠ CARL: *"i will have no way of knowing if its right if its clear glass...
// ramp it up so i can see something more substantial and then shine a light on
// it so i can zoom in and check."* THREE DISTINCT GREYS, so the eye can tell
// where one surface ends and the next begins before interpreting any lighting.
//
// Reached with `?clay=1`. The glass path is untouched and still the default.
// ⚠ THE FACE IS WHITE, ON CARL'S INSTRUCTION: *"make the face white so the
// effect will be clearly visible."* A mid-grey face compresses the very range
// the study is reporting — the three states of his sketch are LIGHTER above the
// rim, SHADOWED at rim level, DARKER below, and a surface starting at 66% has
// little room to brighten and muddies the shadow. White gives the full range in
// both directions.
//
// ⚠ AND THE RIM IS NOW DARKER THAN THE FACE, deliberately reversing the earlier
// pairing. The rim's job here is to be the thing that CASTS onto the face, so it
// needs to read as a distinct object in front of a bright surface rather than
// competing with it.
const DIAG_FACE_COLOR = "#ffffff";
const DIAG_RIM_COLOR = "#9a9a9a";
const DIAG_BEVEL_COLOR = "#8a8a8a";

/**
 * The face's glass — and the filter its own filament puts over it.
 *
 * ⚠ THE GOVERNING SENTENCE LIVES AT `GLASS_FILTER_TRANSMITTANCE`, IN CARL'S OWN
 * WORDS. Read it before changing anything here. The short form: **a filter, not
 * a material; subtraction, not addition; it exists only while the light does.**
 * This physics was agreed three times across three sessions and never survived
 * into the build, because it lived in chat while the code carried only values.
 *
 * ⚠ THE MULTIPLY LANDS ON `radiance` — THE ENV REFLECTION — AND NOTHING ELSE.
 * That band is the mirrored image of the studio's two COOL panels
 * (`#dceaff` / `#9fb4d0`), swept across the convex crown. It is the "white
 * reflection" in Carl's sentence, and filtering it is what makes the glass tinge
 * rather than glow.
 *
 * ⚠ AND IT SURVIVES TRANSMISSION AT FULL STRENGTH. `meshphysical.glsl.js:193-198`
 * — `transmission_fragment` mixes only `totalDiffuse`; `totalSpecular` is added
 * unmodified. So the band the eye reads is not the 3% of diffuse that survives
 * `transmission: 0.97`; it is the specular term, untouched.
 *
 * ⚠ INSERTED **BEFORE** `<lights_fragment_end>`, NEVER AFTER. `radiance` is
 * written at `lights_fragment_maps.glsl.js:33` and CONSUMED by
 * `RE_IndirectSpecular` inside `lights_fragment_end.glsl.js:16`. Tinting after
 * that include writes to a dead variable — **it compiles, runs, and does
 * nothing**, and the natural reading of the result would be "the premise was
 * wrong" rather than "the insertion point was".
 */
function FaceMaterial({
  envMap,
  envMapIntensity,
  color,
  roughness,
  anisotropy,
  anisotropyRotation,
  sheenColor,
  sheenRoughness,
  labelMap,
  labelTealMap,
  hovered,
  filament,
  filterStrength,
  clearcoat,
  clearcoatRoughness,
}: {
  envMap: THREE.Texture | null;
  envMapIntensity: number;
  /**
   * ⚠ WHITE WHEN `labelMap` IS PRESENT. The map carries the satin body colour
   * AND the glyphs, because `color` multiplies `map` and no single `color` can
   * serve both. See `buildLabelTexture`.
   */
  color: string;
  roughness: number;
  /** The answer label, drawn into the face's albedo. Null on the warm-up card. */
  labelMap: THREE.Texture | null;
  /** The same label in the rail's teal — the hover target. Blended, not swapped. */
  labelTealMap: THREE.Texture | null;
  /** Whether the pointer is over this card. Drives `uHover` through an ease. */
  hovered: boolean;
  /** Satin's smear along the tangent. Inert without a `tangent` attribute. */
  anisotropy: number;
  /** The smear's direction, radians from the tangent. 0 = along the roll. */
  anisotropyRotation: number;
  /** The near-white grazing lobe that carries the peak. */
  sheenColor: string;
  sheenRoughness: number;
  filament: FilamentState;
  filterStrength: number;
  clearcoat: number;
  clearcoatRoughness: number;
}) {
  const uniforms = useRef({
    /** Optical density of the filter — 0 is clear glass. */
    uAmber: { value: 0 },
    uGlassFilter: { value: new THREE.Color(GLASS_FILTER_TRANSMITTANCE) },
    /**
     * ⚠ THE HOVER BLEND, 0 → 1. Two label textures exist — resting white and
     * rail teal — and this mixes between them on the GPU.
     *
     * ⚠ WHY A BLEND AND NOT A REDRAW. The label lives in a 2048x512 canvas, so
     * fading its colour by rebuilding would mean redrawing that canvas several
     * times per hover — visibly stepped, and a cost paid on the main thread at
     * exactly the moment the user is interacting. Building both textures once
     * and mixing them costs one extra sampler.
     */
    uHover: { value: 0 },
    uLabelTeal: { value: null as THREE.Texture | null },
  });

  const invalidate = useThree((s) => s.invalidate);

  useFrame(() => {
    // ⚠ DRIVEN BY THE FILAMENT'S OWN INTENSITY, UNNORMALISED — Carl: *"if the
    // intensity of the filament was reduced so would the impact on the
    // reflection, and if it was ramped up."* `intensity.current` already carries
    // the `[f]` fader (`answer-card-canvas.tsx:818`), so raising `[f]` raises the
    // tint. Dividing by the fader here would make `[f]` deaf to the filter and
    // confound the desk.
    uniforms.current.uAmber.value = Math.min(
      4,
      Math.max(0, filament.intensity.current * filterStrength),
    );

    // ⚠ THE SAMPLER IS REFRESHED HERE BECAUSE THE TEXTURE IS REBUILT WHENEVER
    // THE LABEL CHANGES. `onBeforeCompile` runs once per program; a texture
    // created after that would never reach the shader, and the hover would fade
    // toward a blank map instead of the teal — a uniform that moves and changes
    // no pixels, which this file has already been caught by twice.
    uniforms.current.uLabelTeal.value = labelTealMap;
  });

  /**
   * ⚠⚠ THE HOVER EASE HAS ITS OWN rAF AND CALLS `invalidate()` — IT MUST NOT
   * LIVE IN `useFrame`.
   *
   * It did, and it worked only by accident: `TravellingLight` runs an
   * unconditional rAF loop, so the canvas was drawing continuously and
   * `useFrame` happened to tick. **Under `prefers-reduced-motion` the traveller
   * parks** (`answer-card-canvas.tsx`, the `reducedMotion` branch) **and the
   * ease loses its frame source entirely — the teal would never arrive at all.**
   *
   * ⚠ THIS FILE ALREADY RECORDS THE TRAP TWICE (lines ~315 and ~1855): *"a ref
   * animated without invalidating produced three repaints across an entire
   * 2000ms fade."* The canvas is `frameloop="demand"`; anything that animates
   * must request its own frames.
   *
   * ⚠ AND IT STOPS WHEN SETTLED, which is the other half of demand mode. A loop
   * that runs forever would hold the canvas awake for the life of the page —
   * the `useFilament` cooldown has exactly this shape and terminates the same
   * way.
   */
  useEffect(() => {
    const target = hovered ? 1 : 0;
    const u = uniforms.current.uHover;

    /**
     * ⚠⚠ NOTHING TO DO IS THE COMMON CASE, AND STARTING A LOOP FOR IT COST
     * CARL A VISIBLE Q5 STALL. This effect runs on MOUNT for every card, and
     * ten card instances exist (five real, five in the warm-up canvas). Without
     * this guard all ten started an rAF that called `invalidate()` — during the
     * Q5 reveal, the one window `3a7cf1f` exists to keep clear.
     *
     * Measured on the real GPU, worst frame gap inside the reveal:
     *
     *     7b056c2  resting light, before any hover work   161ms
     *     4c7a20e  + the second texture per card          312ms
     *     e3a5b7c  + ten unguarded rAF loops              620ms
     *
     * **Each hover commit roughly doubled it**, back to where the stutter was
     * before it was ever fixed (584ms). The uniform already equals its target at
     * mount, so there is genuinely nothing to animate — the loop existed only to
     * discover that, once per card, at the worst possible moment.
     */
    if (Math.abs(target - u.value) <= 0.002) {
      u.value = target;
      return;
    }

    /**
     * ⚠ EXPONENTIAL, NOT A FIXED DURATION, because the pointer can leave
     * mid-transition: this turns round from wherever it got to without a jump.
     * Frame-rate independent via `delta` — a fixed step would fade at half
     * speed on a 30fps display.
     */
    let raf = 0;
    let last = performance.now();
    const tick = () => {
      const now = performance.now();
      const delta = (now - last) / 1000;
      last = now;

      u.value += (target - u.value) * Math.min(1, delta / LABEL_HOVER_TAU);
      invalidate();

      // Settle and stop. The epsilon matters: an exponential never exactly
      // arrives, so without it this would spin forever a hair from the target.
      if (Math.abs(target - u.value) > 0.002) {
        raf = requestAnimationFrame(tick);
      } else {
        u.value = target;
        invalidate();
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [hovered, invalidate]);

  const onBeforeCompile = useCallback((shader: THREE.WebGLProgramParametersWithUniforms) => {
    Object.assign(shader.uniforms, uniforms.current);

    shader.fragmentShader = `
      uniform float uAmber;
      uniform vec3  uGlassFilter;
      uniform float uHover;
      uniform sampler2D uLabelTeal;

      /**
       * ⚠ THE SEAM. Today the filter is uniform across the face; the filament is
       * a closed LOOP around the rim, so a later step weights this by distance
       * from the perimeter — Carl: *"you will also have the filament on its
       * bottom edge whose light will travel through glass and add to the
       * reflection."*
       *
       * Replacing this function body is the WHOLE of that change: the insertion
       * point, the uniform, the driver and the operation are identical under
       * either model. **Nothing about building on a point source has to be
       * undone** — the point source is not in this shader, only its intensity is.
       */
      float cardPerimeterWeight() { return 1.0; }

      ${shader.fragmentShader}
    `.replace(
      "#include <lights_fragment_end>",
      `
       // ⚠ BEER-LAMBERT: T = T0^density. A filter of increasing optical density,
       // NOT a lerp toward a colour. A mix() toward a tint would be "amber
       // glass" — the thing Carl explicitly rejected — reached by another route.
       // pow() is strictly multiplicative: exactly 1.0 at zero density, it can
       // never wash out or overshoot, and a density past 1.0 is simply a denser
       // filter rather than a broken one.
       radiance *= pow(max(uGlassFilter, vec3(0.001)), vec3(uAmber * cardPerimeterWeight()));
       #include <lights_fragment_end>
      `,
    ).replace(
      "#include <map_fragment>",
      `#include <map_fragment>
       #ifdef USE_MAP
       {
         /**
          * ⚠ THE HOVER TEAL, MIXED INTO THE ALBEDO. Both textures carry the
          * whole face — body colour, relief and glyphs — so mixing them is a
          * straight cross-fade between two finished images. Only the glyph
          * pixels differ between the two, so the body and the relief are
          * unchanged by the blend and only the TEXT changes colour.
          *
          * ⚠ AFTER map_fragment, NOT BEFORE. That chunk is what samples the
          * map into diffuseColor in the first place; injecting ahead of it
          * would be overwritten on the next line.
          *
          * ⚠ NO BACKTICKS IN THIS COMMENT. It lives inside a JS template
          * literal, so a backtick here closes the string and the file stops
          * compiling — which is exactly what happened on the first write.
          */
         vec4 tealTexel = texture2D(uLabelTeal, vMapUv);
         diffuseColor = mix(diffuseColor, tealTexel * vec4(diffuse, opacity), uHover);
       }
       #endif`,
    );
  }, []);

  return (
    <meshPhysicalMaterial
      envMap={envMap}
      envMapIntensity={envMapIntensity}
      color={color}
      roughness={roughness}
      metalness={0}
      /**
       * ⚠ TRANSMISSION IS GONE — THE FACE IS SATIN, 9 August 2026. It is passed
       * as 0 rather than removed so the prop's contract is unchanged for the
       * clay/diagnostic path and for anything still reading `glassTuning`.
       *
       * ⚠ AND ITS REMOVAL IS THE WHOLE POINT OF THE CHUNK, not a side effect.
       * `transmission_fragment.glsl.js:33` mixes away 97% of the diffuse, so the
       * 23.8° crown could not disclose itself no matter how it was lit —
       * measured flat before the change (`verify/crown-disclosure.mjs`).
       */
      /**
       * ⚠⚠ THERE IS DELIBERATELY NO `customProgramCacheKey` HERE, AND ADDING ONE
       * COST CARL A VISIBLE Q5 STALL.
       *
       * One was added on 10 August to "fix" a hover teal that was never broken —
       * the evidence was a harness returning a false negative because it sampled
       * the white relief halo rather than the glyph core. A unique key defeats
       * three's program cache, so the face material **re-links its shader
       * instead of reusing the compiled one**, on the main thread, inside the
       * 1300ms Q5 reveal.
       *
       * Profiled on the real GPU during the reveal: `getProgramParameter`
       * **74.6ms** and `getProgramInfoLog` **16.5ms** of self time — link work,
       * in the one window `3a7cf1f` exists to keep clear. Carl: *"Q5 stalls"*.
       *
       *     7b056c2  before any hover work   132-161ms worst frame gap
       *     e3a5b7c  with the cache key      617-624ms
       *
       * ⚠ THE GENERAL RULE: `onBeforeCompile` changes do NOT need a custom cache
       * key in this codebase — the three sibling materials in this file inject
       * shaders without one and always have. A key is only needed when the
       * injected source varies **between instances of the same material**, which
       * none of these do.
       */
      transmission={0}
      /**
       * ⚠ THE SMEAR. This is what makes the surface satin rather than a shiny
       * blue plastic: the specular lobe is stretched along the tangent, which
       * `convexFaceGeometry` builds along the card's LONG axis — the axis the
       * cylindrical crown does not curve on. The result is a band running the
       * card's width, disclosing the curve across its height.
       *
       * ⚠ INERT WITHOUT THE `tangent` ATTRIBUTE. See `convexFaceGeometry`.
       */
      anisotropy={anisotropy}
      anisotropyRotation={anisotropyRotation}
      /**
       * ⚠ THE SHEEN IS A SEPARATE LOBE FROM THE SPECULAR, and it is what carries
       * the near-white peak in Carl's references while the body stays deep blue.
       * `sheenColor` is the light the surface returns at grazing angles — the
       * fabric behaviour — where `color` is the albedo underneath it.
       */
      sheen={1}
      sheenRoughness={sheenRoughness}
      sheenColor={sheenColor}
      /**
       * ⚠ THE ANSWER LABEL, AS PART OF THE SURFACE. Mapped onto the face's own
       * UVs so it is transformed, lit and faded by this mesh — see
       * `buildLabelTexture` for why three DOM versions could not be made to read
       * as one object with the card.
       *
       * ⚠ IT IS THE `map`, NOT AN EMISSIVE. Emissive text would glow at a fixed
       * brightness regardless of the light, which would make the label the one
       * part of the card that does NOT respond to the hover arc in chunk 2 —
       * precisely backwards. On `map` the glyphs are albedo: they take the
       * satin's own lighting, brighten under the bloom, and will travel with the
       * moving light.
       *
       * ⚠⚠ `color` MULTIPLIES `map`, AND THAT DECIDES HOW THIS TEXTURE IS BUILT.
       * `MeshPhysicalMaterial` computes albedo as `color * map`, so a deep-blue
       * `color` would drag near-white glyphs down to a dim blue and a white
       * `color` would throw away the satin body colour everywhere else.
       *
       * ⚠ SO THE TEXTURE CARRIES BOTH: the satin blue is painted as its
       * BACKGROUND and the label on top, with `color` left at pure white. The
       * body colour moves from the material into the texture rather than being
       * multiplied against it. One albedo, no compromise at either end.
       */
      map={labelMap ?? null}
      // ⚠ KEPT THOUGH TRANSMISSION HAS GONE. `ENTRANCE_NEEDS_ALPHA` is in the
      // PROGRAM KEY, and a material that flips `transparent` mid-fade re-links
      // its shader — measured at 1977ms against 725ms on 7 August, arriving as
      // a ~1490ms freeze. The entrance still fades this face in, so it must be
      // BUILT transparent rather than becoming transparent. See D-046 and
      // `ENTRANCE_NEEDS_ALPHA`.
      transparent={ENTRANCE_NEEDS_ALPHA}
      depthWrite
      // ⚠ THE POLISHED SKIN OVER THE FROSTED BODY. Zero by default, so this is
      // inert until the rig moves it — three skips the clearcoat path entirely
      // at 0, which is also why adding it costs nothing while it stays there.
      // ⚠ IT IS THE PARTNER OF `roughness`, NOT AN INDEPENDENT DIAL. See
      // `GLASS_CLEARCOAT`: the body scatters, the coat stays sharp, and a coat
      // over an already-polished base is just a second specular.
      clearcoat={clearcoat}
      clearcoatRoughness={clearcoatRoughness}
      // ⚠ FIXED, NOT TUNABLE — see answer-card-glass.ts. Under an orthographic
      // camera the crown centre is at normal incidence, so the maximum lateral
      // displacement across the whole face is 0.801px.
      thickness={GLASS_THICKNESS}
      ior={GLASS_IOR}
      side={THREE.DoubleSide}
      onBeforeCompile={onBeforeCompile}
    />
  );
}

/**
 * The rim's material: tungsten that heats.
 *
 * ⚠ THE WHOLE FILAMENT HEATS AT ONCE — there is no position term left in this
 * shader. Carl, 4 August: *"does it have to move? become animated? No. it could
 * fade in, like a real light bulb filament."*
 *
 * ⚠ AND THE TRAVELLING-HEAD MACHINERY IS DELETED, NOT DISABLED. It was ~60 lines
 * of GLSL — a rounded-rect circuit solver plus a core/tail/lead/bleed heat
 * profile — carried by this material AND the bevel's. Leaving it inert would
 * have kept every byte of it in the compile, and **shader size is the cause of
 * the opening stutter** (`live-work/references/opening-stutter.md`). Dead code
 * that costs 1.6s of compile is not dead.
 *
 * ⚠ THE EMISSIVE IS ADDITIVE ON TOP OF THE METAL, NOT A REPLACEMENT FOR IT. The
 * filament design reference is explicit that the rim does not stop being metal
 * when it lights: *"The dynamite fuse burns away. This does not."* So the
 * tungsten keeps reflecting the environment throughout, and the glow is added.
 */
function RimMaterial({
  color,
  roughness,
  envMap,
  envMapIntensity,
  filament,
}: {
  color: string;
  roughness: number;
  envMap: THREE.Texture | null;
  envMapIntensity: number;
  filament: FilamentState;
}) {
  const uniforms = useRef({
    uIntensity: { value: 0 },
    /** Position on the black-body ramp, 0 = first red glow, 1 = settled white. */
    uTemp: { value: 0 },
    uRed: { value: new THREE.Color(HEAT_RED) },
    uOrange: { value: new THREE.Color(HEAT_ORANGE) },
    uWhite: { value: new THREE.Color(HEAT_WHITE) },
  });

  // Keep the uniforms in step with the live filament state. Refs rather than
  // props, because these change every frame while the metal heats and a React
  // render per frame would rebuild the scene graph.
  useFrame(() => {
    const u = uniforms.current;
    u.uIntensity.value = filament.intensity.current;
    u.uTemp.value = filament.temperature.current;
  });

  const onBeforeCompile = useCallback((shader: THREE.WebGLProgramParametersWithUniforms) => {
    Object.assign(shader.uniforms, uniforms.current);

    shader.fragmentShader = `
      uniform float uIntensity;
      uniform float uTemp;
      uniform vec3  uRed;
      uniform vec3  uOrange;
      uniform vec3  uWhite;

      ${shader.fragmentShader}
    `.replace(
      "#include <emissivemap_fragment>",
      `#include <emissivemap_fragment>
       {
         // THE COLOUR CLIMBS THE BLACK-BODY RAMP as the metal heats: dull red,
         // through orange, to a settled warm white. Two mixes rather than one,
         // because the curve is not a straight line between its ends -- the
         // orange midpoint is where a real filament spends most of its climb.
         vec3 heatColor = uTemp < 0.5
           ? mix(uRed, uOrange, smoothstep(0.0, 0.5, uTemp))
           : mix(uOrange, uWhite, smoothstep(0.5, 1.0, uTemp));

         // ADDED, NOT SUBSTITUTED -- the metal keeps reflecting the environment
         // throughout. The design reference: "The dynamite fuse burns away.
         // This does not."
         totalEmissiveRadiance += heatColor * uIntensity * ${FILAMENT_GLOW.toFixed(3)};
       }`,
    );
  }, []);

  return (
    <meshStandardMaterial
      color={color}
      roughness={roughness}
      metalness={RIM_METALNESS}
      envMap={envMap}
      envMapIntensity={envMapIntensity}
      // See `ENTRANCE_NEEDS_ALPHA` — set at construction so the entrance's
      // opacity fade never triggers a shader re-link.
      transparent={ENTRANCE_NEEDS_ALPHA}
      depthWrite
      // ⚠ PRESENT SO THE MATERIAL COMPILES ITS EMISSIVE PATH AT ALL — three
      // omits `<emissivemap_fragment>` entirely when a material has no emissive,
      // and the shader injection above would then have nothing to attach to.
      // The actual colour comes from the black-body ramp per frame.
      emissive={new THREE.Color(HEAT_ORANGE)}
      emissiveIntensity={0}
      side={THREE.DoubleSide}
      onBeforeCompile={onBeforeCompile}
    />
  );
}

// ── The circuit solver: DELETED, 4 August 2026 ───────────────────────────────
//
// A ~40-line GLSL function mapping a fragment to its position around the
// rounded-rectangle perimeter, shared by the rim and bevel so a travelling head
// could be tracked identically by both.
//
// It went with the travelling head. Carl, 4 August: "does it have to move?
// become animated? No. it could fade in, like a real light bulb filament."
//
// DELETED RATHER THAN LEFT UNUSED because shader size is the cause of the
// opening stutter -- see live-work/references/opening-stutter.md. It is in git
// at 1dfce8a if the travelling circuit is ever wanted back.


/**
 * The bevel: glass that carries the filament's heat.
 *
 * ⚠ THE LATCH IS GONE, WITH THE TRAVELLING HEAD IT EXISTED FOR. It answered
 * *"has the head passed me yet"* — a question that stops meaning anything once
 * the whole filament heats at once. Carl, 4 August: *"does it have to move?
 * become animated? No."*
 *
 * ⚠ AND IT IS DELETED RATHER THAN LEFT INERT. The latch carried a rounded-rect
 * circuit solver, a projection from the bevel's rectangle onto the rim's, a
 * core-lead offset and a back-bleed term — all still compiled, all doing
 * nothing. **Shader size is the cause of the opening stutter**
 * (`live-work/references/opening-stutter.md`), so dead GLSL is not free.
 *
 * ⚠ THE GLASS TAKES THE METAL'S OWN COLOUR, dimmer. It is warmed BY the
 * filament, so it cannot be at a different temperature — which is also why
 * `BEVEL_GLOW` sits well below the rim's.
 */
function BevelMaterial({
  envMap,
  envMapIntensity,
  filament,
}: {
  envMap: THREE.Texture | null;
  envMapIntensity: number;
  filament: FilamentState;
}) {
  const uniforms = useRef({
    uIntensity: { value: 0 },
    uTemp: { value: 0 },
    uRed: { value: new THREE.Color(HEAT_RED) },
    uOrange: { value: new THREE.Color(HEAT_ORANGE) },
    uWhite: { value: new THREE.Color(HEAT_WHITE) },
  });

  useFrame(() => {
    uniforms.current.uIntensity.value = filament.intensity.current;
    uniforms.current.uTemp.value = filament.temperature.current;
  });

  const onBeforeCompile = useCallback((shader: THREE.WebGLProgramParametersWithUniforms) => {
    Object.assign(shader.uniforms, uniforms.current);

    shader.fragmentShader = `
      uniform float uIntensity;
      uniform float uTemp;
      uniform vec3  uRed;
      uniform vec3  uOrange;
      uniform vec3  uWhite;
      ${shader.fragmentShader}
    `.replace(
      "#include <emissivemap_fragment>",
      `#include <emissivemap_fragment>
       {
         // The glass carries the metal's own colour as it heats, dimmer -- it is
         // warmed BY the filament, so it cannot be a different temperature.
         vec3 heatColor = uTemp < 0.5
           ? mix(uRed, uOrange, smoothstep(0.0, 0.5, uTemp))
           : mix(uOrange, uWhite, smoothstep(0.5, 1.0, uTemp));

         totalEmissiveRadiance += heatColor * uIntensity * ${BEVEL_GLOW.toFixed(3)};
       }`,
    );
  }, []);

  return (
    <meshPhysicalMaterial
      color={BEVEL_GLASS_COLOR}
      roughness={BEVEL_ROUGHNESS}
      metalness={0}
      // See `ENTRANCE_NEEDS_ALPHA`.
      transparent={ENTRANCE_NEEDS_ALPHA}
      depthWrite
      clearcoat={BEVEL_CLEARCOAT}
      clearcoatRoughness={BEVEL_CLEARCOAT_ROUGHNESS}
      envMap={envMap}
      envMapIntensity={envMapIntensity}
      emissive={new THREE.Color(HEAT_ORANGE)}
      emissiveIntensity={0}
      side={THREE.DoubleSide}
      onBeforeCompile={onBeforeCompile}
    />
  );
}

/** Samples around the perimeter. Corners need the density; straights do not suffer. */
const PATH_SAMPLES = 240;

/** Segments around the half-tube's semicircular profile. */
const TUBE_PROFILE_SEGMENTS = 10;

/** Tessellation of the convex face. */
const FACE_SEGMENTS_U = 96;
const FACE_SEGMENTS_V = 32;

// ── The shared path ──────────────────────────────────────────────────────────

type PathPoint = {
  /** Position on the path, in the card's plane. */
  x: number;
  y: number;
  /** Outward unit normal, in the card's plane. */
  nx: number;
  ny: number;
};

/**
 * Sample a rounded-rectangle perimeter, with an outward normal at every point.
 *
 * ⚠ ONE SAMPLER FOR EVERY PART. The rim, the bevel and the face boundary are all
 * placed on this path at different insets, so they are TRUE PARALLEL OFFSETS by
 * construction. The contact field instead builds three separate `THREE.Shape`s
 * and relies on `insetRadius()` arithmetic to keep them concentric; that works,
 * but it expresses one silhouette three times and the copies can disagree.
 *
 * The normal is exact rather than estimated by differencing: on the straights it
 * is axis-aligned, and in a corner it is the radial direction from that corner's
 * arc centre. Differencing would round the corners' normals slightly and show up
 * as a faint facet ring under a moving light.
 */
function sampleRoundedRectPath(
  width: number,
  height: number,
  radius: number,
  samples: number,
): PathPoint[] {
  const hw = width / 2;
  const hh = height / 2;
  const r = Math.max(0, Math.min(radius, hw, hh));

  const straightX = 2 * (width - 2 * r); // top + bottom
  const straightY = 2 * (height - 2 * r); // left + right
  const arcs = 2 * Math.PI * r; // four quarter-turns
  const total = straightX + straightY + arcs;

  const pts: PathPoint[] = [];

  for (let i = 0; i < samples; i++) {
    // Distance travelled anticlockwise from the middle of the right edge.
    let d = (i / samples) * total;

    // 1. Right edge, upward from centre-right to the top-right arc.
    const rightHalf = hh - r;
    if (d < rightHalf) {
      pts.push({ x: hw, y: d, nx: 1, ny: 0 });
      continue;
    }
    d -= rightHalf;

    // 2. Top-right corner arc, 0 -> 90 degrees.
    const quarter = (Math.PI / 2) * r;
    if (d < quarter) {
      const a = (d / quarter) * (Math.PI / 2);
      const nx = Math.cos(a);
      const ny = Math.sin(a);
      pts.push({ x: hw - r + nx * r, y: hh - r + ny * r, nx, ny });
      continue;
    }
    d -= quarter;

    // 3. Top edge, rightward to leftward.
    const topRun = width - 2 * r;
    if (d < topRun) {
      pts.push({ x: hw - r - d, y: hh, nx: 0, ny: 1 });
      continue;
    }
    d -= topRun;

    // 4. Top-left corner arc, 90 -> 180 degrees.
    if (d < quarter) {
      const a = Math.PI / 2 + (d / quarter) * (Math.PI / 2);
      const nx = Math.cos(a);
      const ny = Math.sin(a);
      pts.push({ x: -hw + r + nx * r, y: hh - r + ny * r, nx, ny });
      continue;
    }
    d -= quarter;

    // 5. Left edge, downward.
    const leftRun = height - 2 * r;
    if (d < leftRun) {
      pts.push({ x: -hw, y: hh - r - d, nx: -1, ny: 0 });
      continue;
    }
    d -= leftRun;

    // 6. Bottom-left corner arc, 180 -> 270 degrees.
    if (d < quarter) {
      const a = Math.PI + (d / quarter) * (Math.PI / 2);
      const nx = Math.cos(a);
      const ny = Math.sin(a);
      pts.push({ x: -hw + r + nx * r, y: -hh + r + ny * r, nx, ny });
      continue;
    }
    d -= quarter;

    // 7. Bottom edge, leftward to rightward.
    if (d < topRun) {
      pts.push({ x: -hw + r + d, y: -hh, nx: 0, ny: -1 });
      continue;
    }
    d -= topRun;

    // 8. Bottom-right corner arc, 270 -> 360 degrees.
    if (d < quarter) {
      const a = (3 * Math.PI) / 2 + (d / quarter) * (Math.PI / 2);
      const nx = Math.cos(a);
      const ny = Math.sin(a);
      pts.push({ x: hw - r + nx * r, y: -hh + r + ny * r, nx, ny });
      continue;
    }
    d -= quarter;

    // 9. Right edge, up to the starting point.
    pts.push({ x: hw, y: -hh + r + d, nx: 1, ny: 0 });
  }

  return pts;
}

/**
 * Half-width of a rounded rectangle at height `y`, measured from its centre.
 *
 * Copied from `contact-field-mesh.tsx` (which takes radius as a parameter and
 * does NOT close over `FIELD_RADIUS_PX`). Used by the face generator so the
 * face's boundary is the same curve as the swept parts rather than an
 * independent approximation.
 */
function roundedRectHalfWidthAt(y: number, halfW: number, halfH: number, r: number): number {
  const absY = Math.abs(y);
  if (absY <= halfH - r) return halfW;
  const dy = Math.min(absY - (halfH - r), r);
  return halfW - r + Math.sqrt(Math.max(0, r * r - dy * dy));
}

/**
 * Convex crown height at normalised position (u, v), each in [-1, 1].
 *
 * ⚠ SEPARABLE AND MULTIPLICATIVE — `H * longAxis * shortAxis`. Not two
 * independent heights (they do not compose in this form) and not radial: a
 * radial dome would read as a circular blister in the middle of a long card and
 * fall away far too fast across the short axis.
 *
 * The SHORT axis carries a RAISED cosine `(1 + cos(v*pi)) / 2`, which reaches
 * zero derivative at the boundary so the face meets the bevel without a crease.
 * The LONG axis holds full height across `CROWN_PLATEAU_U` and rolls off only in
 * the last `1 - CROWN_PLATEAU_U` at each end — otherwise the crown tapers to a
 * point and reads as an elliptical blister.
 *
 * Copied in form from `contact-field-mesh.tsx`'s `crownZ`, which is the shape
 * already approved there.
 */
/**
 * ⚠ THE ANSWER LABEL, DRAWN INTO A TEXTURE SO IT IS PART OF THE FACE.
 *
 * ⚠⚠ THREE DOM VERSIONS FAILED BEFORE THIS, AND THE REASON THEY ALL FAILED IS
 * STRUCTURAL RATHER THAN NUMERICAL. Carl, 9 August 2026: *"The movement just
 * doesnt feel right. As if the text is trying to catch up with the card or
 * mimmic its movement and not being quite right."* That is exactly what it was:
 *
 *   1. Shared clock, own animation  — different easing, distance, no scale.
 *   2. Polled the card's published values — right values, one frame late (0.025).
 *   3. Same frame, same values, transform driven by alpha — measured 0.0000
 *      divergence, and STILL read as two objects.
 *
 * ⚠ VERSION 3 PROVED THE NUMBERS WERE NOT THE PROBLEM. A DOM label moves in 2D
 * CSS pixels; the card rises in 3D WORLD SPACE under a perspective camera. A
 * 10-unit world translation does not project to a fixed pixel translation — it
 * depends on depth and changes as the card scales. **The two are moving through
 * different geometries, so they can agree at the endpoints and disagree
 * everywhere between.** No amount of matching values fixes a projection
 * mismatch; it only makes the mimicry more convincing, which is worse.
 *
 * ⚠ SO THE TEXT IS NOW THE SURFACE, NOT AN OVERLAY ON IT. Drawn into a
 * `CanvasTexture` and mapped onto the face's own UVs, it is transformed once,
 * lit once, and faded once — by the same mesh. There is nothing left to
 * synchronise because there is no second object.
 *
 * ⚠ AND IT ANSWERS CARL'S OTHER QUESTION — *"is wrapping the text around the
 * convex face... enough to warp it and make it unreadable?"* Measured, no:
 * `CROWN_PLATEAU_U` is 0.72, so the LONG axis — the reading direction — is FLAT
 * across 72% of its width. The crown's raised cosine is on the SHORT axis, and
 * the label band sits near its apex where the curve is flattest. Glyphs are not
 * stretched along the direction that would destroy legibility.
 *
 * ⚠ THE GAIN, WHICH IS THE POINT: the text now catches the light exactly as the
 * surface does, and in chunk 2 the hover arc will light the LABEL as it sweeps,
 * because the label is part of the material rather than sitting in front of it.
 *
 * ⚠ ACCESSIBILITY IS NOT SOLVED HERE AND MUST NOT BE FORGOTTEN. A texture is
 * not readable by a screen reader and not selectable. The DOM hover surfaces
 * remain, and when these cards return as real controls they carry the roles and
 * accessible names — the visible text being a texture makes a correct DOM label
 * MANDATORY at that point, not optional. Recorded as a known debt.
 */
const LABEL_TEX_W = 2048;
const LABEL_TEX_H = 512;

/**
 * The label's resting colour — the approved cool near-white from `.enquiry-card`.
 */
const LABEL_INK_REST = "rgb(238, 241, 252)";

/**
 * ⚠ THE HOVER TEAL, TAKEN FROM THE RAIL AND NOT INVENTED. Carl: *"answer text
 * turns teal slowly when hovered. This echoes the rail system"*, and when asked
 * which teal: *"the same teal that is in the text in the rail system... It is
 * the first teal, the answers lose their opacity as more questions are
 * answered."*
 *
 * Read from `app/globals.css` — `.enquiry-pdepth-1` through `-5`
 * `.enquiry-phrase-answers` all set `color: rgb(160, 220, 218)`. **The depth
 * fade is opacity, applied separately**, so this is the single teal the rail
 * uses at every depth. Echoing it means matching this value exactly; a teal
 * picked by eye would undercut the entire point of the change.
 */
const LABEL_INK_HOVER = "rgb(160, 220, 218)";

/**
 * How slowly the teal arrives, as an exponential time constant in seconds.
 *
 * ⚠ *"SLOWLY"* IS CARL'S WORD AND THIS IS THE DIAL FOR IT. 0.42s reaches ~63%
 * of the way in that time and settles around a second — a deliberate colour
 * change rather than a state flip, and slower than the 300ms a UI transition
 * would normally take. To be moved by his eye, not defended by argument.
 */
const LABEL_HOVER_TAU = 0.42;

function buildLabelTexture(
  text: string,
  bodyColor: string,
  ink: string = LABEL_INK_REST,
): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = LABEL_TEX_W;
  canvas.height = LABEL_TEX_H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);

  /**
   * ⚠ THE SATIN BODY COLOUR IS PAINTED AS THE BACKGROUND, NOT LEFT TRANSPARENT.
   *
   * `MeshPhysicalMaterial` computes albedo as `color * map`. If this texture
   * were a transparent mask, the material's `color` would still have to be the
   * deep satin blue — and it would multiply the near-white glyphs down to a dim
   * blue, making the label darker than the surface it sits on. Setting `color`
   * to white instead would fix the glyphs and throw the body colour away.
   *
   * ⚠ SO THE WHOLE ALBEDO LIVES HERE and the material's `color` is white. The
   * body colour and the ink are one image, which is also what makes them one
   * surface under the light: they are lit by the same shading, not composited.
   */
  ctx.fillStyle = bodyColor;
  ctx.fillRect(0, 0, LABEL_TEX_W, LABEL_TEX_H);

  /**
   * ⚠ THE FACE IS ~576 x 104 CSS px AT THE REFERENCE WIDTH and this texture is
   * 2048 x 512, so the label is drawn at ~3.5x device density before any DPR
   * scaling — comfortably above what a 0.75rem label needs to stay crisp.
   * Crispness was the stated cost of moving text into WebGL; it is paid here
   * with resolution rather than left to chance.
   */
  const fontPx = Math.round(LABEL_TEX_H * 0.30);
  ctx.font = `500 ${fontPx}px Geist, system-ui, -apple-system, "Segoe UI", sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const cx = LABEL_TEX_W / 2;
  const cy = LABEL_TEX_H / 2;
  const maxW = LABEL_TEX_W * 0.86;

  /**
   * ⚠⚠ THE EXTRUSION IS FAKED, ON CARL'S CALL. He asked *"Can the teal text be
   * extruded slightly?"* and then ruled out the expensive answer himself: *"the
   * text is so small doing it with real geometry would be a waste and too
   * expensive."*
   *
   * ⚠ HE IS RIGHT AND THE PROJECT HAS ALREADY PAID TO LEARN IT. The face is
   * ~104px tall on screen, so the glyphs are ~12–14px — the same scale at which
   * five per-card point lights failed: *"it looks ok zoomed in but not at this
   * scale."* Extruded glyph meshes would spend real geometry on detail that
   * cannot resolve, per card, per label change.
   *
   * ⚠ THE LIGHT DIRECTION IS NOT A CHOICE. The key rakes from `[-160, 120, 40]`
   * — upper-left — so the raised edge catches upper-left and the shadow falls
   * lower-right. Faking it from any other angle would put the text's implied
   * light source at odds with the card's actual one, which reads as wrong even
   * when nobody can say why.
   *
   * ⚠ AND THE FAKE CANNOT RESPOND TO THE TRAVELLER. These highlights are baked
   * at a fixed angle, so as the ring sweeps past they stay lit from the same
   * side. At 12px that is invisible; it would not be at a larger size, and it
   * is the honest cost of not using geometry.
   */
  const relief = Math.max(1, Math.round(fontPx * 0.035));

  // 1. The drop shadow, as the DOM label carried it. The satin bloom runs
  //    brightest across the middle of the face, which is where the text sits;
  //    this keeps it legible across that band without a scrim over the material.
  ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
  ctx.shadowColor = "rgba(0, 0, 0, 0.55)";
  ctx.shadowBlur = Math.round(fontPx * 0.22);
  ctx.shadowOffsetY = Math.round(fontPx * 0.06);
  ctx.fillText(text, cx, cy, maxW);

  // ⚠ THE SHADOW IS CLEARED BEFORE THE RELIEF PASSES. Left on, it would blur
  // the very edges that are meant to read as a crisp lip, and the letters would
  // come out muddy rather than raised.
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  /**
   * ⚠ THE RELIEF ALPHAS WERE LOWERED TO 0.28/0.24 ON 10 AUGUST AND PUT BACK.
   * Carl reported *"the resting state text doesnt seem as white"* and the halo
   * was the obvious suspect. **It is not the cause** — measured on the real GPU,
   * the glyph core reads rgb(210,214,221) at 0.45/0.38 and rgb(210,213,221) at
   * 0.28/0.24. **A 0.5-point difference.**
   *
   * ⚠ THE ~0.88 ATTENUATION FROM THE TEXTURE'S rgb(238,241,252) IS THE LIGHTING,
   * NOT THE HALO. The label is part of a lit surface, so it is shaded like one.
   * Anything that wants the glyphs closer to their texture value has to change
   * the exposure on the face, not the ink or the relief around it.
   */

  // 2. The dark side, offset lower-right — the face the light cannot reach.
  ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
  ctx.fillText(text, cx + relief, cy + relief, maxW);

  // 3. The lit lip, offset upper-left toward the key.
  ctx.fillStyle = "rgba(255, 255, 255, 0.38)";
  ctx.fillText(text, cx - relief, cy - relief, maxW);

  // 4. The glyph itself, on top and centred — rest white or the rail's teal.
  ctx.fillStyle = ink;
  ctx.fillText(text, cx, cy, maxW);

  const texture = new THREE.CanvasTexture(canvas);
  // ⚠ sRGB, BECAUSE THIS IS COLOUR. The field's NORMAL map is tagged
  // `NoColorSpace` for the opposite reason; getting this wrong would darken the
  // text against the surface it has to stay legible on.
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  return texture;
}

function crownZ(u: number, v: number, crownHeight: number, plateauU: number): number {
  const shortAxis = (1 + Math.cos(v * Math.PI)) / 2;

  let longAxis = 1;
  const au = Math.abs(u);
  if (au > plateauU) {
    const t = (au - plateauU) / (1 - plateauU);
    longAxis = (1 + Math.cos(t * Math.PI)) / 2;
  }

  return crownHeight * longAxis * shortAxis;
}

// ── Swept-band builder, shared by the rim and the bevel ──────────────────────

/**
 * Build a closed swept surface by placing a profile at every path sample and
 * bridging consecutive rings.
 *
 * `profile` returns, for a parameter t in [0, 1], how far to move INWARD from
 * the path (`inward`) and how far FORWARD toward the viewer (`forward`), plus
 * the profile's own normal in that 2D cross-section.
 *
 * ⚠ THE LOOP IS CLOSED BY WRAPPING THE RING INDEX, not by appending a duplicate
 * ring — a duplicate would leave a hairline seam where the two coincident rings
 * z-fight under a moving light.
 */
function sweptBand(
  path: PathPoint[],
  profileSegments: number,
  profile: (t: number) => { inward: number; forward: number; nIn: number; nFwd: number },
): THREE.BufferGeometry {
  const rings = path.length;
  const cols = profileSegments + 1;

  const positions = new Float32Array(rings * cols * 3);
  const normals = new Float32Array(rings * cols * 3);

  for (let i = 0; i < rings; i++) {
    const p = path[i];
    for (let j = 0; j < cols; j++) {
      const t = j / profileSegments;
      const { inward, forward, nIn, nFwd } = profile(t);
      const idx = (i * cols + j) * 3;

      // Move inward along the path's own outward normal, negated.
      positions[idx] = p.x - p.nx * inward;
      positions[idx + 1] = p.y - p.ny * inward;
      positions[idx + 2] = forward;

      // The profile normal, rotated into the path's frame. The in-plane
      // component follows the path normal; the forward component is z.
      normals[idx] = p.nx * nIn;
      normals[idx + 1] = p.ny * nIn;
      normals[idx + 2] = nFwd;
    }
  }

  const indices: number[] = [];
  for (let i = 0; i < rings; i++) {
    const next = (i + 1) % rings; // wrap — closes the loop with no seam
    for (let j = 0; j < profileSegments; j++) {
      const a = i * cols + j;
      const b = next * cols + j;
      const c = next * cols + j + 1;
      const d = i * cols + j + 1;
      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.setAttribute("normal", new THREE.BufferAttribute(normals, 3));
  geo.setIndex(indices);
  geo.computeBoundingBox();
  geo.computeBoundingSphere();
  return geo;
}

/**
 * The convex face, as a genuinely rounded-rectangle tessellated surface.
 *
 * ⚠ A RECTANGULAR PLANE RELYING ON THE BEVEL TO HIDE ITS SQUARE CORNERS WOULD BE
 * WRONG, and would come apart the moment the material becomes transmissive: the
 * visible inner boundary would be an intersection contour rather than the face's
 * own outline, and it would change shape with crown height. Each row is inset to
 * the true rounded-rect half-width at that height.
 */
function convexFaceGeometry(
  width: number,
  height: number,
  radius: number,
  crownHeight: number,
  plateauU: number,
): THREE.BufferGeometry {
  const halfW = width / 2;
  const halfH = height / 2;
  const r = Math.max(0, Math.min(radius, halfW, halfH));

  const cols = FACE_SEGMENTS_U + 1;
  const rows = FACE_SEGMENTS_V + 1;
  const positions = new Float32Array(cols * rows * 3);
  /**
   * ⚠ UVs AND TANGENTS EXIST FOR THE SATIN, AND WITHOUT THEM ANISOTROPY IS
   * SILENTLY INERT — added 9 August 2026.
   *
   * `MeshPhysicalMaterial.anisotropy` works in TANGENT SPACE: it stretches the
   * specular lobe along the surface tangent. With no `tangent` attribute three
   * derives one from screen-space UV derivatives, and with no `uv` either the
   * direction is undefined — the highlight either does not stretch at all or
   * stretches differently per triangle. **The material would appear to "not
   * work" while every value was correct**, which is the kind of failure this
   * project has repeatedly mistaken for a wrong number.
   *
   * ⚠ THE TANGENT RUNS ALONG `u` — THE CARD'S LONG AXIS — AND THAT IS THE WHOLE
   * DESIGN. The crown is a cylindrical roll: `CROWN_PLATEAU_U` holds it flat
   * across the middle of the long axis and it curves on the SHORT axis. Satin's
   * sheen smears PERPENDICULAR to the fibre, along the roll's axis, which is
   * what produces the long soft bands in Carl's references rather than a round
   * specular dot. A tangent along `v` would smear across the curve and destroy
   * the disclosure the crown exists to provide.
   */
  const uvs = new Float32Array(cols * rows * 2);
  const tangents = new Float32Array(cols * rows * 4);

  for (let iy = 0; iy < rows; iy++) {
    const v = (iy / FACE_SEGMENTS_V) * 2 - 1; // -1 .. 1
    const y = v * halfH;
    const rowHalfW = roundedRectHalfWidthAt(y, halfW, halfH, r);

    for (let ix = 0; ix < cols; ix++) {
      const u = (ix / FACE_SEGMENTS_U) * 2 - 1; // -1 .. 1
      const x = u * rowHalfW;

      // ⚠ The crown is evaluated on the ROW-NORMALISED u, so the roll-off
      // follows the rounded boundary instead of a rectangle inscribed in it.
      const idx = (iy * cols + ix) * 3;
      positions[idx] = x;
      positions[idx + 1] = y;
      positions[idx + 2] = crownZ(u, v, crownHeight, plateauU);

      const uvIdx = (iy * cols + ix) * 2;
      uvs[uvIdx] = ix / FACE_SEGMENTS_U;
      uvs[uvIdx + 1] = iy / FACE_SEGMENTS_V;

      /**
       * ⚠ THE TANGENT IS THE SURFACE'S OWN, NOT A CONSTANT +X. Along the long
       * axis the crown is flat across the plateau but ROLLS OFF near the ends,
       * so a flat (1,0,0) would be wrong exactly where the surface curves most
       * and the sheen would break away from the form at the card's ends.
       *
       * dP/du at fixed v, taken analytically from the same `crownZ` the
       * positions come from, then normalised. The w component is the bitangent
       * handedness three multiplies by; +1 for this winding.
       */
      const du = 1 / FACE_SEGMENTS_U;
      const uAhead = Math.min(1, u + du);
      const uBehind = Math.max(-1, u - du);
      const dx = (uAhead - uBehind) * rowHalfW;
      const dz =
        crownZ(uAhead, v, crownHeight, plateauU) - crownZ(uBehind, v, crownHeight, plateauU);
      const len = Math.hypot(dx, dz) || 1;

      const tIdx = (iy * cols + ix) * 4;
      tangents[tIdx] = dx / len;
      tangents[tIdx + 1] = 0;
      tangents[tIdx + 2] = dz / len;
      tangents[tIdx + 3] = 1;
    }
  }

  // ⚠ WINDING IS COUNTER-CLOCKWISE SO THE NORMALS FACE +Z (the camera and the
  // light). An earlier build wound these the other way, and `computeVertexNormals`
  // duly produced normals pointing at -z — every one of 3201 of them. The face
  // was lit from BEHIND and rendered a perfectly uniform rgb(44,44,44): ambient
  // only, no directional contribution, no gradient across a convex surface.
  //
  // ⚠ AND `side: DoubleSide` HID IT. The face was still visible, so nothing
  // looked broken — it just looked flat and dark, which is exactly the symptom
  // this whole chunk exists to avoid. Caught by sampling rendered pixels and
  // finding them uniform, not by any assertion: the tilt check passed throughout
  // because it reads |normal.z| and a flipped normal has the same magnitude.
  const indices: number[] = [];
  for (let iy = 0; iy < FACE_SEGMENTS_V; iy++) {
    for (let ix = 0; ix < FACE_SEGMENTS_U; ix++) {
      const a = iy * cols + ix;
      const b = (iy + 1) * cols + ix;
      const c = (iy + 1) * cols + ix + 1;
      const d = iy * cols + ix + 1;
      indices.push(a, d, b);
      indices.push(b, d, c);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
  geo.setAttribute("tangent", new THREE.BufferAttribute(tangents, 4));
  geo.setIndex(indices);
  // ⚠ Computed from the surface itself, never asserted from the crown constant —
  // the verification harness reads these normals back, and a normal derived from
  // the same constant as the crown could not disprove anything.
  geo.computeVertexNormals();
  geo.computeBoundingBox();
  geo.computeBoundingSphere();
  return geo;
}

/** Dispose a geometry when the component unmounts. */
function useDisposable(geo: THREE.BufferGeometry) {
  useEffect(() => () => geo.dispose(), [geo]);
}

export type AnswerCardTuning = {
  tubeRadius: number;
  bevelWidth: number;
  bevelRise: number;
  crownHeight: number;
  plateauU: number;
  /**
   * ⚠ NO LONGER PLACES THE FACE. Retained so the `?cardrig=1` bank keeps its
   * shape, but the face's z is now derived: it rises from `FACE_RISE_FROM` (the
   * rim's base) and its apex lands `FACE_PROUD_OF_RIM` above the rim's apex.
   * The recess model — face tucked behind a lip it never touched — is what left
   * a 5.00-unit unmodelled gap in the cross-section. See `FACE_TUCK_RATIO`.
   */
  faceRecess: number;
};

export const DEFAULT_TUNING: AnswerCardTuning = {
  tubeRadius: RIM_TUBE_RADIUS,
  bevelWidth: BEVEL_WIDTH,
  bevelRise: BEVEL_RISE,
  // ⚠ THE CROWN IS DERIVED FROM HOW PROUD THE APEX MUST SIT, not typed. See
  // `FACE_CROWN_RISE` — the two used to be independent numbers that had to be
  // changed together, and the contact field records getting that wrong once.
  crownHeight: FACE_CROWN_RISE,
  plateauU: CROWN_PLATEAU_U,
  faceRecess: 0,
};

/**
 * The card assembly.
 *
 * Z convention: the rim's apex sits at z = `tubeRadius` (its profile sweeps from
 * z = 0 at the outer silhouette round to z = 0 at the inner edge, peaking at the
 * top of the half-round). Everything else is placed relative to that so the
 * recess decision is expressed once.
 */
export function AnswerCardMesh({
  tuning = DEFAULT_TUNING,
  groupRef,
  glass = false,
  envMap = null,
  lightLevel = LIGHT_LEVEL,
  filament,
  glassTuning = DEFAULT_GLASS_TUNING,
  label,
  hovered = false,
  children,
}: {
  tuning?: AnswerCardTuning;
  groupRef?: React.Ref<THREE.Group>;
  /**
   * Whether the pointer is over this card.
   *
   * ⚠ THE HOVER PLUMBING ALREADY EXISTED AND HAD NO CONSUMER. It was built for
   * the lockup's region shift, which went on 5 August; the `hovered` index in
   * `answer-card-canvas.tsx` has been correct and unused since. This is the
   * consumer — the answer text turning teal.
   */
  hovered?: boolean;
  /**
   * The answer text, drawn INTO the face's albedo rather than laid over it.
   *
   * ⚠ IT IS TEXT ON THE SURFACE, NOT TEXT ON TOP OF IT — and that distinction is
   * the whole reason it moved here from the DOM. Three DOM versions could not be
   * made to read as one object with the card, because a DOM label moves in 2D
   * CSS pixels while the card rises in 3D world space under a perspective
   * camera: different geometries, so they agree at the endpoints and disagree
   * everywhere between. Carl: *"as if the text is trying to catch up with the
   * card or mimmic its movement and not being quite right."*
   *
   * Undefined on the warm-up instance and the clay study, which have no label.
   */
  label?: string;
  /**
   * Whether the face wears glass (chunk 2) or chunk 1's diagnostic grey.
   *
   * ⚠ THE RIM AND BEVEL ARE UNAFFECTED EITHER WAY and stay grey. Colouring them
   * in the same chunk that introduces the glass would mix two variables Carl
   * could otherwise separate, and it contradicts chunk 1's own argument that
   * grey exists so a form defect cannot hide behind a plausible colour.
   */
  glass?: boolean;
  glassTuning?: GlassTuning;
  /**
   * The locally generated environment map.
   *
   * ⚠ PASSED AS A PROP, NOT ASSIGNED THROUGH A REF. An earlier version attached
   * it imperatively after mount, which drew the card unlit for a frame and then
   * forced a shader recompile — Carl saw it as *"a grey state then gets
   * brighter."* As a prop it is part of the material's first construction, so
   * there is no "before" state to correct.
   */
  envMap?: THREE.Texture | null;
  /**
   * The scene's light level, as a multiplier on every environment response.
   *
   * ⚠ IT IS A FADER, AND IT STARTS LOW BY INSTRUCTION. Carl, 4 August: *"we give
   * it one and start with it low so it has hardly no effect on the metal. We
   * bring it up to a relative level and judge it against both metal and glass."*
   * Bound to `[9]` in `?cardrig=1`.
   */
  lightLevel?: number;
  /** The travelling filament's live state. Absent means unlit. */
  filament: FilamentState;
  /**
   * Rendered INSIDE the card's group, so anything placed behind the face
   * inherits the group's `visible` flag and its entrance transform.
   *
   * ⚠ THIS IS WHY THE BACKDROP LIVES HERE RATHER THAN BESIDE THE CARD. As a
   * sibling it drew for the whole 220ms entrance delay while the card mesh was
   * still hidden, so the first thing on screen was a plain bright RECTANGLE that
   * then became the card. Carl: *"it appears as a rectangle at first, very fast,
   * no curves."*
   */
  children?: React.ReactNode;
}) {
  const { tubeRadius, bevelWidth, crownHeight, plateauU } = tuning;
  // ⚠ THE BEVEL FOLLOWS THE RIM — Carl, 5 August: *"change the bevel proportionate
  // to the filament."* Taking `tubeRadius` down in the rig used to strand
  // `bevelRise` at its old absolute value, which is how a bevel comes to stand
  // proud of the rim and render the card with a black interior. Deriving it here
  // means the proportion cannot be broken by moving one dial.
  //
  // `tuning.bevelRise` is deliberately NOT read. It stays on the type and in the
  // rig readout as the resulting value, so `[0]` still prints what the geometry
  // actually used.
  const bevelRise = tubeRadius * BEVEL_RISE_RATIO;
  // ⚠ THE FACE'S TUCK IS GONE WITH THE RECESS MODEL. It used to be
  // `bevelRise * FACE_TUCK_RATIO`, holding the face below a lip it never touched
  // — which is what left a 5.00-unit unmodelled step in the cross-section. The
  // face now rises FROM the rim's base and its apex is derived; see
  // `FACE_RISE_FROM` and `FACE_CROWN_RISE` in `answer-card-geometry.ts`.
  //
  // The face's WIDTH still needs no equivalent: `faceInset` is already
  // `2 * tubeRadius + bevelWidth`, so it widens on its own as the rim comes down.

  const path = useMemo(
    () => sampleRoundedRectPath(CARD_WIDTH_PX, CARD_HEIGHT_PX, CARD_RADIUS_PX, PATH_SAMPLES),
    [],
  );

  // ── RIM — the half-tube. Its outermost point IS the silhouette. ──
  //
  // The profile runs from theta = 0 (on the silhouette, z = 0) through theta =
  // pi/2 (the apex, inward by R, z = R) to theta = pi (inward by 2R, z = 0).
  //
  // ⚠ THIS IS WHY THE RIM CONSUMES 2R PER SIDE, NOT R. The sweep path is inset
  // by R so that theta = 0 lands exactly on the silhouette; theta = pi therefore
  // lands 2R inside it. The plan's first draft assumed R and its defaults failed
  // its own budget assertion.
  const rimGeometry = useMemo(() => {
    const inset = tubeRadius; // path centre-line
    const centred = path.map((p) => ({
      x: p.x - p.nx * inset,
      y: p.y - p.ny * inset,
      nx: p.nx,
      ny: p.ny,
    }));
    return sweptBand(centred, TUBE_PROFILE_SEGMENTS, (t) => {
      const theta = t * Math.PI;
      return {
        // Relative to the centre-line: outward at theta 0, inward at theta pi.
        inward: -Math.cos(theta) * tubeRadius,
        forward: Math.sin(theta) * tubeRadius,
        nIn: -Math.cos(theta),
        nFwd: Math.sin(theta),
      };
    });
  }, [path, tubeRadius]);

  // ── BEVEL — a swept band sloping inward and TOWARD THE VIEWER. ──
  //
  // ⚠ A SWEPT BAND, NOT AN `ExtrudeGeometry` BEVEL, and that choice has three
  // consequences, all wanted:
  //   1. The corners are a true parallel offset BY CONSTRUCTION, because every
  //      ring sits on the same sampled path at a different inset.
  //   2. `safeBevelSize` from the contact field has NO REFERENT here — it guards
  //      ExtrudeGeometry's inward erosion near the corner radius, and a swept
  //      band has no such erosion. Copying it would be cargo-cult.
  //   3. There is no solid front cap, so the contact field's aperture problem
  //      (cutting a real hole so the face's own outline is visible rather than
  //      an iso-height intersection contour) does not arise: a band is open.
  const bevelGeometry = useMemo(() => {
    const start = 2 * tubeRadius; // where the rim's inner edge lands
    const centred = path.map((p) => ({
      x: p.x - p.nx * start,
      y: p.y - p.ny * start,
      nx: p.nx,
      ny: p.ny,
    }));

    // Slope normal: the band rises `bevelRise` across `bevelWidth` inward.
    const len = Math.hypot(bevelWidth, bevelRise) || 1;
    const nIn = bevelRise / len; // tilts to face outward-and-forward
    const nFwd = bevelWidth / len;

    return sweptBand(centred, 4, (t) => ({
      inward: t * bevelWidth,
      forward: t * bevelRise,
      nIn,
      nFwd,
    }));
  }, [path, tubeRadius, bevelWidth, bevelRise]);

  // ── FACE — convex, and RECESSED behind the rim's apex. ──
  const faceGeometry = useMemo(() => {
    const budget = cardBudget(tubeRadius, bevelWidth);
    return convexFaceGeometry(
      budget.faceWidth,
      budget.faceHeight,
      budget.faceRadius,
      crownHeight,
      plateauU,
    );
  }, [tubeRadius, bevelWidth, crownHeight, plateauU]);

  useDisposable(rimGeometry);
  useDisposable(bevelGeometry);
  useDisposable(faceGeometry);

  /**
   * The face's albedo: the satin body colour with the answer label drawn into
   * it. Null when there is no label — the warm-up instance and the clay study.
   *
   * ⚠ REBUILT ONLY WHEN THE TEXT OR THE BODY COLOUR CHANGES. Drawing to a 2048
   * canvas per frame would be absurd; per label change it is free. `SATIN_COLOR`
   * is in the deps because the texture BAKES it — see `buildLabelTexture` for
   * why the colour lives in the map rather than in the material's `color`.
   *
   * ⚠ GUARDED ON `document`, because this file is imported during SSR even
   * though the canvas only mounts on the client.
   */
  const labelMap = useMemo(() => {
    if (!label || typeof document === "undefined") return null;
    return buildLabelTexture(label, SATIN_COLOR);
  }, [label]);

  /**
   * The same label in the rail's teal — the hover target.
   *
   * ⚠⚠ BUILT DURING AN IDLE GAP, NOT AT MOUNT AND NOT ON HOVER. Both of the
   * obvious timings are wrong and the middle one is the answer:
   *
   *   - **At mount** it drew a second 2048x512 canvas per card, ten times, inside
   *     the Q5 reveal. Measured: the worst frame gap went 161ms → 312ms the
   *     moment this texture was added (`4c7a20e`). **Carl saw it: *"Q5 stalls"*.**
   *   - **On hover** it would hitch on the exact frame the pointer arrives — the
   *     one the user is most attentive to.
   *
   * ⚠ SO IT WAITS FOR THE THREAD TO BE FREE. `requestIdleCallback` yields until
   * after the reveal has finished; the fallback covers Safari, which has none.
   * The hover blend simply mixes toward `null` until it lands, which the shader
   * already tolerates — `uHover` is 0 for that whole period anyway.
   *
   * ⚠ AND THE 2000ms FALLBACK IS NOT ARBITRARY. It is long enough to clear the
   * 1300ms reveal with margin, which is the same reasoning the pre-warm's own
   * idle scheduling uses. A shorter one would fire back inside the window this
   * change exists to protect.
   */
  const [labelTealMap, setLabelTealMap] = useState<THREE.CanvasTexture | null>(null);

  useEffect(() => {
    // ⚠ NO SYNCHRONOUS `setState` HERE. Clearing the texture in this branch
    // would be a cascading render on every mount of a label-less card (the
    // warm-up instance and the clay study), which lint correctly rejects. The
    // state is already null for those, and the cleanup below handles a label
    // CHANGING — so there is nothing to clear.
    if (!label || typeof document === "undefined") return;

    let cancelled = false;
    const build = () => {
      if (cancelled) return;
      setLabelTealMap(buildLabelTexture(label, SATIN_COLOR, LABEL_INK_HOVER));
    };
    const w = window as unknown as {
      requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number;
      cancelIdleCallback?: (h: number) => void;
    };
    if (typeof w.requestIdleCallback === "function") {
      const h = w.requestIdleCallback(build, { timeout: 2000 });
      return () => {
        cancelled = true;
        w.cancelIdleCallback?.(h);
        // ⚠ CLEARED ON THE WAY OUT, NOT ON THE WAY IN. When the label changes,
        // the texture built for the OLD one must not stay bound — the card
        // would hover to the previous answer's teal. This is a cleanup, so it
        // is not the cascading-render pattern lint objects to.
        setLabelTealMap(null);
      };
    }
    const t = window.setTimeout(build, 2000);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
      setLabelTealMap(null);
    };
  }, [label]);

  /**
   * ⚠ TEXTURES LEAK IF THEY ARE NOT DISPOSED, and these are rebuilt whenever
   * the label changes — five cards through five questions is twenty-five
   * textures over a corridor walk, and **fifty now that each card carries a
   * teal variant as well**. `useDisposable` covers geometries; a texture needs
   * the same treatment and does not get it for free.
   */
  useEffect(() => {
    if (!labelMap) return;
    return () => {
      labelMap.dispose();
    };
  }, [labelMap]);

  useEffect(() => {
    if (!labelTealMap) return;
    return () => {
      labelTealMap.dispose();
    };
  }, [labelTealMap]);

  // ── Where the face sits in z ──────────────────────────────────────────────
  //
  // ⚠ REBUILT 6 AUGUST 2026 — THE FACE RISES FROM THE RIM'S BASE AND STANDS
  // PROUD OF ITS APEX. The old model anchored it below the bevel's inner edge
  // and left a 5.00-unit unmodelled step between them, measured by
  // `verify/cross-section.mjs`. Carl drew what the renderer actually contained:
  // two tubes, two bevel stubs pointing at nothing, and a dome floating free.
  // The full record is at `FACE_TUCK_RATIO` in `answer-card-geometry.ts`.
  //
  // ⚠ THE SEAM IS NOT CLOSED — IT NO LONGER EXISTS. The face's edge starts at
  // z = 0, the tube's own base, so both surfaces begin at the same height and
  // there is nothing left to bridge.
  //
  // ⚠ AND THE APEX IS DERIVED, NOT PLACED. `crownHeight` comes from
  // `FACE_CROWN_RISE`, which solves for the apex landing `FACE_PROUD_OF_RIM`
  // above the rim — so the two cannot drift apart the way the old crown and sink
  // could. `faceRecess` survives on the tuning type only to keep the rig's shape.
  const faceBaseZ = FACE_RISE_FROM;

  return (
    <group ref={groupRef}>
      {children}
      {/*
        ⚠ THE RIM IS TUNGSTEN AT REST — the filament before any current. Carl,
        4 August: *"Filaments are usually grey metal... if its metal, the light
        would have some interaction with it before it is active."*

        ⚠ `metalness: 1` AND A REAL `envMapIntensity` ARE BOTH LOAD-BEARING. A
        metal has almost no diffuse response, so the environment map IS its
        appearance — the previous `metalness: 0` with no env response could not
        read as metal at any roughness, because there was nothing for it to
        reflect. See `answer-card-glass.ts`.

        ⚠ THE HALF-TUBE EARNS ITS KEEP HERE, and it is why the profile was built
        this way. Carl: *"A half tube will emit the light in multiple directions
        as opposed to it being flat."* A curved surface presents every angle to
        the light at once, so the specular runs ALONG the rim rather than
        flashing at one spot — which is exactly what his first reference shows on
        the unlit coil.
      */}
      {/* ⚠ SHADOW FLAGS ARE CLAY-ONLY. They cost nothing when the renderer's
          shadow map is disabled, which it is for the shipped card — see the
          `onCreated` note in `answer-card-canvas.tsx`. Every surface both casts
          and receives, because the question is whether the BEVEL shadows the
          face at the seam. */}
      <mesh geometry={rimGeometry} castShadow={!glass} receiveShadow={!glass}>
        {glass ? (
          <RimMaterial
            color={RIM_METALS[glassTuning.rimMetal]?.color ?? RIM_METAL_COLOR}
            roughness={glassTuning.rimRoughness}
            envMap={envMap}
            envMapIntensity={RIM_ENV_INTENSITY * lightLevel}
            filament={filament}
          />
        ) : (
          /*
            ⚠ CLAY, AND THE RIM ESPECIALLY NEEDS IT. `metalness: 1` means the
            metal has almost no diffuse response — the env map IS its
            appearance. Under a clay render there is no env map, so a metal rim
            would go BLACK and take the seam with it. A diffuse stand-in is the
            only way the tube's curve is legible at all here.
          */
          <meshPhysicalMaterial
            color={DIAG_RIM_COLOR}
            roughness={0.3}
            metalness={0}
            clearcoat={1}
            clearcoatRoughness={0.1}
            side={THREE.DoubleSide}
          />
        )}
      </mesh>

      {/*
        ⚠ THE BEVEL IS GLASS — THE FILAMENT'S MOUNT, NOT PART OF THE CONDUCTOR.
        Carl settled it by physics: *"What would some metal be doing connected to
        a metal filament that is about to heat up?... i would imagine that the
        bevel is some sort of 'holder' that supports the filament. If its made of
        glass it would conduct and reflect the heat/light. Thus aiding with the
        bloom."*

        ⚠ REFLECTIVE, NOT TRANSMISSIVE, AND THAT IS A CHOICE — see
        `answer-card-glass.ts`. `reflect` is the operative word in Carl's own
        sentence, and a second transmissive surface per card would both cost the
        transmission pass and blur the rim/face boundary.
      */}
      <mesh geometry={bevelGeometry} position={[0, 0, 0]} castShadow={!glass} receiveShadow={!glass}>
        {glass ? (
          <BevelMaterial
            envMap={envMap}
            envMapIntensity={BEVEL_ENV_INTENSITY * lightLevel}
            filament={filament}
          />
        ) : (
          /*
            ⚠ A DIFFERENT GREY FROM THE RIM AND THE FACE, DELIBERATELY. The
            question this render exists to answer is where one surface ENDS and
            the next BEGINS — so the three parts must be tellable apart by tone
            alone, before any lighting is interpreted.
          */
          <meshStandardMaterial
            color={DIAG_BEVEL_COLOR}
            roughness={0.85}
            metalness={0}
            side={THREE.DoubleSide}
          />
        )}
      </mesh>

      {/*
        ⚠ THE FACE IS THE ONLY TRANSMISSIVE SURFACE, and that is a constraint
        rather than a preference. `three.module.js:18039` renders `opaqueObjects`
        ONLY into the transmission target, and the render-list split at `:8237`
        pushes anything with `transmission > 0` into a separate list. So a
        transmissive rim or bevel would DELETE ITSELF from what the face
        refracts — the card would lose its own edges.

        ⚠ AND THE RIM AND BEVEL ARE ALREADY EXCLUDED DURING THE ENTRANCE, for
        the OTHER arm of the same rule: the entrance sets `transparent = true`
        while it fades, and `transparent === true` also routes a material away
        from the opaque list. They rejoin it once the fade completes.
      */}
      {/*
        ⚠ THE GLASS PATH CARRIES THE FILTER; THE DIAGNOSTIC PATH DOES NOT. The
        `glass={false}` variant is a flat stand-in with no envMap, so there is no
        `radiance` worth filtering and no filament to drive it. Keeping it on the
        plain material also keeps the diagnostic honest — it stays what it has
        always been.
      */}
      <mesh
        geometry={faceGeometry}
        position={[0, 0, faceBaseZ]}
        castShadow={!glass}
        receiveShadow={!glass}
      >
        {glass ? (
          <FaceMaterial
            envMap={envMap}
            // ⚠ THE FACE RIDES THE SAME FADER. The pass Carl specified judges the
            // metal *"against both metal and glass"*, so the light has to come up
            // on the whole card at once — a face at fixed intensity while the rim
            // and bevel ramp would make every reading a comparison against a
            // moving reference.
            // ⚠ SATIN'S ENV CONTRIBUTION IS LOW BUT NOT ZERO — the rig has to
            // stay capable of lighting the platinum-blue Next step button that
            // D-045 §10 puts under this same rig. See `SATIN_ENV_INTENSITY`.
            envMapIntensity={SATIN_ENV_INTENSITY * lightLevel}
            /**
             * ⚠ WHITE WHEN THE LABEL MAP IS PRESENT, THE SATIN BLUE WHEN IT IS
             * NOT — and this is not a special case, it is where the colour
             * lives. `MeshPhysicalMaterial` computes albedo as `color * map`, so
             * with a map the body colour is baked into the texture and `color`
             * must be neutral or it would multiply the blue twice and dim the
             * glyphs. Without a map (the warm-up card, the clay study) the
             * material carries the colour as before.
             */
            color={labelMap ? "#ffffff" : SATIN_COLOR}
            labelMap={labelMap}
            labelTealMap={labelTealMap}
            hovered={hovered}
            roughness={glassTuning.roughness}
            anisotropy={glassTuning.satinAnisotropy}
            anisotropyRotation={glassTuning.satinAnisotropyRotation}
            sheenColor={SATIN_SHEEN_COLOR}
            sheenRoughness={glassTuning.satinSheenRoughness}
            filament={filament}
            filterStrength={glassTuning.glassFilterStrength}
            clearcoat={glassTuning.glassClearcoat}
            clearcoatRoughness={glassTuning.glassClearcoatRoughness}
          />
        ) : (
        /*
          ⚠ CLAY. THE POINT OF THIS PATH IS TO MAKE THE FORM VISIBLE, and it is
          not the glass path with transmission turned off.

          Carl, 5 August 2026: *"i will have no way of knowing if its right if
          its clear glass. That why you should ramp it up so i can see something
          more substantial and then shine a light on it so i can zoom in and
          check."*

          ⚠ AND THE REASON HE HAD TO SAY IT: an entire session of lighting work
          went onto geometry that turned out to be missing at the seam — *"no
          light can illuminate something that is not there."* A clear, dark,
          transmissive card cannot answer "is the slope there", because every
          surface reads as the same near-black whether it exists or not.

          ⚠ SO: FULLY OPAQUE, MID-GREY, MATTE, AND NOT ON THE SCENE FADER. The
          light level is deliberately NOT multiplied in here — `lightLevel` is
          0.35 for the shipped glass look, and a diagnostic that inherits it
          would be as dark as the thing it is diagnosing. This surface is lit to
          be READ, not to be judged as a material.
        */
        /*
          ⚠ PLASTIC, NOT CHALK — Carl, 5 August 2026: *"similar would be plastic
          for its light reflective qualities."*

          ⚠ AND HE IS RIGHT THAT IT IS THE BETTER TEST SURFACE. A fully matte
          material scatters equally in every direction, so its shading reports
          only which way a surface faces on AVERAGE — a broad, forgiving wash
          that hides exactly the small changes in curvature this study needs to
          show. A specular surface puts a compact highlight on the steepest part
          of a curve and MOVES it as the light travels, so the eye reads the
          shape from the highlight's path rather than from a tonal guess.

          ⚠ `clearcoat` ON TOP OF A MID ROUGHNESS is what makes it read as
          moulded plastic rather than as polished metal: the body stays diffuse
          and holds its own colour, while a thin sharp skin carries the
          reflection.
        */
        <meshPhysicalMaterial
          color={DIAG_FACE_COLOR}
          roughness={0.35}
          metalness={0}
          clearcoat={1}
          clearcoatRoughness={0.12}
          side={THREE.DoubleSide}
        />
        )}
      </mesh>
    </group>
  );
}

/**
 * Exported for the verification harness.
 *
 * ⚠ THE HARNESS MUST READ TILT FROM THESE NORMALS, SCOPED TO THE FACE ALONE.
 * The half-tube presents the full 0-90 degrees BY CONSTRUCTION — it is the whole
 * reason it was chosen — so a maximum taken across the assembly returns ~90
 * whatever the crown does, INCLUDING at crownHeight 0. A harness that cannot
 * fail is not a harness; `verify/q5-stutter.mjs` reported 0/3 CLEAN on a visible
 * defect for exactly this reason.
 */
export function buildFaceGeometryForTest(
  tubeRadius: number,
  bevelWidth: number,
  crownHeight: number,
  plateauU: number,
): THREE.BufferGeometry {
  const budget = cardBudget(tubeRadius, bevelWidth);
  return convexFaceGeometry(
    budget.faceWidth,
    budget.faceHeight,
    budget.faceRadius,
    crownHeight,
    plateauU,
  );
}
