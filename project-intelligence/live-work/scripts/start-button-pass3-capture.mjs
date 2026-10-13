/** `Start a conversation` — PASS 3, THE LIGHT (D-088, 13 October 2026).
 *  R-048's gold (#FFE39E, metalness 1, roughness 0.4, words #1E1E24) under the clay's lamps PLUS the teal's moving lamp
 *  exactly as approved (R-045/R-046: kind lamp, intensity 1, lift 120, dip 0.9 at 0.5 over 0.4). The lamp FROZEN along its
 *  path (?mt=) face-on, at 4×, and with the helpers; the path scales with the pill's width (`softboxAt`).
 *  Usage: node …/start-button-pass3-capture.mjs [extra query]   → live-work/screenshots/gold-button-13-october/pass3/
 *  ⚠ NOT WATCHED: the lamp in motion (frozen frames only); the hold; other viewports; Carl's display. */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const extra = process.argv[2] ?? "";
const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "screenshots", "gold-button-13-october", "pass3");
mkdirSync(OUT, { recursive: true });
export const PASS3 = "http://localhost:3000/proto/button?member=start&mode=teal&paint=ffe39e&metalness=1&paintrough=0.4&ink=1e1e24&roll=1&mlkind=lamp&mli=1&mllift=120&mldip=0.9&mldipat=0.5&mldipw=0.4";
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
const tag = extra ? "_" + extra.replace(/[^a-z0-9.=]+/gi, "-").replace(/^-|-$/g, "") : "";
for (const mt of ["0.15", "0.3", "0.5", "0.7", "0.85"]) {
  const p = await ctx.newPage();
  await p.goto(`${PASS3}&rollat=0&zoom=4&mt=${mt}${extra}`, { waitUntil: "networkidle" });
  await p.evaluate(() => document.querySelectorAll("nextjs-portal").forEach((e) => e.remove()));
  await p.waitForSelector("#start-pill canvas"); await p.waitForTimeout(2500);
  const c = await p.evaluate(() => { const r = document.querySelector("#start-pill canvas").getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; });
  const f = `4x_mt${mt}${tag}.png`;
  await p.screenshot({ path: join(OUT, f), clip: { x: Math.max(0, c.x - 20), y: Math.max(0, c.y - 20), width: c.w + 40, height: c.h + 40 } });
  console.log(f);
  await p.close();
}
await b.close();
