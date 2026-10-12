/** A STILL-LIGHT SWEEP ON /proto/button (D-088, pass 3, 12 October 2026, session 2 — light take 10: the logo's look in teal on a
 *  curved surface). For each take (a query string): the label hidden → the WORST contrast of the ice-blue ink against every
 *  pixel behind the words (pass mark 4.5:1); over the whole pill → the blown pixels (any channel ≥ 250; target 0) and the
 *  pill's median and brightest luminance; then a 4× frame with the label, into <outDir>.
 *  Usage: node …/whoweare-still-sweep.mjs <outDir> "name=query" ["name=query" …]
 *  ⚠ NOT WATCHED: the moving light (still frames only); DPR other than 1; Carl's display. */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
const [out, ...takes] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
// BASEQ= replaces the default (the teal studio, its moving light off) — e.g. "mode=teal&metalness=1&paintrough=0.4&".
const BASE = "http://localhost:3000/proto/button?" + (process.env.BASEQ ?? "studio=teal&light=0&ml=0&");
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const p = await (await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 })).newPage();
const open = async (q) => {
  await p.goto(BASE + q, { waitUntil: "networkidle" });
  await p.evaluate(() => { document.querySelectorAll("nextjs-portal").forEach((e) => e.remove()); return document.fonts.ready; });
  await p.waitForTimeout(1800);
};
const lin = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
const inkL = 0.2126 * lin(0xcf) + 0.7152 * lin(0xe6) + 0.0722 * lin(0xff);
const read = (png) => p.evaluate(async ({ b64, inkL }) => {
  const img = new Image(); img.src = "data:image/png;base64," + b64; await img.decode();
  const c = document.createElement("canvas"); c.width = img.width; c.height = img.height;
  const g = c.getContext("2d"); g.drawImage(img, 0, 0); const d = g.getImageData(0, 0, c.width, c.height).data;
  const lin = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
  const Ls = []; let worst = Infinity, blown = 0;
  for (let i = 0; i < d.length; i += 4) {
    const L = 0.2126 * lin(d[i]) + 0.7152 * lin(d[i + 1]) + 0.0722 * lin(d[i + 2]);
    Ls.push(L); worst = Math.min(worst, (Math.max(inkL, L) + 0.05) / (Math.min(inkL, L) + 0.05));
    if (Math.max(d[i], d[i + 1], d[i + 2]) >= 250) blown++;
  }
  Ls.sort((a, z) => a - z);
  return { worst, blown, med: Ls[Ls.length >> 1], max: Ls[Ls.length - 1] };
}, { b64: png.toString("base64"), inkL });
for (const t of takes) {
  const [name, q] = t.split(/=(.*)/s);
  await open(q + "&label=0");
  const r = await p.evaluate(() => { const s = document.querySelector("#whoweare-pill span").getBoundingClientRect(); return { x: s.x, y: s.y, w: s.width, h: s.height }; });
  const text = await read(await p.screenshot({ clip: { x: Math.round(r.x + 24), y: Math.round(r.y + 10), width: Math.round(r.w - 48), height: Math.round(r.h - 20) } }));
  const pill = await read(await p.screenshot({ clip: { x: Math.round(r.x), y: Math.round(r.y), width: Math.round(r.w), height: Math.round(r.h) } }));
  await open(q + "&zoom=4");
  const c = await (await p.$("#whoweare-pill canvas")).boundingBox();
  await p.screenshot({ path: join(out, `${name}_zoom4.png`), clip: c });
  console.log(`${name.padEnd(14)} words worst ${text.worst.toFixed(2)}:1 ${text.worst >= 4.5 ? "✅" : "⛔"}  | pill median L ${pill.med.toFixed(3)}, brightest ${pill.max.toFixed(3)}, blown ${pill.blown} ${pill.blown === 0 ? "✅" : "⛔"}   (${q})`);
}
await b.close();
console.log("   ⚠ NOT WATCHED: the moving light; DPR other than 1; Carl's display.");
