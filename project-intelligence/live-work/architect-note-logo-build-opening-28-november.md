# Note for the Architect: the logo's build is too slow for the flowing opening (v1.0, 28 November 2026)

**From:** the Builder. **Routed by:** Carl. Carl, 28 November 2026: *"This building does not have to go through the
architect. Nothing new structurally is being built only optimisation. However, it may be necessary to consult the architect
if the opening loading cannot be optimised fully."* Optimisation has now reached its limit. That is why this note exists.

**What is asked of you:**
1. **Review the diagnosis below** and the measurement proposed for the open question (§4).
2. **Review the candidate routes** (§5). Each is structural, so none is built until you and Carl have ruled.

Nothing in this note has been built. Today's optimisation is committed and pushed (`ae134a4`). The record is D-101 in
`decisions.md`, from *"THE FLOWING OPENING: CARL's VERDICT, AND THE LOGO AFTER THE TEXT"* to the end.

---

## 1. The rule the opening has to meet

Carl, 28 November 2026: *"on the logo fade in. it should be when the text and subtext have loaded. The aim is to keep the
flow."*

The flowing opening (`FLOW_OPENING`, `hero-scene.ts`) runs in this order:
- the 2D headline (HTML) from the first paint;
- the 3D headline growing back out of it;
- the subtext revealed letter by letter, each 3D letter already extruded;
- **the logo, once the subtext's last letter is in.** That is about **8.9 s** after the first paint on a production build.

The logo's fade also waits for its programs to be built (`openingReady` = `warmed`, `hero-scene.ts:2677`). The logo is
never drawn before then: three r185 skips an object whose pipeline is still compiling, so it would vanish.

## 2. What was measured

All figures are from production builds (`next start`) at Carl's window size, filmed and timed from the first paint.

| | First visit (cold) | Return visit (reloaded after a full first load) |
|---|---|---|
| The 3D's first frame | 2.3–3.1 s | 2.4–4.2 s |
| The warm-up starts (`hero:Warm`, once the logo exists) | 2.4–3.3 s | 2.5–4.3 s |
| The warm-up is done (`hero:WarmDone`) | 11.5–15.6 s | 13.3 / 16.3 s |
| **The logo is visible** | **12.2–16.0 s** | **13.7 / 16.7 s** |
| The subtext's worst hold (screen frozen) | 100–134 ms | 83 ms / 417 ms (once) |

- **The logo's own programs are the cost.** On one take the warm-up was split into stages (since withdrawn): stage A held
  only the logo's own programs (its fade material with its depth part, its opaque material) and the floor web. **Stage A
  alone took ~9–10 s** of the warm-up's ~10 s. The liquid and the heat plane took 0.3–0.6 s; everything else ~0.8 s.
- **Running the builds side by side gave no gain.** One `compileAsync` per object was no faster than one over the whole
  scene. Whatever the time is, it is not three building objects one after another.
- **A return visit is no faster.** The browser's shader cache does not save the ~10 s.
- **Runs vary a lot on this PC.** One run in five is markedly slower throughout.

The logo's material is `logoMaterial` (`hero-scene.ts:480`). One shader carries every look in the story: the red metal,
the liquid fill, the flow map, the heat, the wash to platinum blue, wet and dry, the gold, three prefiltered reflections
(courtyard, studio, judging studio), and its own lights.

## 3. Already done and committed (`ae134a4`)

These are context only; nothing here needs your ruling.

- **The first frame's pipelines** are built with `compileAsync` before the loop starts (`hero-bench.tsx`, `start()`).
- **The reflection maps' prefilter pipelines** are built first by a dry run of three's own `PMREMGenerator`
  (`primePrefilter`, `hero-scene.ts:1396`). The primer joins the scene only once those pipelines exist.
- **The subtext's 2D letter fades** are 0.5 s (were 0.12 s). The "stall after the W" was the reveal's own schedule, not a
  freeze.
- **The opening's freezes** are down from 250–1,050 ms to about 100 ms.

Tried on production and withdrawn: the prefilter alongside or after the first frame's builds, and the warm-up side by side
or in the story's order.

## 4. The open question: what the ~10 s actually is

The return visit rules out the simple answer, a GPU compile the browser caches. Two explanations remain:

- **(i) JavaScript, on the main thread:** three turning the logo's node graph into WGSL (`getForRenderAsync`, which yields
  between steps), plus binding setup.
  - For: no single main-thread stall of that length appears (the holds during the warm-up stay near 100 ms), which fits
    work broken into yielding pieces.
  - The second gather (with the opaque material) would pay this cost again.
- **(ii) The GPU's compile, not kept by Chrome:** `createRenderPipelineAsync` on Dawn and D3D for a very large shader
  (see the 10 November record: D3D inlines every function call).
  - For: async compiles would not freeze the page.
  - Against: the 16 November cold measurement (~4.3 s for the logo's first build) predates most of the shader's growth.

**Proposed measurement (read-only, the Builder's to run if you agree).** Time the warm-up's logo item in three parts:
- the node build: wrap `renderer._nodes.getForRenderAsync` and time it;
- the pipeline promise: from `_pipelines.getForRender` to resolve;
- the WGSL's size: `vertexShader.length` and `fragmentShader.length`.

Run it cold and on a return visit, on a production build. This tells (i) from (ii) and says which routes in §5 can work.

## 5. Candidate routes (for review, none built)

- **A. A light opening material for the logo.**
  - What it is: the red-metal look only (the opening shows the logo red, leaning, still), built first. The logo fades in
    with it, and the full material is swapped in once built, before the story needs any other look.
  - Structural (Workflow 5a): a second material on the logo, and a swap whose frame must be invisible. It couples to the
    fade parts (`logoFadeParts`: fade, depth, opaque), the shadow warm-up (`warmShadow`), and `openingReady`.
  - Helps under (i) and (ii), provided the light material builds in under ~6 s.
  - Risk: the light look must match the full material's red state to the pixel. The bar is "Nothing in the hero may read
    as a glitch".
- **B. The logo's material split by phase:** one material per look, each swapped in at a phase boundary.
  - Fixes the opening and spreads the later builds out.
  - A larger structural change, with a swap per phase.
- **C. A cheaper shader:** fewer branches; constants turned into uniforms; work moved out of the fragment stage.
  - Helps under (ii) mostly. Its reach is unknown without §4.
  - Risk: any change to the logo's look needs Carl's eye ("The logo is the metal standard").
- **D. Start the logo's build earlier.**
  - The warm-up starts once the logo exists (~2.5 s), but the material could be built against a stand-in geometry with
    the same attributes from the page's start.
  - Saves ~2–3 s at most, so it cannot meet 8.9 s alone. It could pair with A or C.
- **E. Accept the wait:** the logo at ~12–16 s.
  - Carl's rule (*"keep the flow"*) would not be met. **Carl's call, not a technical one.**

## 6. What depends on the warm-up as it stands (Workflow 5b)

Any route that changes the warm-up or the logo's materials must keep each of these:

- **The logo is never drawn before its pipelines exist** (`openingReady`). A route that fades in a different material
  needs its own gate.
- **The floor web is drawn only once its program is built** (`floorHeat.update(warmed, …)`).
- **The warm-up waits for the prefilter** (`prefiltered`, `hero-scene.ts:3219`), because the logo, cloth and liquid sample
  those maps. A material built before their prefilter pipelines exist would make three build them synchronously, or skip a
  pass still building and cache a wrong map.
- **The story's clock starts at the end of the logo's fade.** Touchdown, which needs the liquid and the heat plane, comes
  ~2.7 s later.
- **The shadow pass's warm-up** (`warmShadow`) runs after the warm-up, in the logo's story material.

## 7. Evidence and tools

- **Scripts** (`live-work/scripts/`, committed):
  - `hero-flow-film-28-november.mjs`: films a load; `BASE` picks the server; reload mode with `PRELOAD_MS`.
  - `hero-flow-holds-28-november.py`: holds in the subtext's reveal, laid against the scene's marks.
  - `hero-flow-letter-gaps-28-november.mjs`: the 2D reveal's own still gaps.
  - `hero-first-frame-28-november.mjs`: slow builds, rAF and screencast gaps on one clock.
  - `hero-opening-gpu-work-16-november.mjs`: GPU time per submit. ⚠ It lists frames only once the scene's clock runs, so
    it is blind before the first frame.
- **Films:** `Videos\C2B Films\03 The hero\2026-11-28_flow-opening_take3-async-builds` and
  `…_take4-subtext-already-extruded` (both dev).
- **Not watched:** Carl's own Chrome and profile (all of the above is Playwright's Chrome on this PC); other GPUs and
  devices; phones.
