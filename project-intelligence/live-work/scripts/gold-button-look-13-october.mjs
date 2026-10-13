/** THE TWO BUTTONS, LOOKED AT BEFORE THE GOLD ONE IS BUILT (D-088, 13 October 2026).
 *  Home `#contact` (`Who we are`, teal, rolling) then `/about` `#start` (`Start a conversation`, the white CSS pill).
 *  1440 × 900, DPR 1, real GPU. Each: the section, a close crop, and for the teal one three frames 0.6 s apart (it rolls).
 *  Usage: node …/gold-button-look-13-october.mjs   → live-work/screenshots/gold-button-13-october/
 *  ⚠ NOT WATCHED: other viewports; Carl's display; hover (none designed); page.screenshot() fires stray pointermove events,
 *    so the teal button's hold state is not judged from these frames. */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "screenshots", "gold-button-13-october");
mkdirSync(OUT, { recursive: true });
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });

async function look(url, section, label, tag, frames) {
  const p = await ctx.newPage();
  await p.goto(url, { waitUntil: "networkidle" });
  await p.evaluate(() => document.fonts.ready);
  await p.evaluate((s) => document.querySelector(s).scrollIntoView({ block: "start" }), section);
  await p.evaluate(() => { document.querySelectorAll("nextjs-portal").forEach((e) => e.remove()); const st = document.createElement("style"); st.textContent = "html{scrollbar-width:none} ::-webkit-scrollbar{display:none}"; document.head.appendChild(st); });
  await p.mouse.move(5, 5);
  await p.waitForTimeout(3000);
  const m = await p.evaluate(([s, l]) => {
    const e = [...document.querySelectorAll(`${s} a`)].find((x) => x.textContent.trim().toLowerCase() === l.toLowerCase());
    const r = e.getBoundingClientRect(); const cs = getComputedStyle(e);
    const h2 = document.querySelector(`${s} h2`); const para = document.querySelector(`${s} p`);
    return { x: r.x, y: r.y, w: r.width, h: r.height, font: `${cs.fontSize} ${cs.fontWeight} ${cs.letterSpacing}`, pad: cs.padding,
      h2: h2 && getComputedStyle(h2).fontSize, p: para && getComputedStyle(para).fontSize,
      canvases: document.querySelectorAll("canvas").length };
  }, [section, label]);
  console.log(`${tag}: "${label}" ${m.w.toFixed(1)} × ${m.h.toFixed(1)} at (${m.x.toFixed(0)}, ${m.y.toFixed(0)}); font ${m.font}; padding ${m.pad}; h2 ${m.h2}, p ${m.p}; canvases on page ${m.canvases}`);
  await p.screenshot({ path: join(OUT, `${tag}_section.png`) });
  const clip = { x: Math.max(0, m.x - 60), y: m.y - 40, width: m.w + 120, height: m.h + 80 };
  for (let i = 0; i < frames; i++) {
    await p.screenshot({ path: join(OUT, `${tag}_close${frames > 1 ? `_${i + 1}` : ""}.png`), clip });
    if (i < frames - 1) await p.waitForTimeout(600);
  }
  await p.close();
}

await look("http://localhost:3000/", "#contact", "Who we are", "1_whoweare", 3);
await look("http://localhost:3000/about", "#start", "Start a conversation", "2_startaconversation", 1);
await b.close();
console.log(OUT);
