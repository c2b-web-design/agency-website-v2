# Session Handoff — Day 8

**Written at the end of Day 8, 2 August 2026. For the session that picks up next.**

**Read this first, then `project-intelligence/` as normal.** Chat history is not canonical
(D-006). **Delete this file at the end of the session that reads it, once its replacement is
written** — `live-work-protocol.md` §3a.

**This file points at records; it does not restate them.**

---

## ⛔ THE STANDING DIRECTIVE — unchanged, and it was not broken today

**NEVER comment on how long Carl has been working.** Do not mention the time of day, suggest
stopping, wrapping up, resuming tomorrow, or ask whether to carry on. **Carl decides when a
session ends and will say so.**

Given Day 2, broken twice on Day 3, which is why it is a capitalised block in `CLAUDE.md`.
**It reads as considerate. It is not.**

---

## Where things stand

**Repo: `main`, head `02b25d4`, tree clean, PUSHED.** Two commits today; three earlier ones
that had never been pushed went up with them. Lint at the recorded baseline (1 accepted
error). Dev server stopped, port 3000 released.

⚠ **No `chunk-scope.json` guard is active.** It was stood down at the end of Day 7 and was not
rewritten for today's work. **The next chunk should write its own** — and must declare
`verify/_tmp-*.mjs` and its own main file (findings F-6 / DL-1).

### Today: the contact field's faces became genuinely three-dimensional

**Full records: D-043, D-044, and `live-work/run-log-orbiting-light.md`.**

| What | Where |
|---|---|
| Authority resolved — Architect seat in-house | **D-043** |
| Crown deepened, orbit built, opal responds | **D-044** (all PROVISIONAL) |
| The sequence, the corrections, the six wrong turns | **run-log-orbiting-light.md** |

**Carl on the result:** *"the gradients are animated... that is so fckn cool"* and *"it's as if
the opal's shine pulses and the light of the cards is having some sort of effect on it."*

⚠ **Both of those are EMERGENT and neither was built.** The texture never moves — it is one
static photograph, and a travelling light on a curved surface makes it look animated. Nothing
connects the boxes to the opal technically; they share a clock and the brain supplies the
causation.

⚠ **THE ONE FINDING THAT MATTERS: a crown of 1.2 units on a 38-unit box has a maximum surface
tilt of 5.67 degrees.** That single number is why Carl reported the faces looked flat — the
shadow lived in the last ~6 degrees of a 90-degree sweep. Real, and invisible. At 5.0 the tilt
is 22.5 degrees. **The texture was never the problem; the geometry was too weak to compete.**

---

## ⚠ THE NEXT CHUNK — rebuild the Q&A answer cards in Three.js

**This is Carl's decision, made at the end of Day 8, and it is a major rebuild of an approved
layer.** Nothing has been built. No plan exists.

### Why

Carl, having seen the contact field lit: *"by comparison in the Q+A the answer cards look
cheap. I like the idea, like the geometry, like the concept. It's like watching something in
1080p and we've just built something in 4k."*

⚠ **NOT A CRITICISM OF THE CARDS.** *"They are well made, I wouldn't have sent you an example
if they weren't, but some of the effects I was trying to get over in CSS can be done better
with Three.js and WebGL."*

⚠ **THE ACTUAL ARGUMENT, AND IT IS NOT ABOUT FIDELITY.** *"The white on the cards is supposed
to represent light. The amber influencing the white is the filament effect. **What you don't
see are secondary effects as the filament is in proximity to other cards.** It's hinted at in
the next step button."*

**In CSS the filament can only light itself. In a real scene it is a light source, and every
neighbouring card responds for free.** That is the whole point.

⚠ **AND THE EXISTING CSS ALREADY ADMITS THE LIMIT.** `--sweep-pass` in `globals.css` is a
hand-timed masked amber wash synced to *"the filament head crossing the top straight run"* — a
manual approximation of light spilling from the filament onto its own face, and it reaches no
other card. D-031/D-032's `GRID_REFL` table exists for the same reason: CSS cannot compute
light transport, so the contribution of each card to the CTA had to be authored per grid slot.
**In a real scene that table is unnecessary rather than needing porting.**

### ⚠ THE SCOPE, IN CARL'S WORDS — narrower than it first sounds

> *"All numbers for card appearance, filament speed etc will be used or converted. That's all
> good. **We are only changing how the answers look and rebuilding the next step button.**"*

**So the existing values are INPUTS, NOT OBSTACLES.** Timings, choreography, filament speed,
card geometry, entrance sequencing — all carried across or converted. **What changes is the
rendering, not the design.**

- *"There would be no animated light."* The filament is the moving element; there is no
  orbiting light here.
- *"The cards have a resting state and a hover state. Could the effect of a moving filament
  with the right reflective material be used?"*
- *"The geometry of the cards is good. We build one card and then roll it out."*
- *"Timings and choreography all stay."*
- *"The next step button could keep the same implied geometry but we do it in Three.js and
  possibly change the material."*

### Where to build it — Carl's instruction

> *"We build Q5 top left. Geometry first, we follow the same process. On the page, build it on
> the left... after the ivory button, when Q5 appears, build on the left. **The CSS can stay in
> place for now.** We reach the stage when Q5 answers can be deleted. We put the top left
> answer in place."*

⚠ **BUILD ALONGSIDE THE LIVE CSS GRID, NOT INSTEAD OF IT.** The approved cards keep working
while the WebGL card is judged in dedicated space — the same sequencing the contact field
used. Only when it is right does anything approved get touched.

### ⚠ What was READ on Day 8, so the next session need not re-derive it

**The Q5 top-left card is `"Premium new website"`.** Grid columns 1/3 of a 6-column grid in
the 576px `max-w-xl` shell with 0.5rem gaps — **roughly 186 x 48px**. Similar scale to a
contact-field box, so the same orthographic 1-world-unit-per-CSS-pixel mapping applies.

**The card material is four stacked layers** (`app/globals.css` from ~line 287):

| Layer | What |
|---|---|
| body | 160° linear gradient, three stops |
| `::before` | two radials — the frosted diffusion |
| `::after` | three gradients — top-edge band, corner glint, left rim |
| box-shadow | **six insets** faking rim lights from four directions |

⚠ **THE SIX INSET SHADOWS ARE THE TELL.** Top bright, left secondary at a third of it, bottom
and right as depth shadow — **a studio lighting model, hand-painted, from a fixed direction.**
In WebGL that is one light and a material.

**The filament** (D-029) is an SVG `rect` with `pathLength="1"`, stroking the perimeter over
2400ms, colour `rgba(190, 145, 58, 0.80)`. Rendered in `enquiry-opening.tsx` ~line 698.

**The grid** is 6 columns with an offset second row — cards 4 and 5 at columns 2/4 and 4/6,
centred beneath the first three. Any WebGL card must land pixel-exact on that.

⚠ **THERE IS NO LAB ROUTE AND NO `components/lab/`.** The reference to
`components/lab/grid-layout.ts` in `contact-field-geometry.ts` is **STALE** — the directory
does not exist. Only two routes exist: `app/page.tsx` and `app/start/page.tsx`.

### ⚠ Approved decisions this chunk touches

**D-028** (frosted blue glass, five A–E variants), **D-029** (filament border), **D-030 to
D-032** (blue-platinum CTA + reflected amber, `GRID_REFL`). ⚠ **All approved.** The
`CLAUDE.md` rule applies: **stop, explain why, state the risk, and ask before editing.**

### Two questions Carl did NOT answer — ask before planning

1. **Exact placement of the WebGL card.** "On the left" — a separate canvas in the empty space
   beside the 576px shell was proposed but not confirmed.
2. **First-build scope.** Geometry + resting material only (the contact-field pattern), or
   include the filament from the start since the secondary effects are the whole premise.

---

## Parked, and deliberately

| Item | Note |
|---|---|
| **Option B — text on a curved surface** | ⚠ Carl: *"we sort out the text issue after we have built it, and with the client info section as well."* **One answer, applied in both places.** Needs a hidden input for accessibility, autofill and typing |
| **Crown depth 5.0** | Legible, not chosen. PROVISIONAL |
| **The 3s hidden half of the orbit** | May read abrupt against the 6s front |
| **Grain tint 0.55, rim unlit floor 0.05** | ⚠ **Now genuinely judgeable** — there is finally a moving light to judge them under |

⚠ **AND THE "WHICH BOX" QUESTION IS CLOSED.** Carl looked and settled it the other way:
*"leave it as they are. I like the randomness and adds to each box's individuality."* **The
variation IS the design.** Do not reopen it.

---

## ⚠ Mastering — the standing methodology, restated because it governs everything above

Carl: *"At the end of the whole building of the website I'm going to go through it all from
start to finish and fine tune things. Look upon it as mastering. We can keep what we've got so
far."*

**So PROVISIONAL values do not need approving and should not be chased.** They are takes. See
D-035.

---

## ⚠ The day's lesson, and it cuts against the Builder

**Carl's eye said the geometry was not reading. The instruments said it was fine. The geometry
was the thing that was wrong.**

Every probe that disagreed with him was measuring something other than what it claimed:

| Wrong turn | What it actually was |
|---|---|
| Light aimed one box behind the readout | `updateMatrixWorld()` called before the position propagated |
| "Off" left the light aimed at the world origin | `return null` unmounted it; the wiring effect never re-ran |
| Sampling windows read empty space | Guessed fractions; a box is 38px in a 184px layer |
| ⚠ **A long stretch of intensity/penumbra/easing changes** | **Screenshots taken BEFORE the boxes rendered.** Blank background read as an unlit face |
| Exact `0.00` deltas called a render race, then a reporting bug | Both wrong. A byte diff proved the captures fine |
| `decay = 2` with intensity 900, then 64000 | **Units.** One world unit is ONE CSS PIXEL; physical falloff assumes metres |

⚠ **THE HARNESS NOW POLLS UNTIL BRIGHT PIXELS EXIST** rather than waiting a fixed interval.
**Do not re-introduce a fixed wait after the corridor walk** — the boxes appear ~1500ms after
the inputs do, and a short wait silently measures a blank stage.

⚠ **AND ONE FAILURE WAS WORSE THAN A WRONG NUMBER.** A comment was written into the rig
claiming box 3 was kept dark *"verified by measurement, not assumed"* — **written before the
measurement, and false.** The words are preserved in the source rather than deleted. **P-A
applies to what you author, not only to what you review.**

---

## How to work with Carl — carried forward

- **⛔ Never comment on his working hours.** See the top of this file.
- **He leads.** Design, chunking and decisions are his. D-036.
- **He asks for the principle before the decision.** Explain, then let him choose.
- ⚠ **His analogies are precise, not decorative.** *"It's like volume on a fader — you don't
  need powerful light to see a shadow"* corrected an intensity that had been chased upward
  until it blew the face out. **A shadow is a ratio, not a level.** 45 years a musician;
  DAW and production analogies land and carry real content.
- **He verifies, and his eye beat the instrument repeatedly again today.**
- **He chunks deliberately** and isolates variables — the method that has produced every good
  result on this object.
- **Answer execution questions yourself.** Ask only about intent and authority.
- **No ASCII diagrams or box-drawing characters.**
- **Do not commit or push unless he explicitly asks.**

---

## ⚠ Environment notes

- **The orphaned-port problem is real and was hit again.** Stopping the background task left
  PID 11588 still `LISTENING` on 3000; it needed an explicit `Stop-Process`. Leftover
  `CLOSE_WAIT` entries belong to a browser tab and are harmless.
- **`python3` is not available.** Use `node`, `sed` or the Edit tool.
- ⚠ **Screenshots at DPR 2 exhausted the headless GPU** on a canvas running a continuous rAF
  loop — a verify script timed out waiting for a layer that was demonstrably visible. **DPR 1
  worked.** Suspect the harness before the page.
- ⚠ **A blanket string replace rewrote an accessor into infinite recursion** (`unlitFloorFor`
  calling itself). Caught by reading the result. **Prefer targeted edits over `.split().join()`
  across a file.**

---

*Day 8, 2 August 2026. The contact field's faces went from flat to genuinely dimensional, an
orbiting light now crosses the whole assembly, and the Send opal responds to it. Two commits,
both pushed.*

*The next chunk is the largest yet proposed: rebuilding the Q&A answer cards in Three.js so the
filament becomes a real light and its secondary effects on neighbouring cards come for free.
**Only the rendering changes — every number is carried across.***
