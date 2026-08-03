# Run Log — the card in grid slot 1, over the lockup

**Date:** 3 August 2026 · **Chunk:** card in place (the step between the backdrop and the filament)
**Carl's instruction:** *"put the card in its location, top left, and make it glass, not frosted."*

---

## Task

Move the WebGL proto card out of the left viewport margin and into grid slot 1, over the
`c2b DESIGN` lockup, so that the lockup is visible **through** the glass.

⚠ **NO PLAN-MODE PLAN.** The step was settled in discussion. Carl had already given the
sequence — *"logo → card in place → filament → clone"* — and this is that second item.

---

## What actually turned out to be wrong, and it was not the frost

**Three separate rounds went into "why does the card still look frosted" before the mechanism
was found. Two of them adjusted a value. Neither could have worked.**

### Fault 1 — the card could not see the lockup at all

The card and the backdrop were in **two separate canvases**. A WebGL canvas can only refract
objects in **its own scene**: `renderTransmissionPass` renders the scene's `opaqueObjects` into
a target the glass then samples (`three.module.js:18039`).

⚠ **SO OVERLAYING THE TWO IN CSS WOULD NOT HAVE WORKED EITHER.** The card would have sat in
front of the logo while refracting nothing. The move into the grid is a **scene merge**, not a
reposition, and that is the whole reason it is a chunk of work rather than a style change.

What the card *was* refracting: its own throwaway stand-in — a smooth blue→teal ramp.

⚠ **A SMOOTH GRADIENT CANNOT SHOW FROST.** Frost is only visible destroying detail that exists.
Over a pure ramp, clear glass and heavy frost are **identical**. Roughness was measured working
correctly across its whole range while the card looked unchanged. See the glass module's
tombstone comment for the numbers.

### Fault 2 — the transmission target clears to WHITE

Found by measuring the **ground** rather than the ink.

`renderTransmissionPass` clears its target before rendering, and at `three.module.js:18019`:

```js
if ( _currentClearAlpha < 1 ) _this.setClearColor( 0xffffff, 0.5 );
```

This canvas is created with `alpha: true`, so the clear alpha **is** 0, so the target is
cleared to **white**.

⚠ **THE PAGE'S BLACK IS CSS. NO WEBGL PASS CAN SEE IT.** The lockup is a cut-out (`alphaTest`),
so everywhere the logo is not, the glass sampled that white clear instead of the dark page.

**Carl's report, which was exactly right:** *"that is not glass. If it was inside the card you
would see the coloured lettering and the dark background."* And: *"glass is not white."*

**Fix:** the page's own darkness added to the scene as a real opaque plane at z=−2, oversized
so its edge is never on screen. `GROUND_COLOR` in `answer-card-backdrop-geometry.ts` carries
the reasoning and the sampled value.

⚠ **NOT THE SAME AS THE EARLIER BLACK-RECTANGLE MISTAKE.** A first version of the *backdrop*
painted a flat fill into the lockup's own canvas, and Carl saw the edge immediately: *"I can see
the black rectangle the text is sitting in."* This plane is a **separate mesh behind the
cut-out**, not a fill inside it, and it is 2× the grid so no boundary is ever in frame.

---

## ⚠ The instrument was wrong, and this is the third instance

**Edge energy reported "85% retained" on a card with literally zero dark pixels in it.**

Gradient magnitude cannot distinguish a *transmitted* edge from a *smeared* one — a blur of the
right colours scores well on it. The claim "structure is visible through the glass" was reported
to Carl on that basis and was **false**.

**Carl's eye caught in one glance what the number had confidently mis-reported.**

The honest instrument was a **luminance histogram of the ground**: outside the card the mark is
strokes on near-black, so if the glass transmits, the black between the strokes survives. It did
not. That measurement was unambiguous on the first run.

⚠ **THE GENERAL FORM, NOW LOGGED THREE TIMES IN THIS PROJECT:**

| Instance | The harness |
|---|---|
| `verify/q5-stutter.mjs` | shared a constant with its own fix — could not fail |
| chunk 2's stand-in | a fixture that could not express the effect under test |
| this run's edge energy | a metric that could not distinguish the defect from the fix |

**A measurement that cannot fail is not evidence.** Numbers are in the verify output; the
lesson belongs in `working-with-the-builder.md`.

---

## Files changed

| File | Change |
|---|---|
| `answer-card-canvas.tsx` | Backdrop mesh joins the scene; card group offset to slot 1; `StandIn` deleted; canvas spans the grid; `?standin=1` / `[s]` rig control removed |
| `answer-card-geometry.ts` | `protoCanvasBox()` now grid-spanning; `cardSlotPosition()` added; `PROTO_GAP_PX` removed; `PROTO_MIN_VIEWPORT_PX` reasoning rewritten |
| `answer-card-backdrop.tsx` | Ground plane added; own `<Canvas>` wrapper deleted (mesh is now rendered inside the card's scene) |
| `answer-card-backdrop-geometry.ts` | `GROUND_COLOR` added |
| `answer-card-glass.ts` | Stand-in builder and material deleted; `three` import removed; `GLASS_ROUGHNESS` comment rewritten with the real cause |
| `enquiry-opening.tsx` | One canvas instead of two, mounted inside `.enquiry-answer-grid` |

⚠ **`PROTO_MIN_VIEWPORT_PX` CHANGED MEANING WITHOUT CHANGING VALUE.** It was an *overflow*
guard (the card needed margin that did not exist at 1024). It is now a *correctness* guard —
`CARD_BOXES` describes the three-column layout, which only holds above this width. **Chunk 5
must revisit it rather than inherit it:** five cards cannot simply vanish below 1280px the way
one prototype could.

---

## Checks run

- `npx tsc --noEmit` — clean
- `npm run lint` — **1 problem (1 error, 0 warnings)**, the recorded baseline in
  `enquiry-opening.tsx`. No new errors.
- `verify/_tmp-card-in-slot.mjs` — canvas on the grid, no external requests
- `verify/_tmp-ground.mjs` — the ground histogram, before and after

**Before/after numbers are in the harness output, not restated here** (§3b: measured detail
degrades when summarised; the harnesses re-run in one command).

---

## Status

**Uncommitted.** Carl has not asked for a commit.

**Carl's verdict:** *"Yes, now we are on the same page"* — the card reads as glass over the
lockup. ⚠ **That is agreement that the mechanism is right, NOT an approval of the frost level,
the transmission value, or the rim.**

**Untracked harnesses:** `verify/_tmp-card-in-slot.mjs`, `verify/_tmp-ground.mjs`, plus chunk
1's and chunk 2's. Delete when their chunks close.

---

## Next

**The filament**, per Carl's sequence. See `session-handoff.md` — the filament's design was
settled in discussion at the end of this session and is recorded there, including Carl's
decision on the physics question.
