/** FILM 04 — THE SHOWCASE'S LETTERING: the Builder's captures (22 October 2026, session 2). Capture from the first frame,
 *  unprompted (Carl must never be seen asking). Saved into the film's bins (`Videos/C2B Films/04 Extruded lettering/`),
 *  named `YYYY-MM-DD_HHMM_stage_what`, 1920 × 1080, DPR 1 (Carl's density). Against the dev server, with Next's dev badge
 *  HIDDEN by a style rule (`nextjs-portal`) — the frame is the bench as a client sees it, without a production rebuild. Videos are Playwright's WebM; convert to 1080p 30 fps CFR for Resolve.
 *    node …/film04-capture-22-october.mjs <base> <outDir> <take-label> [ONLY=stills,yclose,orbit,swap]
 *  ⚠ NOT WATCHED: whether a frame is GOOD — these are records of each take, judged by eye. */
import { chromium } from "playwright";
import { mkdirSync, renameSync, readdirSync } from "node:fs";
const [BASE = "http://localhost:3100", OUT = ".", TAKE = "take1"] = process.argv.slice(2);
const VP = { width: 1920, height: 1080 };
const stamp = () => { const d = new Date(); const p = (n) => String(n).padStart(2, "0"); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}_${p(d.getHours())}${p(d.getMinutes())}`; };
const ONLY = (process.env.ONLY ?? "").split(",").filter(Boolean);
const want = (k) => !ONLY.length || ONLY.includes(k);
mkdirSync(OUT, { recursive: true });
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const ready = (p) =>
  p.waitForFunction(() => window.__showcaseBench?.ready, null, { timeout: 30000 })
    .then(() => p.addStyleTag({ content: "nextjs-portal{display:none!important}" }))
    .then(() => p.waitForTimeout(500));
const canvasBox = (p) => p.locator("canvas").first().boundingBox();

// A. stills — every mode, both views, the canvas only
if (want("stills")) {
  const p = await (await b.newContext({ viewport: VP, deviceScaleFactor: 1 })).newPage();
  for (const view of ["front", "oblique"])
    for (const mode of ["clay", "flat", "mesh", "normals", "zebra"]) {
      await p.goto(`${BASE}/proto/showcase?view=${view}&mode=${mode}`, { waitUntil: "networkidle" });
      await ready(p);
      await p.screenshot({ path: `${OUT}/${stamp()}_pass1-${TAKE}_${view}-${mode}.png`, clip: await canvasBox(p) });
    }
  await p.goto(`${BASE}/proto/showcase`, { waitUntil: "networkidle" });
  await ready(p);
  await p.screenshot({ path: `${OUT}/${stamp()}_pass1-${TAKE}_bench-whole.png`, fullPage: true });
  await p.context().close();
}

// B. the Y's inside corner, close — at DPR 3 so the facets can be read (a magnifier, not Carl's view)
if (want("yclose")) {
  const p = await (await b.newContext({ viewport: VP, deviceScaleFactor: 3 })).newPage();
  for (const mode of ["normals", "zebra", "clay"]) {
    await p.goto(`${BASE}/proto/showcase?view=front&mode=${mode}`, { waitUntil: "networkidle" });
    await ready(p);
    const c = await canvasBox(p);
    // the Y sits at the left of the words: the words fill 70% of the canvas, centred
    const left = c.x + c.width * 0.15, mid = c.y + c.height / 2;
    await p.screenshot({ path: `${OUT}/${stamp()}_pass1-${TAKE}_Y-close-${mode}.png`, clip: { x: left - 10, y: mid - 120, width: 220, height: 200 } });
  }
  await p.context().close();
}

// C. the orbit — the words turned by hand in the oblique view
if (want("orbit")) {
  const dir = `${OUT}/_rec`;
  const ctx = await b.newContext({ viewport: VP, deviceScaleFactor: 1, recordVideo: { dir, size: VP } });
  const p = await ctx.newPage();
  await p.goto(`${BASE}/proto/showcase?view=oblique&mode=clay`, { waitUntil: "networkidle" });
  await ready(p);
  const c = await canvasBox(p);
  const cx = c.x + c.width / 2, cy = c.y + c.height / 2;
  await p.waitForTimeout(800);
  await p.mouse.move(cx, cy);
  await p.mouse.down();
  for (let i = 0; i <= 90; i++) { await p.mouse.move(cx - i * 6, cy + Math.sin(i / 14) * 30); await p.waitForTimeout(33); }
  for (let i = 90; i >= -60; i--) { await p.mouse.move(cx - i * 6, cy + Math.sin(i / 14) * 30); await p.waitForTimeout(33); }
  await p.mouse.up();
  await p.waitForTimeout(800);
  await ctx.close();
  const f = readdirSync(dir).find((n) => n.endsWith(".webm"));
  if (f) renameSync(`${dir}/${f}`, `${OUT}/${stamp()}_pass1-${TAKE}_orbit-clay.webm`);
}

// E. the bend (take 2) — the arch's sweep run from 20° up to 180° by the slider: the straight word raised into the arch
if (want("sweep")) {
  const dir = `${OUT}/_rec`;
  const ctx = await b.newContext({ viewport: VP, deviceScaleFactor: 1, recordVideo: { dir, size: VP } });
  const p = await ctx.newPage();
  await p.goto(`${BASE}/proto/showcase?view=front&mode=clay&sweep=20`, { waitUntil: "networkidle" });
  await ready(p);
  await p.waitForTimeout(1200);
  const ticks = await p.evaluate(async () => {
    const el = [...document.querySelectorAll('input[type="range"]')].find((e) => e.closest("label")?.textContent?.includes("arch sweep"));
    const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
    const t = [];
    for (let v = 20; v <= 180; v += 1) {
      const t0 = performance.now();
      set.call(el, String(v));
      el.dispatchEvent(new Event("input", { bubbles: true }));
      await new Promise((r) => requestAnimationFrame(() => r()));
      t.push(performance.now() - t0);
      await new Promise((r) => setTimeout(r, 22));
    }
    return t;
  });
  await p.waitForTimeout(2000);
  await ctx.close();
  const f = readdirSync(dir).find((n) => n.endsWith(".webm"));
  if (f) renameSync(`${dir}/${f}`, `${OUT}/${stamp()}_pass1-${TAKE}_bend-20-to-180.webm`);
  ticks.sort((x, y) => x - y);
  console.log(`bend: ${ticks.length} ticks, input → next frame median ${ticks[ticks.length >> 1].toFixed(1)} ms, worst ${ticks[ticks.length - 1].toFixed(1)} ms`);
}

// D. the swap — the words typed in, the setting rebuilt (the template's own demonstration, in miniature)
if (want("swap")) {
  const dir = `${OUT}/_rec`;
  const ctx = await b.newContext({ viewport: VP, deviceScaleFactor: 1, recordVideo: { dir, size: VP } });
  const p = await ctx.newPage();
  await p.goto(`${BASE}/proto/showcase?view=front&mode=clay`, { waitUntil: "networkidle" });
  await ready(p);
  await p.waitForTimeout(1000);
  const input = p.locator("input:not([type])").first();
  await input.click({ clickCount: 3 });
  await input.pressSequentially("Your logo", { delay: 140 });
  await p.waitForTimeout(2000);
  await input.click({ clickCount: 3 });
  await input.pressSequentially("Your company", { delay: 140 });
  await p.waitForTimeout(2000);
  await ctx.close();
  const f = readdirSync(dir).find((n) => n.endsWith(".webm"));
  if (f) renameSync(`${dir}/${f}`, `${OUT}/${stamp()}_pass1-${TAKE}_swap-words.webm`);
}
await b.close();
console.log(`captured to ${OUT}`);
