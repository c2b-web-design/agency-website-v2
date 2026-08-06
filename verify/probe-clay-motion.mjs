/**
 * Is the clay study's light actually moving?
 *
 * ⚠ WRITTEN BECAUSE THE FORM SHEET CAME BACK BYTE-IDENTICAL AFTER THREE VALUE
 * CHANGES AND A CONFIRMED RECOMPILE. Orbit radius, z range, exposure and a new
 * ambient were all edited and verified present in the source; the render did not
 * move a pixel. That rules out staleness and points at the harness or the loop.
 *
 * ⚠ THE TRAP THIS AVOIDS IS ONE THIS PROJECT HAS ALREADY PAID FOR TWICE: a
 * harness that cannot fail. `verify/q5-stutter.mjs` reported 0/3 CLEAN on a
 * visible defect, and the glass-filter harness could not separate the filter
 * from rim bleed. **Before trusting any reading from the form sheet, show that
 * the thing it measures CAN change.**
 *
 * Sampling the same crop at intervals: if the light orbits on an 8s loop, mean
 * luminance must differ between reads. If it does not, the rAF loop is dead and
 * every frame of that sheet is the same instant — which would explain identical
 * output regardless of what the constants say.
 *
 *   node verify/probe-clay-motion.mjs
 */

import { chromium } from "playwright";
import sharp from "sharp";

const browser = await chromium.launch({
  headless: false,
  args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

const errs = [];
page.on("console", (m) => { if (m.type() === "error") errs.push(m.text()); });
page.on("pageerror", (e) => errs.push("PAGEERROR: " + e.message));

await page.goto("http://localhost:3000/start?clay=1", { waitUntil: "networkidle" });
await page.getByRole("button", { name: /begin/i }).click();
await page.waitForTimeout(9000);

const info = await page.evaluate(() => {
  const c = document.querySelector('[data-testid="answer-card-proto"] canvas');
  return {
    hasCanvas: !!c,
    canvasW: c ? c.width : null,
    hoverTargets: document.querySelectorAll('[data-testid^="answer-card-hover-"]').length,
  };
});
console.log("page state:", JSON.stringify(info));
console.log("errors:", errs.length ? "\n  " + errs.slice(0, 6).join("\n  ") : "none");

const card = await page.getByTestId("answer-card-hover-0").boundingBox();
if (!card) throw new Error("card 0 not found");

async function mean() {
  const buf = await page.screenshot({ clip: card });
  const { data } = await sharp(buf).greyscale().raw().toBuffer({ resolveWithObject: true });
  let s = 0;
  for (let i = 0; i < data.length; i++) s += data[i];
  return s / data.length;
}

const reads = [];
for (let i = 0; i < 5; i++) {
  reads.push(await mean());
  if (i < 4) await page.waitForTimeout(1600);
}

console.log("\nmean luminance, 1.6s apart:");
reads.forEach((r, i) => console.log(`  t=${(i * 1.6).toFixed(1)}s   ${r.toFixed(3)}`));

const spread = Math.max(...reads) - Math.min(...reads);
console.log(`\nspread ${spread.toFixed(3)}`);
console.log(
  spread < 0.5
    ? ">>> THE LIGHT IS NOT MOVING. The rAF loop is not running, so every frame\n" +
      "    of the form sheet is the same instant and no constant change can show."
    : ">>> the light IS moving; the identical sheets have another cause.",
);

await browser.close();
