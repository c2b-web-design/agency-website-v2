// THE HERO GLOW's MEASUREMENT (the bloom note v1.3's checks; D-101, 9 November 2026). NOT a verify/ harness (Carl's word):
// its readings are UNPROVEN as evidence — it carries a NULL control (off vs off, must pass) and a NEGATIVE control (glow on,
// must fail). Needs the dev server on :3000 and `?blank=1`'s dev hooks (`__heroBloom`, `__heroBloomOff`, `__benchScene`).
// ⛔ THE IDENTITY CHECK runs with the bench's LINES' alpha-to-coverage OFF (Carl, 9 November 2026: "Fix with 1"): three
// r185's plain path reports 0 samples for its internal frame-buffer target, so `Line2NodeMaterial` draws hard-edged there
// and soft (alpha-to-coverage, as designed) in the glow pass — a three quirk, not the glow's (bisected, D-101). With it
// off the identity is EXACT; the glow pass's picture (with the lines' designed edge) is the correct one. Real WebGPU (installed Chrome) by default; "fallback" =
// Playwright's bundled Chromium, which falls back to WebGL 2.
import { chromium } from "file:///C:/Users/Carl Buckley/agency-website-v2/node_modules/playwright/index.mjs";
import { execFileSync } from "node:child_process";
const OUT = process.env.MEASURE_OUT || (await import("node:os")).tmpdir();
const tag = process.argv[2] === "fallback" ? "fallback" : "webgpu";
const channel = tag === "fallback" ? undefined : "chrome";
const b = await chromium.launch({ channel, args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-webgpu", "--enable-features=Vulkan,WebGPU"] });
const p = await b.newPage({ viewport: { width: 1909, height: 934 }, deviceScaleFactor: 1 });
const errs = [];
p.on("console", (m) => m.type() === "error" && errs.push(m.text().slice(0, 200)));
await p.goto("http://localhost:3000/proto/camera?blank=1", { waitUntil: "load" });
await p.waitForTimeout(9000);
// the lines' alpha-to-coverage off for the identity comparison (see the header)
await p.evaluate(() => window.__benchScene.traverse((o) => { if (o.type === "Line2") { o.material.alphaToCoverage = false; o.material.needsUpdate = true; } }));
const backend = await p.evaluate(() => (document.body.innerText.match(/WebGPU · drew on \w+|WebGPU|WebGL/) || [""])[0]);
const rect = await p.evaluate(() => {
  const r = document.querySelector("canvas").getBoundingClientRect();
  return { x: Math.round(r.x), y: Math.round(r.y), width: Math.round(r.width), height: Math.round(r.height) };
});
const W = rect.width, H = rect.height;
async function grab(name) {
  await p.waitForTimeout(700);
  const f = `${OUT}/${tag}-${name}.png`;
  await p.screenshot({ path: f, clip: rect });
  return Uint8Array.from(execFileSync("ffmpeg", ["-v", "error", "-i", f, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], { maxBuffer: 1 << 28 }));
}
const setBg = (c) =>
  p.evaluate((c) => {
    let e = document.querySelector("canvas").parentElement;
    while (e && !String(e.className).includes("bg-[#0a0a0a]")) e = e.parentElement;
    e.style.background = c;
  }, c);
const off = (v) => p.evaluate((v) => { window.__heroBloomOff = v; }, v);
const setDial = (d) => p.evaluate((d) => window.__heroBloom.set(d), d);

await off(true);
const OFF = await grab("off");
const OFF2 = await grab("off2");
await off(false);
await setDial({ strength: 0 });
const S0 = await grab("strength0");
await setDial({ strength: 0.45 });
const ON = await grab("on");

function diffStats(A, B, mask) {
  const d = [];
  for (let i = 0; i < A.length; i++) {
    const px = (i / 3) | 0;
    if (mask && !mask(px % W, (px / W) | 0)) continue;
    d.push(Math.abs(A[i] - B[i]));
  }
  d.sort((a, b) => a - b);
  const p999 = d[Math.floor(d.length * 0.999)], max = d[d.length - 1], over4 = d.filter((v) => v > 4).length;
  return { values: d.length, p999, max, over4, PASS: p999 <= 2 && over4 === 0 };
}
// the text's ink box from the OFF frame (ice pixels, left half of the canvas)
let x0 = W, x1 = 0, y0 = H, y1 = 0;
for (let y = 0; y < H; y++)
  for (let x = 0; x < W * 0.5; x++) {
    const i = (y * W + x) * 3;
    if (OFF[i + 2] > 150 && OFF[i + 2] - OFF[i] > 15) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
  }
const M = 60;
const nearText = (x, y) => x > x0 - M && x < x1 + M && y > y0 - M && y < y1 + M;
const nullControl = diffStats(OFF, OFF2); // MUST PASS: two plain frames, nothing changed
const identity = diffStats(OFF, S0);
const negativeControl = diffStats(OFF, ON); // MUST FAIL: the glow on is not today's picture
const awayFromText = diffStats(OFF, ON, (x, y) => !nearText(x, y));
const nearTextDiff = diffStats(OFF, ON, nearText);

// THE HALO over black and white: over black the colour C; white − black = (1 − α) per channel; pass: channels agree, C ≤ α
await setBg("#000000");
const K = await grab("on-black");
await setBg("#ffffff");
const Wh = await grab("on-white");
await setBg("");
let halo = 0, bad = 0, worstSpread = 0, worstOver = 0;
for (let y = Math.max(0, y0 - M); y < Math.min(H, y1 + M); y++)
  for (let x = Math.max(0, x0 - M); x < Math.min(W, x1 + M); x++) {
    const i = (y * W + x) * 3;
    const a = [0, 1, 2].map((c) => 255 - (Wh[i + c] - K[i + c]));
    const amax = Math.max(...a);
    if (amax <= 2 || amax >= 253) continue;
    halo++;
    const spread = amax - Math.min(...a);
    const over = Math.max(0, ...[0, 1, 2].map((c) => K[i + c] - amax));
    worstSpread = Math.max(worstSpread, spread);
    worstOver = Math.max(worstOver, over);
    if (spread > 4 || over > 4) bad++;
  }
const corner = (20 * W + 20) * 3;
const farCornerAlpha = 255 - Math.max(...[0, 1, 2].map((c) => Wh[corner + c] - K[corner + c]));

// COST: the meter's medians, the glow off then on (the first samples after each switch dropped)
async function cost(v) {
  await off(v);
  await p.evaluate(() => { window.__benchCost = { cpu: [], gpu: [], disjoint: 0, pending: [] }; });
  await p.waitForTimeout(800);
  await p.evaluate(() => { window.__benchCost.cpu.length = 0; window.__benchCost.gpu.length = 0; });
  await p.waitForTimeout(4000);
  return p.evaluate(() => {
    const m = (a) => { const s = [...a].sort((x, y) => x - y); return s.length ? +s[Math.floor(s.length / 2)].toFixed(3) : null; };
    const c = window.__benchCost;
    return { frames: c.cpu.length, cpuMedianMs: m(c.cpu), gpuMedianMs: m(c.gpu), gpuSamples: c.gpu.length };
  });
}
const costOff = await cost(true), costOn = await cost(false);
await p.evaluate(() => { window.__benchCost = undefined; window.__heroBloomOff = false; });
console.log(JSON.stringify({
  tag, backend, canvas: [W, H], textBox: [x0, y0, x1, y1],
  "0 NULL CONTROL (off vs off; must PASS)": nullControl,
  "1 identity (strength 0 vs off)": identity,
  "1 NEGATIVE CONTROL (glow on vs off; must FAIL)": negativeControl,
  "3 selection: glow away from the text (must PASS)": awayFromText,
  "   glow near the text (must differ)": nearTextDiff,
  "2 halo over black/white": { haloPixels: halo, failing: bad, worstChannelSpread: worstSpread, worstColourOverAlpha: worstOver },
  "2 far corner alpha (0 = transparent)": farCornerAlpha,
  "5 cost": { off: costOff, on: costOn },
  consoleErrors: errs.length, firstErrors: errs.slice(0, 3),
}, null, 1));
await b.close();
