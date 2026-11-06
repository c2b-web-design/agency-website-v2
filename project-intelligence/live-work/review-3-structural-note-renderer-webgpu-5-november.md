# Review 3 — `structural-note-renderer-webgpu-5-november.md` (v1.2)

**Filed by the Builder, 5 November 2026, verbatim** as Carl pasted it. The Builder's notes are at the END, separate.

---

v1.2 is in. Checking the newly recorded approval against the review log, then reviewing the changes.

  Searched for 1 pattern

Verdict on v1.2: The design holds up, and both review-2 corrections (the deprecated environment call, the dynamic import) are made correctly. I checked R-094 in the review log and it is film 4's approval, as cited. What's left is consistency: Carl's Option A approval is recorded in one place but still marked as pending in four others, and the "untouched" claims say more than the plan does. One mechanism also needs naming before it goes to the Architect: how LetteringPiece learns which medium it's in.

Findings

1. Carl's Option A approval is written down once and contradicted four times.
- Line 88 records it: "Option A is fine, approval given."
- But line 9 still says "Carl's explicit word needed".
- Lines 129–130 say the arch enters "only on Carl's word; until then the WebGPU medium carries the hero alone".
- Line 151 says "on Carl's word".
- The header (line 4) lists the edit as still to be approved.

A reader can't tell whether it's approved. Make all four agree with line 88. The note itself stays PROPOSED until the Architect reviews it. Carl's ruling settles the choice between (a) and (b), not the whole structure, so say that too. Line 88 also has two parentheticals run together, "(it changes the file…) (not on the protected list, but approved shared work, R-094)", which reads like a pasted fragment. Merge them into one sentence.

2. "The WebGL medium's column is today's code, untouched" isn't true, even with the LetteringPiece exception. The note itself changes WebGL-side code in four other places:
- the grid's fade moves to setGridFade, and the cast leaves camera-bench.tsx:1314–1320;
- the anisotropy accessor replaces hero-blockout.tsx:1210;
- the Canvas gains a choice of renderer;
- the WebGL cost meter is reached through the seam.

What stays the same is the WebGL behaviour, not the code. Say that, and name what proves it: the 120 and 28 harness checks re-run unchanged in WebGL, plus film 4's before/after images. This matters for the same reason v1.1's "not edited" claim did. An approved bench is getting a refactor, and the note should say so.

3. The note doesn't say how LetteringPiece gets the active medium. "Takes the environment and the compile wait from the active medium, the WebGL helpers as the default" could mean props, a React context, or LetteringPiece importing the medium module. That last option would pull the WebGPU half into film 4's page and undo the dynamic import. The interface is the whole content of the approved-file edit, so name it. The likely fit is a context whose default is the WebGL helpers, provided only by the bench's WebGPU medium.

There's also a risk to name here: usePrefilteredStudio is a hook. Picking between two hooks per medium, or calling a hook taken from a context, may trip the hooks lint, and the project baseline is zero warnings. One way out is to inject the twins as plain functions rather than hooks. I haven't run the lint on either shape.

4. The dynamic import should finish before the Canvas mounts. If the WebGPU grid and lines are loaded lazily inside the canvas, they suspend. The bench has a recorded failure here: a suspend that reaches the outer boundary forces "Context Lost" (camera-bench.tsx:1848–1851, measured 26 October). The safest order is to await import() the medium module, then mount the Canvas, so nothing renderer-specific suspends inside it. If the note keeps lazy loading, it should say which Suspense boundary catches it.

5. Minor: film 4's before/after check covers the page but not the bench's arch. The bench's arch in WebGL runs through the same edited LetteringPiece. The harnesses cover it only if one of the 120 checks reads the arch's drawn state. Say which check does, or add a bench image of the arch before and after.

What's resolved: every review-2 finding is folded in and the citations are correct (PMREMGenerator.js:217/240, the tone-mapping line moved out of the seam, the typing list including 1314–1320 and 277). Once 1–4 are tidied, I'd consider it ready for the Architect.

---

## The Builder's notes (separate from the review)

- **Finding 1 — confirmed** by searching the note: the approval recorded at §3 (a), still "pending" in the header, the v1.2
  line, §4 (2) and §5. All made to agree in **v1.3**; the note stays PROPOSED; Carl's ruling settles (a) vs (b) only.
- **Finding 2 — taken:** the WebGL BEHAVIOUR is unchanged, the code is refactored at five named points; the proof named.
- **Finding 3 — taken:** the interface named — a React context, its DEFAULT the WebGL path, provided only by the bench's
  WebGPU medium; the environment injected as a COMPONENT and the compile wait as a plain function, so no hook is ever chosen
  per medium. The lint on that shape is the build's first check [to verify].
- **Finding 4 — taken:** the medium module is awaited BEFORE the `Canvas` mounts.
- **Finding 5 — confirmed:** `camera-bench-verify-26-october.mjs:72` is `check(true, …)` after waiting on
  `[data-camera-bench="drawn"]` — it proves the arch DREW, not that it looks the same. A bench image of the arch, before and
  after, added.
