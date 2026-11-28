# The Architect's review of the split-gate probe (28 November 2026)

Reviews `architect-probe-split-gate-28-november.md`. Routed to the Builder by Carl (pasted, 28 November 2026).

## Verdict
A well-built probe; answers "on the right track": yes — the logo's build is the whole problem, the GPU's compile.
Recommendation: side by side (a) as the take, once the three checks in §3 pass.

## 1. ⛔ The race comes first
Headed (how a real visitor's browser runs) it hit 2 of 4 loads: ~half of real first loads may get a first frame at ~7.3 s
instead of ~2 s — far worse than the logo 0.2–0.4 s late. Fix it before any logo work; it contaminates any headed
measurement (the outstanding headed unfilmed run included). A new fault from `ae134a4`; Carl's word first (file, what
depends on the logo's visibility at add, then ask). Carl: top of the schedule.

## 2. The earlier estimate was wrong; the probe may have tested a narrower split
The ~7.1 s / ~1.2 s margin assumed the rest overlapped behind the fade; it ended at 12.2 s. State whether the probe started
the rest AFTER the fade's promise resolved or at the same time (base shows the GPU overlaps compiles: two ~4.5 s in 6.9 s).
If one after the other, (b) as measured is not the split gate at its best — but see §4.

## 3. Side by side (a): three checks before it is ruled on (not structural under 5a; agreed)
1. ⚠ No synchronous builds over the WHOLE story (the cloth, marble floor, plinth, code drops, rain come after touchdown):
   the full story in side mode with `hero-pipeline-builds-16-november.mjs`; none may be made synchronously.
2. How the logo's two materials are handled per object (today's gathers swap them, `hero-scene.ts:2556–2563`): each its own
   call? the depth child included? (5b)
3. The per-round rows: with 5 runs "worst" is one sample; if side's worst came from the same round as base's 2.39, that is
   evidence side cuts the tail; if not, the tail comparison proves nothing. The medians differ by 0.06 s; side's measured
   gain is the warm-up 0.8 s sooner and possibly the tail.

## 4. Whether 0.2–0.4 s is late at all is Carl's eye
"Due" is the instant the last letter lands; 0.2–0.4 s after may read as the next beat. Once the race is fixed: Carl
watches a few cold first visits in side mode, headed, in his own Chrome. No visible lag → stop: split gate and A′ closed,
(c) never needed. A lag → re-measure the split gate with the rest requested at the same time (§2) before (c). (b) stays
structural, both fallbacks load-bearing on every cold load.

## 5. Still open
- The headed unfilmed cold run (waits on the race fix).
- The D-101 wording "12–16 s was screencast overhead" recorded as fact; the race showing headed and headless differ makes
  it more pressing.
- Confirm RDNA 2 is Carl's GPU in his own Chrome (`chrome://gpu`).

## Order
1. Fix the race (Carl's word first). 2. The headed unfilmed cold run; correct D-101 to match. 3. The side-by-side checks
(§3). 4. Plan side by side, to plan review. 5. Carl watches cold loads and rules on any lag.
