/** CARD 1's PROMPT, LOOKED AT (14 October 2026): "click to restart" large on CA's face while §2 is STATIC. `/about` at
 *  1412 × 700: §2, 5 s; §4, 1 s; back to §2 — a full frame, and a crop of CA. Logs the prompt's console line (its size).
 *  ⚠ NOT WATCHED: Carl's Chrome; other window sizes. */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
const OUT = "project-intelligence/live-work/screenshots/s2-prompt-14-october";
mkdirSync(OUT, { recursive: true });
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const p = await (await b.newContext({ viewport: { width: 1412, height: 700 } })).newPage();
p.on("console", (m) => { if (m.text().startsWith("card prompt")) console.log(m.text()); });
await p.goto("http://localhost:3000/about", { waitUntil: "load" });
await p.mouse.move(5, 5);
await p.waitForTimeout(3000);
await p.evaluate(() => document.getElementById("roles").scrollIntoView({ block: "start" }));
await p.waitForTimeout(5000);
await p.evaluate(() => document.getElementById("start").scrollIntoView({ block: "start" }));
await p.waitForTimeout(1000);
await p.evaluate(() => document.getElementById("roles").scrollIntoView({ block: "start" }));
await p.waitForTimeout(1500);
await p.screenshot({ path: `${OUT}/static_full.png` });
await p.screenshot({ path: `${OUT}/static_ca.png`, clip: { x: 260, y: 180, width: 380, height: 240 } });
await b.close();
console.log(OUT);
