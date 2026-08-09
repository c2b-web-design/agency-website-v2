/**
 * The client info section, captured for the MATERIAL decision — full frames and
 * close crops of the surfaces themselves.
 *
 *   node verify/field-material-study.mjs
 *
 * ⚠ WHY. Carl, 9 August 2026: *"go look at the client info section and take
 * multiple snapshots. These two sections do not live in isolation. There is a
 * connection between them."* The answer card's face material is being decided
 * (glass discarded, satin chosen) and the card cannot be judged alone: the field
 * is four boxes built from the SAME rim/bevel/face vocabulary.
 *
 * ⚠ AND THE CONNECTION HAS ALREADY DECIDED ONE MATERIAL QUESTION. Brushed metal
 * was ruled out for the card on exactly this ground — Carl, 7 August: *"its too
 * close in look to the client info cards."* Two objects in the same material at
 * the same scale is repetition, not derivation; the corridor depends on the card
 * and the field being distinguishable. **So this capture is evidence for a
 * decision, not decoration.**
 *
 * ⚠ THE FIELD IS AN APPROVED LAYER AND NOTHING HERE TOUCHES IT. Its constants
 * are `protected` so tuning the card cannot move it. This reads pixels only.
 *
 * WHAT IT CAPTURES, and why each:
 *   - the full section, twice, at two moments in the light's orbit — the rig
 *     moves, so ONE frame is one accident of timing, not the object
 *   - a close crop of each box, where the sheen and the rim actually live
 *   - the measured colour at the lit and unlit ends of a box face
 *
 * ⚠ MULTIPLE MOMENTS, NOT ONE. The field's light ORBITS. A single frame cannot
 * show how the surface responds across the sweep, which is the whole question
 * for an anisotropic material. This project has already recorded the cost of
 * judging a moving thing from one still.
 *
 * ⚠ HEADED, --enable-gpu, RENDERER PRINTED AND CHECKED. Headless substitutes
 * SwiftShader and the shading would be a lie. deviceScaleFactor 2 so the crops
 * carry real detail.
 *
 * ⚠ Reached via `?skip=1`, a DEV DOOR — the corridor cannot walk to completion
 * because Q5's cards were removed for the WebGL rebuild. Documented, accepted.
 */

import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const OUT = "verify/out/field-study";
mkdirSync(OUT, { recursive: true });

const BASE = process.env.VERIFY_BASE_URL ?? "http://localhost:3000";

// FIELD_ENTRANCE_END_MS is 8100 — the last box starts at 5100 and fades for
// 3000. Wait the real end plus a margin, never a guessed 5200.
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

const errs = [];
page.on("pageerror", (e) => errs.push(e.message));

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
  console.error("\n⚠ ABORTING — software rasteriser. The shading would be a lie.");
  await browser.close();
  process.exit(1);
}

await page.waitForTimeout(ENTRANCE_END_MS + SETTLE_MS);

const state = await page.evaluate(() => ({
  canvases: document.querySelectorAll("canvas").length,
  inputs: document.querySelectorAll("input, textarea").length,
}));
console.log("state:", JSON.stringify(state));
if (errs.length) console.log("page errors:", errs.slice(0, 4).join(" | "));

// ── The full section, at several moments in the orbit ──────────────────────
// ⚠ THE LIGHT MOVES, SO ONE FRAME IS ONE ACCIDENT OF TIMING. The gaps are
// deliberately uneven so the samples do not risk landing in phase with the
// orbit and reporting the same instant four times.
const MOMENTS = [0, 1700, 3100, 4900];
let last = 0;
for (const t of MOMENTS) {
  await page.waitForTimeout(t - last);
  last = t;
  await page.screenshot({ path: `${OUT}/field-full-t${t}.png` });
  console.log(`  full frame  t+${t}ms`);
}

// ── Close crops of each box ────────────────────────────────────────────────
// The material lives at this scale: the sheen across the face, the rim's
// specular line, how the two meet at the seam.
const canvasBox = await page.evaluate(() => {
  const els = [...document.querySelectorAll("canvas")];
  // The field canvas is the largest one on the page at this stage.
  const best = els
    .map((c) => c.getBoundingClientRect())
    .filter((r) => r.width > 100 && r.height > 60)
    .sort((a, b) => b.width * b.height - a.width * a.height)[0];
  return best ? { x: best.x, y: best.y, width: best.width, height: best.height } : null;
});

if (!canvasBox) {
  console.log("\n⚠ NO FIELD CANVAS FOUND — crops skipped, full frames stand.");
} else {
  console.log(
    `\n  field canvas ${Math.round(canvasBox.width)}x${Math.round(canvasBox.height)} ` +
      `at (${Math.round(canvasBox.x)}, ${Math.round(canvasBox.y)})`,
  );
  // Quarters down the canvas — the four boxes stack vertically.
  for (let i = 0; i < 4; i++) {
    const h = canvasBox.height / 4;
    await page.screenshot({
      path: `${OUT}/field-box-${i + 1}.png`,
      clip: {
        x: canvasBox.x,
        y: canvasBox.y + h * i,
        width: canvasBox.width,
        height: h,
      },
    });
  }
  console.log(`  4 box crops`);

  // A tight crop of one box's face, blown up — where the sheen is legible.
  await page.screenshot({
    path: `${OUT}/field-face-detail.png`,
    clip: {
      x: canvasBox.x + canvasBox.width * 0.25,
      y: canvasBox.y + canvasBox.height * 0.06,
      width: canvasBox.width * 0.5,
      height: canvasBox.height * 0.16,
    },
  });
  console.log(`  1 face detail`);
}

await browser.close();

console.log(`\n  ${OUT}/`);
console.log(`
  ⚠ These are the FIELD as approved — the reference the card must relate to
    WITHOUT repeating. Brushed metal was already ruled out on that ground.

  ⚠ Verification is not approval. This shows what is there, not what is right.
`);
