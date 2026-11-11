// THE COURTYARD ENVIRONMENT (11 November 2026; D-101): at Home, the blobs in shiny, chrome, liquid under the courtyard,
// then shiny under the castle; console errors. ⚠ NOT WATCHED: how it reads — stills for the eye only.
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
for (const m of ["shiny", "chrome", "liquid"]) {
  await p.evaluate((m) => window.__heroBench.hero.setMaterial(m), m);
  await p.waitForTimeout(1500);
  await p.screenshot({ path: `${OUT}/env-courtyard-${m}.png`, clip: { x: 600, y: 150, width: 900, height: 650 } });
}
await p.evaluate(() => {
  window.__heroBench.hero.setMaterial("shiny");
  window.__heroBench.hero.setEnvironment("castle");
});
await p.waitForTimeout(1500);
await p.screenshot({ path: `${OUT}/env-castle-shiny.png`, clip: { x: 600, y: 150, width: 900, height: 650 } });
console.log(`console errors: ${errors.length}`, errors);
await b.close();
