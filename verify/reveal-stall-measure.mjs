// ⚠⚠ MEASURE THE REVEAL FREEZE — reads PIXELS out of the films, not bytes.
//
//   node verify/reveal-stall-measure.mjs [dir]
//
// Consumes the films from `verify/reveal-stall.mjs` and reports, per run, the
// longest run of consecutive IDENTICAL frames inside Q5's reveal — plus the
// median and spread across runs.
//
// ─────────────────────────────────────────────────────────────────────────────
// ⚠⚠ THE TWO RECORDED TRAPS THIS METHOD EXISTS TO AVOID
// ─────────────────────────────────────────────────────────────────────────────
//
// 1. ⛔ MD5 / HASHING IS USELESS HERE. Every static frame hashes DIFFERENTLY —
//    VP8 encoder noise means a byte-identical screen is not a byte-identical
//    frame. The 15 August record: "a hash comparison would have reported CHANGED
//    for all eighteen static frames and missed the stall entirely."
//
// 2. ⚠⚠ THE BYTE PLATEAU UNDER-REPORTS — it is a FLOOR, not a bound. On 16 August
//    the plateau ran f199-f206 while f197 and f198 were VISUALLY IDENTICAL to f199
//    and sat OUTSIDE it. **Eight frames by bytes; ten frames by eye.** A file-size
//    plateau marks where the encoder is CERTAIN nothing moved; the stall is that
//    long or longer.
//
// ⚠ SO THIS COMPARES DECODED PIXELS WITH A NOISE TOLERANCE. ffmpeg decodes the
// reveal band straight to raw 8-bit greyscale (`-pix_fmt gray`) — no PNG, no
// hashing. Two frames are "the same screen" when their per-pixel differences are
// all within FLICKER_TOL and the count of pixels differing at all is under
// NOISE_PIXELS. That is what separates sub-perceptual encoder noise from motion,
// and it is the thing a byte plateau cannot do.
//
// ⚠ THE TOLERANCE IS MEASURED, NOT INHERITED. `--calibrate` prints the frame-to-
// frame difference distribution so the floor can be READ off a real film rather
// than typed. Run it before trusting any threshold here.
//
// ─────────────────────────────────────────────────────────────────────────────
// ⚠ THE BAND, AND WHY IT IS NOT THE WHOLE FRAME
// ─────────────────────────────────────────────────────────────────────────────
//
// Cropped to the active question row. The cards, the spotlight and the filament
// animate CONTINUOUSLY on their own canvas — a whole-frame comparison would find
// motion in every frame and report "no freeze" on a plainly frozen reveal.
// ⚠ That is the same shape as `q5-stutter.mjs` measuring a window in which the
// defect could not appear. The band is the thing under test; everything else is
// a source of false motion.

import { execFileSync } from "node:child_process";
import { readdirSync, existsSync, readFileSync, mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { inflateSync } from "node:zlib";
import { statSync } from "node:fs";

// Newest batch directory containing run films. ⚠ Falls back to ROOT itself so a
// pre-batch layout (films sitting directly in the root) still measures rather
// than reporting an empty run.
function latestBatch(root) {
  let entries = [];
  try {
    entries = readdirSync(root)
      .map((n) => `${root}/${n}`)
      .filter((d) => {
        try { return statSync(d).isDirectory(); } catch { return false; }
      })
      .filter((d) => readdirSync(d).some((f) => /^run-\d+\.webm$/.test(f)));
  } catch { return root; }
  if (entries.length === 0) return root;
  return entries.sort()[entries.length - 1];
}

// ⚠ BATCHES ACCUMULATE — `reveal-stall.mjs` writes each run into its own
// timestamped directory under `verify/out/reveal-stall/` and never deletes one.
// With no argument this measures the MOST RECENT batch; pass a path to measure a
// specific one, which is how two arms get compared without refilming either.
const ROOT = "verify/out/reveal-stall";
const DIR = process.argv[2] && !process.argv[2].startsWith("--")
  ? process.argv[2]
  : latestBatch(ROOT);
const CALIBRATE = process.argv.includes("--calibrate");

const FFMPEG = join(
  process.env.LOCALAPPDATA ?? "",
  "ms-playwright", "ffmpeg-1011", "ffmpeg-win64.exe"
);
if (!existsSync(FFMPEG)) {
  console.error(`\n⛔ no ffmpeg at ${FFMPEG}`);
  console.error(`   There is no system ffmpeg on this machine; Playwright's bundled one is the route.\n`);
  process.exit(1);
}

const FPS = 25;
const FRAME_MS = 1000 / FPS;

// ⚠ THE QUESTION ROW ONLY, AT 1440x900 — MEASURED OFF A FRAME, NOT GUESSED.
// The row sits at y~445-475, x~535-905 ("Q5  What brought you here today?").
//
// ⚠⚠ THE FIRST CROP WAS WRONG AND WOULD HAVE HIDDEN THE DEFECT. It ran y 430-550
// at 120px tall, which SWALLOWED THE CARD GRID at y~490-600. The cards, their
// spotlight and their filament animate continuously, so every frame would have
// shown motion and the harness would have reported NO FREEZE on a frozen reveal.
// Caught by extracting a frame and LOOKING at it before trusting a number.
//
// Bounded tight to the row, with a little headroom for line-height changes but
// stopping WELL ABOVE the cards.
const CROP = { w: 420, h: 46, x: 530, y: 437 };

// ⚠⚠ MEASURED ON A REAL FILM, NOT INHERITED AND NOT TYPED. `--calibrate` prints
// the distribution these came from; re-run it before trusting them on any other
// build or width.
//
// The measured split on run-01 (671 frame pairs, this build, 1440x900):
//
//   exactly-zero changed pixels ...... 626 pairs   <- the static screen
//   non-zero ......................... 45 pairs    <- min 1, median 200, max 4190
//
// ⚠ THE TWO CLUSTERS DO NOT OVERLAP: static frames score EXACTLY 0, not "small".
// So the threshold does not sit in a grey zone — anything above zero is motion.
// NOISE_PIXELS is held at a small non-zero value only as insurance against a
// stray decoder artefact, NOT because the data needs the slack.
//
// ⚠ MY FIRST TYPED GUESS WAS 400 AND IT WAS BADLY WRONG — it would have
// classified genuine text motion (real pairs at 108, 200, 316) as STATIC, and so
// reported freezes LONGER than they are. Recorded because the number was
// plausible, and only measuring showed it was not.
//
// ⚠⚠ AND THIS IS WHY THE PIXEL CHANNEL BEATS THE BYTE PLATEAU. Checked directly
// on this film: frames f201-f208 have EIGHT DIFFERENT MD5s and byte sizes ranging
// 2930-2993 — a hash or size check calls all eight "changed" — while the decoded
// pixels differ by EXACTLY ZERO. That is the 15 August trap ("every static frame
// hashes differently") and the 16 August amendment (the plateau under-reports)
// reproduced and measured, and this channel is subject to neither.
const FLICKER_TOL = 6;
const NOISE_PIXELS = 8;

// ⚠ WHY PNG AND NOT rawvideo: Playwright's bundled ffmpeg is a MINIMAL build.
// Its only muxers are webm and image2, its only encoders libvpx and png — so
// `-f rawvideo` fails outright with "Requested output format 'rawvideo' is not
// known". There is no system ffmpeg on this machine. ⚠ NOTHING IS GIVEN UP: PNG
// is LOSSLESS, so the decoded pixels are exactly the presented pixels.
//
// Decoded with node's own zlib rather than an image library. The frames are
// 8-bit GREYSCALE (colour type 0) — the simplest PNG case, one byte per pixel
// plus one filter byte per row. ⚠ A transitive `sharp` does exist in
// node_modules, but it is NOT a declared dependency of this project: a harness
// that breaks when an unrelated package moves is a harness nobody can trust.

function decodeGrayPng(buf) {
  if (buf.readUInt32BE(0) !== 0x89504e47) throw new Error("not a PNG");
  let pos = 8, width = 0, height = 0;
  const idat = [];
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos);
    const type = buf.toString("ascii", pos + 4, pos + 8);
    const data = buf.subarray(pos + 8, pos + 8 + len);
    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      const bitDepth = data[8], colourType = data[9];
      // ⚠ FAIL LOUDLY rather than misread the bytes as if they were greyscale.
      if (bitDepth !== 8 || colourType !== 0) {
        throw new Error(`expected 8-bit greyscale PNG, got depth ${bitDepth} type ${colourType}`);
      }
      if (data[12] !== 0) throw new Error("interlaced PNG not supported");
    } else if (type === "IDAT") idat.push(data);
    else if (type === "IEND") break;
    pos += 12 + len;
  }
  const raw = inflateSync(Buffer.concat(idat));
  const out = Buffer.allocUnsafe(width * height);
  // Undo the per-row PNG filters. bpp is 1 byte for 8-bit greyscale.
  let rp = 0;
  for (let y = 0; y < height; y++) {
    const filter = raw[rp++];
    const row = y * width, prev = (y - 1) * width;
    for (let x = 0; x < width; x++) {
      const v = raw[rp++];
      const a = x > 0 ? out[row + x - 1] : 0;
      const b = y > 0 ? out[prev + x] : 0;
      const c = x > 0 && y > 0 ? out[prev + x - 1] : 0;
      let r;
      switch (filter) {
        case 0: r = v; break;
        case 1: r = v + a; break;
        case 2: r = v + b; break;
        case 3: r = v + ((a + b) >> 1); break;
        case 4: {
          const pa = Math.abs(b - c), pb = Math.abs(a - c), pc = Math.abs(a + b - 2 * c);
          r = v + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c);
          break;
        }
        default: throw new Error(`unknown PNG filter ${filter}`);
      }
      out[row + x] = r & 0xff;
    }
  }
  return out;
}

function framesOf(file) {
  const dir = mkdtempSync(join(tmpdir(), "reveal-stall-"));
  try {
    execFileSync(
      FFMPEG,
      [
        "-v", "error",
        "-i", file,
        "-vf", `crop=${CROP.w}:${CROP.h}:${CROP.x}:${CROP.y},format=gray`,
        "-c:v", "png",
        join(dir, "f_%05d.png"),
      ],
      { maxBuffer: 64 * 1024 * 1024 }
    );
    const names = readdirSync(dir).filter((f) => f.endsWith(".png")).sort();
    return names.map((n) => decodeGrayPng(readFileSync(join(dir, n))));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

// Returns { changed, maxDelta } — `changed` counts pixels differing by more than
// the flicker tolerance. ⚠ Both are reported: a frame pair can have many pixels
// differing slightly (noise) or few differing hugely (a caret, a cursor).
function diff(a, b) {
  let changed = 0, maxDelta = 0;
  for (let i = 0; i < a.length; i++) {
    const d = Math.abs(a[i] - b[i]);
    if (d > maxDelta) maxDelta = d;
    if (d > FLICKER_TOL) changed++;
  }
  return { changed, maxDelta };
}

const files = readdirSync(DIR).filter((f) => /^run-\d+\.webm$/.test(f)).sort();
if (files.length === 0) {
  console.error(`\n⛔ no run-NN.webm in ${DIR} — run verify/reveal-stall.mjs first.\n`);
  process.exit(1);
}

console.log(`\n⚠ REVEAL FREEZE — measuring ${files.length} films from ${DIR}`);
console.log(`   channel: decoded PIXELS of the question band (crop ${CROP.w}x${CROP.h} @ ${CROP.x},${CROP.y})`);
console.log(`   ⚠ NOT hashes (every static frame hashes differently) and NOT file size`);
console.log(`     (the byte plateau under-reports — it is a floor, not a bound).`);
console.log(`   ⚠ 40ms quantisation: durations are BOUNDED, not exact.\n`);

if (CALIBRATE) {
  const frames = framesOf(join(DIR, files[0]));
  const deltas = [];
  for (let i = 1; i < frames.length; i++) deltas.push(diff(frames[i - 1], frames[i]).changed);
  const sorted = [...deltas].sort((a, b) => a - b);
  const q = (p) => sorted[Math.floor(sorted.length * p)];
  console.log(`  CALIBRATION on ${files[0]} — changed-pixel counts, ${deltas.length} frame pairs`);
  console.log(`    min ${sorted[0]}   p10 ${q(0.1)}   p25 ${q(0.25)}   median ${q(0.5)}   p75 ${q(0.75)}   max ${sorted[sorted.length - 1]}`);
  console.log(`\n  ⚠ NOISE_PIXELS (${NOISE_PIXELS}) must sit ABOVE the static-frame cluster and`);
  console.log(`    BELOW the moving-frame cluster. If those two overlap, this method cannot`);
  console.log(`    separate them and the threshold is not trustworthy — say so, do not tune.\n`);
  process.exit(0);
}

const results = [];

// "ink" = bright pixels in the band. On the dark ground this RISES as the wipe
// uncovers more text, so it is the wipe's PROGRESS, readable per frame without
// touching the page. ⚠ It is the reason the window can be found from pixels
// alone rather than from a typed timestamp.
function ink(f) { let n = 0; for (let i = 0; i < f.length; i++) if (f[i] > 100) n++; return n; }

for (const f of files) {
  const frames = framesOf(join(DIR, f));
  const inks = frames.map(ink);

  const changed = [];
  for (let i = 1; i < frames.length; i++) changed.push(diff(frames[i - 1], frames[i]).changed);
  const isStatic = changed.map((c) => c <= NOISE_PIXELS);

  // ─────────────────────────────────────────────────────────────────────────
  // ⚠⚠ FINDING Q5'S REVEAL — TWO WRONG VERSIONS BEFORE THIS ONE. BOTH RECORDED.
  // ─────────────────────────────────────────────────────────────────────────
  //
  // ⚠ WRONG #1 — bracket "the reveal" between the first and last MOVING pair in
  // the film. That window spans the opening, the Begin press, the reveal AND the
  // long settled stretch after it, so it reported a **5040ms freeze** which was
  // simply the finished question sitting still. A 5040ms stall would have been
  // reported as real.
  //
  // ⚠ WRONG #2 — find where ink "reaches its plateau and stops climbing". The
  // settled ink DRIFTS by ±2 (2337 → 2339 over ten seconds) from VP8 decode
  // variation, so "stops climbing" never became true and the window ran to the
  // end of the film. **Same 5040ms, different reasoning.**
  //
  // ⚠⚠ BOTH WERE CAUGHT THE SAME WAY: by extracting the frames and LOOKING at
  // them. Neither was caught by the number, which looked like a decisive result.
  //
  // WHAT THE BAND ACTUALLY CONTAINS — measured across a whole film:
  //
  //   f000-f185   ink 0        empty
  //   f186-f200   ink 0→2860   ⚠ THE OPENING'S OWN SUBTEXT wipes through this
  //   f200-f249   ink 2860     same band, sitting
  //   f250        ink 396      Begin clears it; "Q5 Wh" appears
  //   f256-f280   ink 397→2337 ⚠ Q5'S REVEAL — the one under test
  //   f281+       ink 2337±2   settled
  //
  // ⚠ SO A HARNESS THAT TAKES THE FIRST INK RISE MEASURES THE OPENING, NOT Q5.
  // That is the same shape as the recorded method failure where a 2500ms capture
  // filmed the opening and concluded the stall was gone.
  //
  // Q5 is anchored as **the LAST rise from near-empty to settled**: scan back from
  // the end for the final frame where the band was nearly empty, and take the
  // climb that follows it. Derived from the film's own content — no timestamp, no
  // literal, nothing shared with the page.
  // ⚠ SETTLED IS THE FILM'S LAST FRAME, NOT THE MAXIMUM. The opening's subtext
  // is BRIGHTER than Q5 (ink 2860 vs 2337) and passes through the same band, so
  // `Math.max` anchors on the opening and Q5 never reaches it. The film ends on
  // the settled question, which is Q5's own value by construction.
  const settled = inks[inks.length - 1];

  // ⚠⚠ THE ANCHOR IS THE HANDOVER DROP, NOT AN "EMPTY" BAND — AND THIS COST A
  // THIRD WRONG VERSION. Anchoring on "the last frame below 25% of settled"
  // landed at f268, INSIDE the freeze and after most of it, because the frozen
  // band is not empty: it holds "Q5 Wh" at ink ~397, which is well above zero.
  // ⚠ THE WINDOW THEREFORE EXCLUDED THE VERY THING IT EXISTS TO MEASURE, and
  // reported a clean 0ms on a film whose freeze is plainly visible.
  //
  // What actually marks Q5's start is the HANDOVER: the opening's text is
  // replaced in a single frame and ink COLLAPSES (2860 → 195, a 93% drop). The
  // reveal is the climb that follows. Anchored on the last such collapse, so a
  // film containing several text changes still resolves the final one.
  let revealStart = -1;
  for (let i = inks.length - 1; i >= 1; i--) {
    if (inks[i - 1] > settled * 0.5 && inks[i] < settled * 0.35) { revealStart = i; break; }
  }
  // Fallback: a film that opens directly on the reveal has no handover to find.
  if (revealStart < 0) {
    for (let i = inks.length - 1; i >= 0; i--) {
      if (inks[i] < settled * 0.05) { revealStart = i; break; }
    }
  }

  // The reveal ends when ink first comes within a whisker of settled — the ±2
  // drift afterwards is decode noise, not the wipe.
  let revealEnd = -1;
  if (revealStart >= 0) {
    for (let i = revealStart; i < inks.length; i++) {
      if (inks[i] >= settled * 0.995) { revealEnd = i; break; }
    }
  }

  if (revealStart < 0 || revealEnd <= revealStart) {
    console.log(`  ${f}  ⛔ NO REVEAL FOUND in the band — nothing filmed, or the crop is wrong.`);
    results.push({ file: f, ms: null, vacuous: true });
    continue;
  }

  // ⚠ SANITY-CHECK THE WINDOW AGAINST THE ANIMATION'S OWN LENGTH. The reveal is
  // 1300ms; a window wildly longer than that plus the freeze means the anchor
  // found something else, and the run must be discarded rather than reported.
  const windowMs = (revealEnd - revealStart) * FRAME_MS;
  if (windowMs > 6000) {
    console.log(`  ${f}  ⛔ WINDOW ${Math.round(windowMs)}ms IS NOT A 1300ms REVEAL — anchor failed, run discarded.`);
    results.push({ file: f, ms: null, vacuous: true });
    continue;
  }

  // ⚠ Longest static run STRICTLY INSIDE the reveal. `isStatic[i]` describes the
  // pair (i, i+1), so pair indices run [revealStart, revealEnd-1].
  let best = 0, bestAt = -1, cur = 0;
  for (let i = revealStart; i < revealEnd && i < isStatic.length; i++) {
    if (isStatic[i]) {
      cur++;
      if (cur > best) { best = cur; bestAt = i - cur + 1; }
    } else cur = 0;
  }

  const ms = best * FRAME_MS;
  const revealMs = windowMs;
  results.push({ file: f, frames: best + 1, ms, at: bestAt, revealStart, revealEnd, revealMs });

  console.log(
    `  ${f}  freeze ${String(best + 1).padStart(3)}f ~${String(Math.round(ms)).padStart(4)}ms` +
    ` (bounded ${Math.round(ms)}-${Math.round(ms + FRAME_MS)})` +
    `  at f${bestAt} t=${(bestAt * FRAME_MS / 1000).toFixed(2)}s` +
    `  | reveal f${revealStart}-f${revealEnd} (${Math.round(revealMs)}ms)` +
    `  ink ${inks[bestAt]}→${settled}`
  );
}

const good = results.filter((r) => !r.vacuous && r.ms !== null);
if (good.length === 0) {
  console.error(`\n⛔ NOTHING MEASURABLE. Not a clean verdict — a broken one.\n`);
  process.exit(1);
}

const ms = good.map((r) => r.ms).sort((a, b) => a - b);
const median = ms.length % 2 ? ms[(ms.length - 1) / 2] : (ms[ms.length / 2 - 1] + ms[ms.length / 2]) / 2;

console.log(`\n  ── DISTRIBUTION, ${good.length} runs, ONE build, ONE session ──`);
console.log(`     per run   ${ms.map((m) => Math.round(m)).join("  ")}  ms`);
console.log(`     median    ${Math.round(median)}ms`);
console.log(`     range     ${Math.round(ms[0])} - ${Math.round(ms[ms.length - 1])}ms   spread ${Math.round(ms[ms.length - 1] - ms[0])}ms`);

// ⚠ THE VERDICT. The instrument must go RED on today's build — the stall is live.
// A clean verdict here means the INSTRUMENT is wrong, and says so in those words.
const STALL_FLOOR_MS = 3 * FRAME_MS; // 3 frame intervals — beyond one dropped frame
const stalled = good.filter((r) => r.ms >= STALL_FLOOR_MS);

console.log(`\n  ⚠ WHAT THIS DOES NOT WATCH: mobile · Q4-Q1 · the corridor step ·`);
console.log(`    anything shorter than ${FRAME_MS}ms · WHY the freeze happens (no attribution).`);

if (stalled.length === 0) {
  console.log(`\n  ⛔ NO FREEZE FOUND — and that is a finding ABOUT THIS INSTRUMENT.`);
  console.log(`     The stall is live and filmed. A clean verdict means the band, the`);
  console.log(`     tolerance or the window is wrong. DO NOT report the stall as fixed.\n`);
  process.exit(1);
}

console.log(`\n  ⛔ FREEZE PRESENT in ${stalled.length}/${good.length} runs (>= ${Math.round(STALL_FLOOR_MS)}ms).`);
console.log(`     ⚠ Validate against the FILM's signature — static mid-word at "Q5 Wh",`);
console.log(`       inside the first word. A plateau you cannot tie to the visible freeze`);
console.log(`       is not evidence you measured the right thing.\n`);
process.exit(1);
