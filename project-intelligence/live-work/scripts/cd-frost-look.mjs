/**
 * CD's frost in the room — 25 September 2026 (third session), after Carl unlocked roughness (0.35 → 0.25 on CD).
 * Plain `/about#roles`, the moving light held at a quiet point (`?lmfreeze=0.45`, both lights off every card's
 * peak) so the glass is judged, not the hotspot; helpers off. Saves the frame and CD cropped.
 *   node --no-warnings project-intelligence/live-work/scripts/cd-frost-look.mjs [label]
 * ⚠ NOT WATCHED: motion; Carl's eye on the running page is the verdict.
 */
import { chromium } from "playwright";
import sharp from "sharp";
import { mkdirSync } from "node:fs";
const label = process.argv[2] ?? "now";
const out = "project-intelligence/live-work/screenshots/cd-frost-25-september";
mkdirSync(out, { recursive: true });
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const p = await b.newPage({ viewport: { width: 1412, height: 700 }, deviceScaleFactor: 1.36 });
await p.goto("http://localhost:3000/about?lighthelpers=0&lmfreeze=0.45#roles", { waitUntil: "networkidle" });
await p.waitForTimeout(3000);
const png = await p.screenshot({ path: `${out}/${label}-frame.png` });
await sharp(png).extract({ left: 600, top: 650, width: 430, height: 230 }).toFile(`${out}/${label}-cd.png`);
await b.close();
console.log(`saved ${out}/${label}-frame.png and -cd.png`);
