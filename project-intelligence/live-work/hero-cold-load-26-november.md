# The hero's cold load: what the black viewport is made of (26 November 2026)

Carl: *"Take a look at the opening and loading and see if you can optimise it. Im trying to avoid a black viewport at the
start."* MEASURED, nothing changed. Script: `live-work/scripts/hero-cold-load-26-november.mjs` (a PRODUCTION build of
`f9b31ed`, `/proto/hero`, Chrome + WebGPU at Carl's window, a fresh profile, then a reload). The headline's brightness read
from a stamped screencast (its region only, the bench's panels left out). ⚠ The bench, not the site: on the site the home
page's own HTML paints first. ⚠ One run each, on Carl's PC and broadband, from a local server: a visitor's network is slower.

| | cold (first visit) | return visit |
|---|---|---|
| page black, no script yet | 0 – ~0.5 s | 0 – ~0.15 s |
| the scene's first frame (the headline there, UNLIT) | ~1.5 s | ~1.3 s |
| the headline first readable (its brightest pixel ≥ 40 of 255) | **~2.7 s** | **~1.7 s** |
| fully lit | ~5.0 s | ~4.2 s |

**Where the time goes, before the first frame:**
- The bench waits for `hero.ready` before drawing anything: the 3D text (`hero:Text` 845 ms cold) AND the
  marching example's CASTLE CUBE MAP, 12 images from **threejs.org** (ending 666 – 886 ms cold). The castle is a bench
  option only: the hero draws with OUR courtyard (the bench's default environment). The scene's header already says the
  site cannot depend on threejs.org.
- After `ready`, ~0.5 s more: the first draw's programs built (three r185 builds a pipeline at its first draw), the
  renderer's start.

**After the first frame, the opening itself is dark by design:** the lights start at 0.3 s and rise over 3.0 s on an
eased-in curve (Carl, 16 November: *"it can happen a bit slower … That will buy us a little more time"*), so the headline
stays near black for ~1.2 s after it is first drawn.

**Seen:** on the cold load the lights' rise is drawn at uneven intervals (screencast frames up to ~150 ms apart, the bench's
meter reading 3 fps) while the warm-up compiles (`hero:WarmDone` at 10.1 s cold, 3.2 s on return). Not measured as stalls:
the screencast sends a frame only on a paint.

Options and the ruling: Carl's (the handoff and D-101).

## Option A built and measured (26 November 2026; Carl: *"try A first. The goal is to avoid a black screen."*)

`hero-scene.ts`: the castle cube map and the uv grid are no longer fetched at load (`loadCastle`, `loadUvGrid`: only when the
bench picks them, applied once their images are in). The same script, the same production setup, two runs:

| | before | A, run 1 | A, run 2 |
|---|---|---|---|
| cold: the headline readable | 2.73 s | 2.74 s | 2.68 s |
| cold: fully lit | 4.06 s | 4.04 s | 4.04 s |
| return: the headline readable | 1.68 s | 1.67 s | 1.67 s |

**On Carl's PC and broadband, A changes nothing a visitor sees**: the threejs.org images arrived (~0.9 s) before the text
and the first draw's programs were ready, so they were never the last thing waited for. What A removes: the dependency
on threejs.org, and the wait on a slower connection (where those 12 requests can be the last to land). The black is set by
(1) the time to the first frame — the script, the 3D text (~0.75 s), the renderer and the first draw's programs (~0.6 s
after) — and (2) the opening's own darkness after it (~1.2 s to readable). Neither is touched by A.

## Options B and C built and measured (26 November 2026; Carl: *"try both B + C and we will see what gives the best result."*)

By the URL on the bench (`hero-bench.tsx`, `POSTER_SRC`'s header): none = A; `?open=b`; `?open=c`; `?open=bc`.
- **B** (`OPENING_LIGHTS_B`): the lights from the opening's first moment over 1.5 s (A: from 0.3 s over 3.0 s).
- **C**: the opening still (`public/hero-bench/opening-poster.webp`, 31 KB, rendered from the scene at HOME, 3:1, by
  `scripts/hero-opening-poster-26-november.mjs`; authorised by Carl: *"yes, authorised"*) in the FIRST PAINT, fading up on
  the lights' curve; the scene's clock handed the still's time at its first frame (`startOpeningAt`), the still dissolving
  over 300 ms. ⚠ Take 1 had the inline script add the still to `<body>`: hydration removed it before the hand-over (probe:
  `scripts/hero-opening-handover-probe-26-november.mjs`, the clock handed 0). Take 2: React renders it hidden
  (`suppressHydrationWarning`), the script only styles it; the probe then read the still at full opacity when the scene
  began, the clock handed 1.5 s, the light 1.

Production, the same script, one run each (the machine busier than the first runs: compare within this table):

| the headline | A | B | C | B+C |
|---|---|---|---|---|
| cold: readable | 3.08 s | 3.04 s | 1.76 s | **1.02 s** |
| cold: fully lit | 4.40 s | 3.68 s | 4.17 s | **1.61 s** |
| return: readable | 2.35 s | 1.74 s | 1.30 s | **0.67 s** |
| return: fully lit | 3.83 s | 2.41 s | 3.63 s | **1.39 s** |

B+C's hand-over, frame by frame (the headline cropped, cold): no jump in place or light. ⚠ What is left black: the page
before its first paint (~0.6 s cold, ~0.2 s return), then the still's own first fade. ⚠ After the hand-over the cold load
still FREEZES the screen (no frames 2.2 – 3.4 s: the warm-up's compiles, option D) — on a lit headline now, not on black.
