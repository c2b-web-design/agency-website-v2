/**
 * ⛔ THE MARK'S GOLD — D-088 chunk 1, 3 October 2026. Plan: `live-work/desk-mark-chunk1-plan-3-october.md`, Step 3.
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
