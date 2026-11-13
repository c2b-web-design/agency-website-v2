// THE MOULD's SPACING AT HOME (13 November 2026; D-101). Carl: "Im looking for good spacing within the viewport when the
// blobs are gone." At Carl's window (1909 × 940 → 1401 × 695 layout px at the root zoom), blobs OFF, the logo settled: a
// still at Home, and the outline's on-screen box against the t of "built" (its right-most ink: the lean's contact, the
// crossbar's tip), the canvas's right edge, the panel's left edge, the top, and the floor line. Screen px (the screenshot's).
// ⚠ NOT WATCHED: other window shapes (the frame edge moves with the aspect); the settled logo's own place (it stands by the t).
import { chromium } from "playwright";

const OUT = process.argv[2] ?? ".";
const b = await chromium.launch({ channel: "chrome", args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-webgpu"] });
const p = await b.newPage({ viewport: { width: 1909, height: 940 }, deviceScaleFactor: 1 });
const errors = [];
p.on("pageerror", (e) => errors.push(String(e).slice(0, 200)));
await p.goto("http://localhost:3000/proto/hero", { waitUntil: "load" });
await p.waitForSelector("[data-hero-backend]", { timeout: 60000 });
await p.waitForFunction(() => window.__heroBench?.hero?.mould, null, { timeout: 60000 });
await p.evaluate(() => (window.__heroBench.hero.settings.blobs = false));
await p.waitForTimeout(6000);
const m = await p.evaluate(() => {
  const { hero, camera, scene } = window.__heroBench;
  let line = null;
  scene.traverse((o) => o.name === "hero mould outline (guide)" && (line = o));
  const c = document.querySelector("canvas").getBoundingClientRect();
  const proj = (v) => {
    const q = v.clone().project(camera);
    return [c.left + ((q.x + 1) / 2) * c.width, c.top + ((1 - q.y) / 2) * c.height];
  };
  const pos = line.geometry.getAttribute("position");
  const xs = [], ys = [];
  for (let i = 0; i < pos.count; i++) {
    const [x, y] = proj(new camera.position.constructor().fromBufferAttribute(pos, i).applyMatrix4(line.matrixWorld));
    xs.push(x);
    ys.push(y);
  }
  const t = proj(new camera.position.constructor(...hero.lean.contact));
  const floorAtMould = proj(new camera.position.constructor().setFromMatrixPosition(line.matrixWorld).setY(-437.5));
  const gui = document.querySelector(".lil-gui")?.getBoundingClientRect();
  const r = (v) => Math.round(v);
  const box = { left: r(Math.min(...xs)), right: r(Math.max(...xs)), top: r(Math.min(...ys)), bottom: r(Math.max(...ys)) };
  return { canvas: { w: r(c.width), h: r(c.height) }, outline: box, tRight: r(t[0]), gapTtoOutline: box.left - r(t[0]), gapOutlineToCanvasRight: r(c.right) - box.right, gapOutlineToPanel: gui ? r(gui.left) - box.right : null, topMargin: box.top - r(c.top), outlineBottomAboveFloor: r(floorAtMould[1]) - box.bottom };
});
console.log(JSON.stringify(m, null, 1));
await p.screenshot({ path: `${OUT}/mould-home.png` });
console.log(`page errors: ${errors.length}`, errors);
await b.close();
