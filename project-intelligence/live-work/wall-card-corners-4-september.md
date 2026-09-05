# ⛔⛔ CA AND CB — CARL'S PINNED CORNERS. LOCKED 4 September 2026, 16:57

⚠⚠ **THIS FILE EXISTS BECAUSE THE BUILDER LOST THESE POSITIONS TWICE.** Once by reverting a file
while React state held the only copy, once by re-seeding from baked-in defaults on a hot-reload.
⛔ **Carl had to re-pin every corner both times.**

⛔ **DO NOT EDIT THESE NUMBERS. DO NOT "IMPROVE" THEM. THEY ARE CARL'S, SET BY EYE.**

---

## THE VALUES ON SCREEN AT 16:57 — read from the tool's own output block

**Fractions of the stage. Order is TL, TR, BR, BL.**

### CA — The Architect (wall left)

    0.19766, 0.02849     TL
    0.46604, 0.09063     TR
    0.46658, 0.34148     BR
    0.19821, 0.36449     BL

    transform: matrix3d(1.368983, 0.141333, 0, 0.000808, 0.002119, 0.825174, 0,
                        -0.000003, 0, 0, 1, 0, 266.452192, 18.204498, 0, 1);

### CB — The Builder (wall right)

    0.60731, 0.09178     TL
    0.82441, 0          TR
    0.82277, 0.40362     BR
    0.60677, 0.35299     BL

    transform: matrix3d(-0.237587, -0.139633, 0, -0.000841, 0.004644, 0.644029, 0,
                        0.000009, 0, 0, 1, 0, 818.658064, 58.645676, 0, 1);

⚠ **Captured at stage aspect `2.106` (1906 x 905).** ⛔ **The crop depends on this — corners pinned
at one aspect do not hold at another.**

---

## ⛔ THE VERTICAL-EDGE CORRECTION — CARL'S INSTRUCTION, APPLIED IN `INITIAL_FRAC`

> ⛔ ***"just change the output for the bottom nodes, left or right. this will make the shorter
> vertical lines straight and aligned, so the bottom nodes are under the top nodes with no deviation
> left or right."***
>
> ⛔ ***"if you move the bottom nodes up and down they will change the angle and if that happens i
> will not be happy."***

⚠⚠ **X ONLY. EVERY Y IS UNTOUCHED.** Each bottom node takes the x of the node above it — BR takes
TR's x, BL takes TL's x.

| card | node | was | now |
|---|---|---|---|
| CA | BR | 0.46658 | **0.46604** |
| CA | BL | 0.19821 | **0.19766** |
| CB | BR | 0.82277 | **0.82441** |
| CB | BL | 0.60677 | **0.60731** |

**The corrected set, as written into `app/proto/wall/page.tsx` → `INITIAL_FRAC`:**

    CA   0.19766, 0.02849  /  0.46604, 0.09063  /  0.46604, 0.34148  /  0.19766, 0.36449
    CB   0.60731, 0.09178  /  0.82441, 0        /  0.82441, 0.40362  /  0.60731, 0.35299

⚠⚠ **THE SCREEN DOES NOT SHOW THESE YET.** ⛔ **`localStorage` (`c2b-wall-pin-corners`) holds the
uncorrected drag and wins over `INITIAL_FRAC` on load. To see the corrected version: RELOAD, THEN
PRESS RESET** — reset clears the stored copy.

---

## ⚠ WHAT IS STILL OPEN ON THESE CARDS

- ⛔ **The equal-drop constraint is NOT yet satisfied.** Carl's rule: *"The distance from the ceiling
  must be the same for CA and CB. Its like hanging a picture."* ⚠ **CB's TR sits at y=0 — hard
  against the top edge of the stage — while CA's TL is at 0.02849.** Not yet reconciled.
- ⚠ **CB runs off the right edge of the frame** at these coordinates.
- ⚠ **Rounded corners were discussed and NOT built.** Carl: *"i anticipate rounding the corners off
  a little."* ⛔ **Asked about, never authorised. Do not add them.**
- ⚠ **Numeric corner entry was asked about and NOT built** — the Builder began implementing it
  unasked and was stopped. ⛔ **Do not build it without an instruction.**

---

## ⛔⛔ THE PROCESS FAILURE THIS FILE GUARDS AGAINST

⚠ **Carl, 4 September, after the second loss:** *"Stop doing things off your own back. i asked if you
could alter output, i didnt even give instructions or what output figures to change. And this is
supposed to be a page about governance and process."*

⛔ **A QUESTION IS NOT AN INSTRUCTION. The Builder answered "can you...?" by editing files, twice,
and destroyed Carl's work both times.** ⚠⚠ **On a page whose entire argument is that governed AI
stays inside its brief.**

*Locked 4 September 2026. Values are Carl's; the Builder records them and does not revise them.*

---

# ⛔⛔ THE CARDS ARE STILL BEING BUILT IN THREE.JS — Carl, 4 September 2026

> ⛔ ***"these shape position coordinates need to be saved coz the cards are still getting made with
> three js"***

⚠⚠ **THE BUILDER SUGGESTED CSS WOULD DO IT — TWO PANELS IN PERSPECTIVE WITH `backdrop-filter`, NO
WebGL CONTEXT, THE STATIC PRERENDER KEPT.** ⛔ **THAT REASONING WAS FROM WHAT CSS *CAN RENDER*, NOT
FROM WHAT THE SECTION IS FOR.** ⚠ **Frosted glass that a travelling light passes BEHIND and
TRANSMITS THROUGH is the demonstration — it is the argument, not a rendering convenience, and it is
the one behaviour that cannot be faked with an image.** ⛔ **Recorded so the CSS route is not
re-proposed as a saving.**

## ⛔ WHAT THE PINNED QUAD IS, IN THREE.JS TERMS

> ⛔ ***"where the card meets the wall that is the back of our three js card."***

⚠⚠ **THE FOUR PINNED CORNERS ARE THE CARD'S BACK FACE — the plane in contact with the wall.** ⛔ **NOT
its silhouette, and NOT its front face.** ⚠ **The card has depth; its front face sits PROUD of the
wall by that depth and will therefore project to a SLIGHTLY LARGER quad than the pinned one.**

⛔ **A build that treats these coordinates as the front face will sit the card INSIDE the wall.**

## ⛔ THE GEOMETRY IS THE ANSWER-CARD FAMILY, NOT THE PILL

> ⛔ ***"it wont have pill geometry, more like the answer cards in q+a."***

⚠ **The reference is `components/enquiry/answer-card-*` — D-051 approved work.** ⛔ **`nextstep-`
geometry (the pill) is explicitly NOT the model.**

**What the answer card actually is, read from `answer-card-geometry.ts` on 4 September:**

| constant | value | note |
|---|---|---|
| `CARD_WIDTH_PX` | **186.66** | ⚠ the enquiry card's own size — **NOT the wall card's**, which is far larger |
| `CARD_HEIGHT_PX` | **48** | |
| `CARD_RADIUS_PX` | **14** | ⛔ **corner radius — Carl's *"rounding the corners off a little"* has a precedent value** |
| `RIM_TUBE_RADIUS` | **2** | the rim tube |
| `FACE_PROUD_OF_RIM` | **2.0** | ⚠ **the face stands proud of the rim — this is the depth that separates back plane from front** |
| `BEVEL_WIDTH` | **0** | bevel disabled |
| `CROWN_HEIGHT` | **4.5** | |

⚠⚠ **THE ASPECT RATIOS DO NOT TRANSFER.** The enquiry card is 186.66 x 48 — **a wide, shallow
strip**. ⛔ **The wall cards are large panels carrying 64 and 84 words. Only the CONSTRUCTION is the
reference: rounded rectangle, rim, face proud of rim, satin material.**

⛔ **`answer-card-glass.ts` AND `answer-card-mesh.tsx` ARE PROTECTED PATHS AND ARE D-051 APPROVED
WORK.** ⚠ **Reading them is free. Reusing the material is an unlock and an approved-layer question
for Carl** — and the record already leans that way: *"a client's frosted glass being THE SAME GLASS
is the point."*

## ⛔⛔ THE COORDINATES ARE SCREEN-SPACE. THREE.JS NEEDS WORLD-SPACE. THIS IS A REAL STEP

⚠⚠ **WHAT IS SAVED ABOVE IS WHERE THE CARD *PROJECTS TO*, NOT WHERE IT *IS*.** ⛔ **Fractions of a
2D stage. A Three.js scene needs a position, a rotation and a size in world units.**

**What has to happen, stated so nobody eyeballs it:**

1. ⛔ **PLACE THE CAMERA to match the photograph.** The room's own vanishing points fix its
   orientation; its FOV and position must be chosen so the scene agrees with the image.
2. ⛔ **PLACE A PLANE ON THE WALL** at the correct rotation for that wall.
3. ⚠⚠ **SOLVE FOR THE PLANE'S SIZE AND POSITION SO IT PROJECTS TO EXACTLY THE FOUR SAVED POINTS.**
   ⛔ **The homography above CONTAINS this information — it is a solvable inverse problem, not a
   matter of taste.**

⛔⛔ **DO NOT SKIP TO STEP 3 BY DRAGGING A MESH UNTIL IT LOOKS RIGHT.** ⚠ **That is the same failure
mode as the Builder's four wrong ceiling angles: a value tuned by eye, then verified against itself.
The saved corners are the ONLY uncontaminated reference in this problem — they came from Carl's eye
directly.**

⚠ **AND THE SAVED COORDINATES ARE THE ACCEPTANCE TEST: render the Three.js card, screenshot it, and
its corners must land on these fractions. That is a check the Builder CAN run, because it compares
against Carl's numbers rather than against its own.**

## ⚠ WHAT THIS MEANS FOR §5a — STILL UNWRITTEN, STILL REQUIRED

⛔ **A Three.js surface on `/about` is a NEW WebGL CONTEXT ON A ROUTE THAT HAS NONE.** ⚠ **The record
holds two worked cases of exactly this shape going in unreviewed inside chunks about something else
— the warm-up canvas (four sessions to diagnose) and `NextStepMeshButton` (eight contexts in a
five-question walk).**

⛔ **THE STRUCTURAL WRITE-UP IS STILL OWED AND NOTHING IS AUTHORISED TO BE BUILT.** ⚠ **What has
changed today: the SHAPE and POSITION questions are answered, so the write-up can be about the
structure alone — one canvas, host ownership, material reuse, and what instrument watches it.**

## ⛔⛔ THE FACE IS CONVEX — Carl, 4 September 2026, with a two-view drawing

> ⛔ ***"the face will be slightly convexed like the answer cards"***

**Carl supplied a SIDE and a FRONT elevation.** ⚠ **What the side view establishes:**

- ⛔ **THE BACK IS FLAT.** It sits against the wall — and it is the plane the four saved corners
  describe.
- ⛔ **THE FACE IS CONVEX**, crowning outward toward the centre and falling to the rim.
- ⛔ **THE RIM IS VISIBLE AS A SEPARATE OUTLINE** in the front view — a border running the whole way
  round, inside the silhouette. **Two concentric rounded rectangles: the outer edge and the face.**
- ⚠ **SLIGHTLY convex.** *"Slightly"* is Carl's word. **This is the answer card's `CROWN_HEIGHT`
  (4.5) behaviour, not a dome.**

### ⚠⚠ WHY THE CONVEX FACE IS LOAD-BEARING FOR THE LIGHTING, NOT DECORATION

⛔ **A FLAT PANEL BACKLIT TRANSMITS EVENLY AND READS AS A LIT RECTANGLE.** ⚠⚠ **A CURVED ONE
CONCENTRATES TRANSMISSION WHERE THE GLASS IS THICKEST AND FALLS OFF TOWARD THE RIM — which is what
makes it read as a solid object made of glass rather than a glowing panel.**

⛔ **So the crown is not a styling choice that could be dropped for simplicity. It is part of the
behaviour the section exists to demonstrate** — the travelling light passing behind a frosted panel
(`about-section-thinking.md`, the lighting section).

### ⛔ THE CONSTANTS THAT DESCRIBE THIS, from `answer-card-geometry.ts`

| constant | value | what it does here |
|---|---|---|
| `CROWN_HEIGHT` | **4.5** | ⛔ **how far the face crowns above its edge — the convexity itself** |
| `CROWN_PLATEAU_U` | **0.72** | ⚠ how much of the face is flat before it curves down to the rim |
| `FACE_PROUD_OF_RIM` | **2.0** | how far the face stands out from the rim |
| `RIM_TUBE_RADIUS` | **2** | the rim's own thickness |
| `CARD_RADIUS_PX` | **14** | the rounded corner |

⛔⛔ **THE VALUES ARE NOT THE INSTRUCTION. THE FAMILY IS.** Carl, 4 September:

> ⛔ ***"the values can change. What the example shows is principle. Because the shape is different i
> realise that some values have to change but its like the cards belong to the same family. There is
> a consistency there. Variations on a theme if you will."***

⚠⚠ **SO THE TABLE ABOVE IS A REFERENCE, NOT A SPEC TO COPY.** ⛔ **What must survive is the FAMILY
RESEMBLANCE: flat back, convex face, visible rim, rounded corners, satin glass.** ⚠ **Every number
is free to move in service of that; none of them is the thing itself.**

⚠ **A worked example of why they must move: `CROWN_HEIGHT` 4.5 on a 186 x 48 strip is a visible
crown. The same 4.5 on a wall panel several times that size would read as FLAT — so holding the
number would BREAK the resemblance rather than preserve it.**

⛔ **AND IT SETTLES THE MATERIAL QUESTION THE RECORD LEFT OPEN.** ⚠ **If these are one family, the
glass is the same glass — which is what `about-section-thinking.md` already argued: *"a client's
frosted glass being THE SAME GLASS is the point."*** ⛔ **`answer-card-glass.ts` is a PROTECTED path
and D-051 approved work; reuse is Carl's to unlock, not the Builder's to assume.**

⛔ **THE SAVED CORNERS STILL DESCRIBE THE BACK PLANE.** ⚠ **With a convex face the front now bulges
FURTHER forward than a flat card of the same depth, so the silhouette a viewer sees is larger again
than the pinned quad. Do not pin to the silhouette.**

---

# ⛔⛔ THE FLOOR PAIR — CD AND CS. Carl, 4 September 2026

> ⛔ ***"because the wall cards are on the wall light will only be shone at them from certain
> directions. The floor cards will be smaller. their shorter sides will be on the top edge but their
> back edge should still be flat. we wont see it but light will shine through it. the geometry will
> have the same family pattern. it will be interesting to shine light through it from the back to see
> how the 'lens' at the front disperses it."***

## ⛔ WHAT IS SETTLED HERE

| | |
|---|---|
| **Size** | ⛔ **SMALLER than the wall cards.** Consistent with the copy weighting — CD 49 words, CS 55, against CA 64 and CB 84 |
| **Orientation** | ⛔ **PORTRAIT. *"their shorter sides will be on the top edge"*** — ⚠⚠ **the opposite of the wall pair, which are landscape.** A real differentiation between the two treatments, and it follows the room: a panel standing on a floor is upright |
| **Back** | ⛔ **STILL FLAT**, though it faces away and is never seen |
| **Geometry** | ⛔ **SAME FAMILY PATTERN** — flat back, convex face, rim, rounded corners |

## ⛔⛔ THE LIGHTING DIFFERENCE IS A DIFFERENCE IN KIND, NOT DEGREE

⚠ **WALL CARDS: light reaches them from CERTAIN DIRECTIONS ONLY.** ⛔ **Flat against a surface, they
can only ever be FRONT-LIT.** There is no behind to get to.

⛔⛔ **FLOOR CARDS: the light can pass BEHIND them, and that is the entire reason they lean.** ⚠ **A
panel standing away from the wall has a back the light can reach.**

## ⚠⚠ THE CARD IS A PLANO-CONVEX LENS, AND CARL HAS NAMED IT

> ⛔ ***"it will be interesting to shine light through it from the back to see how the 'lens' at the
> front disperses it."***

⛔⛔ **THIS IS NOT A METAPHOR. A FLAT BACK WITH A CONVEX FRONT IS LITERALLY A PLANO-CONVEX LENS.**

⚠ **Light entering the flat back and leaving through the curved face is REFRACTED TOWARD THE CENTRE.
It does NOT transmit evenly.** ⛔ **The face will read BRIGHTEST WHERE THE GLASS IS THICKEST and fall
away toward the rim — and because the surface is curved, that bright region MOVES as the light source
travels.**

⚠⚠ **SO THE CONVEX FACE IS NOT DECORATION AND IS NOT A STYLING CHOICE THAT COULD BE DROPPED FOR
SIMPLICITY. IT IS THE OPTICAL COMPONENT THAT MAKES THE BACKLIGHTING WORTH DOING.** ⛔ **A flat panel
backlit is a glowing rectangle. A lens backlit is glass.**

⛔ **AND IT IS THE ANSWER TO "WHY THREE.JS RATHER THAN CSS" IN ONE SENTENCE:** ⚠ **no CSS filter
refracts. Transmission through a curved solid is a material simulation, and the record already says
this is the one behaviour that cannot be faked with an image.**

## ⚠ WHAT THIS OPENS, NOT YET ANSWERED

- ⚠ **THE MATERIAL MAY NEED MORE THAN THE SATIN FACE PROVIDES.** ⛔ **`answer-card-glass.ts` was
  tuned for a FRONT-LIT card in a dark corridor (D-051). Transmission from behind is a different
  problem** — it needs the material to actually carry light through, not just to look frosted.
  ⚠⚠ **Whether the approved glass does this UNCHANGED is UNKNOWN and must be tested, not assumed.
  It may be the point at which "the same glass" needs a parameter it does not currently have.**
- ⚠ **INTENSITY IS NARROW-BANDED.** The record already warns that backlit transmission has a small
  window between invisible and blown out, **and that it is narrower still on one display** — check
  the chosen value somewhere other than Carl's screen.
- ⚠ **THE LEAN ANGLE IS UNMEASURED** and the floor plane has not been derived. ⛔ **Same job as the
  wall pinning, not yet done for the floor.**
- ⚠ **CONTACT SHADOWS remain outstanding** — a leaning panel throws its shadow forward and it
  lengthens with the angle. Planned in, not added after.

---

# ⚠ THE FLOOR PAIR — INDICATIVE POSITIONS ONLY. Carl, 4 September 2026

> ⛔ ***"about here. dimensions will change. this is only to indicate position"***

⛔⛔ **POSITION ONLY. NOT DIMENSIONS, NOT SHAPE, NOT FINAL.** ⚠ **Recorded so the placement intent
survives; the numbers are expected to move.**

## Where Carl put them

| | |
|---|---|
| **FLOOR LEFT (CD)** | ⛔ **Far left of frame, in front of the left desk's near end.** Its lower edge runs past the bottom of the visible area |
| **FLOOR RIGHT (CS)** | ⛔ **Far right of frame, in front of the right desk, against the snake plant.** Also cut at the bottom |

⚠⚠ **BOTH ARE PUSHED TO THE OUTER EDGES, WELL CLEAR OF THE CENTRE FLOOR.** ⛔ **The open space between
them — where the two chairs sit — STAYS OPEN.** ⚠ **That is consistent with the chair being the
bridge: the middle of the room is not decorated.**

⚠ **Both are cut off at the bottom of frame.** ⛔ **Undetermined whether that is intended (a card
standing on a floor that continues below the crop) or a sign they need to be shorter. Carl's call.**

## ⛔ WHAT THE INDICATIVE QUADS DO *NOT* YET SHOW

⚠ **They are flat, face-on rectangles.** ⛔ **The two rotations Carl specified are NOT applied:**

1. ⛔ **LEAN BACK** — *"the floor cards could be slightly leaning back so they will truly be part of
   the scene."*
2. ⛔ **FACE INWARD** — *"i need them to slightly lean back and to both face inward a little."*
   ⚠ **Mirrored: left card turns right, right card turns left.**

⛔ **Both rotations will change the silhouettes and move these corners.**

## ⚠⚠ THE FLOOR PAIR DOES NOT NEED THE PINNING TOOL — Carl asked, and the answer is no

⛔ **THE WALL CARDS NEEDED IT BECAUSE THEY HAD TO MATCH A SURFACE.** A rectangle lying on a
photographed wall must agree with that wall's exact perspective, and being wrong is instantly visible.
**The tool solved *where does this land*.**

⛔ **THE FLOOR CARDS DO NOT MATCH A SURFACE — THEY STAND IN FRONT OF ONE.** ⚠ **Their lean and their
inward turn are DESIGN DECISIONS, not values the photograph dictates.** ⛔ **Those want a slider and
Carl's eye, not a homography.**

⚠⚠ **BUT THERE IS A REAL DEPENDENCY, AND IT IS THE SAME ONE ARRIVING FROM A DIFFERENT DIRECTION: THE
THREE.JS CAMERA MUST AGREE WITH THE PHOTOGRAPH.** ⛔ **A card standing on the floor only reads as IN
the scene if the scene's perspective matches the room's. Wrong camera, and the cards float in a
different space whatever their rotations.**

⛔ **THE WALL CORNERS ARE WHAT SOLVES IT** — they say where a plane on that wall projects to, which
constrains the camera. ⚠ **HONEST ORDER: camera first (derived from the pinned corners), then floor
cards built face-on in that scene, then the two rotations tuned by eye.**

## ⛔ CONTACT SHADOWS — Carl: *"will they emit a slight shadow on the floor. that will help sell the scene"*

⚠ **Already on the record as non-optional (3 September): *"A card resting on the floor needs a shadow
where it meets, or it hovers and the illusion dies."***

**Three routes, and they differ in cost:**

| route | what it is | cost |
|---|---|---|
| **Real shadow maps** | a casting light, a receiving plane | ⚠ shadow rendering every frame; the floor must exist as invisible geometry. **Physically correct — the shadow lengthens and shifts as the light orbits** |
| **Baked ellipse** | a soft dark shape painted once | cheap, always right at the contact point. ⛔ **Cannot respond to the travelling light — it would sit static while everything else moves** |
| ⛔ **COMPUTED CONTACT SHADOW** | a soft gradient at the base, length and direction driven by the light's position | ⚠⚠ **Not a true shadow map — an approximation, exactly like the CSS shine on the Send button.** Cheap, and it RESPONDS |

⛔ **THE BUILDER RECOMMENDS THE THIRD, and the reason is the "one world" idea: it participates in the
single lighting model.** ⚠ **The contact point is where the eye checks — a shadow that is right where
the card meets the floor sells it more than an accurate shadow across the whole room.**

⚠⚠ **ONE CONSTRAINT ON ANY ROUTE: the photographed floor ALREADY HAS ITS OWN LIGHTING** — bright pools
from the downlights, darker at the edges. ⛔ **A shadow must DARKEN WHAT IS THERE, not paint a grey
shape over it. Multiply, not overlay, or it reads as a sticker.**

⛔ **NOT DECIDED. Carl's call.**

---

# ⛔⛔ AMENDMENT — 5 September 2026. BOTH CARDS ADJUSTED, APPROVED BY CARL BY EYE

⚠⚠ **THE 4 SEPTEMBER SET ABOVE IS NOT EDITED AND NOT SUPERSEDED. IT IS THE ORIGIN.** ⛔ **Every
number below is stated as a DELTA FROM IT, so the pinned set stays the reference and this amendment
stays auditable.** ⚠ **`no retroactive rewriting` — `context-rules.md`.**

## ⛔ WHY ANY OF THIS HAPPENED — THE GOAL IS ROUNDED CORNERS

> ⛔ ***"The goal is that we can put rounded corners in."***

⚠⚠ **CB's TR SAT AT `y = 0` — HARD AGAINST THE TOP EDGE OF THE STAGE.** ⛔ **A corner radius needs
somewhere to go; a corner clamped to the frame boundary has none.** ⚠ **The card was not wrong on the
wall — it was wrong against the CROP.**

⛔ **Rounded corners are STILL NOT BUILT.** ⚠ **This makes room for them. It does not add them, and
they are not authorised** — see the standing note above.

## ⛔⛔ THE ACTUAL CHANGES — THREE OPERATIONS, TWO OF THEM DIFFERENT IN KIND

| # | card | operation | corners moved | delta |
|---|---|---|---|---|
| **1** | **CB** | **top edge down** | TL, TR | **+0.012 each** |
| **2** | **CA** | ⛔ **WHOLE CARD down** | **all four** | **+0.010 each** |
| **3** | **CA** | **top edge down** | TL, TR | **+0.010 each** |

⚠⚠ **OPERATIONS 2 AND 3 ARE NOT THE SAME MOVE AND THE DISTINCTION IS LOAD-BEARING:**

- ⛔ **A WHOLE-CARD DROP moves all four corners. The card KEEPS ITS SHAPE** — every edge angle, its
  height and its width are mathematically unchanged. It is a translation.
- ⛔ **A TOP-EDGE DROP moves only TL and TR. The card gets SHORTER.** ⚠ **Used because CA's bottom
  edge could not go any lower — see the monitor constraint below — so the only way to close the gap
  to the ceiling was to shorten the card, not move it.**

### The resulting values, as written into `app/proto/wall/page.tsx` → `INITIAL_FRAC`

    CA   0.19766, 0.04849  /  0.46604, 0.11063  /  0.46604, 0.35148  /  0.19766, 0.37449
    CB   0.60731, 0.10378  /  0.82441, 0.01200  /  0.82441, 0.40362  /  0.60731, 0.35299

**Cumulative deltas from the 4 September pinned set:**

| | TL | TR | BR | BL |
|---|---|---|---|---|
| **CA** | **+0.020** | **+0.020** | **+0.010** | **+0.010** |
| **CB** | **+0.012** | **+0.012** | 0 | 0 |

⛔⛔ **EVERY X IS UNTOUCHED, ON BOTH CARDS, THROUGHOUT.** ⚠ **So the vertical-edge correction from
4 September still holds — each bottom node still takes the x of the node above it.**

## ⛔⛔ WHY THIS WAS DONE IN ARITHMETIC AND NOT BY DRAGGING — CARL'S REASON

> ⛔ ***"If i did this i would have to do it one at a time and they are not gauranteed to be equal.
> You have the ability to change the numbers in the output."***

⚠⚠ **TWO HANDLES DRAGGED SEPARATELY PRODUCE TWO DELTAS THAT DIFFER BY A PIXEL OR TWO, AND THE EDGE
SILENTLY CHANGES ANGLE.** ⛔ **The top edge's angle is the one property of these corners that was
hard-won on 4 September and must not move.** ⚠ **Equal deltas applied as arithmetic leave it
mathematically untouched. This is the one part of the job the Builder can do better than the eye —
and it is the ONLY part.**

## ⚠⚠ THE MONITOR CONSTRAINT — CA's HARD FLOOR

> ⛔ ***"there is little wriggle room with CA because of the 3 monitors. we cannot put the CA card
> behind the monitors but we can get very close."***

⛔ **The three-monitor array on the left wall is the limit for CA's bottom edge, NOT the frame.**
⚠ **This is why operation 3 shortened the card instead of dropping it further: the bottom edge had
nowhere left to go.**

## ⛔⛔ A MEASUREMENT THE BUILDER DECLINED TO MAKE — AND THE DECLINE IS THE RECORD

⚠ **Carl asked: *"are you able to measure the distance from the ceiling of the top edge of CB
card?"*** ⛔ **The Builder said NO, and did not produce a number.**

⚠⚠ **THAT IS D-076 BEING APPLIED RATHER THAN REDISCOVERED.** ⛔ **This is the exact measurement that
produced four different ceiling angles on 4 September, each verified against its own figure. A fifth
attempt would have been the same failure with a fresh number.**

⛔⛔ **AND THERE IS A SECOND, INDEPENDENT REASON THE MEASUREMENT WOULD HAVE BEEN WRONG EVEN IF THE
SEAM HAD BEEN FOUND EXACTLY:** ⚠⚠ **CA AND CB ARE ON DIFFERENT WALLS RECEDING IN OPPOSITE
DIRECTIONS.** **Equal PHYSICAL drop from the ceiling does not project to equal SCREEN distance — the
right wall is further away, so a metre of wall there occupies fewer pixels.** ⛔ **Perpendicular
screen distance from seam to card top would give two numbers that LOOK comparable and are not.**

⚠ **The 0.010 used in operation 2 was the Builder's reading of a screenshot and was flagged AS SUCH
in the code comment at the time it was written — deliberately the conservative end of the measured
gap, offered as a starting position for Carl's eye rather than as a derived value.** ⛔ **Carl then
set operation 3's number himself.**

### ⚠ THE INSTRUMENT THAT WOULD ANSWER IT PROPERLY — PROPOSED, NOT BUILT

⛔ **The homography already contains the answer.** ⚠ **Each card's four pinned corners define the
mapping between that wall's real plane and the screen; inverting it turns a screen point into
UNFORESHORTENED WALL COORDINATES.** **Pin the ceiling seam, map it into each card's own wall space,
and the two drops become comparable numbers.**

⛔ **NOT BUILT. Carl chose the arithmetic route instead.** ⚠ **Recorded because the equal-drop
constraint is still open and this is the honest way to close it — the verification would use Carl's
pinned seam, not a value the Builder derived from the image.**

## ⛔ THE TOOL'S SEEDING WAS CHANGED IN THE SAME PASS

⚠⚠ **`INITIAL_FRAC` NOW WINS ON LOAD, UNCONDITIONALLY. `localStorage` NO LONGER OVERRIDES IT.**

⛔ **Carl: *"what i want is the cards in the position i left them"*** — ⚠ **and they already WERE in
`INITIAL_FRAC`. A stale browser drag was silently winning on load, so the corrected set looked like
"default positions" that had been lost.**

⚠⚠ **BOTH SEEDING RULES HAVE NOW FAILED ONCE EACH, IN OPPOSITE DIRECTIONS:**

| version | rule | how it failed |
|---|---|---|
| **v1** | re-seed from `INITIAL_FRAC` every mount | ⛔ **threw away Carl's drags on every reload. Cost the positioning work twice** |
| **v2** (4 Sept) | prefer `localStorage` | ⛔ **hid the corrected committed set behind a stale drag** |
| **v3** (5 Sept) | ⛔ **`INITIAL_FRAC` wins; storage still WRITTEN, never read on load** | — |

⛔ **THE PRINCIPLE: A GITIGNORED BROWSER STORE MUST NOT OUTRANK A COMMITTED RECORD.** ⚠ **To carry a
drag forward, read it out of the output block and write it into `INITIAL_FRAC` — the same route these
numbers took.**

## ⛔ STATUS

⚠ **Carl, on the rendered tool, twice: *"that looks good."*** ⛔ **Approved BY EYE, in the tool, at
stage aspect 2.106.** ⚠⚠ **NOT verified against a Three.js render — that acceptance test does not
exist yet and is the whole point of the corners. Nothing here is a harness verdict** (`proven.json`
is empty, D-064).

## ⚠ STILL OPEN — UNCHANGED BY THIS AMENDMENT

- ⛔ **THE EQUAL-DROP CONSTRAINT IS STILL NOT SATISFIED.** ⚠ **Carl: *"still noticably not the
  same."* Both cards moved down; neither move was derived from the ceiling.**
- ⚠ **CB still runs off the right edge of the frame** — TR and BR both at x `0.82441`, clipped.
- ⛔ **Rounded corners: room made, NOT BUILT, NOT AUTHORISED.**
- ⚠ **Numeric corner entry: still not built.**

*Amended 5 September 2026. The deltas are arithmetic; every judgement in this file is Carl's.*

---

# ⛔⛔ CORRECTION — "CB RUNS OFF THE RIGHT EDGE" WAS FALSE. 5 September 2026

⚠⚠ **THIS CLAIM WAS CARRIED AS AN OPEN ITEM FROM 4 SEPTEMBER, REPEATED IN THE SESSION HANDOFF, AND
REPEATED AGAIN BY THE BUILDER TODAY. IT IS WRONG.** ⛔ **Carl challenged it; the arithmetic settles
it.**

    CB right edge   x = 0.82441  =  1571.3 px of a 1906 px stage
    clear of the frame by         334.7 px  —  17.6% OF STAGE WIDTH

⛔ **THE CARD IS NOWHERE NEAR THE RIGHT EDGE.**

## ⚠ WHAT WAS ACTUALLY BEING SEEN

⛔ **The STAGE BOX ends where the browser window ends. The CARD does not.** ⚠ **A screenshot cropped
at the window made the stage boundary look like a clip on the card.**

⚠⚠ **AND THE DRAG HANDLE COMPOUNDED IT: the orange dot is a 20px UI element CENTRED on the corner,
so it overhangs 10px past the true corner in every direction.** ⛔ **A handle that appears to touch an
edge does NOT mean the corner does.**

## ⛔ CARL'S POINT, WHICH IS THE STRUCTURAL ONE

> ⛔ ***"i dont think CB TR will go off the edge. it is to be rounded and even though the orange
> circle is used to drag the corners and that is off the edge, once the card three js geometry is in
> place we will be alright."***

⚠⚠ **A ROUNDED CORNER PULLS THE VISIBLE MATERIAL INWARD FROM THE MATHEMATICAL CORNER.** ⛔ **The
pinned point is where the two edges WOULD meet if extended; the rendered card's surface stops short
of it by the radius.** ⚠ **So the real silhouette is SMALLER at the corners than the pinned quad —
in the opposite direction from the convex face, which makes it LARGER at the centre.**

## ⛔⛔ THE LESSON, AND IT IS THE SAME ONE AS D-076

⚠⚠ **THE BUILDER READ A DISTANCE OFF A SCREENSHOT AND REPORTED IT AS A DEFECT. THE MEASUREMENT TOOK
ONE LINE OF ARITHMETIC ON NUMBERS THAT WERE ALREADY IN THE FILE.**

⛔ **WHEN THE VALUE IS ALREADY WRITTEN DOWN, COMPUTE IT. DO NOT LOOK AT IT.** ⚠ **This one survived
three retellings because nobody checked a number that was sitting in `INITIAL_FRAC` the whole time.**

⚠ **`open-defects.md` is untouched — this was never a product fault, only a wrong note.**

---

# ⛔⛔ THE SEAM INSTRUMENT — BUILT AND APPROVED. 5 September 2026

⚠ **Carl: *"if you wish to build the tool and do this with precision so that it looks better and
improves it, im all for that."*** ⛔ **Built. Carl on the result: *"thats the best way to do it."***

## ⛔ WHAT IT DOES, AND WHY THE UNIT IS WHAT IT IS

⚠⚠ **CA AND CB ARE ON DIFFERENT WALLS RECEDING IN OPPOSITE DIRECTIONS. EQUAL PHYSICAL DROP FROM THE
CEILING DOES NOT PROJECT TO EQUAL SCREEN DISTANCE** — the right wall is further from the camera, so a
metre of wall there occupies fewer pixels. ⛔ **Measuring seam-to-card-top in pixels gives two numbers
that LOOK comparable and are not.**

⛔ **THE FIX: invert each card's own homography.** ⚠ **The four pinned corners already define the map
between that wall's real surface and the screen; running a screen point backwards through it yields
UNFORESHORTENED WALL COORDINATES.** **Both the seam and the card's top edge are mapped that way before
anything is measured, so the foreshortening cancels.**

⛔ **UNIT: PERCENT OF CARD HEIGHT.** ⚠ Pixels are not comparable across walls; metres would need a
real-world size nobody has supplied — **inventing one would be a Builder measurement smuggled back
in.** **Card height is exact, already defined, and the same quantity for both cards.**

⛔ **Measured from the top edge's MIDPOINT, not a corner** — a corner reading changes with the edge's
angle and would confuse *"is it level"* with *"is it low"*.

## ⛔⛔ THE TECHNIQUE CARL ARRIVED AT — SAMPLE WHERE YOU CAN SEE, EXTRAPOLATE WHERE YOU CANNOT

⚠⚠ **THE CEILING/WALL JOIN IS INVISIBLE IN THE TOP CORNERS — dark-on-dark.** ⛔ **Carl: *"i cannot see
the corner because of shadows."***

⛔⛔ **THE ANSWER IS THAT A SEAM IS A STRAIGHT LINE, SO TWO SAMPLES ANYWHERE ALONG IT DEFINE IT
EVERYWHERE.** ⚠ **Carl put both handles where the join is plainly visible and let the line run past
the corner into the shadow.** ⛔ **The hardest judgement — where is the corner I cannot see — is
REMOVED rather than attempted.**

⚠⚠ **THIS IS THE SAME MOVE CARL USED TO CATCH THE FOUR WRONG CEILING ANGLES ON 4 SEPTEMBER** — lift a
line onto the seam and see whether it traces it. **A line is checkable along its whole length; a point
in shadow is not.**

## ⛔ THREE AFFORDANCES, EACH FROM A REPORTED FAULT

| fault | fix |
|---|---|
| *"cannot see the corner because of shadows"* | ⛔ **SHADOW LIFT** — brightness + contrast on the preview image, scrim suppressed while active. ⚠⚠ **A VIEWING AID ONLY: no measurement reads it, the pinned points are stage coordinates regardless of display, and `/about` is untouched** |
| *"cannot drag the squares out of the viewport"* | ⛔ **SEAM HANDLES UNCLAMPED.** ⚠ The stage is `overflow-visible`; **the IMAGE keeps its own `overflow-hidden` so the CROP the corners were pinned against is unchanged.** ⚠ **Card corners stay CLAMPED — one dragged off-stage becomes unreachable and the card silently loses a corner** |
| *"can you make the squares smaller"* | ⛔ **16px → 8px.** ⚠ **A marker bigger than the feature it points at hides its own target** |

## ⚠⚠ A BUG CAUGHT IN VERIFICATION — IT WOULD HAVE LIED QUIETLY

⛔ **The first implementation fed the top edge as `(CARD_W/2, 0)` and divided by `CARD_H`.**

⚠⚠ **THE HOMOGRAPHY MAPS THE UNIT SQUARE, NOT A 420x260 BOX** — `matrixFor` divides its coefficients
by `CARD_W`/`CARD_H` precisely so CSS can apply the matrix to a sized element. ⛔ **The readout would
have been 260x TOO SMALL — still finite, still moving the right way when dragged, entirely
plausible.**

⛔⛔ **CAUGHT BY ROUND-TRIPPING BOTH CARDS' REAL CORNERS:** all four map back to the pinned pixels
within **1e-13**; the inverse round-trips at **2e-16**. ⚠ **The check used Carl's actual numbers, not
a synthetic case — a synthetic square would have hidden it.**

## ⚠ WHAT THE INSTRUMENT DOES NOT WATCH — STATED IN ITS OWN OUTPUT

⛔ **Per `context-rules.md` (the `one-context.mjs` case: an instrument that names a global property
while checking a local one lies by implication), the caveat sits NEXT TO THE NUMBER, not in a header
comment:**

- ⛔ **It does NOT check the seam lines are actually on the ceiling join.** ⚠ **That is Carl's pinning
  and the readout assumes it.**
- ⛔ It does not check the two cards are the same size.
- ⛔ It does not check either card sits on the wall correctly.

⚠ **It answers one question: given these corners and this seam, are the two drops equal.**

## ⛔ STATUS

⚠ **The instrument is APPROVED as a method — Carl: *"thats the best way to do it."*** ⛔⛔ **THE
EQUAL-DROP NUMBERS THEMSELVES ARE NOT YET SETTLED, AND NO CORNER HAS BEEN MOVED ON THE STRENGTH OF
THEM.** ⚠ **`/proto/wall` remains throwaway; delete it when its numbers are consumed.**

---

# ⛔⛔ CB TAKEN BACK UP BY HALF, AND THE CLEARANCE IS SETTLED. 5 September 2026

## ⛔ THE FINAL ADJUSTMENT

⚠ **Carl, judging the ceiling gap at the corner in a close crop:** *"to me the CB gap from the
ceiling seems a smidgeon bigger, whatever you dropped it by, take it up by half that amount."*

**The drop had been +0.012, so +0.006 was returned:**

| corner | after the drop | now |
|---|---|---|
| **CB TL** | 0.10378 | **0.09778** |
| **CB TR** | 0.01200 | **0.00600** |

⛔ **Both −0.006 exactly, so the top edge keeps its angle. BR/BL untouched. X untouched.**

⚠⚠ **NOT taken all the way back to zero, and the reason is the whole point of the original move:**
**TR at 0.006 still clears the frame, so the rounded corner has somewhere to go.** ⛔ **Returning the
full 0.012 would have restored the problem the drop existed to fix.**

## ⛔⛔ THE CLEARANCE IS APPROVED — Carl, on the clean-view crop

> ⛔ ***"Any rounding of the corners will be ok"***

⚠ **This settles the question the whole drop sequence existed to answer.** ⛔ **It is NOT authorisation
to build rounded corners** — that remains asked-about-and-not-built. **It confirms that whatever
radius is later chosen will fit.**

## ⚠ THE FULL CUMULATIVE POSITION, FROM THE 4 SEPTEMBER PINNED SET

| | TL | TR | BR | BL |
|---|---|---|---|---|
| **CA** | **+0.020** | **+0.020** | **+0.010** | **+0.010** |
| **CB** | **+0.006** | **+0.006** | **0** | **0** |

    CA   0.19766, 0.04849  /  0.46604, 0.11063  /  0.46604, 0.35148  /  0.19766, 0.37449
    CB   0.60731, 0.09778  /  0.82441, 0.00600  /  0.82441, 0.40362  /  0.60731, 0.35299

⛔ **Every x untouched throughout. The 4 September vertical-edge correction still holds.**

## ⚠⚠ A UI FAULT WORTH RECORDING, BECAUSE IT IS A GENERAL ONE

⛔ **The first "clean view" faded the corner handles with `opacity-0 hover:opacity-100`.**

⚠⚠ **IT DEFEATED ITSELF. Carl was inspecting the CORNER, so the pointer was ON the corner, so the
handle reappeared exactly where it was in the way** — *"the circles are obscuring the view."*

⛔ **A HOVER-REVEAL IS USELESS WHEN THE THING BEING INSPECTED IS THE THING BEING HOVERED.** ⚠ **Fixed
by not rendering the handles at all in clean view. Nothing is lost — the positions live in
`INITIAL_FRAC` and localStorage, not in the handles.**

⚠ **Same family as Rule 8's hover clause: hover must ENHANCE, never carry essential visibility.**
