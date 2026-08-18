// ⚠⚠ THE BUTTON'S OPACITY CURVE, PER FRAME — commit 2's acceptance test.
//
//   node verify/button-opacity-curve.mjs [--label NAME]
//
// Samples the button's EFFECTIVE opacity every animation frame across three
// phases and writes a curve to verify/out/opacity-curve/<label>.json.
// Run it on the PRE-HOIST build and on A1, then diff the two curves.
//
// ⚠ THE OUTPUT IS A CURVE, NOT A VERDICT. Carl's instruction, 18 August 2026:
// report the comparison as a curve rather than a pass/fail. If it cannot be
// matched, SAY SO — that means A1 fails the appearance constraint and goes back
// to him with the current behaviour still on screen to compare against.
// ⛔ DO NOT TUNE TOWARD "CLOSE ENOUGH".
//
// ─────────────────────────────────────────────────────────────────────────────
// ⚠⚠ WHY EFFECTIVE OPACITY AND NOT ONE ELEMENT'S COMPUTED VALUE
// ─────────────────────────────────────────────────────────────────────────────
//
// Pre-hoist, THREE sources multiplied and they lived on different elements:
//
//     wrapper   opacity: selected.size>0 ? 1 : 0    600ms   (div.mt-5)
//     depth-1   .enquiry-pdepth-1 .enquiry-phrase-extras 0.78
//     exit      .enquiry-phrase-extras-out  opacity 0  900ms
//
// Reading any single element would miss the product. So this walks from the
// button up to the document and MULTIPLIES every computed opacity on the way —
// which is what the compositor actually does, and is directly comparable across
// two builds whose DOM structure differs.
//
// ⚠ THE MESH AND THE LABEL ARE ON DIFFERENT ELEMENTS AFTER THE HOIST. The label
// still rides the phrase's wrapper; the mesh rides the fixed host. Both are
// sampled, because a build where they diverge is a build where the text fades on
// a different curve from the surface — a defect neither one alone would show.

import { chromium } from "playwright";
import { mkdirSync, writeFileSync, existsSync, readFileSync } from "node:fs";

const BASE = process.env.VERIFY_BASE_URL ?? "http://localhost:3100";
if (/:3000(\/|$)/.test(BASE)) {
  console.error(`\n⚠ REFUSING :3000 — production is the verdict.\n`);
  process.exit(1);
}

const args = process.argv.slice(2);
const li = args.indexOf("--label");
const LABEL = li >= 0 ? args[li + 1] : "unlabelled";
const OUT = "verify/out/opacity-curve";
mkdirSync(OUT, { recursive: true });

console.log(`\n⚠ BUTTON OPACITY CURVE — label "${LABEL}"`);
console.log(`   phases: reveal (must be ABSENT) -> select (600ms in) -> next step (600ms out)\n`);

const browser = await chromium.launch({
  headless: false,
  args: ["--enable-gpu", "--use-gl=angle", "--ignore-gpu-blocklist"],
});
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

await page.addInitScript(() => {
  // Effective opacity = product of every computed opacity from the node to the
  // root. That is what the compositor applies, and it is structure-independent —
  // which is what makes two builds with different DOM comparable.
  window.__effOpacity = (el) => {
    let o = 1, e = el;
    while (e && e.nodeType === 1) {
      const s = getComputedStyle(e);
      if (s.visibility === "hidden" || s.display === "none") return 0;
      o *= parseFloat(s.opacity || "1");
      e = e.parentElement;
    }
    return o;
  };
  window.__samples = [];
  window.__sampling = false;
  window.__startSampling = (phase) => {
    window.__sampling = true;
    const t0 = performance.now();
    const tick = () => {
      if (!window.__sampling) return;
      const btn = document.querySelector(".enquiry-nextstep-btn");
      const host = document.querySelector('[data-testid="nextstep-surface-host"]');
      window.__samples.push({
        phase,
        t: Math.round(performance.now() - t0),
        // The LABEL/control, which still lives in the phrase on both builds.
        label: btn ? +window.__effOpacity(btn).toFixed(4) : null,
        // The MESH surface. Pre-hoist this is inside the button; post-hoist it is
        // the fixed host. `null` on a build with no host element.
        mesh: host ? +window.__effOpacity(host).toFixed(4) : null,
      });
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  window.__stopSampling = () => { window.__sampling = false; };
});

await page.goto(`${BASE}/start`, { waitUntil: "networkidle" });
await page.waitForTimeout(9000);
const begin = await page.$(".enquiry-begin-hit");
if (!begin) { console.error("⛔ no Begin hit target."); process.exit(1); }

// ── PHASE 1: THE REVEAL. The button must be ABSENT throughout. ──────────────
// ⚠ THIS IS THE PHASE THE REGRESSION LIVED IN — a lit blank button appearing as
// the question revealed, inside the window the freeze occupies.
await begin.click();
await page.evaluate(() => window.__startSampling("reveal"));
await page.waitForTimeout(10500);
await page.evaluate(() => window.__stopSampling());

// ⚠⚠ A SETTLING GAP BETWEEN PHASES, AND IT IS NOT COSMETIC. The first version
// stopped sampling and immediately queried + clicked a card; the rAF loop had
// not yet observed the stop flag, so the tail of phase 1 recorded the fade-in
// belonging to phase 2. **It reported "BUTTON VISIBLE DURING THE REVEAL, peak
// 1" on the PRE-HOIST build — the known-good reference.** A harness that
// condemns the reference is measuring itself. Fixed by stopping, waiting for the
// loop to drain, and only then acting.
await page.waitForTimeout(300);
// ⚠ Discard only the frames the drain added AFTER the stop, keeping the reveal
// itself. Anything recorded in the settling gap belongs to no phase.
await page.evaluate(() => {
  const cut = performance.now();
  window.__drainCut = cut;
  window.__samples = window.__samples.filter((s) => s.phase !== "reveal" || s.t <= 10500);
});

// ── PHASE 2: SELECTION. 600ms fade in. ─────────────────────────────────────
const hits = await page.$$('[data-testid^="answer-card-hover-"]');
if (!hits.length) {
  console.error(`\n⛔ NO CARD HIT TARGETS — harness failure, not a product verdict.\n`);
  process.exit(1);
}
await page.evaluate(() => window.__startSampling("select"));
await hits[0].dispatchEvent("pointerdown");
await page.waitForTimeout(1400);
await page.evaluate(() => window.__stopSampling());

// ── PHASE 3: NEXT STEP. Fades out as the question travels, done at ~600ms. ──
await page.evaluate(() => window.__startSampling("exit"));
const btn = await page.$(".enquiry-nextstep-btn");
if (btn) await btn.click();
await page.waitForTimeout(1600);
await page.evaluate(() => window.__stopSampling());

const samples = await page.evaluate(() => window.__samples.map((s) => ({ ...s })));
await ctx.close();
await browser.close();

const byPhase = (p) => samples.filter((s) => s.phase === p);

// ⚠ Report the MESH channel where it exists, else the LABEL. Pre-hoist there is
// no host element, so the mesh rode the button's own subtree and the label
// channel is the honest comparison.
const chan = (s) => (s.mesh !== null ? s.mesh : s.label);

function summarise(phase) {
  const rows = byPhase(phase);
  if (!rows.length) return null;
  const vals = rows.map(chan);
  const peak = Math.max(...vals);
  // First frame at/above 0.99 and first back at/below 0.01, in ms from phase t0.
  const upAt = rows.find((r) => chan(r) >= 0.99);
  const downAt = rows.find((r, i) => i > 0 && chan(r) <= 0.01 && Math.max(...vals.slice(0, i)) > 0.5);
  return {
    n: rows.length,
    peak: +peak.toFixed(3),
    min: +Math.min(...vals).toFixed(3),
    reach1: upAt ? upAt.t : null,
    reach0: downAt ? downAt.t : null,
  };
}

const report = {
  label: LABEL,
  when: new Date().toISOString(),
  reveal: summarise("reveal"),
  select: summarise("select"),
  exit: summarise("exit"),
  samples,
};
const path = `${OUT}/${LABEL}.json`;
writeFileSync(path, JSON.stringify(report, null, 1));

console.log(`  REVEAL  ${JSON.stringify(report.reveal)}`);
console.log(`  SELECT  ${JSON.stringify(report.select)}`);
console.log(`  EXIT    ${JSON.stringify(report.exit)}`);

// ⚠ THE ONE HARD ASSERTION, because it is the regression Carl caught by eye and
// it is binary rather than a curve: the button must be ABSENT during the reveal.
const revealPeak = report.reveal ? report.reveal.peak : 0;
console.log("");
if (revealPeak > 0.01) {
  console.error(`  ⛔⛔ BUTTON VISIBLE DURING THE REVEAL — peak effective opacity ${revealPeak}.`);
  console.error(`     The design has no such state. This is the regression Carl reported.\n`);
} else {
  console.log(`  ✅ absent through the reveal (peak ${revealPeak}).`);
}

// ── DIFF against a previously recorded curve, if one exists ────────────────
const other = args.includes("--vs") ? args[args.indexOf("--vs") + 1] : null;
if (other) {
  const op = `${OUT}/${other}.json`;
  if (!existsSync(op)) {
    console.error(`\n⛔ no recorded curve "${other}" to compare against.\n`);
    process.exit(1);
  }
  const ref = JSON.parse(readFileSync(op, "utf8"));
  console.log(`\n  ── CURVE COMPARISON: ${other} (reference) vs ${LABEL} ──`);
  for (const ph of ["reveal", "select", "exit"]) {
    const a = ref[ph], b = report[ph];
    if (!a || !b) { console.log(`     ${ph.padEnd(7)} missing on one side`); continue; }
    console.log(`     ${ph.padEnd(7)} peak ${a.peak} -> ${b.peak}   reach1 ${a.reach1} -> ${b.reach1}ms   reach0 ${a.reach0} -> ${b.reach0}ms`);
  }
  console.log(`\n  ⚠ REPORT THIS AS A CURVE, NOT A VERDICT. If it does not match, A1 fails`);
  console.log(`    the appearance constraint and goes back to Carl. Do not tune to fit.`);
}
console.log(`\n  written: ${path}\n`);
