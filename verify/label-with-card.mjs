/**
 * DO THE LABELS ARRIVE WITH THEIR CARDS?
 *
 *   node verify/label-with-card.mjs
 *
 * ⚠ CARL, 9 August 2026: *"The answer text should fade in with the cards. They
 * stand alone now and the cards fade in. The answer text and the cards should be
 * one, together."* The labels are DOM and the cards are WebGL, so "together" is
 * a claim about two different rendering paths sharing one clock — exactly the
 * kind of claim that looks right and is not.
 *
 * WHAT IT MEASURES. Samples each label's computed opacity across the entrance
 * and reports when it starts moving, against the beat that card's rung fires at
 * (`?beattrace=1`, the ladder's own clock).
 *
 * ⚠ A LABEL THAT IS ALREADY AT 1 ON THE FIRST SAMPLE IS THE DEFECT, not a fast
 * fade — it means the text was painted before its card existed.
 */
import { chromium } from "playwright";
const BASE = "http://localhost:3000";
const browser = await chromium.launch({ headless: false, args: ["--enable-gpu","--use-angle=default","--ignore-gpu-blocklist"] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(`${BASE}/start?beattrace=1`, { waitUntil: "networkidle" });
const begin = page.getByRole("button", { name: /begin/i });
await begin.waitFor({ state: "visible", timeout: 25000 });
await page.waitForFunction(() => { const b=[...document.querySelectorAll("button")].find(el=>/begin/i.test(el.textContent??"")); return b && !b.disabled && getComputedStyle(b).pointerEvents!=="none"; }, { timeout: 25000 });

await page.evaluate(() => {
  window.__labelTrace = [];
  const t0 = performance.now();
  const tick = () => {
    const spans = [...document.querySelectorAll("[data-testid^='answer-card-hover-'] span")];
    if (spans.length) {
      window.__labelTrace.push({
        t: Math.round(performance.now() - t0),
        op: spans.map(s => Number(getComputedStyle(s).opacity).toFixed(3)),
      });
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
});
await begin.click();
await page.waitForTimeout(12000);

const out = await page.evaluate(() => {
  const trace = window.__labelTrace ?? [];
  const cards = window.__cardTrace ?? [];
  const firstMove = [];
  for (let i = 0; i < 5; i++) {
    const f = trace.find(s => Number(s.op[i]) > 0.02);
    const done = trace.find(s => Number(s.op[i]) > 0.98);
    firstMove.push({ i, start: f ? f.t : null, full: done ? done.t : null, firstSample: trace.length ? trace[0].op[i] : null });
  }
  const beats = [...new Set(cards.map(e => e.card))].sort((a,b)=>a-b).map(c => {
    const m = cards.filter(e => e.card === c && e.raw > 0).sort((a,b)=>a.t-b.t)[0];
    return { card: c, at: m ? Math.round(m.t) : null };
  });
  return { firstMove, beats, samples: trace.length };
});
await browser.close();

console.log(`\nsamples: ${out.samples}\n`);
console.log("  label   first>0.02   reaches 1    opacity at first sample");
for (const f of out.firstMove) {
  console.log(`   ${f.i + 1}      ${String(f.start).padStart(6)}ms   ${String(f.full).padStart(6)}ms       ${f.firstSample}`);
}
const bad = out.firstMove.filter(f => Number(f.firstSample) > 0.02);
console.log("");
if (bad.length) {
  console.log(`  ⚠ ${bad.length} label(s) were ALREADY VISIBLE on the first sample — painted`);
  console.log(`    before their card. That is the defect, not a fast fade.`);
} else {
  console.log(`  ✅ every label started at zero and faded up.`);
}
const gaps = out.firstMove.map((f) => (f.start !== null && out.firstMove[0].start !== null) ? f.start - out.firstMove[0].start : null);
console.log(`\n  stagger between labels (vs label 1): ${gaps.join(", ")}`);
console.log(`  the card ladder's own gaps are ~560ms — these should match.`);
console.log(`\n  ⚠ Verification is not approval.\n`);
