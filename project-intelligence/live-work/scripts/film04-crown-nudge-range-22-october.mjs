/** The P nudge's whole curve (0 → 0.3 em), take 5 — companion to film04-crown-nudge-22-october.mjs, whose 0.1 em range did not
 *  balance M–P and P–A. Prints closest distances each side and any collision. ⚠ NOT WATCHED: optical space; how it looks. */
import { chromium } from "playwright";
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const p = await (await b.newContext({ viewport: { width: 1920, height: 1080 } })).newPage();
await p.goto("http://localhost:3000/proto/showcase?nudge=", { waitUntil: "networkidle" });
await p.waitForFunction(() => window.__showcaseBench?.ready, null, { timeout: 30000 });
const r = await p.evaluate(() => {
  const B = window.__showcaseBench, t = B.spec.layout.archTrackingEm, out = [];
  for (let i = 0; i <= 30; i += 2) {
    const v = i / 100, q = B.probe(t, { nudgeEm: { P: v } });
    const g = Object.fromEntries(q.neighbours.map((x) => [x.pair, x.collide ? -1 : x.clearancePx]));
    out.push(`P +${v.toFixed(2)} em (${(v * 160).toFixed(1)} px): M–P ${g["M–P"].toFixed(1)} · P–A ${g["P–A"].toFixed(1)} px · collisions ${q.collisions}`);
  }
  return out;
});
console.log(r.join("\n"));
await b.close();
