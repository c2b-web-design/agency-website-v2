/** THE BEVEL'S CEILING AT CB's INNER TOP-LEFT CORNER — 3 October 2026. Carl: "If you can get it down to barely
 *  noticeable, thats ok." Neon lit (the baseline), take light at its default. Per `bevelcap`: the tick's peak luma
 *  (device px 870–886 × 339–355) minus the median of the face just right of it (888–905 × 342–356); crops ×4 stacked.
 *  ⚠ NOT WATCHED: the other 15 corners; the moving text; Carl's Chrome. */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import sharp from "sharp";
const out = "project-intelligence/live-work/screenshots/bevel-cap-sweep-3-october";
mkdirSync(out, { recursive: true });
const STATES = process.argv[2] ? JSON.parse(process.argv[2]) : { ref: "bevelcap=0.001", "uncapped": "bevelcap=0", "0.1": "bevelcap=0.1", "0.05": "bevelcap=0.05", "0.03": "bevelcap=0.03", "0.015": "bevelcap=0.015" };
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const ctx = await b.newContext({ viewport: { width: 1412, height: 700 }, deviceScaleFactor: 1.36 });
const crops = [];
const shots = {};
for (const [name, q] of Object.entries(STATES)) {
  const p = await ctx.newPage();
  await p.goto(`http://localhost:3000/about?${q}#roles`, { waitUntil: "networkidle" });
  await p.waitForTimeout(6000);
  const png = await p.screenshot();
  await p.close();
  shots[name] = await sharp(png).raw().toBuffer({ resolveWithObject: true });
  const c = await sharp(png).extract({ left: 830, top: 300, width: 160, height: 110 }).resize({ width: 480, kernel: "nearest" }).toBuffer();
  crops.push(c);
}
/* THE TICK = what each state adds over the bevel with its highlight all but removed (), max over CB's corner. */
const ref = shots.ref;
const Lof = (sh, x, y) => { const o = (y * sh.info.width + x) * sh.info.channels; return 0.2126 * sh.data[o] + 0.7152 * sh.data[o + 1] + 0.0722 * sh.data[o + 2]; };
for (const [name, sh] of Object.entries(shots)) {
  if (name === 'ref') continue;
  let mx = 0, at = '';
  for (let y = 320; y < 380; y++) for (let x = 850; x < 920; x++) { const d = Lof(sh, x, y) - Lof(ref, x, y); if (d > mx) { mx = d; at = x + ',' + y; } }
  console.log(name.padEnd(9) + ' the tick stands ' + mx.toFixed(0) + ' luma above the bevel without highlight (at ' + at + ')');
}
await sharp({ create: { width: 480, height: crops.length * 340, channels: 3, background: "#000" } }).composite(crops.map((c, i) => ({ input: c, left: 0, top: i * 340 }))).png().toFile(`${out}/stack.png`);
await b.close();
