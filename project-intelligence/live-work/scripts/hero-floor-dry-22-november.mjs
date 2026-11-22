// THE WEB FLOOR DRIES WITH THE LOGO, TIMED (22 November 2026, session 3; Carl: "After each contact, the web floor should
// shrink until the last contact makes it disappear completely."). Frame-stepped (1/30 s): the story replayed from the lean,
// nothing pressed (the passes baked in); each change of the contact count with its story time, and the web's shown share
// (`floorDryInfo.shown`) and the floor's slot-3 extent and strength (`floorInfo`) 0.5 s and `shrinkS` + 0.1 s after it;
// at the end, whether the floor is drawn. READ-ONLY.
// ⚠ NOT WATCHED: the drawn floor (pixels); live playback; whether the count matches the cloth's real contacts (it counts
// the landings).
import { chromium } from "playwright";
const b = await chromium.launch({ channel: "chrome", args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-webgpu"] });
const p = await b.newPage({ viewport: { width: 1896, height: 946 }, deviceScaleFactor: 1 });
const errors = [];
p.on("pageerror", (e) => errors.push(String(e).slice(0, 300)));
await p.goto("http://localhost:3000/proto/hero", { waitUntil: "load" });
await p.waitForFunction(() => window.__heroBench?.hero?.warmed === true, null, { timeout: 300000 });
const r = await p.evaluate(() => {
  const { hero, renderer } = window.__heroBench;
  renderer.setAnimationLoop(null);
  hero.replayArrival(); hero.update(0);
  const out = [];
  let last = -1, t = 0, watch = [];
  const fi = () => hero.floorInfo ?? null;
  for (let f = 1; f <= 30 * 90; f++) {
    hero.update(1 / 30); hero.compute(renderer); t = f / 30;
    const d = hero.floorDryInfo;
    if (d.contacts !== last) { last = d.contacts; out.push({ t, what: `contact ${d.contacts}`, shown: d.shown }); watch.push([t + 0.5, d.contacts], [t + hero.floorDry.shrinkS + 0.1, d.contacts]); }
    for (const w of watch.filter((w) => Math.abs(w[0] - t) < 1 / 60)) { const F = fi(); out.push({ t, what: `  after contact ${w[1]}`, shown: d.shown, extent: F?.extents?.[2], strength: F?.strengths?.[2], visible: F?.visible }); }
    if (hero.pass2Info.pass4Done && t > out[out.length - 1].t + 3) break;
  }
  const F = fi();
  return { out, end: { t, shown: hero.floorDryInfo.shown, extent: F?.extents?.[2], visible: F?.visible } };
});
for (const q of r.out) console.log(`${q.t.toFixed(2).padStart(6)} s ${q.what.padEnd(18)} shown ${q.shown}${q.extent === undefined ? "" : `  slot-3 extent ${q.extent}, strength ${q.strength}, floor drawn ${q.visible}`}`);
console.log(`end ${r.end.t.toFixed(1)} s: shown ${r.end.shown}, slot-3 extent ${r.end.extent}, floor drawn ${r.end.visible}`);
await b.close();
console.log(`page errors: ${errors.length}`, errors.slice(0, 5));
