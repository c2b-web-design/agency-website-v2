/** THE FAMILY BUTTONS' STILLS — each button's own first frame, read from its live canvas (13 October 2026, the cold-load
 *  fix; `components/home/whoweare-button.tsx`, `MEMBERS`). With reduced motion the scene draws exactly the frame the live
 *  button opens on — face-on, the clay's lamps, no roll, no moving lamp. Its pixels are READ FROM THE CANVAS ITSELF
 *  (`readPixels` in the same task as the draw, so the drawing buffer is intact) at the canvas's own backing size, at 1× and
 *  2× density — not a page screenshot, whose clip rounds a fractional box (the first take came out 286 × 109 for a
 *  286.9 × 110 canvas). Premultiplied alpha undone; flipped upright. → `public/buttons/<member>-rest@{1,2}x.png`.
 *  ⛔ RE-RUN AFTER ANY CHANGE TO A LOOK, THE GEOMETRY, THE LABEL OR THE SIZE. The dev server must be running on :3000.
 *  ⛔ FAILS LOUDLY if the canvas is not the link's box + STILL_PAD (14) each side — the still is laid over exactly that box.
 *  Usage: node …/family-button-stills.mjs
 *  ⚠ NOT WATCHED: densities above 2 (the canvas caps at 2 too); Carl's GPU (rendered on this machine's). */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
const OUT = join(process.cwd(), "public", "buttons");
mkdirSync(OUT, { recursive: true });
const STILL_PAD = 14;
const MEMBERS = [
  { member: "whoweare", url: "http://localhost:3000/", section: "#contact", link: '#contact a[href="/about"]' },
  { member: "start", url: "http://localhost:3000/about", section: "#start", link: '#start a[href="/start"]' },
];

/** In the page: every WebGL context remembered; after any animation-frame callback that drew to a context, its drawing
 *  buffer is read (same task — before the browser presents and clears it) and kept as that canvas's latest frame. */
function grabber() {
  const ctxs = [];
  const orig = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function (type, ...rest) {
    const c = orig.call(this, type, ...rest);
    if (/webgl/.test(type) && c && !c.__rec) {
      const rec = { gl: c, canvas: this, draws: 0 };
      c.__rec = rec; ctxs.push(rec);
      for (const fn of ["drawElements", "drawArrays", "drawElementsInstanced", "drawArraysInstanced"]) {
        const f = c[fn]; if (typeof f === "function") c[fn] = function (...a) { rec.draws++; return f.apply(this, a); };
      }
    }
    return c;
  };
  const raf = window.requestAnimationFrame.bind(window);
  window.requestAnimationFrame = (cb) => raf((t) => {
    const before = ctxs.map((r) => r.draws);
    cb(t);
    ctxs.forEach((r, i) => {
      if (r.draws === before[i]) return;
      const gl = r.gl, W = gl.drawingBufferWidth, H = gl.drawingBufferHeight, px = new Uint8Array(W * H * 4);
      gl.readPixels(0, 0, W, H, gl.RGBA, gl.UNSIGNED_BYTE, px);
      r.canvas.__last = { W, H, px, cssW: r.canvas.clientWidth, cssH: r.canvas.clientHeight };
    });
  });
}

const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
for (const m of MEMBERS) {
  for (const dpr of [1, 2]) {
    // ⛔ 1412, NOT 1440 (15 October 2026, session 3): since D-097 the site zooms above 1412 px (1440 → 1.0198), and the pad
    // check below is in SCREEN px — at 1440 it failed (14.28 ≠ 14). At 1412 the zoom is exactly 1 and the check passes.
    // ⚠ BUT 1412 DOES NOT REPRODUCE THE COMMITTED STILLS (measured the same day): the canvases come out 1 px larger
    // (287 × 110 vs 286 × 109) and, aligned, differ by a mean 2–4 levels per channel — sub-pixel layout, not the scene. A
    // re-run is a NEW still, to be judged on a cold load; it cannot prove a look unchanged against the old ones.
    const ctx = await b.newContext({ viewport: { width: 1412, height: 900 }, deviceScaleFactor: dpr, reducedMotion: "reduce" });
    await ctx.addInitScript(grabber);
    const p = await ctx.newPage();
    // ⚠ "load", not "networkidle" (15 October 2026): /about at 2× never went network-idle within 30 s — the grabber reads back
    // EVERY frame of EVERY context, the room's full-window canvas included, and the desk mark's worker chunk stayed pending
    // (`about-netwatch-15-october.mjs`). Nothing here depends on the network being idle: the still is read only once the
    // button reports `data-drawn` (below), which already waits for the font, the label and the reflection.
    await p.goto(m.url, { waitUntil: "load" });
    await p.evaluate((s) => document.querySelector(s).scrollIntoView({ block: "center" }), m.section);
    await p.waitForFunction((l) => document.querySelector(l)?.dataset.drawn === "1", m.link, { timeout: 30000 });
    await p.waitForTimeout(1000);
    const r = await p.evaluate((l) => {
      const a = document.querySelector(l), c = a.querySelector("canvas");
      const A = a.getBoundingClientRect(), C = c.getBoundingClientRect(), last = c.__last;
      if (!last) return { error: "no frame read" };
      let bin = ""; for (let i = 0; i < last.px.length; i += 0x8000) bin += String.fromCharCode(...last.px.subarray(i, i + 0x8000));
      return { a: { x: A.x, y: A.y, w: A.width, h: A.height }, c: { x: C.x, y: C.y, w: C.width, h: C.height }, W: last.W, H: last.H, b64: btoa(bin) };
    }, m.link);
    if (r.error) throw new Error(`${m.member} @${dpr}x: ${r.error}`);
    const off = [r.a.x - r.c.x, r.a.y - r.c.y, r.c.w - r.a.w, r.c.h - r.a.h];
    const want = [STILL_PAD, STILL_PAD, STILL_PAD * 2, STILL_PAD * 2];
    if (off.some((v, i) => Math.abs(v - want[i]) > 0.5)) throw new Error(`${m.member}: the canvas is not the link + ${STILL_PAD} each side: ${JSON.stringify({ a: r.a, c: r.c })}`);
    // GL rows run bottom-up; the buffer is premultiplied (three.js's default) — a PNG is straight alpha.
    const src = Buffer.from(r.b64, "base64"), out = Buffer.alloc(src.length), row = r.W * 4;
    for (let y = 0; y < r.H; y++) {
      for (let x = 0; x < row; x += 4) {
        const s = (r.H - 1 - y) * row + x, d = y * row + x, a = src[s + 3];
        out[d + 3] = a;
        for (let k = 0; k < 3; k++) out[d + k] = a ? Math.min(255, Math.round((src[s + k] * 255) / a)) : 0;
      }
    }
    const f = join(OUT, `${m.member}-rest@${dpr}x.png`);
    await sharp(out, { raw: { width: r.W, height: r.H, channels: 4 } }).png({ compressionLevel: 9 }).toFile(f);
    console.log(`${m.member} @${dpr}x: link ${r.a.w.toFixed(1)} × ${r.a.h.toFixed(1)}, canvas ${r.c.w.toFixed(1)} × ${r.c.h.toFixed(1)} css, ${r.W} × ${r.H} px → ${f}`);
    await ctx.close();
  }
}
await b.close();
