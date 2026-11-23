// DOES THE LOGO STILL CAST ITS SHADOW ON THE MARBLE? (23 November 2026; the marble's lights moved to a hidden layer, the
// floor's alone). The story stepped to 77 s, the light held at a set place; frames from above with the logo's castShadow ON
// and OFF; the pixels compared (changed pixels, and the floor darker where the shadow falls). READ-ONLY.
// ⚠ NOT WATCHED: other light positions; the shadow's softness.
import { chromium } from "playwright";
const OUT = process.argv[2];
const b = await chromium.launch({ channel: "chrome", args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-webgpu"] });
const p = await b.newPage({ viewport: { width: 1200, height: 800 }, deviceScaleFactor: 1 });
await p.goto("http://localhost:3000/proto/hero", { waitUntil: "load" });
await p.waitForFunction(() => window.__heroBench?.hero?.warmed === true, null, { timeout: 300000 });
await p.addStyleTag({ content: ".lil-gui, nextjs-portal { display: none !important; } [data-hero-bench] > div:not(.lil-gui) { display: none !important; }" });
const shot = async (cast, name) => {
  await p.evaluate(async (cast) => {
    const { hero, renderer, scene, camera } = window.__heroBench;
    renderer.setAnimationLoop(null);
    scene.getObjectByName("hero logo").castShadow = cast;
    camera.position.set(718, 400, 900); camera.lookAt(718, -437, -17); camera.updateProjectionMatrix();
    for (let i = 0; i < 3; i++) { hero.update(0); hero.compute(renderer); renderer.render(scene, camera); await new Promise((r) => requestAnimationFrame(r)); }
  }, cast);
  await p.screenshot({ path: `${OUT}/${name}.png` });
};
await p.evaluate(() => {
  const { hero, renderer } = window.__heroBench;
  renderer.setAnimationLoop(null);
  hero.replayArrival(); hero.update(0);
  for (let n = 0; n < 77 * 30; n++) { hero.update(1 / 30); hero.compute(renderer); }
  hero.marble.settings.rotate = false;
});
await shot(true, "cast-on");
await shot(false, "cast-off");
await b.close();
