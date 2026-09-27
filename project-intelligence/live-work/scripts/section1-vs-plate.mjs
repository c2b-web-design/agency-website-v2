/**
 * CARL'S SUSPICION, 27 September 2026: "Look at the 2 text fields in Section 1, i have a sneaking suspicion that the
 * width of them combined is the same width as the image." Measures, per viewport, the §1 grid's two columns (left
 * edge of the first to right edge of the second) against the room plate's box in §2 (`room-plate.tsx`), in CSS px.
 * ⚠ NOT WATCHED: phones (the grid is one column below md).
 *   node --no-warnings project-intelligence/live-work/scripts/section1-vs-plate.mjs
 */
import { chromium } from "playwright";
const b = await chromium.launch();
for (const [w, h] of [[1412, 700], [1440, 900], [1920, 1080], [1920, 950], [1280, 720], [2560, 1080]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.goto("http://localhost:3000/about", { waitUntil: "networkidle" });
  const r = await p.evaluate(() => {
    const grid = document.querySelector("section h1")?.closest(".grid");
    const cols = grid ? [...grid.children].map((c) => c.getBoundingClientRect()) : [];
    const img = document.querySelector("#roles img");
    const box = img?.parentElement?.getBoundingClientRect();
    return {
      textL: cols[0]?.left, textR: cols[cols.length - 1]?.right, colW: cols.map((c) => Math.round(c.width)),
      plateL: box?.left, plateR: box?.right, plateH: box?.height,
    };
  });
  const tw = r.textR - r.textL, pw = r.plateR - r.plateL;
  console.log(`${w}×${h} (${(w / h).toFixed(2)}:1) | text ${r.textL.toFixed(0)}→${r.textR.toFixed(0)} = ${tw.toFixed(0)} px (cols ${r.colW.join(" + ")}) | plate ${r.plateL.toFixed(0)}→${r.plateR.toFixed(0)} = ${pw.toFixed(0)} px (h ${r.plateH.toFixed(0)}) | Δ width ${(tw - pw).toFixed(0)} · Δ left ${(r.textL - r.plateL).toFixed(0)} | bands ${Math.max(0, (w - pw) / 2).toFixed(0)} px each side`);
  await p.close();
}
await b.close();
