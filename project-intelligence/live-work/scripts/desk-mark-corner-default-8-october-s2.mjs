/** THE CORNER AS THE DEFAULT — 8 October 2026, session 2 (Carl: "just put the logo in the postion we left it").
 *  /about#roles, NO query (the mark on plain /about), frames at 6 s: the viewport and the desk's right end.
 *  ⚠ NOT WATCHED: Carl's Chrome; motion (the corner pose is still by default). */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
const out = "project-intelligence/live-work/screenshots/desk-mark-corner-default-8-october-s2";
mkdirSync(out, { recursive: true });
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const ctx = await b.newContext({ viewport: { width: 1412, height: 700 }, deviceScaleFactor: 1.36 });
{ const p = await ctx.newPage(); await p.goto("http://localhost:3000/about", { waitUntil: "networkidle" }); await p.waitForTimeout(1500); await p.close(); }
const p = await ctx.newPage();
const errs = [];
p.on("console", (m) => { if (m.type() === "error") errs.push(m.text().slice(0, 300)); });
p.on("pageerror", (e) => errs.push(e.message.slice(0, 300)));
await p.goto("http://localhost:3000/about#roles", { waitUntil: "networkidle" });
await p.waitForTimeout(2000);
await p.waitForTimeout(6000);
await p.screenshot({ path: `${out}/viewport.png` });
const c = await p.evaluate(() => { const r = [...document.querySelectorAll("canvas")].sort((a, b) => b.width - a.width)[0].getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; });
const k = c.w / 2560;
await p.screenshot({ path: `${out}/desk.png`, clip: { x: c.x + 1700 * k, y: c.y + 760 * k, width: 860 * k, height: 420 * k } });
console.log("canvas", JSON.stringify(c), errs.length ? errs.join("\n") : "no console errors");
await p.close();
await b.close();
