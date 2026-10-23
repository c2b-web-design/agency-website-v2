"use client";

/**
 * ⛔ FILM 4's LETTERING — MEASURED AND BUILT, ONE MECHANISM FOR EVERY CONSUMER (D-088, 23 October 2026, session 2; the
 * structural note `live-work/structural-note-showcase-two-viewports-23-october.md` v2, "One mechanism, not two").
 * LIFTED VERBATIM out of `showcase-bench.tsx` — the same timings, the same dependencies, the same checks — so the bench and
 * the page `/proto/your-words` measure the words and build them the same way. ⛔ Two copies of the font proof would drift.
 * ⚠ The bench's regression frames were re-compared pixel-for-pixel after the lift (D-088's entry for it).
 *
 * ⛔ HOW THE WORDS ARE MEASURED. For EACH line, two hidden spans in the site's Geist, on ONE line (`white-space: nowrap`,
 * inside a `position: relative; overflow: clip` wrapper — without it the words wrap at display size and every reading is
 * taken from two lines with no error, and the wide box scrolls the page sideways):
 *   - KERN-ON (`font-kerning: normal`, the line's tracking) — the setting the letters are built at. On the BENCH the kern-on
 *     spans ARE the words' accessible text, in reading order (`accessible`); the canvas has none, and D-051-A11Y's
 *     baked-text defect must not repeat (D-088). On the PAGE the section holds the text itself, so they are `aria-hidden`.
 *     Hidden by `opacity: 0` (not `sr-only`, whose 1 px box would give the wrong right edge; not `visibility: hidden`,
 *     which would take the words from screen readers).
 *   - KERN-OFF (`font-kerning: none`, no tracking, `aria-hidden`) — the FONT PROOF only.
 * All `font-variant-ligatures: none`: a ligature would collapse two characters onto one x the per-character build never
 * draws. In each, the text node is the FIRST child and the zero-size baseline mark comes AFTER it (`measureLabel` reads
 * `el.firstChild`).
 *
 * ⛔ THE FONT IS THE FONT — asserted before anything is built, and its failures returned in plain words (`check.stops`):
 *   1. `document.fonts.load()` for the FIRST family in the span's computed list (next/font adds an Arial-based "Fallback"
 *      family that could load when Geist has not) returns a face with status `loaded` whose family matches, quotes
 *      stripped. ⛔ Not `document.fonts.check`, which is true for a family that does not exist.
 *   2. `fontProof`, per line: the kern-off gaps equal the outline file's advances within 0.1 layout px.
 *   3. At least one kerned pair in each line (kern-on gap minus kern-off gap MINUS THE TRACKING).
 *
 * ⛔ `measureLabel` IS LOADED BY DYNAMIC IMPORT, as the home button does (`whoweare-button.tsx`). ⚠ A COUPLING: a change to
 * `measureLabel` reaches every consumer.
 */
import { useEffect, useMemo, useRef, useState, type CSSProperties, type RefObject } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { FontLoader, type Font } from "three/addons/loaders/FontLoader.js";
import { pageZoom } from "@/lib/site-scale";
import type { Glyphs } from "@/components/home/whoweare-button-scene";
import {
  buildLettering,
  checkCollisions,
  COLLISION_MARGIN_EM,
  fontProof,
  glyphGeometry,
  glyphOutline,
  kernReadings,
  layoutArch,
  outlineBounds,
  SHOWCASE_FONTS,
  setCase,
  setFaceGrain,
  type ArchLayout,
  type CollisionReport,
  type FontProof,
  type LetteringSpec,
  type LetteringStats,
  type LineGeometryKey,
  type LockupLetter,
  type ShowcaseFont,
} from "./lettering-geometry";

export type LineKey = "line" | "top" | "arch";
export type LineDef = { key: LineKey; words: string; sizePx: number; trackingEm: number };
export type LineCheck = { key: LineKey; words: string; proof: FontProof; kerns: { pair: string; kernPx: number }[]; kernedPairs: number };

export type FontCheck = {
  family: string;
  faceLoaded: boolean;
  /** the MAIN line's readings (the line, or the arch) — take 1's fields, kept for its scripts */
  proof: FontProof | null;
  kerns: { pair: string; kernPx: number }[];
  kernedPairs: number;
  lines: LineCheck[];
  /** the reasons nothing was built, in plain words; empty when the checks hold */
  stops: string[];
};
export type Measured = { glyphs: Partial<Record<LineKey, Glyphs>>; check: FontCheck; lines: LineDef[] };
export type Spans = RefObject<Record<string, HTMLSpanElement | null>>;
export type ArchLetters = { key: string; list: LockupLetter[]; geos: Map<LockupLetter, THREE.BufferGeometry>; buildMs: number; triangles: number; missing: string[] };
export type ArchPlaced = ReturnType<typeof layoutArch>;

const stripQuotes = (s: string) => s.trim().replace(/^["']|["']$/g, "");

/**
 * ⛔ THE FRONT FRAMING — a perspective camera face-on, at the distance that puts the piece at `fill` of the canvas's width
 * AND height (the arch is tall). The bench's material front and the page share it: the studio's turns were MEASURED under
 * it (`JUDGING_STUDIO`), and the reflection a perspective face shows depends on the angle the piece subtends.
 */
export const FRONT_FOV = 30;
export const FRONT_FILL = 0.7;
export function frontDistance(widthPx: number, heightPx: number, size: { width: number; height: number }, fill = FRONT_FILL, fov = FRONT_FOV): number {
  const vHalf = ((fov / 2) * Math.PI) / 180;
  const hHalf = Math.atan(Math.tan(vHalf) * (size.width / Math.max(1, size.height)));
  return widthPx > 0 ? Math.max(widthPx / fill / 2 / Math.tan(hHalf), heightPx / fill / 2 / Math.tan(vHalf)) : 1000;
}

/** The lines to set: one (the line), or the lintel and the arch. */
export function useLines(spec: LetteringSpec): LineDef[] {
  const arch = spec.layout.kind === "arch" ? spec.layout : null;
  return useMemo(
    () =>
      arch
        ? [
            { key: "top", words: setCase(arch.top, arch), sizePx: spec.sizePx * arch.topScale, trackingEm: spec.trackingEm },
            { key: "arch", words: setCase(arch.arch, arch), sizePx: spec.sizePx, trackingEm: arch.archTrackingEm },
          ]
        : [{ key: "line", words: spec.words, sizePx: spec.sizePx, trackingEm: spec.trackingEm }],
    [arch, spec.sizePx, spec.trackingEm, spec.words],
  );
}

/** The outline file. */
export function useShowcaseFont(fontKey: ShowcaseFont): Font | null {
  const [font, setFont] = useState<Font | null>(null);
  useEffect(() => {
    let live = true;
    new FontLoader().loadAsync(SHOWCASE_FONTS[fontKey].url).then((f) => live && setFont(f));
    return () => {
      live = false;
    };
  }, [fontKey]);
  return font;
}

/** The measuring spans (see the header) — on one line each, clipped. */
export function MeasureSpans({ lines, fontKey, spans, accessible }: { lines: LineDef[]; fontKey: ShowcaseFont; spans: Spans; accessible: boolean }) {
  const fontCss = SHOWCASE_FONTS[fontKey];
  const span = (d: LineDef, kern: boolean): CSSProperties => ({
    position: "absolute",
    left: 0,
    top: 0,
    whiteSpace: "nowrap",
    opacity: 0,
    pointerEvents: "none",
    fontFamily: fontCss.css,
    fontWeight: fontCss.weight,
    fontSize: d.sizePx,
    lineHeight: 1.2,
    fontKerning: kern ? "normal" : "none",
    fontVariantLigatures: "none",
    letterSpacing: kern ? `${d.trackingEm}em` : 0,
  });
  const mark = { display: "inline-block", width: 0, height: 0 } as const;
  return (
    <div className="relative h-0 overflow-clip">
      {lines.map((d) => (
        <span key={`${d.key}:on`} ref={(e) => { spans.current[`${d.key}:on`] = e; }} style={span(d, true)} aria-hidden={accessible ? undefined : true}>
          {d.words}
          <span ref={(e) => { spans.current[`${d.key}:onBase`] = e; }} style={mark} />
        </span>
      ))}
      {lines.map((d) => (
        <span key={`${d.key}:off`} ref={(e) => { spans.current[`${d.key}:off`] = e; }} style={span(d, false)} aria-hidden>
          {d.words}
          <span ref={(e) => { spans.current[`${d.key}:offBase`] = e; }} style={mark} />
        </span>
      ))}
    </div>
  );
}

/** The measurement: per line, the font proved, then the kern-on setting read — re-taken when a line's words, size or
 *  tracking move. Returns the spans' ref for `MeasureSpans` and the reading (null until taken). */
export function useMeasured(font: Font | null, lines: LineDef[], fontKey: ShowcaseFont, sizePx: number): { spans: Spans; measured: Measured | null } {
  const linesKey = JSON.stringify(lines);
  const spans = useRef<Record<string, HTMLSpanElement | null>>({});
  const [measured, setMeasured] = useState<Measured | null>(null);
  useEffect(() => {
    if (!font) return;
    let live = true;
    const defs: LineDef[] = JSON.parse(linesKey);
    const id = window.setTimeout(async () => {
      const first = spans.current[`${defs[0].key}:on`];
      if (!first || defs.some((d) => !d.words)) return;
      const family = stripQuotes(getComputedStyle(first).fontFamily.split(",")[0] ?? "");
      const weight = SHOWCASE_FONTS[fontKey].weight;
      const faces = await document.fonts.load(`${weight} ${sizePx}px "${family}"`);
      const faceLoaded = faces.some((f) => f.status === "loaded" && stripQuotes(f.family) === family);
      const { measureLabel } = await import("@/components/home/whoweare-button-scene");
      if (!live) return;
      const z = pageZoom();
      const glyphs: Partial<Record<LineKey, Glyphs>> = {};
      const checks: LineCheck[] = [];
      const stops: string[] = [];
      if (!faceLoaded) stops.push(`The browser has not loaded the font "${family}". Nothing is built on a stand-in font.`);
      for (const d of defs) {
        const on = spans.current[`${d.key}:on`], off = spans.current[`${d.key}:off`];
        if (!on || !off) return;
        const onG = measureLabel(on, spans.current[`${d.key}:onBase`] ?? null).glyphs;
        const offG = measureLabel(off, spans.current[`${d.key}:offBase`] ?? null).glyphs;
        // the whole text's right edge, from a Range over the text node (measureLabel's `w` is rounded to 0.1)
        const box = off.getBoundingClientRect();
        const node = off.firstChild;
        let rightEdge = NaN;
        if (node && node.nodeType === Node.TEXT_NODE) {
          const range = document.createRange();
          range.setStart(node, 0);
          range.setEnd(node, (node.textContent ?? "").length);
          rightEdge = (range.getBoundingClientRect().right - (box.left + box.width / 2)) / z;
        }
        const proof = fontProof(font, offG, rightEdge, d.sizePx);
        const kerns = kernReadings(onG, offG, d.trackingEm * d.sizePx);
        const kernedPairs = kerns.filter((k) => Math.abs(k.kernPx) > 0.01).length;
        const name = defs.length > 1 ? `"${d.words}"` : "these words";
        if (!proof.ok)
          stops.push(
            `In ${name}, the browser's font and the outline file disagree: worst ${proof.worstPx.toFixed(3)} px at "${proof.worstChar}", right edge ` +
              `${proof.rightEdgeResidualPx.toFixed(3)} px (tolerance ${proof.tolerancePx} px${proof.uniform ? "; the miss is uniform, so read it as a calibration" : ""}).`,
          );
        if (kernedPairs === 0 && kerns.length > 0) stops.push(`No pair in ${name} is kerned. The spacing has not been proved, so nothing is built.`);
        glyphs[d.key] = onG;
        checks.push({ key: d.key, words: d.words, proof, kerns, kernedPairs });
      }
      const main = checks[checks.length - 1];
      setMeasured({
        glyphs,
        lines: defs,
        check: { family, faceLoaded, proof: main.proof, kerns: main.kerns, kernedPairs: main.kernedPairs, lines: checks, stops },
      });
    }, 60);
    return () => {
      live = false;
      window.clearTimeout(id);
    };
  }, [font, linesKey, fontKey, sizePx]);
  return { spans, measured };
}

/**
 * THE LINE — one merged mesh; built in an effect, timed there, never in render.
 * ⛔ KEYED ON ITS GEOMETRY FIELDS ONLY (the Architect, pass 2): a material or studio change cannot re-extrude.
 * `LineGeometryKey` is the type `buildLettering` takes, so the key and what the build reads cannot drift apart; the words,
 * font and tracking reach it through `measured`. `skip` (the arch is shown) builds nothing.
 */
export function useLineBuild(skip: boolean, font: Font | null, measured: Measured | null, spec: LetteringSpec) {
  const lineKey = JSON.stringify({ sizePx: spec.sizePx, depthEm: spec.depthEm, bevel: spec.bevel, curveSegments: spec.curveSegments, creaseDeg: spec.creaseDeg } satisfies LineGeometryKey);
  const [made, setMade] = useState<{ geometry: THREE.BufferGeometry | null; stats: LetteringStats } | null>(null);
  useEffect(() => {
    if (skip || !font || !measured || measured.check.stops.length || !measured.glyphs.line) return;
    const line = measured.glyphs.line;
    const key: LineGeometryKey = JSON.parse(lineKey);
    const id = window.setTimeout(() => {
      const t0 = performance.now();
      const r = buildLettering(key, font, line);
      performance.measure("showcase:build", { start: t0, end: performance.now() });
      setMade(r);
    }, 30);
    return () => window.clearTimeout(id);
  }, [skip, font, measured, lineKey]);
  useEffect(() => () => made?.geometry?.dispose(), [made]);
  return made;
}

/** The arch's shape key: what the per-letter build reads (sweep, gap and tracking only MOVE the letters). */
export function archShapeKey(arch: ArchLayout | null, spec: LetteringSpec): string {
  return arch
    ? JSON.stringify({ top: setCase(arch.top, arch), arch: setCase(arch.arch, arch), sizePx: spec.sizePx, topScale: arch.topScale, depthEm: spec.depthEm, bevel: spec.bevel, curveSegments: spec.curveSegments, creaseDeg: spec.creaseDeg })
    : "";
}

/** THE ARCH's LETTERS, each BUILT ONCE per shape (words, sizes, depth, edge, smoothness). ⚠ The build reads ONLY what is
 *  in `shapeKey`, so a sweep, gap or tracking change cannot re-extrude. */
export function useArchLetters(shapeKey: string, font: Font | null): ArchLetters | null {
  const [letters, setLetters] = useState<ArchLetters | null>(null);
  useEffect(() => {
    if (!shapeKey || !font) return;
    const k: { top: string; arch: string; sizePx: number; topScale: number } & Pick<LetteringSpec, "depthEm" | "bevel" | "curveSegments" | "creaseDeg"> = JSON.parse(shapeKey);
    const id = window.setTimeout(() => {
      const t0 = performance.now();
      const list: LockupLetter[] = [];
      const geos = new Map<LockupLetter, THREE.BufferGeometry>();
      const missing: string[] = [];
      let triangles = 0;
      const parts: [LockupLetter["line"], string, number][] = [["top", k.top, k.sizePx * k.topScale], ["arch", k.arch, k.sizePx]];
      for (const [line, words, px] of parts)
        words.split("").forEach((ch, index) => {
          if (ch.trim() === "") return;
          if (!font.data.glyphs[ch]) {
            if (!missing.includes(ch)) missing.push(ch);
            return;
          }
          const outline = glyphOutline(font, ch, px, k.curveSegments);
          const l: LockupLetter = { line, index, ch, outline, bounds: outlineBounds(outline), sizePx: px };
          const g = glyphGeometry(font, ch, px, k);
          triangles += g.attributes.position.count / 3;
          list.push(l);
          geos.set(l, g);
        });
      const buildMs = performance.now() - t0;
      performance.measure("showcase:arch-build", { start: t0, end: performance.now() });
      setLetters({ key: shapeKey, list, geos, buildMs, triangles, missing });
    }, 30);
    return () => window.clearTimeout(id);
  }, [font, shapeKey]);
  useEffect(() => () => letters?.geos.forEach((g) => g.dispose()), [letters]);
  return letters;
}

/** The arch's placement — positions only, cheap, every tick. */
export function useArchPlacement(arch: ArchLayout | null, font: Font | null, letters: ArchLetters | null, shapeKey: string, measured: Measured | null, sizePx: number): ArchPlaced | null {
  const archGlyphs = measured?.glyphs.arch;
  const topGlyphs = measured?.glyphs.top;
  return useMemo(() => {
    if (!arch || !font || !letters || letters.key !== shapeKey || !archGlyphs || !topGlyphs) return null;
    return layoutArch(arch, font, sizePx, letters.list, archGlyphs.x, topGlyphs);
  }, [arch, font, letters, shapeKey, archGlyphs, topGlyphs, sizePx]);
}

/** The collision check — once the placement STOPS moving (250 ms). Null until it has run for THIS placement. */
export function useArchCollisions(placed: ArchPlaced | null, letters: ArchLetters | null, sizePx: number): CollisionReport | null {
  const [collisions, setCollisions] = useState<{ for: ArchPlaced | null; report: CollisionReport } | null>(null);
  useEffect(() => {
    if (!placed || !letters) return;
    const id = window.setTimeout(() => {
      const report = checkCollisions(letters.list, placed.placements, COLLISION_MARGIN_EM * sizePx);
      performance.measure("showcase:collisions", { start: performance.now() - report.checkMs, end: performance.now() });
      setCollisions({ for: placed, report });
    }, 250);
    return () => window.clearTimeout(id);
  }, [placed, letters, sizePx]);
  return collisions && collisions.for === placed ? collisions.report : null;
}

/**
 * ⛔ THE ARCH's GRAIN, LAID AS BRICKS (`layoutArch`'s `grain`): each letter's face UVs from its PLACED position, turned to its
 * brick angle. Written whenever the placement moves — the letters are built once and only moved, so the UVs follow here,
 * not in the build. A few thousand vertices; then one frame (`frameloop="demand"`). Harmless in the clay modes (no map).
 * Inside a `<Canvas>`.
 */
export function ArchGrain({ shown }: { shown: { placed: ArchPlaced; letters: { list: LockupLetter[]; geos: Map<LockupLetter, THREE.BufferGeometry> } } }) {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    for (const l of shown.letters.list) {
      const g = shown.letters.geos.get(l), p = shown.placed.placements.get(l);
      if (g && p) setFaceGrain(g, p.x, p.y, shown.placed.grain.get(l) ?? 0);
    }
    invalidate();
  }, [shown, invalidate]);
  return null;
}
