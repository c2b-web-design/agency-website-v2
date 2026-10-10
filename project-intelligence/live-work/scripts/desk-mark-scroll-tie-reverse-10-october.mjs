/** THE SCROLL TIE, STOP AND REVERSE (10 October 2026) — on a FRESH page, before any landing (the first run of
 *  desk-mark-scroll-tie-10-october.mjs tested these after the latch, which proves nothing). Roles, wheel down to 400 px:
 *  (a) two crops 1 s apart identical (stopped); (b) wheel up 200 px: the crop must match the 200 px frame on the way
 *  down (the same scroll point → the same pose). ⚠ The match is pixel-exact only if the neon is out of the crop.
 *  ⚠ NOT WATCHED: Carl's Chrome; trackpads. */
import { chromium } from "playwright";
const out = "project-intelligence/live-work/screenshots/desk-mark-scroll-tie-10-october";
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const p = await (await b.newContext({ viewport: { width: 1412, height: 700 } })).newPage();
const right = { x: 900, y: 300, width: 500, height: 400 };
await p.goto("http://localhost:3000/about", { waitUntil: "networkidle" });
await p.waitForTimeout(2500);
await p.getByRole("link", { name: "Roles", exact: true }).first().click();
await p.waitForTimeout(2500);
await p.mouse.move(700, 350);
await p.mouse.wheel(0, 100); await p.waitForTimeout(600);
await p.mouse.wheel(0, 100); await p.waitForTimeout(1200);
const down200 = await p.screenshot({ clip: right, path: `${out}/7-fresh-down-200.png` });
await p.mouse.wheel(0, 100); await p.waitForTimeout(600);
await p.mouse.wheel(0, 100); await p.waitForTimeout(1200);
const a = await p.screenshot({ clip: right, path: `${out}/7-fresh-held-400.png` });
await p.waitForTimeout(1000);
const b2 = await p.screenshot({ clip: right });
console.log("(a) held at 400, crops 1 s apart identical:", a.equals(b2), "| differs from the 200 frame:", !a.equals(down200));
await p.mouse.wheel(0, -100); await p.waitForTimeout(600);
await p.mouse.wheel(0, -100); await p.waitForTimeout(1500);
const up200 = await p.screenshot({ clip: right, path: `${out}/7-fresh-back-up-200.png` });
console.log("(b) back up at 200 identical to the 200 frame on the way down:", up200.equals(down200));
await b.close();
