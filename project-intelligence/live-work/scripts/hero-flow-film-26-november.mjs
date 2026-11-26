// THE FLOWING OPENING, FILMED LIVE (26 November 2026; Carl: "when the light comes into play it should grow in intensityy,
// theres a sudden change. Film it and check"). READ-ONLY. The dev bench (`/proto/hero`) at Carl's window (1896 x 946), the
// panels hidden, a CDP screencast with every frame stamped (the page's clock), from navigation for argv[3] s; the bench's
// own read-out (`openingInfo`) sampled each animation frame beside it. Out (argv[2]): frames/<ms>.jpg, info.json, film.mp4.
import { chromium } from "playwright";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
const [OUT = ".", LEN = "14"] = process.argv.slice(2);
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
await cdp.send("Page.startScreencast", { format: "jpeg", quality: 80, everyNthFrame: 1 });
await p.goto("http://localhost:3000/proto/hero", { waitUntil: "commit" });
await p.waitForTimeout(Number(LEN) * 1000);
await cdp.send("Page.stopScreencast");
const origin = await p.evaluate(() => performance.timeOrigin / 1000);
const info = await p.evaluate(() => window.__info);
for (const s of shots) writeFileSync(`${OUT}/frames/${String(Math.round((s.t - origin) * 1000)).padStart(6, "0")}.jpg`, Buffer.from(s.data, "base64"));
writeFileSync(`${OUT}/info.json`, JSON.stringify(info));
await b.close();
// a constant-rate film from the stamped frames (each held until the next)
const list = shots.map((s, i) => `file 'frames/${String(Math.round((s.t - origin) * 1000)).padStart(6, "0")}.jpg'\nduration ${((shots[i + 1]?.t ?? s.t + 0.033) - s.t).toFixed(3)}`).join("\n");
writeFileSync(`${OUT}/list.txt`, list);
execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", "-f", "concat", "-safe", "0", "-i", `${OUT}/list.txt`, "-vf", "fps=30,format=yuv420p", "-c:v", "libx264", "-crf", "16", `${OUT}/film.mp4`], { cwd: OUT });
console.log(`frames ${shots.length}, info ${info.length}`);
