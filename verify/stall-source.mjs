/**
 * WHAT runs during the 1.5s stall that breaks the card ladder?
 *
 * ⚠ `verify/warm-collision.mjs` established WHERE it is and what it is NOT: a
 * 1483ms long task at +12499ms, 331ms after card 4's rung, with the card canvas
 * already compiled at +10092ms and NO new canvas anywhere near it. So it is
 * neither the card canvas's setup nor the contact field's warm-up mount.
 *
 * ⚠ AND THE GUARD THAT SHOULD COVER IT IS 2874ms FROM CLEARING. The entrance
 * guard in `enquiry-opening.tsx` holds until `ENTRANCE_END_MS` (4890) after the
 * entrance's own start; measured, that is +15373ms. The stall is at +12499ms —
 * deep inside the protected window. Something is running that the guard does not
 * gate at all.
 *
 * ⚠ SO STOP INFERRING AND ATTRIBUTE IT. This wraps the suspects in
 * `performance.measure` from inside the page:
 *
 *   - `PMREMGenerator.prototype.fromScene`  — the ~572ms env map build
 *   - `WebGLRenderer.prototype.compileAsync`
 *   - `WebGLRenderer.prototype.initTexture`
 *   - React commit work, via a long-task attribution dump
 *
 * A wrapper that never fires is as informative as one that does: it removes a
 * suspect. Print every wrapper's call count even when zero.
 *
 *   node verify/stall-source.mjs
 */

import { chromium } from "@playwright/test";

const BASE = process.env.VERIFY_BASE_URL ?? "http://localhost:3000";

const browser = await chromium.launch({
  headless: false,
  args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

await page.addInitScript(() => {
  window.__calls = [];
  window.__long = [];

  new PerformanceObserver((l) => {
    for (const e of l.getEntries()) {
      if (e.duration >= 100) {
        window.__long.push({
          t: Math.round(e.startTime),
          dur: Math.round(e.duration),
          name: e.name,
          // Attribution names the container that blocked, which distinguishes
          // page script from browser-internal work.
          attr: (e.attribution ?? []).map((a) => `${a.name}:${a.containerType}`).join(","),
        });
      }
    }
  }).observe({ entryTypes: ["longtask"] });

  // ⚠ WRAPPED ON THE PROTOTYPE, BEFORE THE APP'S BUNDLE RUNS. `addInitScript`
  // executes before page scripts, but three.js is imported by the bundle — so
  // the wrap has to be installed lazily, when the constructor first appears.
  // Polling a module namespace is not possible here, so instead we patch the
  // prototypes the moment any WebGL context is created.
  const wrap = (obj, name, label) => {
    if (!obj || typeof obj[name] !== "function" || obj[name].__wrapped) return;
    const orig = obj[name];
    const patched = function (...args) {
      const s = performance.now();
      const r = orig.apply(this, args);
      const done = () => {
        const d = performance.now() - s;
        window.__calls.push({ label, t: Math.round(s), dur: Math.round(d) });
      };
      if (r && typeof r.then === "function") {
        r.then(done, done);
      } else {
        done();
      }
      return r;
    };
    patched.__wrapped = true;
    obj[name] = patched;
  };

  // three attaches nothing to window, so reach the prototypes through a created
  // context. `getContext` is the earliest reliable hook.
  const origGetContext = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function (...args) {
    const ctx = origGetContext.apply(this, args);
    // Defer one microtask so the module that created the context has finished
    // evaluating and its classes exist.
    queueMicrotask(() => {
      try {
        for (const k of Object.keys(window)) {
          const v = window[k];
          if (v && v.PMREMGenerator) {
            wrap(v.PMREMGenerator.prototype, "fromScene", "PMREM.fromScene");
            wrap(v.WebGLRenderer.prototype, "compileAsync", "compileAsync");
            wrap(v.WebGLRenderer.prototype, "initTexture", "initTexture");
          }
        }
      } catch {}
    });
    return ctx;
  };
});

await page.goto(`${BASE}/start?beattrace=1`, { waitUntil: "networkidle" });
await page.getByRole("button", { name: /begin/i }).click();
const beginAt = await page.evaluate(() => performance.now());
await page.getByTestId("answer-card-hover-0").waitFor({ timeout: 20000 });
await page.waitForTimeout(12000);

const long = await page.evaluate(() => window.__long);
const calls = await page.evaluate(() => window.__calls);
const marks = await page.evaluate(() =>
  performance.getEntriesByType("mark").map((m) => ({ name: m.name, t: Math.round(m.startTime) })),
);
await browser.close();

console.log(`\n  Begin at +${Math.round(beginAt)}ms\n`);

console.log("── card beats ──");
for (const m of marks.filter((m) => m.name.startsWith("card-beat")).sort((a, b) => a.t - b.t)) {
  console.log(`  +${String(m.t).padStart(6)}ms  ${m.name}`);
}

console.log("\n── long tasks >=100ms ──");
for (const l of long.sort((a, b) => a.t - b.t)) {
  console.log(`  +${String(l.t).padStart(6)}ms  ${String(l.dur).padStart(5)}ms  ${l.name}  [${l.attr}]`);
}

console.log("\n── instrumented calls ──");
if (!calls.length) {
  console.log("  none captured — the prototype wrap never took.");
  console.log("  ⚠ THIS DOES NOT EXONERATE THE SUSPECTS. It means the instrument");
  console.log("    failed, which is a different finding from 'they did not run'.");
} else {
  for (const c of calls.sort((a, b) => a.t - b.t)) {
    console.log(`  +${String(c.t).padStart(6)}ms  ${String(c.dur).padStart(5)}ms  ${c.label}`);
  }
}
console.log("\n  ⚠ Verification is not approval.");
