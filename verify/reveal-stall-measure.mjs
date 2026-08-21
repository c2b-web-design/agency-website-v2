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
//
// ⚠⚠ SORTS ON MTIME — THE NEWEST FILM IN EACH BATCH — NOT ON THE DIRECTORY NAME.
//
// ⛔ THE NAME SORT WAS WRONG AND FAILED SILENTLY, 19 August 2026. It returned
// `entries.sort()` — a LEXICOGRAPHIC comparison — so a batch called
// 'falsify-treatment' sorted after EVERY '2026-…' timestamp, because 'f' > '2'.
// A fresh 5-film run was measured and the measure pass read a stale ONE-FILM
// falsification directory instead, reporting a clean, plausible distribution
// from the wrong films while saying nothing about which ones.
//
// ⚠ THE NAME SORT ONLY EVER WORKED BY COINCIDENCE — it relied on every batch
// being named with a sortable ISO timestamp. The moment one was named for what
// it was ('falsify-baseline', 'commit1-CONTROL', 'step5-post-deletion' — all of
// which exist here), recency and alphabetical order stopped agreeing. mtime is
// the quantity that was meant all along: WHEN THE FILMS WERE SHOT.
//
// ⚠ Dated from the newest run-NN.webm INSIDE the batch, not the directory's own
// mtime, which moves when anything is written near it and is the less direct
// fact. The films are the thing being dated.
function latestBatch(root) {
  let entries = [];
  try {
    entries = readdirSync(root)
      .map((n) => `${root}/${n}`)
      .filter((d) => {
        try { return statSync(d).isDirectory(); } catch { return false; }
      })
      .map((d) => {
        let films = [];
        try { films = readdirSync(d).filter((f) => /^run-\d+\.webm$/.test(f)); } catch { return null; }
        if (films.length === 0) return null;
        let newest = 0;
        for (const f of films) {
          try { newest = Math.max(newest, statSync(`${d}/${f}`).mtimeMs); } catch {}
        }
        return { dir: d, mtime: newest };
      })
      .filter(Boolean);
  } catch { return root; }
  if (entries.length === 0) return root;
  entries.sort((a, b) => a.mtime - b.mtime);
  return entries[entries.length - 1].dir;
}

// Counts batches that actually contain films — the denominator for 'selected
// automatically', so a reader can see how many candidates the sort chose from.
function batchCount(root) {
  try {
    return readdirSync(root)
      .map((n) => `${root}/${n}`)
      .filter((d) => {
        try { return statSync(d).isDirectory(); } catch { return false; }
      })
      .filter((d) => {
        try { return readdirSync(d).some((f) => /^run-\d+\.webm$/.test(f)); } catch { return false; }
      }).length;
  } catch { return 0; }
}

// ⚠ SAY WHICH FILMS THE NUMBER CAME FROM, EVERY RUN — the general fix, of which
// the sort was only the specific one. A reader must never have to INFER which
// batch a distribution was computed from: that inference is what let the
// wrong-directory read pass unnoticed.
function batchStamp(dir) {
  try {
    const films = readdirSync(dir).filter((f) => /^run-\d+\.webm$/.test(f));
    let newest = 0;
    for (const f of films) {
      try { newest = Math.max(newest, statSync(`${dir}/${f}`).mtimeMs); } catch {}
    }
    return newest ? new Date(newest).toISOString().replace("T", " ").slice(0, 19) + " (newest film)" : "unknown";
  } catch { return "unknown"; }
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

// ⚠⚠ WHICH FILMS? SAY IT BEFORE ANYTHING ELSE, INCLUDING ON THE FAILURE PATH.
// The batch line used to print AFTER discovery, so the one case where the reader
// most needed to know which directory was read — the empty one — printed the
// least. A number whose provenance is only inferable is how the wrong-directory
// read of 19 August went unnoticed.
const EXPLICIT = Boolean(process.argv[2] && !process.argv[2].startsWith("--"));
console.error(`
⚠ REVEAL FREEZE — BATCH: ${DIR}`);
console.error(`   filmed:   ${batchStamp(DIR)}`);
console.error(`   selected: ${EXPLICIT ? "EXPLICITLY, from the command line" : "AUTOMATICALLY — newest films by mtime, of " + batchCount(ROOT) + " batches in " + ROOT}`);

const files = readdirSync(DIR).filter((f) => /^run-\d+\.webm$/.test(f)).sort();

// ⚠ AN ABSENCE IS REPORTED AS AN ABSENCE — never as a zero, never as an empty
// distribution. The quiet-zero rule (verify/proven.json, requirement 2) applied
// to this script: '0ms because nothing happened' and '0ms because I measured
// nothing' are the same characters on screen, so this path must not produce a
// number at all.
if (files.length === 0) {
  console.error(`
⛔ NO FILMS FOUND — NOTHING WAS MEASURED. This is an ABSENCE, not a`);
  console.error(`   result: no distribution is reported, and no 0ms is printed, because`);
  console.error(`   a zero here would be indistinguishable from a clean run.`);
  console.error(``);
  console.error(`   looked in : ${DIR}`);
  console.error(`   for       : run-NN.webm`);
  console.error(`   batches   : ${batchCount(ROOT)} directory(ies) containing films under ${ROOT}`);
  console.error(``);
  console.error(`   Run verify/reveal-stall.mjs first, or pass a batch path explicitly.
`);
  process.exit(1);
}

console.log(`   films:    ${files.length} (${files[0]} … ${files[files.length - 1]})`);
console.log(`   channel: decoded PIXELS of the question band (crop ${CROP.w}x${CROP.h} @ ${CROP.x},${CROP.y})`);
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

  const revealMs = windowMs;

  // ⚠⚠ NOT-FOUND IS A NULL, NOT A ZERO. `best` is assigned only inside
  // `if (isStatic[i])` under `cur > best`, where `cur` is at least 1 — so
  // `best === 0` is reachable ONLY when no static pair was found at all. It is
  // the detector's correct, unambiguous encoding of "nothing detected".
  //
  // ⚠ THERE IS NO COLLISION TO PRESERVE: a real one-frame plateau is `best === 1`
  // and prints 2f ~40ms. Nothing legitimate has ever printed 1f ~0ms.
  //
  // ⛔ IT USED TO RENDER AS A MEASUREMENT — `freeze 1f ~0ms (bounded 0-40) at
  // f-1 t=-0.04s ... ink undefined`. `best + 1` made zero look like one frame,
  // and `inks[-1]` produced the `undefined`. A null in the grammar of a number.
  // ⚠ AND IT COUNTED: `ms: 0` passed the `r.ms !== null` filter below, so five
  // non-detections on 19 August 2026 aggregated as five measured zeros and
  // reported "spread 0ms". The spread was over nothing that had been measured.
  //
  // TWO STATES ONLY — a plateau was found, or none was. Whether a not-found run
  // means "no freeze" or "a freeze below this instrument's ~120ms floor" is an
  // interpretation, and it is not the instrument's to make.
  if (best === 0) {
    results.push({ file: f, ms: null, notFound: true, revealStart, revealEnd, revealMs });
    console.log(
      `  ${f}  ⛔ NO PLATEAU FOUND — nothing detected, NOT a 0ms measurement.` +
      `  | reveal f${revealStart}-f${revealEnd} (${Math.round(revealMs)}ms)` +
      `  settled ink ${settled}`
    );
    continue;
  }

  const ms = best * FRAME_MS;
  results.push({ file: f, frames: best + 1, ms, at: bestAt, revealStart, revealEnd, revealMs });

  console.log(
    `  ${f}  freeze ${String(best + 1).padStart(3)}f ~${String(Math.round(ms)).padStart(4)}ms` +
    ` (bounded ${Math.round(ms)}-${Math.round(ms + FRAME_MS)})` +
    `  at f${bestAt} t=${(bestAt * FRAME_MS / 1000).toFixed(2)}s` +
    `  | reveal f${revealStart}-f${revealEnd} (${Math.round(revealMs)}ms)` +
    `  ink ${inks[bestAt]}→${settled}`
  );
}

// ⚠ `r.ms !== null` was ALREADY the right test — it was defeated by a not-found
// run carrying `ms: 0`. That is fixed at the push site above; this filter now
// excludes not-found runs because they genuinely carry null.
const good = results.filter((r) => !r.vacuous && !r.notFound && r.ms !== null);

// ⚠⚠ PRINT THE DENOMINATOR. A spread over 3 of 5 runs is a DIFFERENT CLAIM from a
// spread over 5, and a sample that shrinks silently is the same class of error as
// the zero this fix removes. The two exclusion reasons are reported separately
// because they mean different things: a vacuous run is a FILMING or ANCHOR fault
// (nothing usable filmed, or the window was not a reveal), while a not-found run
// is a SOUND WINDOW in which no plateau was detected.
const notFound = results.filter((r) => r.notFound);
const vacuous = results.filter((r) => r.vacuous);
const dropped = notFound.length + vacuous.length;
const denominator =
  `${good.length} of ${results.length} runs` +
  (dropped > 0
    ? ` — ${dropped} excluded (${notFound.length} no plateau found, ${vacuous.length} vacuous)`
    : ``);

// ⚠⚠ THE THREE LIMITS A NOT-FOUND READING IS CONSISTENT WITH — PRINTED NEXT TO THE
// NUMBER, NOT LEFT IN A COMMENT. A scope caveat in a header is read once, by whoever
// opens the file; the verdict is read every run, by whoever is deciding something.
// Shared by both not-found paths so they cannot drift apart.
function printNotFoundLimits() {
  console.log(`\n     ⚠ NOT-FOUND IS CONSISTENT WITH ALL THREE OF THESE. It is not a`);
  console.log(`       finding that the stall is fixed, and it is not one that this`);
  console.log(`       instrument is broken. Carl rules; this reports.`);
  console.log(`         1. THE FLOOR IS ~${Math.round(3 * FRAME_MS)}ms — three frame intervals at ${FPS}fps. On the`);
  console.log(`            before arm, where the freeze is REAL, run-02 measured 80ms and`);
  console.log(`            would have been MISSED — one run in five, on a build where the`);
  console.log(`            defect exists. "Gone" and "under ~${Math.round(3 * FRAME_MS)}ms" are the same reading.`);
  console.log(`         2. THE DEFECT HAS RELOCATED BEFORE — the stall was once mid-reveal`);
  console.log(`            and MOVED under an attempted fix. This is contention being`);
  console.log(`            rescheduled, not a fixed-position fault. A freeze OUTSIDE the`);
  console.log(`            anchored window would not be seen.`);
  console.log(`         3. ONE THING IS WATCHED — the question band crop (${CROP.w}x${CROP.h} @ ${CROP.x},${CROP.y}),`);
  console.log(`            inside the anchored reveal window. Nothing else on the page.\n`);
}

if (good.length === 0) {
  // ⛔ THIS PATH USED TO READ "NOTHING MEASURABLE. Not a clean verdict — a broken
  // one." That is the same refuted premise in different words: it calls an
  // all-not-found result a broken instrument. A run in which every film yielded a
  // sound window and no plateau is a FINDING, not a malfunction — the two arms of
  // 21 August 2026 are what distinguish them. A vacuous run still IS a fault, and
  // the denominator says which is which.
  console.error(`\n⛔ NO PLATEAU FOUND IN ANY RUN.`);
  console.error(`   ${denominator}`);
  if (vacuous.length > 0) {
    console.error(`   ⚠ ${vacuous.length} run(s) were VACUOUS — nothing filmed, or the window was not a`);
    console.error(`     reveal. That IS an instrument or filming fault and needs looking at.`);
  }
  if (notFound.length > 0 && vacuous.length === 0) {
    console.error(`   Every window was sound; no static plateau was detected in any of them.`);
  }
  printNotFoundLimits();
  process.exit(1);
}

const ms = good.map((r) => r.ms).sort((a, b) => a - b);
const median = ms.length % 2 ? ms[(ms.length - 1) / 2] : (ms[ms.length / 2 - 1] + ms[ms.length / 2]) / 2;

console.log(`\n  ── DISTRIBUTION, ${denominator}, ONE build, ONE session ──`);
console.log(`     per run   ${ms.map((m) => Math.round(m)).join("  ")}  ms`);
console.log(`     median    ${Math.round(median)}ms`);
console.log(`     range     ${Math.round(ms[0])} - ${Math.round(ms[ms.length - 1])}ms   spread ${Math.round(ms[ms.length - 1] - ms[0])}ms`);

// ⚠ THE VERDICT. Report what was found and stop.
//
// ⛔ THIS BLOCK USED TO ASSERT ITS OWN SUBJECT. It read "the instrument must go RED
// on today's build — the stall is live", and the not-found branch printed "The stall
// is live and filmed. A clean verdict means the band, the tolerance or the window is
// wrong. DO NOT report the stall as fixed."
//
// That was true when written on 18 August 2026, and it was never the instrument's to
// assert. An instrument that hardcodes the existence of its subject cannot report on
// whether the subject exists — there was no path by which absence was a finding.
//
// ⛔ REFUTED BY EXPERIMENT, 21 August 2026. Same instrument at 031c207, same crop,
// same machine, same session, two arms:
//     before 5af5709        freeze 80-280ms, median 120ms, 5 of 5 runs
//     after  31e9c3e onward NO PLATEAU FOUND, 0 of 5, 0 vacuous
// The detector CAN see this freeze. "The band or the window is wrong" is refuted as
// the explanation for the after-arm zeros.
//
// ⛔ AND THE MIRROR IMAGE IS NOT THE FIX. This must not assert that the stall is
// fixed, gone or resolved either — that would be the same unevidenced premise
// pointing the other way. The instrument reports; Carl rules.
const STALL_FLOOR_MS = 3 * FRAME_MS; // 3 frame intervals — beyond one dropped frame
const stalled = good.filter((r) => r.ms >= STALL_FLOOR_MS);

console.log(`\n  ⚠ WHAT THIS DOES NOT WATCH: mobile · Q4-Q1 · the corridor step ·`);
console.log(`    anything shorter than ${FRAME_MS}ms · WHY the freeze happens (no attribution).`);

if (stalled.length === 0) {
  console.log(`\n  ⛔ NO FREEZE AT OR ABOVE THE ${Math.round(STALL_FLOOR_MS)}ms FLOOR in ${good.length}/${good.length} measured runs.`);
  console.log(`     Plateaus WERE detected and every one fell below the floor.`);
  console.log(`     ⚠ THIS IS A FINDING ABOUT THE SUBJECT, NOT A VERDICT ON THE BUILD.`);
  printNotFoundLimits();
  process.exit(1);
}

console.log(`\n  ⛔ FREEZE PRESENT in ${stalled.length}/${good.length} runs (>= ${Math.round(STALL_FLOOR_MS)}ms).`);
console.log(`     ⚠ Validate against the FILM's signature — static mid-word at "Q5 Wh",`);
console.log(`       inside the first word. A plateau you cannot tie to the visible freeze`);
console.log(`       is not evidence you measured the right thing.\n`);
process.exit(1);
