/** The approved teal at the same frozen lamp points as the gold's pass 3 (13 October) — is the lamp less visible on gold?
 *  ⚠ The bench's 1× teal, not the home page's 2×. NOT WATCHED: motion. */
import { chromium } from "playwright";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "screenshots", "gold-button-13-october", "pass3");
const Q = "http://localhost:3000/proto/button?mode=teal&paint=1fb2c4&metalness=1&paintrough=0.4&roll=1&mlkind=lamp&mli=1&mllift=120&mldip=0.9&mldipat=0.5&mldipw=0.4&rollat=0&zoom=4";
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const ctx = await b.newContext({ viewport: { width: 1440, height: 1400 }, deviceScaleFactor: 1 });
for (const mt of ["0.15", "0.3"]) {
  const p = await ctx.newPage();
  await p.goto(`${Q}&mt=${mt}`, { waitUntil: "networkidle" });
  await p.waitForSelector("#whoweare-pill canvas"); await p.waitForTimeout(2500);
  const c = await p.evaluate(() => { const r = document.querySelector("#whoweare-pill canvas").getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; });
  await p.screenshot({ path: join(OUT, `teal_4x_mt${mt}.png`), clip: { x: Math.max(0, c.x - 20), y: Math.max(0, c.y - 20), width: c.w + 40, height: c.h + 40 } });
  await p.close();
}
await b.close();
