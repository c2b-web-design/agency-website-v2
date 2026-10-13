/** THE ~0.37 s HITCH ON `/about`, LINED UP (13 October 2026). Not the room's draws (dropping them in the test browser left
 *  it: `family-button-roll-smoothness.mjs … noroom`); no main-thread frame callback over 12 ms (`about-steady-profile.mjs`).
 *  This logs, with timestamps, every GPU upload/readback from EITHER canvas (texImage2D, texSubImage2D, bufferData,
 *  bufferSubData, readPixels, generateMipmap, copyTexSubImage2D, framebuffer blits), every timer/interval callback over
 *  2 ms, and every DOM mutation batch — then lists what happened within 40 ms before each late frame (> 34 ms) in a
 *  steady window. Usage: node …/about-hitch-correlate.mjs [base url]
 *  ⚠ NOT WATCHED: compositor-only work (CSS animations, layers); GPU time itself. */
import { chromium } from "playwright";
const BASE = process.argv[2] ?? "http://localhost:3000";
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
await ctx.addInitScript(() => {
  const E = (window.__e = { ev: [], frames: [] });
  const SEL = '#start a[href="/start"]';
  const orig = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function (type, ...rest) {
    const c = orig.call(this, type, ...rest);
    if (/webgl/.test(type) && c && !c.__h) {
      c.__h = true; const cv = c.canvas;
      for (const fn of ["texImage2D", "texSubImage2D", "bufferData", "bufferSubData", "readPixels", "generateMipmap", "copyTexSubImage2D", "blitFramebuffer", "texStorage2D", "compressedTexImage2D"]) {
        const f = c[fn]; if (typeof f !== "function") continue;
        c[fn] = function (...a) {
          const t = performance.now(); const r = f.apply(this, a);
          const size = fn.startsWith("buffer") && a[1]?.byteLength ? ` ${(a[1].byteLength / 1024).toFixed(0)}KB` : (fn.startsWith("tex") && a.length >= 6 && typeof a[3] === "number" && typeof a[4] === "number" ? ` ${a[3]}×${a[4]}` : (a[a.length - 1]?.width ? ` ${a[a.length - 1].width}×${a[a.length - 1].height}` : ""));
          E.ev.push([t, `${cv.closest(SEL) ? "button" : "room"}.${fn}${size} ${(performance.now() - t).toFixed(1)}ms`]);
          return r;
        };
      }
    }
    return c;
  };
  for (const name of ["setTimeout", "setInterval"]) {
    const f = window[name].bind(window);
    window[name] = (cb, ms, ...a) => f(typeof cb === "function" ? (...x) => { const t = performance.now(); cb(...x); const d = performance.now() - t; if (d > 2) E.ev.push([t, `${name}(${ms}) cb ${d.toFixed(1)}ms`]); } : cb, ms, ...a);
  }
  new MutationObserver((m) => E.ev.push([performance.now(), `DOM mutations ×${m.length} (${[...new Set(m.map((x) => (x.target.id || x.target.className?.toString?.().slice(0, 30) || x.target.nodeName)))].slice(0, 3).join(" | ")})`])).observe(document, { subtree: true, childList: true, attributes: true, characterData: true });
  const tick = (t) => { E.frames.push(t); requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
});
const warm = await ctx.newPage(); await warm.goto(BASE + "/about#start", { waitUntil: "load" }); await warm.waitForTimeout(6000); await warm.close();
const p = await ctx.newPage();
await p.goto(BASE + "/about#start", { waitUntil: "load" });
await p.mouse.move(5, 5);
await p.waitForTimeout(9000);
const { ev, frames } = await p.evaluate(() => window.__e);
await b.close();
const t0 = frames[0], win0 = 5000, win1 = 9000; // a steady window, ms after the first frame
const late = frames.slice(1).map((t, i) => [t, t - frames[i]]).filter(([t, d]) => d > 34 && t - t0 > win0 && t - t0 < win1);
console.log(`late frames (> 34 ms) ${(win0 / 1000)}–${win1 / 1000} s: ${late.length}`);
for (const [t, d] of late) {
  const near = ev.filter(([e]) => e > t - d - 40 && e <= t).map(([e, s]) => `      ${(e - t).toFixed(0).padStart(5)} ms  ${s}`);
  console.log(`  frame at ${((t - t0) / 1000).toFixed(2)} s, ${d.toFixed(0)} ms:\n${near.join("\n") || "      (nothing logged)"}`);
}
const inWin = ev.filter(([e]) => e - t0 > win0 && e - t0 < win1);
const kinds = new Map(); for (const [, s] of inWin) { const k = s.replace(/[\d.]+ms$/, "").replace(/\d+KB|\d+×\d+/g, "#"); kinds.set(k, (kinds.get(k) ?? 0) + 1); }
console.log("\nall events in the window, by kind:\n" + [...kinds].sort((a, b) => b[1] - a[1]).slice(0, 15).map(([k, n]) => `  ×${n}  ${k}`).join("\n"));
console.log("⚠ NOT WATCHED: compositor-only work; GPU time.");
