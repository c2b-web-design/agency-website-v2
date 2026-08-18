# ⚠⚠ INSTRUMENT DEFECT #12 — A HARNESS THAT FAILED TOWARD A **FALSE CONSTRAINT**

**18 August 2026. Recorded in its own right, NOT consolidated into the running tally.**
The tally is Carl's to draw a rule from; the individual failures are the evidence.

---

# ⚠⚠ THE NEW PART: THIS ONE FAILED IN A DIRECTION NOT PREVIOUSLY SEEN

**Every prior expensive defect on this record failed toward a PASS:**

| defect | failed toward |
|---|---|
| `q5-stutter.mjs` — 0/3 CLEAN on a visible stall | a pass |
| `one-context.mjs` — ✅ 2/2 while a context was created per step | a pass |
| reveal window v3 — 0ms, "no freeze", on a live filmed freeze | a pass |
| #11 the arm passthrough — would have filmed baseline twice | a pass |

> ## ⛔ THIS ONE FAILED TOWARD A **FALSE CONSTRAINT**.
>
> It did not report broken work as healthy. **It reported working product as
> structurally incapable** — and would have **removed a required verification and
> manufactured a design decision out of nothing.**

⚠ **A false pass gets believed. A false CONSTRAINT gets DESIGNED AROUND** — and the design
decision it produces is invisible afterwards, because the thing it was avoiding never gets
tried again. **That is a new failure direction on this record and it is worth naming.**

---

## WHAT HAPPENED

A walk script reported `cards=0, clicked=false` at every question. From that I concluded:

> *"the corridor cannot advance past Q5 because selection was removed for the WebGL
> rebuild"* — and reported it to Carl as **"confirmed and pre-existing"**, citing a real
> code comment as corroboration.

**I then sent Carl a decision to make about deferring the Q5→Q1 traveller verification.**

⛔ **It was neither confirmed nor pre-existing. The corridor advances fine.**

## HOW IT WAS CAUGHT

> ### ⚠⚠ CARL CLICKED THE BUTTON HIMSELF AND PHOTOGRAPHED THE RESULT.
>
> Corridor at **Q3** — Q5 answered, Q4 answered, Q3 live with five WebGL cards and one
> selected, full rail history visible. **Not by reading output.**

**This is now the second time in one session that looking at the screen caught what reading
output could not** — the first being the button rendering with no chrome while a
context-count check was about to certify the build as fixed.

## THE CAUSE — the harness did not know how the product takes input

```js
// what the script did — matches NOTHING
document.querySelectorAll(".enquiry-answer-grid button, [role='button']")
element.click()

// what the cards actually are (answer-card-canvas.tsx:4982-5030)
<div data-testid={`answer-card-hover-${i}`}
     onPointerDown={...}                    // ⚠ pointerdown, NOT click
     style={{ pointerEvents: "auto" }} />   // bare div, no role, no button tag
```

⚠ **`onPointerDown`, not `click`, is DELIBERATE** — Carl specified the mouse BUTTON as the
trigger, because `click` fires on release and a slow press would delay the journey.
**A script clicking DOM buttons finds nothing while a human pressing works.**

⚠⚠ **AND MY OWN REPORT CONTAINED THE ANSWER.** I wrote *"the WebGL cards fire their
filament on pointerdown, which is deliberately not the same thing"* — and then used a
click-based selector anyway. **The fact needed to falsify the conclusion was in the same
paragraph as the conclusion.**

## THE FIX, AND THE PROOF

Drive the real hit targets with a real pointerdown:

```
  step 0: Q5 "What brought you here today?"       hits=5  tabIndex=0  contexts=3
  step 1: Q4 "What needs to improve most?"        hits=5  tabIndex=0  contexts=3
  step 2: Q3 "What feels unclear right now?"      hits=5  tabIndex=0  contexts=3
  step 3: Q2 "What should your visitors...?"      hits=5  tabIndex=0  contexts=3
  step 4: Q1 "What would success look like?"      hits=5  tabIndex=0  contexts=3

  FINAL: past Q1.   TOTAL CONTEXTS: 3   (8 before commit 1)
```

> ✅ **THE Q5 → Q1 WALK VERIFICATION IS AVAILABLE.** It was never blocked.
> ⛔ **The deferral decision put to Carl should never have been put.**

---

## ⚠ THE RULE THIS BREAKS — AND IT WAS WRITTEN EARLIER THE SAME DAY

`context-rules.md` → **"An invariant that lives only in prose is not asserted"**, added
hours before this, with the test: *am I relying on a fact that nothing in code checks?*

**"The corridor cannot advance" was exactly such a fact** — inferred from a harness, never
asserted, and contradicted by the product. ⚠⚠ **The rule existed, was freshly written by
me, and was still not applied.** Recording that is more useful than recording the defect.

---

## STANDING CHANGE — appearance and reachability are checked BEFORE numbers

⛔ **A green from an arm whose appearance has not been confirmed is not evidence.**
Carl, 18 August 2026, after a context-count check was one command from certifying a build
whose button had no chrome:

> *"2 contexts is exactly what a build renders when the mesh never mounts."*

**Both gates go in the harness, not in a comment:**
1. **Appearance** — the arm must be confirmed to render the chrome before any timing or
   context figure from it is trusted.
2. **Reachability** — a walk harness that finds zero hit targets must **FAIL LOUDLY**, never
   report a quiet zero. A zero is a broken harness until proven otherwise.

⚠ **A structural change that deletes the thing it was preserving is not a structural
change.**
