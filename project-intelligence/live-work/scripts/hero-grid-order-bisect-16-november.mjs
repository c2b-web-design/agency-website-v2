// WHAT IN THE LOGO's DRAW CHANGES THE GRID DRAWN AFTER IT? (16 November 2026, session 2; D-101). Carl: "At the end of the
// fade there is a flick ... From home its noticable by looking at the gridlines on the floor. It looks as if something is
// switched off. its instant". Measured: the opaque logo drawn BEFORE the bench's grid changes the grid's distant lines (up
// to 44 levels). The scene FROZEN (the loop stopped, frames drawn by hand), after the opening: each variant is set on the
// logo and the grid patch compared with the logo HIDDEN (the true grid). A variant equal to "hidden" does not cause it.
// READ-ONLY (the page's state is changed for the probe only).
import { chromium } from "playwright";
const b = await chromium.launch({ channel: "chrome", args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-webgpu"] });
const p = await b.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
await p.goto("http://localhost:3000/proto/hero", { waitUntil: "load" });
await p.addStyleTag({ content: ".lil-gui, nextjs-portal { display: none !important; } [data-hero-bench] > div:not(.lil-gui) { display: none !important; }" });
await p.waitForFunction(() => window.__heroBench?.hero?.openingInfo?.done, null, { timeout: 120000, polling: 100 });
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
const cmp = (a, b) =>
  p.evaluate(async ([a, b]) => {
    const load = (s) => new Promise((r) => { const i = new Image(); i.onload = () => r(i); i.src = "data:image/png;base64," + s; });
    const [A, B] = await Promise.all([load(a), load(b)]);
    const c = new OffscreenCanvas(A.width, A.height); const x = c.getContext("2d");
    x.drawImage(A, 0, 0); const da = x.getImageData(0, 0, A.width, A.height).data;
    x.drawImage(B, 0, 0); const db = x.getImageData(0, 0, A.width, A.height).data;
    let n = 0, max = 0, sum = 0;
    for (let i = 0; i < da.length; i += 4) { const d = Math.max(Math.abs(da[i] - db[i]), Math.abs(da[i + 1] - db[i + 1]), Math.abs(da[i + 2] - db[i + 2])); if (d) n++; max = Math.max(max, d); sum += db[i] - da[i]; }
    return { n, max, brighterBy: Math.round(sum) };
  }, [a, b]);
// set up: keep the logo's real material; variants are applied to a CLONE so each starts clean
await p.evaluate(() => {
  const s = window.__heroBench.scene;
  const logo = s.getObjectByName("hero logo");
  window.__probe = { logo, real: logo.material, depth: logo.children.find((c) => c.name.includes("depth")) };
});
const variant = (k) =>
  p.evaluate((k) => {
    const { logo, real, depth } = window.__probe;
    logo.visible = true;
    logo.material = real;
    depth.visible = false;
    window.__probe.geo ??= logo.geometry;
    logo.geometry = window.__probe.geo;
    if (k === "noDepthWrite") { const m = real.clone(); m.customProgramCacheKey = () => `probe-ndw`; m.depthWrite = false; logo.material = m; return k; }
    if (k === "tinyTriangle") {
      const G = window.__probe.geo.constructor;
      const A = window.__probe.geo.attributes.position.constructor;
      const g = new G();
      g.setAttribute("position", new A(new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]), 3));
      g.setAttribute("normal", new A(new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1]), 3));
      logo.geometry = g;
      return k;
    }
    if (k === "invisibleDraw") { const m = real.clone(); m.customProgramCacheKey = () => `probe-inv`; m.colorWrite = false; m.depthWrite = false; m.depthTest = false; logo.material = m; return k; }
    if (k === "speck") { window.__probe.m0 ??= logo.matrix.clone(); logo.matrix.copy(window.__probe.m0); logo.matrix.scale({ x: 0.001, y: 0.001, z: 0.001 }); logo.matrixWorldNeedsUpdate = true; return k; }
    if (k === "unspeck") { logo.matrix.copy(window.__probe.m0); logo.matrixWorldNeedsUpdate = true; return k; }
    if (k === "nonIndexed") { window.__probe.ni ??= window.__probe.geo.toNonIndexed(); logo.geometry = window.__probe.ni; return k; }
    if (k === "bbox") { const g = window.__probe.geo; g.computeBoundingBox(); const bb = g.boundingBox; return JSON.stringify({ min: bb.min.toArray().map((v) => Math.round(v)), max: bb.max.toArray().map((v) => Math.round(v)), verts: g.attributes.position.count, index: g.index?.count, indexType: g.index?.array.constructor.name, drawRange: g.drawRange, groups: g.groups.length }); }
    if (k === "hidden") logo.visible = false;
    if (k === "real") return k;
    if (k === "basic") {
      const m = depth.material.clone();
      m.colorWrite = true; m.transparent = false; m.depthWrite = true; m.colorNode = null;
      logo.material = m;
      return k;
    }
    const m = real.clone();
    m.customProgramCacheKey = () => `probe-${k}-${Math.random()}`;
    if (k === "noEnv") { m.envNode = null; m.envMap = null; }
    if (k === "noLights") m.lightsNode = null;
    if (k === "noMask") m.maskNode = null;
    if (k === "noPosition") m.positionNode = null;
    if (k === "noOpacity") { m.opacityNode = null; m.alphaToCoverage = false; }
    if (k === "noClearcoat") { m.clearcoat = 0; m.clearcoatNode = null; m.clearcoatRoughnessNode = null; m.clearcoatNormalNode = null; }
    if (k === "noOutput") { m.outputNode = null; m.colorNode = null; m.emissiveNode = null; }
    logo.material = m;
    return k;
  }, k);
await variant("hidden");
const truth = await grab();
await variant("hidden");
console.log("hidden vs hidden (null control):", JSON.stringify(await cmp(truth, await grab())));
for (const k of ["real", "invisibleDraw", "speck", "unspeck"]) {
  const r = await variant(k);
  if (k === "bbox") { console.log("the logo's geometry:", r); continue; }
  const g = await grab();
  console.log(`${k.padEnd(12)} grid vs the true grid: ${JSON.stringify(await cmp(truth, g))}`);
}
await b.close();
