/** WHEN DOES THE ROOM WARM? (13 October 2026, option A.) `/about` loaded at the top (or `#start` with an argument), sitting
 *  still; the times of `desk-mark:built`, each `room:precompiled`, `room:warm`, and the neon ignition, over 10 s.
 *  Usage: node …/about-warm-timing.mjs [hash]   ⚠ NOT WATCHED: anything but the marks. */
import { chromium } from "playwright";
const hash = process.argv[2] ? "#" + process.argv[2] : "";
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await p.goto("http://localhost:3000/about" + hash, { waitUntil: "load" });
await p.mouse.move(5, 5);
await p.waitForTimeout(10000);
const m = await p.evaluate(() => performance.getEntriesByType("mark").filter((x) => /desk-mark|room:|neon:ignite/.test(x.name)).map((x) => `${(x.startTime / 1000).toFixed(2)} s  ${x.name}`));
console.log(`/about${hash || " (top)"}:\n  ` + m.join("\n  "));
await b.close();
