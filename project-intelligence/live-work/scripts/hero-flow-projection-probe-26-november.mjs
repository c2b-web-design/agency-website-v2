// WHERE THE CAMERA SAYS THE 3D HEADLINE IS, AGAINST WHERE ITS LIT PIXELS ARE (26 November 2026), with the site's scrollbar
// gutter and without: the headline's world box projected by the bench's own camera onto its canvas, and the screenshot's
// leftmost lit pixel in the headline's band. READ-ONLY.
import { chromium } from "playwright";
import { execFileSync } from "node:child_process";
const [OUT = "."] = process.argv.slice(2);
const b = await chromium.launch({ channel: "chrome", args: ["--enable-unsafe-webgpu", "--enable-gpu", "--use-angle=d3d11", "--ignore-gpu-blocklist"] });
for (const gutter of [true, false]) {
  const p = await b.newPage({ viewport: { width: 1896, height: 946 }, deviceScaleFactor: 1 });
  await p.goto("http://localhost:3000/proto/hero", { waitUntil: "load" });
  if (!gutter) await p.addStyleTag({ content: "html{scrollbar-gutter:auto!important}" });
  await p.waitForFunction(() => window.__heroBench?.hero?.warmed === true, null, { timeout: 300000 });
  await p.addStyleTag({ content: ".lil-gui, nextjs-portal { display: none !important; } [data-hero-bench] > div:not(.lil-gui) { display: none !important; } #hero-flow-2d{visibility:hidden!important}" });
  const proj = await p.evaluate(async () => {
    const { hero, renderer, scene, camera } = window.__heroBench;
    renderer.setAnimationLoop(null);
    hero.openingAgain();
    for (let i = 0; i < 600 && !hero.openingInfo.done; i++) { hero.update(1 / 60); hero.compute(renderer); }
    renderer.render(scene, camera);
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    const head = scene.children.find((o) => o.isGroup && o.children.length === 2 && o.children[0].isMesh && o.children[0].material?.name?.startsWith("hero text"))?.children[0];
    if (!head) return { error: "no headline mesh" };
    head.geometry.computeBoundingBox();
    const bb = head.geometry.boundingBox;
    const c = renderer.domElement.getBoundingClientRect();
    const pt = (x, y, z) => { const v = bb.min.clone().set(x, y, z).project(camera); return [Math.round(c.left + ((v.x + 1) / 2) * c.width), Math.round(c.top + ((1 - v.y) / 2) * c.height)]; };
    return { canvas: [c.left, c.width, c.height], minCorner: pt(bb.min.x, bb.max.y, bb.max.z), aspect: camera.aspect };
  });
  const shot = `${OUT}/proj-${gutter ? "gutter" : "none"}.png`;
  await p.screenshot({ path: shot });
  const raw = execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-i", shot, "-f", "rawvideo", "-pix_fmt", "gray", "-"], { maxBuffer: 64 << 20 });
  let left = 1e9;
  for (let y = 395; y < 460; y++) for (let x = 0; x < 1300; x++) if (raw[y * 1896 + x] > 110) left = Math.min(left, x);
  console.log(gutter ? "gutter   " : "no gutter", JSON.stringify(proj), "lit left", left);
  await p.close();
}
await b.close();
