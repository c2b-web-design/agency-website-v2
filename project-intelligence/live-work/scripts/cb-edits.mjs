/**
 * CB — Carl's edit options, searched for fit. 25 September 2026. Carl: "'Where the' may not be needed. Aproved plans
 * become. In a shared environment with the Architect the. 'Production' may not be needed. Code stays within the brief.
 * plans are constantly verified. Approved plans build the site."
 * Every combination × 60–72 mm × {greedy, balanced}; real font, card and setters. Target: CA's 68 mm, two FULL pages.
 *   node --no-warnings project-intelligence/live-work/scripts/cb-edits.mjs [show:<combo>:<em>]
 */
import { readFileSync } from "node:fs";
import { setBalanced, setJustified } from "../../../components/about/card-text-timeline.ts";
import { ROOM_CARDS } from "../../../components/about/about-room.ts";

const OPEN = ["Where the approved plan becomes the site.", "Approved plans become the site."];
const ENV = ["Stationed in the same environment as the Architect, the Builder", "In a shared environment with the Architect, the Builder"];
const PROD = ["before any production code is written.", "before any code is written."];
const KEEP = ["Code is only good when it stays within the brief.", "Code stays within the brief."];
const CLOSE = [
  "The plan is verified against the work as it goes, so the site that gets built is the site that was approved.",
  "Plans are constantly verified against the work, so the site that gets built is the site that was approved.",
  "Plans are constantly verified against the work. Approved plans build the site.",
];
const body = (o, e, p, k, c) => `${OPEN[o]} ${ENV[e]} drafts the implementation step by step, then passes it back for review and amendment ${PROD[p]} Each piece of work has a declared scope, and the Builder cannot reach outside it. ${KEEP[k]} ${CLOSE[c]}`;

const card = ROOM_CARDS.CB;
const font = JSON.parse(readFileSync("public/fonts/geist-regular.typeface.json", "utf8"));
const inset = (2 * 0.022 + 0.03) * card.heightMm, faceH = card.heightMm - 2 * inset, blockW = (card.widthMm - 2 * inset) * 0.94;
const WEAK = /^(a|an|the|of|to|in|on|at|by|for|with|from|into|and|or|but|nor|is|are|was|be|as|that|who|which|it)$/i;
const rows = [];
for (let o = 0; o < 2; o++) for (let e = 0; e < 2; e++) for (let p = 0; p < 2; p++) for (let k = 0; k < 2; k++) for (let c = 0; c < 3; c++) {
  const name = `o${o}e${e}p${p}k${k}c${c}`, text = body(o, e, p, k, c), words = text.split(" ");
  for (let em = 60; em <= 72; em++) {
    const mm = em / (100000 / 72);
    const wd = (s) => [...s].reduce((a, ch) => a + (font.glyphs[ch]?.ha ?? 0), 0) * mm, sp = font.glyphs[" "].ha * mm;
    const S = Math.floor((0.9 * faceH) / (em * 1.35));
    for (const [route, r] of [["greedy", setJustified(words, wd, sp, blockW)], ["balanced", setBalanced(words, wd, sp, blockW)]]) {
      const L = r.lines.length, pages = Math.ceil(L / S), last = L - (pages - 1) * S;
      const weak = r.lines.slice(0, -1).filter((l) => { const w = l.words.at(-1); return WEAK.test(w) && !/[,.;:!?]$/.test(w); }).length;
      const lone = r.lines.slice(0, -1).filter((l) => l.words.length === 1).length;
      const pageEndsSentence = r.lines.filter((_, i) => (i + 1) % S === 0 && i < L - 1).every((l) => /[.!?]$/.test(l.words.at(-1)));
      rows.push({ name, em, route, L, S, pages, last, gap: lone ? Infinity : r.widestGap, weak, words: words.length, pageEndsSentence, lines: r.lines, text });
    }
  }
}
const fmt = (r) => `${r.name} ${r.route.padEnd(8)} ${r.em}mm · ${r.L} lines/${r.S} · last ${r.last}/${r.S} · gap ${r.gap.toFixed(2)}x · weak ${r.weak} · page-end on a full stop ${r.pageEndsSentence ? "YES" : "no"} · ${r.words}w`;
const at68full = rows.filter((r) => r.em === 68 && r.last === r.S && r.pages === 2).sort((a, b) => a.gap - b.gap || a.weak - b.weak);
console.log(`AT 68 mm, TWO FULL PAGES — ${new Set(at68full.map((r) => r.name)).size} of 48 combinations. Best 12:`);
at68full.slice(0, 12).forEach((r) => console.log("  " + fmt(r)));
console.log("\nKEY: o = opener (1: Approved plans become the site) · e = environment (1: In a shared environment…) · p = production (1: dropped) · k = keep-line (1: Code stays within the brief.) · c = close (0 original · 1 Plans are constantly verified…, so the site… · 2 …against the work. Approved plans build the site.)");
const show = process.argv[2];
if (show) {
  const [, name, em] = show.split(":");
  const r = rows.find((x) => x.name === name && x.em === +em && x.route === "balanced");
  console.log(`\n${fmt(r)}\n${r.text}`);
  r.lines.forEach((l, i) => console.log(`  ${String(i + 1).padStart(2)}${i && i % r.S === 0 ? " ┈" : "  "} ${l.words.join(" ")}`));
}
