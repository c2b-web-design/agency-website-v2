/** "IT ONLY ROLLS ON Q5" (Carl, 14 October 2026) — the probe. `/start` at 1412 × 700: Begin; at Q5 choose a card and read the
 *  host's state (`data-paused`, `data-hold`) with the pointer far away; click Next step (a REAL click, which focuses the
 *  button); at Q4 choose a card, move the pointer far away again, read the state. The suspect: the hold's focus store set by
 *  the click and never cleared — a focused element removed from the DOM fires no blur. ⚠ NOT WATCHED: Q3–Q1 (the same path). */
import { chromium } from "playwright";
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const p = await (await b.newContext({ viewport: { width: 1412, height: 700 } })).newPage();
await p.goto("http://localhost:3000/start", { waitUntil: "load" });
await p.waitForTimeout(9000);
await p.getByRole("button", { name: /begin/i }).click();
await p.locator(".enquiry-answer-grid").waitFor({ state: "visible", timeout: 30000 });
await p.waitForTimeout(4000);
const state = (q) => p.evaluate((q) => { const e = document.querySelector("[data-family-next]"); const a = document.activeElement; return `${q}: paused=${e?.dataset.paused} hold=${e?.dataset.hold} · focus on ${a?.className?.toString().slice(0, 30) || a?.tagName}`; }, q);
await p.getByTestId("answer-card-hover-0").dispatchEvent("pointerdown");
await p.mouse.move(5, 5); await p.waitForTimeout(1200);
console.log(await state("Q5, chosen, pointer away"));
await p.locator(".enquiry-nextstep-btn").click();
await p.waitForTimeout(2600);
await p.getByTestId("answer-card-hover-0").dispatchEvent("pointerdown");
await p.mouse.move(5, 5); await p.waitForTimeout(1200);
console.log(await state("Q4, chosen, pointer away"));
await b.close();
