/**
 * ⚠⚠ FILM THE WIPE. NO CLOCK, NO DOM, NO ANIMATION API — PIXELS ONLY.
 *
 * Carl, 12 August 2026: *"a noticable pause after the first word… After this
 * pause the rest of the reveal is even. Its like watching a runner who makes a
 * misstep."*
 *
 * ⚠ EVERY PREVIOUS ATTEMPT ASKED THE PAGE HOW IT WAS DOING AND THE PAGE SAID
 * FINE. `wipe-evenness.mjs` sampled the animation's own `currentTime` and found
 * no dip — but **`currentTime` advances on schedule whether or not the frame was
 * painted**, so it measured the clock, not the picture. `corridor-motion.mjs`
 * reads `getBoundingClientRect`, which is layout, not paint. `walk-cost.mjs`
 * reads rAF gaps, which a slow-but-delivered repaint never produces.
 *
 * **All three can be perfectly true while the reveal visibly limps.** Carl has
 * been right and the instruments wrong, repeatedly, and the common thread is
 * that they asked the page instead of looking at it.
 *
 * ⚠ SO THIS RECORDS A SCREENCAST — actual composited output — and measures the
 * revealed text width per captured frame by thresholding pixels. It is the
 * slowest harness here and the only one that sees what a visitor sees.
 *
 *   VERIFY_BASE_URL=http://localhost:3100 node verify/wipe-filmstrip.mjs
 *
 * Writes verify/out/wipe-frames/*.png plus a per-frame edge-position table.
 */

import { chromium } from "@playwright/test";
import { mkdirSync, rmSync, readdirSync } from "node:fs";
import sharp from "sharp";

const BASE = process.env.VERIFY_BASE_URL ?? "http://localhost:3100";
const OUT = "verify/out/wipe-frames";

if (/:3000(\/|$)/.test(BASE)) {
  console.error("\n⚠⚠ REFUSING TO RUN AGAINST :3000.\n");
  process.exit(1);
}

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({
  headless: false,
  args: ["--enable-gpu", "--use-gl=angle", "--ignore-gpu-blocklist"],
});

const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  recordVideo: { dir: OUT, size: { width: 1440, height: 900 } },
});
const page = await context.newPage();

await page.goto(`${BASE}/start`, { waitUntil: "domcontentloaded" });

const renderer = await page.evaluate(() => {
  const gl = document.createElement("canvas").getContext("webgl2");
  if (!gl) return "no webgl";
  const ext = gl.getExtension("WEBGL_debug_renderer_info");
  return ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : "unknown";
});
console.log(`renderer: ${renderer}\nbase:     ${BASE}\n`);

await page.getByRole("button", { name: /begin/i }).click();

// Find the phrase band, then shoot it as fast as the harness allows.
const phrase = page.locator(".enquiry-q-text-reveal").first();
await phrase.waitFor({ state: "attached", timeout: 30000 });
const box = await phrase.boundingBox();
if (!box) {
  console.error("no phrase box");
  await context.close();
  await browser.close();
  process.exit(1);
}

console.log(`phrase band: ${Math.round(box.width)}x${Math.round(box.height)} at (${Math.round(box.x)}, ${Math.round(box.y)})`);
console.log("\nshooting the wipe…");

const shots = [];
const t0 = Date.now();
// ⚠ SHOOT FOR LONGER THAN THE WIPE. A 1300ms animation with ~40-80ms per
// screenshot yields 20-35 samples — coarse, but they are REAL PIXELS, and the
// misstep Carl describes is a sustained pause rather than a single frame.
while (Date.now() - t0 < 2200) {
  const buf = await page.screenshot({ clip: box });
  shots.push({ t: Date.now() - t0, buf });
}

await context.close();
await browser.close();

console.log(`captured ${shots.length} frames over ${shots[shots.length - 1].t}ms\n`);

// Measure how far the text has been revealed: scan columns left→right and find
// the rightmost column containing any non-background pixel.
console.log("   t(ms)   revealed edge (px)   advance since previous");
let prev = null;
const rows = [];
for (const s of shots) {
  const { data, info } = await sharp(s.buf).greyscale().raw().toBuffer({ resolveWithObject: true });
  let edge = 0;
  for (let x = info.width - 1; x >= 0; x--) {
    let bright = 0;
    for (let y = 0; y < info.height; y++) {
      if (data[y * info.width + x] > 60) { bright++; break; }
    }
    if (bright) { edge = x; break; }
  }
  const adv = prev === null ? null : edge - prev;
  rows.push({ t: s.t, edge, adv });
  prev = edge;
}

for (const r of rows) {
  const advTxt = r.adv === null ? "" : String(r.adv).padStart(6) + "px";
  console.log(`  ${String(r.t).padStart(5)}   ${String(r.edge).padStart(14)}   ${advTxt}`);
}

// Where does the advance stall relative to the total travel?
const moving = rows.filter((r) => r.adv !== null && r.adv > 0);
if (moving.length > 3) {
  const total = rows[rows.length - 1].edge - rows[0].edge;
  const typical = [...moving.map((r) => r.adv)].sort((a, b) => a - b)[Math.floor(moving.length / 2)];
  console.log(`\n  total travel ${total}px, typical advance ${typical}px/frame`);
  const stalls = rows.filter(
    (r) => r.adv !== null && r.adv < typical * 0.4 && r.edge > rows[0].edge && r.edge < rows[rows.length - 1].edge,
  );
  if (stalls.length) {
    console.log("\n  ⚠ STALLS (advance well below typical, mid-travel):");
    for (const s of stalls) {
      const pct = total ? Math.round(((s.edge - rows[0].edge) / total) * 100) : 0;
      console.log(`     +${s.t}ms at ${pct}% of travel — advanced only ${s.adv}px`);
    }
  } else {
    console.log("\n  no mid-travel stall detected at this sample rate.");
  }
}

console.log(`\n  video: ${readdirSync(OUT).filter((f) => f.endsWith(".webm")).join(", ") || "(none)"}`);
console.log("\n⚠ THE VIDEO IS THE POINT. Play it back frame by frame and LOOK.");
console.log("  The numbers above are coarse — a screenshot costs 40-80ms, so a");
console.log("  brief pause can fall between samples. The recording cannot.");
