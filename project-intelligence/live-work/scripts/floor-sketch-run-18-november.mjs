// The floor sketch (18 November 2026): runs a sketch script IN PLACE OF the example's own on threejs.org's
// webgpu_lights_projector page (the same three build and import map Carl's threejs.dev editor uses), and takes stills.
// For looking, not measuring: headless Chrome draws WebGPU in software (a few fps).
// Usage: node project-intelligence/live-work/scripts/floor-sketch-run-18-november.mjs <script.js> <outDir> <name> [camX,camY,camZ]
import { chromium } from "playwright";
import { readFileSync } from "node:fs";
const [, , scriptPath, out, name, cam] = process.argv;
const sketch = readFileSync(scriptPath, "utf8");
const URL = "https://threejs.org/examples/webgpu_lights_projector.html";
const b = await chromium.launch({ args: ["--enable-unsafe-webgpu"] });
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
const errors = [];
p.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
p.on("pageerror", (e) => errors.push(String(e)));
await p.route(URL, async (route) => {
  const res = await route.fetch();
  const html = await res.text();
  const a = html.indexOf('<script type="module">');
  const z = html.indexOf("</script>", a);
  if (a < 0 || z < 0) throw new Error("the example's module script was not found");
  let s = sketch;
  // an optional camera for the still (the sketch keeps the example's camera otherwise)
  if (cam) s = s.replace("camera.position.set( 7, 4, 1 );", `camera.position.set( ${cam} );`);
  await route.fulfill({ response: res, body: html.slice(0, a) + '<script type="module">\n' + s + "\n" + html.slice(z) });
});
await p.goto(URL, { waitUntil: "networkidle", timeout: 60000 });
await p.waitForTimeout(5000);
for (let i = 0; i < 2; i++) {
  await p.screenshot({ path: `${out}/${name}-${i}.png` });
  await p.waitForTimeout(3000);
}
console.log(errors.length ? "page errors:\n" + errors.join("\n") : "no page errors");
await b.close();
