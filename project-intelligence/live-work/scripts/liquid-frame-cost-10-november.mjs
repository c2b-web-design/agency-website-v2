// ⛔ THE LIQUID's FRAME COST BY PHASE (10 November 2026, session 2). Needs the dev server. The clock FROZEN (`__liquid.at`)
// at each time since the expulsion's start; after the first show (the compile) is past, 3 s of rAF intervals per time:
// median and p90 ms. argv: times (comma list; default -1 (the solid, no field), 0.1, 0.2, 0.35 (masking), 0.8, 3 (no mask)).
// ⚠ NOT WATCHED (printed): Carl's Chrome; the GPU's own time (rAF intervals include everything); the fallback.
import { chromium } from "file:///C:/Users/Carl Buckley/agency-website-v2/node_modules/playwright/index.mjs";
const TIMES = (process.argv[2] ?? "-1,0.1,0.2,0.35,0.8,3").split(",").map(Number);
const b = await chromium.launch({ channel: "chrome", args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-webgpu"] });
const p = await b.newPage({ viewport: { width: 1909, height: 934 }, deviceScaleFactor: 1 });
await p.goto("http://localhost:3000/proto/camera?blank=1", { waitUntil: "load" });
await p.waitForSelector('[data-camera-bench="drawn"]', { timeout: 180000 });
await p.waitForFunction(() => !!window.__liquid?.material, null, { timeout: 60000 });
// past the first show's compile
await p.evaluate(() => window.__liquid.at(0.2));
await p.waitForTimeout(8000);
for (const t of TIMES) {
  await p.evaluate((t) => window.__liquid.at(t), t);
  await p.waitForTimeout(800);
  const r = await p.evaluate(() => new Promise((res) => { const d = []; let last = performance.now(); const end = last + 3000; const f = (now) => { d.push(now - last); last = now; if (now < end) requestAnimationFrame(f); else { d.sort((a, b) => a - b); res({ frames: d.length, median: +d[Math.floor(d.length / 2)].toFixed(1), p90: +d[Math.floor(d.length * 0.9)].toFixed(1) }); } }; requestAnimationFrame(f); }));
  console.log(`te ${t}:`, JSON.stringify(r));
}
console.log("⚠ NOT WATCHED: Carl's Chrome; the GPU's own time; the WebGL 2 fallback");
await b.close();
