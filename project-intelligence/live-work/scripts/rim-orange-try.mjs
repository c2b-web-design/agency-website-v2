/**
 * THE WALL PAIR'S RIMS IN THE ROOM'S ORANGE — candidate settings, each profiled against the strip. 25 September 2026
 * (third session). Carl: the rims ECHO the room's orange neon (*"We should join with orange neon"*). Each case
 * loads plain /about with the neon held ON (`?neon=full`), the moving light held off the cards (`?lmfreeze=0.45`),
 * helpers off, then prints CA's top-rim cross-section (the same method as `rim-strip-profile.mjs`) beside the
 * strip's. Frames saved per case.
 *   node --no-warnings project-intelligence/live-work/scripts/rim-orange-try.mjs "<label>=<query>" ...
 * ⚠ NOT WATCHED: the ignition (held on); motion; CB (same values as CA); Carl's eye.
 */
import { chromium } from "playwright";
import sharp from "sharp";
import { mkdirSync } from "node:fs";

const out = "project-intelligence/live-work/screenshots/rim-orange-25-september";
mkdirSync(out, { recursive: true });
const hex = (c) => "#" + c.map((v) => v.toString(16).padStart(2, "0")).join("");
const hue = ([r, g, b]) => {
  const R = r / 255, G = g / 255, B = b / 255, mx = Math.max(R, G, B), mn = Math.min(R, G, B), d = mx - mn;
  if (!d) return 0;
  const h = mx === R ? ((G - B) / d) % 6 : mx === G ? (B - R) / d + 2 : (R - G) / d + 4;
  return (h * 60 + 360) % 360;
};
const OFFS = [-24, -16, -8, -4, 0, 4, 8, 16, 24];
async function profile(png, x, y0, y1) {
  const { data, info } = await sharp(png).raw().toBuffer({ resolveWithObject: true });
  const at = (xx, y) => { const o = (y * info.width + xx) * info.channels; return [data[o], data[o + 1], data[o + 2]]; };
  let by = y0, bl = -1;
  for (let y = y0; y <= y1; y++) { const c = at(x, y); const l = c[0] + c[1] + c[2]; if (l > bl) { bl = l; by = y; } }
  return OFFS.map((d) => { const c = at(x, by + d); return `${hex(c)} ${hue(c).toFixed(0).padStart(3)}°`; });
}

const cases = process.argv.slice(2).map((a) => { const i = a.indexOf("="); return [a.slice(0, i), a.slice(i + 1)]; });
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const ctx = await b.newContext({ viewport: { width: 1412, height: 700 }, deviceScaleFactor: 1.36 });
console.log(`offset px:            ${OFFS.map((d) => String(d).padStart(12)).join("")}`);
let stripDone = false;
for (const [label, q] of cases) {
  const p = await ctx.newPage();
  await p.goto(`http://localhost:3000/about?lighthelpers=0&lmfreeze=0.45&neon=full${q ? "&" + q : ""}#roles`, { waitUntil: "networkidle" });
  await p.waitForTimeout(3000);
  const png = await p.screenshot({ path: `${out}/${label}.png` });
  await p.close();
  if (!stripDone) { console.log(`ROOM STRIP (x=700)    ${(await profile(png, 700, 215, 265)).map((s) => s.padStart(12)).join("")}`); stripDone = true; }
  console.log(`${label.padEnd(22)}${(await profile(png, 600, 290, 325)).map((s) => s.padStart(12)).join("")}`);
}
await b.close();
