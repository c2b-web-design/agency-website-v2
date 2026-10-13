/** WHY DOES `/about` NOT GO NETWORK-IDLE UNDER REDUCED MOTION? (13 October 2026 — the verify script timed out on it.) Logs
 *  every request for 12 s after load, with its time; ⚠ NOT WATCHED: anything but the network. */
import { chromium } from "playwright";
const reduced = process.argv[2] !== "normal";
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: reduced ? "reduce" : "no-preference" });
const p = await ctx.newPage();
const t0 = Date.now();
const counts = new Map();
p.on("request", (r) => { const u = r.url().replace("http://localhost:3000", "").slice(0, 90); counts.set(u, (counts.get(u) ?? 0) + 1); if (Date.now() - t0 > 3000) console.log(`${((Date.now() - t0) / 1000).toFixed(1)}s ${r.method()} ${u}`); });
await p.goto("http://localhost:3000/about", { waitUntil: "load" });
await p.evaluate(() => document.querySelector("#start").scrollIntoView({ block: "start" }));
await p.waitForTimeout(12000);
console.log(`(${reduced ? "reduced motion" : "normal"}) requests repeated more than twice:`, [...counts].filter(([, n]) => n > 2).map(([u, n]) => `${n}× ${u}`).join("\n  ") || "none");
await b.close();
