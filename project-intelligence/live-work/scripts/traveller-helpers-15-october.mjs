/** THE CARDS' TRAVELLING LIGHT, BACK ON, WITH ITS HELPERS (15 October 2026, session 3). Carl: "Turn back on the cards
 *  travelling light. Show the light helpers on the page. We will change the lights trajectory."
 *  /start?lighthelpers=1 at Carl's screen (1920 × 952, DPR 1 → the site's zoom 1.36), Q5: six frames across one sweep,
 *  the whole page, then the grid region alone.
 *  Usage: node …/traveller-helpers-15-october.mjs <outDir> [query]
 *  ⚠ NOT WATCHED: Carl's GPU and Chrome; the frames' timing is wall-clock, not locked to the sweep's phase. */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
const [OUT, Q = "?lighthelpers=1"] = process.argv.slice(2);
mkdirSync(OUT, { recursive: true });
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const ctx = await b.newContext({ viewport: { width: 1920, height: 952 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
const errs = [];
p.on("console", (m) => m.type() === "error" && errs.push(m.text()));
await p.goto("http://localhost:3000/start" + Q, { waitUntil: "load" });
await p.waitForTimeout(9000);
await p.getByRole("button", { name: /begin/i }).click();
await p.locator(".enquiry-answer-grid").waitFor({ state: "visible", timeout: 30000 });
await p.mouse.move(5, 5);
await p.waitForTimeout(4000);
for (let i = 0; i < 6; i++) {
  await p.screenshot({ path: join(OUT, `frame-${i}.png`) });
  await p.waitForTimeout(700);
}
console.log("console errors:", errs.length, errs.slice(0, 3));
console.log("→", OUT);
await b.close();
