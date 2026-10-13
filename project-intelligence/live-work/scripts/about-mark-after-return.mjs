/** WHERE IS THE DESK MARK AFTER §2 → §4 → §2? (13 October 2026, checking step 1.) The desk was empty on return
 *  (`about-s2-return-look.mjs`). R-041: the journey latches the mark in §3's player. Same path, then §3 (`#examples`) at the
 *  window's top: a frame, to see the mark in the player. ⚠ NOT WATCHED: the drop in motion; Carl's Chrome. */
import { chromium } from "playwright";
const OUT = "project-intelligence/live-work/screenshots/s2-return-13-october";
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const p = await (await b.newContext({ viewport: { width: 1412, height: 700 } })).newPage();
await p.goto("http://localhost:3000/about", { waitUntil: "load" });
await p.mouse.move(5, 5);
await p.waitForTimeout(3000);
await p.evaluate(() => document.querySelector("#roles").scrollIntoView({ block: "start" }));
await p.waitForTimeout(10000);
await p.evaluate(() => document.querySelector("#start").scrollIntoView({ block: "start" }));
await p.waitForTimeout(6000);
await p.evaluate(() => document.querySelector("#roles").scrollIntoView({ block: "start" }));
await p.waitForTimeout(2000);
await p.evaluate(() => document.querySelector("#examples").scrollIntoView({ block: "start" }));
await p.waitForTimeout(2500);
await p.screenshot({ path: `${OUT}/returned_then-s3.png` });
await b.close();
console.log(`${OUT}/returned_then-s3.png`);
