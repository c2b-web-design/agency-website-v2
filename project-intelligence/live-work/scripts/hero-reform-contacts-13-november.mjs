// THE RE-FORMING's FACTS (13 November 2026, session 2; D-101). Carl: "The dance sequence should last about 7s. So after
// that if a blob touches the disc, it should take some mass and make its way to the logo. Almost all of the blobs touch
// the letter "c". That could be the entry point." READ-ONLY, frame-stepped (1/30 s) from the story's start, blobs and floor
// ON, the dance as committed (a549786). Per blob: its DISC TOUCHES (sphere bottom within half a radius of the floor, centre
// within the full disc, 480 units, of the centre; rising edges) and its touches of the MOULD's "c" (its sphere meets the
// c's world box: the mould's local x from min to min + C_SHARE of the width, the full height and depth; rising edges),
// over SECONDS of the emission. Also the field box against the mould (how much of the mould the liquid can reach).
// NOT WATCHED: the c's true ink (a box, not its shape); the field's merging reach beyond a sphere; the dance after SECONDS.
import { chromium } from "playwright";
const SECONDS = +(process.argv[2] ?? 30), C_SHARE = +(process.argv[3] ?? 0.33);
const b = await chromium.launch({ channel: "chrome", args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-webgpu"] });
const p = await b.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
await p.goto("http://localhost:3000/proto/hero", { waitUntil: "load" });
await p.waitForSelector("[data-hero-backend]", { timeout: 60000 });
await p.waitForFunction(() => window.__heroBench?.hero?.mould, null, { timeout: 60000 });
await p.waitForTimeout(3000);
const out = await p.evaluate(async ({ SECONDS, C_SHARE }) => {
  const { hero, renderer } = window.__heroBench;
  renderer.setAnimationLoop(null);
  hero.settings.blobs = true;
  hero.settings.floor = true;
  hero.replayArrival();
  const n = hero.settings.numBlobs, iso = hero.settings.isolation;
  const r = Math.sqrt(1.2 / ((Math.sqrt(n) - 1) / 4 + 1) / (iso + 12)) * 1400;
  const floorY = hero.lean.floorY;
  // the mould's corners → the world boxes of the whole mould and of its c
  const { matrix, bounds } = hero.mould;
  const V = bounds.min.constructor;
  const box = (x0, x1) => {
    const lo = [1e9, 1e9, 1e9], hi = [-1e9, -1e9, -1e9];
    for (const x of [x0, x1]) for (const y of [bounds.min.y, bounds.max.y]) for (const z of [bounds.min.z, bounds.max.z]) {
      const v = new V(x, y, z).applyMatrix4(matrix);
      [v.x, v.y, v.z].forEach((c, k) => { lo[k] = Math.min(lo[k], c); hi[k] = Math.max(hi[k], c); });
    }
    return { lo, hi };
  };
  const whole = box(bounds.min.x, bounds.max.x);
  const c = box(bounds.min.x, bounds.min.x + C_SHARE * (bounds.max.x - bounds.min.x));
  const dist = (pt, bx) => Math.hypot(...[0, 1, 2].map((k) => Math.max(bx.lo[k] - pt[k], 0, pt[k] - bx.hi[k])));
  const ev = [], inDisc = {}, inC = {};
  let emit0 = null;
  for (let i = 0; i < 4000; i++) {
    hero.update(1 / 30);
    const t = hero.arrival.t;
    if (emit0 === null && t >= hero.arrival.durationS) emit0 = hero.arrival.durationS;
    if (emit0 !== null && t - emit0 > SECONDS) break;
    for (const [id, x, y, z] of hero.blobs) {
      const d = y - r <= floorY + 0.5 * r && Math.hypot(x, z) <= 480;
      if (d && !inDisc[id]) ev.push({ k: "disc", id, t: t - emit0 });
      inDisc[id] = d;
      const cc = dist([x, y, z], c) <= r;
      if (cc && !inC[id]) ev.push({ k: "c", id, t: t - emit0, y: Math.round(y) });
      inC[id] = cc;
    }
  }
  return { r: Math.round(r), whole, c, ev, n };
}, { SECONDS, C_SHARE });
await b.close();
const f = (bx) => bx.lo.map((v, k) => `${["x", "y", "z"][k]} ${Math.round(v)}..${Math.round(bx.hi[k])}`).join(", ");
console.log(`blob radius ${out.r}; field box x -700..700, z -700..700 (centred on 0, its outer layer undrawn)`);
console.log(`mould (world): ${f(out.whole)}`);
console.log(`its c (first ${C_SHARE} of the width): ${f(out.c)}`);
for (let id = 0; id < out.n; id++) {
  const d = out.ev.filter((e) => e.id === id && e.k === "disc").map((e) => e.t.toFixed(1));
  const c = out.ev.filter((e) => e.id === id && e.k === "c").map((e) => e.t.toFixed(1));
  console.log(`blob ${id}: disc touches at ${d.join(", ") || "none"} | c touches at ${c.join(", ") || "none"}`);
}
