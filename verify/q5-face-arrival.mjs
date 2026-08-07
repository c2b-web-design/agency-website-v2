/**
 * WHAT does the card's face look like as it arrives?
 *
 * ⚠ CARL, 6 August: *"The cards should not appear with a full grey face even
 * though it fades."*
 *
 * A fade from grey is still a grey card fading. The face should arrive AS
 * GLASS -- reading the ground through it -- not as a flat filled shape that
 * happens to be getting brighter.
 *
 * This saves the card region at intervals across the rise so the arrival can be
 * SEEN rather than inferred from a mean. Means are what hid this: a flat grey
 * face and a glassy one can share a luminance.
 *
 * ⚠ AND IT PRINTS SPREAD ALONGSIDE THE MEAN. A flat face has LOW stdev -- every
 * pixel the same. A glass face reading the ground and the rim through itself
 * has structure, so stdev rises with it. That is the number that tells the two
 * apart when the mean cannot.
 *
 *   node verify/q5-face-arrival.mjs
 */

import { chromium } from "playwright";
import sharp from "sharp";
import { mkdirSync } from "node:fs";

mkdirSync("verify/out/face", { recursive: true });

const browser = await chromium.launch({
  headless: false,
  args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

await page.goto("http://localhost:3000/start", { waitUntil: "networkidle" });
await page.getByRole("button", { name: /begin/i }).click();

const card = await page.getByTestId("answer-card-hover-0").boundingBox({ timeout: 20000 });
if (!card) throw new Error("card 0 not found");

const frames = [];
const t0 = Date.now();
while (Date.now() - t0 < 2600) {
  const buf = await page.screenshot({ clip: card });
  const stat = await sharp(buf).greyscale().stats();
  frames.push({
    t: Date.now() - t0,
    mean: stat.channels[0].mean,
    stdev: stat.channels[0].stdev,
    min: stat.channels[0].min,
    max: stat.channels[0].max,
    buf,
  });
}
await page.close();
await browser.close();

console.log("\n  t(ms)    mean   stdev    min    max");
let next = 0;
const kept = [];
for (const f of frames) {
  if (f.t >= next) {
    console.log(
      `  ${String(f.t).padStart(5)}  ${f.mean.toFixed(2).padStart(6)}  ${f.stdev.toFixed(2).padStart(6)}` +
        `  ${String(f.min).padStart(5)}  ${String(f.max).padStart(5)}`,
    );
    kept.push(f);
    next = f.t + 150;
  }
}

for (const f of kept) {
  await sharp(f.buf).toFile(`verify/out/face/t${String(f.t).padStart(4, "0")}.png`);
}
console.log(`\n  ${kept.length} frames saved to verify/out/face/`);
console.log("\n⚠ READING IT: while the face is a FLAT GREY FILL, stdev stays low");
console.log("  and min/max sit close together -- every pixel much the same. As");
console.log("  the face becomes glass it reads the rim and the ground through");
console.log("  itself, so stdev and the min/max span both open up. A card that");
console.log("  brightens with a FLAT profile is the defect Carl is describing.");
