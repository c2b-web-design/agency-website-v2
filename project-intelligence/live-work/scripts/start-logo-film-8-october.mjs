// Film the header mark on /start from the Begin press — 8 October 2026 (Carl: "Go look at the start page after the
// 'begin' button is pressed and observe and note the logo transition"). Headed, real GPU, Carl's viewport, DPR 4.
// Two records:
//   realtime/  — screenshots as fast as Playwright takes them from the click (the pace as it plays).
//   seeked/    — the gold's clip animation PAUSED and set to exact times, 0 → 1300 ms every 100 ms (the edge's shape,
//                independent of screenshot timing). Also logs the computed clip-path at each step.
// Usage: node project-intelligence/live-work/scripts/start-logo-film-8-october.mjs   (dev server on :3000)
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
const OUT = "project-intelligence/live-work/screenshots/start-logo-8-october";
for (const d of ["realtime", "seeked"]) mkdirSync(`${OUT}/${d}`, { recursive: true });
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const ctx = await b.newContext({ viewport: { width: 1412, height: 700 }, deviceScaleFactor: 4 });
const p = await ctx.newPage();
await p.goto("http://localhost:3000/start", { waitUntil: "networkidle" });
await p.addStyleTag({ content: "nextjs-portal { display: none !important; }" });
await p.waitForTimeout(9000);
const gold = p.locator('img[src*="c2b-logo-mark.png"]').first();
const box = await gold.evaluate((el) => { const r = el.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; });
const clip = { x: Math.max(0, box.x - 20), y: Math.max(0, box.y - 12), width: box.w + 40, height: box.h + 24 };
const log = { box, before: await gold.evaluate((el) => getComputedStyle(el).clipPath) };
await p.screenshot({ path: `${OUT}/00-before.png`, clip });
await p.screenshot({ path: `${OUT}/page-before.png` });

// REAL TIME
await p.getByRole("button", { name: /begin/i }).click();
const t0 = Date.now();
const rt = [];
for (let i = 1; i <= 30; i++) {
  const ms = Date.now() - t0;
  await p.screenshot({ path: `${OUT}/realtime/${String(i).padStart(2, "0")}-${ms}ms.png`, clip });
  rt.push(ms);
}
log.realtimeMs = rt;
await p.waitForTimeout(1500);
await p.screenshot({ path: `${OUT}/zz-after.png`, clip });
await p.screenshot({ path: `${OUT}/page-after.png` });

// SEEKED — replay the same animation on the gold, paused, at exact times.
log.seeked = [];
for (let t = 0; t <= 1300; t += 100) {
  const cp = await gold.evaluate((el, t) => {
    const a = el.getAnimations().find((x) => x.animationName === "enquiry-logo-radial-in");
    if (!a) return "NO ANIMATION";
    a.pause(); a.currentTime = t;
    return getComputedStyle(el).clipPath;
  }, t);
  await p.waitForTimeout(80);
  await p.screenshot({ path: `${OUT}/seeked/${String(t).padStart(4, "0")}ms.png`, clip });
  log.seeked.push({ t, clipPath: cp });
}
writeFileSync(`${OUT}/readings.json`, JSON.stringify(log, null, 2));
console.log(JSON.stringify(log, null, 2));
await b.close();
