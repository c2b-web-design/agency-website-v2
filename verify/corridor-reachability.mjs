// ⚠⚠ THE REACHABILITY GATE — CAN THE CORRIDOR BE WALKED UNDER SCRIPT?
//
//   node verify/corridor-reachability.mjs
//
// ⛔ A ZERO HIT-TARGET COUNT IS A BROKEN HARNESS UNTIL PROVEN OTHERWISE.
//    IT IS NEVER A FINDING ABOUT THE PRODUCT.
//
// ─────────────────────────────────────────────────────────────────────────────
// ⚠⚠ INSTRUMENT DEFECT #12 — WHY THIS EXISTS. 18 August 2026.
// ─────────────────────────────────────────────────────────────────────────────
//
// A walk script reported `cards=0, clicked=false` at every question. From that
// the conclusion drawn — and REPORTED TO CARL as "confirmed and pre-existing" —
// was that the corridor could not advance past Q5, and a design decision was put
// to him about deferring a required verification.
//
// ⛔ THE CORRIDOR ADVANCES FINE. Carl clicked the button himself and
// photographed the corridor at Q3 with the full rail history.
//
// **The cause:** the script queried `.enquiry-answer-grid button` and
// `[role='button']` and called `.click()`. The hit targets are BARE DIVS with a
// `data-testid`, firing on `pointerdown` — deliberately, because Carl specified
// the mouse BUTTON as the trigger (`click` fires on release and would delay the
// journey). **A script clicking DOM buttons finds nothing while a human works.**
//
// ⚠⚠ THE DIRECTION IS NEW AND IS THE POINT. Every prior expensive instrument
// defect on this record failed toward a PASS. This one failed toward a FALSE
// CONSTRAINT: it reported working product as structurally incapable, and would
// have removed a required verification and manufactured a design decision out of
// nothing. **A false pass gets believed; a false constraint gets DESIGNED
// AROUND, and the decision it produces is invisible afterwards because the thing
// it avoided never gets tried again.**

import { chromium } from "playwright";

const BASE = process.env.VERIFY_BASE_URL ?? "http://localhost:3100";
if (/:3000(\/|$)/.test(BASE)) {
  console.error(`\n⚠ REFUSING :3000 — production is the verdict.\n`);
  process.exit(1);
}

// ⚠ THE SELECTOR AND THE EVENT ARE BOTH LOAD-BEARING. Changing either to
// something that "looks equivalent" reintroduces defect #12.
const HIT = '[data-testid^="answer-card-hover-"]';
const EVENT = "pointerdown";

console.log(`\n⚠ CORRIDOR REACHABILITY — can a script walk Q5 -> Q1?`);
console.log(`   hit target: ${HIT}`);
console.log(`   event:      ${EVENT}   (NOT click — click fires on release)\n`);

const browser = await chromium.launch({
  headless: false,
  args: ["--enable-gpu", "--use-gl=angle", "--ignore-gpu-blocklist"],
});
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto(`${BASE}/start`, { waitUntil: "networkidle" });
await page.waitForTimeout(9000);
const begin = await page.$(".enquiry-begin-hit");
if (!begin) {
  console.error(`⛔ no Begin hit target.`);
  process.exit(1);
}
await begin.click();
await page.waitForTimeout(11000);

const seen = [];
for (let step = 0; step < 5; step++) {
  const hits = await page.$$(HIT);

  // ⛔⛔ THE GATE. A quiet zero is what produced a false constraint once already.
  if (hits.length === 0) {
    console.error(`\n⛔⛔ ZERO HIT TARGETS AT STEP ${step}. THIS HARNESS IS BROKEN.`);
    console.error(`   ⛔ DO NOT CONCLUDE THE CORRIDOR CANNOT ADVANCE. That conclusion has`);
    console.error(`      been drawn from this exact symptom once, was wrong, and became a`);
    console.error(`      design decision put to Carl (instrument defect #12).`);
    console.error(`   Check FIRST: the selector "${HIT}", the event "${EVENT}",`);
    console.error(`   whether the corridor actually reached a question, and whether a`);
    console.error(`   human can click the cards on this build.\n`);
    process.exit(1);
  }

  const cue = await page.evaluate(() => {
    const el = document.querySelector(".enquiry-pdepth-0 .enquiry-phrase-cue");
    return el ? (el.textContent || "").trim() : null;
  });

  await hits[0].dispatchEvent(EVENT);
  await page.waitForTimeout(600);

  // `tabIndex` flips -1 -> 0 once a selection exists. It is the corridor's own
  // notion of "selected", not the filament's — the two are allowed to disagree.
  const armed = await page.evaluate(() => {
    const b = document.querySelector(".enquiry-nextstep-btn");
    return b ? b.tabIndex : null;
  });

  seen.push({ step, cue, hits: hits.length, armed });
  console.log(`  step ${step}  ${String(cue).padEnd(3)}  hits=${hits.length}  btn.tabIndex=${armed}`);

  if (armed !== 0) {
    console.error(`\n⛔ SELECTION DID NOT REGISTER at ${cue} — tabIndex ${armed}, expected 0.`);
    console.error(`   The pointerdown reached a target but the corridor did not take it.\n`);
    process.exit(1);
  }

  const btn = await page.$(".enquiry-nextstep-btn");
  if (btn) await btn.click();
  await page.waitForTimeout(2400);
}

const distinct = new Set(seen.map((s) => s.cue));
console.log(`\n  questions reached: ${[...distinct].join(" -> ")}`);
if (distinct.size < 5) {
  console.error(`\n⛔ ONLY ${distinct.size} DISTINCT QUESTIONS — the corridor did not advance each step.\n`);
  process.exit(1);
}
console.log(`\n  ✅ CORRIDOR WALKS Q5 -> Q1 UNDER SCRIPT. The walk verification is AVAILABLE.\n`);

await ctx.close();
await browser.close();
