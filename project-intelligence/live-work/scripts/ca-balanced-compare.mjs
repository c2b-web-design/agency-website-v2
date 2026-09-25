/**
 * CA at 68 mm, BALANCED breaks, forced to 12 lines (two full pages of 6) — per-line gaps for the two
 * candidate copies. 25 September 2026. Imports the REAL setter.
 *   node --no-warnings project-intelligence/live-work/scripts/ca-balanced-compare.mjs
 */
import { readFileSync } from "node:fs";
import { setBalanced } from "../../../components/about/card-text-timeline.ts";

const font = JSON.parse(readFileSync("public/fonts/geist-regular.typeface.json", "utf8"));
const em = 68, mm = em / (100000 / 72);
const h = 805.1, w = 1331.8, inset = (2 * 0.022 + 0.03) * h, blockW = (w - 2 * inset) * 0.94;
const wd = (s) => [...s].reduce((a, c) => a + (font.glyphs[c]?.ha ?? 0), 0) * mm;
const sp = font.glyphs[" "].ha * mm;

const A = "The technical foundation of every project is operating directly inside the development environment. The Architect collaborates on feature design, evaluates system logic, and solves structural problems before a single line of production code is written. High-level ideas are broken down into precise components, a clear blueprint the Builder executes exactly. The work is then checked by someone who didn’t do it.";
const B = A.replace("design, evaluates system logic, and solves", "design and system logic, and solves");
const C = B.replace("the Builder executes exactly", "the Builder can execute exactly"); // ⛔ the version that shipped

for (const [name, body] of [["A — evaluates kept", A], ["B — evaluates out, executes", B], ["C — evaluates out, can execute (SHIPPED)", C]]) {
  const r = setBalanced(body.split(" "), wd, sp, blockW, { lines: 12 });
  console.log(`${name}: widest ${r.widestGap.toFixed(2)}x`);
  r.lines.forEach((l, i) => {
    const s = l.words.reduce((a, x) => a + wd(x), 0);
    const g = l.justified ? `${((blockW - s) / (l.words.length - 1) / sp).toFixed(2)}x` : "(last)";
    console.log(`  ${String(i + 1).padStart(2)}${i === 6 ? " ┈" : "  "} ${l.words.join(" ").padEnd(40)} ${g}`);
  });
}
