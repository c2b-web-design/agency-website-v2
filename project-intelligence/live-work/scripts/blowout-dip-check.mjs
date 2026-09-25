/**
 * THE BLOWOUT DIPS — before/after at each point. 25 September 2026 (third session). One light (L1) held at each
 * dip's centre, dips OFF (`?lmdip=0`) and ON; the card cropped from each frame; a side-by-side per point is saved
 * FOR THE BUILDER'S CHECK ONLY (Carl judges the moving page, one take — not comparison sheets).
 *   node --no-warnings project-intelligence/live-work/scripts/blowout-dip-check.mjs
 * ⚠ NOT WATCHED: motion; the ramps either side of each point; both lights together.
 */
import { chromium } from "playwright";
import sharp from "sharp";
import { mkdirSync } from "node:fs";

const out = "project-intelligence/live-work/screenshots/blowout-dips-25-september";
mkdirSync(out, { recursive: true });
const POINTS = [
  ["CA", 0.07, [395, 290, 415, 245]],
  ["CD", 0.28, [630, 675, 370, 185]],
  ["CB", 0.57, [860, 325, 310, 210]],
  ["CS", 0.73, [590, 60, 500, 190]],
];
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const ctx = await b.newContext({ viewport: { width: 1412, height: 700 }, deviceScaleFactor: 1.36 });
for (const [id, f, [x, y, w, h]] of POINTS) {
  const crops = [];
  for (const dip of ["0", "1"]) {
    const p = await ctx.newPage();
    await p.goto(`http://localhost:3000/about?lighthelpers=0&lmonly=1&lmfreeze=${f}&lmdip=${dip}#roles`, { waitUntil: "networkidle" });
    await p.waitForTimeout(2500);
    const png = await p.screenshot();
    await p.close();
    crops.push(await sharp(png).extract({ left: x, top: y, width: w, height: h }).png().toBuffer());
  }
  await sharp({ create: { width: w * 2 + 10, height: h, channels: 3, background: "#000" } })
    .composite([{ input: crops[0], left: 0, top: 0 }, { input: crops[1], left: w + 10, top: 0 }])
    .png()
    .toFile(`${out}/${id}-${f}-off-vs-on.png`);
  console.log(`${id} at ${f}: saved (left: dips off · right: dips on)`);
}
await b.close();
