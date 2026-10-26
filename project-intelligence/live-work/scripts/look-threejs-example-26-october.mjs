/** A LOOK AT A three.js EXAMPLE (26 October 2026) — Carl: "Go here and look at examples threejs.org". Loads
 *  threejs.org/examples/<name>.html in headed Chromium (GPU on), waits, screenshots it, and lists the page's console errors.
 *    node …/look-threejs-example-26-october.mjs <example name | full URL> <outFile> [waitMs]
 *  ⚠ NOT WATCHED: anything but one still; the example's own interaction. */
import { chromium } from "playwright";
const [NAME, OUT, WAIT = "4000"] = process.argv.slice(2);
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const p = await (await b.newContext({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 1 })).newPage();
const errs = []; p.on("pageerror", (e) => errs.push(String(e)));
await p.goto(/^https?:/.test(NAME) ? NAME : `https://threejs.org/examples/${NAME}.html`, { waitUntil: "networkidle", timeout: 60000 }).catch((e) => console.log(`goto: ${e.message.split(String.fromCharCode(10))[0]}`));
await p.waitForTimeout(Number(WAIT));
await p.screenshot({ path: OUT });
console.log(`${NAME}: shot · errors ${errs.length}${errs.length ? " — " + errs.join(" | ") : ""}`);
await b.close();
