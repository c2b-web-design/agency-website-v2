// THE FIRST-FRAME FREEZE: WHAT THE SCENE's FIRST FRAME BUILDS, AND WHEN THE SCREEN STOPS (28 November 2026; D-101). Carl:
// "Proceed with Option A" (the first frame's programs built asynchronously before it is drawn). READ-ONLY: measures.
// A FRESH browser (an empty shader cache: a first-time visitor), then a RELOAD in it (a return visit), the bench at Carl's window (1896 x 946, DPR 1), argv[2] the
// base (default the dev server), argv[3] a query. On ONE clock (performance.now, 0 = navigation): the scene's marks
// ("hero:*"), every renderer.render / compileAsync call (the first few), every pipeline / program build over 3 ms (r185's
// private surface, wrapped), every rAF gap over 40 ms, and every SCREENCAST gap over 40 ms (CDP; the compositor's frames —
// the freeze Carl sees, which a blocked script thread alone does not cause).
// ⚠ NOT WATCHED: past argv[4] ms (default 6000); production (unless argv[2] is one); other browsers; the GPU process's own
// timeline (a stall there shows only as a screencast gap).
import { chromium } from "playwright";
const [BASE = "http://localhost:3000", QUERY = "", UNTIL = "6000"] = process.argv.slice(2);
const b = await chromium.launch({ channel: "chrome", args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-webgpu", "--hide-scrollbars"], headless: false });
const p = await b.newPage({ viewport: { width: 1896, height: 946 }, deviceScaleFactor: 1 });
await p.addInitScript(() => {
  window.__ev = [];
  const ev = (kind, what, ms) => window.__ev.push({ t: Math.round(performance.now()), kind, what, ms: ms === undefined ? undefined : Math.round(ms) });
  let wrapped = false;
  let last = 0;
  const tick = (t) => {
    const r = window.__heroBench?.renderer;
    if (r && !wrapped && r._pipelines) {
      wrapped = true;
      ev("wrap", "the renderer wrapped");
      const wrap = (obj, key, kind, describe, min = 3) => {
        const f = obj[key].bind(obj);
        obj[key] = (...a) => {
          const t0 = performance.now();
          const out = f(...a);
          const ms = performance.now() - t0;
          if (ms > min) ev(kind, describe(...a), ms);
          return out;
        };
      };
      const ro = (x) => `${x?.object?.name || x?.object?.type} [${x?.material?.type ?? ""}${x?.material?.name ? " " + x.material.name : ""}]`;
      wrap(r._nodes, "getForRender", "nodes.getForRender", ro);
      wrap(r._pipelines, "getForRender", "pipelines.getForRender", ro);
      wrap(r._pipelines, "getForCompute", "pipelines.getForCompute", (n) => n?.name || "(compute)");
      wrap(r.backend, "createProgram", "backend.createProgram", (st) => `${st?.stage} ${st?.name ?? ""}`);
      wrap(r.backend, "createRenderPipeline", "backend.createRenderPipeline", ro);
      wrap(r.backend, "createComputePipeline", "backend.createComputePipeline", (pl) => pl?.computeProgram?.name ?? "(compute)");
      let renders = 0;
      const render = r.render.bind(r);
      r.render = (...a) => {
        const t0 = performance.now();
        const out = render(...a);
        renders++;
        if (renders <= 3) ev("render", `render #${renders}`, performance.now() - t0);
        return out;
      };
      const ca = r.compileAsync.bind(r);
      r.compileAsync = (...a) => {
        const t0 = performance.now();
        ev("compileAsync", "called");
        const out = ca(...a);
        ev("compileAsync", "gather (sync part)", performance.now() - t0);
        out.then(() => ev("compileAsync", "resolved", performance.now() - t0));
        return out;
      };
    }
    if (last && t - last > 40) ev("raf-gap", "rAF gap", t - last);
    last = t;
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
});
for (const run of ["cold", "reload"]) {
const cdp = await p.context().newCDPSession(p);
const shots = [];
cdp.on("Page.screencastFrame", async (f) => {
  shots.push(f.metadata.timestamp);
  await cdp.send("Page.screencastFrameAck", { sessionId: f.sessionId }).catch(() => {});
});
await cdp.send("Page.startScreencast", { format: "jpeg", quality: 30, everyNthFrame: 1, maxWidth: 474, maxHeight: 236 });
if (run === "cold") await p.goto(`${BASE}/proto/hero${QUERY}`, { waitUntil: "load" });
else await p.reload({ waitUntil: "load" });
await p.waitForFunction((u) => performance.now() > u, +UNTIL, { timeout: 120000, polling: 200 });
await cdp.send("Page.stopScreencast");
await cdp.detach();
const out = await p.evaluate(() => ({
  timeOrigin: performance.timeOrigin,
  ev: window.__ev,
  marks: performance.getEntriesByType("mark").filter((m) => m.name.startsWith("hero:")).map((m) => ({ t: Math.round(m.startTime), kind: "mark", what: m.name })),
  paint: performance.getEntriesByType("paint").map((m) => ({ t: Math.round(m.startTime), kind: "paint", what: m.name })),
  load: window.__heroBench?.hero?.loadTimes,
  opening: window.__heroBench?.hero?.openingInfo,
}));
const gaps = [];
for (let i = 1; i < shots.length; i++) {
  const ms = (shots[i] - shots[i - 1]) * 1000;
  if (ms > 40) gaps.push({ t: Math.round(shots[i - 1] * 1000 - out.timeOrigin), kind: "SCREENCAST-GAP", what: "no compositor frame", ms: Math.round(ms) });
}
console.log(`
===== ${run.toUpperCase()} =====`);
const all = [...out.paint, ...out.marks, ...out.ev, ...gaps].sort((a, b) => a.t - b.t);
for (const e of all) console.log(`${String(e.t).padStart(6)} ms  ${e.kind.padEnd(30)} ${e.ms !== undefined ? String(e.ms).padStart(5) + " ms  " : "          "}${e.what}`);
console.log("loadTimes", JSON.stringify(out.load));
console.log("opening", JSON.stringify(out.opening));
console.log(`screencast frames: ${shots.length}`);
}
await b.close();
console.log("⚠ load 1 a fresh profile (empty shader cache), then a RELOAD in the same browser; Playwright's Chrome; r185's private surface wrapped for diagnosis; NOT WATCHED: the GPU process's own timeline");
