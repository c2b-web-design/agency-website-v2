// THE STORY AT GIVEN TIMES, STILLS (22 November 2026, session 3): the story replayed from the lean, frame-stepped (1/30 s),
// a still at each time in argv[3] (comma-separated, s from the replay; numbered in time order: <name>-NN.png) from each camera in argv[4] (JSON {name: {position,
// target, fov}}), into argv[2]/<name>-<t>.png; then one contact sheet per camera. Nothing pressed (the passes baked in).
// READ-ONLY. ⚠ Frame-stepped: true timing, not live playback's frame rate.
import { chromium } from "playwright";
import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";
const [OUT, TIMES, CAMS] = process.argv.slice(2);
const times = TIMES.split(",").map(Number).sort((a, b) => a - b);
const cams = JSON.parse(CAMS);
mkdirSync(OUT, { recursive: true });
const b = await chromium.launch({ channel: "chrome", args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-webgpu"] });
const p = await b.newPage({ viewport: { width: 1896, height: 946 }, deviceScaleFactor: 1 });
const errors = [];
p.on("pageerror", (e) => errors.push(String(e).slice(0, 200)));
await p.goto("http://localhost:3000/proto/hero", { waitUntil: "load" });
await p.waitForFunction(() => window.__heroBench?.hero?.warmed === true, null, { timeout: 300000 });
await p.addStyleTag({ content: ".lil-gui, nextjs-portal { display: none !important; } [data-hero-bench] > div:not(.lil-gui) { display: none !important; }" });
await p.evaluate(() => { const { hero, renderer } = window.__heroBench; renderer.setAnimationLoop(null); hero.replayArrival(); hero.update(0); });
let now = 0;
for (const [ti, t] of times.entries()) {
  const frames = Math.round((t - now) * 30);
  await p.evaluate((n) => { const { hero, renderer } = window.__heroBench; for (let i = 0; i < n; i++) { hero.update(1 / 30); hero.compute(renderer); } }, frames);
  now += frames / 30;
  for (const [name, cam] of Object.entries(cams)) {
    await p.evaluate(async (cam) => {
      const { renderer, scene, camera } = window.__heroBench;
      camera.position.set(...cam.position); camera.lookAt(...cam.target); camera.fov = cam.fov; camera.updateProjectionMatrix();
      renderer.render(scene, camera);
      await new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(res)));
    }, cam);
    await p.screenshot({ path: `${OUT}/${name}-${String(ti).padStart(2, "0")}.png` });
  }
}
await b.close();
for (const name of Object.keys(cams)) execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", "-i", `${OUT}/${name}-%02d.png`, "-vf", `scale=474:-1,tile=${Math.min(4, times.length)}x${Math.ceil(times.length / 4)}`, "-frames:v", "1", `${OUT}/${name}-sheet.png`]);
console.log(`stills ${times.length} × ${Object.keys(cams).length}; page errors: ${errors.length}`, errors);
