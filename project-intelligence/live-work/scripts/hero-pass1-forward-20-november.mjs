// PASS 1, FORWARD — THE CLOTH ANSWERS THE JUMP, CHECKED (20 November 2026, session 2; D-101). Frame-stepped (1/30 s): "Jump"
// taken, then each frame: the logo's rise, the hand (the pins' offset), and the cloth's points (GPU read-back) — the PINS'
// mean z and the HEM's (bottom row) mean z against the logo's plane (z −16.92); every point INSIDE the raised logo's box
// (x 277.4…1159.6, z −33.7…−0.1, y up to its raised top) — the deepest such point below the raised top = the band the cloth
// passes through (take 3: the box travels with the logo's backward move). Side-on and working-camera frames into argv[2] as two contact sheets. READ-ONLY.
// ⚠ NOT WATCHED: the logo's SHAPE (its box only: points in the box between letters count as "touching"); live playback;
// other wind seeds.
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
const SIDE = { p: [718.48 + 2400, 100, -16.92], t: [718.48, 100, -16.92] };
await p.evaluate(() => {
  const { hero, renderer } = window.__heroBench;
  renderer.setAnimationLoop(null);
  hero.replayArrival();
  hero.cloth.again();
  hero.update(0);
  let n = 0;
  while (Number.isNaN(hero.jumpInfo.at) && n++ < 30 * 120) { hero.jump(); hero.update(1 / 30); hero.compute(renderer); }
});
const FR = 30;
const rows = [];
const sideFiles = [], workFiles = [];
for (let f = 1; f <= FR; f++) {
  const r = await p.evaluate(async () => {
    const { hero, renderer, scene } = window.__heroBench;
    const logo = scene.getObjectByName("hero logo");
    const group = scene.getObjectByName("hero cloth (the example)");
    if (window.__y0 === undefined) { window.__y0 = logo.matrix.elements[13]; window.__z0 = logo.matrix.elements[14]; }
    hero.update(1 / 30);
    hero.compute(renderer);
    const upc = hero.unitsPerCm;
    const rise = (logo.matrix.elements[13] - window.__y0) / upc;
    group.updateMatrixWorld();
    const e = group.matrixWorld.elements;
    const posA = hero.cloth.points, N = posA.count;
    const a = new Float32Array(await renderer.getArrayBufferAsync(posA));
    const st = a.length / N;
    const [gx] = hero.cloth.info.grid; // [columns, rows]
    const top = 20.7 + rise * upc, bottom = -437.5 + rise * upc;
    // take 3: the logo also travels back — its box moves with it
    const back = logo.matrix.elements[14] - window.__z0;
    let pinZ = 0, pinN = 0, hemZ = 0, hemN = 0, inside = 0, deepest = -1;
    const rowsPer = Math.round(N / gx); // points per column (`info.grid` = [columns, rows]; the example's column-major build)
    for (let i = 0; i < N; i++) {
      const x = a[i * st], y = a[i * st + 1], z = a[i * st + 2];
      const wx = e[0] * x + e[4] * y + e[8] * z + e[12], wy = e[1] * x + e[5] * y + e[9] * z + e[13], wz = e[2] * x + e[6] * y + e[10] * z + e[14];
      const row = i % rowsPer;
      if (row === 0) { pinZ += wz; pinN++; }
      if (row === rowsPer - 1) { hemZ += wz; hemN++; }
      if (wx > 277.4 && wx < 1159.6 && wz > -33.7 + back && wz < -0.1 + back && wy < top && wy > bottom) { inside++; deepest = Math.max(deepest, (top - wy) / upc); }
    }
    return { rise, backCm: back / upc, hand: hero.jumpInfo.handCm, pinZ: (pinZ / pinN + 16.92) / upc, hemZ: (hemZ / hemN + 16.92) / upc, inside, deepest, rowsPer, gx };
  });
  rows.push(r);
  if (f % 3 === 0) {
    for (const [v, list, tag] of [[SIDE, sideFiles, "side"], [W, workFiles, "work"]]) {
      await p.evaluate(async (v) => {
        const { renderer, scene, camera } = window.__heroBench;
        camera.position.set(...v.p); camera.lookAt(...v.t); camera.fov = 45; camera.updateProjectionMatrix();
        renderer.render(scene, camera);
        await new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(res)));
      }, v);
      const file = `${OUT}/${tag}-${String(f).padStart(2, "0")}.png`;
      await p.screenshot({ path: file });
      list.push(file);
    }
  }
}
await b.close();
console.log(`grid: ${rows[0].gx} columns × ${rows[0].rowsPer} rows`);
console.log("frame  t(s)  rise  back  hand  pins z  hem z  (cm; z from the logo's plane, + toward camera)  in-box  band(cm)");
rows.forEach((r, i) => console.log(`${String(i + 1).padStart(5)} ${((i + 1) / 30).toFixed(2)} ${r.rise.toFixed(1).padStart(5)} ${r.backCm.toFixed(1).padStart(6)} ${r.hand.toFixed(1).padStart(6)} ${r.pinZ.toFixed(1).padStart(7)} ${r.hemZ.toFixed(1).padStart(6)} ${String(r.inside).padStart(6)} ${r.deepest < 0 ? "-" : r.deepest.toFixed(1)}`));
const cross = (key) => { for (let i = 1; i < rows.length; i++) if (rows[i - 1][key] < 0 && rows[i][key] >= 0) return ((i + rows[i - 1][key] / (rows[i - 1][key] - rows[i][key])) / 30).toFixed(3); return "never"; };
console.log(`pins cross the logo's plane at ${cross("pinZ")} s; the hem at ${cross("hemZ")} s (apex 0.35 s)`);
console.log(`deepest band passed through: ${Math.max(...rows.map((r) => r.deepest)).toFixed(1)} cm below the logo's top`);
console.log(`page errors: ${errors.length}`, errors);
const sheet = (files, name) => execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", ...files.flatMap((f) => ["-i", f]), "-filter_complex", files.map((_, i) => `[${i}]crop=1100:946:398:0,scale=440:-1[v${i}]`).join(";") + ";" + files.map((_, i) => `[v${i}]`).join("") + `xstack=inputs=${files.length}:grid=5x2`, `${OUT}/${name}.png`]);
sheet(sideFiles, "sheet-side");
sheet(workFiles, "sheet-working");
console.log(`sheets: ${OUT}/sheet-side.png, sheet-working.png (every 3rd frame, 0.1 s apart)`);
