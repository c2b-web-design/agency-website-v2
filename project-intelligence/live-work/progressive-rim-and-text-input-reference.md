# Progressive Gold Rim, and the Text-Input Layer Beneath It

**Captured:** 31 July 2026
**Status:** Working reference. **Not a plan and grants no implementation authority.**
**Purpose:** Carry Carl's design decisions for the progressive rim, and the requirements they
place on the text-input chunk that must exist first, so neither is re-derived or re-argued.

**Code state at capture:** commit `89d7ae8`, working tree clean. The four contact-field boxes
are Three.js geometry — **`aria-hidden`, non-interactive, no focus target, no form controls of
any kind.** Verified in `contact-field-canvas.tsx` at capture, not taken from the handoff.

⚠ **Nothing here is authorised. No code has been written.** The `satin-blue-field-windows`
chunk is still in flight (steps 3–4 outstanding).

---

## What Carl asked for

> *"The rim will only be on Box 1 when the boxes appear. Box 2 rim will be triggered by Box 1
> text input in its field. This process applies to all boxes."*

And the reason it appeals, which is the useful part:

> *"In the Q+A section, i like the gold rim making a circuit when a box is selected. The client
> info section is a variation of that idea. With each box signalling to the user a direction, a
> flow. I like that idea. There may be many ways to implement it."*

---

## ⚠ Why this is NOT the Q&A filament, despite looking like it

The D-029 filament border draws on **selection** — a response to something the user did *to
that element*, on the element acted upon. It confirms an act. It does not point anywhere.

**Here the rim on box 2 responds to something that happened in box 1.** It points away from
itself, at a box the user has not touched. ⚠ **A cue about *elsewhere* is read as direction,
and direction implies the direction is required.**

That distinction is what settled the open question the Day 6 handoff recorded as unsettled —
whether the lit rim means **progression** ("you have started, here is the next") or
**confirmation** ("this is right, now proceed").

---

## DECIDED — the rim is a wayfinder, never permission

**Carl's decisions, 31 July 2026:**

| | |
|---|---|
| **What the rim is** | Direction and flow. **Never permission.** |
| **Gating** | **None.** Nothing is blocked by an unlit rim. Every box is always focusable and typeable. **Send never consults rim state.** |
| **Typed trigger** | ⚠ **ONE character** in box N lights box N+1. The earliest honest signal |
| **Reversible** | ⚠ **Emptying box N fades box N+1's rim out.** Not a latch |
| **Autofill** | Rim and text **fade in together and cascade** 1 → 2 → 3 → 4 |
| **Timing** | Its own constants, tuned as one family — see the warning below |

⚠ **The governing intent, in Carl's words, above any mechanism below:** *"The most important
concept is the user gets a sense of being guided along. There is a direction here."*

⚠ **The no-gating rule is what makes the whole feature safe.** Under a confirmation reading, a
trigger that judges *content* silently strands anyone who does not fit its shape — a one-word
name, an unusual business name, a lowercase typist — with no error and no explanation. A
character **count** cannot fail that way, which is why it replaced the earlier
*"a capital and a couple of letters"* trigger shape.

⚠ **Reversibility does not reintroduce gating.** The rim fading out when a box is emptied is
the cue **tracking state**, exactly as the D-029 filament does on deselect. Nothing is blocked
by an unlit rim at any point — that rule is unchanged.

### RULED — the rim is reversible, and the count is not the only trigger

**Carl, 31 July 2026:** *"If the user presses backspace past 3 characters the next rim must
fade out. Same thing we did in the Q + A section if a user deselects an answer, the rim returns
to its deselected state."*

⚠ **This overturned the Builder's recommendation, and the reasoning is the point.** The Builder
argued the rim should LATCH — stay lit once earned, because un-lighting reads as punishment.
**Carl ruled against it on consistency with approved work:** the D-029 filament is
**reversible** and tracks current state. A rim that latches here behaves differently from the
same visual language two screens earlier, **and that inconsistency costs more than the
punishment the Builder was guarding against.**

**Consequence, and it simplifies the build:** the rim is a **function of current input**, not a
memory of what happened. No latch, no history to hold.

### ⚠ FINAL — ONE character, and the Builder's premise was wrong

**Carl, 31 July 2026:**

> *"Change to 1 letter. As soon as its entered, Box 2 rim appears. The whole idea while in Box
> 1 is to say, 'this is next'. Not to start inputting in Box 2 then it appears. Who's to say
> someone might go from 1 to 3. They will be guided."*

⚠ **The Builder had been reading the trigger as COMPLETION logic** — *box 1 is sufficiently
done, so box 2 is now available* — which is why it kept reaching for character counts and
leave-the-box fallbacks. **That is the wrong model.** The cue's job is to announce what is next
**while the user is still in box N**, so it must fire as early as it honestly can.

**One character dissolves the edge cases rather than moving them.** There is no threshold to
fall below, so no answer is ever too short — an initial, "Jo", a one-letter business name all
work identically. ⚠ **The leave-the-box fallback is therefore DROPPED as unnecessary.** One
character IS the trigger. Reversal is unchanged: empty the box, the next rim fades out.

⚠ **The 1 → 3 case is what makes this a wayfinder rather than a progress bar.** If a user skips
box 2, nothing is broken — the rim already showed where the path goes, and **nothing is gated,
so skipping is permitted.** The cue guides without constraining. That is the whole distinction
between **direction** and **instruction**.

---

## Autofill — Carl's correction, and it was the better answer

The Builder's first position was that on autofill *the chain has nothing to animate* and should
skip to all-four-lit. ⚠ **Carl rejected that, and the reasoning is worth keeping:**

> *"If autofil is used the gold rim should appear in boxes 2, 3 + 4 sequentially... That would
> signal that text input is complete and i think is a lot better than to have boxes 2, 3 + 4
> fade in simultaneously."*

**The chain still has something to SAY even when it has no sequence to follow.** Four rims
lighting in one frame is a state change with no reading time — the eye registers *something
happened* and cannot tell what. The same four in sequence is a statement the user can follow.

⚠ **Consequence for implementation: autofill is not a special case bolted on.** The chain
always runs and always travels in order. Only the *driver* of the timing changes — keystrokes
when typed, a self-running cascade when values arrive at once.

### ⚠ AND IT IS NOT THE DEGRADED PATH — it is the showcase

**This reframes the feature, and it is Carl's, 31 July 2026:**

> *"If autofil is used, the main purpose of getting client details has been achieved, we can
> still 'echo' the Q + A section by being visually creative. We are, of course, in the business
> of selling high end websites. Let us take every opportunity to showcase our abilities and not
> let an admin shortcut get in the way."*

⚠ **The Builder had been treating autofill as a problem to handle gracefully. It is the
opposite.** The admin job completes in a single frame, so the only thing left to do with that
moment is **show what the studio can do.**

**Why it is arguably the strongest moment on the page:** it is the one time all four boxes
animate as a **composed sequence** rather than at the user's typing pace. Nobody is waiting on
it and nothing is gated behind it. It is the closest this page has to a performance.

⚠ **Therefore the autofill cascade may be MORE expressive than the typed path, not merely
equivalent to it.** Same vocabulary — the circuit, the rim, the masked reveal — with permission
to be a fuller statement. **A design latitude, not a licence to gold-plate: Carl judges it.**

### The masked reveal — because autofill speed cannot be controlled

Carl: *"Nothing on my site happens fast, with a sudden motion. Is it possible once autofil is
used that you can control the speed the text is put in the box? If not, can the text be masked
and coincide with rims fading in?"*

**Direct speed control: NO.** The browser writes the value in one shot — Chrome sets
`input.value` and dispatches a single `input` event. There is no hook to intercept it mid-write.
Reading the value and re-typing it means clearing what the browser just wrote: it fights the
password manager, breaks the browser's own autofilled-highlight state, and risks a wrong value
if anything interrupts. ⚠ **Works in a demo, produces support tickets.**

**The mask: YES, and it is the better mechanism anyway.** The value lands instantly and
correctly — browser happy, password manager happy, field genuinely filled from the first frame.
Only *visibility* is animated. **Nothing is faked and no input state is manipulated.**

⚠ **This vocabulary already exists on the site** — it is the same idea as the opening's
clip-path mask sequence (D-015): the phrase exists, the mask governs when it is seen. That
matters more than the technique being clever.

**It composes with the rim by construction:** reveal and rim fade are two properties driven by
**one progress value per box**, so they cannot drift apart.

### DECIDED — left-to-right wipe, and the durations MATCH

**Carl, 31 July 2026:** *"Interesting idea on a Left to Right text reveal. That would echo the
start page and would work better if the fade in time and the reveal time were the same."*

⚠ **The matched duration is a constraint, not a preference.** Rim fade and text wipe over
*different* durations read as **two events that happen to overlap**. Matched, they read as
**one event with two expressions** — the same moment, stated twice. That is what makes it
composed rather than merely simultaneous.

**It is already structural rather than a thing to remember:** reveal and rim are driven by
**one progress value per box** (above), so there is only one clock. Making them differ would
take extra work.

⚠ **But do NOT simply copy the opening's duration.** D-015's mask reveals a phrase that is
*arriving* — text never seen before, across a long line. Here the text is revealed as its box
is being pointed at: **shorter distance, smaller element.** The *gesture* matches; the speed
that reads as right may not. **Judge side by side against the opening — same family, not
necessarily the same number.**

### DECIDED — on autofill the text reveals cascade too, and the speed is a TENSION

**Carl, 31 July 2026:**

> *"If autofil is used they should cascade, not so fast that the human eye cannot discern it,
> but not so slow as to interfere with the point most people use autofil (including me) its
> fast and convenient."*

⚠ **Held as two limits, not one target.** Too fast and the sequence is not readable — the very
defect that made simultaneous rims wrong. Too slow and it obstructs the user who deliberately
chose the fast path.

**The limits sit far apart, which is why this is tunable rather than fraught.** The eye
resolves a sequence at roughly **80–150ms per step**; autofill users do not feel obstructed
until the whole run approaches **~1s**. Four boxes at **~120ms** apart is under half a second
total — readable as a sequence, gone before it registers as waiting.

⚠ **A STARTING POINT FOR CARL'S EYE, NOT A SETTLED NUMBER.** Deliberately much faster than the
box entrance's 500ms spacing: the entrance is a first impression with nobody waiting; **this is
happening to someone who chose the fast path.**

⚠ **Stagger and duration are two different numbers.** The matched-duration rule ties **rim and
text WITHIN a box**. The **stagger BETWEEN boxes** is independent — a fast stagger with a
slower individual reveal still reads as a cascade, and likely reads better than making
everything uniformly quick.

---

## ⚠ Timing — do NOT inherit the entrance constants

Carl suggested matching rim timings to the box entrance timings, then relaxed it himself:
*"It is just a suggestion to match rim timings with box timings. Its not set in stone."*

⚠ **Inheriting them would couple this feature to timings Carl has already reserved judgement
on.** The entrance is 3600/4100/4600/5100 with 3000ms fades, recorded as **CURRENT AND
BEST-JUDGED, NOT APPROVED** — his standing reservation is that the overlap is less discernible
than he wants and the boxes do not read like the other elements' fades. **Tuning a second
feature to a rejected value propagates the defect.**

**Therefore: its own constants, tuned as one family.** Because the mask governs the reveal,
matching the entrance is no longer load-bearing for the effect to work.

⚠ **And a 3000ms fade may be wrong here regardless.** It is right for a box *materialising from
nothing*; a rim lighting on an **already-visible** box may want the same rhythm and spacing but
a shorter individual fade. **A by-eye call, unresolved.**

---

## Labels above each box — the room is ALREADY RESERVED

**Carl, 31 July 2026:** *"above the boxes on the top left should be the title of what the box
is. Name, Company etc"*

⚠ **This is not new content, and it does not move anything.** Two facts, both verified in code
at capture rather than assumed:

**1. The labels already exist as data.** `FIELD_SLOTS`
(`contact-field-geometry.ts:105-110`) already carries all four, defined and never rendered:

| id | label |
|---|---|
| `name` | Name |
| `business` | Business name |
| `website` | Website URL |
| `email` | Email |

⚠ **RULED, 31 July 2026: "Business name"** — lowercase n. Carl first said *"Name, Company
etc"*, then *"Business Name"*, then corrected to lowercase *"name"*.

**This matches the existing `FIELD_SLOTS` data exactly, so no data change is needed.** It is
also consistent with the other two multi-word labels already there — *"Website URL"* aside
(URL being an initialism), the set uses sentence case throughout.

**2. The vertical room is already in the placement maths.** The comment at
`contact-field-geometry.ts:33-35` records the CSS layout the geometry was ported from:

> *each grid cell is **label(16) + mb-1(4) + input(38)** = 58px*

`ROW_PITCH_PX = 58` and `FIELD_OFFSET_TOP_PX = 50` were **both computed including a 16px label
and a 4px gap above every box.** There is a **20px slot above each box sitting empty right
now** — the geometry came from a real HTML form that had labels; only the labels did not come
across.

⚠ **Consequence: adding them shifts NO boxes, changes NO spacing, and leaves the field chunk's
shared-gradient mapping untouched.** It fills a reserved gap rather than making room.

### The one real decision: DOM or in-scene

**DOM text over the canvas is the Builder's recommendation.** Selectable, accessible, properly
typeset with the site's approved type — **and they become the `<label>` elements the inputs
will need anyway**, which is why they belong with the text-input chunk rather than apart from it.

⚠ **The trade-off to state plainly:** the four boxes stop being a self-contained WebGL object
and become a **composed layer** — DOM and canvas in one region. That is a change in how this
area is built, and it is the same move the text inputs themselves will require. **Carl's call.**

---

## ⚠ The hard prerequisite: there is no text input, and it is bigger than it looks

**The four boxes are Three.js geometry.** `contact-field-canvas.tsx` describes the mount as
*"Decorative geometry proof: `aria-hidden`, non-interactive, no focus target"*, and sets
`aria-hidden="true"`. **There are no inputs, no form, no labels.** Verified at capture.

**The progressive rim cannot begin until that layer exists** — real DOM inputs over or into the
WebGL boxes, with focus handling and accessibility.

### ⚠ Requirements this conversation placed on that chunk

Three landed in one conversation, which is itself the signal that it is **correctly sized as
its own chunk, not a preamble to the rim**:

1. **It must expose HOW values arrived** — typed vs autofilled, and whether together. The rim
   cascade above it cannot choose its driver otherwise.
2. **Autofill detection is genuinely fiddly.** There is no clean event. The usual signal is the
   `:autofill` CSS pseudo-class plus an `input` event with no preceding keystroke, and
   **browser behaviour differs.** Doable, but real work.
3. **The masked reveal lives here**, not in the rim layer — it governs input text visibility.

⚠ **Any implementation built purely as "box N lights box N+1" gets these wrong:** autofill,
paste, a returning visitor with restored values, and tabbing backwards to correct box 2 after
filling box 4.

---

## Running order — the Builder's recommendation, for Carl to rule on

1. **Finish `satin-blue-field-windows` steps 3–4.** It is in flight, one step from the satin
   being real, and the scope guard is already tuned to it. ⚠ **Leaving a chunk half-built to
   start a bigger one is how `app/globals.css` reached 2,012 lines of entangled concerns.**
2. **The text-input layer, as its own chunk with its own brief.**
3. **The progressive rim, on top of it.**

⚠ **Designing the rim against a form whose real behaviour is not yet known** means tuning the
cue against assumptions about autofill, focus and paste rather than against the thing itself.

---

## Related records

- `live-work/contact-field-gold-and-light-reference.md` — the orbiting light. ⚠ Carl has said
  that chunk **goes through the PM/A**, not direct.
- `decisions.md` D-029 — the Q&A filament border this is a *variation on*, not a copy of.
- `decisions.md` D-015 — the opening's clip-path mask, the precedent for the masked reveal.
- `active-sprints/current-sprint.md` — the entrance timings and their standing reservation.

---

*⚠ Every value and mechanism here is provisional. Carl's standing method applies — "get the
basics down, like a rough mix... There is a relationship between everything." Nothing above is
settled because it was written down.*
