import { chromium } from "playwright";
import { join } from "node:path";
const OUT = "C:/Users/Carl Buckley/agency-website-v2/project-intelligence/live-work/screenshots/gold-button-13-october/pass1";
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
for (const a of [80]) {
  const p = await ctx.newPage();
  await p.goto(`http://localhost:3000/proto/button?mode=clay&roll=1&label=1&zoom=4&rollat=${a}`, { waitUntil: "networkidle" });
  await p.waitForSelector("#whoweare-pill canvas"); await p.waitForTimeout(2500);
  const c = await p.evaluate(() => { const r = document.querySelector("#whoweare-pill canvas").getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; });
  await p.screenshot({ path: join(OUT, `teal-clay_4x_rollat${a}.png`), clip: { x: c.x - 20, y: c.y - 20, width: c.w + 40, height: c.h + 40 } });
  await p.close();
}
await b.close();
