// THE OPENING's LONG FRAMES vs THE GPU PROCESS (16 November 2026, session 2; D-101). A COLD load (chromium.launch: a fresh
// profile, an empty shader cache) of /proto/hero under a Chrome TRACE (gpu, dawn, toplevel, v8). For each animation frame
// over `MIN` ms on the page: the longest slices on EVERY thread in that window (renderer main, GPU process main, Dawn's
// workers) — which process holds the frame. argv: MIN (ms), URL. Writes the trace to the scratchpad path argv[4] if given.
// READ-ONLY. ⚠ NOT WATCHED: Playwright's Chrome (headless, AMD integrated), not Carl's; tracing costs a little time.
import { chromium } from "playwright";
import { readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
const MIN = Number(process.argv[2] ?? 150);
const URL_ = process.argv[3] ?? "http://localhost:3000/proto/hero";
const OUT = process.argv[4] ?? join(tmpdir(), `hero-trace-${Date.now()}.json`);
// argv 5 "warm": load once first (the shader cache filled), then trace the RELOAD
const WARM = process.argv[5] === "warm";
const ARGS = ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-webgpu"];
const b = await chromium.launch({ channel: "chrome", args: ARGS });
const p = await b.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
await p.addInitScript(() => {
  window.__frames = [];
  let last = 0;
  const tick = (t) => {
    const o = window.__heroBench?.hero?.openingInfo;
    if (last) window.__frames.push({ at: t + performance.timeOrigin, dt: t - last, ot: o ? o.t : null });
    last = t;
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
});
if (WARM) {
  await p.goto(URL_, { waitUntil: "load" });
  await p.waitForFunction(() => window.__heroBench?.hero?.openingInfo?.done, null, { timeout: 120000, polling: 250 });
}
await b.startTracing(p, { path: OUT, categories: ["toplevel", "gpu", "dawn", "disabled-by-default-gpu.dawn", "gpu.service", "v8", "blink", "devtools.timeline", "disabled-by-default-devtools.timeline", "blink.user_timing"] });
await p.goto(URL_, { waitUntil: "load" });
await p.waitForFunction(() => window.__heroBench?.hero?.openingInfo?.done, null, { timeout: 120000, polling: 250 });
// the trace clock vs the page's: a console.timeStamp-free marker — performance.timeOrigin + now() vs a trace event's ts
await p.evaluate(() => performance.mark("hero-trace-sync"));
const sync = await p.evaluate(() => performance.timeOrigin + performance.getEntriesByName("hero-trace-sync")[0].startTime);
const frames = await p.evaluate(() => window.__frames);
await b.stopTracing();
await b.close();
const tr = JSON.parse(readFileSync(OUT, "utf8"));
const ev = tr.traceEvents ?? tr;
const names = new Map();
for (const e of ev) if (e.ph === "M" && e.name === "thread_name") names.set(`${e.pid}:${e.tid}`, e.args.name);
const pnames = new Map();
for (const e of ev) if (e.ph === "M" && e.name === "process_name") pnames.set(e.pid, e.args.name);
const mark = ev.find((e) => e.name === "hero-trace-sync");
if (!mark) throw new Error("no sync mark in the trace");
const off = sync - mark.ts / 1000; // page ms = trace ms + off
const X = ev.filter((e) => e.ph === "X" && e.dur > 2000);
console.log(`trace: ${OUT}`);
for (const f of frames.filter((x) => x.dt > MIN)) {
  const a = f.at - f.dt - off;
  const z = f.at - off;
  const inF = X.filter((e) => e.ts / 1000 < z && e.ts / 1000 + e.dur / 1000 > a);
  const byThread = new Map();
  for (const e of inF) {
    const k = `${pnames.get(e.pid) ?? e.pid} / ${names.get(`${e.pid}:${e.tid}`) ?? e.tid}`;
    if (!byThread.has(k)) byThread.set(k, []);
    byThread.get(k).push(e);
  }
  console.log(`\n■ FRAME ${f.dt.toFixed(0)} ms (opening ${f.ot ?? "—"} s)`);
  for (const [k, list] of byThread) {
    const top = list.sort((x, y) => y.dur - x.dur).slice(0, 5).map((e) => `${e.name} ${(e.dur / 1000).toFixed(0)}ms`).join(" | ");
    console.log(`   ${k}: ${top}`);
  }
}
console.log("\n⚠ Playwright's Chrome (headless), cold; not Carl's Chrome.");
