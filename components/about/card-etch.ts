/* ⛔⛔ THE ETCHED TEXT — D-094, amended 24 September 2026. THE WALL PAIR (CA, CB), BEHIND `?etch=1`.

   Carl, 24 September: *"Etched glass sounds like a great concept."* The body copy
   is a frosted region IN the glass; when the rim strikes, the etching glows with
   the tube's light — engraved, edge-lit glass, which is what these cards already
   are (a glass face with a light tube round its rim). §14a: caused by the world.

   ⚠ THIS FILE IS LAYOUT, PAINT, THE FIT CHECK AND THE FONT GATE — no React, no
   materials. The two meshes that show it live in `about-card-mesh.tsx`; the glow
   is driven by `neon-bloom.tsx`, the one writer. Plan and Architect review:
   `live-work/card-text-etch-plan-24-september.md`.

   ⛔⛔ PROVISIONAL SETTING. Greedy line breaks, and the last line set LEFT —
   which Carl has ruled out as a setting (D-094). **This build proves the MATERIAL;
   the fit chunk sets the text** (chosen breaks, gap cap, last line). Do not judge
   the setting from it.

   ⛔ THE BUILDER NEVER TRIMS COPY (D-094). The fit check below fails LOUDLY and
   still draws every word — the remedy is Carl's: setting, then card size, then
   the words. */

import * as THREE from "three";
import { neonHex, neonNumber, neonParam } from "./about-neon";

// ── Candidates — Carl tunes by eye. Every one has a ranged fader. ────────────

/** Type size, in FACE millimetres, PER CARD. `?etchem=` 10–60 overrides both.
 *  ⛔ 24 September, second take: Carl moved the text to the WHOLE FACE (*"30% is a
 *  bit better"*), so each card runs at the largest size that fits it — measured
 *  in Geist, justified: CA 44.2mm (64 words), CB 40.1mm (84 words).
 *  ⚠ The first take was 34 on CA, with ~10% headroom inside a 0.90 x 0.85 block. */
export const ETCH_EM_MM: Record<"ca" | "cb", number> = { ca: 44, cb: 40 };
/** How strongly the etch reads UNLIT — the frost only. `?etchop=` 0–1.
 *  ⛔ 0 is legal and meaningful: the neon then REVEALS the copy (F1). */
export const ETCH_OPACITY = 0.35;
/** The glow's share of the rim's `peak × level`. `?etchglow=` 0–4.
 *  ⛔ 0.05 → 0.1 with `ETCH_GLOW_HEX`, 24 September: together they put the glyph
 *  cores at the RIM'S OWN ON-SCREEN COLOUR. See `ETCH_GLOW_HEX`. */
export const ETCH_GLOW_DEPTH = 0.1;
/**
 * ⛔⛔ THE GLOW COLOUR — MATCHED TO THE RIM AS SEEN, NOT TO THE TUBE'S HEX. Carl,
 * 24 September: *"If its supposed to match the rim it is not doing that."*
 *
 * ⚠ The rim on screen is the tube TONE-MAPPED at intensity 6 PLUS its bloom, which
 * is never tone-mapped. The text has no bloom, so the tube's hex (`#1b2f8a`)
 * came out dim violet at 223° and was still violet at the rim's lightness (222°).
 * Measured on CA at 1440, the brightest 10% of glyph pixels:
 *     rim, as seen              #7eb7f3   211°  sat 83%  light 72%
 *     5c9cff at glow 0.1        #80baf2   209°  sat 81%  light 72%   <- this
 * Carl: *"Thats a lot better, more readable now."* ⚠ Better, not approved.
 * `?etchhex=` overrides it. ⚠ Measured against CA's rim; CB's is measured apart.
 */
export const ETCH_GLOW_HEX = "#5c9cff";
/** How frosted. `?etchrough=` 0–1. */
export const ETCH_ROUGHNESS = 0.9;
/** Geist weight. `?etchweight=` 100–900 — thin strokes may vanish when etched. */
export const ETCH_WEIGHT = 400;

/* Fixed for this take. */
export const ETCH_LINE_HEIGHT = 1.35; // the overlay's
/** The text block as a fraction of the face — the measurement's assumption.
 *  `?etchbw=` / `?etchbh=` 0.5–1. ⚠ Carl, 24 September, on seeing CA at room
 *  distance: *"The text is not readable from this distance, it is too small. Can it
 *  be made to fit the entire card?"* MEASURED the same day, CA justified in Geist:
 *      block 0.90 x 0.85   largest em 37.6mm
 *      block 0.96 x 0.92   largest em 40.6mm
 *      block 1.00 x 1.00   largest em 44.2mm   (+30% on this take's 34)
 *  ⚠ 1.0 runs the words to the bevel, where the dome is steepest and the rim's
 *  glare sits. The face is the limit: the rim IS the neon and the bevel is not a
 *  writing surface. */
export const ETCH_BLOCK_W = 1;
export const ETCH_BLOCK_H = 1;
/**
 * ⚠ DERIVED, NOT CHOSEN: CA's densest point measured 0.47 px/mm at 1920
 * (24 September), × the canvas's DPR cap of 2 = 0.94 — one texel per device pixel
 * where the face is largest on screen. CA's texture is therefore ~1221 x 478.
 * ⚠ CA's figure only. CD and CS measured ~2.5x denser; rollout re-derives it.
 */
export const ETCH_TEXELS_PER_MM = 1.0;

export type EtchSettings = {
  emMm: number;
  blockW: number;
  blockH: number;
  opacity: number;
  glowDepth: number;
  roughness: number;
  weight: number;
  /** ⛔ Architect S4 set the target as the tube's on-screen hue (~211°). Carl
      sharpened it: MATCH THE RIM AS SEEN — see `ETCH_GLOW_HEX`. */
  glowHex: string;
};

/** `?etch=1` — the text is mounted ONLY with this, until Carl approves it. */
export function etchEnabled(): boolean {
  return neonParam("etch") === "1";
}

/** Read once per mount by the canvas (reload to apply), like the neon faders. */
export function etchSettings(card: "ca" | "cb"): EtchSettings {
  return {
    emMm: neonNumber("etchem", ETCH_EM_MM[card], 10, 60),
    blockW: neonNumber("etchbw", ETCH_BLOCK_W, 0.5, 1),
    blockH: neonNumber("etchbh", ETCH_BLOCK_H, 0.5, 1),
    opacity: neonNumber("etchop", ETCH_OPACITY, 0, 1),
    glowDepth: neonNumber("etchglow", ETCH_GLOW_DEPTH, 0, 4),
    roughness: neonNumber("etchrough", ETCH_ROUGHNESS, 0, 1),
    weight: Math.round(neonNumber("etchweight", ETCH_WEIGHT, 100, 900)),
    glowHex: neonHex(ETCH_GLOW_HEX, "etchhex"),
  };
}

// ── The font gate — Architect F2 ─────────────────────────────────────────────

/**
 * ⛔⛔ PROVES THE CANVAS WILL DRAW IN GEIST, OR THROWS. The copy's setting was
 * fitted in Geist; a fallback font would silently change every line.
 *
 * ⚠ `document.fonts.check()` IS DELIBERATELY NOT USED: it returns TRUE when no
 * face in the set matches the family at all — it proves nothing (Architect F2).
 *
 *   1. The family comes from `--font-geist-sans` on <html>, where `next/font`
 *      puts it — `next/font` owns the name, not this file.
 *   2. `fonts.load(font, body)` — passing the BODY loads every unicode-range face
 *      the copy needs (the default text is a single space). Every returned face
 *      must be `loaded`, and there must be at least one.
 *   3. `ctx.font` is READ BACK: canvas silently ignores an invalid string.
 *   4. The width proof: the body measured in the family must differ from the same
 *      text in `sans-serif`, which proves the canvas actually used it.
 */
export async function resolveEtchFamily(weight: number, body: string): Promise<string> {
  const raw = getComputedStyle(document.documentElement).getPropertyValue("--font-geist-sans");
  const family = raw.split(",")[0]?.trim().replace(/^["']|["']$/g, "") ?? "";
  if (!family) throw new Error("--font-geist-sans is empty on <html>");

  const faces = await document.fonts.load(`${weight} 100px "${family}"`, body);
  if (faces.length === 0) throw new Error(`fonts.load matched NO face for "${family}"`);
  const notLoaded = faces.filter((f) => f.status !== "loaded");
  if (notLoaded.length) throw new Error(`${notLoaded.length}/${faces.length} "${family}" faces not loaded`);

  const ctx = document.createElement("canvas").getContext("2d");
  if (!ctx) throw new Error("no 2d context");
  ctx.font = `${weight} 100px "${family}"`;
  if (!ctx.font.toLowerCase().includes(family.toLowerCase())) {
    throw new Error(`ctx.font read back as "${ctx.font}" — the font string was rejected`);
  }
  const w = ctx.measureText(body).width;
  ctx.font = `${weight} 100px sans-serif`;
  const wSans = ctx.measureText(body).width;
  if (Math.abs(w - wSans) < 0.5) {
    throw new Error(`"${family}" measures the same as sans-serif (${w.toFixed(1)}) — not in use`);
  }
  return family;
}

// ── Layout — justified, every word placed by us ─────────────────────────────

export type EtchLine = { words: string[]; xs: number[]; justified: boolean };

export type EtchReport = {
  texW: number;
  texH: number;
  fontPx: number;
  lines: EtchLine[];
  blockW: number;
  blockH: number;
  usedH: number;
  /** The widest justified gap as a multiple of a normal space. */
  widestGap: number;
  overflow: boolean;
  /** Lines that begin with a dash — a greedy-break artefact for the fit chunk. */
  dashStarts: number[];
};

/**
 * Greedy breaks, then justify every line but the last by sharing its slack
 * across its gaps. ⚠ PROVISIONAL — see the header. The browser's own engine does
 * the measuring (`measureText`), so widths are the ones the copy was fitted in.
 * ⛔ Never drops a word: an over-long word gets a line of its own and is flagged.
 */
export function layoutJustified(
  ctx: CanvasRenderingContext2D,
  body: string,
  blockW: number,
): { lines: EtchLine[]; widestGap: number; overlong: boolean } {
  const words = body.split(/\s+/).filter(Boolean);
  const space = ctx.measureText(" ").width;
  const widths = words.map((w) => ctx.measureText(w).width);

  const rows: number[][] = [];
  let row: number[] = [];
  let rowW = 0;
  let overlong = false;
  words.forEach((_, i) => {
    const add = row.length === 0 ? widths[i] : rowW + space + widths[i];
    if (row.length > 0 && add > blockW) {
      rows.push(row);
      row = [i];
      rowW = widths[i];
    } else {
      row.push(i);
      rowW = add;
    }
    if (widths[i] > blockW) overlong = true;
  });
  if (row.length) rows.push(row);

  let widestGap = 0;
  const lines = rows.map((r, li) => {
    const last = li === rows.length - 1;
    const sum = r.reduce((s, i) => s + widths[i], 0);
    const gaps = r.length - 1;
    const justified = !last && gaps > 0;
    const gap = justified ? (blockW - sum) / gaps : space;
    if (justified) widestGap = Math.max(widestGap, gap / space);
    const xs: number[] = [];
    let x = 0;
    for (const i of r) {
      xs.push(x);
      x += widths[i] + gap;
    }
    return { words: r.map((i) => words[i]), xs, justified };
  });
  return { lines, widestGap, overlong };
}

/**
 * Lay out and paint one card's copy into a coverage mask sized to the face.
 *
 * ⚠ WHITE ON OPAQUE BLACK, SO R = G = B = COVERAGE. `alphaMap` reads `.g`.
 * ⛔ Not white on transparent: canvas stores unpremultiplied colour, so an
 * anti-aliased edge would read FULL coverage in `.g` and the edges would stair.
 *
 * ⚠ `NoColorSpace`: this is a coverage mask, not a colour — it must not be
 * sRGB-decoded. `anisotropy` 8 — the answer card's precedent, for the receding
 * edge. Mipmaps default ON; ⚠ they soften the far edge — a watch item for CB,
 * whose face recedes more (Architect N5).
 */
export function buildEtchTexture(
  id: string,
  body: string,
  faceWidthMm: number,
  faceHeightMm: number,
  emMm: number,
  weight: number,
  blockFracW: number,
  blockFracH: number,
  family: string,
): { texture: THREE.CanvasTexture; report: EtchReport } {
  const t0 = performance.now();
  const texW = Math.round(faceWidthMm * ETCH_TEXELS_PER_MM);
  const texH = Math.round(faceHeightMm * ETCH_TEXELS_PER_MM);
  const canvas = document.createElement("canvas");
  canvas.width = texW;
  canvas.height = texH;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no 2d context");

  const fontPx = emMm * ETCH_TEXELS_PER_MM;
  ctx.font = `${weight} ${fontPx}px "${family}"`;
  const blockW = texW * blockFracW;
  const blockH = texH * blockFracH;
  const { lines, widestGap, overlong } = layoutJustified(ctx, body, blockW);
  const lh = fontPx * ETCH_LINE_HEIGHT;
  const usedH = lines.length * lh;

  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, texW, texH);
  ctx.fillStyle = "#fff";
  ctx.textBaseline = "middle";
  const left = (texW - blockW) / 2;
  const top = (texH - usedH) / 2;
  lines.forEach((ln, li) => {
    const y = top + (li + 0.5) * lh;
    ln.words.forEach((w, wi) => ctx.fillText(w, left + ln.xs[wi], y));
  });

  const report: EtchReport = {
    texW,
    texH,
    fontPx,
    lines,
    blockW,
    blockH,
    usedH,
    widestGap,
    overflow: overlong || usedH > blockH,
    dashStarts: lines.flatMap((ln, i) => (/^[—–-]/.test(ln.words[0] ?? "") ? [i] : [])),
  };

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.NoColorSpace;
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  performance.measure(`etch:paint:${id}`, { start: t0, end: performance.now() });

  /* ⛔ THE FIT CHECK — LOUD, and every word is still drawn. */
  const summary =
    `${id} etch: ${lines.length} lines at ${emMm}mm, block ${usedH.toFixed(0)}/${blockH.toFixed(0)} tall, ` +
    `widest gap ${widestGap.toFixed(2)}x a space, dash-led lines [${report.dashStarts.join(",")}] ` +
    `(greedy breaks, last line LEFT — provisional, not the setting)`;
  if (report.overflow) {
    console.error(`⛔ ${id.toUpperCase()} TEXT DOES NOT FIT — ${summary}. Nothing was trimmed; the remedy is Carl's (D-094).`);
  } else {
    console.info(summary);
  }
  return { texture, report };
}
