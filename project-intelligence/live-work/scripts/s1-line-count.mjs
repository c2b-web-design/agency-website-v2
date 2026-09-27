/**
 * §1's TWO TEXTS — LINES AND HEIGHT, 27 September 2026. Carl, on removing text 1's em dashes: "both texts are
 * virtually identical in size. No extra or less lines." Counts each column's paragraph lines (height ÷ line-height)
 * at several desktop widths. ⚠ NOT WATCHED: below md the grid is one column (no pairing to hold).
 *   node --no-warnings project-intelligence/live-work/scripts/s1-line-count.mjs [port=3000]
 */
import { chromium } from "playwright";
const port = process.argv[2] ?? "3000";
const b = await chromium.launch();
for (const [w, h] of [[1412, 700], [1440, 900], [1920, 1080], [1280, 720], [1024, 768], [800, 900]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.goto(`http://localhost:${port}/about`, { waitUntil: "networkidle" });
  const r = await p.evaluate(() => {
    const grid = document.querySelector("section h1")?.closest(".grid");
    return [...(grid?.children ?? [])].map((c) => {
      const para = c.querySelector("p");
      const lh = parseFloat(getComputedStyle(para).lineHeight);
      return { lines: Math.round(para.getBoundingClientRect().height / lh), h: Math.round(c.getBoundingClientRect().height) };
    });
  });
  console.log(`${w}×${h}: text 1 ${r[0].lines} lines (${r[0].h}px) · text 2 ${r[1].lines} lines (${r[1].h}px)${r[0].lines === r[1].lines ? "" : "  ⚠ differ"}`);
  await p.close();
}
await b.close();
