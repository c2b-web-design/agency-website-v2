// LOCKED FOLDS IN THE CLOTH, COUNTED (20 November 2026, session 2; Carl, two stills of a creased hem "after a few jumps":
// "What is happening here?"). Frame-stepped: the story replayed; the cloth's grid read back (GPU) BEFORE any pass, then
// after each of argv[2] passes (default 4; "Jump", the whole pass, "Reset pass 1", argv[3] s to settle, default 4). Each
// grid cell (four points) gets its normal; a cell whose normal points AGAINST the sheet's mean normal is FLIPPED — a
// piece of cloth turned over on itself and held there. Reported: how many, and in which rows (0 = the pins, 63 = the hem)
// and columns. READ-ONLY. ⚠ NOT WATCHED: folds that are tight but not flipped; the drawn mesh.
import { chromium } from "playwright";
const PASSES = Number(process.argv[2] ?? 4);
const SETTLE = Number(process.argv[3] ?? 4);
// argv[4]: the cloth's settings to try, JSON (e.g. {"friction":0,"marginCm":3}) — set in THIS browser only, not the code
const SET = JSON.parse(process.argv[4] ?? "{}");
const b = await chromium.launch({ channel: "chrome", args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-webgpu"] });
const p = await b.newPage({ viewport: { width: 1896, height: 946 }, deviceScaleFactor: 1 });
await p.goto("http://localhost:3000/proto/hero", { waitUntil: "load" });
await p.waitForFunction(() => window.__heroBench?.hero?.warmed === true && window.__heroBench.hero.cloth.collider, null, { timeout: 180000 });
const r = await p.evaluate(async ({ PASSES, SETTLE, SET }) => {
  const { hero, renderer } = window.__heroBench;
  Object.assign(hero.cloth.settings, SET);
  renderer.setAnimationLoop(null);
  const step = () => { hero.update(1 / 30); hero.compute(renderer); };
  const [cols, rows] = hero.cloth.info.grid;
  const posA = hero.cloth.points, N = posA.count;
  const flipped = async () => {
    const a = new Float32Array(await renderer.getArrayBufferAsync(posA));
    const st = a.length / N;
    const P = (c, r) => { const i = (c * rows + r) * st; return [a[i], a[i + 1], a[i + 2]]; };
    const normals = [];
    let mx = 0, my = 0, mz = 0;
    for (let c = 0; c < cols - 1; c++) for (let r = 0; r < rows - 1; r++) {
      const p0 = P(c, r), p1 = P(c + 1, r), p2 = P(c, r + 1), p3 = P(c + 1, r + 1);
      const u = [p3[0] - p0[0], p3[1] - p0[1], p3[2] - p0[2]], v = [p2[0] - p1[0], p2[1] - p1[1], p2[2] - p1[2]];
      const n = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
      const l = Math.hypot(...n) || 1;
      normals.push([c, r, n[0] / l, n[1] / l, n[2] / l]);
      mx += n[0] / l; my += n[1] / l; mz += n[2] / l;
    }
    const out = normals.filter(([, , x, y, z]) => x * mx + y * my + z * mz < 0);
    const rowsHit = [...new Set(out.map((o) => o[1]))].sort((x, y) => x - y);
    const colsHit = out.map((o) => o[0]);
    return { count: out.length, rows: rowsHit, cols: colsHit.length ? [Math.min(...colsHit), Math.max(...colsHit)] : [] };
  };
  hero.replayArrival(); hero.cloth.again(); hero.update(0);
  const report = [];
  let n = 0;
  // to the moment a pass can start (the jump asked until taken), measured before taking it
  while (Number.isNaN(hero.jumpInfo.at) && n++ < 30 * 120) { step(); if (n > 30 * 20) break; }
  report.push({ when: "before any pass", ...(await flipped()) });
  for (let pass = 1; pass <= PASSES; pass++) {
    const before = hero.jumpInfo.at;
    n = 0;
    while ((Number.isNaN(hero.jumpInfo.at) || hero.jumpInfo.at === before) && n++ < 30 * 120) { hero.jump(); step(); }
    for (let f = 0; f < 30 * 8; f++) step();
    report.push({ when: `after pass ${pass}`, ...(await flipped()) });
    hero.resetPass1();
    for (let f = 0; f < SETTLE * 30; f++) step();
    report.push({ when: `after pass ${pass} + reset`, ...(await flipped()) });
  }
  return { report, grid: [cols, rows] };
}, { PASSES, SETTLE, SET });
await b.close();
console.log(`settings tried: ${JSON.stringify(SET)}`);
console.log(`grid ${r.grid[0]} columns × ${r.grid[1]} rows (row 0 = the pins, ${r.grid[1] - 1} = the hem)`);
for (const q of r.report) console.log(`${q.when.padEnd(26)} flipped cells: ${q.count}${q.count ? `  rows ${q.rows.join(",")}  columns ${q.cols.join("–")}` : ""}`);
