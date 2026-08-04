# Session Handoff — 4 August 2026 (third session of the day)

**Written at the end of the filament / black-body session. For the session that picks up next.**

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

**Repo: `main`, head `59a6327`, committed and clean. ⚠ NOTHING SINCE `f57b6db` IS PUSHED** —
**nine commits are local only.** Lint at the recorded baseline; `npx tsc --noEmit` clean.

⚠ **`chunk-scope.json` IS STILL DELETED — the repo is FAIL-OPEN.** Unchanged all day. Carl has
directed every chunk conversationally and approved by eye; no scope file was drafted and he has
not asked for one.

⚠ **THE PAGE STILL DOES NOT ADVANCE PAST Q5.** Clicking a card fires its filament; that is not
selection. No Next step, no Q4, no contact field.

### What this session did

**The filament, twice — and the second version replaced the first entirely.**

1. **`94a4167`** — Carl reframed the whole chunk: *"does it have to move? become animated? No. it
   could fade in, like a real light bulb filament. How does light/heat work? Start of red, orange,
   white. blue"*. The travelling circuit was **deleted**, not disabled: 560 deletions against 229
   insertions. **That reframe removed four defects rather than fixing them** — all of them existed
   because something moved along a path.
2. **`a3acfa2`** — the end colour pulled back from white to amber. Carl: *"white looks too blown
   out."* His verdict on the result: ***"thats the best its looked."***
3. **`a17d582`** — the opening stutter, half fixed, plus the lockup dimmed to 50%.
4. **`662d657`** — two wrong records corrected.

---

## ⚠ THE FIRST JOB — the warm-up canvas is thrown away, and that is the whole problem

**Carl: *"the c2b DESIGN text entrance is not smooth."* Found at the very end of the session,
after the env map work below.**

**Measured, watching canvas mounts relative to Begin:**

```
+6902ms   the warm-up canvas UNMOUNTS   (0 canvases)
+6913ms   the real Q5 canvas MOUNTS     (1 canvas)

frame drops at +6690ms and +7066ms — straddling that swap
```

⚠ **A WEBGL CONTEXT IS PER-CANVAS.** Everything the warm-up compiled — programs, PMREM, the
transmission target — **dies with it.** The replacement rebuilds all of it from scratch, at exactly
the moment the lockup begins its fade.

⚠ **SO THE WARM-UP AS DESIGNED CANNOT HELP THE CANVAS THAT REPLACES IT.** It only ever warmed the
driver's binary cache, which is why cold and warm runs differed while the stall never went away.
**Every fix aimed at making the warm-up better was aimed at the wrong object.**

### → The fix is the Architect's option D, and it needs its own chunk

**One canvas instead of two — mounted early, revealed late**, the pattern `enquiry-opening.tsx`
already uses for the contact layer. The Architect's note: *"The objection at `:1111` is true of
MOVING the node, not of rendering it once at a stable position and placing it with CSS."*

⚠ **DO NOT START IT AS A TWEAK.** It changes where the card canvas mounts in the tree.

---

## ⚠ AND ONE APPROVED COMPONENT WAS EDITED, WITH CARL'S EXPLICIT AUTHORISATION

**`contact-field-canvas.tsx` now sets `gl.debug.checkShaderErrors = false`.** Carl: *"do what it
takes to fix it."*

**The flag IS in effect** — control confirms `getProgramInfoLog` goes 6 calls / 445ms → **zero**.
**It did not fix the entrance**: frame drops identical before and after. So the 450ms of self-time
the profiler charged to `getProgramInfoLog` was **a wait attributed to the waiter**, the same
misattribution that earlier pointed at `onFirstUse`.

**Kept** because the queries were real, blocking, and bought nothing. **Nothing about the contact
field's appearance, timing or materials changes.** Flip it back while developing shaders there.

---

## ⚠ THE ENV MAP — done, but only deferred

**~572ms of PMREM work still blocks the opening.** The Architect found why the Builder's gating
never touched it: **`useLocalEnvMap` runs in a `useMemo` during React render**, so `mayCompile` /
`warm` — which gate `useScenePrecompile` only — never applied to it. Noted at the function itself.

### → Do the DEFERRAL, not the resize

Two routes exist. **Take the first:**

- **Move the allocation behind the warm gate.** Same deferral that just worked for the
  transmission pass, costs nothing visually, and needs no judgement from Carl.
- ~~`fromScene(studio, 0, 0.1, 200, { size: 64 })`~~ — **a VISUAL change and Carl's call.** It is
  a real lever (256 → lodMax 8 and a 768x1024 target; 64 → lodMax 6 and 336x256), but he has not
  seen 256/128/64 side by side. **Do not take it to save time.**

---

## ⚠ THE ARCHITECT WAS CONSULTED AND WAS RIGHT

### → `live-work/architect-answer-opening-stutter.md`

**Read it before touching the stutter.** Carl asked for it after the Builder had failed six times.

**The cause, which no Builder theory came near: every material compiles TWICE.** The program cache
key carries `outputColorSpace` (branching on `currentRenderTarget === null`) and `toneMapping`.
The canvas is sRGB + ACES filmic; the transmission pass renders to a target at linear +
`NoToneMapping`. Only the canvas variant was being warmed.

**Fixed in `a17d582`** — compile twice, once in each renderer state, via a 1x1 probe target.
`renderTransmissionPass` is now **absent from the profile's top fourteen**, down from 777ms.

⚠ **ONE CONSTRAINT THAT WILL BREAK IT SILENTLY:** lights are gathered with `traverseVisible`, and
`numPointLights` is in the cache key. **The `FilamentLight`s must stay in the always-visible outer
group.** Move one into a hidden group and every program warmed there becomes the wrong variant.

---

## ⚠ The session's lesson — a wrong "ruled out" is worse than no note

**Two of the Builder's six theories were retired by tests that never exercised the knob:**

- **`checkShaderErrors`** — set on the wrong renderer (the warm-up canvas has its own). The 0ms
  result meant nothing. Correctly retried: 1740 → 1692ms.
- **Env-map "resolution"** — `fromScene`'s fourth argument is the **far plane**. With
  `ENV_SHELL_RADIUS` at 60 the studio was inside the frustum either way, so **nothing could have
  changed**. The 5ms delta went into a **code comment that then forbade the real fix for hours.**

> **Both times the check was "did the number move", never "was the knob connected."**

**The control, and it is cheap: before trusting a null result, show the test CAN fail** — set the
parameter absurd and confirm a large move.

**And the classifier that would have found the cause at theory 1:** the task's DURATION never
changed across three reschedules, only its start time. **Duration invariant under scheduling means
the cost is intrinsic to an operation's FIRST USE.** That reaches the answer on the first hop.

**Both entries are struck in place in `references/opening-stutter.md`.** New corrections-record
entries belong in `ai-system/working-with-the-builder.md` (entries 5 and 6 are from today).

---

## ⚠ Open, and Carl's to decide

- **The amber filter onto neighbouring cards.** Designed in conversation, not built. Carl's
  framing: *"if a light source is shining on glass and a colour filter is placed in front of the
  lens, would not that influence the colour?"* — **subtraction, not addition**: a filter removes
  blue rather than adding orange, so it DARKENS and saturates instead of washing out. The specular
  sweep is where it will read hardest. **Tune it with all five lit** — his instruction: *"if you
  start from a position of all 5 cards on, and work out theres little effect on other colours,
  thats the strongest its gonna get."*
- ⚠ **AND THE BACKDROP SHOULD PROBABLY BE EXEMPT** — a filter reaching the lockup would take blue
  out of blue letterforms and go muddy. Physically right, visually wrong. Departure to be stated
  in the code, not silent.
- **The lockup dim is GLOBAL, which is not the whole of his 3 August observation.** He asked for
  brightness tied to card POSITION — bright under the cards, quiet between them. The gaps are 8px,
  so a mask edge becomes a visible shape in its own right. **Not attempted.**
- **Does the amber sing or stay restrained?** Still unanswered, carried from two sessions back.

---

## How Carl worked today

- ⚠ **HE REPLACES DESIGNS, NOT JUST VALUES.** The travelling filament was working and approved in
  mechanism when he asked *"does it have to move? No."* **The reframe deleted four defects.** When
  he questions a premise, the premise is usually the problem.
- ⚠ **HE REASONS FROM PHYSICS AND IS RIGHT.** Black-body colour, the glass bevel as a holder
  rather than a conductor, the colour filter as subtraction. **Three times today his physics beat
  the Builder's implementation instinct.**
- ⚠ **HE TUNES FROM THE EXTREME.** *"start from a position of all 5 cards on."* Find the worst
  case; everything lesser is safe by construction.
- **He asks for the principle before deciding**, and **brackets numbers rather than guessing**.
- **No ASCII diagrams or box-drawing characters.**
- **Do not commit or push unless he explicitly asks.** He asked twice today; **nothing is pushed.**

---

## How to look at it

```
http://localhost:3000/start                  click a card to fire its filament; click again to cool
http://localhost:3000/start?cardrig=1        [1-6] geometry, [7-9] glass/light, [r] rim roughness,
                                             [m] cycle metal, [f] filament intensity, [0] print
http://localhost:3000/start?beattrace=1      performance.mark per entrance beat
```

⚠ **MEASURE HEADED, WITH `--enable-gpu`, AND PRINT THE RENDERER STRING.** Headless Playwright has
no GPU and silently substitutes SwiftShader — it invalidated a whole investigation this morning.

⚠ **AND READ A CALL TREE, NOT SELF-TIME.** Self-time attributed 1384ms to `onFirstUse`, whose own
work measures ~1ms. The tree named the two real costs in ten minutes, after six theories had not.

---

*4 August 2026, third session. The filament heats in place through red, orange and amber, and
cools back down the same ramp. The rim is tungsten, the bevel its glass holder, the lockup at half
strength behind them. Committed at `59a6327`, **unpushed**.*

*Next: one canvas instead of two — the warm-up is discarded at Q5 and everything it built dies
with it. Then the amber filter onto the neighbours.*
