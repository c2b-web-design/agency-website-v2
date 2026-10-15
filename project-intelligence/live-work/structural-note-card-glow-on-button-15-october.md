# Structural note — the selected cards' glow on `Next step` (15 October 2026, session 3)

**For:** Carl (route to the Architect if he chooses). **Status:** PROPOSED — nothing built.
**CLAUDE.md §5a trigger:** state crossing between two canvases that share nothing today (a new channel), and lights added to a
shared scene component.

## What Carl asked for

- *"Does the bottom cards rim have no effect on the button? … there might be some secondary effects. Adds to the realism."*
- *"We tried to achieve it in CSS but it wasnt real or realistic. More like a slight of hand. It depends in our scene where we
  imagine the button to be. The text goes backwards. The cards are in the middle ground. If the button was in the foreground
  all 5 cards rim might have an effect."*
- *"The effect must be subtle. If all 5 cards are pressed we dont want it to radically alter the blue colour, just enough to say
  'same world'. As for distance, enough for one card to have influence."*

**History:** the CSS reflection (D-031/D-032, June) was removed on 10 August. August's mesh button had `AmberSource`, a placed
light that Carl authorised in advance (*"Belonging in the same world is what counts"*), left off pending a measurement. It went
when the button was redone (R-056). Today the two canvases are fully separate and neither lights the other.

## The proposal

1. **The world:** the button is in the FOREGROUND, a depth `D` (layout px) in front of the cards' plane. Each card is a warm
   source at its REAL position relative to the button (measured from the page, not typed), `D` behind it. **`D` is a tuning
   value:** large enough that the five contribute fairly evenly, small enough that ONE lit card is visibly there.
2. **The light:** five point lights in the button's scene, one per card slot, colour from the filament's own black-body ramp
   (`HEAT_RED → HEAT_ORANGE → HEAT_WHITE` at the card's temperature — the ramp the tube's bloom already uses), strength ×
   the card's filament intensity × one gain. Coming from behind, they land on the pill's top and back edges; the roll carries
   that edge over the face and away. On glossy metal (roughness 0.4) a point source reads as a soft highlight, so the light and
   its **reflection** are the same thing — no change to the HDRI studio.
3. **The data — a small module-level store:** `cardGlow` — five `{ intensity, temperature }` and five card centres. The cards'
   canvas WRITES it each frame from each card's own `useFilament` refs (the one source of the filament's timing). The button's
   scene READS it in its frame loop. No React state per frame. Precedent: `nextFocused` / `subscribeNextFocus`
   (`nextstep-canvas.tsx`), the button's focus already crossing components this way.
4. **Scope:** `/start` only. `WhoWeAreScene` gains an optional `warm` input that only `FamilyNextStep` passes; the teal and the
   gold never mount the lights.

## Rejected

- **Copying the filament's timing into the button** (cheaper): a second copy of a curve that already exists, which has drifted
  on this project before (`restTravelPoint`'s note: seven harness faults from second copies). Rejected.
- **Re-baking the HDRI studio with amber shapes per frame:** a PMREM bake per frame. Rejected for cost; the point lights'
  highlights give the reflection.
- **One combined light at the grid's centroid:** loses "one card has influence" — every selection would look alike.
- **Lights mounted only when a card is lit:** changes the scene's light count → every material recompiles mid-Q&A (the stall
  family: the opening and Q5 freezes). **The five are mounted from the start at 0.**

## What it couples to — §5b, what the current structure provides and how each is kept

| Provided today | Kept by |
|---|---|
| The teal (home) and gold (`/about`) scenes unchanged | `warm` absent → no lights mounted; their stills re-rendered and compared BYTE-IDENTICAL |
| Next step's programs compiled during the OPENING, not in Q5's reveal | the five lights present from mount, so the program compiled in the opening already includes them; the Q5 reveal's longest frame re-measured (today 17 ms) |
| No frames while the button is hidden | the button's ticker is unchanged; the store is read only when it draws |
| The cards' frames | one write of ten numbers per frame — no new render, no new state |
| The filament clearing at a question boundary | the store follows the filament refs, so the button cools exactly as the cards do |
| One WebGL context per canvas, none created on the walk | no new canvas; `nextstep-rollout-verify.mjs` re-run (11 checks) |
| The words' contrast (ice blue, worst 5.34:1 with the studio) | measured with all five lit at the flare; target: stays above 4.5:1 |

## Measures, both ends of Carl's band

- **One card lit:** the pill body's colour shift is VISIBLE (frames at the bench scale; the change in the pill's mean colour,
  reported).
- **All five lit:** the blue stays blue — the body's hue is still blue, the shift small (reported as a colour difference against
  unlit), words above 4.5:1.
- **Rolling:** frames through one turn, so the warm edge is seen moving.
- ⚠ Judged by Carl's eye; the numbers say what changed, not whether it is right.

## Not in scope

The reverse — the button's lamp on the cards (the other half of the deferred item).
