/** THE ROOM AROUND THE ANSWER GRID (15 October 2026, session 2 — before "the cards bigger").
 *  /start at Q5, 1920 × 1080, DPR 1 (Carl's 27" monitor). Reads the rects of the shell, the heading, the active phrase,
 *  the grid, every canvas, and the space left below the lowest thing on screen. Writes one full-viewport screenshot.
 *  Usage: node …/start-layout-room-15-october.mjs <outDir> [query]
 *  ⚠ NOT WATCHED: Q4–Q1 and the complete state (the contact field and Send); phones; any width but 1920. */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
const [OUT, Q = ""] = process.argv.slice(2);
mkdirSync(OUT, { recursive: true });
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const ctx = await b.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto("http://localhost:3000/start" + Q, { waitUntil: "load" });
await p.waitForTimeout(9000);
await p.getByRole("button", { name: /begin/i }).click();
await p.locator(".enquiry-answer-grid").waitFor({ state: "visible", timeout: 30000 });
await p.mouse.move(5, 5);
await p.waitForTimeout(6000);
const rows = await p.evaluate(() => {
  const r = (el) => { if (!el) return null; const b = el.getBoundingClientRect(); return { x: +b.x.toFixed(1), y: +b.y.toFixed(1), w: +b.width.toFixed(1), h: +b.height.toFixed(1), bottom: +b.bottom.toFixed(1) }; };
  const out = {
    shell: r(document.querySelector(".enquiry-shell-active, .enquiry-shell-opening")),
    activePhrase: r(document.querySelector(".enquiry-pdepth-0")),
    activeQuestion: r(document.querySelector(".enquiry-pdepth-0 .enquiry-phrase-question")),
    grid: r(document.querySelector(".enquiry-pdepth-0 .enquiry-answer-grid")),
    extras: r(document.querySelector(".enquiry-pdepth-0 .enquiry-phrase-extras")),
    canvases: [...document.querySelectorAll("canvas")].map((c) => ({ testid: c.closest("[data-testid]")?.getAttribute("data-testid") ?? null, cls: c.parentElement?.className?.toString().slice(0, 60), ...r(c) })),
  };
  const all = [...document.querySelectorAll("body *")].filter((e) => { const s = getComputedStyle(e); return s.visibility !== "hidden" && s.display !== "none" && +s.opacity > 0.01; });
  out.lowestVisibleBottom = Math.max(...all.map((e) => e.getBoundingClientRect().bottom).filter((v) => v < 5000));
  out.viewport = { w: innerWidth, h: innerHeight };
  return out;
});
console.log(JSON.stringify(rows, null, 1));
await p.screenshot({ path: join(OUT, "start-q5-1920x1080-dpr1.png") });
console.log("→", OUT);
await b.close();
