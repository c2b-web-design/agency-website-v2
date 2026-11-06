import { chromium } from "file:///C:/Users/Carl%20Buckley/agency-website-v2/node_modules/playwright/index.mjs";
const b = await chromium.launch({ headless: false, args: ["--enable-gpu","--use-angle=default","--ignore-gpu-blocklist","--enable-unsafe-webgpu"] });
for (let run = 1; run <= 2; run++) {
  const ctx = await b.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  const p = await ctx.newPage(); const cdp = await ctx.newCDPSession(p); await cdp.send("Network.enable");
  let bytes = 0; cdp.on("Network.loadingFinished", (e) => (bytes += e.encodedDataLength));
  const t0 = Date.now();
  await p.goto("https://threejs.org/examples/webgpu_compute_particles_rain.html", { waitUntil: "load" });
  const loadAt = Date.now() - t0;
  await p.waitForFunction(() => [...document.querySelectorAll("canvas")].some((c) => c.width > 300), null, { timeout: 30000 });
  const canvasAt = Date.now() - t0;
  // first frame with something drawn: sample the screen until it is not all black
  let drawnAt = null;
  for (let i = 0; i < 80 && drawnAt === null; i++) {
    const buf = await p.screenshot({ clip: { x: 0, y: 200, width: 1920, height: 600 } }).catch(() => null);
    if (buf && buf.length > 60000) drawnAt = Date.now() - t0; else await p.waitForTimeout(100);
  }
  await p.waitForTimeout(1500);
  const fps = await p.evaluate(() => new Promise((r) => { let n = 0; const s = performance.now(); const f = () => { n++; if (performance.now() - s < 3000) requestAnimationFrame(f); else r(n / 3); }; requestAnimationFrame(f); }));
  const gpu = await p.evaluate(async () => !!navigator.gpu && !!(await navigator.gpu.requestAdapter()));
  console.log(`run ${run}: load ${loadAt} ms, canvas ${canvasAt} ms, rain drawn ~${drawnAt} ms, ${(bytes / 1048576).toFixed(2)} MB, ~${fps.toFixed(0)} fps, WebGPU adapter ${gpu}`);
  await ctx.close();
}
await b.close();
