/** THE GLASS TUBE's CORNERS — card 1 at DPR 4 (15 October 2026; Carl: "look at the corners of the cards. They look jagged,
 *  especially on the left hand sides. its not so bad on the right. It should be smoother where curvature meets a stright
 *  line on the glass tube."). Crops of card 1's four corners (24 × 24 css px each) at Q5, at rest.
 *  Usage: node …/card-corners-15-october.mjs <outDir> [query]   ⚠ NOT WATCHED: cards 2–5; selection; Carl's display. */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
const [OUT, Q = ""] = process.argv.slice(2);
mkdirSync(OUT, { recursive: true });
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const p = await (await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 4 })).newPage();
await p.goto("http://localhost:3000/start" + Q, { waitUntil: "load" });
await p.waitForTimeout(9000);
await p.getByRole("button", { name: /begin/i }).click();
await p.locator(".enquiry-answer-grid").waitFor({ state: "visible", timeout: 30000 });
await p.mouse.move(5, 5);
await p.waitForTimeout(5000);
const c = await p.getByTestId("answer-card-hover-0").boundingBox();
const s = 24;
for (const [n, x, y] of [["TL", c.x - 2, c.y - 2], ["TR", c.x + c.width - s + 2, c.y - 2], ["BL", c.x - 2, c.y + c.height - s + 2], ["BR", c.x + c.width - s + 2, c.y + c.height - s + 2]])
  await p.screenshot({ path: join(OUT, `${n}.png`), clip: { x, y, width: s, height: s } });
await p.screenshot({ path: join(OUT, "card1.png"), clip: { x: c.x - 4, y: c.y - 4, width: c.width + 8, height: c.height + 8 } });
console.log(`card 1 ${c.width.toFixed(1)} × ${c.height.toFixed(1)} css at DPR 4 → ${OUT}`);
await b.close();
