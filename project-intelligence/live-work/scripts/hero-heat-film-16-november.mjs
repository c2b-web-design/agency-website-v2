// THE TEMPERATURE ON FILM (16 November 2026, session 3; D-101; `components/hero/hero-heat.ts`). FRAME-STEPPED as
// `hero-steam-film-16-november.mjs` (the bench's loop stopped; the scene's update AND its GPU step exactly 1/30 s a frame):
// from the rain's first release to story `END_S` (past the last red), from each SHOT (argv 4: "home" and/or "close" — Carl's
// close camera of 14 November), one after the other; argv 5 = "on" | "off" (the temperature drives the colour, or the
// run-off front as before). 1920 x 1080, panel and the mould outline hidden; H.264 BT.709, 30 fps CFR.
// NOT WATCHED: real-time smoothness on Carl's machine; the story before the rain's release (stepped, not filmed).
import { chromium } from "playwright";
import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync } from "node:fs";

const [FRAMES_DIR, OUT, SHOTS_ARG = "home,close", MODE = "on"] = process.argv.slice(2);
const SHOTS = SHOTS_ARG.split(",");
const END_S = 35.5;
const FPS = 30;
rmSync(FRAMES_DIR, { recursive: true, force: true });
mkdirSync(FRAMES_DIR, { recursive: true });

const b = await chromium.launch({ channel: "chrome", args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-webgpu"] });
const p = await b.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
const errors = [];
p.on("pageerror", (e) => errors.push(String(e).slice(0, 200)));
p.on("console", (m) => m.type() === "error" && errors.push(m.text().slice(0, 200)));
await p.goto("http://localhost:3000/proto/hero", { waitUntil: "load" });
await p.waitForFunction(() => window.__heroBench?.hero?.heatInfo && window.__heroBench.hero.warmed !== false, null, { timeout: 90000 });
await p.waitForTimeout(6000);
await p.addStyleTag({ content: ".lil-gui, nextjs-portal { display: none !important; } [data-hero-bench] > div:not(.lil-gui) { display: none !important; }" });
await p.evaluate((mode) => {
  const { hero, renderer, scene } = window.__heroBench;
  renderer.setAnimationLoop(null);
  hero.settings.blobs = true;
  hero.settings.floor = true;
  hero.heat.on = mode === "on";
  scene.traverse((o) => o.name === "hero mould outline (guide)" && (o.visible = false));
}, MODE);
const shots = { home: [0, -49.2, 2566.2, 0, 0, 0], close: [79.6, -279.4, 934.2, 681.9, -187.1, -6.3] };
let seq = 0;
for (const shot of SHOTS) {
  await p.evaluate((shot) => {
    const { hero, renderer, camera } = window.__heroBench;
    const [x, y, z, tx, ty, tz] = shot;
    camera.position.set(x, y, z);
    camera.lookAt(tx, ty, tz);
    hero.replayArrival();
    hero.update(0);
    let n = 0;
    while (!(hero.rainInfo && hero.rainInfo.t >= 0) && n++ < 30 * 60) {
      hero.update(1 / 30);
      hero.compute(renderer);
    }
  }, shots[shot]);
  for (let i = 0; ; i++, seq++) {
    const info = await p.evaluate(async (i) => {
      const { hero, renderer, scene, camera } = window.__heroBench;
      if (i > 0) {
        hero.update(1 / 30);
        hero.compute(renderer);
      }
      renderer.render(scene, camera);
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      return { story: hero.arrival.t, wash: hero.rainInfo?.wash, heat: hero.heatInfo };
    }, i);
    await p.screenshot({ path: `${FRAMES_DIR}/f${String(seq).padStart(5, "0")}.jpg`, type: "jpeg", quality: 92 });
    if (i % 30 === 0) console.log(`${shot} story ${info.story} wash ${info.wash} dropped ${info.heat?.dropped}`);
    if (info.story >= END_S || i > 30 * 30) break;
  }
}
await b.close();
console.log(`frames ${seq}; page/console errors: ${errors.length}`, errors.slice(0, 5));
execFileSync("ffmpeg", [
  "-hide_banner", "-loglevel", "error", "-y",
  "-framerate", String(FPS), "-i", `${FRAMES_DIR}/f%05d.jpg`,
  "-vf", "scale=out_color_matrix=bt709:out_range=tv,format=yuv420p",
  "-c:v", "libx264", "-preset", "slow", "-crf", "16", "-r", String(FPS),
  "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709",
  "-movflags", "+faststart", OUT,
]);
console.log(`written ${OUT}`);
