/** The A/B switch for Carl (8 October 2026): /about?mark=1 (studio + shadow) vs ?mark=1&marklight=room (before the
 *  lights chunk). Same desk crop and mask as desk-mark-light-sources-8-october.mjs; `?neon=none` for stable frames. */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
const out = "project-intelligence/live-work/screenshots/desk-mark-light-8-october";
mkdirSync(out, { recursive: true });
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const ctx = await b.newContext({ viewport: { width: 1412, height: 700 }, deviceScaleFactor: 1.36 });
for (const [name, q] of [["control", "?neon=none"], ["ab-studio", "?mark=1&neon=none"], ["ab-room", "?mark=1&neon=none&marklight=room"], ["ab-noshadow", "?mark=1&neon=none&markshadow=0"], ["ab-toponly", "?mark=1&neon=none&markstrip=0&markao=0"], ["ab-nocontact", "?mark=1&neon=none&markao=0"]]) {
  const p = await ctx.newPage();
  await p.goto(`http://localhost:3000/about${q}`, { waitUntil: "networkidle" });
  await p.waitForTimeout(2000);
  await p.getByRole("link", { name: "Roles", exact: true }).first().click();
  await p.waitForTimeout(5000);
  const c = await p.evaluate(() => { const r = [...document.querySelectorAll("canvas")].sort((a, b) => b.width - a.width)[0].getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width }; });
  const k = c.w / 2560;
  await p.screenshot({ path: `${out}/${name}.png`, clip: { x: c.x + 1980 * k, y: c.y + 840 * k, width: 360 * k, height: 230 * k } });
  await p.close();
}
await b.close();
