// webgpu_lights_projector as threejs.org serves it today (r187), stills over ~6 s (18 November 2026): for looking, not measuring.
// Usage: node project-intelligence/live-work/scripts/threejs-projector-shot-18-november.mjs <outDir>
import { chromium } from "playwright";
const out = process.argv[2];
const b = await chromium.launch({ args: ["--enable-unsafe-webgpu", "--enable-features=Vulkan"] });
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
p.on("console", (m) => { if (m.type() === "error") console.log("console error:", m.text()); });
await p.goto("https://threejs.org/examples/webgpu_lights_projector.html", { waitUntil: "networkidle", timeout: 60000 });
await p.waitForTimeout(4000);
console.log("backend:", await p.evaluate(() => (navigator.gpu ? "navigator.gpu present" : "no WebGPU")));
for (let i = 0; i < 3; i++) {
  await p.screenshot({ path: `${out}/projector-live-${i}.png` });
  await p.waitForTimeout(2000);
}
await b.close();
