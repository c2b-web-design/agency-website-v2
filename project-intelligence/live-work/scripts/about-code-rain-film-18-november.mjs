// THE /about VIDEO LOGO's CODE RAIN, FILMED (18 November 2026; homework for the hero's code drops, Carl: "go to the avout
// section and look at the video logo"). Carl's window size, dev server: the page scrolled down the desk mark's runway as
// `hit-rain-frames-22-october.mjs` does, then across the drop; Playwright's own recording (real time) into argv[2], and a
// contact sheet of the drop (4 fps). For LOOKING at the rain, not measuring it. ⚠ NOT WATCHED: Carl's GPU and Chrome,
// production, phones; the recording's frame rate is Playwright's.
// Usage: node project-intelligence/live-work/scripts/about-code-rain-film-18-november.mjs <outDir>
import { chromium } from "playwright";
import { execFileSync } from "node:child_process";
import { mkdirSync, readdirSync, renameSync } from "node:fs";
const [OUT] = process.argv.slice(2);
mkdirSync(OUT, { recursive: true });
const b = await chromium.launch({ channel: "chrome", args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist"] });
const ctx = await b.newContext({ viewport: { width: 1920, height: 952 }, recordVideo: { dir: OUT, size: { width: 1920, height: 952 } } });
const p = await ctx.newPage();
await p.goto("http://localhost:3000/about", { waitUntil: "load" });
await p.waitForTimeout(4000);
const bottom = await p.evaluate(() => document.querySelector("[data-mark-runway]").parentElement.getBoundingClientRect().bottom + scrollY);
for (let y = 0; y < bottom - 300; y += 60) {
  await p.evaluate((v) => scrollTo(0, v), y);
  await p.waitForTimeout(30);
}
for (let y = bottom - 300; y <= bottom - 6; y += 20) {
  await p.evaluate((v) => scrollTo(0, v), y);
  await p.waitForTimeout(60);
}
await p.waitForTimeout(1000);
const t0 = Date.now();
await p.evaluate((v) => scrollTo(0, v), bottom + 4);
await p.waitForTimeout(9000);
const startMs = await p.evaluate(() => performance.getEntriesByName("hit:shock")[0]?.startTime ?? null);
console.log("the drop crossed at the recording's +", Math.round((t0 - 0) / 1000), "s (wall); hit:shock mark:", startMs);
await ctx.close();
await b.close();
const webm = readdirSync(OUT).find((f) => f.endsWith(".webm"));
renameSync(`${OUT}/${webm}`, `${OUT}/about-code-rain.webm`);
const dur = +execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", `${OUT}/about-code-rain.webm`]).toString();
const from = Math.max(0, dur - 9.5);
execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", "-ss", String(from), "-i", `${OUT}/about-code-rain.webm`, "-vf", "fps=4,scale=480:-1,tile=6x6", "-frames:v", "1", `${OUT}/about-code-rain-sheet.png`]);
console.log(`film ${dur.toFixed(1)} s; sheet from ${from.toFixed(1)} s: ${OUT}/about-code-rain-sheet.png`);
