# Session Handoff — 16 November 2026 (Monday), session 3. THE TEMPERATURE APPROVED; THE WET DIALS; THE STEAM's LOCAL HEAT; THE CAMERA's PRINCIPLES; THE FLOOR NEXT

⛔ **READ THIS FIRST, THEN `project-intelligence/` AS NORMAL.** It replaces every earlier handoff. Delete it at the end of
the session that reads it, once its replacement is written.

**The record:** D-101 in `decisions.md`, from *"⛔ THE TEMPERATURE MODEL — THE STRUCTURAL NOTE (16 November 2026, session 3)"*
to the end: every beat, with Carl's words. The camera's principles are numbered 1–18 at the end of
`live-work/hero-camera-direction-14-november/camera-direction-note.md`. Session ended on Carl's word: *"ok. write a handoff
and commit and push."*

## ⛔ NEXT SESSION — WHAT IS OPEN

1. **⛔ FIRST: THE FLOOR** (Carl: *"in tomorrows session we will look at the floor ... first thing"*; *"coz its substantial
   we will consult the architect"*). **The brief:** from `webgpu_lights_projector` ONLY the PULSING PATTERN on the floor — NO
   statue, NO rotation; it EMANATES OUT FROM THE LOGO's CENTRE; NO square edge — a roughly CIRCULAR GRADIENT; HOT, then COLD
   (red with the heat, blue as it cools). It replaces the grid. **Route:** homework first (the reference
   `Videos\C2B Films\03 The hero\00 References\projector-floor-8-november.mp4` and the example's source at r185 — fetch
   `raw.githubusercontent.com/mrdoob/three.js/r185/examples/webgpu_lights_projector.html`), then a structural note / plan for
   the Architect VIA CARL (plan-review gate), BEFORE any build. ⚠ Check it with and without the logo drawn before it — this
   GPU draws a later object differently after a large draw (session 2). The floor can read the logo's TEMPERATURE field
   (`hero-heat.ts`) for hot → cold.
2. **The steam — Carl's to judge now** (ruling 3: local heat first, then these): the thin fringe on the top edges (~0.4 s);
   the hang (fades by ~4.2 s); the softness close up (2.5 cm cells). Take: `03 The hero\2026-11-16_steam_take2_local-heat.mp4`.
3. **Asked, not answered:** (a) the camera bench's tool for plotted moves (marking poses from the pad, a PARABOLA through
   three points, start/end TIMES not pace, a ZOOM over the move) — built ahead of the storyboard or with it? (b) a STORYBOARD
   FORM (a panel per shot: from pose + SMPTE, move, to pose + SMPTE, duration, what it shows) — wanted?
4. **The code drops — ruled, not built:** in the rain's LAST BAND (~170 drops in the air as the last starts down,
   `00:00:31:10`), ~3 CHOSEN ONES, ALL landing on the logo, AUTHORED (spots on the top edges, release times, staggered turning
   heights); once code, always code; no slow motion; glyphs sized in the WORLD; the camera then NOT at Home; Cam 2 candidate
   to the SIDE, looking ALONG the logo's edge. Open: a code drop's landing (Builder: no splash).
5. **Phase 3:** the cloth MOVES through space (its pins the hand, an authored path) and the logo JUMPS to meet it (CHOSEN —
   no propulsion, it jumps because it is wet; dry it is C-3PO gold); the camera may hide part of the drying once the
   behaviour is established (continuity on return). **After the cloth: TBD — Carl's** (*"ive got a few days"*).
6. **Gandalf's fireworks:** the pointer emits the letters c, 2, b (small, growing) for 2 s once the logo is gold; the c2b
   break-apart REJECTED. Open (Carl's): each letter's life; a still or absent pointer (touch); colour (family default).
7. **Flags, not chased:** the console warning *"Draw with a vertex count of 0"* (every run, with or without the temperature);
   side on, the emission's dissolve chunks show as SQUARE blocks (a possible glitch up close); the one-off pink tint (session 2).

## ⛔ STANDING — CARL's

- **A FIX MUST NOT CHANGE THE STORY** (memory). **SOMETHING IS ALWAYS MOVING.** Best first; fall back only if measured.
- **THE SCOPE STAYS OPEN** (no lock asked): `components/hero/hero-scene.ts`, `hero-bench.tsx`, `hero-rain.ts`,
  `hero-steam.ts`, `hero-maps.worker.ts`, **`hero-heat.ts` (new today, Carl: *"Authorised to create and use"*)**,
  `components/showcase/arch-idea.tsx`, `bench-ideas.ts`, `bench-builder-take.ts` (`chunk-scope.json`: `_heroHeat16Nov` and
  the earlier keys). The camera bench's files are LOCKED. Any other file: name it and ask.
- **THE DIRECTION (camera note 1–18):** the scene finished from Home first, then STORYBOARDED; ⛔ **SHOT 1 IS HOME, SET IN
  STONE**; ⛔ **NO CUT OUT OF HOME** — the first change is a MOVE, from rest, eased; **CLAIR DE LUNE**, not Beethoven's 5th;
  each shot = where, when, how it moves, how long, AND the next mark and its time; amongst the asset, not a voyeur; speed
  ramps and slow motion sparingly (slow motion PROVEN possible: the dance identical at quarter speed); the first plotted move
  UNDER THE DANCING BLOBS (all ten out `00:00:07:02` – `00:00:17:01`; the lowest always 10–46 cm up — the path threads
  between); OBLIQUE is the logo's best light (Carl's 30° orbit, take 2, the reference: `2026-11-16_orbit-30_left_take2.mp4`).
- **THE CLOCK (delegated, decided):** SMPTE, 30 fps non-drop, ZERO AT THE LEAN; the opening a variable pre-roll; the event
  list PRINTED FROM THE SCENE, never typed; the benches' clocks to SMPTE in the same chunk.

## WHERE IT STANDS — on `/proto/hero`

1. **THE TEMPERATURE (R-107, APPROVED, `d07bfa0`):** `hero-heat.ts` — a coldness field on the ink's grid (405 × 212), GPU,
   1/120 s sub-steps on the story's clock: air 0.04/s, wet 1.2/s, conduction 1 cm²/s; colour, roughness, reflection and ACES
   follow it; the wet coat stays on the WATER. The Heat folder (switch = an A/B). Last red ~33 s. The mauve band SETTLED.
2. **THE WET DIALS** (`a4b08f8`): the Wet folder, `WET`'s eight values live. The wet coat's lightness SETTLED (stays lighter).
3. **THE STEAM × THE LOCAL HEAT** (`a4b08f8`): each emitter reads the heat under it (`heatCellsFor`; 240/240); its own switch
   (Steam folder, "local heat"); 1–3% less steam (the burst ends before the edges cool).

**NULL CONTROL:** `node project-intelligence/live-work/scripts/hero-logo-state-stills-13-november.mjs <out> 26.2 <ref>`
(references in the session scratchpad are gone — make new ones first; the Home lean varies ~37 levels run to run, its floor).
⚠ Mid-rain stills never match pixel for pixel: the rain is RANDOM each run (a fresh seed every frame).

## SCRIPTS (all `live-work/scripts/`, today)

`hero-heat-wash` (red pixels by time, Home; on/off), `hero-heat-film` (the wash filmed, Home + close),
`hero-steam-local-heat` (steam grey pixels by steam time, close; on/off), `hero-orbit-take` (Carl's orbit: pose, axis,
degrees, seconds).

## STATE

- **COMMITTED AND PUSHED** at Carl's word (see `git log`): tsc clean; lint at the baseline (the one accepted error, 0
  warnings); a clean-checkout build before each push.
- **The screen capture STOPPED** (`01 Discussion\2026-11-16_s3_discussion_screen.remux.mkv`, 1:18:51; raw kept).
- **The dev server is UP** (port 3000).

## LESSONS

- **An idea Carl DEVELOPS is CHOSEN** (`context-rules.md`, the brainstorm rule): the Builder recorded the cloth jump as
  "being developed" and asked; Carl: *"it should of been noted already."*
- **An 8-bit ink of 1 (not 255) reads 1/255 on the GPU** — a `> 0.5` test found no ink; the logo stayed red. Measure first.
- **`hero-steam.ts` has CRLF line endings:** shell string-matching edits fail on it; use the editor.
- **One switch, one variable:** the steam's local heat first rode the Heat switch; separated.
- **Credit the right seat:** the linked-particles slider film was the Builder's, not Carl's.

---

*Written 16 November 2026, session 3.*
