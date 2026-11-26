// THE FLOWING OPENING: DOES THE 2D SIT ON THE 3D FACE? (26 November 2026; Carl: "the faces should be in the exact same
// position. The ice blue colour should match."). READ-ONLY. The dev bench at Carl's window (1896 x 946, DPR 1), HOME. Two
// states: FLAT (the opening replayed, its first step: the headline's depth ~0, the subtext's 3D not yet shown) and DEEP (the
// opening done: everything full depth — the faces stay where they were, the sides added behind). Each state shot twice: the
// HTML 2D alone (the canvas hidden) and the 3D alone (the HTML hidden). Out (argv[2]): {flat,deep}-{html,3d}.png.
// ⚠ NOT WATCHED: other window sizes (the 3D's layout is measured at this one: `hero-bench.tsx`, `FLOW_INK`'s header).
import { chromium } from "playwright";
const [OUT = ".", VW = "1896", VH = "946"] = process.argv.slice(2);
const b = await chromium.launch({ channel: "chrome", args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-webgpu", "--hide-scrollbars"] });
const p = await b.newPage({ viewport: { width: Number(VW), height: Number(VH) }, deviceScaleFactor: 1 });
await p.goto("http://localhost:3000/proto/hero", { waitUntil: "load" });
await p.waitForFunction(() => window.__heroBench?.hero?.warmed === true, null, { timeout: 300000 });
await p.addStyleTag({ content: ".lil-gui, nextjs-portal { display: none !important; } [data-hero-bench] > div:not(.lil-gui) { display: none !important; }" });
await p.waitForTimeout(500);
const setup = () =>
  p.evaluate(() => {
    const { renderer } = window.__heroBench;
    renderer.setAnimationLoop(null);
    const L = document.getElementById("hero-flow-2d");
    L.style.display = "block";
    for (const el of L.querySelectorAll("*")) {
      el.getAnimations().forEach((a) => a.finish());
      el.style.transition = "none";
      el.style.opacity = "1";
    }
  });
const step = (until) =>
  p.evaluate(async (until) => {
    const { hero, renderer, scene, camera } = window.__heroBench;
    camera.position.set(0, -49.2, 2566.2);
    camera.fov = 45;
    camera.updateProjectionMatrix();
    camera.lookAt(0, 0, 0);
    hero.openingAgain();
    for (let i = 0; i < 4000; i++) {
      hero.update(1 / 60);
      hero.compute(renderer);
      if (until === "flat" ? hero.openingInfo.t > 0 : hero.openingInfo.subDone[0] && hero.openingInfo.subDone[1]) break;
    }
    renderer.render(scene, camera);
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    return hero.openingInfo;
  }, until);
const show = (html, canvas) =>
  p.evaluate(({ html, canvas }) => {
    document.getElementById("hero-flow-2d").style.visibility = html ? "visible" : "hidden";
    document.querySelector("[data-hero-bench] canvas").style.visibility = canvas ? "visible" : "hidden";
  }, { html, canvas });
await setup();
console.log("boxes", JSON.stringify(await p.evaluate(() => {
  const r = (sel) => { const q = document.querySelector(sel).getBoundingClientRect(); return [q.left, q.top, q.width, q.height].map((v) => Math.round(v * 10) / 10); };
  return { canvas: r("[data-hero-bench] canvas"), stage: r("#hero-flow-stage") };
})));
for (const st of ["flat", "deep"]) {
  const info = await step(st);
  console.log(st, JSON.stringify({ t: info.t, headDepth: info.headDepth, done: info.done }));
  await show(true, false);
  await p.screenshot({ path: `${OUT}/${st}-html.png` });
  await show(false, true);
  await p.screenshot({ path: `${OUT}/${st}-3d.png` });
}
await b.close();
