// Diagnostic: does the WebGL pre-warm land on the Q5 phrase reveal?
//
//   node verify/q5-stutter.mjs [runs]      (default 3 runs)
//
// THE SYMPTOM. Carl reports a stutter as the first question's text appears —
// the "W" and "h" of the Q5 phrase arriving raggedly. Confirmed real and
// INTERMITTENT: it favours the first load after a server start, then runs
// clean. A fresh, healthy server still produced it once.
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
// WHAT IT MEASURES, with t=0 at the Begin click:
//   - when WebGL contexts are created
//   - when shader compilation happens, and how long it takes
//   - long tasks (>50ms) and the worst frame gap during the Q5 reveal
//   - whether any of that OVERLAPS the 0-700ms phrase window
//
// Requires the dev server. For a genuine cold reading, restart it first:
// the whole point is the first load after a server start.

import { chromium } from "@playwright/test";

const BASE = process.env.VERIFY_BASE_URL ?? "http://localhost:3000";
const RUNS = Number(process.argv[2] ?? 3);

// The Q5 block's opacity animation — globals.css `.enquiry-q5-block`.
const Q5_REVEAL_MS = 700;
// Watch past the reveal to catch the 2000ms idle deadline either way.
const WATCH_MS = 2600;

const browser = await chromium.launch();
const results = [];

for (let run = 1; run <= RUNS; run++) {
  // A FRESH CONTEXT PER RUN, with the HTTP cache disabled. Without this,
  // run 2 reuses run 1's warm caches and the cold path — the one that
  // stutters — is never exercised again.
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });

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
    await browser.close();
    process.exit(1);
  }

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
    const inReveal = (x) => x.at >= 0 && x.at <= revealMs;
    const duringReveal = gaps.filter(inReveal);
    return {
      contexts: t.contexts.map((c) => ({ ...c, at: Math.round(c.at) })),
      shaders: t.shaders.map((s) => ({ ...s, at: Math.round(s.at) })),
      longTasks: t.longTasks,
      shaderMsInReveal: t.shaders.filter(inReveal).reduce((a, s) => a + s.dur, 0),
      longTaskMsInReveal: t.longTasks.filter(inReveal).reduce((a, l) => a + l.dur, 0),
      worstGapInReveal: duringReveal.reduce((m, g) => (g.gap > m.gap ? g : m), { at: 0, gap: 0 }),
      framesInReveal: duringReveal.length,
    };
  }, Q5_REVEAL_MS);

  results.push(data);
  await context.close();

  const firstCtx = data.contexts[0];
  const overlap = data.shaderMsInReveal > 0 || (firstCtx && firstCtx.at <= Q5_REVEAL_MS);

  console.log(`\n─── RUN ${run} of ${RUNS} ${"─".repeat(40)}`);
  console.log(`  WebGL context created at   ${firstCtx ? `+${firstCtx.at}ms` : "never (within window)"}`);
  console.log(`  Shader calls total         ${data.shaders.length}` +
    (data.shaders.length ? ` (first +${data.shaders[0].at}ms)` : ""));
  console.log(`  Shader ms INSIDE reveal    ${data.shaderMsInReveal.toFixed(1)}ms`);
  console.log(`  Long-task ms INSIDE reveal ${data.longTaskMsInReveal}ms`);
  console.log(`  Worst frame gap in reveal  ${data.worstGapInReveal.gap}ms (at +${data.worstGapInReveal.at}ms)`);
  console.log(`  Frames during reveal       ${data.framesInReveal}  (~42 = smooth 60fps over 700ms)`);
  console.log(`  → ${overlap ? "OVERLAP: WebGL work landed inside the Q5 reveal" : "clean: no WebGL work inside the Q5 reveal"}`);
}

await browser.close();

// ── Verdict across runs ────────────────────────────────────────────────────
const overlapped = results.filter(
  (r) => r.shaderMsInReveal > 0 || (r.contexts[0] && r.contexts[0].at <= Q5_REVEAL_MS),
);
const worstGap = results.reduce((m, r) => Math.max(m, r.worstGapInReveal.gap), 0);

console.log(`\n${"═".repeat(58)}`);
console.log(`VERDICT — ${RUNS} run(s), Q5 reveal window 0–${Q5_REVEAL_MS}ms`);
console.log(`${"═".repeat(58)}`);
console.log(`  Runs with WebGL work inside the reveal: ${overlapped.length}/${RUNS}`);
console.log(`  Worst frame gap inside any reveal:      ${worstGap}ms`);

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
console.log(`
  A frame gap over ~50ms inside the reveal is visible as a stutter regardless
  of cause. If gaps are large but WebGL is absent, the cause is elsewhere and
  this script has ruled out one suspect, not found the culprit.

  ⚠ Verification is not approval. This answers "is it what I think it is".
`);
