// Does the answer text go WHITE -> TEAL on hover, after the single-texture fix?
//
//   node verify/teal-core.mjs
//
// ══════════════════════════════════════════════════════════════════════════
// ⚠⚠ HOW TO FIND CARD 1 — THREE HARNESSES HAVE GOT THIS WRONG
// ══════════════════════════════════════════════════════════════════════════
//
// **Locate the grid by its ELEMENT, `.enquiry-answer-grid`, and derive card 1
// from its box.** Everything else has failed:
//
//   ⚠ `.enquiry-card` DOES NOT EXIST. The cards are WebGL meshes inside a
//     canvas, not DOM nodes. A first version of this file waited 40s for one
//     and reported "no cards found" against a working build. (This is also the
//     recorded accessibility debt: the answer text is a texture and is not in
//     the a11y tree.)
//
//   ⚠⚠ AND SORTING CANVASES BY AREA PICKS THE WRONG ONE — `hover-teal.mjs`
//     STILL DOES THIS. Measured on a production build at 1440x900:
//
//         contact field   576 x 184 at (432, 262)   <- LARGER
//         answer grid     576 x 104 at (432, 493)   <- the one with the cards
//
//     `sort((a,b) => b.width*b.height - a.width*a.height)[0]` returns the
//     CONTACT FIELD. A crop taken from it lands on the page HEADING — verified
//     by screenshot: white "busines[s]" glyphs on near-black, which read as
//     pure 255,255,255 and produced a confident "NOTHING MOVED" on a feature
//     that was working perfectly.
//
// ⚠ THAT IS THE FIFTH INSTRUMENT FAULT IN THIS PROJECT IN THREE DAYS, and the
// second one caused by a harness measuring a plausible-looking wrong object.
// The grid element is unambiguous; geometry guessed from a canvas is not.
//
// ── WHAT IT MEASURES ─────────────────────────────────────────────────────
//
// The glyph band of card 1 (top-left of the 3+2 grid), at rest and hovered,
// reporting the per-channel drop.
//
// ⚠ THE SIGNATURE IS THE POINT, NOT THE MAGNITUDE.
// rgb(238,241,252) -> rgb(160,220,218) is red -78, green -21, blue -34, so
// **RED MUST MOVE MOST**. A near-uniform drop across three channels means the
// text DIMMED; teal is a HUE change, not a brightness change.
//
// ⚠ deviceScaleFactor 6, NOT 2 — load-bearing, and a recorded fault of an
// earlier harness. At 2 a ~12px glyph is too anti-aliased to resolve and reads
// white on a working feature.
//
// ⚠ HEADED, --enable-gpu, ABORTS ON A SOFTWARE RASTERISER.

import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const BASE = process.env.VERIFY_BASE_URL ?? "http://localhost:3000";

mkdirSync("verify/out", { recursive: true });

const browser = await chromium.launch({
  headless: false,
  args: ["--enable-gpu", "--use-gl=angle", "--ignore-gpu-blocklist"],
});
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 6,
});

await page.goto(`${BASE}/start`, { waitUntil: "domcontentloaded" });

const renderer = await page.evaluate(() => {
  const c = document.createElement("canvas");
  const gl = c.getContext("webgl2") || c.getContext("webgl");
  if (!gl) return "no webgl";
  const ext = gl.getExtension("WEBGL_debug_renderer_info");
  return ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : "unknown";
});
if (/swiftshader|llvmpipe|software|no webgl/i.test(renderer)) {
  console.error(`\n⚠ ABORTING — renderer is "${renderer}": a software rasteriser.`);
  await browser.close();
  process.exit(1);
}
console.log(`renderer: ${renderer}\n`);

await page.getByRole("button", { name: /begin/i }).click();

// Wait for the grid to exist, then let the entrance choreography settle.
await page.waitForSelector(".enquiry-answer-grid", { timeout: 40000 });
await page.waitForTimeout(9000);

/** Card 1 is the top-left cell of the 3-across, 2-down grid. */
const geom = await page.evaluate(() => {
  const r = document.querySelector(".enquiry-answer-grid").getBoundingClientRect();
  const w = r.width / 3;
  const h = r.height / 2;
  return {
    clip: { x: Math.round(r.x + 6), y: Math.round(r.y + 6), width: Math.round(w - 12), height: Math.round(h - 12) },
    hover: { x: r.x + w / 2, y: r.y + h / 2 },
  };
});

/**
 * Average the pixels that are actually INK.
 *
 * ⚠ SELECTED BY A LUMINANCE BAND, NOT A TOP SLICE. The satin body is #0b1f4d
 * (dark) and the glyphs are near-white, so a plain "brightest N%" would work —
 * except the card also carries a specular highlight on its upper edge that is
 * brighter than the text. The band's upper bound excludes it; the lower bound
 * excludes the body and the drop shadow beneath the glyphs.
 */
async function inkColour(tag) {
  const buf = await page.screenshot({ clip: geom.clip, path: `verify/out/teal-${tag}.png` });
  return await page.evaluate(
    async (b64) => {
      const img = new Image();
      img.src = "data:image/png;base64," + b64;
      await img.decode();
      const c = document.createElement("canvas");
      c.width = img.width;
      c.height = img.height;
      const ctx = c.getContext("2d");
      ctx.drawImage(img, 0, 0);
      const d = ctx.getImageData(0, 0, c.width, c.height).data;
      let r = 0, g = 0, b = 0, n = 0;
      for (let i = 0; i < d.length; i += 4) {
        const lum = 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
        if (lum > 90 && lum < 235) {
          r += d[i];
          g += d[i + 1];
          b += d[i + 2];
          n++;
        }
      }
      return n ? { r: r / n, g: g / n, b: b / n, n } : null;
    },
    buf.toString("base64"),
  );
}

// ⚠⚠ PARK THE POINTER OFF THE GRID AND LET THE EASE UNWIND BEFORE SAMPLING
// "REST". Playwright's virtual pointer starts at (0,0) but does not reset
// between runs in a reused context, and this harness previously sampled a card
// that was ALREADY HOVERED — reporting "NOTHING MOVED" (drop 1.8/0.4/0.8) on a
// feature that was working. **A resting measurement taken on a hovered card is
// not a weaker measurement, it is a wrong one.**
//
// The unwind matters as much as the move: `LABEL_HOVER_TAU` is 0.42s, so the
// teal takes ~1s to drain. Sampling immediately after moving away would catch
// the card mid-fade and understate the resting white.
await page.mouse.move(10, 10);
await page.waitForTimeout(2500);

const rest = await inkColour("rest");
await page.mouse.move(geom.hover.x, geom.hover.y);
await page.waitForTimeout(2500); // LABEL_HOVER_TAU 0.42s settles by ~1s
const hover = await inkColour("hover");

await browser.close();

if (!rest || !hover) {
  console.error("no ink pixels found in the band — check verify/out/teal-*.png");
  process.exit(1);
}

const f = (v) => v.toFixed(1).padStart(6);
console.log(`  ink band of card 1  (${rest.n} px at rest, ${hover.n} hovered)\n`);
console.log(`  resting   r ${f(rest.r)}  g ${f(rest.g)}  b ${f(rest.b)}`);
console.log(`  hovered   r ${f(hover.r)}  g ${f(hover.g)}  b ${f(hover.b)}`);

const dr = rest.r - hover.r;
const dg = rest.g - hover.g;
const db = rest.b - hover.b;
console.log(`\n  drop      r ${f(dr)}  g ${f(dg)}  b ${f(db)}`);
console.log(`\n  target rgb(238,241,252) -> rgb(160,220,218): red -78, green -21, blue -34`);
console.log(`  RED MUST MOVE MOST — a uniform drop is dimming, not teal.\n`);

if (dr > dg * 1.5 && dr > db * 1.2 && dr > 8) {
  console.log(`  ✅ RED DOMINATES — the ink is shifting toward teal.`);
} else if (Math.abs(dr) < 4 && Math.abs(dg) < 4 && Math.abs(db) < 4) {
  console.log(`  ⚠ NOTHING MOVED — the hover is not reaching the glyphs.`);
} else {
  console.log(`  ⚠ NOT RED-DOMINANT — reads as dimming rather than a hue change.`);
}
console.log(`\n  Crops saved to verify/out/teal-rest.png and teal-hover.png.`);
console.log(`  ⚠ WHETHER IT LOOKS RIGHT IS CARL'S CALL.`);
