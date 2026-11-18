// THE FLOOR's HEAT, CHUNK 1, STEP 1 — THE ROUGH CIRCLE (18 November 2026; D-101; `hero-floor.ts`). Frame-stepped (1/30 s)
// from the lean: stills from HOME and RAISED (above and in front of the contact edge) at story 1.0 (the lean), 3.7 (~1.7 s
// after the jump: half cooled, as seen), 9.0 and 12.0 s; plus the lean with the floor heat OFF (a null control: the pixels
// that differ must be the glow's only). Prints the contact edge, the floor's read-out and page errors.
// READ-ONLY. NOT WATCHED: the opening's fade (the floor rides it), live playback timing, the GPU's frame cost.
// Usage: node project-intelligence/live-work/scripts/hero-floor-circle-18-november.mjs <outDir>
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
const lean = await p.evaluate(() => window.__heroBench.hero.lean);
console.log("lean:", JSON.stringify(lean));
const c = lean.floorContact;
const shots = { home: [0, -49.2, 2566.2, 0, 0, 0], raised: [c[0] + 250, c[1] + 900, c[2] + 1300, c[0], c[1], c[2]] };
const times = [1.0, 3.7, 9.0, 12.0];
for (const [name, [x, y, z, tx, ty, tz]] of Object.entries(shots)) {
  for (const [label, at, on] of [["lean-floor-off", 1.0, false], ...times.map((t) => [`t${t.toFixed(1)}`, t, true])]) {
    const info = await p.evaluate(async ([x, y, z, tx, ty, tz, at, on]) => {
      const { hero, renderer, scene, camera } = window.__heroBench;
      renderer.setAnimationLoop(null);
      scene.traverse((o) => o.name === "hero mould outline (guide)" && (o.visible = false));
      hero.floor.on = on;
      hero.replayArrival();
      camera.position.set(x, y, z);
      camera.lookAt(tx, ty, tz);
      hero.update(0);
      while (hero.arrival.t < at - 1e-6) hero.update(1 / 30);
      renderer.render(scene, camera);
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      return { t: hero.arrival.t, floor: hero.floorInfo };
    }, [x, y, z, tx, ty, tz, at, on]);
    console.log(`${name} ${label}: story ${info.t}`, JSON.stringify(info.floor));
    await p.screenshot({ path: `${OUT}/${name}-${label}.png` });
  }
}
await b.close();
console.log(`page errors: ${errors.length}`, errors);
// the null control: floor off vs on at the lean — where the pixels differ, and by how much
const raw = (file) => execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-i", file, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], { maxBuffer: 1920 * 1080 * 4 });
for (const name of Object.keys(shots)) {
  const a = raw(`${OUT}/${name}-t1.0.png`), r = raw(`${OUT}/${name}-lean-floor-off.png`);
  let any = 0, max = 0, minX = 1e9, maxX = -1, minY = 1e9, maxY = -1;
  for (let i = 0; i < a.length; i += 3) {
    const d = Math.max(Math.abs(a[i] - r[i]), Math.abs(a[i + 1] - r[i + 1]), Math.abs(a[i + 2] - r[i + 2]));
    if (d > 0) {
      any++;
      const px = (i / 3) % 1920, py = Math.floor(i / 3 / 1920);
      minX = Math.min(minX, px); maxX = Math.max(maxX, px); minY = Math.min(minY, py); maxY = Math.max(maxY, py);
    }
    max = Math.max(max, d);
  }
  console.log(`${name}: floor on vs off at the lean — differing px ${any}, max ${max}, box x ${minX}–${maxX}, y ${minY}–${maxY}`);
}
