/** `Next step` — PASS 1, THE MESH IN CLAY, on the bench (D-088, 14 October 2026; the platinum blue member, copied from the gold pass-1 capture).
 *  /proto/button?member=next&mode=clay&roll=1&label=1 at 1× and ?zoom=4; the box read from the bench's data attributes
 *  (refused unless measured in Geist and 41 high); face-on frozen (rollat=0) and three frames of the roll.
 *  Usage: node …/nextstep-pass1-capture.mjs   → live-work/screenshots/nextstep-family-14-october/pass1/
 *  ⚠ NOT WATCHED: the hold (page.screenshot() fires stray pointermove events); other viewports; Carl's display. */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "screenshots", "nextstep-family-14-october", "pass1");
mkdirSync(OUT, { recursive: true });
const BASE = "http://localhost:3000/proto/button?member=next&mode=clay&roll=1&label=1";
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });

async function shoot(q, tag, frames) {
  const p = await ctx.newPage();
  await p.goto(BASE + q, { waitUntil: "load" });
  await p.evaluate(() => document.fonts.ready);
  await p.evaluate(() => document.querySelectorAll("nextjs-portal").forEach((e) => e.remove()));
  await p.waitForSelector("#next-pill canvas");
  await p.waitForTimeout(2500);
  const m = await p.evaluate(() => { const e = document.querySelector("#next-pill"); const c = e.querySelector("canvas").getBoundingClientRect(); return { w: e.dataset.boxW, h: e.dataset.boxH, font: e.dataset.font, c: { x: c.x, y: c.y, w: c.width, h: c.height }, canvases: document.querySelectorAll("canvas").length }; });
  if (!/geist/i.test(m.font) || Math.round(Number(m.h)) !== 41) throw new Error(`box not measured in Geist at 41 high: ${JSON.stringify(m)}`);
  console.log(`${tag}: box ${Number(m.w).toFixed(1)} × ${Number(m.h).toFixed(1)} (${m.font.split(",")[0]}); canvas ${m.c.w.toFixed(0)} × ${m.c.h.toFixed(0)}; canvases ${m.canvases}`);
  const clip = { x: Math.max(0, m.c.x - 20), y: Math.max(0, m.c.y - 20), width: m.c.w + 40, height: m.c.h + 40 };
  for (let i = 0; i < frames; i++) {
    await p.screenshot({ path: join(OUT, `${tag}${frames > 1 ? `_${i + 1}` : ""}.png`), clip });
    if (i < frames - 1) await p.waitForTimeout(1200);
  }
  if (tag === "1x_face") await p.screenshot({ path: join(OUT, "bench_page.png") });
  await p.close();
}

await shoot("&rollat=0", "1x_face", 1);
await shoot("&zoom=4&rollat=0", "4x_face", 1);
await shoot("&zoom=4", "4x_roll", 4);
await b.close();
console.log(OUT);
