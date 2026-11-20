// ⚠ TAKE 2 (the beat): the backward action now runs BY ITSELF after the forward landing's wobble; this script's second
// "ask" just waits for it. argv[4]: `backJumpDelayS` values (comma-separated) to sweep with each retreat.
// PASS 1, BACKWARD — HOW FAR THE CLOTH MUST RETREAT FOR THE FORWARD ACTION's COVERAGE (20 November 2026, session 2; Carl: "the
// logo needs to jump back to its default position but the cloth is further away. it needs to meet it to get the same
// coverage"). For each `clothBackToCm` in argv[2] (cm from the logo's spot; default -60,-90,-120,-150,-180,-210), with the
// jump as set (95 cm; forward apex 34 cm back): replayed, frame-stepped (1/30 s); the FORWARD action, then the BACKWARD one
// as early as it can be taken (argv[3] extra seconds of wait, default 0); in each flight the deepest cloth point inside the
// moving logo's box; the share of the front face above it (front-facing triangles by height). Also the hem's z at the
// backward take-off. A BALLPARK: the band read as touched across the width; points between letters count; one wind run.
// READ-ONLY.
import { chromium } from "playwright";
const ENDS = (process.argv[2] ?? "-60,-90,-120,-150,-180,-210").split(",").map(Number);
const WAIT = Number(process.argv[3] ?? 0);
const DELAYS = (process.argv[4] ?? "1").split(",").map(Number);
// argv[5]: seconds of waiting before "Jump" is pressed (comma-separated) — the press's moment against the wind (the tolerance)
const PRES = (process.argv[5] ?? "0").split(",").map(Number);
const b = await chromium.launch({ channel: "chrome", args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-webgpu"] });
const p = await b.newPage({ viewport: { width: 1896, height: 946 }, deviceScaleFactor: 1 });
await p.goto("http://localhost:3000/proto/hero", { waitUntil: "load" });
await p.waitForFunction(() => window.__heroBench?.hero?.warmed === true, null, { timeout: 180000 });
const faceBins = await p.evaluate(async () => {
  const { hero, renderer, scene } = window.__heroBench;
  renderer.setAnimationLoop(null);
  hero.replayArrival(); hero.cloth.again(); hero.update(0);
  for (let n = 0; n < 30 * 30; n++) { hero.update(1 / 30); hero.compute(renderer); }
  const logo = scene.getObjectByName("hero logo");
  logo.updateMatrixWorld();
  const g = logo.geometry, pos = g.attributes.position, idx = g.index, m = logo.matrixWorld, upc = hero.unitsPerCm;
  const V = (i) => logo.position.clone().fromBufferAttribute(pos, i).applyMatrix4(m);
  let top = -Infinity;
  for (let i = 0; i < pos.count; i++) top = Math.max(top, V(i).y);
  const bins = new Array(110).fill(0);
  const n = idx ? idx.count : pos.count;
  for (let t = 0; t < n; t += 3) {
    const [a, b2, c] = [0, 1, 2].map((k) => V(idx ? idx.getX(t + k) : t + k));
    const nrm = b2.clone().sub(a).cross(c.clone().sub(a));
    const area2 = nrm.length();
    if (!area2 || nrm.z / area2 < 0.7) continue;
    bins[Math.min(109, Math.max(0, Math.floor((top - (a.y + b2.y + c.y) / 3) / upc)))] += area2 / 2 / (upc * upc);
  }
  return bins;
});
const total = faceBins.reduce((a, b) => a + b, 0);
const share = (d) => { if (d < 0) return 0; let s = 0; for (let k = 0; k < Math.min(110, Math.floor(d)); k++) s += faceBins[k]; return Math.round((100 * s) / total); };
for (const E of ENDS) for (const D of DELAYS) for (const PRE of PRES) {
  const r = await p.evaluate(async ({ E, WAIT, D, PRE }) => {
    const { hero, renderer, scene } = window.__heroBench;
    hero.pass1.clothBackToCm = E;
    hero.pass1.backJumpDelayS = D;
    hero.replayArrival(); hero.cloth.again(); hero.update(0);
    const logo = scene.getObjectByName("hero logo");
    const group = scene.getObjectByName("hero cloth (the example)");
    const upc = hero.unitsPerCm;
    const step = () => { hero.update(1 / 30); hero.compute(renderer); };
    // one action: ask until taken, then measure its flight
    const action = async (waitS) => {
      for (let k = 0; k < waitS * 30; k++) step();
      const before = hero.jumpInfo.at;
      let n = 0;
      while ((Number.isNaN(hero.jumpInfo.at) || hero.jumpInfo.at === before) && n++ < 30 * 120) { hero.jump(); step(); }
      const y0 = logo.matrix.elements[13];
      // the hem at take-off (bottom row mean z, cm from the spot's plane)
      group.updateMatrixWorld();
      let e = group.matrixWorld.elements;
      const posA = hero.cloth.points, N = posA.count;
      let a = new Float32Array(await renderer.getArrayBufferAsync(posA));
      const st = a.length / N;
      let hz = 0, hn = 0;
      for (let i = 63; i < N; i += 64) { hz += e[2] * a[i * st] + e[6] * a[i * st + 1] + e[10] * a[i * st + 2] + e[14]; hn++; }
      const hemZ = (hz / hn + 16.92) / upc;
      const z0 = logo.matrix.elements[14];
      let deepest = -1, first = -1, last = -1, apexHand = NaN, apexHem = NaN;
      const apexF = Math.round((hero.jumpInfo.flightS / 2) * 30);
      const frames = Math.ceil(hero.jumpInfo.flightS * 30) + 2;
      for (let f = 1; f <= frames; f++) {
        step();
        const rise = logo.matrix.elements[13] - y0;
        const zNow = logo.matrix.elements[14];
        group.updateMatrixWorld();
        e = group.matrixWorld.elements;
        a = new Float32Array(await renderer.getArrayBufferAsync(posA));
        const top = 20.7 + rise, bottom = -437.5 + rise;
        const zf = zNow - z0 + (z0 - window.__heroBench.__zSpot); // the logo's z offset from its spot (world)
        if (f === apexF) {
          let hz2 = 0, hn2 = 0;
          for (let i = 63; i < N; i += 64) { hz2 += e[2] * a[i * st] + e[6] * a[i * st + 1] + e[10] * a[i * st + 2] + e[14]; hn2++; }
          apexHem = (hz2 / hn2 + 16.92) / upc;
          apexHand = hero.jumpInfo.handCm - 60; // the hand from the spot (its place is 60 cm behind)
        }
        for (let i = 0; i < N; i++) {
          const x = a[i * st], y = a[i * st + 1], z = a[i * st + 2];
          const wx = e[0] * x + e[4] * y + e[8] * z + e[12], wy = e[1] * x + e[5] * y + e[9] * z + e[13], wz = e[2] * x + e[6] * y + e[10] * z + e[14];
          if (wx > 277.4 && wx < 1159.6 && wz > -33.7 + zf && wz < -0.1 + zf && wy < top && wy > bottom) { deepest = Math.max(deepest, (top - wy) / upc); if (first < 0) first = f / 30; last = f / 30; }
        }
      }
      return { deepest, first, last, apexHand, apexHem, hemZ, logoBack: hero.jumpInfo.logoBackCm, hand: hero.jumpInfo.handCm };
    };
    window.__heroBench.__zSpot = logo.matrix.elements[14];
    const fwd = await action(PRE);
    // the standing pose's z before the forward jump (the spot): read after replay — the logo stands on its spot then
    const bwd = await action(WAIT);
    return { fwd, bwd };
  }, { E, WAIT, D, PRE });
  console.log(`PRESS +${PRE} s (hem at take-off ${r.fwd.hemZ.toFixed(1)} cm) → FORWARD ${r.fwd.deepest.toFixed(1)} cm ~${share(r.fwd.deepest)}% | BACKWARD ${r.bwd.deepest < 0 ? "none" : r.bwd.deepest.toFixed(1) + " cm"} ~${share(r.bwd.deepest)}%`);
  console.log(`delay ${D} s; at the backward apex: hand ${r.bwd.apexHand.toFixed(0)} cm, hem ${r.bwd.apexHem.toFixed(0)} cm from the spot`);
  console.log(`cloth back to ${E} cm: FORWARD band ${r.fwd.deepest.toFixed(1)} cm ~${share(r.fwd.deepest)}% (${r.fwd.first}–${r.fwd.last} s) | BACKWARD hem at take-off ${r.bwd.hemZ.toFixed(0)} cm, band ${r.bwd.deepest < 0 ? "none" : r.bwd.deepest.toFixed(1) + " cm"} ~${share(r.bwd.deepest)}% (${r.bwd.first < 0 ? "-" : r.bwd.first.toFixed(2) + "–" + r.bwd.last.toFixed(2) + " s"}); after: logo ${r.bwd.logoBack} cm back, hand ${r.bwd.hand.toFixed(0)}`);
}
await b.close();
