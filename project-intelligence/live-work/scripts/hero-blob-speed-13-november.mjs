// THE BLOBS' SPEED THROUGH THE EMISSION AND THE JOINING (13 November 2026; D-101). Carl: "some of them are rushing to where
// they need to be ... The whole action ... should be fluid." Steps the story 1/30 s a frame from the start (the bench's loop
// stopped) and reads each born blob's centre (`hero.blobs`, world units): its speed frame to frame (units/s; 4.41 units =
// 1 cm). Reports, per blob, the top speed in the JOINING window (the first 8 s after the emission starts: every birth and its journey) against the
// STEADY dance's top speed (all blobs, 12–20 s after the emission). ⚠ NOT WATCHED: how it LOOKS (Carl's eye); merges
// (a merged mass can look faster or slower than its centres).
import { chromium } from "playwright";

const b = await chromium.launch({ channel: "chrome", args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-webgpu"] });
const p = await b.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
await p.goto("http://localhost:3000/proto/hero", { waitUntil: "load" });
await p.waitForSelector("[data-hero-backend]", { timeout: 60000 });
await p.waitForFunction(() => window.__heroBench?.hero?.mould, null, { timeout: 60000 });
const r = await p.evaluate(() => {
  const { hero, renderer } = window.__heroBench;
  renderer.setAnimationLoop(null);
  hero.settings.blobs = true;
  hero.settings.floor = true;
  hero.replayArrival();
  const dt = 1 / 30;
  const E0 = hero.arrival.durationS;
  const prev = new Map();
  const joinMax = {};
  let steadyMax = 0;
  for (let f = 0; f < Math.ceil((E0 + 1.5 + 20) / dt); f++) {
    hero.update(dt);
    const t = hero.arrival.t - E0; // since the emission began
    for (const [i, x, y, z] of hero.blobs) {
      const q = prev.get(i);
      if (q) {
        const v = Math.hypot(x - q[0], y - q[1], z - q[2]) / dt;
        if (t <= 8) joinMax[i] = Math.max(joinMax[i] ?? 0, v);
        if (t >= 12) steadyMax = Math.max(steadyMax, v);
      }
      prev.set(i, [x, y, z]);
    }
  }
  const r0 = (v) => Math.round(v);
  return { joiningTopSpeed: Object.fromEntries(Object.entries(joinMax).map(([k, v]) => [k, r0(v)])), joiningMax: r0(Math.max(...Object.values(joinMax))), steadyDanceMax: r0(steadyMax) };
});
console.log(JSON.stringify(r, null, 1));
await b.close();
