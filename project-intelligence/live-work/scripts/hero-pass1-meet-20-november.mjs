// PASS 1, FORWARD — WHERE THE LOGO MUST GO TO MEET THE CLOTH (20 November 2026, session 2; Carl: "Have the logo jump up and
// back. Jump into it as the cloth is moving forwars."). Frame-stepped (1/30 s) from "Jump" (the straight 60 cm jump as built;
// the cloth's path does not depend on the logo — nothing collides): every cloth point (GPU read-back) and the logo's rise,
// each frame of the flight. Then, offline: for a ballistic jump of the same height and flight that also travels BACK by
// 2·d (apex d behind its spot, landing 2·d behind), the cloth points inside the logo's box (x 277.4…1159.6, 7.6 cm thick,
// its top band) summed over the flight — for d 0…100 cm. READ-ONLY.
// ⚠ NOT WATCHED: the logo's SHAPE (its box: points between letters count); other wind seeds; the meeting off the apex.
import { chromium } from "playwright";
const b = await chromium.launch({ channel: "chrome", args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-webgpu"] });
const p = await b.newPage({ viewport: { width: 1896, height: 946 }, deviceScaleFactor: 1 });
await p.goto("http://localhost:3000/proto/hero", { waitUntil: "load" });
await p.waitForFunction(() => window.__heroBench?.hero?.warmed === true, null, { timeout: 180000 });
await p.evaluate(() => {
  const { hero, renderer } = window.__heroBench;
  renderer.setAnimationLoop(null);
  hero.replayArrival(); hero.cloth.again(); hero.update(0);
  let n = 0;
  while (Number.isNaN(hero.jumpInfo.at) && n++ < 30 * 120) { hero.jump(); hero.update(1 / 30); hero.compute(renderer); }
  window.__y0 = window.__heroBench.scene.getObjectByName("hero logo").matrix.elements[13];
});
const frames = [];
for (let f = 1; f <= 24; f++) {
  frames.push(await p.evaluate(async () => {
    const { hero, renderer, scene } = window.__heroBench;
    hero.update(1 / 30); hero.compute(renderer);
    const upc = hero.unitsPerCm;
    const logo = scene.getObjectByName("hero logo");
    const group = scene.getObjectByName("hero cloth (the example)");
    group.updateMatrixWorld();
    const e = group.matrixWorld.elements;
    const posA = hero.cloth.points, N = posA.count;
    const a = new Float32Array(await renderer.getArrayBufferAsync(posA));
    const st = a.length / N;
    const pts = [];
    for (let i = 0; i < N; i++) {
      const x = a[i * st], y = a[i * st + 1], z = a[i * st + 2];
      // world, then cm: x as is (box test), y above the standing top (20.7), z from the logo's plane (−16.92)
      pts.push(e[0] * x + e[4] * y + e[8] * z + e[12], (e[1] * x + e[5] * y + e[9] * z + e[13] - 20.7) / upc, (e[2] * x + e[6] * y + e[10] * z + e[14] + 16.92) / upc);
    }
    return { rise: (logo.matrix.elements[13] - window.__y0) / upc, pts, flight: hero.jumpInfo.flightS };
  }));
}
await b.close();
const T = frames[0].flight;
const HALF = 3.8; // the logo's half thickness, cm
const H = 103.9; // its height
const res = [];
for (let d = 0; d <= 100; d += 2) {
  let total = 0, framesIn = 0, deepest = 0, first = -1;
  frames.forEach((fr, i) => {
    const t = (i + 1) / 30;
    if (t > T) return;
    const zc = -(2 * d) * (t / T); // the logo's centre, cm from its spot (− = back)
    const top = fr.rise; // its top above the standing top
    let n = 0;
    for (let k = 0; k < fr.pts.length; k += 3) {
      const x = fr.pts[k], y = fr.pts[k + 1], z = fr.pts[k + 2];
      if (x > 277.4 && x < 1159.6 && z > zc - HALF && z < zc + HALF && y < top && y > top - H) { n++; deepest = Math.max(deepest, top - y); }
    }
    if (n) { framesIn++; if (first < 0) first = t; }
    total += n;
  });
  res.push({ d, total, framesIn, deepest, first });
}
res.sort((a, b) => b.total - a.total);
console.log(`flight ${T.toFixed(3)} s; candidates (d = apex this far BEHIND its spot, landing 2·d behind):`);
console.log(" d(cm)  point-frames in box  frames in contact  deepest band (cm below top)  first contact (s)");
for (const r of res.slice(0, 10)) console.log(`${String(r.d).padStart(5)} ${String(r.total).padStart(14)} ${String(r.framesIn).padStart(12)} ${r.deepest.toFixed(1).padStart(18)} ${r.first < 0 ? "-" : r.first.toFixed(2)}`);
// the hem's path, for the record
const hem = frames.map((fr, i) => { let zs = 0, ys = 0, n = 0; for (let k = 63 * 3; k < fr.pts.length; k += 64 * 3) { ys += fr.pts[k + 1]; zs += fr.pts[k + 2]; n++; } return `${((i + 1) / 30).toFixed(2)}:z${(zs / n).toFixed(0)},y${(ys / n).toFixed(0)}`; });
console.log("hem (mean; cm from the logo's plane / above its standing top):", hem.join("  "));
