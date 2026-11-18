// THE FLOOR's RADIAL MASK (18 November 2026; D-101; `hero-floor.ts`): frame-stepped (1/30 s), from ABOVE the leaning
// logo's contact edge. (1) THE FADE-IN: `openingAgain`, stepped until the logo's fade starts, stills at its share 0.25,
// 0.5, 0.75, 1 (the web must OPEN inside out); (2) THE LEAP: `replayArrival`, stills at story 2.000, 2.133, 2.267, 2.4,
// 2.5, 2.6 (lift-off at 2.0: the web must CLOSE outside in, gone by 2.5). Prints the source's extent at each and a contact
// sheet. READ-ONLY. NOT WATCHED: live playback timing, the frame cost.
// Usage: node project-intelligence/live-work/scripts/hero-floor-mask-18-november.mjs <outDir>
import { chromium } from "playwright";
import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";
const [OUT] = process.argv.slice(2);
mkdirSync(OUT, { recursive: true });
const b = await chromium.launch({ channel: "chrome", args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-webgpu"] });
const p = await b.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
const errors = [];
p.on("pageerror", (e) => errors.push(String(e).slice(0, 200)));
await p.goto("http://localhost:3000/proto/hero", { waitUntil: "load" });
await p.waitForFunction(() => window.__heroBench?.hero?.mould && window.__heroBench.hero.warmed === true, null, { timeout: 120000 });
await p.waitForTimeout(3000);
await p.addStyleTag({ content: ".lil-gui, nextjs-portal { display: none !important; } [data-hero-bench] > div:not(.lil-gui) { display: none !important; }" });
const frames = [];
const shoot = async (name) => {
  await p.evaluate(async () => {
    const { renderer, scene, camera } = window.__heroBench;
    renderer.render(scene, camera);
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  });
  await p.screenshot({ path: `${OUT}/${name}.png` });
  frames.push(`${OUT}/${name}.png`);
};
// above the contact edge, looking down
await p.evaluate(() => {
  const { hero, renderer, camera } = window.__heroBench;
  renderer.setAnimationLoop(null);
  const c = hero.lean.floorContact;
  camera.position.set(c[0], c[1] + 3200, c[2] + 1);
  camera.lookAt(c[0], c[1], c[2]);
});
// (1) the fade-in
await p.evaluate(() => window.__heroBench.hero.openingAgain());
for (const share of [0.25, 0.5, 0.75, 1]) {
  const r = await p.evaluate((share) => {
    const { hero } = window.__heroBench;
    let guard = 0;
    while (hero.openingInfo.logoOpacity < share - 1e-6 && guard++ < 3000) hero.update(1 / 30);
    return { opening: hero.openingInfo, floor: hero.floorInfo };
  }, share);
  console.log(`fade ${share}: logo opacity ${r.opening.logoOpacity}, extent ${r.floor.extents[0]}, visible ${r.floor.visible}`);
  await shoot(`fadein-${share}`);
}
// (2) the leap
await p.evaluate(() => window.__heroBench.hero.replayArrival());
for (const at of [2.0, 2.133, 2.267, 2.4, 2.5, 2.6]) {
  const r = await p.evaluate((at) => {
    const { hero } = window.__heroBench;
    while (hero.arrival.t < at - 1e-6) hero.update(1 / 30);
    return { t: hero.arrival.t, floor: hero.floorInfo };
  }, at);
  console.log(`leap story ${r.t}: extent ${r.floor.extents[0]}, visible ${r.floor.visible}`);
  await shoot(`leap-${at.toFixed(3)}`);
}
await b.close();
console.log(`page errors: ${errors.length}`, errors);
const inputs = frames.flatMap((f) => ["-i", f]);
const n = frames.length;
execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", ...inputs, "-filter_complex", frames.map((_, i) => `[${i}]crop=1100:900:410:90,scale=440:360[v${i}]`).join(";") + ";" + frames.map((_, i) => `[v${i}]`).join("") + `xstack=inputs=${n}:layout=${frames.map((_, i) => `${(i % 5) * 440}_${Math.floor(i / 5) * 360}`).join("|")}`, `${OUT}/mask-sheet.png`]);
console.log(`sheet: ${OUT}/mask-sheet.png`);
