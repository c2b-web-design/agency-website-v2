/** A CROP FROM AN ESA/HUBBLE ZOOMABLE IMAGE, BUILT FROM ITS TILES (15 October 2026, session 3). Carl: "if we use it we are
 *  gonna have to zoom and crop ourselves" → "Grab all 4." The zoom viewer is a Zoomify tile pyramid (256 px tiles,
 *  `TileGroup{g}/{tier}-{x}-{y}.jpg`); this fetches ONLY the tiles covering a frame, at the tier nearest above the output
 *  width, stitches them and resizes to the output. Hubble's own pixels — nothing upscaled (it refuses a tier smaller than
 *  the output).
 *  Usage: node …/zoomify-crop-15-october.mjs <id> <fullW> <fullH> <x0> <y0> <w> <h> <outWidth> <outFile>   (frame in FULL-res px)
 *  ⚠ NOT WATCHED: colour management (the tiles' JPEG profile is kept as served); the credit (the caller's job). */
import sharp from "sharp";
const [id, FW, FH, X0, Y0, W, H, OUTW, OUT] = process.argv.slice(2);
const full = { w: Number(FW), h: Number(FH) };
const frame = { x: Number(X0), y: Number(Y0), w: Number(W), h: Number(H) };
const outW = Number(OUTW);
const T = 256;
// Zoomify tiers: halve until the image fits one tile; tier 0 is the smallest.
const tiers = [];
for (let w = full.w, h = full.h; ; w = Math.ceil(w / 2), h = Math.ceil(h / 2)) {
  tiers.unshift({ w, h, tx: Math.ceil(w / T), ty: Math.ceil(h / T) });
  if (w <= T && h <= T) break;
}
const before = [];
let acc = 0;
for (const t of tiers) { before.push(acc); acc += t.tx * t.ty; }
// The smallest tier at which the frame is still >= the output width.
let ti = tiers.length - 1;
while (ti > 0 && (frame.w * tiers[ti - 1].w) / full.w >= outW) ti--;
const tier = tiers[ti];
const s = tier.w / full.w;
const fx = Math.floor(frame.x * s), fy = Math.floor(frame.y * s);
const fw = Math.round(frame.w * s), fh = Math.round(frame.h * s);
if (fw < outW) throw new Error(`tier ${ti} gives only ${fw} px across — below the output ${outW}; refusing to upscale`);
const x0 = Math.floor(fx / T), x1 = Math.floor((fx + fw - 1) / T), y0 = Math.floor(fy / T), y1 = Math.floor((fy + fh - 1) / T);
console.log(`tier ${ti} (${tier.w}×${tier.h}), frame ${fw}×${fh} px, tiles ${x1 - x0 + 1}×${y1 - y0 + 1}`);
const tiles = [];
for (let y = y0; y <= y1; y++)
  for (let x = x0; x <= x1; x++) {
    const g = Math.floor((x + y * tier.tx + before[ti]) / 256);
    const url = `https://cdn.esahubble.org/archives/images/zoomable/${id}/TileGroup${g}/${ti}-${x}-${y}.jpg`;
    tiles.push({ x, y, url });
  }
const fetched = [];
for (let i = 0; i < tiles.length; i += 16) {
  const batch = await Promise.all(tiles.slice(i, i + 16).map(async (t) => {
    const r = await fetch(t.url, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!r.ok) throw new Error(`${r.status} ${t.url}`);
    return { ...t, buf: Buffer.from(await r.arrayBuffer()) };
  }));
  fetched.push(...batch);
}
const cw = (x1 - x0 + 1) * T, ch = (y1 - y0 + 1) * T;
const canvas = await sharp({ create: { width: cw, height: ch, channels: 3, background: "#000" } })
  .composite(fetched.map((t) => ({ input: t.buf, left: (t.x - x0) * T, top: (t.y - y0) * T })))
  .png().toBuffer();
await sharp(canvas)
  .extract({ left: fx - x0 * T, top: fy - y0 * T, width: Math.min(fw, cw - (fx - x0 * T)), height: Math.min(fh, ch - (fy - y0 * T)) })
  .resize({ width: outW })
  .jpeg({ quality: 92, mozjpeg: true })
  .toFile(OUT);
const m = await sharp(OUT).metadata();
console.log(`→ ${OUT}  ${m.width}×${m.height}`);
