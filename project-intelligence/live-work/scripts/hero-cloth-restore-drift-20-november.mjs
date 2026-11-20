// THE RESTORED CLOTH AGAINST THE FRESH ONE, OVER 3 s (20 November 2026, session 2). Frame-stepped (1/30 s). A: a fresh
// replay, to the moment pass 1 can be taken, then 3 s WITHOUT a jump — the hem's mean z every 0.5 s. B: a fresh replay,
// pass 1 taken at that moment (the snapshot saved), run to its end, "Reset", then 3 s without a jump — the same reading.
// If the restore is exact, B = A. READ-ONLY.
import { chromium } from "playwright";
const b = await chromium.launch({ channel: "chrome", args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-webgpu"] });
const p = await b.newPage({ viewport: { width: 1896, height: 946 }, deviceScaleFactor: 1 });
await p.goto("http://localhost:3000/proto/hero", { waitUntil: "load" });
await p.waitForFunction(() => window.__heroBench?.hero?.warmed === true && window.__heroBench.hero.cloth.collider, null, { timeout: 300000 });
const r = await p.evaluate(async () => {
  const { hero, renderer, scene } = window.__heroBench;
  renderer.setAnimationLoop(null);
  const step = () => { hero.update(1 / 30); hero.compute(renderer); };
  const group = scene.getObjectByName("hero cloth (the example)");
  const posA = hero.cloth.points, N = posA.count, upc = hero.unitsPerCm;
  const hem = async () => {
    group.updateMatrixWorld();
    const e = group.matrixWorld.elements;
    const a = new Float32Array(await renderer.getArrayBufferAsync(posA));
    const st = a.length / N;
    let z = 0, n = 0;
    for (let i = 63; i < N; i += 64) { z += e[2] * a[i * st] + e[6] * a[i * st + 1] + e[10] * a[i * st + 2] + e[14]; n++; }
    return Math.round(((z / n + 16.92) / upc) * 10) / 10;
  };
  const toReady = () => { let n = 0; while (Number.isNaN(hero.jumpInfo.at) && n++ < 30 * 120) { hero.jump(); step(); } };
  const track = async () => { const out = []; for (let k = 0; k <= 6; k++) { out.push(await hem()); for (let f = 0; f < 15; f++) step(); } return out; };
  // A: fresh, to the take-off moment WITHOUT taking it — the jump asked and taken, so read the frame before: replay, step to one frame short
  hero.replayArrival(); hero.cloth.again(); hero.update(0);
  let n = 0;
  while (Number.isNaN(hero.jumpInfo.at) && n++ < 30 * 120) { hero.jump(); step(); }
  const frames = n;
  hero.replayArrival(); hero.cloth.again(); hero.update(0);
  for (let f = 0; f < frames - 1; f++) step();
  const A = await track();
  // B: fresh, pass 1 taken at the same moment, run, Reset, track
  hero.replayArrival(); hero.cloth.again(); hero.update(0);
  toReady();
  for (let f = 0; f < 30 * 8; f++) step();
  hero.resetPass1();
  step();
  const B = await track();
  return { A, B };
});
await b.close();
console.log("A fresh, no jump  — hem every 0.5 s (cm from the logo's plane):", r.A.join(" "));
console.log("B after Reset     — hem every 0.5 s:                            ", r.B.join(" "));
