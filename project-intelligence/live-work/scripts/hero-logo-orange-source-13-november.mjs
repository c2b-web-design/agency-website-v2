// WHERE THE LOGO's ORANGE COMES FROM, BLOBS OFF (13 November 2026; D-101). Carl: the blobs off, "the light is still on".
// Blobs off, close on the logo; reports every light's visibility, then four stills changing ONE thing each: as is; the
// orange point light at intensity 0 (a null control if it is already hidden); then ALSO the logo's env map removed. Crops compared by
// mean R, G, B over the logo's box. ⚠ NOT WATCHED: the text's warmth (the logo only); Carl's window and density.
import { chromium } from "playwright";

const OUT = process.argv[2] ?? ".";
const b = await chromium.launch({ channel: "chrome", args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-webgpu"] });
const p = await b.newPage({ viewport: { width: 1909, height: 940 }, deviceScaleFactor: 1 });
const errors = [];
p.on("pageerror", (e) => errors.push(String(e).slice(0, 200)));
await p.goto("http://localhost:3000/proto/hero", { waitUntil: "load" });
await p.waitForSelector("[data-hero-backend]", { timeout: 60000 });
await p.waitForFunction(() => window.__heroBench?.hero?.lean, null, { timeout: 60000 });
await p.evaluate(() => {
  const { hero, camera, controls } = window.__heroBench;
  hero.settings.blobs = false;
  const [x, y, z] = hero.lean.contact;
  camera.position.set(x + 900, y - 50, z + 1500);
  controls.target.set(x + 150, y - 250, z);
  controls.update();
});
await p.waitForTimeout(800);
const lights = await p.evaluate(() => {
  const out = [];
  window.__heroBench.scene.traverse((o) => o.isLight && out.push({ type: o.type, colour: "#" + o.color.getHexString(), intensity: o.intensity, visible: o.visible }));
  return out;
});
console.log("lights, blobs off:", JSON.stringify(lights));
const shots = {};
const take = async (name, fn) => {
  await p.evaluate(fn);
  await p.waitForTimeout(600);
  const box = await p.evaluate(() => {
    const { hero, camera } = window.__heroBench;
    const bb = new hero.logo.geometry.boundingBox.constructor().setFromObject(hero.logo);
    const c = document.querySelector("canvas").getBoundingClientRect();
    const xs = [], ys = [];
    for (let i = 0; i < 8; i++) {
      const v = bb.min.clone();
      if (i & 1) v.x = bb.max.x;
      if (i & 2) v.y = bb.max.y;
      if (i & 4) v.z = bb.max.z;
      v.project(camera);
      xs.push(c.left + ((v.x + 1) / 2) * c.width);
      ys.push(c.top + ((1 - v.y) / 2) * c.height);
    }
    return { x: Math.max(0, Math.min(...xs)), y: Math.max(0, Math.min(...ys)), width: Math.max(...xs) - Math.min(...xs), height: Math.max(...ys) - Math.min(...ys) };
  });
  const buf = await p.screenshot({ path: `${OUT}/orange-${name}.png`, clip: box });
  const rgb = await p.evaluate(async (b64) => {
    const img = new Image();
    img.src = "data:image/png;base64," + b64;
    await img.decode();
    const cv = new OffscreenCanvas(img.width, img.height);
    const g = cv.getContext("2d");
    g.drawImage(img, 0, 0);
    const d = g.getImageData(0, 0, img.width, img.height).data;
    let r = 0, gg = 0, bb = 0, n = 0;
    for (let i = 0; i < d.length; i += 4) {
      if (d[i] + d[i + 1] + d[i + 2] < 40) continue; // the background
      r += d[i]; gg += d[i + 1]; bb += d[i + 2]; n++;
    }
    return { r: +(r / n).toFixed(1), g: +(gg / n).toFixed(1), b: +(bb / n).toFixed(1), px: n };
  }, buf.toString("base64"));
  shots[name] = rgb;
};
await take("as-is", () => {});
// the scene's update re-sets the point light each frame: hide it by intensity instead
await take("point-zero", () => window.__heroBench.scene.traverse((o) => o.isPointLight && (o.intensity = 0)));
await take("no-env", () => {
  const m = window.__heroBench.hero.logo.material;
  window.__savedEnv = m.envMap;
  m.envMap = null;
  m.needsUpdate = true;
});
console.log(JSON.stringify(shots, null, 1));
console.log(`page errors: ${errors.length}`, errors);
await b.close();
