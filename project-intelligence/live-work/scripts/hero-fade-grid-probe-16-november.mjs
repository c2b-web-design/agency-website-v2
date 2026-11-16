// WHICH PART OF THE SOLID-LAYER FADE CHANGES THE FLOOR GRID? (16 November 2026, session 2; D-101). Measured: during the fade
// the bench's grid lines (a GridHelper, opaque lines) differ by up to 44 levels from after it, all over the floor, then snap
// back. After the opening (the opaque logo drawn), each part of the fade is switched on ALONE on the logo and the grid
// compared with the plain frame: (a) the depth child shown, (b) the logo's renderOrder 2, (c) its material transparent.
// A grid-only patch of floor, away from the logo and the text; the scene FROZEN (the loop stopped, frames drawn by hand).
// READ-ONLY (the page's state is changed for the probe only).
import { chromium } from "playwright";
const b = await chromium.launch({ channel: "chrome", args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-webgpu"] });
const p = await b.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
await p.goto("http://localhost:3000/proto/hero", { waitUntil: "load" });
await p.addStyleTag({ content: ".lil-gui, nextjs-portal { display: none !important; } [data-hero-bench] > div:not(.lil-gui) { display: none !important; }" });
await p.waitForFunction(() => window.__heroBench?.hero?.openingInfo?.done, null, { timeout: 120000, polling: 100 });
// THE SCENE FROZEN (the stills script's way): the loop stopped, every frame drawn by hand, time not advancing
await p.evaluate(() => window.__heroBench.renderer.setAnimationLoop(null));
const clip = { x: 780, y: 700, width: 220, height: 110 };
const grab = async () => {
  await p.evaluate(async () => {
    const { renderer, scene, camera } = window.__heroBench;
    for (let i = 0; i < 3; i++) {
      renderer.render(scene, camera);
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    }
  });
  return (await p.screenshot({ clip })).toString("base64");
};
const set = (k) =>
  p.evaluate((k) => {
    const s = window.__heroBench.hero.scene;
    const logo = s.getObjectByName("hero logo");
    const depth = logo.children.find((c) => c.name.includes("depth"));
    if (k === "plain") { depth.visible = false; logo.visible = true; logo.renderOrder = 0; logo.material.transparent = false; logo.material.alphaToCoverage = true; logo.material.needsUpdate = true; }
    if (k === "hidden") logo.visible = false;
    const clip = s.getObjectByName("hero liquid clip (floor)");
    const grid = s.children.find((o) => o.type === "GridHelper");
    if (k === "plain") { clip.visible = true; grid.renderOrder = 0; }
    if (k === "noClip") clip.visible = false;
    if (k === "gridFirst") grid.renderOrder = -1;
    if (k === "noA2C") { logo.material.alphaToCoverage = false; logo.material.needsUpdate = true; }
    if (k === "depth") depth.visible = true;
    if (k === "order") logo.renderOrder = 2;
    if (k === "transparent") { logo.material.transparent = true; logo.material.needsUpdate = true; }
    return { depth: depth.visible, order: logo.renderOrder, transparent: logo.material.transparent, visible: logo.visible, a2c: logo.material.alphaToCoverage };
  }, k);
const cmp = (a, b) =>
  p.evaluate(async ([a, b]) => {
    const load = (s) => new Promise((r) => { const i = new Image(); i.onload = () => r(i); i.src = "data:image/png;base64," + s; });
    const [A, B] = await Promise.all([load(a), load(b)]);
    const c = new OffscreenCanvas(A.width, A.height); const x = c.getContext("2d");
    x.drawImage(A, 0, 0); const da = x.getImageData(0, 0, A.width, A.height).data;
    x.drawImage(B, 0, 0); const db = x.getImageData(0, 0, A.width, A.height).data;
    let n = 0, max = 0;
    for (let i = 0; i < da.length; i += 4) { const d = Math.max(Math.abs(da[i] - db[i]), Math.abs(da[i + 1] - db[i + 1]), Math.abs(da[i + 2] - db[i + 2])); if (d) n++; max = Math.max(max, d); }
    return { n, max };
  }, [a, b]);
const plain = await grab();
console.log("plain again (null control):", JSON.stringify(await cmp(plain, await grab())));
for (const k of ["order", "hidden", "noClip", "gridFirst"]) {
  await set("plain");
  const base = await grab();
  const st = await set(k);
  console.log(`${k.padEnd(12)} ${JSON.stringify(st)} → grid vs plain: ${JSON.stringify(await cmp(base, await grab()))}`);
}
await b.close();
