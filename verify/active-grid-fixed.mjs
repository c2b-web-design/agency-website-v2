/**
 * ⚠⚠ THE ONE RUN THAT DECIDES WHETHER THE SHARED HOST IS CHEAP OR HARD.
 *
 * Architect, 12 August 2026:
 *
 *   `.enquiry-pdepth-0 { bottom: -1.925rem; }` — the ACTIVE question sits at a
 *   fixed offset, identical at Q5, Q4, Q3, Q2 and Q1. And during a corridor move
 *   the active phrase is not rendered at all (`enquiry-opening.tsx:1518`
 *   withholds it while `corridorMoving`), so the only grid on screen mid-move is
 *   the OUTGOING copy at depth 1.
 *
 * ⚠ IF THAT HOLDS, THE CONSTRAINT THAT BLOCKED THIS FIX FOR THREE DAYS IS VOID.
 * The recorded hazard — *"lift the canvas out and the easing becomes a
 * hand-driven animation matching `bottom 900ms cubic-bezier(0.37, 0, 0.63, 1)`"*
 * — was measured on the 435→493px travel. **That travel belongs to the receding
 * copy, not to the arriving one.** A canvas hosted at the active grid's position
 * would sit still for the entire corridor, and there would be no easing to
 * reproduce.
 *
 * **The test:** walk Q5 → Q1 and sample `.enquiry-answer-grid`'s position AT
 * REST at each question — never during a move.
 *
 *   five identical numbers  → the host is a contained change. Build it.
 *   numbers that differ     → the Architect is wrong and the hard version is
 *                             back. Do not build on this.
 *
 * ⚠ AT REST MEANS AT REST. Sampling during the 900ms move would measure the
 * receding phrase and reproduce exactly the confusion this test exists to end.
 * Each sample waits for the move to finish and for the entrance to settle.
 *
 *   VERIFY_BASE_URL=http://localhost:3100 node verify/active-grid-fixed.mjs 3
 */

import { chromium } from "@playwright/test";

const BASE = process.env.VERIFY_BASE_URL ?? "http://localhost:3100";
const RUNS = Number(process.argv[2] ?? 3);

if (/:3000(\/|$)/.test(BASE)) {
  console.error("\n⚠⚠ REFUSING TO RUN AGAINST :3000.\n");
  process.exit(1);
}

const browser = await chromium.launch({
  headless: false,
  args: ["--enable-gpu", "--use-gl=angle", "--ignore-gpu-blocklist"],
});

const perQuestion = new Map();

for (let run = 1; run <= RUNS; run++) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(`${BASE}/start`, { waitUntil: "networkidle" });

  if (run === 1) {
    const renderer = await page.evaluate(() => {
      const gl = document.createElement("canvas").getContext("webgl2");
      if (!gl) return "no webgl";
      const ext = gl.getExtension("WEBGL_debug_renderer_info");
      return ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : "unknown";
    });
    console.log(`renderer: ${renderer}\nbase:     ${BASE}\n`);
  }

  await page.getByRole("button", { name: /begin/i }).click();
  await page.locator(".enquiry-answer-grid").waitFor({ state: "visible", timeout: 30000 });
  // The entrance must be over — ENTRANCE_END_MS is 5440ms from the anchor.
  await page.waitForTimeout(6200);

  console.log(`── run ${run} ──`);

  for (let step = 0; step < 5; step++) {
    const sample = await page.evaluate(() => {
      // ⚠ THE ACTIVE QUESTION IS `.enquiry-pdepth-0`, NEVER the first cue in
      // document order — that one is a memory chip (instrument fault #11).
      const q = (document.querySelector(".enquiry-pdepth-0 .enquiry-phrase-cue")?.textContent || "?").trim();
      const grid = document.querySelector(".enquiry-answer-grid");
      if (!grid) return { q, top: null, left: null, w: null, h: null };
      const r = grid.getBoundingClientRect();
      return {
        q,
        top: Math.round(r.top * 100) / 100,
        left: Math.round(r.left * 100) / 100,
        w: Math.round(r.width * 100) / 100,
        h: Math.round(r.height * 100) / 100,
      };
    });

    if (sample.top === null) {
      console.log(`   ${sample.q}   no grid found`);
    } else {
      console.log(
        `   ${sample.q}   top ${String(sample.top).padStart(7)}  left ${String(sample.left).padStart(7)}` +
        `  ${sample.w} x ${sample.h}`,
      );
      if (!perQuestion.has(sample.q)) perQuestion.set(sample.q, []);
      perQuestion.get(sample.q).push(sample);
    }

    if (step === 4) break;

    await page.getByTestId("answer-card-hover-0").click();
    await page.waitForTimeout(700);
    await page.getByRole("button", { name: /next step/i }).click();
    // ⚠ WAIT OUT THE WHOLE MOVE PLUS THE ENTRANCE. 900ms morph + 250ms beat,
    // then the ladder. Sampling early measures the receding copy.
    await page.waitForTimeout(6800);
  }

  await page.close();
}

await browser.close();

console.log("\n══════════════════════════════════════════════════");
console.log("  ACTIVE GRID POSITION AT REST, PER QUESTION");
console.log("══════════════════════════════════════════════════");

const tops = [];
for (const q of ["Q5", "Q4", "Q3", "Q2", "Q1"]) {
  const xs = perQuestion.get(q);
  if (!xs || !xs.length) {
    console.log(`  ${q}   never sampled`);
    continue;
  }
  const uniq = [...new Set(xs.map((s) => `${s.top}|${s.left}|${s.w}|${s.h}`))];
  const s = xs[0];
  console.log(
    `  ${q}   top ${String(s.top).padStart(7)}  left ${String(s.left).padStart(7)}  ${s.w} x ${s.h}` +
    (uniq.length > 1 ? `   ⚠ VARIED ACROSS RUNS (${uniq.length} distinct)` : ""),
  );
  tops.push(s.top);
}

const distinct = [...new Set(tops.map((t) => Math.round(t)))];
console.log("");
if (tops.length === 5 && distinct.length === 1) {
  console.log("  ✅ ALL FIVE IDENTICAL. The active grid never moves between questions.");
  console.log("     A canvas hosted at this position sits still for the entire");
  console.log("     corridor — there is NO easing to reproduce, and the recorded");
  console.log("     hazard belongs to the receding copy, not the arriving one.");
  console.log("     ⚠ THE SHARED HOST IS THE CONTAINED CHANGE. Build it.");
} else {
  console.log(`  ⚠ ${distinct.length} DISTINCT POSITIONS: ${distinct.join(", ")}px`);
  console.log("     The active grid DOES move between questions, so a persistent");
  console.log("     host would have to reproduce that motion by hand.");
  console.log("     ⚠ DO NOT BUILD THE CHEAP VERSION ON THIS.");
}
console.log("══════════════════════════════════════════════════");
