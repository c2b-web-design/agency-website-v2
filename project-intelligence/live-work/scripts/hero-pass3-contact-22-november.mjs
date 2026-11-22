// PASS 3, THE MIRROR FOR THE B, MEASURED (22 November 2026, session 3; Carl: "Implement Pass 3. Lets keep the dials the
// same as Pass 2 at first. We will take measurements upon completion."). Frame-stepped (1/30 s): the story replayed; pass 1
// and pass 2 played whole and settled; then pass 3's "Jump" with the dials in argv[2] (JSON for `hero.pass3`, one set or a
// list; set in THIS browser only). Two windows: THE SWIVEL (take-off to the reverse move's take-off) and THE RETURN (the
// reverse take-off to 1 s after pass 3 is done). In each, every cloth point (GPU read-back) against the logo's surface by
// the SAME field it collides with; TOUCHING = within the margin + 0.75 cm; touched places marked on the face at 2 cm cells,
// FRONT (local z above the middle) / BACK. Reported: the B's share (the ink cells in the RIGHT third of the face, local x),
// the C's (the left third), and the whole face; points inside the metal; where it landed home. READ-ONLY.
// ⚠ NOT WATCHED: the drawn surface; live playback; contact BEFORE pass 3 (passes 1 and 2 are not counted).
import { chromium } from "playwright";
const SETS = (process.argv[2] ? JSON.parse(process.argv[2]) : [{}]);
const b = await chromium.launch({ channel: "chrome", args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-webgpu"] });
const p = await b.newPage({ viewport: { width: 1896, height: 946 }, deviceScaleFactor: 1 });
const errors = [];
p.on("pageerror", (e) => errors.push(String(e).slice(0, 300)));
await p.goto("http://localhost:3000/proto/hero", { waitUntil: "load" });
await p.waitForFunction(() => window.__heroBench?.hero?.warmed === true && window.__heroBench.hero.cloth.collider, null, { timeout: 180000 });
for (const SET of Array.isArray(SETS) ? SETS : [SETS]) {
  const r = await p.evaluate(async (SET) => {
    const { hero, renderer, scene } = window.__heroBench;
    renderer.setAnimationLoop(null);
    Object.assign(hero.pass3, SET);
    const logo = scene.getObjectByName("hero logo");
    const group = scene.getObjectByName("hero cloth (the example)");
    const col = hero.cloth.collider;
    const img = col.tex.image;
    const W = img.width, H = img.height;
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
    const CW = Math.ceil(col.sizeX / 2), CH = Math.ceil(col.sizeY / 2);
    const inkC = new Uint8Array(CW * CH);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (field[W * y + x] < 0) inkC[CW * Math.floor((((y + 0.5) / H) * col.sizeY) / 2) + Math.floor((((x + 0.5) / W) * col.sizeX) / 2)] = 1;
    const cCols = Math.floor(CW / 3); // the c: the face's left third
    const zMid = (col.zMin + col.zMax) / 2;
    const margin = hero.cloth.settings.marginCm;
    const step = () => { hero.update(1 / 30); hero.compute(renderer); };
    hero.replayArrival(); hero.cloth.again(); hero.update(0);
    // pass 1 and pass 2, whole (each "Jump" taken the moment it can be)
    let n = 0;
    while (!hero.pass2Info.pass2Done && n++ < 30 * 90) { hero.jump(); step(); }
    for (let f = 0; f < 30; f++) step();
    // pass 3
    n = 0;
    while (Number.isNaN(hero.pass2Info.at) && n++ < 30 * 10) { hero.jump(); step(); }
    const flightS = hero.pass2Info.flightS, apexS = hero.pass2Info.apexS, pass = hero.pass2Info.pass;
    const marks = { swivel: [new Uint8Array(CW * CH), new Uint8Array(CW * CH)], ret: [new Uint8Array(CW * CH), new Uint8Array(CW * CH)] };
    const inv = new logo.matrix.constructor();
    const posA = hero.cloth.points, N = posA.count;
    let inside = 0, first = { swivel: -1, ret: -1 }, last = { swivel: -1, ret: -1 }, backAtF = -1, doneF = -1;
    for (let f = 1; f <= 30 * 40; f++) {
      step();
      const info = hero.pass2Info;
      if (backAtF < 0 && !Number.isNaN(info.backAt)) backAtF = f;
      if (doneF < 0 && info.pass3Done) doneF = f;
      if (doneF > 0 && f > doneF + 30) break;
      const w = backAtF < 0 ? "swivel" : "ret";
      inv.copy(logo.matrix).invert();
      group.updateMatrixWorld();
      const m = inv.clone().multiply(group.matrixWorld).elements;
      const a = new Float32Array(await renderer.getArrayBufferAsync(posA));
      const st = a.length / N;
      let touching = 0;
      for (let i = 0; i < N; i++) {
        const x = a[i * st], y = a[i * st + 1], z = a[i * st + 2];
        const lx = m[0] * x + m[4] * y + m[8] * z + m[12], ly = m[1] * x + m[5] * y + m[9] * z + m[13], lz = m[2] * x + m[6] * y + m[10] * z + m[14];
        if (lx < col.minX - 10 || lx > col.minX + col.sizeX + 10 || ly < col.minY - 10 || ly > col.minY + col.sizeY + 10) continue;
        const d = dist(lx, ly, lz);
        if (d < 0) inside++;
        if (d < margin + 0.75) {
          touching++;
          const cx = Math.floor((lx - col.minX) / 2), cy = Math.floor((ly - col.minY) / 2);
          if (cx >= 0 && cy >= 0 && cx < CW && cy < CH) marks[w][lz > zMid ? 0 : 1][CW * cy + cx] = 1;
        }
      }
      if (touching) { if (first[w] < 0) first[w] = f / 30; last[w] = f / 30; }
    }
    const share = (mk) => {
      let ink = 0, F = 0, B = 0, cI = 0, cF = 0, cB = 0, bI = 0, bF = 0, bB = 0;
      for (let y = 0; y < CH; y++) for (let x = 0; x < CW; x++) { const i = CW * y + x; if (!inkC[i]) continue; ink++; F += mk[0][i]; B += mk[1][i]; if (x < cCols) { cI++; cF += mk[0][i]; cB += mk[1][i]; } if (x >= CW - cCols) { bI++; bF += mk[0][i]; bB += mk[1][i]; } }
      const pc = (a, b) => Math.round((100 * a) / b);
      return { bFront: pc(bF, bI), bBack: pc(bB, bI), cFront: pc(cF, cI), cBack: pc(cB, cI), front: pc(F, ink), back: pc(B, ink) };
    };
    // the landing: the lowest point of the logo (its geometry's box corners) and the centre
    if (!logo.geometry.boundingBox) logo.geometry.computeBoundingBox();
    const lb = logo.geometry.boundingBox;
    let low = Infinity;
    const v = lb.min.clone();
    for (let k = 0; k < 8; k++) low = Math.min(low, v.set(k & 1 ? lb.max.x : lb.min.x, k & 2 ? lb.max.y : lb.min.y, k & 4 ? lb.max.z : lb.min.z).applyMatrix4(logo.matrix).y);
    const c = lb.getCenter(v.clone()).applyMatrix4(logo.matrix);
    const upc = hero.unitsPerCm;
    return { SET: { ...hero.pass3 }, pass, flightS, apexS, sw: share(marks.swivel), rt: share(marks.ret), first, last, retAt: backAtF / 30, home: hero.pass2Info.pass3Done, inside, lowAboveFloorCm: (low + 437.5) / upc, centre: [(c.x - 718.48) / upc, (c.y + 437.5) / upc, (c.z + 16.92) / upc] };
  }, SET);
  const t = (w) => (r.first[w] < 0 ? "NONE" : `${r.first[w].toFixed(2)}–${r.last[w].toFixed(2)} s`);
  console.log(`pass ${r.pass} ${JSON.stringify(SET)}: flight ${r.flightS.toFixed(2)} s (apex ${r.apexS.toFixed(2)} s); the return took off ${r.retAt.toFixed(2)} s after pass 3's take-off`);
  console.log(`  THE SWIVEL (contact ${t("swivel")} from take-off): the B's FRONT ~${r.sw.bFront}% (its back ~${r.sw.bBack}%) · the C's front ~${r.sw.cFront}% · whole front ~${r.sw.front}%, back ~${r.sw.back}%`);
  console.log(`  THE RETURN (contact ${t("ret")} from take-off): the B's BACK ~${r.rt.bBack}% (its front ~${r.rt.bFront}%) · the C's back ~${r.rt.cBack}% · whole front ~${r.rt.front}%, back ~${r.rt.back}%`);
  console.log(`  home and done: ${r.home}; inside the metal ${r.inside}; landed: lowest ${r.lowAboveFloorCm.toFixed(1)} cm above the floor, centre ${r.centre.map((x) => x.toFixed(0)).join(", ")} cm (x, height, z from the spot)`);
}
await b.close();
console.log(`page errors: ${errors.length}`, errors.slice(0, 5));
