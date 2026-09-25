// The new room as a 3D model through the solved camera (camera-solve-25-september.md), and the card
// layout from Carl's rulings of 25 September 2026. MASTER frame, brand-assets/office-image-3.jpg, 4000 x 2250.
//
// Every straight edge is fitted THROUGH its known vanishing point: only its offset is measured, never
// its angle. For each feature, a 1-D search along several columns (horizontals) or rows (verticals)
// finds the edge/valley/peak; the constrained line is the median offset; rms is reported.
import sharp from "file:///C:/Users/Carl%20Buckley/agency-website-v2/node_modules/sharp/lib/index.js";
const SRC = "C:/Users/Carl Buckley/agency-website-v2/brand-assets/office-image-3.jpg";
const { data, info } = await sharp(SRC).greyscale().blur(1.0).raw().toBuffer({ resolveWithObject: true });
const W = info.width;
const L = (x, y) => data[Math.round(y) * W + Math.round(x)];

// ── camera
const f = 2013.7, cx = 2000, cy = 1125;
const VB = [8065, 1240.6], VR = [1329.3, 1236.0];
const pitchUp = 3.22 * Math.PI / 180, VV = [cx, cy - f / Math.tan(pitchUp)]; // vertical VP (predicted; verified)
const sub = (a, b) => a.map((v, i) => v - b[i]), mul = (a, s) => a.map((v) => v * s);
const dot = (a, b) => a.reduce((s, v, i) => s + v * b[i], 0), norm = (a) => Math.sqrt(dot(a, a)), unit = (a) => mul(a, 1 / norm(a));
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const ray = (p) => [p[0] - cx, p[1] - cy, f];
const proj = (X) => [cx + f * X[0] / X[2], cy + f * X[1] / X[2]];
const dB = unit(ray(VB)), dR = unit(ray(VR));
let dUp = unit(cross(dB, dR)); if (dUp[1] > 0) dUp = mul(dUp, -1);
// the room corner at eye height, at unit distance (scale fixed later from a known size)
const Cc = unit(ray([2601.0, 1238.3]));
const onPlane = (p, n, P0) => mul(ray(p), dot(P0, n) / dot(ray(p), n));
const onBack = (p) => onPlane(p, dR, Cc), onRight = (p) => onPlane(p, dB, Cc);
const onLevel = (p, h) => mul(ray(p), h / dot(ray(p), dUp));            // horizontal plane at height h (eye = 0)
const U = (X) => dot(sub(X, Cc), dB), V = (X) => dot(X, dUp);          // along the back wall (0 = corner, − = left); height rel. eye
const Dfront = (X) => -dot(sub(X, Cc), dR);                              // distance IN FRONT of the back wall
console.log(`dB·dR = ${dot(dB, dR).toExponential(2)} (0 = perpendicular)`);

// ── 1-D feature finders (sub-pixel)
function col(x, y0, y1, mode) { // along a column: "edge" |dI/dy| max, "valley" min, "peak" max
  let best = -Infinity, by = y0; const v = (y) => { let s = 0; for (let d = -3; d <= 3; d++) s += L(x + d, y); return s / 7; };
  for (let y = Math.ceil(y0); y <= y1; y++) { const s = mode === "edge" ? Math.abs(v(y + 1) - v(y - 1)) : mode === "valley" ? -v(y) : v(y); if (s > best) { best = s; by = y; } }
  return by;
}
function row(y, x0, x1, mode) {
  let best = -Infinity, bx = x0; const v = (x) => { let s = 0; for (let d = -3; d <= 3; d++) s += L(x, y + d); return s / 7; };
  for (let x = Math.ceil(x0); x <= x1; x++) { const s = mode === "edge" ? Math.abs(v(x + 1) - v(x - 1)) : mode === "valley" ? -v(x) : v(x); if (s > best) { best = s; bx = x; } }
  return bx;
}
// A horizontal line through VB, from points found near a seed line y = ys(x) ± w
function hLine(name, xs, ys, w, mode, vp = VB) {
  const pts = xs.map((x) => [x, col(x, ys(x) - w, ys(x) + w, mode)]);
  const k = pts.map(([x, y]) => (y - vp[1]) / (x - vp[0])).sort((a, b) => a - b); // slope from the VP
  const m = k[Math.floor(k.length / 2)];
  const yAt = (x) => vp[1] + m * (x - vp[0]);
  const res = pts.map(([x, y]) => y - yAt(x)); const rms = Math.sqrt(res.reduce((s, r) => s + r * r, 0) / res.length);
  console.log(`  ${name.padEnd(26)} rms ${rms.toFixed(2)}px  n ${pts.length}  (e.g. y ${yAt(xs[0]).toFixed(1)} at x ${xs[0]})`);
  return { yAt, rms, pts };
}
// A vertical line through VV
function vLine(name, ysArr, xs, w, mode) {
  const pts = ysArr.map((y) => [row(y, xs(y) - w, xs(y) + w, mode), y]);
  const k = pts.map(([x, y]) => (x - VV[0]) / (y - VV[1])).sort((a, b) => a - b);
  const m = k[Math.floor(k.length / 2)];
  const xAt = (y) => VV[0] + m * (y - VV[1]);
  const res = pts.map(([x, y]) => x - xAt(y)); const rms = Math.sqrt(res.reduce((s, r) => s + r * r, 0) / res.length);
  console.log(`  ${name.padEnd(26)} rms ${rms.toFixed(2)}px  n ${pts.length}  (x ${xAt(ysArr[0]).toFixed(1)} at y ${ysArr[0]})`);
  return { xAt, rms, pts };
}
const range = (a, b, s) => { const r = []; for (let v = a; v <= b; v += s) r.push(v); return r; };
const meet = (h, v) => { let x = v.xAt(1000); for (let i = 0; i < 20; i++) x = v.xAt(h.yAt(x)); return [x, h.yAt(x)]; };

console.log("\nFEATURES (constrained through their vanishing points):");
// TV outer frame
const tvTop = hLine("TV top", range(650, 1520, 30), (x) => 707 + 0.085 * (x - 600), 14, "edge");
const tvBot = hLine("TV bottom", range(650, 1520, 30), (x) => 1268 - 0.008 * (x - 600), 14, "edge");
const tvL = vLine("TV left", range(780, 1230, 15), () => 596, 14, "edge");
const tvR = vLine("TV right", range(820, 1230, 15), () => 1576, 12, "edge");
// cabinet band (back-wall run)
const cabTop = hLine("cabinet top", range(1100, 2000, 30), (x) => 162 + 0.15 * (x - 1150), 10, "edge");
const doorBot = hLine("door bottoms (gap)", range(760, 1800, 30), (x) => 399 + 0.117 * (x - 800), 8, "valley");
const trimBot = hLine("bottom trim, lower edge", range(760, 1800, 30), (x) => 432 + 0.114 * (x - 800), 8, "valley");
const led = hLine("LED (back)", range(600, 2500, 40), (x) => 443 + 0.0989 * x, 10, "peak");
// right run of cabinets: LED on the right wall, the underside's front edge, and the run's end edge
const ledR = hLine("LED (right)", range(2660, 3420, 40), (x) => 1799.9 - 0.42424 * x, 10, "peak", VR);
const sofR = hLine("right run underside front", range(2700, 3150, 25), (x) => 595 - 0.49 * (x - 2550), 14, "edge", VR);
// desk top meets the right wall (right of the monitor arm)
const deskWall = hLine("desk top / right wall", range(3280, 3700, 20), (x) => 1560 + 0.15 * (x - 3280), 14, "edge", VR);
// right-wall floor line (skirting bottom), under the desk
const floorR = hLine("right wall floor line", range(2700, 3150, 25), (x) => 1880 + 0.44 * (x - 2700), 16, "edge", VR);
// counter: its front edge; and the drawer fronts' plinth line on the floor
const ctrFront = hLine("counter front edge", range(560, 1540, 30), (x) => 1592 - 0.02 * (x - 560), 12, "edge");
const plinthFloor = hLine("plinth / floor line", range(560, 1780, 40), (x) => 1995 - 0.075 * (x - 560), 18, "edge");

// ── 3D: scale-free first
const tvTL = onBack(meet(tvTop, tvL)), tvTR = onBack(meet(tvTop, tvR)), tvBL = onBack(meet(tvBot, tvL)), tvBR = onBack(meet(tvBot, tvR));
const tvW = (U(tvTR) - U(tvTL) + U(tvBR) - U(tvBL)) / 2, tvH = (V(tvTL) - V(tvBL) + V(tvTR) - V(tvBR)) / 2;
console.log(`\nTV outer frame: ${tvW.toFixed(4)} x ${tvH.toFixed(4)} units, aspect ${(tvW / tvH).toFixed(3)} (16:9 = 1.778)  [top-edge width ${(U(tvTR) - U(tvTL)).toFixed(4)} vs bottom ${(U(tvBR) - U(tvBL)).toFixed(4)}; left height ${(V(tvTL) - V(tvBL)).toFixed(4)} vs right ${(V(tvTR) - V(tvBR)).toFixed(4)}]`);

// floor height from the right wall's floor line; desk height from the desk/right-wall line
const avgV = (line, xs, planeFn) => { const vs = xs.map((x) => V(planeFn([x, line.yAt(x)]))); return { m: vs.reduce((s, v) => s + v, 0) / vs.length, spread: Math.max(...vs) - Math.min(...vs) }; };
const floor = avgV(floorR, range(2700, 3150, 50), onRight), desk = avgV(deskWall, range(3280, 3700, 50), onRight);
console.log(`floor v = ${floor.m.toFixed(4)} (spread ${floor.spread.toExponential(1)})   desk top v = ${desk.m.toFixed(4)} (spread ${desk.spread.toExponential(1)})   → desk height ${(desk.m - floor.m).toFixed(4)} units, eye height ${(-floor.m).toFixed(4)} units`);

// cabinet depth, two ways
const ledV = avgV(led, range(700, 2400, 100), onBack), ledRV = avgV(ledR, range(2700, 3400, 100), onRight);
console.log(`LED height: back ${ledV.m.toFixed(4)}, right ${ledRV.m.toFixed(4)} (should agree — both runs)`);
const depthBack = range(800, 1800, 100).map((x) => Dfront(onLevel([x, trimBot.yAt(x)], ledV.m)));
const depthRight = range(2750, 3150, 100).map((x) => -dot(sub(onLevel([x, sofR.yAt(x)], ledRV.m), Cc), dB)); // distance off the right wall
const mean = (a) => a.reduce((s, v) => s + v, 0) / a.length;
console.log(`cabinet depth: back run ${mean(depthBack).toFixed(4)} (±${(Math.max(...depthBack) - Math.min(...depthBack)).toFixed(4)}), right run ${mean(depthRight).toFixed(4)} (±${(Math.max(...depthRight) - Math.min(...depthRight)).toFixed(4)})`);

// counter front depth: its front edge is at counter height; the counter height is unknown, so use
// the plinth/floor line instead (floor height known) for the cabinet's footprint
const plinthD = range(600, 1700, 100).map((x) => Dfront(onLevel([x, plinthFloor.yAt(x)], floor.m)));
console.log(`plinth front (at the floor) ${mean(plinthD).toFixed(4)} in front of the back wall (±${(Math.max(...plinthD) - Math.min(...plinthD)).toFixed(4)})`);
// counter height, if the counter front is directly above the drawer fronts: solve h such that the front edge's depth = drawer-front depth.
// (reported for reference; the drawer-front depth is measured below from the top drawer's top edge is not attempted)
export { dB, dR, dUp, Cc, onBack, onRight, onLevel, U, V, Dfront, proj, tvTL, tvTR, tvBL, tvBR, tvW, tvH, floor, desk, ledV, depthBack, depthRight, plinthD, trimBot, cabTop, doorBot, ctrFront, mean };
