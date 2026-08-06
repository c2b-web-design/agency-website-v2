/**
 * What luminance does the card's area settle at, and what does the bare ground
 * read before it?
 *
 * ⚠ THE DEFECT THIS SERVES. The card's entrance is smooth on its own, but the
 * area jumps from 16.0 to 4.6 the instant the glass first renders — the
 * transmission pass engaging, confirmed against a no-transmission control in
 * `verify/entrance-drop.mjs` (glass -11.36, clay -0.53). **The card does not
 * fade in; it punches a dark hole and then brightens out of it**, and that
 * discontinuity is what Carl sees as *"bullet like"*.
 *
 * ⚠ SO THE FIX IS TO REMOVE THE STEP, NOT TO RETIME ANYTHING. If what is on
 * screen before the card arrives already matches what the card's first frame
 * looks like, there is nothing to jump.
 *
 * This reports the two numbers that decides that:
 *   - the bare ground, before any card renders
 *   - the card's area at entrance progress 0 (its first drawn frame)
 *
 *   node verify/ground-match.mjs
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

const card = await page
  .getByTestId("answer-card-hover-0")
  .boundingBox({ timeout: 20000 });
if (!card) throw new Error("card 0 not found");

async function lum() {
  const buf = await page.screenshot({ clip: card });
  const { data } = await sharp(buf).greyscale().raw().toBuffer({ resolveWithObject: true });
  let s = 0;
  for (let i = 0; i < data.length; i++) s += data[i];
  return s / data.length;
}

const trace = [];
const t0 = Date.now();
while (Date.now() - t0 < 3400) trace.push({ t: Date.now() - t0, lum: await lum() });

// The bare ground is the plateau before the drop; the card's floor is the value
// immediately after it.
let dropIdx = 0;
let worst = 0;
for (let i = 1; i < trace.length; i++) {
  const d = trace[i - 1].lum - trace[i].lum;
  if (d > worst) { worst = d; dropIdx = i; }
}

const bareGround = trace[dropIdx - 1].lum;
const cardFloor = trace[dropIdx].lum;
const settled = trace[trace.length - 1].lum;

console.log(`
bare ground, before any card renders   ${bareGround.toFixed(2)}
card's area on its FIRST drawn frame   ${cardFloor.toFixed(2)}
card settled at the end of the rise    ${settled.toFixed(2)}

the step the eye sees                  ${(bareGround - cardFloor).toFixed(2)}
`);

// GROUND_COLOR is #101010 -> 16. Solve for the value whose rendered luminance
// through the glass matches the card's floor, so nothing jumps.
const GROUND_SRGB = 0x10;
const ratio = cardFloor / bareGround;
const target = Math.max(0, Math.round(GROUND_SRGB * ratio));
const hex = target.toString(16).padStart(2, "0");

console.log(`GROUND_COLOR is currently #101010 (${GROUND_SRGB} per channel).`);
console.log(`The card's first frame reads ${(ratio * 100).toFixed(0)}% of the bare ground.`);
console.log(`\nA ground of #${hex}${hex}${hex} would render at the card's floor,`);
console.log(`so the card's arrival would introduce no step at all.`);
console.log(`
⚠ BUT CHECK THE COST BEFORE APPLYING IT. GROUND_COLOR is sampled to match the
  page's own radial gradient at the grid's rows, so darkening it makes the plane
  visible as a rectangle against the page -- the exact defect Carl caught once
  before: "I can see the black rectangle the text is sitting in."
`);

await browser.close();
