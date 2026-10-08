/** THE FALL AT 85 mm LEFT, ONTO ITS BACK ACROSS THE RIM (8 October 2026, session 2). /about (no query needed), Roles; a
 *  crop from the desk to the bin. Held points of the fall (?markfall=), the tip's end (?marktip=1) for the seam, and the
 *  loop sampled. `node … pairs name=query …` shoots named states. `node … rest` shoots only the strike and the rest on the rim (stage 3). ⚠ NOT WATCHED: Carl's Chrome; the bin's real size (assumed 280 mm across). */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
const out = "project-intelligence/live-work/screenshots/desk-mark-fall-left85-8-october-s2";
mkdirSync(out, { recursive: true });
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const ctx = await b.newContext({ viewport: { width: 1412, height: 700 }, deviceScaleFactor: 1.36 });
const shoot = async (p, name) => {
  const c = await p.evaluate(() => { const r = [...document.querySelectorAll("canvas")].sort((a, b) => b.width - a.width)[0].getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; });
  const k = c.w / 2560;
  await p.screenshot({ path: `${out}/${name}.png`, clip: { x: c.x + 1750 * k, y: c.y + 780 * k, width: 810 * k, height: Math.min(655 * k, c.h - 780 * k) } });
};
const open = async (q) => {
  const p = await ctx.newPage();
  await p.goto(`http://localhost:3000/about${q}`, { waitUntil: "networkidle" });
  await p.waitForTimeout(2000);
  await p.getByRole("link", { name: "Roles", exact: true }).first().click();
  await p.waitForTimeout(4500);
  return p;
};
const sets = process.argv[2] === "pairs" ? process.argv.slice(3).map((x) => [x.slice(0, x.indexOf("=")), x.slice(x.indexOf("=") + 1)]) : process.argv[2] === "rest" ? [["strike", "markfall=0.712"], ["rest", "markfall=1"]] : [["tip-end", "marktip=1"], ["fall-0", "markfall=0"], ["fall-0.4", "markfall=0.4"], ["fall-0.7", "markfall=0.7"], ["fall-1", "markfall=1"]];
for (const [n, q] of sets) {
  const p = await open(`?${q}`); await shoot(p, n); await p.close();
}
await b.close();
