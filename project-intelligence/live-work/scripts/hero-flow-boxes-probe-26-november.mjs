// THE FLOWING OPENING: THE BOXES THE 2D's STAGE AND THE 3D's CANVAS SIT IN (26 November 2026), with the site's scrollbar
// gutter (Carl's browser) and without. READ-ONLY.
import { chromium } from "playwright";
const b = await chromium.launch({ channel: "chrome", args: ["--enable-unsafe-webgpu", "--enable-gpu", "--use-angle=d3d11", "--ignore-gpu-blocklist"] });
for (const gutter of [true, false]) {
  const p = await b.newPage({ viewport: { width: 1896, height: 946 }, deviceScaleFactor: 1 });
  await p.goto("http://localhost:3000/proto/hero", { waitUntil: "load" });
  if (!gutter) await p.addStyleTag({ content: "html{scrollbar-gutter:auto!important}" });
  await p.waitForFunction(() => document.querySelector("[data-hero-bench] canvas"), null, { timeout: 120000 });
  await p.waitForTimeout(1000);
  console.log(gutter ? "gutter   " : "no gutter", JSON.stringify(await p.evaluate(() => {
    const r = (sel) => { const e = document.querySelector(sel); if (!e) return null; const q = e.getBoundingClientRect(); return [q.left, q.top, q.width, q.height].map((v) => Math.round(v * 10) / 10); };
    const { renderer, camera } = window.__heroBench ?? {}; return { aspect: camera?.aspect, rSize: renderer ? [renderer.domElement.width, renderer.domElement.height, renderer.getPixelRatio(), renderer.domElement.style.width] : null, inner: [innerWidth, innerHeight], container: r("[data-hero-bench]"), canvas: r("[data-hero-bench] canvas"), layer: r("#hero-flow-2d"), stage: r("#hero-flow-stage"), s: document.getElementById("hero-flow-stage").style.getPropertyValue("--flow-s") };
  })));
  await p.close();
}
await b.close();
