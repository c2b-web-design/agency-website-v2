/** THE SCROLL TIE (10 October 2026). Plain /about, 1412 × 700.
 *  (1) Roles, then the wheel in 100 px steps through the runway and the drop — a frame per step.
 *  (2) STOP mid-runway: two desk-side crops 1 s apart must be IDENTICAL (the mark stops with the scroll).
 *  (3) BACK UP 200 px mid-runway: the crop must return to the frame of the same scroll on the way down.
 *  (4) On to §3 (landed, latched), then back to §2: the desk must be EMPTY.
 *  (5) A fresh page, the Examples link (a jump): frames over 3 s — the drop from the top right.
 *  (6) A reload mid-runway: the mark at that point at once, not replaying from the desk.
 *  ⚠ NOT WATCHED: Carl's Chrome; trackpad momentum; Page Down; smoothing between steps (screenshots ~300 ms apart). */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
const out = "project-intelligence/live-work/screenshots/desk-mark-scroll-tie-10-october";
mkdirSync(out, { recursive: true });
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const ctx = await b.newContext({ viewport: { width: 1412, height: 700 } });
const right = { x: 880, y: 0, width: 532, height: 700 };
const y = (p) => p.evaluate(() => Math.round(scrollY));
const open = async (q = "") => { const p = await ctx.newPage(); await p.goto(`http://localhost:3000/about${q}`, { waitUntil: "networkidle" }); await p.waitForTimeout(2500); return p; };
// (1)
let p = await open();
await p.getByRole("link", { name: "Roles", exact: true }).first().click();
await p.waitForTimeout(2500);
await p.mouse.move(700, 350);
const rolesY = await y(p);
console.log("roles at", rolesY);
const shotAt = {};
for (let i = 1; i <= 16; i++) {
  await p.mouse.wheel(0, 100); await p.waitForTimeout(450);
  const s = await y(p);
  shotAt[s - rolesY] = await p.screenshot({ path: `${out}/1-down-${String(s - rolesY).padStart(4, "0")}.png` });
}
// (2) + (3): back to mid-runway
await p.evaluate((t) => scrollTo(0, t), rolesY + 400); await p.waitForTimeout(1200);
const a = await p.screenshot({ clip: right }); await p.waitForTimeout(1000); const b2 = await p.screenshot({ clip: right });
console.log("(2) stopped mid-runway, crops 1 s apart identical:", a.equals(b2));
await p.screenshot({ path: `${out}/2-held-400.png` });
await p.mouse.wheel(0, -200); await p.waitForTimeout(1200);
console.log("(3) back up to", (await y(p)) - rolesY);
await p.screenshot({ path: `${out}/3-back-up-200.png` });
// (4)
await p.evaluate(() => document.getElementById("examples").scrollIntoView()); await p.waitForTimeout(2000);
await p.screenshot({ path: `${out}/4-landed.png` });
await p.evaluate((t) => scrollTo(0, t), rolesY); await p.waitForTimeout(1500);
await p.screenshot({ path: `${out}/4-back-to-roles-after-landing.png` });
await p.close();
// (5)
p = await open();
await p.getByRole("link", { name: "Examples", exact: true }).first().click();
const t0 = Date.now();
for (let i = 0; i < 10; i++) { await p.screenshot({ path: `${out}/5-examples-${String(Date.now() - t0).padStart(4, "0")}ms.png` }); await p.waitForTimeout(150); }
await p.close();
// (6)
p = await open();
await p.getByRole("link", { name: "Roles", exact: true }).first().click(); await p.waitForTimeout(1500);
await p.evaluate((t) => scrollTo(0, t), rolesY + 400); await p.waitForTimeout(1500);
await p.reload({ waitUntil: "networkidle" }); await p.waitForTimeout(3000);
console.log("(6) reloaded at", (await y(p)) - rolesY);
await p.screenshot({ path: `${out}/6-reloaded-400.png` });
await b.close();
