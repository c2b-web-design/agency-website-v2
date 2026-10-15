/** THE SELECTED CARDS' WARMTH ON `Next step` — MEASURED (15 October 2026, session 3). Carl: "The effect must be subtle. If
 *  all 5 cards are pressed we dont want it to radically alter the blue colour, just enough to say 'same world'. As for
 *  distance, enough for one card to have influence."
 *  /start at Carl's screen (1920 × 952, DPR 1 → zoom 1.36), Q5. For each selection, two arms in fresh pages: the warmth ON
 *  (the default) and OFF (`?cardglow=0`) — the same selection, so the only difference is the warmth. The button HELD face-on
 *  (the pointer over it): the pill's mean colour (whole, and its top third) and the words' worst contrast; then 6 frames
 *  ROLLING (the pointer away). Frames enlarged 4×.
 *  Usage: node …/card-glow-measure-15-october.mjs <outDir> [baseQuery]
 *  ⚠ NOT WATCHED: Carl's GPU/Chrome; Q4–Q1; the moving lamp's phase (it differs between arms — the held face-on frame is
 *  compared, rolling frames are for the eye only). */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
const [OUT, BASE = ""] = process.argv.slice(2);
mkdirSync(OUT, { recursive: true });
const SELECTIONS = process.env.ONLY ? { [process.env.ONLY]: { "one-bottom": [3], "one-top": [1], "all-five": [0, 1, 2, 3, 4] }[process.env.ONLY] } : { "one-bottom": [3], "one-top": [1], "all-five": [0, 1, 2, 3, 4] };
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
async function arm(sel, glowOff) {
  const ctx = await b.newContext({ viewport: { width: 1920, height: 952 }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  const q = [BASE.replace(/^\?/, ""), glowOff ? "cardglow=0" : (process.env.GLOW ? "cardglow=" + process.env.GLOW : "")].filter(Boolean).join("&");
  await p.goto("http://localhost:3000/start" + (q ? "?" + q : ""), { waitUntil: "load" });
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
  await p.waitForTimeout(3000); // the filaments to their flare and hold
  const pill = await p.locator("[data-family-next]").boundingBox();
  // HELD face-on: the pointer over the button.
  await p.mouse.move(pill.x + pill.width / 2, pill.y + pill.height / 2);
  await p.waitForTimeout(2500);
  const clip = { x: Math.floor(pill.x) - 6, y: Math.floor(pill.y) - 6, width: Math.ceil(pill.width) + 12, height: Math.ceil(pill.height) + 12 };
  const held = await p.screenshot({ clip });
  // ROLLING: the pointer away.
  await p.mouse.move(5, 5);
  const rolling = [];
  for (let k = 0; k < 6; k++) {
    await p.waitForTimeout(450);
    rolling.push(await p.screenshot({ clip }));
  }
  await ctx.close();
  return { held, rolling };
}
async function stats(png) {
  const { data, info } = await sharp(png).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const acc = (y0, y1) => {
    let r = 0, g = 0, bl = 0, n = 0;
    for (let y = y0; y < y1; y++)
      for (let x = 8; x < info.width - 8; x++) {
        const o = (y * info.width + x) * 3;
        // the pill's body only: skip the dark page round it and the ice-blue words (bright, near-neutral)
        const L = 0.2126 * data[o] + 0.7152 * data[o + 1] + 0.0722 * data[o + 2];
        if (L < 12) continue;
        if (data[o] > 150 && data[o + 1] > 170) continue;
        r += data[o]; g += data[o + 1]; bl += data[o + 2]; n++;
      }
    return n ? [r / n, g / n, bl / n].map((v) => +v.toFixed(1)) : [0, 0, 0];
  };
  return { whole: acc(6, info.height - 6), top: acc(6, Math.round(info.height * 0.4)) };
}
const d = (a, c) => a.map((v, i) => (v - c[i] >= 0 ? "+" : "") + (v - c[i]).toFixed(1)).join(" / ");
for (const [name, sel] of Object.entries(SELECTIONS)) {
  const on = await arm(sel, false);
  const off = await arm(sel, true);
  for (const [tag, r] of [["on", on], ["off", off]]) {
    await sharp(r.held).resize({ width: (await sharp(r.held).metadata()).width * 4, kernel: "nearest" }).toFile(join(OUT, `${name}-${tag}-held-4x.png`));
    for (let k = 0; k < r.rolling.length; k++) await sharp(r.rolling[k]).resize({ width: (await sharp(r.rolling[k]).metadata()).width * 4, kernel: "nearest" }).toFile(join(OUT, `${name}-${tag}-roll${k}-4x.png`));
  }
  const sOn = await stats(on.held), sOff = await stats(off.held);
  console.log(`${name.padEnd(10)} held face-on, mean RGB  off ${sOff.whole.join("/")}  on ${sOn.whole.join("/")}  Δ ${d(sOn.whole, sOff.whole)}   | top third Δ ${d(sOn.top, sOff.top)}`);
}
console.log("⚠ NOT WATCHED: Carl's GPU/Chrome, Q4–Q1; rolling frames differ in the lamp's phase (for the eye only). →", OUT);
await b.close();
