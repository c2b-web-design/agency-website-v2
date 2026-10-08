/** §3 — THE DROP ONTO THE BLUE LOGO AND THE WIPE AT THE PLAYER'S BORDER (8 October 2026, session 2). The canvas now runs
 *  one screen past the stage. Checks: (1) the room unchanged — the still take's desk crop against the frame before the
 *  change; (2) hit-testing — elementFromPoint at §3's heading and the player is NOT the canvas; (3) the plate height the
 *  CA trigger now reads (width ÷ aspect) against the plate box; (4) frames of the drop, scrolled so the stage has
 *  stopped with its bottom at y 250 (room above, §3's rectangle below).
 *  ⚠ NOT WATCHED: Carl's Chrome; other window sizes; the neon's timing (only its geometry input); motion (held frames). */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
const out = "project-intelligence/live-work/screenshots/desk-mark-drop-s3-8-october-s2";
mkdirSync(out, { recursive: true });
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const ctx = await b.newContext({ viewport: { width: 1412, height: 700 }, deviceScaleFactor: 1.36 });
const errs = [];
const open = async (q) => {
  const p = await ctx.newPage();
  p.on("pageerror", (e) => errs.push(e.message.slice(0, 200)));
  p.on("console", (m) => { if (m.type() === "error") errs.push(m.text().slice(0, 200)); });
  await p.goto(`http://localhost:3000/about${q}`, { waitUntil: "networkidle" });
  await p.waitForTimeout(2000);
  return p;
};
// (1) the room unchanged: the same crop as desk-mark-fall-left85 stand.png
{
  const p = await open("?markplay=start");
  await p.getByRole("link", { name: "Roles", exact: true }).first().click();
  await p.waitForTimeout(4500);
  const c = await p.evaluate(() => { const r = [...document.querySelectorAll("canvas")].sort((a, b) => b.width - a.width)[0].getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; });
  const k = c.w / 2560;
  await p.screenshot({ path: `${out}/room-stand.png`, clip: { x: c.x + 1750 * k, y: c.y + 780 * k, width: 810 * k, height: 655 * k } });
  await p.screenshot({ path: `${out}/room-viewport.png` });
  const geo = await p.evaluate(() => {
    const cv = [...document.querySelectorAll("canvas")].sort((a, b) => b.width - a.width)[0];
    const r = cv.getBoundingClientRect();
    const plate = cv.closest("[data-room-stage]").querySelector('[style*="aspect-ratio"]').getBoundingClientRect();
    return { canvas: [r.x, r.y, r.width, r.height].map(Math.round), plateBox: [plate.x, plate.y, plate.width, plate.height].map(Math.round), widthOverAspect: +(r.width / (2560 / 1435)).toFixed(2) };
  });
  console.log("geometry", JSON.stringify(geo));
  await p.close();
}
// (2)+(4) scrolled to the stop, room above, §3 below
const scrollTo = async (p) => p.evaluate(() => {
  const host = document.querySelector("[data-room-stage]").parentElement;
  window.scrollBy(0, host.getBoundingClientRect().bottom - 250);
});
{
  const p = await open("");
  await scrollTo(p); await p.waitForTimeout(800);
  const hits = await p.evaluate(() => {
    const at = (el) => { const r = el.getBoundingClientRect(); const e = document.elementFromPoint(r.x + 10, r.y + r.height / 2); return `${el.tagName}#${el.id} → ${e?.tagName}${e?.id ? "#" + e.id : ""}`; };
    return [at(document.querySelector("#examples h2")), at(document.querySelector("#examples-player"))];
  });
  console.log("hit-test", JSON.stringify(hits));
  await p.close();
}
for (const f of process.argv.slice(2)) {
  const p = await open(`?markfall=${f}`);
  await scrollTo(p); await p.waitForTimeout(1200);
  await p.screenshot({ path: `${out}/drop-${f}.png` });
  await p.close();
}
console.log(errs.length ? errs.join("\n") : "no page errors");
await b.close();
