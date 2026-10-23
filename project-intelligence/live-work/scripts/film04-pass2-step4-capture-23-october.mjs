/** FILM 04 PASS 2, STEP 4 — THE CAPTURES FOR CARL's EYE (23 October 2026; plan v2.1, Verification 7). "Your company" in
 *  brushed brass at the current defaults, 1920 × 1080, DPR 1 (Carl's density), dev server, badge hidden:
 *    stills front and oblique (canvas), a 3× face close-up; an ORBIT (the oblique view turned by hand); THE STUDIO TURNING
 *    (the studio-turn slider run 0° → 360°, front view — the brushed streaks and the edge's light moving).
 *    node …/film04-pass2-step4-capture-23-october.mjs <base> <outDir> <take>
 *  Videos are Playwright's WebM — convert to 1080p 30 fps CFR for Resolve.  ⚠ NOT WATCHED: whether it is good. */
import { chromium } from "playwright";
import { mkdirSync, readdirSync, renameSync } from "node:fs";

const [BASE = "http://localhost:3000", OUT = ".", TAKE = "take1"] = process.argv.slice(2);
mkdirSync(OUT, { recursive: true });
const VP = { width: 1920, height: 1080 };
const stamp = () => { const d = new Date(); const p = (n) => String(n).padStart(2, "0"); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}_${p(d.getHours())}${p(d.getMinutes())}`; };
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const open = async (ctx, q) => {
  const p = await ctx.newPage();
  await p.goto(`${BASE}/proto/showcase?layout=line&mode=material&${q}`, { waitUntil: "networkidle" });
  await p.waitForFunction(() => window.__showcaseBench?.ready, null, { timeout: 60000 });
  await p.addStyleTag({ content: "nextjs-portal{display:none!important}" });
  await p.waitForTimeout(900);
  return p;
};
const T = stamp();
{
  const ctx = await b.newContext({ viewport: VP, deviceScaleFactor: 1 });
  for (const [name, q] of [["front", "view=front&yaw=15"], ["oblique", "view=oblique&yaw=285"]]) {
    const p = await open(ctx, q);
    await p.screenshot({ path: `${OUT}/${T}_pass2-step4-${TAKE}_${name}.png`, clip: await p.locator("canvas").first().boundingBox() });
    await p.close();
  }
  await ctx.close();
  const c3 = await b.newContext({ viewport: VP, deviceScaleFactor: 3 });
  const p = await open(c3, "view=oblique&yaw=285");
  const c = await p.locator("canvas").first().boundingBox();
  await p.screenshot({ path: `${OUT}/${T}_pass2-step4-${TAKE}_oblique-face-close-3x.png`, clip: { x: c.x + c.width * 0.4, y: c.y + c.height * 0.38, width: c.width * 0.16, height: c.height * 0.22 } });
  await c3.close();
}
const record = async (name, q, act) => {
  const dir = `${OUT}/_rec`;
  const ctx = await b.newContext({ viewport: VP, deviceScaleFactor: 1, recordVideo: { dir, size: VP } });
  const p = await open(ctx, q);
  await act(p);
  await ctx.close();
  const f = readdirSync(dir).find((n) => n.endsWith(".webm"));
  if (f) renameSync(`${dir}/${f}`, `${OUT}/${T}_pass2-step4-${TAKE}_${name}.webm`);
};
await record("orbit", "view=oblique&yaw=285", async (p) => {
  const c = await p.locator("canvas").first().boundingBox();
  const cx = c.x + c.width / 2, cy = c.y + c.height / 2;
  await p.mouse.move(cx, cy);
  await p.mouse.down();
  for (let i = 0; i <= 90; i++) { await p.mouse.move(cx - i * 6, cy + Math.sin(i / 14) * 30); await p.waitForTimeout(33); }
  for (let i = 90; i >= -60; i--) { await p.mouse.move(cx - i * 6, cy + Math.sin(i / 14) * 30); await p.waitForTimeout(33); }
  await p.mouse.up();
  await p.waitForTimeout(800);
});
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
