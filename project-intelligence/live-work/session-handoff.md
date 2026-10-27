# Session Handoff — 27 October 2026, session 2 (written before compaction). SHAPE CLIPS + THE GLIDE + OPEN BUILT; NOTHING COMMITTED.

⛔ **READ THIS FIRST, THEN `project-intelligence/` AS NORMAL.** Replaces the 27 October session-1 handoff. Delete it at the
end of the session that reads it, once its replacement is written. Detail: **D-104's tail** (from "THE SEQUENCE — DESCRIBED BY
CARL") — read it, it is the session's record.


## ⛔ NEXT SESSION — Carl's words

*"Ive got more ideas how we can improve this tool, we will discuss next session. One of them is the ability to put the camera
in third person mode. If i could view its movement from afar, much like the light helpers that would be a great benefit."*
→ START BY DISCUSSING his ideas; the THIRD-PERSON VIEW first (a second viewpoint in the one canvas = §5a, as T2's PiP).
Locks: no protected file opened; tested (a probe of `about-card-glass.ts` REFUSED). The five bench files LOCKED and tested (5 of 5 probes refused).

## ⛔ THE PROCESS THAT WORKS (found late, Carl: "i describe, you show me in clay we iterate")

Carl describes a move → the Builder calculates → edits `components/showcase/bench-builder-take.ts` (bump `version`) → the bench
puts the take on his timeline BY ITSELF (a new version replaces the last) → Carl iterates. ⛔ NEVER console, file picker or a
list (all rejected). **✔ THE VADER MOVE APPROVED at take 4** (R-096; Carl: *"thats fixed it. 4 takes and weve got it to where it wanrs to
be"*): a BARREL shape (roll added to the bench); takes 2–4 were his notes. ✔ COMMITTED AND PUSHED `3bf5c6f` (clean-checkout build passed). The harnesses carry no barrel
checks yet; motion blur raised, not chosen. Next: Carl's.

## ⛔ WHERE THINGS STAND (earlier in the session)

- **Carl is about to fly the Builder's move, take 1.** Steps given: bench → press a pad button → fly to his start (beyond
  YOUR's left end, a little higher than old clip 2's end) → ⛔ **NO WAY IN FOR A COMPUTED TAKE RIGHT NOW**: Carl rejected the console, Open's file picker
  AND the Moves drop-down (*"remove the moves, i said we will come back to it"*). **Ask Carl how take 2 reaches his bench.**
  **Take 1 flown:** *"Smooth"*; note: no logo at the start → **take 2** written (`live-work/moves/your-company-take-2.move.json`:
  startLook = YOUR, aim settle 2 s; YOUR in frame at 1.48 s, was 3.85 s) — NOT YET FLOWN. Then HE ITERATES (Carl: *"Even if your move is brilliant, i will iterate upon
  it just to go through the process, the workflow. Like we build the meshes"*): by the inspector's numbers, or notes → the
  Builder writes **take 2 as a new move file** (memory: a note on a take = decide, test, hand over the next take).
- **The sequence (D-104):** started over IN REVERSE — start = old clip 2's end (Carl places it), finish = old clip 1's end
  (the C's base, 10 cm up, 2 m out, face on). The corkscrew is OUT of it (raised and not chosen). The move is the Builder's
  (*"Get creative, you decide"*): "Your company" — out and square on to YOUR, down past P / M, landing on the C; 16.6 s.
- ⚠ At the landing the C rises out of the top of the frame (old clip 1's end is 10 cm up, level) — an obvious iteration.

## BUILT THIS SESSION — committed and pushed in `3bf5c6f` (`git status`: the four bench files, decisions.md, current-sprint.md, the harnesses)

1. **Shape clips, chain v3** (note `structural-note-shape-clips-27-october.md` v3.2, three reviews; plan
   `plan-shape-clips-27-october.md` v2.1, two reviews): a clip carries samples OR a shape; the chain carries its units
   (filled on the first measured frame; saved only with clips or on an action); keys v3 → v2 → v1, only v3 written; Home on
   the live `d`; the dev hook `window.__benchPlace` (NODE_ENV-gated); the inspector shows / edits a shape's numbers + a clash
   warning (Carl: *"In, warning only"*). Parity A (the retired snippet run unchanged): 0.0013 mm.
2. **The Corkscrew panel — built, then REMOVED** (Carl: *"If there are to be some "signature moves" that panel will grow very
   quickly"*). ⛔ **"Signature moves" NOT SHELVED** — *"We will return to it in a future session. Probably put it in a drop
   down list we can call upon."* (The move files are the natural entries.)
3. **The GLIDE** (Open, then a Moves drop-down + dev route, built and REMOVED on Carl's word; `moveFromFile` kept) (note `structural-note-glide-and-open-27-october.md`; Carl: *"Approved, build it"*): a centripetal
   Catmull–Rom path + look-at points at the same knots, Gauss–Legendre length, eased start and landing; Open reads a
   `.move.json` (world cm, `start: "camera"` — Carl: *"no cheating"*).
4. **The camera remembered** across refreshes / code reloads (Carl: *"It shouldnt move"* → *"Yes, build it"*).
- **Checks at hand-over:** `bench-chain-check` **84/84**; `camera-bench-verify` **91/91**; `tsc` clean; `npm run lint`
  1 error, 0 warnings (the baseline).

## ⛔ OPEN — with owners

- **Carl:** fly take 1, iterate. Then: commit? (not asked yet — **do not commit without his word**; clean-checkout build first).
- **Scope:** the bench files LOCKED and tested at hand-over (Carl: "yes, close them"); `chunk-scope.json` stays LOCAL.
  Then lock and test."*) — close + probe when he says.
- **Raised for later (Carl's):** the third-person camera view (*"Like the light helpers in WebGL"*); a speed spline editor;
  signature moves (a drop-down); T1b; R2; the PiP. The inspector runs below the fold at full length (for his eye).
- **The pad:** reconnects over Bluetooth; a two-blink light = searching for its last pairing (D-104).
- **Carried** (from the previous handoff): the turn / lens rates; the filmback preset; the hero (D-101); the films' edit;
  Send; mastering; `structural-note-viewer-on-about-21-october.md` to amend; `neon-bloom.tsx` re-arm;
  `about-card-glass.ts:491` anisotropy comment untrue (flag).

## STANDING / LESSONS (this session — memories saved)

- ⛔ **Build only what Carl asks; a deferred idea stays deferred** (the Moves list, removed).

- **A note on a take = the next take:** decide, test, hand over; never question which version he ran.
- **Don't explain his own controls** (he built the pad map).
- **Carl's division of labour:** the Architect reviews STRUCTURE; directorial choices are Carl's and the Builder's.
- A harness caught what three reviews missed (the near-constant-radius branch) — measure, don't trust prose.
- The dev server (PID 6696) is running; stop it by PID before any checkpoint.

---

*Written 27 October 2026, session 2, before compaction. Replaces the 27 October session-1 handoff.*
