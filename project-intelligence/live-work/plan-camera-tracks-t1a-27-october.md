# Plan: CAMERA TRACKS, T1a — THE MODEL (`/proto/camera`). 27 October 2026, v2

**For:** Carl, for approval (the Architect: *"With E1 to E4 in the plan, I have nothing further. It goes to Carl."*).
**Status:** PROPOSED. Nothing built. Under the note `live-work/structural-note-camera-recorder-26-october.md` **v3.1**.
Copied to `live-work/plan-camera-tracks-t1a-27-october.md`; the review transcribed in
`live-work/architect-plan-response-camera-tracks-27-october.md` (Review 3, by the Builder).

**Versions.** **v2:** the Architect's review (*"Approve with amendments"*): E1–E4 and the should-amends folded in, marked.
**E1 confirmed by number before folding** (R1's chain code under Node: at a boundary − `EDGE_S` R1 picks the earlier clip
and the v2 rule the later; at the boundary and at ± 2·`EDGE_S` both agree). **v1:** the plan.

## Context

Carl, having flown R1: *"The option to add another camera(s). This puts Cam2 in the same take lane. We should have the
functionaliry line in Davinci Resolve and put it in its own take lane and be movable. ... If we put the playhead where we
want it, select another camera and record Cam 2 takes precedent over Cam 1. Which means cuts can be made easier and Cam 1
is non destructive."* R1 is ONE lane, clips end to end; "New camera" only labels the next clip; a punch-in discards a tail
and shifts what follows. T1a replaces that MODEL: a track per camera, clips placed in time, the top track plays, a
recording over a clip is a new take on top, nothing destroyed. Carl flies T1a before T1b (the editing) goes on top
(answer 9). Files named: *"bench-chain.ts, bench-timeline.tsx, bench-transport.tsx and app/proto/camera/page.tsx
Authorised to use"*; `camera-bench.tsx` and `camera-pad.ts` already open.

**T1a builds:** the v2 data, `sourceAt`, the three joins, gaps and their hold, the migration (with its parity proven),
tracks and arming (header + Start), record at the playhead, takes on top, run-on covers, solo play of a selection,
Overwrite retired. **Not T1a (T1b):** take lanes (expand), move with snapping, trim's UI, per-track numbers. **Not T1:**
track reordering; the PiP (T2); R2.

## 1. The data and the rules — `bench-chain.ts` (pure, Node-checked, no runtime imports: [A9] kept)

- **`CHAIN_VERSION` 2.** `Chain = { kind, version: 2, tracks: number[] /* cams, bottom → top */, clips: Clip[], refined: null, comp: null }`.
  `Clip = { id, cam, start, order, in, out, samples }` (v3-1): `start` seconds on the shot's clock; `order` the recording
  order (unique, rising); `in` / `out` seconds within the samples. **T1a always writes `in` 0, `out` = the samples' length**
  (trim is T1b) but every rule below READS them, so T1b changes no rule.
- **Spans, half-open with `EDGE_S` ([C5]):** a clip covers T when `start − EDGE_S ≤ T < end − EDGE_S`, `end = start + (out − in)`;
  the pose at T is `poseInClip(clip, in + (T − start))` (R1's linear sample lookup, kept).
- **`sourceAt(chain, T)` (v3-2), THE ONE RULE:** tracks top → bottom; inside a track the highest `order` covering T;
  none → `null` (a gap). Playback, scrub, joins, gaps, the status and the harness all read it; nothing keeps its own copy.
- **⛔ [E1] THE ±`EDGE_S` BAND, STATED:** inside `[boundary − EDGE_S, boundary)` the v2 rule deliberately rounds to the
  LATER clip (R1 rounded to the earlier there; R1's only ambiguity in that band was its 2e-15 s sums). Every "just before"
  / "just inside" evaluation below uses the named offset **`PROBE = 2·EDGE_S`**, never a bare "just".
- **`poseAtT(chain, T)` → `{ pose, clip | null, gap }`:** `sourceAt`, else the GAP HOLD (answer 4, [C6]): the picture at
  the latest clip end ≤ T (evaluated by `sourceAt` at that end − `PROBE`), else the first clip start ≥ T; an empty chain
  → null.
- **`editPoints(chain)`:** every clip start and end, sorted, deduplicated within `EDGE_S`. **`joinsOf(chain, metresPerD)`
  ([C2]):** at each edit point p compare what plays at p − `PROBE` and at p; ⛔ **a GAP EDGE IS NOT A JOIN** (null on
  either side: the gap is shown on its own); a different clip on a different cam → **CUT**; a
  different clip on the same cam → **MISMATCH** (metres, degrees between the outgoing clip's pose AT that time — mid-move
  if it is covered — and the incoming's): this one rule yields all three kinds (between tracks; a new take's start / end
  over an older take; two touching clips). **`gapsOf(chain)`:** the `[a, b)` spans `sourceAt` returns null in, up to the
  end. ⛔ **`joinsOf` / `gapsOf` / `editPoints` are computed ON CHAIN CHANGE (memoised on the chain), never per frame**;
  `sourceAt` per frame is a linear scan and fine.
- **`takesAt(chain, T)`** ([E4]): every clip covering T, top track first, newest first: for the inspector (§4).
- **`chainEnd(chain)`** = the latest clip end. **`addTrack(chain)`** → `max(tracks) + 1` on top. **`recordClip(chain, cam,
  T, samples)`** → a clip at `start = max(0, T)` ([C9]), `order = max + 1`, `in 0`, `out` its length; ⛔ never an empty clip
  (a stop within `EDGE_S` of the start records nothing, as R1). `deleteClips` kept (by id; tracks stay, Cam 1 always).
- **`soloPose(clip, T)`** for a selection's solo play (answer 8): the clip's own pose, precedence ignored.
- **`parseChain` reads v1 AND v2.** v2 checked (every cam in `tracks`; `start ≥ 0`; `0 ≤ in < out ≤` the samples'
  length; `order` integers, unique; samples as R1's checks). **v1 → `migrateV1`:** clips laid end to end at their summed
  starts (R1's `clipStarts` arithmetic), `order` = index, `in 0`, `out` the length, `tracks` = the cams used (Cam 1
  always). Returns `{ chain, migrated: true }` for a v1. Unknown optional fields still accepted ([A2]).
- **`v1PoseAt(v1Clips, T)` — R1's `locate` + `poseAt`, COPIED VERBATIM** (from `fb86684`), used ONLY by the migration's
  parity check (below). ⚠ A second pose function by design, named `v1…` and commented so: the reference the migration is
  measured against, never a playback path.
- **Retired:** `locate`, `clipStarts`, `appendClip`, `punchIn`, `joinKind`, `maxCam` (R1's chain arithmetic). `Sampler`,
  `clampDt`, `EDGE_S`, `MAX_DT`, `SAMPLE_HZ`, `poseInClip`, `samplePose`, `newClipId` kept unchanged.

## 2. The migration, PROVEN IN CARL'S OWN BROWSER — `camera-bench.tsx` (`loadChain`)

- Keys: **v2 `c2b-camera-bench-chain-v2`** (read first; when present, v1 is NOT read). ABSENT → read **v1
  `c2b-camera-bench-chain-v1`** → `migrateV1`.
- ⛔ **[E3] A v2 that EXISTS but cannot be read** is kept aside (`…-v2-refused`) and the bench starts EMPTY, saying so in
  plain words and naming BOTH kept copies (the refused v2 and v1). ⛔ **It NEVER falls back to v1** (that would present
  R1's state as current and the next save would write it over Carl's v2 work).
- ⛔ **THE PARITY CHECK RUNS ON THE REAL CHAIN ([C5], "by number"):** before the migrated chain is used, `v1PoseAt` vs v2
  `poseAtT` at EVERY sample time, EXACTLY at every clip boundary, and at **boundary ± `PROBE` (2·`EDGE_S`)** ([E1]: NOT
  at ± `EDGE_S`, the band where the two rules deliberately differ); "identical" = every field within **1e-9**. ✔ → v2
  written; the status says *"Your R1 recordings were carried over to tracks: N clips, checked at M moments, identical.
  The old copy is kept."*
- ⛔ **[E2] ✖ → the bench STILL SAVES TO v2** (the migrated chain, then every new take: Carl's new work is never lost),
  v1 stays untouched (nothing of R1 lost), and a PERSISTENT line stays on screen, *"Carried over with differences:
  largest X (the old copy is kept)"*, until Carl decides. ⛔ Holding saves silently is ruled out.
- **A failed v2 write** ([C7]): shown in plain words; the bench runs in memory; the next good save writes v2.
- ⛔ **v1 is NEVER removed by the bench** (answer 10, [D5]). ⚠ The doubling counts against the quota (5,242,880
  characters, measured): the carry-over status also shows v1's size and the share of the quota both copies use.
- A v2 that cannot be read is kept aside unread (`…-v2-refused`), as R1 does.

## 3. The store — `camera-bench.tsx` (`BenchStore`, still the ONE frame callback)

- **State:** the chain, `T`, the selection, `armedCam` (default the TOP track), the recording `{ sampler, at, cam }`, the
  play queue. `atEnd` becomes derived (`T ≥ chainEnd − EDGE_S`). **Retired:** `armed.overwrite`, `armed.newCam`,
  `toggleOverwrite`, `camFor`, the "inside the chain" refusal.
- **A** (pad A / Space / the button): recording → stop; playing → stop; otherwise **record on `armedCam` at T**, always
  (answers 6, 7: no Overwrite; a recording over or INTO a clip makes a new take on top). On stop: `recordClip`, then
  `T` = the take's end; the R1 HALT where a clip ends is KEPT.
- **Add a camera** (the transport button, was "New camera"): `addTrack`, arms it. **Arm** a track: its header button.
  **Start** (pad, `BTN.START`; keyboard twin **C**): cycles `armedCam` bottom → top → bottom; ⛔ **while recording it does
  nothing and the status says why** ([C10]). Adding a track is on screen only (answer 3).
- **Play:** nothing selected → from T (or 0 at the end) to `chainEnd`, WITH PRECEDENCE, holding through gaps (status
  *"Gap"*); a selection → each selected clip SOLO, in time order (answer 8). A stick stops play and parks (R1).
- **Scrub / Y / End / step:** scrub to any T in `[0, chainEnd]`, the camera held at `poseAtT` (the gap hold included);
  End → `chainEnd`; **, .** step between `editPoints` (all tracks).
- **Delete:** the selection; nothing ripples, so deleting a middle clip leaves a GAP (shown).
- **The armed track on load:** the TOP track (the Builder's default, stated; the status names it before A). Carl may
  prefer the last-armed track saved with the chain (cheap); his call.
- **The status line**, plain words, no em dashes: *"Cam 2 armed · A records at 3.2 s, over Cam 1's clip 2: Cam 2 will
  play there"*; *"Cam 1 armed · A records at 3.2 s, under Cam 2 (Cam 2 plays there)"*; *"Cam 1 armed · A records at
  3.2 s, a new take over clip 2 (the old is kept)"*; *"At the end · A records on Cam 1"*; *"● Recording Cam 2 · 1.4 s · A
  stops"*; *"Playing the edit · Gap"*.
- **`window.__cameraBench`** extended: `tracks`, `armedCam`, clips `{ n, id, cam, start, order, in, out, len }`, `joins`,
  `gaps`, `source` (what plays at T), `carriedOver` (the parity result).

## 4. The UI — `bench-timeline.tsx`, `bench-transport.tsx`, the drawers

- **Timeline:** the ruler, the JOINS row (from `joinsOf`: CUT, or the mismatch's metres · degrees), then **ONE ROW PER
  TRACK, top track first**, each with a header: *"Cam 2"* and an ARM button (red when armed). Clips at `start`, width
  `out − in`, coloured by cam; inside a row a newer take draws OVER an older one (z by `order`). **Gaps** hatched across
  the rows. The recording's red block on the ARMED row at its start.
- ⛔ **[E4] EVERY TAKE REACHABLE WITHOUT DELETING ANYTHING:** the INSPECTOR lists every take under the playhead
  (`takesAt`: top track first, newest first, the one that PLAYS marked), each clickable to select it. So a take wholly
  covered by a newer one is selected (and played solo) by parking the playhead over it and clicking its line. (v1's
  "delete the newer take to reach it" was destructive: against *"Non destructive is always better"*.) T1b's take lanes
  make it visual.
- **Numbering in T1a:** clips numbered 1, 2, 3 by start time across all tracks (R1's sequential rule); per-track numbers
  are T1b.
- **Inspector:** the selected clip's cam, take (`order`), start, length, from / to in metres (R1's).
- **Transport:** Overwrite REMOVED; *"New camera"* → **"Add a camera track"**; ⚠ the stale *"D-pad right past the last
  clip"* tooltip → **"End"** (flagged since this morning). `TransportView.armed` → `{ cam }`.
- **The "?" drawer:** Start = cycle the armed track (keyboard C); "How it records" rewritten for tracks and takes.
- `page.tsx`: the header comment only (R1 → tracks).

## 5. §5b — what R1's structure provides, and what happens to each

As the note's §5b table (v3.1), and these, specific to the code:
| R1 provides | Fate |
|---|---|
| `atEnd` as a STORED fact ([A5], [B1], [B4], [B5]) | DERIVED from `T` and `chainEnd`; its four R1 cases reduce to the one comparison |
| A inside the chain does nothing without Overwrite | Retired (answers 6, 7): A always records |
| `camFor` (a punch-in continues the punched clip's camera, [A1]) | Retired: the ARMED track decides, shown in the status before A |
| The join row from neighbouring clips (`joinKind`) | From `joinsOf` (what PLAYS) |
| ⛔ **The playhead stays PARKED at the scrubbed moment while Carl re-frames** (note v2.1): now it decides WHERE A TAKE LANDS (A always records at T) | **Kept unchanged**, and load-bearing |
| The halt where a clip ends; the hidden-tab and lost-pad stops; View stops a recording first ([B2]); the save shown on failure; the refused chain kept aside; Space / Enter never twice ([A4], [B3]); the drag surface's siblings ([A3]) | **Kept unchanged** |
| R3F's automatic render | Unchanged in T1a ([C1] is T2's) |
| Film 4, `LetteringPiece`, `shot-format.ts`, `camera-pad.ts` | Untouched (`BTN.START` already defined) |

## 6. Verification

1. **`bench-chain-check` (Node)**, extended: precedence (Cam 2 over Cam 1; the newest take inside a track; covered
   clips intact); half-open edges at sums of sixtieths (no clip claims T at another's `end`); the three join kinds and a
   gap from one rule; the gap hold, before and with nothing before ([C6]); run-on covers; solo; `start ≥ 0`, no empty
   clip ([C9]); `parseChain` v1 → v2 and v2 validation; a gap edge is no join; ⛔ **THE PARITY CHECK: R1 chains built
   the way R1 built them (the frozen `appendClip` / `punchIn` copies in the script, sixtieths, punch-ins, two cams, a
   CUT and a MISMATCH) → `v1PoseAt` vs `poseAtT` at every sample, exactly at every boundary and at boundary ± 2·`EDGE_S`
   ([E1]), every field ≤ 1e-9**; and the ± `EDGE_S` band shown to differ BY DESIGN (the later clip), so the rule is
   asserted, not assumed; and with Carl's own chain if he exports one (optional;
   the in-browser check in §2 covers his chain regardless). Must go RED first on a planted fault (an off-by-one start).
2. **`camera-bench-verify` (page)**: its R1 recording / Overwrite / punch-in / New camera checks REWRITTEN for tracks:
   record; a new take over clip 1 keeps clip 1's samples untouched and the old resumes where the take ends (pose
   compared); add a Cam 2 track, record inside Cam 1 → Cam 2 plays (pose), a CUT joins shown, delete it → Cam 1 again;
   Start cycles the arm, does nothing while recording (the status says why); a selection plays solo (pose = the covered
   clip's own); delete a middle clip → a gap shown, playback holds and says "Gap"; **the migration**: a v1 chain seeded in
   storage → reload → tracks, v1 key byte-identical, v2 written, the carry-over status reports "identical"; a v2 write
   that throws → shown, bench runs, v1 kept; **[E2]** a parity failure FORCED (a planted difference in a seeded v1) →
   record a take, reload: the take is present, v1 byte-identical, the differences line still showing; **[E3]** an
   unreadable v2 planted beside a valid v1 → reload: the bench EMPTY, the message showing, both keys byte-identical;
   **[E4]** a take wholly covered by a newer one is selected from the inspector without deleting anything, and plays
   solo; Cam 1 armed under Cam 2 → the "under Cam 2" status; the rig / pad / floor checks unchanged. The count reported,
   not promised.
3. `tsc` clean; lint 1 error 0 warnings; the files free of control characters.
4. ⚠ **NOT WATCHED:** the pad's feel; Carl's real chain until his browser loads it (then the bench shows its own parity
   verdict on screen); production.
5. **Carl flies T1a** (answer 9): a B-roll over a sequence, a new take over a clip, a gap — one image of the timeline.

## 7. Before the build (C7)

Carl's chain size: on `/proto/camera`, F12 → Console: `(localStorage.getItem("c2b-camera-bench-chain-v1") || "").length`.
Not blocking: the carry-over status shows it too, and a failed v2 write is safe (§2).

## Scope and servers

Files: `components/showcase/bench-chain.ts`, `camera-bench.tsx`, `bench-timeline.tsx`, `bench-transport.tsx`,
`app/proto/camera/page.tsx` (comment); `live-work/scripts/bench-chain-check-26-october.mjs`,
`camera-bench-verify-26-october.mjs`. `camera-pad.ts` in scope, not changed. `chunk-scope.json`: the
`_cameraTracksT1a` entry with Carl's words was added when the four files were (the Architect's note predates it); its
`"chunk"` name moves to `camera-tracks-t1a` at the build. Dev server for the harness; stopped by PID
before the checkpoint. Records: D-104 (T1a built), the note's status. Lock and test the R1 six only on Carl's word.
