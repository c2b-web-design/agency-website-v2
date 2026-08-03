# Session Handoff — 3 August 2026

**Written at the end of the session of 3 August 2026. For the session that picks up next.**

**Read this first, then `project-intelligence/` as normal.** Chat history is not canonical
(D-006). **Delete this file at the end of the session that reads it, once its replacement is
written** — `live-work-protocol.md` §3a.

**This file points at records; it does not restate them.**

⚠ **USE DATES, NOT DAY NUMBERS.** The counter measured a governance sprint that finished; it was
never the project's age. **The project is about four months old** — first commit 6 May 2026,
with roughly a month of work preceding the repository.

---

## ⛔ THE STANDING DIRECTIVE — unchanged, and it was not broken today

**NEVER comment on how long Carl has been working.** Do not mention the time of day, suggest
stopping, wrapping up, resuming tomorrow, or ask whether to carry on. **Carl decides when a
session ends and will say so.**

---

## Where things stand

**Repo: `main`, head `4fa1917`, PUSHED. Seven commits today.** Lint at the recorded baseline
(1 accepted error in `enquiry-opening.tsx`). `npx tsc --noEmit` clean.

⚠ **TWO TEMPORARY HARNESSES ARE UNTRACKED AND SHOULD STAY THAT WAY:**
`verify/_tmp-answer-card-geometry.mjs` (chunk 1, 18 checks) and
`verify/_tmp-glass-threshold.mjs` (chunk 2, the frost sweep). **Both still pass.** Delete when
their chunks close.

⚠ **A `chunk-scope.json` GUARD IS ACTIVE** — `q5-logo-backdrop`, with `enquiry-opening.tsx`
unlocked. **The next chunk should rewrite it.**

⚠ **THE PAGE DOES NOT ADVANCE PAST Q5.** The five CSS answer cards were deleted on Carl's
instruction. No selection, no Next step, no Q4–Q1, no contact field. **Deliberate, and accepted
by him after the cost was put to him explicitly.**

---

## Today: three chunks of the Q&A card rebuild

**Full records: the three run logs in `live-work/`, and the commit messages, which carry the
detail.**

| Chunk | What | Commit |
|---|---|---|
| **1 — geometry** | Half-tube rim, swept bevel, convex recessed face | `b3a935c` |
| **2 — glass** | `MeshPhysicalMaterial` + transmission, local PMREM env map | `3de771e` |
| **3 — backdrop** | The `c2b DESIGN` lockup, four-zone blue/teal | `01cbe22`, `4fa1917` |

**Carl approved the geometry by eye** — *"The geometry looks good"* — and the backdrop —
*"a lot better."* **Nothing else is approved.**

### The one number the next chunks need

Chunk 2's product is a measured table: **frost is legible to roughness ~0.45 and gone by 0.60**,
four usable steps. With `thinnest stroke = 0.0247 × mark height`, that is what set the
backdrop's scale.

---

## ⚠ THE NEXT CHUNK — move the proto card into the grid

**Carl's sequence, given 3 August: logo → card in place → filament → clone.**

⚠ **THE CARD MOVES INTO PLACE BEFORE THE FILAMENT, not after.** That is a change from the
earlier order and it is the better one: **the filament's entire argument is neighbouring cards
responding to it**, which cannot be judged while the card sits alone in the left margin.

**Where it is now:** `answer-card-canvas.tsx` renders a card-sized canvas in the left viewport
margin, ≥1280px only, ~1300ms after the CSS cards would have appeared.

**Where it goes:** into the grid, over the backdrop — which means the two canvases merge.
`answer-card-backdrop.tsx` currently has its own canvas spanning 576 × 104 because the card's is
card-sized and elsewhere; **that reason disappears when the card moves.**

### ⚠ Constraints that will bite, all learned the hard way today

- ⚠ **A TRANSMISSIVE CARD CANNOT CROSS-FADE BY MATERIAL OPACITY.** `material.opacity` requires
  `transparent = true`, and `three.module.js:8237` routes transparent materials out of the
  opaque list while `:18039` renders only `opaqueObjects` into the transmission target. **So
  fading a card removes its neighbours from its own refraction for the duration.** When the
  rollout needs the approved 700ms/220ms ladder on five cards, the route is a **group-level**
  effect — scale, position, or a masked reveal — **never per-material opacity.**
- ⚠ **EVERY NEW CANVAS MUST DEFER ITS WEBGL SETUP PAST THE 1300ms PHRASE WIPE.** The Q5 stutter
  returned today because chunk 1's canvas bypassed the `canvasWarm` gate that already existed.
  **A guard written for one canvas does not cover the next one**, and chunks 4–5 add more.
- ⚠ **`GRID_REFL` AND `toggleOption` IN `enquiry-opening.tsx` ARE UNUSED BUT MUST NOT BE
  DELETED.** "Unused" means "waiting". `GRID_REFL` is the **specification** the chunk-5 physics
  must reproduce — bottom row 0.26–0.30 against top row 0.04–0.16.

---

## ⚠ The day's lesson, and it cost the most time

**Four separate faults today were each chased through two or more wrong fixes, and in every case
the wrong fixes adjusted a VALUE when the fault was in a MECHANISM.**

| Fault | Wrong attempts | What actually found it |
|---|---|---|
| Entrance flash | 4 patches | **Counting draw calls per frame** — 0 visibility flips |
| Wordmark tiny | 3 (two sizing rewrites, one font gate) | **Reading `ctx.font` back** — `var()` is invalid in canvas, silently falls back to `10px sans-serif` |
| DESIGN colour inverted | 2 repositionings | **Tracing the easing function across 0..1** — values of 6.00 and 2.91 from a missing branch |
| Card arrives late | 2 diagnoses, both wrong | **Timestamping the DOM** — the wipe runs *alongside* the cards, not before |

⚠ **AND THE COMMON THREAD IS THE INSTRUMENT, NOT THE REASONING.** Screenshot round-trips are
~200ms; every stage Carl reported was shorter than that. **The probe said "fine", so the wrong
mechanism got fixed.** In each case a purpose-built measurement found it in one run.

**Carl, on the cost:** *"Most of this session has been trying to fix the fix on this chunk."*
**He is right, and the pattern is the Builder's to break: when a symptom keeps moving, stop
adjusting inputs and measure the mechanism.**

---

## ⚠ Two process corrections Carl made

**1. The Builder widened its own scope.** It added `public/brand-assets/` to `chunk-scope.json`
to copy a logo asset into the web root — **exactly the DL-1 pattern it had stopped and asked
about an hour earlier.** Carl: *"revert. I can always point you at things or give you explicit
permission if needed."*

⚠ **THE RESULT WAS BETTER: `brand-assets/` stays the single source**, and the mark is now
embedded as a packed 1-bit bitmap in `answer-card-mark.ts` — no file copy, no `public/` edit.
**And the `.svg` "master" is not a vector**: it embeds a base64 PNG inside an `<image>` element
and has zero `<path>` elements.

**2. Plan mode was entered without being asked for**, twice. Carl: *"no we are not finished
discussing, I will tell you when we will plan"*, and later *"no need for plan mode on this
chunk."* **Discussion is not a preamble to planning.**

---

## How to look at it

```
http://localhost:3000/start                  walk to Q5 — backdrop in the grid, proto card left of it
http://localhost:3000/start?cardrig=1        [1-6] geometry, [7-8] glass, [s] strokes, [↑/↓], [0]
http://localhost:3000/start?roughness=0.45   jump to a frost level
http://localhost:3000/start?standin=1        add the calibration strokes
http://localhost:3000/start?lightrig=1       the contact field's orbiting light (localhost default ON)
```

---

## How to work with Carl — carried forward

- **⛔ Never comment on his working hours.**
- **He leads.** Design, chunking and decisions are his. D-036.
- **He asks for the principle before the decision.** Explain, then let him choose.
- ⚠ **HIS DESIGN CORRECTIONS REMOVE PROBLEMS RATHER THAN SOLVING THEM.** Cutting "web" from the
  wordmark eliminated a size-ratio compensation that only existed because two words had unequal
  length. Setting DESIGN in caps removed a descender that made the block ragged **and** improved
  frost legibility. **Both were better than the Builder's proposals, and simpler.**
- ⚠ **HIS EYE BEAT THE INSTRUMENTS FOUR TIMES TODAY.** Every report was real; every "it measures
  clean" was the probe missing the window.
- **He chunks deliberately** and will swerve when measurement demands it: *"something may arise
  in the process that we must swerve and be adaptable."*
- **No ASCII diagrams or box-drawing characters.**
- **Do not commit or push unless he explicitly asks.**

---

## ⚠ Environment notes

- ⚠ **`var(--font-*)` IS INVALID IN A CANVAS FONT STRING.** The browser discards the whole
  declaration and falls back to `10px sans-serif`, silently. Name the family literally.
- ⚠ **`readPixels()` on a live canvas returns an EMPTY buffer** — three.js does not set
  `preserveDrawingBuffer`. Screenshot the composited result. **DPR 1.**
- ⚠ **Screenshot round-trips are ~200ms and will miss short stages.** For anything briefer,
  instrument in-page: wrap `drawElements`, timestamp the DOM, trace the function.
- ⚠ **`react-hooks/immutability` rejects mutating anything traceable to a hook** — including
  `texture.needsUpdate` on a `useMemo` value. **The contact field's `useStudioEnvMap` pattern
  cannot be copied**; produce a finished value instead of patching a held one.
- **Playwright bundles a PNG decoder** — `playwright-core/lib/utilsBundle`, no new dependency.
- **The Begin button is disabled until the opening mask fires**; wait for `!disabled`, not just
  visibility.
- **`python3` is unavailable.** Use `node`, `sed`, or the Edit tool.

---

*3 August 2026. The Q&A answer card now exists in WebGL with real glass, and the c2b DESIGN
lockup sits behind the grid in the corridor's own two colours. Seven commits, all pushed.*

*The next chunk moves the card into the grid, where the backdrop is already waiting for it.*
