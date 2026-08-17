/**
 * ⚠⚠ DOES THE QUESTION-BOUNDARY PHASE MACHINE PUBLISH ITS TRANSITIONS, IN ORDER,
 * WITH THE RIGHT QUESTION ON EACH ONE?
 *
 *   node verify/phase-trace.mjs
 *   INJECT=noflag node verify/phase-trace.mjs
 *
 * ══ WHY THIS EXISTS AT ALL ══
 *
 * `handleNextStep` used to express the question boundary as two bare
 * `setTimeout`s. **Nothing in the system could show that ordering being wrong.**
 * The exit has never been profiled, the reveal instrument is not built, and
 * `?beattrace=1` watches the entrance only. Two timers cannot be asserted
 * against; three named phases with timestamps can.
 *
 * This harness is the reason the restructure was allowed to land: the publishing
 * had to arrive WITH it, not after.
 *
 * ══ WHAT A PASS MEANS, AND WHAT IT DOES NOT ══
 *
 * **It does NOT mean a card enters at Q4, or that anything animates.** Step 1
 * lands the machine and its instrument only. `leaving` drives nothing yet;
 * `arriving` re-arms nothing yet. What a pass means is that **the system can now
 * NAME the boundary** — which is the thing items 2 and 4 both needed and neither
 * had.
 *
 * ══ THE PHASES ══
 *
 *   settled    a question is up and interactive
 *   leaving    t=0, the Next-step click; this question's cards are departing
 *   arriving   t=1150, with setActiveQ; the next question's cards are entering
 *
 * ⚠ `arriving` IS AN EDGE, NOT A STORED STATE, AND THIS HARNESS ASSERTS THAT
 * DISTINCTION. The pre-restructure code set `activeQ` and cleared
 * `corridorMoving` in ONE React batch. Storing `arriving` would either be
 * coalesced away — a trace claiming a state the system never held — or add a
 * commit the old code never produced, which is a behaviour change. So it is
 * published as an edge and the stored phase goes `leaving` -> `settled`.
 *
 * ══ THE FOUR INJECTIONS ══
 *
 * A check that has never been shown to fail is a report, not a check. This
 * project has shipped past that twice — `one-context.mjs` reported ✅ 2/2 for
 * weeks while watching a canvas the defect was not in, and `q5-stutter.mjs`
 * reported 0/3 CLEAN on a visible defect because it shared the fix's constant.
 * A third instrument was found blind on 17 August (`corridor-motion.mjs`,
 * sampling an element a later CSS split had made static).
 *
 *   1  noflag    — no ?phasetrace=1     → RED "no trace at all", NOT green
 *   2  reorder   — arriving before leaving → RED "phases out of order"
 *   3  drop      — one transition suppressed → RED "expected 3, saw 2"
 *   4  stall     — never leaves `leaving`  → RED "did not settle"
 *
 * ⚠ INJECTION 1 IS THE ONE THAT MATTERS MOST. A harness that goes green when its
 * data source is absent will certify a page it never measured.
 */

import { chromium } from "@playwright/test";

const BASE = process.env.VERIFY_BASE_URL ?? "http://localhost:3000";
const INJECT = process.env.INJECT ?? "";

const INJECTIONS = {
  /** No flag at all. The trace array is never created. MUST be RED, never green-by-emptiness. */
  noflag: null,
  /** Publish `arriving` before `leaving` — the ordering the exit and entrance depend on. */
  reorder: () => {
    const w = window;
    w.__phaseTrace = [];
    const real = w.__phaseTrace.push.bind(w.__phaseTrace);
    let held = null;
    w.__phaseTrace.push = (e) => {
      if (e.phase === "leaving") { held = e; return 1; }
      if (e.phase === "arriving" && held) { real(e); real(held); held = null; return 1; }
      return real(e);
    };
  },
  /** Suppress the `arriving` edge entirely. */
  drop: () => {
    const w = window;
    w.__phaseTrace = [];
    const real = w.__phaseTrace.push.bind(w.__phaseTrace);
    w.__phaseTrace.push = (e) => (e.phase === "arriving" ? 1 : real(e));
  },
  /** Never leave `leaving` — the machine hangs mid-move. */
  stall: () => {
    const w = window;
    w.__phaseTrace = [];
    const real = w.__phaseTrace.push.bind(w.__phaseTrace);
    let seenLeaving = false;
    w.__phaseTrace.push = (e) => {
      if (e.phase === "leaving") seenLeaving = true;
      else if (seenLeaving) return 1;
      return real(e);
    };
  },
};

if (INJECT && !(INJECT in INJECTIONS)) {
  console.error(`unknown INJECT="${INJECT}". one of: ${Object.keys(INJECTIONS).join(", ")}`);
  process.exit(2);
}

const useFlag = INJECT !== "noflag";
const url = `${BASE}/start${useFlag ? "?phasetrace=1" : ""}`;

const browser = await chromium.launch({
  headless: false,
  args: ["--enable-gpu", "--use-gl=angle", "--ignore-gpu-blocklist"],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

if (INJECT && INJECTIONS[INJECT]) {
  await page.addInitScript(INJECTIONS[INJECT]);
}

console.log(`\n  base:      ${BASE}`);
console.log(`  injection: ${INJECT || "(none — the honest measurement)"}`);
console.log(`  url:       ${url}\n`);

await page.goto(url, { waitUntil: "domcontentloaded" });

await page.getByRole("button", { name: /begin/i }).click();
await page.locator(".enquiry-answer-grid").waitFor({ state: "visible", timeout: 30000 });
await page.waitForTimeout(6500);

// One real step: Q5 -> Q4, by real user actions.
await page.getByTestId("answer-card-hover-0").dispatchEvent("pointerdown");
await page.waitForTimeout(700);
await page.getByRole("button", { name: /next step/i }).click();
// 1150ms step + margin for the arriving edge and the settle.
await page.waitForTimeout(2200);

const trace = await page.evaluate(() => window.__phaseTrace ?? null);
const skips = await page.evaluate(() => window.__traceIdentitySkips ?? 0);
await browser.close();

const fail = (msg, detail) => {
  console.log(`\n  ⛔ RED — ${msg}`);
  if (detail) console.log(detail);
  console.log("");
  process.exit(1);
};

// ⚠ ABSENCE IS A FAILURE, NOT AN EMPTY PASS. This is the assertion that the
// `noflag` injection exists to prove fires.
if (!trace || !Array.isArray(trace)) {
  fail(
    "NO TRACE AT ALL — `window.__phaseTrace` is absent.",
    `     Without the flag the machine publishes nothing, which is correct behaviour and an\n` +
      `     INVALID measurement. A harness that goes green here would certify a page it never\n` +
      `     measured — the failure this project has shipped past twice.`,
  );
}

console.log(`  ${trace.length} edge(s) published:\n`);
for (const e of trace) {
  console.log(`    ${String(e.phase).padEnd(9)} Q${e.q}   @${e.t.toFixed(0)}ms`);
}

if (trace.length === 0) fail("THE TRACE IS EMPTY — the flag was set but no edge was ever published.");

// The walk above takes exactly one step, so the expected sequence is fixed.
const phases = trace.map((e) => e.phase);
const expected = ["leaving", "arriving", "settled"];

if (phases.length !== expected.length) {
  fail(
    `EXPECTED ${expected.length} PHASES, SAW ${phases.length}.`,
    `     expected: ${expected.join(" -> ")}\n     saw:      ${phases.join(" -> ")}`,
  );
}

for (let i = 0; i < expected.length; i++) {
  if (phases[i] !== expected[i]) {
    fail(
      "PHASES OUT OF ORDER.",
      `     expected: ${expected.join(" -> ")}\n     saw:      ${phases.join(" -> ")}\n` +
        `     ⚠ The exit fires on \`leaving\` and the entrance re-arms on \`arriving\`. If these\n` +
        `       invert, cards enter before the space clears.`,
    );
  }
}

// ⚠ THE MACHINE MUST COME TO REST. A phase that never settles means the corridor
// is stuck mid-move: the incoming phrase is withheld forever (:1972) and the rAF
// host-rect tracker never stops (:792).
if (phases[phases.length - 1] !== "settled") {
  fail("THE PHASE MACHINE DID NOT SETTLE.", `     final phase: ${phases[phases.length - 1]}`);
}

// ⚠ IDENTITY, NOT JUST ORDER. `leaving` is about the question being left; the
// two later edges are about the one arriving. Without this a trace could fire
// three correctly-ordered edges all naming the same question and pass.
const [lv, ar, st] = trace;
if (!(lv.q === 5 && ar.q === 4 && st.q === 4)) {
  fail(
    "THE EDGES NAME THE WRONG QUESTIONS.",
    `     expected: leaving Q5, arriving Q4, settled Q4\n` +
      `     saw:      leaving Q${lv.q}, arriving Q${ar.q}, settled Q${st.q}\n` +
      `     ⚠ Three correctly-ordered edges naming ONE question is the defect \`?beattrace=1\`\n` +
      `       had until 16 August — a full, healthy-looking sequence for the wrong question.`,
  );
}

// ⚠ THE GAP IS REPORTED, NOT ASSERTED. The 1150ms is a timer, not a measurement,
// and this thread has already spent a week on a fault misnamed by its
// instrument. No number here becomes a constant until it has been measured
// across runs.
const gap = ar.t - lv.t;
console.log(`\n  leaving -> arriving: ${gap.toFixed(0)}ms   (timer is 1150ms — REPORTED, not asserted)`);

// ⚠ OPTION B'S SUCCESS CONDITION, PRE-STATED. The skip counter read 4 on every
// page load before the phase machine published the live question — the DOM read
// failed in normal operation, not only at the boundary.
console.log(`  __traceIdentitySkips: ${skips}`);
if (skips > 0) {
  fail(
    `THE IDENTITY READ STILL SKIPPED ${skips} TIME(S).`,
    `     Option B routes \`questionIdentity()\` through the published question so it stays\n` +
      `     correct DURING the move, which is exactly when the DOM read returned "".`,
  );
}

console.log(`\n  ✅ THE BOUNDARY IS PUBLISHED: 3 edges, in order, naming the right questions,`);
console.log(`     and the identity read no longer skips.`);
console.log(`     ⚠ This says the system can NAME the boundary. It does NOT say anything`);
console.log(`       animates — nothing does yet, by design.\n`);
process.exit(0);
