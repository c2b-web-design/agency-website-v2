/** THE NEXT STEP BUTTON, LOOKED AT (10 October 2026) — Carl: "Go look at the next step button", for the home page's
 *  `Who we are` (a variation on it). /start at 1412 × 700: Begin, the first question's cards, one PRESSED (the hit
 *  boxes over the card canvas act on pointerdown), then the button filmed over ~6 s as the traveller's light moves,
 *  plus close-ups. ⚠ NOT WATCHED: Carl's Chrome; other questions; the Send variant. */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
const out = "project-intelligence/live-work/screenshots/nextstep-10-october";
mkdirSync(out, { recursive: true });
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const p = await (await b.newContext({ viewport: { width: 1412, height: 700 } })).newPage();
await p.goto("http://localhost:3000/start", { waitUntil: "networkidle" });
await p.waitForTimeout(9000);
await p.click(".enquiry-begin-hit");
await p.waitForTimeout(9000);
await p.screenshot({ path: `${out}/question.png` });
// the hit boxes: absolutely placed siblings of the card canvas, wider than tall
const hits = await p.evaluate(() => [...document.querySelectorAll("div")].filter((d) => d.style.position === "absolute" && d.style.cursor === "pointer").map((d) => { const r = d.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; }));
console.log("hit boxes:", hits.length, JSON.stringify(hits.slice(0, 6)));
// ⚠ the filter above found no boxes (10 October); the first card pressed where it sits at 1412 × 700 ("Premium new website")
if (hits[0]) await p.mouse.click(hits[0].x + hits[0].w / 2, hits[0].y + hits[0].h / 2);
else await p.mouse.click(504, 440);
await p.waitForTimeout(2500);
await p.screenshot({ path: `${out}/selected.png` });
const btn = await p.evaluate(() => { const e = document.querySelector(".enquiry-nextstep-btn"); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height, op: getComputedStyle(e.closest("div")).opacity }; });
console.log("button:", btn);
if (btn) for (let i = 0; i < 8; i++) {
  await p.screenshot({ path: `${out}/button-${i}.png`, clip: { x: btn.x - 60, y: btn.y - 40, width: btn.w + 120, height: btn.h + 80 } });
  await p.waitForTimeout(700);
}
await b.close();
