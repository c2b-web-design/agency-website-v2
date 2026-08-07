/**
 * Per-frame deltas for each card's rise — is a jump STARVATION or ARITHMETIC?
 *
 * ⚠ `entrance-fade.mjs` reports that cards 2-4 skip 28%/56%/76% of their rise in
 * one sample. That number alone cannot say WHY, and the two causes need
 * opposite fixes:
 *
 *   - STARVATION: the frame gap (`dt`) is huge — the main thread was blocked, so
 *     `raw` advanced correctly against a clock that jumped. The rise is fine and
 *     the compile is the problem.
 *   - ARITHMETIC: `dt` is a normal ~16ms but `raw` still leaps — the progress
 *     calculation itself is wrong, and no amount of thread headroom fixes it.
 *
 * So this prints `dt` beside `draw` for the opening samples of each card. The
 * pair is the diagnosis; either number alone is a guess.
 *
 *   node verify/entrance-frames.mjs
 */

import { chromium } from "@playwright/test";

const BASE = process.env.VERIFY_BASE_URL ?? "http://localhost:3000";

const browser = await chromium.launch({
  headless: false,
  args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

await page.goto(`${BASE}/start?beattrace=1`, { waitUntil: "networkidle" });
await page.getByRole("button", { name: /begin/i }).click();
await page.getByTestId("answer-card-hover-0").waitFor({ timeout: 20000 });
await page.waitForTimeout(11000);

const trace = await page.evaluate(() => window.__cardTrace ?? []);
await browser.close();

if (!trace.length) {
  console.log("⚠ NO TRACE — `?beattrace=1` published nothing.");
  process.exit(1);
}

const t0 = Math.min(...trace.map((e) => e.t));
const cards = [...new Set(trace.map((e) => e.card))].sort((a, b) => a - b);

for (const card of cards) {
  const mine = trace.filter((e) => e.card === card).sort((a, b) => a.t - b.t);
  const moving = mine.filter((e) => e.raw > 0 && e.raw < 1);
  if (!moving.length) continue;

  // The worst single advance, and the frame gap that produced it.
  let worst = { dr: 0, dt: 0, at: 0 };
  for (let i = 1; i < moving.length; i++) {
    const dr = moving[i].raw - moving[i - 1].raw;
    if (dr > worst.dr) {
      worst = { dr, dt: moving[i].t - moving[i - 1].t, at: moving[i].t - t0 };
    }
  }

  console.log(`\n── card ${card} ──`);
  console.log(`  samples in rise   ${moving.length}`);
  console.log(
    `  worst advance     +${(worst.dr * 100).toFixed(1)}% over ${worst.dt}ms at t=${worst.at}ms`,
  );
  // 2000ms at 60fps is ~0.8%/frame. A 16ms gap carrying 28% is arithmetic;
  // a 560ms gap carrying 28% is exactly what a blocked thread looks like.
  const expected = (worst.dt / 2000) * 100;
  console.log(`  expected for ${String(worst.dt).padStart(4)}ms  +${expected.toFixed(1)}%`);
  console.log(
    worst.dr * 100 > expected * 2 + 1
      ? `  ⚠ ARITHMETIC — raw advanced far more than the elapsed time allows.`
      : `  ✅ consistent with the clock — this is a FRAME GAP (starvation), not bad maths.`,
  );

  console.log(`  first 8 frames:`);
  moving.slice(0, 8).forEach((e, i, arr) => {
    const dt = i ? e.t - arr[i - 1].t : 0;
    const dr = i ? e.raw - arr[i - 1].raw : 0;
    console.log(
      `    t=${String(e.t - t0).padStart(5)}ms  dt=${String(dt).padStart(4)}ms  raw=${e.raw.toFixed(3)}  ${dr >= 0 ? "+" : ""}${(dr * 100).toFixed(1)}%`,
    );
  });
}
