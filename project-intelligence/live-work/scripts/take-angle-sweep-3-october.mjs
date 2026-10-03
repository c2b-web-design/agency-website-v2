/**
 * THE TAKE LIGHT'S ANGLE, SWEPT — 3 October 2026. Carl's brief: "1. The glass face should clearly read as frosted
 * glass and its geometry visible. 2. The text should be legible and be noticeably 3d, extruded."
 * One directional light (`TakeLight`) on the baseline (no other light), NEON OFF so a glint on the rim/bevel is not
 * hidden in the tube. Per direction (`takeoff` off the normal, `takeaz` round it): a bare load and a text load; the
 * light's CONTRIBUTION = bare − bare with the take light off. Per card:
 *   glint = p99.8 of the contribution (the sharpest hotspot: band or glint) · sheen = its median
 *   shape = p90 − p10 of the contribution (how much the light varies across the dome) · text = median |text − bare|
 *   over pixels where the letters stand > 6 luma off (and how many).
 * ⚠ NOT WATCHED: the neon on; colour (luma only); whether it READS — Carl's eye. Fixed takei / takemix.
 *   node --no-warnings project-intelligence/live-work/scripts/take-angle-sweep-3-october.mjs [json {name: query}]
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import sharp from "sharp";

const out = "project-intelligence/live-work/screenshots/take-angle-sweep-3-october";
mkdirSync(out, { recursive: true });
const BOX = { CS: [590, 60, 1090, 250], CA: [395, 290, 810, 535], CB: [860, 325, 1170, 535], CD: [630, 675, 1000, 860] };
let CONFIGS = {};
if (process.argv[2]) CONFIGS = JSON.parse(process.argv[2]);
else for (const off of [35, 50, 65, 78]) for (const az of [45, 90, 135, 180]) CONFIGS[`off ${off} az ${az}`] = `takeoff=${off}&takeaz=${az}`;

const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const ctx = await b.newContext({ viewport: { width: 1412, height: 700 }, deviceScaleFactor: 1.36 });
async function luma(q, save) {
  const p = await ctx.newPage();
  await p.goto(`http://localhost:3000/about?neon=off&${q}#roles`, { waitUntil: "networkidle" });
  await p.waitForTimeout(6000);
  const top = await p.evaluate(() => document.querySelector("#roles").getBoundingClientRect().top);
  const png = await p.screenshot(save ? { path: save } : {});
  await p.close();
  if (Math.abs(top) > 2) throw new Error(`load landed off #roles (top ${top}) — rerun`);
  const { data, info } = await sharp(png).raw().toBuffer({ resolveWithObject: true });
  const L = new Float32Array(info.width * info.height);
  for (let i = 0; i < L.length; i++) { const o = i * info.channels; L[i] = 0.2126 * data[o] + 0.7152 * data[o + 1] + 0.0722 * data[o + 2]; }
  return { L, w: info.width };
}
const pct = (a, q) => { const s = Float32Array.from(a).sort(); return s[Math.min(s.length - 1, Math.floor(q * s.length))]; };
const ref = await luma("take=0&text=0");
console.log("per card: glint (p99.8) · sheen (median) · shape (p90−p10) · text (median, n px)");
for (const [name, q] of Object.entries(CONFIGS)) {
  const slug = name.replace(/[^a-z0-9]+/gi, "-");
  const bare = await luma(`${q}&text=0`, `${out}/${slug}-bare.png`);
  const t = await luma(q, `${out}/${slug}.png`);
  const cells = Object.entries(BOX).map(([id, [x0, y0, x1, y1]]) => {
    const c = [], d = [];
    for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
      const i = y * bare.w + x;
      c.push(bare.L[i] - ref.L[i]);
      const dt = Math.abs(t.L[i] - bare.L[i]);
      if (dt > 6) d.push(dt);
    }
    return `${id} ${pct(c, 0.998).toFixed(0).padStart(3)}·${pct(c, 0.5).toFixed(0).padStart(3)}·${(pct(c, 0.9) - pct(c, 0.1)).toFixed(0).padStart(3)}·${(d.length ? pct(d, 0.5) : 0).toFixed(0).padStart(3)} (${String(d.length).padStart(5)})`;
  });
  console.log(`${name.padEnd(16)} | ${cells.join(" | ")}`);
}
await b.close();
