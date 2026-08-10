# Session Handoff — 10 August 2026 (the button shipped into the corridor; selection restored; a stutter found and NOT fixed)

**Read this first, then `project-intelligence/` as normal.** Chat history is not canonical (D-006).
**Delete this file at the end of the session that reads it, once its replacement is written** —
`live-work-protocol.md` §3a.

---

## ⛔ THE STANDING DIRECTIVE

**NEVER comment on how long Carl has been working.** Not the time of day, not the session length,
not a suggestion to stop or resume later. **Carl decides when a session ends and will say so.**
It was not broken this session.

---

## 🔴 START HERE — THE CORRIDOR STUTTERS ON EVERY QUESTION STEP. FIX IT FIRST.

**Carl's instruction, and his reasoning, which is the brief:**

> *"A stutter or stall reads like a glitch, bad workmanship. For someone aiming to sell premium
> websites, this is a non negotiable."*

**Measured, production build, four runs, tight spread — this is not noise:**

| | worst frame gap, Q5→Q4 | |
|---|---|---|
| step 1a — no canvas mounts on the far side | 70 / 76 / 62ms | **mean 69ms** |
| step 1b — a canvas mounts (current HEAD) | 198 / 196 / 189 / 189ms | **mean 193ms** |

**+124ms, 2.8×, on every question step — four times per walk.** The ~50ms visible threshold is
recorded in `current-sprint.md`. **A visitor sees this.**

### The cause, and why no dial fixes it

**A WebGL context is created and destroyed on every question step**, and **keying cannot avoid
it**: `renderPhrase` gives each question `key={`phrase-${qNum}`}`, and the answer grid lives inside
`enquiry-phrase-extras` (gated on `showExtras = isActive || (corridorMoving && depth === 1)`). The
**phrase structure owns the canvas's lifetime** — nothing about how the canvas itself is keyed
changes that. A `resetLit` prop saves nothing; that was a false choice I put to the Architect and
it was correctly rejected.

⚠ **THIS IS THE Q5 STALL'S OWN MECHANISM AT A NEW MOMENT.** Context creation inside an animating
transition. The reveal costs 118–135ms *because it happens once*; now it happens four more times.

### The fix — and it is CARL'S CALL, NOT THE BUILDER'S

**The shared host: the answer grid outliving the phrase, so no context is created mid-move.**

⚠⚠ **THAT IS THE D-046 RESTRUCTURE, WHICH D-046 DECLINED TO AUTHORISE, AND IT IS APPROVED
LAYOUT.** `CLAUDE.md`: stop, explain, state the risk, ask. **The difference from when the question
was first put is that the evidence is now measured rather than predicted.** Carl has said the
stutter is non-negotiable, which points at the restructure — but *authorising the restructure* is a
separate sentence he has not yet said. **Get it explicitly.**

⚠ **AND THE ARCHITECT SHOULD SEE THE NUMBER**, since it reopens a declined decision.

### ⚠ THE THING THAT WILL BITE WHOEVER DOES IT — and Carl named it

> **Carl:** *"the corridors movement is important, there is easing in there too."*

The canvas currently sits **inside** the phrase and inherits its motion **for free**. Measured
baseline: the grid travels **435→493px in lockstep with the phrase text, on all 161 frames**. Lift
it out and that inheritance is gone — it becomes a hand-driven animation that must match
`bottom 900ms cubic-bezier(0.37, 0, 0.63, 1)` (`.enquiry-phrase-anim`, `globals.css`).

**Three things the canvas gets free today by being a child:**
1. **The recede motion** — `bottom` + `opacity`, eased.
2. **Its size** — a `ResizeObserver` on `.enquiry-answer-grid`, which it currently lives inside.
3. **The staggered entrance ladder** — it runs on mount, and a canvas that stops mounting per
   question must be told to re-run it. ⚠ **That is approved choreography.**

**✅ THE HARNESS FOR THIS ALREADY EXISTS AND ITS CONTROL PASSES:**

    node verify/corridor-motion.mjs before          # capture
    ...change...
    node verify/corridor-motion.mjs after
    node verify/corridor-motion.mjs --compare before after

`motion-before.json` is committed. **1a and 1b both measured 0.0–0.1% against it** — the motion is
currently untouched, so any deviation after the restructure is the restructure's. Noise floor is
**2.6–2.9%** (measured, same build twice); the flag fires above 5%.

⚠ **CARL JUDGES BY EYE AND HAS SAID SO.** The harness says where to look; it does not approve.

---

## STATE OF THE TREE

**Branch `fix/q5-stall-and-label-colour`, working tree CLEAN, nothing pushed.** 12 commits on top
of `270d5fe`:

    2aea5ba  feat: cards on every question — step 1b, and the number that decides D-046
    fa44ee4  fix: the canvas was painting over the button's label
    08b460e  feat: the corridor selects, and the button arrives — step 1a
    bc68be1  test: capture the corridor's motion, so a restructure can be held to it
    af914e7  docs: Stage B plan, second revision
    e077689  fix: finish the deletion, and stop a governance file asserting a falsehood
    c426c5f  feat: delete D-031's dead reflection, and measure a corridor move
    d0cf9f5  docs: Stage B selection plan
    30c3ca7  docs: the fourth and fifth stale 1280 assertions
    1611836  feat: the button mesh is the corridor's surface, sized from its own box
    9937117  fix: gate the sweep on visibility, and correct three comments that lied
    8435278  feat: the double band is geometry, and now it exists
    3c4b1aa  feat: the room is continuous, and the traveller sweeps it

`npx tsc --noEmit` clean. Lint at the recorded baseline: **1 problem (1 error, 0 warnings)** — the
known `enquiry-opening.tsx` reduced-motion effect, untouched. **Both dev and production servers
were STOPPED at the end of the session** (ports 3000 and 3100 confirmed free).

---

## ✅ WHAT LANDED, AND WHAT CARL APPROVED BY EYE

### The button mesh — *"that is excellent, outstanding"*

**Approved on the bench, then shipped into the corridor.** It is the Next step button's surface at
**every question**, sized from its own measured box (`ResizeObserver`, never `NEXTSTEP_WIDTH_PX`) —
so completion's **Send**, which is a different width, needs no new geometry.

Three things got it there, and the reasoning transfers:

1. **The environment is the material.** `BenchKey` was built on Carl's instruction to test a static
   light; the answer was *barely* — 5× intensity moved the centre 17 points and **flattened** the
   crown. `metalness: 1` has no diffuse term. **`BenchKey` now defaults to 0**, kept on a dial
   because the measurement is worth repeating.
2. **A continuous room.** Hard-edged panels reflect as hard-edged slabs. **Carl's Chrome Boy
   photograph was the evidence** — it cannot be cheating, and it shows continuous gradient because
   the room is continuous. Soft additive panels, a sky/horizon/ground gradient shell, wrap panels
   at x = ±82 that fixed the black end-cap blobs.
3. **The traveller as a moving reflection.** Carl: *"the travellers light is paramount here."* The
   button's canvas cannot see the corridor's traveller, so it is reproduced as `envMapRotation` on
   the corridor's own asymmetric clock (13500ms slow pass, 2200ms fast return). **A mirror does not
   get lit by a moving lamp; it shows the lamp moving.**

**The double band is geometry** — a subtracted Gaussian at 0.62 along the fall. A monotonic profile
gives one band; the reference's bright core → dark groove → thinner line needs an inflection.
Measured against a control (groove off/on, same session): **travel 40.7% → 66.4%**.

### Selection restored — the corridor walks

Carl: *"When the user makes a selection, the button fades in."* **It does:**

    nothing selected   opacity 0.00
    one card selected  opacity 1.00   ✅
    deselected again   opacity 0.00   ✅  (the inverse he specified)
    Next step          Q5 → Q4        ✅

**The fade-in needed no new code** — it was already there on a 600ms transition, waiting for
something to write to `selected`. `toggleOption` had no caller since chunk 3; the argument for
keeping it ("unused means waiting, not dead") was correct.

**Multi-select on all five questions** — Carl, superseding D-018's single-select for Q4. Recorded
as **D-047**, which also records the reflection deletion.

---

## ⚠ THE AGREED ORDER — Carl, end of session

> *"we will fix Q5 issue and then continue with B2"*

1. 🔴 **The stutter.** Top of this file.
2. **B2 — the accessibility layer.** Below.

⚠ **AND THE ORDER IS LOAD-BEARING, NOT ARBITRARY.** If the shared-host restructure is authorised,
the canvas stops mounting per question — and **B2's `tabIndex` gating is written against entrance
completion**, which is a per-mount event today. Doing B2 first would build the control layer
against a lifecycle that job 1 then changes. **Fix the stutter, then wire the controls to whatever
lifecycle survives it.**

---

## ⚠ OPEN, AND UNRESOLVED

- 🔴 **THE STUTTER — see the top of this file. First job.**
- **B2, THE ACCESSIBILITY LAYER, IS NOT DONE AND THE CHUNK IS NOT COMPLETE WITHOUT IT.** The cards
  are now real controls, and **the hit targets are still `aria-hidden` non-focusable divs**. The
  corridor is **unusable by keyboard and unreadable by a screen reader**.
  `answer-card-mesh.tsx` already records that the visible text being a texture makes a correct DOM
  label *"mandatory at that point, not optional"*. **That point has arrived.** Full spec in
  `live-work/stage-b-selection-plan.md` §B2, including:
  - ⚠ `aria-pressed` must come from **`selected`**, NOT `litCards` — they legitimately diverge
    during a move (the outgoing phrase keeps its cards lit while `selected` is already cleared), so
    a control reading `litCards` would announce "pressed" on a question already answered and left.
    A `selectedIndices` prop is noted in `answer-card-canvas.tsx` where it should go, deliberately
    not added until it has a consumer.
  - the double-fire discriminator: `onPointerDown` → toggle; `onClick` → toggle **only if
    `event.detail === 0`** (a synthesised keyboard click carries 0, a mouse click 1+).
  - the focus ring must be on the DOM control — **the mesh cannot show focus**.
  - `tabIndex` gated on entrance completion, so cards that have not arrived are not tabbable.
- **The button reads dark against the cards.** On the bench it had the frame to itself; in the
  corridor the cards are the bright objects. **Carl has not judged this.**
- **Amber is untouched and undecided** — `AmberSource` exists, `0` by default.
- **Q5's reveal is 118–135ms**, against D-046's approved 82ms. Separate from the transition
  stutter, and unexamined since.
- Still open from before: **`verify/hover-teal.mjs` picks the wrong canvas** (use `teal-core.mjs`),
  the **`frameloop` regression**, **floating faces / black edges**, **`GLASS_CLEARCOAT` inert**,
  **~2.4MB of three loading eagerly**, **SHADOW**.

---

## ⚠⚠ THE INSTRUMENTS LIED ELEVEN TIMES THIS SESSION. READ THIS BEFORE TRUSTING ANY HARNESS.

The count was seven at the start of the day. **Every one was caught by a control or by Carl's eye,
never by inspection.** Four new ones, and two are new *shapes*:

| # | the lie |
|---|---|
| 8 | **`?zoom=` read during SSR**, so the wrapper never grew and a zoomed render was cropped to the pill's middle — **cutting off the end caps, the very defect under judgement** |
| 9 | **`ns-shot.mjs` run repeatedly gave three byte-identical "phases"** — each run opens a fresh browser and restarts the animation clock |
| 10 | **`corridor-motion.mjs` reported "phraseY 7.9% CHANGED"**, then **92–100% between two runs of identical code** — it normalised across the whole 158-frame window when the move occupies only ~18→86. **Endpoints were identical throughout. The data was fine; the comparison was wrong.** |
| 11 | **`corridor-walk.mjs` reported "the corridor did not advance"** on a corridor that had advanced — it read the first `.enquiry-phrase-cue` in document order, which is a **memory chip** |

⚠ **NEW SHAPE A — A STALE COMMENT IS AN INSTRUMENT.** Three comments asserting a viewport gate
removed on 7 August misled a plan into asking the Architect to rule on a gate that does not exist.
Fixing three left the trap armed: the Architect found a **fourth**, and the sweep written into that
fix immediately found a **fifth** — which was **half true**, and *the true half made the false half
read as verified*. **Grep the whole file for the claim; do not fix stale comments where you happen
to find them.**

⚠ **NEW SHAPE B — A CORRECT DOM ASSERTION ABOUT SOMETHING INVISIBLE.** Carl: *"the button should
have the text 'next step' on it."* `textContent` was `"Next step"`, colour right, font-size right,
box right — **and the canvas was painting over it**, because an absolutely positioned sibling
paints above a static one whatever the DOM order. **Nine automated checks passed. Carl caught it in
one look.** `corridor-walk.mjs` now asserts the button is *positioned* rather than asserting text
that was never wrong. **Check what is DRAWN, not what is in the DOM.**

⚠ **AND A ZOMBIE SERVER NEARLY DID IT AGAIN** — an `&`-backgrounded `next start` survived a
TaskStop, held port 3100, and answered 200 to a readiness probe while a newer build sat unserved.
**Kill by PID on the port and confirm it free before trusting any number off it.**

⚠ **DEV-SERVER FRAME NUMBERS ARE WORTHLESS.** The first Stage A attempt read 231ms with the mesh
against **269ms without** — indistinguishable. `transition-cost.mjs` and `corridor-motion.mjs` both
**refuse to run against :3000**.

---

## 📌 PARKED — logos, after the corridor reaches the client info section

**Carl, 11 August 2026:** *"After this section is completed and everything flows into the client
info section I will turn my attention to logos on the site. Attached is the official logo. There is
also this flat white 2D logo on a black background. I have DaVinci Resolve. I have to go in there
and recreate it in Fusion."*

**Not current scope. Do not start it, plan against it, or reach for it.** Recorded so it is not
rediscovered.

- **Two assets exist:** the official gold hero render, and a **flat white 2D logo with an alpha
  channel**. ⚠ The flat one is the load-bearing asset for the site — at favicon, header and footer
  sizes the tube geometry and specular detail vanish, and a flat silhouette is what survives. The
  gold render is hero-scale.
- ⚠ **CHECK PREMULTIPLIED vs STRAIGHT ALPHA BEFORE IT GOES ANYWHERE.** Getting it wrong puts a dark
  fringe on the antialiased edges against dark backgrounds — subtle at hero scale, visible at
  header size on `#101010`. Fusion's Loader node states it explicitly; Resolve's default is not
  always what the file actually is. **This is the kind of thing found late and expensively.**
- **The button's material findings transfer to a Fusion rebuild**, because they are geometry and
  environment rather than code: the double band is an **inflection in the profile**, not a material
  setting; the darks are **navy, not black**; the reference is **predominantly dark with bright
  bands**; and **a hard-edged source reflects as a hard-edged slab**. Same facts in any renderer.
- ⚠⚠ **THE ASSETS ARE IN `brand-assets/logo/`, WITH THEIR OWN README. READ IT FIRST.** It is the
  **sole source of truth** — the external tool they were salvaged from was destroyed on 25 July
  2026, so **there is nothing to re-export from and nothing to re-check against.**
  - `c2b-flat-white-alpha-cleaned-1x.png` — 1301×768, **zero partial-alpha pixels**, hard edges
    only. That is what makes it usable as a mask and as **a trace source for vector work**. Appears
    blank in most viewers, which composite white on white. **It is not empty.**
  - ⚠ **`c2b-logo-gold-hero.svg` IS NOT VECTOR** — a base64 PNG in an SVG wrapper, zero `<path>`
    elements. The README called it the *"vector master"*; **corrected 11 August 2026.** So **there
    is no true vector form of the logo in this repo**, and producing one is a redraw.
  - `LogoLOTR.png` — the distressed/antique direction, **explicitly REJECTED for the brand**.
  - `c2b-logo-specular-sweep-4s.mp4` — a **motion study**, reference only: light travels across a
    fixed object rather than the object changing colour. Directly relevant to the hero transition.
  ⚠ **THE BUILDER ASSERTED TWICE, FROM MEMORY, THAT NO LOGO ASSET EXISTED** — once claiming the
  logo was refracted through the card glass, once that `public/` had nothing. Both false; there is
  a whole `brand-assets/` tree. **A claim about the repo written into a governance file is read as
  verified. Search before writing.**

---

## How to look at it

```
npm run dev                                     the corridor
http://localhost:3000/start
http://localhost:3000/proto/nextstep            the button bench

# frame cost MUST be production:
npm run build && npx next start -p 3100
VERIFY_BASE_URL=http://localhost:3100 node verify/transition-cost.mjs 4   <- THE STUTTER
VERIFY_BASE_URL=http://localhost:3100 node verify/corridor-walk.mjs       selection + button
VERIFY_BASE_URL=http://localhost:3100 node verify/corridor-motion.mjs after
node verify/corridor-motion.mjs --compare before after                    <- THE MOTION GATE
node verify/nextstep-look.mjs                   button tone, two-sided
node verify/nextstep-swing.mjs                  the traveller's sweep
node verify/ellipse-reach.mjs                   what light can reach the pill (no browser)
```

Button dials: `?axis= ?key= ?floor= ?wrap= ?shellsky= ?shellground= ?zoom= ?litint= ?travel=`

⚠ **MEASURE HEADED, WITH `--enable-gpu`.** Every harness prints the renderer and aborts on a
software rasteriser.

---

*10 August 2026. The button was approved, shipped and labelled; selection came back after being
gone since chunk 3; and the corridor now walks Q5→Q4 with real cards on every question. The cost of
that last step is a 193ms stutter, which Carl has ruled non-negotiable.*

***The transferable lesson, now eleven times over: the instrument answers a question ADJACENT to
the one asked, and the adjacency is invisible in the output.*** Today it broadened twice — a stale
comment lies exactly as a bad harness does, and a DOM assertion can be perfectly true about
something no user can see. **Run the control. Then look at the pixels.**
