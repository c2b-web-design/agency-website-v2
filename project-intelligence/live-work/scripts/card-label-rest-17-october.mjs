/** THE CARDS' LABELS AT REST, ICE BLUE (17 October 2026; D-023 16 October, chunk 1). Carl: "start with just the cards
 *  in resting state." /start at Carl's screen (1920 × 952, DPR 1): Begin, the Q5 cards settled, the pointer parked
 *  top-left (no hover). Saves the grid crop every 500 ms over 4 s (the traveller moves over the labels) and the
 *  whole frame once; writes the grid's rect so a measurer can crop the same box.
 *  Usage: node …/card-label-rest-17-october.mjs <outDir> [baseUrl, default http://localhost:3000]
 *  ⚠ NOT WATCHED: hover and selection (later chunks); Q4–Q1 (the same material); Carl's GPU/Chrome. */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const [OUT, BASE = "http://localhost:3000"] = process.argv.slice(2);
mkdirSync(OUT, { recursive: true });
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const ctx = await b.newContext({ viewport: { width: 1920, height: 952 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
const errs = [];
p.on("console", (m) => m.type() === "error" && errs.push(m.text()));
await p.goto(BASE + "/start", { waitUntil: "load" });
const begin = p.getByRole("button", { name: /begin/i });
const t0 = Date.now();
while (Date.now() - t0 < 20000) {
  if ((await begin.getAttribute("aria-disabled")) === null && Date.now() - t0 > 1000) break;
  await p.waitForTimeout(200);
}
await p.waitForTimeout(5200);
await begin.click();
await p.mouse.move(5, 5);
await p.waitForTimeout(7000); // the Q5 reveal and all five cards in
const grid = await p.evaluate(() => {
  const g = document.querySelector(".enquiry-pdepth-0 .enquiry-answer-grid");
  // Chrome's standardised zoom: the rect is ALREADY in screen px under the root `zoom` (measured 17 Oct — × zoom
  // put the box 205 px low).
  const r = g.getBoundingClientRect();
  return { x: r.x, y: r.y, w: r.width, h: r.height, zoom: parseFloat(getComputedStyle(document.documentElement).zoom) || 1 };
});
const pad = 40;
const clip = { x: Math.max(0, grid.x - pad), y: Math.max(0, grid.y - pad), width: grid.w + 2 * pad, height: grid.h + 2 * pad };
writeFileSync(join(OUT, "frame.png"), await p.screenshot());
for (let i = 0; i < 8; i++) {
  writeFileSync(join(OUT, `grid-${i}.png`), await p.screenshot({ clip }));
  await p.waitForTimeout(500);
}
writeFileSync(join(OUT, "grid.json"), JSON.stringify({ grid, clip }, null, 2));
console.log("grid", grid, "clip", clip, "console errors", errs.length, errs.slice(0, 2));
await ctx.close();
await b.close();
console.log("⚠ NOT WATCHED: hover, selection, Q4–Q1, Carl's GPU/Chrome. →", OUT);
