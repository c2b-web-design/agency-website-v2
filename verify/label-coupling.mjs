/**
 * IS THE LABEL THE SAME OBJECT AS ITS CARD?
 *
 *   node verify/label-coupling.mjs
 *
 * ⚠ THE DEFECT THIS EXISTS TO CATCH. A first version gave the labels the card's
 * START TIME and let them run their own animation. Carl saw it at once: *"the
 * card and text look like 2 separate things, they should be one."* Same clock,
 * different easing (smoothstep vs cubic ease-out), different distance (6px vs
 * 10px), no scale at all. **Sharing a clock is not sharing an animation.**
 *
 * ⚠ SO THIS COMPARES THE LABEL'S RENDERED STATE AGAINST THE CARD'S OWN
 * PUBLISHED VALUES, frame by frame — not against a recomputation, which would
 * be the harness repeating the bug it is checking for.
 *
 * ⚠⚠ WHAT A PASS MEANS, CORRECTED 9 August 2026 — AND THE CORRECTION IS THE
 * WHOLE FINDING. Opacity must equal the card's material alpha exactly. The
 * TRANSFORM deliberately does NOT follow the card's motion curve, and that is
 * the fix rather than a regression.
 *
 * The card runs TWO curves: a cubic ease-out for movement, a smoothstep for
 * alpha. Captured through card 1's rise by `verify/label-frames.mjs`:
 *
 *     t+300ms   opacity 0.097   still 5.27px to travel
 *     t+600ms   opacity 0.365   still 2.06px
 *     t+900ms   opacity 0.526   still 1.12px
 *
 * **89% moved while 53% faded.** On a large soft surface that is invisible; on
 * TEXT it is the glitch Carl kept seeing after two fixes had already made the
 * values identical — glyphs have hard edges, so a faint label sliding into
 * place is exactly what the eye catches.
 *
 * ⚠ SO "ONE OBJECT" DOES NOT MEAN "COPY EVERY NUMBER". The label drives both
 * its opacity AND its transform from `alpha`, so at 36% faded it is 36% risen
 * and never travels while invisible. After the fix, at alpha 0.010 the rise is
 * 9.897px of 10 — essentially stationary while essentially invisible.
 *
 * This harness asserts the opacity coupling; the rise is printed in the sample
 * lines below for the eye rather than asserted, because the correct value is
 * now `10 * (1 - alpha)` and asserting a formula this file also computes would
 * be a harness sharing a constant with the fix — the failure mode recorded four
 * times in this project already.
 */
import { chromium } from "playwright";
const BASE = "http://localhost:3000";
const browser = await chromium.launch({ headless: false, args: ["--enable-gpu","--use-angle=default","--ignore-gpu-blocklist"] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(`${BASE}/start`, { waitUntil: "networkidle" });
const begin = page.getByRole("button", { name: /begin/i });
await begin.waitFor({ state: "visible", timeout: 25000 });
await page.waitForFunction(() => { const b=[...document.querySelectorAll("button")].find(el=>/begin/i.test(el.textContent??"")); return b && !b.disabled && getComputedStyle(b).pointerEvents!=="none"; }, { timeout: 25000 });

await page.evaluate(() => {
  window.__couple = [];
  const tick = () => {
    const table = window.__cardRiseT;
    const spans = [...document.querySelectorAll("[data-testid^='answer-card-hover-'] span")];
    if (table && spans.length) {
      const rungs = Object.keys(table).map(Number).sort((a,b)=>a-b);
      const rows = [];
      for (let i = 0; i < spans.length; i++) {
        const st = table[rungs[i]];
        if (!st) continue;
        const cs = getComputedStyle(spans[i]);
        rows.push({ i, cardAlpha: st.alpha, cardT: st.t, labelOp: Number(cs.opacity), transform: cs.transform });
      }
      if (rows.length) window.__couple.push(rows);
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
});
await begin.click();
await page.waitForTimeout(11000);

const out = await page.evaluate(() => {
  const frames = window.__couple ?? [];
  let worstOp = 0, worstOpAt = null, n = 0;
  const midMoves = [];
  for (const f of frames) {
    for (const r of f) {
      if (r.cardAlpha > 0.01 && r.cardAlpha < 0.99) {
        const d = Math.abs(r.labelOp - r.cardAlpha);
        n++;
        if (d > worstOp) { worstOp = d; worstOpAt = { card: r.i + 1, cardAlpha: r.cardAlpha.toFixed(3), labelOp: r.labelOp.toFixed(3) }; }
        if (midMoves.length < 3 && r.i === 0) midMoves.push({ t: r.cardT.toFixed(3), alpha: r.cardAlpha.toFixed(3), transform: r.transform });
      }
    }
  }
  return { frames: frames.length, compared: n, worstOp, worstOpAt, midMoves };
});
await browser.close();

console.log(`\nframes sampled: ${out.frames}   mid-fade comparisons: ${out.compared}\n`);
console.log(`  worst |label opacity - card alpha| during a fade:  ${out.worstOp.toFixed(4)}`);
if (out.worstOpAt) console.log(`    at card ${out.worstOpAt.card}: card ${out.worstOpAt.cardAlpha} vs label ${out.worstOpAt.labelOp}`);
console.log(`\n  card 1 mid-fade samples (t, alpha, label transform):`);
for (const m of out.midMoves) console.log(`    t=${m.t}  alpha=${m.alpha}  ${m.transform}`);
console.log("");
if (out.compared === 0) {
  console.log(`  ⚠ NOTHING COMPARED — no frame caught a card mid-fade. The harness saw`);
  console.log(`    nothing, which is not the same as a pass.`);
} else if (out.worstOp < 0.01) {
  console.log(`  ✅ THE LABEL IS ON THE CARD'S OWN VALUES — max divergence ${out.worstOp.toFixed(4)}`);
  console.log(`     across ${out.compared} mid-fade samples. They are one object.`);
} else {
  console.log(`  ⚠ THE LABEL DIVERGES FROM ITS CARD by up to ${out.worstOp.toFixed(3)}.`);
  console.log(`    They are still two animations.`);
}
console.log(`\n  ⚠ Verification is not approval. Carl's eye decides whether it READS as one.\n`);
