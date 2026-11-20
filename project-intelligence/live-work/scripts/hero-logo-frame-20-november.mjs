// THE STANDING LOGO's WORLD FRAME, CHECKED (20 November 2026, session 2): its vertices through its world matrix (not the
// geometry's box, which a rotation inflates), its parent chain, against the rain's hit-map top (`rainInfo.map.topY`) that
// the 20 November clearance used. READ-ONLY. ⚠ NOT WATCHED: anything but the standing pose ~30 s after warm-up.
import { chromium } from "playwright";
const b = await chromium.launch({ channel: "chrome", args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-webgpu"] });
const p = await b.newPage({ viewport: { width: 1896, height: 946 }, deviceScaleFactor: 1 });
await p.goto("http://localhost:3000/proto/hero", { waitUntil: "load" });
await p.waitForFunction(() => window.__heroBench?.hero?.warmed === true && window.__heroBench.hero.rainInfo?.map, null, { timeout: 180000 });
await new Promise((r) => setTimeout(r, 30000));
const r = await p.evaluate(() => {
  const { hero, scene } = window.__heroBench;
  const logo = scene.getObjectByName("hero logo");
  const chain = [];
  for (let o = logo; o; o = o.parent) chain.push({ name: o.name, type: o.type, pos: o.position.toArray().map((v) => +v.toFixed(2)), auto: o.matrixAutoUpdate });
  scene.updateMatrixWorld(true);
  const pos = logo.geometry.attributes.position;
  const v = logo.position.clone();
  const lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i).applyMatrix4(logo.matrixWorld);
    const a = v.toArray();
    for (let k = 0; k < 3; k++) { lo[k] = Math.min(lo[k], a[k]); hi[k] = Math.max(hi[k], a[k]); }
  }
  return { chain, lo, hi, topY: hero.rainInfo.map.topY, upc: hero.unitsPerCm, story: hero.reformInfo ?? null };
});
console.log(JSON.stringify({ chain: r.chain, lo: r.lo.map((x) => +x.toFixed(1)), hi: r.hi.map((x) => +x.toFixed(1)), topY: r.topY, upc: r.upc }, null, 1));
console.log(`height ${((r.hi[1] - r.lo[1]) / r.upc).toFixed(1)} cm; thickness ${((r.hi[2] - r.lo[2]) / r.upc).toFixed(1)} cm; width ${((r.hi[0] - r.lo[0]) / r.upc).toFixed(1)} cm`);
await b.close();
