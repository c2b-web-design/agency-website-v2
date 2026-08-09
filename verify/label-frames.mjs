/**
 * FRAME-BY-FRAME: what does the eye actually see during one card's beat?
 *
 *   node verify/label-frames.mjs
 *
 * ⚠ WHY. The label and its card now share IDENTICAL opacity and transform
 * values — measured at 0.0000 divergence across 529 mid-fade samples — and Carl
 * can still see them as separate: *"Its still there. Its not as pronounced as it
 * was but the eye can definately see it. It mustnt read as a glitch."*
 *
 * ⚠ SO THE CAUSE IS NOT THE VALUES, AND MEASURING THEM AGAIN WOULD JUST CONFIRM
 * THE SAME PASS. Something about how the two are RENDERED differs — they are
 * separate compositor layers (WebGL canvas vs DOM text), and identical numbers
 * do not guarantee identical rasterisation, subpixel placement, or blend.
 *
 * This captures real frames through one card's rise so the difference can be
 * SEEN rather than reasoned about.
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
const OUT = "verify/out/label-frames";
mkdirSync(OUT, { recursive: true });
const BASE = "http://localhost:3000";
const browser = await chromium.launch({ headless: false, args: ["--enable-gpu","--use-angle=default","--ignore-gpu-blocklist"] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
await page.goto(`${BASE}/start`, { waitUntil: "networkidle" });
const begin = page.getByRole("button", { name: /begin/i });
await begin.waitFor({ state: "visible", timeout: 25000 });
await page.waitForFunction(() => { const b=[...document.querySelectorAll("button")].find(el=>/begin/i.test(el.textContent??"")); return b && !b.disabled && getComputedStyle(b).pointerEvents!=="none"; }, { timeout: 25000 });
await begin.click();

// Card 1's rung is at 650ms after the ladder starts; the ladder starts ~60ms
// after Begin. Sample across its 2000ms rise.
await page.waitForTimeout(600);
for (const t of [0, 150, 300, 450, 600, 900, 1400]) {
  await page.waitForTimeout(t === 0 ? 0 : 150);
  const b = await page.evaluate(() => {
    const el = document.querySelector("[data-testid='answer-card-hover-0']");
    if (!el) return null;
    const r = el.getBoundingClientRect();
    const sp = el.querySelector("span");
    const cs = sp ? getComputedStyle(sp) : null;
    return { x: r.x - 10, y: r.y - 10, width: r.width + 20, height: r.height + 20, op: cs ? cs.opacity : null, tr: cs ? cs.transform : null };
  });
  if (!b) continue;
  await page.screenshot({ path: `${OUT}/f-${String(t).padStart(4,"0")}.png`, clip: { x: b.x, y: b.y, width: b.width, height: b.height } });
  console.log(`  t+${String(t).padStart(4)}ms  label opacity ${b.op}  ${b.tr}`);
}
await browser.close();
console.log(`\n  ${OUT}/`);
