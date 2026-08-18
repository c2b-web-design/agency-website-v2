/**
 * ⚠⚠ THE DECISIVE TEST: IS THE ~670ms SPIKE A 43% EVENT, OR A 100% EVENT THAT
 * LANDS INSIDE A MEASURED WINDOW 43% OF THE TIME?
 *
 * Architect, 11 August 2026. `walk-cost.mjs` measures only the 1600ms after
 * each Next step click. **A freeze landing in the DWELL time between steps is
 * invisible to it** — so "3 of 7 walks" may be a sampling artefact, not a
 * frequency.
 *
 * **The prediction, and it is falsifiable in one run:**
 *
 *   7 of 7, once each, at ≈ Begin+2949ms  → the contact-field pre-warm.
 *                                            Diagnosis confirmed, stop hunting.
 *   still 3 of 7                          → the Architect is wrong and the
 *                                            other candidates are back in play.
 *
 * ⚠ THIS SAMPLES CONTINUOUSLY FROM BEGIN — every step AND every dwell — so
 * nothing can hide between windows. It also reads:
 *
 *   - `contact-field-canvas-created`  the mark added 11 August, which is what
 *                                     tells this canvas apart from the answer
 *                                     cards' (both are unsized 300x150 to a
 *                                     `getContext` hook — the blindness that
 *                                     made the previous instrument useless)
 *   - `card-canvas-created` / `warmup-canvas-created`   the established marks
 *   - `?warmtrace=1`'s `__warmTrace`  the guard's own record of when it
 *                                     released, which `enquiry-opening.tsx:978`
 *                                     put there for exactly this question
 *
 *   VERIFY_BASE_URL=http://localhost:3100 node verify/walk-dwell.mjs 7
 */


// ⚠⚠ MARK NAMING CORRECTED 18 August 2026 — READ IF A FIGURE HERE LOOKS ODD.
//
// `answer-card-canvas.tsx` used to name its marks from `warm && !active`, and
// `warm` DEFAULTS TO TRUE. On the shared-host builds (14–18 August) the REAL
// canvas therefore emitted `warmup-canvas-*` and `card-canvas-*` never fired.
// **The marks are now named unconditionally: `card-canvas-created` /
// `card-canvas-compiled`, because there is exactly one canvas and it is the real
// one.**
//
// ⚠ CONSEQUENCE FOR THIS SCRIPT: on a build from 14–18 August it may resolve
// nothing, or resolve the wrong canvas. On the current build it is correct.
// ⚠ FIGURES RECORDED FROM THOSE BUILDS SHOULD BE TREATED AS NAME-AMBIGUOUS.

import { chromium } from "@playwright/test";

const BASE = process.env.VERIFY_BASE_URL ?? "http://localhost:3100";
const RUNS = Number(process.argv[2] ?? 7);
const SPIKE_MS = 300;

if (/:3000(\/|$)/.test(BASE)) {
  console.error("\n⚠⚠ REFUSING TO RUN AGAINST :3000.\n");
  process.exit(1);
}

const browser = await chromium.launch({
  headless: false,
  args: ["--enable-gpu", "--use-gl=angle", "--ignore-gpu-blocklist"],
});

const STEPS = ["Q5→Q4", "Q4→Q3", "Q3→Q2", "Q2→Q1"];
let walksWithSpike = 0;
const spikeOffsets = [];

for (let run = 1; run <= RUNS; run++) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(`${BASE}/start?warmtrace=1`, { waitUntil: "networkidle" });

  if (run === 1) {
    const renderer = await page.evaluate(() => {
      const gl = document.createElement("canvas").getContext("webgl2");
      if (!gl) return "no webgl";
      const ext = gl.getExtension("WEBGL_debug_renderer_info");
      return ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : "unknown";
    });
    if (/swiftshader|llvmpipe|software|no webgl/i.test(renderer)) {
      console.error(`\n⚠ ABORTING — "${renderer}" is a software rasteriser.\n`);
      await browser.close();
      process.exit(1);
    }
    console.log(`renderer: ${renderer}\nbase:     ${BASE}\n`);
  }

  // ⚠ SAMPLING STARTS AT BEGIN AND NEVER STOPS. The whole point is that no
  // window is unobserved.
  await page.evaluate(() => {
    window.__dw = { frames: [], begin: 0, steps: [] };
    const tick = () => {
      window.__dw.frames.push(performance.now());
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });

  await page.getByRole("button", { name: /begin/i }).click();
  await page.evaluate(() => { window.__dw.begin = performance.now(); });

  await page.locator(".enquiry-answer-grid").waitFor({ state: "visible", timeout: 30000 });
  await page.waitForTimeout(5200);

  for (const step of STEPS) {
    await page.getByTestId("answer-card-hover-0").click();
    await page.waitForTimeout(700);
    await page.evaluate((name) => {
      window.__dw.steps.push({ name, clicked: performance.now() });
    }, step);
    await page.getByRole("button", { name: /next step/i }).click();
    await page.waitForTimeout(1600);
  }

  const out = await page.evaluate((spikeMs) => {
    const d = window.__dw;
    const gaps = [];
    for (let i = 1; i < d.frames.length; i++) {
      const gap = d.frames[i] - d.frames[i - 1];
      if (gap >= spikeMs) {
        gaps.push({ gap: Math.round(gap), atFromBegin: Math.round(d.frames[i - 1] - d.begin) });
      }
    }
    const markAt = (name) => {
      const m = performance.getEntriesByName(name)[0];
      return m ? Math.round(m.startTime - d.begin) : null;
    };
    return {
      gaps,
      steps: d.steps.map((s) => ({ name: s.name, at: Math.round(s.clicked - d.begin) })),
      contactMark: markAt("contact-field-canvas-created"),
      warmTrace: (window.__warmTrace || []).map((w) => w.t),
    };
  }, SPIKE_MS);

  const label = (offset) => {
    // Which window did it land in — a measured step, or dwell time?
    for (const s of out.steps) {
      if (offset >= s.at && offset <= s.at + 1600) return `inside ${s.name}`;
    }
    return "DWELL (invisible to walk-cost.mjs)";
  };

  console.log(`── run ${run} ──`);
  if (out.contactMark !== null) {
    console.log(`   contact canvas created at Begin+${out.contactMark}ms`);
  } else {
    console.log(`   ⚠ contact canvas mark NOT FOUND (rebuild? mark not added?)`);
  }
  if (out.gaps.length === 0) {
    console.log(`   no gap ≥${SPIKE_MS}ms anywhere from Begin`);
  }
  for (const g of out.gaps) {
    console.log(`   ⚠ ${g.gap}ms at Begin+${g.atFromBegin}ms   ${label(g.atFromBegin)}`);
    spikeOffsets.push(g.atFromBegin);
  }
  if (out.gaps.length) walksWithSpike++;

  await page.close();
}

await browser.close();

console.log("\n══════════════════════════════════════════════════");
console.log(`  walks with a ≥${SPIKE_MS}ms gap:  ${walksWithSpike} of ${RUNS}`);
if (spikeOffsets.length) {
  const sorted = [...spikeOffsets].sort((a, b) => a - b);
  console.log(`  offsets from Begin:      ${sorted.join(", ")}ms`);
  console.log(`  median offset:           ${sorted[Math.floor(sorted.length / 2)]}ms`);
}
console.log("══════════════════════════════════════════════════");
console.log("\n  PREDICTION: 7/7 at ≈Begin+2949ms → the contact-field pre-warm,");
console.log("  released by a guard anchored to Q5's ladder only. Diagnosis closed.");
console.log("  Still ~3/7, or offsets scattered → the suspect is NOT confirmed.");
