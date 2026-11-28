// THE FLOWING OPENING FILMED, WITH THE SCENE's MARKS (28 November 2026; Carl: "There appears to be a slight stall after the W
// on the word \"We\""). A copy of `hero-flow-film-26-november.mjs` that also writes marks.json (first paint and every "hero:*"
// mark, page ms) so a hold in the film can be laid against the work under it. Analyse with `hero-flow-holds-28-november.py`.
// READ-ONLY. ⚠ NOT WATCHED: production; Carl's own Chrome (Playwright's, headless, as the 26 November takes).
// THE FLOWING OPENING, FILMED LIVE (26 November 2026; Carl: "when the light comes into play it should grow in intensityy,
// theres a sudden change. Film it and check"). READ-ONLY. The dev bench (`/proto/hero`) at Carl's window (1896 x 946), the
// panels hidden, a CDP screencast with every frame stamped (the page's clock), from navigation for argv[3] s; the bench's
// own read-out (`openingInfo`) sampled each animation frame beside it. Out (argv[2]): frames/<ms>.jpg, info.json, film.mp4.
import { chromium } from "playwright";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
// env BASE: the server (default the dev bench, http://localhost:3000; a production build e.g. http://localhost:3100)
// argv[4] "reload": load once unfilmed (14 s), then film a RELOAD (the shader cache warm: a return visit)
const [OUT = ".", LEN = "14", MODE = "cold"] = process.argv.slice(2);
rmSync(`${OUT}/frames`, { recursive: true, force: true });
mkdirSync(`${OUT}/frames`, { recursive: true });
const b = await chromium.launch({ channel: "chrome", args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-webgpu"] });
const p = await b.newPage({ viewport: { width: 1896, height: 946 }, deviceScaleFactor: 1 });
await p.addInitScript(() => {
  const s = document.createElement("style");
  s.textContent = ".lil-gui, nextjs-portal { display: none !important; } [data-hero-bench] > div:not(.lil-gui) { display: none !important; }";
  document.addEventListener("DOMContentLoaded", () => document.head.appendChild(s));
  window.__info = [];
  const tick = () => {
    const o = window.__heroBench?.hero?.openingInfo;
    if (o) window.__info.push({ ms: Math.round(performance.now()), t: o.t, d: o.headDepth, f: o.fadeAtS, lo: o.logoOpacity, lit: o.lit, done: o.done });
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
});
const cdp = await p.context().newCDPSession(p);
const shots = [];
cdp.on("Page.screencastFrame", async (f) => {
  shots.push({ t: f.metadata.timestamp, data: f.data });
  await cdp.send("Page.screencastFrameAck", { sessionId: f.sessionId }).catch(() => {});
});
if (MODE === "reload") {
  await p.goto(`${process.env.BASE ?? "http://localhost:3000"}/proto/hero`, { waitUntil: "load" });
  await p.waitForTimeout(14000);
}
await cdp.send("Page.startScreencast", { format: "jpeg", quality: 80, everyNthFrame: 1 });
if (MODE === "reload") await p.reload({ waitUntil: "commit" });
else await p.goto(`${process.env.BASE ?? "http://localhost:3000"}/proto/hero`, { waitUntil: "commit" });
await p.waitForTimeout(Number(LEN) * 1000);
await cdp.send("Page.stopScreencast");
const origin = await p.evaluate(() => performance.timeOrigin / 1000);
const info = await p.evaluate(() => window.__info);
const marks = await p.evaluate(() => Object.fromEntries(performance.getEntriesByType("paint").concat(performance.getEntriesByType("mark").filter((m) => m.name.startsWith("hero:"))).map((m) => [m.name, Math.round(m.startTime)])));
writeFileSync(`${OUT}/marks.json`, JSON.stringify(marks));
for (const s of shots) writeFileSync(`${OUT}/frames/${String(Math.round((s.t - origin) * 1000)).padStart(6, "0")}.jpg`, Buffer.from(s.data, "base64"));
writeFileSync(`${OUT}/info.json`, JSON.stringify(info));
await b.close();
// a constant-rate film from the stamped frames (each held until the next)
const list = shots.map((s, i) => `file 'frames/${String(Math.round((s.t - origin) * 1000)).padStart(6, "0")}.jpg'\nduration ${((shots[i + 1]?.t ?? s.t + 0.033) - s.t).toFixed(3)}`).join("\n");
writeFileSync(`${OUT}/list.txt`, list);
execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", "-f", "concat", "-safe", "0", "-i", `${OUT}/list.txt`, "-vf", "fps=30,format=yuv420p", "-c:v", "libx264", "-crf", "16", `${OUT}/film.mp4`], { cwd: OUT });
console.log(`frames ${shots.length}, info ${info.length}`);
