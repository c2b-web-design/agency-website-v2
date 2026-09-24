import sharp from "file:///C:/Users/Carl%20Buckley/agency-website-v2/node_modules/sharp/lib/index.js";
const SRC = "C:/Users/Carl Buckley/agency-website-v2/brand-assets/office-image-3.jpg";
const cx = 1652, hw = 230; // a marker bar either side of the centre line
const bar = (y0, y1, col, label, dx) => `<rect x="${cx - hw + dx}" y="${y0}" width="${hw * 2 - 40}" height="${y1 - y0}" fill="${col}" fill-opacity="0.28" stroke="${col}" stroke-width="6"/><text x="${cx - hw + dx + 12}" y="${(y0 + y1) / 2 + 16}" fill="#fff" font-family="Arial" font-weight="bold" font-size="44" stroke="#000" stroke-width="7" paint-order="stroke">${label}</text>`;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="4000" height="2250">
 ${bar(211, 585, "#ff8ae0", "A: band+rims 374", -520)}
 ${bar(211, 499, "#7ec8ff", "B: doors 288", 20)}
 ${bar(1586, 1960, "#ff8ae0", "A: floor card 374", -520)}
 ${bar(1550, 1833, "#7ec8ff", "B: hover 283", 20)}
 <line x1="${cx}" y1="150" x2="${cx}" y2="2050" stroke="#ffd400" stroke-width="5" stroke-dasharray="20 12"/>
</svg>`;
const full = await sharp(SRC).composite([{ input: Buffer.from(svg) }]).png().toBuffer();
await sharp(full).extract({ left: 700, top: 100, width: 2000, height: 2000 }).resize(1000).toFile("caps/o3-balance.png");
