/**
 * CD — Carl's edit options, searched for fit. 25 September 2026 (third session). Carl: "Brand is material. taken from
 * an existing site. or template. Any is optional" — read as three toggles: the opener, the source ("what you already
 * have" → "an existing site"), the keep-line ("not a blank page, and not a template" → "not a blank page or template").
 * All 8 combinations × 60–72 mm × {greedy, balanced}; real font, card and setters. Target: 68 mm, two FULL pages,
 * spacing balanced (CA 2.82×, CB 3.45×).
 *   node --no-warnings project-intelligence/live-work/scripts/cd-edits.mjs [show:<combo>]
 * ⚠ NOT WATCHED: how it LOOKS (Carl's eye); the chase's timing.
 */
import { readFileSync } from "node:fs";
import { setBalanced, setJustified } from "../../../components/about/card-text-timeline.ts";
import { ROOM_CARDS } from "../../../components/about/about-room.ts";

const OPEN = ["Your brand is the material.", "Brand is material."];
const SRC = ["what you already have", "an existing site"];
const KEEP = ["not a blank page, and not a template.", "not a blank page or template."];
const body = (o, s, k) => `${OPEN[o]} Typography, colour, assets and tone are taken from ${SRC[s]} and treated as the baseline, ${KEEP[k]} From there the design is elevated into a bespoke prototype that sets the visual direction before any coding begins.`;

const card = ROOM_CARDS.CD;
const font = JSON.parse(readFileSync("public/fonts/geist-regular.typeface.json", "utf8"));
const inset = (2 * 0.022 + 0.03) * card.heightMm, faceH = card.heightMm - 2 * inset, blockW = (card.widthMm - 2 * inset) * 0.94;
const WEAK = /^(a|an|the|of|to|in|on|at|by|for|with|from|into|and|or|but|nor|is|are|was|be|as|that|who|which|it)$/i;
const rows = [];
for (let o = 0; o < 2; o++) for (let s = 0; s < 2; s++) for (let k = 0; k < 2; k++) {
  const name = `o${o}s${s}k${k}`, text = body(o, s, k), words = text.split(" ");
  for (let em = 60; em <= 72; em++) {
    const mm = em / (100000 / 72);
    const wd = (x) => [...x].reduce((a, ch) => a + (font.glyphs[ch]?.ha ?? 0), 0) * mm, sp = font.glyphs[" "].ha * mm;
    const S = Math.floor((0.9 * faceH) / (em * 1.35));
    for (const [route, r] of [["greedy", setJustified(words, wd, sp, blockW)], ["balanced", setBalanced(words, wd, sp, blockW)]]) {
      const L = r.lines.length, pages = Math.ceil(L / S), last = L - (pages - 1) * S;
      const weak = r.lines.slice(0, -1).filter((l) => { const w = l.words.at(-1); return WEAK.test(w) && !/[,.;:!?]$/.test(w); }).length;
      const lone = r.lines.slice(0, -1).filter((l) => l.words.length === 1).length;
      const pageEndsSentence = r.lines.filter((_, i) => (i + 1) % S === 0 && i < L - 1).every((l) => /[.!?]$/.test(l.words.at(-1)));
      /* Per-line gap (× a space) so the reader sees WHERE the widest gap is, not only its size. */
      const gaps = r.lines.map((l, i) => {
        const n = l.words.length - 1;
        if (i === L - 1 || n === 0) return null;
        const ink = l.words.reduce((a, w) => a + wd(w), 0);
        return (blockW - ink) / n / sp;
      });
      rows.push({ name, em, route, L, S, pages, last, gap: lone ? Infinity : r.widestGap, weak, words: words.length, pageEndsSentence, lines: r.lines, gaps, text });
    }
  }
}
const fmt = (r) => `${r.name} ${r.route.padEnd(8)} ${r.em}mm · ${r.L} lines/${r.S} · pages ${r.pages}, last ${r.last}/${r.S} · gap ${r.gap.toFixed(2)}x · weak ${r.weak} · page-end on a full stop ${r.pageEndsSentence ? "YES" : "no"} · ${r.words}w`;
console.log("ALL 8 AT 68 mm:");
rows.filter((r) => r.em === 68).sort((a, b) => (b.pages === 2 && b.last === b.S) - (a.pages === 2 && a.last === a.S) || a.gap - b.gap).forEach((r) => console.log("  " + fmt(r)));
console.log("\nKEY: o = opener (1: Brand is material.) · s = source (1: an existing site) · k = keep-line (1: not a blank page or template)");
const show = process.argv[2];
if (show) {
  const [, name, route = "balanced"] = show.split(":");
  const r = rows.find((x) => x.name === name && x.em === 68 && x.route === route);
  console.log(`\n${fmt(r)}\n${r.text}`);
  r.lines.forEach((l, i) => console.log(`  ${String(i + 1).padStart(2)}${i && i % r.S === 0 ? " ┈" : "  "} ${l.words.join(" ").padEnd(40)} ${r.gaps[i] === null ? "" : r.gaps[i].toFixed(2) + "x"}`));
}
