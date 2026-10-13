/** WHAT IS THE 1.6 s FREEZE WHEN SCROLLING UP FROM A DIRECT `#start` LOAD? (13 October 2026.) `/about#start`, wait for the
 *  gold button's swap + 2 s, note whether `room:precompiled` was marked, then a CPU profile from the scroll to the top for
 *  2.5 s: the long tasks, and self time by function inside the longest burst; blocking WebGL calls timed in the page.
 *  ⚠ NOT WATCHED: GPU time; Carl's Chrome. */
import { chromium } from "playwright";
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
await ctx.addInitScript(() => {
  const S = (window.__f = { gl: [], long: [] });
  try { new PerformanceObserver((l) => l.getEntries().forEach((e) => S.long.push([e.startTime, e.duration]))).observe({ type: "longtask", buffered: true }); } catch {}
  for (const P of [WebGLRenderingContext.prototype, WebGL2RenderingContext.prototype])
    for (const n of ["getProgramInfoLog", "getProgramParameter", "getShaderInfoLog", "getUniformLocation", "linkProgram", "compileShader", "texImage2D", "texSubImage2D", "bufferData", "readPixels", "generateMipmap", "blitFramebuffer", "getActiveUniform", "getAttribLocation", "useProgram"]) {
      const f = P[n]; P[n] = function (...a) { const t = performance.now(); const r = f.apply(this, a); const d = performance.now() - t; if (d > 2) S.gl.push([t, n, d]); return r; };
    }
});
const p = await ctx.newPage();
await p.goto("http://localhost:3000/about#start", { waitUntil: "load" });
await p.mouse.move(5, 5);
await p.waitForFunction(() => document.querySelector('#start a[href="/start"]')?.dataset.drawn === "1", null, { timeout: 60000 });
await p.waitForTimeout(2000);
const marks = await p.evaluate(() => performance.getEntriesByName("room:precompiled").map((m) => (m.startTime / 1000).toFixed(2) + " s"));
console.log(`room:precompiled marks before the scroll: ${marks.join(", ") || "NONE"}`);
const cdp = await ctx.newCDPSession(p);
await cdp.send("Profiler.enable"); await cdp.send("Profiler.setSamplingInterval", { interval: 200 }); await cdp.send("Profiler.start");
const t0 = await p.evaluate(() => { const t = performance.now(); window.scrollTo(0, 0); return t; });
await p.waitForTimeout(2500);
const { profile } = await cdp.send("Profiler.stop");
const F = await p.evaluate(() => window.__f);
await b.close();
console.log("long tasks after the scroll: " + F.long.filter(([s]) => s >= t0).map(([s, d]) => `+${((s - t0) / 1000).toFixed(2)}s ${d.toFixed(0)}ms`).join(", "));
const glSum = new Map(); for (const [s, n, d] of F.gl) if (s >= t0) { const e = glSum.get(n) ?? [0, 0, 0]; e[0]++; e[1] += d; e[2] = Math.max(e[2], d); glSum.set(n, e); }
console.log("WebGL calls over 2 ms after the scroll: " + ([...glSum].map(([n, [c, s, m]]) => `${n} ×${c} ${s.toFixed(0)}ms (max ${m.toFixed(0)})`).join(" · ") || "none"));
const byId = new Map(profile.nodes.map((n) => [n.id, n]));
const self = new Map(); profile.samples.forEach((id, i) => self.set(id, (self.get(id) ?? 0) + (profile.timeDeltas[i] ?? 0)));
const byFn = new Map();
for (const [id, us] of self) { const cf = byId.get(id).callFrame; if (cf.functionName === "(idle)") continue; const k = `${cf.functionName || "(anonymous)"}  ${(cf.url || "native").replace(/^.*\/chunks\//, "").slice(-45)}:${cf.lineNumber + 1}`; byFn.set(k, (byFn.get(k) ?? 0) + us); }
console.log("SELF TIME after the scroll (top 20):\n" + [...byFn].sort((a, b) => b[1] - a[1]).slice(0, 20).map(([k, us]) => `${(us / 1000).toFixed(0).padStart(5)} ms  ${k}`).join("\n"));
