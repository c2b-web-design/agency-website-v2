/**
 * The frosted body and the polished coat, swept as a PAIR.
 *
 * ⚠ A GRID, NOT TWO LADDERS, AND THAT IS THE WHOLE DESIGN OF THIS HARNESS. The
 * two values are the body and the skin of one surface: roughness scatters light
 * across the face, the coat holds a crisp glint on top of it. Sweeping either
 * alone measures it against a moving reference — the trap this project has
 * already recorded (the frost value was chosen while the transmission target was
 * clearing to white, so it was tuned against a broken subject).
 *
 * ⚠ WHAT IT IS TESTING. Three independent sources agreed this session: Carl's
 * reading of the reference sheets (*"the glint where the light catches the edge,
 * but the distribution of light is like a gradient on frosted glass"*), Gemini's
 * material config (`clearcoat: 1.0`, `clearcoatRoughness: 0.1`, roughness 0.3),
 * and 2026 CSS practice ("surface transduction"). **None of them were looking at
 * our geometry**, which is a near-flat face under an ORTHOGRAPHIC camera — where
 * the file already records that the specular selling "glass" barely exists
 * except in a thin band at the crown's edge. So the agreement is a hypothesis
 * here, not a finding.
 *
 * ⚠ IT REPORTS AND SCREENSHOTS. IT DOES NOT APPROVE. Carl's eye has overruled
 * the instrument repeatedly on this material and been right each time.
 *
 * ⚠ HEADED, WITH --enable-gpu. Headless substitutes SwiftShader.
 *
 *   node verify/frost-and-coat.mjs
 */

import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import sharp from "sharp";

const OUT = "verify/out";
mkdirSync(OUT, { recursive: true });

/**
 * ⚠ 0.08 IS TODAY'S VALUE AND IS INCLUDED AS THE CONTROL. Without it the sheet
 * would show four unfamiliar cards and no way to tell whether any is better than
 * what we already have.
 *
 * The upper end is 0.35 rather than 0.45: chunk 2 measured legibility gone by
 * 0.60 and still fine at 0.45, and the cards are to carry ANSWER TEXT — the one
 * rule every 2026 source agreed on is never to put body text on raw glass.
 */
const ROUGHNESS = [0.08, 0.2, 0.3, 0.4];
/** 0 is today's face — no coat at all. 1.0 is Gemini's recommendation. */
const COAT = [0, 0.5, 1.0];
const COAT_ROUGHNESS = 0.1;

const browser = await chromium.launch({
  headless: false,
  args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

const rows = [];
let first = true;

for (const coat of COAT) {
  const tiles = [];
  for (const rough of ROUGHNESS) {
    await page.goto(
      `http://localhost:3000/start?cardrig=1&roughness=${rough}&coat=${coat}&coatr=${COAT_ROUGHNESS}`,
      { waitUntil: "networkidle" },
    );

    if (first) {
      first = false;
      const renderer = await page.evaluate(() => {
        const c = document.createElement("canvas");
        const gl = c.getContext("webgl2") || c.getContext("webgl");
        const d = gl && gl.getExtension("WEBGL_debug_renderer_info");
        return d ? gl.getParameter(d.UNMASKED_RENDERER_WEBGL) : "unknown";
      });
      console.log("renderer:", renderer, "\n");
      if (/swiftshader|llvmpipe|software/i.test(renderer)) {
        console.log("⚠ SOFTWARE RASTERISER — this sheet is not real hardware.\n");
      }
    }

    await page.getByRole("button", { name: /begin/i }).click();
    await page.waitForTimeout(8000);

    // ⚠ CARD 1 ONLY, ENLARGED. The whole grid at five cards across is too small
    // to judge a surface treatment by; the question here is what the FACE does,
    // and that needs the pixels.
    const card = await page.getByTestId("answer-card-hover-0").boundingBox();
    if (!card) throw new Error("card 0 not found — viewport >= 1280?");

    const shot = await page.screenshot({ clip: card });
    const big = await sharp(shot)
      .resize({ width: Math.round(card.width * 2), kernel: "lanczos3" })
      .png()
      .toBuffer();
    const m = await sharp(big).metadata();

    const isControl = rough === 0.08 && coat === 0;
    const label = Buffer.from(
      `<svg width="${m.width}" height="30">
         <rect width="100%" height="100%" fill="#000"/>
         <text x="6" y="21" font-family="monospace" font-size="15" fill="${isControl ? "#ffd479" : "#fff"}">
           rough ${rough}  coat ${coat}${isControl ? "   ← TODAY" : ""}
         </text>
       </svg>`,
    );

    tiles.push(
      await sharp({
        create: {
          width: m.width,
          height: m.height + 30,
          channels: 4,
          background: { r: 0, g: 0, b: 0, alpha: 1 },
        },
      })
        .composite([
          { input: label, top: 0, left: 0 },
          { input: big, top: 30, left: 0 },
        ])
        .png()
        .toBuffer(),
    );

    console.log(`captured  rough ${rough}  coat ${coat}`);
  }

  // One row per coat value, so reading LEFT to RIGHT is the frost sweep and
  // TOP to BOTTOM is the coat sweep.
  const tm = await sharp(tiles[0]).metadata();
  rows.push(
    await sharp({
      create: {
        width: tm.width * tiles.length,
        height: tm.height,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 1 },
      },
    })
      .composite(tiles.map((input, i) => ({ input, top: 0, left: i * tm.width })))
      .png()
      .toBuffer(),
  );
}

const rm = await sharp(rows[0]).metadata();
await sharp({
  create: {
    width: rm.width,
    height: rm.height * rows.length,
    channels: 4,
    background: { r: 0, g: 0, b: 0, alpha: 1 },
  },
})
  .composite(rows.map((input, i) => ({ input, top: i * rm.height, left: 0 })))
  .png()
  .toFile(`${OUT}/frost-and-coat.png`);

console.log(`\nsheet: ${OUT}/frost-and-coat.png`);
console.log("  left to right  = frost (roughness)");
console.log("  top to bottom  = coat (clearcoat)");
console.log("\n⚠ NO VERDICT. Which cell is right is Carl's call.");

await browser.close();
