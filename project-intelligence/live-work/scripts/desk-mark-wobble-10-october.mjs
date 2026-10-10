/** THE WOBBLE (10 October 2026). Roles, then the desk crop sampled through the wobble STRETCHED for the eye
 *  (?wobblems=6000&wobbleat=1500 — the shape and the pivots, not the speed: 500 ms is too quick for screenshots).
 *  ⚠ NOT WATCHED: the real 500 ms; Carl's Chrome. */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
const out = "project-intelligence/live-work/screenshots/desk-mark-wobble-10-october";
mkdirSync(out, { recursive: true });
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const ctx = await b.newContext({ viewport: { width: 1412, height: 700 }, deviceScaleFactor: 1.36 });
const p = await ctx.newPage();
await p.goto("http://localhost:3000/about?wobblems=6000&wobbleat=1500", { waitUntil: "networkidle" });
await p.waitForTimeout(3000);
await p.getByRole("link", { name: "Roles", exact: true }).first().click();
const t0 = Date.now();
await p.waitForTimeout(40);
const c = await p.evaluate(() => { const r = [...document.querySelectorAll("canvas")].sort((a, b) => b.width - a.width)[0].getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width }; });
const k = c.w / 2560, clip = { x: c.x + 1900 * k, y: c.y + 800 * k, width: 560 * k, height: 400 * k };
while (Date.now() - t0 < 8500) {
  const t = Date.now() - t0;
  if (t > 1300) await p.screenshot({ path: `${out}/t${String(t).padStart(5, "0")}ms.png`, clip });
  await p.waitForTimeout(150);
}
await b.close();
