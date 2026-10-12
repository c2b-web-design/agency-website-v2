/** THE MOVING SOFTBOX, FILMED — one loop and a half at 4x and at real size, with and without the helpers, into the film's
 *  `05 Pass 3 - Light` bin (D-088, 12 October 2026). Usage: node …/whoweare-moving-light-film.mjs <take> [extra query]. */
import { chromium } from "playwright";
import { appendFileSync, readdirSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { homedir, tmpdir } from "node:os";
const take = process.argv[2] ?? "moving1", extra = process.argv[3] ? "&" + process.argv[3] : "";
const FILM = join(homedir(), "Videos", "C2B Films", "01 Who we are button"), BIN = "05 Pass 3 - Light";
const pad = (n) => String(n).padStart(2, "0"), d = new Date();
const stamp = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}`;
// BASEQ= replaces the take-8 studio query (12 October, session 2: the painted metal, ?mode=teal&metalness=1&paintrough=0.4).
const BASE = "http://localhost:3000/proto/button?" + (process.env.BASEQ ?? "studio=teal&light=0&floor=0.6&fill=0.5") + extra;
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
for (const [q, name, note] of [["&zoom=4", "zoom4", "the moving softbox on its path at 4x"], ["&lighthelpers=1", "helpers", "the moving softbox with the light helpers: the studio's panels and the softbox on its path"], ["", "real-size", "the moving softbox at real size"]]) {
  const dir = join(tmpdir(), `wwa-${Date.now()}`);
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, recordVideo: { dir, size: { width: 1440, height: 900 } } });
  const p = await ctx.newPage();
  await p.goto(BASE + q, { waitUntil: "networkidle" });
  await p.evaluate(() => document.querySelectorAll("nextjs-portal").forEach((e) => e.remove()));
  await p.waitForTimeout(13000);
  await ctx.close();
  const webm = readdirSync(dir).find((f) => f.endsWith(".webm"));
  const mp4 = `${stamp}_light_${take}_${name}.mp4`;
  execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", "-i", join(dir, webm), "-c:v", "libx264", "-crf", "18", "-pix_fmt", "yuv420p", join(FILM, BIN, mp4)]);
  rmSync(dir, { recursive: true, force: true });
  appendFileSync(join(FILM, "shot-list.md"), `| ${d.toISOString().slice(0, 16).replace("T", " ")} | ${BIN}/${mp4} | light | ${take}: ${note} | - |\n`);
  console.log(mp4);
}
await b.close();
