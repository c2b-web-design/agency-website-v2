/** FILM 04 — THE CAMERA BENCH's LIFT, PIXEL CHECK (26 October 2026; structural note `structural-note-camera-bench-26-october.md`
 *  v3, §5b). Captures `/proto/your-words`'s canvases at 1920 × 1080, DPR 1 (Carl's density), dev server, badge hidden:
 *    viewport 1 (the line, R-092); viewport 2 at `?cam=0` and at `?t=` 1, 9, 15.75, 20, 23.5, 28 (R-093 — the Architect's list).
 *    node …/film04-lift-compare-26-october.mjs capture <base> <dir>
 *    node …/film04-lift-compare-26-october.mjs compare <base> <beforeDir> <afterDir>
 *  `compare` decodes both PNGs in a page and counts differing pixels per frame (any channel ≠). ✔ IDENTICAL = 0 pixels.
 *  ⚠ NOT WATCHED: motion between the frozen times; another GPU; production. Run `capture` twice on unchanged code first —
 *  if two captures of the same code differ, this instrument cannot tell a lift's change from noise. */
import { chromium } from "playwright";
import { mkdirSync, readFileSync, readdirSync } from "node:fs";

const [MODE, BASE = "http://localhost:3000", A = ".", B = ""] = process.argv.slice(2);
const FRAMES = [
  ["vp1-line", "", 0],
  ["vp2-cam0", "cam=0", 1],
  ...[1, 9, 15.75, 20, 23.5, 28].map((t) => [`vp2-t${String(t).replace(".", "-")}`, `t=${t}`, 1]),
];
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const ctx = await b.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });

if (MODE === "capture") {
  mkdirSync(A, { recursive: true });
  for (const [name, q, idx] of FRAMES) {
    const p = await ctx.newPage();
    await p.goto(`${BASE}/proto/your-words${q ? `?${q}` : ""}`, { waitUntil: "networkidle" });
    await p.addStyleTag({ content: "nextjs-portal{display:none!important}" });
    await p.waitForFunction(() => document.querySelectorAll('[data-your-words="drawn"]').length === 2, null, { timeout: 30000 });
    const c = p.locator("canvas").nth(idx);
    await c.scrollIntoViewIfNeeded();
    await p.waitForTimeout(2000);
    await c.screenshot({ path: `${A}/${name}.png` });
    console.log(`captured ${name}`);
    await p.close();
  }
} else if (MODE === "compare") {
  const p = await ctx.newPage();
  await p.setContent("<html><body></body></html>");
  let worst = 0;
  for (const f of readdirSync(A).filter((n) => n.endsWith(".png"))) {
    const a = "data:image/png;base64," + readFileSync(`${A}/${f}`).toString("base64");
    const bb = "data:image/png;base64," + readFileSync(`${B}/${f}`).toString("base64");
    const r = await p.evaluate(async ([x, y]) => {
      const load = async (src) => { const i = new Image(); i.src = src; await i.decode(); return i; };
      const [i, j] = [await load(x), await load(y)];
      if (i.width !== j.width || i.height !== j.height) return { size: `${i.width}×${i.height} vs ${j.width}×${j.height}` };
      const px = (img) => { const c = document.createElement("canvas"); c.width = img.width; c.height = img.height; const g = c.getContext("2d"); g.drawImage(img, 0, 0); return g.getImageData(0, 0, c.width, c.height).data; };
      const [d, e] = [px(i), px(j)];
      let diff = 0, max = 0;
      for (let k = 0; k < d.length; k += 4) {
        const m = Math.max(Math.abs(d[k] - e[k]), Math.abs(d[k + 1] - e[k + 1]), Math.abs(d[k + 2] - e[k + 2]));
        if (m) { diff++; max = Math.max(max, m); }
      }
      return { diff, max, total: d.length / 4 };
    }, [a, bb]);
    if (r.size) console.log(`✖ ${f}: sizes differ ${r.size}`);
    else console.log(`${r.diff === 0 ? "✔" : "✖"} ${f}: ${r.diff} of ${r.total} pixels differ (largest channel step ${r.max})`);
    worst = Math.max(worst, r.size ? Infinity : r.diff);
  }
  console.log(worst === 0 ? "VERDICT ✔ IDENTICAL — every frame" : "VERDICT ✖ NOT identical");
  console.log("⚠ NOT WATCHED: motion between the frozen times; other GPUs; production.");
}
await b.close();
