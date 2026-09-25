// Cupboard door gaps along the back-wall cabinet run, and each door's width on the cabinet-front plane.
// Master frame 4000x2250. The band runs from the cabinet top (y 205.5 at x 1450) to the door bottoms (474);
// sample a brightness profile along the line through VB at mid-band, find valleys, then fit each gap as a
// vertical through the vertical VP (1-D offset search, like the other constrained fits).
import sharp from "file:///C:/Users/Carl%20Buckley/agency-website-v2/node_modules/sharp/lib/index.js";
const { data, info } = await sharp("C:/Users/Carl Buckley/agency-website-v2/brand-assets/office-image-3.jpg").greyscale().blur(1.0).raw().toBuffer({ resolveWithObject: true });
const W = info.width; const L = (x, y) => data[Math.round(y) * W + Math.round(x)];
const f = 2013.7, cx = 2000, cy = 1125, VB = [8065, 1240.6], VR = [1329.3, 1236.0], VV = [cx, cy - f / Math.tan(3.22 * Math.PI / 180)];
const hl = (x, y) => (xx) => VB[1] + (y - VB[1]) / (x - VB[0]) * (xx - VB[0]);
const mid = hl(1450, 340), top = hl(1450, 225), bot = hl(1450, 460);
// profile along mid-band, averaged over the band's middle half
const prof = [];
for (let x = 20; x < 2560; x++) { let s = 0, n = 0; for (let t = 0.25; t <= 0.75; t += 0.05) { const y = top(x) + t * (bot(x) - top(x)); s += L(x, y); n++; } prof.push([x, s / n]); }
// valleys: local minima 6+ below the mean of ±25 px
const val = [];
for (let i = 25; i < prof.length - 25; i++) { const v = prof[i][1]; let m = 0; for (let k = -25; k <= 25; k++) m += prof[i + k][1]; m /= 51; let isMin = true; for (let k = -6; k <= 6; k++) if (prof[i + k][1] < v) isMin = false; if (isMin && m - v > 5) val.push([prof[i][0], +(m - v).toFixed(1)]); }
console.log("valleys along mid-band (x, depth):", val.map((v) => v.join(":")).join("  "));
// refine: vertical through VV, offset searched to minimise summed brightness along the band
function refine(x0) {
  let best = Infinity, bx = x0;
  for (let x = x0 - 6; x <= x0 + 6; x += 0.25) { const k = (x - VV[0]) / (340 - VV[1]); let s = 0; for (let y = top(x) + 8; y <= bot(x) - 8; y += 2) s += L(VV[0] + k * (y - VV[1]), y); if (s < best) { best = s; bx = x; } }
  return bx; // x at y = 340
}
const gaps = val.map(([x]) => refine(x));
// on the cabinet-front plane (401 mm in front of the back wall), at mid-band height
const sub = (a, b) => a.map((v, i) => v - b[i]), add = (a, b) => a.map((v, i) => v + b[i]), mul = (a, s) => a.map((v) => v * s);
const dot = (a, b) => a.reduce((s, v, i) => s + v * b[i], 0), unit = (a) => mul(a, 1 / Math.sqrt(dot(a, a)));
const ray = (p) => [p[0] - cx, p[1] - cy, f];
const dB = unit(ray(VB)), dR = unit(ray(VR)); const Cc = unit(ray([2601.0, 1238.3]));
const MM = 3980; // mm per unit (desk 750 mm, card-layout-office3.mjs)
const front = add(Cc, mul(dR, -401 / MM));
const onFront = (p) => mul(ray(p), dot(front, dR) / dot(ray(p), dR));
const u = gaps.map((x) => dot(sub(onFront([x, mid(x)]), Cc), dB) * MM);
console.log("gaps (x at mid-band → u mm on the cabinet front):");
gaps.forEach((x, i) => console.log(`  x ${x.toFixed(2).padStart(8)}  u ${u[i].toFixed(0).padStart(6)}${i ? `   door ${(u[i] - u[i - 1]).toFixed(0)} mm` : ""}`));
