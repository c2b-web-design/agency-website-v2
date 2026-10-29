/** THE THIRD-PERSON VIEW — CHECK 11: FIRST PERSON UNCHANGED (the plan `plan-third-person-view-29-october.md` v1.2). Captures the
 *  bench's PICTURE in first person at three playhead moments (grid on, the overlay hidden) from a seeded chain, at 1920 ×
 *  1080, DPR 1, dev server; then compares two captures pixel for pixel.
 *    node …/third-person-baseline-29-october.mjs capture <base> <dir>
 *    node …/third-person-baseline-29-october.mjs compare <beforeDir> <afterDir>
 *  ✔ IDENTICAL = 0 differing pixels (any channel). ⛔ Run `capture` TWICE on unchanged code first: if two captures of the same
 *  code differ, this instrument cannot tell a change from noise.
 *  ⚠ NOT WATCHED: third person (the page harness); motion between the moments; another GPU; DPR 2. */
import { chromium } from "playwright";
import sharp from "sharp";
import { mkdirSync, readdirSync } from "node:fs";

const [MODE, A = "http://localhost:3000", B = "."] = process.argv.slice(2);
const MOMENTS = [1, 3.5, 5.5];
const samples = (secs, a, b) => {
  const n = Math.round(secs * 60);
  return Array.from({ length: n + 1 }, (_, i) => [i / 60, a + ((b - a) * i) / n, 0.05 * (i / n), 1 - 0.2 * (i / n), 4 * (i / n), -2 * (i / n), 30]);
};
const clip = (id, cam, start, order, secs, a, b) => ({ id, cam, start, order, in: 0, out: samples(secs, a, b).at(-1)[0], samples: samples(secs, a, b) });
// Cam 1 0–6 s; Cam 2 2–5 s on top; a covered Cam 1 take cut in at 3 s
const CHAIN = { kind: "c2b-camera-chain", version: 3, tracks: [1, 2], units: null, refined: null, comp: null, migrations: [],
  clips: [clip("A", 1, 0, 0, 6, 0, 0.3), clip("B", 2, 2, 1, 3, -0.2, -0.1), clip("N", 1, 3, 2, 1, 0.1, 0.12)] };

if (MODE === "capture") {
  const OUT = B;
  mkdirSync(OUT, { recursive: true });
  const br = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
  const ctx = await br.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  await ctx.addInitScript(() => (window.__benchNoBuilderTake = true));
  const p = await ctx.newPage();
  await p.goto(`${A}/proto/camera`, { waitUntil: "networkidle" });
  await p.evaluate((c) => {
    localStorage.clear();
    localStorage.setItem("c2b-camera-bench-chain-v3", c);
  }, JSON.stringify(CHAIN));
  await p.reload({ waitUntil: "networkidle" });
  await p.addStyleTag({ content: "nextjs-portal{display:none!important} [data-overlay]{display:none!important}" });
  await p.waitForSelector('[data-camera-bench="drawn"]', { timeout: 60000 });
  await p.waitForTimeout(1500);
  for (const T of MOMENTS) {
    const s = await p.evaluate(() => window.__cameraBench);
    const r = await p.$eval("[data-scrub-track]", (e) => {
      const b = e.getBoundingClientRect();
      return { x: b.left, y: b.top, w: b.width };
    });
    await p.mouse.click(r.x + (T / (Math.max(s.duration, 4) * 1.04)) * r.w, r.y + 10);
    await p.waitForTimeout(1200);
    const at = (await p.evaluate(() => window.__cameraBench)).T;
    await p.locator("[data-drag-surface] canvas").screenshot({ path: `${OUT}/t${String(T).replace(".", "-")}.png` });
    console.log(`captured T ${T} (the playhead at ${at.toFixed(4)} s)`);
  }
  await br.close();
} else if (MODE === "compare") {
  let worst = 0;
  for (const f of readdirSync(A).filter((n) => n.endsWith(".png"))) {
    const [a, b] = await Promise.all([A, B].map((d) => sharp(`${d}/${f}`).ensureAlpha().raw().toBuffer({ resolveWithObject: true })));
    if (a.info.width !== b.info.width || a.info.height !== b.info.height) {
      console.log(`✖ ${f}: sizes differ`);
      worst = Infinity;
      continue;
    }
    let diff = 0;
    for (let i = 0; i < a.data.length; i += 4)
      if (a.data[i] !== b.data[i] || a.data[i + 1] !== b.data[i + 1] || a.data[i + 2] !== b.data[i + 2]) diff++;
    worst = Math.max(worst, diff);
    console.log(`${diff ? "✖" : "✔"} ${f}: ${diff} differing pixels of ${a.info.width * a.info.height}`);
  }
  console.log(`\nVERDICT ${worst ? "✖ DIFFERENT" : "✔ IDENTICAL"}`);
  console.log("⚠ NOT WATCHED: third person; motion between the moments; another GPU; DPR 2.");
  process.exitCode = worst ? 1 : 0;
}
