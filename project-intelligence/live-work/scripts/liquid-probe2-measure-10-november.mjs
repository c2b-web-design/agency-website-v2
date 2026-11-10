// ⛔ THE LIQUID, ROUTE B, PROBE 2 — THE LOGO IN THE FIELD: THE FIRST HANDOVER's NULL CONTROL, THE VOLUME, THE COST
// (10 November 2026; the liquid note v1.5, APPROVED, the live plan's step 2). Needs the dev server and `?blank=1`'s dev
// hooks (`__liquid`, `__benchScene`, `__benchCost`). argv: OUT dir. Runs on WebGPU and on the WebGL 2 fallback
// (`&forcewebgl=1`). BARS SET BEFORE THE FIRST RUN (the note's item 3, [R11-8]):
//   MASK: the pixels where the frame changes when the MESH logo is shown against no logo at all.
//   SELF-NULL: the mesh re-shot — must be 0 (else the frame is not still, and nothing is judged).
//   NULL (the handover, still frame): the FIELD logo (weight 1, no blob) against the MESH, same frame and camera, over the
//     mask: mean |Δ| ≤ 1.0 and p99.5 ≤ 6. FAIL → D2 (Carl's, decided: the swap made at the first bulge, while the logo is
//     already moving, judged frame-stepped).
//   NEGATIVE CONTROLS (must FAIL the null bar — prove the test can see the faults it guards against):
//     shade — the field at roughness 0.1; geometry — the field grown 0.5 cm (`erode(-0.5)`).
//   DIAGNOSIS (reported, not judged): the null over the mask's INTERIOR (eroded 3 px) and its RIM.
//   VOLUME (the approximation check [R12-4]): the field's Σ profile(d) × texel area against the mesh's divergence-theorem
//     volume — reported (the curve starts from the field's figure, so no bar).
//   COST (D-108, reported): the render callback's GPU median, mesh vs field vs field with the blob at mid-emergence.
// ⚠ NOT WATCHED (printed): other camera angles; the blob's look (Carl's eye); moving frames (D2's frame-stepping is a
// separate run); phones; the audience proxy.
import { chromium } from "file:///C:/Users/Carl Buckley/agency-website-v2/node_modules/playwright/index.mjs";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
const OUT = process.argv[2];
// argv[3] (diagnosis only): a `__liquid.debug` value for the FIELD's shots; argv[4]: "webgpu" to run one medium
const DEBUG = Number(process.argv[3] ?? 0);
const MEDIA = process.argv[4] && process.argv[4] !== "both" ? [process.argv[4]] : ["webgpu", "fallback"];
// argv[5] "rebind" (diagnosis, 10 November 2026): the MESH's env map dropped and restored before the shots — the shipped
// logo draws a STALE binding of its reflection at load (found this run); the rebind brings the live capture
const REBIND = process.argv[5] === "rebind";
mkdirSync(OUT, { recursive: true });
const b = await chromium.launch({ channel: "chrome", args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-webgpu"] });
const results = {};
for (const medium of MEDIA) {
  const p = await b.newPage({ viewport: { width: 1909, height: 934 }, deviceScaleFactor: 1 });
  const errs = [];
  p.on("console", (m) => m.type() === "error" && errs.push(m.text().slice(0, 200)));
  p.on("pageerror", (e) => errs.push("pageerror: " + e.message.slice(0, 200)));
  await p.goto(`http://localhost:3000/proto/camera?blank=1${medium === "fallback" ? "&forcewebgl=1" : ""}`, { waitUntil: "load" });
  await p.waitForSelector('[data-camera-bench="drawn"]', { timeout: 120000 });
  await p.waitForFunction(() => !!window.__liquid?.stats && !!window.__liquid?.material, null, { timeout: 60000 });
  await p.waitForTimeout(4000);
  const backend = await p.evaluate(() => document.querySelector("[data-camera-bench]").dataset.mediumBackend);
  const box = await p.evaluate(() => { const r = document.querySelector("canvas").getBoundingClientRect(); return { x: Math.ceil(r.x) + 2, y: Math.ceil(r.y) + 2, width: Math.floor(r.width) - 4, height: Math.floor(r.height) - 4 }; });
  const shots = {};
  const shot = async (n) => { await p.waitForTimeout(1500); const buf = await p.screenshot({ clip: box }); writeFileSync(join(OUT, `${medium}-${n}.png`), buf); shots[n] = buf.toString("base64"); };
  const L = (fn, arg) => p.evaluate(fn, arg);
  await L(() => { window.__liquid.blob(false); window.__liquid.at(0); window.__liquid.erode(0); window.__liquid.debug(0); });
  if (REBIND) {
    await L(() => window.__benchScene.traverse((o) => { if (o.name === "hero logo") { window.__envKeep = o.material.envMap; o.material.envMap = null; o.material.needsUpdate = true; } }));
    await p.waitForTimeout(800);
    await L(() => window.__benchScene.traverse((o) => { if (o.name === "hero logo") { o.material.envMap = window.__envKeep; o.material.needsUpdate = true; } }));
  }
  await L(() => window.__liquid.show("mesh")); await shot("mesh");
  await shot("mesh-again");
  await L(() => window.__benchScene.traverse((o) => { if (o.name === "hero logo") o.visible = false; })); await shot("none");
  await L(() => window.__benchScene.traverse((o) => { if (o.name === "hero logo") o.visible = true; }));
  await L(() => window.__liquid.show("field")); await L((d) => window.__liquid.debug(d), DEBUG); await shot("field");
  await L(() => { window.__liquid.material.roughness = 0.1; }); await shot("field-rough01");
  await L(() => { window.__liquid.material.roughness = 0.4; });
  await L(() => window.__liquid.erode(-0.5)); await shot("field-grown05");
  await L(() => window.__liquid.erode(0));
  // the blob's look, for the record (not judged here): three moments of the emergence
  await L(() => window.__liquid.blob(true));
  for (const s of [0.3, 0.55, 1]) { await L((s) => window.__liquid.at(s), s); await shot(`blob-${s}`); }
  results[medium] = await p.evaluate(async (shots) => {
    const load = (s) => new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.src = `data:image/png;base64,${s}`; });
    const px = {}; let W = 0, H = 0;
    for (const [k, s] of Object.entries(shots)) { const img = await load(s); W = img.width; H = img.height; const c = new OffscreenCanvas(W, H); const g = c.getContext("2d"); g.drawImage(img, 0, 0); px[k] = g.getImageData(0, 0, W, H).data; }
    const m = px.mesh, n = px.none, inMask = new Uint8Array(W * H);
    for (let i = 0; i < W * H; i++) { const k = i * 4; if (Math.abs(m[k] - n[k]) + Math.abs(m[k + 1] - n[k + 1]) + Math.abs(m[k + 2] - n[k + 2]) > 0) inMask[i] = 1; }
    let cur = inMask;
    for (let it = 0; it < 3; it++) { const nx = new Uint8Array(W * H); for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) { const i = y * W + x; nx[i] = cur[i] && cur[i - 1] && cur[i + 1] && cur[i - W] && cur[i + W] ? 1 : 0; } cur = nx; }
    const interior = cur;
    const cmp = (a, bb, sel) => { const ds = []; let s = 0, n4 = 0, cnt = 0; for (let i = 0; i < W * H; i++) { if (!sel(i)) continue; cnt++; const k = i * 4; let mx = 0; for (let c = 0; c < 3; c++) { const v = Math.abs(px[a][k + c] - px[bb][k + c]); ds.push(v); s += v; mx = Math.max(mx, v); } if (mx > 4) n4++; } ds.sort((p, q) => p - q); return { pixels: cnt, mean: +(s / ds.length).toFixed(3), p995: ds[Math.floor(ds.length * 0.995)], max: ds[ds.length - 1], pctOver4: +((100 * n4) / cnt).toFixed(2) }; };
    const all = (i) => inMask[i] === 1, inner = (i) => interior[i] === 1, rim = (i) => inMask[i] === 1 && interior[i] === 0;
    return { selfNull: cmp("mesh", "mesh-again", all), NULL: cmp("field", "mesh", all), NEG_rough01: cmp("field-rough01", "mesh", all), NEG_grown05: cmp("field-grown05", "mesh", all), diag_interior: cmp("field", "mesh", inner), diag_rim: cmp("field", "mesh", rim) };
  }, shots);
  const cost = async (setup) => {
    await p.evaluate(setup);
    await p.evaluate(() => { window.__benchCost = { cpu: [], gpu: [], disjoint: 0, pending: [] }; });
    await p.waitForTimeout(800);
    await p.evaluate(() => { window.__benchCost.cpu.length = 0; window.__benchCost.gpu.length = 0; });
    await p.waitForTimeout(4000);
    const r = await p.evaluate(() => { const m = (a) => { const s = [...a].sort((x, y) => x - y); return s.length ? +s[Math.floor(s.length / 2)].toFixed(3) : null; }; const c = window.__benchCost; return { frames: c.cpu.length, cpuMedianMs: m(c.cpu), gpuMedianMs: m(c.gpu), gpuSamples: c.gpu.length }; });
    await p.evaluate(() => { window.__benchCost = undefined; });
    return r;
  };
  const r = results[medium];
  r.cost = {
    mesh: await cost(() => { window.__liquid.blob(false); window.__liquid.show("mesh"); }),
    field: await cost(() => { window.__liquid.show("field"); }),
    fieldBlobMid: await cost(() => { window.__liquid.blob(true); window.__liquid.at(0.55); }),
  };
  r.stats = await p.evaluate(() => window.__liquid.stats);
  r.backend = backend;
  r.console = errs;
  const pass = (s) => s.mean <= 1.0 && s.p995 <= 6;
  r.verdict = r.selfNull.max !== 0 ? { "⛔ FRAME NOT STILL": "the mesh re-shot differs; nothing judged" } : { "NULL (mean ≤ 1.0, p99.5 ≤ 6)": pass(r.NULL), "NEGATIVE shade fails the bar": !pass(r.NEG_rough01), "NEGATIVE geometry fails the bar": !pass(r.NEG_grown05) };
  await p.close();
}
results.notWatched = "⚠ NOT WATCHED: other camera angles (one view, the hero's home); the blob's look (Carl's eye); moving frames (D2 is frame-stepped, a separate run); phones; the audience proxy.";
writeFileSync(join(OUT, "results.json"), JSON.stringify(results, null, 1));
console.log(JSON.stringify(results, null, 1));
await b.close();
