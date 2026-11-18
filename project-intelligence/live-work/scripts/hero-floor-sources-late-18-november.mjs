// THE FLOOR's HEAT AFTER THE DRAIN (18 November 2026; D-101): frame-stepped (1/30 s) from the lean, blobs on — sources 2
// (the liquid) and 3 (the solid logo) every 0.5 s from story 15.5 to 28, with the re-forming's landing; stills from HOME
// at story 19.5, 24.0, 25.0, 27.0 into argv[2]. READ-ONLY. NOT WATCHED: live playback, frame cost.
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
const [OUT] = process.argv.slice(2);
mkdirSync(OUT, { recursive: true });
const b = await chromium.launch({ channel: "chrome", args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-webgpu"] });
const p = await b.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
const errors = [];
p.on("pageerror", (e) => errors.push(String(e).slice(0, 200)));
await p.goto("http://localhost:3000/proto/hero", { waitUntil: "load" });
await p.waitForFunction(() => window.__heroBench?.hero?.mould && window.__heroBench.hero.warmed === true, null, { timeout: 120000 });
await p.addStyleTag({ content: ".lil-gui, nextjs-portal { display: none !important; } [data-hero-bench] > div:not(.lil-gui) { display: none !important; }" });
const shots = [19.5, 24.0, 25.0, 27.0];
const rows = [];
await p.evaluate(() => {
  const { hero, renderer, camera } = window.__heroBench;
  renderer.setAnimationLoop(null);
  hero.settings.blobs = true;
  hero.settings.floor = true;
  hero.replayArrival();
  hero.update(0);
  camera.position.set(0, -49.2, 2566.2);
  camera.lookAt(0, 0, 0);
});
for (const at of [...new Set([...Array.from({ length: 26 }, (_, i) => 15.5 + i * 0.5), ...shots])].sort((a, b) => a - b)) {
  const r = await p.evaluate(async (at) => {
    const { hero, renderer, scene, camera } = window.__heroBench;
    while (hero.arrival.t < at - 1e-6) hero.update(1 / 30);
    renderer.render(scene, camera);
    await new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(res)));
    const f = hero.floorInfo;
    return { t: hero.arrival.t, landS: hero.reform ? hero.reform.landS + hero.arrival.durationS : null, s2: [f.strengths[1], f.extents[1], f.liquidStep, f.liquidReachCm], s3: [f.strengths[2], f.extents[2]], visible: f.visible };
  }, at);
  if (shots.includes(at)) await p.screenshot({ path: `${OUT}/home-${at.toFixed(1)}.png` });
  rows.push(`story ${r.t.toFixed(2)}  liquid ${JSON.stringify(r.s2)}  solid ${JSON.stringify(r.s3)}  visible ${r.visible}  (solid lands at story ${r.landS?.toFixed(2)})`);
}
console.log(rows.join("\n"));
console.log(`page errors: ${errors.length}`, errors);
await b.close();
