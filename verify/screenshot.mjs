// Capture a screenshot of a running page.
//
//   node verify/screenshot.mjs <url-path> <output-name> [--width N] [--settle MS]
//
// Requires the dev server to be running (npm run dev).
// Output: project-intelligence/live-work/screenshots/<output-name>.png
//
// This is a MEASUREMENT tool. It reports what rendered. It does not decide
// whether what rendered is correct — see verify/README.md.

import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = path.join(
  process.cwd(),
  "project-intelligence",
  "live-work",
  "screenshots",
);

const BASE = process.env.VERIFY_BASE_URL ?? "http://localhost:3000";

// Settle time matters here: this project animates on entry, and a screenshot
// taken mid-choreography is a different image every run. Default is generous
// enough to clear the completion sequence (CHOREOGRAPHY_CLEAR_MS = 7100).
const DEFAULT_SETTLE_MS = 2000;

function arg(flag, fallback) {
  const i = process.argv.indexOf(flag);
  return i === -1 ? fallback : process.argv[i + 1];
}

const urlPath = process.argv[2];
const name = process.argv[3];

if (!urlPath || !name) {
  console.error(
    "usage: node verify/screenshot.mjs <url-path> <output-name> [--width N] [--settle MS]",
  );
  process.exit(1);
}

const width = Number(arg("--width", 1440));
const settle = Number(arg("--settle", DEFAULT_SETTLE_MS));

await mkdir(OUT_DIR, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width, height: 900 },
  deviceScaleFactor: 1,
});

const errors = [];
page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
page.on("console", (m) => {
  if (m.type() === "error") errors.push(`console: ${m.text()}`);
});

const url = `${BASE}${urlPath}`;
const response = await page.goto(url, { waitUntil: "networkidle" });

if (!response || !response.ok()) {
  console.error(`FAILED: ${url} returned ${response?.status() ?? "no response"}`);
  console.error("Is the dev server running? (npm run dev)");
  await browser.close();
  process.exit(1);
}

await page.waitForTimeout(settle);

const outPath = path.join(OUT_DIR, `${name}.png`);
await page.screenshot({ path: outPath, fullPage: false });

console.log(`captured  ${url}  @${width}px  settle ${settle}ms`);
console.log(`saved     ${path.relative(process.cwd(), outPath)}`);

// Report errors rather than swallowing them — a clean-looking screenshot of a
// page that threw is a misleading piece of evidence.
if (errors.length) {
  console.log(`\n⚠ ${errors.length} page/console error(s):`);
  errors.forEach((e) => console.log(`  ${e}`));
} else {
  console.log("errors    none");
}

await browser.close();
