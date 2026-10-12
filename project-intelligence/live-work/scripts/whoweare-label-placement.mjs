/** THE EXTRUDED LABEL vs THE BROWSER'S OWN TEXT — placement check (D-088, 12 October 2026). Renders /proto/button with
 *  the flat DOM label (?text3d=0) and with the extruded one, at real size, DPR 2 for precision; finds the ink-coloured
 *  pixels (near #cfe6ff) in the label's box in each, and compares their bounding boxes and centroids.
 *  ⚠ NOT WATCHED: glyph shapes (outline fidelity), only where the ink lands; the zoomed views. */
import { chromium } from "playwright";
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
async function ink(q) {
  const p = await ctx.newPage();
  await p.goto("http://localhost:3000/proto/button" + q, { waitUntil: "networkidle" });
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(2500);
  const r = await p.evaluate(() => { const s = document.querySelector("#whoweare-pill span").getBoundingClientRect(); return { x: s.x, y: s.y, w: s.width, h: s.height }; });
  const png = await p.screenshot({ clip: { x: r.x, y: r.y, width: r.w, height: r.h } });
  return p.evaluate(async (b64) => {
    const img = new Image(); img.src = "data:image/png;base64," + b64; await img.decode();
    const c = document.createElement("canvas"); c.width = img.width; c.height = img.height;
    const g = c.getContext("2d"); g.drawImage(img, 0, 0); const d = g.getImageData(0, 0, c.width, c.height).data;
    let n = 0, sx = 0, sy = 0, x0 = 1e9, x1 = -1, y0 = 1e9, y1 = -1;
    for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) { const i = (y * c.width + x) * 4; if (d[i] > 150 && d[i + 1] > 180 && d[i + 2] > 200) { n++; sx += x; sy += y; x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); } }
    return { n, cx: sx / n / 2, cy: sy / n / 2, box: [x0 / 2, y0 / 2, x1 / 2, y1 / 2] };
  }, png.toString("base64"));
}
// ⚠ Q (e.g. "&light=0"): since pass 3 the key light puts a bright glint on the right end cap INSIDE this clip, which the
// ink threshold counts as letters and drags the centroid right (0.78 px on 12 October). Measure with the light off.
const Q = process.env.Q ?? "&light=0";
const dom = await ink("?text3d=0" + Q), ext = await ink("?" + Q.replace(/^&/, ""));
await b.close();
const f = (v) => v.toFixed(2);
console.log(`DOM text:      ${dom.n} ink px, centroid (${f(dom.cx)}, ${f(dom.cy)}), box ${dom.box.map(f).join(", ")}`);
console.log(`extruded text: ${ext.n} ink px, centroid (${f(ext.cx)}, ${f(ext.cy)}), box ${ext.box.map(f).join(", ")}`);
console.log(`offset: dx ${f(ext.cx - dom.cx)} px, dy ${f(ext.cy - dom.cy)} px (CSS px)`);
