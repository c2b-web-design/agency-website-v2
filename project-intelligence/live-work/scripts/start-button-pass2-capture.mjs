/** `Start a conversation` — PASS 2, THE MATERIAL: GOLD (D-088, 13 October 2026).
 *  The teal's method (R-045): the colour as paint on the clay's material and lamps, metalness 1, roughness 0.4; no moving
 *  lamp (pass 3). Each ink (#121212, #1E1E24): face-on at 1× and 4×, and 4× at 45° of the roll.
 *  Usage: node …/start-button-pass2-capture.mjs [paint] [rough] [inks, comma-separated]   → live-work/screenshots/gold-button-13-october/pass2/
 *  ⚠ NOT WATCHED: the moving lamp (off); the hold; other viewports; Carl's display. */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const paint = process.argv[2] ?? "ffe39e";
const rough = process.argv[3] ?? "0.4";
const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "screenshots", "gold-button-13-october", "pass2");
mkdirSync(OUT, { recursive: true });
const BASE = `http://localhost:3000/proto/button?member=start&mode=teal&paint=${paint}&metalness=1&paintrough=${rough}&ml=0&roll=1`;
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
for (const ink of (process.argv[4] ?? "121212,1e1e24").split(",")) {
  for (const [q, tag] of [["&rollat=0", "1x_face"], ["&zoom=4&rollat=0", "4x_face"], ["&zoom=4&rollat=45", "4x_rollat45"]]) {
    const p = await ctx.newPage();
    await p.goto(`${BASE}&ink=${ink}${q}`, { waitUntil: "networkidle" });
    await p.evaluate(() => document.querySelectorAll("nextjs-portal").forEach((e) => e.remove()));
    await p.waitForSelector("#start-pill canvas"); await p.waitForTimeout(2500);
    const c = await p.evaluate(() => { const r = document.querySelector("#start-pill canvas").getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; });
    const f = `${paint}_r${rough}_ink${ink}_${tag}.png`;
    await p.screenshot({ path: join(OUT, f), clip: { x: Math.max(0, c.x - 20), y: Math.max(0, c.y - 20), width: c.w + 40, height: c.h + 40 } });
    console.log(f);
    await p.close();
  }
}
await b.close();
