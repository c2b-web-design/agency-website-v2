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
