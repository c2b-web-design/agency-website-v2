// PHASE 3 REDESIGNED, TAKE 1: ONE CIRCLE THROUGH THE CLOTH (26 November 2026; D-101). READ-ONLY on the scene.
// The hero bench (`/proto/hero`) from the DARK (`openingAgain`), frame-stepped at 1/30 s, at Carl's window (1896 x 946, DPR 1).
// Steps the whole story; from the frame the cloth is hung to `TAIL` s after touchdown, each frame is filmed TWICE: from
// HOME (the camera Carl builds at) and from the SIDE (Carl: "i will judge it from the front and from the side"), square on to the
// circle's plane, framed on the logo's home centre + 80 cm. Logs the scene's own read-outs (circleInfo, marble, floorDry, dry,
// the logo's world centre) per filmed frame to state.jsonl. Out (argv[2]): home/, side/, state.jsonl, home.mp4, side.mp4,
// both.mp4 (side by side). ⚠ Frame-stepped: true timing, not live playback's frame rate.
import { chromium } from "playwright";
import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync, writeFileSync, appendFileSync } from "node:fs";
const [OUT, TAIL = "6", MAXS = "80"] = process.argv.slice(2);
for (const d of ["home", "side"]) {
  rmSync(`${OUT}/${d}`, { recursive: true, force: true });
  mkdirSync(`${OUT}/${d}`, { recursive: true });
}
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
  window.__home = { p: camera.position.clone(), q: camera.quaternion.clone() };
  hero.openingAgain();
});
let filmed = 0;
let tail = 0;
let homeCentre = null;
for (let f = 0; f < Number(MAXS) * 30; f++) {
  const r = await p.evaluate(() => {
    const { hero, renderer } = window.__heroBench;
    hero.update(1 / 30);
    hero.compute(renderer);
    const c = hero.circleInfo;
    const logo = hero.logo;
    let centre = null;
    if (logo) {
      if (!logo.geometry.boundingBox) logo.geometry.computeBoundingBox();
      const v = logo.geometry.boundingBox.getCenter(new logo.position.constructor()).applyMatrix4(logo.matrix);
      centre = [v.x, v.y, v.z].map((x) => Math.round(x * 10) / 10);
    }
    return { c, centre, marble: hero.marble?.info ?? null, floorDry: hero.floorDryInfo, dry: hero.dry?.info ?? null, asleep: hero.cloth?.asleep };
  });
  // filmed from the frame the cloth is hung
  const hung = Number.isFinite(r.c.fadeInAt);
  if (hung && !homeCentre) homeCentre = r.centre;
  // touched down: the circle complete (`landAt` is planned at take-off, so it is not the test)
  const landed = r.c.thetaDeg >= 360;
  if (!hung) {
    await p.evaluate(() => {
      const { renderer, scene, camera } = window.__heroBench;
      renderer.render(scene, camera);
    });
    continue;
  }
  await p.evaluate(async () => {
    const { renderer, scene, camera } = window.__heroBench;
    renderer.render(scene, camera);
    await new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(res)));
  });
  const n = String(filmed).padStart(4, "0");
  await p.screenshot({ path: `${OUT}/home/${n}.png` });
  await p.evaluate(async ({ hc }) => {
    const { renderer, scene, camera } = window.__heroBench;
    const upc = 4.41;
    camera.position.set(hc[0] + 1800, hc[1] + 80 * upc, hc[2]);
    camera.lookAt(hc[0], hc[1] + 80 * upc, hc[2]);
    renderer.render(scene, camera);
    await new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(res)));
  }, { hc: homeCentre });
  await p.screenshot({ path: `${OUT}/side/${n}.png` });
  await p.evaluate(() => {
    const { camera } = window.__heroBench;
    camera.position.copy(window.__home.p);
    camera.quaternion.copy(window.__home.q);
  });
  appendFileSync(`${OUT}/state.jsonl`, `${JSON.stringify({ f, filmed, ...r })}\n`);
  filmed++;
  if (filmed % 60 === 0) console.log(`filmed ${filmed} (theta ${r.c.thetaDeg})`);
  // the tail: TAIL s of filmed frames after touchdown
  if (landed && ++tail > Number(TAIL) * 30) break;
}
await b.close();
for (const d of ["home", "side"]) execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", "-framerate", "30", "-i", `${OUT}/${d}/%04d.png`, "-c:v", "libx264", "-crf", "16", "-pix_fmt", "yuv420p", `${OUT}/${d}.mp4`]);
execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", "-i", `${OUT}/home.mp4`, "-i", `${OUT}/side.mp4`, "-filter_complex", "[0:v]scale=960:-2[a];[1:v]scale=960:-2[b];[a][b]hstack", "-c:v", "libx264", "-crf", "18", "-pix_fmt", "yuv420p", `${OUT}/both.mp4`]);
console.log(`filmed ${filmed}; home centre ${homeCentre}; page errors: ${errors.length}`, errors);
