// Many rigid verticals across the width, at the TOP (cabinet door gaps) and BOTTOM (credenza drawer edges).
// Master frame 4000x2250. Reports lean and, for each group, lean vs x — which a pinhole camera makes LINEAR:
//   lean(x) = (x - Xv) / (y - Yv)  ~  (x - Xv) * k   at a common height.
import sharp from "file:///C:/Users/Carl%20Buckley/agency-website-v2/node_modules/sharp/lib/index.js";
const SRC = "C:/Users/Carl Buckley/agency-website-v2/brand-assets/office-image-3.jpg";
const { data, info } = await sharp(SRC).greyscale().blur(1.0).raw().toBuffer({ resolveWithObject: true });
const W = info.width; const L = (x, y) => data[y * W + x];
function track(y0, y1, x0, band, mode) { // mode "edge" | "valley" ; follows the line row by row from its seed
  let x = x0; const pts = [];
  for (let y = y0; y <= y1; y += 2) {
    let best = -Infinity, bx = Math.round(x);
    for (let s = Math.round(x - band); s <= Math.round(x + band); s++) {
      const v = mode === "valley" ? -(L(s - 1, y) + 2 * L(s, y) + L(s + 1, y)) : Math.abs(L(s + 1, y) - L(s - 1, y));
      if (v > best) { best = v; bx = s; }
    }
    pts.push([bx, y]); x = 0.7 * x + 0.3 * bx; // slow follow
  }
  let P = pts, r;
  for (let it = 0; it < 8; it++) {
    const n = P.length, my = P.reduce((s, p) => s + p[1], 0) / n, mx = P.reduce((s, p) => s + p[0], 0) / n;
    const a = P.reduce((s, p) => s + (p[1] - my) * (p[0] - mx), 0) / P.reduce((s, p) => s + (p[1] - my) ** 2, 0), b = mx - a * my;
    const res = P.map((p) => Math.abs(p[0] - (a * p[1] + b))); const rms = Math.sqrt(res.reduce((s, v) => s + v * v, 0) / n);
    r = { a, b, rms, n, N: pts.length, lo: Math.min(...P.map((p) => p[1])), hi: Math.max(...P.map((p) => p[1])) };
    const keep = res.map((v) => v < Math.max(1.0, 2 * rms)); if (keep.every(Boolean) || keep.filter(Boolean).length < 12) break; P = P.filter((_, i) => keep[i]);
  }
  r.xm = r.a * ((r.lo + r.hi) / 2) + r.b; r.ym = (r.lo + r.hi) / 2; return r;
}
const groups = {
  "TOP: cabinet door gaps": [[60, 300, 195, "valley"], [110, 360, 598, "valley"], [150, 400, 985, "valley"], [180, 430, 1318, "valley"], [210, 460, 1625, "valley"], [230, 480, 1900, "valley"], [250, 500, 2150, "valley"], [270, 520, 2395, "valley"]],
  "BOTTOM: credenza drawer/cubby edges": [[1610, 1950, 295, "edge"], [1610, 1950, 832, "edge"], [1580, 1820, 1330, "edge"], [1580, 1820, 1742, "edge"]],
};
for (const [g, list] of Object.entries(groups)) {
  console.log(g);
  const rows = [];
  for (const [y0, y1, x0, mode] of list) {
    const r = track(y0, y1, x0, 6, mode);
    rows.push(r);
    console.log(`  seed x ${String(x0).padStart(4)}  x≈${r.xm.toFixed(1).padStart(7)} y≈${r.ym.toFixed(0)}  lean ${r.a.toFixed(5).padStart(9)}  rms ${r.rms.toFixed(2)}  kept ${r.n}/${r.N}  run ${(r.hi - r.lo).toFixed(0)}`);
  }
  const ok = rows.filter((r) => r.rms < 1.2 && r.n > 0.6 * r.N);
  if (ok.length >= 2) {
    const n = ok.length, mx = ok.reduce((s, r) => s + r.xm, 0) / n, ma = ok.reduce((s, r) => s + r.a, 0) / n;
    const k = ok.reduce((s, r) => s + (r.xm - mx) * (r.a - ma), 0) / ok.reduce((s, r) => s + (r.xm - mx) ** 2, 0), c = ma - k * mx;
    const res = ok.map((r) => r.a - (k * r.xm + c)); const rms = Math.sqrt(res.reduce((s, v) => s + v * v, 0) / n);
    console.log(`  → lean = ${k.toExponential(3)}·x + ${c.toFixed(5)}  over ${n} good lines; zero-lean column x = ${(-c / k).toFixed(0)}; 1/k = ${(1 / k).toFixed(0)} px (≈ y − Yv); residual rms ${rms.toFixed(5)}`);
    console.log(`    residuals: ${res.map((v, i) => `${ok[i].xm.toFixed(0)}:${(v * 1000).toFixed(2)}e-3`).join("  ")}`);
  }
}
