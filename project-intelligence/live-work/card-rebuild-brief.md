# The Q&A Answer Card — rebuild in Three.js

**Captured:** 2 August 2026.
**Status:** Working brief. **Not a plan and grants no implementation authority.**
**Purpose:** State what is being done and why, at the outset, so the Architect has the brief
before a plan exists rather than a finished plan to react to.

⚠ **This mirrors how the contact field ran** — brief first, then a plan through the
plan-review gate (`handoff-protocol.md` §2.5, D-043). Carl: *"We should tell the Architect
exactly what we are doing at the outset if that's the course of action you want to take, and it
mirrors the client info process."*

---

## ⚠ WHAT THIS IS, IN ONE LINE

**A re-render, not a redesign.** Carl: *"This is like remixing existing work."*

> *"All numbers for card appearance, filament speed etc will be used or converted. That's all
> good. **We are only changing how the answers look and rebuilding the next step button.**"*

⚠ **THE EXISTING VALUES ARE INPUTS, NOT OBSTACLES.** Timings, choreography, filament speed,
card geometry, entrance sequencing, the A–E glass variation — all carried across or converted.
**The design is not in question.** What changes is the medium.

⚠ **SO THE REVIEW THIS NEEDS IS ABOUT FIDELITY AND RISK TO THE APPROVED LAYERS**, not about
whether the design is right.

---

## Why — and it is a capability argument, not a taste one

**Carl, having seen the contact field lit:**

> *"By comparison in the Q+A the answer cards look cheap. I like the idea, like the geometry,
> like the concept. **It's like watching something in 1080p and we've just built something in
> 4k.**"*

⚠ **NOT A CRITICISM OF THE CARDS.** *"They are well made, I wouldn't have sent you an example
if they weren't, but some of the effects I was trying to get over in CSS can be done better with
Three.js and WebGL."*

### ⚠ The actual argument: the secondary effects do not exist in CSS

> *"The white on the cards is supposed to represent light. The amber influencing the white is
> the filament effect. **What you don't see are secondary effects as the filament is in
> proximity to other cards.** It's hinted at in the next step button."*

**In CSS the filament can only light itself. In a real scene it is a light source, and every
neighbouring card responds for free.**

⚠ **AND THE EXISTING CSS ALREADY ADMITS THE LIMIT — TWICE, IN TWO PLACES:**

| Mechanism | What it is | What it reveals |
|---|---|---|
| `--sweep-pass` (`globals.css`) | A masked amber wash hand-synced to *"the filament head crossing the top straight run"* | A manual approximation of light spilling onto the card's **own** face. **Reaches no other card.** |
| `GRID_REFL` (D-031/D-032) | A per-grid-slot table of each card's amber contribution to the CTA | Exists **only because CSS cannot compute light transport**, so the relationship had to be authored by hand per position |

⚠ **IN A REAL SCENE `GRID_REFL` BECOMES UNNECESSARY RATHER THAN NEEDING PORTING.** It is not a
feature to migrate; it is a workaround whose cause is being removed.

⚠ **AND THE SIX INSET BOX-SHADOWS ARE THE SAME STORY IN THE RESTING MATERIAL.** Top bright, left
secondary at a third of it, bottom and right as depth shadow — **a studio lighting model,
hand-painted, from a fixed direction.** In WebGL that is one light and a material.

---

## ⚠ THE PRECEDENT THAT MAKES THIS CREDIBLE NOW

Carl: *"We have tried this before, but not with this new governance system in, and not having
used Three.js and WebGL so successfully."*

**On 2 August the contact field went from reading flat to genuinely dimensional**, and the cause
was one number: a crown of 1.2 units on a 38-unit box gives a **maximum surface tilt of 5.67
degrees**, so its shadow lived in the last ~6 degrees of a 90-degree sweep — real, and
invisible. At 5.0 the tilt is 22.5 degrees.

⚠ **AND THE RESULT WAS EMERGENT RATHER THAN AUTHORED.** Carl: *"the gradients are animated...
that is so fckn cool."* **Nothing about the texture moves.** A travelling light on a
sufficiently curved surface makes a static photograph look animated. **That is precisely the
class of effect this chunk is after** — see D-044.

---

## Scope

### In

- **One card: Q5 top-left, `"Premium new website"`.** Carl: *"We build Q5 top left. Geometry
  first, we follow the same process."*
- **The Next step button**, later — *"could keep the same implied geometry but we do it in
  Three.js and possibly change the material."*

### Out, explicitly

- ⚠ **No animated light.** Carl: *"There would be no animated light."* **The filament is the
  moving element.** This is not the orbiting light.
- ⚠ **No timing or choreography changes.** *"Timings and choreography all stay."*
- ⚠ **Text on the curved surface is PARKED**, and deliberately shared with the contact field:
  *"we sort out the text issue after we have built it, and with the client info section as
  well."* **One answer, applied in both places.**

### The states

**Resting and hover** — *"The cards have a resting state and a hover state."* Plus selected,
which is what the filament expresses.

**The open question Carl posed, which this chunk exists to answer:** *"Could the effect of a
moving filament with the right reflective material be used?"*

---

## ⚠ HOW IT IS BUILT — in chunks, in isolation, and NOT in place

> *"We build one card and then roll it out."*
> *"Do it in chunks. Geometry first. We will then decide the right time to move it and when to
> implement light."*
> *"The CSS can stay in place for now. We reach the stage when Q5 answers can be deleted. We put
> the top left answer in place."*

⚠ **THE LIVE CSS GRID KEEPS WORKING THROUGHOUT.** The WebGL card is built in dedicated space
beside the corridor and judged there. **Nothing approved is touched until it is right** — the
same sequencing the contact field used, and the same isolation discipline that made the box
entrance judgeable at all.

⚠ **MOVING IT INTO PLACE AND INTRODUCING LIGHT ARE SEPARATE DECISIONS, BOTH CARL'S, BOTH
LATER.** They are not the natural end of the geometry chunk.

### Placement

**In the left viewport margin, beside the shell, level with the Q5 answer grid.** Carl:
*"Somewhere in the middle of the page, on the left so it doesn't interfere with the rail
system"* and *"put it where you want on the left, and tie its appearance to the top left
card."*

⚠ **THE MARGIN IS THE ONLY SAFE SPACE, AND THAT IS MEASURED.** `.enquiry-phrase-band` is
`left: 0; right: 0` — the corridor's phrases span the **full width** of the shell and are
centre-aligned inside it. **There is no free column within the shell.** Outside it:

| Viewport | Free margin each side |
|---|---|
| 1920 | 672px |
| 1440 | 432px |
| 1280 | 352px |
| 1024 | 224px |
| 900 | 162px |

A card is ~186 x 48. **Comfortable at 1280+, tight at 1024, not viable below ~900** — which is
acceptable for an isolated test object that is not yet part of the page.

### Appearance

**Tied to the top-left card's own entrance.** Measured: `.enquiry-cards-reveal .enquiry-card:nth-child(1)`
runs `enquiry-card-rise` for **700ms at a 220ms delay**. The WebGL card matches that clock, so
the two arrive together and can be compared from the first frame.

---

## ⚠ What was READ, so it need not be re-derived

**Card geometry.** Q5 top-left occupies grid columns 1/3 of a 6-column grid in the 576px
`max-w-xl` shell with 0.5rem gaps — **roughly 186 x 48px**, `min-height: 3rem`, `rounded-xl`.
Similar scale to a contact-field box, so **the same orthographic 1-world-unit-per-CSS-pixel
mapping applies**.

**The grid** is 6 columns with an offset second row — cards 4 and 5 at columns 2/4 and 4/6,
centred beneath the first three. Any in-place WebGL card must land pixel-exact on that.

**The material is four stacked layers** (`app/globals.css` from ~line 287): a 160° body
gradient; `::before` two radials for the frosted diffusion; `::after` three gradients for the
top-edge band, corner glint and left rim; and six inset box-shadows.

**The filament** (D-029) is an SVG `rect` with `pathLength="1"`, stroking the perimeter over
**2400ms**, colour `rgba(190, 145, 58, 0.80)`. Rendered in `enquiry-opening.tsx` ~line 698.

⚠ **THERE IS NO LAB ROUTE AND NO `components/lab/`.** The reference to
`components/lab/grid-layout.ts` inside `contact-field-geometry.ts` is **STALE** — the directory
does not exist. Only `app/page.tsx` and `app/start/page.tsx` exist.

---

## ⚠ WHAT IS TECHNICALLY AVAILABLE — checked against the installed three.js, not a blog

**Verified 2 August 2026 against `three@0.185.1` in `node_modules`.**

⚠ **`MeshPhysicalMaterial.transmission` REFRACTS OTHER OBJECTS IN THE SCENE, NOT JUST THE
ENVIRONMENT MAP.** The renderer draws the scene into a `transmissionRenderTarget` and the
transmissive material samples that texture — confirmed in `three.module.js` (the target is
created per camera at ~line 17977 and bound as `transmissionSamplerMap` at ~15479). **The
published documentation does not state this; the source does.**

**So real glass here would genuinely bend whatever sits behind it** — which is the property
every reference Carl supplied is actually showing.

### ⚠ THE HARD PREREQUISITE IS ALREADY SOLVED IN THIS CODEBASE

Transmission needs an environment map, and **`useStudioEnvMap` in `contact-field-canvas.tsx`
already generates one entirely locally** — a small scene of reflection panels converted by
`PMREMGenerator.fromScene()` on the GPU. **No HDRI, no CDN, no network request**, and it is
proven in production on the gold bevel.

⚠ **THAT MATTERS BECAUSE THE OBVIOUS PATH FAILED HERE ONCE ALREADY.** Passing `preset` or
`files` to drei's `Environment` triggers a remote fetch, and a 301 from the drei-assets host
went unhandled inside Suspense and left the scene blank **with no console error**. The local
generator exists because of that.

### The cost, stated plainly

- **`MeshPhysicalMaterial` is the most expensive material three.js ships**, per its own docs.
- **Transmission adds a full extra scene render per frame.**
- ⚠ **The enquiry canvas would no longer be able to run `frameloop="demand"` while glass is on
  screen** — the same change in kind the orbiting light already raised. **This must be a
  deliberate decision, not a side effect.**

**Reference reading:** Codrops on transmissive glass (2021) and the glass-torus refraction study
(2025); three.js `MeshPhysicalMaterial` docs for `transmission`, `thickness`, `ior` and
`dispersion` (the last being chromatic separation — *"only usable with transmissive objects"*).

---

## ⚠ WHAT GOES BEHIND THE GLASS — and why the question had to be asked

⚠ **REFRACTION SHOWS WHAT IS BEHIND. THE PAGE IS NEAR-BLACK, SO THERE IS NOTHING TO BEND.**
Every glass reference Carl supplied — Apple's Liquid Glass, the glassmorphism cards, the fluid
blobs — works because the glass sits over rich colour or imagery. **On a near-black page the
effect that makes those images striking has almost nothing to work with.**

⚠ **THIS IS A DESIGN PROBLEM SURFACED BY A TECHNICAL FINDING, NOT A TECHNICAL PROBLEM.** It
would have been discovered late and expensively — the glass would simply have looked flat, and
the natural but wrong response would have been to push the material harder.

**The contact field already solved the same problem** by putting the shared satin field behind
the four boxes. **The cards need an equivalent.**

### Carl's answer: the platinum-blue logo

> *"We could put something behind the cards, not the gold logo but the platinum blue one. It
> would have to be faded so as not to interfere with the answers."*

### ⚠ WHICH BLUE LOGO — there are several, and the first pick was wrong

**Carl:** *"There are various blue logos in the brand assets file, some interestingly with
blue+teal."* ⚠ **A first pass at this brief named `Logo 2.2.png` before the folder had been
surveyed properly. That was premature.** The candidates, all inspected 2 August 2026:

| Asset | What it is | Fit |
|---|---|---|
| `transition/c2b-transition-1-platinum-blue.png` | ⚠ **Icy platinum, cool blue edge definition, ALREADY ON A DARK BACKGROUND.** Frame 1 of the documented gold ⇄ blue hero transition | ⚠ **Strongest candidate** |
| `Logo 2.2.png` | Deep navy → cyan, fine gold hairline edging | Good colour, **but on WHITE** — needs extraction |
| `transition/c2b-ref-blue-chrome-warm-rim.png` | Blue chrome, warm amber rim light | ⚠ **Geometry does NOT match the master** — material study only, never a logo variant |
| `origins/c2b-01-teal-flat-lockup.png` | Navy → teal flat vector lockup with wordmark | The brand's **historical** identity, not the current metallic direction |

⚠ **THE TRANSITION FRAME IS PROBABLY THE RIGHT ONE, AND FOR A REASON BEYOND ITS BACKGROUND.**
`brand-assets/logo/transition/README.md` documents it as the **"code" end state** of a hero
gold ⇄ blue-platinum transition, with its own concept doc
(`hero-logo-transition-concept.md`) and an intended Three.js implementation route on the vector
master. **If the blue logo's earlier appearance is that hero transition, then the reprise should
almost certainly echo the state the user actually saw.**

⚠ **BUT CARL HAS NOT SAID WHERE THE FIRST APPEARANCE IS, SO THIS IS INFERENCE AND MUST BE
CONFIRMED, NOT ASSUMED.**

⚠ **AND THE TRANSITION FRAMES ARE REFERENCE, NOT PRODUCTION ASSETS.** Their own README is
explicit: backgrounds are baked in with no alpha, and *"the geometry in some frames does not
match the master."* **The production route is the vector master
(`c2b-logo-gold-hero.svg`) with material properties driven in Three.js** — same geometry
throughout. That route suits this chunk exactly, since the card scene will already have a
locally generated environment map.

⚠ **A KNOWN GAP, RECORDED IN THAT README:** a **teal/copper** variant was generated and lost
before it could be saved. Judged *"more saturated than the brand line permits"*, so its loss is
not material — noted only so it is not hunted for.

**Why it fits, beyond being available:**

- ⚠ **It is already the page's blue family.** The navy-to-cyan run is the same path as the Send
  opal (`#163a8f → #114aa5`) and the satin field's compressed range. It sits in the palette
  rather than importing a new one.
- **The gold hairline ties back to the filament and the contact rims** without competing,
  because it is a line rather than a mass.
- **Platinum-blue over gold is right on hierarchy grounds.** Gold is the corridor's accent —
  Q-labels, the filament, the contact rims. **Gold behind the cards would compete with the
  filament that is meant to be the event.**

### ⚠ IT IS A REPRISE, NOT AN INTRODUCTION

**Carl, 2 August 2026:** *"The blue logo will already have made an appearance. Not telling
where yet, it will be a reprise for it, in true C2B ethos style."*

⚠ **THE LOCATION IS DELIBERATELY WITHHELD AND MUST NOT BE GUESSED OR DESIGNED AROUND.**

⚠ **BUT THE ASSET SURVEY MAKES ONE READING LIKELY, AND IT RAISES THE STAKES.**
`hero-logo-transition-concept.md` documents a **hero gold ⇄ blue-platinum transition** as the
site's opening move — a cinematic arrival that hands over to a live coded logo, so *"the brand
becomes active rather than just playing a finished render."* **If that is the first appearance,
the reprise behind the answer cards is a callback to the site's opening gesture**, not merely a
texture that happens to be on-brand.

⚠ **WHICH ARGUES FOR RESTRAINT RATHER THAN PRESENCE. A callback that is too loud repeats a
moment that should stay singular.** ⚠ **Still inference. Carl has not confirmed it and it must
not be built on.**

**But the fact that it is a reprise changes the treatment.** The user has met this mark before,
so seeing it again behind the answers is **the site remembering something it showed them** —
not a brand stamp. ⚠ **A reprise works because it is half-recognised, which argues for MORE
fade rather than less.** And it argues for **one mark behind the whole grid** rather than one
per card: a reprise should feel like the same object glimpsed again, not five copies of it.

### Settled by Carl

| Question | Answer |
|---|---|
| Arrangement | ⚠ **ONE large mark behind the whole grid.** Each card reveals a different part — the **windows model**, exactly as the contact field works. Variation falls out of position rather than being authored |
| Fade level | ⚠ **BUILD IT ADJUSTABLE AND JUDGE BY EYE**, as the light rig was. Not a value to be chosen in advance |

⚠ **THE WINDOWS MODEL IS THE POINT OF THE ARRANGEMENT, AND IT IS ALREADY PROVEN HERE.** Carl on
the contact field: *"no boxes the same. No boxes with a slight variation of the same idea."* One
logo per card would reproduce exactly the defect that model exists to prevent.

---

## ⚠ Approved decisions this touches

**D-028** frosted blue glass, five A–E variants · **D-029** the filament border · **D-030 to
D-032** blue-platinum CTA and reflected amber, including `GRID_REFL`.

⚠ **ALL APPROVED, AND THE `CLAUDE.md` RULE APPLIES: stop, explain why, state the risk, and ask
before editing.** Building beside them rather than on them is what keeps this chunk from
triggering that rule prematurely — **but the rollout will.**

⚠ **AND THE PROJECT IS ABOUT FOUR MONTHS OLD, NOT EIGHT DAYS.** The approved layers are the
product of months of iteration. Git undercounts it: first commit 6 May 2026, with roughly a
month of work preceding the repository.

---

## Proposed first chunk

**Geometry only.** The card's silhouette, corner radius and scale as a WebGL object in the left
margin, in a neutral diagnostic material — **no glass, no filament, no light.** Placement and
form proved before any material decision, exactly as the contact-field box began.

⚠ **NOTHING IS AUTHORISED BY THIS FILE.** The plan follows, and goes through the gate.

---

*2 August 2026. Nothing has been built and no code has been written.*
