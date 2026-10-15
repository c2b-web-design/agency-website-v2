/** THE CARDS' WARMTH ON `Next step`, CAUGHT IN A BURST (15 October 2026, session 3). Carl: "its hard to capture it at just
 *  the right moment. Take a lot of screenshots."
 *  /start at Carl's screen (1920 × 952, DPR 1), Q5, the named cards selected, the button ROLLING (the pointer away):
 *  screenshots of the button as fast as they come for SECONDS (default 16 — several rolls). Each frame scored by its WARM
 *  pixels — on the platinum blue pill a pixel whose red exceeds its blue is light the blue cannot make (the ice-blue words
 *  have blue > red too). The 12 warmest frames, in time order, on a contact sheet enlarged 3×; and every frame's score.
 *  Usage: node …/card-glow-burst-15-october.mjs <outDir> "<card indices>" [query]
 *  ⚠ NOT WATCHED: Carl's GPU/Chrome; the OFF arm (run with cardglow=0 for the floor); frames are as fast as Playwright gives. */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
const [OUT, CARDS, Q = ""] = process.argv.slice(2);
mkdirSync(OUT, { recursive: true });
const sel = CARDS.split(",").map(Number);
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const ctx = await b.newContext({ viewport: { width: 1920, height: 952 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto("http://localhost:3000/start" + (Q ? "?" + Q : ""), { waitUntil: "load" });
await p.waitForTimeout(9000);
await p.getByRole("button", { name: /begin/i }).click();
await p.locator(".enquiry-answer-grid").waitFor({ state: "visible", timeout: 30000 });
await p.mouse.move(5, 5);
await p.waitForTimeout(3000);
for (const i of sel) {
  const bx = await p.getByTestId(`answer-card-hover-${i}`).boundingBox();
  await p.mouse.click(bx.x + bx.width / 2, bx.y + bx.height / 2);
  await p.waitForTimeout(150);
}
await p.mouse.move(5, 5);
await p.waitForTimeout(3000);
const pill = await p.locator("[data-family-next]").boundingBox();
const clip = { x: Math.floor(pill.x) - 10, y: Math.floor(pill.y) - 10, width: Math.ceil(pill.width) + 20, height: Math.ceil(pill.height) + 20 };
const frames = [];
const t0 = Date.now();
const SECONDS = Number(process.env.SECONDS) || 16;
while (Date.now() - t0 < SECONDS * 1000) frames.push({ t: Date.now() - t0, png: await p.screenshot({ clip }) });
await b.close();
for (const f of frames) {
  const { data } = await sharp(f.png).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  // ⚠ RE-SCORED: on BLUE METAL the warm light comes back tinted by the metal (F0 = the paint), near neutral, so no pixel has
  // red > blue even when lit (measured: 0 in every frame, on and off). Score instead the pill's RED against its BLUE over
  // the brighter pixels (where light lands): the warmth raises red relative to blue.
  let warm = 0, r = 0, bl = 0;
  for (let o = 0; o < data.length; o += 3) {
    if (data[o + 2] < 60) continue;
    warm++; r += data[o]; bl += data[o + 2];
  }
  const excess = bl ? Math.round((r / bl) * 10000) : 0;
  f.warm = warm;
  f.excess = excess;
  // THE ROLL, READ FROM THE SHAPE (Carl: "its when the rim is at the top and after a quarter roll"): the pill's visible
  // height — rows holding any lit pixel. Face-on is the tallest, edge-on (the quarter roll) the thinnest — so ON and OFF
  // runs can be compared at the same point of the roll without reading the scene's clock.
  const { info } = await sharp(f.png).metadata().then((m) => ({ info: m }));
  let rows = 0;
  for (let y = 0; y < info.height; y++) {
    let lit = false;
    for (let x = 0; x < info.width && !lit; x++) { const o = (y * info.width + x) * 3; if (data[o + 2] > 45) lit = true; }
    if (lit) rows++;
  }
  f.rows = rows;
  // brightness of the pill's lit pixels (mean of R+G+B over pixels with blue > 45)
  let sum = 0, n = 0;
  for (let o = 0; o < data.length; o += 3) if (data[o + 2] > 45) { sum += data[o] + data[o + 1] + data[o + 2]; n++; }
  f.bright = n ? +(sum / n).toFixed(1) : 0;
}
writeFileSync(join(OUT, "scores.json"), JSON.stringify(frames.map(({ t, warm, excess, rows, bright }) => ({ t, warm, excess, rows, bright }))));
// The THINNEST 12 frames (the quarter roll, edge-on, the front turned up to the cards) — on their own sheet.
const thin = [...frames].sort((a, c) => a.rows - c.rows).slice(0, 12).sort((a, c) => a.t - c.t);
{
  const W = clip.width * 3, H = clip.height * 3;
  const tiles = await Promise.all(thin.map((f) => sharp(f.png).resize(W, H, { kernel: "nearest" }).png().toBuffer()));
  await sharp({ create: { width: W * 3, height: H * 4, channels: 3, background: "#000" } }).composite(tiles.map((input, k) => ({ input, left: (k % 3) * W, top: Math.floor(k / 3) * H }))).png().toFile(join(OUT, "quarter-roll-12-sheet.png"));
}
console.log("quarter roll (thinnest 12): rows", thin.map((f) => f.rows).join(","), " mean brightness", (thin.reduce((s, f) => s + f.bright, 0) / thin.length).toFixed(1), " red/blue×1e4", Math.round(thin.reduce((s, f) => s + f.excess, 0) / thin.length));
const tall = [...frames].sort((a, c) => c.rows - a.rows).slice(0, 12);
console.log("face-on (tallest 12): rows", tall.map((f) => f.rows).join(","), " mean brightness", (tall.reduce((s, f) => s + f.bright, 0) / tall.length).toFixed(1), " red/blue×1e4", Math.round(tall.reduce((s, f) => s + f.excess, 0) / tall.length));
const top = [...frames].sort((a, c) => c.excess - a.excess).slice(0, 12).sort((a, c) => a.t - c.t);
const W = clip.width * 3, H = clip.height * 3, COLS = 3;
const tiles = await Promise.all(top.map((f) => sharp(f.png).resize(W, H, { kernel: "nearest" }).png().toBuffer()));
await sharp({ create: { width: W * COLS, height: H * Math.ceil(top.length / COLS), channels: 3, background: "#000" } })
  .composite(tiles.map((input, k) => ({ input, left: (k % COLS) * W, top: Math.floor(k / COLS) * H })))
  .png()
  .toFile(join(OUT, "warmest-12-sheet.png"));
for (const f of top) await sharp(f.png).resize(W, H, { kernel: "nearest" }).toFile(join(OUT, `warm-t${String(f.t).padStart(5, "0")}.png`));
const ex = frames.map((f) => f.excess); // red/blue × 10 000
console.log(`${frames.length} frames over ${frames.at(-1).t} ms (~${Math.round(frames.length / SECONDS)} fps)`);
console.log(`warm excess per frame: min ${Math.min(...ex)}  median ${ex.sort((a, c) => a - c)[Math.floor(ex.length / 2)]}  max ${Math.max(...frames.map((f) => f.excess))}`);
console.log("warmest 12 at t =", top.map((f) => f.t).join(", "), "ms");
console.log("⚠ NOT WATCHED: Carl's GPU/Chrome; compare against a cardglow=0 run for the floor. →", OUT);
