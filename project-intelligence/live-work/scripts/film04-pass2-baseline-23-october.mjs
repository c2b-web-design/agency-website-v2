/** FILM 04 PASS 2, STEP 0(a) — THE REGRESSION BASELINE, captured BEFORE any pass-2 code moves (23 October 2026).
 *  The line (`?layout=line`) and the arch (the default, take 8), every clay-family mode, front and oblique, the canvas only,
 *  1920 × 1080, DPR 1, Next's dev badge hidden. Re-run after the build with another OUT and compare (`compare` below).
 *    node …/film04-pass2-baseline-23-october.mjs capture <base> <outDir>
 *    node …/film04-pass2-baseline-23-october.mjs compare <dirA> <dirB>
 *  ⚠ NOT WATCHED: the material mode (it does not exist at baseline); anything but the canvas; Carl's GPU. */
import { chromium } from "playwright";
import { mkdirSync, readdirSync, writeFileSync } from "node:fs";
import sharp from "sharp";
const readPng = async (f) => {
  const { data, info } = await sharp(f).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return { data, width: info.width, height: info.height };
};

const [CMD, A = "http://localhost:3000", B = "."] = process.argv.slice(2);
const LAYOUTS = { line: "layout=line", arch: "" };
const VIEWS = ["front", "oblique"];
const MODES = ["clay", "flat", "mesh", "normals", "zebra"];

if (CMD === "capture") {
  mkdirSync(B, { recursive: true });
  const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
  const p = await (await b.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 })).newPage();
  const errors = [];
  p.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  const stats = {};
  for (const [lname, lq] of Object.entries(LAYOUTS))
    for (const view of VIEWS)
      for (const mode of MODES) {
        await p.goto(`${A}/proto/showcase?${[lq, `view=${view}`, `mode=${mode}`].filter(Boolean).join("&")}`, { waitUntil: "networkidle" });
        await p.waitForFunction(() => window.__showcaseBench?.ready, null, { timeout: 60000 });
        await p.addStyleTag({ content: "nextjs-portal{display:none!important}" });
        await p.waitForTimeout(800);
        const box = await p.locator("canvas").first().boundingBox();
        await p.screenshot({ path: `${B}/${lname}_${view}_${mode}.png`, clip: box });
        if (view === "front" && mode === "clay")
          stats[lname] = await p.evaluate(() => {
            const s = window.__showcaseBench.stats;
            return { triangles: s.triangles, widthPx: s.widthPx, heightPx: s.heightPx, pairs: s.pairs?.map((q) => `${q.pair} ${q.visibleGapPx.toFixed(3)}`) ?? null };
          });
      }
  writeFileSync(`${B}/stats.json`, JSON.stringify(stats, null, 2));
  console.log(JSON.stringify(stats, null, 2));
  console.log(`captured ${readdirSync(B).filter((f) => f.endsWith(".png")).length} frames to ${B}; console errors ${errors.length}`);
  await b.close();
} else if (CMD === "compare") {
  let worst = 0, bad = 0;
  for (const f of readdirSync(A).filter((f) => f.endsWith(".png"))) {
    const x = await readPng(`${A}/${f}`), y = await readPng(`${B}/${f}`);
    if (x.width !== y.width || x.height !== y.height) { console.log(`⛔ ${f}: size ${x.width}×${x.height} vs ${y.width}×${y.height}`); bad++; continue; }
    let diff = 0, max = 0;
    for (let i = 0; i < x.data.length; i++) { const d = Math.abs(x.data[i] - y.data[i]); if (d) diff++; max = Math.max(max, d); }
    worst = Math.max(worst, max);
    if (diff) bad++;
    console.log(`${diff ? "⛔" : "✅"} ${f}: ${diff} channel values differ, max ${max}`);
  }
  console.log(bad ? `⛔ ${bad} frame(s) differ (worst ${worst})` : "✅ every frame pixel-identical");
}
