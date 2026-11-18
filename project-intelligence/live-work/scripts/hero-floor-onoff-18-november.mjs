// PROBE (18 November 2026): at story argv[3] from ABOVE, blobs on, frame-stepped — the floor heat ON vs OFF, and with the
// liquid's touchdown strength raised to argv[4]; differing pixels per pair. Stills into argv[2]. READ-ONLY.
import { chromium } from "playwright";
import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";
const [OUT, AT, BOOST] = process.argv.slice(2);
mkdirSync(OUT, { recursive: true });
const b = await chromium.launch({ channel: "chrome", args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-webgpu"] });
const p = await b.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
await p.goto("http://localhost:3000/proto/hero", { waitUntil: "load" });
await p.waitForFunction(() => window.__heroBench?.hero?.mould && window.__heroBench.hero.warmed === true, null, { timeout: 120000 });
await p.addStyleTag({ content: ".lil-gui, nextjs-portal { display: none !important; } [data-hero-bench] > div:not(.lil-gui) { display: none !important; }" });
for (const [name, on, boost] of [["off", false, null], ["on", true, null], ["boost", true, +BOOST]]) {
  const info = await p.evaluate(async ([at, on, boost]) => {
    const { hero, renderer, scene, camera } = window.__heroBench;
    renderer.setAnimationLoop(null);
    hero.settings.blobs = true;
    hero.settings.floor = true;
    hero.floor.on = on;
    if (boost != null) hero.floor.liquidStrength = boost;
    hero.replayArrival();
    hero.update(0);
    camera.position.set(0, 3400, 1);
    camera.lookAt(0, -437.5, 0);
    while (hero.arrival.t < at - 1e-6) hero.update(1 / 30);
    renderer.render(scene, camera);
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    return hero.floorInfo;
  }, [+AT, on, boost]);
  console.log(name, JSON.stringify(info));
  await p.screenshot({ path: `${OUT}/${name}.png` });
}
await b.close();
const raw = (f) => execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-i", f, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], { maxBuffer: 1920 * 1080 * 4 });
const off = raw(`${OUT}/off.png`);
for (const n of ["on", "boost"]) {
  const a = raw(`${OUT}/${n}.png`);
  let any = 0, max = 0;
  for (let i = 0; i < a.length; i++) { const d = Math.abs(a[i] - off[i]); if (d > 2) any++; max = Math.max(max, d); }
  console.log(`${n} vs off: channels differing > 2: ${any}, max ${max}`);
}
