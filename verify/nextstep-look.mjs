// Does the Next step mesh read as chrome — or as a bright ring around a hole?
//
//   node verify/nextstep-look.mjs [querystring]
//   node verify/nextstep-look.mjs "?axis=2.0&key=2.2"
//
// ══════════════════════════════════════════════════════════════════════════
// ⚠⚠ SCREENSHOT, NEVER readPixels OR toDataURL. THIS IS THE WHOLE REASON THE
// FILE EXISTS.
// ══════════════════════════════════════════════════════════════════════════
//
// The button's canvas is created with `preserveDrawingBuffer: false` (the r3f
// default). On a STATIC canvas — no rAF, nothing animating — both `readPixels`
// and `toDataURL` return an **empty buffer**, so they report every pixel at
// alpha 0 on a canvas that is rendering perfectly.
//
// ⚠ IT COST FIVE WRONG FIXES ON 10 AUGUST 2026. The crown was deepened
// 2.4 -> 8.5, the env panels were rescaled, an `invalidate()` was added, the
// triangle winding was flipped and `DoubleSide` was set — all to cure an
// "invisible" button that was drawing the whole time. Geometry, camera, scene
// graph, culling, lighting and frameloop were each ruled out by measurement
// first; the fault was the instrument.
//
// ⚠ THE CORRIDOR'S CANVASES DO NOT SHOW THIS because the traveller's rAF keeps
// them drawing, so there is always a fresh buffer to read. A technique that
// works on /start is not therefore safe here.
//
// `page.screenshot()` composites the page and is immune. Use it.
//
// ── WHAT IT MEASURES ─────────────────────────────────────────────────────
//
// The Architect's one-number question, 10 August: **"is the middle of the
// button still returning black"** — the flat top of the pill reflects straight
// back along +Z under an orthographic camera, so with no source on that axis it
// mirrors the shell and the button reads as a picture frame.
//
//   centre      the mean of a small patch at the pill's middle
//   rim         the mean of the brightest 10% (the crown's catch)
//   ratio       rim / centre — a picture frame scores high, chrome scores low
//   blueness    b - r on the centre patch; the reference's darks are NAVY,
//               not black, so a neutral centre means the shell is still grey
//
// ⚠ IT ASSERTS NOTHING ABOUT BEAUTY. It answers "is the middle lit" and "is it
// blue". Whether it LOOKS like chrome is Carl's call and nobody else's.
//
// ⚠ HEADED, --enable-gpu, ABORTS ON A SOFTWARE RASTERISER.

import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const BASE = process.env.VERIFY_BASE_URL ?? "http://localhost:3000";
const QUERY = process.argv[2] ?? "";

mkdirSync("verify/out", { recursive: true });

const browser = await chromium.launch({
  headless: false,
  args: ["--enable-gpu", "--use-gl=angle", "--ignore-gpu-blocklist"],
});
const page = await browser.newPage({
  viewport: { width: 900, height: 700 },
  deviceScaleFactor: 4,
});

await page.goto(`${BASE}/proto/nextstep${QUERY}`, { waitUntil: "networkidle" });

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
console.log(`renderer: ${renderer}`);
if (QUERY) console.log(`query: ${QUERY}`);
console.log();

await page.waitForTimeout(2500);

const el = await page.$("#mesh-button");
if (!el) {
  console.error("#mesh-button not found — is /proto/nextstep still the bench?");
  await browser.close();
  process.exit(1);
}
const bb = await el.boundingBox();

// Clip to the pill itself, no padding — padding would dilute both numbers with
// background and make a dark button look better than it is.
const buf = await page.screenshot({
  path: "verify/out/nextstep.png",
  clip: { x: bb.x, y: bb.y, width: bb.width, height: bb.height },
});

const out = await page.evaluate(async (b64) => {
  const img = new Image();
  img.src = "data:image/png;base64," + b64;
  await img.decode();
  const c = document.createElement("canvas");
  c.width = img.width;
  c.height = img.height;
  const ctx = c.getContext("2d");
  ctx.drawImage(img, 0, 0);
  const d = ctx.getImageData(0, 0, c.width, c.height).data;

  const px = [];
  for (let i = 0; i < d.length; i += 4) {
    px.push({ r: d[i], g: d[i + 1], b: d[i + 2], l: 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2] });
  }

  // The centre patch: the middle 30% x 30% of the pill — the plateau.
  const cx0 = Math.floor(c.width * 0.35);
  const cx1 = Math.floor(c.width * 0.65);
  const cy0 = Math.floor(c.height * 0.35);
  const cy1 = Math.floor(c.height * 0.65);
  let cr = 0, cg = 0, cb = 0, cn = 0;
  for (let y = cy0; y < cy1; y++) {
    for (let x = cx0; x < cx1; x++) {
      const i = (y * c.width + x) * 4;
      cr += d[i]; cg += d[i + 1]; cb += d[i + 2]; cn++;
    }
  }

  px.sort((a, z) => z.l - a.l);
  const top = px.slice(0, Math.max(1, Math.round(px.length * 0.1)));
  const t = top.reduce((a, q) => ({ r: a.r + q.r, g: a.g + q.g, b: a.b + q.b }), { r: 0, g: 0, b: 0 });
  const tn = top.length;

  const mean = px.reduce((a, q) => a + q.l, 0) / px.length;

  return {
    centre: { r: cr / cn, g: cg / cn, b: cb / cn },
    rim: { r: t.r / tn, g: t.g / tn, b: t.b / tn },
    meanLum: mean,
  };
}, buf.toString("base64"));

await browser.close();

const f = (v) => v.toFixed(1).padStart(6);
const cLum = 0.2126 * out.centre.r + 0.7152 * out.centre.g + 0.0722 * out.centre.b;
const rLum = 0.2126 * out.rim.r + 0.7152 * out.rim.g + 0.0722 * out.rim.b;
const ratio = cLum > 0.5 ? rLum / cLum : Infinity;
const blueness = out.centre.b - out.centre.r;

console.log(`  centre    r ${f(out.centre.r)}  g ${f(out.centre.g)}  b ${f(out.centre.b)}   lum ${cLum.toFixed(1)}`);
console.log(`  rim  10%  r ${f(out.rim.r)}  g ${f(out.rim.g)}  b ${f(out.rim.b)}   lum ${rLum.toFixed(1)}`);
console.log(`  mean luminance across the pill   ${out.meanLum.toFixed(1)}`);
console.log();
console.log(`  rim / centre  ${Number.isFinite(ratio) ? ratio.toFixed(1) : "inf"}     blueness (b - r)  ${blueness.toFixed(1)}`);
console.log();

if (cLum < 12) {
  console.log(`  ⚠⚠ THE CENTRE IS BLACK. The plateau is reflecting the shell — there is`);
  console.log(`     no source on the camera axis. This reads as a picture frame, not a`);
  console.log(`     button. Raise ?axis= before touching anything else.`);
} else if (ratio > 4) {
  console.log(`  ⚠ RIM ${ratio.toFixed(1)}x THE CENTRE — still frame-like. The axis panel is`);
  console.log(`    working but too dim relative to the key.`);
} else {
  console.log(`  ✅ the centre is lit and the rim is within ${ratio.toFixed(1)}x of it — a solid`);
  console.log(`     object rather than an outline.`);
}

if (blueness < 6) {
  console.log(`  ⚠ THE CENTRE IS NEUTRAL, NOT NAVY. Carl's reference has deep BLUE darks,`);
  console.log(`    not grey ones. The shell colour is what carries this.`);
} else {
  console.log(`  ✅ the darks are blue (b - r = ${blueness.toFixed(1)}), as the reference has them.`);
}

console.log(`\n  Crop saved to verify/out/nextstep.png.`);
console.log(`  ⚠ WHETHER IT LOOKS LIKE CHROME IS CARL'S CALL. This says only what the`);
console.log(`    pixels did.`);
