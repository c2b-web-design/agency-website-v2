// PASS 1's FIRST JUMP, CHECKED (20 November 2026, session 2; D-101). The story frame-stepped (1/30 s) until "Jump" is taken
// (phase 1's wobble done), then frame by frame: the logo's rise (its matrix's y against the standing pose), its time in the
// air, and the cloth's points (GPU read-back) against the logo's BACK face and its raised TOP. Stills into argv[2]: the
// working camera standing and at the apex, and SIDE ON (90°, from the right) at the apex. READ-ONLY.
// ⚠ NOT WATCHED: live playback (the bench's own clock); the landing's wobble beyond its start; other wind seeds.
import { chromium } from "playwright";
import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";
const [OUT] = process.argv.slice(2);
mkdirSync(OUT, { recursive: true });
const b = await chromium.launch({ channel: "chrome", args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-webgpu"] });
const p = await b.newPage({ viewport: { width: 1896, height: 946 }, deviceScaleFactor: 1 });
const errors = [];
p.on("pageerror", (e) => errors.push(String(e).slice(0, 200)));
await p.goto("http://localhost:3000/proto/hero", { waitUntil: "load" });
await p.waitForFunction(() => window.__heroBench?.hero?.warmed === true, null, { timeout: 180000 });
await p.addStyleTag({ content: ".lil-gui, nextjs-portal { display: none !important; } [data-hero-bench] > div:not(.lil-gui) { display: none !important; }" });
const W = { p: [675.5, -2.8, 2203.3], t: [695.4, -0.4, 0.9] };
const SIDE = { p: [718.48 + 2203.3 + 16.92, -2.8, -16.92 - 150], t: [718.48, -0.4, -16.92 - 150] };
const shot = async (v, name) => {
  await p.evaluate(async (v) => {
    const { renderer, scene, camera } = window.__heroBench;
    camera.position.set(...v.p);
    camera.lookAt(...v.t);
    camera.fov = 45;
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);
    await new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(res)));
  }, v);
  await p.screenshot({ path: `${OUT}/${name}.png` });
  return `${OUT}/${name}.png`;
};
await p.evaluate(() => {
  const { hero, renderer } = window.__heroBench;
  renderer.setAnimationLoop(null);
  hero.replayArrival();
  hero.cloth.again();
  hero.update(0);
  let n = 0;
  while (Number.isNaN(hero.jumpInfo.at) && n++ < 30 * 120) {
    hero.jump();
    hero.update(1 / 30);
    hero.compute(renderer);
  }
});
const files = [await shot(W, "1-standing")];
const r = await p.evaluate(async () => {
  const { hero, renderer, scene } = window.__heroBench;
  const logo = scene.getObjectByName("hero logo");
  const group = scene.getObjectByName("hero cloth (the example)");
  const upc = hero.unitsPerCm;
  // the standing pose's y (the jump was taken this frame: one frame in, so step back by reading the matrix next frames)
  const y0 = logo.matrix.elements[13] - 0; // taken at s = 0 (dy 0)
  const posA = hero.cloth.points, N = posA.count;
  const BACK_Z = -33.7, TOP_Y = 20.7; // the standing logo's back face and top (hero-logo-frame-20-november.mjs)
  const rows = [];
  let maxRise = 0, apexF = 0, landF = -1, clothFront = -Infinity, nearestGapCm = Infinity;
  for (let f = 1; f <= 45; f++) {
    hero.update(1 / 30);
    hero.compute(renderer);
    const rise = (logo.matrix.elements[13] - y0) / upc;
    if (rise > maxRise) { maxRise = rise; apexF = f; }
    if (landF < 0 && f > 3 && rise <= 0.01) landF = f;
    group.updateMatrixWorld();
    const e = group.matrixWorld.elements;
    const a = new Float32Array(await renderer.getArrayBufferAsync(posA));
    const st = a.length / N;
    const top = TOP_Y + rise * upc;
    for (let i = 0; i < N; i++) {
      const x = a[i * st], y = a[i * st + 1], z = a[i * st + 2];
      const wy = e[1] * x + e[5] * y + e[9] * z + e[13], wz = e[2] * x + e[6] * y + e[10] * z + e[14];
      if (wy < top) { // a cloth point level with the raised logo
        if (wz > clothFront) clothFront = wz;
        nearestGapCm = Math.min(nearestGapCm, (BACK_Z - wz) / upc);
      }
    }
    rows.push(+rise.toFixed(1));
  }
  return { maxRise, apexF, landF, clothFront, nearestGapCm, rows, info: hero.jumpInfo };
});
console.log(`jump asked → taken at emission ${r.info.at.toFixed(2)} s; height dial ${r.info.apexCm} cm; flight (formula) ${r.info.flightS.toFixed(3)} s`);
console.log(`measured: rise ${r.maxRise.toFixed(1)} cm at frame ${r.apexF} (${(r.apexF / 30).toFixed(2)} s); back down at frame ${r.landF} (${(r.landF / 30).toFixed(2)} s)`);
console.log(`cloth points level with the raised logo: nearest to the logo's back ${Number.isFinite(r.nearestGapCm) ? r.nearestGapCm.toFixed(1) + " cm behind it" : "none below its top"}`);
console.log("rise per frame (cm):", r.rows.join(" "));
// the apex again, for stills: replay to the apex frame
await p.evaluate((apexF) => {
  const { hero, renderer } = window.__heroBench;
  hero.replayArrival();
  hero.cloth.again();
  hero.update(0);
  let n = 0;
  while (Number.isNaN(hero.jumpInfo.at) && n++ < 30 * 120) { hero.jump(); hero.update(1 / 30); hero.compute(renderer); }
  for (let f = 1; f <= apexF; f++) { hero.update(1 / 30); hero.compute(renderer); }
}, r.apexF);
files.push(await shot(W, "2-apex-working"), await shot(SIDE, "3-apex-side"));
await b.close();
console.log(`page errors: ${errors.length}`, errors);
execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", ...files.flatMap((f) => ["-i", f]), "-filter_complex", files.map((_, i) => `[${i}]scale=948:-1[v${i}]`).join(";") + ";" + files.map((_, i) => `[v${i}]`).join("") + `xstack=inputs=3:layout=0_0|948_0|0_473`, `${OUT}/sheet.png`]);
console.log(`sheet: ${OUT}/sheet.png`);
