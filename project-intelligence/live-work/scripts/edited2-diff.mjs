import sharp from "file:///C:/Users/Carl%20Buckley/agency-website-v2/node_modules/sharp/lib/index.js";
const M = "C:/Users/Carl Buckley/agency-website-v2/brand-assets/office-image-3.jpg";
const E = "C:/Users/Carl Buckley/agency-website-v2/brand-assets/edit-this-image-keep-everything-else-exactly-as-it.jpg";
const E1 = "C:/Users/Carl Buckley/agency-website-v2/brand-assets/office-image-edited.png";
const SP = "C:/Users/Carl Buckley/AppData/Local/Temp/claude/c--Users-Carl-Buckley-agency-website-v2/92ee830b-ab55-4531-8f34-9f40aaae896f/scratchpad";
// mapping measured by edited2-map.mjs: master x = 3.0980*xe - 9.2 ; master y = 2.0046*ye + 0.6
const KX = 3.0980, BX = -9.2, KY = 2.0046, BY = 0.6;
const e = await sharp(E).greyscale().raw().toBuffer({ resolveWithObject: true }); const W = e.info.width, H = e.info.height;
const mm = await sharp(M).greyscale().raw().toBuffer({ resolveWithObject: true });
const e1 = await sharp(E1).greyscale().raw().toBuffer({ resolveWithObject: true }); // first edit: master = x/0.344, y/0.344 + 8.7
const bil = (buf, w, h, x, y) => { if (x < 0 || y < 0 || x > w - 2 || y > h - 2) return NaN; const x0 = Math.floor(x), y0 = Math.floor(y), fx = x - x0, fy = y - y0; const d = buf; return d[y0 * w + x0] * (1 - fx) * (1 - fy) + d[y0 * w + x0 + 1] * fx * (1 - fy) + d[(y0 + 1) * w + x0] * (1 - fx) * fy + d[(y0 + 1) * w + x0 + 1] * fx * fy; };
// box-average master over the footprint of one edit pixel (3.1 x 2.0 master px)
const Mv = (xe, ye) => { let s = 0, n = 0; for (let dy = -1; dy <= 1; dy++) for (let dx = -1.5; dx <= 1.5; dx += 1) { const v = bil(mm.data, 4000, 2250, KX * xe + BX + dx, KY * ye + BY + dy * 0.66); if (!isNaN(v)) { s += v; n++; } } return n ? s / n : NaN; };
const E1v = (xe, ye) => bil(e1.data, 1376, 768, (KX * xe + BX) * 0.344, (KY * ye + BY) * 0.344 - 3);
const signed = Buffer.alloc(W * H * 3);
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const a = Mv(x, y), b = e.data[y * W + x]; const i = (y * W + x) * 3; if (isNaN(a)) { signed[i + 1] = 90; continue; } const s = Math.max(-255, Math.min(255, (b - a) * 3)); signed[i] = s > 0 ? s : 0; signed[i + 2] = s < 0 ? -s : 0; }
await sharp(signed, { raw: { width: W, height: H, channels: 3 } }).png().toFile(SP + "/edit2-signeddiff.png");
// regions given in MASTER px so both edits are compared on the same patch of room
const regions = { "back wall, CA area (old TV)": [900, 1000, 2250, 1640], "back wall, CB area (old shelf)": [1900, 1000, 2580, 1450], "back wall above cabinet, left": [560, 1300, 1700, 1500], "right wall above desk": [2700, 700, 3350, 1150], "upper cabinets": [620, 180, 2500, 420], "credenza drawers": [300, 1600, 1740, 1900], "floor, centre": [900, 2000, 2000, 2200], "left bookcase": [0, 440, 430, 1200] };
console.log("region (master px)".padEnd(32), "master  edit1  edit2   e1/m  e2/m   e2 mean|diff|");
for (const [k, [x0, y0, x1, y1]] of Object.entries(regions)) {
  let a = 0, b = 0, c = 0, d = 0, n = 0;
  for (let y = y0; y < y1; y += 4) for (let x = x0; x < x1; x += 4) { const xe = (x - BX) / KX, ye = (y - BY) / KY; if (xe < 0 || xe > W - 2) continue; const mv = bil(mm.data, 4000, 2250, x, y), v2 = bil(e.data, W, H, xe, ye), v1 = bil(e1.data, 1376, 768, x * 0.344, y * 0.344 - 3); a += mv; b += v1; c += v2; d += Math.abs(v2 - Mv(xe, ye)); n++; }
  console.log(k.padEnd(32), (a / n).toFixed(1).padStart(6), (b / n).toFixed(1).padStart(6), (c / n).toFixed(1).padStart(6), (b / a).toFixed(2).padStart(6), (c / a).toFixed(2).padStart(5), (d / n).toFixed(1).padStart(8));
}
