// THE STEAM × THE LOCAL HEAT (16 November 2026, session 3; D-101; `hero-steam.ts`, `heatCellsFor`). Frame-stepped from the
// story's start (update + the GPU step every 1/30 s, as the bench), Carl's CLOSE camera (14 November): stills at the steam's
// own clock (seconds since the first drops landed, argv 4) into argv 2, with argv 3 = "on" | "off" (`localHeat`), and a
// STEAM-PIXEL count per still. READ-ONLY.
// "Steam" = grey: min(R,G,B) > 70 and max − min < 28 (the rain is blue, the logo red/blue; ⚠ white specular glints on the
// metal count too, in BOTH modes — compare the two modes, do not read the count as steam alone).
// NOT WATCHED: Home; live playback; the rain is random each run (drops land differently: a few hundred px of noise).
import { chromium } from "playwright";
import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";
const [OUT, MODE = "on", TIMES = "0.2,0.4,0.6,0.9,1.2,1.8,2.6,3.5"] = process.argv.slice(2);
mkdirSync(OUT, { recursive: true });
const times = TIMES.split(",").map(Number);
const b = await chromium.launch({ channel: "chrome", args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-webgpu"] });
const p = await b.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
const errors = [];
p.on("pageerror", (e) => errors.push(String(e).slice(0, 200)));
p.on("console", (m) => m.type() === "error" && errors.push(m.text().slice(0, 200)));
await p.goto("http://localhost:3000/proto/hero", { waitUntil: "load" });
await p.waitForFunction(() => window.__heroBench?.hero?.steamInfo?.precompile && window.__heroBench.hero.warmed !== false, null, { timeout: 90000 });
await p.waitForTimeout(6000);
await p.addStyleTag({ content: ".lil-gui, nextjs-portal { display: none !important; } [data-hero-bench] > div:not(.lil-gui) { display: none !important; }" });
await p.evaluate((mode) => {
  const { hero, renderer, scene, camera } = window.__heroBench;
  renderer.setAnimationLoop(null);
  hero.settings.blobs = true;
  hero.settings.floor = true;
  hero.steam.localHeat = mode === "on";
  scene.traverse((o) => o.name === "hero mould outline (guide)" && (o.visible = false));
  camera.position.set(79.6, -279.4, 934.2);
  camera.lookAt(681.9, -187.1, -6.3);
  hero.replayArrival();
}, MODE);
const grey = (buf) => {
  const raw = execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-i", "pipe:0", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], { input: buf, maxBuffer: 1 << 26 });
  let n = 0;
  for (let i = 0; i < raw.length; i += 3) {
    const lo = Math.min(raw[i], raw[i + 1], raw[i + 2]);
    const hi = Math.max(raw[i], raw[i + 1], raw[i + 2]);
    if (lo > 70 && hi - lo < 28) n++;
  }
  return n;
};
const rows = [];
for (const at of times) {
  const info = await p.evaluate(async (at) => {
    const { hero, renderer, scene, camera } = window.__heroBench;
    let n = 0;
    while (!(Number.isFinite(hero.steamInfo?.t) && hero.steamInfo.t >= at - 1e-6) && n++ < 30 * 60) {
      hero.update(1 / 30);
      hero.compute(renderer);
    }
    renderer.render(scene, camera);
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    return { t: hero.steamInfo.t, live: hero.steamInfo.live, wash: hero.rainInfo?.wash };
  }, at);
  const shot = await p.screenshot({ path: `${OUT}/close-steam-${MODE}-${at}.png` });
  rows.push(`${at}s:${grey(shot)}`);
}
await b.close();
console.log(`localHeat ${MODE}: grey px by steam time  ${rows.join("  ")}`);
console.log(`page/console errors: ${errors.length}`, errors.slice(0, 5));
