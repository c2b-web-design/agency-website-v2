// Input: a half-size copy of brand-assets/office-image-3-edited.png (3632x2048 -> 1816x1024, lanczos3) written to the session scratchpad; recreate it before re-running.
// Map the square GPT edit back onto the master: per-axis linear fit from patch matching.
import sharp from "file:///C:/Users/Carl%20Buckley/agency-website-v2/node_modules/sharp/lib/index.js";
const M = "C:/Users/Carl Buckley/agency-website-v2/brand-assets/office-image-3.jpg";
const E = "C:/Users/Carl Buckley/AppData/Local/Temp/claude/c--Users-Carl-Buckley-agency-website-v2/92ee830b-ab55-4531-8f34-9f40aaae896f/scratchpad/edit4-half.png";
const AX = +process.argv[2] || 0.325, AY = +process.argv[3] || 0.5;   // master px -> edit px, first guess
const e = await sharp(E).greyscale().raw().toBuffer({ resolveWithObject: true });
const EW = e.info.width, EH = e.info.height;
const MW = Math.round(4000 * AX), MH = Math.round(2250 * AY);
const m = await sharp(M).resize(MW, MH, { fit: "fill", kernel: "lanczos3" }).greyscale().raw().toBuffer({ resolveWithObject: true });
const Ep = (x, y) => e.data[y * EW + x], Mp = (x, y) => (x < 0 || y < 0 || x >= MW || y >= MH) ? -999 : m.data[y * MW + x];
const P = 24, R = 30, res = [];
for (let y0 = 4; y0 + P < Math.min(EH, MH + 40); y0 += 16) for (let x0 = 4; x0 + P < EW - 4; x0 += 16) {
  let mean = 0; for (let y = 0; y < P; y++) for (let x = 0; x < P; x++) mean += Ep(x0 + x, y0 + y); mean /= P * P;
  let v = 0; for (let y = 0; y < P; y++) for (let x = 0; x < P; x++) v += (Ep(x0 + x, y0 + y) - mean) ** 2; v = Math.sqrt(v / (P * P));
  if (v < 12) continue;
  let best = 1e18, bdx = 0, bdy = 0;
  for (let dy = -R; dy <= R; dy++) for (let dx = -R; dx <= R; dx++) {
    let s = 0; for (let y = 0; y < P; y += 2) for (let x = 0; x < P; x += 2) { const q = Mp(x0 + x + dx, y0 + y + dy); if (q < 0) { s = 1e18; break; } const d = Ep(x0 + x, y0 + y) - q; s += d * d; }
    if (s < best) { best = s; bdx = dx; bdy = dy; }
  }
  const rms = Math.sqrt(best / ((P / 2) ** 2));
  if (rms < 0.35 * v + 6) res.push({ x: x0 + P / 2, y: y0 + P / 2, dx: bdx, dy: bdy });
}
function fit1(pts) { let P2 = pts; for (let it = 0; it < 8; it++) { const n = P2.length, mx = P2.reduce((a, p) => a + p[0], 0) / n, my = P2.reduce((a, p) => a + p[1], 0) / n; const a = P2.reduce((s, p) => s + (p[0] - mx) * (p[1] - my), 0) / P2.reduce((s, p) => s + (p[0] - mx) ** 2, 0), b = my - a * mx; const r = P2.map(p => Math.abs(p[1] - (a * p[0] + b))); const rms = Math.sqrt(r.reduce((s, v) => s + v * v, 0) / n); if (it === 7) return { a, b, rms, n }; const cut = [...r].sort((u, v) => u - v)[Math.floor(n * 0.85)]; P2 = P2.filter((_, i) => r[i] <= cut); } }
// edit x -> resized-master x, then to master px
const fx = fit1(res.map(r => [r.x, r.x + r.dx])), fy = fit1(res.map(r => [r.y, r.y + r.dy]));
const kx = fx.a / AX, ky = fy.a / AY; // master px per edit px
console.log(`matched ${res.length}`);
console.log(`x: master = ${kx.toFixed(4)}*xe + ${(fx.b / AX).toFixed(1)}   rms ${fx.rms.toFixed(2)} edit px (n ${fx.n})`);
console.log(`y: master = ${ky.toFixed(4)}*ye + ${(fy.b / AY).toFixed(1)}   rms ${fy.rms.toFixed(2)} edit px (n ${fy.n})`);
console.log(`edit px per master px: x ${(1 / kx).toFixed(4)}, y ${(1 / ky).toFixed(4)};  anisotropy x/y = ${(ky / kx).toFixed(4)}`);
const mx0 = fx.b / AX, mx1 = kx * EW + mx0, my0 = fy.b / AY, my1 = ky * EH + my0;
console.log(`edit frame covers master x ${mx0.toFixed(0)}..${mx1.toFixed(0)} (of 4000), y ${my0.toFixed(0)}..${my1.toFixed(0)} (of 2250)`);
console.log(`master's bottom edge (y=2250) lands at edit row ${((2250 - my0) / ky).toFixed(0)} of ${EH}`);
