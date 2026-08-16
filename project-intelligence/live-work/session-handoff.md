# Session Handoff — 16 August 2026 (the split is CLOSED; the instruments are the work now)

**Read this first, then `project-intelligence/` as normal.** Chat history is not canonical (D-006).
**Delete this file at the end of the session that reads it, once its replacement is written** —
`live-work-protocol.md` §3a.

---

## STATE

**Branch `fix/q5-stall-and-label-colour`, HEAD `8fb20c6`. TREE CLEAN — nothing uncommitted.**

⚠ **The previous handoff was twelve commits stale.** It described two uncommitted files and
listed *"Carl commits the split"* as pending; that had already happened at `664085a`, before
this session began. **Do not carry forward anything from it.**

### ✅ THE SPLIT IS COMMITTED, VERIFIED AND CLOSED

The cards hold position through the recession. Evidence, four independent kinds:

- **Carl by eye**
- **`paint-order.mjs` 336/336** probe points identical vs the `pre-host` baseline
- **Easing confirmed off COMPUTED style** — `cubic-bezier(0.37, 0, 0.63, 1)`, quarter-points
  11.9 / 47.0 / 84.5%
- ⚠ **A FALSIFIED INSTRUMENT AT BOTH WIDTHS** — `verify/extras-hold-position.mjs` (`bea8257`).
  0px drift clean; 88.79px desktop / 105.58px mobile under injected defect. **This is the
  item the last handoff listed as its number-one outstanding gap. It is closed.**

**This subject does not need reopening.** The open work below is elsewhere.

---

## THIS SESSION — 13 commits, in order

```
a8cee4b  stray */ + :1600 ladder correction
52b2c2c  CSS parse error record + the gate hole
bea8257  extras-hold-position.mjs, falsified
314169d  mobile falsified against its own ladder
81e04b2  card exit spec (§5a, SPEC ONLY)
f41f967  reveal stall reproduces + 15 Aug amendment
5cee470  the reveal has no instrument
58aa840  reveal instrument spec (§5a, SPEC ONLY)
0919589  beattrace falsified — injections A/B/C
904824c  beattrace D/E — the live defect
859bb8f  the two circular harnesses fixed
853c5b3  spec correction + clean-tree RED
8fb20c6  ladder compression samples
```

---

## ⚠⚠ THE 0.78 NEVER REACHED A STYLESHEET UNTIL `a8cee4b`

A stray `*/` at `globals.css:1848` closed a comment early, so its own prose parsed as a
selector and **consumed the rule that followed it** —
`.enquiry-pdepth-1 .enquiry-phrase-extras { opacity: 0.78 }`. Confirmed absent from the
built CSS at `664085a`: the only `.78` present was on `.enquiry-phrase-travel`.

⚠ **NEITHER GATE CATCHES IT.** `tsc` and `lint` do not parse CSS; both passed clean on
15 August over a file that could not serve in dev and silently lost a declaration in
production.

⚠ **THE BUILD DID WARN — AND IT SCROLLED PAST.** `npm run build` prints
*"Found 1 warning while optimizing generated CSS"*, drops the rule, and **exits 0**. So a
green build was never evidence here. **That is the actual miss: an instrument that spoke
and nobody read it.**

⚠ **`664085a`'s claim *"extras dimming restored explicitly at 0.78"* is VERIFIED-FALSE.**
Recorded and corrected forward in `css-parse-error-15-august.md`; history not rewritten.

⚠ **CONSEQUENCE STILL LIVE: the 0.78 dimming has never actually run.** It reached a
stylesheet for the first time at `a8cee4b` and **has not been seen by eye.** It changes how
the outgoing cards depart (from 1.0 previously, 0.78 now).

---

## OPEN — LARGEST FIRST

### 1. ⚠⚠ `?beattrace=1` HAS NO QUESTION IDENTITY — TEN DEPENDENTS

**At Q4 it republishes Q5's data.** Measured, no injection, live tree:

```
Q5: MARKS 650@9058 1210@9625 1770@10192 2330@10742 2890@11309   605 samples
Q4: MARKS 650@9058 1210@9625 1770@10192 2330@10742 2890@11309   605 samples
    new marks at Q4: 0      new samples at Q4: 0
```

**Indistinguishable from a healthy run** — a full, correct-looking ladder at a question
where **no card entered at all.** Distinguishable from flag-off only.

Neither channel records which question a beat belongs to: Channel A's name is the rung
constant, Channel B's `card` field is the same constant. **Every harness reading the trace
after a step inherits Q5's timings as the current question's.**

⚠ **NOT FIXED. Its own gated step** — introducing an identity touches what the trace is
keyed by, and ten harnesses read it. Record: `beattrace-falsified-16-august.md` (injection E).

### 2. Q4–Q1 have no card entrance

Diagnosed, unwound, recorded. `hostCardsVisible` is stage-derived and `stage` does not
change per step; `entranceAnnounced` is a once-only ref; cards are `key={i}` so labels swap
without remounting. ⚠ **Shares its missing boundary signal with the card exit — scope them
together.** Mechanism: `entrance-work-written-and-unwound-15-august.md`.

### 3. The reveal is UNPROFILED and has no instrument

`?beattrace=1` covers the **card entrance** — a third thing, sharing only clock zero. It
records nothing about what the reveal does after that point.

⚠ **This RESOLVES the last handoff's "unreconciled gap"**: the ~720ms/~400ms reveal figures
and the ~240ms step figures were **never comparable and never in competition** — different
phases. **Not a contradiction to resolve; an absence to fill.**

**Spec written, NOT built** — `reveal-instrument-spec-16-august.md`, §5a. Its first rule:
the window must be derived from the animation via `getAnimations()`, never typed.

**The stall still reproduces** on the current tree at the **same character** — `W` at f196,
`Wh` frozen f197–f206, `Wha` at f207. ⚠ **Do not compare its ~400ms with the 14 August
~720ms**: different days, single runs, and both figures come from a byte-plateau method now
known to under-report.

### 4. The card exit

Spec written with **seven open items**, §5a — `card-exit-spec-16-august.md`. Carl's
decisions are recorded (compressed echo preserving `CARD_OVERLAP` 0.72, card 5 first, all
three strands reversed, button leaves first). ⚠ **The trap is in the file:**
`.enquiry-phrase-extras-out` (900ms CSS) **never touches the WebGL cards.**

### 5. The ladder's 1→2 gap compresses intermittently

**Real. Measured eight times** on an unmodified tree with no injection, 264–388ms against
560ms. ⚠ **Gaps 2→3, 3→4, 4→5 stay within ±11ms — it is the 1→2 gap ALONE.**

**Rate unestablished.** 8/20 desktop in one sample, 0/20 in a later interleaved sample.
⚠ **Both samples are confounded** — sample 1 confuses width with ordering, sample 2
confuses interleaving with elapsed session time (desktop alone went 8/20 → 0/10).
⚠ **The 0/20 does NOT retire it.**

**OUTSTANDING TEST: A COLD RUN — fresh server, fresh browser process.** Not run. Until one
exists, neither the 40% nor the 0% is characteristic.
Record: `ladder-compression-samples-16-august.md`.

### 6. Mobile has never been LOOKED AT

Rects yes — falsified at 390px, 105.58px under defect, 0px clean. **Pixels no.** Nothing
filmed at either width against the fix.

---

## ⚠ FIVE INSTANCES OF THE MEASUREMENT-TRUST PATTERN — LEAVE THEM FOR CARL

Tabulated in `ladder-compression-samples-16-august.md`. Briefly: a check sharing the fix's
constant; a stale literal; consumers reading a constant-derived label as timing evidence; a
measurement with no identity; and **a correct measurement whose frame of reference distorted
what it showed.**

⚠⚠ **CARL IS HOLDING THESE FOR A GOVERNANCE REVIEW of the architect/builder setup.**
**Do not act on them. Do not consolidate them. Do not propose a rule.** They are collected,
in one place, and they are his.

---

## SERVING

Dev server on **`:3100`** (`npm run dev -- -p 3100`). ⚠ **`TaskStop` reported success on a
held port twice this session** — kill by PID and confirm the port free, per `handoff-protocol.md`.
⚠ **Turbopack served a cached CSS failure across edits**; when a fix appears not to land,
check whether the reported line number exceeds the file's length, then clear `.next`.

---

## ⛔ THE STANDING DIRECTIVE

**NEVER comment on how long Carl has been working.** Not the time of day, not the session
length, not a suggestion to stop or resume later. **Carl decides when a session ends and
will say so.** It was not broken this session.

---

*16 August 2026. ⚠ **The split is closed and the cards hold. What is open is the*
*INSTRUMENTS: one publishes another question's data as this one's, one does not exist, and*
*one intermittent fault has been measured but not characterised.***
