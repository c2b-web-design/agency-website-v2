/**
 * WHERE SHOULD THE SCENE LIGHTS SIT? A sweep, not a guess.
 *
 *   node verify/key-elevation-sweep.mjs
 *
 * ⚠ WHY THIS EXISTS. Four hand-adjustments in a row moved the key by feel and
 * three of them made it worse: [-60,90,120] pooled light in the upper middle,
 * [-140,26,60] collapsed the peak onto the top rim at 3% of the face height,
 * and a symmetric pair at y=18 did the same at 0%. **Each change was reasoned
 * about and each reading was worse than the last**, which is the signature of
 * tuning without measuring.
 *
 * ⚠ AND THE GEOMETRY ALREADY SAYS WHAT THE DIAL IS. `crownZ` puts a raised
 * cosine on the SHORT axis — the card curves top-to-bottom and is flat
 * left-to-right across `CROWN_PLATEAU_U`. A light with little ELEVATION rakes
 * along the flat axis and discloses nothing; the curve is revealed by light
 * arriving with vertical separation from the surface. So elevation is the
 * variable and everything else is held.
 *
 * WHAT IT SWEEPS. `?keyy=` sets both symmetric lights' height. For each value
 * it measures card 1's short-axis profile and reports:
 *
 *   - the disclosure ratio (brightest / darkest across the face)
 *   - WHERE the peak sits, as a percentage of face height
 *   - whether luminance falls away on BOTH sides of the peak
 *
 * ⚠ THE PEAK POSITION IS THE REAL TARGET, NOT THE RATIO. A ratio can be high
 * because a thin rim-lit line sits against a black face — which is exactly what
 * the last two attempts produced, and both scored better than the top-lit
 * version that actually looked more like a lit object. **A peak near 50% means
 * the light is on the FACE; a peak near 0% or 100% means it is on an EDGE.**
 *
 * ⚠ HEADED, --enable-gpu. Headless substitutes SwiftShader.
 */

import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const OUT = "verify/out/keysweep";
mkdirSync(OUT, { recursive: true });

const BASE = process.env.VERIFY_BASE_URL ?? "http://localhost:3000";
const SETTLE_MS = 9000;

// Elevation in world units. The face spans ~29 units on the short axis and the
// crown stands 4.5 proud, so this brackets "in the plane" to "well above".
const ELEVATIONS = [18, 40, 70, 110, 160];

const browser = await chromium.launch({
  headless: false,
  args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"],
});

async function measure(keyY) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  await page.goto(`${BASE}/start?keyy=${keyY}`, { waitUntil: "networkidle" });

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

  const box = await page.evaluate(() => {
    const el = document.querySelector("[data-testid='answer-card-hover-0']");
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: r.x, y: r.y, width: r.width, height: r.height };
  });
  if (!box) {
    await page.close();
    return null;
  }

  const buf = await page.screenshot({ path: `${OUT}/keyy-${keyY}.png`, clip: box });
  await page.close();

  const p = await browser.newPage();
  const profile = await p.evaluate(async (dataUrl) => {
    const img = new Image();
    await new Promise((res, rej) => {
      img.onload = res;
      img.onerror = rej;
      img.src = dataUrl;
    });
    const c = document.createElement("canvas");
    c.width = img.width;
    c.height = img.height;
    c.getContext("2d").drawImage(img, 0, 0);
    const { data, width, height } = c.getContext("2d").getImageData(0, 0, img.width, img.height);
    const x0 = Math.round(width * 0.34);
    const x1 = Math.round(width * 0.66);
    const rows = [];
    for (let y = 0; y < height; y++) {
      let sum = 0;
      let n = 0;
      for (let x = x0; x <= x1; x++) {
        const i = (y * width + x) * 4;
        sum += 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
        n++;
      }
      if (n) rows.push(sum / n);
    }
    return rows;
  }, `data:image/png;base64,${buf.toString("base64")}`);
  await p.close();

  // Trim the rim, as `crown-disclosure.mjs` does — it is a different material.
  const trim = Math.max(1, Math.round(profile.length * 0.12));
  const face = profile.slice(trim, profile.length - trim);
  const max = Math.max(...face);
  const min = Math.min(...face);
  const peakPct = Math.round((face.indexOf(max) / (face.length - 1)) * 100);
  const avg = (xs) => xs.reduce((a, x) => a + x, 0) / xs.length;
  const firstQ = avg(face.slice(0, Math.round(face.length * 0.25)));
  const lastQ = avg(face.slice(Math.round(face.length * 0.75)));
  return {
    keyY,
    max,
    min,
    ratio: min > 0.5 ? max / min : Infinity,
    peakPct,
    bothSidesFall: firstQ < max * 0.92 && lastQ < max * 0.92,
    mean: avg(face),
  };
}

const rows = [];
for (const y of ELEVATIONS) {
  const r = await measure(y);
  if (r) {
    rows.push(r);
    console.log(`  y=${String(y).padStart(3)}  peak ${String(r.peakPct).padStart(3)}%  ratio ${r.ratio.toFixed(2).padStart(6)}  mean ${r.mean.toFixed(1).padStart(5)}  max ${r.max.toFixed(1)}`);
  }
}

await browser.close();

console.log(`\n${"═".repeat(64)}`);
console.log(`KEY ELEVATION SWEEP — card 1, symmetric lights at ±150 x`);
console.log(`${"═".repeat(64)}`);
console.log(`  y     peak%   ratio    mean    max    reads as`);
for (const r of rows) {
  const verdict = !r.bothSidesFall
    ? "flat ramp"
    : r.peakPct < 12 || r.peakPct > 88
      ? "⚠ EDGE-LIT — light is on the rim, not the face"
      : "curve on the FACE";
  console.log(
    `  ${String(r.keyY).padStart(3)}   ${String(r.peakPct).padStart(4)}%  ${r.ratio.toFixed(2).padStart(6)}  ${r.mean.toFixed(1).padStart(6)}  ${r.max.toFixed(1).padStart(5)}   ${verdict}`,
  );
}

const onFace = rows.filter((r) => r.bothSidesFall && r.peakPct >= 12 && r.peakPct <= 88);
console.log("");
if (onFace.length) {
  // Prefer the brightest face-lit option: at this size a dim card reads flat
  // whatever its ratio, which is the trap the previous three attempts fell into.
  const best = onFace.reduce((a, b) => (b.mean > a.mean ? b : a));
  console.log(`  → FACE-LIT at y = ${onFace.map((r) => r.keyY).join(", ")}`);
  console.log(`  → Brightest of those: y = ${best.keyY} (mean ${best.mean.toFixed(1)}, peak ${best.peakPct}%)`);
} else {
  console.log(`  ⚠ NO ELEVATION PUT THE PEAK ON THE FACE. Every sample is edge-lit or
    flat, which means elevation alone is not the variable — look at the
    lights' X separation and the camera, not at this dial.`);
}
console.log(`\n  ${OUT}/`);
console.log(`\n  ⚠ Verification is not approval. Carl's eye decides.\n`);
