// THE PLINTH's NUMBERS (25 November 2026; Carl: "The total height of the logo and plinth should be the same as the text
// and subtext on the left ... the width of the plinth will be important"). READ-ONLY.
// The text's world box (headline + subtext), the logo's LANDED box (the mould pose dropped by `reform.dropCm`: where it
// stands from the end of phase 1 to phase 4), and both projected at HOME (1896 × 946 px, the bench's view).
// ⚠ NOT WATCHED: any camera but HOME; the logo's pose during the passes; the plinth itself (not built).
import { chromium } from "playwright";
const b = await chromium.launch({ channel: "chrome", args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-webgpu"] });
const p = await b.newPage({ viewport: { width: 1896, height: 946 }, deviceScaleFactor: 1 });
await p.goto("http://localhost:3000/proto/hero", { waitUntil: "load" });
await p.waitForFunction(() => window.__heroBench?.hero?.mould && window.__heroBench.hero.reform && window.__heroBench.hero.text, null, { timeout: 300000 });
const r = await p.evaluate(() => {
  const { hero, camera } = window.__heroBench;
  const V = camera.position.constructor;
  const M = camera.matrix.constructor;
  const upc = hero.unitsPerCm;
  const box = (geo, mat) => {
    const pa = geo.getAttribute("position");
    const lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
    const v = new V();
    for (let i = 0; i < pa.count; i++) {
      v.fromBufferAttribute(pa, i).applyMatrix4(mat);
      ["x", "y", "z"].forEach((k, j) => { lo[j] = Math.min(lo[j], v[k]); hi[j] = Math.max(hi[j], v[k]); });
    }
    return { lo, hi };
  };
  hero.text.updateMatrixWorld(true);
  const parts = hero.text.children.map((m) => box(m.geometry, m.matrixWorld));
  const text = { lo: [0, 1, 2].map((j) => Math.min(...parts.map((q) => q.lo[j]))), hi: [0, 1, 2].map((j) => Math.max(...parts.map((q) => q.hi[j]))) };
  const landed = new M().makeTranslation(0, -hero.reform.dropCm * upc, 0).multiply(hero.mould.matrix);
  const logo = box(hero.logo.geometry, landed);
  const FLOOR = -437.5;
  const cm = (v) => Math.round((v / upc) * 10) / 10;
  const desc = (bx) => ({ xCm: [cm(bx.lo[0]), cm(bx.hi[0])], bottomAboveFloorCm: cm(bx.lo[1] - FLOOR), topAboveFloorCm: cm(bx.hi[1] - FLOOR), zCm: [cm(bx.lo[2]), cm(bx.hi[2])], widthCm: cm(bx.hi[0] - bx.lo[0]), heightCm: cm(bx.hi[1] - bx.lo[1]), depthCm: cm(bx.hi[2] - bx.lo[2]) });
  // HOME (the bench's), 1896 × 946
  camera.position.set(0, -49.2, 2566.2);
  camera.aspect = 1896 / 946; camera.updateProjectionMatrix();
  const homeTarget = window.__heroBench.controls?.target;
  camera.lookAt(0, -49.2, 0); camera.updateMatrixWorld();
  const px = (x, y, z) => { const w = new V(x, y, z).project(camera); return [Math.round((w.x + 1) * 948), Math.round((1 - w.y) * 473)]; };
  const midZ = (bx) => (bx.lo[2] + bx.hi[2]) / 2;
  const scr = (bx) => ({ topLeft: px(bx.lo[0], bx.hi[1], midZ(bx)), bottomRight: px(bx.hi[0], bx.lo[1], midZ(bx)) });
  return { unitsPerCm: upc, fov: camera.fov, text: desc(text), logoLanded: desc(logo), screenAtHome: { text: scr(text), logo: scr(logo), floorUnderLogo: px((logo.lo[0] + logo.hi[0]) / 2, FLOOR, midZ(logo)) }, controlsTarget: homeTarget ? homeTarget.toArray() : null };
});
console.log(JSON.stringify(r, null, 1));
await b.close();
