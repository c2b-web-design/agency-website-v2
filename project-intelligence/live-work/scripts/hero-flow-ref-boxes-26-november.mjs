// THE FLOWING OPENING's 2D, ITS REFERENCE BOXES (26 November 2026): at Carl's reference window (1896 x 946, where the 2D was
// registered on the 3D face), the headline's and subtext's element boxes (visual px, the shifts included) and the root zoom
// — the fixed layout the 2D keeps at every window, scaled with the height (`hero-bench.tsx`, `FLOW_REF`). READ-ONLY.
import { chromium } from "playwright";
const b = await chromium.launch({ channel: "chrome", args: ["--enable-unsafe-webgpu", "--hide-scrollbars"] });
const p = await b.newPage({ viewport: { width: 1896, height: 946 }, deviceScaleFactor: 1 });
await p.goto("http://localhost:3000/proto/hero", { waitUntil: "load" });
// the registration's own conditions (`hero-flow-registration-26-november.mjs`): no scrollbar gutter
await p.addStyleTag({ content: "html{scrollbar-gutter:auto!important}" });
await p.evaluate(() => document.fonts.ready);
await p.waitForTimeout(1500);
console.log(JSON.stringify(await p.evaluate(() => {
  const r = (id) => { const e = document.querySelector(id).getBoundingClientRect(); return [e.left, e.top, e.width, e.height].map((v) => Math.round(v * 100) / 100); };
  const z = parseFloat(getComputedStyle(document.documentElement).zoom) || 1;
  const box = document.querySelector("[data-hero-bench]").getBoundingClientRect();
  return { zoom: z, box: [box.width, box.height], head: r("#hero-flow-head"), sub: r("#hero-flow-2d p"), sub1: r("#hero-flow-sub1") };
})));
await b.close();
