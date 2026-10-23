/**
 * ⛔ FILM 4's LETTERING — the showcase's extruded words (D-088, 22 October 2026, session 2). PASS 1: THE MESH, IN CLAY.
 * Plan: `live-work/film04-pass1-mesh-plan-22-october.md` (v4.1, four Architect rounds, approved by Carl).
 *
 * ⛔ A CLIENT TEMPLATE (Carl, 21 October: *"interchangable parts that can be iterated opun depending on a clients needs"*).
 * ONE spec object, `LetteringSpec`, carries the parts: words, font, size, tracking, depth, edge, smoothness. Passes 2 and 3
 * add material and light to the same object. A client swap is a change of data, never of code.
 *
 * ⛔ THE BROWSER SETS THE WORDS; THREE ONLY EXTRUDES THEM. `TextGeometry` on a whole string advances each glyph by its own
 * width and never kerns (`FontLoader.js`, `glyph.ha`); at display size "Yo" shows it. So the bench lays the words out in a
 * live DOM span, reads each character's x and the baseline with `measureLabel` (`components/home/whoweare-button-scene.tsx`,
 * the family label's method — the browser's shaper applies the font's full kerning and `letter-spacing`), and this module
 * builds ONE `TextGeometry` PER CHARACTER at those positions, then merges them. Positions are in LAYOUT px, relative to the
 * span's centre, y up; one world unit = one layout px. ⚠ Characters are indexed by UTF-16 code unit (`split("")`), as
 * `measureLabel` reads them — a character outside the BMP is reported missing rather than shifting every later x.
 * ⚠ The outlines come from a typeface JSON and the spacing from the browser's webfont — TWO FILES. They are proven to be
 * the same font before anything is built (`fontProof`, below, run by the bench).
 *
 * ⛔ DEPTH AND EDGE ARE FRACTIONS OF THE EM, so a client's size change keeps the letters' proportions. `sizePx` is the
 * spec's; the bench's camera frames the words and never rescales them.
 *
 * ⛔ THE EDGE DOES NOT THICKEN THE LETTERS: `bevelOffset = −bevelSize` keeps the side walls on the true outline (the face is
 * set in by the bevel instead), and three adds the bevel's thickness at BOTH ends, so the straight depth is
 * `max(0.01, depth − 2 × thickness)` and the total holds — the family label's rule (`whoweare-button-scene.tsx`, the
 * `ExtrudedLabel` bevel).
 */
import * as THREE from "three";
import type { Font } from "three/addons/loaders/FontLoader.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import { mergeGeometries, toCreasedNormals } from "three/addons/utils/BufferGeometryUtils.js";
import type { Glyphs } from "@/components/home/whoweare-button-scene";
import { BRUSHED_BRASS } from "./lettering-material";

/** The fonts the bench may load — a FIXED list, so a URL a client is sent cannot point it anywhere else. Each has been
 *  through `scripts/check-typeface-overlaps.mjs` (✅ geist-semibold: 95 glyphs, curveSegments 4–24, 22 October 2026). */
export const SHOWCASE_FONTS = {
  "geist-semibold": {
    url: "/fonts/geist-semibold.typeface.json",
    weight: 600,
    css: "var(--font-geist-sans)",
  },
} as const;
export type ShowcaseFont = keyof typeof SHOWCASE_FONTS;

export type LetteringSpec = {
  words: string;
  font: ShowcaseFont;
  /** the type's size, layout px */
  sizePx: number;
  /** CSS letter-spacing, em */
  trackingEm: number;
  /** the extrusion's total depth, em */
  depthEm: number;
  /** the edge: `sizeEm` inward across the face, `thicknessEm` along the depth (at each end); `segments` 1 = a straight chamfer */
  bevel: { sizeEm: number; thicknessEm: number; segments: number };
  /** the flattening of each curve — the same number the overlap check was run at */
  curveSegments: number;
  /**
   * ⛔ THE CREASE, degrees (23 October 2026 — Carl: *"Let us resolve the banding issue."*). Three's text geometry gives
   * every triangle its own normal, so a curve's side wall shades as a row of flat facets — faint in clay, it bands under
   * metal (the R-088 finding). Normals are averaged across edges whose faces meet at less than this angle and kept split
   * above it (`toCreasedNormals`): the curves read round, the corners and the chamfer stay sharp. 0 = faceted, as built.
   * ⚠ MEASURED for 160 px, curveSegments 12, the 0.018 em chamfer (`live-work/scripts/film04-crease-angles-23-october.mjs`):
   * curve facets meet at ≤ 7.5° (most ≤ 6°), wall corners at ≥ 30° (the Y), the chamfer at 45° to face and wall. 10° smooths
   * every curve facet and keeps every wall corner; it also softens the chamfer at a few shallow joins (6–10°, the A and Y).
   * ⚠ Coupled to `curveSegments`: fewer segments make larger facet angles, which a fixed crease may leave faceted.
   */
  creaseDeg: number;
  /** how the words are set: one straight line (take 1, R-088), or the restaurant lockup's ARCH (take 2) */
  layout: LetteringLayout;
  /** ⛔ PASS 2 — the material, a PART (`lettering-material.ts`). Applied to the LINE only this pass; the arch stays clay. */
  material: LetteringMaterial;
};

/**
 * ⛔ THE MATERIAL AS DATA (pass 2, 23 October 2026; plan `live-work/film04-pass2-material-plan-23-october.md` v2.1). Carl:
 * a BRUSHED FACE with a POLISHED EDGE, the grain HORIZONTAL; brushed brass leads. `f0` is the metal's reflectance at normal
 * incidence, LINEAR; `tone` 0 = that metal, 1 = its own luminance (no colour) — the road to a pale satin. `face` is three's
 * materialIndex 0 (the letters' fronts), `edge` materialIndex 1 (walls and chamfer together).
 * ⚠⚠ EVERY VALUE CARL SETS THIS PASS IS SET UNDER NEUTRAL TONE MAPPING, JUDGING (Architect C1, D-046/D-048): the page's
 * tone mapping is pass 3's; if it is ACES, these values are to be re-checked, not trusted.
 */
export type LetteringMaterial =
  | { kind: "clay" }
  | {
      kind: "brushed-metal";
      f0: readonly [number, number, number];
      tone: number;
      /** each part's `strength` is its `envMapIntensity` — with no lamps, the metal's brightness control (the corners' strength).
       *  ⛔ SEPARATE for the face and the edge (Carl, 23 October, route 1): a bright polished outline against a calmer face. */
      face: { strength: number; roughness: number; anisotropy: number; anisotropyRotation: number; grainEm: number; grainContrast: number };
      edge: { strength: number; roughness: number };
    };

/**
 * ⛔ THE ARCH (take 2, D-088, 22 October 2026; plan `live-work/film04-pass1-take2-arch-plan-22-october.md`). Carl: *"Your
 * linear at the top with Conpany as an upside down "U" with C starting as its left base and Y as its righ base"*; the form
 * from his reference, *"a straight line at the top and a curved line forming the arch"*. `top` is the LINTEL, straight and
 * centred; `arch` runs over the curve. ⛔ EVERY LETTER STANDS UPRIGHT (Carl's ruling — placed along the curve, never
 * turned). `sweepDeg` is measured between the first and last letters' CENTRES, so the first sits exactly at the left foot
 * and the last at the right. `archTrackingEm` is the lever Carl chose to open the arch: the radius grows with the word.
 */
export type ArchLayout = {
  kind: "arch";
  top: string;
  arch: string;
  /**
   * ⛔ SET IN CAPITALS (take 3 — Carl: *"it would work better if the letters were all capitalised. The spacing would be
   * better and because of the shape and height of the P it throew it out of alignment. The same can be said of the Y"*).
   * Lowercase letters do not share one height (the p's tail and high bowl, the y's tail), so on a curve the band wobbles;
   * capitals stand one height on one baseline. The words are TYPED as given and SET in capitals — a part, so a client's
   * text is never retyped — and the arch's reference height becomes half the CAP height. `false` is take 2 (lowercase).
   */
  caps: boolean;
  /**
   * ⛔ HOW THE ARCH's LETTERS ARE SPACED (take 4 — Carl: *"the P should be centred. The M and A should sit on the same
   * horizontal line. Same for the other letters. So the shape of the arch is more implied rather than spelt out."*).
   * `"equal"`: EQUAL ANGLE STEPS, as an arch's stones are laid — the middle letter at the crown, each pair mirrored on one
   * level, the first and last the feet; the curve is IMPLIED by where the letters stand. The font's spacing no longer
   * places the arch's letters (the browser's reading still sizes the arch through `archTrackingEm`, and still proves the
   * font). `"font"`: take 3 — the browser's advances become arc length (kerning carried, the arch asymmetric).
   */
  steps: "equal" | "font";
  /**
   * ⛔ OPTICAL NUDGES, em, by character, sideways, on the ARCH only (take 5 — Carl: *"Just move the P a touch to the right.
   * There is too much space from the A. In that way the M P and A can be seen as one component being the top of the
   * Arch."*). A sign-maker's adjustment by eye: the P's ink already sits RIGHT of its advance centre (+2.9 px at 160 px), so
   * this is not a centring error — the P's weight is in its stem and upper bowl, its lower right is empty, and the A's left
   * leg slopes away, so P–A reads more open than M–P (two upright stems). A part, so a client's word takes its own.
   */
  nudgeEm: Record<string, number>;
  /**
   * ⛔ THE ARCH's FORM (take 7, 23 October 2026 — Carl, with "logo" added to the arch: *"Some of the letters should be
   * vertical with the curve at the top. That would make it thinner, Space the letters so it looks balanced."*).
   * `"round"`: a ROUND-HEADED arch, the reference's piers — two upright LEGS under a half-circle of `radiusEm`. The letters
   * follow it from the left foot, each the same CLOSEST DISTANCE (`clearEm`) from the one before, a word gap adding the
   * font's own space; the legs grow until the last letter lands on the right foot, so the feet are level by construction.
   * ⚠ Closest distance is the PROXY for optical space take 5 used; Carl's eye judges the balance. `sweepDeg`, `steps` and
   * `archTrackingEm` do not apply. `"half"`: takes 2–5, a half-circle to the feet.
   */
  form: "half" | "round";
  /** round only: the half-circle's radius to the letters' centres, em — the arch's width */
  radiusEm: number;
  /** round only: the closest distance between neighbouring letters' outlines, em */
  clearEm: number;
  sweepDeg: number;
  archTrackingEm: number;
  topScale: number;
  gapEm: number;
};
/** The words as SET — capitals when the layout asks for them. */
export const setCase = (words: string, layout: ArchLayout) => (layout.caps ? words.toUpperCase() : words);
export type LetteringLayout = { kind: "line" } | ArchLayout;

/** ⚠ TAKE 1 — starting values for Carl's eye, not tuned. Geist SemiBold, one line, a narrow straight chamfer (the
 *  family's language, the desk mark's *"flat face in a narrow chamfer"*). */
export const LETTERING_DEFAULTS: LetteringSpec = {
  words: "Your company",
  font: "geist-semibold",
  sizePx: 160,
  trackingEm: 0,
  depthEm: 0.2,
  bevel: { sizeEm: 0.018, thicknessEm: 0.018, segments: 1 },
  curveSegments: 12,
  creaseDeg: 10,
  // ⛔ archTrackingEm 0.26 — MEASURED for CAPITALS (take 3, 22 October 2026, `live-work/scripts/film04-arch-tracking-22-october.mjs`):
  // the smallest that clears every pair by COLLISION_MARGIN_EM at 180°, 160 px. At 0, C–O, O–M, A–N and N–Y OVERLAP (the
  // red run); A–N is the last to clear (0.25 leaves it 0.0131 em); at 0.26 the closest pair is the lintel's Y–O, 0.1061 em
  // (a real reading confirmed the probe). Take 2's LOWERCASE needed 0.16 (a–n 0.0211 em) — `?caps=0&archtrack=0.16`.
  // ⛔ TAKE 4, EQUAL STEPS: 0.21 — MEASURED the same way (red run C–O, O–M, A–N; 0.20 leaves A–N 0.0143 em; at 0.21 the
  // closest is O–M 0.0392 em, a real reading matching the probe). With equal steps it SIZES the arch (the radius), it no
  // longer spaces the letters along it. Take 3 (`?steps=font`) needed 0.26.
  // ⚠ Valid for THESE words, this font and this sweep only — a swap re-checks on the bench.
  // ⛔ TAKE 5, THE P NUDGED +0.11 em (17.6 px): MEASURED as the value at which the P's closest distance to the M equals its
  // closest distance to the A (60.1 / 60.0 px; take 4 was 42.5 / 76.5) — `live-work/scripts/film04-crown-nudge-22-october.mjs`.
  // ⚠ Closest distance is a PROXY for optical space; Carl asked for "a touch" — his eye sets it (the bench's P slider).
  // ⛔ TAKE 7 (23 October 2026): the arch reads "company logo", ROUND-HEADED (`form`). The P's nudge was a CROWN correction
  // and the P no longer stands there, so it is off (take 5 is `?form=half&arch=company&nudge=P:0.11`).
  // ⚠ radiusEm 1.8 and clearEm 0.2 (32 px) are the Builder's pick by eye from 1.2–2.2 and 0.12–0.3 (frames in the session
  // scratchpad): at 1.8 three letters stand on each leg (C O M / O G O) and P A N Y L run over the curve, the N at the crown;
  // 1.6 lifts P and L onto the legs and flattens the top, 2.2 lifts M and the first O onto the curve. Carl's eye judges.
  layout: {
    kind: "arch", top: "Your", arch: "company logo", caps: true, steps: "equal", nudgeEm: {}, form: "round", radiusEm: 1.8, clearEm: 0.2,
    sweepDeg: 180, archTrackingEm: 0.21, topScale: 1, gapEm: 0.25,
  },
  // ⛔ PASS 2: the LINE's material (the arch ignores it this pass and stays clay)
  material: BRUSHED_BRASS,
};

/** Sweep limits: below 20° the radius runs away (the line layout serves that); above 200° the feet curl under. */
export const SWEEP_MIN = 20;
export const SWEEP_MAX = 200;
/** The clearance every pair must keep, em (~3 px at 160 px). Below it, or touching, is shown on the bench. */
export const COLLISION_MARGIN_EM = 0.02;

/** the typeface JSON's units per em (`TTFLoader`: advances × 1e5 / (unitsPerEm × 72)) */
const EM_UNITS = 100000 / 72;

/** A glyph's advance in layout px at `sizePx`, from the JSON. */
export function advancePx(font: Font, ch: string, sizePx: number): number | null {
  const g = font.data.glyphs[ch];
  return g ? (g.ha * sizePx) / EM_UNITS : null;
}

export type PairReading = {
  pair: string;
  /** the pen-to-pen distance as built (kern-on span) */
  advanceGapPx: number;
  /** the space between the two letters' SILHOUETTES (bounding boxes over all vertices, before the merge) */
  visibleGapPx: number;
};

export type LetteringStats = {
  triangles: number;
  buildMs: number;
  widthPx: number;
  heightPx: number;
  /** characters the font lacks — named, never drawn as "?" */
  missing: string[];
  pairs: PairReading[];
};

/**
 * ONE LETTER, extruded at its pen origin (x 0, baseline 0), centred on the depth — shared by both layouts. The edge holds
 * the outline (`bevelOffset = −size`) and the straight depth gives up twice the thickness, so the total holds.
 */
export function glyphGeometry(font: Font, ch: string, sizePx: number, spec: Pick<LetteringSpec, "depthEm" | "bevel" | "curveSegments" | "creaseDeg">): THREE.BufferGeometry {
  const size = (sizePx * font.data.resolution) / EM_UNITS;
  const depth = spec.depthEm * sizePx;
  const bevelSize = spec.bevel.sizeEm * sizePx;
  const thick = spec.bevel.thicknessEm * sizePx;
  const bevelOn = bevelSize > 0 && thick > 0;
  const straight = bevelOn ? Math.max(0.01, depth - 2 * thick) : depth;
  const g = new TextGeometry(ch, {
    font,
    size,
    depth: straight,
    curveSegments: spec.curveSegments,
    bevelEnabled: bevelOn,
    bevelThickness: thick,
    bevelSize,
    bevelOffset: bevelOn ? -bevelSize : 0,
    bevelSegments: Math.max(1, spec.bevel.segments),
  });
  // centred on the depth: the extrusion runs from −thick to straight + thick
  g.translate(0, 0, -straight / 2);
  // the crease: three's text geometry is non-indexed, so this rewrites `g`'s normals in place and returns `g`
  return spec.creaseDeg > 0 ? toCreasedNormals(g, (spec.creaseDeg * Math.PI) / 180) : g;
}

/**
 * Build the words. `glyphs` is `measureLabel`'s reading of the kern-on span (x per character, the baseline, relative to the
 * span's centre). Spaces take their place in the setting and build nothing.
 */
/**
 * ⛔ ONE LETTER's TRIANGLES SPLIT BY MATERIAL — [face, sides] (pass 2, step 2). Three's text geometry adds a FACE group
 * (materialIndex 0: the front and back) and a SIDES group (materialIndex 1: walls AND chamfer) FOR EACH SHAPE
 * (`ExtrudeGeometry.js:65–68, 626, 650`), so a glyph of two shapes — "i", "j", ":", "!", "%" — runs 0, 1, 0, 1.
 * ⛔ SPLIT BY `materialIndex`, NEVER BY A GROUP's POSITION (the Architect): position would hand the "i"'s dot to the wrong
 * material and every check on "Your company" would still pass. Non-indexed in, non-indexed out; every attribute copied.
 */
export function splitByMaterial(g: THREE.BufferGeometry): [THREE.BufferGeometry, THREE.BufferGeometry] {
  const src = g.index ? g.toNonIndexed() : g;
  const out = [new THREE.BufferGeometry(), new THREE.BufferGeometry()] as [THREE.BufferGeometry, THREE.BufferGeometry];
  const groups = src.groups.length ? src.groups : [{ start: 0, count: src.attributes.position.count, materialIndex: 0 }];
  for (const name of Object.keys(src.attributes)) {
    const a = src.attributes[name] as THREE.BufferAttribute;
    const parts: number[][] = [[], []];
    for (const grp of groups) {
      const k = grp.materialIndex === 1 ? 1 : 0;
      const from = grp.start * a.itemSize, to = (grp.start + grp.count) * a.itemSize;
      for (let i = from; i < to; i++) parts[k].push(a.array[i]);
    }
    out[0].setAttribute(name, new THREE.BufferAttribute(new Float32Array(parts[0]), a.itemSize));
    out[1].setAttribute(name, new THREE.BufferAttribute(new Float32Array(parts[1]), a.itemSize));
  }
  if (src !== g) src.dispose();
  return out;
}

/** ⛔ The fields the build reads — the bench keys the line's build on exactly these (with the words' reading), so a material
 *  or studio change cannot re-extrude (the Architect, pass 2). The type IS the list: reading another field is a type error. */
export type LineGeometryKey = Pick<LetteringSpec, "sizePx" | "depthEm" | "bevel" | "curveSegments" | "creaseDeg">;
export function buildLettering(spec: LineGeometryKey, font: Font, glyphs: Glyphs): { geometry: THREE.BufferGeometry | null; stats: LetteringStats } {
  const t0 = performance.now();
  const missing: string[] = [];
  // ⛔ PASS 2, STEP 2: each letter split BY MATERIAL into its face and its sides, so the merged line keeps the two groups
  // the brushed face and the polished edge need (a merge of whole letters drops them)
  const faces: THREE.BufferGeometry[] = [];
  const sides: THREE.BufferGeometry[] = [];
  const boxes: { ch: string; box: THREE.Box3 }[] = [];
  glyphs.chars.split("").forEach((ch, i) => {
    if (ch.trim() === "") return;
    if (!font.data.glyphs[ch]) {
      if (!missing.includes(ch)) missing.push(ch);
      return;
    }
    const g = glyphGeometry(font, ch, spec.sizePx, spec);
    g.translate(glyphs.x[i], glyphs.baseline, 0);
    g.computeBoundingBox();
    boxes.push({ ch, box: g.boundingBox!.clone() });
    const [face, side] = splitByMaterial(g);
    // ⛔ ONE SHEET ACROSS THE WORD (step 3): three's face UVs are each shape's own x, y (`generateTopUV`), so every letter
    // would start the grain at its own origin and repeat the same streaks. Set to the PLACED position instead — face
    // uv = position.xy exactly, in layout px — so the streaks run through the word as if cut from one brushed plate.
    // (A shift of the UVs moves no tangent: the brushing's frame comes from their derivatives.)
    const fp = face.attributes.position, fuv = face.attributes.uv;
    for (let v = 0; v < fp.count; v++) fuv.setXY(v, fp.getX(v), fp.getY(v));
    faces.push(face);
    sides.push(side);
    g.dispose();
  });

  // pairs of NEIGHBOURING characters only (a space between breaks the pair); `boxes` holds one entry per built character,
  // in order, so `b` walks it alongside the string
  const pairs: PairReading[] = [];
  const chars = glyphs.chars.split("");
  let b = 0;
  for (let i = 0; i + 1 < chars.length; i++) {
    const here = chars[i],
      next = chars[i + 1];
    if (here.trim() === "" || !font.data.glyphs[here]) continue;
    const thisBox = boxes[b++];
    if (next.trim() === "" || !font.data.glyphs[next]) continue;
    const nextBox = boxes[b];
    pairs.push({
      pair: here + next,
      advanceGapPx: glyphs.x[i + 1] - glyphs.x[i],
      visibleGapPx: nextBox.box.min.x - thisBox.box.max.x,
    });
  }

  // faces first, then sides: `useGroups` gives group 0 (the faces, materialIndex 0) and group 1 (the sides, materialIndex 1).
  // ⚠ The triangles are REORDERED (all faces, then all sides). A single material draws the whole geometry and ignores the
  // groups, so the clay/flat/mesh/normals/zebra modes are unchanged — asserted pixel-identical against step 0's frames.
  let geometry: THREE.BufferGeometry | null = null;
  if (faces.length) {
    const f = mergeGeometries(faces), s = mergeGeometries(sides);
    geometry = mergeGeometries([f, s], true);
    f.dispose();
    s.dispose();
  }
  [...faces, ...sides].forEach((g) => g.dispose());
  const all = new THREE.Box3();
  boxes.forEach(({ box }) => all.union(box));
  const stats: LetteringStats = {
    triangles: geometry ? geometry.attributes.position.count / 3 : 0,
    buildMs: performance.now() - t0,
    widthPx: boxes.length ? all.max.x - all.min.x : 0,
    heightPx: boxes.length ? all.max.y - all.min.y : 0,
    missing,
    pairs,
  };
  return { geometry, stats };
}

export type FontProof = {
  ok: boolean;
  /** the largest |measured gap − JSON advance| over every character, layout px */
  worstPx: number;
  worstChar: string;
  /** the text's right edge (a Range over the whole text) against the last character's x + its JSON advance */
  rightEdgeResidualPx: number;
  tolerancePx: number;
  /** ⚠ the first reading is a CALIBRATION (the plan): small, uniform misses are reported as such, not read as a fallback */
  uniform: boolean;
};

/**
 * ⛔ THE WEBFONT AND THE OUTLINE FILE ARE THE SAME FONT. Read from the KERN-OFF span (`font-kerning: none`, no tracking):
 * every gap between neighbouring characters must equal the first character's JSON advance within `tolerancePx`, and the
 * whole text's right edge must meet the last character's x plus its advance. A fallback face, or another release with
 * other widths, misses on every glyph. ⚠ The 0.1 px tolerance is UNCALIBRATED until this has been read once (the plan).
 */
export function fontProof(font: Font, off: Glyphs, rightEdgePx: number, sizePx: number, tolerancePx = 0.1): FontProof {
  const chars = off.chars.split("");
  const residuals: { ch: string; r: number }[] = [];
  for (let i = 0; i + 1 < chars.length; i++) {
    const adv = advancePx(font, chars[i], sizePx);
    if (adv !== null) residuals.push({ ch: chars[i], r: off.x[i + 1] - off.x[i] - adv });
  }
  const lastAdv = chars.length ? advancePx(font, chars[chars.length - 1], sizePx) : null;
  const rightEdgeResidualPx = lastAdv === null ? NaN : rightEdgePx - (off.x[chars.length - 1] + lastAdv);
  let worstPx = 0,
    worstChar = "";
  for (const { ch, r } of residuals)
    if (Math.abs(r) > Math.abs(worstPx)) {
      worstPx = r;
      worstChar = ch;
    }
  const spread = residuals.length ? Math.max(...residuals.map((x) => x.r)) - Math.min(...residuals.map((x) => x.r)) : 0;
  const ok = residuals.length > 0 && Math.abs(worstPx) <= tolerancePx && Math.abs(rightEdgeResidualPx) <= tolerancePx;
  return {
    ok,
    worstPx,
    worstChar,
    rightEdgeResidualPx,
    tolerancePx,
    uniform: spread <= tolerancePx,
  };
}

/** Each neighbouring pair's kern, read DIRECTLY: the kern-on gap minus the kern-off gap. The JSON is not involved.
 *  ⛔ `trackingPx` (the kern-on span's letter-spacing) is SUBTRACTED from every gap — without it every pair reads as
 *  kerned and the zero-pairs stop could never fire (the Architect, take 2's plan). */
export function kernReadings(on: Glyphs, off: Glyphs, trackingPx = 0): { pair: string; kernPx: number }[] {
  const chars = on.chars.split("");
  const out: { pair: string; kernPx: number }[] = [];
  for (let i = 0; i + 1 < chars.length; i++) {
    if (chars[i].trim() === "" || chars[i + 1].trim() === "") continue;
    out.push({
      pair: chars[i] + chars[i + 1],
      kernPx: on.x[i + 1] - on.x[i] - (off.x[i + 1] - off.x[i]) - trackingPx,
    });
  }
  return out;
}

/* ───────────────────────────── THE ARCH (take 2) ───────────────────────────── */

type V2 = { x: number; y: number };
/** A letter's outline in layout px at its pen origin — the contours three triangulates (`extractPoints(curveSegments)`).
 *  With `bevelOffset = −size` the extruded silhouette IS this outline (measured: 0.000 px, take 1). */
export function glyphOutline(font: Font, ch: string, sizePx: number, curveSegments: number): V2[][] {
  const out: V2[][] = [];
  for (const shape of font.generateShapes(ch, (sizePx * font.data.resolution) / EM_UNITS)) {
    const { shape: outer, holes } = shape.extractPoints(curveSegments);
    for (const c of [outer, ...holes]) out.push(c.map((p) => ({ x: p.x, y: p.y })));
  }
  return out;
}

/** A glyph's top in layout px, read from its outline: the "x" gives the x-height (742 units in Geist SemiBold), the
 *  "H" the cap height. */
export function glyphTopPx(font: Font, ch: string, sizePx: number): number {
  let top = 0;
  for (const c of glyphOutline(font, ch, sizePx, 4)) for (const p of c) top = Math.max(top, p.y);
  return top;
}

export type Bounds = { minX: number; maxX: number; minY: number; maxY: number };
export function outlineBounds(contours: V2[][]): Bounds {
  const b = {
    minX: Infinity,
    maxX: -Infinity,
    minY: Infinity,
    maxY: -Infinity,
  };
  for (const c of contours)
    for (const p of c) {
      b.minX = Math.min(b.minX, p.x);
      b.maxX = Math.max(b.maxX, p.x);
      b.minY = Math.min(b.minY, p.y);
      b.maxY = Math.max(b.maxY, p.y);
    }
  return b;
}

/** One letter of the lockup: which line, its character, its outline and bounds at its pen origin. */
export type LockupLetter = {
  line: "top" | "arch";
  index: number;
  ch: string;
  outline: V2[][];
  bounds: Bounds;
  sizePx: number;
};
/** Where a letter's PEN ORIGIN goes. ⛔ No rotation, ever (Carl: all upright). */
export type Placement = { x: number; y: number };

export type ArchReading = {
  radiusPx: number;
  /** the first and last arch letters' centre angles, degrees (expected 180 and 0 for a 180° sweep); NaN for a round arch */
  feetDeg: [number, number];
  /** round only: the legs' height under the half-circle, to the letters' centres (0 for a half-circle) */
  legPx: number;
  /** round only: false when the letters cannot span the half-circle at this width — the last stops short of the foot */
  fits: boolean;
  widthPx: number;
  heightPx: number;
  layoutMs: number;
};

/**
 * ⛔ PLACE THE LOCKUP — positions only (the letters are built once and moved; nothing is re-extruded on a slider tick).
 * Each arch letter's reference point is its ADVANCE CENTRE (the browser's x plus half its JSON advance — the font proof
 * has shown they agree) at HALF THE CAP HEIGHT (capitals) or HALF THE X-HEIGHT (lowercase); the distances between those points become ARC LENGTH, so the browser's
 * kerning and the tracking carry onto the curve. The lintel's LOWEST INK sits `gapEm` above the arch's HIGHEST INK (a
 * client's top word may have descenders). The whole lockup is centred on its bounds. `archX` may be the browser's reading
 * or a derived one (the tracking probe).
 */
export function layoutArch(
  layout: ArchLayout,
  font: Font,
  sizePx: number,
  letters: LockupLetter[],
  archX: number[],
  top: Glyphs,
): { placements: Map<LockupLetter, Placement>; reading: ArchReading } {
  const t0 = performance.now();
  // the reference height: the middle of the capitals (the "H") when set in capitals, else of the lowercase (the "x")
  const half = glyphTopPx(font, layout.caps ? "H" : "x", sizePx) / 2;
  const arch = letters.filter((l) => l.line === "arch");
  const centres = arch.map((l) => archX[l.index] + (advancePx(font, l.ch, sizePx) ?? 0) / 2);
  const placements = new Map<LockupLetter, Placement>();
  const at = (l: LockupLetter, c: V2): Placement => ({
    x: c.x - (advancePx(font, l.ch, sizePx) ?? 0) / 2 + (layout.nudgeEm[l.ch] ?? 0) * sizePx,
    y: c.y - half,
  });
  let R: number, legPx = 0, fits = true;
  const angles: number[] = [];
  if (layout.form === "round") {
    const r = roundArch(layout, font, sizePx, arch, at);
    R = r.R;
    legPx = r.H;
    fits = r.fits;
    arch.forEach((l, k) => placements.set(l, at(l, r.centres[k])));
  } else {
    const S = (Math.min(SWEEP_MAX, Math.max(SWEEP_MIN, layout.sweepDeg)) * Math.PI) / 180;
    const span = arch.length > 1 ? centres[centres.length - 1] - centres[0] : 0;
    R = span > 0 ? span / S : 0;
    const n = arch.length;
    arch.forEach((l, k) => {
      // equal steps: the k-th letter at k/(n−1) of the sweep (mirrored levels, the middle letter at the crown); font: arc length
      const theta = Math.PI / 2 + S / 2 - (layout.steps === "equal" ? (n > 1 ? (k * S) / (n - 1) : S / 2) : (centres[k] - centres[0]) / (R || 1));
      angles.push(theta);
      placements.set(l, at(l, { x: R * Math.cos(theta), y: R * Math.sin(theta) }));
    });
  }
  // the lintel: straight, centred, its lowest ink gapEm above the arch's highest ink
  let archTop = -Infinity;
  for (const l of arch) archTop = Math.max(archTop, placements.get(l)!.y + l.bounds.maxY);
  const tops = letters.filter((l) => l.line === "top");
  let topLow = Infinity;
  for (const l of tops) topLow = Math.min(topLow, l.bounds.minY);
  const baseY = (archTop === -Infinity ? 0 : archTop) + layout.gapEm * sizePx - (topLow === Infinity ? 0 : topLow);
  for (const l of tops) placements.set(l, { x: top.x[l.index], y: baseY });
  // centre the whole lockup on its bounds
  const all = {
    minX: Infinity,
    maxX: -Infinity,
    minY: Infinity,
    maxY: -Infinity,
  };
  for (const l of letters) {
    const p = placements.get(l)!;
    all.minX = Math.min(all.minX, p.x + l.bounds.minX);
    all.maxX = Math.max(all.maxX, p.x + l.bounds.maxX);
    all.minY = Math.min(all.minY, p.y + l.bounds.minY);
    all.maxY = Math.max(all.maxY, p.y + l.bounds.maxY);
  }
  const ox = (all.minX + all.maxX) / 2, oy = (all.minY + all.maxY) / 2;
  for (const p of placements.values()) {
    p.x -= ox;
    p.y -= oy;
  }
  const deg = (r: number) => (r * 180) / Math.PI;
  return {
    placements,
    reading: {
      radiusPx: R,
      feetDeg: [angles.length ? deg(angles[0]) : NaN, angles.length ? deg(angles[angles.length - 1]) : NaN],
      legPx,
      fits,
      widthPx: all.maxX - all.minX,
      heightPx: all.maxY - all.minY,
      layoutMs: performance.now() - t0,
    },
  };
}

/**
 * ⛔ THE ROUND-HEADED ARCH (take 7). The path the letters' centres follow: up the left leg (x = −R, from 0 to H), over the
 * half-circle (centre (0, H)), down the right leg — `s` is the distance along it. From the left foot, each letter is
 * placed at the smallest `s` that keeps its OUTLINE `clearEm` from the one before (`pairTest`, the collision check's own
 * test; the bounds rule out the far cases first) — a word gap adds the font's space. `H` is then found so the last letter
 * lands on the right foot (`s` = 2H + πR). If even H = 0 leaves the letters short of the right foot, the arch is too wide
 * for them: `fits` is false and they stop where they stop.
 * ⚠ Only NEIGHBOURS are spaced; the full collision check still runs over every pair.
 */
function roundArch(
  layout: ArchLayout,
  font: Font,
  sizePx: number,
  arch: LockupLetter[],
  at: (l: LockupLetter, c: V2) => Placement,
): { centres: V2[]; R: number; H: number; fits: boolean } {
  const R = layout.radiusEm * sizePx;
  const clear = layout.clearEm * sizePx;
  const space = advancePx(font, " ", sizePx) ?? 0.25 * sizePx;
  const n = arch.length;
  const path = (s: number, H: number): V2 => {
    if (s <= H) return { x: -R, y: s };
    if (s <= H + Math.PI * R) {
      const th = Math.PI - (s - H) / R;
      return { x: R * Math.cos(th), y: H + R * Math.sin(th) };
    }
    return { x: R, y: H - (s - H - Math.PI * R) };
  };
  // is B, centred at cb, at least `target` from A, centred at ca?
  const clearOf = (A: LockupLetter, ca: V2, B: LockupLetter, cb: V2, target: number) => keepsClear(A, at(A, ca), B, at(B, cb), target);
  const walk = (H: number) => {
    const s = [0];
    for (let k = 1; k < n; k++) {
      const target = clear + (arch[k].index - arch[k - 1].index > 1 ? space : 0);
      const prev = path(s[k - 1], H);
      const ok = (x: number) => clearOf(arch[k - 1], prev, arch[k], path(x, H), target);
      let lo = s[k - 1], hi = lo + 2 * sizePx;
      for (let i = 0; i < 8 && !ok(hi); i++) hi += sizePx;
      for (let i = 0; i < 14; i++) {
        const mid = (lo + hi) / 2;
        if (ok(mid)) hi = mid;
        else lo = mid;
      }
      s.push(hi);
    }
    return s;
  };
  // how far the last letter overshoots (+) or falls short of (−) the right foot
  const over = (H: number) => {
    const s = walk(H);
    return s[s.length - 1] - (2 * H + Math.PI * R);
  };
  let H = 0;
  let fits = true;
  const f0 = n > 1 ? over(0) : 0;
  if (f0 <= 0) fits = n <= 1;
  else {
    // bracket, then the Illinois method (a false position that does not stall)
    let a = 0, fa = f0, b = f0, fb = over(b);
    for (let i = 0; i < 8 && fb > 0; i++) {
      a = b;
      fa = fb;
      b *= 2;
      fb = over(b);
    }
    let side = 0;
    H = b;
    for (let i = 0; i < 40 && Math.abs(b - a) > 0.01; i++) {
      H = (fa * b - fb * a) / (fa - fb);
      const fh = over(H);
      if (Math.abs(fh) < 0.01) break;
      if (fh * fb > 0) {
        b = H;
        fb = fh;
        if (side === -1) fa /= 2;
        side = -1;
      } else {
        a = H;
        fa = fh;
        if (side === 1) fb /= 2;
        side = 1;
      }
    }
  }
  const s = walk(H);
  return { centres: s.map((x) => path(x, H)), R, H, fits };
}

export type PairClearance = {
  pair: string;
  collide: boolean;
  clearancePx: number;
};
export type CollisionReport = {
  pairs: PairClearance[];
  collisions: number;
  tight: number;
  worst: PairClearance | null;
  checkMs: number;
  marginPx: number;
  tested: number;
  /** every NEIGHBOURING pair on the arch, however far apart — the spacing the eye reads round the curve */
  neighbours: PairClearance[];
};

function cross(a: V2, b: V2, c: V2) {
  return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
}
function segsCross(a: V2, b: V2, c: V2, d: V2) {
  const d1 = cross(a, b, c), d2 = cross(a, b, d), d3 = cross(c, d, a), d4 = cross(c, d, b);
  return d1 * d2 < 0 && d3 * d4 < 0;
}
/** even-odd over every contour, so holes count */
function inside(p: V2, contours: V2[][]) {
  let odd = false;
  for (const c of contours)
    for (let i = 0, j = c.length - 1; i < c.length; j = i++)
      if (c[i].y > p.y !== c[j].y > p.y && p.x < ((c[j].x - c[i].x) * (p.y - c[i].y)) / (c[j].y - c[i].y) + c[i].x) odd = !odd;
  return odd;
}
function pointSeg(p: V2, a: V2, b: V2) {
  const dx = b.x - a.x, dy = b.y - a.y, L = dx * dx + dy * dy;
  const t = L ? Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / L)) : 0;
  return Math.hypot(p.x - a.x - t * dx, p.y - a.y - t * dy);
}

/**
 * ⛔ THE COLLISION CHECK — it can SEE an overlap (the Architect, take 2: a minimum point distance is always positive, even
 * when outlines cross). For EVERY pair in the lockup: pairs whose bounds sit further apart than the margin are clear and
 * skipped; the rest are tested for INTERSECTION first (a segment of one crossing a segment of the other, or a point of one
 * inside the other, even-odd) — a COLLISION; only if they do not intersect is the CLEARANCE taken, point to segment, BOTH
 * WAYS. ⚠ Run when the slider STOPS, not per tick; timed apart from the layout.
 */
export function checkCollisions(letters: LockupLetter[], placements: Map<LockupLetter, Placement>, marginPx: number): CollisionReport {
  const t0 = performance.now();
  const placed = letters.map((l) => {
    const p = placements.get(l)!;
    return {
      l,
      c: l.outline.map((c) => c.map((q) => ({ x: q.x + p.x, y: q.y + p.y }))),
      b: {
        minX: l.bounds.minX + p.x,
        maxX: l.bounds.maxX + p.x,
        minY: l.bounds.minY + p.y,
        maxY: l.bounds.maxY + p.y,
      },
    };
  });
  const pairs: PairClearance[] = [];
  let tested = 0;
  for (let i = 0; i < placed.length; i++)
    for (let j = i + 1; j < placed.length; j++) {
      const A = placed[i], B = placed[j];
      const name = `${A.l.ch}${A.l.line === "top" ? "¹" : ""}–${B.l.ch}${B.l.line === "top" ? "¹" : ""}`;
      const gapX = Math.max(A.b.minX - B.b.maxX, B.b.minX - A.b.maxX), gapY = Math.max(A.b.minY - B.b.maxY, B.b.minY - A.b.maxY);
      if (gapX > marginPx || gapY > marginPx) continue;
      tested++;
      pairs.push(pairTest(A.c, B.c, name));
    }
  // the arch's neighbours, always measured (the pre-filter above skips pairs further apart than the margin)
  const archPlaced = placed.filter((q) => q.l.line === "arch");
  const neighbours = archPlaced.slice(1).map((B, k) => pairTest(archPlaced[k].c, B.c, `${archPlaced[k].l.ch}–${B.l.ch}`));
  pairs.sort((a, b) => (a.collide === b.collide ? a.clearancePx - b.clearancePx : a.collide ? -1 : 1));
  return {
    pairs,
    collisions: pairs.filter((p) => p.collide).length,
    tight: pairs.filter((p) => !p.collide && p.clearancePx < marginPx).length,
    worst: pairs[0] ?? null,
    checkMs: performance.now() - t0,
    marginPx,
    tested,
    neighbours,
  };
}

/**
 * The round arch's spacing test (`pairTest`'s answer to one question, fast enough to run thousands of times a layout):
 * does B, pen at `pb`, keep at least `gap` from A, pen at `pa`? False on a crossing, on one letter inside the other, or on
 * any vertex nearer than `gap` to the other's edges. Only the edges inside the two letters' shared box (each grown by
 * `gap`) can decide it, so only those are tested; nothing is copied (B is read through its offset from A).
 */
function keepsClear(A: LockupLetter, pa: Placement, B: LockupLetter, pb: Placement, gap: number): boolean {
  const dx = pb.x - pa.x, dy = pb.y - pa.y;
  const bx0 = B.bounds.minX + dx, bx1 = B.bounds.maxX + dx, by0 = B.bounds.minY + dy, by1 = B.bounds.maxY + dy;
  const gx = Math.max(A.bounds.minX - bx1, bx0 - A.bounds.maxX, 0), gy = Math.max(A.bounds.minY - by1, by0 - A.bounds.maxY, 0);
  if (Math.hypot(gx, gy) >= gap) return true;
  // the shared box, in A's frame
  const qx0 = Math.max(A.bounds.minX, bx0) - gap, qx1 = Math.min(A.bounds.maxX, bx1) + gap;
  const qy0 = Math.max(A.bounds.minY, by0) - gap, qy1 = Math.min(A.bounds.maxY, by1) + gap;
  const near = (outline: V2[][], ox: number, oy: number) => {
    const segs: [V2, V2][] = [];
    for (const c of outline)
      for (let i = 0; i < c.length; i++) {
        const p = c[i], q = c[(i + 1) % c.length];
        const s0: V2 = { x: p.x + ox, y: p.y + oy }, s1: V2 = { x: q.x + ox, y: q.y + oy };
        if (Math.max(s0.x, s1.x) < qx0 || Math.min(s0.x, s1.x) > qx1 || Math.max(s0.y, s1.y) < qy0 || Math.min(s0.y, s1.y) > qy1) continue;
        segs.push([s0, s1]);
      }
    return segs;
  };
  const sa = near(A.outline, 0, 0), sb = near(B.outline, dx, dy);
  for (const [a1, a2] of sa) for (const [b1, b2] of sb) if (segsCross(a1, a2, b1, b2)) return false;
  for (const [p] of sa) for (const [b1, b2] of sb) if (pointSeg(p, b1, b2) < gap) return false;
  for (const [p] of sb) for (const [a1, a2] of sa) if (pointSeg(p, a1, a2) < gap) return false;
  const b0 = B.outline.find((c) => c.length)?.[0], a0 = A.outline.find((c) => c.length)?.[0];
  if (b0 && inside({ x: b0.x + dx, y: b0.y + dy }, A.outline)) return false;
  if (a0 && inside({ x: a0.x - dx, y: a0.y - dy }, B.outline)) return false;
  return true;
}

/** Intersection first (crossing segments, or a point of one inside the other), then the clearance both ways. */
function pairTest(A: V2[][], B: V2[][], name: string): PairClearance {
  let collide = false;
  outer: for (const ca of A)
    for (let a = 0; a < ca.length; a++) {
      const a1 = ca[a], a2 = ca[(a + 1) % ca.length];
      for (const cb of B)
        for (let k = 0; k < cb.length; k++)
          if (segsCross(a1, a2, cb[k], cb[(k + 1) % cb.length])) {
            collide = true;
            break outer;
          }
    }
  if (!collide) collide = A.some((c) => c.length > 0 && inside(c[0], B)) || B.some((c) => c.length > 0 && inside(c[0], A));
  let clearance = 0;
  if (!collide) {
    clearance = Infinity;
    const both: [V2[][], V2[][]][] = [[A, B], [B, A]];
    for (const [P, Q] of both)
      for (const cp of P)
        for (const p of cp)
          for (const cq of Q) for (let k = 0; k < cq.length; k++) clearance = Math.min(clearance, pointSeg(p, cq[k], cq[(k + 1) % cq.length]));
  }
  return { pair: name, collide, clearancePx: clearance };
}
