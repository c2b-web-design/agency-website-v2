// THE LOGO's BUILD, TAKEN APART (28 November 2026; the Architect's review of
// `architect-note-logo-build-opening-28-november.md`, §2: "the amended measurement"). READ-ONLY: measures, changes nothing.
// A PRODUCTION build (argv[2], default http://localhost:3100), Carl's window (1896 x 946, DPR 1), argv[3] runs (default 5).
// Each run: a FRESH PERSISTENT profile, a COLD load; the browser CLOSED; the SAME profile reopened, a RETURN load (Chrome's
// own disk caches as a real return visit has them). Each load runs until the warm-up is done (`hero:WarmDone`).
// Per load:
//  - each LOGO material's pipeline (the fade's, its depth's, the opaque one), read at the WebGPU API (three's own labels;
//    the opaque logo material is unnamed: the MeshPhysicalNodeMaterial pipeline whose fragment WGSL is within 10 % of the
//    fade's): its shader modules' WGSL size, when its pipeline was asked for (s after `hero:Warm`), how long the GPU
//    process took to hand it back (async), and whether any logo pipeline was made SYNCHRONOUSLY;
//  - a Chrome TRACE ("toplevel"): the page's MAIN THREAD busy time over [Warm, WarmDone], and the GPU PROCESS's (any of
//    its threads busy, as one wall-clock union): mostly-busy main thread = the time is JavaScript (three's generation);
//    mostly-idle main thread with a busy GPU process = the time is the GPU's compile;
//  - the scene's marks (when the prefilter finished: route D); the LOGO's first draw (the first pass that sets the fade's
//    pipeline: when its fade begins, after the paint).
// Medians across runs. Out (argv[4], default logo-build.json): every load's numbers.
// env HEADED=1: a visible window (default headless); env SCREENCAST=1: the films' screencast on (default unfilmed).
// ⚠ NOT WATCHED: Carl's own Chrome and profile (Playwright's Chrome); other GPUs; what INSIDE the GPU process
// the time is (the driver's compile vs Dawn's translation); three's JS step-by-step (production exposes no hook).
import { chromium } from "playwright";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
const [BASE = "http://localhost:3100", RUNS = "5", OUT = "logo-build.json"] = process.argv.slice(2);
const HEADED = process.env.HEADED === "1";
const SCREENCAST = process.env.SCREENCAST === "1";
// env QUERY: appended to the URL (e.g. "?warm=split": the TEMPORARY probe build's switch)
const QUERY = process.env.QUERY ?? "";
const ARGS = ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-webgpu", "--hide-scrollbars"];

function hookGpu() {
  window.__gpu = { modules: 0, pipes: [] };
  // THE ADAPTER the page is given (the Architect's review 2, §1: headless Chrome on Windows can land on another adapter or a
  // software fallback): its vendor, architecture, device, description, and whether it is the fallback
  const ra = GPU.prototype.requestAdapter;
  GPU.prototype.requestAdapter = function (opts) {
    return ra.call(this, opts).then((ad) => {
      if (ad && !window.__gpu.adapter) {
        const i = ad.info ?? {};
        window.__gpu.adapter = { vendor: i.vendor, architecture: i.architecture, device: i.device, description: i.description, fallback: !!(ad.isFallbackAdapter ?? i.isFallbackAdapter) };
      }
      return ad;
    });
  };
  const size = new WeakMap();
  const D = GPUDevice.prototype;
  const csm = D.createShaderModule;
  D.createShaderModule = function (desc) {
    const m = csm.call(this, desc);
    size.set(m, desc?.code?.length ?? 0);
    window.__gpu.modules++;
    return m;
  };
  const rec = (desc, async) => ({ label: desc?.label ?? "", vs: size.get(desc?.vertex?.module) ?? 0, fs: size.get(desc?.fragment?.module) ?? 0, async, t0: performance.now(), t1: -1 });
  const a = D.createRenderPipelineAsync;
  D.createRenderPipelineAsync = function (desc) {
    const r = rec(desc, true);
    window.__gpu.pipes.push(r);
    const p = a.call(this, desc);
    p.then(() => (r.t1 = performance.now()), () => (r.t1 = -2));
    return p;
  };
  const s = D.createRenderPipeline;
  D.createRenderPipeline = function (desc) {
    const r = rec(desc, false);
    const p = s.call(this, desc);
    r.t1 = performance.now();
    window.__gpu.pipes.push(r);
    return p;
  };
  // every animation frame's time, and every bind group made (the Architect's review 4, §3: is the fade's first draw a LONG
  // FRAME, and is anything built on it?)
  window.__gpu.frames = [];
  window.__gpu.binds = [];
  const tick = (ts) => {
    window.__gpu.frames.push(ts);
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
  const cbg = D.createBindGroup;
  D.createBindGroup = function (desc) {
    window.__gpu.binds.push(performance.now());
    return cbg.call(this, desc);
  };
  // the LOGO's FIRST DRAW: the first render pass that sets the fade's pipeline (three labels it) — when the visitor's
  // logo starts to fade in
  const sp = GPURenderPassEncoder.prototype.setPipeline;
  GPURenderPassEncoder.prototype.setPipeline = function (pl) {
    if (window.__gpu.fadeDrawn === undefined && String(pl?.label ?? "").includes("the opening's fade")) window.__gpu.fadeDrawn = performance.now();
    return sp.call(this, pl);
  };
}

// the union of [start, end] intervals (µs), clipped to [a, b]
function busy(intervals, a, b) {
  const xs = intervals.map(([s, e]) => [Math.max(s, a), Math.min(e, b)]).filter(([s, e]) => e > s).sort((p, q) => p[0] - q[0]);
  let total = 0;
  let cs = -1;
  let ce = -1;
  for (const [s, e] of xs) {
    if (s > ce) {
      if (ce > cs) total += ce - cs;
      cs = s;
      ce = e;
    } else ce = Math.max(ce, e);
  }
  if (ce > cs) total += ce - cs;
  return total;
}

function frameAt(g, at) {
  if (at === undefined || !g.frames?.length) return null;
  const F = g.frames;
  const i = F.findIndex((f) => f > at);
  if (i < 1) return null;
  const len = (k) => (k > 0 && k < F.length ? F[k] - F[k - 1] : 0);
  const a = F[i - 1];
  const b = F[i];
  return {
    ms: +len(i).toFixed(1),
    max3: +Math.max(len(i), len(i + 1), len(i + 2), len(i + 3)).toFixed(1),
    binds: g.binds.filter((x) => x >= a && x <= b).length,
    syncPipes: g.pipes.filter((p) => !p.async && p.t0 >= a && p.t0 <= b).length,
  };
}

async function load(dir) {
  const ctx = await chromium.launchPersistentContext(dir, { channel: "chrome", headless: !HEADED, viewport: { width: 1896, height: 946 }, deviceScaleFactor: 1, args: ARGS });
  await ctx.addInitScript(hookGpu);
  const page = ctx.pages()[0] ?? (await ctx.newPage());
  const cdp = await ctx.newCDPSession(page);
  const events = [];
  cdp.on("Tracing.dataCollected", (e) => events.push(...e.value));
  await cdp.send("Tracing.start", { categories: "toplevel,blink.user_timing,__metadata", transferMode: "ReportEvents" });
  // SCREENCAST=1: the films' own screencast (`hero-flow-film-28-november.mjs`: jpeg 80, every frame, full size), to test
  // what filming costs - ONE variable against an unfilmed run
  if (SCREENCAST) {
    cdp.on("Page.screencastFrame", (f) => cdp.send("Page.screencastFrameAck", { sessionId: f.sessionId }).catch(() => {}));
    await cdp.send("Page.startScreencast", { format: "jpeg", quality: 80, everyNthFrame: 1 });
  }
  await page.goto(`${BASE}/proto/hero${QUERY}`, { waitUntil: "load" });
  await page.waitForFunction(() => performance.getEntriesByName("hero:WarmDone").length > 0 && window.__gpu?.fadeDrawn !== undefined, null, { timeout: 90000, polling: 250 });
  // (the PROBE build marks the touchdown: wait for it too, when it can come)
  await page.waitForFunction(() => performance.getEntriesByName("hero:Touchdown").length > 0, null, { timeout: 30000, polling: 250 }).catch(() => {});
  await page.waitForTimeout(300);
  const done = new Promise((r) => cdp.once("Tracing.tracingComplete", r));
  await cdp.send("Tracing.end");
  await done;
  const pg = await page.evaluate(() => ({
    marks: Object.fromEntries(performance.getEntriesByType("mark").filter((m) => m.name.startsWith("hero:")).map((m) => [m.name.slice(5), m.startTime])),
    paint: performance.getEntriesByName("first-paint")[0]?.startTime ?? 0,
    gpu: window.__gpu,
  }));
  await ctx.close();
  // the trace's clock against the page's: the "hero:Warm" mark in both
  const warmEv = events.find((e) => e.name === "hero:Warm" && String(e.cat).includes("user_timing"));
  const off = warmEv ? warmEv.ts / 1000 - pg.marks.Warm : NaN;
  const toTs = (ms) => (ms + off) * 1000;
  const names = events.filter((e) => e.ph === "M" && e.name === "thread_name");
  const procs = events.filter((e) => e.ph === "M" && e.name === "process_name");
  const main = names.find((e) => e.pid === warmEv?.pid && e.args?.name === "CrRendererMain");
  const gpuPid = procs.find((e) => /gpu/i.test(e.args?.name ?? ""))?.pid;
  const slices = (f) => events.filter((e) => e.ph === "X" && typeof e.dur === "number" && f(e)).map((e) => [e.ts, e.ts + e.dur]);
  const a = toTs(pg.marks.Warm);
  const b = toTs(pg.marks.WarmDone);
  const span = (b - a) / 1000;
  const mainBusy = main ? busy(slices((e) => e.pid === main.pid && e.tid === main.tid), a, b) / 1000 : NaN;
  const gpuBusy = gpuPid !== undefined ? busy(slices((e) => e.pid === gpuPid), a, b) / 1000 : NaN;
  // the logo's pipelines
  const P = pg.gpu.pipes;
  const fade = P.filter((p) => p.label.includes("the opening's fade"));
  const depth = P.filter((p) => p.label.includes("the fade's depth"));
  const fadeFs = Math.max(0, ...fade.map((p) => p.fs));
  const opaque = P.filter((p) => /^renderPipeline_MeshPhysicalNodeMaterial_/.test(p.label) && fadeFs > 0 && Math.abs(p.fs - fadeFs) / fadeFs < 0.1);
  const W = pg.marks.Warm;
  const desc = (list) =>
    list.map((p) => ({ label: p.label, vsKB: +(p.vs / 1024).toFixed(1), fsKB: +(p.fs / 1024).toFixed(1), async: p.async, askedS: +((p.t0 - W) / 1000).toFixed(2), tookS: p.t1 >= 0 ? +((p.t1 - p.t0) / 1000).toFixed(2) : p.t1, readyS: p.t1 >= 0 ? +((p.t1 - W) / 1000).toFixed(2) : p.t1 }));
  const rel = (k) => (pg.marks[k] !== undefined ? +((pg.marks[k] - pg.paint) / 1000).toFixed(2) : null);
  return {
    adapter: pg.gpu.adapter ?? null,
    afterPaintS: { prefilterDone: rel("PrefilterPrimeDone"), firstFrame: rel("FirstCompileDone"), warm: rel("Warm"), fadeBuilt: rel("FadeBuilt"), warmA: rel("WarmA"), warmB: rel("WarmB"), warmDone: rel("WarmDone"), logoDrawn: +((pg.gpu.fadeDrawn - pg.paint) / 1000).toFixed(2), openingDone: rel("OpeningDone"), touchdown: rel("Touchdown") },
    // the Architect's review 2, §4: the OPAQUE logo built before the swap (opening done)? the LIQUID and HEAT PLANE built
    // (WarmB in "story", else the whole warm-up) before the touchdown? (s of margin: + = in time; null = not marked)
    swapMarginS: pg.marks.OpeningDone !== undefined && opaque.length && opaque[0].t1 >= 0 ? +((pg.marks.OpeningDone - opaque[0].t1) / 1000).toFixed(2) : null,
    touchMarginS: pg.marks.Touchdown !== undefined ? +((pg.marks.Touchdown - (pg.marks.WarmB ?? pg.marks.WarmDone)) / 1000).toFixed(2) : null,
    race: opaque.some((p) => p.t0 < W),
    // the frame the fade first draws on, and the frame of the swap: its length (ms), the longest of the next 3, and what
    // was made on it (bind groups; pipelines made synchronously)
    fadeFrame: frameAt(pg.gpu, pg.gpu.fadeDrawn),
    swapFrame: frameAt(pg.gpu, pg.marks.OpeningDone),
    // when the logo is DUE (Carl's rule: the subtext's last letter in), from the 3D's first frame by the scene's own formula
    // (`stepFlow`, FLOW_OPENING/FLOW_TIMES: growAt = max(0.75, first frame); line 2 at max(3.81, growAt + 0.56 + 2.5); in
    // after 2.8 + 0.5) — on the opening's clock, ~the first paint (the 2D headline's fade starts there). ⚠ ~1 frame coarse
    dueS: +Math.max(7.11, Math.max(0.75, (pg.marks.FirstCompileDone - pg.paint) / 1000) + 6.36).toFixed(2),
    warmSpanS: +(span / 1000).toFixed(2),
    mainBusyS: +(mainBusy / 1000).toFixed(2),
    mainBusyShare: +(mainBusy / span).toFixed(2),
    gpuProcBusyS: +(gpuBusy / 1000).toFixed(2),
    gpuProcBusyShare: +(gpuBusy / span).toFixed(2),
    syncLogoPipelines: [...fade, ...depth, ...opaque].filter((p) => !p.async).length,
    fade: desc(fade),
    depth: desc(depth),
    opaque: desc(opaque),
    traced: !!warmEv && !!main && gpuPid !== undefined,
  };
}

const runs = { cold: [], return: [] };
for (let i = 0; i < Number(RUNS); i++) {
  const dir = mkdtempSync(join(tmpdir(), "hero-logo-build-"));
  try {
    runs.cold.push(await load(dir));
    runs.return.push(await load(dir));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
  for (const k of ["cold", "return"]) {
    const r = runs[k].at(-1);
    const t = (l) => (l.length ? `${l[0].tookS} s (asked ${l[0].askedS})` : "none");
    const ad = r.adapter ? `${r.adapter.vendor}/${r.adapter.architecture}${r.adapter.fallback ? " FALLBACK" : ""}` : "adapter ?";
    const ff = r.fadeFrame ? `fade frame ${r.fadeFrame.ms} ms (next-3 max ${r.fadeFrame.max3}, binds ${r.fadeFrame.binds}, sync ${r.fadeFrame.syncPipes})` : "fade frame ?";
    const sf = r.swapFrame ? `swap frame ${r.swapFrame.ms} ms (max3 ${r.swapFrame.max3}, binds ${r.swapFrame.binds}, sync ${r.swapFrame.syncPipes})` : "swap frame ?";
    console.log(`   ${ff}; ${sf}`);
    console.log(`run ${i + 1} ${k.padEnd(6)} [${ad}]: first frame ${r.afterPaintS.firstFrame} s, LOGO due ${r.dueS} s, drawn ${r.afterPaintS.logoDrawn} s (LATE ${(r.afterPaintS.logoDrawn - r.dueS).toFixed(2)} s), swap margin ${r.swapMarginS} s, touchdown margin ${r.touchMarginS} s, warm-up ${r.warmSpanS} s, main ${r.mainBusyShare} / gpu ${r.gpuProcBusyShare}; fade ${t(r.fade)}, opaque ${t(r.opaque)}${r.opaque.some((p) => p.askedS < 0) ? "  ⚠ the opaque logo built BEFORE the warm-up (in the first frame's builds: the race)" : ""}`);
  }
}
writeFileSync(OUT, JSON.stringify(runs, null, 1));
const med = (xs) => {
  const v = xs.filter((x) => typeof x === "number" && Number.isFinite(x)).sort((p, q) => p - q);
  return v.length ? v[Math.floor((v.length - 1) / 2)] : null;
};
for (const k of ["cold", "return"]) {
  const hit = runs[k].filter((r) => r.race).length;
  // the medians LEAVE OUT the loads the race hit (the opaque logo built in the first frame's gather): counted, not hidden
  const R = runs[k].filter((r) => !r.race);
  const m = (f) => med(R.map(f));
  const first = (list, f) => (list.length ? f(list[0]) : null);
  console.log(`\n== ${k.toUpperCase()} (median of ${R.length}; ${hit} load(s) hit by the race, left out) ==`);
  console.log(`  ${QUERY || "(no query: as committed)"} — logo FADE built ${m((r) => r.afterPaintS.fadeBuilt)} s, stage A ${m((r) => r.afterPaintS.warmA)} s, B ${m((r) => r.afterPaintS.warmB)} s, opening done (the swap) ${m((r) => r.afterPaintS.openingDone)} s, touchdown ${m((r) => r.afterPaintS.touchdown)} s after the paint`);
  console.log(`  THE LOGO: due ${m((r) => r.dueS)} s, drawn ${m((r) => r.afterPaintS.logoDrawn)} s, LATE ${m((r) => +(r.afterPaintS.logoDrawn - r.dueS).toFixed(2))} s (worst ${Math.max(...R.map((r) => +(r.afterPaintS.logoDrawn - r.dueS).toFixed(2)))})`);
  console.log(`  §4 checks: the opaque ready BEFORE the swap by ${m((r) => r.swapMarginS)} s (worst ${Math.min(...R.map((r) => r.swapMarginS ?? Infinity))}); liquid + heat plane ready BEFORE touchdown by ${m((r) => r.touchMarginS)} s (worst ${Math.min(...R.map((r) => r.touchMarginS ?? Infinity))})`);
  console.log(`  after the paint: prefilter done ${m((r) => r.afterPaintS.prefilterDone)} s, first frame ${m((r) => r.afterPaintS.firstFrame)} s, warm-up ${m((r) => r.afterPaintS.warm)} → ${m((r) => r.afterPaintS.warmDone)} s, the LOGO first drawn ${m((r) => r.afterPaintS.logoDrawn)} s`);
  console.log(`  warm-up span ${m((r) => r.warmSpanS)} s: MAIN THREAD busy ${m((r) => r.mainBusyS)} s (${m((r) => r.mainBusyShare)}), GPU PROCESS busy ${m((r) => r.gpuProcBusyS)} s (${m((r) => r.gpuProcBusyShare)})`);
  for (const part of ["fade", "depth", "opaque"]) {
    console.log(`  ${part.padEnd(6)}: fs ${m((r) => first(r[part], (p) => p.fsKB))} KB, vs ${m((r) => first(r[part], (p) => p.vsKB))} KB; asked ${m((r) => first(r[part], (p) => p.askedS))} s after Warm, took ${m((r) => first(r[part], (p) => p.tookS))} s, ready ${m((r) => first(r[part], (p) => p.readyS))} s; pipelines per load ${m((r) => r[part].length)}`);
  }
  console.log(`  logo pipelines made synchronously: ${R.map((r) => r.syncLogoPipelines).join(", ")}; traced: ${R.map((r) => (r.traced ? "y" : "n")).join("")}`);
}
console.log(`\nquery: ${QUERY || "none"}; mode: ${HEADED ? "HEADED" : "headless"}, ${SCREENCAST ? "SCREENCAST ON" : "unfilmed"}; adapters: ${[...new Set([...runs.cold, ...runs.return].map((r) => JSON.stringify(r.adapter)))].join(" | ")}`);
console.log("⚠ the columns: ASKED = when its pipeline was requested, s after hero:Warm; TOOK = request to resolve; READY = resolve, s after hero:Warm - each the MEDIAN across runs on its own, so asked + took need not equal ready");
console.log("⚠ Playwright's Chrome, not Carl's; the opaque logo pipeline found by its fragment WGSL's size; NOT WATCHED: what inside the GPU process the time is; three's JS step by step");
