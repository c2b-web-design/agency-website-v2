import { chromium } from "playwright";
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
for (const dsf of [1, 2]) {
  const p = await (await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: dsf })).newPage();
  const seen = new Map(); let pending = new Set();
  p.on("request", (r) => { pending.add(r); });
  p.on("requestfinished", (r) => { pending.delete(r); const u = r.url().replace(/\?.*/, "").slice(-60); seen.set(u, (seen.get(u) ?? 0) + 1); });
  p.on("requestfailed", (r) => { pending.delete(r); });
  await p.goto("http://localhost:3000/about", { waitUntil: "load" });
  await p.waitForTimeout(12000);
  console.log(`DPR ${dsf}: requests ${[...seen.values()].reduce((a, c) => a + c, 0)}, repeated:`, [...seen].filter(([, n]) => n > 2).slice(0, 8));
  console.log("   still pending:", [...pending].map((r) => r.url().slice(-80)));
  await p.close();
}
await b.close();
