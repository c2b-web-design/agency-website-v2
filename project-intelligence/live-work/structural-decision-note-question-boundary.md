# Structural Decision Note — the question boundary

**14 August 2026. Builder → Carl → Architect.** Format: `ai-system/structural-decision-gate.md`.
**No implementation. Nothing is built from this note until Carl says so.**

Companion to `structural-decision-note-card-host-lifetime.md`, which covers the host as a whole.
**This note is only about the question boundary** — the moment the corridor swaps one question's
grid for the next.

---

# ⛔⛔ READ THIS FIRST — THE ~240ms IS THE **NEXT STEP BUTTON**, AND IT IS NOT WHAT THIS NOTE'S OPTIONS ARE ABOUT

**`NextStepMeshButton` creates a fresh WebGL context on every question step.** It lives inside the
keyed phrase `phrase-${qNum}`, so each question destroys and rebuilds it. Traced Q4 → Q3, mid-walk,
production, GPU categories on, from page load:

    CommandBufferProxyImpl::Initialize   67.2ms   1x   [CrRendererMain]   ← main thread BLOCKED
    gl::init::CreateGLContext at +7621, +12489, +15757, +23420ms         ← one per step
    EIGHT WebGL contexts across a five-question walk

**⚠ THE OPTIONS (a), (b) AND (c) BELOW ALL CONCERN THE CARD HOST AND THE CORRIDOR. NONE OF THEM
TOUCHES THIS. Choosing between them will not move the ~240ms by one millisecond.**

## ⚠⚠ AND FIXING THE BUTTON IS **NOT ESTABLISHED** TO REMOVE THE GAP

**Stated plainly, because the temptation to read this as a solution is exactly how the last week
went:**

    the gap                          179.8ms
    attributed to context creation    67.2ms   ← named, traced, resolution-independent
    ────────────────────────────────────────
    NOT ATTRIBUTED                   ~112ms   ← inside CommandBufferService:PutChanged (133.0ms self)

⚠ **`PutChanged` IS OPAQUE AT THESE TRACE CATEGORIES.** The 13 August reveal trace recorded the
same limit and it has not changed. **~110ms of this gap has a name that explains nothing**, and no
capture in this project has yet opened it.

**EXPECT IMPROVEMENT, NOT RESOLUTION.** Removing the per-step context creation should remove the
67ms main-thread block; **it is not evidence that the remaining ~112ms goes with it.** Some of that
residue may be work the new context causes, and some may be work that would happen regardless.
**Nothing measured here separates the two.**

⚠ **A build that fixes the button and still stalls ~110ms per step is the EXPECTED outcome on this
evidence, not a failed fix.** If that is not said now, it will be read as a regression later.

**The button's lifetime is a §5a structural decision — the same class as the warm-up canvas, and
recorded in `CLAUDE.md` as its second worked case. It is REPORTED HERE, NOT PROPOSED. Carl
decides.**

---

## THE PROBLEM, STATED ONCE

Measured on pre-host, nodes stamped and tracked (`isConnected` confirmed):

    N1  Q5 grid + canvas N2   depth 0→1   492.78 → 434.79   57.99px up, then DESTROYED
    N4  Q4 grid + canvas N5   depth 0     492.78 → 492.78   0.00px travel

**No element makes the 492 → 435 → 492 round trip.** Pre-host never *followed* anything: the
canvas was a child, destroyed with the old grid and recreated with the new. The round trip is an
illusion produced by two different elements, and reconciliation made it seamless.

So a `fixed` host that follows elements has nothing to follow across the boundary. It tracks N1
up, N1 is destroyed, N4 appears 58px below, and the host snaps in one frame — measured ~280ms
held at the top, then a single-frame jump at t=1200.

⚠ **This is a property of the route, not a bug in it.** Carl's instruction: *"do not design past
it."*

---

## ⚠ WHAT THE ~240ms ACTUALLY IS — read this before weighing the options

**240ms is per-context PROGRAM INSTANTIATION, not per-canvas-node rendering.** Stage 1,
13 August, `q5-stage1-resolution-and-cache-13-august.md`:

- 1280×720 → median **240ms**; 2560×1440 → median **220ms**. **A 4× pixel increase produced no
  increase**, so it is not fragment cost.
- On D3D11 `glLinkProgram` translates GLSL→HLSL and the driver builds real shader objects **at
  first draw, inside the command buffer** — 207–262ms of `CommandBufferService:PutChanged`.
- Corroborated on all 21 runs: **17 `linkProgram` calls before Begin, 17 after.**

⚠⚠ **THIS IS THE CRUX OF OPTION (c) AND I WANT IT STATED PLAINLY: the cost attaches to the WebGL
CONTEXT, not to the React node or the `<canvas>` element.** A component that re-renders — or even
remounts — while keeping the same context does **not** re-pay it. **That is Carl's premise in (c)
and Stage 1's data supports it.**

⚠ **What is NOT established:** that a React remount of `AnswerCardCanvas` can preserve the
context. R3F owns the renderer and ties it to the `<Canvas>` element's lifetime; unmounting
`<Canvas>` disposes the context. **(c) therefore requires the context to be hoisted above the
remounting boundary, which is a real piece of work and is exactly why it needs this note.**

---

# ⚠⚠ THE TWO MEASUREMENTS — 14 August 2026, production build on :3100

## MEASUREMENT 1 — the label texture cost per arriving question

Instrumented by patching `texImage2D` / `texSubImage2D` / `texStorage2D`, `linkProgram` and
`compileShader` before any page script, then walking Q5→Q1.

| step | canvas uploads | upload ms | linkProgram | link ms | compileShader | compile ms |
|---|---:|---:|---:|---:|---:|---:|
| →Q4 | 5 | **0.30** | 5 | 0.30 | 10 | 0.00 |
| →Q3 | 5 | **0.10** | 5 | 0.30 | 10 | 0.10 |
| →Q2 | 5 | **0.10** | 5 | 0.00 | 10 | 0.00 |
| →Q1 | 5 | **0.00** | 5 | 0.00 | 10 | 0.10 |

**Five canvas uploads per question — one per card — at 0.0–0.3ms total.** The `labelCanvasCache`
saves the paint but not the upload by design (`answer-card-mesh.tsx:1574`), and the upload is
what an arriving question pays. **On this evidence the label texture path is not a cost worth
restructuring around.**

⚠⚠ **BUT THESE ARE CLIENT-SIDE CALL-RETURN TIMES, AND STAGE 1 ESTABLISHED THE REAL COST LANDS
LATER.** On D3D11 the driver builds pipeline state **at first draw, inside the command buffer** —
207–262ms of `CommandBufferService:PutChanged` that a `performance.now()` around the GL call
cannot see. **A sub-millisecond reading here does NOT mean free.** So the client-side number is
reported, and the visible cost is measured separately below.

### ⛔ AND THE SEPARATE MEASUREMENT IS THE ONE THAT MATTERS

`verify/walk-cost.mjs`, worst frame gap per step, medians of 2 runs, **on the current shared-host
build**:

    Q5→Q4   211ms   [176, 211]
    Q4→Q3   236ms   [236, 217]
    Q3→Q2   242ms   [197, 242]
    Q2→Q1   239ms   [236, 239]

⚠⚠ **THE ~240ms IS STILL BEING PAID ON EVERY QUESTION STEP — ON THE BUILD THAT HOLDS ONE CONTEXT
THROUGHOUT.** `verify/one-context.mjs` passes 2/2: one context, never lost, same canvas element
at Q1. **And the per-step cost is unchanged.**

⚠⚠ **CORRECTED BY THE TRACE ABOVE — READ THAT SECTION, NOT THIS PARAGRAPH, FOR THE CAUSE.**
The observation is correct: the cost IS still paid with the card host holding one context. **The
inference I drew from it was wrong.** I wrote that "preserving the context does not preserve the
warmth", which treats the card host's context as the only one that matters. **The trace shows the
cost belongs to a DIFFERENT canvas — `NextStepMeshButton` — which is rebuilt per question and
creates a fresh context each time, at 67ms of blocked main thread.**

**Preserving a context DOES preserve its warmth. The card host proves it. The button never had
that treatment.** Left in place with the correction attached, per the no-retroactive-rewriting
rule: the reasoning is instructive precisely because a true measurement supported a false
conclusion when only one canvas was in view.

## MEASUREMENT 2 — can the renderer be hoisted above the remount boundary in R3F?

**Answer: FEASIBLE WITH NAMED CONSEQUENCES — and the consequences are severe enough that it is
not the cheap option (c) currently reads as.**

R3F **9.6.1**, read from `node_modules`:

**What makes it feasible.** `GLProps` accepts an externally-owned renderer directly —
`core/renderer.d.ts:14`:

    export type GLProps =
      | Renderer
      | ((defaultProps: DefaultGLProps) => Renderer)
      | ((defaultProps: DefaultGLProps) => Promise<Renderer>)
      | Partial<...>

So `<Canvas gl={myRenderer}>` is a supported, typed API. **Creating the renderer outside R3F and
handing it in is not a hack.**

**⛔ WHAT MAKES IT EXPENSIVE — R3F DESTROYS THE CONTEXT ON UNMOUNT REGARDLESS OF WHO OWNS IT.**
`<Canvas>` registers `useEffect(() => () => unmountComponentAtNode(canvas), [])`
(`react-three-fiber.esm.js`), and that function does, unconditionally:

    state.gl?.renderLists?.dispose?.()
    state.gl?.forceContextLoss?.()          ← THE CONTEXT IS DESTROYED
    dispose(state.scene)

**`forceContextLoss()` is called on the renderer you passed in.** There is no prop, flag or option
in this version to opt out. So "hoist the renderer and let the node remount" **does not work by
itself**: the first remount kills the hoisted context and (c) silently becomes "a new context per
question" — **the exact cost the whole restructure exists to remove, reintroduced invisibly.**

⚠ **AND IT WOULD BE INVISIBLE.** `verify/one-context.mjs` would catch it — its `webglcontextlost`
witness is scoped to the host's canvas — but only if it is run and its witnesses are read. **A
build that quietly recreated the context per question would look and measure like a working
page**, apart from the stall.

**What (c) therefore actually requires**, stated plainly so it is not mistaken for a small change:

1. The renderer created and owned outside any remounting subtree.
2. A way to stop R3F's unmount teardown from reaching it — **not available as a prop in 9.6.1.**
   The routes are: keep `<Canvas>` mounted and remount only its *children* (which is not (c) —
   the node stays, so nothing is gained on the litCards side); or hand R3F a proxy renderer whose
   `forceContextLoss` is a no-op (**a lie to the library, and the kind of cleverness that fails
   at an upgrade**); or drive Three.js directly without `<Canvas>` for this surface.
3. Re-pointing `one-context.mjs`'s identity witness at the new owner, since "same canvas element"
   stops being the right question.

**Feasible: yes. Cheap: no.** Route 3 — dropping `<Canvas>` for this surface — is the only one of
the three that is honest, and it is a substantial rewrite of a ~4200-line component's host.

---

# ⛔⛔ THE ~240ms IS LOCATED. IT IS THE **NEXT STEP BUTTON**, NOT THE CARDS.

**14 August 2026. CDP `Tracing`, GPU categories, from page load, production `:3100`.
Traced step: Q4 → Q3 — MID-WALK, not the first step. Same method and vocabulary as
`q5-gpu-trace-13-august.md`: self time, not nested totals.**

⚠ **This section was written before the options below and should be read first. Every option in
this note was previously being weighed against a cost nobody had located.**

## 1. Main thread — ⛔ BLOCKED (and this is the opposite of the reveal)

    gap 179.8ms at +23309ms      main thread busy 123.9ms of 179.8ms   => BLOCKED
      70.4ms  single task at +23418ms
      25.5ms  single task at +23339ms

⚠⚠ **THE REVEAL'S GAP HAD THE MAIN THREAD IDLE AT 2.3ms OF 210ms.** This one is **blocked for
69% of the gap.** They are not the same fault and must not be treated as one.

**The task, by name and self time — `CommandBufferProxyImpl::Initialize`, 67.2ms, ×1, on
`CrRendererMain`.** That is a **new GPU command buffer being created inside the question step.**

## 2. GPU track — BUSY (325.7ms of work across a 179.8ms window, i.e. parallel threads)

Both are busy. The renderer is not waiting on an idle GPU; it is blocked creating a context while
the GPU works.

## 3. Self-time leaves inside the gap — unfiltered, top events

    178.8ms self   12x  ThreadControllerImpl::RunTask          [GpuVSyncThread]   (idle wait, not work)
    133.0ms self   17x  CommandBufferService:PutChanged        [CrGpuMain]
     73.6ms self   82x  ThreadPool_RunTask                     [ThreadPoolForeground]
     67.2ms self    1x  CommandBufferProxyImpl::Initialize     [CrRendererMain]   ← THE BLOCKING TASK
     26.2ms self    4x  RasterImplementation::RasterCHROMIUM   [CrRendererMain]
     19.4ms self   43x  ThreadControllerImpl::RunTask          [CrRendererMain]
     13.5ms self   37x  FunctionCall                           [CrRendererMain]
     11.8ms self   11x  RasterDecoderImpl::DoEndRasterCHROMIUM::Flush [CrGpuMain]
      7.2ms self    2x  D3DCompile                             [ThreadPoolForeground]
      4.3ms self    1x  Program::MainLinkLoadEvent::wait       [CrGpuMain]

`PutChanged` is present as in the reveal, but here it shares the window with a **67ms
main-thread block that the reveal did not have.**

## 4. Programs and shaders — NOT the cost, and the client-side count reconciled

    28 shader/program events in the whole step,  15.66ms total,  4 inside the gap
       13.39ms  12x  ShaderTranslateTaskD3D::run        (2 in gap)
        0.56ms   5x  GLES2DecoderPassthroughImpl::DoLinkProgram   (0 in gap)
        0.03ms   1x  GrShaderCache::load / store

⚠ **RECONCILING MY OWN CLIENT-SIDE COUNT: I measured 5 `linkProgram` and 10 `compileShader` per
step at ~0.3ms, and warned that the client clock is the wrong one. The GPU process confirms both
halves — the driver really does see 5 `DoLinkProgram` per step, and they really are cheap
(0.56ms total, none in the gap).** The client-side reading was right and the caution was still
correct to state: the expensive thing was elsewhere and no call-return timing would have found it.

**Texture uploads inside the gap: 0 events.** The label-texture path is confirmed irrelevant.

## ⛔ 5. WHAT IS ACTUALLY HAPPENING — a new WebGL context on every question step

`gl::init::CreateGLContext` in the traced session:

    +76ms      +146ms      (page load — the host and the warm-up)
    +7621ms    +12489ms    +15757ms    +23420ms   ← ONE PER QUESTION STEP

Each preceded by `CommandBufferProxyImpl::Initialize` at **67.1ms and 67.2ms** for the two walk
steps in the capture. **Six distinct WebGL context addresses in one session**, three of them
created and abandoned during the walk.

### ⚠⚠ WHICH CANVAS — AND IT IS NOT THE CARDS

Context creations tagged by DOM path:

    +309ms   #answer-card-proto < #answer-card-host        ← the card host, ONCE
    +328ms   #answer-card-proto < #answer-card-warmup      ← the warm-up, ONCE
    +8106ms  CANVAS < DIV < DIV < DIV < SPAN < .mt-5       ← ⛔ per step
    +13032ms .enquiry-contact-layer                        ← the contact field, ONCE
    +16337ms CANVAS < ... < SPAN < .mt-5                   ← ⛔ per step
    +24007ms CANVAS < ... < SPAN < .mt-5                   ← ⛔ per step
    +31587ms CANVAS < ... < SPAN < .mt-5                   ← ⛔ per step

**`.mt-5` is `NextStepMeshButton`** (`enquiry-opening.tsx:1650`, `1694`) — the Three.js Next step
button. **It lives INSIDE `renderPhrase`, keyed `phrase-${qNum}`, so every question destroys and
rebuilds it, and it creates a fresh WebGL context each time.**

### ⚠⚠ AND THIS IS WHY `one-context.mjs` PASSES 2/2 WHILE THE COST IS PAID

**The harness is right about what it measures and blind to what matters.** It watches the host's
canvas: created once, never lost, same element at Q1 — **all true.** It never looks at any other
canvas, because the question it was given was "does the HOST hold one context".

    host contexts:  1   (created +414ms, never recreated)   ✅ as reported
    total contexts: 8 across a five-question walk           ⛔ never counted

**The shared host removed the per-question card context and left a per-question BUTTON context
doing the same damage.** The restructure worked; it was aimed at one of two canvases.

## 6. Resolution independence — CONFIRMED, same as Stage 1

| viewport | pixels | largest gap | `CommandBufferProxyImpl::Initialize` |
|---|---:|---:|---:|
| 1440×900 | 1.30M | **179.8ms** | **67.2ms** |
| 2560×1440 | 3.69M | **166.5ms** | **50.9ms** |

**A ~2.8× pixel increase produces no increase** — if anything marginally lower, within noise.
Same finding as Stage 1 for the reveal, and it points the same way: **context/program
instantiation, not fragment cost.**

---

## ⚠ WHAT THIS DOES TO THE OPTIONS BELOW

**(a), (b) and (c) are all about the CARD host and the corridor. None of them touches the Next
step button.** On this evidence:

- **The ~240ms per step is not evidence for or against any of them.** It is a different canvas.
- **(c)'s premise is not merely unevidenced — it was measured against the wrong thing.** The
  earlier reading in this note ("240ms still paid with one context, so preserving the context
  does not preserve the warmth") was **correct as an observation and wrong as an inference**: the
  context being preserved was the card host's, while the cost was the button's.
- **The cheapest available win is not in this note at all**: give `NextStepMeshButton` a lifetime
  that survives the question step, exactly as the cards were given one. ⚠ **That is a structural
  decision under §5a and is NOT proposed here — it is named as the finding, for Carl.**

⚠⚠ **STATED AS A LIMIT, AND IT BOUNDS EVERYTHING ABOVE: `PutChanged` remains opaque at these
categories**, as the 13 August trace recorded. **133.0ms of self time sits in this gap under a
name that explains nothing.**

    gap 179.8ms  =  67.2ms context creation (named)  +  ~112ms unattributed

**So 37% of the gap is explained and ~63% is not.** What is newly attributed is the 67ms
main-thread block and the context creation causing it. **Removing that is expected to improve the
step, not to resolve it** — and no measurement here shows whether the residue is caused by the new
context or merely coincident with it. **A build that fixes the button and still stalls ~110ms is
the predicted result.**

---

## (a) HOST HOLDS ITS LAST GOOD RECT THROUGH THE SWAP

Stop following when the tracked element dies; keep the last rect until a live grid is measured.

**Couples to:** the corridor's timing only — how long the gap lasts. Nothing else. It is a change
to one component's internal update rule and touches no other seat's work.

**Becomes impossible to observe:** ⚠ **the difference between "the element died" and "the element
stopped moving."** The host would sit still in both cases, so a future fault where tracking
silently stops looks identical to a normal boundary. Today the snap at least *announces* that
something changed.

**The ~240ms:** **no effect.** One context throughout; the compile is paid once. This option does
not touch warmth at all.

**Honest cost:** the cards hold at the TOP of the travel (~435) for the ~280ms gap, then the new
grid appears at 492 and the host still has to move 58px. **It relocates the discontinuity; it
does not remove it.** It may look worse — a visible pause at the wrong end, rather than a fast
snap. **This is the cheapest option and the one most likely to be judged insufficient by eye.**

## (b) CORRIDOR KEEPS BOTH GRIDS ALIVE ACROSS THE TRANSITION

Render the incoming depth-0 grid before the outgoing depth-1 one is removed, so a continuous
element exists to follow.

**Couples to:** ⚠ **the corridor itself — approved work (D-022/023/024, D-046).** `phraseList`
currently withholds the active phrase while `corridorMoving`, deliberately. Overlapping them
means two `.enquiry-answer-grid` elements on screen at once, which touches: `active-grid-fixed.mjs`
and every harness using `document.querySelector(".enquiry-answer-grid")` (**the recorded
instrument fault #11 — the first grid in document order is not the active one**); the
`.enquiry-phrase-extras` fade; and the answer-summary rendering.

**Becomes impossible to observe:** ⚠⚠ **"which grid is the real one" stops being answerable from
the DOM alone.** Today `.enquiry-pdepth-0` means *active* and is unambiguous. With both alive
through the transition, every instrument in `verify/` that resolves "the grid" needs a rule for
the overlap window, and the ones that do not get one will silently measure the wrong element.
**That is a repeat of the exact failure mode that has already cost this project three sessions.**

**The ~240ms:** **no effect** — still one context.

**Honest cost:** this is the option that modifies approved corridor behaviour to serve an
implementation detail of the host. It is the most invasive of the three and the least reversible.

## (c) CONTEXT PERSISTS, CANVAS RE-RENDERS PER QUESTION

The expensive resource is the context; let the node be per-question again.

**Couples to:** R3F's ownership of the renderer, and any state currently living inside
`AnswerCardCanvas`. ⚠ **Requires hoisting the context above the remount boundary** — not merely
removing a `key`. This is the piece of work the option's appeal can hide.

⚠⚠ **MEASURED: THIS OPTION IS NOT CHEAP AND ITS BENEFIT IS UNEVIDENCED.** See the two
measurements above. R3F 9.6.1 calls `forceContextLoss()` on unmount **on a renderer you passed
in**, with no opt-out prop, so hoisting alone does not survive the first remount. And the ~240ms
is **still being paid per question on the current one-context build**, so preserving the context
does not currently preserve the warmth. **(c) should not be read as "keep the good part, drop the
bad part" — that framing is not supported by measurement.**

**Becomes impossible to observe:** the boundary becomes a mount again, so it becomes MORE
observable, not less. ⚠ **The thing that becomes hard to see is context health**: with the
context living apart from the component that draws into it, a lost or stale context no longer
coincides with anything visible in the tree. `verify/one-context.mjs` already asserts this and
would need its identity witness re-pointed at the new owner.

**The ~240ms:** ⚠ **this is the option's whole argument, and Stage 1 supports it.** The cost is
per-context program instantiation, paid at first draw. If the context survives, **the 240ms is
paid once and the per-question warmth is unchanged.** What is genuinely unknown and **must be
measured, not assumed**: whether re-rendering into a preserved context re-triggers driver-side
pipeline-state work for new textures. **The label textures change per question**, and a texture
upload is not the same thing as a program link. **I would not assert this is free without
measuring it.**

**What it dissolves:** both bugs, by construction. Nothing to track across the swap (the canvas is
a child again, so it inherits motion for free); `litCards` dies with the instance again, making
today's clear-on-`labels` patch unnecessary. ⚠ **And every other unenumerated state in that
~4200-line component reverts to question-scoped** — which the companion note records as an open
finding I could not close.

---

## (d) A FOURTH OPTION CARL DID NOT LIST — the boundary as an explicit event

The corridor publishes "question changed"; the host treats it as a discrete re-anchor rather than
discovering it by an element vanishing.

**Why it is worth listing:** every fault in this area shares one root — **the canvas has no way to
know a question changed.** Today it infers it from `labels` (my patch) or from an element dying
(the tracking). Both are inferences from side effects. ⚠ **The companion note records that the
question boundary "is no longer visible to the canvas at all"; this option addresses that
directly**, where (a) and (b) work around it.

**Couples to:** one new prop or context value from the corridor. Small surface.
**Becomes impossible to observe:** nothing — it adds a signal.
**The ~240ms:** no effect.
**Honest cost:** it does not by itself fix the 58px discontinuity. It makes the boundary
*addressable*, which is a precondition for (a) doing something sensible, not a substitute for it.
**It may be a component of the answer rather than the answer.**

### ⚠⚠ `labels` IDENTITY IS A HEURISTIC STANDING IN FOR AN EVENT — Carl, 14 August 2026

**My own `litCards` clear (`dd9537b`) is the example, and it should be replaced, not improved.**
It compares `labels.join(" ")` between renders and clears when the string changes. That is a
guess at "the question changed", assembled from a side effect.

**The duplicate-text collision is one failure mode** — two questions sharing option text would
never clear, and nothing enforces uniqueness. ⚠ **But naming that one is misleading if it invites
a better key.** The general problem is that *a heuristic fails in ways nobody predicts*, and the
list of failure modes cannot be completed in advance. A more careful key (adding a question
number, hashing more inputs) would still be an inference from side effects, and would still fail
somewhere nobody looked.

⚠ **THAT PATTERN IS WHAT COST THIS PROJECT A WEEK.** The warm-up canvas inferred readiness from a
proxy signal. The arming classifier inferred which gate fired from timing windows, and reported
"0/3 armed by COMPILE" on a gate that was working. `card-position.mjs` inferred position from
luminance and reported a 4.1px regression that did not exist. **Every one was a plausible stand-in
for a fact that was never published, and every one was believed until it produced a symptom
nobody could attribute.**

**RECOMMENDATION: resolve (d) with a real boundary signal from the corridor — an explicit
"question changed" event or a question identity prop — and replace the `labels` heuristic with
it, including my own `litCards` clear.** The corridor KNOWS when the question changes; it is the
only thing that does. Publishing that fact costs one prop and removes an entire class of
unpredictable failure, rather than narrowing it.

⚠ **This is a recommendation about MECHANISM, not a request to build it.** It is Carl's decision
and it belongs with the rest of this note.

---

## SUMMARY

| | fixes the snap | fixes litCards | touches approved work | ~240ms | measured? |
|---|---|---|---|---|---|
| (a) hold last rect | ⚠ relocates it | no | no | no effect | mechanism understood |
| (b) both grids alive | yes | no | ⛔ **yes — the corridor** | no effect | not measured |
| (c) context persists, node re-renders | yes, by construction | yes, by construction | no | ⚠ **irrelevant — the 240ms is the BUTTON's context, not the cards'** | ⛔ **needs a rewrite, not a tweak** |
| (d) explicit boundary event | no, enables (a) | ✅ **replaces the heuristic properly** | no | no effect | — |
| **— the button's lifetime —** | **no** | **no** | **no** | ⛔ **THIS is the ~240ms** | ✅ **located, traced, resolution-independent** |

**I am not recommending between (a), (b) and (c).** ⚠ **But the trace has changed what they are
about, and the summary would be misleading if it did not say so:**

- ⛔⛔ **THE ~240ms IS NOT ABOUT ANY OF THEM.** It is `NextStepMeshButton` creating a fresh WebGL
  context on every question step — 67ms of blocked main thread inside a 180ms gap, confirmed at
  two resolutions. (a), (b) and (c) all concern the CARD host and the corridor. **Choosing
  between them will not move that number by one millisecond.**
- **(c) was proposed as "keep the context, drop the node", and my earlier reading called its
  benefit unevidenced. That reading was wrong** — see the correction above. Preserving a context
  does preserve its warmth; the card host demonstrates it. **(c)'s real obstacle is R3F 9.6.1
  calling `forceContextLoss()` on unmount with no opt-out**, which makes it a rewrite rather than
  a tweak. That stands.
- **(b) remains the one needing the strongest justification**, because it changes approved
  corridor behaviour to serve an implementation detail of the host.
- **(a) is unchanged**: cheapest, and relocates the discontinuity rather than removing it.

**I DO recommend (d)'s mechanism**: a real boundary signal from the corridor, replacing the
`labels` heuristic including my own `litCards` clear. It stands whichever of (a)/(b)/(c) is
chosen.

⚠⚠ **AND THE FINDING THAT SITS OUTSIDE ALL FOUR OPTIONS: `NextStepMeshButton` has the lifetime
the cards used to have.** It is inside the keyed phrase, rebuilt per question, paying full
context creation each time. **Giving it a lifetime that survives the step is a structural decision
under §5a — it is NOT proposed here, it is reported.** It is also, on this evidence, the largest
per-step cost in the walk and the one nobody was looking at.

*Verification is not approval. Carl decides; the Architect reports findings.*
