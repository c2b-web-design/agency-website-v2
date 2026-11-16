// HOW FAST WOULD AN OPENING MATERIAL COMPILE? (16 November 2026; D-101). READ-ONLY, nothing on the page changes. A FRESH
// browser; once the logo has been drawn, two STAND-INS for the lean's look are compiled COLD with `compileAsync` on a copy
// of the logo mesh (not in the scene) and timed to completion, with the page's longest frame gap meanwhile:
//   (1) the logo's own class (MeshPhysicalNodeMaterial) with NONE of the phase nodes: the family red, the metal's
//       metalness / roughness, the STUDIO's reflection (the lean's: harden 1, cooled 0), the logo's own light list;
//   (2) the same as MeshStandardNodeMaterial (its parent class).
// ⚠ NOT WATCHED: whether either looks identical to the lean (a candidate's look is Carl's eye, not this script); r185's
// node graph read for the studio texture (`envNode` internals — diagnosis only); Carl's Chrome.
import { chromium } from "playwright";
const b = await chromium.launch({ channel: "chrome", args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-webgpu"] });
const p = await b.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
const errors = [];
p.on("pageerror", (e) => errors.push(String(e).slice(0, 200)));
await p.goto("http://localhost:3000/proto/hero", { waitUntil: "load" });
await p.waitForFunction(() => window.__heroBench?.hero?.arrival?.t > 1, null, { timeout: 120000, polling: 500 });
const out = await p.evaluate(async () => {
  const { hero, renderer, scene, camera } = window.__heroBench;
  const logo = hero.logo;
  const full = logo.material;
  // the studio's PMREM node: envNode = mix(mix(courtyard, STUDIO, harden), judging, cooled) — found by walking the graph
  // for PMREM nodes in order (courtyard, studio, judging)
  const pmrems = [];
  const seen = new Set();
  const walk = (n, d) => {
    if (!n || typeof n !== "object" || seen.has(n) || d > 8) return;
    seen.add(n);
    if (n.isPMREMNode) pmrems.push(n);
    for (const k of Object.keys(n)) if (k !== "parent" && k !== "_cache") walk(n[k], d + 1);
  };
  walk(full.envNode, 0);
  const texOf = (n) => n?._value ?? n?.value ?? null;
  const studioTex = texOf(pmrems[1]);
  const pmremList = pmrems.map((n) => { const t = texOf(n); return t ? `${t.constructor.name} ${t.image?.width ?? "?"}×${t.image?.height ?? "?"} ${t.name ?? ""}` : "?"; });
  const Physical = full.constructor;
  const Standard = Object.getPrototypeOf(Physical);
  const make = (Cls) => {
    const m = new Cls({ color: full.color.clone(), metalness: full.metalness, roughness: full.roughness });
    m.envMap = studioTex;
    m.envMapIntensity = full.envMapIntensity;
    m.envMapRotation.copy(full.envMapRotation);
    m.lightsNode = full.lightsNode;
    // a FRESH program each time (the cache keys on the generated code, not the name): a tiny unique emissive constant
    m.emissive.setRGB(0, 0, Math.random() * 1e-6);
    return m;
  };
  const time = async (label, Cls) => {
    const mesh = logo.clone();
    mesh.material = make(Cls);
    mesh.matrixAutoUpdate = false;
    mesh.matrix.copy(logo.matrix);
    mesh.visible = true;
    let gap = 0;
    let last = performance.now();
    let on = true;
    const watch = (t) => {
      gap = Math.max(gap, t - last);
      last = t;
      if (on) requestAnimationFrame(watch);
    };
    requestAnimationFrame(watch);
    const t0 = performance.now();
    await renderer.compileAsync(mesh, camera, scene);
    const ms = Math.round(performance.now() - t0);
    on = false;
    mesh.material.dispose();
    return { label, ms, longestFrameGapMs: Math.round(gap) };
  };
  return {
    studioFound: !!studioTex,
    pmremNodes: pmremList,
    studio: studioTex ? `${studioTex.constructor.name} ${studioTex.image?.width}×${studioTex.image?.height}` : null,
    classes: [Physical.name, Standard.name],
    results: [await time("physical, no phase nodes", Physical), await time("standard, no phase nodes", Standard), await time("physical again (fresh constant)", Physical)],
  };
});
await b.close();
console.log(JSON.stringify(out, null, 1));
console.log(`page errors: ${errors.length}`, errors.slice(0, 3));
console.log("⚠ Playwright's Chrome, fresh profile; compile time only (the look is not judged here)");
