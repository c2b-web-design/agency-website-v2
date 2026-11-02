/** FILM 02 — `06G` AND `06H`, RESHOT (1 November 2026, session 2). Carl: "It doesnt have to be a close up image. The bench will
 *  have the controls on, the parameters. If its a close up theres nothing to distinguish a bench from a page. The dame coloured
 *  corner will connect the rwo." So: the bench with its controls, then §3 on the page, both full frame at the film's 1920 × 1080,
 *  against the LOCAL PRODUCTION build (port 3100), drawn at 2× and scaled down. No site change.
 *  ⛔ THE SAME COLOUR: pass 3 doubled the blue's studio on the page only (a9a886d, 19 October 16:47; the bench stays at 1 by
 *  design), after the 15:59 measurement these shots stand for, and film 02's light section comes after them. So the page is shot
 *  at gain 1: the served chunk is rewritten IN THIS BROWSER ONLY. Reduced motion holds its light at the approved pose.
 *  Usage: OUT=<folder> node …/film02-bench-and-page-reshoot-1-november.mjs */
import { chromium } from "playwright";
import sharp from "sharp";

const OUT = process.env.OUT;
if (!OUT) throw new Error("OUT is required");
const URL = "http://localhost:3100";
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
let gainHits = 0;
const open = async () => {
  const c = await b.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 2, reducedMotion: "reduce" });
  await c.route("**/_next/static/chunks/**/*.js", async (route) => {
    const res = await route.fetch();
    const text = await res.text();
    const next = text.replace("gain:{gold:1,blue:2}", "gain:{gold:1,blue:1}");
    if (next !== text) gainHits++;
    await route.fulfill({ response: res, body: next });
  });
  return c.newPage();
};
const save = async (p, name) => {
  // the white scrollbar strip the film crops off 33 clips (x 1905 to 1919); `--hide-scrollbars` does not reach it in a headed window
  await p.addStyleTag({ content: "*{scrollbar-width:none!important}*::-webkit-scrollbar{display:none!important}" });
  await p.waitForTimeout(1500);
  await sharp(await p.screenshot()).resize(1920, 1080, { kernel: "lanczos3" }).png().toFile(`${OUT}/${name}`);
  console.log(name);
};

const bench = await open();
await bench.goto(URL + "/proto/corner?view=box&mode=blue", { waitUntil: "networkidle" });
await bench.waitForFunction(() => window.__cornerBench?.ready, null, { timeout: 60000 });
await bench.waitForTimeout(3000);
await save(bench, "06G-bench.png");

const page = await open();
await page.goto(URL + "/", { waitUntil: "networkidle" });
const frame = "[data-corner-colour='blue']";
await page.evaluate((s) => {
  const f = document.querySelector(s);
  f.scrollIntoView({ block: "start" });
  let e = f;
  while (e && !e.scrollTop) e = e.parentElement;
  (e ?? document.scrollingElement).scrollTop -= innerHeight;
}, frame);
await page.waitForFunction((s) => document.querySelector(s)?.dataset.corners === "drawn", frame, { timeout: 60000 });
await page.evaluate(() => document.getElementById("work").scrollIntoView());
await page.waitForTimeout(3000);
console.log("corners:", await page.evaluate((s) => document.querySelector(s).dataset.corners, frame), "; gain rewritten in", gainHits, "chunk load(s)");
if (!gainHits) throw new Error("the page's gain was not rewritten");
await save(page, "06H-page.png");
await b.close();
