/**
 * DOES THE FACE SHOW ITS CURVE? The crown's disclosure, measured.
 *
 *   node verify/crown-disclosure.mjs [label]
 *
 * ⚠ THE QUESTION CARL SET, 9 August 2026: *"The most important thing with the
 * cards is to bring out the geometry. Both with static light, and moreso with
 * moving light."* So the face material's job is DISCLOSURE, not decoration, and
 * that is measurable rather than only judgeable.
 *
 * ⚠ THE PRECEDENT THIS PROJECT ALREADY OWNS. The contact field's first crown was
 * 1.2 units over a 19-unit half-height — a maximum surface tilt of 5.67°, real
 * geometry that was *physically incapable of showing itself* because Lambert
 * shading depends on the angle between light and normal. Carl's report was
 * exactly right: *"I cannot tell any face being convex... those faces look
 * flat."* The card's crown was then sized by the SAME metric
 * (`answer-card-geometry.ts`, verified 3 August against the mesh's own normals):
 *
 *     crown 1.2 ->  6.7°   ratio 1.15   invisible
 *     crown 3.0 -> 16.4°   ratio 1.41
 *     crown 4.5 -> 23.8°   ratio 1.68   <- shipped
 *     crown 6.0 -> 30.5°   ratio 2.03
 *     crown 7.5 -> 36.4°   ratio 2.48   reads as a dome
 *
 * against the field's own reference points: 1.22 nothing visible, 1.41 still
 * weak, 2.18 only now starting to read.
 *
 * ⚠ THOSE RATIOS CAME FROM THE MESH'S NORMALS — GEOMETRY. THIS MEASURES PIXELS.
 * They are different questions and the difference is the whole point: the
 * geometry can be right while the MATERIAL throws the disclosure away. A
 * `transmission: 0.97` face mixes 97% of its diffuse away, so a correct 23.8°
 * crown can still render nearly flat. This script asks what the eye actually
 * receives.
 *
 * WHAT IT MEASURES — a vertical cut down the middle of card 1's face, sampling
 * luminance across the SHORT axis, which is the axis the crown curves on:
 *
 *   - the ratio between the brightest and darkest band across the crown
 *   - where the peak sits (a centred peak = a light overhead; an off-centre
 *     peak = the light is raking, which is what discloses a curve)
 *   - the profile itself, so a flat surface and a curved one are distinguishable
 *     rather than reduced to one number
 *
 * ⚠ A RATIO ALONE CANNOT TELL A CURVE FROM A GRADIENT. A flat face under an
 * off-axis light also gets brighter toward the light. The PROFILE SHAPE is what
 * separates them: a cylinder's luminance falls away on BOTH sides of its peak,
 * a tilted flat plane ramps monotonically. Both are printed.
 *
 * ⚠ HEADED, --enable-gpu, RENDERER CHECKED. Headless substitutes SwiftShader and
 * every shading number here would be a lie.
 *
 * Pass a label to keep runs apart: `node verify/crown-disclosure.mjs glass`
 * then `... satin`, and the JSON lands beside the PNG for comparison.
 */

import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";

const OUT = "verify/out/disclosure";
mkdirSync(OUT, { recursive: true });

const BASE = process.env.VERIFY_BASE_URL ?? "http://localhost:3000";
const LABEL = (process.argv[2] ?? "run").replace(/[^a-z0-9_-]/gi, "");

// Past the entrance so nothing is mid-fade. The ladder ends at ~+2949ms from
// Begin (measured 9 Aug, verify/approved-timings.mjs); 9s is comfortable.
const SETTLE_MS = 9000;

const browser = await chromium.launch({
  headless: false,
  args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"],
});
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
});

await page.goto(`${BASE}/start`, { waitUntil: "networkidle" });

const renderer = await page
  .evaluate(() => {
    const c = document.createElement("canvas");
    const gl = c.getContext("webgl2") || c.getContext("webgl");
    const d = gl && gl.getExtension("WEBGL_debug_renderer_info");
    return d ? gl.getParameter(d.UNMASKED_RENDERER_WEBGL) : "unknown";
  })
  .catch(() => "unknown");
console.log("renderer:", renderer);
if (/swiftshader|llvmpipe|software/i.test(String(renderer))) {
  console.error("\n⚠ ABORTING — software rasteriser. Shading numbers would be a lie.");
  await browser.close();
  process.exit(1);
}

const begin = page.getByRole("button", { name: /begin/i });
await begin.waitFor({ state: "visible", timeout: 25000 });
await page.waitForFunction(
  () => {
    const b = [...document.querySelectorAll("button")].find((el) => /begin/i.test(el.textContent ?? ""));
    return b && !b.disabled && getComputedStyle(b).pointerEvents !== "none";
  },
  { timeout: 25000 },
);
await begin.click();
await page.waitForTimeout(SETTLE_MS);

// ⚠ ANCHORED TO THE CARD'S OWN HOVER TARGET, not to a guessed pixel box. The
// canvas spans the measured grid and the cards scale with it, so a hard-coded
// rect would be wrong at every width but one — the exact defect `CARD_BOXES`
// already caused once.
const box = await page.evaluate(() => {
  const el = document.querySelector("[data-testid='answer-card-hover-0']");
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { x: r.x, y: r.y, width: r.width, height: r.height };
});

if (!box) {
  console.error("\n⚠ CARD 1 NOT FOUND — no `answer-card-hover-0`. Nothing to measure.");
  await browser.close();
  process.exit(1);
}
console.log(`card 1: ${Math.round(box.width)}x${Math.round(box.height)} at (${Math.round(box.x)}, ${Math.round(box.y)})`);

await page.screenshot({
  path: `${OUT}/card1-${LABEL}.png`,
  clip: { x: box.x - 6, y: box.y - 6, width: box.width + 12, height: box.height + 12 },
});

/**
 * ⚠ MEASURED FROM THE COMPOSITED SCREENSHOT, NOT FROM `gl.readPixels`.
 *
 * The first version of this script read the WebGL back buffer directly and
 * reported **0.0 for every sample** — a black card, which the PNG beside it
 * plainly disproved. `preserveDrawingBuffer` defaults to false, so after the
 * frame is composited the buffer is cleared and `readPixels` returns zeros.
 * **The instrument was measuring an empty buffer and would have reported any
 * material as perfectly black**, glass and satin alike.
 *
 * ⚠ AND IT WOULD HAVE BEEN BELIEVED, because "the glass card is nearly black"
 * is exactly what this chunk expects to find. A false reading that agrees with
 * the hypothesis is the dangerous kind — this project has recorded it twice
 * already this session.
 *
 * The screenshot goes through the browser's compositor, which is the same path
 * the eye takes. It is also the only honest source here: whatever the page
 * puts on screen is what Carl judges.
 */
const shotBuf = await page.screenshot({
  clip: { x: box.x, y: box.y, width: box.width, height: box.height },
});

await browser.close();

// Decode the PNG without a dependency: Playwright gives raw PNG bytes, and
// sharp/pngjs are not in this project. A tiny inflate-based reader would be
// fragile, so the decode is done by Chromium itself in a throwaway page.
const decodeBrowser = await chromium.launch({ headless: true });
const decodePage = await decodeBrowser.newPage();
const profile = await decodePage.evaluate(async (dataUrl) => {
  const img = new Image();
  await new Promise((res, rej) => {
    img.onload = res;
    img.onerror = rej;
    img.src = dataUrl;
  });
  const c = document.createElement("canvas");
  c.width = img.width;
  c.height = img.height;
  const ctx = c.getContext("2d");
  ctx.drawImage(img, 0, 0);
  const { data, width, height } = ctx.getImageData(0, 0, img.width, img.height);

  // ⚠ THE MIDDLE THIRD ONLY, ALONG THE LONG AXIS. `CROWN_PLATEAU_U` is 0.72 —
  // the crown holds full height across the middle and rolls off at the ends, so
  // sampling the ends would mix the long-axis roll-off into a profile that is
  // supposed to describe the short axis alone.
  const x0 = Math.round(width * 0.34);
  const x1 = Math.round(width * 0.66);

  const rows = [];
  for (let y = 0; y < height; y++) {
    let sum = 0;
    let n = 0;
    for (let x = x0; x <= x1; x++) {
      const i = (y * width + x) * 4;
      // Rec. 709 luma.
      sum += 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
      n++;
    }
    if (n) rows.push(Math.round((sum / n) * 100) / 100);
  }
  return rows;
}, `data:image/png;base64,${shotBuf.toString("base64")}`);
await decodeBrowser.close();

if (!profile || profile.length < 8) {
  console.error("\n⚠ NO PROFILE READ — the canvas gave nothing back.");
  process.exit(1);
}

// ── The numbers ────────────────────────────────────────────────────────────
// ⚠ THE OUTER 12% IS TRIMMED. The rim tube sits at the face's edge and is a
// different material — including it would measure the rim's specular, not the
// crown's disclosure, and would inflate the ratio on any material.
const trim = Math.max(1, Math.round(profile.length * 0.12));
const face = profile.slice(trim, profile.length - trim);

const max = Math.max(...face);
const min = Math.min(...face);
const peakIdx = face.indexOf(max);
const peakPct = Math.round((peakIdx / (face.length - 1)) * 100);
// Guard the divide: a fully black face is a real result, not an error.
const ratio = min > 0.5 ? max / min : Infinity;

// Falls away on both sides of the peak = a curve. Monotonic ramp = a tilted
// plane. This is what a ratio alone cannot tell you.
const firstQ = face.slice(0, Math.round(face.length * 0.25));
const lastQ = face.slice(Math.round(face.length * 0.75));
const avg = (xs) => xs.reduce((a, x) => a + x, 0) / xs.length;
const bothSidesFall = avg(firstQ) < max * 0.92 && avg(lastQ) < max * 0.92;

console.log(`\n${"═".repeat(60)}`);
console.log(`CROWN DISCLOSURE — "${LABEL}", card 1, short-axis profile`);
console.log(`${"═".repeat(60)}`);
console.log(`  samples across the face      ${face.length}`);
console.log(`  brightest                    ${max.toFixed(1)}`);
console.log(`  darkest                      ${min.toFixed(1)}`);
console.log(`  ⚠ DISCLOSURE RATIO           ${ratio === Infinity ? "∞ (darkest is ~0)" : ratio.toFixed(2)}`);
console.log(`  peak sits at                 ${peakPct}% across (50% = centred)`);
console.log(`  falls away on BOTH sides     ${bothSidesFall ? "yes — reads as a CURVE" : "NO — reads as a flat ramp"}`);

console.log(`\n  Against this project's own reference points:`);
console.log(`    1.15  invisible — the contact field's 5.67° failure`);
console.log(`    1.41  still weak`);
console.log(`    1.68  the crown's geometry at 23.8° tilt (what the MESH can offer)`);
console.log(`    2.18  "only now starting to read" on the field`);

if (ratio !== Infinity && ratio < 1.2) {
  console.log(`\n  ⚠ THE FACE IS RENDERING ESSENTIALLY FLAT. The geometry is not the
    suspect — it measures 23.8° of tilt. The MATERIAL is throwing the
    disclosure away.`);
}

// A coarse profile, so the shape is visible without opening the PNG.
const step = Math.max(1, Math.floor(face.length / 24));
const bars = [];
for (let i = 0; i < face.length; i += step) {
  const v = face[i];
  const filled = max > 0 ? Math.round((v / max) * 28) : 0;
  bars.push(`   ${String(Math.round((i / (face.length - 1)) * 100)).padStart(3)}%  ${"#".repeat(filled)}${" ".repeat(28 - filled)} ${v.toFixed(1)}`);
}
console.log(`\n  PROFILE, top of face to bottom:`);
console.log(bars.join("\n"));

writeFileSync(
  `${OUT}/profile-${LABEL}.json`,
  JSON.stringify({ label: LABEL, capturedAt: new Date().toISOString(), max, min, ratio, peakPct, bothSidesFall, profile: face }, null, 2),
);

console.log(`\n  ${OUT}/card1-${LABEL}.png`);
console.log(`  ${OUT}/profile-${LABEL}.json`);
console.log(`\n  ⚠ Verification is not approval. Carl's eye decides whether it reads.\n`);
