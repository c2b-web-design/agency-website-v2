// ⚠ 20 November 2026 (later): "Reset" now restores the cloth to its state at pass 1's first take-off and the logo home (not a replay).
// AFTER PASS 2, THE RESET AND PASS 1 AGAIN (20 November 2026, session 2; Carl: "when i try to reset jump 2 the screen flashes
// and goes crazy" and "jump 1 now starts from -75 and not -60. Why?"). Frame-stepped (1/30 s): a FRESH pass 1's take-off
// read first; then pass 1 whole, pass 2's swivel and landing, "Reset", and pass 1 pressed again after argv[2] seconds
// (comma-separated waits, default 0,2,4,8). At each pass 1 take-off: the HAND (cm from the cloth's place; 0 = 60 cm behind
// the spot), the HEM's mean z (cm from the logo's plane), the logo's pose (upright? where?), and any non-finite cloth
// points (an exploded cloth). READ-ONLY.
import { chromium } from "playwright";
const WAITS = (process.argv[2] ?? "0,2,4,8").split(",").map(Number);
const b = await chromium.launch({ channel: "chrome", args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-webgpu"] });
const p = await b.newPage({ viewport: { width: 1896, height: 946 }, deviceScaleFactor: 1 });
const errors = [];
p.on("pageerror", (e) => errors.push(String(e).slice(0, 300)));
await p.goto("http://localhost:3000/proto/hero", { waitUntil: "load" });
await p.waitForFunction(() => window.__heroBench?.hero?.warmed === true && window.__heroBench.hero.cloth.collider, null, { timeout: 180000 });
for (const WAIT of WAITS) {
  const r = await p.evaluate(async (WAIT) => {
    const { hero, renderer, scene } = window.__heroBench;
    renderer.setAnimationLoop(null);
    const step = () => { hero.update(1 / 30); hero.compute(renderer); };
    const logo = scene.getObjectByName("hero logo");
    const group = scene.getObjectByName("hero cloth (the example)");
    const upc = hero.unitsPerCm;
    const posA = hero.cloth.points, N = posA.count;
    const state = async () => {
      group.updateMatrixWorld();
      const e = group.matrixWorld.elements;
      const a = new Float32Array(await renderer.getArrayBufferAsync(posA));
      const st = a.length / N;
      let bad = 0, hz = 0, hn = 0;
      for (let i = 0; i < N; i++) {
        const x = a[i * st], y = a[i * st + 1], z = a[i * st + 2];
        if (!Number.isFinite(x + y + z)) { bad++; continue; }
        if (i % 64 === 63) { hz += e[2] * x + e[6] * y + e[10] * z + e[14]; hn++; }
      }
      const m = logo.matrix.elements;
      const upright = Math.abs(m[5]) > 0.9 * Math.hypot(m[4], m[5], m[6]);
      return { hand: hero.jumpInfo.handCm, hemZ: hn ? (hz / hn + 16.92) / upc : NaN, bad, upright, pass1Done: hero.pass2Info.pass1Done, p2: !Number.isNaN(hero.pass2Info.at) };
    };
    // pass 1 from a fresh replay: its take-off
    hero.replayArrival(); hero.cloth.again(); hero.update(0);
    let n = 0;
    while (Number.isNaN(hero.jumpInfo.at) && n++ < 30 * 120) { hero.jump(); step(); }
    const fresh = await state();
    n = 0;
    while (!hero.pass2Info.pass1Done && n++ < 30 * 20) step();
    for (let f = 0; f < 30 * 2.5; f++) step();
    n = 0;
    while (Number.isNaN(hero.pass2Info.at) && n++ < 30 * 10) { hero.jump(); step(); }
    for (let f = 0; f < 30 * 3.5; f++) step();
    const beforeReset = await state();
    hero.resetPass1();
    step();
    for (let f = 0; f < 30 * WAIT; f++) step();
    const atPress = await state();
    const before = hero.jumpInfo.at;
    n = 0;
    while ((Number.isNaN(hero.jumpInfo.at) || hero.jumpInfo.at === before) && n++ < 30 * 60) { hero.jump(); step(); }
    const again = n < 30 * 60 ? await state() : null;
    return { fresh, beforeReset, atPress, again, waitedFrames: n };
  }, WAIT);
  const f = (s) => (s ? `hand ${s.hand.toFixed(1)} cm, hem ${s.hemZ.toFixed(1)} cm, logo upright ${s.upright}, pass 2 set ${s.p2}, non-finite ${s.bad}` : "NOT TAKEN within 60 s");
  console.log(`WAIT ${WAIT} s after "Reset":`);
  console.log(`  fresh pass 1 take-off:  ${f(r.fresh)}`);
  console.log(`  before the reset:       ${f(r.beforeReset)}`);
  console.log(`  ${WAIT} s after the reset: ${f(r.atPress)}`);
  console.log(`  pass 1 again, take-off: ${f(r.again)} (after ${(r.waitedFrames / 30).toFixed(2)} s of pressing)`);
}
await b.close();
console.log(`page errors: ${errors.length}`, errors.slice(0, 5));
