/** IS THE ROLL SMOOTH? (13 October 2026 — Carl, on `/about` after the worker: "it is a little faster but the rotation is
 *  not smooth.") A fresh load straight to the button's section; from the swap (data-drawn = 1) for N seconds, every
 *  animation frame's interval and every long task (> 50 ms) are recorded, in two windows: the first 3 s after the swap and
 *  a later steady window. Reports frames over 20 ms / 34 ms / 50 ms, the worst gap, and the long tasks with their times.
 *  Home `#contact` vs `/about#start`.
 *  Usage: node …/family-button-roll-smoothness.mjs [base url] [seconds] [warm]   (default http://localhost:3000, 12)
 *  ⚠ NOT WATCHED: whether a frame the page produced reached the screen (compositor); Carl's Chrome and GPU; a hitch shorter
 *  than one frame. rAF intervals are the page's frames, not the canvas's draws — a skipped draw inside a frame is not seen. */
import { chromium } from "playwright";
const BASE = process.argv[2] ?? "http://localhost:3000";
const SECS = Number(process.argv[3] ?? 12);
const NOROOM = process.argv.includes("noroom"); // EXPERIMENT: the room canvas's GPU work dropped in the test browser — draws, blits, mipmaps, clears (is it the stutter?)
const WARM = process.argv.includes("warm"); // one unmeasured load first in the same browser: the shader cache warm, as on Carl's refresh
const PAGES = [
  { name: "home  #contact", url: "/#contact", link: '#contact a[href="/about"]' },
  { name: "about #start  ", url: "/about#start", link: '#start a[href="/start"]' },
];
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
for (const pg of PAGES) {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.addInitScript(([sel, secs, noroom]) => {
    const R = (window.__r = { frames: [], long: [], swap: null, done: false, roomRect: null });
    if (noroom) { const orig = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = function (type, ...rest) { const c = orig.call(this, type, ...rest); if (/webgl/.test(type) && c && !c.__nr) { c.__nr = true; const cv = c.canvas; for (const fn of ["drawElements", "drawArrays", "drawElementsInstanced", "drawArraysInstanced", "blitFramebuffer", "generateMipmap", "clear", "copyTexSubImage2D"]) { const g = c[fn]; if (typeof g !== "function") continue; c[fn] = function (...a) { if (!cv.closest(sel)) return; return g.apply(this, a); }; } } return c; }; }
    try { new PerformanceObserver((l) => l.getEntries().forEach((e) => R.long.push([e.startTime, e.duration]))).observe({ type: "longtask", buffered: true }); } catch {}
    const tick = (t) => {
      if (R.swap === null && document.querySelector(sel)?.dataset.drawn === "1") { R.swap = t; const rc = [...document.querySelectorAll("canvas")].find((c) => !c.closest(sel)); if (rc) { const q = rc.getBoundingClientRect(); R.roomRect = { top: Math.round(q.top), bottom: Math.round(q.bottom), vh: innerHeight }; } }
      if (R.swap !== null) { R.frames.push(t); if (t - R.swap > secs * 1000) { R.done = true; return; } }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [pg.link, SECS, NOROOM]);
  if (WARM) { const w = await ctx.newPage(); await w.goto(BASE + pg.url, { waitUntil: "load" }); await w.waitForFunction(() => window.__r.done, null, { timeout: 90000 }); await w.close(); }
  const p = await ctx.newPage();
  await p.goto(BASE + pg.url, { waitUntil: "load" });
  await p.mouse.move(5, 5);
  await p.waitForFunction(() => window.__r.done, null, { timeout: 90000 });
  const r = await p.evaluate(() => window.__r);
  await ctx.close();
  const gaps = r.frames.slice(1).map((t, i) => [t, t - r.frames[i]]);
  const win = (a, z) => gaps.filter(([t]) => t - r.swap >= a * 1000 && t - r.swap < z * 1000).map(([, d]) => d);
  const stat = (ds) => `${ds.length} frames · >20 ms ${ds.filter((d) => d > 20).length} · >34 ms ${ds.filter((d) => d > 34).length} · >50 ms ${ds.filter((d) => d > 50).length} · worst ${Math.max(0, ...ds).toFixed(0)} ms · median ${[...ds].sort((x, y) => x - y)[Math.floor(ds.length / 2)]?.toFixed(1)} ms`;
  const longAfter = r.long.filter(([s]) => s >= r.swap).map(([s, d]) => `+${((s - r.swap) / 1000).toFixed(2)}s ${d.toFixed(0)}ms`);
  const late = gaps.filter(([, d]) => d > 34).map(([t, d]) => `+${((t - r.swap) / 1000).toFixed(2)}s ${d.toFixed(0)}`);
  console.log(`${pg.name}: swap at ${(r.swap / 1000).toFixed(2)} s${NOROOM ? " — ROOM DRAWS DROPPED (experiment)" : ""}${r.roomRect ? ` · room canvas top ${r.roomRect.top} bottom ${r.roomRect.bottom} (window 0–${r.roomRect.vh}) → ${r.roomRect.bottom <= 0 || r.roomRect.top >= r.roomRect.vh ? "OFF SCREEN" : "on screen"}` : ""}`);
  console.log(`   first 3 s after the swap: ${stat(win(0, 3))}`);
  console.log(`   ${3}–${SECS} s after:            ${stat(win(3, SECS))}`);
  console.log(`   long tasks after the swap: ${longAfter.length ? longAfter.join(", ") : "none"}`);
  console.log(`   frames over 34 ms (when, how long): ${late.join(", ") || "none"}`);
}
await b.close();
console.log("⚠ NOT WATCHED: the compositor; Carl's Chrome and GPU; sub-frame hitches.");
