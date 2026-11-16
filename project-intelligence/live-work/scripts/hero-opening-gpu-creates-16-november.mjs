// WHICH GPU OBJECTS ARE CREATED WHEN, IN THE OPENING (16 November 2026, session 2; D-101). A COLD load (chromium.launch:
// fresh profile, empty shader cache) of /proto/hero; `GPUDevice`'s creators wrapped BEFORE the page runs: every
// createShaderModule (its WGSL length), createRenderPipeline / createComputePipeline (SYNCHRONOUS: the GPU process compiles
// it before the next submit can run) and the Async forms, with the page's clock, the opening's clock and the first stack
// frame in our code. Every frame over MIN ms is listed on the same clock. READ-ONLY.
// ⚠ NOT WATCHED: how long each compile takes in the GPU process (that is the trace script); Playwright's Chrome, not Carl's.
import { chromium } from "playwright";
const MIN = Number(process.argv[2] ?? 100);
const b = await chromium.launch({ channel: "chrome", args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-webgpu"] });
const p = await b.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
p.on("console", (m) => { if (/precompile|hero maps|WebGPURenderer/i.test(m.text())) console.log(`[page ${m.type()}] ${m.text().slice(0, 300)}`); });
await p.addInitScript(() => {
  window.__gpu = [];
  window.__frames = [];
  const ot = () => window.__heroBench?.hero?.openingInfo?.t ?? null;
  const where = () => {
    const s = (new Error().stack || "").split("\n").slice(2);
    const ours = s.find((l) => /hero|showcase|bench/i.test(l) && !/three_build/.test(l));
    const fn = (l) => (l || "").trim().replace(/^at /, "").replace(/\(.*\/([^/]+?)(\?[^:]*)?:(\d+):\d+\)$/, "($1:$3)");
    return fn(ours) || fn(s[0]);
  };
  const P = GPUDevice.prototype;
  for (const k of ["createShaderModule", "createRenderPipeline", "createComputePipeline", "createRenderPipelineAsync", "createComputePipelineAsync"]) {
    const f = P[k];
    P[k] = function (d) {
      Error.stackTraceLimit = 40;
      const t0 = performance.now();
      const out = f.call(this, d);
      window.__gpu.push({ at: Math.round(t0), k: k.replace("create", ""), label: d?.label || "", len: d?.code?.length ?? null, ot: ot(), where: k === "createShaderModule" ? "" : where() });
      return out;
    };
  }
  let last = 0;
  const tick = (t) => {
    if (last) window.__frames.push({ at: Math.round(t), dt: Math.round(t - last), ot: ot() });
    last = t;
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
});
await p.goto("http://localhost:3000/proto/hero", { waitUntil: "load" });
await p.waitForFunction(() => window.__heroBench?.hero?.openingInfo?.done, null, { timeout: 120000, polling: 250 });
const gpu = await p.evaluate(() => window.__gpu);
const frames = await p.evaluate(() => window.__frames);
await b.close();
const rows = [...gpu.filter((g) => g.k !== "ShaderModule").map((g) => ({ at: g.at, s: `   ${g.at} ${String(g.ot ?? "—").padEnd(6)} ${g.k.padEnd(20)} [${g.label}]
        ${g.where}` })), ...frames.filter((f) => f.dt > MIN).map((f) => ({ at: f.at, s: `■■ ${f.at} ${String(f.ot ?? "—").padEnd(6)} FRAME ${f.dt} ms (ended here)` }))].sort((a, b) => a.at - b.at);
console.log("page ms | opening s | what");
console.log(rows.map((r) => r.s).join("\n"));
const sync = gpu.filter((g) => g.k === "RenderPipeline" || g.k === "ComputePipeline");
console.log(`\nSYNC pipelines: ${sync.length} (render ${sync.filter((g) => g.k === "RenderPipeline").length}, compute ${sync.filter((g) => g.k === "ComputePipeline").length}); ASYNC ${gpu.filter((g) => /Async/.test(g.k)).length}; shader modules ${gpu.filter((g) => g.k === "ShaderModule").length}`);
console.log("⚠ Playwright's Chrome (headless), cold; not Carl's Chrome. Compile time per pipeline is NOT measured here.");
