# Q5 reveal — the GPU trace, and the precompile warms a context the cards never use

**13 August 2026. Reading only — no code changed, no fix proposed.**
Arm `4c7a20e`, production build, headed, real GPU (`ANGLE (AMD Radeon(TM) Graphics, D3D11)`).
CDP `Tracing` with the GPU categories on. **Four traces: two from Begin, two from page load.**

---

## ⚠⚠ THE HEADLINE — THE ADDRESSES DIFFER

**The warm-up context and the card-canvas context are two different WebGL contexts.**

    warm-up      .WebGL-0x3834001b9600     833.5ms GPU busy      0.0ms inside the gap
    card canvas  .WebGL-0x38340099bc00     459.8ms GPU busy    262.6ms inside the gap

**The precompile architecture warms a context the cards never use.** The warm-up context does
**833.5ms** of GPU work and contributes **nothing** to the reveal. The card canvas is created
fresh after Begin and pays its own compile cost from scratch.

⚠ **AND THE CLINCHING COUNT: `DoLinkProgram` fires 34 times — 17 before Begin, 17 after.**
The same seventeen programs, linked twice, once per context.

**This also explains the 13 August program-count probe** (`q5-program-count-probe-13-august.md`),
which read 14 programs at warm-up resolve and 14 after the reveal and called it "no growth".
**Those were two different contexts each holding their own set** — not one warmed set surviving.
The probe measured a real number and drew the wrong conclusion from it, because it never checked
context identity. Corrected here.

---

## THE THREE CONTEXTS — from-load trace, both runs agreeing

| context | life | GPU busy | inside gap |
|---|---|---:|---:|
| A `…001bae00` | −7564 → −6663ms | 2.3ms | 0.0ms |
| **B — warm-up** `…001b9600` | −7368 → **+1483ms** | **833.5ms** | **0.0ms** |
| **C — card canvas** `…0099bc00` | **+186** → +3464ms | 459.8ms | **262.6ms** |

Second run: 3.0ms / 777.9ms / 402.5ms, gap 212.5ms. Same shape.

**Tied to the app's own marks, not inferred from timing:**

    -6738ms   warmup-canvas-created        <- context B
    -5492ms   warmup-canvas-compiled
    ─────────────────── Begin ───────────────────
      +182ms   gl::init::CreateGLContext   <- context C created INSIDE the reveal
      +254ms   card-canvas-created
      +372ms   card-canvas-compiled
      +412ms   THE GAP OPENS

`gl::init::CreateGLContext` and `GLES2CommandBufferStub::Initialize` each fire **3x**, at
−7613ms, −7372ms and **+182ms**. The third is the card canvas. It shares nothing with the warm-up.

---

## WHAT IS IN THE GAP — self time, not nested totals

⚠ **RAW TOTALS ARE MEANINGLESS HERE AND THE FIRST READING NEARLY REPORTED THEM.** `RunTask` →
`WebGL` → `CommandBuffer::Flush` → `PutChanged` all report ~207ms because they are the same work
counted eleven deep. **Self time collapses it to one leaf:**

    207.2ms self   11x   CommandBufferService:PutChanged   [CrGpuMain]   <- 99% of the gap
    209.0ms self   13x   ThreadControllerImpl::RunTask     [GpuVSyncThread]  (idle wait, not work)
      1.2ms self   12x   ThreadControllerImpl::RunTask     [StackSamplingProfiler]
      0.5ms self    1x   SkiaOutputSurfaceImplOnGpu::CopyOutput

Everything else is under 0.5ms across 74–79 distinct event names. The four expensive flushes,
all on the card-canvas buffer:

    +372ms    22.9ms
    +396ms    22.7ms
    +418ms    69.6ms
    +488ms   101.9ms   <- largest

### Main thread during the gap: **IDLE**

| trace | gap | main-thread busy | idle |
|---|---|---:|---:|
| A | 210ms @ +383ms | **2.3ms** | 207.3ms |
| B | 209ms @ +341ms | **2.3ms** | 207.1ms |

The only main-thread activity is two ~2ms `ProxyMain::BeginMainFrame` tasks, one at each **edge**
of the gap — the frame before it stalls and the frame that resumes. Between them the renderer does
nothing for ~207ms. **Not blocked, not contended: idle.** GPU process is 100% busy across the same
window.

### Shader linking inside the gap: **NONE — but not for the assumed reason**

All 17 post-Begin `DoLinkProgram` events land at **+161–325ms**, finishing 16–58ms **before** the
gap opens. Total link time **2.7–2.9ms**. Linking is not the cost.

⚠ **AND THEY ARE NOT LEFT OVER FROM THE WARM-UP.** They are the card context's own 17 links,
happening after Begin.

### Transmission render-target allocation inside the gap: **none visible**

Only 5–6 RT-ish events fall in the gap, all compositor-side: `DXGISwapChainImageBacking::Present`
(14.29ms), `FinishPaintRenderPass` (0.25ms), `DrawRenderPass` (0.08ms).

⚠ **STATED AS A LIMIT, NOT A CLEAN RESULT: `PutChanged` is opaque at these categories.** A
`renderTransmissionPass` allocation inside those 262ms would emit no named event. **No allocation
is visible; that is not the same as none occurring.**

### Texture uploads: **not measurable in this capture**

No `TexImage`, `TexStorage`, `texSubImage` or decoder equivalent appears anywhere in either trace,
and **no byte counts are available.** The only texture-adjacent events are compositor-side.
Answering this needs `disabled-by-default-gpu_decoder` or a client-side count — a different
capture.

---

## ⚠ THREE INSTRUMENT FAULTS CAUGHT IN THIS READING

**All three produced a comfortable, wrong answer before being caught.**

1. ⚠⚠ **THE FIRST TRACE ANALYSIS WAS VOID AND ALMOST REPORTED.** Trace `ts` is the **monotonic
   boot clock** in microseconds; `performance.now()` is ms since `performance.timeOrigin`
   (Unix epoch). They share **no base**. Converting arithmetically was wrong by ~1.78e15 µs, so
   every window query returned empty and printed *"main thread idle, GPU idle, no shader
   activity"* — **a false clean that looked exactly like a finding.** Fixed with a
   `performance.mark("Q5_T0_ANCHOR")` visible in both clocks, plus an abort if the trace does not
   span the gap.
2. **A regex matched `PerformMicrotaskCheckpoint`** on "Check-*point*", inventing **1093 phantom
   "shader" events at 0.0ms**. The real event is `GLES2DecoderPassthroughImpl::DoLinkProgram`,
   found by **enumerating actual GPU event names instead of guessing them**.
3. **"Only two contexts exist" was reported and was wrong.** The from-Begin trace started at
   **−63ms**, and the warm-up context is created ~5.6s before Begin — **out of window.** Its
   absence was a limit of the capture, not a finding. Re-traced from page load, which is what
   produced the result at the top of this file.

⚠ **THE PATTERN: every one of these read as a clean or tidy result.** A harness that reports
nothing wrong is the thing to distrust first.

---

## STATE

- Branch `fix/q5-stall-and-label-colour`, head `0a9e518`, **working tree clean.**
- **No source file changed at any point.** Arms were whole-commit checkouts, restored after.
- Trace harnesses and analysis scripts live in the session scratchpad only; nothing added to
  `verify/`.
- Ports 3000 and 3100 confirmed free; every server killed by PID.

---

*Findings only. Carl decides.*
