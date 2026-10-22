/** FILM 04 PASS 1 TAKE 2 — the arch's tracking found by measurement (22 October 2026, session 2). Plan v2.1 §3 and
 *  Verification 1–5 (`live-work/film04-pass1-take2-arch-plan-22-october.md`).
 *   1. RED RUN: `?archtrack=0` — the collision check must report at least one collision (expected: a–n).
 *   2. THE SWEEP: `__showcaseBench.probe(em)` from 0 to 0.3 in 0.005 steps — the SAME layout and check, positions derived
 *      from the reading (letter-spacing adds index × tracking × size). The smallest value with no collision and every pair
 *      ≥ the margin is the take.
 *   3. CONFIRMED by a real browser reading at that value (re-measured, not derived).
 *   4. REGRESSION: `?layout=line` must still give take 1's numbers (R-088: 13,676 triangles, the same gaps); take 3
 *      (capitals) adds take 2's lowercase at `?caps=0&archtrack=0.16` (a–n 0.0211 em, radius 1.5152 em).
 *  ⚠ NOT WATCHED: how it LOOKS; any words but the defaults; GPU frame time (layout and check ms are main-thread only).
 *    node …/film04-arch-tracking-22-october.mjs [base=http://localhost:3000]   */
import { chromium } from "playwright";
const BASE = process.argv[2] ?? "http://localhost:3000";
const VP = { width: 1920, height: 1080 };
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });

async function open(q) {
  const p = await (await b.newContext({ viewport: VP, deviceScaleFactor: 1 })).newPage();
  const errors = [];
  p.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  p.on("pageerror", (e) => errors.push(String(e)));
  await p.goto(`${BASE}/proto/showcase${q}`, { waitUntil: "networkidle" });
  await p.waitForFunction(() => window.__showcaseBench && (window.__showcaseBench.ready || window.__showcaseBench.fontCheck?.stops.length), null, { timeout: 30000 }).catch(() => {});
  await p.waitForTimeout(300);
  return { p, errors };
}
const read = (p) => p.evaluate(() => JSON.parse(JSON.stringify({ ...window.__showcaseBench, probe: undefined })));
const em = (px) => (px / 160).toFixed(4);
const describe = (r) => (r.collisions ? `⛔ ${r.collisions} collision(s), worst ${r.worst.pair}` : r.tight ? `⚠ ${r.tight} tight, worst ${r.worst.pair} ${em(r.worst.clearancePx)} em` : `✅ clear, closest ${r.worst ? `${r.worst.pair} ${em(r.worst.clearancePx)} em` : "—"}`);

// 1. the red run
const A = await open("?archtrack=0");
const a = await read(A.p);
const fc = a.fontCheck;
console.log(`console errors: ${A.errors.length ? A.errors.join(" | ") : "none"}`);
for (const l of fc.lines) console.log(`"${l.words}": font proof ${l.proof.ok ? "✅" : "⛔"} worst ${l.proof.worstPx.toFixed(4)} px · kerned ${l.kernedPairs} of ${l.kerns.length}: ${l.kerns.map((k) => `${k.pair} ${k.kernPx.toFixed(2)}`).join(" · ")}`);
const c0 = a.stats.collisions;
console.log(`RED RUN (archtrack 0): ${c0.collisions} collision(s): ${c0.pairs.filter((p) => p.collide).map((p) => p.pair).join(", ") || "none"} · tight: ${c0.pairs.filter((p) => !p.collide && p.clearancePx < c0.marginPx).map((p) => `${p.pair} ${em(p.clearancePx)}`).join(", ") || "none"}`);
console.log(`  ${c0.collisions > 0 ? "✅ the check fires" : "⛔ NO COLLISION at 0 — examine the check before trusting it"}${c0.pairs.some((p) => p.collide && /a–n|n–a/i.test(p.pair)) ? " (a–n among them, as the Architect estimated)" : " (a–n NOT among them)"}`);
console.log(`  radius ${a.stats.arch.radiusPx.toFixed(1)} px (${em(a.stats.arch.radiusPx)} em) · feet ${a.stats.arch.feetDeg.map((d) => d.toFixed(3)).join("° / ")}° · layout ${a.stats.arch.layoutMs.toFixed(2)} ms · check ${c0.checkMs.toFixed(1)} ms (${c0.tested} pairs tested) · build ${a.stats.buildMs.toFixed(1)} ms, ${a.stats.triangles} tris`);

// 2. the sweep
const sweep = await A.p.evaluate(() => {
  const out = [];
  for (let i = 0; i <= 60; i++) out.push(window.__showcaseBench.probe(i * 0.005));
  return out;
});
let pick = null;
for (const r of sweep) {
  if (r.trackEm * 1000 % 25 === 0 || (!pick && !r.collisions && !r.tight)) console.log(`  probe ${r.trackEm.toFixed(3)} em: ${describe(r)} · radius ${em(r.radiusPx)} em`);
  if (!pick && !r.collisions && !r.tight) pick = r;
}
if (!pick) { console.log("⛔ STOP: no tracking up to 0.3 em clears every pair"); await b.close(); process.exit(1); }
console.log(`PICK: ${pick.trackEm.toFixed(3)} em (the smallest clearing every pair by ≥ 0.02 em)`);

// 3. confirmed by a real reading
const B = await open(`?archtrack=${pick.trackEm}`);
const bb = await read(B.p);
const cb = bb.stats.collisions;
console.log(`CONFIRMED (real reading at ${pick.trackEm}): ${describe(cb)} · ${cb.collisions === pick.collisions && cb.tight === pick.tight ? "✅ matches the probe" : "⛔ DIFFERS from the probe"} (probe closest ${em(pick.worst.clearancePx)}, real ${cb.worst ? em(cb.worst.clearancePx) : "—"} em)`);
for (const l of bb.fontCheck.lines) console.log(`  "${l.words}": proof ${l.proof.ok ? "✅" : "⛔"} · kerned ${l.kernedPairs} of ${l.kerns.length} (tracking subtracted): ${l.kerns.map((k) => `${k.pair} ${k.kernPx.toFixed(2)}`).join(" · ")}`);
console.log(`  feet ${bb.stats.arch.feetDeg.map((d) => d.toFixed(3)).join("° / ")}° ${Math.abs(bb.stats.arch.feetDeg[0] - 180) < 0.1 && Math.abs(bb.stats.arch.feetDeg[1]) < 0.1 ? "✅" : "⛔"} · radius ${em(bb.stats.arch.radiusPx)} em · lockup ${bb.stats.widthPx.toFixed(1)} × ${bb.stats.heightPx.toFixed(1)} px · stops: ${bb.fontCheck.stops.length ? bb.fontCheck.stops.join(" | ") : "none"}`);
console.log(`  console errors: ${B.errors.length ? B.errors.join(" | ") : "none"}`);
const scroll = await B.p.evaluate(() => [document.documentElement.scrollWidth, innerWidth]);
console.log(`  scrollWidth ${scroll[0]} vs ${scroll[1]} ${scroll[0] > scroll[1] ? "⛔ SIDEWAYS SCROLL" : "✅"}`);

// 4. take 1, unchanged
const L = await open("?layout=line");
const l = await read(L.p);
const R088 = { tris: 13676, gaps: "Yo -6.09 · ou 15.85 · ur 22.48 · co 9.30 · om 15.85 · mp 19.77 · pa 12.24 · an 13.29 · ny 9.30" };
const gaps = l.stats.pairs.map((p) => `${p.pair} ${p.visibleGapPx.toFixed(2)}`).join(" · ");
console.log(`REGRESSION ?layout=line: ${l.stats.triangles} tris ${l.stats.triangles === R088.tris ? "✅" : "⛔"} · gaps ${gaps === R088.gaps ? "✅ identical to R-088" : `⛔ ${gaps}`}`);
const T2 = await open("?caps=0&steps=font&archtrack=0.16");
const t2 = await read(T2.p);
const w2 = t2.stats.collisions.worst;
const T3 = await open("?steps=font&archtrack=0.26");
const t3 = await read(T3.p);
console.log(`REGRESSION take 3 (?steps=font&archtrack=0.26): closest ${t3.stats.collisions.worst.pair} ${em(t3.stats.collisions.worst.clearancePx)} em, radius ${em(t3.stats.arch.radiusPx)} em ${t3.stats.collisions.worst.pair === "Y¹–O¹" && em(t3.stats.collisions.worst.clearancePx) === "0.1061" && em(t3.stats.arch.radiusPx) === "1.8730" ? "✅ as recorded" : "⛔ differs from take 3's record"}`);
console.log(`REGRESSION take 2 (?caps=0&steps=font&archtrack=0.16): closest ${w2.pair} ${em(w2.clearancePx)} em, radius ${em(t2.stats.arch.radiusPx)} em ${w2.pair === "a–n" && em(w2.clearancePx) === "0.0211" && em(t2.stats.arch.radiusPx) === "1.5152" ? "✅ as recorded" : "⛔ differs from take 2's record"}`);
await b.close();
