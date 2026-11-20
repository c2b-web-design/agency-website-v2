// THE CLOTH FROM FOUR ANGLES (20 November 2026; Carl: "we must view it in a 3d world to gaude not just how it looks but to
// see it from different angles"). The story frame-stepped (1/30 s) to argv[3] seconds (default 38: the logo landed; the
// cloth settled — it steps with the story), then stills from: Carl's WORKING camera (position 675.5, −2.8, 2203.3; target
// 695.4, −0.4, 0.9; fov 45) and the same distance ORBITED about the logo's vertical axis (x 718.48, z −16.92) 40° left, 40°
// right, and RAISED 25°. One sheet into argv[2]. READ-ONLY. ⚠ Stills: the cloth's movement is judged live, not here.
import { chromium } from "playwright";
import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";
const [OUT, AT = "38"] = process.argv.slice(2);
mkdirSync(OUT, { recursive: true });
const b = await chromium.launch({ channel: "chrome", args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-webgpu"] });
const p = await b.newPage({ viewport: { width: 1896, height: 946 }, deviceScaleFactor: 1 });
const errors = [];
p.on("pageerror", (e) => errors.push(String(e).slice(0, 200)));
await p.goto("http://localhost:3000/proto/hero", { waitUntil: "load" });
await p.waitForFunction(() => window.__heroBench?.hero?.warmed === true, null, { timeout: 180000 });
await p.addStyleTag({ content: ".lil-gui, nextjs-portal { display: none !important; } [data-hero-bench] > div:not(.lil-gui) { display: none !important; }" });
await p.evaluate((AT) => {
  const { hero, renderer } = window.__heroBench;
  renderer.setAnimationLoop(null);
  hero.settings.blobs = true;
  hero.settings.floor = true;
  hero.replayArrival();
  hero.cloth.again();
  hero.update(0);
  while (hero.arrival.t < AT) {
    hero.update(1 / 30);
    hero.compute(renderer);
  }
}, Number(AT));
const W = { p: [675.5, -2.8, 2203.3], t: [695.4, -0.4, 0.9] };
const axis = [718.48, -16.92];
const orbit = (deg, liftDeg = 0) => {
  const [px, py, pz] = W.p, [tx, ty, tz] = W.t;
  const dx = px - axis[0], dz = pz - axis[1];
  const a = (deg * Math.PI) / 180;
  const rx = dx * Math.cos(a) + dz * Math.sin(a), rz = -dx * Math.sin(a) + dz * Math.cos(a);
  const d = Math.hypot(px - tx, py - ty, pz - tz), l = (liftDeg * Math.PI) / 180;
  const flat = Math.hypot(rx, rz);
  const k = liftDeg ? (d * Math.cos(l)) / flat : 1;
  return { p: [axis[0] + rx * k, liftDeg ? ty + d * Math.sin(l) : py, axis[1] + rz * k], t: W.t };
};
const views = [["working", W], ["left-40", orbit(-40)], ["right-40", orbit(40)], ["raised-25", orbit(0, 25)]];
const files = [];
for (const [name, v] of views) {
  await p.evaluate(async (v) => {
    const { renderer, scene, camera } = window.__heroBench;
    camera.position.set(...v.p);
    camera.lookAt(...v.t);
    camera.fov = 45;
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);
    await new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(res)));
  }, v);
  const f = `${OUT}/${name}.png`;
  await p.screenshot({ path: f });
  files.push(f);
}
await b.close();
console.log(`page errors: ${errors.length}`, errors);
execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", ...files.flatMap((f) => ["-i", f]), "-filter_complex", files.map((_, i) => `[${i}]scale=948:-1[v${i}]`).join(";") + ";" + files.map((_, i) => `[v${i}]`).join("") + `xstack=inputs=4:layout=0_0|948_0|0_473|948_473`, `${OUT}/views.png`]);
console.log(`sheet: ${OUT}/views.png`);
