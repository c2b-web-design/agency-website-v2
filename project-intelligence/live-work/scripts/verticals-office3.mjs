// Precise vertical-edge fits on the master, seeded from zoomed gridded crops. Master frame 4000x2250.
// Sub-pixel: parabolic peak of |dI/dx| at each row; a narrow band around the seed line; robust fit.
import sharp from "file:///C:/Users/Carl%20Buckley/agency-website-v2/node_modules/sharp/lib/index.js";
const SRC = "C:/Users/Carl Buckley/agency-website-v2/brand-assets/office-image-3.jpg";
const { data, info } = await sharp(SRC).greyscale().blur(1.0).raw().toBuffer({ resolveWithObject: true });
const W = info.width;
const L = (x, y) => data[y * W + x];
const F = +process.argv[2] || 2013.7, PITCH = (+process.argv[3] || -3.22) * Math.PI / 180, cx = 2000, cy = 1125;
const vvY = cy + F / Math.tan(PITCH);
function edge(name, y0, y1, xa, xb, band, sign) { // sign: +1 brighter to the right, -1 darker to the right, 0 either
  const pts = [];
  for (let y = y0; y <= y1; y += 2) {
    const xc = xa + (xb - xa) * (y - y0) / (y1 - y0);
    let best = -1, bx = 0;
    for (let x = Math.round(xc - band); x <= Math.round(xc + band); x++) { let g = L(x + 1, y) - L(x - 1, y); g = sign === 0 ? Math.abs(g) : g * sign; if (g > best) { best = g; bx = x; } }
    const gm = (L(bx, y) - L(bx - 2, y)) * (sign || 1), g0 = best, gp = (L(bx + 2, y) - L(bx, y)) * (sign || 1);
    const den = gm - 2 * g0 + gp; const off = den !== 0 ? 0.5 * (gm - gp) / den : 0;
    if (best > 6) pts.push([bx + Math.max(-0.5, Math.min(0.5, off)), y]);
  }
  let P = pts;
  let r;
  for (let it = 0; it < 8; it++) {
    const n = P.length, my = P.reduce((s, p) => s + p[1], 0) / n, mx = P.reduce((s, p) => s + p[0], 0) / n;
    const a = P.reduce((s, p) => s + (p[1] - my) * (p[0] - mx), 0) / P.reduce((s, p) => s + (p[1] - my) ** 2, 0), b = mx - a * my;
    const res = P.map((p) => Math.abs(p[0] - (a * p[1] + b))); const rms = Math.sqrt(res.reduce((s, v) => s + v * v, 0) / n);
    r = { a, b, rms, n, lo: Math.min(...P.map((p) => p[1])), hi: Math.max(...P.map((p) => p[1])) };
    const keep = res.map((v) => v < Math.max(0.8, 2 * rms)); if (keep.every(Boolean) || keep.filter(Boolean).length < 10) break; P = P.filter((_, i) => keep[i]);
  }
  const ym = (r.lo + r.hi) / 2, xm = r.a * ym + r.b, pred = (xm - cx) / (ym - vvY);
  console.log(`${name.padEnd(22)} x≈${xm.toFixed(0).padStart(4)}  lean ${r.a.toFixed(5).padStart(9)}  pred ${pred.toFixed(5).padStart(9)}  Δ ${((r.a - pred) * (r.hi - r.lo)).toFixed(1).padStart(6)} px over ${(r.hi - r.lo).toFixed(0)}  rms ${r.rms.toFixed(2)} n ${r.n}/${pts.length}`);
  return { ...r, xm, ym };
}
console.log(`prediction: f ${F}, pitch ${(PITCH * 180 / Math.PI).toFixed(2)}°, vertical VP (2000, ${vvY.toFixed(0)})`);
const out = [
  edge("bookcase side, wall edge", 470, 1530, 528, 522, 7, 0),
  edge("bookcase side, front", 470, 1530, 462, 458, 7, 0),
  edge("TV left, outer", 760, 1260, 590, 596, 8, 0),
  edge("TV right, outer", 800, 1240, 1582, 1568, 8, 0),
  edge("end panel L, outer", 1710, 2200, 3207, 3224, 6, 0),
  edge("end panel R", 1700, 2200, 3738, 3760, 8, 0),
];
// vertical VP from the fitted set
let A = 0, B = 0, C = 0, D = 0, E = 0; const good = out.filter((v) => v.rms < 1.0);
for (const v of good) { const n = Math.hypot(v.a, 1), nx = 1 / n, ny = -v.a / n, c = v.b / n; A += nx * nx; B += nx * ny; C += ny * ny; D += nx * c; E += ny * c; }
const det = A * C - B * B; console.log(`measured vertical VP from ${good.length} fits (rms<1): (${((D * C - B * E) / det).toFixed(0)}, ${((A * E - B * D) / det).toFixed(0)})`);
