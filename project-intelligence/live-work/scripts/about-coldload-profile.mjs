/** WHAT HOLDS `/about` ON A COLD LOAD (13 October 2026 — Carl: "the start a conversation button there is a delay before it
 *  start to move"). A CPU profile (CDP Profiler) from navigation to the gold button's swap (data-drawn = 1), loading
 *  straight to §4. Reports self time by function (top 25) and by source file, and the WebGL calls that block (link, compile,
 *  texture uploads) counted and timed from inside the page.
 *  Usage: node …/about-coldload-profile.mjs [base url] [path] [warm]   (default http://localhost:3000 /about#start)
 *  ⚠ NOT WATCHED: GPU-side time (only what the main thread waits for); production minification (names are dev's). */
import { chromium } from "playwright";
const BASE = process.argv[2] ?? "http://localhost:3000";
const PATH = process.argv[3] ?? "/about#start";
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
await ctx.addInitScript(() => {
  const T = (window.__gl = {});
  const wrap = (proto, names) => names.forEach((n) => {
    const f = proto[n]; if (typeof f !== "function") return;
    proto[n] = function (...a) { const t = performance.now(); try { return f.apply(this, a); } finally { const d = performance.now() - t; const e = (T[n] ??= { n: 0, ms: 0, max: 0 }); e.n++; e.ms += d; e.max = Math.max(e.max, d); } };
  });
  for (const P of [WebGLRenderingContext.prototype, WebGL2RenderingContext.prototype])
    wrap(P, ["linkProgram", "compileShader", "getProgramParameter", "getShaderParameter", "getProgramInfoLog", "texImage2D", "texSubImage2D", "texStorage2D", "generateMipmap", "readPixels", "getError"]);
});
// ?warm: one load first, unprofiled, so the GPU shader cache is warm (13 October: the cold load is ~6.3 s, every load after
// ~2.7 s — the 3.7 s in getProgramInfoLog was the first compile, about-shadercheck-experiment.mjs).
if (process.argv.includes("warm")) { const w = await ctx.newPage(); await w.goto(BASE + PATH, { waitUntil: "load" }); await w.waitForFunction(() => document.querySelector('#start a[href="/start"]')?.dataset.drawn === "1", null, { timeout: 60000 }); await w.close(); }
const p = await ctx.newPage();
const cdp = await ctx.newCDPSession(p);
await cdp.send("Profiler.enable");
await cdp.send("Profiler.setSamplingInterval", { interval: 500 });
await cdp.send("Profiler.start");
const t0 = Date.now();
await p.goto(BASE + PATH, { waitUntil: "load" });
await p.waitForFunction(() => document.querySelector('#start a[href="/start"]')?.dataset.drawn === "1", null, { timeout: 60000 });
const swap = await p.evaluate(() => performance.now());
const { profile } = await cdp.send("Profiler.stop");
const gl = await p.evaluate(() => window.__gl);
await b.close();

const byId = new Map(profile.nodes.map((n) => [n.id, n]));
const self = new Map();
const dt = profile.timeDeltas;
profile.samples.forEach((id, i) => self.set(id, (self.get(id) ?? 0) + (dt[i] ?? 0)));
const byFn = new Map(), byFile = new Map();
for (const [id, us] of self) {
  const n = byId.get(id), cf = n.callFrame;
  const file = (cf.url || "(native / " + cf.functionName + ")").replace(/^.*\/_next\/static\/chunks\//, "chunk:").replace(/\?.*$/, "").slice(-70);
  const fn = `${cf.functionName || "(anonymous)"}  ${file}:${cf.lineNumber + 1}`;
  byFn.set(fn, (byFn.get(fn) ?? 0) + us);
  byFile.set(file, (byFile.get(file) ?? 0) + us);
}
const top = (m, k) => [...m].sort((a, b) => b[1] - a[1]).slice(0, k).map(([name, us]) => `${(us / 1000).toFixed(0).padStart(6)} ms  ${name}`).join("\n");
console.log(`navigation → the gold button's swap: ${(swap / 1000).toFixed(2)} s (wall ${((Date.now() - t0) / 1000).toFixed(1)} s)\n`);
console.log("SELF TIME BY FUNCTION (top 25):\n" + top(byFn, 25));
console.log("\nSELF TIME BY FILE (top 12):\n" + top(byFile, 12));
console.log("\nBLOCKING WebGL CALLS (main thread):");
for (const [n, e] of Object.entries(gl).sort((a, b) => b[1].ms - a[1].ms)) console.log(`  ${n.padEnd(20)} ×${String(e.n).padStart(5)}  ${e.ms.toFixed(0).padStart(6)} ms total, longest ${e.max.toFixed(0)} ms`);
console.log("\n⚠ NOT WATCHED: GPU-side time; production names (dev build).");
