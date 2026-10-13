/** §2's SEQUENCE, LOOKED AT (13 October 2026 — Carl: "Go and look at the sequence in Sect 2", for the "restart" design:
 *  after restart, card 1's neon flicker, then the text reveal and card 2's activation "in the normal way").
 *  `/about` at 1412 × 700 (Carl's window), scrolled to `#roles` (the Roles jump), filmed for SECS seconds; the sequence's own
 *  performance marks logged with their times from the ignition (`neon:ignite`, `neon:strike:<id>`, `neon:out:<id>`,
 *  `extrude:*`), and a frame taken ~1 s after each strike and ~0.3 s before each out.
 *  Usage: node …/about-s2-sequence-look.mjs [seconds]   (default 100)
 *  ⚠ NOT WATCHED: anything between the frames except in the film; Carl's Chrome. */
import { chromium } from "playwright";
import { mkdirSync, readdirSync, renameSync } from "node:fs";
import { join } from "node:path";
const SECS = Number(process.argv[2] ?? 100);
const OUT = "project-intelligence/live-work/screenshots/s2-sequence-13-october";
mkdirSync(OUT, { recursive: true });
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const ctx = await b.newContext({ viewport: { width: 1412, height: 700 }, recordVideo: { dir: join(OUT, "v"), size: { width: 1412, height: 700 } } });
const p = await ctx.newPage();
await p.goto("http://localhost:3000/about", { waitUntil: "load" });
await p.mouse.move(5, 5);
await p.waitForTimeout(2500);
await p.evaluate(() => document.querySelector("#roles").scrollIntoView({ block: "start" }));
const seen = new Set();
const t0 = Date.now();
let ign = null;
const shots = [];
while (Date.now() - t0 < SECS * 1000) {
  const marks = await p.evaluate(() => performance.getEntriesByType("mark").filter((m) => /^neon:|^extrude:/.test(m.name)).map((m) => [m.name, m.startTime]));
  for (const [n, t] of marks) {
    const k = `${n}@${Math.round(t)}`;
    if (seen.has(k)) continue;
    seen.add(k);
    if (n === "neon:ignite") ign = t;
    const rel = ign === null ? "(before ignition)" : `${((t - ign) / 1000).toFixed(1).padStart(6)} s`;
    console.log(`${rel}  ${n}`);
    if (/neon:strike:/.test(n)) shots.push([t + 1000, n.replace("neon:strike:", "strike-") + "+1s"]);
    if (/extrude:start/.test(n)) shots.push([t + 1500, n.replace(/[:]/g, "-") + "+1.5s"]);
  }
  const now = await p.evaluate(() => performance.now());
  for (const s of shots.filter(([at]) => at <= now && at > now - 600)) {
    const f = `${ign === null ? "pre" : ((s[0] - ign) / 1000).toFixed(1).padStart(5, "0")}s_${s[1]}.png`;
    if (!seen.has("shot:" + f)) { seen.add("shot:" + f); await p.screenshot({ path: join(OUT, f) }); }
  }
  await p.waitForTimeout(250);
}
await ctx.close(); await b.close();
const v = readdirSync(join(OUT, "v")).find((f) => f.endsWith(".webm")); if (v) renameSync(join(OUT, "v", v), join(OUT, "s2-sequence.webm"));
console.log(OUT);
