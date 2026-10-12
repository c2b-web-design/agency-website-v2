/** THE BUTTON FAMILY'S PARITY CHECK — D-088, 12 October 2026 (plan v2, Q1; the Architect's point 1).
 *
 *  `components/ui/button-family-geometry.ts` is a deliberate, temporary COPY of `usePillGeometry` in
 *  `components/enquiry/nextstep-canvas.tsx` (private, live on /start). This checks the copy against
 *  the code that actually RUNS: both meshes are read out of live pages through three.js's own
 *  devtools hook (`window.__THREE_DEVTOOLS__` — every Scene announces itself on construction), so
 *  neither component is edited or imported here.
 *    A: /proto/nextstep — Next step's real mesh, 116.3 × 41.
 *    B: /proto/button?profile=nextstep — the family module's pill at Next step's size, under Next step's
 *       own cross-section (NEXTSTEP_PROFILE). ⚠ Since take 3 (12 October) the family's DEFAULT profile has a
 *       smaller rim and differs from Next step BY DESIGN; this checks the BUILDER, not the family's shape.
 *  Compared: vertex count, positions, normals, uvs (max abs difference), index (exact).
 *
 *  ⚠ NOT WATCHED, and printed with the verdict: any width but 116.3 (the ~129 px `Who we are` pill
 *  agrees by identical logic, not by this measurement); the materials, lights and env (geometry
 *  only); Next step inside the /start corridor (the bench page's mesh is the same hook).
 *  Run: node project-intelligence/live-work/scripts/family-geometry-parity.mjs  (dev server on :3000)
 */
import { chromium } from "playwright";

const TOL = 1e-5;

async function readPill(page, url, wantWidth) {
  await page.addInitScript(() => {
    window.__THREE_DEVTOOLS__ = new EventTarget();
    window.__scenes = [];
    window.__THREE_DEVTOOLS__.addEventListener("observe", (e) => {
      if (e.detail && e.detail.isScene) window.__scenes.push(e.detail);
    });
  });
  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForFunction(() => window.__scenes.some((s) => { let n = 0; s.traverse((o) => { if (o.isMesh) n++; }); return n > 0; }), null, { timeout: 30000 });
  await page.waitForTimeout(1500);
  return page.evaluate((want) => {
    const meshes = [];
    for (const s of window.__scenes) s.traverse((o) => { if (o.isMesh && o.geometry?.attributes?.position) meshes.push(o); });
    const withWidth = meshes.map((m) => { m.geometry.computeBoundingBox(); const b = m.geometry.boundingBox; return { m, w: b.max.x - b.min.x }; });
    // The pill whose span is nearest the wanted width (the grid starts exactly at -w/2, so span ≈ w).
    withWidth.sort((a, b) => Math.abs(a.w - want) - Math.abs(b.w - want));
    const pick = withWidth[0];
    if (!pick) return null;
    const g = pick.m.geometry;
    return {
      meshes: meshes.length,
      span: pick.w,
      position: Array.from(g.attributes.position.array),
      normal: Array.from(g.attributes.normal.array),
      uv: Array.from(g.attributes.uv.array),
      index: Array.from(g.index.array),
    };
  }, wantWidth);
}

const maxDiff = (a, b) => { let m = 0; for (let i = 0; i < a.length; i++) m = Math.max(m, Math.abs(a[i] - b[i])); return m; };

const browser = await chromium.launch({ headless: true, args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const A = await readPill(await ctx.newPage(), "http://localhost:3000/proto/nextstep", 116.3);
// ⚠ NEGATIVE CONTROL: PARITY_CONTROL=1 reads the ~129 px Who we are pill as B — the check MUST go red.
const B = await readPill(await ctx.newPage(), "http://localhost:3000/proto/button?profile=nextstep", process.env.PARITY_CONTROL ? 200 : 116.3);
await browser.close();

if (!A || !B) {
  console.log(`⛔ NO VERDICT — a mesh was not found (Next step: ${!!A}, family: ${!!B}). The instrument did not see its subject.`);
  process.exit(3);
}
const rows = [
  ["vertices", A.position.length / 3, B.position.length / 3, A.position.length === B.position.length ? 0 : Infinity],
  ["indices", A.index.length, B.index.length, A.index.length === B.index.length && A.index.every((v, i) => v === B.index[i]) ? 0 : Infinity],
];
const same = A.position.length === B.position.length;
const dPos = same ? maxDiff(A.position, B.position) : Infinity;
const dNrm = same ? maxDiff(A.normal, B.normal) : Infinity;
const dUv = same ? maxDiff(A.uv, B.uv) : Infinity;
console.log(`Next step (live):   span ${A.span.toFixed(3)} px, ${A.position.length / 3} vertices, ${A.index.length} indices  [${A.meshes} mesh(es) in scene]`);
console.log(`Family (at 116.3):  span ${B.span.toFixed(3)} px, ${B.position.length / 3} vertices, ${B.index.length} indices  [${B.meshes} mesh(es) in scene]`);
console.log(`max |Δ| position ${dPos.toExponential(2)}   normal ${dNrm.toExponential(2)}   uv ${dUv.toExponential(2)}   index ${rows[1][3] === 0 ? "identical" : "DIFFERENT"}`);
const pass = rows.every((r) => r[3] === 0) && dPos <= TOL && dNrm <= TOL && dUv <= TOL;
console.log(pass
  ? "✅ VERDICT — the family module and the live Next step build IDENTICAL geometry at 116.3 × 41."
  : "⛔ VERDICT — the two copies DIFFER. The family has two shapes. Stop.");
console.log("   ⚠ NOT WATCHED: any other width (Who we are's ~129 px agrees by identical logic, not by this check);\n     materials, lights, env; Next step inside the /start corridor.");
process.exit(pass ? 0 : 1);
