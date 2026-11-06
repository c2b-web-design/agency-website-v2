/** THE BENCH IN TWO MEDIA — IMAGE CHECK (5 November 2026; the renderer note v1.6 §3: "the bench's arch captured before and
 *  after", and the WebGPU medium against the WebGL one). Captures `/proto/camera`'s picture at 1920 × 1080, DPR 1, dev
 *  server, the overlay and the Next badge hidden, at Home (a fresh browser: no saved chain), in first person:
 *    arch       `/proto/camera`            — the arch (R-093's scene)
 *    blank      `/proto/camera?blank=1`    — the hero's block-out
 *    node …/bench-medium-compare-5-november.mjs capture <base> <dir> [webgl|webgpu|fallback]
 *    node …/bench-medium-compare-5-november.mjs compare <dirA> <dirB> [threshold]
 *  `compare` counts pixels differing in any channel (and > threshold, default 0), and the mean colour of each image.
 *  ✔ IDENTICAL = 0 pixels. Run `capture` twice on unchanged code first (the negative control).
 *  ⚠ NOT WATCHED: motion (Home only, no flight); third person and the PiP (the third-person harness); other GPUs;
 *  production. "fallback" is the WebGPU medium on its WebGL 2 backend (`&forcewebgl=1`). */
import { chromium } from "playwright";
import { mkdirSync, readFileSync, readdirSync } from "node:fs";

const [MODE, X = "http://localhost:3000", Y = ".", Z = "webgl"] = process.argv.slice(2);
const VIEWS = [
  ["arch", ""],
  ["blank", "blank=1"],
];

if (MODE === "capture") {
  const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist", "--enable-unsafe-webgpu"] });
  const ctx = await b.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  mkdirSync(Y, { recursive: true });
  const medium = Z === "webgl" ? [] : Z === "fallback" ? ["medium=webgpu", "forcewebgl=1"] : ["medium=webgpu"];
  for (const [name, q] of VIEWS) {
    const p = await ctx.newPage();
    const errors = [];
    p.on("pageerror", (e) => errors.push(String(e)));
    p.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    const qs = [q, ...medium].filter(Boolean).join("&");
    await p.goto(`${X}/proto/camera${qs ? `?${qs}` : ""}`, { waitUntil: "networkidle" });
    await p.addStyleTag({ content: "nextjs-portal{display:none!important} [data-overlay]{display:none!important}" });
    await p.waitForFunction(() => document.querySelector("[data-camera-bench]")?.getAttribute("data-camera-bench") !== "pending", null, { timeout: 60000 });
    const state = await p.getAttribute("[data-camera-bench]", "data-camera-bench");
    const backend = await p.getAttribute("[data-camera-bench]", "data-medium-backend");
    await p.waitForTimeout(2000);
    await p.locator("[data-drag-surface]").screenshot({ path: `${Y}/${name}.png` });
    console.log(`captured ${name} (${Z}): bench ${state}, backend ${backend ?? "—"}, ${errors.length} page errors${errors.length ? ": " + errors.slice(0, 3).join(" | ") : ""}`);
    await p.close();
  }
  await b.close();
} else if (MODE === "compare") {
  const [A, B, T = "0"] = [X, Y, Z === "webgl" ? "0" : Z];
  const b = await chromium.launch();
  const p = await b.newPage();
  await p.setContent("<html><body></body></html>");
  let worst = 0;
  for (const f of readdirSync(A).filter((n) => n.endsWith(".png"))) {
    const a = "data:image/png;base64," + readFileSync(`${A}/${f}`).toString("base64");
    const bb = "data:image/png;base64," + readFileSync(`${B}/${f}`).toString("base64");
    const r = await p.evaluate(async ([x, y, t]) => {
      const load = async (src) => { const i = new Image(); i.src = src; await i.decode(); return i; };
      const [i, j] = [await load(x), await load(y)];
      if (i.width !== j.width || i.height !== j.height) return { size: `${i.width}×${i.height} vs ${j.width}×${j.height}` };
      const px = (img) => { const c = document.createElement("canvas"); c.width = img.width; c.height = img.height; const g = c.getContext("2d"); g.drawImage(img, 0, 0); return g.getImageData(0, 0, c.width, c.height).data; };
      const [d, e] = [px(i), px(j)];
      let diff = 0, over = 0, max = 0;
      const ma = [0, 0, 0], mb = [0, 0, 0];
      for (let k = 0; k < d.length; k += 4) {
        for (let c = 0; c < 3; c++) { ma[c] += d[k + c]; mb[c] += e[k + c]; }
        const m = Math.max(Math.abs(d[k] - e[k]), Math.abs(d[k + 1] - e[k + 1]), Math.abs(d[k + 2] - e[k + 2]));
        if (m) { diff++; max = Math.max(max, m); }
        if (m > t) over++;
      }
      const n = d.length / 4;
      return { diff, over, max, total: n, ma: ma.map((v) => (v / n).toFixed(1)), mb: mb.map((v) => (v / n).toFixed(1)) };
    }, [a, bb, Number(T)]);
    if (r.size) console.log(`✖ ${f}: sizes differ ${r.size}`);
    else console.log(`${r.diff === 0 ? "✔" : "✖"} ${f}: ${r.diff} of ${r.total} pixels differ (largest step ${r.max}; ${r.over} > ${T}, ${((100 * r.over) / r.total).toFixed(2)} %); mean A ${r.ma.join("/")} B ${r.mb.join("/")}`);
    worst = Math.max(worst, r.size ? Infinity : r.diff);
  }
  console.log(worst === 0 ? "VERDICT ✔ IDENTICAL — every frame" : "VERDICT ✖ NOT identical (read the counts above)");
  console.log("⚠ NOT WATCHED: motion; third person and the PiP; other GPUs; production.");
  await b.close();
}
