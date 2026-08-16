/**
 * ⚠ DOES CARD 1 FIRE AT THE HALFWAY POINT OF THE Q5 REVEAL?
 *
 * Carl, 11 August 2026: *"The Q5 reveal should trigger Card 1 at halfway
 * through the reveal. Thats 650ms. This can be a ballpark figure and plus or
 * minus 30ms is acceptable."*
 *
 * So this harness has a PASS/FAIL, which most of `verify/` deliberately does
 * not: the spec is numeric and the tolerance is stated. 650 +/- 30ms, measured
 * against the reveal animation's own `startTime`.
 *
 * ⚠ WHY THE MARK AND NOT THE PIXELS. `q5-card-vs-reveal.mjs` samples luminance
 * and answers a DIFFERENT question -- when card 1 is first SEEN, which includes
 * the visibility gate and the alpha ramp after the rung fires. Both are worth
 * knowing and they are not the same number; `q5-card-latency.mjs`'s header
 * records a ~680ms spread between them. **This one measures the TRIGGER**,
 * which is what Carl's sentence is about.
 *
 * ⚠ AND THE MARK IS THE AUTHORITATIVE CLOCK. Four pixel-reading instruments
 * failed to answer "did the entrance run" before `?beattrace=1` existed
 * (`q5-card-latency.mjs`). `card-beat-650` is emitted by `useCardEntrance`
 * itself at the moment the rung is consumed.
 *
 * ⚠ RUNS AGAINST PRODUCTION BY DEFAULT, and that is not a preference. Dev-server
 * frame numbers on this page are worthless -- a mesh arm read 231ms against
 * 269ms without, indistinguishable. Both older q5 harnesses hardcode :3000.
 *
 *   npm run build && npx next start -p 3100
 *   VERIFY_BASE_URL=http://localhost:3100 node verify/q5-card1-halfway.mjs
 *   VERIFY_BASE_URL=http://localhost:3100 node verify/q5-card1-halfway.mjs 3   (3 runs)
 *
 * ⚠ ONE REVEAL PER PAGE LOAD. Each run is a fresh browser context, so repeat
 * runs are independent -- but see the note on run order at the foot of this
 * file: a single reading on this page has measured the order rather than the
 * change before now.
 */

import { chromium } from "playwright";

// ⚠⚠ IMPORTED, NOT TYPED — 16 August 2026. `TARGET_MS` was the literal 650, a
// hand-copy of `CARD_FIRST_ENTRANCE_MS`; the mark name was the literal
// "card-beat-650" in two more places. Both now come from the module under test,
// so the harness's expectation cannot drift from the code.
// ⚠ READ FROM SOURCE, NOT IMPORTED — `answer-card-geometry.ts` imports a
// sibling without a file extension, which Node's ESM loader rejects. Parsed as
// text instead, the same way `cross-section.mjs` does it, and THROWS rather
// than defaulting: a fallback would reintroduce the staleness being fixed.
import { readFileSync } from "node:fs";

const GEOM_SRC = readFileSync("components/enquiry/answer-card-geometry.ts", "utf8");
function geomNum(name) {
  const m = GEOM_SRC.match(new RegExp(`^export const ${name} = ([-\\d.]+);`, "m"));
  if (!m) {
    throw new Error(
      `q5-card1-halfway.mjs: could not read '${name}' from answer-card-geometry.ts.\n` +
        `⚠ DO NOT hardcode a value here — a typed 650 is the exact defect this ` +
        `read replaced (16 August 2026).`,
    );
  }
  return Number(m[1]);
}

const CARD_FIRST_ENTRANCE_MS = Math.round(geomNum("Q5_REVEAL_MS") / 2);
const CARD_RISE_GAP_MS = Math.round(
  geomNum("CARD_RISE_DURATION_MS") * (1 - geomNum("CARD_OVERLAP")),
);
const CARD_RISE_LADDER_MS = [0, 1, 2, 3, 4].map(
  (i) => CARD_FIRST_ENTRANCE_MS + i * CARD_RISE_GAP_MS,
);

const BASE = process.env.VERIFY_BASE_URL ?? "http://localhost:3100";
const RUNS = Number(process.argv[2] ?? 1);

const TARGET_MS = CARD_FIRST_ENTRANCE_MS;
const TOLERANCE_MS = 30;

/** How far a beat may drift from its expected rung before the ladder is wrong. */
const GAP_TOLERANCE_MS = 120;

/** Runs whose ladder failed count/ordering/gap. Fails the script at the end. */
const ladderBroken = [];

if (BASE.includes(":3000")) {
  console.error("\n⚠ REFUSING TO RUN AGAINST :3000.");
  console.error("  Dev-server timing on this page is not trustworthy. Build and");
  console.error("  serve production, then set VERIFY_BASE_URL=http://localhost:3100.\n");
  process.exit(1);
}

const browser = await chromium.launch({
  headless: false,
  args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"],
});

/** Abort on a software rasteriser -- every harness in this folder does. */
{
  const probe = await browser.newPage();
  await probe.goto("about:blank");
  const renderer = await probe.evaluate(() => {
    const gl = document.createElement("canvas").getContext("webgl2");
    if (!gl) return "NO WEBGL2";
    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    return ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : "UNKNOWN";
  });
  console.log(`\nrenderer: ${renderer}`);
  if (/swiftshader|llvmpipe|software/i.test(String(renderer))) {
    console.error("⚠ SOFTWARE RASTERISER — numbers would be meaningless. Aborting.");
    await browser.close();
    process.exit(1);
  }
  await probe.close();
}

const results = [];

for (let run = 1; run <= RUNS; run++) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  await page.goto(`${BASE}/start?beattrace=1`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /begin/i }).click();

  // Wait for the card 1 mark rather than a fixed sleep: the ladder is gated on
  // `compiled`, whose cost has moved repeatedly during this project.
  //
  // ⚠⚠ THE MARK NAME IS DERIVED, NOT TYPED — 16 August 2026. This read
  // `"card-beat-650"` as a LITERAL, in two places. `CARD_FIRST_ENTRANCE_MS` is
  // `Math.round(Q5_REVEAL_MS / 2)`; retime the reveal and the literal silently
  // stops matching any mark, at which point every run reports UNMEASURABLE and
  // the script exits 1 with "NOTHING MEASURED" — a failure that looks like a
  // broken PAGE rather than a stale harness.
  //
  // ⚠ CHECKED 16 AUGUST: the ladder does NOT vary by width. `Q5_REVEAL_MS` is a
  // TS constant with no media query or width branch, and both widths were
  // measured live — desktop and 390px both report a 1300ms reveal and an
  // identical 650/1210/1770/2330/2890 ladder. The mobile 1500/1550/1700ms
  // figures in `globals.css` belong to the OPENING sequence, not this reveal.
  // Derived anyway, because that is a fact about today's CSS, not a guarantee.
  const beatName = `card-beat-${CARD_FIRST_ENTRANCE_MS}`;

  /**
   * ⚠⚠ THE REJECTION IS NO LONGER SWALLOWED.
   *
   * This was `.catch(() => {})`. Verified 16 August, that is NOT a silent pass
   * and NOT a crash: the timeout is swallowed, `getEntriesByName(...)[0]`
   * returns `undefined`, and the `mark ? ... : null` guard below converts it to
   * `markTime = null`, which the run reports as UNMEASURABLE. So the outcome
   * was already honest — **but the REASON was lost.** "UNMEASURABLE" reads as
   * "the page did not produce a mark", and gave no hint whether the harness had
   * waited at all, or for how long, or for the right name.
   */
  const beatArrived = await page
    .waitForFunction(
      (n) => performance.getEntriesByName(n).length > 0,
      beatName,
      { timeout: 20000 },
    )
    .then(() => true)
    .catch(() => false);

  if (!beatArrived) {
    console.log(`\nrun ${run}: ⚠ TIMED OUT after 20000ms waiting for \`${beatName}\`.` +
      `\n  This is the harness reporting that the mark never appeared — NOT a` +
      `\n  measurement. Check ?beattrace=1 is on and that the entrance ran.`);
  }

  /**
   * ⚠ THEN WAIT OUT THE REST OF THE LADDER BEFORE ASSERTING ANYTHING ABOUT IT.
   *
   * The card-1 measurement is complete the moment its own mark lands, but the
   * COUNT/ORDERING checks need all five. Reading immediately after card 1
   * reports `1 beats, expected 5` on a perfectly healthy page — a false alarm
   * caught while falsifying this fix on 16 August.
   *
   * ⚠ THIS DOES NOT AFFECT THE CARD-1 FIGURE. `markTime` is a
   * `performance.mark` timestamp recorded when the rung fired; waiting longer
   * before READING it cannot move it.
   */
  const ladderComplete = await page
    .waitForFunction(
      (n) => performance.getEntriesByType("mark")
        .filter((m) => m.name.startsWith("card-beat-")).length >= n,
      CARD_RISE_LADDER_MS.length,
      { timeout: 20000 },
    )
    .then(() => true)
    .catch(() => false);

  if (beatArrived && !ladderComplete) {
    console.log(`\nrun ${run}: ⚠ only part of the ladder arrived within 20s of card 1.` +
      `\n  The count fault below is a real finding, not an early read.`);
  }

  const reading = await page.evaluate((n) => {
    const mark = performance.getEntriesByName(n)[0];
    const el = document.querySelector(".enquiry-q-text-reveal");
    // ⚠ MATCHED BY NAME, NOT INDEX -- `getAnimations()[0]` is order-dependent,
    // and a transition on this element would hand back the wrong clock. The
    // component's own anchor does exactly this; the harness must not be laxer
    // than the code it is checking.
    const anim = el
      ?.getAnimations?.()
      .find((a) => a.animationName === "enquiry-mask-reveal-horizontal");
    return {
      markTime: mark ? mark.startTime : null,
      revealStart: anim && typeof anim.startTime === "number" ? anim.startTime : null,
      revealDuration: anim ? anim.effect.getTiming().duration : null,
      allBeats: performance
        .getEntriesByType("mark")
        .filter((m) => m.name.startsWith("card-beat-"))
        .map((m) => ({ name: m.name, rung: Number(m.name.replace("card-beat-", "")), t: Math.round(m.startTime) })),
    };
  }, beatName);

  /**
   * ⚠⚠ LADDER INTEGRITY — ADDED 16 AUGUST 2026.
   *
   * This harness's headline is "card 1 fires N ms into the reveal", computed
   * from a mark it selects BY NAME. The name is `delayMs`, a constant; only the
   * timestamp is observed. **Nothing confirmed the named beat was really the
   * first rung.**
   *
   * ⚠ INJECTION A (16 August) delayed card 3 by +800ms with the ladder constant
   * untouched. `card-beat-1770` fired AFTER `card-beat-2330` and **this harness
   * passed clean**, because card 1 was unaffected.
   */
  const ladderFaults = (() => {
    const faults = [];
    const beats = reading.allBeats;
    if (!beats.length) return faults; // nothing to check; UNMEASURABLE handles it

    if (beats.length !== CARD_RISE_LADDER_MS.length) {
      faults.push(`COUNT: ${beats.length} beats, expected ${CARD_RISE_LADDER_MS.length}` +
        ` (missing: ${CARD_RISE_LADDER_MS.filter((r) => !beats.some((b) => b.rung === r)).join(", ") || "none"})`);
    }

    const byTime = [...beats].sort((a, b) => a.t - b.t);
    if (byTime.some((b, i) => i > 0 && b.rung < byTime[i - 1].rung)) {
      faults.push(`ORDERING: fired ${byTime.map((b) => b.rung).join(" → ")}, expected ascending`);
    }

    const first = beats.find((b) => b.rung === CARD_FIRST_ENTRANCE_MS);
    if (first) {
      for (const b of beats) {
        const drift = (b.t - first.t) - (b.rung - CARD_FIRST_ENTRANCE_MS);
        if (Math.abs(drift) > GAP_TOLERANCE_MS) {
          faults.push(`GAP: rung ${b.rung} drifts ${drift >= 0 ? "+" : ""}${drift}ms from its expected offset`);
        }
      }
    }
    return faults;
  })();

  if (ladderFaults.length) {
    ladderBroken.push({ run, faults: ladderFaults });
  }

  await context.close();

  if (reading.markTime === null || reading.revealStart === null) {
    console.log(`\nrun ${run}: UNMEASURABLE — ` +
      `${reading.markTime === null ? `no \`${beatName}\` mark` : "no reveal animation"}`);
    results.push(null);
    continue;
  }

  const intoReveal = reading.markTime - reading.revealStart;
  const pct = (intoReveal / reading.revealDuration) * 100;
  results.push(intoReveal);

  console.log(`\n── run ${run} ──`);
  console.log(`  reveal startTime   ${reading.revealStart.toFixed(0)}ms, duration ${reading.revealDuration}ms`);
  console.log(`  ${beatName} at   ${reading.markTime.toFixed(0)}ms`);
  console.log(`  → card 1 fires     ${intoReveal.toFixed(0)}ms into the reveal (${pct.toFixed(1)}%)`);
  if (reading.allBeats.length > 1) {
    const ladder = [...reading.allBeats]
      .sort((a, b) => a.t - b.t)
      .map((b) => `${b.rung}@${b.t}`)
      .join("  ");
    console.log(`  the whole ladder:  ${ladder}   (in FIRING order)`);
  }
  if (ladderFaults.length) {
    console.log(`  ladder integrity:  ⛔ BROKEN`);
    for (const f of ladderFaults) console.log(`                     · ${f}`);
  } else {
    console.log(`  ladder integrity:  ✅ ${reading.allBeats.length} beats, in order, gaps within ±${GAP_TOLERANCE_MS}ms`);
  }
}

await browser.close();

const measured = results.filter((r) => r !== null);
if (!measured.length) {
  console.log("\nNOTHING MEASURED.\n");
  process.exit(1);
}

const sorted = [...measured].sort((a, b) => a - b);
const median = sorted[Math.floor(sorted.length / 2)];
const drift = median - TARGET_MS;
const pass = Math.abs(drift) <= TOLERANCE_MS;

console.log("\n════════════════════════════════════════════════");
console.log(`  spec      ${TARGET_MS}ms ± ${TOLERANCE_MS}ms  (Carl, 11 August 2026)`);
console.log(`  measured  ${median.toFixed(0)}ms   (median of ${measured.length})`);
console.log(`  drift     ${drift >= 0 ? "+" : ""}${drift.toFixed(0)}ms`);
console.log(`  ${pass ? "✅ WITHIN TOLERANCE" : "❌ OUTSIDE TOLERANCE"}`);
console.log("════════════════════════════════════════════════");

console.log("\n⚠ THIS MEASURES THE TRIGGER, NOT WHAT CARL SEES. The rung firing at");
console.log("  650ms and card 1 being VISIBLE at 650ms are different claims — the");
console.log("  visibility gate and the alpha ramp sit between them. Use");
console.log("  `q5-card-vs-reveal.mjs` for first light, and Carl's eye to approve.");

if (measured.length === 1) {
  console.log("\n⚠ ONE RUN IS ONE READING. Identical code on this page has varied by");
  console.log("  more than the effects being hunted. Pass a run count for a median.");
}

/**
 * ⚠⚠ THE LADDER GATE — ADDED 16 AUGUST 2026.
 *
 * The `pass` above judges ONE number: where card 1 landed. It is computed from
 * a mark selected by NAME, so it is only meaningful if the ladder is intact.
 * A broken ladder therefore fails the script REGARDLESS of that verdict.
 */
if (ladderBroken.length) {
  console.log(`\n${"═".repeat(48)}`);
  console.log(`  ⛔ LADDER INTEGRITY FAILED in ${ladderBroken.length} of ${RUNS} run(s):`);
  for (const b of ladderBroken) {
    console.log(`     run ${b.run}:`);
    for (const f of b.faults) console.log(`       · ${f}`);
  }
  console.log(`
  ⚠ THE VERDICT ABOVE IS UNSAFE TO READ. It selects a mark by the NAME
    \`${`card-beat-${CARD_FIRST_ENTRANCE_MS}`}\` and treats it as the first rung. With the ladder
    broken, that beat may not be the one that fired first — the circularity
    injection A exposed on 16 August.`);
  console.log(`${"═".repeat(48)}\n`);
}

console.log(`
  ⚠ SCOPE — WHAT THIS DOES NOT WATCH: marks and animation clocks, never pixels;
    nothing about whether a card was DRAWN, about opacity, or about any question
    but Q5. ⚠ NEITHER TRACE CHANNEL CARRIES A QUESTION IDENTITY — after a
    corridor step the marks still hold Q5's data.
`);

process.exit(pass && !ladderBroken.length ? 0 : 1);
