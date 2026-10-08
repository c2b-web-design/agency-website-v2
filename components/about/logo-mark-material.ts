/**
 * ⛔ THE MARK'S GOLD — D-088 chunk 1, 3 October 2026 (Plan: `live-work/desk-mark-chunk1-plan-3-october.md`, Step 3);
 * applied to pass 1's flat-face shape as PASS 2, 7 October 2026 (Carl: "just apply the gold metal"), unchanged.
 *
 * ⛔ STARTS FROM PHYSICAL GOLD, NOT FROM THE TARGET'S PIXELS (Architect A12): gold's reflectance at normal incidence,
 * F0, in linear ≈ (1.00, 0.77, 0.34). A render's mid-tones mix its lighting into the colour, so sampling the target
 * would bake the target's lights into the material. The target (`c2b-logo-gold-relit-source-1671.png`) JUDGES the
 * result; it does not supply it.
 * ⚠ ONE STARTING VALUE for Carl's eye, not a set of options (the card precedent: "The figures were presented as a
 * starting point").
 * ⚠ METAL HAS NO DIFFUSE: with no environment it renders BLACK. The bench always gives it one.
 * No highlight cap yet — added only if a glint lands on a face (Carl, 3 October: "Highlights or glints on the rim are
 * good. Its when they are on the face that it looks bad").
 */
import * as THREE from "three";

export type LogoGoldParams = {
  roughness: number;
  envMapIntensity: number;
};

export const LOGO_GOLD_DEFAULTS: LogoGoldParams = {
  roughness: 0.25,
  envMapIntensity: 1,
};

/** Gold's F0, LINEAR — set on the colour without a colour-space conversion. */
export const GOLD_F0_LINEAR: readonly [number, number, number] = [1.0, 0.77, 0.34];

export function createLogoGold(input: Partial<LogoGoldParams> = {}): THREE.MeshPhysicalMaterial {
  const p = { ...LOGO_GOLD_DEFAULTS, ...input };
  const m = new THREE.MeshPhysicalMaterial({
    metalness: 1,
    roughness: p.roughness,
    envMapIntensity: p.envMapIntensity,
  });
  m.color.setRGB(GOLD_F0_LINEAR[0], GOLD_F0_LINEAR[1], GOLD_F0_LINEAR[2], THREE.LinearSRGBColorSpace);
  return m;
}

// ── THE PLATINUM BLUE — shown on Carl's request, 7 October 2026 ("can you show me a platinum blue version?") ─────────

/**
 * ⛔ PLATINUM'S F0, LINEAR ≈ (0.672, 0.637, 0.585) — a neutral, slightly warm grey. There is no physical "platinum blue"
 * metal, so the blue cannot be measured the way the gold was: the starting point is platinum, tinted.
 */
export const PLATINUM_F0_LINEAR: readonly [number, number, number] = [0.672, 0.637, 0.585];

/**
 * ⛔ THE BLUE — TAKE 3: THE BLUE METAL SWATCH'S BASE COLOUR. Carl, 7 October 2026, on take 2: *"Its more silver grey. Look at
 * the image. You can see gold on the right and blue on the left. See the contrast between the two."* — a sheet of metal
 * gradient swatches (`live-work/references/desk-mark-refs-7-october/metal-swatches-blue-vs-gold.png`, a stock image, kept
 * local). The BLUE column's base chip, sampled: sRGB **#3F6DB8**, linear **(0.049, 0.153, 0.479)** — ~10 parts blue to 1
 * of red, against the gold column's pale champagne #DAD8C2. Its swatches run from navy #13233D to highlights #80A3DD:
 * the base is the metal's colour; the range is light and angle. Used AS the F0 at tint 1 (the default).
 *
 * ⚰️ THE TAKES IT REPLACES, kept so the next reader does not retry them:
 *   take 1 — platinum (0.672, 0.637, 0.585) tinted halfway to the blue target's hue → READ GREY;
 *   take 2 — the site's blue mark sampled (`public/c2b-logo-blue-mark.png`, 50–90th luminance percentile)
 *            (0.266, 0.388, 0.599) #8DA7CB, ~2 parts blue to 1 of red → *"more silver grey."*
 * ⚠ Carl's word sets aside, for the blue, the A12 rule the gold follows (physical F0, not a picture's pixels): there is no
 * physical platinum blue. ⚠ A DARK metal (luminance ≈ 0.13 vs platinum's 0.64) — its brightness comes from the light.
 */
export const LOGO_BLUE_SWATCH_LINEAR: readonly [number, number, number] = [0.049, 0.153, 0.479];

export type LogoBlueParams = LogoGoldParams & {
  /** 0 = platinum's own grey, 1 = the blue metal swatch's base colour, sampled. */
  tint: number;
};

/** ⚠ STARTING VALUES for Carl's eye: the swatch's blue itself, the gold's roughness. */
export const LOGO_BLUE_DEFAULTS: LogoBlueParams = { roughness: 0.25, envMapIntensity: 1, tint: 1 };

export function platinumBlueF0(tint: number): [number, number, number] {
  return [0, 1, 2].map((i) => PLATINUM_F0_LINEAR[i] + (LOGO_BLUE_SWATCH_LINEAR[i] - PLATINUM_F0_LINEAR[i]) * tint) as [number, number, number];
}

export function createLogoPlatinumBlue(input: Partial<LogoBlueParams> = {}): THREE.MeshPhysicalMaterial {
  const p = { ...LOGO_BLUE_DEFAULTS, ...input };
  const m = new THREE.MeshPhysicalMaterial({ metalness: 1, roughness: p.roughness, envMapIntensity: p.envMapIntensity });
  const [r, g, b] = platinumBlueF0(p.tint);
  m.color.setRGB(r, g, b, THREE.LinearSRGBColorSpace);
  return m;
}

// ── THE CROSSING — gold → platinum blue, an OUTSIDE-IN sphere tied to the mark (Carl, 7–8 October 2026) ─────────────

/**
 * ⛔ THE PACE IS `/start`'s, IN MARK UNITS. Carl, 8 October: *"The speed of the transition must be proportionate to the
 * start logo given that the proto logo is slightly bigger."* `/start`'s gold mark (`app/start/page.tsx`, `MARK.gold`:
 * frame 951 × 544, letterforms 481 tall) is clipped by `circle(75% → 0%)` in 1300 ms, linear (`enquiry-logo-radial-in`,
 * `app/globals.css`). A `circle()` percentage resolves against hypot(w, h) / √2 of the box, so in LETTERFORM HEIGHTS —
 * the bench's mark unit — the radius falls at 0.75 · hypot(951, 544) / √2 / 481 / 1.3 s = **0.9292 per second**.
 * Measured in the mark's own units, it is the same pace at any size: the bench's bigger mark crosses in the same time.
 * ⚠ UNASSERTED: these are `/start`'s numbers COPIED, not imported. If `/start`'s frame, its 75 % or its 1300 ms changes,
 * change this. Record: D-088, 8 October; `live-work/start-logo-transition-observed-8-october.md`.
 */
export const START_LOGO_SWEEP_PER_S = (0.75 * Math.hypot(951, 544)) / Math.SQRT2 / 481 / 1.3;

/**
 * ⛔ THE CROSSING'S PACE AS A FRACTION OF `/start`'s — HALF. Carl, 8 October 2026, having watched it at `/start`'s pace
 * (1.015 s): *"That look great. can you halve the speed of the wipe?"* So the radius falls at 0.4646 mark heights a
 * second and the full crossing lasts ~2.03 s. `/start`'s rate above stays the MEASUREMENT; this is the ruling on it.
 * ⚠ A take on the bench (time-driven). In the scene the reader's scroll drives the number.
 */
export const LOGO_CROSSING_PACE_OF_START = 0.5;
export const LOGO_CROSSING_SWEEP_PER_S = START_LOGO_SWEEP_PER_S * LOGO_CROSSING_PACE_OF_START;

export type LogoCrossing = {
  material: THREE.MeshPhysicalMaterial;
  /** set every frame: the sphere's centre and radius in the geometry's own (object) space, model units. */
  set: (centre: readonly [number, number, number], radius: number) => void;
};

/**
 * ⛔ ONE MESH, ONE MATERIAL, BOTH METALS — the sphere chooses per pixel. Carl's question (7 October) was whether to
 * "overlay the 2 objects and tie the transition to the object"; this has the effect of the overlay without two coincident
 * meshes (z-fighting, or each discarding the other's pixels). It is exact because the two metals differ ONLY in their
 * colour (F0): same metalness 1, same roughness, same environment — so swapping `diffuseColor` per pixel IS the other
 * material. ⚠ If the two metals ever get different roughness, this must carry it too.
 *
 * ⛔ TIED TO THE OBJECT: the distance is taken in OBJECT space (`position`, before the model matrix), so the edge rides
 * the tumble and turntable with the metal, never sliding across it like a spotlight.
 * ⛔ GOLD INSIDE THE SPHERE, BLUE OUTSIDE: as the radius shrinks the blue closes in from the furthest surface and the
 * gold goes last at the centre (`/start`'s gesture on Begin, Carl 27 August).
 * ⛔ THE EDGE IS HARD, as `/start`'s is (its crossfade was removed, 27 August): a step, smoothed over ONE SCREEN PIXEL
 * (`fwidth`) only so it does not alias — the same width a browser's clip-path edge has.
 */
export function createLogoCrossing(input: Partial<LogoBlueParams> = {}): LogoCrossing {
  const p = { ...LOGO_BLUE_DEFAULTS, ...input };
  const m = new THREE.MeshPhysicalMaterial({ metalness: 1, roughness: p.roughness, envMapIntensity: p.envMapIntensity });
  const gold = new THREE.Color().setRGB(GOLD_F0_LINEAR[0], GOLD_F0_LINEAR[1], GOLD_F0_LINEAR[2], THREE.LinearSRGBColorSpace);
  const [r, g, b] = platinumBlueF0(p.tint);
  const blue = new THREE.Color().setRGB(r, g, b, THREE.LinearSRGBColorSpace);
  const uniforms = { uCrossCentre: { value: new THREE.Vector3() }, uCrossRadius: { value: 1e9 } };
  m.onBeforeCompile = (s) => {
    Object.assign(s.uniforms, uniforms, { uCrossGold: { value: gold }, uCrossBlue: { value: blue } });
    s.vertexShader = s.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vCrossPos;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvCrossPos = position;");
    s.fragmentShader = s.fragmentShader
      .replace(
        "#include <common>",
        "#include <common>\nvarying vec3 vCrossPos;\nuniform vec3 uCrossCentre;\nuniform float uCrossRadius;\nuniform vec3 uCrossGold;\nuniform vec3 uCrossBlue;",
      )
      .replace(
        "#include <color_fragment>",
        [
          "#include <color_fragment>",
          "float crossD = distance(vCrossPos, uCrossCentre);",
          "float crossAa = 0.5 * fwidth(crossD);",
          "float crossGold = 1.0 - smoothstep(uCrossRadius - crossAa, uCrossRadius + crossAa, crossD);",
          "diffuseColor.rgb = mix(uCrossBlue, uCrossGold, crossGold);",
        ].join("\n"),
      );
  };
  m.customProgramCacheKey = () => "logo-crossing";
  return {
    material: m,
    set: (c, radius) => {
      uniforms.uCrossCentre.value.set(c[0], c[1], c[2]);
      uniforms.uCrossRadius.value = radius;
    },
  };
}
