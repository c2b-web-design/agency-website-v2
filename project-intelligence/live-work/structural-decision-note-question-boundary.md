# Structural Decision Note — the question boundary

**14 August 2026. Builder → Carl → Architect.** Format: `ai-system/structural-decision-gate.md`.
**No implementation. Nothing is built from this note until Carl says so.**

Companion to `structural-decision-note-card-host-lifetime.md`, which covers the host as a whole.
**This note is only about the question boundary** — the moment the corridor swaps one question's
grid for the next.

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

**This reframes the whole note.** The premise under (c) — *the expensive resource is the context,
so preserving it preserves the warmth* — **is not supported by this measurement.** Something
re-pays ~240ms per question with the context intact, and 5 program links + 10 shader compiles per
step (sub-millisecond client-side, but that is exactly where Stage 1 says the client-side clock
lies) are the visible candidates. **What is re-paying it has NOT been identified**, and I am not
going to name a cause I have not measured.

⚠ **CONSEQUENCE FOR THE DECISION: (c)'s benefit is currently unevidenced.** If a preserved
context does not preserve the warmth today, then a re-rendering node over a preserved context has
no measured saving to offer, and (c) reduces to "the bugs dissolve" — which is still a real
argument, but a different and weaker one than the one it was proposed on.

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
| (c) context persists, node re-renders | yes, by construction | yes, by construction | no | ⛔ **benefit UNEVIDENCED — 240ms already paid per step WITH one context** | ⛔ **needs a rewrite, not a tweak** |
| (d) explicit boundary event | no, enables (a) | ✅ **replaces the heuristic properly** | no | no effect | — |

**I am not recommending between (a), (b) and (c).** ⚠ **But the two measurements have changed
what they are worth, and the note would be misleading if the summary did not say so:**

- **(c) was proposed as "keep the context, drop the node". Both halves are now in doubt.** R3F
  9.6.1 calls `forceContextLoss()` on unmount on a renderer you own, with no opt-out, so the
  remount kills the hoisted context unless `<Canvas>` is abandoned for this surface. **And the
  ~240ms is already being paid on every step of the CURRENT one-context build** (211/236/242/239),
  so a preserved context is not currently buying the warmth the option assumes. **(c) is now the
  most expensive option with the least evidenced benefit** — which is the opposite of how it read
  before it was measured.
- **(b) remains the one needing the strongest justification**, because it changes approved
  corridor behaviour to serve an implementation detail of the host.
- **(a) is unchanged**: cheapest, and relocates the discontinuity rather than removing it.

**I DO recommend (d)'s mechanism**, per the section above: a real boundary signal from the
corridor, replacing the `labels` heuristic including my own `litCards` clear. That is a
recommendation about how the boundary is *known*, and it stands whichever of (a)/(b)/(c) is
chosen.

⚠⚠ **THE OPEN QUESTION THE MEASUREMENTS CREATED, AND THE ONE I WOULD ANSWER NEXT:
WHAT IS RE-PAYING ~240ms PER QUESTION ON A BUILD THAT HOLDS ONE CONTEXT?** The shared host was
built to remove exactly that cost; `one-context.mjs` passes 2/2 and the cost is unchanged. Five
`linkProgram` and ten `compileShader` calls per step are the visible candidates — sub-millisecond
on the client clock, which is precisely where Stage 1 proved the client clock lies. **Until that
is identified, every option here is being weighed against a cost nobody has located.**

*Verification is not approval. Carl decides; the Architect reports findings.*
