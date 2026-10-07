// Film the ivory Begin button's ENTRANCE on /start — 7 October 2026 (Carl: "an outside in circular wipe, the opposite
// to the begin button. Go look."). Headed, real GPU, Carl's viewport at DPR 3 (to read the button). Frames every ~250 ms
// densely from 4.5 s after load — the VISIBLE part of the reveal is the first fraction of its 5000 ms track.
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
const OUT = "project-intelligence/live-work/screenshots/start-begin-7-october";
mkdirSync(OUT, { recursive: true });
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const ctx = await b.newContext({ viewport: { width: 1412, height: 700 }, deviceScaleFactor: 3 });
const p = await ctx.newPage();
await p.goto("http://localhost:3000/start", { waitUntil: "networkidle" });
await p.addStyleTag({ content: "nextjs-portal { display: none !important; }" });
const t0 = Date.now();
const btn = p.getByRole("button", { name: /begin/i });
const r = await btn.evaluate((el) => { const q = el.getBoundingClientRect(); return { x: q.x, y: q.y, w: q.width, h: q.height }; });
const clip = { x: r.x - 30, y: r.y - 20, width: r.w + 60, height: r.h + 40 };
console.log("button box", r);
while (Date.now() - t0 < 4500) await p.waitForTimeout(20);
for (let i = 0; i < 70; i++) await p.screenshot({ path: `${OUT}/${String(i).padStart(2, "0")}-${Date.now() - t0}ms.png`, clip });
await b.close();
