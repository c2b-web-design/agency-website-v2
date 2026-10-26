# Session Handoff — 26 October 2026 (session 2, written at 39% before compaction). THE CAMERA BENCH IS NOW A RECORDER (R1 BUILT).

⛔ **READ THIS FIRST, THEN `project-intelligence/` AS NORMAL.** Written MID-SESSION because Carl flagged compaction (39%).
**Delete it at the end of the session that reads it, once its replacement is written.** Replaces the earlier session-2
handoff (the camera bench chunk 1, the pad not yet connecting).

---

## ⛔ WHERE THINGS STAND

**R1, THE RECORDER — BUILT, SEEN BY CARL WATCHING THE TESTS:** *"It looks fantastic. ive been watching you test it and
understand it just needs a polish."* ⚠ A verdict on the LOOK, by watching the harness — **NOT an approval, and Carl has
NOT flown it on the pad yet.** Record it at that level (D-104 has it).

`/proto/camera`: record / stop in clips (A), the Recorded lane + playhead + inspector, punch-in (scrub → OVERWRITE → A;
the clip cut, later clips KEPT), New camera (Cam 2 → a CUT), select + Delete (renumbers), play the selection or the chain,
To the end, View = default, "?" controls / "i" scene drawers, the transport bar bottom left. Pad: left stick walks
(1.4 m/s, forward / back only), right stick x TRUCKS (slides) and y tilts, **LB / RB TURN** (75°/s), RT / LT up / down,
D-pad up / down lens, left / right step clips. Keyboard twin in the "?" drawer.

**Records:** D-104 (long; read its tail from "CARL ON THE PAD"); the approved note
`live-work/structural-note-camera-recorder-26-october.md` v2.2; the approved plan `live-work/plan-camera-recorder-r1-26-october.md`
v2.3; the Architect's five reviews TRANSCRIBED BY THE BUILDER in `live-work/architect-plan-response.md` (the Architect's window
is the authority). Checks: `live-work/scripts/bench-chain-check-26-october.mjs` **17/17** (Node runs `bench-chain.ts` directly)
and `live-work/scripts/camera-bench-verify-26-october.mjs` **52/52** (dev server running). tsc clean; lint 1 error 0 warnings.

**⛔ LOCKED AND TESTED:** all six R1 files out of `chunk-scope.json` and probed (all denied): `camera-bench.tsx`,
`camera-pad.ts`, `bench-chain.ts`, `bench-transport.tsx`, `bench-timeline.tsx`, `app/proto/camera/page.tsx`. **The polish
needs Carl to name them again.**

## WHAT CARL DECIDED THIS SESSION (all in D-104, in his words)

- The pad works over **Bluetooth** (USB cable carried no data). His camera's frame of reference: he reads what the ARCH does.
- **Scale: 1 layout px = 1 cm** (Unreal's unit). The arch 6.90 × 8.58 × 0.32 m; opening 4.68 × 5.86 m; start 22.71 m out,
  4.29 m up. **Floor grid** 1 m squares, all one weight, visible from 21 m+; **10 cm subdivision** round the FOCUS OBJECT (the
  C) within 3 m, only the squares it stands in and beside; lines by colour (metre grey, 10 cm dim blue, the face RED x, the
  centre line BLUE z) — *"That looks great, also the addition of 'ground zero' 0.0.0"*.
- **Left stick forward/back only at walking pace; right stick x = truck** (*"i need it to move physically l and r"*);
  **turning on LB / RB** (speed modifiers off the bumpers; Shift / Alt on the keyboard).
- **Principles** (Builder's draft, PROPOSED, never formally amended): the pad performs PATH and FRAMING, not timing; timing
  set afterwards by number; speeds for control; work inside a system (scale, grid, views, numbers).
- **THE REDESIGN (his):** record / stop in CHUNKS (*"im never going to make a complete pass"*); chunks = DAW CLIPS; framing
  between chunks allowed; OVERWRITE arm before a punch-in (on screen only); later chunks kept, the Builder COMPENSATES joins
  by judgement; cuts via New camera; delete by selection; sequential numbering; TWO LANES (Recorded / Refined) with
  **COMPING** (each switch a cut or a crossfade); the major buttons on the picture bottom left; **the UI delegated to the
  Builder** (*"clean ... professional looking and intuitive"*).
- **Procedural moves** wanted (*"i would rather predetermine ... circle it but climb in a spiral"*) — a helix etc., stored as
  the shape and its numbers (Builder recommends; structural, for the Architect). The **lock-on / orbit** agreed in principle
  (Architect + Builder). Order of these after R2: Carl's.
- Hero context: the logo will lean against a **brick wall and pier** (bricks = the scale reference; shallow depth of field).

## ⛔ NEXT SESSION — Carl: *"We will tweak the tool next session and test it."*

1. **Carl flies R1 on the pad; the POLISH** (the six files need naming again — locked).
2. **THE A/B-ROLL REDESIGN — Carl's, decided after R1 (D-104, tail):** a TRACK PER CAMERA (Cam 1 the A-roll, Cam 2
   above), clips PLACED AT TIMES (gaps marked), the UPPER track takes PRECEDENCE (Resolve's A / B roll: *"putting the
   playhead where you need it for a 2nd camera thats takes precedence"*); recording = the playhead placed, the track ARMED,
   A; a **PICTURE-IN-PICTURE** of the A-roll while recording the B-roll; a B-roll may run past the A-roll; each track
   EXPANDABLE into TAKE LANES (Logic's take folders), COMPING inside a track, the Builder's Refined versions as take lanes;
   **OVERWRITE NON-DESTRUCTIVE** (*"Non destructive is always better"* — a punch-in is a new take). ⛔ A NEW MODEL: write the
   note amendment (v3 of `structural-note-camera-recorder-26-october.md`) for the Architect, then a plan, before building.
   Order against the polish and item 3: Carl's.

## ⛔ OPEN — with owners

- **Carl:** fly R1 on the pad; say what the POLISH is. Answered at hand-over: "New camera" = a second camera IN THE EDIT
  (the next clip is labelled Cam 2, the join a cut; at R2 each Cam becomes its own camera track); ONE bench camera flies them
  all — two cameras recording at once is NOT built.
- **Item 3, sensitivity (Builder found, for Carl):** ⚠ the camera can pass THROUGH THE FLOOR; the triggers still rise / sink at
  the OLD ≈ 7 m/s (0.3 d/s); the turn 75°/s on on/off bumpers (called too fast); the lens rate. Needs a chunk.
- **R2 (next chunk, needs a plan + gate):** the download, the Builder's import + fitting + join compensation, "Open" (READ
  path), the Refined lane, comping.
- **Builder-raised, unscheduled:** the gimbal question for move 1 (look up → along → down; quaternions / look-along-path /
  look-at); the views (Fusion flat views vs a third-person chase + picture-in-picture — Carl raised the PiP); the filmback
  preset (Carl's Unreal filmback; 36 mm default labelled); the focus trigger on ZOOM (share of frame) vs distance only — the
  Builder recommended frame share, Carl not yet chosen.
- **Carried:** the film 4 EDIT (Carl: after the Architect work); the hero (D-101) after the bench; Send; mastering (D-094);
  `structural-note-viewer-on-about-21-october.md` to amend (Builder); `neon-bloom.tsx` re-arm; `about-card-glass.ts:491`
  anisotropy comment untrue (flag).

## STANDING / LESSONS (this session)

- **Plan-review gate in practice:** Carl REJECTS `ExitPlanMode` while routing each review; he approves in TEXT ("Approved and
  proceed"), then the dialog goes through. Don't re-offer it after each review — fold the review in and say it's ready.
- **Floating-point edges:** a clip's length is a sum of sixtieths — a "boundary" lands 2e-15 s off. Use `EDGE_S` (1 µs).
- **The harness reads `window.__cameraBench`, published every 0.1 s** — wait ≥ 250 ms after an action before reading.
- **`npm run lint` lints `live-work/scripts/` too** — a script's unused var is a WARNING against the zero baseline.
- **JSX loses the space** when text after `{…}` runs to a line's end — put the unit in the formatter (`metres()`).
- Carl reads moves in DAW / Resolve / Fusion / Unreal / GTA terms; explain controls that way.
- Dev server STOPPED at hand-over (PID 24760 killed by tree; port 3000 checked free). `npm run dev` to start; the harness
  needs it running.

## ⚠ NOT COMMITTED (on disk, safe — commit on Carl's word)

`components/showcase/`: `lettering-piece.tsx`, `shot-format.ts`, `camera-pad.ts`, `camera-bench.tsx`, `bench-chain.ts`,
`bench-transport.tsx`, `bench-timeline.tsx`; `your-words-canvas.tsx` (the lift); `app/proto/camera/page.tsx`;
`app/proto/your-words/page.tsx` (comment); `decisions.md`, `current-sprint.md`, `architect-role.md`. Force-add (gitignored
live-work): this handoff, `architect-plan-response.md` (tracked), the two notes, the R1 plan, the scripts
(`film04-lift-compare`, `camera-bench-verify`, `bench-chain-check`). ⛔ A CLEAN-CHECKOUT BUILD before pushing (new files).

---

*Written 26 October 2026, session 2, at 39% before compaction. Replaces the earlier session-2 handoff.*
