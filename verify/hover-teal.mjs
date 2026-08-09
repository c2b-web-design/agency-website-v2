/**
 * DOES THE HOVER TEAL ACTUALLY REACH THE PIXELS?
 *
 *   node verify/hover-teal.mjs
 *
 * ⚠ THIS EXISTS BECAUSE THE CHANGE HAS THE EXACT SHAPE OF THIS PROJECT'S
 * FAVOURITE FAILURE: a uniform that moves while nothing on screen changes. The
 * teal is a SECOND SAMPLER added to an already-compiled material — if three.js
 * serves a cached program keyed without it, or `vMapUv` is not defined in this
 * material's varyings, the blend runs every frame and paints nothing.
 *
 * ⚠ SO IT MEASURES COLOUR, NOT CODE. It samples the label band before and
 * during hover and reports the blue/green balance. Teal raises green relative
 * to blue; the resting near-white does not. A shader that failed to bind leaves
 * the two readings identical, which is the failure this reports loudly.
 */

import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const OUT = "verify/out/hover-teal";
mkdirSync(OUT, { recursive: true });

const BASE = process.env.VERIFY_BASE_URL ?? "http://localhost:3000";

const browser = await chromium.launch({
  headless: false,
  args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });

await page.goto(`${BASE}/start`, { waitUntil: "networkidle" });
const renderer = await page
  .evaluate(() => {
    const c = document.createElement("canvas");
    const gl = c.getContext("webgl2") || c.getContext("webgl");
    const d = gl && gl.getExtension("WEBGL_debug_renderer_info");
    return d ? gl.getParameter(d.UNMASKED_RENDERER_WEBGL) : "unknown";
  })
  .catch(() => "unknown");
console.log("renderer:", renderer, "\n");
if (/swiftshader|llvmpipe|software/i.test(String(renderer))) {
  console.error("⚠ ABORTING — software rasteriser.");
  await browser.close();
  process.exit(1);
}

const begin = page.getByRole("button", { name: /begin/i });
await begin.waitFor({ state: "visible", timeout: 20000 });
await begin.click();
await page.waitForTimeout(4500);

/** The label band of card 1 — the glyph row, not the clear face above it. */
async function labelBand() {
  return page.evaluate(() => {
    const cs = [...document.querySelectorAll("canvas")];
    if (!cs.length) return null;
    const r = cs.map((c) => c.getBoundingClientRect()).sort((a, b) => b.width * b.height - a.width * a.height)[0];
    const cx = r.x + r.width / 2 - 192;
    const cy = r.y + r.height / 2 - 28;
    return { x: cx - 70, y: cy - 8, width: 140, height: 16 };
  });
}

/**
 * ⚠ THE BRIGHTEST PIXELS ONLY. The band is mostly dark satin with thin glyph
 * strokes across it; averaging the whole crop would drown the text in its
 * background and report the body colour instead of the ink.
 */
async function inkColour(clip, label) {
  const b64 = (await page.screenshot({ path: `${OUT}/${label}.png`, clip })).toString("base64");
  return page.evaluate(async (s) => {
    const img = new Image();
    img.src = "data:image/png;base64," + s;
    await img.decode();
    const c = document.createElement("canvas");
    c.width = img.width;
    c.height = img.height;
    const x = c.getContext("2d");
    x.drawImage(img, 0, 0);
    const d = x.getImageData(0, 0, c.width, c.height).data;
    const px = [];
    for (let i = 0; i < d.length; i += 4) {
      const lum = 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
      px.push({ r: d[i], g: d[i + 1], b: d[i + 2], lum });
    }
    px.sort((a, b2) => b2.lum - a.lum);
    const top = px.slice(0, Math.max(1, Math.round(px.length * 0.06)));
    const n = top.length;
    return {
      r: top.reduce((s2, p) => s2 + p.r, 0) / n,
      g: top.reduce((s2, p) => s2 + p.g, 0) / n,
      b: top.reduce((s2, p) => s2 + p.b, 0) / n,
    };
  }, b64);
}

const clip = await labelBand();
if (!clip) {
  console.log("⚠ no canvas found.");
  await browser.close();
  process.exit(1);
}

const rest = await inkColour(clip, "1-rest");
console.log(`  resting ink   r ${rest.r.toFixed(1)}  g ${rest.g.toFixed(1)}  b ${rest.b.toFixed(1)}`);

// Hover card 1 through its DOM surface — the same target a real pointer hits.
const surface = page.locator('[data-testid="answer-card-hover-0"]');
await surface.hover();

// Mid-fade, then settled. The fade is an exponential with tau 0.42s.
await page.waitForTimeout(250);
const mid = await inkColour(clip, "2-mid");
console.log(`  mid-fade      r ${mid.r.toFixed(1)}  g ${mid.g.toFixed(1)}  b ${mid.b.toFixed(1)}`);

await page.waitForTimeout(1600);
const held = await inkColour(clip, "3-held");
console.log(`  hovered       r ${held.r.toFixed(1)}  g ${held.g.toFixed(1)}  b ${held.b.toFixed(1)}`);

// And back, so a stuck uniform is caught too.
await page.mouse.move(20, 20);
await page.waitForTimeout(1800);
const back = await inkColour(clip, "4-back");
console.log(`  released      r ${back.r.toFixed(1)}  g ${back.g.toFixed(1)}  b ${back.b.toFixed(1)}`);

/**
 * Teal is green-dominant over blue at equal luminance; the resting near-white
 * sits slightly blue. So `g - b` rising is the signature of the blend landing.
 */
const gbRest = rest.g - rest.b;
const gbHeld = held.g - held.b;
const shift = gbHeld - gbRest;

console.log(`\n  green-minus-blue:  rest ${gbRest.toFixed(2)}   hovered ${gbHeld.toFixed(2)}   shift ${shift.toFixed(2)}`);
console.log(`  target teal is rgb(160, 220, 218) — g-b of +2, against a near-white of -14`);

if (Math.abs(shift) < 1.5) {
  console.log(
    `\n  ⚠⚠ NO COLOUR CHANGE. The uniform is animating and the pixels are not.\n` +
      `     Suspect the second sampler never bound: a cached program without it,\n` +
      `     or vMapUv missing from this material's varyings.\n`,
  );
} else {
  console.log(`\n  The teal reaches the pixels. Whether it LOOKS right is Carl's call.\n`);
}

const settled = Math.abs(back.g - back.b - gbRest);
console.log(`  returns to rest? g-b back within ${settled.toFixed(2)} of resting${settled < 2 ? " — yes" : " — ⚠ STUCK"}\n`);

await browser.close();
