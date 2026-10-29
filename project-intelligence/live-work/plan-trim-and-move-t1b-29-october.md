# Plan: T1b, TRIM AND MOVE: editing clips on the camera bench's timeline (`/proto/camera`). 29 October 2026, v1.4

**Status:** PROPOSED, **the Architect: *"With them made, I'd approve"*** (review 3). Nothing built. **For:** Carl to approve.
**Builder.**
**Versions.** **v1.4:** review 3's six wording corrections (where the take's hold goes; the first ending wins, a ref; the
order never lowered; the click after a cancel; "trimmed" for the take; a stale sentence). No design change. **v1.3:** the Architect's review of v1.2 folded in (*"nearly there"*: two must-fix, three should-fix, two
minor; appended verbatim to the same response file) and Carl's call on a new Builder's take (*"Keep my trim"*). **v1.2:** the Architect's review folded in (six must-fix, six should-fix; saved verbatim,
`architect-plan-response-trim-and-move-29-october.md`; every cited line checked at `5c221e0` first), and Carl's two answers
to its "your call" items. **v1.1:** Carl's answers on precedence and snapping. **v1:** the plan.
**Record:** D-104's tail, 29 October. **Approved in principle already:** note `structural-note-camera-recorder-26-october.md`
v3.1. Trim (`in` / `out`, non-destructive) and move along its track only were Carl's answers 1 and 2. [C9] sets the limits.
T1b was split out as "the editing" (answer 9).

## Context

Carl, on the bench: *"if i put the mouse on the end and in the middle of the clip it turns into 2 arrows on a horizontal
line. if i left click the playhead [jumps] there. This functionality is also on the time ruler. It should just be on the
time ruler. When on the clip i should be able to left click and drag to trim."* His case is the Vader clip (13.3 s). The
camera clears the arch just after 8 s, so he cuts the end there and records clip 2 flying up and over. On moving: *"Creating
a space means we can put stills of text and other things in."* (The stills are RAISED and NOT in this chunk.)

**Today:** the whole track area (ruler, joins strip, every row) carries `cursor-ew-resize` and scrubs on a pointer-down
anywhere but a clip. A clip button selects on click. Nothing drags. The chain already stores `start`, `in`, `out` and
`order` per clip (T1a). **No chain version change is needed:** every edit below writes fields v3 already has (the
Architect confirmed).

## The rules

| | Rule |
|---|---|
| **Scrub** | The time RULER only (click or drag). Rows and the joins strip no longer scrub. **A click on a row's bare background clears the selection** (Carl: *"Clear the selection"*). |
| **Select** | A press on an UNSELECTED clip selects it at once (Resolve; so the inspector's trim readout shows during the drag). **The click that follows toggles ONLY if the clip was ALREADY selected at the press and there was no drag** (today's toggle off); every other click after a press is suppressed: after a drag ([R6]), after a press that selected it (v1.3, review 2 [1]: else one click would select, then deselect), and **after a drag that was CANCELLED** (Esc, a hidden tab, a lost pointer; v1.4, review 3 [4]: the eventual release still fires a click). Shift / ctrl / cmd adds or removes (unchanged). **A drag edits only the pressed clip**, even with several selected; there is no group move. |
| **Trim, the tail** | Drag a clip's right edge: `out` changes, `start` fixed. Limits: `out ≤` the source's length (samples recorded / the shape's length); length ≥ 1/60 s ([C9]). Dragged back out, the footage returns (non-destructive). |
| **Trim, the head** | Drag the left edge: `start` and `in` move by **ONE shared amount** δ, so every kept frame stays at its timeline time (Resolve's head trim). δ is clamped ONCE: `δ ≥ −min(in, start)` (whichever runs out first) and `δ ≤ length − 1/60 s` ([R10]: clamped separately, every kept frame would shift). |
| **The picture while trimming** | *"The frame at the edge"*: the dragged CLIP's own pose at the edge (Resolve's trim view), not what plays there. The playhead follows the edge and stays there on release. |
| **Move** | Drag the body more than 3 px: `start` changes, along its own track only. `start ≥ 0`. The playhead stays; the picture updates as clips pass under it. If the shot gets shorter than a parked playhead, the playhead clamps to the new end, as Delete does ([R12]). |
| **What shows where a moved clip overlaps** | Between tracks, the higher track plays (T1a's rule, Carl: *"that takes precedent"*). **On the same track (Carl: *"Only when it lands on another clip"*):** dropped over another clip on its track, the moved clip comes to the TOP (`order` above every clip's), so what Carl placed is what he sees. Dropped into empty space, `order` is unchanged. **Let go under one frame (1/60 s) from where it started: NOTHING changes and nothing is saved**, so a shaky click on a covered take promotes nothing. The preview during the drag uses the same rule, so what shows while dragging is what lands. |
| **Snapping** | ON by default; **N toggles it**, also mid-drag (Carl: *"snapping always on and the N to turn it off/on"*); a "Snap" indicator on the timeline shows the state. An edge (for a move, the clip's start AND end) locks within 8 screen px to: **the playhead WHERE IT WAS AT THE PRESS**, 0, and every start and end of **every OTHER clip** on every track ([R5]: the live playhead follows the trim edge and would always win; the clip's own edges would hold it in place). Carl's workflow: park at 8.0 s on the ruler, drag the tail onto it. A thin line marks the snap. N is unused on the bench; ignored while typing in a field. |
| **The scale during a drag** | **The timeline's span and its pixel-to-seconds conversion are FROZEN at the press** ([R4]: the span is the chain's end × 1.04, so a lengthening drag would slide the edge away from the cursor, compounding on every move). They update on release. |
| **Other inputs during a drag** | **IGNORED** ([R3]), the Builder's choice: A / Space (record), Delete / Backspace, P / X (play), Home / Y, End, comma / full stop, H / View, Start / C, the ruler, the sticks, triggers, D-pad, bumpers and the mouse look. ⛔ So nothing can record, delete the dragged clip, or move the camera or playhead under a drag. The status says *"Trimming clip 1 · Esc cancels"* (or *"Moving"*). **Esc cancels**; a lost pointer or a hidden tab cancels (one owner for all four endings: the §5a section). |
| **A new Builder's take during a drag** | **It WAITS** (v1.3, review 2 [3] and the minor on :563–564): `syncBuilderTake` is gated while a drag runs, as it is while recording, and lands on the first frame after the release. ⛔ **The check goes IN THE EXISTING EARLY RETURN** (`camera-bench.tsx:531`, beside `this.rec`), BEFORE `builderPlaced = t.version` (:533) (v1.4, review 3 [1]: placed after it, the version would be marked placed during the drag and never land). ⛔ So the dragged clip's id cannot vanish mid-drag, and the take's `mode = "fly"` / `T = start` cannot move the playhead off the edge under the trim view. `applyEdit` still treats a missing id as NO CHANGE (defensive). |
| **A new Builder's take over a TRIMMED one** | **Carl: *"Keep my trim"*.** **For the take, "trimmed" = `in > EDGE_S` OR `out < sourceLength − EDGE_S`** (v1.4, review 3 [5]: so a head-only trim is kept too). The new version lands with the old take's `in` and `out` (seconds; `out` clamped to the new length, `in` kept while it leaves ≥ 1/60 s), the old take's `start` as today. An untrimmed old take: the new one arrives whole (today). The status says *"take 5 placed, your trim kept"*. ⚠ If the new take's timing changes, the cut falls at a different point along the move: Carl looks at the cut again. |
| **A trimmed shape, its numbers edited** | *"Keep the trim"*: **"trimmed" = `out < shapeLength − EDGE_S`** ([R11]: a tail dragged back to full length counts as untrimmed). A trimmed `out` is kept (clamped to the new length); an untrimmed clip follows its new length. ⚠ The trim is kept IN SECONDS: a PACE change moves where along the path the cut falls. Said in the inspector when it applies. |
| **Saving** | ONCE, on release (one storage write per edit; note 4a's principle). A cancel saves nothing. |

## ⛔ §5a, named: the draft (the Architect's [R1], [R2])

**A drag holds an EDIT, never a copy of the chain.** `Edit = { id, kind: "head" | "tail" | "move", T, grab, anchorT, span }`
(v1.3, review 2 [4]):
- **`T` is ABSOLUTE, per kind:** head → the new START; tail → the new END; move → the new START. Applying an edit to a
  chain it has already been committed to changes nothing.
- **`grab`** (move only): the pointer's time minus the clip's start AT THE PRESS, so the clip stays under the hand.
  A move snaps on BOTH the new start and the new end (start + length), the nearer target winning.
- `anchorT` the playhead at the press (the snap target); `span` the frozen scale.
- The order raise is `max(own, the OTHER clips' highest + 1)` (v1.4, review 3 [3]): it never LOWERS a clip already on
  top (its "take N" would drop for no reason), and a repeated application does not bump it again.

- **⛔ ONE OWNER: THE PAGE (`CameraBench`)** (v1.3, review 2 [2]: in v1.2 the edit lived in the timeline, and Esc (the page's
  keyboard) and a hidden tab (the store) could not reach it). The page already holds the store and the keyboard handler.
  It owns the edit (React state) and handles **every way a drag ends**: pointer up (commit), **Esc** (its keyboard handler),
  a **hidden tab** (its own `visibilitychange`), a **lost pointer** (the timeline reports `lostpointercapture` /
  `pointercancel` as `onEditEnd(false)`). On every change the page pushes it to the store (`store.setEdit(edit | null)`);
  `store.endEdit(commit)` is called by the page only.
- **⛔ THE FIRST ENDING WINS** (v1.4, review 3 [2]): on release the browser fires `pointerup` then `lostpointercapture`
  back to back, before React re-renders, so the page sees `onEditEnd(true)` then `onEditEnd(false)`. **Whether a drag is
  live is held in a REF on the page** (`editRef`, set at the start, cleared by the first ending); a later ending finds it
  clear and does nothing. The React state is for drawing only. **The page's keyboard handler (registered once, keyed
  `[store]`) reads `editRef`**, never the state, which it would see stale.
- **The timeline is CONTROLLED:** it receives `edit` and reports `onEditStart`, `onEditMove`, `onEditEnd`. It acts on pointer
  moves only while `edit` is non-null and names its own clip, so after a cancel a stray move cannot push the edit back. It
  keeps the captured `pointerId` in a ref and **releases the capture when `edit` turns null** (an effect), whoever ended it.
- **Everything else is DERIVED** by `applyEdit(chain, edit)` (pure, `bench-chain.ts`) from the CURRENT chain, every time it
  is read. The timeline draws its blocks, joins, gaps and the playhead from `applyEdit(chain prop, edit)`. The store's
  picture reads `applyEdit(this.chain, edit)`. **On release the store applies the edit to its chain AS IT IS THEN** and
  commits once. ⛔ So any change made to the chain during a drag survives the release: the release does not commit a chain
  copied at the press ([R2]). (The Builder's take does not land mid-drag at all: it WAITS, the rules table.)
- **The new channel ([R1]):** the timeline's drawing reads `applyEdit(chain, edit)` instead of `chain` while a drag runs.
  It is a DRAWING input only. The committed `chain` alone feeds storage, the clash check (`camera-bench.tsx:1140`, ~4,000
  poses per shape, kept on the committed chain, never per pointer move) and everything else. Joins and gaps for the drag
  are computed in the timeline from the derived chain (`joinsOf` and `gapsOf` are pure; `metresPerD` passed in).
- **Rejected:** (a) a draft CHAIN copied at the press (the Architect's [R2]: a release could silently remove a change made
  during the drag); (b) committing on every pointer move (writes the whole chain to `localStorage` up to 60 times a second;
  re-runs the clash check each time); (c) the store owning the edit and the timeline reading it through the 10 Hz view
  (the edge would lag the cursor).

## Step 1: `components/showcase/bench-chain.ts` (pure, checked under Node)

- `trimClip(chain, id, edge: "head" | "tail", T)`, `moveClip(chain, id, start)`: the rules above. Never an empty clip.
- `moveClip`'s order rule: top only if the new span overlaps another clip on its track; unchanged otherwise. A move under
  1/60 s returns the chain unchanged (the same object).
- `applyEdit(chain, edit)`: dispatches to the two above. A missing id returns the chain unchanged (v1.3). Idempotent: `T`
  absolute, the order raise over the other clips.
- `snapTime(T, targets, tolS)`; `snapTargets(chain, exceptId, anchorT)`: 0, the anchor, every OTHER clip's start and end.
- `replaceShape`: the trimmed rule above. `in` kept while it leaves ≥ 1/60 s, else 0.
- Nothing else moves: `sourceAt`, `poseAtT`, `joinsOf`, `gapsOf`, `takesAt` already read `start` / `in` / `out`.

## Step 2: the store, `components/showcase/camera-bench.tsx`

- `setEdit(edit | null)`, `endEdit(commit: boolean)`. While an edit is set: the gates in the rules table (record, delete,
  transport, fly; each says nothing, the status already does); the picture from `applyEdit(this.chain, edit)`.
- **The trim view:** `T` = the edge's time **of the clip AFTER `applyEdit` has clamped it** (v1.3, review 2 [5]: never the raw
  `edit.T`, which runs past the source's length or the 1/60 s floor), and the frame is `clipPoseAt(edited clip, edge)`, the CLIP's pose (at a tail
  edge the half-open rule would show the NEXT clip). On release the picture is what plays at `T`: at a trimmed tail, the
  next clip or the gap hold of this clip's last frame. The playhead stays on the edge (the Architect: A then records clip 2
  from exactly there).
- The playhead clamp after a move ([R12]). (The hidden-tab cancel is the PAGE's, above.)
- `syncBuilderTake`: returns early while an edit is set (it lands after the release); over a trimmed old take it carries
  `in` / `out` (Carl's *"Keep my trim"*) and says so.
- N toggles snapping (the keyboard handler; a store flag the timeline reads).
- `__cameraBench` gains `editing` and `snap`.

## Step 3: the timeline, `components/showcase/bench-timeline.tsx`

- The scrub handler and its pointer capture move to the RULER strip. `cursor-ew-resize` leaves the track. Bare row:
  click clears the selection.
- Each clip: two 6 px edge zones inside the block (`cursor: col-resize`); body default, `grabbing` while moving. A clip
  narrower than ~18 px shows its edges only when selected.
- ⛔ **The DOM order of the clip buttons is STABLE** (chain order, not sorted by `order`): stacking stays on
  `zIndex: 1 + order` ([R7]: re-sorting mid-drag re-inserts the dragged button, which may drop pointer capture; the
  Architect has not verified that, and the harness checks it).
- **The playhead is drawn from the CLAMPED draft edge while trimming** ([R8]: the view's `T` arrives at 10 Hz and would lag
  the edge; v1.3: the clamped edge, not the pointer).
- The readout at the edge: `8.23 s · 8.2 of 13.3 s` (trim) or `starts 4.10 s` (move). The snap line. The "Snap" indicator.
- The inspector: Length `8.2 s of 13.3 s` when trimmed, with its In / Out; the pace caveat on a trimmed shape.

## §5b: what the current structure provides, and how each is kept

| Today | After |
|---|---|
| Click anywhere on a row parks the playhead there | The ruler does it (Carl's instruction). Rows: click clears the selection (Carl's yes) |
| A clip click selects; shift adds | Kept; a press selects an unselected clip; the post-drag click suppressed; 3 px separates click from move |
| The track's pointer capture made a scrub survive leaving the strip | The ruler captures its own scrub; a clip captures its own drag; DOM order stable so capture holds |
| `[A5]` disabled while recording | Drags too; and the reverse: recording disabled while dragging |
| `[B3]` controls never take focus on mousedown | Kept on clips and the ruler |
| One save per change | One per drag, on release; a cancel or a sub-frame move saves nothing |
| The clash check on chain change only | Kept on the COMMITTED chain only |
| Covered takes reachable through the inspector ([E4]) | Kept. ⚠ A covered take's hidden edge cannot be grabbed where a newer take lies over it (take lanes fix that; not asked today) |
| The Builder's take (`syncBuilderTake`) lands whenever its version changes, moving the playhead to its start | Kept, but it WAITS while a drag runs and lands after the release (v1.3). Over a trimmed old take the new version keeps the trim (Carl's *"Keep my trim"*) |
| Chain v3 on disk; v2 / v1 migration | Unchanged; no new field |

## Checks

- **`bench-chain-check`** (Node): tail limits; **a head dragged past BOTH limits** (into `in = 0` and into `start = 0`,
  each first) leaves the pose at every kept `T` IDENTICAL (≤ 1e-9); a move shifts poses by exactly the move; the 1/60 s
  floor; the order rule (onto a clip: top; into space: unchanged; under a frame: the same chain object); `replaceShape`
  keeps / clamps a trim, follows an untrimmed clip, and treats a tail dragged back to full as untrimmed; `snapTime` and
  `snapTargets` (the dragged clip's own edges excluded; the anchor, not the live playhead).
- **`camera-bench-verify`** (Playwright, dev server): the ruler scrubs; a row click clears the selection and does NOT move
  the playhead; a clip click selects without moving it; a tail drag trims (stored `out`), the playhead at the edge, **the
  clip still selected after release**; a snap to a parked playhead lands exactly on it; N off: no snap; Esc restores; a
  move, onto a clip (top) and into space (order kept); **pointer capture held through an order change mid-drag**;
  Space / Delete / P pressed mid-drag do nothing; **ONE click on an unselected clip leaves it selected** (v1.3);
  **Esc, a hidden tab and a lost pointer each cancel, release the capture, and a following pointer move does not restart
  the drag** (v1.3); **a Builder's take version changed mid-drag, on another clip AND on the dragged clip itself: it waits,
  the playhead stays on the edge, and it lands after the release with the trim kept** (v1.3); a tail dragged past the
  source's length: the playhead stops at the clamped end (v1.3); a reload keeps the edits; **ONE write of the CHAIN's key per drag** ([R9]: the camera key is written every 0.1 s while the
  camera moves, so it is not counted).
- ⚠ **NOT WATCHED:** how the drag feels under Carl's own mouse (Playwright's pointer is not Carl's). Carl tries it.
- `tsc`; `npm run lint` at the baseline (1 error, 0 warnings).

## Scope and servers

`bench-chain.ts`, `camera-bench.tsx`, `bench-timeline.tsx` are **LOCKED** (27 October). Carl opens them at approval
(`chunk-scope.json`); the Builder does not. The two harnesses live in `live-work/scripts/` (open). The dev server is
running (started 29 October for Carl); stopped by PID before any checkpoint.

## Carl's answers (29 October)

1. Precedence: between tracks the higher plays; on a track, **"Only when it lands on another clip"** (the rules table).
2. **Snapping always on; N toggles it.**
3. A bare-row click: **"Clear the selection"**.
4. A new version of the Builder's take over a trimmed one: **"Keep my trim"**.

## Not in this chunk

Take lanes; per-track clip numbers; moving between tracks; track reordering; stills or text in gaps (RAISED 29 October);
the third-person view and the PiP (their own §5a note, next); ripple; slip; undo.
