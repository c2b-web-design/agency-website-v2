// The desk mark's gold → platinum-blue crossing on /proto/logo — 8 October 2026. Headed, real GPU, Carl's viewport.
//   front-*.png    — the front view at set progress values (to set beside /start's frames, screenshots/start-logo-8-october/)
//   oblique-*.png  — the same, from the oblique view (the sphere wrapping the chamfer and walls)
//   turn-*.png     — the turntable at progress 0.5, over time: the edge must stay on the metal as the mark turns
//   readings.json  — the bench's measured window and pace, and a TIMED PLAY (wall clock, gold → blue, 0 → 1)
// Usage: node project-intelligence/live-work/scripts/logo-crossing-shots-8-october.mjs   (dev server on :3000)
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
const OUT = "project-intelligence/live-work/screenshots/logo-crossing-8-october";
mkdirSync(OUT, { recursive: true });
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const ctx = await b.newContext({ viewport: { width: 1412, height: 700 }, deviceScaleFactor: 1.36 });
const p = await ctx.newPage();
const log = {};
const ready = async () => {
  await p.waitForFunction(() => window.__logoBench?.ready && window.__logoBench.crossing, null, { timeout: 60000 });
  await p.waitForTimeout(800);
};
const canvasShot = async (name) => {
  const c = p.locator("canvas").first();
  await c.screenshot({ path: `${OUT}/${name}.png` });
};
const STEPS = [0, 0.15, 0.3, 0.5, 0.7, 0.85, 0.95, 1];
for (const view of ["front", "oblique"]) {
  await p.goto(`http://localhost:3000/proto/logo?view=${view}&mode=crossing`, { waitUntil: "networkidle" });
  await p.addStyleTag({ content: "nextjs-portal { display: none !important; }" });
  await ready();
  if (view === "front") log.crossing = await p.evaluate(() => window.__logoBench.crossing);
  for (const s of STEPS) {
    await p.evaluate((s) => window.__logoBenchCross(s), s);
    await p.waitForTimeout(250);
    await canvasShot(`${view}-${s.toFixed(2)}`);
  }
}
// turntable mid-crossing
await p.goto(`http://localhost:3000/proto/logo?view=turntable&mode=crossing&cross=0.5`, { waitUntil: "networkidle" });
await p.addStyleTag({ content: "nextjs-portal { display: none !important; }" });
await ready();
for (let i = 0; i < 6; i++) { await canvasShot(`turn-${i}`); await p.waitForTimeout(1500); }
// a timed play, wall clock: press ▶ and watch the slider's readout reach 1.000
await p.goto(`http://localhost:3000/proto/logo?view=front&mode=crossing`, { waitUntil: "networkidle" });
await ready();
log.play = await p.evaluate(async () => {
  const btn = [...document.querySelectorAll("button")].find((x) => x.textContent.includes("gold → blue"));
  const t0 = performance.now();
  btn.click();
  const read = () => [...document.querySelectorAll("label")].find((l) => l.textContent.startsWith("crossing"))?.querySelector("input")?.value;
  const samples = [];
  while (performance.now() - t0 < 4000) {
    await new Promise((r) => requestAnimationFrame(r));
    const v = Number(read());
    samples.push([+(performance.now() - t0).toFixed(0), v]);
    if (v >= 1) break;
  }
  return { wallMsToOne: samples.at(-1)[0], halfway: samples.find((s) => s[1] >= 0.5), samplesCount: samples.length };
});
writeFileSync(`${OUT}/readings.json`, JSON.stringify(log, null, 2));
console.log(JSON.stringify(log, null, 2));
await b.close();
