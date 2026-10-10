/** THE HOME PAGE's BOTTOM CTA, LOOKED AT (10 October 2026) — Carl: "Go to the Home page at the bottom. You will see a
 *  boring white CTA button that leads to about labelled "who we are"". The page's foot at 1412 × 700, the button
 *  close up, and its hover. ⚠ NOT WATCHED: Carl's Chrome; other widths. */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
const out = "project-intelligence/live-work/screenshots/home-cta-10-october";
mkdirSync(out, { recursive: true });
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const p = await (await b.newContext({ viewport: { width: 1412, height: 700 } })).newPage();
await p.goto("http://localhost:3000/", { waitUntil: "networkidle" });
await p.waitForTimeout(2500);
await p.evaluate(() => scrollTo(0, document.body.scrollHeight));
await p.waitForTimeout(2000);
await p.screenshot({ path: `${out}/foot.png` });
const link = p.getByRole("link", { name: /who we are/i }).last();
const box = await link.boundingBox();
console.log("button box:", box, "| href:", await link.getAttribute("href"));
const css = await link.evaluate((el) => { const s = getComputedStyle(el); return { bg: s.backgroundColor, color: s.color, radius: s.borderRadius, font: `${s.fontSize} ${s.fontWeight} ${s.fontFamily.split(",")[0]}`, pad: s.padding, cls: el.className }; });
console.log("style:", css);
await p.screenshot({ path: `${out}/button.png`, clip: { x: box.x - 120, y: box.y - 80, width: box.width + 240, height: box.height + 160 } });
await link.hover(); await p.waitForTimeout(600);
await p.screenshot({ path: `${out}/button-hover.png`, clip: { x: box.x - 120, y: box.y - 80, width: box.width + 240, height: box.height + 160 } });
await b.close();
