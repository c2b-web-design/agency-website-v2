// THE LIQUID's WEB BY THE HITS (18 November 2026; D-101): frame-stepped (1/30 s) from the lean, blobs on; the step and the
// reach (cm) printed every 0.1 s across the dance's hits (story 6.6–8.6) and the carriers' touches (14.5–17.0). READ-ONLY.
import { chromium } from "playwright";
const b = await chromium.launch({ channel: "chrome", args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-webgpu"] });
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
const errors = [];
p.on("pageerror", (e) => errors.push(String(e).slice(0, 200)));
await p.goto("http://localhost:3000/proto/hero", { waitUntil: "load" });
await p.waitForFunction(() => window.__heroBench?.hero?.mould && window.__heroBench.hero.warmed === true, null, { timeout: 120000 });
const rows = await p.evaluate(() => {
  const { hero, renderer } = window.__heroBench;
  renderer.setAnimationLoop(null);
  hero.settings.blobs = true;
  hero.settings.floor = true;
  hero.replayArrival();
  hero.update(0);
  const out = [];
  const windows = [[6.6, 8.6], [14.5, 17.0]];
  let w = 0;
  let next = windows[0][0];
  while (w < windows.length && hero.arrival.t < 17.1) {
    hero.update(1 / 30);
    const t = hero.arrival.t;
    if (t >= next - 1e-6) {
      const f = hero.floorInfo;
      out.push(`story ${t.toFixed(2)}  step ${f.liquidStep}  reach ${f.liquidReachCm} cm  extent ${f.extents[1]}  strength ${f.strengths[1]}`);
      next += 0.1;
      if (next > windows[w][1] + 1e-6) {
        w++;
        if (w < windows.length) next = windows[w][0];
      }
    }
  }
  return out;
});
console.log(rows.join("\n"));
console.log(`page errors: ${errors.length}`, errors);
await b.close();
