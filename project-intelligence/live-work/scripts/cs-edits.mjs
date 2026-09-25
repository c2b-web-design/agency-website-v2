/**
 * CS — Carl's edit options, searched for fit. 25 September 2026 (third session). Carl chose TWO pages ("2 would be
 * better"), then: "'other' is optional. 'exists' is optional, if it goes use 'serves' 'actually' is optional. and is
 * too. 'and nothing it touches is the site itself.' all that can go"
 * Read as five toggles: "other" · "it exists to serve" → "it serves" · "actually" · the "and" before "answering"
 * (the other "and" goes with the close) · the close ", and nothing it touches is the site itself." → ".".
 * All 32 combinations at 68 mm × {greedy, balanced}; real font, card and setters. Target: 6 lines (two full pages of 3).
 *   node --no-warnings project-intelligence/live-work/scripts/cs-edits.mjs [show:<combo>[:route]]
 * ⚠ NOT WATCHED: how it LOOKS (Carl's eye); the chase's timing; whether each combination reads (Carl's call).
 */
import { readFileSync } from "node:fs";
import { setBalanced, setJustified } from "../../../components/about/card-text-timeline.ts";
import { ROOM_CARDS } from "../../../components/about/about-room.ts";

const OTHER = ["Every other seat", "Every seat"];
const SERVE = ["it exists to serve", "it serves"];
const ACTUALLY = ["actually runs on", "runs on"];
const AND = ["and answering", "answering"];
const CLOSE = ["Nothing it recommends becomes work without a decision, and nothing it touches is the site itself.", "Nothing it recommends becomes work without a decision."];
const body = (o, s, a, n, c) => `${OTHER[o]} is pointed at the website. This one is pointed at the business ${SERVE[s]}, connected to the things the business ${ACTUALLY[a]}, ${AND[n]} from those rather than from general knowledge. It advises only. ${CLOSE[c]}`;

const card = ROOM_CARDS.CS;
const font = JSON.parse(readFileSync("public/fonts/geist-regular.typeface.json", "utf8"));
const inset = (2 * 0.022 + 0.03) * card.heightMm, faceH = card.heightMm - 2 * inset, blockW = (card.widthMm - 2 * inset) * 0.94;
const WEAK = /^(a|an|the|of|to|in|on|at|by|for|with|from|into|and|or|but|nor|is|are|was|be|as|that|who|which|it)$/i;
const em = 68, mm = em / (100000 / 72), S = Math.floor((0.9 * faceH) / (em * 1.35));
const wd = (x) => [...x].reduce((a, ch) => a + (font.glyphs[ch]?.ha ?? 0), 0) * mm, sp = font.glyphs[" "].ha * mm;
const rows = [];
for (let o = 0; o < 2; o++) for (let s = 0; s < 2; s++) for (let a = 0; a < 2; a++) for (let n = 0; n < 2; n++) for (let c = 0; c < 2; c++) {
  const name = `o${o}s${s}a${a}n${n}c${c}`, text = body(o, s, a, n, c), words = text.split(" ");
  for (const [route, r] of [["greedy", setJustified(words, wd, sp, blockW)], ["balanced", setBalanced(words, wd, sp, blockW)]]) {
    const L = r.lines.length, pages = Math.ceil(L / S), last = L - (pages - 1) * S;
    const weak = r.lines.slice(0, -1).filter((l) => { const w = l.words.at(-1); return WEAK.test(w) && !/[,.;:!?]$/.test(w); }).length;
    const lone = r.lines.slice(0, -1).filter((l) => l.words.length === 1).length;
    const pageEndsSentence = r.lines.filter((_, i) => (i + 1) % S === 0 && i < L - 1).every((l) => /[.!?]$/.test(l.words.at(-1)));
    const gaps = r.lines.map((l, i) => (i === L - 1 || l.words.length < 2 ? null : (blockW - l.words.reduce((q, w) => q + wd(w), 0)) / (l.words.length - 1) / sp));
    rows.push({ name, route, L, pages, last, gap: lone ? Infinity : r.widestGap, weak, words: words.length, pageEndsSentence, lines: r.lines, gaps, text });
  }
}
const fmt = (r) => `${r.name} ${r.route.padEnd(8)} · ${r.L} lines/${S} · last ${r.last}/${S} · gap ${r.gap.toFixed(2)}x · weak ${r.weak} · page-end on a full stop ${r.pageEndsSentence ? "YES" : "no"} · ${r.words}w`;
const full = rows.filter((r) => r.pages === 2 && r.last === S).sort((x, y) => x.gap - y.gap || x.weak - y.weak);
console.log(`AT 68 mm, TWO FULL PAGES — ${new Set(full.map((r) => r.name)).size} of 32 combinations:`);
full.forEach((r) => console.log("  " + fmt(r)));
console.log(`\nLine counts across all 32 (balanced): ${[...new Set(rows.filter((r) => r.route === "balanced").map((r) => r.L))].sort().join(", ")}`);
console.log("KEY: o = 'other' out · s = 'it serves' · a = 'actually' out · n = 'and' out · c = close cut to 'without a decision.'");
const show = process.argv[2];
if (show) {
  const [, name, route = "balanced"] = show.split(":");
  const r = rows.find((x) => x.name === name && x.route === route);
  console.log(`\n${fmt(r)}\n${r.text}`);
  r.lines.forEach((l, i) => console.log(`  ${String(i + 1).padStart(2)}${i && i % S === 0 ? " ┈" : "  "} ${l.words.join(" ").padEnd(52)} ${r.gaps[i] === null ? "" : r.gaps[i].toFixed(2) + "x"}`));
}
