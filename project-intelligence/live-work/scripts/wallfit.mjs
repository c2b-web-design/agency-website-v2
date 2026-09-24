import sharp from "file:///C:/Users/Carl%20Buckley/agency-website-v2/node_modules/sharp/lib/index.js";
const SRC = "C:/Users/Carl Buckley/agency-website-v2/brand-assets/office-image-3.jpg";
const { data, info } = await sharp(SRC).greyscale().blur(1.2).raw().toBuffer({ resolveWithObject: true });
const W = info.width, H = info.height;
const L = (x, y) => data[Math.round(y) * W + Math.round(x)];
// robust line fit: repeatedly drop worst 10% until rms stable
function fit(pts, vertical = false) {
  let P = pts.map(([x, y]) => (vertical ? [y, x] : [x, y]));
  for (let it = 0; it < 6; it++) {
    const n = P.length, mx = P.reduce((a, p) => a + p[0], 0) / n, my = P.reduce((a, p) => a + p[1], 0) / n;
    const a = P.reduce((s, p) => s + (p[0] - mx) * (p[1] - my), 0) / P.reduce((s, p) => s + (p[0] - mx) ** 2, 0), b = my - a * mx;
    const r = P.map((p) => Math.abs(p[1] - (a * p[0] + b)));
    const rms = Math.sqrt(r.reduce((s, v) => s + v * v, 0) / n);
    if (it === 5) return { a, b, rms, n, vertical, max: Math.max(...r) };
    const cut = [...r].sort((u, v) => u - v)[Math.floor(n * 0.9)];
    P = P.filter((_, i) => r[i] <= cut);
  }
}
// edge (max |gradient|) along columns, y in [y0-w, y0+w], y0 interpolated between ends
function hEdge(x0, x1, ya, yb, w, step = 4) { const pts = []; for (let x = x0; x <= x1; x += step) { const yc = ya + (yb - ya) * (x - x0) / (x1 - x0); let best = -1, by = 0; for (let y = yc - w; y <= yc + w; y++) { const g = Math.abs(L(x, y + 1) - L(x, y - 1)); if (g > best) { best = g; by = y; } } pts.push([x, by]); } return fit(pts); }
// brightness peak along columns (glowing strips)
function hPeak(x0, x1, ya, yb, w, step = 4) { const pts = []; for (let x = x0; x <= x1; x += step) { const yc = ya + (yb - ya) * (x - x0) / (x1 - x0); let best = -1, by = 0; for (let y = yc - w; y <= yc + w; y++) { if (L(x, y) > best) { best = L(x, y); by = y; } } pts.push([x, by]); } return fit(pts); }
function vEdge(xa, xb, y0, y1, w, step = 4) { const pts = []; for (let y = y0; y <= y1; y += step) { const xc = xa + (xb - xa) * (y - y0) / (y1 - y0); let best = -1, bx = 0; for (let x = xc - w; x <= xc + w; x++) { const g = Math.abs(L(x + 1, y) - L(x - 1, y)); if (g > best) { best = g; bx = x; } } pts.push([bx, y]); } return fit(pts, true); }
const at = (f, x) => f.a * x + f.b;            // horizontal fit: y at x
const xAt = (f, y) => f.a * y + f.b;           // vertical fit: x at y
const lines = {
  tvTop: hEdge(640, 1540, 707, 765, 22),
  tvBot: hEdge(640, 1540, 1270, 1265, 22),
  led: hPeak(700, 2560, 510, 700, 30),
  shelfTop: hEdge(1830, 2560, 843, 858, 16),
  shelfStrip: hPeak(1830, 2560, 1052, 1068, 16),
};
const verts = {
  tvL: vEdge(592, 592, 780, 1240, 20),
  tvR: vEdge(1582, 1582, 800, 1240, 20),
  corner: vEdge(2596, 2596, 720, 830, 24),
};
for (const [k, f] of Object.entries({ ...lines, ...verts })) console.log(k.padEnd(10), f.vertical ? `x = ${f.a.toFixed(5)}·y + ${f.b.toFixed(1)}` : `y = ${f.a.toFixed(5)}·x + ${f.b.toFixed(1)}`, `rms ${f.rms.toFixed(2)}px max ${f.max.toFixed(1)} n ${f.n}`);
// vanishing point: least-squares intersection of the horizontal wall lines
function vp(keys) { let A = 0, B = 0, C = 0, D = 0, E = 0; for (const k of keys) { const f = lines[k]; const n = Math.hypot(f.a, 1); const nx = -f.a / n, ny = 1 / n, c = f.b / n; A += nx * nx; B += nx * ny; C += ny * ny; D += nx * c; E += ny * c; } const det = A * C - B * B; return [(D * C - B * E) / det, (A * E - B * D) / det]; }
const along = (VPx, lineKey) => { const f = lines[lineKey]; const X = (vk) => { const v = verts[vk]; let x = xAt(v, 1200); for (let i = 0; i < 5; i++) x = xAt(v, at(f, x)); return x; }; const xl = X("tvL"), xr = X("tvR"), xc = X("corner"); const u = (x) => (x - xl) / (VPx - x); const k = 1 / u(xr); return { xl, xr, xc, cornerInTvWidths: k * u(xc), spaceRightInTvWidths: k * u(xc) - 1 }; };
for (const keys of [["tvTop", "tvBot"], ["tvTop", "tvBot", "led"], ["tvTop", "tvBot", "led", "shelfTop", "shelfStrip"], ["led", "shelfStrip"], ["led", "tvBot"]]) {
  const v = vp(keys); const r = along(v[0], "tvBot");
  console.log(`VP from ${keys.join("+").padEnd(34)} = (${v[0].toFixed(0)}, ${v[1].toFixed(0)})  → space right of TV = ${r.spaceRightInTvWidths.toFixed(3)} TV widths  [xl ${r.xl.toFixed(0)} xr ${r.xr.toFixed(0)} corner ${r.xc.toFixed(0)}]`);
}
