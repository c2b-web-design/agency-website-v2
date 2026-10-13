/** §2 AFTER A TRIP TO §4, LOOKED AT (13 October 2026, step 1: the room draws nothing while off screen). `/about` at
 *  1412 × 700; jump to `#roles`; 10 s there (CA strikes, its text writes); jump to `#start` for 6 s (the room off screen,
 *  drawing nothing); jump back to `#roles` — frames at +0.1 s and +1 s back, and one taken at the same sequence time on a
 *  page that never left §2 (to compare). ⚠ NOT WATCHED: a slow scroll back (jumps only); Carl's Chrome. */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
const OUT = "project-intelligence/live-work/screenshots/s2-return-13-october";
mkdirSync(OUT, { recursive: true });
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
async function go(leave) {
  const p = await (await b.newContext({ viewport: { width: 1412, height: 700 } })).newPage();
  await p.goto("http://localhost:3000/about", { waitUntil: "load" });
  await p.mouse.move(5, 5);
  await p.waitForTimeout(3000);
  await p.evaluate(() => document.querySelector("#roles").scrollIntoView({ block: "start" }));
  await p.waitForTimeout(10000);
  if (leave) { await p.evaluate(() => document.querySelector("#start").scrollIntoView({ block: "start" })); await p.waitForTimeout(6000); await p.evaluate(() => document.querySelector("#roles").scrollIntoView({ block: "start" })); }
  else await p.waitForTimeout(6000);
  const ign = await p.evaluate(() => performance.getEntriesByName("neon:ignite")[0]?.startTime);
  await p.waitForTimeout(100);
  const t1 = await p.evaluate((i) => ((performance.now() - i) / 1000).toFixed(1), ign);
  await p.screenshot({ path: `${OUT}/${leave ? "returned" : "stayed"}_+0.1s.png` });
  await p.waitForTimeout(900);
  const t2 = await p.evaluate((i) => ((performance.now() - i) / 1000).toFixed(1), ign);
  await p.screenshot({ path: `${OUT}/${leave ? "returned" : "stayed"}_+1s.png` });
  console.log(`${leave ? "left for §4 and came back" : "stayed in §2"}: frames at ${t1} s and ${t2} s after the ignition`);
  await p.context().close();
}
await go(true);
await go(false);
await b.close();
console.log(OUT);
