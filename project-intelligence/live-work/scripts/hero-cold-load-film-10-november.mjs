// ⛔ THE HERO's COLD LOAD, FILMED (10 November 2026, session 2; Carl: "when the logo does finally appear on its far edge
// there is a light and then its darker. its very noticable"). Needs the dev server. A fresh context with Playwright's
// video recording (what the compositor presented, ~25 fps), `/proto/camera?blank=1`, nothing touched; argv: OUT dir,
// seconds (default 20). Also logs page-time events (the logo's materials by env, `__heroLogoEnvs`; the reflection's
// captures) so a frame can be tied to a cause.
// ⚠ NOT WATCHED (printed): Carl's Chrome and screen; frames between the video's samples.
import { chromium } from "file:///C:/Users/Carl Buckley/agency-website-v2/node_modules/playwright/index.mjs";
import { mkdirSync } from "node:fs";
const OUT = process.argv[2];
const SECS = Number(process.argv[3] ?? 20);
mkdirSync(OUT, { recursive: true });
const b = await chromium.launch({ channel: "chrome", args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-webgpu"] });
const ctx = await b.newContext({ viewport: { width: 1909, height: 934 }, deviceScaleFactor: 1, recordVideo: { dir: OUT, size: { width: 1909, height: 934 } } });
const p = await ctx.newPage();
await p.addInitScript(() => {
  const log = (window.__coldLog = []);
  const seen = {};
  const tick = (now) => {
    const envs = (window.__heroLogoEnvs ?? []).join(",");
    if (envs !== seen.envs) { seen.envs = envs; log.push({ at: +now.toFixed(0), envs }); }
    const caps = window.__heroReflection?.captures ?? 0;
    if (caps !== seen.caps) { seen.caps = caps; log.push({ at: +now.toFixed(0), captures: caps }); }
    let logoVis = null;
    window.__benchScene?.traverse((o) => { if (o.name === "hero logo") logoVis = o.visible + ":" + !!o.material.envMap; });
    if (logoVis !== seen.logo) { seen.logo = logoVis; log.push({ at: +now.toFixed(0), logo: logoVis }); }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
});
const t0 = Date.now();
await p.goto("http://localhost:3000/proto/camera?blank=1", { waitUntil: "load" });
await p.waitForTimeout(SECS * 1000);
for (const e of await p.evaluate(() => window.__coldLog)) console.log(JSON.stringify(e));
console.log("wall-clock from goto:", ((Date.now() - t0) / 1000).toFixed(1), "s; video in", OUT);
console.log("⚠ NOT WATCHED: Carl's Chrome and screen; frames between the video's samples");
await ctx.close();
await b.close();
