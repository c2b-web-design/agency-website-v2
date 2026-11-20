// WHICH OBJECT DRAWS WITH 0 VERTICES? (20 November 2026; the console's "Draw with a vertex count of 0 is unusual", flagged
// 18 November). three r185 (`RenderObject.getDrawParameters`) skips a draw only for count < 0, so an EMPTY geometry or a
// zero draw range is still sent to the GPU, and Chrome warns. The bench's backend `draw` is wrapped: every draw whose
// vertexCount is 0 is logged by object (name, type, parent) and story time, across the whole story frame-stepped (1/30 s)
// from the replay to 34 s, the bench's own draw each frame. READ-ONLY. ⚠ NOT WATCHED: the warm-up's compile draws (before the
// replay), other pages.
import { chromium } from "playwright";
const b = await chromium.launch({ channel: "chrome", args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-webgpu"] });
const p = await b.newPage({ viewport: { width: 1896, height: 946 }, deviceScaleFactor: 1 });
const warns = [];
p.on("console", (m) => /vertex count of 0/.test(m.text()) && warns.push(m.text().slice(0, 120)));
await p.goto("http://localhost:3000/proto/hero", { waitUntil: "load" });
await p.waitForFunction(() => window.__heroBench?.hero?.mould && window.__heroBench.hero.warmed === true, null, { timeout: 180000 });
const out = await p.evaluate(async () => {
  const { hero, renderer, scene, camera } = window.__heroBench;
  renderer.setAnimationLoop(null);
  const seen = new Map();
  let now = -1;
  const be = renderer.backend;
  const draw = be.draw.bind(be);
  be.draw = (ro, info) => {
    const d = ro.getDrawParameters();
    if (d && d.vertexCount === 0) {
      const o = ro.object;
      const key = `${o.name || "(unnamed)"} | ${o.type} | parent: ${o.parent?.name || o.parent?.type || "-"} | material: ${ro.material?.name || ro.material?.type} | index: ${ro.getIndex()?.count ?? "none"} | position: ${ro.geometry.attributes.position?.count ?? "none"} | drawRange: ${ro.drawRange.start}+${ro.drawRange.count}`;
      const e = seen.get(key) ?? { first: now, last: now, frames: 0 };
      e.last = now;
      e.frames++;
      seen.set(key, e);
    }
    return draw(ro, info);
  };
  hero.settings.blobs = true;
  hero.settings.floor = true;
  hero.replayArrival();
  hero.update(0);
  while (hero.arrival.t < 34) {
    hero.update(1 / 30);
    hero.compute(renderer);
    now = Math.round(hero.arrival.t * 100) / 100;
    renderer.render(scene, camera);
    if (Math.round(hero.arrival.t * 30) % 30 === 0) await new Promise((r) => requestAnimationFrame(r));
  }
  be.draw = draw;
  return [...seen].map(([k, v]) => ({ object: k, ...v }));
});
await b.close();
console.log(`zero-vertex draws, by object (story seconds):`);
for (const o of out) console.log(`  ${o.object}\n     from ${o.first} to ${o.last}, ${o.frames} draws`);
console.log(`console warnings seen: ${warns.length}`);
