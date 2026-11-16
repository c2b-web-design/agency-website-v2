// AN ORBIT TAKE ON THE COOLED LOGO (16 November 2026, session 3; D-101). Carl, from his bench pose (position 140.4, 40.1,
// 1078.7; target 327.7, -28.1, -1.2; fov 45): "start from here and move so the logo moves through 90deg while staying
// upright". The camera AND its target turn together about the LOGO's vertical axis (its landed centre, the rain's hit map:
// x 718.48, z -16.92), so the logo keeps its place in frame while it turns; the camera stays level (upright). Eased
// (raised cosine) from rest to rest over SECONDS. argv: out.mp4, frames dir, direction (+1 | -1: the sign of the turn about
// +y), degrees (90), seconds (8). The story runs from 36 s (the wash done) at 1/30 s a frame with its GPU step.
// Carl's window: 1401 x 695 layout px (no root zoom below 1412), drawn at 1.37x for 1920-wide frames. READ-ONLY.
// NOT WATCHED: live playback smoothness; which way Carl meant (both directions filmed).
import { chromium } from "playwright";
import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync } from "node:fs";
const [OUT, FRAMES, DIR = "1", DEG = "90", SECS = "8"] = process.argv.slice(2);
rmSync(FRAMES, { recursive: true, force: true });
mkdirSync(FRAMES, { recursive: true });
const b = await chromium.launch({ channel: "chrome", args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-webgpu"] });
const p = await b.newPage({ viewport: { width: 1401, height: 695 }, deviceScaleFactor: 1.3705 });
const errors = [];
p.on("pageerror", (e) => errors.push(String(e).slice(0, 200)));
await p.goto("http://localhost:3000/proto/hero", { waitUntil: "load" });
await p.waitForFunction(() => window.__heroBench?.hero?.mould && window.__heroBench.hero.warmed !== false, null, { timeout: 90000 });
await p.waitForTimeout(6000);
await p.addStyleTag({ content: ".lil-gui, nextjs-portal { display: none !important; } [data-hero-bench] > div:not(.lil-gui) { display: none !important; }" });
await p.evaluate(() => {
  const { hero, renderer, scene } = window.__heroBench;
  renderer.setAnimationLoop(null);
  hero.settings.blobs = true;
  hero.settings.floor = true;
  scene.traverse((o) => o.name === "hero mould outline (guide)" && (o.visible = false));
  hero.replayArrival();
  while (hero.arrival.t < 36) {
    hero.update(1 / 30);
    hero.compute(renderer);
  }
});
const N = Math.round(+SECS * 30) + 1;
for (let k = 0; k < N; k++) {
  await p.evaluate(
    async ([k, N, dir, deg]) => {
      const { hero, renderer, scene, camera } = window.__heroBench;
      const ax = 718.48, az = -16.92;
      const P0 = [140.4, 40.1, 1078.7], T0 = [327.7, -28.1, -1.2];
      const u = k / (N - 1);
      const e = 0.5 - 0.5 * Math.cos(Math.PI * u);
      const a = dir * ((deg * Math.PI) / 180) * e;
      const rot = ([x, y, z]) => {
        const dx = x - ax, dz = z - az;
        return [ax + dx * Math.cos(a) + dz * Math.sin(a), y, az - dx * Math.sin(a) + dz * Math.cos(a)];
      };
      const [px, py, pz] = rot(P0), [tx, ty, tz] = rot(T0);
      camera.fov = 45;
      camera.updateProjectionMatrix();
      camera.up.set(0, 1, 0);
      camera.position.set(px, py, pz);
      camera.lookAt(tx, ty, tz);
      if (k > 0) {
        hero.update(1 / 30);
        hero.compute(renderer);
      }
      renderer.render(scene, camera);
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    },
    [k, N, +DIR, +DEG],
  );
  await p.screenshot({ path: `${FRAMES}/f${String(k).padStart(4, "0")}.jpg`, type: "jpeg", quality: 92 });
}
await b.close();
console.log(`frames ${N}; errors ${errors.length}`, errors);
execFileSync("ffmpeg", [
  "-hide_banner", "-loglevel", "error", "-y",
  "-framerate", "30", "-i", `${FRAMES}/f%04d.jpg`,
  "-vf", "scale=trunc(iw/2)*2:trunc(ih/2)*2,scale=out_color_matrix=bt709:out_range=tv,format=yuv420p",
  "-c:v", "libx264", "-preset", "slow", "-crf", "16", "-r", "30",
  "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709",
  "-movflags", "+faststart", OUT,
]);
console.log(`written ${OUT}`);
