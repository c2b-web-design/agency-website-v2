/**
 * THE FLAT WHITE MARK AS A SOURCE FOR A three.js OBJECT — 27 September 2026. Carl: "How hard will it be to make a
 * three js object out of this? Using the other logos as a reference." The gold/blue renders are a rounded TUBE run
 * along the silhouette's OUTLINE, so what matters is: how many outlines, and how thin the strokes and gaps get
 * (a tube wider than a gap would merge with its neighbour).
 *   node --no-warnings project-intelligence/live-work/scripts/logo-silhouette-measure.mjs
 * ⚠ Run-length widths along rows and columns — a guide to the thinnest feature, not a medial-axis measurement.
 */
import sharp from "sharp";
const { data, info } = await sharp("brand-assets/logo/c2b-flat-white-alpha-cleaned-1x.png").ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const W = info.width, H = info.height;
const on = (x, y) => data[(y * W + x) * 4 + 3] > 127;
// bounding box
let x0 = W, x1 = 0, y0 = H, y1 = 0;
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (on(x, y)) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
// connected components (4-neighbour) of opaque, and of transparent (holes = not touching the border)
const label = new Int32Array(W * H).fill(-1);
const comps = [];
for (let s = 0; s < W * H; s++) {
  if (label[s] !== -1) continue;
  const val = on(s % W, Math.floor(s / W));
  const stack = [s]; label[s] = comps.length; let n = 0, border = false;
  while (stack.length) {
    const i = stack.pop(); n++;
    const x = i % W, y = Math.floor(i / W);
    if (x === 0 || y === 0 || x === W - 1 || y === H - 1) border = true;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
      const j = ny * W + nx;
      if (label[j] === -1 && on(nx, ny) === val) { label[j] = comps.length; stack.push(j); }
    }
  }
  comps.push({ val, n, border });
}
const solids = comps.filter((c) => c.val && c.n > 50), holes = comps.filter((c) => !c.val && !c.border && c.n > 50);
// run lengths: opaque runs = stroke widths, interior transparent runs (between opaque) = gaps
const strokes = [], gaps = [];
const scan = (len, get) => { let run = 0, seenOn = false, gapRun = 0; for (let k = 0; k < len; k++) { const v = get(k); if (v) { if (gapRun && seenOn) gaps.push(gapRun); gapRun = 0; run++; seenOn = true; } else { if (run) strokes.push(run); run = 0; if (seenOn) gapRun++; } } if (run) strokes.push(run); };
for (let y = y0; y <= y1; y++) scan(W, (x) => on(x, y));
for (let x = x0; x <= x1; x++) scan(H, (y) => on(x, y));
const pct = (a, q) => { const s = [...a].sort((p, q2) => p - q2); return s[Math.floor(q * (s.length - 1))]; };
console.log(`image ${W}×${H} · mark ${x1 - x0 + 1}×${y1 - y0 + 1} px`);
console.log(`solid pieces: ${solids.length} · enclosed holes: ${holes.length} → closed outlines to sweep a tube along: ${solids.length + holes.length}`);
console.log(`stroke run widths (px): 5th pct ${pct(strokes, 0.05)} · median ${pct(strokes, 0.5)} · max ${Math.max(...strokes)}`);
console.log(`interior gap runs (px): min ${Math.min(...gaps)} · 5th pct ${pct(gaps, 0.05)} · median ${pct(gaps, 0.5)}`);
