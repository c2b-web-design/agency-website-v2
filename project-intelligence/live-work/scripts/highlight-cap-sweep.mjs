/**
 * THE FACE'S HIGHLIGHT CAP — the sweep. 27 September 2026. Carl: "make the text legible at all times while
 * preserving the 3D effect the light has upon the card face… if that is the best route just build it, i will
 * judge by eye." The cap (`highlightCap`, `about-card-mesh.tsx`) limits the face's DIRECT specular only.
 *
 * Method (as `light-blowout-scan-27-september.mjs`): ONE light (`lmonly=1`) held (`lmfreeze`) at each card's worst
 * lap positions from the raw scan, dips OFF, rims held full (`neon=full`), text static. Per cap × position:
 *   worst  = the worst word-sized patch (48 × 24 device px) of THAT card: median |L(text) − L(bare)| ÷ its own
 *            ambient-only median. 1.00 = as legible as with no moving light; < 1 = washed.
 *   lift   = the EFFECT ON THE FACE: median over the card's box of L(bare, light) − L(bare, ambient only) —
 *            how much the moving light still brightens the glass. Must stay well above 0 (Carl: "preserving
 *            the 3D effect").
 *   peak   = the 99.5th percentile of L(bare, light) − L(bare, ambient) in the box — the HOTSPOT's own lift. ⚠ First
 *            written as raw luma, which read the lit rims (254) at every cap; corrected the same day.
 * Also an IDENTITY CHECK: with the moving light at 0 (`lmexp=0`), cap on vs `hlcap=0` must be pixel-identical in
 * every card box (nothing else is a direct light on plain /about with the rims' emissive).
 *   node --no-warnings project-intelligence/live-work/scripts/highlight-cap-sweep.mjs [caps=0,2,1,0.5,0.3,0.2]
 * ⚠ NOT WATCHED: both lights together; motion (Carl's eye); the bevel (not capped); whether a ratio READS.
 */
import { chromium } from "playwright";
import sharp from "sharp";
import { mkdirSync, writeFileSync } from "node:fs";

const caps = (process.argv[2] ?? "0,2,1,0.5,0.3,0.2").split(",").map(Number);
const out = `project-intelligence/live-work/screenshots/highlight-cap-27-september`;
mkdirSync(out, { recursive: true });
const BOX = { CS: [590, 60, 1090, 250], CA: [395, 290, 810, 535], CB: [860, 325, 1170, 535], CD: [630, 675, 1000, 860] };
/* The worst lap positions per card from the raw scan (27 September, rims lit, dips off). CA never washed —
   0.08 is its brightest moment, kept to watch the lift. */
const POS = { CS: [0.7, 0.72, 0.8], CB: [0.62, 0.64], CD: [0.26, 0.36], CA: [0.08] };

const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const ctx = await b.newContext({ viewport: { width: 1412, height: 700 }, deviceScaleFactor: 1.36 });
/* ⚠ The first load of a context lands before the #roles scroll — thrown away. */
{ const p = await ctx.newPage(); await p.goto("http://localhost:3000/about#roles", { waitUntil: "networkidle" }); await p.waitForTimeout(1500); await p.close(); }
async function luma(query) {
  const p = await ctx.newPage();
  await p.goto(`http://localhost:3000/about?lighthelpers=0&neon=full&seq=ca,cb,cd,cs&textstatic=1&${query}#roles`, { waitUntil: "networkidle" });
  await p.waitForTimeout(2500);
  const png = await p.screenshot();
  await p.close();
  const { data, info } = await sharp(png).raw().toBuffer({ resolveWithObject: true });
  const L = new Float32Array(info.width * info.height);
  for (let i = 0; i < L.length; i++) {
    const o = i * info.channels;
    L[i] = 0.2126 * data[o] + 0.7152 * data[o + 1] + 0.0722 * data[o + 2];
  }
  return { L, w: info.width, png };
}
const median = (a) => { if (!a.length) return NaN; const s = [...a].sort((x, y) => x - y); return s[s.length >> 1]; };
const pct = (a, q) => { const s = [...a].sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.floor(q * s.length))]; };
const boxIdx = (id, w) => { const [x0, y0, x1, y1] = BOX[id]; const r = []; for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) r.push(y * w + x); return r; };

/* Masks from the static rig (brightest, most even); references under ambient alone. */
const rigText = await luma("lightmove=0");
const rigBare = await luma("lightmove=0&text=0");
const ambText = await luma("lmexp=0");
const ambBare = await luma("lmexp=0&text=0");
const w = rigText.w;

/* IDENTITY: ambient only, cap on (default) vs off. */
const ambBareOff = await luma("lmexp=0&text=0&hlcap=0");
for (const id of Object.keys(BOX)) {
  const idx = boxIdx(id, w);
  const diff = idx.filter((i) => Math.abs(ambBare.L[i] - ambBareOff.L[i]) > 1).length;
  console.log(`identity (moving light 0, cap default vs hlcap=0) ${id}: ${diff} of ${idx.length} px differ by > 1 luma ${diff === 0 ? "✅" : "⛔"}`);
}

const TW = 48, TH = 24;
const patches = {};
for (const id of Object.keys(BOX)) {
  const byTile = new Map();
  for (const i of boxIdx(id, w)) {
    if (Math.abs(rigText.L[i] - rigBare.L[i]) <= 12) continue;
    const k = `${Math.floor((i % w) / TW)},${Math.floor(i / w / TH)}`;
    if (!byTile.has(k)) byTile.set(k, []);
    byTile.get(k).push(i);
  }
  patches[id] = [...byTile.values()].filter((t) => t.length >= 40)
    .map((idx) => ({ idx, amb: median(idx.map((i) => Math.abs(ambText.L[i] - ambBare.L[i]))) }))
    .filter((t) => t.amb >= 8);
}

console.log(`\ncap   | ${Object.entries(POS).flatMap(([id, ps]) => ps.map((f) => `${id}@${f}`.padEnd(22))).join("| ")}`);
console.log("      (worst patch ÷ ambient · lift over ambient, luma · bare peak luma)");
const rows = [];
for (const cap of caps) {
  const cells = [];
  for (const [id, ps] of Object.entries(POS)) for (const f of ps) {
    const q = `lmfreeze=${f.toFixed(4)}&lmonly=1&lmdip=0&hlcap=${cap}`;
    const on = await luma(q);
    const bare = await luma(`${q}&text=0`);
    const tag = `cap${cap}-${id}-${Math.round(f * 1000)}`;
    writeFileSync(`${out}/${tag}.png`, on.png);
    let worst = Infinity;
    for (const t of patches[id]) worst = Math.min(worst, median(t.idx.map((i) => Math.abs(on.L[i] - bare.L[i]))) / Math.max(t.amb, 1));
    const idx = boxIdx(id, w);
    const lift = median(idx.map((i) => bare.L[i] - ambBare.L[i]));
    const peak = pct(idx.map((i) => bare.L[i] - ambBare.L[i]), 0.995); // the HOTSPOT: what the light adds, rims cancel
    cells.push({ id, f, worst, lift, peak });
  }
  rows.push({ cap, cells });
  console.log(`${String(cap).padEnd(5)} | ${cells.map((c) => `${c.worst.toFixed(2)} · +${c.lift.toFixed(1)} · ${c.peak.toFixed(0)}`.padEnd(22)).join("| ")}`);
}
writeFileSync(`${out}/sweep.json`, JSON.stringify(rows, null, 1));
await b.close();
