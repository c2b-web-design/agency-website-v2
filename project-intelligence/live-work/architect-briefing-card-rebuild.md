# To the Architect — the Q&A card rebuild, at the outset

**Written:** 3 August 2026.
**From:** Carl, via the Builder, recording a design discussion held today.
**Status:** ⚠ **Briefing only. Not a chunk definition, not a plan, and it authorises nothing.**

---

## ⚠ WHAT IS BEING ASKED OF YOU RIGHT NOW: NOTHING. WAIT FOR THE PLAN.

**This file exists so you have the shape of the work before a plan arrives to react to.**
Carl's instruction, 2 August: *"We should tell the Architect exactly what we are doing at the
outset... it mirrors the client info process."*

**The plan for chunk 1 (geometry) follows separately** and goes through the plan-review gate
(`handoff-protocol.md` §2.5, D-043). ⚠ **Do not review, amend, or respond to this file as
though it were that plan.** It carries no implementation detail by design — the *how* is the
Builder's to write and yours to review, and that separation is the point.

---

## The one line

**Rebuild the Q&A answer cards and the Next step button in Three.js/WebGL.** Carl: *"This is
like remixing existing work."* ⚠ **A re-render, not a redesign.**

> *"All numbers for card appearance, filament speed etc will be used or converted. That's all
> good. We are only changing how the answers look and rebuilding the next step button."*

⚠ **EXISTING VALUES ARE INPUTS, NOT OBSTACLES.** Timings, choreography, filament speed, card
geometry, entrance sequencing — carried across or converted. **The design is not in question.
The medium is what changes.**

⚠ **SO THE REVIEW THIS NEEDS IS ABOUT FIDELITY AND RISK TO APPROVED LAYERS**, not about
whether the design is right.

**The prior brief `card-rebuild-brief.md` (2 August) still stands as background.** This file
supersedes it on three points, flagged ⚠ SUPERSEDES below.

---

## Why — a capability argument, not a taste one

Carl, having seen the contact field lit: *"By comparison in the Q+A the answer cards look
cheap. I like the idea, like the geometry, like the concept. It's like watching something in
1080p and we've just built something in 4k."*

⚠ **NOT A CRITICISM OF THE CARDS.** *"They are well made... but some of the effects I was
trying to get over in CSS can be done better with Three.js and WebGL."*

### The actual argument: secondary effects do not exist in CSS

> *"The white on the cards is supposed to represent light. The amber influencing the white is
> the filament effect. **What you don't see are secondary effects as the filament is in
> proximity to other cards.**"*

**In CSS the filament can only light itself. In a real scene it is a light source and every
neighbouring card responds for free.**

⚠ **THE CODEBASE ALREADY ADMITS THIS, TWICE — AND `GRID_REFL` IS THE PROOF.**
`enquiry-opening.tsx:173` is a 35-number hand-authored table of each card's amber contribution
to the Next step button, in seven directional channels, with clamps. Its own comment says
*"bottom-row cards (3,4) are the closest/strongest sources; the distant top-middle card (1)
only feeds a faint central catch."* Bottom row contributes 0.26–0.30, top row 0.04–0.16.

**That is a light-transport calculation performed by hand and frozen into a table.** Carl,
today: *"I need light to interact with the next step button. If cards 4+5 are selected that
would show more on the next step button."* ⚠ **In a real scene that is inverse-square falloff
and costs nothing.** `GRID_REFL` does not need porting — **it becomes the specification the
physics should reproduce.** If a lit scene does not roughly reproduce its 2:1 bottom-to-top
ratio, the setup is wrong.

`--sweep-pass` in `globals.css` is the same story at card level: a hand-timed masked amber wash
approximating light spilling onto the card's **own** face, reaching no other card.

---

## ⚠ THE CARD'S GEOMETRY — Carl's specification, given today

**His interpretation of what the CSS already implies, described from the top edge inward:**

> *"It already has a rim where the filament goes. What I imagine after that, if I describe just
> the top, is a 'slope' that comes toward us. Equidistant all the way around. Top, bottom,
> sides and corners. The face can be flat or slightly convex."*

**Cross-section, outside to inside — settled:**

| Element | Specification |
|---|---|
| **Rim** | ⚠ **A HALF-TUBE.** Carl: *"The rim should be a half tube, that way it will emit light onto the bevel and face, and if it's making a journey down the right hand side it will affect the 2 card and all other cards will be affected by proximity."* |
| **Bevel** | Equidistant slope inward and toward the viewer. **All four sides and the corners.** |
| **Face** | **Slightly convex** — Builder's recommendation, accepted |

⚠ **THE HALF-TUBE IS A LENS FOR THE LIGHT IT CARRIES**, and that is why it was chosen over a
flat rim. A flat rim emits roughly forward. A half-round presents every angle between face and
outer edge at once, so one geometry throws light three ways: inward onto the bevel and face,
outward to the neighbours, and at the viewer. **It is also already this project's vocabulary
for a lit edge** — the contact field's gold rim and the logo strokes are both half-tubes.

**Why convex rather than flat, and the third reason is the load-bearing one:**

1. A flat face is a mirror — one angle, so the whole face reads as a single tone. **This is
   what makes the current cards read flat.**
2. A flat face against a sloped bevel creates a hard crease; five creased cards read as
   machined panels, not glass.
3. ⚠ **THE FILAMENT IS COMING.** A travelling light on a flat face produces almost nothing. On
   a convex face the highlight *moves across* as the source travels — precisely D-044's
   finding: *"a travelling light on a sufficiently curved surface makes a static photograph
   look animated."*

⚠ **AND THE CONTACT-FIELD TILT FINDING APPLIES DIRECTLY.** A 1.2-unit crown on a 38-unit box
gives a maximum surface tilt of **5.67 degrees** — real, and invisible. The card is 48 units
tall. **It is the tilt angle that matters, not the depth number.** Any adjustable range must
reach angles that actually produce a visible shadow.

⚠ **RIM RADIUS AND BEVEL WIDTH SHARE ONE BUDGET.** On a 48px-tall card, a 3px tube plus a 6px
bevel consumes 9px per side and leaves 30px of face. **They must be chosen together, not
independently.**

---

## ⚠ MEASURED, NOT INFERRED — and it corrects the prior brief

**Measured from the rendered page, 3 August, at 1440 and 1280.**

| Property | Value |
|---|---|
| Card box | **186.66 × 48px** |
| Corner radius | ⚠ **14px** |
| Aspect | 3.89 : 1 |
| Grid | 576px, 6 columns, 8px gap; rows at y 492.8 / 548.8 |
| Free margin left of card 1 | **432px @1440, 352px @1280** |
| Entrance | `enquiry-card-rise`, **700ms linear**, opacity 0→1 + `translateY(6px)`→none |
| Entrance delays | **220 / 350 / 480 / 610 / 740ms** |
| Reduced motion | Entrance disabled |
| Hover | **400ms** — kept as a duration; what it drives changes |
| Filament | SVG `rect`, `pathLength="1"`, **2400ms**, `rgba(190, 145, 58, 0.80)` |

⚠ **SUPERSEDES (1) — THE RADIUS IS 14px, NOT THE 12px `rounded-xl` IMPLIES.** `--radius-xl:
calc(var(--radius) * 1.4)` is a project-wide override (`globals.css:45`). **The prior brief
recorded the token, not the rendered value.** A silhouette built to 12px would be quietly
wrong.

---

## ⚠ THE FILAMENT IS AMBER, NOT GOLD — SUPERSEDES (2)

**Carl, today:** *"The filament is not gold. It will be amber to echo the Q numbers in the rail
system."*

| | Value |
|---|---|
| Current filament | `rgba(190, 145, 58, 0.80)` |
| **Rail Q cue** | **`rgb(214, 166, 77)`** (`globals.css:1799`) |

**The filament is darker and duller than the rail's amber.** It reads gold-ish because it is
dim.

⚠ **AND THE DISTINCTION IS PHYSICAL, NOT NOMINAL. Gold is a material — a metallic surface
catching light. Amber is a light colour — it emits.** The rail's palette is amber for the Q
marker, teal for content (`rgb(125, 210, 205)` question, `rgb(160, 220, 218)` answers). **So
the Q number and the filament stop being two things that happen to match and become one thing:
the same light, marking where the user is.**

⚠ **AN EMISSIVE MATERIAL AT THAT RGB WILL READ BRIGHTER THAN THE SAME RGB AS TEXT**, because it
adds light rather than reflecting it. **A literal match may overshoot.** Anchor to the rail
value; make intensity adjustable; judge by eye.

**Behaviour is unchanged and approved (D-029):** the filament **draws** around the perimeter
over 2400ms. Carl: *"It will not fade in — it will use the same animation and timings as the
CSS filament."*

---

## The glass, and what sits behind it

⚠ **REFRACTION SHOWS WHAT IS BEHIND, AND THE PAGE IS NEAR-BLACK.** The card already carries
four of the five glassmorphism ingredients — `blur(14px) saturate(1.6)`, translucent gradient
fill, rim lights, internal diffusion. **The fifth is missing: something behind it to bend.**
`saturate(1.6)` is the tell — it is boosting the saturation of `#0a0a0a`.

**Carl on the material, today:** *"Should the glass be clear? No, it should be slightly frosted
but not enough that the logo cannot be legible or read."*

⚠ **THAT IS A MEASURABLE CONSTRAINT, NOT A TASTE ONE — legibility of the mark through the card
is the test.** It puts a floor and a ceiling on the blur. **The card almost certainly ends up
LESS diffuse than `blur(14px)`, not more.**

⚠ **AND IT PULLS AGAINST THE PRIOR BRIEF'S "MORE FADE RATHER THAN LESS".** If the user must
recognise the logo, fade has a **floor** below which the reprise fails. Fade level and text
contrast must be judged **together** — and the text is parked, so that judgement is partly
deferred. **Do not let a fade level be locked before there is text to check it against.**

---

## ⚠ THE BACKDROP IS THE LOGO, AND RECOGNITION IS THE POINT — SUPERSEDES (3)

**Carl:** *"It cannot just be colour to enhance the glass. It's our logo and the shape will
definitely imply that to the user. **The user must be able to recognise the logo.**"*

⚠ **THE PRIOR BRIEF TREATED THE MARK AS A TEXTURE THAT HAPPENS TO BE LOGO-SHAPED. THAT IS
WRONG.** It is the logo; enhancing the glass is what it does *while* being recognisable.

**It is 2D, and that is a choice rather than a compromise.** Carl: *"Can it be 2D? Yes, its
function is to enhance the glass."* **The glass supplies the dimensionality; a 3D backdrop
would compete — two lit objects, and the eye must choose a subject.** Every glassmorphism
reference Carl supplied puts *flat* colour behind the panel.

### The asset — and it removes the prior brief's whole selection problem

**`brand-assets/logo/c2b-flat-white-alpha-cleaned-1x.png`.** Inspected 3 August:

| Property | Value |
|---|---|
| Dimensions | 1301 × 768; mark bounds 1123 × 566 |
| Fully transparent | 68.3% |
| **Partial alpha** | **zero** |
| Opaque pixels | **100% pure `#ffffff`** |

⚠ **A HARD BINARY MASK — A STENCIL, NOT A RENDER.** Every other asset is a finished render with
material and lighting baked in; using one means inheriting someone else's light. **This carries
only the shape**, so colour, fade and motion are all driven rather than sampled.

⚠ **THIS SUPERSEDES THE PRIOR BRIEF'S CANDIDATE COMPARISON.** That file weighed
`transition-1-platinum-blue.png`, `Logo 2.2.png` and the teal lockup, each with a defect —
wrong background, wrong geometry, wrong era. **The mask sidesteps the question: no extraction,
no background to key, no inherited lighting.** Carl also intends to **design** the backdrop
within the letterforms rather than reuse a render.

⚠ **A CAVEAT ON THE MASK: zero partial alpha means hard edges that will alias if scaled raw.**
Behind heavily-faded, blurred, refracted glass this is largely irrelevant; the vector master
`c2b-logo-gold-hero.svg` exists if a clean edge is ever needed at size.

### The colour must move — slowly

**Carl:** *"The logo has blue and teal in it. It should not be static colours... something
changing to really enhance the glass. It could be a wipe, it could be a fade in of colours.
Nothing flash or dramatic, something that flows and keeps to the c2b ethos."*

> *"One example has blue on the left fading into teal on the right — those two colours could
> slowly exchange places. A wipe or series of wipes. Centre outwards, like the ivory button,
> L→R, top to bottom... **The key is slow and subtle. There will be text answers sat on top; we
> don't want to distract the user.**"*

⚠ **THE COLOUR LOGIC IS THE POINT, NOT THE EFFECT. Teal belongs to the rail, where answers
accumulate. Blue belongs to the cards, where the user chooses.** A mark moving between the
corridor's own two colours says the two systems are one journey — **a reason to be there, not
merely a nice thing.**

**Three structural observations for whoever designs it — offered as constraints, not choices:**

- ⚠ **A STATIC BACKDROP IS INERT UNDER GLASS.** Refraction is a lens; a lens over something
  unchanging just sits there. **Motion is what makes the bending visible.**
- ⚠ **RATE MATTERS MORE THAN PATTERN.** A 2-second wipe is an animation; the same wipe over 40
  seconds is weather. **Slow enough and the eye cannot detect motion directly — you only notice
  the colour differs from when you last looked.** That register is what "slow and subtle"
  means, and rate should be an adjustable control.
- ⚠ **STRUCTURE GETS SLICED BY THE CARDS.** Five cards cover only part of a 576-wide field and
  the counters of the `c` and `b` are open, so movement is visible *between* the cards as well
  as through them. **A single slow global transition will read; anything with internal
  structure will read as noise.**

⚠ **ONE CAUTION ON "CENTRE OUTWARDS, LIKE THE IVORY BUTTON": the ivory button's reveal is an
EVENT** — once, on a state change, meant to be noticed. **A looping radial pulse under text
reads as a heartbeat and is the most attention-grabbing of the listed options, not the least.**
Feasible at a slow enough rate; **the first to fail the distraction test.**

**Arrangement, settled earlier and unchanged: ONE mark behind the whole grid**, each card a
window onto a different part — the model already proven on the contact field. One logo per card
would reproduce the defect that model exists to prevent.

---

## Scope, and the order Carl set today

| # | Chunk | Contents |
|---|---|---|
| **1** | **Card geometry** | Silhouette, 14px radius, half-tube rim, bevel, convex face — **adjustable**. Flat diagnostic material. **No glass, no filament, no light, no text.** |
| **2** | **Glass** | The material, judged on settled form |
| **3** | **Logo backdrop** | ⚠ **The five CSS cards are removed at this point** and the mark is designed and placed in situ |
| **4** | **Filament** | Amber, 2400ms draw, no fade-in. **Crown/convexity revisited here** |
| **5** | **Rollout + Next step button** | Five cards, then the button |

⚠ **THE FILAMENT IS CHUNK 4, NOT PART OF CHUNK 1 — and Carl asked directly.** A light needs a
surface to act on; in chunk 1 that surface is deliberately featureless. **An amber emitter
raking a grey slab tells you nothing.** And it isolates the variable: if crown and filament
arrive together and it looks wrong, the cause is ambiguous — too shallow a crown, or too weak a
light?

⚠ **THE HONEST COST, STATED: CHUNK 1 ASKS CARL TO CHOOSE A CONVEXITY PARTLY ON FAITH.** Its
other job is to give the travelling filament something to catch, and that is not visible until
chunk 4. **Convexity is therefore PROVISIONAL after chunk 1 and is revisited.** A generous
control range makes revisiting a slider move rather than a rebuild. **Normal under mastering
(D-035) — a take, not a decision.**

⚠ **CHUNK 5 CANNOT BE THE BUTTON ALONE.** A single card cannot demonstrate near-versus-far, so
the button needs the full grid emitting. **The single-card chunks prove material and filament;
the secondary-effect payoff — the actual argument for the rebuild — is only visible at five.**

### Placement — Carl's instruction, today

> *"Put the new card just to the left of Card 1, top left. **It must not be built on top.** We
> can use it to compare and contrast."*

⚠ **BUILT ALONGSIDE THE LIVE CSS GRID.** Side by side, same vertical level, same size — one
CSS, one WebGL. **432px of free margin at 1440, 352px at 1280.** The approved cards keep
working; **nothing approved is touched until it is right.**

**Entrance:** matches card 1 exactly — **700ms at 220ms delay.** Carl: *"We will be moving it
at the appropriate time into place so the timing will stay."*

### Out, explicitly

- ⚠ **No animated light.** *"There would be no animated light."* **The filament is the only
  moving element.** This is not the orbiting light — **and because the light is static, the
  canvas can stay in `frameloop="demand"`.**
- ⚠ **No timing or choreography changes.** *"Timings and choreography all stay."*
- ⚠ **Text on the card is PARKED**, deliberately, and shared with the contact field: *"WebGL
  text stays parked for now, we will decide for both sections when the time comes."* **One
  answer, applied in both places.**
- **A–E glass variants likely do not port.** Under one backdrop, variation falls out of
  *position* — the windows model. ⚠ **To be verified by eye, not assumed.**

---

## ⚠ Approved layers this touches

**D-028** frosted blue glass (A–E) · **D-029** filament border · **D-030–D-032** blue-platinum
CTA and reflected amber including `GRID_REFL`.

⚠ **ALL APPROVED. The `CLAUDE.md` rule applies: stop, explain why, state the risk, and ask
before editing.** Building beside them is what keeps chunks 1–2 from triggering it. ⚠ **Chunk
3 removes the CSS cards and chunk 5 rolls out — both will trigger it, and both are Carl's call
at the time.**

⚠ **A PRACTICAL NOTE ON CHUNK 3:** removing the five cards leaves Q5 with no answers, so the
corridor cannot advance past it. **The page is temporarily non-functional at that step.**
Hiding them behind a flag instead would keep the flow working. **Not decided; flagged so it is
not a surprise.**

⚠ **AND THE PROJECT IS ABOUT FOUR MONTHS OLD.** First commit 6 May 2026, with roughly a month
preceding the repository. **The approved layers are the product of months of iteration**, not
of a fortnight.

---

## ⚠ No chunk-scope guard is active

**Stood down at the end of Day 7 and never rewritten.** Per `handoff-protocol.md` §2, the
guard is **opt-in — with no scope file present every edit is allowed.** Chunk 1 must ship its
own, declaring its new component file and `verify/_tmp-*.mjs` (findings F-6 / DL-1).

**PM/A drafts the values; Carl approves them with the prompt. `unlocked` is Carl's alone.**

---

## Environment notes carried from today

- ⚠ **`readPixels()` on the live canvas returns an EMPTY buffer** — three.js does not set
  `preserveDrawingBuffer`. **Screenshot the composited result instead.** Playwright bundles a
  PNG decoder (`playwright-core/lib/utilsBundle`); no new dependency.
- ⚠ **The four contact inputs exist in the DOM from Q4 onward inside a `visibility: hidden`
  wrapper.** "Inputs exist" is **not** "we reached completion" — it fires two questions early
  and silently measures a hidden overlay. **Cost two wrong readings today.**
- ⚠ **A derived verdict hid a real difference.** A "scene is changing" check could not
  distinguish an orbiting light from an entrance animation still settling; **the raw peak
  values separated cleanly.** Prefer the measurement to the conclusion drawn from it.
- **DPR 1 for screenshots** — DPR 2 exhausted the headless GPU on a continuous rAF loop.
- **`python3` is unavailable.** Use `node`, `sed`, or the Edit tool.

---

*3 August 2026. Nothing has been built and no code has been written for this rebuild. The plan
for chunk 1 follows separately and goes through the plan-review gate.*
