// WHAT IS BUILT WHEN — THE FIRST-RUN HITCHES' CAUSES (16 November 2026; D-101). Carl: "Yes, fix them now." A FRESH browser
// (an empty shader cache), the bench LIVE: the renderer's pipeline lookups (`_pipelines.getForRender` / `getForCompute`)
// are wrapped and TIMED; every call slower than 5 ms is logged with the object's name, the material's type and name, and
// the story's clock (and the rain's). Every frame over 50 ms is listed on the same clock. READ-ONLY.
// ⚠ NOT WATCHED: GPU-process work that stalls a LATER submit (it shows in the frame times, not against a lookup); r185
// internals (`_pipelines`) — a private surface, used for diagnosis only.
import { chromium } from "playwright";
const [UNTIL = "drops+5"] = process.argv.slice(2);
const b = await chromium.launch({ channel: "chrome", args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-webgpu"] });
const p = await b.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
await p.addInitScript(() => {
  window.__log = [];
  window.__frames = [];
  const clock = () => {
    const h = window.__heroBench?.hero;
    const r = h?.rainInfo;
    return { story: h?.arrival?.t ?? -1, drops: r && r.t >= 0 ? Math.round((r.t - r.leadS) * 100) / 100 : null };
  };
  let wrapped = false;
  let last = 0;
  const tick = (t) => {
    const r = window.__heroBench?.renderer;
    if (r && !wrapped && r._pipelines) {
      wrapped = true;
      // every place a first draw can spend time: the render object (its node build), the node builder, the pipeline
      // lookup, and the backend's program / pipeline creation
      const wrap = (obj, key, kind, describe) => {
        const f = obj[key].bind(obj);
        obj[key] = (...a) => {
          const t0 = performance.now();
          const out = f(...a);
          const ms = performance.now() - t0;
          if (ms > 5) window.__log.push({ ms: Math.round(ms), kind, ...describe(...a), ...clock() });
          return out;
        };
      };
      const ro = (x) => ({ object: x?.object?.name || x?.object?.type, material: `${x?.material?.type ?? ""}${x?.material?.name ? " " + x.material.name : ""}` });
      wrap(r._objects, "get", "objects.get", (object, material) => ({ object: object?.name || object?.type, material: `${material?.type ?? ""}` }));
      wrap(r._nodes, "getForRender", "nodes.getForRender", ro);
      wrap(r._nodes, "getForCompute", "nodes.getForCompute", (n) => ({ object: n?.name || "(compute)" }));
      wrap(r._pipelines, "getForRender", "pipelines.getForRender", ro);
      wrap(r._pipelines, "getForCompute", "pipelines.getForCompute", (n) => ({ object: n?.name || "(compute)" }));
      wrap(r.backend, "createProgram", "backend.createProgram", (st) => ({ object: `${st?.stage} ${st?.name ?? ""}` }));
      wrap(r.backend, "createRenderPipeline", "backend.createRenderPipeline", (x) => ro(x));
      wrap(r.backend, "createComputePipeline", "backend.createComputePipeline", (pl) => ({ object: pl?.computeProgram?.name ?? "(compute)" }));
    }
    if (last && t - last > 50) window.__frames.push({ ms: Math.round(t - last), ...clock() });
    last = t;
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
});
await p.goto("http://localhost:3000/proto/hero", { waitUntil: "load" });
await p.waitForFunction(() => window.__heroBench?.hero?.rainInfo, null, { timeout: 90000 });
const after = +UNTIL.split("+")[1];
await p.waitForFunction((after) => {
  const r = window.__heroBench.hero.rainInfo;
  return r && r.t - r.leadS > after;
}, after, { timeout: 120000, polling: 500 });
const { log, frames } = await p.evaluate(() => ({ log: window.__log, frames: window.__frames }));
await b.close();
console.log("SLOW PIPELINE LOOKUPS (> 5 ms):");
for (const l of log) console.log(`  ${String(l.ms).padStart(5)} ms  ${l.kind.padEnd(30)} story ${l.story}${l.drops !== null ? ` drops ${l.drops}` : ""}  ${l.object}  [${l.material ?? ""}]`);
console.log("FRAMES > 50 ms:");
for (const f of frames) console.log(`  ${String(f.ms).padStart(5)} ms  story ${f.story}${f.drops !== null ? ` drops ${f.drops}` : ""}`);
console.log("⚠ a fresh profile (empty shader cache); Playwright's Chrome; r185's private _pipelines wrapped for diagnosis");
