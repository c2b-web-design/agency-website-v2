/**
 * FRAME PACING ON /about, FROM ROLES — 3 October 2026. Carl: "The animation looks stuttered, not how it was built,
 * it was smoother."
 *
 * Plain `/about` at the top; 5 s idle in §1; click "Roles"; record for SECONDS. Two clocks per browser frame:
 *   - the page's rAF interval (is the browser keeping its frame rate?)
 *   - whether the scene DREW in that frame (WebGL draw calls counted by wrapping drawElements/drawArrays):
 *     the card canvas is frameloop="demand", so a frame the scene skipped is a frozen frame on screen.
 * Plus long tasks (> 50 ms main-thread blocks).
 * ⚠ NOT WATCHED: Carl's own Chrome (this is Playwright's Chromium, headed, GPU on, at his 1412 × 700 @ 1.36);
 *   compositor-only animation; whether the motion READS smooth. One run, not a distribution.
 *   node --no-warnings project-intelligence/live-work/scripts/frame-pacing.mjs [url] [seconds]
 */
import { chromium } from "playwright";

const URL = process.argv[2] ?? "http://localhost:3000/about";
const SECONDS = Number(process.argv[3] ?? 30);

const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const ctx = await b.newContext({ viewport: { width: 1412, height: 700 }, deviceScaleFactor: 1.36 });
await ctx.addInitScript(() => {
  const w = (window.__fp = { draws: 0, frames: [], longtasks: [], on: false });
  for (const P of [WebGL2RenderingContext.prototype, WebGLRenderingContext.prototype]) {
    for (const k of ["drawElements", "drawArrays", "drawElementsInstanced", "drawArraysInstanced"]) {
      const f = P[k]; if (!f) continue;
      P[k] = function (...a) { w.draws++; return f.apply(this, a); };
    }
  }
  let last = 0, lastDraws = 0;
  const tick = (t) => {
    if (w.on) w.frames.push([t, last ? t - last : 0, w.draws - lastDraws]);
    last = t; lastDraws = w.draws;
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
  try { new PerformanceObserver((l) => { for (const e of l.getEntries()) if (w.on) w.longtasks.push([e.startTime, e.duration]); }).observe({ type: "longtask", buffered: false }); } catch {}
});

// first load of a context is thrown away (it lands before the #roles scroll; also warms the dev compile)
{ const p = await ctx.newPage(); await p.goto(URL, { waitUntil: "networkidle" }); await p.waitForTimeout(1500); await p.close(); }

const p = await ctx.newPage();
await p.goto(URL, { waitUntil: "networkidle" });
await p.waitForTimeout(3000);

const summarise = (frames, longtasks, label) => {
  const iv = frames.map((f) => f[1]).filter((x) => x > 0).sort((a, b) => a - b);
  const q = (x) => iv[Math.min(iv.length - 1, Math.floor(x * iv.length))];
  const drew = frames.filter((f) => f[2] > 0);
  // gaps between frames the scene drew — what the eye sees of the animation
  const gaps = []; for (let i = 1; i < drew.length; i++) gaps.push(drew[i][0] - drew[i - 1][0]);
  const gs = [...gaps].sort((a, b) => a - b);
  const gq = (x) => gs[Math.min(gs.length - 1, Math.floor(x * gs.length))];
  const span = frames.length ? (frames.at(-1)[0] - frames[0][0]) / 1000 : 0;
  console.log(`\n── ${label} (${span.toFixed(1)} s)`);
  console.log(`  browser frames: ${iv.length} = ${(iv.length / span).toFixed(1)} fps · median ${q(0.5)?.toFixed(1)} ms · p95 ${q(0.95)?.toFixed(1)} · p99 ${q(0.99)?.toFixed(1)} · max ${iv.at(-1)?.toFixed(1)}`);
  console.log(`    > 25 ms: ${iv.filter((x) => x > 25).length} · > 50 ms: ${iv.filter((x) => x > 50).length} · > 100 ms: ${iv.filter((x) => x > 100).length}`);
  console.log(`  scene drew in ${drew.length} of ${frames.length} frames (${(drew.length / Math.max(1, span)).toFixed(1)} /s)`);
  if (gs.length) console.log(`    gap between drawn frames: median ${gq(0.5).toFixed(1)} ms · p95 ${gq(0.95).toFixed(1)} · max ${gs.at(-1).toFixed(1)} · > 25 ms: ${gaps.filter((x) => x > 25).length} · > 50 ms: ${gaps.filter((x) => x > 50).length}`);
  console.log(`  long tasks: ${longtasks.length}${longtasks.length ? " · total " + longtasks.reduce((s, l) => s + l[1], 0).toFixed(0) + " ms · worst " + Math.max(...longtasks.map((l) => l[1])).toFixed(0) + " ms" : ""}`);
  const worst = frames.filter((f) => f[1] > 50).slice(0, 12).map((f) => `${((f[0] - frames[0][0]) / 1000).toFixed(2)}s:${f[1].toFixed(0)}ms`);
  if (worst.length) console.log(`    first long frames (t since window start): ${worst.join("  ")}`);
};

const windowed = async (ms, label) => {
  await p.evaluate(() => { window.__fp.frames = []; window.__fp.longtasks = []; window.__fp.on = true; });
  await p.waitForTimeout(ms);
  const r = await p.evaluate(() => { window.__fp.on = false; return { frames: window.__fp.frames, longtasks: window.__fp.longtasks }; });
  summarise(r.frames, r.longtasks, label);
};

console.log(`URL ${URL} · Playwright Chromium headed, GPU on, 1412×700 @1.36 · refresh as the monitor gives it`);
await windowed(5000, "§1 at the top, idle");
await p.getByRole("link", { name: "Roles", exact: true }).first().click();
await windowed(SECONDS * 1000, `after Roles, ${SECONDS} s of the sequence`);
await b.close();
