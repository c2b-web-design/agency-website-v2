/**
 * Does `.enquiry-answer-grid` actually reflow below 1280px?
 *
 * ⚠ `PROTO_MIN_VIEWPORT_PX` (1280) EXISTS ON THE CLAIM THAT IT DOES. Its comment:
 * *"the answer grid's own three-column layout is what the slot coordinates in
 * CARD_BOXES describe, and that layout is only guaranteed above this width.
 * Below it the CSS grid reflows and a card pinned to a hard-coded 186.66 x 48
 * box at (0,0) would land wrong."*
 *
 * ⚠ AND THE SAME COMMENT FLAGS ITSELF FOR REVIEW: *"chunk 5 must revisit it
 * rather than inherit it: five cards cannot simply vanish below 1280px the way
 * one prototype could."* That is now.
 *
 * ⚠ SO MEASURE THE CLAIM BEFORE ACTING ON IT. `.enquiry-answer-grid` carries no
 * media query — six columns, fixed gap, at every width — and it lives inside a
 * `max-w-xl` (576px) shell. If the grid is 576 wide and the card boxes match
 * `CARD_BOXES` all the way down, the guard is protecting against a reflow that
 * does not happen, and five cards are being withheld for nothing.
 *
 * Reports each card's measured box against `CARD_BOXES`, per width.
 *
 *   node verify/grid-by-width.mjs
 */
import { chromium } from "@playwright/test";
const BASE = process.env.VERIFY_BASE_URL ?? "http://localhost:3000";

const EXPECTED = [
  { x: 0, y: 0, w: 186.66, h: 48 },
  { x: 194.67, y: 0, w: 186.66, h: 48 },
  { x: 389.33, y: 0, w: 186.66, h: 48 },
  { x: 97.33, y: 56, w: 186.66, h: 48 },
  { x: 292, y: 56, w: 186.66, h: 48 },
];

const browser = await chromium.launch({ headless: false, args: ["--enable-gpu","--use-angle=default","--ignore-gpu-blocklist"] });

for (const width of [1440, 1280, 1279, 1180, 1024, 900, 768, 640]) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  await page.goto(`${BASE}/start`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  await page.getByRole("button", { name: /begin/i }).click().catch(() => {});
  await page.waitForTimeout(2500);

  const r = await page.evaluate(() => {
    const grid = document.querySelector(".enquiry-answer-grid");
    if (!grid) return null;
    const g = grid.getBoundingClientRect();
    const cards = [...grid.children].map((c) => {
      const b = c.getBoundingClientRect();
      return { x: +(b.left - g.left).toFixed(2), y: +(b.top - g.top).toFixed(2), w: +b.width.toFixed(2), h: +b.height.toFixed(2) };
    });
    return { gw: +g.width.toFixed(2), gh: +g.height.toFixed(2), cards };
  });

  await page.close();

  if (!r) { console.log(`\n  ${width}px — grid not found (corridor not reached)`); continue; }

  // Tolerance: sub-pixel layout rounding is fine; a reflow is not.
  const drift = r.cards.map((c, i) => {
    const e = EXPECTED[i];
    if (!e) return null;
    return Math.max(Math.abs(c.x - e.x), Math.abs(c.y - e.y), Math.abs(c.w - e.w), Math.abs(c.h - e.h));
  }).filter((d) => d !== null);
  const worst = drift.length ? Math.max(...drift) : null;

  console.log(`\n  ── ${width}px ──  grid ${r.gw} x ${r.gh}  (CARD_BOXES assumes 576 x 104)`);
  console.log(`     cards found: ${r.cards.length}   worst drift from CARD_BOXES: ${worst === null ? "?" : worst.toFixed(2) + "px"}`);
  console.log(
    worst === null ? "     ?" :
    worst < 1 ? "     ✅ layout matches CARD_BOXES — no reflow" :
    "     ⚠ REFLOWED — the hard-coded boxes would land wrong here",
  );
}

await browser.close();
console.log("\n  ⚠ Verification is not approval.");
