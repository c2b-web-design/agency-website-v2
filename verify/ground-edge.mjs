/**
 * WHERE is the ground plane visible against the page, and by how much?
 *
 * ⚠ THE PLANE IS A FLAT FILL SITTING ON A GRADIENT. `GROUND_COLOR` #101010 was
 * *"sampled, not invented"* — measured off the rendered page at the grid's own
 * rows. But the page is `radial-gradient(ellipse at 50% 40%, #141414, #080808)`,
 * and a FLAT colour can only match a gradient at ONE distance from its centre.
 * Everywhere else it differs, and the difference is an edge.
 *
 * ⚠ OVERSIZING DOES NOT FIX IT, WHICH IS WHY IT SURVIVED. The plane is 2x the
 * grid so *"its edge is never on screen"* — the fix for an earlier version of
 * this same bug, where a flat fill was painted into the lockup's canvas and Carl
 * saw it at once: *"I can see the black rectangle the text is sitting in."*
 * Oversizing removes a BOUNDARY mismatch. This is a COLOUR mismatch: a bigger
 * rectangle is still a rectangle.
 *
 * ⚠ SO MEASURE THE STEP ACROSS THE PLANE'S EDGE, not the plane's colour alone.
 * A colour that "looks right" in isolation says nothing; what the eye catches is
 * the discontinuity where the plane stops.
 *
 * Samples a horizontal and a vertical line through the canvas, reporting
 * luminance either side of the plane's boundary.
 *
 *   node verify/ground-edge.mjs
 */
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";
import sharp from "sharp";
const BASE = process.env.VERIFY_BASE_URL ?? "http://localhost:3000";
mkdirSync("verify/out/ground", { recursive: true });

const browser = await chromium.launch({ headless: false, args: ["--enable-gpu","--use-angle=default","--ignore-gpu-blocklist"] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(`${BASE}/start`, { waitUntil: "networkidle" });
await page.waitForTimeout(900);
await page.getByRole("button", { name: /begin/i }).click().catch(() => {});
// Past ENTRANCE_END_MS so every card has settled and nothing is mid-fade.
await page.waitForTimeout(7000);

const geom = await page.evaluate(() => {
  const host = document.querySelector("[data-testid='answer-card-proto']");
  const grid = document.querySelector(".enquiry-answer-grid");
  if (!host || !grid) return null;
  const h = host.getBoundingClientRect();
  const g = grid.getBoundingClientRect();
  return {
    host: { x: h.x, y: h.y, w: h.width, h: h.height },
    grid: { x: g.x, y: g.y, w: g.width, h: g.height },
  };
});
if (!geom) { console.log("⚠ canvas not found"); await browser.close(); process.exit(1); }

await page.screenshot({ path: "verify/out/ground/full.png" });
await browser.close();

const img = sharp("verify/out/ground/full.png");
const { width, height } = await img.metadata();
const raw = await img.raw().toBuffer();
const lum = (x, y) => {
  const i = (Math.round(y) * width + Math.round(x)) * 3;
  return 0.2126 * raw[i] + 0.7152 * raw[i + 1] + 0.0722 * raw[i + 2];
};

// The plane is GRID_WIDTH_PX*2 x GRID_HEIGHT_PX*2, centred on the canvas — but
// the canvas CLIPS it, so what is on screen is the canvas box itself.
const c = geom.host;
console.log(`\n  canvas box: x ${c.x.toFixed(0)}  y ${c.y.toFixed(0)}  ${c.w.toFixed(0)} x ${c.h.toFixed(0)}`);
console.log(`  page background: radial-gradient(ellipse at 50% 40%, #141414, #080808)`);
console.log(`  GROUND_COLOR: #101010 = luminance 16.0\n`);

// Horizontal walk across the canvas's left edge, well below the cards so no
// card geometry is in the way.
const yBelow = c.y + c.h - 6;
console.log(`── horizontal, across the canvas LEFT edge at y=${yBelow.toFixed(0)} ──`);
for (let dx = -40; dx <= 40; dx += 8) {
  const x = c.x + dx;
  if (x < 1 || x > width - 2) continue;
  const L = lum(x, yBelow);
  console.log(`  x=${String(Math.round(x)).padStart(5)}  (${dx >= 0 ? "inside " : "outside"})  lum ${L.toFixed(2)}`);
}

const yAbove = c.y + 4;
console.log(`\n── horizontal, across the canvas LEFT edge at y=${yAbove.toFixed(0)} (top row) ──`);
for (let dx = -40; dx <= 40; dx += 8) {
  const x = c.x + dx;
  if (x < 1 || x > width - 2) continue;
  console.log(`  x=${String(Math.round(x)).padStart(5)}  (${dx >= 0 ? "inside " : "outside"})  lum ${lum(x, yAbove).toFixed(2)}`);
}

// Vertical walk across the bottom edge, in a gap between cards.
const xGap = c.x + c.w * 0.5;
console.log(`\n── vertical, across the canvas BOTTOM edge at x=${xGap.toFixed(0)} ──`);
for (let dy = -30; dy <= 30; dy += 6) {
  const y = c.y + c.h + dy;
  if (y < 1 || y > height - 2) continue;
  console.log(`  y=${String(Math.round(y)).padStart(5)}  (${dy <= 0 ? "inside " : "outside"})  lum ${lum(xGap, y).toFixed(2)}`);
}

console.log("\n  ⚠ A STEP AT THE BOUNDARY IS THE DEFECT. Equal values either side means");
console.log("    the plane is indistinguishable from the page at that point.");
console.log("\n  ⚠ Verification is not approval.");
