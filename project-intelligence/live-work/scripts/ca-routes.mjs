/**
 * CA's TWO ROUTES — 25 September 2026. Carl: "The 2 other routes you suggested, try them but you can use either
 * the original copy in its entirety or use any of the edits in the semantic version."
 *   ROUTE 1 — size only: greedy breaks (what renders today), the best size.
 *   ROUTE 2 — balanced breaks (`setBalanced`): the paragraph's breaks chosen together, weak line-endings penalised;
 *             natural line count, or forced to FILL the pages exactly.
 * Copy: the ORIGINAL verbatim, and all 128 combinations of Carl's edits. Real font, real card, real setters.
 * Run: node project-intelligence/live-work/scripts/ca-routes.mjs "$(pwd)" [route:em:variant] — imports the REAL setters.
 * ⚠ NOT WATCHED: how it LOOKS (Carl's eye); the chase's timing at each size.
 */
import { setBalanced, setJustified } from "../../../components/about/card-text-timeline.ts";
import { readFileSync } from "node:fs";
const font = JSON.parse(readFileSync(`${process.argv[2]}/public/fonts/geist-regular.typeface.json`, "utf8"));
const EM_UNITS = 100000 / 72;
const h = 805.1, w = 1331.8, inset = (2 * 0.022 + 0.03) * h, faceH = h - 2 * inset, blockW = (w - 2 * inset) * 0.94;
const ORIGINAL = "The technical foundation of every project. Operating directly inside the development environment, the Architect collaborates on feature design, evaluates system logic, and solves structural problems before a single line of production code is written. High-level ideas are broken down into precise, modular components — a clear blueprint the Builder can execute exactly. And the work is then checked by someone who did not do it.";
const keys = ["is", "noEval", "noModular", "executes", "precisely", "noAnd", "didnt"];
const edited = (v) => [
  v.is ? "The technical foundation of every project is operating directly inside the development environment. The Architect"
       : "The technical foundation of every project. Operating directly inside the development environment, the Architect",
  v.noEval ? "collaborates on feature design and system logic, and solves" : "collaborates on feature design, evaluates system logic, and solves",
  "structural problems before a single line of production code is written.",
  `High-level ideas are broken down into precise,${v.noModular ? "" : " modular"} components, a clear blueprint the Builder`,
  `${v.executes ? "executes" : "can execute"} ${v.precisely ? "precisely." : "exactly."}`,
  `${v.noAnd ? "The work" : "And the work"} is then checked by someone who ${v.didnt ? "didn’t" : "did not"} do it.`,
].join(" ").replace("precise, components", "precise components");
const variants = [{ name: "ORIGINAL", body: ORIGINAL }];
for (let m = 0; m < 128; m++) {
  const v = Object.fromEntries(keys.map((k, i) => [k, !!(m & (1 << i))]));
  variants.push({ name: keys.filter((k) => v[k]).join("+") || "(dash out only)", body: edited(v) });
}
const WEAK = /^(a|an|the|of|to|in|on|at|by|for|with|from|into|and|or|but|nor|is|are|was|be|as|that|who|which|it)$/i;
const weakEnds = (lines) => lines.slice(0, -1).filter((l) => { const w = l.words[l.words.length - 1]; return WEAK.test(w) && !/[,.;:!?]$/.test(w); }).length;
const rows = [];
for (const v of variants) {
  const words = v.body.split(" ");
  for (let em = 52; em <= 74; em++) {
    const mm = em / EM_UNITS;
    const wd = (s) => [...s].reduce((a, c) => a + (font.glyphs[c]?.ha ?? 0), 0) * mm;
    const sp = font.glyphs[" "].ha * mm;
    const S = Math.floor((0.9 * faceH) / (em * 1.35));
    const add = (route, r) => {
      if (r.cost === Infinity) return;
      const L = r.lines.length, pages = Math.ceil(L / S), last = L - (pages - 1) * S;
      const lone = r.lines.slice(0, -1).filter((l) => l.words.length === 1).length; // ⚠ gap-blind lines — see setBalanced
      rows.push({ route, variant: v.name, em, L, S, pages, last, gap: lone ? Infinity : r.widestGap, lone, weak: weakEnds(r.lines), lines: r.lines, words: words.length });
    };
    add("greedy", setJustified(words, wd, sp, blockW));
    add("balanced", setBalanced(words, wd, sp, blockW));
    for (const target of [S, 2 * S]) add(`balanced→${target}`, setBalanced(words, wd, sp, blockW, { lines: target }));
  }
}
const full = (r) => r.last === r.S && r.pages <= 2;
const fmt = (r) => `${r.route.padEnd(12)} ${String(r.em).padStart(2)}mm ${String(r.L).padStart(2)} lines/${r.S} slots · last page ${r.last}/${r.S} · gap ${r.gap.toFixed(2)}x · weak endings ${r.weak} · ${r.words}w · ${r.variant}`;
const bestOf = (f, n) => rows.filter(f).sort((a, b) => a.gap - b.gap || a.weak - b.weak || b.em - a.em).slice(0, n);
console.log("ROUTE 1 — ORIGINAL COPY, SIZE ONLY (greedy), full pages first then best gaps:");
bestOf((r) => r.variant === "ORIGINAL" && r.route === "greedy" && full(r), 3).forEach((r) => console.log("  " + fmt(r)));
bestOf((r) => r.variant === "ORIGINAL" && r.route === "greedy", 3).forEach((r) => console.log("  " + fmt(r)));
console.log("\nROUTE 2 — ORIGINAL COPY, BALANCED BREAKS, pages filled:");
bestOf((r) => r.variant === "ORIGINAL" && r.route.startsWith("balanced") && full(r), 5).forEach((r) => console.log("  " + fmt(r)));
console.log("\nROUTE 2 — ANY EDITS, BALANCED BREAKS, pages filled (best 8):");
bestOf((r) => r.route.startsWith("balanced") && full(r), 8).forEach((r) => console.log("  " + fmt(r)));
console.log("\nTODAY'S CHOICE for reference — edited (is+noModular+executes+noAnd+didnt), greedy, 68 mm:");
rows.filter((r) => r.variant === "is+noModular+executes+noAnd+didnt" && r.em === 68).forEach((r) => console.log("  " + fmt(r)));
const pick = process.argv[3];
if (pick) {
  const [route, em, ...name] = pick.split(":");
  const r = rows.find((x) => x.route === route && x.em === +em && x.variant === name.join(":"));
  if (r) r.lines.forEach((l, i) => console.log(`  ${String(i + 1).padStart(2)}${i === r.S ? " ┈" : "  "} ${l.words.join(" ")}`));
}
