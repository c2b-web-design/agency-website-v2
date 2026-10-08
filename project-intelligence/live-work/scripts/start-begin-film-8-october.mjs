// Film the ivory Begin button's ENTRANCE on /start — 8 October 2026 (Carl: "now look at the begin button which is an
// opposite transition"). Headed, real GPU, Carl's viewport, DPR 3. Companion to start-logo-film-8-october.mjs.
//   realtime/ — screenshots as fast as Playwright takes them, 7.2 s → ~9 s after load (the reveal starts at 7400 ms).
//   seeked/   — the mask's `enquiry-mask-reveal-radial` PAUSED and set to exact times (dense where the pill is
//               uncovered), with the computed clip-path and the circle's radius in px against the pill's half-extents.
// Usage: node project-intelligence/live-work/scripts/start-begin-film-8-october.mjs   (dev server on :3000)
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
const OUT = "project-intelligence/live-work/screenshots/start-begin-8-october";
for (const d of ["realtime", "seeked"]) mkdirSync(`${OUT}/${d}`, { recursive: true });
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const ctx = await b.newContext({ viewport: { width: 1412, height: 700 }, deviceScaleFactor: 3 });
const p = await ctx.newPage();
await p.goto("http://localhost:3000/start", { waitUntil: "networkidle" });
const t0 = Date.now();
await p.addStyleTag({ content: "nextjs-portal { display: none !important; }" });
const mask = p.locator(".enquiry-button-mask").first();
const pill = p.locator(".enquiry-begin-btn").first();
const rect = (el) => { const q = el.getBoundingClientRect(); return { x: q.x, y: q.y, w: q.width, h: q.height }; };
const mBox = await mask.evaluate(rect);
const pBox = await pill.evaluate(rect);
const clip = { x: pBox.x - 40, y: pBox.y - 24, width: pBox.w + 80, height: pBox.h + 48 };
// circle(r%) resolves against sqrt(w² + h²) / sqrt(2) of the reference box (the mask's border box).
const ref = Math.hypot(mBox.w, mBox.h) / Math.SQRT2;
const log = { maskBox: mBox, pillBox: pBox, refPx: ref, note: "radiusPx = pct/100 * refPx; pill half-extents = w/2, h/2" };

// REAL TIME — from 7.2 s after load
while (Date.now() - t0 < 7200) await p.waitForTimeout(10);
const rt = [];
for (let i = 1; i <= 40; i++) {
  const ms = Date.now() - t0;
  await p.screenshot({ path: `${OUT}/realtime/${String(i).padStart(2, "0")}-${ms}ms.png`, clip });
  rt.push(ms);
}
log.realtimeMsSinceLoad = rt;
await p.waitForTimeout(500);
await p.screenshot({ path: `${OUT}/page-mid.png` });

// SEEKED
const times = [];
for (let t = 0; t <= 1200; t += 50) times.push(t);
for (let t = 1500; t <= 5000; t += 500) times.push(t);
log.seeked = [];
for (const t of times) {
  const cp = await mask.evaluate((el, t) => {
    const a = el.getAnimations().find((x) => x.animationName === "enquiry-mask-reveal-radial");
    if (!a) return "NO ANIMATION";
    a.pause(); a.currentTime = 7400 + t; // the animation's own clock includes its 7400 ms delay
    return getComputedStyle(el).clipPath;
  }, t);
  await p.waitForTimeout(60);
  await p.screenshot({ path: `${OUT}/seeked/${String(t).padStart(4, "0")}ms.png`, clip });
  const pct = parseFloat((cp.match(/circle\(([\d.]+)%/) || [])[1]);
  const r = Number.isFinite(pct) ? (pct / 100) * ref : null;
  log.seeked.push({ t, clipPath: cp, radiusPx: r && +r.toFixed(1),
    coversPillHeight: r != null && r >= pBox.h / 2, coversPillWidth: r != null && r >= pBox.w / 2,
    coversPillCorners: r != null && r >= Math.hypot(pBox.w / 2, pBox.h / 2) });
}
writeFileSync(`${OUT}/readings.json`, JSON.stringify(log, null, 2));
console.log(JSON.stringify({ maskBox: mBox, pillBox: pBox, refPx: ref }, null, 2));
for (const s of log.seeked) console.log(s.t, s.clipPath, s.radiusPx, s.coversPillHeight ? "H" : "-", s.coversPillWidth ? "W" : "-", s.coversPillCorners ? "C" : "-");
await b.close();
