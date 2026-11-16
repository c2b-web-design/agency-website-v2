// WHAT THE GPU EXECUTES UNDER EACH LONG FRAME (16 November 2026, session 2; D-101). The long frames left on a RETURN visit
// are 70–86 % IDLE on the page (profiled): the GPU holds them. Every `queue.submit` is wrapped BEFORE the page runs: the
// pipelines used in it (`setPipeline`'s labels, three names them) and when the GPU finished it (`onSubmittedWorkDone`);
// its GPU time ≈ finish − max(submit, the previous finish). For every frame over MIN ms in the visible opening (≥ 0.3 s):
// the submits that finished in it, with their GPU time and pipelines, beside the hero's marks. Headed (a visible window),
// load 1 cold, then the RELOAD measured (argv 3 "cold" measures load 1). READ-ONLY.
// ⚠ NOT WATCHED: queue copies (writeTexture/writeBuffer) and the GPU process's own work (compiles, present); the timing is
// on the page's clock (a few ms coarse); Playwright's Chrome on this PC, not Carl's profile.
import { chromium } from "playwright";
const MIN = Number(process.argv[2] ?? 50);
const COLD = process.argv[3] === "cold";
const URL_ = "http://localhost:3000/proto/hero";
const b = await chromium.launch({ channel: "chrome", args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-webgpu"], headless: false });
const ctx = await b.newContext({ viewport: null });
const p = await ctx.newPage();
await p.addInitScript(() => {
  window.__frames = [];
  window.__subs = [];
  let labels = [];
  const note = (proto) => {
    const f = proto.setPipeline;
    proto.setPipeline = function (pl) {
      labels.push(pl?.label || "?");
      return f.call(this, pl);
    };
  };
  note(GPUComputePassEncoder.prototype);
  note(GPURenderPassEncoder.prototype);
  let prevDone = 0;
  const sub = GPUQueue.prototype.submit;
  GPUQueue.prototype.submit = function (cbs) {
    const mine = labels;
    labels = [];
    const t0 = performance.now();
    const out = sub.call(this, cbs);
    this.onSubmittedWorkDone().then(() => {
      const done = performance.now();
      window.__subs.push({ t0, done, gpu: done - Math.max(t0, prevDone), labels: mine });
      prevDone = done;
    });
    return out;
  };
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
await p.goto(URL_, { waitUntil: "load" });
await done();
if (!COLD) {
  await p.reload({ waitUntil: "load" });
  await done();
}
const r = await p.evaluate(() => ({ frames: window.__frames, subs: window.__subs, marks: performance.getEntriesByType("mark").filter((m) => m.name.startsWith("hero:")).map((m) => ({ name: m.name.slice(5), at: m.startTime })) }));
await b.close();
const short = (l) => l.replace(/^(computePipeline_compute_|renderPipeline_)/, "").replace(/_\d+$/, "");
const group = (ls) => {
  const m = new Map();
  for (const l of ls.map(short)) m.set(l, (m.get(l) ?? 0) + 1);
  return [...m].map(([k, n]) => (n > 1 ? `${k}×${n}` : k)).join(", ");
};
const rows = r.marks.map((m) => ({ at: m.at, s: `   · ${m.name}` }));
for (const f of r.frames.filter((x) => x.dt > MIN && x.ot !== null && x.ot >= 0.3)) {
  const a = f.at - f.dt;
  const subs = r.subs.filter((s) => s.done > a && s.done <= f.at + 5).sort((x, y) => y.gpu - x.gpu);
  rows.push({ at: a, s: `■ FRAME ${f.dt.toFixed(0)} ms, opening ${f.ot} s — ${subs.length} submits finished, GPU ${subs.reduce((t, s) => t + s.gpu, 0).toFixed(0)} ms` + subs.slice(0, 5).map((s) => `\n       ${s.gpu.toFixed(0).padStart(4)} ms  ${group(s.labels) || "(no pass: copies only)"}`).join("") });
}
rows.sort((x, y) => x.at - y.at);
console.log(`measured: ${COLD ? "COLD (first load)" : "WARM (the reload)"}`);
for (const x of rows) console.log(`${String(Math.round(x.at)).padStart(6)} ${x.s}`);
// the heaviest submits of the whole opening, whatever frame
const top = [...r.subs].sort((x, y) => y.gpu - x.gpu).slice(0, 8);
console.log("\nheaviest GPU submits in the run:\n" + top.map((s) => `   ${s.gpu.toFixed(0).padStart(4)} ms @ ${Math.round(s.t0)}  ${group(s.labels)}`).join("\n"));
console.log("\n⚠ headed Playwright Chrome on this PC; copies and GPU-process work not attributed.");
// THE PREFILTER (PMREM) passes: each map built is ONE "PMREM_equirect" pass plus its GGX passes — so the equirect count
// is the number of maps built (3 expected: the studio, the courtyard, the judging studio; more = a map built twice)
const openingAt = (at) => r.frames.find((x) => x.at >= at)?.ot ?? null;
const pm = r.subs.filter((s) => s.labels.some((l) => /PMREM|mipmap/.test(l)));
const count = (re) => r.subs.reduce((n, s) => n + s.labels.filter((l) => re.test(l)).length, 0);
console.log(`\nPREFILTER: ${count(/PMREM_equirect/)} maps built (PMREM_equirect passes; 3 expected), ${count(/PMREM_ggx/)} GGX passes, ${count(/mipmap/)} mipmap passes, in ${pm.length} submits, GPU ${pm.reduce((t, s) => t + s.gpu, 0).toFixed(0)} ms`);
for (const s of pm) console.log(`   @ ${Math.round(s.t0)} (opening ${openingAt(s.t0)} s) GPU ${s.gpu.toFixed(0)} ms: ${group(s.labels.filter((l) => /PMREM|mipmap/.test(l)))}`);
