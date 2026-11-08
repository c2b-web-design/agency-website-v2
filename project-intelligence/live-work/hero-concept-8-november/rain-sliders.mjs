// Films three.js's webgpu_compute_particles_rain while its three sliders are dragged by the pointer (Carl, 8 November 2026:
// "Go here and video. play around with the sliders."). position = the collision box along z; scale = its width; drop count.
import { chromium } from "file:///C:/Users/Carl%20Buckley/agency-website-v2/node_modules/playwright/index.mjs";
const OUT = process.argv[2];
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist", "--enable-unsafe-webgpu"] });
const ctx = await b.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1, recordVideo: { dir: OUT, size: { width: 1920, height: 1080 } } });
const p = await ctx.newPage();
await p.goto("https://threejs.org/examples/webgpu_compute_particles_rain.html", { waitUntil: "load" });
await p.waitForTimeout(4000);
const ranges = p.locator('input[type="range"]');
const vals = async () => (await p.locator('input[type="number"]').evaluateAll((es) => es.map((e) => e.value))).join(" / ");
// drag slider i's thumb from its current value to `to`, over `ms`
async function drag(i, to, ms) {
  const r = await ranges.nth(i).boundingBox();
  const [min, max, cur] = await ranges.nth(i).evaluate((e) => [Number(e.min), Number(e.max), Number(e.value)]);
  const pad = 6; // the thumb's half-width: the track's usable span
  const x = (v) => r.x + pad + ((v - min) / (max - min)) * (r.width - 2 * pad);
  const y = r.y + r.height / 2;
  await p.mouse.move(x(cur), y, { steps: 10 });
  await p.mouse.down();
  const steps = Math.max(10, Math.round(ms / 25));
  for (let k = 1; k <= steps; k++) { await p.mouse.move(x(cur) + ((x(to) - x(cur)) * k) / steps, y); await p.waitForTimeout(25); }
  await p.mouse.up();
  console.log(`slider ${i} -> ${to}: ${await vals()}`);
}
console.log("start:", await vals());
await drag(0, -50, 4000); await p.waitForTimeout(2500);   // position: the dry patch slides one way
await drag(0, 50, 6000); await p.waitForTimeout(2500);    // ...and the other
await drag(0, 0, 3000); await p.waitForTimeout(2000);
await drag(1, 0.1, 4000); await p.waitForTimeout(3000);   // scale: the dry patch shrinks to a strip
await drag(1, 3.5, 4000); await p.waitForTimeout(2000);
await drag(2, 200, 4000); await p.waitForTimeout(3000);   // drop count: down to a drizzle
await drag(2, 50000, 6000); await p.waitForTimeout(3000); // up to the maximum
await drag(2, 25000, 3000); await p.waitForTimeout(2000);
await p.mouse.move(1000, 1000, { steps: 10 });
const fps = await p.evaluate(() => new Promise((r) => { let n = 0; const s = performance.now(); const f = () => { n++; if (performance.now() - s < 3000) requestAnimationFrame(f); else r(n / 3); }; requestAnimationFrame(f); }));
console.log(`~${fps.toFixed(0)} fps while recording (25,000 drops)`);
const v = p.video();
await ctx.close(); await b.close();
console.log("video:", await v.path());
