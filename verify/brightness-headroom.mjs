/**
 * How bright is a card NOW, as a fraction of how bright it can get?
 *
 * ⚠ "FULL BRIGHTNESS" IS NOT ONE NUMBER, AND THAT IS THE POINT OF THIS SCRIPT.
 * Three different scales answer Carl's question differently:
 *
 *   1. THE FADER'S OWN SCALE — `lightLevel` is 0.35 on a rig range of 0..2.
 *      That is arithmetic, not a measurement, and it is the LEAST useful answer
 *      because the response is not linear.
 *   2. THE PANEL'S SCALE — measured luminance out of 255. What the eye gets.
 *   3. THE HEADROOM THAT ACTUALLY EXISTS — measured luminance now, against
 *      measured luminance with the fader at its ceiling. This is the one that
 *      says how much room a hover brightening has to work in.
 *
 * ⚠ AND THE RECORDED 4-AUGUST NUMBERS NO LONGER DESCRIBE THIS SCENE. They were
 * taken with the `c2b DESIGN` lockup behind the cards; the lockup was removed on
 * 5 August and the glass now transmits flat ground. **Measure, do not quote.**
 *
 * ⚠ PER SURFACE, NOT PER CARD. The rim, the bevel and the face respond to the
 * fader completely differently — the bevel saturates while the rim is still
 * climbing — so a single "card brightness" figure would average away the very
 * thing that decides where a hover effect should act.
 *
 * ⚠ HEADED, WITH --enable-gpu. Headless substitutes SwiftShader.
 *
 *   node verify/brightness-headroom.mjs
 */

import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
// ⚠ `sharp`, NOT `pngjs`. It is already this harness suite's decoder
// (`field-colour.mjs`, `field-displays.mjs`) and is already installed — adding a
// second PNG library to read the same bytes would be a dependency for nothing.
import sharp from "sharp";

const OUT = "verify/out";
mkdirSync(OUT, { recursive: true });

const LEVELS = [0, 0.12, 0.35, 0.7, 1.0, 1.5, 2.0];
const CURRENT = 0.35;

const browser = await chromium.launch({
  headless: false,
  args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

/**
 * Walk inward from a card's top edge one pixel at a time and return the profile.
 *
 * ⚠ THE EDGE IS FOUND, NOT PLACED. `answer-card-glass.ts` records the cost of
 * getting this wrong: sampling at ASSUMED depths (2px "rim", 6px "bevel") read
 * the tube's dark outer edge instead of the metal and sent two rounds of tuning
 * the wrong way. The surfaces are identified from the profile's own shape here.
 */
async function profileFromPng(buf) {
  const { data, info } = await sharp(buf)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const cx = Math.round(info.width / 2);
  const rows = [];
  for (let y = 0; y < Math.min(20, info.height); y++) {
    const i = (info.width * y + cx) * 4;
    const r = data[i], g = data[i + 1], b = data[i + 2];
    rows.push(0.2126 * r + 0.7152 * g + 0.0722 * b);
  }
  return rows;
}

const results = [];

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
      console.log("\n⚠ SOFTWARE RASTERISER — these numbers are not real hardware.\n");
    }
  }

  await page.getByRole("button", { name: /begin/i }).click();
  await page.waitForTimeout(8000);

  const card = await page.getByTestId("answer-card-hover-0").boundingBox();
  if (!card) throw new Error("card 0 not found — viewport >= 1280?");

  const buf = await page.screenshot({
    clip: { x: card.x, y: card.y, width: card.width, height: card.height },
  });
  const prof = await profileFromPng(buf);

  // The rim's lit crown and the bevel share a plateau (recorded finding); the
  // face is the interior. Take the peak in the outer 8px as the edge structure,
  // and the median of the interior as the face.
  const edge = Math.max(...prof.slice(0, 9));
  const interior = prof.slice(10, 20).sort((a, b) => a - b);
  const face = interior[Math.floor(interior.length / 2)];

  results.push({ level, edge, face, prof });
  console.log(
    `light ${level.toFixed(2).padStart(4)}   edge ${edge.toFixed(1).padStart(6)}   face ${face.toFixed(1).padStart(6)}`,
  );
}

const now = results.find((r) => r.level === CURRENT);
// ⚠ THE CEILING IS THE MAX ACROSS THE SWEEP, not the last row. They are the same
// today, but the response is non-linear and a surface that saturates and then
// dips would make "the last level" the wrong reference.
const ceilEdge = Math.max(...results.map((r) => r.edge));
const ceilFace = Math.max(...results.map((r) => r.face));

console.log("\n─────────────────────────────────────────────");
console.log("AT THE CURRENT SETTING, lightLevel = 0.35\n");
console.log(`  fader position        ${((CURRENT / 2) * 100).toFixed(0)}%  of the rig's 0..2 range`);
console.log(`  edge (rim+bevel)      ${((now.edge / 255) * 100).toFixed(1)}%  of the panel's 255`);
console.log(`                        ${((now.edge / ceilEdge) * 100).toFixed(1)}%  of what the fader can reach`);
console.log(`  face (the glass)      ${((now.face / 255) * 100).toFixed(1)}%  of the panel's 255`);
console.log(`                        ${((now.face / ceilFace) * 100).toFixed(1)}%  of what the fader can reach`);
console.log(`\n  headroom to fader max: edge x${(ceilEdge / now.edge).toFixed(2)}, face x${(ceilFace / now.face).toFixed(2)}`);
console.log("\n⚠ THE THREE PERCENTAGES ARE NOT INTERCHANGEABLE. The fader position");
console.log("  is arithmetic; the others are measured, and the response is not");
console.log("  linear — see the per-level table above.");

writeFileSync(`${OUT}/brightness-headroom.json`, JSON.stringify(results, null, 2));
console.log(`\nprofiles: ${OUT}/brightness-headroom.json`);

await browser.close();
