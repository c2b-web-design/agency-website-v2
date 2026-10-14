/** `Next step` — PASS 2, THE MATERIAL: PLATINUM BLUE (D-088, 14 October 2026; the family's fourth member).
 *  The teal's and gold's method (R-045, R-048): the colour as PAINT on the clay's material and lamps, metalness 1,
 *  roughness 0.4; no moving lamp (pass 3). The paint is the desk mark's platinum blue, the swatch #3F6DB8 (R-035).
 *  ⛔ THE GATE: the box measured in Geist at 41 high, or nothing is captured.
 *  ⛔ THE CONTRAST MEASURE (the teal's, `whoweare-pass2-capture.mjs`): the label hidden (?label=0), the BARE METAL read at
 *  every pixel of the label's text box; for each candidate ink, WCAG contrast against EVERY pixel — the verdict is the
 *  WORST pixel. Pass mark 4.5:1. Plus the blown-out check over the whole pill (any channel ≥ 250; target 0).
 *  Stills with the chosen ink: face-on at 1× and 4×, and 4× at 45° of the roll.
 *  Usage: node …/nextstep-pass2-capture.mjs [paint] [rough] [inks] [still ink]  → live-work/screenshots/nextstep-family-14-october/pass2/
 *  ⚠ NOT WATCHED: the moving lamp (off — pass 3 owes the measure along its path); the hold; DPRs other than 1; Carl's display. */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const paint = process.argv[2] ?? "3f6db8";
const rough = process.argv[3] ?? "0.4";
const INKS = (process.argv[4] ?? "ffffff,f2f4f7,cfe6ff").split(",");
const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "screenshots", "nextstep-family-14-october", "pass2");
mkdirSync(OUT, { recursive: true });
const BASE = `http://localhost:3000/proto/button?member=next&mode=teal&paint=${paint}&metalness=1&paintrough=${rough}&ml=0&roll=1`;
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
const open = async (q) => {
  const p = await ctx.newPage();
  await p.goto(BASE + q, { waitUntil: "load" });
  await p.evaluate(() => document.fonts.ready);
  await p.evaluate(() => document.querySelectorAll("nextjs-portal").forEach((e) => e.remove()));
  await p.waitForSelector("#next-pill canvas");
  await p.waitForTimeout(2500);
  return p;
};
const lumStats = (p, b64, inks) => p.evaluate(async ({ b64, inks }) => {
  const img = new Image(); img.src = "data:image/png;base64," + b64; await img.decode();
  const c = document.createElement("canvas"); c.width = img.width; c.height = img.height;
  const g = c.getContext("2d"); g.drawImage(img, 0, 0); const px = g.getImageData(0, 0, c.width, c.height).data;
  const lin = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
  const L = (r, gg, bb) => 0.2126 * lin(r) + 0.7152 * lin(gg) + 0.0722 * lin(bb);
  const bg = []; for (let i = 0; i < px.length; i += 4) bg.push(L(px[i], px[i + 1], px[i + 2]));
  bg.sort((a, z) => a - z);
  const out = { pixels: bg.length, min: bg[0], p50: bg[bg.length >> 1], max: bg[bg.length - 1], inks: {} };
  for (const hex of inks) {
    const li = L(parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16));
    const cr = bg.map((lb) => (Math.max(li, lb) + 0.05) / (Math.min(li, lb) + 0.05)).sort((a, z) => a - z);
    out.inks[hex] = { worst: cr[0], median: cr[cr.length >> 1] };
  }
  return out;
}, { b64, inks });

// ── The gate + the contrast measure (face-on, label off) ──
const p = await open("&label=0&rollat=0");
const box = await p.evaluate(() => { const e = document.querySelector("#next-pill"); return { w: +e.dataset.boxW, h: +e.dataset.boxH, font: e.dataset.font }; });
if (!/geist/i.test(box.font) || Math.round(box.h) !== 41) throw new Error(`box not measured in Geist at 41 high: ${JSON.stringify(box)}`);
console.log(`box ${box.w.toFixed(1)} × ${box.h.toFixed(1)} (${box.font.split(",")[0]})`);
const tb = await p.evaluate(() => { const s = document.querySelector("#next-pill span").getBoundingClientRect(); return { x: s.x + 24, y: s.y + 10, w: s.width - 48, h: s.height - 20 }; });
const png = await p.screenshot({ clip: { x: Math.round(tb.x), y: Math.round(tb.y), width: Math.round(tb.w), height: Math.round(tb.h) } });
const st = await lumStats(p, png.toString("base64"), INKS);
console.log(`label box ${tb.w.toFixed(1)} × ${tb.h.toFixed(1)} px, ${st.pixels} px of metal; luminance min ${st.min.toFixed(3)} median ${st.p50.toFixed(3)} max ${st.max.toFixed(3)}`);
for (const [hex, s] of Object.entries(st.inks)) console.log(`  ink #${hex}: WORST ${s.worst.toFixed(2)}:1, median ${s.median.toFixed(2)}:1 ${s.worst >= 4.5 ? "✅" : "⛔ below 4.5"}`);
const pr = await p.evaluate(() => { const r = document.querySelector("#next-pill canvas").getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; });
const pill = await p.screenshot({ clip: { x: Math.round(pr.x), y: Math.round(pr.y), width: Math.round(pr.w), height: Math.round(pr.h) } });
const blown = await p.evaluate(async (b64) => {
  const img = new Image(); img.src = "data:image/png;base64," + b64; await img.decode();
  const c = document.createElement("canvas"); c.width = img.width; c.height = img.height;
  const g = c.getContext("2d"); g.drawImage(img, 0, 0); const d = g.getImageData(0, 0, c.width, c.height).data;
  let n = 0, peak = 0; for (let i = 0; i < d.length; i += 4) { const m = Math.max(d[i], d[i + 1], d[i + 2]); peak = Math.max(peak, m); if (m >= 250) n++; }
  return { n, peak };
}, pill.toString("base64"));
console.log(`blown-out pixels: ${blown.n} (brightest channel ${blown.peak}) ${blown.n === 0 ? "✅" : "⛔"}`);
console.log("⚠ NOT WATCHED: the moving lamp (pass 3); the hold; DPRs other than 1; Carl's display.");
await p.close();

// ── Stills, with the chosen ink ──
const ink = process.argv[5] ?? Object.entries(st.inks).filter(([, s]) => s.worst >= 4.5).sort((a, z) => z[1].worst - a[1].worst)[0]?.[0] ?? INKS[0];
for (const [q, tag] of [["&rollat=0", "1x_face"], ["&zoom=4&rollat=0", "4x_face"], ["&zoom=4&rollat=45", "4x_rollat45"]]) {
  const sp = await open(`&ink=${ink}${q}`);
  const c = await sp.evaluate(() => { const r = document.querySelector("#next-pill canvas").getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; });
  await sp.screenshot({ path: join(OUT, `${paint}_r${rough}_ink${ink}_${tag}.png`), clip: { x: Math.max(0, c.x - 20), y: Math.max(0, c.y - 20), width: c.w + 40, height: c.h + 40 } });
  await sp.close();
}
console.log(`stills with ink #${ink} → ${OUT}`);
await b.close();
