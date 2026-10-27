# Structural note: THE CAMERA BENCH REDESIGNED AS A RECORDER (record / stop, chunks as clips, punch-in), 26 October 2026, VERSION 3.1

**For:** Carl, to route to the Architect. **Status:** **v3.1 PROPOSED, nothing of it built; Carl's five answers folded in
(27 October, "Carl's answers" at the end of the v3 section); the Architect's review of v3 (C1–C11) folded in as v3.1,
transcribed by the Builder in `live-work/architect-plan-response-camera-tracks-27-october.md`.** Its three points for
Carl (C3, C8, C11) ANSWERED, 27 October: Overwrite retired, a run-on covers as a new take, a selection plays solo, T1
split into T1a / T1b; and D5 (the v1 copy kept until Carl says otherwise). The Architect's check of the fold-in (D1–D5)
folded in. All of Carl's words: "Carl's answers", answers 1–10. v2.2 (below the v3 section)
was APPROVED and is BUILT as R1 (D-104); it stays as the record of what R1 is. The DESIGN is Carl's; this note is the
Builder's account of what it changes structurally, the alternatives, and what the current bench provides that must
survive (CLAUDE.md §5b). It amends `structural-note-camera-bench-26-october.md` (v3).

---

## ⛔ (v3, 27 October 2026) A TRACK PER CAMERA — RESOLVE's A / B ROLL. PROPOSED

### Carl's design, in his words

- 26 October, after R1: *"Yes, thats the way Resolve works with A and B roll. Filming a sequence and then putting the
  playhead where you need it for a 2nd camera thats takes precedence makes editing a lot easier."* / *"1. a pic in pic
  would be a nice and useful touch. 2. yes, Resolve works in this way. As long as theres an image there."* / *"Are the
  take lanes expandable. Do comped takes live within the same 'track'?"* / *"Non destructive is always better."*
- 27 October, having flown R1: *"The option to add another camera(s). This puts Cam2 in the same take lane. We should
  have the functionaliry line in Davinci Resolve and put it in its own take lane and be movable. Say we make a sequence
  with 8 clips. If we put the playhead where we want it, select another camera and record Cam 2 takes precedent over Cam 1.
  Which means cuts can be made easier and Cam 1 is non destructive."*

**Words, for Carl to correct.** A **TRACK** is one camera's row (Resolve's V1, V2). A **TAKE LANE** is one recording pass
inside a track (Logic's take folder), shown when the track is expanded. Carl's "its own take lane" for Cam 2 is read as
**its own track**.

### What R1 does that this replaces

R1 is ONE LANE, clips END TO END (`bench-chain.ts`: a clip's time is the sum of the lengths before it). "New camera" only
LABELS the next clip Cam 2, so Cam 2 lands in Cam 1's lane, after it. The punch-in CUTS the clip under the playhead and
DISCARDS its tail; later clips SHIFT in time by the difference. Both are what Carl is asking to change.

### Behaviour (the Builder's reading)

| | |
|---|---|
| **Tracks** | One per camera, Cam 1 at the bottom, each new camera ADDED ABOVE (Resolve's order). A track exists before it has a clip, so it can be armed |
| **Clips at times** | A clip has its own START time on the shot's clock. Nothing ripples: recording, moving or deleting one clip never moves another (Resolve's overwrite edit, not a ripple) |
| **⛔ PRECEDENCE** | At any moment, the HIGHEST track with a clip there plays. Cam 2 over Cam 1, Cam 3 over both. Every change of playing track is a CUT. Cam 1's clips underneath are untouched: delete or trim the Cam 2 clip and Cam 1 is seen again (Carl: *"Cam 1 is non destructive"*) |
| **Recording** | Arm a track (its header, as a DAW's record-arm), put the playhead, fly to frame, **A**. The take lands on the ARMED track at the PLAYHEAD and may run past every other clip (Carl: *"2. yes"*). The camera is still the ONE bench camera; a track is a label on the clips it holds |
| **Same track, over a clip: a NEW TAKE** | Recording where the armed track already has a clip makes a NEW TAKE ON TOP of it; the old one is KEPT underneath. Inside a track the NEWEST take covering a moment plays (Logic's default comp), and the old take plays again where the new one ends. ⛔ Not R1's punch-in: nothing is cut or discarded. **(v3.1) OVERWRITE IS RETIRED** (Carl, [C3]: *"Drop it (Recommended)"*): A on the armed track ALWAYS records at the playhead, and a recording that RUNS ON into a clip covers it as a new take (Carl: *"Cover it, as a new take (Recommended)"*) |
| **Expandable** **(v3.1, [C4])** | A track collapses to one row (what it plays) or expands into its TAKE LANES: **ONE LANE PER RECORDING PASS** (each clip its own lane, by `order`, the newest on top), as Logic's take folder (Carl: *"Are the take lanes expandable"*). ⛔ NOT packed (v3 said both; packing would put takes that do not overlap on one lane). Still a VIEW of `order`; no separate "take" record |
| **⛔ MOVABLE** | Drag a clip along its track to change its start. **Snapping** to the playhead and to every clip edge on any track (Resolve's snap), the Builder's default |
| **Gaps** | A moment with NO clip on any track is MARKED on the timeline. Playback through a gap HOLDS the last picture and the status says "gap" (the Builder's reading of *"As long as theres an image there"*; Carl's answer 4). **(v3.1, [C6]) No picture before T → the first one AFTER T.** The hand-off reports gaps; it does not invent a picture |
| **Joins** **(v3.1, [C2])** | A JOIN is any moment where `sourceAt` CHANGES what plays, never "two neighbouring clips". Three kinds: **between tracks**, a CUT; **inside a track, a new take's START and END over an older take** (the old one is left mid-move and resumes mid-move: the commonest joins in the take model); **inside a track, two clips that touch**. The last two are MISMATCHES (distance, angle), shown on the timeline as R1 shows them, and compensated by the Builder at hand-off |
| **Numbering** | Per track, in time order: "Cam 2 · 3". Renumbered after a move or a delete (Carl: *"sequential"*) |
| **Selection, Delete, Play** | As R1, across tracks. Play with nothing selected plays the shot WITH PRECEDENCE; **(v3.1, [C8]) a selection plays SOLO** (what was selected, even where a higher track covers it, as a clip opened in Resolve's SOURCE VIEWER; the timeline, nothing selected, plays the edit. Carl: *"The clip solo (Recommended)"*). ⚠ *Corrected by the Architect, 27 October [D1]: Resolve has no solo-on-select; its timeline always plays the edit* |
| **To the end / step** | The end is the latest clip end on any track; `,` `.` step between every clip edge on every track (the edit points) |

### ⛔ The structural decisions (§5a)

**v3-1. The data: clips PLACED IN TIME, in a flat list, plus the list of tracks.** A clip becomes
`{ id, cam, start, order, samples }`: `start` its place on the shot's clock, `order` its recording order (the take
precedence inside a track). **With trim (Carl's answer 1): plus `in` / `out`**, the span of its samples it shows. The timeline holds `tracks` (camera numbers, bottom to top) so an empty, armed track exists.
- **Rejected: nested tracks → takes → clips.** A take is a view (the lanes are a view of `order`, [C4]), so storing it
  would be a second source of truth for what overlaps what.
- **Rejected: keep R1's end-to-end chain and add a track field.** Precedence needs clips that OVERLAP in time; an
  end-to-end list cannot hold two clips at the same moment.

**v3-2. One rule decides what plays:** top track first; inside it, the highest `order` covering T; none = a gap. ONE pure
function (`sourceAt`) in `bench-chain.ts`, Node-checked as now. Playback, the PiP, the cut list for the hand-off and the
timeline's "what plays" row all read it, never their own copy.

**v3-3. The version moves: `CHAIN_VERSION` 2, and R1's chains are MIGRATED, not refused.** A v1 reader would misread v2
(the [A2] rule for moving it). The bench reads v1 by laying its clips end to end at their summed starts, each on its
camera's track, `order` = its index: **R1 takes play exactly as before** (proven by number, [C5]). The v1 key is read once
and the v2 key written. ⛔ **(v3.1, [D5]) THE v1 COPY STAYS UNTIL CARL SAYS OTHERWISE** (Carl: *"Only when I say so
(Recommended)"*, answer 10): it holds his pad flights, and until R2's download exists it is the only way back from a
migration fault the parity check missed. The bench NEVER removes it on its own; the doubling is accepted (C7 counts it).

**v3-4. Trim, the Builder's recommendation for Carl.** *"Cuts can be made easier"* is, in Resolve, dragging a clip's EDGE
as well as the clip: shorten Cam 2's clip and the cut to Cam 1 comes earlier. That needs a clip to show PART of its
samples: `in` and `out` over the samples, the samples never cut (non-destructive). **Without trim, a cut can only be moved
by moving the whole clip.** ANSWERED: in T1 (Carl's answer 1), built in T1b; the data carries `in` / `out` from T1a.

**v3-5. The PICTURE-IN-PICTURE: a second three.js CAMERA in the ONE canvas, drawn by SCISSOR.** While recording a higher
track, a small inset shows what the tracks BELOW play at the same moment (the A-roll under the B-roll), so Carl can time
his cut. The inset's camera is posed by `sourceAt` below the armed track; the scene draws twice that frame, the second time
into a scissored corner.
- **Rejected: a second canvas.** A second WebGL context: the warm-up canvas and the Next step button (CLAUDE.md §5a).
- **Rejected: render to a texture shown in the HUD.** The same second draw plus a render target and a copy; it only
  helps if the inset must sit over HTML, and it does not.
- ⚠ **Cost: the scene drawn twice while recording a B-roll**, at roughly 1/9 of the pixels for the inset (a third of
  the width), so most of the cost is the second pass over the geometry. Measured before it is called fine.
- ⚠ **This is a SECOND three.js camera.** It is a playback camera with no rig and no input. Still ONE rig and ONE flown
  camera. Named here because "why is there a second camera?" is the §5a test.

**v3-6. Arming on the pad (Carl's call).** Arming is on the track header. The pad's free buttons are Start and the two
stick clicks. **The Builder recommends Start cycles the armed track**, so a B-roll can be set up without the mouse.

### §5b: what R1 provides, and what happens to each

| R1 provides | Fate |
|---|---|
| Clip time = the sum of the lengths before it (`clipStarts`, `locate`) | **Replaced** by each clip's `start`; `locate` becomes `sourceAt` (v3-2) |
| The punch-in cuts the clip under T and DISCARDS its tail; later clips SHIFT | **Replaced**: a new take on top, nothing cut, nothing shifts. ⚠ A real change Carl will feel: a long punch-in over clip 3 now COVERS clips 4 and 5 on that track where it once pushed them later |
| "New camera" labels the next clip Cam 2 | **Becomes ADD A TRACK** (Cam 2 above, armed) |
| Overwrite: required to record anywhere inside the chain | **(v3.1) RETIRED** (Carl, [C3]): nothing is destroyed, so A always records; the button, its arm state, its status lines and its harness checks go |
| One lane, renumbered globally | Per-track numbering; tracks collapse / expand |
| Joins: a cut where the camera changes, otherwise a mismatch | **Kept**, read from what plays (precedence) |
| The halt where a clip ends (the next clip starts where the last stopped) | **Kept** |
| The Sampler (60 a second, the clamped clock), hidden tab stops a recording, a failed save shown | **Kept unchanged** |
| `refined` / `comp` reserved for R2 | **Kept reserved.** Comping (choosing which take plays across a range, a cut or a crossfade) writes into `comp` later; until then the newest take plays |
| The fly rig, the pad map (27 October), the floor, the grid, the readouts | **Unchanged** |
| **(v3.1, [C1]) R3F's AUTOMATIC RENDER** (it draws after the frame callbacks) | **T1: unchanged.** ⚠ **T2 (the PiP) TAKES IT OVER**: a priority `useFrame` calling `gl.render` twice stops R3F's own render for the whole canvas. Dependants: `LetteringPiece`'s ready report (`lettering-piece.tsx`, the `useFrame` that reports "this frame draws the piece ... straight after the callbacks"). And the canvas's CONTEXT-LOSS history (`camera-bench.tsx`, the `webglcontextlost` handler; the fault the 26 October handoff left open) is a reason to change render ownership carefully. ⛔ **T2's plan must list every value set per frame FROM THE CAMERA** (today: the 10 cm lines' thickness from `st.camera`'s distance to the focus object) and, for each, re-set it between the two passes or accept it wrong AND SAY SO on screen |
| `window.__cameraBench` (`clips`), the 58-check page harness (52 at R1; six added 27 October for the re-mapped pad, the trigger pace and the floor stop: run 58/58, D-104), the 17-check chain check | Extended with tracks, start, order; the punch-in checks REWRITTEN for takes; new: precedence, gaps, move, migration |
| The autosave key `c2b-camera-bench-chain-v1` | A v2 key; v1 migrated and KEPT until Carl says otherwise (v3-3, [D5]) |
| Film 4's page, `LetteringPiece`, `shot-format.ts` | **Untouched**. ⚠ The format's "N cameras + a cut track" now MATCHES the bench: each track a camera, the cut track read from precedence. The hand-off becomes simpler, not harder |

### (v3.1) The Architect's review of v3, folded in

Verdict: *"Sound in principle, but not ready to build."* C2 (joins) and C4 (take lanes) are in the Behaviour table, C1 in
§5b. The rest:

- **[C3] OVERWRITE — ANSWERED (answers 6, 7): RETIRED; a run-on covers as a new take.** It guarded a DESTRUCTIVE act
  (R1's punch-in discarded a tail); in v3 nothing is lost.
- **[C5] Edges:** every clip's span is HALF-OPEN, `[start, end)`, trimmed spans too, with `EDGE_S` (R1's boundaries are
  sums of sixtieths, 2e-15 s off). ⛔ **THE MIGRATION PROVED BY NUMBER:** v1 `poseAt` against v2 `sourceAt` at every
  sample time and every boundary of a real R1 chain: **"identical" = every field within 1e-9** (degrees, `d` units,
  seconds; v1 sums `clipStarts` where v2 stores `start`, so the arithmetic paths differ and bit-exactness is not
  promised). A wider difference FAILS the check.
- **[C6] A gap with no picture before it:** hold the last picture BEFORE T; if there is none, the first one AFTER T.
- **[C7] Storage. MEASURED 27 October:** `localStorage` holds **5,242,880 characters per origin** (keys + values;
  Playwright's Chromium, Carl's Chrome's engine, not his browser). At ~260 KB per recorded minute: ~20 minutes per origin,
  and covered takes are KEPT, so the chain only grows. ⚠ **Carl's current chain size: not yet measured** (it is in his
  browser; a console line, to Carl; carried in the handoff with Carl as owner). **A failed v2 write during migration:**
  v1 is KEPT, the failure SHOWN on screen, and the bench runs on the migrated chain IN MEMORY (nothing is lost; the next
  good save writes v2). ⚠ **The v1 copy is never removed by the bench** ([D5], answer 10), so the quota holds v1 + v2:
  Carl's R1 takes count TWICE against the ~20 minutes until he says v1 may go.
- **[C8] Play the selection — ANSWERED (answer 8): SOLO**, as a clip opened in Resolve's Source viewer (⚠ [D1]: not
  "Resolve's solo-on-select", which does not exist).
- **[C9] Limits:** `start ≥ 0` on a move and a left-edge trim; a trimmed clip at least ONE SAMPLE INTERVAL (1/60 s) long;
  T1 never stores an empty clip (as R1).
- **[C10] Start while recording** does nothing, and the status says why (as A does).
- **[C11] T1 split — ANSWERED (answer 9): yes.** **T1a, the model** (v3-1 to v3-3, `sourceAt`, the migration, arm and record at the
  playhead, precedence, takes on top, gaps; proven by the chain check and the R1 parity check; Carl flies it), then
  **T1b, the editing** (expand to take lanes, move with snapping, trim, per-track numbers). The Builder agrees: T1a is
  where a structural fault would show.
- **Track REORDERING** (dragging a whole track up or down, which changes precedence; one reading of *"be movable"*) is
  **OUT of T1**, the Builder's reading of Carl's answer 2 (*"Along its track only"*); Carl to correct.

### Stages (the Builder's proposal: prove the track before the extras, ethos §14a)

| Stage | Builds |
|---|---|
| **T1a, THE MODEL** **(v3.1, Carl: *"Yes: T1a then T1b (Recommended)"*)** | v3-1 to v3-3; `sourceAt`, the migration (proven by the R1 parity check, [C5]), tracks, arming (and Start), record at the playhead, precedence, takes on top (newest plays), the three joins ([C2]), gaps marked and held, Overwrite retired. The data carries `in` / `out` from the start (T1b uses them). **Carl flies it** |
| **T1b, THE EDITING** | Expand to take lanes (one per pass, [C4]), move along a track with snapping, TRIM, per-track numbers. Track REORDERING out of T1 |
| **T2, THE PiP** | v3-5, measured |
| **Then** | Comping (R2's `comp`), the hand-off and return (R2), as before. Order Carl's |

### Carl's answers (27 October 2026, the question dialog; his choices verbatim)

1. **Trim (v3-4): *"Yes, in T1 (Recommended)"*.** A clip is `{ id, cam, start, order, in, out, samples }`: `in` / `out`
   over its samples, the samples never cut; dragging an edge moves `in` or `out` (and `start` with `in`, so the picture
   under the playhead does not slide). Precedence (v3-2) reads the TRIMMED span.
2. **Move between tracks: *"Along its track only (Recommended)"*.** T1 moves a clip in time on its own track.
3. **Arming on the pad (v3-6): *"Start cycles the armed track (Recommended)"*.** Start steps the record-arm Cam 1 → Cam 2
   → … → back; the track header arms it too. ⚠ A track can be ADDED only on screen (Start never creates one).
4. **Gaps: *"Hold the last picture (Recommended)"*.** The picture holds, the status says "gap", the timeline marks it.
5. **The order:** Carl, after the client film: *"we will move on to additional camera take lanes"* — **T1 next**; T2 (the
   PiP) and R2 after, order his.

On the Architect's review of v3 (C3, C8, C11), the same dialog, 27 October:

6. **Overwrite ([C3]): *"Drop it (Recommended)"*.** Retired.
7. **A run-on into a clip ([C3]): *"Cover it, as a new take (Recommended)"*.**
8. **Play a selection ([C8]): *"The clip solo (Recommended)"*.** (The option's description cited "Resolve's
   solo-on-select"; ⚠ corrected by the Architect [D1]: the parallel is Resolve's Source viewer. Carl chose on the
   behaviour.)
9. **Chunking ([C11]): *"Yes: T1a then T1b (Recommended)"*.** Track reordering out of T1 (stated in the option).

On the Architect's check of the fold-in ([D5]):

10. **The v1 copy: *"Only when I say so (Recommended)"*.** Kept alongside v2; never removed by the bench.

---

# v2.2 — APPROVED AND BUILT AS R1 (kept as the record)

**Versions.** **2.2 (26 October): TWO LANES APPROVED; MERGE; THE UI DELEGATED.** Carl: *"Two lanes is a great idea,
especially with a merge function. Also, half the info on the page doesnt have to be there. Try to make it a clean UI. You
can arrange the UI how you see fit. Make it professional looking and intuitive."* See *(v2.2) Merge* and *(v2.2) The
UI* below. **2.1 (26 October): THE ARCHITECT's SECOND REVIEW** (*"ready for Carl to approve once one gap is
closed"*). Its points 2–6 are folded in, marked **(v2.1)**: a fixed sampling rate; the parked playhead, a control to the
end, what counts as a fly input, a stick during playback; the hidden-tab stop named as outside the frame callback; the
chain's own version number; roll reserved. Its point 1 (the refined clips' shape) is a DECISION FOR CARL, stated below
under *Hand-off and return*, with the review's proposal. **2 (26 October): THE ARCHITECT's REVIEW AND CARL's FOUR ANSWERS FOLDED IN.** The review's verdict was
*"sound ... Approve it in principle after six amendments"*. The Builder checked every finding against the code and all
hold. Each change is marked **(v2)**. Carl answered the four questions the review raised: (1) flying between chunks:
*"Yes, it would be useful. An opportunity to frame the shot. Only pressing A puts you in record mode."* (2) deleting:
*"highlight chunks and press delete."* (3) the refined result: *"You would make your refinements and i would be able to
highlight the chunks and press play. In DAW terms the chunks would function like clips."* (4) numbering: *"if a chunk is
deleted the numbering system should be sequential."* **1:** the design, decisions, §5b.

## Why

On the pad, the keyframe bench confused its user. A started a hidden clock and recorded nothing visible. One key gave
"0.00 / 0.00 s". X with one key did nothing, silently. A at the default appended to an old take. Carl: *"this is
confusing. i pressed A, moved the camera yet playback had me standing still"*, then *"it needs redesiging into something
simpler. im never going to make a complete pass, its always going to be in chunks."* The bench is KEYFRAME (Fusion);
Carl works RECORD / STOP and CLIPS (a DAW).

## Carl's design, in his words

- *"I might want to move the camera into position first. A should start the tracking of the movement and pressing it
  again should stop it. If its pressed again the 2 take should start from that point."*
- *"On playback i might decide that i want to edit the end of 1. i should be able to use the scrubber or the numbers ...
  with the up/down to get to the place i want. If i press A again it will overwrite the end of 1 with the new
  information, thus creating 2. That way i could chain sequences together before handing them to you."*
- *"create an overwrite button to press first. then i will press A ... a deliberate act."* / *"put it on the panel. Also
  the major buttons, put them on the grid, say bottom left."*
- *"Editing one chunk will probably affect the next if i go back to tweak. This being context driven i would ask you to
  compensate."* / *"There is also a way around it if we use more than one camera in incorporating cuts."*
- The four answers, above.

## Behaviour (the Builder's reading of Carl's design, for Carl to correct)

| | |
|---|---|
| **Framing** | Fly freely at any time outside recording: before the first chunk and **between chunks** **(v2, Carl, against the review's proposal)**. *"Only pressing A puts you in record mode."* |
| **A** at the chain's end | Records a new chunk from the camera's CURRENT pose, AS FLOWN (dense samples). **A** again stops. On the same camera, a start away from where the last chunk stopped makes a JOIN MISMATCH. It is deliberate, shown in the clip lane (distance, angle), and compensated at hand-off; **NEW CAMERA** first makes it a cut instead |
| **Inside the chain** (scrubbed) | The camera sits at the scrubbed pose. **(v2)** A fly input leaves scrub and flies from that pose (re-framing the punch-in). **(v2.1)** A FLY INPUT is any of: the sticks, the triggers, the lens, the move / look keys, a mouse drag (the dead zone already stops drift). ⛔ **THE PLAYHEAD STAYS PARKED at the scrubbed moment while Carl re-frames**, because OVERWRITE needs that moment. The status line shows it: *"parked at chunk 1, 3.4 s, flying"*. **(v2.1) During PLAYBACK a fly input STOPS playback**, parks the playhead where it stopped and flies from there, the same as a scrub. **A** alone does nothing and the status says why. **OVERWRITE** (on screen only) arms it, the status turns red and names the chunk and the moment, and **A** punches in from the CURRENT pose. The punched chunk is CUT at the scrubbed moment and its TAIL IS DISCARDED **(v2)**. The new recording follows as the next chunk. LATER CHUNKS ARE KEPT. One use, then disarmed; pressed again before A, it cancels |
| **Clips** **(v2, Carl)** | Chunks are CLIPS on a lane, as in a DAW: blocks as wide as their length, coloured by camera, the joins marked. Click to select, shift-click for several. **PLAY** plays the selection, or the whole chain if nothing is selected. **DELETE** (on screen) removes the selection. "Clear" is select all, then Delete: two deliberate steps |
| **Numbering** **(v2, Carl)** | Always 1, 2, 3 … in playback order, renumbered after a delete or a punch-in |
| **B** | **(v2)** No longer deletes. Free |
| **X / Y / View** | Play / stop; the chain's start; the default view (as now) |
| **(v2.1) TO THE END** | Puts the playhead (and the camera) at the chain's END, ready to add a chunk without playing through or dragging. On the pad: **D-pad right past the last clip**; on the transport: **⏭ End**; on the keyboard: **End**. The Builder's defaults, for Carl |
| **NEW CAMERA** | The next chunk is a new camera, **"Cam 2"**, "Cam 3" **(v2: not "Camera B", which collides with the B button in status lines)**, flown anywhere first; its join is a **CUT**. A punch-in may continue or cut. **X** plays the chain AS AN EDIT |
| **Transport** | Record, play, start, default, overwrite, new camera, delete, and a plain-words status line (chunk, time, what the next press does) over the picture, bottom left. Lit when active, never in the camera's picture. **(v2)** A SIBLING of the picture's drag surface, not inside it (finding 4, §5b) |
| **Hand-off and return** **(v2, Carl)** | The chain goes to the Builder: smooth, retime, make exact, compensate the joins by judgement from the shot's opening description (a blend, a re-aimed start, or a cut suggested where a blend would look forced; ⚠ near-identical angles read as a jump cut, so 30° or a change of shot size). The REFINED version COMES BACK ONTO THE BENCH AS CLIPS: Carl selects them and presses play, on the grid, where he recorded them. It arrives by a READ path ("Open", a file picker) and never by a write into the repository |

### (v2.2) MERGE = COMPING (Carl: *"Comping."*)

*"especially with a merge function."* Three DAW meanings were put to Carl; **he chose COMP**:
- **COMP (CHOSEN):** the final move built section by section from either lane ("Recorded for the approach, Refined round
  the arch"), as Pro Tools comps from playlists. Structurally the comp is a THIRD thing (a list of lane + time ranges) or
  it writes into one of the lanes; decided in the plan. **EACH COMP SWITCH IS A CUT OR A CROSSFADE:** a cut is an instant
  switch; a crossfade blends from one path to the other over an editable time (about 0.5 s), as a comp crossfade hides a
  vocal edit. Seamless where the two versions run close; where they do not, it reads as a drift, and a cut serves better.
- RAISED, NOT CHOSEN: **PROMOTE** (the Refined lane becomes the Recorded lane). **JOIN** (two neighbouring clips in one
  lane become one, with no cut; Carl asked whether join meant cutting between the lanes, and it does not: that is the
  comp's switch).

### (v2.2) The UI: delegated to the Builder, built and shown, not pitched

The principle: the PICTURE FIRST, everything else on demand, laid out like Resolve or Pro Tools.
- The picture large; the transport bar over it, bottom left; a plain status line.
- Under it, the TWO LANES as a timeline: clips as blocks, a playhead, the joins marked (with their mismatch).
- A slim INSPECTOR, right, for the SELECTED clip only: its length, start and end in metres from ground zero.
- Behind a toggle or "?": the pad map, the arch's numbers, the grid switch, the sensor note. Off the page: the long
  explanations and the readout in `d`.

### ⛔ (v2.1) APPROVED (v2.2), Carl: *"Two lanes is a great idea"*: the refined clips' shape (the second review's point 1)

The hand-off produces the shot FORMAT: one Shot, N cameras, a cut track. Its boundaries need not match the recorded
chunks: compensation blends ACROSS a join, and the Builder may suggest a cut INSIDE a chunk. So "refined 3" need not be
"recorded 3". **The review's proposal, which the Builder supports:**
- The returned file is ONE Shot. The bench SPLITS it into clips at its CUTS and at MARKERS the Builder adds wherever a
  recorded chunk boundary still exists.
- It shows on a SECOND LANE, "REFINED", under "RECORDED", numbered PER LANE, so the two can be compared, select and play
  on either. (In Pro Tools terms, a second PLAYLIST of the same track, shown stacked.)
- Opening a newer refined file REPLACES the Refined lane; the Recorded lane is never touched by Open. The opened shot IS
  autosaved with the chain (its own field, the chain's version), so a reload keeps both.
- **VALIDATION:** the opened file is outside data. It is checked with `shotRefusal` plus a shape check before anything
  plays, and a refusal is SHOWN on screen in plain words. Nothing half-loads.

## ⛔ The structural decisions (§5a)

**1. Where a recording lives against the shot format.**
- **(A) Recordings are BENCH DATA, raw material.** The hand-off fits the shot format's keyed tracks to the samples, joins
  compensated. The format stays the ONE thing a page reads. This is a DAW's takes against its bounce. **The Builder
  recommends A; the review agrees.**
- **(B) A SAMPLED track in the shot format**, played by pages. Rejected: it gives pages two ways to read a camera, and a
  raw take would reach a page unrefined.

**(v2) 1a. Two playback paths on the bench, named as such.** RECORDED clips play by their samples. REFINED clips play
through the format's `evalTrack`. Both are needed: the format's Hermite auto-tangents (`shot-format.ts`) would smooth
across a join, which breaks "a jump shows as a jump". Raw takes never play through the format.

**(v2) 1b. The chain carries a CAMERA FIELD per clip** (bench data, not the format). The format's cut track is only the
hand-off target. ⛔ Still ONE three.js camera and ONE rig: a "camera" in a chain is a label on clips, not a second
`PerspectiveCamera`.

**2. Units.** v3's decision stands: positions in units of `d`. ⚠ For the arch, `d` is set by its HEIGHT in any window
wider than about 4:5 (6.90 × 8.58 m, measured), so it is stable in practice. **(v2)** That threshold is the arch's own
proportion, and the hero's will differ; recording in `d` also sits awkwardly beside the metric world (walking pace in
m/s). REVISIT when the hero's subject exists, not now. The bench SHOWS metres from ground zero.

**3. Orientation.** Samples hold turn / tilt (Euler), as the rig does; tilt is clamped at 89°, so capture is safe.
**(v2.1)** ⚠ v2 said "turn / tilt / roll, as the rig does": THE RIG HAS NO ROLL (`camera-pad.ts`, `Rig`; `pose()` writes
0). Roll is NOT SAMPLED; it is RESERVED for the fitted shot (the format's roll track), so a sample is 6 numbers (t, x, y,
z, turn, tilt) plus the lens, 7 not 8.
The gimbal question (move 1 looks up, along, down) belongs to FITTING, not recording.

**4. One frame callback, and the clock.** Sampling happens in `BenchStore.frame`, the ONE callback. **(v2, finding 2)**
Samples are stamped with the **CLAMPED dt the rig integrates** (`frame()` clamps at 0.1 s), so playback matches what was
flown: a hitch costs at most 0.1 s, never a drag. ⛔ This SUPERSEDES v3's "NOT clamped as Journey clamps its clock" for
recordings. **(v2.1) A FIXED SAMPLING RATE:** the bench draws once per SCREEN REFRESH (`frameloop="always"`), so
sampling every frame would take 144 a second on a 144 Hz display and make the sizes below wrong by 2.4×. A sample is
taken once 1/60 s of clamped time has built up, so the size is the same on any display. **A HIDDEN TAB STOPS THE
RECORDING**, as if A had been pressed, and the status says so. **(v2.1)** ⚠ This is the ONE thing OUTSIDE the frame
callback, by necessity: a hidden tab draws no frames. A `visibilitychange` listener calls a store method
(`stopRecording`); the store stays the only owner of the recording.

**(v2) 4a. Where samples live while recording (finding 1).** In the STORE, not React state. They reach React state and
storage ONCE, when A stops. Today every capture goes through `setPoses`, which re-renders the panel and autosaves the
whole take; that is harmless for keys and ruinous at 60 a second.

**5. Persistence and the route to the Builder.** **(v2.1)** 7 numbers × 60 a second (fixed, 4), roughly 260 KB of JSON
per recorded minute. **(v2.1) THE CHAIN HAS ITS OWN VERSION NUMBER** (`CHAIN_VERSION`), in the autosave key and in the
downloaded chain file. ⚠ Today's autosave stamps bench data with the FORMAT's `SHOT_VERSION` (`camera-bench.tsx`, the
autosave effect), so a change to either would be misread as the other. ⚠ **UNMEASURED: the `localStorage` quota (about 5 MB is believed, not measured) and so the "about 15 minutes"
that follows.** Thin to 30 a second if needed. **(v2, finding 5) A FAILED SAVE SAYS SO ON SCREEN.** Today's `catch {}`
swallows it, against the house rule that failures are loud. To the Builder: v3's persistence B (a download, then the
Builder's import, with no new write path). Back to Carl: the READ path above.

**6. No second canvas.** The transport and the clip lane are HTML.

## §5b: what the current bench provides, and what happens to each

| Provided now | Fate |
|---|---|
| Key capture (A), the key table, key time + HOLD editing, per-row delete, D-pad step between keys | **Retired.** Clips replace keys for the hands; keys return as the fitted, refined clips (1A). Delete is the clip lane's. D-pad left / right: step between clips |
| **(v2)** The React mirror of the take and the AUTOSAVE ON EVERY CHANGE | **Changed**: a recording reaches React and storage once, when A stops (4a). Edits (delete, punch-in) still save on change, loudly on failure |
| **(v2)** The picture's wrapper takes POINTER CAPTURE on every pointerdown (the mouse-drag look) | **Kept for the picture.** ⚠ Anything placed inside it would start a drag when pressed (the 14 August unclickable cards). The transport is a SIBLING, positioned over it |
| **(v2)** Scrub mode: the camera follows the playhead and the sticks are ignored | **Changed**: a stick touched leaves scrub and flies from that pose (the punch-in re-frame) |
| Smooth interpolation between keys (`shot-format.ts`) | **Kept** for refined clips (1a) |
| Play, to start, default view | **Kept**, over clips; play plays the selection |
| **(v2)** The keyboard map (Space, Backspace, P, Home, H, comma / full stop), which the harness drives | **Kept as the keyboard twin**: Space = A (record / stop), P = play, Home = start, H = default, comma / full stop = step clips; Backspace = DELETE the selection (no longer "remove last") |
| The autosaved take (`c2b-camera-bench-take-v1`, keys) | **A new key** for chains; the v1 take left unread, so nothing written today is reinterpreted |
| The 10 s cap on a key's gap, the 1 s fallback | **Gone with keys** |
| The fly rig, walking pace, truck, grid, focus subdivision, scale, readouts, View | **Unchanged** |
| `window.__cameraBench` and the harness's 31 checks | Extended with clips; the key checks rewritten as clip checks |
| Film 4's page, `LetteringPiece`, `shot-format.ts`'s keyed format | **Untouched** |

## (v2) v3's chunk list, restated

| v3 | Now |
|---|---|
| Chunk 1: fly, capture keys, play, scrub, edit keys | **Built** (keys); the fly rig, grid and scale stay, the keys retire with R1 |
| Chunk 2: record a live take (Start); on-bench simplification | **R1, THE RECORDER** (this note): record / stop, clips, punch-in with OVERWRITE, framing between clips, delete, numbering, transport, the camera field and cuts. ⚠ Simplification moves to hand-off (R2) |
| Chunk 3: export, a page reading a shot | **R2, HAND-OFF AND RETURN**: the download, the Builder's import and fitting, the joins compensated, and "Open" (the READ path) so refined clips come back onto the bench |
| Chunk 4: the overview | Unchanged (with the views question: Fusion-style flat views or a third-person chase view) |
| Chunk 5: several cameras | **Folded into R1** as the camera field and cuts; on the page, R2 |
| (new) | **TURNING BACK ON THE PAD**, part of Carl's bindings (item 1). ⚠ Move 1 needs it, so it is **scheduled before the first real take** (the review) |
| (new) | The LOCK-ON / ORBIT, then the PROCEDURAL SHAPES (the helix; shape stored or baked, Builder recommends stored). A shape becomes a clip the maths draws. Order Carl's |

## Open (Carl's)

- Where TURNING goes on the pad (LB / RB as GTA's yaw, the D-pad's left / right is now taken by stepping clips, or
  another), before the first real take.
- The order of the lock-on and the shapes after R1 and R2.
