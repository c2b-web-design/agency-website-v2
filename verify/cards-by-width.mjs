/**
 * Do the WebGL cards exist, and land correctly, at every viewport width?
 *
 * ⚠ THE DEFECT THIS EXISTS TO CATCH: until 7 August 2026 `AnswerCardCanvas`
 * returned `null` below `PROTO_MIN_VIEWPORT_PX` (1280), so narrow visitors got
 * NO ANSWER CARDS — and the five CSS cards had already been removed for chunk 3,
 * so there was no fallback behind them.
 *
 * ⚠ AND THE OLD GUARD'S REASON WAS FALSE. It claimed the grid reflows below
 * 1280. It does not (`verify/grid-by-width.mjs`): 576 x 104 down to 640px, then
 * proportional, 3+2 intact to 375px. What actually broke was `CARD_BOXES` — an
 * absolute-pixel table shadowing a `repeat(6, 1fr)` layout.
 *
 * ⚠ SO THIS CHECKS THE THING THAT MATTERS: that each WebGL hover target lands on
 * the same rectangle the CSS grid would put a card on, at that width. The hover
 * targets share `cardBoxesAt()` with the scene, so if they are right the meshes
 * are placed from the same numbers.
 *
 * ⚠ IT COMPARES AGAINST A LIVE MEASUREMENT, NOT AGAINST A COPY OF THE TABLE. A
 * harness holding its own copy of the value it checks cannot fail when that
 * value moves — this project has recorded that failure three times, most
 * recently in `verify/cross-section.mjs`. The expected boxes are computed from
 * the REAL grid width read from the DOM.
 *
 *   node verify/cards-by-width.mjs
 */
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";
const BASE = process.env.VERIFY_BASE_URL ?? "http://localhost:3000";
mkdirSync("verify/out/cards", { recursive: true });

// The 576px reference proportions, from CARD_BOXES.
const REF_W = 576;
const REF = [
  { x: 0, y: 0, w: 186.66, h: 48 },
  { x: 194.67, y: 0, w: 186.66, h: 48 },
  { x: 389.33, y: 0, w: 186.66, h: 48 },
  { x: 97.33, y: 56, w: 186.66, h: 48 },
  { x: 292, y: 56, w: 186.66, h: 48 },
];

const browser = await chromium.launch({ headless: false, args: ["--enable-gpu","--use-angle=default","--ignore-gpu-blocklist"] });

console.log("\n  width   grid w   cards   worst drift   verdict");
console.log("  ─────────────────────────────────────────────────────────");

let failures = 0;
for (const width of [1440, 1280, 1279, 1024, 834, 768, 640, 540, 430, 390, 375]) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  await page.goto(`${BASE}/start`, { waitUntil: "networkidle" });
  await page.waitForTimeout(900);
  await page.getByRole("button", { name: /begin/i }).click().catch(() => {});
  await page.waitForTimeout(3000);

  const r = await page.evaluate(() => {
    const grid = document.querySelector(".enquiry-answer-grid");
    if (!grid) return null;
    const g = grid.getBoundingClientRect();
    const hits = [...document.querySelectorAll("[data-testid^='answer-card-hover-']")].map((n) => {
      const b = n.getBoundingClientRect();
      return { x: +(b.left - g.left).toFixed(2), y: +(b.top - g.top).toFixed(2), w: +b.width.toFixed(2), h: +b.height.toFixed(2) };
    });
    return { gw: +g.width.toFixed(2), hits };
  });
  if (r) await page.screenshot({ path: `verify/out/cards/cards-${width}.png` }).catch(() => {});
  await page.close();

  if (!r) { console.log(`  ${String(width).padStart(5)}   (grid not reached)`); failures++; continue; }

  const s = r.gw / REF_W;
  const expect = REF.map((b) => ({ x: b.x * s, y: b.y, w: b.w * s, h: b.h }));
  const drift = r.hits.length
    ? Math.max(...r.hits.map((c, i) => {
        const e = expect[i];
        if (!e) return 999;
        return Math.max(Math.abs(c.x - e.x), Math.abs(c.y - e.y), Math.abs(c.w - e.w), Math.abs(c.h - e.h));
      }))
    : null;

  const ok = r.hits.length === 5 && drift !== null && drift < 1;
  if (!ok) failures++;
  console.log(
    `  ${String(width).padStart(5)}   ${String(r.gw).padStart(6)}   ${String(r.hits.length).padStart(5)}   ${
      drift === null ? "     -" : (drift.toFixed(2) + "px").padStart(11)
    }   ${r.hits.length === 0 ? "⚠ NO CARDS" : ok ? "✅ tracks the CSS grid" : "⚠ MISPLACED"}`,
  );
}

await browser.close();
console.log(`\n  ${failures === 0 ? "✅ five cards, correctly placed, at every width." : `⚠ ${failures} width(s) failed.`}`);
console.log("  frames: verify/out/cards/");
console.log("\n  ⚠ Verification is not approval.");
