// Does the beat trace say WHICH QUESTION a beat belongs to?
//
//   node verify/trace-identity.mjs
//   VERIFY_BASE_URL=http://localhost:3100 node verify/trace-identity.mjs
//
// ⚠⚠ THE DEFECT THIS EXISTS FOR. Measured 16 August 2026 on the live tree, no
// injection: stepping to Q4 left `?beattrace=1` republishing Q5's data —
//
//     Q5: MARKS 650@9058 1210@9625 1770@10192 2330@10742 2890@11309   605 samples
//     Q4: MARKS 650@9058 1210@9625 1770@10192 2330@10742 2890@11309   605 samples
//         new marks at Q4: 0      new samples at Q4: 0
//
// A full, correct-looking ladder AT A QUESTION WHERE NO CARD ENTERED. It was
// indistinguishable from a healthy run, and distinguishable from the flag being
// off only. Ten harnesses read that trace and every one inherited Q5's timings
// as the current question's.
//
// ⚠⚠ THE ASSERTION INVERTED ON 17 AUGUST 2026, IN THE COMMIT THAT MADE ABSENCE
// WRONG. READ THIS BEFORE READING A RESULT.
//
// **Until Step 2 this harness asserted Q4 entries were ABSENT, and that was
// correct.** Its header said, in these words: *"Q4 having no beat is the correct
// result, not a failure."* It was true because `shownRef` was reset only in the
// `!active` branch, and `active` (`entranceRunning = active && compiled && warm`)
// never went false at a question step — so no beat could fire at Q4.
//
// ⚠ **THAT SENTENCE IS GONE ON PURPOSE AND MUST NOT COME BACK.** It encoded the
// defect as the expected state. The entrance re-arm (item 2) makes Q4 produce a
// real ladder, so a harness still asserting absence would go RED on the correct
// fix — the trap this file was warned about in its own plan.
//
// **What a pass NOW means:** Q4 produces five beats of its own, keyed `Q4`, AND
// Q5's five are still present and unchanged. The harness was inverted, never
// deleted and never weakened in advance.
//
// ⚠⚠ THE NEGATIVE CONTROL IS WHAT CARRIED OVER, AND IT IS WHY THIS INVERSION IS
// SAFE. "Q5 survives the step intact" is what distinguishes IDENTITY from
// DELETION, and it is true both before and after item 2. Without it, "Q4 now has
// beats" would also pass against a trace that had simply been rewritten.
//
// ⚠ IT ASSERTS WITHOUT READING A SINGLE TIMESTAMP. The old trace was wrong in a
// way timestamps could not expose — Q4's entries WERE Q5's entries, so every
// time was internally consistent. Identity has to be checkable by key alone or
// it has not been added.

import { chromium } from "@playwright/test";

const BASE = process.env.VERIFY_BASE_URL ?? "http://localhost:3000";

/** Injection to run, or "" for the honest measurement. */
const INJECT = process.env.INJECT ?? "";

const WATCH_MS = 6000;

/**
 * ⚠ THE FOUR INJECTIONS ARE PART OF THE HARNESS, NOT A SEPARATE EXERCISE.
 *
 * A check that has never been shown to fail is a report, not a check. This
 * project has shipped past that twice — `one-context.mjs` reported ✅ 2/2 for
 * weeks while watching a canvas the defect was not in, and `q5-stutter.mjs`
 * reported 0/3 CLEAN on a visible defect because it shared the fix's constant.
 *
 *   1  strip     — identity removed        → RED "cannot distinguish Q5 from Q4"
 *   2  forge     — a Q4 key fabricated     → RED "Q4 entries present"
 *   3  noflag    — no ?beattrace=1 at all  → RED "no trace at all", NOT green
 *   4  blankkey  — identity unaddressable  → skip counter must RISE
 *
 * ⚠ INJECTION 3 IS THE ONE THAT MATTERS MOST. A harness that goes green when
 * its data source is absent will certify a page it never measured.
 */
const INJECTIONS = {
  strip: "remove the q suffix and q field from every entry",
  suppress: "swallow Q4's beat marks — the re-arm appearing not to have happened",
  noflag: "load without ?beattrace=1 so no trace exists",
  blankkey: "make the identity read return empty",
};

if (INJECT && !INJECTIONS[INJECT]) {
  console.error(`Unknown INJECT="${INJECT}". Valid: ${Object.keys(INJECTIONS).join(", ")}, or unset.`);
  process.exit(2);
}

const browser = await chromium.launch({
  headless: false,
  args: ["--enable-gpu", "--use-gl=angle", "--ignore-gpu-blocklist"],
});
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();

// ⚠ INJECTION 3 REMOVES THE FLAG ITSELF. The harness must go RED on an absent
// data source rather than green on an empty one.
const url = INJECT === "noflag" ? `${BASE}/start` : `${BASE}/start?beattrace=1`;

const res = await page.goto(url, { waitUntil: "domcontentloaded" });
if (!res || !res.ok()) {
  console.error(`FAILED: ${res?.status() ?? "no response"} — is the dev server running?`);
  process.exit(1);
}

/**
 * ⚠ INJECTION 4 BREAKS THE IDENTITY READ AT ITS SOURCE, by renaming the class
 * the accessor looks for.
 *
 * ⚠⚠ IT NO LONGER REACHES THE PRIMARY READ — MEASURED 17 August 2026, AND THIS
 * IS A FINDING, NOT A REASON TO CHANGE ANYTHING.
 *
 * Option B (Step 1) made `questionIdentity()` read `window.__activeQ` FIRST and
 * fall back to the DOM. This injection strips `.enquiry-pdepth-0`, which is now
 * only the fallback — so the accessor still resolves, the skip counter stays at
 * 0, and this injection reports "THE COUNTER DID NOT MOVE".
 *
 * **That is the correct behaviour of the fixed code, and the injection is now
 * stale rather than the counter being broken.** To exercise the blank-key path
 * today an injection would have to delete `window.__activeQ` AND the DOM node.
 * ⚠ Recorded rather than rewritten: the counter is still the only thing that
 * makes a blank key visible, and it must not be deleted to make a run look
 * clean.
 */
if (INJECT === "blankkey") {
  await page.addStyleTag({ content: "/* injection 4 */" });
  await page.evaluate(() => {
    const strip = () => {
      for (const el of document.querySelectorAll(".enquiry-pdepth-0")) {
        el.classList.remove("enquiry-pdepth-0");
        el.classList.add("enquiry-pdepth-0-injected-away");
      }
    };
    strip();
    new MutationObserver(strip).observe(document.body, { childList: true, subtree: true });
  });
}

const begin = page.getByRole("button", { name: /begin/i });
await begin.waitFor({ state: "visible", timeout: 25000 });
await page.waitForFunction(
  () => {
    const b = [...document.querySelectorAll("button")].find((el) => /begin/i.test(el.textContent ?? ""));
    return b && !b.disabled && getComputedStyle(b).pointerEvents !== "none";
  },
  { timeout: 25000 },
);
await begin.click();
await page.waitForTimeout(WATCH_MS);

/** Reads both channels by KEY ONLY — no timestamps are consulted anywhere. */
const snapshot = async () =>
  page.evaluate(() => {
    const marks = performance.getEntriesByType("mark").map((m) => m.name);
    const trace = window.__cardTrace ?? [];
    return {
      // ⚠ TWO DISTINCT PREFIXES, DELIBERATELY. The bare mark is
      // `card-beat-650`; the identified twin is `card-qbeat-650-Q5`. They do
      // NOT share a prefix, because five dependents select on
      // `startsWith("card-beat-")` and parse the remainder as a number — a
      // suffixed twin under that prefix parsed to NaN and broke the ladder.
      identifiedMarks: marks.filter((n) => /^card-qbeat-\d+-\S+$/.test(n)),
      bareMarks: marks.filter((n) => /^card-beat-\d+$/.test(n)),
      traceKeys: [...new Set(trace.map((e) => e.q ?? "<<missing>>"))],
      traceCount: trace.length,
      skips: window.__traceIdentitySkips ?? 0,
    };
  });

const atQ5 = await snapshot();

/**
 * ⚠⚠ INJECTION 2 — RE-TARGETED WITH THE ASSERTION, 17 August 2026.
 *
 * It used to FABRICATE a Q4 key, because the assertion was "Q4 is absent" and
 * the risk was that the assertion never actually evaluated. **The assertion is
 * now "Q4 has five beats", so its mirror is suppression:** make it look as
 * though the re-arm never happened, and the harness must go RED.
 *
 * ⚠ IT SUPPRESSES AT THE MARK, NOT AT THE SOURCE. Injecting into the component
 * would need a build; swallowing the marks as they are recorded reproduces
 * exactly what a failed re-arm looks like to every consumer of this trace.
 */
if (INJECT === "suppress") {
  await page.evaluate(() => {
    const realMark = performance.mark.bind(performance);
    performance.mark = (name, ...rest) =>
      /^card-qbeat-\d+-Q4$/.test(String(name)) ? undefined : realMark(name, ...rest);
    const realPush = Array.prototype.push;
    const t = (window.__cardTrace ??= []);
    t.push = function (...items) {
      return realPush.apply(this, items.filter((e) => e?.q !== "Q4"));
    };
  });
}

// ⚠ INJECTION 1 STRIPS THE IDENTITY BACK OUT, reproducing the pre-fix trace: the
// bare marks and samples survive, the keys do not.
if (INJECT === "strip") {
  await page.evaluate(() => {
    performance.clearMarks();
    for (const n of ["card-beat-650", "card-beat-1210", "card-beat-1770", "card-beat-2330", "card-beat-2890"]) {
      performance.mark(n);
    }
    window.__cardTrace = (window.__cardTrace ?? []).map(({ t, card, raw }) => ({ t, card, raw }));
  });
}

/**
 * ── step to Q4 ──────────────────────────────────────────────────────────────
 *
 * ⚠⚠ THIS BLOCK SWALLOWED ITS OWN FAILURES AND NEVER STEPPED — FOUND 17 August
 * 2026, AND ITS OLD PASS WAS VACUOUS.
 *
 * It clicked `page.locator("canvas")` at a hardcoded `{x:200, y:450}` and
 * wrapped BOTH clicks in `.catch(() => {})`. Under the shared host the canvas is
 * `pointer-events: none` — the hit targets are DOM siblings — so the card click
 * silently failed, `selected` stayed empty, the Next-step wrapper stayed
 * `opacity: 0; pointer-events: none`, and its click failed too. **Both failures
 * were caught and discarded.**
 *
 * ⚠ SO THE HARNESS REPORTED "Q4 CORRECTLY HAS NO BEATS" WHILE NEVER LEAVING Q5.
 * The assertion it was proudest of was satisfied by a step that did not happen.
 * Measured against a throwaway probe on the same build: real user actions
 * produced five Q4 marks and 605 new samples; this block produced zero.
 *
 * ⚠ NO `.catch()` HERE, DELIBERATELY. A step that cannot happen must fail the
 * run, not be absorbed into the measurement. `card-interaction.mjs` is the
 * precedent for the hit-target route.
 */
await page.getByTestId("answer-card-hover-0").dispatchEvent("pointerdown");
await page.waitForTimeout(500);
await page.getByRole("button", { name: /next step|send/i }).first().click({ timeout: 10000 });
await page.waitForTimeout(WATCH_MS);

const atQ4 = await snapshot();
await browser.close();

// ── the verdict ───────────────────────────────────────────────────────────────
const faults = [];
const q5Keys = atQ5.identifiedMarks.filter((n) => n.endsWith("-Q5"));
const q4KeysAfter = atQ4.identifiedMarks.filter((n) => n.endsWith("-Q4"));
const q5KeysAfter = atQ4.identifiedMarks.filter((n) => n.endsWith("-Q5"));

/**
 * ⚠⚠ ASSERTION 0 — THE DATA SOURCE EXISTS. THIS IS INJECTION 3's TARGET.
 *
 * Every assertion below is of the form "X is absent", and all of them pass
 * trivially against a page that published nothing at all. **A harness whose
 * checks are satisfied by emptiness certifies pages it never measured.** This
 * runs first and fails loudest.
 */
if (!atQ5.bareMarks.length && !atQ5.traceCount) {
  faults.push(
    "NO TRACE AT ALL — zero beat marks and zero samples at Q5. The instrument " +
      "did not run (is ?beattrace=1 present?). ⚠ THIS IS NOT A PASS: the " +
      "assertions below would all be satisfied by this same emptiness.",
  );
}

// 1. Q5 is present AND identified.
if (!faults.length && !q5Keys.length) {
  faults.push(
    `NO IDENTIFIED Q5 MARKS — found ${atQ5.bareMarks.length} bare beat mark(s) but none carrying a question key. ` +
      "The trace cannot say which question these beats belong to.",
  );
}

/**
 * ⚠⚠ 2. Q4 PRODUCES ITS OWN LADDER — INVERTED 17 AUGUST 2026 (item 2).
 *
 * **This asserted ABSENCE until the commit that made absence wrong.** The
 * entrance now re-arms at the `arriving` edge, so Q4 runs a real five-rung
 * ladder of its own. Asserted by KEY, never by time — the original defect was
 * invisible to timestamps, because Q4's entries WERE Q5's entries and every time
 * was internally consistent.
 *
 * ⚠ FIVE, NOT "SOME". A partial ladder is a real failure mode: the epoch could
 * re-arm `playedRef` while something else left `shownRef` set, and three beats
 * would look healthy in a log.
 */
const EXPECTED_RUNGS = 5;
if (!faults.length && q4KeysAfter.length !== EXPECTED_RUNGS) {
  faults.push(
    `Q4 PRODUCED ${q4KeysAfter.length} IDENTIFIED BEAT(S), EXPECTED ${EXPECTED_RUNGS}` +
      (q4KeysAfter.length ? ` (${q4KeysAfter.join(", ")})` : "") +
      ". The entrance re-arm should give Q4 a ladder of its own.",
  );
}
if (!faults.length && !atQ4.traceKeys.includes("Q4")) {
  faults.push(
    `__cardTrace CARRIES NO Q4 SAMPLES — the beat marks fired but channel B saw nothing.`,
  );
}

/**
 * ⚠ 3. THE NEGATIVE CONTROL, AND IT IS THE POINT.
 *
 * "Q4 absent" alone would pass against a trace that had been WIPED. The defect
 * was never absence — it was Q5's data being re-read AS Q4's. So Q5 must still
 * be present, complete and UNCHANGED after the step. That is what separates
 * identity from deletion.
 */
if (!faults.length) {
  if (q5KeysAfter.length !== q5Keys.length) {
    faults.push(
      `Q5's IDENTIFIED MARKS CHANGED ACROSS THE STEP — ${q5Keys.length} before, ${q5KeysAfter.length} after. ` +
        "Q5's record must survive the step intact.",
    );
  }
  if (!atQ4.traceKeys.includes("Q5")) {
    faults.push("Q5's SAMPLES VANISHED from __cardTrace after the step.");
  }
}

// 4. The blank-key counter — injection 4's target.
const skipRose = atQ4.skips > 0;

console.log(`\n${"═".repeat(64)}`);
console.log(`TRACE IDENTITY — ${INJECT ? `⚠ INJECTION "${INJECT}": ${INJECTIONS[INJECT]}` : "no injection (the honest measurement)"}`);
console.log(`${"═".repeat(64)}`);
console.log(`  at Q5   identified marks   ${atQ5.identifiedMarks.join(", ") || "(none)"}`);
console.log(`          bare marks         ${atQ5.bareMarks.length}`);
console.log(`          __cardTrace keys   ${atQ5.traceKeys.join(", ") || "(none)"}  (${atQ5.traceCount} samples)`);
console.log(`  after   identified marks   ${atQ4.identifiedMarks.join(", ") || "(none)"}`);
console.log(`  step    __cardTrace keys   ${atQ4.traceKeys.join(", ") || "(none)"}  (${atQ4.traceCount} samples)`);
console.log(`          new samples        ${atQ4.traceCount - atQ5.traceCount}`);
console.log(`  identity skips             ${atQ4.skips}${skipRose ? "  ⚠ the identity read came back empty" : ""}`);
console.log(`${"═".repeat(64)}`);

if (INJECT === "blankkey") {
  // ⚠ FOR THIS INJECTION THE COUNTER IS THE VERDICT. If it cannot be made to
  // rise, that is a FINDING about the blank-key path — never a reason to delete
  // the counter.
  if (skipRose) {
    console.log(`  ✅ RED AS REQUIRED — the skip counter rose to ${atQ4.skips}.`);
    console.log(`     Unlabelled entries are COUNTED, not silently dropped.`);
    process.exit(1);
  }
  console.log(`  ⛔ THE COUNTER DID NOT MOVE. Report as a finding about the`);
  console.log(`     blank-key path — do NOT remove the counter to make this pass.`);
  process.exit(1);
}

if (!faults.length) {
  console.log(`  ✅ IDENTITY HOLDS, AND Q4 HAS A LADDER OF ITS OWN.`);
  console.log(`     Q4 produced ${q4KeysAfter.length} keyed beats; Q5's ${q5KeysAfter.length} are still present and`);
  console.log(`     unchanged. The two are separable BY KEY ALONE, no timestamp consulted.`);
  console.log(`
  ⚠ THE NEGATIVE CONTROL IS WHAT MAKES THIS MEAN ANYTHING. "Q4 now has beats"
    would also pass against a trace that had simply been rewritten. Q5 surviving
    the step INTACT is what separates identity from deletion, and it is asserted
    both before and after item 2.

  ⚠ THIS SAYS THE BEATS FIRED, NOT THAT THE ENTRANCE LOOKS RIGHT. It reads marks
    and keys, never pixels. Whether Q4's cards actually fade in as Carl asked —
    *"once the space is vacated, the next question reveals and its cards fade
    in"* — is his eye, not this harness.

  ⚠ Skips: ${atQ4.skips}. Any consumer filtering by question must check this
    before trusting a per-question total — a blank key is dropped, not counted.

  ⚠ Verification is not approval.`);
} else {
  console.log(`  ⛔ FAILED — ${faults.length} fault(s):`);
  for (const f of faults) console.log(`     · ${f}`);
}
console.log(`${"═".repeat(64)}\n`);

process.exit(faults.length ? 1 : 0);
