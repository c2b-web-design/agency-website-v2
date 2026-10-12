/** THE `Who we are` BUTTON, PASS 2 (THE MATERIAL: TEAL METAL + THE LABEL) — CAPTURED AND MEASURED. D-088, 12 October 2026.
 *  /proto/button at a FIXED 1440 × 900, DPR 1, real GPU; stills by page.screenshot() only (Architect, point 8).
 *  ⛔ Same gate as pass 1: Geist, height 41.
 *  ⛔ THE CONTRAST MEASURE (Carl: "make sure the Text colour is 4.5:1 … on the Teal background"): the label is hidden
 *  (?label=0) and the BARE METAL is read at every pixel of the label's text box (the span's content box: the padding
 *  removed). For each candidate ink, WCAG contrast is computed against EVERY one of those pixels; the verdict is the
 *  WORST pixel, not the mean. Pass mark 4.5:1.
 *  ⚠ NOT WATCHED, and printed with the verdict: the moving light (pass 3 — the same measure along its whole path is
 *  owed then); DPRs other than 1; Carl's display. Usage: node …/whoweare-pass2-capture.mjs [take] [extra query, e.g. rough=0.3]
 */
import { chromium } from "playwright";
import { appendFileSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { homedir, tmpdir } from "node:os";

const take = process.argv[2] ?? "take1";
const extra = process.argv[3] ? "&" + process.argv[3] : "";
const INKS = (process.env.INKS ?? "0a0a0a,ffffff").split(",");
const FILM = join(homedir(), "Videos", "C2B Films", "01 Who we are button");
const BIN = process.env.BIN ?? "04 Pass 2 - Material";
const dir = join(FILM, BIN);
mkdirSync(dir, { recursive: true });
const pad = (n) => String(n).padStart(2, "0");
const d = new Date();
const stamp = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}`;
const log = (file, note) => appendFileSync(join(FILM, "shot-list.md"), `| ${d.toISOString().slice(0, 16).replace("T", " ")} | ${BIN}/${file} | material | ${note} | - |\n`);
const URL = "http://localhost:3000/proto/button";
const q = (s) => "?" + (s + extra).replace(/^&/, "");

const browser = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
const clean = (pg) => pg.evaluate(() => {
  document.querySelectorAll("nextjs-portal").forEach((e) => e.remove());
  const st = document.createElement("style");
  st.textContent = "html{scrollbar-width:none} ::-webkit-scrollbar{display:none}";
  document.head.appendChild(st);
});
const open = async (pg, query) => {
  await pg.goto(URL + query, { waitUntil: "networkidle" });
  await pg.evaluate(() => document.fonts.ready);
  await clean(pg);
  await pg.waitForTimeout(1800);
};

// ── The gate ──
await open(p, q(""));
const box = await p.evaluate(() => { const e = document.querySelector("#whoweare-pill"); return { w: +e.dataset.boxW, h: +e.dataset.boxH, font: e.dataset.font }; });
console.log(`measured: ${box.w} × ${box.h}   font: ${box.font}`);
if (!/geist/i.test(box.font) || box.h !== 41) { console.log("⛔ STOP — font or height wrong; the box rule was not applied."); await browser.close(); process.exit(2); }

// ── The contrast measure ──
await open(p, q("label=0"));
const tb = await p.evaluate(() => { const s = document.querySelector("#whoweare-pill span").getBoundingClientRect(); return { x: s.x + 24, y: s.y + 10, w: s.width - 48, h: s.height - 20 }; });
const png = await p.screenshot({ clip: { x: Math.round(tb.x), y: Math.round(tb.y), width: Math.round(tb.w), height: Math.round(tb.h) } });
const stats = await p.evaluate(async ({ b64, inks }) => {
  const img = new Image(); img.src = "data:image/png;base64," + b64; await img.decode();
  const c = document.createElement("canvas"); c.width = img.width; c.height = img.height;
  const g = c.getContext("2d"); g.drawImage(img, 0, 0);
  const px = g.getImageData(0, 0, c.width, c.height).data;
  const lin = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
  const L = (r, gg, b) => 0.2126 * lin(r) + 0.7152 * lin(gg) + 0.0722 * lin(b);
  const bg = []; for (let i = 0; i < px.length; i += 4) bg.push(L(px[i], px[i + 1], px[i + 2]));
  bg.sort((a, b) => a - b);
  const out = { pixels: bg.length, bgLumin: { min: bg[0], p50: bg[bg.length >> 1], max: bg[bg.length - 1] }, inks: {} };
  for (const hex of inks) {
    const li = L(parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16));
    const cr = bg.map((lb) => (Math.max(li, lb) + 0.05) / (Math.min(li, lb) + 0.05)).sort((a, b) => a - b);
    out.inks[hex] = { worst: cr[0], p1: cr[Math.floor(cr.length * 0.01)], median: cr[cr.length >> 1] };
  }
  return out;
}, { b64: png.toString("base64"), inks: INKS });
// ⛔ BLOWN-OUT CHECK (Carl: "It must be lit but not to the extent where parts are blown out"): over the WHOLE pill, label off,
// the pixels with any channel ≥ 250 — clipped to white or to a pure channel. Target: 0.
const pr = await p.evaluate(() => { const b = document.querySelector("#whoweare-pill").getBoundingClientRect(); return { x: b.x, y: b.y, w: b.width, h: b.height }; });
const pillPng = await p.screenshot({ clip: { x: Math.round(pr.x), y: Math.round(pr.y), width: Math.round(pr.w), height: Math.round(pr.h) } });
const blown = await p.evaluate(async (b64) => {
  const img = new Image(); img.src = "data:image/png;base64," + b64; await img.decode();
  const c = document.createElement("canvas"); c.width = img.width; c.height = img.height;
  const g = c.getContext("2d"); g.drawImage(img, 0, 0); const d = g.getImageData(0, 0, c.width, c.height).data;
  let n = 0, peak = 0; for (let i = 0; i < d.length; i += 4) { const m = Math.max(d[i], d[i + 1], d[i + 2]); peak = Math.max(peak, m); if (m >= 250) n++; }
  return { n, peak, total: d.length / 4 };
}, pillPng.toString("base64"));
console.log(`blown-out pixels on the pill: ${blown.n} of ${blown.total} (brightest channel ${blown.peak}) ${blown.n === 0 ? "✅ none" : "⛔ clipped"}`);
const bgf = `${stamp}_material_${take}_label-area-bare-metal.png`;
await p.screenshot({ path: join(dir, bgf), clip: { x: Math.round(tb.x) - 30, y: Math.round(tb.y) - 16, width: Math.round(tb.w) + 60, height: Math.round(tb.h) + 32 } });
log(bgf, `${take}: the bare metal behind the label, the area the contrast is measured on`);
console.log(`label text box ${tb.w.toFixed(1)} × ${tb.h.toFixed(1)} px, ${stats.pixels} pixels of metal behind it; luminance min ${stats.bgLumin.min.toFixed(3)} median ${stats.bgLumin.p50.toFixed(3)} max ${stats.bgLumin.max.toFixed(3)}`);
for (const [hex, s] of Object.entries(stats.inks)) console.log(`  ink #${hex}: WORST pixel ${s.worst.toFixed(2)}:1   1st pct ${s.p1.toFixed(2)}:1   median ${s.median.toFixed(2)}:1   ${s.worst >= 4.5 ? "✅ ≥ 4.5 everywhere" : "⛔ below 4.5 somewhere"}`);
console.log("   ⚠ NOT WATCHED: the moving light (pass 3 owes this measure along its whole path); DPRs other than 1; Carl's display.");

// ── Stills ──
const views = [
  ["", "bench", "Teal metal in the desk mark's studio, the label in place"],
  ["zoom=4", "zoom4", "4x camera zoom: the metal across the rim, groove and dome"],
  ["zoom=4&mode=clay", "zoom4_BEFORE-clay", "BEFORE: the same 4x view in pass 1's clay (approved)"],
];
const files = [bgf];
for (const [qq, name, note] of views) {
  await open(p, q(qq));
  const f = `${stamp}_material_${take}_${name}.png`;
  await p.screenshot({ path: join(dir, f) });
  log(f, `${take}: ${note}`);
  files.push(f);
}
await open(p, q(""));
const r = await p.evaluate(() => { const b = document.querySelector("#whoweare-pill").getBoundingClientRect(); return { x: b.x, y: b.y, w: b.width, h: b.height }; });
const crop = `${stamp}_material_${take}_close-real-size.png`;
await p.screenshot({ path: join(dir, crop), clip: { x: r.x - 60, y: r.y - 40, width: r.w + 120, height: r.h + 80 } });
log(crop, `${take}: close crop at real size, label in place`);
files.push(crop);
await ctx.close();

// ── The tilt, as video: the metal turning through the studio ──
const vidTmp = join(tmpdir(), `whoweare-p2-${Date.now()}`);
const vctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, recordVideo: { dir: vidTmp, size: { width: 1440, height: 900 } } });
const vp = await vctx.newPage();
await open(vp, q("zoom=4&tilt=1"));
await vp.waitForTimeout(14000);
await vctx.close();
await browser.close();
const webm = readdirSync(vidTmp).find((f) => f.endsWith(".webm"));
if (webm) {
  const mp4 = `${stamp}_material_${take}_tilt-zoom4.mp4`;
  execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", "-i", join(vidTmp, webm), "-c:v", "libx264", "-crf", "18", "-pix_fmt", "yuv420p", join(dir, mp4)]);
  log(mp4, `${take}: the slow tilt at 4x, the teal metal turning through the studio`);
  files.push(mp4);
}
rmSync(vidTmp, { recursive: true, force: true });
console.log(`✅ ${files.length} files → ${BIN}`);
