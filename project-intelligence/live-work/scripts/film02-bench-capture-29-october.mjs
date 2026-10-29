/** FILM 02 — THE CORNER BENCH IN MOTION (29 October 2026). Carl: *"Use stuff from the proto bench to pad it out."* The 19
 *  October captures were stills of each mode; these film the DIALS MOVING, so the viewer sees what each part does: the
 *  carving, the relief height, the key light, the inspection modes, an orbit, the old border against the corners (pass 1);
 *  the gold's roughness, the blue's tint and its clear coat (pass 2); the studio turning (pass 3).
 *  `/proto/corner` at 1920 × 1080, DPR 1, dev server, badge hidden. Captured through Chrome's own SCREENCAST (JPEG q92,
 *  every painted frame, with its timestamp) — not Playwright's ~1.5 Mbps recorder — then assembled at a CONSTANT 30 fps
 *  (each frame held until the next arrives), H.264 CRF 14, tagged BT.709 limited range.
 *    node …/film02-bench-capture-29-october.mjs [base] [ONLY=S1,S8,...]
 *  ⚠ NOT WATCHED: whether it is good (Carl's eye). Every dial ends on its TAKE value (the approved number). */
import { chromium } from "playwright";
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

const BASE = process.argv[2] ?? "http://localhost:3000";
const ONLY = (process.env.ONLY ?? "").split(",").filter(Boolean);
const F = "C:/Users/Carl Buckley/Videos/C2B Films/02 Ornate corners";
const VP = { width: 1920, height: 1080 };
const stamp = () => { const d = new Date(); const p = (n) => String(n).padStart(2, "0"); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}_${p(d.getHours())}${p(d.getMinutes())}`; };

const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const ctx = await b.newContext({ viewport: VP, deviceScaleFactor: 1 });
const p = await ctx.newPage();
const errors = [];
p.on("pageerror", (e) => errors.push(String(e)));

async function open(view, mode) {
  await p.goto(`${BASE}/proto/corner?view=${view}&mode=${mode}`, { waitUntil: "networkidle" });
  await p.addStyleTag({ content: "nextjs-portal{display:none!important}" });
  await p.waitForFunction(() => window.__cornerBench?.ready, null, { timeout: 60000 });
  // the picture at the top of the frame, the dials below it in view (unscrolled, the dial moved sat below the frame)
  await p.evaluate(() => { const c = document.querySelector("canvas").getBoundingClientRect(); window.scrollTo(0, window.scrollY + c.top - 16); });
  await p.waitForTimeout(1500);
}
// a dial, moved as a hand would: eased, the thumb visibly travelling; returns the take (the value it started on)
const dial = (label, to, ms) =>
  p.evaluate(async ([label, to, ms]) => {
    const span = [...document.querySelectorAll("label > span")].find((s) => s.textContent.trim() === label);
    const el = span?.parentElement.querySelector("input[type=range]");
    if (!el) throw new Error(`no dial "${label}"`);
    const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
    const from = Number(el.value);
    const target = to === "take" ? Number(el.dataset.take) : to;
    el.dataset.take ??= String(from);
    await new Promise((done) => {
      const t0 = performance.now();
      const step = (now) => {
        const x = Math.min(1, (now - t0) / ms), e = x * x * (3 - 2 * x);
        set.call(el, String(from + (target - from) * e));
        el.dispatchEvent(new Event("input", { bubbles: true }));
        if (x < 1) requestAnimationFrame(step); else done();
      };
      requestAnimationFrame(step);
    });
    return { from, target };
  }, [label, to, ms]);
const pick = (which, value) => p.locator("label", { hasText: which }).locator("select").first().selectOption(value);
const hold = (ms) => p.waitForTimeout(ms);
async function orbit(ms) {
  const c = await p.locator("canvas").first().boundingBox();
  const x0 = c.x + c.width * 0.5, y0 = c.y + c.height * 0.5;
  await p.mouse.move(x0, y0);
  await p.mouse.down();
  // ⚠ a ROCK either side, not a full turn: a relief seen edge-on is a line (the first take's 360° spent its middle there)
  const t0 = Date.now();
  for (let x = 0; x < 1; x = (Date.now() - t0) / ms) {
    const a = x * Math.PI * 2;
    // ONE-SIDED: out towards face-on and back. The oblique view already starts turned, so any swing the other way goes
    // edge-on (seen twice); +x turns it face-on (OrbitControls: 2π per canvas height of travel)
    await p.mouse.move(x0 + ((1 - Math.cos(a)) / 2) * c.width * 0.08, y0 - Math.sin(a) * c.height * 0.02);
    await hold(16);
  }
  await p.mouse.move(x0, y0);
  await p.mouse.up();
}

// Chrome's screencast: every painted frame, timestamped
async function film(bin, what, act) {
  const dir = join(tmpdir(), `film02-${what}`);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  const cdp = await ctx.newCDPSession(p);
  const frames = [];
  cdp.on("Page.screencastFrame", async ({ data, metadata, sessionId }) => {
    const f = join(dir, `${String(frames.length).padStart(5, "0")}.jpg`);
    writeFileSync(f, Buffer.from(data, "base64"));
    frames.push({ f, t: metadata.timestamp });
    await cdp.send("Page.screencastFrameAck", { sessionId }).catch(() => {});
  });
  await cdp.send("Page.startScreencast", { format: "jpeg", quality: 92, maxWidth: VP.width, maxHeight: VP.height, everyNthFrame: 1 });
  const t0 = Date.now() / 1000;
  await act();
  const t1 = Date.now() / 1000;
  await cdp.send("Page.stopScreencast");
  await cdp.detach();
  if (frames.length < 2) throw new Error(`${what}: ${frames.length} frames`);
  // each frame held until the next; the first from the start, the last to the end
  frames[0].t = Math.min(frames[0].t, t0);
  const list = frames.map((fr, i) => `file '${fr.f.replace(/\\/g, "/")}'\nduration ${((frames[i + 1]?.t ?? t1) - fr.t).toFixed(4)}`).join("\n") + `\nfile '${frames.at(-1).f.replace(/\\/g, "/")}'\n`;
  writeFileSync(join(dir, "list.txt"), list);
  const out = `${F}/${bin}/${stamp()}_bench_${what}_1080p30.mp4`;
  execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", "-f", "concat", "-safe", "0", "-i", join(dir, "list.txt"),
    "-vf", "fps=30,scale=1920:1080:in_range=pc:out_color_matrix=bt709:out_range=tv,format=yuv420p,setparams=color_primaries=bt709:color_trc=bt709:colorspace=bt709:range=tv",
    "-c:v", "libx264", "-preset", "slow", "-crf", "14", "-movflags", "+faststart", out]);
  const fps = frames.length / (t1 - t0);
  console.log(`${what.padEnd(28)} ${(t1 - t0).toFixed(1).padStart(5)} s  ${frames.length} frames (${fps.toFixed(0)} painted/s)  → ${bin}`);
  rmSync(dir, { recursive: true, force: true });
}

const SHOTS = {
  // ── PASS 1, THE SHAPE (clay) ──
  S1: ["03 Pass 1 - Shape", "carving-smooth-to-relief", async () => { await open("oblique", "clay"); await film("03 Pass 1 - Shape", "carving-smooth-to-relief", async () => { await hold(1500); const d = await dial("carving", 0, 2500); await hold(1200); await dial("carving", d.from, 6000); await hold(2000); }); }],
  S2: ["03 Pass 1 - Shape", "relief-height", async () => { await open("oblique", "clay"); await film("03 Pass 1 - Shape", "relief-height", async () => { await hold(1200); const d = await dial("relief height", 0.8, 3000); await dial("relief height", 6, 4000); await dial("relief height", d.from, 3000); await hold(1800); }); }],
  S3: ["03 Pass 1 - Shape", "key-light-sweep", async () => { await open("oblique", "clay"); await film("03 Pass 1 - Shape", "key-light-sweep", async () => { await hold(1200); const d = await dial("key azimuth", -90, 3000); await dial("key azimuth", 90, 6000); await dial("key azimuth", d.from, 3000); await hold(1500); }); }],
  S4: ["03 Pass 1 - Shape", "inspection-modes", async () => { await open("oblique", "clay"); await film("03 Pass 1 - Shape", "inspection-modes", async () => { await hold(3000); for (const m of ["mesh", "zebra", "normals", "clay"]) { await pick("mode", m); await hold(3200); } }); }],
  S5: ["03 Pass 1 - Shape", "orbit-clay", async () => { await open("oblique", "clay"); await film("03 Pass 1 - Shape", "orbit-clay", async () => { await hold(1200); await orbit(9000); await hold(1200); }); }],
  S6: ["03 Pass 1 - Shape", "true-size-old-border-against-corners", async () => { await open("box", "gold"); await film("03 Pass 1 - Shape", "true-size-old-border-against-corners", async () => { const box = p.locator("label", { hasText: "the old border" }).locator("input"); await hold(3000); await box.check(); await hold(3000); await box.uncheck(); await hold(3000); await box.check(); await hold(2000); await box.uncheck(); await hold(3000); }); }],
  S7: ["03 Pass 1 - Shape", "close-limit-lines", async () => { await open("close", "clay"); await film("03 Pass 1 - Shape", "close-limit-lines", async () => { const g = p.locator("label", { hasText: "limit lines" }).locator("input"); await hold(2500); await g.check(); await hold(4000); await g.uncheck(); await hold(2000); }); }],
  // ── PASS 2, THE MATERIAL ──
  S8: ["04 Pass 2 - Material", "gold-roughness-mirror-to-satin", async () => { await open("oblique", "gold"); await film("04 Pass 2 - Material", "gold-roughness-mirror-to-satin", async () => { await hold(1500); const d = await dial("roughness", 0.05, 3000); await hold(1000); await dial("roughness", 0.9, 4000); await dial("roughness", d.from, 3000); await hold(2000); }); }],
  S9: ["04 Pass 2 - Material", "blue-platinum-swatch-enamel", async () => { await open("oblique", "blue"); await film("04 Pass 2 - Material", "blue-platinum-swatch-enamel", async () => { await hold(1500); const d = await dial("blue tint", 0, 2500); await hold(1200); await dial("blue tint", 1, 4000); await hold(1200); await dial("blue tint", d.from, 3000); await hold(2000); }); }],
  S10: ["04 Pass 2 - Material", "blue-clear-coat-on", async () => { await open("oblique", "blue"); await film("04 Pass 2 - Material", "blue-clear-coat-on", async () => { await hold(1500); const d = await dial("clear coat", 0, 2000); await hold(1500); await dial("clear coat", d.from, 4000); await hold(2000); }); }],
  // ── PASS 3, THE LIGHT ──
  S11: ["05 Pass 3 - Light", "studio-turning-gold", async () => { await open("oblique", "gold"); await film("05 Pass 3 - Light", "studio-turning-gold", async () => { await hold(1200); const d = await dial("studio turned", 0, 1500); await dial("studio turned", 359, 12000); await dial("studio turned", d.from, 1500); await hold(1200); }); }],
  S12: ["05 Pass 3 - Light", "studio-turning-blue", async () => { await open("oblique", "blue"); await film("05 Pass 3 - Light", "studio-turning-blue", async () => { await hold(1200); const d = await dial("studio turned", 0, 1500); await dial("studio turned", 359, 12000); await dial("studio turned", d.from, 1500); await hold(1200); }); }],
  S13: ["05 Pass 3 - Light", "orbit-gold", async () => { await open("oblique", "gold"); await film("05 Pass 3 - Light", "orbit-gold", async () => { await hold(1000); await orbit(9000); await hold(1000); }); }],
  S14: ["05 Pass 3 - Light", "orbit-blue", async () => { await open("oblique", "blue"); await film("05 Pass 3 - Light", "orbit-blue", async () => { await hold(1000); await orbit(9000); await hold(1000); }); }],
};
for (const [id, [, , run]] of Object.entries(SHOTS)) if (!ONLY.length || ONLY.includes(id)) await run();
console.log(errors.length ? `⚠ page errors: ${errors.join(" | ")}` : "page errors: none");
await b.close();
