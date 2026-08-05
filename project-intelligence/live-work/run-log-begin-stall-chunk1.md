# Run log — Begin stall, chunk 1 (Steps 1 + 2)

**5 August 2026. Carl: *"you can execute the fix."*** Executed against the Architect's answer,
`live-work/architect-answer-begin-stall.md`.

⚠ **SCOPE BOUNDARY, STATED HERE BECAUSE NOTHING ENFORCES IT.** `chunk-scope.json` is still
deleted, so the repo is fail-open. **This chunk is Steps 1 and 2 only** — unhook and measure.
Steps 3a/3b and Step 4 are NOT in it: 3a/3b is decided by these numbers, Step 4 needs Carl's
judgement on a trade. **No approved visual layer was touched.**

---

## Step 1 — the unhook. Done.

**`enquiry-opening.tsx:960` — `warm={cardCanvasWarm}` removed** from the real Q5
`AnswerCardCanvas`. The prop defaults to `true`, so that is the whole edit.

**The defect it removes:** `cardCanvasWarm` was one flag doing two jobs — gating the hidden warm-up
canvas AND gating the real one, where `warm` feeds both `mayCompile` and `entranceRunning`. A flag
that never flipped meant no precompile, no `onWarm`, no `compiled`, **and no cards.** That is the
whole of the 4 August failure reverted at `8e562ed`.

**The `warm` prop and `mayCompile` stay on the component** — that seam is what an early-mount
restructure (Step 3b) would use. This changed the caller, not the contract.

---

## Step 2 — the measurement

**Harness: `verify/warmup-value.mjs`.** Marks `card-canvas-created` (Canvas `onCreated`) and
`card-canvas-compiled` (inside `markWarm`) on the **real** canvas only; the gap is the number.
Arm A = warm-up present, arm B = `?nowarmup=1`. Fresh `--user-data-dir` per run, headed,
`--enable-gpu`, renderer string printed and asserted non-SwiftShader.

**Renderer, every run:** `ANGLE (AMD, AMD Radeon(TM) Graphics (0x0000164C) Direct3D11 vs_5_0 ps_5_0, D3D11)`
— a real GPU, not a software rasteriser.

### Result — 3 runs per arm

| | mount→compiled | worst frame gap | worst long task |
|---|---:|---:|---:|
| **A** (warm-up present) | 1474 / 1452 / 1221ms — **median 1452** | ~355ms at **+7.8–8.0s** | ~350ms at **+8.1–8.4s** |
| **B** (warm-up absent) | 1089 / 1123 / 1123ms — **median 1123** | ~630ms at **+0.14–0.17s** | ~620ms at **+0.9s** |

**Difference: −329ms (−23%) in arm B's favour.**

> ⚠ **THE WARM-UP IS NOT MERELY USELESS — IT IS A NET COST TO THE REAL CANVAS.** It makes the
> canvas it exists to help **329ms slower**, and it is what puts a ~350ms task at **+8.1s**, inside
> the 7400→12400ms Begin reveal. Removing it moves the cost to +0.9s, before the reveal starts.

**This confirms the Architect's Step 2 prediction in the stronger direction.** The per-canvas-context
reasoning said the warm-up could only pass on ANGLE's binary cache; the measurement says even that
does not pay for the second context it builds.

### ⚠ THE FIRST RUN OF THIS HARNESS WAS WRONG, AND THE CONTROL IS WHY IT WAS CAUGHT

**First run reported `+19ms (+2%)` — "the warm-up buys essentially nothing"** — and it was
**meaningless**, because the arm-A control printed **"warm-up canvas in DOM: no"** on all three runs.
**Both arms had measured the same thing.**

**The cause was in the instrument, not the page.** It polled for the warm-up node the instant Begin
became clickable — but the mount needs `beginActive` (the reveal's `animationstart`, 7400ms) **plus**
`OPENING_WARM_LEAD_MS` **plus** an idle callback. **A control that samples before the thing it
controls for cannot pass.** Fixed to a 4s `waitForSelector`; arm A now reports "yes" and arm B "no"
on every run.

⚠ **AND THE FIRST DIAGNOSIS OF THAT FAILURE WAS ALSO WRONG.** The Builder's first reading was
"the warm-up never mounts at all". A direct probe disproved it — `warmupNodeNow: true`, the node
present and still there at 20s. **The verdict changed sign once the control passed**, from
"buys nothing" to "costs 329ms".

> **This is the session's recorded lesson landing on its own harness:** the check was "did the
> number move", not "was the knob connected". **The control existed, printed the warning, and the
> only thing that mattered was reading it instead of the verdict beneath it.**

---

## The cards still enter — checked, because this is the failure mode

Both arms, headed, screenshotted after the full six-beat entrance:

- proto canvas attached at **+119ms** (A) and **+129ms** (B)
- all five cards present and lit, Q5 phrase and lockup rendering, "Next step" present
- the two screenshots are visually identical

**The unhook did not reproduce the 4 August failure.**

---

## Gates

- `npx tsc --noEmit` — **clean**
- `npm run lint` — **`1 problem (1 error, 0 warnings)`**, the recorded baseline
  (`react-hooks/set-state-in-effect`, the reduced-motion effect)

⚠ **A second lint error was introduced and then removed.** The `?nowarmup=1` flag was first read in
a `useEffect` with `setState`, which added a second instance of exactly the baseline error. Rewritten
as a lazy `useState` initialiser with a `typeof window` guard. **The standing rule is that known
errors are not increased, and "it is the same error as the existing one" is not an exemption.**

---

## Files changed

- `components/enquiry/enquiry-opening.tsx` — `warm` prop dropped at the real canvas; `suppressWarmup`
  diagnostic flag added; the false "genuinely dead time" comment corrected in place with the
  Architect's timeline
- `components/enquiry/answer-card-canvas.tsx` — two `performance.mark` calls, diagnostic only
- `verify/warmup-value.mjs` — new harness

**Not committed.** Carl commits on request only.

---

## What this does NOT claim

⚠ **THE STALL IS NOT FIXED.** Step 1 makes the cards permanently safe from warm-up scheduling and
Step 2 says the warm-up can go — but **a compile still has to happen somewhere, and every window
between 600ms and 12400ms is inside an animation.** Arm B still shows a ~620ms task at +0.9s; it has
moved off the Begin reveal, not disappeared.

**Next, and Carl's to decide:**

- **Step 3a — delete the warm-up.** The numbers now support it outright. ⚠ Expect the first-run Q5
  "W+h" stutter to become more visible; that is the honest trade and Step 4 is what pays it off.
- **Step 4 — the ordering inversion**, which the Architect calls the actual fix: hold the opening's
  animated classes until the canvas reports `compiled`, so the choreography waits for the compile
  instead of the reverse. ⚠ **The trade is Carl's** — it exchanges "the opening stutters" for "the
  opening starts later on a cold load". **On these numbers the cold delay is ~1.1s** (mount→compiled,
  arm B), which is above the ~600ms the Architect called invisible and below the ~1.9s it flagged as
  a different conversation.
