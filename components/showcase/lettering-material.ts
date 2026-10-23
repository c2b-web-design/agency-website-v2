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
 * ⚠ STARTING VALUES for Carl's eye (the plan), not tuned. The grain (step 3): pitch 0.02 em (3.2 layout px at 160 px — above
 * the ~2 device px floor at the bench's framing), contrast 0.6 (texels 0.2–0.8 of the doubled roughness).
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
/*
 * ⛔ THE FACE's `strength` 0.1 — MEASURED, step 4 (23 October): at 1 the face, which mirrors a whole softbox front-on, was
 * OVEREXPOSED — 77% of the letters' pixels at ≥ 250, and Neutral tone mapping rolls overexposed colour to WHITE, which is why
 * it read CREAM. Front-on (orthographic): 0.2 → 31%, 0.15 → 1.3%, 0.1 → 0%; oblique (yaw 285°) 0.1 → 1.8%.
 * ⛔ THE EDGE's `strength` 1 — its OWN (Carl, 23 October: route 1, "Implement 1 and 2"): at a shared 0.1 the face went to brass
 * but the polished edge lost the sparkle Carl had seen in step 2 ("the brushed effect really comes alive on the bevel" —
 * the bevel at strength 1). Separate, the bright polished outline stands against the calmer face: the depth a static sign
 * keeps. ⚠ SET UNDER NEUTRAL, JUDGING (C1).
 * ⛔ THE FACE's REFLECTION WIDENED — roughness 0.35 → 0.5, strength 0.1 → 0.13 (Carl, 23 October: "the C O and M is the
 * look we want. The reflection should also reach the left and right sides but without blowing out the centre"). MEASURED at
 * the studio's 305°, perspective front, in fifths across the word (`live-work/scripts/film04-pass2-spread-23-october.mjs`):
 * the middle held at the C-O-M level (39.3 → 39.5) while the ends rose from 67% of it to 87% (L 34.5, R 37.2) — a rougher
 * face spreads the softbox's reflection; the strength restores the level. ⚠ 0.5 is the CEILING while the grain is on:
 * its map doubles the roughness, so 0.55, 0.65 and 0.8 measured IDENTICAL (clipped at 1). Two values, ONE target.
 */
export const BRUSHED_BRASS: Extract<LetteringMaterial, { kind: "brushed-metal" }> = {
  kind: "brushed-metal",
  f0: BRASS_F0_LINEAR,
  tone: 0,
  face: { strength: 0.13, roughness: 0.5, anisotropy: 0.8, anisotropyRotation: Math.PI / 2, grainEm: 0.02, grainContrast: 0.6 },
  edge: { strength: 1, roughness: 0.12 },
};

/** The metal's colour at `tone`: 0 = its F0, 1 = its own luminance (no colour), linear. */
export function toneF0(f0: readonly [number, number, number], tone: number): [number, number, number] {
  const L = 0.2126 * f0[0] + 0.7152 * f0[1] + 0.0722 * f0[2];
  return [0, 1, 2].map((i) => f0[i] + (L - f0[i]) * tone) as [number, number, number];
}

// ── THE GRAIN (step 3) ────────────────────────────────────────────────────────────────────────────────────────────────

/**
 * ⛔ THE GRAIN TEXTURE — fine HORIZONTAL streaks, the face's `roughnessMap` (three reads its GREEN channel and MULTIPLIES
 * `roughness` by it). Each row of texels is one streak line; along a row the value holds for a run (40–440 texels) and then
 * changes, so the streaks start and stop as a brushed sheet's do. Its mean is 0.5, and the material's roughness is set to
 * TWICE the look's value to compensate, so the grain varies the roughness AROUND the chosen value without moving it.
 * `contrast` 0–1: the texels span 0.5 ± contrast/2. Seeded (mulberry32, seed 1), so every render of a setting is identical —
 * the regression frames rely on it. ⚠ Data, not colour: no colour space.
 * ⚠ NAME CLASH: `texture.anisotropy` (8 below) is TEXTURE FILTERING — sharper sampling at grazing angles, against moiré at
 * the oblique view (the answer card's precedent) — and has nothing to do with the MATERIAL's `anisotropy`, the brushing.
 */
export const GRAIN_TEXELS = { w: 1024, h: 256 } as const;
export function makeGrainTexture(contrast: number): THREE.CanvasTexture {
  let seed = 1;
  const rand = () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const { w, h } = GRAIN_TEXELS;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  const img = ctx.createImageData(w, h);
  for (let y = 0; y < h; y++) {
    const row = rand();
    let x = 0;
    while (x < w) {
      const run = 40 + Math.floor(rand() * 400);
      const n = 0.5 * row + 0.5 * rand();
      const v = Math.round(255 * (0.5 + contrast * (n - 0.5)));
      for (let i = x; i < Math.min(w, x + run); i++) {
        const o = 4 * (y * w + i);
        img.data[o] = img.data[o + 1] = img.data[o + 2] = v;
        img.data[o + 3] = 255;
      }
      x += run;
    }
  }
  ctx.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 8;
  return t;
}

/**
 * The grain's pitch is in EM (a part): one texel row = `grainEm × sizePx` layout px, a texel column the same, so the
 * streaks scale with the client's size. ⛔ The face UVs ARE layout px (`face uv = position.xy`, set in `buildLettering`),
 * so the repeat is 1 / (texels × pitch in px).
 */
export function grainRepeat(grainEm: number, sizePx: number): [number, number] {
  const px = Math.max(1e-3, grainEm * sizePx);
  return [1 / (GRAIN_TEXELS.w * px), 1 / (GRAIN_TEXELS.h * px)];
}

export type BrushedMetal = {
  face: THREE.MeshPhysicalMaterial;
  edge: THREE.MeshPhysicalMaterial;
  /** the grain texture and the contrast it was drawn at (redrawn when the contrast changes) */
  grain: { texture: THREE.CanvasTexture; contrast: number } | null;
  dispose: () => void;
};

/** Built ONCE per studio texture; `applyBrushedMetal` sets the values each change (no rebuild, no recompile unless a define
 *  flips — three bumps the version when anisotropy crosses 0; a roughness map appearing or going is flagged here). */
export function createBrushedMetal(hdri: THREE.Texture): BrushedMetal {
  const face = new THREE.MeshPhysicalMaterial({ metalness: 1, envMap: hdri });
  const edge = new THREE.MeshPhysicalMaterial({ metalness: 1, envMap: hdri });
  const m: BrushedMetal = {
    face,
    edge,
    grain: null,
    dispose: () => {
      face.dispose();
      edge.dispose();
      m.grain?.texture.dispose();
    },
  };
  return m;
}

/** The look onto the two materials; `yawDeg` turns the studio (a bench fixture, NOT a spec part — the Architect). */
export function applyBrushedMetal(m: BrushedMetal, look: Extract<LetteringMaterial, { kind: "brushed-metal" }>, yawDeg: number, sizePx: number) {
  const [r, g, b] = toneF0(look.f0, look.tone);
  for (const mat of [m.face, m.edge]) {
    mat.color.setRGB(r, g, b, THREE.LinearSRGBColorSpace);
    mat.envMapRotation.set(0, (yawDeg * Math.PI) / 180, 0);
  }
  m.face.envMapIntensity = look.face.strength;
  m.edge.envMapIntensity = look.edge.strength;
  // the grain: no map at contrast 0 (step 2's face exactly); redrawn when the contrast changes; the repeat from the pitch
  const contrast = look.face.grainContrast;
  if (contrast > 0 && m.grain?.contrast !== contrast) {
    m.grain?.texture.dispose();
    m.grain = { texture: makeGrainTexture(contrast), contrast };
  } else if (contrast <= 0 && m.grain) {
    m.grain.texture.dispose();
    m.grain = null;
  }
  const map = m.grain?.texture ?? null;
  if (m.face.roughnessMap !== map) {
    m.face.roughnessMap = map;
    m.face.needsUpdate = true;
  }
  if (map) map.repeat.set(...grainRepeat(look.face.grainEm, sizePx));
  // the map's mean is 0.5, so the roughness is doubled under it to stay at the chosen value
  // ⚠ above 0.5 the doubled value CLIPS at 1, and the mean falls below the chosen value — stated, not hidden
  m.face.roughness = map ? Math.min(1, look.face.roughness * 2) : look.face.roughness;
  m.face.anisotropy = look.face.anisotropy;
  m.face.anisotropyRotation = look.face.anisotropyRotation;
  m.edge.roughness = look.edge.roughness;
  m.edge.anisotropy = 0;
}
