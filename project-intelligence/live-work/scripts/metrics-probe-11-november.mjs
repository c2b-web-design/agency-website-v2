// Font metrics at the page's size vs enlarged (Chrome rounds them at small sizes?), 11 November 2026
import { chromium } from "playwright";
const b = await chromium.launch({ channel: "chrome", args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-webgpu"] });
const p = await b.newPage({ viewport: { width: 1909, height: 940 } });
await p.goto("http://localhost:3000/proto/hero", { waitUntil: "domcontentloaded" });
await p.waitForSelector("h1", { timeout: 60000 });
console.log(
  JSON.stringify(
    await p.evaluate(async () => {
      await document.fonts.ready;
      const out = {};
      for (const [sel, ch] of [
        ["h1", "t"],
        ["p", "y"],
      ]) {
        const el = [...document.querySelectorAll(sel)].pop();
        const cs = getComputedStyle(el);
        const size = parseFloat(cs.fontSize);
        const ctx = document.createElement("canvas").getContext("2d");
        const m = (k) => {
          ctx.font = `${cs.fontWeight} ${size * k}px ${cs.fontFamily}`;
          const r = ctx.measureText(ch);
          return { fd: r.fontBoundingBoxDescent / k, fa: r.fontBoundingBoxAscent / k, gd: r.actualBoundingBoxDescent / k, ga: r.actualBoundingBoxAscent / k };
        };
        out[sel] = { size, x1: m(1), x4: m(4), x16: m(16) };
      }
      return out;
    }),
  ),
);
await b.close();
