# Session Handoff — 15 August 2026 (the cards HOLD POSITION; the split is unverified by harness)

**Read this first, then `project-intelligence/` as normal.** Chat history is not canonical (D-006).
**Delete this file at the end of the session that reads it, once its replacement is written** —
`live-work-protocol.md` §3a.

---

## STATE

**Branch `fix/q5-stall-and-label-colour`, base `9ec3201`. Last commit `cbd7ad3` (the filmed
stall — docs and a `.webm` only, no code).**

⚠⚠ **TWO FILES ARE MODIFIED AND UNSTAGED. NOTHING OF THE FIX IS COMMITTED.**

    M  app/globals.css
    M  components/enquiry/enquiry-opening.tsx

- **`npx tsc --noEmit` — clean, exit 0.**
- **`npm run lint` — `1 problem (1 error, 0 warnings)`, exit 1.** The known baseline
  (`react-hooks/set-state-in-effect`, the reduced-motion effect). Exit 1 is expected.
- **`:3100` is serving the current tree**, build `lBKQwXyLv8qIEha6IENIf`.

### What is in the tree

1. **The CSS split.** `.enquiry-phrase` is now STATIC at `bottom: -1.925rem`; a new inner
   `.enquiry-phrase-travel` carries `bottom`/`opacity`. **Eleven rung offsets rebased by
   +1.925rem — desktop AND mobile — so every travel DISTANCE is unchanged.** The qrow and the
   answers summary travel together as one rung (Carl's call); `.enquiry-phrase-extras` stays on
   the static root and no longer rides the recession.
2. **The 0.78 extras dimming**, restored as a STATED value (`.enquiry-pdepth-1
   .enquiry-phrase-extras`) because the split took the extras out of the rung's opacity group.
   ⚠ **Its compound selector is LOAD-BEARING:** the fade rule is written
   `.enquiry-phrase-extras.enquiry-phrase-extras-out` (0,2,0) so it outranks the 0.78 rule.
   **Written bare (0,1,0) it LOSES and the outgoing cards never fade at all.**
3. **The 900ms extras fade** (was 300ms), derived from the recession's own 900ms so the fade
   spans exactly the question's travel.

---

## ✅ VERIFIED — Carl by eye, and measured

- **THE CARDS HOLD POSITION.** Carl confirmed by eye. **All five clickable at every question**,
  full Q5→Q1 walk, `card-interaction.mjs` 0 failures.
- **The rail reads right** — Carl's eye.
- **The easing SURVIVED the split.** `cubic-bezier(0.37, 0, 0.63, 1)` confirmed in the
  element's COMPUTED style (not just the source). Quarter-points **11.9 / 47.0 / 84.5 %** —
  a straight line would give 25 / 50 / 75.
- **`paint-order.mjs` 336/336 probe points identical** vs the `pre-host` baseline, and the
  PRIMARY selector branch was proven to resolve (not the fallback) at rest.
- ⚠⚠ **THE PASSENGER TRAVEL IS GONE, MEASURED:** mid-corridor the outgoing grid sits at
  **top 493 — its rest position.** Pre-split it moved **493 → 480** at that same moment.
- **Carl approved the Next step button's gentler exit** (the 900ms).

---

## ⛔ OUTSTANDING — NOT DONE

1. ⚠⚠ **NO HARNESS ASSERTS THE CARDS HOLD POSITION MID-RECESSION** — *the property this whole
   fix exists to guarantee.* The 493-vs-493 figure above came from a throwaway probe that was
   **deleted rather than left behind as an unfalsified instrument.**
   **`verify/extras-hold-position.mjs` IS SPECIFIED BUT NOT WRITTEN.** Spec:
   - assert the extras' rect is UNCHANGED from press through to the boundary, **sampled
     MID-RECESSION, not at rest**
   - ⚠ **FALSIFY IT FIRST** — the pre-fix build is gone, so introduce a deliberate defect
     locally (put `bottom` back on the phrase root), confirm RED, revert
   - ⚠ **declare in its OUTPUT what it does NOT watch**
   - run at **1440x900 AND ≤639px**
   - ⚠ its header must say **`active-grid-fixed.mjs` samples AT REST and passed green all week
     while the cards rose** — so nobody reads the two as redundant
2. ⚠ **`answer-card-canvas.tsx:1600` still calls `220/350/480/610/740` "approved".** It is the
   **CSS-era** ladder. **The real one is derived: 650 / 1210 / 1770 / 2330 / 2890, with
   `CARD_RISE_DURATION_MS = 2000` (each card's OWN fade) and `CARD_RISE_GAP_MS = 560`.**
   The gap is shorter than the fade, so **four cards are mid-entrance at once**.
   ⚠ **That stale line sent every calculation in this session wrong.** A correction was drafted
   and **NOT applied** — the session ended first.
3. **Nothing has been filmed against the fix.** Every verification above is rects and stacks.
4. ⚠ **MOBILE HAS NEVER BEEN CHECKED AT ALL.** Mobile travel was **74.8px**, ~29% larger than
   desktop. The rebased mobile offsets are arithmetic, unobserved.
5. **Q4–Q1 STILL HAVE NO CARD ENTRANCE.** The epoch work was written and unwound today —
   deliberately, so the split could be judged alone. Mechanism and reasoning:
   `live-work/entrance-work-written-and-unwound-15-august.md`. It returns as its own gated step.

---

## 🎥 THE FILMED STALL — the session's other result

- **Q5's reveal stalls ~720ms (BOUNDED ~680–760 by 40ms sampling — not exact) at "Wh"**, inside
  the first word. **Eighteen consecutive static frames.** Matches Carl's report by eye.
- Record: **`live-work/q5-reveal-stall-filmed-15-august.md`**.
- ✅ **THE `.webm` IS PERMANENT — CHECKED.** It is at
  `live-work/screenshots/q5-reveal-stall-prefix-build-15-august.webm` and is **COMMITTED at
  `cbd7ad3`**, so it is in git history and does not depend on `verify/out/` surviving.
  **This item is closed; it does not need re-checking.**
- ⚠ **METHOD LESSON:** found on `corridor-filmstrip.mjs`'s VIDEO track — a harness never run,
  whose recording nobody had looked at, capturing **out-of-process**. `page.screenshot()` could
  not have shown it: ~84ms/capture on the same main thread the stall lives on.
- ⛔ **OPEN AND UNRECONCILED: the ~720ms REVEAL against the ~240ms/step, ~180ms gap, 67.2ms
  button and ~112ms `PutChanged` figures — all from the corridor STEP, an order of magnitude
  smaller.** Whether these are two faults, or whether the step probes were never measuring what
  Carl was seeing, **is not answered.** Do not reconcile them by assumption.

---

## NEXT, IN ORDER

1. **Write + falsify `verify/extras-hold-position.mjs`**, both widths (spec above).
2. **Fix the `:1600` comment.**
3. **Carl commits the split.**
4. **THEN the card exit — §5a, its own gated step, PLAN MODE.**
   ⚠ **`live-work/card-exit-spec-15-august.md` DOES NOT EXIST — it was never written.** The
   exit spec must be authored from scratch. What was gathered toward it this session, verified
   from source:
   - the entrance is **rAF-driven in Three.js, NOT CSS** — `mat.opacity` written per frame by
     `CardLighting`, plus `group.position.y` and `group.scale`
   - **three strands on two curves:** opacity = smoothstep `p²(3−2p)`; position (10px rise) and
     scale (0.94→1) = cubic ease-out `1−(1−r)³`
   - `group.visible` steps false→true at the rung — a waiting card is ABSENT, not transparent
   - **a mirrored exit must mirror three strands on two curves in rAF**, whereas today's
     fade-out is a single CSS opacity transition on a DOM ancestor governing all five cards as
     one block. **Those are not the same mechanism.**

---

## ⛔ THE STANDING DIRECTIVE

**NEVER comment on how long Carl has been working.** Not the time of day, not the session
length, not a suggestion to stop or resume later. **Carl decides when a session ends and will
say so.** It was not broken this session.

---

*15 August 2026. ⚠⚠ **The cards hold position and the passenger travel is measured gone — but
the harness that would PROVE it does not exist yet, and nothing has been filmed against the fix.
Two files are uncommitted. Mobile is unchecked.***
