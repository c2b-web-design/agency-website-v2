// THE VOLUME BUDGET (13 November 2026; D-101). Carl: "so we would have to make sure the logo volume and the blobs and fluid
// volume are the same." Measures, from the MESHES (divergence theorem: the sum of each triangle's signed tetrahedron to the
// origin), in litres at the scene's scale (`unitsPerCm`): the LOGO's volume; and the LIQUID's over 300 stepped frames (10 s),
// blobs on, floor on — its min / mean / max. ⚠ The liquid's mesh is closed only where marching cubes closes it: the field
// box's outer layer is undrawn and the pool's body is cut by nothing in the MESH (the clip is at draw time), so the
// liquid figure INCLUDES the pool's body below the floor; a blobs-only run (floor off, paths unchanged) is printed beside.
// ⚠ NOT WATCHED: an open mesh's error (reported as the run's spread, not bounded).
import { chromium } from "playwright";

const b = await chromium.launch({ channel: "chrome", args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-webgpu"] });
const p = await b.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
await p.goto("http://localhost:3000/proto/hero", { waitUntil: "load" });
await p.waitForSelector("[data-hero-backend]", { timeout: 60000 });
await p.waitForFunction(() => window.__heroBench?.hero?.lean, null, { timeout: 60000 });
const r = await p.evaluate(() => {
  const { hero, renderer } = window.__heroBench;
  renderer.setAnimationLoop(null);
  const cm3PerUnit3 = 1 / hero.unitsPerCm ** 3;
  const meshVolume = (g, scale, count) => {
    const pos = g.getAttribute("position");
    const idx = g.getIndex();
    const n = count ?? (idx ? idx.count : pos.count);
    let v = 0;
    const P = (i) => [pos.getX(i) * scale, pos.getY(i) * scale, pos.getZ(i) * scale];
    for (let t = 0; t + 2 < n; t += 3) {
      const a = P(idx ? idx.getX(t) : t), b = P(idx ? idx.getX(t + 1) : t + 1), c = P(idx ? idx.getX(t + 2) : t + 2);
      v += (a[0] * (b[1] * c[2] - b[2] * c[1]) - a[1] * (b[0] * c[2] - b[2] * c[0]) + a[2] * (b[0] * c[1] - b[1] * c[0])) / 6;
    }
    return Math.abs(v);
  };
  // the logo: its geometry is in cm (built at 103.9 cm tall) — litres directly
  const logoL = meshVolume(hero.logo.geometry, 1) / 1000;
  let view = null;
  hero.scene.traverse((o) => o.isMesh && o.scale.x === 700 && (view = o));
  const run = (floor) => {
    hero.settings.blobs = true;
    hero.settings.floor = floor;
    const vs = [];
    for (let f = 0; f < 300; f++) {
      hero.update(1 / 30);
      const g = view.geometry;
      const count = Math.min(g.getAttribute("position").count, g.drawRange.count);
      vs.push((meshVolume(g, 700, count) * cm3PerUnit3) / 1000);
    }
    const mean = vs.reduce((a, b) => a + b, 0) / vs.length;
    return { minL: +Math.min(...vs).toFixed(1), meanL: +mean.toFixed(1), maxL: +Math.max(...vs).toFixed(1) };
  };
  return { unitsPerCm: +hero.unitsPerCm.toFixed(3), logoL: +logoL.toFixed(1), liquidWithPool: run(true), blobsOnly: run(false) };
});
console.log(JSON.stringify(r, null, 1));
await b.close();
