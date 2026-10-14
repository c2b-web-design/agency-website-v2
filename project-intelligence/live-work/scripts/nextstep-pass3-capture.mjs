/** `Next step` — PASS 3, THE LIGHT (D-088, 14 October 2026; the family's platinum blue member).
 *  R-054's platinum blue (#3F6DB8, metalness 1, roughness 0.4, words ice blue #CFE6FF) under the clay's lamps PLUS the teal's
 *  moving lamp exactly as approved (R-045/R-046, as the gold's pass 3: kind lamp, intensity 1, lift 120, dip 0.9 at 0.5 over
 *  0.4). The lamp FROZEN (?mt=) at nine points along its path, face-on:
 *   - THE CONTRAST ALONG THE PATH (the teal's `whoweare-light-path-measure.mjs`): the label hidden, the bare metal in the
 *     label's text box read at every pixel → the WORST contrast against the ice blue at each point. Pass mark 4.5:1.
 *   - BLOWN: over the whole pill, pixels with any channel ≥ 250, at each point.
 *  Stills at 4× (label on) at five points, and one with the helpers (?lighthelpers=1).
 *  Usage: node …/nextstep-pass3-capture.mjs [extra query]   → live-work/screenshots/nextstep-family-14-october/pass3/
 *  ⚠ NOT WATCHED: between the sampled points; the lamp in motion (frozen frames); the roll's other angles; the hold; DPR ≠ 1;
 *  Carl's display. */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const extra = process.argv[2] ? "&" + process.argv[2] : "";
const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "screenshots", "nextstep-family-14-october", "pass3");
mkdirSync(OUT, { recursive: true });
const PASS3 = "http://localhost:3000/proto/button?member=next&mode=teal&paint=3f6db8&metalness=1&paintrough=0.4&ink=cfe6ff&roll=1&mlkind=lamp&mli=1&mllift=120&mldip=0.9&mldipat=0.5&mldipw=0.4&rollat=0" + extra;
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
const open = async (q) => {
  const p = await ctx.newPage();
  await p.goto(PASS3 + q, { waitUntil: "load" });
  await p.evaluate(() => document.fonts.ready);
  await p.evaluate(() => document.querySelectorAll("nextjs-portal").forEach((e) => e.remove()));
  await p.waitForSelector("#next-pill canvas");
  await p.waitForTimeout(2200);
  return p;
};
const lin = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
const inkL = 0.2126 * lin(0xcf) + 0.7152 * lin(0xe6) + 0.0722 * lin(0xff);
const read = (p, b64, withContrast) => p.evaluate(async ({ b64, inkL, withContrast }) => {
  const img = new Image(); img.src = "data:image/png;base64," + b64; await img.decode();
  const c = document.createElement("canvas"); c.width = img.width; c.height = img.height;
  const g = c.getContext("2d"); g.drawImage(img, 0, 0); const d = g.getImageData(0, 0, c.width, c.height).data;
  const ln = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
  let worst = Infinity, blown = 0, peak = 0;
  for (let i = 0; i < d.length; i += 4) {
    if (withContrast) {
      const L = 0.2126 * ln(d[i]) + 0.7152 * ln(d[i + 1]) + 0.0722 * ln(d[i + 2]);
      worst = Math.min(worst, (Math.max(inkL, L) + 0.05) / (Math.min(inkL, L) + 0.05));
    }
    const m = Math.max(d[i], d[i + 1], d[i + 2]); peak = Math.max(peak, m); if (m >= 250) blown++;
  }
  return { worst, blown, peak };
}, { b64, inkL, withContrast });

let worstAll = Infinity, blownMax = 0;
for (let i = 0; i <= 8; i++) {
  const mt = (i / 8).toFixed(3);
  const p = await open(`&label=0&mt=${mt}`);
  const box = await p.evaluate(() => { const e = document.querySelector("#next-pill"); const s = e.querySelector("span").getBoundingClientRect(); const c = e.querySelector("canvas").getBoundingClientRect(); return { font: e.dataset.font, h: +e.dataset.boxH, tb: { x: s.x + 24, y: s.y + 10, w: s.width - 48, h: s.height - 20 }, c: { x: c.x, y: c.y, w: c.width, h: c.height } }; });
  if (!/geist/i.test(box.font) || Math.round(box.h) !== 41) throw new Error(`box not measured in Geist at 41 high: ${JSON.stringify(box)}`);
  const label = await p.screenshot({ clip: { x: Math.round(box.tb.x), y: Math.round(box.tb.y), width: Math.round(box.tb.w), height: Math.round(box.tb.h) } });
  const pill = await p.screenshot({ clip: { x: Math.round(box.c.x), y: Math.round(box.c.y), width: Math.round(box.c.w), height: Math.round(box.c.h) } });
  const lc = await read(p, label.toString("base64"), true);
  const pb = await read(p, pill.toString("base64"), false);
  worstAll = Math.min(worstAll, lc.worst); blownMax = Math.max(blownMax, pb.blown);
  console.log(`mt ${mt}: words' worst ${lc.worst.toFixed(2)}:1 ${lc.worst >= 4.5 ? "✅" : "⛔"} · blown ${pb.blown} px (peak ${pb.peak})`);
  await p.close();
}
console.log(`ALONG THE PATH: worst ${worstAll.toFixed(2)}:1 ${worstAll >= 4.5 ? "✅ ≥ 4.5 at every sampled point" : "⛔ below 4.5"} · blown at most ${blownMax} px`);
console.log("⚠ NOT WATCHED: between the 9 sampled points; the lamp in motion; the roll's other angles; DPR ≠ 1; Carl's display.");

for (const [q, f] of [["&zoom=4&mt=0.15", "4x_mt0.15"], ["&zoom=4&mt=0.3", "4x_mt0.3"], ["&zoom=4&mt=0.5", "4x_mt0.5"], ["&zoom=4&mt=0.7", "4x_mt0.7"], ["&zoom=4&mt=0.85", "4x_mt0.85"], ["&zoom=4&mt=0.3&lighthelpers=1", "4x_mt0.3_helpers"]]) {
  const p = await open(q);
  const c = await p.evaluate(() => { const r = document.querySelector("#next-pill canvas").getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; });
  const pad = f.endsWith("helpers") ? 160 : 20;
  await p.screenshot({ path: join(OUT, `${f}.png`), clip: { x: Math.max(0, c.x - pad), y: Math.max(0, c.y - pad), width: c.w + 2 * pad, height: c.h + 2 * pad } });
  await p.close();
}
console.log(OUT);
await b.close();
