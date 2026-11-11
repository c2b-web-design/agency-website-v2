// THE BAKED TEXT AND THE FLY (11 November 2026; D-101). At HOME, Carl's window (1909 × 940): stills with the overlay ON and
// OFF (the 3D text should land on the page text); the text's scale (units per cm); then the keys: W held 1 s, D held 1 s
// — the camera must move; a side still from a set pose. ⚠ NOT WATCHED: the pad (no pad here); likeness judged by eye.
import { chromium } from "playwright";

const OUT = process.argv[2] ?? ".";
const b = await chromium.launch({ channel: "chrome", args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-webgpu"] });
const p = await b.newPage({ viewport: { width: 1909, height: 940 }, deviceScaleFactor: 1 });
const errors = [];
p.on("console", (m) => m.type() === "error" && errors.push(m.text().slice(0, 200)));
p.on("pageerror", (e) => errors.push(String(e).slice(0, 200)));
await p.goto("http://localhost:3000/proto/hero", { waitUntil: "load" });
await p.waitForSelector("[data-hero-backend]", { timeout: 60000 });
await p.waitForTimeout(4000);
const info = await p.evaluate(() => ({ unitsPerCm: window.__heroBench.hero.unitsPerCm, text: !!window.__heroBench.hero.text, pose: window.__heroBench.pose() }));
console.log("text:", JSON.stringify(info));
await p.evaluate(() => (window.__heroBench.settings.blobs = false));
await p.waitForTimeout(300);
await p.screenshot({ path: `${OUT}/baked-overlay-on.png`, clip: { x: 0, y: 300, width: 900, height: 420 } });
// the overlay off: the 3D text alone
await p.evaluate(() => {
  const o = [...document.querySelectorAll("h1")].pop().closest("div.pointer-events-none");
  o.style.display = "none";
});
await p.waitForTimeout(300);
await p.screenshot({ path: `${OUT}/baked-overlay-off.png`, clip: { x: 0, y: 300, width: 900, height: 420 } });
await p.evaluate(() => (window.__heroBench.settings.blobs = true));
// the keys
await p.mouse.click(1100, 200);
const before = await p.evaluate(() => window.__heroBench.pose());
await p.keyboard.down("KeyW");
await p.waitForTimeout(1000);
await p.keyboard.up("KeyW");
await p.keyboard.down("KeyD");
await p.waitForTimeout(1000);
await p.keyboard.up("KeyD");
await p.waitForTimeout(1500);
const after = await p.evaluate(() => window.__heroBench.pose());
console.log("before keys:", JSON.stringify(before));
console.log("after W 1 s, D 1 s:", JSON.stringify(after));
// a side view: from the right, level with the text's middle, looking along −x
await p.evaluate(() => {
  const { camera, controls } = window.__heroBench;
  camera.position.set(1800, -150, 400);
  controls.target.set(-900, -250, 0);
  controls.update();
});
await p.waitForTimeout(1500);
await p.screenshot({ path: `${OUT}/baked-side.png` });
console.log(`console errors: ${errors.length}`, errors);
await b.close();
