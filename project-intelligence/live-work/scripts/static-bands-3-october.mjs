/**
 * THE STATIC BANDS ON CA AND CS — 3 October 2026. Carl: "What are the static bands of light on 2 of the cards?"
 * (a pale band along the top of CA's face; a pale arc across CS), seen once the static key and fill came back on.
 * Hypothesis: the static key's DIRECT SPECULAR on the domed face (fixed lights → a fixed highlight).
 * Bare glass (`text=0`), moving light at 0 (`lmexp=0`), rims full; four states:
 *   rig-off  ?lmglobal=0                 — the band should go
 *   rig-on   (plain)                     — the band
 *   nocap    ?hlcap=0                    — if it is direct specular, it gets BRIGHTER without the cap
 * Prints the mean luma in a strip over each band minus the same strip with the rig off.
 * ⚠ NOT WATCHED: which of the two directional lights makes which band; Carl's Chrome.
 *   node --no-warnings project-intelligence/live-work/scripts/static-bands-3-october.mjs
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import sharp from "sharp";

const out = "project-intelligence/live-work/screenshots/static-bands-3-october";
mkdirSync(out, { recursive: true });
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const ctx = await b.newContext({ viewport: { width: 1412, height: 700 }, deviceScaleFactor: 1.36 });
const STATES = { "rig-off": "lmglobal=0", "rig-on": "", nocap: "hlcap=0" };
/* Device-px strips over each band, read off the 3 October frames. */
const STRIP = { CA: [450, 300, 760, 345], CS: [640, 90, 1040, 160] };
const res = {};
for (const [tag, q] of Object.entries(STATES)) {
  const p = await ctx.newPage();
  await p.goto(`http://localhost:3000/about?lighthelpers=0&neon=full&lmexp=0&text=0&${q}#roles`, { waitUntil: "networkidle" });
  await p.waitForTimeout(6000);
  const png = await p.screenshot({ path: `${out}/${tag}.png` });
  await p.close();
  const { data, info } = await sharp(png).raw().toBuffer({ resolveWithObject: true });
  res[tag] = {};
  for (const [id, [x0, y0, x1, y1]] of Object.entries(STRIP)) {
    let s = 0, n = 0;
    for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) { const o = (y * info.width + x) * info.channels; s += 0.2126 * data[o] + 0.7152 * data[o + 1] + 0.0722 * data[o + 2]; n++; }
    res[tag][id] = s / n;
  }
  await sharp(png).extract({ left: 395, top: 60, width: 700, height: 480 }).toFile(`${out}/${tag}-crop.png`);
}
await b.close();
for (const id of Object.keys(STRIP)) console.log(`${id}: rig-off ${res["rig-off"][id].toFixed(1)} · rig-on ${res["rig-on"][id].toFixed(1)} (+${(res["rig-on"][id] - res["rig-off"][id]).toFixed(1)}) · rig-on, no cap ${res.nocap[id].toFixed(1)} (+${(res.nocap[id] - res["rig-off"][id]).toFixed(1)})`);
