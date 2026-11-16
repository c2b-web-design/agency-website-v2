// THE STEAM, FRAME-STEPPED STILLS (16 November 2026; D-101; `components/hero/hero-steam.ts`). Frame-stepped (1/30 s, the
// scene's update AND its GPU step each frame, as the bench's loop) from the story's start to the first drops landing, then
// stills at the steam's seconds (argv 3, comma list; default 0.4,0.8,1.4,2.2,3.2) from HOME and CLOSE on the logo, into
// argv 2. Prints the steam's read-out at each still, and every page error and console error/warning (a WGSL fault shows
// there). argv 5 "off" runs it with the steam switched off. READ-ONLY. NOT WATCHED: the frames between the stills; the live frame rate (`hero-steam-fps-16-november.mjs`).
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
const [OUT, AT = "0.4,0.8,1.4,2.2,3.2", SHOT = "home,close", STEAM = "on"] = process.argv.slice(2);
mkdirSync(OUT, { recursive: true });
const at = AT.split(",").map(Number);
const b = await chromium.launch({ channel: "chrome", args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-webgpu"] });
const p = await b.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
const errors = [];
p.on("pageerror", (e) => errors.push("pageerror: " + String(e).slice(0, 300)));
p.on("console", (m) => (m.type() === "error" || m.type() === "warning") && errors.push(`${m.type()}: ${m.text().slice(0, 300)}`));
await p.goto("http://localhost:3000/proto/hero", { waitUntil: "load" });
await p.waitForFunction(() => window.__heroBench?.hero?.mould && window.__heroBench.hero.steamInfo && window.__heroBench.hero.warmed !== false, null, { timeout: 90000 });
await p.waitForTimeout(6000);
await p.addStyleTag({ content: ".lil-gui, nextjs-portal { display: none !important; } [data-hero-bench] > div:not(.lil-gui) { display: none !important; }" });
const info0 = await p.evaluate(() => window.__heroBench.hero.steamInfo);
console.log("steam at load:", JSON.stringify(info0));
const shots = { home: [0, -49.2, 2566.2, 0, 0, 0], close: [79.6, -279.4, 934.2, 681.9, -187.1, -6.3] };
for (const name of SHOT.split(",")) {
  const [x, y, z, tx, ty, tz] = shots[name];
  await p.evaluate(() => {
    const { hero, renderer, scene } = window.__heroBench;
    renderer.setAnimationLoop(null);
    hero.settings.blobs = true;
    hero.settings.floor = true;
    scene.traverse((o) => o.name === "hero mould outline (guide)" && (o.visible = false));
    hero.replayArrival();
  });
  // argv 5 "off": the steam switched off (the same run without it — whose are the warnings?)
  await p.evaluate((on) => (window.__heroBench.hero.steam.on = on), STEAM !== "off");
  for (const s of at) {
    const r = await p.evaluate(async ([x, y, z, tx, ty, tz, s]) => {
      const { hero, renderer, scene, camera } = window.__heroBench;
      camera.position.set(x, y, z);
      camera.lookAt(tx, ty, tz);
      let n = 0;
      const since = () => (hero.steamInfo && Number.isFinite(hero.steamInfo.t) ? hero.steamInfo.t : -1e9);
      while (since() < s - 1e-6 && n < 30 * 120) {
        hero.update(1 / 30);
        hero.compute(renderer);
        n++;
      }
      renderer.render(scene, camera);
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      return { story: hero.arrival.t, steam: hero.steamInfo, rain: { t: hero.rainInfo?.t, wash: hero.rainInfo?.wash } };
    }, [x, y, z, tx, ty, tz, s]);
    console.log(`${name} @ steam ${s}s: ${JSON.stringify(r)}`);
    await p.screenshot({ path: `${OUT}/${name}-steam-${String(s).replace(".", "_")}s.png` });
  }
}
await b.close();
console.log(`page errors / console errors+warnings: ${errors.length}`);
for (const e of [...new Set(errors)].slice(0, 30)) console.log("  " + e);
