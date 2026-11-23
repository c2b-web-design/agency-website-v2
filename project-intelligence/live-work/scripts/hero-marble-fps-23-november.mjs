// THE MARBLE's FRAME COST, LIVE (23 November 2026; after Carl's screenshots: ours ~8 FPS close up, GPT ~35 FPS beside it).
// The story stepped unfilmed to 77 s (the marble whole), then the bench's own loop run live for 4 s per map and camera;
// frames counted by requestAnimationFrame. Chrome, WebGPU, 1896 × 946. READ-ONLY.
// ⚠ NOT WATCHED: Carl's Chrome and window; GPU time per pass; the shadow pass alone.
import { chromium } from "playwright";
const b = await chromium.launch({ channel: "chrome", headless: false, args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-webgpu"] });
const p = await b.newPage({ viewport: { width: 1896, height: 946 }, deviceScaleFactor: 1 });
await p.goto("http://localhost:3000/proto/hero", { waitUntil: "load" });
await p.waitForFunction(() => window.__heroBench?.hero?.warmed === true, null, { timeout: 300000 });
await p.evaluate(() => {
  const { hero, renderer } = window.__heroBench;
  const loop = renderer._animation?.getAnimationLoop?.() ?? null;
  window.__loop = loop;
  renderer.setAnimationLoop(null);
  hero.replayArrival(); hero.update(0);
  for (let n = 0; n < 77 * 30; n++) { hero.update(1 / 30); hero.compute(renderer); }
  hero.marble.settings.rotate = false;
  hero.marble.settings.story = false;
});
const cams = { home: { position: [0, -49.2, 2566.2], target: [0, 0, 0] }, close: { position: [718, -400, 420], target: [600, -437, -17] } };
for (const [map, coat, on] of [["gpt", 1, true], ["gpt", 1, true], ["gpt", 0, true], ["gpt", 1, false]]) for (const [name, cam] of Object.entries(cams)) {
  const fps = await p.evaluate(async ({ map, cam, coat, on }) => {
    const { hero, renderer, scene, camera } = window.__heroBench;
    hero.marble.settings.map = map; hero.marble.settings.clearcoat = coat; hero.marble.settings.on = on;
    camera.position.set(...cam.position); camera.lookAt(...cam.target); camera.updateProjectionMatrix();
    const draw = () => { hero.update(1 / 60); hero.compute(renderer); renderer.render(scene, camera); };
    for (let i = 0; i < 20; i++) { draw(); await new Promise((r) => requestAnimationFrame(r)); }
    let n = 0; const t0 = performance.now();
    while (performance.now() - t0 < 4000) { draw(); await new Promise((r) => requestAnimationFrame(r)); n++; }
    return (n / ((performance.now() - t0) / 1000)).toFixed(1);
  }, { map, cam, coat, on });
  console.log(`${map.padEnd(4)} coat ${coat} marble ${on ? "on " : "off"} ${name.padEnd(5)} ${fps} fps`);
}
await b.close();
