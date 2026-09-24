import sharp from "file:///C:/Users/Carl%20Buckley/agency-website-v2/node_modules/sharp/lib/index.js";
const SRC = "C:/Users/Carl Buckley/agency-website-v2/brand-assets/office-image-3.jpg";
// From wallfit.mjs (all five horizontal lines): VP and the TV/corner x on the TV bottom line.
const VP = [9196, 1291], xl = 608, xr = 1566, xc = 2602, S = 1.407;
const tvTop = (x) => 0.04592 * x + 692.9, tvBot = (x) => 0.01945 * x + 1247.4;
// Lines through the TV's right corners and the VP carry the card's top and bottom along the wall.
const through = (x0, y0) => (x) => y0 + (VP[1] - y0) * (x - x0) / (VP[0] - x0);
const top = through(xr, tvTop(xr)), bot = through(xr, tvBot(xr));
const u = (x) => (x - xl) / (VP[0] - x), k = 1 / u(xr);
const xOf = (w) => (w * VP[0] + k * xl) / (k + w);   // wall position in TV widths → image x
const m = (S - 1) / 2, cl = xOf(1 + m), cr = xOf(2 + m);
console.log(`right card: image x ${cl.toFixed(0)}–${cr.toFixed(0)} (TV ${xl}–${xr}, corner ${xc}); gaps ${m.toFixed(3)} TV widths each side`);
console.log(`right card height in px: left edge ${(bot(cl) - top(cl)).toFixed(0)}, right edge ${(bot(cr) - top(cr)).toFixed(0)} (TV right edge ${(bot(xr) - top(xr)).toFixed(0)})`);
console.log(`card top at x=${cr.toFixed(0)}: y ${top(cr).toFixed(0)}; LED strip there: y ${(0.09889 * cr + 443).toFixed(0)}`);
const obstacles = { "speakers (tops)": [1600, 1130, 1790, 1500], "corner shelving (to delete?)": [1804, 840, 2596, 1075], "PC tower (to move)": [2370, 1194, 2640, 1460], "white box": [2060, 1386, 2380, 1500], "headset stand": [1900, 1330, 2040, 1500] };
for (const [k2, [x0, y0, x1, y1]] of Object.entries(obstacles)) {
  const ox = Math.max(0, Math.min(x1, cr) - Math.max(x0, cl)), cardBot = bot(Math.min(Math.max(x0, cl), cr));
  const oy = Math.max(0, Math.min(y1, cardBot) - Math.max(y0, top(Math.max(x0, cl))));
  console.log(`  ${k2.padEnd(30)} ${ox > 0 && oy > 0 ? `OVERLAPS the card (${ox.toFixed(0)} × ${oy.toFixed(0)} px)` : "clear"}`);
}
const poly = (x0, x1) => `${x0},${top(x0)} ${x1},${top(x1)} ${x1},${bot(x1)} ${x0},${bot(x0)}`;
const lab = (x, y, t, c) => `<text x="${x}" y="${y}" fill="${c}" font-family="Arial" font-weight="bold" font-size="54" stroke="#000" stroke-width="8" paint-order="stroke">${t}</text>`;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="4000" height="2250">
 <polygon points="${xl},${tvTop(xl)} ${xr},${tvTop(xr)} ${xr},${tvBot(xr)} ${xl},${tvBot(xl)}" fill="rgba(90,170,255,0.25)" stroke="#7ec8ff" stroke-width="8"/>
 ${lab(xl + 60, 1000, "LEFT CARD = TV", "#fff")}
 <polygon points="${poly(cl, cr)}" fill="rgba(90,255,160,0.25)" stroke="#6dffb0" stroke-width="8"/>
 ${lab(cl + 40, 1000, "RIGHT CARD (same size)", "#fff")}
 <line x1="${xc}" y1="600" x2="${xc}" y2="1500" stroke="#ffd400" stroke-width="6" stroke-dasharray="24 14"/>
 ${lab(xc - 250, 590, "CORNER", "#ffd400")}
 <line x1="0" y1="${VP[1]}" x2="4000" y2="${VP[1]}" stroke="#ff6060" stroke-width="3" stroke-dasharray="16 12"/>
 ${lab(3050, VP[1] - 16, "HORIZON (from fit)", "#ff6060")}
</svg>`;
const full = await sharp(SRC).composite([{ input: Buffer.from(svg) }]).png().toBuffer(); await sharp(full).resize(2000).toFile("caps/o3-rightcard.png");
