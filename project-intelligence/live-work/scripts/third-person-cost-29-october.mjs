/** THE THIRD-PERSON VIEW — THE COST (the plan `plan-third-person-view-29-october.md` v1.2, the checkpoint). Measures the WORK,
 *  not the frame interval: the render callback's CPU time always; its draws' GPU time by EXT_disjoint_timer_query_webgl2
 *  where the extension exists (the bench's dev-only `__benchCost` instrument); and, as the cross-check, DROPPED FRAMES
 *  against the screen's MEASURED refresh (the median animation-frame interval over 2 s idle). 10 s of play in first person,
 *  then 10 s in third. ⛔ The WebGL RENDERER is recorded beside every number; a SOFTWARE renderer is a FAILED MEASUREMENT.
 *    node …/third-person-cost-29-october.mjs <base>
 *  PASS LINE (stated in the plan before measuring): third person's p95 GPU time (CPU without the extension) ≤ half the
 *  measured refresh interval, AND third person drops no more frames than first person (± 1 point). Over either: reported
 *  for Carl's eye, never passed silently. ⚠ Without timer queries the CPU time UNDERSTATES the draws (gl.render returns
 *  before the GPU has done the work): then the dropped-frames comparison carries the verdict (the Architect, plan review 3).
 *  ⚠ NOT WATCHED: Carl's own Chrome (check its GPU path); production (the dev server's CPU cost is higher). */
import { chromium } from "playwright";

const BASE = process.argv[2] ?? "http://localhost:3000";
const samples = (secs, a, b) => {
  const n = Math.round(secs * 60);
  return Array.from({ length: n + 1 }, (_, i) => [i / 60, a + ((b - a) * i) / n, 0.05 * (i / n), 1 - 0.2 * (i / n), 4 * (i / n), -2 * (i / n), 30]);
};
const clip = (id, cam, start, order, secs, a, b) => ({ id, cam, start, order, in: 0, out: samples(secs, a, b).at(-1)[0], samples: samples(secs, a, b) });
// 24 s: two cameras moving across the whole of it
const CHAIN = { kind: "c2b-camera-chain", version: 3, tracks: [1, 2], units: null, refined: null, comp: null, migrations: [],
  clips: [clip("A", 1, 0, 0, 24, 0, 0.3), clip("B", 2, 4, 1, 16, -0.2, -0.1)] };
const br = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const ctx = await br.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
await ctx.addInitScript(() => (window.__benchNoBuilderTake = true));
const p = await ctx.newPage();
await p.goto(`${BASE}/proto/camera`, { waitUntil: "networkidle" });
await p.evaluate((c) => {
  localStorage.clear();
  localStorage.setItem("c2b-camera-bench-chain-v3", c);
  localStorage.setItem("c2b-camera-bench-eye-v1", JSON.stringify({ x: -1700, y: 1500, z: 3700, yaw: -35, pitch: -25, fov: 50 }));
}, JSON.stringify(CHAIN));
await p.reload({ waitUntil: "networkidle" });
await p.addStyleTag({ content: "nextjs-portal{display:none!important}" });
await p.waitForSelector('[data-camera-bench="drawn"]', { timeout: 60000 });
await p.waitForTimeout(2000);
const intervals = (ms) => p.evaluate((ms) => new Promise((done) => {
  const out = [];
  let last = performance.now();
  const end = last + ms;
  const step = (t) => {
    out.push(t - last);
    last = t;
    if (t < end) requestAnimationFrame(step);
    else done(out.slice(1));
  };
  requestAnimationFrame(step);
}), ms);
const q = (a, f) => (a.length ? [...a].sort((x, y) => x - y)[Math.min(a.length - 1, Math.floor(f * a.length))] : NaN);
const idle = await intervals(2000);
const refresh = q(idle, 0.5);
console.log(`refresh: ${refresh.toFixed(2)} ms (${(1000 / refresh).toFixed(0)} Hz), the median of ${idle.length} idle intervals`);
const result = {};
for (const view of ["first", "third"]) {
  if (view === "third") {
    await p.keyboard.press("KeyT");
    await p.waitForTimeout(800);
  }
  await p.keyboard.press("Home");
  await p.waitForTimeout(500);
  await p.evaluate(() => (window.__benchCost = { cpu: [], gpu: [], disjoint: 0, pending: [] }));
  await p.keyboard.press("KeyP");
  const iv = await intervals(10000);
  await p.keyboard.press("KeyP");
  const c = await p.evaluate(() => {
    const k = window.__benchCost;
    window.__benchCost = undefined;
    return { renderer: k.renderer, ext: k.ext, cpu: k.cpu, gpu: k.gpu, disjoint: k.disjoint, view: window.__cameraBench.view };
  });
  const dropped = iv.filter((x) => x > refresh * 1.5).length;
  result[view] = { ...c, frames: iv.length, dropped, droppedPct: (100 * dropped) / iv.length };
  console.log(`${view} person (the bench says "${c.view}"): renderer "${c.renderer}", timer queries ${c.ext ? "PRESENT" : "ABSENT"}`);
  console.log(`  CPU render callback: p50 ${q(c.cpu, 0.5).toFixed(3)} ms, p95 ${q(c.cpu, 0.95).toFixed(3)} ms over ${c.cpu.length} frames`);
  if (c.ext) console.log(`  GPU draws: p50 ${q(c.gpu, 0.5).toFixed(3)} ms, p95 ${q(c.gpu, 0.95).toFixed(3)} ms over ${c.gpu.length} queries (${c.disjoint} disjoint, discarded)`);
  console.log(`  dropped frames: ${dropped} of ${iv.length} (${result[view].droppedPct.toFixed(2)}%) — intervals over 1.5 × the refresh`);
}
const t = result.third, f = result.first;
const software = /swiftshader|warp|llvmpipe|software|microsoft basic/i.test(t.renderer ?? "");
if (software) console.log(`\nVERDICT ✖ FAILED MEASUREMENT — a SOFTWARE renderer ("${t.renderer}"): these numbers say nothing about the GPU`);
else {
  const work = t.ext ? q(t.gpu, 0.95) : q(t.cpu, 0.95);
  const okWork = work <= refresh / 2;
  const okDrop = t.droppedPct <= f.droppedPct + 1;
  console.log(`\nPASS LINE 1 — third person's p95 ${t.ext ? "GPU" : "CPU (⚠ understates the draws)"} time ${work.toFixed(3)} ms ≤ half the refresh ${(refresh / 2).toFixed(2)} ms: ${okWork ? "✔" : "✖"}`);
  console.log(`PASS LINE 2 — third person drops ${t.droppedPct.toFixed(2)}% ≤ first person's ${f.droppedPct.toFixed(2)}% + 1: ${okDrop ? "✔" : "✖"}`);
  console.log(`VERDICT ${okWork && okDrop ? "✔ WITHIN THE PASS LINES" : "✖ OVER A PASS LINE — the numbers go to Carl's eye"}${t.ext ? "" : " (⚠ no timer queries: line 2 carries the verdict)"}`);
}
console.log("⚠ NOT WATCHED: Carl's own Chrome (check its GPU path first); production (the dev server's CPU cost is higher).");
await br.close();
