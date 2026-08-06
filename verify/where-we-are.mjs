/**
 * Where the card stands after the cross-section rebuild — glass and clay.
 *
 * ⚠ THE GLASS CARD HAS NOT BEEN SEEN ON THE NEW GEOMETRY. Everything on
 * 6 August 2026 was judged in clay (`?clay=1`), because the whole point was to
 * take the material out of the way and look at the form. Carl: *"i will have no
 * way of knowing if its right if its clear glass."*
 *
 * So this captures both, at the same moment, from the same run:
 *
 *   glass   the shipped card, on the rebuilt cross-section. UNJUDGED.
 *   clay    the form study, one light per card on a 45s arc
 *
 * ⚠ IT ASSERTS NOTHING. Two screenshots for Carl's eye.
 *
 * ⚠ HEADED, WITH --enable-gpu. Headless substitutes SwiftShader, on which the
 * transmission pass does not represent real hardware.
 *
 *   node verify/where-we-are.mjs
 */

import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const OUT = "verify/out";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({
  headless: false,
  args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"],
});
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
});

async function capture(url, name, waitMs) {
  await page.goto(url, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /begin/i }).click();
  await page.waitForTimeout(waitMs);

  const grid = await page.getByTestId("answer-card-proto").boundingBox();
  if (!grid) throw new Error(`grid not found for ${name} — viewport >= 1280?`);

  // A margin so the cards are not cropped at the silhouette.
  await page.screenshot({
    path: `${OUT}/now-${name}.png`,
    clip: {
      x: Math.max(0, grid.x - 24),
      y: Math.max(0, grid.y - 24),
      width: grid.width + 48,
      height: grid.height + 48,
    },
  });
  console.log(`  ${OUT}/now-${name}.png`);
}

const renderer = await page.evaluate(() => {
  const c = document.createElement("canvas");
  const gl = c.getContext("webgl2") || c.getContext("webgl");
  const d = gl && gl.getExtension("WEBGL_debug_renderer_info");
  return d ? gl.getParameter(d.UNMASKED_RENDERER_WEBGL) : "unknown";
}).catch(() => "unknown");
console.log("renderer:", renderer, "\n");

console.log("capturing:");
// The entrance ends at ENTRANCE_END_MS (4890) plus compile; 9s is comfortable.
await capture("http://localhost:3000/start", "glass", 9000);
// Land mid-arc, where the light is off to one side and raking.
await capture("http://localhost:3000/start?clay=1", "clay", 9000 + 11000);

console.log("\nglass = the shipped material on the rebuilt geometry, UNJUDGED");
console.log("clay  = the form study, one light per card on a 45s arc");

await browser.close();
