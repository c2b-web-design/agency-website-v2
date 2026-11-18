// THE RAIN COOLS THE FLOOR (18 November 2026; D-101; `hero-floor.ts`): frame-stepped (1/30 s) from the lean, blobs and
// rain on — stills from HOME and ABOVE (the landed logo) at story 26.0 (before the drops), 26.8, 27.5, 29.0, 32.0; the rain's
// clock printed with each; a contact sheet into argv[2]. READ-ONLY. NOT WATCHED: live playback, frame cost.
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
await p.addStyleTag({ content: ".lil-gui, nextjs-portal { display: none !important; } [data-hero-bench] > div:not(.lil-gui) { display: none !important; }" });
const times = [26.0, 26.8, 27.5, 29.0, 32.0];
const frames = [];
for (const view of ["home", "above"]) {
  await p.evaluate(() => {
    const { hero, renderer } = window.__heroBench;
    renderer.setAnimationLoop(null);
    hero.settings.blobs = true;
    hero.settings.floor = true;
    hero.replayArrival();
    hero.update(0);
  });
  for (const at of times) {
    const r = await p.evaluate(async ([view, at]) => {
      const { hero, renderer, scene, camera } = window.__heroBench;
      while (hero.arrival.t < at - 1e-6) hero.update(1 / 30);
      const c = hero.rainInfo?.map?.centre ?? [0, 0];
      if (view === "home") {
        camera.position.set(0, -49.2, 2566.2);
        camera.lookAt(0, 0, 0);
      } else {
        camera.position.set(c[0], 3400, c[1] + 1);
        camera.lookAt(c[0], -437.5, c[1]);
      }
      renderer.render(scene, camera);
      await new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(res)));
      return { t: hero.arrival.t, rain: hero.rainInfo?.t, floor: hero.floorInfo };
    }, [view, at]);
    const f = `${OUT}/${view}-${at.toFixed(1)}.png`;
    await p.screenshot({ path: f });
    frames.push(f);
    console.log(`${view} story ${r.t.toFixed(2)} rain clock ${r.rain}  solid ${r.floor.strengths[2]}/${r.floor.extents[2]}`);
  }
}
await b.close();
console.log(`page errors: ${errors.length}`, errors);
const n = frames.length;
execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", ...frames.flatMap((f) => ["-i", f]), "-filter_complex", frames.map((_, i) => `[${i}]scale=480:270[v${i}]`).join(";") + ";" + frames.map((_, i) => `[v${i}]`).join("") + `xstack=inputs=${n}:layout=${frames.map((_, i) => `${(i % 5) * 480}_${Math.floor(i / 5) * 270}`).join("|")}`, `${OUT}/rain-cold-sheet.png`]);
console.log(`sheet: ${OUT}/rain-cold-sheet.png`);
