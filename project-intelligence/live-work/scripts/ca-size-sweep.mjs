/**
 * CA's TEXT SIZE vs its PAGES — 25 September 2026. Carl: "There are 2 pages. The second page has some real
 * estate we can use, which means we can make the text bigger and that might help with the spacing problem."
 * For each `?textem=`, the page's own set: lines, slots, how full page 2 is, and the widest justified gap.
 * ⚠ NOT WATCHED: how any of it LOOKS (Carl's eye); cards other than CA.
 */
import { chromium } from "playwright";
const sizes = process.argv.slice(2).map(Number);
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
console.log(" em  | lines | slots | pages | last page | widest gap");
for (const em of sizes) {
  const p = await b.newPage({ viewport: { width: 1412, height: 700 }, deviceScaleFactor: 1.36 });
  let line = "";
  p.on("console", (m) => { if (m.text().startsWith("ca extrude")) line = m.text(); });
  await p.goto(`http://localhost:3000/about?textem=${em}#roles`, { waitUntil: "networkidle" });
  for (let i = 0; i < 40 && !line; i++) await p.waitForTimeout(250);
  const L = +line.match(/(\d+) lines/)[1], S = +line.match(/(\d+) slots/)[1], gap = line.match(/widest gap ([\d.]+)x/)[1];
  const pages = Math.ceil(L / S), last = L - (pages - 1) * S;
  console.log(`${String(em).padStart(4)} | ${String(L).padStart(5)} | ${String(S).padStart(5)} | ${String(pages).padStart(5)} | ${String(last).padStart(2)} of ${String(S).padEnd(4)} | ${gap}x`);
  await p.close();
}
await b.close();
