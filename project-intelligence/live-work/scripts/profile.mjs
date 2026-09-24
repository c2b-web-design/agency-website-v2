import sharp from "file:///C:/Users/Carl%20Buckley/agency-website-v2/node_modules/sharp/lib/index.js";
const SRC = "C:/Users/Carl Buckley/agency-website-v2/brand-assets/office-image-3.jpg";
const X0 = 1600, X1 = 1700; // a strip either side of the centre line x = 1652
const { data, info } = await sharp(SRC).greyscale().raw().toBuffer({ resolveWithObject: true });
const W = info.width, H = info.height;
const prof = []; for (let y = 0; y < H; y++) { let s = 0; for (let x = X0; x <= X1; x++) s += data[y * W + x]; prof.push(s / (X1 - X0 + 1)); }
const sm = prof.map((_, y) => { let s = 0, n = 0; for (let d = -2; d <= 2; d++) { const v = prof[y + d]; if (v !== undefined) { s += v; n++; } } return s / n; });
const g = sm.map((_, y) => (sm[y + 1] ?? sm[y]) - (sm[y - 1] ?? sm[y]));
const peaks = []; for (let y = 3; y < H - 3; y++) { const a = Math.abs(g[y]); if (a > 4 && a >= Math.abs(g[y - 1]) && a >= Math.abs(g[y + 1])) peaks.push([y, g[y].toFixed(1), sm[y].toFixed(0)]); }
console.log("edges on the centre strip (y, gradient, luminance):");
for (const [y, gr, l] of peaks) if ((y > 150 && y < 700) || (y > 1450 && y < 2150)) console.log(`  y ${y}  grad ${gr}  lum ${l}`);
// crops with a y ruler for identification
const ruler = (y0, y1, w) => { let s = ""; for (let y = Math.ceil(y0 / 20) * 20; y <= y1; y += 20) { const yy = y - y0; const big = y % 100 === 0; s += `<line x1="0" y1="${yy}" x2="${big ? 60 : 25}" y2="${yy}" stroke="#0ff" stroke-width="${big ? 3 : 1.5}"/>`; if (big) s += `<text x="65" y="${yy + 10}" fill="#0ff" font-size="30" font-family="Arial" stroke="#000" stroke-width="4" paint-order="stroke">${y}</text>`; } return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${y1 - y0}">${s}<line x1="${1652 - 1400}" y1="0" x2="${1652 - 1400}" y2="${y1 - y0}" stroke="#ff0" stroke-width="2" stroke-dasharray="8 6"/></svg>`; };
for (const [tag, y0, y1] of [["top", 150, 700], ["bottom", 1450, 2150]]) {
  const buf = await sharp(SRC).extract({ left: 1400, top: y0, width: 600, height: y1 - y0 }).composite([{ input: Buffer.from(ruler(y0, y1, 600)) }]).png().toBuffer();
  await sharp(buf).toFile(`caps/o3-profile-${tag}.png`);
}
