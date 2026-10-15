/** THE LOGO STANDARD ON THE FAMILY BUTTONS — bench frames + numbers (D-088, 15 October 2026).
 *  Carl: "If theres a standard for building metal then the logo is it." For each take (a query string on /proto/button):
 *  the pill at the HOME SIZE (scale=2), face-on (roll frozen at 0), at DPR 2 → a real-size frame and a 3× crop; then, with
 *  the label hidden, the pill's median / brightest luminance, the blown pixels (any channel ≥ 250), and the WORST contrast
 *  of the ink against every pixel behind the words (reported, not a gate — Carl, 12 Oct: the look leads, the words second).
 *  Also asserts the HDRI was FETCHED when the take asks for it (a take that silently fell back to lamps would look "fine").
 *  Usage: node …/metal-standard-capture.mjs <outDir> "name=query" ["name=query" …]   (BASEQ= overrides the base query)
 *  ⚠ NOT WATCHED: the moving lamp and the roll (frozen); the live pages (bench only); Carl's display. */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
const [out, ...takes] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const BASE = "http://localhost:3000/proto/button?" + (process.env.BASEQ ?? "mode=teal&paint=1fb2c4&metalness=1&paintrough=0.4&roll=1&rollat=0&ml=0&scale=2&");
const INK = process.env.INK ?? "cfe6ff";
// PILL= the bench pill's id (the teal "whoweare-pill"; the gold, ?member=start, "start-pill").
const PILL = process.env.PILL ?? "whoweare-pill";
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
const p = await ctx.newPage();
let hdrFetched = 0;
p.on("response", (r) => { if (r.url().includes("/env/") && r.url().endsWith(".hdr") && r.ok()) hdrFetched++; });
const open = async (q) => {
  await p.goto(BASE + q, { waitUntil: "networkidle" });
  await p.evaluate(() => { document.querySelectorAll("nextjs-portal").forEach((e) => e.remove()); return document.fonts.ready; });
  await p.waitForTimeout(2200);
};
const lin = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
const ink = [0, 2, 4].map((i) => parseInt(INK.slice(i, i + 2), 16));
const inkL = 0.2126 * lin(ink[0]) + 0.7152 * lin(ink[1]) + 0.0722 * lin(ink[2]);
const read = (png) => p.evaluate(async ({ b64, inkL }) => {
  const img = new Image(); img.src = "data:image/png;base64," + b64; await img.decode();
  const c = document.createElement("canvas"); c.width = img.width; c.height = img.height;
  const g = c.getContext("2d"); g.drawImage(img, 0, 0); const d = g.getImageData(0, 0, c.width, c.height).data;
  const lin = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
  const Ls = []; let worst = Infinity, blown = 0;
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] === 0) continue;
    const L = 0.2126 * lin(d[i]) + 0.7152 * lin(d[i + 1]) + 0.0722 * lin(d[i + 2]);
    Ls.push(L); worst = Math.min(worst, (Math.max(inkL, L) + 0.05) / (Math.min(inkL, L) + 0.05));
    if (Math.max(d[i], d[i + 1], d[i + 2]) >= 250) blown++;
  }
  Ls.sort((a, z) => a - z);
  return { worst, blown, med: Ls[Ls.length >> 1], max: Ls[Ls.length - 1] };
}, { b64: png.toString("base64"), inkL });
const box = () => p.evaluate((id) => { const s = document.querySelector(`#${id} span`).getBoundingClientRect(); return { x: s.x, y: s.y, w: s.width, h: s.height }; }, PILL);
for (const t of takes) {
  const [name, q] = t.split(/=(.*)/s);
  const before = hdrFetched;
  await open(q);
  const wantHdr = /(^|&)env=hdri/.test(q);
  const r = await box();
  const pad = 30;
  await p.screenshot({ path: join(out, `${name}.png`), clip: { x: r.x - pad, y: r.y - pad, width: r.w + pad * 2, height: r.h + pad * 2 } });
  await open(q + "&label=0");
  const r2 = await box();
  // the words' band: the box less its padding (24 × 2 scale, 10 × 2 scale)
  const text = await read(await p.screenshot({ clip: { x: r2.x + 48, y: r2.y + 20, width: r2.w - 96, height: r2.h - 40 } }));
  const pill = await read(await p.screenshot({ clip: { x: r2.x, y: r2.y, width: r2.w, height: r2.h } }));
  const fetched = hdrFetched > before;
  console.log(`${name.padEnd(16)} pill median L ${pill.med.toFixed(3)}, brightest ${pill.max.toFixed(3)}, blown ${pill.blown}  | words worst ${text.worst.toFixed(2)}:1 (reported)  | HDRI ${wantHdr ? (fetched ? "fetched ✅" : "⛔ ASKED FOR, NOT FETCHED") : "not asked"}   (${q})`);
}
await b.close();
console.log("   ⚠ NOT WATCHED: the moving lamp and the roll (frozen); the live pages; Carl's display.");
