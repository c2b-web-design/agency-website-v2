// WHEN IS THE LOGO CLEAR OF THE CLOTH ON PASS 4's RETURN? (23 November 2026; Carl: "As soon as the logo is clear of the
// cloth ... it can do it all with one action. Thers a too long of a pause."). The story played from the lean (no presses),
// frame-stepped 1/30 s; from 66 s each frame the cloth's points read back and counted within the contact margin of the
// logo (hero-pass4-contact-22-november.mjs's own test). Printed per 0.1 s from pass 4's RETURN take-off: touching points,
// the cloth's hand (cm from its place; −40 = −100 from the spot), the logo's centre z; then the marks: last contact, the
// cloth at −100, pass 4 settled, the departure's start. READ-ONLY.
// ⚠ NOT WATCHED: the drawn surface; live playback; contact before pass 4.
import { chromium } from "playwright";
const b = await chromium.launch({ channel: "chrome", args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-webgpu"] });
const p = await b.newPage({ viewport: { width: 1896, height: 946 }, deviceScaleFactor: 1 });
const errors = [];
p.on("pageerror", (e) => errors.push(String(e).slice(0, 300)));
await p.goto("http://localhost:3000/proto/hero", { waitUntil: "load" });
await p.waitForFunction(() => window.__heroBench?.hero?.warmed === true && window.__heroBench.hero.cloth.collider, null, { timeout: 300000 });
const r = await p.evaluate(async () => {
  const { hero, renderer, scene } = window.__heroBench;
  renderer.setAnimationLoop(null);
  const logo = scene.getObjectByName("hero logo");
  const group = scene.getObjectByName("hero cloth (the example)");
  const step = () => { hero.update(1 / 30); hero.compute(renderer); };
  hero.replayArrival(); hero.update(0);
  let t = 0;
  for (; t < 66 * 30; t++) step();
  const col = hero.cloth.collider;
  const img = col.tex.image, W = img.width, H = img.height;
  const h2f = (h) => { const s = h & 0x8000 ? -1 : 1, e = (h >> 10) & 0x1f, f = h & 0x3ff; return e === 0 ? s * 2 ** -14 * (f / 1024) : e === 31 ? (f ? NaN : s * Infinity) : s * 2 ** (e - 15) * (1 + f / 1024); };
  const field = new Float32Array(W * H);
  for (let i = 0; i < W * H; i++) field[i] = h2f(img.data[i * 4]);
  const flatAt = (x, y) => {
    const u = ((x - col.minX) / col.sizeX) * W - 0.5, v = ((y - col.minY) / col.sizeY) * H - 0.5;
    const uc = Math.min(W - 1, Math.max(0, u)), vc = Math.min(H - 1, Math.max(0, v));
    const off = Math.hypot((u - uc) * (col.sizeX / W), (v - vc) * (col.sizeY / H));
    const x0 = Math.floor(uc), y0 = Math.floor(vc), x1 = Math.min(W - 1, x0 + 1), y1 = Math.min(H - 1, y0 + 1), fx = uc - x0, fy = vc - y0;
    return (field[W * y0 + x0] * (1 - fx) + field[W * y0 + x1] * fx) * (1 - fy) + (field[W * y1 + x0] * (1 - fx) + field[W * y1 + x1] * fx) * fy + off;
  };
  const dist = (x, y, z) => { const fl = flatAt(x, y), dp = Math.max(col.zMin - z, z - col.zMax); return Math.hypot(Math.max(fl, 0), Math.max(dp, 0)) + Math.min(Math.max(fl, dp), 0); };
  const margin = hero.cloth.settings.marginCm;
  const inv = new logo.matrix.constructor();
  const posA = hero.cloth.points, N = posA.count;
  const rows = [];
  let retF = -1, lastTouch = -1, at100 = -1, doneF = -1, departF = -1, minClear = Infinity;
  for (let f = 0; f < 30 * 14; f++, t++) {
    step();
    const info = hero.pass2Info, ci = hero.clothArrivalInfo, di = hero.clothDepartureInfo;
    if (info.pass === 4 && retF < 0 && !Number.isNaN(info.backAt)) retF = t;
    if (doneF < 0 && info.pass4Done) doneF = t;
    if (departF < 0 && !Number.isNaN(di.departAt)) departF = t;
    if (retF >= 0 && at100 < 0 && Math.abs(ci.handCm + 40) < 0.01) at100 = t;
    inv.copy(logo.matrix).invert();
    group.updateMatrixWorld();
    const m = inv.clone().multiply(group.matrixWorld).elements;
    const a = new Float32Array(await renderer.getArrayBufferAsync(posA));
    const st = a.length / N;
    let touching = 0, nearest = Infinity;
    for (let i = 0; i < N; i++) {
      const x = a[i * st], y = a[i * st + 1], z = a[i * st + 2];
      const lx = m[0] * x + m[4] * y + m[8] * z + m[12], ly = m[1] * x + m[5] * y + m[9] * z + m[13], lz = m[2] * x + m[6] * y + m[10] * z + m[14];
      const d = dist(lx, ly, lz);
      nearest = Math.min(nearest, d);
      if (d < margin + 0.75) touching++;
    }
    if (retF >= 0 && touching) lastTouch = t;
    if (retF >= 0) {
      if (t > lastTouch && lastTouch >= 0) minClear = Math.min(minClear, nearest);
      if ((t - retF) % 3 === 0 && t - retF <= 120) rows.push([((t - retF) / 30).toFixed(1), touching, ci.handCm.toFixed(1), nearest.toFixed(1)]);
    }
  }
  const s = (x) => (x < 0 ? "—" : `${(x / 30).toFixed(2)} s (return +${((x - retF) / 30).toFixed(2)})`);
  return { rows, marks: { returnTakeOff: s(retF), lastContact: s(lastTouch), clothAtMinus100: s(at100), pass4Settled: s(doneF), departureStarts: s(departF) }, margin };
});
console.log("from the return's take-off: s · touching points · hand (cm from its place; −40 = −100) · nearest cloth point to the logo (cm)");
for (const row of r.rows) console.log("  " + row.join("  ·  "));
console.log(r.marks, "margin", r.margin);
await b.close();
console.log(`page errors: ${errors.length}`, errors.slice(0, 3));
