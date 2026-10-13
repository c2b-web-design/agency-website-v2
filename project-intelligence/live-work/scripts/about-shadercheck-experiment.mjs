/** EXPERIMENT, NO CODE CHANGED (13 October 2026): would `checkShaderErrors = false` on `/about`'s room canvas shorten the gold
 *  button's wait? The profile (`about-coldload-profile.mjs`) put 3.7 s of a 6.8 s cold load in `getProgramInfoLog` (34
 *  calls) — the shader-error check three.js runs on each program's first use (`three.module.js` `onFirstUse`), which every
 *  canvas on the site switches off EXCEPT the room's (`about-card-canvas.tsx` `onCreated`). ⚠ The record is mixed: on
 *  `/start` it removed a 450 ms stall; elsewhere it "moved the ~900ms task by 0ms" (the wait moves to the program's first use).
 *  So it is SIMULATED in the test browser: the three queries that check makes (`getProgramInfoLog`, `getShaderInfoLog`,
 *  `getProgramParameter(LINK_STATUS)`) answer at once, as if the check were off — and the time to the gold button's swap and
 *  the long tasks are compared, alternating A (as is) / B (simulated), N runs each.
 *  ⚠ The simulation is exactly the check being off ONLY if nothing else asks for LINK_STATUS — three.js asks for it only
 *  inside that check (`onFirstUse`), read 13 October in three 0.185.1. Usage: node …/about-shadercheck-experiment.mjs [runs]
 *  ⚠ NOT WATCHED: production; Carl's GPU; whether a REAL shader error would then go unreported (it would — the known cost). */
import { chromium } from "playwright";
const RUNS = Number(process.argv[2] ?? 3);
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
async function run(simulate) {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.addInitScript((sim) => {
    window.__long = [];
    try { new PerformanceObserver((l) => l.getEntries().forEach((e) => window.__long.push([e.startTime, e.duration]))).observe({ type: "longtask", buffered: true }); } catch {}
    if (!sim) return;
    for (const P of [WebGLRenderingContext.prototype, WebGL2RenderingContext.prototype]) {
      P.getProgramInfoLog = () => "";
      P.getShaderInfoLog = () => "";
      const gp = P.getProgramParameter;
      P.getProgramParameter = function (prog, pname) { return pname === 0x8b82 /* LINK_STATUS */ ? true : gp.call(this, prog, pname); };
    }
  }, simulate);
  const p = await ctx.newPage();
  await p.goto("http://localhost:3000/about#start", { waitUntil: "load" });
  await p.waitForFunction(() => document.querySelector('#start a[href="/start"]')?.dataset.drawn === "1", null, { timeout: 60000 });
  const r = await p.evaluate(() => { const t = performance.now(); const L = window.__long.filter(([s]) => s < t); return { swap: t, longMs: L.reduce((s, [, d]) => s + d, 0), longMax: Math.max(0, ...L.map(([, d]) => d)) }; });
  await ctx.close();
  return r;
}
const A = [], B = [];
for (let i = 0; i < RUNS; i++) { A.push(await run(false)); B.push(await run(true)); }
const show = (n, xs) => console.log(`${n}: swap ${xs.map((x) => (x.swap / 1000).toFixed(2)).join(", ")} s · long tasks ${xs.map((x) => (x.longMs / 1000).toFixed(2)).join(", ")} s · longest ${xs.map((x) => (x.longMax / 1000).toFixed(2)).join(", ")} s`);
show("A as is            ", A);
show("B check simulated off", B);
console.log("⚠ NOT WATCHED: production; Carl's GPU; dev server.");
