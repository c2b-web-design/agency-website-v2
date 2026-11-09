// ⛔ THE LIQUID, ROUTE B, PROBE 1 — THE SHADE NULL CONTROL (9 November 2026, session 3; the liquid note v1.5, APPROVED).
// Needs the dev server and `?blank=1`'s dev hooks (`__liquidProbe`, `__benchScene`). argv: OUT dir. Runs on WebGPU and on
// the WebGL 2 fallback (`&forcewebgl=1`). BARS SET BEFORE THE FIRST RUN:
//   MASK: the pixels where the frame changes when the mesh sphere (left spot) is shown against no sphere at all.
//   SELF-NULL: the mesh sphere re-shot — must be 0 (else the frame is not still, and nothing is judged).
//   NULL (the condition): the RAYMARCHED sphere against the MESH sphere wearing the logo's own material, same spot:
//     mean |Δ| ≤ 1.0 and p99.5 ≤ 6 over the mask (the reflection's null bars). FAIL → route B is OUT (the note).
//   NEGATIVE CONTROL: the raymarched sphere at roughness 0.1 (the example's) against the mesh: must FAIL the null bar —
//     proves the test can see a shade difference of the kind Carl's T2 rule forbids.
//   DIAGNOSIS (reported, not judged): the same null over the mask's INTERIOR (eroded 3 px) and its RIM (the rest) — a
//     raymarched edge is not multisampled the way a mesh edge is.
// ⚠ NOT WATCHED (printed): other camera angles; a point or spot light (the probe handles neither, none exists); phones.
import { chromium } from "file:///C:/Users/Carl Buckley/agency-website-v2/node_modules/playwright/index.mjs";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
const OUT = process.argv[2];
mkdirSync(OUT, { recursive: true });
const b = await chromium.launch({ channel: "chrome", args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-webgpu"] });
const results = {};
for (const medium of ["webgpu", "fallback"]) {
  const p = await b.newPage({ viewport: { width: 1909, height: 934 }, deviceScaleFactor: 1 });
  const errs = [];
  p.on("console", (m) => m.type() === "error" && errs.push(m.text().slice(0, 200)));
  await p.goto(`http://localhost:3000/proto/camera?blank=1${medium === "fallback" ? "&forcewebgl=1" : ""}`, { waitUntil: "load" });
  await p.waitForSelector('[data-camera-bench="drawn"]', { timeout: 120000 });
  await p.waitForTimeout(6000);
  await p.waitForFunction(() => !!window.__liquidProbe, null, { timeout: 30000 });
  const backend = await p.evaluate(() => document.querySelector("[data-camera-bench]").dataset.mediumBackend);
  const box = await p.evaluate(() => { const r = document.querySelector("canvas").getBoundingClientRect(); return { x: Math.ceil(r.x) + 2, y: Math.ceil(r.y) + 2, width: Math.floor(r.width) - 4, height: Math.floor(r.height) - 4 }; });
  const shots = {};
  const shot = async (n) => { await p.waitForTimeout(1500); const buf = await p.screenshot({ clip: box }); writeFileSync(join(OUT, `${medium}-${n}.png`), buf); shots[n] = buf.toString("base64"); };
  const show = (s) => p.evaluate((s) => window.__liquidProbe.show(s), s);
  const vis = (v) => p.evaluate((v) => window.__benchScene.traverse((o) => { if (o.name?.startsWith("liquid probe")) o.visible = v; }), v);
  const marchRough = (r) => p.evaluate((r) => window.__benchScene.traverse((o) => { if (o.name === "liquid probe march") o.material.roughness = r; }), r);
  await show("mesh"); await shot("mesh");
  await shot("mesh-again");
  await vis(false); await shot("none"); await vis(true);
  await show("march"); await shot("march");
  await marchRough(0.1); await shot("march-rough01"); await marchRough(0.4);
  await show("both"); await shot("both");
  results[medium] = await p.evaluate(async (shots) => {
    const load = (s) => new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.src = `data:image/png;base64,${s}`; });
    const px = {}; let W = 0, H = 0;
    for (const [k, s] of Object.entries(shots)) { const img = await load(s); W = img.width; H = img.height; const c = new OffscreenCanvas(W, H); const g = c.getContext("2d"); g.drawImage(img, 0, 0); px[k] = g.getImageData(0, 0, W, H).data; }
    const m = px.mesh, n = px.none, inMask = new Uint8Array(W * H);
    for (let i = 0; i < W * H; i++) { const k = i * 4; if (Math.abs(m[k] - n[k]) + Math.abs(m[k + 1] - n[k + 1]) + Math.abs(m[k + 2] - n[k + 2]) > 0) inMask[i] = 1; }
    // erode 3 px: the interior; the rest of the mask is the rim
    let cur = inMask;
    for (let it = 0; it < 3; it++) { const nx = new Uint8Array(W * H); for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) { const i = y * W + x; nx[i] = cur[i] && cur[i - 1] && cur[i + 1] && cur[i - W] && cur[i + W] ? 1 : 0; } cur = nx; }
    const interior = cur;
    const cmp = (a, bb, sel) => { const ds = []; let s = 0, n4 = 0, cnt = 0; for (let i = 0; i < W * H; i++) { if (!sel(i)) continue; cnt++; const k = i * 4; let mx = 0; for (let c = 0; c < 3; c++) { const v = Math.abs(px[a][k + c] - px[bb][k + c]); ds.push(v); s += v; mx = Math.max(mx, v); } if (mx > 4) n4++; } ds.sort((p, q) => p - q); return { pixels: cnt, mean: +(s / ds.length).toFixed(3), p995: ds[Math.floor(ds.length * 0.995)], max: ds[ds.length - 1], pctOver4: +((100 * n4) / cnt).toFixed(2) }; };
    const all = (i) => inMask[i] === 1, inner = (i) => interior[i] === 1, rim = (i) => inMask[i] === 1 && interior[i] === 0;
    return { selfNull: cmp("mesh", "mesh-again", all), NULL: cmp("march", "mesh", all), NEG_rough01: cmp("march-rough01", "mesh", all), diag_interior: cmp("march", "mesh", inner), diag_rim: cmp("march", "mesh", rim) };
  }, shots);
  const r = results[medium];
  r.backend = backend;
  r.console = errs;
  const pass = (s) => s.mean <= 1.0 && s.p995 <= 6;
  r.verdict = r.selfNull.max !== 0 ? { "⛔ FRAME NOT STILL": "the mesh re-shot differs; nothing judged" } : { "NULL (mean ≤ 1.0, p99.5 ≤ 6)": pass(r.NULL), "NEGATIVE CONTROL fails the bar": !pass(r.NEG_rough01) };
  await p.close();
}
results.notWatched = "⚠ NOT WATCHED: other camera angles (one view, the hero's home); point or spot lights (the probe handles neither; none exists); phones.";
writeFileSync(join(OUT, "results.json"), JSON.stringify(results, null, 1));
console.log(JSON.stringify(results, null, 1));
await b.close();
