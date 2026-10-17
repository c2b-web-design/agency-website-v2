/** THE SELECTED CARD'S LABEL HOLDS THE HOVER COLOUR (17 October 2026; D-023, chunk 4). Card 1 at rest → pressed (the
 *  pointer then parked far off) → 2 s / 4 s later → pressed again (cancelled) → 2.5 s later. The label core per state;
 *  card 2's label at the same moments as an unselected control. Usage: node …/card-label-selected-17-october.mjs <outDir>
 *  ⚠ NOT WATCHED: Q4–Q1; the card exit at Next step; Carl's GPU/Chrome. */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import sharp from "sharp";
const [OUT] = process.argv.slice(2);
mkdirSync(OUT, { recursive: true });
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const ctx = await b.newContext({ viewport: { width: 1920, height: 952 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
const errs = [];
p.on("console", (m) => m.type() === "error" && errs.push(m.text()));
await p.goto("http://localhost:3000/start", { waitUntil: "load" });
await p.waitForTimeout(9000);
await p.getByRole("button", { name: /begin/i }).click();
await p.mouse.move(5, 5);
await p.waitForTimeout(7000);
const g = await p.evaluate(() => { const r = document.querySelector(".enquiry-pdepth-0 .enquiry-answer-grid").getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; });
const L = (r, g, b) => 0.2126 * r + 0.7152 * g + 0.0722 * b;
const core = async (cx, cy, tag) => {
  const buf = await p.screenshot({ clip: { x: cx - 110, y: cy - 9, width: 220, height: 18 } });
  await sharp(buf).toFile(`${OUT}/${tag}.png`);
  const { data, info } = await sharp(buf).raw().toBuffer({ resolveWithObject: true });
  const px = [];
  for (let i = 0; i < data.length; i += info.channels) if (L(data[i], data[i + 1], data[i + 2]) > 70) px.push([data[i], data[i + 1], data[i + 2]]);
  px.sort((a, c) => L(...c) - L(...a));
  const c = px.slice(0, Math.max(1, Math.floor(px.length * 0.3)));
  const med = (k) => c.map((q) => q[k]).sort((x, y) => x - y)[Math.floor(c.length / 2)];
  return `rgb(${med(0)}, ${med(1)}, ${med(2)})`;
};
const c1 = [g.x + g.w / 6, g.y + g.h * 0.25], c2 = [g.x + g.w / 2, g.y + g.h * 0.25];
const row = async (tag) => console.log(tag.padEnd(22), "card 1", await core(...c1, `${tag}-c1`), "· card 2", await core(...c2, `${tag}-c2`),
  "· lit", await p.evaluate(() => document.querySelector("[data-lit-cards]")?.getAttribute("data-lit-cards")));
await row("rest");
const hb = await p.getByTestId("answer-card-hover-0").boundingBox();
await p.mouse.click(hb.x + hb.width / 2, hb.y + hb.height / 2);
await p.mouse.move(5, 5);
await p.waitForTimeout(2000); await row("selected, 2 s off");
await p.waitForTimeout(2000); await row("selected, 4 s off");
await p.mouse.click(hb.x + hb.width / 2, hb.y + hb.height / 2);
await p.mouse.move(5, 5);
await p.waitForTimeout(2500); await row("cancelled, 2.5 s");
console.log("target: selected #5F88C8 = rgb(95, 136, 200); rest #CFE6FF = rgb(207, 230, 255) · console errors", errs.length, errs.slice(0, 2));
await b.close();
console.log("⚠ NOT WATCHED: Q4–Q1; the exit at Next step; Carl's GPU/Chrome. →", OUT);
