// WHY THE LOGO's SHADER TAKES SECONDS TO BUILD (16 November 2026; D-101). Carl: "yes run the measurement." On a first
// visit the page freezes 3.5–5 s as the logo appears (its pipeline first built). READ-ONLY. A FRESH browser (an empty
// shader cache): every shader module and render pipeline the page creates is recorded (GPUDevice wrapped); once the logo
// has been drawn, the LOGO's pipeline (the largest fragment shader) is saved to argv 2 (vertex.wgsl, fragment.wgsl) and its
// compile is TIMED ON ITS OWN: `createRenderPipelineAsync` from the same code (layout "auto", the same vertex buffers,
// targets, depth and multisample), a unique comment appended each time so no cache can answer, timed to completion;
// `RUNS` times. argv 3: an optional JSON file of VARIANTS — [{ "name", "stage": "fragment"|"vertex", "find", "replace" }]
// — or { "name", "stage", "edits": [[find, replace], ...] } — each timed the same way (text replacements in the captured
// code: the part's share of the compile).
// ⚠ NOT WATCHED: three's own shader GENERATION (main-thread JS, timed separately by hero-pipeline-builds); other
// pipelines than the logo's; Carl's Chrome (Playwright's, ANGLE/D3D11 off — WebGPU's own D3D12 backend on Windows).
import { chromium } from "playwright";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
const [OUT, VARIANTS, RUNS = "3"] = process.argv.slice(2);
mkdirSync(OUT, { recursive: true });
const variants = VARIANTS ? JSON.parse(readFileSync(VARIANTS, "utf8")) : [];
const b = await chromium.launch({ channel: "chrome", args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-webgpu"] });
const p = await b.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
await p.addInitScript(() => {
  const code = new WeakMap();
  window.__pipes = [];
  const D = GPUDevice.prototype;
  const csm = D.createShaderModule;
  D.createShaderModule = function (desc) {
    const m = csm.call(this, desc);
    code.set(m, desc.code);
    return m;
  };
  const keep = (desc, kind) => {
    const v = desc.vertex;
    const f = desc.fragment;
    window.__pipes.push({
      kind,
      label: desc.label ?? "",
      vertexCode: code.get(v.module),
      vertexEntry: v.entryPoint,
      buffers: JSON.parse(JSON.stringify(v.buffers ?? [])),
      fragmentCode: f ? code.get(f.module) : null,
      fragmentEntry: f?.entryPoint,
      targets: f ? JSON.parse(JSON.stringify(f.targets)) : [],
      primitive: JSON.parse(JSON.stringify(desc.primitive ?? {})),
      depthStencil: desc.depthStencil ? JSON.parse(JSON.stringify(desc.depthStencil)) : undefined,
      multisample: JSON.parse(JSON.stringify(desc.multisample ?? {})),
    });
  };
  const crp = D.createRenderPipeline;
  D.createRenderPipeline = function (desc) {
    window.__device = this;
    keep(desc, "sync");
    return crp.call(this, desc);
  };
  const crpa = D.createRenderPipelineAsync;
  D.createRenderPipelineAsync = function (desc) {
    window.__device = this;
    keep(desc, "async");
    return crpa.call(this, desc);
  };
});
await p.goto("http://localhost:3000/proto/hero", { waitUntil: "load" });
await p.waitForFunction(() => window.__heroBench?.hero?.arrival?.t > 1, null, { timeout: 120000, polling: 500 });
const info = await p.evaluate(() => {
  const pipes = window.__pipes.filter((x) => x.fragmentCode);
  pipes.sort((a, b) => b.fragmentCode.length - a.fragmentCode.length);
  const logo = pipes[0];
  window.__logoPipe = logo;
  return {
    count: window.__pipes.length,
    top: pipes.slice(0, 6).map((x) => ({ label: x.label, kind: x.kind, vLen: x.vertexCode?.length, fLen: x.fragmentCode.length })),
    vertex: logo.vertexCode,
    fragment: logo.fragmentCode,
  };
});
writeFileSync(`${OUT}/vertex.wgsl`, info.vertex);
writeFileSync(`${OUT}/fragment.wgsl`, info.fragment);
console.log(`pipelines created: ${info.count}; the largest fragment shaders:`);
for (const t of info.top) console.log(`  ${t.kind.padEnd(5)} vertex ${t.vLen} chars, fragment ${t.fLen} chars  ${t.label}`);
const time = (name, stage, edits) =>
  p.evaluate(
    async ([name, stage, edits, runs]) => {
      const L = window.__logoPipe;
      const dev = window.__device;
      const out = [];
      const gaps = [];
      for (let r = 0; r < runs; r++) {
        const salt = `\n// probe ${name} ${r} ${Math.random()}\n`;
        let v = L.vertexCode;
        let f = L.fragmentCode;
        for (const [find, replace] of edits) {
          const src = stage === "vertex" ? v : f;
          if (!src.includes(find)) return { name, error: `find text not in the shader: ${find.slice(0, 60)}` };
          if (stage === "vertex") v = v.split(find).join(replace);
          else f = f.split(find).join(replace);
        }
        const vm = dev.createShaderModule({ code: v + salt });
        const fm = dev.createShaderModule({ code: f + salt });
        // the page's frames during the compile: the longest gap between animation frames (does a BACKGROUND compile keep
        // the page moving?)
        let gap = 0;
        let lastF = performance.now();
        let watching = true;
        const watch = (t) => {
          gap = Math.max(gap, t - lastF);
          lastF = t;
          if (watching) requestAnimationFrame(watch);
        };
        requestAnimationFrame(watch);
        const t0 = performance.now();
        try {
          await dev.createRenderPipelineAsync({
            layout: "auto",
            vertex: { module: vm, entryPoint: L.vertexEntry, buffers: L.buffers },
            fragment: { module: fm, entryPoint: L.fragmentEntry, targets: L.targets },
            primitive: L.primitive,
            depthStencil: L.depthStencil,
            multisample: L.multisample,
          });
        } catch (e) {
          return { name, error: String(e).slice(0, 300) };
        }
        out.push(Math.round(performance.now() - t0));
        watching = false;
        gaps.push(Math.round(gap));
      }
      return { name, ms: out, longestFrameGapMs: gaps };
    },
    [name, stage, edits, +RUNS],
  );
console.log("COMPILE ON ITS OWN (createRenderPipelineAsync, cold each time):");
console.log("  " + JSON.stringify(await time("as captured", "fragment", [])));
for (const v of variants) console.log("  " + JSON.stringify(await time(v.name, v.stage, v.edits ?? [[v.find, v.replace]])));
await b.close();
console.log(`saved: ${OUT}/vertex.wgsl, ${OUT}/fragment.wgsl`);
console.log("⚠ Playwright's Chrome, fresh profile; the compile timed in isolation (not three's shader generation)");
