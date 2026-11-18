// THE FLOOR's MASK BY TIME (18 November 2026): frame-stepped (1/30 s) — the opening from its restart, the extent printed
// at the fade's start + 0, 0.6, 1.2, 2.0 s; then the story from the lean, the extent at story 0, 0.8, 2.0, 3.0, 4.0, 4.1.
// Numbers only. READ-ONLY.
import { chromium } from "playwright";
const b = await chromium.launch({ channel: "chrome", args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-webgpu"] });
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
await p.goto("http://localhost:3000/proto/hero", { waitUntil: "load" });
await p.waitForFunction(() => window.__heroBench?.hero?.mould && window.__heroBench.hero.warmed === true, null, { timeout: 120000 });
const r = await p.evaluate(() => {
  const { hero, renderer } = window.__heroBench;
  renderer.setAnimationLoop(null);
  const out = [];
  hero.openingAgain();
  let g = 0;
  while (hero.openingInfo.fadeAtS < 0 && g++ < 3000) hero.update(1 / 30);
  const f0 = hero.openingInfo.t;
  for (const d of [0, 0.6, 1.2]) {
    while (hero.openingInfo.t < f0 + d - 1e-6 && !hero.openingInfo.done) hero.update(1 / 30);
    out.push(`fade +${d}s: extent ${hero.floorInfo.extents[0]} (opening t ${hero.openingInfo.t}, done ${hero.openingInfo.done})`);
  }
  hero.replayArrival();
  hero.update(0);
  for (const at of [0, 0.8, 2.0, 3.0, 4.0, 4.1]) {
    while (hero.arrival.t < at - 1e-6) hero.update(1 / 30);
    out.push(`story ${hero.arrival.t}: extent ${hero.floorInfo.extents[0]}, visible ${hero.floorInfo.visible}`);
  }
  return out;
});
console.log(r.join("\n"));
await b.close();
