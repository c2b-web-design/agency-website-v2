# Session Handoff — 25 September 2026 (second session). THE ROOM IS LIT; CA AND CB HAVE TEXT. NEXT: CD + CS TEXT.

⛔ **READ THIS FIRST, THEN `project-intelligence/` AS NORMAL.** Chat history is not canonical (D-006).
**Delete this file at the end of the session that reads it, once its replacement is written.**

---

## ⛔ WHERE THINGS STAND

**Everything is committed and pushed** (this handoff rides in the last commit). Commits this session:
`b00f9b8` the new room + the far-clip fix · `2ff88fc` the moving light (the orbit) · `028dd54` CA's text ·
then **CB's text, the em dashes out, and this handoff**. ⚠ Pushing `main` DEPLOYS — `/about` on the live site
shows the orbit, the static lights off, and CB's text.

⛔ **CARL WORKS ON PLAIN `/about`, REACHED THROUGH "ROLES" → `/about#roles` — WITH NO QUERY STRING.** A feature
behind a `?flag=1` is one he never sees (*"no its not"* — it happened this session). Build on the plain page;
use flags only to switch things OFF or to compare. Put the query BEFORE `#roles`.

- **Record:** the **D-095 tail** of `decisions.md` (the room, the far-clip, CA/CB text) and **D-090's 25 September
  entries** (the light). **Sprint:** the three 25 September rows.

## ⛔⛔ NEXT — CD AND CS TEXT (Carl: *"CD + CS text next"*, typed "CS +CS"; confirm if in doubt)

**The technique that worked on CA and CB — use it again:**
1. Show the card's text alone: `?text=` default is in `textCardsFromUrl` (`about-card-canvas.tsx`) — now `["cb"]`.
2. Measure the fit with the REAL font, card and setters: `node --no-warnings project-intelligence/live-work/scripts/card-fit.mjs CD 52 74`
   (lines, slots, pages, last-page fill, widest gap, weak line-endings, lone words). **Target: TWO FULL PAGES at 68 mm**
   (Carl's same-size rule, 24 September; CA and CB are both 68).
3. If it does not fit, **show Carl the copy and its current breaks; HE offers the edits** (*"Your discression"* on CA;
   options on CB). Search every combination of his options (see `cb-edits.mjs`), show the best one or two laid out
   by page, recommend one, let him choose. ⛔ **Never reword without his options.** The keep-line must stay verbatim
   in the body (update it only if HE edits it).
4. **Re-check the depth rule** (`EXTRUDE_DEPTH_MM`, `card-extrude.tsx`) against the NEW view angles — the old ones
   were from the old room. Computed this session: **CD 15.4 / 18.3 / 25.4°** (was 26.9 / 27.4 / 34.7), **CS 23.8 /
   25.9 / 33.8°** (was 60.0 / 52.8 / 44.2). At 68 mm the stem is ~5.9 mm: CD at 2 mm → ~16% side wall (fine);
   **CS at 0.9 mm → ~10% — probably shallower than it now needs** (CA 14%, CB 16%). ⚠ Raise it with Carl; do not just change it.
5. ⚠ **CD and CS are different SHAPES from CA/CB:** CS is 1662 × 423 mm (wide, short — few slots), CD 1284 × 547.
   Same 68 mm may give very different page counts. Measure before assuming.
- ⚠ CD/CS copy already has its em dashes out (commas). CD 50 words, CS 57.

## ⛔ WHAT WAS BUILT THIS SESSION (details in the records)

- **The seam = the far clip:** `far` was 100, the proxy's far plane 102–106 m; now derived (`CAMERA_FAR`). It was
  ALSO why the cards read opaque white. `live-work/scripts/seam-far-clip.mjs`.
- **The moving light (`about-moving-light.tsx`) — Carl's ORBIT:** two spots on one fixed ellipse (room space, through
  CA's top-left and CB's bottom-right), anticlockwise, half a lap apart, aims turning to the card being passed
  (1/d⁴ weighting — chosen by measurement), exposure held at the aim, **random legato reversals at the two lulls**
  (41% / 91% of a lap). Faders `lm*` (header of the file). **Static key/fill OFF by default** (`?lmglobal=1`).
  Trajectory drawn on localhost only (`?lighthelpers=0` hides it).
- **The text:** only one card shows (`?text=`); the pages run (the chase); **sentence easing** (0.6 over 1.5 words,
  `texteasefloor`/`texteasewords`); **68 mm**; **balanced line breaking by default** (`setBalanced`,
  `?textbreak=greedy` compares). CA and CB copy edited by Carl's options; **em dashes out of all four**.
- **Landing trigger PARKED, not removed** — Carl: *"make sure it has no impact at the moment"*:
  `DOWNBEAT_ON_LANDING` (light) and `TEXT_START_ON_LANDING` (text) are `false`. `WALL_BAND` was re-derived from the
  new room (it still read the old photo's card positions). ⛔ Do not delete the trigger; it is being reworked.

## ⚠ CARL'S RULINGS AND STANDING INSTRUCTIONS FROM THIS SESSION

- ⛔ **"Go look at X" means the RUNNING page, not just the code** — *"Code only tells half the story."* (memory saved)
- ⛔ **Motion is judged MOVING** — *"Its a lot different when its moving, it comes 'alive'."* Frames are records, not evidence.
- The light **washes; it does not concentrate** (D-077: four positions you return to). **CA goes first.** Slow. Its job
  is the 3D geometry. **Legibility first** — *"not at the expense of the task at hand."*
- Easing goes at **sentence** boundaries, subtly, with figures for his eye (*"not an exact science"*).
- The em dash *"screams AI"* — never introduce one into copy.
- Plan gate **waived** for the moving light (*"weve done this twice before"*).

## ⚠ PARKED / WAITING ON CARL — DO NOT PRE-EMPT

- **Intensity:** it blows out at points, especially the **bottom of the orbit** (CD face-on) — needs a gently
  **faded, timed** drop there, tuned with the text on. *"We will address this soon."*
- **The light's colour (white):** Carl has an idea tied to the **rim colours**. Do not guess it.
- **Static lights off** sits against legibility-first — re-judge once all text is on.
- **THE LOGO (D-088):** Carl will say when. Do not raise it.
- Unanswered from before: move the five superseded 24 September overlays into `superseded/`? · CLAUDE.md's
  "8,837 words" required-reading figure is really ~19,100. · The two R-028s; the etched take; CS's "connected to…"
  (D-077); accessibility at mastering; ENVMAP-STALE / RIM-DARK; the `proven.json` filing.

## ⚠ HOUSEKEEPING

- `live-work/chunk-scope.json` = **`about-moving-light`**, active — now also covers the text files. Re-scope if the
  next chunk is framed differently.
- **Server:** a production build on **:3000** may still be running from this session — stop it by PID before a
  checkpoint (`TaskStop` has reported success on a held port; it did again this session).
- ⚠ **Shell quoting eats backticks and backslashes** in `node -e "…"` and heredocs — twice this session. Write a
  script FILE (`.mjs`; `.ts` scripts in the project break `tsc` — it happened) and run it with `node --no-warnings`
  (Node 25 imports the real `.ts` modules directly).
- Carl's machine: DPR 1.36, viewport ~1412 × 700 CSS.

---

*Written 25 September 2026 (second session), at ~44% context before compaction.*
