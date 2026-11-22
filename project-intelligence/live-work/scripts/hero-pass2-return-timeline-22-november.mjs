// PASS 2's RETURN, AS A TIMELINE (22 November 2026, session 3; Carl: "Pass 2 cloth finish is far too close" … "it looks
// ....... messy"; the un-swivel seen flinging the cloth, D-101). Frame-stepped (1/30 s): pass 1 whole and settled, pass 2's
// "Jump", then from the reverse move's take-off: every 1/10 s the logo's centre z (cm from the spot, + toward the front
// camera), its TILT off upright (deg: the un-swivel's progress, 90 = on its side), the hand (the cloth's top) and the
// count of cloth points TOUCHING the logo (within the margin + 0.75 cm, by the field it collides with); then, after the
// landing's wobble, every 0.5 s for 4 s: the hand, the hem's mean z and the NEAREST cloth point to the logo's surface.
// argv[3] "whole": from pass 2's own take-off instead (5.5 s). Dials in argv[2] (JSON, one set or a list; set in THIS browser only). READ-ONLY.
// ⚠ NOT WATCHED: the drawn surface; live playback; where on the logo the touches are (see hero-pass2-reverse-20-november.mjs).
import { chromium } from "playwright";
const SETS = process.argv[2] ? JSON.parse(process.argv[2]) : [{}];
const WHOLE = process.argv[3] === "whole"; // time from pass 2's own take-off (the swivel), not the reverse move's
const b = await chromium.launch({ channel: "chrome", args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-webgpu"] });
const p = await b.newPage({ viewport: { width: 1896, height: 946 }, deviceScaleFactor: 1 });
const errors = [];
p.on("pageerror", (e) => errors.push(String(e).slice(0, 300)));
await p.goto("http://localhost:3000/proto/hero", { waitUntil: "load" });
await p.waitForFunction(() => window.__heroBench?.hero?.warmed === true && window.__heroBench.hero.cloth.collider, null, { timeout: 300000 });
for (const SET of Array.isArray(SETS) ? SETS : [SETS]) {
  const r = await p.evaluate(async ([SET, WHOLE]) => {
    const { hero, renderer, scene } = window.__heroBench;
    renderer.setAnimationLoop(null);
    Object.assign(hero.pass2, SET);
    const logo = scene.getObjectByName("hero logo");
    const group = scene.getObjectByName("hero cloth (the example)");
    const col = hero.cloth.collider, img = col.tex.image, W = img.width, H = img.height, upc = hero.unitsPerCm;
    const h2f = (h) => { const s = h & 0x8000 ? -1 : 1, e = (h >> 10) & 0x1f, f = h & 0x3ff; return e === 0 ? s * 2 ** -14 * (f / 1024) : s * 2 ** (e - 15) * (1 + f / 1024); };
    const field = new Float32Array(W * H);
    for (let i = 0; i < W * H; i++) field[i] = h2f(img.data[i * 4]);
    const flatAt = (x, y) => {
      const u = ((x - col.minX) / col.sizeX) * W - 0.5, v = ((y - col.minY) / col.sizeY) * H - 0.5;
      const uc = Math.min(W - 1, Math.max(0, u)), vc = Math.min(H - 1, Math.max(0, v));
      const off = Math.hypot((u - uc) * (col.sizeX / W), (v - vc) * (col.sizeY / H));
      return field[W * Math.round(vc) + Math.round(uc)] + off;
    };
    const dist = (x, y, z) => { const fl = flatAt(x, y), dp = Math.max(col.zMin - z, z - col.zMax); return Math.hypot(Math.max(fl, 0), Math.max(dp, 0)) + Math.min(Math.max(fl, dp), 0); };
    const margin = hero.cloth.settings.marginCm;
    const step = () => { hero.update(1 / 30); hero.compute(renderer); };
    if (!logo.geometry.boundingBox) logo.geometry.computeBoundingBox();
    const lb = logo.geometry.boundingBox;
    const home = logo.matrix.clone();
    const posA = hero.cloth.points, N = posA.count;
    const sample = async () => {
      const inv = logo.matrix.clone().invert();
      group.updateMatrixWorld();
      const m = inv.clone().multiply(group.matrixWorld).elements, e = group.matrixWorld.elements;
      const a = new Float32Array(await renderer.getArrayBufferAsync(posA));
      const st = a.length / N;
      let near = Infinity, hz = 0, hy = 0, hn = 0, touching = 0, zMin = Infinity, zMax = -Infinity;
      for (let i = 0; i < N; i++) {
        const x = a[i * st], y = a[i * st + 1], z = a[i * st + 2];
        if (i % 64 === 63) { hz += e[2] * x + e[6] * y + e[10] * z + e[14]; hy += e[1] * x + e[5] * y + e[9] * z + e[13]; hn++; }
        const wz = e[2] * x + e[6] * y + e[10] * z + e[14];
        zMin = Math.min(zMin, wz); zMax = Math.max(zMax, wz);
        const lx = m[0] * x + m[4] * y + m[8] * z + m[12], ly = m[1] * x + m[5] * y + m[9] * z + m[13], lz = m[2] * x + m[6] * y + m[10] * z + m[14];
        const d = dist(lx, ly, lz);
        near = Math.min(near, d);
        if (d < margin + 0.75) touching++;
      }
      const c = lb.getCenter(logo.position.clone()).applyMatrix4(logo.matrix);
      const up = new logo.position.constructor(0, 1, 0).transformDirection(logo.matrix.clone().multiply(home.clone().invert()));
      const tilt = (Math.acos(Math.min(1, Math.max(-1, up.y))) * 180) / Math.PI;
      return { hand: hero.jumpInfo.handCm - 60, hem: (hz / hn + 16.92) / upc, hemH: (hy / hn + 437.5) / upc, zMin: (zMin + 16.92) / upc, zMax: (zMax + 16.92) / upc, logoZ: (c.z + 16.92) / upc, logoH: (c.y + 437.5) / upc, tilt, near, touching };
    };
    hero.replayArrival(); hero.cloth.again(); hero.update(0);
    let n = 0;
    while (Number.isNaN(hero.jumpInfo.at) && n++ < 30 * 120) { hero.jump(); step(); }
    n = 0;
    while (!hero.pass2Info.pass1Done && n++ < 30 * 20) step();
    for (let f = 0; f < 30 * 2.5; f++) step();
    n = 0;
    while (Number.isNaN(hero.pass2Info.at) && n++ < 30 * 10) { hero.jump(); step(); }
    // FROM: the reverse move's take-off, or (argv[3] "whole") pass 2's own take-off
    n = 0;
    if (!WHOLE) while (Number.isNaN(hero.pass2Info.backAt) && n++ < 30 * 30) step();
    const tl = [];
    const frames = Math.ceil((WHOLE ? 5.5 : 1.64 + 1.2) * 30);
    for (let f = 1; f <= frames; f++) {
      step();
      if (f % 3 === 0) tl.push({ t: f / 30, ...(await sample()) });
    }
    n = 0;
    while (!hero.pass2Info.pass2Done && n++ < 30 * 10) step();
    const end = [];
    for (let k = 0; k <= 8; k++) {
      end.push({ t: k * 0.5, ...(await sample()) });
      for (let f = 0; f < 15; f++) step();
    }
    return { SET: { ...hero.pass2 }, back: hero.pass2Info.backFlightS, tl, end };
  }, [SET, WHOLE]);
  console.log(`\n=== ${JSON.stringify(SET)} — the reverse flight ${r.back.toFixed(2)} s`);
  console.log("  t(s) | logo z | logo h | tilt° | hand | hem z | hem h | cloth z from..to | touching");
  for (const q of r.tl) console.log(`${q.t.toFixed(2).padStart(6)} | ${q.logoZ.toFixed(0).padStart(6)} | ${q.logoH.toFixed(0).padStart(6)} | ${q.tilt.toFixed(0).padStart(5)} | ${q.hand.toFixed(0).padStart(4)} | ${q.hem.toFixed(0).padStart(5)} | ${q.hemH.toFixed(0).padStart(5)} | ${q.zMin.toFixed(0).padStart(5)}..${q.zMax.toFixed(0).padStart(4)} | ${String(q.touching).padStart(5)}`);
  console.log("  after pass 2 is done: s | hand | hem | logo z | nearest (cm)");
  for (const q of r.end) console.log(`${q.t.toFixed(1).padStart(6)} | ${q.hand.toFixed(0).padStart(4)} | ${q.hem.toFixed(0).padStart(4)} | ${q.logoZ.toFixed(0).padStart(5)} | ${q.near.toFixed(1)}`);
}
await b.close();
console.log(`page errors: ${errors.length}`, errors.slice(0, 5));
