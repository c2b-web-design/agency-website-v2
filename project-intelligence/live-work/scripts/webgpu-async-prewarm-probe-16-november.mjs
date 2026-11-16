// DOES AN ASYNC COMPILE MAKE A LATER SYNC COMPILE FREE? (16 November 2026, session 2; D-101). A standalone WebGPU probe on
// a blank localhost page (no project code): a deliberately slow compute shader, compiled 3 ways in a FRESH profile, each
// with its own constant (no cross-hits): A — sync createComputePipeline cold; B — createComputePipelineAsync awaited, then a
// sync create from a FRESH module with the SAME code; C — B's async still in flight when the sync create is made. Each
// timed by the main thread's wait on a dispatch (onSubmittedWorkDone) and by the longest rAF gap. READ-ONLY.
// ⚠ NOT WATCHED: three's own descriptor (labels, layouts) — this proves Chrome's cache, not three's path; not Carl's Chrome.
import { chromium } from "playwright";
const b = await chromium.launch({ channel: "chrome", args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-webgpu"] });
const p = await b.newPage();
await p.goto("http://localhost:3000/robots.txt");
const r = await p.evaluate(async () => {
  const adapter = await navigator.gpu.requestAdapter();
  const device = await adapter.requestDevice();
  const code = (k) => {
    let body = "";
    for (let i = 0; i < 400; i++) body += `v = fract(sin(v * ${(1.0001 + i * 0.37 + k).toFixed(4)} + ${i}.0) * 43758.5453);\n`;
    return `@group(0) @binding(0) var<storage, read_write> o: array<f32>;\n@compute @workgroup_size(64) fn main(@builtin(global_invocation_id) id: vec3u) {\n var v = f32(id.x);\n${body} o[id.x] = v;\n}`;
  };
  const buf = device.createBuffer({ size: 256, usage: GPUBufferUsage.STORAGE });
  const bgl = device.createBindGroupLayout({ entries: [{ binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: "storage" } }] });
  const layout = device.createPipelineLayout({ bindGroupLayouts: [bgl] });
  const bg = device.createBindGroup({ layout: bgl, entries: [{ binding: 0, resource: { buffer: buf } }] });
  let gap = 0;
  let last = performance.now();
  let on = true;
  const tick = (t) => { gap = Math.max(gap, t - last); last = t; if (on) requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
  const syncRun = async (k) => {
    gap = 0;
    await new Promise((res) => setTimeout(res, 300));
    gap = 0;
    const t0 = performance.now();
    const pl = device.createComputePipeline({ layout, compute: { module: device.createShaderModule({ code: code(k) }), entryPoint: "main" } });
    const e = device.createCommandEncoder();
    const pass = e.beginComputePass();
    pass.setPipeline(pl);
    pass.setBindGroup(0, bg);
    pass.dispatchWorkgroups(1);
    pass.end();
    device.queue.submit([e.finish()]);
    await device.queue.onSubmittedWorkDone();
    const ms = performance.now() - t0;
    await new Promise((res) => setTimeout(res, 100));
    return { waitMs: Math.round(ms), worstFrameMs: Math.round(gap) };
  };
  const out = {};
  out.A_sync_cold = await syncRun(1);
  {
    const t0 = performance.now();
    await device.createComputePipelineAsync({ layout, compute: { module: device.createShaderModule({ code: code(2) }), entryPoint: "main" } });
    out.B_async_ms = Math.round(performance.now() - t0);
    out.B_async_worstFrameMs = Math.round(gap);
    out.B_sync_after = await syncRun(2);
  }
  {
    device.createComputePipelineAsync({ layout, compute: { module: device.createShaderModule({ code: code(3) }), entryPoint: "main" } });
    out.C_sync_while_async = await syncRun(3);
  }
  out.A_again_same_code = await syncRun(1);
  on = false;
  return out;
});
console.log(JSON.stringify(r, null, 1));
console.log("⚠ Chrome's cache with a plain descriptor; three's path not exercised; Playwright's Chrome, not Carl's.");
await b.close();
