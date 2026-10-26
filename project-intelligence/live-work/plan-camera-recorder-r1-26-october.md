# R1 — THE RECORDER: the camera bench rebuilt as record / stop in clips (plan v2.3, approved by the Architect; for Carl's approval)

**v2.3:** the Architect's fourth review (*"still approved"*): **[D1]** the bumpers are fly inputs, **[D2]** the speed
modifiers off the bumpers, checked; then its fifth (*"approved, and nothing left in it to fix in the build"*): a tidy pass
so earlier text agrees with Carl's answered calls. **v2.2:** the Architect's third review — *"Verdict: approved. I'd send it to Carl as it stands."* — with two build notes
and one caution folded in, marked **[C1]–[C3]**. **v2.1:** the Architect's second review (*"approve once two fixes are made"*): fixes **[B1]** (a punch-in's stop is not
"at the end") and **[B2]** (View while recording stops it first), and its small items **[B3]–[B6]**, folded in.
**v2:** the Architect's review (*"approve once the amendments below are made"*), pasted by Carl, all nine amendments
accepted and folded in, each marked **[A1]–[A9]**. On approval the review is transcribed to
`live-work/architect-plan-response.md` by the Builder, saying so (§2.5: the Architect's window is the authority).

## Context

The keyframe bench confused its user on the pad (A started a hidden clock; one key gave "0.00 / 0.00 s"; X with one
key did nothing). Carl redesigned it: record / stop in CHUNKS, the chunks as DAW CLIPS, a deliberate OVERWRITE arm for
punch-in, new cameras as cuts, two lanes (Recorded / Refined) with COMPING. The design and its structure are approved:
`live-work/structural-note-camera-recorder-26-october.md` **v2.2** (Carl: *"Yes, approved, proceed."*; D-104). This plan
is R1, the recorder itself. R2 (hand-off and return: the download, the Builder's fitting, "Open", the Refined lane,
comping) is the next chunk and is NOT built here — R1 lays the timeline out so a second lane drops in.

The UI is delegated: *"Make it professional looking and intuitive"* — built and shown, not pitched.

## Scope

**R1 builds:** record / stop; clips on the Recorded lane; framing between clips; scrub / park; punch-in with OVERWRITE;
LATER CLIPS KEPT, each join's mismatch shown; NEW CAMERA (cuts; "Cam 1/2/3"); select + DELETE; sequential numbering;
TO THE END; play (the selection, else the chain) as an edit; a fly input stops playback and parks; a hidden tab stops a
recording; fixed-rate sampling; the chain's own version; save once at stop, a failed save SHOWN; the clean UI;
TURNING ON THE PAD (LB / RB — Carl's call, below).
**Not R1:** the Refined lane, Open, comping, fitting, the download (R2); the lock-on; shapes; the overview.

## Files (scope: Carl — *"Authorised, all six"*; all six locked and probed after R1)

| File | Change |
|---|---|
| `components/showcase/bench-chain.ts` **(NEW)** | The chain as PURE functions and types (no React, no three): `Sample` `[t, x, y, z, yaw, pitch, fov]` (units of d, degrees; roll reserved, not sampled); `Clip { id, cam, samples }`; `Chain { kind, version: CHAIN_VERSION, clips, refined: null, comp: null }` ([A2]); `chainDuration`, `clipStarts`, `locate(T) → { clip, local }`, `poseAt(chain, T)` (linear between samples; a JUMP at every join — never smoothed), `joinKind(a, b)` → **a CUT where the cameras differ [A5]**, else a MISMATCH (metres + degrees), `punchIn(chain, T, newClip)` (cut the clip at T, its tail DISCARDED, the new clip inserted after it, later clips kept; **a punch at a clip's very START leaves no samples — that clip is REMOVED, never kept empty [A5]**), `deleteClips(chain, ids)`, `appendClip`, the fixed-rate `Sampler` (one sample per 1/60 s of CLAMPED time; **[C2] at most ONE sample per frame**, stamped with
the clamped time built up so far, so below 60 Hz a long frame gives one sample, never a repeated pose at a repeated time), `parseChain` (shape check; a refusal in words). **[A9] It imports NOTHING at runtime** (`import type` only, no `@/` alias), so Node 25.9.0 (checked) runs it with types stripped. **[A2] THE CHAIN LEAVES ROOM FOR R2:** `Chain { kind, version: CHAIN_VERSION, clips, refined: null, comp: null }` — the two fields RESERVED now; and the RULE: `parseChain` ACCEPTS optional fields it does not know, and `CHAIN_VERSION` moves ONLY for a change an older reader would misread. So R2 never refuses Carl's R1 takes |
| `components/showcase/bench-transport.tsx` **(NEW)** | The transport bar over the picture, bottom left: record, play / stop, start, end, default, new camera, overwrite, delete — lit when active, DISABLED (and shown so) where they cannot act **[A5]** — and the plain-words status line. **[A8]** Inline SVG icons (no emoji glyphs); every icon-only button has an `aria-label` and a tooltip naming its bindings ("Record (A / Space)"). ⛔ **[A3] EVERY overlay (transport, HUD, "?" / "i", drawers) is a SIBLING of the drag surface; the overlay LAYER is `pointer-events: none`, only its controls take clicks**, so drag-to-look works on all bare picture (note §5b; the 14 August case) |
| `components/showcase/bench-timeline.tsx` **(NEW)** | The timeline under the picture: a time ruler, the RECORDED lane (clips as blocks, width = length, coloured by camera, numbered 1, 2, 3; joins marked with their mismatch), the playhead (drag to scrub; click a clip to select, shift-click for several); R2's Refined lane is a second instance of the same lane. The INSPECTOR (right): the selected clip's camera, length, start / end in metres from ground zero |
| `components/showcase/camera-bench.tsx` | `BenchStore` rewritten for the recorder (below); the keys, key table, `toCamera`, the key clock, the 10 s cap and fallback REMOVED; the layout rebuilt (picture first; "?" and "i" drawers for the pad map, keyboard, arch numbers, grid switch, sensor note); the d readout removed. Kept unchanged: the rig, walking pace, truck, grid, focus subdivision, scale, measureArch, the no-WebGL net, the Suspense boundary, View |
| `components/showcase/camera-pad.ts` | Unchanged — turning goes in `camera-bench.tsx`'s intent (`BTN.LB` / `BTN.RB` already defined) |
| `app/proto/camera/page.tsx` 🔒 | The header cut to the title; the bench full width (the long description goes); **[A7] the noindex metadata KEPT** |
| `live-work/scripts/camera-bench-verify-26-october.mjs` | The 31 checks rewritten for the recorder (below); a new `live-work/scripts/bench-chain-check-26-october.mjs` runs `bench-chain.ts` under Node 25 (types stripped) |

## The store (`BenchStore`, still the ONE frame callback)

- **Modes:** `fly` (free; the playhead PARKED at `T`), `rec`, `play`. Scrubbing sets `T` and puts the camera at
  `poseAt(T)`; a FLY INPUT (sticks, triggers, **bumpers [D1]**, lens, move / look keys, mouse drag — past the dead zone) leaves the pose and
  flies, `T` stays parked. A fly input in `play` stops it and parks at the moment reached.
- **[A5] "AT THE END" IS A FACT THE STORE KEEPS** (`atEnd`), never a float compare on `T`, so rounding after a punch-in
  or delete cannot turn "end" into "inside". ⛔ **SET ONLY WHEN NO CLIP FOLLOWS THE PLAYHEAD:** by a stop that APPENDED;
  **[B1]** by a punch-in's stop ONLY if no clip follows the new one (otherwise the playhead stays PARKED inside, and the
  next A needs OVERWRITE again); by ⏭ End; by an empty chain; **[B4]** by a play that reaches the CHAIN's end (a play of a
  selection that ends inside parks inside); **[B5]** by a delete that leaves no clip after `T`, whether or not `T` was
  past the new end. Cleared by a scrub, Y, a step, or a play stopped inside.
- **A / Space:** in `fly` with `atEnd` → `rec` from the CURRENT pose, on the LAST clip's camera (or a new one if NEW
  CAMERA is armed). INSIDE the chain → nothing unless OVERWRITE is armed (the status says so); armed → `rec` as a
  punch-in at `T`, ⛔ **[A1] on the PUNCHED CLIP's camera** (a new one if NEW CAMERA is armed) — never the camera of a
  clip after it. In `rec` → stop: the clip reaches React state and storage ONCE (`punchIn` or `appendClip`), OVERWRITE
  and NEW CAMERA disarm, `T` = the new clip's end.
- **Recording:** samples held in the store (never React state); the `Sampler` takes clamped `dt`; the status shows the
  running length. A `visibilitychange` listener (the one thing outside the frame callback — note 4) calls
  `stopRecording("the tab was hidden")`. **[A6] A PAD LOST while recording** (connected → not, read in the frame
  callback) stops it the same way: *"Stopped: the controller disconnected"*. **[A5] WHILE RECORDING** Delete, NEW CAMERA,
  OVERWRITE, play, scrub, step and clip selection are DISABLED, and the transport shows them so; only A (stop) and View act.
  ⛔ **[B2] VIEW WHILE RECORDING STOPS THE RECORDING FIRST**, then goes to the default view: *"Stopped, then default
  view"*. A jump inside a clip is never recorded; the model allows jumps only at joins.
- **[A5] After a DELETE**, `T` is CLAMPED to the new end, and **[B5]** `atEnd` set whenever no clip remains after `T`.
- **[A4] SPACE / ENTER NEVER FIRE TWICE:** ⛔ **[B3] NO CONTROL IN THE BENCH takes focus on a MOUSE click** (transport,
  timeline clips, the HUD's "?" / "i", the drawers' controls, the grid checkbox): `mousedown` default prevented, so after
  any click Space records. When a control IS focused by Tab, Space / Enter act on THAT CONTROL and the window handler
  ignores them, as it ignores typing in a field. Keyboard focus stays visible. ⚠ **[C3]** Preventing `mousedown`'s
  default breaks dragging on a native `<input type="range">`: the playhead and any slider are built with their own
  pointer handling (as the timeline already plans), never a native range.
- **X / P:** play the selection (selected clips in order, back to back) or, with none, the chain from `T` (from 0 at the
  end). **Y / Home:** `T` = 0, the camera to the first pose; **[A5] on an EMPTY chain, the default view**. **⏭ End / End / D-pad right past the last clip:** `T` = end,
  the camera at the end pose. **D-pad left / right, comma / full stop:** step between clip starts. **View / H:** the default
  view, `T` untouched. **B:** nothing (free). **Delete / Backspace / 🗑:** delete the selection.
- **The status line** (one sentence, what the next press does): *"Ready: A records clip 1 from here"*, *"● Recording clip 3
  (Cam 1) · 4.2 s · A stops"*, *"Parked in clip 1 at 3.4 s · OVERWRITE then A records over the rest of clip 1"*,
  *"⚠ OVERWRITE ARMED · A replaces clip 1 from 3.4 s"*, *"Playing clips 2–3 · any stick stops"*, *"⚠ Not saved: the
  browser's storage is full"*.

## The UI (delegated)

Picture first, full width, the arch's grid as it is. Over it: the transport (bottom left) and a small HUD (top right:
the camera in metres, the lens in mm, "?" and "i"). Under it: the timeline (ruler, Recorded lane, playhead) with the
inspector at its right. Dark neutral greys, one accent (record red), camera colours muted (Cam 1 steel blue, Cam 2 amber,
Cam 3 sage); numbers in tabular figures. Nothing explanatory on the page; the drawers hold it. Keyboard focus visible on
every control.

## Persistence

`c2b-camera-bench-chain-v1`, `{ kind: "c2b-camera-chain", version: CHAIN_VERSION, clips, refined: null, comp: null }`
(**[B6]**, agreeing with [A2]), written when the chain
CHANGES (a stop, a delete) — never during a recording; read through `parseChain` (a refusal shown, the chain not loaded);
a failed write SHOWN in the status line until the next good one. The v1 keyed take is left unread.

## Verification

- `bench-chain-check` (Node, no browser): punch-in mid-clip keeps later clips and drops the tail; **a punch at a clip's
  start removes it [A5]**; delete renumbers; `poseAt` at a join returns the next clip's first pose (a jump, not a blend);
  **`joinKind` names a camera change a CUT [A5]**; `Sampler` fed 144 Hz frames for 2 s gives 120 samples (± 1), and
  60 Hz the same; **[C2] 30 Hz gives ≈ 60, no two stamped at the same time**; **[A9] a 0.5 s frame advances the clip by 0.1 s (the hitch)**; `parseChain` refuses a wrong kind /
  version / shape in words, and **ACCEPTS an unknown optional field [A2]**.
- The page harness (stubbed pad, keyboard): record 2 s → clip 1 ≈ 2 s; A again appends clip 2 from where it stopped;
  framing between clips moves the start (mismatch shown); scrub into clip 1 + A alone → nothing, status says why;
  OVERWRITE + A → clip 1 cut, the new clip 2, the old clip 2 now 3; NEW CAMERA → "Cam 2", play cuts; select + Delete
  renumbers; ⏭ End; a stick during play stops and parks; a dispatched `visibilitychange` stops a recording; clicking
  transport buttons moves no camera (the drag sibling); a `localStorage.setItem` that throws shows "Not saved"; a reload
  keeps the chain; the walk / truck / home / grid checks kept; no console errors. **Added by the review:**
  **[A1]** a punch into a Cam 1 clip with a Cam 2 clip after it records on Cam 1; **[A3]** a drag on bare picture turns
  the camera, a click on EVERY overlay control (transport, HUD, "?", "i", drawers) does not; **[A4]** with a transport
  button focused by Tab, Space presses that button and starts NO recording; after a mouse click on a button, Space starts
  EXACTLY ONE recording (and Enter the same); **[A5]** delete the last clip → `T` clamped, A records (not "inside");
  while recording, Delete / New camera / Overwrite / play / scrub / select do nothing and show disabled; Y on an empty
  chain → the default view; **[A6]** the stub pad disconnecting mid-recording stops it, status says why.
  **Added by the second review:** **[B1]** OVERWRITE, A (start), A (stop) with a clip FOLLOWING → a third A does
  nothing, and the status says why; **[B2]** View during a recording → the recording stopped, and NO clip holds a step
  between samples FASTER THAN 25 m/s (**[C1]** a SPEED test, not a distance: each step divided by its time. On the pad RB
  now turns, but Shift with E still reaches ≈ 20 m/s on the keyboard, and a slow 0.1 s harness frame moves ≈ 68 cm, both
  honest, so the 25 m/s limit stands; a jump to the default moves in
  zero time and fails clearly); **[B3]** the [A4] check extended to a
  clicked timeline CLIP and the grid CHECKBOX (Space then records once); **[B4]** playing a selection of clip 1 parks
  inside (A then needs OVERWRITE); **[B5]** deleting the clips after `T` with `T` exactly at the new end → A records.
- `tsc`, lint at baseline (1 error, 0 warnings), one image of the built bench to Carl, then his hands on the pad.
  **[A9]** Servers stopped (by PID, the port checked free) before any checkpoint.

## Carl's two calls (answered)

1. **TURNING ON THE PAD — Carl: "LB / RB".** Hold LB to turn left, RB to turn right, at the rig's look rate (GTA's
   aircraft yaw). The SLOW / FAST modifiers come OFF the bumpers until sensitivity (item 3); Shift / Alt keep them on the
   keyboard. In `camera-bench.tsx`'s intent (`turn` = RB − LB + the arrow keys); `camera-pad.ts` unchanged. The pad
   guide and tooltips updated; harness: LB / RB turn the camera, the position unchanged. **[D1]** (the Architect's
   fourth review, *"still approved"*) **LB / RB ARE FLY INPUTS** — added to the list (sticks, triggers, BUMPERS, lens,
   keys, mouse drag): RB while parked leaves scrub and turns, the playhead still parked; RB during playback stops it.
   **[D2]** The speed expression loses its RB / LB terms; check: RB held with the left stick full forward moves at
   walking pace (≈ 1.4 m/s, not ≈ 4.2), and turns at 75°/s (not × 1.5). ⚠ For Carl: the turn is the rig's 75°/s, already
   called too fast, and a bumper is on / off (no light press) — it returns at item 3, sensitivity.
2. **SCOPE — Carl: "Authorised, all six."** **[A7]** — `components/showcase/camera-bench.tsx` and `camera-pad.ts` (open now only
   under item 2, the scale, which is finished), `bench-chain.ts`, `bench-transport.tsx`, `bench-timeline.tsx` (new) and
   `app/proto/camera/page.tsx` (locked). ALL LOCKED AND PROBED after R1. `chunk-scope.json`'s stale chunk name and
   `_comment` (D-051 / home-s2-copy) brought up to date when the scope is written.
