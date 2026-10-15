/** THE CORNERS AT CARL's DENSITY (15 October 2026; Carl: "its still there. i can see it from 2ft away on a 27" monitor").
 *  /start at Q5, DPR 1 (a 27" monitor at 2560 or 1920 wide is 1×), 1440 × 900. Card 1 captured at 1× and its pixels written
 *  ENLARGED 8× nearest-neighbour (no smoothing — every real pixel a block), so the steps can be seen as they are.
 *  Also the WebGL context's real antialias state (getContextAttributes) and MSAA samples (gl.SAMPLES).
 *  Usage: node …/card-corners-dpr1-15-october.mjs <outDir> [query]   ⚠ NOT WATCHED: Carl's GPU and Chrome; cards 2–5. */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
const [OUT, Q = ""] = process.argv.slice(2);
mkdirSync(OUT, { recursive: true });
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: Number(process.env.DSF ?? 1) });
await ctx.addInitScript(() => {
  const o = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function (t, ...r) { const c = o.call(this, t, ...r); if (/webgl/.test(t) && c) (window.__gls ||= []).push(c); return c; };
});
const p = await ctx.newPage();
await p.goto("http://localhost:3000/start" + Q, { waitUntil: "load" });
await p.waitForTimeout(9000);
await p.getByRole("button", { name: /begin/i }).click();
await p.locator(".enquiry-answer-grid").waitFor({ state: "visible", timeout: 30000 });
await p.mouse.move(5, 5);
await p.waitForTimeout(5000);
const gl = await p.evaluate(() => (window.__gls || []).map((g) => ({ w: g.canvas.width, cw: g.canvas.clientWidth, aa: g.getContextAttributes()?.antialias, samples: g.getParameter(g.SAMPLES) })));
console.log("WebGL contexts:", JSON.stringify(gl));
const c = await p.getByTestId("answer-card-hover-0").boundingBox();
const png = await p.screenshot({ clip: { x: Math.floor(c.x) - 3, y: Math.floor(c.y) - 3, width: Math.ceil(c.width) + 6, height: Math.ceil(c.height) + 6 } });
await sharp(png).toFile(join(OUT, "card1-1x.png"));
const meta = await sharp(png).metadata();
await sharp(png).resize(meta.width * 8, meta.height * 8, { kernel: "nearest" }).toFile(join(OUT, "card1-1x-pixels-8x.png"));
await sharp(png).extract({ left: 0, top: 0, width: 40, height: meta.height }).resize(320, meta.height * 8, { kernel: "nearest" }).toFile(join(OUT, "card1-1x-left-end-8x.png"));
await sharp(png).extract({ left: meta.width - 40, top: 0, width: 40, height: meta.height }).resize(320, meta.height * 8, { kernel: "nearest" }).toFile(join(OUT, "card1-1x-right-end-8x.png"));
console.log(`card 1 at 1×: ${meta.width} × ${meta.height} px → ${OUT}`);
await b.close();
