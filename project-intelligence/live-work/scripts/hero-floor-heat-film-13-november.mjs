// THE FLOOR's HEAT ON FILM (13 November 2026; D-101). Carl: "a local glow around where the blob merges with the floor. As
// the blob exits, it would cool down the floor, going back to normal." FRAME-STEPPED (the bench's loop stopped; the scene
// stepped exactly 1/30 s per frame): 12 s, blobs ON, floor ON, the logo settled; from a raised camera in front so the floor
// reads. 1920 × 1080, panel and meters hidden; H.264 BT.709, 30 fps CFR. Also logs the share of the heat plane's texels
// lit (> 0) each second. ⚠ NOT WATCHED: real-time cost on Carl's machine; the glow's look (his eye).
import { chromium } from "playwright";
import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync } from "node:fs";

const FRAMES_DIR = process.argv[2];
const OUT = process.argv[3];
const FPS = 30;
const SECONDS = 12;
rmSync(FRAMES_DIR, { recursive: true, force: true });
mkdirSync(FRAMES_DIR, { recursive: true });

const b = await chromium.launch({ channel: "chrome", args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-webgpu"] });
const p = await b.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
const errors = [];
p.on("pageerror", (e) => errors.push(String(e).slice(0, 200)));
await p.goto("http://localhost:3000/proto/hero", { waitUntil: "load" });
await p.waitForSelector("[data-hero-backend]", { timeout: 60000 });
await p.waitForFunction(() => window.__heroBench?.hero?.arrival, null, { timeout: 60000 });
await p.waitForTimeout(6000);
await p.addStyleTag({ content: ".lil-gui, nextjs-portal { display: none !important; } [data-hero-bench] > div:not(.lil-gui) { display: none !important; }" });
// the camera: the raised front view by default; a 4th argument "x,y,z,tx,ty,tz" sets another (e.g. low and close)
const cam = (process.argv[4] ?? "0,650,2300,0,-437.5,0").split(",").map(Number);
await p.evaluate((cam) => {
  const { hero, renderer, camera } = window.__heroBench;
  renderer.setAnimationLoop(null);
  hero.settings.blobs = true;
  hero.settings.floor = true;
  camera.position.set(cam[0], cam[1], cam[2]);
  camera.lookAt(cam[3], cam[4], cam[5]);
}, cam);
for (let i = 0; i < FPS * SECONDS; i++) {
  const lit = await p.evaluate(async (i) => {
    const { hero, renderer, scene, camera } = window.__heroBench;
    if (i > 0) hero.update(1 / 30);
    renderer.render(scene, camera);
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    if (i % 30) return null;
    let plane = null;
    scene.traverse((o) => o.name === "hero floor heat" && (plane = o));
    const d = plane.material.map.image.data;
    let n = 0;
    for (let k = 0; k < d.length; k += 4) if (d[k] > 0) n++;
    return `${(100 * n / (d.length / 4)).toFixed(1)}%`;
  }, i);
  if (lit) console.log(`t ${i / FPS} s: heat on ${lit} of the floor's texels`);
  await p.screenshot({ path: `${FRAMES_DIR}/f${String(i).padStart(4, "0")}.jpg`, type: "jpeg", quality: 95 });
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
