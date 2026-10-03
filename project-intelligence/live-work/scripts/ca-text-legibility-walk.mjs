/**
 * CA'S TEXT THROUGH ITS FIRST CYCLE — 3 October 2026. Carl, on his own Chrome (hardware restored): "the text is dark,
 * its barely legible" — his frame shows CA's text COLD blue-grey, where the 27 September frames show it warm white.
 *
 * Plain `/about` at the top; click "Roles"; crop CA every 3 s for 30 s; print each crop's text colour (mean of the
 * brightest 3% of pixels inside CA's face) so a cold/warm swing is visible as numbers, not only by eye.
 * ⛔ ITS NUMBER IS UNRELIABLE: the "brightest 3%" caught the RIM GLOW at the crop edge, not the letters — it read
 *   "warm" on frames whose letters were grey. Use ca-text-light-ab.mjs (inset clear of the rim). The crops stand.
 * ⚠ NOT WATCHED: Carl's Chrome (Playwright's Chromium, headed, GPU on, 1412×700 @1.36); CB/CD/CS; lap 2.
 *   node --no-warnings project-intelligence/live-work/scripts/ca-text-legibility-walk.mjs
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import sharp from "sharp";

const out = "project-intelligence/live-work/screenshots/ca-text-3-october";
mkdirSync(out, { recursive: true });
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const ctx = await b.newContext({ viewport: { width: 1412, height: 700 }, deviceScaleFactor: 1.36 });
{ const p = await ctx.newPage(); await p.goto("http://localhost:3000/about", { waitUntil: "networkidle" }); await p.waitForTimeout(1500); await p.close(); }
const p = await ctx.newPage();
await p.goto("http://localhost:3000/about", { waitUntil: "networkidle" });
await p.waitForTimeout(3000);
await p.getByRole("link", { name: "Roles", exact: true }).first().click();
await p.waitForTimeout(800);

// CA's face box in screen px, from the canvas rect and ROOM_CARD_GUIDES.CA (inset a little from the rim)
const box = await p.evaluate(() => {
  const c = document.querySelector("#roles canvas").getBoundingClientRect();
  const x0 = 0.19, x1 = 0.40, y0 = 0.33, y1 = 0.54; // inside CA's outline [0.176..0.415] × [0.307..0.559]
  return { x: c.left + x0 * c.width, y: c.top + y0 * c.height, width: (x1 - x0) * c.width, height: (y1 - y0) * c.height };
});
const t0 = Date.now();
for (let s = 3; s <= 30; s += 3) {
  while (Date.now() - t0 < s * 1000) await p.waitForTimeout(50);
  const file = `${out}/ca-${String(s).padStart(2, "0")}s.png`;
  await p.screenshot({ path: file, clip: box });
  const { data } = await sharp(file).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const px = []; for (let i = 0; i < data.length; i += 3) px.push([data[i], data[i + 1], data[i + 2], data[i] + data[i + 1] + data[i + 2]]);
  px.sort((a, b) => b[3] - a[3]);
  const top = px.slice(0, Math.max(1, Math.floor(px.length * 0.03)));
  const m = [0, 1, 2].map((k) => Math.round(top.reduce((s2, q) => s2 + q[k], 0) / top.length));
  const med = px[Math.floor(px.length / 2)];
  console.log(`${String(s).padStart(2)} s  text(top 3%) rgb(${m.join(",")})  ${m[2] > m[0] ? "⛔ COLD (blue > red)" : "warm"} · face median rgb(${med.slice(0, 3).join(",")})`);
}
await p.screenshot({ path: `${out}/full-30s.png` });
await b.close();
