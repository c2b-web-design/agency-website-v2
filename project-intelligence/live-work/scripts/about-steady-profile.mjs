/** WHAT RUNS ON `/about` WHILE THE GOLD BUTTON ROLLS (13 October 2026). A warm load to §4; a CPU profile of a steady
 *  window (4–8 s after the swap); self time by function, the room canvas's and the button's draw calls per second, and the
 *  duration of each frame's main-thread work (frames over 20 ms listed). The roll measured a 50 ms frame every ~0.38 s
 *  with no long task behind it (`family-button-roll-smoothness.mjs … warm`).
 *  Usage: node …/about-steady-profile.mjs [base url]
 *  ⚠ NOT WATCHED: GPU time per frame (only inferred from frame gaps); Carl's Chrome. */
import { chromium } from "playwright";
const BASE = process.argv[2] ?? "http://localhost:3000";
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
await ctx.addInitScript(() => {
  const R = (window.__s = { draws: {}, work: [], swap: null });
  const orig = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function (type, ...rest) {
    const c = orig.call(this, type, ...rest);
    if (/webgl/.test(type) && c && !c.__w) {
      c.__w = true; const cv = c.canvas;
      for (const fn of ["drawElements", "drawArrays"]) { const f = c[fn]; c[fn] = function (...a) { const k = cv.closest("#start") ? "button" : "room"; R.draws[k] = (R.draws[k] ?? 0) + 1; return f.apply(this, a); }; }
    }
    return c;
  };
  const raf = window.requestAnimationFrame.bind(window);
  window.requestAnimationFrame = (cb) => raf((t) => { const s = performance.now(); cb(t); const d = performance.now() - s; if (d > 2) R.work.push([t, d]); });
  const tick = () => { if (R.swap === null && document.querySelector('#start a[href="/start"]')?.dataset.drawn === "1") R.swap = performance.now(); raf(tick); };
  raf(tick);
});
const warm = await ctx.newPage(); await warm.goto(BASE + "/about#start", { waitUntil: "load" }); await warm.waitForTimeout(6000); await warm.close();
const p = await ctx.newPage();
await p.goto(BASE + "/about#start", { waitUntil: "load" });
await p.mouse.move(5, 5);
await p.waitForFunction(() => window.__s.swap !== null, null, { timeout: 60000 });
await p.waitForTimeout(4000);
const cdp = await ctx.newCDPSession(p);
await cdp.send("Profiler.enable"); await cdp.send("Profiler.setSamplingInterval", { interval: 250 }); await cdp.send("Profiler.start");
const d0 = await p.evaluate(() => ({ ...window.__s.draws, t: performance.now() }));
await p.waitForTimeout(4000);
const d1 = await p.evaluate(() => ({ ...window.__s.draws, t: performance.now() }));
const { profile } = await cdp.send("Profiler.stop");
const work = await p.evaluate(([a, z]) => window.__s.work.filter(([t]) => t >= a && t <= z), [d0.t, d1.t]);
await b.close();
const secs = (d1.t - d0.t) / 1000;
console.log(`draw calls per second (4 s window): room ${(((d1.room ?? 0) - (d0.room ?? 0)) / secs).toFixed(0)}, button ${(((d1.button ?? 0) - (d0.button ?? 0)) / secs).toFixed(0)}`);
const heavy = work.filter(([, d]) => d > 12);
console.log(`animation-frame callbacks over 12 ms: ${heavy.length} of ${work.length} — ${heavy.map(([t, d]) => `${((t - d0.t) / 1000).toFixed(2)}s:${d.toFixed(0)}ms`).join(", ")}`);
const byId = new Map(profile.nodes.map((n) => [n.id, n]));
const self = new Map(); profile.samples.forEach((id, i) => self.set(id, (self.get(id) ?? 0) + (profile.timeDeltas[i] ?? 0)));
const byFn = new Map();
for (const [id, us] of self) { const cf = byId.get(id).callFrame; const k = `${cf.functionName || "(anonymous)"}  ${(cf.url || "native").replace(/^.*\/chunks\//, "").slice(-50)}:${cf.lineNumber + 1}`; byFn.set(k, (byFn.get(k) ?? 0) + us); }
console.log("SELF TIME, 4 s (top 20):\n" + [...byFn].sort((a, b) => b[1] - a[1]).slice(0, 20).map(([k, us]) => `${(us / 1000).toFixed(0).padStart(5)} ms  ${k}`).join("\n"));
console.log("⚠ NOT WATCHED: GPU time per frame; Carl's Chrome.");
