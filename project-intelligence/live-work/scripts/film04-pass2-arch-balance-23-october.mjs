/** FILM 04 PASS 2 ON THE ARCH — THE BALANCE (23 October 2026, session 2). The line's values (studio 305°, face strength
 *  0.13) were measured on the LINE's wide framing; the arch is tall. Here:
 *   1. THE TARGET — the line at its take-4 settings, measured by THIS method: the FACE's mean luminance over a FIXED MASK.
 *   2. THE ARCH — the studio turned 0° → 355° (5° steps) at the line's strength; the mean per BAND, feet to crown, the FACE
 *      and the EDGE apart (each its own mask: the face lit alone at edge strength 0, the edge alone at face strength 0).
 *   3. With turns given (`<base> <yaw,yaw,…>`): the face strength swept at each, so the arch's face meets the line's level.
 *  ⛔ THE MASKS ARE FIXED per framing: each taken ONCE from a bright reference render (max channel > 25) — a set thresholded
 *  on the render being measured changes with its brightness (pass 2's lesson, 23 October). ⚠ A first run measured face and
 *  edge TOGETHER and was replaced: the polished edge's lines mixed into every band.
 *  Bands are fractions of the arch's height (bottom-up): lower legs, upper legs, head, lintel — printed so they can be checked.
 *  The studio turn and the strength are set through the bench's own sliders (one page, no reload).
 *    node …/film04-pass2-arch-balance-23-october.mjs <base> [yaws]
 *  ⚠ NOT WATCHED: how it looks; the edge's strength (not swept); the oblique view. */
import { chromium } from "playwright";
import sharp from "sharp";
const [BASE = "http://localhost:3000", YAWS = ""] = process.argv.slice(2);
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const ctx = await b.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });

const open = async (q) => {
  const p = await ctx.newPage();
  await p.goto(`${BASE}/proto/showcase?mode=material&view=front&${q}`, { waitUntil: "networkidle" });
  await p.waitForFunction(() => window.__showcaseBench?.ready, null, { timeout: 60000 });
  await p.addStyleTag({ content: "nextjs-portal{display:none!important}" });
  await p.waitForTimeout(700);
  return p;
};
const shot = async (p) => {
  const { data, info } = await sharp(await p.screenshot({ clip: await p.locator("canvas").first().boundingBox() })).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  return { data, W: info.width, H: info.height };
};
const setSlider = (p, label, v) =>
  p.evaluate(([label, v]) => {
    const el = [...document.querySelectorAll('input[type="range"]')].find((e) => e.closest("label")?.textContent?.startsWith(label));
    if (!el) throw new Error(`no slider "${label}"`);
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(el, String(v));
    el.dispatchEvent(new Event("input", { bubbles: true }));
  }, [label, v]);
const maskOf = ({ data, W, H }) => {
  const m = new Uint8Array(W * H);
  let y0 = H, y1 = 0;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const i = (y * W + x) * 3; if (Math.max(data[i], data[i + 1], data[i + 2]) > 25) { m[y * W + x] = 1; y0 = Math.min(y0, y); y1 = Math.max(y1, y); } }
  return { m, y0, y1 };
};
const measure = ({ data, W }, mask, bands) =>
  bands.map(([a, c]) => {
    let sum = 0, n = 0, blown = 0;
    for (let y = a; y <= c; y++) for (let x = 0; x < W; x++) { if (!mask.m[y * W + x]) continue; const i = (y * W + x) * 3; sum += 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]; n++; if (Math.max(data[i], data[i + 1], data[i + 2]) >= 250) blown++; }
    return { mean: sum / n, blown: (100 * blown) / n, n };
  });

// 1. THE TARGET — the line at take 4 (305°, face 0.13), its fifths over its own fixed mask
{
  const ref = await open("layout=line&strength=2&estrength=0");
  const mask = maskOf(await shot(ref));
  await ref.close();
  const p = await open("layout=line");
  const s = await shot(p);
  let x0 = s.W, x1 = 0;
  for (let i = 0; i < mask.m.length; i++) if (mask.m[i]) { x0 = Math.min(x0, i % s.W); x1 = Math.max(x1, i % s.W); }
  // fifths across the word (columns): restrict the mask per band
  const fifth = (k) => { const m = new Uint8Array(mask.m); for (let i = 0; i < m.length; i++) { const x = i % s.W; if (x < x0 + (k / 5) * (x1 - x0) || x >= x0 + ((k + 1) / 5) * (x1 - x0)) m[i] = 0; } return { ...mask, m }; };
  const r = [0, 2, 4].map((k) => measure(s, fifth(k), [[mask.y0, mask.y1]])[0]);
  const all = measure(s, mask, [[mask.y0, mask.y1]])[0];
  console.log(`THE LINE (target), FACE only, masked: L ${r[0].mean.toFixed(1)} · M ${r[1].mean.toFixed(1)} · R ${r[2].mean.toFixed(1)} · whole ${all.mean.toFixed(1)} · blown ${all.blown.toFixed(1)}%`);
  globalThis.TARGET = all.mean;
  await p.close();
}

// 2. THE ARCH — FACE and EDGE apart, each its own fixed mask (the face lit alone: edge strength 0 renders the polished
//    sides black — no lamps; the edge alone: face strength 0), then the studio turned
const refF = await open("strength=2&estrength=0");
const maskF = maskOf(await shot(refF));
await refF.close();
const refE = await open("strength=0&estrength=4");
const maskE = maskOf(await shot(refE));
await refE.close();
const mask = { y0: Math.min(maskF.y0, maskE.y0), y1: Math.max(maskF.y1, maskE.y1) };
const h = mask.y1 - mask.y0;
// bottom-up fractions of the arch's height: lower legs, upper legs, head, lintel
const at = (f) => Math.round(mask.y1 - f * h);
const NAMES = ["lower legs", "upper legs", "head", "lintel"];
const bands = [[at(0.33), at(0)], [at(0.55), at(0.33)], [at(0.85), at(0.55)], [at(1), at(0.85)]];
console.log(`ARCH rows ${mask.y0}–${mask.y1}; bands (rows): ${NAMES.map((n, i) => `${n} ${bands[i][0]}–${bands[i][1]}`).join(" · ")}`);
const p = await open("");
const fmt = (m) => m.map((q) => q.mean.toFixed(1).padStart(5)).join(" ");
const rows = [];
// 3. THE STRENGTH at the given turns — then stop
if (YAWS) {
  for (const yaw of YAWS.split(",").map(Number)) {
    await setSlider(p, "studio turn", yaw);
    for (const st of [0.13, 0.16, 0.2, 0.22, 0.25, 0.3]) {
      await setSlider(p, "face strength", st);
      await p.waitForTimeout(150);
      const s = await shot(p);
      const f = measure(s, maskF, bands), e = measure(s, maskE, bands);
      const mean = f.reduce((a, q) => a + q.mean * q.n, 0) / f.reduce((a, q) => a + q.n, 0);
      console.log(`yaw ${yaw} strength ${st}: FACE ${fmt(f)} · whole ${mean.toFixed(1)} (line ${globalThis.TARGET.toFixed(1)}) · blown ${Math.max(...f.map((q) => q.blown)).toFixed(1)}% | EDGE ${fmt(e)}`);
    }
  }
  await b.close();
  process.exit(0);
}
for (let yaw = 0; yaw < 360; yaw += 5) {
  await setSlider(p, "studio turn", yaw);
  await p.waitForTimeout(120);
  const s = await shot(p);
  const f = measure(s, maskF, bands), e = measure(s, maskE, bands);
  const means = f.map((q) => q.mean);
  const even = Math.min(...means) / Math.max(...means);
  rows.push({ yaw, means, even, face: means.reduce((a, v) => a + v, 0) / 4 });
  console.log(`yaw ${String(yaw).padStart(3)}: FACE ${fmt(f)} · even ${even.toFixed(2)} | EDGE ${fmt(e)} | blown face ${Math.max(...f.map((q) => q.blown)).toFixed(1)}%`);
}
console.log(`(bands in each: ${NAMES.join(", ")}; "even" = the face's darkest band over its brightest, all four)`);
const best = [...rows].sort((a, b) => b.even - a.even).slice(0, 6);
console.log(`EVENEST FACE: ${best.map((r) => `${r.yaw}° ${r.even.toFixed(2)} (mean ${r.face.toFixed(1)})`).join(" | ")}`);
await b.close();
