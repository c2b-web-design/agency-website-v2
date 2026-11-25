// THE PLINTH's FILL, TAKE (25 November 2026; Carl: "The marble plinth should always be visible, the spotlight would only
// highlight it"): stills at HOME at two points of the spotlight's circle half a turn apart (its period 6π s ≈ 18.8 s), and
// the plinth's front face's mean brightness in each. READ-ONLY. Output: argv[2].
// ⚠ NOT WATCHED: other cameras; the plinth's rise (it is up at once); Carl's Chrome.
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
const out = process.argv[2];
mkdirSync(out, { recursive: true });
const b = await chromium.launch({ channel: "chrome", args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-webgpu"] });
const p = await b.newPage({ viewport: { width: 1896, height: 946 }, deviceScaleFactor: 1 });
await p.goto("http://localhost:3000/proto/hero", { waitUntil: "load" });
await p.waitForFunction(() => window.__heroBench?.hero?.warmed === true, null, { timeout: 300000 });
await p.waitForFunction(() => window.__heroBench.hero.marble.info.plinthCm.risen > 0, null, { timeout: 300000, polling: 50 });
// the plinth's front face on screen (its middle band), at HOME
const box = await p.evaluate(() => {
  const { scene, camera } = window.__heroBench;
  const pl = scene.getObjectByName("hero marble plinth");
  pl.geometry.computeBoundingBox();
  const bb = pl.geometry.boundingBox.clone().applyMatrix4(pl.matrixWorld);
  const V = camera.position.constructor;
  const pr = (x, y) => { const w = new V(x, y, bb.max.z).project(camera); return [(w.x + 1) * 948, (1 - w.y) * 473]; };
  const a = pr(bb.min.x + (bb.max.x - bb.min.x) * 0.15, bb.max.y - (bb.max.y - bb.min.y) * 0.25);
  const c = pr(bb.max.x - (bb.max.x - bb.min.x) * 0.15, bb.min.y + (bb.max.y - bb.min.y) * 0.25);
  return { x: Math.round(a[0]), y: Math.round(a[1]), width: Math.round(c[0] - a[0]), height: Math.max(2, Math.round(c[1] - a[1])) };
});
const shots = [];
for (const [name, wait] of [["a", 4000], ["b", 9400]]) {
  await p.waitForTimeout(wait);
  const lightAt = await p.evaluate(() => window.__heroBench.hero.marble.info.lightAt);
  await p.screenshot({ path: `${out}/${name}_home.png` });
  const face = await p.screenshot({ clip: box });
  const mean = await p.evaluate(async (b64) => {
    const img = new Image(); img.src = "data:image/png;base64," + b64; await img.decode();
    const c = new OffscreenCanvas(img.width, img.height); const g = c.getContext("2d"); g.drawImage(img, 0, 0);
    const d = g.getImageData(0, 0, img.width, img.height).data; let s = 0;
    for (let i = 0; i < d.length; i += 4) s += 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
    return Math.round((s / (d.length / 4)) * 10) / 10;
  }, face.toString("base64"));
  shots.push({ name, lightAt, frontFaceMeanLuma: mean });
}
console.log(JSON.stringify({ faceBoxPx: box, shots }, null, 1));
await b.close();
