/**
 * CARD 3'S EXIT, FRAME BY FRAME — the "shoots off" moment.
 *
 *   node verify/card3-exit.mjs
 *
 * ⚠ CARL HAS NOW REPORTED THIS THREE TIMES AND TWO FIXES HAVE FAILED, so this
 * captures the moment itself rather than reasoning about it again. *"it still
 * shoots off. When on card 3, on the word 'enquiries' take a series of
 * snapshots, youll be able to see what i mean."*
 *
 * ⚠ THE TWO FAILED FIXES, RECORDED SO THEY ARE NOT RETRIED:
 *   1. Moving `REST_HANDOVER_AT` to 0.44 — cut the glint at 95% of its peak.
 *   2. Extending `REST_TRAVEL_MS` to 13500 and adding a 150ms bend hold —
 *      restored the glint but the exit still reads as a snatch.
 *
 * **Both treated the CLOCK. If the fault survives both, it is probably not the
 * clock** — which is what these frames are for.
 *
 * ⚠ IT CROPS TO CARD 3 ALONE and samples densely through the exit, so the
 * frames can be read in sequence like a filmstrip.
 */

import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const OUT = "verify/out/card3-exit";
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

// ⚠ t=0 IS THE CLICK. The traveller's clock starts when the component mounts,
// which is close enough to Begin for a relative filmstrip — and every frame is
// stamped with its own offset so the sequence is self-describing.
const t0 = Date.now();
await page.waitForTimeout(3000);

const clip = await page.evaluate(() => {
  const cs = [...document.querySelectorAll("canvas")];
  if (!cs.length) return null;
  const r = cs.map((c) => c.getBoundingClientRect()).sort((a, b) => b.width * b.height - a.width * a.height)[0];
  // Card 3: top row, right slot. Generous margin to the right so the frames
  // show the light LEAVING, which is the part in question.
  const cx = r.x + r.width / 2 + 192;
  const cy = r.y + r.height / 2 - 28;
  return { x: cx - 120, y: cy - 40, width: 300, height: 80 };
});
if (!clip) {
  console.log("⚠ no canvas found.");
  await browser.close();
  process.exit(1);
}

/**
 * The circuit is 13500 + 150 + 350 = 14000ms. Card 3's glint peaks around phase
 * 0.41 (~11800ms into the pass) and the pass ends at 13500ms, so the exit lives
 * in roughly 11500–14000ms. Sampled every 150ms across that window and a little
 * beyond, so the handover and the race are both inside the strip.
 */
const FROM = 11200;
const TO = 14300;
const STEP = 150;

console.log(`filmstrip of card 3, ${FROM}ms → ${TO}ms after Begin, every ${STEP}ms\n`);

const readings = [];
for (let target = FROM; target <= TO; target += STEP) {
  const wait = t0 + target - Date.now();
  if (wait > 0) await page.waitForTimeout(wait);
  const name = `c3-${String(target).padStart(5, "0")}.png`;
  const buf = await page.screenshot({ path: `${OUT}/${name}`, clip });
  const mean = await page.evaluate(async (s) => {
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
  }, buf.toString("base64"));
  readings.push({ target, mean });
}

const mn = Math.min(...readings.map((r) => r.mean));
const mx = Math.max(...readings.map((r) => r.mean));
console.log("     t        mean    profile");
for (const r of readings) {
  const bar = "#".repeat(Math.round(((r.mean - mn) / Math.max(0.001, mx - mn)) * 50));
  const note = r.target >= 13500 && r.target < 13650 ? "  <- HOLD" : r.target >= 13650 ? "  <- RACE" : "";
  console.log(`  ${String(r.target).padStart(5)}ms  ${r.mean.toFixed(2).padStart(6)}  ${bar}${note}`);
}

// How fast does it fall, per 150ms step?
console.log("\n  drop per step across the exit:");
for (let i = 1; i < readings.length; i++) {
  const d = readings[i].mean - readings[i - 1].mean;
  if (readings[i].target >= 12700) {
    console.log(
      `    ${String(readings[i - 1].target).padStart(5)} → ${String(readings[i].target).padStart(5)}   ${d >= 0 ? "+" : ""}${d.toFixed(2)}`,
    );
  }
}

console.log(`\n  frames: ${OUT}/\n`);
await browser.close();
