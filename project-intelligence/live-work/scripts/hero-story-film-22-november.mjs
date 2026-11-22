// THE STORY FILMED FROM A STORY TIME (22 November 2026, session 3): the story replayed from the lean, frame-stepped (1/30 s)
// unfilmed to argv[3] seconds, then argv[4] seconds filmed from argv[5]'s camera JSON ({position, target, fov}); encoded at
// 30 fps (true speed) into argv[2]/film.mp4. Optional argv[6]: JSON dials { clothArrival, pass2, pass3, pass4 }. READ-ONLY.
// ⚠ Frame-stepped: true timing, not live playback's frame rate.
import { chromium } from "playwright";
import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync } from "node:fs";
const [OUT, FROM, LEN, CAM, DIALS] = process.argv.slice(2);
const cam = JSON.parse(CAM);
const dials = DIALS ? JSON.parse(DIALS) : {};
const FR = `${OUT}/frames`;
rmSync(FR, { recursive: true, force: true });
mkdirSync(FR, { recursive: true });
const b = await chromium.launch({ channel: "chrome", args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-webgpu"] });
const p = await b.newPage({ viewport: { width: 1896, height: 946 }, deviceScaleFactor: 1 });
const errors = [];
p.on("pageerror", (e) => errors.push(String(e).slice(0, 200)));
await p.goto("http://localhost:3000/proto/hero", { waitUntil: "load" });
await p.waitForFunction(() => window.__heroBench?.hero?.warmed === true, null, { timeout: 300000 });
await p.addStyleTag({ content: ".lil-gui, nextjs-portal { display: none !important; } [data-hero-bench] > div:not(.lil-gui) { display: none !important; }" });
await p.evaluate(({ from, dials }) => {
  const { hero, renderer } = window.__heroBench;
  renderer.setAnimationLoop(null);
  for (const k of ["clothArrival", "pass2", "pass3", "pass4"]) if (dials[k]) Object.assign(hero[k], dials[k]);
  hero.replayArrival(); hero.update(0);
  for (let n = 0; n < Math.round(from * 30); n++) { hero.update(1 / 30); hero.compute(renderer); }
}, { from: Number(FROM), dials });
const total = Math.round(Number(LEN) * 30);
for (let f = 0; f < total; f++) {
  await p.evaluate(async (cam) => {
    const { hero, renderer, scene, camera } = window.__heroBench;
    hero.update(1 / 30);
    hero.compute(renderer);
    camera.position.set(...cam.position); camera.lookAt(...cam.target); camera.fov = cam.fov; camera.updateProjectionMatrix();
    renderer.render(scene, camera);
    await new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(res)));
  }, cam);
  await p.screenshot({ path: `${FR}/${String(f).padStart(4, "0")}.png` });
}
await b.close();
execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", "-framerate", "30", "-i", `${FR}/%04d.png`, "-c:v", "libx264", "-crf", "16", "-pix_fmt", "yuv420p", `${OUT}/film.mp4`]);
console.log(`frames ${total} from ${FROM} s; page errors: ${errors.length}`, errors);
