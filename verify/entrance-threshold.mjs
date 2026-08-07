/**
 * What `ENTRANCE_VISIBLE_AT_LIT` clears the step?
 *
 * The card is glass from its first drawn frame (transmission is NOT ramped --
 * ramping it made the card arrive as an opaque grey slab, which Carl rejected).
 * A transmissive face in a dark scene renders DARKER than the ground plane
 * behind it, so the card must be held until its own light has brought it up to
 * the ground's luminance -- otherwise its first frame is a dark hole.
 *
 * ⚠ THIS SWEEPS THE THRESHOLD VIA A QUERY PARAM RATHER THAN BY EDITING AND
 * REBUILDING FIVE TIMES. `?vislit=` overrides the constant. Each run reports the
 * steepest downward step in the entrance; the answer is the SMALLEST value with
 * no step, because every extra increment delays the card for nothing.
 *
 *   node verify/entrance-threshold.mjs
 */

import { chromium } from "playwright";
import sharp from "sharp";

/**
 * ⚠ THIS HARNESS REPORTED 0.2 AS CLEAN AND IT WAS NOT. Its first version sampled
 * the full 2600ms window with a screenshot per iteration, which is slow enough
 * that whole frames fall between samples — a one-frame step can land in a gap
 * and simply not exist in the data. `verify/entrance-step.mjs`, which prints
 * every step, found a -9.16 the sweep had missed.
 *
 * ⚠ SO IT NOW SAMPLES A NARROW WINDOW AROUND THE ENTRANCE INSTEAD OF THE WHOLE
 * RISE. Same number of screenshots over a quarter of the time is four times the
 * resolution where it matters. **A sweep that cannot see the defect will report
 * every candidate as passing, which is worse than not running it.**
 */
const CANDIDATES = [0.1, 0.2, 0.35, 0.5];

const browser = await chromium.launch({
  headless: false,
  args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"],
});

async function run(vislit) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(`http://localhost:3000/start?vislit=${vislit}`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /begin/i }).click();
  const card = await page.getByTestId("answer-card-hover-0").boundingBox({ timeout: 20000 });
  if (!card) throw new Error("card 0 not found");

  const samples = [];
  const t0 = Date.now();
  while (Date.now() - t0 < 2600) {
    const buf = await page.screenshot({ clip: card });
    const stat = await sharp(buf).greyscale().stats();
    samples.push({ t: Date.now() - t0, lum: stat.channels[0].mean, sd: stat.channels[0].stdev });
  }
  await page.close();

  let worst = { delta: 0, t: 0 };
  for (let i = 1; i < samples.length; i++) {
    const d = samples[i - 1].lum - samples[i].lum;
    if (d > worst.delta) worst = { delta: d, t: samples[i].t };
  }
  // First frame with real structure = the card actually on screen as glass.
  const firstGlass = samples.find((s) => s.sd > 5);
  return { worst, firstGlass };
}

console.log("\n  vislit   steepest drop        first glass frame");
console.log("  ─────────────────────────────────────────────────");
for (const v of CANDIDATES) {
  const { worst, firstGlass } = await run(v);
  const flag = worst.delta > 3 ? "  ⚠ STEP" : "  ok";
  console.log(
    `  ${String(v).padEnd(7)} -${worst.delta.toFixed(2).padStart(6)} at t=${String(worst.t).padStart(4)}ms` +
      `   t=${String(firstGlass ? firstGlass.t : -1).padStart(4)}ms${flag}`,
  );
}

console.log("\n⚠ Take the SMALLEST value with no step. A larger one only delays");
console.log("  the card, and the ladder's 50%-of-reveal timing is measured from");
console.log("  the rung, not from first light.");

await browser.close();
