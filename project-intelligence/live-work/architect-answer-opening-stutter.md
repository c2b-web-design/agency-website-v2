# Architect answer — the opening stutter

**Received 4 August 2026, in response to `architect-question-opening-stutter.md`.**
**Saved by the Builder because the Architect's Write was disabled that session.**

⚠ **THE HEADLINE: THE TRADE IN THE QUESTION IS NOT REAL.** *"Halve the opening stall and bring
the card-ladder stall back"* is only a trade because both costs are blocking. Neither has to be.
**The warm-up render should stay exactly where it is.**

Everything below is read out of `node_modules/three/build/three.module.js` at a cited line, or
marked as a prediction. Three is 0.185.1.

---

## What is actually happening

### 1. `compileAsync` is warming programs the render never uses

The program cache key includes both `outputColorSpace` and `toneMapping`:

```
:7585   outputColorSpace: ( currentRenderTarget === null )
          ? renderer.outputColorSpace : ColorManagement.workingColorSpace
:7857   array.push( parameters.toneMapping )
:7551   if ( material.toneMapped ) { if ( currentRenderTarget === null ) toneMapping = renderer.toneMapping;
```

@react-three/fiber sets `outputColorSpace = SRGBColorSpace` and
`toneMapping = ACESFilmicToneMapping` on any `<Canvas>` without `flat`/`linear`.
`renderTransmissionPass` renders into a render target with `toneMapping = NoToneMapping`
(`:18015`, `:18028`) — linear output, no tone mapping.

⚠ **EVERY MATERIAL IN THIS SCENE COMPILES TWICE:** once for the canvas, once for the transmission
target. Different cache keys, different programs, different `onFirstUse` blocks.

⚠ **`useScenePrecompile` WARMS ONLY THE FIRST HALF.** It calls `compileAsync` with the renderer in
its canvas state. The transmission half is linked inside `renderTransmissionPass` and its uniforms
are read in the same synchronous block — **zero window for `KHR_parallel_shader_compile`. That is
the 777ms.**

**It predicts the program count:** rim, bevel, face, backdrop = 4 materials × 2 variants = 8, plus
PMREM's own and their variants ≈ 16. **"16 programs" is 8 materials seen twice.**

### 2. ⚠ `fromScene`'s fourth argument is the FAR PLANE, not the resolution

```
:2706   fromScene( scene, sigma = 0, near = 0.1, far = 100, options = {} ) {
:2709     const { size = 256, position = _origin } = options;
```

Call site: `pmrem.fromScene(studio, 0, 0.1, 200)`.

⚠ **200 IS `far`. THE ENV MAP IS AT THE DEFAULT 256 AND ALWAYS HAS BEEN.** Theory 6 moved a clip
plane — and `ENV_SHELL_RADIUS` is 60, so the studio stays inside the frustum at either value and
nothing could have changed. **A 5ms delta is what "I changed nothing" looks like.**

**Size is load-bearing twice** (`:2825`, `:2885-2916`): 256 → lodMax 8, cubeUV target 768×1024.
64 → lodMax 6, 336×256 — ~9× fewer pixels, 2 fewer LOD passes. And `_applyPMREM` is no longer a
blur chain in 0.185 — it is **GGX VNDF importance sampling, `GGX_SAMPLES = 256`** (`:2636`), a
256-tap loop per fragment per LOD (`:3087`).

### 3. Two smaller facts

**`useLocalEnvMap`'s `useMemo` runs during `CardScene`'s first render** — `mayCompile`/`warm` gate
only `useScenePrecompile`, so in the Q5 canvas the 585ms **escapes the gate entirely**.

**The warm-up canvas is a second GL context** — separate renderer, programs, PMREM run,
transmission target. Its only cross-context benefit is ANGLE's binary cache. And it cannot be made
cheaper with a smaller env map: `envMapCubeUVHeight` is in the cache key (`:7816`), so mismatched
sizes would warm different programs.

---

## The fix, in order

### A. Warm the transmission-pass variants

In `useScenePrecompile`, compile twice — once in each renderer state:

```js
const probe = new THREE.WebGLRenderTarget(1, 1);
const prevTone = gl.toneMapping;

gl.setRenderTarget(probe);              // linear output
gl.toneMapping = THREE.NoToneMapping;   // transmission-pass variants
await gl.compileAsync(scene, camera);

gl.setRenderTarget(null);
gl.toneMapping = prevTone;              // canvas variants
await gl.compileAsync(scene, camera);

probe.dispose();
// then the existing un-hide + gl.render warm-up, unchanged
```

A 1×1 probe is enough — `getParameters` only tests `currentRenderTarget === null`; size is not in
the cache key. `compile()` walks materials with `scene.traverse` (`:17427`), so hidden cards are
covered **without un-hiding**. Lights use `traverseVisible` (`:17385`), and the `FilamentLight`s
sit in the always-visible outer group — so `numPointLights` already matches.

⚠ **DO NOT LET A LIGHT EVER MOVE INTO THE HIDDEN GROUP**, or every program compiled here becomes
the wrong variant again. Restore both values on the error path.

**Prediction, untested:** the 777ms collapses to target allocation plus the actual draws. Theory 5
already measured uniform enumeration at 337 calls / 1ms when not blocked.

### B. Actually reduce the env map

`pmrem.fromScene(studio, 0, 0.1, 200, { size: 64 })`, and correct the comment that forbids it.
**This is a visual change and Carl's call** — capture 256/128/64 side by side at the approved
roughness. If 64 reads flat, 128 still buys ~4× back.

### C. Re-measure after each, separately. If the opening is clean, stop.

### D. Only if A+B are not enough

One context instead of two — mounted early, revealed late, the pattern the contact layer already
uses (`enquiry-opening.tsx:1104`). The objection at `:1111` is true of MOVING the node, not of
rendering it once at a stable position and placing it with CSS. **Own chunk if needed.**

### E. Independent and cheap

A main-thread block only drops frames if the animation needs the main thread. **The reveals
stutter, so they are not compositor-only.** If the dropped frames sit next to Recalculate Style
and Paint, moving the reveals to `transform`/`opacity` makes the opening immune to blocking work
whatever its cause.

---

## ⚠ On the diagnosis — the part that generalises

**The profile was read for MAGNITUDE, never for CAUSALITY.** Six theories each named something
big; none named the thing that made it *blocking*.

⚠ **THEORY 1'S OWN DATA CLASSIFIED THE PROBLEM.** The Builder noticed it: duration never changed
across three reschedules, only start time. **Duration invariant under scheduling means the cost is
intrinsic to the FIRST USE of an operation, not to when it is scheduled** — which redirects from
*"when does it run"* to *"what does this operation do the first time it runs"*, and that reaches
`onFirstUse` on the first hop.

**The instrument that kills theories 2–6 in one run:** per program, timestamp `linkProgram` and
timestamp the first `getUniforms()`, record the gap. **Near zero means serialisation**, and no
amount of shrinking helps.

⚠ **THEORY 6 IS THE SAME FAILURE AS THEORY 2, WHICH MAKES IT A PATTERN.** Both retired a
correct-sounding hypothesis with a test that never exercised it; both recorded the null as a
finding. **Both times the check was "did the number move", never "was the knob connected."**

**The control:** before trusting a null result, **show the test can fail** — set the parameter to
an absurd value and confirm the number moves a lot.

⚠ **AND A WRONG "RULED OUT" IS WORSE THAN NO NOTE**, because it removes the lever for everyone who
reads it after.

---

## Record changes the Architect asked for

- `opening-stutter.md` — strike theory 6's conclusion; resolution is **untested**.
- `answer-card-canvas.tsx:1106-1109` — comment is **wrong** and forbids the fix.
- `answer-card-canvas.tsx:1168-1192` — `useScenePrecompile`'s doc says the stall is shader
  compilation; the later measurement says it is not. **Two contradictory comments in one file.**
- `useLocalEnvMap` — record that it runs **outside** the warm gate.
