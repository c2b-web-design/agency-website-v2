/** THE MOVING SOFTBOX, MEASURED ALONG ITS WHOLE PATH (D-088, 12 October 2026 — Carl: the label "4.5:1 … On the light motion";
 *  "lit but not to the extent where parts are blown out"). /proto/button with the light FROZEN (?mt=) at points along its
 *  travel; at each: the label hidden, the bare metal behind the words read pixel by pixel → the WORST contrast against the
 *  ink; and over the whole pill, pixels with any channel ≥ 250 (blown). Verdict: the worst point on the path.
 *  Usage: node …/whoweare-light-path-measure.mjs ["extra=query"]   ⚠ NOT WATCHED: between the sampled points; DPR ≠ 1. */
import { chromium } from "playwright";
const BASE = "http://localhost:3000/proto/button?studio=teal&light=0&floor=0.6&fill=0.5&label=0" + (process.argv[2] ? "&" + process.argv[2] : "");
const INK = [0xcf, 0xe6, 0xff];
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const p = await (await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 })).newPage();
const read = (b64, inkL) => p.evaluate(async ({ b64, inkL }) => {
  const img = new Image(); img.src = "data:image/png;base64," + b64; await img.decode();
  const c = document.createElement("canvas"); c.width = img.width; c.height = img.height;
  const g = c.getContext("2d"); g.drawImage(img, 0, 0); const d = g.getImageData(0, 0, c.width, c.height).data;
  const lin = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
  let worst = Infinity, blown = 0, peak = 0;
  for (let i = 0; i < d.length; i += 4) {
    const L = 0.2126 * lin(d[i]) + 0.7152 * lin(d[i + 1]) + 0.0722 * lin(d[i + 2]);
    worst = Math.min(worst, (Math.max(inkL, L) + 0.05) / (Math.min(inkL, L) + 0.05));
    const m = Math.max(d[i], d[i + 1], d[i + 2]); peak = Math.max(peak, m); if (m >= 250) blown++;
  }
  return { worst, blown, peak };
}, { b64, inkL });
const lin = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
const inkL = 0.2126 * lin(INK[0]) + 0.7152 * lin(INK[1]) + 0.0722 * lin(INK[2]);
let worstAll = Infinity, blownAll = 0;
for (let i = 0; i <= 8; i++) {
  const t = i / 8;
  await p.goto(`${BASE}&mt=${t}`, { waitUntil: "networkidle" });
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(1500);
  const r = await p.evaluate(() => { const s = document.querySelector("#whoweare-pill span").getBoundingClientRect(); return { x: s.x, y: s.y, w: s.width, h: s.height }; });
  const text = await read((await p.screenshot({ clip: { x: Math.round(r.x + 24), y: Math.round(r.y + 10), width: Math.round(r.w - 48), height: Math.round(r.h - 20) } })).toString("base64"), inkL);
  const pill = await read((await p.screenshot({ clip: { x: Math.round(r.x), y: Math.round(r.y), width: Math.round(r.w), height: Math.round(r.h) } })).toString("base64"), inkL);
  worstAll = Math.min(worstAll, text.worst); blownAll = Math.max(blownAll, pill.blown);
  console.log(`t ${t.toFixed(3)}  label worst ${text.worst.toFixed(2)}:1  ${text.worst >= 4.5 ? "✅" : "⛔"}   blown ${pill.blown} (peak ${pill.peak}) ${pill.blown === 0 ? "✅" : "⛔"}`);
}
await b.close();
console.log(`VERDICT along the path: label worst ${worstAll.toFixed(2)}:1 ${worstAll >= 4.5 ? "✅" : "⛔"}; blown at worst ${blownAll} ${blownAll === 0 ? "✅" : "⛔"}`);
console.log("   ⚠ NOT WATCHED: between the 9 sampled points; DPR other than 1; Carl's display.");
