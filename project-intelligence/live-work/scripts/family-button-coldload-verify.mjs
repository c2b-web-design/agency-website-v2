/** THE COLD LOAD, VERIFIED (13 October 2026 — Carl: "What i see on a page thats approved is what i should see elsewhere").
 *  A fresh load straight to each button's section; frames of the button's box taken back to back from navigation until 2 s
 *  after the live canvas takes over; and a FILM of the whole load for Carl's eye (Playwright's recorder).
 *  Reports: when the still's image arrived (resource timing) · when the live button took over (data-drawn) · the button's
 *  change at the SWAP (the last frame on the still vs the first on the canvas) against the change between consecutive
 *  frames on the still (the noise floor) and once rolling. Mean and 99th-percentile per-pixel luminance change, /255.
 *  Usage: node …/family-button-coldload-verify.mjs [base url]   (default http://localhost:3000)
 *  ⚠ NOT WATCHED: Carl's Chrome and GPU; throttled networks; the frames are as fast as screenshots allow (~20–60 ms apart),
 *  so a one-frame flash shorter than that could fall between two. Screenshots fire stray pointer events (the hold is not
 *  judged here). */
import { chromium } from "playwright";
import { mkdirSync, renameSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
const BASE = process.argv[2] ?? "http://localhost:3000";
const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "screenshots", "gold-button-13-october", "coldload");
mkdirSync(OUT, { recursive: true });
const PAGES = [
  { name: "home-whoweare", url: "/#contact", link: '#contact a[href="/about"]', still: "/buttons/whoweare-rest" },
  { name: "about-start", url: "/about#start", link: '#start a[href="/start"]', still: "/buttons/start-rest" },
];
const lum = async (buf) => { const { data } = await sharp(buf).removeAlpha().raw().toBuffer({ resolveWithObject: true }); const L = new Float32Array(data.length / 3); for (let i = 0; i < L.length; i++) L[i] = 0.2126 * data[3 * i] + 0.7152 * data[3 * i + 1] + 0.0722 * data[3 * i + 2]; return L; };
const diff = (A, B) => { const d = []; for (let i = 0; i < A.length; i++) d.push(Math.abs(A[i] - B[i])); d.sort((x, y) => x - y); return { mean: d.reduce((s, x) => s + x, 0) / d.length, p99: d[Math.floor(d.length * 0.99)] }; };
const fmt = (x) => `mean ${x.mean.toFixed(2)}, p99 ${x.p99.toFixed(0)}`;

const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
for (const pg of PAGES) {
  const vdir = join(OUT, "video-tmp");
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, recordVideo: { dir: vdir, size: { width: 1440, height: 900 } } });
  const p = await ctx.newPage();
  const nav = p.goto(BASE + pg.url, { waitUntil: "commit" });
  await nav;
  const frames = [];
  let swapAt = -1, box = null, t0 = Date.now();
  while (Date.now() - t0 < 30000) {
    const st = await p.evaluate((l) => { const a = document.querySelector(l); if (!a) return null; const r = a.getBoundingClientRect(); return { drawn: a.dataset.drawn, x: r.x, y: r.y, w: r.width, h: r.height, t: performance.now() }; }, pg.link).catch(() => null);
    if (!st || st.w === 0 || st.y < 20 || st.y + st.h > 880) continue; // not yet scrolled to the anchor
    if (box && Math.abs(st.y - 16 - box.y) > 1) { console.log(`   ⚠ the button moved after capture began (y ${box.y + 16} → ${st.y.toFixed(1)}) — box re-taken`); box = null; }
    box ??= { x: Math.round(st.x - 16), y: Math.round(st.y - 16), width: Math.round(st.w + 32), height: Math.round(st.h + 32) };
    const shot = await p.screenshot({ clip: box });
    frames.push({ t: st.t, drawn: st.drawn, shot });
    if (st.drawn === "1" && swapAt < 0) swapAt = frames.length - 1;
    if (swapAt >= 0 && st.t - frames[swapAt].t > 2000) break;
  }
  const timing = await p.evaluate((still) => {
    const e = performance.getEntriesByType("resource").find((r) => r.name.includes(still));
    const fcp = performance.getEntriesByName("first-contentful-paint")[0];
    return { stillAt: e ? e.responseEnd : null, fcp: fcp ? fcp.startTime : null };
  }, pg.still);
  await ctx.close();
  const vids = readdirSync(vdir).filter((f) => f.endsWith(".webm"));
  if (vids.length) renameSync(join(vdir, vids[0]), join(OUT, `${pg.name}_cold-load.webm`));

  const L = await Promise.all(frames.map((f) => lum(f.shot)));
  const pre = [], post = [];
  for (let i = 1; i < L.length; i++) (i < swapAt ? pre : i > swapAt ? post : null)?.push(diff(L[i - 1], L[i]));
  const worst = (xs) => xs.reduce((m, x) => (x.mean > m.mean ? x : m), { mean: 0, p99: 0 });
  const atSwap = swapAt > 0 ? diff(L[swapAt - 1], L[swapAt]) : null;
  const firstStill = frames.findIndex((f, i) => i > 0 && diff(L[0], L[i]).mean > 1);
  await sharp(frames[0].shot).toFile(join(OUT, `${pg.name}_frame-first.png`));
  if (swapAt > 0) { await sharp(frames[swapAt - 1].shot).toFile(join(OUT, `${pg.name}_frame-before-swap.png`)); await sharp(frames[swapAt].shot).toFile(join(OUT, `${pg.name}_frame-after-swap.png`)); }
  console.log(`${pg.name}: ${frames.length} frames · first contentful paint ${(timing.fcp / 1000).toFixed(2)} s · still image arrived ${timing.stillAt ? (timing.stillAt / 1000).toFixed(2) + " s" : "—"} · live took over ${swapAt >= 0 ? (frames[swapAt].t / 1000).toFixed(2) + " s" : "NEVER ⛔"}`);
  console.log(`   on the still, frame to frame (worst): ${fmt(worst(pre))}`);
  console.log(`   AT THE SWAP: ${atSwap ? fmt(atSwap) : "—"} ${atSwap && atSwap.mean < 1 && atSwap.p99 <= 8 ? "✅" : "⛔"}`);
  console.log(`   rolling after (worst, for scale): ${fmt(worst(post))}`);
  console.log(`   the first frame captured ${firstStill > 0 ? "differs from a later one — the still arrived during capture" : "already shows the still"} (frame 0 at ${(frames[0].t / 1000).toFixed(2)} s)`);
}
await b.close();
console.log(`films + frames: ${OUT}`);
console.log("⚠ NOT WATCHED: Carl's Chrome and GPU; throttled networks; flashes shorter than the frame spacing.");
