// THE CLOTH's CLEARANCE OVER THE LOGO, MEASURED (20 November 2026; Carl: "Make sure that the bottom of the cloth is clear of
// the logos height"). The cloth's points read back from the GPU (`getArrayBufferAsync`) every 0.25 s for argv[2] seconds
// (default 20: two and a half of the sphere's passes) after "Cloth again", the bench live; each point to WORLD by the cloth
// group's matrix; the lowest against the landed logo's top (the rain's hit map, `rainInfo.map.topY`). READ-ONLY.
// ⚠ NOT WATCHED: the drawn mesh (each vertex the centre of four points — never lower than the lowest point).
import { chromium } from "playwright";
const SECS = Number(process.argv[2] ?? 20);
const b = await chromium.launch({ channel: "chrome", args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-webgpu"] });
const p = await b.newPage({ viewport: { width: 1896, height: 946 }, deviceScaleFactor: 1 });
await p.goto("http://localhost:3000/proto/hero", { waitUntil: "load" });
await p.waitForFunction(() => window.__heroBench?.hero?.warmed === true && window.__heroBench.hero.rainInfo?.map, null, { timeout: 180000 });
const r = await p.evaluate(async (SECS) => {
  const { hero, renderer, scene } = window.__heroBench;
  const group = scene.getObjectByName("hero cloth (the example)");
  // the cloth's own read-out (`hero-cloth.ts`, `points`)
  const posA = hero.cloth.points;
  if (!posA || !posA.count) throw new Error("positions not found");
  const N = posA.count;
  hero.cloth.again();
  const THREE_V = group.matrixWorld.elements;
  let low = Infinity, lowAt = 0, high = -Infinity;
  const t0 = performance.now();
  while (performance.now() - t0 < SECS * 1000) {
    await new Promise((res) => setTimeout(res, 250));
    group.updateMatrixWorld();
    const e = group.matrixWorld.elements;
    const a = new Float32Array(await renderer.getArrayBufferAsync(posA));
    const st = a.length / N;
    for (let i = 0; i < N; i++) {
      const x = a[i * st], y = a[i * st + 1], z = a[i * st + 2];
      const wy = e[1] * x + e[5] * y + e[9] * z + e[13];
      if (wy < low) { low = wy; lowAt = (performance.now() - t0) / 1000; }
      if (wy > high) high = wy;
    }
  }
  return { low, lowAt, high, topY: hero.rainInfo.map.topY, upc: hero.unitsPerCm, info: hero.cloth.info, m: Array.from(THREE_V).map((v) => Math.round(v * 10) / 10) };
}, SECS);
await b.close();
const cm = (u) => (u / r.upc).toFixed(1);
console.log(`cloth lowest point (world y): ${r.low.toFixed(1)} at ${r.lowAt.toFixed(1)} s; highest ${r.high.toFixed(1)}`);
console.log(`the landed logo's top (world y): ${r.topY}`);
console.log(`${r.low > r.topY ? "✅ CLEAR" : "⛔ NOT CLEAR"} by ${(r.low - r.topY).toFixed(1)} units = ${cm(r.low - r.topY)} cm (1 cm = ${r.upc.toFixed(2)} units)`);
console.log("cloth:", JSON.stringify(r.info));
