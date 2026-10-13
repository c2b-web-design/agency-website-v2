/** WHICH SHADERS COMPILE ON THE FIRST VISIBLE FRAME, AND WHY DIDN'T THE PRECOMPILE COVER THEM? (13 October 2026.) Every
 *  fragment shader's source is read as it is set (`shaderSource`): its `SHADER_NAME` and the defines that split variants
 *  (tone mapping, output colour space, light and shadow counts, transmission, clipping, …) — logged as BEFORE the scroll
 *  (load + the off-screen precompile) or AFTER it (the first visible frames), from a direct `/about#start` load.
 *  ⚠ NOT WATCHED: GPU-side compile; vertex shaders (names only from the fragment). */
import { chromium } from "playwright";
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
await ctx.addInitScript(() => {
  const S = (window.__v = { list: [], phase: "before" });
  for (const P of [WebGLRenderingContext.prototype, WebGL2RenderingContext.prototype]) {
    const f = P.shaderSource;
    P.shaderSource = function (sh, src) {
      if (/gl_FragColor|pc_fragColor|out highp vec4|layout\(location/.test(src) && /precision/.test(src)) {
        const name = (src.match(/#define SHADER_NAME (\S+)/) || [])[1] || "(unnamed)";
        const pick = (re) => (src.match(re) || [])[1];
        const key = [
          `tone=${/#define TONE_MAPPING/.test(src) ? (pick(/toneMapping\( vec3 color \) \{ return (\w+)/) || "on") : "off"}`,
          `out=${/LinearTransferOETF|sRGBTransferOETF/.test(src) ? (src.match(/linearToOutputTexel\( vec4 value \) \{ return ( \w+)/) || [])[1] || "?" : "?"}`,
          `dir=${pick(/#define NUM_DIR_LIGHTS (\d+)/) ?? "-"}`, `spot=${pick(/#define NUM_SPOT_LIGHTS (\d+)/) ?? "-"}`, `pt=${pick(/#define NUM_POINT_LIGHTS (\d+)/) ?? "-"}`,
          `rect=${pick(/#define NUM_RECT_AREA_LIGHTS (\d+)/) ?? "-"}`, `dirShadow=${pick(/#define NUM_DIR_LIGHT_SHADOWS (\d+)/) ?? "-"}`,
          `clip=${pick(/#define NUM_CLIPPING_PLANES (\d+)/) ?? "-"}`, /USE_TRANSMISSION/.test(src) ? "transmission" : "", /USE_SHADOWMAP/.test(src) ? "shadowmap" : "",
        ].filter(Boolean).join(" ");
        S.list.push([S.phase, name, key, src]);
      }
      return f.call(this, sh, src);
    };
  }
});
const p = await ctx.newPage();
await p.goto("http://localhost:3000/about#start", { waitUntil: "load" });
await p.mouse.move(5, 5);
await p.waitForFunction(() => document.querySelector('#start a[href="/start"]')?.dataset.drawn === "1", null, { timeout: 60000 });
await p.waitForTimeout(2500);
await p.evaluate(() => { window.__v.phase = "after"; window.scrollTo(0, 0); });
await p.waitForTimeout(3000);
const L = await p.evaluate(() => window.__v.list);
await b.close();
// the lines that differ between each AFTER shader and its closest BEFORE shader
const lines = (x) => x.split(String.fromCharCode(10)).map((l) => l.trim()).filter(Boolean);
const B = L.filter(([ph]) => ph === "before").map((e) => e[3]);
const A = L.filter(([ph]) => ph === "after").map((e) => e[3]);
console.log(`fragment shaders before the scroll: ${B.length}; after: ${A.length}`);
A.forEach((a, n) => {
  const la = lines(a);
  let best = null, bestD = Infinity;
  for (const b of B) { const lb = new Set(lines(b)); const sa = new Set(la); const d = la.filter((l) => !lb.has(l)).length + [...lb].filter((l) => !sa.has(l)).length; if (d < bestD) { bestD = d; best = b; } }
  const lb = best ? lines(best) : [];
  const onlyA = la.filter((l) => !lb.includes(l)).slice(0, 6), onlyB = lb.filter((l) => !la.includes(l)).slice(0, 6);
  console.log(`#${n + 1} (${la.length} lines) — ${bestD} lines differ from its closest earlier shader${bestD === 0 ? " (IDENTICAL SOURCE)" : ""}`);
  if (bestD) { console.log("   only in the visible-frame shader: " + onlyA.join(" ¦ ").slice(0, 300)); console.log("   only in the earlier one:          " + onlyB.join(" ¦ ").slice(0, 300)); }
});
