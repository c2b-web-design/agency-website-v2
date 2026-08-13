/**
 * ⚠⚠ HOW OFTEN DOES THE CARD LADDER MISS CARL'S SPEC — PER QUESTION?
 *
 * Architect's Anomaly 1, 11 August 2026. `answer-card-canvas.tsx` picks one of
 * two modes per question, decided by an asynchronous GPU precompile race:
 *
 *   MODE A (anchored)  card 1 lands at 50% of the 1300ms wipe. Carl's spec.
 *   MODE B (clamped)   the ladder re-bases to `now`; the relationship to the
 *                      text is whatever the race produced.
 *
 * **This counts them.** Step 2 of the Architect's order — *"do not fix anything
 * until you know how often Mode B fires, on production, per question."*
 *
 * ⚠⚠ AND IT COMPARES :3000 AGAINST :3100, WHICH IS THE POINT.
 *
 * The Architect's claim: **Carl judges on the dev server, where compilation is
 * slower, so Mode B fires more often there** — meaning the thing he judges by
 * eye is not the thing that ships. That is a CLAIM, not a result, and it is
 * directly testable. This is the test.
 *
 * ⚠ IF DEV IS WORSE, THE DEFECT IS NOT IMAGINARY — it means the RATE differs
 * between what Carl sees and what ships, and **both numbers matter**. Do not let
 * a favourable production number be read as "there is no problem".
 *
 * ⚠ THIS IS THE ONE HARNESS IN `verify/` THAT MAY RUN AGAINST :3000 ON PURPOSE.
 * It measures a SCHEDULING RACE, not frame cost — and the dev/prod difference is
 * the finding rather than a contaminant. Every frame-cost harness here still
 * refuses :3000, and should.
 *
 *   node verify/ladder-mode.mjs 6
 *   BASES=http://localhost:3100 node verify/ladder-mode.mjs 6   (production only)
 */

import { chromium } from "@playwright/test";

const BASES = (process.env.BASES ?? "http://localhost:3100,http://localhost:3000").split(",");
const RUNS = Number(process.argv[2] ?? 6);

const browser = await chromium.launch({
  headless: false,
  args: ["--enable-gpu", "--use-gl=angle", "--ignore-gpu-blocklist"],
});

for (const base of BASES) {
  const isDev = /:3000(\/|$)/.test(base);
  console.log(`\n══════════════════════════════════════════════════`);
  console.log(`  ${base}${isDev ? "   (DEV — what Carl looks at)" : "   (PRODUCTION — what ships)"}`);
  console.log(`══════════════════════════════════════════════════`);

  // question -> counts
  const tally = new Map();

  for (let run = 1; run <= RUNS; run++) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    try {
      await page.goto(`${base}/start?modetrace=1`, { waitUntil: "networkidle", timeout: 30000 });
    } catch {
      console.log(`  run ${run}: server not reachable — skipping this base.`);
      await page.close();
      break;
    }

    await page.getByRole("button", { name: /begin/i }).click();
    await page.locator(".enquiry-answer-grid").waitFor({ state: "visible", timeout: 30000 });
    await page.waitForTimeout(6200);

    // Walk all four steps so every question's ladder runs.
    for (let s = 0; s < 4; s++) {
      await page.getByTestId("answer-card-hover-0").click();
      await page.waitForTimeout(700);
      await page.getByRole("button", { name: /next step/i }).click();
      await page.waitForTimeout(2600);
    }

    const trace = await page.evaluate(() => window.__modeTrace || []);
    const line = trace
      .map((t) => `${t.q}:${t.mode === "B-clamped" ? "B" : "A"}(${t.overrunMs})`)
      .join("  ");
    console.log(`  run ${run}   ${line || "no trace — is ?modetrace=1 in this build?"}`);

    for (const t of trace) {
      if (!tally.has(t.q)) tally.set(t.q, { a: 0, b: 0, overruns: [] });
      const e = tally.get(t.q);
      if (t.mode === "B-clamped") e.b++;
      else e.a++;
      e.overruns.push(t.overrunMs);
    }

    await page.close();
  }

  if (!tally.size) continue;

  console.log(`\n  question   Mode A   Mode B   Mode B rate   overrun ms (median)`);
  const keys = [...tally.keys()].sort().reverse();
  let totalA = 0;
  let totalB = 0;
  for (const q of keys) {
    const e = tally.get(q);
    totalA += e.a;
    totalB += e.b;
    const n = e.a + e.b;
    const sorted = [...e.overruns].sort((x, y) => x - y);
    const med = sorted[Math.floor(sorted.length / 2)];
    const rate = n ? Math.round((e.b / n) * 100) : 0;
    const flag = rate >= 50 ? "  ⚠" : "";
    console.log(
      `  ${q.padEnd(9)}  ${String(e.a).padStart(5)}   ${String(e.b).padStart(6)}   ${String(rate).padStart(9)}%   ${String(med).padStart(8)}${flag}`,
    );
  }
  const all = totalA + totalB;
  console.log(`  ${"ALL".padEnd(9)}  ${String(totalA).padStart(5)}   ${String(totalB).padStart(6)}   ${String(all ? Math.round((totalB / all) * 100) : 0).padStart(9)}%`);
}

await browser.close();

console.log("\n⚠ MODE B IS NOT A CRASH — the cards still arrive and still stagger.");
console.log("  What is lost is their RELATIONSHIP TO THE TEXT, which is the spec:");
console.log("  card 1 at halfway through the reveal, 650ms ±30ms.");
console.log("\n⚠ AND THE OVERRUN COLUMN SAYS HOW BADLY. Just over 650 is a near");
console.log("  miss; several hundred over means the entrance began long after");
console.log("  the wipe and the two were never going to relate.");
