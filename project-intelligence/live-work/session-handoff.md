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

# ⛔ NOTHING IS COMMITTED. HEAD IS STILL `c1d87df`

    M  app/about/page.tsx                    canvas mounted; rails drawn; clean plate restored
    M  app/proto/card/page.tsx               bench labelled CD, placeholder warning
    M  app/proto/wall/page.tsx               the four card quads DELETED, rails kept
    M  components/about/about-card-geometry.ts   guides, rails, yaws, per-card heights
    M  components/about/about-card-mesh.tsx      the face formulations + normal map
    M  components/about/card-bench.tsx           opens on CD
    ?? components/about/about-card-canvas.tsx    NEW — the /about canvas

⚠ **`npx tsc --noEmit` CLEAN. `npm run lint` = `1 problem (1 error, 0 warnings)`** — the documented
`enquiry-opening.tsx` baseline. ⛔ **Zero warnings held all session.**
⚠ **The dev server is RUNNING on :3000.**

---

# ⛔⛔ WHAT IS IN FRONT OF YOU

## ⚠⚠ CARL'S NEXT STEP, STATED: SEE THEM ON `/proto/card`

**14 September, on the two face treatments:** *"its hard to tell at this angle, id need to see them
in the proto card page."*

⛔ **THE BENCH HAS WHAT THE ROOM DOES NOT: a sweepable light and a side elevation.** A crown reads
FLAT under a fixed beam — the bench's own header says so — and `/about` has one fixed stand-in
light and one fixed camera. **Judging a profile there was the Builder's error, repeated for hours.**

⚠ **THE BENCH DOES NOT CURRENTLY RENDER EITHER NEW TREATMENT.** It calls `AboutCardMesh` without
`flat` or `domed`, so it shows the quartic only. **Wiring both onto the bench, side by side, under
the sweep, is the first job.**

## THE TWO TREATMENTS, ONE PER CARD

| | CD (left) | CS (right) |
|---|---|---|
| method | **real curved geometry** | **flat mesh + convex normal map** |
| surface | `(1-x²)(1-y²)` at 2.5% = 10.15mm rise | physically flat |
| seam | zero on every edge, ALGEBRAICALLY | zero by construction |
| text area under 8° | **100%** | 100% (it is a plane) |
| dials | `TENT_POLE_RATIO = 0.025` | `NORMAL_MAP_DEPTH = 0.35` × `normalScale 0.15` |

⛔ **BOTH SOLVE THE SEAM AND BOTH KEEP THE FULL TEXT AREA.** The difference is only how light
behaves: CD's normals genuinely vary, so it shades from any angle and has a real silhouette in
profile. CS fakes it on a plane — cheaper, perfectly flat for text, **but the illusion breaks at
grazing angles and in any true side view.**

⚠ **NEITHER IS APPROVED.** And the lighting they will finally live under does not exist: the rim is
not a light source until chunk 3 and the four aimed lights are unbuilt.

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
| 6 | **quartic `(1-x²)(1-y²)`** | **current on CD.** No seam, no crease, no flat region, 100% text area |

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

- ⛔ **Do not propose a seventh face formulation** before reading the table above.
- ⛔ **Do not judge a face profile on `/about`.** One fixed light, one fixed camera. **Use the bench.**
- ⛔ **Do not read `INITIAL_RAIL` numbers as plate fractions.** Convert them.
- ⛔ **Do not re-derive the camera.** Solved, falsified at 0.6°.
- ⛔ **Do not delete `about-studio-wall-guides.jpg`** — it is the provenance of `GUIDE_CD`/`GUIDE_CS`.
- ⛔ **Do not add `clearcoat` or change roughness.** Chunk 2 is unauthorised; the material is the
  grey diagnostic by instruction.
- ⚠ **Do not "fix" `WallCardText` floating.** Known, and the wall pair is a later chunk.

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
