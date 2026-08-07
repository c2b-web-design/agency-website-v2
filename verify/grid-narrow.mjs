/**
 * What does the answer grid ACTUALLY do at phone widths?
 *
 * ⚠ THE QUESTION IS NOT WHETHER IT REFLOWS — `verify/grid-by-width.mjs` showed
 * it holds 576 x 104 down to 640px. The question is what happens BELOW that,
 * where 576px can no longer fit the viewport, and whether the 3+2 arrangement is
 * readable at all when each card is ~186px of a 375px screen.
 *
 * ⚠ THERE IS NO PHONE LAYOUT TO INSPECT. `.enquiry-answer-grid` carries no media
 * query, so the six-column rule is the only rule at every width. This measures
 * what that produces rather than assuming it degrades gracefully.
 *
 * Renders the CSS card markup into the live grid so the layout can be seen —
 * the real cards were removed for chunk 3, so the grid is otherwise empty.
 *
 *   node verify/grid-narrow.mjs
 */
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";
const BASE = process.env.VERIFY_BASE_URL ?? "http://localhost:3000";
mkdirSync("verify/out/narrow", { recursive: true });

const LABELS = ["Brand & identity","A new website","Ecommerce","Something else","Not sure yet"];
const browser = await chromium.launch({ headless: false, args: ["--enable-gpu","--use-angle=default","--ignore-gpu-blocklist"] });

console.log("\n  width   grid w   card w   overflow?   cards per row");
console.log("  ──────────────────────────────────────────────────────");

for (const width of [1279, 1024, 834, 768, 640, 540, 430, 390, 375]) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  await page.goto(`${BASE}/start`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  await page.getByRole("button", { name: /begin/i }).click().catch(() => {});
  await page.waitForTimeout(2200);

  const r = await page.evaluate((labels) => {
    const grid = document.querySelector(".enquiry-answer-grid");
    if (!grid) return null;
    // Inject the CSS cards so the layout is visible; they were removed for
    // chunk 3 and the grid is empty apart from the canvas.
    [...grid.querySelectorAll(".probe-card")].forEach((n) => n.remove());
    labels.forEach((t) => {
      const d = document.createElement("div");
      d.className = "enquiry-card probe-card";
      d.textContent = t;
      grid.appendChild(d);
    });
    const g = grid.getBoundingClientRect();
    const cards = [...grid.querySelectorAll(".probe-card")].map((c) => {
      const b = c.getBoundingClientRect();
      return { x: +(b.left - g.left).toFixed(1), y: +(b.top - g.top).toFixed(1), w: +b.width.toFixed(1) };
    });
    // Group by row (same y) to see the arrangement.
    const rows = {};
    for (const c of cards) { (rows[c.y] ??= []).push(c); }
    return {
      gw: +g.width.toFixed(1),
      cw: cards[0]?.w ?? null,
      overflow: g.width > document.documentElement.clientWidth,
      rows: Object.keys(rows).sort((a,b)=>a-b).map((k) => rows[k].length),
    };
  }, LABELS);

  if (r) {
    console.log(
      `  ${String(width).padStart(5)}   ${String(r.gw).padStart(6)}   ${String(r.cw).padStart(6)}   ${(r.overflow ? "⚠ YES" : "no").padStart(9)}   ${r.rows.join(" + ")}`,
    );
    await page.screenshot({ path: `verify/out/narrow/grid-${width}.png` }).catch(() => {});
  } else {
    console.log(`  ${String(width).padStart(5)}   (grid not reached)`);
  }
  await page.close();
}

await browser.close();
console.log("\n  frames: verify/out/narrow/");
console.log("  ⚠ Verification is not approval.");
