// THE CLOTH's FORWARD-MOST AND BACK-MOST POINTS (world z), MEASURED (20 November 2026, session 2; Carl: "Move the cloth back,
// out of the way"). As `hero-cloth-clearance-20-november.mjs`: the points read back from the GPU every 0.25 s for argv[2]
// seconds (default 20) after "Cloth again"; each to WORLD by the group's matrix. Reports the cloth's z range against the
// standing logo's world box (+z = toward the working camera). READ-ONLY.
// ⚠ NOT WATCHED: the drawn mesh (each vertex the centre of four points — inside the points' range); the logo mid-jump.
import { chromium } from "playwright";
const SECS = Number(process.argv[2] ?? 20);
const SKIP = Number(process.argv[3] ?? 5); // seconds after "Cloth again" not counted (the fall from flat: it starts horizontal)
const b = await chromium.launch({ channel: "chrome", args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-webgpu"] });
const p = await b.newPage({ viewport: { width: 1896, height: 946 }, deviceScaleFactor: 1 });
await p.goto("http://localhost:3000/proto/hero", { waitUntil: "load" });
await p.waitForFunction(() => window.__heroBench?.hero?.warmed === true && window.__heroBench.hero.rainInfo?.map, null, { timeout: 180000 });
const r = await p.evaluate(async ([SECS, SKIP]) => {
  const { hero, renderer, scene } = window.__heroBench;
  const group = scene.getObjectByName("hero cloth (the example)");
  const posA = hero.cloth.points;
  const N = posA.count;
  hero.cloth.again();
  let zMin = Infinity, zMax = -Infinity, zMaxLow = -Infinity;
  const t0 = performance.now();
  while (performance.now() - t0 < SECS * 1000) {
    await new Promise((res) => setTimeout(res, 250));
    if (performance.now() - t0 < SKIP * 1000) continue;
    group.updateMatrixWorld();
    const e = group.matrixWorld.elements;
    const a = new Float32Array(await renderer.getArrayBufferAsync(posA));
    const st = a.length / N;
    for (let i = 0; i < N; i++) {
      const x = a[i * st], y = a[i * st + 1], z = a[i * st + 2];
      const wy = e[1] * x + e[5] * y + e[9] * z + e[13];
      const wz = e[2] * x + e[6] * y + e[10] * z + e[14];
      if (wz < zMin) zMin = wz;
      if (wz > zMax) zMax = wz;
      // the part a 60 cm jump could reach: below the logo's raised top (+ a margin), world y < top + 100 cm
      if (wy < hero.rainInfo.map.topY + 100 * hero.unitsPerCm && wz > zMaxLow) zMaxLow = wz;
    }
  }
  // the standing logo's world box (its geometry's box through its world matrix)
  const logo = scene.getObjectByName("hero logo");
  logo.updateMatrixWorld();
  logo.geometry.computeBoundingBox();
  const bx = logo.geometry.boundingBox.clone().applyMatrix4(logo.matrixWorld);
  return { zMin, zMax, zMaxLow, upc: hero.unitsPerCm, topY: hero.rainInfo.map.topY, logoZ: [bx.min.z, bx.max.z], logoY: [bx.min.y, bx.max.y], groupZ: group.position.z };
}, [SECS, SKIP]);
await b.close();
const cm = (u) => (u / r.upc).toFixed(1);
console.log(`cloth group z ${r.groupZ.toFixed(2)}; points z range ${r.zMin.toFixed(1)} … ${r.zMax.toFixed(1)} (world) = ${cm(r.zMin - r.groupZ)} … +${cm(r.zMax - r.groupZ)} cm about its plane`);
console.log(`forward-most point within 100 cm above the logo's top: z ${r.zMaxLow.toFixed(1)} = +${cm(r.zMaxLow - r.groupZ)} cm forward of its plane`);
console.log(`the standing logo: z ${r.logoZ[0].toFixed(1)} … ${r.logoZ[1].toFixed(1)}, y ${r.logoY[0].toFixed(1)} … ${r.logoY[1].toFixed(1)} (world)`);
console.log(`gap, the cloth's forward-most low point to the logo's BACK: ${cm(r.logoZ[0] - r.zMaxLow)} cm (negative = in front of the back face)`);
