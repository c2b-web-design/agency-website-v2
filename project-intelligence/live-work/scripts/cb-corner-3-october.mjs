/** CB's TOP-LEFT CORNER, NEON LIT — 3 October 2026. Carl: "yes, and fix this" (a white tick at the rim's inner
 *  corner). States: the bevel capped (default) · the cap off (`hlcap=0`) · the old 55° (`takeoff=55`). Crops ×4.
 *  ⚠ NOT WATCHED: the other corners; Carl's Chrome. */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import sharp from "sharp";
const out = "project-intelligence/live-work/screenshots/cb-corner-3-october";
mkdirSync(out, { recursive: true });
const STATES = { capped: "", "cap-off": "hlcap=0", "off55": "takeoff=55" };
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const ctx = await b.newContext({ viewport: { width: 1412, height: 700 }, deviceScaleFactor: 1.36 });
for (const [name, q] of Object.entries(STATES)) {
  const p = await ctx.newPage();
  await p.goto(`http://localhost:3000/about?${q}#roles`, { waitUntil: "networkidle" });
  await p.waitForTimeout(6000);
  const top = await p.evaluate(() => document.querySelector("#roles").getBoundingClientRect().top);
  const png = await p.screenshot();
  await p.close();
  await sharp(png).extract({ left: 830, top: 300, width: 160, height: 110 }).resize({ width: 640, kernel: "nearest" }).toFile(`${out}/${name}.png`);
  await sharp(png).extract({ left: 370, top: 260, width: 160, height: 110 }).resize({ width: 640, kernel: "nearest" }).toFile(`${out}/${name}-CA.png`);
  console.log(name, "#roles top", top.toFixed(0));
}
await b.close();
