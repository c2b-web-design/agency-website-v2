// PASS 1 WITH THE COLLISION, OVER SEVERAL PASSES (20 November 2026, session 2; Carl: "build the collision physics, lets see
// how it behaves over a number of jumps" ... "We will see how it bahaves and how deterministic it is"). Frame-stepped
// (1/30 s): the story replayed once; then argv[2] passes (default 3), each: "Jump" (the forward action, the wobble, the
// beat, the backward action, the wobble), then "Reset pass 1" and argv[3] s to settle (default 4). Every frame, every
// cloth point (GPU read-back) into the logo's frame (the inverse of its matrix): its distance from the logo's surface by
// the SAME field the cloth collides with (`hero.cloth.collider`: the flat field, bilinear, + the depth). TOUCHING = within
// the margin + 0.75 cm; INSIDE = below 0 (through the metal). The touched places marked on the face's grid at 2 cm cells,
// FRONT (local z above the middle) and BACK: the share of the logo's ink cells touched, each side. READ-ONLY.
// ⚠ NOT WATCHED: the drawn surface (the centre of four points); live playback; the floor's or other objects' contact.
import { chromium } from "playwright";
const PASSES = Number(process.argv[2] ?? 3);
const SETTLE = Number(process.argv[3] ?? 4);
// argv[4]: the cloth's settings to try, JSON — set in THIS browser only, not the code
const SET = JSON.parse(process.argv[4] ?? "{}");
const b = await chromium.launch({ channel: "chrome", args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-webgpu"] });
const p = await b.newPage({ viewport: { width: 1896, height: 946 }, deviceScaleFactor: 1 });
const errors = [];
p.on("pageerror", (e) => errors.push(String(e).slice(0, 300)));
p.on("console", (m) => { if (m.type() === "error" || /WGSL|shader|pipeline/i.test(m.text())) errors.push(`console: ${m.text().slice(0, 300)}`); });
await p.goto("http://localhost:3000/proto/hero", { waitUntil: "load" });
await p.waitForFunction(() => window.__heroBench?.hero?.warmed === true && window.__heroBench.hero.cloth.collider, null, { timeout: 180000 });
const r = await p.evaluate(async ({ PASSES, SETTLE, SET }) => {
  const { hero, renderer, scene } = window.__heroBench;
  Object.assign(hero.cloth.settings, SET);
  renderer.setAnimationLoop(null);
  const logo = scene.getObjectByName("hero logo");
  const group = scene.getObjectByName("hero cloth (the example)");
  const col = hero.cloth.collider;
  const img = col.tex.image;
  const W = img.width, H = img.height;
  // half float → float
  const h2f = (h) => { const s = h & 0x8000 ? -1 : 1, e = (h >> 10) & 0x1f, f = h & 0x3ff; return e === 0 ? s * 2 ** -14 * (f / 1024) : e === 31 ? (f ? NaN : s * Infinity) : s * 2 ** (e - 15) * (1 + f / 1024); };
  const field = new Float32Array(W * H);
  for (let i = 0; i < W * H; i++) field[i] = h2f(img.data[i * 4]);
  const flatAt = (x, y) => {
    let u = ((x - col.minX) / col.sizeX) * W - 0.5, v = ((y - col.minY) / col.sizeY) * H - 0.5;
    const uc = Math.min(W - 1, Math.max(0, u)), vc = Math.min(H - 1, Math.max(0, v));
    const off = Math.hypot((u - uc) * (col.sizeX / W), (v - vc) * (col.sizeY / H));
    const x0 = Math.floor(uc), y0 = Math.floor(vc), x1 = Math.min(W - 1, x0 + 1), y1 = Math.min(H - 1, y0 + 1), fx = uc - x0, fy = vc - y0;
    const a = field[W * y0 + x0] * (1 - fx) + field[W * y0 + x1] * fx, c = field[W * y1 + x0] * (1 - fx) + field[W * y1 + x1] * fx;
    return a * (1 - fy) + c * fy + off;
  };
  const dist = (x, y, z) => { const fl = flatAt(x, y), dp = Math.max(col.zMin - z, z - col.zMax); return Math.hypot(Math.max(fl, 0), Math.max(dp, 0)) + Math.min(Math.max(fl, dp), 0); };
  // the face's coarse grid (2 cm): a cell is ink if any of its field cells is
  const CW = Math.ceil(col.sizeX / 2), CH = Math.ceil(col.sizeY / 2);
  const inkC = new Uint8Array(CW * CH);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (field[W * y + x] < 0) inkC[CW * Math.floor(((y + 0.5) / H) * col.sizeY / 2) + Math.floor(((x + 0.5) / W) * col.sizeX / 2)] = 1;
  const inkCount = inkC.reduce((a, v) => a + v, 0);
  const zMid = (col.zMin + col.zMax) / 2;
  const margin = hero.cloth.settings.marginCm;
  const step = () => { hero.update(1 / 30); hero.compute(renderer); };
  const inv = new logo.matrix.constructor();
  const posA = hero.cloth.points, N = posA.count;
  const passes = [];
  hero.replayArrival(); hero.cloth.again(); hero.update(0);
  for (let pass = 0; pass < PASSES; pass++) {
    const front = new Uint8Array(CW * CH), back = new Uint8Array(CW * CH);
    let n = 0;
    const before = hero.jumpInfo.at;
    while ((Number.isNaN(hero.jumpInfo.at) || hero.jumpInfo.at === before) && n++ < 30 * 120) { hero.jump(); step(); }
    const startAt = hero.jumpInfo.at;
    let touchFrames = 0, maxInside = 0, deepestInsideCm = 0, landedHome = false;
    const touchByAction = [0, 0];
    let action = 0, lastAt = startAt;
    // through the pass: until the backward landing's wobble is done (logo home, 2 s after its landing) or 12 s
    for (let f = 0; f < 30 * 12; f++) {
      step();
      if (hero.jumpInfo.at !== lastAt) { action = 1; lastAt = hero.jumpInfo.at; }
      if (action === 1 && hero.jumpInfo.logoBackCm === 0 && !landedHome) { landedHome = true; f = Math.max(f, 30 * 12 - 60 - 1); }
      inv.copy(logo.matrix).invert();
      group.updateMatrixWorld();
      const m = inv.clone().multiply(group.matrixWorld).elements;
      const a = new Float32Array(await renderer.getArrayBufferAsync(posA));
      const st = a.length / N;
      let touching = 0, inside = 0;
      for (let i = 0; i < N; i++) {
        const x = a[i * st], y = a[i * st + 1], z = a[i * st + 2];
        const lx = m[0] * x + m[4] * y + m[8] * z + m[12], ly = m[1] * x + m[5] * y + m[9] * z + m[13], lz = m[2] * x + m[6] * y + m[10] * z + m[14];
        if (lx < col.minX - 10 || lx > col.minX + col.sizeX + 10 || ly < col.minY - 10 || ly > col.minY + col.sizeY + 10) continue;
        const d = dist(lx, ly, lz);
        if (d < 0) { inside++; deepestInsideCm = Math.min(deepestInsideCm, d); }
        if (d < margin + 0.75) {
          touching++;
          const cx = Math.floor((lx - col.minX) / 2), cy = Math.floor((ly - col.minY) / 2);
          if (cx >= 0 && cy >= 0 && cx < CW && cy < CH) (lz > zMid ? front : back)[CW * cy + cx] = 1;
        }
      }
      if (touching) { touchFrames++; touchByAction[action] += touching; }
      maxInside = Math.max(maxInside, inside);
    }
    let fC = 0, bC = 0;
    for (let i = 0; i < CW * CH; i++) if (inkC[i]) { fC += front[i]; bC += back[i]; }
    passes.push({ frontPct: Math.round((100 * fC) / inkCount), backPct: Math.round((100 * bC) / inkCount), touchFrames, touchByAction, maxInside, deepestInsideCm: Math.round(deepestInsideCm * 10) / 10, home: landedHome });
    hero.resetPass1();
    for (let f = 0; f < SETTLE * 30; f++) step();
  }
  return { passes, inkCount, grid: [W, H], z: [col.zMin, col.zMax] };
}, { PASSES, SETTLE, SET });
console.log(`settings tried: ${JSON.stringify(SET)}`);
await b.close();
console.log(`collider field ${r.grid.join(" × ")}; depth z ${r.z.map((v) => v.toFixed(2)).join("…")} cm; ${r.inkCount} ink cells at 2 cm`);
r.passes.forEach((q, i) => console.log(`pass ${i + 1}: FRONT ~${q.frontPct}% · BACK ~${q.backPct}% touched; touching in ${q.touchFrames} frames (point-frames forward ${q.touchByAction[0]}, backward ${q.touchByAction[1]}); INSIDE the metal: max ${q.maxInside} points, deepest ${q.deepestInsideCm} cm; landed home: ${q.home}`));
console.log(`page errors: ${errors.length}`, errors.slice(0, 5));
