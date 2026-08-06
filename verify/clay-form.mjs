/**
 * The card's FORM — opaque, shadowed, under one orbiting light.
 *
 * ⚠ CARL SPECIFIED THIS IN THREE STEPS, 5 August 2026, and the last supersedes
 * the others:
 *   1. *"i will have no way of knowing if its right if its clear glass... ramp
 *      it up so i can see something more substantial and then shine a light on
 *      it so i can zoom in and check."*
 *   2. *"Enable shadows and the placement of a light is all important. Dont use
 *      global illumination, just focus on card 1."*
 *   3. *"instead of 3 ref points, animate the light on an 8 second loop showing
 *      a multitude of angles to best see the geometry."*
 *
 * ⚠ THE REASON ANY OF IT IS NEEDED: *"parts dont exist and its difficult to tell
 * whether something exists in total darkness and no light can illuminate
 * something that is not there."* A 5.00-unit unmodelled step at the bevel/face
 * seam survived several sessions of lighting work because a dark transmissive
 * card looks identical whether a surface is present or absent.
 *
 * ⚠ THIS SCRIPT SAMPLES THE LOOP; THE PAGE IS THE REAL INSTRUMENT. A strip of
 * stills is for the record and for zooming. **The moving version at
 * `http://localhost:3000/start?clay=1` is what actually answers the question**,
 * because a surface announces itself by how its shading CHANGES.
 *
 * ⚠ IT REPORTS NOTHING AND APPROVES NOTHING. It is a render for Carl's eye.
 *
 *   node verify/clay-form.mjs
 */

import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import sharp from "sharp";

const OUT = "verify/out";
mkdirSync(OUT, { recursive: true });

/**
 * ⚠ THE SAMPLE INTERVAL MUST NOT DIVIDE THE LOOP EVENLY.
 *
 * A first version took 8 samples 1000ms apart on an 8000ms loop, which is
 * phase-locked: every run reproduced the SAME eight instants, so the sheet came
 * back byte-identical after three separate constant changes. That looked like a
 * stale build and cost two wrong diagnoses before `verify/probe-clay-motion.mjs`
 * showed the light was moving all along (spread 19.9 luminance).
 *
 * ⚠ THE LESSON IS THE ONE THIS PROJECT KEEPS RELEARNING: a harness whose
 * sampling shares a period with the thing it samples cannot see that thing move.
 * Same family as the q5-stutter window sharing its constant with the fix.
 *
 * 970ms against an 8000ms loop drifts the phase every cycle, so the sheet covers
 * the orbit rather than one repeated slice of it.
 */
const FRAMES = 8;
const SAMPLE_MS = 2400;
const LOOP_MS = 20000;

const browser = await chromium.launch({
  headless: false,
  args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"],
});
// ⚠ deviceScaleFactor 3 — the card is 48px tall, so the ~3-unit bevel and the
// seam are only a few device pixels at 1x. The whole point is to zoom in.
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 3,
});

await page.goto("http://localhost:3000/start?clay=1", { waitUntil: "networkidle" });

const renderer = await page.evaluate(() => {
  const c = document.createElement("canvas");
  const gl = c.getContext("webgl2") || c.getContext("webgl");
  const d = gl && gl.getExtension("WEBGL_debug_renderer_info");
  return d ? gl.getParameter(d.UNMASKED_RENDERER_WEBGL) : "unknown";
});
console.log("renderer:", renderer);
if (/swiftshader|llvmpipe|software/i.test(renderer)) {
  console.log("\n⚠ SOFTWARE RASTERISER — shadows and shading are not real hardware.\n");
}

await page.getByRole("button", { name: /begin/i }).click();
await page.waitForTimeout(9000);

const card = await page.getByTestId("answer-card-hover-0").boundingBox();
if (!card) throw new Error("card 0 not found — viewport >= 1280?");

// ⚠ A MARGIN FOR THE SHADOW, BUT TIGHT — the first run used ±40px and the frame
// filled with the Q5 heading and empty page while the card itself was a sliver.
// The cast shadow falls close to the card at these light angles, so 14px is
// enough to keep it and nothing else.
const shot = {
  x: Math.max(0, card.x - 14),
  y: Math.max(0, card.y - 14),
  width: card.width + 28,
  height: card.height + 28,
};

const tiles = [];
for (let i = 0; i < FRAMES; i++) {
  const buf = await page.screenshot({ clip: shot });
  const big = await sharp(buf)
    .resize({ width: Math.round(shot.width * 2), kernel: "lanczos3" })
    .png()
    .toBuffer();
  const m = await sharp(big).metadata();

  // ⚠ THE LABEL IS DERIVED FROM THE ARC THE PAGE ACTUALLY FLIES. An earlier
  // version still described the vertical sweep it replaced, so a correct sheet
  // carried captions contradicting it — a mislabelled instrument is worse than
  // an unlabelled one.
  const p = ((i * SAMPLE_MS) % (LOOP_MS * 2)) / LOOP_MS;
  const tri = p <= 1 ? p : 2 - p;
  const deg = Math.round(tri * 180);
  const side = deg < 60 ? "RIGHT, low" : deg > 120 ? "LEFT, low" : "OVER THE TOP";
  const label = Buffer.from(
    `<svg width="${m.width}" height="26">
       <rect width="100%" height="100%" fill="#000"/>
       <text x="6" y="19" font-family="monospace" font-size="14" fill="#fff">arc ${deg}°  ${side}</text>
     </svg>`,
  );

  tiles.push(
    await sharp({
      create: { width: m.width, height: m.height + 26, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 1 } },
    })
      .composite([{ input: label, top: 0, left: 0 }, { input: big, top: 26, left: 0 }])
      .png()
      .toBuffer(),
  );

  console.log(`frame ${i + 1}/${FRAMES}  light y ${yPos}  ${state}`);
  if (i < FRAMES - 1) await page.waitForTimeout(SAMPLE_MS);
}

// Two rows of four, so the sheet is readable rather than a long thin strip.
const tm = await sharp(tiles[0]).metadata();
const perRow = 4;
const rowBufs = [];
for (let r = 0; r < Math.ceil(tiles.length / perRow); r++) {
  const rowTiles = tiles.slice(r * perRow, (r + 1) * perRow);
  rowBufs.push(
    await sharp({
      create: { width: tm.width * perRow, height: tm.height, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 1 } },
    })
      .composite(rowTiles.map((input, i) => ({ input, top: 0, left: i * tm.width })))
      .png()
      .toBuffer(),
  );
}

await sharp({
  create: {
    width: tm.width * perRow,
    height: tm.height * rowBufs.length,
    channels: 4,
    background: { r: 0, g: 0, b: 0, alpha: 1 },
  },
})
  .composite(rowBufs.map((input, i) => ({ input, top: i * tm.height, left: 0 })))
  .png()
  .toFile(`${OUT}/clay-form.png`);

console.log(`
sheet: ${OUT}/clay-form.png

⚠ WATCH THE MOVING VERSION — that is the instrument:
    http://localhost:3000/start?clay=1

⚠ WHAT THE RENDER IS SHOWING. Three greys, so the parts are tellable apart:
    light   the rim's half-tube
    mid     the face
    dark    the bevel

⚠ THE QUESTION. Reading inward from the top edge: does the bevel's inner edge
  CONTINUE into the face's rise, or is there a break? The cross-section maths
  predicts a 5.00-unit step with nothing modelled across it
  (verify/cross-section.mjs). This is the render that confirms or refutes it.
`);

await browser.close();
