/** FILM 04 — VIEWPORT 2's CAMERA JOURNEY, FILMED IN REAL TIME (26 October 2026). Opens `/proto/your-words`, scrolls viewport 2
 *  into view (the journey's clock runs only while it is on screen, so it starts there), and records `seconds` of it —
 *  Playwright's WebM at 1920 × 1080, DPR 1, dev server, badge hidden. Prints where the recording's journey starts.
 *    node …/film04-journey-film-26-october.mjs <base> <outDir> <name> [seconds] [extra query]
 *  Convert for Resolve: 1080p 30 fps CFR (`reference_film_edit_pipeline`).  ⚠ NOT WATCHED: whether it is good (Carl's eye);
 *  a dev server's frame pacing is not production's. */
import { chromium } from "playwright";
import { mkdirSync, renameSync } from "node:fs";

const [BASE = "http://localhost:3000", OUT = ".", NAME = "journey", SECONDS = "33", EXTRA = ""] = process.argv.slice(2);
mkdirSync(OUT, { recursive: true });
const VP = { width: 1920, height: 1080 };
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const ctx = await b.newContext({ viewport: VP, deviceScaleFactor: 1, recordVideo: { dir: OUT, size: VP } });
const p = await ctx.newPage();
const t0 = Date.now();
await p.goto(`${BASE}/proto/your-words${EXTRA ? `?${EXTRA}` : ""}`, { waitUntil: "networkidle" });
await p.addStyleTag({ content: "nextjs-portal{display:none!important}" });
await p.waitForTimeout(1500);
await p.locator("canvas").nth(1).scrollIntoViewIfNeeded();
console.log(`viewport 2 on screen at ${((Date.now() - t0) / 1000).toFixed(2)} s into the recording`);
await p.waitForTimeout(Number(SECONDS) * 1000);
const v = p.video();
await ctx.close();
const path = await v.path();
renameSync(path, `${OUT}/${NAME}.webm`);
console.log(`→ ${OUT}/${NAME}.webm`);
await b.close();
