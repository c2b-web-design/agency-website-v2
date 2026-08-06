/**
 * Did the lockup actually leave, and do the cards still read as glass?
 *
 * ⚠ THE SECOND QUESTION IS THE REAL ONE. Removing the lockup is easy to verify —
 * the blue/teal ink is either behind the cards or it is not. The risk recorded
 * before the cut is that the cards *"read as dark slabs and only become glass
 * when the lockup lights behind them"*, and a flat ground gives the glass nothing
 * distinctive to refract.
 *
 * ⚠ SO THIS SCRIPT DOES NOT ASSERT AN APPROVAL. It reports two numbers and takes
 * a screenshot for Carl's eye. His eye overruled the instruments three times on
 * 5 August and was right each time; a "PASS" printed here would be the same
 * mistake the glass-filter harness made.
 *
 * ⚠ HEADED, WITH --enable-gpu. Headless substitutes SwiftShader, on which the
 * transmission pass does not represent real hardware. The renderer string is
 * printed so a SwiftShader run cannot be mistaken for a real one.
 *
 *   node verify/lockup-removed.mjs
 */

import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const OUT = "verify/out";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({
  headless: false,
  args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

await page.goto("http://localhost:3000/start", { waitUntil: "networkidle" });

const renderer = await page.evaluate(() => {
  const c = document.createElement("canvas");
  const gl = c.getContext("webgl2") || c.getContext("webgl");
  if (!gl) return "no webgl";
  const dbg = gl.getExtension("WEBGL_debug_renderer_info");
  return dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : "unknown";
});
console.log("renderer:", renderer);
if (/swiftshader|llvmpipe|software/i.test(renderer)) {
  console.log("\n⚠ SOFTWARE RASTERISER — these numbers do not describe real hardware.\n");
}

// Begin, then wait out the five-beat entrance. ENTRANCE_END_MS is 4890 since the
// lockup's sixth beat was removed; a margin on top so the cards have settled.
await page.getByRole("button", { name: /begin/i }).click();
await page.waitForTimeout(9000);

const grid = await page.getByTestId("answer-card-proto").boundingBox();
if (!grid) throw new Error("answer grid not found — is the viewport >= 1280?");

await page.screenshot({ path: `${OUT}/lockup-removed-grid.png`, clip: grid });
await page.screenshot({ path: `${OUT}/lockup-removed-page.png` });

/**
 * Two measurements, both read off the same rendered pixels.
 *
 * 1. LOCKUP INK — how much of the grid is the lockup's blue/teal. The lockup's
 *    colours were #1b4fa8 and #00c8e0: strongly saturated, with blue or green
 *    dominant. A near-black ground has neither. This should now be ~0.
 *
 * 2. CARD CONTRAST — the spread of luminance inside a card box. This is the
 *    "do they still read as glass" number, and it is REPORTED, NOT ASSERTED:
 *    a flat slab has a narrow spread, a lens has a wide one, and where the
 *    boundary sits between them is a matter for Carl's eye, not a threshold
 *    invented here.
 */
const stats = await page.evaluate(async () => {
  const shot = document.querySelector('[data-testid="answer-card-proto"] canvas');
  if (!shot) return { error: "no canvas inside the proto container" };

  const w = shot.width;
  const h = shot.height;
  const tmp = document.createElement("canvas");
  tmp.width = w;
  tmp.height = h;
  const ctx = tmp.getContext("2d");
  ctx.drawImage(shot, 0, 0);
  const d = ctx.getImageData(0, 0, w, h).data;

  // ⚠ A WEBGL CANVAS READS BACK BLANK UNLESS ITS BUFFER IS STILL ALIVE. With
  // `preserveDrawingBuffer: false` (the default) the backbuffer is cleared after
  // each composite, so drawImage can capture an empty canvas even while the page
  // looks correct. Report the canvas size and opaque count so a blank read is
  // distinguishable from genuinely dark cards.
  let opaque = 0;
  for (let i = 3; i < d.length; i += 4) if (d[i] > 8) opaque++;
  if (opaque === 0) {
    return { error: "canvas read back fully transparent", w, h };
  }

  let saturatedCool = 0;
  let total = 0;
  const lums = [];

  for (let i = 0; i < d.length; i += 4) {
    const r = d[i], g = d[i + 1], b = d[i + 2], a = d[i + 3];
    if (a < 8) continue;
    total++;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const sat = max === 0 ? 0 : (max - min) / max;
    // The lockup's ink: saturated, and blue or green leading red.
    if (sat > 0.35 && max > 40 && (b > r + 20 || g > r + 20)) saturatedCool++;
    lums.push(0.2126 * r + 0.7152 * g + 0.0722 * b);
  }

  lums.sort((a, b) => a - b);
  const pct = (p) => lums[Math.floor((lums.length - 1) * p)];

  return {
    total,
    coolInkPct: total ? (100 * saturatedCool) / total : 0,
    p05: pct(0.05),
    p50: pct(0.5),
    p95: pct(0.95),
    spread: pct(0.95) - pct(0.05),
  };
}, grid);

if (!stats || stats.error) {
  console.log(`\n⚠ IN-PAGE READ FAILED: ${stats ? stats.error : "no result"}`);
  console.log("  Falling back to the screenshot, which captures the composited");
  console.log("  frame rather than the live backbuffer.");
} else {
  console.log("\n── lockup ink ──");
  console.log(`saturated blue/teal pixels: ${stats.coolInkPct.toFixed(2)}%`);
  console.log("  (the lockup was #1b4fa8 / #00c8e0 — this should be ~0 now)");

  console.log("\n── card contrast, REPORTED not asserted ──");
  console.log(`luminance p05 ${stats.p05.toFixed(1)}  p50 ${stats.p50.toFixed(1)}  p95 ${stats.p95.toFixed(1)}`);
  console.log(`spread ${stats.spread.toFixed(1)}`);
}
console.log("\n  ⚠ NO VERDICT. Whether the cards still read as glass is Carl's");
console.log("    call on the screenshot, not this number's.");
console.log(`\nscreenshots: ${OUT}/lockup-removed-grid.png, ${OUT}/lockup-removed-page.png`);

await browser.close();
