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
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import type { Glyphs } from "@/components/home/whoweare-button-scene";

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
  /** how the words are set: one straight line (take 1, R-088), or the restaurant lockup's ARCH (take 2) */
  layout: LetteringLayout;
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
  layout: { kind: "arch", top: "Your", arch: "company", caps: true, steps: "equal", nudgeEm: { P: 0.11 }, sweepDeg: 180, archTrackingEm: 0.21, topScale: 1, gapEm: 0.25 },
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
export function glyphGeometry(font: Font, ch: string, sizePx: number, spec: Pick<LetteringSpec, "depthEm" | "bevel" | "curveSegments">): THREE.BufferGeometry {
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
  return g;
}

/**
 * Build the words. `glyphs` is `measureLabel`'s reading of the kern-on span (x per character, the baseline, relative to the
 * span's centre). Spaces take their place in the setting and build nothing.
 */
export function buildLettering(spec: LetteringSpec, font: Font, glyphs: Glyphs): { geometry: THREE.BufferGeometry | null; stats: LetteringStats } {
  const t0 = performance.now();
  const missing: string[] = [];
  const parts: THREE.BufferGeometry[] = [];
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
    parts.push(g.index ? g.toNonIndexed() : g);
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

  const geometry = parts.length ? mergeGeometries(parts) : null;
  parts.forEach((g) => g.dispose());
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
  /** the first and last arch letters' centre angles, degrees (expected 180 and 0 for a 180° sweep) */
  feetDeg: [number, number];
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
  const S = (Math.min(SWEEP_MAX, Math.max(SWEEP_MIN, layout.sweepDeg)) * Math.PI) / 180;
  const span = arch.length > 1 ? centres[centres.length - 1] - centres[0] : 0;
  const R = span > 0 ? span / S : 0;
  const angles: number[] = [];
  const n = arch.length;
  arch.forEach((l, k) => {
    // equal steps: the k-th letter at k/(n−1) of the sweep (mirrored levels, the middle letter at the crown); font: arc length
    const theta = Math.PI / 2 + S / 2 - (layout.steps === "equal" ? (n > 1 ? (k * S) / (n - 1) : S / 2) : (centres[k] - centres[0]) / (R || 1));
    angles.push(theta);
    const adv = advancePx(font, l.ch, sizePx) ?? 0;
    placements.set(l, {
      x: R * Math.cos(theta) - adv / 2 + (layout.nudgeEm[l.ch] ?? 0) * sizePx,
      y: R * Math.sin(theta) - half,
    });
  });
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
      widthPx: all.maxX - all.minX,
      heightPx: all.maxY - all.minY,
      layoutMs: performance.now() - t0,
    },
  };
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
