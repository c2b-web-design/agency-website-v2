# Structural note: precompiling the hero's compute pipelines asynchronously (v1.0, 16 November 2026, session 2)

**Status: BUILT on Carl's instruction (16 November 2026, session 2: *"ok. get to the bottom of the stall and try to fix
it."*), uncommitted. Not approved by eye yet.** Workflow 5a: a new mechanism, and it reads three's private internals. As
built: the helper is `precompileCompute` in `hero-steam.ts` (exported; the rain imports it); the steam holds its dispatches
AND its drawing (`live`) until it resolves; the rain holds its park and step. Measured results: `decisions.md`, D-101.

## The problem (measured)
On a first visit (an empty shader cache) the opening stalls for **~0.85–1.3 s in one frame**, 1.2–1.6 s in, on the
headline's fade-in. During that frame the page's main thread is idle. The GPU process is busy compiling the steam's and the
rain's **12 compute pipelines** (plus 3 render pipelines). three r185 creates compute pipelines synchronously only
(`WebGPUPipelineUtils.createComputePipeline` → `device.createComputePipeline`), so the compile blocks the next submit. The
maps worker (built) cannot reach this.

## The proposal
When the steam's simulation and the rain's step have been built (their compute nodes exist), and before their first
dispatch, for each compute node:

1. Ask three for the WGSL it will use: `renderer._nodes.getForCompute(node).computeShader`. three caches this, so it is not
   generated twice.
2. Ask three for the bind group layouts it will use: `renderer._bindings.getForCompute(node)` → each group's `layoutGPU`
   (also cached).
3. `device.createComputePipelineAsync({ layout, compute: { module: createShaderModule({ code }), entryPoint: "main" } })`.
   This matches three's own descriptor: same code, same entry point, same layouts.
4. The first `renderer.compute(node)` waits until all of these have resolved. three's synchronous create then hits
   Chrome's cache. In the probe that cost **679 ms → 4 ms**.

Where: a small helper in `hero-steam.ts` (its `warm`) and `hero-rain.ts` (its `warm`/`compute`), both open in scope. No
new file.

## What it couples to
- **three r185's PRIVATE surface:** `renderer._nodes`, `renderer._bindings`, `renderer.backend.get(group).layout.layoutGPU`.
  three is pinned at r185 (`package.json`), but an upgrade could rename any of these. **Guard:** if any piece is missing
  or throws, skip the precompile. That is exactly today's behaviour (the synchronous compile), so it can never be worse.
- **Chrome's pipeline and shader cache** (Dawn). Measured in Playwright's Chrome on D3D11, not yet on Carl's Chrome.
- **The steam's and rain's first dispatch moves** from "when built" to "when built AND precompiled" (~0.2–0.7 s later on a
  cold cache). Nothing the visitor sees depends on it until the rain, ~25 s later. The steam's warm-up and clear are
  load-time only.

## Rejected
- **Wait for a three upgrade with async compute:** none exists in r185, and the deadline is 19 November.
- **Spread the 12 compiles one per frame:** twelve smaller hitches (~50–100 ms each) instead of one. Something is always
  moving, so each one shows.
- **Build the steam later:** any time during the story is visible, and its box depends on the landed pose.

## What it does NOT fix
- The **first-frame** stall (opening 0.1–0.2 s, 4 render pipelines at the first draw), which lands while the lights are at
  0. It could be fixed with `compileAsync` before the first frame, but that changes when the opening starts, so it is
  Carl's call.
- three's shader **generation** (main-thread JS). On a warm load the remaining frames are 100–170 ms.

## Test, if approved
`hero-opening-measure` (cold and warm), `hero-opening-gpu-creates` (the 12 compiles must show as free), and
`hero-first-run-hitch` (the drops still have no frame over 50 ms). The phase-1 null control is unaffected (no visual change).
