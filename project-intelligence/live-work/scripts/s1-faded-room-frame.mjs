/**
 * §1 WITH THE ROOM FADED BEHIND IT — one frame, 27 September 2026. Carl: "For now, just put a static faded image in
 * Sect 1. I want to see how the logo looks and the navigation text." Plain `/about` at the top, Carl's viewport and
 * DPR. ⚠ One still — Carl's eye judges it.
 *   node --no-warnings project-intelligence/live-work/scripts/s1-faded-room-frame.mjs
 */
import { chromium } from "playwright";
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const p = await b.newPage({ viewport: { width: 1412, height: 700 }, deviceScaleFactor: 1.36 });
const errors = [];
p.on("console", (m) => { if (m.type() === "error") errors.push(m.text().slice(0, 200)); });
await p.goto("http://localhost:3000/about", { waitUntil: "networkidle" });
await p.waitForTimeout(2500);
await p.screenshot({ path: "project-intelligence/live-work/screenshots/s1-faded-room-27-september/s1.png" });
console.log(errors.length ? errors.join("\n") : "console: no errors");
await b.close();
