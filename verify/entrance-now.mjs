/**
 * Is the Q5 card entrance still a fade, or has it become "bullet like"?
 *
 * ⚠ CARL REPORTED THE REGRESSION BY EYE: *"the choreography on Q5 cards is now
 * wrong. Their appearance is now bullet like instead of smooth."* The ladder's
 * TIMING is unchanged — 560ms gaps, 28% of the 2000ms rise, verified against the
 * constants — so the fault is in what each card DOES on its rung, not when.
 *
 * ⚠ THE LIKELY CAUSE, WHICH THIS MEASURES RATHER THAN ASSUMES. The card cannot
 * fade by opacity: `material.opacity` needs `transparent = true`, which routes
 * the rim and bevel out of the transmission target. So the fade is entirely
 * `CardLighting` multiplying each material's COLOUR and `envMapIntensity` by the
 * entrance progress — the card is dark and lights up.
 *
 * That works when the card is near-black at rest. **Today's rebuild changed what
 * the card looks like when fully lit**, and if the card now reads bright at low
 * progress, the "fade" collapses into an appearance.
 *
 * So: sample one card's mean luminance every 60ms across its rung and print the
 * curve. A smooth entrance climbs; a bullet jumps.
 *
 *   node verify/entrance-now.mjs
 */

import { chromium } from "playwright";
import sharp from "sharp";

const RISE_MS = 2000;
/** Card 1's rung, from CARD_RISE_LADDER_MS. */
const CARD1_DELAY_MS = 650;

const browser = await chromium.launch({
  headless: false,
  args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

await page.goto("http://localhost:3000/start", { waitUntil: "networkidle" });

// ⚠ THE ENTRANCE WAITS FOR THE SHADER COMPILE, so its clock does not start at
// the Begin click. `card-canvas-compiled` is the mark the choreography gates on.
await page.evaluate(() => {
  window.__marks = [];
  const obs = new PerformanceObserver((l) => {
    for (const e of l.getEntries()) window.__marks.push({ name: e.name, t: e.startTime });
  });
  obs.observe({ entryTypes: ["mark"] });
});

await page.getByRole("button", { name: /begin/i }).click();

const card = await page
  .getByTestId("answer-card-hover-0")
  .boundingBox({ timeout: 20000 });
if (!card) throw new Error("card 0 not found");

// Sample continuously from just before card 1's rung to well past its rise.
const samples = [];
const t0 = Date.now();
const DURATION = CARD1_DELAY_MS + RISE_MS + 1200;

while (Date.now() - t0 < DURATION) {
  const buf = await page.screenshot({ clip: card });
  const { data } = await sharp(buf).greyscale().raw().toBuffer({ resolveWithObject: true });
  let s = 0;
  for (let i = 0; i < data.length; i++) s += data[i];
  samples.push({ t: Date.now() - t0, lum: s / data.length });
}

console.log(`\n${samples.length} samples across ${DURATION}ms\n`);
console.log("   t(ms)   luminance   bar");
let prev = null;
let biggestJump = { from: 0, to: 0, delta: 0, t: 0 };
for (const s of samples) {
  const bar = "#".repeat(Math.round(s.lum));
  console.log(`${String(Math.round(s.t)).padStart(8)}   ${s.lum.toFixed(2).padStart(8)}   ${bar}`);
  if (prev !== null) {
    const d = s.lum - prev;
    if (d > biggestJump.delta) biggestJump = { from: prev, to: s.lum, delta: d, t: s.t };
  }
  prev = s.lum;
}

const lo = Math.min(...samples.map((s) => s.lum));
const hi = Math.max(...samples.map((s) => s.lum));
console.log(`\nrange ${lo.toFixed(2)} .. ${hi.toFixed(2)}   (span ${(hi - lo).toFixed(2)})`);
console.log(
  `biggest single step: +${biggestJump.delta.toFixed(2)} at t=${Math.round(biggestJump.t)}ms ` +
    `(${biggestJump.from.toFixed(2)} -> ${biggestJump.to.toFixed(2)})`,
);
console.log(
  `that step is ${((biggestJump.delta / (hi - lo)) * 100).toFixed(0)}% of the whole range`,
);
console.log(`
⚠ READING IT: a smooth 2000ms rise spread over these samples should move in
  small increments. A single step carrying a large share of the range is the
  "bullet like" appearance -- the card arriving rather than fading in.
`);

await browser.close();
