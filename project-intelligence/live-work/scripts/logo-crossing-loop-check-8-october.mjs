// Carl opened /proto/logo?view=front&mode=crossing and saw nothing move (8 October 2026). Check the fix as he would see
// it: a fresh load at his viewport, NO interaction; sample the crossing's progress for 6 s and screenshot the viewport.
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
const OUT = "project-intelligence/live-work/screenshots/logo-crossing-8-october/loop-check";
mkdirSync(OUT, { recursive: true });
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const p = await (await b.newContext({ viewport: { width: 1412, height: 700 }, deviceScaleFactor: 1.36 })).newPage();
await p.goto("http://localhost:3000/proto/logo?view=front&mode=crossing", { waitUntil: "networkidle" });
await p.waitForFunction(() => window.__logoBench?.crossing, null, { timeout: 60000 });
const t0 = Date.now();
const read = () => p.evaluate(() => [...document.querySelectorAll("label")].find((l) => l.textContent.startsWith("crossing"))?.querySelector("input")?.value);
const samples = [];
let shot = 0;
while (Date.now() - t0 < 6000) {
  samples.push(`${Date.now() - t0}ms:${Number(await read()).toFixed(2)}`);
  if (samples.length % 6 === 0) await p.screenshot({ path: `${OUT}/viewport-${shot++}.png` });
  await p.waitForTimeout(100);
}
console.log(samples.join("  "));
await b.close();
