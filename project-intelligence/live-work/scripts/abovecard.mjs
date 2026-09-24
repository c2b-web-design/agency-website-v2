import sharp from "file:///C:/Users/Carl%20Buckley/agency-website-v2/node_modules/sharp/lib/index.js";
const SRC = "C:/Users/Carl Buckley/agency-website-v2/brand-assets/office-image-3.jpg";
const { data, info } = await sharp(SRC).greyscale().blur(1.2).raw().toBuffer({ resolveWithObject: true });
const W = info.width, Lm = (x, y) => data[Math.round(y) * W + Math.round(x)];
function fit(pts) { let P = pts; for (let it = 0; it < 6; it++) { const n = P.length, mx = P.reduce((a, p) => a + p[0], 0) / n, my = P.reduce((a, p) => a + p[1], 0) / n; const a = P.reduce((s, p) => s + (p[0] - mx) * (p[1] - my), 0) / P.reduce((s, p) => s + (p[0] - mx) ** 2, 0), b = my - a * mx; const r = P.map((p) => Math.abs(p[1] - (a * p[0] + b))); const rms = Math.sqrt(r.reduce((s, v) => s + v * v, 0) / n); if (it === 5) return { a, b, rms, n, max: Math.max(...r) }; const cut = [...r].sort((u, v) => u - v)[Math.floor(n * 0.85)]; P = P.filter((_, i) => r[i] <= cut); } }
function hEdge(x0, x1, ya, yb, w, step = 4) { const pts = []; for (let x = x0; x <= x1; x += step) { const yc = ya + (yb - ya) * (x - x0) / (x1 - x0); let best = -1, by = 0; for (let y = yc - w; y <= yc + w; y++) { const g = Math.abs(Lm(x, y + 1) - Lm(x, y - 1)); if (g > best) { best = g; by = y; } } pts.push([x, by]); } return fit(pts); }
const doorTop = hEdge(640, 2380, 80, 300, 30), doorBot = hEdge(640, 2380, 376, 570, 30);
for (const [k, f] of Object.entries({ doorTop, doorBot })) console.log(k.padEnd(8), `y = ${f.a.toFixed(5)}·x + ${f.b.toFixed(1)}  rms ${f.rms.toFixed(2)} max ${f.max.toFixed(1)} n ${f.n}`);
// From wallfit.mjs: VP, TV lines, TV and CB extents on the wall (TV widths), corner.
const VP = [9196, 1291], xl = 608, xr = 1566;
const tvTop = (x) => 0.04592 * x + 692.9, tvBot = (x) => 0.01945 * x + 1247.4;
const u = (x) => (x - xl) / (VP[0] - x), k = 1 / u(xr), xOf = (w) => (w * VP[0] + k * xl) / (k + w);
const m = 0.2035, cbR = 2 + m, centreU = cbR / 2;
const xc = xOf(centreU);
const at = (f, x) => f.a * x + f.b;
const hDoor = at(doorBot, xc) - at(doorTop, xc), hTv = tvBot(xc) - tvTop(xc);
const ratio = hDoor / hTv, widthTv = 1 / ratio;   // area match: w·h = W_tv·H_tv  →  w/W_tv = H_tv/h
console.log(`centre of CA+gap+CB: ${centreU.toFixed(3)} TV widths from CA's left edge → image x ${xc.toFixed(0)}`);
console.log(`at that x: door height ${hDoor.toFixed(0)} px, TV-line height ${hTv.toFixed(0)} px → door = ${ratio.toFixed(3)} × card height`);
console.log(`equal area → above card width = ${widthTv.toFixed(3)} TV widths (aspect ≈ ${(widthTv / ratio).toFixed(2)} × the wall card's)`);
const aL = centreU - widthTv / 2, aR = centreU + widthTv / 2;
console.log(`above card spans ${aL.toFixed(3)}–${aR.toFixed(3)} TV widths (CA ${0}–1, CB ${(1 + m).toFixed(3)}–${cbR.toFixed(3)}, corner ${(2 + 2 * m).toFixed(3)}) → image x ${xOf(aL).toFixed(0)}–${xOf(aR).toFixed(0)}`);
// sensitivity: ± the spread of the free-space estimate (1.20–1.48 → m 0.10–0.24)
for (const mm of [0.10, 0.24]) { const c = (2 + mm) / 2; const x = xOf(c); const r = (at(doorBot, x) - at(doorTop, x)) / (tvBot(x) - tvTop(x)); console.log(`  if gaps were ${mm}: centre ${c.toFixed(3)}, width ${(1 / r).toFixed(3)} TV widths`); }
// overlay
const cbL = 1 + m, X = (w) => xOf(w);
const quad = (w0, w1, tf, bf) => `${X(w0)},${tf(X(w0))} ${X(w1)},${tf(X(w1))} ${X(w1)},${bf(X(w1))} ${X(w0)},${bf(X(w0))}`;
const dT = (x) => at(doorTop, x), dB = (x) => at(doorBot, x);
const lab = (x, y, t, c = "#fff") => `<text x="${x}" y="${y}" fill="${c}" font-family="Arial" font-weight="bold" font-size="52" stroke="#000" stroke-width="8" paint-order="stroke">${t}</text>`;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="4000" height="2250">
 <polygon points="${quad(0, 1, tvTop, tvBot)}" fill="rgba(90,170,255,0.25)" stroke="#7ec8ff" stroke-width="8"/>${lab(X(0.3), 1000, "CA")}
 <polygon points="${quad(cbL, cbR, tvTop, tvBot)}" fill="rgba(90,255,160,0.25)" stroke="#6dffb0" stroke-width="8"/>${lab(X(cbL + 0.4), 1000, "CB")}
 <polygon points="${quad(aL, aR, dT, dB)}" fill="rgba(255,120,220,0.28)" stroke="#ff8ae0" stroke-width="8"/>${lab(X(centreU) - 330, dT(X(centreU)) + 150, "ABOVE — ELONGATED")}
 <line x1="${xc}" y1="${dT(xc) - 20}" x2="${xc}" y2="${tvBot(xc) + 40}" stroke="#ffd400" stroke-width="6" stroke-dasharray="20 12"/>${lab(xc + 20, tvBot(xc) + 90, "CENTRE", "#ffd400")}
</svg>`;
const full = await sharp(SRC).composite([{ input: Buffer.from(svg) }]).png().toBuffer();
await sharp(full).resize(2000).toFile("caps/o3-abovecard.png");
