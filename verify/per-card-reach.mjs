/**
 * WHICH CARDS DOES THE TRAVELLER ACTUALLY REACH? Per-card, across the sweep.
 *
 *   node verify/per-card-reach.mjs
 *
 * ⚠ THE QUESTION, FROM CARL, 9 August: *"it has an effect on cards 1,4+5 but
 * hardly any effect on cards 2+3."* That is an asymmetry claim about FIVE
 * separate objects, and a whole-row screenshot cannot answer it — the row's mean
 * hides which card moved.
 *
 * ⚠ SO IT MEASURES EACH CARD'S FACE SEPARATELY, at many moments through the
 * circuit, and reports each one's SWING (brightest minus dimmest). A card the
 * light reaches has a large swing; a card it passes by sits flat no matter how
 * bright the scene is.
 *
 * ⚠ AND IT SAMPLES ABOVE THE BAKED LABEL. The answer text lives in the face's
 * albedo, so a crop through the middle of a card measures glyphs — an earlier
 * harness did exactly that and produced a violently oscillating trace that said
 * nothing about the material.
 */

import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const OUT = "verify/out/per-card-reach";
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
await page.waitForTimeout(4200);

/**
 * The five card faces in canvas-relative world units, from the shipped geometry.
 * Sampled ABOVE the label: a band across the upper third of each face.
 */
const SLOTS = [
  ["card 1  top-left", -192, 28],
  ["card 2  top-mid", 0, 28],
  ["card 3  top-right", 192, 28],
  ["card 4  bot-left", -96, -32],
  ["card 5  bot-right", 96, -32],
];

async function sampleAll() {
  return page.evaluate(async (slots) => {
    const cs = [...document.querySelectorAll("canvas")];
    if (!cs.length) return null;
    const r = cs.map((c) => c.getBoundingClientRect()).sort((a, b) => b.width * b.height - a.width * a.height)[0];
    const out = [];
    for (const [name, wx, wy] of slots) {
      const cx = r.x + r.width / 2 + wx;
      const cy = r.y + r.height / 2 - wy;
      out.push({ name, x: cx - 60, y: cy - 16, w: 120, h: 10 });
    }
    return out;
  }, SLOTS);
}

const rects = await sampleAll();
if (!rects) {
  console.log("⚠ no canvas found.");
  await browser.close();
  process.exit(1);
}

async function luminance(rect) {
  const b64 = (
    await page.screenshot({ clip: { x: rect.x, y: rect.y, width: rect.w, height: rect.h } })
  ).toString("base64");
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
    let sum = 0;
    for (let i = 0; i < d.length; i += 4) sum += 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
    return sum / (d.length / 4);
  }, b64);
}

// Sample densely across a full circuit (11000 front + 500 back = 11500ms).
const MOMENTS = [];
for (let t = 0; t <= 11500; t += 500) MOMENTS.push(t);

const series = rects.map((r) => ({ name: r.name, vals: [] }));
let last = 0;
for (const t of MOMENTS) {
  if (t > last) await page.waitForTimeout(t - last);
  last = t;
  for (let i = 0; i < rects.length; i++) series[i].vals.push(await luminance(rects[i]));
  // A whole-row frame at a few moments, for the eye.
  if (t % 2000 === 0) {
    const cs = await page.evaluate(() => {
      const c = [...document.querySelectorAll("canvas")]
        .map((x) => x.getBoundingClientRect())
        .sort((a, b) => b.width * b.height - a.width * a.height)[0];
      return { x: c.x, y: c.y, width: c.width, height: c.height };
    });
    await page.screenshot({ path: `${OUT}/row-t${String(t).padStart(5, "0")}.png`, clip: cs });
  }
}

console.log("face luminance through one full circuit, per card:\n");
console.log("  card                 min    max   SWING   profile");
for (const s of series) {
  const mn = Math.min(...s.vals);
  const mx = Math.max(...s.vals);
  const spark = s.vals
    .map((v) => "▁▂▃▄▅▆▇█"[Math.min(7, Math.max(0, Math.round(((v - mn) / Math.max(0.001, mx - mn)) * 7)))])
    .join("");
  console.log(
    `  ${s.name.padEnd(18)} ${mn.toFixed(1).padStart(5)}  ${mx.toFixed(1).padStart(5)}  ${(mx - mn)
      .toFixed(1)
      .padStart(6)}   ${spark}`,
  );
}

console.log(`\n  A large SWING means the traveller reaches that card.`);
console.log(`  A flat one means it passes the card by.\n`);
console.log(`  frames: ${OUT}/\n`);

await browser.close();
