// THE STALL ON PASS 4's RETURN (25 November 2026; Carl: "On the 4th jump, on its return, theres a stall. Its happened a
// couple of times now."). READ-ONLY. /proto/hero run from load to the marble's entrance + 8 s; GPUDevice's creators
// wrapped before the page runs (every SYNC / async pipeline, with the story's clock and our first stack frame); every frame
// over MIN ms on the same clock; the story's moments: pass 4's return take-off (`pass4ReturnAt`), the cloth's departure /
// the marble's entrance, the plinth's appearance. argv[2] = MIN (ms, default 50); argv[3] = "persist" to reuse a profile
// (a WARM shader cache, as Carl's Chrome) in the scratch folder given by argv[4].
// ⚠ NOT WATCHED: the GPU process's own time per submit; Carl's Chrome (Playwright's, the same GPU).
import { chromium } from "playwright";
const MIN = Number(process.argv[2] ?? 50);
const persist = process.argv[3] === "persist";
const args = ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-webgpu"];
let b, p;
if (persist) {
  b = await chromium.launchPersistentContext(process.argv[4], { channel: "chrome", args, viewport: { width: 1896, height: 946 }, deviceScaleFactor: 1 });
  p = b.pages()[0] ?? (await b.newPage());
} else {
  b = await chromium.launch({ channel: "chrome", args });
  p = await b.newPage({ viewport: { width: 1896, height: 946 }, deviceScaleFactor: 1 });
}
await p.addInitScript(() => {
  window.__gpu = [];
  window.__frames = [];
  window.__marks = [];
  const st = () => { const a = window.__heroBench?.hero?.arrival; return a ? a.t : null; };
  const where = () => {
    const s = (new Error().stack || "").split("\n").slice(2);
    const ours = s.filter((l) => /hero|showcase|bench/i.test(l) && !/three_build|node_modules/.test(l)).slice(0, 2);
    const fn = (l) => (l || "").trim().replace(/^at /, "").replace(/\(.*\/([^/]+?)(\?[^:]*)?:(\d+):\d+\)$/, "($1:$3)");
    return ours.map(fn).join(" ← ") || fn(s[0]);
  };
  const P = GPUDevice.prototype;
  for (const k of ["createRenderPipeline", "createComputePipeline", "createRenderPipelineAsync", "createComputePipelineAsync"]) {
    const f = P[k];
    P[k] = function (d) {
      Error.stackTraceLimit = 60;
      const t0 = performance.now();
      const out = f.call(this, d);
      window.__gpu.push({ at: Math.round(t0), ms: Math.round(performance.now() - t0), k: k.replace("create", ""), label: d?.label || "", st: st(), where: where() });
      return out;
    };
  }
  let last = 0;
  const seen = {};
  const tick = (t) => {
    const h = window.__heroBench?.hero;
    if (last) window.__frames.push({ at: Math.round(t), dt: Math.round(t - last), st: st() });
    if (h) {
      const d = h.clothDepartureInfo;
      const m = h.marble?.info;
      const note = (k, on) => { if (on && !seen[k]) { seen[k] = 1; window.__marks.push({ at: Math.round(t), st: st(), k }); } };
      note("pass 4 return takes off", d && Number.isFinite(d.pass4ReturnAt));
      note("cloth departs / marble enters", d && Number.isFinite(d.departAt));
      note("marble drawn (reveal > 0)", m && m.reveal > 0);
      note("plinth up", m && m.plinthCm?.risen > 0);
    }
    last = t;
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
});
await p.goto("http://localhost:3000/proto/hero", { waitUntil: "load" });
await p.waitForFunction(() => window.__heroBench?.hero?.marble?.info?.plinthCm?.risen > 0, null, { timeout: 400000, polling: 250 });
await p.waitForTimeout(8000);
const gpu = await p.evaluate(() => window.__gpu);
const frames = await p.evaluate(() => window.__frames);
const marks = await p.evaluate(() => window.__marks);
const arr = await p.evaluate(() => ({ warmShadow: window.__heroBench.hero.loadTimes.warmShadow ?? null, warmShadowMs: window.__heroBench.hero.loadTimes.warmShadowMs ?? null, warmMs: window.__heroBench.hero.warmMs }));
await b.close();
const from = (marks.find((m) => m.k === "pass 4 return takes off")?.at ?? 0) - 15000;
const rows = [
  ...gpu.filter((g) => g.at > from).map((g) => ({ at: g.at, s: `   ${g.at} st ${String(g.st ?? "—").padEnd(6)} ${g.k.padEnd(22)} ${g.ms}ms [${g.label}]  ${g.where}` })),
  ...frames.filter((f) => f.at > from && f.dt > MIN).map((f) => ({ at: f.at, s: `■■ ${f.at} st ${String(f.st ?? "—").padEnd(6)} FRAME ${f.dt} ms` })),
  ...marks.map((m) => ({ at: m.at, s: `>> ${m.at} st ${String(m.st ?? "—").padEnd(6)} ${m.k}` })),
].sort((a, c) => a.at - c.at);
console.log(`mode: ${persist ? "persistent profile (warm if run before)" : "fresh profile (cold)"}; arrival ${JSON.stringify(arr)}; frames > ${MIN} ms from 15 s before pass 4's return`);
console.log(rows.map((r) => r.s).join("\n"));
const win = frames.filter((f) => f.at > from);
const shadowRows = gpu.filter((g) => /Shadow/.test(g.label));
console.log(`\nEVERY Shadow pipeline made (the whole run): ${shadowRows.length ? "" : "none"}`);
for (const g of shadowRows) console.log(`   ${g.at} st ${String(g.st ?? "—").padEnd(6)} ${g.k.padEnd(22)} [${g.label}]  ${g.where}`);
console.log(`\nframes in window: ${win.length}, mean ${Math.round(win.reduce((a, f) => a + f.dt, 0) / win.length * 10) / 10} ms`);
console.log("⚠ Playwright's Chrome, not Carl's; GPU-process compile time not measured.");
