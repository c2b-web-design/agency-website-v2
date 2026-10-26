# Session Handoff — 26 October 2026 (session 2). FILM 4 APPROVED WHOLE; THE CAMERA BENCH CHUNK 1 MID-BUILD.

⛔ **READ THIS FIRST, THEN `project-intelligence/` AS NORMAL.** Written MID-CHUNK, early, because Carl flagged the usage limit
(90%) — a session limit lost an hour's record on 12 October. **Delete it at the end of the session that reads it, once its
replacement is written.** Replaces 26 October's (session 1) handoff.

---

## ⛔⛔ IN PROGRESS — THE CAMERA BENCH, CHUNK 1 (`/proto/camera`; D-104; structural note v3)

**Carl:** *"If you have all you need you can proceed."* Files named by Carl (*"Authorisation given to use. Lock and test
after use."*): `components/showcase/your-words-canvas.tsx`, `app/proto/camera/page.tsx`, `components/showcase/lettering-piece.tsx`,
`components/showcase/camera-bench.tsx`, `components/showcase/camera-pad.ts`, `components/showcase/shot-format.ts`; and
`project-intelligence/ai-system/architect-role.md` (*"added to the list to use"*). All in `live-work/chunk-scope.json`.
⛔ **LOCK AND TEST AFTER USE:** remove those seven from `files`, probe each with a valid edit (expect denial).

**DONE (uncommitted):**
- ✔ **THE LIFT** — `Scene` moved VERBATIM (by script) from `your-words-canvas.tsx` into `lettering-piece.tsx` (`LetteringPiece`,
  `usePieceBuild`, `measurePiece` — the interface; `Guard`, `NeutralToneMapping`, `SPECS`, `crownUnderside` exported). The
  page keeps `PageCamera`, `Journey` (now applies a frozen `?t=` pose from the first frame; the live clock starts on
  `onReady`), `ArchJourney`, the words' assertion. ⛔ **PROVED PIXEL-IDENTICAL:** 8 frames (viewport 1; viewport 2 `?cam=0`,
  `?t=` 1, 9, 15.75, 20, 23.5, 28) — 0 of 2,058,480 px differ on every frame; the instrument noise-free (two captures of
  unchanged code identical) and SEEN RED (a swapped frame: 100,014 px). Script `live-work/scripts/film04-lift-compare-26-october.mjs`;
  frames in the session scratchpad (`lift/before-1`, `after`).
- ✔ `shot-format.ts` (v1 format: tracks of value-vs-time, auto tangents through keys, HOLD, both ends at rest; reserved
  tracks; `shotRefusal` fails loudly), `camera-pad.ts` (Gamepad API read, dead zone 0.15, power-2 curve, weighted rig τ 0.22 s,
  speeds in d/s, `focalMm` on a FIXED 36 mm-wide sensor — a default, Carl's Unreal filmback NOT named),
  `camera-bench.tsx` (`BenchStore` — one mutable store, `frame()` the one frame callback; `frameloop="always"`; capture /
  remove / play / to-start / step / scrub / key time + hold editing; keyboard + mouse fallback; autosave in localStorage;
  `dynamic(…, { ssr: false })`), `app/proto/camera/page.tsx` (noindex). `tsc` clean, eslint clean on `components/showcase`.

**⛔ THE OPEN FAULT (being debugged when this was written):** `/proto/camera` shows *"The bench cannot draw: the WebGL
context was lost."* Trace: `shown` goes true → **FALSE** (1.79 s) → true → `THREE.WebGLRenderer: Context Lost` → the bench's
`webglcontextlost` handler sets `failed` for good. One `getContext` call only. ⚠ Likely cause (UNVERIFIED): `usePieceBuild`'s
`shown` flips to null mid-build (a hook re-running — the font/measure in a strict-mode double mount?), unmounting
`BenchScene`; the context loss probably from R3F disposing on an unmount/remount. `/proto/your-words` does NOT show it (its
canvas mounts later, on approach). **Next:** find why `shown` flips (log `measured`, `placed`, `report` per render), make the
bench tolerate it (don't treat a remount's context loss as failure, or keep the scene mounted), then run
`live-work/scripts/camera-bench-verify-26-october.mjs` (a STUBBED pad drives every control, the keyboard, the autosave).
⛔ **A `// TEMP-DEBUG` effect is in `camera-bench.tsx` (after `const why = …`) — REMOVE IT.**

**Chunk 0 defaults stated to Carl (not objected to):** positions in units of d; film 4's journey stays code, shots are data;
the lens on the D-pad up/down; persistence A-or-B deferred to chunk 3 (the Builder recommends B — download + the Builder's
import, no new write path). Filmback preset: Carl not yet named — 36 mm full-frame default, labelled.

## WHAT HAPPENED THIS SESSION (all recorded in the canonical files)

| | what | record |
|---|---|---|
| Governance | `current-sprint.md` pruned (7,407 → 1,626; verbatim to `archive/sprint-3-detail.md`); CLAUDE.md pruned (2,851 → 1,993; verbatim to `ai-system/claude-md-worked-cases.md`) | `76495ee` |
| Hooks | both hooks `onFailure: "block"` (fail closed), tested with a probe | D-103, `27fa818` |
| Mods | Builder seat only; the Architect always read-only | D-102 |
| ⛔ Writing | **ONLY THE BUILDER EVER WRITES FILES**; the Architect never offers a route (it offered a subagent — Carl *"with alarm"*) | D-102 amended; `architect-role.md` (uncommitted) |
| Film 4 | viewport 2's camera journey (orbit, tilt under the N, pull-out) **R-093**; the page APPROVED WHOLE **R-094**; the link NOT sent (*"We will just use the film in About"*); final take filmed | `d43ae96`, `06b718f` |
| Camera method | Carl describes → performs on the Xbox pad → we refine | D-104; note v3 (the Architect's text verbatim + the Builder's response on persistence) |

## OPEN — with owners

- **The bench's context-loss fault** (above) — Builder, next.
- **The film 4 EDIT** — Carl: *"we will come back to talk about editing after we have done with the architect."* Footage:
  ~4:22 unique + the approved page's final take (39.5 s), `Videos\C2B Films\04 Extruded lettering\`.
- Carl's: the Unreal filmback preset; persistence A or B (chunk 3).
- Carried: the hero (D-101) after the bench; Send after the hero; `structural-note-viewer-on-about-21-october.md` to amend
  (Builder); `neon-bloom.tsx` re-arm; phones in mastering (D-094); `about-card-glass.ts:491` anisotropy comment untrue (flag).

## STANDING / LESSONS

- **Settings reload ~one tool call late**; a call sent in parallel with a settings edit runs on the old settings.
- **`next dev` listens on the network** (`0.0.0.0`; `Network: http://192.168.0.60:3000`) — any dev route is LAN-reachable.
- **The React compiler lint** (`react-hooks/refs`, `immutability`): mutating props or hook values, or reading refs in render,
  is flagged — share frame-loop state through a class with methods (`BenchStore`), use `st.camera` in `useFrame`.
- Carl's camera principle: *"sparingly and appropriately"*; orbit-vs-rotation ambiguity is a dial (memory).
- Lint baseline **1 error, 0 warnings** (re-check after the bench). Dev server RUNNING (background task) — stop by PID and
  confirm port 3000 free before any checkpoint.
- ⚠ **NOT COMMITTED:** the lift + bench files, `decisions.md` (D-102 amendments), `architect-role.md`, the structural note
  (live-work, gitignored), the scripts (force-add), this handoff.

---

*Written 26 October 2026, session 2, mid-chunk. Replaces session 1's.*
