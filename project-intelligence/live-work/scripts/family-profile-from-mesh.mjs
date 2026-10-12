/** THE PILL'S CROSS-SECTION, READ FROM THE LIVE MESH — D-088, 12 October 2026 (Carl: "do by the numbers of the mesh").
 *  Loads /proto/button twice (the family's profile, and ?profile=nextstep), reads the Who we are pill's real vertices
 *  through three.js's devtools hook, keeps the column nearest x = 0, and draws height against distance from the edge,
 *  24x, the family over Next step. Prints the rim (the groove's dip) for each. Writes the PNG to argv[2].
 *  ⚠ NOT WATCHED: the end caps (the column is the straight run); shading (geometry only). */
import { chromium } from "playwright";
const b = await chromium.launch({ headless: true, args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
async function column(q) {
  const p = await ctx.newPage();
  await p.addInitScript(() => { window.__THREE_DEVTOOLS__ = new EventTarget(); window.__s = []; window.__THREE_DEVTOOLS__.addEventListener("observe", (e) => { if (e.detail?.isScene) window.__s.push(e.detail); }); });
  await p.goto("http://localhost:3000/proto/button" + q, { waitUntil: "networkidle" });
  await p.waitForFunction(() => window.__s.length >= 2, null, { timeout: 30000 });
  await p.waitForTimeout(1500);
  return p.evaluate(() => {
    const ms = []; for (const s of window.__s) s.traverse((o) => { if (o.isMesh) ms.push(o); });
    const m = ms.map((o) => { o.geometry.computeBoundingBox(); return { o, w: o.geometry.boundingBox.max.x - o.geometry.boundingBox.min.x }; }).sort((a, c) => c.w - a.w)[0].o;
    const a = m.geometry.attributes.position.array; let best = Infinity;
    for (let i = 0; i < a.length; i += 3) best = Math.min(best, Math.abs(a[i]));
    const pts = []; for (let i = 0; i < a.length; i += 3) if (Math.abs(Math.abs(a[i]) - best) < 1e-6 && a[i] >= 0) pts.push([a[i + 1], a[i + 2]]);
    return pts.sort((x, y) => x[0] - y[0]);
  });
}
const fam = await column(""), ns = await column("?profile=nextstep");
const rim = (pts) => { // the groove, measured the same way for both: moving in from the bottom edge, the slope first
  // CLIMBS to a peak (the lip), then DIPS (the groove), then climbs again (the dome). The groove is that dip.
  // ⚠ Two misses before this (12 October): a height-minimum finder saw no groove on Next step (its groove only
  // flattens the climb), and a global slope-minimum found Next step's flat skirt at the very edge.
  const lo = pts.filter(([y]) => y <= 0).map(([y, z]) => [y + 20.5, z]).sort((x, y) => x[0] - y[0]);
  const sl = []; for (let i = 1; i < lo.length - 1; i++) sl.push([lo[i][0], (lo[i + 1][1] - lo[i - 1][1]) / (lo[i + 1][0] - lo[i - 1][0])]);
  let k = 1; while (k < sl.length - 1 && !(sl[k][1] > sl[k - 1][1] && sl[k][1] >= sl[k + 1][1] && sl[k][1] > 0.05)) k++; // the lip's peak
  for (k = k + 1; k < sl.length - 1; k++) if (sl[k][1] <= sl[k - 1][1] && sl[k][1] < sl[k + 1][1]) return sl[k][0]; // the groove's dip
  return NaN;
};
const W = 1440, H = 560, S = 24, ox = 228, oy = 400, X = (y) => ox + (y + 20.5) * S, Y = (z) => oy - z * S;
const path = (pts) => "M" + pts.map(([y, z]) => `${X(y).toFixed(1)},${Y(z).toFixed(1)}`).join(" L");
const rf = rim(fam), rn = rim(ns);
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" font-family="Geist, system-ui"><rect width="100%" height="100%" fill="#0a0a0a"/>
<line x1="${X(-20.5)}" y1="${oy}" x2="${X(20.5)}" y2="${oy}" stroke="#444"/>
<path d="${path(ns)}" fill="none" stroke="#777" stroke-width="2" stroke-dasharray="6 5"/>
<path d="${path(fam)} L${X(20.5)},${oy} L${X(-20.5)},${oy} Z" fill="#8a8a8a" fill-opacity="0.85" stroke="#e6e6e6" stroke-width="2"/>
<text x="${W / 2}" y="44" fill="#ddd" font-size="17" text-anchor="middle">THE RIM, BY THE NUMBERS OF THE MESH</text>
<text x="${W / 2}" y="72" fill="#9adfe8" font-size="14" text-anchor="middle">FILLED: WHO WE ARE, RIM ${rf.toFixed(1)} px      DASHED: NEXT STEP TODAY, RIM ${rn.toFixed(1)} px</text>
<text x="${W / 2}" y="${oy + 50}" fill="#777" font-size="13" text-anchor="middle">THE PILL CUT ACROSS ITS HEIGHT (41 px), DRAWN 24 TIMES SIZE FROM ITS OWN VERTICES</text></svg>`;
const p = await ctx.newPage(); await p.setViewportSize({ width: W, height: H });
await p.setContent(`<body style="margin:0;background:#0a0a0a">${svg}</body>`); await p.screenshot({ path: process.argv[2] });
await b.close();
console.log(`rim (the groove's slope dip, from the edge): family ${rf.toFixed(2)} px, next step ${rn.toFixed(2)} px; column points ${fam.length}/${ns.length}`);
