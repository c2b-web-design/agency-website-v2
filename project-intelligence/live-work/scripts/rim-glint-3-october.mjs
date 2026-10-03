/**
 * THE GLINT ON CA's AND CS's TOP-LEFT RIM CORNERS — 3 October 2026. Carl, on the new grazing key: "Its better, but
 * the two reflections are a problem. When the rim is on in CA reflection looks like the rim has a defect in this area."
 * Rims lit (`neon=full`, 11 s settle), moving light at 0, text off. States: default · key off · fill off · old rig.
 * Prints the peak and the count of near-white pixels in a box round each top-left corner; saves crops.
 * ⚠ NOT WATCHED: the moving light's own rim glints; the other corners; Carl's Chrome.
 *   node --no-warnings project-intelligence/live-work/scripts/rim-glint-3-october.mjs [json-states]
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import sharp from "sharp";

const out = "project-intelligence/live-work/screenshots/rim-glint-3-october";
mkdirSync(out, { recursive: true });
const STATES = process.argv[2] ? JSON.parse(process.argv[2]) : {
  default: "",
  "key off": "keyi=0",
  "fill off": "filli=0",
  "old rig": "keypos=1,2,2&keyi=0.5&fillpos=5,2,-2&filli=2.6&ambi=0.2",
};
/* Device px boxes round each card's top-left corner (CA from ROOM_CARD_GUIDES at 1412×700 @1.36, CS likewise). */
const CORNER = { CA: [385, 280, 470, 345], CS: [585, 55, 670, 120] };
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const ctx = await b.newContext({ viewport: { width: 1412, height: 700 }, deviceScaleFactor: 1.36 });
for (const [name, q] of Object.entries(STATES)) {
  const p = await ctx.newPage();
  await p.goto(`http://localhost:3000/about?lighthelpers=0&neon=full&lmexp=0&text=0&${q}#roles`, { waitUntil: "networkidle" });
  await p.waitForTimeout(11000);
  const y = await p.evaluate(() => document.querySelector("#roles").getBoundingClientRect().top);
  const png = await p.screenshot();
  await p.close();
  const slug = name.replace(/[^a-z0-9]+/gi, "-");
  const { data, info } = await sharp(png).raw().toBuffer({ resolveWithObject: true });
  const cells = [];
  for (const [id, [x0, y0, x1, y1]] of Object.entries(CORNER)) {
    let peak = 0, white = 0;
    for (let yy = y0; yy < y1; yy++) for (let x = x0; x < x1; x++) {
      const o = (yy * info.width + x) * info.channels;
      const r = data[o], g = data[o + 1], bl = data[o + 2];
      const l = 0.2126 * r + 0.7152 * g + 0.0722 * bl;
      if (l > peak) peak = l;
      if (bl > 200 && g > 200) white++; // near-WHITE, not the orange tube (whose blue stays low)
    }
    cells.push(`${id} peak ${peak.toFixed(0)} · white px ${white}`);
    await sharp(png).extract({ left: x0 - 30, top: y0 - 30, width: x1 - x0 + 60, height: y1 - y0 + 60 }).resize({ width: (x1 - x0 + 60) * 3, kernel: "nearest" }).toFile(`${out}/${slug}-${id}.png`);
  }
  console.log(`${name.padEnd(10)} (#roles top ${y.toFixed(0)}) | ${cells.join(" | ")}`);
}
await b.close();
