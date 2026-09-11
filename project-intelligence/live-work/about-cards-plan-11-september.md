# /about §2 — the four role cards in Three.js

> ⛔⛔ **THE PLAN AS SUBMITTED TO THE ARCHITECT, 11 September 2026. COPIED INTO THE REPO SO IT
> SURVIVES** — it was written to a machine-local path outside version control, where it would have
> been the only copy of the design brief and would not have lasted.
>
> ⚠⚠ **IT CONTAINS KNOWN ERRORS AND IS KEPT ANYWAY.** The Architect found five claims that do not
> survive a file check — **`answer-card-geometry.ts` is NOT protected**, the right desk was
> over-claimed as measured, `INITIAL_RAIL` contradicted itself, "frosted glass" names a superseded
> decision (D-051 is **satin**), and the CD/CS acceptance test is wrong. ⛔ **Read
> `architect-plan-response-about-cards.md` ALONGSIDE THIS, NEVER THIS ALONE.**
>
> ⚠ **Also superseded by the build that followed it:** the plateau crown model, and the claim that
> trim is "near-constant" — it grows **sub-linearly**. See `about-card-geometry.ts`.
>
> **Kept because it carries Carl's design specification of 11 September — neon, the Fusion glow
> mask, and the 5/4 timing model — which exists nowhere else in this repository.**

## Context

`/about` §2 is a photograph of a studio. Four role cards stand in that room: **CA**
and **CB** on the two walls, **CD** and **CS** upright on the floor behind the chairs.

**What is settled and was not before this session:**

- The camera is solved — f = 1282px, 89.9° hFOV, pitch 12.69° down, falsified
  independently at 0.6° (`live-work/camera-solve-11-september.md`).
- The room is measured — left desk flush with its wall, right desk turned ~5°, the
  desks 84.3° apart. Floor rails recorded in `INITIAL_RAIL` (`app/proto/wall`).
- **The design is now specified** — Carl, 11 September, in conversation. Recorded
  below because none of it exists in the canonical files yet.

⛔ **This plan's FIRST deliverable is the §5a structural note, owed since 5 September.
Nothing is built until Carl says so.**

---

## ⛔ THE DESIGN, AS CARL SPECIFIED IT — 11 September 2026

**Recorded because it is new and exists nowhere else.** The Architect is evaluating
this, not only the structure.

### The form, abstractly

> *"A shape that has a rim, bevel and curved face. The corners can be the same. A
> corner is a corner no matter what the dimensions."*

⛔ **RIM, BEVEL AND CORNER RADIUS ARE NEAR-CONSTANT TRIM — they do not scale with the
card.** Carl: *"in the q+a cards proportion of the rim and bevel shouldn't be scaled
up... we need face real estate for the text."* Scaling them proportionally costs the
face the area the copy needs. The card's outline is free; its trim is not.

⚠ **So family resemblance is CONSTRUCTION AND CONSTANT-SIZED PARTS, not ratios.**
Two objects belong to the family if built the same way from the same-sized parts,
however different their outlines.

⛔ **The bevel returns.** `BEVEL_WIDTH = 0` on the answer cards because 4 units on a
48-unit card was a sixth of its height for a facet too small to read. On a card
several times larger, held near-constant, that argument does not transfer. Carl:
*"bevels and light shone from the right direction create shadows and emphasize
geometry."*

### ⛔⛔ NEON — the rim's treatment

> *"What works well with frosted glass and would have an impact? Something in an
> office or home environment? Neon."*

⚠⚠ **THE HALF-TUBE RIM IS ALREADY A NEON TUBE.** The answer card's rim is a half-tube
swept along the perimeter precisely so it *"will emit light onto the bevel and face,
and if it's making a journey down the right hand side it will affect the 2 card"*
(Carl, 3 August). The geometry was built for this before the word was used.

⛔ **IT MUST NOT OVERPOWER.** Carl: *"the effect should be subtle. Just enough to
confirm the 'same world' idea."* Reference images supplied 11 September: a modest
even tube, no blown-out core, light falling off fast — a local event, not room
lighting.

⛔ **THE ROOM IS ALREADY LIT — DO NOT ADD A GLOBAL LIGHT.** Carl corrected this
directly: *"You're assuming that a white global light is going to be used."* The
white ceiling above the wall cards and the pale floor below the floor pair are **in
the photograph**; they are what RECEIVES the neon spill, not something to light.

⚠ **Individual coloured lights may be aimed at the cards** — Carl, and *"remember the
secondary effects. Cards have a proximity to each other."* ⛔ Four glass objects each
throwing light onto the others is the thing only a real 3D scene gives; CSS had to
hand-author it with a per-index lookup (`GRID_REFL`).

### ⛔⛔ THE FUSION GLOW MASK — how the room responds

⚠⚠ **A WebGL object cannot light a photograph. Its light stops at its mesh.** Carl's
solution, and it dissolves the problem rather than working around it:

> *"I can take the image into DaVinci Resolve's Fusion and put subtle glows where I
> want."* — then, correcting a wrong reading: ⛔ ***"no, it can't be baked in Fusion —
> but you can MASK it!"***

**Per-card glow layers, authored in Fusion, composited over the plate, with opacity
driven by each card's live state in Three.js.**

| | |
|---|---|
| **Three.js** | the card itself — rim, bevel, crown, transmission. Live |
| **Fusion layers** | the room's response — ceiling bounce, floor spill. Authored by eye |
| **The link** | card state → layer opacity. Card dark ⇒ its glow is at zero |

⛔ **MATCHING HEX, one value kept in sync between the neon material and the glow
layer.** Carl: *"The hex would have to be the same but the effect should be subtle."*

⚠ **Per-card, not one layer** — the cards illuminate independently, so each needs its
own to rise and fall on its own.

⚠ Likely `screen` / `plus-lighter` blending: a glow ADDS light, it does not replace
what is beneath. ⛔ Unverified — a proposal, not a measurement.

⛔ **THE MASKS MUST SHARE THE PLATE'S COORDINATE SPACE** — same frame, same crop. §2's
aspect-locked `object-contain` wrapper already solves this for the guides.

⛔ **PLATE WORK COMES AFTER POSITIONS ARE LOCKED.** A glow is authored at a fixed
place; a card that moves afterwards leaves its glow behind.

### ⛔⛔ THE SCENE MUST BE ALIVE — the timing model

> *"Our scene needs to be alive."* — *"We could put them on a loop, or mouse
> proximity, or add an element of randomness. Still technically on a loop but
> appearing more random."*

**Carl's mechanism:** *"I'm sure there's a way to have them on/off for 4,5,6,7,8s and
have some formula that with 4 boxes and 5 durations can 'randomise' the whole thing."*

**And his own frame for it:** ⛔ ***"It's like writing a song in 5/4. Every 4 bars
complete the cycle."***

⚠⚠ **NO RANDOMNESS IS REQUIRED — INCOMMENSURATE PERIODS DO IT.** Four cards on coprime
periods produce a composite that repeats only at their LCM:

    periods 5,6,7,8  ->  LCM 840s   = 14 minutes
    periods 4,6,7,8  ->  LCM 168s   = 2.8 minutes

⛔ **4 AND 8 ARE A BAD PAIR** — 8 is a multiple of 4, so those two lock into a fixed
relationship and visibly pulse together. **Coprimality is what buys the length**, and
two similar-looking sets differ five-fold.

⚠ **Phase offsets and unequal on/off times extend it further at no cost** — a card on
5s / off 7s has a 12s cycle rather than 10.

**Why this beats real randomness — three properties:**

- ⛔ **Reproducible.** The same moment always looks the same, so a screenshot is
  comparable and a change is verifiable. Random state cannot be checked.
- ⛔ **No bad states by accident.** Whether all four are ever dark together, and for
  how long, is COMPUTABLE IN ADVANCE rather than discovered live.
- ⛔ **Tunable by ear**, which is how Carl works (D-035, the DAW model).

⚠ **ALL-FOUR-DARK IS A REST, NOT A FAULT.** In the 5/4 frame a rest is written, and a
rest before a downbeat is what makes the downbeat land. The question is how long, how
often, and where it falls — all computable from the periods before anything is built.

⛔ **DEFERRED TO CHUNK 3, ON CARL'S INSTRUCTION:** *"does the neon pop on, fade on or
flicker on? We can sort this out when it's time to do so."* ⚠ Not three styles —
real neon strikes with a stutter and holds; a clean fade is LED behaviour.

⚠ **STILL OPEN, and Carl's:** whether the four are independent voices or some move
together; the exact periods; the colours; whether "lit" is binary or has levels.

---

## ⚠⚠ WHAT READING THE TWO REFERENCE OBJECTS CORRECTED

**Three assumptions made from the constants and refuted by the objects.**

**1. ⛔ THE FACE IS PROUD, NOT RECESSED — and this reverses a documented decision.**
The contact field recesses its face; the answer card does not. Carl overturned it:
*"the highest part of the convex face should sit above the rim to have effect on the
other faces."* ⚠ The old reasoning was **inverted, not merely wrong** — it argued a
proud face would obstruct the filament, when the requirement is that the face be high
enough to ACT ON the other surfaces. A crown sunk below its rim is shaded by it, which
is why the card read as *"an outline around a dark hole."*

**2. ⛔ THE CROWN IS GOVERNED BY SURFACE TILT, NOT HEIGHT.** Measured, in
`contact-field-mesh.tsx`:

| crown | max tilt | result |
|---|---|---|
| 1.2 over a 19-unit half-height | **5.67°** | *"The shadow lived in the last ~6 degrees of a 90-degree sweep."* Carl: *"I cannot tell any face being convex."* **Real, and physically incapable of showing itself.** |
| 5.0 | **22.5°** | shadow forms from ~67°, develops across a quarter of the sweep |

⛔ **THE SCALING LAW: HOLD THE TILT, NOT THE RISE.** A larger card needs a
proportionally larger crown to reach the same tilt. ⚠ And `MIN_FACE_TILT_DEGREES = 16`
is a real guard that already caught a face gone too shallow because an unrelated
change widened it — *"two changes that each looked safe interacted."* On a much larger
card that interaction is MORE likely, not less.

⚠ **The text constraint is compatible, not opposed.** With a broad plateau the tilt
lives in the roll-off band near the rim, not under the copy.

**3. ⛔ THE RIM CARRIES THE OBJECT'S ROLE.** Gold on the contact field (an object you
fill in); a filament on the answer card (yellow→amber→red on selection). Same
construction, different rim. ⚠ The wall cards are **neither — *"not yet, but they will
be"*** — and neon is now that third answer.

---

## Part 1 — The §5a structural note (first deliverable, no code)

To `live-work/structural-decision-note-about-canvas.md`, per
`ai-system/structural-decision-gate.md`, templated on
`live-work/structural-decision-note-card-host-lifetime.md`.

| | recommendation | why |
|---|---|---|
| **canvas count** | **one**, all four cards | `NextStepMeshButton` made eight contexts in a five-question walk. Also the only way one card's light reaches another. |
| **camera** | **perspective**, from the solved photograph | ⚠⚠ **Breaks the 1-world-unit = 1-CSS-px convention** every existing geometry module states as a precondition. Named explicitly — the one thing a reviewer will look for. |
| **lifetime** | mount once, never unmount | D-048 doctrine. Unmount-on-scroll is the NextStepMeshButton defect in a new place. |
| **frameloop** | driven only while §2 is on screen | The answer-card canvas rendered five glass cards at 60fps behind `visibility: hidden` for ~12s. ⚠ But the neon timing runs continuously — **a card's state must advance while off-screen, or it jumps on return.** State and rendering are separate concerns here. |
| **host** | `position: absolute` inside §2, **not** `fixed` | A fixed host forbids `transform`/`filter`/`perspective`/`contain`/`will-change` on every ancestor — the constraint that sank 12 August. §2's aspect wrapper is in that chain. |
| **client boundary** | its own client component | ⛔ `/about` is a **static prerendered server component**, deliberately. `AboutNav` and `WallCardText` were split out to keep it so. |

**Also to cover:** a PMREM cannot be shared between canvases, so `/about` generates its
own regardless of material reuse; and ⛔ **no instrument watches `/about`** —
`verify/one-context.mjs` is hard-coded to `/start` and scoped to one testid.

---

## Part 2 — The build, in chunks

⛔ **geometry → material → light, every object.** Carl's process.

### Chunk 1 — geometry, face-on, on a bench

**Not on `/about`** — a bench route (`app/proto/card/`), per the
`app/proto/nextstep/page.tsx` precedent (*"A BENCH, NOT A ROUTE ANYONE SHIPS"*). Keeps
the §5a gate closed while the shape is proved, and §14a requires proving one object
first.

**New: `components/about/about-card-geometry.ts` + `about-card-mesh.tsx`**

Rim (half-tube), bevel, convex face, rounded corners — trim near-constant, face taking
the remaining area, crown sized to hold ~20°+ of surface tilt, apex proud of the rim.
Proportion ~2:1 from Carl's sketch. ⚠ Sketch is the idea, not the measurements —
*"knocked up in 30s in Microsoft Paint."*

⛔ **Neutral diagnostic material, achromatic rim** — the precedent both objects set, so
nothing pre-empts a material decision not yet made.

⚠ **The bench light must be sweepable by hand.** The geometry is legible only under a
**raking** beam — *"the ends give SHAPE and the middle gives PRESENCE"* — so a fixed
head-on light shows a correct crown as flat and invites the wrong correction.

**Carl judges the shape. No material, no room, no placement, no neon.**

### Chunk 2 — material

`components/about/about-card-glass.ts`. ⛔ **Carl's call whether this reproduces D-051
or unlocks and imports it.** `answer-card-glass.ts` is protected and approved; the
precedent favours independence (*"DELIBERATELY INDEPENDENT OF
`contact-field-geometry.ts`"*) so tuning one cannot move an approved object, while the
record leans the other way on intent (*"a client's frosted glass being THE SAME GLASS
is the point"*).

⚠ **Open and untested:** whether the approved glass carries light **through** from
behind. It was tuned for a front-lit card in a dark corridor.

⚠ **And a constraint that falls out of "subtle":** if the neon is restrained it cannot
be the main thing lighting the face. The transmission has to read at low intensity.

### Chunk 3 — the neon and the timing

Rim as light source, the period model above, and pop/fade/flicker decided by eye.
Reference: `contact-field-light-rig.tsx`'s pattern of a **deletable instrument gated
behind a query param** in its own file.

⛔ **EXPOSURE, NOT INTENSITY** — `intensity = EXPOSURE × d²` per frame, proved in both
existing objects. A fixed intensity *"blew out the near angles and lost the far ones
entirely — five of eight frames pure white or black."*

### Chunk 4 — placement, then the glow masks

Cards into the room at the solved camera, along the rails, **Carl placing by eye** —
*"I would have to see the cards built in situ... it's about balance within the scene."*
Then positions lock, and the Fusion layers are authored to match.

**Acceptance test:** render, screenshot, compare projected corners against
`INITIAL_FRAC` — Carl's numbers, not the build's own.

⚠⚠ **A CORRECTION THE BRIEF NEEDS.** `wall-card-corners-4-september.md` names its
hand-pinned CA/CB set as the acceptance test. ⛔ **Superseded** — Carl retired them on
10 September (*"the original hand drawn is discarded, the perspective is wrong"*) and
`INITIAL_FRAC` now holds **measured** values, sub-pixel fitted, as fractions of the
1.500 source frame rather than the 2.106 stage. **The old file still reads as current.**

---

## Verification

| | |
|---|---|
| **Every chunk** | `npx tsc --noEmit` clean; `npm run lint` at baseline (`1 problem (1 error, 0 warnings)`); Carl's eye |
| **Context count** | A new page-wide harness for `/about`. ⛔ Must declare what it does NOT watch — `one-context.mjs` passed 2/2 on a build making eight contexts. Run as a no-change control first. |
| **Prerender** | Assert `/about` is still statically prerendered after the canvas lands |
| **Timing** | Compute the rest pattern from the chosen periods **before building** — when all four are dark, how long, how often |
| **Corners** | Projected corners vs `INITIAL_FRAC` (chunk 4) |

⚠ `verify/proven.json` is empty — **no harness pass is admissible** (D-064). A new
harness can produce a believable red; a green proves nothing yet.

---

## Not in scope

Rounded corners on the wall guides (asked about 4 September, never authorised) ·
numeric corner entry (begun unasked once, stopped) · the floor cards' final position
(Carl's, in situ) · any change to `/start` or its approved objects.

## Files

**New:** `components/about/about-card-geometry.ts`, `about-card-mesh.tsx`,
`app/proto/card/page.tsx`, `live-work/structural-decision-note-about-canvas.md`

**Later:** `about-card-glass.ts`, `about-card-canvas.tsx`, a `verify/` harness,
Fusion glow layers in `public/`

**Modified:** `app/about/page.tsx` (chunk 4 only — not protected, deliberately)

**Read-only:** `answer-card-geometry.ts`, `answer-card-glass.ts`, `answer-card-mesh.tsx`,
`contact-field-mesh.tsx`, `contact-field-light-rig.tsx` ⛔ protected; reading is free
