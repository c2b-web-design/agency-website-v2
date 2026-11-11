# Session Handoff — 11 November 2026 (Wednesday), session 1. THE HERO's OWN BENCH: `/proto/hero`

⛔ **READ THIS FIRST, THEN `project-intelligence/` AS NORMAL.** It replaces every earlier handoff. Delete it at the end of
the session that reads it, once its replacement is written.

**The record:** D-101 in `decisions.md`, from *"CARL: THE HERO IS BUILT ON THE MARCHING BENCH (11 November 2026"* to the
end — every beat with Carl's words. ⚠ Read the LAST TEN entries first.

## ⛔ WHERE IT STANDS

1. **The camera bench is NOT the hero's bench** (Carl: *"we will not use the camera bench. We will use the marching
   cubes."*). Its liquid work (route B) is a SOURCE only. ⚠ Still open: whether route B's code there is REMOVED
   (`LIQUID_ON = true`, `components/showcase/hero-idea.tsx:19`) — asked twice, not answered; nothing deleted.
2. **THE NEW BENCH `/proto/hero`** (note `live-work/structural-note-hero-bench-11-november.md` v1.3; two Architect reviews
   saved beside it; Carl's three decisions given). Files: `app/proto/hero/page.tsx`, `components/hero/hero-scene.ts` (what
   SHIPS: no panel, meter, overlay or orbit controls), `components/hero/hero-bench.tsx` (the bench's tools). WebGPU.
   `/proto/marching` stays the UNTOUCHED reference (only four stale comments corrected).
3. **What is on it now:**
   - **HOME** (code `HOME`): square on, 0, −49.2, 2566.2, target 0, 0, 0, 45° (Carl re-tracked it from the first, oblique
     Home). The camera is remembered per browser; the Home button / pad VIEW return. Panel → Camera: readout + Copy.
   - **THE FLOOR** `FLOOR_Y = −437.5`: the two y tips of the subtext's bottom line ("you", "eyes") touch it, the text at
     the BLOBS' depth (z 0) — Carl: *"the blobs are next to the text. not in the foreground or background."* A bench grid
     (100-unit squares, a dial).
   - **THE TEXT BAKED IN 3D** — the sketch bench's `heroTextLayout` carried by one similarity so at Home it lands on the
     page text (checked). **THE SCALE: 1 cm = 4.411 units** (`hero.unitsPerCm`). In the **EDGE-LIT ICE ACRYLIC**
     (`heroTextMaterial`); no bloom yet. The page-text overlay OFF by default (a check at Home).
   - **FLYING**: the camera bench's own controller (`camera-pad.ts`, unchanged): Carl's pad mapping + W S A D E Q, arrows,
     [ ], Shift / Alt; walking pace in the text's metres. Carl flew it.
   - **MSAA ON** (*"looks a lot better"*); its GPU cost on weak devices UNMEASURED (D-108).
   - **THE ORANGE LIGHT BELONGS TO THE BLOBS** (Carl's idea): off with no liquid (the text pure ice), on while it is out.
     ✔ Carl: it is to FADE with how much liquid is out — build it with the cascade. Now it follows the blobs switch.
   - **OUR ENVIRONMENT MAP** (Carl: *"this is our env map"*; *"Wow"*): GPT's night courtyard with the GOLD c2b EMBLEM in
     it, `public/hero-bench/courtyard-emblem.jpg` (2:1, 415 KB, edges join); the blobs reflect the mark, distorted; the dark
     sky melts the blobs' tops into the background and the arches give an AMBER RIM. The castle is a switch.
   - Blobs ON by default; the field's own floor plane OFF.
4. **THE LOGO's FIRST LEAN WAS REMOVED** (Carl: *"we have gone about this in the wrong order"* — the page text was on the
   screen, the logo in the world). The text is now in the world; **the lean (R-103: 2 m, 12.5°, on its end, c on the
   floor, b against the t) is NEXT**, on the 3D t, from the glyph's geometry.
5. **The blobs' choreography is DEFERRED** (Carl). Known: the example's paths wander ±378 units in depth (~4 squares) and
   fall to −700, below the floor (seen THROUGH the grid ~10 squares forward — Carl confirmed by flying).

## NEXT — in Carl's order

1. **The logo leaning on the 3D "t"** (mesh first; its material from the liquid's `shiny`), in the same world. The scale
   is the text's (2 m = 882 units).
2. Then the lights (the example's white directional 3 + grey ambient: Carl stopped Neutral tone mapping as a fix and had
   the orange light tied to the blobs instead — any tone-mapping change is HIS call), the bloom layer, the cascade.

## OPEN FOR CARL (not answered)

- Route B's code on the camera bench: retire it or leave it.
- A solid floor under the grid, or the blobs raised onto the floor, or a depth dial: offered, deferred with the
  choreography.

## STATE

- **COMMITTED AND PUSHED this session** (Carl: *"write a handoff, commit amd push and stop the capture"*) — see the git log.
  tsc clean; lint the one accepted error, 0 warnings.
- **The dev server is RUNNING** (port 3000). **The screen capture is STOPPED**: `Videos\C2B Films\03 The hero\01
  Discussion\2026-11-11_discussion_screen.mkv` (3:32:37, remuxed after the stop, all 372,577 frames; the raw duplicate
  removed on Carl's earlier word).
- **Film:** `Videos\C2B Films\03 The hero\2026-11-11_courtyard-env_blobs.mp4` — 30 s, 1080p30 CFR, frame-stepped (chrome,
  shiny, liquid; the Builder's camera path). Carl's GPT images are in `03 The hero\` (the courtyard; the emblem).
- **Scope:** the hero's phase-1 exception holds; this session added `_heroBench11Nov` (the three bench files) and
  `_heroEnvMap11Nov` (the env map) to `chunk-scope.json`.
- **Measurement scripts** (`live-work/scripts/`, 11-november): the step-1 check, the floor from the y tips, the ink from
  the page's pixels (takes a fixed floor as its 2nd argument), the baked-text check, the env check, the film.

## LESSONS

- **Bring the outside element's world in first, then everything into ONE world.** A lean measured against page text that
  lives on the screen held at one view only. Carl saw it.
- **Fly to settle a geometry argument.** "Ten squares in front" was a blob seen through a floor made of lines.
- **Read the page's own pixels, not a re-drawn glyph** — font metrics are rounded at small sizes.
- **Carl's "it could be a job for AI" became the best look of the day** — report a limit plainly (the mark in the map),
  then follow his reason (the blobs distort it).

---

*Written 11 November 2026, session 1.*
