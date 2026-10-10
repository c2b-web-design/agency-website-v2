/** THE LOOP STOPPED (10 October 2026). Plain /about, Roles, the desk crop: sampled every 1.5 s across more than one
 *  ~12 s loop — it must NOT move. Then ?markloop=1 the same way — it MUST move (the switch still works).
 *  ⚠ NOT WATCHED: Carl's Chrome; §3's drop (off-screen at this scroll); anything outside the desk crop. */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
const out = "project-intelligence/live-work/screenshots/desk-mark-still-10-october";
mkdirSync(out, { recursive: true });
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const ctx = await b.newContext({ viewport: { width: 1412, height: 700 }, deviceScaleFactor: 1.36 });
const shoot = async (p, name) => {
  const c = await p.evaluate(() => { const r = [...document.querySelectorAll("canvas")].sort((a, b) => b.width - a.width)[0].getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width }; });
  const k = c.w / 2560;
  return p.screenshot({ path: `${out}/${name}.png`, clip: { x: c.x + 1900 * k, y: c.y + 800 * k, width: 560 * k, height: 400 * k } });
};
const open = async (q) => {
  const p = await ctx.newPage();
  await p.goto(`http://localhost:3000/about${q}`, { waitUntil: "networkidle" });
  await p.waitForTimeout(2000);
  await p.getByRole("link", { name: "Roles", exact: true }).first().click();
  await p.waitForTimeout(4500);
  return p;
};
for (const [q, tag] of [["", "plain"], ["?markloop=1", "loop"]]) {
  const p = await open(q);
  const frames = [];
  for (let i = 0; i < 10; i++) { frames.push(await shoot(p, `${tag}-${i}`)); await p.waitForTimeout(1500); }
  const changed = frames.slice(1).filter((f) => !f.equals(frames[0])).length;
  console.log(`${tag}: ${changed}/9 frames differ from the first (byte compare of the desk crop over ~15 s)`);
  await p.close();
}
console.log("⚠ NOT WATCHED: Carl's Chrome; §3; anything outside the desk crop. A byte difference can be the room's neon or bloom, not the mark — look at the frames.");
await b.close();
