// THE LAST BAND's HITS ON THE LOGO, MEASURED (20 November 2026; D-101; for the code drops). Carl: "The last rain to fall
// should have the code drops. Find out how many hit the logo." The 16 November figure (~3 of ~170) was GEOMETRY; this
// READS THE RAIN BACK FROM THE GPU: frame-stepped (1/30 s) from the replay, the story whole (blobs, floor on), each frame
// the rain's own step; from story 28 s every frame its buffers are read (`getArrayBufferAsync`): a drop RELEASED this frame
// = its height jumped up to the release height; a HIT this frame = its splash clock is exactly 1 (reset at the hit), ON THE
// LOGO when the splash sits above the floor. Each logo hit is matched to its drop's release frame.
// THE LAST BAND = the drops released in the last fall-time before the LAST release (in the air as the last starts down).
// Runs: argv[2] (default 5) — the rain is random each run. READ-ONLY (no source edits).
// ⚠ NOT WATCHED: live playback (frame-stepped only); drops past index `peak` (never stepped); splashes off (they would hide
// hits: the splash clock is the hit's only trace) — checked on, below.
import { chromium } from "playwright";
const RUNS = Number(process.argv[2] ?? 5);
const b = await chromium.launch({ channel: "chrome", args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-webgpu"] });
const p = await b.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
const errors = [];
p.on("pageerror", (e) => errors.push(String(e).slice(0, 200)));
await p.goto("http://localhost:3000/proto/hero", { waitUntil: "load" });
await p.waitForFunction(() => window.__heroBench?.hero?.mould && window.__heroBench.hero.warmed === true, null, { timeout: 180000 });

for (let run = 1; run <= RUNS; run++) {
  const r = await p.evaluate(async () => {
    const { hero, renderer, scene } = window.__heroBench;
    renderer.setAnimationLoop(null);
    if (!hero.rain.splashes) throw new Error("splashes off: hits leave no trace");
    hero.settings.blobs = true;
    hero.settings.floor = true;
    hero.replayArrival();
    hero.update(0);
    // the rain's storage attributes, found in its materials' node graphs
    const find = (root) => {
      const out = new Set();
      const seen = new Set();
      const walk = (o, d) => {
        if (!o || typeof o !== "object" || seen.has(o) || d > 40) return;
        seen.add(o);
        if (o.isStorageBufferAttribute || o.isStorageInstancedBufferAttribute) {
          out.add(o);
          return;
        }
        if (ArrayBuffer.isView(o) || o.isRenderer || o.isTexture) return;
        for (const k of Object.keys(o)) walk(o[k], d + 1);
      };
      walk(root, 0);
      return [...out];
    };
    const dropMat = scene.getObjectByName("hero rain: drops").material;
    const splMat = scene.getObjectByName("hero rain: splashes").material;
    const posA = find(dropMat.vertexNode).find((a) => a.count >= 50000 && a.itemSize >= 3);
    const opac = find(splMat.opacityNode);
    const sPosA = opac.find((a) => a.itemSize >= 3);
    const sTA = opac.find((a) => a.itemSize === 1);
    if (!posA || !sPosA || !sTA) throw new Error(`buffers not found: ${!!posA} ${!!sPosA} ${!!sTA}`);
    const stride = (a) => a.array.length / a.count;
    const dt = 1 / 30;
    const releaseFrame = new Map(); // drop index → story time of its latest release
    let prevY = null;
    const releases = []; // story times of every release seen
    const logoHits = []; // { hitT, relT, x, z, y }
    let floorHits = 0;
    const map = () => hero.rainInfo?.map;
    let floorY = -437.5;
    let upc = null;
    let lastLiveT = -1;
    while (hero.arrival.t < 33.5) {
      hero.update(dt);
      hero.compute(renderer);
      const t = hero.arrival.t;
      const info = hero.rainInfo;
      if (t < 28 || !info || info.t < 0) continue;
      if (info.active >= 1) lastLiveT = t;
      const N = Math.max(1, Math.ceil(hero.rain.peak));
      const [pb, sb, tb] = await Promise.all([posA, sPosA, sTA].map((a) => renderer.getArrayBufferAsync(a)));
      const P = new Float32Array(pb), S = new Float32Array(sb), T = new Float32Array(tb);
      const ps = stride(posA), ss = stride(sPosA);
      const m = map();
      upc ??= m.maxHeight > 0 ? null : null;
      const ys = new Float32Array(N);
      for (let i = 0; i < N; i++) {
        const y = P[i * ps + 1];
        ys[i] = y;
        // ⚠ THE HIT FIRST: a drop that hits is re-released at the top IN THE SAME STEP, so its hit belongs to the release
        // recorded BEFORE this frame (run 1 of v1 matched hits to their own re-release)
        if (Math.abs(T[i] - 1) < 1e-6) {
          const sy = S[i * ss + 1];
          // the splash sits `lift` (0.05 cm) above the surface hit: the floor's is floorY + lift
          if (sy > floorY + 1) logoHits.push({ i, hitT: t, relT: releaseFrame.get(i) ?? null, x: S[i * ss], z: S[i * ss + 2], y: sy });
          else floorHits++;
        }
        // released this frame: live now (not parked) and higher than last frame (or parked last frame)
        if (y > -1e5 && prevY && (prevY[i] < -1e5 || y > prevY[i] + 1)) {
          releaseFrame.set(i, t);
          releases.push(t);
        }
      }
      prevY = ys;
    }
    const m = map();
    return { releases, logoHits, floorHits, lastLiveT, map: m, fallS: hero.rainInfo?.fallS, leadS: hero.rainInfo?.leadS };
  });
  const lastRel = Math.max(...r.releases);
  const from = lastRel - r.fallS;
  const band = r.releases.filter((t) => t >= from - 1e-6);
  const bandHits = r.logoHits.filter((h) => h.relT !== null && h.relT >= from - 1e-6);
  const last05 = r.releases.filter((t) => t >= lastRel - 0.5 - 1e-6).length;
  const last1 = r.releases.filter((t) => t >= lastRel - 1 - 1e-6).length;
  const hits05 = r.logoHits.filter((h) => h.relT !== null && h.relT >= lastRel - 0.5 - 1e-6).length;
  const hits1 = r.logoHits.filter((h) => h.relT !== null && h.relT >= lastRel - 1 - 1e-6).length;
  const fps = 30;
  const smpte = (s) => `00:00:${String(Math.floor(s)).padStart(2, "0")}:${String(Math.round((s % 1) * fps)).padStart(2, "0")}`;
  const along = (x) => ((x - r.map.minX) / r.map.sizeX);
  console.log(`\nRUN ${run}: last release story ${lastRel.toFixed(3)} s (${smpte(lastRel)}); fall to floor ${r.fallS} s, to logo top ${r.leadS} s`);
  console.log(`  LAST BAND (released ${from.toFixed(2)}–${lastRel.toFixed(2)} s): ${band.length} drops → ON THE LOGO ${bandHits.length}`);
  for (const h of bandHits) console.log(`    drop ${h.i}: released ${h.relT.toFixed(3)} (${smpte(h.relT)}), lands ${h.hitT.toFixed(3)} (${smpte(h.hitT)}), along the logo ${(along(h.x) * 100).toFixed(0)}% (x ${h.x.toFixed(1)}, z ${h.z.toFixed(1)})`);
  console.log(`  final 0.5 s: ${last05} released, ${hits05} on the logo;  final 1 s: ${last1} released, ${hits1} on the logo`);
  console.log(`  all logo hits from 28 s: ${r.logoHits.length}; floor hits from 28 s: ${r.floorHits}`);
}
await b.close();
console.log(`\npage errors: ${errors.length}`, errors);
