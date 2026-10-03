/**
 * THE STATIC RIG, SWEPT — 3 October 2026. Carl: "When text is under them its barely legible… A postion change or
 * lowering the intensity would br better. The moving light does a lot to highlight the face 3D qualities the
 * staitic light should add to this slightly."
 *
 * Moving light at 0 (`lmexp=0`), rims full, text static, 6 s settle. Per setting, two loads (text / `text=0`):
 *   band    = mean luma over the band strip on BARE glass, minus the same with the rig off (`lmglobal=0`)
 *   card    = median |text − bare| over the card's text pixels (how far the words stand off the glass)
 *   inband  = the same over text pixels INSIDE the band strip;  ratio = inband ÷ card (< 1: the band eats words)
 * Text pixels are fixed once, from the DEFAULT rig pair, so every setting is read at the same letters.
 * ⚠ NOT WATCHED: the moving light coinciding (run next); CB/CD; whether it READS — Carl's eye.
 *   node --no-warnings project-intelligence/live-work/scripts/static-rig-sweep-3-october.mjs
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import sharp from "sharp";

const out = "project-intelligence/live-work/screenshots/static-rig-sweep-3-october";
mkdirSync(out, { recursive: true });
const STRIP = { CA: [450, 300, 760, 345], CS: [640, 90, 1040, 160] };
const BOX = { CS: [590, 60, 1090, 250], CA: [395, 290, 810, 535] };
const SETTINGS = (process.argv[2] ? JSON.parse(process.argv[2]) : {
  "rig off": "lmglobal=0",
  "default (key 0.5, fill 2.6)": "",
  "key only": "filli=0",
  "fill only": "keyi=0",
  "both x0.5": "keyi=0.25&filli=1.3",
  "both x0.3": "keyi=0.15&filli=0.78",
});

const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const ctx = await b.newContext({ viewport: { width: 1412, height: 700 }, deviceScaleFactor: 1.36 });
async function luma(q, save) {
  const p = await ctx.newPage();
  await p.goto(`http://localhost:3000/about?lighthelpers=0&neon=full&seq=ca,cb,cd,cs&textstatic=1&lmexp=0&${q}#roles`, { waitUntil: "networkidle" });
  await p.waitForTimeout(6000);
  const png = await p.screenshot(save ? { path: save } : {});
  await p.close();
  const { data, info } = await sharp(png).raw().toBuffer({ resolveWithObject: true });
  const L = new Float32Array(info.width * info.height);
  for (let i = 0; i < L.length; i++) { const o = i * info.channels; L[i] = 0.2126 * data[o] + 0.7152 * data[o + 1] + 0.0722 * data[o + 2]; }
  return { L, w: info.width };
}
const median = (a) => { if (!a.length) return NaN; const s = [...a].sort((x, y) => x - y); return s[s.length >> 1]; };
const inStrip = (i, w, [x0, y0, x1, y1]) => { const x = i % w, y = Math.floor(i / w); return x >= x0 && x < x1 && y >= y0 && y < y1; };

const refT = await luma("");
const refB = await luma("text=0");
const mask = {};
for (const [id, [x0, y0, x1, y1]] of Object.entries(BOX)) {
  mask[id] = [];
  for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) { const i = y * refT.w + x; if (Math.abs(refT.L[i] - refB.L[i]) > 12) mask[id].push(i); }
}
const stripMean = (r, [x0, y0, x1, y1]) => { let s = 0, n = 0; for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) { s += r.L[y * r.w + x]; n++; } return s / n; };

let off = null;
for (const [name, q] of Object.entries(SETTINGS)) {
  const slug = name.replace(/[^a-z0-9]+/gi, "-");
  const t = await luma(q, `${out}/${slug}.png`);
  const bare = await luma(`${q}&text=0`);
  const bandNow = Object.fromEntries(Object.entries(STRIP).map(([id, s]) => [id, stripMean(bare, s)]));
  if (!off) off = bandNow;
  const cells = Object.keys(BOX).map((id) => {
    const all = mask[id].map((i) => Math.abs(t.L[i] - bare.L[i]));
    const band = mask[id].filter((i) => inStrip(i, t.w, STRIP[id])).map((i) => Math.abs(t.L[i] - bare.L[i]));
    const card = median(all), inb = median(band);
    return `${id} band +${(bandNow[id] - off[id]).toFixed(1).padStart(4)} · card ${card.toFixed(1).padStart(4)} · inband ${inb.toFixed(1).padStart(4)} (${(inb / card).toFixed(2)})`;
  });
  console.log(`${name.padEnd(30)} | ${cells.join(" | ")}`);
}
await b.close();
