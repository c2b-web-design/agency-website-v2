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
// ⚠⚠ WHAT A PASS HERE MEANS — READ THIS BEFORE READING A RESULT.
//
// **It does NOT mean a card enters at Q4. It cannot, and this harness is not
// asking it to.** `shownRef` is reset only in the `!active` branch, and `active`
// is `entranceRunning = active && compiled && warm`, whose terms all latch or
// are stage-derived — so no beat can fire at a question step. That is a separate
// defect (the missing card entrance) and is out of scope here.
//
// **What a pass means is that Q4's SILENCE IS NOW LEGIBLE AS SILENCE** rather
// than wearing Q5's numbers. A trace that correctly reports nothing happened at
// Q4 is SUCCESS.
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
  forge: "fabricate a Q4-keyed entry that no card produced",
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

// ⚠ INJECTION 4 BREAKS THE IDENTITY READ AT ITS SOURCE, by renaming the class
// the accessor looks for. The cards still enter; the question becomes
// unaddressable — which is exactly the corridor-move case in production, where
// `.enquiry-pdepth-0` is not in the DOM at all.
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

// ⚠ INJECTION 2 FABRICATES A Q4 KEY. If the "Q4 absent" assertion is vacuous —
// never actually evaluated — this will not turn it RED and the assertion is
// worthless.
if (INJECT === "forge") {
  await page.evaluate(() => {
    performance.mark("card-qbeat-650-Q4");
    (window.__cardTrace ??= []).push({ t: 0, card: 650, raw: 0.5, q: "Q4" });
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

// ── step to Q4 ────────────────────────────────────────────────────────────────
// Select an answer, then advance. The cards must be given longer than a full
// ladder to enter, so that "no beat at Q4" is a measurement and not impatience.
const card = page.locator("canvas").first();
await card.click({ position: { x: 200, y: 450 } }).catch(() => {});
await page.waitForTimeout(400);
const next = page.getByRole("button", { name: /next step|send/i }).first();
await next.click({ timeout: 5000 }).catch(() => {});
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

// 2. Q4 produced nothing — asserted by KEY, never by time.
if (q4KeysAfter.length) {
  faults.push(
    `Q4 ENTRIES PRESENT (${q4KeysAfter.join(", ")}) — no card enters at Q4, so no beat should carry a Q4 key.`,
  );
}
if (atQ4.traceKeys.includes("Q4")) {
  faults.push(`__cardTrace CARRIES Q4 SAMPLES — same fault on channel B.`);
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
  console.log(`  ✅ IDENTITY HOLDS.`);
  console.log(`     Q5's beats are present and keyed; Q4 carries no beat of its own;`);
  console.log(`     the two are separable BY KEY ALONE, with no timestamp consulted.`);
  console.log(`
  ⚠ Q4 HAVING NO BEAT IS THE CORRECT RESULT, NOT A FAILURE. No card enters at
    Q4 — a separate defect. What is fixed here is that its silence now READS as
    silence instead of wearing Q5's numbers.

  ⚠ Skips: ${atQ4.skips}. Any consumer filtering by question must check this
    before trusting a per-question total — a blank key is dropped, not counted.

  ⚠ Verification is not approval.`);
} else {
  console.log(`  ⛔ FAILED — ${faults.length} fault(s):`);
  for (const f of faults) console.log(`     · ${f}`);
}
console.log(`${"═".repeat(64)}\n`);

process.exit(faults.length ? 1 : 0);
