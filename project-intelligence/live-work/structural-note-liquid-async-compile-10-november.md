# Structural note: the liquid's shader compiled without freezing the page (10 November 2026), v1.4

**For:** Carl, to route to the Architect (CLAUDE.md Workflow 5a). **Status:** PROPOSED; Carl's three decisions GIVEN (below).
Nothing in it is built.

**Carl, after v1.4 (10 November 2026):** *"we will not use PiP"* → the third-person PiP pass is NOT a case to design
for: the plan tests first person (one pass, the glow) only. The v1.4 flag needs no change: it is correct with one pass
or two, so a PiP drawn anyway stays safe, just untested.
**v1.4 (10 November 2026, session 2):** on the Architect's review of v1.3 (one gap, how the flag starts): the flag is
now read from the liquid's RENDER OBJECTS the wrapper has seen, not from a promise count that starts at 0 (ready at
once before the warm-up; never on a cache hit); the window and the flag RESET on each registration. Re-checked by the
Builder (`Pipelines.js:218–228`).
**v1.3 (10 November 2026, session 2):** on the Architect's review of v1.2 (two errors, one smaller point): the async
window is now UNTIL THE FLAG FIRST READS READY (a new render context is a new render object, so v1.2's rebuild examples
were wrong); the flag reads ready only when EVERY pending async build has settled without error; the WebGL 2 fallback's
failed link reads as ready (stated). Re-checked by the Builder (`RenderContexts.js:53–67`, `WebGLBackend.js:1670–1694`).
**Carl's decisions:** the maximum wait **1 s**; the extra beat after the wobble **accepted**; `bench-medium-webgpu.tsx`
**AUTHORISED** (*"wait and beat are ok. bench-medium-webgpu.tsx Authorised"*).
**v1.2 (10 November 2026, session 2):** on the Architect's review of v1.1 (three gaps in the readiness gate, one
unchecked claim, answers to v1.1's three questions): the gate's FAILURE BRANCH and maximum wait added; "the pipeline is
built" defined as ONE FLAG the wrapper records; "the first build" defined (per render object) and the passes counted;
"(none does today)" marked reasoned, not measured; the wrapper's OWNER moved to the bench medium; the answers recorded.
New source claims re-checked by the Builder (`WebGPUPipelineUtils.js:329–333`, `Renderer.js:3692`, `camera-bench.tsx`'s
draw).
**v1.1:** on the Architect's review of v1.0 (seven points): the WebGL 2 claim corrected; the readiness gate added; the
open error scope and async rebuilds added; the method wrapped named; the measurement made able to split the stall; the
deferred node build added as a seam; the worker-thread claim marked as an assumption.

## The fault, measured

Carl: *"the freexe has got to go."* On a cold load the liquid's first draw holds the page **3.1–3.7 s**
(`live-work/scripts/liquid-cold-load-timing-10-november.mjs`, `liquid-frame-cost-10-november.mjs`). Three r185 builds a
render pipeline **synchronously** the first time an object is drawn: `Renderer._renderObjectDirect` →
`Pipelines.updateForRender` (`Renderer.js:3721` → `Pipelines.js:333`) → `getForRender` with no promise list →
`device.createRenderPipeline` (`Pipelines.js:400` → `WebGPUPipelineUtils.js:263`). Today's warm-up draw only MOVES the
freeze into the lean.

⚠ **The measurement cannot yet split the stall.** Both scripts time gaps between animation frames, which cannot tell
three's JavaScript shader build (the page's thread) from the GPU-process compile. The first step of any build is a
long-task observer alongside the frame gaps.

## What three already provides (checked in source)

- `Pipelines.getForRender(renderObject, promises)`: given a promise list, WebGPU calls
  `device.createRenderPipelineAsync` (`WebGPUPipelineUtils.js:292`). ⚠ **ASSUMED, not tested here:** that Chrome
  compiles it off the thread that draws, so the page keeps drawing. The probe must show it.
- The WebGL 2 fallback takes the SAME promise list: with `KHR_parallel_shader_compile` it polls the program's
  completion each animation frame instead of blocking (`WebGLBackend.js:1520–1546`). The same wrapper should cover the
  fallback.
- `Renderer._renderObjectDirect` draws an object only when `Pipelines.isReady(renderObject)` (`Renderer.js:3725`): a
  pipeline still compiling is **skipped**, not waited on.
- The pipeline's targets, MRT, blending, depth format and sample count are read from `renderObject.context`
  SYNCHRONOUSLY (`WebGPUPipelineUtils.js:127–249`); only the GPU compile is deferred. So the shader is built for the glow
  pass's real targets, which is where the public `compileAsync` failed.
- ⚠ **A failed async compile still RESOLVES its promise** (`WebGPUPipelineUtils.js:329–333`, a `finally`), with
  `pipelineData.error = true` set before it: a settled promise does not mean a usable pipeline.

## The proposal

1. **The async build, owned by the BENCH MEDIUM** (the Architect's answer, v1.1 question 1). The medium owns the
   renderer, so it installs ONE wrapper on the instance's `renderer._pipelines.getForRender`, once, for the renderer's
   life. The liquid REGISTERS its material on mount and removes it on unmount (a set: adding twice or removing a
   missing entry is harmless, so React's StrictMode double mount cannot stack wrappers or restore the wrong one — the
   same double-mount family as the open `__liquid.material` fault). For a registered material, the wrapper passes a
   promise list, so its pipeline goes the async route.
   - **⛔ THE ASYNC WINDOW (v1.3): async only UNTIL THE FLAG FIRST READS `ready`;** after that every build of the liquid
     passes through and stalls as three does by default. (v1.2's per-render-object rule was wrong in its examples:
     three keys a render CONTEXT by the target's attachment state, `count:format:type:samples:depth:stencil` plus the
     MRT, not by the target object (`RenderContexts.js:53–67`). A plain RESIZE keeps the context and render object and
     rebuilds nothing; a new FORMAT or SAMPLE COUNT is a new context, so a NEW render object with no pipeline, which the
     per-object rule would have made async: the liquid blinking out mid-shot. The Architect's recommendation, taken.)
     ⚠ Accepted, bench only: switching to THIRD PERSON after the flag is ready builds the PiP's pipeline synchronously,
     a freeze on the bench (the home page has one camera).
   - **The passes (`camera-bench.tsx`'s draw, checked):** FIRST PERSON draws the liquid in ONE pass, the glow pass. THIRD
     PERSON draws it in TWO: the glow pass for the eye, and the PiP, PLAIN, to the canvas, a different render context
     with its own render object and pipeline. If the bench STARTS in third person, both first builds go async (inside
     the window); switched to later, the PiP's build stalls (above). The dev `__heroBloomOff` and the
     plain-after-failure draw are the canvas context too, the same.
   - ⚠ Pipelines are cached by key: another object sharing the liquid's key would be gated too. **"None does today" is
     REASONED, not measured:** the key is built from the shader programs, and the liquid's shader comes from its own TSL
     graph, unique in the bench. Not checked by a count of the cache.
   - **Touches the bench medium** (`bench-medium-webgpu.tsx`, with its WebGL 2 fallback): ✔ **AUTHORISED by Carl**
     (10 November 2026).
2. **⛔ THE READINESS GATE (5b), defined.** Today the freeze also holds the jump's clock (its 0.1 s delta clamp), so the
   swap from the solid logo to the field happens only after the compile, by accident. Async removes that.
   - **ONE FLAG, recorded by the wrapper** (the Architect's simpler route: the bench holds no handle on three's render
     objects, and reading one from outside the draw reaches further into three's internals). ⛔ **v1.4: read from the
     RENDER OBJECTS, not from promises.** Every `getForRender` call for a registered material hands the wrapper one of
     the liquid's render objects; it KEEPS each one it sees. The flag reads `ready` only when (1) the wrapper has seen AT
     LEAST ONE, (2) EVERY one seen has a pipeline in the backend (three's `isReady`), and (3) NONE has an error; any
     error → `failed`. This covers: BEFORE the warm-up draw (none seen: not ready — v1.3's promise count started at 0
     and would have read ready at once, closing the window, the freeze back); a CACHE HIT (three reuses the pipeline and
     makes NO promise, `Pipelines.js:218–228`, as on a StrictMode remount: the render object already has its pipeline,
     so ready at once — a promise count would never have read ready, and the failure branch would have dropped a
     working liquid); and THIRD PERSON (both passes' render objects seen: ready only when both are built — the PiP
     cannot release the gate while the glow pass compiles). The liquid reads the flag; nothing else.
   - **⛔ PER REGISTRATION, not per renderer:** the window, the render objects seen and the flag belong to the
     REGISTRATION and RESET when the liquid registers again (a new material: a new shader may need building, so the
     window reopens; the dropped StrictMode instance's state cannot leak into the live one — the same family as the
     open `__liquid.material` fault). Removed on unregister.
   - ⚠ **The WebGL 2 fallback reads a failed compile as `ready`:** a failed link logs the error and still records the
     program as the pipeline, with no error field (`WebGLBackend.js:1670–1694`). The failure branch therefore works on
     WebGPU only; on the fallback the result is no worse than today's synchronous path, which does the same.
   - **The gate:** at the expulsion's start the solid is swapped for the field ONLY when the flag reads `ready`, and the
     expulsion's clock HOLDS at its start until then (the wobble's end held: the logo still standing). Both, as one,
     because either alone fails: the swap gated alone lets the clock run, so the blobs POP IN mid-flight; the clock held
     alone is the vanishing logo again.
   - **⛔ THE FAILURE BRANCH (the Architect's gap 1):** on `failed`, or when the hold passes a MAXIMUM WAIT, the solid
     STAYS, the clock goes on, and the liquid is not drawn: the hero runs on without its liquid rather than freezing
     (this is also the guard for the open error scope below). ✔ **The maximum wait: 1 s** (Carl, D-108: *"wait and beat
     are ok"*).
   - Measured by the probe: how often the gate holds, and for how long. ⚠ On devices that need it, the hold BENDS Carl's
     *"when the wobble stops, thats when the blobs emerge"*. ✔ **Carl accepts the extra beat** (up to the 1 s wait).

## What it couples to

- three r185's `Pipelines.getForRender` / `updateForRender` signatures, `isReady`, and the backend's pipeline state
  (`pipeline`, `error`); a private part of three (`renderer._pipelines`) that an upgrade could rename or change.
- **⚠ An ERROR SCOPE stays open for the whole compile:** `pushErrorScope` before the async call
  (`WebGPUPipelineUtils.js:253`), its pop only after the compile (`:316`). A validation error from ANY other draw in
  that window lands in the liquid's scope, sets its `pipelineData.error`, and the liquid is then SKIPPED FOR GOOD
  (`WebGPUBackend.js:1909`), the console blaming the liquid. **Accepted** (the Architect's answer, v1.1 question 3), with
  the probe's clean-console check; the failure branch is the real guard: the liquid is lost, the hero does not freeze.
  Not patched (it would be a second patch on three).
- The bench's WebGPU medium AND its WebGL 2 fallback (above).

## Alternatives rejected

1. **`renderer.compileAsync` (public).** Tried for the glow on 9 November (`hero-bloom.ts:46–53`): it builds the shaders
   later, reading the renderer's LIVE target and MRT while the bench keeps drawing; wrong outputs and GPU errors.
2. **The warm-up draw alone (built today).** Moves the freeze into the lean; the page is still held about 3 s.
3. **A cheaper shader** (fewer field calls: the ray-differential anti-aliasing is 8 of ~16). Shortens the freeze
   without removing it; the anti-aliasing was chosen for a measured fault (probe 1). Worth doing alongside.
4. **The deferred node build** (`NodeManager.getForRenderDeferred`, `NodeManager.js:337`, unused in r185). Not
   rejected: the seam for the JAVASCRIPT half of the stall, if the split shows it is large. Then the two together.
5. **The wrapper installed by the liquid itself** (v1.1). Rejected on the Architect's review: StrictMode's double mount
   can interleave installs and removals, stacking wrappers or restoring the wrong one.

## The Architect's answers (review of v1.1, 10 November 2026)

- **The wrapper's owner:** the bench medium, the liquid registering its material (proposal 1).
- **Where the gate holds:** at the expulsion's start, the latest point, so the hold happens only on devices that need
  it. The extra beat is Carl's call by eye.
- **The open error scope:** accept, with the console check; the failure branch is the guard.

## Carl's decisions (10 November 2026)

- The MAXIMUM WAIT before the failure branch: **1 s**.
- The logo may stand a beat longer after its wobble on a slow device: **accepted**.
- `bench-medium-webgpu.tsx`: **AUTHORISED**.
