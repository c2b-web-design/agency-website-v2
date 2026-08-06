/**
 * The light fader, every level side by side, in one image.
 *
 * ⚠ THIS EXISTS BECAUSE CARL HAS ONLY EVER SEEN THE SCENE AT 0.35. His words, 5
 * August: *"ive only seen the global light at this one level. I have no terms of
 * reference."* A number cannot supply that and neither can a sweep watched live —
 * **the eye adapts between loads**, so each level looks plausible as it arrives
 * and the comparison is lost.
 *
 * ⚠ SO THE OUTPUT IS ONE IMAGE, NOT SEVEN. Stacked, labelled, same crop, same
 * scale. That is the only arrangement in which "too dark" and "too bright" are
 * statements about the picture rather than about the last thing seen.
 *
 * ⚠ IT ASSERTS NOTHING AND APPROVES NOTHING. It is a contact sheet for Carl's
 * eye. This project's standing lesson is that his eye overrules the instrument;
 * this script's whole job is to give the eye something fair to look at.
 *
 * ⚠ HEADED, WITH --enable-gpu. Headless substitutes SwiftShader, on which the
 * transmission pass does not represent real hardware.
 *
 *   node verify/light-ladder.mjs
 */

import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import sharp from "sharp";

const OUT = "verify/out";
mkdirSync(OUT, { recursive: true });

/**
 * ⚠ WEIGHTED TOWARD THE BOTTOM, BECAUSE THAT IS WHERE THE RESPONSE LIVES.
 * Measured on this scene: 0 -> 0.35 moves the card's edge 159 points; 0.35 -> 2.0
 * moves it 67. Even steps would spend most of the sheet on a region where
 * nothing changes and compress the region where everything does.
 */
const LEVELS = [0.08, 0.12, 0.2, 0.35, 0.5, 0.7, 1.0, 1.5, 2.0];
const CURRENT = 0.35;

const browser = await chromium.launch({
  headless: false,
  args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

const tiles = [];

for (const level of LEVELS) {
  await page.goto(`http://localhost:3000/start?cardrig=1&light=${level}`, {
    waitUntil: "networkidle",
  });

  if (level === LEVELS[0]) {
    const renderer = await page.evaluate(() => {
      const c = document.createElement("canvas");
      const gl = c.getContext("webgl2") || c.getContext("webgl");
      const d = gl && gl.getExtension("WEBGL_debug_renderer_info");
      return d ? gl.getParameter(d.UNMASKED_RENDERER_WEBGL) : "unknown";
    });
    console.log("renderer:", renderer);
    if (/swiftshader|llvmpipe|software/i.test(renderer)) {
      console.log("\n⚠ SOFTWARE RASTERISER — this sheet is not real hardware.\n");
    }
  }

  await page.getByRole("button", { name: /begin/i }).click();
  await page.waitForTimeout(8000);

  const grid = await page.getByTestId("answer-card-proto").boundingBox();
  if (!grid) throw new Error("grid not found — viewport >= 1280?");

  const shot = await page.screenshot({ clip: grid });

  // The label goes on the tile itself. A caption in a separate column would let
  // the two drift apart the moment the sheet is cropped or reordered.
  const mark = level === CURRENT ? "   ← CURRENT" : "";
  const label = Buffer.from(
    `<svg width="${Math.round(grid.width)}" height="34">
       <rect width="100%" height="100%" fill="#000"/>
       <text x="8" y="23" font-family="monospace" font-size="17" fill="#fff">
         lightLevel ${level.toFixed(2)}${mark}
       </text>
     </svg>`,
  );

  tiles.push(
    await sharp({
      create: {
        width: Math.round(grid.width),
        height: Math.round(grid.height) + 34,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 1 },
      },
    })
      .composite([
        { input: label, top: 0, left: 0 },
        { input: shot, top: 34, left: 0 },
      ])
      .png()
      .toBuffer(),
  );

  console.log(`captured ${level.toFixed(2)}`);
}

const meta = await sharp(tiles[0]).metadata();
const sheet = await sharp({
  create: {
    width: meta.width,
    height: meta.height * tiles.length,
    channels: 4,
    background: { r: 0, g: 0, b: 0, alpha: 1 },
  },
})
  .composite(tiles.map((input, i) => ({ input, top: i * meta.height, left: 0 })))
  .png()
  .toBuffer();

await sharp(sheet).toFile(`${OUT}/light-ladder.png`);

console.log(`\nsheet: ${OUT}/light-ladder.png`);
console.log("\n⚠ NO VERDICT HERE. Which level is right is Carl's call.");

await browser.close();
