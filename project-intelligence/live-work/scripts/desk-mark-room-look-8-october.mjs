/** THE DESK MARK IN THE ROOM, LOOKED AT — 8 October 2026 (Carl: "put the logo in the scene perpendicular to the right
 *  side angle of the desk" — "Face along the desk"; behind ?mark=1). /about?mark=1, press Roles (§2), frames at 6 s:
 *  the viewport, and a crop round the desk's right end from the canvas. Also plain /about for the control (no mark).
 *  ⚠ NOT WATCHED: Carl's Chrome; motion (the take is still). */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
const out = "project-intelligence/live-work/screenshots/desk-mark-room-8-october";
mkdirSync(out, { recursive: true });
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const ctx = await b.newContext({ viewport: { width: 1412, height: 700 }, deviceScaleFactor: 1.36 });
{ const p = await ctx.newPage(); await p.goto("http://localhost:3000/about", { waitUntil: "networkidle" }); await p.waitForTimeout(1500); await p.close(); }
for (const [name, q] of [["mark", "?mark=1"], ["control", ""]]) {
  const p = await ctx.newPage();
  const errs = [];
  p.on("console", (m) => { if (m.type() === "error") errs.push(m.text().slice(0, 300)); });
  p.on("pageerror", (e) => errs.push(e.message.slice(0, 300)));
  await p.goto(`http://localhost:3000/about${q}`, { waitUntil: "networkidle" });
  await p.waitForTimeout(2000);
  await p.getByRole("link", { name: "Roles", exact: true }).first().click();
  await p.waitForTimeout(6000);
  await p.screenshot({ path: `${out}/${name}-viewport.png` });
  // the canvas box is the plate's aspect; crop plate x 1700–2560, y 760–1180
  const c = await p.evaluate(() => { const r = [...document.querySelectorAll("canvas")].sort((a, b) => b.width - a.width)[0].getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; });
  const k = c.w / 2560;
  await p.screenshot({ path: `${out}/${name}-desk.png`, clip: { x: c.x + 1700 * k, y: c.y + 760 * k, width: 860 * k, height: 420 * k } });
  console.log(name, "canvas", JSON.stringify(c), errs.length ? errs.join("\n") : "no console errors");
  await p.close();
}
await b.close();
