/**
 * THE MARK BENCH, MEASURED — D-088 chunk 1, 3 October 2026. Plan: live-work/desk-mark-chunk1-plan-3-october.md,
 * Verification 3 (Architect A4).
 *   node --no-warnings project-intelligence/live-work/scripts/logo-bench-measure.mjs
 * Needs the dev server on :3000. Headed, real GPU, rendered LARGE (2400 × 1300 @ 2) — see the note at the launch.
 *
 * In MASK mode (unlit white on black), front orthographic view framed by the outline's own normalisation transform:
 *   (a) CONTROL FIRST — the gold alpha scored against itself eroded by 1 px, so an IoU figure has a meaning;
 *   (b) EDGE DISTANCE — every boundary pixel of the render to the nearest boundary pixel of the gold alpha, and back
 *       (max and 95th percentile, source px); and the NARROW GAPS (background ≤ 3 px from the mark on both sides,
 *       inside its box: the slit, the pinch) — the share still open in the render;
 *   (c) the page's stats; (d) canvases on the page; (e) console errors.
 */
import { chromium } from "playwright";
import sharp from "sharp";

const ALPHA = "brand-assets/logo/c2b-logo-gold-relit-alpha-1671.png";

// ── helpers ──────────────────────────────────────────────────────────────────
const INF = 1e20;
function edt1(f, len) {
  const d = new Float64Array(len), v = new Int32Array(len), z = new Float64Array(len + 1); let k = 0; v[0] = 0; z[0] = -INF; z[1] = INF;
  for (let q = 1; q < len; q++) { let s; do { const p = v[k]; s = ((f[q] + q * q) - (f[p] + p * p)) / (2 * q - 2 * p); if (s <= z[k]) k--; else break; } while (k >= 0); k++; v[k] = q; z[k] = s; z[k + 1] = INF; }
  k = 0; for (let q = 0; q < len; q++) { while (z[k + 1] < q) k++; d[q] = (q - v[k]) ** 2 + f[v[k]]; } return d;
}
/** Euclidean distance from every pixel to the nearest `seed` pixel. */
function edt(seed, W, H) {
  const g = new Float64Array(W * H);
  for (let i = 0; i < W * H; i++) g[i] = seed[i] ? 0 : INF;
  for (let x = 0; x < W; x++) { const col = new Float64Array(H); for (let y = 0; y < H; y++) col[y] = g[y * W + x]; const r = edt1(col, H); for (let y = 0; y < H; y++) g[y * W + x] = r[y]; }
  for (let y = 0; y < H; y++) { const r = edt1(g.subarray(y * W, y * W + W), W); for (let x = 0; x < W; x++) g[y * W + x] = r[x]; }
  for (let i = 0; i < W * H; i++) g[i] = Math.sqrt(g[i]);
  return g;
}
const boundary = (m, W, H) => {
  const b = new Uint8Array(W * H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const i = y * W + x; if (!m[i]) continue;
    if (x === 0 || y === 0 || x === W - 1 || y === H - 1 || !m[i - 1] || !m[i + 1] || !m[i - W] || !m[i + W]) b[i] = 1; }
  return b;
};
const iou = (a, b) => { let I = 0, U = 0; for (let i = 0; i < a.length; i++) { if (a[i] && b[i]) I++; if (a[i] || b[i]) U++; } return I / U; };
const pct = (arr, q) => { const s = Float64Array.from(arr).sort(); return s[Math.floor(q * (s.length - 1))]; };

// ── the gold alpha ───────────────────────────────────────────────────────────
const A = await sharp(ALPHA).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const W = A.info.width, H = A.info.height;
const gold = new Uint8Array(W * H);
for (let i = 0; i < W * H; i++) gold[i] = A.data[i * 4 + 3] > 127 ? 1 : 0;

// (a) control: gold vs gold eroded by 1 px
const eroded = new Uint8Array(W * H);
for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) { const i = y * W + x; eroded[i] = gold[i] && gold[i - 1] && gold[i + 1] && gold[i - W] && gold[i + W] ? 1 : 0; }
const control = iou(gold, eroded);

// narrow gaps = CHANNEL CENTRES: background pixels inside the mark's box whose distance to the mark is a local
// maximum (3 × 3) and at most 3 px — the middle of a channel no wider than ~6 px (the slit, the pinch).
// ⚠ Corrected the same day: a first test ("the mark within 3 px on two opposite sides") flagged single background
// pixels hugging every DIAGONAL edge, where the edge's own staircase sits on both sides — 27 "gaps", nearly all false.
let bx0 = W, bx1 = 0, by0 = H, by1 = 0;
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (gold[y * W + x]) { bx0 = Math.min(bx0, x); bx1 = Math.max(bx1, x); by0 = Math.min(by0, y); by1 = Math.max(by1, y); }
const bgDist = edt(gold, W, H);
const gap = [];
for (let y = by0 + 1; y < by1; y++) for (let x = bx0 + 1; x < bx1; x++) { const i = y * W + x; const d = bgDist[i];
  if (gold[i] || d < 1 || d > 3) continue;
  let peak = true; for (let oy = -1; oy <= 1 && peak; oy++) for (let ox = -1; ox <= 1; ox++) if (bgDist[i + oy * W + ox] > d + 1e-9) { peak = false; break; }
  if (peak) gap.push(i); }

// ── the render ───────────────────────────────────────────────────────────────
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
// ⚠ NOT Carl's viewport: rendered LARGE (≈ 4,600 device px across the canvas) so a 4 px gap is many render pixels, then
// area-resampled to source px. The look at Carl's size is the frames script's room-size view, not this.
const ctx = await b.newContext({ viewport: { width: 2400, height: 1300 }, deviceScaleFactor: 2 });
const p = await ctx.newPage();
const errors = [];
p.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
p.on("pageerror", (e) => errors.push(String(e)));
await p.goto("http://localhost:3000/proto/logo?view=front&mask=1", { waitUntil: "networkidle" });
await p.waitForFunction(() => window.__logoBench?.ready === true, null, { timeout: 120000 });
await p.addStyleTag({ content: "nextjs-portal { display: none !important; }" }); // the dev badge sits over the canvas
await p.waitForTimeout(1000);
const canvas = p.locator("canvas").first();
const shot = await canvas.screenshot();
const page = await p.evaluate(() => ({ s: window.__logoBench.stats, ms: window.__logoBench.buildMs, canvases: document.querySelectorAll("canvas").length }));
await b.close();
// the canvas covers exactly the source image (the frustum is the normalisation transform) → resample to source px
const R = await sharp(shot).greyscale().resize(W, H, { fit: "fill", kernel: "cubic" }).raw().toBuffer();
const render = new Uint8Array(W * H);
for (let i = 0; i < W * H; i++) render[i] = R[i] > 127 ? 1 : 0;

// (b) edge distance, both ways
const gB = boundary(gold, W, H), rB = boundary(render, W, H);
const dToGold = edt(gB, W, H), dToRender = edt(rB, W, H);
const rd = [], gd = [];
for (let i = 0; i < W * H; i++) { if (rB[i]) rd.push(dToGold[i]); if (gB[i]) gd.push(dToRender[i]); }
const meshIoU = iou(gold, render);
let open = 0; for (const i of gap) if (!render[i]) open++;

const f = (v, d = 2) => v.toFixed(d);
console.log("── THE MARK BENCH, MEASURED (mask mode, front, framed by the outline's transform) ──");
console.log(`(a) CONTROL: gold alpha vs itself eroded by 1 px → IoU ${f(control, 4)}  ⇒ at this resolution, 1 px of edge error everywhere costs ${f((1 - control) * 100, 1)} points of IoU`);
console.log(`    the mesh vs the gold alpha: IoU ${f(meshIoU, 4)}`);
console.log(`(b) EDGE DISTANCE (source px): render → target  max ${f(Math.max(...rd))} · 95th ${f(pct(rd, 0.95))} · median ${f(pct(rd, 0.5))}`);
console.log(`                               target → render  max ${f(Math.max(...gd))} · 95th ${f(pct(gd, 0.95))} · median ${f(pct(gd, 0.5))}`);
// the narrowest channel the target actually has: the smallest local-max background distance inside the box (> 1 px)
let narrow = Infinity;
for (let y = by0 + 1; y < by1; y++) for (let x = bx0 + 1; x < bx1; x++) { const i = y * W + x; const d = bgDist[i]; if (gold[i] || d < 1) continue;
  let peak = true; for (let oy = -1; oy <= 1 && peak; oy++) for (let ox = -1; ox <= 1; ox++) if (bgDist[i + oy * W + ox] > d + 1e-9) { peak = false; break; }
  if (peak && d < narrow) narrow = d; }
console.log(gap.length
  ? `    NARROW GAPS: ${gap.length} channel-centre px (channels ≤ ~6 px wide) in the target; open in the render: ${open} (${f((open / gap.length) * 100, 1)}%)`
  : `    NARROW GAPS: the target has NO channel narrower than ~6 px — its narrowest channel is ~${f(2 * narrow, 1)} px wide (half-width ${f(narrow, 1)}); nothing to close`);
console.log(`(c) page stats: ${page.s.triangles} triangles · build ${f(page.ms, 0)} ms · open edges (welded) ${page.s.openEdges} · non-manifold ${page.s.nonManifoldEdges} · NaN ${page.s.nanValues} · flipped band ${page.s.flippedBandTriangles}`);
console.log(`    normal angle — face ${f(page.s.maxNormalAngleFaceDeg, 2)}° (must be ~0) · whole front ${f(page.s.maxNormalAngleDeg, 1)}° · edges > 30° ${page.s.edgesOver30Deg} · interior z-step ${f(page.s.maxGridZStepSourcePx, 3)} px (must be 0)`);
console.log(`(d) canvases on the page: ${page.canvases}`);
console.log(`(e) console errors: ${errors.length ? errors.join(" | ") : "none"}`);
console.log("⚠ NOT WATCHED: the material's likeness to the target, the cross-section's height, the terminals' shape, the room's");
console.log("  light, any motion, the page at other viewports. Those are Carl's eye. The edge figures include ±0.5 px of resampling.");
