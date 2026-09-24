# §5a/5b STRUCTURAL NOTE — the photographic backplate

**Written 17 September 2026 by the Builder, on Carl's instruction, BEFORE any code is written.**
⛔ **Nothing in this note is built. It exists to be routed to the Architect by Carl.**

**Rule 5a** requires a structural decision to stop for review before it is built.
**Rule 5b** requires every behaviour the current structure provides to be enumerated first —
including what it provides *by accident of where it sits*.

---

## ⛔ WHAT IS PROPOSED

**Load the room photograph as a texture on a camera-aligned plane inside the Three.js scene,
behind the cards, so that `MeshPhysicalMaterial` transmission refracts the actual photograph.**

**This supersedes the sampled-proxy method** ruled on 14 September 2026.

### ⚠ THE SUPERSEDED RULING WAS NOT WRONG — IT WAS OVERTAKEN

⛔ **Record it that way, per `context-rules.md` → *Approved work is amendable* and the
D-046/D-048 precedent.** Writing it up as a mistake would be both false and corrosive.

The proxy ruling existed to work around a real constraint, recorded at
`answer-card-geometry.ts`: ***"The frost was never the problem; the absence of anything worth
seeing through was."*** A WebGL card can only refract objects in its own scene, so the proxy
**approximated** what sits behind each card — flat sampled hexes for the walls (CA `#182733`,
CB `#192a35`), small vertical gradients at measured heights for the floor pair.

⛔ **The backplate removes the premise rather than the problem.** Put the photograph in the
scene and there is nothing left to approximate.

**Carl's reasoning, 17 September 2026:** *"It was approved, but when new information is
discovered of different techniques that would undoubtedly improve the outcome, its only logical
to look at them."* ⚠ **This is the DAW model working as intended** (`working-with-carl.md`) — a
decision taken during tracking is a take, not a master.

### What the supersession retires

| Retired | Was for |
|---|---|
| CA `#182733` / CB `#192a35` flat samples | the wall pair's proxy |
| Per-card vertical gradients at measured heights | the floor pair's banded proxy |
| `PROXY_CONTRAST` dial | tuning the approximation by eye |
| *"CD and CS get INDIVIDUAL backgrounds"* | each card needing its own hand-built proxy |
| The open unknown: *"whether they read as depth or as wallpaper is unproven — a gradient has no parallax"* | ⛔ **MOOT.** It is the real projection, not an approximation of one |

⚠ **The sampling METHOD Carl specified is also retired, and its precondition is now irrelevant:**
*"note their position and the pixels they are covering will act as a guide."* Transmission
samples whatever is behind the card at its current position, with no bookkeeping. **This is why
"the cards may move very slightly" stops being a constraint at all.**

---

## ⛔⛔ WHY THIS IS STRUCTURAL

**The §5a test:** *am I implementing a chunk, or deciding something a future reader must live
with?* A future reader will ask **"why is the room inside the canvas?"** — that is structural.

Against §5a's own list, it hits three entries:

| §5a category | How |
|---|---|
| **A new mechanism where an existing one could have served** | `next/image` serves the room today. This replaces it with a GPU texture |
| **A change to what owns, mounts and destroys a component** | The room's lifetime becomes the canvas's lifetime |
| **A second source of truth for a measurement** | ⚠ **Only if the DOM image is KEPT.** See the replace/duplicate question below |

⛔ **It is NOT in the warm-up-canvas family.** No second canvas, no second WebGL context, no
second renderer. It is a mesh in the existing scene. **That distinction is the reason this note
is short rather than an objection.**

⚠ **But the warm-up canvas was also "just a small addition inside an approved chunk", and it
cost four sessions to diagnose.** The failure was never the code — it was that **nobody reviewed
the shape.** This note exists so that cannot be said of the backplate.

---

## ⛔⛔ THE RULE 5b ENUMERATION — what the current `<Image>` provides

**The current structure:** `app/about/page.tsx:604` — a `next/image` `<Image fill sizes="100vw"
className="object-contain">` in normal document flow, with a `bg-neutral-950/25` scrim over it.

⛔ **Silence is not an answer. Every behaviour below is either preserved, or stated as not
mattering, with a reason.**

| # | What it provides | By design or by position? | Under a backplate |
|---|---|---|---|
| 1 | **Responsive per-device delivery** | By design (D-075) | ⚠ **CHANGES.** One file for all devices. Measured below — desktop improves, phone regresses |
| 2 | **Paints before any JS runs** | By position — it is server-rendered HTML | ⛔ **LOST if replaced.** A canvas paints only after React mounts, Three.js initialises and the texture decodes. **A blank section until then** |
| 3 | **Survives JS failure entirely** | By position | ⛔ **LOST if replaced.** No JS, no room |
| 4 | **Survives WebGL context loss** | By position | ⛔ **LOST if replaced.** Context loss currently costs the cards; it would then cost the room too |
| 5 | **Native lazy loading** (`:533` — no `priority`, correct while below the fold) | By design | ⚠ **LOST.** A texture loads when the scene asks. **Not automatically worse — but it is no longer the browser's decision** |
| 6 | **`object-contain` letterboxing geometry** | By design, and **load-bearing** | ⚠ **MUST BE REPRODUCED EXACTLY.** `:658`, `:776-795` record that the whole page's geometry tracks `object-contain`'s own box |
| 7 | **The `bg-neutral-950/25` scrim sits over it in DOM order** | By position | ⚠ **Must move into the scene or over the canvas.** Trivial, but it is a real behaviour |
| 8 | **Crawler / non-visual access** | By position | ⚠ **Already `alt="" aria-hidden="true"` — decorative by decision.** ⛔ **So this one genuinely does not matter, and that is stated rather than assumed** |

### ⚠⚠ THE TWO THAT MATTER, AND THEY ARE THE SAME ONE

⛔ **Items 2, 3 and 4 are one behaviour: the room currently survives everything the canvas can
fail at.** Nobody wrote that down. It is provided entirely by the `<Image>` sitting in normal
document flow, exactly as `litCards` surviving a question boundary was provided by DOM nesting.

⚠ **This is the §5b worked case repeating.** On 14 August, moving the canvas out of the grid made
all five cards unclickable — *"geometry byte-identical, every instrument green, no harness
asserted a card could be clicked."* **Nothing today asserts the room is visible.**

---

## ⛔ THE REPLACE-vs-DUPLICATE QUESTION — Carl's to decide

⚠⚠ **THIS IS THE ONE DECISION THAT DECIDES WHETHER D-075 IS REINSTATED.**

### Option A — REPLACE the `<Image>` with the backplate

- ⛔ **D-075 stays clear and desktop IMPROVES** — 57.0KB against today's 103.2KB
- ⛔ **Loses items 2, 3, 4** — the room no longer survives JS failure or context loss
- ⚠ The section is blank until the canvas is ready

### Option B — KEEP the `<Image>`, add the backplate behind the cards

- ⛔ **D-075 IS REINSTATED.** 103.2KB + 57.0KB = **160.2KB**, worse than today on every device
- ⛔ **Creates a §5a "second source of truth"** — the same room in two places, which must agree
  pixel-for-pixel or the glass shows a different room than the page does
- ✔ Keeps items 2, 3, 4

### Option C — REPLACE, plus a CSS background-image fallback on the section

- ⛔ **D-075 stays clear** — a CSS background is not fetched when the canvas covers it... ⚠ **and
  that claim is UNVERIFIED. Browsers vary on whether an obscured background is fetched.**
  **Measure before relying on it.**
- ✔ Recovers items 2, 3, 4 approximately
- ⚠ Two encodings of one image to keep in step

⛔ **RECOMMENDATION: Option A**, unless Carl wants the failure-mode cover, in which case **C after
its fetch behaviour is MEASURED, not assumed.**

---

## ⛔ MEASUREMENTS — taken 17 September 2026 against the running dev server

⚠ **Measured, not estimated. `next/image` figures are real HTTP responses from localhost:3000;
backplate figures are real `sharp` encodes of `public/about-studio-wall-only.jpg` (1800x1200).**

### What `next/image` ships today

| Viewport | Delivered |
|---|---|
| 640 | 20.1KB |
| 750 | 25.7KB |
| 1080 | 43.7KB |
| 1200 | 51.3KB |
| **1920 / 2048 / 3840** | **103.2KB** |

⚠ **IT CAPS AT 103.2KB.** The source is 1800px wide, so 2048 and 3840 return an identical file.
**Nothing above 1800 costs a visitor anything more.**

### What a backplate would cost — one file, all devices

| Width | WebP q80 | WebP q75 | **AVIF q55** |
|---|---|---|---|
| 1024 | 51.0KB | 40.3KB | **32.9KB** |
| 1280 | 73.7KB | 57.0KB | **44.3KB** |
| 1536 | 95.7KB | 75.6KB | **57.0KB** |
| 1800 | 132.4KB | 103.2KB | **81.6KB** |

### ⛔ THE FINDING

**A 1536px AVIF backplate costs 57.0KB — 46% LESS than the 103.2KB `next/image` delivers at
1440.** At full 1800px, AVIF is 81.6KB, still 21% under today's desktop cost.

⛔ **D-075 IS NOT REINSTATED BY OPTION A.** The regression D-075 removed was shipping a 2560px /
459KB file to every device. This is a fraction of that, and on desktop it beats the responsive
pipeline outright — **because `next/image`'s advantage is per-device SIZING, and at 1440+ there
is no sizing left to do.**

### ⚠ WHERE IT COSTS MORE, STATED HONESTLY

⛔ **Phones.** A 640px phone gets **20.1KB** today and would get **57.0KB** from a fixed 1536
backplate — **2.8x more.** ⚠ **This is the true trade and it must not be buried:** D-075's own
argument was *"THE SAVING IS LARGEST ON THE DEVICE WITH THE WORST CONNECTION."*

**Three routes, all viable:**
1. A 1024 AVIF at **32.9KB** — 1.6x the phone cost, and **still below today's desktop figure**
2. Two backplates, swapped at a breakpoint — restores per-device delivery at the cost of a second file
3. Accept it — a phone renders the cards small, so texture detail matters least there

### ⛔⛔ CARL'S RULING, 17 September 2026 — DESKTOP IS THE TARGET, AND PHONE IS A MASTERING ITEM

**Carl:** *"If i were visiting a Web Design site i would want to view it optimally on a PC. I
might well view it on my phone first but i would definately want to view it on a larger screen
and in the best place."*

⛔ **THE BACKPLATE IS SIZED FOR THE DESKTOP VIEW. ONE FILE, NO BREAKPOINT SPLIT.** Resolution is
chosen **by eye on the real screen** (Rule 9), not by byte count.

⚠⚠ **THIS DOES NOT OVERTURN D-075 AND MUST NOT BE READ AS DOING SO.** D-075's argument — *"THE
SAVING IS LARGEST ON THE DEVICE WITH THE WORST CONNECTION"* — was made about **a decorative
background delivered by `next/image` on a page with no other use for the bytes.** It is a
cost/benefit judgement, not a universal rule, and **the benefit side moved** when the plate
became the thing the glass refracts.

⛔ **The reasoning is the site's own:** a visitor arrives on a phone, gets the gist, and returns
on a desktop when they are actually evaluating C2B. **The desktop view is where the decision is
made; the phone view has to be good enough to earn the second visit.** Optimising the showpiece
for the device where nobody decides anything optimises the wrong end.

⚠ **The measurement agrees rather than merely permits:** at 1536 AVIF the desktop visitor gets
**57.0KB against today's 103.2KB — 46% LESS on the device that matters most.**

⛔ **RECOMMENDED: a single 1536 AVIF at 57.0KB.** A 1024 at 32.9KB would save a phone 24KB and
cost the desktop visitor sharpness — **backwards, given the ruling.** ⚠ Whether 1536 is enough on
a large desktop, or whether it wants 1800, is a **bench question**: the frost softens the plate,
so less resolution may be needed than a sharp image would want. **Test both once the glass
exists.**

### ⛔⛔ PHONE OPTIMISATION IS A MASTERING-PASS ITEM — Carl, 17 September 2026

**Carl:** *"When the site is finished and 'mastering' is carried out, this will include phone
optimisation. There should be a note about this."*

⛔ **THE PHONE FIGURE IS DEFERRED, NOT ACCEPTED.** ⚠ **The distinction is load-bearing and this
project has a recorded precedent for getting it wrong** — `current-sprint.md` carries the case of
a **satisfaction filed as a fix**, which brought the same item back twice.

**The correct status is PROVISIONAL** (`context-rules.md`): *"In place, deliberately untuned,
awaiting the mastering pass (D-035). Not 'unapproved' and not a gap — reviewers must not raise a
missing approval entry for provisional work."*

⛔ **SO: the 57.0KB phone cost is PROVISIONAL, carried deliberately, and belongs to the mastering
pass — which is the DAW model's final stage (D-035) and covers the whole site, not this card.**

⚠ **WHAT A FUTURE SESSION MUST NOT DO:**
- ⛔ **Do not "fix" the phone cost mid-build.** It is carried by decision, not by oversight.
- ⛔ **Do not read it as a D-075 regression.** D-075 governs `next/image` delivery of the DOM
  image; this is a GPU texture, and the desktop figure IMPROVES.
- ⛔ **Do not record it as resolved.** Nothing has been done to it.

⚠ **WHAT THE MASTERING PASS INHERITS, so it does not have to re-derive it:**

| Item | Figure | Note |
|---|---|---|
| Phone backplate cost | **57.0KB** at 1536 | against **20.1KB** from `next/image` today |
| Cheaper option already measured | **32.9KB** at 1024 AVIF | costs desktop sharpness |
| Breakpoint split | two files | restores per-device delivery |
| ⚠ **GPU memory on a low-end phone** | **8.0MB** at 1536 | ⛔ **the resident cost, and the one that is NOT a transfer figure** |

⛔ **THE GPU FIGURE IS THE ONE TO REVISIT, NOT THE BYTES.** 57KB is unremarkable on any modern
phone; **8MB of VRAM on a low-end device is not**, and no transfer measurement will ever show it.

⚠ **UNASSERTED — nothing in code checks any of this.** Per `context-rules.md`: *"An invariant
that lives only in prose is not asserted — gate it or expect it to rot."* **This note is prose.
It will not tell anyone the day it stops being true.**

### ⚠⚠ THE COST NOBODY HAS MENTIONED — GPU MEMORY

**Bytes are the TRANSFER cost. A texture is UNCOMPRESSED once decoded, and that is the RESIDENT
cost:**

| Texture | Base | With mipmaps |
|---|---|---|
| 1024x683 | 2.7MB | **3.6MB** |
| 1536x1024 | 6.0MB | **8.0MB** |
| 1800x1200 | 8.2MB | **11.0MB** |

⛔ **An 81.6KB AVIF becomes 11MB of VRAM.** Not a reason against it — comfortably within budget
for one texture — **but it appears in no transfer measurement and it is the number that matters
on a low-end phone.**

⚠ **UNASSERTED: nothing in code checks texture memory.** Per `context-rules.md`, this is stated
as unasserted rather than implied to be safe.

---

## ⚠ WHAT THIS COUPLES TO

1. ⛔ **`object-contain` geometry.** `:658` and `:776-795` record that the page's geometry tracks
   `object-contain`'s box. **The backplate must reproduce that framing exactly or every solved
   card position moves.** ⚠ The camera is solved and falsified at 0.6°; both cards sit corner-exact
   at **1.11e-16**. **That precision is spent if the plate's framing shifts by a pixel.**
2. ⛔ **Colour space.** `contact-field-canvas.tsx:806`: *"`SRGBColorSpace` is REQUIRED on a colour
   map. Omitting it double-applies the transfer function."* ⚠ **This is exactly the brown/grey
   muddying to avoid — one line, known failure.**
3. ⛔ **Transmission doubles the program count.** `answer-card-canvas.tsx:3447` records the
   diagnosis: the transmission pass renders at linear + `NoToneMapping` while the canvas is sRGB +
   ACES, **both of which are in three's program cache key — 777ms of the opening stutter.**
   ⚠ **The remedy already exists: the 1x1 probe-target warm.** ⛔ **Reuse it. Do NOT add a second
   canvas.**
4. ⚠ **Which plate.** `about-studio-wall-only.jpg` carries PAINTED cyan/magenta guide quads. **A
   production backplate needs the CLEAN plate** — `about-studio-source.jpg` (2560x1707) or a clean
   1800 export. ⛔ **All three are 1.500 framing, so the crop does not move.**
5. ⚠ **`priority` inverts.** `:533` records that if the travelling-image idea lands, this becomes
   the LCP element. **A backplate is never the LCP element — it is not a DOM image.** The note at
   `:533` goes stale the day this is built and must be corrected in place.

---

## ⛔ WHAT IS STILL NOT AUTHORISED

1. ⛔ **Chunk 2 — the glass material.** The face is the grey diagnostic by instruction:
   *"CHUNK 1: GEOMETRY PROOF ONLY... no glass."* **A backplate with nothing transmissive in front
   of it shows nothing.**
2. ⛔⛔ **FROSTED — DECIDED BY CARL, 17 September 2026.** *"About cards faces should be frosted
   glass, thats why the background is imporrtant."*

   ⚠⚠ **THE TWO DECISIONS ARE ONE DECISION, AND THE ORDER OF CAUSATION IS CARL'S:** the backplate
   is not a background that happens to suit frosted glass — **the faces are frosted, and that is
   WHY the background must be real.** ⛔ **A future session must not treat the backplate as an
   optimisation that could be reverted to a proxy; reverting it would leave the frost with
   nothing to see through, which is the exact failure recorded at `answer-card-geometry.ts`:**
   ***"The frost was never the problem; the absence of anything worth seeing through was."***

   ⛔ **THIS DOES NOT TOUCH D-051 AND IS NOT A REVERSAL OF IT.** D-051 (satin, superseding
   D-028's frosted blue glass) is an **APPROVED LAYER ON `/start`** and is **UNCHANGED,
   UNREVIEWED and NOT REOPENED.** ⚠ **Satin won there for a reason that does not apply here:**
   the answer cards had nothing behind them worth refracting. **The backplate removes that
   objection for `/about` ONLY.**

   ⚠ **Two different cards, two different materials, one consistent reason.** A reader who finds
   satin on `/start` and frost on `/about` is looking at a correct record, not a drift.
   ⛔ **Do not "harmonise" them.**

   ⚠ **STILL UNDECIDED and belonging to the bench (Rule 9):** the frost PARAMETERS — roughness,
   transmission, thickness, IOR. **Colourless** is stated in the brief; the rest is judged by eye
   under the swept light, not chosen in a plan.

   ⛔⛔ **AND CARL IS HOLDING FIGURES FOR THIS — 17 September 2026.** *"i have info on frosted
   glass creation with some figures. I will give you that at the appropriate time for you to
   consider."*

   ⛔ **DO NOT CHOOSE FROST PARAMETERS BEFORE CARL HANDS THOSE OVER.** ⚠ **The failure mode is
   specific and this project has already paid for it once:** the face crown opened at an outside
   recommendation's **0.015–0.03** and Carl's eye settled it at **0.073 — nearly three times the
   recommended starting point.** *"The conservative figure was too timid for a card this size in
   a dark room."*

   ⚠ **A starting value invented here would become the anchor Carl's figures get argued against,
   rather than the input they should be.** **Wait for them.**
3. ⚠ **Neon colour — UNDECIDED.** Carl, 17 September: red was *"just an example i used to
   describe the problem."* ⛔ **Red is NOT in the approved palette** (gold, platinum-blue, amber).
   **Do not inherit it from the diagrams.**
4. ⚠ **The travelling text highlight — not proposed for this chunk.** §14a: *"Build the track
   before adding automation — prove one object, one motion phrase, or one light behaviour before
   rolling it out."* **The one light behaviour here is the rim lighting the face and its copy.**
   ⚠ A raking light across a curved surface may already BE a travelling highlight, produced by
   geometry rather than a shader imitating one.
5. ⛔ **Accessibility.** Carl, 17 September: *"If you need to address the Accessibility — the
   chance to not repeat D-051-A11Y, you flagged then this should be done."* **A visually-hidden
   DOM layer carrying the card copy.** ⚠ **§2's copy is PROVISIONAL** (CA 64 / CB 84 / CD 49 /
   CS 56 words (recorded as 55 until 24 September 2026), four lines uncuttable) — **a DOM layer needs final copy or it is written twice.**

---

## ⛔ THE TEXT, AS SETTLED IN DISCUSSION — 17 September

**Not built, and recorded here so the reasoning is not lost.**

- ⛔ **The text is PART OF THE FACE, not a plate floating in front of it.** Carl's instruction.
  ⚠ The Builder first proposed a forward-offset mesh and **wrongly recorded Carl's preference as
  a ruling against the proposal.** Carl corrected it: *"I have not ruled against your proposal."*
- ⛔ **A coincident surface on the SAME quartic and the SAME UVs** — not offset, not flat, sharing
  the curvature so it bends with the card. Own material, so it is independently drivable, and it
  sits outside the transmission pass so the frost does not soften its own copy.
- ⛔ **LIT, NOT EMISSIVE.** Carl: *"the text should be influenced by the light."* ⚠ **Emissive
  IGNORES light** — it would stay equally bright whether the rim is lit or dark, which is the
  isolated overlay §14a rules out. **A lit material on the face's own normals means the neon rim
  lights the copy** — the same behaviour as the Q5 cards acting as amber light sources.
- ⚠ **The tension to judge on the bench:** text that takes light can also LOSE it. **Legibility
  has a floor that mood does not.** ⛔ Rule 9 — judged by eye under the sweep, not predicted here.
- ⚠ **The face UVs are load-bearing** — the face had no `uv` attribute at all until the
  normal-map test added one. **The text lands on exactly that rectangular mapping.**

### ⛔ THE FROST RULING CONFIRMS THE TEXT ROUTE — it was conditional until 17 September

⚠ **The coincident-surface route was recommended on a CONDITION that is now met.** The stated
reasoning was: *"the reason to prefer it over emissive-on-the-face-material is legibility under
transmission, and transmission isn't parameterised yet — under a light frost, emissive text on
the face itself may read perfectly and is simpler."*

⛔ **Carl has now ruled the faces FROSTED. So the condition resolves in favour of the separate
coincident surface**, for a reason that is no longer a guess:

**Text baked into a transmissive face's albedo is refracted and diffused BY THAT FACE.** The
frost would be softening its own copy. ⚠ **This is the `/start` route — `answer-card-mesh.tsx:799`
binds the label `CanvasTexture` as `map` on the face material — and it works there ONLY because
D-051 chose satin, which does not transmit.**

⛔ **THE SAME CONSTRUCTION WOULD FAIL ON A FROSTED FACE.** ⚠ **Do not copy the `/start` text
implementation across.** It is correct for satin and wrong for frost.

⚠ **STILL A BENCH QUESTION (Rule 9):** how far the coincident surface must sit outside the
transmission path, and whether the frost's diffusion still touches it. **Predicted, not measured.**

---

---

# ⛔⛔ THE LIGHTING SYSTEM — DESIGNED 17 September 2026, NONE OF IT BUILT

⚠⚠ **READ THIS HEADING LITERALLY. Everything in this section is DESIGN. Not one light behaviour
has been built, measured or seen.** ⛔ **Nothing here is authorised.**

## ⛔ THE GOAL IS UNCHANGED — ONLY THE IMPLEMENTATION IS BETTER

**Carl, 17 September 2026:** *"the goal remains the same with this element. We have just got a
better way to implement it."*

⚠⚠ **THIS IS THE SAME PATTERN AS THE BACKPLATE AND IT MUST BE RECORDED THE SAME WAY.** The
11 September Fusion-glow-mask design is **OVERTAKEN, NOT MISTAKEN** — it is not a rejected idea,
it is a correct solution to a problem that a better technique now dissolves.

⛔ **THE GOAL, WHICH HAS NOT MOVED:** the room responds to the cards' light, so that four glass
objects read as **physically present in the photograph** rather than composited over it.
**§14a: *"Effects should feel caused by the world, not layered on top of it."***

### ⛔⛔ THIS IS THE STRATEGIST (CS) WORKING AS DESIGNED — not an outside opinion

**Carl, 17 September:** *"The info i have posted comes from a source that is one of the cards."*
And: ***"Using the Strategist in this way is why its part of the team. Ideas and goals were
fleshed out and plans initially approved."***

⛔ **CS is one of the FOUR CARDS** (`ai-roles.md:77` — *"CS | Claude Strategist | A Claude
Project, in the browser"*). ⚠⚠ **So the About section's own subject matter contributed to the
About section's design.** ⛔ **That is not a curiosity — it is the section's thesis demonstrating
itself.**

⚠⚠ **AN EARLIER DRAFT OF THIS NOTE RECORDED CS's INPUT AS *"provenance, not authority"*. THAT
WAS RIGHT ABOUT WEIGHT AND WRONG ABOUT ROLE**, and Carl corrected it. ⛔ **It reads as though a
foreign opinion arrived and had to be defended against. What actually happened is a seat on the
team doing its job.**

⛔ **THE CORRECT READING, AND A FUTURE SESSION MUST INHERIT THIS ONE:** CS **advises Carl and
nobody else** (`ai-roles.md:36`), is **not in the build chain** (`:40`), and holds **no position
in it** — so its output reaches the Builder only **through Carl**, as this did. ⚠ **The weight is
unchanged: Carl decides, the Builder implements, and several parts of CS's input were pushed back
on (below).** ⛔ **What changes is that pushing back is COLLABORATION, not defence.**

### ⚠ AND THE METHOD IS THE POINT, NOT JUST THIS OUTCOME

**Carl:** *"The task/goal hasnt changed in the About section, but the methodology has and its a
positive improvement."*

⛔ **TWO SUPERSESSIONS LANDED IN ONE SESSION — the sampled proxy and the Fusion glow masks — and
NEITHER was a correction of an error.** ⚠ **Both were sound solutions overtaken by better
technique.** **That is the system working, and the record must not make it look like error
recovery.**

### ⛔⛔ HOW CS's INPUT ACTUALLY TRAVELS — Carl's account, 17 September 2026

> *"The Strategist gives me information. I still have to take it in, understand it and come to a
> decision. That info will either be bounced off yourself or the Architect. It doesnt mean all
> the Strategists info is taken. For these 2 methods we changed today this info was escalated,
> evaluated and decisions made. More informed input is always a good thing. **What is done with
> the info has its own importance.**"*

⛔ **THE CHAIN, AND EVERY STAGE IS LOAD-BEARING:**

    CS produces information
        ↓
    CARL takes it in, understands it, forms a view     <- NOT a pass-through
        ↓
    BOUNCED off the Builder or the Architect           <- evaluation, not approval
        ↓
    CARL decides                                        <- the only decision point
        ↓
    the Builder implements

⚠⚠ **"IT DOESNT MEAN ALL THE STRATEGISTS INFO IS TAKEN."** ⛔ **CS's output is INPUT, not
instruction — and the record of today proves it rather than merely asserting it.** **What was
taken and what was not, in this session:**

| CS proposed | Outcome |
|---|---|
| Photograph as a backplate in the scene | ⛔ **TAKEN** — supersedes the sampled proxy |
| Coded spill driven by the live light | ⛔ **TAKEN** — supersedes the Fusion masks |
| One-number neon controller | ⛔ **TAKEN as architecture** |
| Level 1 — CSS/background image behind the canvas | ⚠ **REJECTED** — cannot work; transmission samples the scene's render target, not a DOM image |
| Text as a mesh FLOATING in front of the face | ⚠ **REJECTED by Carl** — *"part of the face, not float above it"* |
| Emissive text | ⚠ **REJECTED** — emissive ignores light; Carl requires the text to BE lit |
| Four colours, cyan/magenta/amber/red | ⚠ **NOT TAKEN.** Four colours ruled; **those four are not chosen** |
| Specific parameter values | ⚠ **HELD** — not rejected, deliberately not inherited as anchors |
| Four-card timed sequence | ⚠ **FLAGGED** — collides with D-077's *"NO CARD IS A STEP"*; Carl's to resolve |

⛔⛔ **"WHAT IS DONE WITH THE INFO HAS ITS OWN IMPORTANCE."** ⚠ **That is the sentence a future
session most needs.** **The value is not in CS being right — it is in the information being
escalated, evaluated against this project's own record, and DECIDED.** ⛔ **An agent that treats
CS output as instruction has removed the stage that does the work. An agent that dismisses it as
an outside opinion has removed the input.** **Both fail; the middle is the method.**

## ⛔⛔ THE ONE-NUMBER NEON CONTROLLER — the architecture, and the one part recommended NOW

**Per card, ONE value: "how much energy is this neon currently producing?" Everything derives
from it.**

    CARD
      │
      └── neonIntensity          <- the single source of truth
              │
              ├── rim            100%      immediate
              ├── glass          20-40%    slight smoothing
              ├── text           10-25%    slight smoothing
              ├── wall/floor spill  2-5%   smoothed
              ├── ceiling spill   1-2%     smoothed most
              └── cross-card       0.5-2%  smoothed

⛔ **WHY THIS IS THE RIGHT ARCHITECTURE AND NOT JUST A TIDY ONE:** if the glow carries its own
flicker curve it is a **second animation that happens to correlate**, and correlation drifts.
Downstream of one number, **the coherence is STRUCTURAL and cannot drift.**

⚠ **IT IS ALSO NOT A NEW SYSTEM.** The Q5 answer cards already act as amber light sources whose
neighbours respond (D-031/D-032). ⛔ **This is the same behaviour one section along — the
recurring theme with variations §14a asks for, not a new effect.**

⚠ **THE RESPONSE HIERARCHY IS PART OF IT:** rim immediate, glass slightly smoothed, wall more,
ceiling most, with a **50-150ms** rise delay on the spill and a slightly later decay. **That is
how light behaves in a room**, and it costs nothing once the one number exists.

⛔ **RECOMMENDED FOR ADOPTION AS ARCHITECTURE. The VALUES above are NOT recommended — see
"numbers held" below.**

## ⛔ WHAT ELSE IS DESIGNED — recorded, NOT authorised

| # | Behaviour | Note |
|---|---|---|
| 1 | **Rim lights its own face and copy** | ⛔ **THE ONE TO PROVE FIRST.** Everything else is a variation on it |
| 2 | **Environmental spill onto wall / floor / ceiling** | Shader-driven radial falloff on the backplate, NOT a transparent rectangle over it |
| 3 | **Ceiling response** | ⚠ White ceiling ⇒ more visible at lower strength |
| 4 | **Neon ignition flicker** | ⚠ See the §14a tension below |
| 5 | **Four-card timing sequence** | ⛔ See the "NO CARD IS A STEP" collision below |
| 6 | **Cross-card colour mixing** | ⚠ **Already Carl's, from 3 August — see below** |

### ⚠ CROSS-CARD SPILL IS NOT A NEW IDEA — IT IS CARL'S, AND THE GEOMETRY WAS BUILT FOR IT

⛔ **Carl, 3 August 2026:** *"The rim should be a half tube, that way it will emit light onto the
bevel and face, and **if it's making a journey down the right hand side it will affect the 2
card**."* And: *"remember the secondary effects. Cards have a proximity to each other."*

⚠ **`about-cards-plan-11-september.md` already states the payoff:** *"Four glass objects each
throwing light onto the others is the thing only a real 3D scene gives; CSS had to hand-author it
with a per-index lookup (`GRID_REFL`)."*

⛔ **SO THE HALF-TUBE RIM EXISTS FOR THIS. The advice argues for something already specified and
already built for.** ⚠ **What it genuinely ADDS is two things:**
1. ⛔ **3D WORLD-SPACE proximity, not screen distance** — load-bearing here, because **the floor
   cards are NOT parallel**: yaws **32.80°** and **301.47°**. Screen distance would be wrong.
2. ⛔ **DIRECTIONAL falloff from the NEAREST rim points**, so spill lands on the facing edge
   rather than washing the whole card.

### ⛔ THE RESTRAINT TEST — the most valuable line in the whole input

> **If a viewer says *"I can see the purple"*, it is TOO STRONG.** They should think *"those two
> cards seem to be affecting each other"* **without knowing why.**

⚠ **This matches Carl's own constraint already on the record** (`about-cards-plan-11-september.md`):
*"the effect should be subtle. Just enough to confirm the 'same world' idea"* — **a local event,
not room lighting.** ⛔ **And the room is ALREADY LIT.** Carl: *"You're assuming that a white
global light is going to be used."* **The ceiling and floor are IN the photograph; they RECEIVE
spill, they are not lit.**

## ⚠⚠ WHAT THE CODED ROUTE REPLACES — and why the Fusion design is not simply wrong

⛔ **The 11 September design was: per-card glow layers authored in DaVinci Resolve's Fusion,
composited over the plate, opacity driven by live card state.** ⚠ **Carl's own correction is part
of it and must not be lost:** ***"no, it can't be baked in Fusion — but you can MASK it!"***

⚠⚠ **SO THE FAIR COMPARISON IS NARROWER THAN "STATIC vs DYNAMIC" — the Fusion design was NEVER
baked.** The real trade:

| | Fusion masks | Coded spill |
|---|---|---|
| Follows neon intensity | ✔ | ✔ |
| Follows card **position / rotation** | ✘ | ✔ |
| Falloff shape | ⛔ **authored by Carl's eye** | mathematical |
| Respects the room's real geometry | ⛔ **traced from the photo** | approximated |

⛔ **THE CODED ROUTE WINS ON ONE DECISIVE POINT:** `about-cards-plan-11-september.md` constrains
*"PLATE WORK COMES AFTER POSITIONS ARE LOCKED. A glow is authored at a fixed place; a card that
moves afterwards leaves its glow behind."* ⚠ **The coded route REMOVES that constraint entirely.**

⚠⚠ **BUT THE RISK THE FUSION ROUTE HANDLED IS REAL AND IS NOW UNHANDLED:** a soft ellipse **does
not know the ceiling from the wall from the desk from the skirting** — it brightens a region.
⛔ **A traced mask lands where the room actually is.**

⛔ **THE HYBRID IS AVAILABLE AND SHOULD NOT BE FORGOTTEN: a Fusion-authored mask defining WHERE
the room may respond, with the shader driving HOW MUCH, live.** **Carl's eye for the geometry,
code for the behaviour.** ⚠ **Not decided — recorded so the option survives.**

## ⛔⛔ THE COLLISION — "NO CARD IS A STEP" vs A FOUR-CARD SEQUENCE

⚠⚠ **A TIMED SEQUENCE — card 1, then 2, then 3, then 4, on staggered holds — RE-IMPOSES IN TIME
THE LINEARITY CARL RULED OUT IN LAYOUT.**

⛔ **The standing ruling** (`current-sprint.md`, D-077): ***"NO CARD IS A STEP"*** — *"Dont think
in linear terms… Thats why the chair sits in the middle."* **Two desks, four positions, a chair
that moves between them: the room already contains the argument.**

⚠ **Irregular holds and overlaps SOFTEN this but do not remove it** — a viewer watching long
enough still reads an order. ⛔ **This is flagged as a COLLISION, not a veto. It is Carl's to
resolve, and it must not be resolved by accident during implementation.**

## ⚠ THE FLICKER — a §14a tension worth deciding deliberately

**An imperfect ignition (`0 → .15 → .65 → .20 → .85 → 1.0`) is a BROKEN-TUBE cue.** It may be
exactly right. ⚠ **But §14a asks for *"the emotional discipline of Comfortably Numb"*, *"David
Gilmour restraint over Yngwie Malmsteen excess"*, and *"nothing should feel like a sudden UI
toggle unless there is a deliberate reason."***

⛔ **It is the most "effect-like" thing proposed in this session. Carl's call — made deliberately,
not inherited from a diagram.**

## ⛔⛔ FOUR COLOURS — RULED BY CARL, NONE CHOSEN

**Carl, 17 September 2026:** *"No colour is decided yet, but there will be 4 and all different."*

⛔ **FOUR NEON COLOURS, ALL DIFFERENT. NONE SELECTED.**

⚠⚠ **RED IS NOT A DECISION AND MUST NOT BE INHERITED FROM THE DIAGRAMS.** Carl, earlier the same
day: *"Red was just an example i used to describe the problem."* ⛔ **The examples throughout the
source material use cyan / magenta / amber / red. NONE of that is chosen.**

⚠ **THE SITE'S ESTABLISHED LANGUAGE IS NARROW: gold, platinum-blue, amber.** Four distinct neons
is a real widening of it. ⛔ **AND THE CHOICE NOW CARRIES MORE WEIGHT THAN "what colour is each
rim": each card spills its colour onto the photograph and onto its neighbours, so the palette
determines WHAT COLOUR THE ROOM TURNS.** **The mixing only reads as physical if the four
plausibly coexist in that room.**

## ⛔⛔ EVERY NUMBER IN THIS SECTION IS HELD — the same rule as the crown and the frost

⚠⚠ **DO NOT IMPLEMENT ANY VALUE RECORDED ABOVE AS A STARTING POINT.** The source offers them
explicitly as *"starting points, not fixed values"*: rim 100%, glass 20-40%, text 10-25%,
wall/floor 2-5%, ceiling 1-2%, cross-card 0.5-2%, the 50-150ms delay, hold times, flicker steps.

⛔ **THE PRECEDENT IS EXACT AND IT COST A DAY.** The face crown opened at an outside
recommendation's **0.015-0.03**; Carl's eye on the bench settled it at **0.073 — nearly THREE
TIMES the recommended start.** *"The conservative figure was too timid for a card this size in a
dark room."*

⚠ **THE FAILURE MODE IS NOT A WRONG VALUE — IT IS AN ANCHOR.** A number already in the code
becomes the thing Carl's judgement is argued AGAINST, rather than the input it should be.
⛔ **Carl is holding frost figures (above). Expect the same for these.**

### ⛔⛔ "HELD" MEANS NOT INVENTED UP FRONT. IT DOES NOT MEAN FROZEN ONCE BUILDING STARTS

**Carl, 17 September 2026:** *"Now in building this that is not to say that parameters might not
get tweaked, thats all part of the process to reach the best outcome we can."*

⚠⚠ **READ THIS BEFORE TREATING ANY VALUE IN THIS NOTE AS FIXED.** ⛔ **Tweaking parameters during
the build IS THE PROCESS — it is the DAW model's tracking stage, and the mastering pass (D-035)
comes later and over the whole site.**

**The distinction, and it is the whole of the rule:**

| | |
|---|---|
| ⛔ **What is forbidden** | **INVENTING** a starting value before Carl has seen the thing, so his judgement is argued against a number already in the code |
| ⛔ **What is EXPECTED** | **TWEAKING** values against what is on screen, by eye, once there is something to look at |

⚠ **THE CROWN IS THE WORKED CASE FOR BOTH HALVES.** The recommended **0.015-0.03** was an anchor
and it was too timid. ⛔ **But 0.073 was not reached by picking a better number in advance — it
was reached by MOVING THE VALUE UNDER A SWEPT LIGHT UNTIL CARL'S EYE SETTLED IT.** **That is
tweaking, and it is how every figure on this project has been got right.**

⛔ **SO: arrive with nothing invented, then tune freely against the screen.** ⚠ **Rule 9 —
rendered output is the truth for visual work.**

## ⛔⛔ AND THE RULE THAT GOVERNS ALL OF IT — §14a, BUILD THE TRACK

⚠⚠ **SIX LIGHT BEHAVIOURS ARE NOW DESIGNED AND NOT ONE IS BUILT.**

> **§14a: *"Build the track before adding automation — prove one object, one motion phrase, or
> one light behaviour before rolling it out."***

⛔ **THE ONE TO PROVE IS #1 — the rim lighting its own face and its copy.** Everything else is a
variation on it, and **each variation gets cheaper once that exists.**

⚠⚠ **THE WORKED CASE IS THIS PROJECT'S OWN, FROM THREE DAYS AGO: SIX FACE FORMULATIONS, FIVE
REJECTED ON SIGHT. Every one of them verified clean and was still wrong.** ⛔ **Design volume is
not progress. Carl's eye on the bench is what settles a light behaviour, exactly as it settled
the crown.**

---

## ⛔ WHAT THE ARCHITECT IS ASKED TO REVIEW

1. **Is the backplate the right structure**, or does putting the room inside the canvas create a
   coupling not enumerated above?
2. **Replace, duplicate, or CSS fallback** — and is the §5b loss of items 2/3/4 acceptable?
3. **Is the enumeration COMPLETE?** ⚠ **The §5b failures were all things nobody had written
   down.** The question is not whether this list is right — it is what is MISSING from it.
4. ⛔ **CLOSED BY CARL, 17 September** — desktop is the target, one file, no breakpoint split;
   **phone optimisation is a MASTERING-PASS item (D-035) and the 57.0KB cost is PROVISIONAL.**
   ⚠ **What remains for the Architect is narrower: is 1536 the right resolution to carry to the
   bench, and is the 8.0MB GPU figure acceptable to carry provisionally?**
5. **Is anything here asserted that should be GATED?** ⛔ Three unasserted facts are named:
   texture memory, `object-contain` framing, and Option C's fetch behaviour.

### ⛔ ON THE LIGHTING SECTION

6. **Is the one-number neon controller the right architecture** to adopt before any light
   behaviour is built — or does committing to it now constrain something not yet foreseen?
7. ⚠ **Is the shader-spill route right, or is the HYBRID better** — Fusion-authored masks
   defining WHERE the room may respond, shader driving HOW MUCH? ⛔ **The unhandled risk is that
   a soft ellipse does not respect the room's real geometry.**
8. ⛔⛔ **THE "NO CARD IS A STEP" COLLISION.** A timed four-card sequence re-imposes in TIME the
   linearity D-077 ruled out in LAYOUT. ⚠ **Carl's to resolve — flagged so it is not resolved by
   accident during implementation.**
9. ⚠ **Is the lighting system being designed too far ahead of what is proven?** ⛔ **Six light
   behaviours designed, zero built** — against §14a's *"build the track"* and the six-face-
   formulations precedent.

---

*Written 17 September 2026, before any code. ⛔ **The backplate is Carl's decision on METHOD; the
STRUCTURE is what this note puts to review.** ⚠ Per §5a: **Carl's approval of a chunk is not
approval of a structure invented while implementing it.***
