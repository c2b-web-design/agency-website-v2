/** The first card's label at rest, hovered 2 s, and 2.5 s after leaving (17 October 2026) — that the ice-blue rest
 *  leaves the hover's teal and its return intact. Usage: node …/card-label-hover-17-october.mjs <outDir>
 *  ⚠ NOT WATCHED: selection; the other four cards; Carl's GPU/Chrome. */
import { chromium } from "playwright";
import sharp from "sharp";
const [OUT] = process.argv.slice(2);
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const ctx = await b.newContext({ viewport: { width: 1920, height: 952 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto("http://localhost:3000/start", { waitUntil: "load" });
const begin = p.getByRole("button", { name: /begin/i });
const t0 = Date.now();
while (Date.now() - t0 < 20000) { if ((await begin.getAttribute("aria-disabled")) === null && Date.now() - t0 > 1000) break; await p.waitForTimeout(200); }
await p.waitForTimeout(5200); await begin.click(); await p.mouse.move(5, 5); await p.waitForTimeout(7000);
const g = await p.evaluate(() => { const r = document.querySelector(".enquiry-pdepth-0 .enquiry-answer-grid").getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; });
const cx = g.x + g.w / 6, cy = g.y + g.h * 0.25;
const clip = { x: cx - 110, y: cy - 9, width: 220, height: 18 };
const core = async (tag) => {
  const buf = await p.screenshot({ clip }); await sharp(buf).toFile(`${OUT}/hover-${tag}.png`);
  const { data, info } = await sharp(buf).raw().toBuffer({ resolveWithObject: true });
  const L = (r, g, b) => 0.2126 * r + 0.7152 * g + 0.0722 * b; const px = [];
  for (let i = 0; i < data.length; i += info.channels) if (L(data[i], data[i + 1], data[i + 2]) > 120) px.push([data[i], data[i + 1], data[i + 2]]);
  px.sort((a, b) => L(...b) - L(...a)); const c = px.slice(0, Math.max(1, Math.floor(px.length * 0.3)));
  const med = (k) => c.map((q) => q[k]).sort((a, b) => a - b)[Math.floor(c.length / 2)];
  console.log(tag.padEnd(14), `rgb(${med(0)}, ${med(1)}, ${med(2)})`);
};
await core("rest");
await p.mouse.move(cx, cy - 20); await p.waitForTimeout(2000); await core("hovered-2s");
await p.mouse.move(5, 5); await p.waitForTimeout(2500); await core("left-2.5s");
await b.close();
