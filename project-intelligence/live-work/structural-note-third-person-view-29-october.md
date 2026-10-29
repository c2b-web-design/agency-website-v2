# Structural note: THE THIRD-PERSON VIEW and the PiP on the camera bench (`/proto/camera`). 29 October 2026, v1.3.3

**Builder. ✔ APPROVED at v1.3.1 (Carl: *"Approved. Proceed"*). Nothing built.** (CLAUDE.md §5a: a second camera, who
renders the canvas, a second rig, new derived data). **Record:** D-104's tail, 29 October.
**Versions.** **v1.3.3 — the record, wording:** the grid's `worldCamProjPosition` is the FADE centre only (the plane
moves only with `followCamera`, off here; the plan's review 2, verified in drei 10.7.7). **v1.3.2 — the RECORD amended after approval, not reopened** (`context-rules.md`, *Approved work is
amendable*): the plan review found two errors carried in from the note (the PiP's units; drei `Grid`'s per-camera
uniform), both verified in the installed source; and Carl's ruling on the PiP during a drag. **v1.3.1:** the Architect's review of v1.3: *"I recommend approval"* (appended verbatim); its two build
notes written in (wording only). **The approval is Carl's.** **v1.3:** the Architect's review of v1.2 (*"ready for your approval once the three points below are written
in"*; appended verbatim) and Carl's word on switching off mid-play. **v1.2:** the Architect's review of v1.1 folded in (*"almost ready"*: one must-fix, five should-fix, one
minor; appended verbatim to the same file; must-fix 1 verified in the code first) and Carl's call on solo playback
(*"The clip being played"*). **v1.1:** the Architect's review of v1 folded in (five must-fix, six should-fix, two minor; saved verbatim,
`architect-plan-response-third-person-29-october.md`; its line-width point checked in drei's source first) and Carl's
decisions on must-fix 1–3. **v1:** the note.

## Carl's brief (verbatim)

- *"I need i visual representation of the camera and its trajectory in the form of a line. If multiple cameras are added
  the same for them. I need to be able to position myself on the edge of a scene so i can see it all. If a pic n pic of
  what the selected camera sees can be put on screen, say top left that would be of great benefit."*
- *"the workflow will be i will fly the camera, make the movement. Then i need to be able to step out of the scene and view
  from third person what has been done. The third person needs to be able to move, to be put in position then i need to
  be able to switch to a camera."*
- **(v1.3) THE PURPOSE, Carl:** *"Whatever im doing i will stop. The goal and idea here is to be able to have more than one
  perspective on the scene. First for compositional purpose and then editing purpose."*
- **(v1.1) Carl's decisions:** *"Right stick click for third person on, click again for off (selected camera view ) When in
  third person i will see the whole scene on the screen from where i position myself using the controls. What the PiP
  should show is the view from the currently selected camera. So i will see both its trajectory and the view while
  executing that trajectory in PiP."*
- The bench's two purposes: *"One to help us build with and two the ability to record and to send to clients for
  approval."* Chosen earlier the same day: recording in the shot camera's view; the pad flies the EYE in third person; the
  "selected camera" = the ARMED track (Start / C chooses it).

## What exists today

ONE canvas, ONE camera: drei's `<PerspectiveCamera makeDefault>` IS the shot camera; `BenchStore.frame` (the one frame
callback, priority 0) writes the rig's pose into it; R3F's own render draws it (nothing in the tree takes over rendering:
checked, the only other `useFrame` is `LetteringPiece`'s readiness report, priority 0). The picture's mouse drag and the
pad drive the ONE rig. The store knows what PLAYS at `T` (`poseAtT`, across tracks), not where each track's camera is.

## The proposal

### 1. Two views, one switch

- **First person** (today, unchanged): the shot camera fills the picture; A records; no helpers, no PiP. ⛔ The view a
  client film captures (D-105's bench route).
- **Third person**: the EYE fills the picture, flown with the pad's usual controls (`stepRig`, `FEEL`, the floor stop) and
  the mouse; every camera track drawn as a body, a frustum and its path; the PiP top left.
- **⛔ THE PiP SHOWS THE SELECTED (ARMED) CAMERA's OWN VIEW** (Carl: *"the view from the currently selected camera… i will
  see both its trajectory and the view while executing that trajectory in PiP"*): `trackPoseAt(chain, armed, T)` — that
  camera's own take at T, NOT what plays across tracks (`poseAtT`). The same in a still, after a scrub and **during
  playback**: X plays the timeline, every helper rides its path and the PiP is the armed camera executing its move. With
  Cam 1 armed and Cam 2 playing above it, the PiP shows Cam 1. **An armed track with no clips yet:** the PiP shows the shot
  camera where first person left it, labelled *"Cam 2 · no clips yet"*.
- **⛔ DURING A TRIM OR MOVE DRAG (v1.3.2, Carl: *"The drag's picture"*):** the PiP shows the drag's picture, as first
  person does today — trimming, the frame at the dragged edge; moving, the selected camera at the playhead on the moved
  timeline. The RIG stays where first person left it.
- **⛔ A SOLO PLAY (X with clips selected) — Carl: *"The clip being played"*** (v1.2, the Architect's [2]): the PiP shows
  the clip being played (`clipPoseAt`, as first person's solo does), and THAT clip's camera body rides it — even an older
  take covered by a newer one on its track, whose own path is drawn for the length of the solo so the body rides a
  visible line. The other cameras stay at their tracks' poses at T. The PiP's label names the clip (*"Cam 2 · clip 3
  solo"*).
- **⛔ FLYING THE EYE NEVER STOPS PLAYBACK** (v1.1, the Architect's [2]; Carl: *"while executing that trajectory"*). In
  first person a fly input still stops playback (today's rule, `camera-bench.tsx:746`).
- **THE SWITCH (Carl): the right-stick click (`BTN.RS`, unused) — on; click again — off, into the selected camera's view.**
  The keyboard twin **T** (unused; the harness drives the keyboard). Nothing else (no overlay button: not asked).
- **Switching OFF = the armed camera's view at the playhead** (Carl: *"click again for off (selected camera view)"*): what
  was in the PiP goes full screen. ⛔ **The rig is SET to `trackPoseAt(armed, T)` (through the chain's units) and PARKED
  with `posed = false`**, like a fly that has stopped (v1.2, the Architect's [1]: `posed` re-poses every frame to
  `playheadPose()` → `poseAtT`, what PLAYS, so with Cam 1 armed under a playing Cam 2 a posed switch would show Cam 1 for
  one frame, then jump to Cam 2). It stays on the armed camera until a scrub, a play or a step re-poses it. During a SOLO
  play, switching off lands on the soloed clip's pose (the PiP's, below). An armed track with no clips: the shot camera
  stays where it was.
- **⛔ SWITCHING OFF STOPS WHATEVER IS RUNNING** (v1.3; the Architect's [1]: the play branch re-poses every frame whatever
  `posed` says, so a switch during X would cut to what plays). ⚠ **The BUILDER's READING of Carl's *"Whatever im doing i
  will stop"*** — which can also be read as Carl stopping playback himself before he switches (the Architect, review 4);
  the two come to the same picture. ⛔ **THE ORDER (review 4): take the PiP's pose FIRST, then stop playback
  (`stopPlay(false)`), then set and park the rig** — stopping clears a SOLO, so a pose taken after the stop would land on
  the armed track, not the soloed clip. What was in the PiP goes full screen and HOLDS.
- **⛔ THE ROLL IS KEPT ON SWITCHING OFF** (v1.3, the Architect's [2]): switched off mid-barrel, the picture keeps the
  pose's roll until a fly input. `roll = 0` moves under the same `active` test that clears `posed` (flying is level); a
  RECORDING still levels it at once (samples carry no roll). First person today unchanged: roll is non-zero only after a
  posed or played frame, and those end only on an input. ⚠ **STATED PLAINLY (the Architect's [3]): a framing flown in first person but NOT
  RECORDED is lost when Carl switches back onto a track that has clips** — the switch puts him in that camera's pose. It
  survives only on an empty armed track.
- **What the switch refuses:** while RECORDING, refused and said (*"Stop first (A)"*, as Start's [C10]); during a trim or
  move drag, ignored (T1b's gates, now TWELVE controls, `[R3]`).
- **In third person:** A is refused, said (*"Third person: right-stick click or T to go to the camera, then record"*;
  v1.2, the Architect's [6]: the keyboard named too). X / P play;
  Y / the Home key (to the start), End, comma / full stop, the ruler, trim and move all work. **The View button and H frame
  everything** (the eye placed to see every path and the arch: Carl's *"see it all"*); in first person they stay the
  default view (`home()`). ⚠ The keyboard's Home key is to-the-start in both views (the Architect's [10]).

### 2. One canvas, drawn twice (the render takeover)

- **ONE new frame callback at priority 1** (`BenchRender`, inside the canvas) takes rendering over from R3F (R3F 9.6.1:
  any priority > 0 does). First person: `gl.render(scene, shot)`, one draw, as today. Third person: the full viewport with
  the EYE, then the PiP rectangle with the SHOT camera through `setViewport` / `setScissor` (`setScissorTest` on for the
  second draw only, `autoClear` handled by hand). ⛔ **The render callback only DRAWS; it writes no pose** (below).
- **⛔ ONE WRITER FOR EVERY CAMERA: `frame()`** (v1.2, the Architect's [3]). It already writes the shot camera; it gains
  the eye's camera object as an argument and writes both, each frame. In third person it writes the SHOT CAMERA OBJECT from
  the PiP's pose (`trackPoseAt(armed)`, or the solo clip's) **and leaves the RIG where first person left it** — so
  `CAMERA_KEY` (saved from the rig) keeps first person's camera, and an empty armed track's PiP shows that rig. The rig
  moves only on switching off (above) or in first person.
- **THE PiP's RECTANGLE HAS ONE SOURCE: the constant `PIP`** (left and top inset 16 CSS px, width a quarter of the
  picture's; height from the picture's aspect, so the shot is framed exactly as recorded). ⛔ **Its conversion lives with
  it** (the Architect's [11]): `setViewport` / `setScissor` count from the BOTTOM-LEFT, ⛔ **in CSS pixels — three
  multiplies by the pixel ratio itself** (v1.3.2, corrected: v1.1–v1.3.1 said *"drawing-buffer pixels… × dpr"*, which
  would scale twice: at a ratio of 2 the PiP twice the size and misplaced; `WebGLRenderer.setViewport`, three r185), so
  `y = H − top − h`. The DOM frame and label over the PiP read the same constant.
- **Two layers: 0 and 1** (three's `Layers`). Helpers and paths on layer 1; the EYE sees 0 and 1; the SHOT camera layer
  0 only (three draws only what a camera's layers include, `WebGLRenderer.js:1835`, the Architect checked). ⛔ **So no
  helper can reach the shot camera's picture, the PiP, a recording or a client film.** ⛔ **Layers are PER OBJECT** (the
  Architect's [9]): every mesh and line of every helper is put on layer 1 itself (one traversal at mount), never a group.
- **The helpers are ALWAYS MOUNTED** (the Architect's [9]): `gl.compile` compiles every material whatever its layer, so
  they compile with the brass at load, never as a stutter on the first switch. Their layer, not their visibility, keeps
  them out of the shot.
- **Rejected:** (a) a SECOND CANVAS for the PiP: a second WebGL context, a second studio PMREM, a second compile of the
  brass (§5a's worked case, the warm-up canvas); (b) a render target (`RenderTexture`): an extra framebuffer and a
  texture draw each frame for nothing scissoring does not give; (c) drei `View`: places its scissor from a DOM element each
  frame (the lag class D-046 / D-048 engineered around); the PiP is a fixed share of one box.
- **Cost:** third person draws the scene TWICE a frame (the PiP at ~1/16 of the pixels). First person is unchanged. ⚠
  Measured AT THE CHECKPOINT, before Carl approves the take (frame time, first vs third person, on his machine) (v1.2, the
  Architect's [5]: it cannot be timed before it exists).

### 3. A second rig: the EYE — owner and lifetime (the Architect's [7])

- **The eye's POSE is the store's** (`eye: Rig`, beside `rig`), and `view: "first" | "third"` with it. `frame()` routes the
  fly inputs to the rig of the current view.
- **The eye's CAMERA OBJECT** is a `THREE.PerspectiveCamera` created ONCE in `BenchScene` (a `useState` initialiser),
  mounted with the canvas, never keyed, gone with it: the same lifetime as the shot camera. Not the default camera.
  `near` 1, **`far` = m.d × 60** (the shot camera's: "see it all" must not clip the far paths); its aspect set from the
  canvas size in the render callback; its lens zooms on the bumpers like the shot camera's.
- ⛔ **The default camera stays the SHOT camera** (`makeDefault`): `LetteringPiece` compiles against it, the store writes
  it; nothing changes owner.
- The eye is REMEMBERED across reloads (its own key, as `CAMERA_KEY`); on a first visit, it starts framing everything.

### 4. New derived data, in `bench-chain.ts` (pure, checked under Node)

- `trackPoseAt(chain, cam, T)`: where ONE track's camera is at T — its newest take there (precedence inside the track
  only; the higher tracks ignored: it is THAT camera). In a gap on its track: its last picture, flagged `held`; before its
  first clip: its first picture, `held`; a track with no clips: null.
- `trackPath(chain, cam, hz)`: that track's positions over its clips, 30 a second, broken at its gaps, IN CHAIN UNITS.
- ⛔ **INTO THE WORLD THROUGH `chain.units` (`toWorld`), NEVER THE LIVE MEASURE** (the Architect's [8]; the class of the
  Home / T2 fault): as `setRig` does. **Nothing is drawn while `units` is null.**
- Derived ON CHAIN CHANGE only (as joins and gaps), never per frame; during a trim or move drag the paths update on release.

### 5. What is drawn (third person only, layer 1)

- **Per track, its camera:** a small body (an unlit box and lens, the track's colour from `camColour`) and three's
  `CameraHelper` on a PROXY camera per track (its lens AND ROLL at T — a barrel take's frustum rolls with its picture, v1.2 —
  the picture's aspect, `far` ~1.5 m: a short frustum pyramid like Unreal's camera actor, not the shot camera's d × 60).
  Dimmed when `held`. The armed camera brighter.
- **Per track, its path:** a line in the track's colour (drei `Line`, ~2 px).
- **⛔ The "Cam 2" labels are written BY REF INSIDE THE RENDER CALLBACK** (the Architect's [5]): each label's DOM position
  set from its body's projection in the same frame as the draw — never through React or the 10 Hz view, which would trail
  the bodies during playback (the lag class rejected for drei `View`). Hidden when behind the eye or inside the PiP's
  rectangle.

## §5b: what the single-camera structure provides, and how each is kept

| Today | After |
|---|---|
| R3F renders the default camera each frame | The priority-1 callback renders: first person exactly one draw of the same scene with the same camera; ⛔ checked by comparing first-person frames before and after (expected pixel-identical; not yet measured) |
| Neutral tone mapping set on the renderer (`NeutralToneMapping`) | Kept: a renderer setting, applies to both draws |
| `LetteringPiece`'s readiness report (`onReady` after the first frame drawn) | Kept: its callback (priority 0) runs before the render callback (priority 1), as it ran before R3F's own render |
| ⛔ (v1.3.2, missing until the plan review) drei `Grid`'s `worldCamProjPosition` — the point its FADE is measured from (v1.3.3: not the plane's centre; the plane moves only with `followCamera`, off here) — set in Grid's own priority-0 callback from `state.camera`, the SHOT camera (Grid.js:107–112) | Set by the RENDER callback on BOTH grids' materials before each draw, from that draw's camera (the eye, then the shot) — else, seen from the eye, the grid fades round wherever the shot camera stands |
| The focus object's 10 cm grid thickness, set per frame from THE camera's distance (`BenchScene`'s priority-0 callback, from `st.camera`) | ⛔ ONE WRITER: the RENDER callback sets it before each draw from that draw's camera (the eye, then the shot); **the priority-0 write is REMOVED** (v1.2, the Architect's [4]). The HUD's `focusPx` stays the SHOT camera's distance |
| The camera remembered (`CAMERA_KEY`) | The shot camera: unchanged. The eye: its own key |
| The picture's mouse drag turns THE camera | Turns the camera of the current view |
| Any fly input stops playback | First person: unchanged. Third person: flying the EYE never stops it (Carl) |
| The HUD's position and lens (read from the rig) | First person: the rig's, as today. ⛔ **Third person: the PiP's pose and lens** (v1.3, the Architect's [3]: the rig stays where first person left it, a camera Carl cannot see; the PiP's is where switching off puts him, so what A would record from) — plus a "Third person" mark and the eye's distance to the arch |
| A records from the bench camera | First person only; in third person A is refused, said; the switch is refused while recording |
| Playback moves THE camera | First person: unchanged (what plays). Third person: the PiP shows the ARMED camera's own take; the eye stays where Carl put it |
| T1b's gates during a drag (eleven controls) | Twelve: the switch is ignored during a drag |
| The Controls drawer lists the pad and the keys | Gains the right-stick click and T (v1.2, the Architect's [6]) |
| drei `Line` widths from the full canvas size (`Line.js`, `resolution: [size.width, size.height]`) | (v1.1, corrected) In the PiP the axis lines come out ~4× THINNER: the right size for a scaled-down picture. ⚠ What reads HEAVIER in the PiP is drei's `Grid`, whose lines are a fixed pixel width. A cosmetic difference, stated; helpers and paths are never in the PiP |
| One context, its loss and the no-WebGL net | Unchanged: still one canvas, one context |
| `__cameraBench` for the harnesses | Gains `view`, the eye's pose, each track's pose and `held` |
| The client film (D-105's bench route, not built) | First person only; the PiP and helpers never in its picture (layers; the PiP is third person only) |

## Couples to

`bench-chain.ts` (two pure functions), `camera-bench.tsx` (the store's eye rig and view; the render callback; the helpers;
the PiP frame and labels), `bench-timeline.tsx` (no change expected), `camera-pad.ts` (`BTN.RS` read only; no change). No
protected file; no site page; one context. **Harnesses:** the chain check (track poses, `held`, paths through the chain's
units); the page harness (the switch on and off; refused while recording, ignored mid-drag; the eye flies and does NOT
stop playback; A refused in third person; the PiP shows the ARMED camera — Cam 1 armed under a playing Cam 2 — framed as
the first-person view of that camera after switching off (compared downscaled: the PiP is smaller); no helper pixel in
the PiP or in first person; first-person frames unchanged; the labels move in the same frame as the bodies; **switching
off with Cam 1 armed under a playing Cam 2 STAYS on Cam 1** over many frames (v1.2); a SOLO of a covered take: the PiP and
that body ride the soloed take; `CAMERA_KEY` unchanged by third person; **switching off MID-PLAY with Cam 1 under Cam 2
stops and HOLDS Cam 1** (v1.3); **switching off mid-barrel KEEPS the roll** until a fly input (v1.3); in third person the
HUD reads the PiP's camera (v1.3)).

## Not in this note

Fusion-style flat views (top, side) with the frustum (raised 26 October, not chosen); choosing a focus object; the speed
spline editor; signature moves; R2; stills in gaps; an overlay button for the switch (not asked).
