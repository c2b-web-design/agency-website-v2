/**
 * CD — does REORDERING the list (no new words) fix line 1? 25 September 2026 (third session). A Builder's probe, not
 * Carl's option: tested before being put to him. Opener = Carl's "Brand is material."; his other two edits both ways.
 * 68 mm, balanced. Prints only combinations that fill two full pages.
 *   node --no-warnings project-intelligence/live-work/scripts/cd-order-probe.mjs ["<opener>"]
 *   The opener is an argument since Carl asked (same session): "Does putting the word 'A' before brand help?"
 * ⚠ NOT WATCHED: how it LOOKS; whether the new order reads right (Carl's call).
 */
import { readFileSync } from "node:fs";
import { setBalanced } from "../../../components/about/card-text-timeline.ts";
import { ROOM_CARDS } from "../../../components/about/about-room.ts";

const OPENER = process.argv[2] ?? "Brand is material.";
const LISTS = ["Typography, colour, assets and tone", "Colour, tone, assets and typography", "Colour, typography, assets and tone", "Tone, colour, assets and typography", "Colour, assets, tone and typography"];
const SRCS = ["what you already have", "an existing site"];
const KEEPS = ["not a blank page, and not a template.", "not a blank page or template."];
const card = ROOM_CARDS.CD, font = JSON.parse(readFileSync("public/fonts/geist-regular.typeface.json", "utf8"));
const inset = (2 * 0.022 + 0.03) * card.heightMm, faceH = card.heightMm - 2 * inset, blockW = (card.widthMm - 2 * inset) * 0.94;
const em = 68, mm = em / (100000 / 72), S = Math.floor((0.9 * faceH) / (em * 1.35));
const wd = (x) => [...x].reduce((a, ch) => a + (font.glyphs[ch]?.ha ?? 0), 0) * mm, sp = font.glyphs[" "].ha * mm;
for (const list of LISTS) for (const src of SRCS) for (const keep of KEEPS) {
  const text = `${OPENER} ${list} are taken from ${src} and treated as the baseline, ${keep} From there the design is elevated into a bespoke prototype that sets the visual direction before any coding begins.`;
  const r = setBalanced(text.split(" "), wd, sp, blockW), L = r.lines.length;
  if (L !== 2 * S) continue;
  const gaps = r.lines.map((l, i) => (i === L - 1 || l.words.length < 2 ? null : (blockW - l.words.reduce((a, w) => a + wd(w), 0)) / (l.words.length - 1) / sp));
  console.log(`\n${list} | ${src} | ${keep}  →  ${L} lines/${S}, widest ${r.widestGap.toFixed(2)}x`);
  r.lines.forEach((l, i) => console.log(`  ${String(i + 1).padStart(2)}${i && i % S === 0 ? " ┈" : "  "} ${l.words.join(" ").padEnd(40)} ${gaps[i] === null ? "" : gaps[i].toFixed(2) + "x"}`));
}
