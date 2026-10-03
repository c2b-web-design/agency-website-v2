/** IDENTITY FRAMES — 3 October 2026, for removing the unused lights. Carl: "As long as you dont change how it looks
 *  now, delete what is not needed." Two repeatable states (text held, rims lit / rims off), saved under
 *  screenshots/identity-3-october/<tag>/; run with tag "before" and "after", then "compare" diffs them.
 *  ⚠ NOT WATCHED: the running sequence (walk it separately); Carl's Chrome. */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import sharp from "sharp";
const tag = process.argv[2] ?? "before";
const dir = "project-intelligence/live-work/screenshots/identity-3-october";
const STATES = { lit: "neon=full&textstatic=1", dark: "neon=off&textstatic=1" };
if (tag === "compare") {
  for (const s of Object.keys(STATES)) {
    const a = await sharp(`${dir}/before/${s}.png`).raw().toBuffer({ resolveWithObject: true });
    const c = await sharp(`${dir}/after/${s}.png`).raw().toBuffer();
    let n = 0, mx = 0;
    for (let i = 0; i < c.length; i++) { const d = Math.abs(a.data[i] - c[i]); if (d > 0) n++; if (d > mx) mx = d; }
    console.log(`${s}: ${n} channel values differ (max ${mx}) of ${c.length}`);
  }
  process.exit(0);
}
mkdirSync(`${dir}/${tag}`, { recursive: true });
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const ctx = await b.newContext({ viewport: { width: 1412, height: 700 }, deviceScaleFactor: 1.36 });
{ const p = await ctx.newPage(); await p.goto("http://localhost:3000/about", { waitUntil: "networkidle" }); await p.waitForTimeout(1500); await p.close(); }
for (const [s, q] of Object.entries(STATES)) {
  const p = await ctx.newPage();
  await p.goto(`http://localhost:3000/about?lighthelpers=0&${q}#roles`, { waitUntil: "networkidle" });
  await p.waitForTimeout(7000);
  const top = await p.evaluate(() => document.querySelector("#roles").getBoundingClientRect().top);
  if (Math.abs(top) > 2) throw new Error(`${s}: landed off #roles (${top})`);
  await p.screenshot({ path: `${dir}/${tag}/${s}.png` });
  await p.close();
}
await b.close();
console.log(`saved ${tag}`);
