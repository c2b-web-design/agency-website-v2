/**
 * THE IMAGE SCROLL, WALKED — 3 October 2026 (D-092 built). Plain /about from the top: scroll §1 → §2 in steps of a
 * quarter window, a frame at each; when `neon:ignite` fires against the wipe; what the nav and §1's copy hit-test to
 * (they must still be clickable/selectable over the stage); then a fresh load and `Roles` — the room must land opaque
 * and the sequence strike on arrival.
 * ⚠ NOT WATCHED: phones; reduced motion; Carl's Chrome; whether the wipe READS — his eye.
 *   node --no-warnings project-intelligence/live-work/scripts/image-scroll-walk-3-october.mjs
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
const out = "project-intelligence/live-work/screenshots/image-scroll-3-october";
mkdirSync(out, { recursive: true });
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const ctx = await b.newContext({ viewport: { width: 1412, height: 700 }, deviceScaleFactor: 1.36 });
{ const p = await ctx.newPage(); await p.goto("http://localhost:3000/about", { waitUntil: "networkidle" }); await p.waitForTimeout(1500); await p.close(); }

const p = await ctx.newPage();
const errs = [];
p.on("console", (m) => { if (m.type() === "error") errs.push(m.text().slice(0, 300)); });
p.on("pageerror", (e) => errs.push(e.message.slice(0, 300)));
await p.goto("http://localhost:3000/about", { waitUntil: "networkidle" });
await p.waitForTimeout(2500);
const state = () => p.evaluate(() => {
  const st = document.querySelector("[data-room-stage]");
  const cs = st ? getComputedStyle(st) : null;
  return {
    y: Math.round(scrollY),
    rolesTop: Math.round(document.getElementById("roles").getBoundingClientRect().top),
    solid: cs?.getPropertyValue("--wipe-solid").trim(), clear: cs?.getPropertyValue("--wipe-clear").trim(),
    ignited: performance.getEntriesByName("neon:ignite").length > 0,
  };
});
const hit = await p.evaluate(() => {
  const q = (x, y) => { const e = document.elementFromPoint(x, y); return e ? `${e.tagName.toLowerCase()}${e.textContent ? ` "${e.textContent.trim().slice(0, 24)}"` : ""}` : "none"; };
  const link = [...document.querySelectorAll("a")].find((a) => a.textContent.trim() === "Roles");
  const r = link.getBoundingClientRect();
  const h1 = document.querySelector("h1").getBoundingClientRect();
  return { roles: q(r.left + r.width / 2, r.top + r.height / 2), h1: q(h1.left + 10, h1.top + h1.height / 2) };
});
console.log(`hit-test at the top: Roles link → ${hit.roles} · §1 heading → ${hit.h1}`);
const vh = 700;
for (const f of [0, 0.25, 0.5, 0.6, 0.75, 1]) {
  await p.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), Math.round(f * vh));
  await p.waitForTimeout(600);
  const s = await state();
  console.log(`scroll ${String(f).padEnd(4)} window → y ${s.y} · §2 top ${s.rolesTop} · wipe solid ${s.solid} clear ${s.clear} · ignited ${s.ignited}`);
  await p.screenshot({ path: `${out}/scroll-${String(Math.round(f * 100)).padStart(3, "0")}.png` });
}
await p.close();

const q = await ctx.newPage();
await q.goto("http://localhost:3000/about", { waitUntil: "networkidle" });
await q.waitForTimeout(2500);
await q.getByRole("link", { name: "Roles", exact: true }).first().click();
await q.waitForTimeout(1500);
const s = await q.evaluate(() => {
  const st = getComputedStyle(document.querySelector("[data-room-stage]"));
  return { solid: st.getPropertyValue("--wipe-solid").trim(), ignited: performance.getEntriesByName("neon:ignite").length > 0 };
});
console.log(`Roles: wipe solid ${s.solid} · ignited ${s.ignited}`);
await q.screenshot({ path: `${out}/roles.png` });
await q.close();
console.log(errs.length ? `console errors:\n${errs.join("\n")}` : "no console errors");
await b.close();
