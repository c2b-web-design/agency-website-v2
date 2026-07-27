// Capture a page at the four widths this project checks, and report the
// measured box of a selector at each one.
//
//   node verify/responsive.mjs <url-path> <output-name> [--selector CSS]
//
// Requires the dev server to be running (npm run dev).
//
// The widths are not arbitrary — 1440 / 900 / 600 / 390 are the set every
// responsive claim in this project's evidence has been made against
// (see live-work/current-status.md). Keeping them fixed is what makes a new
// measurement comparable to a recorded one.

import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const WIDTHS = [1440, 900, 600, 390];

const OUT_DIR = path.join(
  process.cwd(),
  "project-intelligence",
  "live-work",
  "screenshots",
);

const BASE = process.env.VERIFY_BASE_URL ?? "http://localhost:3000";
const SETTLE_MS = 2000;

function arg(flag, fallback) {
  const i = process.argv.indexOf(flag);
  return i === -1 ? fallback : process.argv[i + 1];
}

const urlPath = process.argv[2];
const name = process.argv[3];
const selector = arg("--selector", null);

if (!urlPath || !name) {
  console.error(
    "usage: node verify/responsive.mjs <url-path> <output-name> [--selector CSS]",
  );
  process.exit(1);
}

await mkdir(OUT_DIR, { recursive: true });

const browser = await chromium.launch();
const rows = [];

for (const width of WIDTHS) {
  const page = await browser.newPage({
    viewport: { width, height: 900 },
    deviceScaleFactor: 1,
  });

  const response = await page.goto(`${BASE}${urlPath}`, {
    waitUntil: "networkidle",
  });

  if (!response || !response.ok()) {
    console.error(`FAILED at ${width}px: ${response?.status() ?? "no response"}`);
    console.error("Is the dev server running? (npm run dev)");
    await browser.close();
    process.exit(1);
  }

  await page.waitForTimeout(SETTLE_MS);

  const outPath = path.join(OUT_DIR, `${name}-${width}.png`);
  await page.screenshot({ path: outPath });

  let box = null;
  if (selector) {
    const el = await page.$(selector);
    box = el ? await el.boundingBox() : null;
  }

  rows.push({ width, box });
  await page.close();
}

await browser.close();

console.log(`captured ${WIDTHS.length} widths → ${name}-<width>.png\n`);

if (selector) {
  console.log(`measured box of  ${selector}\n`);
  console.log("viewport |    w  ×   h  @  left ,  top");
  console.log("---------+------------------------------");
  for (const { width, box } of rows) {
    if (!box) {
      console.log(`${String(width).padStart(8)} | NOT FOUND`);
      continue;
    }
    const r = (n) => Math.round(n * 10) / 10;
    console.log(
      `${String(width).padStart(8)} | ${String(r(box.width)).padStart(5)} × ${String(
        r(box.height),
      ).padStart(5)} @ ${String(r(box.x)).padStart(5)} , ${String(r(box.y)).padStart(4)}`,
    );
  }
  console.log(
    "\nCompare against the recorded values in live-work/current-status.md.",
  );
} else {
  console.log("No --selector given, so no box was measured — screenshots only.");
}
