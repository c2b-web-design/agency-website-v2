/** THE ROLES FADE (10 October 2026). Plain /about. (1) Roles clicked → the desk crop sampled from the click, with each
 *  frame's real time since the click in its name (a screenshot takes tens of ms, so the times are measured, not planned).
 *  (2) Arriving by SCROLL in small wheel steps → the mark must be fully there at the end, no fade.
 *  ⚠ NOT WATCHED: Carl's Chrome; frame-by-frame order (a one-frame flash would fall between screenshots); trackpad flings. */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
const out = "project-intelligence/live-work/screenshots/desk-mark-strike-fade-10-october";
mkdirSync(out, { recursive: true });
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const ctx = await b.newContext({ viewport: { width: 1412, height: 700 }, deviceScaleFactor: 1.36 });
const crop = async (p) => {
  const c = await p.evaluate(() => { const r = [...document.querySelectorAll("canvas")].sort((a, b) => b.width - a.width)[0].getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width }; });
  const k = c.w / 2560;
  return { x: c.x + 1900 * k, y: c.y + 800 * k, width: 560 * k, height: 400 * k };
};
// (1) Roles
let p = await ctx.newPage();
await p.goto("http://localhost:3000/about", { waitUntil: "networkidle" });
await p.waitForTimeout(3000);
await p.getByRole("link", { name: "Roles", exact: true }).first().click();
const t0 = Date.now();
await p.waitForTimeout(30);
const clip = await crop(p);
for (let i = 0; i < 14; i++) {
  const t = Date.now() - t0;
  await p.screenshot({ path: `${out}/roles-${String(i).padStart(2, "0")}-${t}ms.png`, clip });
  await p.waitForTimeout(i < 8 ? 60 : 250);
}
console.log("roles: frames written");
await p.close();
// (2) scroll
p = await ctx.newPage();
await p.goto("http://localhost:3000/about", { waitUntil: "networkidle" });
await p.waitForTimeout(3000);
await p.mouse.move(700, 350);
const target = await p.evaluate(() => document.getElementById("roles").getBoundingClientRect().top + scrollY);
while ((await p.evaluate(() => scrollY)) < target - 5) { await p.mouse.wheel(0, 40); await p.waitForTimeout(40); }
await p.waitForTimeout(1500);
await p.screenshot({ path: `${out}/scroll-arrived.png`, clip: await crop(p) });
console.log("scroll: arrived at", await p.evaluate(() => scrollY), "of", target);
await b.close();
