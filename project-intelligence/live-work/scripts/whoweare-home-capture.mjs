/** THE HOME PAGE's `Who we are` BUTTON, CAPTURED IN PLACE — before and after the rollout (D-088, 12 October 2026).
 *  The closing section (#contact) at a fixed 1440 × 900, DPR 1, real GPU; a section still, a close crop, a hover still.
 *  Usage: node …/whoweare-home-capture.mjs <tag> [query]   → the film folder's `06 On the page` bin, logged.
 *  ⚠ NOT WATCHED: other viewports; Carl's display; the rest of the home page. */
import { chromium } from "playwright";
import { appendFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";
const tag = process.argv[2] ?? "before";
const query = process.argv[3] ?? "";
const FILM = join(homedir(), "Videos", "C2B Films", "01 Who we are button");
const BIN = "06 On the page";
mkdirSync(join(FILM, BIN), { recursive: true });
const pad = (n) => String(n).padStart(2, "0");
const d = new Date();
const stamp = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}`;
const log = (f, note) => appendFileSync(join(FILM, "shot-list.md"), `| ${d.toISOString().slice(0, 16).replace("T", " ")} | ${BIN}/${f} | page | ${note} | - |\n`);
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const p = await (await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 })).newPage();
await p.goto("http://localhost:3000/" + query, { waitUntil: "networkidle" });
await p.evaluate(() => document.fonts.ready);
await p.evaluate(() => document.querySelector("#contact").scrollIntoView({ block: "start" }));
await p.evaluate(() => { document.querySelectorAll("nextjs-portal").forEach((e) => e.remove()); const st = document.createElement("style"); st.textContent = "html{scrollbar-width:none} ::-webkit-scrollbar{display:none}"; document.head.appendChild(st); });
await p.waitForTimeout(2500);
const a = await p.evaluate(() => { const e = [...document.querySelectorAll("#contact a")].find((x) => /who we are/i.test(x.textContent)); const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; });
console.log(`the link: ${a.w.toFixed(1)} × ${a.h.toFixed(1)} at (${a.x.toFixed(1)}, ${a.y.toFixed(1)})`);
const shots = [];
const f1 = `${stamp}_page_${tag}_section.png`; await p.screenshot({ path: join(FILM, BIN, f1) }); log(f1, `${tag}: the home page's closing section`); shots.push(f1);
const clip = { x: a.x - 80, y: a.y - 50, width: a.w + 160, height: a.h + 100 };
const f2 = `${stamp}_page_${tag}_close.png`; await p.screenshot({ path: join(FILM, BIN, f2), clip }); log(f2, `${tag}: the button close, at real size`); shots.push(f2);
await p.mouse.move(a.x + a.w / 2, a.y + a.h / 2); await p.waitForTimeout(600);
const f3 = `${stamp}_page_${tag}_hover.png`; await p.screenshot({ path: join(FILM, BIN, f3), clip }); log(f3, `${tag}: the button on hover`); shots.push(f3);
await b.close();
console.log(shots.join("\n"));
