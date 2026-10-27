/**
 * ⛔ THE CLIENT FILM — a short, captioned MP4 of a feature, to email a client for approval (D-105; the plan
 * `project-intelligence/live-work/plan-client-film-27-october.md` v3, two Architect reviews A1–A12, B1–B7).
 *
 *   node scripts/client-film/film.mjs <film module> [--release] [--out <dir>] [--measure] [--no-open]
 *
 * A film module (see `films/start-opening.film.mjs`) names a URL, a title, a client, a readiness condition and SCENES,
 * each a caption and a few scripted actions. The runner films the page, then writes ONE MP4: a title card crossfading
 * into the film, a caption per scene, a drawn cursor.
 *
 * - ⛔ THE CAPTURE is CDP `Page.startScreencast`, read directly: JPEG frames from the compositor, OUT OF PROCESS, each
 *   with its timestamp. ⚠ `recordVideo` is NOT a fallback — in Chromium it IS this screencast, at 25 fps VP8 (A1).
 *   Screenshot-per-frame is ruled out by the record: 40–84 ms each ON the animation's thread (`verify/reveal-stall.mjs`).
 *   Each frame is ACKED FIRST (Chrome sends the next only after the ack), then STREAMED to a temp folder (A3).
 * - ⛔ A CONSTANT 30 fps from the frames' timestamps (A7): the concat demuxer, a duration per frame (the gap to the next),
 *   the LAST frame listed twice (concat ignores the last duration otherwise).
 * - ⛔ ONE FILTER GRAPH, the colour converted ONCE, LAST (A6, B4): the frames and cards composited in RGB, then BT.709
 *   limited range and tagged so — an untagged file shifts the gold and the dark between a phone and a desktop.
 * - ⛔ Geist loaded from BYTES and asserted loaded (B1, `cards.html`); the run STOPS if it is not.
 * - ⛔ DRAFTS by default (`<feature>-draft.mp4`, overwritten, "Draft" on the card); `--release` claims the next version.
 *   Written in a temp folder and MOVED at the end, so a failed run claims nothing (A5; Carl: "Drafts, --release numbers").
 * - ⛔ THE OUTPUT IS OUTSIDE THE REPO — `Videos\C2B Client Films\<client>\<title>\` (Carl: "Videos\C2B Client Films");
 *   an `--out` inside the repo is REFUSED (B7): workshops are made by copying, and client footage must not travel.
 * - `--measure` injects a requestAnimationFrame ticker (the screencast sends frames only when the compositor draws, so a
 *   still page's gaps are idle, not drops — A2), runs the scenes, reports the capture rate, and writes no film.
 * - ffmpeg from PATH or `FFMPEG` (ffprobe beside it, or `FFPROBE`). `CLIENT_FILM_FONT` overrides the font path (for the
 *   B1 check: a wrong path must stop the run).
 *
 * ⚠ NOT WATCHED, here or in the report: how the film LOOKS (Carl's eye); whether it plays in a client's mail app; the
 * feel of the scripted cursor.
 */
import { chromium } from "playwright";
import { spawn, spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, renameSync, rmSync, statSync, unlinkSync, writeFileSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import { homedir, tmpdir } from "node:os";
import { dirname, isAbsolute, join, relative, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, "..", "..");
const W = 1920, H = 1080, FPS = 30;
/** the title card's hold, and its crossfade into the film (seconds) */
const TITLE_S = 3, XFADE_S = 0.6;
const CAPTION_FADE_S = 0.25;
/** the film holds this long after the last scene, so it does not end on the action */
const TAIL_S = 0.6;
/** email: Gmail takes 25 MB; over MAX the film is re-encoded two-pass to TARGET; above WARN_S the report warns */
const MAX_MB = 10, TARGET_MB = 9.5, WARN_S = 60;
/** below this bitrate 1080p bands on the dark grounds — fall back to 720p rather than starve it */
const MIN_1080_BPS = 1_500_000;
const JPEG_QUALITY = 92;

// ── arguments
const argv = process.argv.slice(2);
const has = (f) => argv.includes(f);
const value = (f) => (argv.includes(f) ? argv[argv.indexOf(f) + 1] : undefined);
const filmArg = argv.find((a, i) => !a.startsWith("--") && argv[i - 1] !== "--out");
const fail = (msg) => {
  console.error(`\n✖ ${msg}`);
  process.exit(1);
};
if (!filmArg) fail("Usage: node scripts/client-film/film.mjs <film module> [--release] [--out <dir>] [--measure] [--no-open]");
const film = (await import(pathToFileURL(resolve(filmArg)).href)).default;
if (!film?.url || !film?.title || !Array.isArray(film.scenes) || !film.scenes.length) fail(`${filmArg} needs a url, a title and at least one scene`);
const MEASURE = has("--measure");

// ── where the film goes (B7) and its name (A5)
const safe = (s) => String(s).replace(/[<>:"/\\|?*]+/g, "-").trim();
const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const insideRepo = (p) => {
  const rel = relative(REPO, p);
  return rel === "" || (!rel.startsWith("..") && !isAbsolute(rel));
};
const outDir = value("--out") ? resolve(value("--out")) : join(homedir(), "Videos", "C2B Client Films", safe(film.client ?? "C2B Web Design"), safe(film.title));
if (insideRepo(outDir)) fail(`--out ${outDir} is INSIDE the repo. Client films are kept outside it, so they can never be copied into another workshop.`);
const feature = film.name ?? slug(film.title);
const versions = existsSync(outDir)
  ? readdirSync(outDir).map((f) => f.match(new RegExp(`^${feature}-v(\\d+)\\.mp4$`))?.[1]).filter(Boolean).map(Number)
  : [];
const version = has("--release") ? Math.max(0, ...versions) + 1 : null;
const fileName = version ? `${feature}-v${version}.mp4` : `${feature}-draft.mp4`;
const date = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

// ── ffmpeg (from PATH or FFMPEG) and ffprobe beside it
const FF = process.env.FFMPEG || "ffmpeg";
const FP = process.env.FFPROBE || (process.env.FFMPEG ? join(dirname(process.env.FFMPEG), `ffprobe${process.platform === "win32" ? ".exe" : ""}`) : "ffprobe");
const ffVersion = spawnSync(FF, ["-version"], { encoding: "utf8" });
if (ffVersion.error || ffVersion.status !== 0) fail(`ffmpeg not found ("${FF}"). Put it on PATH or set FFMPEG.`);
/** ⛔ an ARGUMENT ARRAY, never a shell string — the output path has spaces (B7) */
const ffmpeg = (args) =>
  new Promise((ok, no) => {
    const p = spawn(FF, ["-hide_banner", "-loglevel", "error", ...args], { stdio: ["ignore", "ignore", "pipe"] });
    let err = "";
    p.stderr.on("data", (d) => (err += d));
    p.on("close", (code) => (code === 0 ? ok() : no(new Error(`ffmpeg failed (${code}):\n${err.trim().split("\n").slice(-6).join("\n")}`))));
  });
const probe = (file) => {
  const r = spawnSync(FP, ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=codec_name,width,height,r_frame_rate,avg_frame_rate,pix_fmt,color_space,color_range,color_primaries,color_transfer:format=duration,size", "-of", "json", file], { encoding: "utf8" });
  if (r.status !== 0) throw new Error(`ffprobe failed: ${r.stderr}`);
  const j = JSON.parse(r.stdout);
  return { ...j.streams[0], duration: Number(j.format.duration), size: Number(j.format.size) };
};

// ── the page's additions while filming
/** ⛔ THE CURSOR (A10): Playwright's pointer is invisible on film. One dot, fixed, `pointer-events: none`, the top
 *  z-index, hidden until the first mousemove, pressed in on mousedown. Not in iframes; attached once the DOM exists (init
 *  scripts run before <body>). In the page, not drawn afterwards: it sits exactly where the page's own hover states think
 *  the pointer is, with no second clock to align. ⚠ The only change made to the filmed page. */
function cursorScript() {
  if (window !== window.top) return;
  const make = () => {
    const at = document.createElement("div");
    at.setAttribute("data-client-film-cursor", "");
    at.style.cssText = "position:fixed;left:0;top:0;width:0;height:0;pointer-events:none;z-index:2147483647;opacity:0;transform-origin:0 0";
    const dot = document.createElement("div");
    dot.style.cssText =
      "position:absolute;left:-11px;top:-11px;width:22px;height:22px;border-radius:50%;background:rgba(255,255,255,.92);" +
      "box-shadow:0 0 0 2px rgba(0,0,0,.55),0 2px 10px rgba(0,0,0,.45);transition:transform 110ms ease-out";
    at.appendChild(dot);
    document.documentElement.appendChild(at);
    // ⛔ A PAGE's ZOOM: a length written in CSS is PAINTED × the zoom (C2B's own `html { zoom }`, D-097, at 1920 px is ×1.36),
    // so the position — and the dot's size — are divided by the zoom the browser reports for the dot. Without it the dot
    // drew 340 px from the pointer on the first proof film (Carl's site, 27 October)
    addEventListener("mousemove", (e) => {
      const z = at.currentCSSZoom || 1;
      at.style.opacity = "1";
      at.style.transform = `translate(${e.clientX / z}px, ${e.clientY / z}px) scale(${1 / z})`;
    }, { capture: true, passive: true });
    addEventListener("mousedown", () => (dot.style.transform = "scale(.72)"), true);
    addEventListener("mouseup", () => (dot.style.transform = "scale(1)"), true);
  };
  if (document.readyState === "loading") addEventListener("DOMContentLoaded", make);
  else make();
}
/** ⛔ `--measure` only (A2): a 4 px square changing every animation frame, so the compositor draws continuously */
function tickerScript() {
  if (window !== window.top) return;
  const go = () => {
    const t = document.createElement("div");
    t.style.cssText = "position:fixed;left:0;top:0;width:4px;height:4px;z-index:2147483647;pointer-events:none";
    document.documentElement.appendChild(t);
    let n = 0;
    // the page's own frame times, on the wall clock, so a capture gap can be checked against them
    const ticks = (window.__clientFilmTicks = []);
    const tick = () => {
      t.style.background = n++ % 2 ? "#fff" : "#000";
      ticks.push((performance.timeOrigin + performance.now()) / 1000);
      requestAnimationFrame(tick);
    };
    tick();
  };
  if (document.readyState === "loading") addEventListener("DOMContentLoaded", go);
  else go();
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const now = () => Date.now() / 1000;
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** frames per second and gaps over 50 ms, over a run of frame timestamps (A2) */
function captureStats(ts) {
  if (ts.length < 2) return { frames: ts.length, fps: 0, gaps50: 0, longestMs: 0 };
  let gaps50 = 0, longest = 0;
  for (let i = 1; i < ts.length; i++) {
    const g = ts[i] - ts[i - 1];
    if (g > 0.05) gaps50++;
    longest = Math.max(longest, g);
  }
  return { frames: ts.length, fps: (ts.length - 1) / (ts[ts.length - 1] - ts[0]), gaps50, longestMs: Math.round(longest * 1000) };
}

const tmp = mkdtempSync(join(tmpdir(), "c2b-client-film-"));
const framesDir = join(tmp, "frames");
mkdirSync(framesDir);
let keepTmp = false;
const browser = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
try {
  console.log(`THE CLIENT FILM — "${film.title}"${MEASURE ? " (MEASURE: no film written)" : ` → ${join(outDir, fileName)}`}`);
  console.log(`  ${ffVersion.stdout.split("\n")[0]}`);

  // ── 1. THE CARDS, first: a font failure stops the run before a capture is wasted (B1)
  const cards = [];
  if (!MEASURE) {
    const cardCtx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
    const cp = await cardCtx.newPage();
    await cp.setContent(readFileSync(join(HERE, "cards.html"), "utf8"));
    const fontPath = process.env.CLIENT_FILM_FONT || join(HERE, "geist-latin.woff2");
    if (!existsSync(fontPath)) throw new Error(`The font is missing: ${fontPath}`);
    await cp.evaluate((b) => window.loadGeist(b), [...readFileSync(fontPath)]);
    const mark = `data:image/png;base64,${readFileSync(join(REPO, "public", "c2b-logo-mark.png")).toString("base64")}`;
    const meta = `${version ? `Version ${version}` : "Draft"}  ·  ${date}`;
    await cp.evaluate((s) => window.render(s), { kind: "title", title: film.title, client: film.client, meta, mark });
    await cp.screenshot({ path: join(tmp, "title.png") });
    for (const [i, s] of film.scenes.entries()) {
      if (!s.caption) continue;
      await cp.evaluate((c) => window.render(c), { kind: "caption", text: s.caption, position: s.captionPosition });
      const path = join(tmp, `caption-${i}.png`);
      await cp.screenshot({ path, omitBackground: true });
      cards.push({ scene: i, path });
    }
    await cardCtx.close();
    console.log("  ✔ Geist loaded (from bytes, asserted); the title card and captions rendered");
  }

  // ── 2. THE PAGE AND THE CAPTURE
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  if (film.cursor !== false) await ctx.addInitScript(cursorScript);
  if (MEASURE) await ctx.addInitScript(tickerScript);
  const page = await ctx.newPage();
  await page.goto(film.url, { waitUntil: "commit" });
  const cdp = await ctx.newCDPSession(page);
  const frames = [];
  const writes = [];
  let n = 0;
  cdp.on("Page.screencastFrame", ({ data, metadata, sessionId }) => {
    // ⛔ ACK FIRST (A3) — Chrome sends the next frame only after it; the disk write follows, never in memory for long
    cdp.send("Page.screencastFrameAck", { sessionId }).catch(() => {});
    const file = `f${String(n++).padStart(6, "0")}.jpg`;
    writes.push(writeFile(join(framesDir, file), Buffer.from(data, "base64")));
    frames.push({ ts: metadata.timestamp, file });
  });
  const captureFrom = now();
  await cdp.send("Page.startScreencast", { format: "jpeg", quality: JPEG_QUALITY, maxWidth: W, maxHeight: H, everyNthFrame: 1 });

  // ⛔ the page ready before the scenes (B3: `{ selector, settleMs }` or a function — Playwright's "visible" counts opacity 0)
  const ready = film.ready;
  if (typeof ready === "function") await ready(page);
  else {
    await page.waitForLoadState("load");
    if (ready?.selector) await page.locator(ready.selector).first().waitFor({ state: "visible", timeout: 60_000 });
    if (ready?.settleMs) await sleep(ready.settleMs);
  }
  const cutAt = now();

  // ⛔ a software rasteriser films a stutter that is not the site's (Carl's Chrome, 3 October)
  const renderer = await page.evaluate(() => {
    const gl = document.createElement("canvas").getContext("webgl");
    const ext = gl?.getExtension("WEBGL_debug_renderer_info");
    return gl ? String(ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER)) : "no WebGL";
  });
  if (/swiftshader|llvmpipe|software|warp/i.test(renderer)) throw new Error(`The renderer is "${renderer}": software, not the GPU. The film would stutter.`);

  // ── 3. THE SCENES — each logged on the wall clock (the screencast's timestamps read the same clock: checked below)
  const pos = { x: W / 2, y: H * 0.62 };
  const target = async (to) => {
    if (typeof to !== "string") return to;
    const loc = page.locator(to).first();
    await loc.waitFor({ state: "visible", timeout: 30_000 });
    const b = await loc.boundingBox();
    if (!b) throw new Error(`"${to}" has no box on screen`);
    return { x: b.x + b.width / 2, y: b.y + b.height / 2 };
  };
  /** ⛔ A GLIDE (A9): an eased path, a move every ~16.7 ms, paced against the clock — Playwright's own steps run back to
   *  back in a straight line at a constant speed */
  const glide = async (to, ms = 600) => {
    const p = await target(to);
    const from = { ...pos };
    const steps = Math.max(1, Math.round(ms / 16.7));
    const start = performance.now();
    for (let i = 1; i <= steps; i++) {
      const k = ease(i / steps);
      pos.x = from.x + (p.x - from.x) * k;
      pos.y = from.y + (p.y - from.y) * k;
      await page.mouse.move(pos.x, pos.y);
      await sleep(Math.max(0, start + i * 16.7 - performance.now()));
    }
    // ⛔ ASSERTED, not assumed: the dot is DRAWN where the pointer is (a page's zoom moved it 340 px once)
    if (film.cursor !== false) {
      const c = await page.evaluate(() => {
        const b = document.querySelector("[data-client-film-cursor] > div")?.getBoundingClientRect();
        return b ? { x: b.left + b.width / 2, y: b.top + b.height / 2 } : null;
      });
      const off = c ? Math.hypot(c.x - pos.x, c.y - pos.y) : Infinity;
      if (off > 3) throw new Error(`The cursor dot is drawn ${c ? `${off.toFixed(0)} px` : "nowhere"} from the pointer.`);
    }
  };
  const h = {
    page,
    wait: (ms) => sleep(ms),
    glide,
    hover: (to, ms) => glide(to, ms),
    click: async (to, { hold = 90, ms } = {}) => {
      await glide(to, ms);
      await page.mouse.down();
      await sleep(hold);
      await page.mouse.up();
    },
    /** smooth, by pixels or to bring an element to the middle of the screen, through the wheel as a visitor scrolls */
    scroll: async (by, ms = 900) => {
      const dy = typeof by === "number" ? by : (await target(by)).y - H / 2;
      const steps = Math.max(1, Math.round(ms / 16.7));
      const start = performance.now();
      let done = 0;
      for (let i = 1; i <= steps; i++) {
        const want = dy * ease(i / steps);
        await page.mouse.wheel(0, want - done);
        done = want;
        await sleep(Math.max(0, start + i * 16.7 - performance.now()));
      }
    },
    type: async (to, text, cps = 14) => {
      await h.click(to);
      for (const ch of text) {
        await page.keyboard.type(ch);
        await sleep(1000 / cps);
      }
    },
    press: (key) => page.keyboard.press(key),
  };
  const log = [];
  for (const s of film.scenes) {
    const start = now();
    await s.run(h);
    log.push({ start, end: now(), caption: s.caption, position: s.captionPosition ?? "bottom" });
  }
  await sleep(TAIL_S * 1000);
  const endAt = now();
  const ticks = MEASURE ? await page.evaluate(() => window.__clientFilmTicks ?? []) : [];
  await cdp.send("Page.stopScreencast");
  await Promise.all(writes);
  await ctx.close();

  // ── 4. THE CAPTURE's NUMBERS (A2) and the clock check
  frames.sort((a, b) => a.ts - b.ts);
  if (frames.length < 2) throw new Error(`The screencast delivered ${frames.length} frame(s).`);
  const firstTs = frames[0].ts;
  // ⛔ ASSERTED, not assumed: Chrome's frame timestamps and Node's clock must be the same clock for the captions to land
  // (A8) — the first frame must arrive after the capture began and within seconds of it
  const lag = firstTs - captureFrom;
  if (lag < -0.5 || lag > 10) throw new Error(`The first frame is stamped ${lag.toFixed(2)} s from the capture's start: the two clocks disagree, so captions cannot be timed.`);
  const motion = captureStats(frames.filter((f) => f.ts >= cutAt).map((f) => f.ts));
  console.log(
    `  capture (from the ready point): ${motion.frames} frames, ${motion.fps.toFixed(1)} fps, ${motion.gaps50} gaps over 50 ms, longest ${motion.longestMs} ms` +
      (MEASURE ? "  (the ticker ran: every gap is a missed frame)" : "  ⚠ no ticker: a gap may be a still page, not a drop"),
  );
  if (MEASURE) {
    const all = captureStats(frames.map((f) => f.ts));
    console.log(`  capture (the whole run, cold load included): ${all.frames} frames, ${all.fps.toFixed(1)} fps, ${all.gaps50} gaps over 50 ms, longest ${all.longestMs} ms`);
    // WHERE each gap falls — against the ready point and the scenes — so a capture drop can be told from the page's own
    // freeze (which a film SHOULD show)
    const at = (t) => {
      const k = log.findIndex((s) => t >= s.start && t <= s.end);
      return k >= 0 ? `scene ${k + 1} +${(t - log[k].start).toFixed(2)} s` : t < cutAt ? "before ready" : "after the scenes";
    };
    // ⛔ THE DISCRIMINATOR: the page's longest frame inside each capture gap. The page stalled too → the film shows the truth.
    // The page's main thread drew on → a capture drop OR a GPU presentation stall: ⚠ rAF runs on the main thread and cannot
    // tell those two apart (/start has a recorded stall of exactly that kind: `verify/reveal-stall.mjs`)
    let drops = 0;
    for (let i = 1; i < frames.length; i++) {
      const a = frames[i - 1].ts, b = frames[i].ts;
      if (b - a <= 0.05) continue;
      let pageLongest = 0;
      for (let k = 1; k < ticks.length; k++) if (ticks[k] > a && ticks[k - 1] < b) pageLongest = Math.max(pageLongest, Math.min(ticks[k], b) - Math.max(ticks[k - 1], a));
      const dropped = pageLongest < (b - a) * 0.5;
      if (dropped) drops++;
      console.log(
        `    gap ${Math.round((b - a) * 1000)} ms at ${(a - firstTs).toFixed(2)} s (${at(a)}): the page's longest frame inside it ${Math.round(pageLongest * 1000)} ms → ${dropped ? "⚠ the main thread drew on: a capture drop or a GPU presentation stall" : "the page's own stall"}`,
      );
    }
    console.log(
      `  ${drops} gap(s) with the page's main thread drawing on (a capture drop OR a GPU presentation stall — not told apart); the rest the page's own stalls, which a film should show. ⚠ "Own stall" is called at a page frame over half the gap`,
    );
    console.log(`  renderer: ${renderer}`);
    console.log("\n⚠ NOT WATCHED: how a film LOOKS; a client's mail app; the cursor's feel. MEASURE writes no film.");
  } else {
    // ── 5. THE FILM: t0 = the first frame for a cold-load film (the proof), the CUT for a client film (A12, B3)
    const t0 = film.coldLoad ? firstTs : cutAt;
    const filmEnd = endAt;
    // the picture at t0 is the last frame drawn at or before it
    const i0 = Math.max(0, frames.findLastIndex((f) => f.ts <= t0));
    const use = frames.slice(i0).filter((f) => f.ts < filmEnd);
    const lines = ["ffconcat version 1.0"];
    for (let i = 0; i < use.length; i++) {
      const from = Math.max(use[i].ts, t0);
      const to = i + 1 < use.length ? use[i + 1].ts : filmEnd;
      if (to - from <= 0) continue;
      lines.push(`file '${use[i].file}'`, `duration ${(to - from).toFixed(6)}`);
    }
    lines.push(`file '${use[use.length - 1].file}'`); // ⛔ A7: the last frame twice, or its duration is ignored
    writeFileSync(join(framesDir, "frames.ffconcat"), lines.join("\n"));
    const filmDur = filmEnd - t0;
    const total = TITLE_S - XFADE_S + filmDur;
    const offset = TITLE_S - XFADE_S;
    if (total > WARN_S) console.log(`  ⚠ ${total.toFixed(0)} s is long for an email: over ~60 s the picture has to be squeezed to stay under ${MAX_MB} MB`);

    // captions in the FINAL film's time
    const shown = [];
    for (const c of cards) {
      const s = log[c.scene];
      const on = offset + Math.max(0, s.start - t0);
      const off = offset + Math.min(filmDur, s.end - t0);
      if (off - on > 2 * CAPTION_FADE_S) shown.push({ ...c, on, off, text: s.caption });
    }

    // ⛔ ONE FILTER GRAPH (B4): the film and the title in RGB, the crossfade, the captions faded in RGBA over them, THEN the
    // colour converted once to BT.709 limited range — the last step
    const encode = async (out, { width = W, height = H, passArgs = [] } = {}) => {
      const inputs = ["-f", "concat", "-safe", "0", "-i", join(framesDir, "frames.ffconcat"), "-loop", "1", "-framerate", String(FPS), "-t", String(TITLE_S), "-i", join(tmp, "title.png")];
      for (const c of shown) inputs.push("-loop", "1", "-framerate", String(FPS), "-t", total.toFixed(3), "-i", c.path);
      const g = [
        `[0:v]fps=${FPS},scale=${W}:${H},format=gbrp,setpts=PTS-STARTPTS[film]`,
        `[1:v]fps=${FPS},format=gbrp,setpts=PTS-STARTPTS[title]`,
        `[title][film]xfade=transition=fade:duration=${XFADE_S}:offset=${offset}[v0]`,
      ];
      shown.forEach((c, k) => {
        g.push(
          `[${k + 2}:v]format=rgba,fade=t=in:st=${c.on.toFixed(3)}:d=${CAPTION_FADE_S}:alpha=1,fade=t=out:st=${(c.off - CAPTION_FADE_S).toFixed(3)}:d=${CAPTION_FADE_S}:alpha=1[c${k}]`,
          `[v${k}][c${k}]overlay=format=gbrp:shortest=0[v${k + 1}]`,
        );
      });
      // ⚠ ffmpeg 9 takes the colour tags from the FRAMES: `scale` sets the matrix and range only, so `setparams` stamps all
      // four (the encoder's -color_* options alone left the primaries and transfer unwritten — the report caught it)
      g.push(
        `[v${shown.length}]scale=${width}:${height}:out_color_matrix=bt709:out_range=tv,format=yuv420p,` +
          `setparams=colorspace=bt709:color_primaries=bt709:color_trc=bt709:range=tv[out]`,
      );
      await ffmpeg([
        "-y", ...inputs,
        "-filter_complex", g.join(";"),
        "-map", "[out]", "-an", "-t", total.toFixed(3),
        "-c:v", "libx264", "-profile:v", "high", "-preset", "slow", ...(passArgs.length ? passArgs : ["-crf", "20"]),
        "-pix_fmt", "yuv420p", "-fps_mode", "cfr", "-r", String(FPS),
        "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709", "-color_range", "tv",
        "-movflags", "+faststart",
        out,
      ]);
    };
    const tmpOut = join(tmp, fileName);
    await encode(tmpOut);
    let size = statSync(tmpOut).size;
    let res = `${W} × ${H}`;
    if (size > MAX_MB * 1024 * 1024) {
      // ⛔ two-pass to fit; below MIN_1080_BPS, 720p rather than a starved 1080p
      const bps = Math.floor(((TARGET_MB * 1024 * 1024 * 8) / total) * 0.97);
      const small = bps < MIN_1080_BPS;
      const dims = small ? { width: 1280, height: 720 } : {};
      res = small ? "1280 × 720" : res;
      const passlog = join(tmp, "x264pass");
      const rate = ["-b:v", String(bps), "-maxrate", String(Math.floor(bps * 1.5)), "-bufsize", String(bps * 2), "-passlogfile", passlog];
      await encode(process.platform === "win32" ? "NUL" : "/dev/null", { ...dims, passArgs: [...rate, "-pass", "1", "-f", "null"] });
      await encode(tmpOut, { ...dims, passArgs: [...rate, "-pass", "2"] });
      size = statSync(tmpOut).size;
      console.log(`  re-encoded two-pass at ${(bps / 1e6).toFixed(2)} Mbit/s${small ? ", 720p (too long for a clean 1080p under the limit)" : ""}`);
    }

    // ── 6. THE REPORT, by ffprobe (A6, A8)
    const p = probe(tmpOut);
    const checks = [
      [p.codec_name === "h264", `codec ${p.codec_name}`],
      [`${p.width} × ${p.height}` === res, `${p.width} × ${p.height}`],
      [p.r_frame_rate === "30/1" && p.avg_frame_rate === "30/1", `${p.r_frame_rate} fps, constant (average ${p.avg_frame_rate})`],
      [p.color_space === "bt709" && p.color_range === "tv" && p.color_primaries === "bt709" && p.color_transfer === "bt709", `colour ${p.color_space} / ${p.color_range} / ${p.color_primaries} / ${p.color_transfer}`],
      [size < MAX_MB * 1024 * 1024, `${(size / 1024 / 1024).toFixed(2)} MB (under ${MAX_MB})`],
      [Math.abs(p.duration - total) <= 0.2, `${p.duration.toFixed(2)} s; expected ${total.toFixed(2)} (title ${TITLE_S} + film ${filmDur.toFixed(2)} − crossfade ${XFADE_S})`],
    ];
    for (const [ok, what] of checks) console.log(`  ${ok ? "✔" : "✖"} ${what}`);
    for (const c of shown) console.log(`  caption ${c.on.toFixed(2)}–${c.off.toFixed(2)} s: "${c.text}"`);
    if (checks.some(([ok]) => !ok)) {
      keepTmp = true;
      throw new Error(`The film failed a check above; nothing was claimed. It is kept at ${tmpOut}`);
    }

    // ── 7. CLAIM THE NAME: moved into place only now (A5); a draft open in a player cannot be replaced (B6)
    mkdirSync(outDir, { recursive: true });
    const dest = join(outDir, fileName);
    try {
      try {
        renameSync(tmpOut, dest);
      } catch (e) {
        if (e.code !== "EXDEV") throw e;
        copyFileSync(tmpOut, dest);
        unlinkSync(tmpOut);
      }
    } catch (e) {
      if (["EBUSY", "EPERM", "EACCES"].includes(e.code)) {
        keepTmp = true;
        throw new Error(`${dest} is open in another program (a player?). Close it and re-run.\n  This take is kept at ${tmpOut}`);
      }
      throw e;
    }
    console.log(`\n✔ ${dest}`);
    console.log("⚠ NOT WATCHED: how the film LOOKS (your eye); whether it plays in the client's mail app (email it to yourself first); the cursor's feel.");
    if (!has("--no-open") && process.platform === "win32") spawn("explorer", [outDir], { detached: true, stdio: "ignore" }).unref();
  }
} catch (e) {
  console.error(`\n✖ ${e.message}`);
  process.exitCode = 1;
} finally {
  await browser.close();
  // ⛔ A3: the frames are deleted after a run; a take that could not be claimed keeps only its MP4
  if (!keepTmp) rmSync(tmp, { recursive: true, force: true });
  else for (const f of readdirSync(tmp)) if (!f.endsWith(".mp4")) rmSync(join(tmp, f), { recursive: true, force: true });
}
