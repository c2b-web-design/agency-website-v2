/** FILM 04 — A STILL OF `/proto/your-words` (23 October 2026, session 2): viewport <n> at 1920 × 1080, at DPR <dpr>, optional
 *  query, optional crop (fractions x,y,w,h of the window).
 *    node …/film04-your-words-still-23-october.mjs <base> <outFile> <viewport 1|2> <dpr> [query] [crop]
 *  ⚠ NOT WATCHED: anything — a still for an eye. */
import { chromium } from "playwright";
const [BASE, OUT, VP = "1", DPR = "1", Q = "", CROP = ""] = process.argv.slice(2);
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const p = await (await b.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: Number(DPR) })).newPage();
await p.goto(`${BASE}/proto/your-words${Q ? `?${Q}` : ""}`, { waitUntil: "networkidle" });
await p.waitForFunction(() => [...document.querySelectorAll("[data-your-words]")].every((s) => s.dataset.yourWords === "drawn"), null, { timeout: 60000 });
await p.addStyleTag({ content: "nextjs-portal{display:none!important}" });
await p.evaluate((k) => window.scrollTo(0, k * window.innerHeight), Number(VP) - 1);
await p.waitForTimeout(800);
const c = CROP ? CROP.split(",").map(Number) : null;
await p.screenshot({ path: OUT, ...(c ? { clip: { x: c[0] * 1920, y: c[1] * 1080, width: c[2] * 1920, height: c[3] * 1080 } } : {}) });
await b.close();
