/** WHEN THE LOGO STARTS ITS RETURN TO GOLD, FROM THE Q1 NEXT STEP CLICK (17 October 2026; D-023). The hold before
 *  `complete` is now COMPLETE_HOLD_MS = 2050 ms (was 900; measured then at +966 ms). /start at 1920 × 952, DPR 1:
 *  Begin → Q5…Q1 (card 1, Next step); an in-page rAF watch from the Q1 click reports the first frame the gold mark's
 *  `animation-name` is `enquiry-logo-radial-out` (the return). Three runs.
 *  Usage: node …/logo-return-timing-17-october.mjs
 *  ⚠ NOT WATCHED: production; Carl's GPU/Chrome. */
import { chromium } from "playwright";
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
for (let run = 1; run <= 3; run++) {
  const ctx = await b.newContext({ viewport: { width: 1920, height: 952 }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  await p.goto("http://localhost:3000/start", { waitUntil: "load" });
  await p.waitForTimeout(9000);
  await p.getByRole("button", { name: /begin/i }).click();
  await p.mouse.move(5, 5);
  for (const q of [5, 4, 3, 2, 1]) {
    await p.waitForTimeout(q === 5 ? 7000 : 5000);
    const bx = await p.getByTestId("answer-card-hover-0").boundingBox();
    await p.mouse.click(bx.x + bx.width / 2, bx.y + bx.height / 2);
    await p.mouse.move(5, 5);
    await p.waitForTimeout(2500);
    if (q === 1)
      await p.evaluate(() => {
        window.__ret = null;
        document.addEventListener("pointerdown", () => {
          const t0 = performance.now();
          const gold = document.querySelector('img[src="/c2b-logo-mark.png"]');
          const tick = () => {
            if (getComputedStyle(gold).animationName === "enquiry-logo-radial-out") { window.__ret = Math.round(performance.now() - t0); return; }
            if (performance.now() - t0 < 6000) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }, { once: true, capture: true });
      });
    const nb = await p.getByRole("button", { name: /next step/i }).first().boundingBox();
    await p.mouse.click(nb.x + nb.width / 2, nb.y + nb.height / 2);
    await p.mouse.move(5, 5);
  }
  await p.waitForTimeout(4000);
  console.log(`run ${run}: the return to gold starts +${await p.evaluate(() => window.__ret)} ms from the Q1 Next step click`);
  await ctx.close();
}
await b.close();
console.log("⚠ NOT WATCHED: production; Carl's GPU/Chrome.");
