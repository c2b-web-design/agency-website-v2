// THE DISC GROWS FROM THE LANDING ON FILM (13 November 2026, session 2; D-101). Carl: "when the logo hits the floor if
// starts from the middle and by time the blobs appear it will be complete." FRAME-STEPPED (the bench loop stopped; the
// scene stepped exactly 1/30 s a frame), blobs and floor ON: the story from the start twice, from HOME then CLOSE.
// 1920 x 1080, panel, meters and mould outline hidden; H.264 BT.709, 30 fps CFR. Logs the mask share (arrival.pool) from
// touchdown to the first blob, and the light (which must stay 0 until the emission).
// NOT WATCHED: real-time smoothness on Carl's machine; the first compile (a load cost, not stepped).
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
p.on("console", (m) => m.type() === "error" && errors.push(m.text().slice(0, 200)));
await p.goto("http://localhost:3000/proto/hero", { waitUntil: "load" });
await p.waitForSelector("[data-hero-backend]", { timeout: 60000 });
await p.waitForFunction(() => window.__heroBench?.hero?.mould, null, { timeout: 60000 });
await p.waitForTimeout(9000); // the live story plays once (compiles everything)
await p.addStyleTag({ content: ".lil-gui, nextjs-portal { display: none !important; } [data-hero-bench] > div:not(.lil-gui) { display: none !important; }" });
const dur = await p.evaluate(() => {
  const { hero, renderer, scene } = window.__heroBench;
  renderer.setAnimationLoop(null);
  hero.settings.blobs = true;
  hero.settings.floor = true;
  scene.traverse((o) => o.name === "hero mould outline (guide)" && (o.visible = false));
  return hero.arrival.durationS;
});
const SECONDS = dur + 3 + 4;
let seq = 0;
for (const [k, shot] of ["home", "close"].entries()) {
  await p.evaluate((shot) => {
    const { hero, camera } = window.__heroBench;
    if (shot === "home") {
      camera.position.set(0, -49.2, 2566.2);
      camera.lookAt(0, 0, 0);
    } else {
      const [x, y, z] = hero.lean.contact;
      camera.position.set(x + 450, y - 150, z + 1900);
      camera.lookAt(x + 250, y - 150, z);
    }
    hero.replayArrival();
  }, shot);
  const N = Math.ceil(SECONDS * FPS);
  for (let i = 0; i < N; i++, seq++) {
    const info = await p.evaluate(async (i) => {
      const { hero, renderer, scene, camera } = window.__heroBench;
      if (i > 0) hero.update(1 / 30);
      renderer.render(scene, camera);
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      let light = null;
      scene.traverse((o) => o.isPointLight && (light = o));
      return { t: hero.arrival.t, pool: hero.arrival.pool, td: hero.arrival.touchdownS, born: hero.blobs.length, logo: hero.logo.visible, light: +light.intensity.toFixed(2) };
    }, i);
    if (k === 0 && (i % 6 === 0 || (info.born > 0 && !globalThis.firstSeen)) && info.t > info.td - 0.2 && info.t < dur + 1.8) { if (info.born > 0 && !globalThis.firstSeen) { globalThis.firstSeen = 1; console.log("FIRST BLOB"); } console.log(`t ${info.t}: pool ${info.pool}, blobs ${info.born}, light ${info.light}, logo ${info.logo}`); }
    await p.screenshot({ path: `${FRAMES_DIR}/f${String(seq).padStart(5, "0")}.jpg`, type: "jpeg", quality: 95 });
  }
  console.log(`${shot}: ${N} frames`);
}
await b.close();
console.log(`page errors: ${errors.length}`, errors);
execFileSync("ffmpeg", [
  "-hide_banner", "-loglevel", "error", "-y",
  "-framerate", String(FPS), "-i", `${FRAMES_DIR}/f%05d.jpg`,
  "-vf", "scale=out_color_matrix=bt709:out_range=tv,format=yuv420p",
  "-c:v", "libx264", "-preset", "slow", "-crf", "16", "-r", String(FPS),
  "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709",
  "-movflags", "+faststart", OUT,
]);
console.log(`written ${OUT}`);
