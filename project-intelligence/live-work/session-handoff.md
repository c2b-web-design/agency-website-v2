# Session Handoff — 10 November 2026 (Tuesday). THE REFLECTION FIXED; THE BLOBS MIMICKED; THE JUMP APPROVED

⛔ **READ THIS FIRST, THEN `project-intelligence/` AS NORMAL.** It replaces 9 November session 3's handoff. Delete it at
the end of the session that reads it, once its replacement is written.

**The record:** D-101 in `decisions.md`, from *"THE LIQUID's PROBE 2 — THE LOGO IN THE FIELD (10 November 2026"* to the
end; R-104 and R-105 in `reviews/review-log.md`. Every beat is there with Carl's words.

## STATE

- **Pushed:** `8b4b84d` — the logo's stale-reflection fix (R-104) and probe 2.
- **UNCOMMITTED (Carl has not said commit):** `hero-logo.tsx` (THE JUMP, R-105 "Perfect"), `hero-liquid.tsx` and
  `hero-liquid-webgpu.tsx` (the one-field liquid, phrase 1), `hero-idea.tsx` (`pose="jump"`, `LIQUID_ON = false`),
  `hero-idea-webgpu.tsx` (the `liquid` slot → `liquidMaterial`), `decisions.md`, `review-log.md`, `current-sprint.md`.
  Ask Carl before committing. **tsc clean; lint at the baseline** (the accepted error, the 2 `projector.mjs` warnings) —
  last checked before the final docs edits; re-run before a commit, and build a clean checkout before any push.
- **The bench (`/proto/camera?blank=1`)** shows the JUMP looping (2 s lean, 0.7 s hop, landed with the wobble). **The
  liquid is OFF** (`LIQUID_ON = false` in `hero-idea.tsx`; nothing removed).
- **The dev server is RUNNING** (port 3000). **The screen recording is RUNNING** — ffmpeg PID 29156, started on Carl's
  word, into `Videos\C2B Films\03 The hero\01 Discussion\2026-11-10_discussion_screen.mkv`. Ask Carl whether to stop it
  (stop by PID; the file is MKV, safe if cut).
- **The scope stays OPEN** (`_heroLogo9Nov`, Carl's standing exception to the end of the hero's PHASE 1). No new files
  were added this session.

## WHAT THIS SESSION SETTLED

- **⛔ THE STALE REFLECTION (R-104).** three r185's WebGPU renderer reuses a built program for any material whose cache
  key matches, and that key records a texture's KIND, never WHICH texture; `EnvironmentNode` fixes the env texture into
  the program. Step 1's studio (built first, while the text builds) and the capture are the same kind, so the logo drew
  the studio. Fix: `customProgramCacheKey` returns the env texture's uuid. Four loads identical; the reflection
  instrument passes at session 3's figures. **Carl re-approved the look.**
- **⛔ THE BLOBS: the reference's code mimicked** (Carl: *"mimic the blobs behaviour ... then we will customise it and
  make it our own"*), APPROVED: *"look, movement and behaviour look great."* Its field (balls `s/r² − 12` that ADD; the
  surface at 80) is what makes the fat bridges and the wall's swell — a smooth minimum only rounds a crease.
- **⛔ CARL's LIQUID CHOREOGRAPHY** (verbatim in D-101): EXPELLED out of the logo in ~500 ms, NOTHING left → to the right
  wall, bouncing and partly merging → the bounce brings them to the MIDDLE for ~3 s → they come together into the logo
  shape, *"like pouring jelly in a mould"* / the T-1000 re-forming. ⚠ Earlier: several blobs over ~500 ms, no mass left.
- **⛔ THE START (R-105):** the page loads → the logo NOTICES the visitor → it JUMPS from the lean → LANDS standing on its
  end on the grid line **x = −100 cm** → **the SHOCK of that landing sets off the blobs.** ⛔ **No turn** (*"keep the same
  profile"* — face to the RIGHT so the blobs leave toward the wall, never at the camera). Approved take: a 0.7 s
  ballistic hop under real gravity, only straightening the 12.5° lean; then the DESK MARK's wobble (its curve and
  angles, copied), sideways on its thin end, right first.
- **Phrase 1 (expelled → the wall), BUILT, then PARKED** (Carl: *"We can fine tune it from here"*). ONE field
  (`liquidMaterial`): ten balls + the mirrored wall + the LOGO added by the wall's own law (its surface exactly on the
  mesh's at weight 1). Take 2 of the travel: one Hermite path per blob (leaves the face moving, arrives with its wall
  path's velocity; measured: no stop, no seam).

## NEXT — Carl leads; the obvious thread

1. **The landing's SHOCK → the blobs** from the LANDED logo (on its end at x = −100, face right). The liquid's logo term
   reads the LEAN's frame today (`HeroLiquid` gets the lean's position/quaternion): it must read the LANDED pose, and the
   expulsion start at touchdown. Bring the liquid back (`LIQUID_ON`).
2. Carl's fine-tuning of phrase 1 (the travel's speed: `LIQUID_T.travel`, 2.5 s now, peak ~3 m/s).
3. Then the MIDDLE (~3 s), then the MOULD (the logo term at the formation spot just above `HERO_LOGO_PLACE`, its weight
   rising), then the solid logo falls (the second, balanced landing).

## OPEN — WITH OWNERS

- **The wall's sheet shows** (Builder): a red board whose far half reaches inside the page frame (the frame widens with
  depth). Place it for the far depth, or limit its extent.
- **The field's first-show compile: ~4.4 s stall** (was 130 s; fixed by looping the balls IN the shader). On the site it
  must compile during the lean's hold (Builder).
- **Mass is not held** in the liquid (the mimic swings ±12 %; the expulsion unmeasured) — step 4's curve (Builder).
- **`/about` showed a Next dev "1 Issue" badge; one automated run logged "NEON IGNITION NEVER RAN"** (under Playwright;
  the next run did not). Not investigated — ask Carl to look before calling it a fault (Playwright is not his mouse).
- **The profile formula is COPIED** from `logo-mark-geometry.ts` (not exported; outside the scope): face height asserted,
  the rest not. Carl's call whether to export it.
- **The glow's selection check fails at the previous HEAD** (pre-existing): Carl's call, unchanged.

## LESSONS

- **A green instrument can be measuring something else:** the reflection instrument "failed" because the bench now
  showed the liquid probe by default; it now parks it first. Check what is on screen before reading a number.
- **WebGPU on D3D inlines every shader call:** ~16 field calls × ten JS-unrolled balls froze the page 130 s on first
  compile. Loop over a uniform ARRAY inside the shader (`uniformArray` + `Loop`), and time the first compile.
- **GNU sed/grep read `` \` `` as an anchor:** a sed meant to remove backslash-backticks put a backtick at the start of all
  397 lines of `hero-logo.tsx` (repaired). Use Edit or Python for literal characters; grep with `-F`.
- **Homework before building works again:** the video and source showed the fields ADD — the look Carl approved.

---

*Written 10 November 2026.*
