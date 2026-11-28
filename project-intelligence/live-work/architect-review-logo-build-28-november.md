# The Architect's review of the logo-build note (28 November 2026)

Reviews `architect-note-logo-build-opening-28-november.md` v1.0. Routed to the Builder by Carl (pasted, 28 November 2026).
Code facts the review relies on were checked by the Builder against `hero-scene.ts` the same day: the fade material is a
`clone()` of the full `logoMaterial` with its own program key (`:fade`); `warmScene` gathers twice (fade, then opaque); the
`warmed` gate opens in `.finally`; the swap fade → opaque happens at `opening.done`.

## Verdict
The diagnosis is sound and the measurement is the right next step, with one change first. No route is built until the
measurement is back and Carl has ruled.

## 1. What the note missed: the logo already has two full copies of its shader
The fade material is a clone of the full material (own key, `:fade`); the opaque one uses alpha-to-coverage; they build
separately, and `warmed` opens only once both are done. So stage A's ~10 s is likely TWO builds of the largest shader, plus
the floor web. Consequences: the measurement must time fade and opaque separately; Route A needs no second material (A′:
make the EXISTING fade material light — red metal only, the same `positionNode` so the depth mesh still matches; no new
material, no new swap); a gate on the fade material alone has never been measured.

## 2. The measurement, amended (read-only, the Builder's)
1. Time each logo material separately (fade + depth; opaque): node build, pipeline promise, WGSL size.
2. Total main-thread busy time over the ~10 s (Long Animation Frames or a trace): mostly busy → (i) JS; mostly idle → (ii)
   GPU. The worst hold and the side-by-side test cannot separate them.
3. The return visit once in a PERSISTENT profile (`launchPersistentContext`): unchecked whether Playwright's default
   context keeps Chrome's GPU shader cache as Carl's Chrome would; until then the return visit does not rule out (ii).
4. At least 5 runs per condition, medians.

## 3. The routes
- **A′** (A reframed): recommended IF the fade's build is a large share. Structural (5a): changes what the fade material is
  and splits the gate. Write it up for plan review; do not build.
- **B**: declined — brings back mid-story builds at each phase boundary; each swap another chance of a glitch.
- **C**: hold until §4 is back; constants → uniforms can stop constant folding and make it worse; any look change needs
  Carl's eye.
- **D**: only alongside another route; its gain is bounded by when `prefiltered` lands — state when the prefilter finishes.
- **E**: Carl's call.

## 4. What the note's §6 missed (5b)
- The fade → opaque swap at `opening.done` is invisible today only because both are the same shader (unwritten). Under A′
  it is the main risk: the light material must match the opaque's red state exactly at full opacity on the swap frame —
  prove by a frame diff across the swap, in both films; the opaque must be built before the fade ends — state the fade's
  length and the fallback if not (hold the fade at 1, or other: a structural choice).
- The story clock starts when the fade ends: with a split gate, touchdown (~2.7 s later) needs the liquid and heat plane
  built; say what gates touchdown if not.
- `warmShadow` already builds the logo in its opaque material; A′ leaves it — record it.

## 5. An existing fault (flag only, not this chunk)
`warmScene(...).finally(() => { warmed = true; })` opens the gate even when the warm-up FAILS: the logo would fade in on
pipelines never built, and r185 skips those — it would vanish. Carl's to schedule; not to be fixed quietly in this work.

## Next
1. The Builder runs the amended measurement. 2. Reports the fade/opaque split and main thread vs GPU. 3. If A′ holds, its
plan (with the swap's frame-diff proof and the two gate fallbacks) to plan review. 4. Carl rules.
