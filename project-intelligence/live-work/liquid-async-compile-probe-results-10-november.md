# The liquid's async compile — probe results, run 1 (10 November 2026, session 2) — ⛔ STOPPED

Step 4 of `live-work/plan-liquid-async-compile-10-november.md` v1.2 (APPROVED). Script:
`live-work/scripts/liquid-async-compile-probe-10-november.mjs`. **6 of 12 PASS. The plan's stop rule applies: stopped,
reported, no workaround.** The code (steps 2–3) is in place, uncommitted.

## Real findings (the product)

1. **The 3 s freeze is GONE on WebGPU** — no stall at the expulsion; the page draws through the compile.
2. **⛔ BUT THE ASYNC COMPILE IS SLOWER, and the 1 s cap is too close on THIS machine.** On normal loads the gate HELD
   **799 ms** and **417 ms** (check 3, runs 1–2); on check 6's load (the forced delay did NOT apply — finding 6 below)
   the real hold passed **1 s** and the liquid went OFF by the timeout. Ready came 11.5–12.5 s after the first frame.
   The compile starts only after the bake and the regions (~0.5 s into the lean) and now runs in the background,
   slower than the 3 s it took in the foreground. On slower devices the liquid would usually be lost.
3. **⛔ THE WARM-UP FRAME still costs 100–117 ms** on WebGPU (check 1: 100 ms, 117 ms at te −4.51) — over the 100 ms
   bar. Not the GPU: the frame that first draws the field builds its shader on the page's thread (three's node build).
   Step 1's split measured the long stall AFTER this frame, so it did not see it. The note's seam for it:
   `NodeManager.getForRenderDeferred` — a further decision.
4. **⛔ THE WebGL 2 FALLBACK NEVER READS READY** (`state` never `ready`, both runs): the liquid goes OFF after 1 s on every
   fallback load — a REGRESSION (before, the fallback stalled but showed the liquid). The readiness test (three's
   `isReady`: the backend's `pipeline` field) does not hold for the WebGL backend's async path. Not yet read in source.
5. Clean console on every load (0 errors), WebGPU and fallback. The forced TIMEOUT (check 7) behaved exactly as
   designed: off at 1,002 ms by the timeout, the solid kept, three loops seen, the next loop stayed off.

## Probe faults (the instrument, not the product)

6. **Checks 4 and 6: the force never applied.** The page script called `force` as soon as `__liquidCompile` existed,
   before the liquid had REGISTERED (the handle null: `force` was a no-op) and marked itself done. Check 4's "field
   shown, not off" and check 6's timeout are therefore the UNFORCED behaviour. Fix: force only once `state()` is not
   `none`.
7. **Check 5: `state` read `failed` after the `side` change** — the render object WAS replaced (seen 43 → 44: the
   dispose hook works), but why `failed` is not known (no console error). Not investigated: the stop rule.

## For Carl (and the Architect)

- Findings 2 and 4 change the design's ground: the async compile is slower than the cap allows here, and the fallback's
  readiness signal is wrong. ⚠ The bench as it stands: on WebGPU the liquid may be lost on a load; on the fallback it is
  always off.
- Whether to keep the code in place while the next step is decided, or revert steps 2–3 (the bench back to the warm-up
  stall in the lean).
