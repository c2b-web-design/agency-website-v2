/**
 * ⛔⛔ THE C2B MARK AS A SOLID — D-088. Pure: no React, no scene. Chunk 2 imports this into the room.
 *
 * ⛔ PASS 1 TAKE 2 (7 October 2026): A FLAT FACE FRAMED BY A NARROW CHAMFER — ONE PROFILE ALL ROUND.
 * Carl, on the 3 October form in clay: *"That junction on the b is clearly a problem… The ends of the text is also a
 * problem, that new design doesnt fit and is a departure from the original logo."* His answer, with a new shape target
 * (`live-work/references/desk-mark-refs-7-october/flat-face-shape-target.png`; `flat-face-compare-engraved.png` to
 * compare): *"Use this one, the face is a bit more flat and making curves out of triangles can be difficult especially
 * when the geometry isnt uniform throughout the whole object. It was designed to look good, not to exist as a 3D
 * object. Just observe the shape."*
 *
 * ⛔ WHY ONE NARROW CHAMFER FIXES BOTH FAULTS:
 *   - THE JUNCTION. The 3 October form had two cross-sections — a dome on the strokes, a bevelled face on the stem — and
 *     MORPHED between them inside a 0.04-unit band at the b; the tear was that morph (46.7°, baseline
 *     `live-work/logo-pass1-baseline-7-october.md`). With ONE profile the stem and the bowl are the same surface at the
 *     same height; the distance field turns the inside corner on its own, following the traced fillet.
 *   - THE ENDS. A bevel as wide as the stroke's half-width meets itself in a POINT at every convex corner — the pyramid
 *     ends. A bevel far narrower than the half-width leaves a flat face, so an end is a flat cut in a picture-frame of
 *     chamfer, mitred at its corners — the stem's ends and the c's cut in the target.
 *   ⚠ This SUPERSEDES step 3 of plan v2 (two solids, a rolling-ball fillet, a cap — Carl's option 2): the existing
 *   mechanism with a different cross-section; nothing new. Plan v3: `live-work/desk-mark-pass1-mesh-plan-7-october.md`.
 *
 * ⛔ CONSTRUCTION — ONE MECHANISM, A SIGNED DISTANCE FIELD `d` TO THE TRACED OUTLINE (`logo-mark-outline.ts`):
 *   1. INTERIOR — a regular grid, clipped at the iso-level `d = dc` (marching triangles). ⛔ dc lies BEYOND the profile's
 *      last curvature by more than a grid step, so every interior node AND its neighbours sit on the flat face: the grid
 *      carries no slope, no crease, nothing to stair-step (chunk 1's deviation 4 cannot recur).
 *   2. EDGE BAND — from that clip loop out to the outline, RINGS swept along ∇d at explicit levels: through the round
 *      (evenly in angle) and down the chamfer. All of the profile's curvature lives in rings PARALLEL TO THE OUTLINE.
 *   3. LIP, WALL, BACK — the band's outer ring gives the lip, the vertical wall and the flat back (earcut on that ring).
 *      Watertight by construction: ONE ring feeds all three.
 *   ⛔ THE OUTER RING IS PINNED TO THE OUTLINE AND ONLY ADVANCES ALONG IT (arc-length clamped monotonic) — found
 *   3 October: at concave corners the closest-point offset folded back and earcut left sliver holes. ⛔ Skipped outline
 *   points are INSERTED at convex corners, so the lip, wall and back follow the real corner, not a chord.
 *   ⚠ TWO LOOPS EXIST (Architect A8, chunk 1): the outline file and the ring built from it; the bench's edge-distance
 *   measurement keeps them together, not this comment.
 *
 * ⛔ THE PROFILE (mark units, height = 1), with B = bevel width, k = bevelRise (rise ÷ run; 1 = 45°), ρ = the round:
 *   z = wallH                                  d < lipW              the lip (a hair — the base's double line is a later take)
 *   z = wallH + k (d − lipW)                   lipW ≤ d ≤ d1         the straight chamfer
 *   z = the circular arc of radius ρ           d1 ≤ d ≤ B + T        tangent to the chamfer AND the face — no crease
 *   z = top = wallH + k (B − lipW)              d ≥ B + T             the flat face
 *   with θ = atan k, T = ρ tan(θ/2), d1 = B + T − ρ sin θ; wallH = depth − k (B − lipW), so `depth` is the total thickness.
 * ⛔ B + T ≤ 0.9 × `LOGO_R_CAP` (the narrowest stroke body): the face exists on every stroke, so no medial axis ever
 * meets a slope — no spine seam. The medial axis still runs into each CONVEX corner, where the chamfers MITRE: that is
 * the picture-frame corner the target shows.
 *
 * ⛔ NORMALS — ONE METHOD OVER THE WHOLE FRONT (Architect A4, plan v2): central differences of the exact height
 * z = profile(d(x, y)) at a fixed step h (`NORMAL_H_PX`, ¼ source px). Never from the mesh. On the interior that is
 * exactly (0, 0, 1), because dc keeps every node and its neighbours on the flat. ⚠ A mitre is a true crease: within h
 * of it the difference straddles it. `flat` mode on the bench lights the triangles and is the check on all of this.
 */
import * as THREE from "three";
import { LOGO_ASPECT, LOGO_OUTLINE, LOGO_OUTLINE_SOURCE, LOGO_R_CAP } from "./logo-mark-outline";

/** One source pixel of the trace, in mark units. Dials are set in source px — the units the target is measured in. */
export const SRC_PX = 1 / LOGO_OUTLINE_SOURCE.pxPerUnit;
const NORMAL_H_PX = 0.25;

export type LogoMarkParams = {
  /** model units per mark height (mm on the bench). */
  scale: number;
  /** interior grid step, mark units. */
  gridStep: number;
  /** the chamfer's width B, mark units — where the chamfer's line meets the face's plane. */
  bevelW: number;
  /** the chamfer's slope, rise ÷ run (1 = 45°). */
  bevelRise: number;
  /** the round between the chamfer and the face, radius, mark units (0 = a sharp edge). */
  edgeRound: number;
  /** the mark's total thickness, back to face, mark units. */
  depth: number;
  /** the flat lip at the wall's top, mark units (a hair: the band and the lip need it > 0). */
  lipW: number;
  /** rings down the chamfer. */
  chamferRings: number;
  /** rings through the round. */
  roundRings: number;
};

/** ⚠ STARTING POINTS for Carl's eye, not proposals. The bevel is MEASURED off the flat-face target (≈ 15 source px on the
 *  stem's sides and ends); the depth keeps chunk 1's thickness (≈ 41 source px); 45° and the round are first guesses. */
export const LOGO_MARK_DEFAULTS: LogoMarkParams = {
  scale: 1,
  gridStep: 1 / 280,
  bevelW: 15 * SRC_PX,
  bevelRise: 1,
  edgeRound: 4 * SRC_PX,
  depth: 41 * SRC_PX,
  lipW: 1 * SRC_PX,
  chamferRings: 4,
  roundRings: 8,
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
  /** the face's height (the total thickness), mark units. */
  crestHeight: number;
  /** the lip's height, mark units — the window readouts are front-only, above it. */
  lipHeight: number;
  /** ⛔ max angle between an edge's end normals ON THE FACE (both ends at d ≥ B + T) — must be ~0: the face is flat. */
  maxNormalAngleFaceDeg: number;
  /** max angle over the whole smooth front — includes the mitres at convex corners, which are intended. */
  maxNormalAngleDeg: number;
  /** smooth-front edges over 30° (the mitres). */
  edgesOver30Deg: number;
  /** max |Δz| along an interior-grid edge, in source px — must be 0: the grid carries only the flat. */
  maxGridZStepSourcePx: number;
  /** the bevel width actually used (after the cap), mark units. */
  bevelUsed: number;
};

// ── pass 1 (7 October 2026): readouts inside a window — the junction's before/after (Architect A6) ──────────────

export type WindowReadouts = {
  /** front triangles wholly inside the window and above the lip (`zFloor`). */
  triangles: number;
  /** max angle between an edge's two COMPUTED vertex normals — what clay, zebra and normals shade with. */
  maxNormalAngleDeg: number;
  /** max angle between two adjacent triangles' FACE normals — the mesh as built, what `flat` shows (Architect A4). */
  maxDihedralDeg: number;
  /** 99th percentile of the same — one sliver can own a max. */
  p99DihedralDeg: number;
};

/**
 * ⛔ The junction window's readings from ANY built mark (the 3 October mesh is the control, pass 1's the treatment), on
 * WELDED positions so a split vertex does not hide a crease. Front triangles only: every vertex inside the window (mark
 * units) and above `zFloor` (the lip) — the lip/wall foot is a 90° crease by design and would own every max.
 */
export function windowReadouts(
  geometry: THREE.BufferGeometry,
  win: { x0: number; y0: number; x1: number; y1: number },
  scale: number,
  zFloor: number,
): WindowReadouts {
  const P = geometry.getAttribute("position") as THREE.BufferAttribute;
  const Nn = geometry.getAttribute("normal") as THREE.BufferAttribute;
  const idx = geometry.getIndex()!;
  const inWin = (v: number) => {
    const x = P.getX(v) / scale, y = P.getY(v) / scale, z = P.getZ(v) / scale;
    return x >= win.x0 && x <= win.x1 && y >= win.y0 && y <= win.y1 && z > zFloor + 1e-6;
  };
  const weld = new Map<string, number>();
  const wid = (v: number) => {
    const k = `${Math.round((P.getX(v) / scale) * 1e7)},${Math.round((P.getY(v) / scale) * 1e7)},${Math.round((P.getZ(v) / scale) * 1e7)}`;
    let id = weld.get(k);
    if (id === undefined) { id = weld.size; weld.set(k, id); }
    return id;
  };
  const deg = (d: number) => (Math.acos(Math.min(1, Math.max(-1, d))) * 180) / Math.PI;
  const faces: THREE.Vector3[] = [];
  const edgeFaces = new Map<string, number[]>();
  let maxN = 0;
  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3();
  for (let t = 0; t < idx.count; t += 3) {
    const v = [idx.getX(t), idx.getX(t + 1), idx.getX(t + 2)];
    if (!v.every(inWin)) continue;
    a.fromBufferAttribute(P, v[0]); b.fromBufferAttribute(P, v[1]); c.fromBufferAttribute(P, v[2]);
    const n = new THREE.Vector3().crossVectors(b.clone().sub(a), c.clone().sub(a));
    if (n.lengthSq() < 1e-24) continue; // degenerate
    const f = faces.push(n.normalize()) - 1;
    const w = v.map(wid);
    for (let e = 0; e < 3; e++) {
      const p = w[e], q = w[(e + 1) % 3];
      const k = p < q ? `${p}_${q}` : `${q}_${p}`;
      (edgeFaces.get(k) ?? edgeFaces.set(k, []).get(k)!).push(f);
      const i = v[e], j = v[(e + 1) % 3];
      maxN = Math.max(maxN, deg(Nn.getX(i) * Nn.getX(j) + Nn.getY(i) * Nn.getY(j) + Nn.getZ(i) * Nn.getZ(j)));
    }
  }
  const dih: number[] = [];
  for (const fs of edgeFaces.values()) if (fs.length === 2) dih.push(deg(faces[fs[0]].dot(faces[fs[1]])));
  dih.sort((p, q) => p - q);
  return {
    triangles: faces.length,
    maxNormalAngleDeg: maxN,
    maxDihedralDeg: dih.length ? dih[dih.length - 1] : 0,
    p99DihedralDeg: dih.length ? dih[Math.floor(0.99 * (dih.length - 1))] : 0,
  };
}

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

// ── the profile ─────────────────────────────────────────────────────────────────────────────────────────────────

function makeProfile(p: LogoMarkParams) {
  const k = p.bevelRise, lipW = p.lipW;
  const theta = Math.atan(k);
  // ⛔ cap: the face must exist on every stroke (B + T ≤ 0.9 × the narrowest body half-width)
  const B0 = Math.min(p.bevelW, 0.9 * LOGO_R_CAP);
  // the round can never take more than the chamfer it sits on: d1 = B + ρ (tan(θ/2) − sin θ) must stay ≥ lipW
  const rho = Math.max(0, Math.min(p.edgeRound, (0.9 * (B0 - lipW)) / (Math.sin(theta) - Math.tan(theta / 2))));
  const T = rho * Math.tan(theta / 2);
  const B = Math.min(B0, 0.9 * LOGO_R_CAP - T);
  const top = p.depth;
  const wallH = top - k * (B - lipW);
  const arcEnd = B + T;
  const d1 = arcEnd - rho * Math.sin(theta);
  const zc = top - rho;
  const z = (d: number) => {
    if (d < lipW) return wallH;
    if (d <= d1) return wallH + k * (d - lipW);
    if (d < arcEnd) { const u = d - arcEnd; return zc + Math.sqrt(Math.max(0, rho * rho - u * u)); }
    return top;
  };
  /** the band's ring levels in d, from the face inward to the foot: through the round evenly in ANGLE (the round turns
   *  the normal through θ; equal angles = equal turns per ring), then down the straight chamfer evenly. */
  const levels = (roundRings: number, chamferRings: number) => {
    const out: number[] = [];
    for (let i = 0; i <= roundRings; i++) out.push(arcEnd - rho * Math.sin((theta * i) / Math.max(1, roundRings)));
    for (let i = 1; i <= chamferRings; i++) out.push(d1 + ((lipW - d1) * i) / chamferRings);
    // drop repeats (a zero round collapses its rings onto one level)
    return out.filter((v, i) => i === 0 || v < out[i - 1] - 1e-9);
  };
  return { z, levels, B, T, rho, wallH, top, arcEnd, lipW };
}

// ── build ───────────────────────────────────────────────────────────────────────────────────────────────────────

export function buildLogoMarkGeometry(input: Partial<LogoMarkParams> = {}): {
  geometry: THREE.BufferGeometry;
  stats: LogoMarkStats;
} {
  const p = { ...LOGO_MARK_DEFAULTS, ...input };
  const prof = makeProfile(p);
  const { wallH, arcEnd } = prof;
  const step = p.gridStep;
  // ⛔ the clip sits beyond the last curvature by MORE than a grid step: every interior node and its neighbours are flat
  const dc = arcEnd + 1.5 * step;
  const cap = dc + 3 * step;
  const field = buildField(cap);
  const h = NORMAL_H_PX * SRC_PX;

  /** distance to the outline at (x, y) — the point is inside (band points are ≥ lipW from the edge, lipW > h). */
  const dist = (x: number, y: number) => field.nearest(x, y)?.dist ?? cap;
  /** ⛔ THE ONE NORMAL METHOD (A4): central differences of z = profile(d) at ±h. */
  const fieldNormal = (x: number, y: number) => {
    const zx = (prof.z(dist(x + h, y)) - prof.z(dist(x - h, y))) / (2 * h);
    const zy = (prof.z(dist(x, y + h)) - prof.z(dist(x, y - h))) / (2 * h);
    const L = Math.hypot(zx, zy, 1);
    return [-zx / L, -zy / L, 1 / L] as const;
  };

  // vertex store (mark units until the end); vd = each smooth vertex's d, for the face readout
  const pos: number[] = [], nor: number[] = [], vd: number[] = [];
  const addV = (x: number, y: number, z: number, nx: number, ny: number, nz: number, d = -1) => {
    pos.push(x, y, z); nor.push(nx, ny, nz); vd.push(d); return pos.length / 3 - 1;
  };
  const smoothTris: number[] = []; // interior + band (one smooth surface)
  const otherTris: number[] = []; // lip, wall, back
  const gridTris: number[] = []; // the interior alone, for the z-step readout

  // ── 1. interior: grid clipped at d = dc — all of it on the flat face ──
  const x0 = -LOGO_ASPECT / 2 - 3 * step, y0 = -3 * step;
  const nx = Math.ceil((LOGO_ASPECT + 6 * step) / step), ny = Math.ceil((1 + 6 * step) / step);
  const NX = nx + 1;
  const D = new Float64Array(NX * (ny + 1));
  for (let j = 0; j <= ny; j++) {
    const y = y0 + j * step;
    const xs = field.rowCrossings(y);
    let k = 0;
    for (let i = 0; i <= nx; i++) {
      const x = x0 + i * step;
      while (k < xs.length && xs[k] < x) k++;
      const sign = k % 2 === 1 ? 1 : -1; // odd crossings to the left = inside
      const q = field.nearest(x, y);
      D[j * NX + i] = q ? sign * q.dist : sign * cap;
    }
  }
  const Z = new Float64Array(D.length);
  for (let id = 0; id < D.length; id++) Z[id] = prof.z(Math.max(0, D[id]));
  const nodeV = new Int32Array(D.length).fill(-1);
  const nodeVertex = (id: number) => {
    if (nodeV[id] >= 0) return nodeV[id];
    const i = id % NX, j = Math.floor(id / NX);
    // central differences of the exact height on the grid — exactly flat here, by dc's margin
    const zx = (Z[j * NX + Math.min(nx, i + 1)] - Z[j * NX + Math.max(0, i - 1)]) / (step * (Math.min(nx, i + 1) - Math.max(0, i - 1)));
    const zy = (Z[Math.min(ny, j + 1) * NX + i] - Z[Math.max(0, j - 1) * NX + i]) / (step * (Math.min(ny, j + 1) - Math.max(0, j - 1)));
    const L = Math.hypot(zx, zy, 1);
    return (nodeV[id] = addV(x0 + i * step, y0 + j * step, Z[id], -zx / L, -zy / L, 1 / L, D[id]));
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
    const [ux, uy, uz] = fieldNormal(x, y);
    const v = addV(x, y, prof.z(dc), ux, uy, uz, dc);
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
  const levels = prof.levels(p.roundRings, p.chamferRings);
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
    let prev = L;
    levels.forEach((dk, r) => {
      const foot = r === levels.length - 1;
      const ring = L.map((v, i) => {
        const { gx, gy, d0 } = G[i];
        const x = pos[3 * v] - gx * (d0 - dk), y = pos[3 * v + 1] - gy * (d0 - dk);
        // ⛔ z from the TRUE distance at the ring point (one surface, one normal method) — except the foot ring, which
        // is pinned to the lip's height exactly: the lip's vertices are built at wallH and a mismatch is a crack.
        const z = foot ? wallH : prof.z(dist(x, y));
        const [ux, uy, uz] = fieldNormal(x, y);
        return addV(x, y, z, ux, uy, uz, dk);
      });
      for (let i = 0; i < m; i++) {
        const j = (i + 1) % m;
        for (const t of [[prev[i], ring[j], prev[j]], [prev[i], ring[i], ring[j]]]) {
          if (area2(t[0], t[1], t[2]) < 0) flipped++;
          smoothTris.push(t[0], t[1], t[2]);
        }
      }
      prev = ring;
    });
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
    // ⛔ CONVEX CORNERS: skipped outline points are INSERTED, so the lip, the wall and the back follow the real corner
    // instead of a chord across it (found 3 October). The lip fans out from the foot ring to fill the gap.
    const sRing: number[] = [];
    { let t = G[0].s; sRing.push(t); for (let k = 1; k < m; k++) { let ds = G[k].s - t; ds -= nS * Math.round(ds / nS); t += Math.max(0, ds); sRing.push(t); } }
    const tangentOut = (sv: number) => {
      const [ax0, ay0] = field.at(sv - 0.5), [bx0, by0] = field.at(sv + 0.5);
      const l = Math.hypot(bx0 - ax0, by0 - ay0) || 1;
      return [(by0 - ay0) / l, -(bx0 - ax0) / l] as const; // outline CCW, inside on the left → outward is the right
    };
    type OP = { x: number; y: number; ox: number; oy: number; ring: number };
    const expanded: OP[] = [];
    const extrasAfter: number[][] = [];
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
    const footV = prev.map((v) => addV(pos[3 * v], pos[3 * v + 1], wallH, 0, 0, 1));
    const lipE = expanded.map(({ x, y }) => addV(x, y, wallH, 0, 0, 1));
    const ringAt = new Int32Array(m);
    expanded.forEach((e, k) => { if (e.ring >= 0) ringAt[e.ring] = k; });
    for (let i = 0; i < m; i++) {
      const j = (i + 1) % m;
      const fan = [ringAt[i], ...extrasAfter[i], ringAt[j]].map((k) => lipE[k]);
      for (let f = 0; f < fan.length - 1; f++) otherTris.push(footV[i], fan[f], fan[f + 1]);
      otherTris.push(footV[i], lipE[ringAt[j]], footV[j]);
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
  let maxAng = 0, maxFace = 0, over30 = 0;
  for (let t = 0; t < smoothTris.length; t += 3) for (let e = 0; e < 3; e++) {
    const a = smoothTris[t + e], b = smoothTris[t + ((e + 1) % 3)];
    const dot = nor[3 * a] * nor[3 * b] + nor[3 * a + 1] * nor[3 * b + 1] + nor[3 * a + 2] * nor[3 * b + 2];
    const ang = (Math.acos(Math.min(1, Math.max(-1, dot))) * 180) / Math.PI;
    maxAng = Math.max(maxAng, ang);
    if (ang > 30) over30++;
    if (vd[a] >= arcEnd && vd[b] >= arcEnd) maxFace = Math.max(maxFace, ang);
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
      lipHeight: wallH,
      maxNormalAngleFaceDeg: maxFace,
      maxNormalAngleDeg: maxAng,
      edgesOver30Deg: over30,
      maxGridZStepSourcePx: maxStep * LOGO_OUTLINE_SOURCE.pxPerUnit,
      bevelUsed: prof.B,
    },
  };
}

// ── the mark's centre — where the gold → platinum-blue crossing ENDS (Carl, 7 October 2026) ──────────────────────

/**
 * ⛔ THE CENTRE OF THE MARK IN ALL THREE AXES, mark units — the END POINT of the colour crossing. Carl, 7 October:
 * *"measure the logos centre spot. Not just coordinates for height and width but for thickness too. That will be a
 * ending point for the colour transition"* — an OUTSIDE-IN circular wipe (the reverse of the Begin button's entrance),
 * the platinum blue closing in and the gold going LAST here. Measured on the built pass-1 solid
 * (`live-work/logo-centre-measurement-7-october.md`):
 *   - x, y = the centre of the mark's box: (0, 0.5) BY CONSTRUCTION — the trace's normalisation puts the origin at the
 *     box's bottom-centre with height 1 (`LOGO_OUTLINE_SOURCE`). Source px (845.2, 486.5). The 3D counterpart of
 *     `/start`'s nail (the letterforms' box centre), NOT the volume centroid (19 px right, 41.5 px lower).
 *   - z = HALF THE DEPTH — the box runs 0 (the flat back) to `depth` (the face). It FOLLOWS the depth dial.
 * It falls INSIDE the solid, on the 2's diagonal, 22 source px from its upper-left edge, under the flat face — where
 * `/start`'s 2D wipe also leaves its last gold.
 */
export function logoMarkCentre(p: Pick<LogoMarkParams, "depth" | "scale"> = LOGO_MARK_DEFAULTS): [number, number, number] {
  return [0, 0.5 * p.scale, (p.depth / 2) * p.scale];
}

// ── the crossing's reach — how far the solid's SURFACE lies from the centre (Carl, 8 October 2026) ───────────────────

/**
 * ⛔ THE CROSSING'S VISIBLE WINDOW, measured from the BUILT mesh (model units, the geometry's own scale). The crossing is a
 * SPHERE about `logoMarkCentre()` — Carl, 8 October: *"In the 3D world you account for height, width and depth"* —
 * shrinking outside in. The edge is only ON the metal while the radius lies between these two:
 *   - `far`  — the furthest surface point (a vertex: the furthest point of a triangle is always one of its corners).
 *             Above it the whole mark is gold and nothing moves.
 *   - `near` — the nearest surface point, on ANY triangle (vertices alone overstate it). The centre is INSIDE the
 *             solid, so the last gold leaves the surface here, not at radius 0. Below it the whole mark is blue.
 * Mapping the crossing's 0 → 1 onto [far → near] puts all of it on the metal — no dead lead-in (the `/start` logo's
 * first ~300 ms) and no dead tail (Begin's last 4 s): `live-work/start-*-transition-observed-8-october.md`.
 * At the defaults (depth 41 px), measured in Node on 8 October: far 0.9777 mark units (547.4 src px, the b's lower
 * right, on the back); near 0.0348 (19.5 src px, on the chamfer). These follow the dials; nothing here is a constant.
 */
export function logoMarkReach(g: THREE.BufferGeometry, centre: readonly [number, number, number]): { far: number; near: number } {
  const P = g.getAttribute("position") as THREE.BufferAttribute;
  const a = P.array as ArrayLike<number>;
  const [cx, cy, cz] = centre;
  let far = 0;
  for (let i = 0; i < a.length; i += 3) far = Math.max(far, Math.hypot(a[i] - cx, a[i + 1] - cy, a[i + 2] - cz));
  const ix = g.getIndex();
  const n = ix ? ix.count : P.count;
  const A = new THREE.Vector3(), B = new THREE.Vector3(), C = new THREE.Vector3(), Q = new THREE.Vector3();
  const tri = new THREE.Triangle();
  const c = new THREE.Vector3(cx, cy, cz);
  let near = Infinity;
  for (let t = 0; t < n; t += 3) {
    const i0 = ix ? ix.getX(t) : t, i1 = ix ? ix.getX(t + 1) : t + 1, i2 = ix ? ix.getX(t + 2) : t + 2;
    A.fromBufferAttribute(P, i0); B.fromBufferAttribute(P, i1); C.fromBufferAttribute(P, i2);
    tri.set(A, B, C).closestPointToPoint(c, Q);
    near = Math.min(near, Q.distanceTo(c));
  }
  return { far, near };
}
