/** FILM 04 — VIEWPORT 1's LAMPS, THE INTENSITY SWEPT (23 October 2026, session 2). Carl: "light it from the upper left and
 *  right". `/proto/your-words?lamp=<i>` at 1920 × 1080, DPR 1, viewport 1 only (scrolled to the top). Over a FIXED MASK of
 *  the letters (taken once from a bright render, max channel > 25 — pass 2's lesson): the mean luminance in fifths across
 *  the word, and the share of BLOWN pixels (any channel ≥ 250). `lamp=0` is the studio alone (the reference).
 *    node …/film04-your-words-lamps-23-october.mjs <base> [intensities comma-separated] [extra query] [dial: lamp | front | wing]
 *  ⚠ NOT WATCHED: how it looks; the lamps' placement and cone (by eye); Carl's GPU. */
import { chromium } from "playwright";
import sharp from "sharp";
const [BASE = "http://localhost:3000", LIST = "0,0.25,0.5,1,1.5,2,3", EXTRA = "", KEY = "lamp"] = process.argv.slice(2);
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const ctx = await b.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
const shot = async (q) => {
  const p = await ctx.newPage();
  await p.goto(`${BASE}/proto/your-words?${q}${EXTRA ? `&${EXTRA}` : ""}`, { waitUntil: "networkidle" });
  await p.waitForFunction(() => document.querySelector("[data-your-words]")?.dataset.yourWords === "drawn", null, { timeout: 60000 });
  await p.addStyleTag({ content: "nextjs-portal{display:none!important}" });
  await p.waitForTimeout(600);
  const { data, info } = await sharp(await p.screenshot()).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  await p.close();
  return { data, W: info.width, H: info.height };
};
const ref = await shot(`${KEY}=4`);
const mask = new Uint8Array(ref.W * ref.H);
let x0 = ref.W, x1 = 0, y0 = ref.H, y1 = 0;
for (let y = 0; y < ref.H / 2; y++) for (let x = 0; x < ref.W - 20; x++) { const i = (y * ref.W + x) * 3; if (Math.max(ref.data[i], ref.data[i + 1], ref.data[i + 2]) > 25) { mask[y * ref.W + x] = 1; x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); } }
console.log(`mask: x ${x0}–${x1}, y ${y0}–${y1} (the word's centre at ${(((y0 + y1) / 2 / ref.H) * 100).toFixed(1)}% of the window from the top; the upper third's middle is 16.7%)`);
for (const i of LIST.split(",")) {
  const s = await shot(`${KEY}=${i}`);
  const f = [0, 0, 0, 0, 0], n = [0, 0, 0, 0, 0];
  let blown = 0, all = 0, sum = 0;
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    if (!mask[y * s.W + x]) continue;
    const k = (y * s.W + x) * 3, L = 0.2126 * s.data[k] + 0.7152 * s.data[k + 1] + 0.0722 * s.data[k + 2];
    const band = Math.min(4, Math.floor(((x - x0) / (x1 - x0 + 1)) * 5));
    f[band] += L; n[band]++; sum += L; all++;
    if (Math.max(s.data[k], s.data[k + 1], s.data[k + 2]) >= 250) blown++;
  }
  console.log(`${KEY} ${i.padStart(4)}: fifths ${f.map((v, j) => (v / n[j]).toFixed(1).padStart(6)).join(" ")} · mean ${(sum / all).toFixed(1)} · blown ${((100 * blown) / all).toFixed(1)}%`);
}
await b.close();
