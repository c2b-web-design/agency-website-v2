// Register GPT's edited plate against the master by patch matching; report the fitted mapping and drift.
import sharp from "file:///C:/Users/Carl%20Buckley/agency-website-v2/node_modules/sharp/lib/index.js";
const M = "C:/Users/Carl Buckley/agency-website-v2/brand-assets/office-image-3.jpg";
const E = "C:/Users/Carl Buckley/agency-website-v2/brand-assets/office-image-edited.png";
const e = await sharp(E).greyscale().raw().toBuffer({ resolveWithObject: true });
const EW = e.info.width, EH = e.info.height;
// master scaled so its WIDTH matches (1376 x 774)
const MW = EW, MH = Math.round(2250 * EW / 4000);
const m = await sharp(M).resize(MW, MH, { kernel: "lanczos3" }).greyscale().raw().toBuffer({ resolveWithObject: true });
const Ep = (x, y) => e.data[y * EW + x], Mp = (x, y) => m.data[y * MW + x];
const P = 24, R = 18, res = [];
for (let y0 = R + 2; y0 + P + R + 2 < EH; y0 += 16) for (let x0 = R + 2; x0 + P + R + 2 < EW; x0 += 16) {
  let mean = 0; for (let y = 0; y < P; y++) for (let x = 0; x < P; x++) mean += Ep(x0 + x, y0 + y); mean /= P * P;
  let v = 0; for (let y = 0; y < P; y++) for (let x = 0; x < P; x++) v += (Ep(x0 + x, y0 + y) - mean) ** 2; v = Math.sqrt(v / (P * P));
  if (v < 12) continue; // needs texture
  let best = 1e18, bdx = 0, bdy = 0, second = 1e18;
  for (let dy = -R; dy <= R; dy++) for (let dx = -R; dx <= R; dx++) {
    let s = 0; for (let y = 0; y < P; y += 2) for (let x = 0; x < P; x += 2) { const d = Ep(x0 + x, y0 + y) - Mp(x0 + x + dx, y0 + y + dy); s += d * d; }
    if (s < best) { second = best; best = s; bdx = dx; bdy = dy; } else if (s < second) second = s;
  }
  const rms = Math.sqrt(best / ((P / 2) ** 2));
  res.push({ x: x0 + P / 2, y: y0 + P / 2, dx: bdx, dy: bdy, rms, v });
}
const good = res.filter(r => r.rms < 0.35 * r.v + 6);
console.log(`patches textured ${res.length}, well-matched ${good.length}`);
// fit master = sx*x + tx, master_y = sy*y + ty  (independent axes), robust
function fit1(pts) { let P2 = pts; for (let it = 0; it < 6; it++) { const n = P2.length, mx = P2.reduce((a, p) => a + p[0], 0) / n, my = P2.reduce((a, p) => a + p[1], 0) / n; const a = P2.reduce((s, p) => s + (p[0] - mx) * (p[1] - my), 0) / P2.reduce((s, p) => s + (p[0] - mx) ** 2, 0), b = my - a * mx; const r = P2.map(p => Math.abs(p[1] - (a * p[0] + b))); const rms = Math.sqrt(r.reduce((s, v) => s + v * v, 0) / n); if (it === 5) return { a, b, rms, n }; const cut = [...r].sort((u, v) => u - v)[Math.floor(n * 0.85)]; P2 = P2.filter((_, i) => r[i] <= cut); } }
const fx = fit1(good.map(r => [r.x, r.x + r.dx])), fy = fit1(good.map(r => [r.y, r.y + r.dy]));
console.log(`x: master = ${fx.a.toFixed(5)}*x + ${fx.b.toFixed(2)}   rms ${fx.rms.toFixed(2)}px (n ${fx.n})`);
console.log(`y: master = ${fy.a.toFixed(5)}*y + ${fy.b.toFixed(2)}   rms ${fy.rms.toFixed(2)}px (n ${fy.n})`);
console.log(`edited frame spans master rows ${(fy.b).toFixed(1)} .. ${(fy.a * EH + fy.b).toFixed(1)} of ${MH}; cols ${fx.b.toFixed(1)} .. ${(fx.a * EW + fx.b).toFixed(1)} of ${MW}`);
// residual by region (3x3 grid) after the fit
const grid = {};
for (const r of good) { const ex = r.x + r.dx - (fx.a * r.x + fx.b), ey = r.y + r.dy - (fy.a * r.y + fy.b); const k = `${Math.min(2, Math.floor(3 * r.x / EW))},${Math.min(2, Math.floor(3 * r.y / EH))}`; (grid[k] ??= []).push(Math.hypot(ex, ey)); }
console.log("residual |px| median by region (col,row), edited px:");
for (let gy = 0; gy < 3; gy++) console.log("  " + [0, 1, 2].map(gx => { const a = (grid[`${gx},${gy}`] ?? []).sort((u, v) => u - v); return a.length ? `${a[Math.floor(a.length / 2)].toFixed(2)} (n${a.length})`.padEnd(14) : "—".padEnd(14); }).join(""));
// per band of rows: the modal (dx,dy) among well-matched patches
console.log("\nper 64-row band: modal offset (dx,dy) and its share, edited px");
for (let b = 0; b < EH; b += 64) {
  const rs = good.filter(r => r.y >= b && r.y < b + 64); if (!rs.length) { console.log(`  y ${b}-${b + 63}: —`); continue; }
  const c = {}; for (const r of rs) { const k = `${r.dx},${r.dy}`; c[k] = (c[k] ?? 0) + 1; }
  const top = Object.entries(c).sort((a, b2) => b2[1] - a[1]).slice(0, 3).map(([k, n]) => `(${k})×${n}`).join("  ");
  console.log(`  y ${String(b).padStart(3)}-${String(b + 63).padStart(3)}  n${String(rs.length).padStart(3)}  ${top}`);
}
