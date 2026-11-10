// ⛔ THE LIQUID ON A COLD LOAD — WHEN THINGS ARRIVE, AND THE FRAMES AROUND THE FIRST EXPULSION (10 November 2026,
// session 2; Carl: "on a hard refresh the blobs take too long to emerge"). Needs the dev server. A fresh browser context
// (no cache), `/proto/camera?blank=1`, the clock left PLAYING (no dev control touched). Logs, against page time:
// the bench drawn; `__heroJump` (the jump's clock exists); `__liquid` stats (the bake and the regions done) and its
// material; the jump clock's time then; every rAF gap over 50 ms for the first 20 s, with the liquid's time at it.
// ⚠ NOT WATCHED (printed): Carl's Chrome (this is Playwright's Chrome, d3d11); the WebGL 2 fallback; production builds.
import { chromium } from "file:///C:/Users/Carl Buckley/agency-website-v2/node_modules/playwright/index.mjs";
const b = await chromium.launch({ channel: "chrome", args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-webgpu"] });
const ctx = await b.newContext({ viewport: { width: 1909, height: 934 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.addInitScript(() => {
  const log = (window.__coldLog = []);
  const seen = {};
  let last = performance.now();
  const tick = (now) => {
    const gap = now - last;
    last = now;
    const L = window.__liquid;
    const te = L && L.time ? +L.time().toFixed(3) : null;
    if (gap > 50) log.push({ at: +now.toFixed(0), gapMs: +gap.toFixed(0), liquidTe: te });
    const mark = (k, v) => { if (v && !seen[k]) { seen[k] = 1; log.push({ at: +now.toFixed(0), event: k, liquidTe: te }); } };
    mark("drawn", document.querySelector('[data-camera-bench="drawn"]'));
    mark("heroJump", window.__heroJump?.stats);
    mark("liquidStats", L?.stats);
    mark("liquidMaterial", L?.material);
    mark("fieldVisible", (() => { let v = false; window.__benchScene?.traverse((o) => { if (o.name === "hero liquid" && o.visible) v = true; }); return v; })());
    if (now < 25000) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
});
await p.goto("http://localhost:3000/proto/camera?blank=1", { waitUntil: "load" });
await p.waitForTimeout(25000);
const log = await p.evaluate(() => window.__coldLog);
for (const e of log) console.log(JSON.stringify(e));
console.log("stats", JSON.stringify(await p.evaluate(() => window.__liquid?.stats ?? null)));
console.log("⚠ NOT WATCHED: Carl's Chrome; the WebGL 2 fallback; production builds");
await b.close();
