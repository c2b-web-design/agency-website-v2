/** FILM 04 PASS 1 — the bench measured (22 October 2026, session 2). Plan v4.1's Verification 2, 3 and 5.
 *  Reads `window.__showcaseBench` on /proto/showcase: the font proof (kern-off gaps vs the outline file's advances), the
 *  kerning (kern-on minus kern-off), the stats; then the edge's effect on the SILHOUETTE gaps (default vs ?bevel=0).
 *  ⚠ NOT WATCHED: how it LOOKS (stills are taken for the eye, not judged here); any font but geist-semibold; any words
 *  but the ones given; GPU timing beyond the build's own main-thread ms.
 *    node …/film04-pass1-measure-22-october.mjs [base=http://localhost:3000] [shotDir]   */
import { chromium } from "playwright";
const BASE = process.argv[2] ?? "http://localhost:3000";
const SHOTS = process.argv[3];
const VP = { width: 1920, height: 1080 };
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });

async function read(q) {
  const p = await (await b.newContext({ viewport: VP, deviceScaleFactor: 1 })).newPage();
  const errors = [];
  p.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  p.on("pageerror", (e) => errors.push(String(e)));
  await p.goto(`${BASE}/proto/showcase${q}`, { waitUntil: "networkidle" });
  await p.waitForFunction(() => window.__showcaseBench && (window.__showcaseBench.ready || window.__showcaseBench.fontCheck?.stops.length), null, { timeout: 30000 }).catch(() => {});
  await p.waitForTimeout(400);
  const r = await p.evaluate(() => JSON.parse(JSON.stringify(window.__showcaseBench ?? null)));
  const zoom = await p.evaluate(() => document.documentElement.currentCSSZoom ?? 1);
  const scrollW = await p.evaluate(() => [document.documentElement.scrollWidth, innerWidth]);
  return { p, r, errors, zoom, scrollW };
}

const A = await read("");
const c = A.r?.fontCheck, s = A.r?.stats;
console.log(`page zoom ${A.zoom} · scrollWidth ${A.scrollW[0]} vs innerWidth ${A.scrollW[1]} ${A.scrollW[0] > A.scrollW[1] ? "⛔ SIDEWAYS SCROLL" : "✅ no sideways scroll"}`);
console.log(`console errors: ${A.errors.length ? A.errors.join(" | ") : "none"}`);
if (!c) { console.log("⛔ no fontCheck — the bench never measured"); await b.close(); process.exit(1); }
console.log(`font "${c.family}" loaded: ${c.faceLoaded}`);
console.log(`font proof: ${c.proof.ok ? "✅" : "⛔"} worst ${c.proof.worstPx.toFixed(4)} px at "${c.proof.worstChar}", right edge ${c.proof.rightEdgeResidualPx.toFixed(4)} px, tolerance ${c.proof.tolerancePx}, uniform ${c.proof.uniform}`);
console.log(`kerned pairs ${c.kernedPairs} of ${c.kerns.length}: ${c.kerns.map((k) => `${k.pair} ${k.kernPx.toFixed(3)}`).join(" · ")}`);
console.log(`stops: ${c.stops.length ? c.stops.join(" | ") : "none"}`);
if (s) {
  console.log(`mesh: ${s.triangles} tris, build ${s.buildMs.toFixed(1)} ms, ${s.widthPx.toFixed(1)} × ${s.heightPx.toFixed(1)} px, missing ${JSON.stringify(s.missing)}`);
  console.log(`silhouette gaps (edge on): ${s.pairs.map((p) => `${p.pair} ${p.visibleGapPx.toFixed(2)}`).join(" · ")}`);
}
if (SHOTS) await A.p.screenshot({ path: `${SHOTS}/showcase-front-clay.png` });

const B = await read("?bevel=0");
const s0 = B.r?.stats;
if (s && s0) {
  const d = s.pairs.map((p, i) => ({ pair: p.pair, d: p.visibleGapPx - s0.pairs[i].visibleGapPx }));
  const worst = d.reduce((m, x) => (Math.abs(x.d) > Math.abs(m.d) ? x : m), { pair: "", d: 0 });
  console.log(`edge on: ${s.triangles} tris, spec bevel ${JSON.stringify(A.r.spec.bevel)} · edge off: ${s0.triangles} tris, spec bevel ${JSON.stringify(B.r.spec.bevel)} ${s.triangles !== s0.triangles ? "✅ the two builds differ" : "⛔ SAME BUILD — the comparison proves nothing"}`);
  console.log(`silhouette gaps (edge off): ${s0.pairs.map((p) => `${p.pair} ${p.visibleGapPx.toFixed(2)}`).join(" · ")}`);
  console.log(`edge on − off: worst ${worst.d.toFixed(3)} px at ${worst.pair} ${Math.abs(worst.d) <= 0.5 ? "✅ within 0.5 px — the edge holds the outline" : "⛔ beyond 0.5 px"}`);
}
await b.close();
