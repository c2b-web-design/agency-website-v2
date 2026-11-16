// THE OPENING AS STILLS (16 November 2026; D-101; `hero-scene.ts`, `OPENING`). A fresh browser, the bench LIVE (the opening
// waits on the real build, so it cannot be frame-stepped): a still every `EVERY` ms from the first frame to 2 s after the
// leaning logo has faded in, into argv 2, each named by the opening's clock. For LOOKING (the screenshots cost frames: the
// timings are `hero-opening-measure-16-november.mjs`'s). The panel and meter hidden. READ-ONLY.
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
const [OUT, EVERY = "700"] = process.argv.slice(2);
mkdirSync(OUT, { recursive: true });
const b = await chromium.launch({ channel: "chrome", args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-webgpu"] });
const p = await b.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
await p.goto("http://localhost:3000/proto/hero", { waitUntil: "load" });
await p.addStyleTag({ content: ".lil-gui, nextjs-portal { display: none !important; } [data-hero-bench] > div:not(.lil-gui) { display: none !important; }" });
await p.waitForFunction(() => window.__heroBench?.hero?.openingInfo, null, { timeout: 120000, polling: 100 });
let doneAt = null;
for (let i = 0; i < 200; i++) {
  const o = await p.evaluate(() => window.__heroBench.hero.openingInfo);
  const tag = `${String(i).padStart(3, "0")}_t${o.t.toFixed(1)}${o.fadeAtS >= 0 ? `_fade${o.logoOpacity.toFixed(2)}` : ""}${o.done ? "_done" : ""}`;
  await p.screenshot({ path: `${OUT}/${tag}.png` });
  if (o.done && doneAt === null) doneAt = Date.now();
  if (doneAt !== null && Date.now() - doneAt > 2000) break;
  await p.waitForTimeout(+EVERY);
}
await b.close();
console.log("stills written");
