/**
 * THE MOVING LIGHT — does it run where Carl looks, and does ?lightmove=0 restore the old page? 25 September 2026.
 *
 *  1. ?lightmove=0 vs `screenshots/seam/notext-shipped.png` (the frame before the light existed):
 *     mean and max channel difference over the canvas. Expect ~0.
 *  2. /about#roles (no query, as Carl arrives) — the downbeat is NOT consulted (0 marks — parked), and two frames 4 s apart DIFFER
 *     (the light moved). Frames saved for the record; ⚠ Carl judges it MOVING, not from these.
 *
 * ⚠ NOT WATCHED: whether the performance is right (Carl's eye), frame rate, other viewports.
 *
 *   node project-intelligence/live-work/scripts/moving-light-check.mjs
 */
import { chromium } from "playwright";
import sharp from "sharp";
import { mkdirSync } from "node:fs";

const OUT = "project-intelligence/live-work/screenshots/moving-light";
mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({
  headless: false,
  args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"],
});

async function open(query) {
  const page = await browser.newPage({ viewport: { width: 1412, height: 700 }, deviceScaleFactor: 1.36 });
  await page.goto(`http://localhost:3000/about${query}`, { waitUntil: "networkidle" });
  const canvas = page.locator("canvas").first();
  await canvas.waitFor({ state: "visible", timeout: 20000 });
  await canvas.scrollIntoViewIfNeeded();
  await page.waitForTimeout(3000);
  return { page, box: await canvas.boundingBox() };
}

async function diff(a, b) {
  const [A, B] = await Promise.all([a, b].map((f) => sharp(f).removeAlpha().raw().toBuffer({ resolveWithObject: true })));
  if (A.info.width !== B.info.width || A.info.height !== B.info.height) return { mean: NaN, max: NaN, note: "size differs" };
  let sum = 0, max = 0;
  for (let i = 0; i < A.data.length; i++) {
    const d = Math.abs(A.data[i] - B.data[i]);
    sum += d;
    if (d > max) max = d;
  }
  return { mean: sum / A.data.length, max };
}

// 1. ?lightmove=0 — the page as it was before the light
{
  const { page, box } = await open("?lightmove=0");
  const f = `${OUT}/plain.png`;
  await page.screenshot({ path: f, clip: box });
  const d = await diff(f, "project-intelligence/live-work/screenshots/seam/notext-shipped.png");
  console.log(`?lightmove=0 vs before the light: mean ${d.mean.toFixed(3)}, max ${d.max} ${d.note ?? ""}`);
  await page.close();
}

// 2. THE WAY CARL ARRIVES — /about#roles, no query (the Roles link). Light and trajectory must be there.
{
  const { page, box } = await open("#roles");
  const downbeat = await page.evaluate(() => performance.getEntriesByName("movinglight:downbeat").length);
  const f1 = `${OUT}/moving-t0.png`, f2 = `${OUT}/moving-t4.png`;
  await page.screenshot({ path: f1, clip: box });
  await page.waitForTimeout(4000);
  await page.screenshot({ path: f2, clip: box });
  const d = await diff(f1, f2);
  console.log(`downbeat marks: ${downbeat}`);
  console.log(`two frames 4 s apart: mean ${d.mean.toFixed(3)}, max ${d.max} — ${d.mean > 0.2 ? "MOVED" : "⛔ STILL"}`);
  await page.close();
}
await browser.close();
console.log("⚠ NOT WATCHED: whether the performance is right (Carl's eye, moving), frame rate, other viewports.");
