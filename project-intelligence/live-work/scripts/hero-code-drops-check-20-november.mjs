// THE CODE DROPS, CHECKED (20 November 2026; D-101; `hero-code-drops.ts`, `hero-rain.ts`). Frame-stepped (1/30 s), the whole
// story; around the last band the rain's buffers read back each frame (`getArrayBufferAsync`):
//   - CODE COLUMNS this run = drops with a column (`codeSurf` above PARK) released in the band (`codeCol.w` ≥ the band's start);
//   - ⛔ THE ASSERTION: a SPLASH ON THE LOGO from a band drop must be ZERO (every band drop that lands on the logo is code, and
//     code makes no splash) — each drop's RELEASE tracked from 0.6 s before the band (its height read back every frame), each
//     logo splash matched to its drop's release (take 3: the earlier time-only test misjudged low surfaces);
//   - run 1 FILMED from Carl's bench camera (his saved pose, 20 November 13:08: position 712.4, −59.1, 929.1; target 720.8,
//     −83.3, −1.3; fov 45), every frame of the band → argv[2]/frames, a 30 fps MP4 (real time, no slow motion) and a sheet.
// Runs: argv[3] (default 5). READ-ONLY. ⚠ NOT WATCHED: live playback (frame-stepped); the frame cost; Carl's own Chrome.
import { chromium } from "playwright";
import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync } from "node:fs";
const OUT = process.argv[2];
const RUNS = Number(process.argv[3] ?? 5);
rmSync(`${OUT}/frames`, { recursive: true, force: true });
mkdirSync(`${OUT}/frames`, { recursive: true });
const b = await chromium.launch({ channel: "chrome", args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-webgpu"] });
const p = await b.newPage({ viewport: { width: 1896, height: 946 }, deviceScaleFactor: 1 });
const errors = [];
const warns = [];
p.on("pageerror", (e) => errors.push(String(e).slice(0, 200)));
p.on("console", (m) => (m.type() === "error" || m.type() === "warning") && warns.push(m.text().slice(0, 160)));
await p.goto("http://localhost:3000/proto/hero", { waitUntil: "load" });
await p.waitForFunction(() => window.__heroBench?.hero?.mould && window.__heroBench.hero.warmed === true && window.__heroBench.hero.rainInfo, null, { timeout: 180000 });
await p.addStyleTag({ content: ".lil-gui, nextjs-portal { display: none !important; } [data-hero-bench] > div:not(.lil-gui) { display: none !important; }" });

await p.evaluate(() => {
  const { renderer, scene } = window.__heroBench;
  renderer.setAnimationLoop(null);
  const find = (root) => {
    const out = new Set();
    const seen = new Set();
    const walk = (o, d) => {
      if (!o || typeof o !== "object" || seen.has(o) || d > 40) return;
      seen.add(o);
      if (o.isStorageBufferAttribute || o.isStorageInstancedBufferAttribute) return void out.add(o);
      if (ArrayBuffer.isView(o) || o.isRenderer || o.isTexture) return;
      for (const k of Object.keys(o)) walk(o[k], d + 1);
    };
    walk(root, 0);
    return [...out];
  };
  const codeMat = scene.getObjectByName("hero rain: code drops").material;
  const splMat = scene.getObjectByName("hero rain: splashes").material;
  const dropMat = scene.getObjectByName("hero rain: drops").material;
  // the code material reads codeCol (vec4) and codeSurf (float)
  const cAttrs = find(codeMat.vertexNode);
  const opac = find(splMat.opacityNode);
  window.__codeCheck = {
    col: cAttrs.find((a) => a.itemSize === 4),
    surf: cAttrs.find((a) => a.itemSize === 1),
    sPos: opac.find((a) => a.itemSize >= 3),
    sT: opac.find((a) => a.itemSize === 1),
    pos: find(dropMat.vertexNode).find((a) => a.count >= 50000 && a.itemSize >= 3),
  };
  const c = window.__codeCheck;
  if (!c.col || !c.surf || !c.sPos || !c.sT || !c.pos) throw new Error("buffers not found");
});

let frameNo = 0;
for (let run = 1; run <= RUNS; run++) {
  const film = run === 1;
  await p.evaluate(() => {
    const { hero } = window.__heroBench;
    hero.settings.blobs = true;
    hero.settings.floor = true;
    hero.replayArrival();
    hero.update(0);
    while (!(hero.rainInfo?.codeBand && hero.rainInfo.t >= hero.rainInfo.codeBand[0] - 0.6)) {
      hero.update(1 / 30);
      hero.compute(window.__heroBench.renderer);
      if (hero.arrival.t > 40) throw new Error("no band");
    }
  });
  const logoSplashLate = [];
  const boundary = [];
  const releasedAt = new Map();
  await p.evaluate(() => (window.__prevY = null));
  const columns = new Map();
  let band = null;
  for (;;) {
    const r = await p.evaluate(async (film) => {
      const { hero, renderer, scene, camera } = window.__heroBench;
      const C = window.__codeCheck;
      hero.update(1 / 30);
      hero.compute(renderer);
      const info = hero.rainInfo;
      const [cb, sb, pb, tb, qb] = await Promise.all([C.col, C.surf, C.sPos, C.sT, C.pos].map((a) => renderer.getArrayBufferAsync(a)));
      const col = new Float32Array(cb), surf = new Float32Array(sb), sp = new Float32Array(pb), st = new Float32Array(tb), q = new Float32Array(qb);
      const qs = C.pos.array.length / C.pos.count;
      const N = Math.ceil(hero.rain.peak);
      const cs = C.col.array.length / C.col.count, ps = C.sPos.array.length / C.sPos.count;
      const cols = [];
      const splashes = [];
      const released = [];
      window.__prevY ??= null;
      for (let i = 0; i < N; i++) {
        const y = q[i * qs + 1];
        if (y > -1e5 && window.__prevY && (window.__prevY[i] < -1e5 || y > window.__prevY[i] + 1)) released.push(i);
        if (surf[i] > -5e5) cols.push([i, col[i * cs], col[i * cs + 2], col[i * cs + 3], surf[i]]);
        if (Math.abs(st[i] - 1) < 1e-6 && sp[i * ps + 1] > -437.5 + 1) splashes.push([i, sp[i * ps], sp[i * ps + 2]]);
      }
      window.__prevY = Float32Array.from({ length: N }, (_, i) => q[i * qs + 1]);
      if (film && info.t >= info.codeBand[0] - 0.15) {
        camera.position.set(712.4, -59.1, 929.1);
        camera.lookAt(720.8, -83.3, -1.3);
        camera.fov = 45;
        camera.updateProjectionMatrix();
        renderer.render(scene, camera);
        await new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(res)));
      }
      return { t: info.t, story: hero.arrival.t, band: info.codeBand, lead: info.leadS, cols, splashes, released, filmed: film && info.t >= info.codeBand[0] - 0.15 };
    }, film);
    band = r.band;
    for (const c of r.cols) if (c[3] >= band[0] - 1e-4) columns.set(c[0], c);
    // ⛔ EXACT (take 3's fix): a logo splash belongs to its drop's release BEFORE this frame (a hit re-releases in the
    // same step); a band drop = released at or after the band's start. ⚠ The rain's clock is read rounded to 0.01 s:
    // a release within 0.01 s of the band's start is reported as BOUNDARY, not judged
    for (const s of r.splashes) {
      const rel = releasedAt.get(s[0]);
      if (rel === undefined) continue;
      if (Math.abs(rel - band[0]) < 0.0101) boundary.push({ t: r.t, i: s[0], rel });
      else if (rel > band[0]) logoSplashLate.push({ t: r.t, i: s[0], rel });
    }
    for (const i of r.released) releasedAt.set(i, r.t);
    if (r.filmed) {
      await p.screenshot({ path: `${OUT}/frames/f${String(frameNo).padStart(3, "0")}.png` });
      frameNo++;
    }
    if (r.t > band[1] + 0.44 + 1.0) {
      console.log(`RUN ${run}: band on the rain's clock ${band[0]}–${band[1]} s (story ends ${r.story.toFixed(2)})`);
      break;
    }
  }
  console.log(`  CODE COLUMNS: ${columns.size}`);
  for (const [i, x, z, w, s] of columns.values()) console.log(`    drop ${i}: released at rain ${w.toFixed(3)} s, x ${x.toFixed(1)} z ${z.toFixed(1)}, lands on y ${s.toFixed(1)}`);
  if (boundary.length) console.log(`  ⚠ BOUNDARY (released within 0.01 s of the band's start, not judged): ${JSON.stringify(boundary)}`);
  console.log(`  ${logoSplashLate.length === 0 ? "✅" : "⛔"} logo splashes from band drops: ${logoSplashLate.length}${logoSplashLate.length ? " " + JSON.stringify(logoSplashLate.slice(0, 5)) : ""}`);
}
await b.close();
console.log(`page errors: ${errors.length}`, errors);
console.log(`console errors/warnings: ${warns.length}`, [...new Set(warns)].slice(0, 6));
execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", "-framerate", "30", "-i", `${OUT}/frames/f%03d.png`, "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "16", `${OUT}/code-drops-band.mp4`]);
console.log(`film: ${OUT}/code-drops-band.mp4 (${frameNo} frames, 30 fps)`);
