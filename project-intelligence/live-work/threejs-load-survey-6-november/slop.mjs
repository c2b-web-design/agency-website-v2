import { chromium } from "file:///C:/Users/Carl%20Buckley/agency-website-v2/node_modules/playwright/index.mjs";
const OUT = process.argv[2];
const b = await chromium.launch({ headless: false, args: ["--enable-gpu","--use-angle=default","--ignore-gpu-blocklist","--enable-unsafe-webgpu"] });
const ctx = await b.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
const p = await ctx.newPage(); const t0 = Date.now();
p.goto("https://mrdoob.github.io/slop-newyork/").catch(() => {});
let last = "";
for (let i = 0; i < 90; i++) {
  await p.waitForTimeout(500);
  const txt = await p.evaluate(() => document.body.innerText.replace(/\s+/g, " ").slice(0, 160)).catch(() => "(busy)");
  if (txt !== last) { console.log(((Date.now() - t0) / 1000).toFixed(1) + "s", txt); last = txt; }
  if ([10, 30, 60, 89].includes(i)) await p.screenshot({ path: `${OUT}/slop-${i}.png`, timeout: 5000 }).catch(() => console.log("shot timeout at", i));
}
const gpu = await p.evaluate(() => { const c = document.createElement("canvas").getContext("webgl2"); const e = c.getExtension("WEBGL_debug_renderer_info"); return c.getParameter(e.UNMASKED_RENDERER_WEBGL); });
console.log("GPU:", gpu);
await b.close();
