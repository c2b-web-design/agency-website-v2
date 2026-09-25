/**
 * THE FLOOR PAIR'S GRADIENT — the colour along each rim, left to right. 25 September 2026 (third session).
 * For CS's top rim and CD's bottom rim: at five points across the card, the brightest pixel across the tube
 * (the core) and the pixel 10 px outside it (the glow). Reads saved frames (device px).
 *   node --no-warnings project-intelligence/live-work/scripts/floor-gradient-sample.mjs <frame.png> ...
 * ⚠ NOT WATCHED: motion; Carl's eye.
 */
import sharp from "sharp";
const hue = ([r, g, b]) => { const R = r / 255, G = g / 255, B = b / 255, mx = Math.max(R, G, B), mn = Math.min(R, G, B), d = mx - mn; if (!d) return 0; const h = mx === R ? ((G - B) / d) % 6 : mx === G ? (B - R) / d + 2 : (R - G) / d + 4; return (h * 60 + 360) % 360; };
const hex = (c) => "#" + c.map((v) => v.toString(16).padStart(2, "0")).join("");
/* [x, yFrom, yTo, glowStep] — CS's top rim slopes down to the right; CD's bottom rim slopes up. glowStep: +down/-up. */
const RIMS = {
  CS: [[640, 60, 100, -10], [740, 65, 110, -10], [840, 75, 120, -10], [940, 85, 130, -10], [1040, 100, 150, -10]],
  CD: [[660, 830, 870, 10], [740, 825, 865, 10], [820, 820, 860, 10], [900, 815, 855, 10], [975, 805, 850, 10]],
};
for (const f of process.argv.slice(2)) {
  const { data, info } = await sharp(f).raw().toBuffer({ resolveWithObject: true });
  const at = (x, y) => { const o = (y * info.width + x) * info.channels; return [data[o], data[o + 1], data[o + 2]]; };
  console.log(`\n${f.split("/").pop()}`);
  for (const [id, pts] of Object.entries(RIMS)) {
    const cells = pts.map(([x, y0, y1, g]) => {
      let by = y0, bl = -1;
      for (let y = y0; y <= y1; y++) { const c = at(x, y); const l = c[0] + c[1] + c[2]; if (l > bl) { bl = l; by = y; } }
      const core = at(x, by), glow = at(x, by + g);
      return `${hex(core)}/${hex(glow)} ${hue(glow).toFixed(0).padStart(3)}°`;
    });
    console.log(`  ${id} core/glow L→R: ${cells.join("  ")}`);
  }
}
