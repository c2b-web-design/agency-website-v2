// ⛔ THE WORKSHOP's STANDING MEASURE (9 November 2026, session 2; note `structural-note-bench-arch-removed-9-november.md`
// v2.1). One run = one state of the bench. Writes, into OUT (argv[2]):
//   blank.png / plain.png  — the page camera on `?blank=1` and the free camera without it, after the bench says drawn + 6 s
//   state.json             — world positions (the hero group, the logo, every light), the camera, the chain's units,
//                            the time to `drawn`, the longest frame gap in the first 8 s (the first-frame stall)
// Compare two runs with `workshop-compare-9-november.mjs`. ⚠ NOT WATCHED: phones, WebGL (this runs the WebGPU default on
// `?blank=1` and the bench's own default without), the third-person view, saved chains (a fresh profile: no storage).
import { chromium } from "file:///C:/Users/Carl Buckley/agency-website-v2/node_modules/playwright/index.mjs";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const OUT = process.argv[2];
if (!OUT) throw new Error("usage: node workshop-measure-9-november.mjs <outDir>");
mkdirSync(OUT, { recursive: true });
const b = await chromium.launch({ channel: "chrome", args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-webgpu", "--enable-features=Vulkan,WebGPU"] });
const state = {};
for (const [name, q] of [["blank", "?blank=1"], ["plain", ""]]) {
  const p = await b.newPage({ viewport: { width: 1909, height: 934 }, deviceScaleFactor: 1 });
  const errs = [];
  p.on("console", (m) => (m.type() === "error" || m.type() === "warning") && errs.push(`${m.type()}: ${m.text().slice(0, 160)}`));
  p.on("pageerror", (e) => errs.push(`pageerror: ${e.message.slice(0, 160)}`));
  // the frame-gap recorder from the first script on the page: every rAF gap for 8 s
  await p.addInitScript(() => {
    const t0 = performance.now();
    const gaps = [];
    let last = t0;
    const tick = (t) => {
      gaps.push([Math.round(t - t0), Math.round(t - last)]);
      last = t;
      if (t - t0 < 8000) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    window.__wsGaps = gaps;
    window.__wsT0 = t0;
    new MutationObserver(() => {
      const el = document.querySelector("[data-camera-bench]");
      if (el && el.getAttribute("data-camera-bench") === "drawn" && window.__wsDrawnAt === undefined) window.__wsDrawnAt = performance.now() - t0;
    }).observe(document, { subtree: true, attributes: true, childList: true });
  });
  await p.goto(`http://localhost:3000/proto/camera${q}`, { waitUntil: "load" });
  await p.waitForSelector('[data-camera-bench="drawn"]', { timeout: 60000 });
  await p.waitForTimeout(8500);
  const s = await p.evaluate(() => {
    const sc = window.__benchScene;
    sc?.updateMatrixWorld(true);
    const v = (e) => [e[12], e[13], e[14]].map((x) => +x.toFixed(4));
    const out = { lights: [], heroGroup: null, logo: null };
    sc?.traverse((o) => {
      if (o.isLight) out.lights.push({ type: o.type, intensity: o.intensity, world: v(o.matrixWorld.elements), visibleChain: (() => { for (let q = o; q; q = q.parent) if (!q.visible) return false; return true; })() });
      if (o.name === "hero logo") out.logo = { world: v(o.matrixWorld.elements), quat: o.getWorldQuaternion(new o.quaternion.constructor()).toArray().map((x) => +x.toFixed(5)) };
      if (o.name === "hero text") out.heroGroup = v(o.parent.matrixWorld.elements);
    });
    const c = window.__cameraBench;
    const gaps = window.__wsGaps;
    const longest = gaps.reduce((a, g) => (g[1] > a[1] ? g : a), [0, 0]);
    return { ...out, camera: c ? { at: c.at, fov: c.fov, mm: c.mm, units: c.units, chainUnits: c.chainUnits, d: c.d } : null, drawnAtMs: Math.round(window.__wsDrawnAt ?? -1), longestGap: { atMs: longest[0], ms: longest[1] }, frames8s: gaps.length };
  });
  await p.screenshot({ path: join(OUT, `${name}.png`) });
  state[name] = { ...s, console: errs };
  await p.close();
}
await b.close();
writeFileSync(join(OUT, "state.json"), JSON.stringify(state, null, 1));
console.log(JSON.stringify(state, null, 1));
