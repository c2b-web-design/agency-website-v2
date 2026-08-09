/**
 * The card's EDGE — does the face resolve into a rim, or fall off a cliff?
 *
 *   node verify/card-edge.mjs
 *
 * ⚠ THE TRAVELLER IS OFF (`?travint=0`) AND THAT IS THE POINT. Carl, 9 August:
 * *"Fixing this without the orbital light so the problem is resolved might be
 * better. Then if you make any changes to the orbital light and black edges
 * return, then its a deeper problem."*
 *
 * **That is an isolation instruction, not a preference.** With a moving light in
 * the scene every edge reading is a function of where the light happens to be,
 * so a fix and a coincidence look identical. With it off, the static rig alone
 * has to make the edge read — and if it does, any later regression is
 * attributable to the traveller rather than to the material.
 *
 * ⚠ WHAT IT MEASURES: a horizontal luminance profile straight through a card,
 * from outside its left edge to outside its right. A face that "floats" shows a
 * CLIFF — high on the face, near-zero immediately outside, with nothing between.
 * A face that sits in a rim shows a SHOULDER: the rim catches light and forms a
 * bright or mid-tone band between the face and the background.
 */

import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const OUT = "verify/out/card-edge";
mkdirSync(OUT, { recursive: true });

const BASE = process.env.VERIFY_BASE_URL ?? "http://localhost:3000";

const browser = await chromium.launch({
  headless: false,
  args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });

await page.goto(`${BASE}/start?travint=0`, { waitUntil: "networkidle" });

const renderer = await page
  .evaluate(() => {
    const c = document.createElement("canvas");
    const gl = c.getContext("webgl2") || c.getContext("webgl");
    const d = gl && gl.getExtension("WEBGL_debug_renderer_info");
    return d ? gl.getParameter(d.UNMASKED_RENDERER_WEBGL) : "unknown";
  })
  .catch(() => "unknown");
console.log("renderer:", renderer);
if (/swiftshader|llvmpipe|software/i.test(String(renderer))) {
  console.error("\n⚠ ABORTING — software rasteriser.");
  await browser.close();
  process.exit(1);
}

const begin = page.getByRole("button", { name: /begin/i });
await begin.waitFor({ state: "visible", timeout: 20000 });
await begin.click();
await page.waitForTimeout(4500);

/**
 * ⚠ THE CARD IS NOT IN THE DOM. Its label was moved into the face's albedo
 * texture on 9 August, so there is no element with the answer text to anchor to
 * — a first version of this harness searched for one and found nothing. (That
 * absence is also the recorded accessibility debt: the visible text is a
 * texture and is not in the a11y tree.)
 *
 * ⚠ SO THE ANCHOR IS THE CANVAS PLUS THE SHIPPED GEOMETRY, not a guess. The
 * canvas is one CSS pixel per world unit under an orthographic camera at
 * `zoom: 1`, and card 1 sits at a known slot — so its screen rect is derivable
 * rather than estimated. A crop derived from a guess is a screenshot of the
 * guess.
 */
const card = await page.evaluate(() => {
  const cs = [...document.querySelectorAll("canvas")];
  if (!cs.length) return null;
  const r = cs.map((c) => c.getBoundingClientRect()).sort((a, b) => b.width * b.height - a.width * a.height)[0];
  // Card 1: 186.66 x 48 world units, top row, left slot. The grid is 576 wide
  // and centred on the canvas; the top row sits above centre.
  const W = 186.66;
  const H = 48;
  const cx = r.x + r.width / 2 - 192; // left slot centre, 192 units left of middle
  const cy = r.y + r.height / 2 - 28; // top row, 28 units above middle
  return { x: cx - W / 2, y: cy - H / 2, width: W, height: H };
});

if (!card) {
  console.log("\n⚠ could not find card 1 in the DOM — nothing to anchor the profile to.");
  await browser.close();
  process.exit(1);
}

console.log(
  `\ncard 1: ${Math.round(card.width)}x${Math.round(card.height)} at (${Math.round(card.x)}, ${Math.round(card.y)})\n`,
);

// A generous margin either side so the profile starts and ends on background.
const M = 40;
const clip = {
  x: Math.max(0, card.x - M),
  y: card.y,
  width: card.width + M * 2,
  height: card.height,
};
await page.screenshot({ path: `${OUT}/card1-strip.png`, clip });

const profile = await page.evaluate(async ({ b64 }) => {
  const img = new Image();
  img.src = "data:image/png;base64," + b64;
  await img.decode();
  const c = document.createElement("canvas");
  c.width = img.width;
  c.height = img.height;
  const x = c.getContext("2d");
  x.drawImage(img, 0, 0);
  /**
   * ⚠ NOT THE MIDDLE ROW — THAT CUTS THROUGH THE LABEL. The answer text is drawn
   * into the face's albedo, so a profile across the card's centre samples
   * glyphs, and the first run of this harness produced a violently oscillating
   * trace (18, 170, 103, 77, 21, ...) that says nothing about the edge. Sampling
   * at 22% of the height stays on clear face above the text.
   */
  const row = Math.floor(img.height * 0.22);
  const d = x.getImageData(0, row, img.width, 1).data;
  const out = [];
  for (let i = 0; i < img.width; i++) {
    const o = i * 4;
    out.push(0.2126 * d[o] + 0.7152 * d[o + 1] + 0.0722 * d[o + 2]);
  }
  return out;
}, { clip, b64: (await page.screenshot({ clip })).toString("base64") });

// Print the profile as a chart, downsampled to a readable width.
const COLS = 96;
const step = profile.length / COLS;
console.log("horizontal luminance through the middle of card 1 (traveller OFF):\n");
for (let i = 0; i < COLS; i++) {
  const v = profile[Math.floor(i * step)];
  const bar = "#".repeat(Math.round((v / 255) * 60));
  const px = Math.round(i * step);
  console.log(`  ${String(px).padStart(4)}  ${v.toFixed(0).padStart(3)}  ${bar}`);
}

// The edge question, stated numerically.
const bg = Math.min(...profile.slice(0, 12), ...profile.slice(-12));
const peak = Math.max(...profile);
const faceStart = profile.findIndex((v) => v > bg + (peak - bg) * 0.5);
const faceEnd = profile.length - 1 - [...profile].reverse().findIndex((v) => v > bg + (peak - bg) * 0.5);
console.log(`\n  background ${bg.toFixed(1)}   peak ${peak.toFixed(1)}`);
console.log(`  half-height crossings at px ${faceStart} and ${faceEnd}`);

// How many pixels does it take to climb from background to the face?
let riseStart = -1;
for (let i = 0; i < profile.length; i++) {
  if (profile[i] > bg + 2 && riseStart < 0) riseStart = i;
  if (riseStart >= 0 && profile[i] > bg + (peak - bg) * 0.9) {
    console.log(`  rise from background to 90% takes ${i - riseStart}px`);
    break;
  }
}
console.log(
  `\n  ⚠ A CLIFF (a very short rise, no shoulder) is the "floating" look.\n` +
    `    A rim reads as a distinct band between background and face.\n`,
);

await browser.close();
