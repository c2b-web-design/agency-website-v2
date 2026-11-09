// Compares two workshop-measure runs' PNGs, pixel by pixel (8-bit RGB), over the canvas only (the overlay's text and the
// bench's 10 Hz readout are outside it or masked by the caller's crop). Prints: differing pixels, max |Δ|, mean |Δ|.
// usage: node workshop-compare-9-november.mjs <runA> <runB> <name> [x y w h]
// ⚠ NOT WATCHED: anything outside the crop; colour spaces (both PNGs are the browser's screenshot, compared as stored).
import { chromium } from "file:///C:/Users/Carl Buckley/agency-website-v2/node_modules/playwright/index.mjs";
import { readFileSync } from "node:fs";
import { join } from "node:path";
const [A, B, name, ...crop] = process.argv.slice(2);
const a = readFileSync(join(A, `${name}.png`)).toString("base64");
const b = readFileSync(join(B, `${name}.png`)).toString("base64");
const br = await chromium.launch();
const p = await br.newPage();
const r = await p.evaluate(async ({ a, b, crop }) => {
  const load = (s) => new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.src = `data:image/png;base64,${s}`; });
  const [ia, ib] = await Promise.all([load(a), load(b)]);
  const [x, y, w, h] = crop.length === 4 ? crop.map(Number) : [0, 0, ia.width, ia.height];
  const px = (img) => { const c = new OffscreenCanvas(img.width, img.height); const g = c.getContext("2d"); g.drawImage(img, 0, 0); return g.getImageData(x, y, w, h).data; };
  const da = px(ia), db = px(ib);
  let n = 0, max = 0, sum = 0;
  const bbox = [Infinity, Infinity, -1, -1];
  for (let i = 0; i < da.length; i += 4) {
    const d = Math.max(Math.abs(da[i] - db[i]), Math.abs(da[i + 1] - db[i + 1]), Math.abs(da[i + 2] - db[i + 2]));
    sum += Math.abs(da[i] - db[i]) + Math.abs(da[i + 1] - db[i + 1]) + Math.abs(da[i + 2] - db[i + 2]);
    if (d > 0) {
      n++;
      const k = i / 4, px_ = k % w, py = Math.floor(k / w);
      bbox[0] = Math.min(bbox[0], px_); bbox[1] = Math.min(bbox[1], py); bbox[2] = Math.max(bbox[2], px_); bbox[3] = Math.max(bbox[3], py);
    }
    max = Math.max(max, d);
  }
  return { size: [ia.width, ia.height], crop: [x, y, w, h], differing: n, maxDelta: max, meanDelta: +(sum / (da.length / 4) / 3).toFixed(4), bbox: n ? bbox.map((v, i) => v + (i % 2 ? y : x)) : null };
}, { a, b, crop });
console.log(name, JSON.stringify(r));
await br.close();
