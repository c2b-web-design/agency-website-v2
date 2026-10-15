/** DOES ANYTHING ON THE CARDS' CANVAS STILL TRANSMIT? — the ground plane's test (15 October 2026, session 3).
 *  The plane (`answer-card-backdrop.tsx`, #101010, 2× the grid) exists because three's transmission pass clears its target
 *  to WHITE on an `alpha: true` canvas. If nothing transmits any more, removing it changes ONLY the gaps between the cards
 *  (#101010 → the page's own gradient); the cards themselves stay pixel-identical. If anything transmits, the cards change
 *  (August: 0.0% dark pixels inside the card).
 *  /start at Carl's screen (1920 × 952, DPR 1), Q5, the traveller held at 0 (`travint=0`, so frames are comparable); at
 *  rest and card 1 selected; arms: the plane (default) twice (the CONTROL) and `ground=0`. Measured INSIDE each card's box
 *  (inset 3 px — the tube included) and in the GAPS (the grid region outside the boxes).
 *  Usage: node …/ground-plane-parity-15-october.mjs <outDir>
 *  ⚠ NOT WATCHED: Carl's GPU/Chrome; the traveller's light on the cards (held at 0); Q4–Q1; hover. */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
const [OUT] = process.argv.slice(2);
mkdirSync(OUT, { recursive: true });
const ARMS = [["plane", "travint=0"], ["plane2", "travint=0"], ["noground", "travint=0&ground=0"]];
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const shots = {};
let boxesRel = null, clipG = null;
for (const [tag, q] of ARMS) {
  const ctx = await b.newContext({ viewport: { width: 1920, height: 952 }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  const errs = [];
  p.on("console", (m) => m.type() === "error" && errs.push(m.text()));
  await p.goto("http://localhost:3000/start?" + q, { waitUntil: "load" });
  await p.waitForTimeout(9000);
  await p.getByRole("button", { name: /begin/i }).click();
  const grid = p.locator(".enquiry-answer-grid");
  await grid.waitFor({ state: "visible", timeout: 30000 });
  await p.mouse.move(5, 5);
  await p.waitForTimeout(5000);
  const g = await grid.boundingBox();
  const clip = { x: Math.floor(g.x) - 12, y: Math.floor(g.y) - 12, width: Math.ceil(g.width) + 24, height: Math.ceil(g.height) + 24 };
  clipG ??= clip;
  const boxes = [];
  for (let i = 0; i < 5; i++) boxes.push(await p.getByTestId(`answer-card-hover-${i}`).boundingBox());
  boxesRel ??= boxes.map((bx) => ({ x0: Math.round(bx.x - clip.x) + 3, y0: Math.round(bx.y - clip.y) + 3, x1: Math.round(bx.x + bx.width - clip.x) - 3, y1: Math.round(bx.y + bx.height - clip.y) - 3 }));
  shots[tag] = { rest: await p.screenshot({ clip }) };
  await p.getByTestId("answer-card-hover-0").click();
  await p.mouse.move(5, 5);
  await p.waitForTimeout(3000);
  shots[tag].selected = await p.screenshot({ clip });
  for (const s of ["rest", "selected"]) await sharp(shots[tag][s]).toFile(join(OUT, `${tag}-${s}.png`));
  console.log(tag, "console errors:", errs.length);
  await ctx.close();
}
async function diff(x, y) {
  const [a, c] = await Promise.all([x, y].map((png) => sharp(png).removeAlpha().raw().toBuffer({ resolveWithObject: true })));
  const W = a.info.width;
  const inBox = (px, py) => boxesRel.some((bx) => px >= bx.x0 && px < bx.x1 && py >= bx.y0 && py < bx.y1);
  const r = { card: { n: 0, ch: 0, max: 0 }, gap: { n: 0, ch: 0, max: 0, mean: 0 } };
  for (let py = 0; py < a.info.height; py++)
    for (let px = 0; px < W; px++) {
      const o = (py * W + px) * 3;
      const d = Math.max(Math.abs(a.data[o] - c.data[o]), Math.abs(a.data[o + 1] - c.data[o + 1]), Math.abs(a.data[o + 2] - c.data[o + 2]));
      const k = inBox(px, py) ? r.card : r.gap;
      k.n++; if (d > 2) k.ch++; if (d > k.max) k.max = d; if (k === r.gap) k.mean += d;
    }
  r.gap.mean /= r.gap.n;
  return `CARDS ${((r.card.ch / r.card.n) * 100).toFixed(3)}% px differ >2 (max ${r.card.max})  |  GAPS ${((r.gap.ch / r.gap.n) * 100).toFixed(1)}% (max ${r.gap.max}, mean ${r.gap.mean.toFixed(2)})`;
}
for (const s of ["rest", "selected"]) {
  console.log(`\n${s}:`);
  console.log("  control  plane vs plane  ", await diff(shots.plane[s], shots.plane2[s]));
  console.log("  test     plane vs none   ", await diff(shots.plane[s], shots.noground[s]));
}
console.log("\n⚠ NOT WATCHED: Carl's GPU/Chrome; the traveller (held at 0); Q4–Q1; hover. →", OUT);
await b.close();
