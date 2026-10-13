/** WHY DOES THE GOLD BUTTON DRAW AT THE PAGE TOP? (13 October 2026 — `start-button-about-verify.mjs` check 6: +158 draw
 *  calls in 1 s with the button off screen, at 2×; it passed at 1×.) `/about#start`, wait for the swap + 2 s, scroll to
 *  the top, then for 6 s log every frame in which the BUTTON's canvas drew: its time after the scroll and a short stack
 *  of the first draw call. Also logs pointer events reaching the window, and whether the canvas is on screen.
 *  ⚠ NOT WATCHED: anything but the button's canvas. */
import { chromium } from "playwright";
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
await ctx.addInitScript(() => {
  const L = (window.__p = { log: [], armed: false, t0: 0, lastFrame: -1 });
  const orig = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function (type, ...rest) {
    const c = orig.call(this, type, ...rest);
    if (/webgl/.test(type) && c && !c.__p) {
      c.__p = true; const cv = c.canvas;
      const f = c.drawElements;
      c.drawElements = function (...a) {
        if (L.armed && cv.closest("#start")) {
          const t = performance.now();
          if (t - L.lastFrame > 4) {
            L.lastFrame = t;
            const r = cv.getBoundingClientRect();
            const stack = (new Error().stack || "").split("\n").slice(2, 9).map((s) => s.trim().replace(/\(?https?:\/\/[^)]*\/chunks\//, "").replace(/\)$/, "")).join(" < ");
            L.log.push(`+${((t - L.t0) / 1000).toFixed(2)}s draw (canvas top ${Math.round(r.top)}) ${stack}`);
          }
        }
        return f.apply(this, a);
      };
    }
    return c;
  };
  for (const ev of ["pointermove", "mousemove", "resize", "scroll"]) window.addEventListener(ev, () => { if (L.armed) L.log.push(`+${((performance.now() - L.t0) / 1000).toFixed(2)}s event ${ev}`); }, { capture: true, passive: true });
});
const p = await ctx.newPage();
await p.goto("http://localhost:3000/about#start", { waitUntil: "load" });
await p.mouse.move(5, 5);
await p.waitForFunction(() => document.querySelector('#start a[href="/start"]')?.dataset.drawn === "1", null, { timeout: 60000 });
await p.waitForTimeout(2000);
await p.evaluate(() => { window.__p.armed = true; window.__p.t0 = performance.now(); window.scrollTo(0, 0); });
await p.waitForTimeout(6000);
const log = await p.evaluate(() => window.__p.log);
console.log(log.slice(0, 40).join("\n") || "(nothing)");
console.log(`… ${log.length} entries`);
await b.close();
