// The hero's bench, step 1 (11 November 2026; note v1.3 "Checks after the build"): backend, console errors, frame time,
// the remembered camera across a reload, the Home BUTTON, Copy. ⚠ NOT WATCHED: the picture's likeness to the reference
// (stills saved for the eye only), Carl's window (this runs at 1909 × 934, DPR 1), a production build's dev hook.
import { chromium } from "playwright";

const OUT = process.argv[2] ?? ".";
const BASE = "http://localhost:3000";
const b = await chromium.launch({ channel: "chrome", args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-webgpu"] });
const ctx = await b.newContext({ viewport: { width: 1909, height: 934 }, deviceScaleFactor: 1, permissions: ["clipboard-read", "clipboard-write"] });
const p = await ctx.newPage();
const errors = [];
p.on("console", (m) => m.type() === "error" && errors.push(m.text().slice(0, 200)));
p.on("pageerror", (e) => errors.push(String(e).slice(0, 200)));

const frames = () =>
  p.evaluate(
    () =>
      new Promise((res) => {
        const t = [];
        let last = performance.now();
        const step = (now) => {
          t.push(now - last);
          last = now;
          if (t.length < 120) requestAnimationFrame(step);
          else res(t.sort((a, b) => a - b));
        };
        requestAnimationFrame(step);
      }),
  );
const pose = () => p.evaluate(() => window.__heroBench.pose());

await p.goto(`${BASE}/proto/hero`, { waitUntil: "load" });
await p.waitForSelector("[data-hero-backend]", { timeout: 60000 });
await p.waitForTimeout(4000);
const backend = await p.getAttribute("[data-hero-bench]", "data-hero-backend");
const err0 = await p.getAttribute("[data-hero-bench]", "data-hero-error");
const t = await frames();
console.log(`backend: ${backend}; error attr: ${err0 ?? "none"}`);
console.log(`frame ms over 120: median ${t[60].toFixed(1)}, p95 ${t[114].toFixed(1)}, max ${t[119].toFixed(1)}`);
await p.screenshot({ path: `${OUT}/hero-bench-step1.png` });
const first = await pose();
console.log("first pose (expect HOME):", JSON.stringify(first));

// zoom by the wheel (OrbitControls dispatches start/end on a wheel), then reload: the camera must stay
await p.mouse.move(1100, 450);
for (let i = 0; i < 4; i++) {
  await p.mouse.wheel(0, -200);
  await p.waitForTimeout(150);
}
await p.waitForTimeout(500);
const zoomed = await pose();
await p.reload({ waitUntil: "load" });
await p.waitForSelector("[data-hero-backend]", { timeout: 60000 });
await p.waitForTimeout(2000);
const after = await pose();
console.log("zoomed:", JSON.stringify(zoomed));
console.log("after reload:", JSON.stringify(after), JSON.stringify(after) === JSON.stringify(zoomed) ? "REMEMBERED" : "⛔ MOVED");

// the Home button (in the Camera folder)
await p.locator(".lil-gui .title", { hasText: "Camera" }).waitFor();
await p.locator(".lil-gui .controller.function", { hasText: /^Home$/ }).locator("button").click();
await p.waitForTimeout(300);
const home = await pose();
console.log("after Home:", JSON.stringify(home), JSON.stringify(home) === JSON.stringify(first) ? "AT HOME" : "⛔ NOT HOME");

// Copy
await p.locator(".lil-gui .controller.function", { hasText: /^Copy$/ }).locator("button").click();
await p.waitForTimeout(300);
const clip = await p.evaluate(() => navigator.clipboard.readText());
console.log("clipboard:", clip.slice(0, 220));
await p.screenshot({ path: `${OUT}/hero-bench-step1-panel.png` });

// the reference, for the eye
const r = await ctx.newPage();
await r.goto(`${BASE}/proto/marching?webgpu=1`, { waitUntil: "load" });
await r.waitForTimeout(5000);
await r.screenshot({ path: `${OUT}/marching-reference-webgpu.png` });
console.log(`console errors: ${errors.length}`, errors);
await b.close();
