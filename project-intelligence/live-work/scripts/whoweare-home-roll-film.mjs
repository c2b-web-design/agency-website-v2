/** THE ROLL ON THE HOME PAGE, FILMED (D-088, 12 October 2026, session 2). The #contact section at 1440 × 900: the button
 *  rolling free, then the pointer comes within reach (the hold eases it onto a face), stays, and leaves (it resumes).
 *  Two cuts into `06 On the page`: the whole section, and the button cropped at 2× (scaled up, nearest-neighbour off).
 *  ⚠ recordVideo, not page.screenshot (a screenshot fires stray pointer events that release the hold —
 *  live-work/screenshot-fires-pointermove-12-october.md); whether recordVideo does the same is unverified — the hold's
 *  `data-hold` is logged at each step so the film can be checked against it. The pointer itself is not drawn. */
import { chromium } from "playwright";
import { appendFileSync, readdirSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { homedir, tmpdir } from "node:os";
const FILM = join(homedir(), "Videos", "C2B Films", "01 Who we are button"), BIN = "06 On the page";
const pad = (n) => String(n).padStart(2, "0"), d = new Date();
const stamp = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}`;
const take = process.argv[2] ?? "roll1";
const log = (f, note) => appendFileSync(join(FILM, "shot-list.md"), `| ${d.toISOString().slice(0, 16).replace("T", " ")} | ${BIN}/${f} | page | ${note} | - |\n`);
const dir = join(tmpdir(), `wwa-home-${Date.now()}`);
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, recordVideo: { dir, size: { width: 1440, height: 900 } } });
const p = await ctx.newPage();
// Q= a query string (e.g. "?lighthelpers=1" — the helpers film, 12 October, session 2).
await p.goto("http://localhost:3000/" + (process.env.Q ?? ""), { waitUntil: "networkidle" });
await p.evaluate(() => document.fonts.ready);
await p.evaluate(() => document.querySelector("#contact").scrollIntoView({ block: "start" }));
await p.evaluate(() => document.querySelectorAll("nextjs-portal").forEach((e) => e.remove()));
await p.mouse.move(40, 40, { steps: 4 });
const A = '#contact a[href="/about"]';
const r = await p.evaluate((A) => { const e = document.querySelector(A).getBoundingClientRect(); return { x: e.x, y: e.y, w: e.width, h: e.height }; }, A);
await p.waitForTimeout(20000);
console.log("free:", await p.getAttribute(A, "data-hold"));
await p.mouse.move(r.x + r.w / 2, r.y - 40, { steps: 30 });
await p.waitForTimeout(5000);
console.log("pointer near:", await p.getAttribute(A, "data-hold"));
await p.mouse.move(40, 40, { steps: 30 });
await p.waitForTimeout(8000);
console.log("pointer gone:", await p.getAttribute(A, "data-hold"));
await ctx.close();
await b.close();
const webm = join(dir, readdirSync(dir).find((f) => f.endsWith(".webm")));
const whole = `${stamp}_page_${take}_section.mp4`, close = `${stamp}_page_${take}_button-2x.mp4`;
execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", "-i", webm, "-c:v", "libx264", "-crf", "18", "-pix_fmt", "yuv420p", join(FILM, BIN, whole)]);
const cx = Math.round(r.x + r.w / 2 - 220), cy = Math.round(r.y + r.h / 2 - 90);
execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", "-i", webm, "-vf", `crop=440:180:${cx}:${cy},scale=880:360:flags=lanczos`, "-c:v", "libx264", "-crf", "16", "-pix_fmt", "yuv420p", join(FILM, BIN, close)]);
rmSync(dir, { recursive: true, force: true });
log(whole, `${take}: the roll on the home page${process.env.Q ? " (" + process.env.Q + ")" : ""} - the section; free 20 s, the pointer near (held), then gone (resumes)`);
log(close, `${take}: the same, the button cropped and scaled 2x`);
console.log(whole, close);
