/**
 * ⚠⚠ DOES ATTACHING THE REVEAL-RATIO READ CHANGE WHAT IT MEASURES?
 *
 *   VERIFY_BASE_URL=http://localhost:3100 node verify/reveal-ratio-control.mjs
 *
 * ══ WHY THIS RUNS FIRST, AND WHY IT IS A GATE ══
 *
 * On 17 August a probe wrapped `window.__revealStart` in `Object.defineProperty`
 * — converting a data property into an accessor — and **a live, reproducible
 * defect stopped reproducing for four consecutive runs.** Removing the
 * instrumentation made it reproduce instantly. The fifth blind instrument in
 * three days, and it was in this exact area.
 *
 * **So this is not a formality and it is not run last.** Anything built on top of
 * a perturbing instrument is unsound, so the control is the gate, not the
 * closing check.
 *
 * ══ ⚠ THE BAND IS PRE-REGISTERED. IT IS NOT SET AFTER SEEING THE NUMBERS ══
 *
 *   sample     6 runs attached, 6 unattached, INTERLEAVED (A,B,A,B...) so any
 *              session drift hits both arms equally
 *   metric     rung-3 fall-throughs per run (`?anchortrace=1`), the live defect's
 *              own signature
 *   ACCEPT     |mean(attached) - mean(unattached)| <= 1.0 fall-throughs per run
 *              AND neither arm produces a CLEAN run (0) while the other never
 *              drops below 3
 *   REJECT     anything else — especially one arm going clean. That is exactly
 *              yesterday's signature.
 *
 * ⚠⚠ ON REJECT THE INSTRUMENT IS REPORTED AS PERTURBING AND THE WORK STOPS.
 * **It is NOT adjusted until the arms agree.** A design that needs tuning until
 * the counts match is yesterday's failure wearing a fix.
 *
 * ⚠ AND IF BOTH ARMS COME BACK CLEAN, THE CONTROL IS VOID — not a pass. It would
 * prove only that the defect did not reproduce, which says nothing about
 * perturbation. That case is reported as a finding.
 */

import { chromium } from "@playwright/test";
import { READ_REVEAL } from "./lib/reveal-ratio.mjs";

const BASE = process.env.VERIFY_BASE_URL ?? "http://localhost:3100";
const PER_ARM = Number(process.argv[2] ?? 6);

if (/:3000(\/|$)/.test(BASE)) {
  console.error("\n⚠ REFUSING :3000 — dev and production DISAGREE on this defect");
  console.error("  (0/75 fall-throughs on dev, 25 on production). The control is only");
  console.error("  meaningful where the defect reproduces.\n");
  process.exit(1);
}

/** Pre-registered, before any number was seen. */
const ACCEPT_MEAN_DELTA = 1.0;

const browser = await chromium.launch({
  headless: false,
  args: ["--enable-gpu", "--use-gl=angle", "--ignore-gpu-blocklist"],
});

/**
 * One walk. `attached` decides whether the ratio read is performed at each
 * question — the ONLY difference between the two arms.
 */
async function walk(attached) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(`${BASE}/start?modetrace=1&anchortrace=1`, { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: /begin/i }).click();
  await page.locator(".enquiry-answer-grid").waitFor({ state: "visible", timeout: 30000 });
  await page.waitForTimeout(6200);

  if (attached) await page.evaluate(READ_REVEAL);

  for (let s = 0; s < 4; s++) {
    await page.getByTestId("answer-card-hover-0").click();
    await page.waitForTimeout(700);
    await page.getByRole("button", { name: /next step/i }).click();
    await page.waitForTimeout(2600);
    if (attached) await page.evaluate(READ_REVEAL);
  }

  const anchors = await page.evaluate(() => window.__anchorTrace ?? []);
  await page.close();

  // One entry per question — the trace pushes once per card.
  const seen = new Set();
  let fallThrough = 0;
  for (const a of anchors) {
    const k = `${a.q}:${a.rung}`;
    if (seen.has(k)) continue;
    seen.add(k);
    if (a.rung === "3-now") fallThrough += 1;
  }
  return fallThrough;
}

console.log(`\n  base: ${BASE}`);
console.log(`  pre-registered: ${PER_ARM} runs per arm, interleaved`);
console.log(`  ACCEPT if |mean delta| <= ${ACCEPT_MEAN_DELTA.toFixed(1)} fall-throughs/run\n`);

const attachedRuns = [];
const bareRuns = [];
for (let i = 0; i < PER_ARM; i++) {
  // ⚠ INTERLEAVED. Running one arm to completion then the other would confound
  // the comparison with anything that drifts over a session — GPU thermal state,
  // shader cache, memory. This project has already measured one fault that was
  // really run ORDER.
  const a = await walk(true);
  const b = await walk(false);
  attachedRuns.push(a);
  bareRuns.push(b);
  console.log(`  pair ${i + 1}   attached: ${a} fall-through(s)   unattached: ${b}`);
}
await browser.close();

const mean = (xs) => xs.reduce((s, x) => s + x, 0) / xs.length;
const mA = mean(attachedRuns);
const mB = mean(bareRuns);
const delta = Math.abs(mA - mB);

console.log(`\n  attached    ${attachedRuns.join(", ")}   mean ${mA.toFixed(2)}`);
console.log(`  unattached  ${bareRuns.join(", ")}   mean ${mB.toFixed(2)}`);
console.log(`  |delta| = ${delta.toFixed(2)}   (accept <= ${ACCEPT_MEAN_DELTA.toFixed(1)})`);

// ⚠ THE VOID CASE FIRST. If the defect did not reproduce in either arm, the
// control proves nothing and must not be read as a pass.
if (mA === 0 && mB === 0) {
  console.log(`\n  ⚠⚠ CONTROL VOID — NOT A PASS.`);
  console.log(`     Neither arm reproduced the defect, so this says nothing about whether the`);
  console.log(`     read perturbs it. Reported as a finding; the gate is NOT satisfied.`);
  process.exit(1);
}

// ⚠ THE ASYMMETRIC-CLEAN CASE — yesterday's exact signature.
const cleanA = attachedRuns.some((r) => r === 0);
const cleanB = bareRuns.some((r) => r === 0);
if ((cleanA && bareRuns.every((r) => r >= 3)) || (cleanB && attachedRuns.every((r) => r >= 3))) {
  console.log(`\n  ⛔ REJECT — one arm went CLEAN while the other never dropped below 3.`);
  console.log(`     That is the signature of an observer suppressing the defect it measures.`);
  console.log(`     ⚠ THE INSTRUMENT IS NOT TO BE ADJUSTED UNTIL THE ARMS AGREE. Stop and report.`);
  process.exit(1);
}

if (delta > ACCEPT_MEAN_DELTA) {
  console.log(`\n  ⛔ REJECT — the arms differ by more than the pre-registered band.`);
  console.log(`     The read changes what it measures. ⚠ Stop and report; do not tune.`);
  process.exit(1);
}

console.log(`\n  ✅ ACCEPT — attaching the read does not move the defect's signature.`);
console.log(`     ⚠ This says the READ does not perturb. It says nothing about whether the`);
console.log(`       ratio it computes is correct — that is the instrument's own falsification.\n`);
process.exit(0);
