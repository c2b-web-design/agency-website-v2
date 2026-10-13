/** THE SWAP, PIXEL FOR PIXEL (13 October 2026, the cold-load fix). On a cold load, the live canvas's frame AT THE MOMENT it
 *  takes over from the still (the frame its buffer holds when `data-drawn` flips to 1, read from the canvas itself) and the
 *  NEXT two frames it draws, compared with the still it replaces (`public/buttons/<member>-rest@1x.png`).
 *  Why not screenshots: on `/about` the main thread is busy and back-to-back screenshots came ~600 ms apart, so the "after"
 *  frame was already rolling (`family-button-coldload-verify.mjs`, first run: ⛔ 7.63 at a swap that could not be seen).
 *  Measure: per-pixel difference of the straight-alpha RGBA (0–255), mean and 99th percentile, and the alpha mismatch.
 *  A CONTROL compares the still with itself (must be 0) and with the other member's still at its size where possible.
 *  Usage: node …/family-button-swap-match.mjs [base url]
 *  ⚠ NOT WATCHED: Carl's GPU (the still was rendered on this machine's — another GPU may round differently); densities
 *  other than 1×; the frames after the second. */
import { chromium } from "playwright";
import { join } from "node:path";
import sharp from "sharp";
const BASE = process.argv[2] ?? "http://localhost:3000";
const PAGES = [
  { member: "whoweare", url: "/#contact", link: '#contact a[href="/about"]' },
  { member: "start", url: "/about#start", link: '#start a[href="/start"]' },
];
function grabber(sel) {
  const recs = [];
  const orig = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function (type, ...rest) {
    const c = orig.call(this, type, ...rest);
    if (/webgl/.test(type) && c && !c.__rec) {
      const rec = { gl: c, canvas: this, draws: 0 };
      c.__rec = rec; recs.push(rec);
      for (const fn of ["drawElements", "drawArrays"]) { const f = c[fn]; c[fn] = function (...a) { rec.draws++; return f.apply(this, a); }; }
    }
    return c;
  };
  const read = (r) => { const gl = r.gl, W = gl.drawingBufferWidth, H = gl.drawingBufferHeight, px = new Uint8Array(W * H * 4); gl.readPixels(0, 0, W, H, gl.RGBA, gl.UNSIGNED_BYTE, px); return { W, H, px }; };
  window.__swap = { at: null, after: [] };
  let swapped = false;
  const raf = window.requestAnimationFrame.bind(window);
  window.requestAnimationFrame = (cb) => raf((t) => {
    const before = recs.map((r) => r.draws);
    cb(t);
    recs.forEach((r, i) => {
      if (r.draws === before[i] || !r.canvas.closest(sel)) return;
      const f = read(r);
      if (!swapped) r.canvas.__last = f;
      else if (window.__swap.after.length < 2) window.__swap.after.push(f);
    });
  });
  new MutationObserver(() => {
    const a = document.querySelector(sel);
    if (!swapped && a?.dataset.drawn === "1") { swapped = true; const c = a.querySelector("canvas"); window.__swap.at = c?.__last ?? null; window.__swap.t = performance.now(); }
  }).observe(document, { subtree: true, attributes: true, attributeFilter: ["data-drawn"] });
}
function straight(fr) { // GL bottom-up, premultiplied → top-down straight alpha
  const src = Buffer.from(fr.b64, "base64"), out = Buffer.alloc(src.length), row = fr.W * 4;
  for (let y = 0; y < fr.H; y++) for (let x = 0; x < row; x += 4) { const s = (fr.H - 1 - y) * row + x, d = y * row + x, a = src[s + 3]; out[d + 3] = a; for (let k = 0; k < 3; k++) out[d + k] = a ? Math.min(255, Math.round((src[s + k] * 255) / a)) : 0; }
  return out;
}
function cmp(A, B) {
  if (A.length !== B.length) return { error: `sizes differ (${A.length / 4} vs ${B.length / 4} px)` };
  const d = []; let alphaOff = 0;
  for (let i = 0; i < A.length; i += 4) { const a = Math.max(A[i + 3], B[i + 3]) / 255; d.push(a * Math.max(Math.abs(A[i] - B[i]), Math.abs(A[i + 1] - B[i + 1]), Math.abs(A[i + 2] - B[i + 2]), Math.abs(A[i + 3] - B[i + 3]))); if (Math.abs(A[i + 3] - B[i + 3]) > 16) alphaOff++; }
  d.sort((x, y) => x - y);
  return { mean: d.reduce((s, x) => s + x, 0) / d.length, p99: d[Math.floor(d.length * 0.99)], max: d[d.length - 1], alphaOff };
}
const fmt = (c) => (c.error ? `⛔ ${c.error}` : `mean ${c.mean.toFixed(2)}, p99 ${c.p99.toFixed(0)}, max ${c.max.toFixed(0)}, alpha off ${c.alphaOff} px`);

const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
for (const pg of PAGES) {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  await ctx.addInitScript(grabber, pg.link);
  const p = await ctx.newPage();
  await p.goto(BASE + pg.url, { waitUntil: "load" });
  await p.waitForFunction(() => window.__swap.at && window.__swap.after.length >= 2, null, { timeout: 30000 }).catch(() => {});
  const data = await p.evaluate(() => { const s = window.__swap; const enc = (f) => { if (!f) return null; let b = ""; for (let i = 0; i < f.px.length; i += 0x8000) b += String.fromCharCode(...f.px.subarray(i, i + 0x8000)); return { W: f.W, H: f.H, b64: btoa(b) }; }; return { t: s.t, at: enc(s.at), after: s.after.map(enc) }; });
  await ctx.close();
  const still = await sharp(join(process.cwd(), "public", "buttons", `${pg.member}-rest@1x.png`)).ensureAlpha().raw().toBuffer();
  console.log(`${pg.member}: the live canvas took over at ${data.t ? (data.t / 1000).toFixed(2) + " s" : "— ⛔"}`);
  console.log(`   control, the still against itself: ${fmt(cmp(still, still))}`);
  if (!data.at) { console.log("   ⛔ no frame held at the swap"); continue; }
  const at = cmp(straight(data.at), still);
  console.log(`   AT THE SWAP (the frame shown when the still goes): ${fmt(at)} ${!at.error && at.mean < 0.5 && at.p99 <= 4 ? "✅" : "⛔"}`);
  data.after.forEach((f, i) => console.log(`   frame +${i + 1} (roll and lamp starting from rest): ${fmt(cmp(straight(f), still))}`));
}
await b.close();
console.log("⚠ NOT WATCHED: Carl's GPU; densities other than 1×; frames after the second.");
