/** THE DESK MARK AFTER A JUMP §2 → §4 → §2 (14 October 2026). Found in `about-s2-return-verify.mjs` walk B: after a
 *  1 s jump to `#start` and back, the mark stood on the desk again. The journey code (`DESK_MARK_TIE`, the latch) is
 *  untouched by step 2. This asks: does it depend on how long the reader stays in §4 (the drop plays at its own speed
 *  after a jump, and latches only at its end)? Stays of 1, 3 and 8 s; a frame of the desk after each return, and
 *  whether the canvas drew while off screen is NOT read (Step 1: it draws nothing off screen; DeskMark's own frames
 *  still run when asked for). ⚠ NOT WATCHED: the header's Start link (a jump by `scrollIntoView` stands in for it). */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
const OUT = "project-intelligence/live-work/screenshots/s2-return-step2-14-october";
mkdirSync(OUT, { recursive: true });
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
for (const stay of [1000, 3000, 8000]) {
  const p = await (await b.newContext({ viewport: { width: 1412, height: 700 } })).newPage();
  await p.goto("http://localhost:3000/about", { waitUntil: "load" });
  await p.mouse.move(5, 5);
  await p.waitForTimeout(3000);
  await p.evaluate(() => document.getElementById("roles").scrollIntoView({ block: "start" }));
  await p.waitForTimeout(4000);
  await p.evaluate(() => document.getElementById("start").scrollIntoView({ block: "start" }));
  await p.waitForTimeout(stay);
  await p.evaluate(() => document.getElementById("roles").scrollIntoView({ block: "start" }));
  await p.waitForTimeout(1500);
  await p.screenshot({ path: `${OUT}/mark_after_s4_stay_${stay / 1000}s.png`, clip: { x: 900, y: 300, width: 400, height: 260 } });
  console.log(`stay ${stay / 1000} s in §4 → ${OUT}/mark_after_s4_stay_${stay / 1000}s.png`);
  await p.context().close();
}
await b.close();
