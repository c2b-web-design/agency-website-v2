import { chromium } from "playwright";
const out = "project-intelligence/live-work/screenshots/desk-mark-drop-s3-8-october-s2";
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const ctx = await b.newContext({ viewport: { width: 1412, height: 700 }, deviceScaleFactor: 1.36 });
const p = await ctx.newPage();
await p.goto("http://localhost:3000/about", { waitUntil: "networkidle" });
await p.waitForTimeout(2000);
// half way through the §1 → §2 wipe: §2's top at half the window
await p.evaluate(() => { const r = document.getElementById("roles").getBoundingClientRect(); window.scrollBy(0, r.top - innerHeight * 0.5); });
await p.waitForTimeout(1500);
const w = await p.evaluate(() => { const s = document.querySelector("[data-room-stage]"); return [getComputedStyle(s).getPropertyValue("--wipe-solid"), getComputedStyle(s).getPropertyValue("--wipe-clear"), getComputedStyle(s.lastElementChild).maskSize]; });
await p.screenshot({ path: `${out}/wipe-mid.png` });
// landed on §2: the strike should fire and CA light
await p.evaluate(() => { const r = document.getElementById("roles").getBoundingClientRect(); window.scrollBy(0, r.top); });
await p.waitForTimeout(5000);
await p.screenshot({ path: `${out}/s2-landed.png` });
console.log("wipe vars + mask size", JSON.stringify(w));
await b.close();
