# Session Handoff — 6 August 2026

**Written at the end of the lockup-removal / cross-section-rebuild session.**

**Read this first, then `project-intelligence/` as normal.** Chat history is not canonical (D-006).
**Delete this file at the end of the session that reads it, once its replacement is written** —
`live-work-protocol.md` §3a.

---

## ⛔ THE STANDING DIRECTIVE

**NEVER comment on how long Carl has been working.** Do not mention the time of day, suggest
stopping, wrapping up, resuming tomorrow, or ask whether to carry on. **Carl decides when a session
ends and will say so.** It was not broken today.

---

## THE HEADLINE — the card was missing pieces, and every approval before today was given against an object that was never rendered

**Carl:** *"approved geometry are meaningless now because i was approving things built on what i
thought was there."*

**The card was three disconnected objects.** A rim tube, a bevel stub rising from it, and a face
mesh floating **5.00 units behind the bevel's inner edge with nothing modelled across the gap.** The
face's apex sat **0.90 BELOW the rim's apex**, so the interior could never catch light across its
top. Carl drew what the renderer actually contained — two tubes, two bevel stubs pointing at
nothing, and a dome floating free — and it was exact.

⚠ **IT SURVIVED BECAUSE THE MATERIAL HID IT.** Carl: *"parts dont exist and its difficult to tell
whether something exists in total darkness and no light can illuminate something that is not
there."* A dark transmissive card looks identical whether a surface is present or absent. **An
entire session of lighting work — light level, direction, type, roughness, clearcoat, backlighting —
was spent tuning illumination for geometry that was missing.**

⚠ **AND THE DOCUMENTATION MADE IT HARDER TO CATCH, NOT EASIER.** The "recessed, never proud"
decision was taken by the Builder under delegation, written up with four confident reasons, and then
read as settled because it was in a governance file. **Reason 2 was inverted** — it argued a proud
face would obstruct the filament, when Carl's actual requirement is that the face be proud
*precisely so it acts on* the other surfaces.

---

## Where things stand

**Repo: `main`, head `fc27418`, UNCHANGED — nothing was committed today.** `npx tsc --noEmit`
clean; lint at the recorded baseline (`1 problem (1 error, 0 warnings)` — the known
`enquiry-opening.tsx` reduced-motion effect).

⚠ **THE WORKING TREE IS LARGE AND NONE OF IT IS APPROVED.** Eight modified files, one deletion,
one new page, twelve new verify scripts.

⚠ **`chunk-scope.json` IS STILL DELETED — the repo is FAIL-OPEN.** Unchanged for a third day.

⚠ **The dev server was left running.**

---

## ✅ What was finished

### 1. The c2b DESIGN lockup — REMOVED on Carl's decision

*"Is it necessary? No. Is a resting state and hover state necessary. Yes."*

**Gone:** `answer-card-mark.ts` (deleted), `drawBackdrop` and the whole canvas-drawing path, the
four-zone blue/teal colour system, `useRegionShift`, `useLockupFade`, `useBackdropRedraw`, and beat
six's three timing constants. `AnswerCardBackdrop` is now the ground plane alone.

**Kept deliberately:** `CARD_BOXES`, `GRID_WIDTH_PX`/`GRID_HEIGHT_PX`, `GROUND_COLOR` — all
load-bearing for the cards, not the lockup. **The ground plane stays**: without an opaque object
behind the cards, `renderTransmissionPass` clears the transmission target to WHITE.

**The entrance is five beats now.** `ENTRANCE_END_MS` re-derived from the ladder: **6330 → 4890**.
It is imported by `enquiry-opening.tsx` to keep the contact field's WebGL warm-up out of the card
ladder — that guard is still needed, still correct, and now releases ~1.4s earlier.

**The predicted risk landed:** with a flat ground the cards read as dark slabs. That is recorded at
`GROUND_COLOR`, which is the one-line lever if it needs addressing.

### 2. The cross-section — REBUILT. Carl confirmed by eye

**Carl:** *"Before the light was centered i could already tell the geometry was looking right. Now
it confirms it."*

| | before | after |
|---|---:|---:|
| bevel width | 4 | **0 — removed** |
| gap at the seam | **5.00 units** | **none — the concept no longer exists** |
| face rises from | z = −3.40 (a pit) | **z = 0, the rim's own base** |
| face apex | z = 1.10 (0.90 BELOW the rim) | **z = 4.00 (2.00 PROUD)** |
| face height ratio | 0.708 | **0.833** |
| face tilt | 13.6° | **17.4°** |

**The bevel went on Carl's instruction:** *"a bevel may not be neccersary at all. the face can rise
from the bottom of the rim/filament, its so small on screen anyway."* At 4 units on a 48-unit card
it was ~4 screen pixels — a sixth of the height spent on a facet too small to read, while creating
the discontinuity that made the face look like a separate object.

⚠ **THE TARGET WAS THE CSS CARD'S IMPLIED GEOMETRY**, not the sketch literally. Carl: *"whats
important is its the same implied geometry as the CSS version."* `.enquiry-card` describes ONE
continuous form — a shoulder turning inward on all four sides, interior rising out of it, no seam.

⚠ **THE TILT GUARD CAUGHT A VALUE THAT LOOKED FINE.** `FACE_PROUD_OF_RIM` 1.0 produced a face tilt
of **13.3°, below the 16° minimum** — because removing the bevel made the face WIDER (half-span
17 → 20), so the same rise spread over a longer run is a shallower curve. **Two safe-looking changes
interacted.** 2.0 was chosen off the arithmetic, not by eye.

### 3. The lighting system — BUILT AND SAVED

`?clay=1` renders the form instead of the material: opaque plastic, white face, one moving light,
shadows on, no global illumination.

| Constant | Value | Note |
|---|---:|---|
| `CLAY_SWEEP_MS` | 45000 | slow is load-bearing, see below |
| `CLAY_ARC_RADIUS` | 58 | clears the card without towering over it |
| `CLAY_ARC_TILT` | 0.5 | leans the arc toward the viewer |
| `CLAY_LIGHT_EXPOSURE` | 2.5 | **measured, not guessed** |

**The arc is centred on each card, not the scene** — and getting that wrong is what Carl caught:
*"the shadows that appear on the left side and right side should be equal, theyre not."* The arc was
symmetric all along; **the fault was where it was centred.** Card 1 sits at x = −194.67, so an
origin-centred arc passed 195 units to its right.

**Exposure was guessed and missed three times** (2.4 blew out; 0.55, 0.62, 1.35 too dark) before
`verify/clay-exposure.mjs` measured it. 2.5 is the highest value that does not clip.

**All five cards now carry the same vertical arc** — card 2's case, on Carl's closing instruction.

---

## ⚠ THE NEXT CHUNK — DECIDED, NOT STARTED

> **Carl:** *"an unexpected bonus is that even though the speed of the light is slower, it brings
> out the 3d geometry. If we are looking for a hover state, we may have found an answer, or at least
> something we can work with."*

**THE MOVING LIGHT IS THE CANDIDATE HOVER MECHANISM.** Not a brightness change.

⚠ **AND IT SIDESTEPS A MEASURED DEAD END.** The rim was measured at **72% of its reachable
maximum** and the face at **38%** — a brightness-based hover had little room. A moving light needs
none: what changes is *which surfaces are lit*, not how bright the card is.

### What Carl specified

**Resting:** the same light, **static, in front of the card, lower intensity**. Each card gets its
own ambient. *"that will provide each card with its own ambient light."*

**Hover:** the light **moves, with a little more intensity**. The arc rotates **90° toward the
viewer** — front → up over the top → back down past the front → under, looking up at the card. *"It
only has to go just a little behind the card."*

**Per-card arc tilt — the four corners.** Carl's diagram: *"Card 2 is its own. Cards 1+3 mirror
images as are 4+5... as card 2 is its own, there are 4 cards left with 4 corners."* Card 2 sits on
the grid's centre line so its arc is vertical; the other four lean along their own diagonal toward
the nearest corner. **Only the light positions need moving — all five arcs are already built.**

⚠ **DERIVE THE TILT FROM GRID POSITION, DO NOT HAND-SET IT.** Same principle as the lockup's
four-zone colour system: position decides, not a table. A Builder started this and Carl stopped it —
it is next session's work, not today's.

**He also flagged:** *"i suspect we may have to bring the boxes in a little bit to light most of the
face"*, and *"there must be a balance against the filament. we do resting and hover and tweak the
filament."*

### ⚠ Open questions the Builder raised and Carl has NOT answered

- **Does the hover light loop or run one pass and settle?** A loop risks becoming ambient motion,
  which this project has deliberately avoided.
- **What happens on unhover** — fade, finish the pass, or snap back?
- **How does hover read against selection?** The filament is also a light. Two light events on one
  card must be distinguishable or hover reads as weak selection.
- ⚠ **PERFORMANCE IS UNMEASURED.** The shipped canvas runs `frameloop="demand"` precisely to avoid
  continuous rendering. Five cards with animated hover lights is a different profile. Not a blocker
  — the contact field already runs an orbiting light — but **measure before shipping, not after.**

---

## ⚠ Open, and unresolved

- **The filament light now sits very close to the face.** It is at z = 6; the face's apex moved from
  z = 1.10 to **z = 4.00**. Carl saw the result on the clay render: *"i clicked the card, what is
  the dot in the middle?"* — the point light reading as a hotspot. `FILAMENT_LIGHT_HEIGHT` says to
  *"confirm the light stays clear of `faceBaseZ` and the rim tube as z rises"*; **that check now
  needs redoing because the FACE moved, not the light.**
- **Should the filament fire at all in the clay study?** It contaminates a one-light form render.
  Not decided.
- **The glass material is untouched and unjudged since the rebuild.** Everything today was seen in
  clay. `?clay=1` off returns the shipped glass card — **nobody has looked at it on the new
  geometry.**
- **`GLASS_CLEARCOAT` was added and defaults to 0** — inert. The frost/coat grid found roughness is
  the real lever and **clearcoat barely earned its shader cost** on our flat ortho face. Not
  removed, because it was never judged on the REBUILT geometry.
- **The ~2.9s cold opening wait** — Carl has never judged it.
- ⚠ **SHADOW.** Still parked. The clay study proves how much it adds; the Architect's advice stands
  — five shadow-casting point lights behind transmissive materials is thirty passes a frame. Buy the
  grounding with a contact/AO term in the face shader instead.
- ~~`app/cards-reference/`~~ — **DELETED at Carl's instruction the same session**, never committed.
  It rendered Q4's CSS cards as a form reference because the live corridor cannot reach Q4. Its job
  is done: the implied geometry it was there to demonstrate is now built. **If it is ever wanted
  again the markup is in git at `c7afca3`** — do not reconstruct it by hand.

---

## ⚠ Two Builder errors worth inheriting

**1. A shell rewrite corrupted a source file.** `Set-Content` was used twice for edits the Edit tool
should have made, and PowerShell re-encoded the whole file: **691 mojibake sequences**, every `⚠`
becoming `âš`. **It still compiled**, which is what made it dangerous — the damage was confined to
comments and read as noise. Fully repaired (`verify/fix-mojibake.mjs`), zero remaining across every
enquiry file. **Never pipe a source file through a shell rewrite.**

**2. A cached file read produced two wrong diagnoses.** The form sheet appeared byte-identical
across three constant changes; the Builder concluded the build was stale, then that the harness was
phase-locked. **Both wrong — the file had been updating all along and the read was cached.** Copying
to a fresh filename settled it in one step. **When output looks impossibly unchanged, check the read
before theorising about the write.**

---

## How Carl worked today

- ⚠ **HIS DRAWINGS SETTLED IN ONE GLANCE WHAT PROSE HAD FAILED AT FOR SESSIONS.** Four sketches, each
  correcting a misreading. **Ask for a drawing earlier.**
- ⚠ **HE READS GEOMETRY OFF A RENDER FASTER THAN THE INSTRUMENT DOES.** The dark patch on the bottom
  face, the unequal shadows, the separate object in the middle — all caught by eye first.
- **He questions premises, and the premise is usually the problem.** The lockup, the bevel.
- **He asks for the principle before deciding**, and wants reasoning, not a recommendation.
- **No ASCII diagrams or box-drawing characters.**
- **Do not commit or push unless he explicitly asks.**

---

## How to look at it

```
http://localhost:3000/start                the shipped glass card, five cards
http://localhost:3000/start?clay=1         THE FORM STUDY — plastic, white face,
                                           moving light, shadows, all five cards
http://localhost:3000/start?cardrig=1      [1-6] geometry, [7-9] glass/light, [r] rim rough,
                                           [m] metal, [f] filament, [d] cutoff, [p] spill,
                                           [z] light height, [b] glass filter,
                                           [c] face clearcoat, [v] coat roughness, [0] print
?roughness= ?light= ?coat= ?coatr= ?exposure= ?tinge= ?fz= ?fp=
```

⚠ **MEASURE HEADED, WITH `--enable-gpu`, AND PRINT THE RENDERER STRING.** Headless substitutes
SwiftShader. Confirmed real: `ANGLE (AMD Radeon(TM) Graphics, D3D11)`.

**New harnesses:** `cross-section.mjs` (draws the card's profile — **run this before trusting any
geometry claim**), `clay-form.mjs`, `clay-exposure.mjs`, `clay-arc-symmetry.mjs`,
`probe-clay-motion.mjs`, `light-ladder.mjs`, `brightness-headroom.mjs`, `card-modelling.mjs`,
`frost-and-coat.mjs`, `lockup-removed.mjs`, `fix-mojibake.mjs`.

---

## ⚠ The session's lesson

**A described object and a built object diverged for several sessions and no instrument caught it.**
The lighting harnesses were all honest and all beside the point — they measured a card that was
missing its seam. **`verify/cross-section.mjs` now draws the profile as a line; run it before
tuning anything that depends on the form.** Carl's pencil sketch did in one glance what prose could
not, and a drawing is cheaper than an approval given against the wrong object.

---

*6 August 2026. The lockup is out, the cross-section is rebuilt and confirmed by eye, and the
lighting system is saved. All five cards carry card 2's vertical arc; moving the other four lights
into their corners is the next chunk. The glass material has not been seen on the new geometry.*
