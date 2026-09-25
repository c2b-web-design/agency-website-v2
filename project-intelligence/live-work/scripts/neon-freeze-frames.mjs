/**
 * THE IGNITION, FROZEN AT CHOSEN MOMENTS — CA's rim brightness at each. 25 September 2026 (third session), to see
 * the new flicker in the wall pair's grow on the page (Carl: "As it grows can you put another flicker in?").
 * `?neont=<ms>` freezes the track at that moment (D-087's control); the moving light is held off the cards.
 * Prints CA's top-rim core colour and luma per moment; saves each frame.
 *   node --no-warnings project-intelligence/live-work/scripts/neon-freeze-frames.mjs 1700 1850 1960 2100 2300
 * ⚠ NOT WATCHED: the motion between the frozen moments — Carl judges the flicker moving.
 */
import { chromium } from "playwright";
import sharp from "sharp";
import { mkdirSync } from "node:fs";
const out = "project-intelligence/live-work/screenshots/neon-freeze-25-september";
mkdirSync(out, { recursive: true });
const times = process.argv.slice(2).map(Number);
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const ctx = await b.newContext({ viewport: { width: 1412, height: 700 }, deviceScaleFactor: 1.36 });
const shoot = async (t) => {
  const p = await ctx.newPage();
  await p.goto(`http://localhost:3000/about?lighthelpers=0&lmfreeze=0.45&neont=${t}#roles`, { waitUntil: "networkidle" });
  await p.waitForTimeout(2500);
  const png = await p.screenshot({ path: `${out}/t${t}.png` });
  await p.close();
  return png;
};
await shoot(0); // warm-up: the first load in a context lands before the #roles scroll
for (const t of times) {
  const { data, info } = await sharp(await shoot(t)).raw().toBuffer({ resolveWithObject: true });
  let best = [0, 0, 0], bl = -1;
  for (let y = 290; y <= 325; y++) { const o = (y * info.width + 600) * info.channels; const l = data[o] + data[o + 1] + data[o + 2]; if (l > bl) { bl = l; best = [data[o], data[o + 1], data[o + 2]]; } }
  const luma = 0.2126 * best[0] + 0.7152 * best[1] + 0.0722 * best[2];
  console.log(`t=${String(t).padStart(5)} ms   CA rim core #${best.map((v) => v.toString(16).padStart(2, "0")).join("")}   luma ${luma.toFixed(0)}`);
}
await b.close();
