# The liquid's compile stall, split — the BEFORE figures (10 November 2026, session 2)

Step 1 of `live-work/plan-liquid-async-compile-10-november.md` v1.2 (APPROVED by Carl: *"Approbed. Proceed"*). No code
changed. Script: `live-work/scripts/liquid-stall-split-10-november.mjs` — a cold load of `/proto/camera?blank=1` under a
Chrome performance trace, 25 s, the stall = the longest gap between the page's animation frames after the bench reads
drawn; split on the page's main thread into SCRIPT (JavaScript events), BUSY (top-level tasks) and WAIT (the rest).

| Run | Stall | Starts | SCRIPT | BUSY | WAIT | Bake | Regions | Console errors |
|---|---|---|---|---|---|---|---|---|
| 1 | 2,967 ms | drawn + 20 ms | 11 ms | 12 ms | 2,955 ms | 208 ms | 283 ms | 0 |
| 2 | 3,248 ms | drawn + 26 ms | 8 ms | 9 ms | 3,239 ms | 204 ms | 334 ms | 0 |

**Reading:** the page's main thread is WAITING for ~99.6 % of the stall — the GPU side (the pipeline's compile), which
the async route can remove. Script inside the stall 8–11 ms: ⛔ the stop line (~100 ms) is CLEAR. Proceed to step 2.
**The BEFORE console count for check 2: 0 errors.**

⚠ NOT WATCHED: Carl's Chrome; the GPU process's own events (not separated further); the WebGL 2 fallback.
