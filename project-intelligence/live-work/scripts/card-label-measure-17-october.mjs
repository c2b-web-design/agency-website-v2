/** Measures the cards' label GLYPH CORES from card-label-rest-17-october.mjs's frames (17 October 2026).
 *  Per card: a ±9 px band on the label's row, ±110 px about the card's centre (inside the rim, which sits at ±125);
 *  pixels with luminance > 140 are glyph (the satin body reads ~30–60); the CORE is the brightest 30% of those.
 *  Reported as the median core RGB per card over all eight frames (the traveller moves through them), and the
 *  frame-to-frame spread, against ice blue #CFE6FF (207, 230, 255).
 *  Usage: node …/card-label-measure-17-october.mjs <dir written by the capture>
 *  ⚠ NOT WATCHED: anti-aliased edges (the core only); hover/selection; what the eye reads at 600 weight. */
import sharp from "sharp";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const [DIR] = process.argv.slice(2);
const { grid, clip } = JSON.parse(readFileSync(join(DIR, "grid.json"), "utf8"));
const lum = (r, g, b) => 0.2126 * r + 0.7152 * g + 0.0722 * b;
const med = (a) => a.slice().sort((x, y) => x - y)[Math.floor(a.length / 2)];
// Two rows, three over two — centres as fractions of the grid (measured off the frame, 17 Oct).
const cards = [
  [1 / 6, 0.25], [1 / 2, 0.25], [5 / 6, 0.25],
  [1 / 3, 0.75], [2 / 3, 0.75],
].map(([fx, fy]) => ({ cx: grid.x + grid.w * fx - clip.x, cy: grid.y + grid.h * fy - clip.y }));

const perCard = cards.map(() => []);
for (let f = 0; f < 8; f++) {
  const { data, info } = await sharp(join(DIR, `grid-${f}.png`)).raw().toBuffer({ resolveWithObject: true });
  cards.forEach((c, i) => {
    const px = [];
    for (let y = Math.round(c.cy - 9); y <= Math.round(c.cy + 9); y++)
      for (let x = Math.round(c.cx - 110); x <= Math.round(c.cx + 110); x++) {
        const o = (y * info.width + x) * info.channels;
        const r = data[o], g = data[o + 1], b = data[o + 2];
        if (lum(r, g, b) > 140) px.push([r, g, b]);
      }
    px.sort((a, b) => lum(...b) - lum(...a));
    const core = px.slice(0, Math.max(1, Math.floor(px.length * 0.3)));
    perCard[i].push([0, 1, 2].map((k) => med(core.map((p) => p[k]))));
  });
}
const names = ["Premium new website", "Current site feels dated", "Better quality enquiries", "Less manual admin", "Not sure yet"];
perCard.forEach((frames, i) => {
  const m = [0, 1, 2].map((k) => med(frames.map((f) => f[k])));
  const lo = [0, 1, 2].map((k) => Math.min(...frames.map((f) => f[k])));
  const hi = [0, 1, 2].map((k) => Math.max(...frames.map((f) => f[k])));
  console.log(`${names[i].padEnd(26)} core median rgb(${m.join(", ")})   frames ${lo.join("/")} → ${hi.join("/")}`);
});
console.log("target ice blue           rgb(207, 230, 255)");
console.log("⚠ NOT WATCHED: anti-aliased edges; hover/selection; the eye's read of the whole word.");
