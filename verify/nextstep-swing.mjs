// Does the traveller's sweep produce a VISIBLE swing on the pill?
//
//   node verify/nextstep-swing.mjs
//
// ⚠⚠ THIS IS THE TEST THE OPAL RIG FAILED, AND IT IS WHY THIS FILE EXISTS.
// `contact-field-light-rig.tsx` built TRUE proximity driving for the opal's
// shine, measured it, and Carl REJECTED it: closest approach fell at phase 0.953
// inside the hidden half, and the whole range was a **1.3x swing — too flat to
// see**. The shine follows the visible front pass instead.
//
// **So "chrome plus a moving light and the physics does it for free" is NOT a
// safe assumption in this codebase. It has already been disproved once.**
//
// ⚠ CARL'S BAR, from that rig: *"The user won't know about the ellipse, all they
// will see is its effects."* A swing that cannot be seen is not an effect.
//
// ── WHAT IT MEASURES ─────────────────────────────────────────────────────
//
// Frames sampled across the sweep, each screenshotted and reduced to:
//
//   crown luminance   the mean of the top band, where the hairline lives
//   bright fraction   how much of the pill is above a high threshold
//   hairline x        WHERE the brightest column sits, 0..1 across the pill
//
// ⚠ THE POSITION MATTERS AS MUCH AS THE BRIGHTNESS. A highlight that brightens
// and dims in place reads as a pulse; one that TRAVELS reads as a light moving
// past. The reference's hairline travels.
//
// ⚠ SCREENSHOT, NEVER readPixels/toDataURL — `preserveDrawingBuffer: false`.
// Recorded at length in `nextstep-look.mjs`; it cost five wrong fixes.
//
// ⚠ HEADED, --enable-gpu, ABORTS ON A SOFTWARE RASTERISER.

import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const BASE = process.env.VERIFY_BASE_URL ?? "http://localhost:3000";
const FRAMES = Number(process.argv[2] ?? 12);

mkdirSync("verify/out", { recursive: true });

const browser = await chromium.launch({
  headless: false,
  args: ["--enable-gpu", "--use-gl=angle", "--ignore-gpu-blocklist"],
});
const page = await browser.newPage({
  viewport: { width: 1100, height: 800 },
  deviceScaleFactor: 3,
});

await page.goto(`${BASE}/proto/nextstep?zoom=4`, { waitUntil: "networkidle" });

const renderer = await page.evaluate(() => {
  const c = document.createElement("canvas");
  const gl = c.getContext("webgl2") || c.getContext("webgl");
  if (!gl) return "no webgl";
  const ext = gl.getExtension("WEBGL_debug_renderer_info");
  return ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : "unknown";
});
if (/swiftshader|llvmpipe|software|no webgl/i.test(renderer)) {
  console.error(`⚠ ABORTING — renderer is "${renderer}": a software rasteriser.`);
  await browser.close();
  process.exit(1);
}
console.log(`renderer: ${renderer}\n`);

await page.waitForTimeout(2000);

const el = await page.$("#mesh-button > div");
const bb = await el.boundingBox();

// The visible pass is 13500ms; sample across it evenly.
const TRAVEL_MS = 13500;
const step = TRAVEL_MS / FRAMES;

const samples = [];
for (let i = 0; i < FRAMES; i++) {
  const buf = await page.screenshot({
    clip: { x: bb.x, y: bb.y, width: bb.width, height: bb.height },
  });
  const m = await page.evaluate(async (b64) => {
    const img = new Image();
    img.src = "data:image/png;base64," + b64;
    await img.decode();
    const c = document.createElement("canvas");
    c.width = img.width;
    c.height = img.height;
    const ctx = c.getContext("2d");
    ctx.drawImage(img, 0, 0);
    const d = ctx.getImageData(0, 0, c.width, c.height).data;

    // The crown band: the upper third, where the travelling hairline lives.
    const y0 = Math.floor(c.height * 0.12);
    const y1 = Math.floor(c.height * 0.42);
    let sum = 0, n = 0, bright = 0, total = 0;
    // Per-column means, to find WHERE the brightest part is.
    const cols = new Array(c.width).fill(0);
    const colN = new Array(c.width).fill(0);
    for (let y = y0; y < y1; y++) {
      for (let x = 0; x < c.width; x++) {
        const i = (y * c.width + x) * 4;
        const l = 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
        sum += l; n++;
        cols[x] += l; colN[x]++;
      }
    }
    for (let i = 0; i < d.length; i += 4) {
      const l = 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
      if (d[i + 3] > 8) { total++; if (l > 200) bright++; }
    }
    let bestX = 0, bestV = -1;
    for (let x = 0; x < c.width; x++) {
      const v = colN[x] ? cols[x] / colN[x] : 0;
      if (v > bestV) { bestV = v; bestX = x; }
    }
    return {
      crown: sum / n,
      brightFrac: total ? bright / total : 0,
      hairlineX: c.width ? bestX / c.width : 0,
    };
  }, buf.toString("base64"));
  samples.push(m);
  await page.waitForTimeout(step);
}

await browser.close();

console.log(`  frame   crown lum   bright %   hairline x`);
samples.forEach((s, i) => {
  console.log(
    `   ${String(i).padStart(3)}     ${s.crown.toFixed(1).padStart(7)}    ${(s.brightFrac * 100).toFixed(1).padStart(6)}     ${s.hairlineX.toFixed(3)}`,
  );
});

const lums = samples.map((s) => s.crown);
const xs = samples.map((s) => s.hairlineX);
const lo = Math.min(...lums), hi = Math.max(...lums);
const swing = lo > 0.5 ? hi / lo : Infinity;
const travel = Math.max(...xs) - Math.min(...xs);

console.log(`\n  crown luminance   ${lo.toFixed(1)} .. ${hi.toFixed(1)}   swing ${Number.isFinite(swing) ? swing.toFixed(2) + "x" : "inf"}`);
console.log(`  hairline travels  ${(travel * 100).toFixed(1)}% of the pill's width\n`);

/**
 * ⚠ THE 1.3x BAR IS NOT ARBITRARY — it is the swing Carl REJECTED on the opal
 * rig as too flat to see. Anything at or below it has already been judged.
 */
if (swing < 1.3 && travel < 0.08) {
  console.log(`  ⚠⚠ NO VISIBLE SWING. ${Number.isFinite(swing) ? swing.toFixed(2) : "inf"}x brightness and ${(travel * 100).toFixed(1)}% travel.`);
  console.log(`     This is the OPAL RIG'S FAILURE REPEATED — Carl rejected a 1.3x range`);
  console.log(`     there as too flat to see. The reflection is moving in the data and not`);
  console.log(`     in the picture.`);
} else if (travel >= 0.08) {
  console.log(`  ✅ the hairline TRAVELS ${(travel * 100).toFixed(1)}% of the pill's width — it reads as a`);
  console.log(`     light moving past, not a highlight pulsing in place.`);
} else {
  console.log(`  ⚠ IT BRIGHTENS (${swing.toFixed(2)}x) BUT DOES NOT TRAVEL (${(travel * 100).toFixed(1)}%). That reads as a`);
  console.log(`    pulse rather than a passing light. The reference's hairline moves.`);
}

console.log(`\n  ⚠ WHETHER IT LOOKS RIGHT IS CARL'S CALL. This says only what the pixels did.`);
