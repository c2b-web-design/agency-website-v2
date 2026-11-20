// THE CLOTH, STEP 1, LOOKED AT (20 November 2026; `hero-cloth.ts`): the bench LIVE (its own loop, real time) from Carl's
// camera (his pose, 14:57: position −475.4, 321.4, −397.8; target 53, 229.6, −329.4; fov 45); "Cloth again" at the start,
// then a still every second for argv[3] seconds (default 12) into argv[2], and a sheet. Page errors, the cloth's read-out.
// READ-ONLY. ⚠ NOT WATCHED: Carl's Chrome; frame cost (only the page's own fps read).
import { chromium } from "playwright";
import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";
const [OUT, SECS = "12", VIEW = "carl"] = process.argv.slice(2);
// argv[4] "home": the bench's Home (0, −49.2, 2566.2) looking at the origin, fov 45 (take 2: the cloth face on with the logo)
const POSE = VIEW === "home" ? { p: [0, -49.2, 2566.2], t: [0, 0, 0] } : { p: [-475.4, 321.4, -397.8], t: [53, 229.6, -329.4] };
mkdirSync(OUT, { recursive: true });
const b = await chromium.launch({ channel: "chrome", args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-webgpu"] });
const p = await b.newPage({ viewport: { width: 1896, height: 946 }, deviceScaleFactor: 1 });
const errors = [];
p.on("pageerror", (e) => errors.push(String(e).slice(0, 300)));
p.on("console", (m) => (m.type() === "error" || m.type() === "warning") && errors.push(`${m.type()}: ${m.text().slice(0, 300)}`));
await p.goto("http://localhost:3000/proto/hero", { waitUntil: "load" });
await p.waitForFunction(() => window.__heroBench?.hero?.warmed === true, null, { timeout: 180000 });
await p.addStyleTag({ content: ".lil-gui, nextjs-portal { display: none !important; } [data-hero-bench] > div:not(.lil-gui) { display: none !important; }" });
await p.evaluate((POSE) => {
  const { hero, camera, controls } = window.__heroBench;
  camera.position.set(...POSE.p);
  controls.target.set(...POSE.t);
  camera.fov = 45;
  camera.updateProjectionMatrix();
  controls.update();
  hero.cloth.again();
}, POSE);
const frames = [];
for (let s = 0; s < Number(SECS); s++) {
  await p.waitForTimeout(1000);
  const f = `${OUT}/cloth-${String(s + 1).padStart(2, "0")}s.png`;
  await p.screenshot({ path: f });
  frames.push(f);
}
const info = await p.evaluate(() => window.__heroBench.hero.cloth.info);
await b.close();
console.log("cloth:", JSON.stringify(info));
console.log(`errors/warnings: ${errors.length}`, [...new Set(errors)].slice(0, 8));
const n = frames.length;
const cols = 4;
execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", ...frames.flatMap((f) => ["-i", f]), "-filter_complex", frames.map((_, i) => `[${i}]scale=632:-1[v${i}]`).join(";") + ";" + frames.map((_, i) => `[v${i}]`).join("") + `xstack=inputs=${n}:layout=${frames.map((_, i) => `${(i % cols) * 632}_${Math.floor(i / cols) * 316}`).join("|")}`, `${OUT}/sheet.png`]);
console.log(`sheet: ${OUT}/sheet.png`);
