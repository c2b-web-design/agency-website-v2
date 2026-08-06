/**
 * Does the card read as a SOLID SHAPE as the light comes up?
 *
 * ⚠ THIS SCRIPT EXISTS BECAUSE THE PREVIOUS ONE ANSWERED THE WRONG QUESTION AND
 * CARL CAUGHT IT BY EYE. `brightness-headroom.mjs` walks a single vertical line
 * down the card's CENTRE, so it samples the top edge and the middle and nothing
 * else. It reported edge and face converging as the light rose, and the Builder
 * read that as the card flattening.
 *
 * ⚠ CARL, 5 August: *"that is not how it looks on screen. It looks like a 3d
 * physical object when the light is ramped up. the reflection on the upper face
 * becomes more pronounced and brighter. On the lower face the same reflection
 * appears but its darker, almost as if a shadow is being cast and this happens at
 * the sides too. Its giving the impression that a solid shape has appeared."*
 *
 * ⚠ HE IS DESCRIBING AN ASYMMETRY THE OLD INSTRUMENT CANNOT SEE. Upper versus
 * lower, left versus right — a centre column samples neither pair. **A harness
 * blind to the axis in question cannot report on it**, and reporting convergence
 * from it was the same error this project records twice already: assuming where
 * the boundary is instead of measuring it, and trusting a number that could not
 * distinguish the thing being asked about.
 *
 * ⚠ SO THIS MEASURES MODELLING, NOT BRIGHTNESS. Directional shading is what makes
 * a lit object read as solid: a key above and left means the upper face catches
 * light, the lower face falls away, and the sides differ from each other. The
 * quantity that matters is the SPREAD BETWEEN OPPOSING FACES, and whether it
 * grows or shrinks as the fader rises.
 *
 * ⚠ IT REPORTS. IT DOES NOT APPROVE. The verdict on how the card looks is Carl's.
 *
 *   node verify/card-modelling.mjs
 */

import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import sharp from "sharp";

const OUT = "verify/out";
mkdirSync(OUT, { recursive: true });

const LEVELS = [0.12, 0.35, 0.5, 0.7, 1.0, 1.5, 2.0];

const browser = await chromium.launch({
  headless: false,
  args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

/**
 * Sample the four faces of the card's relief, plus its interior.
 *
 * ⚠ THE KEY IS ABOVE AND LEFT — `[-60, 90, 120]` in `answer-card-canvas.tsx`. So
 * the prediction is specific and falsifiable: UPPER brighter than LOWER, LEFT
 * brighter than RIGHT, and both gaps WIDENING as the fader rises. If the gaps
 * shrink, the card really is flattening and Carl's read would be wrong. If they
 * widen, the modelling is strengthening and the earlier "it flattens" was an
 * artefact of where the old script looked.
 *
 * ⚠ BANDS, NOT POINTS. A single pixel on a 4px bevel lands wherever antialiasing
 * puts it. Each band is averaged across the card's width (or height) to make the
 * reading about the FACE rather than about one fragment.
 */
async function faces(buf) {
  const { data, info } = await sharp(buf)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width: W, height: H } = info;
  const lum = (x, y) => {
    const i = (W * y + x) * 4;
    return 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
  };
  const mean = (pts) => pts.reduce((a, b) => a + b, 0) / pts.length;

  // Horizontal bands, sampled across the middle 60% of the width so the rounded
  // ends do not contaminate a reading meant to be about the top/bottom faces.
  const x0 = Math.round(W * 0.2);
  const x1 = Math.round(W * 0.8);
  const band = (y) => {
    const pts = [];
    for (let x = x0; x < x1; x++) pts.push(lum(x, y));
    return mean(pts);
  };
  // Vertical bands, likewise across the middle 50% of the height.
  const y0 = Math.round(H * 0.25);
  const y1 = Math.round(H * 0.75);
  const col = (x) => {
    const pts = [];
    for (let y = y0; y < y1; y++) pts.push(lum(x, y));
    return mean(pts);
  };

  // The relief is ~4px of rim then ~4px of bevel per side. Sample the bevel's
  // slope — 3..7px in — which is the surface that catches or loses the key.
  const upper = mean([band(3), band(4), band(5), band(6), band(7)]);
  const lower = mean([
    band(H - 4), band(H - 5), band(H - 6), band(H - 7), band(H - 8),
  ]);
  const left = mean([col(3), col(4), col(5), col(6), col(7)]);
  const right = mean([
    col(W - 4), col(W - 5), col(W - 6), col(W - 7), col(W - 8),
  ]);
  const interior = mean([band(Math.round(H / 2))]);

  return { upper, lower, left, right, interior };
}

const rows = [];

for (const level of LEVELS) {
  await page.goto(`http://localhost:3000/start?cardrig=1&light=${level}`, {
    waitUntil: "networkidle",
  });

  if (level === LEVELS[0]) {
    const renderer = await page.evaluate(() => {
      const c = document.createElement("canvas");
      const gl = c.getContext("webgl2") || c.getContext("webgl");
      const d = gl && gl.getExtension("WEBGL_debug_renderer_info");
      return d ? gl.getParameter(d.UNMASKED_RENDERER_WEBGL) : "unknown";
    });
    console.log("renderer:", renderer, "\n");
    if (/swiftshader|llvmpipe|software/i.test(renderer)) {
      console.log("⚠ SOFTWARE RASTERISER — not real hardware.\n");
    }
  }

  await page.getByRole("button", { name: /begin/i }).click();
  await page.waitForTimeout(8000);

  const card = await page.getByTestId("answer-card-hover-0").boundingBox();
  if (!card) throw new Error("card 0 not found — viewport >= 1280?");

  // ⚠ CAPTURED AT 3x SO THE 4px BEVEL IS 12px OF PIXELS TO AVERAGE. At 1x the
  // relief is thinner than the antialiasing, and every band would be a blend of
  // the surface either side of it.
  const buf = await page.screenshot({
    clip: card,
    scale: "css",
    ...{},
  });
  const big = await sharp(buf).resize({ width: Math.round(card.width * 3), kernel: "nearest" }).png().toBuffer();

  const f = await faces(big);
  rows.push({ level, ...f });

  console.log(
    `light ${level.toFixed(2).padStart(4)}  ` +
      `upper ${f.upper.toFixed(1).padStart(6)}  lower ${f.lower.toFixed(1).padStart(6)}  ` +
      `| U-L ${(f.upper - f.lower).toFixed(1).padStart(6)}  ` +
      `left ${f.left.toFixed(1).padStart(6)}  right ${f.right.toFixed(1).padStart(6)}  ` +
      `| L-R ${(f.left - f.right).toFixed(1).padStart(6)}`,
  );
}

console.log("\n─────────────────────────────────────────────");
console.log("THE MODELLING QUESTION: do opposing faces SEPARATE as light rises?\n");
console.log("  level    upper-lower    left-right    (positive = key above/left reads)");
for (const r of rows) {
  console.log(
    `  ${r.level.toFixed(2).padStart(5)}    ` +
      `${(r.upper - r.lower).toFixed(1).padStart(11)}    ` +
      `${(r.left - r.right).toFixed(1).padStart(10)}`,
  );
}

const first = rows[0];
const last = rows[rows.length - 1];
const udGrew = last.upper - last.lower > first.upper - first.lower;
const lrGrew = last.left - last.right > first.left - first.right;

console.log("\n  upper/lower separation " + (udGrew ? "WIDENS" : "NARROWS") + " as the light rises");
console.log("  left/right  separation " + (lrGrew ? "WIDENS" : "NARROWS") + " as the light rises");
console.log("\n⚠ THIS IS THE AXIS THE CENTRE-COLUMN PROFILE COULD NOT SEE.");
console.log("  Whether the card LOOKS solid remains Carl's call, not this table's.");

writeFileSync(`${OUT}/card-modelling.json`, JSON.stringify(rows, null, 2));
console.log(`\ndata: ${OUT}/card-modelling.json`);

await browser.close();
