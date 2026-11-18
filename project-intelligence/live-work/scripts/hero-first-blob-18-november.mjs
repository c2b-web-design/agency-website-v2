// THE FIRST BLOB's BIRTH, read from the scene (18 November 2026): frame-stepped (1/30 s) from the lean until the scene's
// born-blob read-out (`hero.blobs`) is non-empty; prints the story time and the arrival's numbers. READ-ONLY.
import { chromium } from "playwright";
const b = await chromium.launch({ channel: "chrome", args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-webgpu"] });
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
await p.goto("http://localhost:3000/proto/hero", { waitUntil: "load" });
await p.waitForFunction(() => window.__heroBench?.hero?.mould && window.__heroBench.hero.warmed === true, null, { timeout: 120000 });
const r = await p.evaluate(() => {
  const { hero, renderer } = window.__heroBench;
  renderer.setAnimationLoop(null);
  hero.settings.blobs = true;
  hero.replayArrival();
  hero.update(0);
  let guard = 0;
  while (hero.blobs.length === 0 && guard++ < 900) hero.update(1 / 30);
  return { firstBlobAtStory: hero.arrival.t, blobsBorn: hero.blobs.length, arrival: hero.arrival };
});
console.log(JSON.stringify(r));
await b.close();
