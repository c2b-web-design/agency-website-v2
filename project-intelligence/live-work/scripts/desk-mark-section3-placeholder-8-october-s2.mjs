/** §3's PLAYER PLACEHOLDER — 8 October 2026, session 2 (Carl: "a large white rectangle on the right hand side of the
 *  page in the middle… the target area the logo must be in"). /about#examples, frame at 3 s, and the box's rect.
 *  ⚠ NOT WATCHED: Carl's Chrome; other viewport sizes; phones. */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
const out = "project-intelligence/live-work/screenshots/section3-placeholder-8-october-s2";
mkdirSync(out, { recursive: true });
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const ctx = await b.newContext({ viewport: { width: 1412, height: 700 }, deviceScaleFactor: 1.36 });
const p = await ctx.newPage();
const errs = [];
p.on("pageerror", (e) => errs.push(e.message.slice(0, 300)));
await p.goto("http://localhost:3000/about#examples", { waitUntil: "networkidle" });
await p.waitForTimeout(3000);
await p.screenshot({ path: `${out}/viewport.png` });
const r = await p.evaluate(() => { const b = document.getElementById("examples-player").getBoundingClientRect(); return { x: b.x, y: b.y, w: b.width, h: b.height, vw: innerWidth, vh: innerHeight }; });
console.log("player", JSON.stringify(r), errs.length ? errs.join("\n") : "no page errors");
await b.close();
