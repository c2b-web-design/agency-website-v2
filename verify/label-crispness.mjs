/**
 * ⚠ WHAT THE LABEL LOOKS LIKE AT EACH TEXTURE RESOLUTION — FOR CARL'S EYE.
 *
 * The A/B (`verify/label-tex-ab.mjs`) says 1024 and 512 are ~45-51ms cheaper
 * than the shipped 2048. **It cannot say whether they are legible.** Crispness
 * was the stated cost of moving the text into WebGL, so the saving is only
 * available if the text still reads.
 *
 * ⚠⚠ THIS SHOOTS WHAT IS DRAWN, NOT WHAT IS IN THE DOM. This project has
 * already passed nine automated checks on a button whose label was being
 * painted over by a canvas — Carl caught it in one look. A pixel crop is the
 * only honest instrument for "does the text read".
 *
 * Shot at deviceScaleFactor 3 so the glyph edges are visible at all; a DPR-1
 * crop of a ~12px label hides exactly the differences being judged.
 *
 *   VERIFY_BASE_URL=http://localhost:3100 node verify/label-crispness.mjs
 *
 * Writes verify/out/label-<w>.png, one per arm, same crop, same card.
 */

import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const BASE = process.env.VERIFY_BASE_URL ?? "http://localhost:3100";
const ARMS = [
  { name: "2048", query: "" },
  { name: "1024", query: "?labeltex=1024" },
  { name: "512", query: "?labeltex=512" },
];

mkdirSync("verify/out", { recursive: true });

const browser = await chromium.launch({
  headless: false,
  args: ["--enable-gpu", "--use-gl=angle", "--ignore-gpu-blocklist"],
});

for (const arm of ARMS) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    // ⚠ DPR 3 IS THE POINT. At DPR 1 every arm looks the same because the
    // screen cannot show the difference; the judgement is about what survives
    // magnification, which is what a retina visitor actually gets.
    deviceScaleFactor: 3,
  });
  const page = await context.newPage();
  await page.goto(`${BASE}/start${arm.query}`, { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: /begin/i }).click();

  // Wait for the cards to have finished arriving — the last rung is +2890ms
  // from the ladder's zero, and the entrance itself runs past that.
  const grid = page.locator(".enquiry-answer-grid");
  await grid.waitFor({ state: "visible", timeout: 30000 });
  await page.waitForTimeout(5200);

  const box = await grid.boundingBox();
  if (!box) throw new Error("no grid box");

  // Card 1 sits top-left in the 3+2 arrangement. Crop it alone: a full-grid
  // shot scaled to fit a review pane is exactly the scaling that hides the
  // defect being judged.
  await page.screenshot({
    path: `verify/out/label-${arm.name}.png`,
    clip: { x: box.x, y: box.y, width: box.width / 3, height: box.height / 2 },
  });
  console.log(`  shot verify/out/label-${arm.name}.png`);

  await context.close();
}

await browser.close();

console.log("\n⚠ THESE ARE FOR CARL'S EYE. The harness has no opinion on which");
console.log("  is acceptable and cannot acquire one. 512 is expected to be the");
console.log("  visible one; 1024 is the candidate.");
