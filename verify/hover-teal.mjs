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
/**
 * ⚠⚠ deviceScaleFactor 6, NOT 2, AND THIS IS LOAD-BEARING. At 2 the ~12px glyph
 * is so heavily anti-aliased that its teal core is averaged away against the
 * white relief halo and the blue body — the measurement returned a red drop of
 * -0.7 on a change that is plainly visible to the eye at 6.
 *
 * **A harness cannot resolve what it does not sample.** The same crop at
 * deviceScaleFactor 6 shows unmistakable teal; at 2 it shows white. The pixels
 * were never the problem — the sampling resolution was.
 */
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 6 });

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
 * ⚠⚠ THIS HARNESS REPORTED A FALSE NEGATIVE AND COST A ROUND OF DEBUGGING. Read
 * this before trusting or changing it.
 *
 * The first version averaged **the brightest 6% of pixels** in the label band,
 * reasoning that the band is mostly dark satin and the glyphs are the bright
 * part. That is true — but it selects **the wrong bright pixels.**
 *
 * `buildLabelTexture` fakes the extrusion by drawing a **white lit lip at
 * `rgba(255,255,255,0.38)`** offset up-left, UNDER the glyph. At the texture's
 * scale that offset is 5px, which is **1.41 screen px** — and against a ~12px
 * glyph with ~2px strokes, the white halo is a large fraction of every stroke.
 *
 * ⚠ **THE HALO IS IDENTICAL IN BOTH TEXTURES**, because only the glyph CORE
 * takes the ink colour. So the brightest-6% window sampled the one part of the
 * label that cannot change, and reported a green-minus-blue shift of 0.75
 * against an expected +10.5 — while the teal was rendering correctly the whole
 * time. **The instrument was measuring its own mask.**
 *
 * ⚠ AND THE FAILURE SURVIVED A CROSS-CHECK, which is the part worth learning.
 * Two captured frames at deviceScaleFactor 2 "confirmed" white text by eye. At
 * deviceScaleFactor 6 the same crop is obviously teal. **A visual check at a
 * scale where the effect cannot resolve is not a cross-check.**
 *
 * ⚠ SO IT NOW MEASURES THE MEAN OF ALL REASONABLY-LIT PIXELS and watches the
 * RED channel, which is where teal actually shows: rgb(238,241,252) →
 * rgb(160,220,218) drops red by 78 while green falls 21 and blue 34. Red is the
 * channel with the signal; green-minus-blue is not, because the glyph
 * composites over a blue satin body.
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
    // Every reasonably-lit pixel, not a top slice — see the note above.
    let n = 0;
    let sr = 0;
    let sg = 0;
    let sb = 0;
    for (let i = 0; i < d.length; i += 4) {
      const lum = 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
      if (lum > 90) {
        n++;
        sr += d[i];
        sg += d[i + 1];
        sb += d[i + 2];
      }
    }
    return n ? { r: sr / n, g: sg / n, b: sb / n } : { r: 0, g: 0, b: 0 };
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
 * ⚠ RED IS THE CHANNEL WITH THE SIGNAL. rgb(238,241,252) → rgb(160,220,218)
 * drops red by 78, green by 21 and blue by 34. Green-minus-blue barely moves
 * because the glyph composites over a blue satin body — which is why the first
 * version of this check reported a false negative.
 */
const dropR = rest.r - held.r;
const dropG = rest.g - held.g;
const dropB = rest.b - held.b;

console.log(`\n  channel drop on hover:  red ${dropR.toFixed(1)}   green ${dropG.toFixed(1)}   blue ${dropB.toFixed(1)}`);
console.log(`  the ink goes rgb(238,241,252) -> rgb(160,220,218): red is the channel that moves`);

if (dropR < 8 || dropR < dropG || dropR < dropB) {
  console.log(
    `\n  ⚠⚠ NO TEAL. Red should fall furthest and by a clear margin.\n` +
      `     Probe the pipeline before assuming the shader: uHover reaching 1,\n` +
      `     uLabelTeal non-null AND distinct from labelMap, and the compiled\n` +
      `     shader containing uLabelTeal TWICE (declaration + sample).\n`,
  );
} else {
  console.log(`\n  The teal reaches the pixels. Whether it LOOKS right is Carl's call.\n`);
}

const settled = Math.abs(back.r - rest.r);
console.log(`  returns to rest? red back within ${settled.toFixed(1)} of resting${settled < 12 ? " — yes" : " — ⚠ STUCK"}\n`);

await browser.close();
