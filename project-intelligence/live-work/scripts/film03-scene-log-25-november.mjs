// FILM 3 / THE STORYBOARD: THE WHOLE SCENE, FILMED AND LOGGED (25 November 2026, session 2; Carl: "Take a capture of the whole
// 90s scene. Document every action and the time it happened. Break it down into sections/ subsections. Then we will have our
// storyboard and roadmap for the film."). READ-ONLY.
// The hero bench (`/proto/hero`) from the DARK (`openingAgain`), at HOME, frame-stepped at 1/30 s for argv[3] seconds, at Carl's
// window (1896 x 946, DPR 1, the scrollbar gutter off). Each frame: a screenshot, and THE SCENE's OWN READ-OUTS (openingInfo,
// arrival, reform, rainInfo, steamInfo, heatInfo, clothArrivalInfo, jumpInfo, pass2Info, clothDepartureInfo, marble.info,
// dry.info, floorInfo, floorDryInfo, the blobs' count) as one JSON line in state.jsonl — the times come from the scene, never
// typed (D-101, 16 November). Out (argv[2]): frames/, state.jsonl, film.mp4 (30 fps).
// ⚠ Frame-stepped: true timing, not live playback's frame rate. ⚠ HOME only: what the camera does not see is still logged.
import { chromium } from "playwright";
import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync, writeFileSync, appendFileSync } from "node:fs";
const [OUT, LEN = "92"] = process.argv.slice(2);
const FR = `${OUT}/frames`;
rmSync(FR, { recursive: true, force: true });
mkdirSync(FR, { recursive: true });
writeFileSync(`${OUT}/state.jsonl`, "");
const b = await chromium.launch({ channel: "chrome", args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-webgpu", "--hide-scrollbars"] });
const p = await b.newPage({ viewport: { width: 1896, height: 946 }, deviceScaleFactor: 1 });
const errors = [];
p.on("pageerror", (e) => errors.push(String(e).slice(0, 200)));
await p.goto("http://localhost:3000/proto/hero", { waitUntil: "load" });
await p.waitForFunction(() => window.__heroBench?.hero?.warmed === true, null, { timeout: 300000 });
await p.addStyleTag({ content: "html{scrollbar-gutter:auto!important} .lil-gui, nextjs-portal { display: none !important; } [data-hero-bench] > div:not(.lil-gui) { display: none !important; }" });
await p.evaluate(() => window.dispatchEvent(new Event("resize")));
await p.waitForTimeout(500);
await p.evaluate(() => {
  const { hero, renderer, camera, controls } = window.__heroBench;
  renderer.setAnimationLoop(null);
  camera.position.set(0, -49.2, 2566.2); camera.fov = 45; camera.updateProjectionMatrix();
  if (controls) { controls.target.set(0, 0, 0); controls.update(); } else camera.lookAt(0, 0, 0);
  hero.openingAgain();
});
const total = Math.round(Number(LEN) * 30);
for (let f = 0; f < total; f++) {
  const line = await p.evaluate(async () => {
    const { hero, renderer, scene, camera } = window.__heroBench;
    hero.update(1 / 30);
    hero.compute(renderer);
    renderer.render(scene, camera);
    await new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(res)));
    const pick = (o) => { try { return o; } catch { return null; } };
    const s = {
      opening: pick(hero.openingInfo), arrival: pick(hero.arrival), reform: pick(hero.reform),
      rain: pick(hero.rainInfo), steam: pick(hero.steamInfo), heat: pick(hero.heatInfo),
      clothArrival: pick(hero.clothArrivalInfo), jump: pick(hero.jumpInfo), pass2: pick(hero.pass2Info),
      clothDeparture: pick(hero.clothDepartureInfo), marble: pick(hero.marble?.info), dry: pick(hero.dry?.info),
      floor: pick(hero.floorInfo), floorDry: pick(hero.floorDryInfo), blobs: hero.blobs?.length ?? 0, clothAsleep: hero.cloth?.asleep,
    };
    // long arrays to their length; textures and objects without plain data dropped
    return JSON.stringify(s, (k, v) => (Array.isArray(v) && v.length > 8 ? `[${v.length}]` : v && typeof v === "object" && v.isTexture ? undefined : v));
  });
  appendFileSync(`${OUT}/state.jsonl`, `{"f":${f},"s":${line}}\n`);
  await p.screenshot({ path: `${FR}/${String(f).padStart(4, "0")}.png` });
  if (f % 300 === 0) console.log(`frame ${f}/${total}`);
}
await b.close();
execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", "-framerate", "30", "-i", `${FR}/%04d.png`, "-c:v", "libx264", "-crf", "16", "-pix_fmt", "yuv420p", `${OUT}/film.mp4`]);
console.log(`frames ${total}; page errors: ${errors.length}`, errors);
