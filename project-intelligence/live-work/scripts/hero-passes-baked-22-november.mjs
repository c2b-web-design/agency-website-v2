// THE PASSES BAKED IN, TIMED (22 November 2026, session 3; R-111; Carl: "Give the cloth a beat when it arrives … Wait till
// the logo has stopped wobbling."). Frame-stepped (1/30 s): the story replayed from the lean with NO "Jump" pressed; the
// story times (s from the replay) of the cloth's arrival, each pass's take-off and its end (home and settled), and at pass
// 1's take-off the hem's mean z (cm from the spot; + toward the front). READ-ONLY.
// ⚠ NOT WATCHED: the drawn surface; the contact (see the passes' own harnesses); live playback.
import { chromium } from "playwright";
const b = await chromium.launch({ channel: "chrome", args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-webgpu"] });
const p = await b.newPage({ viewport: { width: 1896, height: 946 }, deviceScaleFactor: 1 });
const errors = [];
p.on("pageerror", (e) => errors.push(String(e).slice(0, 300)));
await p.goto("http://localhost:3000/proto/hero", { waitUntil: "load" });
await p.waitForFunction(() => window.__heroBench?.hero?.warmed === true, null, { timeout: 300000 });
const r = await p.evaluate(async () => {
  const { hero, renderer, scene } = window.__heroBench;
  renderer.setAnimationLoop(null);
  const group = scene.getObjectByName("hero cloth (the example)");
  const upc = hero.unitsPerCm;
  const hemZ = async () => {
    group.updateMatrixWorld();
    const e = group.matrixWorld.elements, posA = hero.cloth.points, N = posA.count;
    const a = new Float32Array(await renderer.getArrayBufferAsync(posA)), st = a.length / N;
    let z = 0, n = 0;
    for (let i = 63; i < N; i += 64) { z += e[2] * a[i * st] + e[6] * a[i * st + 1] + e[10] * a[i * st + 2] + e[14]; n++; }
    return (z / n + 16.92) / upc;
  };
  hero.replayArrival(); hero.update(0);
  const ev = [];
  let arrived = false, p1 = false, p1Done = false, cur = 0, done = { 2: false, 3: false, 4: false }, hemAtP1 = NaN, t = 0;
  for (let f = 1; f <= 30 * 120; f++) {
    hero.update(1 / 30); hero.compute(renderer); t = f / 30;
    const ai = hero.clothArrivalInfo, j = hero.jumpInfo, i2 = hero.pass2Info;
    if (!arrived && ai.arrived) { arrived = true; ev.push(["the cloth arrives", t]); }
    if (!p1 && !Number.isNaN(j.at)) { p1 = true; ev.push(["pass 1 takes off", t]); hemAtP1 = await hemZ(); }
    if (!p1Done && i2.pass1Done) { p1Done = true; ev.push(["pass 1 lands home (its wobble follows)", t]); }
    if (!Number.isNaN(i2.at) && i2.pass !== cur) { cur = i2.pass; ev.push([`pass ${cur} takes off`, t]); }
    for (const k of [2, 3, 4]) if (!done[k] && i2[`pass${k}Done`]) { done[k] = true; ev.push([`pass ${k} home and settled`, t]); }
    if (done[4]) break;
  }
  return { ev, hemAtP1 };
});
let prev = null;
for (const [what, t] of r.ev) { console.log(`${t.toFixed(2).padStart(6)} s  ${what}${prev === null ? "" : `  (+${(t - prev).toFixed(2)} s)`}`); prev = t; }
console.log(`the hem at pass 1's take-off: ${r.hemAtP1.toFixed(0)} cm from the spot (the pins at −60)`);
await b.close();
console.log(`page errors: ${errors.length}`, errors.slice(0, 5));
