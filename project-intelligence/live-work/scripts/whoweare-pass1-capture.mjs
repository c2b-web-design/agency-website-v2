/** THE `Who we are` BUTTON, PASS 1 (THE MESH, IN CLAY) — CAPTURED FOR JUDGING AND FOR THE FILM. D-088, 12 October 2026.
 *  /proto/button at a FIXED 1440 × 900, DPR 1 (Architect, point 8), real GPU (headed, as the 10 October looks).
 *  Stills by page.screenshot() ONLY — never toDataURL (the preserveDrawingBuffer trap, nextstep-canvas.tsx:271).
 *  ⛔ STOPS, before any capture, if the label's box was read in anything but Geist, or if its height is not 41
 *  (the box rule not applied). The width is REPORTED, not judged (Architect, point 3).
 *  Writes into the film folder's `03 Pass 1 - Mesh` bin and appends every file to its `shot-list.md`.
 *  Usage: node …/whoweare-pass1-capture.mjs [take-name]   (dev server on :3000)
 *  ⚠ NOT WATCHED: Carl's Chrome and display; any DPR but 1; the home page (untouched in this pass). */
import { chromium } from "playwright";
import { appendFileSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { homedir, tmpdir } from "node:os";

const take = process.argv[2] ?? "take1";
const FILM = join(homedir(), "Videos", "C2B Films", "01 Who we are button");
const BIN = "03 Pass 1 - Mesh";
const dir = join(FILM, BIN);
mkdirSync(dir, { recursive: true });
const pad = (n) => String(n).padStart(2, "0");
const d = new Date();
const stamp = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}`;
const log = (file, note) => appendFileSync(join(FILM, "shot-list.md"), `| ${d.toISOString().slice(0, 16).replace("T", " ")} | ${BIN}/${file} | mesh | ${note} | - |\n`);

const URL = "http://localhost:3000/proto/button";
const vidTmp = join(tmpdir(), `whoweare-vid-${Date.now()}`);
const browser = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });

// ── The gate: font and height, read once before anything is captured ──
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
// Development-only clutter out of frame: Next's dev badge and the scrollbar (both in take 1's stills).
const CLEAN = () => { const st = document.createElement("style"); st.textContent = "nextjs-portal{display:none!important} html{scrollbar-width:none} ::-webkit-scrollbar{display:none}"; (document.head || document.documentElement).appendChild(st); };
await ctx.addInitScript(CLEAN);
const p = await ctx.newPage();
// ⚠ The init-script style did not survive hydration (take 2 still showed the badge and scrollbar), so the clean-up
// also runs after every load.
const clean = (pg) => pg.evaluate(() => {
  document.querySelectorAll("nextjs-portal").forEach((e) => e.remove());
  const st = document.createElement("style");
  st.textContent = "html{scrollbar-width:none} ::-webkit-scrollbar{display:none}";
  document.head.appendChild(st);
});
await p.goto(URL, { waitUntil: "networkidle" });
await p.evaluate(() => document.fonts.ready);
await p.waitForFunction(() => document.querySelector("#whoweare-pill")?.dataset.boxH);
const box = await p.evaluate(() => { const e = document.querySelector("#whoweare-pill"); return { w: +e.dataset.boxW, h: +e.dataset.boxH, font: e.dataset.font }; });
console.log(`measured: ${box.w} × ${box.h}   font: ${box.font}`);
if (!/geist/i.test(box.font)) { console.log("⛔ STOP — the box was not read in Geist."); await browser.close(); process.exit(2); }
if (box.h !== 41) { console.log(`⛔ STOP — height ${box.h}, not 41: the box rule was not applied.`); await browser.close(); process.exit(2); }

// ── Stills ──
const views = [
  ["", "bench_key-left", "The bench: Who we are in clay above the same shape at Next step's size; raking key from the left"],
  ["?key=right", "bench_key-right", "The same, key from the right: the groove and lower bevel turn the other way"],
  ["?label=1", "bench_label", "The clay pill with its label in place, at real size (label colour is pass 2's)"],
  ["?zoom=4", "zoom4_key-left", "4x camera zoom, key left. The ~2.3 px edge steps are inherited from Next step's grid, part of the family shape"],
  ["?zoom=4&key=right", "zoom4_key-right", "4x camera zoom, key right"],
  ["?zoom=4&profile=nextstep", "zoom4_BEFORE-nextstep-profile", "BEFORE: the same 4x view under Next step's own cross-section, its 6.6 px skirt"],
];
const files = [];
for (const [q, name, note] of views) {
  await p.goto(URL + q, { waitUntil: "networkidle" });
  await p.evaluate(() => document.fonts.ready);
  await clean(p);
  await p.waitForTimeout(1500);
  const f = `${stamp}_mesh_${take}_${name}.png`;
  await p.screenshot({ path: join(dir, f) });
  log(f, `${take}: ${note}`);
  files.push(f);
}
// A real-size close crop of the Who we are pill, key left.
await p.goto(URL, { waitUntil: "networkidle" });
await clean(p);
await p.waitForTimeout(1500);
const r = await p.evaluate(() => { const b = document.querySelector("#whoweare-pill").getBoundingClientRect(); return { x: b.x, y: b.y, w: b.width, h: b.height }; });
const crop = `${stamp}_mesh_${take}_close-real-size.png`;
await p.screenshot({ path: join(dir, crop), clip: { x: r.x - 60, y: r.y - 40, width: r.w + 120, height: r.h + 80 } });
log(crop, `${take}: close crop at real size (${box.w} × ${box.h})`);
files.push(crop);
await ctx.close();

// ── The tilt, as video: ~14 s at 4x so the dome's depth reads ──
const vctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, recordVideo: { dir: vidTmp, size: { width: 1440, height: 900 } } });
await vctx.addInitScript(CLEAN);
const vp = await vctx.newPage();
await vp.goto(URL + "?zoom=4&tilt=1", { waitUntil: "networkidle" });
await clean(vp);
await vp.waitForTimeout(14000);
await vctx.close();
await browser.close();
const webm = readdirSync(vidTmp).find((f) => f.endsWith(".webm"));
if (webm) {
  const mp4 = `${stamp}_mesh_${take}_tilt-zoom4.mp4`;
  // H.264 for Resolve (it does not reliably read Playwright's VP8 webm).
  execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", "-i", join(vidTmp, webm), "-c:v", "libx264", "-crf", "18", "-pix_fmt", "yuv420p", join(dir, mp4)]);
  log(mp4, `${take}: the slow tilt at 4x, so the dome, rim, groove and bevel turn their depth to the camera`);
  files.push(mp4);
}
rmSync(vidTmp, { recursive: true, force: true });
console.log(`✅ ${files.length} files → ${BIN}\n   ${files.join("\n   ")}`);
