/** FILM 04 — VIEWPORT 2's CAMERA JOURNEY, STILLS (26 October 2026). `/proto/your-words?t=<s>` freezes the journey at a time;
 *  each still is viewport 2's canvas at 1920 × 1080, DPR 1 (Carl's density), dev server, badge hidden. Also prints the
 *  arch's curve centre and a luminance reading of the canvas (mean, and % of pixels blown ≥ 250) per still.
 *    node …/film04-journey-stills-26-october.mjs <base> <outDir> <take> "<t1,t2,…>" [extra query]
 *  ⚠ NOT WATCHED: motion between the stills (the film is the capture script), and whether it is good (Carl's eye). */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const [BASE = "http://localhost:3000", OUT = ".", TAKE = "take1", TIMES = "0,9,16,21,22.5,25", EXTRA = ""] = process.argv.slice(2);
mkdirSync(OUT, { recursive: true });
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const ctx = await b.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
for (const t of TIMES.split(",").map(Number)) {
  const p = await ctx.newPage();
  await p.goto(`${BASE}/proto/your-words?t=${t}${EXTRA ? `&${EXTRA}` : ""}`, { waitUntil: "networkidle" });
  await p.addStyleTag({ content: "nextjs-portal{display:none!important}" });
  const canvas = p.locator("canvas").nth(1);
  await canvas.scrollIntoViewIfNeeded();
  await p.waitForTimeout(2500);
  const box = await canvas.boundingBox();
  const shot = `${OUT}/${TAKE}_t${String(t).replace(".", "-")}.png`;
  await p.screenshot({ path: shot, clip: box });
  const lum = await p.evaluate(async (src) => {
    const img = new Image();
    img.src = src;
    await img.decode();
    const c = document.createElement("canvas");
    c.width = img.width;
    c.height = img.height;
    const g = c.getContext("2d");
    g.drawImage(img, 0, 0);
    const d = g.getImageData(0, 0, c.width, c.height).data;
    let sum = 0, lit = 0, blown = 0;
    for (let i = 0; i < d.length; i += 4) {
      const y = 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
      if (y > 20) { sum += y; lit++; }
      if (y >= 250) blown++;
    }
    return { litMean: lit ? sum / lit : 0, litPct: (100 * lit) / (d.length / 4), blownPct: (100 * blown) / (d.length / 4) };
  }, "data:image/png;base64," + (await canvas.screenshot()).toString("base64"));
  console.log(`t ${t}s · lit mean ${lum.litMean.toFixed(1)} over ${lum.litPct.toFixed(1)}% · blown ${lum.blownPct.toFixed(2)}% → ${shot}`);
  await p.close();
}
await b.close();
