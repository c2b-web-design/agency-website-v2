/** WHERE THE TRAVELLER BLOOMS (15 October 2026, session 3). Carl: "On the card that says "better quality enquiries" the
 *  light starts to bloom… The same problem happens on "premium new website" card."
 *  /start at Carl's screen (1920 × 952, DPR 1 → zoom 1.36), Q5, at rest: each card's FACE (its hover box inset 12 px, so
 *  the rim is excluded) sampled every ~120 ms across 16 s (> one 13.85 s cycle) — the mean and the 99th percentile luma,
 *  plus the share of pixels ≥ 235 (the "bloom": a blown highlight). Frames at each card's peak are written.
 *  Usage: node …/traveller-bloom-measure-15-october.mjs <outDir> [query]
 *  ⚠ NOT WATCHED: Carl's GPU and Chrome; the light's phase (wall-clock only); hover and selection. */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
const [OUT, Q = ""] = process.argv.slice(2);
mkdirSync(OUT, { recursive: true });
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const ctx = await b.newContext({ viewport: { width: 1920, height: 952 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto("http://localhost:3000/start" + Q, { waitUntil: "load" });
await p.waitForTimeout(9000);
await p.getByRole("button", { name: /begin/i }).click();
const grid = p.locator(".enquiry-answer-grid");
await grid.waitFor({ state: "visible", timeout: 30000 });
await p.mouse.move(5, 5);
await p.waitForTimeout(3000);
const boxes = [];
for (let i = 0; i < 5; i++) boxes.push(await p.getByTestId(`answer-card-hover-${i}`).boundingBox());
const g = await grid.boundingBox();
const clip = { x: Math.floor(g.x) - 8, y: Math.floor(g.y) - 8, width: Math.ceil(g.width) + 16, height: Math.ceil(g.height) + 16 };
const rows = [];
const best = [0, 0, 0, 0, 0].map(() => ({ p99: -1, png: null, t: 0 }));
const bestEnd = [0, 0, 0, 0, 0].map(() => ({ v: -1, png: null, t: 0 }));
const t0 = Date.now();
while (Date.now() - t0 < 16000) {
  const png = await p.screenshot({ clip });
  const t = Date.now() - t0;
  const { data, info } = await sharp(png).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const row = { t };
  boxes.forEach((bx, i) => {
    const x0 = Math.round(bx.x - clip.x) + 12, x1 = Math.round(bx.x + bx.width - clip.x) - 12;
    const y0 = Math.round(bx.y - clip.y) + 12, y1 = Math.round(bx.y + bx.height - clip.y) - 12;
    const ls = [];
    let lq = 0, rq = 0, nq = 0;
    const q = Math.floor((x1 - x0) / 4);
    for (let y = y0; y < y1; y++)
      for (let x = x0; x < x1; x++) {
        const o = (y * info.width + x) * 3;
        const l = 0.2126 * data[o] + 0.7152 * data[o + 1] + 0.0722 * data[o + 2];
        ls.push(l);
        if (x < x0 + q) { lq += l; nq++; }
        if (x >= x1 - q) rq += l;
      }
    ls.sort((a, c) => a - c);
    const mean = ls.reduce((s, v) => s + v, 0) / ls.length;
    const p99 = ls[Math.floor(ls.length * 0.99)];
    const blown = ls.filter((v) => v >= 235).length / ls.length;
    // lq / rq: the face's LEFT and RIGHT end quarters (no text there) — where the bend patches sit.
    row[`c${i + 1}`] = { mean: +mean.toFixed(1), p99: +p99.toFixed(0), blown: +(blown * 100).toFixed(2), lq: +(lq / nq).toFixed(1), rq: +(rq / nq).toFixed(1) };
    if (p99 > best[i].p99) best[i] = { p99, png, t };
    const endV = Math.max(lq / nq, rq / nq);
    if (endV > bestEnd[i].v) bestEnd[i] = { v: endV, png, t };
  });
  rows.push(row);
}
writeFileSync(join(OUT, "samples.json"), JSON.stringify(rows));
for (let i = 0; i < 5; i++) await sharp(best[i].png).toFile(join(OUT, `peak-card${i + 1}.png`));
for (let i = 0; i < 5; i++) await sharp(bestEnd[i].png).resize({ width: 1600, kernel: "nearest" }).toFile(join(OUT, `end-peak-card${i + 1}.png`));
console.log(`${rows.length} samples over ${rows.at(-1).t} ms`);
for (let i = 1; i <= 5; i++) {
  const s = rows.map((r) => r[`c${i}`]);
  const m = (k) => Math.max(...s.map((v) => v[k]));
  const lo = (k) => Math.min(...s.map((v) => v[k]));
  console.log(`card ${i}: mean ${lo("mean")}–${m("mean")}  left end ${lo("lq")}–${m("lq")}  right end ${lo("rq")}–${m("rq")}  p99 ${lo("p99")}–${m("p99")}  (peak at ${best[i - 1].t} ms)`);
}
console.log("⚠ NOT WATCHED: Carl's GPU/Chrome, the light's phase, hover/selection. →", OUT);
await b.close();
