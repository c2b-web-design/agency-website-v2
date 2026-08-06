/**
 * What exposure puts the clay study in a readable range?
 *
 * ⚠ WRITTEN BECAUSE THE VALUE WAS GUESSED THREE TIMES AND MISSED THREE TIMES —
 * 2.4 blew out, 0.55 and 0.62 went too dark, 1.35 still too dark. Each guess
 * cost a full render and Carl's time looking at an unreadable sheet. **Measuring
 * it once is cheaper than a fourth guess.**
 *
 * The target is a face whose brightest moment sits near the top of the range
 * without clipping, so the "lighter above / shadowed at the rim / darker below"
 * transitions all have room to show.
 *
 *   node verify/clay-exposure.mjs
 */

import { chromium } from "playwright";
import sharp from "sharp";

const CANDIDATES = [1.35, 2.5, 4, 6, 9, 13];

const browser = await chromium.launch({
  headless: false,
  args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

console.log("exposure   p50    p95    max   verdict");

for (const e of CANDIDATES) {
  await page.goto(`http://localhost:3000/start?clay=1&exposure=${e}`, {
    waitUntil: "networkidle",
  });
  await page.getByRole("button", { name: /begin/i }).click();
  // Land near the top of the arc, where the face is most fully lit — that is the
  // moment that must not clip.
  await page.waitForTimeout(9000 + 22500);

  const card = await page.getByTestId("answer-card-hover-0").boundingBox();
  if (!card) throw new Error("card 0 not found");

  const buf = await page.screenshot({ clip: card });
  const { data } = await sharp(buf).greyscale().raw().toBuffer({ resolveWithObject: true });

  const vals = Array.from(data).sort((a, b) => a - b);
  const at = (q) => vals[Math.floor((vals.length - 1) * q)];
  const p50 = at(0.5);
  const p95 = at(0.95);
  const max = vals[vals.length - 1];
  const clipped = (100 * vals.filter((v) => v >= 250).length) / vals.length;

  const verdict =
    clipped > 2 ? "CLIPPING" : p95 < 90 ? "too dark" : p95 > 235 ? "near clip" : "READABLE";

  console.log(
    `${String(e).padStart(6)}   ${String(p50).padStart(4)}  ${String(p95).padStart(5)}  ` +
      `${String(max).padStart(5)}   ${verdict}  (${clipped.toFixed(1)}% clipped)`,
  );
}

console.log("\nPick the highest exposure that is READABLE and not clipping.");
await browser.close();
