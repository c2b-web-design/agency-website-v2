/** IS THE WORKER'S SCRIPT REQUEST REALLY LEFT OPEN? (13 October 2026 — Playwright never sees it finish, so `networkidle`
 *  never comes on `/about`.) Loads `/about`; at 8 s reads the browser's own Resource Timing for the worker chunk (did a
 *  response arrive, and when did it end?) and Playwright's view (response status), and whether the mark was built.
 *  ⚠ NOT WATCHED: production (dev server only). */
import { chromium } from "playwright";
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
const pw = [];
p.on("request", async (r) => { if (/turbopack-worker/.test(r.url())) { const res = await r.response().catch(() => null); pw.push(`playwright: response ${res ? res.status() : "none"} for ${r.url().slice(-60)}`); } });
p.on("worker", (w) => pw.push(`worker started: ${w.url().slice(-60)}`));
await p.goto("http://localhost:3000/about", { waitUntil: "load" });
await p.waitForTimeout(8000);
const rt = await p.evaluate(() => performance.getEntriesByType("resource").filter((e) => /turbopack-worker|worker/.test(e.name)).map((e) => `${e.name.slice(-60)} — responseEnd ${e.responseEnd.toFixed(0)} ms, ${e.transferSize} B`));
console.log(pw.join("\n")); console.log("page resource timing:\n  " + (rt.join("\n  ") || "(no entry — worker script requests are timed in the worker's own context)"));
await b.close();
