/**
 * ⚠⚠ DOES CARD 1 ARRIVE HALFWAY THROUGH THE REVEAL — AT EVERY QUESTION?
 *
 *   VERIFY_BASE_URL=http://localhost:3100 node verify/reveal-ratio.mjs
 *   VERIFY_BASE_URL=http://localhost:3100 node verify/reveal-ratio.mjs 3
 *   INJECT=noflag  ...      INJECT=noreveal  ...
 *
 * ══ THE INSTRUCTION THIS CHECKS ══
 *
 * Carl, 11 August 2026: *"The Q5 reveal should trigger Card 1 at halfway through
 * the reveal. Thats 650ms."* `CARD_FIRST_ENTRANCE_MS` is `Q5_REVEAL_MS / 2`
 * **because of that sentence.**
 *
 * ⚠ IT IS A RELATIONSHIP BETWEEN TWO EVENTS, NOT A DELAY. So the headline here
 * is the **RATIO** — where card 1 lands inside the reveal's envelope — with the
 * milliseconds reported beside it, never instead of it. A ratio survives a
 * retune; 650ms does not, and `Q5_REVEAL_MS` is PROVISIONAL under D-035.
 *
 * ══ ⚠ WHY THIS EXISTS WHEN `q5-card1-halfway.mjs` ALREADY COMPUTES THE RATIO ══
 *
 * **That harness never leaves Q5.** It has no step in it — one Begin click, one
 * reveal, one reading. And Q5 is the question that WORKS. The live fault is at
 * Q4-Q1, where the entrance runs a whole question ahead of the reveal.
 *
 * ⚠ IT IS NOT SUPERSEDED AND MUST NOT BE DELETED. Its Q5 figure is this
 * harness's CROSS-CHECK: two instruments, one number. If they disagree, one is
 * wrong and neither result ships.
 *
 * ══ ⚠⚠ THE WALK — CONDITION 2, AND IT IS NOT A DETAIL ══
 *
 * `trace-identity.mjs` clicked hardcoded canvas coordinates with BOTH clicks
 * wrapped in `.catch(() => {})`. The canvas is `pointer-events: none`, so both
 * failed silently and **it reported a pass for weeks while never leaving Q5.**
 * That is the exact failure mode of adding a step to a harness that never had
 * one.
 *
 * Therefore, here:
 *   · real hit targets (`answer-card-hover-N`), never canvas coordinates
 *   · NO `.catch()` anywhere on a step — a step that fails FAILS THE RUN
 *   · ⚠ the advance is VERIFIED INDEPENDENTLY of the ratio: `__activeQ` must
 *     actually change, and the run aborts if it does not
 *   · the verification is REPORTED SEPARATELY, so "the walk advanced" and "the
 *     ratio was N%" can never be confused for one another
 *
 * ══ ⚠ WHAT THIS DOES NOT WATCH ══
 *
 *   · ⚠ WHETHER THE REVEAL STALLS. A 400ms mid-wipe freeze produces no event and
 *     no value change here: `startTime` and `getTiming()` both describe the
 *     animation's INTENT. Detecting a flatline needs a per-frame progress poll —
 *     deferred to its own chunk, on Carl's decision, 17 August.
 *   · PIXELS. Computed values are not paint. The video track remains the only
 *     unperturbing observation of what was actually shown.
 *   · MOBILE — excluded deliberately. The reveal is 1300ms at both widths, so
 *     this is not a timing gap; it is simply unexercised.
 *   · THE EXIT, and anything after the last question.
 */

import { chromium } from "@playwright/test";
import { readFileSync } from "node:fs";
import { READ_REVEAL, ratioOf } from "./lib/reveal-ratio.mjs";

const BASE = process.env.VERIFY_BASE_URL ?? "http://localhost:3100";
const RUNS = Number(process.argv[2] ?? 3);
const INJECT = process.env.INJECT ?? "";

const INJECTIONS = {
  noflag: "load without ?beattrace=1 so no beats exist",
  noreveal: "strip the reveal class so no animation can be resolved",
};
if (INJECT && !(INJECT in INJECTIONS)) {
  console.error(`unknown INJECT="${INJECT}". one of: ${Object.keys(INJECTIONS).join(", ")}`);
  process.exit(2);
}

/**
 * ⚠ THE RUNG IS DERIVED FROM SOURCE, NEVER TYPED — the precedent is
 * `q5-card1-halfway.mjs`, which had `650` and the mark name `"card-beat-650"` as
 * literals in three places until 16 August. It THROWS rather than defaulting: a
 * fallback would reintroduce the staleness the read replaced.
 */
const GEOM_SRC = readFileSync("components/enquiry/answer-card-geometry.ts", "utf8");
function geomNum(name) {
  const m = GEOM_SRC.match(new RegExp(`^export const ${name} = ([-\\d.]+);`, "m"));
  if (!m) throw new Error(`reveal-ratio.mjs: could not read '${name}'. ⚠ DO NOT hardcode it.`);
  return Number(m[1]);
}
const CARD_FIRST_ENTRANCE_MS = Math.round(geomNum("Q5_REVEAL_MS") / 2);

/** Carl's stated spec, 11 August. ⚠ NOT a noise floor — see the report. */
const TOLERANCE_MS = 30;

if (/:3000(\/|$)/.test(BASE) && !process.env.ALLOW_DEV) {
  console.error("\n⚠ PRODUCTION IS THE VERDICT. Dev and production DISAGREE on this defect");
  console.error("  (0/75 fall-throughs on dev, 25 on production) — dev alone reported it fixed.");
  console.error("  Set ALLOW_DEV=1 to run dev deliberately, as CONTEXT beside a prod run.\n");
  process.exit(1);
}

const browser = await chromium.launch({
  headless: false,
  args: ["--enable-gpu", "--use-gl=angle", "--ignore-gpu-blocklist"],
});

const rows = [];
const walkFaults = [];
/** Questions whose ladder never reached five beats within the wait. */
const ladderTimeouts = [];

for (let run = 1; run <= RUNS; run++) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  if (INJECT === "noreveal") {
    // ⚠ STRIPS THE CLASS THE ANIMATION IS ON, so nothing resolves. The harness
    // must RED on "no animation resolved" — never report 0%, which is a real
    // position and would read as a card arriving at the reveal's start.
    /**
     * ⚠ STRIPPED ON AN rAF LOOP, NOT VIA MutationObserver — CORRECTED AFTER THE
     * FIRST ATTEMPT SILENTLY FAILED TO INJECT.
     *
     * The observer version reported `present=true`: React re-adds the class on
     * its own render, and the harness still went RED — **for the unrelated
     * ratio faults.** A red from an injection that never took would have been
     * recorded as "the injection works". ⚠ The resolution report is what caught
     * it, which is exactly why spec §7 requires printing what was resolved.
     */
    await page.addInitScript(() => {
      const strip = () => {
        for (const el of document.querySelectorAll(".enquiry-q-text-reveal")) {
          el.classList.remove("enquiry-q-text-reveal");
        }
        requestAnimationFrame(strip);
      };
      requestAnimationFrame(strip);
    });
  }

  const url = `${BASE}/start?anchortrace=1${INJECT === "noflag" ? "" : "&beattrace=1"}`;
  await page.goto(url, { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: /begin/i }).click();
  await page.locator(".enquiry-answer-grid").waitFor({ state: "visible", timeout: 30000 });
  await page.waitForTimeout(6200);

  const perQ = [];
  for (let step = 0; step <= 4; step++) {
    /**
     * ⚠⚠ WAIT FOR THE LADDER TO FINISH BEFORE READING — CORRECTED AFTER THIS
     * HARNESS DISAGREED WITH `trace-identity.mjs` ON THE SAME BUILD.
     *
     * It reported **3 of 5 beats** at Q4-Q1 and raised that as a defect;
     * `trace-identity.mjs` reported **5**, correctly. The difference was the
     * READ TIME, not the page: this waited 3000ms after the step, and the last
     * rung fires at `CARD_FIRST_ENTRANCE_MS + 4 * CARD_RISE_GAP_MS` = 2890ms
     * **plus its own rise**. The ladder was still running when it was counted.
     *
     * ⚠ A HARNESS THAT READS EARLY INVENTS A DEFECT. Waiting for the state
     * rather than guessing a duration is this file's own standing rule, and it
     * was broken here on the first attempt.
     */
    await page
      .waitForFunction(
        (n) => {
          const q = window.__activeQ;
          if (q === null || q === undefined) return false;
          return (
            performance
              .getEntriesByType("mark")
              .filter((m) => m.name.startsWith("card-qbeat-") && m.name.endsWith(`-Q${q}`)).length >= n
          );
        },
        5,
        { timeout: 12000 },
      )
      .catch(() => {
        // ⚠ NOT SWALLOWED — recorded as a fault below via the beat-count
        // assertion. The timeout means the ladder genuinely did not complete,
        // which is a finding; it must not abort the run and lose the reading.
        ladderTimeouts.push(`run ${run}, question index ${step}`);
      });

    const reading = await page.evaluate(READ_REVEAL);
    perQ.push(reading);
    if (step === 4) break;


    /**
     * ⚠⚠ THE STEP — CONDITION 2. NO `.catch()`, AND THE ADVANCE IS VERIFIED.
     *
     * `__activeQ` is read before and after. If it does not decrease by exactly
     * one, the walk did not advance and the run is ABORTED — because a reading
     * taken after a failed step is a reading for the WRONG QUESTION, which is
     * indistinguishable from a healthy one in the output.
     */
    const qBefore = await page.evaluate(() => window.__activeQ ?? null);
    await page.getByTestId("answer-card-hover-0").click();
    await page.waitForTimeout(700);
    await page.getByRole("button", { name: /next step/i }).click({ timeout: 10000 });
    await page.waitForTimeout(3000);
    const qAfter = await page.evaluate(() => window.__activeQ ?? null);

    if (qBefore === null || qAfter === null || qAfter !== qBefore - 1) {
      walkFaults.push(
        `run ${run}, step ${step + 1}: __activeQ went ${qBefore} → ${qAfter}, expected ${qBefore === null ? "?" : qBefore - 1}`,
      );
      break;
    }
  }

  /**
   * ⚠⚠ WHICH RUNG THE CODE ACTUALLY USED — AND THIS IS WHAT MAKES THE RATIO
   * MEAN ANYTHING. ADDED AFTER THE FIRST VERSION WENT GREEN ON A KNOWN-BROKEN
   * BUILD.
   *
   * **The first version of this harness reported ~50% at every question on a
   * build where the anchor was falling through to `now` at Q4-Q1.** It was
   * measuring a tautology: when the anchor falls through, the entrance sets
   * `revealStart = nowMs - CARD_FIRST_ENTRANCE_MS`, so card 1's beat lands
   * exactly one rung after that synthetic origin **by construction** — and the
   * element's real `startTime` happens to sit within a few ms of it, because the
   * fall-through occurs as the new reveal begins.
   *
   * ⚠ SO THE RATIO WAS 50% BY ARITHMETIC, NOT BY CHOREOGRAPHY — the exact trap
   * that `?anchortrace=1` was built to expose for the anchor fix, reproduced
   * inside the instrument written to detect it.
   *
   * **A ratio computed from an anchor the code did not use is not a
   * measurement.** The rung is therefore read and asserted, not merely printed.
   */
  const anchors = await page.evaluate(() => window.__anchorTrace ?? []);
  const rungByQ = new Map();
  for (const a of anchors) {
    if (!rungByQ.has(a.q)) rungByQ.set(a.q, a.rung);
  }

  rows.push({ run, perQ, rungByQ });
  await page.close();
}
await browser.close();

const fail = (msg, detail) => {
  console.log(`\n  ⛔ RED — ${msg}`);
  if (detail) console.log(detail);
  console.log("");
  process.exit(1);
};

console.log(`\n  base:       ${BASE}`);
console.log(`  injection:  ${INJECT ? `⚠ ${INJECT} — ${INJECTIONS[INJECT]}` : "(none — the honest measurement)"}`);
console.log(`  card 1 rung: ${CARD_FIRST_ENTRANCE_MS}ms  (derived: Q5_REVEAL_MS / 2)`);

/**
 * ⚠⚠ THE WALK VERIFICATION IS REPORTED FIRST AND SEPARATELY — CONDITION 2.
 * "The walk advanced" and "the ratio was N%" must never be confused for one
 * another. A harness that steps and a harness that reports are two claims.
 */
console.log(`\n  ── WALK VERIFICATION (independent of any ratio) ──`);
if (walkFaults.length) {
  console.log(`  ⛔ THE WALK DID NOT ADVANCE:`);
  for (const f of walkFaults) console.log(`     · ${f}`);
  fail(
    "THE WALK FAILED — no ratio below can be trusted.",
    "     A reading taken after a failed step belongs to the WRONG QUESTION and is\n" +
      "     indistinguishable from a healthy one. `trace-identity.mjs` reported a pass for\n" +
      "     weeks on exactly this fault.",
  );
}
const questionsSeen = rows.map((r) => r.perQ.map((p) => p.q).join("→"));
console.log(`  ✅ every step advanced __activeQ by exactly one:`);
for (const [i, s] of questionsSeen.entries()) console.log(`     run ${i + 1}: Q${s.replaceAll("→", " → Q")}`);

// ── the resolution report — spec §7: state what was resolved, every run ──
const anyAnim = rows.some((r) => r.perQ.some((p) => p.animationName));
const anyBeat = rows.some((r) => r.perQ.some((p) => p.beats.length));
console.log(`\n  ── WHAT WAS RESOLVED ──`);
const first = rows[0].perQ[0];
console.log(`  animation:  ${first.animationName ?? "(none resolved)"}`);
console.log(`  element:    .enquiry-q-text-reveal  present=${first.revealElPresent}`);
console.log(`  duration:   ${first.revealDuration ?? "(none)"}ms   ← from getTiming(), never a literal`);

// ⚠ ABSENCE IS A FAILURE, NOT AN EMPTY PASS.
if (!anyBeat) {
  fail(
    "NO TRACE AT ALL — no question-keyed beat marks anywhere.",
    "     Without ?beattrace=1 the page publishes no beats, which is correct behaviour and\n" +
      "     an INVALID measurement. Every assertion below is satisfied by this emptiness.",
  );
}
if (!anyAnim) {
  fail(
    "NO REVEAL ANIMATION RESOLVED — the envelope is unknown.",
    "     ⚠ THIS IS NOT 0%. A missing reveal and a card arriving at the reveal's START are\n" +
      "     different findings and must never collapse into the same number.",
  );
}

// ── the ratio, per question ──
console.log(`\n  ── THE RATIO: where card 1 lands inside the reveal ──`);
console.log(`  question   ratio     into reveal   beats   anchor rung    verdict`);

const byQ = new Map();
for (const r of rows) {
  for (const p of r.perQ) {
    if (p.q === null) continue;
    const ratio = ratioOf(p, CARD_FIRST_ENTRANCE_MS);
    if (!byQ.has(p.q)) byQ.set(p.q, []);
    byQ.get(p.q).push({ ratio, p, rung: r.rungByQ.get(p.q) ?? null });
  }
}

const faults = [];
for (const q of [...byQ.keys()].sort().reverse()) {
  const entries = byQ.get(q);
  const measurable = entries.filter((e) => e.ratio !== null);
  if (!measurable.length) {
    const why = entries[0].p.revealStart === null ? "no reveal resolvable" : "no card-1 beat";
    console.log(`  Q${q}         —         —             —                    ⛔ ${why}`);
    faults.push(`Q${q}: UNMEASURABLE — ${why}`);
    continue;
  }
  const pcts = measurable.map((e) => e.ratio.pct);
  const med = [...pcts].sort((a, b) => a - b)[Math.floor(pcts.length / 2)];
  const ms = [...measurable.map((e) => e.ratio.intoRevealMs)].sort((a, b) => a - b)[Math.floor(measurable.length / 2)];
  const off = Math.abs(ms - CARD_FIRST_ENTRANCE_MS);
  const inBand = off <= TOLERANCE_MS;

  /**
   * ⚠ THE RUNG AND THE BEAT COUNT ARE PART OF THE VERDICT, NOT DECORATION.
   *
   * ⚠⚠ REPORTED AS A COUNT OVER RUNS, NOT AS A MERGED SET. The first version
   * collapsed every run's rung into one `Set` per question and printed
   * `3-now,2-cssanim` — which reads as "this question used two anchors" when it
   * actually means "different runs used different anchors". **A per-question
   * verdict built from a cross-run union cannot say which run was bad**, and it
   * made Q5 look like it fell through when the raw trace shows Q5 is
   * `2-cssanim` on every run.
   */
  const rungList = entries.map((e) => e.rung).filter(Boolean);
  const fellThroughCount = rungList.filter((r) => r === "3-now").length;
  const fellThrough = fellThroughCount > 0;
  const rungs = [`${fellThroughCount}/${rungList.length} now`];
  const beatCounts = [...new Set(entries.map((e) => e.p.beats.length))];
  const shortLadder = beatCounts.some((n) => n < 5);

  const ok = inBand && !fellThrough && !shortLadder;
  console.log(
    `  Q${q}        ${med.toFixed(1).padStart(6)}%   ${ms.toFixed(0).padStart(7)}ms   ${beatCounts.join("/").padStart(5)}   ${(rungs.join(",") || "?").padEnd(12)}   ${ok ? "✅" : "⛔"}`,
  );

  if (!inBand) faults.push(`Q${q}: card 1 at ${med.toFixed(1)}% (${ms.toFixed(0)}ms), expected ~50% (${CARD_FIRST_ENTRANCE_MS}±${TOLERANCE_MS}ms)`);
  /**
   * ⚠⚠ A RATIO COMPUTED FROM AN ANCHOR THE CODE DID NOT USE IS NOT A
   * MEASUREMENT. When the anchor falls through to `now`, the ladder's origin is
   * SYNTHESISED as `now - CARD_FIRST_ENTRANCE_MS`, so card 1 lands one rung
   * later BY CONSTRUCTION and the ratio reads ~50% however untethered the cards
   * actually are. **This is the assertion that stopped this harness passing a
   * known-broken build.**
   */
  if (fellThrough) {
    faults.push(
      `Q${q}: THE ANCHOR FELL THROUGH TO \`now\` in ${fellThroughCount} of ${rungList.length} run(s) — the ` +
        `${med.toFixed(1)}% above is ARITHMETIC, not choreography. The ladder's origin was synthesised, ` +
        `not read from this question's reveal.`,
    );
  }
  if (shortLadder) {
    faults.push(`Q${q}: only ${beatCounts.join("/")} of 5 beats carry this question's key — an incomplete ladder.`);
  }
}

console.log(`\n  ⚠ TARGET IS 50% — card 1 at the reveal's MIDPOINT. Tolerance ±${TOLERANCE_MS}ms is`);
console.log(`    Carl's stated spec (11 August), NOT a measured noise floor.`);

if (faults.length) {
  console.log(`\n  ⛔ RED — ${faults.length} fault(s):`);
  for (const f of faults) console.log(`     · ${f}`);
  console.log(`\n  ⚠ THIS IS THE EXPECTED RESULT ON TODAY'S PRODUCTION BUILD. The entrance runs`);
  console.log(`    ahead of the incoming question's reveal, so the anchor falls through to \`now\`.`);
  console.log(`    ⚠ A GREEN HERE TODAY WOULD MEAN THE INSTRUMENT IS WRONG.\n`);
  process.exit(1);
}

console.log(`\n  ✅ CARD 1 LANDS AT THE REVEAL'S MIDPOINT AT EVERY QUESTION.`);
console.log(`     ⚠ This does NOT say the reveal ran smoothly — a stall produces no event and`);
console.log(`       no value change here. That is the deferred progress poller.\n`);
process.exit(0);
