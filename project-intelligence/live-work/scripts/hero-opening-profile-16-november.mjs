// THE OPENING's LONG FRAMES, PROFILED (16 November 2026, session 2; D-101). A COLD load (fresh profile: an empty shader
// cache) of /proto/hero with V8's sampling profiler on (CDP `Profiler`, 250 µs); every animation frame logged; for each
// frame over `MIN` ms, the functions that ran in it: SELF time (where the time was spent) and INCLUSIVE time for our own
// code (components/hero, three's node builder) — "what is in the stall". READ-ONLY.
// ⚠ NOT WATCHED / CAVEATS: Playwright's Chrome (headless, AMD integrated), not Carl's; the profiler costs a little time;
// frame ↔ sample alignment is to within a few ms (performance.now read after Profiler.start); GPU-process work is not
// in a V8 profile (a stall with little JS in it is waiting on something else: that is printed as "unaccounted").
import { chromium } from "playwright";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
const MIN = Number(process.argv[2] ?? 100);
const URL_ = process.argv[3] ?? "http://localhost:3000/proto/hero";
// argv 4 "warm": load once (filling the shader cache), then profile the RELOAD (a return visit)
const WARM = process.argv[4] === "warm";
const ARGS = ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-webgpu"];
// HEADED=1 (env): a visible window at the screen's own size (as Carl sees it)
const HEADED = process.env.HEADED === "1";
const ctx = await chromium.launchPersistentContext(mkdtempSync(join(tmpdir(), "hero-prof-")), { channel: "chrome", args: ARGS, headless: !HEADED, viewport: HEADED ? null : { width: 1920, height: 1080 }, deviceScaleFactor: HEADED ? undefined : 1 });
const p = ctx.pages()[0] ?? (await ctx.newPage());
await p.addInitScript(() => {
  window.__frames = [];
  let last = 0;
  const tick = (t) => {
    const o = window.__heroBench?.hero?.openingInfo;
    if (last) window.__frames.push({ at: t, dt: t - last, ot: o ? o.t : null });
    last = t;
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
});
const cdp = await ctx.newCDPSession(p);
if (WARM) {
  await p.goto(URL_, { waitUntil: "load" });
  await p.waitForFunction(() => window.__heroBench?.hero?.openingInfo?.done, null, { timeout: 120000, polling: 250 });
}
await p.goto(URL_, { waitUntil: "commit" });
await cdp.send("Profiler.enable");
await cdp.send("Profiler.setSamplingInterval", { interval: 250 });
await cdp.send("Profiler.start");
const p0 = await p.evaluate(() => performance.now());
await p.waitForFunction(() => window.__heroBench?.hero?.openingInfo?.done, null, { timeout: 120000, polling: 250 });
const { profile } = await cdp.send("Profiler.stop");
const frames = await p.evaluate(() => window.__frames);
const lt = await p.evaluate(() => window.__heroBench.hero.loadTimes);
const marks = await p.evaluate(() => performance.getEntriesByType("mark").filter((m) => m.name.startsWith("hero:")).map((m) => `${m.name.slice(5)} ${Math.round(m.startTime)}`));
await ctx.close();
const nodes = new Map(profile.nodes.map((n) => [n.id, n]));
const parent = new Map();
for (const n of profile.nodes) for (const c of n.children ?? []) parent.set(c, n.id);
const label = (n) => {
  const f = n.callFrame;
  const file = (f.url || "").split("/").pop().split("?")[0];
  return `${f.functionName || "(anon)"} ${file}:${f.lineNumber + 1}`;
};
const ours = (n) => !/^((program|idle|garbage collector|root))$/.test(n.callFrame.functionName) && n.callFrame.functionName !== "";
// sample times (ms, on the page's performance.now clock)
let t = profile.startTime;
const samples = profile.samples.map((id, i) => {
  t += profile.timeDeltas[i];
  return { id, at: p0 + (t - profile.startTime) / 1000, w: (profile.timeDeltas[i + 1] ?? 250) / 1000 };
});
const step = 1;
console.log(`loadTimes: ${JSON.stringify(lt)}`);
console.log(`marks (page ms): ${marks.join(", ")}`);
for (const f of frames.filter((x) => x.dt > MIN && (x.ot ?? -1) >= 0.3)) {
  const a = f.at - f.dt;
  const inF = samples.filter((s) => s.at > a && s.at <= f.at);
  const self = new Map();
  const incl = new Map();
  let idle = 0;
  for (const s of inF) {
    const n = nodes.get(s.id);
    const name = n.callFrame.functionName;
    if (name === "(idle)" || name === "(program)" || name === "(garbage collector)") {
      if (name === "(idle)") idle += s.w;
    }
    self.set(label(n), (self.get(label(n)) ?? 0) + s.w);
    const seen = new Set();
    for (let id = s.id; id !== undefined; id = parent.get(id)) {
      const m = nodes.get(id);
      if (!ours(m)) continue;
      const l = label(m);
      if (seen.has(l)) continue;
      seen.add(l);
      incl.set(l, (incl.get(l) ?? 0) + s.w);
    }
  }
  const top = (m, k) => [...m].sort((x, y) => y[1] - x[1]).slice(0, k).map(([l, c]) => `      ${(c * step).toFixed(0).padStart(5)} ms  ${l}`).join("\n");
  console.log(`\n■ FRAME ${f.dt.toFixed(0)} ms ending @ ${f.at.toFixed(0)} (opening ${f.ot ?? "—"} s): ${inF.reduce((a, s) => a + s.w, 0).toFixed(0)} ms sampled, idle ${(idle * step).toFixed(0)} ms`);
  console.log(`    SELF:\n${top(self, 10)}`);
  console.log(`    INCLUSIVE (ours / three's builder):\n${top(incl, 14)}`);
}
console.log("\n⚠ Playwright's Chrome (headless), cold, profiler on; not Carl's Chrome. GPU-process time is not in a V8 profile.");
