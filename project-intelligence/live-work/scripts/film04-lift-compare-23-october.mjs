/** FILM 04 — THE LIFT's REGRESSION (23 October 2026, session 2). The bench's measuring and build code moved into
 *  `components/showcase/lettering-hooks.tsx` (the structural note v2, "One mechanism, not two"). The bench must not move:
 *  captured BEFORE the lift and AFTER, compared pixel-for-pixel, plus the bench's published stats and font check.
 *  Frames: the line and the arch × front and oblique × the five clay-family modes (the pass-2 baseline's 20) AND the
 *  material mode (4) — 24, the canvas only, 1920 × 1080, DPR 1, Next's dev badge hidden.
 *    node …/film04-lift-compare-23-october.mjs capture <base> <outDir>
 *    node …/film04-lift-compare-23-october.mjs compare <dirA> <dirB>
 *  ⚠ NOT WATCHED: the bench's controls and readouts (only the canvas and `__showcaseBench`); the oblique's orbit; Carl's GPU. */
import { chromium } from "playwright";
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import sharp from "sharp";

const [CMD, A = "http://localhost:3000", B = "."] = process.argv.slice(2);
const LAYOUTS = { line: "layout=line", arch: "" };
const VIEWS = ["front", "oblique"];
const MODES = ["clay", "flat", "mesh", "normals", "zebra", "material"];

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
        await p.waitForTimeout(900);
        await p.screenshot({ path: `${B}/${lname}_${view}_${mode}.png`, clip: await p.locator("canvas").first().boundingBox() });
        if (view === "front" && mode === "clay")
          stats[lname] = await p.evaluate(() => {
            const w = window.__showcaseBench;
            const s = w.stats;
            return {
              triangles: s.triangles, widthPx: s.widthPx, heightPx: s.heightPx,
              pairs: s.pairs?.map((q) => `${q.pair} ${q.visibleGapPx.toFixed(3)}`) ?? null,
              arch: s.arch ? { radiusPx: s.arch.radiusPx, legPx: s.arch.legPx, grainDeg: s.arch.grainDeg } : null,
              collisions: s.collisions ? { collisions: s.collisions.collisions, tight: s.collisions.tight, worst: s.collisions.worst?.pair } : null,
              font: { family: w.fontCheck.family, loaded: w.fontCheck.faceLoaded, stops: w.fontCheck.stops, lines: w.fontCheck.lines.map((l) => `${l.words}: worst ${l.proof.worstPx.toFixed(4)} kerned ${l.kernedPairs}/${l.kerns.length}`) },
              // the accessible text: the kern-on spans not aria-hidden, in order
              text: [...document.querySelectorAll("span")].filter((e) => e.getAttribute("aria-hidden") === null && e.style.fontKerning === "normal").map((e) => e.textContent),
            };
          });
      }
  writeFileSync(`${B}/stats.json`, JSON.stringify({ stats, errors }, null, 2));
  console.log(`captured ${readdirSync(B).filter((f) => f.endsWith(".png")).length} frames to ${B}; console errors: ${errors.length}`);
  await b.close();
} else if (CMD === "compare") {
  const read = async (f) => (await sharp(f).ensureAlpha().raw().toBuffer({ resolveWithObject: true }));
  let same = 0, diff = 0;
  for (const f of readdirSync(A).filter((n) => n.endsWith(".png"))) {
    const [x, y] = [await read(`${A}/${f}`), await read(`${B}/${f}`)];
    let n = 0, worst = 0;
    if (x.info.width !== y.info.width || x.info.height !== y.info.height) n = -1;
    else for (let i = 0; i < x.data.length; i++) { const d = Math.abs(x.data[i] - y.data[i]); if (d) { n++; worst = Math.max(worst, d); } }
    if (n === 0) same++; else diff++;
    console.log(`${n === 0 ? "✅" : "⛔"} ${f}${n ? ` — ${n < 0 ? "SIZE DIFFERS" : `${n} values differ, worst ${worst}`}` : ""}`);
  }
  const sa = readFileSync(`${A}/stats.json`, "utf8"), sb = readFileSync(`${B}/stats.json`, "utf8");
  console.log(`${sa === sb ? "✅" : "⛔"} stats.json (stats, font check, accessible text, console errors) ${sa === sb ? "identical" : "DIFFER"}`);
  console.log(`VERDICT: ${same} identical, ${diff} differ — of the bench's 24 canvas frames.  ⚠ NOT WATCHED: the controls and readouts.`);
}
