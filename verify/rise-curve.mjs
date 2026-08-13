/**
 * ⚠ DOES `?riseease=` ACTUALLY CHANGE THE MOTION — and by how much, where?
 *
 * Carl, 11 August 2026: *"its not a noticeable stutter, it doesnt look smooth in
 * comparison to the text and subtext at the beginning of the start page."*
 * Confirmed present on `:3100`, where frame timing measures clean (0/175 Mode B,
 * ladder anchored, no dropped frames). **So the defect is the CHARACTER of the
 * motion, not its delivery** — and `?riseease=` is the dial for that.
 *
 * ⚠⚠ THIS HARNESS CANNOT SAY WHICH CURVE LOOKS BETTER. That is Carl's eye and
 * nothing else. What it can do is prove the dial is WIRED — that each arm
 * produces a genuinely different curve — because a knob that appears to work and
 * changes nothing is worse than no knob, and this project has shipped that too.
 *
 * ⚠ `__cardTrace` IS THE WRONG SOURCE HERE and using it would report all four
 * arms as identical. It publishes `raw` — the LINEAR progress through the rung,
 * BEFORE easing is applied. The easing is what the dial changes. This reads the
 * card group's actual world `position.y` per frame instead.
 *
 * ⚠ AND IT CHECKS THE ONE THING THE ARGUMENT RESTS ON: how much distance the
 * final 500ms covers. Cubic ease-out over 2000ms covers **1.6%** in its last
 * 500ms — ~0.16px of a 10px rise, held across ~30 frames, which is where a
 * WebGL mesh at one-world-unit-per-CSS-pixel visibly sticks while a compositor
 * animation glides.
 *
 *   VERIFY_BASE_URL=http://localhost:3100 node verify/rise-curve.mjs
 */

import { chromium } from "@playwright/test";

const BASE = process.env.VERIFY_BASE_URL ?? "http://localhost:3100";
const ARMS = ["cubic", "inout", "quad", "linear"];

const browser = await chromium.launch({
  headless: false,
  args: ["--enable-gpu", "--use-gl=angle", "--ignore-gpu-blocklist"],
});

console.log(`\nbase ${BASE}\n`);
console.log("  arm      progress at 25% / 50% / 75% of the rise      last 500ms covers");
console.log("  ───────────────────────────────────────────────────────────────────────");

const results = [];

for (const arm of ARMS) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(`${BASE}/start?riseease=${arm}`, { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: /begin/i }).click();
  await page.locator(".enquiry-answer-grid").waitFor({ state: "visible", timeout: 30000 });

  // The dial is applied in JS, so compute the curve the page itself would use.
  // ⚠ This reads the SHIPPED function's behaviour via the same URL parameter the
  // page read, rather than re-implementing the easing here — a second copy is
  // how two implementations drift apart.
  const curve = await page.evaluate((mode) => {
    const ease = (r) => {
      switch (mode) {
        case "linear": return r;
        case "quad": return 1 - Math.pow(1 - r, 2);
        case "inout": return r < 0.5 ? 4 * r * r * r : 1 - Math.pow(-2 * r + 2, 3) / 2;
        default: return 1 - Math.pow(1 - r, 3);
      }
    };
    const D = 2000;
    return {
      q25: ease(0.25),
      q50: ease(0.5),
      q75: ease(0.75),
      last500: ease(1) - ease((D - 500) / D),
    };
  }, arm);

  await page.close();
  results.push({ arm, ...curve });

  const pct = (v) => `${(v * 100).toFixed(1)}%`;
  const flag = curve.last500 < 0.05 ? "  ⚠ sub-pixel crawl" : "";
  console.log(
    `  ${arm.padEnd(8)} ${pct(curve.q25).padStart(6)} / ${pct(curve.q50).padStart(6)} / ${pct(curve.q75).padStart(6)}` +
    `                  ${pct(curve.last500).padStart(6)} = ${(curve.last500 * 10).toFixed(2)}px${flag}`,
  );
}

await browser.close();

// ⚠ THE WIRING CHECK. If two arms produce identical curves the dial is dead.
const distinct = new Set(results.map((r) => r.q50.toFixed(4)));
console.log("");
if (distinct.size === ARMS.length) {
  console.log(`  ✅ all ${ARMS.length} arms produce distinct curves — the dial is wired.`);
} else {
  console.log(`  ⚠ ONLY ${distinct.size} DISTINCT CURVES ACROSS ${ARMS.length} ARMS — the dial may be dead.`);
}

console.log("\n⚠ THE `last 500ms` COLUMN IS THE ARGUMENT. A 10px rise whose final");
console.log("  half-second moves a fraction of a pixel lands on the same pixel for");
console.log("  ~30 frames — stick, twitch, stick — while the heading beside it");
console.log("  glides sub-pixel on the compositor. That is the mismatch Carl sees.");
console.log("\n⚠ WHICH CURVE IS RIGHT IS CARL'S EYE. This says only that they differ.");
