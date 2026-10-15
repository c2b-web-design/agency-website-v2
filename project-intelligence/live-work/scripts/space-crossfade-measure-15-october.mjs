/** THE SPACE CROSS-FADE, MEASURED (15 October 2026, session 3). The planet (corridor) → the galactic centre (client info)
 *  at `stage === "complete"`, over the crawl's own fade (`--enquiry-crawl-fade`). Walks Q5 → Q1 by real clicks, then from
 *  the Q1 Next step click samples, every 100 ms for 5 s: both `.enquiry-space-layer`s' COMPUTED opacity, and the crawl's
 *  (`.enquiry-phrase-complete`, the first) — so the images can be seen to ride the crawl's fade, not merely to end right.
 *  Also: the served CSS's value of `--enquiry-crawl-fade` (the dev server has served stale CSS today).
 *  Usage: node …/space-crossfade-measure-15-october.mjs
 *  ⚠ NOT WATCHED: Carl's GPU/Chrome; reduced motion; the cold load (separate). */
import { chromium } from "playwright";
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const ctx = await b.newContext({ viewport: { width: 1920, height: 952 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto("http://localhost:3000/start", { waitUntil: "load" });
await p.waitForTimeout(9000);
console.log("served --enquiry-crawl-fade:", await p.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--enquiry-crawl-fade")));
console.log("layers at the opening:", await p.evaluate(() => [...document.querySelectorAll(".enquiry-space-layer")].map((e) => getComputedStyle(e).opacity + " / " + getComputedStyle(e).transitionDuration).join(" | ")));
await p.getByRole("button", { name: /begin/i }).click();
for (const q of [5, 4, 3, 2, 1]) {
  await p.locator(".enquiry-answer-grid").first().waitFor({ state: "visible", timeout: 30000 });
  await p.waitForTimeout(3000);
  const bx = await p.getByTestId("answer-card-hover-0").boundingBox();
  await p.mouse.click(bx.x + bx.width / 2, bx.y + bx.height / 2);
  await p.mouse.move(5, 5);
  await p.waitForTimeout(2000);
  const nb = await p.getByRole("button", { name: /next step/i }).first().boundingBox();
  const t0 = Date.now();
  await p.mouse.click(nb.x + nb.width / 2, nb.y + nb.height / 2);
  await p.mouse.move(5, 5);
  if (q === 1) {
    const rows = [];
    while (Date.now() - t0 < 5000) {
      const o = await p.evaluate(() => ({
        layers: [...document.querySelectorAll(".enquiry-space-layer")].map((e) => +getComputedStyle(e).opacity),
        crawl: (() => { const c = document.querySelector(".enquiry-phrase-complete"); return c ? +getComputedStyle(c).opacity : null; })(),
      }));
      rows.push({ t: Date.now() - t0, ...o });
      await p.waitForTimeout(100);
    }
    for (const r of rows.filter((_, i) => i % 3 === 0)) console.log(`+${String(r.t).padStart(4)} ms  planet ${r.layers[0]?.toFixed(2)}  galactic ${r.layers[1]?.toFixed(2)}  crawl ${r.crawl === null ? "—" : r.crawl.toFixed(2)}`);
  }
}
await b.close();
