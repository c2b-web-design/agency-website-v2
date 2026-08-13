/**
 * ⚠ IS THE WANDERING ~650ms WALK SPIKE A GARBAGE COLLECTION PAUSE?
 *
 * State of the hunt, 11 August 2026:
 *   - The contact-field pre-warm was named by the Architect and FALSIFIED — it
 *     is created at Begin+~5340ms, deterministically, while the big spikes land
 *     at +10046 / +12588 / +14741 / +14889 / +14978ms.
 *   - A "walk depth" correlation looked promising (Q3→Q2 and Q2→Q1, never
 *     Q5→Q4) and then broke: a 794ms spike landed on Q4→Q3.
 *
 * **What fits: something that fires roughly once per walk, at a moment set by
 * ACCUMULATED work rather than by the step number.** That is the signature of a
 * major GC, and this page hands it a strong motive:
 *
 *   ⚠ EVERY QUESTION STEP ALLOCATES AND DISCARDS FIVE 4 MiB LABEL TEXTURES —
 *   ~20 MiB, ~27 MiB with mip chains. `labelCanvasCache` does NOT help across
 *   questions (different text, different key), so each step paints five fresh
 *   canvases and drops the previous five. **A walk churns ~100 MiB.**
 *
 * ⚠⚠ THIS HARNESS CANNOT PROVE A GC PAUSE — the web platform exposes no GC
 * event to page script. It measures the two things that WOULD move if the
 * hypothesis were right, and either result is informative:
 *
 *   ARM A  --js-flags="--expose-gc", forcing a full GC in each DWELL window,
 *          so the collector never has to run inside a move.
 *   ARM B  identical build and flags, no forced GC (the control).
 *
 * **If forcing GC in the dwell removes the spikes → the hypothesis holds and
 * the fix is to stop churning textures per step.** If the spikes survive it,
 * GC is cleared and the hunt moves on.
 *
 * ⚠ THE CONTROL MUST CARRY THE SAME `--expose-gc` FLAG. Changing the flag
 * between arms would make the flag an uncontrolled variable — this project has
 * already lost a day to an A/B where the arms differed in more than one thing.
 *
 *   VERIFY_BASE_URL=http://localhost:3100 node verify/walk-spike-gc.mjs 5
 */

import { chromium } from "@playwright/test";

const BASE = process.env.VERIFY_BASE_URL ?? "http://localhost:3100";
const ROUNDS = Number(process.argv[2] ?? 5);
const SPIKE_MS = 300;

if (/:3000(\/|$)/.test(BASE)) {
  console.error("\n⚠⚠ REFUSING TO RUN AGAINST :3000.\n");
  process.exit(1);
}

const browser = await chromium.launch({
  headless: false,
  args: [
    "--enable-gpu",
    "--use-gl=angle",
    "--ignore-gpu-blocklist",
    // ⚠ PRESENT IN BOTH ARMS — see the header.
    "--js-flags=--expose-gc",
  ],
});

const STEPS = ["Q5→Q4", "Q4→Q3", "Q3→Q2", "Q2→Q1"];

async function walk(forceGc) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(`${BASE}/start`, { waitUntil: "networkidle" });

  await page.evaluate(() => {
    window.__gw = { frames: [], begin: 0 };
    const tick = () => {
      window.__gw.frames.push(performance.now());
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });

  await page.getByRole("button", { name: /begin/i }).click();
  await page.evaluate(() => { window.__gw.begin = performance.now(); });
  await page.locator(".enquiry-answer-grid").waitFor({ state: "visible", timeout: 30000 });
  await page.waitForTimeout(5200);

  const gcAvailable = await page.evaluate(() => typeof window.gc === "function");

  // The step names are documentation here — the walk is four identical
  // select-and-advance actions and the loop does not need to know which.
  for (let s = 0; s < STEPS.length; s++) {
    await page.getByTestId("answer-card-hover-0").click();
    await page.waitForTimeout(400);

    // ⚠ THE ARM: collect in the DWELL, before the move starts, so the collector
    // has nothing left to do inside the animating window.
    if (forceGc && gcAvailable) {
      await page.evaluate(() => window.gc());
    }
    await page.waitForTimeout(300);

    await page.getByRole("button", { name: /next step/i }).click();
    await page.waitForTimeout(1600);
  }

  const out = await page.evaluate((spikeMs) => {
    const d = window.__gw;
    const gaps = [];
    for (let i = 1; i < d.frames.length; i++) {
      const gap = d.frames[i] - d.frames[i - 1];
      if (gap >= spikeMs) {
        gaps.push({ gap: Math.round(gap), at: Math.round(d.frames[i - 1] - d.begin) });
      }
    }
    return gaps;
  }, SPIKE_MS);

  await page.close();
  return { gaps: out, gcAvailable };
}

const ARMS = [
  { name: "no forced GC", force: false },
  { name: "GC in dwell", force: true },
];
const results = new Map(ARMS.map((a) => [a.name, { walks: 0, spiked: 0, gaps: [] }]));
let gcChecked = false;

console.log(`\nbase ${BASE} — ${ROUNDS} interleaved round(s)\n`);

for (let round = 1; round <= ROUNDS; round++) {
  const order = ARMS.map((_, i) => ARMS[(i + round - 1) % ARMS.length]);
  for (const arm of order) {
    const { gaps, gcAvailable } = await walk(arm.force);
    if (!gcChecked) {
      gcChecked = true;
      if (!gcAvailable) {
        console.error("\n⚠⚠ window.gc IS NOT AVAILABLE — --expose-gc did not take.");
        console.error("   Both arms would be identical. Aborting rather than");
        console.error("   reporting a null result that means nothing.\n");
        await browser.close();
        process.exit(1);
      }
    }
    const r = results.get(arm.name);
    r.walks++;
    if (gaps.length) r.spiked++;
    r.gaps.push(...gaps.map((g) => g.gap));
    const desc = gaps.length
      ? gaps.map((g) => `${g.gap}ms@+${g.at}`).join("  ")
      : "clean";
    console.log(`  round ${round}  ${arm.name.padEnd(13)} ${desc}`);
  }
}

await browser.close();

console.log("\n══════════════════════════════════════════════════");
for (const arm of ARMS) {
  const r = results.get(arm.name);
  const worst = r.gaps.length ? Math.max(...r.gaps) : 0;
  console.log(
    `  ${arm.name.padEnd(13)}  ${r.spiked}/${r.walks} walks spiked   worst ${worst}ms`,
  );
}
console.log("══════════════════════════════════════════════════");
console.log("\n  Forcing GC in the dwell should REMOVE the spikes if they are");
console.log("  collection pauses driven by per-step texture churn.");
console.log("\n⚠ A NULL RESULT CLEARS GC — it does not prove the churn is harmless,");
console.log("  only that the collector is not what stalls the move.");
