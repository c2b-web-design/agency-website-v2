/** THE FILM's SELECTS, BUILT FOR RESOLVE (12 October 2026 — Carl: Resolve 21.1.1 free; "its important we show approvals").
 *  Every candidate in `selects.md` cut to its own file in `08 Selects/`: 1920×1080, CONSTANT 30 fps, H.264 — so the screen
 *  recordings' 15 fps and variable ~29 fps and the clips' 25 fps never reach Resolve (variable rate drifts there). Stills
 *  become clips of their hold length. Then a timeline in story order: `selects.fcpxml` (FCPXML 1.8 — assets by `src`) and
 *  `selects.edl` (CMX3600, 30 NDF, clip names) as the fallback; a marker on each clip names its step and why.
 *  Usage: node …/whoweare-selects-build.mjs   ⚠ Re-running overwrites `08 Selects/`. */
import { execFileSync } from "node:child_process";
import { mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";
const FILM = join(homedir(), "Videos", "C2B Films", "01 Who we are button");
const OUT = join(FILM, "08 Selects");
mkdirSync(OUT, { recursive: true });
const S1 = join(FILM, "02 Plan and review", "2026-10-12_121735_plan_architect-review_screen.mp4");
const S2 = join(FILM, "05 Pass 3 - Light", "2026-10-12_152733_light_judging-session2_screen.mp4");
const find = (dir, re) => { const f = readdirSync(join(FILM, dir)).find((n) => re.test(n)); if (!f) throw new Error(`no ${re} in ${dir}`); return join(FILM, dir, f); };
const t = (hms) => hms.split(":").reduce((a, v) => a * 60 + Number(v), 0);
// [id, step, note, source, in (s or h:mm:ss), out | hold seconds for a still]
const SELECTS = [
  ["00A", "0 The Shire", "the section as it was: a flat white pill", find("06 On the page", /1356_page_before_section\.png$/), 0, 5],
  ["00B", "0 The Shire", "close on the old button", find("00 References", /who-we-are-before_button\.png$/), 0, 4],
  ["00C", "0 The Shire", "its only life: a hover", find("00 References", /who-we-are-before_button-hover\.png$/), 0, 3],
  ["01B", "1 The idea", "the family it joins: Next step on /start", S1, "0:31:25", "0:32:00"],
  ["01C", "1 The idea", "where the teal came from: the swatch sheet", find("00 References", /brand-colours_swatch-sheet/), 0, 5],
  ["01D", "1 The idea", "where the shape came from: Next step", find("00 References", /next-step_button-sheet/), 0, 5],
  ["02A", "2 Plan and review", "the plan presented: Accept this plan?", S1, "0:04:30", "0:05:10"],
  ["02B", "2 Plan and review", "the plan handed to the Architect", S1, "0:06:00", "0:07:15"],
  ["02C", "2 Plan and review", "plan v2, amended per the review", S1, "0:12:00", "0:12:40"],
  ["02D", "2 Plan and review", "APPROVAL: implement Stage 1 and build the Mesh", S1, "0:22:00", "0:24:30"],
  ["03A", "3 Pass 1 clay", "the approved clay pill, tilting at 4x", find("03 Pass 1 - Mesh", /1305_mesh_take3_tilt-zoom4\.mp4$/), 0, null],
  ["03B", "3 Pass 1 clay", "the clay pills on the bench", S1, "0:48:00", "0:50:30"],
  ["03C", "3 Pass 1 clay", "APPROVAL: yes this pass is approved", S1, "0:56:58", "0:58:35"],
  ["04A", "4 Pass 2 material", "teal metal, the ice-blue words raised in 3D", find("04 Pass 2 - Material", /1340_material_take8_tilt-zoom4\.mp4$/), 0, null],
  ["04B", "4 Pass 2 material", "the extruded teal pill on the bench", S1, "1:32:00", "1:33:00"],
  ["04C", "4 Pass 2 material", "APPROVAL: it looks good so far, approved", S1, "1:27:25", "1:28:40"],
  ["05A", "5 Pass 3 light", "the moving lamp on its path, easing off over the words", find("05 Pass 3 - Light", /moving3-dip_zoom4\.mp4$/), 0, null],
  ["05B", "5 Pass 3 light", "the same with its path drawn", find("05 Pass 3 - Light", /moving3-dip_helpers\.mp4$/), 0, null],
  ["05C", "5 Pass 3 light", "the dip film playing as it was judged", S2, "1:00:00", "1:00:30"],
  ["06A", "6 Scaled up", "the 2x button in the rebalanced section", S2, "1:12:00", "1:12:30"],
  ["06B", "6 Scaled up", "2x, the text still small", find("05 Pass 3 - Light/size", /size-2x-gap72-in-section\.png$/), 0, 4],
  ["06C", "6 Scaled up", "the text scaled with it", find("05 Pass 3 - Light/size", /size-2x-text-up\.png$/), 0, 4],
  ["06D", "6 Scaled up", "APPROVAL: yes, that looks a lot better", S2, "1:12:20", "1:13:20"],
  ["07A", "7 The roll", "the solid clay pill rolling; the words come round", find("03 Pass 1 - Mesh", /roll1-clay_zoom4\.mp4$/), 0, null],
  ["07B", "7 The roll", "the clay roll on the bench, edge-on included", S2, "1:32:00", "1:34:30"],
  ["07C", "7 The roll", "is the back of the pill flat? -> a forward rotation", S2, "1:16:00", "1:18:30"],
  ["07D", "7 The roll", "APPROVAL: the roll looks great, implement it", S2, "1:42:00", "1:44:00"],
  ["08A", "8 On the page", "the finished section: free, held as the pointer arrives, resumes", find("06 On the page", /1721_page_roll2_section\.mp4$/), 0, null],
  ["08B", "8 On the page", "the same, cropped to the button", find("06 On the page", /1721_page_roll2_button-2x\.mp4$/), 0, null],
  ["08C", "8 On the page", "the live page in the browser, rolling", S2, "1:53:44", "1:56:44"],
  ["09A", "9 How it's lit", "gold = the global light, cyan = the moving light", find("06 On the page", /1729_page_helpers1_section\.mp4$/), 0, null],
  ["09B", "9 How it's lit", "the helpers on the page in the browser", S2, "2:02:00", "2:02:40"],
  ["09C", "9 How it's lit", "APPROVAL: most definately approved, excellent work", S2, "2:05:00", "2:06:30"],
  ["10A", "10 Live", "pushed; all three deployments Ready", S2, "2:16:47", "2:18:00"],
  ["10B", "10 Live", "the finished home page, clean", S2, "2:09:40", "2:10:10"],
  ["10C", "10 Live", "outro: That is how the work gets done.", S2, "2:14:00", "2:14:20"],
];
const FPS = 30;
const VF = "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=black,fps=30,format=yuv420p";
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48);
const probe = (f) => Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]).toString().trim());
const built = [];
for (const [id, step, note, src, a, b] of SELECTS) {
  const name = `${id}_${slug(note)}.mp4`;
  const out = join(OUT, name);
  const still = /\.(png|jpe?g)$/i.test(src);
  const args = ["-hide_banner", "-loglevel", "error", "-y"];
  if (still) args.push("-loop", "1", "-t", String(b), "-i", src);
  else if (b === null) args.push("-i", src);
  else args.push("-ss", String(typeof a === "string" ? t(a) : a), "-to", String(typeof b === "string" ? t(b) : b), "-i", src);
  // ⚠ -ss/-to BEFORE -i seek the input; with a re-encode the cut is frame-accurate.
  if (!still && b !== null) { const i = args.indexOf("-to"); const to = Number(args[i + 1]) - Number(args[args.indexOf("-ss") + 1]); args.splice(i, 2); args.push("-t", String(to)); }
  args.push("-an", "-vf", VF, "-r", String(FPS), "-c:v", "libx264", "-crf", "18", "-preset", "medium", "-g", "30", "-movflags", "+faststart", out);
  execFileSync("ffmpeg", args);
  const frames = Math.round(probe(out) * FPS);
  built.push({ id, step, note, name, out, frames });
  console.log(`${id}  ${(frames / FPS).toFixed(1).padStart(6)} s  ${name}`);
}
// ── FCPXML 1.8 ──
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const fileUrl = (p) => "file:///" + p.replace(/\\/g, "/").split("/").map(encodeURIComponent).join("/").replace(/^([A-Za-z])%3A/, "$1:");
let offset = 0;
const assets = built.map((c, i) => `    <asset id="a${i + 1}" name="${esc(c.name)}" src="${fileUrl(c.out)}" start="0s" duration="${c.frames}/30s" hasVideo="1" format="r1"/>`).join("\n");
const clips = built.map((c, i) => {
  const s = `        <asset-clip ref="a${i + 1}" name="${esc(c.id + " " + c.step)}" offset="${offset}/30s" start="0s" duration="${c.frames}/30s" format="r1">\n          <marker start="0s" duration="1/30s" value="${esc(`${c.id} | ${c.step} | ${c.note}`)}"/>\n        </asset-clip>`;
  offset += c.frames;
  return s;
}).join("\n");
writeFileSync(join(FILM, "selects.fcpxml"), `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE fcpxml>
<fcpxml version="1.8">
  <resources>
    <format id="r1" name="FFVideoFormat1080p30" frameDuration="1/30s" width="1920" height="1080"/>
${assets}
  </resources>
  <library>
    <event name="Who we are - selects">
      <project name="Who we are - selects (story order)">
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
  const line = `${String(i + 1).padStart(3, "0")}  AX       V     C        ${tc(0)} ${tc(c.frames)} ${tc(108000 + rec)} ${tc(108000 + rec + c.frames)}\n* FROM CLIP NAME: ${c.name}\n* COMMENT: ${c.id} | ${c.step} | ${c.note}\n`;
  rec += c.frames;
  return line;
}).join("\n");
writeFileSync(join(FILM, "selects.edl"), `TITLE: Who we are - selects\nFCM: NON-DROP FRAME\n\n${ev}`);
console.log(`${built.length} selects, ${(offset / FPS / 60).toFixed(1)} min in story order → 08 Selects/, selects.fcpxml, selects.edl`);
