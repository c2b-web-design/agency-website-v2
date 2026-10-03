/** THE CLIENT INFO ORBIT, FILMED — 3 October 2026. Carl: "look at the client info section, especially the orbit of
 *  the moving light." /start?skip=1 (the dev door), 11 s settle, then a frame every 400 ms for 12 s (> one 10 s lap).
 *  ⚠ NOT WATCHED: anything but these frames; Carl's Chrome. */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
const out = "project-intelligence/live-work/screenshots/client-info-orbit-3-october";
mkdirSync(out, { recursive: true });
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const ctx = await b.newContext({ viewport: { width: 1412, height: 700 }, deviceScaleFactor: 1.36 });
const p = await ctx.newPage();
await p.goto("http://localhost:3000/start?skip=1", { waitUntil: "networkidle" });
await p.waitForTimeout(11000);
const t0 = Date.now();
for (let i = 0; i < 30; i++) {
  while (Date.now() - t0 < i * 400) await p.waitForTimeout(20);
  await p.screenshot({ path: `${out}/f${String(i).padStart(2, "0")}.png` });
}
await b.close();
