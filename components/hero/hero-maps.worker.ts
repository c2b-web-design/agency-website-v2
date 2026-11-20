/**
 * ⛔ THE HERO's MAPS, BUILT OFF THE MAIN THREAD (16 November 2026, session 2; D-101).
 *
 * Carl, of the opening: *"We are nearly there with the opening. The stalls are the problem."* Measured (`hero.loadTimes`,
 * `live-work/scripts/hero-opening-measure-16-november.mjs`): the logo's ARRIVAL held the main thread ~0.5–0.6 s in ONE frame
 * on the headline's fade-in, ~90% of it these maps — the FLOW MAP (the re-forming's fill, ~190–260 ms), the RUN-OFF MAP
 * (phase 2's wash, ~105–150), the rain's HIT MAP (~60) and the steam's INK and SOLID MASK (~90–100). Each is plain
 * arithmetic on the logo's triangles: nothing in it needs the GPU or the page. So the SAME functions run here, in a Web
 * Worker, and the arrays are TRANSFERRED back (moved, not copied); the main thread only wraps them in textures. Carl,
 * verbatim: *"components/hero/hero-maps.worker.ts   Authorised to create and use."* (the precedent: /about's
 * `desk-mark.worker.ts`, the logo's geometry, which the hero already uses).
 *
 * ⛔ NOTHING THE VISITOR SEES CHANGES — the functions are the ones the main thread ran, LIFTED VERBATIM (only the texture
 * made from each array stays behind, in `hero-scene.ts` / `hero-rain.ts` / `hero-steam.ts`), with the same inputs; their
 * constants stay in their own files and are SENT with each request (one source). `?mapcheck=1` on the dev server builds
 * every map on the main thread as well and compares the two, array by array (`loadTimes.mapCheckFace`, `mapCheckLanded`:
 * the number of mismatched values; 0 = identical). If the worker cannot start or fails, the same functions run inline,
 * as before.
 *
 * TWO REQUESTS, because the maps need different things:
 * - "face" — the flow and run-off maps and the ink (the logo's own face): the geometry alone, so it is sent the moment the
 *   geometry arrives, while the text and the studio are still loading.
 * - "landed" — the rain's hit map and the steam's solid mask: the logo WHERE IT LANDS, which needs the text's frame (the
 *   mould's pose), so it is sent once the main thread has that pose. The worker keeps the geometry from "face".
 *
 * ⚠ This module is ALSO imported by the main thread (the inline fallback, the steam's rebuild when its cell size changes,
 * the dev check). The message handler is installed ONLY inside a worker (`WorkerGlobalScope`).
 */
import * as THREE from "three";

/* ───────────────────────────── the ink (shared) ───────────────────────────── */

export type InkGrid = { ink: Uint8Array; W: number; H: number; minX: number; minY: number; sizeX: number; sizeY: number; tris: number; indexed: boolean };
/**
 * THE LOGO's INK — its triangles drawn flat onto its FACE (local x, y, cm) at `perCm` cells per cm, closed (a crack up to
 * two cells wide sealed). Shared by the FLOW MAP (`flowMapData`, the re-forming's fill), the RUN-OFF MAP (`runoffMapData`,
 * phase 2's wash) and the steam's solid mask — lifted VERBATIM out of `logoFlowMap` (14 November 2026; its texture proven
 * unchanged: the same 405 × 212 cells, hash 3630756487, before and after), then out of `hero-scene.ts` into this worker
 * (16 November 2026, session 2).
 */
export function inkGrid(g: THREE.BufferGeometry, perCm: number): InkGrid {
  g.computeBoundingBox();
  const bb = g.boundingBox!;
  const minX = bb.min.x - 1;
  const minY = bb.min.y - 1;
  const sizeX = bb.max.x - bb.min.x + 2;
  const sizeY = bb.max.y - bb.min.y + 2;
  const W = Math.ceil(sizeX * perCm);
  const H = Math.ceil(sizeY * perCm);
  const ink = new Uint8Array(W * H);
  const pos = g.getAttribute("position");
  const idx = g.getIndex();
  const tris = idx ? idx.count / 3 : pos.count / 3;
  const P = (k: number) => {
    const v = idx ? idx.getX(k) : k;
    return [((pos.getX(v) - minX) / sizeX) * W, ((pos.getY(v) - minY) / sizeY) * H];
  };
  for (let t = 0; t < tris; t++) {
    const [ax, ay] = P(3 * t);
    const [bx, by] = P(3 * t + 1);
    const [cx, cy] = P(3 * t + 2);
    const area = (bx - ax) * (cy - ay) - (cx - ax) * (by - ay);
    if (Math.abs(area) < 1e-9) continue; // a wall, edge-on to the face
    const x0 = Math.max(0, Math.floor(Math.min(ax, bx, cx)));
    const x1 = Math.min(W - 1, Math.ceil(Math.max(ax, bx, cx)));
    const y0 = Math.max(0, Math.floor(Math.min(ay, by, cy)));
    const y1 = Math.min(H - 1, Math.ceil(Math.max(ay, by, cy)));
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const px = x + 0.5;
        const py = y + 0.5;
        const w0 = ((bx - px) * (cy - py) - (cx - px) * (by - py)) / area;
        const w1 = ((cx - px) * (ay - py) - (ax - px) * (cy - py)) / area;
        if (w0 >= 0 && w1 >= 0 && w0 + w1 <= 1) ink[W * y + x] = 1;
      }
    }
  }
  // CLOSE the ink (grow one cell, then shrink one): ~295,000 thin face triangles drawn onto the grid leave hairline CRACKS
  // along their shared edges that cut the ink into pieces the flow cannot cross (measured, 13 November: 39,381 ink
  // cells, 1,485 reached); a crack up to two cells wide is sealed, the letters' outline kept
  const morph = (src: Uint8Array, grow: boolean) => {
    const out = new Uint8Array(W * H);
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        let v = grow ? 0 : 1;
        for (let dy = -1; dy <= 1 && v === (grow ? 0 : 1); dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const xx = x + dx;
            const yy = y + dy;
            const s = xx < 0 || yy < 0 || xx >= W || yy >= H ? 0 : src[W * yy + xx];
            if (grow && s) v = 1;
            if (!grow && !s) v = 0;
          }
        }
        out[W * y + x] = v;
      }
    }
    return out;
  };
  ink.set(morph(morph(ink, true), false));
  return { ink, W, H, minX, minY, sizeX, sizeY, tris, indexed: !!idx };
}

/* ───────────────────────────── the flow map (hero-scene.ts, FLOW) ───────────────────────────── */

export type FlowCheck = { inkCells: number; reachedCells: number; seedCells: number; seed: number[]; tris: number; indexed: boolean };
/** the flow map's texels (RGBA half floats, `W` × `H`) and its frame; the texture and `level` are made by `hero-scene.ts` */
export type FlowData = { data: Uint16Array; W: number; H: number; minX: number; minY: number; sizeX: number; sizeY: number; check: FlowCheck };
/** THE FLOW MAP (`hero-scene.ts`, `logoFlowMap`, whose header holds its reasoning): lifted verbatim; `gravity` is `FLOW.gravity` */
export function flowMapData(grid: InkGrid, seedX: number, seedY: number, gravity: number): FlowData {
  const { ink, W, H, minX, minY, sizeX, sizeY, tris, indexed } = grid;
  // the seed: the ink nearest the c's entry (within a cell of the nearest)
  const sx = ((seedX - minX) / sizeX) * W;
  const sy = ((seedY - minY) / sizeY) * H;
  let near = Infinity;
  for (let i = 0; i < W * H; i++) if (ink[i]) near = Math.min(near, Math.hypot((i % W) + 0.5 - sx, Math.floor(i / W) + 0.5 - sy));
  // ⚠ Float64 throughout, as the heap's values: a Float32 store rounded some values BELOW the queued value, so the stale
  // check took a live entry for a stale one and the flow stopped (13 November: 1,485 of 39,381 ink cells reached)
  // a binary heap of [key, i] (the order, below)
  const heap: [number, number][] = [];
  const push = (d: number, i: number) => {
    heap.push([d, i]);
    let k = heap.length - 1;
    while (k > 0) {
      const p = (k - 1) >> 1;
      if (heap[p][0] <= heap[k][0]) break;
      [heap[p], heap[k]] = [heap[k], heap[p]];
      k = p;
    }
  };
  const pop = () => {
    const top = heap[0];
    const last = heap.pop()!;
    if (heap.length) {
      heap[0] = last;
      let k = 0;
      for (;;) {
        const l = 2 * k + 1;
        const r = l + 1;
        let m = k;
        if (l < heap.length && heap[l][0] < heap[m][0]) m = l;
        if (r < heap.length && heap[r][0] < heap[m][0]) m = r;
        if (m === k) break;
        [heap[m], heap[k]] = [heap[k], heap[m]];
        k = m;
      }
    }
    return top;
  };
  // THE ORDER (with GRAVITY, Carl's container): a priority flood. A cell's KEY is the highest, along the liquid's way to
  // it, of (the way's length so far + `gravity` × its height): climbing costs (1 + gravity) a cell, running level 1, and
  // running DOWN costs nothing (the key cannot fall) — so the low road is taken first, and a pocket BELOW an inflow (the
  // b's stem under the bowl's join) shares its inflow's key and fills from its FLOOR UP (ties broken by height, lowest
  // first). The map stores each cell's RANK in that order (0–1), so a fill level IS the poured share of the ink's area.
  const way = new Float64Array(W * H).fill(Infinity);
  const key = new Float64Array(W * H).fill(Infinity);
  for (let i = 0; i < W * H; i++) {
    if (ink[i] && Math.hypot((i % W) + 0.5 - sx, Math.floor(i / W) + 0.5 - sy) <= near + 1) {
      way[i] = 0;
      key[i] = gravity * Math.floor(i / W);
      push(key[i], i);
    }
  }
  const steps = [[1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1], [1, 1, Math.SQRT2], [1, -1, Math.SQRT2], [-1, 1, Math.SQRT2], [-1, -1, Math.SQRT2]];
  while (heap.length) {
    const [k, i] = pop();
    if (k > key[i]) continue;
    const x = i % W;
    const y = Math.floor(i / W);
    for (const [dx, dy, c] of steps) {
      const xx = x + dx;
      const yy = y + dy;
      if (xx < 0 || yy < 0 || xx >= W || yy >= H) continue;
      const j = W * yy + xx;
      if (!ink[j]) continue;
      const g2 = way[i] + c;
      const k2 = Math.max(k, g2 + gravity * yy);
      if (k2 < key[j] || (k2 === key[j] && g2 < way[j])) {
        key[j] = k2;
        way[j] = g2;
        push(k2, j);
      }
    }
  }
  const reached: number[] = [];
  for (let i = 0; i < W * H; i++) if (ink[i] && key[i] < Infinity) reached.push(i);
  reached.sort((a, b) => key[a] - key[b] || Math.floor(a / W) - Math.floor(b / W) || way[a] - way[b]);
  const rank = new Float64Array(W * H).fill(-1);
  reached.forEach((i, r) => (rank[i] = r / Math.max(1, reached.length - 1)));
  // off the ink: the nearest ink cell's value (a breadth-first spread outward, a few rounds)
  const val = new Float32Array(W * H).fill(-1);
  for (let i = 0; i < W * H; i++) if (rank[i] >= 0) val[i] = rank[i];
  for (let round = 0; round < 6; round++) {
    const next = val.slice();
    for (let i = 0; i < W * H; i++) {
      if (val[i] >= 0) continue;
      const x = i % W;
      const y = Math.floor(i / W);
      let best = Infinity;
      for (const [dx, dy] of steps) {
        const xx = x + dx;
        const yy = y + dy;
        if (xx < 0 || yy < 0 || xx >= W || yy >= H) continue;
        const v = val[W * yy + xx];
        if (v >= 0) best = Math.min(best, v);
      }
      if (best < Infinity) next[i] = best;
    }
    val.set(next);
  }
  const data = new Uint16Array(4 * W * H);
  for (let i = 0; i < W * H; i++) {
    const h = THREE.DataUtils.toHalfFloat(val[i] >= 0 ? val[i] : 1);
    data[4 * i] = h;
    data[4 * i + 1] = h;
    data[4 * i + 2] = h;
    data[4 * i + 3] = THREE.DataUtils.toHalfFloat(1);
  }
  return {
    data,
    W,
    H,
    minX,
    minY,
    sizeX,
    sizeY,
    check: { inkCells: ink.reduce((a, v) => a + v, 0), reachedCells: reached.length, seedCells: reached.filter((i) => way[i] === 0).length, seed: [Math.round(sx), Math.round(sy)], tris, indexed },
  };
}

/* ───────────────────────────── the run-off map (hero-scene.ts, RUNOFF) ───────────────────────────── */

export type RunoffParams = { perCm: number; bandCm: number; spread: number; streakCm: number; ragCm: number };
export type RunoffCheck = { cells: number[]; inkCells: number; runs: number; tallestCm: number; reachCm: number; pace: number[] };
/** the run-off map's texels (RG half floats, `W` × `H`) and its frame; the texture is made by `hero-scene.ts` */
export type RunoffData = { data: Uint16Array; W: number; H: number; minX: number; minY: number; sizeX: number; sizeY: number; tallestCm: number; reachCm: number; check: RunoffCheck };
/** THE RUN-OFF MAP (`hero-scene.ts`, `RUNOFF`, whose header holds its reasoning): lifted verbatim; `RUNOFF` is `p` */
export function runoffMapData(grid: InkGrid, p: RunoffParams): RunoffData {
  const { ink, W, H, minX, minY, sizeX, sizeY } = grid;
  const below = new Float32Array(W * H).fill(-1);
  let runs = 0;
  let tallest = 0;
  for (let x = 0; x < W; x++) {
    let top = -1;
    for (let y = H - 1; y >= 0; y--) {
      const i = W * y + x;
      if (!ink[i]) {
        top = -1;
        continue;
      }
      if (top < 0) {
        top = y;
        runs++;
      }
      below[i] = (top - y) / p.perCm;
      tallest = Math.max(tallest, below[i]);
    }
  }
  // off the ink (the walls' and bevels' edges): the nearest ink cell's value, a few rounds (the flow map's spread)
  const steps = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
  for (let round = 0; round < 6; round++) {
    const next = below.slice();
    for (let i = 0; i < W * H; i++) {
      if (below[i] >= 0) continue;
      const x = i % W;
      const y = Math.floor(i / W);
      let best = Infinity;
      for (const [dx, dy] of steps) {
        const xx = x + dx;
        const yy = y + dy;
        if (xx < 0 || yy < 0 || xx >= W || yy >= H) continue;
        const v = below[W * yy + xx];
        if (v >= 0) best = Math.min(best, v);
      }
      if (best < Infinity) next[i] = best;
    }
    below.set(next);
  }
  // ⛔ TAKE 2 (14 November 2026): EACH COLUMN's PACE made HERE, not by a shader noise — take 1's noise never reached its low
  // end, so every streak finished early and the last red went at a wash of ~0.75, not 1 (seen: ~5.3 s against the dial's
  // 7.5). A smooth value noise across x (a knot every `streakCm`, cosine-eased, a fixed seed: the same streaks every run),
  // 1 to 1 + `spread`; and THE REACH SCALED so the slowest point (its depth + band + rag, over its column's pace) is done
  // at a wash of EXACTLY 1 — so the wash's length is when the last red goes
  let seed = 12345;
  const rnd = () => ((seed = (seed * 1103515245 + 12345) >>> 0) / 4294967296);
  const knots = Array.from({ length: Math.ceil(W / (p.streakCm * p.perCm)) + 2 }, rnd);
  const pace = new Float32Array(W);
  for (let x = 0; x < W; x++) {
    const k = x / (p.streakCm * p.perCm);
    const k0 = Math.floor(k);
    const e = (1 - Math.cos(Math.PI * (k - k0))) / 2;
    pace[x] = 1 + p.spread * (knots[k0] + (knots[k0 + 1] - knots[k0]) * e);
  }
  let reach = 0;
  for (let i = 0; i < W * H; i++) if (below[i] >= 0) reach = Math.max(reach, (below[i] + p.bandCm + p.ragCm) / pace[i % W]);
  const data = new Uint16Array(2 * W * H);
  for (let i = 0; i < W * H; i++) {
    data[2 * i] = THREE.DataUtils.toHalfFloat(below[i] >= 0 ? below[i] : 0);
    data[2 * i + 1] = THREE.DataUtils.toHalfFloat(pace[i % W]);
  }
  let pMin = Infinity;
  let pMax = 0;
  for (const v of pace) {
    pMin = Math.min(pMin, v);
    pMax = Math.max(pMax, v);
  }
  return { data, W, H, minX, minY, sizeX, sizeY, tallestCm: tallest, reachCm: reach, check: { cells: [W, H], inkCells: ink.reduce((a, v) => a + v, 0), runs, tallestCm: Math.round(tallest * 10) / 10, reachCm: Math.round(reach * 10) / 10, pace: [Math.round(pMin * 100) / 100, Math.round(pMax * 100) / 100] } };
}

/* ───────────────────────────── the rain's hit map (hero-rain.ts, HIT) ───────────────────────────── */

export type HitParams = { perCm: number; marginCm: number; maxCells: number };
export type HitCheck = { cellsX: number; cellsZ: number; litCells: number; maxHeight: number; buildMs: number };
/** the hit map's heights (`W` × `H`, a Float32 per cell) and its frame; the texture is made by `hero-rain.ts` */
export type HitData = { hgt: Float32Array; W: number; H: number; minX: number; minZ: number; sizeX: number; sizeZ: number; topY: number; cx: number; cz: number; check: HitCheck };
/**
 * THE HIT MAP (`hero-rain.ts`, whose header holds its reasoning): the landed logo seen from straight above, each cell the
 * height ABOVE THE FLOOR of the highest surface over it (0 = the floor). Lifted verbatim; `HIT` is `p`.
 */
export function hitMapData(g: THREE.BufferGeometry, landed: THREE.Matrix4, upc: number, floorY: number, p: HitParams): HitData {
  const t0 = performance.now();
  const pos = g.getAttribute("position");
  const idx = g.getIndex();
  const n = pos.count;
  const wp = new Float32Array(n * 3);
  const v = new THREE.Vector3();
  const bb = new THREE.Box3();
  for (let i = 0; i < n; i++) {
    v.fromBufferAttribute(pos, i).applyMatrix4(landed);
    wp[3 * i] = v.x;
    wp[3 * i + 1] = v.y;
    wp[3 * i + 2] = v.z;
    bb.expandByPoint(v);
  }
  const margin = p.marginCm * upc;
  const minX = bb.min.x - margin;
  const minZ = bb.min.z - margin;
  const sizeX = bb.max.x - bb.min.x + 2 * margin;
  const sizeZ = bb.max.z - bb.min.z + 2 * margin;
  const W = Math.min(p.maxCells, Math.ceil((sizeX / upc) * p.perCm));
  const H = Math.min(p.maxCells, Math.ceil((sizeZ / upc) * p.perCm));
  const hgt = new Float32Array(W * H);
  const tris = idx ? idx.count / 3 : n / 3;
  const vi = (k: number) => (idx ? idx.getX(k) : k);
  for (let t = 0; t < tris; t++) {
    const a = vi(3 * t);
    const b = vi(3 * t + 1);
    const c = vi(3 * t + 2);
    const ax = ((wp[3 * a] - minX) / sizeX) * W;
    const az = ((wp[3 * a + 2] - minZ) / sizeZ) * H;
    const bx = ((wp[3 * b] - minX) / sizeX) * W;
    const bz = ((wp[3 * b + 2] - minZ) / sizeZ) * H;
    const cx = ((wp[3 * c] - minX) / sizeX) * W;
    const cz = ((wp[3 * c + 2] - minZ) / sizeZ) * H;
    const area = (bx - ax) * (cz - az) - (cx - ax) * (bz - az);
    if (Math.abs(area) < 1e-9) continue; // a wall, edge-on from above
    const ay = wp[3 * a + 1] - floorY;
    const by = wp[3 * b + 1] - floorY;
    const cy = wp[3 * c + 1] - floorY;
    const x0 = Math.max(0, Math.floor(Math.min(ax, bx, cx)));
    const x1 = Math.min(W - 1, Math.ceil(Math.max(ax, bx, cx)));
    const z0 = Math.max(0, Math.floor(Math.min(az, bz, cz)));
    const z1 = Math.min(H - 1, Math.ceil(Math.max(az, bz, cz)));
    for (let z = z0; z <= z1; z++) {
      for (let x = x0; x <= x1; x++) {
        const px = x + 0.5;
        const pz = z + 0.5;
        const w0 = ((bx - px) * (cz - pz) - (cx - px) * (bz - pz)) / area;
        const w1 = ((cx - px) * (az - pz) - (ax - px) * (cz - pz)) / area;
        const w2 = 1 - w0 - w1;
        if (w0 < 0 || w1 < 0 || w2 < 0) continue;
        const y = w0 * ay + w1 * by + w2 * cy;
        if (y > hgt[W * z + x]) hgt[W * z + x] = y;
      }
    }
  }
  let lit = 0;
  let maxH = 0;
  for (let i = 0; i < W * H; i++) {
    if (hgt[i] > 0) lit++;
    if (hgt[i] > maxH) maxH = hgt[i];
  }
  return {
    hgt,
    W,
    H,
    minX,
    minZ,
    sizeX,
    sizeZ,
    topY: bb.max.y,
    cx: (bb.min.x + bb.max.x) / 2,
    cz: (bb.min.z + bb.max.z) / 2,
    check: { cellsX: W, cellsZ: H, litCells: lit, maxHeight: Math.round(maxH * 10) / 10, buildMs: Math.round(performance.now() - t0) },
  };
}

/* ───────────────────────────── the steam's box and solid mask (hero-steam.ts, MARGIN) ───────────────────────────── */

export type SteamInk = { ink: Uint8Array; W: number; H: number; minX: number; minY: number; sizeX: number; sizeY: number };
export type SteamLogo = { g: THREE.BufferGeometry; landed: THREE.Matrix4; upc: number; ink: SteamInk };
export type SteamBox = { min: THREE.Vector3; sizeWorld: THREE.Vector3; cm: THREE.Vector3; n: [number, number, number]; cellCm: number };
export type SteamMargin = { xCm: number; zCm: number; riseCm: number };
/** the solid mask's cells and the cell size it was made for (`hero-steam.ts` uses it only at that size) */
export type SteamMask = { data: Uint8Array; n: [number, number, number]; solid: number; ms: number; cellCm: number };

/** the box about the landed logo, in whole cubic cells (`hero-steam.ts`; lifted verbatim, `MARGIN` is `margin`) */
export function steamBoxFor(logo: SteamLogo, floorY: number, cellCm: number, margin: SteamMargin): SteamBox {
  logo.g.computeBoundingBox();
  const wb = logo.g.boundingBox!.clone().applyMatrix4(logo.landed);
  const u = logo.upc;
  const lo = new THREE.Vector3(wb.min.x - margin.xCm * u, floorY, wb.min.z - margin.zCm * u);
  const hi = new THREE.Vector3(wb.max.x + margin.xCm * u, wb.max.y + margin.riseCm * u, wb.max.z + margin.zCm * u);
  const cmSize = hi.clone().sub(lo).divideScalar(u);
  const n: [number, number, number] = [Math.ceil(cmSize.x / cellCm), Math.ceil(cmSize.y / cellCm), Math.ceil(cmSize.z / cellCm)];
  const cm = new THREE.Vector3(n[0] * cellCm, n[1] * cellCm, n[2] * cellCm);
  // centred on the logo in x and z; the floor kept as the bottom
  const min = new THREE.Vector3(lo.x - ((cm.x - cmSize.x) * u) / 2, floorY, lo.z - ((cm.z - cmSize.z) * u) / 2);
  return { min, sizeWorld: cm.clone().multiplyScalar(u), cm, n, cellCm };
}

/**
 * THE SOLID MASK (`hero-steam.ts`, header): each cell of a grid at half the simulation's cell, 255 where its centre is
 * inside the logo — the ink at its face position (local x, y) and inside the extrusion's depth (local z). The landed pose
 * inverted takes each world centre to the logo's local cm. ⚠ The bevel is not modelled (the ink's outline × the full
 * depth). Lifted verbatim (`steamBoxFor` computes the bounding box it reads).
 */
export function steamSolidMask(logo: SteamLogo, box: SteamBox): SteamMask {
  const t0 = performance.now();
  const mc = box.cellCm / 2;
  const n: [number, number, number] = [Math.round(box.cm.x / mc), Math.round(box.cm.y / mc), Math.round(box.cm.z / mc)];
  const data = new Uint8Array(n[0] * n[1] * n[2]);
  const inv = logo.landed.clone().invert().elements;
  const zb = logo.g.boundingBox!;
  const { ink, W, H, minX, minY, sizeX, sizeY } = logo.ink;
  const stepW = mc * logo.upc;
  let solid = 0;
  for (let k = 0; k < n[2]; k++) {
    const wz = box.min.z + (k + 0.5) * stepW;
    for (let j = 0; j < n[1]; j++) {
      const wy = box.min.y + (j + 0.5) * stepW;
      for (let i = 0; i < n[0]; i++) {
        const wx = box.min.x + (i + 0.5) * stepW;
        const lz = inv[2] * wx + inv[6] * wy + inv[10] * wz + inv[14];
        if (lz < zb.min.z || lz > zb.max.z) continue;
        const lx = inv[0] * wx + inv[4] * wy + inv[8] * wz + inv[12];
        const ly = inv[1] * wx + inv[5] * wy + inv[9] * wz + inv[13];
        const ix = Math.floor(((lx - minX) / sizeX) * W);
        const iy = Math.floor(((ly - minY) / sizeY) * H);
        if (ix < 0 || iy < 0 || ix >= W || iy >= H || !ink[W * iy + ix]) continue;
        data[n[0] * (n[1] * k + j) + i] = 255;
        solid++;
      }
    }
  }
  return { data, n, solid, ms: Math.round(performance.now() - t0), cellCm: box.cellCm };
}

/* ───────────────────────────── the cloth's collider (hero-cloth.ts, the collision) ───────────────────────────── */

export type SdfData = { data: Uint16Array; W: number; H: number; minX: number; minY: number; sizeX: number; sizeY: number; check: { inkCells: number; minCm: number; maxCm: number } };
/**
 * ⛔ THE LOGO's FLAT DISTANCE FIELD (20 November 2026, session 2; `live-work/structural-note-cloth-collision-20-november.md`,
 * Carl: *"Yes, proceed. We will see how it bahaves and how deterministic it is."*): from the INK (`inkGrid`, the same grid
 * as the flow and run-off maps), each cell's SIGNED distance in cm to the letters' edge — negative inside the ink,
 * positive outside — by an exact Euclidean distance transform (Felzenszwalb and Huttenlocher's, rows then columns), the
 * edge taken half a cell from each cell centre. The cloth combines it with the logo's thickness (`hero-cloth.ts`): the
 * logo is an extrusion, so flat field + depth IS its 3D distance (the bevel's rounding inside the collision margin).
 * Packed as the flow map is (RGBA half floats, R = the distance; G, B, A = 0).
 */
export function inkSdfData(grid: InkGrid, perCm: number): SdfData {
  const { ink, W, H, minX, minY, sizeX, sizeY } = grid;
  const INF = 1e20;
  // the 1D squared distance transform of f (n values), into d
  const z = new Float64Array(Math.max(W, H) + 1);
  const v = new Int32Array(Math.max(W, H));
  const dt1 = (f: Float64Array, n: number, d: Float64Array) => {
    let k = 0;
    v[0] = 0;
    z[0] = -INF;
    z[1] = INF;
    for (let q = 1; q < n; q++) {
      let sq = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
      while (sq <= z[k]) {
        k--;
        sq = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
      }
      k++;
      v[k] = q;
      z[k] = sq;
      z[k + 1] = INF;
    }
    k = 0;
    for (let q = 0; q < n; q++) {
      while (z[k + 1] < q) k++;
      d[q] = (q - v[k]) * (q - v[k]) + f[v[k]];
    }
  };
  // squared distance (cells) from every cell to the nearest cell where `feature(i)`
  const edt = (feature: (i: number) => boolean) => {
    const g = new Float64Array(W * H);
    for (let i = 0; i < W * H; i++) g[i] = feature(i) ? 0 : INF;
    const f = new Float64Array(Math.max(W, H));
    const d = new Float64Array(Math.max(W, H));
    for (let x = 0; x < W; x++) {
      for (let y = 0; y < H; y++) f[y] = g[W * y + x];
      dt1(f, H, d);
      for (let y = 0; y < H; y++) g[W * y + x] = d[y];
    }
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) f[x] = g[W * y + x];
      dt1(f, W, d);
      for (let x = 0; x < W; x++) g[W * y + x] = d[x];
    }
    return g;
  };
  const toInk = edt((i) => ink[i] === 1);
  const toAir = edt((i) => ink[i] === 0);
  const data = new Uint16Array(W * H * 4);
  let inkCells = 0;
  let lo = Infinity;
  let hi = -Infinity;
  for (let i = 0; i < W * H; i++) {
    const cm = ink[i] ? -(Math.sqrt(toAir[i]) - 0.5) / perCm : (Math.sqrt(toInk[i]) - 0.5) / perCm;
    if (ink[i]) inkCells++;
    lo = Math.min(lo, cm);
    hi = Math.max(hi, cm);
    data[i * 4] = THREE.DataUtils.toHalfFloat(cm);
  }
  return { data, W, H, minX, minY, sizeX, sizeY, check: { inkCells, minCm: Math.round(lo * 100) / 100, maxCm: Math.round(hi * 100) / 100 } };
}

/* ───────────────────────────── the two requests (run here, or inline as the fallback) ───────────────────────────── */

export type FaceRequest = { kind: "face"; seed: [number, number]; flow: { perCm: number; gravity: number }; runoff: RunoffParams; inkPerCm: number };
export type FaceResult = { kind: "face"; flow: FlowData; runoff: RunoffData; ink: InkGrid; sdf: SdfData; ms: number };
export type LandedRequest = { kind: "landed"; landed: number[]; upc: number; floorY: number; hit: HitParams; steam: { margin: SteamMargin; cellCm: number } };
export type LandedResult = { kind: "landed"; hit: HitData; mask: SteamMask; ms: number };

/** "face": the flow map, the run-off map and the steam's ink — one ink grid per cell size (they share one at 2 per cm) */
export function faceMaps(g: THREE.BufferGeometry, r: FaceRequest): FaceResult {
  const t0 = performance.now();
  const grids = new Map<number, InkGrid>();
  const gridAt = (perCm: number) => {
    let k = grids.get(perCm);
    if (!k) grids.set(perCm, (k = inkGrid(g, perCm)));
    return k;
  };
  const flow = flowMapData(gridAt(r.flow.perCm), r.seed[0], r.seed[1], r.flow.gravity);
  const runoff = runoffMapData(gridAt(r.runoff.perCm), r.runoff);
  const ink = gridAt(r.inkPerCm);
  // ⛔ the cloth's collider (`inkSdfData`, 20 November 2026): the same ink grid
  const sdf = inkSdfData(ink, r.inkPerCm);
  return { kind: "face", flow, runoff, ink, sdf, ms: Math.round(performance.now() - t0) };
}

/** "landed": the rain's hit map and the steam's solid mask, the logo at its landed pose */
export function landedMaps(g: THREE.BufferGeometry, ink: SteamInk, r: LandedRequest): LandedResult {
  const t0 = performance.now();
  const landed = new THREE.Matrix4().fromArray(r.landed);
  const hit = hitMapData(g, landed, r.upc, r.floorY, r.hit);
  const logo: SteamLogo = { g, landed, upc: r.upc, ink };
  const mask = steamSolidMask(logo, steamBoxFor(logo, r.floorY, r.steam.cellCm, r.steam.margin));
  return { kind: "landed", hit, mask, ms: Math.round(performance.now() - t0) };
}

/* ───────────────────────────── the worker (installed only inside one) ───────────────────────────── */

export type MapsMessage = ({ kind: "geometry"; position: Float32Array; index: Uint16Array | Uint32Array | null } | FaceRequest | LandedRequest);
export type MapsReply = FaceResult | LandedResult | { kind: "error"; failed: "face" | "landed"; message: string };

const WorkerScope = (globalThis as { WorkerGlobalScope?: abstract new () => unknown }).WorkerGlobalScope;
if (WorkerScope && globalThis instanceof WorkerScope) {
  const scope = globalThis as unknown as { onmessage: ((e: MessageEvent<MapsMessage>) => void) | null; postMessage: (m: MapsReply, transfer?: Transferable[]) => void };
  let geometry: THREE.BufferGeometry | null = null;
  let ink: InkGrid | null = null;
  scope.onmessage = (e) => {
    const m = e.data;
    if (m.kind === "geometry") {
      geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.BufferAttribute(m.position, 3));
      if (m.index) geometry.setIndex(new THREE.BufferAttribute(m.index, 1));
      return;
    }
    try {
      if (!geometry) throw new Error("no geometry");
      if (m.kind === "face") {
        const r = faceMaps(geometry, m);
        ink = r.ink;
        // the ink is COPIED (kept here for "landed"); the maps' arrays are moved
        scope.postMessage({ ...r, ink: { ...r.ink, ink: r.ink.ink.slice() } }, [r.flow.data.buffer, r.runoff.data.buffer, r.sdf.data.buffer]);
      } else {
        if (!ink) throw new Error("no ink");
        const r = landedMaps(geometry, ink, m);
        scope.postMessage(r, [r.hit.hgt.buffer, r.mask.data.buffer]);
      }
    } catch (err) {
      scope.postMessage({ kind: "error", failed: m.kind, message: String(err) });
    }
  };
}
