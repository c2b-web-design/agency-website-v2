// ⛔ THE LOGO's REFLECTION — THE NOTE v1.7 MEASUREMENTS, v2 (9 November 2026, session 3). Needs the dev server and
// `?blank=1`'s dev hooks (`__heroReflection`, `__benchScene`). Writes PNGs and results into OUT (argv[2]).
//
// WHY v2 (D-101, "COMMITTED STEP 1 IS SOUND"): v1's null control compared the capture with the reflection build's
// `mode: "equirect"` switch, which showed the lamps ALONE, not step 1's studio. The switch is REMOVED (Carl: "remove it").
// v1's negative-control bar (mean >= 5.0) was chosen against that broken reference's figures; it is RETIRED, and replaced by
// a check with NO chosen number (Carl: "it should be as good as you can get it").
//
//   REFERENCE: committed step 1's OWN FRAME (`7d63aff`, the logo with the family studio prefiltered by
//      `fromEquirectangular`), kept as files in `hero-reflection-ref/`, shot by the same viewport and clip as below.
//      ⛔ GUARD: everything OUTSIDE the logo must match the reference EXACTLY (mean 0). If it does not, the scene, the camera
//      or the HUD has moved since the reference was shot: the run says REFERENCE STALE and judges NOTHING.
//   THE LOGO's PIXELS: where the reference changes when the logo is hidden (its silhouette, nothing else).
//   1  NULL CONTROL: the capture WITHOUT the text at the design yaw vs the reference: mean |Δ| <= 1.0, p99.5 <= 6 (v1's bars,
//      set before v1's first run, unchanged).
//   1b ORIENTATION (replaces v1's negative control): the capture without the text at EVERY yaw, 10° steps around the circle,
//      against the reference. PASS = the design yaw (150°) is the SINGLE best match. A sign flip (−150°), a mirror or any
//      offset of 10° or more puts the minimum elsewhere. The margin (the best wrong yaw against the null) is REPORTED,
//      not judged. Its own negative control is in the sweep itself: −150° must be worse than 150°.
//   2  WHAT THE LOGO SEES: `view()` — the reflection scene from the capture's point, 90° toward the text (view.png).
//   3  POSITIVE CONTROL: with the text vs without: >= 0.5 % of the logo's pixels change by > 4 levels.
//   5  COST: the capture's time (first, last) and the counts (captures, skips, give-ups — zero expected for both).
// ⚠ NOT WATCHED (also printed): measurement 4 (the FRONT face, eroded mask) is not built; the changed pixels are MAPPED
//   (diff-text.png) for the eye instead. Phones. WebGL (no reflection there). Yaws between the 10° steps.
import { chromium } from "file:///C:/Users/Carl Buckley/agency-website-v2/node_modules/playwright/index.mjs";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const OUT = process.argv[2];
const REF = join(dirname(fileURLToPath(import.meta.url)), "hero-reflection-ref");
const DESIGN_YAW = 150;
mkdirSync(OUT, { recursive: true });
const b = await chromium.launch({ channel: "chrome", args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-webgpu", "--enable-features=Vulkan,WebGPU"] });
const p = await b.newPage({ viewport: { width: 1909, height: 934 }, deviceScaleFactor: 1 });
const errs = [];
p.on("console", (m) => (m.type() === "error" || m.type() === "warning") && errs.push(m.text().slice(0, 160)));
await p.goto("http://localhost:3000/proto/camera?blank=1", { waitUntil: "load" });
await p.waitForSelector('[data-camera-bench="drawn"]', { timeout: 120000 });
await p.waitForTimeout(5000);
const canvasBox = await p.evaluate(() => { const r = document.querySelector("canvas").getBoundingClientRect(); return { x: Math.ceil(r.x) + 2, y: Math.ceil(r.y) + 2, width: Math.floor(r.width) - 4, height: Math.floor(r.height) - 4 }; });
const shots = { ref: readFileSync(join(REF, "step1-7d63aff.png")).toString("base64"), refNoLogo: readFileSync(join(REF, "step1-7d63aff-no-logo.png")).toString("base64") };
const shot = async (name, keep = true) => { await p.waitForTimeout(1500); const buf = await p.screenshot({ clip: canvasBox }); if (keep) writeFileSync(join(OUT, `${name}.png`), buf); shots[name] = buf.toString("base64"); };
const set = (o) => p.evaluate((o) => window.__heroReflection.set(o), o);

await shot("A-text");
await set({ text: false });
await shot("B-no-text");
const yaws = [];
for (let y = -180; y < 180; y += 10) yaws.push(y);
for (const y of yaws) { await set({ text: false, yawDeg: y }); await shot(`yaw${y}`, y === -150); }
await set({ text: true, yawDeg: DESIGN_YAW });
await shot("A2-text-again");
const counts = await p.evaluate(() => { const d = window.__heroReflection; return { captures: d.captures, skips: d.skips, giveUps: d.giveUps, firstMs: d.firstMs, lastMs: d.lastMs }; });
const view = await p.evaluate(async () => window.__heroReflection.view());

const stats = await p.evaluate(async ({ shots, yaws, DESIGN_YAW, view }) => {
  const load = (s) => new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.src = `data:image/png;base64,${s}`; });
  const px = {};
  let w = 0, h = 0;
  for (const [k, s] of Object.entries(shots)) { const img = await load(s); w = img.width; h = img.height; const c = new OffscreenCanvas(img.width, img.height); const g = c.getContext("2d"); g.drawImage(img, 0, 0); px[k] = g.getImageData(0, 0, img.width, img.height).data; }
  const sizes = Object.fromEntries(Object.entries(px).map(([k, d]) => [k, d.length]));
  if (new Set(Object.values(sizes)).size !== 1) return { error: "frame sizes differ from the reference", sizes };
  const a = px.ref, nl = px.refNoLogo, mask = [], inMask = new Uint8Array(a.length / 4);
  for (let i = 0; i < a.length; i += 4) if (Math.abs(a[i] - nl[i]) + Math.abs(a[i + 1] - nl[i + 1]) + Math.abs(a[i + 2] - nl[i + 2]) > 0) { mask.push(i); inMask[i / 4] = 1; }
  const cmp = (x, y) => {
    const ds = []; let sum = 0, over4 = 0;
    for (const i of mask) { let m = 0; for (let k = 0; k < 3; k++) { const v = Math.abs(px[x][i + k] - px[y][i + k]); ds.push(v); sum += v; m = Math.max(m, v); } if (m > 4) over4++; }
    ds.sort((m, n) => m - n);
    return { mean: +(sum / ds.length).toFixed(3), p995: ds[Math.floor(ds.length * 0.995)], max: ds[ds.length - 1], pctOver4: +((100 * over4) / mask.length).toFixed(3) };
  };
  const outside = (x) => { let s = 0, n = 0; for (let i = 0; i < a.length; i += 4) if (!inMask[i / 4]) { s += Math.abs(px[x][i] - a[i]) + Math.abs(px[x][i + 1] - a[i + 1]) + Math.abs(px[x][i + 2] - a[i + 2]); n++; } return +(s / n / 3).toFixed(4); };
  const sweep = yaws.map((y) => ({ yaw: y, mean: cmp(`yaw${y}`, "ref").mean }));
  const best = sweep.reduce((m, r) => (r.mean < m.mean ? r : m));
  const wrong = sweep.filter((r) => r.yaw !== DESIGN_YAW).reduce((m, r) => (r.mean < m.mean ? r : m));
  const map = new OffscreenCanvas(w, h); const mg = map.getContext("2d"); const mi = mg.createImageData(w, h);
  const A = px["A-text"], B = px["B-no-text"];
  for (let i = 0; i < A.length; i += 4) { const v = Math.max(Math.abs(A[i] - B[i]), Math.abs(A[i + 1] - B[i + 1]), Math.abs(A[i + 2] - B[i + 2])); mi.data[i] = v > 4 ? 255 : A[i] * 0.3; mi.data[i + 1] = v > 4 ? 255 : A[i + 1] * 0.3; mi.data[i + 2] = v > 4 ? 0 : A[i + 2] * 0.3; mi.data[i + 3] = 255; }
  mg.putImageData(mi, 0, 0);
  const toB64 = async (cv) => { const bl = await cv.convertToBlob(); const u = new Uint8Array(await bl.arrayBuffer()); let s = ""; for (const ch of u) s += String.fromCharCode(ch); return btoa(s); };
  let viewPng = null;
  if (view) {
    const vc = new OffscreenCanvas(view.w, view.h); const vg = vc.getContext("2d"); const vi = vg.createImageData(view.w, view.h);
    for (let y = 0; y < view.h; y++) for (let x = 0; x < view.w; x++) { const s = ((view.h - 1 - y) * view.w + x) * 4, t = (y * view.w + x) * 4; for (let k = 0; k < 4; k++) vi.data[t + k] = view.data[s + k]; }
    vg.putImageData(vi, 0, 0); viewPng = await toB64(vc);
  }
  return {
    logoPixels: mask.length,
    guard_outsideLogo_meanDiff: { "B-no-text": outside("B-no-text"), "A-text": outside("A-text") },
    null_noText_vs_step1: cmp("B-no-text", "ref"),
    orientation: { best, bestWrong: wrong, marginRatio: +(wrong.mean / Math.max(best.mean, 1e-3)).toFixed(1), signFlip_minus150: sweep.find((r) => r.yaw === -150), sweep },
    positive_text_vs_noText: cmp("A-text", "B-no-text"),
    textRestored_A2_vs_A: cmp("A2-text-again", "A-text"),
    mapPng: await toB64(map),
    viewPng,
  };
}, { shots, yaws, DESIGN_YAW, view });
if (stats.error) { console.log("⛔", stats.error, JSON.stringify(stats.sizes)); await b.close(); process.exit(2); }
writeFileSync(join(OUT, "diff-text.png"), Buffer.from(stats.mapPng, "base64"));
if (stats.viewPng) writeFileSync(join(OUT, "view.png"), Buffer.from(stats.viewPng, "base64"));
delete stats.mapPng; delete stats.viewPng;
const stale = stats.guard_outsideLogo_meanDiff["B-no-text"] !== 0;
const verdict = stale
  ? { "⛔ REFERENCE STALE": "the frame outside the logo differs from committed step 1's: nothing below is judged. Re-shoot the reference from a commit whose step 1 Carl approved." }
  : {
      "1 null (mean ≤ 1.0, p99.5 ≤ 6)": stats.null_noText_vs_step1.mean <= 1.0 && stats.null_noText_vs_step1.p995 <= 6,
      "1b orientation (150° the single best of 36 yaws)": stats.orientation.best.yaw === DESIGN_YAW && stats.orientation.bestWrong.mean > stats.orientation.best.mean,
      "3 positive (≥ 0.5 % of logo pixels > 4)": stats.positive_text_vs_noText.pctOver4 >= 0.5,
      "5 no skips, no give-ups": counts.skips === 0 && counts.giveUps === 0,
    };
const notWatched = "⚠ NOT WATCHED: measurement 4 (the front face; mapped in diff-text.png for the eye instead); phones; WebGL (no reflection there); yaws between the 10° steps. The reference is ONE frame from ONE camera (the hero's home view).";
const out = { counts, ...stats, verdict, notWatched, console: errs };
writeFileSync(join(OUT, "results.json"), JSON.stringify(out, null, 1));
const { sweep, ...orient } = stats.orientation;
console.log(JSON.stringify({ ...out, orientation: orient }, null, 1));
console.log("sweep (yaw: mean):", sweep.map((r) => `${r.yaw}:${r.mean}`).join("  "));
await b.close();
