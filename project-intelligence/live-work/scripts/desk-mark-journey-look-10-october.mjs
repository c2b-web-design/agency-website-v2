/** THE WHOLE JOURNEY, LOOKED AT (10 October 2026) — before the scroll mechanism is designed. The journey held at points
 *  (?marktip= for the tip, ?markfall=0..1 for the fall → flips → drop), each shot from TWO places: "roles" (Roles clicked,
 *  §2 at the window's top — where a reader sits) and "examples" (scrolled so §3 is at the window's top — the player).
 *  Each frame's file name carries the held point. ⚠ NOT WATCHED: anything between the held points; Carl's Chrome. */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
const out = "project-intelligence/live-work/screenshots/desk-mark-journey-10-october";
mkdirSync(out, { recursive: true });
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const ctx = await b.newContext({ viewport: { width: 1412, height: 700 } });
const holds = [["tip", "0"], ["tip", "0.5"], ["tip", "1"], ...Array.from({ length: 21 }, (_, i) => ["fall", (i / 20).toFixed(2)])];
const p = await ctx.newPage();
for (const [kind, v] of holds) {
  const q = kind === "tip" ? `marktip=${v}` : `markfall=${v}`;
  await p.goto(`http://localhost:3000/about?${q}`, { waitUntil: "networkidle" });
  await p.waitForTimeout(1500);
  await p.getByRole("link", { name: "Roles", exact: true }).first().click();
  await p.waitForTimeout(2200);
  await p.screenshot({ path: `${out}/roles-${kind}-${v}.png` });
  await p.evaluate(() => document.getElementById("examples").scrollIntoView());
  await p.waitForTimeout(900);
  await p.screenshot({ path: `${out}/examples-${kind}-${v}.png` });
}
console.log(`${holds.length} holds × 2 views written`);
await b.close();
