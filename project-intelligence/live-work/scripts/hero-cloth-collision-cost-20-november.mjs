// THE COLLISION FRAME COST (20 November 2026, session 2; D-108), from hero-cloth-cost-20-november.mjs: the cloth ON, its COLLISION
// on / off / on / off, the page frame rate over 5 s each, uncapped. READ-ONLY. Playwright Chrome on this PC; rain and steam off.
import { chromium } from "playwright";
const b = await chromium.launch({ channel: "chrome", args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-webgpu", "--disable-frame-rate-limit", "--disable-gpu-vsync"] });
const p = await b.newPage({ viewport: { width: 1896, height: 946 }, deviceScaleFactor: 1 });
await p.goto("http://localhost:3000/proto/hero", { waitUntil: "load" });
await p.waitForFunction(() => window.__heroBench?.hero?.warmed === true, null, { timeout: 180000 });
await p.waitForTimeout(40000);
const fps = () => p.evaluate(() => new Promise((r) => { let n = 0; const s = performance.now(); const f = () => { n++; if (performance.now() - s < 5000) requestAnimationFrame(f); else r(n / 5); }; requestAnimationFrame(f); }));
const out = [];
for (const on of [true, false, true, false]) {
  await p.evaluate((on) => (window.__heroBench.hero.cloth.settings.collide = on), on);
  await p.waitForTimeout(1500);
  out.push(`${on ? "collide ON " : "collide OFF"}: ${(await fps()).toFixed(1)} fps`);
}
await b.close();
console.log(out.join("\n"));
