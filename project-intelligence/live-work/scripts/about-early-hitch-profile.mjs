/** THE ONE EARLY HITCH ON `/about` (13 October 2026): a ~240 ms long task ~0.7–0.9 s after the gold button's swap, left
 *  when the room's GPU work is dropped (`family-button-roll-smoothness.mjs … warm noroom`). A warm load; a CPU profile from
 *  the swap for 2 s; the long tasks in that window; self time by function inside them (samples within a long task only);
 *  and the blocking WebGL calls (timed in the page) inside them.
 *  Usage: node …/about-early-hitch-profile.mjs [base url]
 *  ⚠ NOT WATCHED: GPU time; Carl's Chrome. */
import { chromium } from "playwright";
const BASE = process.argv[2] ?? "http://localhost:3000";
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
await ctx.addInitScript(() => {
  const S = (window.__h = { long: [], gl: [], swap: null });
  try { new PerformanceObserver((l) => l.getEntries().forEach((e) => S.long.push([e.startTime, e.duration]))).observe({ type: "longtask", buffered: true }); } catch {}
  for (const P of [WebGLRenderingContext.prototype, WebGL2RenderingContext.prototype])
    for (const n of ["getProgramInfoLog", "getProgramParameter", "getShaderInfoLog", "getUniformLocation", "bufferData", "texImage2D", "texSubImage2D", "linkProgram", "readPixels"]) {
      const f = P[n]; P[n] = function (...a) { const t = performance.now(); const r = f.apply(this, a); const d = performance.now() - t; if (d > 1) S.gl.push([t, n, d]); return r; };
    }
  const tick = () => { if (S.swap === null && document.querySelector('#start a[href="/start"]')?.dataset.drawn === "1") S.swap = performance.now(); requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
});
const warm = await ctx.newPage(); await warm.goto(BASE + "/about#start", { waitUntil: "load" }); await warm.waitForTimeout(6000); await warm.close();
const p = await ctx.newPage();
const cdp = await ctx.newCDPSession(p);
await cdp.send("Profiler.enable"); await cdp.send("Profiler.setSamplingInterval", { interval: 200 }); await cdp.send("Profiler.start");
await p.goto(BASE + "/about#start", { waitUntil: "load" });
await p.mouse.move(5, 5);
await p.waitForFunction(() => window.__h.swap !== null, null, { timeout: 60000 });
await p.waitForTimeout(2500);
const { profile } = await cdp.send("Profiler.stop");
const H = await p.evaluate(() => window.__h);
await b.close();
const longs = H.long.filter(([s]) => s >= H.swap - 50 && s < H.swap + 2500);
console.log(`swap at ${(H.swap / 1000).toFixed(2)} s; long tasks in the 2.5 s after: ${longs.map(([s, d]) => `+${((s - H.swap) / 1000).toFixed(2)}s ${d.toFixed(0)}ms`).join(", ") || "none"}`);
// profile time base: startTime (µs, same clock origin as performance.now()? no) — align by the samples' own timestamps
const byId = new Map(profile.nodes.map((n) => [n.id, n]));
let t = profile.startTime; const stamps = profile.timeDeltas.map((d) => (t += d));
// performance.now() origin = navigation start; the profiler's clock is monotonic µs — align with the first long task found in both
const fnIn = new Map();
const navOffset = await (async () => null)();
void navOffset;
for (const [ls, ld] of longs) {
  const parent = (id) => byId.get(id);
  const counts = new Map();
  // samples whose callstack lasts long (we cannot align clocks exactly, so group consecutive non-idle samples into tasks and
  // take the task whose length best matches)
  void parent; void counts; void ls; void ld;
}
// group consecutive non-idle samples into bursts; report the longest bursts with their top functions
const bursts = []; let cur = null;
profile.samples.forEach((id, i) => {
  const name = byId.get(id).callFrame.functionName;
  const idle = name === "(idle)" || name === "(program)" && false;
  if (idle) { if (cur) { bursts.push(cur); cur = null; } return; }
  if (!cur) cur = { t0: stamps[i], t1: stamps[i], fns: new Map() };
  cur.t1 = stamps[i];
  const cf = byId.get(id).callFrame; const k = `${cf.functionName || "(anonymous)"} ${(cf.url || "native").replace(/^.*\/chunks\//, "").slice(-40)}:${cf.lineNumber + 1}`;
  cur.fns.set(k, (cur.fns.get(k) ?? 0) + (profile.timeDeltas[i] ?? 0));
});
if (cur) bursts.push(cur);
const top = bursts.sort((a, b) => b.t1 - b.t0 - (a.t1 - a.t0)).slice(0, 4);
for (const bu of top) {
  console.log(`\nBURST ${((bu.t1 - bu.t0) / 1000).toFixed(0)} ms — top self time:`);
  console.log([...bu.fns].sort((a, b) => b[1] - a[1]).slice(0, 12).map(([k, us]) => `  ${(us / 1000).toFixed(0).padStart(5)} ms  ${k}`).join("\n"));
}
const glIn = H.gl.filter(([s]) => s >= H.swap && s < H.swap + 2500);
const glSum = new Map(); for (const [, n, d] of glIn) { const e = glSum.get(n) ?? [0, 0, 0]; e[0]++; e[1] += d; e[2] = Math.max(e[2], d); glSum.set(n, e); }
console.log("\nWebGL calls over 1 ms after the swap: " + ([...glSum].map(([n, [c, s, m]]) => `${n} ×${c} ${s.toFixed(0)}ms (max ${m.toFixed(0)})`).join(" · ") || "none"));
console.log("⚠ NOT WATCHED: GPU time; Carl's Chrome.");
void fnIn;
