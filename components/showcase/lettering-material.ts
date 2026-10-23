/**
 * ⛔ FILM 4's LETTERING — PASS 2: THE MATERIAL (D-088, 23 October 2026). Plan `live-work/film04-pass2-material-plan-23-october.md`
 * (v2.1, four Architect rounds, approved by Carl). Brushed brass on "Your company" (the line) first; the arch stays clay.
 *
 * ⛔ THE SHAPE FOLLOWS `components/home/corner-material.ts` (the Architect): a LOOK as data, built into `MeshPhysicalMaterial`s,
 * the F0 set LINEAR with `setRGB(…, LinearSRGBColorSpace)`, `envMapIntensity` as the strength — with no lamps it is the
 * metal's brightness control. Lit by the studio HDRI ALONE (`lib/studio-hdri.ts`), per-material `envMap` + `envMapRotation`,
 * as the buttons and corners are — the logo standard: a studio's REFLECTION, not paint under lamps (15 October).
 *
 * ⛔ TWO MATERIALS, BY THREE's OWN GROUPS: materialIndex 0 is each letter's FACE (brushed), materialIndex 1 its SIDES — walls
 * and chamfer together (polished), `ExtrudeGeometry.js:626, 650`. Carl: *"Brushed face, polished edge"*.
 *
 * ⚠⚠ EVERY VALUE HERE IS A STARTING VALUE, AND EVERY VALUE CARL SETS IS SET UNDER NEUTRAL TONE MAPPING, JUDGING (Architect
 * C1): the page's tone mapping is pass 3's. Re-check them if it is not Neutral.
 */
import * as THREE from "three";
import type { LetteringMaterial } from "./lettering-geometry";

/**
 * ⛔ BRASS's F0, LINEAR — physicallybased.info (0.910, 0.778, 0.423), CHECKED against a second source before it was written
 * here (the plan): derived from M. R. Querry's MEASURED optical constants for 70/30 yellow brass (CRDC-CR-85034, 1985,
 * via refractiveindex.info) through the CIE 1931 colour matching functions → (0.895, 0.782, 0.413), within 0.015.
 * `live-work/scripts/film04-brass-f0-23-october.py`; D-088, 23 October.
 */
export const BRASS_F0_LINEAR: readonly [number, number, number] = [0.91, 0.778, 0.423];

/**
 * ⚠ STARTING VALUES for Carl's eye (the plan), not tuned. `grainContrast` 0 until step 3 builds the grain.
 * ⛔ `anisotropyRotation` π/2 — the plan's WRITTEN PREDICTION, which stands; ESTABLISHED FROM THE SHADER, NOT BY A STATISTIC
 * (step 1, 23 October). Lit by the studio alone, three does not blur the reflection along the tangent: it BENDS THE NORMAL
 * toward the view direction with the bitangent removed (`envmap_physical_pars_fragment.glsl.js:52–56`) — at anisotropy 0.8,
 * roughness 0.35, ~95% bent. On a flat face that SWINGS the reflection: rotation 0 (B = +y) swings it SIDEWAYS — the mirror
 * probe at yaw 0 went from a softbox to black; π/2 (B = +x) swings it UP AND DOWN, along the tall softboxes — the probe
 * barely changed. So the lobe stretches along T: π/2 = VERTICAL streaks, across Carl's horizontal grain.
 * ⚠ THREE GRADIENT STATISTICS DID NOT ESTABLISH IT: on the letters the ratio flipped with the yaw (285°: 2.58 / 1.15;
 * 30°: 1.12 / 2.70), and on the probe it was inconclusive — a SHIFT is not a blur, and the statistic measured blur. The
 * default was briefly set to 0 on the first (confounded) reading and restored. `live-work/scripts/film04-pass2-*-23-october.mjs`.
 * ⚠ The swing is view-dependent and STRONG at 0.8 — the look is Carl's to judge (step 4's dial).
 */
export const BRUSHED_BRASS: Extract<LetteringMaterial, { kind: "brushed-metal" }> = {
  kind: "brushed-metal",
  f0: BRASS_F0_LINEAR,
  tone: 0,
  strength: 1,
  face: { roughness: 0.35, anisotropy: 0.8, anisotropyRotation: Math.PI / 2, grainEm: 0.02, grainContrast: 0 },
  edge: { roughness: 0.12 },
};

/** The metal's colour at `tone`: 0 = its F0, 1 = its own luminance (no colour), linear. */
export function toneF0(f0: readonly [number, number, number], tone: number): [number, number, number] {
  const L = 0.2126 * f0[0] + 0.7152 * f0[1] + 0.0722 * f0[2];
  return [0, 1, 2].map((i) => f0[i] + (L - f0[i]) * tone) as [number, number, number];
}

export type BrushedMetal = { face: THREE.MeshPhysicalMaterial; edge: THREE.MeshPhysicalMaterial; dispose: () => void };

/** Built ONCE per studio texture; `applyBrushedMetal` sets the values each change (no rebuild, no recompile unless a define
 *  flips — three bumps the version when anisotropy crosses 0). */
export function createBrushedMetal(hdri: THREE.Texture): BrushedMetal {
  const face = new THREE.MeshPhysicalMaterial({ metalness: 1, envMap: hdri });
  const edge = new THREE.MeshPhysicalMaterial({ metalness: 1, envMap: hdri });
  return {
    face,
    edge,
    dispose: () => {
      face.dispose();
      edge.dispose();
    },
  };
}

/** The look onto the two materials; `yawDeg` turns the studio (a bench fixture, NOT a spec part — the Architect). */
export function applyBrushedMetal(m: BrushedMetal, look: Extract<LetteringMaterial, { kind: "brushed-metal" }>, yawDeg: number) {
  const [r, g, b] = toneF0(look.f0, look.tone);
  for (const mat of [m.face, m.edge]) {
    mat.color.setRGB(r, g, b, THREE.LinearSRGBColorSpace);
    mat.envMapIntensity = look.strength;
    mat.envMapRotation.set(0, (yawDeg * Math.PI) / 180, 0);
  }
  m.face.roughness = look.face.roughness;
  m.face.anisotropy = look.face.anisotropy;
  m.face.anisotropyRotation = look.face.anisotropyRotation;
  m.edge.roughness = look.edge.roughness;
  m.edge.anisotropy = 0;
}
