# Run log — Q&A answer card, chunk 2 (the glass)

**Date:** 3 August 2026
**Plan:** `.claude/plans/glowing-sniffing-quiche.md` (revision 2 — 7 review findings folded in)
**Status:** ⚠ **Built and measured. NOT APPROVED — awaiting Carl's eye.**

---

## What was built

| File | Change |
|---|---|
| `answer-card-glass.ts` | **New** — material constants, cool env-map constants, the calibration stand-in |
| `answer-card-mesh.tsx` | Face → `MeshPhysicalMaterial`; rim and bevel unchanged |
| `answer-card-canvas.tsx` | Local PMREM env map, stand-in plane, `[7-8]` glass rig, `?roughness=` / `?standin=0` |

⚠ **`app/globals.css` untouched. `enquiry-opening.tsx` untouched** — the canvas was already
mounted, so chunk 2 needed **no unlock**, and `chunk-scope.json`'s `unlocked` was returned to
empty.

**Shipped values, all PROVISIONAL under D-035:**

| Property | Value | Status |
|---|---|---|
| `roughness` | 0.28 | ⚠ **THE control** — adjustable, and the number Carl judges |
| `transmission` | 0.97 | Adjustable |
| `color` | `#e8eef8` | Near-white — see below |
| `thickness` / `ior` | 6 / 1.45 | ⚠ **FIXED, not exposed** |

---

## ⚠ THE CHUNK'S PRODUCT — the frost threshold table

**Measured on rendered pixels across the card's interior, 3 August:**

| roughness | range | strokes visible | verdict |
|---:|---:|---:|---|
| 0.00 | 115 | 5 | legible |
| 0.15 | 112 | 4 | legible |
| 0.30 | 97 | 4 | legible |
| **0.45** | **69** | **5** | **legible** |
| 0.60 | 26 | **0** | detail gone |
| 0.90 | 4 | 0 | detail gone |

⚠ **THE USABLE BAND IS 0 TO ~0.45, AND DETAIL COLLAPSES BETWEEN 0.45 AND 0.60.**

⚠ **AND THE QUANTISATION RISK THE PLAN FLAGGED DID NOT MATERIALISE.** The plan warned that the
transmission target is viewport-sized on a ~195 × 56 canvas, so frost might quantise to two or
three mip steps with nothing tunable between "clear" and "gone". **Measured: four legible steps
with a genuine gradient.** `transmissionResolutionScale` was named as the fix in advance and is
not needed.

### What chunk 3 takes from this

```
required mark height = strokeWidth / 0.0247
```

Derived from the real mask: its thinnest stroke is **14px of a 566px-tall mark**. So a mark
spanning the grid's full 576px width gives a **7.18px stroke** — comfortably inside the legible
band. **Chunk 3's scale is now arithmetic rather than a guess.**

---

## ⚠ THE Q5 STUTTER RETURNED, AND IT WAS THE BUILDER'S OWN REGRESSION

**Carl, on first look: the phrase stuttered on the "W" and "h" of "What" — the same fault, in
the same place, as the one `current-sprint.md` records as resolved on 30 July.**

**Measured before touching anything, 3/3 cold runs:**

| | WebGL contexts in reveal | Worst long task |
|---|---:|---:|
| Before | **1**, at +58–64ms | **1827–2138ms** |
| After | **0** | **0ms** |

**Cause:** `enquiry-opening.tsx` already had `canvasWarm`, a gate built specifically to keep
WebGL initialisation off the 1300ms phrase wipe. **Chunk 1's proto canvas mounted on
`showExtras` and went straight past it.**

⚠ **THE LESSON IS THE SIBLING OF ONE ALREADY RECORDED.** `current-sprint.md` logs a *harness*
that shared an assumption with its fix and so confirmed the bug. **This is a *guard* that
protected one instance of a thing while a second instance was added beside it.** A guard written
for one canvas does not cover the next one — and chunks 3–5 add more canvases.

### ⚠ The first fix worked and was the wrong instrument

Gating the mount on `canvasWarm` removed the stutter. **But that gate is derived from the
CONTACT FIELD's warm-up**, which only clears once an idle opportunity arrives after it — so the
proto arrived at **+8270ms**, roughly **1330ms after its CSS neighbours**. Carl: *"the card
arrives too late."*

**The gate now lives in `answer-card-canvas.tsx`**, measured from when that component mounts
rather than inherited from one anchored to Begin. `enquiry-opening.tsx` returns to **+12
insertions, 0 deletions — comment only, no functional change.**

### ⚠ And the timing conflict is real, not a defect

**Measured 3 August:**

| Event | +Begin |
|---|---:|
| CSS cards appear **and** the phrase wipe starts | 6982ms |
| Phrase wipe ends | 8282ms |
| Proto card arrives | 8283ms |

⚠ **THE WIPE RUNS ALONGSIDE THE ANSWER CARDS, NOT BEFORE THEM.** The Builder assumed the
opposite twice while diagnosing — first that its own gate was late, then that the reveal
finished early. **Both wrong; the measurement settled it.** WebGL setup and the wipe want the
same 1300ms, so **the card cannot match card 1's 220ms entrance without putting the stutter
back.**

**Carl's decision:** *"the new card is a test, it's not important it reveals with card 1, only
that it's there."* **The lag is accepted, not outstanding.**

⚠ **IT BECOMES A REAL QUESTION IN CHUNK 5**, when the card joins the grid and must arrive on the
approved 700ms/220ms ladder. **The fix then is to warm the canvas during the opening
choreography — mounted hidden, well before the cards — NOT to shorten the wait.**

---

## ⚠ THE BACKDROP QUESTION TOOK THREE REPORTS TO GET RIGHT, AND ALL THREE HAVE ONE CAUSE

| Carl's report | What was actually happening |
|---|---|
| *"What are the 4 white bands?"* | The calibration strokes shipped ON — a measuring instrument rendering by default |
| *"back to grey"* / *"No glass"* | Turning the stand-in off removed the **backdrop** too, so the glass had nothing to transmit |
| *"Card appears in a grey state then gets brighter"* | The env map attached imperatively AFTER the material was built (fixed separately) |

⚠ **GLASS OVER A NEAR-BLACK PAGE SHOWS NEAR-BLACK.** That is this chunk's own central finding,
and the Builder walked into it from both sides — first leaving a measurement pattern on by
default, then removing the only thing that made the material visible at all.

**Settled by Carl, and now the shipped default:** the corridor's **blue→teal wash, no
calibration strokes**. The card reads as glass on an ordinary load; nothing on screen looks like
a design decision; `?standin=1` adds the strokes when the frost needs measuring, `[s]` toggles
them live.

⚠ **THE BACKDROP IS NOT DECORATION. It is the only thing that makes the material visible**, and
that is precisely why chunk 3 exists rather than being an embellishment on top of chunk 2.

---

## ⚠ The entrance and the glass were fighting each other

Carl: *"fades in, moves slightly up then brightens."* Three stages where there should be one.

**The entrance faded `material.opacity`, which requires `transparent = true` on every
sub-mesh.** But `three.module.js:8237` routes any transparent material out of the opaque list,
and `:18039` renders **only** `opaqueObjects` into the transmission target.

⚠ **SO FOR THE WHOLE 700ms RISE, THE RIM AND BEVEL WERE INVISIBLE TO THE GLASS REFRACTING
THEM** — and the card visibly changed when the fade ended and they rejoined the opaque list.

⚠ **IT IS THE SAME CONSTRAINT THIS CHUNK ALREADY DOCUMENTED FOR THE STAND-IN, ARRIVING FROM THE
OTHER DIRECTION.** The stand-in was made opaque on purpose; the entrance was quietly making
everything else transparent.

**Fix:** the opacity fade is removed and the 6px rise kept, with the group toggling `visible`.
The meshes stay opaque throughout, so the transmission target never changes membership.

⚠ **AND THIS IS A REAL CONSTRAINT FOR CHUNK 5, NOT A SHORTCUT. A transmissive card cannot
cross-fade by material opacity** without dropping its own neighbours out of the refraction for
the duration. When the rollout needs the approved 700ms/220ms fade on five cards, the route is a
group-level effect — scale, position, or a masked reveal — **never per-material opacity.**

---

## ⚠ Findings during the build

### 1. The material was a plastic button, and `transmission` was the cause

First render measured `rgb(10-50, 58-110, 148-187)`, peak luminance 215 — bright, saturated,
plainly not glass. **And it destroyed the chunk's own test:** the calibration strokes registered
as a 13-point lift on a 148 base.

⚠ **THE FRACTION NOT TRANSMITTED BEHAVES AS AN ORDINARY LIT DIFFUSE SURFACE IN `color`.** At
`transmission: 0.85`, fifteen percent of a mid-blue diffuse face sat on top of everything.
**Raised to 0.97.**

### 2. ⚠ `color` does double duty, and a blue body colour was the wrong call

`GLASS_COLOR` began as the card's blue `#3e6cb2`. In `MeshPhysicalMaterial`, `color` **tints
transmitted light AND acts as the diffuse albedo** of the untransmitted fraction — so it both
dyed everything behind the glass and painted a lit blue surface over it.

⚠ **AND THE TINT IS THE WRONG JOB FOR IT ANYWAY.** What is behind the glass carries the colour
— that is the premise of the backdrop, and in chunk 3 it becomes the logo. **Glass that dyes its
own contents would make the backdrop's colour movement unreadable.** Changed to `#e8eef8`;
`attenuationColor` is the correct property if a stronger body tint is ever wanted, because it
colours by depth travelled rather than flatly.

### 3. ⚠ THE FIRST HARNESS METRIC WAS MEASURING THE CARD'S RIM, NOT THE STROKES

A full-width RMS scan reported ~57 that **barely moved across the entire roughness range** —
58.1 at roughness 0 down to 55.1 at 0.9, a 5% change from clear glass to fully rough. It even
scored the **empty card higher** than the one with the stand-in behind it.

⚠ **THE CARD'S OWN BRIGHT RIM AND ITS EDGES AGAINST THE PAGE DOMINATED THE MEASUREMENT.** The
strokes contributed a few points out of sixty. **Scanning 18%–86% of the width isolates the face
and the same sweep resolves cleanly** — range 115 → 4.

⚠ **THIS IS THE THIRD TIME IN TWO CHUNKS A METRIC HAS MEASURED SOMETHING OTHER THAN WHAT IT
CLAIMED** (chunk 1: `|normal.z|` blind to a flipped normal; chunk 1: a tilt formula with a
factor-of-2 error). **The pattern is not carelessness about arithmetic — it is that a plausible
number stops the search.**

### 4. A long detour through the lint rules, and the outcome is better than the start

Attaching the env map by holding the material in a container and assigning inside an effect —
the shape `useStudioEnvMap` uses — **trips `react-hooks/immutability` in every form tried:**
`useState<RefObject>`, a one-element `useState` array (exactly the contact field's shape),
`useMemo`, and a forwarded ref. The rule traces provenance through wrapper objects, array
elements and hook arguments alike.

Publishing the texture with `setEnvMap` inside the effect then trips
`react-hooks/set-state-in-effect` — **the same rule as the project's one accepted error.**
Trading one rule for another is not a fix.

**Resolution:** build the map in `useMemo` and hand it to the material through a **callback
ref**, where the material is a plain argument React does not own. The Strict Mode concern that
motivated the effect-based lifecycle is handled by disposing the previous target when a new one
is built, plus on unmount.

⚠ **THE CONTACT FIELD'S PATTERN LOOKED LIKE THE OBVIOUS PRECEDENT AND COULD NOT BE FOLLOWED.**
Recorded so the next session does not repeat the attempt.

---

## Verification — all checks passing

`verify/_tmp-glass-threshold.mjs` (temporary; delete when the chunk closes).

| Check | Result |
|---|---|
| No external network request | PASS — none |
| ⚠ **The glass CAN SEE the stand-in** (behavioural, not property-based) | PASS — mean 161.2 with vs 197.5 without |
| Stand-in adds structure the empty card lacks | PASS — 5 strokes vs 0, range 100 vs 2 |
| ⚠ **CONTROL: roughness destroys detail** | PASS — 5 strokes/range 115 → 0/2 |
| The tunable band is not quantised away | PASS — 4 legible steps |
| **Chunk 1 regression — all 18 checks** | PASS, unchanged |

**Lint: `1 problem (1 error, 0 warnings)`** — the recorded baseline. **`npx tsc --noEmit` clean.**

⚠ **THE STAND-IN'S OPACITY IS VERIFIED BEHAVIOURALLY, NOT BY READING A PROPERTY.** Hiding it
must change the card; if the glass could not see it, hiding it would change nothing. A property
assertion would have passed even if the transmission pass were ignoring it entirely.

**Screenshot:** `screenshots/answer-card-chunk2-glass.png`

---

## How to look at it

```
http://localhost:3000/start                    walk to Q5 — glass card left of "Premium new website"
http://localhost:3000/start?cardrig=1          [1-6] geometry, [7-8] glass, [s] stand-in, [↑/↓], [0]
http://localhost:3000/start?roughness=0.45     jump straight to a frost level
http://localhost:3000/start?standin=0          hide the stand-in
```

---

## What is deliberately absent

⚠ **RIM AND BEVEL STAY DIAGNOSTIC GREY.** Revision 1 proposed moving them to "the card's
blue-platinum family" — with no values, no source and no adjustability, beside four knobs for
the face. **That mixes two variables Carl could otherwise separate**, and contradicts chunk 1's
own argument that grey exists so a form defect cannot hide behind a plausible colour.

⚠ **`thickness` AND `ior` ARE NOT ON THE RIG.** Under an orthographic camera the whole-face
displacement is **0.801px at the steepest point and zero across the middle**. Exposing them
would move numbers and change nothing on screen.

⚠ **SO THE PREMISE IS RESTATED HONESTLY: what WebGL buys here is not visible refraction.** It is
that the blur responds to **real surface curvature and real lighting**, and that card and
backdrop sit in **one lit scene** rather than being a stack of hand-painted CSS layers. **That is
what Carl should judge** — looking for a distortion the geometry cannot produce would be looking
for the wrong thing.

**`frameloop="demand"` preserved** — the scene is static, so the extra transmission pass costs
one render on frames that already happen.

Also absent: the real logo backdrop and its colour movement (chunk 3), the filament (chunk 4),
rollout and the Next step button (chunk 5), text on the face (parked).

---

## Open for Carl's judgement

1. **Does it read as frosted glass?** Everything above is instrumentation; none of it says the
   material looks right.
2. **Where in 0–0.45 does the frost belong?** 0.28 ships because it is mid-band and legible, not
   because it was chosen.
3. **Is the near-white body colour right?** It is a correction for a measured defect, not a
   design decision — a faint blue cast is kept so the glass still belongs to the corridor.
4. ⚠ **The stand-in is throwaway and is not a design proposal.** It exists to make the frost
   measurable and is deleted in chunk 3.

---

*3 August 2026. The face is glass; the rim and bevel are still grey. Nothing approved was
edited, and the WebGL card is still built beside the live grid rather than on it.*
