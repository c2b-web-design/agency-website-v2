// THE OPENING's TIMELINE: EVERY LONG FRAME BESIDE THE LOAD's STEPS AND WHAT EACH PROCESS DID (16 November 2026, session 2;
// D-101). Carl: "A new page sees the text stall still there" … "i closed the browser and opened a fresh one - its still
// there" (closing Chrome keeps its shader cache: a RETURN visit). One browser, a VISIBLE window (headed, the screen's own
// size and density, as Carl sees it); load 1 cold, then a reload (warm) under a Chrome TRACE. For the traced load: the
// hero's own marks ("hero:…", `performance.mark`: the geometry, the maps, the warm-up, the background compiles, the steam's
// warm) and every frame over MIN ms in the visible opening (opening ≥ 0.3 s), each with the longest slices on the page's
// main thread and the GPU process's main thread. argv: MIN (default 50), "cold" to trace the first load instead. READ-ONLY.
// ⚠ NOT WATCHED: Carl's own Chrome profile (extensions, flags); the trace costs a little time.
import { chromium } from "playwright";
import { readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
const MIN = Number(process.argv[2] ?? 50);
const COLD = process.argv[3] === "cold";
const URL_ = "http://localhost:3000/proto/hero";
const OUT = join(tmpdir(), `hero-timeline-${Date.now()}.json`);
const ARGS = ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-webgpu"];
const b = await chromium.launch({ channel: "chrome", args: ARGS, headless: false });
const ctx = await b.newContext({ viewport: null });
const p = await ctx.newPage();
await p.addInitScript(() => {
  window.__frames = [];
  let last = 0;
  const tick = (t) => {
    const o = window.__heroBench?.hero?.openingInfo;
    if (last) window.__frames.push({ at: t, dt: t - last, ot: o ? o.t : null });
    last = t;
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
});
const done = () => p.waitForFunction(() => window.__heroBench?.hero?.openingInfo?.done, null, { timeout: 120000, polling: 250 });
if (!COLD) {
  await p.goto(URL_, { waitUntil: "load" });
  await done();
}
await b.startTracing(p, { path: OUT, categories: ["toplevel", "gpu", "v8", "blink", "blink.user_timing", "devtools.timeline"] });
await p.goto(URL_, { waitUntil: "load" });
await done();
await p.evaluate(() => performance.mark("hero-trace-sync"));
const page = await p.evaluate(() => ({
  frames: window.__frames,
  marks: performance.getEntriesByType("mark").filter((m) => m.name.startsWith("hero")).map((m) => ({ name: m.name, at: m.startTime })),
  lt: window.__heroBench.hero.loadTimes,
}));
await b.stopTracing();
await b.close();
const ev = JSON.parse(readFileSync(OUT, "utf8")).traceEvents;
const tname = new Map();
const pname = new Map();
for (const e of ev) if (e.ph === "M" && e.name === "thread_name") tname.set(`${e.pid}:${e.tid}`, e.args.name);
for (const e of ev) if (e.ph === "M" && e.name === "process_name") pname.set(e.pid, e.args.name);
const sync = ev.find((e) => e.name === "hero-trace-sync");
const syncPage = page.marks.find((m) => m.name === "hero-trace-sync").at;
const toPage = (ts) => ts / 1000 - sync.ts / 1000 + syncPage;
const X = ev.filter((e) => e.ph === "X" && e.dur > 3000);
const rows = page.marks.filter((m) => m.name !== "hero-trace-sync").map((m) => ({ at: m.at, s: `   · ${m.name.replace("hero:", "")}` }));
for (const f of page.frames.filter((x) => x.dt > MIN && x.ot !== null && x.ot >= 0.3)) {
  const a = f.at - f.dt;
  const z = f.at;
  const on = (thread) =>
    X.filter((e) => tname.get(`${e.pid}:${e.tid}`) === thread && toPage(e.ts) < z && toPage(e.ts) + e.dur / 1000 > a)
      .sort((x, y) => y.dur - x.dur)
      .slice(0, 6)
      .map((e) => `${e.name} ${(e.dur / 1000).toFixed(0)}`)
      .join(" | ");
  rows.push({ at: a, s: `■ FRAME ${f.dt.toFixed(0)} ms, opening ${f.ot} s\n       page: ${on("CrRendererMain") || "—"}\n       gpu:  ${on("CrGpuMain") || "—"}` });
}
rows.sort((x, y) => x.at - y.at);
console.log(`traced: ${COLD ? "COLD (first load)" : "WARM (the reload)"}; loadTimes ${JSON.stringify(page.lt)}`);
for (const r of rows) console.log(`${String(Math.round(r.at)).padStart(6)} ${r.s}`);
console.log(`\n⚠ headed Playwright Chrome on this PC; not Carl's own profile. Trace: ${OUT}`);
