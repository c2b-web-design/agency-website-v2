/** WHEN DOES THE DESK MARK APPEAR? WORKER vs INLINE (13 October 2026). In `about-s2-sequence-look.mjs` the mark was NOT on the
 *  desk 1 s after the ignition and was by 3.9 s — R-039 has it on the desk (unlit) from the start. Did the worker
 *  (`desk-mark.worker.ts`) make it late? A: as built (the worker). B: the worker's script request ABORTED, so `DeskMark`
 *  falls back to the inline build (the old path). Each: `/about` loaded at the top; jumped to `#roles` at 300 ms (a fast
 *  Roles click); the desk's right end sampled every 100 ms — the mark's arrival is the first frame its region changes from
 *  the empty desk; the ignition time logged. 3 runs each, alternating.
 *  Usage: node …/desk-mark-arrival-ab.mjs [base url] [runs]
 *  ⚠ NOT WATCHED: arrival without the jump (sitting in §1); production; Carl's Chrome. The region is fixed for 1412 × 700. */
import { chromium } from "playwright";
import sharp from "sharp";
const BASE = process.argv[2] ?? "http://localhost:3000";
const RUNS = Number(process.argv[3] ?? 3);
const CLIP = { x: 1050, y: 420, width: 160, height: 110 }; // the desk's right end, where the mark stands, at 1412 × 700
const lum = async (buf) => { const { data } = await sharp(buf).removeAlpha().raw().toBuffer({ resolveWithObject: true }); let s = 0; for (let i = 0; i < data.length; i += 3) s += 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]; return s / (data.length / 3); };
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
async function run(blockWorker) {
  const ctx = await b.newContext({ viewport: { width: 1412, height: 700 } });
  if (blockWorker) await ctx.route(/desk-mark\.worker|turbopack-worker/, (r) => r.abort());
  const p = await ctx.newPage();
  let workerSeen = false;
  p.on("worker", () => (workerSeen = true));
  await p.goto(BASE + "/about", { waitUntil: "commit" });
  await p.waitForTimeout(300);
  await p.evaluate(() => document.querySelector("#roles")?.scrollIntoView({ block: "start" })).catch(() => {});
  const samples = [];
  const t0 = Date.now();
  while (Date.now() - t0 < 9000) {
    const t = await p.evaluate(() => performance.now()).catch(() => null);
    if (t === null) continue;
    samples.push([t, await lum(await p.screenshot({ clip: CLIP }))]);
    await p.waitForTimeout(60);
  }
  const ign = await p.evaluate(() => performance.getEntriesByName("neon:ignite")[0]?.startTime ?? null);
  await ctx.close();
  // the empty desk: the first samples once the page has painted; the mark = a lasting rise over that
  const late = samples.slice(-5).reduce((s, [, l]) => s + l, 0) / 5;
  const base = Math.min(...samples.slice(0, 8).map(([, l]) => l).filter((l) => l > 5));
  const arrive = samples.find(([, l], i) => i > 2 && Math.abs(l - base) > Math.abs(late - base) * 0.5)?.[0] ?? null;
  return { workerSeen, ign, arrive, base, late };
}
for (let i = 0; i < RUNS; i++) {
  for (const [name, block] of [["A worker", false], ["B inline", true]]) {
    const r = await run(block);
    console.log(`${name}: worker started ${r.workerSeen ? "yes" : "no"} · ignition ${r.ign ? (r.ign / 1000).toFixed(2) + " s" : "—"} · the mark's region changed at ${r.arrive ? (r.arrive / 1000).toFixed(2) + " s" : "—"} (desk lum ${r.base.toFixed(0)} → ${r.late.toFixed(0)})`);
  }
}
await b.close();
console.log("⚠ NOT WATCHED: arrival while sitting in §1; production; Carl's Chrome. A region change can also be light, not the mark — check the frames if the two arms disagree.");
