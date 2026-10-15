/** PROBE — can ONE root-level CSS `zoom` reproduce what Carl approved? (D-097, 15 October 2026, session 2)
 *  REFERENCE = Carl's build environment: a 1412 × 700 CSS window at deviceScaleFactor 1.36 (Windows Text size 136%).
 *  CANDIDATE = a 1920 × 952 window at DPR 1 with `html { zoom: 1.36 }` injected (no code change).
 *  Both are 1920 × 952 SCREEN pixels, so the two screenshots should match if the zoom reproduces the approved look.
 *  Per page: a screenshot of each arm, and every canvas's CSS rect + backing size (a canvas zoomed twice shows a CSS
 *  rect ~1.36× too big; a blurred one shows a backing smaller than its screen size).
 *  Usage: node …/site-scale-probe-15-october.mjs <outDir> [zoom=1.36]
 *  ⚠ NOT WATCHED: motion, timing, hover, the scroll journeys on /about beyond the three stops; /start beyond Q5; phones. */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
const [OUT, Z = "1.36"] = process.argv.slice(2);
mkdirSync(OUT, { recursive: true });
const z = Number(Z);
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const ARMS = {
  ref: { viewport: { width: 1412, height: 700 }, deviceScaleFactor: z, inject: null },
  zoom: { viewport: { width: 1920, height: 952 }, deviceScaleFactor: 1, inject: `html { zoom: ${z}; }` },
};
const canvases = (p) => p.evaluate(() => [...document.querySelectorAll("canvas")].map((c) => {
  const r = c.getBoundingClientRect();
  return { tid: c.closest("[data-testid]")?.getAttribute("data-testid") ?? null, screen: [r.x, r.y, r.width, r.height].map((v) => Math.round(v * devicePixelRatio)), backing: [c.width, c.height], vis: getComputedStyle(c).visibility };
}));
async function shoot(arm, name, url, steps) {
  const a = ARMS[arm];
  const ctx = await b.newContext({ viewport: a.viewport, deviceScaleFactor: a.deviceScaleFactor });
  const p = await ctx.newPage();
  const errs = [];
  p.on("console", (m) => { if (m.type() === "error") errs.push(m.text().slice(0, 200)); });
  await p.goto("http://localhost:3000" + url, { waitUntil: "load" });
  if (a.inject) await p.addStyleTag({ content: a.inject });
  await p.waitForTimeout(4000);
  for (const [label, act] of steps) {
    await act(p);
    await p.mouse.move(2, 2);
    await p.waitForTimeout(3500);
    await p.screenshot({ path: join(OUT, `${name}-${label}-${arm}.png`) });
    console.log(`${name} ${label} ${arm}`, JSON.stringify(await canvases(p)));
  }
  if (errs.length) console.log(`  ${name} ${arm} console errors:`, errs.slice(0, 3));
  await ctx.close();
}
const scrollTo = (sel) => async (p) => { await p.evaluate((s) => document.querySelector(s)?.scrollIntoView({ block: "start" }), sel); };
const PAGES = [
  ["home", "/", [["top", async () => {}], ["contact", scrollTo("#contact")]]],
  ["about", "/about", [["top", async () => {}], ["s2", async (p) => { await p.mouse.wheel(0, 900); await p.waitForTimeout(4000); }], ["s4", async (p) => { await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight)); }]]],
  ["start", "/start", [["opening", async (p) => { await p.waitForTimeout(6000); }], ["q5", async (p) => { await p.getByRole("button", { name: /begin/i }).click(); await p.waitForTimeout(5000); }]]],
];
for (const [name, url, steps] of PAGES) for (const arm of ["ref", "zoom"]) await shoot(arm, name, url, steps);
console.log("→", OUT);
await b.close();
