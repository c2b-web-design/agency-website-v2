// Camera solve for the new room — on the MASTER brand-assets/office-image-3.jpg (4000 x 2250).
// Every pixel coordinate here is in THAT frame. Transfer to the plate
// (office-image-3-edited.png, 3632 x 2048) is at the end, by the measured mapping in D-095.
//
// Method (perspective-from-photograph skill): fit lines to real pixels, two horizontal
// vanishing points on one horizon, f from their perpendicularity, pitch from the horizon,
// then FALSIFY with verticals and with lines never fed into the solve.
import sharp from "file:///C:/Users/Carl%20Buckley/agency-website-v2/node_modules/sharp/lib/index.js";
const SRC = "C:/Users/Carl Buckley/agency-website-v2/brand-assets/office-image-3.jpg";
const OUT = process.argv[2]; // optional overlay path
const { data, info } = await sharp(SRC).greyscale().blur(1.2).raw().toBuffer({ resolveWithObject: true });
const W = info.width, H = info.height, cx = W / 2, cy = H / 2;
const L = (x, y) => data[Math.min(H - 1, Math.max(0, Math.round(y))) * W + Math.min(W - 1, Math.max(0, Math.round(x)))];

// Robust fit; `vertical` fits x = a*y + b. Returns rms and the run it covers.
function fit(pts, vertical = false) {
  let P = pts.map(([x, y]) => (vertical ? [y, x] : [x, y]));
  let res;
  for (let it = 0; it < 8; it++) {
    const n = P.length, mx = P.reduce((s, p) => s + p[0], 0) / n, my = P.reduce((s, p) => s + p[1], 0) / n;
    const a = P.reduce((s, p) => s + (p[0] - mx) * (p[1] - my), 0) / P.reduce((s, p) => s + (p[0] - mx) ** 2, 0), b = my - a * mx;
    const r = P.map((p) => Math.abs(p[1] - (a * p[0] + b)));
    const rms = Math.sqrt(r.reduce((s, v) => s + v * v, 0) / n);
    res = { a, b, rms, n, vertical, max: Math.max(...r), lo: Math.min(...P.map((p) => p[0])), hi: Math.max(...P.map((p) => p[0])) };
    const keep = r.map((v) => v < Math.max(1.0, 2.0 * rms));
    if (keep.filter(Boolean).length < 8 || keep.every(Boolean)) break;
    P = P.filter((_, i) => keep[i]);
  }
  return res;
}
// Seeded tracker. mode "edge" = max |gradient| across the line; "peak" = max brightness (glowing strips).
function trace({ from, to, seedA, seedB, band = 8, seedBand = 25, step = 4, vertical = false, mode = "edge" }) {
  const pts = []; let prev = null;
  for (let t = from; t <= to; t += step) {
    const pred = seedA + (seedB - seedA) * (t - from) / (to - from);
    const c = prev === null ? pred : prev + (pred - (prev === null ? pred : pred)) * 0; // running estimate
    const centre = prev === null ? pred : prev;
    const w = prev === null ? seedBand : band;
    let best = -1, bs = centre;
    for (let s = Math.round(centre - w); s <= Math.round(centre + w); s++) {
      const v = mode === "peak" ? (vertical ? L(s, t) : L(t, s))
        : Math.abs(vertical ? L(s + 1, t) - L(s - 1, t) : L(t, s + 1) - L(t, s - 1));
      if (v > best) { best = v; bs = s; }
    }
    pts.push(vertical ? [bs, t] : [t, bs]);
    // follow the line, but keep the seed's slope as the guide
    prev = prev === null ? bs : 0.5 * bs + 0.5 * (prev + (seedB - seedA) * step / (to - from));
    void c;
  }
  return fit(pts, vertical);
}
const yAt = (f, x) => f.a * x + f.b, xAt = (f, y) => f.a * y + f.b;
const show = (k, f) => console.log(`  ${k.padEnd(14)} ${f.vertical ? `x = ${f.a.toFixed(5)}·y + ${f.b.toFixed(1)}` : `y = ${f.a.toFixed(5)}·x + ${f.b.toFixed(1)}`}  rms ${f.rms.toFixed(2)}px  max ${f.max.toFixed(1)}  n ${f.n}  run ${(f.hi - f.lo).toFixed(0)}px`);

// ── Horizontal lines. BACK wall (direction dB) and RIGHT wall (direction dR). Seeds read off a gridded crop.
const back = {
  bLed:        trace({ from: 560, to: 2560, seedA: 498, seedB: 697, mode: "peak", seedBand: 30 }),
  bShelfStrip: trace({ from: 2180, to: 2560, seedA: 1063, seedB: 1074, mode: "peak", seedBand: 16 }),
  bShelfTop:   trace({ from: 2180, to: 2560, seedA: 862, seedB: 885, seedBand: 16 }),
};
const right = {
  rLed:        trace({ from: 2640, to: 3440, seedA: 683, seedB: 343, mode: "peak", seedBand: 30 }),
  rShelfStrip: trace({ from: 2640, to: 3390, seedA: 1075, seedB: 982, mode: "peak", seedBand: 20 }),
};
// Held OUT of the solve — independent checks.
const checks = {
  rSkirtTop:   trace({ from: 2660, to: 3180, seedA: 1815, seedB: 2040, seedBand: 25 }),
  bShelfTopX:  back.bShelfTop,
};
console.log("horizontal lines (master px, 4000x2250):");
for (const [k, f] of Object.entries({ ...back, ...right, rSkirtTop: checks.rSkirtTop })) show(k, f);

// Least-squares intersection of a set of lines (each y = a x + b).
function vp(lines) { let A = 0, B = 0, C = 0, D = 0, E = 0; for (const f of lines) { const n = Math.hypot(f.a, 1), nx = -f.a / n, ny = 1 / n, c = f.b / n; A += nx * nx; B += nx * ny; C += ny * ny; D += nx * c; E += ny * c; } const det = A * C - B * B; return [(D * C - B * E) / det, (A * E - B * D) / det]; }
const VB = vp([back.bLed, back.bShelfStrip]);
const VR = vp([right.rLed, right.rShelfStrip]);
console.log(`\nVP back  (bLed + bShelfStrip)   = (${VB[0].toFixed(0)}, ${VB[1].toFixed(1)})`);
console.log(`VP right (rLed + rShelfStrip)   = (${VR[0].toFixed(1)}, ${VR[1].toFixed(1)})`);
console.log(`⛔ ROLL CHECK: the two VPs' y differ by ${(VB[1] - VR[1]).toFixed(1)} px (0 = no roll)`);

// Solve f with the principal point at the image centre (ASSUMED — tested below by the verticals).
const f2 = -((VB[0] - cx) * (VR[0] - cx) + (VB[1] - cy) * (VR[1] - cy));
const f = Math.sqrt(f2);
const horizonY = (VB[1] + VR[1]) / 2; // at the centre column; no roll by the check above
const pitch = Math.atan((cy - horizonY) / f); // + = looking DOWN
console.log(`\nf = ${f.toFixed(1)} px   hFOV ${(2 * Math.atan(cx / f) * 180 / Math.PI).toFixed(2)}°   vFOV ${(2 * Math.atan(cy / f) * 180 / Math.PI).toFixed(2)}°   35mm-equiv ${(36 / (2 * Math.tan(Math.atan(cx / f)))).toFixed(1)} mm`);
console.log(`horizon y = ${horizonY.toFixed(1)} (${(horizonY / H).toFixed(4)} of H)   pitch = ${(pitch * 180 / Math.PI).toFixed(2)}° ${pitch < 0 ? "UP" : "DOWN"}`);
// Sensitivity: how far f moves if either VP's x is off
const fAt = (vbx, vrx) => Math.sqrt(-((vbx - cx) * (vrx - cx) + (VB[1] - cy) * (VR[1] - cy)));
console.log(`sensitivity: VP back x ±300 -> f ${fAt(VB[0] - 300, VR[0]).toFixed(0)}..${fAt(VB[0] + 300, VR[0]).toFixed(0)};  VP right x ±10 -> f ${fAt(VB[0], VR[0] + 10).toFixed(0)}..${fAt(VB[0], VR[0] - 10).toFixed(0)}`);

// ── FALSIFICATION 1: verticals. Predicted vertical VP from pitch alone.
const vvY = cy + f / Math.tan(pitch);
console.log(`\n⛔ PREDICTED vertical VP = (${cx.toFixed(0)}, ${vvY.toFixed(0)})   [never used a vertical to get here]`);
const verts = {
  bookcaseR:  trace({ from: 470, to: 1540, seedA: 505, seedB: 490, vertical: true, seedBand: 20 }),
  bookcaseIn: trace({ from: 480, to: 1540, seedA: 180, seedB: 160, vertical: true, seedBand: 20 }),
  tvR:        trace({ from: 800, to: 1240, seedA: 1582, seedB: 1568, vertical: true, seedBand: 20 }),
  cornerSeam: trace({ from: 1110, to: 1480, seedA: 2598, seedB: 2604, vertical: true, seedBand: 16 }),
  endPanelL:  trace({ from: 1700, to: 2200, seedA: 3232, seedB: 3252, vertical: true, seedBand: 25 }),
  endPanelR:  trace({ from: 1700, to: 2200, seedA: 3738, seedB: 3760, vertical: true, seedBand: 25 }),
  wallCurtain:trace({ from: 400, to: 1500, seedA: 3765, seedB: 3770, vertical: true, seedBand: 25 }),
};
console.log("vertical lines: measured lean (dx/dy at the run's middle) vs predicted from the solve");
for (const [k, v] of Object.entries(verts)) {
  const ym = (v.lo + v.hi) / 2, xm = xAt(v, ym);
  const pred = (xm - cx) / (ym - vvY);
  console.log(`  ${k.padEnd(12)} x≈${xm.toFixed(0).padStart(4)}  measured ${v.a.toFixed(5).padStart(9)}  predicted ${pred.toFixed(5).padStart(9)}  Δ ${(v.a - pred).toFixed(5).padStart(9)}  (= ${((v.a - pred) * (v.hi - v.lo)).toFixed(1)} px over its ${(v.hi - v.lo).toFixed(0)} px run)  rms ${v.rms.toFixed(2)}`);
}
// Where do the good verticals actually meet? (independent vertical VP)
{
  const good = Object.values(verts).filter((v) => v.rms < 1.0 && v.hi - v.lo > 300);
  // lines x = a y + b  ->  intersect in (x,y): solve least squares over pairs
  let A = 0, B = 0, C = 0, D = 0, E = 0;
  for (const v of good) { const n = Math.hypot(v.a, 1), nx = 1 / n, ny = -v.a / n, c = v.b / n; A += nx * nx; B += nx * ny; C += ny * ny; D += nx * c; E += ny * c; }
  const det = A * C - B * B; const X = (D * C - B * E) / det, Y = (A * E - B * D) / det;
  console.log(`  measured vertical VP from ${good.length} good verticals = (${X.toFixed(0)}, ${Y.toFixed(0)})   ⛔ x should be ${cx} if the principal point is centred and there is no roll`);
}

// ── FALSIFICATION 2: a right-wall line never used — does it pass through VP right?
{
  const s = checks.rSkirtTop, yv = yAt(s, VR[0]);
  console.log(`\n⛔ HELD-OUT right-wall skirting passes VP-right's column at y=${yv.toFixed(1)} vs VP y ${VR[1].toFixed(1)}  (miss ${(yv - VR[1]).toFixed(1)} px at ${(3000 - VR[0]).toFixed(0)} px from its run)`);
  const t = back.bShelfTop, yb = yAt(t, VB[0]);
  console.log(`⛔ HELD-OUT back-wall shelf top passes VP-back's column at y=${yb.toFixed(1)} vs VP y ${VB[1].toFixed(1)}  (miss ${(yb - VB[1]).toFixed(1)} px — short run, weak)`);
}

// ── Transfer to the plate (D-095): master x = 1.1011·xe + 0.2 ; master y = 1.0945·ye + 4.8
const KX = 1.1011, BX = 0.2, KY = 1.09445, BY = 4.8;
const pcx = (cx - BX) / KX, pcy = (cy - BY) / KY, pfx = f / KX, pfy = f / KY;
console.log(`\nPLATE office-image-3-edited.png (3632x2048): principal point (${pcx.toFixed(1)}, ${pcy.toFixed(1)}) vs centre (1816, 1024); fx ${pfx.toFixed(1)} fy ${pfy.toFixed(1)} (non-square by ${((pfy / pfx - 1) * 100).toFixed(2)}%)`);
console.log(`PLATE squared to 3632x2035 (0.6% vertical downscale): f ${pfx.toFixed(1)} px, principal point (${pcx.toFixed(1)}, ${((cy - BY) / KX).toFixed(1)}) vs centre (1816, 1017.5)`);
console.log(`\nFOR THREE.JS: vertical FOV (squared plate, full frame) = ${(2 * Math.atan(1017.5 / pfx) * 180 / Math.PI).toFixed(2)}°,  pitch ${(pitch * 180 / Math.PI).toFixed(2)}° (${pitch < 0 ? "up" : "down"}), roll 0`);

if (OUT) {
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">`;
  const hl = (f, col, x0 = 0, x1 = W) => (svg += `<line x1="${x0}" y1="${yAt(f, x0)}" x2="${x1}" y2="${yAt(f, x1)}" stroke="${col}" stroke-width="3" opacity="0.85"/>`);
  for (const f2_ of Object.values(back)) hl(f2_, "#00ffff", 0, Math.min(W, VB[0]));
  for (const f2_ of Object.values(right)) hl(f2_, "#ff00ff", VR[0], W);
  hl(checks.rSkirtTop, "#ffff00", VR[0], W);
  svg += `<line x1="0" y1="${horizonY}" x2="${W}" y2="${horizonY}" stroke="#00ff00" stroke-width="2" stroke-dasharray="20 12"/>`;
  // predicted verticals through a comb of points
  for (let x = 100; x < W; x += 300) svg += `<line x1="${x}" y1="${H}" x2="${x + (cx - x) * (H - 0) / (H - vvY)}" y2="0" stroke="#ffffff" stroke-width="2" opacity="0.5"/>`;
  svg += `<circle cx="${VR[0]}" cy="${VR[1]}" r="14" fill="none" stroke="#ff00ff" stroke-width="4"/>`;
  svg += `</svg>`;
  const buf = await sharp(SRC).composite([{ input: Buffer.from(svg) }]).jpeg({ quality: 88 }).toBuffer();
  await sharp(buf).resize(2000).toFile(OUT);
  console.log(`overlay -> ${OUT}`);
}
