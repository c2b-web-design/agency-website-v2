// IS THE MARBLE FLOOR LEVEL? (23 November 2026; Carl: "Is it just me or does the floor seem sloped?"). READ-ONLY.
// The floor mesh's world normal and height at its corners; HOME's roll (the camera's right vector); the circle's rim (and
// its rim minus the fade) projected at HOME (1896 × 946 px): where its far edge sits on screen, left to right.
// ⚠ NOT WATCHED: the lit pool's shape (the spotlight's position at a given time); other cameras.
import { chromium } from "playwright";
const b = await chromium.launch({ channel: "chrome", args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-webgpu"] });
const p = await b.newPage({ viewport: { width: 1896, height: 946 }, deviceScaleFactor: 1 });
await p.goto("http://localhost:3000/proto/hero", { waitUntil: "load" });
await p.waitForFunction(() => window.__heroBench?.hero?.warmed === true && window.__heroBench.hero.marble.info.placed, null, { timeout: 300000 });
const r = await p.evaluate(() => {
  const { hero, scene, camera } = window.__heroBench;
  const floor = scene.getObjectByName("hero marble floor");
  floor.updateMatrixWorld(true);
  const V = camera.position.constructor;
  const n = new V(0, 0, 1).transformDirection(floor.matrixWorld);
  const ys = [[-0.5, -0.5], [0.5, -0.5], [-0.5, 0.5], [0.5, 0.5]].map(([x, y]) => new V(x, y, 0).applyMatrix4(floor.matrixWorld).y.toFixed(3));
  camera.position.set(0, -49.2, 2566.2); camera.lookAt(0, 0, 0); camera.aspect = 1896 / 946; camera.updateProjectionMatrix(); camera.updateMatrixWorld();
  const right = new V(1, 0, 0).transformDirection(camera.matrixWorld);
  const upc = hero.unitsPerCm, m = hero.marble.settings;
  const c = floor.getWorldPosition(new V());
  const ring = (cm) => {
    const pts = [];
    for (let a = 0; a < 360; a += 15) {
      const w = new V(c.x + Math.cos((a * Math.PI) / 180) * cm * upc, c.y, c.z - Math.sin((a * Math.PI) / 180) * cm * upc).project(camera);
      pts.push([a, Math.round((w.x + 1) * 948), Math.round((1 - w.y) * 473)]);
    }
    return pts.filter(([a]) => a >= 0 && a <= 180).map((q) => q.join(":")).join(" ");
  };
  const spot = new V(c.x, c.y, c.z).project(camera);
  return { normal: [n.x, n.y, n.z].map((v) => v.toFixed(4)), cornerY: ys, camRight: [right.x, right.y, right.z].map((v) => v.toFixed(4)), spotPx: [Math.round((spot.x + 1) * 948), Math.round((1 - spot.y) * 473)], rimFar: ring(m.rimCm), fadeStartFar: ring(m.rimCm - m.rimFadeCm) };
});
console.log(JSON.stringify(r, null, 1));
await b.close();
