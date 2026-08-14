# Session Handoff — 14 August 2026 (the cards must be DECOUPLED from the phrase's recession)

**Read this first, then `project-intelligence/` as normal.** Chat history is not canonical (D-006).
**Delete this file at the end of the session that reads it, once its replacement is written** —
`live-work-protocol.md` §3a.

---

# ⛔⛔ THE LIVE SUBJECT — CARL'S RULING, AND IT SUPERSEDES THE OPEN NOTES

**Branch `fix/q5-stall-and-label-colour`, head `9ec3201`, pushed. Working tree CLEAN.**

**Carl's ruling, verbatim in substance: the cards must be DECOUPLED from the phrase's
recession.** The authoritative per-question sequence:

    question reveals
    -> cards fade in to resting position
    -> hover turns answer text teal
    -> answer selected: filament activates, Next step fades in
    -> Next step pressed
    -> that question and its selected answer recede into the rail
    -> once the space is vacated, the next question reveals and its cards fade in

Runs Q5 -> Q4 -> Q3 -> Q2 -> Q1.

⚠ **ONLY the question text and its selected answer travel. The cards and the Next step button
fade in and out IN PLACE and never move.**

⚠⚠ **THE CARDS HAVE NEVER BEEN CORRECT IN THE THREE.JS VERSION — ONLY CONCEALED.** Carl did not
approve the movement in Three.js or in CSS. It breaks the ethos rule that nothing on the site
happens suddenly. **Reverting the per-frame tracking does NOT fix it** — that only restores the
mask, and it resurfaces the next time anything changes their opacity or timing.

**§5a applies: this changes what owns the cards' position. PLAN MODE ONLY, NO CODE.**

---

## ⛔ THE STANDING DIRECTIVE

**NEVER comment on how long Carl has been working.** Not the time of day, not the session
length, not a suggestion to stop or resume later. **Carl decides when a session ends and will
say so.** It was not broken this session.

---

## ✅ QUESTION 1 IS ALREADY ANSWERED — THE COUPLING IS FOUND AND IT IS INHERITANCE

**Do not re-derive this. It is measured and exact.**

`app/globals.css`:

    .enquiry-phrase          position: absolute
    .enquiry-phrase-anim     transition: bottom 900ms cubic-bezier(0.37, 0, 0.63, 1)
    .enquiry-pdepth-0        bottom: -1.925rem      <- active
    .enquiry-pdepth-1        bottom:  1.7rem        <- first memory rung

    1.7rem - (-1.925rem) = 3.625rem = **58.0px at 16px root**

**Measured travel was 57.98px. The arithmetic matches to a hundredth of a pixel.**

**The cards ride it as PASSENGERS, by nesting, with nothing explicit anywhere:**

    .enquiry-phrase              <- animates `bottom` over 900ms
      └ .enquiry-phrase-extras   <- position:absolute; top: calc(100% + 1rem)  ⚠ anchored to the phrase
          ├ .enquiry-answer-grid <- the cards
          └ .mt-5                <- the Next step button

⚠ **`.enquiry-phrase-extras` is `top: calc(100% + 1rem)`, so it is pinned to the phrase's box and
inherits every pixel of the recession.** Nothing in the code says "move the cards". Nothing could
be grepped for. **This is the third instance this week of inherited behaviour being the fault.**

### ✅ QUESTION 5 IS ALSO ANSWERED — YES, SAME COUPLING

**The button's 58px travel is the identical mechanism.** `.mt-5` is a sibling of
`.enquiry-answer-grid` inside the same `.enquiry-phrase-extras`. One parent, one transition, two
passengers. **A fix for the cards must cover the button or it will be half a fix.**

### ⚠ THE MASK, IDENTIFIED

    .enquiry-phrase-extras-out   opacity: 0; transition: opacity 300ms linear

**A 300ms fade over a 900ms move.** That is what has been hiding it. Previously measured on the
button's own 600ms wrapper fade: **still at 0.889 opacity once displaced, visible (>0.05) for 31
of 65 moving frames, full 58px travel, reproduced across two runs.**

⚠ **THE ONE MEASUREMENT NOT YET TAKEN:** the same fade-vs-travel overlap for the CARDS'
`.enquiry-phrase-extras` (the button figure above is its own 600ms wrapper). The probe is written
and was interrupted at 92% session limit — see SCRATCH below. **It is a confirmation, not a
dependency: the coupling is already proven by the CSS arithmetic.**

---

## 4. WHAT BECOMES MOOT — Carl predicted most of it, and he is right

`live-work/structural-decision-note-question-boundary.md` options **(a), (b) and (c) all exist to
FOLLOW a motion that should not happen.** If the cards never move:

| | status |
|---|---|
| (a) host holds last good rect | ⛔ **MOOT** — nothing to hold through |
| (b) both grids alive across the transition | ⛔ **MOOT** — nothing to stay continuous for |
| (c) context persists, node re-renders | ⛔ **MOOT as a positioning answer.** ⚠ Its *lifetime* half still matters — see below |
| **the 58px snap at the boundary** | ⛔ **MOOT** — it is the return leg of a move that is being deleted |
| **the route limit** ("no element makes the round trip") | ⛔ **MOOT** — only mattered to something following the travel |
| **the per-frame rAF tracking (`62b9e5e`)** | ⛔ **MOOT — SHOULD BE REVERTED once the decoupling lands.** It reverts cleanly in isolation; verified |
| **the one-frame ~1.7px trail** | ⛔ **MOOT** — an artefact of tracking |
| **(d) a real boundary signal** | ✅ **STILL STANDS** and is now MORE needed — the cards need their own timing, which needs a boundary event, not a `labels` heuristic |

⚠ **WHAT SURVIVES FROM THE OPEN NOTES:**
- **The Next step button's per-question WebGL context — 67.2ms of blocked main thread, 5 contexts
  per walk, 8 total.** ⚠ **Unrelated to the coupling. Still a §5a decision Carl has already ruled
  on** (move it out of the keyed phrase). **The previous plan file covers it and is still valid on
  that point.**
- **`litCards` lifetime** — fixed (`dd9537b`), and the `labels` key is a heuristic that should be
  replaced by (d).
- **~112ms of the ~180ms step gap is still unattributed**, inside opaque `PutChanged`.

---

## ⚠⚠ 3. THE §5b ENUMERATION IS THE HEART OF THE NEXT SESSION AND IS NOT DONE

**Carl's instruction: assume there is more than you can see, and say so.**

What the coupling silently provides today, found so far — **incomplete by design, and that
incompleteness must be stated in the plan**:

1. **Position at rest.** The cards' resting place is the phrase's box + `1rem`. Decoupled, that
   number must come from somewhere explicit. ⚠ **This is the 12 August failure's exact shape —
   state the source plainly.**
2. **The cards leave when the phrase leaves.** No code says so; they are inside it.
3. **The outgoing set stops being hit-testable** — `.enquiry-phrase-extras-out` sets
   `pointer-events: none`.
4. **Only one card set exists at a time**, because `showExtras = isActive || (corridorMoving &&
   depth === 1)` renders it for exactly one phrase.
5. **The button's fade, `tabIndex` gating and `onClick`** all ride the same wrapper.
6. **The reveal's clock contract** — `onAnimationStart` on the active phrase publishes the ladder's
   zero (`enquiry-opening.tsx:~1435`). ⚠ **Decoupled cards still need that signal.**
7. ❓ **UNKNOWN AND MUST BE SAID: what else depends on `.enquiry-phrase-extras` being inside the
   phrase.** `answer-card-canvas.tsx` is ~4200 lines. **Two of the three faults this week were
   inherited behaviours nobody had written down.**

---

## 2. THE SEQUENCE NEEDS ITS OWN TIMING — the open design question

The ruling requires **"once the space is vacated, the next question reveals"** — a *sequential*
handoff. Today the outgoing recession and the incoming reveal **overlap**. ⚠ **Carl has not been
asked whether the step gets LONGER (fade out, then vacate, then fade in) or whether the fades
overlap the recession without the cards moving.** **That is a question for him before any plan is
finalised.**

---

## ⚠⚠ HARNESS RULE CARL ADDED — NOT YET APPLIED

**`corridor-motion.mjs` compares against a captured baseline, so it can only confirm motion is
UNCHANGED, never that it is WRONG. IT HAS PASSED ON THIS ALL WEEK** — 2.9%/2.9%/2.5%, green,
while measuring a motion that should not exist.

⛔ **ADD THIS TO ITS SCOPE DECLARATION** (the rule from `context-rules.md`: every harness declares
what it does NOT watch, **in its output**, not only its header). **This is an outstanding action.**

⚠ **AND NOTHING ABOUT THIS HAS EVER BEEN FILMED.** Every measurement all week has been
`getBoundingClientRect` at intervals. **Verification of the decoupling needs FILMED FRAMES.**
`verify/corridor-filmstrip.mjs` exists for this and is committed **⛔ UNFALSIFIED AND NEVER RUN** —
its header says so. **Run it and prove it can show a deliberate defect before trusting it.**

---

## WHAT HAPPENED THIS SESSION (committed and pushed)

    9ec3201  §5a second worked case + the harness scope-declaration rule
    79bc584  the ~240ms LOCATED: the Next step button's per-question context
    244f3ef  question-boundary note + two measurements
    dd9537b  repair a NUL byte I wrote into the litCards separator
    b17eac4  clear litCards on question change + harness correction
    9ef8bc7  structural decision note — the card host
    e752a1c  corridor filmstrip (UNFALSIFIED, NEVER RUN)
    62b9e5e  z-index 1 + per-frame tracking  ⚠ THE TRACKING HALF IS NOW MOOT
    bbcdba7  clickability past Q5 + selection state from a hook

⚠ **`62b9e5e` MIXES A KEEPER AND A CASUALTY:** `z-index: 1` fixed total unclickability and must
STAY; the per-frame tracking is moot. **Reverting the whole commit would re-break the cards.** A
future revert must take the tracking only.

---

## STATE

- **Working tree CLEAN at `9ec3201`.** In sync with origin.
- Production build of HEAD on `:3100`.
- Plan file `C:\Users\Carl Buckley\.claude\plans\dazzling-riding-shannon.md` holds the **BUTTON
  LIFETIME** plan (still valid for the button's context). ⚠ **It does NOT cover the decoupling and
  must be overwritten or superseded.**
- Gates at last check: `tsc` clean; lint **1 problem (1 error, 0 warnings)** — the known baseline.
- **SCRATCH:** a fade-vs-travel probe for the cards' `.enquiry-phrase-extras` was written to
  `/tmp/maskprobe.mjs` and interrupted before running. Trivial to rewrite; **not a dependency.**
- No scratch `.mjs` copies at the repo root (checked).

---

## THE NEXT SESSION, IN ORDER

1. **Ask Carl the sequencing question** (§2 above) — does the step get longer, or do the fades
   overlap the recession?
2. **Finish the §5b enumeration** by reading `answer-card-canvas.tsx` and
   `.enquiry-phrase-extras`'s consumers, and **state what cannot be enumerated.**
3. **Write the decoupling plan in PLAN MODE. NO CODE.** Carl routes it to the Architect.
4. Add the scope declaration to `corridor-motion.mjs`.
5. Falsify `corridor-filmstrip.mjs` before any filmed verification is trusted.

*14 August 2026. ⚠⚠ **THE CARDS' MOVEMENT IS A DEFECT, NOT A FEATURE, AND HAS NEVER BEEN
APPROVED. The coupling is CSS inheritance via `.enquiry-phrase-extras` and it is proven to the
hundredth of a pixel. Most of the question-boundary note is moot. PLAN MODE ONLY.***
