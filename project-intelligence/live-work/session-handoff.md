# Session Handoff — 23 November 2026 (Monday), session 1. PHASE 4 BEGUN: THE CLOTH LEAVES AS THE LOGO CLEARS, THE MARBLE RADIATES IN; ROUTE B (A PLINTH, NO GROWTH); THE MARBLE's BAR IS GPT's IMAGE

⛔ **READ THIS FIRST, THEN `project-intelligence/` AS NORMAL.** It replaces every earlier handoff. Delete it at the end of
the session that reads it, once its replacement is written.

**The record:** D-101 in `decisions.md`, from *"THE CLOTH's DEPARTURE IS ITS ARRIVAL MIRRORED"* to the end; review
**R-114** (*"a natural flow to the story"* — the departure's timing and the marble's entrance; not the marble's look).
Session ended on Carl's word: *"Compaction is 44%. Write a handoff and commit and push."*

## ⛔ NEXT — CARL's (asked, not answered)

1. **OUR MARBLE, TAKE 4** — here or a fresh session was asked; the session ended first. Aim at **THE BAR: GPT's first
   marble** (`public/hero-bench/marble-gpt.webp`, Carl: *"the GPT image is the bar"*): a CONTINUOUS near-black body, GOLD
   veins that run THROUGH it and fade (never closing into shapes — Carl rejected plates-and-cracks: *"crazy paving with
   gold cement"*), TEAL deep inside, real MINERAL TEXTURE inside the veins close up (take 3 failed close up: *"the close
   up image is the decider"* — poured liquid gold in flat nested bands). Build on the SEND OPAL's recipe (D-033: submerged
   formations, few strong shapes, local contrast, one thing answers the light). **Generate it ONCE at load into a large
   texture** (4096–8192 px) so it costs what GPT costs (measured: ours per-pixel 31 / 18 FPS against GPT 47 / 30 — HOME /
   close, `hero-marble-fps-23-november.mjs`). Judged on the bench, CLOSE UP, against GPT.
2. ✔ **DONE after the first push (committed):** the slope fixed (an oval 1.6× wider than deep, the far side faded along a
   STRAIGHT line 200 cm behind the logo — level from HOME; world-fixed, so a straight back edge from other cameras); the
   floor light ISOLATED (both marble lights on hidden layer 31, out of the logo's list — the logo keeps its approved gold,
   its shadow still falls, verified `hero-marble-shadow-23-november.mjs`); the floor light's default Carl's `#f7f8c9`.
   Seen: from ABOVE the logo's face now goes dark (nothing lights it there) — the SHOWCASE LIGHTS for the gold, to come.
3. **THE CLEAR COAT HAS NOTHING TO REFLECT** but the spotlight's highlight (an environment, maybe the logo, to come; a
   mirror priced first, D-108).

## ⛔ PHASE 4 AS RULED TODAY

- **RENAMED:** phase 4 = the larger logo, with **GANDALF's FIREWORKS** at the end (the 10–16 Nov "phase 4" = the web floor).
- **ROUTE B:** NO jump, NO growth — the logo keeps its size; the marble on the flat floor, then a RECTANGULAR shape rises
  out of it under the logo, lifting it to the text's height (~31 cm at HOME, a take); the camera (phase 5) emphasises size.
- **THE STORY LOOPS**, ending at HOME (Home is set in stone for the OPENING only). **Scrolled away / tab hidden: FREEZE**
  (nothing drawn, the story clock stopped; resume where it stopped); **navigated away: restart from the opening** —
  structural, a note through the Architect, belongs to the hero ON THE SITE (after phase 5). Not built.
- **THE MARBLE IS THE FLOOR's OWN, STATIC** (movement from the camera); 18 Nov's projected marble superseded.

## BUILT TODAY (committed and pushed with this handoff)

- **The cloth's departure** (`clothDeparture`): the arrival mirrored, from −100 back and down to where it lay, 3 s, then
  asleep; starts `clearS` 1.8 s after pass 4's return takes off — the moment the logo is clear (measured,
  `hero-pass4-clear-23-november.mjs`; a constant of pass 4's approved dials). Story: leaves 72.8 s, down 75.8 s. Its
  one-frame vanish: the camera hides it (Carl).
- **`hero-marble.ts`** (new): `webgpu_lights_spotlight` copied, the logo in the statue's place (casts/receives; both
  lights in its list); the floor its own light list; enters with the departure, a circle radiating from the logo over 3 s.
  Then: a CIRCLE (450 cm, 200 cm rim fading into the background colour), PHYSICAL STONE (matte 0.5 under a clear coat
  1 / 0.06), maps **gpt** (default, THE BAR), **ours** (take 3, its own material), **disturb.jpg** (THE FALLBACK), none.
- **Deleted (Carl):** every other marble of today — Gemini, emerald, eight perchance images, their stills.

## OPEN — CARL's (carried)

- The cloth's arrival timing vs the camera's pull-back; the back face's gold; the plinth's size; the slope (above).
- Flagged: the dev overlay on `/start` reads "2 Issues" — not looked into.
- Carried from before: the cloth colour C at the gold; Gandalf's fireworks; the floor's notes; the untracked
  `structural-note-code-drops-20-november.md`; the frame cost of the whole phase (D-108).

## LESSONS (today)

- **Measure before tuning:** the "pause" was the wobble + a 2 s beat, not the −100 move (which the 2's drying needs).
- **A dark disc's rim must fade to the BACKGROUND, not black** — black read as a ring.
- **One shader for several looks pays for all of them:** ours dragged GPT to ~35 FPS until split onto its own material.
- **Close up decides marble.** Fractal zero lines read as rivers/contours; closed cracks read as paving. Slab veins run
  through and fade.
- **Perchance refused the automated browser**; Carl ran it himself. Its output is 768 px.

## STATE

- **Committed and pushed** with this handoff. The screen capture STOPPED (`01 Discussion\2026-11-23_discussion_screen
  .remux.mkv`, 2:17:58). The dev server is UP (port 3000).
- Films today (`03 The hero\`): `2026-11-23_cloth-departure_take1`, `_take2-when-clear`, `_marble-spotlight-example_take1/2`,
  `_marble-entrance_take1`, `_marble-gpt_take1`.
- Scope (`chunk-scope.json`, `_marble23Nov`): `hero-marble.ts`, `disturb.jpg`, `marble-gpt.webp` added; Gemini removed.
- Carried: target 1 December; name the files and ask before the first code edit, every session; a question is answered,
  not built.

---

*Written 23 November 2026, session 1.*
