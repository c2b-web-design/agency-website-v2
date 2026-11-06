import { chromium } from "file:///C:/Users/Carl%20Buckley/agency-website-v2/node_modules/playwright/index.mjs";
const [BASE = "http://localhost:3000", MEDIUM = "webgl"] = process.argv.slice(2);
const b = await chromium.launch({ headless: false, args: ["--enable-gpu","--use-angle=default","--ignore-gpu-blocklist","--enable-unsafe-webgpu"] });
const ctx = await b.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
await ctx.addInitScript(() => (window.__benchNoBuilderTake = true));
const p = await ctx.newPage();
const t0 = Date.now();
await p.goto(`${BASE}/proto/camera?blank=1&bricks=1${MEDIUM === "webgpu" ? "&medium=webgpu" : ""}`, { waitUntil: "networkidle" });
await p.waitForFunction(() => document.querySelector("[data-camera-bench]")?.getAttribute("data-camera-bench") !== "pending", null, { timeout: 90000 });
const drawn = Date.now() - t0;
await p.waitForFunction(() => !!window.__bricksLive, null, { timeout: 30000 });
await p.waitForTimeout(3000);
const r = await p.evaluate(() => {
  const { scene, gl } = window.__bricksLive;
  // Slop New York's rule (js/main.js precompileShaders): visible meshes/lines/points; an instanced or multi-material mesh is
  // a job of its own; plain meshes sharing a material share one job
  const jobs = []; const byMat = new Map(); let inst = 0, plain = 0, instances = 0; const mats = new Set();
  scene.traverseVisible((o) => {
    if (!o.isMesh && !o.isLine && !o.isPoints && !o.isSprite) return;
    [o.material].flat().forEach((m) => m && mats.add(m));
    if (o.isInstancedMesh || Array.isArray(o.material)) { jobs.push([o]); if (o.isInstancedMesh) { inst++; instances += o.count; } return; }
    plain++;
    let j = byMat.get(o.material); if (!j) { j = []; byMat.set(o.material, j); jobs.push(j); } j.push(o);
  });
  const info = gl.info || {};
  const programsWebGL = Array.isArray(info.programs) ? info.programs.length : null;
  const programsWebGPU = info.memory ? info.memory.programs : null;
  const pipelines = gl._pipelines?.caches?.size ?? null;
  return { batches: jobs.length, instancedMeshes: inst, brickInstances: instances, plainMeshes: plain, materials: mats.size, programsWebGL, programsWebGPU, pipelines };
});
console.log(JSON.stringify({ medium: MEDIUM, benchDrawnMs: drawn, ...r }));
await b.close();
