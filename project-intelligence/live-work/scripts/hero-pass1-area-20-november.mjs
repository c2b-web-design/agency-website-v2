// PASS 1, FORWARD — HOW MUCH OF THE LOGO THE CLOTH REACHES, BY JUMP HEIGHT (20 November 2026, session 2; Carl: "Find out what
// area of the logo it touched. if its more than 50% find out what height it must jump to get 50%. Ballpark figures will
// do"). For each jump height in argv[2] (cm, comma-separated; default 60,75,90,105,120), `backCm` as set (34): the story
// replayed, frame-stepped (1/30 s) through the jump; every cloth point (GPU read-back) inside the moving logo's box; the
// DEEPEST below its top = the band reached. The share of the logo's FRONT FACE area above that depth (its front-facing
// triangles binned by height) = the share touched. A BALLPARK: the band is read as fully touched across the width, the box
// counts points between letters, one wind run each. READ-ONLY.
import { chromium } from "playwright";
const HEIGHTS = (process.argv[2] ?? "60,75,90,105,120").split(",").map(Number);
const b = await chromium.launch({ channel: "chrome", args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-webgpu"] });
const p = await b.newPage({ viewport: { width: 1896, height: 946 }, deviceScaleFactor: 1 });
await p.goto("http://localhost:3000/proto/hero", { waitUntil: "load" });
await p.waitForFunction(() => window.__heroBench?.hero?.warmed === true, null, { timeout: 180000 });
// the front face's area by depth below the top (1 cm bins), from the standing logo
const faceBins = await p.evaluate(async () => {
  const { hero, renderer, scene } = window.__heroBench;
  renderer.setAnimationLoop(null);
  hero.replayArrival(); hero.cloth.again(); hero.update(0);
  for (let n = 0; n < 30 * 30; n++) { hero.update(1 / 30); hero.compute(renderer); }
  const logo = scene.getObjectByName("hero logo");
  logo.updateMatrixWorld();
  const g = logo.geometry, pos = g.attributes.position, idx = g.index;
  const m = logo.matrixWorld, upc = hero.unitsPerCm;
  const V = (i) => logo.position.clone().fromBufferAttribute(pos, i).applyMatrix4(m);
  let top = -Infinity;
  for (let i = 0; i < pos.count; i++) top = Math.max(top, V(i).y);
  const bins = new Array(110).fill(0);
  const n = idx ? idx.count : pos.count;
  for (let t = 0; t < n; t += 3) {
    const [a, b2, c] = [0, 1, 2].map((k) => V(idx ? idx.getX(t + k) : t + k));
    const e1 = b2.clone().sub(a), e2 = c.clone().sub(a);
    const nrm = e1.clone().cross(e2);
    const area2 = nrm.length();
    if (!area2 || nrm.z / area2 < 0.7) continue; // front-facing (toward +z, the working camera)
    const cy = (a.y + b2.y + c.y) / 3;
    const d = Math.min(109, Math.max(0, Math.floor((top - cy) / upc)));
    bins[d] += area2 / 2 / (upc * upc);
  }
  return bins;
});
const faceTotal = faceBins.reduce((a, b) => a + b, 0);
const shareAbove = (depth) => { let s = 0; for (let d = 0; d < Math.min(110, Math.floor(depth)); d++) s += faceBins[d]; s += (faceBins[Math.floor(depth)] ?? 0) * (depth % 1); return s / faceTotal; };
console.log(`front face area ~${faceTotal.toFixed(0)} cm² (front-facing triangles)`);
const out = [];
for (const H of HEIGHTS) {
  const r = await p.evaluate(async (H) => {
    const { hero, renderer, scene } = window.__heroBench;
    hero.pass1.apexCm = H;
    hero.replayArrival(); hero.cloth.again(); hero.update(0);
    let n = 0;
    while (Number.isNaN(hero.jumpInfo.at) && n++ < 30 * 120) { hero.jump(); hero.update(1 / 30); hero.compute(renderer); }
    const logo = scene.getObjectByName("hero logo");
    const group = scene.getObjectByName("hero cloth (the example)");
    const upc = hero.unitsPerCm;
    // the standing pose (the jump taken this frame at s ≈ 0)
    const y0 = logo.matrix.elements[13], z0 = logo.matrix.elements[14];
    const frames = Math.ceil(hero.jumpInfo.flightS * 30) + 2;
    let deepest = -1, firstT = -1, lastT = -1;
    for (let f = 1; f <= frames; f++) {
      hero.update(1 / 30); hero.compute(renderer);
      const rise = logo.matrix.elements[13] - y0, back = logo.matrix.elements[14] - z0;
      group.updateMatrixWorld();
      const e = group.matrixWorld.elements;
      const posA = hero.cloth.points, N = posA.count;
      const a = new Float32Array(await renderer.getArrayBufferAsync(posA));
      const st = a.length / N;
      const top = 20.7 + rise, bottom = -437.5 + rise;
      for (let i = 0; i < N; i++) {
        const x = a[i * st], y = a[i * st + 1], z = a[i * st + 2];
        const wx = e[0] * x + e[4] * y + e[8] * z + e[12], wy = e[1] * x + e[5] * y + e[9] * z + e[13], wz = e[2] * x + e[6] * y + e[10] * z + e[14];
        if (wx > 277.4 && wx < 1159.6 && wz > -33.7 + back && wz < -0.1 + back && wy < top && wy > bottom) {
          deepest = Math.max(deepest, (top - wy) / upc);
          if (firstT < 0) firstT = f / 30;
          lastT = f / 30;
        }
      }
    }
    hero.pass1.apexCm = 60;
    return { deepest, firstT, lastT, flight: hero.jumpInfo.flightS, backCm: hero.jumpInfo.backCm };
  }, H);
  out.push({ H, ...r });
  console.log(`jump ${H} cm (back ${r.backCm} at apex): band reached ${r.deepest < 0 ? "none" : r.deepest.toFixed(1) + " cm"} → ~${r.deepest < 0 ? 0 : Math.round(100 * shareAbove(r.deepest))}% of the front face; contact ${r.firstT < 0 ? "-" : r.firstT.toFixed(2) + "–" + r.lastT.toFixed(2) + " s"}`);
}
await b.close();
console.log("(the dial reset to 60 after each run)");
