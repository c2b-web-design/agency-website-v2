/**
 * ⛔ THE ORNATE CORNER — D-100 (19 October 2026). ONE design for all 28 pieces on the home page (§2's four boxes in gold,
 * §3's three in platinum blue); colour and material the only differences (the material may differ per section — Carl:
 * *"material guided by what works best with the colour"*). PASS 1: THE SHAPE, judged in clay on `/proto/corner`.
 *
 * ⛔ TAKE 3 — COPIED FROM CARL'S BRACKET. Takes 1 and 2 swept tubes, then banded tubes, along drawn paths (Carl: *"screams
 * old, almost Victorian… like a railing"*; then *"if it was more solid we would have a lot more material for the light to
 * work with. Something with engraving and topology"*). Carl then made the design himself: a carved gilt ACANTHUS corner
 * bracket on a mitred L moulding — *"The image is in brand assets. Its ours, i made it with gemini. Copy it."*
 * Source: `brand-assets/c4bf3a09-80f3-4b2c-b88a-925f08e9c26f.jpg` (a mirrored pair; the LEFT piece is traced).
 *
 * ⛔ HOW IT IS COPIED — AS A RELIEF. A carving like this is a bas-relief: a flat back and a surface that rises and falls.
 * So the piece is a HEIGHT FIELD traced from the photo:
 *   1. THE SILHOUETTE — the gold separated from the grey ground by saturation (measured: ground ≤ 0.05, the gold's
 *      darkest crevice 0.56; threshold 0.22).
 *   2. THE MASS — each point raised by its distance from the silhouette's edge (rounded over `EDGE_ROUND_IMG` px), so
 *      every form is solid with a rounded edge.
 *   3. THE CARVING — that mass modulated by the photo's own light: the photo is lit from the front, so a crevice is dark
 *      and a crest is bright. ⚠ An ASSUMPTION ("dark = deep") — true of a front-lit carving, wrong where a shadow falls
 *      across a raised form. It is the copy's limit; the bench shows where it fails.
 *   4. THE MOULDING — NOT traced: the rails are drawn clean (a straight back on the box's lines, mitred, a bead along the
 *      inner edge), because the photo's light grades across them and a traced rail would not be straight.
 * The mesh carries the mass at half the photo's resolution; an OBJECT-SPACE NORMAL MAP at full resolution carries the
 * carving's detail to the light. On the page that pairing is cheap — the structural note will weigh it for 28 pieces.
 *
 * ⛔ SCALE — Carl: *"your scale is right"*. The piece is scaled so its reach into the corner (the largest min(u, v)) is
 * `reachPx` layout px, inside `CORNER_LIMIT_PX` (§3's tightest box: 48 screen px ≈ 35 layout px to the text).
 * ⛔ ORIENTATION — the bracket is tall (arms 405 × 200 photo px); the boxes are wide. `orient: "along"` (default) lays the
 * long arm ALONG THE TOP, the carving mirrored across the corner's diagonal; `"down"` keeps the photo's own way, the long
 * arm down the side.
 *
 * UNITS: LAYOUT px (CSS px before the site's zoom, D-097). FRAME: the TOP-LEFT corner — the corner at the origin, the box
 * towards +x (right) and −y (down), relief towards +z. The other corners are the same mesh mirrored by its transform.
 */
import * as THREE from "three";

/** ⛔ The ornament's limit near the corner, layout px from BOTH edges: 48 screen px ÷ 1.36 ≈ 35 to the text, less air. */
export const CORNER_LIMIT_PX = 26;

/** ⛔ Measured on the source photo (19 October 2026): the left piece's box, its rail width, the gold threshold. */
export const BRACKET_SOURCE = {
  /** the left piece, photo px: x0..x1, y0..y1 — its corner (the rails' meeting) is (x1, y1) */
  box: { x0: 49, x1: 249, y0: 87, y1: 492 },
  /** the moulding's width, photo px (the vertical rail at y0 + 30 measured 214–244) */
  railW: 31,
  satThreshold: 0.22,
} as const;

export const CORNER_DEFAULTS = {
  /** the piece's reach into the corner, layout px */
  reachPx: 24,
  /** the tallest relief, layout px */
  heightPx: 2.6,
  /** the moulding's height, as a fraction of the tallest relief */
  railHeight: 0.72,
  /** the edge's rounding, photo px */
  edgeRoundImg: 6,
  /** how much the photo's light carves the mass: 0 = a smooth inflated shape, 1 = crevices to the floor */
  carve: 0.6,
  orient: "along" as "along" | "down",
};
export type CornerParams = typeof CORNER_DEFAULTS;

export type CornerStats = {
  vertices: number; triangles: number;
  /** the largest min(u, v) over the piece, layout px — what must stay inside `CORNER_LIMIT_PX` */
  diagonalReach: number;
  extentU: number; extentV: number;
  height: number;
  /** layout px per photo px */
  scale: number;
  withinLimit: boolean;
};

/**
 * Build the corner (TOP-LEFT) from the source photo's pixels. `img` is the WHOLE photo as drawn to a canvas.
 * Returns the mesh, its object-space normal map, and readouts measured on what was built.
 */
export function buildCornerRelief(img: ImageData, params: Partial<CornerParams> = {}): {
  geometry: THREE.BufferGeometry; normalMap: THREE.DataTexture; alphaMap: THREE.DataTexture; stats: CornerStats;
} {
  const p = { ...CORNER_DEFAULTS, ...params };
  const B = BRACKET_SOURCE.box, RW = BRACKET_SOURCE.railW;
  // the piece in its own (a, b): a = distance from the RIGHT edge (the long rail), b = from the BOTTOM edge (the short rail)
  const A = B.x1 - B.x0 + 1, Bn = B.y1 - B.y0 + 1;
  const at = (a: number, b: number) => ((B.y1 - b) * img.width + (B.x1 - a)) * 4;

  // ── 1. the silhouette and the photo's light, in (a, b)
  const mask = new Uint8Array(A * Bn);
  const lum = new Float32Array(A * Bn);
  for (let b = 0; b < Bn; b++) for (let a = 0; a < A; a++) {
    const i = at(a, b), r = img.data[i], g = img.data[i + 1], bl = img.data[i + 2];
    const mx = Math.max(r, g, bl), mn = Math.min(r, g, bl);
    const sat = (mx - mn) / Math.max(mx, 1);
    const k = b * A + a;
    mask[k] = sat > BRACKET_SOURCE.satThreshold && r >= g && g >= bl - 5 ? 1 : 0;
    lum[k] = 0.3 * r + 0.59 * g + 0.11 * bl;
  }
  // the moulding's band is drawn clean: the rails' full run is solid whatever the photo shows there
  const railA = Bn - 1; // the long rail runs the whole height
  const railB = A - 1;
  const inRail = (a: number, b: number) => (a < RW && b <= railA) || (b < RW && a <= railB);
  for (let b = 0; b < Bn; b++) for (let a = 0; a < A; a++) if (inRail(a, b)) mask[b * A + a] = 1;

  // ── 2. the mass: distance from the silhouette's edge (two-pass chamfer), rounded
  const INF = 1e9;
  const dist = new Float32Array(A * Bn);
  for (let k = 0; k < dist.length; k++) dist[k] = mask[k] ? INF : 0;
  const D1 = 1, D2 = Math.SQRT2;
  for (let b = 0; b < Bn; b++) for (let a = 0; a < A; a++) {
    const k = b * A + a;
    if (!dist[k]) continue;
    let d = dist[k];
    if (a > 0) d = Math.min(d, dist[k - 1] + D1); else d = Math.min(d, D1);
    if (b > 0) d = Math.min(d, dist[k - A] + D1); else d = Math.min(d, D1);
    if (a > 0 && b > 0) d = Math.min(d, dist[k - A - 1] + D2);
    if (a < A - 1 && b > 0) d = Math.min(d, dist[k - A + 1] + D2);
    dist[k] = d;
  }
  for (let b = Bn - 1; b >= 0; b--) for (let a = A - 1; a >= 0; a--) {
    const k = b * A + a;
    if (!dist[k]) continue;
    let d = dist[k];
    if (a < A - 1) d = Math.min(d, dist[k + 1] + D1); else d = Math.min(d, D1);
    if (b < Bn - 1) d = Math.min(d, dist[k + A] + D1); else d = Math.min(d, D1);
    if (a < A - 1 && b < Bn - 1) d = Math.min(d, dist[k + A + 1] + D2);
    if (a > 0 && b < Bn - 1) d = Math.min(d, dist[k + A - 1] + D2);
    dist[k] = d;
  }
  // ⚠ the rails do not use this distance — they take `railProfile`, so their outer edges (the box's lines) stay square

  // ── 3. the carving: the photo's light, normalised within the gold (2nd–98th percentile), lightly smoothed
  const vals: number[] = [];
  for (let k = 0; k < lum.length; k += 7) if (mask[k]) vals.push(lum[k]);
  vals.sort((x, y) => x - y);
  const lo = vals[Math.floor(vals.length * 0.02)], hi = vals[Math.floor(vals.length * 0.98)];
  const lumN = blur(lum.map((v) => Math.min(1, Math.max(0, (v - lo) / Math.max(1, hi - lo)))), A, Bn, 1);

  // ── the height field, photo px units (scaled to layout px at the end)
  const Hcap = 1; // relative; `heightPx` scales it at the end
  const h = new Float32Array(A * Bn);
  for (let b = 0; b < Bn; b++) for (let a = 0; a < A; a++) {
    const k = b * A + a;
    if (!mask[k]) continue;
    if (inRail(a, b)) { h[k] = railProfile(a, b, RW, p.railHeight * Hcap, A, Bn); continue; }
    const t = Math.min(1, dist[k] / p.edgeRoundImg);
    const inflate = Math.sqrt(1 - (1 - t) * (1 - t));
    h[k] = Hcap * inflate * (1 - p.carve + p.carve * lumN[k]);
  }
  const hs = blur(h, A, Bn, 1);
  // keep the moulding crisp: the rails are not blurred
  for (let b = 0; b < Bn; b++) for (let a = 0; a < A; a++) if (inRail(a, b)) hs[b * A + a] = h[b * A + a];

  // ── the reach, and the scale that sets it
  let reachImg = 0;
  for (let b = 0; b < Bn; b++) for (let a = 0; a < A; a++) if (mask[b * A + a]) reachImg = Math.max(reachImg, Math.min(a, b));
  const scale = p.reachPx / reachImg; // layout px per photo px
  const zScale = p.heightPx; // Hcap = 1 → the tallest relief in layout px

  // ── into the corner's frame: (u, v) — u along the top, v down the side
  const along = p.orient === "along";
  const Nu = along ? Bn : A, Nv = along ? A : Bn;
  const H = (u: number, v: number) => (along ? hs[u * A + v] : hs[v * A + u]); // along: u = b, v = a
  const M = (u: number, v: number) => (along ? mask[u * A + v] : mask[v * A + u]);

  // ── the object-space normal map, full resolution (the slope in photo px, the height in photo px)
  const zImg = zScale / scale; // the relief's height in photo px
  const nm = new Uint8Array(Nu * Nv * 4);
  for (let v = 0; v < Nv; v++) for (let u = 0; u < Nu; u++) {
    const hu = (H(Math.min(Nu - 1, u + 1), v) - H(Math.max(0, u - 1), v)) * 0.5 * zImg;
    const hv = (H(u, Math.min(Nv - 1, v + 1)) - H(u, Math.max(0, v - 1))) * 0.5 * zImg;
    // x = u, y = −v: dh/dx = hu, dh/dy = −hv → n ∝ (−hu, hv, 1)
    const l = Math.hypot(hu, hv, 1);
    const i = (v * Nu + u) * 4;
    nm[i] = ((-hu / l) * 0.5 + 0.5) * 255;
    nm[i + 1] = ((hv / l) * 0.5 + 0.5) * 255;
    nm[i + 2] = ((1 / l) * 0.5 + 0.5) * 255;
    nm[i + 3] = 255;
  }
  const normalMap = new THREE.DataTexture(nm, Nu, Nv, THREE.RGBAFormat);
  normalMap.colorSpace = THREE.NoColorSpace;
  normalMap.minFilter = THREE.LinearMipmapLinearFilter;
  normalMap.magFilter = THREE.LinearFilter;
  normalMap.generateMipmaps = true;
  normalMap.needsUpdate = true;

  // ── the silhouette at FULL resolution: the mesh's cells are coarse and its edge would step; the material cuts the
  // outline from this mask instead (`alphaMap` reads GREEN, with `alphaTest` 0.5). Lightly smoothed, so the cut follows
  // the photo's edge between pixels rather than along them.
  const maskF = new Float32Array(Nu * Nv);
  for (let v = 0; v < Nv; v++) for (let u = 0; u < Nu; u++) maskF[v * Nu + u] = M(u, v);
  const maskS = blur(maskF, Nu, Nv, 1);
  const am = new Uint8Array(Nu * Nv * 4);
  for (let k = 0; k < maskS.length; k++) { const c = Math.round(maskS[k] * 255); am[k * 4] = c; am[k * 4 + 1] = c; am[k * 4 + 2] = c; am[k * 4 + 3] = 255; }
  const alphaMap = new THREE.DataTexture(am, Nu, Nv, THREE.RGBAFormat);
  alphaMap.colorSpace = THREE.NoColorSpace;
  alphaMap.magFilter = THREE.LinearFilter;
  alphaMap.minFilter = THREE.LinearFilter;
  alphaMap.needsUpdate = true;

  // ── the mesh: half resolution, only cells touching the gold; outside vertices sit on the page (h = 0)
  const step = 2;
  const gu = Math.ceil((Nu - 1) / step) + 1, gv = Math.ceil((Nv - 1) / step) + 1;
  const vid = new Int32Array(gu * gv).fill(-1);
  const pos: number[] = [], uv: number[] = [], idx: number[] = [];
  const vert = (iu: number, iv: number) => {
    const k = iv * gu + iu;
    if (vid[k] >= 0) return vid[k];
    const u = Math.min(Nu - 1, iu * step), v = Math.min(Nv - 1, iv * step);
    vid[k] = pos.length / 3;
    pos.push(u * scale, -v * scale, M(u, v) ? H(u, v) * zScale : 0);
    uv.push(u / (Nu - 1), v / (Nv - 1));
    return vid[k];
  };
  for (let iv = 0; iv < gv - 1; iv++) for (let iu = 0; iu < gu - 1; iu++) {
    const u0 = Math.min(Nu - 1, iu * step), u1 = Math.min(Nu - 1, (iu + 1) * step);
    const v0 = Math.min(Nv - 1, iv * step), v1 = Math.min(Nv - 1, (iv + 1) * step);
    if (!(M(u0, v0) || M(u1, v0) || M(u0, v1) || M(u1, v1))) continue;
    const a = vert(iu, iv), b = vert(iu + 1, iv), c = vert(iu, iv + 1), d = vert(iu + 1, iv + 1);
    // CCW seen from +z (x = u right, y = −v up the screen)
    idx.push(a, c, b, b, c, d);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  geometry.setIndex(idx);
  geometry.computeVertexNormals();

  let eu = 0, ev = 0, hz = 0;
  for (let i = 0; i < pos.length; i += 3) { eu = Math.max(eu, pos[i]); ev = Math.max(ev, -pos[i + 1]); hz = Math.max(hz, pos[i + 2]); }
  return {
    geometry, normalMap, alphaMap,
    stats: {
      vertices: pos.length / 3, triangles: idx.length / 3,
      diagonalReach: reachImg * scale, extentU: eu, extentV: ev, height: hz, scale,
      withinLimit: reachImg * scale <= CORNER_LIMIT_PX,
    },
  };
}

/**
 * ⛔ THE MOULDING, drawn clean. Across its width (t = 0 at the box's line, 1 at its inner edge; the two rails meet on a
 * MITRE — the distance to the nearer outer edge): a square back, a broad flat face, a step down, a bead, a chamfer into
 * the carving. Each rail's far end is chamfered off.
 */
function railProfile(a: number, b: number, RW: number, H: number, A: number, Bn: number): number {
  const t = Math.min(a, b) / RW; // the mitre: whichever outer edge is nearer
  let h: number;
  if (t < 0.06) h = H * (0.75 + (0.25 * t) / 0.06); // the back's arris, softened a touch
  else if (t < 0.5) h = H; // the flat face
  else if (t < 0.58) h = H * (1 - (0.25 * (t - 0.5)) / 0.08); // the step down
  else if (t < 0.84) { const x = (t - 0.71) / 0.13; h = H * (0.75 + 0.2 * Math.sqrt(Math.max(0, 1 - x * x))); } // the bead
  else h = H * (0.75 - (0.35 * (t - 0.84)) / 0.16); // the chamfer into the carving
  // the far ends: the long rail's (a < RW) at b = Bn − 1, the short rail's (b < RW) at a = A − 1
  const endL = a < RW ? Bn - 1 - b : Infinity, endS = b < RW ? A - 1 - a : Infinity;
  const e = Math.min(endL, endS);
  if (e < 4) h *= 0.55 + (0.45 * e) / 4;
  return h;
}

/** a separable box blur of radius r, run twice (≈ a gaussian) */
function blur(src: Float32Array, W: number, H: number, r: number): Float32Array {
  const a = Float32Array.from(src), b = new Float32Array(src.length);
  for (let pass = 0; pass < 2; pass++) {
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      let s = 0, n = 0;
      for (let k = -r; k <= r; k++) { const xx = x + k; if (xx >= 0 && xx < W) { s += a[y * W + xx]; n++; } }
      b[y * W + x] = s / n;
    }
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      let s = 0, n = 0;
      for (let k = -r; k <= r; k++) { const yy = y + k; if (yy >= 0 && yy < H) { s += b[yy * W + x]; n++; } }
      a[y * W + x] = s / n;
    }
  }
  return a;
}
