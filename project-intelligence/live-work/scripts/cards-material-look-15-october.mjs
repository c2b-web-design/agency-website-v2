/** THE Q&A CARDS AS THEY ARE — frames for the material discussion (15 October 2026; Carl: "If the button can be improved then
 *  maybe the card material can. go and look at all the info about it, then we will discuss."). /start at Q5, DPR 2: the grid at
 *  rest; card 1 hovered (pointer on it); card 1 selected (the filament), pointer away; and 3× crops of card 1 in each state.
 *  ?traveller=1 is NOT set — the page as shipped (the traveller dark since 14 October).
 *  ⚠ NOT WATCHED: Q4–Q1; reduced motion; Carl's Chrome and display. */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
const OUT = process.argv[2];
mkdirSync(OUT, { recursive: true });
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const p = await (await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 })).newPage();
await p.goto("http://localhost:3000/start" + (process.argv[3] ?? ""), { waitUntil: "load" });
await p.waitForTimeout(9000);
await p.getByRole("button", { name: /begin/i }).click();
await p.locator(".enquiry-answer-grid").waitFor({ state: "visible", timeout: 30000 });
await p.mouse.move(5, 5);
await p.waitForTimeout(5000);
const grid = await p.locator(".enquiry-answer-grid").boundingBox();
const pad = 24;
const gclip = { x: grid.x - pad, y: grid.y - pad, width: grid.width + pad * 2, height: grid.height + pad * 2 };
await p.screenshot({ path: join(OUT, "1-grid-rest.png"), clip: gclip });
const c1 = await p.getByTestId("answer-card-hover-0").boundingBox();
const cclip = { x: c1.x - 12, y: c1.y - 12, width: c1.width + 24, height: c1.height + 24 };
await p.screenshot({ path: join(OUT, "1-card1-rest.png"), clip: cclip });
await p.mouse.move(c1.x + c1.width / 2, c1.y + c1.height / 2, { steps: 6 });
await p.waitForTimeout(1500);
await p.screenshot({ path: join(OUT, "2-card1-hover.png"), clip: cclip });
await p.getByTestId("answer-card-hover-0").dispatchEvent("pointerdown");
await p.mouse.move(5, 5);
await p.waitForTimeout(3500);
await p.screenshot({ path: join(OUT, "3-card1-selected.png"), clip: cclip });
await p.screenshot({ path: join(OUT, "3-grid-selected.png"), clip: gclip });
console.log(`grid ${grid.width.toFixed(0)} × ${grid.height.toFixed(0)} css; card 1 ${c1.width.toFixed(1)} × ${c1.height.toFixed(1)} css → ${OUT}`);
await b.close();
