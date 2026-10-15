/** THE TUBE TAKE MADE THE DEFAULT (15 October 2026, session 3). Carl: "Yes put it on start".
 *  Claim under test: plain /start now draws what `?tube=1.5&rimuniform=1&tubebloom=1` drew (R-066).
 *  Three arms, each a fresh page at Carl's screen (1920 × 952, DPR 1 → scale 1.36), Q5, the five cards at rest and card 1
 *  SELECTED: A = the door URL, A2 = the door URL again (the CONTROL — run-to-run noise), B = plain /start.
 *  Plus C = `?tube=2&rimuniform=0&tubebloom=0` — the previous take, which must DIFFER (proves the arms can see a change).
 *  Usage: node …/tube-default-parity-15-october.mjs <outDir>
 *  ⚠ NOT WATCHED: Carl's GPU and Chrome (Playwright's Chromium); motion between the frames; hover; phones; Q4–Q1. */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
const [OUT] = process.argv.slice(2);
mkdirSync(OUT, { recursive: true });
const ARMS = [
  ["A-door", "?tube=1.5&rimuniform=1&tubebloom=1"],
  ["A2-door", "?tube=1.5&rimuniform=1&tubebloom=1"],
  ["B-plain", ""],
  ["C-previous", "?tube=2&rimuniform=0&tubebloom=0"],
];
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const shots = {};
for (const [tag, q] of ARMS) {
  const ctx = await b.newContext({ viewport: { width: 1920, height: 952 }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  await p.goto("http://localhost:3000/start" + q, { waitUntil: "load" });
  await p.waitForTimeout(9000);
  await p.getByRole("button", { name: /begin/i }).click();
  const grid = p.locator(".enquiry-answer-grid");
  await grid.waitFor({ state: "visible", timeout: 30000 });
  await p.mouse.move(5, 5);
  await p.waitForTimeout(5000);
  const g = await grid.boundingBox();
  const clip = { x: Math.floor(g.x) - 8, y: Math.floor(g.y) - 8, width: Math.ceil(g.width) + 16, height: Math.ceil(g.height) + 16 };
  shots[tag] = { rest: await p.screenshot({ clip }) };
  await p.getByTestId("answer-card-hover-0").click();
  await p.mouse.move(5, 5);
  await p.waitForTimeout(2500);
  shots[tag].selected = await p.screenshot({ clip });
  for (const s of ["rest", "selected"]) await sharp(shots[tag][s]).toFile(join(OUT, `${tag}-${s}.png`));
  console.log(tag, "zoom", await p.evaluate(() => document.documentElement.currentCSSZoom), "grid", clip.width, "×", clip.height);
  await ctx.close();
}
async function diff(x, y) {
  const [a, c] = await Promise.all([x, y].map((png) => sharp(png).removeAlpha().raw().toBuffer({ resolveWithObject: true })));
  if (a.info.width !== c.info.width || a.info.height !== c.info.height) return `SIZE DIFFERS ${a.info.width}×${a.info.height} vs ${c.info.width}×${c.info.height}`;
  let changed = 0, maxd = 0;
  for (let i = 0; i < a.data.length; i += 3) {
    const d = Math.max(Math.abs(a.data[i] - c.data[i]), Math.abs(a.data[i + 1] - c.data[i + 1]), Math.abs(a.data[i + 2] - c.data[i + 2]));
    if (d > 2) changed++;
    if (d > maxd) maxd = d;
  }
  const n = a.data.length / 3;
  return `${((changed / n) * 100).toFixed(3)}% px differ by > 2 (max ${maxd})`;
}
for (const s of ["rest", "selected"]) {
  console.log(`\n${s}:`);
  console.log("  control  A vs A2 (door twice)   ", await diff(shots["A-door"][s], shots["A2-door"][s]));
  console.log("  claim    A vs B  (door vs plain)", await diff(shots["A-door"][s], shots["B-plain"][s]));
  console.log("  can see  A vs C  (door vs prev) ", await diff(shots["A-door"][s], shots["C-previous"][s]));
}
console.log("\n⚠ NOT WATCHED: Carl's GPU/Chrome, motion, hover, phones, Q4–Q1. →", OUT);
await b.close();
