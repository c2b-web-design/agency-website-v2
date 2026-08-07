/**
 * Prints EVERY step in the card's entrance, so a discontinuity cannot hide
 * inside a summary statistic.
 *
 *   node verify/entrance-step.mjs
 *
 * ⚠ THIS IS THE HARNESS THAT ACTUALLY FOUND THE "BULLET" ENTRANCE, AND WHY IT
 * EXISTS IS THE POINT. `verify/entrance-drop.mjs` reports only the single
 * steepest drop; that was enough to prove SOMETHING dropped, and not enough to
 * see the shape of it. Listing every sample showed two separate events:
 *
 *     t= 254ms   16.00 -> 4.65 -> 16.00    a ONE-FRAME flash, ~680ms early
 *     t= 932ms   16.00 -> 4.64             the entrance's own first frame
 *
 * The early flash is the `useScenePrecompile` warm-up render, which reveals the
 * hidden cards for one frame to force the transmission pass to allocate. It was
 * invisible while the lockup sat behind the cards at fade 0; once the lockup was
 * removed on 6 August the ground plane (#101010, luminance 16) became the
 * backdrop and an unlit card started reading as a black hole in it.
 *
 * ⚠ AND A SAVED FRAME SETTLED IT WHERE NUMBERS COULD NOT. Screenshotting the
 * instant of the drop showed a hard-edged black rounded rectangle — the card's
 * own silhouette. Not a dimming, not a fade: an unlit object drawn over a
 * lighter one. **When a number says "something got darker", save the frame and
 * look at what it actually is.**
 */

import { chromium } from "playwright";
import sharp from "sharp";

const browser = await chromium.launch({
  headless: false,
  args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

await page.goto("http://localhost:3000/start", { waitUntil: "networkidle" });
await page.getByRole("button", { name: /begin/i }).click();
const card = await page.getByTestId("answer-card-hover-0").boundingBox({ timeout: 20000 });
if (!card) throw new Error("card 0 not found");

const samples = [];
const t0 = Date.now();
while (Date.now() - t0 < 2000) {
  const buf = await page.screenshot({ clip: card });
  const { data } = await sharp(buf).greyscale().raw().toBuffer({ resolveWithObject: true });
  let s = 0;
  for (let i = 0; i < data.length; i++) s += data[i];
  samples.push({ t: Date.now() - t0, lum: s / data.length });
}

console.log("luminance around the drop:\n");
for (let i = 1; i < samples.length; i++) {
  const d = samples[i].lum - samples[i - 1].lum;
  const mark = Math.abs(d) > 3 ? "   <<< STEP" : "";
  console.log(
    `  t=${String(samples[i].t).padStart(4)}ms  lum=${samples[i].lum.toFixed(2).padStart(6)}  d=${d >= 0 ? "+" : ""}${d.toFixed(2)}${mark}`,
  );
}

await browser.close();
