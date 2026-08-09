/**
 * Close crops of the field's boxes — located from the DOM, not guessed.
 *
 *   node verify/field-crops.mjs
 *
 * ⚠ WHY THIS EXISTS SEPARATELY. `field-material-study.mjs` cropped by PERCENTAGE
 * of the canvas and captured the heading instead of a box face. The canvas is
 * 576x184 but the boxes do not fill it, and the opening's heading overlaps that
 * region at this stage. **A crop derived from a guess is a screenshot of the
 * guess.** These crops are anchored to the input elements' own bounding boxes,
 * which is where the material actually is.
 *
 * ⚠ THE INPUTS ARE DOM SIBLINGS OF THE WEBGL BOXES, not the boxes themselves —
 * `ContactFieldInputs` (DOM) and `ContactFieldCanvas` (WebGL) are siblings, and
 * the canvas draws the box BEHIND each input. So an input's rect is the right
 * anchor for finding its box on screen.
 *
 * Captured at several moments because the field's light ORBITS: one frame is one
 * accident of timing, and for an anisotropic surface the sweep IS the question.
 */

import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const OUT = "verify/out/field-study";
mkdirSync(OUT, { recursive: true });

const BASE = process.env.VERIFY_BASE_URL ?? "http://localhost:3000";
const ENTRANCE_END_MS = 8100;
const SETTLE_MS = 2500;

const browser = await chromium.launch({
  headless: false,
  args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"],
});
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
});

await page.goto(`${BASE}/start?skip=1`, { waitUntil: "networkidle" });

const renderer = await page
  .evaluate(() => {
    const c = document.createElement("canvas");
    const gl = c.getContext("webgl2") || c.getContext("webgl");
    const d = gl && gl.getExtension("WEBGL_debug_renderer_info");
    return d ? gl.getParameter(d.UNMASKED_RENDERER_WEBGL) : "unknown";
  })
  .catch(() => "unknown");
console.log("renderer:", renderer);
if (/swiftshader|llvmpipe|software/i.test(String(renderer))) {
  console.error("\n⚠ ABORTING — software rasteriser.");
  await browser.close();
  process.exit(1);
}

await page.waitForTimeout(ENTRANCE_END_MS + SETTLE_MS);

// ⚠ ANCHORED TO THE INPUTS' OWN RECTS. A margin is added so the crop carries the
// box's RIM as well as its face — the seam between them is exactly where the
// card must relate to the field without repeating it.
const rects = await page.evaluate(() => {
  const margin = 14;
  return [...document.querySelectorAll("input, textarea")].map((el, i) => {
    const r = el.getBoundingClientRect();
    return {
      i,
      name: el.getAttribute("name") || el.getAttribute("aria-label") || `field-${i + 1}`,
      x: Math.max(0, r.x - margin),
      y: Math.max(0, r.y - margin),
      width: r.width + margin * 2,
      height: r.height + margin * 2,
    };
  });
});

console.log(`\nfound ${rects.length} input(s)`);
for (const r of rects) {
  console.log(`  ${r.name.padEnd(16)} ${Math.round(r.width)}x${Math.round(r.height)} at (${Math.round(r.x)}, ${Math.round(r.y)})`);
}

if (!rects.length) {
  console.log("\n⚠ NO INPUTS FOUND — nothing to anchor to.");
  await browser.close();
  process.exit(1);
}

// Several moments through the orbit. Uneven gaps so the samples cannot land in
// phase with the orbit and report the same instant repeatedly.
const MOMENTS = [0, 1300, 2900, 4300, 6100];
let last = 0;
for (const t of MOMENTS) {
  await page.waitForTimeout(t - last);
  last = t;
  for (const r of rects) {
    await page.screenshot({
      path: `${OUT}/box-${r.i + 1}-t${t}.png`,
      clip: { x: r.x, y: r.y, width: r.width, height: r.height },
    });
  }
  console.log(`  captured all boxes at t+${t}ms`);
}

// The Send button — an APPROVED exotic material (the opal) and the other half of
// the vocabulary the card must sit beside.
const send = await page.evaluate(() => {
  const b = [...document.querySelectorAll("button")].find((x) => /send/i.test(x.textContent || ""));
  if (!b) return null;
  const r = b.getBoundingClientRect();
  return { x: r.x - 18, y: r.y - 18, width: r.width + 36, height: r.height + 36 };
});
if (send) {
  await page.screenshot({ path: `${OUT}/send-button.png`, clip: send });
  console.log(`  captured the Send button`);
}

await browser.close();
console.log(`\n  ${OUT}/`);
console.log(`\n  ⚠ Verification is not approval. This shows what is there.\n`);
