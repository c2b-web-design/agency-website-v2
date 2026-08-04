# Session Handoff — 4 August 2026

**Written at the end of the clone / hover / choreography session. For the session that picks up
next.**

**Read this first, then `project-intelligence/` as normal.** Chat history is not canonical
(D-006). **Delete this file at the end of the session that reads it, once its replacement is
written** — `live-work-protocol.md` §3a.

**This file points at records; it does not restate them.**

---

## ⛔ THE STANDING DIRECTIVE

**NEVER comment on how long Carl has been working.** Do not mention the time of day, suggest
stopping, wrapping up, resuming tomorrow, or ask whether to carry on. **Carl decides when a
session ends and will say so.** It was not broken today.

---

## Where things stand

**Repo: `main`, head `b25fb5f`, COMMITTED and clean.** Lint at the recorded baseline (1 accepted
error in `enquiry-opening.tsx`); `npx tsc --noEmit` clean.

⚠ **THE PREVIOUS HANDOFF'S "WORK IS UNCOMMITTED" WARNING WAS STALE ON ARRIVAL** — two commits had
landed after it was written. Worth knowing as a live example of §3a's own argument.

⚠ **`chunk-scope.json` IS STILL DELETED — the repo is FAIL-OPEN and every edit is allowed.**
Unchanged from the last handoff. **The filament chunk must be given a new one, and that is part of
authorising it, not an extra** (§8). PM/A drafts, **Carl approves; `unlocked` is Carl's alone.**
Declare `verify/_tmp-*.mjs` up front — the guard has blocked throwaway probes twice for want of it.

⚠ **THE PAGE STILL DOES NOT ADVANCE PAST Q5.** No selection, no Next step, no Q4–Q1, no contact
field. Unchanged, on Carl's standing instruction.

### What this session did

**Full record: `live-work/run-log-clone-and-beats.md`** — four passes, the faults, and the
measurements. Headline: five cards cloned, hover inversion confined per card, six-beat entrance,
and the stall fixed.

**Carl's verdicts:** *"its good"* (the 2000ms fade), *"looks good"* (the ladder once stepping),
*"That looks great"* (the lockup balance). ⚠ **These are approvals of the MECHANISM AND THE
TIMING. They are NOT approval of the frost level or the lockup's opacity** — both explicitly still
to come.

---

## ⚠ THE NEXT SUBJECT — Carl named it as he approved the lockup

> *"Remember, the opacity of the text is gonna be reduced and the glass will be slightly frosted."*

**Two faders, and they are the mastering pass the previous handoff already recorded as method:**

> *"we build the new button. we add static light. then like pushing two faders up at once, we add
> light and frosted glass to get the effect we want. Rather than start with frosted glass at a
> half way point, we bring the 'volume' down same for the lights, and push the faders up."*

⚠ **THE RIG IS STILL NOT READY FOR IT.** `?cardrig=1` has roughness `[7]` and transmission `[8]`.
**Light has no fader.** Add one before the pass, or Carl tunes one by ear and one by file edit.

⚠ **AND THE THREE VALUES ARE ONE SYSTEM** — frost, lockup opacity, and (later) amber intensity.
See `references/filament-design-reference.md`, the coupled-system section. **Do not pick a frost
value and tune the others around it.**

---

## ⚠ Then the filament — design already settled, unchanged

### → `live-work/references/filament-design-reference.md`

**Read it before planning that chunk.** *"obey the physics, but the physics of heat rather than
the physics of drawing."* The rim is the UNLIT FILAMENT — a metal element present at rest that
heats up, not grey waiting to be covered.

**Carl's sequence, and the clone step is now DONE:**

1. ~~Clone the cards~~ — done this session
2. **Frost + lockup opacity** — the two faders above, next
3. **Filament on card 1**, then rolled out
4. **New button design** — Next step, in WebGL

⚠ **THE ORDER OF 1 AND 3 WAS SWAPPED THIS SESSION, ON CARL'S DECISION.** He asked which was
better; the argument that decided it was that the filament's justification is light spilling onto
NEIGHBOURS, which cannot be judged with one card. Recorded because the previous handoff had them
the other way round.

---

## ⚠ Open questions — Carl's to answer, still unresolved

Both carried from the previous handoff, neither raised this session:

- **Does the amber sing or stay restrained?** Near-complementary against the backdrop's blue and
  cyan, so it will be the most saturated thing on the page.
- **The filament and the region shift run on one clock** — whether two simultaneous events read as
  too much is an eye judgement, not settled.

---

## ⚠ The session's lesson — the instruments failed EIGHT times

**`ai-system/working-with-the-builder.md` HAS THE SHARED CORRECTIONS RECORD.** New entries go
there. **It is shared, not a Builder fault list** — Carl: *"mistakes are not exclusive to AI."*

⚠ **THE BIG ONE, AND IT INVALIDATED TWO DIAGNOSES REPORTED TO CARL AS FACT:** every GPU timing
before the third pass came from **headless Playwright, which has no GPU** and was running
SwiftShader — shader compilation and the transmission pass on the CPU. A "~2900ms fixed cost of
putting glass on screen" was reported to Carl as a property of the page. **Real GPU: 349ms.**

**THE RULE THIS ADDS: for anything GPU-timed, headless Playwright is not the machine under test.**
Run headed with `--enable-gpu`, and **print the renderer string** so the substitution cannot happen
silently.

⚠ **AND A SECOND PATTERN, SEVEN TIMES OVER: every failing instrument reported ABSENCE** — which is
exactly what a genuine defect also reports. `gl.readPixels`, `drawImage`, Playwright `screenshot()`
(first call ~4900ms, longer than the animation it was catching), the r3f scene walk, a warm-up gate
that opened with `canvases=0`. **An instrument must be shown capable of reporting PRESENCE before
its absence means anything.** The probes that worked all carried a positive control.

⚠ **CARL'S EYE BEAT THE INSTRUMENTS AGAIN, TWICE.** He located the stall to *"between cards 1+2"*
— the exact gap the trace then confirmed. And on the confinement bug the Builder argued **two
wrong diagnoses** before opening the screenshot, which showed the real fault immediately. **The
image was available the whole time.**

---

## How to look at it

```
http://localhost:3000/start                  the walk: six beats, then hover any region
http://localhost:3000/start?beattrace=1      performance.mark per beat (dev only, free without it)
http://localhost:3000/start?cardrig=1        [1-6] geometry, [7-8] glass, [↑/↓] adjust, [0] print
http://localhost:3000/start?roughness=0.45   jump to a frost level
```

⚠ **`?cards=N` WAS ADDED AND THEN REMOVED THIS SESSION.** Its finding — that five cards cost the
same as one — was taken on the software rasteriser and is not trustworthy. **A knob whose finding
was invalidated is worse than no knob**, because the next reader trusts it.

---

## How to work with Carl — carried forward

- **⛔ Never comment on his working hours.**
- **He leads.** Design, chunking and decisions are his. D-036.
- **He asks for the principle before the decision.** Explain, then let him choose.
- ⚠ **HE GIVES CONSTRUCTIONS, NOT JUST CORRECTIONS.** Asked to balance the lockup he did not say
  "move it a bit" — he specified *"the N of DESIGN can end at the same distance from the perceived
  edge as when the c starts"* and *"put that half way point at the half way point in the gap."*
  **Both were exactly buildable and both worked first time.** Ask for the construction.
- ⚠ **HE CORRECTS FALSE PRECISION.** *"it doesnt have to be exact, im looking for ball park
  figures. A user wont be able to tell one card has, say 5% more text than others."* The Builder
  was chasing decimal points on a spread the eye reads as balanced-or-not.
- ⚠ **HE TREATS NUMBERS AS A RANGE TO BRACKET, NOT A VALUE TO GUESS.** *"if we change 1100ms to
  1500ms and its too slow we will have a range to work with."* Offer brackets.
- ⚠ **AND THE FIGURES ARE NOT SACRED.** *"figures are not set in stone. We are redesigning the
  q+a system, the figures can act as a guide. Some CSS timings may not translate so well."* The
  Builder had been guarding the approved CSS ladder as if it were canon; it was tuned for cards
  that no longer exist.
- **No ASCII diagrams or box-drawing characters.**
- **Do not commit or push unless he explicitly asks.** He asked this session; `b25fb5f` is the
  result. **Nothing is pushed.**

---

## ⚠ Environment notes — additions from this session

**The earlier handoff's environment notes all still hold.** New:

- ⚠ **`transparent: true` REMOVES A MATERIAL FROM THE TRANSMISSION TARGET** (`:8237`, `:18039`).
  **No WebGL element on this page can fade by opacity** without dropping out of what the glass
  refracts. The card entrance fades by LIGHT; the lockup fades by painting toward `GROUND_COLOR`.
- ⚠ **`compileAsync` WALKS THE SCENE GRAPH; THE TRANSMISSION PASS IS NOT IN IT.** A transmissive
  material's real cost lands at first DRAW. Warming it needs an actual `render()` with the meshes
  temporarily visible — a plain render skips invisible objects and is a silent no-op.
- ⚠ **THE PHRASE BAND IS GATED ON `stage !== "opening"`**, so nothing inside it — including the Q5
  grid and its canvas — exists during the opening. Anything that must warm up before Begin has to
  mount OUTSIDE that gate.
- ⚠ **TWO WARM-UPS NOW EXIST AND THEY MUST NOT COLLIDE.** The contact field's guard was written
  when the phrase was the only thing after Begin; it now also waits for `ENTRANCE_END_MS`. **A
  third canvas would need the same treatment.**
- ⚠ **`textBaseline: "middle"` IS NOT A GLYPH'S VISUAL CENTRE**, and `measureText().width` is not
  its ink width. Use `actualBoundingBox*` for both — they were 6.3px and 56.5px adrift here.

---

*4 August 2026. Five cards arrive on a six-beat ladder, the lockup balanced across them, hover
inverting each region in its own box. Committed at `b25fb5f`, unpushed.*

*Next: the two faders — lockup opacity down, frost up.*
