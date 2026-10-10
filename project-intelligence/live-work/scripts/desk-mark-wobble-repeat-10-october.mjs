/** THE WOBBLE REPEATED EVERY 20 s (10 October 2026), at the REAL settings. Roles, then the desk crop for 30 s, each frame
 *  compared with the first (the mark at rest, lit) — movement must show ONLY in 5–7 s and 25–27 s after the click
 *  (the strike lands within a frame of it). Prints the windows where the crop differs.
 *  ⚠ NOT WATCHED: Carl's Chrome; the canvas waking in a background tab; anything beyond 30 s. */
import { chromium } from "playwright";
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const p = await (await b.newContext({ viewport: { width: 1412, height: 700 }, deviceScaleFactor: 1.36 })).newPage();
await p.goto("http://localhost:3000/about", { waitUntil: "networkidle" });
await p.waitForTimeout(3000);
await p.getByRole("link", { name: "Roles", exact: true }).first().click();
const t0 = Date.now();
await p.waitForTimeout(2500);
const c = await p.evaluate(() => { const r = [...document.querySelectorAll("canvas")].sort((a, b) => b.width - a.width)[0].getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width }; });
const k = c.w / 2560, clip = { x: c.x + 1900 * k, y: c.y + 800 * k, width: 560 * k, height: 400 * k };
const rest = await p.screenshot({ clip });
const moved = [];
while (Date.now() - t0 < 30000) {
  const t = Date.now() - t0;
  const f = await p.screenshot({ clip });
  if (!f.equals(rest)) moved.push((t / 1000).toFixed(1));
}
console.log(`frames that differ from rest, seconds after the click: ${moved.join(" ")}`);
await b.close();
