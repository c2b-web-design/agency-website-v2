/** §1's TEXT AT THE LEFT EDGE OVER THE STAGE — 3 October 2026. Carl: "This is a problem. What is it?" (§1's text
 *  visible over the black side band and gone where it crosses the room). Viewport like Carl's (~1400 × 660 CSS, DPR
 *  1.36); scroll 0 / 0.3 / 0.6 / Roles-then-up; crop the left edge; hit-test a point in §1's text; read the mask. */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import sharp from "sharp";
const out = "project-intelligence/live-work/screenshots/left-edge-3-october";
mkdirSync(out, { recursive: true });
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const ctx = await b.newContext({ viewport: { width: 1400, height: 660 }, deviceScaleFactor: 1.36 });
{ const p = await ctx.newPage(); await p.goto("http://localhost:3000/about", { waitUntil: "networkidle" }); await p.waitForTimeout(1500); await p.close(); }
const p = await ctx.newPage();
await p.goto("http://localhost:3000/about", { waitUntil: "networkidle" });
await p.waitForTimeout(2500);
const probe = async (tag) => {
  const info = await p.evaluate(() => {
    const plate = document.querySelector("[data-room-stage] img")?.getBoundingClientRect();
    const h1 = document.querySelector("h1").getBoundingClientRect();
    const x = h1.left + 30, y = h1.top + h1.height / 2;
    const e = document.elementFromPoint(x, y);
    const m = document.querySelector("[data-room-stage]")?.lastElementChild;
    return { y: Math.round(scrollY), plateLeft: plate && Math.round(plate.left), h1Left: Math.round(h1.left), h1Top: Math.round(h1.top),
      hit: e ? e.tagName.toLowerCase() + (e.className && typeof e.className === "string" ? "." + e.className.split(" ").slice(0, 3).join(".") : "") : "none",
      mask: m ? getComputedStyle(m).maskImage.slice(0, 80) : "no masked layer" };
  });
  console.log(tag, JSON.stringify(info));
  const png = await p.screenshot();
  await sharp(png).extract({ left: 0, top: 0, width: 460, height: 897 }).toFile(`${out}/${tag}.png`);
};
for (const f of [0, 0.3, 0.6]) { await p.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), Math.round(f * 660)); await p.waitForTimeout(500); await probe(`scroll-${f}`); }
await p.getByRole("link", { name: "Roles", exact: true }).first().click();
await p.waitForTimeout(1500);
await p.evaluate(() => window.scrollTo({ top: 120, behavior: "instant" })); await p.waitForTimeout(600); await probe("roles-then-up");
await b.close();
