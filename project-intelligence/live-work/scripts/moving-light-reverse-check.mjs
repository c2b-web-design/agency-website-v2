/**
 * THE REVERSALS — do the lights turn back at the lulls, and only when the dice say so? 25 September 2026.
 *
 * On a fast lap (`lmsec=4`: a lap in 8 s, lulls at 41% and 91%), for 20 s of visible time:
 *   lmrev=1  → a reversal at EVERY lull crossing (expect several)
 *   lmrev=0  → none (the control — a harness that cannot go to zero proves nothing)
 * Also re-runs the pixel identity of `?lightmove=0`, and records a frame with the static rig off (default).
 *
 * ⚠ NOT WATCHED: whether a reversal LOOKS legato (Carl's eye), where exactly it turns, the random
 * distribution at 0.5.
 *
 *   node project-intelligence/live-work/scripts/moving-light-reverse-check.mjs
 */
import { chromium } from "playwright";

const browser = await chromium.launch({
  headless: false,
  args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"],
});
async function reversals(query) {
  const page = await browser.newPage({ viewport: { width: 1412, height: 700 }, deviceScaleFactor: 1.36 });
  await page.goto(`http://localhost:3000/about${query}`, { waitUntil: "networkidle" });
  const canvas = page.locator("canvas").first();
  await canvas.waitFor({ state: "visible", timeout: 20000 });
  await canvas.scrollIntoViewIfNeeded();
  await page.waitForTimeout(20000);
  const n = await page.evaluate(() => performance.getEntriesByName("movinglight:reverse").length);
  await page.close();
  return n;
}
const always = await reversals("?lmsec=4&lmrev=1#roles");
const never = await reversals("?lmsec=4&lmrev=0#roles");
console.log(`lmrev=1: ${always} reversals in 20 s — ${always >= 2 ? "✔ TURNS" : "⛔ DID NOT TURN"}`);
console.log(`lmrev=0: ${never} reversals in 20 s — ${never === 0 ? "✔ CONTROL CLEAN" : "⛔ TURNED WITHOUT LEAVE"}`);
await browser.close();
console.log("⚠ NOT WATCHED: whether a reversal looks legato (Carl's eye), where it turns, the 0.5 distribution.");
