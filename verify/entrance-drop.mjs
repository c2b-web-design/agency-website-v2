/**
 * What causes the hard drop at the start of the card entrance?
 *
 * ⚠ CARL REPORTED IT BY EYE: *"the choreography on Q5 cards is now wrong. Their
 * appearance is now bullet like instead of smooth."* `verify/entrance-now.mjs`
 * found the shape of it — the card's own fade is smooth (biggest step 6% of the
 * range) but something drops from luminance 16.0 to 4.4 just before it, and the
 * eye reads that vanish-and-restart as a bullet.
 *
 *     0-970ms    16.0   something is drawn
 *     ~972ms      4.4   it disappears
 *     972-2900   4.4 -> 54.4   the real entrance, smooth
 *
 * ⚠ 16.0 IS EXACTLY `GROUND_COLOR` (#101010). So the ground plane is visible,
 * and then something darkens it.
 *
 * ⚠ THE HYPOTHESIS, WHICH THIS TESTS RATHER THAN ASSUMES: it is the transmission
 * pass engaging. The moment the glass face first renders, it samples the
 * transmission target and darkens what was behind it.
 *
 * ⚠ THE FALSIFYING CONTROL: `?clay=1` has NO transmission. If the drop is the
 * transmission pass, clay must NOT show it. If clay shows the same drop, the
 * hypothesis is dead and the cause is elsewhere — probably visibility ordering.
 *
 * This project has been burned twice today by reasoning ahead of measuring, and
 * its standing rule is that a harness which cannot fail is worthless. This one
 * can: the control makes a wrong hypothesis visible.
 *
 *   node verify/entrance-drop.mjs
 */

import { chromium } from "playwright";
import sharp from "sharp";

const browser = await chromium.launch({
  headless: false,
  args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"],
});

async function trace(url, label) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(url, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /begin/i }).click();

  const card = await page
    .getByTestId("answer-card-hover-0")
    .boundingBox({ timeout: 20000 });
  if (!card) throw new Error("card 0 not found");

  const samples = [];
  const t0 = Date.now();
  while (Date.now() - t0 < 3400) {
    const buf = await page.screenshot({ clip: card });
    const { data } = await sharp(buf).greyscale().raw().toBuffer({ resolveWithObject: true });
    let s = 0;
    for (let i = 0; i < data.length; i++) s += data[i];
    samples.push({ t: Date.now() - t0, lum: s / data.length });
  }
  await page.close();

  // The steepest DOWNWARD step is the drop under investigation.
  let worst = { delta: 0, t: 0, from: 0, to: 0 };
  for (let i = 1; i < samples.length; i++) {
    const d = samples[i - 1].lum - samples[i].lum;
    if (d > worst.delta) {
      worst = { delta: d, t: samples[i].t, from: samples[i - 1].lum, to: samples[i].lum };
    }
  }

  console.log(`\n── ${label} ──`);
  console.log(`  samples ${samples.length}`);
  console.log(`  start ${samples[0].lum.toFixed(2)}   end ${samples[samples.length - 1].lum.toFixed(2)}`);
  console.log(
    `  steepest DROP: -${worst.delta.toFixed(2)} at t=${Math.round(worst.t)}ms ` +
      `(${worst.from.toFixed(2)} -> ${worst.to.toFixed(2)})`,
  );
  return worst;
}

const glass = await trace("http://localhost:3000/start", "GLASS (transmission on)");
const clay = await trace("http://localhost:3000/start?clay=1", "CLAY (no transmission) — CONTROL");

console.log("\n─────────────────────────────────────────────");
if (glass.delta > 6 && clay.delta < 3) {
  console.log("CONFIRMED: the drop is the TRANSMISSION PASS engaging.");
  console.log("  Glass drops hard; clay, which has no transmission, does not.");
} else if (clay.delta > 6) {
  console.log("HYPOTHESIS DEAD: clay drops too, so transmission is not the cause.");
  console.log("  Look at visibility ordering instead — something is drawn and");
  console.log("  then hidden, independent of the material.");
} else {
  console.log("INCONCLUSIVE — neither branch matched cleanly. Do not guess from here.");
}

await browser.close();
