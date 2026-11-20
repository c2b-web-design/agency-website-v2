// THE CLOTH's FRAME COST (20 November 2026; D-108: every layer priced when adopted). The bench LIVE at Home, the story past
// its end (still), the page's frame rate over 5 s with the cloth ON, then OFF, then ON again (A/B/A), uncapped by nothing
// but the display. READ-ONLY. ⚠ Playwright's Chrome on this PC, not Carl's; rain and steam off (their defaults today).
import { chromium } from "playwright";
const b = await chromium.launch({ channel: "chrome", args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-webgpu", "--disable-frame-rate-limit", "--disable-gpu-vsync"] });
const p = await b.newPage({ viewport: { width: 1896, height: 946 }, deviceScaleFactor: 1 });
await p.goto("http://localhost:3000/proto/hero", { waitUntil: "load" });
await p.waitForFunction(() => window.__heroBench?.hero?.warmed === true, null, { timeout: 180000 });
await p.waitForTimeout(40000);
const fps = () => p.evaluate(() => new Promise((r) => { let n = 0; const s = performance.now(); const f = () => { n++; if (performance.now() - s < 5000) requestAnimationFrame(f); else r(n / 5); }; requestAnimationFrame(f); }));
const out = [];
for (const on of [true, false, true, false]) {
  await p.evaluate((on) => (window.__heroBench.hero.cloth.settings.on = on), on);
  await p.waitForTimeout(1500);
  out.push(`${on ? "cloth ON " : "cloth OFF"}: ${(await fps()).toFixed(1)} fps`);
}
await b.close();
console.log(out.join("\n"));
