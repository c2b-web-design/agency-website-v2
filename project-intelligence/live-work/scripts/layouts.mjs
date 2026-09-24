import sharp from "file:///C:/Users/Carl%20Buckley/agency-website-v2/node_modules/sharp/lib/index.js";
const SRC = "C:/Users/Carl Buckley/agency-website-v2/brand-assets/office-image-3.jpg";
const VP = [9196, 1291], xl = 608, xr = 1566;
const tvTop = (x) => 0.04592 * x + 692.9, tvBot = (x) => 0.01945 * x + 1247.4;
const dT = (x) => 0.12211 * x + 9.0, dB = (x) => 0.11506 * x + 308.7;
const u = (x) => (x - xl) / (VP[0] - x), k = 1 / u(xr), X = (w) => (w * VP[0] + k * xl) / (k + w);
const thru = (y0) => (x) => y0 + (VP[1] - y0) * (x - 1652) / (VP[0] - 1652); // a wall-horizontal through (1652, y0)
const band = { A: [211, 585, 1.37], B: [211, 499, 1.773] };
const floorY = { A: [1586, 1960], B: [1550, 1833] };
const m = 0.2035, edge = 1.688; // cubby entrance at x ≈ 2110
for (const opt of ["A", "B"]) {
  const [bt, bb, w] = band[opt], d = (1.102 + w / 2) - edge;
  const aT = thru(bt), aB = thru(bb), fT = thru(floorY[opt][0]), fB = thru(floorY[opt][1]);
  const q = (w0, w1, T, B) => `${X(w0)},${T(X(w0))} ${X(w1)},${T(X(w1))} ${X(w1)},${B(X(w1))} ${X(w0)},${B(X(w0))}`;
  const lab = (x, y, t) => `<text x="${x}" y="${y}" fill="#fff" font-family="Arial" font-weight="bold" font-size="56" stroke="#000" stroke-width="8" paint-order="stroke">${t}</text>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="4000" height="2250">
   <polygon points="${q(0, 1, tvTop, tvBot)}" fill="rgba(90,170,255,0.3)" stroke="#7ec8ff" stroke-width="8"/>${lab(X(0.4), 1010, "CA")}
   <polygon points="${q(1 + m, 2 + m, tvTop, tvBot)}" fill="rgba(90,255,160,0.3)" stroke="#6dffb0" stroke-width="8"/>${lab(X(1.55), 1010, "CB")}
   <polygon points="${q(1.102 - w / 2 + d, 1.102 + w / 2 + d, aT, aB)}" fill="rgba(255,120,220,0.3)" stroke="#ff8ae0" stroke-width="8"/>${lab(X(0.95), (bt + bb) / 2 + 60, `ABOVE (${opt})`)}
   <polygon points="${q(1.102 - w / 2 - d, edge, fT, fB)}" fill="rgba(255,200,90,0.3)" stroke="#ffc85a" stroke-width="8"/>${lab(X(0.7), (floorY[opt][0] + floorY[opt][1]) / 2 + 20, `FLOOR (${opt})`)}
   <line x1="1652" y1="120" x2="1652" y2="2100" stroke="#ffd400" stroke-width="5" stroke-dasharray="20 12"/>
   <line x1="2110" y1="1450" x2="2110" y2="2000" stroke="#ff4040" stroke-width="5" stroke-dasharray="12 8"/>
   ${lab(2130, 1440, "cubby line")}
  </svg>`;
  const full = await sharp(SRC).composite([{ input: Buffer.from(svg) }]).png().toBuffer();
  await sharp(full).resize(2000).toFile(`caps/o3-layout-${opt}.png`);
  console.log(opt, `shift ${d.toFixed(3)}; above ${(1.102 - w / 2 + d).toFixed(3)}–${(1.102 + w / 2 + d).toFixed(3)}; floor ${(1.102 - w / 2 - d).toFixed(3)}–${edge}`);
}
