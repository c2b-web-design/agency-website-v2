# Structural note — the §3 viewer on `/about` (take 4, "the mark becomes the player") — 21 October 2026 — VERSION 1

**For:** Carl, to route to the Architect.
**Status:** PROPOSED — nothing built on `/about`. The viewer exists on the bench only (`/proto/player?take=4`).
**CLAUDE.md §5a triggers:** a second WebGL context on `/about` §3 (an expensive resource the page has one of in that
place); a component whose lifetime must be chosen (mount, never unmount); a measurement two drawings must share (the mark's
place in the player — one source, not two); a new mechanism between two components (the room's latch → the viewer; the
viewer's play → §2's re-arm). §5b enumeration below.

## What is being put on the page

D-088, 21 October: the viewer is the Builder's design; Carl combined takes 2 and 3 into one (*"combine some elements to make
it one great idea"*). Take 4 on the bench:

1. **Arrival** — the platinum blue mark rests square-on in the screen, the logo's studio drifting across it.
2. **Recede** (1.8 s) — the light leaves the metal; its outline rises in its exact silhouette, the edge glowing, then settles.
3. **The lap** (16 s) — a light runs the outline as the playhead: one gradient white-hot → ice → light blue → platinum blue
   behind it; the four films as the scrubber's four segments; the caption names the film the light is on.
4. **It lands** (1.2 s drain) → **a beat** (0.45 s) → **re-form** (1.6 s): the whole blue outline becomes the blue metal —
   Carl: *"The act of the blue outline becoming whole is a precursor to the blue logo, caused by it."* → hold (2.2 s) → 2.

The machine under it works and stays the same: play/pause, scrub, chapters, captions, mute, fullscreen, keyboard; the four
boxes drive it (hover = preview, click = play); no auto-advance; a film not made yet says its real state. ⛔ Carl's standing
criterion: **it must be obvious to visitors that this is a player and what to do** — the transport is visible at rest.

**Measured on the bench** (`live-work/scripts/player-bench-capture-21-october.mjs`, Carl's window, this machine's GPU): the
lap at 60 fps costs **~0.9 ms of script / ~2.3 ms of task per frame** (2D canvas, 280 short strokes); the metal canvas draws
only while there is metal (`frameloop="demand"`); ✔ the outline sits ON the metal's edge at 2× (both drawn orthographic and
front-on, placed by ONE number). Take 3's main-thread geometry build: ~2 s before the mark shows.

## What §3 is today (measured 21 October)

- **The player is a white 16:9 placeholder** (`#examples-player`, `app/about/page.tsx`) holding the site's blue mark as a
  flat PNG (`#examples-player-target`, half the player's width) — *"That will be our target size"* (Carl, 8 October).
- **The desk mark's drop** (`about-card-canvas.tsx`, `DESK_MARK_DROP`) falls from the room onto the PNG's centre, grows to
  its INK height (`growTo`), and is **clipped at the player's TOP EDGE** (a clipping plane through the camera and
  `#examples-player`'s top) — *"a wipe will happen at the border as if to dissappear into the viewer"* (Carl, 8 October).
  ⚠ **So the 3D mark is never seen INSIDE the player.** What rests there is the PNG.
- **The journey LATCHES at the viewer** (`DESK_MARK_TIE`): once landed it stays for the page view; a jump into §3 drops it in
  from the top right and latches.
- ✔ **Once latched, the room's canvas makes NO WebGL calls while the reader rests in §3** — measured
  (`live-work/scripts/about-s3-canvas-cost-21-october.mjs`: 0 clears, 0 draws in 3 s, the canvas covering §3 at 1698 × 1904).
  §3 costs nothing at rest today.
- **Contexts on `/about` today: TWO** — the room (one canvas, two screens tall, running one screen into §3) and §4's gold
  `Start a conversation` button.
- **§2's return rules** (`neon-bloom.tsx`, `S2_RETURN`): a 3 s linger in §3 re-arms §2; Carl, 13 October: *"Pressing a
  video"* re-arms at once — **not built (there was no player).**

## Decision 1 — where the viewer's METAL is drawn

| | Contexts on `/about` | For | Against |
|---|---|---|---|
| **A. The viewer's own small canvas** — **proposed** | 3 | Exactly the bench: the metal and the outline both in the viewer, orthographic, one placement → the hand-over coincides (✔ measured). Draws only the mark, only while there is metal (~10 s of each ~25 s cycle) at the player's size. The room stays idle in §3, as it is today. If WebGL fails, the viewer falls back to its 2D outline (the lap still runs — the whole player works without WebGL). | ⛔ A second WebGL context in §3: context creation (Next step measured **67 ms** blocked, §5a case 2), a shader compile (the corners measured ~600 ms blocked until it was made non-blocking — the same method applies), a PMREM, the mark's geometry built a second time. |
| **B. The room's canvas draws it** (remove the wipe; the room keeps the mark in the player) | 2 | No new context; the very mark that fell is the one that stays — the most literal continuity. | ⛔ The room's frame owner renders the WHOLE room pipeline on every frame it is asked for (base render with the glass's transmission, the neon pass, the blur, the composite) — the metal's ~10 s per cycle would run all of it, at two screens' size, while a visitor chooses a film; today §3 costs nothing. ⛔ The room's camera is PERSPECTIVE (solved for the photograph): the mark's silhouette in the player is off-axis, so the 2D outline would NOT coincide exactly (unmeasured; likely a few px). ⛔ Couples §3's viewer to the room canvas's lifetime and to §2's states (`fresh` / `playing` / `static`). |
| **C. No metal on the page** — the 2D outline only (the PNG, or nothing, before it) | 2 | Cheapest; no structure question at all. | Loses what Carl named: *"the blue outline becoming whole is a precursor to the blue logo"* — there is no blue logo to become. |
| **D. A pre-rendered metal** (the bench's metal recorded as frames / a short loop) | 2 | No context; the studio's drift kept. | The resting screen was briefed *"It wont be a video"* (Carl, 1 September); a recorded loop cannot hand over to a live outline at any size or zoom (D-097) without a visible seam; it repeats exactly. |

**Proposed: A.** It is what was built and judged, its cost is bounded and measured on the bench, it keeps §3 free of the
room's pipeline, and it degrades to a working 2D player. ⚠ The cost to weigh is ONE more context on `/about` (three), not on
the corridor (`/start` is untouched).

## Decision 2 — ONE source for the mark's place in the player

The drop measures `#examples-player-target` (centre, ink height). The viewer draws its metal and its outline at
`MARK_IN_SCREEN` (bench: 0.46 of the screen's width, middle 0.44 down). **Two numbers for one place is the second source of
truth §5a names.** → **The viewer reads `#examples-player-target`'s box** (kept as an empty, `aria-hidden` element inside the
screen, the PNG removed) and derives its scale and middle from it; the drop keeps reading the same element. ⚠ The bench's 0.46
/ 0.44 become a consequence of that box, not a constant. A harness asserts the drop's end and the viewer's mark coincide.

## Decision 3 — when the cycle starts, and what is there before

- **Before the latch** the viewer shows its metal mark AT REST (no cycle) — the PNG's role today, as the mark the drop lands
  on (*"on its way to cover it"*). The transport is visible (the standing criterion).
- **The cycle starts at the latch** — the room tells the viewer once (a DOM `CustomEvent` on `window`, e.g.
  `c2b:mark-latched`, fired where `DESK_MARK_TIE` latches; ⚠ a new mechanism, one line each side). A jump into §3 latches
  too.
- **If the room never latches** (no WebGL in the room, `?marktie=0`, a fallback): the viewer starts on its own after it has
  been in view for `ARRIVE_MS` — so it is never stuck at rest.
- **Reduced motion:** the metal at rest, no cycle (D-063: the animation goes, the state stays); the transport works.

## Decision 4 — lifetime and frames

- **Mounted ONCE, on approach** (an IntersectionObserver a window ahead, as the corners, D-100), **NEVER unmounted** —
  mounting on visibility would make a new context on every pass (§5a, worked case 2).
- **Frames:** the 2D lap only while the viewer is on screen in a visible tab (`canvasOnScreen`); the metal canvas
  `frameloop="demand"`, asked for frames only while there is metal; **while a film plays both stop** (the resting screen is
  hidden — it must not draw under the film).
- **The compile:** non-blocking (`renderer.compile` + `isReady()` polling, and the studio's PMREM prefiltered the same way —
  the method built for the corners on 21 October, `corner-canvas.tsx`), so the context's setup does not freeze a scroll.
- **The geometry:** the desk mark builds in a Web Worker (`desk-mark.worker.ts`, 13 October). The viewer asks the same worker
  for its own build (a second build, off the main thread) — ⚠ the alternative, a module cache shared with the room, is state
  outliving its component and couples two canvases; not proposed.

## Decision 5 — pressing a video re-arms §2

Carl, 13 October: *"Pressing a video"* re-arms §2 at once. → the viewer fires `c2b:film-played` on `window`;
`neon-bloom.tsx`'s return-rule listener (where the 3 s linger lives) treats it as the linger completing. ⚠ `neon-bloom.tsx` is
approved work (R-052) — a one-listener change, named for Carl.

## Not structural, but open — Carl's

- **Where the films are HOSTED.** The stand-in is local only. Real films (1080p, minutes long, Carl's Resolve / Pro Tools
  masters) need a home: the repo's `public/` (simple; every visitor pulls them from Vercel; size and bandwidth), Vercel Blob,
  or a video service (adaptive streaming, a cost). ⚠ A web question — Carl: *"If you need anything else that may require you
  to go on the web then ask."* Not researched yet.
- **Captions as WebVTT files** per film (the bench holds its cues in code) — the platform's own track, so they also work in
  native fullscreen on phones.
- **Until a film exists**, its box and the viewer say its real state (01 *in the edit* etc.). On the page, NONE plays until
  Carl's edits exist — the stand-in is never deployed.

## §5b — what the current §3 provides, and how each is preserved

| Provided today | By | Preserved how |
|---|---|---|
| The drop's TARGET (centre + ink height) | `#examples-player-target` (the PNG's box) | Kept as an empty element at the same box; the viewer reads it too (Decision 2) |
| The WIPE's line | `#examples-player`'s top edge | The viewer's screen keeps the id and the same box |
| The latch (the mark stays) | `DESK_MARK_TIE` | Unchanged; it also fires the viewer's start (Decision 3) |
| Something in the player before a choice | the PNG | The viewer's metal at rest |
| §3 idle at rest (0 WebGL calls) | the room's demand frames once latched | Unchanged (A); the viewer's own frames only while on screen |
| §2's 3 s linger reads §3's share | `windowShare("examples")` | The section's id and size unchanged |
| Hit-testing over §3 | the room's canvas is `pointer-events: none` | Unchanged; ⚠ the viewer and boxes become CONTROLS — a harness asserts `elementFromPoint` hits each (the 14 August lesson: five cards unclickable under a canvas) |
| The player is `aria-hidden` | the placeholder | ⚠ CHANGES: the viewer becomes a real region with labelled controls; the boxes become buttons |
| The 2 × 2 boxes (R-086, *"looks good"*) | `EXAMPLE_FILMS`, a `<ul>` | Kept; each `<li>` gains a button (the bench's) |
| No heading in §3 | deleted, 21 October | Unchanged (mastering, D-094) |

## Couples to

`app/about/page.tsx` (§3's markup), `about-card-canvas.tsx` (the latch event; the drop's target unchanged),
`neon-bloom.tsx` (the play listener — approved), `desk-mark.worker.ts` (a second request), the bench files
(`player-bench.tsx`, `player-ident.tsx` — the viewer moves into components the page imports).

## ⚠ Not watched

Phones; Carl's GPU; Safari / Firefox; the films' real sizes and the hosting cost; the room's perspective offset in option B
(not measured — B is not proposed).

## Asked of Carl

1. **A** (the viewer's own canvas, a third context on `/about`) — or B / C / D.
2. **Decision 5**: a one-listener change to `neon-bloom.tsx` (approved work) for *"Pressing a video"* re-arming §2.
3. **The films' hosting** — may I research the options on the web?
