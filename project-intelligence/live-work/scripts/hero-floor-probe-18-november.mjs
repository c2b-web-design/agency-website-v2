// PROBE (18 November 2026): the floor mesh's state at given story times (argv), blobs on, frame-stepped. READ-ONLY.
import { chromium } from "playwright";
const times = process.argv.slice(2).map(Number);
const b = await chromium.launch({ channel: "chrome", args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-webgpu"] });
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
await p.goto("http://localhost:3000/proto/hero", { waitUntil: "load" });
await p.waitForFunction(() => window.__heroBench?.hero?.mould && window.__heroBench.hero.warmed === true, null, { timeout: 120000 });
const r = await p.evaluate((times) => {
  const { hero, renderer, scene } = window.__heroBench;
  renderer.setAnimationLoop(null);
  hero.settings.blobs = true;
  hero.settings.floor = true;
  hero.replayArrival();
  hero.update(0);
  let mesh = null;
  scene.traverse((o) => o.name === "hero floor heat (the floor's own glow)" && (mesh = o));
  const out = [];
  for (const at of times) {
    while (hero.arrival.t < at - 1e-6) hero.update(1 / 30);
    out.push({ t: hero.arrival.t, info: hero.floorInfo, visible: mesh.visible, pos: mesh.position.toArray().map(Math.round), scale: mesh.scale.toArray().map(Math.round), order: mesh.renderOrder, inScene: !!mesh.parent });
  }
  return out;
}, times);
for (const x of r) console.log(JSON.stringify(x));
await b.close();
