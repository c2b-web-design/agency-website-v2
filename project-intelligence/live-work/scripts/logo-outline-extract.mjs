/**
 * THE MARK'S OUTLINE, EXTRACTED ONCE FROM CARL'S GOLD TARGET — D-088 chunk 1, 3 October 2026.
 *   node --no-warnings project-intelligence/live-work/scripts/logo-outline-extract.mjs
 * Writes components/about/logo-mark-outline.ts. Plan: live-work/desk-mark-chunk1-plan-3-october.md, Step 1.
 *
 * ⛔ THE SOURCE IS THE GOLD TARGET'S OWN CUT-OUT, `c2b-logo-gold-relit-alpha-1671.png` — NOT the white
 * silhouette, which was measured to be a different, bolder drawing (IoU 0.84). Carl: "Yes, use the gold target
 * and not white silhouette."
 *
 * Method: marching squares on the anti-aliased alpha at the 0.5 iso-line, linearly interpolated (sub-pixel) →
 * closed loops → light corner-preserving smoothing → Ramer–Douglas–Peucker → a CENTRIPETAL CATMULL-ROM SPLINE through
 * the simplified points, resampled every RESAMPLE_PX.
 * ⛔ WHY THE SPLINE (3 October, the first bench render): a polyline's tangent jumps at every vertex, and a metal tube
 * swept along it bends in steps — the reflection jumped at each joint and read as DASHES along every stroke (the
 * 385-point outline: joints ~18 px apart). The spline's tangent turns continuously. Also emitted, from the same pixels
 * so they share the provenance (Architect A3/A4): the stem rectangle, the stroke half-widths (EDT), and the
 * normalisation transform (source px → mark units, height = 1, origin bottom-centre).
 *
 * ⛔ PASS 1 (7 October 2026, plan `live-work/desk-mark-pass1-mesh-plan-7-october.md` v2, Step 2) adds, from the same
 * pixels: R's cap at the NARROWEST STROKE BODY (Carl's option 2, replacing p5 — now the bevel's cap), the JUNCTION
 * (inside fillet radii, the readings' window) and the stem's outer corner radii. v2's tube polygon was removed with v3.
 */
import sharp from "sharp";
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";

const SRC = "brand-assets/logo/c2b-logo-gold-relit-alpha-1671.png";
const OUT = "components/about/logo-mark-outline.ts";
const ISO = 0.5;
const CORNER_DEG = 30; // turning angle (over ±2 points) above which a vertex is a corner and is not smoothed
const SMOOTH_ITER = 4;
const RDP_TOL = 0.1; // source px
const RESAMPLE_PX = 1.5; // the spline's sample spacing

const md5 = createHash("md5").update(readFileSync(SRC)).digest("hex");
const { data, info } = await sharp(SRC).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const W = info.width, H = info.height;
const A = (x, y) => (x < 0 || y < 0 || x >= W || y >= H ? 0 : data[(y * W + x) * 4 + 3] / 255);

// ── marching squares ─────────────────────────────────────────────────────────
// Corner samples sit at pixel centres (x + 0.5, y + 0.5). Edge ids: horizontal edge (x,y)-(x+1,y) → "h,x,y";
// vertical edge (x,y)-(x,y+1) → "v,x,y". Each cell emits 0–2 segments joining edge crossings.
const pt = new Map(); // edge id → [px, py]
const lerp = (a, b) => (ISO - a) / (b - a);
function cross(id) {
  if (pt.has(id)) return id;
  const [k, xs, ys] = id.split(","); const x = +xs, y = +ys;
  if (k === "h") { const t = lerp(A(x, y), A(x + 1, y)); pt.set(id, [x + t + 0.5, y + 0.5]); }
  else { const t = lerp(A(x, y), A(x, y + 1)); pt.set(id, [x + 0.5, y + t + 0.5]); }
  return id;
}
const next = new Map(); // directed: from edge id → to edge id (outline with inside on a consistent side)
for (let y = -1; y < H; y++) for (let x = -1; x < W; x++) {
  const a = A(x, y), b = A(x + 1, y), c = A(x + 1, y + 1), d = A(x, y + 1);
  let k = (a > ISO ? 8 : 0) | (b > ISO ? 4 : 0) | (c > ISO ? 2 : 0) | (d > ISO ? 1 : 0);
  if (k === 0 || k === 15) continue;
  const T = `h,${x},${y}`, R = `v,${x + 1},${y}`, B = `h,${x},${y + 1}`, L = `v,${x},${y}`;
  const centre = (a + b + c + d) / 4 > ISO;
  // segments oriented so the INSIDE is on the left when walking in image coords (y down)
  const segs = {
    1: [[L, B]], 2: [[B, R]], 3: [[L, R]], 4: [[R, T]], 6: [[B, T]], 7: [[L, T]], 8: [[T, L]], 9: [[T, B]],
    11: [[T, R]], 12: [[R, L]], 13: [[R, B]], 14: [[B, L]],
    5: centre ? [[L, T], [R, B]] : [[L, B], [R, T]],
    10: centre ? [[T, R], [B, L]] : [[T, L], [B, R]],
  }[k];
  for (const [p, q] of segs) next.set(cross(p), cross(q));
}
// chain into loops
const loops = [];
const seen = new Set();
for (const start of next.keys()) {
  if (seen.has(start)) continue;
  const loop = []; let e = start;
  while (!seen.has(e)) { seen.add(e); loop.push(pt.get(e)); e = next.get(e); if (e === undefined) break; }
  loops.push(loop);
}
const area = (l) => { let s = 0; for (let i = 0; i < l.length; i++) { const [x1, y1] = l[i], [x2, y2] = l[(i + 1) % l.length]; s += x1 * y2 - x2 * y1; } return s / 2; };
const big = loops.filter((l) => Math.abs(area(l)) > 50).sort((p, q) => Math.abs(area(q)) - Math.abs(area(p)));
const outer = big.filter((l) => area(l) > 0), holes = big.filter((l) => area(l) < 0);
console.log(`loops: ${loops.length} raw, ${big.length} with area > 50 px² → outer ${outer.length}, holes ${holes.length}`);
if (outer.length !== 1 || holes.length !== 0) { console.log("⛔ STOP — expected exactly 1 outer loop and 0 holes (plan stop condition)."); process.exit(1); }
const raw = outer[0];

// ── corner-preserving smoothing, then RDP ────────────────────────────────────
const n = raw.length;
const turn = (i) => {
  const [ax, ay] = raw[(i - 2 + n) % n], [bx, by] = raw[i], [cx, cy] = raw[(i + 2) % n];
  const a1 = Math.atan2(by - ay, bx - ax), a2 = Math.atan2(cy - by, cx - bx);
  let d = Math.abs(a2 - a1); if (d > Math.PI) d = 2 * Math.PI - d; return (d * 180) / Math.PI;
};
const corner = raw.map((_, i) => turn(i) > CORNER_DEG);
let sm = raw.map((p) => [...p]);
for (let it = 0; it < SMOOTH_ITER; it++) {
  sm = sm.map((p, i) => corner[i] ? p : [
    0.5 * p[0] + 0.25 * (sm[(i - 1 + n) % n][0] + sm[(i + 1) % n][0]),
    0.5 * p[1] + 0.25 * (sm[(i - 1 + n) % n][1] + sm[(i + 1) % n][1]),
  ]);
}
function segDist(p, a, b) {
  const dx = b[0] - a[0], dy = b[1] - a[1]; const L2 = dx * dx + dy * dy;
  let t = L2 ? ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / L2 : 0; t = Math.max(0, Math.min(1, t));
  return Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy);
}
function rdp(pts, tol) {
  const keep = new Uint8Array(pts.length); keep[0] = keep[pts.length - 1] = 1;
  const st = [[0, pts.length - 1]];
  while (st.length) { const [i, j] = st.pop(); let m = -1, md = 0; for (let k = i + 1; k < j; k++) { const d = segDist(pts[k], pts[i], pts[j]); if (d > md) { md = d; m = k; } } if (md > tol) { keep[m] = 1; st.push([i, m], [m, j]); } }
  return pts.filter((_, k) => keep[k]);
}
// split the closed loop at its first corner (or index 0) so RDP keeps it
const c0 = Math.max(0, corner.indexOf(true));
const open = [...sm.slice(c0), ...sm.slice(0, c0), sm[c0]];
const rdpPts = rdp(open, RDP_TOL).slice(0, -1);
// centripetal Catmull-Rom through the RDP points (closed), resampled by arc length
function catmull(P, step) {
  const m = P.length, out = [];
  for (let i = 0; i < m; i++) {
    const p0 = P[(i - 1 + m) % m], p1 = P[i], p2 = P[(i + 1) % m], p3 = P[(i + 2) % m];
    const tj = (a, b) => Math.pow(Math.hypot(b[0] - a[0], b[1] - a[1]), 0.5) || 1e-6;
    const t0 = 0, t1 = t0 + tj(p0, p1), t2 = t1 + tj(p1, p2), t3 = t2 + tj(p2, p3);
    const segLen = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]);
    const k = Math.max(1, Math.ceil(segLen / step));
    for (let s = 0; s < k; s++) {
      const t = t1 + ((t2 - t1) * s) / k;
      const L = (a, b, ta, tb) => [((tb - t) * a[0] + (t - ta) * b[0]) / (tb - ta), ((tb - t) * a[1] + (t - ta) * b[1]) / (tb - ta)];
      const A1 = L(p0, p1, t0, t1), A2 = L(p1, p2, t1, t2), A3 = L(p2, p3, t2, t3);
      const B1 = L(A1, A2, t0, t2), B2 = L(A2, A3, t1, t3);
      out.push(L(B1, B2, t1, t2));
    }
  }
  return out;
}
const simp = catmull(rdpPts, RESAMPLE_PX);
// deviation: every RAW iso-line point from the final polyline (one-sided Hausdorff — the polyline must stay on the edge)
let maxDev = 0;
{
  const m = simp.length;
  // bucket the final segments
  const G = 8, buckets = new Map();
  for (let i = 0; i < m; i++) { const a = simp[i], b = simp[(i + 1) % m];
    for (let gx = Math.floor(Math.min(a[0], b[0]) / G); gx <= Math.floor(Math.max(a[0], b[0]) / G); gx++)
      for (let gy = Math.floor(Math.min(a[1], b[1]) / G); gy <= Math.floor(Math.max(a[1], b[1]) / G); gy++) {
        const key = gx + "," + gy; if (!buckets.has(key)) buckets.set(key, []); buckets.get(key).push(i); } }
  for (const p of raw) { let best = Infinity; const gx = Math.floor(p[0] / G), gy = Math.floor(p[1] / G);
    for (let ox = -1; ox <= 1; ox++) for (let oy = -1; oy <= 1; oy++) for (const i of buckets.get(gx + ox + "," + (gy + oy)) ?? []) best = Math.min(best, segDist(p, simp[i], simp[(i + 1) % m]));
    maxDev = Math.max(maxDev, best); }
}
console.log(`points: raw ${n} → RDP ${rdpPts.length} → spline ${simp.length} (corners kept: ${corner.filter(Boolean).length}); max deviation of the iso-line from the final outline: ${maxDev.toFixed(3)} px`);
if (maxDev > 0.5) { console.log("⛔ STOP — deviation > 0.5 px (plan stop condition)."); process.exit(1); }

// ── the mark's box, the normalisation transform ──────────────────────────────
let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
for (const [x, y] of simp) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
const hPx = y1 - y0, cxPx = (x0 + x1) / 2;
const toMark = ([x, y]) => [(x - cxPx) / hPx, (y1 - y) / hPx]; // y up, height 1, origin bottom-centre

// ── half-widths: exact EDT (Felzenszwalb) on the alpha > 0.5 mask ────────────
const INF = 1e20;
function edt1(f, len) {
  const d = new Float64Array(len), v = new Int32Array(len), z = new Float64Array(len + 1); let k = 0; v[0] = 0; z[0] = -INF; z[1] = INF;
  for (let q = 1; q < len; q++) { let s; do { const p = v[k]; s = ((f[q] + q * q) - (f[p] + p * p)) / (2 * q - 2 * p); if (s <= z[k]) k--; else break; } while (k >= 0); k++; v[k] = q; z[k] = s; z[k + 1] = INF; }
  k = 0; for (let q = 0; q < len; q++) { while (z[k + 1] < q) k++; d[q] = (q - v[k]) ** 2 + f[v[k]]; } return d;
}
const grid = new Float64Array(W * H);
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) grid[y * W + x] = A(x, y) > ISO ? INF : 0;
for (let x = 0; x < W; x++) { const col = new Float64Array(H); for (let y = 0; y < H; y++) col[y] = grid[y * W + x]; const r = edt1(col, H); for (let y = 0; y < H; y++) grid[y * W + x] = r[y]; }
for (let y = 0; y < H; y++) { const r = edt1(grid.subarray(y * W, y * W + W), W); for (let x = 0; x < W; x++) grid[y * W + x] = r[x]; }
const dist = (x, y) => Math.sqrt(grid[y * W + x]);
const ridge = [];
for (let y = 2; y < H - 2; y++) for (let x = 2; x < W - 2; x++) { const d = dist(x, y); if (d <= 10) continue; let mx = true;
  for (let oy = -2; oy <= 2 && mx; oy++) for (let ox = -2; ox <= 2; ox++) if (dist(x + ox, y + oy) > d) { mx = false; break; } if (mx) ridge.push(d); }
ridge.sort((p, q) => p - q);
const pct = (q) => ridge[Math.floor(q * (ridge.length - 1))];
// pixel-centre EDT measures to the nearest OUTSIDE pixel centre; the iso-line sits ~0.5 px nearer
const hw = { p5: pct(0.05) - 0.5, median: pct(0.5) - 0.5, p95: pct(0.95) - 0.5, max: ridge[ridge.length - 1] - 0.5 };
console.log(`stroke half-width (source px): 5th ${hw.p5.toFixed(1)} · median ${hw.median.toFixed(1)} · 95th ${hw.p95.toFixed(1)} · max ${hw.max.toFixed(1)}`);
// ⛔ THE NARROWEST STROKE BODY — pass 1, 7 October 2026 (Carl, option 2: "Go with 2"). The dome's R is now capped HERE,
// not at p5. A2's rule is "R at or below the minimum half-width (5th percentile or lower)": wherever a stroke is
// narrower than R its crest is not flat and a faint ridge runs down its spine. p5 left the b's top stroke beside the
// junction (43.5 px) and the 2's diagonal (44.8 px) under it — measured 7 October, a ridge-point map: nothing else under
// 45. ⚠ p5 itself is the wrong statistic for this: it counts the ridge running out into each terminal's taper. The BODY
// minimum is the smallest ridge maximum wider than 0.6 × the median — the strokes, not their tapering ends.
let bodyMin = Infinity, bodyAt = [0, 0];
{
  const floor = 0.6 * (hw.median + 0.5);
  for (let y = 2; y < H - 2; y++) for (let x = 2; x < W - 2; x++) {
    const d = dist(x, y); if (d <= floor || d >= bodyMin + 0.5) continue; let mx = true;
    for (let oy = -2; oy <= 2 && mx; oy++) for (let ox = -2; ox <= 2; ox++) if (dist(x + ox, y + oy) > d) { mx = false; break; }
    if (mx) { bodyMin = d - 0.5; bodyAt = [x, y]; }
  }
}
console.log(`narrowest stroke BODY half-width: ${bodyMin.toFixed(2)} source px at (${bodyAt[0]}, ${bodyAt[1]}) — R's cap (pass 1)`);

// ── the stem rectangle ───────────────────────────────────────────────────────
// The stem is the only shape right of the 2 at 10% below the mark's top; its bottom is where its centre column
// first leaves the mark going down (the slit above the base).
const inside = (x, y) => A(Math.round(x - 0.5), Math.round(y - 0.5)) > ISO;
const probeY = y0 + 0.1 * hPx;
const runs = []; let on = false, rs = 0;
for (let x = Math.floor(x0 + 0.66 * (x1 - x0)); x <= Math.ceil(x1); x++) { const v = inside(x, probeY); if (v && !on) { rs = x; on = true; } if (!v && on) { runs.push([rs, x - 1]); on = false; } }
if (on) runs.push([rs, Math.ceil(x1)]);
if (runs.length !== 1) { console.log(`⛔ STOP — expected one run (the stem) right of the 2 at the probe row, found ${runs.length}.`); process.exit(1); }
const [sxa, sxb] = runs[0];
const scx = (sxa + sxb) / 2;
let sTop = probeY; while (inside(scx, sTop - 1)) sTop--;
let sBot = probeY; while (inside(scx, sBot + 1)) sBot++;
// refine the sides at mid-stem (above the shoulder where the bowl joins, so both sides are free)
const midY = sTop + 0.25 * (sBot - sTop);
let sl = scx; while (inside(sl - 1, midY)) sl--;
let sr = scx; while (inside(sr + 1, midY)) sr++;
const stemPx = { x0: sl - 0.5, x1: sr + 0.5, y0: sTop - 0.5, y1: sBot + 0.5 };
console.log(`stem (source px): x ${stemPx.x0.toFixed(1)}–${stemPx.x1.toFixed(1)}, y ${stemPx.y0.toFixed(1)}–${stemPx.y1.toFixed(1)} (${(stemPx.x1 - stemPx.x0).toFixed(1)} × ${(stemPx.y1 - stemPx.y0).toFixed(1)})`);
const [smx0, smy1] = toMark([stemPx.x0, stemPx.y0]), [smx1, smy0] = toMark([stemPx.x1, stemPx.y1]);

// ── write the module ─────────────────────────────────────────────────────────
const r5 = (v) => Math.round(v * 1e5) / 1e5;
// mark units: y up flips the winding — reverse so the loop is counter-clockwise (inside on the left) in mark space
const pts = simp.map(toMark).reverse();
const flat = pts.flatMap(([x, y]) => [r5(x), r5(y)]);

// ── PASS 1 (7 October 2026): THE JUNCTION AND THE STEM'S CORNERS, as traced ─────────────────────────────────────────
// Plan: live-work/desk-mark-pass1-mesh-plan-7-october.md. The b's two INSIDE corners (where the bowl leaves the stem's
// right side) and the stem's four OUTER corners, measured off the trace, and the JUNCTION WINDOW the before/after
// readings are taken in. ⚠ v2's tube polygon (the stem as its own solid, option 2) was generated here and REMOVED when
// v3 passed (Carl, 7 October: one flat-face profile all round — no second cross-section, so no tube to cut).
const STEM = { x0: smx0, x1: smx1, y0: smy0, y1: smy1 };
const PX = 1 / hPx; // one source px, mark units
const R_CAP = bodyMin / hPx; // the dome's R can never exceed the narrowest stroke body (A2, pass 1 — see bodyMin)
const N = pts.length;
const at = (i) => pts[((i % N) + N) % N];
const ang = (i) => { const [ax, ay] = at(i - 1), [bx, by] = at(i + 1); return Math.atan2(by - ay, bx - ax); };
const dAng = (a, b) => { let d = b - a; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; return d; };
/** Walk from i in direction dir (±1) while the outline turns faster than TURN_MIN per sample, AVERAGED over 3 samples
 *  (the spline wiggles sample to sample) — a fillet. Returns its far end, arc length, total turn, radius (arc ÷ turn).
 *  ⚠ Found 7 October: the counter's top edge is not straight — its fillet runs into the counter's arc (~0.5° per
 *  sample), so a 2°-per-single-sample threshold stopped mid-fillet and tilted the continuation 24°. 1° averaged over 3
 *  samples stops where the fillet's tail meets the arc. */
const TURN_MIN = (1 * Math.PI) / 180;
function fillet(i, dir) {
  let k = i, arc = 0, turn = 0;
  while (Math.abs(dAng(ang(k), ang(k + 3 * dir))) / 3 >= TURN_MIN) {
    turn += dAng(ang(k), ang(k + dir));
    arc += Math.hypot(at(k + dir)[0] - at(k)[0], at(k + dir)[1] - at(k)[1]);
    k += dir;
    if (Math.abs(k - i) > 200) break;
  }
  return { end: k, arc, turn, radius: Math.abs(turn) > 1e-6 ? arc / Math.abs(turn) : Infinity };
}
/** From a run's junction end, step BACK into the run until the side is truly vertical (±2°) — so a fillet is measured
 *  from where it starts, not from where the 1.5 px "on the line" test happens to end. */
function verticalStart(i, intoRun) {
  let k = i;
  for (let s = 0; s < 40 && Math.abs(Math.abs(ang(k)) - Math.PI / 2) > (2 * Math.PI) / 180; s++) k += intoRun;
  return k;
}
/** The unit tangent at i, in the walking direction, fitted over the next `span` samples AWAY from the fillet. */
function tangentAt(i, awayDir, span = 6) {
  const [ax, ay] = at(i), [bx, by] = at(i + awayDir * span);
  const l = Math.hypot(bx - ax, by - ay);
  return awayDir > 0 ? [(bx - ax) / l, (by - ay) / l] : [(ax - bx) / l, (ay - by) / l];
}
// the stem's right side: samples on its line, clear of the stem's own top and bottom corners
const onRight = pts.map(([x, y]) => Math.abs(x - STEM.x1) < 1.5 * PX && y > STEM.y0 + 4 * PX && y < STEM.y1 - 4 * PX);
const runsR = [];
for (let i = 0; i < N; i++) if (onRight[i] && !onRight[(i - 1 + N) % N]) { let j = i; while (onRight[(j + 1) % N]) j++; runsR.push([i, j]); }
if (runsR.length !== 2) { console.log(`⛔ STOP — expected the stem's right side to be split in TWO runs by the bowl, found ${runsR.length}.`); process.exit(1); }
const meanY = ([i, j]) => { let s = 0, c = 0; for (let k = i; k <= j; k++) { s += at(k)[1]; c++; } return s / c; };
const [lowerRun, upperRun] = runsR.sort((p, q) => meanY(p) - meanY(q));
// CCW (inside on the left): the right side is walked UPWARD. The upper run STARTS at the junction (its fillet lies
// behind it, then the bowl's top edge); the lower run ENDS at the junction (its fillet ahead, then the counter's top).
if (!(at(upperRun[1])[1] > at(upperRun[0])[1] && at(lowerRun[1])[1] > at(lowerRun[0])[1])) { console.log("⛔ STOP — the stem's right side is not walked upward; the winding is not what this step assumes."); process.exit(1); }
const fU = fillet(verticalStart(upperRun[0], +1), -1); // backward from the upper run onto the bowl's top edge
const fL = fillet(verticalStart(lowerRun[1], -1), +1); // forward from the lower run onto the counter's top edge
const iPU = fU.end, iPL = fL.end;
const PU = at(iPU), PL = at(iPL);
const tU = tangentAt(iPU, -1); // walking direction at PU (leftward along the bowl's top edge)
const tL = tangentAt(iPL, +1); // walking direction at PL (rightward along the counter's top edge)
console.log(`junction — inside corners (mark units): upper fillet r ${(fU.radius * hPx).toFixed(2)} px (turn ${((Math.abs(fU.turn) * 180) / Math.PI).toFixed(1)}°), ` +
  `lower fillet r ${(fL.radius * hPx).toFixed(2)} px (turn ${((Math.abs(fL.turn) * 180) / Math.PI).toFixed(1)}°)`);
console.log(`  PU (${PU[0].toFixed(4)}, ${PU[1].toFixed(4)}) tangent (${tU[0].toFixed(3)}, ${tU[1].toFixed(3)}) · PL (${PL[0].toFixed(4)}, ${PL[1].toFixed(4)}) tangent (${tL[0].toFixed(3)}, ${tL[1].toFixed(3)})`);
if (!(tU[0] < -0.5 && tL[0] > 0.5)) { console.log("⛔ STOP — the bowl's edges at the junction do not run left/right as assumed."); process.exit(1); }
// the stem's four OUTER corners, as traced (A3 — the box's corners are sharp; the trace's may not be)
const nearestIdx = (x, y) => { let b = 0, bd = Infinity; for (let i = 0; i < N; i++) { const d = Math.hypot(at(i)[0] - x, at(i)[1] - y); if (d < bd) { bd = d; b = i; } } return b; };
const stemCorner = (x, y) => { const i = nearestIdx(x, y); const a = fillet(i, -1), b = fillet(i, +1); const arc = a.arc + b.arc, turn = Math.abs(a.turn) + Math.abs(b.turn); return { radiusPx: turn > 1e-6 ? (arc / turn) * hPx : 0, turnDeg: (turn * 180) / Math.PI }; };
const stemCorners = {
  topLeft: stemCorner(STEM.x0, STEM.y1), topRight: stemCorner(STEM.x1, STEM.y1),
  bottomLeft: stemCorner(STEM.x0, STEM.y0), bottomRight: stemCorner(STEM.x1, STEM.y0),
};
for (const [k, v] of Object.entries(stemCorners)) console.log(`  stem corner ${k}: r ${v.radiusPx.toFixed(2)} px over ${v.turnDeg.toFixed(1)}°`);
// ⛔ THE JUNCTION WINDOW — from the corners, never typed by hand (Architect, should-fix): the fillets' ends and the run
// ends, the stem's bevel band at its widest (x down to STEM.x1 − R_CAP), grown by 4 × the larger inside radius.
// ⚠ FROZEN DERIVATION: these are exactly the terms v2 used (stemRMax was 1, the margin 2 × a fillet dial of 2 × r), so
// the window — and the 7 October baseline taken in it — is unchanged. Checked below against the baseline's record.
const insideR = [fU.radius, fL.radius];
const wpts = [PU, PL, at(upperRun[0]), at(lowerRun[1]), [STEM.x1 - R_CAP, PU[1]], [STEM.x1 - R_CAP, PL[1]]];
const wm = 4 * Math.max(...insideR);
const win = {
  x0: Math.min(...wpts.map((p) => p[0])) - wm, x1: Math.max(...wpts.map((p) => p[0])) + wm,
  y0: Math.min(...wpts.map((p) => p[1])) - wm, y1: Math.max(...wpts.map((p) => p[1])) + wm,
};
console.log(`  window x ${win.x0.toFixed(5)}–${win.x1.toFixed(5)}, y ${win.y0.toFixed(5)}–${win.y1.toFixed(5)} (${((win.x1 - win.x0) * hPx).toFixed(0)} × ${((win.y1 - win.y0) * hPx).toFixed(0)} px, margin ${(wm * hPx).toFixed(1)} px)`);
// ⛔ the window the BASELINE was measured in, read from what the bench logged at the time — never retyped. (The
// baseline .md once carried a retyped window off by ~5e-5; the readings were right, the transcription was not.)
const BASELINE_READINGS = "project-intelligence/live-work/screenshots/logo-pass1-7-october/baseline/readings.json";
let BASELINE_WIN = null;
try { BASELINE_WIN = JSON.parse(readFileSync(BASELINE_READINGS, "utf8")).states[0].w; } catch { console.log(`  ⚠ no baseline readings at ${BASELINE_READINGS} — window not checked`); }
if (BASELINE_WIN && Object.keys(BASELINE_WIN).some((k) => Math.abs(Math.round(win[k] * 1e5) / 1e5 - BASELINE_WIN[k]) > 1e-9)) { console.log("⛔ STOP — the junction window no longer matches the one the baseline was measured in."); process.exit(1); }
if (BASELINE_WIN) console.log("  ✔ the window matches the baseline's, as logged by the bench");
const ts = `/**
 * ⛔ GENERATED — DO NOT EDIT BY HAND. The C2B mark's outline, traced from Carl's GOLD TARGET (D-088 chunk 1), with the
 * pass-1 additions (7 October 2026): R's cap at the narrowest stroke body, the junction, the stem corners.
 * Regenerate: node --no-warnings project-intelligence/live-work/scripts/logo-outline-extract.mjs
 *
 * Source: ${SRC}  (md5 ${md5}, ${W} × ${H})
 * ⛔ NOT the white silhouette — a different, bolder drawing (IoU 0.84). Carl: "Yes, use the gold target and not
 * white silhouette." The cut-out's edge sits on the gold target's (c2b-logo-gold-relit-source-1671.png) edge.
 * Generated ${new Date().toISOString().slice(0, 10)} · iso ${ISO} · corners > ${CORNER_DEG}° kept · ${SMOOTH_ITER} smoothing passes · RDP ${RDP_TOL} px · centripetal Catmull-Rom resampled every ${RESAMPLE_PX} px
 * Raw iso-line ${n} points → RDP ${rdpPts.length} → spline ${simp.length}; max deviation of the iso-line from this outline ${maxDev.toFixed(3)} source px.
 *
 * MARK UNITS: height = 1, x right, y UP, origin at the BOTTOM-CENTRE of the mark's box (where it stands).
 * ⚠ The origin is NOT the topple's pivot — that is the front bottom edge, placed by chunk 3 with a group offset.
 * ONE closed loop, counter-clockwise (inside on the left), no holes, no repeated end point.
 */

/** Source px → mark units. The bench's front framing and the measurement derive from THIS, never from a hand fit. */
export const LOGO_OUTLINE_SOURCE = {
  file: "${SRC}",
  md5: "${md5}",
  widthPx: ${W},
  heightPx: ${H},
  /** the mark's box in source px (y down) */
  box: { x0: ${r5(x0)}, y0: ${r5(y0)}, x1: ${r5(x1)}, y1: ${r5(y1)} },
  /** mark x = (px − originPx.x) / pxPerUnit; mark y = (originPx.y − py) / pxPerUnit */
  pxPerUnit: ${r5(hPx)},
  originPx: { x: ${r5(cxPx)}, y: ${r5(y1)} },
} as const;

/** The mark's width in mark units (height = 1). */
export const LOGO_ASPECT = ${r5((x1 - x0) / hPx)};

/** Stroke half-width, mark units — measured (EDT ridge, iso-corrected). ⚠ The dome's R must not exceed p5 (Architect A2). */
export const LOGO_HALF_WIDTH = { p5: ${r5(hw.p5 / hPx)}, median: ${r5(hw.median / hPx)}, p95: ${r5(hw.p95 / hPx)}, max: ${r5(hw.max / hPx)} } as const;

/** The b's stem, mark units — detected from the same pixels (Architect A3), not typed in. */
export const LOGO_STEM = { x0: ${r5(smx0)}, y0: ${r5(smy0)}, x1: ${r5(smx1)}, y1: ${r5(smy1)} } as const;

/**
 * ⛔ THE CAP ON THE PROFILE'S WIDTH — the narrowest stroke BODY's half-width, mark units (pass 1, 7 October 2026).
 * Carl's option 2 on the width question ("Go with 2") made this the dome's R cap in place of p5: p5 left the b's top
 * stroke beside the junction (${bodyMin.toFixed(1)} px, the minimum, at source (${bodyAt[0]}, ${bodyAt[1]})) narrower than R.
 * The dome is gone (v3: a flat face in a narrow chamfer); the cap now holds the chamfer narrow enough that the flat face
 * exists on every stroke. The body minimum ignores the ridge's run-out into the terminals' tapers.
 */
export const LOGO_R_CAP = ${r5(R_CAP)};

/**
 * ⛔ THE JUNCTION — where the bowl joins the stem (pass 1). The two inside fillets as traced (radius = arc ÷ turn), the
 * points where they meet the bowl's edges, and the WINDOW the before/after readings are taken in: the fillets, the run
 * ends and the bevel band at its widest, grown by 4 × the larger inside radius. Never typed by hand (Architect).
 */
export const LOGO_JUNCTION = {
  insideRadiiPx: { upper: ${r5(fU.radius * hPx)}, lower: ${r5(fL.radius * hPx)} },
  pu: [${r5(PU[0])}, ${r5(PU[1])}], pl: [${r5(PL[0])}, ${r5(PL[1])}],
  window: { x0: ${r5(win.x0)}, y0: ${r5(win.y0)}, x1: ${r5(win.x1)}, y1: ${r5(win.y1)} },
} as const;

/** The stem's four OUTER corners as traced, source px (radius = arc ÷ turn) — the box's corners are sharp (A3). */
export const LOGO_STEM_CORNER_RADII_PX = { ${Object.entries(stemCorners).map(([k, v]) => `${k}: ${r5(v.radiusPx)}`).join(", ")} } as const;

/** The outline, flattened [x0, y0, x1, y1, …], mark units. */
export const LOGO_OUTLINE: readonly number[] = [
${(() => { const lines = []; for (let i = 0; i < flat.length; i += 12) lines.push("  " + flat.slice(i, i + 12).join(", ") + ","); return lines.join("\n"); })()}
];
`;
writeFileSync(OUT, ts);
console.log(`✔ wrote ${OUT} — ${pts.length} points, aspect ${((x1 - x0) / hPx).toFixed(4)}, box ${(x1 - x0).toFixed(1)} × ${hPx.toFixed(1)} source px`);
console.log("⚠ NOT CHECKED HERE: how the outline renders as a mesh — that is logo-bench-measure.mjs's job.");
