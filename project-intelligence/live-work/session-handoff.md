# Session Handoff — 22 September 2026. THE GLASS IS DONE AND APPROVED. THE PILLARBOX IS NOT.

⛔ **READ THIS FIRST, THEN `project-intelligence/` AS NORMAL.** Chat history is not canonical (D-006).
**Delete this file at the end of the session that reads it, once its replacement is written.**

---

## ⛔⛔ TWO HALVES, AND ONLY ONE IS FINISHED

**FIRST HALF — the glass rollout. D-089 APPROVED BY CARL'S EYE.**
**SECOND HALF — the 4:3 pillarbox bands. COMMITTED, and Carl's verdict on the skirting corner is
*"much better"* — ⛔ NOT a formal approval. The COLOUR of the skirting is still unresolved.**

## ⛔ COMMITTED AND PUSHED. HEAD is `b1900b2`.

    817a4c9  feat(about): the face gets a BODY — transmission splits from the rim's
    a957f1a  feat(about): placement APPROVED, no card moved — the floor rails come out
    b1900b2  docs: D-089 to D-092 — the material, the lighting questions, and two gaps

⚠ `npx tsc --noEmit` CLEAN. `npm run lint` = **1 problem (1 error, 0 warnings)** — the documented
baseline. ⛔ **Dev server was running on port 3000 (PID 4364) during the session — CHECK AND KILL
IT before measuring anything.**

## ⚠⚠ UNCOMMITTED WORK IN THE TREE — deliberate, not forgotten

    M  app/about/page.tsx                        renders <PillarboxPlate />
    ?? components/about/pillarbox-plate.tsx      the whole band component
    ?? public/about-edge-column.png              2x1707  right band source
    ?? public/about-edge-column-left.png         2x1707  left band source, repaired
    ?? public/about-skirting-left.png            40x172  the corner fragment, UNFLOPPED

⛔ **NOW COMMITTED. NOTHING HERE IS APPROVED — Carl said *"much better"*, not approved.**

---

# ✔ WHAT IS FINISHED AND APPROVED — THE GLASS

**D-089 APPROVED, R-027 and R-028 filed.** Carl's eye, in the room.

⛔⛔ **THE FAULT WAS NO BODY, NOT TOO LITTLE FROST.** At `transmission: 1.0` a
`meshPhysicalMaterial` has **no diffuse contribution at all**, so each card took its brightness
entirely from its background and CS's left edge vanished against the dark desk. ⚠⚠ **Carl's own
opening instinct was MORE FROST and it would not have worked** — a blurred dark background is
still dark. **The missing ingredient was TONE.**

⛔ **THE RIM STAYS CLEAR AT 1.0 AND IS NOT ON THE FADER — it IS the neon.**

⚠⚠ **CARL'S ACCEPTANCE TEST IS FAMILY RESEMBLANCE, NOT MATCHED NUMBERS** — *"they feel all part of
the same family except CA."* ⛔ **Four cards against four backgrounds need FOUR values to read as
ONE material:**

    CA 0.95   dark blue wall          CD 0.95   dark desk front
    CB 0.86   dark blue wall          CS 0.86   lit floorboards — THE EXCEPTION

⛔ **ONLY CS's VALUES ARE APPROVED.** CA, CB and CD are **PROVISIONAL** and Carl said so himself:
*"it is possible that these values might need tweaking once neon and light are added."*

⛔ **PLACEMENT APPROVED — NO CARD MOVED.** *"The cards are essentially 2+2... the original
calculations were done accurately."* **The floor rails are REMOVED, their job done**, which closed
GUIDES-WITHOUT-FLAG by removal. ⚠ Angles survive in `app/proto/wall/page.tsx` (`INITIAL_RAIL`);
**restoring them is a revert of `a957f1a`, not a re-measurement.**

---

# ⛔⛔ THE PILLARBOX — WHERE IT ACTUALLY STANDS

**THE PROBLEM.** The plate is a true 3:2 (2560x1707) in a 16:9 viewport, so ~16% of the width is
dead black by geometry. Carl: *"Aspect ratio screams 4:3 and for someone with a massive modern 4k
HDR TV... this says one thing very loudly - OLD."*

⚠⚠ **AND THE DEFECT IS THE STRAIGHT EDGE, NOT THE DARKNESS.** The top 85% of both plate edges is
already `rgb(8,9,13)` — **under 4% from pure black.** The band reads because a perfectly straight
vertical boundary is findable at almost any contrast.

## ✔ WHAT WORKS — the wall bands

⛔ **THE BAND IS BUILT FROM THE PICTURE'S OWN LAST PIXEL COLUMN** — Carl's construction. **The
band's first column IS the picture's last column at every height, so the join is exact by
construction rather than by tuning.**

**MEASURED, right band:** join step +0.67 to -2.00 through the wall, all negative-or-zero (band
slightly darker, never lighter). Outward ramp monotonic at every height — 20%: 17.0 -> 9.3,
45%: 12.7 -> 9.0, 70%: 10.7 -> 9.0.

⛔ **THE EASE RATE IS DERIVED, NOT CHOSEN.** Fitted over the seven clean columns at the right edge:
`luma = -0.5146x% + 65.23`, reaching 0 at x = 126.8% of plate width. **The band only reaches
117.4% at 16:9, so the physics does 65% of the work and the ease closes the rest.**

⚠ **THE LEFT COLUMN IS REPAIRED** by Carl's own method — *"sample the wall pixels horizontally"*.
**125 of 1707 rows** replaced: 36 found clean wall further right, **89 fell back to the nearest
clean row above.** Max greenness 4.63 -> 2.00, max luma 58.0 -> 22.0. ⚠ **A third of the repairs
are the row above, not a true horizontal sample. Stated, not hidden.**

## ✔ THE SKIRTING CORNER — RESOLVED BY CARL'S CORNER TEST, 22 September

**Carl's spec:** *"its only a small number of pixels in a corner... It only has to look like the
skirting."* **The floor below is left alone — it reads as shadow.**

⛔⛔ **CARL'S CORNER TEST IS THE INSTRUMENT THAT SOLVED IT** — *"The old skirting will have a pixel where it meets the floor. The new will have a pixel at the bottom on its furthest away, right hand side. When these 2 pixels are next to each other it will be aligned."*

⚠⚠ **THE BUILDER'S BAND-THICKNESS MEASUREMENTS AGREED WITH TWO WRONG ANSWERS.** They compared the skirting as a BAND at the join column and never checked DIRECTION or on-screen POSITION. **Carl caught both by eye.**

**THREE FAULTS, EACH FOUND ONLY ON SCREEN:**

1. ⛔ **THE V.** A flopped sample measured perfectly — bottoms identical, tops and thickness within 0.10% — and rendered as a V. **The skirting DESCENDS toward the seam (plate x=40 at y 86.8%, x=0 at 91.0%), so continuing it needs pixels from x < 0 that do not exist.** Flopping manufactures them and reverses the slope. ⛔ **DO NOT RE-TRY THE FLOP. The asset is UNFLOPPED.**

2. ⛔ **A 28px VERTICAL ERROR HIDDEN BY AN ARITHMETIC MISTAKE.** The Builder claimed "aligned to 0.008%" by comparing SOURCE coordinates, ignoring that the element is a sibling of the band and resolves `top` against the SECTION. ⚠ Carl nudged twice by eye and correctly reported *"its not moved"* — 10px of a 28px error is invisible. **Fixed: `top: 90.54%`, measured band 914px against picture 914px, gap 0.**

3. ⛔ **A ONE-PIXEL BLACK SEAM.** Carl: *"I can see the join. The black line."* **Measured: x=239 luma 52, x=240 luma 10, x=241 luma 55.** ⚠ The band is `(1920-1425)/2 = 247.5px` — **the element's right edge landed on a HALF PIXEL**, rounded away, and page background showed through. **Fixed by widening the element 1px into the plate. Nothing was misaligned; the geometry has no whole pixel there.** ⛔ **Do not remove the 1px overlap.**

⚠ **ANGLE: 2.23 degrees mismatch**, after sizing the piece in PLATE SCALE (`calc(150vh * 40 / 2560 + 1px)`) rather than raw pixels. **A fixed 40px was a 1.8x stretch that flattened it to -52.3.**

⛔⛔ **COLOUR IS STILL NOT SOLVED — THE ONE THING LEFT ON THIS FRAGMENT:**

    source skirting at x=0                    peak luma 105
    after the section 25% neutral-950 overlay        81
    measured on screen                               56   <- ~25 levels UNEXPLAINED

⚠⚠ **AND A SECOND FAULT:** the picture reads 105 ON SCREEN at x=250, so its source there is ~137. **The sample was cut from the skirting's dim end and butted against its bright end.**

⚠ **A PIXEL OFFSET STORED AS A PERCENTAGE IS VIEWPORT-DEPENDENT.** 90.54% is correct at 1920x950 and unverified elsewhere.

---

# ⛔⛔ THE FINDING THAT COST FIVE REBUILDS — READ THIS BEFORE TOUCHING §2

**WHAT YOU SEE IN §2 IS WEBGL, NOT THE DOM IMAGE.** `RoomBackplate` in `about-card-canvas.tsx`
draws the same photograph as **3D geometry** (D-084/D-085).

⚠⚠ **A CSS MASK CAN NEVER TOUCH IT.** Proven by compositing over a red backdrop: **the room stayed
fully opaque (redGain 0) while the bands went transparent (redGain 129-184).**

⛔ **The bands are still free DOM space** because the canvas is confined to its own centred
`aspect-[3/2]` box. **That is the only reason any of this works.**

⚠ **A SECOND TRAP IN THE SAME AREA:** `fill` + `object-contain` gave the plate `<img>` a box
**1905px wide — the whole section** — and its transparent letterbox area **covered the bands**.
Measured `[0, 951, 1905, 949]` before the fix, `[241, 951, 1424, 949]` after. **Geometry is not
paint; measure the rendered boxes.**

---

# ⚠⚠ THE METHOD CARL IMPOSED, AND IT WORKED

**After the Builder built mask, fill, fade and blend in one pass and then could not find which of
the four was broken:**

> *"I would do this in stages (chunks)... The problem with doing everything all at once is you have
> to hunt to find the issue with all of it."*

⛔ **AND HE KEPT THE LEFT BAND UNTREATED AS A CONTROL** — *"i said nothing about the left side.
just the right, i want to see how it looks."* **A before/after in one frame.**

⚠ **EVERY REAL FAULT THIS SESSION WAS FOUND BY MEASURING RENDERED PIXELS, NOT BY READING CODE.**
The Builder re-read its own markup three times while the cause sat in a file it had already read.

---

# ⛔ WHAT THE NEXT SESSION SHOULD DO, IN ORDER

1. ⛔ **Check ports 3000/3100 and kill any dev server before measuring.**
2. ⚠ **ASK CARL WHICH WAY TO GO ON THE SKIRTING CORNER.** He was offered three and has not chosen:
   - keep chasing the ~25 unexplained levels
   - re-cut the sample from nearer the seam (fixes the ~32-level source mismatch)
   - ⛔ **drop the fragment entirely and ship the wall band alone** — the Builder's own note is that
     the wall band works and this is a ~22px detail that has consumed a large part of a session
3. ⚠ **The pillarbox work is UNCOMMITTED. Carl has not asked for it to be committed.**

---

# ⚠ STILL OPEN AND CARL'S

1. ⛔ **RIM-DARK — PARKED BY CARL**, not fixed: *"its a minor issue and we will return to it."*
   The clear rim reflects `ENV_SHELL_COLOR` `#141a20`, proven by turning the shell red.
2. ⛔ **ENVMAP-STALE** — `useRoomEnvMap`'s `useMemo` is keyed `[plate, gl]`, so env constants
   appear dead. ⚠⚠ **It nearly produced a wrong finding: Carl saw the diagnostic red, reloaded,
   and it went dark WITH THE RED STILL ON DISK.**
3. **D-090** — each card gets its own light plus neon spill. **Open: should the frosting be
   lightly coloured, and is the individual light white or the neon's colour. They interact.**
4. **D-091** — the neon is ONE BRIGHTNESS TRACK. ⚠⚠ **AMENDED: `/start`'s Send opal already does
   this in production and nothing pointed to it** (D-074 again). **Four rules it proves; read them
   before inventing an architecture.**
5. **D-092** — the room may begin FADED in §1 and solidify into §2. ⛔ **There is NO
   IntersectionObserver anywhere in this codebase and `Roles` is a plain anchor**, so click and
   scroll are ONE unhandled case. **The replay-on-scroll-back question is Carl's.**
6. ⚠ **`ENV_PLATE_INTENSITY = 6.0` is still a compensation** for a missing light.
7. ⛔ **FOUR accessibility items are owed on this section and should be scoped as ONE piece of
   work:** D-086's `sr-only` copy, D-088's reduced-motion mark, D-091's three-flashes limit,
   D-092's reduced-motion fade.
8. ⛔ **THE FILE LOCK IS STILL OWED.** Carl agreed the approved glass values should be protected
   from future sessions. ⚠ **It needs him to NAME `.claude/protected-files.json` and
   `components/about/about-card-glass.ts`** — the guard requires the exact path from Carl, and the
   Builder inferring it is exactly what the protocol forbids. **`chunk-scope.json` does not exist;
   it would be created.**

---

# ⚠ PARKED BY CARL — DO NOT PRESS

1. **Whether showing clients the site is built by AI roles helps or hurts a premium, human-led
   positioning.** ⛔ Strategic, Carl's alone, and the neon does not depend on it.
2. **The travelling-room question**, **whether CA strikes first**, and **the neon colour count**
   he now doubts.
3. **`wall-card-corners-4-september.md` supersession notice** — still owed. ⛔ It still says
   **"DO NOT EDIT THESE NUMBERS"** with no notice that Carl discarded that set on 10 September.
   ⚠⚠ **That omission produced two false blockers on 18 September.**

---

*Written 22 September 2026. ⛔ **The glass is approved and pushed; the pillarbox is uncommitted and
its last 22px are unsolved.** ⚠⚠ **The Builder's predictions were wrong three times on the card
values and four times on the skirting colour — every one corrected by Carl's eye or by measuring
pixels, never by reading code.***
