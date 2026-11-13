// WHEN DO THE BLOBS TOUCH THE FLOOR? (13 November 2026, session 2; D-101). Carl: the disc partly grown by the first blob,
// then fed by the blobs, "it doesnt have to be accurate by volume, just look as if it has". FRAME-STEPPED from the story's
// start (1/30 s), blobs and floor ON: per blob, each frame its sphere's bottom (centre y - visible radius) reaches the
// floor (FLOOR_Y + a tolerance), a CONTACT EVENT on the rising edge; logged with its time after the first birth, its
// distance from the disc's centre (the field's middle, world x 0, z 0) and whether that is inside the full disc.
// Births logged too. READ-ONLY: nothing in the scene is changed but the bench's loop (stopped) and the stepping.
// NOT WATCHED: the squash (a blob pressed flat may touch a little earlier than its sphere says); the merging into the pool
// before its sphere's bottom reaches the floor (the field joins them a little above it).
import { chromium } from "playwright";
const SECONDS_AFTER = +(process.argv[2] ?? 12);
const b = await chromium.launch({ channel: "chrome", args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-webgpu"] });
const p = await b.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
const errors = [];
p.on("pageerror", (e) => errors.push(String(e).slice(0, 200)));
await p.goto("http://localhost:3000/proto/hero", { waitUntil: "load" });
await p.waitForSelector("[data-hero-backend]", { timeout: 60000 });
await p.waitForFunction(() => window.__heroBench?.hero?.mould, null, { timeout: 60000 });
await p.waitForTimeout(3000);
const out = await p.evaluate(async (after) => {
  const { hero, renderer } = window.__heroBench;
  renderer.setAnimationLoop(null);
  hero.settings.blobs = true;
  hero.settings.floor = true;
  hero.replayArrival();
  const n = hero.settings.numBlobs, iso = hero.settings.isolation;
  const base = 1.2 / ((Math.sqrt(n) - 1) / 4 + 1);
  const rWorld = Math.sqrt(base / (iso + 12)) * 1400; // field 1 = 1400 world units (toField)
  const floorY = hero.lean.floorY;
  const TOL = 0.1 * rWorld;
  const touching = new Map(), seen = new Set(), events = [];
  let first = null, t = 0;
  const end = () => hero.arrival.durationS + 0.0;
  for (let i = 0; i < 2000; i++) {
    hero.update(1 / 30);
    t = hero.arrival.t;
    for (const [id, x, y, z] of hero.blobs) {
      if (!seen.has(id)) { seen.add(id); if (first === null) first = t; events.push({ kind: "born", id, t }); }
      const on = y - rWorld <= floorY + TOL;
      if (on && !touching.get(id)) events.push({ kind: "touch", id, t, dist: Math.round(Math.hypot(x, z)) });
      touching.set(id, on);
    }
    if (first !== null && t > first + after) break;
  }
  return { rWorld: Math.round(rWorld), first, durationS: end(), events };
}, SECONDS_AFTER);
await b.close();
console.log(`blob radius ${out.rWorld} units; emission at ${out.durationS} s; first birth ${out.first} s`);
const DISC = 480; // the full disc's reach (the pool's fade, D-101: thinning to nothing ~480 units out)
for (const e of out.events) console.log(e.kind === "born" ? `  ${(e.t - out.first).toFixed(2)} s  born  blob ${e.id}` : `  ${(e.t - out.first).toFixed(2)} s  TOUCH blob ${e.id}  ${e.dist} from centre ${e.dist <= DISC ? "(on the disc)" : "(off the disc)"}`);
console.log(`page errors: ${errors.length}`, errors);
