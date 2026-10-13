/** THE FAMILY BUTTON'S LOAD TIMELINE (13 October 2026 — Carl: "When i refresh it is not metal straight away, there is a
 *  delay."). A fresh load straight to the section (as a refresh there does), times from navigation start:
 *  fonts ready · the button's canvas in the DOM · its FIRST draw call · data-drawn = 1 (the letters; the CSS fallback goes) ·
 *  and the main thread's long tasks (> 50 ms) before that, summed. Home `#contact` vs `/about#start`, 3 runs each.
 *  Usage: node …/family-button-load-timeline.mjs [runs] [base url] [home|about]
 *  ⚠ NOT WATCHED (the dev server by default; pass the production URL for a build); Carl's Chrome and GPU; network throttling. */
import { chromium } from "playwright";
const RUNS = Number(process.argv[2] ?? 3);
const BASE = process.argv[3] ?? "http://localhost:3000"; // a production build: `next start -p 3100` → pass http://localhost:3100
const ONLY = process.argv[4] ?? ""; // "home" or "about" to time one page
const PAGES = [
  { name: "home  #contact", url: BASE + "/#contact", link: '#contact a[href="/about"]' },
  { name: "about #start  ", url: BASE + "/about#start", link: '#start a[href="/start"]' },
].filter((p) => !ONLY || p.name.startsWith(ONLY));
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
for (const pg of PAGES) {
  for (let run = 0; run < RUNS; run++) {
    const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
    await ctx.addInitScript((sel) => {
      const T = (window.__t = {});
      window.__long = [];
      try { new PerformanceObserver((l) => l.getEntries().forEach((e) => window.__long.push([e.startTime, e.duration]))).observe({ type: "longtask", buffered: true }); } catch {}
      document.fonts.ready.then(() => (T.fonts ??= performance.now()));
      const orig = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (type, ...rest) {
        const c = orig.call(this, type, ...rest);
        if (/webgl/.test(type) && c && !this.__w) {
          this.__w = true;
          const mine = () => !!this.closest(sel);
          for (const fn of ["drawElements", "drawArrays"]) {
            const f = c[fn];
            c[fn] = function (...a) { if (T.firstDraw === undefined && mine()) T.firstDraw = performance.now(); return f.apply(this, a); };
          }
        }
        return c;
      };
      const poll = () => {
        const a = document.querySelector(sel);
        if (a) {
          if (T.canvas === undefined && a.querySelector("canvas")) T.canvas = performance.now();
          if (T.drawn === undefined && a.dataset.drawn === "1") { T.drawn = performance.now(); return; }
        }
        requestAnimationFrame(poll);
      };
      requestAnimationFrame(poll);
    }, pg.link);
    const p = await ctx.newPage();
    await p.goto(pg.url, { waitUntil: "load" });
    await p.waitForFunction(() => window.__t.drawn !== undefined, null, { timeout: 30000 }).catch(() => {});
    const r = await p.evaluate(() => {
      const T = window.__t, before = window.__long.filter(([s]) => s < (T.drawn ?? Infinity));
      return { ...T, longN: before.length, longMs: before.reduce((s, [, d]) => s + d, 0), longMax: Math.max(0, ...before.map(([, d]) => d)) };
    });
    const f = (v) => (v === undefined ? "  —  " : (v / 1000).toFixed(2).padStart(5) + "s");
    console.log(`${pg.name} run ${run + 1}: fonts ${f(r.fonts)} · canvas ${f(r.canvas)} · first draw ${f(r.firstDraw)} · LETTERS (metal, fallback gone) ${f(r.drawn)} · long tasks before: ${r.longN}, ${(r.longMs / 1000).toFixed(2)}s total, longest ${(r.longMax / 1000).toFixed(2)}s`);
    await ctx.close();
  }
}
await b.close();
console.log(`⚠ NOT WATCHED: ${BASE.endsWith(":3000") ? "production (dev server measured); " : ""}Carl's Chrome and GPU; throttled networks.`);
