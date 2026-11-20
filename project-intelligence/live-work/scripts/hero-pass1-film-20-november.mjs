// PASS 1, FORWARD — FILMED (20 November 2026, session 2; Carl: "go film it from this position"). The story frame-stepped at
// 1/30 s from "Jump" taken (phase 1's wobble done), 0.5 s held before, argv[3] seconds after (default 3.5); each frame a
// screenshot from argv[4]'s camera JSON (default: Carl's bench camera of the moment, read from his Chrome's saved pose:
// position 2925.3, 20.4, −6.1; target 358.4, 0, −0.3; fov 45); encoded at 30 fps (true speed) into argv[2]. READ-ONLY.
// ⚠ Frame-stepped: true timing, not live playback's frame rate.
import { chromium } from "playwright";
import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync } from "node:fs";
const [OUT, AFTER = "3.5", CAM, START, HOLD] = process.argv.slice(2);
// argv[6] "hold": "Jump" pressed EVERY frame — each next action (pass 2's swivel) taken the moment it can be
const hold = HOLD === "hold";
// argv[5] START: seconds after the FORWARD jump's take-off to begin filming (the backward action is ~4.9 s after it);
// unset = 0.5 s before the take-off, as before
const startS = START === undefined ? -0.5 : Number(START);
const cam = CAM ? JSON.parse(CAM) : { position: [2925.3, 20.4, -6.1], target: [358.4, 0, -0.3], fov: 45 };
const FR = `${OUT}/frames`;
rmSync(FR, { recursive: true, force: true });
mkdirSync(FR, { recursive: true });
const b = await chromium.launch({ channel: "chrome", args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-webgpu"] });
const p = await b.newPage({ viewport: { width: 1896, height: 946 }, deviceScaleFactor: 1 });
const errors = [];
p.on("pageerror", (e) => errors.push(String(e).slice(0, 200)));
await p.goto("http://localhost:3000/proto/hero", { waitUntil: "load" });
await p.waitForFunction(() => window.__heroBench?.hero?.warmed === true, null, { timeout: 180000 });
await p.addStyleTag({ content: ".lil-gui, nextjs-portal { display: none !important; } [data-hero-bench] > div:not(.lil-gui) { display: none !important; }" });
// to 0.5 s before the jump can be taken: find when it is taken, replay, stop 15 frames short
const takenAt = await p.evaluate(() => {
  const { hero, renderer } = window.__heroBench;
  renderer.setAnimationLoop(null);
  hero.replayArrival(); hero.cloth.again(); hero.update(0);
  let n = 0;
  while (Number.isNaN(hero.jumpInfo.at) && n < 30 * 120) { hero.jump(); hero.update(1 / 30); hero.compute(renderer); n++; }
  return n;
});
await p.evaluate((stop) => {
  const { hero, renderer } = window.__heroBench;
  hero.replayArrival(); hero.cloth.again(); hero.update(0);
  for (let n = 0; n < stop; n++) { hero.update(1 / 30); hero.compute(renderer); }
}, takenAt - 15);
await p.evaluate((hold) => (window.__holdJump = hold), hold);
const lead = Math.round(-startS * 30); // frames filmed before the take-off (negative: frames skipped after it)
const total = Math.max(0, lead) + Math.round(Number(AFTER) * 30);
// a START after the take-off: take the jump, then step on unfilmed to it
if (lead < 0) {
  await p.evaluate((skip) => {
    const { hero, renderer } = window.__heroBench;
    for (let n = 0; n < 15 + skip; n++) { if (n === 14 || (window.__holdJump && n > 14)) hero.jump(); hero.update(1 / 30); hero.compute(renderer); }
  }, -lead);
}
for (let f = 0; f < total; f++) {
  await p.evaluate(async ({ cam, jumpNow }) => {
    const { hero, renderer, scene, camera } = window.__heroBench;
    if (jumpNow || window.__holdJump) hero.jump();
    hero.update(1 / 30);
    hero.compute(renderer);
    camera.position.set(...cam.position); camera.lookAt(...cam.target); camera.fov = cam.fov; camera.updateProjectionMatrix();
    renderer.render(scene, camera);
    await new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(res)));
  }, { cam, jumpNow: lead > 0 && f === lead - 1 });
  await p.screenshot({ path: `${FR}/${String(f).padStart(4, "0")}.png` });
}
const info = await p.evaluate(() => window.__heroBench.hero.jumpInfo);
await b.close();
execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", "-framerate", "30", "-i", `${FR}/%04d.png`, "-c:v", "libx264", "-crf", "16", "-pix_fmt", "yuv420p", `${OUT}/pass1-forward.mp4`]);
console.log(`frames ${total} (${(total / 30).toFixed(2)} s); jump taken at emission ${info.at.toFixed(2)} s; hand at end ${info.handCm.toFixed(1)} cm`);
console.log(`page errors: ${errors.length}`, errors);
console.log(`film: ${OUT}/pass1-forward.mp4`);
