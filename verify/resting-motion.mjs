/**
 * DOES THE RESTING LIGHT ACTUALLY MOVE, AND DOES THE FACE SHOW IT?
 *
 *   node verify/resting-motion.mjs
 *
 * ⚠ TWO SEPARATE QUESTIONS, AND THE SECOND IS THE ONE THAT MATTERS. A light can
 * move perfectly while the surface shows nothing — that is precisely what the
 * y=18 rake did, and what the contact field's 5.67° crown did before it. Carl's
 * brief is *"the light should move bringing out the 3d qualities of the cards...
 * We need to see the transition of the shadows and light on the faces."*
 *
 * ⚠ SO THIS MEASURES THE FACE, NOT THE LIGHT. It samples card 1's short-axis
 * luminance profile repeatedly across a full cycle and reports how far the
 * bloom's PEAK migrates and how much the exposure changes.
 *
 * WHAT A PASS LOOKS LIKE:
 *   - the peak MOVES across the face (the bloom migrates — the 3D is disclosed)
 *   - the mean luminance stays roughly CONSTANT (no ambient pulsing)
 *
 * ⚠ THE SECOND IS AS IMPORTANT AS THE FIRST. The two lights move in antiphase
 * specifically so the BALANCE shifts without the exposure throbbing. If mean
 * luminance swings, the cards are pulsing brighter and dimmer — an ambient
 * throb, and the thing "slow, small" is guarding against.
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
const OUT = "verify/out/resting";
mkdirSync(OUT, { recursive: true });
const BASE = "http://localhost:3000";
// SCENE_LIGHT_CYCLE_MS is 14000. Sample across a full cycle plus a margin.
const CYCLE_MS = 14000;
const SAMPLES = 8;

const browser = await chromium.launch({ headless: false, args: ["--enable-gpu","--use-angle=default","--ignore-gpu-blocklist"] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
await page.goto(`${BASE}/start`, { waitUntil: "networkidle" });
const begin = page.getByRole("button", { name: /begin/i });
await begin.waitFor({ state: "visible", timeout: 25000 });
await page.waitForFunction(() => { const b=[...document.querySelectorAll("button")].find(el=>/begin/i.test(el.textContent??"")); return b && !b.disabled && getComputedStyle(b).pointerEvents!=="none"; }, { timeout: 25000 });
await begin.click();
await page.waitForTimeout(9000);

const box = await page.evaluate(() => {
  const el = document.querySelector("[data-testid='answer-card-hover-0']");
  const r = el.getBoundingClientRect();
  return { x: r.x, y: r.y, width: r.width, height: r.height };
});

async function profile(tag) {
  const buf = await page.screenshot({ path: `${OUT}/${tag}.png`, clip: box });
  const p = await browser.newPage();
  const rows = await p.evaluate(async (u) => {
    const img = new Image();
    await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = u; });
    const c = document.createElement("canvas");
    c.width = img.width; c.height = img.height;
    c.getContext("2d").drawImage(img, 0, 0);
    const { data, width, height } = c.getContext("2d").getImageData(0, 0, img.width, img.height);
    // ⚠ AVOID THE LABEL BAND. The glyphs are near-white and would dominate any
    // luminance profile — the question is what the SURFACE is doing.
    const x0 = Math.round(width * 0.04), x1 = Math.round(width * 0.16);
    const out = [];
    for (let y = 0; y < height; y++) {
      let s = 0, n = 0;
      for (let x = x0; x <= x1; x++) { const i=(y*width+x)*4; s += 0.2126*data[i]+0.7152*data[i+1]+0.0722*data[i+2]; n++; }
      out.push(s/n);
    }
    return out;
  }, `data:image/png;base64,${buf.toString("base64")}`);
  await p.close();
  const trim = Math.max(1, Math.round(rows.length * 0.12));
  const face = rows.slice(trim, rows.length - trim);
  const max = Math.max(...face);
  const peakPct = Math.round((face.indexOf(max) / (face.length - 1)) * 100);
  const mean = face.reduce((a,x)=>a+x,0) / face.length;
  return { peakPct, mean, max };
}

const rows = [];
for (let i = 0; i < SAMPLES; i++) {
  const r = await profile(`t${i}`);
  rows.push(r);
  console.log(`  sample ${i}  peak ${String(r.peakPct).padStart(3)}%   mean ${r.mean.toFixed(1).padStart(5)}   max ${r.max.toFixed(1)}`);
  if (i < SAMPLES - 1) await page.waitForTimeout(Math.round(CYCLE_MS / SAMPLES));
}
await browser.close();

const peaks = rows.map(r => r.peakPct);
const means = rows.map(r => r.mean);
const peakRange = Math.max(...peaks) - Math.min(...peaks);
const meanRange = Math.max(...means) - Math.min(...means);
const meanAvg = means.reduce((a,x)=>a+x,0)/means.length;

console.log(`\n${"═".repeat(58)}`);
console.log(`RESTING LIGHT MOTION — card 1, ${SAMPLES} samples over one cycle`);
console.log(`${"═".repeat(58)}`);
console.log(`  peak position range   ${peakRange}%   (the bloom migrating)`);
console.log(`  mean luminance range  ${meanRange.toFixed(1)}  on a mean of ${meanAvg.toFixed(1)}  (${(meanRange/meanAvg*100).toFixed(1)}%)`);
console.log("");
if (peakRange < 3) {
  console.log(`  ⚠ THE BLOOM IS NOT MIGRATING (${peakRange}%). The light may be moving`);
  console.log(`    while the FACE shows nothing — check the swing is on elevation,`);
  console.log(`    not azimuth: the crown curves on the short axis only.`);
} else if (meanRange / meanAvg > 0.12) {
  console.log(`  ⚠ THE EXPOSURE IS PULSING (${(meanRange/meanAvg*100).toFixed(1)}%). The cards are getting`);
  console.log(`    brighter and dimmer rather than turning — check the two lights`);
  console.log(`    are in ANTIPHASE.`);
} else {
  console.log(`  ✅ THE BLOOM MIGRATES ${peakRange}% ACROSS THE FACE while exposure holds`);
  console.log(`     to ${(meanRange/meanAvg*100).toFixed(1)}%. The surface is turning, not pulsing.`);
}
console.log(`\n  ${OUT}/`);
console.log(`\n  ⚠ Verification is not approval. Carl's eye decides if it reads.\n`);
