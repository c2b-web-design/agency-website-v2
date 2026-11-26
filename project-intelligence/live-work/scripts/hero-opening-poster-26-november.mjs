// OPTION C's OPENING STILL (26 November 2026; Carl: "try both B + C"; `hero-bench.tsx`, `POSTER_SRC`). READ-ONLY on the scene.
// The dev bench (`/proto/hero?open=b`: the lights full by 1.5 s), at HOME, 3:1 (2838 x 946 layout px at DPR 1.5: the camera's
// FOV is vertical, so a narrower viewport crops this at the sides), frame-stepped from the dark to the opening's 2.1 s —
// the lights full, the subtext not yet begun (asserted below), nothing else in view. The bench's panels hidden.
// Out (argv[2]): poster.png (the frame) and the facts it was taken at (poster.json).
import { chromium } from "playwright";
import { writeFileSync } from "node:fs";
const [OUT = "."] = process.argv.slice(2);
const b = await chromium.launch({ channel: "chrome", args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-webgpu", "--hide-scrollbars"] });
const p = await b.newPage({ viewport: { width: 2838, height: 946 }, deviceScaleFactor: 1.5 });
await p.goto("http://localhost:3000/proto/hero?open=b", { waitUntil: "load" });
await p.waitForFunction(() => window.__heroBench?.hero?.warmed === true, null, { timeout: 300000 });
await p.addStyleTag({ content: "html{scrollbar-gutter:auto!important} .lil-gui, nextjs-portal { display: none !important; } [data-hero-bench] > div:not(.lil-gui) { display: none !important; }" });
await p.evaluate(() => window.dispatchEvent(new Event("resize")));
await p.waitForTimeout(500);
const info = await p.evaluate(async () => {
  const { hero, renderer, scene, camera, controls } = window.__heroBench;
  renderer.setAnimationLoop(null);
  camera.position.set(0, -49.2, 2566.2);
  camera.fov = 45;
  camera.updateProjectionMatrix();
  if (controls) {
    controls.target.set(0, 0, 0);
    controls.update();
  } else camera.lookAt(0, 0, 0);
  hero.openingAgain();
  for (let i = 0; i < 400 && hero.openingInfo.t < 2.1; i++) {
    hero.update(1 / 60);
    hero.compute(renderer);
  }
  renderer.render(scene, camera);
  await new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(res)));
  return { ...hero.openingInfo, lights: hero.openingLights };
});
if (info.lit < 0.999 || info.subAtS >= 0 || info.fadeAtS >= 0) throw new Error(`not the frame wanted: ${JSON.stringify(info)}`);
await p.screenshot({ path: `${OUT}/poster.png` });
writeFileSync(`${OUT}/poster.json`, JSON.stringify(info, null, 1));
console.log("poster at", JSON.stringify(info));
await b.close();
