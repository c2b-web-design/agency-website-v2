# Review of `structural-note-shape-clips-27-october.md` v2 — transcribed (27 October 2026, session 2)

**Source:** pasted to the Builder by Carl. ⚠ The seat is not named in the paste (it said the note should be corrected
*"before it goes to the Architect"*) — Carl to confirm. Reviewed against `bench-chain.ts`, `camera-bench.tsx`,
`bench-timeline.tsx` and the clip 2 snippet. Each item was checked or measured by the Builder before folding (→ note v3).

**Verdict (verbatim):** *"The structure is right. Accept proposal A, but correct the note before it goes to the
Architect."*

| item | the review | checked / measured | folded (v3) |
|---|---|---|---|
| R1 must | the aim SETTLES over 1 s (snippet `AIM_S`, smoothstep), not a snap; `aimS` undefined | ✔ the snippet does exactly that | §2 aim row; §3 Shape |
| R2 must | even pace needs a distance → point inversion; the snippet's 20,000-step table IS a cache (option C's ground); closed-form arc length + Newton; a constant-radius branch | ✔ **measured:** closed form vs the table, length 0.0013 mm | §3 "THE MATHS, NO TABLE" |
| R3 must | parity can't be "exact": chord vs curve ~0.06 mm (estimate); name tolerance, moments, reference; retire the snippet only after parity | ✔ **measured:** 0.0013 mm at the baked sample times, 0.096 mm between | §4a |
| R4 must | settle units in v3: the shape's anchors are world-fixed, d moves with the window (`lettering-hooks.tsx:94`); store the conversion or move to cm | ✔ `frontDistance` depends on aspect (line 94) | §4 — the chain carries `units` |
| R5 must | store the END ANGLE, derive turns (snippet `sweep = π + 4π − b0`) | ✔ the snippet fixes the end absolutely | §3 `theta1` |
| R6 should | v3 is right but the reason is wrong: a shape-only clip is refused LOUDLY at v2 (`bench-chain.ts:309`); the storage key; an older checkout's `-refused` slot | ✔ line 309; one `-refused` slot | §4 — a new key, v2 kept read-only |
| R7 should | "never in a production build" is unenforced: `/proto` deploys (`app/proto/card/page.tsx:2–3`); `__cameraBench` unconditional (`camera-bench.tsx:568`) | ✔ both | §5a — a `NODE_ENV` gate |
| minor | §3 overclaimed every reader goes through `clipPoseAt` | ✔ two don't | §3 reworded |
| minor | validation missing `v0` (0…pace), `aimS ≥ 0`, lens range | ✔ | §4 validation |
| minor | joins: the wrapped difference `((Δ + 540) mod 360) − 180` | — | §5 table |
| minor | nothing re-runs the clash check once numbers are editable; a warning — Carl's call | — | §2 |
| minor | "unit" used for cm and for d | ✔ | the note's "Words" line |

## Review of v3 (pasted by Carl, the same reviewer)

**Verdict (verbatim):** *"v3 handles all seven review items correctly. Nothing is reopened."* The closed form re-derived;
both measured figures agree with first principles (0.0013 mm ≈ L·Δθ²/24; 0.096 mm ≈ v²/(28,800·r) at r ≈ 2.7 m). *"The new
key, kept read-only, is a better answer to item 6 than I asked for."* *"With items 1–3 folded in, I'd send v3 on as it
stands."*

| item | the review | checked | folded (v3.1) |
|---|---|---|---|
| S1 must | frozen units must cover WRITING: five live-`d` conversions (`camera-bench.tsx` 267 recorder, 456 playback, 896 join metres, 900 inspector metres, 182 front); four onto the chain, `front` / `far` live by design — a §5a second value of `d`, named; capture at the first commit with a measure (`emptyChain()` runs before any); migration can't recover each v2 clip's `d` | ✔ all five lines; `far` at 648, the rig's first pose at 453 | §4 table, the capture rule, the migration's limit |
| S2 must | `theta1` UNWRAPPED (5π, not 180°); drop `dir` (the sign of `theta1 − theta0`); "Start here" must unwrap `theta0` (a raw `atan2` jumps at ±180°, a lap gained or lost — the snippet's fault too) | ✔ the snippet's `atan2` | §2, §3 |
| S3 must | define `v0`: the straight-line speed over the previous clip's last 0.25 s, capped at the pace (snippet:41–42) | ✔ | §2 start row |
| should | small non-zero `k` cancels: a threshold for the constant-radius branch | — | §3 (`|r1 − r0|` < 0.001 cm) |
| should | radii > 0 (at r = 0 the aim has no direction) | ✔ | §4 validation |
| should | v1 when neither v3 nor v2 exists | — | §4 the loader |
| should | v2's Q4, Q5 dropped unanswered: record "not objected in review, taken as proposed" | — | §8 |
| minor | an older checkout's later work writes v2, not read again | — | §4 |
| minor | the hook absent under `next build && next start`: hook harnesses dev-only | — | §5a |
| minor | 0.0013 mm twice — two measurements | — | §4a |

## Review of v3.1 (pasted by Carl, the same reviewer)

**Verdict (verbatim):** S2, S3 and every should-fix and minor *"folded in correctly, but S1 isn't finished"* — two places
where the note contradicted the code, *"from timing and shared call sites, not from the design"*. *"Once items 1 and 2 are
folded in, I'd send it on."* Confirmed: `far` 648, the rig's first pose 453, the HUD in world cm (563); S2 / S3 match the
snippet; the 0.001 cm threshold ≈ 1e-10 relative at r = 2 m; "only v3 is ever written"; the carried questions recorded
as not objected, not approved.

| item | the review | checked | folded (v3.2) |
|---|---|---|---|
| T1 must | migration can't freeze `d`: it runs in `readChain` from `useState(loadChain)` (809), before any measure — a migrated chain has clips and `units: null`, refused by v3.1's own rule; "first commit" too late for playback / join metres. Fix: the store fills units on the first measured frame whenever null, commits at once | ✔ line 809 | §4 the capture rule, validation |
| T2 must | Home shares playback's conversion: `setRig(jumpTo === "front" ? front(m) : jumpTo)` (460) → `toWorld`; `front(m)` is live-`d` units. Fix: Home to world directly (as 453), or world → chain units; `__cameraBench.front` (583) | ✔ lines 460, 583 | §4 table, two rows |
| should | the first `theta0` capture was circular (`theta1` may not exist; laps not stored): first capture raw `atan2`; "End here" unwraps by the laps + direction stated then; re-capture beside the previous; the broken code span | ✔ | §3 |
| should | define "the previous clip": `sourceAt(T − PROBE)` (any track); `v0` in a gap = 0 | ✔ the snippet took the latest end (16) | §2 start row |
| should | two migration verdicts (`from: 1` only today); R1's persistent "differences" line must survive | ✔ line 764 | §4 `migrations: [ … ]` |
| minor | the cm threshold on d-unit radii needs the chain's units | — | §3 |

**Confirmed by the review of v2:** the path ~63 m / ~24 s; §5a's overwrite risk real; the inspector and harness view would
throw on a shape clip; the rig's yaw unbounded (`camera-pad.ts:101`); `bench-transport.tsx` and `camera-pad.ts` read no
samples.
