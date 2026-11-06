# Session Handoff — 6 November 2026, session 2. THE PIVOT: THE STREET CONCEPT DROPPED; A NEW HERO CONCEPT NEXT

⛔ **READ THIS FIRST, THEN `project-intelligence/` AS NORMAL.** Replaces the 6 November (session 1) handoff. Delete it at the end of
the session that reads it, once its replacement is written. The record: `decisions.md` — D-101's entries from *"THE LOAD
CROSSROADS"* to the end, and **D-108**.

## WHAT HAPPENED

- **The load crossroads.** Carl, having seen the bench's load: stay all code, go partial video, or use Blender? *"my concern is
  loading time."* The Builder filmed threejs.org's showcase sites and examples on Carl's PC (AMD Radeon integrated graphics,
  ~250 Mbps): every heavy scene hides 3–20 s behind a loader or a designed build-in; Slop New York, a street built in code,
  19.5 s — the wait is the DEVICE (build + compile), not the line. `live-work/threejs-load-survey-6-november/`.
- **Carl's rulings (all in D-101 / D-108):** every technique priced when adopted, against the AUDIENCE's devices (D-108; for
  clients too); the hero's audience is BUSINESSES on a PC; *"Are we building for devs? ... Or are we tryings to attract
  clients?"* — the hero is for CLIENTS; three.js's examples are THEORY, not templates (*"Its like looking at music theory and
  creating a masterpiece"*).
- **⛔ THE STREET CONCEPT DROPPED AND REMOVED EVERYWHERE** — the code, the record, `live-work/`, the film folder `03 The hero`
  (19 GB, to the Recycle Bin, recoverable until Carl empties it), and **git history** (rewritten from `69ca161`, force-pushed —
  Carl chose it: *"b. I have no regrets."*). A founder override of context-rules' *No retroactive rewriting*, scope: the
  street only. **Only the lessons remain** — D-101, *"THE STREET CONCEPT — DROPPED; THE LESSONS KEPT"*.
- **Kept:** the hero copy (*Websites built / to be seen.* + subtext) — the home page now shows just the text; the 3D text on the
  bench (`hero-text.tsx`, lit by its two sketch lights); the page camera and page guide as TAKES (`hero-page.tsx`); the camera
  bench in BOTH media (WebGL, WebGPU — Carl: the medium depends on the new concept).

## NEXT — CARL's

- **A NEW HERO CONCEPT** — Carl: *"Come up with a new concept for the hero."* Through the brainstorm form
  (`live-work/templates/brainstorm-record.template.md`, its MEDIUM slot); every technique priced (D-108); judged by what a
  client sees in the first seconds on an office PC. Carl leads; wait for him to open it.
- **Open:** where D-108's running total lives; whether a link first opened on a phone counts in the audience.
- **Files open in `chunk-scope.json`** (`_heroPivot6Nov`): `app/page.tsx` UNLOCKED (protected) — lock and test when Carl says
  close; `hero-page.tsx`, `hero-text.tsx`, `camera-bench.tsx`, the bench media files in `files`.

## LESSONS (this session)

- **Deleting a module the dev server still imports breaks EVERY page in development** — move the shared pieces out first,
  delete last (the home page went to a build error; restored at once).
- **Scripted writes bypass the scope guard** — use the Edit tool for code, so the guard checks it.
- **Price before you build** — and say the running total as the work grows (D-108).

---

*Written 6 November 2026, session 2.*
