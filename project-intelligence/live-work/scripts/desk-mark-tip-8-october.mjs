/** THE FALL, STAGE 1 — the tip onto its face (8 October 2026). /about?mark=1, Roles, the desk crop: the tip HELD at
 *  set points (?marktip=), then the LOOP sampled over time (it must move on its own). ⚠ NOT WATCHED: Carl's Chrome. */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
const out = "project-intelligence/live-work/screenshots/desk-mark-tip-8-october";
mkdirSync(out, { recursive: true });
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const ctx = await b.newContext({ viewport: { width: 1412, height: 700 }, deviceScaleFactor: 1.36 });
const shoot = async (p, name) => {
  const c = await p.evaluate(() => { const r = [...document.querySelectorAll("canvas")].sort((a, b) => b.width - a.width)[0].getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width }; });
  const k = c.w / 2560;
  await p.screenshot({ path: `${out}/${name}.png`, clip: { x: c.x + 1900 * k, y: c.y + 800 * k, width: 560 * k, height: 400 * k } });
};
const open = async (q) => {
  const p = await ctx.newPage();
  await p.goto(`http://localhost:3000/about${q}`, { waitUntil: "networkidle" });
  await p.waitForTimeout(2000);
  await p.getByRole("link", { name: "Roles", exact: true }).first().click();
  await p.waitForTimeout(4500);
  return p;
};
for (const t of ["0", "0.5", "0.8", "1"]) { const p = await open(`?mark=1&marktip=${t}`); await shoot(p, `held-${t}`); await p.close(); }
const p = await open("?mark=1");
for (let i = 0; i < 6; i++) { await shoot(p, `loop-${i}`); await p.waitForTimeout(700); }
await b.close();
