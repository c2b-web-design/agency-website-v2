/** PROBE — does CSS `zoom` on the enquiry SHELL scale /start proportionately? (15 October 2026, session 2)
 *  Carl: "If the cards are made bigger change everything else proportionately except the logo and header."
 *  Injects `.enquiry-shell-opening, .enquiry-shell-active { zoom: Z }` (no code change), 1920 × 1080, DPR 1.
 *  Walks Q5 → Q1 picking card 1 and pressing Next step; at each question: a screenshot, and the grid's rect
 *  against the card canvas's and the Next step host's.
 *  Usage: node …/start-zoom-probe-15-october.mjs <outDir> <zoom> [query]
 *  Then presses Next step at Q1 and captures the complete state (every canvas: CSS rect and backing size).
 *  ⚠ NOT WATCHED: the opening's choreography; phones; widths ≠ 1920. */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
const [OUT, Z = "1", Q = ""] = process.argv.slice(2);
mkdirSync(OUT, { recursive: true });
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const ctx = await b.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
p.on("console", (m) => { if (m.type() === "error") console.log("[console.error]", m.text().slice(0, 300)); });
await p.goto("http://localhost:3000/start" + Q, { waitUntil: "load" });
if (Z !== "1") await p.addStyleTag({ content: `.enquiry-shell-opening, .enquiry-shell-active { zoom: ${Z}; }` });
await p.waitForTimeout(9000);
await p.getByRole("button", { name: /begin/i }).click();
await p.locator(".enquiry-answer-grid").waitFor({ state: "visible", timeout: 30000 });
await p.mouse.move(5, 5);
await p.waitForTimeout(5000);
const read = () => p.evaluate(() => {
  const r = (el) => { if (!el) return null; const b = el.getBoundingClientRect(); return [b.x, b.y, b.width, b.height].map((v) => +v.toFixed(1)); };
  return {
    grid: r(document.querySelector(".enquiry-pdepth-0 .enquiry-answer-grid")),
    cardCanvas: r(document.querySelector('[data-testid="answer-card-proto"] canvas')),
    nextHost: r(document.querySelector('[data-testid="nextstep-surface-host"]')),
    nextHostOk: document.querySelector('[data-testid="nextstep-surface-host"]')?.getAttribute("data-cb-ok"),
    hover0: r(document.querySelector('[data-testid="answer-card-hover-0"]')),
  };
});
for (const q of [5, 4, 3, 2, 1]) {
  console.log(`Q${q} before pick`, JSON.stringify(await read()));
  await p.getByTestId("answer-card-hover-0").click();
  await p.mouse.move(5, 5);
  await p.waitForTimeout(1800);
  console.log(`Q${q} after pick `, JSON.stringify(await read()));
  await p.screenshot({ path: join(OUT, `z${Z}-q${q}.png`) });
  await p.getByRole("button", { name: /next step|send|continue/i }).first().click();
  await p.mouse.move(5, 5);
  await p.waitForTimeout(4500);
}
await p.waitForTimeout(6000);
console.log("complete", JSON.stringify(await p.evaluate(() => [...document.querySelectorAll("canvas")].map((c) => { const b = c.getBoundingClientRect(); return { tid: c.closest("[data-testid]")?.getAttribute("data-testid") ?? c.parentElement?.parentElement?.className?.toString().slice(0, 40), css: [b.x, b.y, b.width, b.height].map((v) => +v.toFixed(1)), backing: [c.width, c.height] }; }))));
await p.screenshot({ path: join(OUT, `z${Z}-complete.png`) });
console.log("→", OUT);
await b.close();
