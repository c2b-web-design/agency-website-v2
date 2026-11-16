// THE OPENING, MEASURED (16 November 2026; D-101; `hero-scene.ts`, `OPENING`). Carl: "just build it and measure it."
// ONE browser, a FRESH profile: load 1 is COLD (an empty shader cache: a first visit), then a RELOAD is WARM (a return
// visit). Each load: every animation frame logged from navigation with the opening's read-out; reported: when the bench's
// loop started, when the HTML logo first showed, when the lights were up, when everything was BUILT, the SWAP, the end of
// the swivel (the story starts), and the worst frames in each stretch. argv 2: a folder to also RECORD a video of the cold
// load into (Playwright's recorder, for looking; it costs frames, so its run is separate and not timed). READ-ONLY.
// ⚠ NOT WATCHED / CAVEATS, printed: Playwright's Chrome (headless, AMD integrated), not Carl's; the frame cap ON.
import { chromium } from "playwright";
import { mkdtempSync, renameSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
const [VIDEO_DIR] = process.argv.slice(2);
const ARGS = ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-webgpu"];
const logger = () => {
  window.__frames = [];
  let last = 0;
  const tick = (t) => {
    const h = window.__heroBench?.hero;
    const o = h?.openingInfo;
    if (last) window.__frames.push({ at: Math.round(t), dt: Math.round((t - last) * 10) / 10, loop: !!h, o: o ? { t: o.t, ready: o.ready, sub: o.subAtS, fade: o.fadeAtS, done: o.done, lit: o.lit, op: o.logoOpacity } : null, story: h?.arrival?.t ?? -1 });
    last = t;
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
};
const summarise = (label, f) => {
  const first = (pred) => f.find(pred)?.at ?? null;
  const worst = (a) => [...a].sort((x, y) => y.dt - x.dt).slice(0, 4).map((x) => `${x.dt} ms @ ${x.at}${x.o ? ` (opening ${x.o.t}s)` : ""}`).join(", ") || "—";
  const litUp = first((x) => x.o && x.o.lit >= 1);
  const ready = first((x) => x.o && x.o.ready);
  const swap = first((x) => x.o && x.o.fade >= 0);
  const done = first((x) => x.o && x.o.done);
  console.log(`${label} — ms from navigation:`);
  console.log(`  loop started ${first((x) => x.loop)}, lights up ${litUp}, the logo built ${ready}, the logo's FADE starts ${swap}, faded in / story starts ${done}`);
  const fpsOf = (a) => (a.length > 1 ? Math.round((a.length / ((a[a.length - 1].at - a[0].at) / 1000)) * 10) / 10 : null);
  const text = f.filter((x) => x.o && x.loop && (swap === null || x.at < swap));
  console.log(`  mean fps while the text plays (loop start → the fade): ${fpsOf(text)}`);
  // the SUBTEXT's own window (from its actual start, `subAtS`, to the second line's end: + 2.5 + 2.8 s) — Carl's stall at the W
  const subAt = f.find((x) => x.o && x.o.sub >= 0)?.o.sub ?? null;
  const headUp = f.find((x) => x.o && x.o.lit >= 0.5)?.o.t ?? null;
  const sub = subAt === null ? [] : f.filter((x) => x.o && !x.o.done && x.o.t >= subAt && x.o.t <= subAt + 5.3);
  console.log(`  the headline half up at opening ${headUp} s; the SUBTEXT starts at opening ${subAt} s`);
  console.log(`  the subtext's window: ${sub.length} frames, over 50 ms ${sub.filter((x) => x.dt > 50).length}, worst ${worst(sub)}, mean fps ${fpsOf(sub)}`);
  const pre = f.filter((x) => swap === null || x.at < swap);
  const sw = f.filter((x) => swap !== null && x.at >= swap && (done === null || x.at < done));
  const post = f.filter((x) => done !== null && x.at >= done && x.at < done + 3000);
  console.log(`  worst frames — the text (before the fade): ${worst(pre)}`);
  console.log(`                 the logo's fade: ${worst(sw)}`);
  console.log(`                 the story's first 3 s: ${worst(post)}`);
  console.log(`  frames over 50 ms: the text ${pre.filter((x) => x.dt > 50).length}, the fade ${sw.filter((x) => x.dt > 50).length}, story 3 s ${post.filter((x) => x.dt > 50).length}`);
};
const run = async (page) => {
  await page.waitForFunction(() => window.__heroBench?.hero?.openingInfo?.done && window.__heroBench.hero.arrival?.t > 3, null, { timeout: 120000, polling: 250 });
  const lt = await page.evaluate(() => window.__heroBench.hero.loadTimes);
  if (lt) console.log(`  main-thread steps (ms): ${JSON.stringify(lt)}`);
  return page.evaluate(() => window.__frames);
};
{
  const ctx = await chromium.launchPersistentContext(mkdtempSync(join(tmpdir(), "hero-opening-")), { channel: "chrome", args: ARGS, viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  const p = ctx.pages()[0] ?? (await ctx.newPage());
  await p.addInitScript(logger);
  await p.goto("http://localhost:3000/proto/hero", { waitUntil: "load" });
  summarise("LOAD 1, COLD (a first visit)", await run(p));
  await p.reload({ waitUntil: "load" });
  summarise("LOAD 2, WARM (a return visit: the reload)", await run(p));
  await ctx.close();
}
if (VIDEO_DIR) {
  const ctx = await chromium.launchPersistentContext(mkdtempSync(join(tmpdir(), "hero-opening-v-")), { channel: "chrome", args: ARGS, viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1, recordVideo: { dir: VIDEO_DIR, size: { width: 1920, height: 1080 } } });
  const p = ctx.pages()[0] ?? (await ctx.newPage());
  await p.goto("http://localhost:3000/proto/hero", { waitUntil: "load" });
  await p.waitForFunction(() => window.__heroBench?.hero?.openingInfo?.done && window.__heroBench.hero.arrival?.t > 4, null, { timeout: 120000, polling: 250 });
  await ctx.close();
  const webm = readdirSync(VIDEO_DIR).filter((n) => n.endsWith(".webm"));
  if (webm.length) renameSync(join(VIDEO_DIR, webm[webm.length - 1]), join(VIDEO_DIR, "opening-cold-load.webm"));
  console.log(`video: ${VIDEO_DIR}/opening-cold-load.webm (recorded; its frames are not the timed ones)`);
}
console.log("⚠ Playwright's Chrome (headless), fresh profile, frame cap ON; not Carl's Chrome");
