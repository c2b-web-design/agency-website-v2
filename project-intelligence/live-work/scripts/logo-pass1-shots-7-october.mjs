/**
 * Frames of the mark bench — D-088 PASS 1 (the shape in clay), 7 October 2026. Plan: live-work/desk-mark-pass1-mesh-plan-7-october.md.
 *   node --no-warnings project-intelligence/live-work/scripts/logo-pass1-shots-7-october.mjs <set> [state …]
 *   <set> = the output folder's suffix: "baseline" (the 3 October mesh, step 1) or "pass1" (step 3's mesh).
 * Needs the dev server on :3000. Headed, real GPU, Carl's viewport (1412 × 700 @ 1.36), as the 3 October script.
 * Prints each state's junction-window readings (Architect A6) — the baseline's go into live-work/logo-pass1-baseline-7-october.md.
 */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";

const SET = process.argv[2] ?? "baseline";
const OUT = `project-intelligence/live-work/screenshots/logo-pass1-7-october/${SET}`;
mkdirSync(OUT, { recursive: true });
const STATES = {};
for (const view of ["front", "oblique", "junction"]) for (const mode of ["clay", "flat", "zebra"]) STATES[`${view}-${mode}`] = `view=${view}&mode=${mode}`;
Object.assign(STATES, {
  "junction-flat-noshadow": "view=junction&mode=flat&shadows=0",
  "junction-flat-wire": "view=junction&mode=flat&wire=1",
  side: "view=side", below: "view=below", roomsize: "view=roomsize",
});
const pick = process.argv.slice(3);
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const ctx = await b.newContext({ viewport: { width: 1412, height: 700 }, deviceScaleFactor: 1.36 });
const p = await ctx.newPage();
const errors = [];
p.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
p.on("pageerror", (e) => errors.push(String(e)));
const log = [];
for (const [name, q] of Object.entries(STATES)) {
  if (pick.length && !pick.includes(name)) continue;
  await p.goto(`http://localhost:3000/proto/logo?${q}`, { waitUntil: "networkidle" });
  await p.waitForFunction(() => window.__logoBench?.ready === true, null, { timeout: 120000 });
  await p.addStyleTag({ content: "nextjs-portal { display: none !important; }" }); // the dev badge sits over the panel
  await p.waitForTimeout(1500);
  await p.locator("div.relative.border").first().screenshot({ path: `${OUT}/${name}.png` });
  const info = await p.evaluate(() => ({ ms: window.__logoBench.buildMs, s: window.__logoBench.stats, j: window.__logoBench.junction, w: window.__logoBench.junctionWindow, cam: window.__logoBench.junctionCamera, canvases: document.querySelectorAll("canvas").length }));
  log.push({ name, ...info });
  console.log(`${name}: build ${info.ms.toFixed(0)} ms · tris ${info.s.triangles} · open ${info.s.openEdges} · canvases ${info.canvases} · junction: ${info.j.triangles} tris, normal ${info.j.maxNormalAngleDeg.toFixed(1)}°, dihedral max ${info.j.maxDihedralDeg.toFixed(1)}° p99 ${info.j.p99DihedralDeg.toFixed(1)}°`);
}
writeFileSync(`${OUT}/readings.json`, JSON.stringify({ set: SET, at: new Date().toISOString(), states: log, errors }, null, 2));
console.log(errors.length ? `console errors:\n${errors.join("\n")}` : "no console errors");
await b.close();
