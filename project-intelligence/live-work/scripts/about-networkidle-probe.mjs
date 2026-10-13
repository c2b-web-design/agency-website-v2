/** Does `/about` reach network-idle? (13 October 2026 — the verify script's reduced-motion context timed out on it.) Times
 *  `goto(networkidle)` with and without reduced motion, 2 each, and lists requests still open at 10 s if it hangs.
 *  ⚠ NOT WATCHED: anything but the network. */
import { chromium } from "playwright";
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
for (const reduced of [false, true, false, true]) {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: reduced ? "reduce" : "no-preference" });
  const p = await ctx.newPage();
  const open = new Map();
  p.on("request", (r) => open.set(r, r.url().replace("http://localhost:3000", "")));
  p.on("requestfinished", (r) => open.delete(r)); p.on("requestfailed", (r) => open.delete(r));
  const t0 = Date.now();
  const ok = await p.goto("http://localhost:3000/about", { waitUntil: "networkidle", timeout: 20000 }).then(() => true, () => false);
  console.log(`${reduced ? "reduced" : "normal "}: ${ok ? `network-idle at ${((Date.now() - t0) / 1000).toFixed(1)} s` : `⛔ not idle in 20 s; still open: ${[...open.values()].slice(0, 6).join(", ")}`}`);
  await ctx.close();
}
await b.close();
