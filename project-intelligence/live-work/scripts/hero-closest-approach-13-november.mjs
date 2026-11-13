// WHEN EACH BLOB COMES CLOSEST TO THE LOGO IN THE DANCE (13 November 2026; D-101). Carl: "Work backward from the blobs
// starting position in the dance ... If a blob is far away from the logo, mask it until its in its closest position. then
// have a blob emission come out to meet it - the shortest distance." Reads the SETTLED logo's world box (the story run to
// its settle) and, with the scene's own path formulas (the example's, the floor's re-scaled heights; radius at isolation 80,
// resolution 28, floor on, the field box's 12.5 lift), finds per blob over the first WINDOW seconds of the dance (from the
// emission's start, the dance at speed 1): the time of its closest approach to the logo's box and that gap (surface to
// surface: centre gap − its radius). ⚠ NOT WATCHED: the logo's real outline (its box is used); merges.
import { chromium } from "playwright";

const WINDOW = Number(process.argv[2] ?? 6);
const b = await chromium.launch({ channel: "chrome", args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-webgpu"] });
const p = await b.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
await p.goto("http://localhost:3000/proto/hero", { waitUntil: "load" });
await p.waitForSelector("[data-hero-backend]", { timeout: 60000 });
await p.waitForFunction(() => window.__heroBench?.hero?.mould, null, { timeout: 60000 });
const r = await p.evaluate((WINDOW) => {
  const { hero, renderer } = window.__heroBench;
  renderer.setAnimationLoop(null);
  hero.replayArrival();
  for (let f = 0; f < Math.ceil((hero.arrival.durationS - 0.05) * 30); f++) hero.update(1 / 30);
  hero.logo.updateMatrixWorld();
  const box = new hero.logo.geometry.boundingBox.constructor().setFromObject(hero.logo);
  const size = 28, n = 10, iso = 80, sub = 12, fieldY = 12.5;
  const strength = 1.2 / ((Math.sqrt(n) - 1) / 4 + 1);
  const radius = Math.sqrt(strength / (iso + sub));
  const low = 5 / size + 0.35 * radius;
  const world = (c, o) => (2 * c - 1) * 700 + o;
  const out = [];
  for (let i = 0; i < n; i++) {
    let best = { t: 0, gap: Infinity };
    for (let t = 0; t <= WINDOW; t += 0.02) {
      const tau = t * 0.5; // the dance's time at speed 1
      const x = Math.sin(i + 1.26 * tau * (1.03 + 0.5 * Math.cos(0.21 * i))) * 0.27 + 0.5;
      const dip = Math.abs(Math.cos(i + 1.12 * tau * Math.cos(1.22 + 0.1424 * i))) * 0.77;
      const y = low + (dip / 0.77) * (0.77 - low);
      const z = Math.cos(i + 1.32 * tau * 0.1 * Math.sin(0.92 + 0.53 * i)) * 0.27 + 0.5;
      const P = [world(x, 0), world(y, fieldY), world(z, 0)];
      const dx = Math.max(box.min.x - P[0], 0, P[0] - box.max.x);
      const dy = Math.max(box.min.y - P[1], 0, P[1] - box.max.y);
      const dz = Math.max(box.min.z - P[2], 0, P[2] - box.max.z);
      const gap = Math.hypot(dx, dy, dz) - radius * 1400;
      if (gap < best.gap) best = { t: +t.toFixed(2), gap: Math.round(gap), at: P.map(Math.round) };
    }
    out.push({ blob: i, ...best });
  }
  return { logoBox: { min: box.min.toArray().map(Math.round), max: box.max.toArray().map(Math.round) }, blobRadius: Math.round(radius * 1400), window: WINDOW, closest: out };
}, WINDOW);
console.log(JSON.stringify(r, null, 1));
await b.close();
