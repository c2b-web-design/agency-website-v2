# Plan — Wall pair neon (CA + CB): lit rim, neon-only bloom, stutter ignition

> **AMENDED 23 September 2026 after the Architect's plan review.** Verdict: *"the route is right.
> Approve with amendments."* All 14 findings are taken. The findings themselves are in
> `live-work/architect-plan-response-wall-neon-23-september.md`, transcribed by the Builder; the
> Architect's window is the authority. **F12 needs Carl's word before execution** (see Open for
> Carl). **Nothing is built until Carl approves this amended plan.**

## Context

The four room cards on `/about` (§2, `#roles`) have clear-glass half-tube rims that were built to
be neon (D-090, D-091). No neon exists yet. Carl's order is: **the wall pair first**, then the
floor pair, then the individual lights. **This chunk covers CA and CB only.**

What is settled:
- **The neon is BLUE, a darker blue for the wall pair.** The starting colour is the navy **"c"** of
  the navy-teal logos, re-sampled on 23 September from two files that agree: glow ≈ `#1b4789`,
  core ≈ `#a5caf3`, hue 215–217°. **It is a starting value, tuned by eye.**
- **Post-processing bloom is part of the neon** (D-090, 23 September amendment). It is needed for
  realism, and it demonstrates a technique clients may want.
- **Route: NEON-ONLY bloom** (Carl, 23 September). The scene renders as it does today. Then the
  tubes alone are drawn to a separate buffer, blurred, and added on top.
  - `EffectComposer` was rejected. It sets `NoToneMapping` while mounted, and three 0.185 only
    tone-maps a material when drawing to the screen (`WebGLRenderer.js:2351-2357`). Under a
    composer, D-089's glass would lose its ACES tone mapping, the backplate's `toneMapped={false}`
    would stop meaning anything, and the env-map highlights would bloom.
  - The Architect verified this against the installed source.
- **The lights start OFF and stutter on.** So ignition is in scope.
- **The measured bloom target** (D-090):
  - a tight bloom: 89% of the core at 2px, 8% by 4px
  - a faint wash: ~8–10% of the core out to ~24px, gone by ~48px.

## Approach

### 1. `components/about/about-neon.ts` — NEW. All neon values, plus the brightness track.

**Values**
- `NEON_GLOW_HEX = "#1b4789"`, recorded as a candidate starting value.
- A peak intensity for **CA** and a separate one for **CB**, so the pair can be matched.
- `BLOOM_STRENGTH`, `BLOOM_RADIUS`, `BLOOM_LEVELS`.
- `NEON_LAYER`.

**The track (D-091).** `neonLevel(pattern, tMs) → 0..1` is pure and deterministic, over authored
segments (steps or ramps). **[F5]** Each pattern has an explicit **tail**: `{ hold }` or
`{ loop: { periodMs } }`. That way the one-shot ignition and D-087's periodic loop are **the same
type**, and chunk 4 extends this function rather than rewriting it.

**Candidate patterns.** **[F6]** Each is authored to **no more than 2 rises of 0.2 or more** per
cluster, which leaves Carl headroom to tune.
- **CA strikes first.** It is dark for ~700ms, blips once or twice, then rises to 1.0 and holds.
- **CB follows.** Its first rise lands more than 1s after CA's last one.
- **Reduced motion:** a ~1.2s fade-up with no stutter (D-091).

**The flash check.** `maxRisesPerSecond(patterns)` uses a sliding 1000ms window across **both**
cards.
- **[F5] It evaluates across the loop boundary**: the window wraps the tail. A check that stopped
  at the end of the segment array would report 0 for a pattern whose worst window straddles the
  wrap.
- **[F6] It runs ONCE at module scope in dev and fails loudly in the console. It does NOT throw
  at mount**, because a throw would blank the room Carl is judging.
- **[F6] The reasoning is written into the file.** The rise count is the Builder's conservative
  proxy. WCAG's general flash threshold is conditioned on area: a combined area above ~25% of a
  10° visual field. Two card rims are far below that, and that is why the proxy has slack.

**One URL reader** for every fader. A bad value falls back to the committed constant.

**[F4] URL namespace**, cut so it holds D-087's reserved numeric freeze:

| URL | what it does |
|---|---|
| `?neon=none` | not mounted: the HEAD render path. **Identity gate only.** |
| `?neon=off` | mounted and held at level 0 |
| `?neon=full` | mounted and held at full, no ignition: static tuning |
| *(default)* | ignition on the first ready frame |
| `?neont=<ms>` | freeze the track at t. This is D-087's reserved control, and `full` is a special case of it |
| `?reignite=<ms>` | replay every N ms, for tuning |
| `?neonca=`, `?neoncb=`, `?bloom=`, `?bloomr=`, `?neonhex=` | faders |

**[F14] Recorded at the import:** `postprocessing@6.39.3` requires three `>=0.168 <0.186`, and the
project's `^0.185.1` resolves to below 0.186. **The ranges line up exactly, with no headroom.** The
next three minor version breaks the peer range.

### 2. `components/about/about-card-mesh.tsx` — EDIT. An optional `neon` prop, inert when absent.
- **When `neon` is present:**
  - The rim's `meshPhysicalMaterial` gains `emissive` = glow colour, with its intensity written
    each frame by one writer.
  - A second mesh, the **emitter**, **shares `rimGeometry`**. It uses `MeshBasicMaterial` and is
    the bloom's only input.
- **[F14] Layers are set in a ref callback** (`mesh.layers.set(NEON_LAYER)`), **not as a
  `layers={n}` prop.** R3F expects a `THREE.Layers` instance there. Get this wrong and the emitter
  draws in the base pass as a flat navy rim, which looks like "the emissive is too strong".
- **[F10] Recorded at the emitter:** `toneMapped={false}` is **redundant** on it, because the
  emitter only renders to a target, where three applies no tone mapping. The flag is kept for
  intent and **is not what protects the emitter.**
- **[F14] `neon` requires `glass`.** The rim's physical material only exists in the glass branch.
  A dev check fails loudly if `neon` is passed without `glass`.
- **When `neon` is absent** (CD, CS, the bench), there is no change.
- **Stale comments.** Correct *"four colours are ruled, none chosen"* in place at `:1014` and
  `:1051`. **[F12]** Three more copies sit in the LOCKED `about-card-glass.ts` (`:91`, `:468-469`).
  See Open for Carl.

### 3. `components/about/neon-bloom.tsx` — NEW. The canvas's frame owner (`useFrame` priority 1).

Each frame, in order, on one clock:
1. **Advance the tracks and write the levels.** Wrapped in try/catch.
2. **Base render.** `gl.setRenderTarget(null)`, then `gl.render(scene, camera)`, with `autoClear`
   as R3F leaves it (true). **This runs whatever happened in steps 1, 3, 4 and 5.**
3. **Neon pass.** `camera.layers.set(NEON_LAYER)`, then render into a HalfFloat target cleared to
   `(0,0,0,0)`, then restore the layers **in `finally`**.
4. **Blur.** `MipmapBlurPass`. **[F14]** It must call `initialize(gl, false, HalfFloatType)` and
   `setSize()` at mount and **on every resize or DPR change**, and `dispose()` on unmount.
   Without `setSize` the mip chain has zero extent and the bloom is silently absent.
5. **Composite.**
   - **[F2]** Set `gl.autoClear = false` for the fullscreen additive quad, and restore it
     **in `finally`**. Forgetting this gives a black screen.
   - The quad adds `linearToSRGB(blur × strength)` using custom blending: `ONE, ONE` on RGB, alpha
     untouched.
   - The addition onto the already-encoded image is an approximation. It is close to exact on the
     dark wall and overshoots on bright backgrounds, which goes on record for the floor pair.
6. **Frames.**
   - `invalidate()` is called while a track is changing, and it self-sustains in R3F 9.6
     (`:16144-16150`, verified by the Architect). Once the tracks hold, the canvas is back to
     demand.
   - **[F1] THE BOOTSTRAP.** Whatever writes a track's start time (the first-frame trigger, the
     `?reignite` timer, and later D-092) **calls `invalidate()` in the same statement.** A
     `setTimeout` is neither a store change nor a prop update, so without this the reignite
     silently never fires. That would hit `/about?reignite=5000#roles`, the one control Carl uses
     at checkpoint 2.
   - **[F1] Asserted, not commented.** A dev-only watchdog fails loudly if a track marked live has
     not seen a frame within ~100ms.

**[F2] If the neon work throws:** it is caught, logged once, and the neon is disabled for the
session, **and the base render still runs.** The room never goes black because of the neon. That
matters most for the identity gate, which would otherwise compare two black frames.

The neon path renders from the first frame, even at level 0, so its shaders compile at load and
not at the first stutter.

### 4. `components/about/about-card-canvas.tsx` — EDIT.
- CA and CB get channels.
- Mount `<NeonBloom channels={[ca, cb]} />` unless `?neon=none`.
- **The trigger is a stand-in: the first ready frame.** `/about#roles` shows the ignition. Plain
  `/about` followed by a scroll misses it. That is D-092's known gap, which this chunk does not
  solve.

## §5a — Structural decisions

| # | decision | rejected | couples to |
|---|---|---|---|
| S1 | `NeonBloom` owns the `/about` render loop (priority 1) | `EffectComposer`, and `SelectiveBloom`: both change the tone mapping on approved work | every later pass on this canvas; **the one clock** |
| S2 | an emitter mesh per neon card, sharing `rimGeometry`, on its own layer | `overrideMaterial`: it re-draws transmissive glass and triggers a transmission pre-pass | one geometry object, one writer |
| S3 | the D-091 track, read at two depths, **with a hold or loop tail** | per-effect timers, which drift | spill and text reflection join later as new depths; chunk 4's loop |
| S4 | `NEON_LAYER` reserved | none | the first layer use on `/about` |
| S5 | stand-in trigger: the first ready frame, **invalidating at the start** | a D-092 observer now: its questions are Carl's | D-092 replaces this trigger |

## §5b — What the current structure provides, and how each is preserved

| provided today | preserved by |
|---|---|
| R3F renders to the screen after every `useFrame` callback | the same call at priority 1. There are no other subscribers on `/about` (verified). |
| **[F2] Automatic rendering for the WHOLE ROOT.** Priority 1 switches it off permanently: every repaint (resize, DPR, a texture arriving, HMR) now goes through `NeonBloom` | **The base render is isolated from the neon's failures (§3).** `?neon=none` restores R3F's own render. |
| **[F2] `gl.autoClear`**, true by R3F's default | Untouched for the base render. False only for the composite, and **restored in `finally`**. |
| per-material tone mapping | the base path is unchanged |
| the transmission pass sees the room | unchanged; the neon pass has no transmissive objects |
| `frameloop="demand"` | idle once the tracks hold |
| `alpha: true` | the composite leaves alpha untouched |
| one WebGL context | no new canvas or context, only render targets |
| the bench and CD/CS on `AboutCardMesh` | `neon` is optional and inert |

## Structural contract
- **Modified values:** none.
- **New objects:** 2 emitters, a HalfFloat target plus a mip chain, a composite quad, and
  `NEON_LAYER`.
- **Must stay coupled:** the emitter and rim share one geometry, and the rim and bloom read one
  track value on the same frame.
- **[F10] Core and glow CANNOT be matched by one number.**
  - The base pass tone-maps the rim with ACES, so the on-screen core **desaturates toward white**
    as intensity rises, while the bloom stays saturated navy.
  - **This is D-090's model arriving for free:** *"the core is near-white; the colour lives in the
    glow."* It is intentional.
  - So `?neonca=` and `?bloom=` are **two dials, not two views of one.**
- **Must not change:**
  - D-089's values.
  - `about-card-glass.ts` stays locked, unless Carl names it (F12).
  - The stand-in rig: key 0.5, mirror 2.6, ambient 0.20.
  - The backplate, and the deliberately unrepaired right band.
  - CD and CS.
  - One WebGL context on `/about`.

## Files
- **New:**
  - `components/about/about-neon.ts`
  - `components/about/neon-bloom.tsx`
  - `verify/about-neon.mjs`
- **Edit:**
  - `components/about/about-card-mesh.tsx`
  - `components/about/about-card-canvas.tsx`
  - `components/about/about-card-glass.ts`, **comments only, and only if Carl names it (F12)**
- **Record:**
  - `decisions.md`: a new **D-093**, with forward pointers from D-090 and D-091.
  - `review-log.md`.
  - `live-work/`.
  - `current-sprint.md`: retire *"`##VERDICT:` defined but unemitted"* once the sentinel has run.
- `live-work/chunk-scope.json` names these files before the first edit.

## D-093 must record [F10, F11]
- The route, the ignition, the stand-in trigger, and the "c" starting colour.
- **[F11]** D-090's §5a paragraph, split explicitly:
  - its **threshold clause is RETIRED**: there is no threshold, because the only input is the two
    emitters.
  - its **pixel-identity clause is CARRIED** as the identity gate.
  - A forward pointer goes on D-090.
- **[F10]** The core whitens under ACES while the glow stays saturated. It is intentional, and it
  takes two dials.
- **[F12]** Either the three copies in the locked file are corrected, or they are recorded as
  knowingly left, with a pointer.

## Execution order
0. **Baseline before any edit.** `/about?…#roles` at two widths at HEAD, **taken twice**. If HEAD
   against HEAD is not identical, stop.
1. `about-neon.ts`: the track with tails, the patterns, and the flash check with its area argument.
2. `AboutCardMesh`: the `neon` prop, the layer in a ref callback, and the comments.
3. `neon-bloom.tsx`, static state (`?neon=full`) first.
4. The canvas wiring.
5. **Identity gate:** `?neon=none` **and** `?neon=off` must be pixel-identical to the baseline.
   - **[F9] Measure the red-run floor; do not assert it.** Sweep the level until the differing
     count first clears the noise floor, record that number, and file the red run at about twice
     it.
6. ⛔ **CHECKPOINT 1:** the static lit pair (`?neon=full`), by Carl's eye.
7. **Ignition.** The tracks, the reduced-motion fade, the reignite bootstrap, and a frame-interval
   measurement.
   - ⛔ **CHECKPOINT 2:** `/about?reignite=5000#roles`.
   - **[F13] The checkpoint request states that level 0 shows RIM-DARK.** The stutter begins in a
     frame with an open defect: at grazing angles the rim reflects `#141a20`. So the verdict can be
     recorded at the level it was given.
8. Gates: `tsc`, lint at `1 problem (1 error, 0 warnings)`, build.
9. The record. **Stop the servers before each checkpoint:** kill by PID and confirm the port is
   free.

## Verification — `npm run verify -- about-neon.mjs <mode>`
- **[F8] Arguments go through `verify/lib/args.mjs`** (`positionals()`, `wholeNumberArg()`). No
  hand-rolled `Number(process.argv[2])`.
- **[F7] Output:**
  - The harness emits **`##VERDICT: PASS|FAIL|NONE`** (the sentinel in `run.mjs`). This is its
    first use in a real run.
  - **Lines about blind spots start with ⚠, never ⛔.** A line-leading ⛔ matches `FAIL_MARK` and
    would turn a clean run into "disagree".
- **Modes:**
  - **`identity`:** `?neon=none` and `?neon=off` against the baseline. Reports the count of
    differing pixels.
  - **`profile`:** background-subtracted glow outward from CA's and CB's top rim, as `?neon=full`
    **minus `?neon=off`** **[F3]**, over 21 rows. That is the same path with one variable. It
    reports against the target (8% by 4px, a shelf to ~24px).
  - **`frames`:** `requestAnimationFrame` intervals during ignition. Reports p50, p95, max, and the
    count over 33ms.
- Each mode prints what it does not watch, on ⚠ lines.
- It is a new harness, so no pass is admissible. **The verdict is Carl's eye.**

## Stop conditions
- The identity gate fails, or the noise floor is not zero.
- A frame over 50ms during ignition.
- Any protected file beyond what Carl names.
- Any structural need beyond S1–S5.
- A pattern Carl asks for breaks the flash cap. **Report it; do not alter it.**

## Out of scope
- The floor pair.
- D-087's loop. **Its type exists; its periods do not.**
- D-090's lights.
- The rim lighting the face.
- Spill (D-091).
- A tint.
- D-092.
- Three.js text.
- RIM-DARK and ENVMAP-STALE.
- The enquiry canvas.
- **Pulled forward from the four accessibility items:** only the flash cap and the reduced-motion
  fade.

## Open for Carl
- **[F12]** Name `about-card-glass.ts` for a **comments-only** unlock, to correct three stale
  "four colours" lines. **Or** D-093 records them as knowingly left, with a pointer.
