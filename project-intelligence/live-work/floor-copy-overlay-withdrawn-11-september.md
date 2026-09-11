# WITHDRAWN 11 September 2026 — the /about §2 floor-copy overlay

Carl: *"the text, not needed at the moment. We have our guides, lets build."*

⛔ **WITHDRAWN, NOT ABANDONED.** This block was the only place in code where the
10 September landscape work survived: the two rectangles at their approved
**2.026:1** match, the copy fitted to them, and the type size reset for Geist.

⚠ **D-077's question is still OPEN** — does the copy fit its rectangle? Neither
aspect is approved. The block is preserved here so the answer is not lost.

⛔ **It served its purpose and that is why it went.** It existed to judge copy fit
FACE-ON. The cards are now built in Three.js and placed in the room, where a real
card supersedes a flat text box.

**The numbers, so they survive even if this file is not read in full:**

    CD   x 0.0321 -> 0.4002    y 0.6019 -> 0.8744    2.026:1
    CS   x 0.5764 -> 0.9427    y 0.6748 -> 0.9460    2.026:1
    type clamp(9px, 1.15vw, 21px)  line-height 1.4
    padding  pt 0.4%  pr 1.2%  pb 1.2%  pl 1.2%

⚠ Fractions are of the **PLATE**, not the stage.

**To restore:** paste the JSX below back into `app/about/page.tsx` §2, immediately
after `<WallCardText />`. It needs the aspect-locked wrapper it carries — see the
comment in the file about `object-contain`.

---

```tsx
            fitted to them, and the type size reset for Geist. ⛔ D-077's question
            — does the copy FIT its rectangle — is still OPEN and neither aspect
            is approved. Deleting it would discard the answer to a live question.

            ⛔ IT SERVED ITS PURPOSE AND THAT IS WHY IT GOES. It existed to judge
            copy fit face-on. The cards are now to be BUILT in Three.js and placed
            in the room, where the real card supersedes a flat text box.

            ⚠ TO RESTORE: uncomment the block below. Nothing else was changed —
            the fractions, the copy and the padding are exactly as Carl left them
            on 10 September. */}
        {/*
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="relative h-full max-h-full w-auto max-w-full aspect-[3/2]">
            {[
              /* ⛔ THE WALL PAIR IS NOT IN THIS ARRAY. CA and CB are rendered by
                 `components/about/wall-card-text.tsx`, a client component, because
                 projecting their copy onto the wall needs a homography, which needs
                 the box's pixel size, which needs hooks — and THIS PAGE IS A STATIC
                 PRERENDERED SERVER COMPONENT and is kept that way on purpose (see
                 the AboutNav note above; same pattern, same reason).
                 ⚠ Only the FLOOR pair is below: face-on, per Carl's sequence. */
              /* ⛔⛔ LANDSCAPE, 10 September 2026 — Carl's sketch, measured off it
                 rather than eyeballed. THIS REVERSES THE 4 SEPTEMBER PORTRAIT
                 RULING ("their shorter sides will be on the top edge"), and the
                 reversal is his: the portrait shape was set BEFORE the copy had
                 met its container, and 49/55 words in a narrow column could not be
                 made to fit without breaking type size, the 2+2 composition, or the
                 copy itself. ⚠ Landscape is why the WALL pair works — prose sets in
                 few long lines, not many short ones.
                 ⛔ Superseded, not contradicted: record what moved. */
              {
                id: "CD",
                x: 0.0321, y: 0.6019, w: 0.4002 - 0.0321, h: 0.8744 - 0.6019,
                text:
                  "Your brand is the material. Typography, colour, assets and tone are taken from what you already have and treated as the baseline — not a blank page, and not a template. From there the design is elevated into a bespoke prototype that sets the visual direction before any coding begins.",
              },
              {
                id: "CS",
                /* ⚠ BOTTOM EDGES SET TO CLEAR THE LAST LINE — Carl, 10 September.
                   The first raise to 0.9280 went too far and cut CS's closing
                   "the site itself." below the edge; this drops back ~1.2 lines.
                   ⛔ MATCHED BY ASPECT (2.026:1), NOT BY HEIGHT. CD sits further
                   back, so equal on-screen height would be a DIFFERENT real size
                   in the room. Widths and tops untouched; only the bottoms moved.
                   ⚠ CD KEEPS DEAD SPACE AT ITS BOTTOM AND THAT IS ACCEPTED —
                   Carl: "the green card will still have some dead space at the
                   bottom, thats ok." Matching the pair beats filling one box. */
                x: 0.5764, y: 0.6748, w: 0.9427 - 0.5764, h: 0.946 - 0.6748,
                text:
                  "Every other seat is pointed at the website. This one is pointed at the business it exists to serve — connected to the things the business actually runs on, and answering from those rather than from general knowledge. It advises only. Nothing it recommends becomes work without a decision, and nothing it touches is the site itself.",
              },
            ].map((c) => (
              <div
                key={c.id}
                /* ⚠ NOT `overflow-hidden`: Carl, 10 September — "if it goes
                   outside the bottom of the card, thats ok, we will decide how
                   to enlarge the card." Clipping would HIDE the overflow that
                   is the whole signal being judged. */
                /* ⚠ TOP PADDING REDUCED 1.2% -> 0.4% — Carl, 10 September: the
                   bottom edge was running THROUGH "the site itself." on CS. He
                   offered two routes ("below the 3 words, or raise both texts up
                   slightly"); raising the copy is the one that does NOT disturb
                   the box dimensions he has just approved. Sides and bottom
                   unchanged, so both boxes keep their 2.026:1 match. */
                className="absolute pt-[0.4%] pr-[1.2%] pb-[1.2%] pl-[1.2%] text-white"
                style={{
                  left: `${c.x * 100}%`,
                  top: `${c.y * 100}%`,
                  width: `${c.w * 100}%`,
                  height: `${c.h * 100}%`,
                  /* ⚠ WAS `clamp(8px, 1.05vw, 19px)` — a CAVEAT-era number. Geist
                     has a much higher x-height and rendered far larger at the same
                     value, which is what made the floor copy overflow worse after
                     the font switch. Reset for Geist in a LANDSCAPE box. */
                  fontSize: "clamp(9px, 1.15vw, 21px)",
                  lineHeight: 1.4,
                }}
              >
                {c.text}
              </div>
            ))}
          </div>
        </div>
```
