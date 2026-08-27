/**
 * ⚠⚠ SCOPE WARNING — THIS WATCHES THE CARD HOST ONLY, AND THAT IS NOT THE WHOLE
 * PAGE. 14 August 2026.
 *
 * **This harness passed 2/2 on a build creating a NEW WebGL CONTEXT ON EVERY
 * QUESTION STEP.** Both facts are true at once and the reason is scope: it
 * asserts that `[data-testid="answer-card-host"] canvas` holds one context,
 * which it does — created once at +414ms, never lost, same element at Q1.
 *
 * ⚠ **A GPU trace of one question step found 8 contexts across a five-question
 * walk.** The per-step one belongs to `NextStepMeshButton` (`.mt-5`), which
 * lives inside the keyed phrase and is destroyed and rebuilt every question,
 * costing 67ms of BLOCKED main thread in `CommandBufferProxyImpl::Initialize`.
 * **This script never looks at it.**
 *
 * ⚠⚠ **SO A GREEN VERDICT HERE MEANS "THE CARD HOST HOLDS ONE CONTEXT". IT DOES
 * NOT MEAN "THE PAGE CREATES ONE CONTEXT".** Do not cite it for the second
 * claim — the shared-host work was measured against exactly this harness and
 * the per-step cost was untouched, because the restructure was aimed at one of
 * two canvases and nothing counted the other.
 *
 * Full trace: `live-work/structural-decision-note-question-boundary.md`.
 *
 * ─────────────────────────────────────────────────────────────────────────
 *
 * ⚠ IS THERE ONE WebGL CONTEXT SERVING ALL FIVE QUESTIONS?
 *
 * Step 4, check 1. The shared host was built so the card canvas mounts ONCE, in
 * the first commit, and survives every question step. This asserts that claim
 * against the browser rather than against the JSX.
 *
 *   node verify/one-context.mjs [runs]
 *   VERIFY_BASE_URL=http://localhost:3100 node verify/one-context.mjs 3
 *
 * ⚠ WHY NOT JUST READ THE COMPONENT TREE. The host is unkeyed and takes labels
 * as a prop, so it *looks* like it survives. It would also look like that if
 * React remounted it for an unrelated reason — a changed `key` on an ancestor,
 * a conditional wrapper, a Strict Mode double-invoke, a parent that swaps
 * element type. Every one of those destroys the GL context silently, and the
 * page carries on looking correct because the new context compiles and paints.
 * **The 12 August build was wrong in exactly this shape: correct-looking DOM,
 * wrong underlying object.**
 *
 * ══ WHAT IS COUNTED, AND WHY IT IS THE RIGHT THING ══
 *
 * THREE INDEPENDENT WITNESSES, because each alone has a way of lying:
 *
 *   1. CREATION MARK COUNT. Fires in R3F's `onCreated`, once per context
 *      creation. Five marks = five contexts.
 *
 *      ⚠⚠ THE HOST'S CANVAS MARKS ITSELF `warmup-canvas-created`, NOT
 *      `card-canvas-created` — measured 14 August, and it is NOT a harness bug.
 *      The name is chosen by `warm && !active` (`answer-card-canvas.tsx:4091`),
 *      and the host passes `active={activeCardsVisible}`, which is FALSE during
 *      the opening. So at creation time the host's canvas looks like a warm-up
 *      to the marking code. **On the host build there is no `card-canvas-created`
 *      mark at all, and there are TWO `warmup-canvas-created` marks** — the
 *      host's and the real warm-up's.
 *
 *      **The first version of this script counted `card-canvas-created` and
 *      therefore read 0 on a page with a live context.** It would have reported
 *      "not one context" for a reason that has nothing to do with context
 *      lifetime. Both names are now counted, and the DOM witness below is what
 *      actually decides.
 *
 *   2. ⚠⚠ `webglcontextlost` EVENTS — THE DECISIVE ONE. When React unmounts a
 *      canvas the browser tears the context down, and a torn-down context is
 *      not a bookkeeping detail: it is the actual cost this whole restructure
 *      exists to avoid. Captured at the capture phase on the window so no
 *      per-canvas listener has to be attached in time.
 *
 *   3. CANVAS ELEMENT IDENTITY. The same DOM node, tagged on first sight, still
 *      carrying its tag at Q1. A remount produces a fresh element and the tag
 *      is gone — which catches a remount even if it happened to leave the mark
 *      count and the context-lost count undisturbed.
 *
 * ⚠ ALL THREE MUST AGREE. If they disagree, that disagreement IS the finding:
 * report it, do not pick the one that matches the expectation.
 *
 * ══ FALSIFICATION ══ (standing rule: proven RED before trusted GREEN)
 *
 *   node verify/one-context.mjs 1 --falsify
 *
 * Forces a remount between questions by removing the host's canvas from the
 * DOM and letting React rebuild it. A working harness must report ⛔ here. This
 * mode changes the PAGE, never the MEASUREMENT — the counters are identical in
 * both modes, so a green falsify run means the instrument is blind, not that
 * the page is good.
 */

import { chromium } from "@playwright/test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const BASE = process.env.VERIFY_BASE_URL ?? "http://localhost:3100";
const RUNS = Number(process.argv[2] ?? 3);
const FALSIFY = process.argv.includes("--falsify");

// ⚠⚠ NOT ON THE DEV SERVER. Fourteen harnesses in this folder carry this guard
// and it is load-bearing here too: dev builds recompile, re-mount under Strict
// Mode double-invoke, and hot-reload — every one of which creates a SECOND
// context for reasons that have nothing to do with the shared host. A red
// verdict from :3000 would be unattributable, and a green one would be luck.
if (/:3000(\/|$)/.test(BASE)) {
  console.error("\n⚠⚠ REFUSING TO RUN AGAINST :3000. Context lifetime is not measurable on a dev build.\n");
  process.exit(1);
}

const profile = mkdtempSync(join(tmpdir(), "one-context-"));
const runs = [];

for (let run = 1; run <= RUNS; run++) {
  const context = await chromium.launchPersistentContext(profile, {
    headless: false,
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    args: ["--enable-gpu", "--use-gl=angle", "--ignore-gpu-blocklist"],
  });

  try {
    const page = await context.newPage();

    // Counters installed BEFORE any script runs, so a context created during
    // the very first commit is still seen. A listener attached after load
    // would miss precisely the mount this restructure is about.
    await page.addInitScript(() => {
      window.__oc = { lost: 0, restored: 0, lostAt: [] };

      /**
       * ⚠⚠ `webglcontextlost` DOES NOT BUBBLE. A `window.addEventListener(...,
       * true)` capture listener does NOT reliably see it — measured: a real
       * `loseContext()` call left this counter at 0 while the other two
       * witnesses correctly fired. **The witness was in the script, printed a
       * reassuring `✅ never torn down`, and could not have reported a
       * teardown.**
       *
       * The listener must be attached to each canvas ELEMENT. `HTMLCanvas
       * Element.prototype.getContext` is patched so every canvas gets one at
       * the moment it first asks for a context — before any context can be
       * lost, and without needing to find canvases that do not exist yet.
       *
       * ⚠⚠ AND IT MUST BE SCOPED TO THE HOST'S CANVAS ONLY — 14 August.
       * Counting losses on EVERY canvas reported `lost=5` on a build where the
       * host's context was never lost at all: the events belonged to the
       * SEPARATE WARM-UP canvas, which is legitimately recreated. Checked
       * independently with a plain per-element listener and no prototype patch:
       * `sameEl: true, isContextLost(): false, 1 event, on a non-host canvas`.
       * **The witness was measuring a real thing and attributing it to the
       * wrong object** — which is how a healthy host gets reported as broken.
       */
      const patch = (cv) => {
        if (!cv || cv.__ocWatched) return;
        cv.__ocWatched = true;
        cv.addEventListener("webglcontextlost", () => {
          // Only the host's canvas answers this script's question. Others are
          // counted separately so they are visible, never conflated.
          if (cv.closest && cv.closest('[data-testid="answer-card-host"]')) {
            window.__oc.lost += 1;
            window.__oc.lostAt.push(Math.round(performance.now()));
          } else {
            window.__oc.otherLost = (window.__oc.otherLost || 0) + 1;
          }
        });
        cv.addEventListener("webglcontextrestored", () => { window.__oc.restored += 1; });
      };

      const orig = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (...args) {
        if (/webgl/i.test(String(args[0]))) patch(this);
        return orig.apply(this, args);
      };
    });

    const res = await page.goto(`${BASE}/start`, { waitUntil: "domcontentloaded" });
    if (!res || !res.ok()) {
      console.error(`FAILED: ${res?.status() ?? "no response"} — is the server at ${BASE} running?`);
      process.exit(1);
    }

    // ⚠ A SOFTWARE RASTERISER INVALIDATES EVERY GPU CONCLUSION HERE. Same guard
    // as `opening-arm.mjs`; a run on SwiftShader is not evidence about a real
    // context's lifetime.
    const renderer = await page.evaluate(() => {
      const c = document.createElement("canvas");
      const gl = c.getContext("webgl2") || c.getContext("webgl");
      if (!gl) return "no webgl";
      const ext = gl.getExtension("WEBGL_debug_renderer_info");
      return ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : "unknown";
    });
    if (/swiftshader|llvmpipe|software/i.test(renderer)) {
      console.error(`\n⚠ ABORTING — renderer is "${renderer}": a software rasteriser.`);
      process.exit(1);
    }

    await page.getByRole("button", { name: /begin/i }).click();
    await page.locator(".enquiry-answer-grid").waitFor({ state: "visible", timeout: 30000 });
    await page.waitForTimeout(6200);

    // Tag the canvas inside the host on first sight. Identity check witness 3.
    const tagged = await page.evaluate(() => {
      const cv = document.querySelector('[data-testid="answer-card-host"] canvas');
      if (!cv) return false;
      cv.__ocTag = "tagged-at-Q5";
      return true;
    });
    if (!tagged) {
      console.error("⚠ NO CANVAS INSIDE THE HOST at Q5 — cannot measure. Aborting.");
      process.exit(1);
    }

    const perStep = [];

    // Walk Q5 → Q1: answer, advance, then read all three witnesses.
    for (let s = 0; s < 4; s++) {
      // ⚠ `dispatchEvent`, NOT `.click()`, AND THE REASON MATTERS.
      //
      // `dispatchEvent` bypasses the browser's hit-test, so it drives the walk
      // even on a build where the cards are covered. That is normally a FAULT
      // in a harness — it is exactly why no instrument here caught the
      // 14 August unclickability defect — but this script measures CONTEXT
      // LIFETIME, not reachability, and it must be able to walk a build whose
      // pointer path is broken in order to answer its own question.
      //
      // ⚠⚠ CLICKABILITY IS `verify/card-interaction.mjs`'s JOB, and it uses a
      // real `.click()` precisely so it cannot be fooled this way. Do not
      // "improve" this line into a real click: it would couple the two
      // questions and this script would stop working the moment the other one
      // legitimately fails.
      await page.getByTestId("answer-card-hover-0").dispatchEvent("pointerdown");
      await page.waitForTimeout(700);

      if (FALSIFY) {
        /**
         * ⚠ FALSIFICATION ONLY — force the failure this harness must catch.
         *
         * ⚠⚠ THE FIRST VERSION OF THIS ONLY REMOVED THE ELEMENT, and that was
         * a WEAK forcing function: React did not rebuild the canvas, so no new
         * context was created and no context was lost. **Two of the three
         * witnesses stayed green and only the DOM-identity one fired** — the
         * harness reported ⛔ for one reason while being untested on the other
         * two. A falsification that exercises one witness does not validate
         * the others.
         *
         * This now forces BOTH failure modes the real thing would produce:
         *   - `loseContext()` → a genuine `webglcontextlost` event, which is
         *     what an unmount actually costs; and
         *   - a NEW canvas with a fresh context → the creation count grows,
         *     which is what a per-question remount looks like.
         */
        await page.evaluate(() => {
          const host = document.querySelector('[data-testid="answer-card-host"]');
          const cv = host?.querySelector("canvas");
          if (cv) {
            const gl = cv.getContext("webgl2") || cv.getContext("webgl");
            // A real teardown, not a simulated one.
            gl?.getExtension("WEBGL_lose_context")?.loseContext();
            cv.remove();
          }
          // Stand a fresh context in its place and mark it, exactly as a
          // remounted canvas would.
          if (host) {
            const fresh = document.createElement("canvas");
            fresh.width = 575;
            fresh.height = 103;
            // Acquire a real context so the count genuinely grows.
            const ctx = fresh.getContext("webgl2") || fresh.getContext("webgl");
            if (!ctx) throw new Error("falsification could not acquire a context");
            host.appendChild(fresh);
            try { performance.mark("card-canvas-created"); } catch {}
          }
        });
      }

      await page.getByRole("button", { name: /next step/i }).click();
      await page.waitForTimeout(2600);

      const snap = await page.evaluate(() => {
        const cv = document.querySelector('[data-testid="answer-card-host"] canvas');
        const cue = (document.querySelector(".enquiry-pdepth-0 .enquiry-phrase-cue")?.textContent || "").trim();
        // ⚠ BOTH NAMES — the host's canvas marks itself as a warm-up. See the
        // header. Counting one name only reads 0 on a live context.
        const created =
          performance.getEntriesByName("card-canvas-created", "mark").length +
          performance.getEntriesByName("warmup-canvas-created", "mark").length;
        return {
          q: cue,
          created,
          compiled:
            performance.getEntriesByName("card-canvas-compiled", "mark").length +
            performance.getEntriesByName("warmup-canvas-compiled", "mark").length,
          lost: window.__oc.lost,
          canvasPresent: !!cv,
          sameCanvas: !!cv && cv.__ocTag === "tagged-at-Q5",
        };
      });
      perStep.push({ step: s + 1, ...snap });
    }

    const final = await page.evaluate(() => {
      const names = performance
        .getEntriesByType("mark")
        .filter((e) => /canvas-created/.test(e.name))
        .map((e) => e.name);
      return {
        created:
          performance.getEntriesByName("card-canvas-created", "mark").length +
          performance.getEntriesByName("warmup-canvas-created", "mark").length,
        compiled:
          performance.getEntriesByName("card-canvas-compiled", "mark").length +
          performance.getEntriesByName("warmup-canvas-compiled", "mark").length,
        cardNamed: performance.getEntriesByName("card-canvas-created", "mark").length,
        warmupNamed: performance.getEntriesByName("warmup-canvas-created", "mark").length,
        lost: window.__oc.lost,
        lostAt: window.__oc.lostAt,
        otherLost: window.__oc.otherLost || 0,
        restored: window.__oc.restored,
        // ⚠ ASKED DIRECTLY, not inferred from events: is the host's context
        // live right now? An event-based witness can miss or misattribute; this
        // one cannot.
        hostContextLost: (() => {
          const cv = document.querySelector('[data-testid="answer-card-host"] canvas');
          if (!cv) return "no-canvas";
          const g = cv.getContext("webgl2") || cv.getContext("webgl");
          return g ? g.isContextLost() : "no-context";
        })(),
        allCreatedNames: names,
        // How many card-sized canvases exist right now? The host's plus the
        // still-present warm-up is TWO on this build; step 5 makes it one.
        liveCanvases: document.querySelectorAll("canvas").length,
        sameCanvas: (() => {
          const cv = document.querySelector('[data-testid="answer-card-host"] canvas');
          return !!cv && cv.__ocTag === "tagged-at-Q5";
        })(),
      };
    });

    // ⚠ THE INVARIANT IS "DID IT GROW", NOT "IS IT ONE". Two card-sized
    // canvases exist before Begin on this build — the host's AND the separate
    // warm-up, which step 5 deletes. A raw `created === 1` would therefore fail
    // on a perfectly healthy host. What proves ONE CONTEXT ACROSS FIVE
    // QUESTIONS is that the count does not GROW as the walk proceeds.
    const createdAtStart = perStep.length ? perStep[0].created : final.created;
    const grew = final.created - createdAtStart;

    runs.push({ run, renderer, final, perStep, grew, createdAtStart });

    console.log(`\n─── RUN ${run} of ${RUNS}${FALSIFY ? "   ⚠ FALSIFY MODE" : ""} ${"─".repeat(18)}`);
    console.log(`  Renderer   ${renderer}`);
    console.log(`  step  question                       created  lost  same canvas`);
    for (const p of perStep) {
      console.log(
        `   ${p.step}    ${(p.q || "?").slice(0, 28).padEnd(28)}  ${String(p.created).padStart(6)}  ${String(p.lost).padStart(4)}  ${p.sameCanvas ? "yes" : "⛔ NO"}`,
      );
    }
    console.log(`  creation marks: ${createdAtStart} after step 1 → ${final.created} at Q1   ${grew === 0 ? "✅ NO GROWTH — one context across the walk" : `⛔ GREW BY ${grew} — a context per question`}`);
    console.log(`  ⚠ mark names                ${final.allCreatedNames.join(", ") || "none"}`);
    console.log(`     card-named ${final.cardNamed}, warmup-named ${final.warmupNamed}   ⚠ the HOST marks itself "warmup" (see header)`);
    console.log(`  compile marks               ${final.compiled}`);
    console.log(`  HOST context lost events    ${final.lost}   ${final.lost === 0 ? "✅ never torn down" : `⛔ AT +${final.lostAt.join(", +")}ms`}`);
    console.log(`  host context live now?      ${final.hostContextLost === false ? "✅ live" : `⛔ ${final.hostContextLost}`}`);
    console.log(`  (other canvases lost        ${final.otherLost}   — the warm-up; NOT this script's question)`);
    console.log(`  same canvas element at Q1   ${final.sameCanvas ? "✅ yes" : "⛔ NO — it was replaced"}`);
    console.log(`  live canvases on the page   ${final.liveCanvases}   (host + warm-up + contact field; step 5 removes one)`);
  } finally {
    await context.close();
  }
}

try { rmSync(profile, { recursive: true, force: true }); } catch {}

console.log(`\n${"═".repeat(62)}`);
console.log(`VERDICT — ${RUNS} run(s)${FALSIFY ? "   ⚠ FALSIFY MODE: ⛔ IS THE PASS" : ""}`);
console.log(`${"═".repeat(62)}`);

// ⚠ ALL THREE WITNESSES, ANDed. A single failing witness fails the run — and
// the disagreement is printed rather than resolved in favour of the expectation.
let bad = 0;
for (const r of runs) {
  const wNoGrowth = r.grew === 0;
  const wNoLoss = r.final.lost === 0;
  const wSame = r.final.sameCanvas;
  const ok = wNoGrowth && wNoLoss && wSame;
  const witnesses = [
    wNoGrowth ? "no-growth" : `grew-by-${r.grew}`,
    wNoLoss ? "lost=0" : `lost=${r.final.lost}`,
    wSame ? "same-element" : "element-replaced",
  ];
  if (!ok) bad += 1;
  console.log(`  run ${r.run}   ${ok ? "✅ ONE CONTEXT" : "⛔ NOT ONE CONTEXT"}   [${witnesses.join("  ")}]`);

  if (!(wNoGrowth === wNoLoss && wNoLoss === wSame)) {
    console.log(`         ⚠⚠ THE WITNESSES DISAGREE. That is the finding — investigate it,`);
    console.log(`            do not accept whichever one matches the expectation.`);
  }
}

console.log(`\n  ${RUNS - bad}/${RUNS} runs: the CARD HOST held one context across all five questions.`);

/**
 * ⚠⚠ THE SCOPE CAVEAT IS PRINTED WITH THE VERDICT, NOT ONLY IN THE HEADER.
 *
 * This harness printed "✅ ONE CONTEXT — 2/2 runs" on a build creating a new
 * WebGL context on EVERY question step. Every word was true of the card host
 * and false of the page, and nothing in the output said which was meant.
 *
 * A caveat in a header is read once, by whoever opens the file. The verdict is
 * read every run, by whoever is deciding something. **The limit has to appear
 * next to the number it qualifies.**
 *
 * ⚠⚠ THE STOP MARKER BELOW IS DELIBERATELY MID-LINE, AND MUST STAY THERE.
 * ⛔ DO NOT MOVE IT TO THE START OF THE LINE — it will re-break the runner.
 *
 * `verify/run.mjs` classifies ANY line that STARTS with the stop marker as a
 * FAILURE, even when the script exits 0 (`FAIL_MARK`, and `classify()` checks
 * the printed text after the exit code). This caveat prints on EVERY run,
 * including clean ones, so with the marker leading the line the runner reported
 * "⛔ FAILURE — passed through unchanged" on 3/3 ✅ runs. Diagnosed 27 August
 * 2026; the harness and the product were both fine.
 *
 * ⚠ THE IRONY IS THE POINT: `context-rules.md` requires every harness to
 * declare what it does NOT watch, in its output. Doing that in the clearest way
 * available was what tripped the failure detector. The marker at line start is
 * reserved for REAL failures — see the `if (bad > 0)` branch below, which keeps
 * it leading BECAUSE that branch also exits 1.
 */
console.log(`
  ⚠ WHAT THIS DOES NOT WATCH — read before citing the verdict above.
    This counts contexts on ONE canvas: [data-testid="answer-card-host"].
    It says NOTHING about any other canvas on the page — the warm-up, the
    contact field, or NextStepMeshButton, which lives inside the keyed phrase
    and creates a FRESH CONTEXT ON EVERY QUESTION STEP (67ms of blocked main
    thread, traced 14 August 2026). A five-question walk created EIGHT contexts
    while this harness reported 2/2.
    NOT A PAGE-WIDE COUNT ⛔ AND MUST NOT BE CITED AS ONE.`);

if (FALSIFY) {
  console.log(`
  ⚠ FALSIFY MODE. A remount was FORCED between questions, so ⛔ is the correct
    result. If the runs above came back ✅, THIS HARNESS IS BLIND and its green
    verdicts on the real build mean nothing.`);
  process.exit(bad === RUNS ? 0 : 1);
}

if (bad > 0) {
  console.log(`
  ⛔ The context is being recreated. The shared host is not doing the thing it
    was built to do, and every per-question compile cost is still being paid.`);
  process.exit(1);
}

/* ⚠⚠ THE ✅ ON THE NEXT LINE MUST LEAD THE LINE, AND IT IS LOAD-BEARING.
 *
 * `verify/run.mjs`'s `PASS_MARK` only matches ✅ / PASS / CLEAN / GREEN at the
 * START of a line (after whitespace). Every ✅ this script printed before
 * 27 August 2026 was MID-LINE — "run 1   ✅ ONE CONTEXT" — so none of them was
 * ever detected as a pass.
 *
 * ⛔ THIS HARNESS THEREFORE HAD NO PASS SIGNAL AT ALL. The only thing the runner
 * ever matched was the ⛔ opening the scope caveat above, which is why a clean
 * 3/3 run was reported as "⛔ FAILURE". Moving that marker mid-line removed the
 * false failure and exposed what was underneath: "NO VERDICT DETECTED", exit 3.
 *
 * ⚠ THE FAILURE AND THE MISSING PASS WERE TWO SEPARATE DEFECTS WEARING ONE
 * SYMPTOM. Fixing only the first moved it rather than resolving it. */
console.log(`
✅ VERDICT — one context, created once, never lost, same element at Q1.
    The CARD HOST holds across the walk. Scope caveat above still applies:
    this is not a page-wide count.

  ⚠ Verification is not approval. Carl's eye decides.
`);
