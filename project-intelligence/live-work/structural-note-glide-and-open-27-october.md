# Structural note — OPEN A MOVE, and a second shape kind (the GLIDE)

**27 October 2026, session 2. Builder. PROPOSED — for Carl (structure only; the move itself is the Builder's, delegated:
Carl, *"Get creative, you decide."*). Nothing built.** Record: D-104 tail, *"THE NEW SEQUENCE — IN REVERSE"*.

## Why

Carl: *"The point is we dont go through the F12 nonsense. Even if your move is brilliant, i will iterate upon it just to go
through the process, the workflow."* The new sequence starts at the old clip 2's end (high, beyond YOUR's left end) and
finishes at the old clip 1's end (the C's base, face on). A corkscrew cannot make that move, and today a computed move only
reaches Carl's bench through the console (the snippet) or the dev hook (also the console).

## 1. OPEN — the way in without the console

- **An "Open a move" button on the bench** (`camera-bench.tsx`, beside the drawers) → the browser's file picker → a
  `.move.json` the Builder wrote in `live-work/moves/` → validated by `shapeRefusal` (outside data) → placed through the
  STORE's own `placeShape` (the hook's path): the newest take on the armed track at the playhead, committed once.
- **Already approved in principle:** note `structural-note-camera-recorder-26-october.md` v2.2 — R2's refined clips arrive
  *"by a READ path ('Open', a file picker) and never by a write into the repository"*. This is that read path, for one move.
- **The file:** `{ "kind": "c2b-camera-move", "version": 1, "name": "…", "shape": { … } }`. ⛔ **It holds WORLD
  CENTIMETRES, and the bench converts through the chain's units on Open** (one conversion, at the boundary): the Builder
  writing the file cannot know the units of Carl's chain.
- **Iterating:** take 2 is a new file; Open places it as a newer take over take 1 (non-destructive, T1a's rules); Carl
  deletes the old take or keeps it to compare (solo each).
- Rejected: a URL parameter carrying the move (a second, hidden way in; long links); a dev endpoint polled by the bench
  (a write path from outside into the running page); the Browser seat calling the hook (Carl's "F12 nonsense" by another
  name).

## 2. The GLIDE — a second `Shape` kind

- `kind: "glide"`: the camera's PATH a centripetal Catmull–Rom spline through waypoints; its AIM a second spline of
  LOOK-AT points travelled at the same rate (so it can look along YOUR, then at YOUR, then down the column, then at the C);
  the pace even along the path with an eased start AND an eased landing (`rampS`, `landS`).
- **No table:** arc length per segment by Gauss–Legendre quadrature, inverted by Newton — the helix's discipline (the
  reviews' option C).
- **Inside the approved structure:** a clip still carries ONE source; `clipPoseAt` dispatches by `shape.kind`; `sourceAt`
  untouched; v3's validation gains the glide's checks. The note v3.2's `kind` "leaves room" for this.
- The inspector shows a glide's numbers (its pace, eases, aim settle; its waypoints in metres, editable).

## What it couples to

The chain's units (Open converts once); `shapeRefusal` / `parseChain` (a new kind to validate); the inspector; the
harnesses (a glide parity against an independent numeric integration; Open driven by Playwright's file chooser).
"Signature moves" later (Carl: *"a drop down list we can call upon"*) would list these same move files.

## Files

`bench-chain.ts`, `camera-bench.tsx`, `bench-timeline.tsx` — all open in `chunk-scope.json` now. Move files in
`live-work/moves/` (gitignored scratch, like the snippet).
