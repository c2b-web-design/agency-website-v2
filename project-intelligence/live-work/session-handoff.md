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

- **A NEW HERO CONCEPT — CARL BRINGS IT, MONDAY 9 NOVEMBER.** Carl: *"Next session is on Monday. I have the weekend to come
  up with a concept."* Wait for him to present it; then record it through the brainstorm form
  (`live-work/templates/brainstorm-record.template.md`, its MEDIUM slot), price every technique (D-108), and judge it by what
  a client sees in the first seconds on an office PC. Don't pitch a concept of the Builder's own unless he asks.
  RAISED by Carl at the close (not chosen): *"I think it may be fair to say i like those liquid bubble things"* — `webgl_marchingcubes`; then *"with a logo that is solid a nice morph could be on the cards"* (routes in D-101's last entry); then *"could the liquid fill the shape of the logo?"* (routes there too); the jack-in-the-box droplets example; and a SHARD CLOUD filling the logo, gathering into it or bursting out (`webgl_buffergeometry`; Carl: *"Thats exactly how i would use it"*). Then the compute RAIN (`webgpu_compute_particles_rain`, measured: 0.85 MB, ~1–2 s) and Carl's *"parting of the bland sea"* — a designed dry shape in the rain. Then the VFX linked particles (`webgpu_tsl_vfx_linkedparticles`, responds to the pointer; ~5 ms GPU of 16.7 on Carl's PC). All raised, none chosen. Carl's task for the weekend: *"to take elememts of these and come up with a concept."*
- ⛔ **CARL's DIRECTION for the concept:** *"The logo is the central theme. It should always return to that shape, that form. Where it goes in between. That is the question, and how."* (D-101's last entry.)
- **The film folder is fresh:** `Videos\C2B Films\03 The hero`, empty, film 01's bins (`00 References` … `10 Pick-ups`) — made
  this session at Carl's request; recording only on his word.
- **State at close:** everything committed and pushed — the rewritten history (`940bc82`) and, on top, the concept search's record and
  this handoff; the dev server STOPPED (port 3000 free). The survey's screenshots and the linked-particles film are on Carl's PC only.
- **Open:** where D-108's running total lives (RAISED: three.js's Inspector on the bench's WebGPU medium — per-pass ms); whether a link first opened on a phone counts in the audience.
- **Files open in `chunk-scope.json`** (`_heroPivot6Nov`): `app/page.tsx` UNLOCKED (protected) — lock and test when Carl says
  close; `hero-page.tsx`, `hero-text.tsx`, `camera-bench.tsx`, the bench media files in `files`.

## LESSONS (this session)

- **Deleting a module the dev server still imports breaks EVERY page in development** — move the shared pieces out first,
  delete last (the home page went to a build error; restored at once).
- **Scripted writes bypass the scope guard** — use the Edit tool for code, so the guard checks it.
- **Price before you build** — and say the running total as the work grows (D-108).

---

*Written 6 November 2026, session 2.*
