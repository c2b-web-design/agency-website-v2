/**
 * LOOK AT CD'S TEXT ON THE RUNNING PAGE — 25 September 2026 (third session). Plain `/about#roles`, Carl's
 * viewport and DPR, headed on the real GPU. Prints the extrude/text console lines (lines, slots, pass) and
 * saves frames across one pass of the chase so the pages can be read.
 *   node --no-warnings project-intelligence/live-work/scripts/cd-text-look.mjs [query] [outDir]
 * ⚠ NOT WATCHED: motion (Carl judges it moving); any card but the ones `?text=` shows.
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
const [query = "", out = "project-intelligence/live-work/screenshots/cd-text-25-september"] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const p = await b.newPage({ viewport: { width: 1412, height: 700 }, deviceScaleFactor: 1.36 });
const logs = [];
p.on("console", (m) => { const t = m.text(); if (/extrude|text|⛔/i.test(t)) logs.push(t); });
await p.goto(`http://localhost:3000/about${query}#roles`, { waitUntil: "networkidle" });
const t0 = Date.now();
for (const s of [4, 10, 16, 22, 28, 34]) {
  await p.waitForTimeout(Math.max(0, s * 1000 - (Date.now() - t0)));
  await p.screenshot({ path: `${out}/t${String(s).padStart(2, "0")}s.png` });
}
console.log(logs.join("\n"));
await b.close();
