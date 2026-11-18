// THE FLOOR's HEAT, SOURCE 2 — THE AMBER LIQUID (18 November 2026; D-101; `hero-floor.ts`). Frame-stepped (1/30 s) from the
// lean, blobs ON: the sources' strengths and extents printed every 0.25 s from story 2.5 to 12 s, with the first blob's
// arrival in the disc (`arrival.poolHits`, emission seconds); stills from ABOVE (the field's middle) and from HOME at
// touchdown + 1 s, the first hit, + 1 s, + 2 s, + 3.5 s; a contact sheet. READ-ONLY. NOT WATCHED: live playback, frame cost.
// Usage: node project-intelligence/live-work/scripts/hero-floor-liquid-18-november.mjs <outDir>
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
// pass 1: the numbers
const log = await p.evaluate(() => {
  const { hero, renderer } = window.__heroBench;
  renderer.setAnimationLoop(null);
  hero.settings.blobs = true;
  hero.settings.floor = true;
  hero.replayArrival();
  hero.update(0);
  const rows = [];
  let next = 2.5;
  while (hero.arrival.t < 12) {
    hero.update(1 / 30);
    if (hero.arrival.t >= next - 1e-6) {
      const f = hero.floorInfo;
      rows.push(`story ${hero.arrival.t.toFixed(2)}  lean ${f.strengths[0]}/${f.extents[0]}  liquid ${f.strengths[1]}/${f.extents[1]}  pool ${hero.arrival.pool}  hits ${JSON.stringify(hero.arrival.poolHits)}`);
      next += 0.25;
    }
  }
  return { rows, hits: hero.arrival.poolHits, duration: hero.arrival.durationS };
});
console.log(log.rows.join("\n"));
const firstHit = log.duration + log.hits[0];
console.log(`first blob in the disc: story ${firstHit.toFixed(2)} s`);
const times = [2.7 + 1, firstHit, firstHit + 1, firstHit + 2, firstHit + 3.5];
const frames = [];
for (const [name, cam] of Object.entries({ above: "above", home: "home" })) {
  for (const at of times) {
    await p.evaluate(async ([cam, at]) => {
      const { hero, renderer, scene, camera } = window.__heroBench;
      hero.replayArrival();
      hero.update(0);
      if (cam === "above") {
        camera.position.set(0, 3400, 1);
        camera.lookAt(0, -437.5, 0);
      } else {
        camera.position.set(0, -49.2, 2566.2);
        camera.lookAt(0, 0, 0);
      }
      while (hero.arrival.t < at - 1e-6) hero.update(1 / 30);
      renderer.render(scene, camera);
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    }, [cam, at]);
    const f = `${OUT}/${name}-${at.toFixed(2)}.png`;
    await p.screenshot({ path: f });
    frames.push(f);
  }
}
await b.close();
console.log(`page errors: ${errors.length}`, errors);
const n = frames.length;
execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", ...frames.flatMap((f) => ["-i", f]), "-filter_complex", frames.map((_, i) => `[${i}]scale=480:270[v${i}]`).join(";") + ";" + frames.map((_, i) => `[v${i}]`).join("") + `xstack=inputs=${n}:layout=${frames.map((_, i) => `${(i % 5) * 480}_${Math.floor(i / 5) * 270}`).join("|")}`, `${OUT}/liquid-sheet.png`]);
console.log(`sheet: ${OUT}/liquid-sheet.png`);
