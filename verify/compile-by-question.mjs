/**
 * ⚠ HOW LONG DOES EACH QUESTION'S CANVAS TAKE TO COMPILE?
 *
 * Architect's Anomaly 6: the `card-canvas-created` / `card-canvas-compiled`
 * marks share a name across all five questions, and every reader takes
 * `getEntriesByName(...)[0]` — the FIRST. **So every mount→compiled figure on
 * record is Q5's canvas only**, and Q4–Q1 have never been measured. Those
 * durations are what decide Mode A vs Mode B on four of the five reveals.
 *
 * The question-suffixed marks added 11 August make this readable:
 *
 *     card-canvas-created-Q4  →  card-canvas-compiled-Q4
 *
 * ⚠ WHAT THIS IS FOR. If Q4–Q1 compile fast (because Q5's canvas already warmed
 * the driver for materials that are IDENTICAL apart from label textures), then
 * the Mode B losses on later questions are a SCHEDULING problem, not a
 * compilation cost — and the fix is to stop making the entrance wait on a
 * precompile that has nothing left to do.
 *
 * If instead they are slow, the compile genuinely costs that much per canvas and
 * the honest fix is the shared host, which compiles once.
 *
 * ⚠ EITHER ANSWER DECIDES THE ROUTE. Run before implementing.
 *
 *   node verify/compile-by-question.mjs 4
 *   BASES=http://localhost:3000 node verify/compile-by-question.mjs 4   (dev, where Mode B lives)
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

const BASES = (process.env.BASES ?? "http://localhost:3100,http://localhost:3000").split(",");
const RUNS = Number(process.argv[2] ?? 4);

const browser = await chromium.launch({
  headless: false,
  args: ["--enable-gpu", "--use-gl=angle", "--ignore-gpu-blocklist"],
});

for (const base of BASES) {
  const isDev = /:3000(\/|$)/.test(base);
  console.log(`\n══════════════════════════════════════════════════`);
  console.log(`  ${base}${isDev ? "   (DEV)" : "   (PRODUCTION)"}`);
  console.log(`══════════════════════════════════════════════════`);

  const perQ = new Map();

  for (let run = 1; run <= RUNS; run++) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    try {
      await page.goto(`${base}/start`, { waitUntil: "networkidle", timeout: 30000 });
    } catch {
      console.log("  server not reachable — skipping.");
      await page.close();
      break;
    }

    await page.getByRole("button", { name: /begin/i }).click();
    await page.locator(".enquiry-answer-grid").waitFor({ state: "visible", timeout: 30000 });
    await page.waitForTimeout(6200);

    for (let s = 0; s < 4; s++) {
      await page.getByTestId("answer-card-hover-0").click();
      await page.waitForTimeout(700);
      await page.getByRole("button", { name: /next step/i }).click();
      await page.waitForTimeout(2600);
    }

    const pairs = await page.evaluate(() => {
      const out = [];
      for (const q of ["Q5", "Q4", "Q3", "Q2", "Q1"]) {
        const c = performance.getEntriesByName(`card-canvas-created-${q}`)[0];
        const k = performance.getEntriesByName(`card-canvas-compiled-${q}`)[0];
        if (c && k) out.push({ q, ms: Math.round(k.startTime - c.startTime) });
      }
      const wc = performance.getEntriesByName("warmup-canvas-created")[0];
      const wk = performance.getEntriesByName("warmup-canvas-compiled")[0];
      return { pairs: out, warmup: wc && wk ? Math.round(wk.startTime - wc.startTime) : null };
    });

    const line = pairs.pairs.map((p) => `${p.q}:${p.ms}ms`).join("  ");
    console.log(`  run ${run}   warm-up ${pairs.warmup ?? "?"}ms   ${line}`);

    for (const p of pairs.pairs) {
      if (!perQ.has(p.q)) perQ.set(p.q, []);
      perQ.get(p.q).push(p.ms);
    }

    await page.close();
  }

  if (!perQ.size) continue;

  const median = (xs) => {
    const s = [...xs].sort((a, b) => a - b);
    return s[Math.floor(s.length / 2)];
  };

  console.log(`\n  question   mount→compiled (median)   all runs`);
  for (const q of ["Q5", "Q4", "Q3", "Q2", "Q1"]) {
    const xs = perQ.get(q);
    if (!xs) continue;
    console.log(`  ${q.padEnd(9)}  ${String(median(xs)).padStart(20)}ms   [${xs.join(", ")}]`);
  }
}

await browser.close();

console.log("\n⚠ THE ENTRANCE CANNOT START UNTIL THIS COMPLETES — the effect is");
console.log("  gated `active && compiled && warm`. Any value here that exceeds the");
console.log("  650ms budget between the wipe starting and card 1's rung forces");
console.log("  Mode B, and the ladder loses its relationship to the text.");
