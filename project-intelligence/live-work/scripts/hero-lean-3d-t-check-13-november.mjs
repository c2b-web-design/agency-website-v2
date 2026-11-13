// THE LOGO ON THE 3D t (13 November 2026; D-101). Reads the scene's lean checks (`__heroBench.hero.lean`): the contact in
// the scene, the measured vs recorded contact (sketch cm), the lowest point vs FLOOR_Y, the width in units and cm. Stills,
// blobs OFF: at HOME (full frame); close on the contact from the camera's side; from the right, level, along the lean.
// ⚠ NOT WATCHED: likeness to the sketch (Carl's eye); the blobs' paths against the logo; the frame cost.
import { chromium } from "playwright";

const OUT = process.argv[2] ?? ".";
const b = await chromium.launch({ channel: "chrome", args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-webgpu"] });
const p = await b.newPage({ viewport: { width: 1909, height: 940 }, deviceScaleFactor: 1 });
const errors = [];
p.on("console", (m) => m.type() === "error" && errors.push(m.text().slice(0, 200)));
p.on("pageerror", (e) => errors.push(String(e).slice(0, 200)));
await p.goto("http://localhost:3000/proto/hero", { waitUntil: "load" });
await p.waitForSelector("[data-hero-backend]", { timeout: 60000 });
await p.waitForFunction(() => window.__heroBench?.hero?.lean, null, { timeout: 60000 });
const info = await p.evaluate(() => ({ backend: window.__heroBench.backend, unitsPerCm: window.__heroBench.hero.unitsPerCm, lean: window.__heroBench.hero.lean }));
console.log(JSON.stringify(info, null, 1));
await p.evaluate(() => (window.__heroBench.settings.blobs = false));
await p.waitForTimeout(800);
await p.screenshot({ path: `${OUT}/lean-home.png` });
const [cx, cy, cz] = info.lean.contact;
const view = async (name, pos, target) => {
  await p.evaluate(
    ({ pos, target }) => {
      const { camera, controls } = window.__heroBench;
      camera.position.set(...pos);
      controls.target.set(...target);
      controls.update();
    },
    { pos, target },
  );
  await p.waitForTimeout(1000);
  await p.screenshot({ path: `${OUT}/${name}.png` });
};
// close, from the camera's side, a little right and above the contact
await view("lean-close", [cx + 500, cy + 150, cz + 1400], [cx + 200, cy - 150, cz]);
// from the right, level with the contact, along −x: the lean's profile
await view("lean-side", [cx + 2200, cy - 150, cz - 200], [cx, cy - 250, cz - 200]);
console.log(`console errors: ${errors.length}`, errors);
await b.close();
