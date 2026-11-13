// THE FLOW MAP, DRAWN (13 November 2026, session 2; D-101): the re-forming's fill distance over the logo's face
// (`logoFlowMap`, read through `hero.flow`), decoded from its half floats and drawn as a ramp (dark = first, bright = last,
// blue = off the ink's reach) into a PNG, row 0 at the BOTTOM (the texture's v = 0 is the logo's min y). READ-ONLY.
import { chromium } from "playwright";
const OUT = process.argv[2];
const b = await chromium.launch({ channel: "chrome", args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-webgpu"] });
const p = await b.newPage({ viewport: { width: 1200, height: 700 }, deviceScaleFactor: 1 });
await p.goto("http://localhost:3000/proto/hero", { waitUntil: "load" });
await p.waitForFunction(() => window.__heroBench?.hero?.flow, null, { timeout: 60000 });
const info = await p.evaluate(() => {
  const f = window.__heroBench.hero.flow;
  const { data, width: W, height: H } = f.tex.image;
  const half = (h) => {
    const s = (h & 0x8000) >> 15, e = (h & 0x7c00) >> 10, m = h & 0x03ff;
    return (s ? -1 : 1) * (e === 0 ? Math.pow(2, -14) * (m / 1024) : e === 31 ? (m ? NaN : Infinity) : Math.pow(2, e - 15) * (1 + m / 1024));
  };
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const ctx = c.getContext("2d");
  const img = ctx.createImageData(W, H);
  let lo = Infinity, hi = -Infinity, nan = 0;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const v = half(data[4 * (W * y + x)]);
    if (!Number.isFinite(v)) nan++;
    lo = Math.min(lo, v); hi = Math.max(hi, v);
    const o = 4 * (W * (H - 1 - y) + x);
    const t = Math.max(0, Math.min(1, v));
    img.data[o] = 255 * t; img.data[o + 1] = 255 * t * t; img.data[o + 2] = v >= 1 ? 255 : 40; img.data[o + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  document.body.innerHTML = "";
  document.body.style.background = "#000";
  c.style.width = W * 2 + "px"; c.style.imageRendering = "pixelated";
  document.body.appendChild(c);
  return { check: f.check, W, H, lo, hi, nan, frame: [f.minX, f.minY, f.sizeX, f.sizeY].map((v) => Math.round(v * 10) / 10), type: f.tex.type, len: data.length };
});
console.log(info);
await p.locator("canvas").screenshot({ path: OUT });
await b.close();
