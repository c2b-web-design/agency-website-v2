/**
 * ⚠⚠ THE PROPERTY THE WHOLE SPLIT EXISTS TO GUARANTEE — AND UNTIL NOW, NOTHING
 * ASSERTED IT.
 *
 * Carl's ruling, 15 August 2026: *"ONLY the question text and its selected
 * answer travel. The cards and the Next step button fade in and out IN PLACE
 * and never move."*
 *
 * Before the split, `bottom` animated on `.enquiry-phrase` — the phrase ROOT —
 * and `.enquiry-phrase-extras` is anchored to that root at
 * `top: calc(100% + 1rem)`. So the cards rode the recession as PASSENGERS, by
 * nesting, with **no line of code anywhere asking them to move**: 58px desktop
 * (3.625rem), ~74.8px mobile (4.675rem). The split moved `bottom`/`opacity`
 * onto an inner `.enquiry-phrase-travel`, leaving the extras on a static root.
 *
 * **THE MEASUREMENT THIS REPRODUCES:** mid-corridor the outgoing grid sat at
 * top 493 — its rest position — where pre-split it moved 493 → 480 at that same
 * moment. That figure came from a throwaway probe that was DELETED rather than
 * left behind. This file is that instrument, made permanent.
 *
 * ⚠⚠ WHY `active-grid-fixed.mjs` DOES NOT COVER THIS, AND IS NOT REDUNDANT
 * WITH IT. That harness samples **AT REST** — it waits out the whole move and
 * the entrance before reading. It passed green all week WHILE THE CARDS ROSE
 * AND FELL, because a passenger that travels and returns is back where it
 * started by the time the move is over. **A rest-only sampler cannot see
 * motion that ends.** This one samples DURING the recession, per frame.
 *
 * ⚠ RESOLUTION IS EXPLICIT AND REPORTED EVERY RUN. Mid-corridor there is NO
 * `.enquiry-pdepth-0` — `phraseList` withholds the active phrase entirely while
 * `corridorMoving`, so the outgoing extras lives under `.enquiry-pdepth-1`. A
 * selector assuming depth 0 matches NOTHING and passes vacuously. This script
 * therefore prints the element it resolved and its full parent chain on every
 * run, and FAILS LOUDLY if it resolved nothing.
 *
 *   VERIFY_BASE_URL=http://localhost:3100 node verify/extras-hold-position.mjs
 *
 * ⚠ SCOPE — WHAT THIS DOES NOT WATCH. Restated in the output, not just here,
 * because a header is not read at 2am:
 *   - It reads **rects, not pixels.** It would pass on a page rendering
 *     nothing at all. It is not a substitute for looking.
 *   - It says NOTHING about the fade, the 0.78 dimming, opacity of any kind,
 *     clickability, the rail's rungs, or the card entrance ladder.
 *   - It watches ONE box: `.enquiry-phrase-extras`. If the cards move INSIDE
 *     that box, this harness is blind to it.
 */

import { chromium } from "@playwright/test";

const BASE = process.env.VERIFY_BASE_URL ?? "http://localhost:3100";

if (/:3000(\/|$)/.test(BASE)) {
  console.error("\n⚠⚠ REFUSING TO RUN AGAINST :3000.\n");
  process.exit(1);
}

/**
 * ⚠ THE RECESSION IS 1150ms — read from `enquiry-opening.tsx`, where
 * `setCorridorMoving(true)` is followed by a 1150ms timeout that flips it back.
 * Sampling must span the WHOLE window: a probe that stops at 900ms misses the
 * settle, and one that starts late misses the launch.
 */
const RECESSION_MS = 1150;
const SAMPLE_OVERRUN_MS = 150;

/** How much movement counts as a failure, in CSS px. */
const TOLERANCE_PX = 1.5;

const WIDTHS = [
  { label: "desktop", width: 1440, height: 900 },
  { label: "mobile", width: 390, height: 844 },
];

const browser = await chromium.launch({
  headless: false,
  args: ["--enable-gpu", "--use-gl=angle", "--ignore-gpu-blocklist"],
});

const results = [];

for (const vp of WIDTHS) {
  const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
  await page.goto(`${BASE}/start`, { waitUntil: "networkidle" });

  console.log(`\n══════════════════════════════════════════════════════════`);
  console.log(`  ${vp.label.toUpperCase()}  ${vp.width}x${vp.height}`);
  console.log(`══════════════════════════════════════════════════════════`);

  await page.getByRole("button", { name: /begin/i }).click();
  await page.locator(".enquiry-answer-grid").waitFor({ state: "visible", timeout: 30000 });
  // The entrance must be over before we press — ENTRANCE_END_MS is 5440ms.
  await page.waitForTimeout(6200);

  // Select an answer so Next step is live.
  await page.getByTestId("answer-card-hover-0").click();
  await page.waitForTimeout(700);

  /**
   * ⚠ THE SAMPLER IS INSTALLED BEFORE THE PRESS, and runs on rAF in the page.
   * `page.screenshot()` costs ~84ms per capture on the same main thread the
   * motion lives on — a sampler slower than the thing it samples invents
   * defects and hides real ones. Rects are cheap; this reads only geometry.
   */
  await page.evaluate((recessionMs) => {
    const w = window;
    w.__extrasSamples = [];
    w.__extrasResolution = null;

    const chain = (el) => {
      const out = [];
      let n = el;
      while (n && n !== document.body) {
        const cls = (n.className || "").toString().trim().split(/\s+/).filter(Boolean);
        out.push(n.tagName.toLowerCase() + (cls.length ? "." + cls.join(".") : ""));
        n = n.parentElement;
      }
      return out;
    };

    // ⚠ RESOLVE EXPLICITLY. Mid-corridor the outgoing extras sits under
    // pdepth-1, NOT pdepth-0 — the active phrase is withheld while moving.
    // Prefer the fading (outgoing) copy; fall back to any extras present.
    const resolve = () =>
      document.querySelector(".enquiry-phrase-extras.enquiry-phrase-extras-out") ||
      document.querySelector(".enquiry-pdepth-1 .enquiry-phrase-extras") ||
      document.querySelector(".enquiry-phrase-extras");

    const start = performance.now();
    const tick = () => {
      const el = resolve();
      const t = Math.round(performance.now() - start);
      if (el) {
        // ⚠ LATCH THE RESOLUTION MID-RECESSION, NOT ON FRAME 0. At t=0 the
        // press has not taken effect yet: `corridorMoving` is still false, the
        // active phrase is still mounted, and the element resolves to the
        // depth-0 copy. Reporting THAT would describe the wrong element and
        // hide the very ambiguity this report exists to expose. Sampling
        // continues from frame 0 regardless — only the REPORT waits.
        const depthEl = el.closest("[class*='enquiry-pdepth-']");
        const depthClass = depthEl
          ? (depthEl.className.match(/enquiry-pdepth-\d/) || ["?"])[0]
          : "NONE";
        const isOutgoing =
          depthClass !== "enquiry-pdepth-0" ||
          el.classList.contains("enquiry-phrase-extras-out");
        if (!w.__extrasResolution || (!w.__extrasResolution.isOutgoing && isOutgoing)) {
          w.__extrasResolution = {
            selector: el.className,
            depthClass,
            isOutgoing,
            latchedAt: t,
            chain: chain(el),
            insideTravel: !!el.closest(".enquiry-phrase-travel"),
          };
        }
        const r = el.getBoundingClientRect();
        w.__extrasSamples.push({
          t,
          top: Math.round(r.top * 100) / 100,
          left: Math.round(r.left * 100) / 100,
          h: Math.round(r.height * 100) / 100,
        });
      } else {
        w.__extrasSamples.push({ t, top: null, left: null, h: null });
      }
      if (t < recessionMs) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, RECESSION_MS + SAMPLE_OVERRUN_MS);

  await page.getByRole("button", { name: /next step/i }).click();
  await page.waitForTimeout(RECESSION_MS + SAMPLE_OVERRUN_MS + 250);

  const { samples, resolution } = await page.evaluate(() => ({
    samples: window.__extrasSamples,
    resolution: window.__extrasResolution,
  }));

  // ── RESOLUTION REPORT — printed every run, pass or fail ──────────────────
  console.log("\n  RESOLVED ELEMENT");
  if (!resolution) {
    console.log("    ⚠⚠ NOTHING RESOLVED. No `.enquiry-phrase-extras` was found at");
    console.log("       ANY frame of the recession. This harness measured NOTHING.");
    console.log("       A pass here would be VACUOUS — treating it as a failure.");
  } else {
    console.log(`    class:        ${resolution.selector}`);
    console.log(`    depth:        ${resolution.depthClass}`);
    console.log(`    latched at:   t=${resolution.latchedAt}ms`);
    console.log(`    inside travel wrapper? ${resolution.insideTravel ? "⚠ YES — IT WILL RIDE" : "no (correct)"}`);
    if (!resolution.isOutgoing) {
      console.log("    ⚠⚠ NEVER RESOLVED THE OUTGOING COPY. This run only ever saw the");
      console.log("       ACTIVE (depth-0) extras — the recession may not have been");
      console.log("       captured at all. Treat any verdict below as SUSPECT.");
    }
    console.log("    parent chain:");
    resolution.chain.forEach((n, i) => console.log(`      ${"  ".repeat(i)}└ ${n}`));
  }

  const seen = samples.filter((s) => s.top !== null);
  const missing = samples.length - seen.length;

  console.log(`\n  SAMPLES: ${samples.length} frames over ${RECESSION_MS + SAMPLE_OVERRUN_MS}ms` +
              (missing ? `   (${missing} with no element)` : ""));

  let verdict, detail;
  if (!resolution || seen.length < 10) {
    verdict = "VACUOUS";
    detail = `only ${seen.length} usable frames — nothing was measured`;
  } else {
    const tops = seen.map((s) => s.top);
    const min = Math.min(...tops);
    const max = Math.max(...tops);
    const drift = Math.round((max - min) * 100) / 100;

    // Print a sparse trace so a human can see the SHAPE, not just the verdict.
    console.log("\n  TRACE (every ~8th frame)");
    seen.filter((_, i) => i % 8 === 0 || i === seen.length - 1).forEach((s) => {
      const bar = "█".repeat(Math.max(0, Math.round(s.top - min)));
      console.log(`    t=${String(s.t).padStart(5)}ms  top ${String(s.top).padStart(8)}  ${bar}`);
    });

    console.log(`\n  top: min ${min}  max ${max}   DRIFT ${drift}px  (tolerance ${TOLERANCE_PX}px)`);

    if (drift <= TOLERANCE_PX) {
      verdict = "HOLD";
      detail = `${drift}px drift across the recession`;
    } else {
      verdict = "RIDES";
      detail = `${drift}px drift — the extras MOVED during the recession`;
    }
  }

  results.push({ ...vp, verdict, detail, resolution });

  if (verdict === "HOLD") {
    console.log(`\n  ✅ HOLD — ${detail}`);
  } else if (verdict === "RIDES") {
    console.log(`\n  ⛔ RIDES — ${detail}`);
    console.log("     The cards are travelling with the phrase. This is the");
    console.log("     passenger defect the split exists to remove.");
  } else {
    console.log(`\n  ⛔ VACUOUS — ${detail}`);
  }

  await page.close();
}

await browser.close();

console.log("\n══════════════════════════════════════════════════════════");
console.log("  EXTRAS HOLD POSITION — VERDICT");
console.log("══════════════════════════════════════════════════════════");
for (const r of results) {
  const mark = r.verdict === "HOLD" ? "✅" : "⛔";
  console.log(`  ${mark} ${r.label.padEnd(8)} ${r.width}x${r.height}   ${r.verdict}  — ${r.detail}`);
}

console.log("\n  ⚠ SCOPE — WHAT THIS RUN DID NOT WATCH:");
console.log("     · rects, NOT pixels — this would pass on a page rendering nothing");
console.log("     · says nothing about the fade, the 0.78 dimming, or any opacity");
console.log("     · says nothing about clickability, the rail's rungs, or the ladder");
console.log("     · watches ONE box; movement INSIDE it is invisible here");
console.log("     · `active-grid-fixed.mjs` samples AT REST and passed green all");
console.log("       week while the cards rose and fell — these are NOT redundant");
console.log("══════════════════════════════════════════════════════════\n");

process.exit(results.every((r) => r.verdict === "HOLD") ? 0 : 1);
