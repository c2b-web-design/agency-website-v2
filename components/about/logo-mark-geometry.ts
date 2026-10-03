/**
 * ⛔⛔ THE C2B MARK AS A SOLID — D-088 chunk 1, 3 October 2026. Plan: `live-work/desk-mark-chunk1-plan-3-october.md`
 * (version 2, amended by the Architect's review). Pure: no React, no scene. Chunk 2 imports this into the room.
 *
 * ⛔ THE FORM IS AN INFERENCE FROM CARL'S TWO TARGETS (D-088, 3 October): a CURVED FRONT on a FLAT BACK — a convex
 * dome close to a half-round, on a thin flat lip and a short wall; the b's stem a flat face with bevelled edges; the
 * bowl flowing into the stem with no crease (seen in the gold target, zoomed). ⚠ No image shows the depth or the
 * back: the flat back is Carl's specification, the dome's height a dial set by his eye.
 *
 * ⛔ CONSTRUCTION — ONE MECHANISM, A SIGNED DISTANCE FIELD `d` TO THE TRACED OUTLINE (`logo-mark-outline.ts`):
 *   1. INTERIOR — a regular grid, clipped at the iso-level `d = dc` (marching triangles); z from the profile.
 *   2. EDGE BAND — from that clip loop out to the outline, RINGS swept along ∇d (the closest-point direction), so the
 *      half-round's steep foot is sampled by the profile itself, not by a grid that cannot hold a near-vertical side
 *      (Architect A8). Rings are spaced quadratically toward the foot.
 *   3. LIP, WALL, BACK — the band's outer ring gives the flat lip, the vertical wall and the flat back (earcut on that
 *      ring). Watertight by construction: ONE ring feeds all three.
 *   ⛔ THE OUTER RING IS PINNED TO THE OUTLINE AND ONLY ADVANCES ALONG IT (arc-length clamped monotonic). Found
 *   3 October: at the outline's five concave corners the closest-point offset folded back by a fraction of a pixel,
 *   and earcut left five sliver holes in the back (15 open edges). A collapsed point is a zero-length edge; a fold
 *   is a hole.
 *   ⚠ TWO LOOPS EXIST (Architect A8): the outline file, and the ring built from it. They agree only as far as the
 *   ring's samples reach — concave corners are cut by up to one sample spacing. The bench's edge-distance
 *   measurement is what keeps them together, not this comment.
 *
 * ⛔ THE PROFILE (mark units, height = 1). `t = (d − lipW) / (R − lipW)` clamped to [0, 1]:
 *   z = wallH                                      for d < lipW   (the flat lip)
 *   z = wallH + crestH · mix(√(1 − (1 − t)²), t, c)  otherwise     (round when c = 0, a straight bevel when c = 1)
 *   crestH = domeH · (R_main − lipW) is GLOBAL, so the stem's face and the strokes' crest are one height.
 * ⛔ R ≤ THE MEASURED MINIMUM HALF-WIDTH (`LOGO_HALF_WIDTH.p5`) — Architect A2. Beyond R the crest is flat, so the
 * slope is exactly zero wherever a stroke's medial axis falls and ∇d's flip there cannot flip a normal: no seam down
 * a spine. ⚠ The medial axis ALSO runs into each convex corner (the terminal wedges, the stem's corners), where d < R:
 * there the field makes a MITRE — a crease between two bevelled faces. That is the bevelled terminal the target
 * shows, not a seam; the readouts separate the two (`maxNormalAngleCrestDeg` vs `maxNormalAngleDeg`).
 *
 * ⛔ THE STEM — Architect A3, met by a different route than the plan's wording (stated at the checkpoint): NOT a
 * second height field combined by smooth max (a smooth max adds a bump wherever the two are equal — along the whole
 * stem face). Instead R and c EASE from the strokes' values to the stem's inside the stem box, by a smoothstep on the
 * box's signed distance. z is continuous because it is continuous in R and c; at the junction both are at the
 * crest, so the bowl flows into the stem as the target shows.
 *
 * ⛔ THE STEM'S FACE IS CROWNED, NOT DEAD FLAT — Carl, 3 October, on the first render: *"part of thr b is the wrong
 * way round. showing the flat back"*. The heights were right (the face at the crest), but a dead-flat face square to
 * the camera reflects ONE direction of the light: a uniform matte plate in a black frame, read as the back seen
 * through a hole. The target's stem face carries a soft gradient. `stemCrown` lets the bevel rise to (1 − crown) and
 * a shallow curve take the centre line to the crest, with zero slope there.
 *
 * NORMALS come from the exact field, never from the mesh (`computeVertexNormals`): metal shows every facet.
 *   - the interior: central differences of the exact height at ±1 grid step; the clip loop: the same, from exact
 *     probes. ⚠ Corrected the same day from "analytic at each vertex": a crease (a mitre, the stem's bevel corners,
 *     the ease) falls between grid nodes, and per-vertex analytic normals jumped across it in a staircase that
 *     followed the grid. Differencing over one step either side turns the light across a crease over two cells.
 *   - the band: the chain rule through d, R, c and the crown, with ∇d averaged over ±3 loop neighbours.
 */
import * as THREE from "three";
import { LOGO_ASPECT, LOGO_HALF_WIDTH, LOGO_OUTLINE, LOGO_OUTLINE_SOURCE, LOGO_STEM } from "./logo-mark-outline";

export type LogoMarkParams = {
  /** model units per mark height (mm on the bench). */
  scale: number;
  /** interior grid step, mark units. */
  gridStep: number;
  /** edge band depth as a fraction t of (R − lipW): the clip sits at d = lipW + bandT · (R − lipW). */
  bandT: number;
  /** rings in the edge band. */
  bandRings: number;
  /** the dome's radius, mark units — ⛔ clamped to LOGO_HALF_WIDTH.p5. */
  R: number;
  /** wall height, as a fraction of R. */
  wallH: number;
  /** flat lip width, as a fraction of R. */
  lipW: number;
  /** dome height as a fraction of (R − lipW): 1 = a half-round. */
  domeH: number;
  /** the stem's R, as a fraction of R (smaller = a wider flat face). */
  stemR: number;
  /** the stem edge's shape: 0 = round, 1 = a straight bevel. */
  stemBevel: number;
  /** the stem ease's width outside the stem box, mark units. */
  stemBlend: number;
  /** the stem face's crown, as a fraction of crestH: the bevel rises to (1 − crown), a shallow curve takes the centre
   *  line to the crest. 0 = a dead-flat face. */
  stemCrown: number;
};

/** ⚠ STARTING POINTS for Carl's eye, not proposals (the card precedent). */
export const LOGO_MARK_DEFAULTS: LogoMarkParams = {
  scale: 1,
  gridStep: 1 / 280,
  bandT: 0.5,
  bandRings: 10,
  R: LOGO_HALF_WIDTH.p5,
  wallH: 0.15,
  lipW: 0.1,
  domeH: 0.85,
  stemR: 0.45,
  stemBevel: 0.8,
  stemBlend: 0.04,
  stemCrown: 0.25,
};

export type LogoMarkStats = {
  vertices: number;
  triangles: number;
  /** edges used by one triangle, counted on WELDED positions (Architect A9). Must be 0. */
  openEdges: number;
  /** edges used by more than two triangles, welded. */
  nonManifoldEdges: number;
  nanValues: number;
  /** band triangles whose winding reversed (rings that crossed). */
  flippedBandTriangles: number;
  /** outer-ring samples clamped to stop a fold at a concave corner. */
  ringClamps: number;
  /** highest point of the front, mark units, and ÷ the median half-width. */
  crestHeight: number;
  crestOverHalfWidth: number;
  /** ⛔ max angle between an edge's end normals ON THE CREST (both ends at d ≥ 0.9 R, outside the stem ease) — a
   *  spine seam shows here (A2). */
  maxNormalAngleCrestDeg: number;
  /** max angle inside the stem ease — a steep but continuous ramp where R eases to the stem's, not a seam. */
  maxNormalAngleStemEaseDeg: number;
  /** max angle over the whole smooth front — includes the mitres at convex corners, which are intended. */
  maxNormalAngleDeg: number;
  /** smooth-front edges over 30° (the mitres). */
  edgesOver30Deg: number;
  /** max |Δz| along an interior-grid edge, in source px of the trace (Architect A8). */
  maxGridZStepSourcePx: number;
  /** the R actually used (after the p5 clamp). */
  rUsed: number;
};

// ── the outline: segments bucketed so each cell lists every segment within `cap` of it ─────────────────────────

type Near = { dist: number; cx: number; cy: number; s: number };

function buildField(cap: number) {
  const P = LOGO_OUTLINE;
  const n = P.length / 2;
  const ax = new Float64Array(n), ay = new Float64Array(n), bx = new Float64Array(n), by = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    ax[i] = P[2 * i]; ay[i] = P[2 * i + 1]; bx[i] = P[2 * j]; by[i] = P[2 * j + 1];
  }
  const cs = 0.01;
  const gx0 = -LOGO_ASPECT / 2 - cap - cs, gy0 = -cap - cs;
  const gnx = Math.ceil((LOGO_ASPECT + 2 * cap + 2 * cs) / cs) + 1;
  const gny = Math.ceil((1 + 2 * cap + 2 * cs) / cs) + 1;
  const cells: number[][] = Array.from({ length: gnx * gny }, () => []);
  for (let s = 0; s < n; s++) {
    const i0 = Math.max(0, Math.floor((Math.min(ax[s], bx[s]) - cap - gx0) / cs));
    const i1 = Math.min(gnx - 1, Math.floor((Math.max(ax[s], bx[s]) + cap - gx0) / cs));
    const j0 = Math.max(0, Math.floor((Math.min(ay[s], by[s]) - cap - gy0) / cs));
    const j1 = Math.min(gny - 1, Math.floor((Math.max(ay[s], by[s]) + cap - gy0) / cs));
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) cells[j * gnx + i].push(s);
  }
  /** nearest outline point within `cap`, with its arc parameter s = segment + t; null when none. */
  const nearest = (x: number, y: number): Near | null => {
    const i = Math.floor((x - gx0) / cs), j = Math.floor((y - gy0) / cs);
    if (i < 0 || j < 0 || i >= gnx || j >= gny) return null;
    let best = cap * cap, cx = 0, cy = 0, bs = -1;
    for (const s of cells[j * gnx + i]) {
      const dx = bx[s] - ax[s], dy = by[s] - ay[s];
      const L2 = dx * dx + dy * dy;
      let t = L2 > 0 ? ((x - ax[s]) * dx + (y - ay[s]) * dy) / L2 : 0;
      t = t < 0 ? 0 : t > 1 ? 1 : t;
      const px = ax[s] + t * dx, py = ay[s] + t * dy;
      const d2 = (x - px) ** 2 + (y - py) ** 2;
      if (d2 < best) { best = d2; cx = px; cy = py; bs = s + t; }
    }
    return bs < 0 ? null : { dist: Math.sqrt(best), cx, cy, s: bs };
  };
  /** sorted x of the outline's crossings of the row y (for the scan-line inside test). */
  const rowCrossings = (y: number) => {
    const xs: number[] = [];
    for (let s = 0; s < n; s++) if (ay[s] > y !== by[s] > y) xs.push(ax[s] + ((y - ay[s]) * (bx[s] - ax[s])) / (by[s] - ay[s]));
    return xs.sort((p, q) => p - q);
  };
  /** the outline point at arc parameter s. */
  const at = (s: number) => {
    const k = ((Math.floor(s) % n) + n) % n, t = s - Math.floor(s);
    return [ax[k] + t * (bx[k] - ax[k]), ay[k] + t * (by[k] - ay[k])] as const;
  };
  return { n, nearest, rowCrossings, at };
}

// ── the stem box: signed distance (inside +) and its gradient ───────────────────────────────────────────────────

function stemBox(x: number, y: number): { e: number; ex: number; ey: number } {
  const hx = (LOGO_STEM.x1 - LOGO_STEM.x0) / 2, hy = (LOGO_STEM.y1 - LOGO_STEM.y0) / 2;
  const qx = x - (LOGO_STEM.x0 + hx), qy = y - (LOGO_STEM.y0 + hy);
  const dx = Math.abs(qx) - hx, dy = Math.abs(qy) - hy;
  if (dx > 0 || dy > 0) {
    const ox = Math.max(dx, 0), oy = Math.max(dy, 0);
    const L = Math.hypot(ox, oy) || 1e-12;
    return { e: -L, ex: (-ox / L) * Math.sign(qx), ey: (-oy / L) * Math.sign(qy) };
  }
  return dx > dy ? { e: -dx, ex: -Math.sign(qx), ey: 0 } : { e: -dy, ex: 0, ey: -Math.sign(qy) };
}

// ── build ───────────────────────────────────────────────────────────────────────────────────────────────────────

export function buildLogoMarkGeometry(input: Partial<LogoMarkParams> = {}): {
  geometry: THREE.BufferGeometry;
  stats: LogoMarkStats;
} {
  const p = { ...LOGO_MARK_DEFAULTS, ...input };
  const R = Math.min(p.R, LOGO_HALF_WIDTH.p5);
  const lipW = p.lipW * R, wallH = p.wallH * R;
  const crestH = p.domeH * (R - lipW);
  const Rs = Math.max(lipW * 1.5, p.stemR * R);
  const dc = lipW + p.bandT * (R - lipW);
  const step = p.gridStep;
  const cap = R + 3 * step;
  const field = buildField(cap);

  /** local R, c and their gradients from the stem ease. */
  const ease = (x: number, y: number) => {
    const { e, ex, ey } = stemBox(x, y);
    const u = (e + p.stemBlend) / p.stemBlend; // 0 at e = −blend, 1 at the box edge and inside
    const uc = u < 0 ? 0 : u > 1 ? 1 : u;
    const w = uc * uc * (3 - 2 * uc);
    const dw = u <= 0 || u >= 1 ? 0 : (6 * uc * (1 - uc)) / p.stemBlend;
    return {
      r: R + (Rs - R) * w, c: p.stemBevel * w, k: p.stemCrown * w,
      rx: (Rs - R) * dw * ex, ry: (Rs - R) * dw * ey,
      cx: p.stemBevel * dw * ex, cy: p.stemBevel * dw * ey,
      kx: p.stemCrown * dw * ex, ky: p.stemCrown * dw * ey,
    };
  };
  // the crown runs from d = Rs to the stem's half-width, where it peaks with zero slope (the centre line: no seam)
  const hwStem = (LOGO_STEM.x1 - LOGO_STEM.x0) / 2;
  const profile = (d: number, r: number, c: number, k = 0) => {
    if (d < lipW) return wallH;
    let t = (d - lipW) / (r - lipW);
    t = t > 1 ? 1 : t;
    const s = 1 - t;
    const edge = (1 - c) * Math.sqrt(Math.max(0, 1 - s * s)) + c * t;
    let q = (d - Rs) / (hwStem - Rs);
    q = q < 0 ? 0 : q > 1 ? 1 : q;
    const crown = 1 - (1 - q) * (1 - q);
    return wallH + crestH * ((1 - k) * edge + k * crown);
  };
  /** z, the normal, and the local R at (x, y), with distance d and ∇d = (gx, gy). */
  const surface = (x: number, y: number, d: number, gx: number, gy: number) => {
    const k = ease(x, y);
    const z = profile(d, k.r, k.c, k.k);
    const h = 1e-6;
    const lo = Math.max(lipW, d - h);
    let zd = d < lipW ? 0 : (profile(d + h, k.r, k.c, k.k) - profile(lo, k.r, k.c, k.k)) / (d + h - lo);
    if (!isFinite(zd) || zd > 1e3) zd = 1e3;
    const zr = (profile(d, k.r + h, k.c, k.k) - profile(d, k.r - h, k.c, k.k)) / (2 * h);
    const zc = (profile(d, k.r, k.c + h, k.k) - profile(d, k.r, k.c - h, k.k)) / (2 * h);
    const zk = (profile(d, k.r, k.c, k.k + h) - profile(d, k.r, k.c, k.k - h)) / (2 * h);
    const zx = zd * gx + zr * k.rx + zc * k.cx + zk * k.kx;
    const zy = zd * gy + zr * k.ry + zc * k.cy + zk * k.ky;
    const L = Math.hypot(zx, zy, 1);
    return { z, nx: -zx / L, ny: -zy / L, nz: 1 / L, r: k.r };
  };

  // vertex store (mark units until the end); vd/vr = each smooth vertex's d and local R, for the crest readout
  const pos: number[] = [], nor: number[] = [], vd: number[] = [], vr: number[] = [];
  const addV = (x: number, y: number, z: number, nx: number, ny: number, nz: number, d = -1, r = 1) => {
    pos.push(x, y, z); nor.push(nx, ny, nz); vd.push(d); vr.push(r); return pos.length / 3 - 1;
  };
  const smoothTris: number[] = []; // interior + band (one smooth surface)
  const otherTris: number[] = []; // lip, wall, back
  const gridTris: number[] = []; // the interior alone, for the z-step readout

  // ── 1. interior: grid clipped at d = dc ──
  const x0 = -LOGO_ASPECT / 2 - 3 * step, y0 = -3 * step;
  const nx = Math.ceil((LOGO_ASPECT + 6 * step) / step), ny = Math.ceil((1 + 6 * step) / step);
  const NX = nx + 1;
  const D = new Float64Array(NX * (ny + 1)), GX = new Float32Array(D.length), GY = new Float32Array(D.length);
  for (let j = 0; j <= ny; j++) {
    const y = y0 + j * step;
    const xs = field.rowCrossings(y);
    let k = 0;
    for (let i = 0; i <= nx; i++) {
      const x = x0 + i * step;
      while (k < xs.length && xs[k] < x) k++;
      const sign = k % 2 === 1 ? 1 : -1; // odd crossings to the left = inside
      const q = field.nearest(x, y);
      const id = j * NX + i;
      if (!q || q.dist < 1e-12) { D[id] = q ? 0 : sign * cap; continue; }
      D[id] = sign * q.dist;
      GX[id] = (sign * (x - q.cx)) / q.dist;
      GY[id] = (sign * (y - q.cy)) / q.dist;
    }
  }
  // the exact height at every node — the interior's normals are central differences of THIS, one step either side
  const zAt = (x: number, y: number, d: number) => { const k = ease(x, y); return profile(d, k.r, k.c, k.k); };
  const Z = new Float64Array(D.length);
  for (let j = 0; j <= ny; j++) for (let i = 0; i <= nx; i++) { const id = j * NX + i; Z[id] = zAt(x0 + i * step, y0 + j * step, Math.max(0, D[id])); }
  const nodeV = new Int32Array(D.length).fill(-1);
  const nodeVertex = (id: number) => {
    if (nodeV[id] >= 0) return nodeV[id];
    const i = id % NX, j = Math.floor(id / NX);
    const x = x0 + i * step, y = y0 + j * step;
    const zx = (Z[j * NX + Math.min(nx, i + 1)] - Z[j * NX + Math.max(0, i - 1)]) / (step * (Math.min(nx, i + 1) - Math.max(0, i - 1)));
    const zy = (Z[Math.min(ny, j + 1) * NX + i] - Z[Math.max(0, j - 1) * NX + i]) / (step * (Math.min(ny, j + 1) - Math.max(0, j - 1)));
    const L = Math.hypot(zx, zy, 1);
    return (nodeV[id] = addV(x, y, Z[id], -zx / L, -zy / L, 1 / L, D[id], ease(x, y).r));
  };
  const cross = new Map<number, number>();
  const crossVertex = (a: number, b: number) => {
    const key = a < b ? a * 4194304 + b : b * 4194304 + a;
    const hit = cross.get(key);
    if (hit !== undefined) return hit;
    const t = (dc - D[a]) / (D[b] - D[a]);
    const xa = x0 + (a % NX) * step, ya = y0 + Math.floor(a / NX) * step;
    const xb = x0 + (b % NX) * step, yb = y0 + Math.floor(b / NX) * step;
    const x = xa + t * (xb - xa), y = ya + t * (yb - ya);
    // the clip sits at depth dc ≫ step, so the four probes are inside: unsigned distance is the signed one
    const zp = (u: number, w: number) => zAt(u, w, field.nearest(u, w)?.dist ?? cap);
    const zx = (zp(x + step, y) - zp(x - step, y)) / (2 * step), zy = (zp(x, y + step) - zp(x, y - step)) / (2 * step);
    const L = Math.hypot(zx, zy, 1);
    const v = addV(x, y, zAt(x, y, dc), -zx / L, -zy / L, 1 / L, dc, ease(x, y).r);
    cross.set(key, v);
    return v;
  };
  const next = new Map<number, number>(); // boundary: from → to, inside on the left
  const tri = (a: number, b: number, c: number) => {
    const k = (D[a] > dc ? 1 : 0) + (D[b] > dc ? 1 : 0) + (D[c] > dc ? 1 : 0);
    if (k === 0) return;
    if (k === 3) { const t3 = [nodeVertex(a), nodeVertex(b), nodeVertex(c)]; smoothTris.push(...t3); gridTris.push(...t3); return; }
    let A = a, B = b, C = c;
    const rot = () => { const t0 = A; A = B; B = C; C = t0; };
    if (k === 1) { while (!(D[A] > dc)) rot(); const va = nodeVertex(A), pab = crossVertex(A, B), pac = crossVertex(A, C); smoothTris.push(va, pab, pac); next.set(pab, pac); }
    else { while (D[C] > dc) rot(); const va = nodeVertex(A), vb = nodeVertex(B), pbc = crossVertex(B, C), pca = crossVertex(C, A); smoothTris.push(va, vb, pbc, va, pbc, pca); next.set(pbc, pca); }
  };
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    const n00 = j * NX + i, n10 = n00 + 1, n01 = n00 + NX, n11 = n01 + 1;
    tri(n00, n10, n11);
    tri(n00, n11, n01);
  }

  // ── 2–3. chain the clip loop(s); sweep the band, the lip, the wall and the back from each ──
  let flipped = 0, clamps = 0;
  const loops: number[][] = [];
  const seen = new Set<number>();
  for (const start of next.keys()) {
    if (seen.has(start)) continue;
    const loop: number[] = [];
    let v: number | undefined = start;
    while (v !== undefined && !seen.has(v)) { seen.add(v); loop.push(v); v = next.get(v); }
    if (loop.length > 2) loops.push(loop);
  }
  const area2 = (i: number, j: number, k: number) =>
    (pos[3 * j] - pos[3 * i]) * (pos[3 * k + 1] - pos[3 * i + 1]) - (pos[3 * k] - pos[3 * i]) * (pos[3 * j + 1] - pos[3 * i + 1]);
  for (const L of loops) {
    const m = L.length;
    const G = L.map((v) => {
      const x = pos[3 * v], y = pos[3 * v + 1];
      const q = field.nearest(x, y)!;
      return { gx: (x - q.cx) / q.dist, gy: (y - q.cy) / q.dist, d0: q.dist, s: q.s };
    });
    // ∇d averaged over ±3 loop neighbours — for the band's NORMALS only (positions use each vertex's own ∇d), so a
    // mitre at a convex corner turns over a few samples instead of stepping
    const Gs = G.map((_, i) => {
      let sx = 0, sy = 0;
      for (let o = -3; o <= 3; o++) { const g = G[(i + o + m) % m]; sx += g.gx; sy += g.gy; }
      const l = Math.hypot(sx, sy) || 1;
      return { gx: sx / l, gy: sy / l };
    });
    let prev = L;
    for (let r = 1; r <= p.bandRings; r++) {
      const f = (p.bandRings - r) / p.bandRings;
      const dk = lipW + (dc - lipW) * f * f;
      const ring = L.map((v, i) => {
        const { gx, gy, d0 } = G[i];
        const x = pos[3 * v] - gx * (d0 - dk), y = pos[3 * v + 1] - gy * (d0 - dk);
        const s = surface(x, y, dk, Gs[i].gx, Gs[i].gy);
        return addV(x, y, s.z, s.nx, s.ny, s.nz, dk, s.r);
      });
      for (let i = 0; i < m; i++) {
        const j = (i + 1) % m;
        for (const t of [[prev[i], ring[j], prev[j]], [prev[i], ring[i], ring[j]]]) {
          if (area2(t[0], t[1], t[2]) < 0) flipped++;
          smoothTris.push(t[0], t[1], t[2]);
        }
      }
      prev = ring;
    }
    // the outer ring: ON the outline, its arc parameter clamped so it only ever advances
    const nS = field.n;
    let sPrev = G[0].s;
    const outer = G.map((g, i) => {
      let s = g.s;
      if (i > 0) {
        let ds = s - sPrev;
        ds -= nS * Math.round(ds / nS); // unwrap to (−n/2, n/2]
        if (ds < 0) { ds = 0; clamps++; }
        s = sPrev + ds;
      }
      sPrev = s;
      const [x, y] = field.at(s);
      return { x, y, gx: g.gx, gy: g.gy };
    });
    // ⛔ CONVEX CORNERS: where two neighbouring outer samples skip part of the outline (the rings jump from one side of
    // a corner to the other), the skipped outline points are INSERTED — so the lip, the wall and the back follow the
    // real corner instead of a chord across it (found 3 October: the stem's corners came out as 45° chamfers once the
    // band deepened). The flat lip fans out from the foot ring to fill the gap.
    const sRing: number[] = [];
    { let t = G[0].s; sRing.push(t); for (let k = 1; k < m; k++) { let ds = G[k].s - t; ds -= nS * Math.round(ds / nS); t += Math.max(0, ds); sRing.push(t); } }
    const tangentOut = (sv: number) => {
      const [ax0, ay0] = field.at(sv - 0.5), [bx0, by0] = field.at(sv + 0.5);
      const l = Math.hypot(bx0 - ax0, by0 - ay0) || 1;
      return [(by0 - ay0) / l, -(bx0 - ax0) / l] as const; // outline CCW, inside on the left → outward is the right
    };
    type OP = { x: number; y: number; ox: number; oy: number; ring: number };
    const expanded: OP[] = [];
    const extrasAfter: number[][] = []; // per ring index: indices into `expanded` of the inserted points that follow it
    for (let i = 0; i < m; i++) {
      const o = outer[i];
      expanded.push({ x: o.x, y: o.y, ox: -o.gx, oy: -o.gy, ring: i });
      const ex: number[] = [];
      const sa = sRing[i];
      const sb = i + 1 < m ? sRing[i + 1] : sRing[0] + nS;
      for (let k = Math.floor(sa) + 1; k < sb - 1e-6 && sb - sa < nS / 2; k++) {
        const [x, y] = field.at(k);
        const [ox, oy] = tangentOut(k);
        ex.push(expanded.length);
        expanded.push({ x, y, ox, oy, ring: -1 });
      }
      extrasAfter.push(ex);
    }
    // lip: the foot ring again with UP normals, out to the outline
    const foot = prev.map((v) => addV(pos[3 * v], pos[3 * v + 1], wallH, 0, 0, 1));
    const lipE = expanded.map(({ x, y }) => addV(x, y, wallH, 0, 0, 1));
    const ringAt = new Int32Array(m);
    expanded.forEach((e, k) => { if (e.ring >= 0) ringAt[e.ring] = k; });
    for (let i = 0; i < m; i++) {
      const j = (i + 1) % m;
      const fan = [ringAt[i], ...extrasAfter[i], ringAt[j]].map((k) => lipE[k]);
      for (let f = 0; f < fan.length - 1; f++) otherTris.push(foot[i], fan[f], fan[f + 1]);
      otherTris.push(foot[i], lipE[ringAt[j]], foot[j]);
    }
    // wall: outward normal per point, around the expanded outline
    const E = expanded.length;
    const wTop = expanded.map(({ x, y, ox, oy }) => addV(x, y, wallH, ox, oy, 0));
    const wBot = expanded.map(({ x, y, ox, oy }) => addV(x, y, 0, ox, oy, 0));
    for (let i = 0; i < E; i++) { const j = (i + 1) % E; otherTris.push(wTop[i], wBot[j], wTop[j], wTop[i], wBot[i], wBot[j]); }
    // back: earcut on the expanded outline with collapsed (repeated) points removed, facing −z
    const uniq: number[] = [];
    for (let i = 0; i < E; i++) {
      const a = expanded[i], b = expanded[uniq.length ? uniq[uniq.length - 1] : (i + E - 1) % E];
      if (uniq.length === 0 || Math.hypot(a.x - b.x, a.y - b.y) > 1e-9) uniq.push(i);
    }
    if (uniq.length > 1) { const a = expanded[uniq[0]], b = expanded[uniq[uniq.length - 1]]; if (Math.hypot(a.x - b.x, a.y - b.y) <= 1e-9) uniq.pop(); }
    const back = uniq.map((i) => addV(expanded[i].x, expanded[i].y, 0, 0, 0, -1));
    const ring2 = uniq.map((i) => new THREE.Vector2(expanded[i].x, expanded[i].y));
    for (const [a, b, c] of THREE.ShapeUtils.triangulateShape(ring2, [])) {
      if (area2(back[a], back[b], back[c]) > 0) otherTris.push(back[a], back[c], back[b]);
      else otherTris.push(back[a], back[b], back[c]);
    }
  }

  // ── stats, from the BUILT mesh ──
  const all = [...smoothTris, ...otherTris];
  let nan = 0;
  for (const v of pos) if (!Number.isFinite(v)) nan++;
  for (const v of nor) if (!Number.isFinite(v)) nan++;
  const weld = new Map<string, number>();
  const wid = (v: number) => {
    const k = `${Math.round(pos[3 * v] * 1e7)},${Math.round(pos[3 * v + 1] * 1e7)},${Math.round(pos[3 * v + 2] * 1e7)}`;
    let id = weld.get(k);
    if (id === undefined) { id = weld.size; weld.set(k, id); }
    return id;
  };
  const edges = new Map<string, number>();
  for (let t = 0; t < all.length; t += 3) {
    const w = [wid(all[t]), wid(all[t + 1]), wid(all[t + 2])];
    if (w[0] === w[1] || w[1] === w[2] || w[0] === w[2]) continue; // degenerate: a collapsed ring point
    for (let e = 0; e < 3; e++) {
      const a = w[e], b = w[(e + 1) % 3];
      const k = a < b ? `${a}_${b}` : `${b}_${a}`;
      edges.set(k, (edges.get(k) ?? 0) + 1);
    }
  }
  let open = 0, nonMan = 0;
  for (const c of edges.values()) { if (c === 1) open++; else if (c > 2) nonMan++; }
  let crest = 0;
  for (let i = 2; i < pos.length; i += 3) crest = Math.max(crest, pos[i]);
  let maxAng = 0, maxCrest = 0, maxEase = 0, over30 = 0;
  for (let t = 0; t < smoothTris.length; t += 3) for (let e = 0; e < 3; e++) {
    const a = smoothTris[t + e], b = smoothTris[t + ((e + 1) % 3)];
    const dot = nor[3 * a] * nor[3 * b] + nor[3 * a + 1] * nor[3 * b + 1] + nor[3 * a + 2] * nor[3 * b + 2];
    const ang = (Math.acos(Math.min(1, Math.max(-1, dot))) * 180) / Math.PI;
    maxAng = Math.max(maxAng, ang);
    if (ang > 30) over30++;
    const eased = vr[a] < R - 1e-9 || vr[b] < R - 1e-9;
    if (eased) maxEase = Math.max(maxEase, ang);
    else if (vd[a] >= 0.9 * R && vd[b] >= 0.9 * R) maxCrest = Math.max(maxCrest, ang);
  }
  let maxStep = 0;
  for (let t = 0; t < gridTris.length; t += 3) for (let e = 0; e < 3; e++) {
    const a = gridTris[t + e], b = gridTris[t + ((e + 1) % 3)];
    maxStep = Math.max(maxStep, Math.abs(pos[3 * a + 2] - pos[3 * b + 2]));
  }

  // ── scale to model units, pack ──
  const P32 = new Float32Array(pos.length);
  for (let i = 0; i < pos.length; i++) P32[i] = pos[i] * p.scale;
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(P32, 3));
  g.setAttribute("normal", new THREE.BufferAttribute(new Float32Array(nor), 3));
  g.setIndex(all);
  g.computeBoundingBox();
  g.computeBoundingSphere();

  return {
    geometry: g,
    stats: {
      vertices: pos.length / 3,
      triangles: all.length / 3,
      openEdges: open,
      nonManifoldEdges: nonMan,
      nanValues: nan,
      flippedBandTriangles: flipped,
      ringClamps: clamps,
      crestHeight: crest,
      crestOverHalfWidth: crest / LOGO_HALF_WIDTH.median,
      maxNormalAngleCrestDeg: maxCrest,
      maxNormalAngleStemEaseDeg: maxEase,
      maxNormalAngleDeg: maxAng,
      edgesOver30Deg: over30,
      maxGridZStepSourcePx: maxStep * LOGO_OUTLINE_SOURCE.pxPerUnit,
      rUsed: R,
    },
  };
}
