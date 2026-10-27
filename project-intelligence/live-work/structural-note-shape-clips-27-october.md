# Structural note — SHAPE CLIPS on the camera tracks (clip 2, the corkscrew)

**27 October 2026, session 2. Builder. v3.2 — PROPOSED, for the Architect via Carl. Nothing built.** (v3.2: the third
review's two must-fix — units filled on the first measured frame; Home off the shared conversion — and its should-fix.)
Record: D-104 tail, *"THE SEQUENCE — DESCRIBED BY CARL, CLIP BY CLIP"*. Reviews: transcribed in
`architect-plan-response-shape-clips-27-october.md` — of v2 (R1–R7, minors) and of v3 (S1–S3 must, should-fix, minors:
*"v3 handles all seven review items correctly. Nothing is reopened."*). Each item checked against the code before folding.

**Why now (Carl, verbatim):** *"No, we do it now. The goal is to test this tool That means more than flying. If things
have to be changed in light of new info then so be it. I want to establish a workflow so i wont put this off"*. And on
the review's remit: *"The architects job was to review structure and make sure the tool worked as we wanted it. It is
not responsible for directorial choices."* → **The Architect is asked about STRUCTURE only (§8).** The move's numbers are
Carl's brief carried out by the Builder, already judged by Carl on the bench (§2).

**What running the move taught (v2):** clip 2 went onto Carl's bench by a console SNIPPET as baked samples
(`live-work/scripts/clip2-corkscrew-snippet-27-october.js`) — the stand-in this note retires, once parity passes (§4a).
The paste is friction; writing storage behind the bench is unsafe (§5a); the start's ease is a number of the clip (§2).

**Words (minor):** "cm" = world centimetres (1 layout px = 1 cm, the bench's scale); "d-units" = the chain's position
units, multiples of the front distance `d` from the subject's centre.

## 1. What is being decided

Carl (D-104): a computed move is **stored as the shape and its numbers**, and *"It always helps if we can adjust the
numbers later. Not just for movement but for timing and speed"*. Order, Carl: *"sort out the trajectory first … Then to
edit the timings."* **How does a clip whose pose comes from numbers live on T1a's tracks beside clips whose pose comes
from recorded samples?** §5a structural: a second kind of clip source, and a format change.

## 2. Clip 2 as Carl set it — the worked example (judged on the bench)

Letter boxes read from the running page, in cm; the floor y −429:

| number | value | source |
|---|---|---|
| axis | the LEFT LEG's centre line, x −285.2, z 0 | measured (C O M boxes) |
| end angle | the leg's OUTSIDE after two more laps — stored UNWRAPPED, `theta1` = 5π (900°) about the axis; 2¼ laps from face-on (`theta0` ≈ π/2), LEFT FIRST | Carl's end pose; *"Left first (outside)"* |
| radius | the start pose's → 6.76 m, linear in angle (a cone) | Carl's end pose; *"Widen the whole way"* |
| height | the start pose's → 9.48 m above the floor, linear in angle | Carl's end pose |
| aim | level, at the axis at the camera's own height; **SETTLES from the previous clip's aim over `aimS` = 1 s** (yaw and pitch smoothstepped from the captured `yaw0` / `pitch0`) — no snap | Carl: *"Level, at its own height"*; the snippet (R1) |
| lens | held (the start pose's) | |
| pace | 2.8 m/s along the path: 64.0 m ≈ 24.3 s | Carl on take 1: *"The climb and rotation is ay a good speed"* |
| start | from `v0` up to the pace over `rampS` = 3 s, the speed smoothstepped. **⛔ S3 — `v0` DEFINED:** the straight-line speed from the previous clip's pose at the first sample at or after (its end − 0.25 s) to its pose at its end, capped at the pace — the snippet's rule exactly (snippet:41–42); for a previous SHAPE clip, `clipPoseAt` at end − 0.25 s and end. **The previous clip** = what PLAYS just before the placing playhead, `sourceAt(T − PROBE)` — any track; **in a gap, `v0` = 0** (the snippet took the latest-ending clip; for take 2 the two coincide: one track, placed at clip 1's end) | *"It moves off too fast"* → take 2: *"it is smoother"* |

**Carl's verdict on take 1:** *"The passing through the letters is a great touch and its end point spot on."* The path,
the pace and the end are KEPT; the shape clip reproduces take 2 BY NUMBER (§4a).

**Clash check (letter boxes, the letters' slab |z| ≤ 16 cm):** none; nearest 0.75 m (YOUR's R, lap 2's inside pass).
As a cylinder, lap 2 caught YOUR's O by 1 cm — what led to the cone. ⚠ Boxes, not ink: lower bounds. **Minor, Carl's
call:** editable numbers mean nothing re-runs this check — the snippet's box check could stay as a WARNING in the
inspector.

## 3. The proposal — A: a Clip carries ONE SOURCE, samples OR a shape

```
Clip  = { id, cam, start, order, in, out } & ( { samples: Sample[] } | { shape: Shape } )
Shape = { kind: "helix", axisX, axisZ, theta0, theta1, r0, r1, y0, y1, fov, yaw0, pitch0, aimS, pace, v0, rampS }
```

- **⛔ S2 — ANGLES UNWRAPPED, NO `dir`.** `theta0` and `theta1` are unwrapped radians about the axis; the direction IS the
  sign of `theta1 − theta0` (a stored `dir` would be a second record of it). **Capturing:** the FIRST "Start here" takes
  `theta0` as the raw `atan2`; **"End here"** gives `theta1` unwrapped from `theta0` by the LAP COUNT and DIRECTION Carl
  states at that moment (inputs to "End here", not stored — R5 derives them); a RE-capture of "Start here" unwraps beside
  the previous `theta0`. Never a raw `atan2` on re-capture: it jumps at ±180° and would gain or lose a whole lap (⚠ the
  snippet's fault too; its start sat at π/2, far from the jump).

- **ONE RULE stays one rule.** `sourceAt` decides WHICH clip plays and never looks at its source — unchanged.
- **ONE POSE PATH.** `clipPoseAt(c, T)` keeps its clamp to `[in, out]` and then asks the source: `poseInSamples` or
  `poseInShape`. Playback, scrub, solo, joins, gaps and the status already go through `clipPoseAt` / `poseAtT`; ⚠ TWO
  readers do not and are changed (§4): the inspector's start / end metres and the harness view.
- **⛔ R5 — the END ANGLE is stored (`theta1`, absolute), the turns DERIVED** — as the snippet fixes it
  (`sweep = π + 4π − b0`). The end is what Carl called *"spot on"*; with a stored turn count, a re-captured start would
  carry the end round with it while the radius and height stayed put.
- **⛔ R2 — THE MATHS, NO TABLE.** Even pace needs distance along the path → a point on it. The path's length has a
  closed form: with `r = r0 + kθ`, `y = y0 + hθ`, `c² = k² + h²`, `s(θ) = [F(r0 + kθ) − F(r0)] / k`,
  `F(u) = ½(u√(u²+c²) + c² ln(u + √(u²+c²)))`; θ from s by Newton (≤ 8 steps, `ds/dθ = √(r² + c²)`). ⚠ A constant
  radius has its own branch, `s = θ√(r0² + h²)` — ⛔ taken whenever `|r1 − r0|` is below 0.001 CM (the d-unit radii
  converted through the chain's units), not only at exactly 0
  (the divided difference cancels badly as `k → 0`). **Measured against the snippet's 20,000-step table:** the LENGTH
  agrees to 0.0013 mm (first principles: a 20,000-chord table falls short by ≈ L·Δθ²/24 — the review's check). The
  snippet's table was a cache; this has none.
- **A shape clip is a clip.** It lands on the ARMED track at the playhead like a recording (newest take on top, nothing
  destroyed), plays solo when selected, deletes leaving a gap, trims through `in` / `out`.
- **The maths lives in `bench-chain.ts`**, pure — its [A9] rule (no runtime imports; Node runs it stripped of types for the
  harness) rules out a separate file without changing how the harness loads it.

### Rejected

- **B — bake into samples, keep the numbers beside them.** Two sources of truth; an edited number and stale samples
  disagree with nothing to say which wins.
- **C — derive and cache samples from the shape.** A cache is a second copy with its own invalidation; the closed form
  (R2) makes it unnecessary.
- **D — shapes on a lane of their own, outside `clips`.** A second timeline with its own precedence.

## 4. Format, units, storage — v3

- **⛔ R6 — `CHAIN_VERSION` 3, for an HONEST refusal.** (v2's stated reason was wrong: at version 2 a shape-only clip is
  refused LOUDLY by `checkSamples` — `bench-chain.ts:309` — with a misleading message, *"fewer than two samples"*. v3 makes
  an older reader say *"chain version 3"*.)
- **⛔ R6 — A NEW KEY, `c2b-camera-bench-chain-v3`.** Read first; when absent, v2 is read, migrated and PROVEN (as v1 → v2
  is), and **v2 is never written or removed** (the v1 rule, Carl: *"Only when I say so"*). So an older checkout in the
  same browser finds its own v2 intact and never moves a chain to the single `-refused` slot (where a second round trip
  would overwrite the first copy). ⚠ Storage: a third copy while v2 is kept — the carry-over line reports the total.
- **⛔ R4 / S1 — THE UNITS SETTLED IN v3: the chain carries its conversion, for WRITING AND READING.** `units: { d, up, zc }`
  on the chain. ⚠ Today `frontDistance` depends on the canvas's aspect (`lettering-hooks.tsx:94`); height-limited in
  landscape so it has not moved, but unasserted — and a shape that threads between letters is the clip most exposed.
  (Rejected: world centimetres for every position — the same safety, but every reader of a pose changes units at once.)
  **The five conversions on the live measure today (`camera-bench.tsx`), each placed:**

  | conversion | line | v3 |
  |---|---|---|
  | `pose()` → the RECORDER (and "Start here") | 267 | ⛔ the CHAIN's units |
  | `toWorld` → PLAYBACK | 456 | ⛔ the CHAIN's units |
  | ⚠ the SHARED call site: `setRig(jumpTo === "front" ? front(m) : jumpTo)` → `toWorld` | 460 | ⛔ Home / H leave it: "front" sets the rig in WORLD directly, `rigAt(0, 0, m.d, …)` on the live `d` (as line 453 already does); only clip poses go through the chain's units |
  | `__cameraBench.front` (the harness) | 583 | the front pose expressed in the CHAIN's units (world → chain), so the harness compares like with like; the field says so |
  | `metresPerD` → the join metres | 896 | ⛔ the CHAIN's units |
  | `toMetres` → the inspector's metres | 900 | ⛔ the CHAIN's units |
  | `front` → the page's front framing (Home, H); and the camera's `far` (648), the rig's first pose (453) | 182 | stays on the LIVE `d`, BY DESIGN — framing is about this window |

  ⚠ **§5a, NAMED: this is a deliberate SECOND VALUE OF `d`** — the chain's (where clips are) and the live one (how this
  window frames the piece). They agree while `d` has not moved; when it moves, clips stay put and the framing follows the
  window. The HUD reads world positions (cm), unaffected.
  **⛔ When they are captured (v3.2): THE STORE FILLS THEM ON THE FIRST FRAME THAT HAS A MEASURE, whenever they are null,
  and commits at once.** Both loading paths run before any measure — `emptyChain()` and the migration both run in
  `readChain`, called from `useState(loadChain)` (`camera-bench.tsx:809`) — so a new chain AND a migrated one load with
  `units: null`. Validation accepts `units: null` in STORAGE (with or without clips); in the running bench nothing plays,
  scrubs, measures a join, records or places before the first measured frame. "Frozen at" = **the first frame after
  loading** (not "at migration", not "at the first commit": playback and the join metres need them before Carl's first
  stop, delete or new track).
  **What migration can and cannot know:** v2 → v3 takes the `d` of the first measured frame after it; it cannot recover the
  `d` each v2 clip was recorded under. Harmless if `d` never moved — ⚠ still unasserted; stated in the migration verdict.
  **Two migration verdicts:** Carl's v2 chain already carries `migration: { from: 1, … }` (R1's parity, which keeps a
  "differences" line until he decides — [E2]). v3 holds `migrations: [ … ]`, the v2 verdict carried in UNCHANGED as its
  first entry and v2 → v3's appended (`from: 2`: the units taken, the clip count); the carry-over line reads the `from: 1`
  entry exactly as today, so ⛔ **R1's persistent line survives.**
- **⛔ The loader: v3 → v2 → v1.** v3 when present; else v2, migrated and proven; else v1, migrated to v3 through the
  existing v1 → v2 step (its parity check kept) and then v2 → v3. **Only v3 is ever written;** v2 and v1 are never written
  or removed. ⚠ **Minor, stated:** work done later in an OLDER checkout writes v2, which this build never reads again once
  v3 exists — it does not come forward.
- **Validation (v3), the minors folded:** exactly one source; `units` either null (filled on the first measured frame) or
  three finite numbers with `d > 0`; a shape's numbers finite;
  `theta1 ≠ theta0`; ⛔ radii **> 0** (at r = 0 the camera sits on the axis and "aim at the axis" has no direction;
  linear between `r0` and `r1`, both > 0 covers the path); `pace > 0`; `0 ≤ v0 ≤ pace`; `rampS ≥ 0`; `aimS ≥ 0`; `fov`
  within the lens's range.

### 4a. Parity — the shape clip against take 2 (⛔ R3)

Not "exact": the snippet stored samples 60 a second and the bench plays straight lines between them; the closed form
follows the curve. **Measured (a stand-in clip 1, as tested today):** at the BAKED SAMPLE TIMES the POSITIONS agree to
**0.0013 mm** (⚠ a second measurement, not §3's length repeated — the table's shortfall reaches both the same way);
between samples, chord against curve, **0.096 mm** (first principles: v²/(28,800·r) ≈ 0.10 mm at r ≈ 2.7 m, where the
ramp ends). **The check:** every baked
sample time, position within **0.01 mm** and aim within **0.001°**. **The reference:** the snippet FILE, kept and run as
it was (as `v1PoseAt` keeps R1's arithmetic), plus Carl's baked take 2 in his browser (read through the Browser seat or the
bench). **The snippet is retired only after parity passes.**

## 5. What depends on a clip having samples — every reader (§5b)

`grep -n "\.samples\|samples:"` over the bench's files and both harnesses (the review also checked `bench-transport.tsx`
and `camera-pad.ts`: neither reads samples).

| reader | today | with shapes |
|---|---|---|
| `clipPoseAt` | `poseInSamples(c.samples, …)` | dispatches by source |
| `recordClip` | `out = sampleLength(samples)` | a sibling `placeShape`: `out` = the shape's own length (derived from the path, `pace`, `v0`, `rampS`; never stored twice) |
| `parseChain` / `checkSamples` | ≥ 2 samples | §4's validation |
| the inspector's start / end metres (`bench-timeline.tsx` 226–227) | `c.samples[0]` and the last sample DIRECTLY — ⚠ would throw | `clipPoseAt` at `in` / `out` (it ignores trim today too) |
| the harness view (`camera-bench.tsx` 577) | `c.samples.length` — ⚠ would throw | the source kind |
| `joinsOf` mismatch degrees | `hypot(Δyaw, Δpitch)`, raw | the WRAPPED difference, `((Δ + 540) mod 360) − 180`, per axis — the rig's own yaw is unbounded too (`camera-pad.ts:101`) |
| `migrateV1` / `parityV1` / `v1PoseAt` | v1 only | unaffected |
| the storage quota | ~20 minutes of samples | a shape is ~300 characters |
| the harnesses | sample clips | + shape clips: parity (§4a), precedence, solo, trim, delete, the v3 round trip and migration |

## 5a. Placing a shape, and the one way in

- **Capture, not link.** "Start here" reads the rig's pose (position, aim, lens) and the previous clip's end speed INTO
  the numbers; the axis defaults to the left leg; the end from "End here" or the numbers. Re-fly clip 1 → press "Start
  here" again; the stored end stays where Carl put it (R5).
- **⚠ Writing storage behind the bench is unsafe:** it holds the chain in memory and writes it whole at a stop, a delete
  or a new track — a write behind it is overwritten at its next save unless the page reloads at once (the snippet does).
- **The hook:** `window.__benchPlace(shape)` hands a shape to the store's own action (the same as the inspector's Place),
  validated as storage is, committed by the one commit. Either seat can call it (the Builder in Playwright; the Browser
  seat in Carl's tab). **⛔ R7 — gated in code:** defined only when `process.env.NODE_ENV !== "production"` (Next inlines
  it, so a production build has no hook). ⚠ So any harness that places through the hook runs against the DEV server only
  (not `next build && next start`). ⚠ `/proto` routes DEPLOY (`app/proto/card/page.tsx:2–3`), and today's READ-only
  `window.__cameraBench` is set in every build (`camera-bench.tsx:568`) — harmless (read-only), flagged, unchanged here.
- **The Browser seat's options (Carl's paste), placed:** run code in the tab ✔ (one call with the hook); a scripting hook
  ✔ (this); move FILES — the file is right, "recorded as a take" is not (it discards the numbers): a move file is a SHAPE,
  read through R2's Open; a virtual gamepad ✘ for computed moves (the rig's smoothing would soften them).

## 6. Timing — in this chunk, and later

**In:** a shape's own pace and start ease (`pace`, `v0`, `rampS`), as take 2 was judged. **Later:** a retime (shot time →
clip time) inside `clipPoseAt` after the trim clamp — one mechanism for both sources; **raised, not chosen:** a SPLINE
EDITOR for speed (Carl: *"Easing in would be better- or build a spline editor"*). Carl's doubt whether ramps suit client
work is open (D-104).

## 7. Raised and not in this note

- **The third-person view** (Carl: *"see the camera in third person. Like the light helpers in WebGL"*) — after these
  tests; a second viewpoint in the one canvas, the same question as T2's PiP.
- Other shapes (the lock-on orbit, a straight dolly) — `kind` leaves room.

## 8. Questions for the Architect (structure only)

1. A (a clip carries one source) over B / C / D?
2. v3 under a NEW key, v2 kept read-only (§4)?
3. The chain carrying its units (§4) — over world centimetres throughout?
4. The parity check as §4a: its tolerance, its reference, retirement after it passes?
5. The hook gated by `NODE_ENV` (§5a)?
6. The deliberate second value of `d` (§4: the chain's for clips, the live one for framing)?

**Carried from v2's questions — NOT OBJECTED IN REVIEW, TAKEN AS PROPOSED** (not objecting is not approval; recorded so a
reader can see they were decided, and by whom — the Architect or Carl may still say otherwise):
- v2 Q4 — join angles: the wrapped difference per axis (§5).
- v2 Q5 — capture, not link, INCLUDING the start speed `v0` (§5a; its rule in §2).

## 9. What the chunk would deliver (for the plan)

A shape clip that reproduces take 2 by number (§4a); its numbers in the inspector (metres, degrees, m/s, seconds),
editable on a selected shape clip; "Start here" / "End here"; the hook; v3 with the chain's units; the two readers fixed;
the harnesses extended; the snippet retired after parity. ⚠ The bench files are LOCKED (D-104) — Carl names them in
`chunk-scope.json` when the plan is approved.
