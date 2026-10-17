/** The first card's label at rest, hovered 2 s, and 2.5 s after leaving (17 October 2026) — that the ice-blue rest
 *  leaves the hover's teal and its return intact. Chunk 4 (same day): the hover is PLATINUM #3F6DB8 — glyphs are found
 *  at luminance > 70 (platinum reads ~103; the satin body ~38; was > 120, which missed platinum entirely), and eight
 *  hovered frames over 4 s show the traveller's lift. Usage: node …/card-label-hover-17-october.mjs <outDir>
 *  ⚠ NOT WATCHED: selection; the other four cards; Carl's GPU/Chrome. */
import { chromium } from "playwright";
import sharp from "sharp";
import { mkdirSync } from "node:fs";
const [OUT] = process.argv.slice(2);
mkdirSync(OUT, { recursive: true });
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
  for (let i = 0; i < data.length; i += info.channels) if (L(data[i], data[i + 1], data[i + 2]) > 70) px.push([data[i], data[i + 1], data[i + 2]]);
  px.sort((a, b) => L(...b) - L(...a)); const c = px.slice(0, Math.max(1, Math.floor(px.length * 0.3)));
  const med = (k) => c.map((q) => q[k]).sort((a, b) => a - b)[Math.floor(c.length / 2)];
  console.log(tag.padEnd(14), `rgb(${med(0)}, ${med(1)}, ${med(2)})`);
};
await core("rest");
// The pointer at the HOVER BOX's centre (was 20 px above the label row, near the box's edge — the hover let go there).
const hb = await p.getByTestId("answer-card-hover-0").boundingBox();
await p.mouse.move(hb.x + hb.width / 2, hb.y + hb.height / 2);
// ⚠ The pointer nudged 1 px before each sample: a perfectly still pointer can lose the hover with no pointer event (a
// behaviour seen ONLY under this driven pointer — Carl's own mouse holds the hover still or moving, 17 Oct: NOT a
// product fault). ⚠ So a still-pointer hover reading here is untrustworthy; read the colour settled through SELECTION.
for (let i = 1; i <= 12; i++) { await p.waitForTimeout(500); await p.mouse.move(hb.x + hb.width / 2 + (i % 2), hb.y + hb.height / 2); await core(`hovered ${(i * 0.5).toFixed(1)}s`); }
await p.mouse.move(5, 5); await p.waitForTimeout(2500); await core("left-2.5s");
await b.close();
