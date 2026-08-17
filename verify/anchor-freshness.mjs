/**
 * ⚠⚠ DOES THE CARD LADDER ANCHOR TO **THIS** QUESTION'S REVEAL?
 *
 *   node verify/anchor-freshness.mjs
 *   INJECT=stale  node verify/anchor-freshness.mjs
 *   INJECT=noflag node verify/anchor-freshness.mjs
 *
 * ══ THE DEFECT THIS EXISTS FOR ══
 *
 * `CARD_FIRST_ENTRANCE_MS` is 650 because it is `Q5_REVEAL_MS / 2` — Carl's
 * instruction is that **card 1 arrives HALFWAY THROUGH THE REVEAL**. That is a
 * RELATIONSHIP between two events, not a delay.
 *
 * `__revealStart` used to be published bare, and the ladder's only guards were
 * "is a number" and "is in the past". **A reveal start from the PREVIOUS
 * question satisfies both.** Measured 17 August 2026: Q4's entrance read Q5's
 * anchor from ~8.2s earlier, the clamp fired, and the ladder ran with correct
 * internal spacing against the wrong clock — 100% Mode B at Q4-Q1 on the first
 * production capture.
 *
 * The publisher now stamps the question (`__revealStartQ`) and the reader
 * rejects a stamp that does not match `__activeQ`.
 *
 * ══ ⚠⚠ WHAT THIS CANNOT TELL YOU — READ BEFORE QUOTING A RESULT ══
 *
 * **NOTHING IN THIS REPO MEASURES THE REVEAL.** The beat trace sees the card;
 * no instrument sees the text. So *"card 1 arrives halfway through the reveal"*
 * — the actual instruction — **cannot be verified here or anywhere else in
 * `verify/` today.** That is item 3, and it is not built.
 *
 * What this asserts is narrower and worth stating exactly: **the anchor the
 * ladder used belongs to the question being entered.** A correct anchor is
 * necessary for the relationship to hold and is not sufficient to prove it does.
 *
 * ⚠ AND `overrun ≈ 0` IS NOT PROOF EITHER. If the guard rejected a stale anchor
 * and fell through to `nowMs`, the overrun would be 0 and the modetrace would
 * read Mode A while the cards were exactly as untethered as before — **Mode A by
 * arithmetic, not by choreography.** This harness reads `?anchortrace=1` to see
 * WHICH RUNG answered, which is what tells the two apart. Measured on the fix:
 * rung `3-now` never occurred in 20 question-entrances.
 */

import { chromium } from "@playwright/test";

const BASE = process.env.VERIFY_BASE_URL ?? "http://localhost:3000";
const INJECT = process.env.INJECT ?? "";
const RUNS = Number(process.argv[2] ?? 3);

const INJECTIONS = {
  /** Freeze a previous question's anchor in place, re-stamped as current. */
  stale: "pin __revealStart to an 8s-old value and forge a matching stamp",
  /** No flag at all — the trace does not exist. Must RED, never green. */
  noflag: "load without ?anchortrace=1 so no trace exists",
  /**
   * ⚠ FORCE A WRONG PREDICTION. The arriving edge is displaced 500ms into the
   * past, so the prediction lands 500ms early. The ratio must go far off 50%.
   * **A prediction nobody can falsify is a guess.**
   */
  wrongpredict: "displace the arriving edge -500ms so the prediction is wrong",
  /**
   * ⚠⚠ THE NEGATIVE-OVERRUN PATH, NEVER EXECUTED BEFORE 17 AUGUST 2026. The edge
   * is displaced into the FUTURE, so the predicted anchor is ahead of `now`,
   * `overrun` goes negative and the clamp does not fire. Traced as benign — the
   * card held hidden, then proceeding. **Traced is not measured**, so this runs
   * it and watches the card rather than the arithmetic.
   */
  futureanchor: "displace the arriving edge +400ms into the future (negative overrun)",
};

if (INJECT && !(INJECT in INJECTIONS)) {
  console.error(`unknown INJECT="${INJECT}". one of: ${Object.keys(INJECTIONS).join(", ")}`);
  process.exit(2);
}

const useFlag = INJECT !== "noflag";
/**
 * ⚠ `beattrace=1` IS REQUIRED FOR THE LADDER EVIDENCE, and its absence produced
 * a fabricated defect. The `futureanchor` check counts `card-qbeat-*` marks —
 * which only exist under `?beattrace=1`. Without it the count was 0, and the
 * harness reported "A FUTURE-DATED ANCHOR STOPPED THE LADDER" against a build
 * where a direct probe found all 25 marks present, 5 per question.
 * **It was counting marks that could not exist.**
 */
const url = `${BASE}/start?modetrace=1&beattrace=1${useFlag ? "&anchortrace=1" : ""}`;

const browser = await chromium.launch({
  headless: false,
  args: ["--enable-gpu", "--use-gl=angle", "--ignore-gpu-blocklist"],
});

console.log(`\n  base:      ${BASE}`);
console.log(`  injection: ${INJECT ? `⚠ ${INJECT} — ${INJECTIONS[INJECT]}` : "(none — the honest measurement)"}\n`);

const rows = [];
for (let run = 1; run <= RUNS; run++) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  if (INJECT === "stale") {
    /**
     * ⚠ THE INJECTION FORGES A MATCHING STAMP ON PURPOSE. Pinning the value
     * alone would be rejected by the stamp check and prove nothing about the
     * ladder — it would only prove the guard reads a stamp. Forging the stamp
     * makes the anchor look perfectly valid and stale, which is the case the
     * clamp must still catch.
     */
    await page.addInitScript(() => {
      let pinned;
      Object.defineProperty(window, "__revealStart", {
        get() {
          return pinned;
        },
        set(v) {
          if (pinned === undefined) pinned = v - 8000;
        },
        configurable: true,
      });
      Object.defineProperty(window, "__revealStartQ", {
        get() {
          return window.__activeQ;
        },
        set() {
          /* swallowed — the forged stamp always reports "current" */
        },
        configurable: true,
      });
    });
  }

  /**
   * ⚠ THESE TWO DISPLACE THE EDGE TIMESTAMP, NOT THE PREDICTION. Patching the
   * prediction itself would test nothing — it would assert that a number the
   * harness chose equals the number the harness chose. Moving the INPUT makes
   * the component compute a genuinely wrong answer from its own code path.
   */
  if (INJECT === "wrongpredict" || INJECT === "futureanchor") {
    const shift = INJECT === "wrongpredict" ? -500 : 400;
    await page.addInitScript((ms) => {
      let real;
      Object.defineProperty(window, "__arrivingEdgeAt", {
        get() { return real === undefined ? undefined : real + ms; },
        set(v) { real = v; },
        configurable: true,
      });
    }, shift);
  }

  await page.goto(url, { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: /begin/i }).click();
  await page.locator(".enquiry-answer-grid").waitFor({ state: "visible", timeout: 30000 });
  await page.waitForTimeout(6200);
  for (let s = 0; s < 4; s++) {
    await page.getByTestId("answer-card-hover-0").click();
    await page.waitForTimeout(700);
    await page.getByRole("button", { name: /next step/i }).click();
    await page.waitForTimeout(2600);
  }
  /**
   * ⚠⚠ WAIT OUT THE FINAL LADDER BEFORE READING IT — and this harness reported a
   * defect that did not exist without it.
   *
   * `futureanchor` shifts the anchor 400ms into the future, which pushes the
   * last rung past the 2600ms step wait. The read then found **0 beats on the
   * final question** and the harness reported "A FUTURE-DATED ANCHOR STOPPED THE
   * LADDER." **It had not.** A direct probe on the same build showed all five
   * `-Q4` marks present with `overrunMs: -400`, `A-anchored` — the negative
   * overrun is benign, exactly as traced.
   *
   * ⚠ THE THIRD READ-TIMING DEFECT IN THIS SESSION, all in harnesses I wrote,
   * all of them inventing a fault in healthy code. Wait for the state.
   */
  await page.waitForTimeout(6000);

  /**
   * ⚠ THE CARD IS WATCHED, NOT ONLY THE ARITHMETIC — for `futureanchor`. The
   * negative-overrun path was TRACED as benign (card held hidden, then
   * proceeds). This reads the beat marks that prove it actually did that: five
   * rungs, in order, is a ladder that ran; no marks is a card that never came.
   */
  const r = await page.evaluate(() => {
    const q = window.__activeQ;
    const beats = performance
      .getEntriesByType("mark")
      .filter((m) => m.name.startsWith("card-qbeat-"))
      .map((m) => m.name);
    return {
      anchors: window.__anchorTrace ?? null,
      modes: window.__modeTrace ?? [],
      beatCount: beats.length,
      lastQBeats: beats.filter((n) => n.endsWith(`-Q${q}`)).length,
    };
  });
  rows.push(r);
  await page.close();
}
await browser.close();

const fail = (msg, detail) => {
  console.log(`\n  ⛔ RED — ${msg}`);
  if (detail) console.log(detail);
  console.log("");
  process.exit(1);
};

// ⚠ ABSENCE IS A FAILURE. Every assertion below is satisfied by an empty trace.
const anyTrace = rows.some((r) => Array.isArray(r.anchors) && r.anchors.length);
if (!anyTrace) {
  fail(
    "NO TRACE AT ALL — `window.__anchorTrace` is absent or empty.",
    "     Without the flag nothing is published, which is correct behaviour and an INVALID\n" +
      "     measurement. A harness that goes green here certifies a page it never measured.",
  );
}

let clamped = 0;
let total = 0;
let fellToNow = 0;
const perQ = new Map();
for (const r of rows) {
  const seen = new Set();
  for (const a of r.anchors ?? []) {
    if (a.rung === "3-now") fellToNow += 1;
    if (seen.has(a.q)) continue;
    seen.add(a.q);
    if (!perQ.has(a.q)) perQ.set(a.q, { rung1: 0, rung2: 0, rung2b: 0, rung3: 0 });
    const e = perQ.get(a.q);
    if (a.rung === "1-published") e.rung1 += 1;
    else if (a.rung === "2-cssanim") e.rung2 += 1;
    else if (a.rung === "2b-predicted") e.rung2b += 1;
    else e.rung3 += 1;
  }
  for (const m of r.modes) {
    total += 1;
    if (m.mode === "B-clamped") clamped += 1;
  }
}

console.log(`  question   rung1(published)   rung2(css anim)   2b(predicted)   rung3(now)`);
for (const q of [...perQ.keys()].sort().reverse()) {
  const e = perQ.get(q);
  console.log(
    `  Q${String(q).padEnd(8)}  ${String(e.rung1).padStart(14)}   ${String(e.rung2).padStart(15)}   ${String(e.rung2b).padStart(13)}   ${String(e.rung3).padStart(10)}${e.rung3 ? "  ⚠" : ""}`,
  );
}
const rate = total ? Math.round((clamped / total) * 100) : 0;
console.log(`\n  Mode B: ${clamped}/${total} entries (${rate}%)`);

/**
 * ⚠⚠ THE SELF-CHECK — the prediction's own drift, reported every run.
 *
 * **This is what makes the prediction falsifiable in the field.** It is
 * populated only when rung 2 also resolved, so a small `n` is expected and is
 * itself informative: it says how often the prediction could be checked at all.
 * ⚠ REPORTED, NOT ASSERTED — no threshold is set on it until its own
 * distribution has been established.
 */
/**
 * ⚠ THE NEGATIVE-OVERRUN EVIDENCE IS REPORTED BEFORE THE DRIFT ASSERTION, and
 * the ordering was wrong on the first attempt.
 *
 * `futureanchor` displaces the edge by design, so the drift assertion fires and
 * `fail()` exits — **taking the ladder evidence with it.** That injection exists
 * to observe THE CARD, not the arithmetic, so its evidence must be printed
 * before anything can exit. The drift RED that follows is correct and expected
 * for this injection.
 */
if (INJECT === "futureanchor") {
  const ladders = rows.map((r) => r.lastQBeats);
  console.log(`\n  futureanchor: beats on the final question per run: ${ladders.join(", ")}`);
  if (ladders.some((n) => n < 5)) {
    fail(
      "A FUTURE-DATED ANCHOR STOPPED THE LADDER.",
      "     `overrun` goes negative and the clamp does not fire; the card should be HELD\n" +
        "     hidden and then proceed. A short ladder means it did not proceed.",
    );
  }
  console.log(`  ✅ the ladder still ran to five rungs with a negative overrun — held, then proceeded.`);
  console.log(`     ⚠ The drift RED below is EXPECTED for this injection: it displaces the edge.`);
}

const drifts = [];
for (const r of rows) for (const a of r.anchors ?? []) if (a.deltaMs !== null && a.deltaMs !== undefined) drifts.push(a.deltaMs);
if (drifts.length) {
  const s = [...drifts].sort((x, y) => x - y);
  const worst = Math.max(Math.abs(s[0]), Math.abs(s[s.length - 1]));
  console.log(
    `\n  SELF-CHECK  predicted - observed:  n=${s.length}  min ${s[0].toFixed(1)}  median ${s[Math.floor(s.length / 2)].toFixed(1)}  max ${s[s.length - 1].toFixed(1)}ms`,
  );
  /**
   * ⚠⚠ ASSERTED, AND THE THRESHOLD IS MEASURED — 17 August 2026.
   *
   * **The first version REPORTED the drift and asserted nothing, and the
   * wrong-prediction injection EXITED 0 because of it.** The injection displaced
   * the edge by 500ms; the self-check printed -493.5ms and the harness passed,
   * because the anchor was still question-correct and still not `now` — the two
   * things it did assert. **A published number nothing fails on is a report, not
   * a check.**
   *
   * ⚠ THE THRESHOLD IS ONE FRAME (16.7ms), and that is derived rather than
   * chosen: the prediction's whole error budget IS the frame it quantises over,
   * so a drift larger than one frame means the constant no longer describes this
   * machine's scheduling. Measured on production, 25 comparable samples:
   * **2.4 to 6.8ms, median 6.1** — inside half a frame, as the ±7.95ms bound
   * predicts. The injection produced -493.5ms. Two orders of magnitude apart.
   */
  const DRIFT_LIMIT_MS = 16.7;
  if (worst > DRIFT_LIMIT_MS) {
    fail(
      `THE PREDICTION DRIFTED ${worst.toFixed(1)}ms FROM THE OBSERVED REVEAL START.`,
      `     Limit is one frame (${DRIFT_LIMIT_MS}ms) — the interval the prediction quantises over.\n` +
        `     ⚠ RE-MEASURE THE CONSTANT, DO NOT TUNE IT. It describes frame scheduling, not\n` +
        `     choreography, so a drift this size means the measurement moved (machine, refresh\n` +
        `     rate, browser), not that the number wants adjusting.`,
    );
  }
  console.log(`  ✅ within one frame (${DRIFT_LIMIT_MS}ms) — the prediction still describes this machine.`);
} else {
  console.log(`\n  SELF-CHECK  no comparable samples (rung 2 never resolved alongside a prediction).`);
  console.log(`  ⚠ NOT "no drift" — "not comparable". The prediction went unchecked this run.`);
}

/**
 * ⚠ RUNG 3 IS THE "MODE A BY ARITHMETIC" TRAP AND IS ASSERTED SEPARATELY. It
 * produces overrun 0 — indistinguishable from a healthy anchor in the modetrace
 * alone.
 */
if (fellToNow) {
  fail(
    `THE ANCHOR FELL THROUGH TO \`now\` ${fellToNow} TIME(S).`,
    "     That yields overrun 0 and READS as Mode A while the ladder has no relationship to\n" +
      "     the text at all. A guard that turns a wrong answer into no answer is not better.",
  );
}

if (rate > 0) {
  fail(
    `MODE B FIRED ON ${rate}% OF ENTRIES.`,
    "     The ladder re-based to `now`, so its relationship to the reveal is whatever the\n" +
      "     race produced. With a question-stamped anchor this should not happen on a walk.",
  );
}

console.log(`\n  ✅ EVERY QUESTION ANCHORED TO ITS OWN REVEAL — 0% Mode B, and the anchor never`);
console.log(`     fell through to \`now\`.`);
console.log(`\n  ⚠ THIS DOES NOT SAY CARD 1 LANDS HALFWAY THROUGH THE REVEAL. Nothing in this repo`);
console.log(`    measures the reveal — no instrument sees the text. That is item 3, unbuilt.`);
console.log(`    What is asserted is that the anchor BELONGS TO the question being entered.\n`);
process.exit(0);
