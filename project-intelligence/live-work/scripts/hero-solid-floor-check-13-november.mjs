// THE SOLID FLOOR AND THE LOCAL PUDDLE (13 November 2026; D-101). Steps the field 600 frames (20 s at 30 fps, the bench's
// loop stopped) and reads the liquid's geometry each frame: its LOWEST point (must be ≥ FLOOR_Y: nothing through the floor)
// and the vertices AT the floor (within 1 layer): how many, and the share of the field's footprint grid cells (10 × 10)
// they touch — the example's square touched them all. Then stills: Home, and from above. Blobs ON, floor ON.
// ⚠ NOT WATCHED: how the merge LOOKS (Carl's eye); the frame cost of the extra field pass (logged as the step's ms only).
import { chromium } from "playwright";

const OUT = process.argv[2] ?? ".";
const b = await chromium.launch({ channel: "chrome", args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-webgpu"] });
const p = await b.newPage({ viewport: { width: 1909, height: 940 }, deviceScaleFactor: 1 });
const errors = [];
p.on("pageerror", (e) => errors.push(String(e).slice(0, 200)));
await p.goto("http://localhost:3000/proto/hero", { waitUntil: "load" });
await p.waitForSelector("[data-hero-backend]", { timeout: 60000 });
await p.waitForFunction(() => window.__heroBench?.hero?.arrival, null, { timeout: 60000 });
await p.waitForTimeout(5000);
const r = await p.evaluate(() => {
  const { hero, renderer } = window.__heroBench;
  renderer.setAnimationLoop(null);
  hero.settings.blobs = true;
  hero.settings.floor = true;
  let view = null;
  hero.scene.traverse((o) => o.isMesh && o.scale.x === 700 && (view = o));
  const FLOOR = -437.5;
  let lowest = Infinity;
  let worstFrame = -1;
  let touchFrames = 0;
  let maxCells = 0;
  let stepMs = 0;
  for (let f = 0; f < 600; f++) {
    const t0 = performance.now();
    hero.update(1 / 30);
    stepMs += performance.now() - t0;
    const g = view.geometry;
    const pos = g.getAttribute("position");
    const n = Math.min(pos.count, g.drawRange.count === Infinity ? pos.count : g.drawRange.count);
    const cells = new Set();
    for (let i = 0; i < n; i++) {
      const y = pos.getY(i) * 700 + view.position.y;
      if (y < lowest) {
        lowest = y;
        worstFrame = f;
      }
      if (y < FLOOR + 50) cells.add(`${Math.floor((pos.getX(i) + 1) * 5)},${Math.floor((pos.getZ(i) + 1) * 5)}`);
    }
    if (cells.size) touchFrames++;
    maxCells = Math.max(maxCells, cells.size);
  }
  return { fieldY: view.position.y, lowest: +lowest.toFixed(2), worstFrame, floor: FLOOR, framesTouchingFloor: touchFrames, maxFloorCellsOf100: maxCells, stepMsMean: +(stepMs / 600).toFixed(2) };
});
console.log(JSON.stringify(r, null, 1));
await p.evaluate(() => window.__heroBench.renderer.setAnimationLoop(() => {}));
const shot = async (name, pos, target) => {
  await p.evaluate(
    ({ pos, target }) => {
      const { hero, renderer, scene, camera, controls } = window.__heroBench;
      camera.position.set(...pos);
      controls.target.set(...target);
      controls.update();
      hero.update(1 / 30);
      renderer.render(scene, camera);
    },
    { pos, target },
  );
  await p.waitForTimeout(300);
  await p.screenshot({ path: `${OUT}/${name}.png` });
};
// find a frame with contact, then shoot it from Home and from above-front
await p.evaluate(() => {
  const { hero } = window.__heroBench;
  let view = null;
  hero.scene.traverse((o) => o.isMesh && o.scale.x === 700 && (view = o));
  for (let f = 0; f < 900; f++) {
    hero.update(1 / 30);
    const pos = view.geometry.getAttribute("position");
    let touch = 0;
    for (let i = 0; i < Math.min(pos.count, view.geometry.drawRange.count); i++) if (pos.getY(i) * 700 + view.position.y < -437.5 + 30) touch++;
    if (touch > 60) break;
  }
});
await shot("floor-home", [0, -49.2, 2566.2], [0, 0, 0]);
await shot("floor-above", [0, 900, 1900], [0, -437.5, 0]);
console.log(`page errors: ${errors.length}`, errors);
await b.close();
