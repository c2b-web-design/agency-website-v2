/** The letters' side colour on the gold member (13 October): R-048's look + the lamp, the roll frozen at 45° and 60°,
 *  4×, with the teal's SIDE_INK (absent) and with ?side=. Usage: node …/start-button-side-capture.mjs [side hex …]
 *  ⚠ NOT WATCHED: motion; the home page (its scene passes no side, so it keeps SIDE_INK — by the default, not measured here). */
import { chromium } from "playwright";
import { join, dirname } from "node:path";
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "screenshots", "gold-button-13-october", "pass3");
mkdirSync(OUT, { recursive: true });
const Q = "http://localhost:3000/proto/button?member=start&mode=teal&paint=ffe39e&metalness=1&paintrough=0.4&ink=1e1e24&roll=1&mlkind=lamp&mli=1&mllift=120&mldip=0.9&mldipat=0.5&mldipw=0.4&mt=0.3&zoom=4";
const sides = ["", ...process.argv.slice(2)];
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
for (const side of sides) for (const at of ["45", "60"]) {
  const p = await ctx.newPage();
  await p.goto(`${Q}&rollat=${at}${side ? "&side=" + side : ""}`, { waitUntil: "networkidle" });
  await p.waitForSelector("#start-pill canvas"); await p.waitForTimeout(2500);
  const c = await p.evaluate(() => { const r = document.querySelector("#start-pill canvas").getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; });
  const f = `side-${side || "teal-default"}_rollat${at}.png`;
  await p.screenshot({ path: join(OUT, f), clip: { x: Math.max(0, c.x - 20), y: Math.max(0, c.y - 20), width: c.w + 40, height: c.h + 40 } });
  console.log(f); await p.close();
}
await b.close();
