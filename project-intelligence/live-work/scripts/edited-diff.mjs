import sharp from "file:///C:/Users/Carl%20Buckley/agency-website-v2/node_modules/sharp/lib/index.js";
const M = "C:/Users/Carl Buckley/agency-website-v2/brand-assets/office-image-3.jpg";
const E = "C:/Users/Carl Buckley/agency-website-v2/brand-assets/office-image-edited.png";
const OUT = "C:/Users/Carl Buckley/AppData/Local/Temp/claude/c--Users-Carl-Buckley-agency-website-v2/92ee830b-ab55-4531-8f34-9f40aaae896f/scratchpad";
const e = await sharp(E).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const W = e.info.width, H = e.info.height;
// master -> 1376x774, crop rows 3..771 (the measured mapping)
const m = await sharp(M).resize(W, 774, { kernel: "lanczos3" }).extract({ left: 0, top: 3, width: W, height: H }).raw().toBuffer({ resolveWithObject: true });
const lum = (d, i) => 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
const diff = Buffer.alloc(W * H), ratio = Buffer.alloc(W * H * 3);
for (let i = 0; i < W * H; i++) {
  const le = lum(e.data, i * 3), lm = lum(m.data, i * 3);
  diff[i] = Math.min(255, Math.abs(le - lm) * 3);
  // signed brightness change: red = brighter in edit, blue = darker
  const s = Math.max(-255, Math.min(255, (le - lm) * 3));
  ratio[i * 3] = s > 0 ? s : 0; ratio[i * 3 + 2] = s < 0 ? -s : 0; ratio[i * 3 + 1] = 0;
}
await sharp(diff, { raw: { width: W, height: H, channels: 1 } }).png().toFile(OUT + "/edited-absdiff.png");
await sharp(ratio, { raw: { width: W, height: H, channels: 3 } }).png().toFile(OUT + "/edited-signeddiff.png");
await sharp(m.data, { raw: { width: W, height: H, channels: 3 } }).png().toFile(OUT + "/master-registered.png");
// mean luminance, master vs edit, in named regions (edited px)
const regions = {
  "back wall, CA area (old TV)": [310, 250, 780, 420],
  "back wall, CB area (old shelf)": [620, 250, 880, 400],
  "back wall above cabinet, left": [190, 420, 640, 500],
  "right wall above desk": [920, 200, 1180, 400],
  "upper cabinet doors": [220, 60, 860, 140],
  "floor, centre": [300, 690, 700, 760],
  "left bookcase": [0, 150, 150, 420],
  "credenza drawers": [100, 545, 600, 670],
};
console.log("region".padEnd(34), "master  edit   ratio");
for (const [k, [x0, y0, x1, y1]] of Object.entries(regions)) {
  let a = 0, b = 0, n = 0; for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) { const i = (y * W + x) * 3; a += lum(m.data, i); b += lum(e.data, i); n++; }
  console.log(k.padEnd(34), (a / n).toFixed(1).padStart(6), (b / n).toFixed(1).padStart(6), (b / a).toFixed(2).padStart(6));
}
