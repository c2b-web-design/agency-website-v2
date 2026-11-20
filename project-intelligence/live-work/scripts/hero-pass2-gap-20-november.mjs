// AFTER PASS 2's SWIVEL, HOW FAR THE LOGO IS FROM THE CLOTH (20 November 2026, session 2; Carl: "after the backwards action
// in pass 2 how far away is the logo from the cloth?"). Frame-stepped (1/30 s): pass 1 whole, pass 2's swivel (the jump
// backwards) and its landing; then every 0.5 s for 4 s: the hand (the cloth's top) and the hem's mean z, the logo's centre
// z (cm from the spot; + toward the front camera), and the NEAREST cloth point to the logo's surface (the collider's field).
// READ-ONLY.
import { chromium } from "playwright";
const b = await chromium.launch({ channel: "chrome", args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-webgpu"] });
const p = await b.newPage({ viewport: { width: 1896, height: 946 }, deviceScaleFactor: 1 });
await p.goto("http://localhost:3000/proto/hero", { waitUntil: "load" });
await p.waitForFunction(() => window.__heroBench?.hero?.warmed === true && window.__heroBench.hero.cloth.collider, null, { timeout: 300000 });
const r = await p.evaluate(async () => {
  const { hero, renderer, scene } = window.__heroBench;
  renderer.setAnimationLoop(null);
  const step = () => { hero.update(1 / 30); hero.compute(renderer); };
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
  hero.replayArrival(); hero.cloth.again(); hero.update(0);
  let n = 0;
  while (Number.isNaN(hero.jumpInfo.at) && n++ < 30 * 120) { hero.jump(); step(); }
  n = 0;
  while (!hero.pass2Info.pass1Done && n++ < 30 * 20) step();
  for (let f = 0; f < 30 * 2.5; f++) step();
  n = 0;
  while (Number.isNaN(hero.pass2Info.at) && n++ < 30 * 10) { hero.jump(); step(); }
  for (let f = 0; f < Math.ceil(hero.pass2Info.flightS * 30); f++) step(); // to the landing
  const posA = hero.cloth.points, N = posA.count;
  const out = [];
  for (let k = 0; k <= 8; k++) {
    const inv = logo.matrix.clone().invert();
    group.updateMatrixWorld();
    const m = inv.clone().multiply(group.matrixWorld).elements, e = group.matrixWorld.elements;
    const a = new Float32Array(await renderer.getArrayBufferAsync(posA));
    const st = a.length / N;
    let near = Infinity, hz = 0, hn = 0;
    for (let i = 0; i < N; i++) {
      const x = a[i * st], y = a[i * st + 1], z = a[i * st + 2];
      if (i % 64 === 63) { hz += e[2] * x + e[6] * y + e[10] * z + e[14]; hn++; }
      const lx = m[0] * x + m[4] * y + m[8] * z + m[12], ly = m[1] * x + m[5] * y + m[9] * z + m[13], lz = m[2] * x + m[6] * y + m[10] * z + m[14];
      near = Math.min(near, dist(lx, ly, lz));
    }
    if (!logo.geometry.boundingBox) logo.geometry.computeBoundingBox();
    const c = logo.geometry.boundingBox.getCenter(logo.position.clone()).applyMatrix4(logo.matrix);
    out.push({ t: k * 0.5, hand: hero.jumpInfo.handCm - 60, hem: (hz / hn + 16.92) / upc, logoZ: (c.z + 16.92) / upc, nearest: near });
    for (let f = 0; f < 15; f++) step();
  }
  return out;
});
await b.close();
console.log("s after landing | cloth top (hand) | hem | logo centre | nearest cloth to the logo's surface   (cm; z from the spot, + = toward the front)");
for (const q of r) console.log(`${q.t.toFixed(1).padStart(4)}            ${q.hand.toFixed(0).padStart(5)}           ${q.hem.toFixed(0).padStart(5)}   ${q.logoZ.toFixed(0).padStart(5)}          ${q.nearest.toFixed(1)}`);
