/**
 * THE ROOM'S ORANGE STRIP vs THE RIM — a cross-section of each. 25 September 2026 (third session). Carl: the rims
 * should ECHO the room's own orange neon (*"We should join with orange neon, it would be wise my friend"*).
 * For a vertical line through the strip (and through CA's top rim), find the brightest row, then print the colour
 * at offsets above and below it: the CORE, and how the GLOW falls off. Reads a saved frame (device px).
 *   node --no-warnings project-intelligence/live-work/scripts/rim-strip-profile.mjs <frame.png>
 * ⚠ NOT WATCHED: the strip in motion (it is a photograph — it does not move); Carl's eye.
 */
import sharp from "sharp";

const file = process.argv[2];
const { data, info } = await sharp(file).raw().toBuffer({ resolveWithObject: true });
const at = (x, y) => { const o = (y * info.width + x) * info.channels; return [data[o], data[o + 1], data[o + 2]]; };
const hex = (c) => "#" + c.map((v) => v.toString(16).padStart(2, "0")).join("");
const hsl = ([r, g, b]) => {
  const R = r / 255, G = g / 255, B = b / 255, mx = Math.max(R, G, B), mn = Math.min(R, G, B), l = (mx + mn) / 2, d = mx - mn;
  if (!d) return [0, 0, l];
  const s = d / (1 - Math.abs(2 * l - 1));
  const h = mx === R ? ((G - B) / d) % 6 : mx === G ? (B - R) / d + 2 : (R - G) / d + 4;
  return [(h * 60 + 360) % 360, s, l];
};
const fmt = (c) => { const [h, s, l] = hsl(c); return `${hex(c)}  ${h.toFixed(0).padStart(3)}°  sat ${s.toFixed(2)}  lum ${l.toFixed(2)}`; };

function profile(name, x, y0, y1) {
  let by = y0, bl = -1;
  for (let y = y0; y <= y1; y++) { const c = at(x, y); const l = c[0] + c[1] + c[2]; if (l > bl) { bl = l; by = y; } }
  console.log(`\n${name} — column x=${x}, core at y=${by}`);
  for (const d of [-24, -16, -8, -4, -2, 0, 2, 4, 8, 16, 24]) console.log(`  ${String(d).padStart(4)} px  ${fmt(at(x, by + d))}`);
}
/* The strip crosses the back wall between CS and the wall pair; three columns along it. CA's top rim for contrast. */
profile("ROOM STRIP (left)", 450, 195, 240);
profile("ROOM STRIP (centre)", 700, 215, 265);
profile("ROOM STRIP (right)", 1000, 240, 290);
profile("CA TOP RIM", 600, 290, 325);
