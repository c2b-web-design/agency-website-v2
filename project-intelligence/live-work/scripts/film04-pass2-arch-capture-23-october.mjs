/** FILM 04 PASS 2 ON THE ARCH — THE CAPTURES FOR CARL's EYE (23 October 2026, session 2). "Your company logo" in the line's
 *  brushed brass, the grain laid as an arch's bricks (horizontal on the legs, radial over the curve), at the current
 *  defaults, 1920 × 1080, DPR 1 (Carl's density), dev server, badge hidden:
 *    stills front and oblique (canvas); a 3× close-up of the crown (the grain's direction visible); the STUDIO TURNING
 *    (front, 0° → 360°) — where the bricks show, as each letter catches the studio at its own angle.
 *    Prints each arch letter's grain angle (`reading.grainDeg`).
 *    node …/film04-pass2-arch-capture-23-october.mjs <base> <outDir> <take> [extra query]
 *  Videos are Playwright's WebM — convert to 1080p 30 fps CFR for Resolve.  ⚠ NOT WATCHED: whether it is good. */
import { chromium } from "playwright";
import { mkdirSync, readdirSync, renameSync } from "node:fs";

const [BASE = "http://localhost:3000", OUT = ".", TAKE = "take1", EXTRA = ""] = process.argv.slice(2);
mkdirSync(OUT, { recursive: true });
const VP = { width: 1920, height: 1080 };
const stamp = () => { const d = new Date(); const p = (n) => String(n).padStart(2, "0"); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}_${p(d.getHours())}${p(d.getMinutes())}`; };
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const open = async (ctx, q) => {
  const p = await ctx.newPage();
  await p.goto(`${BASE}/proto/showcase?mode=material&${q}${EXTRA ? `&${EXTRA}` : ""}`, { waitUntil: "networkidle" });
  await p.waitForFunction(() => window.__showcaseBench?.ready, null, { timeout: 60000 });
  await p.addStyleTag({ content: "nextjs-portal{display:none!important}" });
  await p.waitForTimeout(900);
  return p;
};
const T = stamp();
{
  const ctx = await b.newContext({ viewport: VP, deviceScaleFactor: 1 });
  for (const [name, q] of [["front", "view=front"], ["oblique", "view=oblique"]]) {
    const p = await open(ctx, q);
    if (name === "front") {
      const r = await p.evaluate(() => ({ tone: window.__showcaseToneMapping, arch: window.__showcaseBench.stats.arch }));
      console.log(`tone mapping ${r.tone} · legs ${r.arch.legPx.toFixed(1)} px · radius ${r.arch.radiusPx.toFixed(1)} px`);
      console.log(`grain (deg): ${r.arch.grainDeg.map((d) => d.toFixed(1)).join(" · ")}`);
    }
    await p.screenshot({ path: `${OUT}/${T}_pass2-arch-${TAKE}_${name}.png`, clip: await p.locator("canvas").first().boundingBox() });
    await p.close();
  }
  await ctx.close();
  const c3 = await b.newContext({ viewport: VP, deviceScaleFactor: 3 });
  const p = await open(c3, "view=front");
  const c = await p.locator("canvas").first().boundingBox();
  await p.screenshot({ path: `${OUT}/${T}_pass2-arch-${TAKE}_crown-close-3x.png`, clip: { x: c.x + c.width * 0.36, y: c.y + c.height * 0.2, width: c.width * 0.28, height: c.height * 0.3 } });
  await c3.close();
}
const record = async (name, q, act) => {
  const dir = `${OUT}/_rec`;
  const ctx = await b.newContext({ viewport: VP, deviceScaleFactor: 1, recordVideo: { dir, size: VP } });
  const p = await open(ctx, q);
  await act(p);
  await ctx.close();
  const f = readdirSync(dir).find((n) => n.endsWith(".webm"));
  if (f) renameSync(`${dir}/${f}`, `${OUT}/${T}_pass2-arch-${TAKE}_${name}.webm`);
};
await record("studio-turning", "view=front&yaw=0", async (p) => {
  await p.evaluate(async () => {
    const el = [...document.querySelectorAll('input[type="range"]')].find((e) => e.closest("label")?.textContent?.startsWith("studio turn"));
    const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
    for (let v = 0; v <= 360; v += 1) {
      set.call(el, String(v));
      el.dispatchEvent(new Event("input", { bubbles: true }));
      await new Promise((r) => setTimeout(r, 33));
    }
  });
  await p.waitForTimeout(800);
});
await b.close();
console.log(`captured to ${OUT} (${T}, ${TAKE})`);
