/**
 * Frames of the mark bench (D-088 chunk 1), one per state — for the Builder's own look and the checkpoint.
 *   node --no-warnings project-intelligence/live-work/scripts/logo-bench-shots-3-october.mjs [state …]
 * Needs the dev server on :3000. Headed, real GPU, Carl's viewport (1412 × 700 @ 1.36), as the other 3 October scripts.
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const OUT = "project-intelligence/live-work/screenshots/logo-bench-3-october";
mkdirSync(OUT, { recursive: true });
const STATES = {
  oblique: "view=oblique",
  front: "view=front",
  "front-overlay": "view=front&overlay=0.5",
  "front-target": "view=front&overlay=1",
  side: "view=side",
  below: "view=below",
  roomsize: "view=roomsize",
  "oblique-room": "view=oblique&light=room",
  "front-mask": "view=front&mask=1",
};
const pick = process.argv.slice(2);
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const ctx = await b.newContext({ viewport: { width: 1412, height: 700 }, deviceScaleFactor: 1.36 });
const p = await ctx.newPage();
const errors = [];
p.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
p.on("pageerror", (e) => errors.push(String(e)));
for (const [name, q] of Object.entries(STATES)) {
  if (pick.length && !pick.includes(name)) continue;
  await p.goto(`http://localhost:3000/proto/logo?${q}`, { waitUntil: "networkidle" });
  await p.waitForFunction(() => window.__logoBench?.ready === true, null, { timeout: 120000 });
  await p.addStyleTag({ content: "nextjs-portal { display: none !important; }" }); // the dev badge sits over the panel
  await p.waitForTimeout(1500); // env map + a few frames
  const panel = p.locator("div.relative.border").first();
  await panel.screenshot({ path: `${OUT}/${name}.png` });
  const info = await p.evaluate(() => ({ ms: window.__logoBench.buildMs, s: window.__logoBench.stats, canvases: document.querySelectorAll("canvas").length }));
  console.log(`${name}: build ${info.ms.toFixed(0)} ms · tris ${info.s.triangles} · open ${info.s.openEdges} · canvases ${info.canvases}`);
}
console.log(errors.length ? `console errors:\n${errors.join("\n")}` : "no console errors");
await b.close();
