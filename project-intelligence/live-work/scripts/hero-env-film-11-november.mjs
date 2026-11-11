// THE COURTYARD ENVIRONMENT ON FILM (11 November 2026; Carl: "a single screenshot wont do it justice. go video it and give
// yourself a treat."). FRAME-STEPPED: the bench's loop stopped; each frame the scene steps exactly 1/30 s, the camera is
// set on its path, the frame is drawn and captured — so the film is smooth at 30 fps whatever the machine does.
// 1920 × 1080; the panel, the FPS meter and the dev badge hidden. 30 s: CHROME 0–10 s, SHINY 10–20 s, LIQUID 20–30 s;
// the camera drifts from Home in toward the blobs and round to the right. Encoded H.264 BT.709, 30 fps CFR (Resolve).
import { chromium } from "playwright";
import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync } from "node:fs";

const FRAMES_DIR = process.argv[2];
const OUT = process.argv[3];
const FPS = 30;
const SECONDS = 30;
rmSync(FRAMES_DIR, { recursive: true, force: true });
mkdirSync(FRAMES_DIR, { recursive: true });

const b = await chromium.launch({ channel: "chrome", args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-webgpu"] });
const p = await b.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
const errors = [];
p.on("pageerror", (e) => errors.push(String(e).slice(0, 200)));
await p.goto("http://localhost:3000/proto/hero", { waitUntil: "load" });
await p.waitForSelector("[data-hero-backend]", { timeout: 60000 });
await p.waitForTimeout(4000);
await p.addStyleTag({ content: ".lil-gui, nextjs-portal { display: none !important; } [data-hero-bench] > div:not(.lil-gui) { display: none !important; }" });
await p.evaluate(() => window.__heroBench.renderer.setAnimationLoop(null));

const N = FPS * SECONDS;
for (let i = 0; i < N; i++) {
  const t = i / FPS;
  await p.evaluate(
    async ({ t, i, FPS }) => {
      const { hero, renderer, scene, camera } = window.__heroBench;
      const mat = t < 10 ? "chrome" : t < 20 ? "shiny" : "liquid";
      if (hero.settings.material !== mat) hero.setMaterial(mat);
      // the path: from Home (azimuth 0, 2566 out, eye −49) in to 1650 and round 32° to the right, rising a little; eased
      const u = t / 30;
      const e = u * u * (3 - 2 * u);
      const az = (32 * e * Math.PI) / 180;
      const d = 2566 - 916 * e;
      const y = -49 + 170 * e;
      const tx = 0, ty = -60 * e, tz = 0;
      camera.position.set(tx + d * Math.sin(az), y, tz + d * Math.cos(az));
      camera.lookAt(tx, ty, tz);
      if (i > 0) hero.update(1 / FPS);
      renderer.render(scene, camera);
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    },
    { t, i, FPS },
  );
  await p.screenshot({ path: `${FRAMES_DIR}/f${String(i).padStart(4, "0")}.jpg`, type: "jpeg", quality: 95 });
  if (i % 150 === 0) console.log(`frame ${i}/${N}`);
}
await b.close();
console.log(`page errors: ${errors.length}`, errors);
execFileSync("ffmpeg", [
  "-hide_banner", "-loglevel", "error", "-y",
  "-framerate", String(FPS), "-i", `${FRAMES_DIR}/f%04d.jpg`,
  "-vf", "scale=out_color_matrix=bt709:out_range=tv,format=yuv420p",
  "-c:v", "libx264", "-preset", "slow", "-crf", "16", "-r", String(FPS),
  "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709",
  "-movflags", "+faststart", OUT,
]);
console.log(`written ${OUT}`);
