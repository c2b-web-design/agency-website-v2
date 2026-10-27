# Session Handoff — 27 October 2026 (written at 44% before compaction). CAMERA TRACKS T1a BUILT; THE CLIENT FILM APPROVED.

⛔ **READ THIS FIRST, THEN `project-intelligence/` AS NORMAL.** Carl is starting a new conversation.
**Delete it at the end of the session that reads it, once its replacement is written.** Replaces the 26 October
session-2 handoff (R1 built, not flown).

---

## ⛔ NEXT SESSION — Carl's words

*"We will make a sequence. We will start by discussing the sequence. Then will will execute it in chunks. One part of it
is complex and will require maths. i will place the camera at the start position for that chunk and you will carry it
out. So in essence we will direct and edit the sequence together."* (D-104, tail.)

- **Start by DISCUSSING the sequence** — record what he describes as he gives it (D-104; a brainstorm is a source of
  record: mark what is chosen and what is raised and not chosen). Don't build before the chunks are agreed.
- **Chunks:** Carl performs on the pad on T1a's tracks; **the MATHS chunk is the Builder's**: Carl places the camera at
  its start pose, the Builder computes the move (D-104's "procedural moves" — the helix etc.).
- ⛔ **CARL DECIDED: STORED AS A SHAPE AND ITS NUMBERS** (*"It always helps if we can adjust the numbers later. Not just
  for movement but for timing and speed coz theoretically, we can do speed ramps with this thing."* — D-104 tail). So TIMING
  and SPEED become adjustable numbers too: **SPEED RAMPS** (a retime over a clip). ⚠ STRUCTURAL (§5a) before it is built:
  how a shape clip and a retime live beside recorded samples on the tracks (one `sourceAt`, one pose path), and how Carl's
  placed start pose is captured. A note for the Architect via Carl, then a plan.
- ⚠ **Carl has NOT flown T1a yet.** The sequence will be the first real use; expect polish.

## ⛔ WHERE THINGS STAND

**T1a, CAMERA TRACKS — BUILT, NOT FLOWN; COMMITTED AND PUSHED (Carl: "Commit and push"), after a clean-checkout build.** `/proto/camera`: a track per camera (top plays — Resolve's A / B
roll), clips placed in time, A always records on the ARMED track at the parked playhead, a recording over a clip is a
NEW TAKE on top (nothing destroyed; Overwrite RETIRED), Add a camera track (transport camera icon), arm on the row header,
**Start / C cycles the arm**, a selection plays SOLO, deleting leaves a GAP that holds the last picture, the inspector lists
every take under the playhead (click to select a covered one). R1's saved chain is MIGRATED and PROVEN on load (a green
"identical" line; amber "differences" persists if ever not), v1 key never touched (Carl: *"Only when I say so"*).
Checks: `live-work/scripts/bench-chain-check-26-october.mjs` **40/40** (R1's own code from git `fb86684` as the reference:
parity largest difference 0); `live-work/scripts/camera-bench-verify-26-october.mjs` **70/70** (dev server running). `tsc`
clean; lint 1 error 0 warnings. One image seen. Records: D-104 (long — read its tail from "CAMERA TRACKS"); the note
`live-work/structural-note-camera-recorder-26-october.md` **v3.1** (Carl's answers 1–10 verbatim); the plan
`live-work/plan-camera-tracks-t1a-27-october.md` v2; the Architect's three reviews TRANSCRIBED in
`live-work/architect-plan-response-camera-tracks-27-october.md`.

**Pushed today:** `fb86684` — the client film tool (D-105, R-095) and the pad re-map (D-104). Level with origin then.

## WHAT CARL DECIDED THIS SESSION (detail in D-104 / D-105)

- **The pad (D-104):** no passing through the floor (lens stop 10 cm); triggers and D-pad at the sticks' pace, **D-pad 2×**
  (2.8 m/s); ONE JOB PER STICK — right stick slides only (read by hemisphere); **hold B + right stick = the look** (dominant
  axis); **LB / RB zoom**; Start cycles the armed track (T1a). Carl: *"Thats a helluva lot better."*
- **The client film (D-105, R-095, APPROVED):** `node scripts/client-film/film.mjs <film module> [--release]` → a captioned
  MP4 (title card, captions, drawn cursor), drafts by default, saved to `Videos\C2B Client Films\…` (never the repo).
  Played on Carl's Samsung: *"the quality is very good"*. Filming the BENCH for a client: approved in principle — needs R2's
  download and a picture-only view.
- **Camera tracks (note v3.1):** trim in T1 (T1b), move along a track only, Start cycles arm, gaps hold, Overwrite dropped,
  a run-on covers as a new take, selection plays solo (⚠ NOT "Resolve's solo-on-select" — the Architect corrected itself:
  the parallel is Resolve's SOURCE VIEWER), T1 split T1a / T1b, the v1 copy kept until Carl says.

## ⛔ OPEN — with owners

- **Carl:** fly T1a; the sequence (above). His R1 chain's size: now shown by the green carry-over line on first load (C7).
- **T1a is committed and pushed** (the commit after `fb86684`; check `git log`). `chunk-scope.json` stays LOCAL (never committed).
- **T1b (the editing):** take lanes (one per pass), move with snapping, TRIM (the data already carries `in` / `out`),
  per-track numbers. Needs a plan + gate.
- **T2 (the PiP): DEFERRED** — Carl: *"It can wait. lets get in there and fly first."* The Architect's C1 — it takes over R3F's render; list every per-frame camera-derived value (the 10 cm
  lines' thickness) before its plan.
- **R2:** the download (also unlocks the bench client film), import + fitting, the Refined lane, comping.
- **Carried:** the turn and lens RATES (item 3 remainder); the filmback preset; the hero (D-101); the films' edit; Send;
  mastering; `structural-note-viewer-on-about-21-october.md` to amend; `neon-bloom.tsx` re-arm; `about-card-glass.ts:491`
  anisotropy comment untrue (flag).
- **Scope: LOCKED AND TESTED at hand-over** (Carl: *"yes, lock and test then commit and push"*): the six camera bench files and
  the five `scripts/client-film/` files removed from `files`, ten probes all REFUSED (D-104). ⛔ **The sequence will need
  the bench files named again.** ⚠ 24 code files from earlier chunks are still in `files` — Carl's to close.

## STANDING / LESSONS (this session)

- **The Grep tool skips gitignored `live-work/`** — "no matches" there is not a clean sweep; use `grep -rn` (memory saved).
- **A state initializer that WRITES** runs twice under React Strict Mode in dev — `loadChain` caches per page load.
- **Measure an Architect finding before folding it:** E1 (the parity band) confirmed by running R1's code; the client
  film's cursor 340 px off was seen only in the STILLS (the site's root zoom), every number green — now gated.
- **T1a model, for harnesses:** a click on a covered clip lands on the take ON TOP; select covered takes via the
  inspector (`[data-take]`).
- Plan-review gate as practised: Carl rejects `ExitPlanMode` while routing reviews; approves in text.
- Servers: BOTH STOPPED at hand-over (port 3000 killed by PID, confirmed free); `npm run dev` to fly T1a. The
  harness's screenshot now goes to the OS temp folder (it had left a PNG in the repo root).

---

*Written 27 October 2026 at 44% before compaction. Replaces the 26 October session-2 handoff.*
