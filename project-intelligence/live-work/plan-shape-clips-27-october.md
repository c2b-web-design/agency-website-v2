# Plan: SHAPE CLIPS — the corkscrew as its numbers, on the camera tracks (`/proto/camera`). 27 October 2026, v2.1

**Status:** PROPOSED. Nothing built. **v2:** the plan review folded (three must-fix, five should-fix, minors). **v2.1:**
its second pass folded (the save rule stated once in the UI's `commit`; `v0` only when the start is where the clip is;
metres "…" while units are null; Parity B's live-units assumption; clip-local time) — its verdict: *"Once item 1 is in,
it's ready for Carl's approval."* Both transcribed with the note's reviews. Under the note `live-work/structural-note-shape-clips-27-october.md` **v3.2** (three
review rounds, transcribed in `live-work/architect-plan-response-shape-clips-27-october.md`). On approval this plan is
saved as `live-work/plan-shape-clips-27-october.md`.

## Context

Carl gave the brief for clip 2 (D-104 tail): a corkscrew up the left leg, judged on his bench as a baked test clip
(*"The passing through the letters is a great touch and its end point spot on"*; take 2's eased start *"is smoother"*).
He decided computed moves are **stored as a shape and its numbers** (*"It always helps if we can adjust the numbers
later"*) and that it is built **now** (*"The goal is to test this tool … I want to establish a workflow so i wont put
this off"*). The method, Carl: *"just like we build meshes. in sequence. One step at a time. We view and iterate."*

**Outcome:** a shape clip on the tracks that reproduces take 2 BY NUMBER; its numbers editable on the bench; Carl places
one from his own camera poses ("Start here" / "End here"); the Builder (or the Browser seat) places one through a dev
hook — no paste. The console snippet is retired once parity passes.

**Built in three steps, each checked before the next** (data → the store → the screen), then Carl flies it.

## Step 1 — the data and the maths: `components/showcase/bench-chain.ts` (pure, [A9] kept: no runtime imports)

- **Types (note §3, §4):** `Clip = {id, cam, start, order, in, out} & ({samples} | {shape})`;
  `Shape = {kind:"helix", axisX, axisZ, theta0, theta1, r0, r1, y0, y1, fov, yaw0, pitch0, aimS, pace, v0, rampS}` —
  positions in the chain's d-units, angles unwrapped radians, `pace` / `v0` d-units per second. No `dir`, no turns, no
  length stored (all derived). `Chain` → `CHAIN_VERSION` 3, `units: {d, up, zc} | null`,
  `migrations: Migration[]` (`{from:1, moments, maxDiff, ok}` carried unchanged; `{from:2, clips}` appended).
- **`poseInShape(shape, local)`** — the note's maths, no table: `r = r0 + kθ`, `y = y0 + hθ` over `θ ∈ [theta0, theta1]`;
  arc length `s(θ) = [F(r0+kθ) − F(r0)]/k`, `F(u) = ½(u√(u²+c²) + c² ln(u+√(u²+c²)))`, inverted by Newton (≤ 8 steps);
  the constant-radius branch when `|r1 − r0| < 4e-7` d-units (≈ 0.001 cm at today's d = 2287 cm — ⚠ a d-unit threshold,
  not cm, so `clipPoseAt` stays units-free; a stated deviation from note v3.2's wording, same effect);
  time → distance: take 2's ease, `s = v0·t + (pace − v0)·rampS·(u³ − u⁴/2)` then even; the aim level at the axis,
  `yaw = 90° − θ° + 360·round((yaw0 − (90° − theta0°))/360)`, settling from `yaw0` / `pitch0` over `aimS` (smoothstep);
  `fov` held. **`shapeLength(shape)`** derived, as the snippet's `T`.
- **`clipPoseAt`** dispatches by source (the clamp to `[in, out]` unchanged); **`sourceAt` untouched.**
- **`placeShape(chain, cam, T, shape)`** beside `recordClip` (newest take; `out` = `shapeLength`); **`replaceShape(chain,
  id, shape)`** — same id, start, order; `out` re-derived, `in` clamped.
- **`joinsOf`:** degrees by the wrapped difference `((Δ + 540) mod 360) − 180`, per axis.
- **`shapeFrom(start, end, opts)`** — the capture rules (note §3, §2): `theta0` raw `atan2` on first capture; `theta1`
  unwrapped from `theta0` by Carl's laps and direction (`theta1 = theta0 + dir·(laps·2π + mod2π(dir·(b1 − theta0)))`,
  ⛔ `mod2π(x) = ((x % 2π) + 2π) % 2π` — JS `%` keeps the sign, and Carl's end sits at θ ≈ ±π, on the `atan2` jump; left
  first = increasing θ); a re-capture of the start unwraps beside the previous `theta0`. **`v0` AT THE PLAYHEAD T:** what
  plays at `T − PROBE` (any track; 0 in a gap), the straight-line speed from its pose at the first sample at or after
  the clip-local time `in + (T − 0.25 s − start)` (a shape: `clipPoseAt` at `T − 0.25 s`) to its pose at `T`, capped at
  the pace — at a clip's end this IS the snippet's rule. ⛔ **Only when the captured start IS where that clip is:** if
  "Start here" captured a pose more than 1 mm / 0.01° (angles by the joins' wrapped difference) from that clip's pose at `T` (Carl re-framed after parking), the
  clip's speed belongs to a move the shape does not continue → `v0` = 0, and the status says so. At a parked clip end
  this gives the snippet's rule; Parity A and B are unaffected. Pure, so the hook, the UI and the harness share it.
- ⚠ **A shape shorter than its ramp** reaches its end before `rampS` and holds there until `rampS` (the snippet's quirk,
  kept for parity) — harmless; said in the inspector, since pace and ramp are editable.
- **`parseChain`:** reads v1, v2, v3; v2 → v3 (`units: null`, the v2 `migration` → `migrations[0]`, `{from:2}` appended);
  v1 → v2 (existing step, parity kept) → v3. Validation per note §4 (one source; `units` null or finite with `d > 0`;
  radii > 0; `pace > 0`; `0 ≤ v0 ≤ pace`; `rampS, aimS ≥ 0`; `theta1 ≠ theta0`; `fov` in the lens's range).
- Header comments amended (v2 → v3; the shape; the units) — swept for every stale copy.

**Check (Node, `live-work/scripts/bench-chain-check-26-october.mjs` extended, all previous 40 kept):**
1. **Parity A (the snippet itself):** the snippet FILE run unchanged in a Node `vm` with stubbed `localStorage` /
   `window.__cameraBench` / `location`, on take-2's stand-in clip 1 → its baked samples; a shape built by `shapeFrom` from
   the same inputs → at every baked sample time position ≤ **0.01 mm** and aim ≤ **0.001°**, length to the snippet's `T`
   within 1e-6 s. A planted change (pace +1 %) must FAIL.
2. **Parity B (Carl's own take 2):** his chain AND the units the snippet converted with, exported to
   `live-work/carl-chain-27-october.json` (gitignored) — Carl or the Browser seat runs in the console on the bench:
   `copy(JSON.stringify({ chain: JSON.parse(localStorage.getItem("c2b-camera-bench-chain-v2")), units: window.__cameraBench.units }))`
   and pastes into that file (the snippet turned its cm constants into d-units with `__cameraBench.units` at the paste —
   snippet:12–14; a chain alone cannot rebuild it). The shape from HIS clip 1's end, ⛔ its END FROM THE SNIPPET's
   CONSTANTS (`theta1 = 5π`, `R1 = 675.8 cm`, `Y1 = FLOOR + 948 cm`, converted with his units) — never from an "End here"
   capture — vs HIS baked clip 2, same tolerances. (Carl's own "End here" flight in Step 3 is a VISUAL comparison; it
   will not meet 0.01 mm.) ⚠ `__cameraBench.units` is LIVE: the export assumes `d` has not moved since the paste
   (likely — unasserted). **If Parity B fails by a uniform scale factor, that assumption is the first suspect.**
3. Unit checks: the closed form against a 200,000-step chord sum; the constant-radius branch; a start at θ ≈ ±π (no lap
   gained); `v0` in a gap = 0; joins across a 720° yaw read 0°; v2 → v3 and v1 → v3 round trips; R1's `from:1` verdict
   survives byte-for-byte; every validation refusal reachable.

## Step 2 — the store and the loader: `components/showcase/camera-bench.tsx`

- **Keys (note §4):** `CHAIN_KEY` → `c2b-camera-bench-chain-v3`; read v3 → else v2 (migrated) → else v1 (migrated);
  **only v3 is written**; v2 and v1 never written or removed. v3 unreadable → kept aside as `…-v3-refused`, start empty
  (as today); v2 unreadable → start empty, v2 left as it is. The carry-over line names the copies and their total share.
- **Units (note §4, S1, T1):** on the FIRST FRAME with a measure, if `chain.units` is null the store fills it from `m` IN
  MEMORY, always; ⛔ it is SAVED only when the chain has clips (an empty chain is saved at its first recording anyway —
  otherwise a first visit writes an empty v3 and an UNREADABLE v2's refusal is shown once and never again).
  ⛔ **THE RULE STATED ONCE, IN THE UI's `commit` (828–833), which takes `{ action, save }`:** `action` clears the green
  carry-over line (`setCarry`) — today it lasts until Carl's first action because only actions commit; **storage is
  written only when the chain HAS CLIPS, or always for an ACTION** (so deleting the last clip still saves). The units fill
  and `bind()`'s catch-up push both go through with `action: false` — neither can write an empty v3, neither clears the
  line (§5b row). **Before React is attached:** no new mechanism — `bind()` (229, from the effect at 834–837) pushes the
  store's chain if it changed before binding (the existing channel, named). **While `units` is null** (a migrated chain,
  before its first measured frame): the join metres and the inspector's metres show "…" — no fallback to the live `d`
  (that would be the second value of `d` leaking into clips). From then: `pose()` (the recorder, 267), clip
  playback `setRig` (456), and the page's `metresPerD` / `toMetres` (896, 900) use the **chain's** units.
- **Home (T2):** "front" sets the rig in WORLD directly, `rigAt(0, 0, m.d, 0, 0, FRONT_FOV)` (line 453's way) — off the
  clip conversion. `front(m)`, `far` and the rig's first pose stay on the live `d` BY DESIGN (the named second value).
- **Shapes in the store:** `placeShape(shape)` (armed track, playhead, commit — refused while recording, said);
  `editShape(id, patch)` (`replaceShape`, commit); a **draft** for the UI (`start`, `end`, laps, direction) — never in the
  chain until Place.
- **The hook (R7):** `if (process.env.NODE_ENV !== "production") window.__benchPlace = (shape) => …` — validated by
  `parseChain`'s shape check, through `placeShape`; returns the clip id or the refusal in words. `__cameraBench` gains
  `chainUnits`, `front` in the chain's units (named), and per clip `source: "samples" | "shape"` (the `samples.length`
  read at 577 would throw on a shape).
- Comments amended where they assert v2 / the live `d` (the store's header, `readChain`'s doc, `saveChain`).

**Check (Playwright, `live-work/scripts/camera-bench-verify-26-october.mjs` extended; dev server; all previous 70 kept,
re-pointed to v3):** v2 → v3 on load (units filled on the first frame and saved; v2 byte-identical after; `migrations`
has both entries; a v2 with `from:1, ok:false` still shows the persistent line; ⛔ the green "identical" line STILL SHOWN
after the fill, gone at the first action; an EMPTY first visit writes no v3 (with the first frame BEFORE and AFTER
`bind()`); an unreadable v2 shows its refusal on a second load too; deleting the last clip saves an empty v3); v1-only → v3; the hook places a shape at
the playhead (newest take, solo plays it, delete leaves a gap); `__cameraBench.pose` at mid-shape equals `poseInShape`;
**Home with a chain whose `units.d` ≠ the live `d` lands at the front** (HUD 0 · 4.29 · 22.71 m); a recording made then
plays back where it was flown. `tsc` clean; `npm run lint` 1 error, 0 warnings (the known baseline).

## Step 3 — the screen: `components/showcase/bench-timeline.tsx` (+ the inspector wiring in `camera-bench.tsx`)

- **The clip:** a shape clip drawn like any clip, marked as a shape (a corkscrew glyph and "corkscrew" in its label).
- **The inspector, a selected shape clip:** its numbers in Carl's units — axis (m right, m out), laps and direction (read
  from `theta0` / `theta1`), start and end radius (m), start and end height (m above the floor), pace (m/s), start ease
  (s), aim settle (s), lens (mm) — each editable (commit on Enter / blur; refused values said in words, not applied);
  From / To read through `clipPoseAt` at `in` / `out` (fixes 226–227). "Start here" re-captures the start from the camera.
  ⚠ **An edit that changes the length says what it does** (T1a's rules, nothing ripples): longer → *"now covers clip N
  from X s"* (the shape is the newer take over what follows on its track); shorter → *"leaves a gap from X s"*.
- **The inspector, nothing selected:** a small **Corkscrew** panel — *Start here* (the camera's pose now), *End here* with
  laps (default 2) and *Left first / Right first*, the axis (default: the left leg's measured centre — `measureArch` gains
  the leg centres), *Place* (armed track, at the playhead). The status says what Place will do, as it does for A.
  ⚠ The draft lives in the store only: **a reload loses an unplaced "Start here" / "End here"** (stated in the panel).
- **The clash check — ⛔ FOR CARL TO DECIDE AT APPROVAL (below):** if in, a warning only, never blocking: the nearest letter
  where the shape crosses the letters' plane, after any edit or placing — ⛔ the boxes from `measureArch` (131–137, which
  already builds one per letter; `ArchWorld` gains them), never the snippet's copied `BOX` array (a second source of truth
  for the letters' geometry).

**Check:** the Playwright run drives the panel (Start here, End here, Place) and an edit (pace → length changes), one
image seen; then **Carl flies it**: parks on his clip 1's end, *Start here*; flies to his end pose, *End here* (2, left
first); *Place* — and plays it against his baked take 2 (each solo).

## §5b — what depends on the structure being changed (note §5, all kept)

| what today's structure provides | how it is kept |
|---|---|
| one rule for what plays (`sourceAt`) | untouched |
| every pose through `clipPoseAt` / `poseAtT` | dispatch inside it; the two readers that bypassed it fixed (inspector, harness view) |
| the store's one commit as the only storage write | units fill, place, edit all go through it; the hook too |
| R1's migration verdict and its persistent line ([E2]) | carried unchanged as `migrations[0]`; `differences()` reads the `from:1` entry |
| ⛔ the green carry-over line lasting until Carl's FIRST ACTION — supplied by WHERE the clearing sits (in `commit`, and only actions commit) | the units fill AND `bind()`'s catch-up push go through with `{ action: false }`; the clearing runs only for actions |
| an unreadable v2's refusal shown on load ([E3]: start empty, never fall back) | kept; no v3 is written for an empty chain, so the refusal is shown again on every load until something is recorded |
| the `loaded` cache (Strict Mode runs the initializer twice) | kept; v1/v2 → v3 still migrates once per page load |
| Home landing square on at the default view | moved off the clip conversion, so it holds when the two `d` differ |
| recordings playing back where they were flown | the recorder and playback both on the chain's units |
| the quota (~20 min of samples) | a shape ~300 characters; a third copy while v2 is kept — reported |

## Scope and servers

- **Files Carl names in `chunk-scope.json`:** `components/showcase/bench-chain.ts`, `components/showcase/camera-bench.tsx`,
  `components/showcase/bench-timeline.tsx`, `app/proto/camera/page.tsx` (its header comment only). Harnesses in
  `live-work/scripts/`. Nothing else; `camera-pad.ts` and `bench-transport.tsx` untouched.
- The snippet: kept in `live-work/scripts/` as Parity A's reference, marked RETIRED once Parity B passes.
- The dev server (PID 6696) is running; stopped by PID and the port confirmed free before any checkpoint.
- Records as the work lands: D-104; R-entry on Carl's verdict; the sprint's camera-bench row (stale since T1a) corrected.

## For Carl to decide at approval

1. **The clash check in the inspector** — ⛔ DECIDED, Carl: *"In, warning only"* (a warning naming the nearest letter after an edit or placing; never blocks).
2. **The files for `chunk-scope.json`:** `components/showcase/bench-chain.ts`, `components/showcase/camera-bench.tsx`,
   `components/showcase/bench-timeline.tsx`, `app/proto/camera/page.tsx` (its header comment only).
3. **The Parity B export, BEFORE Step 2's build first loads in Carl's browser** (it will not touch v2, but early keeps the
   units read close to those the snippet used at the paste): Carl or the Browser seat runs the one line in Step 1's
   check 2 on the bench and pastes the result to the Builder.

## Not in this chunk

The retime / spline editor; other shapes; R2's Open / download; the third-person view; T1b's editing.
