/** WHAT LIGHTS THE DESK MARK IN THE ROOM — 8 October 2026 (Carl: "Its looking lighter than when it was first placed in
 *  the room and then it eas facing the cards almost"). /about?mark=1 with each source switched off in turn (the canvas's
 *  own diagnostics: ?take=0 the take light, ?envmap=0 the reflection map), and the control without the mark. Measures
 *  the mean luminance of the mark's pixels (those that differ from the control by > 12) in the desk crop.
 *  ⚠ NOT WATCHED: take 1's orientation (not re-rendered); Carl's Chrome. */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
const out = "project-intelligence/live-work/screenshots/desk-mark-light-8-october";
mkdirSync(out, { recursive: true });
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const ctx = await b.newContext({ viewport: { width: 1412, height: 700 }, deviceScaleFactor: 1.36 });
{ const p = await ctx.newPage(); await p.goto("http://localhost:3000/about", { waitUntil: "networkidle" }); await p.waitForTimeout(1500); await p.close(); }
for (const [name, q] of [["control", "?neon=none"], ["both", "?mark=1&neon=none"], ["no-take", "?mark=1&neon=none&take=0"], ["no-envmap", "?mark=1&neon=none&envmap=0"], ["neither", "?mark=1&neon=none&take=0&envmap=0"]]) {
  const p = await ctx.newPage();
  await p.goto(`http://localhost:3000/about${q}`, { waitUntil: "networkidle" });
  await p.waitForTimeout(2000);
  await p.getByRole("link", { name: "Roles", exact: true }).first().click();
  await p.waitForTimeout(5000);
  const c = await p.evaluate(() => { const r = [...document.querySelectorAll("canvas")].sort((a, b) => b.width - a.width)[0].getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width }; });
  const k = c.w / 2560;
  await p.screenshot({ path: `${out}/${name}.png`, clip: { x: c.x + 1980 * k, y: c.y + 840 * k, width: 360 * k, height: 230 * k } });
  await p.close();
}
await b.close();
