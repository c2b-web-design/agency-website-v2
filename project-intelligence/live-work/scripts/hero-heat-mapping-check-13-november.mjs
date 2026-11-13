// THE HEAT TEXTURE's MAPPING (13 November 2026; D-101). A glow seen left of and in front of a contact: is the texture mapped
// onto the field's columns, or off by a cell (or mirrored)? The bench's loop stopped and the scene NOT stepped: the heat
// texture is cleared and ONE texel lit at a known column (x, z), written the way `stepHeat` writes it (row size − 1 − z);
// the liquid hidden. The glow's brightness centroid on screen is compared with the column's world point projected.
// Two columns, so a mirror would show. ⚠ NOT WATCHED: the heat's dynamics (only its placement).
import { chromium } from "playwright";

const b = await chromium.launch({ channel: "chrome", args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-webgpu"] });
const p = await b.newPage({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 1 });
await p.goto("http://localhost:3000/proto/hero", { waitUntil: "load" });
await p.waitForSelector("[data-hero-backend]", { timeout: 60000 });
await p.waitForFunction(() => window.__heroBench?.hero?.arrival, null, { timeout: 60000 });
await p.waitForTimeout(3000);
await p.addStyleTag({ content: ".lil-gui, nextjs-portal { display: none !important; } [data-hero-bench] > div:not(.lil-gui) { display: none !important; }" });
for (const [cx, cz] of [[20, 20], [6, 9]]) {
  const proj = await p.evaluate(async ([cx, cz]) => {
    const { hero, renderer, scene, camera } = window.__heroBench;
    renderer.setAnimationLoop(null);
    hero.settings.blobs = true;
    hero.update(1 / 30); // makes the plane visible
    let plane = null;
    let view = null;
    scene.traverse((o) => {
      if (o.name === "hero floor heat") plane = o;
      if (o.isMesh && o.scale.x === 700) view = o;
    });
    view.visible = false;
    if (hero.logo) hero.logo.visible = false;
    if (hero.text) hero.text.visible = false;
    const tex = plane.material.map;
    const size = tex.image.width;
    const d = tex.image.data;
    d.fill(0);
    const o = 4 * (size * (size - 1 - cz) + cx);
    d[o] = 255; d[o + 1] = 100; d[o + 2] = 0;
    for (let k = 3; k < d.length; k += 4) d[k] = 255;
    tex.needsUpdate = true;
    camera.position.set(0, 1800, 900);
    camera.lookAt(0, -437.5, 0);
    camera.updateMatrixWorld();
    renderer.render(scene, camera);
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    const cell = 1400 / size;
    const world = { x: cx * cell - 700 + view.position.x, z: cz * cell - 700 + view.position.z };
    const v = new view.position.constructor(world.x, -437.5, world.z).project(camera);
    const c = document.querySelector("canvas").getBoundingClientRect();
    return { size, world, sx: c.left + ((v.x + 1) / 2) * c.width, sy: c.top + ((1 - v.y) / 2) * c.height };
  }, [cx, cz]);
  const buf = await p.screenshot();
  const centroid = await p.evaluate(async (b64) => {
    const img = new Image();
    img.src = "data:image/png;base64," + b64;
    await img.decode();
    const cv = new OffscreenCanvas(img.width, img.height);
    const g = cv.getContext("2d");
    g.drawImage(img, 0, 0);
    const d = g.getImageData(0, 0, img.width, img.height).data;
    let sx = 0, sy = 0, sw = 0;
    for (let i = 0; i < d.length; i += 4) {
      const w = d[i] - d[i + 2]; // the glow is warm; the grid is grey (r ≈ b)
      if (w < 30) continue;
      const k = i / 4;
      sx += (k % img.width) * w;
      sy += Math.floor(k / img.width) * w;
      sw += w;
    }
    return sw ? { x: +(sx / sw).toFixed(1), y: +(sy / sw).toFixed(1) } : null;
  }, buf.toString("base64"));
  console.log(`column (${cx}, ${cz}) world ${JSON.stringify(proj.world)}: projected ${proj.sx.toFixed(1)}, ${proj.sy.toFixed(1)}; glow centroid ${JSON.stringify(centroid)}`);
}
await b.close();
