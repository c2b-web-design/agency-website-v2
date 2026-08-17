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
};

if (INJECT && !(INJECT in INJECTIONS)) {
  console.error(`unknown INJECT="${INJECT}". one of: ${Object.keys(INJECTIONS).join(", ")}`);
  process.exit(2);
}

const useFlag = INJECT !== "noflag";
const url = `${BASE}/start?modetrace=1${useFlag ? "&anchortrace=1" : ""}`;

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

  const r = await page.evaluate(() => ({
    anchors: window.__anchorTrace ?? null,
    modes: window.__modeTrace ?? [],
  }));
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
    if (!perQ.has(a.q)) perQ.set(a.q, { rung1: 0, rung2: 0, rung3: 0 });
    const e = perQ.get(a.q);
    if (a.rung === "1-published") e.rung1 += 1;
    else if (a.rung === "2-cssanim") e.rung2 += 1;
    else e.rung3 += 1;
  }
  for (const m of r.modes) {
    total += 1;
    if (m.mode === "B-clamped") clamped += 1;
  }
}

console.log(`  question   rung1(published)   rung2(css anim)   rung3(now)`);
for (const q of [...perQ.keys()].sort().reverse()) {
  const e = perQ.get(q);
  console.log(
    `  Q${String(q).padEnd(8)}  ${String(e.rung1).padStart(14)}   ${String(e.rung2).padStart(15)}   ${String(e.rung3).padStart(10)}${e.rung3 ? "  ⚠" : ""}`,
  );
}
const rate = total ? Math.round((clamped / total) * 100) : 0;
console.log(`\n  Mode B: ${clamped}/${total} entries (${rate}%)`);

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
