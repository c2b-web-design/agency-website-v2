/** FILM 04 PASS 2, STEP 4 — THE REFLECTION CENTRED (23 October 2026). Carl: "the reflection from the HDRI should be more
 *  balanced. Centred on the middle the edges are getting lost." The perspective front, material mode, the studio turned in
 *  5° steps; the letters' mean luminance in three bands across the word (left / middle / right fifths of the letters' extent).
 *  Balanced = the middle lit, left ≈ right. Reports per yaw and the best: highest min(left, right) with |left − right| small.
 *    node …/film04-pass2-balance-23-october.mjs <base> [step]
 *  ⚠ NOT WATCHED: how it looks (Carl's eye); the oblique view; anything but the studio's turn (one variable). */
import { chromium } from "playwright";
import sharp from "sharp";
const [BASE = "http://localhost:3000", STEP = "5"] = process.argv.slice(2);
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const p = await (await b.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 })).newPage();
await p.goto(`${BASE}/proto/showcase?layout=line&mode=material&view=front`, { waitUntil: "networkidle" });
await p.waitForFunction(() => window.__showcaseBench?.ready, null, { timeout: 60000 });
await p.addStyleTag({ content: "nextjs-portal{display:none!important}" });
const box = await p.locator("canvas").first().boundingBox();
const setYaw = (v) => p.evaluate((v) => {
  const el = [...document.querySelectorAll('input[type="range"]')].find((e) => e.closest("label")?.textContent?.startsWith("studio turn"));
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(el, String(v));
  el.dispatchEvent(new Event("input", { bubbles: true }));
}, v);
// the letters' extent, from a frame with every face lit (the edge mask is enough): columns holding pixels above the ground
await setYaw(30); await p.waitForTimeout(500);
const { data: d0, info } = await sharp(await p.screenshot({ clip: box })).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const W = info.width, H = info.height;
let x0 = W, x1 = 0, y0 = H, y1 = 0;
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const i = (y * W + x) * 3; if (Math.max(d0[i], d0[i + 1], d0[i + 2]) > 30) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); } }
const bands = [[0, 0.2], [0.4, 0.6], [0.8, 1]].map(([a, c]) => [x0 + a * (x1 - x0), x0 + c * (x1 - x0)]);
console.log(`letters' extent x ${x0}–${x1}, y ${y0}–${y1}; bands left / middle / right fifths`);
const rows = [];
for (let yaw = 0; yaw < 360; yaw += Number(STEP)) {
  await setYaw(yaw); await p.waitForTimeout(250);
  const { data } = await sharp(await p.screenshot({ clip: box })).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const m = bands.map(([a, c]) => { let s = 0, n = 0; for (let y = y0; y <= y1; y++) for (let x = Math.floor(a); x < c; x++) { const i = (y * W + x) * 3; const L = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]; s += L; n++; } return s / n; });
  rows.push([yaw, ...m]);
}
for (const [y, l, mid, r] of rows) console.log(`yaw ${String(y).padStart(3)}: left ${l.toFixed(1).padStart(5)} · middle ${mid.toFixed(1).padStart(5)} · right ${r.toFixed(1).padStart(5)} · L−R ${(l - r).toFixed(1)}`);
const ok = rows.filter(([, l, mid, r]) => mid >= Math.max(l, r) * 0.95 && Math.abs(l - r) <= 0.15 * Math.max(l, r));
ok.sort((a, b) => Math.min(b[1], b[3]) - Math.min(a[1], a[3]));
console.log("BALANCED (middle ≥ the ends, |L−R| ≤ 15%), best ends first:", ok.slice(0, 5).map(([y, l, mid, r]) => `${y}° (L ${l.toFixed(1)} M ${mid.toFixed(1)} R ${r.toFixed(1)})`).join(", ") || "none");
await b.close();
