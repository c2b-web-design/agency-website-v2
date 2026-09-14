# Session Handoff — 14 September 2026. THE CARDS ARE IN THE ROOM, ON THEIR RAILS

⛔ **READ THIS FIRST, THEN `project-intelligence/` AS NORMAL.** Chat history is not canonical (D-006).
**Delete this file at the end of the session that reads it, once its replacement is written.**

---

## ⛔ WHERE TO START

| # | go to | why |
|---|---|---|
| **1** | ⛔ **"WHAT IS IN FRONT OF YOU"** | Two face treatments are live, one per card, awaiting Carl's eye ON THE BENCH |
| **2** | ⛔ **"SIX FACE FORMULATIONS"** | ⚠ **Do not propose a seventh without reading why five died** |
| **3** | ⛔ **"THE STAGE/PLATE TRAP"** | ⚠ It silently corrupted every card placement for hours |
| **4** | ⚠ **"WHAT I GOT WRONG"** | The pattern matters more than any single error |

---

## ⛔⛔ WHAT HAPPENED, IN ONE LINE

**Both floor cards now stand on their rails in the room at the solved camera, yawed to their desks,
corners exact on their handles — and the face profile went through SIX formulations, five rejected
on sight, ending with two different approaches running side by side for comparison.**

---

# ⛔ COMMITTED AND PUSHED. HEAD IS `065e9e9`

**Six commits on `main`, all pushed:**

    c1d87df  (the 11 September starting point)
    f950206  the floor cards stand on their rails in the room
    84023d6  both face treatments on /proto/card, under the light sweep
    467b241  the crown is Carl's, set by eye on the bench
    90cd291  both floor cards on one blueprint; the normal-map route is closed
    065e9e9  delete the normal-map machinery, one blueprint for all cards

**Uncommitted at the time of writing** — the walls-only plate work:

    M  app/about/page.tsx                 walls-only plate; WallCardText withheld
    ?? public/about-studio-wall-only.jpg  NEW — copied from brand-assets

⚠ **`npx tsc --noEmit` CLEAN. `npm run lint` = `1 problem (1 error, 0 warnings)`** — the documented
`enquiry-opening.tsx` baseline. ⛔ **Zero warnings held all session.**
⚠ **The dev server is RUNNING on :3000.**

## ⚠ THREE PLATES, AND WHICH GUIDES SHOW IS A CHOICE OF **FILE**

⛔ **The quads are PAINTED INTO the images, not drawn in code**, so showing or hiding them is an
`src` swap — there is no CSS toggle.

    about-studio-source.jpg       2560x1707   no guides at all
    about-studio-wall-guides.jpg  1800x1200   WALL + FLOOR quads
    about-studio-wall-only.jpg    1800x1200   WALL quads only      <- current

⛔ **ALL THREE ARE 1.500 FRAMING** (2560/1707 = 1.4997, 1800/1200 = 1.5000), so the crop is
identical whichever is served and **no card placement moves.**

⚠ **The walls-only file was not authored today** — it is
`brand-assets/about-studio-wall-cards-1800.jpg`, the plate CA/CB were transferred FROM, copied into
`public/`. ⛔ **Confirmed by COLOUR SEGMENTATION, not by its filename:** cyan 5155 / magenta 4778
above the midline, green 1 / purple 0 below. **A filename is not evidence.**

⚠ **`about-studio-wall-guides.jpg` STAYS** — it is the only record of the measured FLOOR quads, and
`GUIDE_CD`/`GUIDE_CS` were segmented from it.

⚠ **`WallCardText` is COMMENTED OUT** with its import retained behind a suppression — Carl:
*"temporarily remove the text."* Restoring it is one uncomment.

---

# ⛔⛔ WHAT IS IN FRONT OF YOU

## ⛔⛔ CARL'S ORDER FOR THE NEXT SESSION, STATED 14 SEPTEMBER

> *"The wall cards are relatively easy, also with the text. After that — the frosted glass material
> and the background for it."*

| # | subject | note |
|---|---|---|
| **1** | **CA and CB — the wall pair, WITH their text** | Carl: *"relatively easy."* The cyan and magenta quads are on the plate as the reference, and the floor guides are gone so nothing competes |
| **2** | **The frosted glass material** | ⛔ **CHUNK 2.** Still unauthorised at the time of writing — and the frosted-vs-satin question below is OPEN and Carl's |
| **3** | **The background for the glass** | ⚠ This is the **transmission proxy**, and Carl already ruled on its shape — see §"WHAT THE GLASS SEES" below |

⚠⚠ **THE FLOOR PAIR'S COPY IS NOT IN THAT LIST, AND THAT IS A CHANGE OF ORDER.** Earlier on
14 September the stated sequence was *"insert the text. If it doesnt fit we will raise the height of
the cards"* against four tests — copy fits · proportionate to the desks · proportionate to the wall
cards · scene balanced. ⛔ **The wall pair now comes first.** The floor copy and the height question
are still live, just later. **Do not read the four tests as dropped.**

## ⛔ THE FACE IS SETTLED. THE TEXT IS NEXT.

**The face question closed on 14 September after SIX formulations.** Both floor cards now run one
blueprint: real curved geometry, `(1-x²)(1-y²)`, at **Carl's crown of 0.073** — set by his eye on
the bench under a swept light, in side and top elevation.

⛔ **CARL'S STATED ORDER, AND STEP ONE IS DONE:** *"insert the text. If it doesnt fit we will raise
the height of the cards"* — against four tests: **copy fits · proportionate to the desks ·
proportionate to the wall cards · scene balanced.** ⚠ *"One step at a time. Angles first."*
**Angles are finished. The copy has not been inserted.**

## ⚠⚠ THE CROWN IS 0.073 AND THAT FIGURE CARRIES A LESSON

    0.015     6.09mm    max tilt 4.03°
    0.025    10.15mm    max tilt 6.69°    the outside recommendation's start
    0.073    30.00mm                      <- CARL'S, by eye

⛔ **NEARLY THREE TIMES THE RECOMMENDED STARTING POINT.** The outside advice said 0.015–0.03
*"rather than making it obviously curved"*, and the Builder opened there. **Judged properly — swept
light, profile views — it wanted far more.** The conservative figure was too timid for a card this
size in a dark room.

⚠ **A value that deep is only affordable because of the quartic.** Each factor vanishes on its own
axis, so the edges are zero **however high the centre goes** — the seam cannot reopen at any
curvature. Every earlier formulation bought its seam with face area and could not have taken this.

## ⛔ THE NORMAL-MAP ROUTE WAS TESTED AND CLOSED

**CS briefly carried a flat mesh with a convex normal map** — the alternative an outside
recommendation proposed. Carl tested it on the bench under the sweep: ***"NO change. CD is the way
to go."***

⚠⚠ **IT WAS BUILT CORRECTLY AND STILL DID NOTHING.** The texels genuinely encoded a dome (R channel
66..189 against 128 for flat), the material binding was right, and **missing UVs were found and
added** — the face geometry had never had a `uv` attribute at all, so every fragment sampled texel
(0,0). It stayed inert after all three were fixed.
⛔ **LIKELY CAUSE, UNPROVEN:** `meshStandardMaterial` wants a `tangent` attribute for a
tangent-space normal map and this geometry has none. **Not chased — CD had already won.**

⛔ **THE MACHINERY IS DELETED** (`065e9e9`, 158 lines). The failure is recorded at the bench's
`Treatment` type. ⚠ **THE UVs ARE KEPT AND ARE NOW LOAD-BEARING** — chunk 2's baked copy needs
exactly that rectangular mapping.

⚠⚠ **AND A BUILDER ERROR WORTH INHERITING: the profile test was never meaningful for a flat mesh.**
A plane is a straight line in top and side elevation at ANY crown value. That is construction, not a
finding — and it was proposed as the discriminator between the two treatments.

---

# ⛔⛔ SIX FACE FORMULATIONS. FIVE REJECTED ON SIGHT.

**⚠ Read this before proposing a seventh. Every one of these verified clean and was still wrong.**

| # | model | why it failed |
|---|---|---|
| 1 | superellipse norm + `OVAL_EXPAND` | met the bevel **only at the 4 corners**, hung 16.05mm elsewhere |
| 2 | per-direction re-normalisation | closed the seam, **rewrote both whole faces**, diagonal creases |
| 3 | 15% seam band | closed the seam, **ate ~28% of the text area** at 52° slope |
| 4 | tent-pole membrane (max-norm) | **rectangular contours ⇒ diagonal ridge**, visible creases |
| 5 | Q+A separable form + plateau | *"theres a lump in the middle and flat bits"* — the plateau WAS the lump |
| 6 | **quartic `(1-x²)(1-y²)`** | ⛔ **WON.** No seam, no crease, no flat region, 100% text area. **Both cards run it at Carl's crown of 0.073.** |

⛔ **THE TRAP ALL FIVE FELL INTO: they traded the SEAM against the TEXT AREA.** Close the gap by
bending the surface down to the bevel and you spend face area doing it. **The quartic makes no
trade — each factor vanishes on its own axis, so edges are zero at ANY curvature.**

⚠⚠ **THE PLATEAU IS A STRIP FEATURE AND DOES NOT TRANSFER.** On the Q+A card (3.89:1) it reads as a
cylindrical roll. On a 2.19:1 face the flat region is wide in BOTH directions and reads as a panel
with a bulge. **Re-deriving 0.72 → 0.502 only tuned how wide the lump was.**

⛔ **ALL SIX SURVIVE IN `about-card-mesh.tsx`** with each failure recorded at the line where it
lived. `CORNER_NORM`, `ABOUT_PLATEAU_U` and `profile` are retained, suppressed and documented —
**they are the record of what does not work.**

---

# ⛔⛔ THE STAGE/PLATE TRAP — IT CORRUPTED EVERYTHING FOR HOURS

**`/proto/wall` renders the plate `object-cover` in a stage of aspect 1906/905 = 2.1061. The plate
is 3:2 = 1.5000.** Cover on a wider box matches the WIDTHS and crops top and bottom, so **the tool
shows only the middle 71.222% of the plate's height.**

⛔ **EVERY NUMBER IN `INITIAL_RAIL` IS A FRACTION OF THAT WINDOW, NOT OF THE IMAGE.**

    y_plate = 0.14389 + y_stage * 0.71222        x is unchanged

⚠⚠ **Feeding stage fractions to a plate-space function put the rails across the room and every card
metres out of place — while the arithmetic reported "EXACT, 0.00000px".** The check and the bug
shared the same wrong input space, so it could never fail.

⛔ **THE GUIDE RECTANGLES ARE NOT AFFECTED** — `GUIDE_CD`/`GUIDE_CS` were segmented directly from
the plate image and are already in plate space.

⚠ **UNASSERTED:** nothing checks the tool's stage aspect is still 1906/905. **It is a settable
input. Change it and the conversion silently becomes wrong.**

---

# ⛔ WHAT IS BUILT AND VERIFIED

## Placement — both cards, exact

| | CD | CS |
|---|---|---|
| anchor | bottom-**RIGHT** corner on PL's **B** handle | bottom-**LEFT** corner on PR's **A** handle |
| reprojection error | **1.11e-16** (0.0000 px) | **1.11e-16** |
| yaw | 122.80° rail → **32.80°** face | 31.47° rail → **301.47°** face |
| size | 817 × 406 mm | 789 × 392 mm |

⚠⚠ **THE MIRROR IS LOAD-BEARING.** CD anchors right, CS anchors left, so **both grow AWAY from the
room's centre.** Centring both on their midpoints overlapped them by 16% of the plate.

⛔ **THE HEIGHTS ARE SOLVED, NOT CHOSEN:** 406mm and 392mm are the heights at which each card,
standing on its rail, subtends exactly its guide rectangle's on-screen size. ⚠ **An earlier 860mm
came from a FACE-ON fit at the front of the frame and made the cards 1730mm wide — wider than the
desks.** Size and position were taken from unrelated sources.

## The yaws corroborate Carl's account of the rails

    RL (green, left desk)   123.88°
    PL (blue,  left card)   122.80°    <- 1.08° from RL. The extrapolation holds.
    RR (amber, right desk)   26.16°
    PR (pink,  right card)   31.47°    <- 5.32°, matching the right desk's recorded 5.4° turn

⚠⚠ **A SIGN ERROR IN THE PITCH ROTATION FIRST PRODUCED 146.26° FOR THE SAME PAIR.** Caught ONLY by
testing both conventions against Carl's recorded 84.3°. **Verify a derived angle against a known
one before using it.**

## Also done

- ⛔ **The four card quads DELETED from `/proto/wall`**, rails kept — Carl's instruction.
- ⛔ **The guides plate swapped for the clean one.** `about-studio-wall-guides.jpg` is **KEPT in
  `public/`** — it is the only record of the measured quads and `GUIDE_CD`/`GUIDE_CS` came from it.
- ⚠ **`WallCardText` now floats on a bare wall** — its copy was positioned inside the painted quads.
  **Not a fault to fix; the wall pair is a later chunk.**
- ⛔ **The §5a note exists**: `live-work/structural-decision-note-about-canvas.md`. ⚠⚠ **IT WAS
  NEVER ROUTED TO THE ARCHITECT.** The canvas was built on Carl's direct instruction; the skip is
  recorded in the canvas file and the page import.

---

# ⚠⚠ WHAT I GOT WRONG — the pattern, not the list

⛔ **THREE TIMES MY OWN CHECKER MANUFACTURED A RED**, and once it manufactured a green:

| | |
|---|---|
| **false green** | "EXACT, 0.00000px" while cards sat metres wrong — **the check shared the stage/plate bug with the code** |
| **false red** | a "19px / 36px round-trip error" — compared a **3D midpoint** against a **2D midpoint**, genuinely different points under perspective |
| **false red** | "FLAT REGION PRESENT" — the scan included the **boundary row**, which is correctly flat |
| **false red** | "GAP" on the quartic — the probe included an **interior point** in a list of perimeter points |

⚠⚠ **WHEN MY ARITHMETIC AND CARL'S SCREEN DISAGREED, THE SCREEN WON EVERY TIME.**

⛔ **AND TWICE I EXCEEDED A NARROW INSTRUCTION.** *"Just fill in the gap"* became a rewrite of both
faces; *"just where it meets the bevel"* became a band eating 28% of the text area. **Carl:
*"i did not say change the left card. i did not say change the whole geometry of the face."***

⚠ **THREE COMMENTS WERE WRITTEN AHEAD OF THE WORK** and corrected in place — including one claiming
geometry had replaced the deleted quads when nothing had.

---

# ⛔ WHAT THE NEXT SESSION SHOULD NOT DO

- ⛔⛔ **Do not reopen the face.** It is SETTLED — the quartic at 0.073, both cards, judged by Carl
  on the bench. ⚠ Six formulations were tried and the table above records why five died. **A
  seventh needs Carl's word, not a better idea.**
- ⛔ **Do not judge a face profile on `/about`.** One fixed light, one fixed camera. **Use the
  bench** — that is where the crown was finally settled and it is the lesson of the whole day.
- ⛔ **Do not re-test the normal map.** Built correctly, bound correctly, UVs added, still inert.
  **Closed on Carl's word.**
- ⛔ **Do not read `INITIAL_RAIL` numbers as plate fractions.** Convert them.
- ⛔ **Do not re-derive the camera.** Solved, falsified at 0.6°.
- ⛔ **Do not delete `about-studio-wall-guides.jpg`** — it is the provenance of `GUIDE_CD`/`GUIDE_CS`.
- ⛔ **Do not add `clearcoat` or change roughness.** Chunk 2 is unauthorised; the material is the
  grey diagnostic by instruction.
- ⚠ **Do not "fix" `WallCardText` floating.** Known, and the wall pair is a later chunk.

---

# ⛔⛔ WHAT THE GLASS SEES — Carl's ruling, and item 3 lands on it

⚠⚠ **THE ROOM IS A PHOTOGRAPH OUTSIDE THE CANVAS.** A WebGL card can only refract objects in its
OWN scene. `answer-card-geometry.ts` records the lesson: ***"The frost was never the problem; the
absence of anything worth seeing through was."***

⛔ **CARL'S ANSWER: A PROXY BEHIND EACH CARD, NOT THE PLATE IN THE SCENE.** Putting the 459KB image
in as a texture would bypass `next/image` and reinstate the exact regression D-075 removed.

**The walls are simple** — a flat sampled rectangle. CA `#182733`, CB `#192a35`.

⛔⛔ **THE FLOOR PAIR IS NOT, AND A FLAT RECTANGLE IS WRONG THERE.** Carl: *"the floor cards are a
little more difficult. Whatever is seen through the cards when put in position will have several
colours. For example, the left card. There will be floor, black and silver of the chair, white
skirting and wall."*

⚠ Those stack as roughly **horizontal bands**, and frosted glass preserves exactly that scale of
structure while destroying everything finer. ⛔ **So each floor card gets a small vertical gradient
— a few colour stops at measured heights — not one hex.**

⛔ **THE METHOD IS CARL'S AND IT IS SEQUENCED:** *"a way to do it when they are moved is to note
their position and the pixels they are covering will act as a guide. We will see how it looks when
first built and positioned and tweaked if neccersary."*
⚠⚠ **NOTHING IS SAMPLED UNTIL THE CARDS ARE ON THEIR RAILS — AND THEY NOW ARE.** That precondition
is met, so the sampling can proceed.

⚠ **CD AND CS GET INDIVIDUAL BACKGROUNDS.** Not just different means — different CONTENT. CD has a
chrome chair base and lit floor; CS has the dark desk column and the plant. ⛔ Reusing one gradient
reproduces the pale-slab fault one level up. **CS is roughly twice CD's luminance.**

⚠⚠ **THE STANDARD IS "SELL THE ILLUSION", NOT REPRODUCE THE ROOM.** Carl: *"the user will see whats
outside, the floors, left side of skirting etc, the human brain has an amazing way of filling in the
blanks when there is some context."* ⛔ The proxy only has to be plausible where it is occluded.

⚠ **`PROXY_CONTRAST` is the dial**, 0 = the sampled truth. ⛔ Judged by eye — *"We will play it by
ear, or in this case — by eye."*

⚠ **MEASURED AND UNRESOLVED:** after a heavy blur both floor regions go essentially FLAT. The bands
are the answer to that, but whether they read as depth or as wallpaper is unproven — a gradient has
no parallax. **If it reads flat, the next step is a few planes at different depths.**

---

# ⚠ STILL OPEN AND CARL'S

1. **Which face treatment** — real geometry or normal map. **To be judged on the bench.**
2. **Frosted or satin.** D-051 is satin; the file named *glass* holds satin.
3. **§2's final aspect and fit mode.** `object-cover` would clip CB and shift every card.
4. **Equal trim in the room, or equal trim on screen?**
5. **Duty cycle before periods** for the neon timing.
6. **`prefers-reduced-motion`** — unhandled, belongs with the timing mechanism.

⚠ **AND THE TEXT HAS NOT BEEN INSERTED.** Carl's order: *"insert the text. If it doesnt fit we will
raise the height of the cards"* against four tests — copy fits, proportionate to the desks,
proportionate to the wall cards, scene balanced. **Angles first was step one and it is done.**

---

*Written 14 September 2026. **Both cards stand on their rails at the solved camera, corners exact to
1.11e-16.** ⚠⚠ The face profile is the one thing six attempts could not settle, and the next step is
Carl's eye on the bench — where the light sweeps.*
