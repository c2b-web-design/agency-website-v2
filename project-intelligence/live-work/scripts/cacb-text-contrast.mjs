/**
 * CA vs CB — how bright the text is, how bright the glass behind it is, and the difference. 25 September 2026
 * (third session). Carl: CB's text *"is feinter but blows out more. Can you even up the brightness without it
 * blowing out all the more?"* Each case renders plain /about (rims lit, text static) twice — with the text and
 * without (`?text=0`) — and reads the text's pixels (from a mask where the two differ by > 12 luma under the
 * quiet case). Per card: median text luma, median glass luma at the same pixels, contrast, and the share of text
 * pixels within 8 luma of the glass ("faint").
 *   node --no-warnings project-intelligence/live-work/scripts/cacb-text-contrast.mjs "<label>=<query>" ...
 * ⚠ NOT WATCHED: motion; Carl's eye; the 8-luma line is a guide, not a legibility standard.
 */
import { chromium } from "playwright";
import sharp from "sharp";

const BOX = { CA: [395, 290, 810, 535], CB: [860, 325, 1170, 535] };
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const ctx = await b.newContext({ viewport: { width: 1412, height: 700 }, deviceScaleFactor: 1.36 });
async function luma(q) {
  const p = await ctx.newPage();
  await p.goto(`http://localhost:3000/about?lighthelpers=0&neon=full&${q}#roles`, { waitUntil: "networkidle" });
  await p.waitForTimeout(2500);
  const png = await p.screenshot();
  await p.close();
  const { data, info } = await sharp(png).raw().toBuffer({ resolveWithObject: true });
  const L = new Float32Array(info.width * info.height);
  for (let i = 0; i < L.length; i++) { const o = i * info.channels; L[i] = 0.2126 * data[o] + 0.7152 * data[o + 1] + 0.0722 * data[o + 2]; }
  return { L, w: info.width };
}
const med = (a) => { const s = [...a].sort((x, y) => x - y); return s[s.length >> 1]; };
await luma("lmfreeze=0.45"); // warm-up: the first load in a context lands before the #roles scroll
const cases = process.argv.slice(2).map((a) => { const i = a.indexOf("="); return [a.slice(0, i), a.slice(i + 1)]; });
let mask = null;
for (const [label, q] of cases) {
  const on = await luma(q), off = await luma(`${q}&text=0`);
  if (!mask) {
    mask = {};
    for (const [id, [x0, y0, x1, y1]] of Object.entries(BOX)) {
      mask[id] = [];
      for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) { const i = y * on.w + x; if (Math.abs(on.L[i] - off.L[i]) > 12) mask[id].push(i); }
    }
  }
  const row = Object.entries(mask).map(([id, px]) => {
    const t = px.map((i) => on.L[i]), g = px.map((i) => off.L[i]), d = px.map((i) => Math.abs(on.L[i] - off.L[i]));
    return `${id} text ${med(t).toFixed(0).padStart(3)} · glass ${med(g).toFixed(0).padStart(3)} · contrast ${med(d).toFixed(1).padStart(5)} · faint ${((100 * d.filter((v) => v < 8).length) / d.length).toFixed(0).padStart(2)}%`;
  });
  console.log(`${label.padEnd(20)} ${row.join("   |   ")}`);
}
await b.close();
