/** WHERE IS THE MARK AFTER A JUMP §2 → §4? (14 October 2026, re-check on Carl's "There is no fault, check again.")
 *  Jump to `#roles` (the mark on the desk), then to `#start`; at 0.5 / 1 / 1.5 / 2 / 3 s after that jump, move to
 *  `#examples` (the scroll's journey point is the SAME there — the drop's end — so this does not change what the mark is
 *  doing) and capture §3's player with its placeholder picture hidden. One fresh page per time. Answers: had the mark reached the player when the 1 s probe
 *  turned back? ⚠ NOT WATCHED: the header link (scrollIntoView stands in); Carl's Chrome. */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
const OUT = "project-intelligence/live-work/screenshots/s2-return-step2-14-october";
mkdirSync(OUT, { recursive: true });
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
for (const at of [500, 1000, 1500, 2000, 3000]) {
  const p = await (await b.newContext({ viewport: { width: 1412, height: 700 } })).newPage();
  await p.goto("http://localhost:3000/about", { waitUntil: "load" });
  await p.mouse.move(5, 5);
  await p.waitForTimeout(3000);
  await p.evaluate(() => document.getElementById("roles").scrollIntoView({ block: "start" }));
  await p.waitForTimeout(4000);
  await p.evaluate(() => document.getElementById("start").scrollIntoView({ block: "start" }));
  await p.waitForTimeout(at);
  await p.evaluate(() => document.getElementById("examples").scrollIntoView({ block: "start" }));
  // ⚠ the player's flat placeholder picture is ALWAYS there — hide it, so only the 3D mark can show (first run of this
  // probe captured the picture and read it as the mark)
  await p.evaluate(() => { document.getElementById("examples-player-target").style.visibility = "hidden"; });
  await p.waitForTimeout(50);
  await p.screenshot({ path: `${OUT}/jump_timeline_${at}ms.png` });
  console.log(`${at} ms after the jump → ${OUT}/jump_timeline_${at}ms.png`);
  await p.context().close();
}
await b.close();
