# The reveal instrument — SPEC ONLY

**16 August 2026. ⚠ SPEC. NO CODE. NOT AUTHORISED TO BUILD.**

**§5a: Plan Mode and Carl's word before any implementation.** Nothing in this file is a
licence to start. It exists because the reveal has never been profiled
(`reveal-has-no-instrument-16-august.md`) and the last attempt at this exact measurement
failed in a way that is now on the record twice.

---

## 1. WHAT IT MEASURES

**The progress of `enquiry-mask-reveal-horizontal`** — the `clip-path: inset()` whose right
edge sweeps **100% → 0**, with an opacity ramp 0.85 → 1.

| | |
|---|---|
| Keyframes | `app/globals.css:132-141` |
| Rule | `app/globals.css:1314-1316` — `1300ms linear both` |
| Applied at | `components/enquiry/enquiry-opening.tsx:1456`, gated `isActive && !reducedMotion` |

**A STALL IS: progress FLATLINING while the clock RUNS ON.** That is the definition the
instrument exists to detect, and it is why a single figure ("the reveal took 1300ms") is
useless — a stalled reveal and a healthy one can take the same total time.

---

## 2. ⚠⚠ THE CONSTRAINT THAT DECIDES THE DESIGN — READ BEFORE ANYTHING ELSE

**`verify/q5-stutter.mjs` measured 0–700ms of a 1300ms animation and reported 0/3 CLEAN on
a stall Carl could plainly see.**

Its window came from `Q5_REVEAL_CLEAR_MS = 700`, derived from `.enquiry-q5-block`'s opacity
fade — **THE SAME CONSTANT THE FIX USED.** 700ms is ~54% through the real 1300ms mask. The
Three.js CPU init was pushed out of the first 700ms and into the remaining 600ms: still
inside the phrase, **outside the measured window.** The harness could not fail in the
direction that mattered.

⚠ **THIS IS THE SECOND TIME.** The failure mode is already written up in the reference
notes (*a harness sharing a constant with the fix*). It is being restated here because
recording it once did not prevent it, and because the next instrument in this area is the
one most likely to repeat it.

### ⚠ THEREFORE — THE INSTRUMENT'S FIRST RULE

> **THE WINDOW MUST BE DERIVED FROM THE ANIMATION ITSELF**, by reading its real duration
> from `getAnimations()`. **NEVER from a literal.**

⚠ **IF ANYONE TYPES `1300` INTO THE HARNESS, THE FAULT IS REBUILT WITH A BETTER NUMBER.**
A hand-typed 1300 is the same defect as the hand-typed 700 — it is correct today and
becomes a silent false pass the moment the animation is retimed.

⚠ **AND THE DURATION IS NOT EVEN CONSTANT ACROSS WIDTHS.** `globals.css:2014-2031` runs the
same keyframes at **1500 / 1550 / 1700 / 1450 / 2800 / 2400ms** at mobile widths, with
different delays. **A literal cannot be right at both widths simultaneously.** Anyone
typing one number has already failed at ≤639px.

**The harness must state, in its output, which animation it read its window off and what
duration that animation reported.**

---

## 3. TWO POLLABLE SOURCES, AND THEY DIVERGE

| Source | What it is | Behaviour during a stall |
|---|---|---|
| `getComputedStyle().clipPath` | The **LIVE INTERPOLATED** inset, not the declared value | **Stops advancing** if the freeze is in the animation |
| `Animation.currentTime` | **Clock-driven** timeline position | **May keep advancing while nothing paints** |

`verify/arm-by-width.mjs:38` already uses `getAnimations()` filtered on
`animationName === "enquiry-mask-reveal-horizontal"` — the precedent exists and the lookup
pattern is proven.

⚠ **SAMPLE BOTH. THEIR DIVERGENCE DURING A STALL IS INFORMATION NEITHER GIVES ALONE.**

- **Both flat** → the animation itself is not advancing.
- **`currentTime` advancing, `clipPath` flat** → the timeline runs while the style does not
  follow.
- **Both advancing, but the screen frozen** → neither source can see it, and only the video
  track can. **That case must be treated as possible, not dismissed.**

**Do not collapse the two into one "progress" number.** The whole value is in the gap
between them.

---

## 4. ⚠ WHAT NEITHER PROVES

**COMPUTED STYLE IS NOT PAINT.** A computed value can advance while the compositor shows a
stale frame.

⚠ **This project has a documented history of rect-level and byte-level checks passing on
visibly broken builds** — most recently this week, where `tsc` and `lint` both passed clean
over a stylesheet that could not serve, and `active-grid-fixed.mjs` passed green all week
while the cards rose and fell.

⚠ **THE VIDEO TRACK STAYS IN THE PICTURE.** It remains the only **unperturbing** observation
of what was actually shown. It is not superseded by this instrument and must not be retired
in its favour. The correct relationship: **the poll says where to look and by how much; the
film says whether anyone would have seen it.**

---

## 5. ⚠ THE PAGE EMITS NOTHING USEFUL

**Exactly ONE observable moment exists between "reveal begins" and "reveal completes":**

- `animationstart` → `window.__revealStart = performance.now()`
  (`enquiry-opening.tsx:1458-1469`, guarded to `enquiry-mask-reveal*`, consumed as the card
  ladder's clock zero at `answer-card-canvas.tsx:1763`)

**`animationend` is NOT WIRED.** No handler exists anywhere.

⚠ **A 400ms MID-WIPE FREEZE PRODUCES NO EVENT AND NO VALUE CHANGE IN EITHER.**
`animationstart` has already fired; `__revealStart` is a single timestamp that never
updates. **Both would report a perfectly healthy reveal.**

**So the instrument CANNOT be event-driven.** There is nothing to listen to. It must poll,
which is what makes §6 unavoidable.

---

## 6. ⚠ COST IS UNMEASURED — AND MUST BE MEASURED, NOT ARGUED

**Polling runs on the thread the stall lives on.**

- **`page.screenshot()` is DISQUALIFIED.** ~40–80ms per capture on that same main thread.
  ⚠ **That is a VALIDITY limit, not a resolution one — it does not improve by sampling
  harder.**
- **Whether a `getAnimations()` / `getComputedStyle()` poll is material is UNKNOWN.**

⚠ **RECORD IT AS UNKNOWN AND REQUIRE IT BE MEASURED.** The argument that such a poll sits
orders of magnitude below a screenshot — no serialisation, no IPC, no GPU readback — is **an
argument from MECHANISM, not a measurement.** The same argument is currently outstanding
against `?beattrace=1`, whose per-frame cost is also unmeasured
(`reveal-has-no-instrument-16-august.md`).

⚠ **A forced style recalculation is exactly the kind of cost that lands on the main thread,
and `getComputedStyle` on an animating property is a candidate for one.** Assume nothing.
**Measure the instrument before trusting the instrument.**

---

## 7. ⚠ FALSIFY BEFORE TRUSTING

**Inject a deliberate main-thread block mid-wipe. Prove RED. Revert. Prove GREEN.**

⚠ **A GREEN FROM AN UNFALSIFIED INSTRUMENT IS NOT EVIDENCE.** That is the standing lesson
and it has been paid for repeatedly in this area.

⚠ **AND FALSIFICATION FINDS DEFECTS IN THE INSTRUMENT, NOT ONLY IN THE SUBJECT.** When
`verify/extras-hold-position.mjs` was falsified on 16 August, the first red run **resolved
the wrong element** — it latched its resolution report on frame 0, before the press took
effect. The verdict was right and the element it named was wrong. **Run green-first and
that ships silently.**

Requirements carried from that instrument:
- **Falsify at BOTH widths** — and note that the mobile durations differ (§2), so a
  width-scoped defect is the sharper test: it forces the harness to **discriminate**, not
  merely react.
- **Declare in the OUTPUT what it does not watch**, not only in the header.
- **Report what it resolved** — which animation, which element, what duration — every run.
- **Fail loudly on resolving nothing.** A harness that finds no animation must not pass
  vacuously.

---

## 8. ALSO RECORDED

### ⚠ The `clip-path` → `transform` comment is WRONG, or describes another element

`enquiry-opening.tsx:1441-1442` states the wipe *"was rewritten from `clip-path` to
`transform` — because Chrome cannot composite `clip-path`, so a blocked main thread freezes
the reveal outright."*

⚠ **THE RULE ON DISK IS `clip-path`.** Verified 16 August: all three reveal keyframes
(`-horizontal`, `-downward`, `-radial`, `globals.css:132-164`) animate `clip-path`, and
**no transform-based reveal exists anywhere in the stylesheet.**

⚠ **IT NEARLY PRODUCED A WRONG ANSWER TODAY.** That comment was repeated as fact earlier in
this session when reporting on the card exit; it was caught only by reading the CSS. **A
future reader deciding whether reveal progress is JS-readable will reach the opposite
conclusion if they trust it.**

**Not corrected here** — this file is a spec, and amending that comment is a code change
outside its scope. **Recorded as a known-bad comment to be fixed under its own authority.**
The claim's second half (a blocked main thread freezing the reveal) is **not assessed here**
either way.

### The stutter has MOVED before

Originally the **"h" of "here"**; on 30 July, the **"Wh" of "What"**. Both films this week
(14 and 16 August) land on **"Wh"**.

⚠ **RECORDED AS FACT. NO INFERENCE DRAWN.** The reference note holds that *"a moved symptom
is an unfixed one — where it lands tells you where the work landed"*, but applying that here
would be diagnosis, and diagnosis is out of scope for this spec.

---

## 9. WHAT THIS SPEC DOES NOT SETTLE

1. **Poll interval** — and whether a fixed interval is even the right shape.
2. **Pass/fail threshold.** What flatline duration constitutes a stall, and derived from
   what — ⚠ **not from a literal, per §2.**
3. **Whether the poll perturbs the measurement** (§6). **Unknown, and blocking.**
4. **How the poll and the video track are reconciled** when they disagree (§4).
5. **Mobile**, where the durations differ per question and per width.
6. **Whether this instrument or `?beattrace=1` should be falsified first** — the latter has
   ten dependents and is also unfalsified.

---

*16 August 2026. ⚠ SPEC ONLY. The window comes from the animation, never from a literal —*
*that rule is the whole reason this file exists.*
