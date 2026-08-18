# Session Handoff — 18 August 2026 (the cause is found; the button awaits Carl's eye)

**Read this first, then `project-intelligence/` as normal.** Chat history is not canonical (D-006).
**Delete this file at the end of the session that reads it, once its replacement is written** —
`live-work-protocol.md` §3a.

---

# ⛔⛔ THE NEXT SESSION'S FIRST TASK IS NOT A MEASUREMENT

> ## **GET THE BUILD IN FRONT OF CARL'S EYE. NO TIMING NUMBER UNTIL HE APPROVES THE APPEARANCE.**
>
> The button was hoisted to a persistent WebGL host and its fade was reproduced per-frame.
> ⚠ **CARL HAS NOT JUDGED IT.** The work is committed as **landed-but-unapproved**.
> **His eye is the verdict and he has not given it.**

**Serve it and show him:** `npm run build && npx next start -p 3100`, walk to Q5, select a card.
Screenshots are at `live-work/shots/commit2-0{1..4}-*.png`.

---

## STATE

**Branch `fix/q5-stall-and-label-colour`, head `a7261d3`. TREE CLEAN. Pushed and verified by
`git ls-remote`.** Servers: none. Ports 3000/3100 free.

```
5af5709  verify — the instruments that found the cause (#11, #12-adjacent)
31e9c3e  fix    — ONE WebGL context for the button  ⚠ NOT APPROVED BY EYE
3d6c671  verify — the appearance gate and the reachability gate
264cfc8  verify — the per-frame opacity curve + context-rules.md's new rule
7811be0  docs   — the session records
a7261d3  docs   — this handoff
```

---

# ⚠⚠ THE CAUSE IS FOUND

```
  baseline        freeze median 140ms   5/8 runs   range 80-160
  ?nobtnmesh=1    freeze median   0ms   0/8 runs   range  0-40
```

**Non-overlapping. Confirmed BY EYE in the films** — baseline held `"Q5 Wl"` across f251–f256 then
jumped to `"What brou"`; both treatment films advanced every frame.

**`NextStepMeshButton`'s per-question WebGL context is the mechanism.** It sat inside the keyed
phrase, so a context was created and destroyed every question — **8 across a five-question walk**,
Q5's created **+54 to +65ms after the reveal began**, inside the 1300ms wipe.

> ### ✅ CONTEXTS NOW HOLD AT **3** ACROSS A FULL Q5→Q1 WALK, DOWN FROM 8.

## ⚠ CONTENTION IS LIVE AND IT CONSTRAINS THE DESIGN

On the quiet arm the card host renders **74 → 84 frames** in the same window (73–75 vs 84–85,
non-overlapping) at **unchanged per-frame cost**. ⚠ **It is not being slowed. It is being starved
of opportunities.** The freeze is a *presentation* failure and frames the card host never got to
render are the currency it is denominated in.

---

# ⚠⚠ THE ATTRIBUTION IS BOUNDED BY COMMITS 1+2 TOGETHER

> ## ⛔ IT MAY NOT BE CLAIMED FOR THE HOIST ALONE.

**The three-commit split assumed lifetime and opacity were separable. THEY ARE NOT.** A persistent
host has no wrapper opacity, so hoisting **necessarily** changes visibility behaviour in the same
edit — the lifetime-only build showed the button **lit and blank during the reveal**, a state the
design does not have.

**Carl ruled A:** *"the button must work exactly as designed. Not negotiable. No interim gate, no
hard on/off placeholder, no build that behaves wrongly for the convenience of a measurement."*

⛔ **The clean separation of per-mount cost from steady-state contention is NOT AVAILABLE AND WILL
NOT BECOME AVAILABLE LATER — the arms were never measured apart.**
⛔ **The unaccounted ~73ms stays unaccounted. DO NOT PROPOSE A ROUTE TO RECOVER IT.**

---

## ⚠ THE CURVE IS REPRODUCED — per-frame, against the pre-hoist build

| phase | worst delta | |
|---|---|---|
| reveal | — | **peak 0.000 both builds** — the forbidden state is gone |
| select | **0.027** | reaches 1 at 631ms vs 637ms |
| exit | **0.033** | reaches 0 at 666ms vs 655ms |

**~0.027 is one 60Hz sample step.** The residual is jitter, not shape.

### Two findings that must survive

⚠⚠ **THE PRE-HOIST EXIT IS A PRODUCT OF TWO TRANSITIONS** — wrapper 600ms × parent 900ms — and
**a product of two linears is QUADRATIC.** The parent's **0.78 starting value is never seen but its
RAMP is.** Dropping it ran **0.186 too bright** through the middle of the exit.

⚠⚠ **THE EYE CANNOT PICK BEZIER CONTROL POINTS.** Hand-chosen `(0.33, 0.66, 0.66, 1)` measured
**0.113**; a grid search against the measurement fitted `(0.3, 0.35, 0.35, 0.65)` at **0.011**.
**Fit curves against a measurement. Do not choose them.**

---

# ⚠⚠ CARL'S HARD CONSTRAINT — BREACHED THREE TIMES TODAY BY PEOPLE WHO HAD READ IT

**The button's appearance and behaviour are non-negotiable:**

- **ABSENT during the reveal.** Not dim, not blank, not lit. Absent.
- **Fades in over 600ms on selection**, with its text and the traveller sweep.
- **Fades out on deselection.**
- **Exits at ~600ms** while the cards continue to 900ms.
- **Never moves.**

> ⚠⚠ **BOTH THE ARCHITECT AND THE BUILDER RECOMMENDED A STEP THAT VIOLATED IT, AND CARL OVERRULED
> BOTH.** The Builder argued for a throwaway hard on/off gate to preserve a measurement's
> attribution. **That reasoning subordinated approved behaviour to the convenience of a
> measurement.**
>
> ### **A CONSTRAINT WRITTEN IN PROSE GETS ARGUED WITH.**

---

# ⚠ FOUR TIMES TODAY, LOOKING AT THE SCREEN CAUGHT WHAT READING OUTPUT COULD NOT

| # | what | the instruments said |
|---|---|---|
| 1 | **the flat white pill** — `fixed` resolved against a transformed shell; mesh 411px/248px adrift | context count read the structural target MET |
| 2 | **the false corridor constraint** — "cannot advance past Q5" | harness reported `cards=0`, silently |
| 3 | **the button visible before selection** | the appearance gate PASSED |
| 4 | **the harness condemning its own reference** | "BUTTON VISIBLE DURING REVEAL, peak 1" on the known-good build |

**Instruments were green or silent in all four.** Two were caught only because Carl looked.

---

## INSTRUMENT DEFECTS — INDIVIDUALLY, UNCONSOLIDATED

⛔ **Carl leads any rule drawn from these. Do not propose one.**

- **#11 — the arm passthrough.** `reveal-stall.mjs` hardcoded `/start`; an A/B run would have
  **filmed the baseline twice**. Fails toward a **PASS**.
- **#12 — the false corridor constraint.** ⚠⚠ **ITS DIRECTION IS NEW.** Every prior expensive
  defect failed toward a pass. **This failed toward a FALSE CONSTRAINT** — it reported working
  product as structurally incapable and **manufactured a design decision put to Carl**.
  > **A false pass gets believed. A false CONSTRAINT gets DESIGNED AROUND and leaves no trace,
  > because the thing avoided never gets tried again.**
- **the context counter counted itself** — 4 where the page creates 3, counting the harness's own
  detached renderer-check canvas.
- **the phase bleed** — the curve harness condemned its own reference.
- **the throttled run** — n=5 samples, nonsense endpoints. **A sample count under 40 voids it.**

---

## ⚠ INSTRUMENT STATE — CARRY ALL OF IT

- ⚠⚠ **`verify/reveal-stall.mjs` MEASURES THE VIDEO TRACK. DO NOT CHANGE THE CHANNEL.** A
  `getComputedStyle` poller reads INTENT and stays green through the freeze. **It accumulates into
  timestamped batches — ⛔ DO NOT REINTRODUCE THE `rmSync`.**
- ⚠ **Arms are confirmed BY CONTEXT COUNT, never by the flag in the URL.** A flag that arrives but
  does not take is the failure a harness hides.
- ⚠ **`verify/mesh-appearance.mjs` is a FLOOR, NOT A VERDICT.** It cannot see a button that should
  not be visible yet — demonstrated today.
- ⚠ **`verify/corridor-reachability.mjs`:** the hit targets are `[data-testid^="answer-card-hover-"]`
  and they fire on **`pointerdown`, NOT click**. Both are load-bearing.
- ⚠ **`verify/button-opacity-curve.mjs`:** effective opacity = product to the root. Reports a curve.
- ⚠ **Q5's reveal begins ~7.8s AFTER Begin**, not ~2.5s. A short window films the opening.
- ⛔ **NO MD5 for static frames.** ⛔ **No screenshot-per-sample harness.**
- ⛔ **`canvas.__r3f` IS UNDEFINED ON PRODUCTION BUILDS.**
- ⚠ **`mount-attribution.mjs`'s `1-context-creation` is VOID as a component figure** — 150ms of
  which ~87ms was a scheduling gap containing the others. Raw `getContext` is **5.1–7.6ms**.

---

## STILL OPEN

- **Commit 3 — the opening/complete visibility gate. ITS OWN COMMIT.** ⚠⚠ It carries **the worst
  visible failure in the plan: a chrome pill painted over the contact form.** Verify by walking
  Q1 → complete, **by eye AND by capture**. ⛔ Do not bundle it with anything.
- ⚠ **The ~87ms scheduling gap.** Unmeasured.
- ⚠ **Post-submission GPU cost.** `gl.finish()` moved the bake only 34.7 → 38.6ms — argues against
  it, does not close it.
- ⚠⚠ **The 40–640ms spread survives untouched.** Today's baseline never exceeded 160ms.
- ⚠ **The mechanism behind "more frames on the quiet arm"** — contention, main-thread scheduling and
  rAF pacing all fit. The instrument says how much and how often, never why.
- **The Send re-target seam.** When Send becomes a mesh it must **re-target this host**, not mount a
  second. ⛔ **Recorded, deliberately not built** — do not build a seam for a component that does
  not exist.
- **Mobile**, **Q1→complete and reduced-motion for the card exit**, the **`useCardChoreography`
  rename** (⚠ last and alone), and **`verify/text-jump-rects.mjs`'s DX CHANNEL NEVER SEEN RED**.

---

## THE ROUTE, ONCE CARL APPROVES THE APPEARANCE

1. **The prediction to `live-work/` FIRST**, thresholds specific enough to breach.
2. **Both arms back to back in ONE session**, 8 runs each, production, cold.
   ⛔ **Baseline re-measured, NEVER recalled** — `f058854` read 1252ms and 1450ms on identical code.
3. ⚠ **Frames extracted and LOOKED AT**, ≥1 run per arm.
4. **Re-run the card-host frame-count channel** — it is a design constraint now, not just evidence.

⚠ **A model that is wrong and KNOWN to be wrong is worth more than one that is wrong and passing.**
Three predictions today missed, all in the direction that flattered the prior frame, and all three
were productive **because their thresholds were set in advance and specific enough to breach.**

---

## METHOD — EARNED FROM REAL FAILURES

- **Falsify every instrument before trusting a green.** Where a defect is live, a correct instrument
  **must go RED today**.
- ⚠⚠ **CONFIRM APPEARANCE BEFORE ANY NUMBER.** A green from an arm nobody has looked at is not
  evidence. **A structural change that deletes the thing it was preserving is not a structural
  change.**
- **State predictions before measuring. The misses are the useful part.**
- **Measure floors, never inherit thresholds. Supersede in place, never rewrite.**
- **One task per prompt. Ask before instructing. Report, then STOP.**
- ⚠⚠ **NEVER explain away a defect Carl reports by eye. HIS EYE IS THE VERDICT.**

## ENVIRONMENT TRAPS

- **Production is the verdict**; dev and production disagree.
- **Turbopack serves cached CSS failures.** Tell: a line number exceeding the file's length.
  `rm -rf .next`.
- ⚠ **`TaskStop` reports success on a held port. Kill by PID, confirm free.**
- **Serving:** `npm run build && npx next start -p 3100`.
  `?nobtnmesh=1` the treatment arm · `?mounttrace=1` / `?mountsync=1` mount attribution ·
  `?hosttrace=1` card-host frames · `?phasetrace=1` · `?beattrace=1` · `?modetrace=1` · `?anchortrace=1`

---

## ⛔ THE STANDING DIRECTIVE

**NEVER comment on how long Carl has been working.** Not the time of day, not the session length,
not a suggestion to stop or resume later. **Carl decides when a session ends and will say so.**
It was not broken this session.

---

*18 August 2026. ⚠ **The cause is found and the repair is committed — but the last word belongs to***
*⚠⚠ **an eye, not an instrument.** Four times today the screen said what the output would not, and*
*⚠⚠ **a constraint written in prose was argued with by two seats that had read it.***
