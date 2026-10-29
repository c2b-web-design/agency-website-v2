/** FILM 01 — THE 10-MINUTE CUT, BUILT FOR RESOLVE (29 October 2026). Carl's approved stage weights (`selects.md`, "The
 *  10-minute cut"): the story in eleven stages, time by what the viewer learns, each pass ending on Carl's approval.
 *  Every segment is cut from its ORIGINAL source (not from the H.264 selects) to its own file in `09 Cut - 10 min/`:
 *  1920×1080, CONSTANT 30 fps, DNxHR HQ 4:2:2 in .mov (an intermediate for grading; Resolve Free reads it), tagged
 *  BT.709, LIMITED range. Then the timeline: `cut10.fcpxml` (FCPXML 1.8) and `cut10.edl` (CMX3600, the fallback).
 *  ⛔ COLOUR, MEASURED 29 October: the screen recordings are UNTAGGED and LIMITED range (black Y 14–15, white 238);
 *  decoded as BT.601 — first assumed BT.709 (the HD convention), then MEASURED 601 against a known-601 recording (see
 *  `IN` below). The Playwright clips are tagged BT.601 (from VP8), decoded as such. Stills are RGB.
 *  In/out points: the approvals found by OCR (Tesseract 5.4) of the selects; the pictures by contact sheet.
 *  Usage: node …/whoweare-cut10-build.mjs   ⚠ Re-running overwrites `09 Cut - 10 min/`. */
import { execFileSync } from "node:child_process";
import { mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";

const FILM = join(homedir(), "Videos", "C2B Films", "01 Who we are button");
const OUT = join(FILM, "09 Cut - 10 min");
mkdirSync(OUT, { recursive: true });
const S1 = join(FILM, "02 Plan and review", "2026-10-12_121735_plan_architect-review_screen.mp4");
const S2 = join(FILM, "05 Pass 3 - Light", "2026-10-12_152733_light_judging-session2_screen.mp4");
const find = (dir, re) => { const f = readdirSync(join(FILM, dir)).find((n) => re.test(n)); if (!f) throw new Error(`no ${re} in ${dir}`); return join(FILM, dir, f); };
const t = (hms) => hms.split(":").reduce((a, v) => a * 60 + Number(v), 0);
// a screen-recording segment: the select's in point (as in whoweare-selects-build.mjs) + an offset into that select
const scr = (src, selIn, off) => ({ src, kind: "screen", at: t(selIn) + off });
const clip = (src, off = 0) => ({ src, kind: "clip", at: off });
const still = (src) => ({ src, kind: "still", at: 0 });

// [id, stage, note, source, seconds (null: the whole clip)]
const CUT = [
  ["00A", "0 Before", "the section as it was: a flat white pill", still(find("06 On the page", /1356_page_before_section\.png$/)), 6],
  ["00B", "0 Before", "close on the old button", still(find("00 References", /who-we-are-before_button\.png$/)), 5],
  ["00C", "0 Before", "its only life: a hover", still(find("00 References", /who-we-are-before_button-hover\.png$/)), 4],
  ["01A", "1 The idea", "the discussion: the agenda", still(find("01 Discussion", /1723_discussion_agenda_full\.png$/)), 6],
  ["01B", "1 The idea", "the discussion: the button family", still(find("01 Discussion", /1735_discussion_family-take2\.png$/)), 6],
  ["01C", "1 The idea", "the discussion: the world it lives in", still(find("01 Discussion", /1742_discussion_world-take2\.png$/)), 6],
  ["01D", "1 The idea", "the discussion: the stages and the studio", still(find("01 Discussion", /1805_discussion_stages-hdri-take2\.png$/)), 6],
  ["01E", "1 The idea", "where the teal came from: the swatch sheet", still(find("00 References", /brand-colours_swatch-sheet/)), 5],
  ["01F", "1 The idea", "where the shape came from: Next step", still(find("00 References", /next-step_button-sheet/)), 5],
  ["01G", "1 The idea", "the family it joins: Next step on /start", scr(S1, "0:31:25", 0), 16],
  ["02A", "2 Plan and review", "the plan presented: Accept this plan?", scr(S1, "0:04:30", 20), 15],
  ["02B", "2 Plan and review", "the plan handed to the Architect", scr(S1, "0:06:00", 24), 20],
  ["02C", "2 Plan and review", "plan v2, amended per the review", scr(S1, "0:12:00", 0), 15],
  ["02D", "2 Plan and review", "APPROVAL: implement Stage 1 and build the Mesh (typed, sent)", scr(S1, "0:22:00", 52), 30],
  ["03A", "3 Pass 1 clay", "the clay pills on the bench", scr(S1, "0:48:00", 6), 20],
  ["03B", "3 Pass 1 clay", "the approved clay pill, tilting at 4x", clip(find("03 Pass 1 - Mesh", /1305_mesh_take3_tilt-zoom4\.mp4$/)), null],
  ["03C", "3 Pass 1 clay", "APPROVAL: is the shape approved? yes this pass is approved", scr(S1, "0:56:58", 0), 24],
  ["04A", "4 Pass 2 material", "the first metal: bare teal", clip(find("04 Pass 2 - Material", /material_take1_tilt-zoom4\.mp4$/)), 8],
  ["04B", "4 Pass 2 material", "the words arrive, ice blue", clip(find("04 Pass 2 - Material", /material_take7_tilt-zoom4\.mp4$/)), 8],
  ["04C", "4 Pass 2 material", "teal metal, the ice-blue words raised in 3D", clip(find("04 Pass 2 - Material", /1340_material_take8_tilt-zoom4\.mp4$/)), null],
  // ⚠ the bench view runs 1:31:48 → ~1:32:03 (seen frame by frame); the old select's 1:32:00 caught only its last 3 s
  ["04D", "4 Pass 2 material", "the extruded teal pill on the bench", scr(S1, "1:31:48", 0), 14],
  ["04E", "4 Pass 2 material", "APPROVAL: it looks good so far, approved", scr(S1, "1:27:25", 0), 27],
  ["05A", "5 Pass 3 light", "the logo's studio: made for gold, it turned the teal green", clip(find("05 Pass 3 - Light", /light-take4-logo-studio_tilt-zoom4\.mp4$/)), 9],
  ["05B", "5 Pass 3 light", "a studio designed for the button", clip(find("05 Pass 3 - Light", /light-take8-teal-studio_tilt-zoom4\.mp4$/)), 12],
  ["05C", "5 Pass 3 light", "the moving lamp, real size", clip(find("05 Pass 3 - Light", /moving3-dip_real-size\.mp4$/)), null],
  ["05D", "5 Pass 3 light", "the moving lamp, close: easing off over the words", clip(find("05 Pass 3 - Light", /moving3-dip_zoom4\.mp4$/)), null],
  ["05E", "5 Pass 3 light", "the same with its path drawn", clip(find("05 Pass 3 - Light", /moving3-dip_helpers\.mp4$/)), null],
  ["05F", "5 Pass 3 light", "the dip film playing as it was judged", scr(S2, "1:00:00", 0), 24],
  ["06A", "6 Scaled up", "the 2x button in the rebalanced section", scr(S2, "1:12:00", 0), 12],
  ["06B", "6 Scaled up", "2x, the text still small", still(find("05 Pass 3 - Light/size", /size-2x-gap72-in-section\.png$/)), 4],
  ["06C", "6 Scaled up", "the text scaled with it", still(find("05 Pass 3 - Light/size", /size-2x-text-up\.png$/)), 4],
  ["06D", "6 Scaled up", "APPROVAL: yes, that looks a lot better", scr(S2, "1:12:20", 10), 10],
  ["07A", "7 The roll", "is the back of the pill flat? there's no back to it at all", scr(S2, "1:16:00", 0), 20],
  ["07B", "7 The roll", "the solid clay pill rolling; the words come round", clip(find("03 Pass 1 - Mesh", /roll1-clay_zoom4\.mp4$/)), null],
  ["07C", "7 The roll", "the clay roll on the bench", scr(S2, "1:32:00", 0), 12],
  ["07D", "7 The roll", "APPROVAL: the roll looks great, implement it", scr(S2, "1:42:00", 50), 12],
  ["08A", "8 On the page", "the finished section: free, held as the pointer arrives, resumes", clip(find("06 On the page", /1721_page_roll2_section\.mp4$/)), null],
  ["08B", "8 On the page", "the live page in the browser, rolling", scr(S2, "1:53:44", 20), 14],
  ["09A", "9 How it's lit", "gold = the global light, cyan = the moving light", clip(find("06 On the page", /1729_page_helpers1_section\.mp4$/)), 20],
  ["09B", "9 How it's lit", "the helpers on the page in the browser", scr(S2, "2:02:00", 0), 10],
  ["09C", "9 How it's lit", "APPROVAL: most definately approved, excellent work", scr(S2, "2:05:00", 0), 15],
  ["10A", "10 Live", "committed and pushed; all three deployments Ready", scr(S2, "2:16:47", 55), 10],
  ["10B", "10 Live", "the finished home page, clean", scr(S2, "2:09:40", 0), 10],
  ["10C", "10 Live", "outro: That is how the work gets done.", scr(S2, "2:14:00", 0), 15],
];

const FPS = 30;
// ⛔ the screen recordings are BT.601, MEASURED 29 October (later): VS Code's blue badge read as 601 is (45,124,157), the
// SAME pixel as in a known-601 recording (ffmpeg gdigrab, film 04's discussion); read as 709 it is 7 levels off. The first
// build of this cut assumed 709 (the HD convention) and was rebuilt.
const IN = { screen: "in_color_matrix=bt601:in_range=tv:", clip: "in_color_matrix=bt601:in_range=tv:", still: "" };
const vf = (kind) =>
  `scale=1920:1080:${IN[kind]}out_color_matrix=bt709:out_range=tv:force_original_aspect_ratio=decrease:flags=lanczos,` +
  `pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=black,fps=${FPS},format=yuv422p,` +
  // ⚠ without this the .mov carried the matrix (bt709) but primaries and transfer "unknown" (measured): Resolve guesses
  `setparams=color_primaries=bt709:color_trc=bt709:colorspace=bt709:range=tv`;
const TAGS = ["-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709", "-color_range", "tv"];
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48);
const probe = (f) => Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]).toString().trim());

const built = [];
for (const [id, stage, note, s, secs] of CUT) {
  const name = `${id}_${slug(note)}.mov`;
  const out = join(OUT, name);
  const args = ["-hide_banner", "-loglevel", "error", "-y"];
  if (s.kind === "still") args.push("-loop", "1", "-framerate", String(FPS), "-t", String(secs), "-i", s.src);
  else {
    args.push("-ss", String(s.at), "-i", s.src);
    if (secs !== null) args.push("-t", String(secs));
  }
  args.push("-an", "-vf", vf(s.kind), "-r", String(FPS), "-c:v", "dnxhd", "-profile:v", "dnxhr_hq", ...TAGS, out);
  execFileSync("ffmpeg", args);
  const frames = Math.round(probe(out) * FPS);
  built.push({ id, stage, note, name, out, frames });
  console.log(`${id}  ${(frames / FPS).toFixed(1).padStart(6)} s  ${stage.padEnd(20)} ${note}`);
}

// ── FCPXML 1.8 ── (as whoweare-selects-build.mjs, with the colour space named on the format)
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const fileUrl = (p) => "file:///" + p.replace(/\\/g, "/").split("/").map(encodeURIComponent).join("/").replace(/^([A-Za-z])%3A/, "$1:");
let offset = 0;
const assets = built.map((c, i) => `    <asset id="a${i + 1}" name="${esc(c.name)}" src="${fileUrl(c.out)}" start="0s" duration="${c.frames}/30s" hasVideo="1" format="r1"/>`).join("\n");
let lastStage = "";
const clips = built.map((c, i) => {
  // a CHAPTER marker where each stage begins, a plain marker on every clip
  const chapter = c.stage !== lastStage ? `\n          <chapter-marker start="0s" duration="1/30s" value="${esc(c.stage)}"/>` : "";
  lastStage = c.stage;
  const s = `        <asset-clip ref="a${i + 1}" name="${esc(c.id + " " + c.stage)}" offset="${offset}/30s" start="0s" duration="${c.frames}/30s" format="r1">\n          <marker start="0s" duration="1/30s" value="${esc(`${c.id} | ${c.stage} | ${c.note}`)}"/>${chapter}\n        </asset-clip>`;
  offset += c.frames;
  return s;
}).join("\n");
writeFileSync(join(FILM, "cut10.fcpxml"), `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE fcpxml>
<fcpxml version="1.8">
  <resources>
    <format id="r1" name="FFVideoFormat1080p30" frameDuration="1/30s" width="1920" height="1080" colorSpace="1-1-1 (Rec. 709)"/>
${assets}
  </resources>
  <library>
    <event name="Who we are - 10 min cut">
      <project name="Who we are - 10 min cut (approved stage weights)">
        <sequence format="r1" duration="${offset}/30s" tcStart="0s" tcFormat="NDF">
          <spine>
${clips}
          </spine>
        </sequence>
      </project>
    </event>
  </library>
</fcpxml>
`);
// ── CMX3600 EDL (fallback) ──
const tc = (f) => [Math.floor(f / 108000), Math.floor(f / 1800) % 60, Math.floor(f / 30) % 60, f % 30].map((v) => String(v).padStart(2, "0")).join(":");
let rec = 0;
const ev = built.map((c, i) => {
  const line = `${String(i + 1).padStart(3, "0")}  AX       V     C        ${tc(0)} ${tc(c.frames)} ${tc(108000 + rec)} ${tc(108000 + rec + c.frames)}\n* FROM CLIP NAME: ${c.name}\n* COMMENT: ${c.id} | ${c.stage} | ${c.note}\n`;
  rec += c.frames;
  return line;
}).join("\n");
writeFileSync(join(FILM, "cut10.edl"), `TITLE: Who we are - 10 min cut\nFCM: NON-DROP FRAME\n\n${ev}`);
// per-stage totals against the approved weights
const W = { "0": 15, "1": 50, "2": 80, "3": 60, "4": 75, "5": 90, "6": 30, "7": 60, "8": 50, "9": 45, "10": 35 };
const per = {};
for (const c of built) { const k = c.stage.split(" ")[0]; per[k] = (per[k] ?? 0) + c.frames / FPS; }
for (const [k, w] of Object.entries(W)) console.log(`stage ${k.padStart(2)}: ${per[k].toFixed(1).padStart(5)} s (approved ${w})`);
console.log(`${built.length} segments, ${(offset / FPS / 60).toFixed(2)} min → 09 Cut - 10 min/, cut10.fcpxml, cut10.edl`);
