# Structural note: THE CAMERA BENCH REDESIGNED AS A RECORDER (record / stop, chunks as clips, punch-in), 26 October 2026, VERSION 2.2

**For:** Carl, to route to the Architect. **Status:** PROPOSED. Nothing built. The DESIGN is Carl's (D-104, 26 October,
"CARL's REDESIGN"); this note is the Builder's account of what it changes structurally, the alternatives, and what the
current bench provides that must survive (CLAUDE.md §5b). It amends `structural-note-camera-bench-26-october.md` (v3).

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
