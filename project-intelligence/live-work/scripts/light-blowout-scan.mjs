/**
 * WHERE DOES THE MOVING LIGHT BLOW OUT THE TEXT? 25 September 2026 (third session). Carl: "watch the travelling
 * light and see where it blows out the text. Where it does we need to dial down the intensity gradually… All the
 * text must be legible."
 *
 * Method: ONE light (L1, `?lmonly=1`) held at each lap fraction (`?lmfreeze=`) — L2 is the same light on the same
 * orbit half a lap on, so one light round a whole lap covers every place either visits. At each position the page
 * is rendered TWICE, with the text and without (`?text=0`); the difference at the text's pixels is how far the
 * text stands off the glass behind it. The text's pixels come from the STATIC-RIG pair (`?lightmove=0`), so a
 * washed-out letter is still counted as a letter.
 *   contrast  = median over a card's text pixels of |L(text) − L(no text)|   (L = luma, 0–255)
 *   vs amb    = that ÷ the same with the moving light at 0 (ambient only; the static rig stays off, as on /about)
 *   faint     = share of the card's text pixels standing less than 8 luma off the glass (~3%)
 *   worst     = the WORST WORD-SIZED PATCH (48 × 24 device px, ≥ 40 text pixels): its median contrast ÷ its own
 *               ambient-only median. ⛔ Added after the first full lap: the blowout is the light's REFLECTED
 *               HOTSPOT on the dome — about one word wide — so whole-card medians never moved (all ≥ 1.00×)
 *               while the frames showed "to serve" (CS, 72%) and "brand" (CD, 26%) white on white.
 * Plain `/about#roles`, Carl's viewport and DPR, headed on the real GPU, text static, helpers off.
 *   node --no-warnings project-intelligence/live-work/scripts/light-blowout-scan.mjs [steps=50] [light=1]
 * ⚠ NOT WATCHED: both lights together (run with light=0 to check); motion (Carl's eye); whether a given contrast
 * READS — the 8-luma line is a starting guess for Carl's eye, not a legibility standard.
 */
import { chromium } from "playwright";
import sharp from "sharp";
import { mkdirSync, writeFileSync } from "node:fs";

const steps = +(process.argv[2] ?? 50);
const light = process.argv[3] ?? "1";
const out = `project-intelligence/live-work/screenshots/blowout-scan-25-september`;
mkdirSync(out, { recursive: true });
/* Card regions on screen (device px at 1412×700 CSS, DPR 1.36), generous — read off the frames of this session. */
const BOX = { CS: [590, 60, 1090, 250], CA: [395, 290, 810, 535], CB: [860, 325, 1170, 535], CD: [630, 675, 1000, 860] };

const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const ctx = await b.newContext({ viewport: { width: 1412, height: 700 }, deviceScaleFactor: 1.36 });
async function luma(query) {
  const p = await ctx.newPage();
  await p.goto(`http://localhost:3000/about?lighthelpers=0&${query}#roles`, { waitUntil: "networkidle" });
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

/* The text's pixels, per card, from the STATIC RIG pair (`?lightmove=0` turns the key and fill back on — the
   brightest, most even light, so the mask is complete). ⚠ `?lightmove=0` is NOT "the scene without the moving
   light": it restores the static rig. The reference for "did the moving light hurt it" is AMBIENT ONLY —
   the moving light present at exposure 0 (`?lmexp=0`), everything else as on plain /about. */
const rigText = await luma("lightmove=0");
const rigBare = await luma("lightmove=0&text=0");
const ambText = await luma("lmexp=0");
const ambBare = await luma("lmexp=0&text=0");
for (const [n, r] of Object.entries({ rigText, rigBare, ambText, ambBare })) writeFileSync(`${out}/ref-${n}.png`, r.png);
const mask = {};
for (const [id, [x0, y0, x1, y1]] of Object.entries(BOX)) {
  mask[id] = [];
  for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
    const i = y * rigText.w + x;
    if (Math.abs(rigText.L[i] - rigBare.L[i]) > 12) mask[id].push([i, Math.abs(ambText.L[i] - ambBare.L[i])]);
  }
}
const rig = Object.fromEntries(Object.entries(mask).map(([id, px]) => [id, median(px.map(([i]) => Math.abs(rigText.L[i] - rigBare.L[i])))]));
const base = Object.fromEntries(Object.entries(mask).map(([id, px]) => [id, median(px.map(([, d]) => d))]));
console.log(`text pixels: ${Object.entries(mask).map(([id, px]) => `${id} ${px.length}`).join(" · ")}`);
console.log(`contrast, STATIC RIG (?lightmove=0): ${Object.entries(rig).map(([id, v]) => `${id} ${v.toFixed(1)}`).join(" · ")}`);
console.log(`contrast, AMBIENT ONLY (moving light at 0 — the reference): ${Object.entries(base).map(([id, v]) => `${id} ${v.toFixed(1)}`).join(" · ")}
`);
console.log(`lap   | ${Object.keys(BOX).map((id) => `${id} contrast (vs amb) faint`.padEnd(30)).join(" | ")}`);
console.log("      (faint = share of text pixels < 8 luma off the glass · worst = the worst word-sized patch vs its own ambient contrast, and where)");

/* Word-sized patches per card, with their ambient-only medians. */
const TW = 48, TH = 24;
const patches = {}, dark = {}, total = {};
for (const [id, px] of Object.entries(mask)) {
  const byTile = new Map();
  for (const [i, dAmb] of px) {
    const x = i % rigText.w, y = Math.floor(i / rigText.w);
    const k = `${Math.floor(x / TW)},${Math.floor(y / TH)}`;
    if (!byTile.has(k)) byTile.set(k, { idx: [], amb: [] });
    byTile.get(k).idx.push(i);
    byTile.get(k).amb.push(dAmb);
  }
  /* ⛔ ONLY PATCHES THAT READ WITHOUT THE MOVING LIGHT (ambient median ≥ 8) are judged for blowout — the first
     patch run read 0.00 on CA/CB/CD at every lap position, the light nowhere near, because some patches are
     near-INVISIBLE UNDER AMBIENT ALONE. Those are counted separately: they are the base's fault, not the light's. */
  const all = [...byTile.entries()].filter(([, t]) => t.idx.length >= 40).map(([k, t]) => ({ k, idx: t.idx, amb: median(t.amb) }));
  patches[id] = all.filter((t) => t.amb >= 8);
  dark[id] = all.length - patches[id].length;
  total[id] = all.length;
}
console.log(`word-sized patches: ${Object.keys(patches).map((id) => `${id} ${total[id]} (${dark[id]} near-invisible under AMBIENT ALONE — contrast < 8)`).join(" · ")}
`);

const rows = [];
for (let k = 0; k < steps; k++) {
  const f = k / steps;
  const q = `lmfreeze=${f.toFixed(4)}&lmonly=${light}`;
  const on = await luma(q);
  const bare = await luma(`${q}&text=0`);
  writeFileSync(`${out}/lap-${String(Math.round(f * 1000)).padStart(3, "0")}.png`, on.png);
  writeFileSync(`${out}/lap-${String(Math.round(f * 1000)).padStart(3, "0")}-bare.png`, bare.png);
  const row = { f };
  for (const id of Object.keys(BOX)) {
    const ds = mask[id].map(([i]) => Math.abs(on.L[i] - bare.L[i]));
    const washed = ds.filter((d) => d < 8).length / ds.length;
    let worst = { r: Infinity, k: "" };
    for (const t of patches[id]) {
      const r = median(t.idx.map((i) => Math.abs(on.L[i] - bare.L[i]))) / Math.max(t.amb, 1);
      if (r < worst.r) worst = { r, k: t.k };
    }
    row[id] = { c: median(ds), r: median(ds) / base[id], washed, worst };
  }
  rows.push(row);
  console.log(`${f.toFixed(2)}  | ${Object.keys(BOX).map((id) => `${row[id].c.toFixed(1).padStart(5)} (${row[id].r.toFixed(2)}×) ${(100 * row[id].washed).toFixed(0).padStart(3)}% w${row[id].worst.r.toFixed(2)}`.padEnd(30)).join(" | ")}`);
}
writeFileSync(`${out}/scan-light${light}.json`, JSON.stringify({ rig, base, rows }, null, 1));
await b.close();
