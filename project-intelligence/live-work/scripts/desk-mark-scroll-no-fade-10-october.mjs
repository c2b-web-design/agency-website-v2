/** THE FADE ON CA's STRIKE, the scroll side (10 October 2026; first written for the superseded no-fade take): the desk
 *  crop sampled DURING a wheel scroll through the wipe and after it stops — the mark must be ABSENT until CA strikes
 *  (the `neon:ignite` performance mark, logged with the scroll position it came at) and fade in from there.
 *  ⚠ NOT WATCHED: Carl's Chrome; trackpad flings; frames between screenshots. */
import { chromium } from "playwright";
const out = process.argv[2];
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const ctx = await b.newContext({ viewport: { width: 1412, height: 700 }, deviceScaleFactor: 1.36 });
const p = await ctx.newPage();
await p.goto("http://localhost:3000/about", { waitUntil: "networkidle" });
await p.waitForTimeout(3000);
await p.mouse.move(700, 350);
const c = await p.evaluate(() => { const r = [...document.querySelectorAll("canvas")].sort((a, b) => b.width - a.width)[0].getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width }; });
const k = c.w / 2560, clip = { x: c.x + 1900 * k, y: c.y + 800 * k, width: 560 * k, height: 400 * k };
const struck = () => p.evaluate(() => performance.getEntriesByName("neon:ignite").length > 0);
let i = 0, logged = false;
const shot = async (tag) => p.screenshot({ path: `${out}/scroll-${String(i++).padStart(2, "0")}-${tag}.png`, clip });
while ((await p.evaluate(() => scrollY)) < 690) {
  await p.mouse.wheel(0, 40); await p.waitForTimeout(40);
  const y = Math.round(await p.evaluate(() => scrollY));
  if (!logged && (await struck())) { console.log(`CA struck by scrollY ${y}`); logged = true; }
  if (y > 300) await shot(`y${y}${logged ? "-struck" : ""}`);
}
for (let j = 0; j < 5; j++) { await p.waitForTimeout(250); await shot(`held-${j}`); }
await b.close();
