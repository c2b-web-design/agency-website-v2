// Diagnostic: does anything WebGL-related happen during the OPENING stage?
//
//   node verify/opening-trace.mjs
//
// Carl's report: the Three.js work may have reached back and affected the
// start page and Begin button. The code gates the pre-warm on
// `questionnaireStarted` (stage !== "opening"), so it should not — this
// measures whether that holds, rather than trusting the gate.
//
// Measures, during the opening only:
//   - WebGL contexts created
//   - long tasks (>50ms) and the worst frame gap
//   - frames rendered
//   - when the Begin button becomes usable
//
// Requires the dev server (npm run dev).

import { chromium } from "@playwright/test";

const BASE = process.env.VERIFY_BASE_URL ?? "http://localhost:3000";
const OPENING_WINDOW_MS = 6000;

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
});

// Instrument BEFORE any app code runs.
await page.addInitScript(() => {
  window.__trace = { contexts: [], longTasks: [], frames: [], t0: performance.now() };

  const orig = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function (type, ...rest) {
    if (String(type).includes("webgl")) {
      window.__trace.contexts.push({ type, at: Math.round(performance.now() - window.__trace.t0) });
    }
    return orig.call(this, type, ...rest);
  };

  try {
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) {
        window.__trace.longTasks.push({
          at: Math.round(e.startTime - window.__trace.t0),
          dur: Math.round(e.duration),
        });
      }
    }).observe({ entryTypes: ["longtask"] });
  } catch {}

  const tick = () => {
    window.__trace.frames.push(Math.round(performance.now() - window.__trace.t0));
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
});

const res = await page.goto(`${BASE}/start`, { waitUntil: "domcontentloaded" });
if (!res || !res.ok()) {
  console.error(`FAILED: ${res?.status() ?? "no response"} — is the dev server running?`);
  await browser.close();
  process.exit(1);
}

await page.waitForTimeout(OPENING_WINDOW_MS);

const trace = await page.evaluate(() => {
  const t = window.__trace;
  const gaps = [];
  for (let i = 1; i < t.frames.length; i++) gaps.push(t.frames[i] - t.frames[i - 1]);
  const begin = document.querySelector('[data-begin], button');
  return {
    contexts: t.contexts,
    longTasks: t.longTasks,
    frameCount: t.frames.length,
    worstGap: gaps.length ? Math.max(...gaps) : 0,
    canvasCount: document.querySelectorAll("canvas").length,
    beginTabIndex: begin ? begin.getAttribute("tabindex") : "no button found",
    beginDisabled: begin ? begin.getAttribute("aria-disabled") : null,
    beginText: begin ? begin.textContent.trim().slice(0, 30) : null,
  };
});

console.log(`\nOPENING STAGE — first ${OPENING_WINDOW_MS}ms of /start\n`);
console.log(`WebGL contexts created : ${trace.contexts.length}`);
if (trace.contexts.length) {
  trace.contexts.forEach((c) => console.log(`    ⚠ ${c.type} at +${c.at}ms`));
  console.log("    ^ pre-warm reached the opening — the gate did NOT hold");
} else {
  console.log("    none — the questionnaireStarted gate held");
}
console.log(`<canvas> elements in DOM: ${trace.canvasCount}`);
console.log(`\nFrames rendered        : ${trace.frameCount} (~${Math.round(OPENING_WINDOW_MS / 16.7)} expected)`);
console.log(`Worst frame gap        : ${trace.worstGap}ms`);
console.log(`Long tasks (>50ms)     : ${trace.longTasks.length}`);
trace.longTasks.forEach((t) => console.log(`    ${t.dur}ms at +${t.at}ms`));
console.log(`\nBegin button           : "${trace.beginText}"`);
console.log(`    tabindex=${trace.beginTabIndex}  aria-disabled=${trace.beginDisabled}`);
console.log(`    (tabindex 0 and no aria-disabled = usable)\n`);

await browser.close();
