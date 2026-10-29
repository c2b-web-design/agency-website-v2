/** FILMS 02 AND 04 — THE ~10-MINUTE CUTS, BUILT FOR RESOLVE (29 October 2026). Carl: *"Cut 2 + 4."* The same journey as
 *  film 01 (`whoweare-cut10-build.mjs`, whose output format this matches): the beginning (before, the idea), the middle
 *  (the plan and its review, each pass ending on Carl's approval), the end (on the page, how it works). Stage weights are
 *  the Builder's, by what the viewer learns — stated in each film's shot list for Carl to move.
 *  Every segment from its original source to its own DNxHR HQ 4:2:2 .mov in `<film>/09 Cut - 10 min/`, 1920×1080,
 *  CONSTANT 30 fps, BT.709 limited range; then `cut10.fcpxml` (chapter marker per stage) and `cut10.edl`.
 *  ⛔ COLOUR, MEASURED 29 October: the FFmpeg screen recordings are BT.601 (untagged; VS Code's badge matched a known-601
 *  recording to the pixel) and so are the Playwright clips (tagged); today's corner-bench clips and the rebuilt film 04
 *  discussion MP4 are BT.709 (converted, tagged). Each source is decoded by its measured standard (`k`).
 *  Discussion in/out points: OCR of each scroll recording (a frame a second), matched to the session transcript.
 *  Carl blurs personal details in Resolve (a blur strip); the files here are unmasked.
 *    node …/films-02-04-cut-build.mjs 02|04 */
import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";

const WHICH = process.argv[2];
const ROOT = join(homedir(), "Videos", "C2B Films");
const v601 = (src, at = 0) => ({ src, k: "601", at });
const v709 = (src, at = 0) => ({ src, k: "709", at });
const still = (src) => ({ src, k: "still", at: 0 });

const FILMS = {
  "02": {
    dir: "02 Ornate corners",
    title: "Ornate corners",
    weights: { "0": 15, "1": 70, "3": 175, "4": 90, "5": 35, "6": 75, "7": 95, "8": 20 },
    cut: (D) => [
      ["00A", "0 Before", "the boxes as they were: grey hairlines (services)", still("00 References/2026-10-19_1838_ref_before-boxes-services.png"), 7],
      ["00B", "0 Before", "the boxes as they were (work)", still("00 References/2026-10-19_1838_ref_before-boxes-work.png"), 8],
      ["01A", "1 The idea", "can you give them boxes; ornate corners, not a 90 degree line", D(234), 28],
      ["01B", "1 The idea", "a straight back, everything ornate inside the box", D(262), 14],
      ["01C", "1 The idea", "the inspiration board", still("00 References/2026-10-19_1257_ref_inspiration.png"), 6],
      ["01D", "1 The idea", "Inspiration means something like this. We design our own. A material per section", D(276), 22],
      ["03A", "3 Pass 1 shape", "take 1: tubes, almost Victorian", D(310), 10],
      ["03B", "3 Pass 1 shape", "take 1, the railing", still("03 Pass 1 - Shape/2026-10-19_1318_shape_take1-oblique.png"), 4],
      ["03C", "3 Pass 1 shape", "take 2", still("03 Pass 1 - Shape/2026-10-19_1337_shape_take2-oblique.png"), 4],
      ["03D", "3 Pass 1 shape", "if it was more solid: engraving and topology", D(320), 8],
      ["03E", "3 Pass 1 shape", "I had to go elsewhere for help", D(328), 12],
      ["03F", "3 Pass 1 shape", "the mock-up made elsewhere", still("00 References/2026-10-19_1346_ref_mockup-elsewhere.png"), 5],
      ["03G", "3 Pass 1 shape", "Gemini's misses", still("00 References/2026-10-19_1354_ref_gemini-rejected.png"), 4],
      ["03H", "3 Pass 1 shape", "the carved bracket", still("00 References/2026-10-19_1346_ref_carved-bracket-photo.png"), 9],
      ["03J", "3 Pass 1 shape", "Its ours. Copy it.", D(348), 12],
      ["03K", "3 Pass 1 shape", "take 3: the relief", still("03 Pass 1 - Shape/2026-10-19_1401_shape_take3-oblique.png"), 5],
      ["03L", "3 Pass 1 shape", "now we are talking", D(364), 8],
      ["03M", "3 Pass 1 shape", "the carving: smooth mass, then the relief", v709("03 Pass 1 - Shape/2026-10-29_1559_bench_carving-smooth-to-relief_1080p30.mp4"), null],
      ["03N", "3 Pass 1 shape", "the relief height", v709("03 Pass 1 - Shape/2026-10-29_1600_bench_relief-height_1080p30.mp4"), null],
      ["03O", "3 Pass 1 shape", "the key light raked across the clay", v709("03 Pass 1 - Shape/2026-10-29_1600_bench_key-light-sweep_1080p30.mp4"), null],
      ["03P", "3 Pass 1 shape", "the inspection views: clay, mesh, zebra, normals", v709("03 Pass 1 - Shape/2026-10-29_1601_bench_inspection-modes_1080p30.mp4"), null],
      ["03Q", "3 Pass 1 shape", "the limit lines: the ornament stays clear of the text", v709("03 Pass 1 - Shape/2026-10-29_1602_bench_close-limit-lines_1080p30.mp4"), null],
      ["03R", "3 Pass 1 shape", "the clay, turned", v709("03 Pass 1 - Shape/2026-10-29_1609_bench_orbit-clay_1080p30.mp4"), null],
      ["03S", "3 Pass 1 shape", "APPROVAL: the shape", D(370), 8],
      ["04A", "4 Pass 2 material", "the first gold", still("04 Pass 2 - Material/2026-10-19_1421_material_gold1-oblique.png"), 4],
      ["04B", "4 Pass 2 material", "the gold: mirror, too rough, the satin take", v709("04 Pass 2 - Material/2026-10-29_1602_bench_gold-roughness-mirror-to-satin_1080p30.mp4"), null],
      ["04C", "4 Pass 2 material", "the satin gilt", still("04 Pass 2 - Material/2026-10-19_1839_bench_gold-oblique.png"), 5],
      ["04D", "4 Pass 2 material", "APPROVAL: the satin gilt", D(392), 8],
      ["04E", "4 Pass 2 material", "the first blue: too dark", still("04 Pass 2 - Material/2026-10-19_1429_material_blue1-oblique.png"), 4],
      ["04F", "4 Pass 2 material", "the second blue", still("04 Pass 2 - Material/2026-10-19_1431_material_blue2-oblique.png"), 4],
      ["04G", "4 Pass 2 material", "the blue: platinum, the swatch, the enamel take", v709("04 Pass 2 - Material/2026-10-29_1603_bench_blue-platinum-swatch-enamel_1080p30.mp4"), null],
      ["04H", "4 Pass 2 material", "the clear coat: enamel over metal", v709("04 Pass 2 - Material/2026-10-29_1603_bench_blue-clear-coat-on_1080p30.mp4"), null],
      ["04I", "4 Pass 2 material", "the enamel blue", still("04 Pass 2 - Material/2026-10-19_1839_bench_blue-oblique.png"), 5],
      ["04J", "4 Pass 2 material", "APPROVAL: the blue", D(413), 8],
      ["05A", "5 Plan and review", "commit and push, and consult the Architect", D(421), 14],
      ["05B", "5 Plan and review", "to the Architect", still("01 Discussion/2026-10-19_1437_discussion_to-the-architect.png"), 5],
      ["05C", "5 Plan and review", "they arrive box by box; the box shape is implied by the corners", D(436), 14],
      ["06A", "6 On the page", "on the page (services)", still("06 On the page/2026-10-19_1559_page_t2-services.png"), 4],
      ["06B", "6 On the page", "arriving, box by box", still("06 On the page/2026-10-19_1559_page_t2-services-mid.png"), 4],
      ["06C", "6 On the page", "on the page (work)", still("06 On the page/2026-10-19_1559_page_t2-work.png"), 4],
      ["06D", "6 On the page", "true size: the old border against the corners", v709("03 Pass 1 - Shape/2026-10-29_1602_bench_true-size-old-border-against-corners_1080p30.mp4"), null],
      ["06E", "6 On the page", "the scroll down the page", v601("06 On the page/2026-10-19_1840_page_scroll-path.mp4"), null],
      ["06F", "6 On the page", "from the header to Work", v601("06 On the page/2026-10-19_1841_page_header-nav-to-work.mp4"), null],
      ["06G", "6 On the page", "the edge: bench and page agree", still("06 On the page/2026-10-19_1559_page_t2-edge-bench.png"), 4],
      ["06H", "6 On the page", "the edge, on the page", still("06 On the page/2026-10-19_1559_page_t2-edge-page.png"), 4],
      ["07A", "7 Pass 3 light", "the studio drifting: the full cycle", v601("05 Pass 3 - Light/2026-10-19_1842_light_drift-full-cycle.mp4"), null],
      ["07B", "7 Pass 3 light", "the drift, close on a box", v601("05 Pass 3 - Light/2026-10-19_1842_light_drift-full-cycle-closeup-box.mp4"), 12],
      ["07C", "7 Pass 3 light", "the drift, close on a corner", v601("05 Pass 3 - Light/2026-10-19_1842_light_drift-full-cycle-closeup-corner.mp4"), 12],
      ["07D", "7 Pass 3 light", "the studio turned round the gold", v709("05 Pass 3 - Light/2026-10-29_1604_bench_studio-turning-gold_1080p30.mp4"), null],
      ["07E", "7 Pass 3 light", "the studio turned round the blue", v709("05 Pass 3 - Light/2026-10-29_1604_bench_studio-turning-blue_1080p30.mp4"), null],
      ["07F", "7 Pass 3 light", "the gold, turned in the light", v709("05 Pass 3 - Light/2026-10-29_1609_bench_orbit-gold_1080p30.mp4"), null],
      ["07G", "7 Pass 3 light", "the blue, turned in the light", v709("05 Pass 3 - Light/2026-10-29_1610_bench_orbit-blue_1080p30.mp4"), null],
      ["08A", "8 The end", "when the corners cannot draw, the text is still framed (services)", still("06 On the page/2026-10-19_1602_page_fallback-services.png"), 5],
      ["08B", "8 The end", "the fallback (work)", still("06 On the page/2026-10-19_1602_page_fallback-work.png"), 5],
      ["08C", "8 The end", "the finished boxes", still("06 On the page/2026-10-19_1559_page_t2-work.png"), 10],
    ],
    discussion: "01 Discussion/2026-10-19_discussion_screen-scroll.mp4",
    discussionK: "601",
  },
  "04": {
    dir: "04 Extruded lettering",
    title: "Extruded lettering",
    weights: { "1": 30, "2": 42, "3": 55, "4": 80, "5": 90, "6": 25, "7": 90, "8": 55, "9": 75 },
    cut: (D) => [
      ["01A", "1 The idea", "two viewports, a showcase; Your company, not invented names; our normal process", D(11), 30],
      ["02A", "2 Plan and review", "the plan and the Architect's review rounds, to ready for approval", D(40), 38],
      ["02B", "2 Plan and review", "APPROVAL: the plan, the files authorised", D(78), 5],
      ["03A", "3 Pass 1 mesh", "take 1 in clay", still("03 Pass 1 - Mesh/2026-10-22_1645_pass1-take1_front-clay.png"), 4],
      ["03B", "3 Pass 1 mesh", "take 1, turned", v601("03 Pass 1 - Mesh/2026-10-22_1646_pass1-take1_orbit-clay_1080p30.mp4"), null],
      ["03C", "3 Pass 1 mesh", "the mesh", still("03 Pass 1 - Mesh/2026-10-22_1645_pass1-take1_oblique-mesh.png"), 3],
      ["03D", "3 Pass 1 mesh", "zebra: surface continuity", still("03 Pass 1 - Mesh/2026-10-22_1646_pass1-take1_oblique-zebra.png"), 3],
      ["03E", "3 Pass 1 mesh", "the Y, close", still("03 Pass 1 - Mesh/2026-10-22_1646_pass1-take1_Y-close-normals.png"), 3],
      ["03F", "3 Pass 1 mesh", "new words, rebuilt as typed: the template", v601("03 Pass 1 - Mesh/2026-10-22_1646_pass1-take1_swap-words_1080p30.mp4"), null],
      ["03G", "3 Pass 1 mesh", "APPROVAL: a great start, the bevel looks good", D(150), 14],
      ["04A", "4 The arch", "the client: an established restaurant; the arch; do not copy", D(164), 34],
      ["04B", "4 The arch", "the inspiration: the form, not the look", still("00 References/2026-10-22_arch-form-reference.png"), 5],
      ["04C", "4 The arch", "the arch plan's review rounds", D(205), 17],
      ["04D", "4 The arch", "take 2: the straight word bent into the arch", v601("03 Pass 1 - Mesh/2026-10-22_1734_pass1-take2_bend-20-to-180_1080p30.mp4"), null],
      ["04E", "4 The arch", "take 2, the arch in clay", still("03 Pass 1 - Mesh/2026-10-22_1734_pass1-take2_front-clay.png"), 4],
      ["05A", "5 Takes 3 to 5", "capitals: the P threw it out", D(300), 12],
      ["05B", "5 Takes 3 to 5", "take 3: capitals, bent", v601("03 Pass 1 - Mesh/2026-10-22_1744_pass1-take3_bend-20-to-180_1080p30.mp4"), null],
      ["05C", "5 Takes 3 to 5", "take 3, capitals in clay", still("03 Pass 1 - Mesh/2026-10-22_1743_pass1-take3_front-clay.png"), 4],
      ["05D", "5 Takes 3 to 5", "the P should be centred; implied, not spelt out", D(330), 10],
      ["05E", "5 Takes 3 to 5", "take 4: equal steps", v601("03 Pass 1 - Mesh/2026-10-22_1751_pass1-take4_bend-20-to-180_1080p30.mp4"), null],
      ["05F", "5 Takes 3 to 5", "move the P a touch: one component", D(355), 13],
      ["05G", "5 Takes 3 to 5", "take 5: the P nudged, turned", v601("03 Pass 1 - Mesh/2026-10-22_1759_pass1-take5_orbit-clay_1080p30.mp4"), null],
      ["05H", "5 Takes 3 to 5", "APPROVAL: Thats got it, more balance", D(392), 12],
      ["06A", "6 Refined", "take 7", still("03 Pass 1 - Mesh/2026-10-23_1313_pass1-take7_front-clay.png"), 4],
      ["06B", "6 Refined", "faceted", still("03 Pass 1 - Mesh/2026-10-23_1328_pass1-take8_OC-close-zebra-faceted-crease0.png"), 3],
      ["06C", "6 Refined", "smoothed", still("03 Pass 1 - Mesh/2026-10-23_1328_pass1-take8_OC-close-zebra-creased10.png"), 3],
      ["06D", "6 Refined", "take 8, front", still("03 Pass 1 - Mesh/2026-10-23_1328_pass1-take8_front-clay.png"), 4],
      ["06E", "6 Refined", "take 8, oblique", still("03 Pass 1 - Mesh/2026-10-23_1328_pass1-take8_oblique-clay.png"), 3],
      ["07A", "7 Pass 2 brass", "the first brass", still("04 Pass 2 - Material/2026-10-23_1407_pass2-step1_brass-first-look_front.png"), 4],
      ["07B", "7 Pass 2 brass", "the brass, step 2", still("04 Pass 2 - Material/2026-10-23_1427_pass2-step2_front.png"), 3],
      ["07C", "7 Pass 2 brass", "the brushed face, close", still("04 Pass 2 - Material/2026-10-23_1434_pass2-step3_oblique-face-close-3x.png"), 3],
      ["07D", "7 Pass 2 brass", "the brass, turned", v601("04 Pass 2 - Material/2026-10-23_1439_pass2-step4-take1_orbit_1080p30.mp4"), null],
      ["07E", "7 Pass 2 brass", "the studio turning round the brass", v601("04 Pass 2 - Material/2026-10-23_1439_pass2-step4-take1_studio-turning_1080p30.mp4"), 20],
      ["07F", "7 Pass 2 brass", "the arch in brass, the studio turning", v601("04 Pass 2 - Material/2026-10-23_1526_pass2-arch-arch-take1_studio-turning.mp4"), 21],
      ["07G", "7 Pass 2 brass", "the arch, take 2", v601("04 Pass 2 - Material/2026-10-23_1539_pass2-arch-arch-take2-355_studio-turning.mp4"), 20],
      ["08A", "8 The page", "viewport 1, take 1", still("05 Page - Two viewports/2026-10-23_page-take1_viewport1-your-company.png"), 3],
      ["08B", "8 The page", "stage lamps", still("05 Page - Two viewports/2026-10-23_page-take2-stage-lamps_viewport1.png"), 3],
      ["08C", "8 The page", "front of house", still("05 Page - Two viewports/2026-10-23_page-take3-front-of-house_viewport1.png"), 3],
      ["08D", "8 The page", "from the wings", still("05 Page - Two viewports/2026-10-23_page-take4-wings-front0.5_viewport1.png"), 3],
      ["08E", "8 The page", "APPROVED: the page, both viewports", v601("05 Page - Two viewports/2026-10-26_page-APPROVED-R094_final-take_1080p30.mp4"), null],
      ["08F", "8 The page", "without 3D, the words still stand", still("05 Page - Two viewports/2026-10-23_page-take1_fallback-no-webgl.png"), 4],
      ["09A", "9 The camera", "the camera's journey: round, under the N, the pull-out", v601("06 Camera - The journey/2026-10-26_journey-take3-tilt-under-the-N_loop-1080p30.mp4"), null],
      ["09B", "9 The camera", "the camera bench: the move in the camera, then from outside", v601("07 Camera bench - Third person/2026-10-29_bench-third-person_take1_1080p30.mp4"), null],
    ],
    discussion: "01 Discussion/2026-10-22_discussion_screen-scroll.mp4",
    discussionK: "709",
  },
};

const film = FILMS[WHICH];
if (!film) throw new Error("usage: films-02-04-cut-build.mjs 02|04");
const FILM = join(ROOT, film.dir);
const OUT = join(FILM, "09 Cut - 10 min");
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
const D = (at) => ({ src: film.discussion, k: film.discussionK, at });
const CUT = film.cut(D);

const FPS = 30;
const IN = { "601": "in_color_matrix=bt601:in_range=tv:", "709": "in_color_matrix=bt709:in_range=tv:", still: "" };
const vf = (k) =>
  `scale=1920:1080:${IN[k]}out_color_matrix=bt709:out_range=tv:force_original_aspect_ratio=decrease:flags=lanczos,` +
  `pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=black,fps=${FPS},format=yuv422p,` +
  `setparams=color_primaries=bt709:color_trc=bt709:colorspace=bt709:range=tv`;
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48);
const probe = (f) => Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]).toString().trim());

const built = [];
for (const [id, stage, note, s, secs] of CUT) {
  const name = `${id}_${slug(note)}.mov`;
  const out = join(OUT, name);
  const src = join(FILM, s.src);
  const args = ["-hide_banner", "-loglevel", "error", "-y"];
  if (s.k === "still") args.push("-loop", "1", "-framerate", String(FPS), "-t", String(secs), "-i", src);
  else { args.push("-ss", String(s.at), "-i", src); if (secs !== null) args.push("-t", String(secs)); }
  args.push("-an", "-vf", vf(s.k), "-r", String(FPS), "-c:v", "dnxhd", "-profile:v", "dnxhr_hq", out);
  execFileSync("ffmpeg", args);
  const frames = Math.round(probe(out) * FPS);
  built.push({ id, stage, note, name, out, frames });
  console.log(`${id}  ${(frames / FPS).toFixed(1).padStart(6)} s  ${stage.padEnd(20)} ${note}`);
}

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const fileUrl = (p) => "file:///" + p.replace(/\\/g, "/").split("/").map(encodeURIComponent).join("/").replace(/^([A-Za-z])%3A/, "$1:");
let offset = 0, lastStage = "";
const assets = built.map((c, i) => `    <asset id="a${i + 1}" name="${esc(c.name)}" src="${fileUrl(c.out)}" start="0s" duration="${c.frames}/30s" hasVideo="1" format="r1"/>`).join("\n");
const clips = built.map((c, i) => {
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
    <event name="${esc(film.title)} - 10 min cut">
      <project name="${esc(film.title)} - 10 min cut">
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
const tc = (f) => [Math.floor(f / 108000), Math.floor(f / 1800) % 60, Math.floor(f / 30) % 60, f % 30].map((v) => String(v).padStart(2, "0")).join(":");
let rec = 0;
const ev = built.map((c, i) => {
  const line = `${String(i + 1).padStart(3, "0")}  AX       V     C        ${tc(0)} ${tc(c.frames)} ${tc(108000 + rec)} ${tc(108000 + rec + c.frames)}\n* FROM CLIP NAME: ${c.name}\n* COMMENT: ${c.id} | ${c.stage} | ${c.note}\n`;
  rec += c.frames;
  return line;
}).join("\n");
writeFileSync(join(FILM, "cut10.edl"), `TITLE: ${film.title} - 10 min cut\nFCM: NON-DROP FRAME\n\n${ev}`);
const per = {};
for (const c of built) { const k = c.stage.split(" ")[0]; per[k] = (per[k] ?? 0) + c.frames / FPS; }
for (const [k, w] of Object.entries(film.weights)) console.log(`stage ${k.padStart(2)}: ${(per[k] ?? 0).toFixed(1).padStart(5)} s (planned ${w})`);
console.log(`${built.length} segments, ${(offset / FPS / 60).toFixed(2)} min → ${film.dir}/09 Cut - 10 min/, cut10.fcpxml, cut10.edl`);
