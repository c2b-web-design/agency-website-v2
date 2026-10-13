/** The desk mark after the worker change, LOOKED AT (13 October 2026): /about with §2 at the window's top, 9 s after load (the
 *  sequence strikes and the mark's light comes up), and the desk's right end cropped. ⚠ NOT WATCHED: the journey (the
 *  geometry is proven identical to the inline build by desk-mark-worker-check.mjs; nothing else changed). */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
const out = "project-intelligence/live-work/screenshots/gold-button-13-october/desk-mark";
mkdirSync(out, { recursive: true });
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const p = await (await b.newContext({ viewport: { width: 1412, height: 700 } })).newPage();
await p.goto("http://localhost:3000/about", { waitUntil: "networkidle" });
const roles = await p.evaluate(() => { const s = [...document.querySelectorAll("section")][1]; return s ? s.getBoundingClientRect().top + window.scrollY : null; });
await p.evaluate((y) => window.scrollTo(0, y), roles);
await p.waitForTimeout(9000);
await p.screenshot({ path: `${out}/s2_after-worker.png` });
await p.screenshot({ path: `${out}/s2_after-worker_desk-right.png`, clip: { x: 1000, y: 330, width: 412, height: 260 } });
console.log(out);
await b.close();
