// THE LEANING LOGO's FADE-IN, FILMED AND IN LOSSLESS FRAMES (16 November 2026, session 2; D-101). Carl: "When the logo fades
// in it doesnt look right. Its hard to capture in a screenshot but tou can see a bit here over the text. Do a hard refresh
// and video it." Two runs, each a FRESH browser (a hard refresh's worth: no cache at all), the bench LIVE, 1920 × 1080:
// (1) a VIDEO from the first frame to 1.5 s after the fade (Playwright's recorder, ~25 fps, lossy: for watching);
// (2) LOSSLESS PNG crops of the text/logo overlap through the fade, each named by its share of the fade (screenshots cost
// frames: their timing is not the live one). Into argv 2. READ-ONLY. ⚠ NOT WATCHED: Carl's own Chrome and window size.
import { chromium } from "playwright";
import { mkdirSync, readdirSync, renameSync } from "node:fs";
import { join } from "node:path";
const [OUT] = process.argv.slice(2);
mkdirSync(OUT, { recursive: true });
const ARGS = ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-webgpu"];
const HIDE = ".lil-gui, nextjs-portal { display: none !important; } [data-hero-bench] > div:not(.lil-gui) { display: none !important; }";
{
  const vdir = join(OUT, "video");
  mkdirSync(vdir, { recursive: true });
  const b = await chromium.launch({ channel: "chrome", args: ARGS });
  const ctx = await b.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1, recordVideo: { dir: vdir, size: { width: 1920, height: 1080 } } });
  const p = await ctx.newPage();
  await p.goto("http://localhost:3000/proto/hero", { waitUntil: "load" });
  await p.addStyleTag({ content: HIDE });
  await p.waitForFunction(() => window.__heroBench?.hero?.openingInfo?.done, null, { timeout: 120000, polling: 100 });
  await p.waitForTimeout(1500);
  await ctx.close();
  await b.close();
  const w = readdirSync(vdir).filter((n) => n.endsWith(".webm"));
  renameSync(join(vdir, w[w.length - 1]), join(OUT, "logo-fade-cold.webm"));
  console.log(`video: ${join(OUT, "logo-fade-cold.webm")}`);
}
{
  const b = await chromium.launch({ channel: "chrome", args: ARGS });
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  await p.goto("http://localhost:3000/proto/hero", { waitUntil: "load" });
  await p.addStyleTag({ content: HIDE });
  await p.waitForFunction(() => (window.__heroBench?.hero?.openingInfo?.fadeAtS ?? -1) >= 0, null, { timeout: 120000, polling: 16 });
  let n = 0;
  for (;;) {
    const o = await p.evaluate(() => window.__heroBench.hero.openingInfo);
    const op = Math.round((o.logoOpacity ?? 0) * 100);
    await p.screenshot({ path: join(OUT, `fade-${String(n++).padStart(2, "0")}-opacity-${String(op).padStart(3, "0")}.png`), clip: { x: 0, y: 250, width: 1000, height: 560 } });
    if (o.done || n > 40) break;
    await p.waitForTimeout(60);
  }
  await b.close();
  console.log(`${n} lossless crops in ${OUT}`);
}
