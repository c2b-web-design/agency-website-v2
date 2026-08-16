# Mobile falsification — the last mobile gap in the split work, closed

**16 August 2026.** Instrument: `verify/extras-hold-position.mjs` (committed `bea8257`).
Result recorded here because the defect was REVERTED — there is no code change to carry it.

---

## WHY A SECOND FALSIFICATION WAS NEEDED

The first falsification injected the DESKTOP ladder (`3.625rem`) at both widths and got
88.79px / 88.78px. **Carl's catch: that 88.78px is the injected defect, not mobile's
travel.** Mobile's own pdepth-1 offset is `4.675rem` — ~29% larger — inside
`@media (max-width: 639px)`. A red produced by desktop's number at a mobile viewport
proves the harness responds; it does NOT exercise mobile's real ladder.

⚠ **This distinction matters because MOBILE HAD NEVER BEEN CHECKED AT ALL** in this work —
not by eye, not by any harness, at any point. The rebased mobile offsets were arithmetic,
unobserved. A falsification that quietly used desktop's constant would have left that
true while appearing to close it.

---

## THE DEFECT INJECTED

Read from `app/globals.css:1940`, not assumed — scoped to the real breakpoint:

```css
@media (max-width: 639px) {
  .enquiry-phrase-anim { transition: bottom 900ms cubic-bezier(0.37, 0, 0.63, 1); }
  .enquiry-pdepth-1 { bottom: 4.675rem; }
}
```

## THE RESULT — RED AT MOBILE, GREEN AT DESKTOP

```
  ✅ desktop  1440x900   HOLD   — 0px drift
  ⛔ mobile    390x844   RIDES  — 105.58px drift
EXIT: 1
```

```
    t=   12ms  top   471.54
    t=  283ms  top   457.32
    t=  546ms  top   412.52
    t=  812ms  top   372.91
    t= 1079ms  top   365.96
    t= 1213ms  top   471.54   ← next question admitted
  top: min 365.96  max 471.54   DRIFT 105.58px  (tolerance 1.5px)
```

Resolved `enquiry-pdepth-1` / `enquiry-phrase-extras-out`, latched t=49ms, outside the
travel wrapper. Reverted; re-run confirms `✅ / ✅`, 0px both widths, exit 0, tree
byte-identical to `bea8257`.

---

## ⚠ THIS WAS A STRONGER TEST THAN THE DESKTOP ONE, AND THAT IS THE POINT

The defect was **width-scoped**, so the harness had to DISCRIMINATE rather than merely
react: desktop had to stay green at 0px while mobile went red. **An instrument that
responds to any injected change whatsoever would have failed both widths.** It did not.

That is a property the first falsification could not have established, because its defect
applied everywhere.

---

## ⚠ THE DRIFT IS OFFSET *PLUS REFLOW*, NOT OFFSET ALONE — DO NOT READ 105.58 AS THE LADDER

`4.675rem` is ~74.8px. The observed travel is **105.58px, ~41% larger.** Desktop shows the
same effect: `3.625rem` = 58px, observed 88.79px.

The cause is that `.enquiry-phrase-extras` is anchored at `top: calc(100% + 1rem)` on the
phrase root, and depth-1 ALSO shrinks the type (mobile 20px → 14px; desktop has its own
step). So the box the extras hangs from gets shorter as it recedes, and the extras absorbs
**the offset and the reflow together.**

⚠ **Consistent across both widths, so it is not an anomaly — but any future reader
comparing a drift figure against a rem value will find they do not match, and this is
why.** The two components have NOT been decomposed. The harness does not need them
separated because it asserts ZERO drift, and zero is zero regardless of what would have
contributed to it. **If a future change ever needs the real travel distance, measure it;
do not derive it from the rem offset, and do not subtract these numbers.**

---

## WHAT IS NOW TRUE, AND WHAT IS STILL NOT

**Closed:** mobile has a falsified instrument asserting the extras hold position through
the recession, exercised against mobile's own ladder at its own breakpoint. The property
the split exists to guarantee is now asserted at both widths.

⚠ **STILL OPEN — this closes the harness gap, NOT the observation gap:**
- **Mobile has still never been LOOKED AT.** This is rects, not pixels. It would pass on
  a page rendering nothing.
- **Nothing has been filmed against the fix** at either width.
- **The 0.78 extras dimming has never run.** It reached a stylesheet for the first time
  at `a8cee4b` — see `css-parse-error-15-august.md`. This harness says nothing about
  opacity and did not exercise it.

---

*16 August 2026. The instrument discriminates by width, and mobile's real ladder drives it red.*
