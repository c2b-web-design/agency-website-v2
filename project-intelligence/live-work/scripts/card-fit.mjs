/**
 * FIT ONE CARD'S COPY — sizes × {greedy, balanced}, real font, real card, real setters. 25 September 2026.
 * The technique used on CA, generalised: lines, slots, pages, last-page fill, widest justified gap, weak
 * line-endings, lone-word lines. Copy as written in `about-card-copy.ts` (no edits).
 *   node --no-warnings project-intelligence/live-work/scripts/card-fit.mjs CB [emMin] [emMax] [show:em:route]
 * ⚠ NOT WATCHED: how it LOOKS (Carl's eye); the chase's timing.
 */
import { readFileSync } from "node:fs";
import { setBalanced, setJustified } from "../../../components/about/card-text-timeline.ts";
import { ABOUT_CARD_COPY } from "../../../components/about/about-card-copy.ts";
import { ROOM_CARDS } from "../../../components/about/about-room.ts";

const [id = "CB", lo = "52", hi = "74", show] = process.argv.slice(2);
const card = ROOM_CARDS[id], copy = ABOUT_CARD_COPY.find((c) => c.id === id);
const font = JSON.parse(readFileSync("public/fonts/geist-regular.typeface.json", "utf8"));
const inset = (2 * 0.022 + 0.03) * card.heightMm;
const faceW = card.widthMm - 2 * inset, faceH = card.heightMm - 2 * inset, blockW = faceW * 0.94;
const words = copy.body.split(/\s+/);
const WEAK = /^(a|an|the|of|to|in|on|at|by|for|with|from|into|and|or|but|nor|is|are|was|be|as|that|who|which|it)$/i;
console.log(`${id} · ${copy.role} · ${words.length} words · card ${card.widthMm.toFixed(0)} × ${card.heightMm.toFixed(0)} mm · line ${blockW.toFixed(0)} mm`);
console.log(" em  route     | lines | slots | pages | last page | widest gap | weak ends | lone");
const rows = [];
for (let em = +lo; em <= +hi; em++) {
  const mm = em / (100000 / 72);
  const wd = (s) => [...s].reduce((a, c) => a + (font.glyphs[c]?.ha ?? 0), 0) * mm;
  const sp = font.glyphs[" "].ha * mm;
  const S = Math.floor((0.9 * faceH) / (em * 1.35));
  for (const [route, r] of [["greedy", setJustified(words, wd, sp, blockW)], ["balanced", setBalanced(words, wd, sp, blockW)]]) {
    const L = r.lines.length, pages = Math.ceil(L / S), last = L - (pages - 1) * S;
    const weak = r.lines.slice(0, -1).filter((l) => { const w = l.words.at(-1); return WEAK.test(w) && !/[,.;:!?]$/.test(w); }).length;
    const lone = r.lines.slice(0, -1).filter((l) => l.words.length === 1).length;
    rows.push({ em, route, L, S, pages, last, gap: r.widestGap, weak, lone, lines: r.lines });
    console.log(`${String(em).padStart(3)}  ${route.padEnd(9)} | ${String(L).padStart(5)} | ${String(S).padStart(5)} | ${String(pages).padStart(5)} | ${String(last).padStart(2)} of ${String(S).padEnd(4)} | ${r.widestGap.toFixed(2).padStart(9)}x | ${String(weak).padStart(9)} | ${lone}`);
  }
}
if (show) {
  const [, em, route] = show.split(":");
  const r = rows.find((x) => x.em === +em && x.route === route);
  r.lines.forEach((l, i) => console.log(`  ${String(i + 1).padStart(2)}${i && i % r.S === 0 ? " ┈" : "  "} ${l.words.join(" ")}`));
}
