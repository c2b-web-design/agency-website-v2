# Card exit — SPEC ONLY

**16 August 2026. ⚠ SPEC. NO CODE. NOT AUTHORISED TO BUILD.**

This is a **§5a structural item**: it requires a boundary signal that **does not exist in
the codebase today**. It returns as its own gated step, in **Plan Mode**, with **Carl's
word before implementation**. Nothing in this file is a licence to start.

⚠ **THE FILE THE HANDOFF REFERENCED — `card-exit-spec-15-august.md` — WAS NEVER WRITTEN.**
The 15 August handoff cited it in its "NEXT, IN ORDER" list as though it existed; it did
not, and the session ended before it was authored. **This file is that spec, written from
scratch on 16 August.** Anything a reader believes they remember from the 15 August
version came from the handoff's summary of it, not from a document.

---

## 1. THE ENTRANCE — SOURCE-VERIFIED, AND THE RECORD WAS WRONG

Read from `answer-card-geometry.ts` and `answer-card-canvas.tsx` on 16 August, not from
prior notes.

### The ladder

| Card | Rung |
|---|---|
| 1 | **650ms** |
| 2 | **1210ms** |
| 3 | **1770ms** |
| 4 | **2330ms** |
| 5 | **2890ms** |

Derived, never typed:

```
CARD_FIRST_ENTRANCE_MS = Q5_REVEAL_MS / 2      = 650ms
CARD_RISE_GAP_MS = CARD_RISE_DURATION_MS * (1 - CARD_OVERLAP)
                 = 2000 * (1 - 0.72)           = 560ms
CARD_RISE_LADDER_MS[i] = 650 + i * 560
```

- `CARD_RISE_DURATION_MS` = **2000ms** — each card's OWN rise.
- **Total span 4240ms** (last rung 2890 + its own 2000 = `ENTRANCE_END_MS`, 5440ms from
  the reveal anchor; the 4240 is first-rung-to-final-settle).
- **Clock zero is the phrase reveal's `__revealStart`**, published by `onAnimationStart`
  on the question span — a CONTRACT, not a diagnostic.
- ⚠ **The gap (560ms) is SHORTER than the rise (2000ms), so FOUR CARDS ARE MID-ENTRANCE
  AT ONCE.** The sequence is not five discrete beats.

### ⚠⚠ 220/350/480/610/740 IS THE STALE CSS-ERA LADDER — DO NOT REINSTATE IT

That ladder belongs to the pre-Three.js CSS implementation. It survived as a quoted
prediction inside a comment at `answer-card-canvas.tsx:1600`, which described it as
"approved" — **and it sent every calculation of 15 August wrong.**

**Fixed in `a8cee4b`.** Recorded here so that a reader encountering the numbers in old
notes, old commits or chat history recognises them as dead. `CARD_RISE_DELAY_MS` (220)
still exists as an export and **feeds nothing**; `delayMs` comes from
`CARD_RISE_LADDER_MS[i]` at `answer-card-canvas.tsx:3502`.

### Three strands on two curves

| Strand | From → To | Curve |
|---|---|---|
| opacity | 0 → 1 | **smoothstep** `p²(3−2p)` |
| position.y | +10px → 0 (rise) | **cubic ease-out** `1−(1−r)³` |
| scale | 0.94 → 1.0 | **cubic ease-out** `1−(1−r)³` |

- `group.visible` steps **false → true** at the rung. ⚠ **A WAITING CARD IS ABSENT, NOT
  TRANSPARENT.** Visibility is owned in exactly one place.
- **Mechanism: rAF, writing `mat.opacity` per frame plus `group.position.y` and
  `group.scale` on the Three.js objects. NOT CSS.**

---

## 2. WHY THE EXIT IS NOT A MIRROR

**The budget is 1150ms** — the 900ms recession plus the ~250ms beat, read from
`enquiry-opening.tsx` where `setCorridorMoving(true)` is followed by a 1150ms timeout.

**A true mirror is 4240ms. It does not fit, and never could.** A mirrored exit is not a
tuning problem; it is arithmetically impossible inside the corridor move.

### ⚠ BUT THE REASON IS INTENT, NOT BUDGET — CARL, 16 AUGUST

If the only argument were "it doesn't fit", the correct response would be to lengthen the
corridor. **That is not the argument.** Carl's reasoning:

> **On entry the user is reading and assessing five options. On exit that is done — they
> have chosen, and they are moving on.**

The entrance is slow because it is asking for attention while a decision is being made.
The exit has no decision to support. **The asymmetry is deliberate and it is what gives
the numbers their source** — the compression follows from what the moment is for, and the
budget merely happens to agree. Record it in these terms: a future reader who thinks the
exit is "the entrance, rushed" will tune it in the wrong direction.

---

## 3. CARL'S DECISIONS — 16 AUGUST 2026

### 3.1 A COMPRESSED ECHO, not a mirror

**Preserve `CARD_OVERLAP = 0.72`** so the departure reads as the same gesture as the
arrival, played faster. The shape is the thing being kept; the duration is not.

Candidate values, **~4x compression at the same proportions**:

| | Entrance | Exit (candidate) |
|---|---|---|
| per-card duration | 2000ms | **~500ms** |
| gap between cards | 560ms | **~140ms** |
| total span | 4240ms | **~1060ms** |
| overlap | 0.72 | **0.72 (preserved)** |

⚠ **CANDIDATE, NOT SETTLED.** ~1060ms sits inside the 1150ms budget with ~90ms of margin.
**PROVISIONAL under D-035 — Carl tunes by eye.** If the gesture reads wrong, the
correction belongs in the overlap or the compression factor, and the derivation must stay
derived: **do not hand-type an exit ladder.**

### 3.2 STAGGER — CARD 5 FIRST

**It unwinds.** Last to arrive, first to leave. The departure runs 5 → 4 → 3 → 2 → 1,
reversing the arrival order rather than repeating it.

### 3.3 ALL THREE STRANDS REVERSED

| Strand | Entrance | **Exit** |
|---|---|---|
| opacity | 0 → 1 | **1 → 0** |
| position.y | +10px → 0 (**rise**) | **0 → −10px (FALL)** |
| scale | 0.94 → 1.0 | **1.0 → 0.94** |

⚠ **The rise becomes a FALL, not a return to +10px.** The card leaves downward, continuing
the direction of travel rather than retracing its entry.

⚠ **Curve assignment is NOT specified here and must be decided in Plan Mode.** The
entrance pairs smoothstep (opacity) with cubic ease-out (position, scale). Whether the
exit keeps that pairing, or wants an ease-**in** so the departure accelerates away, is a
design question for Carl. **Do not assume the mirror.**

### 3.4 THE BUTTON LEAVES FIRST, THEN THE CARDS

The Next step button is **not part of the arrival ladder**, so it is **not mirrored into
the departure one.** It goes first, on its own; the cards follow.

---

## 4. ⚠⚠ MECHANISM — THE TRAP

**The exit must be built in rAF on the material, exactly as the entrance is.**

⚠ **`.enquiry-phrase-extras-out` — the 900ms CSS opacity transition — NEVER TOUCHES THE
WEBGL CARDS.** The shared host canvas sits **outside** the phrase subtree. That CSS fade
governs **the button and the now-empty measurement box only.**

**Anyone reading the 900ms as "the cards' fade" will build the wrong thing.** It is the
single most available wrong answer in this area, because the number is real, it is nearby,
it is in the same file, and it is currently the only fade anyone can point at.

Consequences to carry into Plan Mode:

- The CSS fade and the rAF exit are **two mechanisms on two different element trees.**
  They must be reasoned about separately even though they overlap in time.
- Today's departure is **a single CSS opacity transition on a DOM ancestor governing all
  five cards as one block.** The specified exit is **three strands on two curves, per
  card, staggered.** ⚠ **THOSE ARE NOT THE SAME MECHANISM** — this is a replacement, not
  a retiming.
- The 0.78 extras dimming (`a8cee4b`) acts on that same DOM box. **It has never actually
  run** — see `css-parse-error-15-august.md`. Its interaction with a WebGL exit is
  **unobserved**, and must be looked at, not assumed.

---

## 5. ⚠ THE SHARED DEPENDENCY — Q4–Q1 HAVE NO CARD ENTRANCE

**This is not a separate bug. It is the same missing signal, and the two must be scoped
together.**

Diagnosed:

- **`hostCardsVisible` is stage-derived, and `stage` does not change per step.** Walking
  Q5 → Q4 is not a stage transition, so nothing recomputes.
- **`entranceAnnounced` is a once-only ref.** It fires for the first question and never
  again.
- **Cards are `key={i}`**, so moving to the next question **swaps their labels without
  remounting them.** No unmount, no remount, no entrance.

⚠ **THE ENTRANCE AND THE EXIT NEED THE SAME THING: A PER-QUESTION BOUNDARY SIGNAL THAT
DOES NOT EXIST.** Something must say *"this question is ending"* (to drive the exit) and
*"a new question has begun"* (to re-arm the entrance).

**Building either alone means building that signal twice, or building it once and wiring
it for a single direction.** ⚠ **SCOPE THEM AS ONE STEP.**

### Why this is §5a and stops for review

Introducing that signal is a **structural decision**, on the file's own test — a future
reader will ask *why does this exist and what owns it?* It touches:

- **What re-arms a once-only ref** — i.e. the cards' effective lifetime
- **Whether `key={i}` survives**, which decides mount/unmount semantics for all five cards
- **A second thing that knows about question boundaries**, alongside `corridorMoving`
- **State that must now survive — or deliberately die at — a boundary it currently
  ignores**

⚠ **Worked cases 1 and 2 in `CLAUDE.md` §5a were both "a second expensive GPU resource
introduced inside a chunk about something else."** This is the same shape: a boundary
signal introduced inside a chunk about an animation. **It stops for review before it is
built.**

---

## 6. WHAT THIS SPEC DOES NOT SETTLE

Stated so that Plan Mode starts from the real open list, not a clean sheet:

1. **Curve assignment for the three exit strands** (§3.3) — ease-out, ease-in, or the
   entrance's pairing.
2. **The boundary signal's design** — what owns it, what it is derived from, whether
   `key={i}` changes. **The structural decision itself.**
3. **Exact compression factor.** ~4x / ~500ms / ~140ms is a candidate, not a decision.
4. **What happens at Q1 → complete**, where there is no next question to admit.
5. **Reduced-motion behaviour** for the exit.
6. **Whether the 0.78 dimming and the WebGL exit fight each other** — the dimming has
   never run at all.
7. **Mobile.** The exit is unspecified at ≤639px; mobile has never been looked at in this
   work.

---

## 7. VERIFICATION THE EXIT WILL NEED

Not written, and NOT to be written before the step is authorised. Noted so it is scoped
in, not bolted on:

- ⚠ **`verify/extras-hold-position.mjs` (`bea8257`) WILL NOT COVER THIS.** It asserts the
  extras' rect does not move, and **says nothing about opacity** — an exit that never
  fires leaves it green. **Falsify any new instrument before trusting a green from it**,
  as that one was.
- The exit's own instrument must read **per-frame material opacity and group transforms**
  — the `?beattrace=1` / `__cardTrace` channel already exists for the entrance and is the
  right precedent.
- ⚠ **A screenshot-per-sample harness cannot measure this.** ~84ms/capture on the main
  thread the animation lives on; the recorded lesson is that such a sampler *"will invent
  a defect and hide a real one."* Use the video track or the in-page trace.
- **Both widths, and film it.** Nothing in the split work has been filmed yet.

---

*16 August 2026. Authored from scratch — the 15 August file it replaces was never written.*
*⚠ SPEC ONLY. The boundary signal is a §5a structural decision and returns in Plan Mode*
*with Carl's word. Scope the Q4–Q1 entrance with it; they are one signal, not two.*
