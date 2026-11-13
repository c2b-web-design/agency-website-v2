// THE LOGO's ARRIVAL ON FILM (13 November 2026; D-101). Carl: "it can jump up slightly, land on the same spot, upright and
// have a slight wobble." Prints the arrival's numbers (`__heroBench.hero.arrival`), then FRAME-STEPPED (the bench's loop
// stopped; the scene stepped exactly 1/30 s per frame), blobs OFF: the arrival played twice — from HOME (what a visitor
// sees), then CLOSE on the logo from the camera's side. 1920 × 1080, panel and meters hidden; H.264 BT.709, 30 fps CFR.
// ⚠ NOT WATCHED: real-time smoothness on Carl's machine (frame-stepped by design); the first-load hitch.
import { chromium } from "playwright";
import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync } from "node:fs";

const FRAMES_DIR = process.argv[2];
const OUT = process.argv[3];
const FPS = 30;
rmSync(FRAMES_DIR, { recursive: true, force: true });
mkdirSync(FRAMES_DIR, { recursive: true });

const b = await chromium.launch({ channel: "chrome", args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-webgpu"] });
const p = await b.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
const errors = [];
p.on("pageerror", (e) => errors.push(String(e).slice(0, 200)));
await p.goto("http://localhost:3000/proto/hero", { waitUntil: "load" });
await p.waitForSelector("[data-hero-backend]", { timeout: 60000 });
await p.waitForFunction(() => window.__heroBench?.hero?.arrival, null, { timeout: 60000 });
await p.waitForTimeout(6000); // the live arrival plays out first
console.log("arrival:", JSON.stringify(await p.evaluate(() => window.__heroBench.hero.arrival)));
await p.addStyleTag({ content: ".lil-gui, nextjs-portal { display: none !important; } [data-hero-bench] > div:not(.lil-gui) { display: none !important; }" });
await p.evaluate(() => {
  window.__heroBench.renderer.setAnimationLoop(null);
  window.__heroBench.hero.settings.blobs = false;
});
const duration = await p.evaluate(() => window.__heroBench.hero.arrival.durationS);
const take = Math.ceil((duration + 0.6) * FPS);
let i = 0;
for (const shot of ["home", "close"]) {
  await p.evaluate((shot) => {
    const { hero, camera } = window.__heroBench;
    if (shot === "home") {
      camera.position.set(0, -49.2, 2566.2);
      camera.lookAt(0, 0, 0);
    } else {
      const [x, y, z] = hero.lean.contact;
      camera.position.set(x + 300, y - 150, z + 2100);
      camera.lookAt(x + 150, y - 130, z);
    }
    hero.replayArrival();
  }, shot);
  for (let k = 0; k < take; k++, i++) {
    await p.evaluate(async (k) => {
      const { hero, renderer, scene, camera } = window.__heroBench;
      if (k > 0) hero.update(1 / 30);
      renderer.render(scene, camera);
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    }, k);
    await p.screenshot({ path: `${FRAMES_DIR}/f${String(i).padStart(4, "0")}.jpg`, type: "jpeg", quality: 95 });
  }
  console.log(`${shot}: ${take} frames`);
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
