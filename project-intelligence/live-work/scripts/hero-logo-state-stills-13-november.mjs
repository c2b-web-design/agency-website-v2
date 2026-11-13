// THE LOGO's STATES AS STILLS — A NULL CONTROL FOR THE HARDENING (13 November 2026, session 2; D-101). Frame-stepped
// (1/30 s) from the story's start, blobs and floor ON, the guide hidden: PNG stills of the LEAN (story 1.0 s) and the
// RE-FORMED logo (argv 3 seconds, past the hardening) from HOME and CLOSE on the mould, into argv 2. Run once on the code
// BEFORE the change (the reference) and once AFTER; argv 4 = a reference folder to DIFF against (per still: the pixels
// differing at all, > 4, and the max). READ-ONLY. NOT WATCHED: the frames in between (the film watches those).
import { chromium } from "playwright";
import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";
const [OUT, END_S = "27", REF] = process.argv.slice(2);
mkdirSync(OUT, { recursive: true });
const b = await chromium.launch({ channel: "chrome", args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-webgpu"] });
const p = await b.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
const errors = [];
p.on("pageerror", (e) => errors.push(String(e).slice(0, 200)));
await p.goto("http://localhost:3000/proto/hero", { waitUntil: "load" });
await p.waitForFunction(() => window.__heroBench?.hero?.mould, null, { timeout: 60000 });
await p.waitForTimeout(9000);
await p.addStyleTag({ content: ".lil-gui, nextjs-portal { display: none !important; } [data-hero-bench] > div:not(.lil-gui) { display: none !important; }" });
const shots = { home: [0, -49.2, 2566.2, 0, 0, 0], close: [718, -32, 1700, 718, -32, 0] };
for (const [name, [x, y, z, tx, ty, tz]] of Object.entries(shots)) {
  await p.evaluate(() => {
    const { hero, renderer, scene } = window.__heroBench;
    renderer.setAnimationLoop(null);
    hero.settings.blobs = true;
    hero.settings.floor = true;
    scene.traverse((o) => o.name === "hero mould outline (guide)" && (o.visible = false));
    hero.replayArrival();
  });
  for (const [label, at] of [["lean", 1.0], ["reformed", +END_S]]) {
    await p.evaluate(async ([x, y, z, tx, ty, tz, at]) => {
      const { hero, renderer, scene, camera } = window.__heroBench;
      camera.position.set(x, y, z);
      camera.lookAt(tx, ty, tz);
      while (hero.arrival.t < at - 1e-6) hero.update(1 / 30);
      renderer.render(scene, camera);
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    }, [x, y, z, tx, ty, tz, at]);
    await p.screenshot({ path: `${OUT}/${name}-${label}.png` });
  }
}
await b.close();
console.log(`page errors: ${errors.length}`, errors);
if (REF) {
  for (const f of ["home-lean", "home-reformed", "close-lean", "close-reformed"]) {
    const raw = (file) => execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-i", file, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], { maxBuffer: 1920 * 1080 * 4 });
    const a = raw(`${OUT}/${f}.png`), r = raw(`${REF}/${f}.png`);
    let any = 0, over4 = 0, max = 0;
    for (let i = 0; i < a.length; i += 3) {
      const d = Math.max(Math.abs(a[i] - r[i]), Math.abs(a[i + 1] - r[i + 1]), Math.abs(a[i + 2] - r[i + 2]));
      if (d > 0) any++;
      if (d > 4) over4++;
      max = Math.max(max, d);
    }
    console.log(`${f.padEnd(16)} differing px ${any}, > 4: ${over4}, max ${max}`);
  }
}
