// THE TEMPERATURE DURING THE WASH (16 November 2026, session 3; D-101; `components/hero/hero-heat.ts`). Frame-stepped
// (1/30 s) from the story's start, Home camera, the GPU step (`hero.compute`) every frame as the bench does: Home stills at
// argv 4's story times into argv 2, and the RED PIXELS on the logo every 0.1 s from 26 s to argv 5 (the last red's time).
// argv 3 = "on" | "off" (the temperature drives the colour, or the run-off front as before). READ-ONLY.
// NOT WATCHED: close-up views (stills from Home only); the steam's look (unchanged in this chunk); live (unstepped) playback.
// "Red" = R > 90 and R > 1.8 × max(G, B), inside the logo's box at Home (the text is ice blue, the floor undrawn).
import { chromium } from "playwright";
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
const [OUT, MODE = "on", TIMES = "28,30,31.3,32.5,34.8,35.8,36.8", END = "38"] = process.argv.slice(2);
mkdirSync(OUT, { recursive: true });
const stills = TIMES.split(",").map(Number);
const CLIP = { x: 1040, y: 470, width: 560, height: 340 };
const b = await chromium.launch({ channel: "chrome", args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-webgpu"] });
const p = await b.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
const errors = [];
const warns = [];
p.on("pageerror", (e) => errors.push(String(e).slice(0, 200)));
p.on("console", (m) => (m.type() === "warning" || m.type() === "error") && warns.push(m.text().slice(0, 200)));
await p.goto("http://localhost:3000/proto/hero", { waitUntil: "load" });
await p.waitForFunction(() => window.__heroBench?.hero?.mould && window.__heroBench.hero.warmed !== false, null, { timeout: 90000 });
await p.waitForTimeout(9000);
await p.addStyleTag({ content: ".lil-gui, nextjs-portal { display: none !important; } [data-hero-bench] > div:not(.lil-gui) { display: none !important; }" });
await p.evaluate((mode) => {
  const { hero, renderer, scene, camera } = window.__heroBench;
  renderer.setAnimationLoop(null);
  hero.settings.blobs = true;
  hero.settings.floor = true;
  hero.heat.on = mode === "on";
  scene.traverse((o) => o.name === "hero mould outline (guide)" && (o.visible = false));
  camera.position.set(0, -49.2, 2566.2);
  camera.lookAt(0, 0, 0);
  hero.replayArrival();
}, MODE);
const stepTo = (at) =>
  p.evaluate(async (at) => {
    const { hero, renderer, scene, camera } = window.__heroBench;
    while (hero.arrival.t < at - 1e-6) {
      hero.update(1 / 30);
      hero.compute(renderer);
    }
    renderer.render(scene, camera);
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    return { t: hero.arrival.t, wash: hero.rainInfo?.wash, heat: hero.heatInfo };
  }, at);
const redIn = (buf) => {
  const raw = execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-i", "pipe:0", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], { input: buf, maxBuffer: 1 << 26 });
  let n = 0;
  for (let i = 0; i < raw.length; i += 3) if (raw[i] > 90 && raw[i] > 1.8 * Math.max(raw[i + 1], raw[i + 2])) n++;
  return n;
};
const rows = [];
let lastRed = null;
const marks = [...new Set([...stills, ...Array.from({ length: Math.round((+END - 26) * 10) + 1 }, (_, k) => Math.round((26 + k / 10) * 100) / 100)])].sort((a, b) => a - b);
let info = null;
for (const at of marks) {
  info = await stepTo(at);
  const shot = await p.screenshot({ clip: CLIP });
  const red = redIn(shot);
  rows.push({ t: at, wash: info.wash, red });
  if (red > 20) lastRed = at;
  if (stills.includes(at)) await p.screenshot({ path: `${OUT}/home-${MODE}-${at}.png` });
}
await b.close();
writeFileSync(`${OUT}/red-${MODE}.json`, JSON.stringify(rows));
const first = rows.find((r) => r.wash > 0);
console.log(`mode ${MODE}: first wash at ${first?.t}; red px (>20) last seen at story ${lastRed} s`);
console.log(rows.filter((r) => Math.abs(r.t * 2 - Math.round(r.t * 2)) < 1e-6).map((r) => `${r.t}:${r.red}`).join("  "));
console.log("heat info", JSON.stringify(info?.heat));
console.log(`page errors: ${errors.length}`, errors, `warnings: ${warns.length}`, warns.slice(0, 5));
