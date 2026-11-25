# Session Handoff — 25 November 2026 (Wednesday), session 1. THE PLINTH IN; THE ENTRANCE's STALL FIXED; GANDALF's FIREWORKS DISCARDED; FILM 3's SHAPE RULED — NEXT: FILM 3's LOGGING, IN THIS FRESH SESSION

⛔ **READ THIS FIRST, THEN `project-intelligence/` AS NORMAL.** It replaces every earlier handoff. Delete it at the end of
the session that reads it, once its replacement is written.

**The record:** D-101 in `decisions.md`, from *"THE PLINTH — ROUTE A, BUILT"* to the end (the last entry: *"FILM 3 (THE
HERO) — ITS SHAPE"*); reviews **R-115** (*"Plinth looks great"*) and **R-116** (*"much smoother"*).
Session ended on Carl's word (*"A fresh session is the way to go"* … *"Authorised. Proceed"*).

## ⛔ NEXT SESSION — FILM 3, THE HERO (Carl chose to start it fresh)

Carl: *"What we want are the parts that count. Any detours, problem solving etc can be left out. There is the discussion,
text intro and 4 phases. It needs to be boiled down into a no more than 30min film."* Ruled (decisions.md, the last entry):

- **ASSET CONSTRUCTION ONLY:** the discussion, the text intro, phases 1–4. **Phase 5 (the camera) and the hero on the
  site LEFT OUT** (*"The camera bench has already been mentioned elsewhere"*).
- **A ROUGH ~30-MIN CUT goes into Resolve** (not ~10 as for 01/02/04); Carl crops and adds transitions there.
- **Process only** — no detours, no problem solving. Approvals shown. Plain language, "We", no em dashes (subtitles later).
- **THE METHOD** (put to Carl): (1) a BEAT LIST per phase from the record — D-101 and R-103 – R-116 give every step and
  approval, dated, in Carl's words; (2) each beat found in that day's capture — change detection, timestamped contact
  sheets (the pipeline: memory `reference_film_edit_pipeline`, films 01/02/04's scripts in `live-work/scripts/`);
  (3) the bench takes where they show the step better; (4) selects at **1080p 30 fps CFR**, file-name order = cut order,
  a markers EDL; Carl builds the timeline in Resolve from the clips (FCPXML import did not work for him).
- **FIRST WEIGHTING (a take, minutes):** discussion 4 · text intro 3 · phase 1 6 · phase 2 5 · phase 3 6.5 · phase 4 3 ·
  the finished scene played whole 2.5.
- **SOURCES:** `Videos\C2B Films\03 The hero\01 Discussion\` — **52 h 32 min in 18 captures** (9–25 November; the
  remuxed `.remux.mkv` from 13 November on, the originals for 9–11). ⚠ **NO capture of the 8 November concept
  brainstorm** (the idea comes from `00 References\`, `live-work/hero-concept-8-november/brainstorm-record.md` and the
  9 November captures) and **none of 16 November session 2**. ⚠ Today's capture covers 11:42–12:46 only (stopped on
  Carl's word); nothing after it was recorded. The dated bench takes: folders and clips in `03 The hero\`.
- **Phase 4 is NOT finished** (the reveal and the rise at 5 s, *"much smoother"*; the plinth *"looks great"* — verdicts,
  not approvals; our own marble take 4 and the showcase lights still to come): log intro + phases 1–3 first, add phase 4's beats when it is done.

## BUILT TODAY (all committed and pushed)

- **THE PLINTH** (`hero-marble.ts`; `hero-scene.ts`): route A — a rounded block (240 × 60 cm, edges 4 cm; takes) under
  the standing logo, its height the text's top less the logo's (31.6 cm, read from the geometry at load); the top the
  floor's own marble, the sides folded over its edges; its OWN soft fill (front, 20° up, 25° from the left, 2.5 —
  *"visible at all times"*); the logo lifted onto it. R-115.
- **THE REVEAL 5 s (linear); THE PLINTH RISES over the same 5 s from the same moment, EASED** (smoothstep — the
  Builder's take, stated; linear is one line). Story clock: the marble enters ~72.7 s, both complete ~77.7 s — **~86 s
  from the opening's start; the scene ~90 s** (Carl's figure, not recorded as a target). R-116.
- **THE STALL AT THE MARBLE's ENTRANCE FIXED** (`hero-scene.ts`, `warmShadow`): the spotlight's shadow pass compiled in
  the background warm-up, one caster at a time (cold 1,217–2,017 ms → none over 51 ms). ⚠ It mirrors three r185's
  internals: re-run `live-work/scripts/hero-pass4-stall-25-november.mjs` cold on any three upgrade.
- **`/start`'s `?skip=1` DEV DOOR RETIRED** (`enquiry-opening.tsx`, PROTECTED — authorised, locked and tested): its
  hydration failure was the dev overlay's "2 Issues". To reach client info in a check: **`verify/lib/walk-to-client-info.mjs`**
  (the visitor's walk, ~60 s; throws if it fails). `verify/` scripts run through **`npm run verify -- <script>`** (a hook
  enforces it).

## RULED TODAY

- **Gandalf's fireworks DISCARDED** — *"We end up with elegant marble and shiny gold."* The last ~4 s: the hold on the
  finished image and the loop to HOME.
- **The site STAYS ON three r185** — *"a rabbit hole that gets deeper every month"*; an upgrade at the right time; client
  sites checked per site. Notes kept: `live-work/references/three-upgrade-r186-r187-notes.md`.
- **The governance review before the clone** (pre-push gate, `/ship`, Code Mode as candidates; from Claude Projects, the
  Strategist): `live-work/references/workshop-template-and-client-delivery.md`, the last section.

## OPEN — CARL's

- The plinth's rise easing (the Builder's take); width 240 / depth 60 / edges 4 cm are takes.
- One shadow pipeline still made synchronously at the entrance, at no visible cost — which caster, not identified.
- A one-line pointer from `ai-system/governance-review-protocol.md` (OUT OF SCOPE) to the governance notes — needs Carl
  to name the file.
- R-114's film path carries two corrupted characters, and `decisions.md` line ~8048 one more (a 0x82 byte in a 23 November
  entry's `03 The hero6-11-23_marble-spotlight…` path) — the same shell-quoting slip; repair asked, not answered.
- Carried: our marble take 4 (THE BAR: GPT's image; close up decides); the showcase lights (the logo's face dark from
  above); the clear coat has nothing to reflect; the loop / freeze / restart (structural, after phase 5); the cloth's
  arrival timing vs the camera; the frame cost of the whole phase (D-108).

## LESSONS (today)

- **Read lint BEFORE committing — never in one command with the commit.** `af6d8b3` went out with 3 warnings that way
  (fixed in `5f8ae42`). The pre-push gate is on the governance agenda.
- **`compileAsync` builds an override material LATER, from its state then** — three's draw sets and restores per-object
  state at once, so a plain gather of the shadow pass built the wrong pipelines (measured, take 1).
- **Python heredocs: no backslash before digits** in record text (`\2026` became a stray byte, `\f` a form feed — the
  R-114 corruption). Check new entries for C1 bytes.

## STATE

- **Committed and pushed** with this handoff. The dev server STOPPED. Screen capture STOPPED and remuxed
  (`01 Discussion\2026-11-25_discussion_screen.remux.mkv`, 1:03:23).
- Scope (`chunk-scope.json`): the nine `/start` door files LOCKED and probed (`_lockedSkipDoor25Nov`); `unlocked` [];
  the hero files still open (`_marble23Nov` etc.).
- Carried: target 1 December; name the files and ask before the first code edit, every session; a question is answered,
  not built; record each verdict as it lands.

---

*Written 25 November 2026, session 1.*
