// THE CLOTH's ARRIVAL, MEASURED (22 November 2026, session 3; Carl: "Just build it."; the structural note
// `structural-note-cloth-floor-rise-22-november.md`). Frame-stepped (1/30 s): the story replayed from the lean; the cloth's
// points (GPU read-back) every 0.25 s from 1 s before its rise to 2 s after it arrives: the lowest and highest point (cm
// above the floor), the count ON the floor (within 1 cm), the pins' and the hem's mean z (cm from the spot, + toward the
// front), the hand. Then pass 1's "Jump": taken or not. Dials in argv[2] (JSON for `hero.clothArrival`). READ-ONLY.
// ⚠ NOT WATCHED: the drawn surface; what any camera sees; live playback.
import { chromium } from "playwright";
const SET = process.argv[2] ? JSON.parse(process.argv[2]) : {};
const b = await chromium.launch({ channel: "chrome", args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-webgpu"] });
const p = await b.newPage({ viewport: { width: 1896, height: 946 }, deviceScaleFactor: 1 });
const errors = [];
p.on("pageerror", (e) => errors.push(String(e).slice(0, 300)));
await p.goto("http://localhost:3000/proto/hero", { waitUntil: "load" });
await p.waitForFunction(() => window.__heroBench?.hero?.warmed === true, null, { timeout: 300000 });
const r = await p.evaluate(async (SET) => {
  const { hero, renderer, scene } = window.__heroBench;
  renderer.setAnimationLoop(null);
  Object.assign(hero.clothArrival, SET);
  const group = scene.getObjectByName("hero cloth (the example)");
  const upc = hero.unitsPerCm;
  const step = () => { hero.update(1 / 30); hero.compute(renderer); };
  const posA = hero.cloth.points, N = posA.count;
  const sample = async (t) => {
    group.updateMatrixWorld();
    const e = group.matrixWorld.elements;
    const a = new Float32Array(await renderer.getArrayBufferAsync(posA));
    const st = a.length / N;
    let lo = Infinity, hi = -Infinity, on = 0, hz = 0, hn = 0, pz = 0, pn = 0;
    for (let i = 0; i < N; i++) {
      const x = a[i * st], y = a[i * st + 1], z = a[i * st + 2];
      const wy = (e[1] * x + e[5] * y + e[9] * z + e[13] + 437.5) / upc, wz = (e[2] * x + e[6] * y + e[10] * z + e[14] + 16.92) / upc;
      lo = Math.min(lo, wy); hi = Math.max(hi, wy);
      if (wy < 1) on++;
      if (i % 64 === 63) { hz += wz; hn++; }
      if (i % 64 === 0) { pz += wz; pn++; }
    }
    const ai = hero.clothArrivalInfo;
    return { t, lo, hi, on, pins: pz / pn, hem: hz / hn, hand: ai.handCm, handY: ai.handYCm, asleep: ai.laid, visible: group.visible };
  };
  hero.replayArrival(); hero.update(0);
  const rows = [];
  let n = 0, riseF = -1;
  while (n++ < 30 * 60) {
    step();
    if (riseF < 0 && !Number.isNaN(hero.clothArrivalInfo.riseAt)) riseF = n;
    if (riseF > 0) break;
  }
  rows.push(await sample(0));
  const total = Math.ceil((hero.clothArrival.seconds + 3) * 30);
  let firstOffAll = -1;
  for (let f = 1; f <= total; f++) {
    step();
    if (f % 3 === 0 || f === total) {
      const q = await sample(f / 30);
      if (firstOffAll < 0 && q.on === 0) firstOffAll = f / 30;
      if (f % 15 === 0 || f === total) rows.push(q);
    }
  }
  const arrived = hero.clothArrivalInfo.arrived;
  let k = 0;
  while (Number.isNaN(hero.jumpInfo.at) && k++ < 30 * 30) { hero.jump(); step(); }
  return { riseAtS: riseF / 30, rainT: hero.rainInfo?.t, codeBand: hero.rainInfo?.codeBand, rows, firstOffAll, arrived, jumpTaken: !Number.isNaN(hero.jumpInfo.at), jumpWaitS: k / 30 };
}, SET);
console.log(`the rise began ${r.riseAtS.toFixed(1)} s into the replay (the code band ${JSON.stringify(r.codeBand)} on the rain's clock)`);
console.log("   s | lowest | highest (cm above the floor) | points on the floor | pins z | hem z | hand z, y (cm) | asleep, drawn");
for (const q of r.rows) console.log(`${q.t.toFixed(2).padStart(5)} | ${q.lo.toFixed(1).padStart(6)} | ${q.hi.toFixed(1).padStart(7)} | ${String(q.on).padStart(5)} | ${q.pins.toFixed(0).padStart(5)} | ${q.hem.toFixed(0).padStart(5)} | ${q.hand.toFixed(0)}, ${q.handY.toFixed(0)} | ${q.asleep}, ${q.visible}`);
console.log(`clear of the floor (every point) from ${r.firstOffAll} s after the rise began; arrived: ${r.arrived}; pass 1's Jump taken: ${r.jumpTaken} (${r.jumpWaitS.toFixed(1)} s after)`);
await b.close();
console.log(`page errors: ${errors.length}`, errors.slice(0, 5));
