# The Architect's review of probe 2 (28 November 2026)

Reviews `architect-probe2-headed-28-november.md`. Routed by Carl (pasted, 28 November 2026).

## Verdict
The decisive measurement; it matches Carl's eye (*"still a significant delay"*). Headed, base is 0.52–1.03 s late on a
first visit; splitov 0.19–0.23 s in all five rounds, no hitch, safe margins; side by side out.

## 1. ⚠ What fixed it may be the REQUEST ORDER, not the gate
splitov's whole warm-up ended at 8.89 s against base's 10.64 s (~1.75 s sooner, ~0.67 s before the due 9.56 s); the new gate
opened only 0.13 s before the old one would have. So most of the gain may come from asking for the fade FIRST (in base's
first gather it waits behind every opaque object). A third variant, **REORDER ONLY**: splitov's extra call (not awaited,
first) with the gate left as `warmed`. Not structural (the existing mechanism, as `warmShadow`); removes the swap guard,
the touchdown guard and the floor-web question; Option D not needed. Check from the probe-2 logs: each splitov cold round's
warm-up end against the logo's due. Earlier in every round → reorder only very likely on time too: confirm with one
interleaved run (reorder only against splitov) before planning. Later in any round → the split gate earns its place.
Treat as a hypothesis (the last two estimates were wrong). Also confirm whether the first whole-scene gather requests the
fade a second time (the same key); the plan should state it.

## 2. If the split gate is still needed
Structural, Carl's call. The swap guard (hold the fade material) — the plan must say what the story looks like in it
(sorting vs the heat plane and floor web, alpha-to-coverage edges, shadows). Touchdown: a guard in CODE, not a margin.
The floor web: with a split gate the logo can appear before `warmed`; the web, gated on `warmed`, would pop in under it —
state the warm-up's end against the logo's draw for every round and what happens on a load where it is later. The
full-story check not needed for splitov.

## 3. Settled
Side by side withdrawn. No hitch at the fade or the swap in any mode.

## 4. New, not this chunk
- The committed version shows a **49.8 ms frame just after the fade begins** (base, cold): record in `open-defects.md`
  (Carl's to schedule; reorder or the split may remove it — splitov's worst 33.3 ms).
- Headed first frame ~3.1–3.5 s vs headless ~2 s: check whether the race fix moved it (against the pre-fix headed loads
  the race did not hit). It bears on "avoid a black viewport".
- Carl's Incognito test fairly represents a first visit; judge the fix the same way, the recorder off.

## Order
1. Builder: per-round warm-up end vs due from the logs; whether the first gather requests the fade again. 2. If earlier in
all five: one confirming interleaved run, reorder only vs splitov (a temporary probe build: Carl's word first); on time →
plan reorder only (not structural; still to plan review). 3. Otherwise: plan the split gate with §2's guards, for plan
review and Carl's ruling on Option D. 4. Carl judges in Incognito, headed, recorder off. 5. The 49.8 ms frame to
`open-defects.md`; the headed first frame looked into separately.

---

## The Builder's answers to step 1 (from the probe-2 logs, no new run)

**Warm-up end against the due, splitov, cold** (s after the paint; margin = due − warm-up end):

| round | warm-up done | due | margin | logo drawn |
|---|---|---|---|---|
| R1 | 9.39 | 9.56 | **+0.17** | 9.79 |
| R2 | 8.89 | 9.44 | +0.55 | 9.63 |
| R3 | 7.59 | 8.44 | +0.85 | 8.64 |
| R4 | 10.04 | 10.44 | +0.40 | 10.64 |
| R5 | 8.52 | 9.60 | +1.08 | 9.80 |

- **Earlier than the due in all five rounds.** Reorder only is very likely on time, but R1's margin is thin (0.17 s), so it
  needs the confirming run (step 2).
- Base, for comparison: the warm-up ended AFTER the due in every round (−0.51 to −1.01 s).

**The duplicate request:** the fade's pipeline was requested from the GPU ONCE per load in every round (the depth's once,
the opaque's once). The first whole-scene gather's request for the same key never reached the GPU a second time.

**The floor web in splitov:** the warm-up ended before the logo was drawn in all five rounds, so the web did not pop in
under a logo already shown on these loads.

**The headed first frame, before against after the race fix:**
- Before the fix (the loads the race did not hit): 3.40 s cold and 2.27 s on return. Only 2 samples.
- After the fix: base 3.12–4.10 s cold, ~3.09 s on return.
- Inconclusive. Not looked into further.
