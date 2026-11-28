# Answers to the Architect's probe review (28 November 2026)

**For the Architect.** Answers `architect-review-probe-28-november.md` on the points that need no new code or run. The race
fix (§1) waits for Carl's word. So do the runs that come after it: the headed unfilmed run, and the full-story check of
side by side (§3.1).

## §2: how the probe ran the split gate

**One after the other.** The probe awaited the fade's targeted `compileAsync(logo, …)`, set its gate, and only then
started the warm-up's two whole-scene gathers. So the measured (b) is the split gate WITHOUT overlap: not the split at its
best, as the review suspected.

## §3.2: the logo's two materials in side mode

As committed, side by side kept the two gathers and the material swap between them. Only each gather's form changed: one
`compileAsync(o, camera, scene)` per visible top-level object, instead of one over the scene.
- **First gather:** the logo wears the fade material, and its depth child is visible. `compileAsync(logo)` projects the
  logo's subtree, so the depth child is included. The objects `warmScene` shows for the gather (cloth, marble floor,
  plinth, rain group, code drops, floor web, heat plane, liquid) are visible at that moment, so they are included too.
- **Second gather:** the logo wears the opaque material, and its depth child is hidden.

So each material gets its own call, and the depth child goes with the fade's call. The probe saw ONE pipeline per
material per load in every mode, which is what keys matching the draw's would give. That is evidence up to touchdown
only: §3.1 is still to run.

## §3.3: the per-round rows (cold; LATE in s / the warm-up done, s after the paint)

| round | base | split | side | story |
|---|---|---|---|---|
| R1 | **2.39** / 11.41 | 0.16 / 12.17 | 0.30 / 7.84 | 0.50 / 9.58 |
| R2 | 0.18 / 8.44 | 0.13 / 10.90 | 0.25 / 8.10 | 0.17 / 8.19 |
| R3 | 0.15 / 8.26 | 0.12 / 11.15 | 0.26 / 7.57 | 0.30 / 9.06 |
| R4 | 0.36 / 8.89 | 0.18 / 14.08 | 0.31 / 8.54 | 0.35 / 10.21 |
| R5 | 0.58 / 9.03 | 0.18 / 12.87 | 0.40 / 8.09 | 0.95 / 10.56 |

On return visits, LATE was: base 0.09–0.22, split 0.10–0.23, **side 0.18–0.31**, story 0.13–0.29.

- **The warm-up:** side finishes sooner than base in all five paired rounds (by 0.35–3.57 s). That gain is solid.
- **The tail:** base's 2.39 s was round 1, where side was 0.30 s. That is one paired sample, which is weak evidence that
  side cuts the tail, not proof.
- **⚠ New:** apart from base's slow round, **side's logo is ~0.1 s LATER than base's**, cold (R2, R3) and **on every
  return visit**, where no gate limits it (the warm-up is done ~5.5 s before the logo is due). So side looks to carry a
  small cost of its own at the logo's moment. Unexplained; not measured further. One guess: more concurrent `compileAsync`
  chains keep the main thread busier around the frame the fade starts on.
- **The medians, as the review says,** differ by about as much as the rounding. Side's measured gains are the earlier
  warm-up and, possibly, the tail. Its median lateness is no better than base's.

## §5: the D-101 wording on the screencast

The cause is no longer asserted; it was ISOLATED by a single-variable test. It is recorded in the addendum to
`architect-measurement-logo-build-28-november.md` and in D-101 ("THE FILMING ISOLATED").
- **The test:** the same tool, the same build, headless both times, with ONLY the films' screencast switched on. The cold
  logo went from 8.84 s to 14.12 s (13.51–15.59), and each shader's compile from ~4.8 s to 7.1–9.2 s.
- **The films were headless too.** That was checked in the code (Playwright's default, no `headless: false`), so
  headless/headed was never one of the variables between the films and the tool.
- **What stays open is a different question:** whether HEADED timings differ, which is the review's point. The headed
  unfilmed cold run will answer that after the race fix.

## §5: chrome://gpu

This is with Carl: one line from his own Chrome confirms the adapter.
