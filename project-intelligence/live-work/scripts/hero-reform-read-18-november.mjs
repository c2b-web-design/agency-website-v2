// THE RE-FORMING's PLAN, read from the scene (18 November 2026): frame-stepped until the plan exists, its per-blob
// times (emission s) and the disc's hits; printed with the arrival's duration (story = duration + emission). READ-ONLY.
import { chromium } from "playwright";
const b = await chromium.launch({ channel: "chrome", args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-webgpu"] });
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
await p.goto("http://localhost:3000/proto/hero", { waitUntil: "load" });
await p.waitForFunction(() => window.__heroBench?.hero?.mould && window.__heroBench.hero.warmed === true, null, { timeout: 120000 });
const r = await p.evaluate(() => {
  const { hero, renderer } = window.__heroBench;
  renderer.setAnimationLoop(null);
  hero.settings.blobs = true;
  hero.settings.floor = true;
  hero.replayArrival();
  hero.update(0);
  let g = 0;
  while (!hero.reform && g++ < 3000) hero.update(1 / 30);
  return { duration: hero.arrival.durationS, hits: hero.arrival.poolHits, reform: hero.reform };
});
console.log(JSON.stringify(r, null, 1));
await b.close();
