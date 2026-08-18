/**
 * ⚠⚠ WHERE DOES THE OVERRUN COME FROM? The compile is innocent.
 *
 * `verify/ladder-mode.mjs` found Mode B on dev at 18%, with overruns up to
 * **2246ms** against a 650ms budget. The obvious suspect was the async GPU
 * precompile the entrance is gated on (`active && compiled && warm`).
 *
 * ⚠ MEASURED AND CLEARED. `verify/compile-by-question.mjs`: mount→compiled is
 * **150–227ms on production, 266–508ms on dev** — every value comfortably
 * inside the 650ms budget, including on the runs that went to Mode B.
 * **Compilation is not what blows it.**
 *
 * So the overrun accumulates somewhere between the WIPE STARTING and the
 * entrance effect running. This splits that interval into its parts:
 *
 *     wipe startTime                      the anchor the ladder uses
 *       │
 *       ├─ canvas created  (mark)         React committed and R3F made a context
 *       ├─ canvas compiled (mark)         the precompile resolved
 *       └─ entrance ran    (modetrace)    the effect fired; mode decided here
 *
 * ⚠ THE SEGMENT THAT DOMINATES IS THE DEFECT. If it is wipe→created, the canvas
 * is mounting late and the fix is about React commit order, not GPU work at all.
 *
 * ⚠ RUN AGAINST DEV. Mode B barely occurs on production (0/95), so a production
 * run cannot show the failing case. **This is one of the two harnesses that
 * targets :3000 on purpose** — it measures scheduling, not frame cost.
 *
 *   BASES=http://localhost:3000 node verify/overrun-breakdown.mjs 6
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

const BASES = (process.env.BASES ?? "http://localhost:3000").split(",");
const RUNS = Number(process.argv[2] ?? 6);

const browser = await chromium.launch({
  headless: false,
  args: ["--enable-gpu", "--use-gl=angle", "--ignore-gpu-blocklist"],
});

for (const base of BASES) {
  console.log(`\n══════════════════════════════════════════════════`);
  console.log(`  ${base}`);
  console.log(`══════════════════════════════════════════════════`);
  console.log(`  Q    mode  wipe→created  created→compiled  compiled→entrance  = overrun`);

  for (let run = 1; run <= RUNS; run++) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    try {
      await page.goto(`${base}/start?modetrace=1`, { waitUntil: "networkidle", timeout: 30000 });
    } catch {
      console.log("  server not reachable — skipping.");
      await page.close();
      break;
    }

    await page.getByRole("button", { name: /begin/i }).click();
    await page.locator(".enquiry-answer-grid").waitFor({ state: "visible", timeout: 30000 });
    await page.waitForTimeout(6200);

    // Record each question's wipe startTime as we walk, since getAnimations()
    // only exposes the CURRENT phrase's animation.
    const wipes = await page.evaluate(() => {
      window.__wipes = {};
      const grab = () => {
        const q = (document.querySelector(".enquiry-pdepth-0 .enquiry-phrase-cue")?.textContent || "").trim();
        const el = document.querySelector(".enquiry-q-text-reveal");
        const anim = el
          ?.getAnimations?.()
          .find((a) => a.animationName === "enquiry-mask-reveal-horizontal");
        if (q && anim && typeof anim.startTime === "number" && !(q in window.__wipes)) {
          window.__wipes[q] = anim.startTime;
        }
      };
      grab();
      window.__grabWipe = grab;
      return window.__wipes;
    });
    void wipes;

    for (let s = 0; s < 4; s++) {
      await page.getByTestId("answer-card-hover-0").click();
      await page.waitForTimeout(700);
      await page.getByRole("button", { name: /next step/i }).click();
      // Grab the new question's wipe as soon as it exists.
      await page.waitForTimeout(1300);
      await page.evaluate(() => window.__grabWipe && window.__grabWipe());
      await page.waitForTimeout(1300);
    }

    const rows = await page.evaluate(() => {
      const trace = window.__modeTrace || [];
      const seen = new Set();
      const out = [];
      for (const t of trace) {
        if (seen.has(t.q)) continue;
        seen.add(t.q);
        const created = performance.getEntriesByName(`card-canvas-created-${t.q}`)[0];
        const compiled = performance.getEntriesByName(`card-canvas-compiled-${t.q}`)[0];
        const wipe = window.__wipes[t.q];
        out.push({
          q: t.q,
          mode: t.mode,
          overrun: t.overrunMs,
          wipeToCreated: wipe != null && created ? Math.round(created.startTime - wipe) : null,
          createdToCompiled: created && compiled ? Math.round(compiled.startTime - created.startTime) : null,
          compiledToEntrance: compiled ? Math.round(t.t - compiled.startTime) : null,
        });
      }
      return out;
    });

    console.log(`  ── run ${run} ──`);
    for (const r of rows) {
      const f = (v) => (v === null ? "    ?" : String(v).padStart(5));
      const flag = r.mode === "B-clamped" ? "  ⚠ MODE B" : "";
      console.log(
        `  ${r.q}   ${r.mode === "B-clamped" ? "B" : "A"}     ${f(r.wipeToCreated)}ms      ${f(r.createdToCompiled)}ms           ${f(r.compiledToEntrance)}ms     ${String(r.overrun).padStart(5)}ms${flag}`,
      );
    }

    await page.close();
  }
}

await browser.close();

console.log("\n⚠ READ THE WIDEST COLUMN. If `wipe→created` dominates on the Mode B");
console.log("  rows, the canvas is MOUNTING late and no amount of GPU work");
console.log("  scheduling will fix it — the entrance is waiting for React, not");
console.log("  for the driver.");
