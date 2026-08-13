/**
 * ⚠ WHAT IS THE ~670ms SPIKE THAT WANDERS BETWEEN WALK STEPS?
 *
 * `verify/walk-cost.mjs` measured all four corridor steps at ~100ms — but with
 * a **~660-690ms spike appearing once per walk, on a DIFFERENT step each time**
 * (Q3→Q2 in one run, Q2→Q1 in two others, absent in four).
 *
 * ⚠⚠ A MEDIAN HIDES IT AND IT IS SEVEN TIMES THE STUTTER UNDER INVESTIGATION.
 *
 * **The suspect, and this harness exists to confirm or clear it, not to assume
 * it:** the CONTACT FIELD's WebGL pre-warm. `enquiry-opening.tsx:1023` schedules
 * `setCanvasWarm(true)` via `requestIdleCallback(..., { timeout: 2000 })`.
 *
 *   - The pre-warm is deliberate and CORRECT in intent — it exists because the
 *     contact canvas used to mount at `complete` and stalled "Understood."
 *   - But `enquiry-opening.tsx` also records, as settled fact, that this page
 *     **animates without a break from 600ms to 12400ms** and that
 *     `requestIdleCallback` never finds genuine idle here — **its timeout is
 *     the only path**. A 2000ms timeout during a questionnaire fires wherever
 *     the visitor happens to be, which would be a DIFFERENT step every walk.
 *
 * **That is exactly the observed signature.** It is a hypothesis until this
 * harness ties a context creation to the spike in the same run.
 *
 * ⚠ IF CONFIRMED IT IS NOT THE CORRIDOR'S FAULT and no restructure of the
 * answer cards will remove it — it is a second, unrelated defect that happens
 * to land in the same window. **Attributing it to the corridor would send the
 * next fix to the wrong file.**
 *
 *   VERIFY_BASE_URL=http://localhost:3100 node verify/walk-spike-source.mjs 4
 */

import { chromium } from "@playwright/test";

const BASE = process.env.VERIFY_BASE_URL ?? "http://localhost:3100";
const RUNS = Number(process.argv[2] ?? 4);

if (/:3000(\/|$)/.test(BASE)) {
  console.error("\n⚠⚠ REFUSING TO RUN AGAINST :3000.\n");
  process.exit(1);
}

const browser = await chromium.launch({
  headless: false,
  args: ["--enable-gpu", "--use-gl=angle", "--ignore-gpu-blocklist"],
});

const STEPS = ["Q5→Q4", "Q4→Q3", "Q3→Q2", "Q2→Q1"];
let spikes = 0;
let spikesWithContext = 0;

for (let run = 1; run <= RUNS; run++) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  // Instrument BEFORE any script runs: every WebGL context creation, with a
  // timestamp and the canvas's own size so the two canvases can be told apart.
  await page.addInitScript(() => {
    const W = window;
    W.__ctx = [];
    const orig = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...rest) {
      const started = performance.now();
      const ctx = orig.call(this, type, ...rest);
      if (String(type).includes("webgl")) {
        W.__ctx.push({
          at: started,
          dur: Math.round((performance.now() - started) * 100) / 100,
          w: this.width,
          h: this.height,
          cls: this.className || "(none)",
        });
      }
      return ctx;
    };
  });

  await page.goto(`${BASE}/start`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /begin/i }).click();
  await page.locator(".enquiry-answer-grid").waitFor({ state: "visible", timeout: 30000 });
  await page.waitForTimeout(5200);

  console.log(`\n── run ${run} ──`);

  for (const step of STEPS) {
    await page.getByTestId("answer-card-hover-0").click();
    await page.waitForTimeout(700);

    // Mark where this step's window begins, and clear nothing — the context log
    // is cumulative so a creation can be attributed to the window it fell in.
    const windowStart = await page.evaluate(() => {
      window.__wk = { frames: [] };
      const tick = () => {
        window.__wk.frames.push(performance.now());
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      return performance.now();
    });

    await page.getByRole("button", { name: /next step/i }).click();
    await page.waitForTimeout(1600);

    const out = await page.evaluate((start) => {
      const f = window.__wk.frames;
      let worst = 0;
      let worstAt = 0;
      for (let i = 1; i < f.length; i++) {
        if (f[i] - f[i - 1] > worst) {
          worst = f[i] - f[i - 1];
          worstAt = f[i - 1];
        }
      }
      const inWindow = window.__ctx.filter((c) => c.at >= start);
      return {
        worst: Math.round(worst),
        worstAt: Math.round(worstAt - start),
        contexts: inWindow.map((c) => ({
          rel: Math.round(c.at - start),
          dur: c.dur,
          size: `${c.w}x${c.h}`,
          cls: c.cls,
        })),
      };
    }, windowStart);

    const isSpike = out.worst > 300;
    if (isSpike) spikes++;
    if (isSpike && out.contexts.length) spikesWithContext++;

    const flag = isSpike ? "  ⚠ SPIKE" : "";
    console.log(`   ${step}   ${String(out.worst).padStart(4)}ms at +${out.worstAt}ms${flag}`);
    for (const c of out.contexts) {
      console.log(`       └─ WebGL context created at +${c.rel}ms  ${c.size}  ${c.dur}ms  class="${c.cls}"`);
    }
    if (isSpike && !out.contexts.length) {
      console.log(`       └─ ⚠ NO context created in this window — the suspect is CLEARED here.`);
    }
  }

  await page.close();
}

await browser.close();

console.log("\n══════════════════════════════════════════════════");
console.log(`  spikes (>300ms):                 ${spikes}`);
console.log(`  spikes with a context created:   ${spikesWithContext}`);
console.log("══════════════════════════════════════════════════");
if (spikes && spikesWithContext === spikes) {
  console.log("\n  ✅ EVERY SPIKE COINCIDES WITH A WebGL CONTEXT CREATION.");
  console.log("     Check the size/class above: the CONTACT FIELD canvas is a");
  console.log("     different element from `.enquiry-answer-grid`'s.");
} else if (spikes) {
  console.log("\n  ⚠ NOT EVERY SPIKE HAS A CONTEXT. The suspect does not explain");
  console.log("     all of them — do not close this on a partial match.");
} else {
  console.log("\n  No spike reproduced in this batch. It is intermittent;");
  console.log("  absence here is not evidence it is gone.");
}
