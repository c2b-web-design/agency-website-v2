# Session Handoff — 4 September 2026. §2's copy is drafted, the wall geometry is SOLVED, and the record caught up

⛔ **READ THIS FIRST, THEN `project-intelligence/` AS NORMAL.** Chat history is not canonical (D-006).
**Delete this file at the end of the session that reads it, once its replacement is written** —
`live-work-protocol.md` §3a.

⚠⚠ **UNLIKE THE LAST HANDOFF, THIS ONE CARRIES NOTHING THAT IS NOT ALSO IN A PERMANENT FILE.**
⛔ **D-074 exists because three approvals lived only in the 3 September handoff, in a gitignored
folder scheduled for deletion. The test now applied: if this file vanished, what would be LOST rather
than merely inconvenient? Nothing.**

---

# ⛔⛔ WHAT THE NEXT SESSION DOES

**Carl's three open items, in the order they gate each other:**

| # | job | why |
|---|---|---|
| **1** | ⛔ **THE GOLD MARK — translucent or opaque** | Carl's named question, twice deferred. ⚠⚠ **It is no longer only an appearance question: translucent = transmission = WebGL geometry; opaque = light falls on it = the CSS proximity illusion, no WebGL at all.** See `about-section-thinking.md` → *the one-world illusion* |
| **2** | ⛔ **THE §5a STRUCTURAL WRITE-UP** | ⛔⛔ **NOTHING IS AUTHORISED TO BUILD UNTIL THIS EXISTS.** A Three.js surface on `/about` is a new WebGL context on a route with none |
| **3** | ⛔ **BUILD IT** | ⚠⚠ **Carl, at session end: *"i think we have enough to build it next session."*** **The build order, the floor positions and the shadow routes are at the FOOT of this file — read that section, it is the brief.** |

---

# ⛔ THE STATE — ALL VERIFIED, NOT ASSUMED

- **Working tree committed and pushed.** `main` = the commit this handoff ships with.
- ⛔ **LINT: `1 problem (1 error, 0 warnings)`** — the pinned baseline. **Zero warnings is the new
  standard; any warning is now a regression on sight.**
- ⛔ **`npx tsc --noEmit` clean. `npm run build` clean, 9/9 static** — `/about` keeps its prerender.
- ⛔⛔ **ALL PROTECTED PATHS ARE LOCKED. `chunk-scope.json` DELETED, AND THE LOCK WAS VERIFIED BY THREE
  REAL DENIALS** — `CLAUDE.md`, `app/start/page.tsx`, `components/layout/site-header.tsx` each refused
  a test edit. Not assumed.
- ⚠ **A DEV SERVER MAY STILL BE RUNNING on :3000.** ⛔ **Kill by PID and confirm the port free before a
  checkpoint — `TaskStop` has reported success on a held port five times.**
- ⚠ **`open-defects.md` untouched.** Nothing this session produced a live product fault.
- ⚠ **`verify/` unused; `proven.json` still empty.** No harness verdict is admissible (D-064).

---

# ⛔⛔ WHAT WAS BUILT AND DECIDED — D-071 → D-077, R-023, R-024

## 1. The record caught up (D-074)

⚠⚠ **Three approvals existed ONLY in a handoff scheduled for deletion:** §1's copy and layout, the
room photograph, and §10a's status. ⛔ **All three now have `decisions.md` entries.** ⚠ **This failure
was PREDICTED IN WRITING three weeks earlier** — `context-rules.md` says outright that nothing
enforces Rule 7 because a hook fires on an edit happening and the failure mode is an edit that never
happens. **It then happened exactly that way.**

## 2. §10a is BROADENED, not reversed (D-071)

⛔ **Carl: *"is not a reversal, its the broadening of a concept."*** ⚠⚠ **§10a governs WHAT C2B CLAIMS
TO HAVE MADE, not where pixels sit.** **A background photograph is MATERIAL — like a font, like the
paper in a book. A screen playing content is CONTENT.** ⛔ **The C2B TV royalty-free refusal STANDS
under the broadened rule.** ⚠ **The licence question is CLOSED — Carl: *"not a concern."* Do not
re-raise it.**

## 3. Lint to zero (D-075)

**7 problems → 1.** Room image to `next/image` (**459KB → 105KB at 1440, −77%; 22KB at 750, −95%** —
measured on the running server). Four gold marks stay `<img>`, **suppressed by decision** with the
reason stated once at the mark in `app/about/page.tsx`. Dead `showBlue` deleted — ⚠ **the old
baseline's worry that it hid an unapplied transition was UNFOUNDED and is now answered.**

## 4. §2's copy — DRAFTED, PROVISIONAL (D-077)

| position | card | words |
|---|---|---|
| wall left | **The Architect** | 64 |
| wall right | **The Builder** | 84 |
| floor left | **The Designer** | 49 |
| floor right | **The Strategist** | 55 |

⛔ **Full text and every rejected phrase: `about-section-thinking.md`.**

⚠⚠ **THREE THINGS A LATER EDITOR WOULD "FIX" AND MUST NOT:**
1. ⛔ **The wall pair never says "you"; the floor pair does.** Front pair = what the client
   participates in; back pair = work done on their behalf.
2. ⛔ **No card is a step.** No *first/then/finally* — the seats are consulted repeatedly, not passed
   through. **The chair in the middle of the room is the argument.**
3. ⛔ **The tooling is not named on the page.** ⚠⚠ **AND ANTHROPIC'S MARKS MAY NOT APPEAR AT ALL — no
   "powered by" badge, no logo strip.** Naming Claude descriptively in conversation is fine.

⚠ **Four lines are named UNCUTTABLE in D-077. If a card cannot fit while keeping its line, THE CARD
SIZE IS WRONG, NOT THE LINE.**

⚠ **ONE CLAIM AHEAD OF THE FACT:** CS's *"connected to the things the business actually runs on"* is
present tense and was not confirmed. ⛔ **§2 is where a sceptic checks. If nothing is wired yet, the
fix is *"can be connected to"*.**

## 5. The wall geometry — SOLVED, and the failure is worth reading (D-076)

⛔⛔ **THE BUILDER PRODUCED FOUR DIFFERENT CEILING ANGLES AND VERIFIED EACH AGAINST ITS OWN FIGURE.**
⚠⚠ **The check could never fail because the measurement and the check shared the error.**

⛔ **Carl found it in one move: *"take the red line and move it up to where the ceiling meets the
wall. DO NOT alter the angle."*** ⚠ **A line truly parallel at a constant offset, lifted by that
offset, lands on the seam along its whole length. It did not.**

⛔⛔ **THE RULE THAT CAME OUT OF IT: WHEN A VALUE IS DERIVED FROM AN IMAGE, THE VERIFICATION MUST NOT
USE THAT VALUE.**

⚠ **Also corrected: the card is a PARALLELOGRAM, not a converging trapezoid.** The Builder
foreshortened the far end twice; at this shallow an angle it does not, and that convergence is why
every attempt read as tipping away from the wall.

⛔ **RESOLUTION: `app/proto/wall/` — a 4-point pinning tool. Carl drags, a homography follows.**
⚠ **THROWAWAY, on the D-053 dial pattern. Delete once the numbers are used.**
⛔⛔ **THE CORNERS ARE LOCKED IN `live-work/wall-card-corners-4-september.md`, FORCE-ADDED TO GIT.**

---

# ⛔ WHAT THE CARDS ARE — settled today, recorded in `wall-card-corners-4-september.md`

- ⛔ **STILL THREE.JS.** ⚠⚠ **The Builder suggested CSS would do it and was wrong: a plano-convex face
  REFRACTS backlight, and no CSS filter refracts.** **That behaviour is the section's argument, not a
  rendering convenience.**
- ⛔ **The pinned quad is the card's BACK face** — the plane touching the wall. The front bulges
  further forward. **Do not pin to the silhouette.**
- ⛔ **Geometry family: the answer cards, NOT the pill.** Flat back, convex face, visible rim, rounded
  corners. ⚠⚠ **Carl: *"the values can change. What the example shows is principle… variations on a
  theme."* The numbers are free to move; the family resemblance is not.**
- ⛔ **Floor pair: PORTRAIT** (*"their shorter sides will be on the top edge"*), smaller, flat back
  still, and **backlit — the "lens" at the front disperses the light.**
- ⚠⚠ **AN UNTESTED ASSUMPTION: `answer-card-glass.ts` was tuned for a FRONT-LIT card in a dark
  corridor (D-051). Transmission from behind is a different problem. Whether the approved glass does
  it unchanged is UNKNOWN.**

---

# ⚠⚠ THREE THINGS THE NEXT SESSION MUST NOT GET WRONG

## 1. ⛔⛔ A QUESTION IS NOT AN INSTRUCTION

⚠⚠ **THE BUILDER TWICE ANSWERED *"can you…?"* BY EDITING FILES, AND DESTROYED CARL'S POSITIONING WORK
BOTH TIMES.** ⛔ **Carl: *"Stop doing things off your own back. i asked if you could alter output, i
didnt even give instructions… And this is supposed to be a page about governance and process."***

⛔ **On a page whose entire argument is that governed AI stays inside its brief.** ⚠ **Answer the
question. Wait for the instruction.**

## 2. ⛔ THE BUILDER CANNOT MEASURE A PHOTOGRAPH

⚠ **Four attempts, four answers, every one self-verified.** ⛔ **Do not derive geometry from the room
image by eye or by pixel detection. Use Carl's pinned corners, or ask.**

## 3. ⚠ THE SAVED CORNERS ARE THE ACCEPTANCE TEST

⛔ **Render the Three.js card, screenshot it, and its corners must land on Carl's fractions.** ⚠ **That
is a check the Builder CAN run honestly, because it compares against Carl's numbers rather than its
own.**

---

# ⚠ STILL OPEN, CARRIED FORWARD

- ⛔ **The gold mark — translucent or opaque.** Carl's, unanswered.
- ⛔ **The §5a write-up.** Owed. **One canvas or two, host ownership, material reuse (an unlock —
  `answer-card-glass.ts` is protected D-051 work), and WHAT INSTRUMENT WATCHES IT, named before the
  build.**
- ⚠ **The floor plane, the lean angle, contact shadows.**
- ⚠ **`/proto/wall` is throwaway and still present.** Delete when done with it.
- ⚠ **The equal-drop constraint** — *"the distance from the ceiling must be the same for CA and CB"* —
  is **NOT yet satisfied** by the pinned corners.
- ⚠ **CB runs off the right edge of the frame** at the current pinning.
- ⚠ **Rounded corners and numeric corner entry were ASKED ABOUT and NOT BUILT.** ⛔ **Do not build
  either without an instruction.**

---

*4 September 2026. **The session's real work was subtraction:** a stale lint baseline taken to zero, a
record gap closed, and four confidently-wrong measurements replaced by an instrument that cannot lie
because Carl's hand is on it.*

*⚠ **And the section found its shape the hard way.** Carl: "this is why i said shapes first. i knew it
would be difficult, imagine doing this with three js card geometry from the off. we have a basis and
in more ways than one have truly gained perspective."*

---

# ⛔⛔ ADDED AT SESSION END — THE FLOOR PAIR, AND THE BUILD ORDER FOR NEXT SESSION

⚠⚠ **CARL: *"i think we have enough to build it next session."*** ⛔ **This section is the brief.**

## ⛔ THE BUILD ORDER — AGREED, AND THE FIRST STEP GATES EVERYTHING

> ⛔ ***"Agreed, setting up the camera comes first."***

| # | step | note |
|---|---|---|
| **1** | ⛔⛔ **THE CAMERA** | ⚠⚠ **A card only reads as IN the scene if the Three.js perspective matches the room's. Wrong camera and nothing downstream can save it — the cards float in a different space whatever their rotations.** ⛔ **Carl's PINNED WALL CORNERS are what solves this: they say where a plane on that wall projects to, which constrains the camera.** Corners: `live-work/wall-card-corners-4-september.md` |
| **2** | **The wall pair** | Built to the pinned corners. ⚠ **Those corners are also the ACCEPTANCE TEST — render, screenshot, and the corners must land on Carl's fractions** |
| **3** | **The floor pair, FACE-ON first** | ⛔ Carl: *"They can be built face on at first"* |
| **4** | **Then the two rotations, by eye** | ⛔ **LEAN BACK**, and ⛔ **BOTH FACE INWARD A LITTLE** (mirrored — left turns right, right turns left). ⚠ **These are DESIGN decisions, not values the photograph dictates. A slider, not a solve** |
| **5** | **Contact shadows** | see below |

## ⚠ THE FLOOR PAIR DOES NOT NEED THE PINNING TOOL — asked and answered

⛔ **The wall cards needed it because they had to MATCH A SURFACE** — a rectangle lying on a
photographed wall must agree with that wall's exact perspective, and being wrong is instantly visible.

⛔ **The floor cards do not match a surface, they STAND IN FRONT OF ONE.** ⚠ **Their angles are Carl's
to choose. Tune by eye.**

## ⛔ INDICATIVE FLOOR POSITIONS — POSITION ONLY, NOT DIMENSIONS

> ⛔ ***"about here. dimensions will change. this is only to indicate position"***

- **CD (floor left)** — far left of frame, in front of the left desk's near end
- **CS (floor right)** — far right of frame, in front of the right desk, against the snake plant
- ⚠⚠ **BOTH PUSHED TO THE OUTER EDGES. THE CENTRE FLOOR — where the chairs are — STAYS OPEN.**
  ⛔ **Consistent with the chair being the bridge: the middle of the room is not decorated.**
- ⚠ **Both were drawn cut off at the bottom of frame. UNDETERMINED whether that is intended.**

## ⛔ CONTACT SHADOWS — ROUTE TO BE CHOSEN AT IMPLEMENTATION

> ⛔ ***"we will decide the shadow route when implementing, i am liable to go with your
> recommendation."***

⚠ **THE BUILDER'S RECOMMENDATION, ON THE RECORD SO IT IS NOT RE-DERIVED: the COMPUTED CONTACT
SHADOW** — a soft gradient at the base, its length and direction driven by the orbiting light's
position. ⛔ **Not a true shadow map; an approximation, exactly like the CSS shine on the `/start` Send
button.** ⚠⚠ **It participates in the single lighting model, which IS the "one world" idea. And the
contact point is where the eye checks — a shadow that is right where the card meets the floor sells it
more than an accurate shadow across the whole room.**

⛔ **Alternatives and their costs are in `wall-card-corners-4-september.md`.** ⚠ **CARL HAS NOT
COMMITTED — he said he is LIKELY to take the recommendation. It is still his call at build time.**

⛔⛔ **ONE CONSTRAINT WHICHEVER ROUTE IS TAKEN: the photographed floor ALREADY HAS ITS OWN LIGHTING.**
⚠ **A shadow must DARKEN WHAT IS THERE — multiply, not overlay — or it reads as a sticker.**

## ⚠⚠ WHAT IS STILL NOT AUTHORISED

⛔ **THE §5a STRUCTURAL WRITE-UP IS STILL OWED.** ⚠ **"Enough to build it" is Carl's assessment of the
DESIGN readiness. It is not a waiver of the structural gate** — a Three.js surface on `/about` is a new
WebGL context on a route with none, and the record holds two worked cases of exactly that shape going
in unreviewed.

⛔ **The write-up is now NARROWER than it was this morning, because shape, position and geometry are
settled. What it must still answer:**

- **One canvas or two** (wall pair and floor pair, or all four).
- **Does `/about` share `/start`'s card host, or get its own?**
- ⛔ **Material reuse — `answer-card-glass.ts` is PROTECTED and D-051 approved. An unlock, and Carl's.**
  ⚠⚠ **AND IT CARRIES AN UNTESTED ASSUMPTION: that glass was tuned for a FRONT-LIT card in a dark
  corridor. The floor cards are BACKLIT. Whether it transmits unchanged is UNKNOWN.**
- ⛔⛔ **WHAT INSTRUMENT WATCHES IT — NAMED BEFORE THE BUILD**, so it cannot repeat
  `NextStepMeshButton`'s silence.
- ⚠ **The route's static prerender.** `/about` is currently 9/9 static.

---

# ⛔⛔ SECTION 4 — TWO BUTTONS TO DO, AND THEY ARE A MATCHED PAIR. Carl, 4 September 2026

> ⛔ ***"theres another three js button to keep in the family. that will be the major takeaway from
> here. the copy is good. button leads to start section"***
>
> ⛔ ***"yes theres another button at the bottom of the home page. 2 buttons to do. Geometry is clear,
> material isnt. its on my radar."***

## ⛔ THE TWO BUTTONS

| | where | goes to | status |
|---|---|---|---|
| **`Who we are`** | homepage §4 (`app/page.tsx`) | `/about` | ⛔ ruled to be rebuilt in Three.js (**D-069**), not built |
| **`Start a conversation`** | `/about` §4 | `/start` | ⛔ **same treatment, not built** |

⚠⚠ **THEY ARE ALREADY ON THE RECORD AS A MATCHED PAIR** — the sprint entry for the navigation work:
*"Section 4 of `/about` is the conclusion and carries the matching 'Start a conversation' → `/start`,
same dimensions, colour and position."*

⛔⛔ **SO THE JOURNEY IS: HOME → `/about` → `/start`, THE SAME BUTTON DOING BOTH HANDOFFS AT OPPOSITE
ENDS.** ⚠ **That is an argument for building them TOGETHER rather than separately: same geometry, same
material, one decision.**

## ⛔ GEOMETRY IS CLEAR. MATERIAL IS NOT

⚠ **Carl: *"Geometry is clear, material isnt. its on my radar."*** ⛔ **The geometry question is settled
by the family** — the existing `/start` Next step / Send button (D-031/D-032, approved). ⚠ **THE
MATERIAL IS AN OPEN QUESTION CARL IS HOLDING, not a gap in the record.**

⚠ **D-069 already says this in the same words: the button is to be rebuilt in Three.js *"reusing
existing geometry from elsewhere on the site; MATERIAL and LIGHTING are explicitly undetermined."***

## ⚠⚠ A DISTINCTION THAT WILL BE EASY TO CONFUSE LATER — STATED PLAINLY

⛔ **D-070 ruled the HOMEPAGE HERO button NON-NAVIGATIONAL** — *"I can definately say the button wont
be navigational."*

⛔⛔ **THAT RULING DOES NOT APPLY TO THESE TWO. BOTH OF THESE ARE NAVIGATIONAL BY DESIGN** — `Who we
are` goes to `/about`, `Start a conversation` goes to `/start`. ⚠ **Three buttons on two pages;
different rulings. A later session must not carry D-070's ruling across.**

## ⛔ SECTION 4's COPY IS GOOD AS IT STANDS — Carl

> ⛔ ***"the copy is good."***

**Current text, for the record:**

> **That is how the work gets done.**
>
> *A team with defined roles, a process that does not skip a stage, and nothing built before it is
> agreed. If that is the way you would want your own site made, the next step is a conversation.*

⚠ **It is a three-clause summary of exactly what §§1–3 demonstrate, and it puts the decision with the
reader rather than pushing.** ⛔ **No change wanted.**

## ⚠ WHY THIS IS "THE MAJOR TAKEAWAY FROM HERE"

⛔ **Carl's phrase.** ⚠ **Section 4 is the CONCLUSION of the page — the reader arrives having been
shown the roles, and the button is what they do about it.** ⛔ **It is the last thing on `/about` and
the first step into `/start`.**

⚠⚠ **AND IT IS ANOTHER INSTANCE OF THE "ONE WORLD" IDEA: the same button family appears on three
routes, so the site reads as one object rather than three pages.** ⛔ **Same reasoning as the mark
that does not move (D-065).**

## ⛔⛔ THE RULE FOR THE BUTTON FAMILY — Carl, 4 September 2026

> ⛔ ***"the geometry will stay the same, colour and material will change."***

⚠⚠ **THIS IS SHARPER THAN THE RECORD HAD IT. D-069 said material and lighting were *"explicitly
undetermined"*, which reads as NOT YET DECIDED.** ⛔ **What Carl has stated is a RULE, not a gap:**

| | |
|---|---|
| ⛔ **GEOMETRY** | **FIXED across the family.** The same form on every route |
| ⛔ **COLOUR AND MATERIAL** | **THE VARIABLES.** They change per instance |

⚠ **So the material question is not "what will the material be" — it is "what will it be HERE",
asked once per button.**

### ⚠⚠ IT IS THE SAME PRINCIPLE THAT GOVERNS EVERYTHING ELSE ON THE SITE

⛔ **THE MARK (D-065): *"No movement, only change."*** Position fixed across routes; colour changes by
section — gold, blue, gold.

⛔ **THE CARDS (Carl, today): *"the values can change. What the example shows is principle… variations
on a theme."*** Family resemblance fixed; numbers free.

⛔ **THE BUTTONS: geometry fixed; colour and material free.**

⚠⚠ **THREE ELEMENTS, ONE RULE: THE SITE'S IDENTITY LIVES IN FORM. THE VARIATION LIVES IN SURFACE.**
⛔ **A later session that changes a button's GEOMETRY to suit a page has broken the family; one that
changes its COLOUR has used it correctly.**

### ⛔⛔ AND THE REASON IS THE PAGE'S OWN ARGUMENT — Carl, correcting the Builder

> ⛔ ***"it is decided. decided to what is another matter. Having buttons all the same screams
> 'template'."***

⚠⚠ **THE BUILDER HAD FRAMED THE MATERIAL AS AN OPEN DECISION. IT IS NOT.** ⛔ **The decision — THAT
colour and material vary — IS MADE. What each one varies TO is a design question answered at build
time. Those are different things and the record must not conflate them.**

⛔⛔ **WHY IT MATTERS, AND IT IS NOT A PREFERENCE: THREE IDENTICAL BUTTONS ON THREE ROUTES WOULD READ
AS A COMPONENT REUSED — WHICH IS WHAT A TEMPLATE DOES, AND WHAT §1 SAYS C2B DOES NOT DO.**

⚠⚠ **THE FORM HOLDING WHILE THE SURFACE CHANGES IS THE VISIBLE PROOF OF BESPOKE: the same hand, a
different answer each time.** ⛔ **Sameness would be the tell.**

⚠ **It is also why the mark works as it does (D-065). If the mark changed colour by section and the
buttons did not, THE BUTTONS WOULD BE THE TELL INSTEAD.** ⛔ **The rule has to hold across every
repeated element or it fails at whichever one is exempt.**

### ⛔⛔ THE MATERIAL VOCABULARY — AND IT CONSTRAINS THE TWO UNBUILT BUTTONS

**The four materials already on the site:**

> ⛔ **IVORY · BLUE PLATINUM · BLUE OPAL · LIT SATIN**

⚠ **Carl's clue when the Builder was asked to spot the pattern: *"monetary value."***

⛔⛔ **THEY ARE ALL PRECIOUS OR LUXURY MATERIALS. NOT COLOURS — SUBSTANCES WITH WORTH.**

⚠⚠ **AND THE PATTERN HOLDS A SECOND WAY, WHICH IS THE USEFUL PART: NOTHING IN THAT LIST IS THE
VOCABULARY A TECH SITE WOULD REACH FOR.** ⛔ **No chrome, no carbon fibre, no brushed aluminium, no
titanium.** **It is the vocabulary of JEWELLERY AND FINE GOODS, not of engineering.**

⛔ **WHICH IS THE SAME CLAIM THE COPY MAKES:** bespoke rather than assembled; a thing with material
worth rather than a component that was cheap to produce.

### ⛔ THE RULE FOR THE REMAINING TWO

> ⛔ ***"We must keep the other buttons in the same vein."***

⚠ **So the material question for `Who we are` and `Start a conversation` is not open-ended. WHATEVER
THEY LAND ON COMES FROM THE SAME VOCABULARY.**

⛔ **A material that reads as INDUSTRIAL, MASS-PRODUCED OR SYNTHETIC BREAKS THE SET** — and it would
break it in the direction the whole page argues against.

⚠ **Carl, on the pun: *"excuse the precious minerals pun, it was unintentional at first."*** ⛔ **The
naming was not a system imposed up front — it emerged, and was then recognised and adopted. Recorded
so a later session treats it as a live rule rather than a coincidence.**

---

# ⛔⛔ WHERE `/about` SITS IN THE SCHEME OF THINGS — AND WHY IT RAISES THE BAR

⚠⚠ **THIS SECTION RECORDS A RELATIONSHIP, NOT A BRIEF.** ⛔ **THE HERO'S BRIEF IS NOT IN THIS
REPOSITORY AND IS NOT WRITTEN HERE — Carl had it stricken deliberately (D-070). A session reading this
still CANNOT plan the hero. Ask Carl.**

⛔ **What IS recorded, on Carl's instruction and because it changes how `/about` should be built:**

> ⛔ ***"what we do now is a forerunner to this last feature that will be built."***

## ⚠⚠ `/about` IS A REHEARSAL. EVERY MECHANISM IT NEEDS IS BEING PROVEN SOMEWHERE CHEAPER FIRST

| settled or being built | the mechanism it proves |
|---|---|
| The travelling light on the §2 cards | **a moving light source in a scene** |
| The CSS shine faked from the light's proximity (`/start` Send) | **non-mesh elements joining ONE lighting model** |
| The camera matched to the room photograph | **a 3D scene agreeing with a 2D ground** |
| The material family across four buttons | **surfaces that vary within one identity** |
| The mark changing colour by section (D-063) | **colour as STATE, not decoration** |

⛔⛔ **THE LAST FEATURE IS ALL FIVE AT ONCE, ON THE PAGE A VISITOR SEES FIRST.**

## ⛔ WHAT THIS CHANGES ABOUT HOW `/about` IS BUILT

⚠⚠ **WITHOUT THIS CONTEXT, THE §2 LIGHT RIG READS AS A NICE EFFECT FOR ONE SECTION. IT IS NOT.** ⛔ **It
is the FIRST WORKING INSTANCE of a mechanism the site depends on.**

⛔ **THE CONSEQUENCE IS A STANDARD, NOT A SCHEDULE:** ⚠ **build it to be reused, not to be finished.**
**A rig that works only for these four cards, or a faked response that only holds at one screen size,
passes §2 and fails the thing §2 exists to rehearse.**

⚠ **It also explains WHY THE LAST FEATURE IS BUILT LAST — beyond its brief being off-record. If the
light rig, the colour transitions, the faked response and the camera all work here, that build becomes
an ASSEMBLY JOB RATHER THAN AN INVENTION.**

## ⚠ AND IT REFRAMES ONE OPEN QUESTION — THE §2 CARD MATERIAL

⛔ **Carl is holding the possibility that the card material changes** — *"the material i have for the
about cards is frosted glass… the card material could change. im not saying it will. im just saying it
could."*

⚠⚠ **THE OPTICS ARE GENUINELY DIFFERENT, NOT A VARIATION:**

| | behaviour |
|---|---|
| **FROSTED GLASS** | ⛔ **SCATTERS.** Rough-surface diffusion — light comes out soft in every direction. ⚠ **Diffuses what is behind it, which HELPS TEXT READ** — and the cards carry 49–84 words |
| **DIAMOND-LIKE** | ⛔ **DISPERSES.** Very high refractive index (~2.42 vs glass ~1.5), total internal reflection, spectral separation. ⚠ **Backlit it throws CAUSTICS — concentrated hot spots and coloured fringes that move sharply.** ⛔ **High-contrast structure across the face FIGHTS legibility** |

⛔ **AND IT CHANGES THE FLOOR CARDS' LENS BEHAVIOUR IN KIND:** a plano-convex FROSTED panel diffuses
transmitted light; a plano-convex DIAMOND panel **focuses** it — a bright spot rather than a glow.

⚠ **The name would fit the material vocabulary better than any of the four already in use.**

⛔⛔ **THE REAL QUESTION IS NOT WHICH LOOKS BETTER. IT IS WHETHER §2 SHOULD ECHO THE LAST FEATURE OR
ANSWER IT** — frosted is a different register; dispersive would RHYME with it. ⚠ **Carl's, and not
yet decided.**
