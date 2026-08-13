/**
 * ⚠ WHAT DOES EVERY STEP OF THE WALK COST — Q5→Q4→Q3→Q2→Q1?
 *
 * Carl, 11 August 2026, on the Q5 reveal improving: *"Does that mean that Q4-1
 * wont be affected?"* The Q5→Q4 answer was measured (no: ~100ms, still ~2x the
 * visible threshold). **This measures the other three, which nobody has.**
 *
 * ⚠⚠ WHY THE STEPS MIGHT NOT BE EQUAL, WHICH IS THE WHOLE POINT:
 *
 *   - **Q5→Q4 is the only step with a WARM-UP behind it.** The warm node exists
 *     for the opening and overlaps the stage change (D-046). By Q4 it is long
 *     gone, so later steps may be WORSE, not merely the same.
 *   - **`labelCanvasCache` cannot help across questions** — different text,
 *     different key — so every step repaints five labels from scratch.
 *   - The memory rail grows a chip per step, which is real layout work inside
 *     the same 900ms window.
 *
 * **Reporting the walk as one mean would hide all three.** Each step is
 * measured and reported separately.
 *
 * ⚠ THE ACTIVE QUESTION IS `.enquiry-pdepth-0 .enquiry-phrase-cue`, NEVER the
 * first cue in document order — that one is a MEMORY CHIP, and reading it is
 * instrument fault #11, which reported "the corridor did not advance" on a
 * corridor that had advanced. Every step here asserts the cue actually changed.
 *
 * ⚠ PRODUCTION ONLY. Headed, --enable-gpu, aborts on a software rasteriser.
 *
 *   VERIFY_BASE_URL=http://localhost:3100 node verify/walk-cost.mjs 3
 *   VERIFY_BASE_URL=http://localhost:3100 node verify/walk-cost.mjs 3 "?labeltex=1024"
 */

import { chromium } from "@playwright/test";

const BASE = process.env.VERIFY_BASE_URL ?? "http://localhost:3100";
const RUNS = Number(process.argv[2] ?? 3);
const QUERY = process.argv[3] ?? "";

if (/:3000(\/|$)/.test(BASE)) {
  console.error("\n⚠⚠ REFUSING TO RUN AGAINST :3000 — dev frame cost is noise.\n");
  process.exit(1);
}

const browser = await chromium.launch({
  headless: false,
  args: ["--enable-gpu", "--use-gl=angle", "--ignore-gpu-blocklist"],
});

/** Steps in the order the corridor walks them. */
const STEPS = ["Q5→Q4", "Q4→Q3", "Q3→Q2", "Q2→Q1"];
const perStep = new Map(STEPS.map((s) => [s, []]));

const activeCue = (page) =>
  page.evaluate(() =>
    (document.querySelector(".enquiry-pdepth-0 .enquiry-phrase-cue")?.textContent || "").trim(),
  );

for (let run = 1; run <= RUNS; run++) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(`${BASE}/start${QUERY}`, { waitUntil: "networkidle" });

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
    console.log(`renderer: ${renderer}`);
    console.log(`base:     ${BASE}${QUERY ? `   query: ${QUERY}` : ""}\n`);
  }

  await page.getByRole("button", { name: /begin/i }).click();
  await page.locator(".enquiry-answer-grid").waitFor({ state: "visible", timeout: 30000 });
  // The card ladder's last rung is +2890ms on its own clock; the entrance runs
  // past it. Waiting less measures a move that overlaps the entrance.
  await page.waitForTimeout(5200);

  console.log(`── run ${run} ──`);

  for (const step of STEPS) {
    const before = await activeCue(page);

    // A selection is needed on every question — the Next step button is gated
    // on `selected.size > 0` and fades back out when the last one is released.
    await page.getByTestId("answer-card-hover-0").click();
    await page.waitForTimeout(700);

    await page.evaluate(() => {
      window.__wk = { frames: [] };
      const tick = () => {
        window.__wk.frames.push(performance.now());
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });

    await page.getByRole("button", { name: /next step/i }).click();
    // 900ms eased move; sample past its end.
    await page.waitForTimeout(1600);

    const worst = await page.evaluate(() => {
      const f = window.__wk.frames;
      let worst = 0;
      for (let i = 1; i < f.length; i++) worst = Math.max(worst, f[i] - f[i - 1]);
      return Math.round(worst);
    });

    const after = await activeCue(page);

    // ⚠ THE ADVANCE ASSERTION. A frame gap measured on a corridor that did not
    // move is not a weaker measurement, it is a wrong one.
    if (before === after) {
      console.log(`   ${step}   ⚠ DID NOT ADVANCE (cue stayed "${after}") — discarded`);
      continue;
    }

    perStep.get(step).push(worst);
    console.log(`   ${step}   ${String(worst).padStart(4)}ms    ${before} → ${after}`);
  }

  await page.close();
}

await browser.close();

const median = (xs) => {
  const s = [...xs].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
};

console.log("\n══════════════════════════════════════════════════");
console.log("  worst frame gap per step — MEDIANS");
console.log("══════════════════════════════════════════════════");
for (const step of STEPS) {
  const xs = perStep.get(step);
  if (!xs.length) {
    console.log(`  ${step}    no successful runs`);
    continue;
  }
  console.log(`  ${step}   ${String(median(xs)).padStart(4)}ms   [${xs.join(", ")}]`);
}

console.log("\n⚠ Q5→Q4 IS THE ONLY STEP WITH A WARM-UP BEHIND IT. If the later");
console.log("  steps are worse, that is the warm-up's absence, not a regression —");
console.log("  and it means a walk degrades as the visitor goes deeper.");
console.log("\n⚠ A PROFILE, NOT A VERDICT. ~50ms is the recorded visible threshold;");
console.log("  whether it READS as a stutter is Carl's eye.");
