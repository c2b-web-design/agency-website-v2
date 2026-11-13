// THE RE-FORMING ON FILM (13 November 2026, session 2; D-101). Carl: "The blobs must fill it up and become a solid logo,
// like the leaning logo, only face on ... Only a few blobs can hit the disc then- we nust account for its mass. Ones that
// are floating you can send direct." FRAME-STEPPED (the bench's loop stopped; the scene stepped exactly 1/30 s a frame),
// blobs and floor ON: the WHOLE story (the lean, arrival, disc, emission, the 7 s dance, the re-forming) from each SHOT
// (argv 4: "home" and/or "wide", comma-separated). 1920 x 1080, panel, meters and the mould outline hidden; H.264 BT.709,
// 30 fps CFR. Logs the plan (each blob's departure, carrier or not, its touch of the disc, its entry) and every 0.5 s of
// the re-forming: the disc's share, the logo's fill, the light, the blobs in the field.
// NOT WATCHED: real-time smoothness on Carl's machine; the first compile (a load cost, not stepped).
import { chromium } from "playwright";
import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync } from "node:fs";

const FRAMES_DIR = process.argv[2];
const OUT = process.argv[3];
const SHOTS = (process.argv[4] ?? "home").split(",");
const TAIL = +(process.argv[5] ?? 2);
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
await p.waitForTimeout(9000);
await p.addStyleTag({ content: ".lil-gui, nextjs-portal { display: none !important; } [data-hero-bench] > div:not(.lil-gui) { display: none !important; }" });
await p.evaluate(() => {
  const { hero, renderer, scene } = window.__heroBench;
  renderer.setAnimationLoop(null);
  hero.settings.blobs = true;
  hero.settings.floor = true;
  scene.traverse((o) => o.name === "hero mould outline (guide)" && (o.visible = false));
});
let seq = 0;
let end = null;
for (const [k, shot] of SHOTS.entries()) {
  await p.evaluate((shot) => {
    const { hero, camera } = window.__heroBench;
    if (shot === "home") {
      camera.position.set(0, -49.2, 2566.2);
      camera.lookAt(0, 0, 0);
    } else if (shot === "mould") {
      // face on to the mould, close: the fill's path through the letters
      camera.position.set(718, -32, 1700);
      camera.lookAt(718, -32, 0);
    } else if (shot === "wide") {
      camera.position.set(250, 600, 3400);
      camera.lookAt(250, -250, 0);
    }
    hero.replayArrival();
    // one zero step after the replay: without it the first frame showed the warm-up run's blobs and logo (a stale
    // frame, 13 November: found in "phase 1 logo")
    hero.update(0);
  }, shot);
  let lastLog = -1;
  let planLogged = false;
  end = null;
  for (let i = 0; ; i++, seq++) {
    const info = await p.evaluate(async (i) => {
      const { hero, renderer, scene, camera } = window.__heroBench;
      if (i > 0) hero.update(1 / 30);
      renderer.render(scene, camera);
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      let light = null;
      scene.traverse((o) => o.isPointLight && (light = o));
      const box = new hero.logo.geometry.boundingBox.constructor().copy(hero.logo.geometry.boundingBox).applyMatrix4(hero.logo.matrix);
      return { low: Math.round(box.min.y), t: hero.arrival.t, dur: hero.arrival.durationS, pool: hero.arrival.pool, blobs: hero.blobs.length, light: +light.intensity.toFixed(2), logo: hero.logo.visible, reform: hero.reform };
    }, i);
    await p.screenshot({ path: `${FRAMES_DIR}/f${String(seq).padStart(5, "0")}.jpg`, type: "jpeg", quality: 92 });
    if (info.reform) {
      const r = info.reform;
      // the end: TAIL seconds after phase 1's END (the landing's wobble done: `reform.endS`), or after FULL and HARD before the fall existed
      if (end === null && (r.endS !== undefined ? info.t >= info.dur + r.endS : r.filled >= 1 && (r.hardness ?? 1) >= 1)) end = info.t + TAIL;
      if (!planLogged) {
        planLogged = true;
        if (k === 0) {
          console.log(`re-forming starts at emission ${r.startS} s (story ${(info.dur + r.startS).toFixed(2)} s); full ${r.fullS}, hard ${r.hardS}, landed ${r.landS}, phase 1 ends ${r.endS} (emission s); the drop ${r.dropCm} cm; the plan:`);
          for (const b of r.blobs) console.log(`  blob ${b.i}: leaves ${b.departS}${b.carrier ? `, CARRIER touches the disc ${b.touchS}` : ", direct"}, enters the c ${b.reachS}`);
        }
      }
      if (k === 0 && info.t - lastLog >= 0.5) {
        lastLog = info.t;
        console.log(`t ${info.t}: disc ${info.pool}, logo filled ${r.filled} (visible ${info.logo}), hardness ${r.hardness}, logo bottom y ${info.low}, light ${info.light}, blobs in field ${info.blobs}`);
      }
    }
    if (end !== null && info.t >= end) break;
    if (i > 60 * FPS) break;
  }
  console.log(`${shot}: done at frame ${seq}`);
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
