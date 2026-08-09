/**
 * The satin card, as it stands — all five, plus a close crop of card 1.
 *
 *   node verify/satin-look.mjs
 *
 * Frames for Carl's eye. Measurement lives in `crown-disclosure.mjs`; this is
 * just a clean look at the thing, because a ratio is not a judgement.
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
const OUT = "verify/out/satin";
mkdirSync(OUT, { recursive: true });
const BASE = process.env.VERIFY_BASE_URL ?? "http://localhost:3000";
const browser = await chromium.launch({ headless: false, args: ["--enable-gpu","--use-angle=default","--ignore-gpu-blocklist"] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
await page.goto(`${BASE}/start`, { waitUntil: "networkidle" });
const begin = page.getByRole("button", { name: /begin/i });
await begin.waitFor({ state: "visible", timeout: 25000 });
await page.waitForFunction(() => { const b=[...document.querySelectorAll("button")].find(el=>/begin/i.test(el.textContent??"")); return b && !b.disabled && getComputedStyle(b).pointerEvents!=="none"; }, { timeout: 25000 });
await begin.click();
await page.waitForTimeout(9000);
const grid = await page.evaluate(() => {
  const el = document.querySelector(".enquiry-answer-grid");
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { x: r.x - 20, y: r.y - 20, width: r.width + 40, height: r.height + 40 };
});
if (grid) { await page.screenshot({ path: `${OUT}/all-five.png`, clip: grid }); console.log("  all-five.png"); }
const c1 = await page.evaluate(() => {
  const el = document.querySelector("[data-testid='answer-card-hover-0']");
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { x: r.x - 8, y: r.y - 8, width: r.width + 16, height: r.height + 16 };
});
if (c1) { await page.screenshot({ path: `${OUT}/card-1.png`, clip: c1 }); console.log("  card-1.png"); }
await browser.close();
console.log(`\n  ${OUT}/`);
