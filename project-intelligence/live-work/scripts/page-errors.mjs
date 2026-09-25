/**
 * Console errors and warnings on plain /about — 25 September 2026 (third session), after the floor pair's gradient
 * rims (a shader patch and a new vertex attribute on the rim). Loads /about#roles, waits through the ignition,
 * prints every console error/warning and page error, then a frame.
 *   node --no-warnings project-intelligence/live-work/scripts/page-errors.mjs [query] [out.png]
 * ⚠ NOT WATCHED: anything that only fails later than ~12 s, or on another GPU.
 */
import { chromium } from "playwright";
const [query = "", out = "project-intelligence/live-work/screenshots/page-errors.png"] = process.argv.slice(2);
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const p = await b.newPage({ viewport: { width: 1412, height: 700 }, deviceScaleFactor: 1.36 });
const seen = [];
p.on("console", (m) => { if (m.type() === "error" || m.type() === "warning") seen.push(`${m.type()}: ${m.text()}`); });
p.on("pageerror", (e) => seen.push(`pageerror: ${e.message}`));
await p.goto(`http://localhost:3000/about${query}#roles`, { waitUntil: "networkidle" });
await p.waitForTimeout(12000);
await p.screenshot({ path: out });
console.log(seen.length ? seen.join("\n") : "no console errors or warnings");
await b.close();
