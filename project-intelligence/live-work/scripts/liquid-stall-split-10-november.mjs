// ⛔ THE LIQUID's COMPILE STALL, SPLIT — STEP 1 OF `live-work/plan-liquid-async-compile-10-november.md` v1.2 (10 November
// 2026, session 2; the BEFORE figures, no code changed). Needs the dev server. A cold load (fresh context,
// `/proto/camera?blank=1`, nothing touched), 25 s, under a Chrome PERFORMANCE TRACE. argv: OUT dir, runs (default 2).
// THE STALL: the longest gap between the page's animation frames (`FireAnimationFrame` on the page's main thread) after
// the bench reads drawn. Inside it, from the trace, on the main thread:
//   SCRIPT — the union of `FunctionCall`, `EvaluateScript`, `FireAnimationFrame`, `TimerFire`, `v8.compile` events
//            (JavaScript running, three's shader build included);
//   BUSY   — the union of the main thread's top-level tasks (`RunTask`) — script plus the rest of the thread's own work;
//   WAIT   — the window less BUSY: the main thread idle or blocked, the frame not drawn (the GPU process's side).
// (A long task counts waiting as busy, so long tasks are NOT used for the split — the Architect's review, plan v1.1.)
// Also: the bake's and the regions' published times (`__liquid.stats`), and the console ERRORS from load to 25 s (the
// BEFORE count for the probe's check 2). ⛔ STOP LINE: SCRIPT inside the stall over ~100 ms.
// ⚠ NOT WATCHED (printed): Carl's Chrome; the GPU process's own events (not separated further); the WebGL 2 fallback.
import { chromium } from "file:///C:/Users/Carl Buckley/agency-website-v2/node_modules/playwright/index.mjs";
import { mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
const OUT = process.argv[2];
const RUNS = Number(process.argv[3] ?? 2);
mkdirSync(OUT, { recursive: true });
const SCRIPT = new Set(["FunctionCall", "EvaluateScript", "FireAnimationFrame", "TimerFire", "v8.compile", "V8.Execute"]);
const union = (iv) => {
  iv.sort((a, b) => a[0] - b[0]);
  let tot = 0;
  let cs = -1;
  let ce = -1;
  for (const [s, e] of iv) {
    if (s > ce) {
      if (ce > cs) tot += ce - cs;
      cs = s;
      ce = e;
    } else ce = Math.max(ce, e);
  }
  if (ce > cs) tot += ce - cs;
  return tot;
};
const clip = (iv, a, b) => iv.map(([s, e]) => [Math.max(s, a), Math.min(e, b)]).filter(([s, e]) => e > s);
for (let run = 1; run <= RUNS; run++) {
  const b = await chromium.launch({ channel: "chrome", args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-webgpu"] });
  const ctx = await b.newContext({ viewport: { width: 1909, height: 934 }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  const errs = [];
  p.on("console", (m) => m.type() === "error" && errs.push(m.text().slice(0, 200)));
  p.on("pageerror", (e) => errs.push("pageerror: " + e.message.slice(0, 200)));
  await p.addInitScript(() => {
    const t = setInterval(() => {
      if (document.querySelector('[data-camera-bench="drawn"]')) {
        performance.mark("bench-drawn");
        clearInterval(t);
      }
    }, 20);
  });
  const tracePath = join(OUT, `trace-${run}.json`);
  await b.startTracing(p, { path: tracePath, categories: ["devtools.timeline", "disabled-by-default-devtools.timeline", "blink.user_timing", "toplevel", "v8"] });
  await p.goto("http://localhost:3000/proto/camera?blank=1", { waitUntil: "load" });
  await p.waitForTimeout(25000);
  const stats = await p.evaluate(() => window.__liquid?.stats ?? null);
  await b.stopTracing();
  await b.close();
  const tr = JSON.parse(readFileSync(tracePath, "utf8"));
  const ev = tr.traceEvents ?? tr;
  // the page's main thread: the CrRendererMain with the most animation frames
  const mains = ev.filter((e) => e.ph === "M" && e.name === "thread_name" && e.args?.name === "CrRendererMain").map((e) => `${e.pid}:${e.tid}`);
  let main = null;
  let most = -1;
  for (const k of mains) {
    const n = ev.filter((e) => `${e.pid}:${e.tid}` === k && e.name === "FireAnimationFrame").length;
    if (n > most) {
      most = n;
      main = k;
    }
  }
  const on = ev.filter((e) => `${e.pid}:${e.tid}` === main);
  const drawn = ev.find((e) => e.name === "bench-drawn")?.ts ?? 0;
  const frames = on.filter((e) => e.name === "FireAnimationFrame" && e.ts >= drawn).map((e) => [e.ts, e.ts + (e.dur ?? 0)]).sort((a, c) => a[0] - c[0]);
  let gap = { a: 0, b: 0 };
  for (let i = 1; i < frames.length; i++) {
    const a = frames[i - 1][0];
    const c = frames[i][0];
    if (c - a > gap.b - gap.a) gap = { a, b: c };
  }
  const X = (pred) => on.filter((e) => e.ph === "X" && pred(e)).map((e) => [e.ts, e.ts + (e.dur ?? 0)]);
  const win = gap.b - gap.a;
  const script = union(clip(X((e) => SCRIPT.has(e.name)), gap.a, gap.b));
  const busy = union(clip(X((e) => e.name === "RunTask" || e.name === "ThreadControllerImpl::RunTask"), gap.a, gap.b));
  // the biggest single script events inside the window (what ran)
  const top = on
    .filter((e) => e.ph === "X" && SCRIPT.has(e.name) && e.ts < gap.b && e.ts + (e.dur ?? 0) > gap.a)
    .sort((x, y) => (y.dur ?? 0) - (x.dur ?? 0))
    .slice(0, 5)
    .map((e) => `${e.name} ${((e.dur ?? 0) / 1000).toFixed(0)} ms at +${((e.ts - gap.a) / 1000).toFixed(0)}`);
  const ms = (us) => +(us / 1000).toFixed(0);
  console.log(`RUN ${run}: the stall ${ms(win)} ms (from ${ms(gap.a - drawn)} ms after drawn) — SCRIPT ${ms(script)} ms, BUSY ${ms(busy)} ms, WAIT ${ms(win - busy)} ms`);
  console.log(`   biggest script events in it: ${JSON.stringify(top)}`);
  console.log(`   bake ${stats?.bakeMs} ms, regions ${stats?.regionsMs} ms (published); console errors ${errs.length} ${JSON.stringify(errs.slice(0, 5))}`);
  console.log(`   ⛔ STOP LINE (script > ~100 ms): ${ms(script) > 100 ? "CROSSED" : "clear"}`);
}
console.log("⚠ NOT WATCHED: Carl's Chrome; the GPU process's own events (not separated further); the WebGL 2 fallback");
