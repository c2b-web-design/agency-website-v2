/**
 * WATCH the contact field's orbiting light — a walk across its whole circuit.
 *
 * ⚠ ONE FRAME IS NOT A MOVING OBJECT, AND THIS PROJECT HAS PAID FOR THAT TWICE.
 * A Builder described the field's faces as *"blue and lit from within"* off a
 * SINGLE frame and drew a wrong conclusion about the material from it. Carl:
 * *"did you see a single snapshot or many. this thing has an orbital light and
 * the gradient 'appears' to be animated."*
 *
 * ⚠ AND NEVER ON A DIVISOR OF THE PERIOD. The circuit is ORBIT_FRONT_MS (6000,
 * visible) + ORBIT_BACK_MS (3000, hidden) = 9000ms, and the rate is DELIBERATELY
 * VARIABLE: slow across the visible face, fast on the hidden return, so half the
 * cycle is not spent where the eye gets nothing. Sampling at 9000/n would keep
 * landing on the same phases and report a still object.
 *
 * So this samples at an interval coprime with the period, across more than one
 * full circuit, and reports the measured `--opal-shine` beside each frame — the
 * DOM button rides the same clock by PROXIMITY, not by a synced timeline.
 *
 *   node verify/field-light-walk.mjs [samples]
 */
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";
const BASE = process.env.VERIFY_BASE_URL ?? "http://localhost:3000";
const N = Number(process.argv[2] ?? 14);
mkdirSync("verify/out/fieldwalk", { recursive: true });

// 9000ms circuit; 640ms is coprime with it, so 14 samples walk ~1.0 circuits
// without repeating a phase.
const STEP_MS = 640;

const browser = await chromium.launch({ headless: false, args: ["--enable-gpu","--use-angle=default","--ignore-gpu-blocklist"] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

await page.goto(`${BASE}/start?skip=1`, { waitUntil: "networkidle" });
// Let the field's own entrance cascade finish before sampling the resting orbit.
await page.waitForTimeout(9000);

const box = await page.evaluate(() => {
  const c = document.querySelector(".enquiry-contact-layer");
  if (!c) return null;
  const b = c.getBoundingClientRect();
  return { x: Math.round(b.x), y: Math.round(b.y), width: Math.round(b.width), height: Math.round(b.height) };
});
if (!box) { console.log("⚠ contact layer not found — ?skip=1 may not have reached completion."); await browser.close(); process.exit(1); }

console.log(`\n  contact layer at ${box.width}x${box.height}`);
console.log(`  sampling every ${STEP_MS}ms across a 9000ms circuit (front 6000 visible / back 3000 hidden)\n`);
console.log("  #   t(ms)   --opal-shine");
console.log("  ────────────────────────");

for (let i = 0; i < N; i++) {
  const shine = await page.evaluate(() => {
    const el = document.documentElement;
    const v = getComputedStyle(el).getPropertyValue("--opal-shine").trim();
    return v || "(unset)";
  });
  const t = i * STEP_MS;
  console.log(`  ${String(i).padStart(2)}  ${String(t).padStart(6)}   ${shine}`);
  await page.screenshot({ path: `verify/out/fieldwalk/f${String(i).padStart(2, "0")}.png`, clip: box });
  await page.waitForTimeout(STEP_MS);
}

await browser.close();
console.log("\n  frames: verify/out/fieldwalk/");
console.log("  ⚠ Verification is not approval.");
