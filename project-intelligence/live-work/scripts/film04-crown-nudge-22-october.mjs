/** FILM 04 PASS 1 TAKE 5 — the P's optical nudge, measured (22 October 2026, session 2). Carl on take 4: *"Just move the P a
 *  touch to the right. There is too much space from the A."* The starting value: the nudge at which the P's CLOSEST distance
 *  to the M equals its closest distance to the A (outline to outline, both ways — `checkCollisions`' neighbours), found with
 *  `__showcaseBench.probe(track, { nudgeEm })` and confirmed by a real reading. Carl judges the result by eye.
 *  ⚠ NOT WATCHED: optical SPACE (area between letters) — closest distance is a proxy; how it LOOKS.
 *    node …/film04-crown-nudge-22-october.mjs [base=http://localhost:3000]   */
import { chromium } from "playwright";
const BASE = process.argv[2] ?? "http://localhost:3000";
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
async function open(q) {
  const p = await (await b.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 })).newPage();
  await p.goto(`${BASE}/proto/showcase${q}`, { waitUntil: "networkidle" });
  await p.waitForFunction(() => window.__showcaseBench?.ready, null, { timeout: 30000 });
  await p.waitForTimeout(300);
  return p;
}
const gaps = (n) => Object.fromEntries(n.map((x) => [x.pair, x.collide ? -1 : x.clearancePx]));
const A = await open("?nudge=");
const r = await A.evaluate(() => {
  const B = window.__showcaseBench;
  const t = B.spec.layout.archTrackingEm;
  const out = [];
  for (let i = 0; i <= 200; i++) {
    const v = i * 0.001;
    const p = B.probe(t, { nudgeEm: { P: v } });
    out.push({ v, collisions: p.collisions, tight: p.tight, n: p.neighbours });
  }
  return out;
});
const g0 = gaps(r[0].n);
console.log(`take 4 (no nudge): M–P ${g0["M–P"].toFixed(2)} px · P–A ${g0["P–A"].toFixed(2)} px · difference ${(g0["P–A"] - g0["M–P"]).toFixed(2)} px`);
let pick = null;
for (const x of r) {
  const g = gaps(x.n);
  if (!pick && g["M–P"] >= g["P–A"]) pick = { ...x, g };
}
if (!pick) { console.log("⛔ no nudge up to 0.2 em balances M–P and P–A"); await b.close(); process.exit(1); }
console.log(`PICK: P +${pick.v.toFixed(3)} em (${(pick.v * 160).toFixed(1)} px): M–P ${pick.g["M–P"].toFixed(2)} px · P–A ${pick.g["P–A"].toFixed(2)} px · collisions ${pick.collisions}, tight ${pick.tight}`);
const C = await open(`?nudge=P:${pick.v}`);
const c = await C.evaluate(() => JSON.parse(JSON.stringify(window.__showcaseBench.stats.collisions)));
const gc = gaps(c.neighbours);
console.log(`CONFIRMED (real reading, ?nudge=P:${pick.v}): M–P ${gc["M–P"].toFixed(2)} px · P–A ${gc["P–A"].toFixed(2)} px · collisions ${c.collisions}, tight ${c.tight} · round the arch: ${c.neighbours.map((n) => `${n.pair} ${n.clearancePx.toFixed(1)}`).join(" · ")}`);
await b.close();
