/** WHICH PAGES FETCH THE FAMILY's HDRI (15 October 2026): the teal (home) and, since the same day, the gold
 *  (/about §4) carry the studio's reflection; the blue (/start) is held at none. Waits 6 s on each page.
 *  ⚠ NOT WATCHED: /start past the opening (the host is built during it — check 1 of nextstep-rollout-verify). */
import { chromium } from "playwright";
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
let bad = 0;
for (const [url, want] of [["/#contact", 1], ["/about#start", 1], ["/start", 0]]) {
  const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  let n = 0, bytes = 0;
  p.on("response", async (r) => { if (r.url().endsWith(".hdr")) { n++; try { bytes = (await r.body()).length; } catch {} } });
  await p.goto("http://localhost:3000" + url, { waitUntil: "load" });
  await p.waitForTimeout(6000);
  const ok = (n > 0 ? 1 : 0) === want; if (!ok) bad++;
  console.log(`${ok ? "✅" : "⛔"} ${url.padEnd(14)} .hdr fetched ${n}× ${bytes ? `(${(bytes / 1e6).toFixed(2)} MB)` : ""} — expected ${want ? "yes" : "no"}`);
  await p.close();
}
await b.close();
console.log(bad ? "⛔ FAILED" : "✅ the home page and /about fetch the studio; /start does not");
