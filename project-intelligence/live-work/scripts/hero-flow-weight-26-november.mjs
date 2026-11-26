// THE FLOWING OPENING: WHICH 2D WEIGHT HAS THE 3D's INK? (26 November 2026; Carl: "when the light comes into play it should
// grow in intensityy, theres a sudden change"). MEASURED: at the hand-over the headline lost ~10% of its solid pixels (the 3D's
// glyphs thinner than the browser's Geist Bold). READ-ONLY. The dev bench at Carl's window, the 2D alone (the canvas hidden),
// the headline at each weight in argv[2..]: its solid (> 150) and edge (30–150) pixels in the headline's band.
import { chromium } from "playwright";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
const weights = process.argv.slice(2).map(Number);
const b = await chromium.launch({ channel: "chrome", args: ["--enable-unsafe-webgpu", "--enable-gpu", "--use-angle=d3d11", "--ignore-gpu-blocklist"] });
const p = await b.newPage({ viewport: { width: 1896, height: 946 }, deviceScaleFactor: 1 });
await p.goto("http://localhost:3000/proto/hero", { waitUntil: "load" });
await p.waitForFunction(() => document.querySelector("[data-hero-bench] canvas"), null, { timeout: 120000 });
await p.addStyleTag({ content: ".lil-gui, nextjs-portal { display: none !important; } [data-hero-bench] canvas { visibility: hidden !important; }" });
await p.evaluate(() => {
  const L = document.getElementById("hero-flow-2d");
  L.style.display = "block";
  for (const el of L.querySelectorAll("*")) { el.getAnimations().forEach((a) => a.finish()); el.style.transition = "none"; el.style.opacity = "1"; }
});
for (const w of weights) {
  await p.evaluate((w) => (document.getElementById("hero-flow-head").style.fontWeight = String(w)), w);
  await p.waitForTimeout(200);
  const f = `${tmpdir()}/hero-weight-${w}.png`;
  await p.screenshot({ path: f });
  const d = execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-i", f, "-f", "rawvideo", "-pix_fmt", "gray", "-"], { maxBuffer: 64 << 20 });
  let solid = 0, edge = 0;
  for (let y = 390; y < 560; y++) for (let x = 100; x < 700; x++) { const v = d[y * 1896 + x]; if (v > 150) solid++; else if (v > 30) edge++; }
  console.log(`weight ${w}: solid ${solid}, edge ${edge}`);
}
await b.close();
