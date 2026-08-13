# Stage 1 — the resolution test and the true-cold-cache reading

**13 August 2026. READING ONLY — no code changed, no fix, no host work.**
Arm `4c7a20e`, production build, headed, real GPU (`ANGLE (AMD Radeon(TM) Graphics, D3D11)`).
Metric identical to `verify/q5-stutter.mjs`: worst frame gap inside the 0–1300ms reveal.

---

# ✅ PART 1 — THE ANSWER IS (a). PROCEED TO STAGE 2.

## The test

| viewport | pixels | samples | **median** |
|---|---:|---|---:|
| 1280×720 | 0.92M | 336 / 248 / 204 / 197 / 243 / 233 | **240ms** |
| 2560×1440 | 3.69M | 225 / 208 / 220 | **220ms** |

**A 4× increase in pixels produces NO increase in the stall.** If anything the larger viewport
measured marginally lower, which is within the noise of these arms.

    (a) program instantiation, resolution-independent   →  PREDICTED ~equal      ✅ OBSERVED
    (b) fragment cost in renderTransmissionPass         →  PREDICTED ~2x (or 4x) ❌ NOT OBSERVED

## ⚠ THE BRANCH IS (a) — PROGRAM INSTANTIATION

On D3D11 `glLinkProgram` translates GLSL→HLSL, and the driver builds the real D3D shader
objects and pipeline state **at first draw, inside the command buffer**. That is what the
207–262ms of `CommandBufferService:PutChanged` self time is, and it is why every main-thread
instrument called the page healthy.

**Stage 2 is not wasted work.** A warming strategy can touch this, because the cost is
per-context program instantiation and the fault is context lifetime.

## Independent corroboration, unprompted

The client-side `linkProgram` counter agreed with the GPU trace on **every one of the 21 runs**
in this reading, at both resolutions and in all cache states:

    17 linkProgram calls BEFORE Begin   ·   17 AFTER Begin

Two independent instruments — a CDP trace of `GLES2DecoderPassthroughImpl::DoLinkProgram` and a
patched `WebGLRenderingContext.linkProgram` — now report the same 17/17 split. **The same
seventeen programs are linked twice, once per context.**

---

# ⚠⚠ PART 2 — THE CACHE READING, AND IT CORRECTS THE RECORD TWICE

## The four arms — real canvas `mount → compiled`

| arm | warm-up | ANGLE disk cache | **median** |
|---|---|---|---:|
| 1 | present | warm (today's measurements) | **106ms** |
| 2 | present | **disabled — true first visit** | **159ms** |
| 3 | absent (`?nowarmup=1`) | warm | **1353ms** |
| 4 | absent | **disabled** | **1351ms** |

## ⚠ FINDING 1 — WHAT A GENUINELY FIRST-VISIT USER PAYS: 159ms, NOT 106ms

**Carl's suspicion was correct and the effect is real.** Every "cold" number in this project —
including the 161ms floor — was taken on a machine whose ANGLE binary shader cache was already
warm from earlier runs. `verify/q5-stutter.mjs` does **not** pass
`--disable-gpu-program-cache` / `--disable-gpu-shader-disk-cache`; only `warmup-value.mjs` does.

⚠ **BUT THE PENALTY IS ~53ms, NOT THE ~758ms THE RECORD IMPLIES.** A first-visit user pays
159ms where a repeat visitor pays 106ms. That is a real cost and it should be the number
quoted, but it does not change any decision on its own.

## ⚠⚠ FINDING 2 — THE 758ms "ANGLE CACHE BENEFIT" IS MISATTRIBUTED

The record says: *"ANGLE's on-disk binary shader cache survives the context's death and is
worth ~758ms"*, derived from 161ms (warm-up present) vs 919ms (absent).

**Both halves of that comparison reproduce here — 106ms vs 1353ms, a gap of ~1250ms — but the
disk cache is NOT what produces it:**

- Disabling the disk cache **with** the warm-up present costs only **53ms** (106 → 159ms).
- Disabling the disk cache **without** the warm-up costs **nothing at all** (1353 → 1351ms).

**If the benefit were the disk cache, arm 4 would be dramatically worse than arm 3. It is
identical.**

⚠ **SO THE WARM-UP'S ~1250ms BENEFIT COMES FROM SOMETHING ELSE — most plausibly warm
process-level GPU state: the driver's loaded/compiled state, ANGLE's in-memory program cache,
and D3D device and pipeline objects that persist in the GPU process across the context's
death.** That is a guess as to mechanism and is **marked as a guess**; what is measured is that
**the on-disk cache accounts for 53ms of it and no more.**

## ⚠ WHY THIS MATTERS FOR STAGE 2 — IT STRENGTHENS THE PLAN, NOT WEAKENS IT

Carl's Stage 2 rationale states: *"The ANGLE disk cache is keyed on shader source, not context,
so any context compiling those 17 programs early still fills it."*

**The measurement supports the conclusion and corrects the reason.** Whatever the warm-up
actually provides — process-level GPU state rather than the disk cache — it is supplied by
**any context that compiles those 17 programs early**. Nothing in these numbers is specific to
the compiling context being a *second, separate* one.

⚠ **AND THE COST OF THE CURRENT DESIGN IS NOW VISIBLE: the warm-up canvas takes 1277–1368ms of
setup to save ~1250ms.** It very nearly pays for itself and no more — while creating the second
context that is the whole defect.

⚠ **THE ONE THING STAGE 2 MUST NOT ASSUME:** that early compilation in the card context
reproduces the benefit. It is the plan's central premise and it is **untested**. The falsifiable
prediction already covers it — if `mount → compiled` lands near 1350ms rather than near 106ms,
the premise is wrong and the host must be reconsidered, not shipped.

---

## ⚠ AN INSTRUMENT FAULT CAUGHT IN THIS READING

`stage1b.mjs` reported `⚠ ARM DID NOT TAKE EFFECT` on the `?nowarmup=1` arms. **The arm was
fine; the detector was wrong.** It waits up to 4s for `[data-testid="answer-card-warmup"]` to
attach, and on the held-over path that node legitimately appears for 900ms *after* Begin. Direct
check:

    ?nowarmup=1   warm-up nodes: 0   canvases: 0
    plain         warm-up nodes: 1   canvases: 1

The flag suppresses correctly and the 1353ms figures stand. **Recorded because this project's
standing failure mode is an instrument that looks authoritative while measuring the wrong
thing** — here it produced a false ALARM rather than a false clean, which is the safer
direction but the same defect.

Also noted: `verify/q5-stutter.mjs` creates **one profile per invocation**, not per run, so only
its run 1 is ever cache-cold. The Stage 1 harnesses create a fresh profile per run.

---

## STATE

- Branch `fix/q5-stall-and-label-colour`, head `4939653`, **working tree clean.**
- **No source file changed.** Harnesses lived in the scratchpad and were removed.
- Ports 3000/3100 confirmed free; server killed by PID.

---

## ⏸ AWAITING CARL'S WORD

**Stage 1 returns (a).** Per Carl's instruction, Stage 2 does not begin without his explicit
go-ahead.

*Findings only. Verification is not approval.*
