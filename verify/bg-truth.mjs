/**
 * What does the browser ACTUALLY paint for the page's background gradient?
 *
 * ⚠ THREE ATTEMPTS AT THE GROUND PLANE HAVE LANDED AT +1, -1 AND +1 LEVELS. That
 * is adjusting, not diagnosing -- the exact pattern the run log names as the
 * expensive habit. So stop computing what the gradient SHOULD be and read what
 * the browser DOES.
 *
 * Renders the page with the WebGL canvas hidden, and samples a grid of points.
 * Those values are ground truth: whatever formula reproduces them is correct,
 * and any formula that does not is wrong however well-argued.
 *
 *   node verify/bg-truth.mjs
 */
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";
import sharp from "sharp";
const BASE = process.env.VERIFY_BASE_URL ?? "http://localhost:3000";
mkdirSync("verify/out/ground", { recursive: true });

const browser = await chromium.launch({ headless: false, args: ["--enable-gpu","--use-angle=default","--ignore-gpu-blocklist"] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(`${BASE}/start`, { waitUntil: "networkidle" });
await page.waitForTimeout(800);
// Hide every canvas and all text so only the page background remains.
await page.addStyleTag({ content: `canvas, h1, p, span, button, div[data-testid] { visibility: hidden !important; }` });
await page.waitForTimeout(300);
await page.screenshot({ path: "verify/out/ground/bg-only.png" });
await browser.close();

const img = sharp("verify/out/ground/bg-only.png");
const { width, height } = await img.metadata();
const raw = await img.raw().toBuffer();
const px = (x, y) => { const i = (y * width + x) * 3; return raw[i]; };

console.log(`\n  viewport ${width}x${height}`);
console.log(`  CSS: radial-gradient(ellipse at 50% 40%, #141414 0%, #080808 100%)`);
console.log(`  #141414 = ch 20 at centre; #080808 = ch 8 at the outer stop\n`);

console.log("  Measured RED channel across the page:\n");
console.log("      x=    0    240    480    720    960   1200   1439");
for (const y of [0, 150, 300, 360, 450, 600, 750, 899]) {
  const row = [0, 240, 480, 720, 960, 1200, 1439].map((x) => String(px(x, y)).padStart(5)).join("  ");
  console.log(`  y=${String(y).padStart(4)}  ${row}`);
}

// Solve for the radii that best fit: t = (ch - 20) / (8 - 20)
console.log("\n  Implied t = (20 - ch) / 12 at each sample, and the radius that");
console.log("  would produce it, assuming centre (720, 360):\n");
const cx = 720, cy = 0.4 * height;
for (const [x, y] of [[0, 360], [1439, 360], [720, 0], [720, 899], [0, 0], [0, 899]]) {
  const ch = px(Math.min(x, width - 1), Math.min(y, height - 1));
  const t = (20 - ch) / 12;
  const dx = x - cx, dy = y - cy;
  console.log(
    `    (${String(x).padStart(4)},${String(y).padStart(4)})  ch ${String(ch).padStart(3)}  t ${t.toFixed(3)}  |dx| ${Math.abs(dx).toFixed(0).padStart(4)}  |dy| ${Math.abs(dy).toFixed(0).padStart(4)}`,
  );
}
console.log("\n  ⚠ Verification is not approval.");
