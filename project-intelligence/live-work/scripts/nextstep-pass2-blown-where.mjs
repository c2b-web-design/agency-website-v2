/** Where are the pass-2 near-clipped pixels? (14 October 2026) — the bare platinum blue pill (label off, face-on), every pixel with a channel ≥ 250 listed. ⚠ NOT WATCHED: the roll; the moving lamp. */
import { chromium } from "playwright";
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const p = await (await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 })).newPage();
await p.goto("http://localhost:3000/proto/button?member=next&mode=teal&paint=3f6db8&metalness=1&paintrough=0.4&ml=0&roll=1&label=0&rollat=0", { waitUntil: "load" });
await p.waitForSelector("#next-pill canvas"); await p.waitForTimeout(2500);
const r = await p.evaluate(() => { const c = document.querySelector("#next-pill canvas").getBoundingClientRect(); return { x: Math.round(c.x), y: Math.round(c.y), w: Math.round(c.width), h: Math.round(c.height) }; });
const png = await p.screenshot({ clip: { x: r.x, y: r.y, width: r.w, height: r.h } });
const out = await p.evaluate(async (b64) => {
  const img = new Image(); img.src = "data:image/png;base64," + b64; await img.decode();
  const c = document.createElement("canvas"); c.width = img.width; c.height = img.height; const g = c.getContext("2d"); g.drawImage(img, 0, 0);
  const d = g.getImageData(0, 0, c.width, c.height).data; const hits = [];
  for (let i = 0; i < d.length; i += 4) { if (Math.max(d[i], d[i + 1], d[i + 2]) >= 250) hits.push({ x: (i / 4) % c.width, y: Math.floor(i / 4 / c.width), rgb: [d[i], d[i + 1], d[i + 2]] }); }
  return { w: c.width, h: c.height, hits };
}, png.toString("base64"));
console.log(`canvas ${out.w}×${out.h}; ${out.hits.length} px ≥250:`, JSON.stringify(out.hits));
await b.close();
