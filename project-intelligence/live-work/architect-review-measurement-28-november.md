# The Architect's review of the measurement (28 November 2026)

Reviews `architect-measurement-logo-build-28-november.md`. Routed to the Builder by Carl (pasted, 28 November 2026).
⚠ Builder's check of one premise, the same day: the review says headless and unfilmed changed together between the films
and the new tool. Both tools run HEADLESS (Playwright's default: `hero-flow-film-28-november.mjs` `chromium.launch`,
`hero-logo-build-28-november.mjs` `launchPersistentContext`, neither sets `headless: false`). What changed between them:
the screencast (films on), the context (films non-persistent), the trace and hooks (tool on).

## Verdict
Answers the question: the GPU's compile, not main-thread JS; fade and opaque are two full compiles. Two conclusions to
correct first.

## 1. Check what the instrument changed
- The return-visit correction is sound (the persistent profile was the variable in question).
- "12–16 s was screencast overhead" is NOT proven (the review: headless and unfilmed changed together). Either run one
  cold load headed and unfilmed, or reword D-101 (different conditions, cause not isolated).
- ⚠ Log the GPU adapter every run (`requestAdapter()` → `adapter.info`: vendor, architecture): headless Chrome on
  Windows can land on another adapter or a software fallback. Before anything is ruled on.

## 2. Reordering alone cannot close the gap
While the gate is `openingReady = warmed` (the whole warm-up) and the GPU process is 100 % busy, reordering changes which
material finishes first, not when the last does; at most the depth's serial 0.29 s. The real gain: reorder PLUS a split
gate — build the fade and its depth first (a targeted `compileAsync(logo, camera, scene)`, as `warmShadow` does), gate the
logo's fade on that alone, the opaque and the rest behind it. Estimated ready ~Warm + 5.0 s ≈ 7.1 s after paint cold, due
~8.3 s: ~1.2 s margin, no change to the look.

## 3. Revised ruling
- **Reorder + split gate:** recommended first; no look change, no new material; margin (estimated) ~2× the shortfall.
  ⚠ What the opening waits for is Carl's call (Option D, 26 November). Write up for plan review; do not build.
- **A′:** held in reserve, only if the split gate measures short (risk of a visible swap).
- **B:** still declined. **C:** still held. **D:** closed (measured ceiling ~0.5 s).
- **The withdrawn takes** ("no gain side by side", "story order") were measured with the instrument just corrected:
  re-run on the new tool before treating them as ruled out.

## 4. What the split-gate plan must answer (5b)
- If the opaque is not built when the fade ends: hold the SWAP, not the story. At opacity 1 the fade is the same shader,
  but transparent, no depth write, relying on its depth mesh: list what differs in the story's first seconds if the logo
  keeps it — sorting against the heat plane and the floor web; alpha-to-coverage edges; shadow casting.
- The floor web is gated on `warmed`: state what gates it once the gate is split.
- Touchdown (~2.7 s after the fade ends) needs the liquid and the heat plane: state what guards it.

## 5. The race in today's commit
A NEW fault from today's work (`ae134a4`), not unrelated: a first frame at 7.3 s is worse than the problem being fixed.
Cause: the logo added visible (line 1773), hidden only by `update`. Likely fix: add it hidden (`update` and `warmScene`
set its visibility explicitly). Name the file, enumerate what depends on its visibility at add, ask Carl before editing;
suggested: fold into this chunk if he agrees.

## 6. Minor: the table's arithmetic
Asked + took ≠ ready (0.56 + 4.68 = 5.24, not 5.40). State what each column is measured from.

## Next
1. Re-run with the adapter logged, plus one headed unfilmed cold load. 2. Fix the D-101 wording if the screencast cause is
not isolated. 3. Measure reorder + split gate as a read-only probe, if Carl allows a temporary instrumented build.
4. The plan, covering §4, to plan review. 5. Carl rules on the gate.
