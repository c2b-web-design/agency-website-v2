/**
 * THE SEAM — is the proxy's far plane clipped by the camera's `far`? 25 September 2026.
 *
 * Hypothesis (computed, not yet seen): the far plane sits at camera depth 102–106 m, `far` is 100, so
 * everything above plate row ~805 is never drawn by WebGL and the DOM <img> shows through instead.
 *
 * Method: two frames of /about at Carl's viewport — as shipped, and with the DOM plate hidden. In the
 * second, any canvas pixel that equals the page background is a pixel WebGL did not draw. Reports, per
 * band of canvas rows, the fraction of undrawn pixels.
 *
 * ⚠ NOT WATCHED: whether the glass is right; anything outside the canvas box; any viewport but this one.
 *
 *   node project-intelligence/live-work/scripts/seam-far-clip.mjs [tag]
 */
import { chromium } from "playwright";
import sharp from "sharp";
import { mkdirSync } from "node:fs";

const TAG = process.argv[2] ?? "before";
const OUT = "project-intelligence/live-work/screenshots/seam";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({
  headless: false,
  args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"],
});
const page = await browser.newPage({ viewport: { width: 1412, height: 700 }, deviceScaleFactor: 1.36 });
await page.goto("http://localhost:3000/about", { waitUntil: "networkidle" });
const canvas = page.locator("canvas").first();
await canvas.waitFor({ state: "visible", timeout: 20000 });
await canvas.scrollIntoViewIfNeeded();
await page.waitForTimeout(3000);

const renderer = await page.evaluate(() => {
  const gl = document.createElement("canvas").getContext("webgl2");
  const ext = gl?.getExtension("WEBGL_debug_renderer_info");
  return ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : "unknown";
});

const box = await canvas.boundingBox();
await page.screenshot({ path: `${OUT}/${TAG}-shipped.png`, clip: box });

await page.addStyleTag({ content: `img[src*="about-room-plate"]{visibility:hidden!important}` });
await page.waitForTimeout(500);
/* ⛔ The background is SAMPLED from the side band left of the canvas — real page pixels, as rendered.
   ⚠ The first version regex-parsed the CSS colour (a `lab()` value) and reported "all drawn" on the frame
   that was 44% undrawn. The side band's colour (10,10,10) counted on `before-webgl-only.png` reads 100%
   undrawn at the top, edge at row 532 — so this version can go red. */
if (box.x < 8) throw new Error("no side band to sample the page background from at this viewport");
const bandFile = `${OUT}/${TAG}-band.png`;
await page.screenshot({ path: bandFile, clip: { x: 2, y: box.y + 10, width: 4, height: 4 } });
const bgRgb = Array.from((await sharp(bandFile).removeAlpha().raw().toBuffer()).subarray(0, 3));
const bg = `rgb(${bgRgb.join(",")}) (side band)`;
const file = `${OUT}/${TAG}-webgl-only.png`;
await page.screenshot({ path: file, clip: box });
await browser.close();

const { data, info } = await sharp(file).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const W = info.width, H = info.height;
const undrawnRow = (y) => {
  let n = 0;
  for (let x = 0; x < W; x++) {
    const i = (y * W + x) * 3;
    if (Math.abs(data[i] - bgRgb[0]) <= 2 && Math.abs(data[i + 1] - bgRgb[1]) <= 2 && Math.abs(data[i + 2] - bgRgb[2]) <= 2) n++;
  }
  return n / W;
};
const rows = Array.from({ length: H }, (_, y) => undrawnRow(y));
let edge = -1;
for (let y = H - 1; y > 0; y--) if (rows[y] > 0.5 && rows[y - 1] > 0.5) { edge = y; break; }

console.log(`renderer: ${renderer}`);
console.log(`canvas ${box.width.toFixed(0)} x ${box.height.toFixed(0)} CSS, ${W} x ${H} device px; page background ${bg}`);
const BANDS = 10;
for (let b = 0; b < BANDS; b++) {
  const y0 = Math.floor((b * H) / BANDS), y1 = Math.floor(((b + 1) * H) / BANDS);
  const f = rows.slice(y0, y1).reduce((a, v) => a + v, 0) / (y1 - y0);
  console.log(`  rows ${String(y0).padStart(4)}–${String(y1 - 1).padStart(4)}  undrawn ${(100 * f).toFixed(1).padStart(5)}%`);
}
console.log(edge < 0
  ? "VERDICT: no undrawn band found — WebGL draws the whole canvas."
  : `VERDICT: WebGL draws nothing above row ${edge} of ${H} (plate fraction ${(edge / H).toFixed(4)}; predicted 0.561 from far = 100).`);
console.log("⚠ NOT WATCHED: glass correctness, other viewports, anything outside the canvas box.");
