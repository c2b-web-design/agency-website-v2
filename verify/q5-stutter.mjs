// Diagnostic: does the WebGL pre-warm land on the Q5 phrase reveal?
//
//   node verify/q5-stutter.mjs [runs]      (default 3 runs)
//
// THE SYMPTOM. Carl reports a stutter as the first question's text appears.
// Originally the "Wh" of "What" — the start of the phrase. After the 29 July
// fix it MOVED to the "h" of "here", roughly mid-phrase, which is how the
// incomplete fix was caught. Confirmed real and INTERMITTENT: it favours the
// first load after a server start, then runs clean.
//
// ⚠ A MOVED SYMPTOM IS NOT A FIXED SYMPTOM, AND IT IS THE MOST USEFUL SIGNAL
// HERE. Where the stutter lands tells you where the work landed. If it moves
// again rather than disappearing, the boundary is still wrong — do not read a
// change of position as progress toward a fix.
//
// THE HYPOTHESIS BEING TESTED — and it is only a hypothesis. Pressing Begin
// sets stage="active", which does two things at the same instant:
//   1. `.enquiry-q5-block` starts a 700ms opacity animation (globals.css)
//   2. the pre-warm's `requestIdleCallback(warmWhenSafe, {timeout: 2000})`
//      becomes eligible (enquiry-opening.tsx) — `questionnaireStarted` flips
//
// requestIdleCallback fires only when the main thread is genuinely free, which
// is the right primitive. But the 2000ms deadline is a guarantee of PROGRESS:
// if no idle gap arrives, the browser runs it ANYWAY. On a cold first load —
// nothing cached, Turbopack compiling, shaders not in the driver cache — the
// thread is never free, so the deadline fires and shader compilation lands
// inside the 700ms Q5 reveal.
//
// Warm loads hit cached shaders and a quiet thread, so the same callback is
// cheap and finds a real gap. That fits "first load only" exactly.
//
// ⚠ THIS SCRIPT DOES NOT ASSUME THAT IS TRUE. This project has already been
// burned by a plausible cause on this very page: Three.js was blamed for the
// opening delay and measured innocent — 0 WebGL contexts during the opening.
// The output below reports the overlap as a measured fact or reports its
// absence. A clean result means the hypothesis is WRONG, not that the stutter
// is fixed.
//
// ══════════════════════════════════════════════════════════════════════════
// ⚠ CORRECTED 9 AUGUST 2026 — AND EVERY VERDICT THIS FILE PRODUCED BEFORE
// THAT DATE WAS MEASURED ON A SOFTWARE RASTERISER.
// ══════════════════════════════════════════════════════════════════════════
//
// TWO INDEPENDENT DEFECTS, both found when Carl saw the stutter return on
// 9 August against a file that had certified it fixed on 30 July.
//
// 1. IT LAUNCHED HEADLESS — bare `chromium.launch()`, while fourteen other
//    harnesses in this directory launch headed with `--enable-gpu` and print
//    the renderer. Headless Chromium silently substitutes SwiftShader, which
//    compiles all 120 shaders on the CPU. Measured here: a ~2000ms frame gap
//    at ~+210ms, IDENTICAL on cold and warm runs. That is the rasteriser, not
//    the defect. ⚠ SO THE 30 JULY "0/3 CLEAN, worst gap 18-36ms" THAT CLOSED
//    THE FIX NEVER TOUCHED A GPU. It is not evidence and must not be cited.
//
// 2. THE OVERLAP ASSERTION FIRED ON A CONTEXT THAT ALREADY EXISTED. The test
//    was `firstCtx.at <= Q5_REVEAL_MS`, and `at` is clamped at t=0 (set just
//    before the Begin click). A context created BEFORE the click therefore
//    reports +0ms and trips the flag. All three runs on 9 August printed
//    "OVERLAP" while shader time inside the reveal was 0.5 / 0.2 / 0.0ms —
//    the flag said guilty while the quantity it exists to detect was zero.
//    Now only work created AT OR AFTER t=0 counts, and the verdict is driven
//    by measured milliseconds rather than by a context's existence.
//
// ⚠ THIS IS THE FOURTH RECORDED INSTANCE OF THIS CLASS IN THIS PROJECT —
// after `q5-stutter.mjs`'s own 700ms window, `cross-section.mjs`'s duplicated
// BEVEL_WIDTH, and `opening-arm.mjs` only ever running at 1440px. The first
// three were harnesses holding a stale COPY of a value. This one is different
// and worth naming separately: THE ENVIRONMENT WAS WRONG, AND THE ASSERTION
// WAS WRONG IN THE SAFE-LOOKING DIRECTION. A harness that cannot see the GPU
// cannot see a GPU defect, and a false POSITIVE is not harmless — it sends
// the next session hunting a suspect the numbers had already cleared.
//
// WHAT IT MEASURES, with t=0 at the Begin click:
//   - when WebGL contexts are created
//   - when shader compilation happens, and how long it takes
//   - long tasks (>50ms) and the worst frame gap during the Q5 reveal
//   - whether any of that OVERLAPS the 0-700ms phrase window
//
// Requires the dev server. For a genuine cold reading, restart it first:
// the whole point is the first load after a server start.

import { chromium } from "@playwright/test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const BASE = process.env.VERIFY_BASE_URL ?? "http://localhost:3000";
const RUNS = Number(process.argv[2] ?? 3);

// ⚠ ONE PROFILE FOR THE WHOLE SESSION, so run 1 is COLD and later runs are
// WARM — the cold/warm difference IS the finding, because this fault favours
// the first load after a server start. The previous version opened a fresh
// context per run with the HTTP cache disabled, which resets the browser cache
// but NOT the GPU shader cache; on SwiftShader there was no GPU cache to reset
// and every run looked identical. Same pattern as `card-1-anchor.mjs`.
//
// ⚠ FOR A TRUE COLD RUN 1 THE DEV SERVER MUST ALSO BE FRESHLY STARTED.
// Turbopack compiles `/start` on first request; if you have already loaded the
// page, run 1 is not cold no matter what this script does.
const profile = mkdtempSync(join(tmpdir(), "q5-stutter-"));

// The PHRASE wipe — globals.css `.enquiry-q-text-reveal`, 1300ms.
//
// ⚠ CORRECTED 30 July 2026, from 700 to 1300, and this correction is the whole
// lesson of the second failure. Two animations start on Begin:
//
//   .enquiry-q5-block       700ms   opacity fade of the whole block
//   .enquiry-q-text-reveal  1300ms  horizontal mask that wipes the PHRASE in
//
// This script measured 700ms and reported 0/3 CLEAN while Carl could still see
// the stutter — moved from the "Wh" of "What" to the "h" of "here", which is
// mid-phrase, just past 54% of the wipe. The work had been pushed out of the
// 700ms window and into the 600ms tail that nothing was watching.
//
// The harness used the same constant as the fix, so it confirmed the fix instead
// of testing it. A verification that shares an assumption with the thing it
// checks cannot fail the way it needs to.
const Q5_REVEAL_MS = 1300;
// Watch well past the reveal to catch the 2000ms idle deadline either way.
const WATCH_MS = 3400;

const results = [];

for (let run = 1; run <= RUNS; run++) {
  // ⚠ HEADED, --enable-gpu, RENDERER PRINTED AND CHECKED. See the correction
  // note at the top of this file: this launched headless until 9 August 2026,
  // so every earlier verdict came from SwiftShader.
  const context = await chromium.launchPersistentContext(profile, {
    headless: false,
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    args: ["--enable-gpu", "--use-gl=angle", "--ignore-gpu-blocklist"],
  });
  const page = await context.newPage();

  // Instrument BEFORE any app code runs.
  await page.addInitScript(() => {
    window.__q5 = { contexts: [], shaders: [], longTasks: [], frames: [], t0: null };

    const mark = () => (window.__q5.t0 === null ? null : performance.now() - window.__q5.t0);

    const origGetContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...rest) {
      const ctx = origGetContext.call(this, type, ...rest);
      if (String(type).includes("webgl")) {
        window.__q5.contexts.push({ type: String(type), at: mark() });

        // Shader compilation is the expensive part and the specific thing the
        // hypothesis blames. Time compileShader/linkProgram directly rather
        // than inferring cost from long tasks.
        if (ctx && !ctx.__q5patched) {
          ctx.__q5patched = true;
          for (const fn of ["compileShader", "linkProgram"]) {
            const orig = ctx[fn];
            if (typeof orig !== "function") continue;
            ctx[fn] = function (...args) {
              const s = performance.now();
              const out = orig.apply(this, args);
              const dur = performance.now() - s;
              window.__q5.shaders.push({ fn, at: mark(), dur: Math.round(dur * 100) / 100 });
              return out;
            };
          }
        }
      }
      return ctx;
    };

    try {
      new PerformanceObserver((list) => {
        for (const e of list.getEntries()) {
          const at = mark();
          if (at !== null) window.__q5.longTasks.push({ at: Math.round(at), dur: Math.round(e.duration) });
        }
      }).observe({ entryTypes: ["longtask"] });
    } catch {}

    const tick = () => {
      const at = mark();
      if (at !== null) window.__q5.frames.push(at);
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });

  const res = await page.goto(`${BASE}/start`, { waitUntil: "domcontentloaded" });
  if (!res || !res.ok()) {
    console.error(`FAILED: ${res?.status() ?? "no response"} — is the dev server running? (npm run dev)`);
    await context.close();
    rmSync(profile, { recursive: true, force: true });
    process.exit(1);
  }

  // ⚠ ABORT ON A SOFTWARE RASTERISER RATHER THAN REPORT ITS NUMBERS. This is
  // the guard whose absence made every pre-9-August verdict worthless. A
  // wrong number is worse than no number, because it gets written down.
  const renderer = await page.evaluate(() => {
    const c = document.createElement("canvas");
    const gl = c.getContext("webgl2") || c.getContext("webgl");
    if (!gl) return "no webgl";
    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    return ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : "unknown";
  });
  if (/swiftshader|llvmpipe|software|no webgl/i.test(renderer)) {
    console.error(`\n⚠ ABORTING — renderer is "${renderer}": a software rasteriser, not the GPU.`);
    console.error(`  Numbers from it describe a CPU shader compiler and say nothing about the defect.`);
    await context.close();
    rmSync(profile, { recursive: true, force: true });
    process.exit(1);
  }
  if (run === 1) console.log(`\nRenderer: ${renderer}`);

  // Begin only becomes usable when the reveal's animationstart fires. Wait for
  // it to be genuinely clickable rather than racing the opening choreography.
  const begin = page.getByRole("button", { name: /begin/i });
  await begin.waitFor({ state: "visible", timeout: 20000 });
  await page.waitForFunction(
    () => {
      const b = [...document.querySelectorAll("button")].find((el) => /begin/i.test(el.textContent ?? ""));
      return b && !b.disabled && getComputedStyle(b).pointerEvents !== "none";
    },
    { timeout: 20000 },
  );

  // t=0 is set immediately before the click, so every number below is relative
  // to the moment the Q5 reveal starts.
  await page.evaluate(() => { window.__q5.t0 = performance.now(); });
  await begin.click();
  await page.waitForTimeout(WATCH_MS);

  const data = await page.evaluate((revealMs) => {
    const t = window.__q5;
    const gaps = [];
    for (let i = 1; i < t.frames.length; i++) {
      gaps.push({ at: Math.round(t.frames[i - 1]), gap: Math.round(t.frames[i] - t.frames[i - 1]) });
    }
    // ⚠ STRICTLY INSIDE THE WINDOW. `at` is `performance.now() - t0`, and t0 is
    // set just before the Begin click — so anything that happened BEFORE the
    // click is negative or zero. The old test was `x.at >= 0`, which admitted
    // work that predated the reveal entirely. `> 0` is the honest boundary.
    const inReveal = (x) => x.at > 0 && x.at <= revealMs;
    const duringReveal = gaps.filter((g) => g.at >= 0 && g.at <= revealMs);
    return {
      contexts: t.contexts.map((c) => ({ ...c, at: Math.round(c.at) })),
      shaders: t.shaders.map((s) => ({ ...s, at: Math.round(s.at) })),
      longTasks: t.longTasks,
      // Contexts created before Begin are NOT evidence of overlap. Counted
      // separately so the report can show both without conflating them.
      contextsBeforeReveal: t.contexts.filter((c) => c.at <= 0).length,
      contextsInReveal: t.contexts.filter(inReveal).map((c) => Math.round(c.at)),
      shaderMsInReveal: t.shaders.filter(inReveal).reduce((a, s) => a + s.dur, 0),
      longTaskMsInReveal: t.longTasks.filter(inReveal).reduce((a, l) => a + l.dur, 0),
      worstGapInReveal: duringReveal.reduce((m, g) => (g.gap > m.gap ? g : m), { at: 0, gap: 0 }),
      framesInReveal: duringReveal.length,
    };
  }, Q5_REVEAL_MS);

  results.push(data);
  await context.close();

  const firstCtx = data.contexts[0];
  // ⚠ MEASURED WORK, NOT MERE EXISTENCE. A context that already existed cannot
  // stutter a reveal it predates; only work landing inside the window can.
  const overlap = data.shaderMsInReveal > 0 || data.contextsInReveal.length > 0;

  console.log(`\n─── RUN ${run} of ${RUNS} ${"─".repeat(40)}`);
  console.log(`  First WebGL context        ${firstCtx ? `+${firstCtx.at}ms` : "never (within window)"}` +
    (data.contextsBeforeReveal ? `  (${data.contextsBeforeReveal} existed BEFORE Begin — not overlap)` : ""));
  console.log(`  Contexts INSIDE reveal     ${data.contextsInReveal.length}` +
    (data.contextsInReveal.length ? ` (at ${data.contextsInReveal.map((a) => `+${a}ms`).join(", ")})` : ""));
  console.log(`  Shader calls total         ${data.shaders.length}` +
    (data.shaders.length ? ` (first +${data.shaders[0].at}ms)` : ""));
  console.log(`  Shader ms INSIDE reveal    ${data.shaderMsInReveal.toFixed(1)}ms`);
  console.log(`  Long-task ms INSIDE reveal ${data.longTaskMsInReveal}ms`);
  console.log(`  Worst frame gap in reveal  ${data.worstGapInReveal.gap}ms (at +${data.worstGapInReveal.at}ms)`);
  console.log(`  Frames during reveal       ${data.framesInReveal}  (~78 = smooth 60fps over ${Q5_REVEAL_MS}ms)`);
  console.log(`  → ${overlap ? "OVERLAP: WebGL work landed inside the Q5 reveal" : "clean: no WebGL work inside the Q5 reveal"}`);
}

rmSync(profile, { recursive: true, force: true });

// ── Verdict across runs ────────────────────────────────────────────────────
const overlapped = results.filter(
  (r) => r.shaderMsInReveal > 0 || r.contextsInReveal.length > 0,
);
const worstGap = results.reduce((m, r) => Math.max(m, r.worstGapInReveal.gap), 0);

console.log(`\n${"═".repeat(58)}`);
console.log(`VERDICT — ${RUNS} run(s), Q5 reveal window 0–${Q5_REVEAL_MS}ms`);
console.log(`${"═".repeat(58)}`);
console.log(`  Runs with WebGL work inside the reveal: ${overlapped.length}/${RUNS}`);
console.log(`  Worst frame gap inside any reveal:      ${worstGap}ms`);

// ⚠ RUN 1 IS THE COLD ONE AND IT IS REPORTED SEPARATELY. This fault favours the
// first load after a server start, so averaging it into the warm runs hides it.
const cold = results[0];
console.log(`  Run 1 (COLD) worst frame gap:           ${cold.worstGapInReveal.gap}ms` +
  ` (at +${cold.worstGapInReveal.at}ms)`);
if (results.length > 1) {
  const warmWorst = results.slice(1).reduce((m, r) => Math.max(m, r.worstGapInReveal.gap), 0);
  console.log(`  Warm runs worst frame gap:              ${warmWorst}ms`);
}

if (overlapped.length > 0) {
  console.log(`
  → The hypothesis HOLDS for ${overlapped.length} of ${RUNS} run(s): the pre-warm
    is doing WebGL work while the Q5 phrase is animating.`);
} else {
  console.log(`
  → The hypothesis DOES NOT HOLD in these runs. No WebGL work landed inside
    the Q5 reveal. The pre-warm is not the cause of what was seen here.
    Do NOT record the stutter as fixed — an unreproduced fault is not a
    solved one, and this fault is known to be intermittent.`);
}

// ⚠ THE FRAME GAP IS A VERDICT IN ITS OWN RIGHT, NOT A FOOTNOTE. What Carl sees
// is a dropped frame; WebGL is only ever one candidate CAUSE of one. A version
// of this file that printed "clean" for WebGL while sitting on a 200ms gap
// would repeat the exact error being corrected here.
if (worstGap > 50) {
  console.log(`
  ⚠ A STUTTER IS PRESENT IN THE MEASUREMENT: worst frame gap ${worstGap}ms,
    well over the ~50ms that is visible to the eye.${overlapped.length === 0 ? `
    WebGL is RULED OUT as its cause — the suspect is cleared, the defect is
    NOT. Profile the main thread next; do not stop here.` : ""}`);
} else {
  console.log(`
  → No visible-scale frame gap in these runs (worst ${worstGap}ms, under ~50ms).
    ⚠ This fault is INTERMITTENT and favours the first load after a server
    start. Not reproducing it is not the same as fixing it.`);
}

console.log(`
  ⚠ Verification is not approval. This answers "is it what I think it is".
`);
