# §5a/5b STRUCTURAL NOTE — the image scroll (D-092 as developed, 27 September)

**Written 30 September 2026 by the Builder, BEFORE any code is written.**
⛔ **Nothing in this note is built. It is for Carl, who routes it to the Architect.**
⚠ **Nothing in it is measured either.** Every claim about the code was read from the files on
30 September; every claim about how the proposal would behave is reasoning, marked as such.

---

## ⛔ CARL'S MODEL, IN HIS WORDS (D-092, 27 September)

- *"the image is faded in Sect 1, its opaque in Sect 2 and cards come into view as the wipe happens.
  When the wipe clears the bottom of CA, the rim is activated."*
- *"If a user presses Roles it will appear there. But if a user scrolls it would reach a certain point
  and become opaque, So the image travels with the user."*
- *"Where the border is between translucent and opaque the change shouldn't be sudden. A gradual
  gradient should be used."*
- Rejected readings (the Builder's): a border sweeping down the room with the room opaque above it;
  each card wiping on its own.

⚠⚠ **ONE THING THE RECORD DOES NOT SETTLE, AND IT IS ASKED BELOW RATHER THAN READ INTO: which way the
wipe's edge travels across the room.** The structure proposed here does not depend on the answer.

---

## ⛔ WHAT EXISTS TODAY (read 30 September)

- `app/about/page.tsx`: §1 is a plain `<section>`; §2 (`#roles`) is `relative min-h-screen` and holds,
  in paint order, `RoomPlate` (the DOM photograph), a `bg-neutral-950/25` layer, and
  `AboutCardCanvas` (the WebGL canvas, `absolute inset-0`, which draws the SAME photograph as
  geometry and the four cards). ⚠ What is seen in §2 is the canvas; the DOM plate is the fallback
  underneath, in the same centred box (`ROOM_PLATE_ASPECT`).
- The canvas mounts at page load, once, and is never remounted. `frameloop="demand"`.
- **Three things read "is the canvas in the window" and each means "the reader has reached §2":**
  1. `wallCardsInView` (`about-neon.ts`), the once-per-visit trigger in `neon-bloom.tsx` that starts
     the §2 sequence.
  2. The moving light's `IntersectionObserver` (`about-moving-light.tsx`), which stops its loop
     when the canvas is off screen.
  3. `canvasOnScreen` (`card-extrude.tsx`), the text's own start when the neon is off.
- No scroll-linked mechanism exists. The trigger listens to scroll but only to fire once.

---

## ⛔⛔ THE PROPOSAL — FOUR PARTS

### 1. ONE STAGE, PINNED BY CSS, SPANNING §1 AND §2

A wrapper around §1 and §2. Inside it, first, a **stage**: `position: sticky; top: 0`, one window
tall, holding what §2 holds today — `RoomPlate`, the dark layer, `AboutCardCanvas` — and nothing
else. §1's text and §2's (empty) block scroll over it.

- **The room stays put while §1's text scrolls away**: *"the image travels with the user."*
- **When §2 has fully arrived the stage is exactly where §2's room is today**, and from there it
  scrolls away with §2 into §3. It stops at the 2/3 divider (Carl's ruling in
  `about-section-thinking.md`, sprint row of 1 September).
- **`#roles` stays on §2.** The anchor jump lands with the stage aligned, as now.

### 2. THE FADED ROOM AND THE OPAQUE ROOM ARE TWO LAYERS THAT ALREADY EXIST

- **Faded** = the DOM plate (`RoomPlate`) at low opacity. This is exactly the static look Carl saw on
  27 September at 0.2 (*"That looks good"*), and it carries no cards.
- **Opaque** = the WebGL canvas (room + cards), shown through a **CSS mask with a gradient edge**.
  Where the mask is open the canvas covers the faded plate; where it is closed the faded plate shows.
- **So the cards "come into view as the wipe happens" with nothing extra built**: they exist only in
  the layer the wipe uncovers.

⚠ **STATED PLAINLY: this is one photograph in two registered layers, not one node.** They share one
box and one constant, but **that they coincide pixel for pixel in the NEW room is UNASSERTED** (D-084's
comparison was the old room and was withdrawn as evidence by D-085). A seam at the wipe's edge would
be the symptom. It must be measured before anything is judged.

### 3. ONE NUMBER FOR THE WIPE, READ BY EVERYTHING

One small client module reads the scroll (rAF-coalesced, the pattern `neon-bloom.tsx` already uses)
and produces **one value: how far the wipe has travelled, 0 to 1**, defined from §2's position in the
window (not from `scrollY`, because §1 is taller than the window on a phone).

- The stage draws the mask from it (a CSS custom property).
- The trigger reads the SAME value. ⛔ **The mask and the trigger must not each compute "where the
  wipe is"** (§5a: a second source of truth for a measurement).
- D-088's falling mark, if it is built, reads the same module (D-088: *"Design it WITH D-092's
  activation trigger, not separately"*).

### 4. THE TRIGGER'S CONDITION CHANGES

From *"CA and CB inside the window"* to **"the wipe has cleared CA's bottom edge"** (CA's lowest
corner is at 0.5594 of the plate's height, `ROOM_CARD_GUIDES`). Still once per visit. `ignite()`
stays the one door a track starts through.

---

## ⛔ WHY IT IS STRUCTURAL (§5a's own list)

| §5a | Here |
|---|---|
| Moving a node between parents | `RoomPlate`, the dark layer and `AboutCardCanvas` leave §2 for a stage above both sections |
| State surviving a boundary it died at | The canvas is in the window from first paint; "on screen" stops meaning "in §2" |
| A new mechanism | The first scroll-LINKED value on the site (the existing trigger only fires once) |
| A second source of truth | Avoided only if part 3 is followed |

⚠ **NOT added:** no second canvas, context, renderer or observer. The canvas's mount lifetime is
unchanged (it already mounts at load).

---

## ⛔⛔ §5b — WHAT THE CURRENT STRUCTURE PROVIDES, AND WHAT HAPPENS TO EACH

| # | Provided today | By | Under the proposal |
|---|---|---|---|
| 1 | The sequence waits until the reader reaches §2 | `wallCardsInView` being false in §1 | ⛔ **BREAKS if left alone**: the pinned canvas is in the window at landing, so the ignition would strike under §1 (the wasted flicker Carl ruled out on 23 September). Replaced by part 4 |
| 2 | The moving light rests while §2 is off screen | its `IntersectionObserver` | ⛔ **BREAKS**: always intersecting during §1. Gate it on the wipe value instead (nothing of the canvas showing = no frames) |
| 3 | Text start with the neon off (`?neon=none`) | `canvasOnScreen` | Same fault, same fix; a diagnostic path only |
| 4 | Nothing renders the glass scene under §1 | the canvas being a screen away | Must be made explicit: **no frames asked for while the mask is fully closed.** ⚠ This also answers the open item *"continuous rendering, off screen too"* for the looping text and neon, which Carl has heard and not ruled on. The clocks run on wall time, so a loop resumes in phase |
| 5 | The plate image loads lazily | it is below the fold | **Inverts**, as the comment in `page.tsx` already predicts: the plate is on screen at first paint, becomes the likely LCP element, and wants `priority` |
| 6 | `Roles` lands on a finished room | plain anchor + trigger | Preserved: the wipe value is derived from position, so a jump or a deep link to `#roles` lands on it complete and the trigger fires on arrival |
| 7 | §1's text is selectable; the nav is clickable | nothing overlaps them | The stage sits BEHIND §1's content and the host is already `pointer-events-none`. ⚠ The 14 August case (cards unclickable after a paint-order move) is this shape: **to be checked by clicking and selecting, not by reasoning** |
| 8 | The mark on the nail | no ancestor with transform/filter/contain | The wrapper and stage must carry none of them. `sticky` and `mask` on the stage do not affect the mark (it is outside the wrapper) |
| 9 | The canvas's box tracks the plate's | both centred in one full-window box | Unchanged: the stage is one window tall, as §2 is |
| 10 | The rule between §1 and §2 (`border-t`) | §2's class | ⚠ **It would cut across the travelling room.** Carl's call; it is visible |
| 11 | The page is a static prerendered server component | client code kept in its own files | Preserved: the wrapper and stage are plain markup; the scroll reader is a client module |
| 12 | `sticky` working at all | no ancestor with `overflow` hidden/auto | True today (`globals.css` sets only `scrollbar-gutter` at page level). **Unasserted from then on** |
| 13 | Reduced motion: the moving light and the sequence each have a reduced path | their own checks | Untouched; the WIPE needs its own answer (below) |
| 14 | Once per visit | a flag in `NeonBloom` | Unchanged |

⚠ **What I cannot enumerate:** how the 25% dark layer and the faded plate's opacity combine (the
27 September static take was judged with whatever stack it had; I have not reconstructed it), and
whether a CSS mask over a live WebGL canvas costs anything on Carl's machine while scrolling.
Both are measurements, owed before a verdict.

---

## ⚠ ALTERNATIVES REJECTED

- **`position: fixed` stage, switched by script at the 2/3 divider.** Needs script for position, and
  `fixed` is captured by any ancestor with a transform (the 18 August fault, painted 425 px off).
  `sticky` does the same job in CSS.
- **Two rooms: a faded image in §1, today's room in §2.** No node moves, and it is the cheapest. But
  the image does not travel; it scrolls, and there is no wipe to clear CA. Not Carl's model.
- **The fade done inside WebGL** (the backplate and cards dimmed by a uniform). One layer, truly one
  image. But the canvas must then render on every scroll frame through all of §1, the glass would
  refract a dimmed room, and every material becomes part of the wipe. ⚠ Worth naming because it is
  the version where the change is *in* the world rather than over it (§14a); rejected on cost and
  because Carl's model is a wipe across an image.
- **CSS scroll-driven animation (`animation-timeline`) with no script.** Not in every browser, and
  the trigger needs the number in script anyway, which would make two sources of truth.

---

## ⛔ OPEN — CARL'S

1. **Which way does the wipe's edge travel across the room?** (Asked in chat, 30 September.)
2. **Where the wipe starts and ends on the scroll.**
3. **The gradient's width.**
4. **The faded level** (0.2 is the only one seen).
5. **Scrolling back up into §1 after the sequence has started**: does the room fade again (the wipe
   reverses with the scroll), and the sequence carry on unseen?
6. **Reduced motion** for the wipe.
7. **The rule between §1 and §2.**
8. **The side bands** (*"a design choice then"*, not ruled): the pinned room shows them behind §1 too.
9. **Phones**: §1 is much taller than the window there, so the room would sit faded behind a long
   read. No mobile layout for §2 exists yet.

## ⛔ FILES IT WOULD TOUCH (none touched)

`app/about/page.tsx` (in scope since 27 September, for a different purpose), `room-plate.tsx`
(⚠ not in `chunk-scope.json`), `about-card-canvas.tsx`, `neon-bloom.tsx`, `about-neon.ts`,
`about-moving-light.tsx`, `card-extrude.tsx`, one new client module. ⚠ `chunk-scope.json` is still
labelled `about-moving-light`; this is a new chunk and the scope is Carl's to set.
