# Plan: the liquid's shader compiled without freezing the page (10 November 2026, session 2), v1.2

**v1.2:** on the Architect's review of v1.1 (all 10 points confirmed; approvable on condition these four are worked
in, no further round): the forced DELAY counted from the HOLD's start (so it always holds); a forced TIMEOUT check
(the 1 s wait itself tested); WITHOUT a handle the liquid behaves as today; a READY ARRIVING LATE waits for the next
loop. Re-checked: `material.side` in the render object's key (`RenderObject.js:752–757`); `dispose()` calls
`onDispose` (`:969`).
**v1.1:** on the Architect's plan review (10 points; 1–4 must-fix). Changes: the probe's freeze bar set on the COMPILE
window (the bake and the regions reported apart); registration in a LAYOUT effect AND the warm-up waits for the handle;
the dispose hook looks up the CURRENT registration; the hold written EVERY frame and clamped BEFORE the clock crosses;
step 1 by a PERFORMANCE TRACE with a stop line matching the bar; check 5 rebuilt on a key-changing property in its own
load; a forced DELAY added and filmed; the lint baseline corrected; console errors counted before; the 1 s is wall clock.
Source claims re-checked by the Builder (`camera-bench.tsx:1239–1243`, `hero-logo.tsx:295`, `RenderObject.js:263, 949`).

**Builds:** `live-work/structural-note-liquid-async-compile-10-november.md` v1.4 (+ Carl's PiP tail). **Carl's
decisions:** max wait 1 s; the extra beat accepted; `bench-medium-webgpu.tsx` authorised. **Gate:** this plan → the
Architect (`handoff-protocol.md` §2.5) → Carl approves.

## Context

On a cold load the liquid's first draw holds the page 3.1–3.7 s: three r185 builds its render pipeline synchronously on
first draw. Today's warm-up draw only moves the freeze into the lean. Carl: *"the freexe has got to go."* The note's
route: the liquid's pipeline built ASYNC in the real draw through ONE wrapper the bench medium installs; readiness read
from the liquid's render objects; a gate holding the swap and the expulsion's clock together; a failure branch.

## Step 1 — measure BEFORE the change (no code change to the site)

NEW `live-work/scripts/liquid-stall-split-10-november.mjs`, a cold load (fresh context, `/proto/camera?blank=1`,
nothing touched), two runs:
- a PERFORMANCE TRACE (`browser.startTracing` with the `devtools.timeline` and `disabled-by-default-devtools.timeline`
  categories) over the stall, separating the main thread's SCRIPT execution (`FunctionCall` / `EvaluateScript` / V8
  compile and run events) from time it is blocked or idle WAITING (the GPU process). Long tasks NOT used for the split
  (a long task counts waiting as busy).
- the rAF gaps (as `liquid-cold-load-timing-10-november.mjs`), the bake and the regions marked by their own published
  times (`__liquid.stats.bakeMs`, `regionsMs`).
- the CONSOLE ERRORS from load to 25 s, counted and listed: the BEFORE count for check 2.
- ⛔ **STOP AND REPORT** if the script share inside the compile stall is over **~100 ms** (matching check 1's bar):
  async pipelines cannot remove it; the note's seam for it (`NodeManager.getForRenderDeferred`) is a further decision.
- Output to `live-work/liquid-stall-split-10-november.md`: the BEFORE figures.

## Step 2 — the wrapper, in the medium

**`bench-medium.ts`**: one OPTIONAL member, `asyncCompile?: (gl: unknown, material: THREE.Material) =>
AsyncCompileHandle`, `AsyncCompileHandle = { state(): "pending" | "ready" | "failed"; dispose(): void }` (+ dev-only
`force`, below). The WebGL medium leaves it out (without it the liquid keeps today's behaviour).

**`bench-medium-webgpu.tsx`**, installed ONCE per renderer in `startRenderer` after `init()` (the `started` map already
gives one renderer per canvas):
- a per-renderer REGISTRY `Map<material, Registration>`; `Registration = { open, seen: Set<renderObject>, firstReady }`.
- the wrapper on the INSTANCE's `renderer._pipelines.getForRender(renderObject, promises)`: for a registered material,
  the render object is added to the CURRENT registration's `seen`; its `onDispose` chained once (marked in a `WeakSet`),
  the chained hook looking up the material's registration AT DISPOSE TIME and deleting the render object from THAT
  registration's `seen` (a re-registration cannot leave a dead render object behind — review item 3); if the
  registration's window is OPEN and `promises === null` → call through with a fresh `[]` (the async route); otherwise
  unchanged.
- `asyncCompile(gl, material)` registers (a NEW registration replacing any old one: per registration, reset) and
  returns the handle. `state()`: `failed` if any seen render object's backend pipeline has `error`; `ready` if `seen` is
  non-empty and every one `isReady` with no error; else `pending`. The first `ready` CLOSES the window (later builds
  stall as three's default). `dispose()` unregisters only if the registry still holds THIS registration.
- DEV ONLY `force("fail")` (state reads `failed`) and `force("delay", ms)` (state reads `pending` until `ms` of WALL
  CLOCK after the HOLD ENGAGES, i.e. after the clock first sits at `settled` held — so a hold ALWAYS happens and lasts
  `ms`; counted from the real first `ready` it could end before `settled` and test nothing). The hero tells the handle
  when the hold engages (`handle.holding()`, dev bookkeeping only) — for checks 4, 6 and 7.
- Typed narrowly at the one place it touches three's privates, its comment naming three 0.185.1 and the lines relied on.

## Step 3 — the gate and the failure branch, in the hero

**`hero-idea.tsx`**: passes `medium.asyncCompile` to `HeroLogo` (as `pmrem`).
**`hero-logo.tsx`**: passes it on to `HeroLiquid`; owns `holdRef = { hold: false }`. `useJump`'s advance: if `hold` and
the clock is AT OR BEFORE `settled`, `t = min(t + d, settled)` — clamped BEFORE it crosses, never stepped back (review
item 4); otherwise as today (`% L`).
**`hero-liquid.tsx`**:
- ⛔ **WITHOUT a handle** (a medium with no `asyncCompile`): everything as TODAY — the warm-up runs, no hold, the swap at
  `start` (review v1.1, item 3).
- registers in a LAYOUT effect (`useLayoutEffect`: the same commit as the material — a passive effect can run a frame
  late on this medium, `camera-bench.tsx:1239–1243`), the handle in a ref, disposed on cleanup; AND the warm-up draw
  WAITS for the handle (review item 2: a warm-up drawn before registration would build synchronously, the freeze back).
- the WARM-UP DRAW stays (2 frames during the lean): it STARTS the async build; its header comment corrected.
- **EVERY FRAME from mount:** `holdRef.hold = (handle && state() !== "ready" && !off)` — so the jump clamps before
  crossing, and the hold is OFF once ready (or off after a failure) across every later loop of the `% L` wrap.
- **THE GATE:** the swap (solid hidden, field shown) only when `state() === "ready"`; otherwise the solid stays, the
  field hidden. ⛔ **A READY ARRIVING LATE** (the clock already more than one frame past `start` when `ready` first
  reads, e.g. a late registration on a slow device, where the clamp never bound): the swap WAITS FOR THE NEXT LOOP — the
  field never appears with its blobs already mid-flight (review v1.1, item 4).
- **THE FAILURE BRANCH:** `failed`, or the hold past **1 s of WALL CLOCK** (`performance.now()` from the first frame the
  clock sits at `settled` held — the jump's clock is held then, so it cannot measure the wait) → `off = true` for this
  registration: the hold released, the solid stays through the liquid's time, the loop runs on; a console WARNING naming
  why (not an error).
- DEV hook `window.__liquidCompile`: `state`, `seen` (count, and each render object's `id` for check 5), `holdMs` (last
  hold), `failedWhy`, `force` (passed through).

## Step 4 — the probe (bars set before the run)

NEW `live-work/scripts/liquid-async-compile-probe-10-november.mjs`, cold loads, WebGPU and `&forcewebgl=1`, two runs each:
1. **No freeze in the COMPILE window:** the largest rAF gap from the warm-up draw to 2 s after the expulsion's start ≤
   **100 ms**. The bake's and the regions' gaps (before the warm-up: it waits for the regions) MARKED and reported apart
   as the known open item, not judged here.
2. **Clean console:** errors from load to 2 s after `ready` ≤ step 1's BEFORE count, and **0** new ones.
3. **The gate's hold:** `holdMs` reported (0 expected here).
4. **The failure branch, forced** (`force("fail")`): the solid stays, the field never shown, the clock passes `settled`
   within 1 s + one frame of wall clock, 0 new errors.
5. **The kept render objects are the live ones** — in ITS OWN LOAD (after `ready` the window is closed, so this rebuild
   STALLS, reported, accepted): after `ready`, a property in the render object's cache key changed (`material.side` to
   `DoubleSide`, `needsUpdate`), then: the `seen` render object's `id` CHANGED (three replaced it, `RenderObjects.js:127–133`),
   `seen` holds the replacement only, `state` returns to `ready`.
6. **The hold on its way to ready, forced and FILMED** (`force("delay", 600)`, counted from the hold's start: a ~600 ms
   hold every time): the hold engages at `settled` (the clock
   clamped, no step back), releases at ready, and the field's first frame shows te ≤ one frame (no blobs popping in
   mid-flight). Filmed with `hero-cold-load-film-10-november.mjs`'s method into the film folder: the hold Carl judges by
   eye.
7. **The 1 s TIMEOUT, forced** (`force("delay", 1500)`, counted from the hold's start): the failure branch fires at
   **1 s** of wall clock BY THE TIMEOUT (`failedWhy` names it), the solid stays, the clock goes on, 0 new errors. AND
   on the NEXT loop the liquid stays OFF, though the forced delay ends at 1.5 s and `state` turns `ready`: the failure's
   `off` (for the whole registration) beats the late-ready rule (the Architect's optional addition, v1.2 review).
   (Check 4's `force("fail")` tests only the ERROR half: it reads failed at once and never holds.)
⚠ NOT WATCHED (printed): Carl's Chrome; real slower devices (checks 6 and 7 force the paths); third person (Carl: no PiP);
production builds.

## Files

Modified: `components/showcase/bench-medium.ts`, `bench-medium-webgpu.tsx`, `hero-idea.tsx`, `hero-logo.tsx`,
`hero-liquid.tsx` (all in scope; the medium authorised by Carl this session). NEW: the two scripts and the before-figures
record in `live-work/`. Docs: D-101; the note → BUILT; the handoff.

## Structural contract

- Modified: the medium's seam (one optional member); the jump's clock (a hold, clamped before it crosses); the liquid's
  swap (gated).
- New: ONE wrapper per renderer on a private three method (the note's structural decision, reviewed v1.0–v1.4).
- Coupled: the gate's 1 s and the failure branch; the window closing on the first `ready`; registration before the
  warm-up.
- Must not change: the approved jump and wobble (R-105), the approved blobs' look, the logo's reflection (R-104), the
  emergence as built (not yet judged).

## Stop conditions

- Step 1's script share in the compile stall over ~100 ms.
- Any of the seven probe checks failing its bar, or new GPU errors in the compile window: stop, report, no workaround.
- A change needed outside the five files.

## Verification

`npx tsc --noEmit` clean. `npm run lint` against CLAUDE.md's baseline: **1 error (`enquiry-opening.tsx`), ZERO
warnings**. ⚠ The previous handoff named "2 `projector.mjs` warnings" (`live-work/hero-concept-8-november/projector.mjs`)
as baseline: that contradicts CLAUDE.md; if they show, they are FLAGGED TO CARL as unrelated pre-existing faults, not
adopted. The probe's seven checks; `hero-cold-load-film-10-november.mjs` re-run (the logo never vanishes, no stand-in);
then Carl's hard refresh by eye. Measuring stopped before any checkpoint (CLAUDE.md, Workflow 5).
