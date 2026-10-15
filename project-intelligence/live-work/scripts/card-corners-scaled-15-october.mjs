/** THE CARD CORNERS AT THE RESTORED SIZE (15 October 2026, session 2 — after D-097). Carl: "the card corners still dont look right".
 *  /start at Q5 on Carl's screen: 1920 × 952 window, DPR 1 → the site's scale 1.36, so the cards draw as he composed them.
 *  Card 1 captured at 1× and written ENLARGED 8× nearest-neighbour (every real pixel a block); its left and right ends
 *  cropped and enlarged on their own; card 1 SELECTED too (the filament lit), because that is when the rim is brightest.
 *  Usage: node …/card-corners-scaled-15-october.mjs <outDir> [query]
 *  ⚠ NOT WATCHED: Carl's GPU and Chrome (this is Playwright's Chromium); cards 2–5; motion; hover. */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
const [OUT, Q = ""] = process.argv.slice(2);
mkdirSync(OUT, { recursive: true });
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const ctx = await b.newContext({ viewport: { width: 1920, height: 952 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto("http://localhost:3000/start" + Q, { waitUntil: "load" });
await p.waitForTimeout(9000);
await p.getByRole("button", { name: /begin/i }).click();
await p.locator(".enquiry-answer-grid").waitFor({ state: "visible", timeout: 30000 });
await p.mouse.move(5, 5);
await p.waitForTimeout(5000);
console.log("zoom", await p.evaluate(() => document.documentElement.currentCSSZoom));
async function shoot(tag) {
  const c = await p.getByTestId("answer-card-hover-0").boundingBox();
  const png = await p.screenshot({ clip: { x: Math.floor(c.x) - 4, y: Math.floor(c.y) - 4, width: Math.ceil(c.width) + 8, height: Math.ceil(c.height) + 8 } });
  const m = await sharp(png).metadata();
  await sharp(png).toFile(join(OUT, `${tag}-card1-1x.png`));
  await sharp(png).resize(m.width * 6, m.height * 6, { kernel: "nearest" }).toFile(join(OUT, `${tag}-card1-6x.png`));
  for (const [side, left] of [["left", 0], ["right", m.width - 48]])
    await sharp(png).extract({ left, top: 0, width: 48, height: m.height }).resize(48 * 10, m.height * 10, { kernel: "nearest" }).toFile(join(OUT, `${tag}-card1-${side}-10x.png`));
  console.log(`${tag}: card 1 at 1× ${m.width} × ${m.height} screen px`);
}
await shoot("rest");
await p.getByTestId("answer-card-hover-0").click();
await p.mouse.move(5, 5);
await p.waitForTimeout(2500);
await shoot("selected");
console.log("→", OUT);
await b.close();
